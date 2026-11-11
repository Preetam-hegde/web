'use strict';

/* The same ordered manifest powers startup and the offline shell. The dictionary is cached on demand. */
importScripts('./js/manifest.js?v=30');
const CACHE = `faceoff-v${FACEOFF_VERSION}`;
const SHELL = [
	'./',
	'index.html',
	...[
		'js/manifest.js',
		'js/boot.js',
		...FACEOFF_SCRIPTS,
		...FACEOFF_STYLES,
	].map((path) => `${path}?v=${FACEOFF_VERSION}`),
];

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches
			.open(CACHE)
			.then((c) => c.addAll(SHELL))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((k) => k.startsWith('faceoff-') && k !== CACHE)
						.map((k) => caches.delete(k)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);
	if (e.request.method !== 'GET' || url.origin !== location.origin) return; // fonts and analytics go straight to the network
	if (e.request.mode === 'navigate') {
		// the page itself: network first, so fixes apply at once; the cache is the offline fallback
		e.respondWith(
			fetch(e.request)
				.then((res) => {
					if (res.ok)
						caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
					return res;
				})
				.catch(() =>
					caches
						.match(e.request)
						.then((hit) => hit || caches.match('index.html')),
				),
		);
		return;
	}
	e.respondWith(
		caches.open(CACHE).then(async (cache) => {
			const hit = await cache.match(e.request);
			const fresh = fetch(e.request)
				.then((res) => {
					if (res.ok) cache.put(e.request, res.clone());
					return res;
				})
				.catch(() => hit);
			return hit || fresh;
		}),
	);
});
