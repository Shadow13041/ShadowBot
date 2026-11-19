import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeGroupSettings,
  isGroupAllowed,
  parseGroupTarget
} from '../group-settings.js';

test('allowlist erlaubt nur ausdrücklich eingetragene Gruppen', () => {
  const settings = {
    mode: 'allowlist',
    allowed: { '123@g.us': true }
  };

  assert.equal(isGroupAllowed(settings, '123@g.us'), true);
  assert.equal(isGroupAllowed(settings, '456@g.us'), false);
});

test('denylist sperrt nur ausdrücklich ausgeschlossene Gruppen', () => {
  const settings = {
    mode: 'denylist',
    excluded: { '123@g.us': true }
  };

  assert.equal(isGroupAllowed(settings, '123@g.us'), false);
  assert.equal(isGroupAllowed(settings, '456@g.us'), true);
});

test('all erlaubt jede Gruppe', () => {
  assert.equal(
    isGroupAllowed({ mode: 'all' }, '123@g.us'),
    true
  );
});

test('übernimmt alte Gruppensperren ohne Datenverlust', () => {
  const settings = normalizeGroupSettings({
    excluded: { '123@g.us': true }
  });

  assert.equal(settings.mode, 'denylist');
  assert.equal(settings.excluded['123@g.us'], true);
});

test('erkennt Gruppen-IDs und Einladungslinks', () => {
  assert.deepEqual(parseGroupTarget('123@g.us'), {
    jid: '123@g.us'
  });

  assert.deepEqual(
    parseGroupTarget('https://chat.whatsapp.com/AbCd123?x=1'),
    { inviteCode: 'AbCd123' }
  );

  assert.equal(parseGroupTarget('kein gültiger Link'), null);
});
