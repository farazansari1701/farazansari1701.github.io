/* One accessible full-screen menu controller for every page, including home. */
(() => {
  'use strict';
  const menu=document.getElementById('menu');
  const button=document.getElementById('menu-btn');
  const closeButton=document.getElementById('menu-close');
  if(!menu||!button||!closeButton)return;
  let open=false;
  function toggle(next, restoreFocus=true){
    if(next===open)return;
    open=next;
    menu.inert=!next;
    menu.setAttribute('aria-hidden',String(!next));
    menu.classList.toggle('open',next);
    document.documentElement.classList.toggle('menu-open',next);
    button.setAttribute('aria-expanded',String(next));
    // Homepage Lenis and other optional effects subscribe without duplicating control logic.
    document.dispatchEvent(new CustomEvent('site-menu:toggle',{detail:{open:next}}));
    if(next){
      const scroll=menu.querySelector('.menu-scroll');
      if(scroll)scroll.scrollTop=0;
      closeButton.focus({preventScroll:true});
    }else if(restoreFocus)button.focus({preventScroll:true});
  }
  menu.inert=true;
  menu.setAttribute('aria-hidden','true');
  button.setAttribute('aria-expanded','false');
  button.addEventListener('click',()=>toggle(!open));
  closeButton.addEventListener('click',()=>toggle(false));
  document.addEventListener('keydown',event=>{
    if(!open)return;
    if(event.key==='Escape'){
      event.preventDefault();toggle(false);return;
    }
    if(event.key!=='Tab')return;
    const items=[...menu.querySelectorAll('a[href],button:not([disabled])')];
    if(!items.length){event.preventDefault();closeButton.focus({preventScroll:true});return;}
    const first=items[0],last=items[items.length-1],active=document.activeElement;
    if(event.shiftKey&&(active===first||!menu.contains(active))){
      event.preventDefault();last.focus({preventScroll:true});
    }else if(!event.shiftKey&&(active===last||!menu.contains(active))){
      event.preventDefault();first.focus({preventScroll:true});
    }
  });
  menu.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(!link)return;
    // Retain keyboard focus on same-document anchor navigation.
    // Other pages navigate naturally and should not regain focus on this document.
    const samePage=link.origin===location.origin &&
      link.pathname===location.pathname && link.search===location.search &&
      Boolean(link.hash);
    toggle(false,samePage);
  });
  window.addEventListener('pageshow',()=>{if(open)toggle(false,false)});
})();
