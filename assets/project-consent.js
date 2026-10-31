/* Consent choices for the project collection and case studies.
   The measurement script and GTM use the same 'fa-consent' storage key. */
(() => {
  'use strict';
  const banner = document.getElementById('project-cookie');
  if (!banner) return;
  const stored = () => { try { return localStorage.getItem('fa-consent'); } catch { return null; } };
  const apply = value => {
    try { localStorage.setItem('fa-consent',value); } catch {}
    window.farazAnalytics?.applyConsent(value);
    banner.hidden = true;
  };
  const choice = stored();
  window.farazAnalytics?.applyConsent(choice);
  banner.hidden = choice === 'granted' || choice === 'denied';
  banner.querySelectorAll('[data-project-consent]').forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.getAttribute('data-project-consent');
      if (choice === 'granted' || choice === 'denied') apply(choice);
    });
  });
  document.getElementById('cookie-reset')?.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('button')?.focus();
  });
  // Changes in another tab should be reflected without changing stored consent.
  window.addEventListener('storage',event => {
    if (event.key === 'fa-consent') {
      window.farazAnalytics?.applyConsent(event.newValue);
      banner.hidden = event.newValue === 'granted' || event.newValue === 'denied';
    }
  });
})();