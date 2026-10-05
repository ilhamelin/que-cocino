import { Platform, StyleSheet, Text, type TextProps } from 'react-native';
import { readingMultiplier } from '../domain/preferences';
import { usePreferences } from '../state/PreferencesProvider';

export function AppText({ style, maxFontSizeMultiplier, ...props }: TextProps) {
  const { preferences } = usePreferences();
  // Decorative emoji keep their fixed size and system font.
  const decorative = maxFontSizeMultiplier === 1;
  const multiplier = decorative ? 1 : readingMultiplier(preferences.textSize);
  const flattened = StyleSheet.flatten(style) ?? {};
  const family = !decorative && preferences.font === 'serif'
    ? Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) : undefined;
  return <Text {...props} maxFontSizeMultiplier={maxFontSizeMultiplier} style={[style, {
    fontSize: (flattened.fontSize ?? 14) * multiplier,
    ...(flattened.lineHeight ? { lineHeight: flattened.lineHeight * multiplier } : {}),
    ...(family ? { fontFamily: family } : {}),
  }]} />;
}
