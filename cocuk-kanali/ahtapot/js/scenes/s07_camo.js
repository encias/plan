// S7 — 5. SÜPER GÜÇ: KAMUFLAJ (116–140 sn)
// Renk paleti yörüngesi → her göz kırpışta renk değişimi → KAYA/KUM/MERCAN panelleri → "OKİ NEREDE?" resif oyunu → "İŞTE ORADA!"
const S07_COLS = [PAL.octo, PAL.yellow, PAL.mint, PAL.purple, PAL.pink, PAL.sea1];
const S07_BLINKS = [4.6, 5.7, 6.8, 7.9];
const S07_SEQ = [0, 1, 2, 3, 0]; // mercan → sarı → nane → mor → mercan (S07_COLS indeksleri)

// ---------- ortam parçaları ----------
function s07_blobPath(ctx, x, y, rx, ry, seed) {
  ctx.beginPath();
  for (let i = 0; i <= 28; i++) {
    const a = Math.PI + i / 28 * Math.PI, rr = 1 + .07 * Math.sin(a * 3 + seed) + .04 * Math.sin(a * 7 + seed * 2);
    ctx.lineTo(x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr);
  }
  ctx.quadraticCurveTo(x + rx * .95, y + ry * .26, x, y + ry * .3);
  ctx.quadraticCurveTo(x - rx * .95, y + ry * .26, x - rx * (1 + .07 * Math.sin(Math.PI * 3 + seed) + .04 * Math.sin(Math.PI * 7 + seed * 2)), y);
  ctx.closePath();
}
function s07_rock(ctx, x, y, rx, ry, seed, col) {
  softShadow(ctx, x, y + ry * .26, rx * 1.15, ry * .28, .25);
  s07_blobPath(ctx, x, y, rx, ry, seed); ctx.fillStyle = col; ctx.fill();
  ctx.save(); s07_blobPath(ctx, x, y, rx, ry, seed); ctx.clip();
  const r = rng(seed * 7 + 1);
  ctx.fillStyle = rgba(shade(col, -.25), .55);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(x + (r() - .5) * rx * 1.8, y - r() * ry, 8 + r() * rx * .16, 6 + r() * ry * .12, r() * 3, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 14; i++) {
    const bx = x + (r() - .5) * rx * 1.7, by = y - r() * ry * .95, br = 3 + r() * Math.min(rx, ry) * .07;
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(bx, by + br * .35, br, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(shade(col, .25), .9); ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(x - rx * .4, y - ry * .7, rx * .22, ry * .1, -.4, 0, TAU); ctx.fill();
  ctx.restore();
  s07_blobPath(ctx, x, y, rx, ry, seed); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = shade(col, -.42); ctx.stroke();
}
function s07_coral(ctx, x, y, s, col, seed, lt) {
  const segs = [], r = rng(seed);
  const grow = (px, py, ang, len, w, d) => {
    const sw = Math.sin(lt * 1.3 + seed + d * .7) * .05;
    const ex = px + Math.cos(ang + sw) * len, ey = py + Math.sin(ang + sw) * len;
    segs.push([px, py, ex, ey, w]);
    if (d > 0) { const n = 2 + (r() < .4 ? 1 : 0); for (let k = 0; k < n; k++) grow(ex, ey, ang + (k - (n - 1) / 2) * .62 + (r() - .5) * .3, len * .74, w * .76, d - 1); }
    else segs.push([ex, ey, ex, ey, w * 1.35]);
  };
  grow(0, 0, -Math.PI / 2, 80, 30, 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  const pass = (add, style) => { ctx.strokeStyle = style; segs.forEach(([a, b, c, d, w]) => { ctx.lineWidth = w + add; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }); };
  pass(11, shade(col, -.42)); pass(0, col);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  segs.forEach(([a, b, c, d, w]) => { if (a === c && b === d) return; ctx.lineWidth = w * .28; ctx.beginPath(); ctx.moveTo(a - w * .2, b); ctx.lineTo(c - w * .2, d); ctx.stroke(); });
  ctx.restore();
}
function s07_fan(ctx, x, y, s, col, lt) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(lt * .9 + x) * .04);
  const R = 150;
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (let i = 0; i <= 20; i++) { const a = -Math.PI * (.12 + .76 * i / 20); ctx.lineTo(Math.cos(a) * R * (1 + .06 * Math.sin(i * 2.3)), Math.sin(a) * R * (1 + .06 * Math.sin(i * 2.3))); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = shade(col, -.42); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = rgba(shade(col, .35), .7); ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const a = -Math.PI * (.14 + .72 * i / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke(); }
  for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.arc(0, 0, R * k / 5, -Math.PI * .9, -Math.PI * .1); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = 12; ctx.strokeStyle = shade(col, -.42); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke();
  ctx.restore();
}
function s07_brain(ctx, x, y, rx, ry, col) {
  softShadow(ctx, x, y + 6, rx * 1.1, ry * .3, .25);
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = rgba(shade(col, -.25), .8); ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let i = 0; i <= 20; i++) { const xx = x - rx + i * rx / 10; ctx.lineTo(xx, y - ry * (.15 + k * .18) + Math.sin(i * 1.3 + k) * 7); } ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, Math.PI, TAU); ctx.closePath(); ctx.lineWidth = 6; ctx.strokeStyle = shade(col, -.42); ctx.stroke();
}

