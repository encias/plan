// S9 — 7. SÜPER GÜÇ: SÜPER ZEKÂ (157–170 sn)
// Ampul yanar → kavanozun kapağını çevirip açar → hindistan cevizi kabuklarını taşıyıp içine girer: "EV!"
const S09_JX = 1290;                    // kavanoz merkezi (dünya)
const S09_CX = 1330, S09_RIM = 800;     // hindistan cevizi evi (ekran)
const S09_R = 165, S09_D = 125, S09_RY = 30;

// ---------- zaman ----------
function s09_cam(lt) {
  if (lt < 8.45) return 1500 * ease.inOut(prog(lt, 8.0, 8.45));
  return lerp(1500, 2100, ease.out(prog(lt, 8.45, 10.1)));
}
function s09_okiX(lt) {
  if (lt < 8.45) return lerp(760, 900, ease.inOut(prog(lt, 4.2, 4.9)));
  return lerp(900, 1000, ease.inOut(prog(lt, 8.45, 10.1)));
}

// ---------- nesneler ----------
function s09_bulb(ctx, x, y, sc, lt) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(Math.sin(lt * 2.5) * .06);
  const gl = .8 + .2 * Math.sin(lt * 7);
  const g = ctx.createRadialGradient(0, -10, 20, 0, -10, 190);
  g.addColorStop(0, rgba(PAL.yellow, .65 * gl)); g.addColorStop(1, rgba(PAL.yellow, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -10, 190, 0, TAU); ctx.fill();
  ctx.lineCap = 'round'; ctx.strokeStyle = PAL.yellow;
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i - 4.5) * .33, r0 = 92 + 6 * Math.sin(lt * 8 + i), r1 = r0 + 34 + 10 * Math.sin(lt * 6 + i * 2);
    if (Math.abs(a + Math.PI / 2) > 1.6) continue;
    ctx.lineWidth = 11; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, -10 + Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, -10 + Math.sin(a) * r1); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = PAL.yellow; ctx.stroke();
  }
  // vida tabanı
  ctx.fillStyle = mix(PAL.rock, PAL.white, .35); rrect(ctx, -30, 50, 60, 46, 10); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = shade(PAL.rock, -.42); ctx.stroke();
  ctx.lineWidth = 4; [62, 74, 86].forEach(yy => { ctx.beginPath(); ctx.moveTo(-28, yy); ctx.lineTo(28, yy); ctx.stroke(); });
  // cam
  ctx.beginPath(); ctx.arc(0, -10, 70, Math.PI * .72, Math.PI * 2.28); ctx.lineTo(24, 52); ctx.lineTo(-24, 52); ctx.closePath();
  ctx.fillStyle = mix(PAL.yellow, PAL.white, .35); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = shade(PAL.yellow, -.42); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = PAL.coral; ctx.beginPath(); ctx.moveTo(-14, 50); ctx.lineTo(-14, 0); ctx.lineTo(-7, -14); ctx.lineTo(0, 0); ctx.lineTo(7, -14); ctx.lineTo(14, 0); ctx.lineTo(14, 50); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-32, -38, 13, 24, .5, 0, TAU); ctx.fill();
  ctx.restore();
}
function s09_shell(ctx, x, y, s, glow, lt) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) {
    const g = ctx.createRadialGradient(0, -10, 10, 0, -10, 150);
    g.addColorStop(0, rgba(PAL.yellow, .75 * glow)); g.addColorStop(1, rgba(PAL.yellow, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -10, 150, 0, TAU); ctx.fill();
  }
  const col = mix(PAL.pink, PAL.white, .3), line = shade(col, -.42);
  ctx.beginPath(); ctx.moveTo(0, 40);
  for (let i = 0; i <= 7; i++) { const a = Math.PI * (1.12 + .76 * i / 7), a2 = Math.PI * (1.12 + .76 * (i + .5) / 7); ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); if (i < 7) ctx.quadraticCurveTo(Math.cos(a2) * 86, Math.sin(a2) * 86, Math.cos(Math.PI * (1.12 + .76 * (i + 1) / 7)) * 70, Math.sin(Math.PI * (1.12 + .76 * (i + 1) / 7)) * 70); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = line; ctx.stroke();
  ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(line, .7);
  for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + .76 * (i + .5) / 7); ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(Math.cos(a) * 72, Math.sin(a) * 72); ctx.stroke(); }
  ctx.fillStyle = col; rrect(ctx, -20, 30, 40, 20, 6); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = line; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-24, -34, 14, 7, -.5, 0, TAU); ctx.fill();
  ctx.restore();
}
function s09_jarBody(ctx) { rrect(ctx, S09_JX - 138, 612, 276, 293, 58); }
function s09_jar(ctx, lt, sc, lidOn) {
  if (sc <= 0) return;
  const JX = S09_JX, gl = shade(PAL.foam2, -.42);
  ctx.save(); ctx.translate(JX, 905); ctx.scale(sc, sc); ctx.translate(-JX, -905);
  softShadow(ctx, JX, 905, 190, 28, .3);
  s09_jarBody(ctx); ctx.fillStyle = 'rgba(233,252,255,0.22)'; ctx.fill();
  ctx.fillStyle = 'rgba(233,252,255,0.22)'; ctx.fillRect(JX - 104, 586, 208, 30);
  const sg = lt > 7.0 ? 1 : .55 + .15 * Math.sin(lt * 5);
  s09_shell(ctx, JX, 800 - 30 * ease.out(prog(lt, 7.1, 7.8)), 1.05 + .1 * ease.outBack(prog(lt, 7.05, 7.5)), sg, lt);
  s09_jarBody(ctx); ctx.lineWidth = 6; ctx.strokeStyle = gl; ctx.stroke();
  ctx.strokeRect(JX - 104, 586, 208, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; rrect(ctx, JX - 112, 650, 20, 200, 10); ctx.fill(); rrect(ctx, JX + 96, 680, 10, 80, 5); ctx.fill();
  ctx.restore();
}
function s09_lid(ctx, x, y, rot, turn) {
  const col = PAL.yellow, line = shade(col, -.42), w = 244, h = 60;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = col; rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.clip();
  for (let i = 0; i < 12; i++) {
    const u = ((i / 12 + turn) % 1 + 1) % 1, xx = Math.cos(Math.PI * (1 - u)) * w / 2, a = Math.sin(Math.PI * u);
    ctx.strokeStyle = rgba(line, .35 + .4 * a); ctx.lineWidth = 3 + 4 * a; ctx.beginPath(); ctx.moveTo(xx, -h / 2 + 8); ctx.lineTo(xx, h / 2 - 8); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-w / 2, -h / 2 + 6, w, 9);
  ctx.restore();
  rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.lineWidth = 6; ctx.strokeStyle = line; ctx.stroke();
  ctx.restore();
}
function s09_turnArrows(ctx, x, y, a, lt) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  [[1, -1], [-1, 1]].forEach(([sd, dir]) => {
    const a0 = sd > 0 ? Math.PI * 1.15 : Math.PI * .15, a1 = a0 + Math.PI * .7, off = Math.sin(lt * 10) * .08;
    const pth = () => { ctx.beginPath(); ctx.ellipse(x, y, 190, 58, 0, a0 + off, a1 + off); };
    pth(); ctx.lineWidth = 16; ctx.strokeStyle = PAL.navy; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = PAL.white; ctx.stroke();
    const ex = x + Math.cos(a1 + off) * 190, ey = y + Math.sin(a1 + off) * 58, tx = -Math.sin(a1 + off) * 190, ty = Math.cos(a1 + off) * 58, tl = Math.hypot(tx, ty);
    const ux = tx / tl, uy = ty / tl;
    ctx.beginPath(); ctx.moveTo(ex + ux * 24, ey + uy * 24); ctx.lineTo(ex - uy * 16, ey + ux * 16); ctx.lineTo(ex + uy * 16, ey - ux * 16); ctx.closePath();
    ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.stroke();
  });
  ctx.restore();
}
// Özel kıvrık kol (kavanozu saran) — Oki'nin kol diliyle
function s09_tentacle(ctx, pts, w0, w1, p, col) {
  const N = pts.length - 1, n = Math.max(2, Math.round(N * clamp(p))), L = [], R = [];
  for (let k = 0; k <= n; k++) {
    const a = pts[Math.max(0, k - 1)], b = pts[Math.min(N, k + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const w = lerp(w0, w1, Math.pow(k / N, .8)) / 2, nx = -Math.sin(ang), ny = Math.cos(ang);
    L.push([pts[k][0] + nx * w, pts[k][1] + ny * w]); R.push([pts[k][0] - nx * w, pts[k][1] - ny * w]);
  }
  const path = () => { ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); L.forEach(q => ctx.lineTo(q[0], q[1])); for (let k = R.length - 1; k >= 0; k--) ctx.lineTo(R[k][0], R[k][1]); ctx.closePath(); };
  path(); ctx.fillStyle = col; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = shade(col, -.42); ctx.stroke();
  const tip = pts[n], tw = lerp(w0, w1, Math.pow(n / N, .8)) / 2;
  ctx.beginPath(); ctx.arc(tip[0], tip[1], tw, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
  ctx.fillStyle = mix(col, '#ffffff', .6);
  for (let k = 4; k < n - 1; k += 3) { const w = lerp(w0, w1, Math.pow(k / N, .8)); ctx.beginPath(); ctx.arc((L[k][0] * .3 + pts[k][0] * .7), (L[k][1] * .3 + pts[k][1] * .7), w * .17, 0, TAU); ctx.fill(); }
}
function s09_bez(p0, p1, p2, p3, n) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); }
  return out;
}
// Hindistan cevizi yarımı: fy>0 ağzı yukarı (kase), fy<0 ağzı aşağı (kapak)
const S09_BROWN = shade(PAL.sand3, -.32), S09_MEAT = mix(PAL.sand, PAL.white, .72);
function s09_bowlInner(ctx, cx, ry, dark) {
  ctx.beginPath(); ctx.ellipse(cx, ry, S09_R, S09_RY, 0, 0, TAU); ctx.fillStyle = dark ? mix(PAL.navy, S09_BROWN, .3) : S09_MEAT; ctx.fill();
  if (!dark) { ctx.fillStyle = rgba(PAL.sand2, .6); ctx.beginPath(); ctx.ellipse(cx, ry + 5, S09_R * .82, S09_RY * .62, 0, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 5; ctx.strokeStyle = shade(S09_BROWN, -.42); ctx.beginPath(); ctx.ellipse(cx, ry, S09_R, S09_RY, 0, 0, TAU); ctx.stroke();
}
function s09_bowlFront(ctx, cx, ry) {
  const body = () => { ctx.beginPath(); ctx.moveTo(cx + S09_R, ry); ctx.ellipse(cx, ry, S09_R, S09_D, 0, 0, Math.PI); ctx.ellipse(cx, ry, S09_R, S09_RY, 0, Math.PI, 0, true); ctx.closePath(); };
  body(); ctx.fillStyle = S09_BROWN; ctx.fill();
  ctx.save(); body(); ctx.clip();
  const r = rng(90); ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) { const x = cx + (r() - .5) * S09_R * 2, y = ry + r() * S09_D, a = r() * 3; ctx.strokeStyle = r() < .5 ? rgba(shade(S09_BROWN, .3), .7) : rgba(shade(S09_BROWN, -.25), .7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(cx - S09_R * .55, ry + S09_D * .38, 30, 12, .6, 0, TAU); ctx.fill();
  ctx.restore();
  body(); ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = shade(S09_BROWN, -.42); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, ry, S09_R - 4, S09_RY - 3, 0, .05, Math.PI - .05); ctx.lineWidth = 7; ctx.strokeStyle = S09_MEAT; ctx.stroke();
}
function s09_lidShell(ctx, cx, ry) {
  const body = () => { ctx.beginPath(); ctx.moveTo(cx - S09_R, ry); ctx.ellipse(cx, ry, S09_R, S09_D, 0, Math.PI, TAU); ctx.ellipse(cx, ry, S09_R, S09_RY, 0, 0, Math.PI); ctx.closePath(); };
  body(); ctx.fillStyle = S09_BROWN; ctx.fill();
  ctx.save(); body(); ctx.clip();
  const r = rng(91); ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) { const x = cx + (r() - .5) * S09_R * 2, y = ry - r() * S09_D, a = r() * 3; ctx.strokeStyle = r() < .5 ? rgba(shade(S09_BROWN, .3), .7) : rgba(shade(S09_BROWN, -.25), .7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(cx - S09_R * .45, ry - S09_D * .62, 42, 14, -.5, 0, TAU); ctx.fill();
  ctx.restore();
  body(); ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = shade(S09_BROWN, -.42); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, ry, S09_R - 4, S09_RY - 3, 0, .05, Math.PI - .05); ctx.lineWidth = 7; ctx.strokeStyle = S09_MEAT; ctx.stroke();
}
function s09_half(ctx, cx, ry, fy) {
  ctx.save(); ctx.translate(cx, ry); ctx.scale(1, Math.max(.04, Math.abs(fy))); ctx.translate(-cx, -ry);
  if (fy >= 0) { s09_bowlInner(ctx, cx, ry); s09_bowlFront(ctx, cx, ry); } else s09_lidShell(ctx, cx, ry);
  ctx.restore();
}
function s09_homeTag(ctx, x, y, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const w = 280, h = 120;
  ctx.fillStyle = 'rgba(5,20,40,0.25)'; rrect(ctx, -w / 2, -h / 2 + 10, w, h, 60); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, h / 2 - 4); ctx.lineTo(0, h / 2 + 34); ctx.lineTo(22, h / 2 - 4); ctx.closePath(); ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = PAL.white; rrect(ctx, -w / 2, -h / 2, w, h, 60); ctx.fill(); ctx.stroke();
  ctx.fillRect(-19, h / 2 - 8, 38, 10);
  // ev ikonu
  ctx.save(); ctx.translate(-66, 6);
  ctx.fillStyle = PAL.yellow; ctx.fillRect(-30, -12, 60, 44); ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.strokeRect(-30, -12, 60, 44);
  ctx.beginPath(); ctx.moveTo(-44, -8); ctx.lineTo(0, -46); ctx.lineTo(44, -8); ctx.closePath(); ctx.fillStyle = PAL.coral; ctx.fill(); ctx.stroke();
  heartPath(ctx, 0, 12, 11); ctx.fillStyle = PAL.heart; ctx.fill();
  ctx.restore();
  txt(ctx, 'EV!', 48, 2, { size: 76, fill: PAL.navy, sw: 0, shadow: false });
  ctx.restore();
}

registerScene({
  id: 's09_smart', start: T.s09[0], end: T.s09[1],
  cues: [
    { t: .8, sfx: 'ding', vol: .6 }, { t: 2.0, sfx: 'sparkle', vol: .45 }, { t: 4.3, sfx: 'pop', vol: .5 },
    { t: 5.2, sfx: 'squish', vol: .4 }, { t: 6.3, sfx: 'click', vol: .5 }, { t: 7.0, sfx: 'pop', vol: .6 }, { t: 7.35, sfx: 'tada', vol: .55 },
    { t: 8.05, sfx: 'whoosh', vol: .45 }, { t: 8.5, sfx: 'pop', vol: .45 }, { t: 10.5, sfx: 'boing', vol: .45 },
    { t: 11.35, sfx: 'click', vol: .6 }, { t: 11.7, sfx: 'ding', vol: .5 }
  ],
  draw(ctx, lt, t) {
    const cam = s09_cam(lt), camV = (s09_cam(lt + .02) - cam) / .02;
    const z = 1 + .12 * ease.inOut(prog(lt, 11.4, 12.5));
    ctx.save(); ctx.translate(S09_CX, S09_RIM - 60); ctx.scale(z, z); ctx.translate(-S09_CX, -(S09_RIM - 60));
    drawOcean(ctx, t, { depth: .2, camX: cam });

    // ---- kavanoz (dünya) ----
    const jarS = pop(lt, 4.25, .5) * (1 - ease.inBack(prog(lt, 7.9, 8.2)));
    const turn = lt < 5.7 ? 0 : lt < 6.9 ? -ease.inOut(prog(lt, 5.7, 6.9)) * 1.4 : -1.4;
    const lidP = prog(lt, 7.0, 7.7);
    ctx.save(); ctx.translate(-cam, 0);
    s09_jar(ctx, lt, jarS, lidP <= 0);
    ctx.restore();

    // ---- Oki ----
    const hop = prog(lt, 10.5, 10.95), inBowl = lt >= 10.5;
    let ox = s09_okiX(lt), oy = 790 + Math.sin(lt * 1.7) * 7, os = 1.2;
    const walking = lt > 8.2 && lt < 10.15;
    const o = { seed: 11, pose: 'idle', eye: 'open', mouth: 'smile', look: { x: 0, y: 0 } };
    if (lt < 4.2) {
      o.neuro = win(lt, .7, 4.2, .4, .4) * .8; o.look = { x: 0, y: -1 }; o.brow = 'raised';
      o.eye = lt > .8 && lt < 1.6 ? 'happy' : 'open'; o.mouth = lt > .8 ? 'grin' : 'smile';
      o.pose = blendPose('idle', 'cheer', win(lt, .8, 3.8, .3, .4) * .6);
    } else if (lt < 8.2) {
      o.look = { x: 1, y: lt < 5.5 ? .1 : -.5 };
      o.brow = lt > 5.5 && lt < 7.0 ? 'determined' : null; o.mouth = lt > 5.5 && lt < 7.0 ? 'flat' : lt > 7.0 ? 'grin' : 'smile';
      if (lt > 7.0) { o.eye = 'happy'; o.pose = blendPose('idle', 'cheer', win(lt, 7.0, 8.2, .2, .4)); }
      const [lx, ly] = okiLocal(S09_JX - 118, 568, ox, oy, os, o);
      o.reach = { arm: 7, x: lx, y: ly, p: ease.inOut(prog(lt, 5.1, 5.6)) * (1 - ease.inOut(prog(lt, 7.0, 7.35))) };
    } else if (!inBowl) {
      o.pose = blendPose('idle', 'walk', ease.inOut(prog(lt, 8.0, 8.4)) * (1 - ease.inOut(prog(lt, 10.1, 10.4))));
      if (walking) oy -= Math.abs(Math.sin(lt * 7)) * 14;
      o.mouth = 'grin'; o.look = { x: .8, y: -.2 }; o.eye = Math.sin(lt * 3.5) > .6 ? 'happy' : 'open';
      if (lt > 10.1) { o.brow = null; o.look = { x: 1, y: -.6 }; o.eye = 'open'; }
    }
    // hindistan cevizi durumları
    const headTop = () => okiPoint('headTop', ox, oy, os, o);
    let stack = null, lid = null;
    if (lt > 8.4 && lt < 10.4) {
      const sp = pop(lt, 8.45, .4), [hx, hy] = headTop();
      const k = ease.inOut(prog(lt, 10.1, 10.4));
      stack = { x: lerp(hx + 10, S09_CX, k), y: lerp(hy - 22, S09_RIM, k) - Math.sin(Math.PI * k) * 60, s: sp };
      if (lt < 10.1) { const [lx, ly] = okiLocal(hx + 10 + S09_R * .92, hy - 20, ox, oy, os, o); o.reach = { arm: 7, x: lx, y: ly, p: ease.inOut(prog(lt, 8.5, 8.8)) }; }
    }
    if (lt >= 10.4) {
      const k = ease.inOut(prog(lt, 10.4, 10.8)), kc = ease.in(prog(lt, 10.95, 11.35)), bounce = Math.sin(Math.PI * prog(lt, 11.35, 11.6)) * 10;
      lid = { x: S09_CX, y: lerp(lerp(S09_RIM - 16, 540, k), S09_RIM - 52, kc) - bounce, fy: lerp(1, -1, k) };
      if (lt < 10.9) { const [lx, ly] = okiLocal(lid.x - S09_R, lid.y, ox, oy, os, o); o.reach = { arm: 7, x: lx, y: ly, p: win(lt, 10.3, 10.85, .15, .2) }; }
    }
    if (inBowl) {
      const e = ease.inOut(hop);
      ox = lerp(1000, S09_CX, e); oy = lerp(790, S09_RIM + 64, e) - Math.sin(Math.PI * hop) * 190; os = lerp(1.2, .68, e);
      o.pose = blendPose('cheer', 'idle', e); o.eye = 'happy'; o.mouth = 'grin'; o.rot = Math.sin(Math.PI * hop) * .25;
      if (hop >= 1) { o.eye = 'open'; o.mouth = 'smile'; o.look = { x: 0, y: -.4 }; o.rot = 0; }
    }

    // zemin: kase (içi) — Oki kasenin içindeyken
    const closed = lt >= 11.35;
    if (lt >= 10.1) {
      if (lt < 10.4) { /* yığın hâlâ hareket ediyor */ }
      else { softShadow(ctx, S09_CX, S09_RIM + S09_D + 4, S09_R * 1.1, 22, .2); s09_bowlInner(ctx, S09_CX, S09_RIM, closed); }
    }
    if (!closed) {
      if (!walking && lt < 8.2) softShadow(ctx, ox, 1000, 220, 30, .22);
      ctx.save();
      if (inBowl && hop > .55) { ctx.beginPath(); ctx.rect(0, -500, W, S09_RIM + 500); ctx.rect(-500, -500, S09_CX - S09_R + 500, 2000); ctx.moveTo(S09_CX + S09_R, S09_RIM); ctx.ellipse(S09_CX, S09_RIM, S09_R, S09_RY, 0, 0, TAU); ctx.clip(); }
      drawOki(ctx, ox, oy, os, o, lt);
      ctx.restore();
    } else {
      // aralıktan bakan gözler
      const bl = (() => { const p = prog(lt, 12.2, 12.4); return p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0; })();
      const lookX = Math.sin(lt * 1.5) * 5;
      [-34, 34].forEach(dx => {
        const ex = S09_CX + dx, ey = S09_RIM + 2;
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 20, 23 * (1 - bl * .9), 0, 0, TAU); ctx.fillStyle = PAL.white; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = PAL.navy; ctx.stroke(); ctx.clip();
        ctx.fillStyle = PAL.navy; ctx.beginPath(); ctx.arc(ex + lookX, ey + 3, 12, 0, TAU); ctx.fill();
        ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(ex + lookX - 4, ey - 2, 4.5, 0, TAU); ctx.fill();
        ctx.restore();
      });
    }
    if (lt >= 10.4) s09_bowlFront(ctx, S09_CX, S09_RIM);
    if (stack && stack.s > 0) {
      ctx.save(); ctx.translate(stack.x, stack.y); ctx.scale(stack.s, stack.s); ctx.translate(-stack.x, -stack.y);
      s09_half(ctx, stack.x, stack.y, 1); s09_half(ctx, stack.x, stack.y - 18, 1);
      ctx.restore();
    }
    if (lid) s09_half(ctx, lid.x, lid.y, lid.fy);

    // kavanoz kapağı + sarılan kol (Oki'nin önünde)
    ctx.save(); ctx.translate(-cam, 0);
    if (jarS > 0) {
      const wrapP = ease.out(prog(lt, 5.0, 5.6)) * (1 - ease.inOut(prog(lt, 7.4, 7.8)));
      if (wrapP > .02) {
        const [bx, by] = okiPoint([70, -4], ox, oy, os, o);
        const pts = s09_bez([bx, by], [bx + 160, by + 70], [S09_JX - 60, 900], [S09_JX + 150, 770], 40);
        pts.push([S09_JX + 150, 740]);
        s09_tentacle(ctx, pts, 30 * os, 7, wrapP, PAL.octo);
      }
      if (lidP < 1) {
        const lx = S09_JX + 260 * lidP, ly = 568 - 950 * ease.out(lidP);
        const shake = lt > 5.7 && lt < 6.9 ? Math.sin(lt * 40) * 2 : 0;
        ctx.save(); ctx.translate(S09_JX, 905); ctx.scale(jarS, jarS); ctx.translate(-S09_JX, -905);
        s09_lid(ctx, lx + shake, ly, lidP * 5, turn);
        ctx.restore();
      }
      s09_turnArrows(ctx, S09_JX, 568, win(lt, 5.7, 6.95, .2, .2), lt);
      // parıltılar
      const sp = win(lt, 7.1, 8.1, .1, .4);
      if (sp > 0) for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + lt * .8, d = 110 + 90 * ease.out(prog(lt, 7.05, 7.7));
        starPath(ctx, S09_JX + Math.cos(a) * d, 770 + Math.sin(a) * d * .8, 18 * sp, 4, .4); ctx.fillStyle = i % 2 ? PAL.yellow : PAL.white; ctx.fill();
      }
    }
    ctx.restore();

    // ampul + yazı
    if (lt < 4.3) {
      const [hx, hy] = okiPoint('headTop', ox, oy, os, o);
      const bs = pop(lt, .7, .5) * (1 - ease.inBack(prog(lt, 3.9, 4.25)));
      s09_bulb(ctx, hx, hy - 125 + Math.sin(lt * 2.2) * 8, bs, lt);
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 + .4, tw = Math.max(0, Math.sin(lt * 4 + i * 1.7)), d = 185 + 20 * Math.sin(lt + i);
        const sc = bs * tw; if (sc <= 0) continue;
        starPath(ctx, hx + Math.cos(a) * d, hy - 135 + Math.sin(a) * d * .75, 18 * sc, 4, .4); ctx.fillStyle = PAL.white; ctx.fill();
      }
      popWords(ctx, 'ÇOK ZEKİ!', 1340, 560, lt, 2.0, { size: 112, fill: PAL.yellow, stagger: .15, scale: 1 - ease.inBack(prog(lt, 3.85, 4.2)) });
    }
    ctx.restore(); // zoom

    // ekran katmanı
    if (Math.abs(camV) > 400) {
      const a = clamp(Math.abs(camV) / 2600) * .5;
      ctx.save(); ctx.strokeStyle = `rgba(233,252,255,${a})`; ctx.lineCap = 'round';
      for (let i = 0; i < 14; i++) { const y = 150 + hash(i + 31) * 800, len = 180 + hash(i + 9) * 300, x = ((hash(i + 2) * 2400 - lt * 2600) % 2400 + 2400) % 2400 - 240; ctx.lineWidth = 4 + hash(i + 4) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke(); }
      ctx.restore();
    }
    s09_homeTag(ctx, S09_CX, S09_RIM - 320 + Math.sin(lt * 2.4) * 6, pop(lt, 11.65, .5));
    factBadge(ctx, 7, 'SÜPER ZEKÂ', lt, 13);
  }
});
