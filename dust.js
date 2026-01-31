(() => {
  // disable on mobile
  if (window.innerWidth < 768) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let w, h, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  let scanY = 0;

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* ---- moving scanline (kept) ---- */
    scanY += 0.35;
    if (scanY > h) scanY = 10;

    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, scanY, w, 2);

    /* ---- dense horizontal scanlines (FIXED) ---- */
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    for (let y = 0; y < h; y += 20) {     // 👈 denser
      ctx.fillRect(0, y, w, 1);          // 👈 thinner
    }

    // ❌ glitch code REMOVED completely

    requestAnimationFrame(draw);
  }

  draw();
})();
