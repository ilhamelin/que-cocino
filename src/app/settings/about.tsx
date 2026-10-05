import Constants from 'expo-constants';
import { AppText as Text } from '../../ui/AppText';
import { Section, Surface, usePalette } from '../../ui/common';
import { SettingsPage } from '../../ui/settings';
import { firestoreReady } from '../../config/firebase';

export default function AboutScreen() {
  const c = usePalette();
  return <SettingsPage title="Acerca de ¿Qué cocino?" subtitle="Menos vueltas, más sabor.">
    <Surface><Text accessibilityRole="header" style={{ color: c.text, fontSize: 22, fontWeight: '600' }}>¿Qué cocino?</Text><Text style={{ color: c.muted, fontSize: 14 }}>Versión {Constants.expoConfig?.version ?? '0.1.0'}</Text></Surface>
    <Section title="Una cocina más simple"><Text style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>Encuentra recetas con lo que tienes, guarda tus favoritas y organiza lo que falta comprar. Las coincidencias comparan ingredientes, no cantidades.</Text></Section>
    <Section title="Disponible hoy"><Text style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>Despensa, recetas, favoritas, compras y ajustes. Cocina separada para invitado y cada cuenta. Google y eliminación de cuenta están disponibles en la app de desarrollo Android. También puedes cocinar sin cuenta.</Text></Section>
    <Section title="Respaldo y asistente"><Text style={{ color: c.muted, fontSize: 15, lineHeight: 24 }}>{firestoreReady ? 'Respaldo opcional en Firestore, con guardado local sin conexión y elección de copia si hay conflictos.' : 'El respaldo está preparado y pendiente de configurar Cloud Firestore.'} El asistente de cocina sigue en preparación.</Text></Section>
  </SettingsPage>;
}
