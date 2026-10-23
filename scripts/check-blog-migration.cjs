const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),BASE='https://farazansari1701.com';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pages=[path.join(root,'index.html'),path.join(root,'faraz-site/index.html'),...walk(path.join(root,'blog')).filter(p=>p.endsWith('.html'))];
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');assert(!/\bBlogs\b|\bblogs\b|\/blogs(?:\/|["\s<>])/.test(html),path.relative(root,file)+' uses plural labels/URLs');
 for(const match of html.matchAll(/\b(?:href|src)="([^"<>]+)"/g)){
  if(!match[1].startsWith('/')&&!match[1].startsWith(BASE))continue;
  const url=new URL(match[1],BASE);if(url.origin!==BASE)continue;
  let target=path.join(root,decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
  assert(fs.existsSync(target),file+' missing destination '+url.pathname);
  if(url.hash&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),file+' missing anchor '+url.href);
 }

}
assert(!fs.existsSync(path.join(root,'blogs')),'The old plural directory must not exist');
const posts=JSON.parse(fs.readFileSync(path.join(root,'blog/posts.json'),'utf8'));assert(posts.every(p=>p.url.startsWith('/blog/')));
assert(!fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('/blogs/'));
assert(!fs.readFileSync(path.join(root,'llms.txt'),'utf8').includes('/blogs/'));
console.log('PASS singular labels, canonical paths, local assets/anchors, registry, sitemap and discovery');
