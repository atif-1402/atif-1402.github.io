// os.js — ANOM OS: boot, window manager, apps, bash terminal
const $ = s => document.querySelector(s), esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const link = (h, t) => `<a href="${h}" target="_blank" rel="noopener">${esc(t)}</a>`;

/* ── data ─────────────────────────────────────────── */
const BIO = 'Student and self-taught developer building useful things. Started with UI/UX, QML, and Linux ricing; now diving deeper into low-level systems, hardware, and software while studying mathematics.';
const P = [
  ['omarchy-themes', 'minimal clean-ui themes', 'https://github.com/atif-1402?tab=repositories&q=theme', /^omarchy-.*-theme$/],
  ['waybar themes', 'custom waybar configs and scripts', 'https://github.com/atif-1402/minimal-waybar-themes', 'minimal-waybar-themes'],
  ['anomshell (archived)', 'quickshell for omarchy', 'https://anomshell.pages.dev/', 'anomshell'],
  ['parse', 'messy CLI output to colored formatted', 'https://github.com/atif-1402/parse', 'parse'],
  ['pocai', 'minimal ai agent for your terminal (WIP)', 'https://github.com/atif-1402/pocai', 'pocai'],
  ['anom-dots', 'personal dotfiles', 'https://github.com/atif-1402/dotfiles', 'dotfiles']];
const L = [['github', 'https://github.com/atif-1402', '@atif-1402'], ['x', 'https://x.com/anom538', '@anom538'], ['mail', 'mailto:atifameen1402@gmail.com', 'atifameen1402@gmail.com'], ['discord', 'https://discord.com/users/1432491302875828246', 'atif / anom'], ['ko-fi', 'https://ko-fi.com/anom538', 'support me']];
const S = [['HTML', 60, 'intermediate'], ['CSS', 60, 'intermediate'], ['bash', 60, 'intermediate'], ['C', 20, 'basic'], ['go', 15, 'basic'], ['rust', 4, 'just starting']];

/* ── icons (24x24 vector, crisp pixel look; games are coloured) ── */
const LT = '#d2d2d6', MD = '#76767a', DK = '#3a3a3d', BK = '#101012';
const IC = {
  term: `<rect x="2" y="3" width="20" height="18" fill="${LT}"/><rect x="2" y="3" width="20" height="3" fill="${MD}"/><rect x="4" y="7" width="16" height="12" fill="${BK}"/><path d="M6 10l3 3-3 3" stroke="${LT}" stroke-width="2" fill="none"/><rect x="11" y="16" width="6" height="2" fill="${LT}"/>`,
  about: `<path d="M5 2h10l5 5v15H5z" fill="${LT}"/><path d="M15 2v5h5z" fill="${MD}"/><rect x="8" y="11" width="9" height="2" fill="${DK}"/><rect x="8" y="15" width="9" height="2" fill="${DK}"/><rect x="8" y="19" width="5" height="1" fill="${DK}"/>`,
  proj: `<path d="M2 5h8l2 3h10v13H2z" fill="${MD}"/><rect x="2" y="10" width="20" height="11" fill="${LT}"/><rect x="2" y="10" width="20" height="2" fill="#a8a8ac"/>`,
  stack: `<path d="M8 1v5M12 1v5M16 1v5M8 18v5M12 18v5M16 18v5M1 8h5M1 12h5M1 16h5M18 8h5M18 12h5M18 16h5" stroke="${MD}" stroke-width="2"/><rect x="5" y="5" width="14" height="14" fill="${LT}"/><rect x="9" y="9" width="6" height="6" fill="${DK}"/>`,
  links: `<rect x="2" y="5" width="20" height="15" fill="${LT}"/><path d="M2 5l10 8 10-8" stroke="${DK}" stroke-width="2" fill="none"/><rect x="2" y="18" width="20" height="2" fill="${MD}"/>`,
  stats: `<rect x="3" y="3" width="18" height="18" fill="${BK}" stroke="${MD}" stroke-width="2"/><rect x="6" y="13" width="3" height="5" fill="${LT}"/><rect x="10.5" y="9" width="3" height="9" fill="${LT}"/><rect x="15" y="6" width="3" height="12" fill="${LT}"/>`,
  hell: `<path d="M3 11C3 6 7 2 12 2s9 4 9 9v4h-3v6h-3v-3h-2v3h-2v-3H9v3H6v-6H3z" fill="#d9573f"/><rect x="6" y="9" width="4" height="5" fill="${BK}"/><rect x="14" y="9" width="4" height="5" fill="${BK}"/><rect x="11" y="14" width="2" height="2" fill="${BK}"/>`,
  snake: `<rect x="1" y="1" width="22" height="22" fill="#12241a"/><path d="M4 19h11a3.5 3.5 0 000-7H9a3.5 3.5 0 010-7h8" stroke="#7fbf6a" stroke-width="3" fill="none"/><rect x="16" y="3" width="3" height="3" fill="#e8e8ea"/><rect x="19" y="15" width="3" height="3" fill="#d9534f"/>`,
  mines: `<rect x="1" y="1" width="22" height="22" fill="#2c3a55"/><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" stroke="#e0b040" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="#101012" stroke="#e0b040" stroke-width="2"/><rect x="9" y="9" width="2" height="2" fill="#fff"/>`,
  power: `<path d="M12 3v9" stroke="${LT}" stroke-width="3"/><path d="M7 6.5a8 8 0 1010 0" stroke="${LT}" stroke-width="3" fill="none"/>`
};
const icon = k => `<svg viewBox="0 0 24 24" shape-rendering="crispEdges">${IC[k]}</svg>`;

