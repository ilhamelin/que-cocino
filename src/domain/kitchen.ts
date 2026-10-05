import { ingredients, recipes, type IngredientId, type Recipe } from '../data/catalog';

export type KitchenState = {
  version: 1;
  pantry: IngredientId[];
  favorites: string[];
  shopping: IngredientId[];
  checked: IngredientId[];
};
export const initialState: KitchenState = { version: 1, pantry: [], favorites: [], shopping: [], checked: [] };
export type KitchenAction =
  | { type: 'hydrate'; state: KitchenState }
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
    case 'hydrate': return action.state;
    case 'toggle-ingredient': return { ...state, pantry: toggle(state.pantry, action.id) };
    case 'toggle-favorite': return { ...state, favorites: toggle(state.favorites, action.id) };
    case 'sample': return { ...state, pantry: [...new Set<IngredientId>([...state.pantry, 'huevos', 'arroz', 'tomate', 'espinaca'])] };
    case 'add-shopping': return { ...state, shopping: [...new Set([...state.shopping, ...action.ids])] };
    case 'toggle-checked': return state.shopping.includes(action.id) ? { ...state, checked: toggle(state.checked, action.id) } : state;
    case 'remove-shopping': return { ...state, shopping: state.shopping.filter(id => id !== action.id), checked: state.checked.filter(id => id !== action.id) };
    case 'purchase': return { ...state, pantry: [...new Set([...state.pantry, ...state.checked])], shopping: state.shopping.filter(id => !state.checked.includes(id)), checked: [] };
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
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) {
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
  return { version: 1, pantry, shopping, checked, favorites: ids('favorites', recipeIds) };
}
