import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Notice, Page, Section, usePalette } from '../../ui/common';
import { AppText as Text } from '../../ui/AppText';
import { ServingsPicker } from '../../ui/ServingsPicker';
import { CookedEditor } from '../../ui/CookedEditor';
import { scaleAmount, validServings } from '../../domain/planning';
import { CookingMode } from '../../ui/CookingMode';
import { RecipeEditor } from '../../ui/RecipeEditor';
import { Confirmation } from '../../ui/Confirmation';
import { IngredientPicker } from '../../ui/common';
import type { IngredientId } from '../../data/catalog';
export default function SavedScreen() {
  const { id, servings: requestedServings } = useLocalSearchParams<{ id: string; servings?: string }>(), { state, dispatch } = useKitchen(), c = usePalette();
  const [edit, setEdit] = useState(false), [remove, setRemove] = useState(false), [error, setError] = useState('');
  const [shopping, setShopping] = useState<IngredientId[]>([]), [chooseShopping, setChooseShopping] = useState(false), [message, setMessage] = useState('');
  const recipe = state.savedRecipes.find(r => r.id === id);
  const [servings, setServings] = useState(validServings(Number(requestedServings)) ? Number(requestedServings) : recipe?.servings ?? 2);
  useEffect(() => { setServings(validServings(Number(requestedServings)) ? Number(requestedServings) : recipe?.servings ?? 2); }, [id, requestedServings, recipe?.servings]);
  if (!recipe) return <Page><Notice>Esta receta no está guardada en la cocina actual.</Notice><Action label="Ver Favoritas" onPress={() => router.replace('/favorites')} /></Page>;
  return <Page><Action label="Volver" secondary onPress={() => router.back()} /><Text accessibilityRole="header" style={{ color: c.text, fontSize: 28 }}>{recipe.name}</Text>
    <Notice>Origen: {recipe.source}. Receta guardada y editable. Revisa cantidades y preparación antes de cocinar.</Notice>
    {recipe.sourceUrl ? <Action label="Abrir fuente original" secondary onPress={() => { void Linking.openURL(recipe.sourceUrl).catch(() => setError('No se pudo abrir la fuente.')); }} /> : null}
    {error ? <Notice error>{error}</Notice> : null}
    {recipe.servings ? <ServingsPicker value={servings} onChange={setServings} /> : <Notice>Esta receta no indica porciones de base. Edítala para definirlas antes de recalcular cantidades.</Notice>}
    <Section title="Ingredientes">{recipe.ingredients.map((x, i) => <Text key={i} style={{ color: c.text }}>{scaleAmount(x, recipe.servings ?? 0, servings)}</Text>)}</Section>
    <Action label="Preparar lista de compras" secondary onPress={() => setChooseShopping(x => !x)} />
    {chooseShopping ? <Section title="Selecciona lo que te falta"><Notice>Revisa la receta y marca ingredientes del catálogo. Los ingredientes que aún no aparecen se conservan en la receta; no los añadimos automáticamente a Compras.</Notice><IngredientPicker selected={shopping} onToggle={id => setShopping(x => x.includes(id) ? x.filter(i => i !== id) : [...x, id])} /><Action label="Añadir seleccionados a Compras" disabled={!shopping.length} onPress={() => { dispatch({ type: 'add-shopping', ids: shopping }); setChooseShopping(false); setShopping([]); setMessage('Ingredientes añadidos a Compras.'); }} /></Section> : null}
    {message ? <Notice>{message}</Notice> : null}
    <CookedEditor key={`cooked:${recipe.id}`} recipeId={`saved:${recipe.id}`} name={recipe.name} servings={servings} />
    <CookingMode key={`${id}:${recipe.steps.join('|')}`} steps={recipe.steps} />
    <Section title="Preparación">{recipe.steps.map((x, i) => <Text key={i} style={{ color: c.text, lineHeight: 24 }}>{i + 1}. {x}</Text>)}</Section>
    <Action label="Editar receta" secondary onPress={() => setEdit(x => !x)} />
    {edit ? <RecipeEditor initial={recipe} onClose={() => setEdit(false)} /> : null}
    <Action label="Eliminar receta guardada" secondary onPress={() => setRemove(true)} />
    <Confirmation visible={remove} title="¿Eliminar receta?" message="Se quitará de esta cocina y de su respaldo al sincronizar." confirmLabel="Eliminar" onCancel={() => setRemove(false)} onConfirm={() => { dispatch({ type: 'delete-recipe', id: recipe.id }); router.replace('/favorites'); }} />
  </Page>;
}
