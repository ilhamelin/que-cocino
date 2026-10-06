import { ingredients, recipes, type IngredientId, type Recipe } from '../data/catalog';
import { decodeExtras, type CustomIngredient, type MealPlan, type CookingRecord } from './planning';
import { decodeSavedRecipe, quantityUnits, type PantryQuantity, type SavedRecipe } from './savedRecipes';

export type KitchenState = {
  version: 3;
  customIngredients: CustomIngredient[];
  mealPlan: MealPlan[];
  cookHistory: CookingRecord[];
  quantities: Partial<Record<IngredientId, PantryQuantity>>;
  savedRecipes: SavedRecipe[];
  pantry: IngredientId[];
  favorites: string[];
  shopping: IngredientId[];
  checked: IngredientId[];
};
export const initialState: KitchenState = { version: 3, customIngredients: [], mealPlan: [], cookHistory: [], pantry: [], favorites: [], shopping: [], checked: [], quantities: {}, savedRecipes: [] };
export type KitchenAction =
  | { type: 'hydrate'; state: KitchenState }
  | { type: 'save-custom'; ingredient: CustomIngredient }
  | { type: 'custom-toggle'; id: string; field: 'pantry' | 'shopping' | 'checked' }
  | { type: 'custom-quantity'; id: string; quantity: PantryQuantity | null }
  | { type: 'delete-custom'; id: string }
  | { type: 'plan'; slot: MealPlan }
  | { type: 'remove-plan'; date: string }
  | { type: 'plan-shopping'; ids: IngredientId[]; customIds: string[] }
  | { type: 'cooked'; record: CookingRecord }
  | { type: 'history-note'; id: string; note: string }
  | { type: 'delete-history'; id: string }
  | { type: 'quantity'; id: IngredientId; quantity: PantryQuantity | null }
  | { type: 'save-recipe'; recipe: SavedRecipe }
  | { type: 'delete-recipe'; id: string }
  | { type: 'toggle-ingredient'; id: IngredientId }
  | { type: 'toggle-favorite'; id: string }
  | { type: 'add-shopping'; ids: IngredientId[] }
  | { type: 'toggle-checked'; id: IngredientId }
  | { type: 'remove-shopping'; id: IngredientId }
  | { type: 'purchase' }
  | { type: 'sample' };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}
export function kitchenReducer(state: KitchenState, action: KitchenAction): KitchenState {
  switch (action.type) {
    case 'hydrate': return decodeState(JSON.stringify(action.state));
    case 'save-custom': return decodeState(JSON.stringify({ ...state, customIngredients: [...state.customIngredients.filter(r => r.id !== action.ingredient.id), action.ingredient] }));
    case 'custom-toggle': return decodeState(JSON.stringify({ ...state, customIngredients: state.customIngredients.map(r => {
      if (r.id !== action.id) return r;
      if (action.field === 'checked') return r.shopping ? { ...r, checked: !r.checked } : r;
      if (action.field === 'pantry') return { ...r, pantry: !r.pantry, quantity: r.pantry ? null : r.quantity };
      return { ...r, shopping: !r.shopping, checked: false };
    }) }));
    case 'custom-quantity': return decodeState(JSON.stringify({ ...state, customIngredients: state.customIngredients.map(r => r.id === action.id ? { ...r, quantity: action.quantity, pantry: action.quantity ? true : r.pantry } : r) }));
    case 'delete-custom': return { ...state, customIngredients: state.customIngredients.filter(r => r.id !== action.id) };
    case 'plan': return decodeState(JSON.stringify({ ...state, mealPlan: [...state.mealPlan.filter(r => r.date !== action.slot.date), action.slot].sort((a,b) => a.date.localeCompare(b.date)) }));
    case 'remove-plan': return { ...state, mealPlan: state.mealPlan.filter(r => r.date !== action.date) };
    case 'plan-shopping': return decodeState(JSON.stringify({ ...state, shopping: [...new Set([...state.shopping, ...action.ids])], customIngredients: state.customIngredients.map(r => action.customIds.includes(r.id) ? { ...r, shopping: true } : r) }));
    case 'cooked': return decodeState(JSON.stringify({ ...state, cookHistory: [action.record, ...state.cookHistory].slice(0, 100) }));
    case 'history-note': return decodeState(JSON.stringify({ ...state, cookHistory: state.cookHistory.map(r => r.id === action.id ? { ...r, note: action.note } : r) }));
    case 'delete-history': return { ...state, cookHistory: state.cookHistory.filter(r => r.id !== action.id) };
    case 'quantity': {
      const quantities = { ...state.quantities };
      if (action.quantity) quantities[action.id] = action.quantity; else delete quantities[action.id];
      return decodeState(JSON.stringify({ ...state, quantities, pantry: action.quantity ? [...new Set([...state.pantry, action.id])] : state.pantry }));
    }
    case 'save-recipe': {
      const recipe = decodeSavedRecipe(action.recipe);
      if (state.savedRecipes.length >= 30 && !state.savedRecipes.some(r => r.id === recipe.id)) throw new Error('Puedes guardar hasta 30 recetas.');
      return decodeState(JSON.stringify({ ...state, savedRecipes: [...state.savedRecipes.filter(r => r.id !== recipe.id), recipe] }));
    }
    case 'delete-recipe': return { ...state, savedRecipes: state.savedRecipes.filter(r => r.id !== action.id), mealPlan: state.mealPlan.filter(r => r.recipeId !== `saved:${action.id}`) };
    case 'toggle-ingredient': {
      const quantities = { ...state.quantities }; delete quantities[action.id];
      return { ...state, pantry: toggle(state.pantry, action.id), quantities };
    }
    case 'toggle-favorite': return { ...state, favorites: toggle(state.favorites, action.id) };
    case 'sample': return { ...state, pantry: [...new Set<IngredientId>([...state.pantry, 'huevos', 'arroz', 'tomate', 'espinaca'])] };
    case 'add-shopping': return { ...state, shopping: [...new Set([...state.shopping, ...action.ids])] };
    case 'toggle-checked': return state.shopping.includes(action.id) ? { ...state, checked: toggle(state.checked, action.id) } : state;
    case 'remove-shopping': return { ...state, shopping: state.shopping.filter(id => id !== action.id), checked: state.checked.filter(id => id !== action.id) };
    case 'purchase': return { ...state, customIngredients: state.customIngredients.map(r => r.checked ? { ...r, pantry: true, shopping: false, checked: false } : r), pantry: [...new Set([...state.pantry, ...state.checked])], shopping: state.shopping.filter(id => !state.checked.includes(id)), checked: [] };
  }
}
export function missingIngredients(recipe: Recipe, pantry: IngredientId[]): IngredientId[] {
  return recipe.ingredients.map(item => item.id).filter(id => !pantry.includes(id));
}
export function rankRecipes(pantry: IngredientId[], quick = false): Recipe[] {
  return recipes.filter(recipe => !quick || recipe.minutes <= 15).sort((a, b) =>
    missingIngredients(a, pantry).length - missingIngredients(b, pantry).length || a.minutes - b.minutes);
}

