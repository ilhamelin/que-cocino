import { ingredients, type IngredientId } from '../data/catalog';

export type ChatMessage = { role: 'user' | 'model'; text: string };
export type ChatRequest = { version: 1; requestId: string; messages: ChatMessage[]; pantry?: IngredientId[]; customPantry?: string[] };
export type ChatReply = { text: string; remaining: number };
export const chatLimits = { input: 1000, history: 6, totalCharacters: 7000, reply: 4000, daily: 10, perMinute: 2 } as const;
export class ChatError extends Error {
  constructor(public code: string) { super(code); }
}
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
export function decodeChatRequest(value: unknown): ChatRequest {
  if (!object(value) || value.version !== 1 || typeof value.requestId !== 'string' || !/^[a-zA-Z0-9_-]{20,80}$/.test(value.requestId)
    || Object.keys(value).some(key => !['version', 'requestId', 'messages', 'pantry', 'customPantry'].includes(key))
    || !Array.isArray(value.messages) || !value.messages.length || value.messages.length > chatLimits.history + 1) throw new ChatError('INVALID');
  let size = 0;
  const messages = value.messages.map((message, index): ChatMessage => {
    if (!object(message) || Object.keys(message).some(key => !['role', 'text'].includes(key))
      || message.role !== (index % 2 === 0 ? 'user' : 'model') || typeof message.text !== 'string'
      || !message.text.trim() || message.text.length > (message.role === 'user' ? chatLimits.input : chatLimits.reply)) throw new ChatError('INVALID');
    size += message.text.length;
    return { role: message.role as ChatMessage['role'], text: message.text.trim() };
  });
  if (messages.at(-1)?.role !== 'user' || size > chatLimits.totalCharacters) throw new ChatError('INVALID');
  const result: ChatRequest = { version: 1, requestId: value.requestId, messages };
  if (value.pantry !== undefined) {
    if (!Array.isArray(value.pantry) || value.pantry.length > ingredients.length || new Set(value.pantry).size !== value.pantry.length
      || value.pantry.some(id => !ingredients.some(item => item.id === id))) throw new ChatError('INVALID');
    result.pantry = value.pantry as IngredientId[];
  }
  if (value.customPantry !== undefined) {
    if (value.pantry === undefined || !Array.isArray(value.customPantry) || value.customPantry.length > 100 || new Set(value.customPantry).size !== value.customPantry.length
      || value.customPantry.some(name => typeof name !== 'string' || !name.trim() || name.length > 60 || /[\u0000-\u001f]/.test(name))) throw new ChatError('INVALID');
    result.customPantry = value.customPantry.map(name => name.trim());
  }
  return result;
}
export function decodeChatReply(value: unknown): ChatReply {
  if (!object(value) || typeof value.text !== 'string' || !value.text.trim() || value.text.length > chatLimits.reply
    || !Number.isInteger(value.remaining) || (value.remaining as number) < 0 || (value.remaining as number) > chatLimits.daily) throw new ChatError('PROVIDER');
  return { text: value.text.trim(), remaining: value.remaining as number };
}
export function chatErrorMessage(error: unknown): string {
  const code = error instanceof ChatError ? error.code : 'NETWORK';
  const messages: Record<string, string> = {
    SETUP: 'El asistente aún no está conectado al servidor. Puedes consultar Ayuda mientras lo configuramos.',
    DISABLED: 'El asistente está pausado por el momento.',
    SESSION: 'Comprueba tu sesión desde Perfil y vuelve a intentarlo.',
    LIMIT: 'Alcanzaste el límite diario de consultas. Vuelve mañana (el cupo se renueva a las 00:00 UTC).',
    RATE: 'Espera un minuto antes de enviar otra consulta.',
    BUSY: 'Tu cuenta ya tiene una consulta en curso. Espera antes de volver a enviar.',
    GLOBAL: 'Se agotó el cupo general del asistente por hoy.',
    DUPLICATE: 'Esta consulta ya se procesó. Si no recibiste la respuesta, puedes enviar una nueva; contará como otra consulta.',
    INVALID: 'Revisa tu consulta: hasta 1.000 caracteres y una conversación breve.',
    PROVIDER: 'Gemini no pudo responder. Puedes enviar una nueva consulta; el intento anterior puede haber consumido cupo.',
    NETWORK: 'No se recibió la respuesta. Comprueba internet y reintenta la misma solicitud para evitar duplicados.',
    SERVER: 'El servidor del asistente no pudo responder correctamente. Reintenta la misma solicitud en unos momentos.',
  };
  return messages[code] ?? messages.NETWORK;
}
