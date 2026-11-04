/*! space-nav.js - Space key moves through page sections.
 *  Space = next section · double Space = previous · hold Space = top.
 *  Use: <script src="https://shovonix.dev/fx/space-nav.js" defer></script>
 *  Mark sections with data-space-section; otherwise it auto-detects (main > *, body > section).
 *  Options on the script tag: data-offset="64" (sticky header height), data-hint="off".
 */
(function(){
  var me=document.currentScript||document.querySelector('script[src*="space-nav"]');
  var OFFSET=+(me&&me.getAttribute('data-offset'))||0;
  var HINT=!(me&&me.getAttribute('data-hint')==='off');
  var TAP_GAP=300, HOLD=500, EDGE=30;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  function sections(){
    var l=[].slice.call(document.querySelectorAll('[data-space-section]'));
    if(!l.length) l=[].slice.call(document.querySelectorAll('main > *, body > section, article > section'));
    return l.filter(function(e){return e.offsetHeight>120;});
  }
  function skip(t){
    if(!t||t===document.body||t===document.documentElement) return false;
    var n=(t.tagName||'').toLowerCase();
    return /^(input|textarea|select|button|a|video|audio|iframe|summary)$/.test(n)||t.isContentEditable||(t.getAttribute&&/^(button|link|textbox|slider|tab|menuitem)$/.test(t.getAttribute('role')||''))||!!(t.closest&&t.closest('dialog[open],[aria-modal="true"]'));
  }
  function go(y){window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});}
  /* Where a section should land: its first heading/content sits just under the top edge,
     so the empty padding above it is skipped and the section is framed properly. */
  var PAD=56;
  function rel(el,i){
    if(i===0) return -scrollY;
    var c=el.querySelector('h1,h2,h3,.eyebrow,video,img,p')||el;
    return c.getBoundingClientRect().top-PAD-OFFSET;
  }
  function next(){
    var s=sections();
    for(var i=0;i<s.length;i++){var r=rel(s[i],i); if(r>EDGE){go(scrollY+r);return;}}
    go(document.documentElement.scrollHeight);
  }
  function prev(){
    var s=sections(), best=null;
    for(var i=0;i<s.length;i++){var r=rel(s[i],i); if(r<-EDGE) best=r;}
    go(best===null?0:scrollY+best);
  }
  var down=false, held=false, holdT=null, tapT=null, lastTap=0;
  addEventListener('keydown',function(e){
    if(e.code!=='Space'||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||skip(e.target)) return;
    e.preventDefault(); hideHint();
    if(e.repeat||down) return;
    down=true; held=false;
    holdT=setTimeout(function(){held=true;clearTimeout(tapT);tapT=null;go(0);},HOLD);
  });
  addEventListener('keyup',function(e){
    if(e.code!=='Space'||!down) return;
    down=false; clearTimeout(holdT);
    if(held){held=false;return;}
    var now=Date.now();
    if(tapT&&now-lastTap<TAP_GAP+120){clearTimeout(tapT);tapT=null;lastTap=0;prev();return;}
    lastTap=now; tapT=setTimeout(function(){tapT=null;next();},TAP_GAP);
  });
  /* one-time hint */
  var chip=null;
  function hideHint(){if(chip){chip.style.opacity='0';var c=chip;chip=null;setTimeout(function(){c.remove();},400);try{localStorage.setItem('spaceNavHint','1');}catch(_){}}}
  if(HINT&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    var seen=false;try{seen=localStorage.getItem('spaceNavHint')==='1';}catch(_){}
    if(!seen) setTimeout(function(){
      chip=document.createElement('div');
      chip.setAttribute('role','note');
      chip.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9999;padding:9px 16px;border-radius:999px;background:rgba(20,20,22,.92);border:1px solid rgba(255,255,255,.14);color:#cfcfd2;font:500 12.5px/1 system-ui,sans-serif;letter-spacing:.01em;white-space:nowrap;opacity:0;transition:opacity .4s;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.5)';
      chip.innerHTML='<b style="color:#fff">Space</b> next &nbsp;·&nbsp; <b style="color:#fff">Space Space</b> back &nbsp;·&nbsp; <b style="color:#fff">hold Space</b> top';
      document.body.appendChild(chip);
      requestAnimationFrame(function(){chip.style.opacity='1';});
      setTimeout(hideHint,7000);
    },1800);
  }
})();
