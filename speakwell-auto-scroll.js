/* Single continuous scroll for Speakwell's nested lessons. */
(function(){
'use strict';
const SIZE='speakwell:frame-size:v1',JUMP='speakwell:frame-scroll:v1',targetOrigin=location.origin==='null'?'*':location.origin;
let last=0,scheduled=false;
function measure(){
 if(!document.body)return 0;
 const b=document.body,c=getComputedStyle(b),r=b.getBoundingClientRect();
 return Math.ceil(Math.max(b.scrollHeight,r.height)+(parseFloat(c.marginTop)||0)+(parseFloat(c.marginBottom)||0)+12);
}
function send(){
 if(window.parent===window)return;
 const h=measure();
 if(h>100&&h<100000&&Math.abs(h-last)>2){last=h;window.parent.postMessage({type:SIZE,height:h},targetOrigin);}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;send();});}
function directFrame(source){
 for(const frame of document.querySelectorAll('iframe[data-speakwell-autosize]'))if(frame.contentWindow===source)return frame;
 return null;
}
window.addEventListener('message',e=>{
 if(location.origin!=='null'&&e.origin!==location.origin)return;
 const v=e.data;
 if(!v||typeof v!=='object'||(v.type!==SIZE&&v.type!==JUMP))return;
 const frame=directFrame(e.source);
 if(!frame)return;
 if(v.type===SIZE){
  const h=Number(v.height);
  if(!Number.isFinite(h)||h<150||h>100000)return;
  if(Math.abs(h-(parseFloat(frame.style.height)||0))>2){
   frame.style.height=h+'px';
   frame.style.overflow='hidden';
   schedule();
  }
 }else{
  const off=Number(v.offset);if(!Number.isFinite(off)||Math.abs(off)>100000)return;
  const relative=frame.getBoundingClientRect().top+off;
  if(window.parent!==window)window.parent.postMessage({type:JUMP,offset:relative},targetOrigin);
  else window.scrollBy({top:relative-90,behavior:'smooth'});
 }
});
window.speakwellScrollTo=element=>{
 if(!element)return;
 if(window.parent===window){element.scrollIntoView({behavior:'smooth',block:'start'});return;}
 window.parent.postMessage({type:JUMP,offset:element.getBoundingClientRect().top},targetOrigin);
};
document.addEventListener('click',e=>{
 if(window.parent===window)return;
 const anchor=e.target.closest&&e.target.closest('a[href^="#"]');
 if(!anchor)return;
 const href=anchor.getAttribute('href');if(!href||href==='#')return;
 let id;try{id=decodeURIComponent(href.slice(1));}catch(err){return;}
 const element=document.getElementById(id);
 if(element){e.preventDefault();window.speakwellScrollTo(element);}
});
function init(){
 if(window.parent===window||!document.body)return;
 if(typeof ResizeObserver!=='undefined'){
  const ro=new ResizeObserver(schedule);
  ro.observe(document.body);
  ro.observe(document.documentElement);
 }
 const mo=new MutationObserver(schedule);
 mo.observe(document.body,{childList:true,subtree:true,characterData:true});
 schedule();setTimeout(schedule,150);setTimeout(schedule,500);setTimeout(schedule,1400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('load',schedule);
window.addEventListener('resize',schedule);
})();