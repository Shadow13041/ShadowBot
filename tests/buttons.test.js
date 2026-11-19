import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildQuickReplyButtons,
  buildListButton,
  getInteractiveReplyId
} from '../button-utils.js';

test('erstellt Quick-Reply-Buttons', () => {
  const result = buildQuickReplyButtons([
    { id: 'yes', displayText: 'Ja' },
    { id: 'no', displayText: 'Nein' }
  ]);

  assert.equal(result.length, 2);
  assert.equal(JSON.parse(result[0].buttonParamsJson).id, 'yes');
});

test('begrenzt Quick-Reply-Buttons auf drei', () => {
  assert.throws(() => buildQuickReplyButtons([
    { id: '1', displayText: 'Eins' },
    { id: '2', displayText: 'Zwei' },
    { id: '3', displayText: 'Drei' },
    { id: '4', displayText: 'Vier' }
  ]));
});

test('erstellt ein Auswahlmenü', () => {
  const result = buildListButton('Themen öffnen', [
    { id: '/help ai', title: 'KI' },
    { id: '/help groups', title: 'Gruppen' }
  ]);

  const params = JSON.parse(result.buttonParamsJson);
  assert.equal(result.name, 'single_select');
  assert.equal(params.sections[0].rows.length, 2);
});

test('erkennt native WhatsApp-Auswahlantworten', () => {
  const message = {
    interactiveResponseMessage: {
      nativeFlowResponseMessage: {
        paramsJson: JSON.stringify({ id: '/help ai' })
      }
    }
  };

  assert.equal(getInteractiveReplyId(message), '/help ai');
});

test('ignoriert ungültige Antwortdaten', () => {
  assert.equal(getInteractiveReplyId({
    interactiveResponseMessage: {
      nativeFlowResponseMessage: {
        paramsJson: '{kaputt'
      }
    }
  }), null);
});
