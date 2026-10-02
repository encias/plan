// build/ders.html → Oki_Izleme_Kitabi.pdf (A4 yatay)
import { chromium } from 'playwright'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const root = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const b = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.goto('file://' + path.join(root, 'build/ders.html')); await p.evaluate(() => document.fonts.ready);
await p.waitForLoadState('networkidle');
await p.pdf({ path: path.join(root, 'Oki_Izleme_Kitabi.pdf'), format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
await b.close(); console.log('Oki_Izleme_Kitabi.pdf');
