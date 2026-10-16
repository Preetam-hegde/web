'use strict';

/* Caching for Faceoff (this folder only). The app shell is stored on install, and everything else on this
   origin (including the 1.4 MB word list) is stored the first time it's fetched. Pages are served from the
   cache and refreshed in the background, so an update shows up on the next visit.
   Bump CACHE when a release must replace everything at once. */
const CACHE = 'faceoff-v1';
const SHELL = [
	'./', 'index.html', 'styles.css',
	'js/core.js', 'js/extras.js', 'js/words.js', 'js/kb.js', 'js/fx.js', 'js/main.js',
	'js/games/timer.js', 'js/games/reaction.js', 'js/games/cut.js', 'js/games/wordle.js',
	'js/games/anagram.js', 'js/games/bomb.js', 'js/games/hangman.js', 'js/games/quiz.js',
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
