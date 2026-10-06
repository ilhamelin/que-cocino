import { decodeState, type KitchenState } from '../domain/kitchen';
import { workspaceKey, type CloudSnapshot } from '../domain/workspace';
import { firebaseProjectId } from '../config/firebase';
import { authAdapter } from './auth';

type FirestoreValue = { integerValue?: string; stringValue?: string; arrayValue?: { values?: FirestoreValue[] }; mapValue?: { fields: Record<string, FirestoreValue> } };
export type CloudErrorCode = 'CONFLICT' | 'SETUP' | 'SESSION' | 'NETWORK' | 'INVALID';
export class CloudError extends Error {
  constructor(public code: CloudErrorCode) { super(code); }
}
export function cloudErrorMessage(error: unknown): string {
  if (error instanceof CloudError && error.code === 'SETUP') return 'Falta crear Firestore o publicar sus reglas de acceso. Los datos locales siguen guardados.';
  if (error instanceof CloudError && error.code === 'CONFLICT') return 'La copia remota cambió. Sincroniza nuevamente para revisar ambas versiones.';
  if (error instanceof CloudError && error.code === 'SESSION') return 'Tu sesión cambió. Vuelve a abrir el respaldo de tu cuenta.';
  if (error instanceof CloudError && error.code === 'INVALID') return 'La copia remota tiene un formato incompatible. No hemos reemplazado tu cocina.';
  return 'No pudimos sincronizar. Comprueba tu conexión y reintenta; tus cambios siguen guardados en este dispositivo.';
}
export function encodeCloud(kitchen: KitchenState): { fields: Record<string, FirestoreValue> } {
  const value = decodeState(JSON.stringify(kitchen));
  return { fields: { version: { integerValue: '3' }, extras: { stringValue: JSON.stringify({ customIngredients: value.customIngredients, mealPlan: value.mealPlan, cookHistory: value.cookHistory }) }, quantities: { stringValue: JSON.stringify(value.quantities) }, savedRecipes: { stringValue: JSON.stringify(value.savedRecipes) }, ...Object.fromEntries(
    (['pantry', 'favorites', 'shopping', 'checked'] as const).map(key => [key, { arrayValue: { values: value[key].map(id => ({ stringValue: id })) } }]),
  ) } };
}
export function decodeCloud(document: unknown): Exclude<CloudSnapshot, null> {
  const data = document as { fields?: Record<string, FirestoreValue>; updateTime?: string };
  try {
    if (!data.fields || typeof data.updateTime !== 'string' || Number.isNaN(Date.parse(data.updateTime))) throw new Error();
    const fields = data.fields;
    if (!['1', '2', '3'].includes(fields.version?.integerValue ?? '')) throw new Error();
    const version = Number(fields.version.integerValue);
    const extras = version === 3 ? JSON.parse(fields.extras.stringValue!) : {};
    if (!extras || typeof extras !== 'object' || Array.isArray(extras) || Object.keys(extras).some(key => !['customIngredients', 'mealPlan', 'cookHistory'].includes(key))) throw new Error();
    const state = { ...extras, version, ...(version >= 2 ? { quantities: JSON.parse(fields.quantities.stringValue!), savedRecipes: JSON.parse(fields.savedRecipes.stringValue!) } : {}), ...Object.fromEntries((['pantry', 'favorites', 'shopping', 'checked'] as const).map(key => {
      if (!fields[key]?.arrayValue) throw new Error();
      return [key, (fields[key].arrayValue.values ?? []).map(value => value.stringValue)];
    })) };
    return { kitchen: decodeState(JSON.stringify(state)), updateTime: data.updateTime };
  } catch { throw new CloudError('INVALID'); }
}
export class CloudRepository {
  constructor(private token: (uid: string) => Promise<string> = uid => authAdapter.getIdToken(uid), private request: typeof fetch = fetch) {}
  private async call(uid: string, method: string, query = '', kitchen?: KitchenState, commitBody?: unknown): Promise<Response> {
    workspaceKey(uid);
    const token = await this.token(uid);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const root = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`;
      const url = commitBody ? `${root}:commit` : `${root}/users/${encodeURIComponent(uid)}/kitchens/current${query}`;
      const result = await this.request(url, { method, signal: controller.signal, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(commitBody ? { body: JSON.stringify(commitBody) } : kitchen ? { body: JSON.stringify(encodeCloud(kitchen)) } : {}) });
      if (result.ok || result.status === 404) return result;
      if (result.status === 409 || result.status === 412) throw new CloudError('CONFLICT');
      if (result.status === 401) throw new CloudError('SESSION');
      if (result.status === 403) throw new CloudError('SETUP');
      // Firestore also represents failed preconditions with HTTP 400.
      const body = await result.json().catch(() => null);
      if (body?.error?.status === 'FAILED_PRECONDITION' || body?.error?.status === 'ABORTED') throw new CloudError('CONFLICT');
      throw new CloudError('NETWORK');
    } finally { clearTimeout(timeout); }
  }
  async get(uid: string): Promise<CloudSnapshot> {
    const result = await this.call(uid, 'GET');
    if (result.status === 404) return null;
    return decodeCloud(await result.json());
  }
  async put(uid: string, kitchen: KitchenState, expectedUpdateTime: string | null): Promise<Exclude<CloudSnapshot, null>> {
    const condition = expectedUpdateTime ? `currentDocument.updateTime=${encodeURIComponent(expectedUpdateTime)}` : 'currentDocument.exists=false';
    const result = await this.call(uid, 'PATCH', `?${condition}`, kitchen);
    if (result.status === 404) throw new CloudError('SETUP');
    return decodeCloud(await result.json());
  }
  async remove(uid: string): Promise<void> {
    const name = `projects/${firebaseProjectId}/databases/(default)/documents/users/${uid}`;
    // Atomically block further writes from other devices holding an old ID token, then remove kitchen data.
    const result = await this.call(uid, 'POST', '', undefined, { writes: [
      { update: { name, fields: { deleted: { booleanValue: true } } } },
      { delete: `${name}/kitchens/current` },
    ] });
    if (result.status === 404) throw new CloudError('SETUP');
  }
}
export const cloud = new CloudRepository();
