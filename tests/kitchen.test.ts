import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingredients, recipes } from '../src/data/catalog';
import { decodeState, initialState, kitchenReducer, missingIngredients, rankRecipes } from '../src/domain/kitchen';

test('fully matched recipes rank ahead of incomplete recipes, then by preparation time', () => {
  const pantry = ['pan', 'tomate', 'queso'] as const;
  const ranked = rankRecipes([...pantry]);
  assert.equal(ranked[0].id, 'sandwich-queso');
  assert.deepEqual(missingIngredients(ranked[0], [...pantry]), []);
  const counts = ranked.map(recipe => missingIngredients(recipe, [...pantry]).length);
  assert.deepEqual(counts, [...counts].sort((a, b) => a - b));
});
test('quick filter excludes recipes over 15 minutes without mutating the catalog', () => {
  assert.ok(rankRecipes([], true).every(recipe => recipe.minutes <= 15));
  assert.equal(recipes.length, 8);
});
test('shopping additions are deduplicated and purchase moves only checked ingredients', () => {
  let state = kitchenReducer(initialState, { type: 'add-shopping', ids: ['queso', 'pan'] });
  state = kitchenReducer(state, { type: 'add-shopping', ids: ['queso'] });
  assert.deepEqual(state.shopping, ['queso', 'pan']);
  state = kitchenReducer(state, { type: 'toggle-checked', id: 'queso' });
  const purchased = kitchenReducer(state, { type: 'purchase' });
  assert.deepEqual(purchased.pantry, ['queso']);
  assert.deepEqual(purchased.shopping, ['pan']);
  assert.deepEqual(purchased.checked, []);
  assert.deepEqual(initialState.pantry, []);
});
test('removing an item also removes its checked status', () => {
  let state = kitchenReducer(initialState, { type: 'add-shopping', ids: ['queso'] });
  state = kitchenReducer(state, { type: 'toggle-checked', id: 'queso' });
  state = kitchenReducer(state, { type: 'remove-shopping', id: 'queso' });
  assert.deepEqual(state.checked, []);
  assert.deepEqual(state.shopping, []);
});
test('favorites can be saved and removed and example ingredients preserve existing pantry', () => {
  const saved = kitchenReducer(initialState, { type: 'toggle-favorite', id: recipes[0].id });
  assert.deepEqual(kitchenReducer(saved, { type: 'toggle-favorite', id: recipes[0].id }).favorites, []);
  const withPan = kitchenReducer(initialState, { type: 'toggle-ingredient', id: 'pan' });
  const sample = kitchenReducer(withPan, { type: 'sample' });
  assert.ok(sample.pantry.includes('pan'));
  assert.equal(new Set(sample.pantry).size, sample.pantry.length);
});
test('persistence round-trips state and rejects corrupt or incompatible data', () => {
  const state = kitchenReducer(initialState, { type: 'sample' });
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
  assert.deepEqual(decodeState(null), initialState);
  assert.throws(() => decodeState('{broken'));
  assert.throws(() => decodeState(JSON.stringify({ ...state, version: 2 })));
  assert.throws(() => decodeState(JSON.stringify({ ...state, pantry: ['unknown'] })));
  assert.throws(() => decodeState(JSON.stringify({ ...state, favorites: [42] })));
  assert.deepEqual(decodeState(JSON.stringify({ ...state, checked: ['queso'] })).checked, []);
});
test('catalog references are valid and recipe IDs are unique', () => {
  assert.equal(new Set(recipes.map(recipe => recipe.id)).size, recipes.length);
  for (const recipe of recipes) {
    assert.ok(recipe.steps.length >= 3);
    assert.ok(recipe.ingredients.every(item => ingredients.some(ingredient => ingredient.id === item.id)));
  }
});
