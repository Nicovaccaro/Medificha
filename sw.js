const CACHE = 'medificha-v3';
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
  // Para HTML, manifest e iconos: red primero, caché como fallback
  const url = e.request.url;
  if (url.endsWith('.html') || url.includes('manifest.json') || url.includes('icon-')) {
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
