// Minify the shared blog assets and use content hashes to avoid stale cached files.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'blog/assets');
// The portfolio owns the brand tokens and its light/dark theme selectors.
// Synchronise these at build time so every archive and article inherits them.
const portfolio=fs.readFileSync(path.join(root,'assets/portfolio.css'),'utf8');
const portfolioRoot=portfolio.match(/:root\s*\{([^}]+)\}/)[1];
const blogPath=path.join(assets,'blog.css');
let blogCss=fs.readFileSync(blogPath,'utf8');
blogCss=blogCss.replace(/^:root\{([^}]+)\}/,(_,declarations)=>{
 for(const token of ['paper','ink','cyan','magenta','yellow','font','gutter']){
  const value=portfolioRoot.match(new RegExp('--'+token+':([^;]+)'))?.[1].trim();
  if(!value)throw new Error('Missing portfolio token: '+token);
  declarations=declarations.replace(new RegExp('--'+token+':[^;]+'),'--'+token+':'+value);
 }
 return ':root{'+declarations+'}';
});
const darkRules=portfolio.match(/@media \(prefers-color-scheme: dark\)\{[^\n]+\}\s*\n:root\[data-theme="dark"\]\{[^\n]+\}/)?.[0];
if(!darkRules)throw new Error('Missing portfolio dark theme rules');
const theme='/* Portfolio theme: generated from index.html */\n'+darkRules.replace(/--mute:/g,'color-scheme:dark;--mute:')+'\n/* End portfolio theme */';
blogCss=blogCss.replace(/\/\* Portfolio theme: generated from index.html \*\/[\s\S]*?\/\* End portfolio theme \*\/\n?/,'');
blogCss=blogCss.replace(/(^:root\{[^}]+\}\n)/,'$1'+theme+'\n');
fs.writeFileSync(blogPath,blogCss);
const versions={};
for(const file of ['blog.js','footer.js','blog.css','footer.css']){
  const ext=path.extname(file),name=path.basename(file,ext)+'.min'+ext;
  const output=esbuild.transformSync(fs.readFileSync(path.join(assets,file),'utf8'),{loader:ext==='.js'?'js':'css',minify:true,target:ext==='.js'?'es2020':undefined,legalComments:'none',charset:'utf8'}).code;
  fs.writeFileSync(path.join(assets,name),output);versions[file]=name+'?v='+crypto.createHash('sha256').update(output).digest('hex').slice(0,12);
}
function update(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){if(entry.name!=='assets')update(file);continue;}
  if(!file.endsWith('.html'))continue;
  let text=fs.readFileSync(file,'utf8');
  for(const [source,dest]of Object.entries(versions)){
    const [base,ext]=source.split('.');
    const re=new RegExp('/blog/assets/'+base+'(?:\\.min)?\\.'+ext+'(?:\\?[^"\\s<>]*)?','g');
    text=text.replace(re,'/blog/assets/'+dest);
  }
  fs.writeFileSync(file,text);
}}
update(path.join(root,'blog'));
const measurement=esbuild.transformSync(fs.readFileSync(path.join(root,'assets/measurement.js'),'utf8'),{loader:'js',minify:true,target:'es2020',legalComments:'none',charset:'utf8'}).code;
fs.writeFileSync(path.join(root,'assets/measurement.min.js'),measurement);
const measurementUrl='/assets/measurement.min.js?v='+crypto.createHash('sha256').update(measurement).digest('hex').slice(0,12);
for(const file of [path.join(root,'index.html'),path.join(root,'faraz-site/index.html'),...function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}(path.join(root,'blog'))]){
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/\/assets\/measurement\.min\.js(?:\?[^"\s<>]*)?/g,measurementUrl);
 fs.writeFileSync(file,html);
}
console.log('Minified blog assets with versioned URLs',versions);

// Keep the small portfolio-only responsive layer separate from desktop styles.
for(const ext of ['css','js']){
 const source='portfolio-responsive.'+ext,name='portfolio-responsive.min.'+ext;
 const output=esbuild.transformSync(fs.readFileSync(path.join(root,'assets',source),'utf8'),{loader:ext,minify:true,target:ext==='js'?'es2020':undefined,legalComments:'none',charset:'utf8'}).code;
 fs.writeFileSync(path.join(root,'assets',name),output);
 const url='/assets/'+name+'?v='+crypto.createHash('sha256').update(output).digest('hex').slice(0,12);
 for(const file of ['index.html','faraz-site/index.html']){
  const target=path.join(root,file),pattern=new RegExp('/assets/portfolio-responsive(?:\\.min)?\\.'+ext+'(?:\\?[^"\\s<>]*)?','g');
  fs.writeFileSync(target,fs.readFileSync(target,'utf8').replace(pattern,url));
 }
}

const analytics=esbuild.transformSync(fs.readFileSync(path.join(root,'assets/analytics.js'),'utf8'),{loader:'js',minify:true,target:'es2020',legalComments:'none',charset:'utf8'}).code;
fs.writeFileSync(path.join(root,'assets/analytics.min.js'),analytics);
const analyticsUrl='/assets/analytics.min.js?v='+crypto.createHash('sha256').update(analytics).digest('hex').slice(0,12);
const tagHead=fs.readFileSync(path.join(root,'templates/tag-manager-head.html'),'utf8').trim();
const tagBody=fs.readFileSync(path.join(root,'templates/tag-manager-body.html'),'utf8').trim();
// One supplied favicon set for portfolio, archives, posts and error pages.
const iconFiles=['favicon.ico','favicon-16x16.png','favicon-32x32.png','favicon-96x96.png','apple-touch-icon.png','android-chrome-192x192.png','android-chrome-512x512.png'];
const iconUrl=file=>'/'+file+'?v='+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12);
const manifestPath=path.join(root,'site.webmanifest'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
manifest.start_url='/';manifest.scope='/';
manifest.icons=manifest.icons.map(icon=>{
 const file=icon.src.split('?')[0].replace(/^\//,'');
 if(!iconFiles.includes(file))throw new Error('Unexpected manifest icon: '+file);
 return {...icon,src:iconUrl(file)};
});
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const faviconLinks=`<!-- Shared favicons -->
<link rel="icon" type="image/x-icon" sizes="16x16 32x32 48x48 64x64" href="${iconUrl('favicon.ico')}">
<link rel="icon" type="image/png" sizes="32x32" href="${iconUrl('favicon-32x32.png')}">
<link rel="icon" type="image/png" sizes="16x16" href="${iconUrl('favicon-16x16.png')}">
<link rel="icon" type="image/png" sizes="96x96" href="${iconUrl('favicon-96x96.png')}">
<link rel="apple-touch-icon" sizes="180x180" href="${iconUrl('apple-touch-icon.png')}">
<link rel="manifest" href="${iconUrl('site.webmanifest')}">
<!-- End shared favicons -->`;
for(const file of [path.join(root,'index.html'),path.join(root,'404.html'),path.join(root,'faraz-site/index.html'),path.join(root,'faraz-site/404.html'),...function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}(path.join(root,'blog'))]){
 let html=fs.readFileSync(file,'utf8').replace(/<script src="\/assets\/analytics\.min\.js(?:\?[^"\s<>]*)?" data-container="GTM-57BRSKXB"><\/script>\s*/g,'');
 html=html.replace(/<!-- Google consent defaults -->.*?<!-- End Google Tag Manager -->\s*/gs,'');
 html=html.replace(/(<meta charset="utf-8">)\s*/i,'$1\n'+tagHead+'\n<script src="'+analyticsUrl+'" data-container="GTM-57BRSKXB"></script>');
 html=html.replace(/<noscript data-analytics-consent>.*?<\/noscript>/gs,'');
 html=html.replace(/<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->\s*/gs,'');
 html=html.replace(/(<body[^>]*>)\s*/i,'$1\n'+tagBody+'\n');
 html=html.replace('Allow Google Analytics on these blog pages?','Allow Google Analytics through Google tags and Tag Manager on these blog pages?');
 html=html.replace('Analytics loads only after you choose Allow.','Tag Manager loads when the page opens. Analytics is enabled only after you choose Allow.');
 html=html.replace('Analytics loads only if you choose Allow analytics.','Tag Manager loads when the page opens. Analytics is enabled only if you choose Allow analytics.');
 html=html.replace(/<!-- Shared favicons -->[\s\S]*?<!-- End shared favicons -->\s*/g,'');
 html=html.replace(/<link\b[^>]*\brel=["'](?:icon|shortcut icon|apple-touch-icon(?:-precomposed)?|manifest)["'][^>]*>\s*/gi,'');
 html=html.replace('</head>',faviconLinks+'\n</head>');
 fs.writeFileSync(file,html);
}

// Keep readable portfolio sources, but ship minified inline CSS and deferred JS.
// Inline CSS avoids adding a new render-blocking stylesheet request.
const portfolioCss=esbuild.transformSync(portfolio,{loader:'css',minify:true,legalComments:'none',charset:'utf8'}).code;
const portfolioJs=esbuild.transformSync(fs.readFileSync(path.join(root,'assets/portfolio.js'),'utf8'),{loader:'js',minify:true,target:'es2020',legalComments:'none',charset:'utf8'}).code;
fs.writeFileSync(path.join(root,'assets/portfolio.min.js'),portfolioJs);
const portfolioJsUrl='/assets/portfolio.min.js?v='+crypto.createHash('sha256').update(portfolioJs).digest('hex').slice(0,12);
for(const rel of ['index.html','faraz-site/index.html']){
 const file=path.join(root,rel);
 let html=fs.readFileSync(file,'utf8');
 if(!/<style data-portfolio>/.test(html))throw new Error('Missing portfolio CSS build slot: '+rel);
 html=html.replace(/<style data-portfolio>[\s\S]*?<\/style>/,()=>'<style data-portfolio>'+portfolioCss+'</style>');
 html=html.replace(/\/assets\/portfolio\.min\.js(?:\?[^"\s<>]*)?/g,portfolioJsUrl);
 fs.writeFileSync(file,html);
}
