/* Speakwell adjustable sidebar: touch/mouse drag + accessible keyboard control. */
(function(){
'use strict';
const app=document.querySelector('.app');
const handle=document.getElementById('railResizer');
if(!app||!handle)return;
const KEY='speakwell.sidebar.width';
const DEFAULT=256,MIN=176,MAX=520,CONTENT_MIN=338,HANDLE=12;
let preferred=DEFAULT;
try{
  const stored=Number(localStorage.getItem(KEY));
  if(Number.isFinite(stored)&&stored>=MIN&&stored<=MAX)preferred=stored;
}catch(e){}
let current=DEFAULT,drag=null;
const isWide=()=>window.matchMedia('(min-width:760px)').matches;
const maxWidth=()=>Math.max(MIN,Math.min(MAX,window.innerWidth-CONTENT_MIN-HANDLE));
const clamp=n=>Math.round(Math.max(MIN,Math.min(maxWidth(),n)));
function update(value){
  current=clamp(value);
  app.style.setProperty('--rail-width',current+'px');
  handle.setAttribute('aria-valuemin',String(MIN));
  handle.setAttribute('aria-valuemax',String(maxWidth()));
  handle.setAttribute('aria-valuenow',String(current));
  handle.setAttribute('aria-valuetext',current+' pixels');
}
function save(value){
  preferred=Math.round(Math.max(MIN,Math.min(MAX,value)));
  try{localStorage.setItem(KEY,String(preferred));}catch(e){}
}
function finish(e){
  if(!drag||e.pointerId!==drag.pointerId)return;
  try{handle.releasePointerCapture(e.pointerId);}catch(err){}
  save(current);drag=null;
  app.classList.remove('sidebar-dragging');
}
handle.addEventListener('pointerdown',e=>{
  if(!isWide()||app.classList.contains('rail-off')||e.button!==0)return;
  if(e.cancelable)e.preventDefault();
  drag={pointerId:e.pointerId,startX:e.clientX,startWidth:current};
  app.classList.add('sidebar-dragging');
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.pointerId)return;
  update(drag.startWidth+e.clientX-drag.startX);
});
handle.addEventListener('pointerup',finish);
handle.addEventListener('pointercancel',finish);
handle.addEventListener('lostpointercapture',e=>{
  if(!drag||e.pointerId!==drag.pointerId)return;
  save(current);drag=null;app.classList.remove('sidebar-dragging');
});
handle.addEventListener('keydown',e=>{
  if(!isWide()||app.classList.contains('rail-off'))return;
  let next=null,step=e.shiftKey?40:16;
  if(e.key==='ArrowLeft')next=current-step;
  if(e.key==='ArrowRight')next=current+step;
  if(e.key==='Home')next=MIN;
  if(e.key==='End')next=maxWidth();
  if(next===null)return;
  e.preventDefault();update(next);save(current);
});
handle.addEventListener('dblclick',e=>{
  if(!isWide()||app.classList.contains('rail-off'))return;
  e.preventDefault();update(DEFAULT);save(DEFAULT);
});
window.addEventListener('resize',()=>{
  if(!drag)update(preferred);
}, {passive:true});
update(preferred);
})();