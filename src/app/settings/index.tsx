import { router } from 'expo-router';
import { usePreferences } from '../../state/PreferencesProvider';
import { useAuth } from '../../state/AuthProvider';
import { Notice } from '../../ui/common';
import { SettingsPage, SettingsRow } from '../../ui/settings';

export default function SettingsScreen() {
  const { preferences } = usePreferences();
  const { account } = useAuth();
  return <SettingsPage title="Ajustes" subtitle="Personaliza tu experiencia y conoce cómo cuidamos tus datos.">
    <SettingsRow icon="person-outline" title="Perfil" description={account?.email || preferences.displayName || 'Tu nombre y acceso con Google'} onPress={() => router.push('/settings/profile')} />
    <SettingsRow icon="shield-checkmark-outline" title="Seguridad y privacidad" description="Dónde se guardan tus datos y estado de tu cuenta" onPress={() => router.push('/settings/security')} />
    <SettingsRow icon="cloud-outline" title="Respaldo y sincronización" description="Copia de tu cocina en Firestore y cambios pendientes" onPress={() => router.push('/settings/backup')} />
    <SettingsRow icon="color-palette-outline" title="Apariencia y lectura" description="Tema, modo oscuro, tamaño y tipo de fuente" onPress={() => router.push('/settings/appearance')} />
    <SettingsRow icon="help-circle-outline" title="Ayuda" description="Respuestas sobre despensa, recetas y compras" onPress={() => router.push('/settings/help')} />
    <SettingsRow icon="information-circle-outline" title="Información de la app" description="Versión y funciones disponibles" onPress={() => router.push('/settings/about')} />
    <Notice>{account ? 'Estás usando la cocina de tu cuenta. El respaldo en la nube es opcional.' : 'Estás usando la cocina del invitado. Puedes iniciar sesión desde Perfil.'}</Notice>
  </SettingsPage>;
}
