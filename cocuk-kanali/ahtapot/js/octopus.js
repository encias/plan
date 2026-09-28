// ============================================================
//  OKİ — ana karakter. drawOki(ctx, x, y, s, o, t)
//  (x,y): kolların birleştiği taban noktası (kafanın alt ortası). s: ölçek (s=1 → kafa ~220px yüksek, kollar ~180px)
//  o (hepsi opsiyonel):
//    pose: 'idle'|'swim'|'walk'|'squeeze'|'cheer' ya da okiPose()/blendPose() nesnesi
//    color, alpha, rot, sx, sy (squash/stretch, tabana göre)
//    eye: 'open'|'happy'|'closed'|'surprised'   look: {x,y} (-1..1)   blink: 0..1 (verilmezse otomatik)
//    mouth: 'smile'|'open'|'o'|'flat'|'wavy'|'grin'   brow: null|'worried'|'determined'|'raised'
//    xray: 0..1  (içini gösterir: 3 kalp, solungaçlar, mavi kan akışı)
//    hearts: {bpm:72, mainStop:0..1, flow:1}
//    neuro: 0..1 (kollarda sinir düğümleri + beyin parlar)
//    bumps: 0..1 (deri tümsekleri), mottle: {color, amount} (kamuflaj lekeleri)
//    waveArm: 0..1 (sağ dış kol el sallar), reach: {arm, x, y, p} (kol yerel hedefe uzanır; x,y yerel birim)
//  Dünya koordinatı almak için: okiPoint('mainHeart', x, y, s, o) / okiArmPoint(i, 0..1, x, y, s, o, t)
// ============================================================

const OKI_POSES = {
  idle: { spread: 1, curl: 1, waveAmp: .3, waveSpeed: .5, lift: 0, len: 1, walk: 0, pulse: 0 },
  swim: { spread: .22, curl: .25, waveAmp: .16, waveSpeed: 1.4, lift: 0, len: 1.18, walk: 0, pulse: .5 },
  walk: { spread: 1.25, curl: .55, waveAmp: .18, waveSpeed: 1.1, lift: 0, len: 1, walk: 1, pulse: 0 },
  squeeze: { spread: .06, curl: .08, waveAmp: .08, waveSpeed: .8, lift: 0, len: 1.25, walk: 0, pulse: 0 },
  cheer: { spread: 1.5, curl: 1.35, waveAmp: .42, waveSpeed: 1.2, lift: .38, len: 1, walk: 0, pulse: 0 }
};
function okiPose(name) { return { ...OKI_POSES[name] }; }
function blendPose(a, b, k) {
  const A = typeof a === 'string' ? OKI_POSES[a] : a, B = typeof b === 'string' ? OKI_POSES[b] : b, r = {};
  for (const key in A) r[key] = lerp(A[key], B[key], k);
  return r;
}

const OKI_ANCHORS = {
  base: [0, 0], headTop: [0, -210], headCenter: [0, -110],
  mainHeart: [0, -150], gillHeartL: [-62, -126], gillHeartR: [62, -126], gillL: [-84, -160], gillR: [84, -160],
  brain: [0, -116], eyeL: [-42, -72], eyeR: [42, -72], mouth: [0, -30], beak: [0, 8]
};

// dir: -1 sol, 1 sağ. a: dışa açılma. curl: uç kıvrımı (+ dışa, − içe). ph: dalga fazı
const OKI_ARMS = [
  { bx: -40, by: -10, dir: -1, a: 1.30, len: 150, w: 24, curl: 1.7, back: true, ph: .3 },
  { bx: -14, by: -10, dir: -1, a: .52, len: 140, w: 22, curl: -1.2, back: true, ph: 1.9 },
  { bx: 14, by: -10, dir: 1, a: .52, len: 140, w: 22, curl: -1.2, back: true, ph: 3.1 },
  { bx: 40, by: -10, dir: 1, a: 1.30, len: 150, w: 24, curl: 1.7, back: true, ph: 4.4 },
  { bx: -62, by: -2, dir: -1, a: .95, len: 182, w: 31, curl: 1.9, ph: .9 },
  { bx: -22, by: 4, dir: -1, a: .26, len: 172, w: 30, curl: -1.4, ph: 2.6 },
  { bx: 22, by: 4, dir: 1, a: .26, len: 172, w: 30, curl: -1.4, ph: 3.8 },
  { bx: 62, by: -2, dir: 1, a: .95, len: 182, w: 31, curl: 1.9, ph: 5.2 }
];
const ARM_N = 40;

