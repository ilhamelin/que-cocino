import { AppText as Text } from './AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useColorScheme, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ingredients, type IngredientId, type Recipe } from '../data/catalog';
import { missingIngredients } from '../domain/kitchen';
import { type ReactNode } from 'react';
import { router, usePathname } from 'expo-router';
import { readingMultiplier } from '../domain/preferences';
import { usePreferences } from '../state/PreferencesProvider';

const light = { background: '#FBFAF6', card: '#FFFFFF', text: '#23382B', muted: '#606E60', green: '#2B5D3C', onGreen: '#FFFFFF', soft: '#EDF2E5', border: '#DFE5D8', peach: '#F6EADB', danger: '#A0342C' };
const dark: typeof light = { background: '#1C211C', card: '#262E26', text: '#EEF4EB', muted: '#B5C2B3', green: '#AED89D', onGreen: '#1A321E', soft: '#303E2A', border: '#455345', peach: '#48372B', danger: '#FFAEA6' };
export function useResolvedTheme() {
  const system = useColorScheme();
  const { preferences } = usePreferences();
  return preferences.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : preferences.theme;
}
export function usePalette() { return useResolvedTheme() === 'dark' ? dark : light; }
export function useReadingScale() {
  const { fontScale } = useWindowDimensions();
  const { preferences } = usePreferences();
  return fontScale * readingMultiplier(preferences.textSize);
}
export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function ingredientMatchLabel(count: number) {
  return count === 0 ? 'Tienes todos los ingredientes' : count === 1 ? 'Te falta 1 ingrediente' : `Te faltan ${count} ingredientes`;
}

