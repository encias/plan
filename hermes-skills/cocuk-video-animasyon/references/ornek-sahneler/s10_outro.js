// S10 — KAPANIŞ (170–180 sn): 7 madalya özeti + pelerinli Oki + sonraki bölüm (yunus) + hoşça kal
function s10_icon(ctx, type, x, y, r, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(5,20,40,0.28)'; ctx.beginPath(); ctx.arc(0, r * .1, r, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.lineWidth = r * .1; ctx.strokeStyle = PAL.navy; ctx.stroke();
  const k = r / 60; ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (type === 'heart') { heartPath(ctx, 0, 2, 30 * (1 + .1 * beat(t, 84))); ctx.fillStyle = PAL.heart; ctx.fill(); }
  else if (type === 'drop') { dropPath(ctx, 0, 8, 22); ctx.fillStyle = PAL.blueBlood; ctx.fill(); }
  else if (type === 'arm') {
    ctx.strokeStyle = PAL.octo; ctx.lineWidth = 13; ctx.beginPath();
    for (let i = 0; i <= 30; i++) { const a = i / 30 * 4.2, rr = 30 - i * .8; ctx.lineTo(-4 + Math.cos(a + 2) * rr, 4 + Math.sin(a + 2) * rr); } ctx.stroke();
    [[-20, -14], [14, -20], [22, 10]].forEach(([a, b], i) => { ctx.fillStyle = rgba(PAL.yellow, .5 + .5 * Math.sin(t * 6 + i)); ctx.beginPath(); ctx.arc(a, b, 6, 0, TAU); ctx.fill(); });
  }
  else if (type === 'bone') {
    ctx.fillStyle = '#F2EEE6'; ctx.strokeStyle = PAL.navy; ctx.lineWidth = 4;
    ctx.save(); ctx.rotate(-.6); rrect(ctx, -26, -7, 52, 14, 7); ctx.fill(); ctx.stroke();
    [[-26, -8], [-26, 8], [26, -8], [26, 8]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 9, 0, TAU); ctx.fill(); ctx.stroke(); }); ctx.restore();
    ctx.strokeStyle = PAL.heart; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-34, -34); ctx.lineTo(34, 34); ctx.stroke();
  }
  else if (type === 'camo') { [[PAL.octo, -16, -12], [PAL.mint, 16, -12], [PAL.yellow, -16, 16], [PAL.purple, 16, 16]].forEach(([c, a, b]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(a, b, 14, 0, TAU); ctx.fill(); }); }
  else if (type === 'ink') { ctx.fillStyle = PAL.inkCloud; [[-14, 6, 20], [10, -8, 22], [18, 12, 16], [-4, -16, 14]].forEach(([a, b, c]) => { ctx.beginPath(); ctx.arc(a, b, c, 0, TAU); ctx.fill(); }); }
  else if (type === 'bulb') {
    ctx.fillStyle = PAL.yellow; ctx.beginPath(); ctx.arc(0, -8, 24, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9AA6B5'; rrect(ctx, -11, 12, 22, 16, 4); ctx.fill();
    ctx.strokeStyle = PAL.yellowDark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-7, 8); ctx.lineTo(0, -6); ctx.lineTo(7, 8); ctx.stroke();
  }
  ctx.restore();
}

