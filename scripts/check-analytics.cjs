// Network-free execution checks for the shared consent bootstrap and UI wiring.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/..';
const source=fs.readFileSync(root+'/assets/analytics.min.js','utf8');
function setup(initial,blocked=false){
 let value=initial;const scripts=[],listeners={};
 const window={addEventListener:(name,fn)=>listeners[name]=fn};
 const context={window,document:{head:{appendChild:s=>scripts.push(s)},createElement:()=>({})},localStorage:{getItem:()=>{if(blocked)throw Error('blocked');return value;},setItem:(k,v)=>value=v},Date};
 vm.createContext(context);vm.runInContext(source,context);
 return {context,window,scripts,listeners,set:valueNew=>value=valueNew};
}
for(const initial of [null,'denied','unexpected']){
 const s=setup(initial);assert.equal(s.scripts.length,0);assert.equal(s.window['ga-disable-G-0S2BYMQSKW'],true);
}
assert.equal(setup(null,true).scripts.length,0,'Blocked storage must fail closed');
const s=setup(null);s.window.farazAnalytics.applyConsent('granted');
assert.deepEqual(s.scripts.map(x=>x.src),['https://www.googletagmanager.com/gtag/js?id=G-0S2BYMQSKW','https://www.googletagmanager.com/gtm.js?id=GTM-57BRSKXB']);
assert(s.scripts.every(x=>x.async));
const queue=s.window.dataLayer;
assert.equal(queue[0][0],'consent');assert.equal(queue[0][2].analytics_storage,'denied');
assert.equal(queue[0][2].ad_storage,'denied');assert.equal(queue[1][2].analytics_storage,'granted');
assert.equal(queue.filter(x=>x.event==='gtm.js').length,1);
const last=()=>queue.at(-1);
s.window.farazAnalytics.applyConsent('denied');assert.equal(last()[2].analytics_storage,'denied');assert.equal(s.window['ga-disable-G-0S2BYMQSKW'],true);
s.window.farazAnalytics.applyConsent('granted');assert.equal(s.scripts.length,2);
assert.equal(queue.filter(x=>x[0]==='config').length,1,'No duplicate GA4 config');
vm.runInContext(source,s.context);assert.equal(s.scripts.length,2,'Bootstrap is idempotent');
const cross=setup(null);cross.listeners.storage({key:'fa-consent',newValue:'granted'});assert.equal(cross.scripts.length,2);
cross.listeners.storage({key:null,newValue:null});assert.equal(cross.window['ga-disable-G-0S2BYMQSKW'],true);
assert.equal(setup('granted').scripts.length,2);
// Exercise real homepage consent handlers with the shared bootstrap.
const home=fs.readFileSync(root+'/index.html','utf8');
const cookie=home.split('/* ---- cookie banner + GA4 ---- */')[1].split('/* ---- marquee leans')[0];
const h=setup(null),controls={};
Object.assign(h.context,{CONFIG:{gaId:'G-0S2BYMQSKW'},store:{get:()=>h.context.localStorage.getItem('fa-consent'),set:(k,v)=>h.context.localStorage.setItem(k,v)},$:id=>id==='#cookie'?{classList:{add(){},remove(){}}}:(controls[id]??={addEventListener:(type,fn)=>controls[id].handler=fn})});
vm.runInContext(cookie,h.context);assert.equal(h.scripts.length,0);
controls['#ck-yes'].handler();assert.equal(h.scripts.length,2);
controls['#ck-no'].handler();assert.equal(h.window['ga-disable-G-0S2BYMQSKW'],true);
// Exercise the actual blog banner wiring.
const b=setup(null),buttons={};
Object.assign(b.context,{navigator:{},document:{...b.context.document,getElementById:()=>null,querySelector:()=>null,querySelectorAll:selector=>selector==='[data-consent]'?['granted','denied'].map(value=>({dataset:{consent:value},addEventListener:(type,fn)=>buttons[value]=fn})):[]}});
vm.runInContext(fs.readFileSync(root+'/blogs/assets/blog.min.js','utf8'),b.context);
assert.equal(b.scripts.length,0);buttons.granted();assert.equal(b.scripts.length,2);buttons.denied();assert.equal(b.window['ga-disable-G-0S2BYMQSKW'],true);
console.log('PASS: consent defaults/order, blocked storage, grant/withdraw/regrant, cross-tab changes, one loader/config, homepage and blog controls');
