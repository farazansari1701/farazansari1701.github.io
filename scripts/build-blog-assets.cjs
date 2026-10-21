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
