import { ChatError, decodeChatReply, decodeChatRequest, type ChatRequest } from '../domain/chat';
import { chatEndpoint } from '../config/chat';
import { authAdapter } from './auth';

export class ChatClient {
  constructor(private endpoint: string, private token: (uid: string) => Promise<string>, private request: typeof fetch = fetch) {}
  async send(uid: string, request: ChatRequest, signal?: AbortSignal) {
    let url: URL;
    try { url = new URL(this.endpoint); } catch { throw new ChatError('SETUP'); }
    if (url.protocol !== 'https:') throw new ChatError('SETUP');
    const body = decodeChatRequest(request);
    let token: string;
    try { token = await this.token(uid); } catch { throw new ChatError('SESSION'); }
    const controller = new AbortController();
    const cancel = () => controller.abort();
    if (signal?.aborted) cancel();
    signal?.addEventListener('abort', cancel);
    // Allow the server's bounded identity checks before and after the 25-second Gemini request.
    const timeout = setTimeout(cancel, 65000);
    try {
      const response = await this.request(url.toString(), { method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // Diagnostics deliberately omit the URL, body, headers and credentials.
        console.info('[chat] HTTP', response.status, response.headers.get('content-type') ?? 'unknown');
      }
      let value: unknown;
      try { value = await response.json(); } catch { throw new ChatError('SERVER'); }
      if (!response.ok) throw new ChatError(value && typeof value === 'object' && 'code' in value && typeof value.code === 'string' ? value.code : 'SERVER');
      return decodeChatReply(value);
    } catch (error) {
      if (!(error instanceof ChatError) && typeof __DEV__ !== 'undefined' && __DEV__) console.info('[chat] transport', error instanceof Error ? error.name : 'unknown');
      throw error instanceof ChatError ? error : new ChatError('NETWORK');
    }
    finally { clearTimeout(timeout); signal?.removeEventListener('abort', cancel); }
  }
}
export const chatClient = new ChatClient(chatEndpoint, uid => authAdapter.getIdToken(uid));
