// S6 — 4. SÜPER GÜÇ: KEMİKSİZ BEDEN (90–116 sn)
// Soru zamanı → minicik delik (Oki'nin gözü kadar) → EVET/HAYIR → 3-2-1 → Oki sıkışıp geçer
// → kemik yok (balık iskeleti vs Oki) → gaga ≈ papağan gagası → "gaga sığar → bütün Oki sığar" denklemi
const S06_HOLE = { x: 1240, y: 640, rx: 30, ry: 44 };

// ---------- kaya duvar (soldan 3/4 bakış: sol yüzü görünür, sağ kenar = uzak kenar) ----------
function s06_edgeL(y) { return 1150 + Math.sin(y * .013) * 12 + Math.sin(y * .041 + 1) * 5; }
function s06_edgeR(y) { return 1334 + Math.sin(y * .011 + 2) * 12 + Math.sin(y * .037 + 1) * 5; }
function s06_wallPath(ctx, begin = true) {
  if (begin) ctx.beginPath();
  ctx.moveTo(s06_edgeL(-80), -80);
  for (let y = -50; y <= 1000; y += 30) ctx.lineTo(s06_edgeL(y), y);
  ctx.lineTo(s06_edgeL(1000), 1000); ctx.lineTo(s06_edgeR(1000), 1000);
  for (let y = 980; y >= -80; y -= 30) ctx.lineTo(s06_edgeR(y), y);
  ctx.closePath();
}
function s06_wall(ctx) {
  const c = PAL.rock, { x: hx, y: hy } = S06_HOLE;
  softShadow(ctx, 1250, 985, 260, 36, .3);
  s06_wallPath(ctx);
  const g = ctx.createLinearGradient(1150, 0, 1340, 0);
  g.addColorStop(0, shade(c, .2)); g.addColorStop(.7, c); g.addColorStop(1, shade(c, -.18));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); s06_wallPath(ctx); ctx.clip();
  // perspektif derz çizgileri (uzak kenarda deliğin hizasına yakınsar)
  ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = rgba(PAL.rock2, .5);
  [-20, 170, 360, 505, 790, 930].forEach(yy => {
    const y2 = hy + (yy - hy) * .84;
    ctx.beginPath(); ctx.moveTo(1140, yy); ctx.quadraticCurveTo(1245, lerp(yy, y2, .5) + 10, 1345, y2); ctx.stroke();
  });
  const r = rng(61);
  for (let i = 0; i < 30; i++) {
    const yy = -60 + r() * 1080, xx = 1165 + r() * 150, rr = 6 + r() * 16;
    if (Math.hypot((xx - hx) / 70, (yy - hy) / 90) < 1.25) continue;
    ctx.fillStyle = i % 3 ? rgba(PAL.rock2, .35) : 'rgba(255,255,255,0.14)';
    ctx.beginPath(); ctx.ellipse(xx, yy, rr * .7, rr, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(1135, -100, 30, 1200);
  ctx.restore();
  s06_wallPath(ctx); ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = shade(c, -.42); ctx.stroke();
  ctx.fillStyle = mix(PAL.sand, '#1d4d66', .17);
  ctx.beginPath(); ctx.ellipse(1242, 972, 220, 46, 0, 0, TAU); ctx.fill();
}
function s06_holeBack(ctx, glow) {
  const { x, y, rx, ry } = S06_HOLE, R = ry * 3.3;
  const g = ctx.createRadialGradient(x, y, ry * .5, x, y, R);
  g.addColorStop(0, rgba(PAL.yellow, .5 * glow)); g.addColorStop(1, rgba(PAL.yellow, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = shade(PAL.rock2, -.5); ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);
  const g2 = ctx.createRadialGradient(x + 9, y, 0, x + 9, y, ry * .85);
  g2.addColorStop(0, '#FFFBE6'); g2.addColorStop(.55, rgba(PAL.yellow, .95)); g2.addColorStop(1, rgba(PAL.yellow, 0));
  ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(x + 9, y, rx * .75, ry * .82, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function s06_holeRim(ctx) {
  const { x, y, rx, ry } = S06_HOLE;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = shade(PAL.rock, -.42); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, rx + 6, ry + 6, 0, Math.PI * .55, Math.PI * 1.1); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineCap = 'round'; ctx.stroke();
}

// ---------- arayüz öğeleri ----------
function s06_banner(ctx, x, y, sc, lt) {
  if (sc <= 0) return;
  const label = 'SORU ZAMANI!', size = 112, w = measure(ctx, label, size) + 130, h = 180;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(Math.sin(lt * 2.2) * .025);
  ctx.lineJoin = 'round';
  [-1, 1].forEach(sd => {
    const xi = sd * (w / 2 - 40), xo = sd * (w / 2 + 115), y0 = -h / 2 + 50, y1 = h / 2 + 38;
    ctx.beginPath(); ctx.moveTo(xi, y0); ctx.lineTo(xo, y0); ctx.lineTo(sd * (w / 2 + 70), (y0 + y1) / 2); ctx.lineTo(xo, y1); ctx.lineTo(xi, y1); ctx.closePath();
    ctx.fillStyle = PAL.coral; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.navy; ctx.stroke();
  });
  ctx.fillStyle = 'rgba(5,20,40,0.28)'; rrect(ctx, -w / 2, -h / 2 + 12, w, h, 34); ctx.fill();
  ctx.fillStyle = PAL.yellow; rrect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; rrect(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 22); ctx.stroke(); ctx.setLineDash([]);
  txt(ctx, label, 0, 4, { size, fill: PAL.white, stroke: PAL.navy, sw: 22 });
  ctx.restore();
}
const S06_Q = [[330, 330, 110, -.3], [210, 640, 92, .25], [430, 800, 80, -.15], [650, 255, 80, .2], [1290, 255, 88, -.2],
  [1610, 330, 118, .3], [1730, 640, 92, -.25], [1500, 800, 80, .2], [720, 650, 70, .35], [1200, 665, 72, -.3], [960, 240, 66, 0], [1640, 900, 64, .3], [280, 910, 60, -.2]];
function s06_qmarks(ctx, lt) {
  const cols = [PAL.yellow, PAL.mint, PAL.pink, PAL.foam, PAL.coral];
  S06_Q.forEach(([qx, qy, sz, rot], i) => {
    const st = .4 + hash(i + 3) * .35, sc = pop(lt, st, .5) * (1 - ease.in(prog(lt, 2.75 + hash(i) * .2, 3.25)));
    if (sc <= 0) return;
    const k = ease.out(prog(lt, st, st + .6));
    const x = lerp(960, qx, k), y = lerp(440, qy, k) + Math.sin(lt * 2.2 + i) * 12;
    txt(ctx, '?', x, y, { size: sz, fill: cols[i % 5], rot: rot + Math.sin(lt * 3 + i) * .12, scale: sc });
  });
}
function s06_icon(ctx, yes, x, y, r) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = r * .3;
  ctx.strokeStyle = yes ? shade(PAL.mint, -.42) : shade(PAL.coral, -.3); ctx.beginPath();
  if (yes) { ctx.moveTo(-r * .45, 0); ctx.lineTo(-r * .1, r * .36); ctx.lineTo(r * .48, -r * .36); }
  else { ctx.moveTo(-r * .36, -r * .36); ctx.lineTo(r * .36, r * .36); ctx.moveTo(r * .36, -r * .36); ctx.lineTo(-r * .36, r * .36); }
  ctx.stroke(); ctx.restore();
}
function s06_button(ctx, yes, x, y, sc, glow, lt) {
  if (sc <= 0) return;
  const fill = yes ? PAL.mint : PAL.coral, line = shade(fill, -.42), w = 470, h = 170, label = yes ? 'EVET' : 'HAYIR';
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  if (glow > 0) {
    ctx.save(); ctx.rotate(lt * .6);
    for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.fillStyle = rgba(PAL.yellow, .35 * glow); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, -420); ctx.lineTo(40, -420); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    const g = ctx.createRadialGradient(0, 0, 80, 0, 0, 360);
    g.addColorStop(0, rgba(PAL.yellow, .6 * glow)); g.addColorStop(1, rgba(PAL.yellow, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 360, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(5,20,40,0.3)'; rrect(ctx, -w / 2, -h / 2 + 28, w, h, 52); ctx.fill();
  ctx.fillStyle = shade(fill, -.22); rrect(ctx, -w / 2, -h / 2 + 16, w, h, 52); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = line; ctx.stroke();
  ctx.fillStyle = fill; rrect(ctx, -w / 2, -h / 2, w, h, 52); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.38)'; rrect(ctx, -w / 2 + 34, -h / 2 + 16, w - 68, 24, 12); ctx.fill();
  s06_icon(ctx, yes, -w / 2 + 82, 6, 46);
  txt(ctx, label, 52, 8, { size: 88, fill: PAL.white, stroke: line, sw: 16 });
  ctx.restore();
}
function s06_countdown(ctx, lt) {
  const a = pop(lt, 10.05, .4) * (1 - ease.in(prog(lt, 13.3, 13.6)));
  if (a <= 0) return;
  ctx.save(); ctx.translate(960, 410); ctx.scale(a, a);
  ctx.fillStyle = 'rgba(5,20,40,0.3)'; ctx.beginPath(); ctx.arc(0, 12, 172, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(0, 0, 172, 0, TAU); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.lineWidth = 28; ctx.strokeStyle = rgba(PAL.navy, .12); ctx.beginPath(); ctx.arc(0, 0, 136, 0, TAU); ctx.stroke();
  const p = 1 - prog(lt, 10.3, 13.3);
  if (p > .002) { ctx.lineCap = 'round'; ctx.strokeStyle = p > .34 ? PAL.yellow : PAL.coral; ctx.beginPath(); ctx.arc(0, 0, 136, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke(); }
  for (let i = 0; i < 3; i++) { const an = -Math.PI / 2 + i * TAU / 3; ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.arc(Math.cos(an) * 136, Math.sin(an) * 136, 7, 0, TAU); ctx.fill(); }
  if (lt >= 10.3) {
    const n = lt < 11.3 ? 3 : lt < 12.3 ? 2 : 1, t0 = [12.3, 11.3, 10.3][n - 1];
    const sc = pop(lt, t0, .35) * (1 + .12 * Math.exp(-(lt - t0) * 6));
    txt(ctx, String(n), 0, 8, { size: 200, fill: PAL.coral, stroke: PAL.navy, sw: 24, scale: sc });
  }
  ctx.restore();
}
function s06_confetti(ctx, cx, cy, lt, t0, seed, n = 46) {
  const p = lt - t0; if (p < 0 || p > 2.4) return;
  const r = rng(seed), cols = [PAL.yellow, PAL.mint, PAL.pink, PAL.coral, PAL.foam, PAL.purple];
  ctx.save(); ctx.globalAlpha *= 1 - clamp((p - 1.6) / .8);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU, v = 380 + r() * 760, spin = (r() - .5) * 16, w = 12 + r() * 12, k = 2.4;
    const d = v * (1 - Math.exp(-k * p)) / k;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .8 + 170 * p * p;
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin * p + a);
    ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-w / 2, -w * .3, w, w * .6);
    ctx.restore();
  }
  ctx.restore();
}
function s06_check(ctx, x, y, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.beginPath(); ctx.arc(0, 7, 46, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.mint; ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = shade(PAL.mint, -.42); ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.strokeStyle = PAL.white;
  ctx.beginPath(); ctx.moveTo(-20, 1); ctx.lineTo(-6, 16); ctx.lineTo(21, -15); ctx.stroke();
  ctx.restore();
}
function s06_speed(ctx, lt, v) {
  const a = clamp(Math.abs(v) / 2600) * .55; if (a < .02) return;
  ctx.save(); ctx.strokeStyle = `rgba(233,252,255,${a})`; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const y = 140 + hash(i + 1) * 820, len = 180 + hash(i + 7) * 320;
    const x = ((hash(i + 3) * 2400 - lt * 2600) % 2400 + 2400) % 2400 - 240;
    ctx.lineWidth = 4 + hash(i + 11) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  ctx.restore();
}

// ---------- kemik yok ----------
function s06_fishbone(ctx, x, y, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(5,20,40,0.32)'; ctx.beginPath(); ctx.arc(10, 0, 262, 0, TAU); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,252,255,0.55)'; ctx.stroke();
  const bones = () => {
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(125, 0);
    for (let i = 0; i < 5; i++) {
      const bx = -105 + i * 50, hh = 92 - Math.abs(i - 2) * 12;
      ctx.moveTo(bx + 18, 0); ctx.quadraticCurveTo(bx + 4, -hh * .55, bx - 16, -hh);
      ctx.moveTo(bx + 18, 0); ctx.quadraticCurveTo(bx + 4, hh * .55, bx - 16, hh);
    }
    ctx.moveTo(-150, 0); ctx.lineTo(-218, -64); ctx.lineTo(-206, 0); ctx.lineTo(-218, 64); ctx.lineTo(-150, 0);
  };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  bones(); ctx.lineWidth = 28; ctx.strokeStyle = PAL.navy; ctx.stroke();
  // kafatası
  const skull = () => { ctx.beginPath(); ctx.moveTo(112, -74); ctx.quadraticCurveTo(232, -66, 256, 8); ctx.quadraticCurveTo(206, 66, 112, 64); ctx.quadraticCurveTo(94, 0, 112, -74); ctx.closePath(); };
  skull(); ctx.lineWidth = 16; ctx.stroke();
  bones(); ctx.lineWidth = 15; ctx.strokeStyle = PAL.white; ctx.stroke();
  skull(); ctx.fillStyle = PAL.white; ctx.fill();
  ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.arc(178, -14, 18, 0, TAU); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.moveTo(206, 30); ctx.quadraticCurveTo(224, 34, 240, 22); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(172, -20, 5, 0, TAU); ctx.fill();
  ctx.restore();
}
function s06_boneIcon(ctx, x, y, sc, slash) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.fill();
  ctx.save(); ctx.rotate(-.5);
  const shape = () => { ctx.beginPath(); rrect(ctx, -52, -15, 104, 30, 8); [[-54, -17], [-54, 17], [54, -17], [54, 17]].forEach(([a, b]) => { ctx.moveTo(a + 21, b); ctx.arc(a, b, 21, 0, TAU); }); };
  shape(); ctx.lineWidth = 14; ctx.strokeStyle = PAL.navy; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = mix(PAL.sand, PAL.white, .55); ctx.fill();
  ctx.restore();
  ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = PAL.heart;
  ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.stroke();
  if (slash > 0) { const q = 65 * (2 * ease.out(clamp(slash)) - 1); ctx.beginPath(); ctx.moveTo(-65, -65); ctx.lineTo(q, q); ctx.stroke(); }
  ctx.restore();
}

// ---------- gaga ----------
function s06_parrot(ctx, x, y, s, lt, glow) {
  const blue = mix(PAL.blueBlood, PAL.sea2, .15), bl = shade(blue, -.42), grn = mix(PAL.mint, PAL.seaweed, .45);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(lt * 2) * .04);
  ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.fillStyle = blue; ctx.beginPath(); ctx.ellipse(-50, 200, 130, 120, -.2, 0, TAU); ctx.fill(); ctx.strokeStyle = bl; ctx.stroke();
  ctx.fillStyle = PAL.yellow; ctx.beginPath(); ctx.ellipse(28, 196, 100, 112, .15, 0, TAU); ctx.fill(); ctx.strokeStyle = shade(PAL.yellow, -.42); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 118, 124, 0, 0, TAU); ctx.fillStyle = blue; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = grn; ctx.beginPath(); ctx.ellipse(14, -118, 124, 70, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.ellipse(64, 20, 62, 74, -.15, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(PAL.navy, .5); ctx.lineWidth = 4; ctx.lineCap = 'round';
  [[34, 44], [46, 62], [62, 78]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a + 24, b - 5); ctx.stroke(); });
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-52, -58, 34, 15, -.6, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 0, 118, 124, 0, 0, TAU); ctx.lineWidth = 7; ctx.strokeStyle = bl; ctx.stroke();
  const bph = lt % 2.7, bk = bph < .18 ? Math.sin(bph / .18 * Math.PI) : 0;
  ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.ellipse(56, -12, 17, 17 * (1 - bk * .9), 0, 0, TAU); ctx.fill();
  if (bk < .5) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(50, -18, 6, 0, TAU); ctx.fill(); }
  ctx.fillStyle = rgba(PAL.blush, .4); ctx.beginPath(); ctx.ellipse(86, 40, 15, 9, 0, 0, TAU); ctx.fill();
  if (glow > 0) {
    const g = ctx.createRadialGradient(130, 32, 10, 130, 32, 120);
    g.addColorStop(0, rgba(PAL.yellow, .75 * glow)); g.addColorStop(1, rgba(PAL.yellow, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(130, 32, 120, 0, TAU); ctx.fill();
  }
  drawBeak(ctx, 130, 34, 92);
  ctx.restore();
}
function s06_frame(ctx, x, y, R, sc, top, bot, inner) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(5,20,40,0.3)'; ctx.beginPath(); ctx.arc(0, 12, R, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(0, -R, 0, R); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip(); inner(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.lineWidth = 16; ctx.strokeStyle = PAL.white; ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(0, 0, R + 8, 0, TAU); ctx.stroke();
  ctx.restore();
}
function s06_approx(ctx, x, y, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.lineCap = 'round';
  const wav = dy => { ctx.beginPath(); ctx.moveTo(-40, dy); ctx.bezierCurveTo(-18, dy - 20, 0, dy + 18, 16, dy); ctx.bezierCurveTo(24, dy - 10, 34, dy - 10, 40, dy - 6); };
  [-17, 17].forEach(dy => { wav(dy); ctx.lineWidth = 26; ctx.strokeStyle = PAL.navy; ctx.stroke(); });
  [-17, 17].forEach(dy => { wav(dy); ctx.lineWidth = 12; ctx.strokeStyle = PAL.white; ctx.stroke(); });
  ctx.restore();
}
function s06_ring(ctx, x, y, front) {
  const rx = 34, ry = 76, a0 = front ? -Math.PI / 2 : Math.PI / 2;
  ctx.save(); ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, a0, a0 + Math.PI);
  ctx.lineWidth = 36; ctx.strokeStyle = shade(PAL.rock, -.42); ctx.stroke();
  ctx.lineWidth = 23; ctx.strokeStyle = front ? shade(PAL.rock, .32) : shade(PAL.rock, .08); ctx.stroke();
  if (front) { ctx.beginPath(); ctx.ellipse(x, y, rx + 4, ry + 4, 0, -1.25, -.35); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.stroke(); }
  ctx.restore();
}
function s06_arrow(ctx, x, y, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.lineJoin = 'round';
  const p = () => { ctx.beginPath(); ctx.moveTo(-72, -22); ctx.lineTo(8, -22); ctx.lineTo(8, -52); ctx.lineTo(72, 0); ctx.lineTo(8, 52); ctx.lineTo(8, 22); ctx.lineTo(-72, 22); ctx.closePath(); };
  ctx.save(); ctx.translate(0, 8); p(); ctx.fillStyle = 'rgba(5,20,40,0.28)'; ctx.fill(); ctx.restore();
  p(); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.restore();
}