function okiSpines(o, t) {
  const P = typeof o.pose === 'object' ? o.pose : OKI_POSES[o.pose || 'idle'];
  return OKI_ARMS.map((arm, i) => {
    const sp = P.spread + P.pulse * .35 * Math.sin(t * P.waveSpeed * TAU);
    let a0 = Math.PI / 2 - arm.dir * arm.a * sp;
    a0 += -arm.dir * P.lift * 1.6 * (arm.back ? .8 : 1);
    a0 += P.walk * .3 * Math.sin(t * P.waveSpeed * TAU + i * 1.7);
    let curl = -arm.dir * arm.curl * P.curl, len = arm.len * P.len * (1 + .05 * Math.sin(i * 3.1)), wAmp = P.waveAmp;
    if (i === 7 && o.waveArm > 0) {
      const k = ease.inOut(clamp(o.waveArm));
      a0 = lerp(a0, -Math.PI / 2 + .95 + Math.sin(t * 7) * .3, k);
      curl = lerp(curl, -1.25, k); wAmp = lerp(wAmp, .15, k);
    }
    if (o.reach && o.reach.arm === i && o.reach.p > 0) {
      const k = ease.inOut(clamp(o.reach.p));
      const dx = o.reach.x - arm.bx, dy = o.reach.y - arm.by;
      let ta = Math.atan2(dy, dx);
      while (ta - a0 > Math.PI) ta -= TAU; while (a0 - ta > Math.PI) ta += TAU;
      a0 = lerp(a0, ta + arm.dir * .12, k); curl = lerp(curl, -arm.dir * .24, k);
      len = lerp(len, Math.hypot(dx, dy) * 1.03, k); wAmp = lerp(wAmp, .05, k);
    }
    const seg = len / ARM_N; let x = arm.bx, y = arm.by;
    const pts = [[x, y, a0]];
    for (let k = 1; k <= ARM_N; k++) {
      const s = k / ARM_N;
      const ang = a0 + curl * Math.pow(s, 2.2) + wAmp * Math.sin(t * P.waveSpeed * TAU + arm.ph - s * 3) * s;
      x += Math.cos(ang) * seg; y += Math.sin(ang) * seg; pts.push([x, y, ang]);
    }
    return { arm, pts, curl, i };
  });
}

function armWidth(arm, s) { return arm.w * Math.pow(1 - s, .78) + 3.2; }

