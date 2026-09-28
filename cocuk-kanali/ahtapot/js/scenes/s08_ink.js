// S8 — 6. SÜPER GÜÇ: MÜREKKEP (140–157 sn)
// Sakar-sevimli orfoz yaklaşır → "!" → mürekkep bulutu (balık şaşkın) → Oki jet gibi kaçar (kamera takip, VINNN!) → balık omuz silker, Oki kayanın arkasından göz kırpar
const S08_OKI0 = [1180, 720];
const S08_SIPHON = [1150, 750];
const S08_BLOBS = (() => {
  const r = rng(808), a = [];
  for (let i = 0; i < 30; i++) { const th = r() * TAU, d = Math.sqrt(r()); a.push({ ts: 4.3 + i * .045, tx: 640 + Math.cos(th) * 480 * d, ty: 625 + Math.sin(th) * 215 * d, R: 100 + r() * 78, ph: r() * TAU }); }
  return a;
})();

// ---------- zaman çizelgesi yardımcıları ----------
function s08_jetDist(lt) { const tau = Math.max(0, lt - 9.6); return 1100 * (tau - .25 * (1 - Math.exp(-tau / .25))); }
function s08_okiX(lt) { const extra = lt > 13.9 ? 2600 * Math.pow(lt - 13.9, 2) + 900 * (lt - 13.9) : 0; return S08_OKI0[0] + s08_jetDist(Math.min(lt, 13.9)) + (lt > 13.9 ? 1100 * (lt - 13.9) : 0) + extra; }
function s08_cam(lt) {
  const stop = s08_okiX(13.9) - S08_OKI0[0];
  if (lt < 13.9) return Math.max(0, s08_okiX(lt) - S08_OKI0[0]);
  if (lt < 14.35) return stop;
  return lerp(stop, 0, ease.inOut(prog(lt, 14.35, 14.9)));
}
function s08_oki(lt) {
  const o = { seed: 8, pose: 'idle', eye: 'open', mouth: 'smile', look: { x: -.3, y: 0 } };
  let x = S08_OKI0[0], y = S08_OKI0[1] + Math.sin(lt * 1.6) * 8, s = 1.2;
  if (lt < 3.8) { o.look = lt < 2.4 ? { x: .5, y: -.6 } : { x: -1, y: 0 }; o.eye = lt < 2.0 ? 'happy' : 'open'; }
  else if (lt < 4.3) { o.eye = 'surprised'; o.brow = 'raised'; o.mouth = 'o'; o.look = { x: -1, y: 0 }; y -= 26 * Math.sin(Math.PI * prog(lt, 3.8, 4.25)); }
  else if (lt < 8.8) {
    const sq = prog(lt, 4.1, 4.35), rel = prog(lt, 4.35, 4.8);
    o.sx = 1 + .12 * Math.sin(Math.PI * sq) - .08 * Math.sin(Math.PI * rel); o.sy = 1 - .14 * Math.sin(Math.PI * sq) + .1 * Math.sin(Math.PI * rel);
    o.eye = lt < 6.4 ? 'open' : 'happy'; o.brow = lt < 6.4 ? 'determined' : null; o.mouth = lt < 4.9 ? 'o' : 'grin'; o.look = { x: -1, y: .1 };
  } else {
    const k = ease.inOut(prog(lt, 8.8, 9.4)), an = prog(lt, 9.25, 9.6), go = lt >= 9.6;
    o.pose = blendPose('idle', 'swim', k); o.rot = 1.25 * k + (go ? Math.sin(lt * 3) * .04 : 0);
    o.sx = go ? .9 : 1 + .14 * Math.sin(Math.PI * an); o.sy = go ? 1.12 : 1 - .16 * Math.sin(Math.PI * an);
    x = s08_okiX(lt); y = lerp(S08_OKI0[1], 600, k) + (go ? Math.sin(lt * 4) * 10 : 0);
    o.brow = 'determined'; o.mouth = 'grin'; o.look = { x: 0, y: -1 };
  }
  return { x, y, s, o };
}
function s08_blob(b, lt) {
  const p = prog(lt, b.ts, b.ts + .9); if (p <= 0) return null;
  const e = ease.out(p), dr = Math.max(0, lt - b.ts - .9);
  const x = lerp(S08_SIPHON[0], b.tx, e) + Math.sin(lt * .8 + b.ph) * 14 - dr * 5;
  const y = lerp(S08_SIPHON[1], b.ty, e) + Math.cos(lt * .7 + b.ph) * 12 - dr * 3;
  const r = lerp(22, b.R, ease.out(clamp(p * 1.3))) * (1 + .04 * Math.sin(lt * 2 + b.ph)) + dr * 5;
  return [x, y, r];
}
function s08_cloud(ctx, lt, alpha) {
  const pts = S08_BLOBS.map(b => s08_blob(b, lt)).filter(Boolean);
  if (!pts.length || alpha <= 0) return;
  const circ = add => { ctx.beginPath(); pts.forEach(([x, y, r]) => { const rr = r + add; ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, TAU); }); };
  ctx.save(); ctx.globalAlpha *= alpha;
  circ(8); ctx.fillStyle = shade(PAL.inkCloud, -.4); ctx.fill();
  circ(0); ctx.fillStyle = PAL.inkCloud; ctx.fill();
  ctx.save(); circ(0); ctx.clip();
  ctx.fillStyle = rgba(mix(PAL.inkCloud, PAL.purple, .5), .5);
  ctx.beginPath(); pts.forEach(([x, y, r], i) => { if (i % 2) return; ctx.moveTo(x - r * .25 + r * .45, y - r * .3); ctx.arc(x - r * .25, y - r * .3, r * .45, 0, TAU); }); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); pts.forEach(([x, y, r], i) => { if (i % 3) return; ctx.moveTo(x - r * .4 + r * .16, y - r * .45); ctx.arc(x - r * .4, y - r * .45, r * .16, 0, TAU); }); ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ---------- orfoz ----------
