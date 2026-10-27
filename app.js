/* Speakwell — app logic. Offline-first; AI features use your own OpenAI-compatible key. */
(function () {
"use strict";

/* ================= icons ================= */
var I = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  learn: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/>',
  speak: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>',
  write: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  coach: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  play: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 5.5a9 9 0 010 13"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  send: '<path d="M4 12l16-8-6 16-2-7z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  ok: '<path d="M5 12l5 5 9-10"/>',
  brain: '<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 1V5a3 3 0 00-3-1z"/><path d="M15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 1"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/>'
};
function ico(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; }

/* ================= state ================= */
var KEY = "speakwell.v1";
var defaults = {
  name: "", xp: 0, streak: 0, lastDay: "", done: {}, quiz: { right: 0, total: 0 },
  sessions: [], writes: 0, chats: {},
  settings: { apiKey: "", baseUrl: "https://api.openai.com/v1", model: "gpt-5.6-luna", transcribeModel: "gpt-4o-mini-transcribe",
    lang: "en-IN", voice: "", rate: 0.95, theme: "system", coachReplies: true, speakReplies: false, level: "intermediate" }
};
var S = load();
function load() {
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) { var o = JSON.parse(raw); o.settings = Object.assign({}, defaults.settings, o.settings || {}); return Object.assign({}, JSON.parse(JSON.stringify(defaults)), o); }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaults));
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function yesterday() { var d = new Date(Date.now() - 864e5); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function addXP(n, why) {
  S.xp += n;
  var t = today();
  if (S.lastDay !== t) { S.streak = S.lastDay === yesterday() ? S.streak + 1 : 1; S.lastDay = t; }
  save();
  if (why) toast("+" + n + " XP · " + why);
}
function applyTheme() {
  var t = S.settings.theme;
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
}
applyTheme();

/* ================= helpers ================= */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function stripTags(s) { return String(s).replace(/<[^>]+>/g, ""); }
var toastT;
function toast(msg) {
  var el = $(".toast"); if (el) el.remove();
  el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
  document.body.appendChild(el); clearTimeout(toastT); toastT = setTimeout(function () { el.remove(); }, 2400);
}
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function online() { return navigator.onLine; }
function aiReady() { return !!(S.settings.apiKey && online()); }
function mdLite(t) {
  var h = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$|[.,!?])/g, "$1<i>$2</i>");
  var lines = h.split(/\n/), out = [], inList = false;
  lines.forEach(function (l) {
    var m = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/);
    if (m) { if (!inList) { out.push("<ul>"); inList = true; } out.push("<li>" + m[1] + "</li>"); }
    else { if (inList) { out.push("</ul>"); inList = false; } if (l.trim()) out.push("<p>" + l.replace(/^#+\s*/, "") + "</p>"); }
  });
  if (inList) out.push("</ul>");
  return out.join("");
}

/* ================= speech output ================= */
var voices = [];
function loadVoices() { if (!("speechSynthesis" in window)) return; voices = speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); }); }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function say(text) {
  if (!("speechSynthesis" in window)) { toast("Text-to-speech isn't available on this browser."); return; }
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(stripTags(text));
  var v = voices.filter(function (x) { return x.name === S.settings.voice; })[0];
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = S.settings.lang;
  u.rate = Number(S.settings.rate) || 1;
  speechSynthesis.speak(u);
}
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-say]");
  if (b) { e.preventDefault(); say(b.getAttribute("data-say")); }
});

/* ================= speech input ================= */
var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function Listener(onText) {
  this.onText = onText; this.final = ""; this.active = false; this.rec = null;
}
Listener.prototype.start = function () {
  var self = this;
  if (!SR) return false;
  this.active = true;
  var rec = new SR(); this.rec = rec;
  rec.lang = S.settings.lang; rec.continuous = true; rec.interimResults = true;
  rec.onresult = function (ev) {
    var interim = "";
    for (var i = ev.resultIndex; i < ev.results.length; i++) {
      var r = ev.results[i];
      if (r.isFinal) self.final += (self.final ? " " : "") + r[0].transcript.trim();
      else interim += r[0].transcript;
    }
    self.onText(self.final, interim);
  };
  rec.onerror = function (ev) {
    if (ev.error === "not-allowed" || ev.error === "service-not-allowed") { self.active = false; toast("Microphone permission was blocked. Allow it in the browser's site settings."); }
    else if (ev.error === "network") { self.active = false; toast("Speech-to-text needs a connection on this phone. Type your answer instead, or try again online."); }
  };
  rec.onend = function () { if (self.active) { try { rec.start(); } catch (e) {} } };
  try { rec.start(); } catch (e) { return false; }
  return true;
};
Listener.prototype.stop = function () { this.active = false; if (this.rec) try { this.rec.stop(); } catch (e) {} };

/* Audio recording for replay (works offline) + optional AI transcription */
function AudioRec() { this.chunks = []; this.mr = null; this.stream = null; this.blob = null; }
AudioRec.prototype.start = function () {
  var self = this;
  if (!navigator.mediaDevices || !window.MediaRecorder) return Promise.resolve(false);
  return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
    self.stream = st; self.chunks = []; self.mr = new MediaRecorder(st);
    self.mr.ondataavailable = function (e) { if (e.data.size) self.chunks.push(e.data); };
    self.mr.start(); return true;
  }).catch(function () { return false; });
};
AudioRec.prototype.stop = function () {
  var self = this;
  return new Promise(function (res) {
    if (!self.mr || self.mr.state === "inactive") return res(null);
    self.mr.onstop = function () {
      self.blob = new Blob(self.chunks, { type: self.mr.mimeType || "audio/webm" });
      if (self.stream) self.stream.getTracks().forEach(function (t) { t.stop(); });
      res(self.blob);
    };
    self.mr.stop();
  });
};

/* ================= AI ================= */
function aiCall(messages) {
  var s = S.settings;
  if (!s.apiKey) return Promise.reject(new Error("Add your OpenAI API key in Settings to use AI features."));
  if (!online()) return Promise.reject(new Error("You're offline. AI feedback needs a connection; the offline checks above still work."));
  var base = (s.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  return fetch(base + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + s.apiKey },
    body: JSON.stringify({ model: s.model, messages: messages })
  }).then(function (r) {
    return r.text().then(function (t) {
      var j = null; try { j = JSON.parse(t); } catch (e) {}
      if (!r.ok) {
        var m = j && j.error && j.error.message ? j.error.message : ("HTTP " + r.status);
        if (r.status === 401) m = "The API key was rejected. Check it in Settings.";
        if (r.status === 404 || /model/i.test(m) && /not exist|not found|does not have access/i.test(m)) m = "Model '" + s.model + "' wasn't found for this key. Check the model ID in Settings (" + m + ")";
        if (r.status === 429) m = "Rate limit or billing limit reached on your OpenAI account. " + m;
        throw new Error(m);
      }
      var c = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (Array.isArray(c)) c = c.map(function (p) { return p.text || ""; }).join("");
      if (!c) throw new Error("The model returned an empty reply.");
      return c;
    });
  });
}
function transcribe(blob) {
  var s = S.settings;
  if (!s.apiKey || !online()) return Promise.reject(new Error("AI transcription needs a key and a connection."));
  var fd = new FormData();
  fd.append("file", blob, "speech.webm"); fd.append("model", s.transcribeModel || "whisper-1"); fd.append("language", "en");
  return fetch((s.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "") + "/audio/transcriptions", {
    method: "POST", headers: { "Authorization": "Bearer " + s.apiKey }, body: fd
  }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || "Transcription failed"); return j.text || ""; }); });
}
var COACH_BASE = "You are Speakwell, a warm, practical English speaking and writing coach for an adult professional in India who wants to sound clear and confident at work and with friends. Level: {level}. Use simple, natural, global English. Keep replies short (under 120 words) unless asked for more.";

