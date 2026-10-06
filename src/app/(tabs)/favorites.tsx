import { router } from 'expo-router';
import { recipes } from '../../data/catalog';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Empty, Heading, Page, RecipeCard, Section } from '../../ui/common';

export default function FavoritesScreen() {
  const { state } = useKitchen();
  const favorites = recipes.filter(recipe => state.favorites.includes(recipe.id));
  return <Page><Heading eyebrow="PARA REPETIR" title="Mis favoritas" subtitle="Tus recetas guardadas, siempre a mano." />
    <Section title="Mis recetas" aside={`${state.savedRecipes.length}/30`}>{state.savedRecipes.map(recipe => <Action key={recipe.id} label={`${recipe.name} · ${recipe.source}`} secondary onPress={() => router.push({ pathname: '/saved/[id]', params: { id: recipe.id } })} />)}{!state.savedRecipes.length ? <Action label="Explorar catálogo local" onPress={() => router.push('/explore')} /> : null}</Section>
    {favorites.length ? <Section title="Recetas guardadas" aside={`${favorites.length} favorita${favorites.length === 1 ? '' : 's'}`}>{favorites.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} pantry={state.pantry} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })} />)}</Section> : <Empty icon="heart-outline" title="Tu próximo plato favorito" description="Abre una receta y toca el corazón para guardarla."><Action label="Explorar recetas" onPress={() => router.navigate('/')} /></Empty>}
  </Page>;
}
