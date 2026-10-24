'use strict';
// Guard both published homepage entry points against the older staggered project layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'assets/project-grid.css'), 'utf8');
const href = '/assets/project-grid.css?v=20261024-1';
assert.match(css, /#projects\s*>\s*\.proj-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
assert.match(css, /@media\s*\(max-width:\s*1099px\)[\s\S]*?repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
assert.match(css, /#projects\s*>\s*\.proj-grid\s*>\s*\.proj\s*\{[^}]*grid-column:\s*auto/);
assert.doesNotMatch(css, /\.face\.back\s*\{[^}]*position:\s*absolute/);
const pages = ['index.html', 'faraz-site/index.html'];
const signatures = [];
for (const page of pages) {
  const content = fs.readFileSync(path.join(root, page), 'utf8');
  const n = content.split(href).length - 1;
  assert.equal(n, 1, page + ': expected one versioned project stylesheet link');
  assert.doesNotMatch(content, /<style\s+data-projects-three-across>/i, page + ': stale inline override');
  assert.match(content, /<section\s+class="sec s-ink"\s+id="projects">/);
  const primary = content.slice(content.indexOf('<div class="proj-grid">'), content.indexOf('<details class="website-projects-disclosure"'));
  const cards = [...primary.matchAll(/<article class="proj glide">/g)].length;
  const actions = [...primary.matchAll(/data-open-project="/g)].length;
  assert.equal(cards, 6, page + ': expected six original primary cards');
  assert.equal(actions, 6, page + ': project detail actions changed');
  for (const text of ['OKI Warranty Services', 'MyOKI localised campaigns', 'B433/B513 product launch', 'OKI Consumable Recycling', 'Soldiering On Awards']) {
    assert.ok(primary.includes(text), page + ': missing original project ' + text);
  }
  signatures.push(primary);
}
assert.equal(signatures[0], signatures[1], 'The two published homepages have different primary project markup');
console.log('Project grid checks passed: 6 original cards + details preserved; both homepages use 3/2/1 responsive styling.');
