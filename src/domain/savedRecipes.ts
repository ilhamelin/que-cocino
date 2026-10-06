export type SavedRecipe = { id: string; name: string; servings?: number; ingredients: string[]; steps: string[]; source: 'Gemini' | 'TheMealDB' | 'Personal'; sourceUrl: string; originalText: string };
export function decodeSavedRecipe(value: unknown): SavedRecipe {
  const r = value as SavedRecipe;
  if (!r || typeof r.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(r.id) || typeof r.name !== 'string' || !r.name.trim() || r.name.length > 120
    || !['Gemini', 'TheMealDB', 'Personal'].includes(r.source) || typeof r.sourceUrl !== 'string' || r.sourceUrl.length > 300
    || (r.sourceUrl !== '' && !/^https:\/\/(www\.)?themealdb\.com\/meal\/\d+$/.test(r.sourceUrl))
    || typeof r.originalText !== 'string' || r.originalText.length > 12000) throw new Error('Receta inválida.');
  if (r.servings !== undefined && (!Number.isInteger(r.servings) || r.servings < 1 || r.servings > 20)) throw new Error('Porciones inválidas.');
  for (const key of ['ingredients', 'steps'] as const) if (!Array.isArray(r[key]) || !r[key].length || r[key].length > 30 || r[key].some(x => typeof x !== 'string' || !x.trim() || x.length > 1500)) throw new Error('Revisa los ingredientes y pasos de la receta.');
  return { id: r.id, name: r.name.trim(), ...(r.servings !== undefined ? { servings: r.servings } : {}), ingredients: r.ingredients.map(x => x.trim()), steps: r.steps.map(x => x.trim()), source: r.source, sourceUrl: r.sourceUrl, originalText: r.originalText };
}
export type PantryQuantity = { amount: number; unit: 'unidades' | 'g' | 'kg' | 'ml' | 'l' | 'tazas' };
export const quantityUnits = ['unidades', 'g', 'kg', 'ml', 'l', 'tazas'] as const;
export function recipeDraftFromAnswer(text: string): SavedRecipe {
  const lines = text.split('\n').map(x => x.replace(/^\s*[-*#]+\s*/, '').replace(/\*\*/g, '').trim()).filter(Boolean);
  const ingredients: string[] = [], steps: string[] = [];
  let section = '';
  for (const line of lines) {
    if (/^ingredientes\s*:?$/i.test(line)) { section = 'ingredients'; continue; }
    if (/^(preparación|preparacion|pasos|instrucciones)\s*:?$/i.test(line)) { section = 'steps'; continue; }
    if (section === 'ingredients') ingredients.push(line);
    if (section === 'steps') steps.push(line.replace(/^\d+[.)]\s*/, ''));
  }
  return { id: `saved_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`, name: (lines[0] || 'Mi receta').slice(0, 120), ingredients, steps: steps.length ? steps : [text], source: 'Gemini', sourceUrl: '', originalText: text };
}
