// Minify the shared blog assets and use content hashes to avoid stale cached files.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'blogs/assets');
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
    const re=new RegExp('/blogs/assets/'+base+'(?:\\.min)?\\.'+ext+'(?:\\?[^"\\s<>]*)?','g');
    text=text.replace(re,'/blogs/assets/'+dest);
  }
  fs.writeFileSync(file,text);
}}
update(path.join(root,'blogs'));
const measurement=esbuild.transformSync(fs.readFileSync(path.join(root,'assets/measurement.js'),'utf8'),{loader:'js',minify:true,target:'es2020',legalComments:'none',charset:'utf8'}).code;
fs.writeFileSync(path.join(root,'assets/measurement.min.js'),measurement);
const measurementUrl='/assets/measurement.min.js?v='+crypto.createHash('sha256').update(measurement).digest('hex').slice(0,12);
for(const file of [path.join(root,'index.html'),path.join(root,'faraz-site/index.html'),...function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}(path.join(root,'blogs'))]){
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
for(const file of [path.join(root,'index.html'),path.join(root,'404.html'),path.join(root,'faraz-site/index.html'),path.join(root,'faraz-site/404.html'),...function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}(path.join(root,'blogs'))]){
 let html=fs.readFileSync(file,'utf8').replace(/<script src="\/assets\/analytics\.min\.js(?:\?[^"\s<>]*)?" data-container="GTM-57BRSKXB"><\/script>\s*/g,'');
 html=html.replace(/<!-- Google consent defaults -->.*?<!-- End Google Tag Manager -->\s*/gs,'');
 html=html.replace(/(<meta charset="utf-8">)\s*/i,'$1\n'+tagHead+'\n<script src="'+analyticsUrl+'" data-container="GTM-57BRSKXB"></script>');
 html=html.replace(/<noscript data-analytics-consent>.*?<\/noscript>/gs,'');
 html=html.replace(/<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->\s*/gs,'');
 html=html.replace(/(<body[^>]*>)\s*/i,'$1\n'+tagBody+'\n');
 html=html.replace('Allow Google Analytics on these blog pages?','Allow Google Analytics through Google tags and Tag Manager on these blog pages?');
 html=html.replace('Analytics loads only after you choose Allow.','Tag Manager loads when the page opens. Analytics is enabled only after you choose Allow.');
 html=html.replace('Analytics loads only if you choose Allow analytics.','Tag Manager loads when the page opens. Analytics is enabled only if you choose Allow analytics.');
 fs.writeFileSync(file,html);
}
