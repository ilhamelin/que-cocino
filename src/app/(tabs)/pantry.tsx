import { router } from 'expo-router';
import { useState } from 'react';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Heading, IngredientPicker, Notice, Page, Search, Section } from '../../ui/common';

export default function PantryScreen() {
  const { state, dispatch } = useKitchen();
  const [query, setQuery] = useState('');
  return <Page><Heading eyebrow="LO QUE HAY EN CASA" title="Mi despensa" subtitle="Marca los ingredientes que tienes. Puedes cambiarlos cuando quieras." />
    <Search value={query} onChange={setQuery} placeholder="Buscar un ingrediente" />
    <Section title="Tus ingredientes" aside={`${state.pantry.length} elegido${state.pantry.length === 1 ? '' : 's'}`}><IngredientPicker selected={state.pantry} query={query} onToggle={id => dispatch({ type: 'toggle-ingredient', id })} /></Section>
    <Notice>El catálogo inicial tiene 12 ingredientes. Aceite, agua, sal y otros básicos se indican dentro de cada receta.</Notice>
    <Action label="Encontrar ideas" icon="restaurant-outline" onPress={() => router.navigate('/')} />
  </Page>;
}
