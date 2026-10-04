// pxam.js — atif@anom
(() => {
  const USER = 'atif-1402';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  };

  // editor-style mode: 'normal' | 'insert' | 'error'
  let mode = 'normal';
  // text nodes that error mode is corrupting right now -> their real text
  const glitchStore = new WeakMap();
  const origOf = node => (glitchStore.has(node) ? glitchStore.get(node).orig : node.nodeValue);

  document.addEventListener('DOMContentLoaded', () => {
    ensureCursor();          // every page
    initWipe();              // triangle wipe on .project hover (every page)
    if (document.body.classList.contains('home')) {
      initClock();
      initBoot();
      initModes();
      initStars();
      initStats();
    }
  });

  // ── cursor ─────────────────────────────────────────────
  function ensureCursor() {
    const prompt = $('.prompt');
    if (prompt && !$('.cursor', prompt)) {
      const c = document.createElement('span');
      c.className = 'cursor';
      prompt.appendChild(c);
    }
  }

  // ── live UTC clock ─────────────────────────────────────
  function initClock() {
    const els = $$('.js-clock');
    if (!els.length) return;
    const tick = () => {
      const t = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
      els.forEach(e => { e.textContent = t; });
    };
    tick();
    setInterval(tick, 1000);
  }

  // ── reveal the page line by line (any key or click skips) ──
  function initBoot() {
    const items = $$('[data-boot]');
    const reveal = () => items.forEach(e => e.classList.add('on'));
    if (reduceMotion || store.get('booted')) { reveal(); return; }

    let k = 0, timer = null, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reveal();
      store.set('booted', '1');
      removeEventListener('keydown', finish);
      removeEventListener('pointerdown', finish);
    };
    addEventListener('keydown', finish);
    addEventListener('pointerdown', finish);

    const next = () => {
      if (finished) return;
      if (k < items.length) { items[k++].classList.add('on'); timer = setTimeout(next, 70); }
      else finish();
    };
    timer = setTimeout(next, 200);
  }

  // ── modes: NORMAL / INSERT / ERROR ─────────────────────
  //   i = insert   esc = back to normal   ctrl+x = error (no way out: refresh the page)
  //   normal + error: j/k/h/l scroll the page, gg / G jump to top / bottom
  //   insert: every key types (hjkl included); nothing is saved, refresh resets it
  function initModes() {
    const body   = document.body;
    const bar    = $('.statusbar');
    const label  = bar && $('.mode', bar);
    const pathEl = bar && $('.path', bar);
    const keysEl = bar && $('.keys', bar);
    const BASE_PATH = pathEl ? pathEl.textContent : '';
    const HINT = { normal: 'j/k scroll · i insert · ctrl+x error', insert: 'esc normal · ctrl+x error', error: '' };
    const rnd = n => Math.floor(Math.random() * n);
    let dirty = false, mx = -1, my = -1;

    function paint() {
      body.dataset.mode = mode;
      if (label) label.textContent = mode.toUpperCase();
      if (pathEl) pathEl.textContent = BASE_PATH + (dirty ? ' [+]' : '') + (mode === 'error' ? ' [!]' : '');
      if (keysEl && mode !== 'error') keysEl.textContent = HINT[mode];
    }

    function setMode(next) {
      if (next === mode) return;
      if (mode === 'insert') stopEdit();
      mode = next;
      if (next === 'insert') startEdit();
      if (next === 'error')  startError();
      paint();
    }

    // ── insert: the text on the page becomes editable ──
    const EDITABLE = '.lnk, .name, .bio, .section-head, .chip, .proj-name, .proj-desc, .footer span, .rows .k';
    let editing = [];

    function caretToEnd(el) {
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
    function startEdit() {
      $$('.project').forEach(p => { if (p.wipeOut) p.wipeOut(); });
      editing = $$(EDITABLE);
      editing.forEach(el => {
        el.setAttribute('contenteditable', 'plaintext-only');
        if (!el.isContentEditable) el.setAttribute('contenteditable', 'true');   // browsers without plaintext-only
        el.setAttribute('spellcheck', 'false');
        $$('p', el).forEach(p => p.setAttribute('contenteditable', 'false'));    // keep the chip icons intact
      });
      // the caret starts under the mouse, like vim's cursor (falls back to the name)
      const hit = (mx >= 0 && document.elementFromPoint) ? document.elementFromPoint(mx, my) : null;
      const target = (hit && hit.closest(EDITABLE)) || $('.name');
      if (target) { target.focus(); caretToEnd(target); }
    }
    function stopEdit() {
      editing.forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('spellcheck');
        $$('p', el).forEach(p => p.removeAttribute('contenteditable'));
      });
      editing = [];
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      const s = getSelection();
      if (s) s.removeAllRanges();
    }

    // ── error: random ascii keeps popping into the text, and keeps changing, until you refresh ──
    const ASCII = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    const randChar = () => ASCII[rnd(ASCII.length)];
    const PANIC = [
      'Segmentation fault (core dumped)',
      'BUG: unable to handle page fault at 0xdeadbeef',
      'EXT4-fs error: bad block bitmap checksum',
      'Out of memory: killed process 1402 (atif)',
      'kernel panic - not syncing: VFS: unable to mount root fs',
      'general protection fault, probably for non-canonical address',
      'inode 1402: orphan list corrupted',
      'journal commit I/O error',
    ];
    const TITLES = ['kernel panic', 'segfault', 'atif@an0m', 'atif@anom', 'EXT4-fs error'];
    let errStart = 0, textIv = null, panicIv = null, burstIv = null;
    let nodeCache = [], nodeCacheAt = 0;
    const intensity = () => Math.min(1, (performance.now() - errStart) / 25000);   // worst after ~25s

    function textNodes() {
      const out = [];
      const root = $('.page');
      if (!root) return out;
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const p = n.parentElement;
          if (!p || p.closest('svg, script, style, .statusbar, .heat-wrap, .ago')) return NodeFilter.FILTER_REJECT;
          return n.nodeValue.trim().length >= 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      while (w.nextNode()) out.push(w.currentNode);
      return out;
    }
    function pickNodes(k) {
      const now = performance.now();
      if (now - nodeCacheAt > 1000) { nodeCache = textNodes(); nodeCacheAt = now; }   // also picks up late-loaded stats
      const live = nodeCache.filter(n => n.isConnected && !n.parentElement.closest('.project:hover'));
      const seen = live.filter(n => { const r = n.parentElement.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      const pool = (seen.length && Math.random() < 0.8 ? seen : live).slice();
      const out = [];
      while (out.length < k && pool.length) out.push(pool.splice(rnd(pool.length), 1)[0]);
      return out;
    }

    // every text node keeps a set of corrupted positions; the characters there are re-rolled again and again
    function mutate(node, density) {
      let st = glitchStore.get(node);
      if (!st) {
        const chars = Array.from(node.nodeValue);
        const idx = [];
        chars.forEach((c, i) => { if (!/\s/.test(c)) idx.push(i); });
        st = { orig: node.nodeValue, chars, idx, bad: new Map() };
        glitchStore.set(node, st);
      }
      if (!st.idx.length) return;
      const want = Math.round(st.idx.length * density);
      const addOne = () => { st.bad.set(st.idx[rnd(st.idx.length)], randChar()); };
      const dropOne = () => { const keys = Array.from(st.bad.keys()); st.bad.delete(keys[rnd(keys.length)]); };
      while (st.bad.size < want) addOne();
      while (st.bad.size > want) dropOne();
      for (let c = Math.max(1, Math.round(want * 0.25)); c > 0 && st.bad.size; c--) { dropOne(); addOne(); }   // characters pop in and out
      st.bad.forEach((_, i) => { if (Math.random() < 0.6) st.bad.set(i, randChar()); });                      // and keep changing
      node.nodeValue = st.chars.map((c, i) => (st.bad.has(i) ? st.bad.get(i) : c)).join('');
    }
    function textTick() {
      const x = intensity();
      pickNodes(6 + Math.floor(x * 10)).forEach(n => mutate(n, 0.08 + 0.37 * x));
    }

    function burst() {                                         // the whole window jitters for a moment
      const page = $('.page');
      if (!page || reduceMotion) return;
      clearInterval(burstIv);
      let f = 0;
      burstIv = setInterval(() => {
        if (f++ >= 5) { clearInterval(burstIv); burstIv = null; page.style.transform = ''; page.classList.remove('glitching'); return; }
        page.classList.add('glitching');
        page.style.transform = `translate(${rnd(7) - 3}px, ${rnd(3) - 1}px) skewX(${((Math.random() * 2 - 1) * 1.6).toFixed(2)}deg)`;
      }, 45);
    }
    function scheduleBurst() {
      setTimeout(() => { if (Math.random() < 0.5) burst(); scheduleBurst(); }, 700 + rnd(1400));
    }

    function showPanic() {                                     // kernel errors type themselves into the status bar
      if (!keysEl) return;
      const msg = PANIC[rnd(PANIC.length)];
      let f = 0;
      clearInterval(panicIv);
      panicIv = setInterval(() => {
        f++;
        const keep = Math.min(msg.length, f * 3);
        let noise = '';
        for (let i = 0; i < Math.min(6, msg.length - keep); i++) noise += randChar();
        keysEl.textContent = msg.slice(0, keep) + noise;
        if (keep >= msg.length) { clearInterval(panicIv); panicIv = null; keysEl.textContent = msg; }
      }, 40);
      setTimeout(showPanic, 2200 + rnd(1200));
    }

    // ── the contribution graph goes wrong too ──
    //   cells re-roll their level, turn rust, drift and spin; ghost blocks and ascii pop up on top;
    //   now and then a whole sweep of columns flashes left to right
    const SVGNS = 'http://www.w3.org/2000/svg';
    let gSvg = null, gCells = [], gCols = [], gLayer = null, gAt = 0, ghosts = [];

    function graphScan(svg) {
      gSvg = svg;
      gAt = performance.now();
      gCells = $$('rect[style*="--c"]', svg);                  // the day cells (the legend squares have no --c)
      gCols = [];
      gCells.forEach(r => {
        const m = /--c:\s*(\d+)/.exec(r.getAttribute('style') || '');
        const c = m ? parseInt(m[1], 10) : 0;
        (gCols[c] = gCols[c] || []).push(r);
      });
      gLayer = svg.querySelector('g.err-layer');
      if (!gLayer) {
        gLayer = document.createElementNS(SVGNS, 'g');
        gLayer.setAttribute('class', 'err-layer');
        svg.appendChild(gLayer);
        ghosts = [];
      }
    }

    function graphTick() {
      const svg = $('.heat svg');
      if (!svg) return;                                        // graph not loaded (yet)
      if (svg !== gSvg || performance.now() - gAt > 2000) graphScan(svg);
      if (!gCells.length) return;
      const x = intensity();

      for (let n = 3 + Math.floor(x * 22); n > 0; n--) {       // cells: new level, sometimes rust, sometimes drifting / spinning
        const r = gCells[rnd(gCells.length)];
        r.setAttribute('class', 'l' + rnd(5));
        r.style.fill = Math.random() < 0.08 + 0.2 * x ? 'var(--err)' : '';
        if (reduceMotion) continue;
        if (Math.random() < 0.35) {
          r.style.transformBox = 'fill-box';
          r.style.transformOrigin = 'center';
          r.style.transform = `translate(${rnd(9) - 4}px, ${rnd(9) - 4}px) rotate(${rnd(91) - 45}deg) scale(${(0.5 + Math.random() * 1.4).toFixed(2)})`;
        } else {
          r.style.transform = '';
        }
      }
      if (reduceMotion) return;

      const [, , VW, VH] = (svg.getAttribute('viewBox') || '0 0 800 140').split(/\s+/).map(Number);

      if (Math.random() < 0.3 + 0.4 * x) {                     // ghost blocks appear in random places and sizes
        const g = document.createElementNS(SVGNS, 'rect');
        const w = [6, 11, 11, 22, 33, 55][rnd(6)], h = [6, 11, 11, 22][rnd(4)];
        g.setAttribute('x', rnd(Math.max(1, VW - w)));
        g.setAttribute('y', rnd(Math.max(1, VH - h)));
        g.setAttribute('width', w);
        g.setAttribute('height', h);
        g.setAttribute('fill-opacity', (0.35 + Math.random() * 0.65).toFixed(2));
        g.style.fill = Math.random() < 0.2 ? 'var(--err)' : `var(--h${1 + rnd(4)})`;
        g.style.opacity = '1';
        gLayer.appendChild(g);
        ghosts.push(g);
        while (ghosts.length > 30 + Math.floor(x * 60)) ghosts.shift().remove();
      }
      if (ghosts.length && Math.random() < 0.12) ghosts.splice(rnd(ghosts.length), 1)[0].remove();

      if (Math.random() < 0.3 + 0.3 * x) {                     // a few ascii characters flash up over the cells
        const c = gCells[rnd(gCells.length)];
        const t = document.createElementNS(SVGNS, 'text');
        let str = '';
        for (let i = 1 + rnd(3); i > 0; i--) str += randChar();
        t.textContent = str;
        t.setAttribute('x', c.getAttribute('x'));
        t.setAttribute('y', Number(c.getAttribute('y')) + 11);
        t.style.fill = Math.random() < 0.3 ? 'var(--err)' : 'var(--fg)';
        t.style.fontSize = (9 + rnd(14)) + 'px';
        gLayer.appendChild(t);
        setTimeout(() => t.remove(), 250 + rnd(650));
      }

      if (Math.random() < 0.02 + 0.03 * x) {                   // column sweep, left to right
        gCols.forEach((cells, i) => {
          if (!cells) return;
          setTimeout(() => cells.forEach(r => { r.style.fill = 'var(--fg)'; }), i * 14);
          setTimeout(() => cells.forEach(r => { r.style.fill = ''; }), i * 14 + 220);
        });
      }
    }

    function startError() {                                    // there is no stopError: refresh the page to get the site back
      errStart = performance.now();
      setInterval(() => { document.title = TITLES[rnd(TITLES.length)]; }, 900);
      textIv = setInterval(textTick, 80);
      setInterval(graphTick, 70);
      scheduleBurst();
      showPanic();
    }

    // ── normal + error: vim-style scrolling (hold the key to keep going) ──
    const DIR = { j: [0, 1], k: [0, -1], h: [-1, 0], l: [1, 0] };
    const STEP = 40, SPEED = 0.9;                              // px per tap, px per ms while held
    const held = new Set(), holdTimers = {};
    let loopRaf = null, lastT = 0, gTimer = null;

    const jump = (x, y) => scrollBy({ left: x, top: y, behavior: 'instant' });
    function loop(t) {
      const dt = Math.min(48, t - (lastT || t));
      lastT = t;
      let dx = 0, dy = 0;
      held.forEach(k => { dx += DIR[k][0]; dy += DIR[k][1]; });
      if (dx || dy) jump(dx * SPEED * dt, dy * SPEED * dt);
      loopRaf = held.size ? requestAnimationFrame(loop) : null;
      if (!held.size) lastT = 0;
    }
    function pressScroll(k) {
      jump(DIR[k][0] * STEP, DIR[k][1] * STEP);
      clearTimeout(holdTimers[k]);
      holdTimers[k] = setTimeout(() => {
        held.add(k);
        if (!loopRaf) loopRaf = requestAnimationFrame(loop);
      }, 160);
    }
    function releaseScroll(k) {
      clearTimeout(holdTimers[k]);
      held.delete(k);
    }

    // ── keys ──
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    addEventListener('keydown', e => {
      // ctrl+x: error mode (in insert it still cuts when text is selected)
      if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'x') {
        if (mode === 'error') { e.preventDefault(); return; }
        if (mode === 'insert') {
          const sel = getSelection();
          if (sel && !sel.isCollapsed) return;                 // let the normal cut happen
        }
        e.preventDefault();
        setMode('error');
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (mode === 'insert') {
        if (e.key === 'Escape') { e.preventDefault(); setMode('normal'); }
        else if (e.key === 'Enter') e.preventDefault();        // no line breaks inside headings and chips
        return;                                                // everything else types normally
      }

      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      if (DIR[e.key]) {
        e.preventDefault();
        if (!e.repeat) pressScroll(e.key);
      } else if (e.key === 'g') {
        if (gTimer) { clearTimeout(gTimer); gTimer = null; scrollTo({ top: 0, behavior: 'smooth' }); }
        else gTimer = setTimeout(() => { gTimer = null; }, 500);
      } else if (e.key === 'G') {
        scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else if ((e.key === 'i' || e.key === 'I') && mode === 'normal') {   // error mode has no way back
        e.preventDefault();
        setMode('insert');
      }
    });
    addEventListener('keyup', e => { if (DIR[e.key]) releaseScroll(e.key); });
    addEventListener('blur', () => Object.keys(DIR).forEach(releaseScroll));

    // insert mode: links must not navigate while you edit, pasted text stays plain, edits mark the file [+]
    document.addEventListener('click', e => {
      if (mode === 'insert' && e.target.closest && e.target.closest('a')) e.preventDefault();
    }, true);
    addEventListener('paste', e => {
      if (mode !== 'insert') return;
      e.preventDefault();
      const text = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\s+/g, ' ');
      document.execCommand('insertText', false, text);
    });
    addEventListener('input', () => { if (mode === 'insert') { dirty = true; paint(); } });

    paint();
  }
  // ── helpers for live data (cached in sessionStorage) ───
  async function cached(key, ttl, loader) {
    try {
      const c = JSON.parse(store.get(key) || 'null');
      if (c && Date.now() - c.t < ttl) return c.d;
    } catch {}
    const d = await loader();
    store.set(key, JSON.stringify({ t: Date.now(), d }));
    return d;
  }
  async function getJSON(url) {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  const gh = path => getJSON('https://api.github.com' + path);
  const utc = ts => ts.slice(0, 16).replace('T', ' ') + ' UTC';
  const ago = ts => {
    const s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 60) return 'just now';
    const m = s / 60; if (m < 60) return Math.floor(m) + 'm ago';
    const h = m / 60; if (h < 24) return Math.floor(h) + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  };
  const show = id => { const el = $(id); if (el) el.hidden = false; return el; };

  // ── current star counts on the projects ────────────────
  function initStars() {
    cached('gh-repos', 300000, async () => {
      const repos = await gh(`/users/${USER}/repos?per_page=100&type=owner`);
      return repos.map(r => [r.name, r.stargazers_count, r.fork ? 1 : 0]);
    }).then(list => {
      const stars = {};
      list.forEach(([n, s]) => { stars[n] = s; });
      $$('.project').forEach(p => {
        const slot = $('.proj-stars', p);
        if (!slot) return;
        let value;
        if (p.dataset.match) {                                   // several repos -> total
          const re = new RegExp(p.dataset.match);
          const hit = list.filter(([n, , fork]) => !fork && re.test(n));
          if (hit.length) value = hit.reduce((a, [, s]) => a + s, 0);
        } else {
          const name = p.dataset.repo || (p.href.match(/github\.com\/atif-1402\/([^/?#]+)/) || [])[1];
          if (name && stars[name] !== undefined) value = stars[name];
        }
        if (value !== undefined) slot.textContent = '★ ' + value;
      });
    }).catch(() => {});
  }

  // ── stats: contribution graph + last active / repo / push ──
  function initStats() {
    loadGraph();
    loadPush();
  }

  function loadGraph() {
    const box = $('#heat');
    if (!box) return;
    cached('gh-contrib', 600000, async () => {
      const d = await getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`);
      return d.contributions.map(c => [c.date, c.count, c.level]);
    }).then(raw => {
      const days = raw.slice().sort((a, b) => (a[0] < b[0] ? -1 : 1));
      if (!days.length) throw new Error('empty');
      drawGraph(box, days);
      fillSummary(days);
    }).catch(() => {
      box.innerHTML = '<span class="heat-msg">contribution graph unavailable right now</span>';
    });
  }

  function fillSummary(days) {
    const total = days.reduce((a, d) => a + d[1], 0);
    let longest = 0, run = 0;
    days.forEach(d => { run = d[1] ? run + 1 : 0; longest = Math.max(longest, run); });
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i][1]) streak++;
      else if (i === days.length - 1) continue;        // today may still be empty
      else break;
    }
    const last = days.filter(d => d[1] > 0).pop();
    $('#st-contrib-v').textContent = `${total} in the last year · streak ${streak}d · best ${longest}d`;
    show('#st-contrib');
    if (last) {
      $('#st-active-v').textContent = `${last[0]} (${last[1]} contribution${last[1] === 1 ? '' : 's'})`;
      show('#st-active');
    }
  }

  function drawGraph(box, days) {
    const P = 14, S = 11, LEFT = 30, TOP = 16, MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dow = s => new Date(s + 'T00:00:00Z').getUTCDay();   // Sunday = 0
    const off = dow(days[0][0]);
    const cols = Math.ceil((off + days.length) / 7);
    const W = LEFT + cols * P, H = TOP + 7 * P + 22;
    const lvl = (c, l) => (typeof l === 'number' ? l : (c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4));

    let cells = '', labels = '', lastMonth = -1, lastCol = -9;
    days.forEach(([date, count, level], i) => {
      const col = Math.floor((off + i) / 7), row = (off + i) % 7;
      cells += `<rect class="l${lvl(count, level)}" style="--c:${col}" x="${LEFT + col * P}" y="${TOP + row * P}" width="${S}" height="${S}"><title>${count} contribution${count === 1 ? '' : 's'} on ${date}</title></rect>`;
      const month = parseInt(date.slice(5, 7), 10) - 1;
      if (row === 0 && month !== lastMonth && col - lastCol >= 3) {
        labels += `<text x="${LEFT + col * P}" y="10">${MONTHS[month]}</text>`;
        lastMonth = month; lastCol = col;
      }
    });
    [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']].forEach(([r, n]) => {
      labels += `<text x="0" y="${TOP + r * P + S - 1}">${n}</text>`;
    });
    let legend = `<text x="${LEFT}" y="${H - 4}">less</text>`;
    for (let i = 0; i < 5; i++) legend += `<rect class="l${i}" style="opacity:1" x="${LEFT + 30 + i * (S + 3)}" y="${H - 13}" width="${S}" height="${S}"/>`;
    legend += `<text x="${LEFT + 30 + 5 * (S + 3) + 4}" y="${H - 4}">more</text>`;

    box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="github contribution graph, last year" shape-rendering="crispEdges">${labels}${cells}${legend}</svg>`;
    requestAnimationFrame(() => box.classList.add('in'));
    const wrap = box.parentElement;                 // phones: start at the newest weeks
    if (wrap) wrap.scrollLeft = wrap.scrollWidth;
  }

  function loadPush() {
    cached('gh-push', 300000, async () => {
      const ev = await gh(`/users/${USER}/events/public?per_page=50`);
      const p = ev.find(e => e.type === 'PushEvent' && !e.repo.name.endsWith('/' + USER));
      if (!p) return null;
      const commits = (p.payload && p.payload.commits) || [];
      const msg = commits.length ? String(commits[commits.length - 1].message || '').split('\n')[0] : '';
      return { repo: p.repo.name, ts: p.created_at, msg };
    }).then(p => {
      if (!p) return;
      const a = $('#st-repo-a');
      a.textContent = p.repo.split('/').pop();
      a.href = 'https://github.com/' + p.repo;
      show('#st-repo');
      $('#st-push-t').textContent = utc(p.ts);
      const paint = () => { $('#st-push-ago').textContent = '· ' + ago(p.ts); };
      paint();
      setInterval(paint, 60000);
      show('#st-push');
      if (p.msg) { $('#st-msg-v').textContent = '“' + p.msg.slice(0, 80) + '”'; show('#st-msg'); }
    }).catch(() => {});
  }

  // ── project hover: terminal selection bar ──────────────
  // fills the row in whole character cells, swaps the index for a ">" pointer,
  // and "decodes" the name like a terminal resolving text.
  function initWipe() {
    const css    = getComputedStyle(document.documentElement);
    const BG     = css.getPropertyValue('--bg').trim()     || '#18181a';
    const ACCENT = css.getPropertyValue('--accent').trim() || '#aaaaac';

    const hexRgb = hex => {
      const h = hex.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    const mix  = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const FILL = `rgb(${mix(hexRgb(BG), hexRgb(ACCENT), 0.07).join(',')})`;

    // width of one character cell, so the bar grows in terminal-sized steps
    let CW = 7.2;
    try {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `12px ${getComputedStyle(document.body).fontFamily}`;
      const w = ctx.measureText('M').width;
      if (w > 4) CW = w;
    } catch {}

    const GLYPHS = '01#$%&*+<>/\\|=_-';

    function setupProject(proj) {
      proj.style.position = 'relative';
      proj.style.overflow = 'hidden';

      const bar = document.createElement('div');
      bar.className = 'tui-bar';
      bar.style.cssText =
        'position:absolute;left:0;top:0;bottom:0;width:0;pointer-events:none;z-index:0;' +
        `background:${FILL};box-shadow:inset 2px 0 0 ${ACCENT};`;
      proj.prepend(bar);

      const icon = $('.proj-icon', proj);
      const name = $('.proj-name', proj);
      const textOf = el => (el && el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : null);
      let iconOrig = '', nameOrig = '', engaged = false;
      let raf = null, scr = null;

      const stop = () => {
        if (raf) cancelAnimationFrame(raf);
        if (scr) clearInterval(scr);
        raf = scr = null;
      };

      // animate the bar to a fraction of the row width, snapped to character cells
      function fillTo(frac, ms) {
        const from = parseFloat(bar.style.width) || 0;
        const to = frac * proj.offsetWidth;
        const t0 = performance.now();
        const tick = now => {
          const t = Math.min(1, (now - t0) / ms);
          const w = from + (to - from) * t;
          bar.style.width = (t >= 1 ? to : Math.round(w / CW) * CW) + 'px';
          raf = t < 1 ? requestAnimationFrame(tick) : null;
        };
        raf = requestAnimationFrame(tick);
      }

      // name resolves left to right out of noise
      function decode() {
        const nt = textOf(name);
        if (!nt || nameOrig.length < 2) return;
        const n = nameOrig.length, frames = 9;
        let f = 0;
        scr = setInterval(() => {
          f++;
          const keep = Math.floor(n * f / frames);
          let out = nameOrig.slice(0, keep);
          for (let i = keep; i < n; i++) {
            out += nameOrig[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          nt.nodeValue = out;
          if (f >= frames) { clearInterval(scr); scr = null; nt.nodeValue = nameOrig; }
        }, 28);
      }

      function wipeIn() {
        if (mode === 'insert') return;            // editing: leave the text alone
        stop();
        const nt = textOf(name), it = textOf(icon);
        nameOrig = nt ? origOf(nt) : '';
        iconOrig = it ? origOf(it) : '';
        engaged = true;
        if (it) { it.nodeValue = '>'; icon.style.color = ACCENT; }
        if (reduceMotion) { bar.style.width = '100%'; return; }
        bar.style.width = '0px';
        fillTo(1, 240);
        decode();
      }
      function wipeOut() {
        stop();
        if (engaged) {                            // only undo what wipeIn actually changed
          const nt = textOf(name), it = textOf(icon);
          if (nt) nt.nodeValue = nameOrig;
          if (it) { it.nodeValue = iconOrig; icon.style.color = ''; }
          engaged = false;
        }
        if (reduceMotion) { bar.style.width = '0px'; return; }
        fillTo(0, 120);
      }

      proj.wipeIn = wipeIn;       // keyboard selection (j/k) uses the same effect
      proj.wipeOut = wipeOut;
      proj.addEventListener('mouseenter', wipeIn);
      proj.addEventListener('mouseleave', wipeOut);
    }

    $$('.project').forEach(setupProject);
  }
})();
