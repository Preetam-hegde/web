'use strict';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const { FACEOFF_VERSION, FACEOFF_SCRIPTS, FACEOFF_STYLES } = createRequire(
	import.meta.url,
)('../js/manifest.js');

function worker() {
	const handlers = {},
		removed = [],
		added = [],
		stored = [],
		fetched = [];
	let context;
	const cache = {
		addAll: async (paths) => added.push(...paths),
		match: async () => undefined,
		put: async (request) => stored.push(request.url),
	};
	context = vm.createContext({
		URL,
		location: { origin: 'http://localhost' },
		self: {
			addEventListener: (event, handler) => {
				handlers[event] = handler;
			},
			clients: { claim() {} },
			skipWaiting() {},
		},
		importScripts: (path) =>
			vm.runInContext(
				readFileSync(
					new URL(`../${path.split('?')[0]}`, import.meta.url),
					'utf8',
				),
				context,
			),
		caches: {
			keys: async () => [
				'faceoff-old',
				`faceoff-v${FACEOFF_VERSION - 1}`,
				`faceoff-v${FACEOFF_VERSION}`,
				'another-app-v1',
			],
			delete: async (key) => removed.push(key),
			open: async () => cache,
		},
		fetch: async (request) => {
			fetched.push(request.url);
			return {
				ok: true,
				clone() {
					return this;
				},
			};
		},
	});
	vm.runInContext(
		readFileSync(new URL('../sw.js', import.meta.url), 'utf8'),
		context,
	);
	return {
		removed,
		added,
		stored,
		fetched,
		async dispatch(type, extra = {}) {
			let pending;
			handlers[type]({
				...extra,
				waitUntil: (promise) => {
					pending = promise;
				},
				respondWith: (promise) => {
					pending = promise;
				},
			});
			await pending;
		},
	};
}

test('updating Faceoff preserves the current cache and other apps’ offline caches', async () => {
	const sw = worker();
	await sw.dispatch('activate');
	assert.deepEqual(sw.removed, [
		'faceoff-old',
		`faceoff-v${FACEOFF_VERSION - 1}`,
	]);
});

test('install caches the manifest, loader, split modules and every stylesheet at the same version', async () => {
	const sw = worker();
	await sw.dispatch('install');
	for (const path of [
		'js/manifest.js',
		'js/boot.js',
		...FACEOFF_SCRIPTS,
		...FACEOFF_STYLES,
	]) {
		assert(
			sw.added.includes(`${path}?v=${FACEOFF_VERSION}`),
			`${path} must work offline`,
		);
	}
	assert.equal(new Set(sw.added).size, sw.added.length);
	assert(!sw.added.some((path) => path.includes('data/words.txt')));
});

test('the large dictionary is fetched and cached only when a game asks for it', async () => {
	const sw = worker();
	await sw.dispatch('install');
	assert.equal(sw.fetched.length, 0);
	const request = {
		method: 'GET',
		mode: 'cors',
		url: 'http://localhost/apps/faceoff/data/words.txt',
	};
	await sw.dispatch('fetch', { request });
	assert.deepEqual(sw.fetched, [request.url]);
	assert.deepEqual(sw.stored, [request.url]);
});
