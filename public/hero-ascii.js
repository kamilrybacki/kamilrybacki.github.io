(() => {
  const target = document.getElementById('hero-ascii-cloud');
  if (!target) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionScale = reduceMotion ? 0.45 : 1;
  const charset = ' .,:-~=+*ox%#@';

  let cols = 64;
  let rows = 34;
  let rafId = null;
  let lastTs = 0;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function calcGrid() {
    const rect = target.getBoundingClientRect();
    const styles = window.getComputedStyle(target);

    const fontSize = parseFloat(styles.fontSize) || 8;
    const lineHeightRaw = parseFloat(styles.lineHeight);
    const lineHeight = Number.isFinite(lineHeightRaw) ? lineHeightRaw : fontSize;
    const charW = fontSize * 0.62;

    cols = Math.max(38, Math.min(120, Math.floor(rect.width / charW)));
    rows = Math.max(20, Math.min(56, Math.floor(rect.height / lineHeight)));
  }

  function densityField(nx, ny, t) {
    const r = Math.sqrt(nx * nx + ny * ny);
    const a = Math.atan2(ny, nx);

    // Strong, visible moving center
    const cx0 = 0.18 * Math.cos(t * 0.9);
    const cy0 = 0.14 * Math.sin(t * 1.1);

    let d = Math.exp(-((nx - cx0) ** 2 + (ny - cy0) ** 2) * 5.2) * 0.34;

    // Orbiting lobes (clear motion)
    for (let k = 0; k < 4; k += 1) {
      const ph = t * (0.95 + k * 0.08) + (k * Math.PI * 2) / 4;
      const cx = 0.45 * Math.cos(ph);
      const cy = 0.30 * Math.sin(ph * 1.18 + Math.sin(t * 0.3 + k));
      const dx = nx - cx;
      const dy = ny - cy;
      d += Math.exp(-(dx * dx + dy * dy) * 10.5) * 0.42;
    }

    // Interference rings with obvious pulsing
    const ring = 0.52 + 0.09 * Math.sin(t * 1.35);
    const ringBand = Math.exp(-Math.pow(r - ring, 2) * 80);
    d += ringBand * (0.20 + 0.23 * (0.5 + 0.5 * Math.cos(6.2 * a - 2.2 * t)));

    // Turbulence
    d += 0.12 * (0.5 + 0.5 * Math.sin(7.0 * nx + 5.1 * ny + t * 1.5));
    d += 0.08 * (0.5 + 0.5 * Math.cos(9.2 * nx - 6.6 * ny - t * 1.1));

    d *= Math.exp(-Math.max(0, r - 0.9) * 4.2);
    return clamp(d, 0, 1);
  }

  function render(t) {
    const aspectFix = 0.56;
    const lines = new Array(rows);

    for (let y = 0; y < rows; y += 1) {
      let row = '';
      const ny = ((y / (rows - 1)) * 2 - 1);

      for (let x = 0; x < cols; x += 1) {
        const nx = (((x / (cols - 1)) * 2 - 1) / aspectFix);
        const d = densityField(nx, ny, t);
        const idx = Math.floor(d * (charset.length - 1));
        row += charset[idx];
      }

      lines[y] = row;
    }

    target.textContent = lines.join('\n');
  }

  function frame(ts) {
    // ~20 FPS for more obvious movement
    if (ts - lastTs >= 50) {
      lastTs = ts;
      render(ts * 0.001 * motionScale);
    }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    calcGrid();
    render(0);

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function onResize() {
    calcGrid();
    render(lastTs * 0.001 * motionScale);
  }

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(onResize);
    ro.observe(target);
  } else {
    window.addEventListener('resize', onResize, { passive: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }
    if (!rafId) rafId = requestAnimationFrame(frame);
  });

  start();
})();
