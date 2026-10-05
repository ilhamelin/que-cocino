import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodePreferences, defaultPreferences, readingMultiplier } from '../src/domain/preferences';

test('existing installations without preferences get defaults; preferences round-trip independently', () => {
  assert.deepEqual(decodePreferences(null), defaultPreferences);
  const saved = { ...defaultPreferences, displayName: '  Ana  ', theme: 'dark', textSize: 'large', font: 'serif' };
  assert.deepEqual(decodePreferences(JSON.stringify(saved)), { ...saved, displayName: 'Ana' });
  assert.equal(defaultPreferences.displayName, '');
});

test('corrupt, incompatible or unrecognized preferences are rejected without silently resetting', () => {
  for (const raw of ['{broken', 'null', JSON.stringify({ ...defaultPreferences, version: 2 }),
    JSON.stringify({ ...defaultPreferences, theme: 'neon' }),
    JSON.stringify({ ...defaultPreferences, theme: ['dark'] }),
    JSON.stringify({ ...defaultPreferences, font: 'unknown' }),
    JSON.stringify({ ...defaultPreferences, textSize: 'tiny' }),
    JSON.stringify({ ...defaultPreferences, displayName: 'a'.repeat(61) })]) {
    assert.throws(() => decodePreferences(raw));
  }
});

test('reading settings enlarge rather than reduce the system text size', () => {
  assert.equal(readingMultiplier('standard'), 1);
  assert.ok(readingMultiplier('large') > 1);
  assert.ok(readingMultiplier('extra-large') > readingMultiplier('large'));
});
