// S3 — ÜÇ KALP (18–44 sn): röntgen taraması → 1-2-3 kalp → solungaç kalpleri + O₂ → ana kalp + mavi akış
//      → yüzerken ana kalp durur (yorgun Oki) → zemine iner, kollarıyla yürür, kalp yeniden atar
// Yardımcılar s03_ önekli (global çakışma olmasın)
function s03_kf(lt, keys) {
  if (lt <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (lt <= keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i];
    return lerp(va, vb, ease.inOut((lt - a) / (b - a)));
  }
  return keys[keys.length - 1][1];
}
// "O₂": ₂ glifi fontta yok → "O" + küçük "2"
function s03_o2(ctx, x, y, size, a = 1) {
  txt(ctx, 'O', x - size * .16, y, { size, fill: PAL.white, stroke: PAL.sea3, sw: size * .22, alpha: a, shadow: false });
  txt(ctx, '2', x + size * .3, y + size * .26, { size: size * .58, fill: PAL.white, stroke: PAL.sea3, sw: size * .16, alpha: a, shadow: false });
}
// Kamera (zoom + dikey merkez) ve yüzme/yürüme hızı → okyanus kaydırma
function s03_camZ(lt) { return s03_kf(lt, [[4.0, 1.27], [5.2, 1.68], [9.8, 1.68], [11.2, 1]]); }
function s03_camY(lt) { return s03_kf(lt, [[4.0, 560], [5.2, 515], [9.8, 515], [11.2, 540]]); }
function s03_speed(u) {
  return 540 * s03_kf(u, [[14.3, 0], [15.0, 1], [16.3, 1], [18.6, .2], [19.2, 0]]) + 160 * s03_kf(u, [[19.6, 0], [20.5, 1]]);
}
function s03_camX(lt) { let x = 0; const dt = 1 / 60; for (let u = 14.3; u < lt; u += dt) x += s03_speed(u) * Math.min(dt, lt - u); return x; }
// Oki'nin konumu/duruşu (saf zaman fonksiyonu → kabarcık izi için geçmiş anlar da hesaplanabilir)
function s03_state(lt) {
  const swimK = s03_kf(lt, [[14.0, 0], [14.6, 1], [18.9, 1], [19.7, 0]]);
  const walkK = s03_kf(lt, [[19.3, 0], [20.1, 1]]);
  const idleK = 1 - Math.max(swimK, walkK);
  const x = s03_kf(lt, [[13.8, 960], [14.7, 870], [16.6, 1000], [18.7, 1050], [19.8, 960]]);
  let y = s03_kf(lt, [[13.8, 700], [14.7, 640], [16.6, 565], [18.7, 615], [19.8, 712]]);
  y += Math.sin(lt * 1.6) * 8 * idleK - Math.sin(lt * 1.4 * TAU) * 9 * swimK - Math.abs(Math.sin(lt * 3.45)) * 9 * walkK;
  const rot = s03_kf(lt, [[14.0, 0], [14.6, .55], [16.6, .5], [18.6, .3], [19.6, 0]]) + walkK * Math.sin(lt * 3.45) * .05;
  return { x, y, rot, swimK, walkK };
}
// Kollarda kalp atışıyla giden mavi parıltı dalgası
function s03_armFlow(ctx, x, y, s, o, lt, k) {
  const sp = okiSpines(o, lt), p = lt * 72 / 60, f = p - Math.floor(p);
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, s); ctx.globalAlpha *= k;
  sp.forEach(A => {
    for (let j = 0; j < 4; j++) {
      const u = .14 + f * .84 - j * .045; if (u < .14 || u > .98) continue;
      const pt = A.pts[Math.round(u * ARM_N)], r = armWidth(A.arm, u) * .75 + 4, a = (1 - j * .24) * (1 - Math.pow(f, 3));
      const g = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], r);
      g.addColorStop(0, rgba('#CFE4FF', .95 * a)); g.addColorStop(.45, rgba(PAL.blueBlood, .8 * a)); g.addColorStop(1, rgba(PAL.blueBlood, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pt[0], pt[1], r, 0, TAU); ctx.fill();
    }
  });
  ctx.restore();
}
// Duraklat ikonu (⏸ glifi yerine iki çubuk)
function s03_pause(ctx, x, y, sc, rot = 0) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(5,20,40,0.25)'; ctx.beginPath(); ctx.arc(0, 6, 50, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.navy; ctx.stroke();
  ctx.fillStyle = PAL.heart; rrect(ctx, -22, -24, 15, 48, 6); ctx.fill(); rrect(ctx, 7, -24, 15, 48, 6); ctx.fill();
  ctx.restore();
}