/* ── apps ─────────────────────────────────────────── */
const APPS = {
  term: { n: 'terminal', g: 'term', w: 600, h: 380, b: termApp },
  about: { n: 'about.txt', g: 'about', w: 440, h: 300, b: e => e.innerHTML = `<h2>atif-1402</h2><p class="d">aka anom · atif@anom</p><p>${BIO}</p>` },
  proj: {
    n: 'projects', g: 'proj', w: 520, h: 380, b: e => {
      e.innerHTML = '<h2>~/projects</h2>' + P.map((p, i) => `<a class="rw raise" href="${p[2]}" target="_blank" rel="noopener"><b>0${i + 1} ${p[0]}</b> <span data-st="${i}" class="d"></span> ↗<br><span class="d">${p[1]}</span></a>`).join('');
      AnomStats.load().then(o => (o.repos || []).length && P.forEach((p, i) => {
        const hit = o.repos.filter(r => p[3] instanceof RegExp ? p[3].test(r[0]) : r[0] === p[3]);
        if (hit.length) e.querySelector(`[data-st="${i}"]`).textContent = '★ ' + hit.reduce((a, r) => a + r[1], 0);
      }));
    }
  },
  stack: { n: 'stack', g: 'stack', w: 380, h: 340, b: e => e.innerHTML = '<h2>~/stack</h2>' + S.map(s => `<div>${s[0]} <span class="d">· ${s[2]}</span></div><div class="bar sunk"><i style="width:${s[1]}%"></i></div>`).join('') },
  stats: { n: 'github stats', g: 'stats', w: 560, h: 380, b: e => AnomStats.mount(e) },
  links: { n: 'contact', g: 'links', w: 400, h: 330, b: e => e.innerHTML = '<h2>~/contact</h2>' + L.map(l => `<a class="rw raise" href="${l[1]}" target="_blank" rel="noopener"><b>${l[0]}</b><br><span class="d">${l[2]}</span></a>`).join('') },
  hellgate: { n: 'HELLGATE', g: 'hell', c: '#8c3a2e', w: 680, h: 460, np: 1, b: e => e.innerHTML = '<iframe src="games/hellgate.html" title="HELLGATE"></iframe>' },
  snake: { n: 'snake', g: 'snake', c: '#4d7a3a', w: 370, h: 520, b: e => Games.snake(e) },
  mines: { n: 'minesweeper', g: 'mines', c: '#46608a', w: 340, h: 420, b: e => Games.mines(e) }
};

/* ── boot ─────────────────────────────────────────── */
const BL = [['<b>ANOM BIOS v1.0</b>  (c) 1986 anom systems', 250], ['CPU: self-taught @ infinite MHz', 120], ['Memory test: 640K ... <b>OK</b>', 450], ['', 50],
  ['<i>[    0.000]</i> Booting ANOM OS kernel 1.0', 200], ['<i>[    0.041]</i> Mounting /home/atif ... <b>ok</b>', 150], ['<i>[    0.112]</i> Loading stack: html css bash c go rust', 200],
  ['<i>[    0.190]</i> Linking github ... <b>ok</b>', 150], ['<i>[    0.230]</i> Starting window manager ... <b>ok</b>', 250], ['', 50], ['<b>Welcome to ANOM OS.</b>', 400]];
