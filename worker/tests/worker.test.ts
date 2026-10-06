import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { generateKeyPair, SignJWT } from 'jose';
import { verifyToken, checkAccount } from '../src/auth';

test('verificación Firebase exige firma, proyecto, caducidad y tiempos válidos', async () => {
  const pair = await generateKeyPair('RS256');
  const now = Math.floor(Date.now() / 1000);
  const sign = (extra: Record<string, unknown> = {}) => new SignJWT({ auth_time: now - 10, iat: now - 5, exp: now + 100,
    sub: 'account-A', iss: 'https://securetoken.google.com/que-cocino-6377a', aud: 'que-cocino-6377a', ...extra })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(pair.privateKey);
  const getKey = async () => pair.publicKey;
  assert.equal((await verifyToken(await sign(), 'que-cocino-6377a', getKey)).uid, 'account-A');
  for (const extra of [{ aud: 'otro' }, { iss: 'https://evil.test' }, { exp: now - 1 }, { auth_time: now + 100 },
    { iat: now + 100 }, { sub: '' }, { sub: 'a/b' }]) {
    await assert.rejects(verifyToken(await sign(extra), 'que-cocino-6377a', getKey), /SESSION/);
  }
  const other = await generateKeyPair('RS256');
  await assert.rejects(verifyToken(await sign(), 'que-cocino-6377a', async () => other.publicKey), /SESSION/);
});

test('consulta online rechaza usuario eliminado, deshabilitado, revocado o marcador eliminado', async () => {
  const mock = (user: unknown, deleted = false, lookupStatus = 200) => (async (url: unknown) => String(url).includes('accounts:lookup')
    ? Response.json({ users: user ? [user] : [] }, { status: lookupStatus })
    : deleted ? Response.json({ fields: { deleted: { booleanValue: true } } }) : new Response('', { status: 404 })) as typeof fetch;
  await checkAccount('token', 'A', 100, 'project', 'public-key', mock({ localId: 'A', validSince: '99' }));
  for (const user of [null, { localId: 'B' }, { localId: 'A', disabled: true }, { localId: 'A', validSince: '101' }]) {
    await assert.rejects(checkAccount('token', 'A', 100, 'project', 'public-key', mock(user)), /SESSION/);
  }
  await assert.rejects(checkAccount('token', 'A', 100, 'project', 'public-key', mock({ localId: 'A' }, true)), /SESSION/);
  await assert.rejects(checkAccount('token', 'A', 100, 'project', 'public-key', mock(null, false, 400)), /SESSION/);
});

test('SQLite real: reservas paralelas, deduplicación, límite global y persistencia tras reiniciar', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'que-cocino-worker-test-'));
  const options = convertV4MiniflareOptions({ modules: true, scriptPath: new URL('../build/index.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
    compatibilityDate: '2026-10-05', durableObjects: { CHAT_QUOTA: { className: 'ChatQuota', useSQLite: true } },
    resourcePersistencePath: directory, bindings: { CHAT_ENABLED: 'false' } });
  let mf = new Miniflare(options);
  const input = (uid: string, id: string) => ({ uidHash: uid.repeat(64), requestId: `request_test_00000000_${id}`, bodyHash: 'a'.repeat(64), limit: 2 });
  try {
    const namespace = await mf.getDurableObjectNamespace('CHAT_QUOTA');
    const stub = namespace.get(namespace.idFromName('global-v1'));
    const call = (path: string, body: unknown) => stub.fetch(`https://quota/${path}`, { method: 'POST', body: JSON.stringify(body) });
    const parallel = await Promise.all(Array.from({ length: 6 }, (_, i) => call('reserve', input('1', String(i)))));
    assert.equal(parallel.filter(x => x.ok).length, 1);
    for (const response of parallel.filter(x => !x.ok)) assert.equal((await response.json() as any).code, 'BUSY');
    const winner = parallel.findIndex(x => x.ok), first = input('1', String(winner));
    await call('finish', first);
    assert.equal((await (await call('reserve', first)).json() as any).code, 'DUPLICATE');
    assert.equal((await (await call('reserve', { ...first, bodyHash: 'b'.repeat(64) })).json() as any).code, 'INVALID');
    assert.equal((await call('reserve', input('2', 'new'))).status, 200);
    await mf.dispose();
    mf = new Miniflare(options);
    const restored = await mf.getDurableObjectNamespace('CHAT_QUOTA');
    const denied = await restored.get(restored.idFromName('global-v1')).fetch('https://quota/reserve', { method: 'POST', body: JSON.stringify(input('3', 'more')) });
    assert.equal((await denied.json() as any).code, 'GLOBAL');
    const disabled = await mf.dispatchFetch('https://worker/chat', { method: 'POST' });
    assert.equal((await disabled.json() as any).code, 'DISABLED');
  } finally { await mf.dispose(); await rm(directory, { recursive: true, force: true }); }
});
