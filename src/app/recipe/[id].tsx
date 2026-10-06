import { AppText as Text } from '../../ui/AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ServingsPicker } from '../../ui/ServingsPicker';
import { CookedEditor } from '../../ui/CookedEditor';
import { scaleAmount, validServings } from '../../domain/planning';
import { CookingMode } from '../../ui/CookingMode';
import { View, useWindowDimensions } from 'react-native';
import { ingredientById, recipes } from '../../data/catalog';
import { missingIngredients } from '../../domain/kitchen';
import { useKitchen } from '../../state/KitchenProvider';
import { Action, Empty, IconButton, Notice, Page, Section, usePalette, useReadingScale } from '../../ui/common';

export default function RecipeScreen() {
  const { id, servings: requestedServings } = useLocalSearchParams<{ id: string; servings?: string }>();
  const { state, dispatch } = useKitchen(); const c = usePalette();
  const [message, setMessage] = useState('');
  const [servings, setServings] = useState(validServings(Number(requestedServings)) ? Number(requestedServings) : 2);
  const { width } = useWindowDimensions();
  const fontScale = useReadingScale();
  const stacked = fontScale >= 1.3 || width < 360;
  const recipe = recipes.find(item => item.id === id);
  useEffect(() => { setServings(validServings(Number(requestedServings)) ? Number(requestedServings) : recipe?.servings ?? 2); }, [id, requestedServings, recipe?.servings]);
  const back = () => router.canGoBack() ? router.back() : router.replace('/');
  if (!recipe) return <Page><Empty icon="restaurant-outline" title="Receta no encontrada" description="Esta receta no forma parte del catálogo."><Action label="Volver al inicio" onPress={() => router.replace('/')} /></Empty></Page>;
  const missing = missingIngredients(recipe, state.pantry);
  const notAdded = missing.filter(ingredient => !state.shopping.includes(ingredient));
  const favorite = state.favorites.includes(recipe.id);
  return <Page><View style={{ alignItems: 'flex-start' }}><IconButton icon="arrow-back" label="Volver" onPress={back} /></View>
    <View style={{ backgroundColor: c.peach, borderRadius: 24, padding: 28, alignItems: 'center' }}><Text accessible={false} maxFontSizeMultiplier={1} style={{ fontSize: 86 }}>{recipe.emoji}</Text></View>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}><Text accessibilityRole="header" style={{ flex: 1, fontSize: 29, fontWeight: '700', letterSpacing: -.7, color: c.text }}>{recipe.name}</Text><IconButton icon={favorite ? 'heart' : 'heart-outline'} selected={favorite} label={favorite ? 'Quitar de favoritas' : 'Guardar en favoritas'} onPress={() => dispatch({ type: 'toggle-favorite', id: recipe.id })} /></View>
    <Text style={{ color: c.muted, fontSize: 14 }}>{recipe.minutes} min · {recipe.servings} porciones de base · {recipe.vegetarian ? 'Vegetariana' : 'No vegetariana'}</Text>
    <ServingsPicker value={servings} onChange={setServings} />
    <Notice>Las cantidades explícitas se ajustan proporcionalmente. Los básicos y tiempos de cocción no cambian; revisa fracciones de unidades.</Notice>
    <Section title="Ingredientes">{recipe.ingredients.map(item => { const have = state.pantry.includes(item.id); return <View accessible accessibilityLabel={`${ingredientById(item.id).name}: ${scaleAmount(item.amount, recipe.servings, servings)}. ${have ? 'Lo tienes' : 'Te falta'}`} key={item.id} style={{ flexDirection: stacked ? 'column' : 'row', alignItems: stacked ? 'flex-start' : 'center', gap: 9, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }}><Ionicons accessible={false} name={have ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={have ? c.green : c.muted} /><Text style={{ flex: stacked ? undefined : 1, color: c.text, fontSize: 14 }}>{scaleAmount(item.amount, recipe.servings, servings)}</Text><Text style={{ color: c.muted, fontSize: 12 }}>{have ? 'Lo tienes' : 'Te falta'}</Text></View>; })}<Text style={{ color: c.muted, fontSize: 13 }}>Básicos: {recipe.basics}</Text></Section>
    {missing.length ? <><Action label={notAdded.length ? 'Añadir lo que falta a compras' : 'Ver lista de compras'} icon="basket-outline" onPress={() => {
      if (!notAdded.length) { router.push('/shopping'); return; }
      dispatch({ type: 'add-shopping', ids: missing }); setMessage(`${notAdded.length} ingrediente${notAdded.length > 1 ? 's añadidos' : ' añadido'} a Compras.`);
    }} /><Action secondary label="Cambiar mi despensa" onPress={() => router.push('/pantry')} /></> : <Notice>✓ Tienes todos los ingredientes del catálogo. Comprueba las cantidades y los básicos.</Notice>}
    {message ? <Notice>{message}</Notice> : null}
    <CookedEditor key={`cooked:${recipe.id}`} recipeId={`local:${recipe.id}`} name={recipe.name} servings={servings} />
    <CookingMode key={recipe.id} steps={recipe.steps} />
    <Section title="Vamos a cocinar">{recipe.steps.map((step, index) => <View accessible accessibilityLabel={`Paso ${index + 1}. ${step}`} key={step} style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}><View style={{ minWidth: 28, minHeight: 28, alignSelf: 'flex-start', padding: 4, borderRadius: 14, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.green, fontWeight: '600' }}>{index + 1}</Text></View><Text style={{ flex: 1, color: c.text, lineHeight: 23, fontSize: 14 }}>{step}</Text></View>)}</Section>
  </Page>;
}
