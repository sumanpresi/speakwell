/* Speakwell — Sentence analysis panel.
   Select a sentence in the Writing studio → labelled structure diagram, core explanation,
   topic map (present / needs attention / checked / not used) and one-tap fixes. */
(function () {
"use strict";
var SW = window.SW;

SW.topicGroups = [
  { name: "Grammar basics", items: [["Verbs", "verbs"], ["Nouns", "nouns"], ["Pronouns", "pronouns"], ["Adjectives", "adjectives"], ["Adverbs", "adverbs"], ["Articles", "articles"], ["Prepositions", "prepositions"], ["Conjunctions", "conjunctions"], ["Interjections", "interjections"], ["Parts of Speech", "parts-of-speech"], ["Common Grammar Mistakes", "common-mistakes"], ["Grammar Checker", "common-mistakes"], ["Key Grammar Concepts", "key-concepts"]] },
  { name: "Syntax rules", items: [["Verb Tenses", "verb-tenses"], ["Modals", "modals"], ["Subject-Verb Agreement", "sva"], ["Direct Objects", "direct-objects"], ["Indirect Objects", "indirect-objects"], ["Syntax", "syntax"], ["Clauses", "clauses"], ["Sentence Fragments", "fragments"], ["Run-On Sentences", "run-ons"], ["Sentence Diagramming", "diagramming"], ["Sentence Structure", "sentence-structure"], ["Subjects", "subjects"], ["Conditionals", "conditionals"]] },
  { name: "Mechanics", items: [["Spell Check", "spell-check"], ["Contractions", "contractions"], ["Verb Tenses", "verb-tenses"], ["Subject-Verb Agreement", "sva"], ["Title Vs. Sentence Case", "title-case"], ["Syntax", "syntax"], ["Clauses", "clauses"], ["Sentence Fragments", "fragments"], ["Run-On Sentences", "run-ons"], ["Capitalization Rules", "capitalization"], ["Abbreviations", "abbreviations"], ["Numbers", "numbers"], ["Plurals", "plurals"]] },
  { name: "Punctuation", items: [["Comma", "comma"], ["Period / Full Stop", "period"], ["Colon", "colon"], ["Semicolon", "semicolon"], ["Apostrophe", "apostrophe"], ["Quotation Marks", "quotation-marks"], ["Hyphen and Dash", "dash-hyphen"], ["Ellipsis", "ellipsis"], ["Question & Exclamation Marks", "question-exclamation"]] }
];
var ALL_TOPICS = [];
SW.topicGroups.forEach(function (g) { g.items.forEach(function (t) { if (ALL_TOPICS.indexOf(t[0]) < 0) ALL_TOPICS.push(t[0]); }); });

var ROLES = ["subject", "verb", "object", "indirect object", "prepositional object", "complement", "adverbial", "modifier", "conjunction", "clause"];

/* Find the sentence(s) that the selection sits in */
SW.sentenceAt = function (text, start, end) {
  if (end - start > 0) {
    var sel = text.slice(start, end).trim();
    if (/[.!?]["')]?$/.test(sel) || sel.split(/\s+/).length > 25) return sel;
  }
  var s = start, e = end;
  while (s > 0 && !/[.!?\n]/.test(text[s - 1])) s--;
  while (e < text.length && !/[.!?\n]/.test(text[e])) e++;
  if (e < text.length && /[.!?]/.test(text[e])) e++;
  while (e < text.length && /["')\]]/.test(text[e])) e++;
  return text.slice(s, e).trim();
};

function key(s) { return s.trim().replace(/\s+/g, " ").toLowerCase(); }

SW.analyse = function (sentence, force, h) {
  var S = h.S(), k = key(sentence);
  S.analyses = S.analyses || {};
  if (!force && S.analyses[k]) return Promise.resolve({ data: S.analyses[k].data, saved: true, model: S.analyses[k].model });
  var sys = "You are an expert English grammar analyst helping an adult learner (level: " + S.settings.level + "). Analyse ONE sentence and reply with ONLY a JSON object, no markdown, in exactly this shape:\n" +
    '{"sentence": string (the sentence exactly as given),\n' +
    ' "parts": [{"text": string (exact substring of the sentence, usually the head word or a short phrase), "role": one of ' + JSON.stringify(ROLES) + ', "note": string (max 8 words, e.g. object of \\"for\\")}],\n' +
    ' "core": string (1-2 sentences naming the core pattern, e.g. subject + passive verb + prepositional complement),\n' +
    ' "type": "simple" | "compound" | "complex" | "compound-complex" | "fragment" | "run-on",\n' +
    ' "voice": "active" | "passive" | "mixed", "tense": string,\n' +
    ' "grammatical": boolean,\n' +
    ' "summary": string (2 sentences about the whole sentence),\n' +
    ' "topics": {TOPIC: {"s": "present" | "attention" | "checked" | "unused", "n": string (max 25 words, about THIS sentence)}} for EVERY topic in this list: ' + JSON.stringify(ALL_TOPICS) + ',\n' +
    ' "issues": [{"find": string (exact substring to replace), "replace": string, "why": string (one line), "topic": string from the topic list}],\n' +
    ' "better": string (a more natural, polished version; same meaning; empty if already ideal),\n' +
    ' "tip": string (one practical tip for using this pattern in speech or writing)}\n' +
    "Rules: parts must appear in sentence order, must not overlap, max 8 parts; always include the main subject and main verb. " +
    "Topic states: present = this feature is used correctly in the sentence; attention = there is an error or a likely improvement here; checked = a rule that was checked and is fine but is not a feature being used (e.g. Spell Check, Run-On Sentences); unused = not relevant to this sentence. " +
    "Be strict about Indian-English usages that sound unnatural to global readers (e.g. 'kindly do the needful', 'revert back', 'prepone') and mark them attention under Common Grammar Mistakes.";
  var msgs = [{ role: "system", content: sys }, { role: "user", content: sentence }];
  return h.ai(msgs, { json: true }).then(function (txt) {
    var d = parseJSON(txt);
    if (!d || !d.parts) throw new Error("The model's answer couldn't be read. Tap refresh to try again.");
    S = h.S();
    S.analyses = S.analyses || {};
    S.analyses[k] = { t: Date.now(), data: d, model: S.settings.model };
    var ks = Object.keys(S.analyses).sort(function (a, b) { return S.analyses[b].t - S.analyses[a].t; });
    ks.slice(150).forEach(function (x) { delete S.analyses[x]; });
    var att = ALL_TOPICS.filter(function (t) { return d.topics && d.topics[t] && d.topics[t].s === "attention"; });
    h.log("writing", "Sentence analysis · " + (d.type || "") + (att.length ? " · " + att.length + " to fix" : ""), sentence,
      "**Structure:** " + d.core + "\n" + (d.issues || []).map(function (i) { return "- \"" + i.find + "\" → \"" + i.replace + "\" (" + i.why + ")"; }).join("\n") + (d.better ? "\n**Better:** " + d.better : ""));
    return { data: d, saved: false, model: S.settings.model };
  });
};
function parseJSON(t) {
  try { return JSON.parse(t); } catch (e) {}
  var m = String(t).match(/\{[\s\S]*\}/); if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

/* ---------- rendering ---------- */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function roleClass(r) { return "r-" + String(r || "modifier").replace(/\s+/g, "-"); }

function diagram(sentence, parts) {
  /* locate each part in order; anything unlabelled stays plain */
  var segs = [], cur = 0, lower = sentence.toLowerCase();
  (parts || []).forEach(function (p) {
    if (!p || !p.text) return;
    var i = sentence.indexOf(p.text, cur); if (i < 0) i = lower.indexOf(p.text.toLowerCase(), cur);
    if (i < 0) return;
    if (i > cur) segs.push({ t: sentence.slice(cur, i) });
    segs.push({ t: sentence.slice(i, i + p.text.length), p: p });
    cur = i + p.text.length;
  });
  if (cur < sentence.length) segs.push({ t: sentence.slice(cur) });
  var n = 0;
  return '<div class="dg" role="img" aria-label="Sentence structure diagram">' + segs.map(function (s) {
    if (!s.p) return '<span class="dg-plain">' + esc(s.t).replace(/ /g, "&nbsp;").replace(/&nbsp;(?=\S)/g, " ") + "</span>";
    var up = n++ % 2 === 0, rc = roleClass(s.p.role);
    var lab = '<span class="dg-lab">' + esc(s.p.role) + "</span>";
    return '<span class="dg-part ' + rc + (up ? " up" : " down") + '" title="' + esc(s.p.role + (s.p.note ? ": " + s.p.note : "")) + '">' +
      (up ? lab + '<span class="dg-br"></span>' : "") + '<span class="dg-txt">' + esc(s.t) + "</span>" + (up ? "" : '<span class="dg-br"></span>' + lab) + "</span>";
  }).join("") + "</div>";
}

function chip(name, st, sel) {
  var s = (st && st.s) || "unused";
  var icon = s === "attention" ? "⚠ " : s === "checked" ? "✓ " : "";
  return '<button class="tp tp-' + s + (sel ? " sel" : "") + '" data-tp="' + esc(name) + '">' + icon + esc(name) + "</button>";
}

SW.openAnalysis = function (sentence, h, mount) {
  var panel = document.getElementById("anPanel");
  if (panel && mount && panel.parentNode !== mount) { panel.remove(); panel = null; }
  if (!panel) {
    panel = document.createElement("div"); panel.id = "anPanel"; if (mount) panel.className = "inline";
    panel.innerHTML = '<div class="an-scrim" data-anclose></div><aside class="an-sheet" role="dialog" aria-modal="true" aria-labelledby="anTitle"><header class="an-head"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg><h2 id="anTitle">Sentence analysis</h2><span class="an-model" id="anModel"></span><button class="icon-btn" id="anRefresh" aria-label="Analyse again"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/></svg></button><button class="icon-btn" data-anclose aria-label="Close"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header><div class="an-body" id="anBody"></div></aside>';
    (mount || document.body).appendChild(panel);
    panel.addEventListener("click", function (e) { if (e.target.closest("[data-anclose]")) SW.closeAnalysis(); });
    if (!mount) document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.getElementById("anPanel") && !panel.hidden) SW.closeAnalysis(); });
  }
  panel.hidden = false; if (!mount) document.body.classList.add("an-open");
  if (mount) setTimeout(function () { panel.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
  var body = document.getElementById("anBody");
  document.getElementById("anModel").textContent = h.S().settings.model;
  var state = { sel: "Sentence Structure" }, original = sentence;

  function load(force) {
    body.innerHTML = '<div class="an-card"><p class="an-quote">' + esc(sentence) + '</p></div><p class="muted an-wait">Analysing the sentence…</p>';
    if (!h.aiReady() && !(h.S().analyses || {})[key(sentence)]) return offline();
    SW.analyse(sentence, force, h).then(function (r) { render(r); }).catch(function (e) {
      body.innerHTML = '<div class="an-card"><p class="an-quote">' + esc(sentence) + '</p></div><div class="notice">' + esc(e.message) + "</div>";
      offline(true);
    });
  }
  document.getElementById("anRefresh").onclick = function () { if (!h.aiReady()) { h.toast("Sentence analysis needs AI and a connection."); return; } load(true); };

  function offline(append) {
    var r = h.check(sentence);
    var html = (append ? "" : '<div class="an-card"><p class="an-quote">' + esc(sentence) + "</p></div>") +
      '<div class="notice info">Full structure analysis needs the AI coach and a connection' + (h.S().settings.apiKey ? "" : ' (add your key in Settings)') + ". Here is the offline check for this sentence.</div>" +
      (r.issues.length ? r.issues.map(function (i) { return '<div class="issue"><span class="k">' + i[0] + "</span><span>" + esc(i[1]) + "</span></div>"; }).join("") : '<p class="muted">No issues found by the offline checker.</p>');
    if (append) body.insertAdjacentHTML("beforeend", html); else body.innerHTML = html;
  }

  function render(r) {
    var d = r.data, T = d.topics || {};
    document.getElementById("anModel").textContent = r.model || h.S().settings.model;
    var roles = (d.parts || []).map(function (p) { return '<div class="an-role"><span class="' + roleClass(p.role) + ' an-rn">' + esc(p.role) + '</span><span>“' + esc(p.text) + '”' + (p.note ? ' <span class="muted">— ' + esc(p.note) + "</span>" : "") + "</span></div>"; }).join("");
    var issues = (d.issues || []).filter(function (i) { return i && i.find; });
    var html =
      '<div class="an-card">' + diagram(d.sentence || sentence, d.parts) + "</div>" +
      '<div id="anFocus"></div>' +
      (issues.length ? '<div class="an-sec"><h3 class="eyebrow">Fix this</h3>' + issues.map(function (i, n) {
        return '<div class="an-fix"><div><span class="bad">' + esc(i.find) + '</span> → <b class="good">' + esc(i.replace) + '</b><p class="muted small">' + esc(i.why) + (i.topic ? " · " + esc(i.topic) : "") + '</p></div><button class="btn sm" data-fix="' + n + '">Apply</button></div>';
      }).join("") + "</div>" : "") +
      (d.better && key(d.better) !== key(sentence) ? '<div class="an-sec"><h3 class="eyebrow">More natural</h3><div class="an-better"><p>' + esc(d.better) + '</p><div class="row"><button class="btn sm" data-say="' + esc(d.better) + '">Hear it</button><button class="btn sm" id="anUse">Use this sentence</button></div></div></div>' : "") +
      (issues.length || (d.better && key(d.better) !== key(sentence)) ? '<div class="row"><button class="btn" id="anNote">Open this draft\'s note</button><span class="muted small">Every fix you apply is saved to one note for this draft, with your version and the correction side by side.</span></div>' : "") +
      '<div class="an-sec"><h3 class="eyebrow">Whole sentence</h3><div class="row tight">' +
      [d.type, d.voice && d.voice !== "active" ? d.voice + " voice" : null, d.tense, ALL_TOPICS.filter(function (t) { return T[t] && (T[t].s === "present" || T[t].s === "attention"); }).length + " topics in this sentence", r.saved ? "saved analysis" : null, d.grammatical === false ? "has errors" : null]
        .filter(Boolean).map(function (x) { return '<span class="an-tag' + (x === "has errors" ? " bad" : "") + '">' + esc(x) + "</span>"; }).join("") +
      '</div><p>' + esc(d.summary || "") + "</p>" + (d.tip ? '<p class="why">' + esc(d.tip) + "</p>" : "") + "</div>" +
      '<div class="an-legend">' + chip("present", { s: "present" }) + chip("needs attention", { s: "attention" }) + chip("checked", { s: "checked" }) + chip("not used", { s: "unused" }) + "</div>" +
      SW.topicGroups.map(function (g) { return '<div class="an-sec"><h3 class="eyebrow">' + g.name + '</h3><div class="row tight">' + g.items.map(function (t) { return chip(t[0], T[t[0]], t[0] === state.sel); }).join("") + "</div></div>"; }).join("");
    body.innerHTML = html;
    $$(".an-legend .tp", body).forEach(function (b) { b.disabled = true; });
    function focus() {
      var t = state.sel, st = T[t] || { s: "unused", n: "" }, lesson = null;
      SW.topicGroups.forEach(function (g) { g.items.forEach(function (x) { if (x[0] === t) lesson = x[1]; }); });
      var head = t === "Sentence Structure" ? '<p>' + esc(d.core || "") + "</p>" + roles : "<p>" + esc(st.n || (st.s === "unused" ? "Not used in this sentence." : "")) + "</p>";
      document.getElementById("anFocus").innerHTML = '<div class="an-sec"><div class="row" style="justify-content:space-between"><h3>' + esc(t) + '</h3><span class="tp tp-' + st.s + '" aria-hidden="true">' + { present: "present", attention: "⚠ needs attention", checked: "✓ checked", unused: "not used" }[st.s] + "</span></div>" + head +
        (lesson ? '<details class="an-about"><summary>About ' + esc(t.toLowerCase()) + "</summary>" + aboutLesson(lesson) + '<button class="btn sm" data-lesson="' + lesson + '" style="margin-top:8px">Open the full lesson</button></details>' : "") + "</div>";
    }
    focus();
    $$("[data-tp]", body).forEach(function (b) {
      if (b.closest(".an-legend")) return;
      b.onclick = function () { state.sel = b.getAttribute("data-tp"); $$("[data-tp]", body).forEach(function (x) { x.classList.toggle("sel", x.getAttribute("data-tp") === state.sel); }); focus(); document.getElementById("anFocus").scrollIntoView({ behavior: "smooth", block: "nearest" }); };
    });
    body.onclick = function (e) {
      var f = e.target.closest("[data-fix]"), l = e.target.closest("[data-lesson]");
      if (f) { var i = issues[+f.getAttribute("data-fix")]; if (h.replace(i.find, i.replace, sentence, i.why, i.topic)) { f.textContent = "Applied ✓"; f.disabled = true; sentence = sentence.split(i.find).join(i.replace); } else h.toast("Couldn't find that text in your draft. It may have changed."); }
      if (l) { SW.closeAnalysis(); location.hash = "lesson~" + l.getAttribute("data-lesson"); }
    };
    var nb = document.getElementById("anNote");
    if (nb) nb.onclick = function () { h.saveNote(); };
    var use = document.getElementById("anUse");
    if (use) use.onclick = function () { if (h.replace(sentence, d.better, null, "More natural wording")) { use.textContent = "Replaced ✓"; use.disabled = true; sentence = d.better; } else h.toast("Couldn't find the original sentence in your draft."); };
  }
  function aboutLesson(id) {
    var l = SW.lessons.filter(function (x) { return x.id === id; })[0];
    if (!l) return "";
    return '<p class="muted small" style="margin-top:6px">' + l.summary + '</p><ul class="points small" style="margin-top:6px">' + l.points.slice(0, 3).map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>";
  }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  load(false);
};
SW.closeAnalysis = function () { var p = document.getElementById("anPanel"); if (p) p.hidden = true; document.body.classList.remove("an-open"); };
})();
