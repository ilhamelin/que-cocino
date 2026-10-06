import { checkAccount } from '../src/auth';
import { generateReply } from '../../functions/src/gemini';

// Test-only entrypoint; never deploy this Worker. No real identity or Gemini key is used.
export default {
  async fetch(request: Request, env: { TEST_FIREBASE_API_KEY: string }): Promise<Response> {
    const mode = new URL(request.url).pathname;
    if (mode.startsWith('/provider')) {
      let calls = 0;
      const provider = (async (url: RequestInfo | URL, init?: RequestInit) => {
        // The real Workers Request constructor checks runtime-supported options.
        new Request(url, init); calls++;
        return mode === '/provider-redirect' ? new Response('', { status: 302, headers: { Location: 'https://untrusted.test' } })
          : Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ inScope: true, answer: 'Respuesta de prueba.' }) }] } }] });
      }) as typeof fetch;
      try {
        const text = await generateReply({ version: 1, requestId: 'runtime_test_1234567890', messages: [{ role: 'user', text: 'Arroz' }] }, 'fake-test-key', 'gemini-test', provider);
        return Response.json({ code: 'OK', calls, text });
      } catch (error) { return Response.json({ code: error instanceof Error ? error.message : 'UNKNOWN', calls }); }
    }
    const mock = (async (url: unknown) => String(url).includes('accounts:lookup')
      ? Response.json({ users: [{ localId: 'A' }] }) : new Response('', { status: 404 })) as typeof fetch;
    try {
      await checkAccount('invalid-diagnostic-token', 'A', 0, 'que-cocino-6377a', env.TEST_FIREBASE_API_KEY,
        mode === '/mock' ? mock : undefined);
      return Response.json({ code: 'OK' });
    } catch (error) { return Response.json({ code: error instanceof Error ? error.message : 'UNKNOWN' }); }
  },
};
