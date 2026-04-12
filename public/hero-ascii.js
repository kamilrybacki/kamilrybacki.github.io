(() => {
  const target = document.getElementById('hero-ascii-cloud');
  if (!target) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    const lineHeight = parseFloat(styles.lineHeight) || fontSize;
    const charW = fontSize * 0.62;

    cols = Math.max(36, Math.min(110, Math.floor(rect.width / charW)));
    rows = Math.max(20, Math.min(52, Math.floor(rect.height / lineHeight)));
  }

  function densityField(nx, ny, t) {
    const r = Math.sqrt(nx * nx + ny * ny);
    const a = Math.atan2(ny, nx);

    // Core cloud
    let d = Math.exp(-(r * r) * 3.7) * 0.3;

    // Orbiting lobes (electron-cloud feel)
    for (let k = 0; k < 3; k += 1) {
      const ph = t * (0.75 + k * 0.05) + (k * Math.PI * 2) / 3;
      const cx = 0.42 * Math.cos(ph * 1.06 + Math.sin(t * 0.23 + k));
      const cy = 0.30 * Math.sin(ph * 1.22 + Math.cos(t * 0.19 + k));
      const dx = nx - cx;
      const dy = ny - cy;
      d += Math.exp(-(dx * dx + dy * dy) * 12.5) * 0.48;
    }

    // Breathing ring interference
    const ring = 0.55 + 0.06 * Math.sin(t * 0.9);
    const ringBand = Math.exp(-Math.pow(r - ring, 2) * 95);
    d += ringBand * (0.18 + 0.2 * (0.5 + 0.5 * Math.cos(5.5 * a - 1.7 * t)));

    // Turbulence
    d += 0.12 * (0.5 + 0.5 * Math.sin(7.0 * nx + 5.1 * ny + t * 1.2));
    d += 0.08 * (0.5 + 0.5 * Math.cos(9.2 * nx - 6.6 * ny - t * 0.9));

    // Soft vignette
    d *= Math.exp(-Math.max(0, r - 0.85) * 4.5);

    return clamp(d, 0, 1);
  }

  function render(t) {
    const aspectFix = 0.56; // text cells are taller than wide
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
    // ~15 FPS cap for stable retro feel
    if (ts - lastTs >= 66) {
      lastTs = ts;
      render(ts * 0.001);
    }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    calcGrid();
    render(0);

    if (prefersReducedMotion) return;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(() => {
    calcGrid();
    render(lastTs * 0.001);
  });
  ro.observe(target);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }

    if (!prefersReducedMotion && !rafId) {
      rafId = requestAnimationFrame(frame);
    }
  });

  start();
})();
