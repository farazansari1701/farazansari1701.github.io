// Execute the shipped footer handlers in isolation; this is not a browser test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function element(){const values=new Map(),classes=new Set();return {listeners:{},style:{getPropertyValue:k=>values.get(k)||'',setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},addEventListener(k,f){this.listeners[k]=f;},focus(){this.focused=true;},getBoundingClientRect:()=>({width:1800}),clientWidth:390,scrollWidth:390};}
async function check(file,mode){
 const nodes=Object.fromEntries(['#yr','#cookie-reset','#to-top','.wordmark','.pano','.sky3','#sk-route','.sk-plane','.sk-far','.sk-mid','.sk-sun'].map(s=>[s,element()]));
 const foot=element();foot.querySelector=s=>nodes[s];const first=element(),banner={hidden:true,querySelector:()=>first};
 const tweens=[],scripts=[],scrolls=[];let reverted=false,refreshes=0;
 const G={registerPlugin(){},context:()=>({add:fn=>fn(),revert(){reverted=true;}}),fromTo:(node,...vars)=>{assert(node);if(mode==='setup-failure')throw Error('setup failure');tweens.push({node,vars});},to:(node,...vars)=>{assert(node);tweens.push({node,vars});},from:(node,...vars)=>{assert(node);tweens.push({node,vars});}};
 const window={addEventListener(){},scrollTo:v=>scrolls.push(v),gsap:mode==='blocked'?undefined:G,ScrollTrigger:{refresh(){refreshes++;}},MotionPathPlugin:mode==='optional-blocked'?undefined:{}};
 const document={querySelector:()=>foot,getElementById:id=>id==='blog-cookie'?banner:null,createElement:()=>({remove(){}}),head:{appendChild(script){scripts.push(script);queueMicrotask(()=>script.onerror?.());}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{document,window,matchMedia:()=>({matches:mode==='reduced'}),Date,getComputedStyle:()=>({fontSize:'100px'}),setTimeout:()=>1,clearTimeout(){}});
 await new Promise(resolve=>setImmediate(resolve));
 nodes['#cookie-reset'].listeners.click();assert.equal(banner.hidden,false);assert.equal(first.focused,true);
 nodes['#to-top'].listeners.click();assert.equal(scrolls[0].top,0);assert.equal(scrolls[0].behavior,mode==='reduced'?'auto':'smooth');
 assert.equal(nodes['#yr'].textContent,new Date().getFullYear());
 if(mode==='normal'||mode==='optional-blocked'){
  assert.equal(tweens.length,mode==='normal'?7:6);assert.equal(refreshes,1);assert(nodes['.pano'].classList.contains('panning'));
  const pan=tweens.find(t=>t.node===nodes['.sky3']);assert.equal(pan.vars[0].x(),-1410);assert.equal(pan.vars[0].scrollTrigger.scrub,.5);
  if(mode==='normal'){const plane=tweens.find(t=>t.node===nodes['.sk-plane']);assert.equal(plane.vars[1].motionPath.path,'#sk-route');assert.equal(plane.vars[1].motionPath.end,1);}
 }else{assert.equal(tweens.length,0);assert(!nodes['.pano'].classList.contains('panning'));if(mode==='setup-failure')assert(reverted);if(mode==='reduced')assert.equal(scripts.length,0);}
 console.log('PASS',file,mode,'controls and animation setup/fallback');
}
(async()=>{
 const home=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<footer\b[\s\S]*?<\/footer>/)[0];
 const pages=['blog/index.html','blog/about/index.html','blog/topics/marketing-automation/index.html',...JSON.parse(fs.readFileSync(path.join(root,'blog/posts.json'),'utf8')).map(p=>p.url.slice(1)+'index.html')];
 for(const page of pages){const html=fs.readFileSync(path.join(root,page),'utf8');assert.equal(html.match(/<footer\b[\s\S]*?<\/footer>/)[0],home,page+' must contain the exact portfolio footer');assert(!html.includes('data-footer-art='));}
 console.log('PASS original portfolio markup, artwork, links and controls on every blog page');
 for(const file of ['blog/assets/footer.js','blog/assets/footer.min.js'])for(const mode of ['normal','reduced','blocked','optional-blocked','setup-failure'])await check(file,mode);
})().catch(error=>{console.error(error);process.exitCode=1;});
