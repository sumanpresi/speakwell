/* Speakwell service worker: caches the app so it works offline */
const CACHE = "speakwell-v20";
const CORE = ["./", "index.html", "app.js", "data-grammar.js", "data-speak.js", "data-write.js", "analysis.js", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png", "spoken-english.html", "sentence-sketchbook.html"];
self.addEventListener("install", e => {
  // cache each file on its own so one failure can't block installing the app
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.origin === location.origin) {
    // network first for pages so updates show straight away; cache when offline
    if (req.mode === "navigate") {
      e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return res; })
        .catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  } else if (/fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; }).catch(() => new Response("", { status: 404 }))));
  }
});
