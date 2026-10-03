// timeline.js — atif@anom/journey
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const entries = Array.from(document.querySelectorAll('.tl-entry'));
  const years   = Array.from(document.querySelectorAll('.tl-year'));
  const types   = ['all', 'milestone', 'project', 'learning', 'note'];

  // ── scroll reveal ───────────────────────────────────────
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(list => {
      let n = 0;
      list.forEach(item => {
        if (!item.isIntersecting) return;
        const el = item.target;
        setTimeout(() => el.classList.add('visible'), n++ * 60);
        observer.unobserve(el);
      });
    }, { threshold: 0.1 });
    entries.forEach(el => observer.observe(el));
  } else {
    entries.forEach(el => el.classList.add('visible'));
  }

  // ── filter bar ──────────────────────────────────────────
  const buttons = [];
  const bar = document.createElement('div');
  bar.className = 'tl-filters';

  function applyFilter(type) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.filter === type));

    entries.forEach(el => {
      el.style.display = (type === 'all' || el.dataset.type === type) ? '' : 'none';
    });

    // hide year markers that have no visible entries after them
    years.forEach(year => {
      let next = year.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains('tl-year')) {
        if (next.classList.contains('tl-entry') && next.style.display !== 'none') { hasVisible = true; break; }
        next = next.nextElementSibling;
      }
      year.style.display = hasVisible ? '' : 'none';
    });

    if (cur && cur.style.display === 'none') clearSel();
  }

  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'tl-filter' + (type === 'all' ? ' active' : '');
    btn.textContent = type;
    btn.dataset.filter = type;
    btn.addEventListener('click', () => applyFilter(type));
    buttons.push(btn);
    bar.appendChild(btn);
  });
  timeline.parentNode.insertBefore(bar, timeline);

  // ── keyboard: j/k move through entries, 1-5 pick a filter ──
  let cur = null;
  const visibleEntries = () => entries.filter(el => el.style.display !== 'none');

  function clearSel() {
    if (cur) cur.classList.remove('sel');
    cur = null;
  }
  function select(el) {
    if (!el) return;
    if (cur) cur.classList.remove('sel');
    cur = el;
    el.classList.add('visible');
    el.classList.add('sel');
    el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    const list = visibleEntries();
    if (e.key === 'j') {
      const pos = list.indexOf(cur);
      select(list[Math.min(pos + 1, list.length - 1)]);
    } else if (e.key === 'k') {
      const pos = list.indexOf(cur);
      select(list[pos < 0 ? list.length - 1 : Math.max(pos - 1, 0)]);
    } else if (e.key === 'Escape') {
      clearSel();
    } else if (/^[1-5]$/.test(e.key)) {
      applyFilter(types[Number(e.key) - 1]);
    }
  });
});
