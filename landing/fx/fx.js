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
/* Page-wide glow on the opposite side of the screen from the mouse, eased. Mouse only, off for reduced motion. */
(function(){
  if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var d=document.createElement('div');d.className='fx-cursor';d.setAttribute('aria-hidden','true');
  var tx=0,ty=0,cx=0,cy=0,run=0,first=true;
  function add(){document.body.appendChild(d);}
  if(document.body) add(); else document.addEventListener('DOMContentLoaded',add);
  function tick(){
    cx+=(tx-cx)*0.07; cy+=(ty-cy)*0.07;
    d.style.setProperty('--cx',cx.toFixed(1)+'px'); d.style.setProperty('--cy',cy.toFixed(1)+'px');
    if(Math.abs(tx-cx)>.5||Math.abs(ty-cy)>.5) run=requestAnimationFrame(tick); else run=0;
  }
  document.addEventListener('pointermove',function(e){
    if(e.pointerType&&e.pointerType!=='mouse') return;
    tx=innerWidth-e.clientX; ty=innerHeight-e.clientY;       /* mirror through the screen centre */
    if(first){cx=tx;cy=ty;first=false;}
    d.classList.add('on'); if(!run) run=requestAnimationFrame(tick);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',function(){d.classList.remove('on');});
})();