function drawArm(ctx, A, fill, line, suck, o) {
  const { arm, pts, curl } = A, L = [], R = [];
  pts.forEach((p, k) => {
    const w = armWidth(arm, k / ARM_N) / 2, nx = -Math.sin(p[2]), ny = Math.cos(p[2]);
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  const tip = pts[ARM_N], tw = armWidth(arm, 1) / 2;
  const path = (close) => {
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
    for (let k = 1; k <= ARM_N; k++) ctx.lineTo(L[k][0], L[k][1]);
    ctx.arc(tip[0], tip[1], tw, tip[2] + Math.PI / 2, tip[2] - Math.PI / 2, true);
    for (let k = ARM_N; k >= 0; k--) ctx.lineTo(R[k][0], R[k][1]);
    if (close) ctx.closePath();
  };
  path(true); ctx.fillStyle = fill; ctx.fill();
  // alt taraf gölgesi (hacim)
  ctx.save(); path(true); ctx.clip();
  ctx.beginPath(); for (let k = 0; k <= ARM_N; k++) { const p = pts[k], w = armWidth(arm, k / ARM_N) * .5, sg = curl >= 0 ? 1 : -1; ctx.lineTo(p[0] + (-Math.sin(p[2])) * w * sg * .55, p[1] + Math.cos(p[2]) * w * sg * .55); }
  ctx.lineWidth = armWidth(arm, .2) * .5; ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.stroke();
  ctx.restore();
  // lekeler / tümsekler
  if (o.mottle && o.mottle.amount > 0) {
    ctx.save(); ctx.globalAlpha *= o.mottle.amount; ctx.fillStyle = o.mottle.color;
    for (let k = 3; k < ARM_N; k += 5) { const p = pts[k], w = armWidth(arm, k / ARM_N); ctx.beginPath(); ctx.ellipse(p[0], p[1], w * .42, w * .32, p[2], 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  // vantuzlar (kıvrımın iç tarafında)
  const sg = curl >= 0 ? 1 : -1;
  for (let k = 8; k < ARM_N - 1; k += 3) {
    const p = pts[k], w = armWidth(arm, k / ARM_N), off = w * .36 * sg, r = w * .2;
    const sx = p[0] - Math.sin(p[2]) * off, sy = p[1] + Math.cos(p[2]) * off;
    ctx.fillStyle = suck; ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.beginPath(); ctx.arc(sx, sy, r * .45, 0, TAU); ctx.fill();
  }
  if (o.bumps > 0) {
    ctx.fillStyle = rgba('#ffffff', .35 * o.bumps);
    for (let k = 4; k < ARM_N - 4; k += 4) { const p = pts[k], w = armWidth(arm, k / ARM_N), off = -w * .22 * sg; ctx.beginPath(); ctx.arc(p[0] - Math.sin(p[2]) * off, p[1] + Math.cos(p[2]) * off, w * .16 * o.bumps + .5, 0, TAU); ctx.fill(); }
  }
  // kontur (taban hariç)
  ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
  for (let k = 1; k <= ARM_N; k++) ctx.lineTo(L[k][0], L[k][1]);
  ctx.arc(tip[0], tip[1], tw, tip[2] + Math.PI / 2, tip[2] - Math.PI / 2, true);
  for (let k = ARM_N; k >= 0; k--) ctx.lineTo(R[k][0], R[k][1]);
  ctx.lineJoin = 'round'; ctx.lineWidth = o.lineW ?? 3.4; ctx.strokeStyle = line; ctx.stroke();
}

function headPath(ctx) {
  ctx.beginPath(); ctx.moveTo(-80, 8);
  ctx.bezierCurveTo(-122, -60, -116, -206, 0, -210);
  ctx.bezierCurveTo(116, -206, 122, -60, 80, 8);
  ctx.quadraticCurveTo(0, 30, -80, 8); ctx.closePath();
}

function autoBlink(t, seed = 0) {
  const period = 3.4, tt = t + seed * 1.37, k = Math.floor(tt / period);
  const lt = tt - k * period - hash(k + seed * 17) * 1.8;
  return lt > 0 && lt < .17 ? Math.sin(lt / .17 * Math.PI) : 0;
}

function drawOki(ctx, x, y, s, o = {}, t = 0) {
  const col = o.color || PAL.octo;
  const dark = shade(col, -.16), line = shade(col, -.42), suck = mix(col, '#ffffff', .6);
  const spines = okiSpines(o, t);
  ctx.save();
  ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s * (o.sx ?? 1), s * (o.sy ?? 1));

  // arka kollar
  spines.filter(A => A.arm.back).forEach(A => drawArm(ctx, A, dark, line, mix(dark, '#ffffff', .45), o));

  // kafa
  headPath(ctx); ctx.fillStyle = col; ctx.fill();
  ctx.save(); headPath(ctx); ctx.clip();
  let g = ctx.createRadialGradient(-45, -150, 0, -45, -150, 110);
  g.addColorStop(0, 'rgba(255,255,255,0.34)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-130, -220, 260, 260);
  g = ctx.createLinearGradient(0, -60, 0, 25); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,0,20,0.14)');
  ctx.fillStyle = g; ctx.fillRect(-130, -60, 260, 90);
  if (o.mottle && o.mottle.amount > 0) {
    const r = rng(o.mottle.seed || 5); ctx.globalAlpha *= o.mottle.amount; ctx.fillStyle = o.mottle.color;
    for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(-100 + r() * 200, -205 + r() * 200, 12 + r() * 24, 9 + r() * 16, r() * 3, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
  // benekler + parlama
  ctx.fillStyle = rgba(shade(col, .28), .8);
  [[48, -160, 12], [74, -128, 8], [30, -186, 7], [-66, -172, 6], [84, -170, 5]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); });
  ctx.save(); ctx.translate(-58, -168); ctx.rotate(-.6); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 10, 0, 0, TAU); ctx.fill(); ctx.restore();
  if (o.bumps > 0) {
    const r = rng(11);
    for (let i = 0; i < 30; i++) {
      const bx = -95 + r() * 190, by = -200 + r() * 185, rr = (3 + r() * 7) * o.bumps;
      if ((bx / 105) ** 2 + ((by + 105) / 108) ** 2 > .8) continue;
      if (by > -115 && Math.abs(bx) < 80) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(bx, by + rr * .35, rr, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(shade(col, .25), .9); ctx.beginPath(); ctx.arc(bx, by, rr, 0, TAU); ctx.fill();
    }
  }
  // kafa konturu (alt kenar hariç)
  ctx.beginPath(); ctx.moveTo(-80, 8);
  ctx.bezierCurveTo(-122, -60, -116, -206, 0, -210); ctx.bezierCurveTo(116, -206, 122, -60, 80, 8);
  ctx.lineWidth = o.lineW ?? 3.4; ctx.strokeStyle = line; ctx.stroke();

  if (o.xray > 0) drawXray(ctx, o, t);
  if (o.neuro > 0) drawBrain(ctx, o.neuro, t);

  // ön kollar (iç olanlar önce)
  [5, 6, 4, 7].forEach(i => drawArm(ctx, spines[i], col, line, suck, o));
  if (o.neuro > 0) spines.forEach(A => drawNeurons(ctx, A, o.neuro, t));

  drawFace(ctx, o, t, col, line);
  ctx.restore();
}

function drawFace(ctx, o, t, col, line) {
  const eye = o.eye || 'open', look = o.look || { x: 0, y: 0 };
  const blink = o.blink ?? autoBlink(t, o.seed || 0);
  const es = eye === 'surprised' ? 1.14 : 1;
  // yanaklar
  ctx.fillStyle = rgba(PAL.blush, .42);
  [-72, 72].forEach(cx => { ctx.beginPath(); ctx.ellipse(cx, -36, 17, 10, 0, 0, TAU); ctx.fill(); });
  [-42, 42].forEach(ex => {
    const ey = -72;
    if (eye === 'happy') { ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(ex, ey + 8, 18, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); return; }
    if (eye === 'closed') { ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(ex, ey - 8, 18, Math.PI * .12, Math.PI * .88); ctx.stroke(); return; }
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ex, ey, 26 * es, 31 * es, 0, 0, TAU);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = PAL.navy; ctx.stroke(); ctx.clip();
    const pr = eye === 'surprised' ? 11 : 17, px = ex + look.x * 9, py = ey + 3 + look.y * 11;
    ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - pr * .38, py - pr * .42, pr * .38, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(px + pr * .36, py + pr * .36, pr * .18, 0, TAU); ctx.fill();
    if (blink > 0) {
      const lh = 2 * 31 * es * blink;
      ctx.fillStyle = col; ctx.fillRect(ex - 40, ey - 31 * es - 2, 80, lh + 2);
      ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.moveTo(ex - 28, ey - 31 * es + lh); ctx.lineTo(ex + 28, ey - 31 * es + lh); ctx.stroke();
    }
    ctx.restore();
  });
  // kaşlar
  if (o.brow) {
    ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = PAL.navy;
    [-1, 1].forEach(sd => {
      const bx = sd * 42, by = -118 * (eye === 'surprised' ? 1.03 : 1);
      ctx.beginPath();
      if (o.brow === 'worried') { ctx.moveTo(bx - sd * 16, by + 2); ctx.lineTo(bx + sd * 14, by + 10); }
      else if (o.brow === 'determined') { ctx.moveTo(bx - sd * 16, by + 12); ctx.lineTo(bx + sd * 14, by + 2); }
      else { ctx.arc(bx, by + 14, 18, Math.PI * 1.2, Math.PI * 1.8); }
      ctx.stroke();
    });
  }
  // ağız
  const m = o.mouth || 'smile', my = -30;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = PAL.navy;
  if (m === 'smile') { ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, my - 12, 15, Math.PI * .18, Math.PI * .82); ctx.stroke(); }
  else if (m === 'open' || m === 'grin') {
    const w = m === 'grin' ? 26 : 19, h = m === 'grin' ? 24 : 22;
    ctx.beginPath(); ctx.moveTo(-w, my - 6); ctx.quadraticCurveTo(0, my - 12, w, my - 6); ctx.quadraticCurveTo(w * .9, my + h, 0, my + h); ctx.quadraticCurveTo(-w * .9, my + h, -w, my - 6); ctx.closePath();
    ctx.fillStyle = '#7A1F35'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#FF7C95'; ctx.beginPath(); ctx.ellipse(0, my + h, w * .7, h * .5, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.lineWidth = 4.5; ctx.stroke();
  }
  else if (m === 'o') { ctx.beginPath(); ctx.ellipse(0, my, 10, 13, 0, 0, TAU); ctx.fillStyle = '#7A1F35'; ctx.fill(); ctx.lineWidth = 4.5; ctx.stroke(); }
  else if (m === 'flat') { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-12, my); ctx.lineTo(12, my); ctx.stroke(); }
  else if (m === 'wavy') { ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const xx = -18 + i * 3; ctx.lineTo(xx, my + Math.sin(i * 1.4) * 4); } ctx.stroke(); }
}

