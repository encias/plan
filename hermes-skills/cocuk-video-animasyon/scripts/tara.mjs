// Tüm bölümü saniyede 10 kare tarar: konsol/JS hatası ve "boş kare" (tek renk, çizim çökmüş) arar.
// Kullanım: node tools/tara.mjs [--fps=10]   → hata varsa çıkış kodu 1
import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const fps = +((process.argv.find(a => a.startsWith('--fps=')) || '--fps=10').split('=')[1]);
const b = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = new Map();
const note = (m, t) => { if (!m.includes('ERR_FILE')) errs.set(m, errs.get(m) ?? t); };
let cur = 0; p.on('pageerror', e => note(String(e), cur)); p.on('console', m => { if (m.type() === 'error') note(m.text(), cur); });
await p.goto('file://' + path.join(root, 'index.html')); await p.evaluate(() => window.ready);
const dur = await p.evaluate(() => DURATION);
const bos = [];
for (let f = 0; f < dur * fps; f++) {
  cur = f / fps;
  const sd = await p.evaluate(t => {
    renderFrame(t);
    const c = document.createElement('canvas'); c.width = 64; c.height = 36; const x = c.getContext('2d'); x.drawImage(cv, 0, 0, 64, 36);
    const d = x.getImageData(0, 0, 64, 36).data; let s = 0, s2 = 0, n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) { const l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; s += l; s2 += l * l; }
    return Math.sqrt(s2 / n - (s / n) ** 2);
  }, cur);
  if (sd < 2.5 && cur < dur - 1) bos.push(cur.toFixed(1));
}
await b.close();
console.log(`taranan: ${dur * fps} kare (${fps} fps)`);
if (bos.length) console.log(`UYARI boş/tek renk kare: ${bos.slice(0, 20).join(', ')}${bos.length > 20 ? ' …' : ''}`);
for (const [m, t] of errs) console.log(`HATA @${t.toFixed(1)} sn: ${m}`);
console.log('SONUÇ:', errs.size ? `${errs.size} HATA` : 'GEÇTİ');
process.exit(errs.size ? 1 : 0);
