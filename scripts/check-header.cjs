'use strict';
// Ensure the homepage registration mark and style apply to all existing and future pages.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const homepage=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mark=homepage.match(/<symbol id="reg" viewBox="0 0 24 24">([\s\S]*?)<\/symbol>/)?.[1];
assert(mark,'Homepage logo symbol is missing');
const css=fs.readFileSync(path.join(root,'assets/shared-header.css'),'utf8');
const hash=crypto.createHash('sha256').update(css).digest('hex').slice(0,12);
const cssLink='/assets/shared-header.css?v='+hash;
assert.match(css,/body>header\.site-header/);
assert.match(css,/site-menu-icon/);
assert.match(css,/@media\(max-width:760px\)/);
assert.match(css,/mix-blend-mode:normal/);
// Regression: missing semicolons collapsed the desktop nav links together.
assert.match(css,/\.site-nav\{[^}]*gap:\s*22px\s*;\s*justify-content:flex-end/s);
assert.match(css,/cursor:pointer!important\s*;\s*min-height:44px/s);
assert.doesNotMatch(css,/22pxjustify-content|important\s*\nmin-height/);
// Regression: padding on main created a white strip above dark case studies.
assert.match(css,/body>header\.site-header\+main\{padding-top:0!important\}/);
assert.match(css,/body>header\.site-header\+main>\.hero:not\(\.sec\)/);
assert.match(css,/body>header\.site-header\+main>\.wrap/);
assert.doesNotMatch(css,/body>header\.site-header\+main\{padding-top:76px!important\}/);
const excluded=new Set(['.git','node_modules','templates','.venv','venv']);
function allHtml(dir,rel=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
 const full=path.join(dir,item.name),part=path.posix.join(rel,item.name);
 return item.isDirectory()&&!excluded.has(item.name)?allHtml(full,part):item.isFile()&&item.name.endsWith('.html')?[part]:[];
});}
const paths=allHtml(root).sort();
const required={
 'blog/index.html':['/#work','/blog/','/assets/Faraz-Ansari-CV.pdf'],
 'projects/index.html':['/#projects','/blog/','/assets/Faraz-Ansari-CV.pdf'],
 'projects/soldiering-on-awards/index.html':['/#projects','/projects/','/blog/'],
 'privacy/index.html':['/','/blog/','mailto:contact@farazansari1701.com']
};
let checked=0;
for(const p of paths){
 const html=fs.readFileSync(path.join(root,p),'utf8');
 if(p==='index.html'||p==='faraz-site/index.html'){
  assert.match(html,/<header class="top">/,'Canonical homepage header missing');
  continue;
 }
 assert.equal(html.split(cssLink).length-1,1,p+' should use the shared homepage header CSS once');
 const beforeMain=html.slice(0,html.indexOf('<main'));
 const matches=[...beforeMain.matchAll(/<header class="site-header">[\s\S]*?<\/header>/g)];
 assert.equal(matches.length,1,p+' requires exactly one canonical site header');
 const h=matches[0][0];
 assert(h.includes(mark),p+' logo does not match homepage registration mark');
 assert(h.includes('<a class="brand" href="/"><svg viewBox="0 0 24 24"'),p+' logo markup incorrect');
 assert(!h.includes('<span class="mark"'),p+' has a legacy mark');
 const primary=h.match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
 const dropdown=h.match(/<nav class="site-menu-links"[^>]*>([\s\S]*?)<\/nav>/);
 if(primary){
  assert(dropdown,p+' lacks working native mobile navigation');
  assert.equal(primary[1],dropdown[1],p+' mobile navigation links differ');
  assert.match(h,/<details class="site-head-menu"><summary>/,p+' missing native navigation toggle');
 } else { assert(!dropdown,p+' should not add navigation links absent from original page'); }
 for(const url of required[p]||[])assert(h.includes('href="'+url+'"'),p+' missing original navigation href '+url);
 checked++;
}
assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'faraz-site/index.html'),'utf8'));
console.log('PASS homepage-style registration mark, navigation, mobile dropdown and shared CSS on '+checked+' pages');
