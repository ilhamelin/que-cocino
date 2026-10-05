import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, kitchenReducer } from '../src/domain/kitchen';
import { decodeWorkspace, decideSync, importKitchen, newWorkspace, workspaceKey } from '../src/domain/workspace';
import { WorkspaceRepository, type RecordStore } from '../src/storage/workspaces';

function memory() {
  const records = new Map<string, string>();
  const store: RecordStore = {
    async read(key) { return records.get(key) ?? null; },
    async write(key, value) { records.set(key, value); },
    async remove(key) { records.delete(key); },
  };
  return { records, store, repository: new WorkspaceRepository(store) };
}
test('la migración preserva el original y crea cocinas independientes para invitado y dos UID', async () => {
  const { records, repository } = memory();
  const legacy = kitchenReducer(initialState, { type: 'sample' });
  records.set('kitchen-v1', JSON.stringify(legacy));
  const guest = await repository.load(null);
  assert.deepEqual(guest.kitchen, legacy);
  const a = await repository.load('cuenta-A');
  const b = await repository.load('cuenta-B');
  assert.deepEqual(a.kitchen.pantry, []);
  a.kitchen = kitchenReducer(a.kitchen, { type: 'toggle-ingredient', id: 'pan' });
  await repository.save('cuenta-A', a);
  assert.deepEqual((await repository.load('cuenta-A')).kitchen.pantry, ['pan']);
  assert.deepEqual((await repository.load('cuenta-B')).kitchen, b.kitchen);
  assert.deepEqual((await repository.load(null)).kitchen, legacy);
  assert.equal(records.get('kitchen-v1'), JSON.stringify(legacy));
});
test('datos corruptos y errores de escritura no reemplazan la cocina anterior', async () => {
  const { store, records, repository } = memory();
  records.set('kitchen-v1', '{datos rotos');
  await assert.rejects(repository.load(null));
  assert.equal(records.has(workspaceKey(null)), false);
  records.set('kitchen-v1', JSON.stringify(initialState));
  const saved = await repository.load(null);
  const snapshot = records.get(workspaceKey(null));
  store.write = async () => { throw new Error('Disco lleno'); };
  await assert.rejects(repository.save(null, { ...saved, kitchen: kitchenReducer(saved.kitchen, { type: 'sample' }) }));
  assert.equal(records.get(workspaceKey(null)), snapshot);
  assert.throws(() => decodeWorkspace('{"version":9}'));
});
test('importar es una copia explícita sin duplicados y retirar UID no toca invitado ni otras cuentas', async () => {
  const { repository } = memory();
  const guest = await repository.load(null);
  guest.kitchen = kitchenReducer(guest.kitchen, { type: 'sample' });
  await repository.save(null, guest);
  const a = await repository.load('A');
  a.kitchen = importKitchen(a.kitchen, guest.kitchen);
  a.kitchen = importKitchen(a.kitchen, guest.kitchen);
  assert.deepEqual(a.kitchen, guest.kitchen);
  await repository.save('A', a);
  await repository.load('B');
  await repository.retire('A');
  await assert.rejects(repository.save('A', a));
  await assert.rejects(repository.load('A'));
  assert.deepEqual((await repository.load(null)).kitchen, guest.kitchen);
  assert.deepEqual((await repository.load('B')).kitchen, initialState);
});
test('la sincronización detecta conflictos, recupera respuestas perdidas y respeta eliminaciones', () => {
  const local = newWorkspace(kitchenReducer(initialState, { type: 'sample' }));
  local.sync.dirty = true;
  const old = '2026-10-05T12:00:00.000Z';
  const newer = '2026-10-05T12:01:00.000Z';
  assert.equal(decideSync(local, null), 'upload');
  assert.equal(decideSync(local, { kitchen: initialState, updateTime: newer }), 'conflict');
  assert.equal(decideSync(local, { kitchen: local.kitchen, updateTime: newer }), 'acknowledge');
  local.sync.remoteUpdateTime = old;
  assert.equal(decideSync(local, null), 'conflict');
  local.kitchen = initialState;
  assert.equal(decideSync(local, { kitchen: kitchenReducer(initialState, { type: 'sample' }), updateTime: old }), 'upload');
  local.sync.dirty = false;
  assert.equal(decideSync(local, { kitchen: kitchenReducer(initialState, { type: 'sample' }), updateTime: newer }), 'download');
});
test('una limpieza interrumpida no permite revivir un UID y puede reintentarse', async () => {
  const { store, records, repository } = memory();
  const a = await repository.load('A');
  const remove = store.remove;
  store.remove = async () => { throw new Error('Fallo de borrado'); };
  await assert.rejects(repository.retire('A'));
  const restarted = new WorkspaceRepository(store);
  await assert.rejects(restarted.load('A'));
  await assert.rejects(restarted.save('A', a));
  store.remove = remove;
  await restarted.retire('A');
  assert.equal(records.has(workspaceKey('A')), false);
  assert.equal(records.get(`retired:${workspaceKey('A')}`), '1');
});
