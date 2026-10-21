// Execute the actual inline GTM bootstrap and consent handlers without network access.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/..';
const source=fs.readFileSync(root+'/assets/analytics.min.js','utf8');
const head=fs.readFileSync(root+'/templates/tag-manager-head.html','utf8');
const inline=[...head.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert.equal(inline.length,2);
function setup(initial,blocked=false,ready='complete'){
 let value=initial;const scripts=[],listeners={},documentListeners={};
 const context={Date,location:{origin:'https://farazansari1701.com',pathname:'/blogs/test/',href:'https://farazansari1701.com/blogs/test/?private=value'},addEventListener:(name,fn)=>listeners[name]=fn,document:{title:'Test article',readyState:ready,addEventListener:(name,fn)=>documentListeners[name]=fn,createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore:s=>{scripts.push(s);assert.equal(context['ga-disable-G-0S2BYMQSKW'],true,'GA4 disabled before GTM');}}}]},localStorage:{getItem:()=>{if(blocked)throw Error('blocked');return value;},setItem:(k,v)=>value=v}};
 context.window=context;vm.createContext(context);
 for(const code of inline)vm.runInContext(code,context);
 vm.runInContext(source,context);
 return {context,window:context,scripts,listeners,documentListeners,set:v=>value=v};
}
const pageviews=s=>s.window.dataLayer.filter(x=>x[0]==='event'&&x[1]==='page_view');
for(const initial of [null,'denied','unexpected']){
 const s=setup(initial);assert.equal(s.scripts.length,1);assert.equal(s.scripts[0].src,'https://www.googletagmanager.com/gtm.js?id=GTM-57BRSKXB');assert.equal(s.window['ga-disable-G-0S2BYMQSKW'],true);assert.equal(pageviews(s).length,0);
}
assert.equal(pageviews(setup(null,true)).length,0,'Blocked storage must fail closed');
const s=setup(null),queue=s.window.dataLayer;
assert.equal(queue[0][0],'consent');assert.equal(queue[0][2].analytics_storage,'denied');assert.equal(queue[0][2].ad_storage,'denied');
assert.equal(queue[1][0],'set');assert.equal(queue[1][1],'send_page_view');assert.equal(queue[1][2],false);
assert.equal(queue.filter(x=>x.event==='gtm.js').length,1);
s.window.farazAnalytics.applyConsent('granted');assert.equal(s.window['ga-disable-G-0S2BYMQSKW'],false);assert.equal(pageviews(s).length,1);
assert.equal(pageviews(s)[0][2].send_to,'G-0S2BYMQSKW');assert.equal(pageviews(s)[0][2].page_location,'https://farazansari1701.com/blogs/test/');
s.window.farazAnalytics.applyConsent('denied');assert.equal(s.window['ga-disable-G-0S2BYMQSKW'],true);assert.equal(queue.at(-1)[2].analytics_storage,'denied');
s.window.farazAnalytics.applyConsent('granted');vm.runInContext(source,s.context);assert.equal(s.scripts.length,1);assert.equal(pageviews(s).length,1,'No duplicate page view on repeat grant/bootstrap');
assert.equal(queue.filter(x=>x[0]==='config').length,0,'No standalone GA4 config alongside GTM');
const cross=setup(null);cross.listeners.storage({key:'fa-consent',newValue:'granted'});assert.equal(pageviews(cross).length,1);cross.listeners.storage({key:null,newValue:null});assert.equal(cross.window['ga-disable-G-0S2BYMQSKW'],true);
assert.equal(pageviews(setup('granted')).length,1);
const pending=setup('granted',false,'loading');assert.equal(pageviews(pending).length,0);pending.window.farazAnalytics.applyConsent('denied');pending.context.document.readyState='interactive';pending.documentListeners.DOMContentLoaded();assert.equal(pageviews(pending).length,0);pending.window.farazAnalytics.applyConsent('granted');assert.equal(pageviews(pending).length,1);
const home=fs.readFileSync(root+'/index.html','utf8');
const cookie=home.split('/* ---- cookie banner + GA4 ---- */')[1].split('/* ---- marquee leans')[0];
const h=setup(null),controls={};
Object.assign(h.context,{CONFIG:{gaId:'G-0S2BYMQSKW'},store:{get:()=>h.context.localStorage.getItem('fa-consent'),set:(k,v)=>h.context.localStorage.setItem(k,v)},$:id=>id==='#cookie'?{classList:{add(){},remove(){}}}:(controls[id]??={addEventListener:(type,fn)=>controls[id].handler=fn})});
vm.runInContext(cookie,h.context);assert.equal(pageviews(h).length,0);controls['#ck-yes'].handler();assert.equal(pageviews(h).length,1);controls['#ck-no'].handler();assert.equal(h.window['ga-disable-G-0S2BYMQSKW'],true);
const b=setup(null),buttons={};
Object.assign(b.context,{navigator:{},document:{...b.context.document,getElementById:()=>null,querySelector:()=>null,querySelectorAll:selector=>selector==='[data-consent]'?['granted','denied'].map(value=>({dataset:{consent:value},addEventListener:(type,fn)=>buttons[value]=fn})):[]}});
vm.runInContext(fs.readFileSync(root+'/blogs/assets/blog.min.js','utf8'),b.context);assert.equal(pageviews(b).length,0);buttons.granted();assert.equal(pageviews(b).length,1);buttons.denied();assert.equal(b.window['ga-disable-G-0S2BYMQSKW'],true);
console.log('PASS: standard GTM loader, consent before container, no direct GA4 loader/config, one consented page view, DOM readiness, withdrawal/regrant, cross-tab and real banner handlers');
