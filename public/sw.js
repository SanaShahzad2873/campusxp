// CampusXP service worker: pages are network-first (so new deployments show up immediately),
// hashed build assets and icons are cache-first (safe, they never change under the same URL).
const CACHE = 'campusxp-v2';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.json', '/icon.svg'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url); if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  const keep = (r) => { if (r.ok) { const cl = r.clone(); caches.open(CACHE).then((c) => c.put(req, cl)); } return r; };
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(keep).catch(() => caches.match(req).then((h) => h || caches.match('/')))); return; }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(keep)));
});
