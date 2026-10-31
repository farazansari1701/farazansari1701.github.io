(() => {
  'use strict';
  const banner = document.getElementById('blog-cookie');
  const getConsent = () => { try { return localStorage.getItem('fa-consent'); } catch { return null; } };
  const saveConsent = value => { try { localStorage.setItem('fa-consent', value); } catch {} };
  const applyConsent = value => window.farazAnalytics?.applyConsent(value);
  const consent = getConsent();
  applyConsent(consent);
  if (banner) banner.hidden = consent === 'granted' || consent === 'denied';
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.consent;
    saveConsent(value); applyConsent(value); if (banner) banner.hidden = true;
  }));
  document.getElementById('cookie-settings')?.addEventListener('click', () => {
    if (banner) { banner.hidden = false; banner.querySelector('button')?.focus(); }
  });
  const copy = document.getElementById('copy-link');
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.getElementById('share-status');
      try { await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href); status.textContent = 'Link copied.'; }
      catch { status.textContent = 'Copy the address from your browser to share this article.'; }
    });
  }
  const body = document.getElementById('article-body');
  const progress = document.querySelector('.reading-progress');
  if (body && progress) {
    const update = () => {
      const rect = body.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const amount = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 1;
      progress.style.transform = `scaleX(${amount})`;
    };
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update); update();
  }
  const links = [...document.querySelectorAll('.toc a')];
  if ('IntersectionObserver' in window && links.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-90px 0px -60% 0px',threshold:0});
    links.forEach(link => { const target = document.getElementById(link.hash.slice(1)); if (target) observer.observe(target); });
  }


  /* Search title, topic and excerpt; all cards remain available without JS. */
  const discovery = document.getElementById('blog-discovery');
  const archive = document.getElementById('blog-post-list');
  const search = document.getElementById('blog-search');
  if (discovery && archive && search) {
    const entries = [...archive.querySelectorAll('.post-card')].map(card => {
      const topic = (card.querySelector('.eyebrow')?.textContent || '').trim();
      const title = (card.querySelector('h2')?.textContent || '').trim();
      const description = (card.querySelector('h2 + p')?.textContent || '').trim();
      return {card, topic, haystack: (title + ' ' + description + ' ' + topic)
        .normalize('NFKD').toLocaleLowerCase('en-GB')};
    });
    const filters = [...discovery.querySelectorAll('[data-blog-filter]')];
    const status = document.getElementById('blog-result-count');
    const empty = document.getElementById('blog-empty');
    const clear = document.getElementById('blog-clear');
    let selected = 'all';
    const update = () => {
      const query = search.value.trim().normalize('NFKD').toLocaleLowerCase('en-GB');
      let shown = 0;
      entries.forEach(({card,topic,haystack}) => {
        const visible = (selected === 'all' || topic === selected) && haystack.includes(query);
        card.hidden = !visible;
        if (visible) {
          shown++;
          // Don't leave newly unhidden cards concealed by the reveal animation.
          card.dataset.reveal = 'visible';
        }
      });
      filters.forEach(button => button.setAttribute('aria-pressed',
        String(button.dataset.blogFilter === selected)));
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = shown + ' of ' + entries.length + ' articles shown';
      if (clear) clear.hidden = query.length === 0;
    };
    search.addEventListener('input', update);
    filters.forEach(button => button.addEventListener('click', () => {
      selected = button.dataset.blogFilter || 'all';
      update();
    }));
    clear?.addEventListener('click', () => { search.value = ''; update(); search.focus(); });
    discovery.hidden = false;
    update();
  }

  // One reveal per archive card. The document remains a normal readable list.
  const cards = [...document.querySelectorAll('.post-list .post-card')];
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (cards.length && motion && !motion.matches && 'IntersectionObserver' in window) {
    let revealObserver;
    const reveal = card => {
      card.dataset.reveal = 'visible';
      revealObserver?.unobserve(card);
    };
    const showAll = () => {
      revealObserver?.disconnect(); cards.forEach(reveal);
    };
    try {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, {rootMargin:'0px 0px -24px 0px',threshold:.08});
      cards.forEach((card, index) => {
        card.style.setProperty('--reveal-delay', Math.min(index % 3, 2) * 80 + 'ms');
        card.dataset.reveal = 'pending';
        card.addEventListener('focusin', () => reveal(card));
        revealObserver.observe(card);
      });
      if (motion.addEventListener) motion.addEventListener('change', event => { if (event.matches) showAll(); });
      else motion.addListener(event => { if (event.matches) showAll(); });
      // BFCache restores should not leave a previously visible card concealed.
      window.addEventListener('pageshow', event => { if (event.persisted) showAll(); });
    } catch { showAll(); }
  }
})();
