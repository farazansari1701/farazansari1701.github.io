'use strict';
// Browser QA for the public website. Run in CI with Playwright Chromium + WebKit.
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const origin = (process.env.SITE_URL || 'https://farazansari1701.com').replace(/\/$/, '');
const output = path.resolve(process.env.QA_OUTPUT || 'audit-output');
fs.mkdirSync(output, { recursive: true });
// Visit *every* published HTML route at iPhone width, not just the five
// representative pages that previously let header regressions go unnoticed.
const excluded=new Set(['.git','node_modules','templates','blogs','.venv','venv']);
function publishedPages(dir,relative=''){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const rel=path.posix.join(relative,entry.name),full=path.join(dir,entry.name);
    if(entry.isDirectory())return excluded.has(entry.name)?[]:publishedPages(full,rel);
    return entry.isFile()&&entry.name.endsWith('.html')?[rel]:[];
  });
}
const allMobileRoutes=[...new Set(publishedPages(path.resolve(__dirname,'..')).map(p=>
  p==='index.html'?'/':'/'+p.replace(/index\.html$/,'')
))].sort();
const cases = [
  { engine: 'chromium', name: 'Chrome-320', width: 320, height: 568, mobile: true, paths: ['/', '/blog/', '/projects/'] },
  { engine: 'chromium', name: 'Chrome-414', width: 414, height: 896, mobile: true, paths: ['/', '/blog/', '/projects/'] },
  { engine: 'chromium', name: 'Chrome-390', width: 390, height: 844, mobile: true, paths: allMobileRoutes },
  { engine: 'chromium', name: 'Chrome-desktop', width: 1440, height: 900, mobile: false, paths: ['/', '/blog/', '/projects/', '/privacy/'] },
  { engine: 'webkit', name: 'WebKit-iPhone', width: 390, height: 844, mobile: true, paths: ['/', '/blog/', '/blog/about/', '/blog/the-cost-of-having-a-conscience/', '/blog/topics/personal-perspectives/', '/projects/', '/projects/soldiering-on-awards/', '/privacy/'] },
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
        blogLink:rect('header.site-header .site-nav-mobile a[href="/blog/"]'),cvLink:rect('header.site-header .site-nav-mobile a[href*="Faraz-Ansari-CV.pdf"]'),
        mobileLinkLabels:[...document.querySelectorAll('header.site-header .site-nav-mobile a')].map(a=>a.innerText.trim()),
        desktopNav:rect('header.site-header .site-nav'),mobileNav:rect('header.site-header .site-nav-mobile'),
        heroTitle:rect('.hero-name,main h1'),main:rect('main'),
        firstContent:rect('main>.wrap>.breadcrumbs,main>.wrap>.index-hero>.eyebrow,main>.hero:not(.sec) .crumb,main>.hero.sec .chapter,main>.hero.sec .hero-meta,main>.kicker,main.page .code'),
        badAboveFoldImages:imgs.filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.currentSrc||x.src).slice(0,12),
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
    // The previous test checked the Menu but missed article and Blog headings
    // hidden behind the fixed header. Check the first meaningful content too.
    const first=layout.firstContent;
    if(h&&first&&first.display!=='none'&&first.visibility!=='hidden'&&first.top<h.bottom+6)
      record.problems.push('Fixed header overlaps first content ('+first.top+' < '+h.bottom+' + 6)');
    if(conf.mobile){
      // Compare the *rendered labels*, not only the presence of links.
      // The earlier regression showed "View CV ↗" on Blog but "View CV"
      // on the homepage despite both navigation elements existing.
      if(JSON.stringify(layout.mobileLinkLabels)!==JSON.stringify(['Blog','View CV']))
        record.problems.push('Mobile navigation labels differ: '+JSON.stringify(layout.mobileLinkLabels));
      if(!layout.mobileNav||layout.mobileNav.display==='none')
        record.problems.push('Standard mobile nav is missing or hidden');
      if(layout.desktopNav&&layout.desktopNav.display!=='none')
        record.problems.push('Desktop nav is visible beside mobile nav');
      const b=layout.blogLink,c=layout.cvLink;
      if(!b||b.display==='none'||b.visibility==='hidden'||b.width<20)
        record.problems.push('Blog is hidden from the mobile header');
      else if(l&&m){
        if(b.left<l.right-1)record.problems.push('Blog overlaps header logo');
        if(b.right>m.left+1)record.problems.push('Blog overlaps Menu button');
        if(b.right>conf.width+2)record.problems.push('Blog extends beyond viewport');
      }
      if(!c||c.display==='none'||c.visibility==='hidden'||c.width<20)
        record.problems.push('View CV is hidden from the mobile header');
      if(c&&c.display!=='none'&&c.width>0&&b&&b.width>0&&c.left<b.right-1)
        record.problems.push('Blog and View CV overlap');
      if(c&&m&&c.right>m.left+1)record.problems.push('View CV overlaps Menu button');
    }else{
      if(layout.mobileNav&&layout.mobileNav.display!=='none')
        record.problems.push('Mobile nav is visible on desktop');
    }
    // The UK education story must break *before* "Making My Mark in London",
    // rather than leaving "Making" stranded at the end of the first line.
    if(pathname==='/' && conf.mobile){
      const study=await page.evaluate(()=>{
        const title=document.querySelector('#study .op-story .story h3');
        const lead=title?.querySelector('.study-title-lead');
        const follow=title?.querySelector('.study-title-follow');
        if(!lead||!follow)return null;
        const a=lead.getBoundingClientRect(),b=follow.getBoundingClientRect();
        return {
          first:lead.textContent.trim(),second:follow.textContent.trim(),
          firstBottom:a.bottom,nextTop:b.top,nextRight:b.right,
          phraseFits:b.right<=innerWidth+1&&b.left>=-1,
          nextLine:b.top>=a.bottom-1,
          nowrap:getComputedStyle(follow).whiteSpace==='nowrap'
        };
      });
      record.studyHeading=study;
      if(!study||study.first!=='The Next Chapter:'||study.second!=='Making My Mark in London')
        record.problems.push('UK education heading structure or text is incorrect');
      else if(!study.nextLine||!study.nowrap||!study.phraseFits)
        record.problems.push('UK education heading fails mobile line break/fit');
    }
    if(layout.badAboveFoldImages.length)record.problems.push('Broken above-fold images: '+layout.badAboveFoldImages.join('; '));
    // Exercise real consent handlers and click instrumentation without
    // producing test traffic in GA4 or navigating away from the page.
    if(conf.engine==='chromium'&&conf.width===390&&(pathname==='/'||pathname==='/blog/')){
      const audit=await page.evaluate(()=>{
        const previous=localStorage.getItem('fa-consent'),gtag=window.gtag,logged=[];
        window.gtag=(...args)=>logged.push(args);
        const click=url=>{
          const a=document.createElement('a');a.href=url;
          a.addEventListener('click',e=>e.preventDefault());
          document.body.appendChild(a);
          a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
          a.remove();
        };
        const events=()=>logged.filter(x=>x[0]==='event').map(x=>x[1]);
        localStorage.setItem('fa-consent','denied');
        window.farazAnalytics?.applyConsent('denied');
        click('/projects/myoki-localised-campaigns/');
        click('https://calendly.com/example/consultation');
        click('/assets/Faraz-Ansari-CV.pdf');
        click('mailto:hello@example.com');
        window.dispatchEvent(new MessageEvent('message',{origin:'https://calendly.com',data:{event:'calendly.event_scheduled'}}));
        const before=events();
        localStorage.setItem('fa-consent','granted');
        window.farazAnalytics?.applyConsent('granted');
        logged.length=0;
        click('/projects/myoki-localised-campaigns/');
        click('https://calendly.com/example/consultation');
        click('/assets/Faraz-Ansari-CV.pdf');
        click('mailto:hello@example.com');
        window.dispatchEvent(new MessageEvent('message',{origin:'https://fake.example',data:{event:'calendly.event_scheduled'}}));
        const afterSpoof=events();
        window.dispatchEvent(new MessageEvent('message',{origin:'https://calendly.com',data:{event:'calendly.event_scheduled'}}));
        const after=events();
        if(previous===null)localStorage.removeItem('fa-consent');
        else localStorage.setItem('fa-consent',previous);
        window.farazAnalytics?.applyConsent(previous);
        window.gtag=gtag;
        return {before,after,afterSpoof};
      });
      record.analyticsAudit=audit;
      if(audit.afterSpoof.includes('booking_confirmed'))record.problems.push('Untrusted Calendly message accepted');
      if(audit.before.length)record.problems.push('Tracking events fired without consent: '+audit.before.join(','));
      for(const name of ['project_click','booking_intent','booking_confirmed','cv_open','contact_click']){
        if(!audit.after.includes(name))record.problems.push('Consented analytics event missing: '+name);
      }
    }
    if(pathname==='/blog/'){
      const input=page.locator('#blog-search');
      if(await input.count()!==1)record.problems.push('Blog search input missing');
      else {
        await input.fill('zzzznoresultszzzz');
        if(!await page.locator('#blog-empty').isVisible())record.problems.push('Blog empty state missing');
        await input.fill('marketing');
        const count=await page.locator('#blog-post-list .post-card:visible').count();
        if(count<1)record.problems.push('Blog keyword search did not return results');
        const personal=page.locator('[data-blog-filter="Personal perspectives"]');
        if(await personal.count()){await personal.click();if(await personal.getAttribute('aria-pressed')!=='true')record.problems.push('Blog topic filter did not activate');}
        const clear=page.locator('[data-blog-filter="all"]');
        if(await clear.count()){await clear.click();await input.fill('');}
      }
    }
    if(pathname.startsWith('/projects/')){
      const control=page.locator('#project-cookie [data-project-consent]');
      if(await control.count()!==2)record.problems.push('Projects analytics consent controls missing');
      const ga=await page.evaluate(()=>Boolean(window.farazAnalytics&&document.querySelector('script[data-container="GTM-57BRSKXB"]')));
      if(!ga)record.problems.push('Project page GTM/GA4 bootstrap missing');
    }
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
        record.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,description:v.help,examples:v.nodes.slice(0,80).map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}));
        for(const v of axe.violations.filter(v=>['critical','serious'].includes(v.impact)))record.problems.push('WCAG '+v.impact+': '+v.id+' ('+v.nodes.length+' nodes)');
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
