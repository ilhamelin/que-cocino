import { AppText as Text } from '../../ui/AppText';
import { Action, Section, usePalette } from '../../ui/common';
import { router } from 'expo-router';
import { SettingsPage } from '../../ui/settings';

const questions = [
  ['¿Cómo organizo mi semana?', 'Desde Inicio abre Organizar mi semana, elige un plato y porciones para cada día y reúne los faltantes en Compras. Es un plato principal por día. Revisa cantidades antes de comprar.'],
  ['¿Cómo añado un alimento que no aparece?', 'En Despensa, crea un ingrediente personalizado. Puedes indicar su cantidad, marcarlo disponible o añadirlo a Compras. Pertenece solo a esta cocina.'],
  ['¿Cómo deshago un error?', 'El botón Deshacer último cambio permite revertir hasta cinco cambios en esta sesión, incluidas eliminaciones y compras trasladadas. Se borra al cambiar de cuenta, cerrar la app o descargar otra copia del respaldo. No deshace eliminar la cuenta.'],
  ['¿Cómo ajusto las porciones?', 'En una receta usa Más o Menos porciones. Recalculamos cantidades explícitas, incluidas fracciones; no modificamos tiempos ni básicos. Para recetas propias, define primero sus porciones originales.'],
  ['¿Dónde quedan mis notas?', 'Pulsa Ya lo cociné dentro de una receta y añade tu nota. En Inicio, Ver lo que cociné muestra las últimas 100 preparaciones. Puedes editar notas o eliminar registros.'],
  ['¿Cómo registro cantidades?', 'En Despensa marca un ingrediente y abre su cantidad. Puedes indicar unidades, gramos, kilos, mililitros, litros o tazas. Es un registro manual: cocinar no descuenta existencias.'],
  ['¿Cómo guardo una receta del asistente?', 'Pulsa Revisar como receta para guardar en su respuesta. Revisa el nombre, ingredientes y pasos; completa lo que falte y guarda. Aparecerá en Favoritas, dentro de Mis recetas, solo en esta cocina.'],
  ['¿Cómo uso el modo cocina?', 'Abre una receta y pulsa Cocinar paso a paso. Puedes avanzar y retroceder, y poner un temporizador. Al salir de la receta se cancela; no hay alarmas con la app cerrada.'],
  ['¿Dónde encuentro más recetas?', 'En Inicio, pulsa Explorar catálogo local para buscar recetas en español sin conexión. También puedes pedir una receta a Gemini y revisarla antes de guardarla. El asistente necesita internet y tiene cupos.'],
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
    <Action label="Abrir asistente de cocina" onPress={() => router.push('/settings/chat')} />
  </SettingsPage>;
}
