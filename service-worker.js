const CACHE_NAME = "kmpro-v2";
const OFFLINE_URL = "/kmpro/index.html";

const ASSETS = [
  "/kmpro/",
  "/kmpro/index.html",
  "/kmpro/icon-512.png",
  "/kmpro/icon-192.png",
];

// INSTALL → cache de base
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE → nettoyage anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH → stratégie intelligente
self.addEventListener("fetch", event => {
  const request = event.request;

  // HTML → network first (évite UI cassée)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(res => res || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Autres fichiers → cache first
  event.respondWith(
    caches.match(request).then(response => {
      return (
        response ||
        fetch(request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    })
  );
});
