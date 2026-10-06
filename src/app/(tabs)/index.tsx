import { AppText as Text } from '../../ui/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { missingIngredients, rankRecipes } from '../../domain/kitchen';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Empty, Heading, Page, RecipeCard, Section, Surface, ingredientMatchLabel, usePalette } from '../../ui/common';

export default function HomeScreen() {
  const { state, dispatch } = useKitchen();
  const [quick, setQuick] = useState(false);
  const c = usePalette();
  const ideas = rankRecipes(state.pantry, quick);
  const hero = ideas[0];
  const otherIdeas = ideas.filter(recipe => !state.pantry.length || recipe.id !== hero?.id);
  const open = (id: string) => router.push({ pathname: '/recipe/[id]', params: { id } });
  return <Page><Heading eyebrow="MENOS VUELTAS, MÁS SABOR" title={'Una buena idea\npara hoy.'} subtitle="Cocina con lo que ya tienes." />
    {state.pantry.length && hero ? <Surface>
      <Text style={{ fontSize: 11, color: c.green, letterSpacing: 1.4 }}>TU MEJOR COINCIDENCIA</Text>
      <Text accessible={false} maxFontSizeMultiplier={1} style={{ fontSize: 76, textAlign: 'center' }}>{hero.emoji}</Text>
      <Text accessibilityRole="header" style={{ fontSize: 25, fontWeight: '600', color: c.text }}>{hero.name}</Text>
      <Text style={{ fontSize: 13, color: c.muted }}>{hero.minutes} min · {ingredientMatchLabel(missingIngredients(hero, state.pantry).length)}</Text>
      <Action label="Vamos a cocinar" icon="arrow-forward" onPress={() => open(hero.id)} />
    </Surface> : !state.pantry.length ? <Empty icon="leaf-outline" title="Todo empieza en tu despensa" description="Marca lo que tienes en casa y te proponemos recetas del catálogo.">
      <Action label="Elegir mis ingredientes" onPress={() => router.push('/pantry')} />
      <Action secondary label="Probar con ingredientes de ejemplo" onPress={() => dispatch({ type: 'sample' })} />
    </Empty> : null}
    <Action label="Organizar mi semana" secondary onPress={() => router.push('/plan')} />
    <Action label="Ver lo que cociné" secondary onPress={() => router.push('/history')} />
    <Action label="Explorar catálogo local" secondary onPress={() => router.push('/explore')} />
    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
      {[false, true].map(value => <Pressable key={String(value)} accessibilityRole="button" accessibilityState={{ selected: quick === value }} onPress={() => setQuick(value)} style={({ pressed }) => ({ padding: 12, maxWidth: '100%', minHeight: 48, borderRadius: 13, backgroundColor: quick === value ? c.green : c.soft, opacity: pressed ? .7 : 1 })}><Text style={{ color: quick === value ? c.onGreen : c.green, fontSize: 13, flexShrink: 1 }}>{value ? 'Hasta 15 min' : 'Todas las ideas'}</Text></Pressable>)}
    </View>
    <Section title={state.pantry.length && hero ? 'Más ideas para tu despensa' : 'Ideas para tu despensa'} aside={`${otherIdeas.length} receta${otherIdeas.length === 1 ? '' : 's'}`}>
      {otherIdeas.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} pantry={state.pantry} onPress={() => open(recipe.id)} />)}
      {!ideas.length ? <Empty icon="time-outline" title="Sin recetas con este filtro" description="Prueba con todas las ideas para ver más opciones."><Action label="Mostrar todas las ideas" onPress={() => setQuick(false)} /></Empty> : null}
    </Section>
    <Text style={{ color: c.muted, fontSize: 12, lineHeight: 19 }}>Las coincidencias comparan ingredientes, no cantidades. Revisa también los básicos de cada receta.</Text>
  </Page>;
}
