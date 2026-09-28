// S4 — MAVİ KAN (44–64 sn): mavi damla karakter → bölünmüş ekran (biz: demir → kırmızı | Oki: bakır → mavi)
//      → derine iniş: O₂ taşıyan mavi damlalar, SOĞUK + DERİN
function s04_kf(lt, keys) {
  if (lt <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (lt <= keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i];
    return lerp(va, vb, ease.inOut((lt - a) / (b - a)));
  }
  return keys[keys.length - 1][1];
}
const S04_SKIN = mix(PAL.sand, PAL.octoLight, .42);
const S04_COPPER = mix(PAL.coral, PAL.octoDark, .38);
function s04_o2(ctx, x, y, size, a = 1) {
  txt(ctx, 'O', x - size * .16, y, { size, fill: PAL.white, stroke: PAL.sea3, sw: size * .22, alpha: a, shadow: false });
  txt(ctx, '2', x + size * .3, y + size * .26, { size: size * .58, fill: PAL.white, stroke: PAL.sea3, sw: size * .16, alpha: a, shadow: false });
}
// Yüzü olan damla. k: 0 şeffaf/soluk → 1 tam renk. o: sx, sy, rot, look{x,y}, mouth('smile'|'open'|'grin'), happy, alpha
function s04_drop(ctx, x, y, s, col, k = 1, o = {}) {
  const fill = mix('#DDF3F8', col, k), line = shade(mix(PAL.sea2, col, k), -.42);
  ctx.save(); ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(o.sx ?? 1, o.sy ?? 1);
  dropPath(ctx, 0, 0, s); ctx.save(); ctx.globalAlpha *= lerp(.55, 1, k); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  ctx.lineWidth = Math.max(5, s * .075); ctx.strokeStyle = line; ctx.lineJoin = 'round'; ctx.stroke();
  // hacim: alt gölge + parlama
  ctx.save(); dropPath(ctx, 0, 0, s); ctx.clip();
  ctx.fillStyle = rgba('#000814', .12 * k); ctx.beginPath(); ctx.ellipse(s * .25, s * .75, s * 1.1, s * .55, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-s * .5, -s * .3, s * .14, s * .3, -.45, 0, TAU); ctx.fill();
  // yüz
  const lk = o.look || { x: 0, y: 0 }, ey = s * .08;
  ctx.fillStyle = rgba(PAL.blush, .45);
  [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * s * .6, s * .42, s * .15, s * .09, 0, 0, TAU); ctx.fill(); });
  [-1, 1].forEach(sd => {
    const ex = sd * s * .34;
    if (o.happy) { ctx.lineCap = 'round'; ctx.lineWidth = s * .09; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(ex, ey + s * .08, s * .16, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); return; }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, s * .19, s * .24, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = s * .045; ctx.strokeStyle = PAL.navy; ctx.stroke();
    const px = ex + lk.x * s * .06, py = ey + s * .03 + lk.y * s * .07;
    ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.arc(px, py, s * .13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - s * .045, py - s * .05, s * .05, 0, TAU); ctx.fill();
  });
  const m = o.mouth || 'smile', my = s * .4;
  ctx.lineCap = 'round'; ctx.strokeStyle = PAL.navy;
  if (m === 'smile') { ctx.lineWidth = s * .075; ctx.beginPath(); ctx.arc(0, my - s * .12, s * .16, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
  else {
    const w = m === 'grin' ? s * .24 : s * .16, h = s * .2;
    ctx.beginPath(); ctx.moveTo(-w, my - s * .04); ctx.quadraticCurveTo(0, my - s * .08, w, my - s * .04); ctx.quadraticCurveTo(w * .8, my + h, 0, my + h); ctx.quadraticCurveTo(-w * .8, my + h, -w, my - s * .04); ctx.closePath();
    ctx.fillStyle = '#7A1F35'; ctx.fill(); ctx.lineWidth = s * .05; ctx.stroke();
  }
  ctx.restore();
}
// Çocuk kolu + açık el (yukarı bakan), yara bandıyla. (x,y) = avuç merkezi
function s04_hand(ctx, x, y, sc, rot) {
  const line = shade(S04_SKIN, -.42);
  const shapes = () => {
    const P = [];
    P.push(() => { ctx.beginPath(); ctx.moveTo(-62, 40); ctx.lineTo(-70, 520); ctx.lineTo(70, 520); ctx.lineTo(60, 40); ctx.closePath(); });
    P.push(() => rrect(ctx, -78, -80, 156, 150, 60));
    [[-57, -150, 92], [-19, -172, 112], [19, -168, 108], [57, -140, 84]].forEach(([fx, fy, l]) => P.push(() => rrect(ctx, fx - 17.5, fy, 35, l + 40, 17.5)));
    P.push(() => { ctx.save(); ctx.translate(-70, 5); ctx.rotate(-.75); rrect(ctx, -18, -95, 36, 110, 18); ctx.restore(); });
    return P;
  };
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const P = shapes();
  ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.strokeStyle = line; P.forEach(f => { f(); ctx.stroke(); });
  ctx.fillStyle = S04_SKIN; P.forEach(f => { f(); ctx.fill(); });
  // parmak araları + tırnaklar + parlama
  ctx.strokeStyle = rgba(line, .5); ctx.lineWidth = 4; ctx.lineCap = 'round';
  [-38, 0, 38].forEach(fx => { ctx.beginPath(); ctx.moveTo(fx, -118); ctx.lineTo(fx, -72); ctx.stroke(); });
  ctx.fillStyle = rgba('#ffffff', .55);
  [[-57, -150], [-19, -172], [19, -168], [57, -140]].forEach(([fx, fy]) => { ctx.beginPath(); ctx.ellipse(fx, fy + 18, 9, 11, 0, 0, TAU); ctx.fill(); });
  ctx.fillStyle = rgba('#ffffff', .3); ctx.beginPath(); ctx.ellipse(-30, -30, 22, 36, -.3, 0, TAU); ctx.fill();
  // yara bandı
  ctx.save(); ctx.translate(0, 230); ctx.rotate(-.18);
  const bd = mix(PAL.sand2, '#ffffff', .3);
  rrect(ctx, -86, -30, 172, 60, 26); ctx.fillStyle = bd; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = shade(bd, -.42); ctx.stroke();
  rrect(ctx, -30, -22, 60, 44, 10); ctx.fillStyle = mix(PAL.sand2, PAL.sand3, .35); ctx.fill();
  ctx.fillStyle = shade(bd, -.25); [[-62, -10], [-62, 10], [-50, 0], [50, 0], [62, -10], [62, 10]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 3.2, 0, TAU); ctx.fill(); });
  ctx.restore();
  ctx.restore();
}
// Demir somun ikonu
function s04_nut(ctx, x, y, r, sc, rot) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const hex = (rr, dy = 0) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr + dy); } ctx.closePath(); };
  hex(r, 8); ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.fill();
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, mix(PAL.rock, '#ffffff', .55)); g.addColorStop(1, PAL.rock);
  hex(r); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeStyle = shade(PAL.rock, -.42); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, TAU); ctx.strokeStyle = rgba(shade(PAL.rock, -.42), .35); ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .38, 0, TAU); ctx.fillStyle = PAL.rock2; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = shade(PAL.rock, -.42); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-r * .45, -r * .5, r * .22, r * .09, -.6, 0, TAU); ctx.fill();
  ctx.restore();
}
// Bakır para ikonu
function s04_coin(ctx, x, y, r, sc, t) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc * (.82 + .18 * Math.abs(Math.cos(t * 1.6))), sc);
  ctx.beginPath(); ctx.arc(0, 8, r, 0, TAU); ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.fill();
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, mix(S04_COPPER, PAL.yellow, .45)); g.addColorStop(1, S04_COPPER);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = shade(S04_COPPER, -.42); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, TAU); ctx.strokeStyle = rgba(shade(S04_COPPER, -.42), .45); ctx.lineWidth = 4; ctx.stroke();
  starPath(ctx, 0, 2, r * .42, 5, .5); ctx.fillStyle = rgba(mix(S04_COPPER, PAL.yellow, .6), .9); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.ellipse(-r * .42, -r * .45, r * .2, r * .09, -.7, 0, TAU); ctx.fill();
  ctx.restore();
}
function s04_sparkle(ctx, x, y, r, a, col = PAL.white) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; starPath(ctx, x, y, r, 4, .3, 0); ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
// Parçacık akışı (ikon → damla) ve damlanın renk değişimi
function s04_stream(ctx, lt, t0, from, to, col, seed) {
  for (let k = 0; k < 12; k++) {
    const p = prog(lt, t0 + k * .06, t0 + .55 + k * .06); if (p <= 0 || p >= 1) continue;
    const q = ease.inOut(p), mx = (from[0] + to[0]) / 2 + (hash(k + seed) - .5) * 160, my = (from[1] + to[1]) / 2 - 40;
    const x = (1 - q) * (1 - q) * from[0] + 2 * (1 - q) * q * mx + q * q * to[0];
    const y = (1 - q) * (1 - q) * from[1] + 2 * (1 - q) * q * my + q * q * to[1];
    const r = 7 + hash(k * 3 + seed) * 7;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r * (1 - q * .5), 0, TAU); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = shade(col, -.42); ctx.stroke();
    s04_sparkle(ctx, x + 10, y - 10, 10, 1 - q);
  }
}
function s04_thermo(ctx, x, y, sc, lvl, t) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const line = PAL.navy;
  rrect(ctx, -24, -170, 48, 250, 24); ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = line; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 100, 46, 0, TAU); ctx.fillStyle = PAL.white; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 100, 33, 0, TAU); ctx.fillStyle = PAL.blueBlood; ctx.fill();
  const top = lerp(60, -140, lvl); rrect(ctx, -11, top, 22, 120 - top, 11); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-12, 88, 8, 12, -.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = line; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const yy = -130 + i * 40; ctx.beginPath(); ctx.moveTo(24, yy); ctx.lineTo(i % 2 ? 36 : 44, yy); ctx.stroke(); }
  // kar tanesi
  ctx.save(); ctx.translate(120, -120); ctx.rotate(t * .5);
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? PAL.white : PAL.navy; ctx.lineWidth = pass ? 9 : 19; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -62); ctx.moveTo(0, -38); ctx.lineTo(-16, -54); ctx.moveTo(0, -38); ctx.lineTo(16, -54);
      ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
  ctx.restore();
}
function s04_depthArrow(ctx, x, y0, len, p, t) {
  if (p <= 0) return;
  const L = len * ease.out(p), y1 = y0 + L;
  ctx.save();
  const g = ctx.createLinearGradient(0, y0, 0, y0 + len); g.addColorStop(0, PAL.sea1); g.addColorStop(1, '#0B2A55');
  ctx.lineCap = 'round'; ctx.lineWidth = 44; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - 30); ctx.stroke();
  ctx.lineWidth = 30; ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 58, y1 - 60); ctx.lineTo(x + 58, y1 - 60); ctx.lineTo(x, y1 + 10); ctx.closePath();
  ctx.fillStyle = '#0B2A55'; ctx.fill(); ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = PAL.navy; ctx.stroke();
  // yan çentikler
  ctx.strokeStyle = rgba(PAL.white, .8); ctx.lineWidth = 5;
  for (let yy = y0 + 40; yy < y1 - 80; yy += 60) { ctx.beginPath(); ctx.moveTo(x - 50, yy); ctx.lineTo(x - 30, yy); ctx.stroke(); }
  // aşağı akan parıltı
  const py = y0 + ((t * 180) % Math.max(1, L - 60));
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x, py, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

