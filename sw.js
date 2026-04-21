const CACHE = 'medificha-v2';
const FILES = [
  './MediFicha_v70_pwa.html',
  './manifest.json',
  './icon-192-1.png',
  './icon-512-1.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Red primero para manifest e iconos (para tomar cambios rápido), caché como fallback
  const url = e.request.url;
  if (url.includes('manifest.json') || url.includes('icon-')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Caché primero para el resto
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
