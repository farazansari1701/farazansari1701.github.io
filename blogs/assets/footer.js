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
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=src;script.async=true;
      const finish=error=>{clearTimeout(timeout);script.onload=script.onerror=null;if(error){script.remove();reject(error);}else resolve();};
      const timeout=setTimeout(()=>finish(new Error('Footer animation library timed out')),8000);
      script.onload=()=>finish(exists()?null:new Error('Footer animation library unavailable'));
      script.onerror=()=>finish(new Error('Footer animation library failed to load'));
      document.head.appendChild(script);
    });
  }
  async function animate(){
    let context;
    try{
      await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',()=>window.gsap);
      await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',()=>window.ScrollTrigger);
      // A missing optional plane plugin must not disable the rest of the footer.
      try{await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js',()=>window.MotionPathPlugin);}catch{}
      const G=window.gsap,ST=window.ScrollTrigger;G.registerPlugin(ST);
      if(window.MotionPathPlugin)G.registerPlugin(window.MotionPathPlugin);
      const pano=$('.pano'),sky=$('.sky3');
      if(!pano||!sky||!$('#sk-route')||!$('.sk-plane'))return;
      context=G.context(()=>{},foot);
      context.add(()=>{
      G.fromTo(foot,{clipPath:'inset(42% 0% 42% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:foot,start:'top bottom',end:'top 20%',scrub:true}});
      G.to($('.wordmark'),{'--wd':125,ease:'none',scrollTrigger:{trigger:foot,start:'top bottom',end:'bottom bottom',scrub:true}});
      [['.sk-far',40,'top 30%'],['.sk-mid',70,'top 30%'],['.sk-sun',90,'top 20%']].forEach(([selector,y,end])=>G.from($(selector),{y,ease:'none',scrollTrigger:{trigger:foot,start:'top bottom',end,scrub:.6}}));
      G.to(sky,{x:()=>-Math.max(0,sky.getBoundingClientRect().width-pano.clientWidth),ease:'none',scrollTrigger:{trigger:pano,start:'top 92%',endTrigger:foot,end:'bottom bottom',scrub:.5,invalidateOnRefresh:true}});
      if(window.MotionPathPlugin)G.fromTo($('.sk-plane'),{motionPath:{path:'#sk-route',align:'#sk-route',alignOrigin:[.5,.5],autoRotate:true,start:0,end:0}},{motionPath:{path:'#sk-route',align:'#sk-route',alignOrigin:[.5,.5],autoRotate:true,start:0,end:1},ease:'none',scrollTrigger:{trigger:pano,start:'top 92%',endTrigger:foot,end:'bottom bottom',scrub:.6}});
      });
      pano.classList.add('panning');
      ST.refresh();
    }catch{
      context?.revert();$('.pano')?.classList.remove('panning');
      // The original SVG and native footer controls stay usable without GSAP.
    }
  }
  // Start with the document, as on the portfolio, including direct footer links.
  animate();
})();
