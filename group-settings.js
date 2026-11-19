export function normalizeGroupSettings(data = {}) {
  const excluded = data.excluded && typeof data.excluded === 'object'
    ? data.excluded : {};
  const allowed = data.allowed && typeof data.allowed === 'object'
    ? data.allowed : {};

  return {
    mode: ['all', 'allowlist', 'denylist'].includes(data.mode)
      ? data.mode
      : 'denylist',
    allowed,
    excluded
  };
}

export function isGroupAllowed(settings, jid) {
  const data = normalizeGroupSettings(settings);

  if (data.mode === 'all') return true;
  if (data.mode === 'denylist') return data.excluded[jid] !== true;
  return data.allowed[jid] === true;
}

export function parseGroupTarget(value) {
  const input = String(value || '').trim();

  if (/^[0-9-]+@g\.us$/i.test(input)) {
    return { jid: input };
  }

  const match = input.match(
    /^(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)(?:\?.*)?$/i
  );

  if (match) return { inviteCode: match[1] };
  return null;
}
