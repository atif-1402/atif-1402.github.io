// timeline.js — atif@anom/personal

// ── scroll reveal ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const entries = document.querySelectorAll('.tl-entry');

  const observer = new IntersectionObserver((obs) => {
    obs.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  entries.forEach(el => observer.observe(el));
});

// ── filter bar ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const types = ['all', 'milestone', 'project', 'learning', 'note'];

  const bar = document.createElement('div');
  bar.className = 'tl-filters';

  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'tl-filter' + (type === 'all' ? ' active' : '');
    btn.textContent = type;
    btn.dataset.filter = type;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.tl-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const entries = document.querySelectorAll('.tl-entry');
      const years   = document.querySelectorAll('.tl-year');

      entries.forEach(el => {
        if (type === 'all' || el.dataset.type === type) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });

      // hide year markers if no visible entries follow them
      years.forEach(year => {
        let next = year.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('tl-year')) {
          if (next.classList.contains('tl-entry') && next.style.display !== 'none') {
            hasVisible = true;
            break;
          }
          next = next.nextElementSibling;
        }
        year.style.display = hasVisible ? '' : 'none';
      });
    });

    bar.appendChild(btn);
  });

  timeline.parentNode.insertBefore(bar, timeline);
});