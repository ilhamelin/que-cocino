import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { authErrorMessage, type Account } from '../domain/auth';
import { authAdapter } from '../services/auth';
import { finishDeletion, prepareDeletion, recoverDeletion } from '../services/deletion';
import { deleteVerifiedAccount } from '../domain/accountDeletion';

type AuthContextValue = {
  account: Account | null; loading: boolean; busy: boolean; error: string | null;
  unavailableReason: string | null; signIn: () => void; signOut: () => void; retrySession: () => void;
  deleting: boolean; deletionPending: boolean; deleteAccount: () => void; retryCleanup: () => void;
  registerBeforeChange: (callback: () => Promise<void>) => () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(false);
  const beforeChange = useRef<() => Promise<void>>(async () => {});
  const [deleting, setDeleting] = useState(false);
  const [deletionPending, setDeletionPending] = useState(false);
  async function cleanup() {
    try { setDeletionPending(await recoverDeletion()); } catch { setDeletionPending(true); setError(authErrorMessage({ code: 'local/delete-failed' })); }
  }
  useEffect(() => { void cleanup(); }, []);
  useEffect(() => {
    setLoading(true);
    setError(null);
    return authAdapter.subscribe(value => { setAccount(value); setLoading(false); }, cause => {
      setError(authErrorMessage(cause)); setLoading(false);
    });
  }, [attempt]);

  async function run(operation: () => Promise<void>) {
    if (pending.current || loading || authAdapter.unavailableReason) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try { await beforeChange.current(); await operation(); } catch (cause) { setError(authErrorMessage(cause)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <AuthContext.Provider value={{ account, loading, busy, error,
    unavailableReason: authAdapter.unavailableReason,
    signIn: () => { void run(() => authAdapter.signIn()); },
    signOut: () => { void run(() => authAdapter.signOut()); },
    deleting, deletionPending,
    retryCleanup: () => { void cleanup(); },
    registerBeforeChange(callback) {
      beforeChange.current = callback;
      return () => { if (beforeChange.current === callback) beforeChange.current = async () => {}; };
    },
    deleteAccount: () => { void run(async () => {
      if (!account) return;
      const uid = account.uid;
      setDeleting(true);
      try {
        await deleteVerifiedAccount(uid, { verifyAndDelete: callback => authAdapter.deleteAccount(callback), prepare: prepareDeletion, finish: finishDeletion });
      } finally { setDeleting(false); await cleanup(); }
    }); },
    retrySession: () => { void run(async () => { setAttempt(value => value + 1); }); },
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth necesita AuthProvider.');
  return value;
}
