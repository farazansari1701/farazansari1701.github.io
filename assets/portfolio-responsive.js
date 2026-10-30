/* Phone enhancements leave the original document intact above 760px. */
(() => {
  const phone = matchMedia('(max-width:760px)');
  const cleanups = [];
  let serial = 0, frame = 0;

  // Wait for changed content to take part in layout before measuring scroll pins.
  function refresh() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        window.ScrollTrigger?.refresh(true);
        document.dispatchEvent(new Event('portfolio:layout'));
      });
    });
  }

  function setText(node, text) {
    if (!node) return;
    const original = node.textContent;
    node.textContent = text;
    cleanups.push(() => { node.textContent = original; });
  }

  function teaserText(paragraph) {
    const text = paragraph.textContent.replace(/\s+/g, ' ').trim();
    const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || text;
    if (firstSentence.length <= 190) return firstSentence;
    // An exact, word-boundary excerpt also works for a one-paragraph card.
    return firstSentence.slice(0, 162).replace(/\s+\S*$/, '').replace(/[,;:]$/, '') + '…';
  }

  function disclose(container, label) {
    if (!container) return;
    const children = Array.from(container.children);
    const first = children.findIndex(node => node.tagName === 'P');
    if (first < 0) return;
    const nodes = children.slice(first);
    const teaser = document.createElement('p');
    teaser.className = 'mobile-teaser';
    teaser.textContent = teaserText(nodes[0]);
    const extra = document.createElement('div');
    extra.className = 'mobile-extra';
    extra.id = 'mobile-extra-' + (++serial);
    extra.hidden = true;
    nodes[0].before(teaser, extra);
    nodes.forEach(node => extra.appendChild(node));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-more-control';
    button.setAttribute('aria-controls', extra.id);
    extra.after(button);
    function sync(open) {
      extra.hidden = !open;
      teaser.hidden = open;
      button.textContent = open ? 'Show less' : 'Read more';
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', button.textContent + ': ' + label);
    }
    button.addEventListener('click', () => {
      const open = extra.hidden;
      sync(open);
      if (!open) button.focus({preventScroll:true});
      refresh();
    });
    sync(false);
    cleanups.push(() => {
      nodes.forEach(node => extra.before(node));
      teaser.remove(); extra.remove(); button.remove();
    });
  }

  function drawerCards(gridSelector, drawerSelector, heading, certificate = false) {
    const grid = document.querySelector(gridSelector);
    const drawer = document.querySelector(drawerSelector);
    const inner = drawer?.querySelector('.dr-inner');
    if (!grid || !inner) return;
    const cards = Array.from(grid.children).filter(node => node.tagName === 'ARTICLE').slice(4);
    if (!cards.length) return;
    const section = document.createElement('section');
    section.className = 'mobile-drawer-featured';
    const title = document.createElement('h3');
    title.className = 'mobile-drawer-heading';
    title.textContent = heading;
    const extra = document.createElement('div');
    extra.className = 'mobile-drawer-cards ' + (certificate ? 'cgrid' : 'swatches');
    section.append(title, extra);
    const filters = certificate && inner.querySelector('.filters');
    if (filters) filters.after(section); else inner.prepend(section);
    const positions = cards.map(card => {
      const marker = document.createComment('phone card position');
      card.before(marker); extra.appendChild(card);
      return {card, marker, hidden:card.hidden};
    });

    const count = drawer.querySelector('.dr-count');
    if (count) {
      const originalTarget = count.dataset.to;
      const originalCount = count.textContent;
      const total = Number(originalTarget) + cards.length;
      count.dataset.to = String(total);
      count.textContent = String(total);
      cleanups.push(() => { count.dataset.to = originalTarget; count.textContent = originalCount; });
      setText(drawer.querySelector('.dr-card small'), 'The other ' + total);
    }

    // Closed drawer content must not be reachable by keyboard on phones.
    const body = drawer.querySelector('.dr-body');
    const wasInert = body.inert;
    const syncDrawer = () => { body.inert = !drawer.classList.contains('open'); };
    const observer = new MutationObserver(syncDrawer);
    observer.observe(drawer, {attributes:true, attributeFilter:['class']});
    syncDrawer();

    let filterCards;
    if (filters) {
      const issuers = cards.map(card => {
        const issuer = card.querySelector('.iss')?.textContent.toLowerCase() || '';
        return ['google', 'microsoft', 'anthropic', 'hubspot', 'linkedin'].find(name => issuer.includes(name)) || '';
      });
      filters.querySelectorAll('.fchip').forEach(chip => {
        const n = chip.querySelector('.num');
        const added = issuers.filter(issuer => chip.dataset.f === 'all' || issuer === chip.dataset.f).length;
        if (n && added) setText(n, String(Number(n.textContent) + added));
      });
      filterCards = () => {
        const active = filters.querySelector('.fchip.on')?.dataset.f || 'all';
        cards.forEach((card, index) => { card.hidden = active !== 'all' && issuers[index] !== active; });
        section.hidden = cards.every(card => card.hidden);
        refresh();
      };
      filters.addEventListener('click', filterCards);
      filterCards();
    }

    cleanups.push(() => {
      observer.disconnect(); body.inert = wasInert;
      if (filterCards) filters.removeEventListener('click', filterCards);
      positions.forEach(({card, marker, hidden}) => { card.hidden = hidden; marker.replaceWith(card); });
      section.remove();
    });
  }

  function sync() {
    while (cleanups.length) cleanups.pop()();
    if (phone.matches) {
      disclose(document.querySelector('.about-me'), 'About me');
      disclose(document.querySelector('#study .op-story .story'), 'The Next Chapter');
      disclose(document.querySelector('.mba-note .note'), 'My MBA at ARU, Cambridge');
      document.querySelectorAll('.vol.vol4>article').forEach((article, index) => {
        disclose(article, article.querySelector('h3')?.textContent || 'Volunteering ' + (index + 1));
      });
      drawerCards('#skills>.swatches', '#skills-drawer', 'More core skills');
      drawerCards('#cgrid', '#tray', 'More featured credentials', true);
      const skillsIntro = document.querySelector('#skills>p.col');
      setText(skillsIntro, 'Four core skills are featured below. Open the drawer for the rest of the twelve core skill cards and the full skills list.');
      const certIntro = document.querySelector('#certifications .c-head>p');
      certIntro?.childNodes.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.includes('Eight featured credentials')) return;
        setText(node, node.textContent.replace('Eight featured credentials appear below, with the other 57 in the drawer.', 'Four featured credentials appear below, with the other 61 in the drawer.'));
      });
    }
    refresh();
  }

  if (phone.matches) sync();
  if (phone.addEventListener) phone.addEventListener('change', sync);
  else phone.addListener(sync);
})();
