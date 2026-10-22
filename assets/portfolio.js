// Enable progressive reveals only when the application has actually loaded.
document.documentElement.classList.add('js');

(() => {
  /* ---- Settings: fill these in before going live ---- */
  const CONFIG = {
    email: 'contact@farazansari1701.com',
    bookingUrl: 'https://calendly.com/farazansari1701/30min',     // e.g. your Calendly or Cal.com link
    linkedin: 'https://www.linkedin.com/in/farazansari1701/',
    gaId: 'G-0S2BYMQSKW',           // GA4 measurement ID, e.g. 'G-XXXXXXX'
    secretWord: 'print' // typing this anywhere prints the About sheet
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  };
  const G = window.gsap, ST = window.ScrollTrigger;
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  // big headings: shrink to fit the column on narrow screens
  // measure each heading at the widest point its scroll animation reaches
  const fit = () => {
    const headings = $$('.sec-head, .hero-name .ln, .wordmark').map(h => {
      const vars = h.classList.contains('sec-head') ? { '--wd': 112 } : h.classList.contains('wordmark') ? { '--wd': 125 } : { '--wi': 100, '--ws': 25 };
      const prev = {}; for (const k in vars) { prev[k] = h.style.getPropertyValue(k); h.style.setProperty(k, vars[k]); }
      h.style.fontSize = '';
      return {h, vars, prev};
    });
    // Read after all resets, then write after all measurements: one layout batch.
    const sizes = headings.map(({h}) => {
      const sw = h.scrollWidth, cw = h.clientWidth;
      return sw - cw > 1 ? (parseFloat(getComputedStyle(h).fontSize) * cw / sw * .97).toFixed(1) + 'px' : '';
    });
    headings.forEach(({h, vars, prev}, i) => {
      h.style.fontSize = sizes[i];
      for (const k in vars) { if (prev[k]) h.style.setProperty(k, prev[k]); else h.style.removeProperty(k); }
    });
  };
  fit(); let ft; addEventListener('resize', () => { clearTimeout(ft); ft = setTimeout(() => { fit(); ST && ST.refresh(); }, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  /* ---- toast ---- */
  const toastEl = $('#toast'); let toastT;
  function toast(msg){ if(!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 3200); }

  /* ---- sound (off by default) ---- */
  let soundOn = store.get('fa-sound') === 'on'; let actx = null;
  function tick(freq = 1800, dur = .05, vol = .5){
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const len = Math.max(1, Math.floor(actx.sampleRate * dur));
      const buf = actx.createBuffer(1, len, actx.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      const src = actx.createBufferSource(); src.buffer = buf;
      const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
      const g = actx.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(actx.destination); src.start();
    } catch(e){}
  }
  const snd = $('#snd');
  function syncSnd(){ if (snd) snd.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); }
  syncSnd();
  snd && snd.addEventListener('click', () => { soundOn = !soundOn; store.set('fa-sound', soundOn ? 'on' : 'off'); syncSnd(); tick(1400, .08); });

  /* ---- smooth scroll ---- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    try { lenis = new window.Lenis({ duration: 1.1, smoothWheel: true }); } catch(e){ lenis = null; }
  }
  if (G && ST) {
    G.registerPlugin(ST);
    if (window.MotionPathPlugin) G.registerPlugin(window.MotionPathPlugin);
    if (lenis) { lenis.on('scroll', ST.update); G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
  } else if (lenis) {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  }
  function scrollToEl(el){
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---- menu ---- */
  const menu = $('#menu'), menuBtn = $('#menu-btn');
  function setMenu(open){
    if (!menu) return;
    menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('menu-open', open);
    if (open) $('.menu-scroll', menu).scrollTop = 0;
    if (open) { lenis && lenis.stop(); setTimeout(() => { const a = $('a', menu); a && a.focus(); }, 80); }
    else { lenis && lenis.start(); menuBtn.focus(); }
    tick(900, .06);
  }
  menuBtn && menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $('#menu-close') && $('#menu-close').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => {
    if (!menu || !menu.classList.contains('open')) return;
    if (e.key === 'Escape') setMenu(false);
    if (e.key === 'Tab') {
      const items = $$('a[href],button:not([disabled])', menu), first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2 || a.classList.contains('skip') || a.closest('.desk') || a.id.startsWith('plain-')) return;
    const t = document.querySelector(id); if (!t) return;
    e.preventDefault();
    const wasMenu = menu && menu.classList.contains('open');
    if (wasMenu) setMenu(false);
    setTimeout(() => scrollToEl(t), wasMenu ? 350 : 0);
  }));

  /* ---- hero intro ---- */
  const heroLines = $$('.hero-name .ln');
  if (G && !reduce) G.set(heroLines, { '--wi': 62, yPercent: 30, opacity: 0 });
  function heroIntro(){
    if (G && !reduce) G.to(heroLines, { '--wi': 100, yPercent: 0, opacity: 1, duration: 1.4, stagger: .12, ease: 'expo.out' });
  }

  /* ---- start immediately: content is already in the static document ---- */
  const loader = $('#loader');
  if (loader) loader.remove();
  heroIntro();
  setTimeout(initCookie, 800);

  /* ---- gliding text (works without GSAP) ---- */
  const glides = $$('.glide');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    glides.forEach(g => io.observe(g));
  } else glides.forEach(g => g.classList.add('in'));

  /* ---- counting numbers ---- */
  function fmt(v, el){ const d = +el.dataset.dec || 0; return (el.dataset.prefix || '') + v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.dataset.suffix || ''); }
  function countUp(el){
    const to = parseFloat(el.dataset.to); if (isNaN(to)) return;
    if (reduce) { el.textContent = fmt(to, el); return; }
    const t0 = performance.now(), D = Math.min(2300, 650 + Math.log10(Math.max(2, Math.abs(to))) * 470);
    const step = t => { const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(p < 1 && !(+el.dataset.dec) ? Math.round(to * e) : to * e, el); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } }), { threshold: .6 });
    $$('.count').forEach(c => cio.observe(c));
  }
  /* PROOFED stamp on each number */
  $$('.kpi').forEach(k => k.addEventListener('click', () => {
    k.classList.remove('stamped'); void k.offsetWidth; k.classList.add('stamped');
    const c = $('.count', k); c && countUp(c); tick(260, .14, .7);
  }));

  /* ---- lamps ---- */
  $$('.lamp').forEach(b => b.addEventListener('click', () => {
    const sec = b.closest('[data-lamp-scope]'); if (!sec) return;
    const on = !sec.classList.contains('lit');
    sec.classList.toggle('lit', on);
    $$('.lamp', sec).forEach(l => l.setAttribute('aria-pressed', on ? 'true' : 'false'));
    tick(on ? 700 : 500, .07);
  }));

  /* ---- flips ---- */
  $$('.flip-hit').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.closest('.flip'); const on = !f.classList.contains('is-flipped');
    f.classList.toggle('is-flipped', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); tick(1600, .05, .4);
  }));

  /* ---- role drawers + career lanes ---- */
  $$('.seg').forEach(s => s.addEventListener('click', () => {
    const d = document.getElementById(s.dataset.role); if (!d) return;
    if (d.tagName === 'DETAILS') d.open = true;
    d.classList.remove('flash'); void d.offsetWidth; d.classList.add('flash');
    tick(1100, .05); setTimeout(() => scrollToEl(d), 30);
  }));
  let refreshT;
  const refresh = () => { if (!ST) return; clearTimeout(refreshT); refreshT = setTimeout(() => ST.refresh(), 120); };
  $$('details').forEach(d => d.addEventListener('toggle', () => { refresh(); if (d.open) tick(1300, .04, .3); }));

  /* ---- project panel ---- */
  const dlg = $('#proj-dialog'), dbody = $('#proj-dialog-body');
  function setHash(h){ try { history.replaceState(null, '', h || (location.pathname + location.search)); } catch(e){} }
  function openProject(id, push = true){
    const src = document.getElementById('detail-' + id); if (!src || !dlg) return;
    dbody.innerHTML = src.innerHTML;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    lenis && lenis.stop(); if (push) setHash('#project-' + id); tick(1200, .09);
  }
  if (dlg) {
    dlg.addEventListener('close', () => { lenis && lenis.start(); if (location.hash.indexOf('#project-') === 0) setHash(''); });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    $('#proj-dialog-close').addEventListener('click', () => dlg.close ? dlg.close() : dlg.removeAttribute('open'));
  }
  $$('[data-open-project]').forEach(b => b.addEventListener('click', () => openProject(b.dataset.openProject)));
  $$('[data-open-detail]').forEach(b => b.addEventListener('click', () => {
    const t = document.getElementById('detail-' + b.dataset.openDetail); if (!t || !dlg) return;
    dbody.innerHTML = t.innerHTML;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    lenis && lenis.stop(); tick(1200, .09);
  }));
  $$('.step-now').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = $('#role-oki-senior'); scrollToEl(t); }));
  if (location.hash.indexOf('#project-') === 0) openProject(location.hash.slice(9), false);

  /* ---- certification reel: drag sideways ---- */
  const reel = $('#reel');
  if (reel && fine) {
    let down = false, sx = 0, sl = 0, moved = 0;
    reel.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = reel.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 4) reel.classList.add('dragging'); reel.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => reel.classList.remove('dragging'), 0); });
    reel.addEventListener('click', e => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
  }

  /* ---- drawers: skills and certificates ---- */
  $$('[data-drawer]').forEach(dr => {
    const face = $('.dr-face', dr);
    face.addEventListener('click', () => {
      const open = !dr.classList.contains('open');
      dr.classList.toggle('open', open); face.setAttribute('aria-expanded', open ? 'true' : 'false');
      tick(open ? 420 : 360, .16, .45); setTimeout(() => ST && ST.refresh(), 850);
      if (!open) scrollToEl(dr);
    });
  });
  $$('.filters').forEach(fs => {
    const cards = $$('.icard', fs.parentElement);
    $$('.fchip', fs).forEach(c => c.addEventListener('click', () => {
      $$('.fchip', fs).forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      const f = c.dataset.f; cards.forEach(k => k.hidden = !(f === 'all' || k.dataset.f === f));
      tick(1500, .03, .3); setTimeout(() => ST && ST.refresh(), 60);
    }));
  });

  /* ---- contact desk ---- */
  function wire(el, url, missing){
    if (!el) return;
    if (url) { el.href = url; if (/^https?:/.test(url)) { el.target = '_blank'; el.rel = 'noopener'; } }
    else el.addEventListener('click', e => { e.preventDefault(); toast(missing); });
  }
  const mail = CONFIG.email ? 'mailto:' + CONFIG.email : '';
  wire($('#obj-stamp'), mail, 'Email address not added yet. Use LinkedIn for now.');
  wire($('#plain-email'), mail, 'Email address not added yet. Use LinkedIn for now.');
  wire($('#obj-phone'), CONFIG.bookingUrl, 'Booking link not added yet. Use LinkedIn for now.');
  wire($('#plain-booking'), CONFIG.bookingUrl, 'Booking link not added yet. Use LinkedIn for now.');
  const stamp = $('#obj-stamp');
  stamp && stamp.addEventListener('click', () => { stamp.classList.remove('stamping'); void stamp.offsetWidth; stamp.classList.add('stamping'); tick(220, .16, .8); });
  $('#obj-phone') && $('#obj-phone').addEventListener('click', () => tick(2200, .25, .3));

  /* ---- printed sheets (logo click + secret word) ---- */
  const sheet = $('#print-sheet'); let sheetT;
  function printSheet(html){
    if (!sheet) return;
    $('#ps-date').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    $('.ps-body', sheet).innerHTML = html;
    sheet.classList.remove('show'); void sheet.offsetWidth; sheet.classList.add('show');
    tick(3000, .3, .25); clearTimeout(sheetT); sheetT = setTimeout(() => sheet.classList.remove('show'), 5200);
  }
  sheet && sheet.addEventListener('click', () => sheet.classList.remove('show'));
  const logo = $('#logo');
  logo && logo.addEventListener('click', () => {
    scrollToEl($('#top'));
    printSheet('<b>Faraz Ansari</b>Digital Marketing &amp; SEO Specialist | Marketing Automation | AI-Driven Growth Strategies | B2B/B2C Campaign Expert | HubSpot &amp; CRM Optimization');
  });
  $('#to-top') && $('#to-top').addEventListener('click', () => scrollToEl($('#top')));
  let typed = '';
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,textarea,[contenteditable]')) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-24);
    if (typed.endsWith(CONFIG.secretWord)) {
      typed = '';
      printSheet('<b>You found the press room</b>Analytical digital marketing professional with 6+ years of B2B and B2C experience across the UK, EMEA and Asia. Promoted at OKI Europe into integrated campaign ownership and regional delivery. Combines paid media, SEO and HubSpot automation with commercial judgement, audience research and stakeholder coordination. Uses AI tools to improve marketing workflows.');
    }
  });

  /* ---- tab title ---- */
  // Keep the professional page title unchanged when switching tabs.

  /* ---- custom cursor + ink trail (desktop only) ---- */
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('#cur'), cv = $('#ink'), ctx = cv.getContext('2d');
    let W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    let mx = -100, my = -100, cx = -100, cy = -100, lx = null, ly = null;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (!cur.classList.contains('on')) { cx = lx = mx; cy = ly = my; } cur.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    document.addEventListener('pointerover', e => { cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,summary,.flip-hit,.reel'))); });
    const loop = () => {
      cx += (mx - cx) * .38; cy += (my - cy) * .38;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      if (lx !== null && cur.classList.contains('on')) {
        const d = Math.hypot(mx - lx, my - ly);
        if (d > .5) { ctx.strokeStyle = 'rgba(0,174,239,.38)'; ctx.lineWidth = Math.max(.8, 2.6 - d / 22); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(mx, my); ctx.stroke(); }
      }
      lx = mx; ly = my; requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---- cookie banner + GA4 ---- */
  function loadGA(){ window.farazAnalytics?.applyConsent(store.get('fa-consent')); }
  loadGA();
  const ck = $('#cookie');
  function initCookie(){
    const c = store.get('fa-consent');
    if (!c && ck) ck.classList.add('show');
  }
  $('#ck-yes') && $('#ck-yes').addEventListener('click', () => { store.set('fa-consent', 'granted'); window['ga-disable-' + CONFIG.gaId] = false; ck.classList.remove('show'); loadGA();  });
  $('#ck-no') && $('#ck-no').addEventListener('click', () => { store.set('fa-consent', 'denied'); window['ga-disable-' + CONFIG.gaId] = true; ck.classList.remove('show'); loadGA(); });
  $('#cookie-reset') && $('#cookie-reset').addEventListener('click', () => ck && ck.classList.add('show'));

  /* ---- marquee leans with scroll speed ---- */
  if (lenis) {
    const skews = $$('.marquee-skew');
    lenis.on('scroll', ({ velocity }) => { const v = Math.max(-10, Math.min(10, velocity * .35)); skews.forEach(s => s.style.transform = 'skewX(' + (-v) + 'deg)'); });
  }

  /* ---- console note ---- */
  try { console.log('%cFARAZ ANSARI%c\nYou opened the press room. Type "' + CONFIG.secretWord + '" anywhere on the page.', 'font:900 28px Archivo,Arial;letter-spacing:-1px', 'font:14px Arial;color:#00AEEF'); } catch(e){}

  /* =============== scroll choreography (GSAP) =============== */
  if (!G || !ST || reduce) {
    if (reduce || !G) { const p = $('#plane'); if (p) p.style.display = 'none'; }
    return;
  }

  // progress bar (ink level)
  G.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  // hero name stretches as the page feeds through
  G.to('.hero-name', { '--ws': 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  G.to('.wordmark', { '--wd': 125, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // headings: misregistration settles, width stretches
  $$('.sec-head').forEach(h => G.fromTo(h, { '--wd': 62, '--mis': 8 }, { '--wd': 112, '--mis': 0, ease: 'none', scrollTrigger: { trigger: h, start: 'top 96%', end: 'top 40%', scrub: .6 } }));

  // stretches: sections open like a sheet between rollers
  $$('.stretch').forEach(s => G.fromTo(s, { clipPath: 'inset(42% 0% 42% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 20%', scrub: true } }));

  // outlined words drift sideways
  $$('.drift').forEach(d => G.fromTo(d, { xPercent: 6 }, { xPercent: -38, ease: 'none', scrollTrigger: { trigger: d.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  // image slots parallax
  $$('.proj .slot-inner').forEach(s => G.fromTo(s, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: s.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  // career bars print in
  G.from('.seg', { scaleX: 0, duration: 1.1, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '#lanes', start: 'top 80%' } });

  // proofs and swatches fan out
  G.from('.swatch', { y: 40, rotate: (i) => ((i % 3) - 1) * 4, duration: .9, ease: 'power3.out', stagger: .04, scrollTrigger: { trigger: '.swatches', start: 'top 85%' } });

  // work: numbers and the staircase
  G.from('.kc', { y: 40, opacity: 0, duration: .8, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.kcs', start: 'top 82%' } });
  G.from('.mod', { y: 30, opacity: 0, duration: .7, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.mods', start: 'top 85%' } });
  G.from('.log-m', { x: -20, opacity: 0, duration: .6, ease: 'power2.out', stagger: .06, scrollTrigger: { trigger: '.log', start: 'top 88%' } });
  // footer: London rises in layers
  G.from('.sky3 .sk-far', { y: 40, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 30%', scrub: .6 } });
  G.from('.sky3 .sk-mid', { y: 70, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 30%', scrub: .6 } });
  G.from('.sky3 .sk-sun', { y: 90, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 20%', scrub: .6 } });
  G.from('.band', { y: 40, opacity: 0, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.bands', start: 'top 85%' } });

  const mm = G.matchMedia();

  // India: sheets slide sideways while the section holds
  mm.add('(min-width: 1025px)', () => {
    const vp = $('#india-vp'), track = $('#india-track');
    vp.style.overflow = 'visible';
    const dist = () => Math.max(0, track.scrollWidth - vp.clientWidth + 40);
    const tw = G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: vp, start: 'top 18%', end: () => '+=' + dist(), pin: '#india', pinSpacing: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1 } });
    return () => { vp.style.overflow = ''; tw.scrollTrigger && tw.scrollTrigger.kill(); G.set(track, { x: 0 }); };
  });

  // The flight: boarding pass folds into a plane and flies to the UK
  const stage = $('#flight-stage'), plane = $('#plane'), line = $('#route-line');
  if (stage && plane && line) {
    const len = line.getTotalLength ? line.getTotalLength() : 600;
    G.set(line, { strokeDasharray: len, strokeDashoffset: len });
    G.set('.landed > *', { opacity: 0, y: 30 });
    const tl = G.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=230%', invalidateOnRefresh: true, pin: true, scrub: 1, anticipatePin: 1, refreshPriority: 2 } });
    ST.sort();
    tl.to('.pass-top', { rotateX: -178, duration: 1, ease: 'power2.inOut' })
      .to('#pass', { scale: .3, rotate: -14, opacity: 0, duration: .8, ease: 'power2.in' }, '>-0.15')
      .fromTo(plane, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .35 }, '<0.45');
    if (window.MotionPathPlugin) {
      tl.to(plane, { motionPath: { path: '#route', align: '#route', alignOrigin: [.5, .5], autoRotate: true }, duration: 2, ease: 'power1.inOut' }, '>');
    } else {
      tl.to(plane, { xPercent: -320, yPercent: -260, duration: 2, ease: 'power1.inOut' }, '>');
    }
    tl.to(line, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.landed > *', { opacity: 1, y: 0, stagger: .15, duration: .6 }, '>-0.3');
  }

  // fonts change measurements; refresh once they are in
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  addEventListener('load', () => ST.refresh());
})();


(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const refresh = () => { if (ST) ST.refresh(); };

  /* ---- previous roles: bands open and close ---- */
  function setBand(b, on){
    b.classList.toggle('open', on);
    $('.band-head', b).setAttribute('aria-expanded', on ? 'true' : 'false');
    setTimeout(refresh, 620);
  }
  $$('.band').forEach(b => $('.band-head', b).addEventListener('click', () => setBand(b, !b.classList.contains('open'))));
  $$('.seg').forEach(s => s.addEventListener('click', () => {
    const d = document.getElementById(s.dataset.role);
    if (d && d.classList.contains('band')) setBand(d, true);
  }));

  /* ---- a card follows the cursor over each role (mouse only) ---- */
  const fc = $('#fcard');
  if (fc && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tx = 0, ty = 0, x = 0, y = 0, live = false, raf = 0;
    const loop = () => {
      x += (tx - x) * (reduce ? 1 : .16); y += (ty - y) * (reduce ? 1 : .16);
      const r = reduce ? 0 : Math.max(-9, Math.min(9, (tx - x) * .06));
      fc.style.transform = `translate3d(${x + 26}px,${y - 30}px,0) translate(0,-50%) rotate(${r}deg)`;
      if (live || Math.abs(tx - x) > .5) raf = requestAnimationFrame(loop); else raf = 0;
    };
    $$('.band-head').forEach(h => {
      const b = h.closest('.band');
      h.addEventListener('mouseenter', e => {
        const d = b.dataset; tx = x = e.clientX; ty = y = e.clientY;
        fc.style.setProperty('--fcbg', d.fcBg || 'var(--cyan)');
        if (d.img) { fc.classList.add('has-img'); fc.innerHTML = `<img src="${d.img}" alt="${d.fcAlt || ('Work example from ' + d.fcOrg)}"><span class="fc-org">${d.fcOrg}</span>`; }
        else { fc.classList.remove('has-img'); fc.innerHTML = `<span class="fc-org">${d.fcOrg}</span><span class="fc-n">${d.fcN}</span><span class="fc-l">${d.fcL}</span>`; }
        fc.classList.add('on'); live = true; if (!raf) raf = requestAnimationFrame(loop);
      });
      h.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
      h.addEventListener('mouseleave', () => { fc.classList.remove('on'); live = false; });
    });
    addEventListener('scroll', () => { if (live) { fc.classList.remove('on'); live = false; } }, { passive: true });
  }

  /* ---- the lamp over the headline numbers: switches itself on once ---- */
  const hero = $('#top'), plamp = $('.p-lamp'), pend = $('.pendant'), hint = $('.p-hint');
  if (hero && plamp) {
    let touched = false;
    const label = () => { if (hint) hint.innerHTML = hero.classList.contains('lit') ? '<b>Lamp on:</b> the detail behind each number. Tap the lamp to switch off.' : 'Tap the lamp for the detail behind each number.'; };
    plamp.addEventListener('click', e => {
      if (e.isTrusted) touched = true;
      if (pend && !reduce) { pend.classList.remove('swing'); void pend.offsetWidth; pend.classList.add('swing'); }
      setTimeout(label, 0);
    });
    label();
    const kp = $('.kpis', hero);
    if ('IntersectionObserver' in window && kp) {
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return; io.disconnect();
        setTimeout(() => { if (!touched && !hero.classList.contains('lit')) plamp.click(); }, reduce ? 0 : 1100);
      }), { threshold: .25 });
      io.observe(kp);
    } else if (!hero.classList.contains('lit')) plamp.click();
  }

  /* ---- skills: rotating tag sphere ---- */
  const sp = $('.sphere');
  if (sp) {
    const words = $$('span', sp), N = words.length, pts = [];
    for (let i = 0; i < N; i++) {
      const yy = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - yy * yy), th = i * 2.399963;
      pts.push([Math.cos(th) * rr, yy, Math.sin(th) * rr]);
    }
    let W = 0, H = 0, hw = [];
    const size = () => { W = sp.clientWidth; H = sp.clientHeight; hw = words.map(el => el.offsetWidth / 2); };
    size(); addEventListener('resize', size); if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    const baseY = .0042, baseX = .0014;
    let vy = baseY, vx = baseX, drag = false, lx = 0, ly = 0, running = false, front = null;
    function rotate(a, b){
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      for (const p of pts) {
        let [x, y, z] = p;
        const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
        const y2 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
        p[0] = x1; p[1] = y2; p[2] = z2;
      }
    }
    function render(){
      const R = Math.min(W * (W < 900 ? .47 : .44), H * (W < 900 ? .46 : .44));
      let best = -2, bi = -1;
      pts.forEach((p, i) => {
        const k = (p[2] + 1) / 2, sc = W < 900 ? .72 + .5 * k : .58 + .62 * k, el = words[i];
        let X = p[0] * R; const lim = W / 2 - (hw[i] || 0) * sc - 2; if (lim > 0) X = Math.max(-lim, Math.min(lim, X));
        el.style.transform = `translate(-50%,-50%) translate3d(${X.toFixed(1)}px,${(p[1] * R).toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
        el.style.opacity = (.16 + .84 * k * k).toFixed(3);
        el.style.zIndex = Math.round(k * 100);
        if (p[2] > best) { best = p[2]; bi = i; }
      });
      const f = words[bi];
      if (f !== front) { front && front.classList.remove('front'); f && f.classList.add('front'); front = f; }
    }
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0, lastFrame = 0, visible = false;
    function frame(time){
      raf = 0;
      if (!running || !visible || document.hidden) { running = false; lastFrame = 0; return; }
      const step = lastFrame ? Math.min(3, Math.max(.1, (time - lastFrame) / (1000 / 60))) : 1;
      lastFrame = time;
      if (!drag) {
        const ease = 1 - Math.pow(.97, step);
        vy += (baseY - vy) * ease; vx += (baseX - vx) * ease;
        rotate(vy * step, vx * step); render();
      }
      raf = requestAnimationFrame(frame);
    }
    function start(){
      if (motion.matches || !visible || document.hidden || raf) return;
      running = true; lastFrame = 0; raf = requestAnimationFrame(frame);
    }
    function stop(){
      running = false; if (raf) cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    }
    function visibility(on){
      visible = on;
      if (on) { size(); render(); start(); } else stop();
    }
    const check = () => {
      const r = sp.getBoundingClientRect();
      visibility(r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight);
    };
    render();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => visibility(en.isIntersecting)), {threshold:0}).observe(sp);
    } else addEventListener('scroll', check, {passive:true});
    // A restored page may retain the observer's old state but not its RAF callback.
    addEventListener('pageshow', check);
    addEventListener('resize', check);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : check());
    if (motion.addEventListener) motion.addEventListener('change', () => motion.matches ? stop() : check());
    check();
    const clamp = v => Math.max(-.14, Math.min(.14, v));
    let pointer = null, sx = 0, sy = 0, horizontal = false;
    function end() {
      const id = pointer; pointer = null; drag = false; horizontal = false;
      sp.classList.remove('drag');
      if (id !== null && sp.hasPointerCapture?.(id)) sp.releasePointerCapture(id);
      start();
    }
    sp.addEventListener('pointerdown', e => {
      if (pointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pointer = e.pointerId; sx = lx = e.clientX; sy = ly = e.clientY;
      horizontal = e.pointerType === 'mouse';
      // A finger resting here, or beginning a vertical page scroll, is not a spin.
      drag = horizontal;
      if (drag) { sp.classList.add('drag'); sp.setPointerCapture?.(e.pointerId); }
    });
    sp.addEventListener('pointermove', e => {
      if (pointer !== e.pointerId) return;
      if (!horizontal) {
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { end(); return; }
        horizontal = drag = true;
        sp.classList.add('drag'); sp.setPointerCapture?.(e.pointerId);
      }
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      vy = clamp(dx * .0062); vx = clamp(-dy * .0062);
      rotate(vy, vx); render();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => sp.addEventListener(type, e => { if (pointer === e.pointerId) end(); }));
    sp.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !sp.hasPointerCapture?.(e.pointerId)) end(); });
    // A pending touch has no capture until its direction is known.
    ['pointerup', 'pointercancel'].forEach(type => document.addEventListener(type, e => { if (pointer === e.pointerId) end(); }, {passive:true}));
    addEventListener('blur', end);
    addEventListener('pagehide', () => { end(); stop(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) end(); });
  }

  /* ---- recommendations: the line draws itself, quotes arrive as it reaches them ---- */
  if (G && ST && !reduce && $('.tl')) {
    G.fromTo('.tl-line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 72%', end: 'bottom 72%', scrub: .4 } });
    $$('.tl-item').forEach(it => {
      const left = it.classList.contains('tl-l') && innerWidth > 760;
      G.from($('.tl-q', it), { x: left ? -48 : 48, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 74%' } });
      G.from($('.tl-photo', it), { scale: .55, opacity: 0, duration: .7, ease: 'back.out(1.6)', scrollTrigger: { trigger: it, start: 'top 74%' } });
    });
  }

  /* ---- footer: pan from the ghats to London, plane crosses the sky ---- */
  const pano = $('.pano'), sky = $('.sky3');
  if (pano && sky && G && ST && !reduce) {
    pano.classList.add('panning');
    G.to(sky, { x: () => -Math.max(0, sky.getBoundingClientRect().width - pano.clientWidth), ease: 'none',
      scrollTrigger: { trigger: pano, start: 'top 92%', endTrigger: '.foot', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true } });
    if (window.MotionPathPlugin) {
      G.registerPlugin(window.MotionPathPlugin);
      G.fromTo('.sk-plane', { motionPath: { path: '#sk-route', align: '#sk-route', alignOrigin: [.5, .5], autoRotate: true, start: 0, end: 0 } },
        { motionPath: { path: '#sk-route', align: '#sk-route', alignOrigin: [.5, .5], autoRotate: true, start: 0, end: 1 }, ease: 'none',
          scrollTrigger: { trigger: pano, start: 'top 92%', endTrigger: '.foot', end: 'bottom bottom', scrub: .6 } });
    }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh); else refresh();
  setTimeout(refresh, 400);
})();



(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- native cursor comes back whenever a panel or dialog is open ---- */
  const root = document.documentElement;
  const syncDlg = () => root.classList.toggle('dlg-open', $$('dialog').some(d => d.open) || !!$('.menu.open, .menu[aria-hidden="false"]'));
  $$('dialog').forEach(d => new MutationObserver(syncDlg).observe(d, { attributes: true, attributeFilter: ['open'] }));
  document.addEventListener('close', syncDlg, true);

  /* ---- skill cards: hover flips on desktop; on touch, one card open at a time ---- */
  const sw = $$('.swatch .flip');
  const setFlip = (f, on) => { f.classList.toggle('is-flipped', on); const b = $('.flip-hit', f); b && b.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  if (fine) {
    sw.forEach(f => {
      const card = f.closest('.swatch');
      card.addEventListener('mouseenter', () => setFlip(f, true));
      card.addEventListener('mouseleave', () => setFlip(f, false));
      const hit = $('.flip-hit', f);
      // mouse clicks do nothing (hover already flips); keyboard still toggles
      hit && hit.addEventListener('click', e => { if (e.detail > 0) { e.stopImmediatePropagation(); setFlip(f, true); } }, true);
    });
  } else {
    sw.forEach(f => {
      const hit = $('.flip-hit', f);
      hit && hit.addEventListener('click', () => { sw.forEach(o => { if (o !== f && o.classList.contains('is-flipped')) setFlip(o, false); }); }, true);
    });
  }

  /* ---- credential links on the reel become reachable once a label is turned over ---- */
  $$('#reel .label .flip-hit').forEach(h => h.addEventListener('click', () => setTimeout(() => {
    const f = h.closest('.flip'), a = $('.cred', f); if (a) a.tabIndex = f.classList.contains('is-flipped') ? 0 : -1;
  }, 0)));

  /* ---- hero portrait ---- */
  const hp = $('.hero-pic'), h1 = $('.hero-name');
  if (hp) {
    const place = () => { if (h1) hp.style.setProperty('--hp-top', h1.offsetTop + 'px'); };
    place(); addEventListener('resize', place); document.fonts && document.fonts.ready.then(place);
    const tog = () => hp.classList.toggle('on');
    if (!fine) hp.addEventListener('click', tog);
    hp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
  }

  /* ---- Instagram embeds load only when a project panel opens ---- */
  const body = $('#proj-dialog-body');
  const fillIG = () => $$('.ig[data-ig]', body).forEach(box => {
    if ($('iframe', box)) return;
    const f = document.createElement('iframe');
    f.src = box.dataset.ig; f.loading = 'lazy'; f.title = box.dataset.title || 'Instagram post'; f.setAttribute('allowtransparency', 'true'); f.setAttribute('scrolling', 'no');
    f.setAttribute('allow', 'encrypted-media; picture-in-picture; clipboard-write');
    f.addEventListener('load', () => { const l = $('.ig-load', box); l && l.remove(); });
    box.appendChild(f);
  });
  if (body) new MutationObserver(fillIG).observe(body, { childList: true });

  /* ---- services: a job ticket ---- */
  const list = $('#svc-list'), lines = $('#tk-lines'), send = $('#tk-send'), count = $('#tk-count'), ticket = $('#ticket');
  if (list && lines && send) {
    const EMAIL = 'contact@farazansari1701.com';
    const no = $('#tk-no'); if (no) no.textContent = String(new Date().getDate()).padStart(2, '0') + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 90) + 10);
    const boxes = $$('input[type="checkbox"]', list);
    const order = [];
    const build = () => {
      const names = order.filter(n => boxes.find(b => b.value === n && b.checked));
      const name = ($('#tk-name') || {}).value || '', notes = ($('#tk-notes') || {}).value || '';
      const subj = 'Project brief: ' + (names.length ? names.join(', ') : 'marketing support');
      const bodyTxt = 'Hi Faraz,\n\nI would like to talk about:\n' + names.map(n => '- ' + n).join('\n') + (notes ? '\n\nNotes:\n' + notes : '') + '\n\n' + (name ? 'From: ' + name + '\n' : '') + 'Job ticket ' + (no ? no.textContent : '');
      send.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(bodyTxt);
      send.setAttribute('aria-disabled', names.length ? 'false' : 'true');
      count.textContent = names.length;
      ticket.classList.toggle('has', names.length > 0);
      const stub = $('#tk-stub'); if (stub) { $('#stub-n').textContent = names.length; stub.classList.toggle('show', names.length > 0 && !ticketSeen); }
    };
    let ticketSeen = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { ticketSeen = e.isIntersecting; const st = $('#tk-stub'); if (st) st.classList.toggle('show', !ticketSeen && order.length > 0); }), { threshold: .25 }).observe(ticket);
    const render = (added) => {
      const names = order.filter(n => boxes.find(b => b.value === n && b.checked));
      lines.innerHTML = names.length ? '' : '<li class="tk-empty">Nothing on the ticket yet. Tick a service.</li>';
      names.forEach((n, i) => {
        const li = document.createElement('li');
        li.innerHTML = '<i aria-hidden="true"></i><span></span><small class="num"></small>';
        li.children[1].textContent = n; li.children[2].textContent = String(i + 1).padStart(2, '0');
        if (n === added && !reduce) li.classList.add('thump');
        lines.appendChild(li);
      });
      if (added && !reduce) { ticket.classList.remove('jolt'); void ticket.offsetWidth; ticket.classList.add('jolt'); }
      const stub = $('#tk-stub'); if (stub && added) { $('#stub-last').textContent = added; if (!reduce) { stub.classList.remove('thump'); void stub.offsetWidth; stub.classList.add('thump'); } }
      build();
    };
    boxes.forEach(b => b.addEventListener('change', () => {
      const i = order.indexOf(b.value); if (i > -1) order.splice(i, 1);
      if (b.checked) order.push(b.value);
      render(b.checked ? b.value : null);
    }));
    ['#tk-name', '#tk-notes'].forEach(s => { const el = $(s); el && el.addEventListener('input', build); });
    render(null);
  }
})();


(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- chapter openers: ink first, colour as the photo arrives ---- */
  const ops = $$('[data-op] img');
  if (ops.length && !reduce) {
    let raf = 0;
    const paint = () => {
      raf = 0; const vh = innerHeight;
      const visible = ops.map(img => ({img, r:img.parentElement.getBoundingClientRect()}))
        .filter(({r}) => r.bottom >= -50 && r.top <= vh + 50);
      visible.forEach(({img, r}) => {
        const p = Math.min(1, Math.max(0, (vh * .92 - r.top) / (vh * .55)));
        img.style.setProperty('--g', (1 - p).toFixed(3));
      });
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); paint();
  } else ops.forEach(img => img.style.setProperty('--g', '0'));

  /* ---- project panels reuse the image already on the card ---- */
  const pbody = $('#proj-dialog-body');
  const fillPf = () => pbody && $$('img[data-pf]', pbody).forEach(im => { if (!im.getAttribute('src')) { const c = $('.pf[data-pid="' + im.dataset.pf + '"]'); if (c) im.src = c.currentSrc || c.src; } });
  if (pbody) new MutationObserver(fillPf).observe(pbody, { childList: true });

  /* ---- graduation video: plays muted as soon as the section is in view ---- */
  const ph = $('[data-grad]');
  if (ph) {
    const v = $('video', ph), play = $('.g-play', ph), snd = $('.g-snd', ph);
    let userPaused = false, inView = false, loaded = null, blocked = false;
    const load = () => loaded || (loaded = (async () => {
      const u = v.dataset.src;
      if (u.indexOf('data:') === 0) { try { v.src = URL.createObjectURL(await (await fetch(u)).blob()); } catch (e) { v.src = u; } }
      else { v.innerHTML = '<source src="' + u + '" type="video/mp4">' + (v.dataset.alt ? '<source src="' + v.dataset.alt + '" type="video/webm">' : ''); }
      v.muted = true; v.load();
    })());
    const go = () => load().then(() => { const p = v.play(); if (p && p.catch) p.catch(e => { if (e && e.name === 'NotAllowedError') { blocked = true; ph.classList.add('tap'); } }); });
    const sync = () => { ph.classList.toggle('playing', !v.paused); play.setAttribute('aria-label', v.paused ? 'Play the graduation video' : 'Pause the graduation video'); };
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    v.addEventListener('canplay', () => { if (inView && !userPaused && v.paused) go(); });
    play.addEventListener('click', () => { if (v.paused) { userPaused = false; go(); } else { userPaused = true; v.pause(); } });
    snd.addEventListener('click', () => {
      v.muted = !v.muted; snd.setAttribute('aria-pressed', v.muted ? 'false' : 'true'); snd.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
      if (!v.muted && v.paused) { userPaused = false; go(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) load(); }), { rootMargin: '900px 0px' }).observe(ph);
      new IntersectionObserver(es => es.forEach(e => {
        inView = e.isIntersecting;
        if (inView && !userPaused) go();
        if (!inView && !v.paused) v.pause();
      }), { threshold: .3 }).observe(ph);
    } else go();
    /* backup that does not depend on IntersectionObserver: check the scroll position, and if the browser refused to autoplay, start on the first touch or click */
    const visFrac = () => { const r = ph.getBoundingClientRect(); return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / (r.height || 1); };
    setInterval(() => {
      if (document.hidden) return;
      const f = visFrac();
      if (f > .25 && !userPaused && v.paused && !blocked) { inView = true; go(); }
      else if (f < .02 && !v.paused) { inView = false; v.pause(); }
    }, 350);
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, () => {
      if (blocked && !userPaused && v.paused && visFrac() > .25) { blocked = false; ph.classList.remove('tap'); go(); }
    }, { passive: true }));
    v.addEventListener('playing', () => { blocked = false; ph.classList.remove('tap'); });
    sync();
  }

  /* ---- certificates: hover turns them over like the skill cards; tap on touch ---- */
  const fineP = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cf = $$('#cgrid .label .flip');
  const setF = (f, on) => { f.classList.toggle('is-flipped', on); const h = $('.flip-hit', f), a = $('.cred', f); h && h.setAttribute('aria-pressed', on ? 'true' : 'false'); if (a) a.tabIndex = on ? 0 : -1; };
  cf.forEach(f => {
    const card = f.closest('.label'), hit = $('.flip-hit', f);
    if (fineP) {
      card.addEventListener('mouseenter', () => setF(f, true));
      card.addEventListener('mouseleave', () => setF(f, false));
      hit && hit.addEventListener('click', e => { if (e.detail > 0) { e.stopImmediatePropagation(); setF(f, true); } }, true);
    } else hit && hit.addEventListener('click', () => cf.forEach(o => { if (o !== f && o.classList.contains('is-flipped')) setF(o, false); }), true);
  });

  /* ---- pinned certificates: the credential link becomes reachable once a label is turned over ---- */
  $$('#cgrid .label .flip-hit').forEach(h => h.addEventListener('click', () => setTimeout(() => {
    const f = h.closest('.flip'), a = $('.cred', f); if (a) a.tabIndex = f.classList.contains('is-flipped') ? 0 : -1;
  }, 0)));

  /* ---- hidden: three taps on the grade throws the caps ---- */
  const g = $('[data-toss]');
  if (g) {
    let n = 0, tmr = 0;
    const cap = '<svg viewBox="0 0 34 24" aria-hidden="true"><path d="M17 2 33 9 17 16 1 9Z" fill="currentColor"/><path d="M8 12v6c4 3 14 3 18 0v-6" fill="currentColor"/><path d="M30 10v8" stroke="var(--cyan)" stroke-width="2"/></svg>';
    const toss = () => {
      const box = g.parentElement; box.style.position = box.style.position || 'relative';
      const note = document.createElement('span'); note.className = 'toss-note'; note.textContent = 'Class of 2021'; box.appendChild(note); setTimeout(() => note.remove(), 2300);
      if (reduce) return;
      for (let i = 0; i < 6; i++) {
        const c = document.createElement('span'); c.className = 'toss'; c.innerHTML = cap;
        c.style.left = (15 + Math.random() * 60) + '%'; c.style.top = '60%'; box.appendChild(c);
        const dx = (Math.random() - .5) * 160, up = 140 + Math.random() * 120, rot = (Math.random() - .5) * 720;
        c.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${dx * .6}px,${-up}px) rotate(${rot * .6}deg)`, opacity: 1, offset: .45 }, { transform: `translate(${dx}px,${-up * .2}px) rotate(${rot}deg)`, opacity: 0 }],
          { duration: 1500 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)', delay: i * 60 }).onfinish = () => c.remove();
      }
    };
    const hit = () => { n++; clearTimeout(tmr); tmr = setTimeout(() => n = 0, 700); if (n >= 3) { n = 0; toss(); } };
    g.addEventListener('click', hit);
    g.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); toss(); } });
  }

  /* ---- hidden: a note for whoever opens the console ---- */
  try {
    console.log('%cRegistered.%c\nYou found the back of the print. This page was set like a print job: cyan, magenta, yellow and black.\nType the word "print" anywhere on the page, or tap the MBA grade three times.\nSay hello: contact@farazansari1701.com',
      'font:800 22px system-ui;color:#00AEEF', 'font:500 13px system-ui;color:inherit');
  } catch (e) {}
})();

