import { useState } from 'react';
import { router } from 'expo-router';
import { recipes } from '../data/catalog';
import { useKitchen } from '../state/KitchenProvider';
import { Action, Heading, Notice, Page, RecipeCard, Search, Section } from '../ui/common';
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function ExploreScreen() {
  const { state } = useKitchen(), [query, setQuery] = useState('');
  const matches = recipes.filter(recipe => normalize(recipe.name).includes(normalize(query.trim())));
  return <Page><Action label="Volver al inicio" secondary onPress={() => router.replace('/')} />
    <Heading eyebrow="EXPLORAR" title="Nuestro catálogo" subtitle="Recetas en español, disponibles sin conexión." />
    <Search value={query} onChange={setQuery} placeholder="Buscar una receta" />
    <Section title="Recetas" aside={`${matches.length} resultados`}>{matches.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} pantry={state.pantry} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })} />)}</Section>
    {!matches.length ? <Notice>No encontramos recetas con ese nombre. Prueba otra búsqueda.</Notice> : null}
    <Action label="Pedir una receta al asistente" secondary onPress={() => router.push('/settings/chat')} />
  </Page>;
}
