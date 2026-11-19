import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdminParticipants,
  buildTagAllPayload
} from '../command-utils.js';

test('listet nur tatsächliche Gruppenadmins auf', () => {
  const result = getAdminParticipants({
    participants: [
      { id: '1@s.whatsapp.net', admin: 'admin' },
      { id: '2@s.whatsapp.net', admin: 'superadmin' },
      { id: '3@s.whatsapp.net', admin: null }
    ]
  });

  assert.deepEqual(result.map(item => item.id), [
    '1@s.whatsapp.net',
    '2@s.whatsapp.net'
  ]);
});

test('erzeugt Erwähnungen für alle gültigen Gruppenmitglieder', () => {
  const result = buildTagAllPayload([
    { id: '111@s.whatsapp.net' },
    { id: '222@s.whatsapp.net' }
  ], 'Wichtige Info');

  assert.deepEqual(result.mentions, [
    '111@s.whatsapp.net',
    '222@s.whatsapp.net'
  ]);
  assert.equal(result.text, 'Wichtige Info\n\n@111 @222');
});

test('verarbeitet leere Gruppenlisten ohne Fehler', () => {
  assert.deepEqual(buildTagAllPayload([]), {
    text: '',
    mentions: []
  });
});
