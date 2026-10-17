// stats.js — live GitHub data for ANOM OS (contributions, last push, repo stars)
(() => {
  const U = 'atif-1402';
  const J = async u => { const r = await fetch(u); if (!r.ok) throw 0; return r.json(); };
  const cache = async (k, ttl, f) => {
    try { const c = JSON.parse(sessionStorage.getItem(k)); if (c && Date.now() - c.t < ttl) return c.v; } catch {}
    const v = await f();
    try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v })); } catch {}
    return v;
  };
  const hex = n => Math.min(255, n).toString(16).toUpperCase().padStart(2, '0');
  const ago = t => { const s = (Date.now() - new Date(t)) / 1e3; return s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  const lv = (c, l) => typeof l === 'number' ? l : c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4;

  const S = window.AnomStats = {
    load() {
      return S.p || (S.p = (async () => {
        const o = {};
        try {
          const d = await cache('gh-c', 6e5, async () => (await J(`https://github-contributions-api.jogruber.de/v4/${U}?y=last`)).contributions.map(c => [c.date, c.count, c.level]));
          o.days = d.sort((a, b) => a[0] < b[0] ? -1 : 1);
          o.total = o.days.reduce((a, d) => a + d[1], 0);
          let run = 0; o.best = 0; o.streak = 0;
          o.days.forEach(d => { run = d[1] ? run + 1 : 0; o.best = Math.max(o.best, run); });
          for (let i = o.days.length - 1; i >= 0; i--) { if (o.days[i][1]) o.streak++; else if (i !== o.days.length - 1) break; }
          o.last = o.days.filter(d => d[1]).pop();
        } catch {}
        try {
          o.push = await cache('gh-p', 3e5, () => J(`https://api.github.com/users/${U}/events/public?per_page=50`).then(ev => {
            const p = ev.find(e => e.type === 'PushEvent' && !e.repo.name.endsWith('/' + U));
            if (!p) return null;
            const c = (p.payload && p.payload.commits) || [];
            return { repo: p.repo.name, ts: p.created_at, msg: c.length ? String(c[c.length - 1].message || '').split('\n')[0] : '' };
          }));
        } catch {}
        try { o.repos = await cache('gh-r', 3e5, async () => (await J(`https://api.github.com/users/${U}/repos?per_page=100&type=owner`)).filter(r => !r.fork).map(r => [r.name, r.stargazers_count])); } catch {}
        return o;
      })());
    },
    text(o) {
      const L = [];
      if (o.days) L.push(`contrib   ${o.total} in the last year · streak ${o.streak}d · best ${o.best}d`);
      if (o.last) L.push(`active    ${o.last[0]} (${o.last[1]})`);
      if (o.push) { L.push(`last repo ${o.push.repo.split('/').pop()}`); L.push(`last push ${o.push.ts.slice(0, 16).replace('T', ' ')} UTC · ${ago(o.push.ts)}`); if (o.push.msg) L.push(`commit    "${o.push.msg.slice(0, 60)}"`); }
      return L.length ? L.join('\n') : 'github unreachable right now (rate limit or offline)';
    },
    mount(el) {
      el.innerHTML = '<h2>~/stats <span class="d">· live from github</span></h2><div class="heat sunk" style="padding:8px"><span class="d">loading contributions…</span></div><div id="sr"></div>';
      S.load().then(o => {
        const h = el.querySelector('.heat');
        if (o.days) {
          const off = new Date(o.days[0][0] + 'T00:00:00Z').getUTCDay();
          h.innerHTML = '<div class="hg">' + o.days.map(([d, c, l], i) => `<i class="l${lv(c, l)}" title="${c} on ${d}" ${i ? '' : `style="grid-row-start:${off + 1}"`}>${hex(c)}</i>`).join('') + '</div>';
          h.scrollLeft = h.scrollWidth;
        } else h.innerHTML = '<span class="d">contribution graph unavailable right now</span>';
        el.querySelector('#sr').innerHTML = S.text(o).split('\n').map(l => `<div class="kv"><b>${l.slice(0, 10).trim()}</b><span>${l.slice(10).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span></div>`).join('') + '<p class="d" style="margin-top:8px">each square = that day\'s contributions as a hex byte</p>';
      });
    }
  };
})();
