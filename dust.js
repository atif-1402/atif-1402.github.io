if (window.innerWidth < 768) {
  canvas.remove();
  throw new Error("dust disabled on mobile");
}

const canvas = document.getElementById("dust");
const ctx = canvas.getContext("2d");

let w, h;
let particles = [];
const COUNT = 250;        // keep low
const RADIUS = 70;        // mouse influence
const FORCE = 0.35;        // repulsion strength

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Particle {
  constructor() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.ox = this.x;
    this.oy = this.y;
    this.vx = 0;
    this.vy = 0;
  }

  update(mx, my) {
    const dx = this.x - mx;
    const dy = this.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS) {
      const force = (RADIUS - dist) / RADIUS;
      this.vx += (dx / dist) * force * FORCE;
      this.vy += (dy / dist) * force * FORCE;
    }

    // return to origin slowly
    this.vx += (this.ox - this.x) * 0.01;
    this.vy += (this.oy - this.y) * 0.01;

    this.vx *= 0.92;
    this.vy *= 0.92;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(this.x, this.y, 1, 1);
  }
}

// init particles
for (let i = 0; i < COUNT; i++) {
  particles.push(new Particle());
}

let mouse = { x: -9999, y: -9999 };

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function loop() {
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.update(mouse.x, mouse.y);
    p.draw();
  }

  requestAnimationFrame(loop);
}

loop();
