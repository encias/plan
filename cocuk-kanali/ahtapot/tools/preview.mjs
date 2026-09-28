// Kullanım: node tools/preview.mjs <çıktı_klasörü> <t1> <t2> ... [--full]
// Varsayılan 960x540 PNG (token tasarrufu). --full → 1920x1080. --page=dev.html farklı sayfa.
import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
// Chromium: CHROME_PATH ortam değişkeni > bulut ortamındaki kurulu Chromium > Playwright varsayılanı
const CHROME = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), full = args.includes('--full');
const pageArg = (args.find(a => a.startsWith('--page=')) || '--page=index.html').slice(7);
const [out, ...times] = args.filter(a => !a.startsWith('--'));
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + path.join(root, pageArg)); await p.evaluate(() => window.ready);
for (const t of times) {
  const data = await p.evaluate(([t, full]) => { renderFrame(t); if (full) return cv.toDataURL('image/png');
    const c = document.createElement('canvas'); c.width = 960; c.height = 540; c.getContext('2d').drawImage(cv, 0, 0, 960, 540); return c.toDataURL('image/png'); }, [parseFloat(t), full]);
  const f = path.join(out, `t${(+t).toFixed(2)}.png`); fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64')); console.log(f);
}
if (errs.length) console.log('HATALAR:\n' + [...new Set(errs)].join('\n'));
await b.close();
