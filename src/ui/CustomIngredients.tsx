import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { normalizeName, type CustomIngredient } from '../domain/planning';
import { quantityUnits, type PantryQuantity } from '../domain/savedRecipes';
import { useKitchen } from '../state/KitchenProvider';
import { Action, Notice, Section, usePalette } from './common';
import { AppText as Text } from './AppText';
import { Confirmation } from './Confirmation';
export function CustomIngredients({ query = '' }: { query?: string }) {
  const { state, dispatch } = useKitchen(), c = usePalette();
  const [name, setName] = useState(''), [error, setError] = useState('');
  return <Section title="Tus ingredientes personalizados" aside={`${state.customIngredients.length}/100`}>
    <TextInput accessibilityLabel="Nombre de ingrediente nuevo" placeholder="Por ejemplo: tofu" placeholderTextColor={c.muted} value={name} onChangeText={setName} maxLength={60} style={{ color: c.text, padding: 14, borderColor: c.border, borderWidth: 1, borderRadius: 12 }} />
    <Action label="Añadir ingrediente a mi despensa" disabled={!name.trim()} onPress={() => { try { dispatch({ type: 'save-custom', ingredient: { id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`, name, pantry: true, shopping: false, checked: false, quantity: null } }); setName(''); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo añadir.'); } }} />
    {error ? <Notice error>{error}</Notice> : null}
    {state.customIngredients.filter(r => normalizeName(r.name).includes(normalizeName(query))).map(r => <CustomRow key={r.id} ingredient={r} />)}
  </Section>;
}
function CustomRow({ ingredient: r }: { ingredient: CustomIngredient }) {
  const c = usePalette(), { dispatch } = useKitchen();
  const [edit, setEdit] = useState(false), [amount, setAmount] = useState(''), [unit, setUnit] = useState<PantryQuantity['unit']>('unidades'), [remove, setRemove] = useState(false), [error, setError] = useState('');
  return <View style={{ gap: 8, padding: 14, borderColor: c.border, borderWidth: 1, borderRadius: 14 }}>
    <Text style={{ color: c.text, fontSize: 18 }}>{r.name}{r.quantity ? ` · ${r.quantity.amount} ${r.quantity.unit}` : ''}</Text>
    <Action label={r.pantry ? '✓ En mi despensa' : 'Añadir a mi despensa'} secondary onPress={() => dispatch({ type: 'custom-toggle', id: r.id, field: 'pantry' })} />
    <Action label={r.shopping ? 'Quitar de Compras' : 'Añadir a Compras'} secondary onPress={() => dispatch({ type: 'custom-toggle', id: r.id, field: 'shopping' })} />
    <Action label={edit ? 'Cerrar cantidad' : 'Cambiar cantidad'} secondary onPress={() => { setAmount(r.quantity ? String(r.quantity.amount) : ''); setUnit(r.quantity?.unit ?? 'unidades'); setEdit(x => !x); }} />
    {edit ? <><TextInput accessibilityLabel={`Cantidad de ${r.name}`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" maxLength={10} style={{ color: c.text, padding: 14, borderWidth: 1, borderColor: c.border }} />
      {quantityUnits.map(u => <Action key={u} secondary label={`${unit === u ? '✓ ' : ''}${u}`} onPress={() => setUnit(u)} />)}
      <Action label="Guardar cantidad" onPress={() => { try { dispatch({ type: 'custom-quantity', id: r.id, quantity: { amount: Number(amount.replace(',', '.')), unit } }); setEdit(false); setError(''); } catch { setError('Ingresa una cantidad positiva hasta 100.000.'); } }} />
      <Action label="Quitar cantidad" secondary onPress={() => { dispatch({ type: 'custom-quantity', id: r.id, quantity: null }); setEdit(false); }} /></> : null}
    {error ? <Notice error>{error}</Notice> : null}
    <Action label="Eliminar ingrediente personalizado" secondary onPress={() => setRemove(true)} />
    <Confirmation visible={remove} title={`¿Eliminar ${r.name}?`} message="Se quitará de tu despensa y compras. Puedes deshacer el cambio mientras esta sesión siga abierta." confirmLabel="Eliminar" onCancel={() => setRemove(false)} onConfirm={() => { dispatch({ type: 'delete-custom', id: r.id }); setRemove(false); }} />
  </View>;
}
