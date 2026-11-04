/* Cards: soft glow follows the pointer. Mouse only, no touch. */
(function(){
  if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.addEventListener('pointermove',function(e){
    var c=e.target.closest&&e.target.closest('.card'); if(!c) return;
    var r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  },{passive:true});
})();
/* Page-wide soft glow under the mouse. Mouse only, off for reduced motion. */
(function(){
  if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var d=document.createElement('div');d.className='fx-cursor';d.setAttribute('aria-hidden','true');
  var tx=0,ty=0,cx=0,cy=0,run=0,first=true;
  function add(){document.body.appendChild(d);}
  if(document.body) add(); else document.addEventListener('DOMContentLoaded',add);
  function tick(){
    cx+=(tx-cx)*0.35; cy+=(ty-cy)*0.35;   /* tiny ease, feels instant */
    d.style.setProperty('--cx',cx.toFixed(1)+'px'); d.style.setProperty('--cy',cy.toFixed(1)+'px');
    if(Math.abs(tx-cx)>.5||Math.abs(ty-cy)>.5) run=requestAnimationFrame(tick); else run=0;
  }
  document.addEventListener('pointermove',function(e){
    if(e.pointerType&&e.pointerType!=='mouse') return;
    tx=e.clientX; ty=e.clientY;
    if(first){cx=tx;cy=ty;first=false;}
    d.classList.add('on'); if(!run) run=requestAnimationFrame(tick);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',function(){d.classList.remove('on');});
})();
/* Gentle scroll parallax: headlines drift slightly faster, screenshots/cards slightly slower.
   Uses the CSS `translate` property (stacks with existing transforms). Offset is zero at the top of the page.
   Off on blog, touch, small screens, reduced motion. */
(function(){
  if(/^\/blog(\/|$)/.test(location.pathname)) return;
  if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var T=[], q=0;
  function clamp(v,m){return Math.max(-m,Math.min(m,v));}
  function measure(){
    var vh=innerHeight;
    T.forEach(function(t){
      t.el.style.translate='';
      var r=t.el.getBoundingClientRect();
      t.pc=r.top+scrollY+r.height/2;                          /* page position of the element's centre */
      t.f0=t.pc<vh*1.6?clamp((vh/2-t.pc)*t.k,t.m):0;           /* first-screen items start at rest; others rest when centred */
    });
  }
  function setup(){
    [['h1',-0.05,22],['.shot',0.06,30],['.fx-glow-box',0.05,26]].forEach(function(r){
      [].forEach.call(document.querySelectorAll(r[0]),function(el){T.push({el:el,k:r[1],m:r[2]});});
    });
    if(!T.length) return;
    measure(); update();
    addEventListener('scroll',req,{passive:true});
    addEventListener('resize',function(){measure();req();});
    addEventListener('load',function(){measure();req();});
  }
  function req(){if(!q)q=requestAnimationFrame(update);}
  function update(){
    q=0; var vh=innerHeight, sy=scrollY, small=innerWidth<821;
    T.forEach(function(t){
      if(small){t.el.style.translate='';return;}
      var sc=t.pc-sy;                                         /* centre relative to viewport top */
      if(sc<-vh||sc>2*vh) return;                             /* far off screen: skip */
      var y=clamp((vh/2-sc)*t.k,t.m)-t.f0;
      t.el.style.translate='0 '+y.toFixed(1)+'px';
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup); else setup();
})();
