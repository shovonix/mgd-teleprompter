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

/* mobile burger menu: mirrors .navlinks, shown <=820px */
(function(){
  function init(){
    var nav=document.querySelector('.navlinks'); if(!nav||document.querySelector('.fx-burger')) return;
    var row=nav.parentNode; row.style.position='relative';
    var btn=document.createElement('button'); btn.type='button'; btn.className='fx-burger';
    btn.setAttribute('aria-label','Menu'); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls','fx-menu');
    btn.innerHTML='<i></i><i></i><i></i>';
    var m=document.createElement('div'); m.className='fx-menu'; m.id='fx-menu'; m.hidden=true;
    [].forEach.call(nav.querySelectorAll('a'),function(a){
      var t=(a.textContent||'').trim()||a.getAttribute('aria-label'); if(!t) return;
      var c=document.createElement('a'); c.href=a.getAttribute('href'); c.textContent=t;
      if(a.target){c.target=a.target;c.rel='noopener';}
      if(!a.classList.contains('navlink')&&!a.classList.contains('navico')) c.className='cta';
      m.appendChild(c);
    });
    row.appendChild(btn); row.appendChild(m);
    function set(o){m.hidden=!o;btn.classList.toggle('open',o);btn.setAttribute('aria-expanded',o?'true':'false');}
    btn.addEventListener('click',function(e){e.stopPropagation();set(m.hidden);});
    m.addEventListener('click',function(e){if(e.target.tagName==='A')set(false);});
    document.addEventListener('click',function(e){if(!m.hidden&&!m.contains(e.target))set(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden){set(false);btn.focus();}});
    window.addEventListener('resize',function(){if(innerWidth>820)set(false);});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
