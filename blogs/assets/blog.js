(() => {
  'use strict';
  const id = 'G-0S2BYMQSKW';
  const banner = document.getElementById('blog-cookie');
  const getConsent = () => { try { return localStorage.getItem('fa-consent'); } catch { return null; } };
  const saveConsent = value => { try { localStorage.setItem('fa-consent', value); } catch {} };
  let loaded = false;
  function applyConsent(value) {
    window['ga-disable-' + id] = value !== 'granted';
    if (value !== 'granted') {
      if (loaded) window.gtag('consent', 'update', {analytics_storage:'denied'});
      return;
    }
    if (loaded) { window.gtag('consent', 'update', {analytics_storage:'granted'}); return; }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', id);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }
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
  window.addEventListener('storage', event => { if (event.key === 'fa-consent') applyConsent(event.newValue); });
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
})();
