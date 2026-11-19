import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);

export function patchBaileysSource(source) {
  const replacements = [
    [
      /const isOffline = !!node\.attrs\.offline;/g,
      "const isOffline = node.attrs.offline === '1';"
    ],
    [
      /node\.attrs\.offline \? 'append' : 'notify'/g,
      "node.attrs.offline === '1' ? 'append' : 'notify'"
    ],
    [
      /offline: !!attrs\.offline,/g,
      "offline: attrs.offline === '1',"
    ]
  ];

  let result = source;
  let changed = 0;

  for (const [pattern, replacement] of replacements) {
    const matches = result.match(pattern);
    if (matches) {
      changed += matches.length;
      result = result.replace(pattern, replacement);
    }
  }

  const alreadyPatched =
    result.includes("const isOffline = node.attrs.offline === '1';") &&
    result.includes("node.attrs.offline === '1' ? 'append' : 'notify'") &&
    result.includes("offline: attrs.offline === '1',");

  if (changed === 3 || (changed === 0 && alreadyPatched)) {
    return result;
  }

  throw new Error(`Unerwarteter Baileys-Code: ${changed} Änderungen. Abbruch ohne Änderung.`);
}

async function main() {
  const entry = require.resolve('@whiskeysockets/baileys');
  const root = dirname(dirname(entry));
  const target = join(root, 'lib', 'Socket', 'messages-recv.js');

  const source = await readFile(target, 'utf8');
  const patched = patchBaileysSource(source);

  if (patched !== source) {
    await writeFile(target, patched, 'utf8');
    console.log('Baileys erfolgreich korrigiert.');
  } else {
    console.log('Baileys ist bereits korrigiert.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('Baileys-Patch fehlgeschlagen:', error.message);
    process.exitCode = 1;
  });
}
