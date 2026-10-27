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
  note: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  down: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/>'
};
function ico(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; }

/* ================= state ================= */
var KEY = "speakwell.v1";
/* Data model is merge-safe so several devices can sync through Google Drive:
   - counters are kept per device (counts[deviceId]) and summed
   - active days are a set, streak is computed from it
   - lessons, sessions, history and chats carry timestamps and are unioned */
var defaults = {
  name: "", done: {}, days: {}, counts: {}, sessions: [], history: [], chats: {}, chatsT: {}, draft: "", draftT: 0, analyses: {}, notes: [], notesDel: {}, wip: { orig: "", fixes: [], t: 0 }, curNote: "",
  resetAt: 0, historyClearedAt: 0, updatedAt: 0,
  xp: 0, streak: 0, writes: 0, quiz: { right: 0, total: 0 },
  settings: { apiKey: "", baseUrl: "https://api.openai.com/v1", model: "gpt-5.6-luna", transcribeModel: "gpt-4o-mini-transcribe",
    lang: "en-IN", voice: "", rate: 0.95, theme: "system", coachReplies: true, speakReplies: false, level: "intermediate" }
};
var M = loadMeta();   /* device-only: sync state, device id */
function loadMeta() {
  var m = {}; try { m = JSON.parse(localStorage.getItem("speakwell.meta") || "{}"); } catch (e) {}
  if (!m.dev) m.dev = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return Object.assign({ on: false, fileId: "", last: 0, err: "", clientId: "", hint: "", syncKey: false }, m);
}
function saveMeta() { try { localStorage.setItem("speakwell.meta", JSON.stringify(M)); } catch (e) {} }
saveMeta();
var S = load();
function load() {
  var o = null;
  try { var raw = localStorage.getItem(KEY); if (raw) o = JSON.parse(raw); } catch (e) {}
  var s = JSON.parse(JSON.stringify(defaults));
  if (o) { s = Object.assign(s, o); s.settings = Object.assign({}, defaults.settings, o.settings || {}); }
  /* migrate v1 data (single counters) into the per-device model */
  if (o && !o.counts) {
    s.counts = {}; s.counts[M.dev] = { xp: o.xp || 0, writes: o.writes || 0, qr: (o.quiz && o.quiz.right) || 0, qt: (o.quiz && o.quiz.total) || 0 };
    s.days = {};
    if (o.lastDay) { var p = o.lastDay.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]); for (var i = 0; i < (o.streak || 1); i++) { s.days[dayKey(new Date(d - i * 864e5))] = 1; } }
    Object.keys(s.done).forEach(function (k) { if (s.done[k] === 1) s.done[k] = Date.now(); });
    try { var dr = localStorage.getItem("speakwell.draft"); if (dr) { s.draft = dr; s.draftT = Date.now(); } } catch (e) {}
  }
  recount(s);
  return s;
}
function dayKey(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function today() { return dayKey(new Date()); }
function recount(s) {
  var t = { xp: 0, writes: 0, qr: 0, qt: 0 };
  Object.keys(s.counts || {}).forEach(function (k) { var c = s.counts[k]; t.xp += c.xp || 0; t.writes += c.writes || 0; t.qr += c.qr || 0; t.qt += c.qt || 0; });
  s.xp = t.xp; s.writes = t.writes; s.quiz = { right: t.qr, total: t.qt };
  var n = 0, d = new Date();
  if (!s.days[dayKey(d)]) d = new Date(d - 864e5);
  while (s.days[dayKey(d)]) { n++; d = new Date(d - 864e5); }
  s.streak = n;
}
function mine() { if (!S.counts[M.dev]) S.counts[M.dev] = { xp: 0, writes: 0, qr: 0, qt: 0 }; return S.counts[M.dev]; }
function bump(field, n) { mine()[field] = (mine()[field] || 0) + (n == null ? 1 : n); S.days[today()] = 1; recount(S); }
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function save() { S.updatedAt = Date.now(); saveLocal(); markDirty(); }
function addXP(n, why) {
  bump("xp", n);
  save();
  if (why) toast("+" + n + " XP · " + why);
}
/* Correction history: every fix, check and piece of feedback */
function logHistory(kind, title, input, output) {
  var cut = function (x) { x = String(x || ""); return x.length > 4000 ? x.slice(0, 4000) + "…" : x; };
  S.history.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(), kind: kind, title: title, input: cut(input), output: cut(output) });
  if (S.history.length > 600) S.history = S.history.slice(-600);
  save();
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
function aiCall(messages, opts) {
  opts = opts || {};
  var s = S.settings;
  if (!s.apiKey) return Promise.reject(new Error("Add your OpenAI API key in Settings to use AI features."));
  if (!online()) return Promise.reject(new Error("You're offline. AI feedback needs a connection; the offline checks above still work."));
  var base = (s.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  return fetch(base + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + s.apiKey },
    body: JSON.stringify(Object.assign({ model: s.model, messages: messages }, opts.json && !opts.plain ? { response_format: { type: "json_object" } } : {}))
  }).then(function (r) {
    return r.text().then(function (t) {
      var j = null; try { j = JSON.parse(t); } catch (e) {}
      if (!r.ok) {
        var m = j && j.error && j.error.message ? j.error.message : ("HTTP " + r.status);
        if (r.status === 401) m = "The API key was rejected. Check it in Settings.";
        if (r.status === 404 || /model/i.test(m) && /not exist|not found|does not have access/i.test(m)) m = "Model '" + s.model + "' wasn't found for this key. Check the model ID in Settings (" + m + ")";
        if (r.status === 429) m = "Rate limit or billing limit reached on your OpenAI account. " + m;
        if (opts.json && !opts.plain && /response_format|json_object/i.test(m)) { var e0 = new Error(m); e0.retryPlain = true; throw e0; }
        throw new Error(m);
      }
      var c = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (Array.isArray(c)) c = c.map(function (p) { return p.text || ""; }).join("");
      if (!c) throw new Error("The model returned an empty reply.");
      return c;
    });
  }).catch(function (e) { if (e.retryPlain) return aiCall(messages, Object.assign({}, opts, { plain: true })); throw e; });
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
/* ================= Google Drive sync ================= */
/* Uses the drive.file scope: the app can only see files it created itself.
   Data lives at  My Drive / Speakwell / speakwell-data.json  */
var DEFAULT_CLIENT = "399582350522-hiqi4bqev0kjqkt9iljd687qe3g13o9o.apps.googleusercontent.com";
var GSCOPE = "https://www.googleapis.com/auth/drive.file";
var FILE_NAME = "speakwell-data.json", FOLDER_NAME = "Speakwell", FOLDER_MIME = "application/vnd.google-apps.folder";
var Sync = { token: null, exp: 0, busy: null, timer: null, dirty: false };
try { var tk0 = JSON.parse(localStorage.getItem("speakwell.gtoken") || "null"); if (tk0 && tk0.exp > Date.now() + 60000) { Sync.token = tk0.token; Sync.exp = tk0.exp; } } catch (e) {}
function tokenValid() { return !!Sync.token && Sync.exp > Date.now() + 60000; }
function loadGIS() {
  return new Promise(function (res, rej) {
    if (window.google && google.accounts && google.accounts.oauth2) return res();
    var s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = function () { res(); }; s.onerror = function () { rej(new Error("Couldn't load Google sign-in. Check your connection.")); };
    document.head.appendChild(s);
  });
}
function getToken() {
  if (tokenValid()) return Promise.resolve(Sync.token);
  if (!online()) return Promise.reject(new Error("You're offline. Changes are saved on this device and will sync when you're back online."));
  return loadGIS().then(function () {
    return new Promise(function (res, rej) {
      var tc = google.accounts.oauth2.initTokenClient({
        client_id: M.clientId || DEFAULT_CLIENT, scope: GSCOPE, prompt: M.on ? "" : "consent", login_hint: M.hint || undefined,
        callback: function (r) {
          if (r.error) return rej(new Error("Google sign-in: " + (r.error_description || r.error)));
          Sync.token = r.access_token; Sync.exp = Date.now() + (Number(r.expires_in) || 3600) * 1000;
          try { localStorage.setItem("speakwell.gtoken", JSON.stringify({ token: Sync.token, exp: Sync.exp })); } catch (e) {}
          res(Sync.token);
        },
        error_callback: function (e) { rej(new Error(e && e.type === "popup_closed" ? "The Google sign-in window was closed." : e && e.type === "popup_failed_to_open" ? "Chrome blocked the Google sign-in window. Allow pop-ups for this site and try again." : "Google sign-in failed.")); }
      });
      tc.requestAccessToken();
    });
  });
}
function gfetch(url, opt) {
  opt = opt || {}; opt.headers = Object.assign({ Authorization: "Bearer " + Sync.token }, opt.headers || {});
  return fetch(url, opt).then(function (r) {
    if (r.status === 401) { Sync.token = null; try { localStorage.removeItem("speakwell.gtoken"); } catch (e) {} var e1 = new Error("Google sign-in expired. Tap Sync to reconnect."); e1.status = 401; throw e1; }
    if (!r.ok) return r.text().then(function (t) {
      var m = "Google Drive error " + r.status; try { m = JSON.parse(t).error.message; } catch (e) {}
      if (/has not been used|is disabled/i.test(m)) m = "The Google Drive API is turned off for this Google Cloud project. Turn it on (see Settings → Google Drive sync → How to set up).";
      var e2 = new Error(m); e2.status = r.status; throw e2;
    });
    return r;
  });
}
var DAPI = "https://www.googleapis.com/drive/v3/files", UAPI = "https://www.googleapis.com/upload/drive/v3/files";
function dfind(name, mime) {
  var q = "name='" + name + "' and trashed=false" + (mime ? " and mimeType='" + mime + "'" : "");
  return gfetch(DAPI + "?spaces=drive&orderBy=modifiedTime desc&fields=files(id,modifiedTime)&q=" + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (j) { return j.files && j.files[0]; });
}
function dfolder() {
  return dfind(FOLDER_NAME, FOLDER_MIME).then(function (f) {
    if (f) return f.id;
    return gfetch(DAPI + "?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }) }).then(function (r) { return r.json(); }).then(function (j) { return j.id; });
  });
}
function dcreate(body) {
  return dfolder().then(function (fid) {
    var b = "speakwell" + Date.now(), meta = { name: FILE_NAME, parents: [fid], mimeType: "application/json", description: "Speakwell English coach: progress and correction history" };
    var data = "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(meta) + "\r\n--" + b + "\r\nContent-Type: application/json\r\n\r\n" + body + "\r\n--" + b + "--";
    return gfetch(UAPI + "?uploadType=multipart&fields=id", { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + b }, body: data }).then(function (r) { return r.json(); }).then(function (j) { return j.id; });
  });
}
function dupdate(id, body) { return gfetch(UAPI + "/" + id + "?uploadType=media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: body }); }
function dread(id) { return gfetch(DAPI + "/" + id + "?alt=media").then(function (r) { return r.json(); }); }

function forDrive(s) { var c = JSON.parse(JSON.stringify(s)); if (!M.syncKey) c.settings.apiKey = ""; delete c.settings.voice; return c; }
function merge(a, b) {
  var R = Math.max(a.resetAt || 0, b.resetAt || 0), aOld = (a.resetAt || 0) < R, bOld = (b.resetAt || 0) < R;
  var H = Math.max(a.historyClearedAt || 0, b.historyClearedAt || 0, R);
  var src = aOld ? [b] : bOld ? [a] : [a, b];
  var out = JSON.parse(JSON.stringify(a));
  out.resetAt = R; out.historyClearedAt = Math.max(a.historyClearedAt || 0, b.historyClearedAt || 0);
  out.done = {};
  [a, b].forEach(function (s) { Object.keys(s.done || {}).forEach(function (k) { var t = s.done[k]; if (t > R) out.done[k] = Math.max(out.done[k] || 0, t); }); });
  out.days = {}; src.forEach(function (s) { Object.keys(s.days || {}).forEach(function (k) { out.days[k] = 1; }); });
  out.counts = {};
  src.forEach(function (s) { Object.keys(s.counts || {}).forEach(function (dv) {
    var c = s.counts[dv], o = out.counts[dv] || { xp: 0, writes: 0, qr: 0, qt: 0 };
    out.counts[dv] = { xp: Math.max(o.xp, c.xp || 0), writes: Math.max(o.writes, c.writes || 0), qr: Math.max(o.qr, c.qr || 0), qt: Math.max(o.qt, c.qt || 0) };
  }); });
  function union(x, y, idk, tk, cutoff, cap) {
    var m = {}; (x || []).concat(y || []).forEach(function (e) { if (e[tk] > cutoff) m[e[idk]] = e; });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (p, q) { return p[tk] - q[tk]; }).slice(-cap);
  }
  out.sessions = union(a.sessions, b.sessions, "d", "d", R, 300);
  out.history = union(a.history, b.history, "id", "t", H, 600);
  out.chats = {}; out.chatsT = {};
  Object.keys(Object.assign({}, a.chats, b.chats)).forEach(function (k) {
    var ta = (a.chatsT || {})[k] || 0, tb = (b.chatsT || {})[k] || 0, w = tb > ta ? b : a, t = Math.max(ta, tb);
    if (t > R || (!ta && !tb)) { out.chats[k] = (w.chats || {})[k] || []; out.chatsT[k] = t; }
  });
  if ((b.draftT || 0) > (a.draftT || 0)) { out.draft = b.draft; out.draftT = b.draftT; }
  if ((b.draftT || 0) > (a.draftT || 0)) { if (b.wip) out.wip = b.wip; out.curNote = b.curNote || ""; }
  out.notesDel = Object.assign({}, a.notesDel || {});
  Object.keys(b.notesDel || {}).forEach(function (k) { out.notesDel[k] = Math.max(out.notesDel[k] || 0, b.notesDel[k]); });
  var nm = {};
  (a.notes || []).concat(b.notes || []).forEach(function (n) { if (n.t <= R || out.notesDel[n.id]) return; if (!nm[n.id] || (nm[n.id].u || 0) < (n.u || 0)) nm[n.id] = n; });
  out.notes = Object.keys(nm).map(function (k) { return nm[k]; }).sort(function (p, q) { return p.t - q.t; }).slice(-500);
  out.analyses = Object.assign({}, a.analyses || {});
  Object.keys(b.analyses || {}).forEach(function (k) { if (!out.analyses[k] || out.analyses[k].t < b.analyses[k].t) out.analyses[k] = b.analyses[k]; });
  var newer = (b.updatedAt || 0) > (a.updatedAt || 0) ? b : a;
  out.name = newer.name || a.name || b.name || "";
  if (newer === b && b.settings) {
    var keep = { apiKey: a.settings.apiKey, voice: a.settings.voice };
    out.settings = Object.assign({}, defaults.settings, b.settings, keep);
    if (!keep.apiKey && b.settings.apiKey) out.settings.apiKey = b.settings.apiKey;
  } else if (!a.settings.apiKey && b.settings && b.settings.apiKey) out.settings.apiKey = b.settings.apiKey;
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  recount(out);
  return out;
}
function syncNow(interactive) {
  if (Sync.busy) return Sync.busy;
  M.err = ""; refreshSync("busy");
  Sync.busy = getToken().then(function () {
    var find = M.fileId ? Promise.resolve({ id: M.fileId }) : dfind(FILE_NAME);
    return find.then(function (f) {
      if (!f) return null;
      M.fileId = f.id;
      return dread(f.id).catch(function (e) { if (e.status === 404) { M.fileId = ""; return dfind(FILE_NAME).then(function (g) { if (!g) return null; M.fileId = g.id; return dread(g.id); }); } throw e; });
    });
  }).then(function (remote) {
    if (remote && remote.app === "speakwell" && remote.data) { S = merge(S, remote.data); applyTheme(); }
    saveLocal();
    var payload = JSON.stringify({ app: "speakwell", v: 2, savedAt: Date.now(), data: forDrive(S) });
    return M.fileId ? dupdate(M.fileId, payload) : dcreate(payload).then(function (id) { M.fileId = id; });
  }).then(function () {
    M.on = true; M.last = Date.now(); M.err = ""; Sync.dirty = false; saveMeta(); refreshSync();
  }).catch(function (e) {
    M.err = e.message; saveMeta(); refreshSync(); if (interactive) toast(e.message); throw e;
  }).then(function (x) { Sync.busy = null; return x; }, function (e) { Sync.busy = null; throw e; });
  return Sync.busy;
}
function markDirty() {
  Sync.dirty = true;
  if (typeof refreshSync === "function") refreshSync();
  if (!M.on || !tokenValid() || !online()) return;
  clearTimeout(Sync.timer); Sync.timer = setTimeout(function () { syncNow(false).catch(function () {}); }, 12000);
}
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden" && Sync.dirty && M.on && tokenValid() && online()) { clearTimeout(Sync.timer); syncNow(false).catch(function () {}); }
});
function ago(t) { var s = Math.round((Date.now() - t) / 1000); if (s < 60) return "just now"; if (s < 3600) return Math.round(s / 60) + " min ago"; if (s < 86400) return Math.round(s / 3600) + " h ago"; return new Date(t).toLocaleDateString(); }
function syncLabel(state) {
  if (!M.on) return null;
  if (state === "busy" || Sync.busy) return ["busy", "Syncing…"];
  if (M.err) return ["err", "Sync error"];
  if (!online()) return ["off", Sync.dirty ? "Will sync" : "Drive"];
  if (!tokenValid()) return ["off", "Tap to sync"];
  if (Sync.dirty) return ["off", "Saving…"];
  return ["ok", "Synced"];
}
function syncPill(state) {
  var l = syncLabel(state); if (!l) return "";
  return '<button class="status sync-pill" data-sync title="' + esc(M.err || (M.last ? "Last synced " + ago(M.last) : "Google Drive sync")) + '"><i class="dot' + (l[0] === "ok" ? "" : l[0] === "err" ? " err" : " off") + '"></i>' + l[1] + "</button>";
}
function refreshSync(state) { $$(".sync-pill").forEach(function (p) { p.outerHTML = syncPill(state); }); var st = $("#syncState"); if (st) st.innerHTML = syncStateHTML(); }
function syncStateHTML() {
  if (!M.on) return '<p class="muted small">Not connected. Progress is saved on this device only.</p>';
  return '<p class="small"><b>Connected.</b> ' + (M.last ? "Last synced " + ago(M.last) + "." : "") + (M.hint ? " Account: " + esc(M.hint) + "." : "") + "</p>" + (M.err ? '<div class="notice">' + esc(M.err) + "</div>" : "");
}
var SAFE_VIEWS = ["notes", "note", "home", "learn", "progress", "history", "speak", "settings", "write"];
function afterSync() { var v = (location.hash || "#home").slice(1).split("~")[0]; if (SAFE_VIEWS.indexOf(v) > -1 && !document.activeElement.matches("textarea,input")) route(); }
document.addEventListener("click", function (e) {
  if (!e.target.closest("[data-sync]")) return;
  e.preventDefault();
  syncNow(true).then(function () { toast("Synced with Google Drive"); afterSync(); }).catch(function () {});
});

