const CACHE_NAME = "kmpro-v1";

const FILES_TO_CACHE = [
	"/",
	"/index.html",
	"/manifest.json",
	"/icon-192.png",
	"/icon-512.png",
];

self.addEventListener("install", (e) => {
	self.skipWaiting();
	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(FILES_TO_CACHE);
		}),
	);
});

self.addEventListener("activate", (e) => {
	e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
	e.respondWith(
		caches.match(e.request).then((response) => {
			return response || fetch(e.request);
		}),
	);
});
