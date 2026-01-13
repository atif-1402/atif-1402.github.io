const canvas = document.getElementById("dust");
const ctx = canvas.getContext("2d");

const glyph = "+";
const spacing = 56;
const fontSize = 16;
const maxInfluence = 180;
const maxRotation = Math.PI * 0.6;

let mouse = { x: -9999, y: -9999 };
let width = 0;
let height = 0;
let dpr = window.devicePixelRatio || 1;

/* ---------- Offscreen glyph ---------- */
const glyphCanvas = document.createElement("canvas");
const gctx = glyphCanvas.getContext("2d");

gctx.font = `${fontSize}px JetBrainsMonoNerd`;
const metrics = gctx.measureText(glyph);
const gw = Math.ceil(metrics.width) + 4;
const gh = fontSize + 4;

glyphCanvas.width = gw;
glyphCanvas.height = gh;

gctx.font = `${fontSize}px JetBrainsMonoNerd`;
gctx.fillStyle = "rgba(122,162,247,0.14)";
gctx.textAlign = "center";
gctx.textBaseline = "middle";
gctx.fillText(glyph, gw / 2, gh / 2);

/* ---------- Resize ---------- */
function resize() {
  dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

/* ---------- Mouse ---------- */
window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = mouse.y = -9999;
});

/* ---------- Draw ---------- */
function draw() {
  ctx.clearRect(0, 0, width, height);

  for (let y = spacing / 2; y <= height; y += spacing) {
    for (let x = spacing / 2; x <= width; x += spacing) {

      const dx = mouse.x - x;
      const dy = mouse.y - y;
      const dist = Math.hypot(dx, dy);

      const influence = Math.max(0, 1 - dist / maxInfluence);
      const eased = Math.sin(influence * Math.PI);
      const angle = eased * maxRotation;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.drawImage(glyphCanvas, -gw / 2, -gh / 2);
      ctx.restore();
    }
  }

  requestAnimationFrame(draw);
}

draw();
