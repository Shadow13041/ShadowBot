from pathlib import Path
from datetime import datetime
import shutil
import sys

p = Path("index.js")
code = p.read_text()

if "SQLMAP-LOCAL-CHECK" in code:
    sys.exit("SQLMap ist bereits eingebaut.")

old = r"""const commandMatch = text.match(/^(\/help|\/memory|\/personality|\/name|\/clear|\/confirmclear|\/cancelclear|\/status|\/stats)(?:\s+([\s\S]+))?$/i);"""

new = r"""const commandMatch = text.match(/^(\/help|\/memory|\/personality|\/name|\/clear|\/confirmclear|\/cancelclear|\/status|\/stats|\/sqlmap)(?:\s+([\s\S]+))?$/i);"""

if old not in code:
    sys.exit("FEHLER: Befehlszeile nicht gefunden.")

send_pos = code.find("async function sendConsentPrompt")
return_pos = code.rfind("return false;", 0, send_pos)

if send_pos < 0 or return_pos < 0:
    sys.exit("FEHLER: Einfügeposition nicht gefunden.")

addition = r"""

  // SQLMAP-LOCAL-CHECK
  if (command === '/sqlmap') {
    if (isGroup) return send('Nur im privaten Chat verfügbar.');
    if (!isAdmin) return send('Keine Berechtigung.');

    let target;
    try {
      target = new URL(args.trim());
    } catch {
      return send('Verwendung: /sqlmap http://127.0.0.1:8080/test.php?id=1');
    }

    if (
      !['http:', 'https:'].includes(target.protocol) ||
      !['localhost', '127.0.0.1', '::1'].includes(target.hostname) ||
      target.username || target.password
    ) {
      return send('Nur lokale Testziele sind erlaubt.');
    }

    await send('Lokaler SQLMap-Test gestartet.');

    try {
      const sqlmapPath = path.join(
        process.env.HOME || '',
        'sqlmap-dev',
        'sqlmap.py'
      );

      const { stdout, stderr } = await execFileAsync(
        'python',
        [
          sqlmapPath, '-u', target.href,
          '--batch', '--smart',
          '--risk=1', '--level=1',
          '--timeout=5', '--retries=0',
          '--disable-coloring'
        ],
        {
          timeout: 90000,
          maxBuffer: 300000
        }
      );

      const output = (stdout + '\n' + stderr).slice(-5000);
      let result = 'Kein eindeutiges Ergebnis.';

      if (/appears to be injectable|is vulnerable/i.test(output)) {
        result = 'Mögliche SQL-Injection erkannt.';
      } else if (/does not seem to be injectable|not injectable/i.test(output)) {
        result = 'Keine SQL-Injection erkannt.';
      }

      return send(
        'SQLMap-Ergebnis\n' + result + '\n\n' +
        output.slice(-3000)
      );
    } catch (error) {
      const output = String(
        (error.stdout || '') + '\n' +
        (error.stderr || '') + '\n' +
        (error.message || '')
      ).slice(-2500);

      return send('SQLMap-Fehler:\n' + output);
    }
  }
"""

backup = p.with_name(
    p.name + ".backup-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)

shutil.copy2(p, backup)

code = code.replace(old, new, 1)
code = code[:return_pos + len("return false;")] + addition + code[return_pos + len("return false;"):]

p.write_text(code)

print("Patch eingefügt.")
print("Backup:", backup)
