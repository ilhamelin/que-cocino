import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, useColorScheme } from 'react-native';
import { decodePreferences, defaultPreferences, type Preferences } from '../domain/preferences';
import { loadPreferences, savePreferences } from '../storage/storage';

type PreferencesContextValue = {
  preferences: Preferences;
  update: (patch: Partial<Omit<Preferences, 'version'>>) => void;
  saveError: boolean;
  saving: boolean;
  retrySave: () => void;
};
const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    let active = true;
    setLoadError(false);
    loadPreferences().then(raw => {
      const stored = decodePreferences(raw);
      if (active) { setPreferences(stored); setReady(true); }
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    setSaving(true);
    writes.current = writes.current.catch(() => {}).then(() => savePreferences(JSON.stringify(preferences)));
    writes.current.then(() => {
      if (active) { setSaveError(false); setSaving(false); }
    }).catch(() => {
      if (active) { setSaveError(true); setSaving(false); }
    });
    return () => { active = false; };
  }, [preferences, ready, saveAttempt]);

  if (!ready) return <View style={{ flex: 1, padding: 28, gap: 18, justifyContent: 'center', backgroundColor: isDark ? '#1C211C' : '#FBFAF6' }}>
    {loadError ? <>
      <Text accessibilityLiveRegion="polite" style={{ color: isDark ? '#EEF4EB' : '#23382B', fontSize: 18 }}>No pudimos abrir tus ajustes. Tus datos no se han reemplazado.</Text>
      <Pressable accessibilityRole="button" onPress={() => setLoadAttempt(value => value + 1)} style={{ minHeight: 50, padding: 16, backgroundColor: '#2B5D3C', borderRadius: 15 }}><Text style={{ color: '#FFFFFF', fontSize: 16 }}>Reintentar</Text></Pressable>
    </> : <ActivityIndicator accessibilityLabel="Cargando ajustes" color={isDark ? '#AED89D' : '#2B5D3C'} />}
  </View>;

  return <PreferencesContext.Provider value={{ preferences, saveError, saving,
    update: patch => setPreferences(current => decodePreferences(JSON.stringify({ ...current, ...patch }))),
    retrySave: () => setSaveAttempt(value => value + 1),
  }}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences necesita PreferencesProvider.');
  return context;
}
