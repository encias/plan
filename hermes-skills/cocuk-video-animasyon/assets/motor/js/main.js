// Sahne yöneticisi: t → kare. render.mjs ve preview.mjs window.renderFrame(t) çağırır.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
SCENES.sort((a, b) => a.start - b.start);

function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAL.deep; ctx.fillRect(0, 0, W, H);
  const sc = SCENES.find(s => t >= s.start && t < s.end) || (t >= DURATION ? SCENES[SCENES.length - 1] : null);
  if (sc) { ctx.save(); try { sc.draw(ctx, t - sc.start, t); } catch (e) { console.error(sc.id, e); } ctx.restore(); }
  else txt(ctx, 'SAHNE YOK  ' + t.toFixed(2), W / 2, H / 2, { size: 60 });
  ctx.setLineDash([]);
  drawProgress(ctx, t);
  // geçişler (sahnenin transition:'cut' değilse)
  SCENES.forEach(s => { if (s.start > 0 && s.transition !== 'cut' && Math.abs(t - s.start) < TR) bubbleWipe(ctx, t - s.start); });
}
window.renderFrame = renderFrame;
window.getCues = () => SCENES.flatMap(s => (s.cues || []).map(c => ({ t: +(s.start + c.t).toFixed(3), sfx: c.sfx, vol: c.vol ?? 1, scene: s.id })))
  .concat(SCENES.filter(s => s.start > 0 && s.transition !== 'cut').map(s => ({ t: s.start - .35, sfx: 'whoosh', vol: .55, scene: 'geçiş' })))
  .sort((a, b) => a.t - b.t);
window.getEpisode = () => ({ duration: DURATION, fps: FPS, music: MUSIC });
window.getScenes = () => SCENES.map(s => ({ id: s.id, start: s.start, end: s.end, transition: s.transition || 'bubbles' }));
window.ready = document.fonts.ready.then(() => Promise.all([...document.fonts].map(f => f.load().catch(() => {}))));

// Tarayıcıda canlı izleme: index.html#play  ya da #t=12.5
(function () {
  const h = location.hash;
  if (h.startsWith('#t=')) window.ready.then(() => renderFrame(parseFloat(h.slice(3))));
  else if (h.startsWith('#play')) {
    const t0 = performance.now() - (parseFloat(h.split('=')[1]) || 0) * 1000;
    window.ready.then(() => { const loop = () => { renderFrame(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); }; loop(); });
  } else window.ready.then(() => renderFrame(0));
})();
