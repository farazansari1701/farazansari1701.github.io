/* Consent-gated interaction events. Intent is not a confirmed enquiry. */
(() => {
  'use strict';
  const granted=()=>{try{return localStorage.getItem('fa-consent')==='granted';}catch{return false;}};
  const emit=(name,params)=>{if(granted()&&typeof window.gtag==='function')window.gtag('event',name,params);};
  const params=()=>({page_path:location.pathname});
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(!link)return;
    let url;try{url=new URL(link.href,location.href);}catch{return;}
    const page_path=location.pathname;
    if(url.protocol==='mailto:'||url.protocol==='tel:'){
      emit('contact_click',{method:url.protocol==='mailto:'?'email':'phone',page_path});
    }else if(/(^|\.)calendly\.com$/.test(url.hostname)){
      emit('booking_intent',{booking_provider:'calendly',page_path});
      emit('contact_click',{method:'booking',page_path});
    }else if(/\.(pdf|docx?)$/i.test(url.pathname)){
      const download=link.hasAttribute('download');
      const cv=/(?:cv|resume)/i.test(url.pathname);
      emit(cv?(download?'cv_download':'cv_open'):(download?'file_download':'file_open'),
        {file_path:url.pathname,file_extension:url.pathname.split('.').pop(),page_path});
    }else if(url.origin===location.origin&&/^\/projects\/[^/]+\/$/.test(url.pathname)){
      emit('project_click',{project_slug:url.pathname.split('/')[2],source_page:page_path});
    }else if(url.origin!==location.origin&&/^https?:$/.test(url.protocol)){
      const profile=/(^|\.)(linkedin\.com|instagram\.com|facebook\.com)$/.test(url.hostname);
      emit(profile?'outbound_profile_click':'outbound_click',{link_domain:url.hostname,page_path});
    }
  });
  // A visit is recorded on the actual destination, after consent and DOM readiness.
  const projectMatch=location.pathname.match(/^\/projects\/([^/]+)\/$/);
  if(projectMatch){
    let viewed=false;
    const view=()=>{if(viewed||!granted())return;viewed=true;emit('project_visit',{project_slug:projectMatch[1],page_path:location.pathname});};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',view,{once:true});
    else view();
    // Consent may be granted after the page loads; count one eligible view.
    window.addEventListener('fa:consent-granted',view,{once:true});
  }
  // Trusted Calendly embed messages signify a successfully scheduled booking.
  // A mere outbound Calendly link remains booking_intent, not booking_confirmed.
  window.addEventListener('message',event=>{
    if(!/^https:\/\/([a-z0-9-]+\.)*calendly\.com$/i.test(event.origin))return;
    if(!event.data||event.data.event!=='calendly.event_scheduled')return;
    emit('booking_confirmed',{booking_provider:'calendly',page_path:location.pathname});
  });
  // Load Calendly only when the user asks to schedule. The ordinary link
  // remains the fallback on blocked scripts and without JavaScript.
  let calendlyLoading;
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const anchor=event.target.closest?.('a[href]');
    if(!anchor)return;
    let href;try{href=new URL(anchor.href,location.href);}catch{return;}
    if(!/(^|\.)calendly\.com$/.test(href.hostname))return;
    event.preventDefault();
    const fallback=()=>window.open(href.href,'_blank','noopener,noreferrer');
    if(window.Calendly?.initPopupWidget){
      window.Calendly.initPopupWidget({url:href.href});return;
    }
    if(!calendlyLoading){
      calendlyLoading=new Promise((resolve,reject)=>{
        const style=document.createElement('link');
        style.rel='stylesheet';
        style.href='https://assets.calendly.com/assets/external/widget.css';
        document.head.appendChild(style);
        const script=document.createElement('script');
        script.src='https://assets.calendly.com/assets/external/widget.js';
        script.async=true;
        script.onload=()=>window.Calendly?.initPopupWidget?resolve():reject(Error('Calendly widget missing'));
        script.onerror=()=>reject(Error('Calendly widget blocked'));
        document.head.appendChild(script);
      });
    }
    calendlyLoading.then(()=>window.Calendly.initPopupWidget({url:href.href})).catch(fallback);
  });
  const article=document.getElementById('article-body');
  if(!article)return;
  let activeSeconds=0,furthest=0,sent=false;
  const recordDepth=()=>{
    const rect=article.getBoundingClientRect();
    furthest=Math.max(furthest,Math.min(1,Math.max(0,(innerHeight-rect.top)/rect.height)));
  };
  window.addEventListener('scroll',recordDepth,{passive:true});recordDepth();
  const timer=setInterval(()=>{
    if(!granted()){activeSeconds=0;return;}
    if(document.visibilityState==='visible')activeSeconds+=5;
    if(!sent&&activeSeconds>=60&&furthest>=.75&&typeof window.gtag==='function'){
      emit('article_read',{page_path:location.pathname,percent_read:75,active_seconds:activeSeconds});
      sent=true;clearInterval(timer);
    }
  },5000);
})();