function drawXray(ctx, o, t) {
  const xr = clamp(o.xray), H_ = o.hearts || {}, bpm = H_.bpm ?? 72, stop = clamp(H_.mainStop ?? 0), flow = H_.flow ?? (1 - stop * .7);
  ctx.save(); headPath(ctx); ctx.clip();
  ctx.fillStyle = rgba(PAL.navy, .62 * xr); ctx.fillRect(-130, -220, 260, 260);
  ctx.globalAlpha *= xr;
  // ince tarama çizgileri
  ctx.strokeStyle = 'rgba(140,220,255,0.10)'; ctx.lineWidth = 2;
  for (let yy = -210; yy < 30; yy += 14) { ctx.beginPath(); ctx.moveTo(-130, yy); ctx.lineTo(130, yy); ctx.stroke(); }
  // solungaçlar
  [-1, 1].forEach(sd => {
    ctx.save(); ctx.translate(sd * 84, -160); ctx.rotate(sd * .45);
    ctx.fillStyle = '#9FDcFF'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 30, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,80,140,0.6)'; ctx.lineWidth = 2.5;
    for (let k = -22; k <= 22; k += 7) { ctx.beginPath(); ctx.moveTo(-10, k); ctx.lineTo(10, k + 3); ctx.stroke(); }
    ctx.restore();
  });
  // mavi kan akışı
  ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = PAL.blueBlood;
  ctx.setLineDash([12, 12]); ctx.lineDashOffset = -t * 70 * flow;
  const vs = [
    [[-62, -126], [-80, -140], [-84, -160]], [[62, -126], [80, -140], [84, -160]],
    [[-84, -160], [-50, -196], [0, -150]], [[84, -160], [50, -196], [0, -150]],
    [[0, -150], [-108, -150], [-96, -14]], [[0, -150], [108, -150], [96, -14]],
    [[-66, 2], [-72, -60], [-62, -126]], [[66, 2], [72, -60], [62, -126]]
  ];
  vs.forEach(([a, c, b]) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]); ctx.stroke(); });
  ctx.setLineDash([]);
  // kalpler
  const bG = beat(t, bpm), bM = beat(t + .12, bpm) * (1 - stop);
  const hl = H_.highlight;
  [[-62, -126], [62, -126]].forEach(([hx, hy]) => {
    const sz = 17 * (1 + .22 * bG);
    if (hl === 'gill') { ctx.strokeStyle = rgba(PAL.yellow, .9); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(hx, hy, sz * (1.7 + .3 * bG), 0, TAU); ctx.stroke(); }
    heartPath(ctx, hx, hy, sz); ctx.fillStyle = PAL.heart; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#fff'; ctx.stroke();
  });
  const msz = 27 * (1 + .2 * bM);
  if (hl === 'main') { ctx.strokeStyle = rgba(PAL.yellow, .9); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -150, msz * (1.6 + .25 * bM), 0, TAU); ctx.stroke(); }
  heartPath(ctx, 0, -150, msz); ctx.fillStyle = mix(PAL.heart, '#8A93A6', stop); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.restore();
}