const isMobile = () => matchMedia('(max-width:700px), (pointer:coarse) and (max-width:900px)').matches;
let bootDone = false, seq;
function boot() {
  bootDone = false; $('#os').style.display = 'none'; const b = $('#boot'); b.style.display = 'block'; b.onclick = finish; let i = 0;
  b.innerHTML = '<i>press any key / tap to skip</i>\n\n';
  const step = () => { if (bootDone) return; if (i >= BL.length) return finish(); b.innerHTML += BL[i][0] + '\n'; seq = setTimeout(step, BL[i++][1]); };
  step();
}
function finish() {
  if (bootDone) return; bootDone = true; clearTimeout(seq); $('#boot').style.display = 'none'; $('#os').style.display = 'flex';
  if (!document.querySelector('.win') && !isMobile()) { openApp('about'); openApp('term'); }
}
addEventListener('keydown', () => { if (!bootDone && $('#boot').style.display !== 'none') finish(); });

/* ── window manager ───────────────────────────────── */
let z = 10; const wins = {};
function openApp(id) {
  const a = APPS[id]; if (!a) return false;
  const ri = RECENT.indexOf(id); if (ri > -1) RECENT.splice(ri, 1); RECENT.unshift(id); RECENT.length = Math.min(RECENT.length, 3);
  if (wins[id]) { wins[id].el.style.display = 'flex'; focus(id); return true; }
  const el = document.createElement('div'), n = Object.keys(wins).length;
  el.className = 'win raise'; if (a.c) el.style.setProperty('--ac', a.c); el.style.cssText = `width:${a.w}px;height:${a.h}px;left:${Math.min(240, innerWidth * .22) + n * 28}px;top:${24 + n * 28}px`;
  el.innerHTML = `<div class="tb">${icon(a.g)}<span class="t">${a.n}</span><button class="raise" data-a="min">_</button><button class="raise" data-a="max">□</button><button class="raise" data-a="x">x</button></div><div class="bd sunk${a.np ? ' nopad' : ''}"></div>`;
  $('#desk').appendChild(el); a.b(el.querySelector('.bd'));
  const t = document.createElement('button'); t.className = 'raise'; t.innerHTML = icon(a.g) + '<span>' + a.n + '</span>';
  t.onclick = () => { const w = wins[id]; if (w.el.style.display === 'none' || !w.el.classList.contains('on')) { w.el.style.display = 'flex'; focus(id); } else { w.el.style.display = 'none'; w.t.classList.remove('on'); } };
  $('#tasks').appendChild(t); wins[id] = { el, t };
  el.addEventListener('pointerdown', () => focus(id));
  el.querySelector('.tb').addEventListener('dblclick', () => el.classList.toggle('max'));
  el.querySelectorAll('.tb button').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.a; if (k === 'x') closeApp(id); else if (k === 'min') { el.style.display = 'none'; t.classList.remove('on'); } else el.classList.toggle('max'); });
  drag(el); resizer(el); focus(id); return true;
}
function resizer(el) {
  ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(d => {
    const h = document.createElement('div'); h.className = 'rz'; h.dataset.d = d; el.appendChild(h);
    h.addEventListener('pointerdown', e => {
      if (el.classList.contains('max') || e.button) return; e.preventDefault(); e.stopPropagation(); focus(winId(el)); h.setPointerCapture(e.pointerId);
      const x0 = e.clientX, y0 = e.clientY, L = el.offsetLeft, T = el.offsetTop, W = el.offsetWidth, H = el.offsetHeight;
      const mv = m => {
        const dx = m.clientX - x0, dy = m.clientY - y0; let l = L, t = T, w = W, hh = H;
        if (d.includes('e')) w = Math.max(260, W + dx);
        if (d.includes('s')) hh = Math.max(150, H + dy);
        if (d.includes('w')) { w = Math.max(260, W - dx); l = L + W - w; }
        if (d.includes('n')) { hh = Math.max(150, H - dy); t = Math.max(0, T + H - hh); hh = T + H - t; }
        Object.assign(el.style, { left: l + 'px', top: t + 'px', width: w + 'px', height: hh + 'px' });
      };
      const up = () => { h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up); };
      h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
    });
  });
}
function closeApp(id) { const w = wins[id]; if (!w) return; w.el.remove(); w.t.remove(); delete wins[id]; }
function focus(id) {
  Object.values(wins).forEach(w => { w.el.classList.remove('on'); w.t.classList.remove('on'); });
  const w = wins[id]; if (!w) return; w.el.style.zIndex = ++z; w.el.classList.add('on'); w.t.classList.add('on');
  const i = w.el.querySelector('.term input'); if (i && matchMedia('(pointer:fine)').matches) i.focus();
}
function drag(el) {
  const tb = el.querySelector('.tb');
  tb.addEventListener('pointerdown', e => {
    if (e.target.tagName === 'BUTTON' || el.classList.contains('max')) return;
    const r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, D = $('#desk').getBoundingClientRect();
    tb.setPointerCapture(e.pointerId);
    const mv = m => { el.style.left = Math.max(0, Math.min(D.width - 60, m.clientX - dx)) + 'px'; el.style.top = Math.max(0, Math.min(D.height - 24, m.clientY - dy)) + 'px'; };
    const up = () => { tb.removeEventListener('pointermove', mv); tb.removeEventListener('pointerup', up); };
    tb.addEventListener('pointermove', mv); tb.addEventListener('pointerup', up);
  });
}

