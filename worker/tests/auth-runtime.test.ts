import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

test('comprobación de cuenta usa AbortSignal y fetch compatibles con el runtime de Workers', async () => {
  const script = await readFile(new URL('../build/auth-runtime.js', import.meta.url), 'utf8');
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script, compatibilityDate: '2026-10-05',
    bindings: { TEST_FIREBASE_API_KEY: config.vars.FIREBASE_API_KEY } }));
  try {
    assert.equal((await (await mf.dispatchFetch('https://test/mock')).json() as any).code, 'OK');
    assert.equal((await (await mf.dispatchFetch('https://test/live')).json() as any).code, 'SESSION');
    const provider = await (await mf.dispatchFetch('https://test/provider')).json() as any;
    assert.equal(provider.code, 'OK');
    assert.equal(provider.calls, 1);
    const redirect = await (await mf.dispatchFetch('https://test/provider-redirect')).json() as any;
    assert.equal(redirect.code, 'PROVIDER');
    assert.equal(redirect.calls, 1);
  } finally { await mf.dispose(); }
});
