import { Modal, ScrollView, View } from 'react-native';
import { AppText as Text } from './AppText';
import { Action, usePalette } from './common';

export function Confirmation({ visible, title, message, confirmLabel, onConfirm, onCancel }: {
  visible: boolean; title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void;
}) {
  const c = usePalette();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={{ flex: 1, backgroundColor: '#00000099', justifyContent: 'center', padding: 24 }}>
      <ScrollView accessibilityViewIsModal style={{ backgroundColor: c.card, borderRadius: 20, maxHeight: '90%' }} contentContainerStyle={{ padding: 22, gap: 18 }}>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: c.text }}>{title}</Text>
        <Text style={{ fontSize: 16, lineHeight: 25, color: c.text }}>{message}</Text>
        <Action label={confirmLabel} onPress={onConfirm} />
        <Action label="Cancelar" onPress={onCancel} secondary />
      </ScrollView>
    </View>
  </Modal>;
}