// Sağ panel Oki'si → derine inişte ortaya geçer (tek karakter, çift görüntü yok)
function s04_rightOki(ctx, lt) {
  const m = ease.inOut(prog(lt, 12.4, 13.3));
  const x = lerp(1640, 1230, m), y = lerp(790 + Math.sin(lt * 1.5) * 8, 650 + Math.sin(lt * 1.5) * 12, m), s = lerp(.95, 1.15, m);
  let look, eye = 'open', mouth = 'smile', pose;
  if (lt < 12.4) {
    look = lt < 8.4 ? { x: -1, y: 0 } : lt < 10.3 ? { x: -.9, y: -.6 } : { x: -.9, y: .3 };
    eye = lt > 10.8 && lt < 11.8 ? 'happy' : lt > 10.2 && lt < 10.8 ? 'surprised' : 'open';
    mouth = lt > 10.2 ? 'grin' : 'smile'; pose = blendPose('idle', 'cheer', win(lt, 10.6, 12.3, .3, .4) * .6);
  } else {
    look = { x: -.8, y: .2 }; eye = lt > 17.4 && lt < 18.6 ? 'happy' : 'open'; mouth = lt > 17.4 ? 'grin' : 'smile';
    pose = blendPose('idle', 'swim', .25 * m);
  }
  drawOki(ctx, x, y, s, { pose, waveArm: win(lt, 15.4, 20.5, .5, .3), eye, mouth, look, seed: 5 }, lt);
}

