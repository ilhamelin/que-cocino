import { useState } from 'react';
import { router } from 'expo-router';
import { useKitchen } from '../state/KitchenProvider';
import { normalizeName, recipeOptions, shoppingForPlan, weekDates } from '../domain/planning';
import { Action, Heading, Notice, Page, Search, Section, usePalette } from '../ui/common';
import { AppText as Text } from '../ui/AppText';
import { ServingsPicker } from '../ui/ServingsPicker';
export default function PlanScreen() {
  const { state, dispatch } = useKitchen(), c = usePalette();
  const [offset, setOffset] = useState(0), [date, setDate] = useState<string | null>(null), [selected, setSelected] = useState(''), [servings, setServings] = useState(2), [query, setQuery] = useState(''), [message, setMessage] = useState('');
  const dates = weekDates(offset), options = recipeOptions(state), shopping = shoppingForPlan(state, dates);
  const matches = options.filter(r => normalizeName(r.name).includes(normalizeName(query)));
  return <Page><Action label="Volver al inicio" secondary onPress={() => router.replace('/')} /><Heading eyebrow="ORGANIZAR" title="Mi plan semanal" subtitle="Un plato principal por día, en la cocina de esta cuenta." />
    <Text style={{ color: c.text }}>{dates[0]} al {dates[6]}</Text>
    <Action label="Semana anterior" secondary onPress={() => { setOffset(x => x - 1); setDate(null); }} /><Action label="Semana siguiente" secondary onPress={() => { setOffset(x => x + 1); setDate(null); }} />
    {dates.map(day => { const slot = state.mealPlan.find(r => r.date === day), recipe = options.find(r => r.id === slot?.recipeId); return <Section key={day} title={new Date(`${day}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })}>
      <Text style={{ color: c.text }}>{recipe ? `${recipe.name} · ${slot!.servings} porciones` : 'Sin plato elegido'}</Text>
      {slot && recipe ? <Action label="Ver receta con estas porciones" secondary onPress={() => { if (slot.recipeId.startsWith('local:')) router.push({ pathname: '/recipe/[id]', params: { id: slot.recipeId.slice(6), servings: String(slot.servings) } }); else router.push({ pathname: '/saved/[id]', params: { id: slot.recipeId.slice(6), servings: String(slot.servings) } }); }} /> : null}
      <Action label={recipe ? 'Cambiar plato' : 'Elegir plato'} secondary onPress={() => { setDate(day); setSelected(slot?.recipeId ?? ''); setServings(slot?.servings ?? 2); setQuery(''); setMessage(''); }} />
      {slot ? <Action label="Quitar del plan" secondary onPress={() => dispatch({ type: 'remove-plan', date: day })} /> : null}
      {date === day ? <><Search value={query} onChange={setQuery} placeholder="Buscar en catálogo y recetas propias" /><ServingsPicker value={servings} onChange={setServings} />
        {matches.slice(0, 12).map(r => <Action key={r.id} label={`${selected === r.id ? '✓ ' : ''}${r.name}`} secondary onPress={() => setSelected(r.id)} />)}
        {matches.length > 12 ? <Notice>Escribe parte del nombre para ver otras recetas.</Notice> : !matches.length ? <Notice>No hay recetas con ese nombre.</Notice> : null}
        <Action label="Guardar plato para este día" disabled={!selected} onPress={() => { try { dispatch({ type: 'plan', slot: { date: day, recipeId: selected, servings } }); setDate(null); setMessage('Plan guardado.'); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'No se pudo guardar el plan.'); } }} /><Action label="Cancelar elección" secondary onPress={() => setDate(null)} /></> : null}
    </Section>; })}
    <Section title="Compras de esta semana"><Notice>Reunimos ingredientes faltantes sin duplicarlos. La lista compara presencia; revisa las cantidades según las porciones antes de comprar.</Notice>
      {shopping.unmatched.length ? <Notice>Ingredientes de recetas propias que debes revisar: {shopping.unmatched.join('; ')}. Puedes crearlos en Despensa y volver a reunir las compras.</Notice> : null}
      <Action label="Añadir faltantes de la semana a Compras" disabled={!shopping.ids.length && !shopping.customIds.length} onPress={() => { dispatch({ type: 'plan-shopping', ids: shopping.ids, customIds: shopping.customIds }); setMessage('Faltantes añadidos sin duplicados.'); }} />
      <Action label="Ver Compras" secondary onPress={() => router.push('/shopping')} />
    </Section>{message ? <Notice>{message}</Notice> : null}
  </Page>;
}