/* ── desktop: icons, start menu, 3d logo, clock ───── */
const menu = $('#menu'), RECENT = [];
Object.entries(APPS).forEach(([id, a]) => {
  const d = document.createElement('div'); d.className = 'ic'; d.innerHTML = `<div class="g raise">${icon(a.g)}</div><span>${a.n}</span>`;
  d.onclick = () => { document.querySelectorAll('.ic').forEach(i => i.classList.remove('sel')); d.classList.add('sel'); if (matchMedia('(pointer:coarse)').matches) openApp(id); };
  d.dataset.app = id; d.ondblclick = () => openApp(id); $('#icons').appendChild(d);
});
function reboot() { menu.style.display = 'none'; Object.keys(wins).forEach(closeApp); boot(); }
function shutdown() {
  menu.style.display = 'none'; $('#os').style.display = 'none'; const b = $('#boot'); b.style.display = 'block';
  b.innerHTML = '<b>System halted.</b>\nIt is now safe to close this tab.\n\n<i>press any key / tap to boot</i>'; clearTimeout(seq); bootDone = true;
  const k = () => { removeEventListener('keydown', k); b.onclick = null; Object.keys(wins).forEach(closeApp); boot(); };
  setTimeout(() => addEventListener('keydown', k), 100); b.onclick = k;
}
/* start menu: banner, search, recent, apps, games, links, power */
const SEC = [['apps', ['term', 'about', 'proj', 'stack', 'stats', 'links']], ['games', ['hellgate', 'snake', 'mines']]];
function buildStart() {
  const up = Math.floor((Date.now() - T0) / 60000), n = Object.keys(wins).length;
  menu.innerHTML = `<div class="side"><span>ANOM OS</span></div><div class="main"><div class="hd"><b>atif@anom</b><span class="d">up ${up}m · ${n} window${n === 1 ? '' : 's'} open</span></div><input class="srch" placeholder="search apps..." autocomplete="off" autocapitalize="off" spellcheck="false"><div class="list"></div><div class="ft"><button class="raise" data-a="reboot">${icon('power')}reboot</button><button class="raise" data-a="off">${icon('power')}shutdown</button></div></div>`;
  const list = menu.querySelector('.list'), inp = menu.querySelector('.srch');
  const it = k => `<div class="it" data-k="${k}">${icon(APPS[k].g)}<span>${APPS[k].n}</span>${wins[k] ? '<i class="run" title="running"></i>' : ''}</div>`;
  const render = q => {
    q = q.trim().toLowerCase(); let h = '';
    if (q) { const m = Object.keys(APPS).filter(k => (k + APPS[k].n).toLowerCase().includes(q)); h = m.length ? m.map(it).join('') : '<div class="none">no match</div>'; }
    else {
      if (RECENT.length) h += '<div class="sec">recent</div>' + RECENT.map(it).join('');
      SEC.forEach(([t, ks]) => h += `<div class="sec">${t}</div>` + ks.map(it).join(''));
      h += '<div class="sec">links</div>' + L.map(l => `<div class="it" data-u="${l[1]}"><span class="lg">&gt;</span><span>${l[0]}</span></div>`).join('');
    }
    list.innerHTML = h; const f = list.querySelector('.it'); if (q && f) f.classList.add('hl');
  };
  render('');
  inp.oninput = () => render(inp.value);
  inp.onkeydown = e => { if (e.key === 'Enter') { const f = list.querySelector('.it'); f && f.click(); } else if (e.key === 'Escape') menu.style.display = 'none'; e.stopPropagation(); };
  list.onclick = e => {
    const x = e.target.closest('.it'); if (!x) return; menu.style.display = 'none';
    if (x.dataset.k) openApp(x.dataset.k); else if (x.dataset.u.startsWith('mailto')) location.href = x.dataset.u; else open(x.dataset.u, '_blank', 'noopener');
  };
  menu.querySelector('.ft').onclick = e => { const b = e.target.closest('button'); if (!b) return; b.dataset.a === 'off' ? shutdown() : reboot(); };
  return inp;
}
$('#start').onclick = e => {
  e.stopPropagation();
  if (menu.style.display === 'flex') { menu.style.display = 'none'; return; }
  const inp = buildStart(); menu.style.display = 'flex'; if (!isMobile()) inp.focus();
};
document.addEventListener('pointerdown', e => { if (!e.target.closest('#menu,#start')) menu.style.display = 'none'; if (!e.target.closest('.ic')) document.querySelectorAll('.ic').forEach(i => i.classList.remove('sel')); });
['term', 'stats', 'hellgate'].forEach(id => { const b = document.createElement('button'); b.className = 'raise ql'; b.title = APPS[id].n; b.innerHTML = icon(APPS[id].g); b.onclick = () => openApp(id); $('#quick').appendChild(b); });
const T0 = Date.now();
const tick = () => { const d = new Date(); $('#clk').innerHTML = '<b>' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</b><span>' + d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) + '</span>'; $('#up').textContent = 'up ' + Math.floor((Date.now() - T0) / 60000) + 'm'; };
tick(); setInterval(tick, 1000);
AnomStats.load().then(o => { if (o.days) { $('#gh').textContent = 'gh ' + o.streak + 'd'; $('#gh').title = o.total + ' contributions in the last year · streak ' + o.streak + 'd'; } else $('#gh').textContent = 'gh --'; });
$('#gh').onclick = () => openApp('stats');
// 3d rotating logo: stacked layers give it depth
for (let i = 0; i < 16; i++) {
  const im = new Image(); im.src = 'assets/logo.png'; im.alt = ''; im.draggable = false;
  im.style.transform = `translateZ(${(i - 8) * 3}px)`; im.style.filter = `brightness(${0.5 + i / 15 * 0.5})`; $('#logo').appendChild(im);
}

/* ── terminal (bash) ──────────────────────────────── */
function termApp(e) {
  e.classList.add('term'); e.innerHTML = '<div class="o"></div><div class="l"><span class="p"></span><input autocomplete="off" autocapitalize="off" spellcheck="false"></div>';
  const o = e.querySelector('.o'), inp = e.querySelector('input'), ps = e.querySelector('.p'), H = []; let hi = 0;
  const prompt = () => ps.textContent = 'atif@anom:~$';
  const out = h => { o.innerHTML += h + '\n'; e.scrollTop = e.scrollHeight; };
  const bar = n => '#'.repeat(Math.round(n / 10)) + '.'.repeat(10 - Math.round(n / 10));
  const GAMES = { hellgate: 'hellgate', snake: 'snake', minesweeper: 'mines', mines: 'mines' };
  const C = {
    help: () => out('GNU bash-ish, ANOM OS 1.0. built-ins:\n  about stack projects links stats neofetch\n  open &lt;app&gt;   play &lt;game&gt;\n  whoami date echo uname history clear reboot exit\napps:  ' + Object.keys(APPS).join(' ') + '\ngames: hellgate snake minesweeper'),
    about: () => out(esc(BIO)), stack: () => out(S.map(s => s[0].padEnd(6) + '[' + bar(s[1]) + '] ' + s[2]).join('\n')),
    projects: () => out(P.map((p, i) => `0${i + 1} ${p[0]} - ${esc(p[1])}\n   ${link(p[2], p[2])}`).join('\n')),
    links: () => out(L.map(l => l[0].padEnd(8) + link(l[1], l[2])).join('\n')),
    stats: () => { out('fetching github...'); AnomStats.load().then(o => out(esc(AnomStats.text(o)))); },
    open: a => { if (!openApp(a[0])) out(`bash: open: ${esc(a[0] || '')}: unknown app. try: ${Object.keys(APPS).join(' ')}`); },
    play: a => { const g = GAMES[a[0]]; g ? openApp(g) : out('usage: play hellgate|snake|minesweeper'); },
    whoami: () => out('atif'), date: () => out(new Date().toString()), echo: a => out(esc(a.join(' '))),
    uname: () => out('ANOM OS 1.0 anom-web x86_js'), history: () => out(H.map((h, i) => String(i + 1).padStart(4) + '  ' + esc(h)).join('\n')),
    clear: () => o.innerHTML = '', reboot: () => reboot(), exit: () => closeApp('term'),
    sudo: () => out('atif is not in the sudoers file. This incident will be reported.'),
    neofetch: () => out(`<span class="p">atif@anom</span>\n----------\nOS: ANOM OS 1.0\nHost: your browser\nShell: bash\nStack: html css bash (+ c go rust, learning)\nFocus: kernels, file systems, low-level\nWM: anom-wm (gray edition)\nUptime: ${Math.floor(performance.now() / 60000)} min`)
  };
  out('ANOM OS 1.0 - GNU bash-style shell\ntype <span class="p">help</span> for commands\n'); prompt();
  inp.addEventListener('keydown', k => {
    if (k.key === 'Enter') {
      const v = inp.value.trim(); inp.value = ''; out(`<span class="p">${ps.textContent}</span> ${esc(v)}`);
      if (v) { H.push(v); hi = H.length; const [c, ...a] = v.split(/\s+/); C[c] ? C[c](a) : out(`bash: ${esc(c)}: command not found`); }
    } else if (k.key === 'ArrowUp') { if (hi > 0) inp.value = H[--hi]; k.preventDefault(); }
    else if (k.key === 'ArrowDown') inp.value = hi < H.length - 1 ? H[++hi] : (hi = H.length, '');
    else if (k.key === 'l' && k.ctrlKey) { k.preventDefault(); o.innerHTML = ''; }
    else if (k.key === 'Tab') { k.preventDefault(); const m = Object.keys(C).filter(c => c.startsWith(inp.value)); if (m.length === 1) inp.value = m[0] + ' '; }
  });
  e.onclick = () => { if (!getSelection().toString()) inp.focus(); };
}

/* ── custom right-click menu (long-press on touch) ── */
const cm = document.createElement('div'); cm.id = 'cm'; cm.className = 'raise'; document.body.appendChild(cm);
const SRC = 'https://github.com/atif-1402/atif-1402.github.io';
let lastCM = 0, cmX = 0, cmY = 0;
function showCM(x, y, items) {
  cmX = x; cmY = y; cm.innerHTML = ''; items.forEach(it => {
    if (it === '-') return cm.insertAdjacentHTML('beforeend', '<hr>');
    const d = document.createElement('div'); d.innerHTML = (it.i ? icon(it.i) : '<span style="width:18px;flex:none"></span>') + '<span>' + it.t + '</span>' + (it.sub ? '<kbd>&gt;</kbd>' : it.k ? `<kbd>${it.k}</kbd>` : '');
    if (it.off) d.className = 'dis';
    d.onclick = () => { if (it.sub) return showCM(x, y, [{ t: '< back', f: () => showCM(x, y, items), keep: 1 }, '-', ...it.sub]); if (!it.keep) cm.style.display = 'none'; it.f && it.f(); };
    cm.appendChild(d);
  });
  cm.style.display = 'block'; const r = cm.getBoundingClientRect();
  cm.style.left = Math.max(0, Math.min(x, innerWidth - r.width - 4)) + 'px'; cm.style.top = Math.max(0, Math.min(y, innerHeight - r.height - 4)) + 'px';
}
const winId = el => Object.keys(wins).find(k => wins[k].el === el);
const shown = () => Object.keys(wins).filter(k => wins[k].el.style.display !== 'none');
const minAll = () => Object.keys(wins).forEach(k => { wins[k].el.style.display = 'none'; wins[k].t.classList.remove('on'); });
const cascade = () => Object.keys(wins).forEach((k, n) => { const e = wins[k].el; e.classList.remove('max'); e.style.display = 'flex'; e.style.left = Math.min(240, innerWidth * .22) + n * 28 + 'px'; e.style.top = 24 + n * 28 + 'px'; });
const fsToggle = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
const copyTxt = t => navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {});
const goTo = u => open(u, '_blank', 'noopener');
const A = k => ({ t: APPS[k].n, i: APPS[k].g, f: () => openApp(k) });
function ctx(t, x, y) {
  const w = t.closest('.win'), id = w && winId(w), ic = t.closest('.ic'), tk = t.closest('#tasks button'), n = Object.keys(wins).length;
  const winSet = [{ t: 'show desktop', off: !shown().length, f: minAll }, { t: 'cascade windows', off: !n, f: cascade }, { t: 'close all windows', off: !n, f: () => Object.keys(wins).forEach(closeApp) }];
  let items;
  if (ic) { const k = ic.dataset.app; items = [{ t: 'open', i: APPS[k].g, f: () => openApp(k) }, { t: wins[k] ? 'close' : 'not running', off: !wins[k], f: () => closeApp(k) }]; }
  else if (tk) { const k = Object.keys(wins).find(k => wins[k].t === tk); items = [{ t: 'show / focus', f: () => { wins[k].el.style.display = 'flex'; focus(k); } }, { t: 'minimize', f: () => { wins[k].el.style.display = 'none'; tk.classList.remove('on'); } }, '-', { t: 'close', f: () => closeApp(k) }]; }
  else if (t.closest('#tray')) items = [{ t: 'github stats', i: 'stats', f: () => openApp('stats') }, { t: 'copy time', f: () => copyTxt(new Date().toString()) }, '-', ...winSet];
  else if (t.closest('#bar')) items = [...winSet, '-', { t: 'reboot', i: 'power', f: reboot }];
  else if (w && t.closest('.tb')) items = [{ t: 'minimize', f: () => { w.style.display = 'none'; wins[id].t.classList.remove('on'); } }, { t: w.classList.contains('max') ? 'restore' : 'maximize', f: () => w.classList.toggle('max') }, { t: 'bring to front', f: () => focus(id) }, '-', { t: 'close others', off: n < 2, f: () => Object.keys(wins).forEach(k => k !== id && closeApp(k)) }, { t: 'close', k: 'x', f: () => closeApp(id) }];
  else if (w && w.querySelector('.term')) {
    const sel = getSelection().toString(), inp = w.querySelector('input');
    items = [{ t: 'copy', off: !sel, f: () => copyTxt(sel) }, { t: 'paste', f: async () => { try { inp.value += await navigator.clipboard.readText(); inp.focus(); } catch {} } }, '-', { t: 'clear', k: 'ctrl+l', f: () => w.querySelector('.o').innerHTML = '' }, { t: 'close terminal', f: () => closeApp(id) }];
  } else if (w) items = [{ t: 'bring to front', f: () => focus(id) }, { t: 'close others', off: n < 2, f: () => Object.keys(wins).forEach(k => k !== id && closeApp(k)) }, { t: 'close window', f: () => closeApp(id) }];
  else items = [
    { t: 'apps', sub: ['term', 'about', 'proj', 'stack', 'stats', 'links'].map(A) },
    { t: 'games', sub: ['hellgate', 'snake', 'mines'].map(A) },
    { t: 'windows', sub: winSet },
    { t: 'view', sub: [{ t: document.fullscreenElement ? 'exit fullscreen' : 'fullscreen', f: fsToggle }, { t: 'toggle logo spin', f: () => { const l = $('#logo'); l.style.animationPlayState = l.style.animationPlayState === 'paused' ? 'running' : 'paused'; } }, { t: 'refresh', f: () => location.reload() }] },
    { t: 'links', sub: [{ t: 'github', f: () => goTo(L[0][1]) }, { t: 'x', f: () => goTo(L[1][1]) }, { t: 'email me', f: () => location.href = L[2][1] }, { t: 'copy site link', f: () => copyTxt(location.href) }, { t: 'view source', f: () => goTo(SRC) }] },
    '-', { t: 'reboot', i: 'power', f: reboot }];
  showCM(x, y, items);
}
document.addEventListener('contextmenu', e => {
  if (bootDone === false || e.target.closest('.mg,iframe,#cm')) return; e.preventDefault();
  if (Date.now() - lastCM < 1200) return; lastCM = Date.now(); ctx(e.target, e.clientX, e.clientY);
});
// long-press = right click on touch devices
let lp, sx, sy;
document.addEventListener('pointerdown', e => {
  clearTimeout(lp); if (e.pointerType !== 'touch' || bootDone === false || e.target.closest('#cm,input,iframe,.mg,canvas,.tb button')) return;
  sx = e.clientX; sy = e.clientY; const t = e.target;
  lp = setTimeout(() => { lastCM = Date.now(); ctx(t, sx, sy); navigator.vibrate && navigator.vibrate(12); }, 550);
}, true);
document.addEventListener('pointermove', e => { if (lp && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) clearTimeout(lp); }, true);
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, () => clearTimeout(lp), true));
document.addEventListener('click', e => { if (Date.now() - lastCM < 700 && !e.target.closest('#cm')) { e.preventDefault(); e.stopPropagation(); } }, true);
document.addEventListener('pointerdown', e => { if (!e.target.closest('#cm')) cm.style.display = 'none'; });
addEventListener('keydown', e => { if (e.key === 'Escape') { cm.style.display = 'none'; menu.style.display = 'none'; } }); addEventListener('blur', () => cm.style.display = 'none');

