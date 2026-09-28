// Tam render: node tools/render.mjs [--from=0] [--to=180] [--workers=4] [--out=out/video_sessiz.mp4]
// Kareler Chromium'da çizilir, JPEG olarak ffmpeg'e borulanır (x264, yuv420p, 30fps). Ayrıca out/cues.json yazar.
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'child_process';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
// Chromium: CHROME_PATH ortam değişkeni > bulut ortamındaki kurulu Chromium > Playwright varsayılanı
const CHROME = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const FPS = 30, from = +arg('from', 0), to = +arg('to', 180), workers = +arg('workers', 4);
const out = path.resolve(root, arg('out', 'out/video_sessiz.mp4'));
const FF = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS), per = Math.ceil((f1 - f0) / workers);
const tmp = path.join(root, 'out'); fs.mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const t0 = Date.now(); let done = 0;
async function work(k) {
  const a = f0 + k * per, b = Math.min(f1, a + per); if (a >= b) return null;
  const seg = path.join(tmp, `seg${k}.mp4`);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = new Set(); page.on('pageerror', e => errs.add(String(e))); page.on('console', m => { if (m.type() === 'error' && !m.text().includes('ERR_FILE')) errs.add(m.text()); });
  await page.goto('file://' + path.join(root, 'index.html')); await page.evaluate(() => window.ready);
  if (k === 0) fs.writeFileSync(path.join(tmp, 'cues.json'), JSON.stringify(await page.evaluate(() => ({ cues: getCues(), scenes: getScenes(), vo: VO })), null, 1));
  const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    const d = await page.evaluate(t => { renderFrame(t); return cv.toDataURL('image/jpeg', .96); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(d.slice(23), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 300 === 0) console.log(`${done}/${f1 - f0} kare  ${((Date.now() - t0) / 1000).toFixed(0)} sn`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close();
  if (errs.size) console.log(`seg${k} HATALAR:\n` + [...errs].join('\n'));
  return seg;
}
const segs = (await Promise.all([...Array(workers).keys()].map(work))).filter(Boolean);
await browser.close();
const list = path.join(tmp, 'segs.txt'); fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
segs.forEach(s => fs.unlinkSync(s)); fs.unlinkSync(list);
console.log(`BİTTİ → ${out}  (${((Date.now() - t0) / 1000).toFixed(0)} sn)`);
