import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { type ReactNode } from 'react';
import { AppText as Text } from './AppText';
import { Heading, IconButton, Page, usePalette, type IconName } from './common';

export function SettingsPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <Page><View style={{ alignItems: 'flex-start' }}><IconButton icon="arrow-back" label="Volver" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /></View>
    <Heading eyebrow="A TU MANERA" title={title} subtitle={subtitle} />{children}</Page>;
}

export function SettingsRow({ icon, title, description, onPress }: { icon: IconName; title: string; description: string; onPress: () => void }) {
  const c = usePalette();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${description}`} onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 76, padding: 16, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, opacity: pressed ? .7 : 1 })}>
    <Ionicons accessible={false} name={icon} color={c.green} size={24} />
    <View style={{ flex: 1, gap: 5 }}><Text style={{ color: c.text, fontSize: 17, fontWeight: '600' }}>{title}</Text><Text style={{ color: c.muted, fontSize: 13, lineHeight: 20 }}>{description}</Text></View>
    <Ionicons accessible={false} name="chevron-forward" color={c.muted} size={18} />
  </Pressable>;
}

export function Choice<T extends string>({ options, value, onChange, label }: { options: readonly { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string }) {
  const c = usePalette();
  return <View accessibilityLabel={label} style={{ gap: 8 }}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: value === option.value }} aria-checked={value === option.value} onPress={() => onChange(option.value)} style={({ pressed }) => ({ minHeight: 50, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 1, borderColor: value === option.value ? c.green : c.border, borderRadius: 14, opacity: pressed ? .7 : 1 })}>
    <Ionicons accessible={false} name={value === option.value ? 'radio-button-on' : 'radio-button-off'} size={22} color={c.green} /><Text style={{ color: c.text, fontSize: 15, flexShrink: 1 }}>{option.label}</Text>
  </Pressable>)}</View>;
}
