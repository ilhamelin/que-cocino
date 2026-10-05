import { usePreferences } from '../../state/PreferencesProvider';
import { AppText as Text } from '../../ui/AppText';
import { Notice, Section, Surface, usePalette } from '../../ui/common';
import { Choice, SettingsPage } from '../../ui/settings';

export default function AppearanceScreen() {
  const { preferences, update, saveError, saving } = usePreferences();
  const c = usePalette();
  return <SettingsPage title="Apariencia y lectura" subtitle="Los cambios se aplican a toda la app y se guardan automáticamente.">
    <Section title="Tema"><Choice label="Tema de la app" value={preferences.theme} onChange={theme => update({ theme })} options={[
      { value: 'system', label: 'Seguir el dispositivo' }, { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' },
    ]} /></Section>
    <Section title="Tamaño del texto"><Choice label="Tamaño del texto" value={preferences.textSize} onChange={textSize => update({ textSize })} options={[
      { value: 'standard', label: 'Estándar' }, { value: 'large', label: 'Grande' }, { value: 'extra-large', label: 'Más grande' },
    ]} /></Section>
    <Section title="Tipo de fuente"><Choice label="Tipo de fuente" value={preferences.font} onChange={font => update({ font })} options={[
      { value: 'system', label: 'Del dispositivo' }, { value: 'serif', label: 'Clásica (serif)' },
    ]} /></Section>
    <Surface><Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: '600', color: c.text }}>Una buena idea para hoy</Text><Text style={{ fontSize: 14, lineHeight: 22, color: c.muted }}>Así se ven tus recetas. Lava los ingredientes, prepara tu mesa y disfruta cocinando.</Text></Surface>
    <Notice>El tamaño elegido se suma al tamaño de texto de tu dispositivo. Los iconos y las ilustraciones conservan su tamaño.</Notice>
    <Text accessibilityLiveRegion="polite" style={{ color: saveError ? c.danger : c.muted, fontSize: 13 }}>{saving ? 'Guardando ajustes…' : saveError ? 'No se guardaron. Usa Reintentar ajustes.' : 'Ajustes guardados en este dispositivo.'}</Text>
  </SettingsPage>;
}