// ---------- A/B: renk paleti ----------
function s07_dots(ctx, lt, cur, front) {
  const out = ease.in(prog(lt, 8.3, 8.8));
  S07_COLS.forEach((c, i) => {
    const sc = pop(lt, .55 + i * .13, .45) * (1 - out);
    if (sc <= 0) return;
    const a = lt * .6 + i * TAU / 6, sn = Math.sin(a);
    if ((sn > 0) !== front) return;
    const R = 1 + out * .9, x = 960 + Math.cos(a) * 440 * R, y = 610 + sn * 270 * R;
    const hl = cur === i ? 1 : 0, r = 56 * sc * (.82 + .18 * sn) * (1 + .38 * hl + .06 * hl * Math.sin(lt * 10));
    if (hl) { const g = ctx.createRadialGradient(x, y, r * .6, x, y, r * 2.2); g.addColorStop(0, rgba(PAL.yellow, .6)); g.addColorStop(1, rgba(PAL.yellow, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.beginPath(); ctx.arc(x, y + 6, r, 0, TAU); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = shade(c, -.42); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(x - r * .35, y - r * .4, r * .3, r * .16, -.5, 0, TAU); ctx.fill();
  });
}
function s07_splash(ctx, x, y, lt, t0, col) {
  const p = prog(lt, t0, t0 + .6); if (p <= 0 || p >= 1) return;
  const e = ease.out(p);
  ctx.save(); ctx.globalAlpha *= 1 - p;
  ctx.lineWidth = 22 * (1 - p) + 2; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, 130 + 260 * e, 0, TAU); ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + .3, d = 150 + 250 * e; starPath(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 16 * (1 - p) + 4, 4, .45); ctx.fillStyle = i % 2 ? PAL.white : col; ctx.fill(); }
  ctx.restore();
}

// ---------- C: ortam panelleri ----------
const S07_PANELS = [
  { cx: 360, label: 'KAYA', ts: 9.45, pin: 9.0, lab: 10.55, col: shade(PAL.rock, .06), mot: PAL.rock2, bumps: 1 },
  { cx: 960, label: 'KUM', ts: 11.45, pin: 11.2, lab: 11.95, col: mix(PAL.sand, PAL.sand2, .45), mot: PAL.sand3, bumps: .55 },
  { cx: 1560, label: 'MERCAN', ts: 12.45, pin: 12.25, lab: 12.95, col: PAL.pink, mot: PAL.coral, bumps: .85 }
];
function s07_panel(ctx, i, sc, lt, t) {
  if (sc <= 0) return;
  const P = S07_PANELS[i], cx = P.cx, cy = 590, w = 520, h = 600, x0 = cx - w / 2, y0 = cy - h / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  ctx.fillStyle = 'rgba(5,20,40,0.3)'; rrect(ctx, x0, y0 + 14, w, h, 40); ctx.fill();
  ctx.save(); rrect(ctx, x0, y0, w, h, 40); ctx.clip();
  let g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  let oy = 752, pose = 'idle';
  if (i === 0) {
    g.addColorStop(0, mix(PAL.sea2, PAL.rock, .35)); g.addColorStop(1, mix(PAL.sea3, PAL.rock2, .5));
    ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
    s07_rock(ctx, cx - 175, 590, 120, 170, 21, shade(PAL.rock, -.14));
    s07_rock(ctx, cx + 190, 640, 125, 140, 22, shade(PAL.rock, -.08));
    s07_rock(ctx, cx, 875, 262, 180, 23, P.col);
  } else if (i === 1) {
    g.addColorStop(0, PAL.sea1); g.addColorStop(.5, mix(PAL.sea1, PAL.sea2, .6)); g.addColorStop(1, PAL.sea2);
    ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
    ctx.fillStyle = PAL.sand; ctx.beginPath(); ctx.moveTo(x0, y0 + h);
    for (let x = x0; x <= x0 + w; x += 20) ctx.lineTo(x, 640 + Math.sin(x * .02) * 14);
    ctx.lineTo(x0 + w, y0 + h); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = shade(PAL.sand, -.2); ctx.stroke();
    ctx.strokeStyle = rgba(PAL.sand2, .8); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let x = x0 + 20; x <= x0 + w - 20; x += 16) ctx.lineTo(x, 690 + k * 42 + Math.sin(x * .045 + k) * 7); ctx.stroke(); }
    const r = rng(41);
    for (let k = 0; k < 12; k++) { const px = x0 + 30 + r() * (w - 60), py = 680 + r() * 190, ps = 5 + r() * 8; ctx.fillStyle = PAL.sand3; ctx.beginPath(); ctx.ellipse(px, py, ps * 1.3, ps, 0, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.translate(cx + 180, 840); ctx.rotate(.3); starPath(ctx, 0, 0, 34, 5, .45); ctx.fillStyle = PAL.coral; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = shade(PAL.coral, -.42); ctx.stroke(); ctx.restore();
    oy = 800; pose = blendPose('idle', 'walk', .5);
  } else {
    g.addColorStop(0, mix(PAL.sea1, PAL.pink, .12)); g.addColorStop(1, mix(PAL.sea2, PAL.purple, .25));
    ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
    s07_fan(ctx, cx + 150, 700, 1.1, mix(PAL.purple, PAL.pink, .25), lt);
    s07_coral(ctx, cx - 185, 880, 1.25, PAL.coral, 31, lt);
    ctx.fillStyle = mix(PAL.sand, PAL.pink, .3); ctx.fillRect(x0, 850, w, 60);
    s07_brain(ctx, cx, 880, 230, 120, mix(PAL.pink, PAL.coral, .35));
    s07_coral(ctx, cx + 200, 895, 1.0, PAL.pink, 32, lt);
    oy = 790;
  }
  // Oki: ts'de göz kırpar ve ortama uyar
  const k = ease.inOut(prog(lt, P.ts, P.ts + .7)), kb = ease.inOut(prog(lt, P.ts - .25, P.ts + .5));
  const bl = Math.sin(Math.PI * prog(lt, P.ts - .12, P.ts + .16));
  const o = { seed: 10 + i, pose, color: mix(PAL.octo, P.col, k), bumps: P.bumps * kb, mottle: { color: P.mot, amount: .7 * k, seed: 3 + i }, blink: bl > 0 ? bl : undefined,
    eye: k > .95 ? 'happy' : 'open', mouth: k > .95 ? 'grin' : 'smile', look: { x: 0, y: .2 } };
  drawOki(ctx, cx, oy + Math.sin(lt * 1.6 + i) * 4, .68, o, lt);
  if (i === 2) s07_coral(ctx, cx - 60, 905, .55, mix(PAL.pink, PAL.coral, .5), 33, lt);
  // değişim parıltısı
  const sp = prog(lt, P.ts, P.ts + .9);
  if (sp > 0 && sp < 1) for (let s = 0; s < 5; s++) {
    const a = s * TAU / 5 + lt, d = 120 + 40 * sp;
    ctx.save(); ctx.globalAlpha *= Math.sin(Math.PI * sp); starPath(ctx, cx + Math.cos(a) * d, oy - 90 + Math.sin(a) * d * .8, 16, 4, .42); ctx.fillStyle = PAL.white; ctx.fill(); ctx.restore();
  }
  ctx.restore();
  rrect(ctx, x0, y0, w, h, 40); ctx.lineWidth = 14; ctx.strokeStyle = PAL.white; ctx.stroke();
  rrect(ctx, x0 - 7, y0 - 7, w + 14, h + 14, 46); ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.restore();
}

// ---------- D: resif ("OKİ NEREDE?") ----------
const S07_BACK = [[140, 590, 150, 110, 1], [470, 610, 120, 90, 2], [1000, 590, 150, 100, 3], [1600, 585, 170, 120, 4], [1860, 620, 130, 100, 5]];
const S07_ROCKS = [[960, 660, 72, 56, 18], [560, 690, 88, 66, 15], [1570, 705, 84, 66, 17], [1080, 735, 96, 72, 16],
  [300, 810, 230, 150, 11], [1330, 835, 255, 175, 13], [770, 880, 205, 132, 12], [1745, 890, 215, 142, 14]];
function s07_reef(ctx, lt, t, O) {
  S07_BACK.forEach(([x, y, rx, ry, sd]) => s07_rock(ctx, x, y, rx, ry, sd, mix(PAL.rock2, PAL.sea3, .45)));
  s07_fan(ctx, 250, 640, 1.0, mix(PAL.purple, PAL.sea3, .2), lt);
  s07_fan(ctx, 1480, 630, .85, mix(PAL.purple, PAL.pink, .2), lt);
  s07_coral(ctx, 690, 700, .9, mix(PAL.coral, PAL.sea3, .15), 51, lt);
  s07_coral(ctx, 1840, 720, .8, mix(PAL.pink, PAL.sea3, .15), 52, lt);
  S07_ROCKS.forEach(([x, y, rx, ry, sd]) => {
    s07_rock(ctx, x, y, rx, ry, sd, sd === 13 || sd === 16 || sd === 17 ? PAL.rock : shade(PAL.rock, sd % 2 ? .06 : -.05));
    if (sd === 13 && O) drawOki(ctx, O.x, O.y, O.s, O.o, lt);
  });
  s07_coral(ctx, 470, 950, 1.1, PAL.pink, 53, lt);
  s07_coral(ctx, 1080, 975, .95, PAL.coral, 54, lt);
  s07_brain(ctx, 1560, 985, 150, 85, mix(PAL.pink, PAL.coral, .35));
  s07_coral(ctx, 120, 990, .8, PAL.coral, 55, lt);
}
function s07_hideOki(lt) {
  const rev = ease.inOut(prog(lt, 19.85, 20.45));
  const hideP = { spread: 1.3, curl: .7, waveAmp: .06, waveSpeed: .3, lift: 0, len: .95, walk: 0, pulse: 0 };
  const o = { seed: 7, pose: rev > 0 ? blendPose(hideP, 'idle', rev) : hideP, color: mix(PAL.rock, PAL.octo, rev), bumps: 1 - rev,
    mottle: { color: PAL.rock2, amount: .75 * (1 - rev), seed: 9 }, eye: 'closed', mouth: 'flat', look: { x: 0, y: .3 } };
  let y = 705;
  if (lt >= 19.8) {
    o.eye = lt < 20.5 ? 'surprised' : 'happy'; o.mouth = lt < 20.5 ? 'o' : 'grin'; o.brow = lt < 20.5 ? 'raised' : null;
    y -= 34 * Math.sin(Math.PI * prog(lt, 19.8, 20.3));
  }
  if (lt > 21.8) {
    y += Math.sin(lt * 21) * 5 * (1 - prog(lt, 21.8, 23.2));
    o.waveArm = win(lt, 22.1, 30, .5, .3); o.eye = 'happy'; o.mouth = lt < 23.1 ? 'grin' : 'smile';
    o.rot = Math.sin(lt * 21) * .03 * (1 - prog(lt, 21.8, 23.2));
  }
  return { x: 1330, y, s: .75, o };
}
const S07_LENS = [[15.2, 1780, 1000], [16.3, 530, 720], [17.3, 950, 560], [18.3, 640, 910], [19.1, 1660, 930], [19.8, 1330, 625]];
function s07_lensPos(lt) {
  for (let i = 1; i < S07_LENS.length; i++) {
    const [t1, x1, y1] = S07_LENS[i], [t0, x0, y0] = S07_LENS[i - 1];
    if (lt < t1) { const e = ease.inOut(prog(lt, t0, t1)); return [lerp(x0, x1, e), lerp(y0, y1, e)]; }
  }
  return [1330, 625];
}
function s07_lens(ctx, lt, t, O, sc) {
  if (sc <= 0) return;
  const [mx, my] = s07_lensPos(lt), R = 95 * sc, z = 1.45;
  ctx.save(); ctx.translate(mx, my); ctx.rotate(.1 * Math.sin(lt * 2));
  ctx.save(); ctx.rotate(.75); ctx.fillStyle = 'rgba(5,20,40,0.3)'; rrect(ctx, R + 4, -18 + 8, 130 * sc, 36, 18); ctx.fill();
  ctx.fillStyle = PAL.coral; rrect(ctx, R + 4, -18, 130 * sc, 36, 18); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = shade(PAL.coral, -.42); ctx.stroke(); ctx.restore();
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(mx, my, R, 0, TAU); ctx.clip();
  ctx.translate(mx, my); ctx.scale(z, z); ctx.translate(-mx, -my);
  drawOcean(ctx, t, { depth: .28 }); s07_reef(ctx, lt, t, O);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = 'rgba(233,252,255,0.1)'; ctx.beginPath(); ctx.arc(mx, my, R, 0, TAU); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(mx, my, R * .78, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
  ctx.beginPath(); ctx.arc(mx, my, R + 8, 0, TAU); ctx.lineWidth = 18; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.lineWidth = 9; ctx.strokeStyle = PAL.foam2; ctx.stroke();
  ctx.restore();
}

registerScene({
  id: 's07_camo', start: T.s07[0], end: T.s07[1],
  cues: [
    { t: .6, sfx: 'sparkle', vol: .5 },
    { t: 4.6, sfx: 'magic', vol: .5 }, { t: 5.7, sfx: 'magic', vol: .5 }, { t: 6.8, sfx: 'magic', vol: .5 }, { t: 7.9, sfx: 'magic', vol: .5 },
    { t: 8.5, sfx: 'whoosh', vol: .4 }, { t: 9.05, sfx: 'pop', vol: .5 }, { t: 9.5, sfx: 'shimmer', vol: .45 },
    { t: 11.25, sfx: 'pop', vol: .45 }, { t: 12.3, sfx: 'pop', vol: .45 }, { t: 13.0, sfx: 'shimmer', vol: .4 },
    { t: 14.6, sfx: 'whoosh', vol: .4 }, { t: 15.3, sfx: 'drum', vol: .5 },
    { t: 18.3, sfx: 'tick', vol: .35 }, { t: 19.1, sfx: 'tick', vol: .35 },
    { t: 19.8, sfx: 'tada', vol: .7 }, { t: 20.5, sfx: 'magic', vol: .4 }, { t: 22.0, sfx: 'boing', vol: .4 }
  ],
  draw(ctx, lt, t) {
    const inReef = lt > 14.5;
    // ---------- A/B + C ----------
    if (!inReef || lt < 15.4) {
      drawOcean(ctx, t, { depth: .25 });
      if (lt < 9) {
        let stage = 0; S07_BLINKS.forEach(tb => { if (lt >= tb) stage++; });
        const cur = lt >= 4.0 ? S07_SEQ[stage] : -1, col = S07_COLS[S07_SEQ[stage]];
        let bl = 0; S07_BLINKS.forEach(tb => { bl = Math.max(bl, Math.sin(Math.PI * clamp((lt - tb + .12) / .24))); });
        s07_dots(ctx, lt, cur, false);
        const s = 1.35 * (1 - ease.inBack(prog(lt, 8.45, 8.85)));
        if (s > 0) {
          const oy = 800 + Math.sin(lt * 1.8) * 9, last = S07_BLINKS.filter(tb => lt >= tb).pop() ?? -9;
          softShadow(ctx, 960, 1005, 240 * s / 1.35, 32, .22);
          drawOki(ctx, 960, oy, s, {
            seed: 4, color: col, blink: lt > 4 && lt < 8.5 ? bl : undefined,
            eye: lt - last < .7 ? 'happy' : 'open', mouth: lt - last < .7 ? 'grin' : (lt < 4 ? 'smile' : 'open'),
            look: lt < 4 ? { x: Math.cos(lt * .6 + 1.2) * .8, y: -.1 } : { x: 0, y: 0 },
            pose: blendPose('idle', 'cheer', win(lt, 4.5, 8.2, .3, .3) * .35)
          }, lt);
          S07_BLINKS.forEach((tb, i) => s07_splash(ctx, 960, oy - 110 * s, lt, tb, S07_COLS[S07_SEQ[i + 1]]));
        }
        s07_dots(ctx, lt, cur, true);
      }
      for (let i = 0; i < 3; i++) {
        const P = S07_PANELS[i], sc = pop(lt, P.pin, .5) * (1 - ease.inBack(prog(lt, 14.35 + i * .06, 14.75 + i * .06)));
        s07_panel(ctx, i, sc, lt, t);
        pill(ctx, P.label, P.cx, 893, { size: 50, fill: PAL.yellow, scale: pop(lt, P.lab, .45) * (1 - ease.inBack(prog(lt, 14.3 + i * .06, 14.65 + i * .06))) });
      }
    }
    // ---------- D/E/F: resif ----------
    if (inReef) {
      const O = s07_hideOki(lt);
      const [hx, hy] = okiPoint('headCenter', O.x, O.y, O.s, O.o);
      const zp = ease.inOut(prog(lt, 20.6, 22.3)), z = 1 + .42 * zp;
      const rise = 1100 * (1 - ease.out(prog(lt, 14.6, 15.35)));
      ctx.save();
      ctx.translate(lerp(hx, 960, zp), lerp(hy, 610, zp)); ctx.scale(z, z); ctx.translate(-hx, -hy);
      if (lt >= 15.4) drawOcean(ctx, t, { depth: .28 });
      ctx.save(); ctx.translate(0, rise); s07_reef(ctx, lt, t, O); ctx.restore();
      // ipucu kabarcıkları
      for (let k = 0; k < 3; k++) { const p = prog(lt, 18.5 + k * .25, 19.6 + k * .25); if (p > 0 && p < 1) bubble(ctx, hx + 20 + Math.sin(p * 9 + k) * 10, hy - 70 - p * 260, 7 + k * 2, 1 - p); }
      // bulundu halkaları
      const f1 = prog(lt, 19.8, 20.6);
      if (f1 > 0 && f1 < 1) { ctx.save(); ctx.globalAlpha *= 1 - f1; ctx.lineWidth = 16; ctx.strokeStyle = PAL.white; ctx.beginPath(); ctx.arc(hx, hy + 20, 100 + 330 * ease.out(f1), 0, TAU); ctx.stroke(); ctx.restore(); }
      const ra = win(lt, 19.9, 22.0, .2, .5);
      if (ra > 0) { ctx.save(); ctx.globalAlpha *= ra; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -lt * 60; ctx.lineWidth = 10; ctx.strokeStyle = PAL.yellow; ctx.beginPath(); ctx.arc(hx, hy + 25, 165 + 6 * Math.sin(lt * 8), 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      const ls = pop(lt, 15.45, .45) * (1 - ease.inBack(prog(lt, 20.15, 20.5)));
      s07_lens(ctx, lt, t, O, ls);
      ctx.restore();
      // yazılar
      const q = 1 - ease.inBack(prog(lt, 19.6, 19.85));
      if (lt < 19.85) popWords(ctx, 'OKİ NEREDE?', 960, 290, lt, 15.3, { size: 104, fill: PAL.yellow, stagger: .15, scale: q });
      else popWords(ctx, 'İŞTE ORADA!', 960, 290, lt, 19.85, { size: 104, fill: PAL.yellow, stagger: .13 });
    }
    factBadge(ctx, 5, 'KAMUFLAJ', lt, 24);
  }
});
