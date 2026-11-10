// Service Worker — cache aset statis (stale-while-revalidate). Naikkan VERSI tiap rilis agar cache lama dibuang.
const VERSI = 'soal-ai-v2';
const ASET = ['./', './index.html', './css/style.css', './js/config.js', './js/app.js', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSI).then(c => c.addAll(ASET))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSI).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.hostname.includes('google.com') && !u.hostname.includes('fonts')) return; // API GAS tidak pernah di-cache
  e.respondWith(caches.open(VERSI).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok && (u.origin === location.origin || u.hostname.includes('gstatic') || u.hostname.includes('googleapis'))) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
