'use strict';
// Browser QA for the public website. Run in CI with Playwright Chromium + WebKit.
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const origin = (process.env.SITE_URL || 'https://farazansari1701.com').replace(/\/$/, '');
const output = path.resolve(process.env.QA_OUTPUT || 'audit-output');
fs.mkdirSync(output, { recursive: true });
const cases = [
  { engine: 'chromium', name: 'Chrome-320', width: 320, height: 568, mobile: true, paths: ['/', '/blog/', '/projects/'] },
  { engine: 'chromium', name: 'Chrome-390', width: 390, height: 844, mobile: true, paths: ['/', '/blog/', '/projects/', '/blog/about/'] },
  { engine: 'chromium', name: 'Chrome-desktop', width: 1440, height: 900, mobile: false, paths: ['/', '/blog/', '/projects/', '/privacy/'] },
  { engine: 'webkit', name: 'WebKit-iPhone', width: 390, height: 844, mobile: true, paths: ['/', '/blog/', '/projects/'] },
  { engine: 'webkit', name: 'WebKit-desktop', width: 1280, height: 800, mobile: false, paths: ['/', '/projects/'] }
];
const results = [], fatal = [];
function slug(input) { return (input.replace(/^\/+|\/+$/g,'') || 'home').replace(/[^\w-]+/g,'-'); }
async function main(){
 for(const conf of cases){
  const browser = await (conf.engine === 'webkit' ? webkit : chromium).launch({headless:true});
  const context = await browser.newContext({viewport:{width:conf.width,height:conf.height}, isMobile: conf.mobile, hasTouch:conf.mobile, reducedMotion:'reduce'});
  for(const pathname of conf.paths){
   const key = conf.name + '-' + slug(pathname);
   const page = await context.newPage();
   const record = {key, pathname, width:conf.width, height:conf.height, engine:conf.engine, problems:[], warnings:[], pageErrors:[], badResponses:[], axe:[]};
   page.on('pageerror',err=>record.pageErrors.push(String(err.message).slice(0,400)));
   page.on('response',res=>{try {if(new URL(res.url()).origin===origin && res.status()>=400)record.badResponses.push(res.status()+' '+res.url());}catch{}});
   try{
    const response=await page.goto(origin+pathname,{waitUntil:'domcontentloaded',timeout:45000});
    record.status=response?.status();
    if(!response||response.status()>=400)record.problems.push('Page response '+record.status);
    await page.waitForTimeout(1300);
    const layout=await page.evaluate(()=>{
      const rect=selector=>{
        const el=document.querySelector(selector);if(!el)return null;
        const r=el.getBoundingClientRect();const style=getComputedStyle(el);
        return {left:+r.left.toFixed(1),right:+r.right.toFixed(1),top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),width:+r.width.toFixed(1),display:style.display,visibility:style.visibility};
      };
      const imgs=[...document.querySelectorAll('img[src]')].filter(el=>{
        const r=el.getBoundingClientRect();return r.top<innerHeight && r.bottom>0 && getComputedStyle(el).visibility!=='hidden';
      });
      return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,
        header:rect('header.site-header,header.top'),logo:rect('header.site-header .brand,header.top .logo'),menuButton:rect('#menu-btn'),
        heroTitle:rect('.hero-name,main h1'),main:rect('main'),badAboveFoldImages:imgs.filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.currentSrc||x.src).slice(0,12),
        menuInitialInert:document.getElementById('menu')?.inert,menuInitialAria:document.getElementById('menu')?.getAttribute('aria-hidden')};
    });
    record.layout=layout;
    if(layout.scrollWidth>conf.width+5)record.problems.push('Document horizontal overflow: '+layout.scrollWidth+' vs '+conf.width);
    if(pathname==='/projects/' && layout.heroTitle && layout.heroTitle.right>conf.width+4)record.problems.push('Projects heading clipped beyond viewport: '+layout.heroTitle.right+' > '+conf.width);
    const h=layout.header,l=layout.logo,m=layout.menuButton;
    if(!h||!l||!m)record.problems.push('Header, logo or Menu missing');
    else{
      if(l.right>m.left+1)record.problems.push('Logo and Menu overlap ('+l.right+' > '+m.left+')');
      if(m.right>conf.width+3||l.left< -3)record.problems.push('Header control outside viewport');
      if(Math.min(m.height,m.width)<30)record.warnings.push('Menu has a visual hit target below 30px');
    }
    if(layout.badAboveFoldImages.length)record.problems.push('Broken above-fold images: '+layout.badAboveFoldImages.join('; '));
    const menuButton=page.locator('#menu-btn');
    if(await menuButton.count()){
      if(layout.menuInitialAria!=='true'||!layout.menuInitialInert)record.problems.push('Closed menu must be aria-hidden and inert');
      await menuButton.click({timeout:8000});
      await page.waitForTimeout(140);
      const open=await page.evaluate(()=>({expanded:document.getElementById('menu-btn').getAttribute('aria-expanded'),inert:document.getElementById('menu').inert,open:document.getElementById('menu').classList.contains('open')}));
      record.menuOpen=open;
      if(open.expanded!=='true'||open.inert||!open.open)record.problems.push('Menu did not open correctly');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      const closed=await page.evaluate(()=>({expanded:document.getElementById('menu-btn').getAttribute('aria-expanded'),inert:document.getElementById('menu').inert,hidden:document.getElementById('menu').getAttribute('aria-hidden'),focused:document.activeElement?.id}));
      record.menuClosed=closed;
      if(closed.expanded!=='false'||!closed.inert||closed.hidden!=='true')record.problems.push('Escape did not close Menu accessibly');
      if(closed.focused!=='menu-btn')record.warnings.push('Menu focus not returned to toggle');
    } else record.problems.push('Menu toggle missing');
    if(conf.engine==='chromium'&&(pathname==='/'||pathname==='/blog/')&&(conf.width===390||conf.width===1440)){
      try {
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
        record.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,description:v.help,examples:v.nodes.slice(0,6).map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}));
        for(const v of axe.violations.filter(v=>['critical','serious'].includes(v.impact)))record.warnings.push('WCAG '+v.impact+': '+v.id+' ('+v.nodes.length+' nodes)');
      }catch(err){record.warnings.push('Axe scan failed: '+String(err.message).slice(0,300));}
    }
    await page.screenshot({path:path.join(output,key+'.png'),fullPage:false,timeout:20000});
   }catch(err){record.problems.push('Browser error: '+String(err.stack||err).slice(0,1000));}
   if(record.badResponses.length)record.problems.push('Missing first-party assets: '+record.badResponses.slice(0,4).join('; '));
   if(record.pageErrors.length)record.warnings.push('Page JS errors: '+record.pageErrors.slice(0,3).join(' | '));
   results.push(record);
   if(record.problems.length)fatal.push(key+': '+record.problems.join(' / '));
   console.log('QA_RESULT '+JSON.stringify(record));
   await page.close();
  }
  await browser.close();
 }
 fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({timestamp:new Date().toISOString(),origin,results,fatal},null,2));
 console.log('QA_SUMMARY '+JSON.stringify({tested:results.length,failed:fatal.length,examples:fatal.slice(0,10)}));
 if(fatal.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
