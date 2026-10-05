import { Stack } from 'expo-router';
import { usePalette } from '../../ui/common';

export default function SettingsLayout() {
  const c = usePalette();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />;
}
