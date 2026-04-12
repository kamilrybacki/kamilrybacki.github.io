(() => {
  const canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const offscreen = document.createElement('canvas');
  const octx = offscreen.getContext('2d', { alpha: true, willReadFrequently: true });
  if (!octx) return;

  const BAYER_4X4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  let cssWidth = 1;
  let cssHeight = 1;
  let dpr = 1;
  let rafId = null;

  let smoke = [];
  let sparks = [];

  const STATE = {
    ramX: 0,
    ramY: 0,
    ramW: 0,
    ramH: 0,
    burnX: 0,
    burnY: 0,
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
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

    // Low internal resolution to emphasize halftone/dither look.
    offscreen.width = Math.max(90, Math.floor(cssWidth * 0.45));
    offscreen.height = Math.max(90, Math.floor(cssHeight * 0.45));

    STATE.ramW = cssWidth * 0.74;
    STATE.ramH = Math.max(26, cssHeight * 0.17);
    STATE.ramX = (cssWidth - STATE.ramW) * 0.5;
    STATE.ramY = cssHeight * 0.56;

    // Burning at top-right corner of the RAM module.
    STATE.burnX = STATE.ramX + STATE.ramW - 5;
    STATE.burnY = STATE.ramY + 4;
  }

  function resetParticles() {
    smoke = [];
    sparks = [];

    const smokeCount = Math.max(22, Math.min(70, Math.floor((cssWidth * cssHeight) / 6500)));
    for (let i = 0; i < smokeCount; i += 1) {
      smoke.push({
        x: STATE.burnX + rand(-12, 12),
        y: STATE.burnY + rand(-8, 8),
        vx: rand(-0.28, 0.28),
        vy: rand(-1.25, -0.45),
        r: rand(3, 8),
        life: rand(0.25, 1),
        decay: rand(0.0035, 0.008),
      });
    }

    const sparkCount = 10;
    for (let i = 0; i < sparkCount; i += 1) {
      sparks.push({
        x: STATE.burnX,
        y: STATE.burnY,
        vx: rand(-0.65, 0.85),
        vy: rand(-1.1, 0.1),
        life: rand(0.15, 0.7),
        decay: rand(0.01, 0.03),
      });
    }
  }

  function drawRamModule(timeMs) {
    const t = timeMs * 0.001;
    const jitter = Math.sin(t * 2.8) * 0.8;

    const x = STATE.ramX;
    const y = STATE.ramY + jitter;
    const w = STATE.ramW;
    const h = STATE.ramH;

    // PCB body
    octx.fillStyle = 'rgba(20,20,20,0.72)';
    octx.fillRect(scaleX(x), scaleY(y), scaleX(w), scaleY(h));

    // Top trace line
    octx.strokeStyle = 'rgba(40,40,40,0.7)';
    octx.lineWidth = Math.max(1, offscreen.width * 0.004);
    octx.beginPath();
    octx.moveTo(scaleX(x + 8), scaleY(y + 8));
    octx.lineTo(scaleX(x + w - 8), scaleY(y + 8));
    octx.stroke();

    // RAM chips
    const chipW = w * 0.11;
    const chipH = h * 0.48;
    const chipY = y + h * 0.22;
    for (let i = 0; i < 6; i += 1) {
      const cx = x + w * 0.08 + i * (chipW + w * 0.03);
      octx.fillStyle = 'rgba(6,6,6,0.85)';
      octx.fillRect(scaleX(cx), scaleY(chipY), scaleX(chipW), scaleY(chipH));
    }

    // Gold pins
    const pinCount = 14;
    const pinGap = w / (pinCount + 3);
    const pinY = y + h - h * 0.12;
    for (let i = 0; i < pinCount; i += 1) {
      const px = x + pinGap * (i + 1.5);
      octx.fillStyle = 'rgba(55,55,55,0.62)';
      octx.fillRect(scaleX(px), scaleY(pinY), scaleX(pinGap * 0.48), scaleY(h * 0.17));
    }

    // Burned/charred area near the ember
    octx.fillStyle = 'rgba(8,8,8,0.95)';
    octx.beginPath();
    octx.arc(scaleX(STATE.burnX - 5), scaleY(STATE.burnY + 5 + jitter), Math.max(7, offscreen.width * 0.03), 0, Math.PI * 2);
    octx.fill();
  }

  function updateAndDrawSmoke(timeMs) {
    const pulse = 0.5 + 0.5 * Math.sin(timeMs * 0.008);

    for (const p of smoke) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.r += 0.03;

      // Curl upward + turbulent lateral motion.
      p.vx += Math.sin((timeMs * 0.0012) + p.y * 0.06) * 0.005;
      p.vy -= 0.0015;

      if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > cssWidth + 20) {
        p.x = STATE.burnX + rand(-10, 10);
        p.y = STATE.burnY + rand(-6, 6);
        p.vx = rand(-0.28, 0.28);
        p.vy = rand(-1.2, -0.42);
        p.r = rand(2.8, 6.8);
        p.life = rand(0.35, 1);
        p.decay = rand(0.0035, 0.008);
      }

      const alpha = Math.max(0, p.life * 0.22 * (0.85 + pulse * 0.3));
      octx.beginPath();
      octx.fillStyle = `rgba(14,14,14,${alpha})`;
      octx.arc(scaleX(p.x), scaleY(p.y), p.r, 0, Math.PI * 2);
      octx.fill();
    }
  }

  function updateAndDrawSparks(timeMs) {
    for (const s of sparks) {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.03;
      s.life -= s.decay;

      if (s.life <= 0 || s.y > cssHeight || s.x < 0 || s.x > cssWidth) {
        s.x = STATE.burnX + rand(-3, 3);
        s.y = STATE.burnY + rand(-3, 3);
        s.vx = rand(-0.8, 0.9);
        s.vy = rand(-1.2, 0.15);
        s.life = rand(0.15, 0.75);
        s.decay = rand(0.01, 0.03);
      }

      const a = Math.max(0, s.life * 0.8);
      octx.fillStyle = `rgba(8,8,8,${a})`;
      octx.fillRect(scaleX(s.x), scaleY(s.y), 2, 2);
    }

    // Ember core + glow halo
    const flicker = 0.65 + 0.35 * Math.sin(timeMs * 0.022);

    octx.beginPath();
    octx.fillStyle = `rgba(10,10,10,${0.95 * flicker})`;
    octx.arc(scaleX(STATE.burnX), scaleY(STATE.burnY), Math.max(2.2, offscreen.width * 0.012), 0, Math.PI * 2);
    octx.fill();

    octx.beginPath();
    octx.fillStyle = `rgba(25,25,25,${0.24 * flicker})`;
    octx.arc(scaleX(STATE.burnX), scaleY(STATE.burnY), Math.max(8, offscreen.width * 0.04), 0, Math.PI * 2);
    octx.fill();
  }

  function drawHalftoneTexture(timeMs) {
    const t = timeMs * 0.001;
    const dotGap = 9;

    octx.fillStyle = 'rgba(16,16,16,0.07)';
    for (let y = 0; y < offscreen.height; y += dotGap) {
      const offset = Math.sin((y * 0.12) + t * 1.2) * 1.4;
      for (let x = 0; x < offscreen.width; x += dotGap) {
        if (((x + y) / dotGap) % 3 === 0) {
          octx.fillRect(x + offset, y, 1, 1);
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
        const i = (y * w + x) * 4;
        const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) * (255 / 16);
        // Two-tone monochrome output.
        const v = lum > threshold ? 252 : 34;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
    }

    octx.putImageData(image, 0, 0);
  }

  function scaleX(v) {
    return v * (offscreen.width / cssWidth);
  }

  function scaleY(v) {
    return v * (offscreen.height / cssHeight);
  }

  function drawScene(timeMs) {
    // Light base to avoid crush-to-black after dithering.
    octx.fillStyle = 'rgba(255,255,255,0.93)';
    octx.fillRect(0, 0, offscreen.width, offscreen.height);

    drawRamModule(timeMs);
    updateAndDrawSmoke(timeMs);
    updateAndDrawSparks(timeMs);
    drawHalftoneTexture(timeMs);
  }

  function frame(timeMs) {
    drawScene(timeMs);
    applyOrderedDither();

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, cssWidth, cssHeight);

    // Subtle moving light band for CRT-ish look.
    const bandY = (Math.sin(timeMs * 0.0014) * 0.5 + 0.5) * (cssHeight - 30);
    const grad = ctx.createLinearGradient(0, bandY, 0, bandY + 30);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, bandY, cssWidth, 30);

    rafId = requestAnimationFrame(frame);
  }

  function renderStatic() {
    drawScene(0);
    applyOrderedDither();
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, cssWidth, cssHeight);
  }

  function start() {
    setupCanvas();
    resetParticles();

    if (prefersReducedMotion) {
      renderStatic();
      return;
    }

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function handleResize() {
    setupCanvas();
    resetParticles();
    if (prefersReducedMotion) {
      renderStatic();
    }
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