// Validate persisted data before using it, and keep a version for future migrations.
export function decodeState(raw: string | null): KitchenState {
  if (raw === null) return initialState;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('version' in value) || ![1, 2, 3].includes(value.version as number)) {
    throw new Error('Formato de datos no compatible.');
  }
  const data = value as Record<string, unknown>;
  const ingredientIds = new Set<string>(ingredients.map(item => item.id));
  const recipeIds = new Set(recipes.map(item => item.id));
  function ids(key: string, valid: Set<string>): string[] {
    const list = data[key];
    if (!Array.isArray(list) || list.some(item => typeof item !== 'string' || !valid.has(item))) {
      throw new Error(`Datos inválidos: ${key}.`);
    }
    return [...new Set(list)] as string[];
  }
  const pantry = ids('pantry', ingredientIds) as IngredientId[];
  const shopping = ids('shopping', ingredientIds) as IngredientId[];
  const checked = (ids('checked', ingredientIds) as IngredientId[]).filter(id => shopping.includes(id));
  const quantities: KitchenState['quantities'] = {};
  let savedRecipes: SavedRecipe[] = [];
  if (data.version === 2 || data.version === 3) {
    if (!data.quantities || typeof data.quantities !== 'object' || Array.isArray(data.quantities) || !Array.isArray(data.savedRecipes) || data.savedRecipes.length > 30) throw new Error('Formato de cocina inválido.');
    for (const [id, rawQuantity] of Object.entries(data.quantities)) {
      const q = rawQuantity as PantryQuantity;
      if (!ingredientIds.has(id) || !pantry.includes(id as IngredientId) || !q || !Number.isFinite(q.amount) || q.amount <= 0 || q.amount > 100000 || !quantityUnits.includes(q.unit)) throw new Error('Cantidad inválida.');
      quantities[id as IngredientId] = { amount: q.amount, unit: q.unit };
    }
    savedRecipes = data.savedRecipes.map(decodeSavedRecipe);
    if (new Set(savedRecipes.map(r => r.id)).size !== savedRecipes.length || JSON.stringify(savedRecipes).length > 180000) throw new Error('Recetas demasiado grandes o duplicadas.');
  }
  const extras = data.version === 3 ? decodeExtras(data, savedRecipes.map(r => r.id)) : { customIngredients: [], mealPlan: [], cookHistory: [] };
  return { version: 3, ...extras, pantry, shopping, checked, favorites: ids('favorites', recipeIds), quantities, savedRecipes };
}
