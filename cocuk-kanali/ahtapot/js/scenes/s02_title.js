// S2 — BAŞLIK (10–18 sn): ışık patlaması → Oki ortaya çıkar, 7 süper güç yıldızı → ilerleme çubuğuna uçar
registerScene({
  id: 's02_title', start: T.s02[0], end: T.s02[1], transition: 'cut',
  cues: [
    { t: 0, sfx: 'magic' }, { t: .3, sfx: 'tada' }, { t: .5, sfx: 'boing', vol: .7 }, { t: 1.6, sfx: 'pop' },
    { t: 3.3, sfx: 'sparkle' }, { t: 4.1, sfx: 'sparkle', vol: .7 }, { t: 6.7, sfx: 'swoosh_up' }
  ],
  draw(ctx, lt, t) {
    drawOcean(ctx, t, { depth: .15 });
    // güneş ışını patlaması
    ctx.save(); ctx.translate(960, 560); ctx.rotate(lt * .15);
    const ra = .10 + .25 * (1 - ease.out(prog(lt, 0, 1.4)));
    for (let i = 0; i < 16; i++) { ctx.rotate(TAU / 16); ctx.fillStyle = `rgba(255,250,220,${ra})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -1400); ctx.lineTo(90, -1400); ctx.closePath(); ctx.fill(); }
    ctx.restore();

    // Oki: siluetten renge + elastik zıplama
    const k = ease.out(prog(lt, .05, .6)), sc = lerp(1.55, 1.75, ease.outElastic(prog(lt, .05, 1.1)));
    const oy = 720 + Math.sin(lt * 2) * 12;
    softShadow(ctx, 960, 1000, 260, 40, .25);
    drawOki(ctx, 960, oy, sc, {
      color: mix('#0F2744', PAL.octo, k), pose: blendPose('idle', 'cheer', win(lt, .3, 2.6, .3, .6)),
      waveArm: win(lt, 1.4, 6.6, .4, .5), mouth: lt < 2.6 ? 'grin' : 'open', eye: lt > .4 && lt < 1.4 ? 'happy' : 'open', seed: 2
    }, lt);

    // başlık
    txt(ctx, 'AHTAPOT', 960, 150, { size: 170, fill: PAL.yellow, sw: 30, scale: pop(lt, .3, .55) * (1 + .02 * Math.sin(lt * 3)) });
    // isim etiketi
    const ns = pop(lt, 1.6) * (1 - ease.in(prog(lt, 3.0, 3.3)));
    if (ns > 0) {
      ctx.save(); ctx.translate(1420, 470); ctx.scale(ns, ns);
      ctx.fillStyle = PAL.white; rrect(ctx, -170, -70, 340, 140, 60); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = PAL.navy; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-120, 55); ctx.lineTo(-185, 120); ctx.lineTo(-60, 62); ctx.closePath(); ctx.fillStyle = PAL.white; ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.white; ctx.fillRect(-125, 50, 70, 16);
      txt(ctx, 'Ben OKİ!', 0, 0, { size: 72, fill: PAL.octoDark, sw: 0, shadow: false });
      ctx.restore();
    }
    // 7 yıldız: Oki etrafında yay → sağ üst ilerleme çubuğuna uçar
    const x0 = W - 80 - 6 * 58;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.05 + i * .15), st = 3.3 + i * .16;
      const s1 = pop(lt, st, .4); if (!s1) continue;
      const hx = 960 + Math.cos(a) * 560, hy = 620 + Math.sin(a) * 330 + Math.sin(lt * 3 + i) * 8;
      const f = ease.inOut(prog(lt, 6.7 + i * .06, 7.5 + i * .06));
      const x = lerp(hx, x0 + i * 58, f), y = lerp(hy, 90, f), r = lerp(58, 11, f) * s1;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(lt * 2 + i) * .15 * (1 - f));
      starPath(ctx, 0, 5, r, 5, .5); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      starPath(ctx, 0, 0, r, 5, .5); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = lerp(7, 3, f); ctx.strokeStyle = PAL.navy; ctx.stroke();
      if (f < .5) txt(ctx, String(i + 1), 0, 4, { size: r * .78, fill: PAL.navy, sw: 0, shadow: false, alpha: 1 - f * 2 });
      ctx.restore();
    }
    pill(ctx, '7 SÜPER GÜÇ', 960, 1010, { size: 58, fill: PAL.yellow, scale: pop(lt, 3.1) * (1 - ease.in(prog(lt, 7.3, 7.6))) });
    // S1'den devamlılık: karanlık + beyaz flaş
    ctx.fillStyle = `rgba(5,15,30,${.85 * (1 - ease.out(prog(lt, 0, .5)))})`; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,255,255,${.9 * win(lt, 0, .55, .06, .45)})`; ctx.fillRect(0, 0, W, H);
  }
});
