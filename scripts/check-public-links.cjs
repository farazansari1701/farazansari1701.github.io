'use strict';

// Regression checks for the public site's local files and primary contact journeys.
// External services (email delivery, Calendly availability, social logins) are not
// tested here; this checks only link targets and the committed site structure.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const problems = [];
let htmlFiles = 0;
let certificateLinks = 0;

function rootPath(relative) {
  return path.join(root, relative);
}
function read(relative) {
  return fs.readFileSync(rootPath(relative), 'utf8');
}
function fail(message) {
  problems.push(message);
}
function htmlPathsIn(relative) {
  const location = rootPath(relative);
  if (!fs.existsSync(location)) return [];
  const found = [];
  for (const item of fs.readdirSync(location, { withFileTypes: true })) {
    const nested = path.posix.join(relative, item.name);
    if (item.isDirectory()) found.push(...htmlPathsIn(nested));
    else if (item.isFile() && item.name.endsWith('.html')) found.push(nested);
  }
  return found;
}

if (fs.existsSync(rootPath('blogs'))) {
  fail('The removed legacy /blogs/ directory has been recreated.');
}

const pages = [...new Set([
  'index.html',
  'faraz-site/index.html',
  '404.html',
  'faraz-site/404.html',
  'privacy/index.html',
  ...htmlPathsIn('blog')
])];

const requiredHomeLinks = [
  'mailto:contact@farazansari1701.com',
  'https://www.linkedin.com/in/farazansari1701/',
  'https://calendly.com/farazansari1701/30min',
  '/assets/Faraz-Ansari-CV.pdf',
  '/blog/'
];

for (const page of pages) {
  if (!fs.existsSync(rootPath(page))) {
    fail('Missing expected page: ' + page);
    continue;
  }
  htmlFiles++;
  const content = read(page);
  const refs = [...content.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)]
    .map(match => match[2]);

  if (page === 'index.html' || page === 'faraz-site/index.html') {
    for (const href of requiredHomeLinks) {
      if (!refs.includes(href)) fail(page + ' is missing primary link ' + href);
    }
    const emailLinks = refs.filter(href => href.startsWith('mailto:'));
    if (emailLinks.some(href => !href.startsWith('mailto:contact@farazansari1701.com'))) {
      fail(page + ' contains an unexpected contact email destination.');
    }
  }

  for (const href of refs) {
    if (/^\/blogs(?:\/|$)/i.test(href) ||
        /^https?:\/\/(?:www\.)?farazansari1701\.com\/blogs(?:\/|$)/i.test(href)) {
      fail(page + ' links to removed plural blog path ' + href);
    }
    const asset = href.split(/[?#]/, 1)[0];
    if (!asset.startsWith('/assets/certificates/') &&
        asset !== '/assets/Faraz-Ansari-CV.pdf') continue;
    const relative = asset.slice(1);
    const local = rootPath(relative);
    if (!fs.existsSync(local)) {
      fail(page + ' points to missing asset ' + asset);
      continue;
    }
    const contents = fs.readFileSync(local);
    if (contents.length < 100) {
      fail(page + ' points to unexpectedly small asset ' + asset);
      continue;
    }
    if (asset.toLowerCase().endsWith('.pdf') &&
        !contents.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
      fail(page + ' points to a non-PDF file ' + asset);
    }
    if (asset.startsWith('/assets/certificates/')) certificateLinks++;
  }
}

for (const relative of ['blog/posts.json', 'sitemap.xml']) {
  const text = read(relative);
  if (/https?:\/\/farazansari1701\.com\/blogs\/|["']\/blogs\//i.test(text)) {
    fail(relative + ' contains a legacy public plural-blog URL.');
  }
}

if (problems.length) {
  for (const message of problems) console.error('FAIL ' + message);
  process.exitCode = 1;
} else {
  console.log('Public link checks passed: ' + htmlFiles +
    ' HTML pages, ' + certificateLinks +
    ' certificate-asset references, main contact/booking/CV links, and singular /blog/ URLs.');
  console.log('Note: external service reachability and email delivery require separate tests.');
}
