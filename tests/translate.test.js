import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTranslateArgs } from '../translate.js';

test('erkennt Zielsprache mit Doppelpunkt', () => {
  assert.deepEqual(parseTranslateArgs('Englisch: Hallo Welt'), {
    language: 'Englisch', source: 'Hallo Welt'
  });
});

test('unterstützt die Kurzform ohne Doppelpunkt', () => {
  assert.deepEqual(parseTranslateArgs('Englisch Hello world'), {
    language: 'Englisch', source: 'Hello world'
  });
});

test('übersetzt ohne Zielangabe standardmäßig ins Deutsche', () => {
  assert.deepEqual(parseTranslateArgs('Hello world'), {
    language: 'Deutsch', source: 'Hello world'
  });
});
