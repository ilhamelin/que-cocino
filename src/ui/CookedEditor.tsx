import { useState } from 'react';
import { TextInput } from 'react-native';
import { useKitchen } from '../state/KitchenProvider';
import { Action, Notice, Section, usePalette } from './common';
export function CookedEditor({ recipeId, name, servings }: { recipeId: string; name: string; servings: number }) {
  const { dispatch } = useKitchen(), c = usePalette();
  const [open, setOpen] = useState(false), [note, setNote] = useState(''), [message, setMessage] = useState('');
  return <Section title="Tu experiencia">
    <Action label="Ya lo cociné" secondary onPress={() => { setOpen(x => !x); setMessage(''); }} />
    {open ? <><TextInput accessibilityLabel="Nota sobre esta preparación" placeholder="¿Qué cambiarías la próxima vez?" placeholderTextColor={c.muted} maxLength={500} multiline value={note} onChangeText={setNote} style={{ color: c.text, minHeight: 90, padding: 14, borderColor: c.border, borderWidth: 1, borderRadius: 12 }} />
      <Action label="Registrar preparación de hoy" onPress={() => { try { dispatch({ type: 'cooked', record: { id: `cook_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`, recipeId, name, servings, cookedAt: new Date().toISOString(), note: note.trim() } }); setOpen(false); setNote(''); setMessage('Preparación guardada en tu historial.'); } catch { setMessage('No se pudo registrar la preparación. Reintenta.'); } }} /></> : null}
    {message ? <Notice>{message}</Notice> : null}
  </Section>;
}
