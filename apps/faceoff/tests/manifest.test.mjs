'use strict';

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function readSource(name) {
	const path = new URL(`../${name}`, import.meta.url);
	assert(existsSync(path), `${name} must exist`);
	return readFileSync(path, 'utf8');
}

function manifest() {
	const context = vm.createContext({ module: { exports: {} } });
	vm.runInContext(readSource('js/manifest.js'), context);
	return context.module.exports;
}

function loader(paths = ['js/registry.js', 'js/games/timer.js', 'js/main.js']) {
	const inserted = [],
		listeners = new Map();
	const body = {
		dataset: {},
		children: [],
		replaceChildren(...children) {
			this.children = children;
		},
	};
	const document = {
		body,
		baseURI: 'http://localhost/apps/faceoff/index.html',
		createElement(tag) {
			return {
				tagName: tag.toUpperCase(),
				style: {},
				append(...children) {
					this.children = children;
				},
				setAttribute() {},
				focus() {},
			};
		},
		head: {
			append(script) {
				inserted.push(script);
			},
		},
	};
	const window = {
		location: { reload() {} },
		addEventListener(type, handler) {
			listeners.set(type, handler);
		},
		removeEventListener(type) {
			listeners.delete(type);
		},
	};
	const context = vm.createContext({
		document,
		window,
		URL,
		FACEOFF_VERSION: 29,
		FACEOFF_SCRIPTS: paths,
	});
	vm.runInContext(readSource('js/boot.js'), context);
	return { inserted, body, window, listeners };
}

test('the shared manifest preserves dependency order and lists every local shell asset', () => {
	const { FACEOFF_VERSION, FACEOFF_SCRIPTS, FACEOFF_STYLES } = manifest();
	assert(Number.isInteger(FACEOFF_VERSION) && FACEOFF_VERSION > 0);
	assert.equal(new Set(FACEOFF_SCRIPTS).size, FACEOFF_SCRIPTS.length);
	for (const [before, after] of [
		['js/registry.js', 'js/core.js'],
		['js/rules.js', 'js/core.js'],
		['js/arcade-rules.js', 'js/games/arcade.js'],
		['js/cup-rules.js', 'js/cup.js'],
		['js/runtime.js', 'js/core.js'],
		['js/core.js', 'js/game-ui.js'],
		['js/question-deck.js', 'js/games/quiz.js'],
		['js/games/more.js', 'js/games/match.js'],
		['js/party.js', 'js/spy.js'],
		['js/group.js', 'js/main.js'],
		['js/ui/settings.js', 'js/main.js'],
		['js/ui/history.js', 'js/main.js'],
	]) {
		assert(FACEOFF_SCRIPTS.indexOf(before) >= 0, `${before} must be listed`);
		assert(
			FACEOFF_SCRIPTS.indexOf(before) < FACEOFF_SCRIPTS.indexOf(after),
			`${before} must run before ${after}`,
		);
	}
	assert.equal(FACEOFF_SCRIPTS.at(-1), 'js/main.js');
	for (const path of [...FACEOFF_SCRIPTS, ...FACEOFF_STYLES]) {
		assert(
			existsSync(new URL(`../${path}`, import.meta.url)),
			`${path} must resolve locally`,
		);
	}
	assert.deepEqual(Array.from(FACEOFF_STYLES), [
		'styles.css',
		'css/base.css',
		'css/play.css',
		'css/party.css',
		'css/theme.css',
		'css/instruments.css',
		'css/boards.css',
		'css/match.css',
		'css/arcade.css',
		'css/cup.css',
		'css/lobby.css',
		'css/responsive.css',
	]);
});

test('boot requests dependencies together in execution order and starts the UI after all succeed', async () => {
	const boot = loader();
	assert.deepEqual(
		boot.inserted.map((script) => script.src),
		['js/registry.js?v=29', 'js/games/timer.js?v=29'],
	);
	assert(boot.inserted.every((script) => script.async === false));
	boot.inserted[1].onload();
	await Promise.resolve();
	assert.equal(boot.inserted.length, 2);
	boot.inserted[0].onload();
	await new Promise(setImmediate);
	assert.equal(boot.inserted[2].src, 'js/main.js?v=29');
	boot.inserted[2].onload();
	await boot.window.faceoffReady;
});

test('a missing dependency blocks main and exposes a reload action', async () => {
	const boot = loader();
	boot.inserted[0].onerror();
	await assert.rejects(boot.window.faceoffReady, /registry/);
	await Promise.resolve();
	assert.equal(boot.inserted.length, 2);
	assert.equal(boot.body.dataset.screen, 'error');
	const error = boot.body.children[0];
	assert.equal(error.id, 'bootError');
	assert.equal(error.children.at(-1).textContent, 'Reload');
	assert.equal(typeof error.children.at(-1).onclick, 'function');
});

test('an exception inside a downloaded script rejects readiness and blocks the UI', async () => {
	const boot = loader();
	boot.listeners.get('error')({
		filename: 'http://localhost/apps/faceoff/js/registry.js?v=29',
		message: 'Invalid registration',
	});
	await assert.rejects(boot.window.faceoffReady, /Invalid registration/);
	assert.equal(boot.body.dataset.screen, 'error');
	assert.equal(boot.inserted.length, 2);
});

test('page, imported styles and worker request the same manifest release', () => {
	const { FACEOFF_VERSION, FACEOFF_STYLES } = manifest();
	const page = readSource('index.html');
	const requests = [
		...page.matchAll(/(?:src|href)=["']([^"']+\?v=\d+)["']/g),
	].map((match) => match[1]);
	for (const path of ['js/manifest.js', 'js/boot.js', 'styles.css'])
		assert(requests.includes(`${path}?v=${FACEOFF_VERSION}`));
	const imports = [
		...readSource('styles.css').matchAll(/url\(["']?([^"')]+)["']?\)/g),
	].map((match) => match[1]);
	assert.deepEqual(
		imports.sort(),
		Array.from(FACEOFF_STYLES)
			.filter((path) => path !== 'styles.css')
			.map((path) => `${path}?v=${FACEOFF_VERSION}`)
			.sort(),
	);
	assert(readSource('sw.js').includes(`manifest.js?v=${FACEOFF_VERSION}`));
});