registerScene({
  id: 's04_blood', start: T.s04[0], end: T.s04[1],
  cues: [
    { t: .85, sfx: 'boing', vol: .6 }, { t: 1.8, sfx: 'sparkle', vol: .5 },
    { t: 3.8, sfx: 'whoosh', vol: .5 }, { t: 4.5, sfx: 'pop', vol: .5 }, { t: 5.2, sfx: 'click', vol: .6 },
    { t: 6.3, sfx: 'shimmer', vol: .4 }, { t: 7.0, sfx: 'ding', vol: .5 },
    { t: 8.9, sfx: 'click', vol: .5 }, { t: 9.7, sfx: 'shimmer', vol: .45 }, { t: 10.3, sfx: 'magic', vol: .7 },
    { t: 12.8, sfx: 'whoosh', vol: .45 }, { t: 14.0, sfx: 'pop', vol: .45 }, { t: 14.8, sfx: 'pop', vol: .45 },
    { t: 16.0, sfx: 'bubble', vol: .6 }, { t: 17.6, sfx: 'sparkle', vol: .45 }
  ],
  draw(ctx, lt, t) {
    // ============ C: derine iniş (12.5–20) — önce çizilir, üstüne bölünmüş ekran solarak kalkar ============
    if (lt > 12.4) {
      const dep = s04_kf(lt, [[12.8, .2], [18.0, .85]]);
      drawOcean(ctx, t, { depth: dep, floor: false, bubbles: false });
      // iniş hissi: yukarı kayan parçacıklar
      let dist = 0; for (let u = 12.5; u < lt; u += 1 / 30) dist += 260 * s04_kf(u, [[12.8, 0], [13.6, 1], [18.5, 1], [19.8, .4]]) / 30;
      ctx.save();
      for (let i = 0; i < 40; i++) {
        const px = hash(i * 2.3) * W, py = ((hash(i * 5.1) * (H + 100) - dist * (.6 + hash(i) * .8)) % (H + 100) + H + 100) % (H + 100) - 50;
        ctx.fillStyle = `rgba(210,245,255,${.25 + hash(i * 7) * .3})`; ctx.fillRect(px - 2, py - 10, 4, 20);
      }
      ctx.restore();
      // derinlik karartması
      const vg = ctx.createRadialGradient(960, 560, 250, 960, 560, 1100);
      vg.addColorStop(0, 'rgba(0,10,30,0)'); vg.addColorStop(1, `rgba(0,8,24,${.55 * dep})`);
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      // O₂ taşıyan mavi damlalar
      const o2p = win(lt, 16.0, 17.4, .25, .5);
      for (let j = 0; j < 5; j++) {
        const ts = 12.9 + j * 1.2, p = prog(lt, ts, ts + 4.2); if (p <= 0 || p >= 1) continue;
        const x = 560 + (j % 2) * 270 + (hash(j) - .5) * 80 + Math.sin(lt * 1.3 + j) * 30, y = lerp(-120, 1210, p);
        const s = 56 + hash(j * 3) * 10, rot = Math.sin(lt * 1.6 + j) * .12;
        // parıltı
        const gg = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4); gg.addColorStop(0, rgba(PAL.blueBlood, .35)); gg.addColorStop(1, rgba(PAL.blueBlood, 0));
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, s * 2.4, 0, TAU); ctx.fill();
        // sırt çantası kabarcığı
        const br = s * .62 * (1 + .25 * o2p * (.6 + .4 * Math.sin(lt * 9 + j))), bx = x + s * .95, by = y - s * .75;
        ctx.save(); ctx.strokeStyle = shade(PAL.blueBlood, -.42); ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + s * .55, y - s * .55); ctx.lineTo(bx - br * .6, by + br * .5); ctx.stroke(); ctx.restore();
        s04_drop(ctx, x, y, s, PAL.blueBlood, 1, { rot, look: { x: .6, y: .3 }, happy: lt > 17.5, mouth: 'smile' });
        bubble(ctx, bx, by, br, 1);
        s04_o2(ctx, bx + 2, by + 2, br * .95);
      }
      if (lt >= 13.4) s04_rightOki(ctx, lt);
      // SOĞUK
      const sc1 = pop(lt, 14.0, .5);
      s04_thermo(ctx, 250, 560, sc1, lerp(.65, .15, ease.inOut(prog(lt, 14.2, 15.4))), lt);
      pill(ctx, 'SOĞUK', 300, 800, { size: 52, fill: '#CFE4FF', scale: pop(lt, 14.3, .45) });
      // DERİN
      s04_depthArrow(ctx, 1680, 300, 420, prog(lt, 14.8, 15.5), lt);
      pill(ctx, 'DERİN', 1680, 820, { size: 52, fill: '#CFE4FF', scale: pop(lt, 15.0, .45) });
    }

    // ============ A: giriş (0–4.2) ============
    if (lt < 4.4) {
      drawOcean(ctx, t, { depth: .2, floorY: 910 });
      // mavi damla karakter düşer, zıplar
      const f = ease.in(prog(lt, .45, .85)), land = prog(lt, .85, 1.35);
      let dy = lerp(-200, 810, f), sx = 1, sy = 1;
      if (land > 0) { const w = Math.sin(land * Math.PI * 2) * (1 - land) * .28; sx = 1 + w; sy = 1 - w; }
      if (lt > 1.35) { const h = Math.abs(Math.sin((lt - 1.35) * 3.4)); dy -= h * 36; sy = 1 + .06 * h; sx = 1 - .05 * h; }
      softShadow(ctx, 1260, 925, 120 * (lt > .6 ? 1 : 0), 20, .3);
      if (lt > .45) {
        s04_drop(ctx, 1260, dy, 96, PAL.blueBlood, 1, { sx, sy, look: { x: -.7, y: 0 }, mouth: lt > 1.2 ? 'grin' : 'open', happy: lt > 2.0 && lt < 3.0 });
        for (let i = 0; i < 5; i++) {
          const a = lt * 1.2 + i * TAU / 5, r = 175 + Math.sin(lt * 3 + i) * 12;
          s04_sparkle(ctx, 1260 + Math.cos(a) * r, 790 + Math.sin(a) * r * .8, 16 + 6 * Math.sin(lt * 5 + i), pop(lt, 1.7 + i * .06, .4), i % 2 ? PAL.white : '#9CC9FF');
        }
      }
      txt(ctx, 'MAVİ!', 1260, 470, { size: 120, fill: '#9CC9FF', scale: pop(lt, 1.8, .5), rot: Math.sin(lt * 2.5) * .05 });
      // Oki gururlu
      const proud = win(lt, .9, 4.3, .4, .3);
      softShadow(ctx, 720, 940, 230, 34, .25);
      drawOki(ctx, 720, 745 + Math.sin(lt * 1.6) * 8, 1.55, {
        pose: blendPose('idle', 'cheer', .45 * proud), sy: 1 + .04 * proud, sx: 1 - .02 * proud,
        eye: lt > 1.0 && lt < 2.4 ? 'happy' : 'open', mouth: lt > .9 ? 'grin' : 'smile', brow: lt > 2.4 ? 'raised' : null,
        look: { x: .8, y: .1 }, seed: 4
      }, lt);
    }

    // ============ B: bölünmüş ekran (3.7–13.4); çıkışta sol panel sola kayar, Oki derine iner ============
    if (lt > 3.7 && lt < 13.4) {
      // giriş: iki panel kapı gibi yanlardan kayarak gelir; çıkış: sol panel sola kayar
      const e = ease.inOut(prog(lt, 3.7, 4.3)), divX = lerp(960, -40, ease.inOut(prog(lt, 12.4, 13.2)));
      const actR = s04_kf(lt, [[8.0, 0], [8.5, 1]]);
      ctx.save();
      // ---- SAĞ: Oki (bakır → mavi) ----
      ctx.save(); ctx.beginPath(); ctx.rect(Math.max(divX, W - 960 * e), 0, W, H); ctx.clip(); ctx.translate(960 * (1 - e), 0);
      const bgA = 1 - prog(lt, 12.5, 13.4);
      if (bgA > 0) { ctx.save(); ctx.globalAlpha *= bgA; drawOcean(ctx, t, { depth: .25, floorY: 930, camX: 600 }); softShadow(ctx, 1250, 910, 90, 16, .22); softShadow(ctx, 1640, 940, 150, 24, .22); ctx.restore(); }
      const blueK = ease.inOut(prog(lt, 10.3, 11.1)), hopR = Math.abs(Math.sin(lt * 3)) * 14 * blueK;
      const dOut = ease.in(prog(lt, 12.4, 13.3)), dy = 800 - hopR + dOut * 450;
      if (blueK > 0) { const gg = ctx.createRadialGradient(1250, dy, 0, 1250, dy, 200); gg.addColorStop(0, rgba(PAL.blueBlood, .4 * blueK)); gg.addColorStop(1, rgba(PAL.blueBlood, 0)); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(1250, dy, 200, 0, TAU); ctx.fill(); }
      s04_drop(ctx, 1250, dy, 82, PAL.blueBlood, blueK, { look: { x: 0, y: -.8 }, happy: lt > 11.1 && lt < 12.2, mouth: blueK > .5 ? 'grin' : 'smile' });
      const icOut = 1 - ease.in(prog(lt, 12.1, 12.45));
      s04_coin(ctx, 1215, 420, 62, pop(lt, 8.9, .5) * icOut, lt);
      pill(ctx, 'BAKIR', 1430, 420, { size: 50, fill: mix(S04_COPPER, '#ffffff', .6), scale: pop(lt, 9.15, .45) * icOut });
      s04_stream(ctx, lt, 9.6, [1215, 440], [1250, 800], S04_COPPER, 11);
      if (blueK > 0 && dOut < 1) for (let i = 0; i < 6; i++) s04_sparkle(ctx, 1250 + Math.cos(i * 1.1 + lt) * 140, dy - 10 + Math.sin(i * 1.1 + lt) * 115, 16, blueK * (1 - dOut) * (.5 + .5 * Math.sin(lt * 6 + i)), i % 2 ? PAL.white : '#9CC9FF');
      s04_rightOki(ctx, lt);
      ctx.fillStyle = rgba(PAL.navy, .45 * (1 - actR)); ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ---- SOL: biz (demir → kırmızı) ----
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, Math.min(divX, 960 * e)), H); ctx.clip(); ctx.translate(divX - 960 * (2 - e), 0);
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, mix(PAL.sand, '#ffffff', .6)); bg.addColorStop(1, mix(PAL.sand, PAL.octoLight, .25));
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 960, H);
      ctx.fillStyle = rgba(PAL.octoLight, .22);
      for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(hash(i * 3.3) * 960, 230 + hash(i * 7.7) * 850 + Math.sin(lt + i) * 6, 14 + hash(i) * 26, 0, TAU); ctx.fill(); }
      const hin = ease.out(prog(lt, 3.9, 4.6));
      s04_hand(ctx, 290, lerp(1250, 600, hin), .95, -.2 + Math.sin(lt * 2.2) * .04);
      const redK = ease.inOut(prog(lt, 6.6, 7.3)), lb = pop(lt, 4.5, .5);
      const hopL = Math.abs(Math.sin(lt * 3)) * 14 * redK;
      softShadow(ctx, 640, 900, 90 * lb, 16, .22);
      if (lb > 0) {
        ctx.save(); ctx.translate(640, 800 - hopL); ctx.scale(lb, lb);
        if (redK > 0) { const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 200); gg.addColorStop(0, rgba(PAL.redBlood, .35 * redK)); gg.addColorStop(1, rgba(PAL.redBlood, 0)); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); ctx.fill(); }
        s04_drop(ctx, 0, 0, 82, PAL.redBlood, redK, { look: { x: -.3, y: -.8 }, happy: lt > 7.3 && lt < 8.2, mouth: redK > .5 ? 'grin' : 'smile' });
        ctx.restore();
      }
      s04_nut(ctx, 560, 420, 64, pop(lt, 5.2, .5), Math.sin(lt * 1.4) * .15);
      pill(ctx, 'DEMİR', 770, 420, { size: 50, fill: mix(PAL.rock, '#ffffff', .7), scale: pop(lt, 5.45, .45) });
      s04_stream(ctx, lt, 6.2, [560, 440], [640, 800], mix(PAL.rock, '#ffffff', .2), 3);
      if (redK > 0) for (let i = 0; i < 5; i++) s04_sparkle(ctx, 640 + Math.cos(i * 1.3 + lt) * 130, 790 + Math.sin(i * 1.3 + lt) * 110, 14, redK * (.5 + .5 * Math.sin(lt * 6 + i)));
      ctx.fillStyle = rgba(PAL.navy, .45 * actR); ctx.fillRect(0, 0, 960, H);
      ctx.restore();

      // ---- dalgalı ayraç ----
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const edges = e < 1 ? [960 * e, W - 960 * e] : [divX];
      edges.forEach(ex => [[28, PAL.navy], [14, PAL.white]].forEach(([lw, c]) => {
        ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath();
        for (let y = -10; y <= H + 10; y += 12) ctx.lineTo(ex + Math.sin(y * .018 + lt * 3) * 12, y);
        ctx.stroke();
      }));
      ctx.restore();
      ctx.restore();
    }

    factBadge(ctx, 2, 'MAVİ KAN', lt, 20);
  }
});
