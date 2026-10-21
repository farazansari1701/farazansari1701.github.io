(() => {
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const banner = document.getElementById('blog-cookie');
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', {ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
  if (read('fa-consent') === 'granted') gtag('consent', 'update', {analytics_storage:'granted'});
  gtag('js', new Date());
  gtag('config', 'G-0S2BYMQSKW', {anonymize_ip:true});
  const script = document.createElement('script');
  script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=G-0S2BYMQSKW';
  document.head.appendChild(script);
  if (!read('fa-consent') && banner) banner.hidden = false;
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.consent; write('fa-consent', value);
    gtag('consent', 'update', {analytics_storage:value});
    if (banner) banner.hidden = true;
  }));
  const settings = document.getElementById('cookie-settings');
  if (settings && banner) settings.addEventListener('click', () => { banner.hidden = false; });
})();
