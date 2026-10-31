'use strict';
// Validate visible website date and copy formatting across all published pages.
// Official credential titles, URLs and approved article prose are preserved.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const excluded = new Set(['.git', '.github', 'node_modules', 'templates', 'blogs', '.venv', 'venv']);
function published(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    if (entry.isDirectory()) return excluded.has(entry.name) ? [] : published(path.join(directory, entry.name));
    return entry.isFile() && entry.name.endsWith('.html') ? [path.join(directory, entry.name)] : [];
  });
}
const errors = [];
const pages = published(root);
const yearRange = /\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2})\b/g;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  // Ignore CSS, JSON metadata, hidden SVG artwork, comments, tag attributes and URLs.
  const visible = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const match of visible.matchAll(yearRange)) {
    if (Number(match[1]) > Number(match[2])) {
      errors.push(relative + ': descending chronological range ' + match[0]);
    }
  }
}
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(home.includes('<b>Education</b><span class="num">2019 – 2021</span>'),
  'UK education must show 2019 – 2021');
assert(home.includes('<b>Education &amp; early career</b><span class="num">2009 – 2019</span>'),
  'India education and early career must show 2009 – 2019');
assert(!/\bGrade (?:10th|12th)\b/.test(home), 'School year labels use ordinal grade wording');
assert(!home.includes('HubSpot &amp; CRM Optimization'),
  'Use British-English Optimisation in homepage descriptive copy');
const months = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec';
const mixedMonthSeparator = new RegExp(
  '\\b(?:' + months + ')\\s+(?:19|20)\\d{2}\\s+-\\s+(?:(?:' +
  months + ')\\s+(?:19|20)\\d{2}|Present)\\b', 'g'
);
assert(!mixedMonthSeparator.test(home),
  'Use an en dash consistently between work-history month and year ranges');
if (errors.length) {
  for (const error of errors) console.error('FAIL ' + error);
  process.exitCode = 1;
} else {
  console.log('PASS content consistency across ' + pages.length +
    ' published HTML pages: chronological year ranges, UK/India education,' +
    ' work dates, grade labels and British-English profile terminology.');
}
