import { DurableObject } from 'cloudflare:workers';
import { ChatError, decodeChatRequest } from '../../src/domain/chat';
import { generateReply } from '../../functions/src/gemini';
import { reserveQuota, type UserQuota, type GlobalQuota } from '../../functions/src/quota';
import { checkAccount, verifyToken } from './auth';

interface Env {
  GEMINI_API_KEY: string; GEMINI_MODEL: string; CHAT_ENABLED: string; CHAT_PILOT_UIDS: string;
  CHAT_GLOBAL_DAILY_LIMIT: string; FIREBASE_PROJECT_ID: string; FIREBASE_API_KEY: string;
  CHAT_QUOTA: DurableObjectNamespace<ChatQuota>;
}
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const statusFor = (code: string) => code === 'SESSION' ? 401 : code === 'INVALID' ? 400
  : ['LIMIT', 'RATE', 'GLOBAL'].includes(code) ? 429 : ['BUSY', 'DUPLICATE'].includes(code) ? 409 : 503;
const failure = (error: unknown) => {
  const code = error instanceof ChatError ? error.code : 'NETWORK';
  // Only a fixed internal code: never log requests, identities, tokens or provider bodies.
  console.warn('[chat-error]', /^[A-Z_]{1,20}$/.test(code) ? code : 'UNKNOWN');
  return json({ code }, statusFor(code));
};
async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
}

// One SQLite-backed object holds the global counter and every pilot account.
// Reservations contain no network awaits and commit atomically, even for concurrent requests.
export class ChatQuota extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER NOT NULL)');
  }
  private read<T>(key: string): T | null {
    const row = this.ctx.storage.sql.exec<{ value: string }>('SELECT value FROM records WHERE key = ?', key).toArray()[0];
    return row ? JSON.parse(row.value) as T : null;
  }
  private write(key: string, value: unknown, now: number) {
    this.ctx.storage.sql.exec('INSERT OR REPLACE INTO records VALUES (?, ?, ?)', key, JSON.stringify(value), now + 48 * 60 * 60 * 1000);
  }
  async fetch(request: Request): Promise<Response> {
    try {
      // This object is reachable only through its Worker binding, never directly from the public URL.
      const input = await request.json() as { uidHash: string; requestId: string; bodyHash: string; limit: number };
      if (!/^[a-f0-9]{64}$/.test(input.uidHash) || !/^[a-zA-Z0-9_-]{20,80}$/.test(input.requestId)) throw new ChatError('INVALID');
      const now = Date.now(), key = `request:${input.uidHash}:${input.requestId}`, userKey = `user:${input.uidHash}`;
      const operation = new URL(request.url).pathname;
      const result = this.ctx.storage.transactionSync(() => {
        this.ctx.storage.sql.exec('DELETE FROM records WHERE expires <= ?', now);
        const user = this.read<UserQuota>(userKey);
        const previous = this.read<{ bodyHash: string; pendingUntil: number; finished: boolean }>(key);
        if (operation === '/finish') {
          if (user?.lease === input.requestId) this.write(userKey, { ...user, lease: null, leaseUntil: 0 }, now);
          if (previous) this.write(key, { ...previous, finished: true }, now);
          return { ok: true };
        }
        if (operation !== '/reserve' || !/^[a-f0-9]{64}$/.test(input.bodyHash)) throw new ChatError('INVALID');
        if (previous) {
          if (previous.bodyHash !== input.bodyHash) throw new ChatError('INVALID');
          throw new ChatError(!previous.finished && previous.pendingUntil > now ? 'BUSY' : 'DUPLICATE');
        }
        const reservation = reserveQuota(user, this.read<GlobalQuota>('global'), now, input.requestId, input.limit);
        this.write(userKey, reservation.user, now);
        this.write('global', reservation.global, now);
        this.write(key, { bodyHash: input.bodyHash, pendingUntil: now + 120000, finished: false }, now);
        return { remaining: reservation.remaining };
      });
      // Bound pseudonymous metadata retention also when nobody sends another request.
      if (await this.ctx.storage.getAlarm() === null) await this.ctx.storage.setAlarm(now + 48 * 60 * 60 * 1000);
      return json(result);
    } catch (error) { return failure(error); }
  }
  async alarm() {
    this.ctx.storage.sql.exec('DELETE FROM records WHERE expires <= ?', Date.now());
    const row = this.ctx.storage.sql.exec<{ expires: number }>('SELECT MIN(expires) AS expires FROM records').toArray()[0];
    if (row?.expires) await this.ctx.storage.setAlarm(row.expires);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let stage = 'setup';
    try {
      if (request.method !== 'POST' || new URL(request.url).pathname !== '/chat') return json({ code: 'INVALID' }, 404);
      if (env.CHAT_ENABLED !== 'true') throw new ChatError('DISABLED');
      if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL || !env.FIREBASE_API_KEY) throw new ChatError('SETUP');
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new ChatError('INVALID');
      const bearer = request.headers.get('Authorization');
      if (!bearer?.startsWith('Bearer ') || bearer.length > 8192) throw new ChatError('SESSION');
      const token = bearer.slice(7);
      stage = 'identity';
      const identity = await verifyToken(token, env.FIREBASE_PROJECT_ID);
      if (!env.CHAT_PILOT_UIDS.split(',').map(x => x.trim()).filter(Boolean).includes(identity.uid)) throw new ChatError('SESSION');
      // Limit the stream itself, not only the untrusted Content-Length header.
      const reader = request.body?.getReader();
      if (!reader) throw new ChatError('INVALID');
      const chunks: Uint8Array[] = []; let length = 0;
      while (true) { const { value, done } = await reader.read(); if (done) break;
        length += value.byteLength; if (length > 64000) { await reader.cancel(); throw new ChatError('INVALID'); } chunks.push(value); }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let body: unknown; try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new ChatError('INVALID'); }
      const chat = decodeChatRequest(body);
      stage = 'account-before';
      await checkAccount(token, identity.uid, identity.authTime, env.FIREBASE_PROJECT_ID, env.FIREBASE_API_KEY);
      stage = 'quota';
      const quota = env.CHAT_QUOTA.getByName('global-v1');
      const reservation = { uidHash: await hash(identity.uid), requestId: chat.requestId,
        bodyHash: await hash(JSON.stringify(chat)), limit: Number(env.CHAT_GLOBAL_DAILY_LIMIT) };
      const reserved = await quota.fetch('https://quota/reserve', { method: 'POST', body: JSON.stringify(reservation) });
      const result = await reserved.json() as { code?: string; remaining: number };
      if (!reserved.ok) throw new ChatError(result.code ?? 'NETWORK');
      try {
        stage = 'provider';
        const text = await generateReply(chat, env.GEMINI_API_KEY, env.GEMINI_MODEL);
        stage = 'account-after';
        await checkAccount(token, identity.uid, identity.authTime, env.FIREBASE_PROJECT_ID, env.FIREBASE_API_KEY);
        return json({ text, remaining: result.remaining });
      } finally {
        // If cleanup fails, the persistent lease expires; the original ID still cannot call Gemini twice.
        try { await quota.fetch('https://quota/finish', { method: 'POST', body: JSON.stringify(reservation) }); } catch { /* lease expires */ }
      }
    } catch (error) { console.warn('[chat-stage-error]', stage, error instanceof Error ? error.name : 'unknown'); return failure(error); }
  },
} satisfies ExportedHandler<Env>;