// ---------- kamera + Oki durumu ----------
function s06_cam(lt) {
  if (lt < 15.5) return 240 * ease.inOut(prog(lt, 13.9, 15.0));
  return lerp(240, 1500, ease.inOut(prog(lt, 15.5, 16.1)));
}
function s06_oki(lt) {
  const o = { seed: 3, pose: 'idle', eye: 'open', mouth: 'smile', look: { x: 0, y: 0 } };
  let x = 600, y = 800 + Math.sin(lt * 1.7) * 8, s = 1.25, upright = true;
  if (lt < 3.7) {
    const m = ease.inOut(prog(lt, 2.9, 3.7));
    x = lerp(960, 600, m); y = lerp(890, 800, m) + Math.sin(lt * 2.4) * 10; s = lerp(1.0, 1.25, m);
    o.pose = blendPose('idle', 'cheer', win(lt, .5, 3.0, .3, .4));
    o.eye = lt > .9 && lt < 1.7 ? 'happy' : 'open'; o.mouth = 'grin';
    o.look = { x: m, y: -1 + .55 * m };
    if (lt > 2.9) { o.eye = 'surprised'; o.brow = 'raised'; o.mouth = 'o'; }
  } else if (lt < 8.0) {
    o.eye = 'surprised'; o.brow = 'raised'; o.mouth = 'o'; o.look = { x: 1, y: -.45 };
    if (lt > 6.4) { o.mouth = 'wavy'; o.brow = 'worried'; }
  } else if (lt < 13.6) {
    o.mouth = lt < 10.3 ? 'wavy' : 'o'; o.brow = 'raised';
    o.look = { x: Math.sin(lt * 1.3) * .7, y: -.85 };
  } else if (lt < 14.0) {
    o.eye = 'happy'; o.mouth = 'grin'; o.pose = blendPose('idle', 'cheer', win(lt, 13.6, 14.0, .1, .15));
    y -= 36 * Math.sin(Math.PI * prog(lt, 13.6, 14.0));
  } else if (lt < 15.1) {
    upright = false;
    const k = ease.inOut(prog(lt, 14.0, 14.45)), k2 = ease.inOut(prog(lt, 14.45, 15.1));
    const headL = 210 * s * 1.25, x0 = 1240 - headL;
    o.rot = k * Math.PI / 2; o.sx = lerp(1, .28, k); o.sy = lerp(1, 1.25, k);
    o.pose = blendPose('idle', 'squeeze', k);
    x = lerp(600, x0, k) + (1690 - x0) * k2; y = lerp(y, 640, k);
    o.brow = 'determined'; o.mouth = k2 > 0 ? 'o' : 'flat'; o.look = { x: 0, y: -1 };
  } else {
    const k3 = prog(lt, 15.1, 15.5), el = ease.outElastic(k3), e = ease.inOut(prog(lt, 15.5, 16.1));
    upright = k3 > .6;
    o.rot = Math.PI / 2 * (1 - ease.out(k3)); o.sx = lerp(.28, 1, el); o.sy = lerp(1.25, 1, el);
    o.pose = lt < 15.6 ? blendPose('squeeze', 'cheer', ease.out(k3)) : blendPose('cheer', 'idle', ease.inOut(prog(lt, 15.6, 16.3)));
    x = lerp(1690, 1640, ease.out(k3)) + (2830 - 1640) * e;
    y = lerp(640, 800, ease.out(k3)) + Math.sin(lt * 1.7) * 8 * k3;
    o.eye = 'happy'; o.mouth = 'grin';
    if (lt > 16.1) { o.eye = 'open'; o.mouth = 'smile'; o.look = { x: -1, y: -.1 }; }
    if (lt > 17.0) { o.eye = 'happy'; o.mouth = 'grin'; }
    if (lt > 18.6) { o.eye = 'open'; o.mouth = lt < 20.2 ? 'open' : 'smile'; o.look = { x: -.9, y: -.6 }; o.brow = lt > 20.4 ? 'raised' : null; }
    o.xray = win(lt, 16.3, 18.9, .5, .5);
    s *= 1 - ease.inBack(prog(lt, 21.9, 22.3));
  }
  return { x, y, s, o, upright };
}

