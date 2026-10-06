import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeState, initialState, kitchenReducer } from '../src/domain/kitchen';
import { decodeSavedRecipe, recipeDraftFromAnswer } from '../src/domain/savedRecipes';
import { importKitchen, newWorkspace, sameKitchen, decideSync } from '../src/domain/workspace';
import { decodeCloud, encodeCloud } from '../src/services/cloud';

const recipe = decodeSavedRecipe({ id: 'saved_test', name: 'Arroz', ingredients: ['1 taza de arroz'], steps: ['Cocina según el envase.'], source: 'Gemini', sourceUrl: '', originalText: 'Arroz' });
test('v1 migrates without losing lists; quantities and saved recipes round-trip through backup', () => {
  const legacy = { version: 1, pantry: ['arroz'], favorites: ['arroz-tomate'], shopping: ['huevos'], checked: ['huevos'] };
  const migrated = decodeState(JSON.stringify(legacy));
  assert.equal(migrated.version, 3); assert.deepEqual(migrated.pantry, legacy.pantry); assert.deepEqual(migrated.quantities, {});
  let state = kitchenReducer(migrated, { type: 'quantity', id: 'arroz', quantity: { amount: 500, unit: 'g' } });
  state = kitchenReducer(state, { type: 'save-recipe', recipe });
  assert.deepEqual(decodeCloud({ ...encodeCloud(state), updateTime: '2026-10-05T22:00:00Z' }).kitchen, state);
  const oldCloud = { fields: { version: { integerValue: '1' }, ...Object.fromEntries(['pantry', 'favorites', 'shopping', 'checked'].map(key => [key, { arrayValue: { values: (legacy[key as keyof typeof legacy] as string[]).map(stringValue => ({ stringValue })) } }])) }, updateTime: '2026-10-05T22:00:00Z' };
  assert.deepEqual(decodeCloud(oldCloud).kitchen, migrated);
  assert.equal(sameKitchen(state, migrated), false);
  assert.equal(decideSync({ ...newWorkspace(state), sync: { enabled: true, dirty: true, remoteUpdateTime: null, lastSyncedAt: null } }, null), 'upload');
  assert.deepEqual(kitchenReducer(state, { type: 'toggle-ingredient', id: 'arroz' }).quantities, {});
});
test('quantity validation, explicit import precedence and saved recipe limits preserve ownership', () => {
  assert.throws(() => kitchenReducer(initialState, { type: 'quantity', id: 'arroz', quantity: { amount: -2, unit: 'g' } }));
  assert.throws(() => kitchenReducer(initialState, { type: 'quantity', id: 'arroz', quantity: { amount: Infinity, unit: 'g' } }));
  const guest = kitchenReducer(kitchenReducer(initialState, { type: 'quantity', id: 'arroz', quantity: { amount: 3, unit: 'tazas' } }), { type: 'save-recipe', recipe });
  const account = kitchenReducer(initialState, { type: 'quantity', id: 'arroz', quantity: { amount: 1, unit: 'kg' } });
  const imported = importKitchen(account, guest);
  assert.equal(imported.quantities.arroz?.amount, 1); assert.equal(guest.quantities.arroz?.amount, 3);
  assert.equal(imported.savedRecipes.length, 1); assert.equal(account.savedRecipes.length, 0);
  assert.deepEqual(kitchenReducer(imported, { type: 'delete-recipe', id: recipe.id }).savedRecipes, []);
  assert.throws(() => decodeSavedRecipe({ ...recipe, sourceUrl: 'https://evil.example/steal' }));
  assert.throws(() => decodeState(JSON.stringify({ ...guest, savedRecipes: Array(31).fill(recipe) })));
});
test('assistant drafts preserve original text and previously saved external recipes remain readable', () => {
  const oldRecipe = { ...recipe, source: 'TheMealDB', sourceUrl: 'https://www.themealdb.com/meal/52771' };
  assert.equal(decodeSavedRecipe(oldRecipe).source, 'TheMealDB');
  assert.equal(decodeState(JSON.stringify({ ...initialState, savedRecipes: [oldRecipe] })).savedRecipes.length, 1);
  const draft = recipeDraftFromAnswer('**Arroz**\nIngredientes:\n- 1 taza de arroz\nPasos:\n1. Cocina el arroz.');
  assert.deepEqual(draft.ingredients, ['1 taza de arroz']); assert.deepEqual(draft.steps, ['Cocina el arroz.']);
  assert.equal(recipeDraftFromAnswer('Texto libre').originalText, 'Texto libre');
});