export function Page({ children }: { children: ReactNode }) {
  const c = usePalette();
  const pathname = usePathname();
  return <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: c.background }}>
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      <View style={s.brand}><View style={[s.logo, { backgroundColor: c.green }]}><Ionicons accessible={false} name="restaurant" size={20} color={c.onGreen} /></View><Text style={[s.brandText, { color: c.text, flex: 1 }]}>¿Qué cocino?</Text>{!pathname.startsWith('/settings') ? <IconButton icon="settings-outline" label="Abrir ajustes" onPress={() => router.push('/settings')} /> : null}</View>
      {children}
    </ScrollView>
  </SafeAreaView>;
}
export function Heading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const c = usePalette();
  return <View style={{ gap: 9 }}><Text style={[s.eyebrow, { color: c.green }]}>{eyebrow}</Text><Text accessibilityRole="header" style={[s.title, { color: c.text }]}>{title}</Text><Text style={[s.body, { color: c.muted }]}>{subtitle}</Text></View>;
}
export function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  const c = usePalette();
  return <View style={s.section}><View style={s.sectionHead}><Text accessibilityRole="header" style={[s.sectionTitle, { color: c.text }]}>{title}</Text>{aside ? <Text style={{ fontSize: 12, color: c.muted }}>{aside}</Text> : null}</View>{children}</View>;
}
export function Action({ label, onPress, icon, secondary = false, disabled = false }: { label: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean }) {
  const c = usePalette();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.action, { backgroundColor: secondary ? c.soft : c.green, opacity: disabled ? .45 : pressed ? .75 : 1 }]}>
    {icon ? <Ionicons accessible={false} name={icon} size={19} color={secondary ? c.green : c.onGreen} /> : null}<Text style={[s.actionText, { color: secondary ? c.green : c.onGreen }]}>{label}</Text>
  </Pressable>;
}
export function IconButton({ icon, label, onPress, selected = false }: { icon: IconName; label: string; onPress: () => void; selected?: boolean }) {
  const c = usePalette();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [s.iconButton, { backgroundColor: selected ? c.soft : c.card, borderColor: c.border, opacity: pressed ? .6 : 1 }]}><Ionicons name={icon} size={22} color={c.green} /></Pressable>;
}
export function IngredientPicker({ selected, onToggle, query = '' }: { selected: IngredientId[]; onToggle: (id: IngredientId) => void; query?: string }) {
  const c = usePalette();
  const filtered = ingredients.filter(item => normalize(item.name).includes(normalize(query)));
  return <View style={s.chips}>{filtered.length ? filtered.map(item => {
    const active = selected.includes(item.id);
    return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityState={{ checked: active }} accessibilityLabel={item.name} onPress={() => onToggle(item.id)} style={({ pressed }) => [s.chip, { backgroundColor: active ? c.soft : c.card, borderColor: active ? c.green : c.border, opacity: pressed ? .7 : 1 }]}><Text accessible={false} style={{ fontSize: 17 }}>{item.emoji}</Text><Text style={{ fontSize: 14, flexShrink: 1, color: active ? c.green : c.text }}>{item.name}</Text><Ionicons accessible={false} name={active ? 'checkmark' : 'add'} color={active ? c.green : c.muted} size={15} /></Pressable>;
  }) : <Text style={{ color: c.muted }}>No hay ingredientes con ese nombre en el catálogo inicial.</Text>}</View>;
}
function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
export function Search({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const c = usePalette();
  const { preferences } = usePreferences();
  return <TextInput accessibilityLabel={placeholder} value={value} onChangeText={onChange} returnKeyType="search" autoCorrect={false} placeholder={placeholder} placeholderTextColor={c.muted} style={[s.search, { fontSize: 16 * readingMultiplier(preferences.textSize), backgroundColor: c.card, borderColor: c.border, color: c.text }]} />;
}
export function RecipeCard({ recipe, pantry, onPress }: { recipe: Recipe; pantry: IngredientId[]; onPress: () => void }) {
  const c = usePalette(); const missing = missingIngredients(recipe, pantry).length;
  const { width } = useWindowDimensions();
  const fontScale = useReadingScale();
  const stacked = width < 360 || fontScale >= 1.3;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${recipe.name}, ${recipe.minutes} minutos, ${ingredientMatchLabel(missing)}`} accessibilityHint="Abre los ingredientes y pasos de la receta" onPress={onPress} style={({ pressed }) => [s.recipe, { flexDirection: stacked ? 'column' : 'row', alignItems: stacked ? 'stretch' : 'center', backgroundColor: c.card, borderColor: c.border, opacity: pressed ? .7 : 1 }]}>
    <View style={[s.art, { backgroundColor: c.peach }]}><Text accessible={false} style={{ fontSize: 39 }} maxFontSizeMultiplier={1}>{recipe.emoji}</Text></View><View style={{ flex: stacked ? undefined : 1, gap: 6 }}><Text style={[s.recipeName, { color: c.text }]}>{recipe.name}</Text><Text style={{ fontSize: 12, color: c.muted }}>{recipe.minutes} min · {recipe.servings} porciones</Text><Text style={[s.match, { color: c.green, backgroundColor: c.soft }]}>{ingredientMatchLabel(missing)}</Text></View><Ionicons accessible={false} name="chevron-forward" size={18} color={c.muted} />
  </Pressable>;
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  const c = usePalette(); return <View style={[s.notice, { backgroundColor: c.peach }]}><Text accessibilityLiveRegion="polite" style={{ color: error ? c.danger : c.text, fontSize: 13, lineHeight: 20 }}>{children}</Text></View>;
}
export function Empty({ icon, title, description, children }: { icon: IconName; title: string; description: string; children?: ReactNode }) {
  const c = usePalette(); return <View style={[s.empty, { backgroundColor: c.soft }]}><Ionicons name={icon} color={c.green} size={32} /><Text style={[s.sectionTitle, { color: c.text, textAlign: 'center' }]}>{title}</Text><Text style={[s.body, { color: c.muted, textAlign: 'center' }]}>{description}</Text>{children}</View>;
}
export function Surface({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = usePalette(); return <View style={[{ borderRadius: 22, backgroundColor: c.soft, padding: 22, gap: 12 }, style]}>{children}</View>;
}
const s = StyleSheet.create({
  page: { padding: 22, paddingBottom: 36, width: '100%', maxWidth: 620, alignSelf: 'center', gap: 18 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }, logo: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, brandText: { fontSize: 20, fontWeight: '700', letterSpacing: -.5, flexShrink: 1 },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.7 }, title: { fontSize: 32, fontWeight: '700', letterSpacing: -1, lineHeight: 38 }, body: { fontSize: 14, lineHeight: 22 },
  section: { gap: 13, marginTop: 7 }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }, sectionTitle: { fontSize: 19, fontWeight: '600' },
  action: { minHeight: 50, padding: 14, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }, actionText: { fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'center' }, iconButton: { minWidth: 48, minHeight: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { maxWidth: '100%', minHeight: 48, paddingHorizontal: 11, paddingVertical: 10, borderWidth: 1, borderRadius: 13, flexDirection: 'row', gap: 6, alignItems: 'center' },
  search: { minHeight: 48, padding: 12, borderWidth: 1, borderRadius: 13, fontSize: 16 }, recipe: { borderWidth: 1, borderRadius: 20, padding: 10, gap: 12, flexDirection: 'row', alignItems: 'center' }, art: { width: 68, height: 76, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, recipeName: { fontSize: 16, fontWeight: '600' }, match: { fontSize: 11, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  notice: { padding: 14, borderRadius: 14 }, empty: { borderRadius: 22, padding: 24, gap: 14, alignItems: 'center' },
});
