import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKitchen } from '../../state/KitchenProvider';
import { usePalette, useReadingScale, type IconName } from '../../ui/common';

export default function TabLayout() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const fontScale = useReadingScale();
  const { state } = useKitchen();
  const tabIcon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;
  return <Tabs screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarLabelPosition: 'below-icon', tabBarActiveTintColor: c.green, tabBarInactiveTintColor: c.muted, tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border, height: 76 + insets.bottom + Math.max(0, fontScale - 1) * 24, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }, tabBarLabelStyle: { fontSize: 11, lineHeight: 18 }, sceneStyle: { backgroundColor: c.background } }}>
    <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: tabIcon('home-outline') }} />
    <Tabs.Screen name="pantry" options={{ title: 'Despensa', tabBarIcon: tabIcon('leaf-outline') }} />
    <Tabs.Screen name="favorites" options={{ title: 'Favoritas', tabBarIcon: tabIcon('heart-outline') }} />
    <Tabs.Screen name="shopping" options={{ title: 'Compras', tabBarIcon: tabIcon('basket-outline'), tabBarBadge: state.shopping.length || undefined, tabBarBadgeStyle: { backgroundColor: c.green, color: c.onGreen } }} />
  </Tabs>;
}
