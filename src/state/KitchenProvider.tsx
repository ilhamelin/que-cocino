import { AppText as Text } from '../ui/AppText';
import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { KitchenUndo } from '../domain/undo';
import { kitchenReducer, type KitchenAction, type KitchenState } from '../domain/kitchen';
import { decideSync, hasKitchenData, importKitchen, newWorkspace, sameKitchen, type CloudSnapshot, type Workspace } from '../domain/workspace';
import { workspaces } from '../storage/workspaces';
import { cloud, cloudErrorMessage } from '../services/cloud';
import { firestoreReady } from '../config/firebase';
import { useAuth } from './AuthProvider';
import { Action, usePalette } from '../ui/common';
type KitchenContextValue = {
  canUndo: boolean; undo: () => void;
  chatDraft: string; setChatDraft: (value: string) => void;
  state: KitchenState; dispatch: Dispatch<KitchenAction>; saveError: boolean; retrySave: () => void;
  guestAvailable: boolean; importDecision: Workspace['importDecision']; importGuest: () => void; skipImport: () => void;
  syncEnabled: boolean; syncing: boolean; syncError: string | null; lastSyncedAt: string | null; pendingSync: boolean;
  conflict: { remote: CloudSnapshot } | null; synchronize: () => void; enableSync: () => void; disableSync: () => void;
  resolveConflict: (choice: 'local' | 'remote') => void;
};
const KitchenContext = createContext<KitchenContextValue | null>(null);
export function KitchenProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const colors = usePalette();
  if (auth.loading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.green} accessibilityLabel="Comprobando sesión" /></View>;
  return <KitchenSession key={auth.account?.uid ?? 'guest'} uid={auth.account?.uid ?? null}>{children}</KitchenSession>;
}
function KitchenSession({ uid, children }: { uid: string | null; children: ReactNode }) {
  const auth = useAuth();
  const [chatDraft, setChatDraft] = useState('');
  const [undoHistory] = useState(() => new KitchenUndo());
  const [undoCount, setUndoCount] = useState(0);
  const [workspace, setWorkspace] = useState<Workspace>(newWorkspace);
  const current = useRef(workspace);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [guestAvailable, setGuestAvailable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ remote: CloudSnapshot } | null>(null);
  const saves = useRef<Promise<void>>(Promise.resolve());
  const syncTask = useRef<Promise<void> | null>(null);
  const initialSyncDone = useRef(false);
  const alive = useRef(true);
  const busy = useRef(auth.busy);
  busy.current = auth.busy;
  const colors = usePalette();
  function persist(value: Workspace): Promise<void> {
    current.current = value;
    setWorkspace(value);
    const save = workspaces.save(uid, value);
    saves.current = save;
    void save.then(() => { if (alive.current && saves.current === save) setSaveError(false); }, () => {
      if (alive.current && saves.current === save) setSaveError(true);
    });
    return save;
  }
  function changeKitchen(state: KitchenState) {
    if (sameKitchen(state, current.current.kitchen)) return;
    void persist({ ...current.current, kitchen: state, sync: { ...current.current.sync, dirty: uid !== null } }).catch(() => {});
  }
  useEffect(() => {
    alive.current = true;
    let active = true;
    setLoadError(false);
    void (async () => {
      const guest = await workspaces.load(null);
      const stored = uid ? await workspaces.load(uid) : guest;
      if (active) {
        current.current = stored; setWorkspace(stored); setGuestAvailable(uid !== null && hasKitchenData(guest.kitchen)); setReady(true);
      }
    })().catch(() => { if (active) setLoadError(true); });
    return () => { active = false; alive.current = false; };
  }, [uid, attempt]);
  useEffect(() => auth.registerBeforeChange(async () => {
    await syncTask.current;
    await saves.current;
  }), [auth.registerBeforeChange]);
  async function performSync(choice?: 'local' | 'remote') {
    if (!uid || !firestoreReady || !ready || busy.current || !current.current.sync.enabled) return;
    initialSyncDone.current = true;
    setSyncing(true); setSyncError(null);
    try {
      await saves.current;
      const local = current.current;
      const remote = await cloud.get(uid);
      if (!alive.current || busy.current || current.current !== local) return;
      const decision = decideSync(local, remote);
      if (choice && conflict && (conflict.remote?.updateTime ?? null) !== (remote?.updateTime ?? null)) {
        setConflict({ remote }); setSyncError('La copia en la nube volvió a cambiar. Revisa las versiones y elige nuevamente.'); return;
      }
      if (decision === 'conflict' && !choice) { setConflict({ remote }); return; }
      let acknowledged: CloudSnapshot = remote;
      if (decision === 'upload' || (decision === 'conflict' && choice === 'local')) {
        acknowledged = await cloud.put(uid, local.kitchen, remote?.updateTime ?? null);
      }
      if (!alive.current || busy.current) return;
      const latest = current.current;
      const unchanged = latest === local;
      const useRemote = unchanged && (decision === 'download' || (decision === 'conflict' && choice === 'remote'));
      if (useRemote) { undoHistory.clear(); setUndoCount(0); }
      if (acknowledged !== null || decision === 'none' || choice === 'remote') {
        await persist({ ...latest,
          kitchen: useRemote ? (acknowledged?.kitchen ?? newWorkspace().kitchen) : latest.kitchen,
          sync: { ...latest.sync, dirty: !unchanged, remoteUpdateTime: acknowledged?.updateTime ?? null, lastSyncedAt: new Date().toISOString() },
        });
        if (alive.current) setConflict(null);
      }
    } catch (error) { if (alive.current) setSyncError(cloudErrorMessage(error)); }
    finally { if (alive.current) setSyncing(false); }
  }
  function startSync(choice?: 'local' | 'remote') {
    if (syncTask.current || busy.current) return;
    const task = performSync(choice);
    syncTask.current = task;
    void task.finally(() => { if (syncTask.current === task) syncTask.current = null; });
  }
  useEffect(() => {
    if (!ready || !uid || !workspace.sync.enabled || !firestoreReady || auth.busy || syncing || syncError || conflict ||
        AppState.currentState !== 'active' || (!workspace.sync.dirty && initialSyncDone.current)) return;
    const timer = setTimeout(() => startSync(), 1500);
    return () => clearTimeout(timer);
  }, [ready, uid, workspace.kitchen, workspace.sync.enabled, workspace.sync.dirty, auth.busy, syncing, syncError, conflict]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', value => { if (value === 'active') startSync(); });
    return () => subscription.remove();
  }, [ready, uid]);
  async function copyGuest() {
    if (!uid || !ready || auth.busy || syncing) return;
    try {
      const guest = await workspaces.load(null);
      if (!alive.current) return;
      undoHistory.clear(); setUndoCount(0);
      await persist({ ...current.current, kitchen: importKitchen(current.current.kitchen, guest.kitchen), importDecision: 'copied',
        sync: { ...current.current.sync, dirty: true } });
    } catch { if (alive.current) setSaveError(true); }
  }
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 28, gap: 18 }}>
    {loadError ? <><Text style={{ color: colors.text, fontSize: 18 }}>No pudimos abrir esta cocina. Tus datos no se han reemplazado.</Text><Action label="Reintentar" onPress={() => setAttempt(value => value + 1)} />{uid ? <Action label="Volver al modo invitado" onPress={auth.signOut} disabled={auth.busy} secondary /> : null}</> : <ActivityIndicator color={colors.green} accessibilityLabel="Cargando tu cocina" />}
  </View>;
  return <KitchenContext.Provider value={{ state: workspace.kitchen, chatDraft, setChatDraft,
    dispatch: action => {
      if (busy.current) return;
      const next = kitchenReducer(current.current.kitchen, action);
      if (sameKitchen(next, current.current.kitchen)) return;
      undoHistory.capture(current.current.kitchen); setUndoCount(undoHistory.size);
      changeKitchen(next);
    },
    canUndo: undoCount > 0 && !auth.busy && !syncing && !conflict,
    undo: () => {
      if (busy.current || syncTask.current || conflict) return;
      const previous = undoHistory.take(); setUndoCount(undoHistory.size);
      if (previous) changeKitchen(previous);
    },
    saveError, retrySave: () => { void persist(current.current).catch(() => {}); },
    guestAvailable, importDecision: workspace.importDecision,
    importGuest: () => { void copyGuest(); },
    skipImport: () => { void persist({ ...current.current, importDecision: 'skipped' }).catch(() => {}); },
    syncEnabled: workspace.sync.enabled, syncing, syncError, lastSyncedAt: workspace.sync.lastSyncedAt, pendingSync: workspace.sync.dirty,
    conflict, synchronize: () => startSync(), resolveConflict: choice => startSync(choice),
    enableSync: () => { if (uid && firestoreReady) { initialSyncDone.current = false; void persist({ ...current.current, sync: { ...current.current.sync, enabled: true } }).catch(() => {}); } },
    disableSync: () => { void persist({ ...current.current, sync: { ...current.current.sync, enabled: false } }).catch(() => {}); },
  }}>{children}</KitchenContext.Provider>;
}
export function useKitchen() {
  const context = useContext(KitchenContext);
  if (!context) throw new Error('useKitchen necesita KitchenProvider.');
  return context;
}
