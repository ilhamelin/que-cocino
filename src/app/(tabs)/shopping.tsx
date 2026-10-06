import { AppText as Text } from '../../ui/AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ingredientById } from '../../data/catalog';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Empty, Heading, IconButton, Notice, Page, usePalette } from '../../ui/common';

export default function ShoppingScreen() {
  const { state, dispatch } = useKitchen(); const c = usePalette();
  const [message, setMessage] = useState('');
  const customShopping = state.customIngredients.filter(r => r.shopping);
  const pending = state.shopping.length - state.checked.length + customShopping.filter(r => !r.checked).length;
  return <Page><Heading eyebrow="TU PRÓXIMA COMPRA" title="Lo que falta" subtitle={`${pending} ingrediente${pending === 1 ? ' pendiente' : 's pendientes'}`} />
    {state.shopping.length || customShopping.length ? <>
      <View>{state.shopping.map(id => { const food = ingredientById(id); const checked = state.checked.includes(id); return <View key={id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border, gap: 8 }}>
        <Pressable accessibilityRole="checkbox" accessibilityLabel={food.name} accessibilityState={{ checked }} onPress={() => { dispatch({ type: 'toggle-checked', id }); setMessage(''); }} style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18, minHeight: 58, opacity: pressed ? .6 : 1 })}><Ionicons name={checked ? 'checkbox' : 'square-outline'} size={24} color={c.green} /><Text style={{ flexShrink: 1, fontSize: 16, color: checked ? c.muted : c.text, textDecorationLine: checked ? 'line-through' : 'none' }}>{food.emoji} {food.name}</Text></Pressable>
        <IconButton icon="trash-outline" label={`Quitar ${food.name} de compras`} onPress={() => { dispatch({ type: 'remove-shopping', id }); setMessage(''); }} />
      </View>; })}</View>
      {customShopping.map(r => <View key={r.id} style={{ gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border }}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: r.checked }} accessibilityLabel={r.name} onPress={() => dispatch({ type: 'custom-toggle', id: r.id, field: 'checked' })} style={{ padding: 14, minHeight: 50 }}><Text style={{ color: c.text }}>{r.checked ? '✓ ' : '○ '}{r.name}</Text></Pressable><Action label={`Quitar ${r.name} de compras`} secondary onPress={() => dispatch({ type: 'custom-toggle', id: r.id, field: 'shopping' })} /></View>)}
      <Action label="Llevar comprados a mi despensa" icon="checkmark" disabled={!state.checked.length && !customShopping.some(r => r.checked)} onPress={() => { dispatch({ type: 'purchase' }); setMessage('Tu despensa está actualizada. Puedes deshacer el traslado.'); }} />
      <Notice>Revisa las cantidades en la receta antes de comprar. Esta lista agrupa ingredientes sin duplicarlos.</Notice>
    </> : <Empty icon="basket-outline" title="Lista vacía, por ahora" description="En una receta, añade los ingredientes que te faltan."><Action label="Ver recetas" onPress={() => router.navigate('/')} /></Empty>}
    {message ? <Notice>{message}</Notice> : null}
  </Page>;
}
