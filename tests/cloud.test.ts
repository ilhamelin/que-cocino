import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CloudRepository, decodeCloud, encodeCloud, cloudErrorMessage, CloudError } from '../src/services/cloud';
import { initialState, kitchenReducer } from '../src/domain/kitchen';

const updateTime = '2026-10-05T14:00:00.123456Z';
test('Firestore convierte y valida la cocina sin aceptar estados remotos corruptos', () => {
  const state = kitchenReducer(initialState, { type: 'sample' });
  assert.deepEqual(decodeCloud({ ...encodeCloud(state), updateTime }).kitchen, state);
  assert.throws(() => decodeCloud({ fields: { version: { integerValue: '8' } }, updateTime }));
});
test('la API usa token por UID y precondiciones de revisión; no sobrescribe conflictos', async () => {
  const calls: { url: string; options: RequestInit }[] = [];
  const client = new CloudRepository(async uid => { assert.equal(uid, 'A'); return 'token-de-prueba'; }, async (input, options) => {
    calls.push({ url: String(input), options: options! });
    return new Response(JSON.stringify({ ...encodeCloud(initialState), updateTime }), { status: 200 });
  });
  await client.put('A', initialState, null);
  assert.match(calls[0].url, /users\/A\/kitchens\/current\?currentDocument.exists=false$/);
  assert.equal((calls[0].options.headers as Record<string, string>).Authorization, 'Bearer token-de-prueba');
  await client.put('A', initialState, updateTime);
  assert.match(calls[1].url, /currentDocument.updateTime=/);
  const denied = new CloudRepository(async () => 'test', async () => new Response(JSON.stringify({ error: { status: 'FAILED_PRECONDITION' } }), { status: 400 }));
  await assert.rejects(denied.put('A', initialState, updateTime), (e: unknown) => e instanceof CloudError && e.code === 'CONFLICT');
});
test('fallos de red no exponen credenciales y el borrado envía marca y eliminación en un commit', async () => {
  const broken = new CloudRepository(async () => 'test', async () => { throw new Error('token secreto'); });
  await assert.rejects(broken.get('A'));
  assert.doesNotMatch(cloudErrorMessage(new Error('token secreto')), /token secreto/);
  let body = '';
  const client = new CloudRepository(async () => 'test', async (input, options) => {
    assert.match(String(input), /documents:commit$/); body = String(options?.body);
    return new Response('{}', { status: 200 });
  });
  await client.remove('A');
  const writes = JSON.parse(body).writes;
  assert.equal(writes[0].update.fields.deleted.booleanValue, true);
  assert.match(writes[1].delete, /users\/A\/kitchens\/current$/);
});
