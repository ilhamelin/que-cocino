import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { ingredientById, type IngredientId } from '../data/catalog';
import { quantityUnits, type PantryQuantity } from '../domain/savedRecipes';
import { useKitchen } from '../state/KitchenProvider';
import { Action, Notice, usePalette } from './common';
import { AppText as Text } from './AppText';
export function QuantityEditor({ id }: { id: IngredientId }) {
  const { state, dispatch } = useKitchen(), c = usePalette(), q = state.quantities[id];
  const [editing, setEditing] = useState(false), [amount, setAmount] = useState(q ? String(q.amount) : ''), [unit, setUnit] = useState<PantryQuantity['unit']>(q?.unit ?? 'unidades'), [error, setError] = useState('');
  return <View style={{ gap: 8 }}>
    <Text style={{ color: c.text }}>{ingredientById(id).name}: {q ? `${q.amount} ${q.unit}` : 'Cantidad sin indicar'}</Text>
    <Action secondary label={editing ? 'Cancelar edición' : `Cantidad de ${ingredientById(id).name}`} onPress={() => { setEditing(x => !x); setAmount(q ? String(q.amount) : ''); setUnit(q?.unit ?? 'unidades'); setError(''); }} />
    {editing ? <>
      <TextInput accessibilityLabel={`Cantidad de ${ingredientById(id).name}`} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} maxLength={10} style={{ color: c.text, padding: 14, borderColor: c.border, borderWidth: 1, borderRadius: 12 }} />
      {quantityUnits.map(u => <Action key={u} secondary label={`${u === unit ? '✓ ' : ''}${u}`} onPress={() => setUnit(u)} />)}
      {error ? <Notice error>{error}</Notice> : null}
      <Action label="Guardar cantidad" onPress={() => { try { dispatch({ type: 'quantity', id, quantity: { amount: Number(amount.replace(',', '.')), unit } }); setEditing(false); } catch { setError('Ingresa una cantidad mayor que cero y hasta 100.000.'); } }} />
      <Action secondary label="Quitar cantidad" onPress={() => { dispatch({ type: 'quantity', id, quantity: null }); setEditing(false); }} />
    </> : null}
  </View>;
}
