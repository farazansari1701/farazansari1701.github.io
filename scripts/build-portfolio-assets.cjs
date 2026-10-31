// Rebuild only the portfolio, using the same esbuild settings as the full site
// build. Blog content, measurement, consent and analytics assets are untouched.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const write = (name, content) => fs.writeFileSync(path.join(root, name), content);
const hash = content => crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
let html = read('index.html');
for (const source of ['portfolio.js', 'portfolio-responsive.js', 'portfolio-responsive.css']) {
  const ext = path.extname(source).slice(1);
  const name = source.replace(/\.(js|css)$/, '.min.$1');
  const output = esbuild.transformSync(read('assets/' + source), {
    loader: ext, minify: true, target: ext === 'js' ? 'es2020' : undefined,
    legalComments: 'none', charset: 'utf8'
  }).code;
  write('assets/' + name, output);
  const pattern = new RegExp('/assets/' + name.replace(/\./g, '\\.') + '(?:\\?[^"\\s<>]*)?', 'g');
  html = html.replace(pattern, '/assets/' + name + '?v=' + hash(output));
}
const css = esbuild.transformSync(read('assets/portfolio.css'), {
  loader: 'css', minify: true, legalComments: 'none', charset: 'utf8'
}).code;
write('assets/portfolio.min.css', css);
const cssUrl = '/assets/portfolio.min.css?v=' + hash(css);
const cssSlot = /<style data-portfolio>[\s\S]*?<\/style>|<link\b(?=[^>]*\bdata-portfolio\b)[^>]*>/;
if (!cssSlot.test(html)) throw new Error('Missing portfolio CSS build slot');
html = html.replace(cssSlot, () => '<link rel="stylesheet" data-portfolio href="' + cssUrl + '">');
write('index.html', html);
console.log('Rebuilt canonical portfolio homepage and minified assets with esbuild.');
