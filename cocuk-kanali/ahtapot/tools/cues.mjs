// Sahnelerden efekt/VO listesini çıkarır → out/cues.json (render etmeden)
import { chromium } from 'playwright'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.goto('file://' + path.join(root, 'index.html')); await p.evaluate(() => window.ready);
const d = await p.evaluate(() => ({ cues: getCues(), scenes: getScenes(), vo: VO }));
fs.mkdirSync(path.join(root, 'out'), { recursive: true }); fs.writeFileSync(path.join(root, 'out/cues.json'), JSON.stringify(d, null, 1));
console.log('cues:', d.cues.length, 'sahneler:', d.scenes.map(s => s.id).join(', ')); await b.close();
