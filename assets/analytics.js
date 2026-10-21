/* Shared basic-consent-mode bootstrap. GA4 remains owned by the site, not GTM.
 * Do not add a second Google tag for G-0S2BYMQSKW inside this container.
 * No Google script or iframe loads before analytics consent.
 */
(() => {
  'use strict';
  if (window.farazAnalytics) return;
  const measurementId = 'G-0S2BYMQSKW';
  const containerId = 'GTM-57BRSKXB';
  let loaded = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    personalization_storage: 'denied'
  });
  function applyConsent(value) {
    const granted = value === 'granted';
    window['ga-disable-' + measurementId] = !granted;
    // Before the first grant, keep the denial local: no network or consent ping.
    if (!granted && !loaded) return;
    window.gtag('consent', 'update', {analytics_storage: granted ? 'granted' : 'denied'});
    if (!granted || loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {anonymize_ip: true});
    const ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(ga);
    // Standard GTM bootstrap, delayed until the stored/banner choice allows it.
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    const gtm = document.createElement('script');
    gtm.async = true;
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + containerId;
    document.head.appendChild(gtm);
  }
  window.farazAnalytics = {applyConsent};
  let consent = null;
  try { consent = localStorage.getItem('fa-consent'); } catch {}
  applyConsent(consent);
  window.addEventListener('storage', event => {
    if (event.key === 'fa-consent' || event.key === null) applyConsent(event.newValue);
  });
})();