function s10_dolphin(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.5) * 6); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.5) * .04);
  const body = '#7FA7C9', line = shade(body, -.42);
  ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = line;
  // kuyruk
  ctx.fillStyle = shade(body, -.1); ctx.beginPath(); ctx.moveTo(150, -10); ctx.quadraticCurveTo(200, -60, 230, -50); ctx.quadraticCurveTo(205, -10, 225, 30); ctx.quadraticCurveTo(190, 20, 150, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  // sırt yüzgeci
  ctx.beginPath(); ctx.moveTo(-10, -58); ctx.quadraticCurveTo(10, -115, 40, -110); ctx.quadraticCurveTo(30, -80, 45, -52); ctx.closePath(); ctx.fill(); ctx.stroke();
  // gövde
  const bodyPath = () => { ctx.beginPath(); ctx.moveTo(-190, 5); ctx.quadraticCurveTo(-200, -12, -160, -22); ctx.quadraticCurveTo(-110, -70, 10, -62); ctx.quadraticCurveTo(120, -50, 160, -5); ctx.quadraticCurveTo(110, 45, 0, 48); ctx.quadraticCurveTo(-120, 50, -165, 22); ctx.quadraticCurveTo(-195, 18, -190, 5); ctx.closePath(); };
  ctx.fillStyle = body; bodyPath(); ctx.fill();
  ctx.save(); bodyPath(); ctx.clip(); ctx.fillStyle = '#DCEAF5'; ctx.beginPath(); ctx.ellipse(-30, 50, 170, 34, 0, 0, TAU); ctx.fill(); ctx.restore();
  bodyPath(); ctx.stroke();
  // yan yüzgeç
  ctx.fillStyle = shade(body, -.1); ctx.beginPath(); ctx.moveTo(-40, 18); ctx.quadraticCurveTo(-20, 60, 10, 62); ctx.quadraticCurveTo(0, 35, -5, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  // uyuyan göz (tek göz açık aralık — merak uyandırsın)
  ctx.strokeStyle = PAL.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-120, -18, 12, Math.PI * .15, Math.PI * .85); ctx.stroke();
  ctx.fillStyle = rgba(PAL.blush, .4); ctx.beginPath(); ctx.ellipse(-120, 8, 14, 8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-60, -45, 40, 9, -.15, 0, TAU); ctx.fill();
  ctx.restore();
  // Zzz
  for (let i = 0; i < 3; i++) {
    const ph = (t * .5 + i / 3) % 1;
    txt(ctx, 'z', x - 140 * s + ph * 90, y - 90 * s - ph * 140, { size: 44 + i * 10, fill: PAL.white, alpha: Math.sin(ph * Math.PI), sw: 8 });
  }
}