var COACH_BASE ="You are Speakwell, a warm, practical English speaking and writing coach for an adult professional in India who wants to sound clear and confident at work and with friends. Level: {level}. Use simple, natural, global English. Keep replies short (under 120 words) unless asked for more.";

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

/* ================= install as an app ================= */
var installEvt = null;
function isInstalled() { return (window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: minimal-ui)").matches)) || navigator.standalone === true; }
window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); installEvt = e; $$("[data-install]").forEach(function (b) { b.hidden = false; }); });
window.addEventListener("appinstalled", function () { installEvt = null; toast("Speakwell is installed. Open it from your home screen."); $$("[data-install]").forEach(function (b) { b.hidden = true; }); });
function installSteps() {
  var ua = navigator.userAgent, android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
  if (/SamsungBrowser/i.test(ua)) return ["Tap the menu (☰) at the bottom right.", "Tap <b>Add page to</b>, then <b>Home screen</b>.", "Tap <b>Add</b>. Speakwell appears on your home screen."];
  if (ios) return ["Tap the <b>Share</b> button in Safari.", "Tap <b>Add to Home Screen</b>.", "Tap <b>Add</b>."];
  if (android) return ["Tap Chrome's menu <b>⋮</b> (top right).", "Tap <b>Add to home screen</b> (or <b>Install app</b>).", "Choose <b>Install</b>, not \"Create shortcut\". If you only see \"Create shortcut\", see the tips below.", "Speakwell appears in your app drawer and home screen."];
  return ["In Chrome or Edge, click the install icon at the right end of the address bar (a monitor with a down arrow).", "Or open the menu <b>⋮</b> → <b>Cast, save and share</b> → <b>Install page as app</b>.", "Click <b>Install</b>."];
}
function installHelpHTML() {
  return '<div class="card stack" id="instHelp"><h3>Install Speakwell</h3><ol class="steps">' + installSteps().map(function (x) { return "<li><span>" + x + "</span></li>"; }).join("") + "</ol>" +
    '<details class="small"><summary class="muted">Install option missing or only "Create shortcut"?</summary><ul class="points" style="margin-top:8px">' +
    "<li>Open the app in <b>Chrome</b> (not inside WhatsApp, Gmail or another app's browser). Use the address <b>sumanpresi.github.io/speakwell/</b>.</li>" +
    "<li>If Speakwell was installed before, Chrome shows <b>Open app</b> instead. Look for it in your app drawer, or uninstall it there first.</li>" +
    "<li>Reload the page once while online, wait 10 seconds, then try the menu again. Chrome needs one full load to make the app installable.</li>" +
    "<li>Still stuck: Chrome menu ⋮ → Settings → Site settings → All sites → sumanpresi.github.io → <b>Clear & reset</b>, then reopen the link. (This clears data on this phone only; your synced progress returns after you reconnect Google Drive.)</li></ul></details></div>";
}
function doInstall(btn) {
  if (installEvt) {
    var ev = installEvt; installEvt = null;
    ev.prompt();
    (ev.userChoice || Promise.resolve({})).then(function (c) { if (c.outcome !== "accepted") { installEvt = ev; toast("Install cancelled"); } });
    return;
  }
  if (isInstalled()) { toast("You're already using the installed app."); return; }
  var old = $("#instHelp"); if (old) { old.remove(); return; }
  $("#main").insertAdjacentHTML("afterbegin", installHelpHTML());
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("click", function (e) { var b = e.target.closest("[data-install]"); if (b) { e.preventDefault(); doInstall(b); } });

/* ================= router / shell ================= */
var NAV = [["home", "Home", "home"], ["learn", "Learn", "learn"], ["speak", "Speak", "speak"], ["write", "Write", "write"], ["coach", "Coach", "coach"]];
function shell(active) {
  var bottom = active === "notes" ? "write" : active;
  var t = NAV.map(function (n) { return '<button class="tab" data-go="' + n[0] + '"' + (bottom === n[0] ? ' aria-current="page"' : "") + ">" + ico(n[2]) + n[1] + "</button>"; }).join("");
  $("#tabs").innerHTML = t;
  $("#rail").innerHTML = '<div class="brand">' + logo() + '<b>Speakwell</b></div>' +
    NAV.map(function (n) { return '<button data-go="' + n[0] + '"' + (active === n[0] ? ' aria-current="page"' : "") + ">" + ico(n[2]) + n[1] + "</button>"; }).join("") +
    '<button data-go="notes"' + (active === "notes" ? ' aria-current="page"' : "") + ">" + ico("note") + 'My notes' + (S.notes.length ? '<span class="rail-count">' + S.notes.length + "</span>" : "") + "</button>" +
    '<button data-go="progress"' + (active === "progress" ? ' aria-current="page"' : "") + ">" + ico("chart") + 'Progress</button><div class="spacer"></div>' +
    (isInstalled() ? "" : '<button data-install class="rail-install">' + ico("down") + "Install app</button>") +
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
    '<div class="grow">' + (opts.eyebrow ? '<div class="eyebrow">' + esc(opts.eyebrow) + "</div>" : "") + "<h1>" + title + "</h1></div>" + syncPill() + statusPill() +
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
  if (SW.closeAnalysis) SW.closeAnalysis();
  if (typeof closeLinkMenu === "function") closeLinkMenu();
  var h = (location.hash || "#home").slice(1);
  var parts = h.split("~"), v = parts[0], arg = parts[1];
  var m = $("#main");
  var tab = { home: "home", learn: "learn", lesson: "learn", builder: "learn", quiz: "learn", words: "write", speak: "speak", scene: "speak", think: "speak", impromptu: "speak", drills: "speak", write: "write", guides: "write", guide: "write", coach: "coach", settings: "settings", progress: "progress", history: "progress", notes: "notes", note: "notes" }[v] || "home";
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
    '<div class="stats"><div class="stat"><b>' + S.streak + '</b><span>Day streak</span></div><div class="stat"><b>' + S.xp + '</b><span>XP</span></div><div class="stat"><b>' + lessonsDone + "/" + SW.lessons.length + '</b><span>Lessons</span></div></div>' + resumeHTML() + '</div>' +
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
    tile("notes", "My notes", (S.notes.length ? S.notes.length + " saved sentences" : "Your mistakes and corrections, side by side") + ", for revision.") +
    tile("history", "Correction history", (S.history.length ? S.history.length + " saved corrections and feedback" : "Every fix and piece of feedback, saved and synced") + ".") +
    "</div></div>" +
    (isInstalled() ? "" : '<div class="section"><div class="notice info row" style="justify-content:space-between"><span><b>Install Speakwell</b> on this device to open it like an app and use it offline.</span><button class="btn sm primary" data-install>' + ico("down") + "Install app</button></div></div>") +
    (S.settings.apiKey ? "" : '<div class="section"><div class="notice info"><b>Turn on the AI coach.</b> Add your OpenAI API key and model in <a href="#settings">Settings</a>. Everything else in the app works without it, including offline.</div></div>') +
    (S.name ? "" : '<div class="section card"><label class="f" for="nm">What should I call you?<input id="nm" type="text" placeholder="Your first name" autocomplete="given-name"></label><div class="row" style="margin-top:10px"><button class="btn primary" id="nmSave">Save</button></div></div>');
  var b = $("#nmSave"); if (b) b.onclick = function () { S.name = $("#nm").value.trim(); save(); route(); };
};
function resumeHTML() {
  var items = [], last = S.notes.slice().sort(function (a, b) { return b.u - a.u; })[0], ses = S.sessions[S.sessions.length - 1];
  if (S.draft && S.draft.trim()) items.push(tile("write", "Continue writing", esc(S.draft.replace(/\s+/g, " ").slice(0, 110))));
  if (last) items.push(tile("note~" + last.id, "Revise: " + esc(last.title), sentencePairs(last.orig, last.fixed).filter(function (x) { return x.changed; }).length + " sentences to review · " + relDate(last.u)));
  if (ses) items.push(tile("progress", "Last speaking score: " + ses.score, (ses.wpm ? ses.wpm + " words/min · " : "") + ses.fillers + " filler words"));
  if (!items.length) return "";
  return '<div class="stack" style="gap:8px"><span class="eyebrow">Pick up where you left off</span><div class="resume">' + items.join("") + "</div></div>";
}
function tile(go, t, d) { return '<button class="tile" data-go="' + go + '"><span class="t">' + t + '</span><span class="d">' + d + "</span></button>"; }

/* ---------- Learn ---------- */
VIEWS.learn = function (m) {
  var html = top("Grammar library", { eyebrow: "Learn" }) +
    '<div class="row"><button class="btn primary" data-go="quiz">' + ico("spark") + 'Mixed quiz</button><button class="btn" data-go="builder">Sentence builder</button><button class="btn" data-go="words">Confused words</button></div>' +
    '<label class="f" style="margin-top:16px" for="lq"><span class="eyebrow">Search lessons</span><input id="lq" type="search" placeholder="e.g. comma, tense, articles"></label><div class="cols">';
  SW.lessonGroups.forEach(function (g) {
    var ls = SW.lessons.filter(function (l) { return l.group === g.id; });
    var dn = ls.filter(function (l) { return S.done[l.id]; }).length;
    html += '<div class="section" data-grp><div class="head"><div><h2>' + g.name + '</h2><p class="muted small">' + g.blurb + '</p></div><span class="pill ' + (dn === ls.length ? "ok" : "warn") + '">' + dn + "/" + ls.length + "</span></div>" +
      '<div class="card">' + ls.map(function (l) {
        return '<button class="listrow" data-go="lesson~' + l.id + '" data-q="' + esc((l.title + " " + l.summary).toLowerCase()) + '"><span class="check' + (S.done[l.id] ? " on" : "") + '">' + (S.done[l.id] ? ico("ok") : "") + '</span><span class="grow"><span class="t">' + esc(l.title) + '</span><br><span class="d">' + esc(l.summary) + "</span></span></button>";
      }).join("") + "</div></div>";
  });
  m.innerHTML = html + "</div>";
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
    '<div class="split"><div class="col-main"><p style="font-size:1.08rem">' + l.summary + "</p>" +
    '<div class="card"><ul class="points">' + l.points.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul></div>";
  if (l.examples && l.examples.length) {
    html += '<div class="section"><h2>Examples</h2>' + l.examples.map(function (e) {
      return '<div class="fix">' + (e[0] ? '<span class="bad">' + esc(e[0]) + "</span>" : "") + '<div class="row" style="flex-wrap:nowrap"><span class="good" style="flex:1;min-width:0">' + esc(e[1]) + '</span><button class="icon-btn" aria-label="Listen" data-say="' + esc(e[1]) + '">' + ico("play") + "</button></div></div>";
    }).join("") + "</div>";
  }
  if (l.builder) html += '<div class="section"><h2>Build your own sentence</h2><div id="bld"></div></div>';
  html += '</div><div class="col-side"><div class="section"><h2>Check yourself</h2><div id="lq" class="stack"></div></div>' +
    '<div class="section card"><h3>Ask the coach about this topic</h3><p class="muted small">Get more examples, or check your own sentence.</p>' +
    '<textarea id="askT" rows="2" placeholder="e.g. Give me 5 more examples, or: Is this correct: &quot;I am working here since 2020&quot;?"></textarea>' +
    '<div class="row" style="margin-top:8px"><button class="btn" id="askB">' + ico("spark") + 'Ask</button></div><div id="askO" class="ai-out" style="margin-top:10px"></div></div>' +
    '<div class="row" style="margin-top:22px"><button class="btn primary" id="doneB">' + (S.done[l.id] ? "Completed ✓" : "Mark as complete") + "</button>" + (next ? '<button class="btn" data-go="lesson~' + next.id + '">Next: ' + esc(next.title) + "</button>" : "") + "</div></div></div>";
  m.innerHTML = html;
  if (l.builder) builder($("#bld"));
  renderQuiz($("#lq"), l.quiz, false);
  $("#doneB").onclick = function () { if (!S.done[l.id]) { S.done[l.id] = Date.now(); addXP(20, "lesson complete"); } this.textContent = "Completed ✓"; };
  aiBox($("#askB"), $("#askT"), $("#askO"), function (q) {
    return [{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " The learner is studying the grammar topic: " + l.title + ". Explain with short examples. If they give a sentence, correct it and explain the rule in one line." }, { role: "user", content: q }];
  }, ["grammar", "Grammar: " + l.title]);
};

function aiBox(btn, input, out, build, logAs) {
  btn.onclick = function () {
    var q = input.value.trim(); if (!q) { input.focus(); return; }
    out.innerHTML = '<p class="muted">Thinking…</p>'; btn.disabled = true;
    aiCall(build(q)).then(function (r) { out.innerHTML = mdLite(r); if (logAs) logHistory(logAs[0], logAs[1], q, r); }).catch(function (e) { out.innerHTML = '<div class="notice">' + esc(e.message) + "</div>"; }).then(function () { btn.disabled = false; });
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
        bump("qt"); if (ok) { bump("qr"); addXP(5); } else { logHistory("quiz", "Quiz mistake", q.q + "\nYour answer: " + q.o[j], "Correct: " + q.o[q.a] + ". " + q.why); }
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
    '<div class="grid">' + tile("impromptu", "Impromptu trainer", "Random topic → think 15 s → speak 60 s → feedback.") + tile("think", "Thinking frameworks", "PREP, STAR, SCQA and more: structure before words.") + tile("drills", "Brain drills", "Rapid categories, describe-it, because-chains.") + tile("coach", "Role-play with AI", "Talk through any situation, live.") + '</div><div class="cols">';
  SW.scenarioGroups.forEach(function (g) {
    var ss = SW.scenarios.filter(function (s) { return s.group === g.id; });
    html += '<div class="section"><h2>' + g.name + '</h2><div class="card">' + ss.map(function (s) {
      var n = S.sessions.filter(function (x) { return x.sc === s.id; }).length;
      return '<button class="listrow" data-go="scene~' + s.id + '"><span class="grow"><span class="t">' + esc(s.title) + '</span><br><span class="d">' + esc(s.goal) + "</span></span>" + (n ? '<span class="pill ok">' + n + "×</span>" : "") + "</button>";
    }).join("") + "</div></div>";
  });
  m.innerHTML = html + "</div>";
};

VIEWS.scene = function (m, id) {
  var s = SW.scenarios.filter(function (x) { return x.id === id; })[0];
  if (!s) return VIEWS.speak(m);
  var fw = SW.frameworks.filter(function (f) { return f.id === s.framework; })[0];
  var g = SW.scenarioGroups.filter(function (x) { return x.id === s.group; })[0];
  m.innerHTML = top(esc(s.title), { back: "speak", eyebrow: g.name }) +
    '<div class="split"><div class="col-main"><p style="font-size:1.08rem">' + esc(s.goal) + "</p>" +
    '<div class="card"><h3 style="margin-bottom:10px">How to do it</h3><ol class="steps">' + s.steps.map(function (x) { return "<li><span>" + esc(x) + "</span></li>"; }).join("") + "</ol></div>" +
    '<div class="card"><div class="row" style="justify-content:space-between"><h3>Structure: ' + fw.name + '</h3><span class="muted small">' + esc(fw.use) + '</span></div><div class="fw" style="margin-top:10px">' + fw.steps.map(function (x) { return "<div><b>" + x[0] + "</b><small>" + esc(x[1]) + "</small></div>"; }).join("") + "</div></div>" +
    '<div class="card"><h3>Phrase bank</h3><p class="muted small">Tap to hear. Say each one aloud three times until it feels automatic.</p>' + s.phrases.map(function (p) { return '<div class="phrase"><p>' + esc(p) + '</p><button class="icon-btn" aria-label="Listen" data-say="' + esc(p) + '">' + ico("play") + "</button></div>"; }).join("") + "</div>" +
    '<div class="card"><h3>Tips</h3><ul class="points" style="margin-top:8px">' + s.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
    '</div><div class="col-side stick"><div class="section"><div class="head"><h2>Your turn</h2><button class="btn primary sm" data-go="coach~' + s.id + '">' + ico("coach") + "Role-play this</button></div>" +
    '<p class="muted small">Prompt: ' + esc(s.script[0]) + "</p><div id='rec'></div></div></div></div>";
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
    logHistory("speaking", "Speaking check · score " + r.score, t, r.feedback.map(function (f) { return "• " + f[1]; }).join("\n"));
    addXP(15, "speaking session");
  };
  $("#aiB", el).onclick = function () {
    var t = tx.value.trim(); if (!t) { toast("Speak or type something first."); return; }
    var out = document.createElement("div"); out.className = "card ai-out"; out.innerHTML = '<p class="muted">Getting feedback…</p>'; $("#res", el).appendChild(out);
    var sys = COACH_BASE.replace("{level}", S.settings.level) + " Evaluate a SPOKEN answer (transcribed by speech recognition, so ignore missing punctuation and minor recognition errors). Give: 1) a score out of 10 for clarity, structure, grammar and confidence; 2) the 3 most important grammar or word-choice corrections as 'You said → Better'; 3) one structure tip" + (opt.framework ? " using the " + opt.framework.name + " framework (" + opt.framework.steps.map(function (x) { return x[0]; }).join(", ") + ")" : "") + "; 4) a polished model answer of similar length in natural spoken English. Use short bullet points.";
    aiCall([{ role: "system", content: sys }, { role: "user", content: "Task: " + (opt.prompt || "free speaking") + (secs ? "\nDuration: " + Math.round(secs) + " seconds" : "") + "\n\nMy answer:\n" + t }])
      .then(function (r) { out.innerHTML = mdLite(r) + '<div class="row" style="margin-top:8px"><button class="btn sm" data-say="' + esc(r.split(/model answer/i)[1] || r) + '">' + ico("play") + "Hear it</button></div>"; logHistory("speaking", "AI speaking feedback", t, r); addXP(5); })
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
  /* migrate the old "work in progress" link to the draft↔note link */
  if (!S.curNote && S.wip && S.wip.noteId && S.notes.some(function (x) { return x.id === S.wip.noteId; })) { S.curNote = S.wip.noteId; S.wip = { orig: "", fixes: [], t: 0 }; save(); }
  /* a draft that came back from sync without its link: find its note instead of making a new one */
  if (!curNote() && S.draft && S.draft.trim()) {
    var dn = nrm(S.draft), match = S.notes.filter(function (x) { return nrm(x.fixed) === dn || nrm(x.orig) === dn; })[0] ||
      S.notes.slice().sort(function (a, b) { return b.u - a.u; }).filter(function (x) { var f = nrm(x.fixed); return f.length > 20 && (dn.indexOf(f.slice(0, 60)) === 0 || f.indexOf(dn.slice(0, 60)) === 0); })[0];
    if (match) { S.curNote = match.id; save(); }
  }
  var n0 = curNote();
  if (n0 && S.draft && S.draft !== n0.fixed && (S.draftT || 0) > (n0.u || 0)) docUpdate(n0, S.draft);
  var draft = n0 ? n0.fixed : (S.draft || ""), dT = null;
  m.innerHTML = top("Writing studio", { eyebrow: "Write" }) +
    '<div class="row"><button class="btn" data-go="notes">My notes' + (S.notes.length ? " (" + S.notes.length + ")" : "") + '</button><button class="btn" data-go="words">Confused words</button><a class="btn" href="#guides">Writing guides</a></div>' +
    '<div class="split"><div class="col-main"><div class="section card stack"><div class="row" style="justify-content:space-between"><div class="stack doc-head" style="gap:2px"><label class="eyebrow" for="docTitle">Draft title</label><input id="docTitle" class="doc-title" type="text" placeholder="Untitled draft (type a title)"><span class="muted small" id="docLink"></span></div><div class="row tight"><button class="btn sm" id="newB">+ New draft</button><select id="tpl" style="width:auto"><option value="">Start from a template…</option>' + SW.templates.map(function (t) { return '<option value="' + t.id + '">' + t.name + "</option>"; }).join("") + "</select></div></div>" +
    '<div id="docTags"></div>' +
    '<textarea id="ed" class="editor" rows="10" placeholder="Write or paste your email, message, speech or paragraph here. It is saved to My notes as you type. Select text and press Ctrl+K (or right-click) to add a link.">' + esc(draft) + "</textarea>" +
    '<div id="docLinks"></div><div id="docAtt"></div>' +
    '<div class="selbar" id="selbar" hidden><span class="muted small">Selected</span><span class="selq" id="selq"></span><button class="btn primary sm" id="selGo">' + ico("spark") + 'Analyse</button></div>' +
    '<div class="row"><button class="btn" id="chk" title="Instant grammar and style check. Works offline.">' + ico("ok") + 'Quick check</button><button class="btn" id="anB" title="Select a sentence, or place the cursor in one">' + ico("spark") + 'Analyse sentence</button><button class="btn" id="fixAll" title="AI corrects the whole draft; your original stays in the note">' + ico("spark") + 'Correct all</button><button class="btn" id="cpy">' + ico("copy") + 'Copy</button><button class="btn" data-say-ed>' + ico("play") + 'Read aloud</button><button class="btn" id="noteB">' + ico("note") + "Open note</button></div></div>" +
    '<div id="anMount"></div><div id="chkOut"></div></div><div class="col-side">' +
    '<div class="section card stack"><h2>AI rewrite</h2><p class="muted small">Pick what you want. Your draft stays as it is; the result appears below.</p><div class="row" id="aiOps">' +
    [["fix", "Fix grammar & explain"], ["formal", "More formal"], ["friendly", "More friendly"], ["short", "Shorter"], ["confident", "More confident"], ["speech", "Turn into a speech"]].map(function (o) { return '<button class="chip" data-op="' + o[0] + '">' + o[1] + "</button>"; }).join("") +
    '</div><div id="aiW" class="ai-out"></div></div>' +
    '<div class="section" id="guides"><h2>Writing guides</h2><div class="card guide-list">' + SW.guides.map(function (g) { return '<button class="listrow" data-go="guide~' + g.id + '"><span class="grow"><span class="t">' + esc(g.title) + '</span><br><span class="d">' + esc(g.kind) + "</span></span></button>"; }).join("") + "</div></div></div></div>";
  var ed = $("#ed");
  /* The draft and its note are one document: every edit updates the note */
  function ensureNote() {
    commit(); var n = curNote();
    if (!n && ed.value.trim()) { n = saveNote({ orig: ed.value, fixed: ed.value, fixes: [], source: "Writing studio" }, true); S.curNote = n.id; save(); }
    return n;
  }
  function updDoc() {
    var n = curNote(), l = $("#docLink"), nb = $("#noteB"), ti = $("#docTitle");
    if (ti && document.activeElement !== ti) { ti.value = n && n.titleSet ? n.title : ""; ti.placeholder = n ? n.title + "  (auto title, type to rename)" : "Untitled draft (type a title)"; }
    var tg = $("#docTags"); if (tg) { tg.innerHTML = tagEditorHTML(n); bindTagEditor($(".tagbox", tg), ensureNote, updDoc); }
    var lk = $("#docLinks"); if (lk) lk.innerHTML = linksHTML(n, ed.value);
    var da = $("#docAtt"); if (da && !da._busy) da.innerHTML = n && (n.attachments || []).length ? '<div class="links-row"><span class="eyebrow">Attachments</span>' + n.attachments.map(function (x) { return '<span class="linkchip"><a href="' + esc(x.link) + '" target="_blank" rel="noopener noreferrer">' + esc(x.name) + " ↗</a></span>"; }).join("") + "</div>" : '<p class="muted small">Drop files or a folder on this box to attach them (saved to Google Drive).</p>';
    if (l) l.innerHTML = n ? "Saved to note <b>" + esc(n.title) + "</b> · " + (n.fixes || []).filter(function (f) { return f.r; }).length + " fixes" : "New draft · saved to My notes once you write a few words";
    if (nb) nb.disabled = !n;
  }
  function commit() {
    clearTimeout(dT);
    var v = ed.value; S.draft = v; S.draftT = Date.now();
    var n = curNote();
    if (v.trim()) {
      if (n) docUpdate(n, v);
      else if (wordCount(v) >= 3) { n = saveNote({ orig: v, fixed: v, fixes: [], source: "Writing studio" }, true); S.curNote = n.id; }
    }
    save(); updDoc();
  }
  ed.oninput = function () { clearTimeout(dT); dT = setTimeout(commit, 700); };
  cleanup.push(function () { if (dT) commit(); });
  window.addEventListener("pagehide", commit); cleanup.push(function () { window.removeEventListener("pagehide", commit); });
  /* record an AI change so "your version" can always be rebuilt from the draft */
  function addFix(before, after, i, from, to, why, topic, big) {
    var n = curNote(), first = false;
    if (!n) { n = saveNote({ orig: before, fixed: before, fixes: [], source: "Writing studio" }, true); S.curNote = n.id; }
    else docUpdate(n, before);
    first = !(n.fixes || []).some(function (f) { return f.r; });
    n.fixes = n.fixes || [];
    n.fixes.push({ from: from, to: to, why: why || "", topic: topic || "", r: true, big: !!big, at: i, pre: after.slice(Math.max(0, i - 24), i), post: after.slice(i + to.length, i + to.length + 24) });
    docUpdate(n, after);
    S.draft = after; S.draftT = Date.now(); save(); updDoc();
    if (first) toast("Fix saved to this draft's note");
  }
  $("#noteB").onclick = function () { commit(); var n = curNote(); if (n) go("note~" + n.id); };
  $("#newB").onclick = function () {
    commit(); var had = curNote();
    S.curNote = ""; S.draft = ""; S.draftT = Date.now(); ed.value = ""; save(); updDoc();
    if ($("#anMount")) $("#anMount").innerHTML = ""; if ($("#chkOut")) $("#chkOut").innerHTML = "";
    toast(had ? "New draft started. The previous one is in My notes." : "New draft started"); ed.focus();
  };
  $("#fixAll").onclick = function () {
    commit();
    var cur = ed.value, btn = this;
    if (!cur.trim()) { toast("Write something first."); return; }
    if (!aiReady()) { toast(S.settings.apiKey ? "Correct all needs a connection. Your draft is saved; try again online." : "Add your OpenAI key in Settings to use Correct all."); return; }
    btn.disabled = true; btn.textContent = "Correcting…";
    correctWithAI(cur).then(function (j) {
      var text = ed.value, count = 0;
      (j.fixes || []).forEach(function (f) {
        if (!f.from || f.from === f.to) return;
        var i = text.indexOf(f.from); if (i < 0) return;
        var nt = text.slice(0, i) + (f.to || "") + text.slice(i + f.from.length);
        addFix(text, nt, i, f.from, f.to || "", f.why, f.topic); text = nt; count++;
      });
      if (j.corrected && nrm(text) !== nrm(j.corrected)) { addFix(text, j.corrected, 0, text, j.corrected, "Other AI corrections", "", true); text = j.corrected; count++; }
      ed.value = text; S.draft = text; save(); updDoc();
      toast(count ? count + " correction" + (count > 1 ? "s" : "") + " applied. Your original is kept in the note." : "No mistakes found.");
      logHistory("writing", "Correct all · " + count + " fixes", cur, text);
    }).catch(function (e) { toast(e.message); }).then(function () { btn.disabled = false; btn.innerHTML = ico("spark") + "Correct all"; });
  };
  $("#tpl").onchange = function () {
    var t = SW.templates.filter(function (x) { return x.id === this.value; }, this)[0]; this.value = "";
    if (!t) return;
    commit(); S.curNote = ""; ed.value = t.text; commit(); toast("New draft from template");
  };
  updDoc();
  bindAttach(ed.closest(".card"), ensureNote, function (m, html) { var da = $("#docAtt"); if (!da) return; da._busy = !/Uploaded|failed|offline/i.test(m); da.innerHTML = '<p class="small">' + (html ? m : esc(m)) + "</p>"; }, function () { var da = $("#docAtt"); if (da) da._busy = false; setTimeout(updDoc, 1500); });
  $("#docTitle").onchange = function () {
    var v = this.value.trim(), n = ensureNote();
    if (!n) { toast("Write something first, then add a title."); this.value = ""; return; }
    n.title = v || noteTitle(n.fixed); n.titleSet = !!v; n.u = Date.now(); save(); this.blur(); updDoc(); toast(v ? "Title saved" : "Using the automatic title");
  };
  $("#docTitle").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } };
  $("#docLinks").onclick = function (e) { var b = e.target.closest("[data-unlink]"); if (b) { unlink(curNote(), b.getAttribute("data-unlink")); updDoc(); toast("Link removed"); } };
  /* links: select text, then Ctrl+K / ⌘K or right-click */
  var lastXY = null;
  function selText() { return ed.value.slice(ed.selectionStart, ed.selectionEnd).trim(); }
  function linkMenuAt(x, y, extra) {
    var t = selText();
    if (!t) { toast("Select a word or sentence first, then press Ctrl+K."); return; }
    openLinkMenu({ x: x, y: y, text: t, note: function (create) { return create ? ensureNote() : curNote(); }, extra: extra, onDone: updDoc });
  }
  ed.addEventListener("mousemove", function (e) { lastXY = [e.clientX, e.clientY]; });
  ed.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      var r = ed.getBoundingClientRect(); linkMenuAt(lastXY ? lastXY[0] : r.left + 24, lastXY ? lastXY[1] + 12 : r.top + 48);
    }
  });
  ed.addEventListener("contextmenu", function (e) {
    if (!selText()) return;
    e.preventDefault();
    linkMenuAt(e.clientX, e.clientY, [["Analyse sentence", function () { openAn(); }], ["Copy", function () { var t = selText(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast("Copied"); }).catch(function () { toast("Use your keyboard to copy."); }); }]]);
  });
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
    logHistory("writing", "Writing check · " + r.issues.length + " issue" + (r.issues.length === 1 ? "" : "s"), t, r.issues.length ? r.issues.map(function (i) { return "• " + i[0] + ": " + i[1]; }).join("\n") : "No issues found.");
    bump("writes"); addXP(10, "writing check");
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
          logHistory("writing", "AI rewrite · " + b.textContent, t, r);
          $("#useR").onclick = function () { commit(); var before = ed.value, nv = r.split(/\n\s*\n(?=[^\n]*(→|changed|removed|word count))/i)[0].trim(); addFix(before, nv, 0, before, nv, "AI rewrite: " + b.textContent, "", true); ed.value = nv; toast("Draft replaced. Your original is kept in the note."); };
          addXP(5);
        }).catch(function (e) { out.innerHTML = '<div class="notice">' + esc(e.message) + "</div>"; });
    };
  });
  /* sentence analysis: select text (or put the cursor in a sentence) */
  var helper = { S: function () { return S; }, ai: aiCall, aiReady: aiReady, toast: toast, log: logHistory, check: checkWriting,
    replace: function (find, rep, within, why, topic) {
      var v = ed.value, base = within ? v.indexOf(within) : 0, i = base < 0 ? v.indexOf(find) : v.indexOf(find, base);
      if (i < 0) return false;
      commit(); v = ed.value; i = (within && v.indexOf(within) > -1) ? v.indexOf(find, v.indexOf(within)) : v.indexOf(find); if (i < 0) return false;
      var nv = v.slice(0, i) + rep + v.slice(i + find.length);
      addFix(v, nv, i, find, rep, why, topic); ed.value = nv; return true;
    }, saveNote: function () { commit(); var n = curNote(); if (n) go("note~" + n.id); else toast("Write a few words first."); }, openNote: function () { commit(); var n = curNote(); if (n) go("note~" + n.id); } };
  function selSentence() { return SW.sentenceAt(ed.value, ed.selectionStart, ed.selectionEnd); }
  function selChange() {
    var bar = $("#selbar"); if (!bar) return;
    var a = ed.selectionStart, b = ed.selectionEnd, txt = ed.value.slice(a, b).trim();
    if (txt.split(/\s+/).length >= 2) { bar.hidden = false; var s2 = selSentence(); $("#selq").textContent = "“" + (s2.length > 70 ? s2.slice(0, 70) + "…" : s2) + "”"; }
    else bar.hidden = true;
  }
  function openAn() {
    var s2 = selSentence();
    if (!s2 || s2.split(/\s+/).length < 2) { toast("Select a sentence, or tap inside one, then tap Analyse."); ed.focus(); return; }
    SW.openAnalysis(s2, helper, $("#anMount"));
  }
  document.addEventListener("selectionchange", selChange); cleanup.push(function () { document.removeEventListener("selectionchange", selChange); });
  ed.addEventListener("select", selChange); ed.addEventListener("keyup", selChange); ed.addEventListener("mouseup", selChange); ed.addEventListener("touchend", function () { setTimeout(selChange, 50); });
  $("#selGo").addEventListener("mousedown", function (e) { e.preventDefault(); });
  $("#selGo").onclick = openAn; $("#anB").onclick = openAn;
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
  if (tpl) $("#useTpl").onclick = function () { S.draft = SW.templates.filter(function (t) { return t.id === tpl; })[0].text; S.draftT = Date.now(); save(); go("write"); };
  aiBox($("#gb"), $("#gt"), $("#go"), function (q) { return [{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " The learner practised: " + g.title + ". Steps: " + g.steps.join(" | ") + ". Assess how well they followed the steps, correct language errors, and give an improved version." }, { role: "user", content: q }]; }, ["writing", "Guide practice: " + g.title]);
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
  function persist() { S.chats[key] = hist.slice(-40); S.chatsT[key] = Date.now(); save(); }
  function logTip(user, reply) { var m = reply.split(/\nTip:/)[1]; if (m) logHistory("coach", "Coach tip · " + (scene ? scene.title : (MODES.filter(function (x) { return x[0] === mode; })[0] || MODES[0])[1]), user, "Tip:" + m); }
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
      hist.push({ role: "assistant", content: reply }); bubble("assistant", reply); logTip(text, reply); persist(); addXP(2);
      if ($("#spk").checked) say(lines[scriptIdx]);
      return;
    }
    var wait = document.createElement("div"); wait.className = "msg sys"; wait.textContent = "…"; chat.appendChild(wait);
    aiCall([{ role: "system", content: sysPrompt() }].concat(hist.slice(-20))).then(function (r) {
      wait.remove(); hist.push({ role: "assistant", content: r }); bubble("assistant", r); logTip(text, r); persist(); addXP(2);
      if ($("#spk").checked) say(r.split(/\nTip:/)[0]);
    }).catch(function (e) { wait.remove(); bubble("system", e.message); });
  }
  $("#cSend").onclick = function () { send(inp.value); };
  inp.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inp.value); } };
  $("#spk").onchange = function () { S.settings.speakReplies = this.checked; save(); };
  $("#cReset").onclick = function () { S.chats[key] = []; S.chatsT[key] = Date.now(); save(); route(); };
  $$("[data-m]").forEach(function (b) { b.onclick = function () { S._mode = b.getAttribute("data-m"); save(); route(); }; });
  $("#cEval").onclick = function () {
    var mine = hist.filter(function (h) { return h.role === "user"; }).map(function (h) { return h.content; }).join("\n");
    if (!mine) { toast("Say something first."); return; }
    if (!aiReady()) { var r = analyzeSpeech(mine, 0); bubble("system", "Offline check: " + r.feedback.map(function (f) { return f[1]; }).join(" ")); return; }
    bubble("system", "Reviewing your messages…");
    aiCall([{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + " Review all of the learner's messages from a conversation. Give: overall level estimate (CEFR), 3 strengths, the 5 most useful corrections (You said → Better), and 5 natural phrases they could use next time in this situation." }, { role: "user", content: mine }])
      .then(function (r) { bubble("assistant", r); logHistory("coach", "Conversation review", mine, r); addXP(10, "conversation review"); }).catch(function (e) { bubble("system", e.message); });
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

/* ---------- Notes: one note per draft, sentence by sentence ---------- */
function tokens(s) { return String(s || "").match(/[A-Za-z0-9'’]+|\s+|[^A-Za-z0-9'’\s]/g) || []; }
function diffOps(a, b) {
  var A = tokens(a), B = tokens(b), n = A.length, m = B.length, ops = [];
  var norm = function (t) { return /^\s+$/.test(t) ? (t.indexOf("\n") > -1 ? "\n" : " ") : t; };
  if (n * m > 4000000) { ops.push({ t: "del", v: a }); ops.push({ t: "ins", v: b }); return ops; }
  var L = []; for (var i = 0; i <= n; i++) L.push(new Uint16Array(m + 1));
  for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = norm(A[i]) === norm(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  i = 0; j = 0;
  while (i < n && j < m) {
    if (norm(A[i]) === norm(B[j])) { ops.push({ t: "eq", v: B[j] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) ops.push({ t: "del", v: A[i++] });
    else ops.push({ t: "ins", v: B[j++] });
  }
  while (i < n) ops.push({ t: "del", v: A[i++] }); while (j < m) ops.push({ t: "ins", v: B[j++] });
  return ops;
}
var ABBR = ["no", "nos", "mr", "mrs", "ms", "dr", "sh", "smt", "st", "vs", "etc", "e.g", "i.e", "approx", "dept", "govt", "ref", "fig", "sr", "jr"];
/* Split an original/corrected pair into aligned sentences */
function sentencePairs(orig, fixed) {
  var ops = diffOps(orig, fixed), rows = [], r = null, da = "", db = "", lastWord = "";
  function start() { r = { a: "", b: "", aH: "", bH: "", changed: false }; }
  function flush() {
    if (da) { if (da.trim()) { r.aH += '<del class="nm-del">' + esc(da.trim()) + "</del>" + (/\s$/.test(da) ? " " : ""); r.changed = true; } else r.aH += esc(da); r.a += da; da = ""; }
    if (db) { if (db.trim()) { r.bH += '<ins class="nm-ins">' + esc(db.trim()) + "</ins>" + (/\s$/.test(db) ? " " : ""); r.changed = true; } else r.bH += esc(db); r.b += db; db = ""; }
  }
  function close() { flush(); if (r.a.trim() || r.b.trim()) rows.push(r); start(); }
  start();
  for (var k = 0; k < ops.length; k++) {
    var o = ops[k];
    if (o.t === "del") { da += o.v; continue; }
    if (o.t === "ins") { db += o.v; continue; }
    flush();
    if (/^\s+$/.test(o.v)) {
      if (o.v.indexOf("\n") > -1) { close(); continue; }
      var prev = r.b.replace(/\s+$/, "");
      if (/[.!?]["')]?$/.test(prev) && ABBR.indexOf(lastWord.toLowerCase()) < 0 && !/^[A-Z]$/.test(lastWord)) { close(); continue; }
    }
    r.a += o.v; r.b += o.v; r.aH += esc(o.v); r.bH += esc(o.v);
    if (/^[A-Za-z0-9'’]+$/.test(o.v)) lastWord = o.v;
  }
  close();
  return rows.map(function (x) { x.a = x.a.trim(); x.b = x.b.trim(); return x; });
}
function noteTags(n) {
  var t = {};
  (n.fixes || []).forEach(function (f) { if (f.topic && !f.big) t[f.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")] = 1; });
  if (/^(dear|sir|madam|hi|hello|respected)\b|subject\s*:/im.test(n.fixed || "")) t.email = 1;
  return Object.keys(t).filter(Boolean).slice(0, 4);
}
function noteTitle(text) {
  var subj = String(text).match(/subject\s*:\s*(.+)/i);
  var parts = String(text).split(/(?<=[.!?])\s+|\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
  var skip = /^(good (morning|afternoon|evening)|hi\b|hello|dear|respected|sir|madam|greetings|thank(s| you)|regards|best|warm)/i;
  var first = subj ? subj[1] : (parts.filter(function (x) { return !skip.test(x) && x.split(/\s+/).length > 2; })[0] || parts[0]);
  first = (first || text).trim();
  return first.length > 60 ? first.slice(0, 58).trim() + "…" : first;
}
/* create or update a note */
function saveNote(n, quiet) {
  if (!n.id) delete n.id;
  var t = Date.now(), note = n.id && S.notes.filter(function (x) { return x.id === n.id; })[0];
  if (note) { Object.assign(note, n, { u: t }); if (!note.titleSet) note.title = noteTitle(note.fixed || note.orig); }
  else {
    note = Object.assign({ id: "n" + t.toString(36) + Math.random().toString(36).slice(2, 5), t: t, u: t, title: "", titleSet: false, orig: "", fixed: "", fixes: [], source: "", revised: 0, lastRev: 0, pending: false }, n);
    if (!note.title) note.title = noteTitle(note.fixed || note.orig);
    S.notes.push(note); if (S.notes.length > 500) S.notes = S.notes.slice(-500);
    if (!quiet) toast("Saved to My notes");
  }
  save();
  return note;
}
/* The writer's own version = current draft with every AI change undone (newest first) */
function revertFixes(text, fixes) {
  for (var i = fixes.length - 1; i >= 0; i--) {
    var f = fixes[i]; if (!f.r || typeof f.to !== "string") continue;
    var at = -1;
    if (f.pre != null) { var ctx = (f.pre || "") + f.to + (f.post || ""), k0 = text.indexOf(ctx); if (k0 > -1) at = k0 + (f.pre || "").length; }
    if (at < 0 && f.to) { var best = -1, dist = 1e9, k = text.indexOf(f.to); while (k > -1) { var d = Math.abs(k - (f.at || 0)); if (d < dist) { dist = d; best = k; } k = text.indexOf(f.to, k + 1); } at = best; }
    if (at < 0) continue;
    text = text.slice(0, at) + (f.from || "") + text.slice(at + f.to.length);
  }
  return { text: text };
}
function curNote() { return (S.curNote && S.notes.filter(function (x) { return x.id === S.curNote; })[0]) || null; }
function docUpdate(n, cur) {
  n.fixed = cur; n.orig = revertFixes(cur, n.fixes || []).text; n.u = Date.now();
  if (!n.titleSet) n.title = noteTitle(cur);
}
/* Merge note `small` into note `big` (same draft). Keeps every fix and restores the writer's own wording. */
function nrm(x) { return String(x || "").replace(/\s+/g, " ").trim(); }
function mergeNotes(big, small) {
  if (big === small) return big;
  var bo = big.orig, bf = big.fixed;
  if (nrm(bf).indexOf(nrm(small.fixed)) > -1 || nrm(bf).indexOf(nrm(small.orig)) > -1) {
    /* the small note is part of this draft: put its uncorrected wording back into "your version" */
    if (nrm(small.orig) !== nrm(small.fixed) && nrm(bo).indexOf(nrm(small.fixed)) > -1 && nrm(bo).indexOf(nrm(small.orig)) < 0) {
      var at = bo.indexOf(small.fixed);
      if (at > -1) bo = bo.slice(0, at) + small.orig + bo.slice(at + small.fixed.length);
      else bo = nrm(bo).replace(nrm(small.fixed), nrm(small.orig));
    }
  } else {
    /* different text: append it */
    bo = bo + "\n\n" + small.orig; bf = bf + "\n\n" + small.fixed;
  }
  var seen = {}, fixes = [];
  (big.fixes || []).concat(small.fixes || []).forEach(function (f) { var k = (f.from || "") + "|" + (f.to || "") + "|" + (f.why || ""); if (!seen[k]) { seen[k] = 1; fixes.push(f); } });
  big.orig = bo; big.fixed = bf; big.fixes = fixes; big.t = Math.min(big.t, small.t); big.u = Date.now();
  big.revised = Math.max(big.revised || 0, small.revised || 0); big.lastRev = Math.max(big.lastRev || 0, small.lastRev || 0);
  big.pending = !!(big.pending && small.pending);
  if (!big.titleSet) big.title = noteTitle(big.fixed);
  S.notes = S.notes.filter(function (x) { return x.id !== small.id; }); S.notesDel[small.id] = Date.now();
  if (S.curNote === small.id) S.curNote = big.id;
  return big;
}
/* Notes whose text sits inside another note's draft belong to that draft */
function autoMergeNotes() {
  var changed = false, again = true;
  while (again) {
    again = false;
    var list = S.notes.slice().sort(function (a, b) { return nrm(b.fixed).length - nrm(a.fixed).length; });
    outer: for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
      var big = list[i], sm = list[j], sf = nrm(sm.fixed), so = nrm(sm.orig);
      if (sf.length < 15 || sm.id === S.curNote) continue;
      if (nrm(big.fixed).indexOf(sf) > -1 || nrm(big.orig).indexOf(so) > -1 || nrm(big.fixed).indexOf(so) > -1 || nrm(big.orig).indexOf(sf) > -1) {
        mergeNotes(big, sm); changed = again = true; break outer;
      }
    }
  }
  if (changed) save();
  return changed;
}

function correctWithAI(text) {
  return aiCall([{ role: "system", content: COACH_BASE.replace("{level}", S.settings.level) + ' Correct the learner\'s English. Fix grammar, spelling, punctuation and unnatural wording; keep their meaning, tone and layout (keep every line break). Reply with ONLY JSON: {"corrected": string, "fixes": [{"from": string (exact text from the original), "to": string, "why": string (one short line), "topic": string (e.g. Articles, Verb Tenses, Prepositions)}]}. If nothing needs fixing, return the text unchanged and an empty fixes list.' }, { role: "user", content: text }], { json: true })
    .then(function (r) { var j = null; try { j = JSON.parse(r); } catch (e) { var mm = r.match(/\{[\s\S]*\}/); if (mm) try { j = JSON.parse(mm[0]); } catch (e2) {} } if (!j || typeof j.corrected !== "string") throw new Error("Couldn't read the correction. Try again."); return j; });
}
function relDate(t) {
  var d = new Date(t), now = new Date(), dd = Math.round((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
  if (dd === 0) return "Today"; if (dd === 1) return "Yesterday"; if (dd < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}
function wordCount(s) { return (String(s).match(/\S+/g) || []).length; }

/* ---------- Google Drive: note attachments and Google Docs ---------- */
function qEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
function dchild(name, parent) {
  var q = "name='" + qEsc(name) + "' and mimeType='" + FOLDER_MIME + "' and trashed=false and '" + parent + "' in parents";
  return gfetch(DAPI + "?spaces=drive&fields=files(id)&q=" + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (j) {
    if (j.files && j.files[0]) return j.files[0].id;
    return gfetch(DAPI + "?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name, mimeType: FOLDER_MIME, parents: [parent] }) }).then(function (r) { return r.json(); }).then(function (x) { return x.id; });
  });
}
function safeName(s) { return String(s || "Untitled").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "Untitled"; }
function noteFolder(n) {
  return dfolder().then(function (root) { return dchild("Attachments", root); }).then(function (att) {
    return dchild(safeName(n.title) + " · " + n.id.slice(-5), att);
  }).then(function (id) { n.folderId = id; return id; });
}
function dupload(file, parent, onProgress) {
  var meta = { name: file.name, parents: [parent] };
  return gfetch(UAPI + "?uploadType=resumable&fields=id,name,mimeType,size,webViewLink", {
    method: "POST", headers: { "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": file.type || "application/octet-stream" }, body: JSON.stringify(meta)
  }).then(function (r) {
    var loc = r.headers.get("Location");
    if (!loc) throw new Error("Google Drive didn't accept the upload. Try again.");
    return new Promise(function (res, rej) {
      var x = new XMLHttpRequest(); x.open("PUT", loc);
      x.upload.onprogress = function (e) { if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total); };
      x.onload = function () { if (x.status >= 200 && x.status < 300) { try { res(JSON.parse(x.responseText)); } catch (e) { rej(new Error("Upload finished but Drive's reply couldn't be read.")); } } else rej(new Error("Upload of " + file.name + " failed (" + x.status + ").")); };
      x.onerror = function () { rej(new Error("Upload of " + file.name + " failed. Check your connection.")); };
      x.send(file);
    });
  });
}
/* Collect files from a drop, keeping folder structure */
function collectDropped(dt) {
  var items = dt.items ? Array.prototype.slice.call(dt.items) : [];
  var entries = items.map(function (it) { return it.webkitGetAsEntry && it.webkitGetAsEntry(); }).filter(Boolean);
  if (!entries.length) return Promise.resolve(Array.prototype.slice.call(dt.files || []).map(function (f) { return { file: f, path: [] }; }));
  var out = [];
  function walk(entry, path) {
    if (entry.isFile) return new Promise(function (res) { entry.file(function (f) { out.push({ file: f, path: path }); res(); }, function () { res(); }); });
    if (entry.isDirectory) {
      var reader = entry.createReader(), all = [];
      return new Promise(function (res) {
        (function more() { reader.readEntries(function (batch) { if (!batch.length) { Promise.all(all.map(function (e) { return walk(e, path.concat(entry.name)); })).then(res); } else { all = all.concat(Array.prototype.slice.call(batch)); more(); } }, function () { res(); }); })();
      });
    }
    return Promise.resolve();
  }
  return Promise.all(entries.map(function (e) { return walk(e, []); })).then(function () { return out; });
}
function fmtSize(b) { b = Number(b) || 0; return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : b > 1024 ? Math.round(b / 1024) + " KB" : b + " B"; }
/* Upload a list of {file, path} into the note's Drive folder */
function uploadToNote(n, list, ui) {
  if (!list.length) return Promise.resolve();
  var cache = {};
  function folderFor(base, path) {
    if (!path.length) return Promise.resolve(base);
    var key = path.join("/");
    if (cache[key]) return cache[key];
    cache[key] = folderFor(base, path.slice(0, -1)).then(function (p) { return dchild(path[path.length - 1], p); });
    return cache[key];
  }
  return getToken().then(function () { return n.folderId ? Promise.resolve(n.folderId) : noteFolder(n); }).then(function (base) {
    var tops = {}, done = 0, chain = Promise.resolve();
    list.forEach(function (it) {
      chain = chain.then(function () {
        ui("Uploading " + (done + 1) + " of " + list.length + ": " + it.file.name);
        return folderFor(base, it.path).then(function (pid) {
          return dupload(it.file, pid, function (f) { ui("Uploading " + (done + 1) + " of " + list.length + ": " + it.file.name + " · " + Math.round(f * 100) + "%"); });
        }).then(function (r) {
          done++;
          if (it.path.length) { var top0 = it.path[0]; tops[top0] = (tops[top0] || 0) + 1; }
          else { n.attachments = n.attachments || []; n.attachments.push({ id: r.id, name: r.name, size: Number(r.size) || it.file.size, mime: r.mimeType, link: r.webViewLink, t: Date.now() }); }
          n.u = Date.now(); save();
        });
      });
    });
    return chain.then(function () {
      var names = Object.keys(tops);
      return Promise.all(names.map(function (nm) { return folderFor(base, [nm]); })).then(function (ids) {
        names.forEach(function (nm, i) {
          n.attachments = (n.attachments || []).filter(function (a) { return !(a.folder && a.id === ids[i]); });
          n.attachments.push({ id: ids[i], name: nm, folder: true, count: tops[nm], link: "https://drive.google.com/drive/folders/" + ids[i], t: Date.now() });
        });
        n.u = Date.now(); save();
        return done;
      });
    });
  });
}
/* Google Doc copy of a note, for sharing from Drive */
function noteDocHTML(n) {
  var pairs = sentencePairs(n.orig, n.fixed).filter(function (p) { return p.changed; });
  var fx = (n.fixes || []).filter(function (f) { return !f.big && f.from && f.to; });
  var body = linkify(esc(n.fixed), (n.links || []).filter(function (l) { return !/^#note~/.test(l.url); })).replace(/\n/g, "<br>");
  return "<html><body><h1>" + esc(n.title) + "</h1>" +
    "<p>" + body + "</p>" +
    (pairs.length ? "<h2>Corrections</h2><table border='1' cellpadding='6' style='border-collapse:collapse'><tr><th>My version</th><th>Correct</th></tr>" + pairs.map(function (p) { return "<tr><td>" + p.aH.replace(/<del class="nm-del">/g, "<s style='color:#b8322f'>").replace(/<\/del>/g, "</s>") + "</td><td>" + p.bH.replace(/<ins class="nm-ins">/g, "<b style='color:#1f7a52'>").replace(/<\/ins>/g, "</b>") + "</td></tr>"; }).join("") + "</table>" : "") +
    (fx.length ? "<h3>Why</h3><ul>" + fx.map(function (f) { return "<li>" + esc(f.from) + " → <b>" + esc(f.to) + "</b>: " + esc(f.why || "") + "</li>"; }).join("") + "</ul>" : "") +
    ((n.attachments || []).length ? "<h3>Attachments</h3><ul>" + n.attachments.map(function (a) { return "<li><a href='" + esc(a.link) + "'>" + esc(a.name) + "</a></li>"; }).join("") + "</ul>" : "") +
    ((n.tags || []).length ? "<p>Tags: " + n.tags.map(function (t) { return "#" + esc(t); }).join(" ") + "</p>" : "") +
    "<p style='color:#888'>Saved from Speakwell · " + new Date(n.u).toLocaleString() + "</p></body></html>";
}
function saveNoteDoc(n) {
  var html = noteDocHTML(n);
  return getToken().then(function () {
    if (n.docId) {
      return gfetch(UAPI + "/" + n.docId + "?uploadType=media&fields=id,webViewLink", { method: "PATCH", headers: { "Content-Type": "text/html; charset=UTF-8" }, body: html })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (n.title) return gfetch(DAPI + "/" + n.docId + "?fields=id,webViewLink", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n.title }) }).then(function (r) { return r.json(); }); return j; })
        .catch(function (e) { if (e.status === 404) { n.docId = ""; return saveNoteDoc(n); } throw e; });
    }
    return dfolder().then(function (root) { return dchild("Notes", root); }).then(function (pid) {
      var b = "sw" + Date.now(), meta = { name: n.title || "Speakwell note", mimeType: "application/vnd.google-apps.document", parents: [pid] };
      var data = "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(meta) + "\r\n--" + b + "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n" + html + "\r\n--" + b + "--";
      return gfetch(UAPI + "?uploadType=multipart&fields=id,webViewLink", { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + b }, body: data }).then(function (r) { return r.json(); });
    });
  }).then(function (j) { n.docId = j.id; n.docLink = j.webViewLink || ("https://docs.google.com/document/d/" + j.id + "/edit"); n.u = Date.now(); save(); return n; });
}
function setDocPublic(n, on) {
  return getToken().then(function () {
    if (on) return gfetch(DAPI + "/" + n.docId + "/permissions?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "reader", type: "anyone" }) });
    return gfetch(DAPI + "/" + n.docId + "/permissions/anyoneWithLink", { method: "DELETE" }).catch(function (e) { if (e.status !== 404) throw e; });
  }).then(function () { n.docPublic = !!on; n.u = Date.now(); save(); });
}
function trashDrive(id) { return getToken().then(function () { return gfetch(DAPI + "/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashed: true }) }); }); }
function shareText(n, both) {
  var t = n.title + "\n\n" + n.fixed;
  if (both) {
    var pairs = sentencePairs(n.orig, n.fixed).filter(function (p) { return p.changed; });
    if (pairs.length) t += "\n\nCorrections:\n" + pairs.map(function (p) { return "✗ " + p.a + "\n✓ " + p.b; }).join("\n\n");
  }
  var ls = (n.links || []).filter(function (l) { return !/^#note~/.test(l.url); });
  if (ls.length) t += "\n\nLinks:\n" + ls.map(function (l) { return l.text + ": " + l.url; }).join("\n");
  var at = n.attachments || [];
  if (at.length) t += "\n\nAttachments:\n" + at.map(function (a) { return a.name + ": " + a.link; }).join("\n");
  return t;
}
function copyText(t) { return (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast("Copied"); }).catch(function () { toast("Couldn't copy here. Use Share instead."); }); }

function attListHTML(n) {
  var at = (n && n.attachments) || [];
  if (!at.length) return '<p class="muted small">No attachments yet.</p>';
  return '<div class="att-list">' + at.slice().sort(function (a, b) { return b.t - a.t; }).map(function (a) {
    return '<div class="att" data-att="' + esc(a.id) + '"><span class="att-ic">' + ico(a.folder ? "folder" : "file") + '</span><a href="' + esc(a.link) + '" target="_blank" rel="noopener noreferrer" class="att-name">' + esc(a.name) + '</a><span class="muted small">' + (a.folder ? a.count + " file" + (a.count === 1 ? "" : "s") : fmtSize(a.size)) + "</span>" +
      '<button type="button" class="btn sm ghost" data-a="attRm">Remove</button><span class="row tight" data-attc hidden><button type="button" class="btn sm" data-a="attRmN">Keep in Drive, remove here</button><button type="button" class="btn sm" data-a="attRmT" style="color:var(--bad)">Move to Drive trash</button></span></div>';
  }).join("") + "</div>";
}
/* drag-and-drop + pickers → Google Drive */
function bindAttach(zone, getNote, ui, after) {
  var pending = null;
  function start(list) {
    if (!list.length) return;
    var n = getNote(); if (!n) { toast("Write something first, then attach files."); return; }
    if (!online()) { ui("You're offline. Connect to the internet to upload to Google Drive."); return; }
    if (!tokenValid()) { pending = list; ui('<button type="button" class="btn sm primary" data-upgo>Sign in to Google and upload ' + list.length + " file" + (list.length > 1 ? "s" : "") + "</button>", true); return; }
    run(n, list);
  }
  function run(n, list) {
    uploadToNote(n, list, function (m) { ui(esc(m), true); }).then(function (c) { M.on = M.on || true; saveMeta(); ui("Uploaded " + c + " file" + (c === 1 ? "" : "s") + " to Google Drive.", true); toast("Saved to Google Drive"); after(); })
      .catch(function (e) { ui('<span style="color:var(--bad)">' + esc(e.message) + "</span>", true); });
  }
  zone.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1) { e.preventDefault(); zone.classList.add("drag"); } });
  zone.addEventListener("dragleave", function (e) { if (!zone.contains(e.relatedTarget)) zone.classList.remove("drag"); });
  zone.addEventListener("drop", function (e) {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault(); zone.classList.remove("drag");
    collectDropped(e.dataTransfer).then(start);
  });
  zone.addEventListener("click", function (e) {
    if (e.target.closest("[data-upgo]") && pending) { var n = getNote(), l = pending; pending = null; run(n, l); }
  });
  $$('input[type=file]', zone).forEach(function (inp) {
    inp.addEventListener("change", function () {
      var list = Array.prototype.slice.call(inp.files || []).map(function (f) { var parts = (f.webkitRelativePath || "").split("/").filter(Boolean); return { file: f, path: parts.slice(0, -1) }; });
      inp.value = ""; start(list);
    });
  });
}
function dropZoneHTML(id) {
  return '<div class="dropzone" id="' + id + '"><p><b>Drop files or folders here</b> <span class="muted">or</span></p><div class="row tight" style="justify-content:center"><label class="btn sm">' + ico("file") + 'Add files<input type="file" multiple hidden></label><label class="btn sm">' + ico("folder") + 'Add folder<input type="file" webkitdirectory multiple hidden></label></div><p class="small" data-upmsg aria-live="polite"></p></div>';
}
/* ---------- Note titles, tags and links ---------- */
function cleanTag(t) { return String(t || "").toLowerCase().replace(/^#+/, "").replace(/[^a-z0-9ऀ-ॿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30); }
function tagEditorHTML(n) {
  var user = (n && n.tags) || [];
  return '<div class="tagbox">' + user.map(function (t) { return '<span class="tagchip">#' + esc(t) + '<button type="button" data-untag="' + esc(t) + '" aria-label="Remove tag ' + esc(t) + '">×</button></span>'; }).join("") +
    '<input class="taginput" type="text" autocapitalize="off" placeholder="' + (user.length ? "Add tag" : "Add tags, e.g. ngdr, email") + '" aria-label="Add a tag"></div>';
}
function bindTagEditor(box, getNote, onChange) {
  var inp = $(".taginput", box); if (!inp) return;
  function add(v) {
    var n = getNote(); if (!n) { toast("Write something first, then add tags."); return; }
    n.tags = n.tags || [];
    v.split(/[,;]+|\s+/).map(cleanTag).filter(Boolean).forEach(function (t) { if (n.tags.indexOf(t) < 0) n.tags.push(t); });
    n.u = Date.now(); save(); onChange(); var again = $(".taginput", box.isConnected ? box : document); if (again) again.focus();
  }
  inp.onkeydown = function (e) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); var v0 = inp.value; inp.value = ""; if (v0.trim()) add(v0); }
    else if (e.key === "Backspace" && !inp.value) { var n = getNote(); if (n && n.tags && n.tags.length) { n.tags.pop(); n.u = Date.now(); save(); onChange(); } }
  };
  inp.onchange = function () { var v0 = inp.value; inp.value = ""; if (v0.trim()) setTimeout(function () { add(v0); }, 0); };
  box.onclick = function (e) {
    var b = e.target.closest("[data-untag]");
    if (b) { var n = getNote(); if (!n) return; var t = b.getAttribute("data-untag"); n.tags = (n.tags || []).filter(function (x) { return x !== t; }); n.u = Date.now(); save(); onChange(); }
    else if (e.target === box) inp.focus();
  };
}
function normUrl(u) {
  u = String(u || "").trim(); if (!u) return "";
  if (/^#note~[\w-]+$/.test(u)) return u;
  if (/^(https?:\/\/|mailto:)\S+$/i.test(u)) return u;
  if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(u)) return "mailto:" + u;
  if (/^(www\.)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(u)) return "https://" + u;
  return "";
}
function linkify(html, links) {
  var tokens = [];
  (links || []).slice().sort(function (a, b) { return b.text.length - a.text.length; }).forEach(function (l) {
    var t = esc(l.text); if (!t || html.indexOf(t) < 0) return;
    var k = tokens.length;
    var inner = /^#note~/.test(l.url), tn = inner && S.notes.filter(function (x) { return "#note~" + x.id === l.url; })[0];
    tokens.push('<a class="nlink' + (inner ? " inner" : "") + '" href="' + esc(l.url) + '"' + (inner ? "" : ' target="_blank" rel="noopener noreferrer"') + ' title="' + esc(inner ? "Note: " + (tn ? tn.title : "deleted note") : l.url) + '">' + t + "</a>");
    html = html.split(t).join("\u0001" + k + "\u0002");
  });
  return html.replace(/\u0001(\d+)\u0002/g, function (m0, k) { return tokens[+k]; });
}
function linksHTML(n, text) {
  var ls = (n && n.links) || [];
  if (!ls.length) return "";
  return '<div class="links-row"><span class="eyebrow">Links</span>' + ls.map(function (l) {
    var gone = text != null && text.indexOf(l.text) < 0;
    var inner = /^#note~/.test(l.url), tn = inner && S.notes.filter(function (x) { return "#note~" + x.id === l.url; })[0];
    return '<span class="linkchip' + (gone ? " gone" : "") + (inner ? " inner" : "") + '" title="' + (gone ? "This text is no longer in the draft" : esc(inner ? "Note: " + (tn ? tn.title : "deleted note") : l.url)) + '"><a href="' + esc(l.url) + '"' + (inner ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(l.text.length > 40 ? l.text.slice(0, 40) + "…" : l.text) + (inner ? " → " + esc(tn ? tn.title.slice(0, 30) : "deleted note") : " ↗") + '</a><button type="button" data-unlink="' + esc(l.text) + '" aria-label="Remove link">×</button></span>';
  }).join("") + "</div>";
}
function closeLinkMenu() { var o = $("#lmenu"); if (o) o.remove(); document.removeEventListener("mousedown", lmOutside, true); }
function lmOutside(e) { var o = $("#lmenu"); if (o && !o.contains(e.target)) closeLinkMenu(); }
/* opts: { x, y, text, note: function(create) → note, extra: [[label, fn]], onDone } */
function openLinkMenu(opts) {
  closeLinkMenu();
  var n = opts.note(false), ex = n && (n.links || []).filter(function (l) { return l.text === opts.text; })[0];
  var t = opts.text.length > 60 ? opts.text.slice(0, 60) + "…" : opts.text;
  var el = document.createElement("div"); el.className = "lmenu"; el.id = "lmenu"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Add link");
  var others = S.notes.filter(function (x) { return !n || x.id !== n.id; }).sort(function (a, b) { return b.u - a.u; });
  var isNote = ex && /^#note~/.test(ex.url);
  el.innerHTML = '<p class="small"><b>Link</b> <span class="muted">“' + esc(t) + '”</span></p>' +
    '<div class="row tight"><button type="button" class="chip' + (isNote ? "" : " on") + '" data-lmt="web">Web or email</button><button type="button" class="chip' + (isNote ? " on" : "") + '" data-lmt="note"' + (others.length ? "" : " disabled") + '>Another note</button></div>' +
    '<div class="row tight" id="lmNoteRow" style="flex-wrap:nowrap"' + (isNote ? "" : " hidden") + '><select id="lmNote" style="min-width:0;flex:1">' + others.map(function (x) { return '<option value="#note~' + x.id + '"' + (ex && ex.url === "#note~" + x.id ? " selected" : "") + ">" + esc(x.title) + "</option>"; }).join("") + '</select><button type="button" class="btn sm primary" id="lmOkN">' + (ex ? "Update" : "Add") + "</button></div>" +
    '<div class="row tight" id="lmWebRow" style="flex-wrap:nowrap"' + (isNote ? " hidden" : "") + '><input id="lmUrl" type="text" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://… or name@mail.com" value="' + esc(ex ? ex.url : "") + '"><button type="button" class="btn sm primary" id="lmOk">' + (ex ? "Update" : "Add") + "</button></div>" +
    '<p class="small" id="lmErr" hidden style="color:var(--bad)">Enter a web address (https://…) or an email address.</p>' +
    (ex ? '<button type="button" class="btn sm ghost" id="lmDel" style="color:var(--bad)">Remove link</button>' : "") +
    (opts.extra && opts.extra.length ? '<hr class="sep"><div class="row tight">' + opts.extra.map(function (x, i) { return '<button type="button" class="btn sm" data-lmx="' + i + '">' + x[0] + "</button>"; }).join("") + "</div>" : "") +
    '<p class="muted small">Tip: select text, then Ctrl+K or right-click.</p>';
  document.body.appendChild(el);
  var w = el.offsetWidth, h = el.offsetHeight;
  el.style.left = Math.max(8, Math.min(opts.x, window.innerWidth - w - 8)) + "px";
  el.style.top = Math.max(8, Math.min(opts.y, window.innerHeight - h - 8)) + "px";
  var url = $("#lmUrl"); if (!isNote) setTimeout(function () { url.focus(); url.select(); }, 20);
  if (isNote) url.value = "";
  $$("[data-lmt]", el).forEach(function (b) { b.onclick = function () { var nt = b.getAttribute("data-lmt") === "note"; $$("[data-lmt]", el).forEach(function (x) { x.classList.toggle("on", x === b); }); $("#lmNoteRow").hidden = !nt; $("#lmWebRow").hidden = nt; $("#lmErr").hidden = true; }; });
  function ok(fromNote) {
    var u = fromNote === true ? $("#lmNote").value : normUrl(url.value); if (!u) { $("#lmErr").hidden = false; url.focus(); return; }
    var note = opts.note(true); if (!note) { toast("Write something first."); closeLinkMenu(); return; }
    note.links = (note.links || []).filter(function (l) { return l.text !== opts.text; });
    note.links.push({ text: opts.text, url: u }); note.u = Date.now(); save();
    closeLinkMenu(); toast(ex ? "Link updated" : "Link added"); if (opts.onDone) opts.onDone();
  }
  $("#lmOk").onclick = function () { ok(false); }; if ($("#lmOkN")) $("#lmOkN").onclick = function () { ok(true); };
  url.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); ok(false); } if (e.key === "Escape") closeLinkMenu(); };
  if ($("#lmDel")) $("#lmDel").onclick = function () { var note = opts.note(false); note.links = (note.links || []).filter(function (l) { return l.text !== opts.text; }); note.u = Date.now(); save(); closeLinkMenu(); toast("Link removed"); if (opts.onDone) opts.onDone(); };
  $$("[data-lmx]", el).forEach(function (b) { b.onclick = function () { var f = opts.extra[+b.getAttribute("data-lmx")][1]; closeLinkMenu(); f(); }; });
  setTimeout(function () { document.addEventListener("mousedown", lmOutside, true); }, 0);
}
function unlink(n, text) { if (!n) return; n.links = (n.links || []).filter(function (l) { return l.text !== text; }); n.u = Date.now(); save(); }

var NS = { q: "", only: "all", hide: false, changedOnly: true, tag: "", share: "" };
VIEWS.notes = function (m, id) {
  if (autoMergeNotes()) toast("Notes from the same draft were combined");
  var wide = window.matchMedia("(min-width: 900px)").matches;
  var all = S.notes.slice().sort(function (a, b) { return b.u - a.u; });
  var cur = id && S.notes.filter(function (x) { return x.id === id; })[0];
  if (!cur && id) { go("notes"); return; }
  if (!cur && wide && all.length) cur = all[0];
  function list() {
    var items = all.filter(function (n) {
      if (NS.only === "due" && n.lastRev && Date.now() - n.lastRev < 3 * 864e5) return false;
      if (NS.tag && (n.tags || []).indexOf(NS.tag) < 0 && noteTags(n).indexOf(NS.tag) < 0) return false;
      return !NS.q || (n.title + " " + n.orig + " " + n.fixed + " " + (n.tags || []).join(" ") + " " + noteTags(n).join(" ")).toLowerCase().indexOf(NS.q) > -1;
    });
    return '<div class="nl"><div class="nl-head"><h2>All notes <span class="muted small">' + all.length + '</span></h2><button class="icon-btn" data-go="write" aria-label="New draft" title="New draft">+</button></div>' +
      '<input id="nq" type="search" placeholder="Search all notes" value="' + esc(NS.q) + '">' +
      '<div class="row tight"><button class="chip' + (NS.only === "all" ? " on" : "") + '" data-nf="all">All</button><button class="chip' + (NS.only === "due" ? " on" : "") + '" data-nf="due">Due for revision</button></div>' +
      (function () { var tg = {}; all.forEach(function (n) { (n.tags || []).forEach(function (t) { tg[t] = (tg[t] || 0) + 1; }); }); var ks = Object.keys(tg).sort(); return ks.length ? '<div class="row tight"><span class="eyebrow">Tags</span>' + ks.map(function (t) { return '<button class="chip' + (NS.tag === t ? " on" : "") + '" data-ntag="' + esc(t) + '">#' + esc(t) + " " + tg[t] + "</button>"; }).join("") + "</div>" : ""; })() +
      '<div class="nl-items">' + (items.length ? items.map(function (n) {
        var pairs = sentencePairs(n.orig, n.fixed), ch = pairs.filter(function (p) { return p.changed; }).length;
        return '<button class="nl-item' + (cur && cur.id === n.id ? " on" : "") + '" data-go="note~' + n.id + '"><b>' + esc(n.title) + "</b>" + (S.curNote === n.id ? '<span class="pill ok" style="align-self:flex-start">Open in Write</span>' : "") + '<span class="nl-prev">' + esc(n.fixed.replace(/\s+/g, " ").slice(0, 90)) + '</span><span class="nl-meta">' + relDate(n.u) + " · " + (n.pending ? "not corrected yet" : ch + " of " + pairs.length + " sentences fixed") + " · " + wordCount(n.fixed) + " words</span>" +
          ((n.tags || []).length || noteTags(n).length ? '<span class="nl-tags">' + (n.tags || []).map(function (t) { return '<i class="u">#' + esc(t) + "</i>"; }).join("") + noteTags(n).map(function (t) { return "<i>#" + esc(t) + "</i>"; }).join("") + "</span>" : "") + "</button>";
      }).join("") : '<p class="muted small" style="padding:12px">' + (all.length ? "No notes match." : "No notes yet. In the Writing studio, fix a sentence or tap Save as note.") + "</p>") + "</div></div>";
  }
  function detail(n) {
    var pairs = sentencePairs(n.orig, n.fixed), ch = pairs.filter(function (p) { return p.changed; });
    var shown = NS.changedOnly && ch.length ? ch : pairs, used = {};
    var fx = (n.fixes || []).filter(function (f) { return !f.big && (f.why || f.from); });
    var rows = shown.map(function (p) {
      var mine = fx.filter(function (f, i) { if (used[i]) return false; var hit = (f.to && p.b.indexOf(f.to) > -1) || (f.from && p.a.indexOf(f.from) > -1); if (hit) used[i] = 1; return hit; });
      var num = pairs.indexOf(p) + 1;
      if (!p.changed) return '<div class="np-row same"><span class="np-n">' + num + '</span><div class="np-same">' + p.bH + ' <span class="pill ok">✓ correct</span></div></div>';
      return '<div class="np-row"><span class="np-n">' + num + '</span><div class="np-pair"><div class="nm-box nm-wrong"><span class="eyebrow">Your version</span><p>' + p.aH + '</p></div>' +
        '<div class="nm-box nm-right"' + (NS.hide ? " hidden" : "") + '><span class="eyebrow">Correct</span><p>' + p.bH + "</p></div>" +
        (NS.hide ? '<button class="btn sm np-reveal" data-reveal>Reveal</button>' : "") + "</div>" +
        (mine.length ? '<ul class="nm-fixes"' + (NS.hide ? " hidden" : "") + ">" + mine.map(function (f) { return "<li>" + (f.from && f.to ? '<del class="nm-del">' + esc(f.from) + '</del> → <ins class="nm-ins">' + esc(f.to) + "</ins> " : "") + '<span class="muted">' + esc(f.why || "") + (f.topic ? " · " + esc(f.topic) : "") + "</span></li>"; }).join("") + "</ul>" : "") + "</div>";
    }).join("");
    var rest = fx.filter(function (f, i) { return !used[i]; });
    return '<div class="nd">' + (wide ? "" : '<button class="btn sm ghost" data-go="notes">' + ico("back") + "All notes</button>") +
      '<label class="eyebrow" for="ndTitle">Title</label><div class="nd-titlewrap"><input class="nd-title" id="ndTitle" value="' + esc(n.title) + '" placeholder="Add a title"><span class="muted" aria-hidden="true">' + ico("write") + "</span></div>" +
      '<p class="muted small">' + new Date(n.t).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) + " · " + esc(n.source || "") + " · " + wordCount(n.fixed) + " words" + (n.revised ? " · revised " + n.revised + "×" : "") + "</p>" +
      '<div id="ndTags">' + tagEditorHTML(n) + "</div>" +
      (noteTags(n).length ? '<div class="nl-tags"><span class="muted small">Topics:</span>' + noteTags(n).map(function (t) { return "<i>#" + esc(t) + "</i>"; }).join("") + "</div>" : "") +
      '<div class="nd-stats"><div><b>' + ch.length + "</b><span>sentences fixed</span></div><div><b>" + (pairs.length - ch.length) + "</b><span>already correct</span></div><div><b>" + fx.length + "</b><span>corrections</span></div></div>" +
      '<div class="row tight"><button class="btn sm" data-a="say">' + ico("play") + 'Hear correct</button><button class="btn sm" data-a="rev">' + ico("ok") + 'Revised</button><button class="btn sm" data-a="share">' + ico("share") + 'Share</button><button class="btn sm primary" data-a="edit">' + ico("write") + 'Edit draft</button>' +
      (n.pending ? '<button class="btn sm primary" data-a="ai">Correct with AI</button>' : "") + '<button class="btn sm ghost" data-a="del" style="color:var(--bad)">Delete</button>' +
      '<span class="row tight" id="ndConf" hidden><span class="small">Delete this note?</span><button class="btn sm" data-a="delY" style="color:var(--bad)">Yes</button><button class="btn sm" data-a="delN">No</button></span></div>' +
      '<div class="card share-panel" id="ndShare"' + (NS.share === n.id ? "" : " hidden") + '><h3>Share this note</h3>' +
      '<div class="row tight">' + (navigator.share ? '<button class="btn sm primary" data-a="shSys">' + ico("share") + "Share…</button>" : "") +
      '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(shareText(n, false)) + '">WhatsApp</a>' +
      '<a class="btn sm" href="mailto:?subject=' + encodeURIComponent(n.title) + "&body=" + encodeURIComponent(shareText(n, false).slice(0, 1800)) + '">Email</a>' +
      '<button class="btn sm" data-a="shCopy">' + ico("copy") + 'Copy text</button><button class="btn sm" data-a="shCopy2">Copy with corrections</button></div>' +
      '<hr class="sep"><div class="stack" style="gap:8px"><p class="small"><b>Google Docs</b> <span class="muted">A copy of the note (final text, corrections, links, attachments) in Drive › Speakwell › Notes. Share it from Google Docs, or turn on a view link.</span></p>' +
      (n.docId ? '<div class="row tight"><a class="btn sm" target="_blank" rel="noopener" href="' + esc(n.docLink) + '">Open in Google Docs</a><button class="btn sm" data-a="shDoc">Update the Doc</button></div>' +
        '<label class="row small" for="shPub"><input type="checkbox" id="shPub"' + (n.docPublic ? " checked" : "") + "> Anyone with the link can view</label>" +
        (n.docPublic ? '<div class="row tight" style="flex-wrap:nowrap"><input type="text" readonly value="' + esc(n.docLink) + '" id="shLink" style="min-width:0"><button class="btn sm" data-a="shLinkCopy">Copy link</button></div>' : "")
        : '<div class="row tight"><button class="btn sm" data-a="shDoc">Save as Google Doc</button></div>') +
      '<p class="small" id="shMsg" aria-live="polite"></p></div></div>' +
      (S.notes.length > 1 ? '<div class="row tight"><label class="small muted" for="ndMerge">Merge another note into this one</label><select id="ndMerge" style="width:auto;min-width:0;flex:1;max-width:340px"><option value="">Choose a note…</option>' + S.notes.filter(function (x) { return x.id !== n.id; }).sort(function (a, b) { return b.u - a.u; }).map(function (x) { return '<option value="' + x.id + '">' + esc(x.title) + " · " + relDate(x.u) + "</option>"; }).join("") + '</select><button class="btn sm" data-a="merge">Merge</button></div>' : "") +
      '<div class="section"><h2>Full text</h2><div class="nm-grid"><div class="nm-box nm-wrong"><span class="eyebrow">Your version (draft)</span><p class="hbody" data-sel>' + linkify(esc(n.orig), n.links) + '</p></div><div class="nm-box nm-right"><span class="eyebrow">Correct</span><p class="hbody" data-sel>' + linkify(esc(n.fixed), n.links) + "</p></div></div>" +
      '<div id="ndLinks">' + linksHTML(n, n.fixed) + '</div><p class="muted small">Select any word or sentence above, then press Ctrl+K or right-click to add a link.</p></div>' +
      '<div class="section"><div class="row" style="justify-content:space-between"><h2>Attachments</h2><span class="muted small">Saved in Google Drive › Speakwell › Attachments</span></div>' + dropZoneHTML("ndDrop") + '<div id="ndAttList">' + attListHTML(n) + "</div></div>" +
      '<div class="section"><div class="row" style="justify-content:space-between"><h2>Fixed sentences</h2><span class="muted small">' + ch.length + " of " + pairs.length + ' sentences</span></div></div>' +
      '<div class="row tight"><button class="chip' + (NS.changedOnly ? " on" : "") + '" data-a="changed">Fixed sentences only</button><button class="chip' + (NS.hide ? " on" : "") + '" data-a="hide">Revision mode</button></div>' +
      (NS.hide ? '<div class="notice info">Corrections are hidden. Read your version, say the correct sentence aloud, then tap Reveal.</div>' : "") +
      '<div class="np">' + (rows || '<p class="muted">Nothing to show.</p>') + "</div>" +
      (rest.length && !NS.hide ? '<div class="section"><h3 class="eyebrow">Other notes on this draft</h3><ul class="nm-fixes">' + rest.map(function (f) { return '<li><span class="muted">' + esc(f.why || "") + (f.topic ? " · " + esc(f.topic) : "") + "</span></li>"; }).join("") + "</ul></div>" : "") +
      "</div>";
  }
  var head = top("My notes", { back: wide || !cur ? "write" : "notes", eyebrow: S.notes.length + " saved" + (M.on ? " · synced to Google Drive" : "") });
  if (wide) m.innerHTML = head + '<div class="nwrap">' + list() + (cur ? detail(cur) : '<div class="nd"><p class="muted">Select a note.</p></div>') + "</div>";
  else m.innerHTML = head + (cur ? detail(cur) : list());
  m.classList.add("wide-main"); cleanup.push(function () { m.classList.remove("wide-main"); });
  var q = $("#nq");
  if (q) q.oninput = function () { var p = this.selectionStart; NS.q = this.value.toLowerCase(); VIEWS.notes(m, cur && wide ? cur.id : null); var q2 = $("#nq"); q2.focus(); q2.setSelectionRange(p, p); };
  $$("[data-nf]").forEach(function (b) { b.onclick = function () { NS.only = b.getAttribute("data-nf"); route(); }; });
  $$("[data-ntag]").forEach(function (b) { b.onclick = function () { var t = b.getAttribute("data-ntag"); NS.tag = NS.tag === t ? "" : t; route(); }; });
  if (!cur) return;
  $("#ndTitle").onchange = function () { var v = this.value.trim(); cur.title = v || noteTitle(cur.fixed); cur.titleSet = !!v; cur.u = Date.now(); save(); toast(v ? "Title saved" : "Using the automatic title"); route(); };
  $("#ndTitle").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } };
  if ($("#shPub")) $("#shPub").onchange = function () {
    var on = this.checked, box = this; box.disabled = true;
    setDocPublic(cur, on).then(function () { toast(on ? "Anyone with the link can view" : "View link turned off"); NS.share = cur.id; route(); }).catch(function (e) { box.checked = !on; box.disabled = false; $("#shMsg").textContent = e.message; });
  };
  var ndz = $(".nd");
  bindAttach(ndz, function () { return cur; }, function (m, html) { var el = $("#ndDrop [data-upmsg]"); if (el) { if (html) el.innerHTML = m; else el.textContent = m; } }, function () { var l = $("#ndAttList"); if (l) l.innerHTML = attListHTML(cur); });
  bindTagEditor($("#ndTags .tagbox"), function () { return cur; }, function () { route(); setTimeout(function () { var i = $("#ndTags .taginput"); if (i) i.focus(); }, 0); });
  $("#ndLinks").onclick = function (e) { var b = e.target.closest("[data-unlink]"); if (b) { e.preventDefault(); unlink(cur, b.getAttribute("data-unlink")); route(); toast("Link removed"); } };
  function noteSel() { var sl = window.getSelection(); if (!sl || sl.isCollapsed) return ""; var a = sl.anchorNode && (sl.anchorNode.nodeType === 3 ? sl.anchorNode.parentNode : sl.anchorNode); return a && a.closest && a.closest("[data-sel]") ? sl.toString().trim() : ""; }
  function noteLinkMenu(x, y) {
    var t = noteSel(); if (!t) { toast("Select a word or sentence in the full text first."); return; }
    openLinkMenu({ x: x, y: y, text: t, note: function () { return cur; }, onDone: route });
  }
  $$("[data-sel]").forEach(function (p) { p.addEventListener("contextmenu", function (e) { if (!noteSel()) return; e.preventDefault(); noteLinkMenu(e.clientX, e.clientY); }); });
  var nk = function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "k" && noteSel()) {
      e.preventDefault(); var r = window.getSelection().getRangeAt(0).getBoundingClientRect(); noteLinkMenu(r.left, r.bottom + 8);
    }
  };
  document.addEventListener("keydown", nk); cleanup.push(function () { document.removeEventListener("keydown", nk); });
  $(".nd").onclick = function (e) {
    var rv = e.target.closest("[data-reveal]");
    if (rv) { var row = rv.closest(".np-row"); $$(".nm-right,.nm-fixes", row).forEach(function (x) { x.hidden = false; }); rv.remove(); return; }
    var b = e.target.closest("[data-a]"); if (!b) return;
    var a = b.getAttribute("data-a");
    if (a === "say") say(cur.fixed);
    if (a === "rev") { cur.revised = (cur.revised || 0) + 1; cur.lastRev = Date.now(); cur.u = Date.now(); addXP(3, "note revised"); route(); }
    if (a === "edit") { S.curNote = cur.id; S.draft = cur.fixed; S.draftT = Date.now(); save(); go("write"); }
    if (a === "changed") { NS.changedOnly = !NS.changedOnly; route(); }
    if (a === "hide") { NS.hide = !NS.hide; route(); }
    if (a === "del") $("#ndConf").hidden = false;
    if (a === "delN") $("#ndConf").hidden = true;
    if (a === "share") { NS.share = NS.share === cur.id ? "" : cur.id; $("#ndShare").hidden = NS.share !== cur.id; }
    if (a === "shSys") navigator.share({ title: cur.title, text: shareText(cur, false) }).catch(function () {});
    if (a === "shCopy") copyText(shareText(cur, false));
    if (a === "shCopy2") copyText(shareText(cur, true));
    if (a === "shLinkCopy") copyText(cur.docLink);
    if (a === "shDoc") {
      if (!online()) { toast("You're offline. Try again when connected."); return; }
      b.disabled = true; b.textContent = cur.docId ? "Updating…" : "Saving…";
      saveNoteDoc(cur).then(function () { toast("Saved to Google Docs"); NS.share = cur.id; route(); }).catch(function (e2) { $("#shMsg").textContent = e2.message; b.disabled = false; b.textContent = cur.docId ? "Update the Doc" : "Save as Google Doc"; });
    }
    if (a === "attRm") { var row = b.closest(".att"); b.hidden = true; $("[data-attc]", row).hidden = false; }
    if (a === "attRmN" || a === "attRmT") {
      var aid = b.closest(".att").getAttribute("data-att");
      cur.attachments = (cur.attachments || []).filter(function (x) { return x.id !== aid; }); cur.u = Date.now(); save();
      if (a === "attRmT") trashDrive(aid).then(function () { toast("Moved to Google Drive trash"); }).catch(function (e3) { toast(e3.message); });
      else toast("Removed from this note");
      $("#ndAttList").innerHTML = attListHTML(cur);
    }
    if (a === "merge") {
      var oid = $("#ndMerge").value; if (!oid) { toast("Choose a note to merge first."); return; }
      var other = S.notes.filter(function (x) { return x.id === oid; })[0];
      var keep = nrm(other.fixed).length > nrm(cur.fixed).length ? other : cur, drop = keep === cur ? other : cur;
      mergeNotes(keep, drop); save(); toast("Notes merged"); go("note~" + keep.id);
    }
    if (a === "delY") { S.notes = S.notes.filter(function (x) { return x.id !== cur.id; }); S.notesDel[cur.id] = Date.now(); if (S.curNote === cur.id) { S.curNote = ""; S.draft = ""; } save(); toast("Note deleted"); go("notes"); }
    if (a === "ai") {
      b.disabled = true; b.textContent = "Correcting…";
      correctWithAI(cur.orig).then(function (j) { cur.fixed = j.corrected.trim(); cur.fixes = (j.fixes || []).map(function (f) { return { from: f.from, to: f.to, why: f.why, topic: f.topic || "" }; }); cur.pending = false; cur.u = Date.now(); if (!cur.titleSet) cur.title = noteTitle(cur.fixed); save(); route(); })
        .catch(function (e2) { toast(e2.message); b.disabled = false; b.textContent = "Correct with AI"; });
    }
  };
};
VIEWS.note = VIEWS.notes;

/* ---------- Correction history ---------- */
var HKINDS = [["all", "All"], ["writing", "Writing"], ["speaking", "Speaking"], ["coach", "Coach"], ["grammar", "Grammar"], ["quiz", "Quiz"]];
VIEWS.history = function (m) {
  var st = { k: "all", q: "" };
  m.innerHTML = top("Correction history", { back: "progress", eyebrow: S.history.length + " saved" + (M.on ? " · synced to Google Drive" : "") }) +
    '<p class="muted">Every writing check, AI rewrite, speaking feedback, coach tip and quiz mistake is saved here, newest first. Review it before a meeting or once a week.</p>' +
    '<div class="row" style="margin-top:12px" id="hk">' + HKINDS.map(function (k) { return '<button class="chip' + (k[0] === "all" ? " on" : "") + '" data-hk="' + k[0] + '">' + k[1] + "</button>"; }).join("") + "</div>" +
    '<input id="hq" type="search" placeholder="Search your corrections" style="margin-top:10px">' +
    '<div id="hl" class="stack" style="margin-top:14px"></div>' +
    '<div class="row" style="margin-top:20px"><button class="btn ghost" id="hClr" style="color:var(--bad)">Clear history</button><span id="hClrC" hidden class="row"><span class="small">Delete all ' + S.history.length + ' entries' + (M.on ? " on every synced device" : "") + '?</span><button class="btn sm" id="hClrY" style="color:var(--bad)">Yes, clear</button><button class="btn sm" id="hClrN">Cancel</button></span></div>';
  function draw() {
    var list = S.history.slice().reverse().filter(function (h) {
      return (st.k === "all" || h.kind === st.k) && (!st.q || (h.title + " " + h.input + " " + h.output).toLowerCase().indexOf(st.q) > -1);
    }).slice(0, 200);
    $("#hl").innerHTML = list.length ? list.map(function (h) {
      return '<details class="card hitem"><summary><span class="pill ' + ({ writing: "ok", speaking: "warn", coach: "ok", grammar: "warn", quiz: "bad" }[h.kind] || "ok") + '">' + esc(h.kind) + '</span> <b>' + esc(h.title) + '</b><br><span class="muted small">' + new Date(h.t).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) + " · " + esc(h.input.slice(0, 90)) + (h.input.length > 90 ? "…" : "") + "</span></summary>" +
        '<div class="stack" style="margin-top:10px"><div><span class="eyebrow">You wrote / said</span><p class="hbody">' + esc(h.input) + '</p></div><div><span class="eyebrow">Correction & feedback</span><div class="ai-out">' + mdLite(h.output) + "</div></div></div></details>";
    }).join("") : '<div class="card"><p class="muted">' + (S.history.length ? "Nothing matches." : "No corrections yet. Run a writing check, analyse a speaking answer, or chat with the coach, and the feedback is saved here.") + "</p></div>";
  }
  draw();
  $$("[data-hk]").forEach(function (b) { b.onclick = function () { st.k = b.getAttribute("data-hk"); $$("[data-hk]").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); }; });
  $("#hq").oninput = function () { st.q = this.value.toLowerCase().trim(); draw(); };
  $("#hClr").onclick = function () { $("#hClrC").hidden = false; };
  $("#hClrN").onclick = function () { $("#hClrC").hidden = true; };
  $("#hClrY").onclick = function () { S.history = []; S.historyClearedAt = Date.now(); save(); toast("History cleared"); route(); };
};

/* ---------- Progress ---------- */
VIEWS.progress = function (m) {
  var ss = S.sessions.slice(-20);
  var avg = ss.length ? Math.round(ss.reduce(function (a, b) { return a + b.score; }, 0) / ss.length) : 0;
  var fpm = ss.length ? (ss.reduce(function (a, b) { return a + (b.words ? b.fillers / b.words * 100 : 0); }, 0) / ss.length).toFixed(1) : "0";
  m.innerHTML = top("Progress", { eyebrow: "Your numbers" }) +
    '<div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))"><div class="stat"><b>' + S.streak + '</b><span>Day streak</span></div><div class="stat"><b>' + S.xp + '</b><span>Total XP</span></div><div class="stat"><b>' + S.sessions.length + '</b><span>Speaking sessions</span></div><div class="stat"><b>' + (S.quiz.total ? Math.round(S.quiz.right / S.quiz.total * 100) : 0) + '%</b><span>Quiz accuracy</span></div><div class="stat"><b>' + S.writes + '</b><span>Writing checks</span></div></div>' +
    '<div class="section"><button class="tile" data-go="history"><span class="t">Correction history</span><span class="d">' + S.history.length + ' saved corrections and pieces of feedback. Search and review them.</span></button></div>' +
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
    '<div class="stack"><div class="card stack"><h2>Google Drive sync</h2>' +
    '<p class="muted small">Saves your progress, coach chats, writing draft and correction history to <b>My Drive › Speakwell › speakwell-data.json</b>, and keeps all your devices in step. The app can only see files it created, nothing else in your Drive.</p>' +
    '<div id="syncState">' + syncStateHTML() + '</div>' +
    '<label class="f" for="gHint">Google account<span class="hint">Optional. Pre-selects this account in the sign-in window.</span><input id="gHint" type="text" inputmode="email" autocapitalize="off" value="' + esc(M.hint) + '" placeholder="you@gmail.com"></label>' +
    '<label class="row small" for="gKey"><input id="gKey" type="checkbox"' + (M.syncKey ? " checked" : "") + '> Also sync my OpenAI API key (stored in your Drive file)</label>' +
    '<div class="row"><button class="btn primary" id="gConn">' + (M.on ? "Sync now" : "Connect Google Drive") + '</button>' + (M.on ? '<button class="btn ghost" id="gOff">Disconnect</button>' : "") + '</div>' +
    '<details class="small"><summary class="muted">How to set up (one time)</summary><ol class="steps" style="margin-top:10px">' +
    '<li><span>Open console.cloud.google.com and pick the project that owns the Client ID below (your “Notewire” project).</span></li>' +
    '<li><span>APIs & Services › Library › search “Google Drive API” › Enable.</span></li>' +
    '<li><span>APIs & Services › Credentials › your OAuth client › make sure <b>https://sumanpresi.github.io</b> is under Authorised JavaScript origins.</span></li>' +
    '<li><span>OAuth consent screen › Audience: if the app is in Testing, add your Gmail address as a test user.</span></li>' +
    '<li><span>Come back here and tap Connect Google Drive.</span></li></ol>' +
    '<label class="f" for="gClient" style="margin-top:10px">OAuth Client ID<input id="gClient" type="text" autocapitalize="off" spellcheck="false" value="' + esc(M.clientId || DEFAULT_CLIENT) + '"></label></details></div>' +
    '<div class="card stack"><h2>AI model</h2>' +
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
    '<div class="card stack"><h2>Install the app</h2>' + (isInstalled() ? '<p class="small"><b>Installed.</b> You are using Speakwell as an app.</p>' : '<p class="muted small">Opens full-screen from your home screen and works offline.</p><div class="row"><button class="btn primary" data-install>' + ico("down") + 'Install app</button></div>') + "</div>" +
    '<div class="card stack"><h2>Your data</h2><p class="muted small">Progress is saved on this device. Back it up before changing phones or clearing browser data.</p><div class="row"><button class="btn" id="sExp">Export backup</button><label class="btn" for="sImp">Import backup<input id="sImp" type="file" accept="application/json" hidden></label></div>' +
    '<hr class="sep"><div class="row"><button class="btn ghost" id="sReset" style="color:var(--bad)">Reset all progress</button><span id="sResetC" hidden class="row"><span class="small">This deletes XP, streaks and history' + (M.on ? ' on every synced device' : '') + '.</span><button class="btn sm" id="sResetY" style="color:var(--bad)">Yes, reset</button><button class="btn sm" id="sResetN">Cancel</button></span></div></div>' +
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
      try { var o = JSON.parse(r.result); var key = S.settings.apiKey; S = Object.assign(JSON.parse(JSON.stringify(defaults)), o); S.settings = Object.assign({}, defaults.settings, o.settings || {}); if (!S.settings.apiKey) S.settings.apiKey = key; recount(S); save(); toast("Backup restored"); route(); }
      catch (e) { toast("That file isn't a Speakwell backup."); }
    }; r.readAsText(f);
  };
  function gCollect() { M.hint = $("#gHint").value.trim(); M.syncKey = $("#gKey").checked; var c = $("#gClient").value.trim(); M.clientId = c && c !== DEFAULT_CLIENT ? c : ""; saveMeta(); }
  ["gHint", "gKey", "gClient"].forEach(function (id) { $("#" + id).addEventListener("change", gCollect); });
  $("#gConn").onclick = function () {
    gCollect(); var first = !M.on;
    syncNow(true).then(function () { toast(first ? "Connected. Your progress is now saved to Google Drive." : "Synced with Google Drive"); route(); }).catch(function () {});
  };
  if ($("#gOff")) $("#gOff").onclick = function () {
    var tok = Sync.token;
    if (tok && window.google && google.accounts && google.accounts.oauth2) google.accounts.oauth2.revoke(tok, function () {});
    M.on = false; M.fileId = ""; M.err = ""; saveMeta(); Sync.token = null; try { localStorage.removeItem("speakwell.gtoken"); } catch (e) {}
    toast("Disconnected. Your Drive file is kept; reconnect anytime."); route();
  };
  $("#sReset").onclick = function () { $("#sResetC").hidden = false; };
  $("#sResetN").onclick = function () { $("#sResetC").hidden = true; };
  $("#sResetY").onclick = function () { var st = S.settings, nm = S.name; S = JSON.parse(JSON.stringify(defaults)); S.settings = st; S.name = nm; S.resetAt = Date.now(); recount(S); save(); toast("Progress reset" + (M.on ? " on all synced devices" : "")); go("home"); };
};

/* ================= boot ================= */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
route();
if (M.on && online() && tokenValid()) syncNow(false).then(afterSync).catch(function () {});
window.addEventListener("online", function () { if (M.on && tokenValid() && Sync.dirty) syncNow(false).catch(function () {}); });
})();
