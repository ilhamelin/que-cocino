import { AppText as Text } from '../../ui/AppText';
import { Notice, Section, usePalette } from '../../ui/common';
import { SettingsPage } from '../../ui/settings';

const questions = [
  ['¿Cómo encuentro recetas?', 'Marca los ingredientes disponibles en Despensa. Inicio ordena las recetas por menos ingredientes faltantes y luego por tiempo.'],
  ['¿Qué significa “Tienes todos los ingredientes”?', 'Tienes marcados los ingredientes del catálogo. Revisa las cantidades y los básicos —como aceite y sal— dentro de la receta.'],
  ['¿Cómo guardo una receta?', 'Abre la receta y toca el corazón. Vuelve a tocarlo para quitarla de Favoritas.'],
  ['¿Cómo paso las compras a la despensa?', 'Marca los ingredientes comprados en Compras y toca “Llevar comprados a mi despensa”. Se retiran de Compras sin duplicarlos en Despensa.'],
  ['¿Necesito internet?', 'La cocina local funciona sin conexión. Google y el respaldo requieren internet. Durante el desarrollo, la app instalada y Expo Go cargan el código desde el computador.'],
  ['¿Qué pasa al iniciar o cerrar sesión?', 'Invitado y cada cuenta tienen cocinas separadas. Al salir vuelves a Invitado. Puedes copiar su cocina desde Perfil con confirmación; el original se conserva.'],
  ['¿Cómo respaldo mi cocina?', 'Cuando Firestore esté configurado, activa el respaldo desde Ajustes. Si hay cambios distintos en dos dispositivos, la app te pedirá elegir la copia completa que deseas conservar.'],
] as const;

export default function HelpScreen() {
  const c = usePalette();
  return <SettingsPage title="Ayuda" subtitle="Respuestas para empezar a cocinar.">
    {questions.map(([question, answer]) => <Section key={question} title={question}><Text style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>{answer}</Text></Section>)}
    <Notice>El chatbot para dudas de cocina y de la app está en preparación. Estas respuestas son una guía de uso, no una conversación con IA.</Notice>
  </SettingsPage>;
}
