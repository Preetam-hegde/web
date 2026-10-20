'use strict';

/* Caching for Faceoff (this folder only). The app shell is stored on install, and everything else on this
   origin (including the 1.4 MB word list) is stored the first time it's fetched. Scripts and styles are served from the
   cache and refreshed in the background (the version in their URL forces a new copy when a release changes them); the page itself is network first.
   Bump CACHE when a release must replace everything at once. */
const CACHE = 'faceoff-v12';
const SHELL = [
	'./', 'index.html', 'styles.css?v=12',
	'js/core.js?v=12', 'js/extras.js?v=12', 'js/words.js?v=12', 'js/fx.js?v=12', 'js/main.js?v=12',
	'js/games/timer.js?v=12', 'js/games/reaction.js?v=12', 'js/games/cut.js?v=12',
	'js/games/hangman.js?v=12', 'js/games/couple.js?v=12', 'js/games/quiz.js?v=12', 'js/games/duo.js?v=12', 'js/party.js?v=12', 'js/spy.js?v=12',
];

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
	e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);
	if (e.request.method !== 'GET' || url.origin !== location.origin) return; // fonts and analytics go straight to the network
	if (e.request.mode === 'navigate') { // the page itself: network first, so fixes apply at once; the cache is the offline fallback
		e.respondWith(fetch(e.request).then((res) => {
			if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
			return res;
		}).catch(() => caches.match(e.request).then((hit) => hit || caches.match('index.html'))));
		return;
	}
	e.respondWith(caches.open(CACHE).then(async (cache) => {
		const hit = await cache.match(e.request);
		const fresh = fetch(e.request).then((res) => {
			if (res.ok) cache.put(e.request, res.clone());
			return res;
		}).catch(() => hit);
		return hit || fresh;
	}));
});
