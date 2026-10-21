/* Consent-gated, anonymous interaction events. Clicks are intent, not enquiries. */
(() => {
  'use strict';
  const granted = () => {
    try { return localStorage.getItem('fa-consent') === 'granted'; } catch { return false; }
  };
  const emit = (name, params) => {
    if (granted() && typeof window.gtag === 'function') window.gtag('event', name, params);
  };
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const page_path = location.pathname;
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
      emit('contact_click', {method:url.protocol === 'mailto:' ? 'email' : 'phone', page_path});
    } else if (url.hostname === 'calendly.com') {
      emit('contact_click', {method:'booking', page_path});
    } else if (/\.(pdf|docx?)$/i.test(url.pathname)) {
      emit(/(?:cv|resume)/i.test(url.pathname) ? 'cv_download' : 'file_download', {file_path:url.pathname,file_extension:url.pathname.split('.').pop(),page_path});
    } else if (url.origin !== location.origin && /^https?:$/.test(url.protocol)) {
      const profile = /(^|\.)(linkedin\.com|instagram\.com|facebook\.com)$/.test(url.hostname);
      emit(profile ? 'outbound_profile_click' : 'outbound_click', {link_domain:url.hostname,page_path});
    }
  });
  const article = document.getElementById('article-body');
  if (!article) return;
  let activeSeconds = 0, furthest = 0, sent = false;
  const recordDepth = () => {
    const rect = article.getBoundingClientRect();
    furthest = Math.max(furthest, Math.min(1, Math.max(0, (innerHeight - rect.top) / rect.height)));
  };
  window.addEventListener('scroll', recordDepth, {passive:true});
  recordDepth();
  const timer = setInterval(() => {
    if (!granted()) { activeSeconds = 0; return; }
    if (document.visibilityState === 'visible') activeSeconds += 5;
    if (!sent && activeSeconds >= 60 && furthest >= .75 && typeof window.gtag === 'function') {
      emit('article_read', {page_path:location.pathname,percent_read:75,active_seconds:activeSeconds});
      sent = true; clearInterval(timer);
    }
  }, 5000);
})();
