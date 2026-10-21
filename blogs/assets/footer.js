/* Footer behaviour shared with the main portfolio. */
(() => {
  const foot=document.querySelector('.foot');if(!foot)return;
  const $=s=>foot.querySelector(s);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const year=$('#yr');if(year)year.textContent=new Date().getFullYear();
  $('#cookie-reset')?.addEventListener('click',()=>{
    const banner=document.getElementById('blog-cookie');
    if(banner){banner.hidden=false;banner.querySelector('button')?.focus();}
  });
  $('#to-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
  const fit=()=>{
    const h=$('.wordmark');if(!h)return;
    const prev=h.style.getPropertyValue('--wd');h.style.setProperty('--wd',125);h.style.fontSize='';
    if(h.scrollWidth-h.clientWidth>1){const fs=parseFloat(getComputedStyle(h).fontSize);h.style.fontSize=(fs*h.clientWidth/h.scrollWidth*.97).toFixed(1)+'px';}
    if(prev)h.style.setProperty('--wd',prev);else h.style.removeProperty('--wd');
  };
  fit();let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>{fit();window.ScrollTrigger?.refresh();},150);});
  if(document.fonts?.ready)document.fonts.ready.then(fit);
  if(reduce)return;
  function load(src,exists){
    if(exists())return Promise.resolve();
    return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});
  }
  async function loadArtwork(){
    const placeholder=$('[data-footer-art]');
    if(!placeholder)return;
    const response=await fetch(placeholder.dataset.footerArt,{credentials:'same-origin'});
    if(!response.ok)throw new Error('Footer artwork unavailable');
    const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
    if(parsed.querySelector('parsererror')||parsed.documentElement.localName!=='svg')throw new Error('Invalid footer artwork');
    parsed.querySelectorAll('style').forEach(style=>style.remove());
    placeholder.replaceWith(document.importNode(parsed.documentElement,true));
  }
  async function animate(){
    try{
      await loadArtwork();
      await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',()=>window.gsap);
      await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',()=>window.ScrollTrigger);
      await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js',()=>window.MotionPathPlugin);
      const G=window.gsap,ST=window.ScrollTrigger;G.registerPlugin(ST,window.MotionPathPlugin);
      G.fromTo(foot,{clipPath:'inset(42% 0% 42% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:foot,start:'top bottom',end:'top 20%',scrub:true}});
      G.to($('.wordmark'),{'--wd':125,ease:'none',scrollTrigger:{trigger:foot,start:'top bottom',end:'bottom bottom',scrub:true}});
      [['.sk-far',40,'top 30%'],['.sk-mid',70,'top 30%'],['.sk-sun',90,'top 20%']].forEach(([selector,y,end])=>G.from($(selector),{y,ease:'none',scrollTrigger:{trigger:foot,start:'top bottom',end,scrub:.6}}));
      const pano=$('.pano'),sky=$('.sky3');pano.classList.add('panning');
      G.to(sky,{x:()=>-Math.max(0,sky.getBoundingClientRect().width-pano.clientWidth),ease:'none',scrollTrigger:{trigger:pano,start:'top 92%',endTrigger:foot,end:'bottom bottom',scrub:.5,invalidateOnRefresh:true}});
      G.fromTo($('.sk-plane'),{motionPath:{path:'#sk-route',align:'#sk-route',alignOrigin:[.5,.5],autoRotate:true,start:0,end:0}},{motionPath:{path:'#sk-route',align:'#sk-route',alignOrigin:[.5,.5],autoRotate:true,start:0,end:1},ease:'none',scrollTrigger:{trigger:pano,start:'top 92%',endTrigger:foot,end:'bottom bottom',scrub:.6}});
      ST.refresh();
    }catch{ /* Static artwork and footer controls remain usable if animation libraries fail. */ }
  }
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();animate();}},{rootMargin:'1000px'});observer.observe(foot);}else animate();
})();
