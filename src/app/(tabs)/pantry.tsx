import { router } from 'expo-router';
import { useState } from 'react';
import { CustomIngredients } from '../../ui/CustomIngredients';
import { ingredients } from '../../data/catalog';
import { QuantityEditor } from '../../ui/QuantityEditor';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Heading, IngredientPicker, Notice, Page, Search, Section } from '../../ui/common';

export default function PantryScreen() {
  const { state, dispatch } = useKitchen();
  const [query, setQuery] = useState('');
  return <Page><Heading eyebrow="LO QUE HAY EN CASA" title="Mi despensa" subtitle="Marca los ingredientes que tienes. Puedes cambiarlos cuando quieras." />
    <Search value={query} onChange={setQuery} placeholder="Buscar un ingrediente" />
    <Section title="Tus ingredientes" aside={`${state.pantry.length} elegido${state.pantry.length === 1 ? '' : 's'}`}><IngredientPicker selected={state.pantry} query={query} onToggle={id => dispatch({ type: 'toggle-ingredient', id })} /></Section>
    <Notice>El catálogo tiene {ingredients.length} ingredientes. Aceite, agua, sal y otros básicos se indican dentro de cada receta.</Notice>
    <CustomIngredients query={query} />
    <Section title="Cantidades disponibles">{state.pantry.map(id => <QuantityEditor key={id} id={id} />)}</Section>
    <Notice>Las cantidades son un registro manual. Las coincidencias comparan presencia; no descontamos ingredientes ni convertimos unidades automáticamente.</Notice>
    <Action label="Encontrar ideas" icon="restaurant-outline" onPress={() => router.navigate('/')} />
  </Page>;
}
