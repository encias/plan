// ============================================================
//  ÇEKİRDEK — ortak palet, zaman çizelgesi, seslendirme, yardımcılar
//  Tüm çizim deterministik: aynı t → aynı kare. Math.random YASAK, rng() kullan.
// ============================================================
const W = 1920, H = 1080, FPS = 30;  // DURATION, T, VO, FACTS, MUSIC → js/bolum.js (bölüme özel)

const PAL = {
  navy: '#0B2545', ink: '#10223F', deep: '#0A1F3A',
  sea1: '#63CFD2', sea2: '#1E7FA6', sea3: '#0E4A72',
  foam: '#E9FCFF', foam2: '#BDEFF5',
  sand: '#F4D9A6', sand2: '#E3BD7D', sand3: '#C99A57',
  octo: '#FF7B6B', octoDark: '#D9534B', octoLight: '#FFB0A3', sucker: '#FFE0D6',
  blush: '#FF4F7A',
  yellow: '#FFD23F', yellowDark: '#E0A800', mint: '#6FE0B0', coral: '#FF9E5E',
  pink: '#FF6FA3', purple: '#6B4BC2', inkCloud: '#2A1F45',
  heart: '#FF3B5C', blueBlood: '#3D8BFF', redBlood: '#E8283F',
  white: '#FFFFFF', seaweed: '#2FA37A', seaweed2: '#1F7A5C', rock: '#6E7C8C', rock2: '#56626F'
};

// İzin verilen efekt sesleri (tools/audio.py bunları sentezler)
const SFX = ['pop', 'whoosh', 'bubble', 'ding', 'heartbeat', 'tick', 'tada', 'splat', 'jet',
  'sparkle', 'boing', 'swoosh_up', 'magic', 'click', 'drum', 'squish', 'wrong', 'shimmer'];

const SCENES = [];
function registerScene(s) { SCENES.push(s); }

// ---------- matematik ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const TAU = Math.PI * 2;
const ease = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  smooth: t => t * t * (3 - 2 * t),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1,
  inBack: t => { const c1 = 1.70158, c3 = c1 + 1; return c3 * t * t * t - c1 * t * t; }
};
// Belirli bir anda "zıplayarak" belirme ölçeği (0 → ~1.1 → 1)
function pop(t, start, dur = 0.45) { const p = prog(t, start, start + dur); return p <= 0 ? 0 : ease.outBack(p); }
// [a,b] aralığında görünür; fin/fout saniye yumuşak giriş/çıkış
function win(t, a, b, fin = .3, fout = .3) { return Math.min(prog(t, a, a + fin), 1 - prog(t, b - fout, b)); }
// Deterministik rastgele
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// Kalp atışı darbesi: 0..1, bpm hızında "lub-dub"
function beat(t, bpm = 80) {
  const ph = (t * bpm / 60) % 1;
  return Math.exp(-Math.pow((ph - .05) / .045, 2)) + .6 * Math.exp(-Math.pow((ph - .22) / .045, 2));
}

// ---------- renk ----------
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
function shade(c, amt) { return amt >= 0 ? mix(c, '#ffffff', amt) : mix(c, '#000000', -amt); }
function rgba(c, a) { const [r, g, b] = hexToRgb(c); return `rgba(${r},${g},${b},${a})`; }

