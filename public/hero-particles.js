(() => {
  const canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const offscreen = document.createElement('canvas');
  const octx = offscreen.getContext('2d', { alpha: true, willReadFrequently: true });
  if (!octx) return;

  let cssWidth = 0;
  let cssHeight = 0;
  let dpr = 1;
  let particles = [];
  let rafId = null;

  const BAYER_4X4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function setupCanvas() {
    const rect = canvas.getBoundingClientRect();
    cssWidth = Math.max(1, Math.floor(rect.width));
    cssHeight = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    offscreen.width = Math.max(64, Math.floor(cssWidth * 0.42));
    offscreen.height = Math.max(64, Math.floor(cssHeight * 0.42));
  }

  function createParticles() {
    const area = cssWidth * cssHeight;
    const count = Math.max(26, Math.min(90, Math.floor(area / 5200)));
    particles = [];

    for (let i = 0; i < count; i += 1) {
      const seed = i * 17.137;
      particles.push({
        x: seededRandom(seed + 1) * cssWidth,
        y: seededRandom(seed + 2) * cssHeight,
        vx: (seededRandom(seed + 3) - 0.5) * 0.4,
        vy: (seededRandom(seed + 4) - 0.5) * 0.4,
        r: 0.8 + seededRandom(seed + 5) * 2.2,
        a: 0.2 + seededRandom(seed + 6) * 0.65,
      });
    }
  }

  function drawParticleField(time) {
    const ow = offscreen.width;
    const oh = offscreen.height;

    octx.clearRect(0, 0, ow, oh);
    octx.fillStyle = 'rgba(255,255,255,0.18)';
    octx.fillRect(0, 0, ow, oh);

    const sx = ow / cssWidth;
    const sy = oh / cssHeight;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > cssWidth) p.vx *= -1;
      if (p.y < 0 || p.y > cssHeight) p.vy *= -1;

      p.x = Math.max(0, Math.min(cssWidth, p.x));
      p.y = Math.max(0, Math.min(cssHeight, p.y));

      const flicker = 0.65 + 0.35 * Math.sin((time * 0.0018) + p.x * 0.01 + p.y * 0.01);
      octx.beginPath();
      octx.fillStyle = `rgba(8,8,8,${p.a * flicker})`;
      octx.arc(p.x * sx, p.y * sy, p.r, 0, Math.PI * 2);
      octx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt((dx * dx) + (dy * dy));
        if (dist < 86) {
          const alpha = (1 - (dist / 86)) * 0.16;
          octx.strokeStyle = `rgba(10,10,10,${alpha})`;
          octx.lineWidth = 0.7;
          octx.beginPath();
          octx.moveTo(a.x * sx, a.y * sy);
          octx.lineTo(b.x * sx, b.y * sy);
          octx.stroke();
        }
      }
    }
  }

  function applyOrderedDither() {
    const w = offscreen.width;
    const h = offscreen.height;
    const image = octx.getImageData(0, 0, w, h);
    const data = image.data;

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const idx = (y * w + x) * 4;
        const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        const threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) * (255 / 16);
        const value = lum > threshold ? 248 : 22;
        data[idx] = value;
        data[idx + 1] = value;
        data[idx + 2] = value;
      }
    }

    octx.putImageData(image, 0, 0);
  }

  function frame(time) {
    drawParticleField(time);
    applyOrderedDither();

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, cssWidth, cssHeight);

    const bandY = (Math.sin(time * 0.0012) * 0.5 + 0.5) * (cssHeight - 24);
    const grad = ctx.createLinearGradient(0, bandY, 0, bandY + 24);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.16)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, bandY, cssWidth, 24);

    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    setupCanvas();
    createParticles();

    if (prefersReducedMotion) {
      drawParticleField(0);
      applyOrderedDither();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, cssWidth, cssHeight);
      return;
    }

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function handleResize() {
    setupCanvas();
    createParticles();
  }

  const ro = new ResizeObserver(handleResize);
  ro.observe(canvas);
  window.addEventListener('resize', handleResize, { passive: true });

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
