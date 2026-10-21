/* GTM owns the Google tag. Inline consent defaults run before the GTM snippet.
 * The site controls consent and sends one page view after an explicit grant.
 * Do not add a standalone GA4 loader or another automatic page-view tag.
 */
(() => {
  'use strict';
  if (window.farazAnalytics) return;
  const measurementId = 'G-0S2BYMQSKW';
  let granted = false;
  let pageViewed = false;
  function sendPageView() {
    if (!granted || pageViewed || document.readyState === 'loading') return;
    pageViewed = true;
    window.gtag('event', 'page_view', {
      send_to: measurementId,
      page_title: document.title,
      page_location: location.origin + location.pathname
    });
  }
  function applyConsent(value) {
    granted = value === 'granted';
    window['ga-disable-' + measurementId] = !granted;
    window.gtag('consent', 'update', {analytics_storage: granted ? 'granted' : 'denied'});
    sendPageView();
  }
  window.farazAnalytics = {applyConsent};
  let consent = null;
  try { consent = localStorage.getItem('fa-consent'); } catch {}
  applyConsent(consent);
  document.addEventListener('DOMContentLoaded', sendPageView, {once:true});
  window.addEventListener('storage', event => {
    if (event.key === 'fa-consent' || event.key === null) applyConsent(event.newValue);
  });
})();