// ---------- şekiller ----------
function rrect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// Merkezli kalp (s = genişlik yarısı civarı)
function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * .95);
  ctx.bezierCurveTo(x - s * 1.25, y + s * .15, x - s * 1.05, y - s * 1.0, x, y - s * .38);
  ctx.bezierCurveTo(x + s * 1.05, y - s * 1.0, x + s * 1.25, y + s * .15, x, y + s * .95);
  ctx.closePath();
}
function starPath(ctx, x, y, r, n = 5, inner = .48, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * inner : r, a = rot + i * Math.PI / n; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath();
}
// Damla (sivri ucu yukarıda), (x,y) = gövde merkezi
function dropPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.55);
  ctx.bezierCurveTo(x + s * .35, y - s * .95, x + s, y - s * .45, x + s, y + s * .1);
  ctx.arc(x, y + s * .1, s, 0, Math.PI);
  ctx.bezierCurveTo(x - s, y - s * .45, x - s * .35, y - s * .95, x, y - s * 1.55);
  ctx.closePath();
}
// Parlak kabarcık
function bubble(ctx, x, y, r, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = 'rgba(233,252,255,0.18)'; ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * .12); ctx.strokeStyle = 'rgba(233,252,255,0.75)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(x - r * .35, y - r * .35, r * .22, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
  ctx.restore();
}
function softShadow(ctx, x, y, rx, ry, a = .25) {
  ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(0,20,40,${a})`); g.addColorStop(1, 'rgba(0,20,40,0)');
  ctx.fillStyle = g; ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.beginPath(); ctx.arc(x, y, rx, 0, TAU); ctx.fill(); ctx.restore();
}

// ---------- yazı ----------
// Kalın konturlu çocuk başlığı yazısı. o: size, fill, stroke, sw, weight, align, alpha, scale, rot, shadow
function txt(ctx, s, x, y, o = {}) {
  const size = o.size || 80, weight = o.weight || 800;
  ctx.save();
  ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); const sc = o.scale ?? 1; ctx.scale(sc, sc);
  ctx.font = `${weight} ${size}px "Baloo 2"`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const yo = size * .06; // Baloo optik merkez düzeltmesi
  const sw = o.sw ?? size * .17;
  if (o.shadow !== false && sw > 0) { ctx.fillStyle = 'rgba(5,20,40,0.28)'; ctx.lineWidth = sw; ctx.strokeStyle = 'rgba(5,20,40,0.28)'; ctx.strokeText(s, 0, yo + size * .07); }
  if (sw > 0) { ctx.lineWidth = sw; ctx.strokeStyle = o.stroke || PAL.navy; ctx.strokeText(s, 0, yo); }
  ctx.fillStyle = o.fill || PAL.white; ctx.fillText(s, 0, yo);
  ctx.restore();
}
function measure(ctx, s, size, weight = 800) { ctx.save(); ctx.font = `${weight} ${size}px "Baloo 2"`; const w = ctx.measureText(s).width; ctx.restore(); return w; }
// Kelimeler sırayla zıplayarak belirir. start: ilk kelime, stagger: kelime arası sn
function popWords(ctx, s, x, y, t, start, o = {}) {
  const words = s.split(' '), size = o.size || 80, gap = size * .28, stagger = o.stagger ?? .12;
  const ws = words.map(w => measure(ctx, w, size, o.weight));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let cx = x - total / 2;
  words.forEach((w, i) => {
    const sc = pop(t, start + i * stagger, .4);
    if (sc > 0) txt(ctx, w, cx + ws[i] / 2, y, { ...o, scale: sc * (o.scale ?? 1) });
    cx += ws[i] + gap;
  });
}
// Hap etiket. o: fill, color, size, scale, alpha, pad
function pill(ctx, s, x, y, o = {}) {
  const size = o.size || 44, sc = o.scale ?? 1; if (sc <= 0) return;
  const w = measure(ctx, s, size, o.weight || 800) + size * 1.1, h = size * 1.45;
  ctx.save(); ctx.globalAlpha *= (o.alpha ?? 1); ctx.translate(x, y); ctx.scale(sc, sc); if (o.rot) ctx.rotate(o.rot);
  ctx.fillStyle = 'rgba(5,20,40,0.25)'; rrect(ctx, -w / 2, -h / 2 + size * .12, w, h, h / 2); ctx.fill();
  ctx.fillStyle = o.fill || PAL.white; rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
  if (o.border !== false) { ctx.lineWidth = size * .09; ctx.strokeStyle = o.border || PAL.navy; ctx.stroke(); }
  txt(ctx, s, 0, 0, { size, fill: o.color || PAL.navy, sw: 0, shadow: false, weight: o.weight || 800 });
  ctx.restore();
}
// Çizgi + etiket: p (0..1) çizgi çizilme ilerlemesi, etiket p>.6'da zıplar
function callout(ctx, x1, y1, x2, y2, s, p, o = {}) {
  if (p <= 0) return;
  const q = ease.out(clamp(p / .6));
  ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([2, 16]); ctx.lineWidth = 8; ctx.strokeStyle = o.line || PAL.white;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, q), lerp(y1, y2, q)); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = o.line || PAL.white; ctx.beginPath(); ctx.arc(x1, y1, 9, 0, TAU); ctx.fill(); ctx.restore();
  const sc = p > .6 ? ease.outBack(clamp((p - .6) / .4)) : 0;
  pill(ctx, s, x2, y2, { ...o, scale: sc });
}

// ---------- sahne öğeleri ----------
// Süper güç rozeti — her bilgi sahnesinde aynı yerde (sol üst). lt: sahne yerel zamanı, dur: sahne süresi
function factBadge(ctx, n, title, lt, dur) {
  const inP = pop(lt, .15, .5), outP = 1 - ease.in(prog(lt, dur - .45, dur - .1));
  const sc = inP * outP; if (sc <= 0) return;
  ctx.save(); ctx.translate(150, 120); ctx.scale(sc, sc);
  // hap
  const w = measure(ctx, title, 50) + 150;
  ctx.fillStyle = 'rgba(5,20,40,0.25)'; rrect(ctx, 0, -42 + 7, w, 84, 42); ctx.fill();
  ctx.fillStyle = PAL.white; rrect(ctx, 0, -42, w, 84, 42); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.stroke();
  txt(ctx, title, 95 + (w - 95) / 2 - 10, 0, { size: 50, fill: PAL.navy, sw: 0, shadow: false });
  // yıldız rozeti
  const wob = Math.sin(lt * 3) * .06;
  ctx.save(); ctx.rotate(wob);
  starPath(ctx, 0, 6, 88, 8, .78); ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.fill();
  starPath(ctx, 0, 0, 88, 8, .78); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.navy; ctx.stroke();
  txt(ctx, String(n), 0, 2, { size: 92, fill: PAL.white, stroke: PAL.navy, sw: 16 });
  ctx.restore();
  ctx.restore();
}

// Okyanus arka planı. o: depth(0 sığ..1 derin), floor(bool), floorY, seaweed(bool), rays(bool), camX, bubbles(bool), particles(bool)
function drawOcean(ctx, t, o = {}) {
  const d = o.depth ?? .3, camX = o.camX || 0;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mix(PAL.sea1, '#0B3358', d));
  g.addColorStop(.55, mix(PAL.sea2, '#061E3A', d));
  g.addColorStop(1, mix(PAL.sea3, '#020C1C', d));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // ışık huzmeleri
  if (o.rays !== false) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const bx = (i * 360 + 120 - camX * .2) % (W + 400) - 200 + Math.sin(t * .4 + i) * 40;
      const a = (.05 + .03 * Math.sin(t * .7 + i * 1.7)) * (1 - d * .8);
      const gr = ctx.createLinearGradient(0, 0, 0, H * .9);
      gr.addColorStop(0, `rgba(255,255,230,${a})`); gr.addColorStop(1, 'rgba(255,255,230,0)');
      ctx.fillStyle = gr; ctx.beginPath();
      ctx.moveTo(bx, 0); ctx.lineTo(bx + 90 + i * 12, 0); ctx.lineTo(bx + 360 + i * 20, H * .9); ctx.lineTo(bx + 170, H * .9); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // plankton
  if (o.particles !== false) {
    const r = rng(7);
    ctx.save();
    for (let i = 0; i < 70; i++) {
      const px = ((r() * W + t * (8 + r() * 14) - camX * (.3 + r() * .4)) % W + W) % W;
      const py = ((r() * H - t * (4 + r() * 8)) % H + H) % H;
      const s = 1.5 + r() * 3.5;
      ctx.fillStyle = `rgba(230,255,255,${(.15 + r() * .35) * (.6 + .4 * Math.sin(t * 2 + i))})`;
      ctx.beginPath(); ctx.arc(px, py, s, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // zemin
  if (o.floor !== false) drawFloor(ctx, t, o.floorY ?? 900, camX, o.seaweed !== false, d);
  // kabarcık sütunları
  if (o.bubbles !== false) {
    const r = rng(21);
    for (let c = 0; c < 4; c++) {
      const cx = ((r() * W - camX * .8) % W + W) % W, spd = 60 + r() * 50;
      for (let k = 0; k < 6; k++) {
        const ph = (t * spd / H + k / 6 + r()) % 1;
        bubble(ctx, cx + Math.sin(t * 2 + k * 2) * 12, H - ph * (H + 80), 5 + ((k * 7 + c * 3) % 9), 1 - ph * .5);
      }
    }
  }
}
function drawFloor(ctx, t, fy, camX = 0, weeds = true, d = .3) {
  // arka tepe
  ctx.fillStyle = mix(PAL.sand2, '#123a52', .35 + d * .4);
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, fy - 40 + Math.sin((x + camX * .5) * .004) * 30 + Math.sin((x + camX * .5) * .011) * 10);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  // yosun (arka)
  if (weeds) seaweedRow(ctx, t, fy - 20, camX * .7, 3, mix(PAL.seaweed2, '#0c3a4a', .3 + d * .3), .85);
  // ön kum
  ctx.fillStyle = mix(PAL.sand, '#1d4d66', d * .55);
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, fy + 20 + Math.sin((x + camX) * .006 + 1) * 18);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  // çakıllar
  const r = rng(99);
  for (let i = 0; i < 26; i++) {
    const px = ((r() * W * 1.5 - camX) % W + W) % W, py = fy + 50 + r() * (H - fy - 60), s = 4 + r() * 9;
    ctx.fillStyle = mix(PAL.sand3, '#1d4d66', d * .5); ctx.beginPath(); ctx.ellipse(px, py, s * 1.4, s, 0, 0, TAU); ctx.fill();
  }
  if (weeds) seaweedRow(ctx, t, fy + 40, camX, 5, mix(PAL.seaweed, '#0c3a4a', d * .4), 1);
}
function seaweedRow(ctx, t, baseY, camX, seed, col, sc) {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const x = ((r() * W * 1.3 - camX) % (W + 200) + W + 200) % (W + 200) - 100;
    const h = (140 + r() * 180) * sc, n = 12, ph = r() * TAU;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath();
    const pts = [];
    for (let k = 0; k <= n; k++) { const s = k / n; pts.push([x + Math.sin(t * 1.3 + ph + s * 3) * 22 * s, baseY - s * h]); }
    for (let k = 0; k <= n; k++) { const s = k / n, w = 16 * (1 - s) + 3; ctx.lineTo(pts[k][0] - w, pts[k][1]); }
    for (let k = n; k >= 0; k--) { const s = k / n, w = 16 * (1 - s) + 3; ctx.lineTo(pts[k][0] + w, pts[k][1]); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

// Sahneler arası kabarcık geçişi. u: sınırdan uzaklık (-TR..+TR), negatif = kapanıyor
const TR = .42;
function bubbleWipe(ctx, u) {
  const p = 1 - Math.abs(u) / TR; if (p <= 0) return;
  const cols = 13, rows = 8, sx = W / (cols - 1), sy = H / (rows - 1), rmax = Math.max(sx, sy) * .78;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = hash(i * 31 + j * 7);
    // soldan-sağa, aşağıdan-yukarı dalga
    const delay = (i / cols) * .45 + (1 - j / rows) * .2 + k * .15;
    const q = clamp((p - delay * .55) / .45);
    const r = ease.outBack(q) * rmax;
    if (r <= 0) continue;
    const x = i * sx + (k - .5) * 40, y = j * sy + (hash(i + j * 13) - .5) * 40 - (u > 0 ? u : 0) * 300;
    ctx.fillStyle = (i + j) % 2 ? PAL.foam : PAL.foam2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (r > 30) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x - r * .38, y - r * .38, r * .14, 0, TAU); ctx.fill(); }
  }
}

// İlerleme göstergesi: 7 süper güç (sağ üst). Çocuğa "kaç tane kaldı" hissi = izlenme süresi.
// FACTS: bolum.js'te tanımlı [başlangıç, bitiş] listesi (bilgi sahneleri)
function drawProgress(ctx, t) {
  if (!FACTS.length) return;
  const f0 = FACTS[0][0], f1 = FACTS[FACTS.length - 1][1], n = FACTS.length;
  if (t < f0 || t >= f1) return;
  const a = win(t, f0 + .3, f1, .5, .4);
  ctx.save(); ctx.globalAlpha = a;
  const x0 = W - 80 - (n - 1) * 58, y = 90;
  ctx.fillStyle = 'rgba(5,20,40,0.35)'; rrect(ctx, x0 - 40, y - 34, (n - 1) * 58 + 80, 68, 34); ctx.fill();
  FACTS.forEach(([a0, b0], i) => {
    const x = x0 + i * 58, done = t >= b0, cur = t >= a0 && t < b0;
    if (done) { starPath(ctx, x, y, 24, 5, .5); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.navy; ctx.stroke(); }
    else if (cur) {
      const s = 1 + .15 * Math.sin(t * 6);
      starPath(ctx, x, y, 24 * s, 5, .5); ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.yellow; ctx.stroke();
    } else { ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill(); }
  });
  ctx.restore();
}
