import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { ChatError } from '../../src/domain/chat';

const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
export async function verifyToken(token: string, project: string, getKey: JWTVerifyGetKey = keys) {
  try {
    const { payload } = await jwtVerify(token, getKey, {
      algorithms: ['RS256'], issuer: `https://securetoken.google.com/${project}`, audience: project,
      requiredClaims: ['exp', 'iat', 'sub', 'auth_time'],
    });
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128 || payload.sub.includes('/')
      || typeof payload.iat !== 'number' || payload.iat > now
      || typeof payload.auth_time !== 'number' || payload.auth_time > now) throw new Error('claims');
    return { uid: payload.sub, authTime: payload.auth_time };
  } catch { throw new ChatError('SESSION'); }
}

// Public Firebase API key identifies the project; it is not a service-account secret.
export async function checkAccount(token: string, uid: string, authTime: number, project: string, apiKey: string, fetcher: typeof fetch = fetch) {
  if (!apiKey) throw new ChatError('SETUP');
  try {
    const lookup = await fetcher(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }),
      redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    if (!lookup.ok) { console.warn('[chat-auth-status]', lookup.status); throw new ChatError(lookup.status === 400 || lookup.status === 401 ? 'SESSION' : 'NETWORK'); }
    const data = await lookup.json() as { users?: { localId?: string; disabled?: boolean; validSince?: string }[] };
    const user = data.users?.[0];
    const validSince = user?.validSince === undefined ? 0 : Number(user.validSince);
    if (!user || user.localId !== uid || user.disabled || !Number.isFinite(validSince) || authTime < validSince) throw new ChatError('SESSION');
    const marker = await fetcher(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` }, redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    if (marker.status === 404) return;
    if (!marker.ok) { console.warn('[chat-marker-status]', marker.status); throw new ChatError(marker.status === 401 || marker.status === 403 ? 'SESSION' : 'NETWORK'); }
    const document = await marker.json() as { fields?: { deleted?: { booleanValue?: boolean } } };
    if (document.fields?.deleted?.booleanValue === true) throw new ChatError('SESSION');
  } catch (error) {
    if (!(error instanceof ChatError)) console.warn('[chat-auth-transport]', error instanceof Error ? error.name : 'unknown');
    throw error instanceof ChatError ? error : new ChatError('NETWORK');
  }
}