/* ── custom cursor (JS-drawn, browser independent) ── */
if (matchMedia('(pointer:fine)').matches && !isMobile()) {
  const cu = $('#cur'), im = cu.querySelectorAll('img'), HS = [[1, 1], [9, 1], [7, 16], [14, 14], [14, 14], [14, 14], [14, 14]], RZ = { e: 3, w: 3, n: 4, s: 4, nw: 5, se: 5, ne: 6, sw: 6 }, H = 'a,button,.ic,#menu .it,#menu button,#cm div,.rw,.tb button,input[type=button]', T = '.term,input';
  document.documentElement.classList.add('fc'); let cur = -1;
  const set = k => { if (k === cur) return; cur = k; im.forEach((x, i) => { x.style.display = i === k ? 'block' : 'none'; x.style.left = -HS[i][0] + 'px'; x.style.top = -HS[i][1] + 'px'; }); };
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const t = e.target; if (t.tagName === 'IFRAME') { cu.style.display = 'none'; return; }
    cu.style.display = 'block'; cu.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    set(t.classList && t.classList.contains('rz') ? RZ[t.dataset.d] : t.closest && t.closest(H) ? 1 : t.closest && t.closest(T) ? 2 : 0);
  }, true);
  // entering an iframe (HELLGATE): parent gets no more moves, so hide the JS cursor or it stays stuck on the edge
  document.addEventListener('pointerover', e => { if (e.target.tagName === 'IFRAME') cu.style.display = 'none'; }, true);
  document.addEventListener('pointerout', e => { if (e.target.tagName === 'IFRAME' && e.pointerType !== 'touch') { cu.style.display = 'block'; cu.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; } }, true);
  document.addEventListener('mouseleave', () => cu.style.display = 'none');
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') cu.style.transform += ' scale(.9)'; }, true);
  document.addEventListener('pointerup', () => cu.style.transform = cu.style.transform.replace(' scale(.9)', ''), true);
  // dragging a native scrollbar: browsers stop sending mouse events to the page, so the drawn cursor would freeze.
  // while the thumb is held we follow the scroll position instead (cursor keeps its grab offset on the thumb).
  const BTN = 18; let sbd = null;
  const geo = (t, e) => {
    if (!t || t.nodeType !== 1) return null; const r = t.getBoundingClientRect();
    const vw = t.offsetWidth - t.clientWidth - t.clientLeft * 2, vh = t.offsetHeight - t.clientHeight - t.clientTop * 2;
    if (vw > 1 && e.clientX > r.right - t.clientLeft - vw) {
      const track = t.clientHeight - 2 * BTN, thumb = Math.max(track * t.clientHeight / t.scrollHeight, 20), range = t.scrollHeight - t.clientHeight, st = r.top + t.clientTop + BTN, top = st + (range ? t.scrollTop / range : 0) * (track - thumb);
      return { el: t, v: 1, st, track, thumb, range, s0: t.scrollTop, on: e.clientY >= top && e.clientY <= top + thumb };
    }
    if (vh > 1 && e.clientY > r.bottom - t.clientTop - vh) {
      const track = t.clientWidth - 2 * BTN, thumb = Math.max(track * t.clientWidth / t.scrollWidth, 20), range = t.scrollWidth - t.clientWidth, st = r.left + t.clientLeft + BTN, left = st + (range ? t.scrollLeft / range : 0) * (track - thumb);
      return { el: t, v: 0, st, track, thumb, range, s0: t.scrollLeft, on: e.clientX >= left && e.clientX <= left + thumb };
    }
    return null;
  };
  document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || e.button) return; const g = geo(e.target, e); sbd = g && Object.assign(g, { x0: e.clientX, y0: e.clientY }); if (sbd) { cu.style.display = 'block'; set(0); } }, true);
  document.addEventListener('scroll', ev => {
    if (!sbd || !sbd.on || ev.target !== sbd.el || sbd.range <= 0 || sbd.track <= sbd.thumb) return;
    const k = (sbd.track - sbd.thumb) / sbd.range, d = ((sbd.v ? sbd.el.scrollTop : sbd.el.scrollLeft) - sbd.s0) * k;
    const x = sbd.v ? sbd.x0 : Math.max(sbd.st, Math.min(sbd.st + sbd.track, sbd.x0 + d)), y = sbd.v ? Math.max(sbd.st, Math.min(sbd.st + sbd.track, sbd.y0 + d)) : sbd.y0;
    cu.style.transform = `translate(${x}px,${y}px)`;
  }, true);
  const unsb = () => { sbd = null; };
  ['pointerup', 'pointermove', 'pointercancel', 'mouseup', 'dragend'].forEach(ev => addEventListener(ev, unsb, true)); addEventListener('blur', unsb);
  set(0);
}
boot();
