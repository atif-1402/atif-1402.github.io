// pxam.js — atif@anom

// ── cursor ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const prompt = document.querySelector('.prompt');
  if (prompt && !prompt.querySelector('.cursor')) {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    prompt.appendChild(cursor);
  }
});

// ── triangle wipe on project hover ───────────────────────
document.addEventListener('DOMContentLoaded', () => {

  const style  = getComputedStyle(document.documentElement);
  const BG     = style.getPropertyValue('--bg').trim()     || '#e7e2cf';
  const ACCENT = style.getPropertyValue('--accent').trim() || '#5a5542';

  function hexRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function blend(a, b, t) {
    return [
      Math.round(a[0] + (b[0]-a[0]) * t),
      Math.round(a[1] + (b[1]-a[1]) * t),
      Math.round(a[2] + (b[2]-a[2]) * t),
    ];
  }
  function rgba(rgb, a) { return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`; }
  function easeOut(t)   { return 1 - Math.pow(1 - t, 3); }

  const bgRgb  = hexRgb(BG);
  const accRgb = hexRgb(ACCENT);

  const TRI_W   = 75;
  const STAGGER = 35;
  const SHADE   = 0.15;
  const LERP    = 0.35;

  function setupProject(proj) {
    proj.style.position = 'relative';
    proj.style.overflow = 'hidden';

    const canvas = document.createElement('canvas');
    canvas.classList.add('tri-canvas');
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
    `;
    proj.appendChild(canvas);

    let tris      = [];
    let timers    = [];
    let rafId     = null;
    let fadeTimer = null;

    function buildTris() {
      const W     = canvas.width;
      const H     = canvas.height;
      const step  = TRI_W / 2;
      const count = Math.ceil(W / step) + 4;
      tris = [];
      for (let i = 0; i < count; i++) {
        tris.push({
          x:      i * step - TRI_W,
          up:     i % 2 === 0,
          fill:   rgba(blend(bgRgb, accRgb, SHADE), 1),
          angle:  0,
          target: 0,
        });
      }
    }

    function resize() {
      canvas.width  = proj.offsetWidth;
      canvas.height = proj.offsetHeight;
      buildTris();
    }
    resize();
    window.addEventListener('resize', resize);

    function drawFrame() {
      const W   = canvas.width;
      const H   = canvas.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      let stillMoving = false;

      tris.forEach(tri => {
        tri.angle += (tri.target - tri.angle) * LERP;
        if (Math.abs(tri.target - tri.angle) > 0.002) stillMoving = true;
        else tri.angle = tri.target;

        if (tri.angle < 0.005) return;

        const p  = easeOut(tri.angle);
        const x  = tri.x;
        const tw = TRI_W;

        ctx.beginPath();
        if (tri.up) {
          ctx.moveTo(x,        H);
          ctx.lineTo(x + tw,   H);
          ctx.lineTo(x + tw/2, H - H * p);
        } else {
          ctx.moveTo(x,        0);
          ctx.lineTo(x + tw,   0);
          ctx.lineTo(x + tw/2, H * p);
        }
        ctx.closePath();
        ctx.fillStyle = tri.fill;
        ctx.fill();
      });

      rafId = null;
      if (stillMoving) rafId = requestAnimationFrame(drawFrame);
    }

    function resetAll() {
      // stop animation
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      // reset all triangle angles to 0 instantly
      tris.forEach(tri => { tri.angle = 0; tri.target = 0; });
      // clear canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    proj.addEventListener('mouseenter', () => {
      // clear any pending fade timer
      if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
      // cancel timers from previous hover
      timers.forEach(clearTimeout);
      timers = [];
      // reset to 0 so it always starts fresh
      resetAll();
      // show canvas
      canvas.style.transition = '';
      canvas.style.opacity    = '1';
      // trigger triangles left to right
      tris.forEach((tri, i) => {
        timers.push(setTimeout(() => {
          tri.target = 1;
          if (!rafId) rafId = requestAnimationFrame(drawFrame);
        }, i * STAGGER));
      });
    });

    proj.addEventListener('mouseleave', () => {
      // stop stagger timers
      timers.forEach(clearTimeout);
      timers = [];
      // stop draw loop
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      // fade canvas out
      canvas.style.transition = 'opacity 0.4s ease';
      canvas.style.opacity    = '0';
      // after fade finishes, clear canvas and reset angles
      fadeTimer = setTimeout(() => {
        resetAll();
        canvas.style.transition = '';
        fadeTimer = null;
      }, 420);
    });
  }

  document.querySelectorAll('.project').forEach(setupProject);
});