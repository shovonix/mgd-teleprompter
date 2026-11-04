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
/* Page-wide cursor glow. Mouse only, off for reduced motion. */
(function(){
  if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var d=document.createElement('div');d.className='fx-cursor';d.setAttribute('aria-hidden','true');
  var x=0,y=0,q=0;
  function paint(){q=0;d.style.setProperty('--cx',x+'px');d.style.setProperty('--cy',y+'px');}
  function add(){document.body.appendChild(d);}
  if(document.body) add(); else document.addEventListener('DOMContentLoaded',add);
  document.addEventListener('pointermove',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;x=e.clientX;y=e.clientY;d.classList.add('on');if(!q)q=requestAnimationFrame(paint);},{passive:true});
  document.documentElement.addEventListener('pointerleave',function(){d.classList.remove('on');});
})();
