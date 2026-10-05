import { decodeState, initialState, type KitchenState } from './kitchen';

export type Workspace = {
  version: 2;
  kitchen: KitchenState;
  importDecision: 'pending' | 'copied' | 'skipped';
  sync: { enabled: boolean; dirty: boolean; remoteUpdateTime: string | null; lastSyncedAt: string | null };
};
export function workspaceKey(uid: string | null): string {
  if (uid !== null && (!uid || uid.length > 128 || uid.includes('/'))) throw new Error('Identificador de cuenta inválido.');
  return uid === null ? 'kitchen-v2:guest' : `kitchen-v2:user:${encodeURIComponent(uid)}`;
}
export function newWorkspace(kitchen: KitchenState = initialState): Workspace {
  return { version: 2, kitchen: decodeState(JSON.stringify(kitchen)), importDecision: 'pending',
    sync: { enabled: false, dirty: false, remoteUpdateTime: null, lastSyncedAt: null } };
}
export function decodeWorkspace(raw: string): Workspace {
  const value = JSON.parse(raw);
  if (!value || value.version !== 2 || !['pending', 'copied', 'skipped'].includes(value.importDecision) ||
      !value.sync || typeof value.sync.enabled !== 'boolean' || typeof value.sync.dirty !== 'boolean' ||
      ![value.sync.remoteUpdateTime, value.sync.lastSyncedAt].every(item => item === null || (typeof item === 'string' && !Number.isNaN(Date.parse(item))))) {
    throw new Error('Formato de cocina no compatible.');
  }
  return { version: 2, kitchen: decodeState(JSON.stringify(value.kitchen)), importDecision: value.importDecision,
    sync: { enabled: value.sync.enabled, dirty: value.sync.dirty, remoteUpdateTime: value.sync.remoteUpdateTime, lastSyncedAt: value.sync.lastSyncedAt } };
}
export function hasKitchenData(state: KitchenState): boolean {
  return state.pantry.length + state.favorites.length + state.shopping.length > 0;
}
export function sameKitchen(a: KitchenState, b: KitchenState): boolean {
  return (['pantry', 'favorites', 'shopping', 'checked'] as const).every(key =>
    a[key].length === b[key].length && a[key].every(id => (b[key] as readonly string[]).includes(id)));
}
export function importKitchen(target: KitchenState, guest: KitchenState): KitchenState {
  return decodeState(JSON.stringify({ version: 1,
    pantry: [...new Set([...target.pantry, ...guest.pantry])], favorites: [...new Set([...target.favorites, ...guest.favorites])],
    shopping: [...new Set([...target.shopping, ...guest.shopping])], checked: [...new Set([...target.checked, ...guest.checked])],
  }));
}

export type CloudSnapshot = { kitchen: KitchenState; updateTime: string } | null;
export type SyncDecision = 'download' | 'upload' | 'acknowledge' | 'conflict' | 'none';
export function decideSync(local: Workspace, remote: CloudSnapshot): SyncDecision {
  if (remote && sameKitchen(local.kitchen, remote.kitchen)) return 'acknowledge';
  if (!local.sync.dirty) return remote ? 'download' : hasKitchenData(local.kitchen) ? 'upload' : 'none';
  if ((remote?.updateTime ?? null) !== local.sync.remoteUpdateTime) return 'conflict';
  return 'upload';
}