registerScene({
  id: 's06_quiz', start: T.s06[0], end: T.s06[1],
  cues: [
    { t: .45, sfx: 'drum', vol: .7 }, { t: 2.95, sfx: 'whoosh', vol: .45 }, { t: 4.4, sfx: 'shimmer', vol: .45 },
    { t: 5.5, sfx: 'pop', vol: .5 }, { t: 8.0, sfx: 'boing', vol: .5 },
    { t: 10.3, sfx: 'tick', vol: .6 }, { t: 11.3, sfx: 'tick', vol: .6 }, { t: 12.3, sfx: 'tick', vol: .6 },
    { t: 13.6, sfx: 'tada', vol: .7 }, { t: 14.45, sfx: 'squish', vol: .7 }, { t: 15.15, sfx: 'pop', vol: .6 },
    { t: 15.55, sfx: 'whoosh', vol: .5 }, { t: 16.35, sfx: 'shimmer', vol: .45 }, { t: 17.0, sfx: 'pop', vol: .5 },
    { t: 18.9, sfx: 'sparkle', vol: .5 }, { t: 20.3, sfx: 'pop', vol: .5 }, { t: 22.35, sfx: 'bubble', vol: .45 },
    { t: 23.05, sfx: 'ding', vol: .55 }, { t: 23.75, sfx: 'squish', vol: .5 }, { t: 24.6, sfx: 'tada', vol: .55 }
  ],
  draw(ctx, lt, t) {
    const cam = s06_cam(lt), camV = (s06_cam(lt + .02) - cam) / .02;
    const z = 1 + .05 * ease.inOut(prog(lt, 3.4, 7.6)) * (1 - ease.inOut(prog(lt, 7.7, 8.3))) + .22 * ease.inOut(win(lt, 14.05, 15.55, .45, .45));
    const zx = lt < 12 ? 900 : 1240 - cam, zy = 640;
    const O = s06_oki(lt);
    ctx.save();
    ctx.translate(zx, zy); ctx.scale(z, z); ctx.translate(-zx, -zy);
    drawOcean(ctx, t, { depth: .3, camX: cam });

    // ======= DÜNYA =======
    ctx.save(); ctx.translate(-cam, 0);
    const wOff = 900 * (1 - ease.out(prog(lt, 2.9, 3.7)));
    const wallOn = lt > 2.85 && cam < 1360;
    const glow = .75 + .25 * Math.sin(lt * 4);
    if (wallOn) { ctx.save(); ctx.translate(wOff, 0); s06_wall(ctx); s06_holeBack(ctx, glow * (lt < 14.4 ? 1 : .5)); ctx.restore(); }

    if (O.s > 0) {
      if (O.upright) softShadow(ctx, O.x, lt < 3.7 ? 1030 : 1000, 210 * O.s, 30, .22);
      ctx.save();
      if (wallOn && lt > 13.9 && lt < 15.6) {
        ctx.beginPath(); ctx.rect(-3000, -1000, 9000, 3000);
        s06_wallPath(ctx, false); const H6 = S06_HOLE; ctx.moveTo(H6.x + H6.rx, H6.y); ctx.ellipse(H6.x, H6.y, H6.rx, H6.ry, 0, 0, TAU);
        ctx.clip('evenodd');
      }
      drawOki(ctx, O.x, O.y, O.s, O.o, lt);
      ctx.restore();
      // gaga parlaması (gaga bölümü)
      const bg = win(lt, 18.8, 22.0, .3, .3);
      if (bg > 0) {
        const [bx, by] = okiPoint('beak', O.x, O.y, O.s, O.o), pr = 1 + .12 * Math.sin(lt * 6);
        const g = ctx.createRadialGradient(bx, by, 5, bx, by, 80 * pr);
        g.addColorStop(0, rgba(PAL.yellow, .85 * bg)); g.addColorStop(1, rgba(PAL.yellow, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 80 * pr, 0, TAU); ctx.fill();
        drawBeak(ctx, bx, by, 38 * O.s, bg);
        ctx.save(); ctx.globalAlpha *= bg; ctx.lineWidth = 6; ctx.strokeStyle = PAL.yellow; ctx.beginPath(); ctx.arc(bx, by, 52 * pr, 0, TAU); ctx.stroke(); ctx.restore();
      }
    }
    if (wallOn) { ctx.save(); ctx.translate(wOff, 0); s06_holeRim(ctx); ctx.restore(); }

    // delik ↔ göz karşılaştırması
    const cmpA = win(lt, 5.2, 7.9, .2, .35);
    if (cmpA > 0 && O.s > 0) {
      const [ex, ey] = okiPoint('eyeR', O.x, O.y, O.s, O.o), H6 = S06_HOLE;
      const r1 = pop(lt, 5.3, .4), r2 = pop(lt, 5.6, .4), lp = ease.out(prog(lt, 5.85, 6.3));
      ctx.save(); ctx.globalAlpha *= cmpA; ctx.lineCap = 'round';
      [[ex, ey, 54 * r1], [H6.x, H6.y, 62 * r2]].forEach(([cx, cy, rr]) => {
        if (rr <= 0) return;
        ctx.lineWidth = 15; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke();
        ctx.lineWidth = 8; ctx.strokeStyle = PAL.yellow; ctx.stroke();
      });
      if (lp > 0) {
        const ax = ex + 60, ay = ey, bx = H6.x - 68, by = H6.y;
        ctx.setLineDash([2, 16]); ctx.lineWidth = 8; ctx.strokeStyle = PAL.white;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, lp), lerp(ay, by, lp)); ctx.stroke(); ctx.setLineDash([]);
        const es = pop(lt, 6.25, .4);
        if (es > 0) {
          const mx = (ax + bx) / 2, my = (ay + by) / 2;
          ctx.save(); ctx.translate(mx, my); ctx.scale(es, es);
          ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.stroke();
          txt(ctx, '=', 0, 0, { size: 64, fill: PAL.navy, sw: 0, shadow: false });
          ctx.restore();
        }
      }
      ctx.restore();
      pill(ctx, 'MİNİCİK!', H6.x, H6.y - 132, { size: 46, fill: PAL.yellow, scale: pop(lt, 6.6) * cmpA });
    }

    // kemik yok: balık iskeleti ↔ Oki (dünya: kamera 1500'de durur)
    const fbS = pop(lt, 16.0, .5) * (1 - ease.inBack(prog(lt, 18.35, 18.75)));
    s06_fishbone(ctx, 2020, 540, fbS);
    const biS = pop(lt, 16.85, .45) * (1 - ease.inBack(prog(lt, 18.35, 18.75)));
    s06_boneIcon(ctx, 2830, 405, biS * .95, prog(lt, 17.05, 17.45));
    pill(ctx, 'KEMİK YOK!', 2830, 250, { size: 56, fill: PAL.yellow, scale: pop(lt, 17.3) * (1 - ease.inBack(prog(lt, 18.35, 18.75))) });
    ctx.restore(); // dünya

    ctx.restore(); // zoom

    // ======= ARAYÜZ =======
    s06_speed(ctx, lt, camV);
    // karartma + düğmeler + geri sayım
    const dim = win(lt, 7.9, 13.9, .4, .35);
    if (dim > 0) { ctx.fillStyle = rgba(PAL.navy, .45 * dim); ctx.fillRect(0, 0, W, H); }
    const mv = ease.inOut(prog(lt, 9.8, 10.3));
    const yesIn = pop(lt, 8.0, .45), noIn = pop(lt, 8.22, .45);
    const pulseY = 1 + .12 * Math.sin(Math.PI * prog(lt, 8.5, 9.1)), pulseN = 1 + .12 * Math.sin(Math.PI * prog(lt, 9.1, 9.7));
    if (lt < 13.6) {
      s06_button(ctx, true, lerp(700, 520, mv), lerp(400, 420, mv), yesIn * pulseY * lerp(1, .72, mv), 0, lt);
      s06_button(ctx, false, lerp(1220, 1400, mv), lerp(400, 420, mv), noIn * pulseN * lerp(1, .72, mv), 0, lt);
    } else {
      const k = ease.out(prog(lt, 13.6, 14.0)), out = 1 - ease.inBack(prog(lt, 15.3, 15.6));
      s06_button(ctx, false, 1400, 420, .72 * (1 - ease.inBack(prog(lt, 13.6, 13.95))), 0, lt);
      const gl = win(lt, 13.6, 14.7, .12, .45);
      s06_button(ctx, true, lerp(520, 960, k), lerp(420, 318, k), lerp(.72, 1.1, ease.outBack(prog(lt, 13.6, 14.0))) * out * (1 + .05 * Math.sin(lt * 9) * gl), gl, lt);
      s06_confetti(ctx, 960, 318, lt, 13.65, 616);
    }
    s06_countdown(ctx, lt);

    // gaga: büyüteç + papağan
    const magS = pop(lt, 18.9, .5) * (1 - ease.inBack(prog(lt, 21.9, 22.3)));
    if (magS > 0 && O.s > 0) {
      const [bx, by] = okiPoint('beak', O.x - cam, O.y, O.s, O.o), mx = 1000, my = 470, R = 170 * magS;
      const an = Math.atan2(my - by, mx - bx), px = -Math.sin(an) * R * .92, py = Math.cos(an) * R * .92;
      ctx.fillStyle = 'rgba(233,252,255,0.2)'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(mx + px, my + py); ctx.lineTo(mx - px, my - py); ctx.closePath(); ctx.fill();
    }
    s06_frame(ctx, 1000, 470, 170, magS, PAL.foam, PAL.foam2, () => {
      const g = ctx.createRadialGradient(0, 10, 10, 0, 10, 150);
      g.addColorStop(0, rgba(PAL.yellow, .7 + .2 * Math.sin(lt * 5))); g.addColorStop(1, rgba(PAL.yellow, 0));
      ctx.fillStyle = g; ctx.fillRect(-170, -170, 340, 340);
      drawBeak(ctx, 0, 14, 158);
      for (let i = 0; i < 3; i++) {
        const a = lt * 1.4 + i * TAU / 3, tw = .6 + .4 * Math.sin(lt * 7 + i * 2);
        starPath(ctx, Math.cos(a) * 118, Math.sin(a) * 110, 14 * tw, 4, .4); ctx.fillStyle = PAL.white; ctx.fill();
      }
    });
    pill(ctx, 'GAGA', 1000, 700, { size: 54, fill: PAL.yellow, scale: pop(lt, 19.5) * (1 - ease.inBack(prog(lt, 21.9, 22.3))) });
    const parS = pop(lt, 20.3, .5) * (1 - ease.inBack(prog(lt, 21.95, 22.35)));
    s06_frame(ctx, 440, 480, 190, parS, mix(PAL.foam, PAL.yellow, .15), PAL.sea1, () => s06_parrot(ctx, -40, 10, .9, lt, win(lt, 20.8, 22.0, .3, .2)));
    s06_approx(ctx, 728, 475, pop(lt, 20.8, .4) * (1 - ease.inBack(prog(lt, 21.9, 22.3))));

    // denklem: gaga sığar → bütün Oki sığar
    if (lt > 22.2) {
      const eqA = 1, rS = pop(lt, 22.3, .45);
      // sol halka + gaga
      if (rS > 0) {
        ctx.save(); ctx.translate(560, 540); ctx.scale(rS * 1.3, rS * 1.3); ctx.translate(-560, -540);
        softShadow(ctx, 560, 700, 120, 18, .22);
        s06_ring(ctx, 560, 540, false);
        const bp = ease.out(prog(lt, 22.45, 22.95)), bxp = lerp(360, 560, bp);
        if (lt > 22.4) {
          const g = ctx.createRadialGradient(bxp, 545, 5, bxp, 545, 90); g.addColorStop(0, rgba(PAL.yellow, .7)); g.addColorStop(1, rgba(PAL.yellow, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bxp, 545, 90, 0, TAU); ctx.fill();
          drawBeak(ctx, bxp, 545 + Math.sin(lt * 3) * 3, 80);
        }
        s06_ring(ctx, 560, 540, true);
        ctx.restore();
      }
      s06_check(ctx, 560, 385, pop(lt, 23.05, .4) * eqA);
      pill(ctx, 'GAGA', 560, 790, { size: 46, fill: PAL.white, scale: pop(lt, 22.7) });
      s06_arrow(ctx, 900, 540 + Math.sin(lt * 4) * 4, pop(lt, 23.3, .4));
      // sağ halka + Oki
      const rS2 = pop(lt, 23.45, .45);
      if (rS2 > 0) {
        const RX = 1420, RY = 540;
        ctx.save(); ctx.translate(RX, RY); ctx.scale(rS2 * 1.3, rS2 * 1.3); ctx.translate(-RX, -RY);
        softShadow(ctx, RX, 700, 120, 18, .22);
        s06_ring(ctx, RX, RY, false);
        const ok = lt > 23.5;
        if (ok) {
          const k = ease.inOut(prog(lt, 23.7, 24.5)), k3 = prog(lt, 24.5, 24.9), el = ease.outElastic(k3);
          const so = { seed: 6, pose: k3 > 0 ? blendPose('squeeze', 'cheer', ease.out(k3)) : 'squeeze', rot: Math.PI / 2 * (1 - ease.out(k3)),
            sx: lerp(.72, 1, el), sy: lerp(1.25, 1, el), eye: k3 > 0 ? 'happy' : 'open', mouth: k3 > 0 ? 'grin' : 'o', look: { x: 0, y: -1 }, brow: k3 > 0 ? null : 'determined' };
          const ox = lerp(1260, 1640, k) - 60 * ease.out(k3), oy = lerp(RY, 600, ease.out(k3)) + (k3 >= 1 ? Math.sin(lt * 2.4) * 8 : 0);
          if (lt > 24.95) so.waveArm = ease.inOut(prog(lt, 24.95, 25.4));
          drawOki(ctx, ox, oy, .6 * pop(lt, 23.5, .35), so, lt);
        }
        s06_ring(ctx, RX, RY, true);
        ctx.restore();
      }
      s06_check(ctx, 1420, 385, pop(lt, 24.6, .4));
      pill(ctx, 'BÜTÜN OKİ', 1420, 790, { size: 46, fill: PAL.white, scale: pop(lt, 23.9) });
    }

    // soru pankartı
    s06_qmarks(ctx, lt);
    s06_banner(ctx, 960, 440, pop(lt, .35, .55) * (1 - ease.inBack(prog(lt, 2.8, 3.25))), lt);

    // rozet: '???' → 13.6'da takla atıp 'KEMİKSİZ BEDEN'
    const f = prog(lt, 13.6, 14.3);
    let fy = 1, title = '???';
    if (f > 0) { if (f < .35) fy = 1 - ease.in(f / .35); else { fy = ease.outBack((f - .35) / .65); title = 'KEMİKSİZ BEDEN'; } }
    const hop = Math.sin(Math.PI * f) * 18;
    ctx.save(); ctx.translate(150, 120 - hop); ctx.scale(1, Math.max(.02, fy)); ctx.translate(-150, -120);
    factBadge(ctx, 4, title, lt, 26);
    ctx.restore();
  }
});
