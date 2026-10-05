import { decodeState } from '../domain/kitchen';
import { decodeWorkspace, newWorkspace, workspaceKey, type Workspace } from '../domain/workspace';
import { readRecord, writeRecord, removeRecord } from './storage';

export type RecordStore = { read: (key: string) => Promise<string | null>; write: (key: string, value: string) => Promise<void>; remove: (key: string) => Promise<void> };
export class WorkspaceRepository {
  private queue: Promise<unknown> = Promise.resolve();
  private retired = new Set<string>();
  constructor(private store: RecordStore) {}
  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.catch(() => {}).then(operation);
    this.queue = result;
    return result;
  }
  load(uid: string | null): Promise<Workspace> {
    return this.enqueue(async () => {
      const key = workspaceKey(uid);
      if (await this.store.read(`retired:${key}`)) { this.retired.add(key); throw new Error('Esta cuenta fue eliminada.'); }
      const raw = await this.store.read(key);
      if (raw !== null) return decodeWorkspace(raw);
      const workspace = newWorkspace(uid === null ? decodeState(await this.store.read('kitchen-v1')) : undefined);
      await this.store.write(key, JSON.stringify(workspace));
      return workspace;
    });
  }
  save(uid: string | null, value: Workspace): Promise<void> {
    const key = workspaceKey(uid);
    const snapshot = JSON.stringify(decodeWorkspace(JSON.stringify(value)));
    return this.enqueue(async () => {
      if (this.retired.has(key) || await this.store.read(`retired:${key}`)) throw new Error('Esta cuenta fue eliminada.');
      await this.store.write(key, snapshot);
    });
  }
  retire(uid: string): Promise<void> {
    const key = workspaceKey(uid);
    this.retired.add(key);
    return this.enqueue(async () => {
      await this.store.write(`retired:${key}`, '1');
      await this.store.remove(key);
    });
  }
}
export const workspaces = new WorkspaceRepository({ read: readRecord, write: writeRecord, remove: removeRecord });
