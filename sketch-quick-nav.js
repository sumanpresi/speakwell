/* Fixed, one-tap access to Sentence Sketchbook sections on phones. */
(function(){
'use strict';
const bar=document.getElementById('sketchQuickNav');
if(!bar)return;
const names=['map','builder','practice','thinking'];
let pending=null,active='map';
function sketchSelected(){return (location.hash||'').split('~')[0].replace(/^#/,'')==='sketch';}
function frame(){return document.querySelector('iframe.studio-frame[src="sentence-sketchbook.html"]');}
function selected(page){
 if(!names.includes(page))return;
 active=page;
 bar.querySelectorAll('[data-sketch-section]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.sketchSection===page));
 });
}
function sync(){
 const visible=sketchSelected();
 bar.hidden=!visible;
 document.body.classList.toggle('sketch-shortcuts-active',visible);
 if(!visible){pending=null;active='map';selected('map');}
}
function send(page){
 const child=frame();
 if(!child||!child.contentWindow){pending=page;return;}
 child.contentWindow.postMessage({type:'speakwell:sketch-select',page:page},location.origin);
}
bar.addEventListener('click',event=>{
 const button=event.target.closest('[data-sketch-section]');
 if(!button||!sketchSelected())return;
 const page=button.dataset.sketchSection;
 if(!names.includes(page))return;
 selected(page);
 send(page);
});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||!sketchSelected())return;
 const child=frame();
 if(!child||event.source!==child.contentWindow)return;
 const msg=event.data;
 if(msg&&msg.type==='speakwell:sketch-selected'&&names.includes(msg.page))selected(msg.page);
});
document.addEventListener('load',event=>{
 if(!sketchSelected())return;
 const child=frame();
 if(child&&event.target===child&&pending){const page=pending;pending=null;send(page);}
},true);
window.addEventListener('hashchange',sync);
window.addEventListener('pageshow',sync);
sync();
})();