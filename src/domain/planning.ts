import { ingredients, recipes, type IngredientId } from '../data/catalog';
import { quantityUnits, type PantryQuantity } from './savedRecipes';
import type { KitchenState } from './kitchen';
export type CustomIngredient = { id: string; name: string; pantry: boolean; shopping: boolean; checked: boolean; quantity: PantryQuantity | null };
export type MealPlan = { date: string; recipeId: string; servings: number };
export type CookingRecord = { id: string; recipeId: string; name: string; cookedAt: string; servings: number; note: string };
export const normalizeName = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
export function validServings(n: number) { return Number.isInteger(n) && n >= 1 && n <= 20; }
export function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
}
export function decodeCustom(value: unknown): CustomIngredient {
  const r = value as CustomIngredient;
  if (!r || !/^custom_[a-zA-Z0-9_-]{1,60}$/.test(r.id) || typeof r.name !== 'string' || !r.name.trim() || r.name.length > 60
    || /[\u0000-\u001f]/.test(r.name) || ![r.pantry, r.shopping, r.checked].every(x => typeof x === 'boolean') || (r.checked && !r.shopping)) throw new Error('Ingrediente personalizado inválido.');
  const q = r.quantity;
  if (q !== null && (!r.pantry || !q || !Number.isFinite(q.amount) || q.amount <= 0 || q.amount > 100000 || !quantityUnits.includes(q.unit))) throw new Error('Cantidad personalizada inválida.');
  return { id: r.id, name: r.name.trim().replace(/\s+/g, ' '), pantry: r.pantry, shopping: r.shopping, checked: r.checked, quantity: q === null ? null : { amount: q.amount, unit: q.unit } };
}
export function decodeExtras(data: Record<string, unknown>, savedIds: string[]) {
  if (!Array.isArray(data.customIngredients) || data.customIngredients.length > 100 || !Array.isArray(data.mealPlan) || data.mealPlan.length > 84 || !Array.isArray(data.cookHistory) || data.cookHistory.length > 100) throw new Error('Datos de planificación inválidos.');
  const customIngredients = data.customIngredients.map(decodeCustom);
  const names = customIngredients.map(r => normalizeName(r.name));
  if (new Set(names).size !== names.length || new Set(customIngredients.map(r => r.id)).size !== customIngredients.length || names.some(name => ingredients.some(i => normalizeName(i.name) === name))) throw new Error('Ya existe un ingrediente con ese nombre.');
  const ids = new Set([...recipes.map(r => `local:${r.id}`), ...savedIds.map(id => `saved:${id}`)]);
  const mealPlan = data.mealPlan.map((raw): MealPlan => {
    const r = raw as MealPlan;
    if (!r || typeof r.date !== 'string' || !validDate(r.date) || !ids.has(r.recipeId) || !validServings(r.servings)) throw new Error('Plato del plan inválido.');
    return { date: r.date, recipeId: r.recipeId, servings: r.servings };
  });
  if (new Set(mealPlan.map(r => r.date)).size !== mealPlan.length) throw new Error('Hay días duplicados en el plan.');
  const cookHistory = data.cookHistory.map((raw): CookingRecord => {
    const r = raw as CookingRecord;
    if (!r || !/^cook_[a-zA-Z0-9_-]{1,60}$/.test(r.id) || typeof r.recipeId !== 'string' || r.recipeId.length > 100 || !/^(local|saved):.+$/.test(r.recipeId)
      || typeof r.name !== 'string' || !r.name.trim() || r.name.length > 120 || typeof r.cookedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(r.cookedAt) || !validDate(r.cookedAt.slice(0, 10)) || Number.isNaN(Date.parse(r.cookedAt))
      || !validServings(r.servings) || typeof r.note !== 'string' || r.note.length > 500) throw new Error('Registro de cocina inválido.');
    return { id: r.id, recipeId: r.recipeId, name: r.name, cookedAt: r.cookedAt, servings: r.servings, note: r.note };
  });
  if (new Set(cookHistory.map(r => r.id)).size !== cookHistory.length || JSON.stringify({ customIngredients, mealPlan, cookHistory }).length > 120000) throw new Error('Planificación demasiado grande.');
  return { customIngredients, mealPlan, cookHistory };
}
const fractions: Record<string, number> = { '½': .5, '¼': .25, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3 };
export function scaleAmount(text: string, base: number, servings: number): string {
  if (!validServings(base) || !validServings(servings) || base === servings) return text;
  if (/^\d+(?:[.,]\d+)?\s*(?:-|–|a)\s*\d/.test(text)) return text;
  // Only scale a leading, explicit amount; never change temperatures, timings or ranges.
  const match = text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔])(?=\s|$)(.*)$/);
  if (!match) return text;
  const token = match[1];
  let amount = fractions[token] ?? Number(token.replace(',', '.'));
  if (token.includes('/')) { const parts = token.split(/\s+/); const [a, b] = parts.at(-1)!.split('/').map(Number); amount = (parts.length > 1 ? Number(parts[0]) : 0) + a / b; }
  const scaled = amount * servings / base;
  return Number.isFinite(scaled) && scaled >= .01 ? `${Number(scaled.toFixed(2)).toLocaleString('es-CL')}${match[2]}` : text;
}
export function recipeOptions(state: KitchenState) {
  return [...recipes.map(r => ({ id: `local:${r.id}`, name: r.name, servings: r.servings })), ...state.savedRecipes.map(r => ({ id: `saved:${r.id}`, name: r.name, servings: r.servings ?? 2 }))];
}
export function shoppingForPlan(state: KitchenState, dates: string[]) {
  const ids = new Set<IngredientId>(), customIds = new Set<string>(), unmatched = new Set<string>();
  for (const slot of state.mealPlan.filter(r => dates.includes(r.date))) {
    if (slot.recipeId.startsWith('local:')) {
      const recipe = recipes.find(r => `local:${r.id}` === slot.recipeId);
      recipe?.ingredients.forEach(i => { if (!state.pantry.includes(i.id)) ids.add(i.id); });
    } else {
      const recipe = state.savedRecipes.find(r => `saved:${r.id}` === slot.recipeId);
      for (const line of recipe?.ingredients ?? []) {
        const text = ` ${normalizeName(line).replace(/[^a-z0-9 ]/g, ' ')} `;
        const custom = [...state.customIngredients].sort((a,b) => b.name.length - a.name.length).find(r => text.includes(` ${normalizeName(r.name)} `));
        const known = ingredients.find(r => [r.name, r.id, r.id === 'huevos' ? 'huevo' : '', r.id === 'lentejas' ? 'lenteja' : '', r.id === 'garbanzos' ? 'garbanzo' : '', r.id === 'champiñones' ? 'champiñón' : ''].filter(Boolean).some(name => text.includes(` ${normalizeName(name).replace(/-/g, ' ')} `)));
        if (custom) { if (!custom.pantry) customIds.add(custom.id); }
        else if (known) { if (!state.pantry.includes(known.id)) ids.add(known.id); }
        else unmatched.add(line);
      }
    }
  }
  return { ids: [...ids], customIds: [...customIds], unmatched: [...unmatched] };
}
export function weekDates(offset: number, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start); date.setDate(start.getDate() + i);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
}
