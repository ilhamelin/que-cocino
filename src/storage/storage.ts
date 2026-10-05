// Metro uses storage.native.ts on Android/iOS. This adapter supports browser previews.
const key = 'que-cocino:kitchen-v1';
export async function readRecord(key: string): Promise<string | null> {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(`que-cocino:${key}`);
}
export async function writeRecord(key: string, value: string): Promise<void> {
  if (typeof window !== 'undefined') window.localStorage.setItem(`que-cocino:${key}`, value);
}
export async function removeRecord(key: string): Promise<void> {
  if (typeof window !== 'undefined') window.localStorage.removeItem(`que-cocino:${key}`);
}
export async function loadKitchen(): Promise<string | null> {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
}
export async function saveKitchen(value: string): Promise<void> {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
}

const preferencesKey = 'que-cocino:preferences-v1';
export async function loadPreferences(): Promise<string | null> {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(preferencesKey);
}
export async function savePreferences(value: string): Promise<void> {
  if (typeof window !== 'undefined') window.localStorage.setItem(preferencesKey, value);
}