registerScene({
  id: 's03_hearts', start: T.s03[0], end: T.s03[1],
  cues: [
    { t: .8, sfx: 'shimmer', vol: .5 },
    { t: 2.2, sfx: 'pop', vol: .5 }, { t: 2.6, sfx: 'pop', vol: .5 }, { t: 3.0, sfx: 'pop', vol: .6 }, { t: 3.4, sfx: 'heartbeat', vol: .6 },
    { t: 4.5, sfx: 'ding', vol: .5 }, { t: 5.3, sfx: 'bubble', vol: .5 }, { t: 7.4, sfx: 'bubble', vol: .4 },
    { t: 10.2, sfx: 'heartbeat', vol: .7 }, { t: 10.9, sfx: 'pop', vol: .5 },
    { t: 14.2, sfx: 'swoosh_up', vol: .6 }, { t: 15.5, sfx: 'wrong', vol: .5 }, { t: 16.3, sfx: 'pop', vol: .45 },
    { t: 19.7, sfx: 'boing', vol: .5 }, { t: 20.3, sfx: 'heartbeat', vol: .6 }, { t: 21.0, sfx: 'pop', vol: .55 }, { t: 23.9, sfx: 'sparkle', vol: .5 }
  ],
  draw(ctx, lt, t) {
    const S = 1.5, st = s03_state(lt), z = s03_camZ(lt), cy = s03_camY(lt), camX = s03_camX(lt);
    const toS = (p) => [(p[0] - 960) * z + 960, (p[1] - cy) * z + 540];

    // ---------- Oki parametreleri ----------
    const stop = s03_kf(lt, [[14.9, 0], [15.5, 1], [19.7, 1], [20.3, 0]]);
    const flow = s03_kf(lt, [[10.2, 1], [11.0, 2.4], [13.4, 2.4], [14.2, 1]]) * (1 - stop * .85);
    const hl = lt > 4.0 && lt < 9.7 ? 'gill' : lt > 10.0 && lt < 13.8 ? 'main' : null;
    const xray = lt < 2.0 ? 0 : 1 - s03_kf(lt, [[22.6, 0], [23.3, 1]]);
    const pose = blendPose(blendPose('idle', 'swim', st.swimK), 'walk', st.walkK);
    let eye = 'open', mouth = 'smile', brow = null, look = { x: 0, y: 0 }, blink;
    if (lt > .8 && lt < 2.1) look = { x: 0, y: lerp(-.9, .9, prog(lt, .8, 2.0)) };
    else if (lt >= 2.1 && lt < 4.0) { eye = 'surprised'; mouth = 'open'; brow = 'raised'; look = { x: 0, y: -.6 }; }
    else if (lt >= 4.0 && lt < 9.8) look = { x: Math.sin(lt * 1.3) * .85, y: -.5 };
    else if (lt >= 9.8 && lt < 14.0) { mouth = lt < 12 ? 'open' : 'smile'; look = { x: 0, y: lt > 11 ? .8 : 0 }; }
    else if (lt >= 14.0 && lt < 15.5) { brow = 'determined'; look = { x: .7, y: -.5 }; }
    else if (lt >= 15.5 && lt < 19.8) { mouth = 'wavy'; brow = 'worried'; blink = .38 + .08 * Math.sin(lt * 2.2); look = { x: -.2, y: .5 }; }
    else if (lt >= 19.8 && lt < 21.3) { eye = 'happy'; mouth = 'grin'; }
    else { mouth = lt > 23.8 ? 'grin' : 'smile'; look = { x: .45, y: 0 }; }
    const o = { pose, rot: st.rot, xray, hearts: { bpm: 72, mainStop: stop, flow, highlight: hl }, eye, mouth, brow, look, blink, seed: 3 };

    // ================= DÜNYA (kamera içinde) =================
    ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -cy);
    drawOcean(ctx, t, { depth: .3, camX });
    const shA = lerp(.28, .1, st.swimK);
    softShadow(ctx, st.x, 935, 250 * lerp(1, .7, st.swimK), 36, shA);

    // yüzerken kabarcık izi (kolların arkasından, sola-aşağı kayar)
    if (lt > 14.3 && lt < 20.5) {
      for (let k = 0; k < 34; k++) {
        const tb = 14.3 + k * .14; if (tb > lt || tb > 19.0) continue;
        const age = lt - tb, life = 1.4; if (age > life) continue;
        const sb = s03_state(tb), e = okiPoint([hash(k) * 60 - 30, 150], sb.x, sb.y, S, { rot: sb.rot });
        const dx = -(s03_camX(lt) - s03_camX(tb)) * .9, bx = e[0] + dx - age * 40 + Math.sin(age * 6 + k) * 10, by = e[1] + age * 30 - age * age * 60;
        bubble(ctx, bx, by, 6 + hash(k * 3) * 12, 1 - age / life);
      }
    }

    // Oki (0.8–2.0: tarama çizgisinin geçtiği yerde röntgen açılır)
    if (lt < 2.0) {
      drawOki(ctx, st.x, st.y, S, { ...o, xray: 0 }, lt);
      if (lt > .8) {
        const sy = lerp(st.y - 345, st.y + 30, ease.inOut(prog(lt, .8, 2.0)));
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, sy); ctx.clip(); drawOki(ctx, st.x, st.y, S, { ...o, xray: 1 }, lt); ctx.restore();
        // parlak tarama çizgisi
        const fa = win(lt, .8, 2.0, .15, .2);
        ctx.save(); ctx.globalAlpha *= fa;
        let g = ctx.createLinearGradient(0, sy - 70, 0, sy);
        g.addColorStop(0, 'rgba(120,240,255,0)'); g.addColorStop(1, 'rgba(120,240,255,0.35)');
        ctx.fillStyle = g; ctx.fillRect(st.x - 250, sy - 70, 500, 70);
        g = ctx.createLinearGradient(st.x - 260, 0, st.x + 260, 0);
        g.addColorStop(0, 'rgba(200,250,255,0)'); g.addColorStop(.2, 'rgba(200,250,255,1)'); g.addColorStop(.8, 'rgba(200,250,255,1)'); g.addColorStop(1, 'rgba(200,250,255,0)');
        ctx.fillStyle = g; ctx.fillRect(st.x - 260, sy - 4, 520, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(st.x - 250 + 500 * ((lt * 1.7) % 1), sy, 7, 0, TAU); ctx.fill();
        ctx.restore();
      }
    } else drawOki(ctx, st.x, st.y, S, o, lt);

    // 10.5–13.8: kalbin gönderdiği kan kollara yayılır
    const fw = win(lt, 10.5, 13.8, .4, .5);
    if (fw > 0) s03_armFlow(ctx, st.x, st.y, S, o, lt, fw);

    // 4.4–9.5: sudan solungaçlara giren O₂ kabarcıkları
    if (lt > 4.3 && lt < 9.8) {
      [-1, 1].forEach(sd => {
        const gp = okiPoint(sd < 0 ? 'gillL' : 'gillR', st.x, st.y, S, o);
        let glow = 0;
        for (let k = 0; k < 6; k++) {
          const tb = 4.4 + k * .8 + (sd > 0 ? .4 : 0), p = (lt - tb) / 1.8;
          if (p < 0 || p > 1) { if (p > 1 && p < 1.35) glow = Math.max(glow, 1 - (p - 1) / .35); continue; }
          const q = ease.inOut(p), sx0 = gp[0] + sd * (300 + hash(k + sd) * 60), sy0 = gp[1] - 70 + hash(k * 7 + sd) * 110;
          const bx = lerp(sx0, gp[0], q) + Math.sin(p * 9 + k) * 12 * (1 - q), by = lerp(sy0, gp[1], q) - Math.sin(q * Math.PI) * 40;
          const r = lerp(30, 9, ease.in(p)), a = 1 - prog(p, .82, 1);
          bubble(ctx, bx, by, r, a);
          if (r > 15) s03_o2(ctx, bx + 2, by + 2, r * .95, a);
        }
        if (glow > 0) { ctx.save(); ctx.globalAlpha *= glow * .7; ctx.fillStyle = PAL.foam; ctx.beginPath(); ctx.arc(gp[0], gp[1], 34 + 18 * (1 - glow), 0, TAU); ctx.fill(); ctx.restore(); }
      });
    }

    // yorgunluk: ter damlası
    if (lt > 16.0 && lt < 19.8) {
      for (let j = 0; j < 2; j++) {
        const ph = ((lt - 16.0) / 1.5 + j * .5) % 1, a = Math.sin(ph * Math.PI) * win(lt, 16.0, 19.8, .3, .3);
        const p = okiPoint([118, -175 + ph * 55], st.x, st.y, S, o);
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(p[0], p[1]); ctx.rotate(st.rot);
        dropPath(ctx, 0, 0, 13); ctx.fillStyle = PAL.foam2; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = shade(PAL.sea2, -.2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(-4, -2, 3, 6, -.3, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    // iniş tozu
    if (lt > 19.6 && lt < 20.8) {
      const p = prog(lt, 19.6, 20.8);
      for (let k = 0; k < 7; k++) {
        const sd = k % 2 ? 1 : -1, d = 80 + k * 26;
        ctx.fillStyle = rgba(PAL.sand, .7 * (1 - p)); ctx.beginPath();
        ctx.arc(st.x + sd * (d + p * 90), 925 - p * 30 - hash(k) * 20, 14 + p * 22, 0, TAU); ctx.fill();
      }
    }
    // kırpma (göz kırpar) — röntgen kapandıktan sonra sağ göz
    const wink = win(lt, 23.9, 25.7, .12, .1);
    if (wink > 0 && xray <= 0) {
      ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.rot); ctx.scale(S, S);
      ctx.fillStyle = PAL.octo; ctx.beginPath(); ctx.ellipse(42, -72, 29, 34, 0, 0, TAU); ctx.fill();
      ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.beginPath(); ctx.arc(42, -64, 18, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // ================= EKRAN (kamera dışı yazı/etiketler) =================
    const hL = toS(okiPoint('gillHeartL', st.x, st.y, S, o)), hR = toS(okiPoint('gillHeartR', st.x, st.y, S, o)), hM = toS(okiPoint('mainHeart', st.x, st.y, S, o));

    // hız çizgileri (yüzerken)
    const vK = st.swimK * s03_speed(lt) / 540;
    if (vK > .02) {
      ctx.save(); ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const len = 160 + hash(i * 5) * 160, span = W + 600;
        const u = ((hash(i) * span + lt * 1500) % span) - 300;
        const px = W - u, py = 250 + hash(i * 3 + 1) * 640 + u * .42;
        ctx.strokeStyle = `rgba(233,252,255,${.75 * clamp(vK * 1.3)})`; ctx.lineWidth = 8 + hash(i * 9) * 6;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - len * .92, py + len * .4); ctx.stroke();
      }
      ctx.restore();
    }

    // 2.2 / 2.6 / 3.0: kalplerin yanında 1-2-3
    const numA = 1 - prog(lt, 3.8, 4.15);
    if (lt > 2.1 && numA > 0) {
      ctx.save(); ctx.globalAlpha *= numA;
      callout(ctx, hL[0], hL[1], 600, 470, '1', prog(lt, 2.0, 2.45), { size: 52, fill: PAL.yellow });
      callout(ctx, hR[0], hR[1], 1320, 470, '2', prog(lt, 2.4, 2.85), { size: 52, fill: PAL.yellow });
      callout(ctx, hM[0], hM[1], 960, 245, '3', prog(lt, 2.8, 3.25), { size: 64, fill: PAL.yellow });
      ctx.restore();
    }
    // 4.4–9.6: solungaç kalpleri
    const gA = 1 - prog(lt, 9.4, 9.8);
    if (lt > 4.3 && gA > 0) {
      ctx.save(); ctx.globalAlpha *= gA;
      callout(ctx, hL[0], hL[1], 390, 720, 'SOLUNGAÇ KALBİ', prog(lt, 4.4, 5.2), { size: 44 });
      callout(ctx, hR[0], hR[1], 1530, 720, 'SOLUNGAÇ KALBİ', prog(lt, 4.7, 5.5), { size: 44 });
      ctx.restore();
    }
    // 10.2–13.8: ana kalp
    const mA = 1 - prog(lt, 13.7, 14.1);
    if (lt > 10.2 && mA > 0) {
      ctx.save(); ctx.globalAlpha *= mA;
      callout(ctx, hM[0], hM[1], 1450, 380, 'ANA KALP', prog(lt, 10.3, 11.1), { size: 56, fill: PAL.yellow });
      ctx.restore();
    }
    // 15.5: ana kalp durur → ⏸
    if (lt > 15.3 && lt < 20.6) {
      const ip = okiPoint([150, -235], st.x, st.y, S, o), sp = toS(ip);
      const sc = pop(lt, 15.5, .5) * (1 - ease.in(prog(lt, 19.9, 20.3)));
      if (sc > 0) {
        ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([2, 14]); ctx.lineWidth = 7; ctx.strokeStyle = rgba(PAL.white, .9 * clamp(sc));
        ctx.beginPath(); ctx.moveTo(hM[0], hM[1]); ctx.lineTo(sp[0], sp[1]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        s03_pause(ctx, sp[0], sp[1], sc, Math.sin(lt * 3) * .08);
      }
    }
    // 20.3: kalp yeniden atar → halka
    if (lt > 20.2 && lt < 21.4) {
      for (let j = 0; j < 2; j++) {
        const p = prog(lt, 20.25 + j * .35, 21.0 + j * .35); if (p <= 0 || p >= 1) continue;
        ctx.save(); ctx.strokeStyle = rgba(PAL.heart, 1 - p); ctx.lineWidth = 10 * (1 - p) + 2;
        ctx.beginPath(); ctx.arc(hM[0], hM[1], 40 + p * 150, 0, TAU); ctx.stroke(); ctx.restore();
      }
    }
    // yazılar
    const swA = 1 - prog(lt, 19.0, 19.4);
    if (lt > 16.2 && swA > 0) { ctx.save(); ctx.globalAlpha *= swA; popWords(ctx, 'YÜZERKEN DURUR!', 960, 975, lt, 16.3, { size: 92, fill: PAL.white, stagger: .18 }); ctx.restore(); }
    pill(ctx, 'YÜRÜMEK DAHA KOLAY!', 960, 262, { size: 58, fill: PAL.yellow, scale: pop(lt, 21.0, .5) });
    // göz kırpma parıltısı
    const spk = pop(lt, 23.95, .4) * (1 - prog(lt, 24.6, 25.2));
    if (spk > 0) {
      const ep = toS(okiPoint([108, -125], st.x, st.y, S, o));
      ctx.save(); ctx.translate(ep[0], ep[1]); ctx.rotate(lt * 2); ctx.scale(spk, spk);
      starPath(ctx, 0, 0, 30, 4, .35); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.navy; ctx.stroke();
      ctx.restore();
    }

    factBadge(ctx, 1, 'ÜÇ KALP', lt, 26);
  }
});
