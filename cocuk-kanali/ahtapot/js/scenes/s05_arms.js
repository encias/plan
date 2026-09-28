// S5 — DÜŞÜNEN KOLLAR (64–90 sn): 1'den 8'e kollar → 3 sinir topu (1 kafaya, 2 kollara)
//      → kollar ayrı işler yapar (uzanma / el sallama / ? ! ✓) → vantuzla tat: büyüteç + MMM! → hayal: elinle çilek tadı
function s05_kf(lt, keys) {
  if (lt <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (lt <= keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i];
    return lerp(va, vb, ease.inOut((lt - a) / (b - a)));
  }
  return keys[keys.length - 1][1];
}
const S05_SKIN = mix(PAL.sand, PAL.octoLight, .42);
const S05_SHELL = mix(PAL.octoLight, PAL.sand, .45);
const S05_SHELL_XY = [560, 928];
// Kol uçları (dünya koordinatı)
function s05_tips(x, y, s, o, lt, u = 1) {
  return okiSpines(o, lt).map(A => okiPoint([A.pts[Math.round(u * ARM_N)][0], A.pts[Math.round(u * ARM_N)][1]], x, y, s, o));
}
// Deniz kabuğu (tarak): (x,y) = taban orta
function s05_shell(ctx, x, y, sc) {
  const line = shade(S05_SHELL, -.42);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  softShadow(ctx, 0, 6, 110, 18, .3);
  const fan = () => { ctx.beginPath(); ctx.moveTo(-18, 0); for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.08 + i * .084), r = 92 + (i % 2) * 7; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * .95 - 6); } ctx.lineTo(18, 0); ctx.closePath(); };
  fan(); ctx.fillStyle = S05_SHELL; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = line; ctx.stroke();
  ctx.save(); fan(); ctx.clip();
  ctx.strokeStyle = rgba(line, .45); ctx.lineWidth = 4;
  for (let i = 1; i < 10; i++) { const a = Math.PI * (1.08 + i * .084); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(Math.cos(a) * 100, Math.sin(a) * 100); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-30, -60, 24, 11, -.5, 0, TAU); ctx.fill();
  ctx.restore();
  rrect(ctx, -30, -10, 60, 18, 7); ctx.fillStyle = shade(S05_SHELL, -.08); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = line; ctx.stroke();
  ctx.restore();
}
function s05_check(ctx, x, y, r, col) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.lineWidth = r * .28;
  ctx.beginPath(); ctx.moveTo(x - r * .5, y); ctx.lineTo(x - r * .12, y + r * .4); ctx.lineTo(x + r * .55, y - r * .42); ctx.stroke(); ctx.restore();
}
// Parlak sinir topu
function s05_orb(ctx, x, y, r, a = 1) {
  if (r <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.3); g.addColorStop(0, 'rgba(255,236,140,0.75)'); g.addColorStop(1, 'rgba(255,210,63,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * .55, 0, TAU); ctx.fillStyle = '#FFF4C2'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x - r * .35, y - r * .38, r * .2, 0, TAU); ctx.fill();
  ctx.restore();
}
function s05_star(ctx, x, y, r, a, col = PAL.yellow) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; starPath(ctx, x, y, r, 4, .32, 0); ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
// Büyüteç: vantuz yakın plan + tat parıltıları
function s05_magnifier(ctx, x, y, R, sc, lt) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  // sap
  ctx.save(); ctx.rotate(Math.PI * .75);
  rrect(ctx, R - 6, -24, 170, 48, 22); ctx.fillStyle = PAL.purple; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = shade(PAL.purple, -.42); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; rrect(ctx, R + 20, -14, 120, 10, 5); ctx.fill();
  ctx.restore();
  // mercek içi
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
  ctx.fillStyle = mix(PAL.sea1, '#ffffff', .35); ctx.fillRect(-R, -R, 2 * R, 2 * R);
  // kabuk yüzeyi (alt)
  const sy = R * .35;
  ctx.fillStyle = S05_SHELL; ctx.beginPath(); ctx.moveTo(-R, sy); ctx.quadraticCurveTo(0, sy - 40, R, sy); ctx.lineTo(R, R); ctx.lineTo(-R, R); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = shade(S05_SHELL, -.42); ctx.beginPath(); ctx.moveTo(-R, sy); ctx.quadraticCurveTo(0, sy - 40, R, sy); ctx.stroke();
  ctx.strokeStyle = rgba(shade(S05_SHELL, -.42), .35); ctx.lineWidth = 6;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 55, sy - 18 + Math.abs(i) * 4); ctx.lineTo(i * 80, R); ctx.stroke(); }
  // kol (sağ üstten gelir, vantuzlar aşağıda kabuğa basar)
  const col = PAL.octo, line = shade(col, -.42), suck = mix(col, '#ffffff', .6);
  const press = .5 + .5 * Math.sin(lt * 4);
  ctx.save(); ctx.translate(40, sy - 88 - press * 4); ctx.rotate(-.08);
  ctx.beginPath(); ctx.moveTo(-R - 40, 40); ctx.lineTo(-R - 40, -70); ctx.quadraticCurveTo(0, -95, R + 60, -150); ctx.lineTo(R + 60, 30); ctx.quadraticCurveTo(0, 60, -R - 40, 40); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = line; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-20, -55, 90, 12, -.1, 0, TAU); ctx.fill();
  [-110, -25, 60, 145].forEach((sx, i) => {
    const sy2 = 44 - i * 3, r = 34 - i * 2;
    ctx.fillStyle = suck; ctx.beginPath(); ctx.ellipse(sx, sy2, r, r * .62, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = line; ctx.stroke();
    ctx.fillStyle = rgba(line, .35); ctx.beginPath(); ctx.ellipse(sx, sy2 + 2, r * .45, r * .26, 0, 0, TAU); ctx.fill();
  });
  ctx.restore();
  // tat parıltıları + minik tat zerreleri
  const cols = [PAL.yellow, PAL.pink, PAL.mint, PAL.white];
  for (let k = 0; k < 9; k++) {
    const ph = (lt * .8 + hash(k)) % 1, px = -120 + hash(k * 3) * 250, py = sy - 20 - ph * 150;
    ctx.fillStyle = rgba(cols[k % 4], 1 - ph); ctx.beginPath(); ctx.arc(px, py, 7 + 5 * hash(k * 7), 0, TAU); ctx.fill();
  }
  for (let k = 0; k < 4; k++) s05_star(ctx, -110 + k * 85, sy - 30 + Math.sin(lt * 5 + k) * 6, 20 + 8 * Math.sin(lt * 6 + k * 2), .95, k % 2 ? PAL.white : PAL.yellow);
  // cam parlaması
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-R * .42, -R * .5, R * .32, R * .13, -.7, 0, TAU); ctx.fill();
  ctx.restore();
  // çerçeve
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.lineWidth = 26; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.lineWidth = 14; ctx.strokeStyle = PAL.white; ctx.stroke();
  ctx.restore();
}
// Çilek
function s05_strawberry(ctx, x, y, s, rot = 0) {
  const body = () => {
    ctx.beginPath(); ctx.moveTo(0, -s * .7);
    ctx.bezierCurveTo(s * .9, -s * .98, s * 1.18, -s * .1, s * .55, s * .58);
    ctx.quadraticCurveTo(s * .2, s * .98, 0, s);
    ctx.quadraticCurveTo(-s * .2, s * .98, -s * .55, s * .58);
    ctx.bezierCurveTo(-s * 1.18, -s * .1, -s * .9, -s * .98, 0, -s * .7); ctx.closePath();
  };
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  body(); ctx.fillStyle = PAL.heart; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = shade(PAL.heart, -.42); ctx.stroke();
  ctx.save(); body(); ctx.clip();
  ctx.fillStyle = rgba('#7A0F25', .18); ctx.beginPath(); ctx.ellipse(s * .35, s * .45, s * .9, s * .6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.yellow;
  for (let r = 0; r < 5; r++) for (let c = -3; c <= 3; c++) {
    const sx = c * s * .28 + (r % 2) * s * .14, sy = -s * .38 + r * s * .3;
    ctx.beginPath(); ctx.ellipse(sx, sy, s * .045, s * .07, c * .12, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-s * .45, -s * .25, s * .12, s * .24, .5, 0, TAU); ctx.fill();
  // yapraklar + sap
  starPath(ctx, 0, -s * .72, s * .55, 5, .42, Math.PI / 2); ctx.fillStyle = PAL.seaweed; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = shade(PAL.seaweed, -.42); ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = shade(PAL.seaweed, -.42); ctx.beginPath(); ctx.moveTo(0, -s * .8); ctx.quadraticCurveTo(s * .05, -s * 1.05, s * .2, -s * 1.12); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = PAL.seaweed; ctx.stroke();
  ctx.restore();
}
// İşaret eden çocuk eli (sağa bakar). (x,y) = parmak ucu
function s05_pointHand(ctx, x, y, sc) {
  const line = shade(S05_SKIN, -.42);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-160, 0);
  const P = [
    () => rrect(ctx, -420, -46, 360, 92, 40),
    () => rrect(ctx, -80, -58, 120, 116, 44),
    () => rrect(ctx, 10, -52, 150, 36, 18),
    () => { ctx.save(); ctx.translate(-10, -58); ctx.rotate(-.35); rrect(ctx, 0, -14, 70, 30, 15); ctx.restore(); }
  ];
  ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.strokeStyle = line; P.forEach(f => { f(); ctx.stroke(); });
  ctx.fillStyle = S05_SKIN; P.forEach(f => { f(); ctx.fill(); });
  // kıvrık parmaklar
  ctx.strokeStyle = rgba(line, .55); ctx.lineWidth = 5; ctx.lineCap = 'round';
  [-12, 14, 38].forEach(yy => { ctx.beginPath(); ctx.moveTo(-6, yy); ctx.quadraticCurveTo(26, yy + 4, 34, yy + 14); ctx.stroke(); });
  ctx.fillStyle = rgba('#ffffff', .5); ctx.beginPath(); ctx.ellipse(140, -34, 11, 8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba('#ffffff', .3); ctx.beginPath(); ctx.ellipse(-30, -30, 34, 12, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
// Düşünce bulutu (tümsekli), yalnızca gövde
function s05_cloudPath(ctx, cx, cy, rx, ry, cb) {
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, r = (i % 2 ? .3 : .36) * Math.min(rx, ry) * 1.25;
    cb(cx + Math.cos(a) * rx * .82, cy + Math.sin(a) * ry * .78, r);
  }
  cb(cx, cy, Math.min(rx, ry) * .8, true);
}
function s05_cloud(ctx, cx, cy, rx, ry, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  ctx.fillStyle = 'rgba(5,20,40,0.22)';
  s05_cloudPath(ctx, cx, cy + 10, rx, ry, (x, y, r, core) => { ctx.beginPath(); core ? ctx.ellipse(x, y, rx * .86, ry * .82, 0, 0, TAU) : ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
  ctx.lineWidth = 16; ctx.strokeStyle = PAL.navy;
  s05_cloudPath(ctx, cx, cy, rx, ry, (x, y, r, core) => { ctx.beginPath(); core ? ctx.ellipse(x, y, rx * .86, ry * .82, 0, 0, TAU) : ctx.arc(x, y, r, 0, TAU); ctx.stroke(); });
  ctx.fillStyle = PAL.white;
  s05_cloudPath(ctx, cx, cy, rx, ry, (x, y, r, core) => { ctx.beginPath(); core ? ctx.ellipse(x, y, rx * .86, ry * .82, 0, 0, TAU) : ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
  ctx.restore();
}

registerScene({
  id: 's05_arms', start: T.s05[0], end: T.s05[1],
  cues: [
    { t: .9, sfx: 'pop', vol: .4 }, { t: 1.7, sfx: 'pop', vol: .4 }, { t: 2.5, sfx: 'pop', vol: .45 }, { t: 2.9, sfx: 'ding', vol: .5 },
    { t: 4.7, sfx: 'shimmer', vol: .5 }, { t: 5.5, sfx: 'pop', vol: .5 }, { t: 6.9, sfx: 'whoosh', vol: .4 }, { t: 7.7, sfx: 'sparkle', vol: .6 },
    { t: 10.8, sfx: 'boing', vol: .45 }, { t: 11.3, sfx: 'pop', vol: .4 }, { t: 12.3, sfx: 'pop', vol: .4 }, { t: 13.3, sfx: 'ding', vol: .5 },
    { t: 14.9, sfx: 'squish', vol: .5 }, { t: 15.4, sfx: 'shimmer', vol: .45 }, { t: 16.4, sfx: 'pop', vol: .5 },
    { t: 19.5, sfx: 'magic', vol: .5 }, { t: 20.9, sfx: 'pop', vol: .45 }, { t: 21.3, sfx: 'sparkle', vol: .5 }, { t: 22.4, sfx: 'pop', vol: .5 }, { t: 23.2, sfx: 'boing', vol: .4 }
  ],
  draw(ctx, lt, t) {
    drawOcean(ctx, t, { depth: .28, floorY: 905 });
    const S = 1.6, laughK = win(lt, 21.0, 24.2, .3, .6);
    const ox = s05_kf(lt, [[19.0, 960], [20.0, 720]]);
    const oy = 690 + Math.sin(lt * 1.5) * 8 - Math.abs(Math.sin(lt * 9)) * 10 * laughK;
    const rot = Math.sin(lt * 15) * .035 * laughK;

    // kabuk (10.3'ten sonra yerde)
    const shS = pop(lt, 10.4, .5);
    if (shS > 0) s05_shell(ctx, S05_SHELL_XY[0], S05_SHELL_XY[1], shS * .9);

    // ---------- Oki ----------
    const cheer = s05_kf(lt, [[.4, 0], [.9, .75], [3.9, .75], [4.6, 0]]);
    const neuro = s05_kf(lt, [[4.6, 0], [5.4, .45], [7.7, .45], [8.3, 1], [10.2, 1], [10.9, .55], [14.0, .55], [14.7, 0]]);
    const reachP = s05_kf(lt, [[10.6, 0], [11.6, 1], [19.0, 1], [19.8, 0]]);
    const tgtY = S05_SHELL_XY[1] - lerp(95, 42, ease.inOut(prog(lt, 14.5, 14.95)));
    let eye = 'open', mouth = 'smile', brow = null, look = { x: 0, y: 0 };
    if (lt < .9) mouth = 'smile';
    else if (lt < 2.8) { mouth = 'open'; look = { x: lerp(-1, 1, prog(lt, .9, 2.6)), y: .1 }; }
    else if (lt < 4.3) { eye = 'happy'; mouth = 'grin'; }
    else if (lt < 10.4) { mouth = lt > 7.7 ? 'open' : 'o'; eye = lt > 5.3 && lt < 7.7 ? 'open' : 'open'; look = lt < 6.8 ? { x: 0, y: -1 } : lt < 7.7 ? { x: 0, y: .8 } : { x: 0, y: 0 }; brow = 'raised'; }
    else if (lt < 14.6) { mouth = 'smile'; brow = 'raised'; look = { x: .5, y: -.9 }; }
    else if (lt < 19.2) { eye = 'happy'; mouth = lt > 16.2 && lt < 17.4 ? 'open' : 'grin'; }
    else if (lt < 21.0) { look = { x: 1, y: -.8 }; mouth = 'smile'; }
    else if (lt < 24.2) { eye = 'happy'; mouth = 'grin'; }
    else { mouth = 'smile'; look = { x: .6, y: -.3 }; }
    const o = { pose: blendPose('idle', 'cheer', cheer), neuro, waveArm: win(lt, 10.8, 14.4, .5, .5), eye, mouth, brow, look, rot, seed: 6 };
    const [lx, ly] = okiLocal(S05_SHELL_XY[0], tgtY, ox, oy, S, o);
    if (reachP > 0) o.reach = { arm: 4, x: lx, y: ly, p: reachP };
    softShadow(ctx, ox, 935, 250, 36, .26);
    drawOki(ctx, ox, oy, S, o, lt);
    // beyin ek parıltısı (sinirler kollarda sönükken de beyin net görünsün)
    const bb = win(lt, 4.8, 8.4, .5, .4) * .8;
    if (bb > 0) { ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot); ctx.scale(S, S); drawBrain(ctx, bb, lt); ctx.restore(); }
    const brainW = okiPoint('brain', ox, oy, S, o);

    // ---------- 0.9–2.6: 1'den 8'e ----------
    if (lt > .8 && lt < 4.5) {
      const tips = s05_tips(ox, oy, S, o, lt), base = [ox, oy];
      const order = s05_tips(ox, oy, S, { ...o, pose: blendPose('idle', 'cheer', .75) }, 2.0).map((p, i) => [Math.atan2(p[1] - oy, p[0] - ox), i]).map(([a, i]) => [((a + Math.PI * .5) + TAU) % TAU, i]).sort((a, b) => b[0] - a[0]).map(v => v[1]);
      const fa = 1 - prog(lt, 4.0, 4.4);
      order.forEach((ai, n) => {
        const sc = pop(lt, .9 + n * .23, .4) * fa; if (sc <= 0) return;
        const p = tips[ai], dx = p[0] - base[0], dy = p[1] - base[1], d = Math.hypot(dx, dy) || 1;
        const bx = p[0] + dx / d * 44, by = p[1] + dy / d * 44;
        ctx.save(); ctx.translate(bx, by); ctx.scale(sc, sc);
        ctx.beginPath(); ctx.arc(0, 5, 36, 0, TAU); ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.stroke();
        txt(ctx, String(n + 1), 0, 2, { size: 50, fill: PAL.navy, sw: 0, shadow: false });
        ctx.restore();
      });
      pill(ctx, '8 KOL', 960, 262, { size: 64, fill: PAL.yellow, scale: pop(lt, 2.9, .45) * fa });
    }

    // ---------- 5.5–8.3: 3 sinir topu → 1 kafaya, 2 kollara ----------
    if (lt > 5.3 && lt < 9.0) {
      const trayA = pop(lt, 5.35, .4) * (1 - ease.in(prog(lt, 6.8, 7.1)));
      if (trayA > 0) {
        ctx.save(); ctx.translate(960, 250); ctx.scale(trayA, trayA);
        ctx.fillStyle = 'rgba(5,20,40,0.25)'; rrect(ctx, -190, -56, 380, 120, 60); ctx.fill();
        ctx.fillStyle = rgba(PAL.white, .95); rrect(ctx, -190, -62, 380, 120, 60); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.navy; ctx.stroke();
        ctx.restore();
      }
      const tipsMid = s05_tips(ox, oy, S, o, lt, .45);
      const dests = [brainW, tipsMid[4], tipsMid[7]], starts = [[960, 250], [840, 250], [1080, 250]], t0 = [6.9, 7.1, 7.15];
      for (let i = 0; i < 3; i++) {
        const sc = pop(lt, 5.5 + i * .2, .4); if (sc <= 0) continue;
        const f = ease.inOut(prog(lt, t0[i], t0[i] + .6)); if (f >= 1) continue;
        const sx = starts[i][0], sy = starts[i][1] + Math.sin(lt * 4 + i) * 6 * (1 - f);
        const x = lerp(sx, dests[i][0], f), y = lerp(sy, dests[i][1], f) - Math.sin(f * Math.PI) * 80;
        s05_orb(ctx, x, y, 34 * sc * (1 - f * .45));
      }
      // varış parlamaları
      const fl = prog(lt, 7.5, 8.1);
      if (fl > 0 && fl < 1) {
        ctx.save(); ctx.strokeStyle = rgba(PAL.yellow, 1 - fl); ctx.lineWidth = 10 * (1 - fl) + 2;
        ctx.beginPath(); ctx.arc(brainW[0], brainW[1], 40 + fl * 120, 0, TAU); ctx.stroke(); ctx.restore();
      }
      const bu = prog(lt, 7.75, 8.5);
      if (bu > 0 && bu < 1) {
        const tipsAll = s05_tips(ox, oy, S, o, lt, .75);
        [tipsMid[4], tipsMid[7]].forEach((src, j) => {
          for (let a = 0; a < 4; a++) {
            const dst = tipsAll[j === 0 ? [0, 1, 4, 5][a] : [2, 3, 6, 7][a]], q = ease.out(bu);
            s05_orb(ctx, lerp(src[0], dst[0], q), lerp(src[1], dst[1], q), 14 * (1 - bu * .5), 1 - bu * .6);
          }
        });
      }
    }
    popWords(ctx, "3'TE 2'Sİ KOLLARDA!", 960, 262, lt, 8.2, { size: 84, fill: PAL.yellow, stagger: .16, alpha: 1 - prog(lt, 10.1, 10.45) });

    // ---------- 10.8–14.2: her kol kendi işinde — "? → ! → ✓" düşünce baloncukları (kol 0) ----------
    if (lt > 10.9 && lt < 14.6) {
      const tp = s05_tips(ox, oy, S, o, lt, .97)[0], fa = 1 - prog(lt, 14.2, 14.55);
      const bx = tp[0] - 40, by = tp[1] - 190;
      [[tp[0] - 6, tp[1] - 50, 10], [tp[0] - 20, tp[1] - 92, 16]].forEach(([x, y, r], i) => {
        const sc = pop(lt, 11.0 + i * .12, .35) * fa; if (sc <= 0) return;
        ctx.beginPath(); ctx.arc(x, y, r * sc, 0, TAU); ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.navy; ctx.stroke();
      });
      const sc = pop(lt, 11.25, .45) * fa;
      if (sc > 0) {
        const stage = lt < 12.3 ? 0 : lt < 13.3 ? 1 : 2, ss = pop(lt, [11.25, 12.3, 13.3][stage], .4);
        ctx.save(); ctx.translate(bx, by + Math.sin(lt * 3) * 5); ctx.scale(sc, sc);
        ctx.beginPath(); ctx.arc(0, 5, 58, 0, TAU); ctx.fillStyle = 'rgba(5,20,40,0.22)'; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, 58, 0, TAU); ctx.fillStyle = stage === 2 ? PAL.mint : PAL.white; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.navy; ctx.stroke();
        ctx.scale(ss, ss);
        if (stage === 0) txt(ctx, '?', 0, 2, { size: 84, fill: PAL.purple, sw: 0, shadow: false });
        else if (stage === 1) txt(ctx, '!', 0, 2, { size: 84, fill: PAL.coral, sw: 0, shadow: false });
        else s05_check(ctx, 0, 2, 52, PAL.navy);
        ctx.restore();
      }
    }

    // ---------- 14.8–19.2: dokun → tat al ----------
    const mg = pop(lt, 15.1, .55) * (1 - ease.in(prog(lt, 19.0, 19.4)));
    if (mg > 0) {
      const tip = s05_tips(ox, oy, S, o, lt, 1)[4], L = [440, 540], R = 165;
      // yakınlaştırma konisi
      ctx.save(); ctx.globalAlpha *= .22 * clamp(mg); ctx.fillStyle = PAL.white;
      const ang = Math.atan2(L[1] - tip[1], L[0] - tip[0]), pa = ang + Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(L[0] + Math.cos(pa) * R, L[1] + Math.sin(pa) * R); ctx.lineTo(L[0] - Math.cos(pa) * R, L[1] - Math.sin(pa) * R); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.fillStyle = rgba(PAL.yellow, .8 * clamp(mg)); ctx.beginPath(); ctx.arc(tip[0], tip[1], 12 + 4 * Math.sin(lt * 8), 0, TAU); ctx.fill(); ctx.restore();
      s05_magnifier(ctx, L[0], L[1], R, mg, lt);
    }
    const mm = pop(lt, 16.3, .5) * (1 - ease.in(prog(lt, 18.9, 19.3)));
    if (mm > 0) txt(ctx, 'MMM!', 1330, 430 + Math.sin(lt * 4) * 8, { size: 120, fill: PAL.pink, scale: mm * (1 + .05 * Math.sin(lt * 9)), rot: -.12 + Math.sin(lt * 3) * .05 });
    // dokunma anında vantuz parıltıları
    if (lt > 14.9 && lt < 19.2) {
      const tip = s05_tips(ox, oy, S, o, lt, .95)[4];
      for (let k = 0; k < 3; k++) s05_star(ctx, tip[0] + Math.cos(lt * 2 + k * 2.1) * 42, tip[1] - 20 + Math.sin(lt * 2 + k * 2.1) * 26, 14 + 5 * Math.sin(lt * 7 + k), win(lt, 14.9, 19.2, .2, .3), k % 2 ? PAL.white : PAL.yellow);
    }

    // ---------- 19.4–25.2: hayal balonu — elinle çileğe dokun ----------
    const cl = pop(lt, 19.6, .55);
    if (lt > 19.3) {
      const hp = okiPoint([100, -196], ox, oy, S, o);
      [[hp[0] + 40, hp[1] - 6, 13, 19.35], [hp[0] + 90, hp[1] + 18, 20, 19.45], [hp[0] + 150, hp[1] + 40, 28, 19.55]].forEach(([x, y, r, st]) => {
        const sc = pop(lt, st, .35); if (sc <= 0) return;
        ctx.beginPath(); ctx.arc(x, y, r * sc, 0, TAU); ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.navy; ctx.stroke();
      });
      const CX = 1335, CY = 455, RX = 300, RY = 205;
      s05_cloud(ctx, CX, CY, RX, RY, cl);
      if (cl > 0) {
        ctx.save(); ctx.translate(CX, CY); ctx.scale(cl, cl); ctx.translate(-CX, -CY);
        ctx.save(); ctx.beginPath(); ctx.ellipse(CX, CY, RX * .98, RY * .95, 0, 0, TAU); ctx.clip();
        const touch = ease.out(prog(lt, 20.2, 20.9)), tap = lt > 20.9 ? Math.sin((lt - 20.9) * 5) * 4 : 0;
        const sbx = CX + 105, sby = CY + 10;
        const glow = win(lt, 20.9, 26, .3, .1);
        if (glow > 0) { const g = ctx.createRadialGradient(sbx, sby, 0, sbx, sby, 170); g.addColorStop(0, rgba(PAL.yellow, .45 * glow)); g.addColorStop(1, rgba(PAL.yellow, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sbx, sby, 170, 0, TAU); ctx.fill(); }
        s05_strawberry(ctx, sbx, sby + Math.sin(lt * 2.4) * 5, 92, .12 + Math.sin(lt * 2) * .04);
        s05_pointHand(ctx, lerp(CX - 360, sbx - 70, touch) + tap, CY + 28, .62);
        for (let k = 0; k < 6; k++) {
          const a = lt * 1.3 + k * TAU / 6;
          s05_star(ctx, sbx + Math.cos(a) * 130, sby + Math.sin(a) * 105, 16 + 6 * Math.sin(lt * 6 + k), glow * (.55 + .45 * Math.sin(lt * 5 + k)), k % 2 ? PAL.white : PAL.yellow);
        }
        ctx.restore();
        ctx.restore();
      }
      txt(ctx, '?!', 520, 330, { size: 120, fill: PAL.yellow, scale: pop(lt, 21.7, .45), rot: -.18 + Math.sin(lt * 5) * .08 });
      popWords(ctx, 'ELİNLE TAT AL!', 1335, 790, lt, 22.3, { size: 78, fill: PAL.white, stagger: .15 });
    }

    factBadge(ctx, 3, 'DÜŞÜNEN KOLLAR', lt, 26);
  }
});
