import { firestoreReady } from '../config/firebase';
import { workspaces } from '../storage/workspaces';
import { readRecord, writeRecord, removeRecord } from '../storage/storage';
import { cloud } from './cloud';

const key = 'account-deletion-v1';
type DeletionJournal = { version: 1; uid: string; stage: 'remote-cleared' | 'identity-deleted' };
export async function prepareDeletion(uid: string): Promise<void> {
  if (firestoreReady) {
    try { await cloud.remove(uid); } catch { throw Object.assign(new Error('No se borró la copia remota.'), { code: 'cloud/delete-failed' }); }
  }
  await writeRecord(key, JSON.stringify({ version: 1, uid, stage: 'remote-cleared' } satisfies DeletionJournal));
}
export async function finishDeletion(uid: string): Promise<void> {
  try {
    await writeRecord(key, JSON.stringify({ version: 1, uid, stage: 'identity-deleted' } satisfies DeletionJournal));
    await workspaces.retire(uid);
    await removeRecord(key);
  } catch { throw Object.assign(new Error('Limpieza local pendiente.'), { code: 'local/delete-failed' }); }
}
export async function recoverDeletion(): Promise<boolean> {
  const raw = await readRecord(key);
  if (!raw) return false;
  const value = JSON.parse(raw) as DeletionJournal;
  if (value.version !== 1 || typeof value.uid !== 'string') throw new Error('Registro de eliminación inválido.');
  if (value.stage === 'identity-deleted') { await finishDeletion(value.uid); return false; }
  // Never infer server deletion from being signed out. Preserve local data if completion is uncertain.
  return true;
}
