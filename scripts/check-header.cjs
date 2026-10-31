'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mark=home.match(/<symbol id="reg" viewBox="0 0 24 24">([\s\S]*?)<\/symbol>/)?.[1];
const original=home.match(/<nav class="menu" id="menu"[\s\S]*?<\/nav>\s*<\/div>\s*<\/nav>/)?.[0];
const button=home.match(/<button class="tbtn" id="menu-btn"[\s\S]*?<\/button>/)?.[0];
assert(mark&&original&&button,'Canonical homepage header/menu missing');
const expected=original.replace(/href="#([A-Za-z][\w-]*)"/g,'href="/#$1"')
  .replace('id="menu" data-lenis-prevent','id="menu" aria-hidden="true" inert data-lenis-prevent');
const css=fs.readFileSync(path.join(root,'assets/shared-header.css'),'utf8');
const cssVersion=crypto.createHash('sha256').update(css).digest('hex').slice(0,12);
const js=fs.readFileSync(path.join(root,'assets/site-menu.js'),'utf8');
const jsVersion=crypto.createHash('sha256').update(js).digest('hex').slice(0,12);
assert.match(css,/body>header\.site-header/);
assert.match(css,/body>nav#menu\{/);
assert.match(css,/body>nav#menu\.open\{/);
assert.match(css,/body>nav#menu li a::before/);
assert.match(css,/\.menu-scroll/);
assert.match(css,/\.site-nav\{[^}]*gap:\s*22px\s*;\s*justify-content:flex-end/s);
assert.match(css,/cursor:pointer!important\s*;\s*min-height:44px/s);
assert.match(css,/body>header\.site-header\+main\{padding-top:0!important\}/);
const excluded=new Set(['.git','node_modules','templates','.venv','venv']);
function allHtml(dir,rel=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
 const full=path.join(dir,item.name),part=path.posix.join(rel,item.name);
 return item.isDirectory()&&!excluded.has(item.name)?allHtml(full,part):item.isFile()&&item.name.endsWith('.html')?[part]:[];
});}
const required={
 'blog/index.html':['/#work','/blog/','/assets/Faraz-Ansari-CV.pdf'],
 'projects/index.html':['/#projects','/blog/','/assets/Faraz-Ansari-CV.pdf'],
 'projects/soldiering-on-awards/index.html':['/#projects','/projects/','/blog/'],
 'privacy/index.html':['/','/blog/','mailto:contact@farazansari1701.com']
};
let count=0;
for(const p of allHtml(root)){
 const html=fs.readFileSync(path.join(root,p),'utf8');
 if(p==='index.html'||p==='faraz-site/index.html')continue;
 assert.equal(html.split('/assets/shared-header.css?v='+cssVersion).length-1,1,p+' CSS missing/duplicate');
 assert.equal(html.split('/assets/site-menu.js?v='+jsVersion).length-1,1,p+' menu JS missing/duplicate');
 const before=html.slice(0,html.indexOf('<main'));
 const headers=[...before.matchAll(/<header class="site-header">[\s\S]*?<\/header>/g)];
 assert.equal(headers.length,1,p+' site header count');
 const h=headers[0][0];
 assert(h.includes(mark),p+' wrong logo');
 assert(h.includes(button),p+' wrong menu button');
 assert(!h.includes('<details')&&!h.includes('site-menu-links'),p+' legacy dropdown remains');
 const menus=[...before.matchAll(/<nav class="menu" id="menu"[\s\S]*?<\/nav>\s*<\/div>\s*<\/nav>/g)];
 assert.equal(menus.length,1,p+' menu overlay count');
 assert.equal(menus[0][0],expected,p+' overlay differs from homepage');
 for(const href of required[p]||[])assert(h.includes('href="'+href+'"'),p+' missing top header link '+href);
 count++;
}
assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'faraz-site/index.html'),'utf8'));
console.log('Full-screen homepage menu verified on '+count+' secondary pages.');
