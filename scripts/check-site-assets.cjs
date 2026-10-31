'use strict';
// Verify production minification, SHA versions and every published reference.
const fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const excluded=new Set(['.git','node_modules','templates','blogs','.venv','venv']);
const fixed=['site-menu.js','site-footer.js','site-footer.css',
 'shared-header.css','project-grid.css'];
const seo=fs.readdirSync(assets).filter(n=>/^seo-[a-z0-9-]+\.css$/i.test(n));
const sources=[...new Set([...fixed,...seo])].sort();
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const records=sources.map(source=>{
 const ext=path.extname(source).slice(1),stem=source.slice(0,-ext.length-1);
 assert(/^[a-z0-9-]+$/i.test(stem),'Invalid asset stem: '+stem);
 const min=stem+'.min.'+ext;
 const original=fs.readFileSync(path.join(assets,source),'utf8');
 const expected=esbuild.transformSync(original,{
  loader:ext,minify:true,legalComments:'none',charset:'utf8',
  ...(ext==='js'?{target:'es2020'}:{})
 }).code;
 const shipped=fs.readFileSync(path.join(assets,min),'utf8');
 assert.equal(shipped,expected,min+' does not match its readable source');
 return {source,min,url:'/assets/'+min+'?v='+hash(shipped),
  pattern:new RegExp('/assets/'+stem+'(?:\\.min)?\\.'+ext
    +'(?:\\?[^"\\s<>]*)?','g')};
});
function published(dir,rel=''){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const sub=path.posix.join(rel,entry.name),file=path.join(dir,entry.name);
  if(entry.isDirectory())
   return excluded.has(entry.name)?[]:published(file,sub);
  return entry.isFile()&&entry.name.endsWith('.html')?[{file,relative:sub}]:[];
 });
}
let references=0;
const pages=published(root);
for(const {file,relative} of pages){
 const html=fs.readFileSync(file,'utf8');
 for(const record of records){
  for(const match of html.matchAll(record.pattern)){
   references++;
   assert.equal(match[0],record.url,
     relative+' has an unminified or stale asset: '+match[0]);
  }
 }
 assert(html.includes('/assets/site-footer.min.css?v='),
  relative+' missing minified footer CSS');
 if(relative!=='index.html'&&relative!=='faraz-site/index.html'){
  assert(html.includes('/assets/shared-header.min.css?v='),
   relative+' missing minified header CSS');
  assert(html.includes('/assets/site-menu.min.js?v='),
   relative+' missing minified menu JS');
 }
}
assert(references>pages.length*2,'Insufficient versioned asset references');
console.log('PASS '+records.length+' minified assets, '+references+
 ' verified references across '+pages.length+' HTML pages');
