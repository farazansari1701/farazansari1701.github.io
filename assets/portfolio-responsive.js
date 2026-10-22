/* Progressive, mobile-only disclosure: the full content remains without JS. */
(() => {
  const mobile = matchMedia('(max-width:760px)');
  const groups = [];
  let serial = 0;
  // Disclosures change the document flow after the inline timelines initialise.
  // Measure after those changes have rendered, including the first mobile load.
  const refresh = () => window.ScrollTrigger?.refresh(true);
  function disclose(container, nodes, label, more = 'Read More', less = 'Read Less', after = false) {
    if (!container || !nodes.length) return;
    const extra = document.createElement('div');
    extra.className = 'mobile-extra'; extra.id = 'mobile-extra-' + (++serial);
    nodes[0].before(extra); nodes.forEach(node => extra.appendChild(node));
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'mobile-more-control';
    button.setAttribute('aria-controls', extra.id);
    const group = {extra, button, open:false};
    function sync() {
      extra.hidden = mobile.matches && !group.open;
      button.hidden = !mobile.matches;
      button.setAttribute('aria-expanded', String(!extra.hidden));
      button.textContent = group.open ? less : more;
      button.setAttribute('aria-label', (group.open ? less : more) + ': ' + label);
    }
    button.addEventListener('click', () => {
      group.open = !group.open; sync();
      // Keep focus on the control when content above it collapses.
      if (!group.open) button.focus({preventScroll:true});
      refresh();
    });
    if (after) container.after(button); else extra.after(button);
    group.sync = sync; groups.push(group); sync();
  }
  function textGroup(selector, label) {
    const container = document.querySelector(selector);
    if (!container) return;
    const first = Array.from(container.children).find(node => node.tagName === 'P');
    if (!first) return;
    const rest = []; let next = first.nextElementSibling;
    while (next) {rest.push(next); next = next.nextElementSibling;}
    disclose(container, rest, label);
  }
  textGroup('.about-me', 'About me');
  textGroup('#study .op-story .story', 'The Next Chapter');
  textGroup('.mba-note .note', 'A note on the MBA');
  document.querySelectorAll('.vol.vol4>article').forEach((article, index) => {
    const paragraphs = Array.from(article.children).filter(node => node.tagName === 'P');
    disclose(article, paragraphs.slice(1), article.querySelector('h3')?.textContent || 'Volunteering ' + (index + 1));
  });
  const skills = document.querySelector('#skills .swatches');
  if (skills) disclose(skills, Array.from(skills.children).slice(4), 'Skills', 'View All Skills', 'Show Fewer Skills', true);
  const certificates = document.getElementById('cgrid');
  if (certificates) disclose(certificates, Array.from(certificates.children).slice(4), 'Certifications', 'View All Certifications', 'Show Fewer Certifications', true);
  function resize() {
    groups.forEach(group => {if (!mobile.matches) group.open = false; group.sync();});
    refresh();
  }
  if (mobile.addEventListener) mobile.addEventListener('change', resize);
  else mobile.addListener(resize);
  refresh();
})();