function s08_fish(ctx, x, y, s, lt, st) {
  const body = mix(PAL.sand3, PAL.octoDark, .3), line = shade(body, -.42), fin = shade(body, -.12), lip = mix(body, PAL.pink, .45);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(st.rot || 0);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (!st.faceOnly) {
    ctx.save(); ctx.translate(-200, 0); ctx.rotate(Math.sin(lt * (st.fast ? 9 : 5)) * .2);
    ctx.beginPath(); ctx.moveTo(15, 0); ctx.quadraticCurveTo(-50, -40, -120, -112); ctx.quadraticCurveTo(-92, 0, -120, 112); ctx.quadraticCurveTo(-50, 40, 15, 0); ctx.closePath();
    ctx.fillStyle = fin; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = line; ctx.stroke();
    ctx.strokeStyle = rgba(shade(fin, .3), .7); ctx.lineWidth = 4; [-60, 0, 60].forEach(d => { ctx.beginPath(); ctx.moveTo(-10, d * .1); ctx.lineTo(-90, d); ctx.stroke(); });
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-170, -95); ctx.bezierCurveTo(-130, -238, 70, -236, 125, -115); ctx.closePath();
    ctx.fillStyle = fin; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = line; ctx.stroke();
    ctx.strokeStyle = rgba(shade(fin, .3), .7); ctx.lineWidth = 4; [-110, -40, 30].forEach(d => { ctx.beginPath(); ctx.moveTo(d, -135); ctx.lineTo(d - 8, -195); ctx.stroke(); });
    ctx.beginPath(); ctx.ellipse(0, 0, 238, 165, 0, 0, TAU); ctx.fillStyle = body; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = mix(PAL.sand, PAL.white, .15); ctx.beginPath(); ctx.ellipse(40, 125, 230, 95, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(shade(body, -.2), .7);
    [[-120, -60, 20], [-60, -95, 14], [-150, 20, 15], [-80, 0, 22], [0, -70, 16], [-20, 40, 12], [60, -110, 11]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-60, -115, 70, 20, -.15, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, 238, 165, 0, 0, TAU); ctx.lineWidth = 7; ctx.strokeStyle = line; ctx.stroke();
    // yüzgeç (omuz silkme = yukarı kalkar)
    ctx.save(); ctx.translate(-10, 55); ctx.rotate(.5 + Math.sin(lt * 6) * .18 - (st.fin || 0) * 1.5);
    ctx.beginPath(); ctx.ellipse(-48, 0, 55, 25, 0, 0, TAU); ctx.fillStyle = fin; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = line; ctx.stroke(); ctx.restore();
    // dudaklar
    const open = st.mouthOpen || 0;
    ctx.fillStyle = '#7A1F35'; ctx.beginPath(); ctx.ellipse(222, 26, 24, 10 + open * 16, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = lip; ctx.lineWidth = 6; ctx.strokeStyle = line;
    ctx.beginPath(); ctx.ellipse(220, 8 - open * 8, 44, 22, -.1, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(214, 46 + open * 10, 40, 22, .12, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgba(PAL.blush, .4); ctx.beginPath(); ctx.ellipse(150, 30, 22, 12, 0, 0, TAU); ctx.fill();
  }
  // göz + kaş
  const ex = 118, ey = -55;
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(ex, ey, 42, 0, TAU); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.stroke();
  if (st.dizzy > 0) {
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(lt * 7); ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i * .42, r = 2 + i * .8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.stroke(); ctx.restore();
  } else {
    const lx = st.lookX ?? 1;
    ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.arc(ex + 10 * lx, ey + 4, 20, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(ex + 10 * lx - 7, ey - 4, 7, 0, TAU); ctx.fill();
  }
  ctx.lineWidth = 13; ctx.strokeStyle = PAL.navy; ctx.beginPath();
  if (st.brow === 'grump') { ctx.moveTo(70, -112); ctx.lineTo(162, -90); }
  else { ctx.arc(ex, ey + 10, 64, Math.PI * 1.3, Math.PI * 1.7); }
  ctx.stroke();
  ctx.restore();
}
function s08_rock(ctx, x, y, rx, ry) {
  const c = PAL.rock, path = () => { ctx.beginPath(); ctx.moveTo(x - rx, y); ctx.bezierCurveTo(x - rx * 1.05, y - ry * .9, x - rx * .35, y - ry * 1.05, x + rx * .1, y - ry); ctx.bezierCurveTo(x + rx * .75, y - ry * .95, x + rx * 1.05, y - ry * .5, x + rx, y); ctx.closePath(); };
  softShadow(ctx, x, y, rx * 1.15, 32, .28);
  path(); ctx.fillStyle = c; ctx.fill();
  ctx.save(); path(); ctx.clip();
  ctx.fillStyle = rgba(PAL.rock2, .55); [[-.5, -.5, .16], [.2, -.7, .1], [.45, -.3, .13], [-.15, -.2, .09], [-.7, -.2, .07]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.ellipse(x + a * rx, y + b * ry, r * rx, r * rx * .7, .3, 0, TAU); ctx.fill(); });
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(x - rx * .4, y - ry * .78, rx * .28, ry * .08, -.2, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x - rx, y - ry * .2, rx * 2, ry * .2);
  ctx.restore();
  path(); ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = shade(c, -.42); ctx.stroke();
}
function s08_speed(ctx, lt, v) {
  const a = clamp(Math.abs(v) / 2200) * .5; if (a < .02) return;
  ctx.save(); ctx.strokeStyle = `rgba(233,252,255,${a})`; ctx.lineCap = 'round';
  for (let i = 0; i < 18; i++) {
    const y = 130 + hash(i + 21) * 850, len = 160 + hash(i + 5) * 340, sp = Math.sign(v) || 1;
    const x = ((hash(i + 13) * 2400 - lt * 2400 * sp) % 2400 + 2400) % 2400 - 240;
    ctx.lineWidth = 4 + hash(i + 17) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  ctx.restore();
}

registerScene({
  id: 's08_ink', start: T.s08[0], end: T.s08[1],
  cues: [
    { t: .8, sfx: 'bubble', vol: .45 }, { t: 3.8, sfx: 'boing', vol: .6 }, { t: 4.3, sfx: 'splat', vol: .7 },
    { t: 5.9, sfx: 'bubble', vol: .4 }, { t: 9.6, sfx: 'jet', vol: .7 }, { t: 11.6, sfx: 'whoosh', vol: .35 },
    { t: 13.35, sfx: 'swoosh_up', vol: .5 }, { t: 14.35, sfx: 'whoosh', vol: .5 }, { t: 15.3, sfx: 'pop', vol: .45 }, { t: 16.0, sfx: 'sparkle', vol: .5 }
  ],
  draw(ctx, lt, t) {
    const cam = s08_cam(lt), camV = (s08_cam(lt + .02) - cam) / .02;
    const sh = prog(lt, 4.3, 4.75), shx = sh > 0 && sh < 1 ? Math.sin(lt * 70) * 10 * (1 - sh) : 0, shy = sh > 0 && sh < 1 ? Math.cos(lt * 55) * 7 * (1 - sh) : 0;
    ctx.save(); ctx.translate(shx, shy);
    drawOcean(ctx, t, { depth: .32, camX: cam });
    ctx.save(); ctx.translate(-cam, 0);

    // ---- balık ----
    const fIn = ease.out(prog(lt, .5, 3.4));
    const fx = lerp(-380, 480, fIn) + (lt > 4.3 && lt < 9 ? Math.sin(lt * 2.3) * 16 : 0), fy = 600 + Math.sin(lt * 1.9) * 12;
    const dizzy = lt > 5.2 && lt < 14.4 ? 1 : 0, shrug = win(lt, 15.1, 17.2, .35, .3);
    const fst = { brow: lt < 4.3 ? 'grump' : 'up', dizzy, fast: lt < 3.4, fin: shrug, rot: (dizzy ? Math.sin(lt * 2.6) * .08 : 0) - shrug * .08, mouthOpen: lt > 4.3 && lt < 14.4 ? .6 : lt >= 14.4 ? .15 : 0, lookX: lt > 14.4 ? -1 : 1 };
    s08_fish(ctx, fx, fy, .95, lt, fst);

    // ---- kaya (son sahnede Oki arkasından bakar) ----
    const pk = ease.outBack(prog(lt, 15.2, 15.7)), O2 = { x: 1640, y: lerp(965, 752, pk) + Math.sin(lt * 2) * 5, s: 1.0 };
    if (lt > 14.8) {
      const wk = win(lt, 15.95, 16.55, .08, .1);
      const o2 = { seed: 9, eye: 'open', mouth: 'grin', look: { x: -1, y: .2 }, waveArm: ease.inOut(prog(lt, 16.2, 16.6)) };
      drawOki(ctx, O2.x, O2.y, O2.s, o2, lt);
      if (wk > .5) {
        const [ex, ey] = okiPoint('eyeR', O2.x, O2.y, O2.s, o2);
        ctx.save(); ctx.translate(ex, ey); ctx.scale(O2.s, O2.s);
        ctx.fillStyle = PAL.octo; ctx.beginPath(); ctx.ellipse(0, -2, 29, 33, 0, 0, TAU); ctx.fill();
        ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(0, 8, 18, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); ctx.restore();
      }
    }
    s08_rock(ctx, 1700, 935, 250, 215);

    // ---- mürekkep bulutu ----
    const ca = lt < 14.3 ? 1 : .55 - .22 * prog(lt, 14.9, 17);
    s08_cloud(ctx, lt, ca);
    // bulut içinde parlayan şaşkın göz + soru işaretleri
    if (lt > 4.9) {
      const fa = lt < 14.3 ? prog(lt, 4.9, 5.3) : 1;
      ctx.save(); ctx.globalAlpha *= fa; s08_fish(ctx, fx, fy, .95, lt, { ...fst, faceOnly: true }); ctx.restore();
      [[-40, -260, -.2, 5.8], [70, -300, .15, 6.0], [180, -250, .3, 6.2]].forEach(([dx, dy, r, st], i) => {
        const on = lt < 14.3 ? pop(lt, st, .45) : pop(lt, 15.25 + i * .12, .45);
        if (on > 0) txt(ctx, '?', fx + dx, fy + dy + Math.sin(lt * 3 + i) * 10, { size: 110 - i * 12, fill: PAL.yellow, rot: r + Math.sin(lt * 4 + i) * .1, scale: on });
      });
    }

    // ---- Oki (ana) ----
    if (lt < 14.4) {
      const O = s08_oki(lt);
      const jetting = lt >= 9.6;
      if (jetting) {
        // kabarcık izi
        for (let k = 0; k < 52; k++) {
          const tk = 9.6 + k * .09, age = lt - tk; if (age < 0 || age > 1.1 || tk > 14.2) continue;
          const bx = s08_okiX(tk) - 150, by = 600 + Math.sin(tk * 4) * 10 + 40 + (hash(k) - .5) * 60;
          bubble(ctx, bx - age * 60 + Math.sin(age * 8 + k) * 8, by - age * 90, 6 + hash(k + 3) * 10, 1 - age / 1.1);
        }
        // su jeti (arkaya)
        const [sx, sy] = okiPoint([0, 30], O.x, O.y, O.s, O.o), dx = -Math.cos(O.o.rot - Math.PI / 2), dy = -Math.sin(O.o.rot - Math.PI / 2);
        ctx.save();
        const L = 260 + 40 * Math.sin(lt * 23), Wd = 70 + 12 * Math.sin(lt * 31);
        const g = ctx.createLinearGradient(sx, sy, sx + dx * L, sy + dy * L);
        g.addColorStop(0, 'rgba(233,252,255,0.55)'); g.addColorStop(1, 'rgba(233,252,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - dy * 10, sy + dx * 10); ctx.lineTo(sx + dx * L - dy * Wd, sy + dy * L + dx * Wd); ctx.lineTo(sx + dx * L + dy * Wd, sy + dy * L - dx * Wd); ctx.lineTo(sx + dy * 10, sy - dx * 10); ctx.closePath(); ctx.fill();
        for (let k = 0; k < 7; k++) { const u = ((lt * 3.2 + k / 7) % 1), off = Math.sin(k * 2.7) * Wd * u * .7; bubble(ctx, sx + dx * L * u - dy * off, sy + dy * L * u + dx * off, 5 + 7 * u, 1 - u); }
        ctx.restore();
      } else if (O.o.rot === undefined || O.o.rot < .2) softShadow(ctx, O.x, 915, 230, 30, .22);
      drawOki(ctx, O.x, O.y, O.s, O.o, lt);
      // "!"
      const ex = pop(lt, 3.8, .35) * (1 - ease.inBack(prog(lt, 4.9, 5.2)));
      if (ex > 0) { const [hx, hy] = okiPoint('headTop', O.x, O.y, O.s, O.o); txt(ctx, '!', hx + 20, hy - 70, { size: 150, fill: PAL.yellow, rot: .12 + Math.sin(lt * 20) * .06, scale: ex }); }
    }
    ctx.restore(); // dünya
    ctx.restore(); // sarsıntı

    // ---- ekran katmanı ----
    s08_speed(ctx, lt, camV);
    if (lt > 13.2 && lt < 14.9) {
      const L = 'VINNN!'.split(''), fade = 1 - prog(lt, 14.45, 14.85);
      let x = 560;
      ctx.save(); ctx.globalAlpha *= fade;
      ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      [0, 1, 2].forEach(k => { const p = prog(lt, 13.3 + k * .05, 13.6 + k * .05); ctx.lineWidth = 10 - k * 2; ctx.beginPath(); ctx.moveTo(520 - 260 * p, 250 + k * 50); ctx.lineTo(520 - 40 * p, 250 + k * 50); ctx.stroke(); });
      L.forEach((ch, i) => {
        const sc = pop(lt, 13.3 + i * .07, .35), w = measure(ctx, ch, 170);
        if (sc > 0) txt(ctx, ch, x + w / 2 + (lt - 13.3) * 70, 300 + Math.sin(lt * 18 + i) * 6 * (i < 4 ? 1 : 0), { size: 170, fill: PAL.yellow, rot: -.12, scale: sc });
        x += w + 8;
      });
      ctx.restore();
    }
    factBadge(ctx, 6, 'MÜREKKEP', lt, 17);
  }
});