/* ================= offline analysis ================= */
var STOP = "the a an and or but to of in on at for with is are was were be been it this that i you we they he she my our your their me us them as so if not do does did have has had will would can could just".split(" ");
function analyzeSpeech(text, secs) {
  var clean = text.toLowerCase().replace(/[^a-z'\s.!?,]/g, " ");
  var words = clean.split(/\s+/).filter(function (w) { return /[a-z]/.test(w); });
  var n = words.length;
  var joined = " " + words.join(" ").replace(/[.!?,]/g, "") + " ";
  var fillers = [], fcount = 0;
  SW.fillers.forEach(function (f) { var m = joined.match(new RegExp(" " + f + " ", "g")); if (m) { fcount += m.length; fillers.push(f + " ×" + m.length); } });
  var hedges = SW.hedges.filter(function (h) { return joined.indexOf(" " + h + " ") > -1; });
  var signs = SW.signposts.filter(function (h) { return joined.indexOf(" " + h + " ") > -1; });
  var sentences = text.split(/[.!?]+/).filter(function (x) { return x.trim().split(/\s+/).length > 1; });
  var punctuated = sentences.length > 1;
  var avgLen = punctuated ? Math.round(n / sentences.length) : null;
  var freq = {};
  words.forEach(function (w) { w = w.replace(/[.!?,]/g, ""); if (w.length > 3 && STOP.indexOf(w) < 0) freq[w] = (freq[w] || 0) + 1; });
  var repeats = Object.keys(freq).filter(function (k) { return freq[k] >= 4; }).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 4);
  var uniq = {}; words.forEach(function (w) { uniq[w.replace(/[.!?,]/g, "")] = 1; });
  var variety = n ? Math.round(Object.keys(uniq).length / n * 100) : 0;
  var wpm = secs > 5 ? Math.round(n / (secs / 60)) : null;
  var fper = n ? fcount / n * 100 : 0;
  var score = 100;
  score -= Math.min(30, fper * 4);
  if (wpm) { if (wpm < 95) score -= Math.min(15, (95 - wpm) / 3); if (wpm > 175) score -= Math.min(15, (wpm - 175) / 3); }
  if (avgLen && avgLen > 25) score -= 8;
  if (hedges.length > 1) score -= 6;
  if (signs.length === 0 && n > 40) score -= 10;
  if (n < 25) score -= 15;
  score += Math.min(8, signs.length * 2);
  score = Math.max(0, Math.min(100, Math.round(score)));
  var fb = [];
  if (n < 25) fb.push(["tip", "Short answer (" + n + " words). Aim for at least 60–120 words: point, reason, example, close."]);
  if (wpm) {
    if (wpm < 95) fb.push(["tip", "Pace is slow (" + wpm + " wpm). Aim for 120–150. Practise the phrase bank to build automatic chunks."]);
    else if (wpm > 175) fb.push(["tip", "Pace is fast (" + wpm + " wpm). Slow down and pause after key points."]);
    else fb.push(["good", "Comfortable pace (" + wpm + " words per minute)."]);
  }
  if (fcount) fb.push([fper > 5 ? "tip" : "info", "Filler words: " + fillers.join(", ") + ". Replace them with a silent pause."]);
  else if (n > 20) fb.push(["good", "No filler words detected. Excellent control."]);
  if (signs.length) fb.push(["good", "Good signposting: " + signs.slice(0, 6).join(", ") + "."]);
  else if (n > 40) fb.push(["tip", "Add signposts so listeners can follow: 'First…', 'The main reason is…', 'For example…', 'So…'."]);
  if (hedges.length) fb.push(["tip", "Hedging weakens your point: " + hedges.join(", ") + ". Try 'I recommend…' or 'My view is…'."]);
  if (avgLen && avgLen > 25) fb.push(["tip", "Long sentences (avg " + avgLen + " words). Break them up; spoken sentences work best under 20 words."]);
  if (repeats.length) fb.push(["info", "Repeated words: " + repeats.map(function (r) { return r + " ×" + freq[r]; }).join(", ") + ". Try a synonym."]);
  return { words: n, wpm: wpm, fillers: fcount, signs: signs.length, variety: variety, score: score, feedback: fb };
}

function syllables(w) { w = w.toLowerCase().replace(/[^a-z]/g, ""); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, ""); var m = w.match(/[aeiouy]{1,2}/g); return m ? m.length : 1; }
function checkWriting(text) {
  var issues = [];
  var add = function (k, m) { issues.push([k, m]); };
  var sents = text.split(/(?<=[.!?])\s+/).filter(function (s) { return s.trim(); });
  var words = text.split(/\s+/).filter(Boolean);
  if (/(^|\s)i(\s|'|,|\.|$)/.test(text)) add("Capital", "Write the pronoun 'I' with a capital letter.");
  sents.forEach(function (s) { var t = s.trim(); if (/^[a-z]/.test(t)) add("Capital", "Start the sentence with a capital: \"" + t.slice(0, 40) + "…\""); });
  if (/ {2,}/.test(text)) add("Spacing", "There are double spaces. Use one space between words and after full stops.");
  var dup = text.match(/\b(\w+)\s+\1\b/i); if (dup) add("Repeat", "Repeated word: \"" + dup[0] + "\".");
  var low = text.toLowerCase();
  Object.keys(SW.wordUpgrades).forEach(function (k) { if (new RegExp("\\b" + k.replace(/ /g, "\\s+") + "\\b").test(low)) add("Word", "\"" + k + "\" → try \"" + SW.wordUpgrades[k] + "\"."); });
  [[/\b(could|should|would|must) of\b/, "Use 'could have / should've', not 'could of'."], [/\balot\b/, "'A lot' is two words."], [/\byour welcome\b/, "'You're welcome' (you are)."], [/\bits a\b/, "Check 'its a' → 'it's a' (it is)."],
   [/\b(more|less|better|worse|bigger|smaller|faster|cheaper) \w+ then\b|\b(better|worse|faster|cheaper|more|less) then\b/, "Comparisons use 'than', not 'then'."], [/\bthere (is|are) (any|some)? ?\w+ (who|which)\b/, ""],
   [/\bin the morning time\b/, "'in the morning' is enough."], [/\bexplain me\b/, "Say 'explain it to me'."], [/\bdiscuss about\b/, "'Discuss' needs no 'about'."], [/\badvices\b|\binformations\b|\bfeedbacks\b|\bequipments\b/, "This word is uncountable: no plural -s."],
   [/\bsince \d+ (years|months|days)\b/, "Use 'for' with a duration: 'for 3 years'."],
   [/\b(have|has|had) (went|did|saw|came|ate|wrote|took|gave|spoke)\b/, "After have/has/had use the past participle: 'have gone', 'has done', 'had seen'."],
   [/\b(i am|we are|they are|he is|she is) agree\b/, "'Agree' is a verb: say 'I agree', not 'I am agree'."],
   [/\btheir (is|are|was|were)\b/, "'There is / there are', not 'their is'."],
   [/\b(he|she|it) (don't|have)\b/, "He / she / it takes 'doesn't' and 'has'."],
   [/\bdid (went|saw|came|wrote|took|ate)\b|\bdidn't (went|saw|came|wrote|took|ate)\b/, "After 'did' / 'didn't' use the base verb: 'did go', 'didn't see'."], [/\bi am (knowing|understanding|having a car)\b/, "Stative verbs don't use -ing: 'I know', 'I understand'."]
  ].forEach(function (r) { if (r[1] && r[0].test(low)) add("Grammar", r[1]); });
  sents.forEach(function (s) { var c = s.split(/\s+/).length; if (c > 30) add("Length", "A " + c + "-word sentence. Consider splitting: \"" + s.trim().slice(0, 50) + "…\""); });
  var pass = low.match(/\b(is|are|was|were|been|being|be)\s+(\w+ed)\b/g); if (pass && pass.length > 1) add("Style", "Passive voice " + pass.length + "× (e.g. \"" + pass[0] + "\"). Active is usually clearer: 'We fixed it' vs 'It was fixed'.");
  var caps = text.match(/\b[A-Z]{4,}\b/g); if (caps && caps.filter(function (w) { return ["ASAP", "NASA", "HTML", "KPIS", "INDIA"].indexOf(w) < 0; }).length) add("Tone", "Words in ALL CAPS read as shouting.");
  if ((text.match(/!/g) || []).length > 2) add("Tone", "Several exclamation marks. One at most in work writing.");
  if (text.trim() && !/[.!?]["')\]]?\s*$/.test(text.trim()) && words.length > 8 && !/\n\S+\s*$/.test(text.trim())) add("Ending", "The last sentence has no end punctuation.");
  var syl = 0; words.forEach(function (w) { syl += syllables(w); });
  var wc = words.length, sc = Math.max(1, sents.length);
  var flesch = wc ? Math.round(206.835 - 1.015 * (wc / sc) - 84.6 * (syl / wc)) : 0;
  var contractions = (text.match(/\b\w+'(re|ll|ve|t|s|d|m)\b/gi) || []).length;
  return { issues: issues, words: wc, sentences: sents.length, avg: Math.round(wc / sc), flesch: Math.max(0, Math.min(100, flesch)), read: Math.max(1, Math.round(wc / 230)), tone: contractions > 2 ? "Conversational" : "Neutral / formal" };
}

/* ================= router / shell ================= */
var NAV = [["home", "Home", "home"], ["learn", "Learn", "learn"], ["speak", "Speak", "speak"], ["write", "Write", "write"], ["coach", "Coach", "coach"]];
function shell(active) {
  var t = NAV.map(function (n) { return '<button class="tab" data-go="' + n[0] + '"' + (active === n[0] ? ' aria-current="page"' : "") + ">" + ico(n[2]) + n[1] + "</button>"; }).join("");
  $("#tabs").innerHTML = t;
  $("#rail").innerHTML = '<div class="brand">' + logo() + '<b>Speakwell</b></div>' +
    NAV.map(function (n) { return '<button data-go="' + n[0] + '"' + (active === n[0] ? ' aria-current="page"' : "") + ">" + ico(n[2]) + n[1] + "</button>"; }).join("") +
    '<button data-go="progress"' + (active === "progress" ? ' aria-current="page"' : "") + ">" + ico("chart") + 'Progress</button><div class="spacer"></div>' +
    '<button data-go="settings"' + (active === "settings" ? ' aria-current="page"' : "") + ">" + ico("gear") + "Settings</button>";
}
function logo() { return '<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--accent)"/><path d="M9 20c3 3 11 3 14-1M10 12h4M18 12h4" stroke="var(--accent-ink)" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>'; }
document.addEventListener("click", function (e) {
  var g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); go(g.getAttribute("data-go")); }
});
function go(h) { if (location.hash === "#" + h) route(); else location.hash = h; }
function top(title, opts) {
  opts = opts || {};
  return '<div class="topbar">' + (opts.back ? '<button class="back" aria-label="Back" data-go="' + opts.back + '">' + ico("back") + "</button>" : "") +
    '<div class="grow">' + (opts.eyebrow ? '<div class="eyebrow">' + esc(opts.eyebrow) + "</div>" : "") + "<h1>" + title + "</h1></div>" + statusPill() +
    (opts.noGear ? "" : '<button class="icon-btn" aria-label="Settings" data-go="settings">' + ico("gear") + "</button>") + "</div>";
}
function statusPill() {
  var on = online(), ai = !!S.settings.apiKey;
  var label = !on ? "Offline" : ai ? "AI on" : "No AI key";
  return '<span class="status" title="' + (on ? "Online" : "Offline mode: lessons, drills and checks still work") + '"><i class="dot' + (on && ai ? "" : " off") + '"></i>' + label + "</span>";
}
window.addEventListener("online", function () { route(); toast("Back online"); });
window.addEventListener("offline", function () { route(); toast("Offline. Lessons and practice still work."); });

var cleanup = [];
function route() {
  cleanup.forEach(function (f) { try { f(); } catch (e) {} }); cleanup = [];
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  var h = (location.hash || "#home").slice(1);
  var parts = h.split("~"), v = parts[0], arg = parts[1];
  var m = $("#main");
  var tab = { home: "home", learn: "learn", lesson: "learn", builder: "learn", quiz: "learn", words: "write", speak: "speak", scene: "speak", think: "speak", impromptu: "speak", drills: "speak", write: "write", guides: "write", guide: "write", coach: "coach", settings: "settings", progress: "progress" }[v] || "home";
  shell(tab);
  var fn = VIEWS[v] || VIEWS.home;
  m.innerHTML = "";
  fn(m, arg);
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ================= views ================= */
var VIEWS = {};

VIEWS.home = function (m) {
  var name = S.name ? esc(S.name) : "there";
  var todo = SW.lessons.filter(function (l) { return !S.done[l.id]; })[0] || SW.lessons[Math.floor(Math.random() * SW.lessons.length)];
  var sc = SW.scenarios[(new Date().getDate()) % SW.scenarios.length];
  var lessonsDone = Object.keys(S.done).length;
  m.innerHTML = top("Speakwell", { noGear: false }) +
    '<div class="hero"><div class="hello stack"><h1>Hello, <span>' + name + "</span>.</h1>" +
    '<p class="muted">Speak clearly at work, with friends, and on stage. Ten focused minutes a day is enough.</p>' +
    '<div class="stats"><div class="stat"><b>' + S.streak + '</b><span>Day streak</span></div><div class="stat"><b>' + S.xp + '</b><span>XP</span></div><div class="stat"><b>' + lessonsDone + "/" + SW.lessons.length + '</b><span>Lessons</span></div></div></div>' +
    '<div class="card lift plan"><div class="eyebrow">Today\'s plan</div>' +
    '<button class="listrow" data-go="lesson~' + todo.id + '"><span class="num">1</span><span class="grow"><span class="t">' + esc(todo.title) + '</span><br><span class="d">Lesson · 4 min</span></span></button>' +
    '<button class="listrow" data-go="scene~' + sc.id + '"><span class="num">2</span><span class="grow"><span class="t">' + esc(sc.title) + '</span><br><span class="d">Speaking scenario · 5 min</span></span></button>' +
    '<button class="listrow" data-go="impromptu"><span class="num">3</span><span class="grow"><span class="t">60-second impromptu talk</span><br><span class="d">Think 15 s, speak 60 s</span></span></button></div></div>' +

    '<div class="section"><div class="head"><h2>Think before you speak</h2><button class="btn sm ghost" data-go="think">Frameworks</button></div>' +
    '<div class="think-strip">' + SW.thinkSteps.map(function (s) { return "<div><b>" + s.k + "</b><small>" + esc(s.d) + "</small></div>"; }).join("") + "</div></div>" +

    '<div class="section"><h2>Practise</h2><div class="grid">' +
    tile("speak", "Speaking scenarios", "Presentations, meetings, office talk, friends, interviews, calls.") +
    tile("impromptu", "Impromptu trainer", "Random topic, a framework, a timer, instant feedback.") +
    tile("drills", "Brain drills", "Fast-thinking games for fluency and word recall.") +
    tile("coach", "AI coach", "Role-play any situation and get corrections as you talk.") +
    tile("write", "Writing studio", "Templates, an offline checker, and AI rewrites.") +
    tile("learn", "Grammar library", SW.lessons.length + " lessons with quizzes, from parts of speech to punctuation.") +
    tile("words", "Confused words", SW.confused.length + " pairs like affect/effect, with a quiz.") +
    tile("builder", "Sentence builder", "Build S + V + O sentences and hear them.") +
    "</div></div>" +
    (S.settings.apiKey ? "" : '<div class="section"><div class="notice info"><b>Turn on the AI coach.</b> Add your OpenAI API key and model in <a href="#settings">Settings</a>. Everything else in the app works without it, including offline.</div></div>') +
    (S.name ? "" : '<div class="section card"><label class="f" for="nm">What should I call you?<input id="nm" type="text" placeholder="Your first name" autocomplete="given-name"></label><div class="row" style="margin-top:10px"><button class="btn primary" id="nmSave">Save</button></div></div>');
  var b = $("#nmSave"); if (b) b.onclick = function () { S.name = $("#nm").value.trim(); save(); route(); };
};
function tile(go, t, d) { return '<button class="tile" data-go="' + go + '"><span class="t">' + t + '</span><span class="d">' + d + "</span></button>"; }

/* ---------- Learn ---------- */
VIEWS.learn = function (m) {
  var html = top("Grammar library", { eyebrow: "Learn" }) +
    '<div class="row"><button class="btn primary" data-go="quiz">' + ico("spark") + 'Mixed quiz</button><button class="btn" data-go="builder">Sentence builder</button><button class="btn" data-go="words">Confused words</button></div>' +
    '<label class="f" style="margin-top:16px" for="lq"><span class="eyebrow">Search lessons</span><input id="lq" type="search" placeholder="e.g. comma, tense, articles"></label>';
  SW.lessonGroups.forEach(function (g) {
    var ls = SW.lessons.filter(function (l) { return l.group === g.id; });
    var dn = ls.filter(function (l) { return S.done[l.id]; }).length;
    html += '<div class="section" data-grp><div class="head"><div><h2>' + g.name + '</h2><p class="muted small">' + g.blurb + '</p></div><span class="pill ' + (dn === ls.length ? "ok" : "warn") + '">' + dn + "/" + ls.length + "</span></div>" +
      '<div class="card">' + ls.map(function (l) {
        return '<button class="listrow" data-go="lesson~' + l.id + '" data-q="' + esc((l.title + " " + l.summary).toLowerCase()) + '"><span class="check' + (S.done[l.id] ? " on" : "") + '">' + (S.done[l.id] ? ico("ok") : "") + '</span><span class="grow"><span class="t">' + esc(l.title) + '</span><br><span class="d">' + esc(l.summary) + "</span></span></button>";
      }).join("") + "</div></div>";
  });
  m.innerHTML = html;
  $("#lq").oninput = function () {
    var q = this.value.toLowerCase().trim();
    $$("[data-q]").forEach(function (r) { r.hidden = q && r.getAttribute("data-q").indexOf(q) < 0; });
    $$("[data-grp]").forEach(function (g) { g.hidden = $$("[data-q]", g).every(function (r) { return r.hidden; }); });
  };
};

VIEWS.lesson = function (m, id) {
  var l = SW.lessons.filter(function (x) { return x.id === id; })[0];
  if (!l) return VIEWS.learn(m);
  var g = SW.lessonGroups.filter(function (x) { return x.id === l.group; })[0];
  var idx = SW.lessons.indexOf(l), next = SW.lessons[idx + 1];
  var html = top(esc(l.title), { back: "learn", eyebrow: g.name }) +
    '<div class="stack"><p style="font-size:1.08rem">' + l.summary + "</p>" +
    '<div class="card"><ul class="points">' + l.points.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul></div>";
  if (l.examples && l.examples.length) {
    html += '<div class="section"><h2>Examples</h2>' + l.examples.map(function (e) {
      return '<div class="fix">' + (e[0] ? '<span class="bad">' + esc(e[0]) + "</span>" : "") + '<div class="row" style="flex-wrap:nowrap"><span class="good" style="flex:1;min-width:0">' + esc(e[1]) + '</span><button class="icon-btn" aria-label="Listen" data-say="' + esc(e[1]) + '">' + ico("play") + "</button></div></div>";
    }).join("") + "</div>";
  }
  if (l.builder) html += '<div class="section"><h2>Build your own sentence</h2><div id="bld"></div></div>';
  html += '<div class="section"><h2>Check yourself</h2><div id="lq" class="stack"></div></div>' +
    '<div class="section card"><h3>Ask the coach about this topic</h3><p class="muted small">Get more examples, or check your own sentence.</p>' +
    '<textarea id="askT" rows="2" placeholder="e.g. Give me 5 more examples, or: Is this correct: &quot;I am working here since 2020&quot;?"></textarea>' +
    '<div class="row" style="margin-top:8px"><button class="btn" id="askB">' + ico("spark") + 'Ask</button></div><div id="askO" class="ai-out" style="margin-top:10px"></div></div>' +
    '<div class="row" style="margin-top:22px"><button class="btn primary" id="doneB">' + (S.done[l.id] ? "Completed ✓" : "Mark as complete") + "</button>" + (next ? '<button class="btn" data-go="lesson~' + next.id + '">Next: ' + esc(next.title) + "</button>" : "") + "</div></div>";
  m.innerHTML = html;
  if (l.builder) builder($("#bld"));
  renderQuiz($("#lq"), l.quiz, false);
  $("#doneB").onclick = function () { if (!S.done[l.id]) { S.done[l.id] = 1; addXP(20, "lesson complete"); } this.textContent = "Completed ✓"; };
  aiBox($("#askB"), $("#askT"), $("#askO"), function (q) {
    return [{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " The learner is studying the grammar topic: " + l.title + ". Explain with short examples. If they give a sentence, correct it and explain the rule in one line." }, { role: "user", content: q }];
  });
};

function aiBox(btn, input, out, build) {
  btn.onclick = function () {
    var q = input.value.trim(); if (!q) { input.focus(); return; }
    out.innerHTML = '<p class="muted">Thinking…</p>'; btn.disabled = true;
    aiCall(build(q)).then(function (r) { out.innerHTML = mdLite(r); }).catch(function (e) { out.innerHTML = '<div class="notice">' + esc(e.message) + "</div>"; }).then(function () { btn.disabled = false; });
  };
}

function renderQuiz(el, qs, track) {
  el.innerHTML = qs.map(function (q, i) {
    return '<div class="q card" data-i="' + i + '"><p><b>' + (i + 1) + ".</b> " + esc(q.q) + "</p>" +
      q.o.map(function (o, j) { return '<button class="opt" data-j="' + j + '">' + esc(o) + "</button>"; }).join("") + '<div class="why" hidden></div></div>';
  }).join("");
  $$(".q", el).forEach(function (box) {
    var q = qs[+box.getAttribute("data-i")], answered = false;
    $$(".opt", box).forEach(function (b) {
      b.onclick = function () {
        if (answered) return; answered = true;
        var j = +b.getAttribute("data-j"), ok = j === q.a;
        b.classList.add(ok ? "right" : "wrong");
        $$(".opt", box)[q.a].classList.add("right");
        var w = $(".why", box); w.hidden = false; w.textContent = (ok ? "Correct. " : "Not quite. ") + q.why;
        S.quiz.total++; if (ok) { S.quiz.right++; addXP(5); } else save();
        if (track) track(ok);
      };
    });
  });
}

VIEWS.quiz = function (m) {
  var pool = [];
  SW.lessons.forEach(function (l) { l.quiz.forEach(function (q) { pool.push(q); }); });
  SW.confused.forEach(function (c) {
    var useA = Math.random() < .5, ex = useA ? c[2] : c[5], w = useA ? c[0] : c[3];
    var re = new RegExp("\\b" + w.replace(/[.]/g, "\\.") + "\\b", "i");
    if (re.test(ex)) pool.push({ q: "Fill the gap: " + ex.replace(re, "____"), o: [c[0], c[3]], a: useA ? 0 : 1, why: c[0] + ": " + c[1] + ". " + c[3] + ": " + c[4] + "." });
  });
  var qs = shuffle(pool).slice(0, 10), right = 0, seen = 0;
  m.innerHTML = top("Mixed quiz", { back: "learn", eyebrow: "10 questions" }) + '<p class="muted" id="qs">Score: 0 / 0</p><div id="qq" class="stack" style="margin-top:12px"></div><div class="row" style="margin-top:18px"><button class="btn primary" data-go="quiz">New quiz</button></div>';
  renderQuiz($("#qq"), qs, function (ok) { seen++; if (ok) right++; $("#qs").textContent = "Score: " + right + " / " + seen + (seen === qs.length ? (right >= 8 ? " · Excellent!" : right >= 5 ? " · Good work." : " · Review the lessons and try again.") : ""); });
};

/* ---------- Sentence builder ---------- */
var B = {
  subj: [["I", 1], ["You", 2], ["The dog", 3], ["My friend", 3], ["The teacher", 3], ["We", 4]],
  verb: [["eat", "eats", "ate"], ["like", "likes", "liked"], ["play", "plays", "played"], ["write", "writes", "wrote"], ["read", "reads", "read"], ["watch", "watches", "watched"]],
  obj: ["a book", "a football", "lunch", "the song", "a car", "the homework"]
};
function builder(el) {
  var st = { s: 2, v: 2, o: 1, tense: "present", type: "statement" };
  function sentence() {
    var s = B.subj[st.s], v = B.verb[st.v], o = B.obj[st.o], third = s[1] === 3;
    var subjWord = s[0];
    if (st.type === "question") {
      var aux = st.tense === "past" ? "Did" : third ? "Does" : "Do";
      var sw = subjWord === "I" ? "I" : subjWord.charAt(0).toLowerCase() + subjWord.slice(1);
      return { parts: [["x", aux], ["s", sw], ["v", v[0]], ["o", o + "?"]], rule: st.tense === "past" ? "Past questions: Did + subject + base verb." : third ? "He/she/it questions use 'Does' + base verb (no -s)." : "I/you/we/they questions use 'Do' + base verb." };
    }
    if (st.type === "negative") {
      var neg = st.tense === "past" ? "didn't" : third ? "doesn't" : "don't";
      return { parts: [["s", subjWord], ["x", neg], ["v", v[0]], ["o", o + "."]], rule: "Negatives: subject + " + neg + " + base verb." };
    }
    var form = st.tense === "past" ? v[2] : third ? v[1] : v[0];
    return { parts: [["s", subjWord], ["v", form], ["o", o + "."]], rule: st.tense === "past" ? "Past simple: same verb form for every subject." : third ? "He / she / it (third person) adds -s in the present: " + v[0] + " → " + v[1] + "." : "I / you / we / they use the base verb in the present." };
  }
  function draw() {
    var r = sentence(), text = r.parts.map(function (p) { return p[1]; }).join(" ");
    el.innerHTML = '<div class="stack"><div class="row">' +
      ["present", "past"].map(function (t) { return '<button class="chip' + (st.tense === t ? " on" : "") + '" data-t="' + t + '">' + t + "</button>"; }).join("") +
      ["statement", "negative", "question"].map(function (t) { return '<button class="chip' + (st.type === t ? " on" : "") + '" data-y="' + t + '">' + t + "</button>"; }).join("") +
      '</div><div class="svo"><div class="col s"><h3>Subject</h3>' + B.subj.map(function (x, i) { return '<button data-k="s" data-i="' + i + '"' + (st.s === i ? ' class="on"' : "") + ">" + x[0] + "</button>"; }).join("") +
      '</div><div class="col v"><h3>Verb</h3>' + B.verb.map(function (x, i) { return '<button data-k="v" data-i="' + i + '"' + (st.v === i ? ' class="on"' : "") + ">" + x[0] + "</button>"; }).join("") +
      '</div><div class="col o"><h3>Object</h3>' + B.obj.map(function (x, i) { return '<button data-k="o" data-i="' + i + '"' + (st.o === i ? ' class="on"' : "") + ">" + x + "</button>"; }).join("") +
      '</div></div><div class="built">' + r.parts.map(function (p) { return '<span class="' + p[0] + '">' + esc(p[1]) + "</span>"; }).join("") + "</div>" +
      '<p class="why">' + esc(r.rule) + '</p><div class="row"><button class="btn" data-say="' + esc(text) + '">' + ico("play") + 'Hear it</button><button class="btn" id="bAnother">Try another</button></div></div>';
    $$("[data-k]", el).forEach(function (b) { b.onclick = function () { st[b.getAttribute("data-k")] = +b.getAttribute("data-i"); draw(); }; });
    $$("[data-t]", el).forEach(function (b) { b.onclick = function () { st.tense = b.getAttribute("data-t"); draw(); }; });
    $$("[data-y]", el).forEach(function (b) { b.onclick = function () { st.type = b.getAttribute("data-y"); draw(); }; });
    $("#bAnother", el).onclick = function () { st.s = Math.floor(Math.random() * 6); st.v = Math.floor(Math.random() * 6); st.o = Math.floor(Math.random() * 6); draw(); };
  }
  draw();
}
VIEWS.builder = function (m) {
  m.innerHTML = top("Sentence builder", { back: "learn", eyebrow: "Subject + Verb + Object" }) + '<p class="muted" style="margin-bottom:14px">Pick a word from each box. Switch tense and sentence type to see how the verb changes.</p><div id="bld"></div>' +
    '<div class="section"><h2>Types of sentences</h2><div class="grid">' +
    [["Declarative", "States a fact.", "We live in India."], ["Interrogative", "Asks a question.", "Do you like coffee?"], ["Imperative", "Gives a command or request.", "Please open the door."], ["Exclamatory", "Shows strong emotion.", "What a beautiful day!"]].map(function (t) {
      return '<div class="card"><h3>' + t[0] + '</h3><p class="muted small">' + t[1] + '</p><div class="row" style="margin-top:8px;flex-wrap:nowrap"><b style="flex:1">' + t[2] + '</b><button class="icon-btn" aria-label="Listen" data-say="' + t[2] + '">' + ico("play") + "</button></div></div>";
    }).join("") + "</div></div>";
  builder($("#bld"));
};

/* ---------- Confused words ---------- */
VIEWS.words = function (m) {
  m.innerHTML = top("Confused words", { back: "write", eyebrow: "Homophones & look-alikes" }) +
    '<div class="card stack small">' + Object.keys(SW.wordFamilies).map(function (k) { return "<p><b>" + k.charAt(0).toUpperCase() + k.slice(1) + ":</b> " + esc(SW.wordFamilies[k]) + "</p>"; }).join("") + "</div>" +
    '<div class="row" style="margin-top:14px"><input id="wq" type="search" placeholder="Search, e.g. affect" style="flex:1;min-width:160px"><button class="btn primary" data-go="quiz">Quiz me</button></div><div id="wl" class="stack" style="margin-top:14px"></div>';
  function draw(q) {
    $("#wl").innerHTML = SW.confused.filter(function (c) { return !q || (c[0] + " " + c[3]).toLowerCase().indexOf(q) > -1; }).map(function (c) {
      return '<div class="card"><div class="pair"><div><b>' + esc(c[0]) + '</b><p class="muted small">' + esc(c[1]) + '</p><p class="small" style="margin-top:4px">' + esc(c[2]) + '</p></div><div><b>' + esc(c[3]) + '</b><p class="muted small">' + esc(c[4]) + '</p><p class="small" style="margin-top:4px">' + esc(c[5]) + "</p></div></div></div>";
    }).join("") || '<p class="muted">No match.</p>';
  }
  draw(""); $("#wq").oninput = function () { draw(this.value.toLowerCase().trim()); };
};

/* ---------- Speak hub ---------- */
VIEWS.speak = function (m) {
  var html = top("Speaking", { eyebrow: "Practise out loud" }) +
    '<div class="grid">' + tile("impromptu", "Impromptu trainer", "Random topic → think 15 s → speak 60 s → feedback.") + tile("think", "Thinking frameworks", "PREP, STAR, SCQA and more: structure before words.") + tile("drills", "Brain drills", "Rapid categories, describe-it, because-chains.") + tile("coach", "Role-play with AI", "Talk through any situation, live.") + "</div>";
  SW.scenarioGroups.forEach(function (g) {
    var ss = SW.scenarios.filter(function (s) { return s.group === g.id; });
    html += '<div class="section"><h2>' + g.name + '</h2><div class="card">' + ss.map(function (s) {
      var n = S.sessions.filter(function (x) { return x.sc === s.id; }).length;
      return '<button class="listrow" data-go="scene~' + s.id + '"><span class="grow"><span class="t">' + esc(s.title) + '</span><br><span class="d">' + esc(s.goal) + "</span></span>" + (n ? '<span class="pill ok">' + n + "×</span>" : "") + "</button>";
    }).join("") + "</div></div>";
  });
  m.innerHTML = html;
};

VIEWS.scene = function (m, id) {
  var s = SW.scenarios.filter(function (x) { return x.id === id; })[0];
  if (!s) return VIEWS.speak(m);
  var fw = SW.frameworks.filter(function (f) { return f.id === s.framework; })[0];
  var g = SW.scenarioGroups.filter(function (x) { return x.id === s.group; })[0];
  m.innerHTML = top(esc(s.title), { back: "speak", eyebrow: g.name }) +
    '<div class="stack"><p style="font-size:1.08rem">' + esc(s.goal) + "</p>" +
    '<div class="card"><h3 style="margin-bottom:10px">How to do it</h3><ol class="steps">' + s.steps.map(function (x) { return "<li><span>" + esc(x) + "</span></li>"; }).join("") + "</ol></div>" +
    '<div class="card"><div class="row" style="justify-content:space-between"><h3>Structure: ' + fw.name + '</h3><span class="muted small">' + esc(fw.use) + '</span></div><div class="fw" style="margin-top:10px">' + fw.steps.map(function (x) { return "<div><b>" + x[0] + "</b><small>" + esc(x[1]) + "</small></div>"; }).join("") + "</div></div>" +
    '<div class="card"><h3>Phrase bank</h3><p class="muted small">Tap to hear. Say each one aloud three times until it feels automatic.</p>' + s.phrases.map(function (p) { return '<div class="phrase"><p>' + esc(p) + '</p><button class="icon-btn" aria-label="Listen" data-say="' + esc(p) + '">' + ico("play") + "</button></div>"; }).join("") + "</div>" +
    '<div class="card"><h3>Tips</h3><ul class="points" style="margin-top:8px">' + s.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
    '<div class="section"><div class="head"><h2>Your turn</h2><button class="btn primary sm" data-go="coach~' + s.id + '">' + ico("coach") + "Role-play this</button></div>" +
    '<p class="muted small">Prompt: ' + esc(s.script[0]) + "</p><div id='rec'></div></div></div>";
  recorder($("#rec"), { prompt: s.title + ". The listener says: " + s.script[0], target: 90, framework: fw, scene: s.id });
};

/* ---------- Recorder + feedback ---------- */
function recorder(el, opt) {
  var t0 = 0, secs = 0, tick = null, L = null, A = null, live = false;
  el.innerHTML = '<div class="card recorder"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="row" style="flex-wrap:nowrap"><button class="mic" id="micB" aria-label="Start speaking">' + ico("mic") + '</button><div><div class="timer" id="tm">0:00</div><div class="muted small" id="tmH">' + (SR ? "Tap the mic and speak" : "Speech-to-text isn't supported here. Record, or type below.") + '</div></div></div></div>' +
    '<label class="f" for="tx">Transcript <span class="hint">Edit it if the recogniser misheard. You can also type your answer.</span><textarea id="tx" rows="5" placeholder="Your words appear here…"></textarea></label>' +
    '<audio id="au" controls hidden style="width:100%"></audio>' +
    '<div class="row"><button class="btn primary" id="anB">' + ico("chart") + 'Analyse</button><button class="btn" id="aiB">' + ico("spark") + 'AI feedback</button><button class="btn ghost" id="clB">Clear</button></div><div id="res" class="stack"></div></div>';
  var tx = $("#tx", el), mic = $("#micB", el);
  function fmt(s) { return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); }
  function stop() {
    if (!live) return; live = false; clearInterval(tick); mic.classList.remove("live"); mic.innerHTML = ico("mic"); mic.setAttribute("aria-label", "Start speaking");
    if (L) L.stop();
    if (A) A.stop().then(function (b) {
      if (!b) return; var au = $("#au", el); au.src = URL.createObjectURL(b); au.hidden = false;
      if (!SR && aiReady()) { $("#tmH", el).textContent = "Transcribing with AI…"; transcribe(b).then(function (t) { tx.value = t; $("#tmH", el).textContent = "Transcribed."; }).catch(function (e) { $("#tmH", el).textContent = e.message; }); }
    });
  }
  mic.onclick = function () {
    if (live) return stop();
    live = true; secs = 0; t0 = Date.now(); mic.classList.add("live"); mic.innerHTML = ico("stop"); mic.setAttribute("aria-label", "Stop");
    var base = tx.value ? tx.value + " " : "";
    if (SR) { L = new Listener(function (f, i) { tx.value = base + f + (i ? " " + i : ""); }); L.start(); }
    A = new AudioRec(); A.start();
    tick = setInterval(function () {
      secs = (Date.now() - t0) / 1000; var tm = $("#tm", el); if (!tm) return;
      tm.textContent = fmt(secs); tm.className = "timer" + (opt.target && secs > opt.target ? " over" : opt.target && secs > opt.target * .8 ? " warn" : "");
    }, 250);
  };
  cleanup.push(stop);
  $("#clB", el).onclick = function () { tx.value = ""; secs = 0; $("#tm", el).textContent = "0:00"; $("#res", el).innerHTML = ""; };
  $("#anB", el).onclick = function () {
    var t = tx.value.trim(); if (!t) { toast("Speak or type something first."); return; }
    var r = analyzeSpeech(t, secs);
    $("#res", el).innerHTML = '<div class="meters"><div class="meter"><b>' + r.score + '</b><span>Score</span></div><div class="meter"><b>' + r.words + '</b><span>Words</span></div><div class="meter"><b>' + (r.wpm || "—") + '</b><span>Words/min</span></div><div class="meter"><b>' + r.fillers + '</b><span>Fillers</span></div><div class="meter"><b>' + r.variety + '%</b><span>Variety</span></div></div>' +
      '<ul class="feedback">' + r.feedback.map(function (f) { return '<li class="' + f[0] + '">' + esc(f[1]) + "</li>"; }).join("") + "</ul>";
    S.sessions.push({ d: Date.now(), sc: opt.scene || opt.kind || "free", score: r.score, wpm: r.wpm, fillers: r.fillers, words: r.words });
    if (S.sessions.length > 300) S.sessions = S.sessions.slice(-300);
    addXP(15, "speaking session");
  };
  $("#aiB", el).onclick = function () {
    var t = tx.value.trim(); if (!t) { toast("Speak or type something first."); return; }
    var out = document.createElement("div"); out.className = "card ai-out"; out.innerHTML = '<p class="muted">Getting feedback…</p>'; $("#res", el).appendChild(out);
    var sys = COACH_BASE.replace("{level}", S.settings.level) + " Evaluate a SPOKEN answer (transcribed by speech recognition, so ignore missing punctuation and minor recognition errors). Give: 1) a score out of 10 for clarity, structure, grammar and confidence; 2) the 3 most important grammar or word-choice corrections as 'You said → Better'; 3) one structure tip" + (opt.framework ? " using the " + opt.framework.name + " framework (" + opt.framework.steps.map(function (x) { return x[0]; }).join(", ") + ")" : "") + "; 4) a polished model answer of similar length in natural spoken English. Use short bullet points.";
    aiCall([{ role: "system", content: sys }, { role: "user", content: "Task: " + (opt.prompt || "free speaking") + (secs ? "\nDuration: " + Math.round(secs) + " seconds" : "") + "\n\nMy answer:\n" + t }])
      .then(function (r) { out.innerHTML = mdLite(r) + '<div class="row" style="margin-top:8px"><button class="btn sm" data-say="' + esc(r.split(/model answer/i)[1] || r) + '">' + ico("play") + "Hear it</button></div>"; addXP(5); })
      .catch(function (e) { out.innerHTML = '<div class="notice">' + esc(e.message) + "</div>"; });
  };
}

/* ---------- Thinking frameworks ---------- */
VIEWS.think = function (m) {
  m.innerHTML = top("Thinking frameworks", { back: "speak", eyebrow: "Structure first, words second" }) +
    '<div class="card"><h3>The 5-step thought process</h3><p class="muted small" style="margin:4px 0 12px">Use it for every answer, from a stand-up update to a job interview.</p><ol class="steps">' +
    SW.thinkSteps.map(function (s) { return "<li><span><b>" + s.k + ".</b> " + esc(s.d) + "</span></li>"; }).join("") + "</ol></div>" +
    '<div class="card" style="margin-top:14px"><h3>Why structure helps your brain</h3><ul class="points" style="margin-top:8px"><li>Working memory holds about four chunks. A framework gives you the chunks, so your mind can focus on words.</li><li>Speaking in a second language uses extra mental effort. Fixed phrases ("The main reason is…") free that effort for ideas.</li><li>Pausing lowers stress and filler words. Two seconds of silence feels long to you but normal to listeners.</li><li>Rehearsed openings remove the hardest moment: the first sentence.</li></ul></div>' +
    SW.frameworks.map(function (f) {
      return '<div class="section card"><div class="row" style="justify-content:space-between"><h2>' + f.name + '</h2><span class="muted small">' + esc(f.use) + '</span></div><div class="fw">' + f.steps.map(function (x) { return "<div><b>" + x[0] + "</b><small>" + esc(x[1]) + "</small></div>"; }).join("") + '</div><div class="fix"><span class="eyebrow">Example</span><span>' + esc(f.sample) + '</span></div><div class="row"><button class="btn sm" data-say="' + esc(f.sample) + '">' + ico("play") + 'Hear it</button><button class="btn sm primary" data-go="impromptu~' + f.id + '">Practise with ' + f.name + "</button></div></div>";
    }).join("");
};

/* ---------- Impromptu trainer ---------- */
VIEWS.impromptu = function (m, fwId) {
  var st = { cat: "office", fw: fwId || "prep", topic: SW.pick(SW.topics.office), think: 15, speak: 60 };
  function draw() {
    var fw = SW.frameworks.filter(function (f) { return f.id === st.fw; })[0];
    m.innerHTML = top("Impromptu trainer", { back: "speak", eyebrow: "Think fast, speak clearly" }) +
      '<div class="stack"><div class="row">' + ["office", "social", "think"].map(function (c) { return '<button class="chip' + (st.cat === c ? " on" : "") + '" data-c="' + c + '">' + { office: "Work", social: "Friends & life", think: "Opinion & logic" }[c] + "</button>"; }).join("") + "</div>" +
      '<div class="card lift stack"><span class="eyebrow">Your topic</span><p class="bigtopic">' + esc(st.topic) + '</p><div class="row"><button class="btn sm" id="newT">New topic</button><label class="row small" for="fwSel">Framework <select id="fwSel" style="width:auto">' + SW.frameworks.map(function (f) { return '<option value="' + f.id + '"' + (f.id === st.fw ? " selected" : "") + ">" + f.name + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="fw">' + fw.steps.map(function (x) { return "<div><b>" + x[0] + "</b><small>" + esc(x[1]) + "</small></div>"; }).join("") + "</div>" +
      '<div class="row" style="justify-content:space-between"><div><span class="phase think" id="ph">Ready</span> <span class="timer" id="cd" style="font-size:1.6rem;margin-left:8px">0:15</span></div><button class="btn primary" id="go">Start: think 15 s</button></div></div><div id="rec"></div></div>';
    $$("[data-c]").forEach(function (b) { b.onclick = function () { st.cat = b.getAttribute("data-c"); st.topic = SW.pick(SW.topics[st.cat]); draw(); }; });
    $("#newT").onclick = function () { st.topic = SW.pick(SW.topics[st.cat]); draw(); };
    $("#fwSel").onchange = function () { st.fw = this.value; draw(); };
    recorder($("#rec"), { prompt: "Impromptu talk on: " + st.topic, target: st.speak, framework: fw, kind: "impromptu" });
    var timer = null;
    cleanup.push(function () { clearInterval(timer); });
    $("#go").onclick = function () {
      var left = st.think, ph = $("#ph"), cd = $("#cd"), btn = this; btn.disabled = true;
      ph.textContent = "Think"; ph.className = "phase think";
      timer = setInterval(function () {
        left--; cd.textContent = "0:" + String(Math.max(0, left)).padStart(2, "0");
        if (left <= 0) {
          clearInterval(timer); ph.textContent = "Speak"; ph.className = "phase speak"; cd.textContent = "1:00";
          var mic = $("#micB"); if (mic) mic.click();
          var sl = st.speak;
          timer = setInterval(function () { sl--; cd.textContent = Math.floor(sl / 60) + ":" + String(Math.max(0, sl % 60)).padStart(2, "0");
            if (sl <= 0) { clearInterval(timer); ph.textContent = "Done"; ph.className = "phase done"; var mc = $("#micB"); if (mc && mc.classList.contains("live")) mc.click(); btn.disabled = false; btn.textContent = "Again"; var an = $("#anB"); if (an) setTimeout(function () { an.click(); }, 600); } }, 1000);
        }
      }, 1000);
    };
  }
  draw();
};

/* ---------- Brain drills ---------- */
VIEWS.drills = function (m) {
  m.innerHTML = top("Brain drills", { back: "speak", eyebrow: "Cognitive fluency" }) +
    '<p class="muted">Short games that train the thinking behind speaking: word recall, paraphrasing, reasoning and flexible thinking. Say your answers out loud.</p><div class="grid" style="margin-top:14px">' +
    SW.drills.map(function (d) { return '<button class="tile" data-d="' + d.id + '"><span class="t">' + d.name + '</span><span class="d">' + esc(d.desc) + '</span><span class="eyebrow">' + d.secs + " seconds</span></button>"; }).join("") + '</div><div id="drillArea"></div>';
  $$("[data-d]").forEach(function (b) {
    b.onclick = function () {
      var d = SW.drills.filter(function (x) { return x.id === b.getAttribute("data-d"); })[0];
      var area = $("#drillArea"), timer = null;
      cleanup.push(function () { clearInterval(timer); });
      function run() {
        clearInterval(timer);
        var p = d.gen(), left = d.secs;
        area.innerHTML = '<div class="section card lift stack"><div class="row" style="justify-content:space-between"><h2>' + d.name + '</h2><span class="timer" id="dt">' + left + 's</span></div><p class="muted small">' + esc(d.desc) + '</p><p class="bigtopic">' + esc(p) + '</p><div class="row"><button class="btn primary" id="dGo">Start timer</button><button class="btn" id="dNew">New prompt</button></div>' +
          '<div id="dRate" hidden class="stack"><p><b>How did it go?</b></p><div class="row"><button class="btn sm" data-r="1">Struggled</button><button class="btn sm" data-r="2">OK</button><button class="btn sm" data-r="3">Smooth</button></div></div><div id="dRec"></div></div>';
        $("#dNew").onclick = run;
        $("#dGo").onclick = function () {
          this.disabled = true;
          timer = setInterval(function () { left--; var dt = $("#dt"); if (dt) dt.textContent = left + "s"; if (left <= 0) { clearInterval(timer); $("#dRate").hidden = false; say("Time"); } }, 1000);
        };
        $$("[data-r]", area).forEach(function (r) { r.onclick = function () { addXP(10, r.getAttribute("data-r") === "3" ? "nice and fluent" : "drill done"); run(); }; });
        recorder($("#dRec"), { prompt: d.name + ": " + p, target: d.secs, kind: "drill" });
        area.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      run();
    };
  });
};

/* ---------- Write ---------- */
VIEWS.write = function (m) {
  var draft = ""; try { draft = localStorage.getItem("speakwell.draft") || ""; } catch (e) {}
  m.innerHTML = top("Writing studio", { eyebrow: "Write" }) +
    '<div class="row"><button class="btn" data-go="words">Confused words</button><a class="btn" href="#guides">Writing guides</a></div>' +
    '<div class="section card stack"><div class="row" style="justify-content:space-between"><h2>Draft</h2><select id="tpl" style="width:auto"><option value="">Start from a template…</option>' + SW.templates.map(function (t) { return '<option value="' + t.id + '">' + t.name + "</option>"; }).join("") + "</select></div>" +
    '<textarea id="ed" class="editor" rows="10" placeholder="Write or paste your email, message, speech or paragraph here.">' + esc(draft) + "</textarea>" +
    '<div class="row"><button class="btn primary" id="chk">' + ico("ok") + 'Check (offline)</button><button class="btn" id="cpy">' + ico("copy") + 'Copy</button><button class="btn" data-say-ed>' + ico("play") + "Read aloud</button></div></div>" +
    '<div id="chkOut"></div>' +
    '<div class="section card stack"><h2>AI rewrite</h2><p class="muted small">Pick what you want. Your draft stays as it is; the result appears below.</p><div class="row" id="aiOps">' +
    [["fix", "Fix grammar & explain"], ["formal", "More formal"], ["friendly", "More friendly"], ["short", "Shorter"], ["confident", "More confident"], ["speech", "Turn into a speech"]].map(function (o) { return '<button class="chip" data-op="' + o[0] + '">' + o[1] + "</button>"; }).join("") +
    '</div><div id="aiW" class="ai-out"></div></div>' +
    '<div class="section" id="guides"><h2>Writing guides</h2><div class="grid">' + SW.guides.map(function (g) { return '<button class="tile" data-go="guide~' + g.id + '"><span class="eyebrow">' + esc(g.kind) + '</span><span class="t">' + esc(g.title) + "</span></button>"; }).join("") + "</div></div>";
  var ed = $("#ed");
  ed.oninput = function () { try { localStorage.setItem("speakwell.draft", ed.value); } catch (e) {} };
  $("#tpl").onchange = function () { var t = SW.templates.filter(function (x) { return x.id === this.value; }, this)[0]; if (t) { ed.value = t.text; ed.oninput(); } this.value = ""; };
  $("[data-say-ed]").onclick = function () { if (ed.value.trim()) say(ed.value); };
  $("#cpy").onclick = function () {
    var v = ed.value; if (!v) return;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { toast("Copied"); }).catch(function () { ed.select(); toast("Selected. Use your keyboard to copy."); });
  };
  $("#chk").onclick = function () {
    var t = ed.value; if (!t.trim()) { toast("Write something first."); return; }
    var r = checkWriting(t);
    $("#chkOut").innerHTML = '<div class="section card stack"><div class="meters"><div class="meter"><b>' + r.words + '</b><span>Words</span></div><div class="meter"><b>' + r.sentences + '</b><span>Sentences</span></div><div class="meter"><b>' + r.avg + '</b><span>Avg length</span></div><div class="meter"><b>' + r.flesch + '</b><span>Readability</span></div><div class="meter"><b>' + r.read + 'm</b><span>Read time</span></div></div>' +
      '<p class="small muted">Tone: ' + r.tone + ". Readability 60+ is easy for most readers; 30–50 is dense.</p>" +
      (r.issues.length ? r.issues.map(function (i) { return '<div class="issue"><span class="k">' + i[0] + "</span><span>" + esc(i[1]) + "</span></div>"; }).join("") : '<div class="issue"><span class="k">Clean</span><span>No issues found by the offline checker. For deeper feedback use AI rewrite.</span></div>') + "</div>";
    S.writes++; addXP(10, "writing check");
  };
  var prompts = {
    fix: "Correct all grammar, spelling and punctuation errors. First give the corrected text. Then list each change as 'original → fixed (rule)'.",
    formal: "Rewrite this in a polished, formal business tone. Keep the meaning and key details. Return only the rewrite, then one line on what changed.",
    friendly: "Rewrite this in a warm, friendly but professional tone. Return only the rewrite, then one line on what changed.",
    short: "Make this as concise as possible without losing key information. Return only the rewrite, then the word count before and after.",
    confident: "Rewrite this to sound more confident and direct: remove hedging, apologies and filler. Return only the rewrite, then list the weak phrases you removed.",
    speech: "Turn this into a short spoken speech (written for the ear: short sentences, signposts, a hook and a strong close). Mark pauses with '/'."
  };
  $$("[data-op]").forEach(function (b) {
    b.onclick = function () {
      var t = ed.value.trim(); if (!t) { toast("Write something first."); return; }
      var out = $("#aiW"); out.innerHTML = '<p class="muted">Working…</p>';
      aiCall([{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " You are editing the learner's writing. " + prompts[b.getAttribute("data-op")] }, { role: "user", content: t }])
        .then(function (r) {
          out.innerHTML = mdLite(r) + '<div class="row" style="margin-top:8px"><button class="btn sm" id="useR">Replace my draft</button></div>';
          $("#useR").onclick = function () { ed.value = r.split(/\n\s*\n(?=[^\n]*(→|changed|removed|word count))/i)[0].trim(); ed.oninput(); toast("Draft replaced"); };
          addXP(5);
        }).catch(function (e) { out.innerHTML = '<div class="notice">' + esc(e.message) + "</div>"; });
    };
  });
  if (location.hash === "#guides") { var gs = $("#guides"); if (gs) gs.scrollIntoView(); }
};
VIEWS.guides = VIEWS.write;

VIEWS.guide = function (m, id) {
  var g = SW.guides.filter(function (x) { return x.id === id; })[0];
  if (!g) return VIEWS.write(m);
  var tpl = { "formal-letter": "letter", "thank-you": "thanks", congrats: "congrats", speech: "speech" }[g.id];
  m.innerHTML = top(esc(g.title), { back: "write", eyebrow: g.kind }) +
    '<div class="stack"><div class="card"><ol class="steps">' + g.steps.map(function (s) { return "<li><span>" + esc(s) + "</span></li>"; }).join("") + "</ol></div>" +
    '<div class="why">' + esc(g.tip) + "</div>" +
    (tpl ? '<div class="row"><button class="btn primary" id="useTpl">Open the template in the studio</button></div>' : "") +
    '<div class="section card"><h3>Practise</h3><p class="muted small">Write a short piece using this guide, then get AI feedback.</p><textarea id="gt" rows="6"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="gb">' + ico("spark") + 'Feedback</button><button class="btn ghost" id="gc">Offline check</button></div><div id="go" class="ai-out" style="margin-top:10px"></div></div></div>';
  if (tpl) $("#useTpl").onclick = function () { try { localStorage.setItem("speakwell.draft", SW.templates.filter(function (t) { return t.id === tpl; })[0].text); } catch (e) {} go("write"); };
  aiBox($("#gb"), $("#gt"), $("#go"), function (q) { return [{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " The learner practised: " + g.title + ". Steps: " + g.steps.join(" | ") + ". Assess how well they followed the steps, correct language errors, and give an improved version." }, { role: "user", content: q }]; });
  $("#gc").onclick = function () { var r = checkWriting($("#gt").value); $("#go").innerHTML = r.issues.length ? r.issues.map(function (i) { return '<div class="issue"><span class="k">' + i[0] + "</span><span>" + esc(i[1]) + "</span></div>"; }).join("") : '<p class="muted">No issues found offline.</p>'; };
};

/* ---------- Coach (AI chat) ---------- */
var MODES = [
  ["free", "Free conversation", "a friendly conversation partner. Chat naturally about anything the learner wants."],
  ["grammar", "Grammar questions", "a patient grammar teacher. Answer questions with short, clear examples."],
  ["presentation", "Presentation rehearsal", "a presentation coach. Ask the learner to deliver their talk section by section; after each, give 2 strengths and 2 improvements on structure, clarity and delivery words."],
  ["meeting", "Run a meeting", "two or three colleagues (give each a name) in a meeting the learner is chairing. Stay in character; be realistic, sometimes off-topic."],
  ["interview", "Mock interview", "a hiring manager. Ask one question at a time, follow up, and at the end give a scored debrief."]
];
VIEWS.coach = function (m, sceneId) {
  var scene = sceneId && SW.scenarios.filter(function (x) { return x.id === sceneId; })[0];
  var mode = scene ? "scene:" + scene.id : (S._mode || "free");
  var key = mode;
  var hist = S.chats[key] || [];
  var scriptIdx = 0;
  function sysPrompt() {
    var who = scene ? scene.role : (MODES.filter(function (x) { return x[0] === mode; })[0] || MODES[0])[2];
    return COACH_BASE.replace("{level}", S.settings.level) + " In this conversation you play " + who + " Stay in role and keep each reply to 1–4 sentences so the learner speaks more than you." +
      (S.settings.coachReplies ? " After your in-role reply, if the learner's last message had a grammar, word-choice or naturalness problem, add a new line starting with 'Tip:' giving the better version in under 20 words. If it was fine, skip the tip." : "");
  }
  m.innerHTML = top(scene ? esc(scene.title) : "AI coach", { back: scene ? "scene~" + scene.id : null, eyebrow: scene ? "Role-play" : "Conversation practice" }) +
    (scene ? "" : '<div class="row" style="margin-bottom:12px">' + MODES.map(function (x) { return '<button class="chip' + (mode === x[0] ? " on" : "") + '" data-m="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>") +
    (!S.settings.apiKey ? '<div class="notice" style="margin-bottom:12px">No API key yet, so the coach uses offline practice lines. Add your key in <a href="#settings">Settings</a> for live AI conversation.</div>' : !online() ? '<div class="notice" style="margin-bottom:12px">You\'re offline, so the coach uses offline practice lines.</div>' : "") +
    '<div class="chat" id="chat"></div><div class="composer"><button class="icon-btn" id="cMic" aria-label="Speak" style="width:46px;height:46px">' + ico("mic") + '</button><textarea id="cIn" rows="1" placeholder="Type or tap the mic…"></textarea><button class="btn primary" id="cSend" aria-label="Send">' + ico("send") + '</button></div>' +
    '<div class="row" style="margin-top:6px"><label class="row small" for="spk"><input type="checkbox" id="spk"' + (S.settings.speakReplies ? " checked" : "") + '> Read replies aloud</label><button class="btn sm ghost" id="cReset">New conversation</button><button class="btn sm ghost" id="cEval">Get feedback on my English</button></div>';
  var chat = $("#chat"), inp = $("#cIn");
  function bubble(role, text) {
    var d = document.createElement("div"); d.className = "msg " + (role === "user" ? "me" : role === "assistant" ? "bot" : "sys");
    if (role === "assistant") {
      var parts = text.split(/\n(?=Tip:)/);
      d.innerHTML = mdLite(parts[0]) + (parts[1] ? '<div class="why" style="margin-top:8px">' + esc(parts[1]) + "</div>" : "") + '<button class="icon-btn" style="margin-top:6px;width:30px;height:30px" aria-label="Listen" data-say="' + esc(parts[0]) + '">' + ico("play") + "</button>";
    } else d.textContent = text;
    chat.appendChild(d); d.scrollIntoView({ block: "end", behavior: "smooth" });
  }
  function opener() {
    if (scene) return scene.script[0];
    return { free: "Hi! What would you like to talk about today?", grammar: "Ask me any grammar question, or paste a sentence and I'll check it.", presentation: "What's your presentation about, and who's the audience? Then give me your opening.", meeting: "Hi everyone. Looks like we're all here. Over to you to start the meeting.", interview: "Thanks for coming in. Let's start: tell me a little about yourself." }[mode];
  }
  if (!hist.length) hist.push({ role: "assistant", content: opener() });
  hist.forEach(function (h) { bubble(h.role, h.content); });
  function persist() { S.chats[key] = hist.slice(-40); save(); }
  function send(text) {
    text = text.trim(); if (!text) return;
    hist.push({ role: "user", content: text }); bubble("user", text); inp.value = ""; persist();
    if (!aiReady()) {
      var lines = scene ? scene.script : ["Interesting! Can you tell me more?", "Why do you think that?", "Can you give me an example?", "How would you say that more formally?", "Great. Now try saying it in under 20 words."];
      scriptIdx = Math.min(scriptIdx + 1, lines.length - 1);
      var gi = checkWriting(text).issues.filter(function (i) { return i[0] === "Grammar" || i[0] === "Word"; })[0];
      var fl = analyzeSpeech(text, 0).fillers;
      var tip = gi ? gi[1] : fl ? "Drop the filler words; a short pause sounds more confident." : "";
      var reply = lines[scriptIdx] + (tip ? "\nTip: " + tip : "");
      hist.push({ role: "assistant", content: reply }); bubble("assistant", reply); persist(); addXP(2);
      if ($("#spk").checked) say(lines[scriptIdx]);
      return;
    }
    var wait = document.createElement("div"); wait.className = "msg sys"; wait.textContent = "…"; chat.appendChild(wait);
    aiCall([{ role: "system", content: sysPrompt() }].concat(hist.slice(-20))).then(function (r) {
      wait.remove(); hist.push({ role: "assistant", content: r }); bubble("assistant", r); persist(); addXP(2);
      if ($("#spk").checked) say(r.split(/\nTip:/)[0]);
    }).catch(function (e) { wait.remove(); bubble("system", e.message); });
  }
  $("#cSend").onclick = function () { send(inp.value); };
  inp.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inp.value); } };
  $("#spk").onchange = function () { S.settings.speakReplies = this.checked; save(); };
  $("#cReset").onclick = function () { delete S.chats[key]; save(); route(); };
  $$("[data-m]").forEach(function (b) { b.onclick = function () { S._mode = b.getAttribute("data-m"); save(); route(); }; });
  $("#cEval").onclick = function () {
    var mine = hist.filter(function (h) { return h.role === "user"; }).map(function (h) { return h.content; }).join("\n");
    if (!mine) { toast("Say something first."); return; }
    if (!aiReady()) { var r = analyzeSpeech(mine, 0); bubble("system", "Offline check: " + r.feedback.map(function (f) { return f[1]; }).join(" ")); return; }
    bubble("system", "Reviewing your messages…");
    aiCall([{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " Review all of the learner's messages from a conversation. Give: overall level estimate (CEFR), 3 strengths, the 5 most useful corrections (You said → Better), and 5 natural phrases they could use next time in this situation." }, { role: "user", content: mine }])
      .then(function (r) { bubble("assistant", r); addXP(10, "conversation review"); }).catch(function (e) { bubble("system", e.message); });
  };
  /* mic into composer */
  var L2 = null, on = false, micBtn = $("#cMic");
  micBtn.onclick = function () {
    if (!SR) { toast("Speech-to-text isn't supported in this browser. Use the keyboard's mic button instead."); return; }
    if (on) { on = false; L2.stop(); micBtn.classList.remove("live"); micBtn.style.background = ""; if (inp.value.trim()) send(inp.value); return; }
    on = true; micBtn.style.background = "var(--bad-soft)";
    L2 = new Listener(function (f, i) { inp.value = f + (i ? " " + i : ""); }); L2.start();
  };
  cleanup.push(function () { if (L2) L2.stop(); });
};

/* ---------- Progress ---------- */
VIEWS.progress = function (m) {
  var ss = S.sessions.slice(-20);
  var avg = ss.length ? Math.round(ss.reduce(function (a, b) { return a + b.score; }, 0) / ss.length) : 0;
  var fpm = ss.length ? (ss.reduce(function (a, b) { return a + (b.words ? b.fillers / b.words * 100 : 0); }, 0) / ss.length).toFixed(1) : "0";
  m.innerHTML = top("Progress", { eyebrow: "Your numbers" }) +
    '<div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))"><div class="stat"><b>' + S.streak + '</b><span>Day streak</span></div><div class="stat"><b>' + S.xp + '</b><span>Total XP</span></div><div class="stat"><b>' + S.sessions.length + '</b><span>Speaking sessions</span></div><div class="stat"><b>' + (S.quiz.total ? Math.round(S.quiz.right / S.quiz.total * 100) : 0) + '%</b><span>Quiz accuracy</span></div><div class="stat"><b>' + S.writes + '</b><span>Writing checks</span></div></div>' +
    '<div class="section card"><div class="head"><h2>Speaking score</h2><span class="muted small">last ' + ss.length + " sessions · avg " + avg + " · fillers " + fpm + '/100 words</span></div>' +
    (ss.length ? '<div class="spark">' + ss.map(function (s) { return '<i style="height:' + Math.max(4, s.score) + '%" title="' + s.score + '"></i>'; }).join("") + "</div>" : '<p class="muted">No sessions yet. Try a scenario in Speak.</p>') + "</div>" +
    '<div class="section"><h2>Lessons by section</h2><div class="card stack">' + SW.lessonGroups.map(function (g) {
      var ls = SW.lessons.filter(function (l) { return l.group === g.id; }), d = ls.filter(function (l) { return S.done[l.id]; }).length;
      return '<div><div class="row" style="justify-content:space-between"><b>' + g.name + '</b><span class="small muted" style="font-variant-numeric:tabular-nums">' + d + "/" + ls.length + '</span></div><div class="bar"><i style="width:' + (d / ls.length * 100) + '%"></i></div></div>';
    }).join("") + "</div></div>";
};

/* ---------- Settings ---------- */
VIEWS.settings = function (m) {
  var s = S.settings;
  m.innerHTML = top("Settings", { eyebrow: "App", noGear: true }) +
    '<div class="stack"><div class="card stack"><h2>AI model</h2>' +
    '<p class="muted small">Your key is stored only on this device and sent directly to the AI provider. Never share a screenshot of this page.</p>' +
    '<label class="f" for="sKey">OpenAI API key<span class="hint">Create one at platform.openai.com → API keys. Starts with sk-</span><input id="sKey" type="password" autocomplete="off" value="' + esc(s.apiKey) + '" placeholder="sk-…"></label>' +
    '<label class="f" for="sModel">Model ID<span class="hint">Type the model ID exactly as your OpenAI account lists it (for example gpt-5.6-luna). Use "Test connection" to confirm it works.</span><input id="sModel" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" value="' + esc(s.model) + '"></label>' +
    '<label class="f" for="sBase">API base URL<span class="hint">Leave as is for OpenAI. Change only for an OpenAI-compatible provider.</span><input id="sBase" type="text" autocapitalize="off" spellcheck="false" value="' + esc(s.baseUrl) + '"></label>' +
    '<label class="f" for="sTr">Transcription model<span class="hint">Used only when the phone can\'t do speech-to-text itself.</span><input id="sTr" type="text" autocapitalize="off" spellcheck="false" value="' + esc(s.transcribeModel) + '"></label>' +
    '<div class="row"><button class="btn primary" id="sSave">Save</button><button class="btn" id="sTest">Test connection</button></div><div id="sOut"></div></div>' +
    '<div class="card stack"><h2>Learning</h2>' +
    '<label class="f" for="sName">Your name<input id="sName" type="text" value="' + esc(S.name) + '"></label>' +
    '<label class="f" for="sLevel">Level<select id="sLevel">' + ["beginner", "intermediate", "advanced"].map(function (l) { return "<option" + (s.level === l ? " selected" : "") + ">" + l + "</option>"; }).join("") + "</select></label>" +
    '<label class="row" for="sTips"><input id="sTips" type="checkbox"' + (s.coachReplies ? " checked" : "") + "> Coach adds a correction tip after my messages</label></div>" +
    '<div class="card stack"><h2>Voice</h2>' +
    '<label class="f" for="sLang">Speech recognition accent<select id="sLang">' + [["en-IN", "English (India)"], ["en-US", "English (US)"], ["en-GB", "English (UK)"], ["en-AU", "English (Australia)"]].map(function (l) { return '<option value="' + l[0] + '"' + (s.lang === l[0] ? " selected" : "") + ">" + l[1] + "</option>"; }).join("") + "</select></label>" +
    '<label class="f" for="sVoice">Reading voice<select id="sVoice"><option value="">Default</option>' + voices.map(function (v) { return '<option value="' + esc(v.name) + '"' + (s.voice === v.name ? " selected" : "") + ">" + esc(v.name + " (" + v.lang + ")") + "</option>"; }).join("") + "</select></label>" +
    '<label class="f" for="sRate">Speaking speed: <span id="rv">' + s.rate + '</span><input id="sRate" type="range" min="0.6" max="1.4" step="0.05" value="' + s.rate + '"></label>' +
    '<div class="row"><button class="btn" data-say="Hello! This is how I sound. Let\'s practise your English together.">' + ico("play") + "Test voice</button></div></div>" +
    '<div class="card stack"><h2>Appearance</h2><div class="row">' + ["system", "light", "dark"].map(function (t) { return '<button class="chip' + (s.theme === t ? " on" : "") + '" data-th="' + t + '">' + t + "</button>"; }).join("") + "</div></div>" +
    '<div class="card stack"><h2>Your data</h2><p class="muted small">Progress is saved on this device. Back it up before changing phones or clearing browser data.</p><div class="row"><button class="btn" id="sExp">Export backup</button><label class="btn" for="sImp">Import backup<input id="sImp" type="file" accept="application/json" hidden></label></div>' +
    '<hr class="sep"><div class="row"><button class="btn ghost" id="sReset" style="color:var(--bad)">Reset all progress</button><span id="sResetC" hidden class="row"><span class="small">This deletes XP, streaks and history.</span><button class="btn sm" id="sResetY" style="color:var(--bad)">Yes, reset</button><button class="btn sm" id="sResetN">Cancel</button></span></div></div>' +
    '<p class="muted small">Speakwell works offline after the first visit. Speech-to-text uses your phone\'s recogniser, which usually needs a connection; when offline you can still record, replay and type.</p></div>';
  function collect() {
    s.apiKey = $("#sKey").value.trim(); s.model = $("#sModel").value.trim() || "gpt-5.6-luna"; s.baseUrl = $("#sBase").value.trim() || "https://api.openai.com/v1"; s.transcribeModel = $("#sTr").value.trim();
    S.name = $("#sName").value.trim(); s.level = $("#sLevel").value; s.coachReplies = $("#sTips").checked; s.lang = $("#sLang").value; s.voice = $("#sVoice").value; s.rate = +$("#sRate").value;
    save();
  }
  $$("input,select", m).forEach(function (el) { if (el.id !== "sImp") el.addEventListener("change", collect); });
  $("#sRate").oninput = function () { $("#rv").textContent = this.value; };
  $("#sSave").onclick = function () { collect(); toast("Saved"); route(); };
  $("#sTest").onclick = function () {
    collect(); var out = $("#sOut"); out.innerHTML = '<p class="muted small">Testing ' + esc(s.model) + "…</p>";
    aiCall([{ role: "user", content: "Reply with exactly: Connected. Then one short sentence of encouragement for an English learner." }])
      .then(function (r) { out.innerHTML = '<div class="notice info"><b>Works.</b> ' + esc(r) + "</div>"; })
      .catch(function (e) { out.innerHTML = '<div class="notice">' + esc(e.message) + "</div>"; });
  };
  $$("[data-th]").forEach(function (b) { b.onclick = function () { s.theme = b.getAttribute("data-th"); save(); applyTheme(); route(); }; });
  $("#sExp").onclick = function () {
    var copy = JSON.parse(JSON.stringify(S)); copy.settings.apiKey = "";
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(copy, null, 1)], { type: "application/json" }));
    a.download = "speakwell-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
    toast("Backup saved (API key not included)");
  };
  $("#sImp").onchange = function () {
    var f = this.files[0]; if (!f) return;
    var r = new FileReader(); r.onload = function () {
      try { var o = JSON.parse(r.result); var key = S.settings.apiKey; S = Object.assign(JSON.parse(JSON.stringify(defaults)), o); S.settings = Object.assign({}, defaults.settings, o.settings || {}); if (!S.settings.apiKey) S.settings.apiKey = key; save(); toast("Backup restored"); route(); }
      catch (e) { toast("That file isn't a Speakwell backup."); }
    }; r.readAsText(f);
  };
  $("#sReset").onclick = function () { $("#sResetC").hidden = false; };
  $("#sResetN").onclick = function () { $("#sResetC").hidden = true; };
  $("#sResetY").onclick = function () { var st = S.settings; S = JSON.parse(JSON.stringify(defaults)); S.settings = st; save(); toast("Progress reset"); go("home"); };
};

/* ================= boot ================= */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
route();
})();
