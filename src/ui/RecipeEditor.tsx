import { useState } from 'react';
import { TextInput } from 'react-native';
import { decodeSavedRecipe, type SavedRecipe } from '../domain/savedRecipes';
import { useKitchen } from '../state/KitchenProvider';
import { Action, Notice, Section, usePalette } from './common';
import { ServingsPicker } from './ServingsPicker';
import { AppText as Text } from './AppText';
export function RecipeEditor({ initial, onClose }: { initial: SavedRecipe; onClose: (saved: boolean) => void }) {
  const { dispatch } = useKitchen(), c = usePalette();
  const [name, setName] = useState(initial.name), [ingredients, setIngredients] = useState(initial.ingredients.join('\n')), [steps, setSteps] = useState(initial.steps.join('\n')), [error, setError] = useState('');
  const [servings, setServings] = useState(initial.servings ?? 2);
  const style = { color: c.text, backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 };
  return <Section title="Revisar y guardar receta">
    <Notice>Revisa las cantidades y divide la preparación en pasos, uno por línea. Gemini puede contener errores.</Notice>
    <Text style={{ color: c.text }}>Nombre</Text><TextInput accessibilityLabel="Nombre de receta" value={name} onChangeText={setName} maxLength={120} style={style} />
    <Text style={{ color: c.text }}>Porciones de la receta original (compruébalas antes de guardar)</Text><ServingsPicker value={servings} onChange={setServings} />
    <Text style={{ color: c.text }}>Ingredientes y cantidades (uno por línea)</Text><TextInput accessibilityLabel="Ingredientes de receta" value={ingredients} onChangeText={setIngredients} maxLength={6000} multiline style={[style, { minHeight: 100 }]} />
    <Text style={{ color: c.text }}>Preparación (un paso por línea)</Text><TextInput accessibilityLabel="Pasos de receta" value={steps} onChangeText={setSteps} maxLength={12000} multiline style={[style, { minHeight: 160 }]} />
    {error ? <Notice error>{error}</Notice> : null}
    <Action label="Guardar en mis recetas" onPress={() => { try { dispatch({ type: 'save-recipe', recipe: decodeSavedRecipe({ ...initial, name, servings, ingredients: ingredients.split('\n').filter(x => x.trim()), steps: steps.split('\n').filter(x => x.trim()) }) }); onClose(true); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar.'); } }} />
    <Action label="Cancelar" secondary onPress={() => onClose(false)} />
  </Section>;
}
