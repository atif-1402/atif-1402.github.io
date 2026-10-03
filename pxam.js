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

  document.addEventListener('DOMContentLoaded', () => {
    ensureCursor();          // every page
    initWipe();              // triangle wipe on .project hover (every page)
    if (document.body.classList.contains('home')) {
      initClock();
      initBoot();
      initKeys();
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

  // ── keyboard: j/k to move, enter to open ───────────────
  function initKeys() {
    const projs = $$('.project');
    if (!projs.length) return;
    let idx = -1;

    const clear = () => {
      if (idx >= 0) {
        projs[idx].classList.remove('sel');
        if (projs[idx].wipeOut) projs[idx].wipeOut();
      }
    };
    const select = n => {
      clear();
      idx = (n + projs.length) % projs.length;
      const p = projs[idx];
      p.classList.add('sel');
      if (p.wipeIn) p.wipeIn();
      if (p.scrollIntoView) p.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    projs.forEach((p, n) => p.addEventListener('mouseenter', () => {
      if (idx >= 0 && idx !== n) { projs[idx].classList.remove('sel'); if (projs[idx].wipeOut) projs[idx].wipeOut(); }
      idx = n;
    }));

    addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'j') select(idx + 1);
      else if (e.key === 'k') select(idx < 0 ? projs.length - 1 : idx - 1);
      else if (e.key === 'Escape') { clear(); idx = -1; }
      else if (e.key === 'Enter' && idx >= 0 && !(t && t.closest && t.closest('a'))) projs[idx].click();
    });
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
      const iconText = icon ? icon.textContent : '';
      const nameText = name ? name.textContent : '';
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
        if (!name || nameText.length < 2) return;
        const n = nameText.length, frames = 9;
        let f = 0;
        scr = setInterval(() => {
          f++;
          const keep = Math.floor(n * f / frames);
          let out = nameText.slice(0, keep);
          for (let i = keep; i < n; i++) {
            out += nameText[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          name.textContent = out;
          if (f >= frames) { clearInterval(scr); scr = null; name.textContent = nameText; }
        }, 28);
      }

      function wipeIn() {
        stop();
        if (icon) { icon.textContent = '>'; icon.style.color = ACCENT; }
        if (reduceMotion) { bar.style.width = '100%'; return; }
        bar.style.width = '0px';
        fillTo(1, 240);
        decode();
      }
      function wipeOut() {
        stop();
        if (name) name.textContent = nameText;
        if (icon) { icon.textContent = iconText; icon.style.color = ''; }
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
