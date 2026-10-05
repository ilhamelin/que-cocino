import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { KitchenProvider, useKitchen } from '../state/KitchenProvider';
import { PreferencesProvider, usePreferences } from '../state/PreferencesProvider';
import { AuthProvider } from '../state/AuthProvider';
import { useAuth } from '../state/AuthProvider';
import { router } from 'expo-router';
import { Action, Notice, usePalette, useResolvedTheme } from '../ui/common';

function Navigation() {
  const c = usePalette();
  const { saveError, retrySave, guestAvailable, importDecision } = useKitchen();
  const { account } = useAuth();
  const settings = usePreferences();
  const theme = useResolvedTheme();
  return <View style={{ flex: 1, backgroundColor: c.background }}>
    {account && guestAvailable && importDecision === 'pending' ? <SafeAreaView edges={['top', 'left', 'right']} style={{ padding: 12, gap: 8 }}><Notice>Tu cocina anterior está conservada como invitado. Decide si quieres copiarla a tu cuenta.</Notice><Action label="Revisar en Perfil" onPress={() => router.push('/settings/profile')} secondary /></SafeAreaView> : null}
    {saveError ? <SafeAreaView edges={['top', 'left', 'right']} style={{ padding: 16, gap: 8 }}><Notice error>No se guardaron los últimos cambios. Reintenta antes de cerrar la app.</Notice><Action label="Reintentar guardado" onPress={retrySave} secondary /></SafeAreaView> : null}
    {settings.saveError ? <SafeAreaView edges={['top', 'left', 'right']} style={{ padding: 16, gap: 8 }}><Notice error>No se guardaron los ajustes. Reintenta antes de cerrar la app.</Notice><Action label="Reintentar ajustes" onPress={settings.retrySave} secondary /></SafeAreaView> : null}
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="settings" />
    </Stack>
    <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
  </View>;
}
export default function RootLayout() {
  return <SafeAreaProvider><PreferencesProvider><AuthProvider><KitchenProvider><Navigation /></KitchenProvider></AuthProvider></PreferencesProvider></SafeAreaProvider>;
}
