import { useState } from 'react';
import { router } from 'expo-router';
import { TextInput } from 'react-native';
import { useKitchen } from '../state/KitchenProvider';
import { recipeOptions, type CookingRecord } from '../domain/planning';
import { Action, Heading, Notice, Page, Section, usePalette } from '../ui/common';
import { AppText as Text } from '../ui/AppText';
import { Confirmation } from '../ui/Confirmation';
export default function HistoryScreen() {
  const { state } = useKitchen();
  return <Page><Action label="Volver al inicio" secondary onPress={() => router.replace('/')} /><Heading eyebrow="PARA LA PRÓXIMA VEZ" title="Lo que cociné" subtitle="Tus últimas 100 preparaciones y notas, separadas por cocina." />
    {!state.cookHistory.length ? <Notice>Abre una receta y pulsa Ya lo cociné para registrar tu primera preparación.</Notice> : null}
    {state.cookHistory.map(r => <HistoryEntry key={`${r.id}:${r.note}`} record={r} />)}
  </Page>;
}
function HistoryEntry({ record: r }: { record: CookingRecord }) {
  const c = usePalette(), { state, dispatch } = useKitchen();
  const [note, setNote] = useState(r.note), [edit, setEdit] = useState(false), [remove, setRemove] = useState(false);
  const available = recipeOptions(state).some(recipe => recipe.id === r.recipeId);
  return <Section title={r.name}><Text style={{ color: c.muted }}>{new Date(r.cookedAt).toLocaleString('es-CL')} · {r.servings} porciones</Text><Text style={{ color: c.text }}>{r.note || 'Sin notas.'}</Text>
    {available ? <Action label="Volver a la receta" secondary onPress={() => { const [source, ...id] = r.recipeId.split(':'); if (source === 'local') router.push({ pathname: '/recipe/[id]', params: { id: id.join(':') } }); else router.push({ pathname: '/saved/[id]', params: { id: id.join(':') } }); }} /> : <Notice>La receta fue eliminada; conservamos tu registro.</Notice>}
    <Action label="Editar nota" secondary onPress={() => setEdit(x => !x)} />
    {edit ? <><TextInput accessibilityLabel={`Nota de ${r.name}`} value={note} onChangeText={setNote} maxLength={500} multiline style={{ color: c.text, borderWidth: 1, borderColor: c.border, padding: 14, minHeight: 90 }} /><Action label="Guardar nota" onPress={() => { dispatch({ type: 'history-note', id: r.id, note: note.trim() }); setEdit(false); }} /></> : null}
    <Action label="Eliminar registro" secondary onPress={() => setRemove(true)} />
    <Confirmation visible={remove} title="¿Eliminar preparación?" message="Se borrará este registro y su nota de tu historial." confirmLabel="Eliminar" onCancel={() => setRemove(false)} onConfirm={() => dispatch({ type: 'delete-history', id: r.id })} />
  </Section>;
}
