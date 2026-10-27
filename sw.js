/* Speakwell service worker: caches the app so it works offline */
const CACHE = "speakwell-v6";
const CORE = ["./", "index.html", "app.js", "data-grammar.js", "data-speak.js", "data-write.js", "analysis.js", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;                       // AI calls (POST) always go to the network
  if (url.hostname.includes("openai") || url.pathname.includes("/v1/")) return;
  if (url.origin === location.origin) {
    // app files: serve from cache instantly, refresh in background
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone())); return res; }).catch(() => hit || caches.match("index.html"));
      return hit || net;
    }));
  } else if (/fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { caches.open(CACHE).then(c => c.put(req, res.clone())); return res; }).catch(() => new Response("", { status: 404 }))));
  }
});
