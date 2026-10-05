import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deleteVerifiedAccount } from '../src/domain/accountDeletion';

test('cancelar reautenticación conserva cocina e identidad, y otra cuenta no borra datos', async () => {
  let prepared = false;
  let finished = false;
  const dependencies = { prepare: async () => { prepared = true; }, finish: async () => { finished = true; } };
  assert.equal(await deleteVerifiedAccount('A', { ...dependencies, verifyAndDelete: async () => false }), false);
  assert.equal(prepared, false); assert.equal(finished, false);
  await assert.rejects(deleteVerifiedAccount('A', { ...dependencies, verifyAndDelete: async before => { await before('B'); return true; } }));
  assert.equal(prepared, false); assert.equal(finished, false);
});
test('borrado remoto fallido impide borrar identidad; solo el éxito retira la cocina local', async () => {
  const sequence: string[] = [];
  const verifyAndDelete = async (before: (uid: string) => Promise<void>) => { sequence.push('reauth'); await before('A'); sequence.push('identity'); return true; };
  await assert.rejects(deleteVerifiedAccount('A', { verifyAndDelete, prepare: async () => { throw new Error('Sin red'); }, finish: async () => { sequence.push('local'); } }));
  assert.deepEqual(sequence, ['reauth']);
  sequence.length = 0;
  assert.equal(await deleteVerifiedAccount('A', { verifyAndDelete, prepare: async () => { sequence.push('remote'); }, finish: async () => { sequence.push('local'); } }), true);
  assert.deepEqual(sequence, ['reauth', 'remote', 'identity', 'local']);
});
