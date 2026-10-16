'use strict';

/* Caching for Faceoff (this folder only). The app shell is stored on install, and everything else on this
   origin (including the 1.4 MB word list) is stored the first time it's fetched. Pages are served from the
   cache and refreshed in the background, so an update shows up on the next visit.
   Bump CACHE when a release must replace everything at once. */
const CACHE = 'faceoff-v3';
const SHELL = [
	'./', 'index.html', 'styles.css?v=3',
	'js/core.js?v=3', 'js/extras.js?v=3', 'js/words.js?v=3', 'js/kb.js?v=3', 'js/fx.js?v=3', 'js/main.js?v=3',
	'js/games/timer.js?v=3', 'js/games/reaction.js?v=3', 'js/games/cut.js?v=3', 'js/games/wordle.js?v=3',
	'js/games/anagram.js?v=3', 'js/games/bomb.js?v=3', 'js/games/hangman.js?v=3', 'js/games/quiz.js?v=3',
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
	e.respondWith(caches.open(CACHE).then(async (cache) => {
		const hit = await cache.match(e.request);
		const fresh = fetch(e.request).then((res) => {
			if (res.ok) cache.put(e.request, res.clone());
			return res;
		}).catch(() => hit);
		return hit || fresh;
	}));
});