function drawBrain(ctx, k, t) {
  const [bx, by] = OKI_ANCHORS.brain, gl = .6 + .4 * Math.sin(t * 5);
  ctx.save(); ctx.globalAlpha *= k;
  ctx.fillStyle = rgba(PAL.yellow, .28 * gl); ctx.beginPath(); ctx.ellipse(bx, by, 52, 30, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFB3C7'; ctx.strokeStyle = '#C2507A'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(bx - 13, by, 18, 13, 0, 0, TAU); ctx.ellipse(bx + 13, by, 18, 13, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 20, by - 3); ctx.quadraticCurveTo(bx - 12, by + 5, bx - 5, by - 4); ctx.moveTo(bx + 6, by + 3); ctx.quadraticCurveTo(bx + 14, by - 6, bx + 22, by + 2); ctx.stroke();
  ctx.restore();
}

function drawNeurons(ctx, A, k, t) {
  ctx.save(); ctx.globalAlpha *= k;
  for (let n = 6; n < ARM_N - 2; n += 6) {
    const p = A.pts[n], s = n / ARM_N, puls = .5 + .5 * Math.sin(t * 7 - s * 9 + A.i);
    const r = (armWidth(A.arm, s) * .16 + 2) * (.8 + .5 * puls);
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 2.6);
    g.addColorStop(0, `rgba(255,236,140,${.55 * puls + .2})`); g.addColorStop(1, 'rgba(255,210,63,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r * 2.6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFF4C2'; ctx.beginPath(); ctx.arc(p[0], p[1], r * .7, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// Yerel çapa noktası → dünya koordinatı
function okiPoint(name, x, y, s, o = {}) {
  const [lx, ly] = Array.isArray(name) ? name : OKI_ANCHORS[name];
  const r = o.rot || 0, ax = lx * s * (o.sx ?? 1), ay = ly * s * (o.sy ?? 1);
  return [x + Math.cos(r) * ax - Math.sin(r) * ay, y + Math.sin(r) * ax + Math.cos(r) * ay];
}
// Dünya → yerel (reach hedefi için)
function okiLocal(wx, wy, x, y, s, o = {}) {
  const r = -(o.rot || 0), dx = wx - x, dy = wy - y;
  return [(Math.cos(r) * dx - Math.sin(r) * dy) / (s * (o.sx ?? 1)), (Math.sin(r) * dx + Math.cos(r) * dy) / (s * (o.sy ?? 1))];
}
// i. kolun u (0 taban..1 uç) noktası, dünya koordinatında
function okiArmPoint(i, u, x, y, s, o, t) {
  const A = okiSpines(o, t)[i], p = A.pts[Math.round(clamp(u) * ARM_N)];
  return okiPoint([p[0], p[1]], x, y, s, o);
}

// Papağan gagası (sahne 6 için)
function drawBeak(ctx, x, y, sz, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sz / 40, sz / 40);
  ctx.fillStyle = '#3B2B2F'; ctx.strokeStyle = '#1A1215'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-26, -10); ctx.quadraticCurveTo(0, -42, 30, -12); ctx.quadraticCurveTo(26, 10, 6, 22); ctx.quadraticCurveTo(10, 4, -2, -2); ctx.quadraticCurveTo(-18, -4, -26, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-6, 4, 2, 10); ctx.quadraticCurveTo(-4, 26, -22, 18); ctx.quadraticCurveTo(-30, 8, -24, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-4, -20, 12, 4, -.3, 0, TAU); ctx.fill();
  ctx.restore();
}
