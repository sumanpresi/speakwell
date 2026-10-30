
(function () {
  'use strict';
  const get = id => document.getElementById(id);
  if (!get('practice') || !get('p1')) return;
  let serial=0, lastSpoken='';
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=document.createElement('button');
  button.type='button';button.className='primary';button.id='thinkAIReview';button.textContent='✨ AI Review & Correct';
  get('check').parentElement.insertBefore(button,get('clear'));
  const note=document.createElement('p');note.className='ai-note';
  note.textContent='Uses your existing Speakwell API key and model. AI Review needs internet and may incur API charges. Your answers go to your configured AI provider only when you tap Review. The normal structure check works offline.';
  get('check').parentElement.insertAdjacentElement('afterend',note);
  const panel=document.createElement('section');panel.id='thinkAIResult';panel.className='ai-results';panel.hidden=true;panel.setAttribute('aria-live','polite');
  note.insertAdjacentElement('afterend',panel);
  function reset(){serial++;panel.hidden=true;panel.innerHTML='';button.disabled=false;button.textContent='✨ AI Review & Correct';}
  document.querySelectorAll('#clear,[data-context],[data-level],[data-framework]').forEach(el=>el.addEventListener('click',reset));
  function highlight(original,corrected){
    const old=original.trim().split(/\s+/).filter(Boolean),words=corrected.trim().split(/\s+/).filter(Boolean);
    if(old.length>120||words.length>120)return esc(corrected);
    const norm=s=>s.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g,'');
    const dp=Array.from({length:old.length+1},()=>Array(words.length+1).fill(0));
    for(let i=old.length-1;i>=0;i--)for(let j=words.length-1;j>=0;j--)dp[i][j]=norm(old[i])===norm(words[j])?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
    let i=0,j=0;const keep=new Set();
    while(i<old.length&&j<words.length){if(norm(old[i])===norm(words[j])){keep.add(j);i++;j++}else if(dp[i+1][j]>=dp[i][j+1])i++;else j++;}
    let n=-1;return (corrected.match(/\s+|\S+/g)||[]).map(t=>{if(/^\s+$/.test(t))return esc(t);n++;return keep.has(n)?esc(t):'<mark class="ai-highlight">'+esc(t)+'</mark>';}).join('');
  }
  function showResult(answers,labels,data){
    let html='<h3>Your writing compared with corrected English</h3><p class="ai-explain">Changed words are highlighted in green. Some changes improve style rather than fix errors.</p>';
    for(let i=0;i<3;i++){
      const part=data.sections[i]||{},before=answers[i],after=String(part.corrected||before);
      const issues=Array.isArray(part.issues)?part.issues.slice(0,3):[];
      html+='<section class="ai-pair"><h4>'+esc(labels[i])+'</h4><div class="ai-columns">'+
        '<div class="ai-cell"><b>Your writing</b><p>'+esc(before)+'</p></div>'+
        '<div class="ai-cell ai-corrected"><b>Corrected sentence</b><p>'+highlight(before,after)+'</p></div></div>'+
        '<div class="ai-issues"><b>What to learn</b><ul>'+
        (issues.length?issues.map(item=>'<li><strong>'+esc(item.type||'Improvement')+':</strong> '+esc(item.why||'')+
          (item.before&&item.after?'<div class="ai-change">'+esc(item.before)+' → '+esc(item.after)+'</div>':'')+'</li>').join(''):'<li>No specific mistake identified. Any rewording is optional.</li>')+
        '</ul></div></section>';
    }
    const total=data.overall||{};lastSpoken=String(total.spoken||data.sections.map(x=>x.corrected).join(' '));
    html+='<div class="ai-summary"><h4>Communication coaching</h4>'+
      '<p><b>What you did well:</b> '+esc(total.strength||'You prepared all three ideas.')+'</p>'+
      '<p><b>Thought structure:</b> '+esc(total.structure||'Check the link between your three ideas.')+'</p>'+
      '<p><b>Improve next:</b> '+esc(total.next||'Practise expressing each idea in one short sentence.')+'</p>'+
      '<div class="ai-natural"><b>Natural spoken version</b><p>'+esc(lastSpoken)+'</p></div>'+
      '<div class="ai-actions"><button type="button" id="aiCopySpeech">Copy corrected speech</button><button type="button" id="aiListenSpeech">🔊 Listen</button></div></div>'+
      '<p class="ai-note">AI suggestions can be imperfect. Use them to practise, not as a final judgement.</p>';
    panel.innerHTML=html;panel.hidden=false;(window.speakwellScrollTo?window.speakwellScrollTo(panel):panel.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }
  async function getFeedback(answers,labels){
    let settings={};
    try{settings=(JSON.parse(localStorage.getItem('speakwell.v1')||'{}').settings||{});}catch(e){throw Error('Could not read Speakwell Settings. Please save them again.');}
    if(!settings.apiKey)throw Error('Add your AI API key in Speakwell Settings before using AI Review.');
    if(navigator.onLine===false)throw Error('You are offline. Use Check my structure until you are online.');
    const instruction='You are a professional spoken English and management communication teacher. Review three learner-written answers using the given speaking question and framework. Return a JSON object ONLY with this schema: '+
      '{"sections":[{"corrected":"full natural sentence","issues":[{"type":"Grammar or Clarity or Structure or Tone or Sentence completion","before":"original words","after":"corrected words","why":"brief plain English explanation"}]},{"corrected":"full sentence","issues":[]},{"corrected":"full sentence","issues":[]}],"overall":{"strength":"...","structure":"...","next":"...","spoken":"..."}}. '+
      'Exactly 3 sections in the same order. Each corrected field should be a complete natural sentence. Preserve the learner meaning, do not invent facts or change their intended suggestion. '+
      'Give 0-3 precise issues per section. State what changed and why. If the input is just keywords, explain that it needs sentence completion rather than calling the keywords a grammar mistake. '+
      'If something is correct, keep it, and return no issues. Comment briefly on whether the three-part logic fits the question. Spoken is 2-4 short natural sentences combining the answer. Keep feedback simple and supportive.';
    const messages=[{role:'system',content:instruction},{role:'user',content:JSON.stringify({question:get('practicePrompt').textContent,framework:labels,answers:answers})}];
    const base=String(settings.baseUrl||'https://api.openai.com/v1').replace(/\/+$/,'');
    async function request(jsonMode){
      const body={model:settings.model||'gpt-5.6-luna',messages:messages};
      if(jsonMode)body.response_format={type:'json_object'};
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
      try{
        const response=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+settings.apiKey},body:JSON.stringify(body),signal:controller.signal});
        const data=await response.json().catch(()=>{throw Error('The AI service sent an unreadable response.');});
        if(!response.ok){
          const message=(data.error&&data.error.message)||('HTTP '+response.status);
          const error=new Error(response.status===401?'The API key was rejected. Check Speakwell Settings.':response.status===429?'Rate or billing limit reached: '+message:message);
          error.retryPlain=jsonMode&&/response_format|json_object|json mode/i.test(message);
          throw error;
        }
        let raw=data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
        if(Array.isArray(raw))raw=raw.map(x=>x.text||'').join('');
        if(!raw)throw Error('AI returned an empty response.');
        raw=String(raw);const start=raw.indexOf('{'),end=raw.lastIndexOf('}');
        if(start>=0&&end>start)raw=raw.slice(start,end+1);
        let parsed;try{parsed=JSON.parse(raw)}catch(e){throw Error('Could not read the AI correction. Please try again.');}
        if(!Array.isArray(parsed.sections)||parsed.sections.length!==3)throw Error('The AI returned an incomplete review. Please try again.');
        return parsed;
      }finally{clearTimeout(timer);}
    }
    try{return await request(true);}catch(e){if(e.retryPlain)return await request(false);throw e;}
  }
  button.addEventListener('click',async()=>{
    const answers=['p1','p2','p3'].map(id=>get(id).value.trim());
    panel.hidden=false;
    if(answers.some(x=>!x)){panel.innerHTML='<p class="ai-error">Please fill all three boxes first.</p>';return;}
    if(answers.some(x=>x.length>1200)){panel.innerHTML='<p class="ai-error">Please keep each answer under 1,200 characters.</p>';return;}
    const labels=['f1Label','f2Label','f3Label'].map(id=>get(id).textContent.replace(/^\d+\.\s*/,''));
    const id=++serial;button.disabled=true;button.textContent='Reviewing…';panel.textContent='Checking grammar, clarity and thought structure…';
    try{const data=await getFeedback(answers,labels);if(id===serial)showResult(answers,labels,data);}
    catch(e){if(id===serial){panel.innerHTML='<p class="ai-error">'+esc(e.name==='AbortError'?'The request timed out. Please try again.':(e.message||'AI review failed.'))+'</p>';}}
    finally{if(id===serial){button.disabled=false;button.textContent='✨ AI Review & Correct';}}
  });
  panel.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||!lastSpoken)return;
    if(b.id==='aiCopySpeech'){
      if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(lastSpoken).then(()=>b.textContent='Copied ✓').catch(()=>{b.textContent='Copy unavailable';});
      else{const area=document.createElement('textarea');area.value=lastSpoken;document.body.appendChild(area);area.select();try{document.execCommand('copy');b.textContent='Copied ✓';}catch(e){b.textContent='Copy unavailable';}area.remove();}
    }
    if(b.id==='aiListenSpeech'){if(!('speechSynthesis' in window)){b.textContent='Voice unavailable';return;}speechSynthesis.cancel();const msg=new SpeechSynthesisUtterance(lastSpoken);msg.lang='en-IN';msg.rate=.88;speechSynthesis.speak(msg);}
  });
})();