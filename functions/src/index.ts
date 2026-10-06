import { createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret, defineString, defineBoolean, defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { ChatError, decodeChatRequest } from '../../src/domain/chat';
import { reserveQuota, type UserQuota, type GlobalQuota } from './quota';
import { generateReply } from './gemini';
import { authorizeChat } from './access';

initializeApp();
const db = getFirestore();
const key = defineSecret('GEMINI_API_KEY');
const enabled = defineBoolean('CHAT_ENABLED', { default: false });
const model = defineString('GEMINI_MODEL', { default: '' });
const globalLimit = defineInt('CHAT_GLOBAL_DAILY_LIMIT', { default: 20 });
const requireAppCheck = defineBoolean('CHAT_REQUIRE_APP_CHECK', { default: true });
const pilotUids = defineString('CHAT_PILOT_UIDS', { default: '' });
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export const cookingChat = onRequest({ region: 'southamerica-west1', timeoutSeconds: 60, memory: '256MiB',
  minInstances: 0, maxInstances: 2, concurrency: 10, cors: false, secrets: [key] }, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  let release: (() => Promise<void>) | undefined;
  try {
    if (req.method !== 'POST') { res.status(405).json({ code: 'INVALID' }); return; }
    if (!enabled.value()) throw new ChatError('DISABLED');
    if (!req.is('application/json') || !req.rawBody || req.rawBody.length > 24000) throw new ChatError('INVALID');
    const uid = await authorizeChat(req.get('Authorization'), req.get('X-Firebase-AppCheck'), {
      requireAppCheck: requireAppCheck.value(), pilotUids: pilotUids.value().split(',').map(value => value.trim()).filter(Boolean),
    }, async token => (await getAuth().verifyIdToken(token, true)).uid,
    async token => { await getAppCheck().verifyToken(token); });
    const request = decodeChatRequest(req.body);
    if (!key.value() || !/^gemini-[a-zA-Z0-9.-]+$/.test(model.value())) throw new ChatError('SETUP');
    const digest = hash(JSON.stringify(request)), userKey = hash(uid);
    const userRef = db.doc(`chatUsage/${userKey}`);
    const requestRef = db.doc(`chatRequests/${hash(uid + ':' + request.requestId)}`);
    const globalRef = db.doc('chatControl/global');
    const ownerRef = db.doc(`users/${uid}`);
    const remaining = await db.runTransaction(async tx => {
      const [owner, previous, user, global] = await tx.getAll(ownerRef, requestRef, userRef, globalRef);
      if (owner.data()?.deleted === true) throw new ChatError('SESSION');
      if (previous.exists) {
        if (previous.data()?.digest !== digest) throw new ChatError('INVALID');
        throw new ChatError(previous.data()?.status === 'pending' && previous.data()?.pendingUntil > Date.now() ? 'BUSY' : 'DUPLICATE');
      }
      const now = Date.now();
      const next = reserveQuota(user.exists ? user.data() as UserQuota : null, global.exists ? global.data() as GlobalQuota : null, now, request.requestId, globalLimit.value());
      const expiresAt = Timestamp.fromMillis(now + 48 * 60 * 60 * 1000);
      tx.set(userRef, { ...next.user, expiresAt });
      tx.set(globalRef, next.global);
      tx.create(requestRef, { digest, status: 'pending', pendingUntil: now + 120000, expiresAt });
      return next.remaining;
    });
    release = async () => { await db.runTransaction(async tx => {
      const user = await tx.get(userRef);
      tx.update(requestRef, { status: 'finished' });
      if (user.data()?.lease === request.requestId) tx.update(userRef, { lease: null, leaseUntil: 0 });
    }); };
    const text = await generateReply(request, key.value(), model.value());
    // Do not deliver a response after deletion while Gemini was running.
    if ((await ownerRef.get()).data()?.deleted === true) throw new ChatError('SESSION');
    res.status(200).json({ text, remaining });
  } catch (error) {
    const code = error instanceof ChatError ? error.code : 'PROVIDER';
    const status = code === 'SESSION' ? 401 : code === 'INVALID' ? 400 : ['LIMIT', 'RATE', 'BUSY', 'GLOBAL'].includes(code) ? 429 : code === 'DUPLICATE' ? 409 : 503;
    // Never log questions, tokens, API keys, UID, or provider error bodies.
    logger.warn('chat_request_failed', { code });
    res.status(status).json({ code });
  } finally {
    if (release) try { await release(); } catch { logger.error('chat_lease_release_failed'); }
  }
});

