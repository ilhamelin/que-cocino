import { ChatError } from '../../src/domain/chat';

export async function authorizeChat(authorization: string | undefined, appToken: string | undefined,
  policy: { requireAppCheck: boolean; pilotUids: string[] },
  verifyIdentity: (token: string) => Promise<string>, verifyApp: (token: string) => Promise<void>): Promise<string> {
  if (!authorization?.startsWith('Bearer ') || authorization.length > 10000) throw new ChatError('SESSION');
  let uid: string;
  try { uid = await verifyIdentity(authorization.slice(7)); } catch { throw new ChatError('SESSION'); }
  if (!uid || uid.length > 128 || uid.includes('/')) throw new ChatError('SESSION');
  if (policy.requireAppCheck) {
    if (!appToken) throw new ChatError('SESSION');
    try { await verifyApp(appToken); } catch { throw new ChatError('SESSION'); }
  } else if (!policy.pilotUids.length || !policy.pilotUids.includes(uid)) throw new ChatError('SESSION');
  return uid;
}