registerScene({
  id: 's10_outro', start: T.s10[0], end: T.s10[1],
  cues: [
    { t: .35, sfx: 'pop', vol: .6 }, { t: 1.15, sfx: 'pop', vol: .6 }, { t: 1.95, sfx: 'pop', vol: .6 },
    { t: 3.2, sfx: 'magic' }, { t: 3.5, sfx: 'tada', vol: .7 }, { t: 5.3, sfx: 'swoosh_up', vol: .6 }, { t: 8.3, sfx: 'boing', vol: .5 }
  ],
  draw(ctx, lt, t) {
    drawOcean(ctx, t, { depth: .12 });
    ctx.save(); ctx.translate(960, 620); ctx.rotate(lt * .12);
    for (let i = 0; i < 14; i++) { ctx.rotate(TAU / 14); ctx.fillStyle = 'rgba(255,250,220,0.10)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-100, -1400); ctx.lineTo(100, -1400); ctx.closePath(); ctx.fill(); }
    ctx.restore();

    const part2 = ease.inOut(prog(lt, 5.2, 6.0));
    const ox = lerp(960, 560, part2), oy = 700 + Math.sin(lt * 2.2) * 12, os = lerp(1.6, 1.35, part2);
    // pelerin (Oki'nin arkasında)
    const cp = ease.outBack(prog(lt, 3.2, 3.8));
    if (cp > 0) {
      ctx.save(); ctx.translate(ox, oy - 60 * os); ctx.scale(os * cp, os * cp);
      const fl = Math.sin(lt * 5) * 16, fl2 = Math.sin(lt * 5 + 1.2) * 12;
      ctx.fillStyle = PAL.heart; ctx.strokeStyle = shade(PAL.heart, -.42); ctx.lineWidth = 4; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(70, 10);
      ctx.quadraticCurveTo(-60, -40 + fl2, -250 + fl, 20 + fl2);
      ctx.lineTo(-215 + fl, 70); ctx.lineTo(-250 + fl * .6, 118); ctx.lineTo(-190, 150 + fl2 * .5);
      ctx.quadraticCurveTo(-60, 150, 20, 90); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = shade(PAL.heart, -.2); ctx.beginPath(); ctx.moveTo(40, 40); ctx.quadraticCurveTo(-80, 40 + fl2, -200 + fl, 60); ctx.quadraticCurveTo(-90, 95, 20, 80); ctx.closePath(); ctx.fill();
      starPath(ctx, -150 + fl * .5, 60, 26, 5, .5); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    drawOki(ctx, ox, oy, os, {
      pose: blendPose('idle', 'cheer', win(lt, 3.2, 5.4, .3, .4)), eye: lt > 3.2 && lt < 5.2 ? 'happy' : 'open', mouth: lt > 3.2 ? 'grin' : 'smile',
      waveArm: win(lt, 8.0, 11, .4, .1), look: part2 > .5 ? { x: .9, y: -.1 } : { x: 0, y: -.3 },
      reach: { arm: 7, x: 330, y: -150, p: win(lt, 5.8, 8.0, .4, .4) }, seed: 3
    }, lt);

    // 7 madalya — yay üzerinde
    const icons = ['heart', 'drop', 'arm', 'bone', 'camo', 'ink', 'bulb'];
    const starts = [.3, 1.1, 1.9, 3.2, 3.32, 3.44, 3.56];
    const out = ease.in(prog(lt, 5.0, 5.5));
    icons.forEach((ic, i) => {
      const sc = pop(lt, starts[i], .45) * (1 - out); if (sc <= 0) return;
      const a = Math.PI * (1.12 + i * .127);
      ic === ic && s10_icon(ctx, ic, 960 + Math.cos(a) * 640, 700 + Math.sin(a) * 470 + Math.sin(lt * 3 + i) * 6, 62 * sc, t);
    });
    popWords(ctx, 'SÜPER KAHRAMAN!', 960, 1000, lt, 3.4, { size: 104, fill: PAL.yellow, stagger: .16, alpha: 1 - out });

    // sonraki bölüm kartı
    const cx = lerp(2400, 1330, ease.outBack(prog(lt, 5.4, 6.2)));
    if (cx < 2300) {
      ctx.save(); ctx.translate(cx, 560); ctx.rotate(.02 * Math.sin(lt * 2));
      ctx.fillStyle = 'rgba(5,20,40,0.3)'; rrect(ctx, -420, -300 + 14, 840, 600, 48); ctx.fill();
      const g = ctx.createLinearGradient(0, -300, 0, 300); g.addColorStop(0, '#1C3F7A'); g.addColorStop(1, '#0E2450');
      ctx.fillStyle = g; rrect(ctx, -420, -300, 840, 600, 48); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = PAL.white; ctx.stroke();
      // ay + yıldızlar (gece/uyku)
      ctx.fillStyle = '#FFF3B0'; ctx.beginPath(); ctx.arc(290, -190, 44, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1C3F7A'; ctx.beginPath(); ctx.arc(310, -205, 40, 0, TAU); ctx.fill();
      const r = rng(4); for (let i = 0; i < 10; i++) { starPath(ctx, -380 + r() * 560, -270 + r() * 150, 6 + r() * 6, 5, .45); ctx.fillStyle = rgba('#FFF3B0', .5 + .5 * Math.sin(lt * 3 + i)); ctx.fill(); }
      ctx.restore();
      pill(ctx, 'SONRAKİ BÖLÜM', cx, 300, { size: 46, fill: PAL.yellow });
      s10_dolphin(ctx, cx + 10, 590, 1.25, lt);
      txt(ctx, 'YUNUSLAR NASIL UYUR?', cx, 790, { size: 70, fill: PAL.white, scale: pop(lt, 6.2) });
    }
    txt(ctx, 'HOŞÇA KAL!', 560, 190, { size: 120, fill: PAL.yellow, sw: 22, scale: pop(lt, 8.1, .5), rot: Math.sin(lt * 3) * .03 });
    // son kararma
    ctx.fillStyle = `rgba(11,37,69,${ease.inOut(prog(lt, 9.35, 9.95))})`; ctx.fillRect(0, 0, W, H);
  }
});
