'use strict';
// Run after the header/footer generators; readable sources remain authoritative.
const fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const excluded=new Set(['.git','node_modules','templates','blogs','.venv','venv']);
const fixed=['site-menu.js','site-footer.js','site-footer.css',
  'shared-header.css','project-grid.css'];
const seo=fs.readdirSync(assets).filter(n=>/^seo-[a-z0-9-]+\.css$/i.test(n));
const sources=[...new Set([...fixed,...seo])].sort();
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const replacements=[];
for(const source of sources){
 const ext=path.extname(source).slice(1),stem=source.slice(0,-ext.length-1);
 if(!/^[a-z0-9-]+$/i.test(stem))throw Error('Unexpected asset stem '+stem);
 const min=stem+'.min.'+ext;
 const original=fs.readFileSync(path.join(assets,source),'utf8');
 const output=esbuild.transformSync(original,{
  loader:ext,minify:true,legalComments:'none',charset:'utf8',
  ...(ext==='js'?{target:'es2020'}:{})
 }).code;
 if(!output.trim())throw Error('Empty minified output: '+source);
 fs.writeFileSync(path.join(assets,min),output);
 const url='/assets/'+min+'?v='+hash(output);
 const re=new RegExp('/assets/'+stem+'(?:\\.min)?\\.'+ext
   +'(?:\\?[^"\\s<>]*)?','g');
 replacements.push({source,min,re,url,before:original.length,after:output.length});
}
function published(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  if(entry.isDirectory())
   return excluded.has(entry.name)?[]:published(path.join(dir,entry.name));
  return entry.isFile()&&entry.name.endsWith('.html')?[path.join(dir,entry.name)]:[];
 });
}
let changed=0,rewritten=0;
for(const file of published(root)){
 const before=fs.readFileSync(file,'utf8');
 let after=before;
 for(const item of replacements)
  after=after.replace(item.re,()=>{rewritten++;return item.url;});
 if(after!==before){fs.writeFileSync(file,after);changed++;}
}
if(!fs.readFileSync(path.join(root,'index.html')).equals(
 fs.readFileSync(path.join(root,'faraz-site/index.html'))))
 throw Error('Homepage mirrors diverged');
console.log('Minified '+sources.length+' shared assets, updated '+changed
 +' pages and '+rewritten+' hashed references');
for(const item of replacements)
 console.log(item.source+' -> '+item.min+' ('+item.before+' -> '+item.after+' bytes)');
