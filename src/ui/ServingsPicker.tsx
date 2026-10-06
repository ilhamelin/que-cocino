import { View } from 'react-native';
import { Action, usePalette } from './common';
import { AppText as Text } from './AppText';
export function ServingsPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const c = usePalette();
  return <View style={{ gap: 8 }}><Text style={{ color: c.text }}>Para {value} persona{value === 1 ? '' : 's'}</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Action secondary label="Menos porciones" disabled={value <= 1} onPress={() => onChange(value - 1)} /></View><View style={{ flex: 1 }}><Action secondary label="Más porciones" disabled={value >= 20} onPress={() => onChange(value + 1)} /></View></View>
  </View>;
}
