export type ThemePreference = 'system' | 'light' | 'dark';
export type FontPreference = 'system' | 'serif';
export type TextSizePreference = 'standard' | 'large' | 'extra-large';
export type Preferences = {
  version: 1;
  displayName: string;
  theme: ThemePreference;
  font: FontPreference;
  textSize: TextSizePreference;
};

export const defaultPreferences: Preferences = {
  version: 1, displayName: '', theme: 'system', font: 'system', textSize: 'standard',
};

export function readingMultiplier(size: TextSizePreference): number {
  return size === 'extra-large' ? 1.3 : size === 'large' ? 1.15 : 1;
}

export function decodePreferences(raw: string | null): Preferences {
  if (raw === null) return { ...defaultPreferences };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Ajustes inválidos.');
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || typeof data.displayName !== 'string' || data.displayName.length > 60 ||
      typeof data.theme !== 'string' || !['system', 'light', 'dark'].includes(data.theme) ||
      typeof data.font !== 'string' || !['system', 'serif'].includes(data.font) ||
      typeof data.textSize !== 'string' || !['standard', 'large', 'extra-large'].includes(data.textSize)) {
    throw new Error('Formato de ajustes no compatible.');
  }
  return {
    version: 1, displayName: data.displayName.trim(),
    theme: data.theme as ThemePreference, font: data.font as FontPreference,
    textSize: data.textSize as TextSizePreference,
  };
}
