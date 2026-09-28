// S1 — KANCA (0–10 sn): karanlıkta gizemli siluet + 3 ipucu + "Bu kim?"
registerScene({
  id: 's01_hook', start: T.s01[0], end: T.s01[1], transition: 'cut',
  cues: [
    { t: .55, sfx: 'heartbeat' }, { t: .8, sfx: 'pop', vol: .5 }, { t: 1.05, sfx: 'pop', vol: .5 }, { t: 1.3, sfx: 'pop', vol: .5 },
    { t: 2.6, sfx: 'whoosh', vol: .5 }, { t: 3.0, sfx: 'bubble' }, { t: 3.15, sfx: 'ding', vol: .6 },
    { t: 4.5, sfx: 'shimmer' }, { t: 5.0, sfx: 'pop', vol: .6 },
    { t: 7.3, sfx: 'pop' }, { t: 7.5, sfx: 'pop', vol: .8 }, { t: 7.7, sfx: 'pop', vol: .7 }, { t: 8.0, sfx: 'drum' }
  ],
  draw(ctx, lt, t) {
    const z = 1 + lt * .008;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    drawOcean(ctx, t, { depth: .92, rays: false, floorY: 965 });
    const g = ctx.createRadialGradient(960, 600, 60, 960, 600, 820);
    g.addColorStop(0, 'rgba(70,170,255,0.20)'); g.addColorStop(1, 'rgba(0,5,15,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // siluet
    const ox = 960, oy = 700 + Math.sin(lt * 1.6) * 10;
    const wig = lt > 7.3 ? Math.sin((lt - 7.3) * 14) * .06 * Math.max(0, 1 - (lt - 7.3) / 1.2) : 0;
    const look = { x: Math.sin(lt * .9) * .8, y: -.2 };
    drawOki(ctx, ox, oy, 1.55, { color: '#0F2744', neuro: win(lt, 4.5, 11, .6, .1), rot: wig, mouth: lt > 7.3 ? 'o' : 'flat', look, seed: 1 }, lt);

    // ipucu 1: üç kalp (sol)
    for (let i = 0; i < 3; i++) {
      const sc = pop(lt, .55 + i * .25, .45); if (!sc) continue;
      const b = 1 + .14 * beat(lt + i * .05, 84);
      const hx = 330 + i * 110, hy = 380;
      ctx.save(); ctx.translate(hx, hy); ctx.scale(sc * b, sc * b);
      heartPath(ctx, 0, 6, 46); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
      heartPath(ctx, 0, 0, 46); ctx.fillStyle = PAL.heart; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.white; ctx.stroke();
      ctx.restore();
    }
    txt(ctx, '3 KALP', 440, 500, { size: 78, fill: PAL.white, scale: pop(lt, 1.35) });

    // ipucu 2: mavi damla (sağ) — yukarıdan düşer, yere çarpınca ezilir
    if (lt > 2.6) {
      const f = ease.in(prog(lt, 2.6, 3.0)), dy = lerp(-120, 380, f);
      const land = prog(lt, 3.0, 3.5), sq = land > 0 ? 1 + .25 * Math.sin(land * Math.PI * 2) * (1 - land) : 1;
      ctx.save(); ctx.translate(1480, dy); ctx.scale(1 / sq, sq);
      dropPath(ctx, 0, 6, 52); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
      dropPath(ctx, 0, 0, 52); ctx.fillStyle = PAL.blueBlood; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = PAL.white; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-18, -8, 9, 16, -.4, 0, TAU); ctx.fill();
      ctx.restore();
      // sıçrama damlacıkları
      if (land > 0 && land < 1) for (let k = 0; k < 6; k++) { const a = -Math.PI * (.15 + k * .14); bubble(ctx, 1480 + Math.cos(a) * 140 * land, 440 + Math.sin(a) * 90 * land + 120 * land * land, 9 * (1 - land) + 2, 1 - land); }
    }
    txt(ctx, 'MAVİ KAN', 1480, 500, { size: 78, fill: '#9CC9FF', scale: pop(lt, 3.15) });

    // ipucu 3: düşünen kollar
    const p3 = pop(lt, 4.95) * (1 - ease.in(prog(lt, 7.1, 7.4)));
    pill(ctx, 'DÜŞÜNEN KOLLAR', 960, 1000, { size: 52, fill: PAL.yellow, scale: p3 });

    // soru
    [[700, 430, -.25, 7.3], [1230, 400, .22, 7.5], [960, 250, 0, 7.7]].forEach(([qx, qy, r, st]) => {
      const sc = pop(lt, st, .5); if (!sc) return;
      txt(ctx, '?', qx, qy + Math.sin(lt * 3 + qx) * 10, { size: 150, fill: PAL.yellow, rot: r + Math.sin(lt * 4 + qx) * .08, scale: sc });
    });
    popWords(ctx, 'BU KİM?', 960, 1000, lt, 8.0, { size: 110, fill: PAL.white, stagger: .15 });
    ctx.restore();
  }
});
