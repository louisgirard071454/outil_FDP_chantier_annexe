/* Service Worker — Ineo Chantier (offline-first sur GitHub Pages).
   À déployer À CÔTÉ du fichier index.html (même dossier).
   Stratégie : cache-first avec mise en cache à la volée des fichiers visités,
   pour que l'application reste utilisable hors-ligne après une première visite. */
const CACHE = 'ineo-chantier-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                      // ne pas toucher aux requêtes de synchro (POST)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // ne pas cacher les appels au serveur de synchro

  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;                          // cache d'abord, réseau en secours
    })
  );
});
