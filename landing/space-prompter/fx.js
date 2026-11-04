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
