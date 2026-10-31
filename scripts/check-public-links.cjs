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

const aliases=new Map([['blogs/index.html','/blog/'],['blogs/about/index.html','/blog/about/'],['blogs/hubspot-marketing-automation-lessons-oki/index.html','/blog/hubspot-marketing-automation-lessons-oki/'],['blogs/topics/marketing-automation/index.html','/blog/topics/marketing-automation/']]);
const found=htmlPathsIn('blogs').sort();
if(JSON.stringify(found)!==JSON.stringify([...aliases.keys()].sort()))fail('Unexpected plural blog aliases');
for(const [file,target] of aliases){const html=read(file),dest='https://farazansari1701.com'+target;if(!html.includes('content="0;url='+dest+'"')||!html.includes('href="'+dest+'"')||!html.includes('noindex,follow'))fail('Invalid redirect '+file);}

// Guard approved essay source URLs against regressing on future builds.
const essaySources=JSON.parse(read('blog/content/who-owns-the-words-we-speak.json')).sources;
const essayHtml=read('blog/who-owns-the-words-we-speak/index.html');
for(const url of [
 'https://www.lib.uchicago.edu/collex/exhibits/james-baldwin-among-philosophers/the-welcome-table-1970s-1980s/',
 'https://rajbhasha.gov.in/en/bharat-samhita-code-of-india-'
]){
 if(!essaySources.some(s=>s.url===url)||!essayHtml.includes('href="'+url+'"'))
   fail('Missing corrected language essay source '+url);
}
for(const old of [
 'https://digfir-published.macmillanusa.com/readwrite/readwrite_ch52_3.html',
 'https://rajbhasha.gov.in/en/official-language-policy-union'
]){
 if(essaySources.some(s=>s.url===old)||essayHtml.includes(old))
   fail('Broken language essay source reintroduced '+old);
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

// Project case studies must never fall out of the sitemap after a new page
// is published. Verify all canonical, indexable project pages, not a hard-coded
// list of today's three missing entries.
const sitemapLocations=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const projectPages=htmlPathsIn('projects');
for(const file of projectPages){
  const html=read(file);
  const url='https://farazansari1701.com/'+file.replace(/index\.html$/,'');
  const count=sitemapLocations.filter(loc=>loc===url).length;
  const noindex=/<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(html);
  if(noindex){
    if(count!==0)fail(file+' is noindex but still appears in the sitemap');
    continue;
  }
  if(!html.includes('<link rel="canonical" href="'+url+'">'))
    fail(file+' missing self-referencing canonical: '+url);
  if(count!==1)
    fail(file+' must appear exactly once in the sitemap (found '+count+'): '+url);
}
if(new Set(sitemapLocations).size!==sitemapLocations.length)
  fail('Duplicate URL entries found in sitemap.xml');

for (const relative of ['blog/posts.json', 'sitemap.xml']) {
  const text = read(relative);
  if (/https?:\/\/farazansari1701\.com\/blogs\/|["']\/blogs\//i.test(text)) {
    fail(relative + ' contains a legacy public plural-blog URL.');
  }
}

for (const page of ['index.html', 'faraz-site/index.html']) {
  const html = read(page);
  if (!html.includes('href="/assets/certificates/microsoft-advertising-certified-professional-2021.pdf"')) {
    fail(page + ' must link to the original December 2021 Microsoft certificate PDF.');
  }
  if (!html.includes('data-to="65">65') || !html.includes('data-to="57">57')) {
    fail(page + ' has out-of-date certification counters.');
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
