// games.js — snake + minesweeper for ANOM OS
window.Games = {
  snake(el) {
    const N = 20, C = 16;
    el.innerHTML = '<div class="gb"><button class="raise" data-r>restart</button><span data-s>score 0</span></div><canvas class="sn sunk" width="320" height="320"></canvas><div class="pad"><span></span><button class="raise" data-d="u">^</button><span></span><button class="raise" data-d="l">&lt;</button><button class="raise" data-d="d">v</button><button class="raise" data-d="r">&gt;</button></div>';
    const cv = el.querySelector('canvas'), cx = cv.getContext('2d'), sc = el.querySelector('[data-s]');
    const V = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
    let s, dir, nd, f, score, dead, iv;
    const rf = () => { do f = [Math.random() * N | 0, Math.random() * N | 0]; while (s.some(p => p[0] === f[0] && p[1] === f[1])); };
    const reset = () => { s = [[10, 10], [9, 10], [8, 10]]; dir = nd = 'r'; score = 0; dead = false; rf(); sc.textContent = 'score 0'; clearInterval(iv); iv = setInterval(tick, 110); draw(); };
    const turn = d => { const a = V[d], b = V[dir]; if (a[0] + b[0] || a[1] + b[1]) nd = d; };
    function tick() {
      if (!el.isConnected) return clearInterval(iv);
      if (dead) return;
      dir = nd; const h = [s[0][0] + V[dir][0], s[0][1] + V[dir][1]];
      if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || s.some(p => p[0] === h[0] && p[1] === h[1])) { dead = true; sc.textContent = 'game over · score ' + score; return draw(); }
      s.unshift(h);
      if (h[0] === f[0] && h[1] === f[1]) { score++; sc.textContent = 'score ' + score; rf(); } else s.pop();
      draw();
    }
    function draw() {
      cx.fillStyle = '#12241a'; cx.fillRect(0, 0, 320, 320);
      cx.fillStyle = '#d9534f'; cx.fillRect(f[0] * C + 3, f[1] * C + 3, C - 6, C - 6);
      s.forEach((p, i) => { cx.fillStyle = i ? '#5f9a4a' : '#b6e08a'; cx.fillRect(p[0] * C + 1, p[1] * C + 1, C - 2, C - 2); });
    }
    const key = e => {
      if (!el.isConnected) return removeEventListener('keydown', key);
      if (!el.closest('.win').classList.contains('on')) return;
      const m = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r' }[e.key];
      if (m) { turn(m); e.preventDefault(); }
    };
    addEventListener('keydown', key);
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => turn(b.dataset.d));
    el.querySelector('[data-r]').onclick = reset;
    let tx, ty;
    cv.addEventListener('pointerdown', e => { tx = e.clientX; ty = e.clientY; });
    cv.addEventListener('pointerup', e => { const x = e.clientX - tx, y = e.clientY - ty; if (Math.max(Math.abs(x), Math.abs(y)) > 20) turn(Math.abs(x) > Math.abs(y) ? (x > 0 ? 'r' : 'l') : (y > 0 ? 'd' : 'u')); });
    reset();
  },

  mines(el) {
    const N = 9, M = 10;
    el.innerHTML = '<div class="gb"><button class="raise" data-r>reset</button><button class="raise" data-f>flag: off</button><span data-m></span></div><div class="mg"></div>';
    const grid = el.querySelector('.mg'), msg = el.querySelector('[data-m]'), fb = el.querySelector('[data-f]');
    let c, over, first, flag = false;
    const nb = (i, f) => { const x = i % N, y = i / N | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const a = x + dx, b = y + dy; if ((dx || dy) && a >= 0 && b >= 0 && a < N && b < N) f(b * N + a); } };
    function reset() {
      c = Array.from({ length: N * N }, () => ({ m: 0, o: 0, f: 0, n: 0 })); over = false; first = true; msg.textContent = M + ' mines';
      grid.innerHTML = ''; c.forEach((_, i) => { const b = document.createElement('button'); b.className = 'raise'; b.onclick = () => click(i); b.oncontextmenu = e => { e.preventDefault(); tog(i); }; grid.appendChild(b); });
    }
    function seed(safe) {
      let k = 0; while (k < M) { const i = Math.random() * N * N | 0; if (i !== safe && !c[i].m) { c[i].m = 1; k++; } }
      c.forEach((x, i) => nb(i, j => x.n += c[j].m));
    }
    function paint() {
      [...grid.children].forEach((b, i) => { const x = c[i]; b.className = x.o ? 'o' : 'raise'; b.textContent = x.o ? (x.m ? '*' : x.n || '') : x.f ? '!' : ''; b.style.color = x.o ? (x.m ? '#d9534f' : ['', '#6a8fd8', '#6aa84f', '#d9534f', '#a07ad8', '#c08a4a', '#4ab0b0', '#ddd', '#999'][x.n]) : x.f ? '#d9534f' : ''; });
      if (!over && c.every(x => x.m || x.o)) { over = true; msg.textContent = 'cleared! you win'; }
    }
    function open(i) { const x = c[i]; if (x.o || x.f) return; x.o = 1; if (!x.n && !x.m) nb(i, open); }
    function click(i) {
      if (over) return; if (flag) return tog(i);
      if (first) { seed(i); first = false; }
      const x = c[i]; if (x.f) return;
      if (x.m) { over = true; c.forEach(y => { if (y.m) y.o = 1; }); msg.textContent = 'boom. game over'; } else open(i);
      paint();
    }
    function tog(i) { if (over || c[i].o) return; c[i].f ^= 1; paint(); }
    el.querySelector('[data-r]').onclick = reset;
    fb.onclick = () => { flag = !flag; fb.textContent = 'flag: ' + (flag ? 'on' : 'off'); };
    reset();
  }
};
