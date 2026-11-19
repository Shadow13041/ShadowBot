const LANGUAGES = new Set([
  'deutsch', 'englisch', 'english', 'französisch', 'französisch',
  'spanisch', 'italienisch', 'portugiesisch', 'niederländisch',
  'polnisch', 'russisch', 'ukrainisch', 'türkisch', 'arabisch',
  'chinesisch', 'japanisch', 'koreanisch', 'griechisch',
  'schwedisch', 'norwegisch', 'dänisch', 'tschechisch',
  'ungarisch', 'rumänisch', 'latein'
]);

export function parseTranslateArgs(args) {
  const input = String(args || '').trim();

  const colon = input.match(/^([^:\n]{2,40}):\s*([\s\S]+)$/);
  if (colon) {
    return { language: colon[1].trim(), source: colon[2].trim() };
  }

  const first = input.match(/^(\S+)\s+([\s\S]+)$/);
  if (first && LANGUAGES.has(first[1].toLowerCase())) {
    return { language: first[1], source: first[2].trim() };
  }

  return { language: 'Deutsch', source: input };
}
