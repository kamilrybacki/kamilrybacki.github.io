(() => {
  const target = document.getElementById('hero-ascii-cloud');
  if (!target) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frames = [];
  let frameIndex = 0;
  let last = 0;

  const fps = () => (motionQuery.matches ? 4 : 12);

  const tick = (ts) => {
    if (!frames.length) return;
    const frameMs = 1000 / fps();
    if (ts - last >= frameMs) {
      target.textContent = frames[frameIndex];
      frameIndex = (frameIndex + 1) % frames.length;
      last = ts;
    }
    requestAnimationFrame(tick);
  };

  fetch('/public/images/ascii-frames.json')
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((raw) => {
      if (!Array.isArray(raw) || !raw.length) throw new Error('Invalid frames payload');
      frames = raw.map((frame) => (Array.isArray(frame) ? frame.join('\n') : String(frame)));
      target.textContent = frames[0];
      requestAnimationFrame(tick);
    })
    .catch((err) => {
      console.error('[hero-ascii-frames] failed to load frames', err);
    });
})();
