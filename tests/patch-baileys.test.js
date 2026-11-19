import test from 'node:test';
import assert from 'node:assert/strict';
import { patchBaileysSource } from '../scripts/patch-baileys.js';

test('korrigiert alle drei offline-Prüfungen', () => {
  const source = [
    'const isOffline = !!node.attrs.offline;',
    "upsertMessage(msg, node.attrs.offline ? 'append' : 'notify');",
    'offline: !!attrs.offline,'
  ].join('\n');

  const result = patchBaileysSource(source);

  assert.match(result, /const isOffline = node\.attrs\.offline === '1';/);
  assert.match(result, /node\.attrs\.offline === '1' \? 'append' : 'notify'/);
  assert.match(result, /offline: attrs\.offline === '1',/);
});

test('ist idempotent', () => {
  const source = [
    "const isOffline = node.attrs.offline === '1';",
    "upsertMessage(msg, node.attrs.offline === '1' ? 'append' : 'notify');",
    "offline: attrs.offline === '1',"
  ].join('\n');

  assert.equal(patchBaileysSource(source), source);
});

test('bricht bei unbekanntem Quellcode sicher ab', () => {
  assert.throws(
    () => patchBaileysSource('const isOffline = Boolean(value);'),
    /Unerwarteter Baileys-Code/
  );
});
