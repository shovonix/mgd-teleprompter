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
  var DOUBLE=520, HOLD=450, EDGE=30;
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
  /* instant, smooth scroll: fixed short ease-out, interruptible */
  var raf=0;
  function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}}
  function go(y){
    stop();
    var max=document.documentElement.scrollHeight-innerHeight;
    y=Math.max(0,Math.min(max,y));
    var from=scrollY, d=y-from;
    if(!d) return;
    if(reduce){scrollTo(0,y);return;}
    var dur=Math.min(380,160+Math.abs(d)/8), t0=performance.now();
    (function step(t){
      var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3);
      scrollTo(0,from+d*e);
      raf=k<1?requestAnimationFrame(step):0;
    })(t0);
  }
  ['wheel','touchstart','mousedown'].forEach(function(n){addEventListener(n,stop,{passive:true});});
  /* Where a section should land: first heading/content just under the top edge. */
  var PAD=56;
  function anchors(){
    return sections().map(function(el,i){
      if(i===0) return 0;
      var c=el.querySelector('h1,h2,h3,.eyebrow,video,img,p')||el;
      return c.getBoundingClientRect().top+scrollY-PAD-OFFSET;
    });
  }
  function nextFrom(y){var a=anchors();for(var i=0;i<a.length;i++) if(a[i]>y+EDGE) return a[i]; return 1e9;}
  function prevFrom(y){var a=anchors(),b=0;for(var i=0;i<a.length;i++) if(a[i]<y-EDGE) b=a[i]; return b;}
  var down=false, held=false, dbl=false, holdT=null, lastDown=0, origin=0;
  addEventListener('keydown',function(e){
    if(e.code!=='Space'||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||skip(e.target)) return;
    e.preventDefault(); hideHint();
    if(e.repeat||down) return;
    down=true; held=false; dbl=false;
    var now=Date.now();
    if(lastDown&&now-lastDown<DOUBLE){            /* second press: go back from where the first started */
      dbl=true; lastDown=0; go(prevFrom(origin)); return;
    }
    lastDown=now;
    holdT=setTimeout(function(){held=true;lastDown=0;go(0);},HOLD);
  });
  addEventListener('keyup',function(e){
    if(e.code!=='Space'||!down) return;
    down=false; clearTimeout(holdT);
    if(dbl||held){dbl=held=false;return;}
    origin=scrollY; go(nextFrom(origin));         /* single tap: next section, instantly */
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
