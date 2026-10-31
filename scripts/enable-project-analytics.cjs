'use strict';
// Attach the canonical, consent-first GTM implementation to every Projects page.
// Generated output is idempotent: changing a source replaces rather than stacks it.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const projectRoot=path.join(root,'projects');
const assets=path.join(root,'assets');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
function minify(source,loader,target){
  return esbuild.transformSync(fs.readFileSync(path.join(assets,source),'utf8'),
    {loader,minify:true,legalComments:'none',charset:'utf8',...(target?{target}:{})}).code;
}
const consentJS=minify('project-consent.js','js','es2020');
const consentCSS=minify('project-consent.css','css');
fs.writeFileSync(path.join(assets,'project-consent.min.js'),consentJS);
fs.writeFileSync(path.join(assets,'project-consent.min.css'),consentCSS);
const urls={
  consentJS:'/assets/project-consent.min.js?v='+hash(consentJS),
  consentCSS:'/assets/project-consent.min.css?v='+hash(consentCSS),
  analytics:'/assets/analytics.min.js?v='+hash(fs.readFileSync(path.join(assets,'analytics.min.js'))),
  measurement:'/assets/measurement.min.js?v='+hash(fs.readFileSync(path.join(assets,'measurement.min.js')))
};
const headTemplate=fs.readFileSync(path.join(root,'templates/tag-manager-head.html'),'utf8').trim();
const noscript=fs.readFileSync(path.join(root,'templates/tag-manager-body.html'),'utf8').trim();
const banner=String.raw`<aside id="project-cookie" class="project-cookie cookie" role="region" aria-label="Analytics preferences" hidden>
  <h2>Privacy and analytics</h2>
  <p>Optional analytics help me understand which work visitors read. You can accept or decline; essential site features remain available either way. <a href="/privacy/">Read the privacy notice</a>.</p>
  <div class="project-cookie-controls">
    <button type="button" data-project-consent="granted">Accept analytics</button>
    <button type="button" data-project-consent="denied">Decline</button>
  </div>
</aside>`;
const beginHead='<!-- Project analytics head begin -->';
const endHead='<!-- Project analytics head end -->';
const beginBody='<!-- Project analytics body begin -->';
const endBody='<!-- Project analytics body end -->';
const beginBanner='<!-- Project analytics banner begin -->';
const endBanner='<!-- Project analytics banner end -->';
function removeBlock(html,begin,end){
  const re=new RegExp(begin+'[\\s\\S]*?'+end+'\\s*','g');
  return html.replace(re,'');
}
let count=0;
for (const page of fs.readdirSync(projectRoot,{withFileTypes:true})){
  const file=page.isDirectory()?path.join(projectRoot,page.name,'index.html'):page.name==='index.html'?path.join(projectRoot,page.name):null;
  if(!file||!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  html=removeBlock(html,beginHead,endHead);
  html=removeBlock(html,beginBody,endBody);
  html=removeBlock(html,beginBanner,endBanner);
  // Fail instead of injecting a second independent GA loader or legacy banner.
  if(/GTM-57BRSKXB|\/assets\/analytics(?:\.min)?\.js|\/assets\/measurement(?:\.min)?\.js/.test(html)){
    throw Error('Legacy analytics code must be reconciled first: '+file);
  }
  if(!/<meta charset="utf-8">/i.test(html)||!/<body\b[^>]*>/i.test(html)||!/<\/body>/i.test(html)){
    throw Error('Invalid Projects page shell: '+file);
  }
  const head=beginHead+'\n'+headTemplate+'\n<script src="'+urls.analytics+'" data-container="GTM-57BRSKXB"></script>\n'+
    '<link rel="stylesheet" href="'+urls.consentCSS+'">\n'+
    '<script src="'+urls.measurement+'" defer></script>\n'+
    '<script src="'+urls.consentJS+'" defer></script>\n'+endHead;
  html=html.replace(/(<meta charset="utf-8">\s*)/i,'$1'+head+'\n');
  html=html.replace(/(<body\b[^>]*>)/i,'$1\n'+beginBody+'\n'+noscript+'\n'+endBody);
  html=html.replace('</body>',beginBanner+'\n'+banner+'\n'+endBanner+'\n</body>');
  if(html.split('data-container="GTM-57BRSKXB"').length!==2)throw Error('Duplicate GTM '+file);
  fs.writeFileSync(file,html);
  count++;
}
if(count!==7)throw Error('Expected 7 Projects pages, got '+count);
console.log('Synced consent-first analytics to '+count+' Projects pages; hashed shared assets '+JSON.stringify(urls));