'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/portfolio-responsive.css'),'utf8');
const js=fs.readFileSync(path.join(root,'assets/portfolio.js'),'utf8');
const minCss=fs.readFileSync(path.join(root,'assets/portfolio.min.css'),'utf8');
const build=fs.readFileSync(path.join(root,'scripts/build-blog-assets.cjs'),'utf8');
assert(html.length<290000,'Homepage HTML exceeds 290 KB source budget');
assert(minCss.length>75000,'External stylesheet appears incomplete');
assert(html.includes('data-portfolio href="/assets/portfolio.min.css?v='),
 'Homepage needs a versioned external stylesheet');
assert(!html.includes('<style data-portfolio>'),'Large CSS must not be embedded');
assert(build.includes('portfolioCssUrl'),'Build must preserve external CSS');
assert.match(html,/<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">/);
assert.match(html,/<nav class="menu" id="menu" aria-hidden="true" inert /,
 'Closed overlay must be inert before JS initialises');
assert.match(fs.readFileSync(path.join(root,'assets/site-menu.js'),'utf8'),/site-menu:toggle/,
 'Shared menu controller must emit the state event');
assert.match(js,/site-menu:toggle/,
 'Homepage smooth-scroll effects must subscribe to shared menu state');
assert.doesNotMatch(js,/function setMenu\(/,
 'Homepage must not own an independent menu controller');
assert.match(js,/lenis\.stop\(\)/,
 'Homepage must stop smooth scrolling while menu is open');
const sharedMenu=fs.readFileSync(path.join(root,'assets/site-menu.js'),'utf8');
assert.match(sharedMenu,/menu\.inert=!next/,'Shared menu must control inert state');
assert.match(sharedMenu,/button\.setAttribute\('aria-expanded'/,'Shared menu must expose expanded state');
assert.match(sharedMenu,/event\.key==='Escape'/,'Escape should close menu');
assert.match(sharedMenu,/event\.key!=='Tab'/,'Menu should trap keyboard focus');
assert.match(css,/@media\(max-width:390px\)/,'Narrow-screen header guard missing');
assert.match(css,/\.top \.logo span\{[^}]*text-overflow:ellipsis/,'Brand overflow guard missing');
assert.match(css,/\.hero-name\{[^}]*font-size:clamp\(/,'Responsive hero font missing');
assert.match(css,/prefers-reduced-motion:reduce/,'Reduced-motion CSS missing');
const images=[...html.matchAll(/<img\b[^>]*>/gi)].map(x=>x[0]);
assert(images.length>=30,'Homepage images unexpectedly removed');
assert(images.every(img=>/\balt=/.test(img)),'Image missing alt');
assert(images.filter(img=>/loading="lazy"/.test(img)).length>=20,'Deferred image loading coverage has regressed');
assert(/src="\/assets\/portfolio\.min\.js\?v=[0-9a-f]{12}" defer/.test(html),
 'Portfolio interactions must be deferred');
console.log('PASS mobile/performance source contract: HTML budget, cached CSS, accessible menu, narrow-screen rules, lazy images and reduced motion');
