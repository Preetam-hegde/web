'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { FACEOFF_VERSION, FACEOFF_STYLES } = require('../js/manifest.js');

(async () => {
	const browser = await chromium.launch({
		channel: process.env.FACEOFF_BROWSER_CHANNEL || undefined,
	});
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.route(/fonts\.googleapis|fonts\.gstatic|gc\.zgo/, (route) =>
			route.abort(),
		);
		await page.goto(
			process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/',
		);
		await page.evaluate(async () => {
			await faceoffReady;
			await navigator.serviceWorker.ready;
			await loadWords();
		});
		await page.reload();
		await page.waitForFunction(() => !!navigator.serviceWorker.controller);
		await page.evaluate(async () => {
			await faceoffReady;
			await loadWords();
		});
		await page.waitForFunction(
			async () => !!(await caches.match('data/words.txt')),
		);
		const before = await page.evaluate(() => ({
			games: GAMES.length,
			party: PARTY.length,
		}));
		await context.setOffline(true);
		await page.reload();
		const after = await page.evaluate(async () => {
			await faceoffReady;
			await loadWords();
			const imports = [...document.styleSheets]
				.filter(
					(sheet) =>
						!sheet.href || new URL(sheet.href).origin === location.origin,
				)
				.flatMap((sheet) => [...sheet.cssRules])
				.filter((rule) => rule.type === CSSRule.IMPORT_RULE);
			return {
				games: GAMES.length,
				party: PARTY.length,
				words: WORDS.valid.size,
				caches: await caches.keys(),
				styles: imports.length,
				loadedStyles: imports.every(
					(rule) => rule.styleSheet?.cssRules.length > 0,
				),
				arcade: ['stack', 'golf'].every((id) =>
					GAMES.some((game) => game.id === id),
				),
			};
		});
		assert.equal(after.games, before.games);
		assert.equal(after.party, before.party);
		assert(after.words > 100000 && after.arcade && after.loadedStyles);
		assert.equal(after.styles, FACEOFF_STYLES.length - 1);
		assert(after.caches.includes(`faceoff-v${FACEOFF_VERSION}`));
		await page.evaluate(() => startCup('mixed', true));
		assert.equal(await page.evaluate(() => cup.games.length), 5);
		assert.deepEqual(errors, []);
		console.log(
			`PASS: offline v${FACEOFF_VERSION}, ${after.games} games, ${after.party} party games, ${after.styles} styles, dictionary and Cup startup`,
		);
	} finally {
		await browser.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
