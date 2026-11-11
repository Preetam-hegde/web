'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/';
const output = process.env.FACEOFF_OUTPUT || '/tmp/faceoff-qa';

(async () => {
	const browser = await chromium.launch({
		channel: process.env.FACEOFF_BROWSER_CHANNEL || undefined,
	});
	try {
		const context = await browser.newContext({
			viewport: { width: 390, height: 844 },
			serviceWorkers: 'block',
			reducedMotion: 'reduce',
		});
		const page = await context.newPage(),
			errors = [];
		page.setDefaultTimeout(3000);
		page.on('pageerror', (error) => errors.push(error.message));
		await page.route(/fonts\.google|gc\.zgo/, (route) => route.abort());
		await page.goto(base);
		await page.evaluate(() => window.faceoffReady);
		assert.equal(await page.locator('[data-quick]').count(), 1);
		assert(await page.locator('[data-quick]').isVisible());
		await page.locator('[data-mode="solo"]').click();
		await page.locator('[data-quick]').click();
		assert(await page.evaluate(() => m?.solo));
		assert.equal(
			await page.locator('#pane0 .stage').getAttribute('data-phase'),
			'ready',
		);
		await page.evaluate(() => toHub());
		await page.locator('#hubBack').click();
		await page.locator('[data-mode="two"]').click();
		await page.locator('[data-mode="phone"]').click();
		await page.locator('[data-quick]').click();
		assert(await page.evaluate(() => m && !m.solo));
		assert.equal(
			await page.locator('#pane0 .stage').getAttribute('data-phase'),
			'ready',
		);
		await page.evaluate(() => {
			toHub();
			window.cupCalls = [];
			startCup = (id, isSolo) => cupCalls.push([id, isSolo]);
		});
		await page.locator('[data-cup="mixed"]').click();
		assert.deepEqual(await page.evaluate(() => cupCalls), [['mixed', false]]);
		await page.locator('[data-browse]').click();
		await page.locator('[data-go="timing"]').click();
		assert(await page.locator('[data-game="stop"]').isVisible());
		await page.locator('#hubBack').click();
		assert(await page.locator('#cats').isVisible());
		await page.locator('#hubBack').click();
		assert(await page.locator('[data-quick]').isVisible());
		await page.locator('#hubBack').click();
		await page.locator('[data-room-setup="online"]').click();
		assert(await page.locator('[data-a="create"]').isVisible());
		assert.equal(
			await page.evaluate(() => net),
			null,
			'room setup never auto-connects',
		);
		await page.locator('#hubBack').click();
		await page.locator('#hubBack').click();
		await page.locator('[data-mode="three"]').click();
		await page.locator('[data-mode="party"]').click();
		assert(await page.locator('[data-party]').first().isVisible());
		await page.locator('#hubBack').click();
		await page.locator('[data-mode="group"]').click();
		assert(await page.locator('[data-a="gcreate"]').isVisible());
		await page.evaluate(() => {
			go('session', { mode: 'phone' });
			store.history.push({ g: 'stop', t: Date.now() });
			renderHub();
		});
		await page.locator('.recent-games [data-launch="stop"]').click();
		assert.equal(await page.evaluate(() => m.game.id), 'stop');
		for (const id of ['stack', 'golf']) {
			await page.evaluate(() => toHub());
			await page.locator(`.fast-game[data-launch="${id}"]`).click();
			assert.equal(await page.evaluate(() => m.game.id), id);
		}
		await page.evaluate(() => {
			toHub();
			grp = {
				role: 'host',
				me: 0,
				names: ['A', 'B', 'C'],
				gone: [],
				board: { rows: [] },
			};
			grStart = (game) => {
				window.groupPick = game.id;
			};
			go('session', { mode: 'group' });
			startQuickMatch();
		});
		assert(
			await page.evaluate(() =>
				groupOk(GAMES.find((game) => game.id === groupPick)),
			),
		);
		await page.evaluate(() => {
			grp = null;
		});
		await page.evaluate(() => {
			go('session', { mode: 'solo' });
			store.sound = false;
		});
		const picks = await page.evaluate(() => {
			const picks = [];
			for (let i = 0; i < 30; i++) {
				startQuickMatch();
				picks.push({
					id: m.game.id,
					solo: m.solo,
					duel: !!m.game.duel,
					coop: !!m.game.coop,
				});
				toHub();
			}
			return picks;
		});
		assert(
			picks.every(
				(pick) => pick.solo && !pick.duel && !pick.coop && pick.id !== 'pitch',
			),
		);
		assert(picks.every((pick, i) => !i || pick.id !== picks[i - 1].id));
		await page.evaluate(() => {
			mode = 'online';
			net = {
				role: 'guest',
				me: 1,
				names: ['Host', 'Guest'],
				board: { rows: [] },
				send() {},
			};
			go('session');
		});
		assert(await page.locator('[data-quick]').isDisabled());
		assert(await page.locator('[data-cup="mixed"]').isDisabled());
		await page.evaluate(() =>
			launchGame(GAMES.find((game) => game.id === 'stop')),
		);
		assert.equal(
			await page.evaluate(() => m),
			null,
			'guest sees rules without starting',
		);
		assert(await page.locator('#rules').isVisible());
		await page.locator('#rules button').click();
		await page.evaluate(() => {
			net = null;
			go('home', { mode: 'solo' });
		});
		await page.reload();
		await page.evaluate(() => window.faceoffReady);
		assert.equal(
			await page.evaluate(() => mode),
			'solo',
			'same-device preference survives reload',
		);
		assert(await page.locator('[data-quick]').isVisible());
		fs.mkdirSync(output, { recursive: true });
		for (const viewport of [
			{ width: 390, height: 844 },
			{ width: 320, height: 568 },
			{ width: 844, height: 390 },
			{ width: 1440, height: 1000 },
		]) {
			await page.setViewportSize(viewport);
			await page.reload();
			await page.evaluate(() => window.faceoffReady);
			assert(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth,
				),
				'lobby fits viewport',
			);
			await page.screenshot({
				path: `${output}/lobby-${viewport.width}.png`,
				fullPage: true,
				animations: 'disabled',
			});
		}
		for (const [query, expectedMode, selector] of [
			['join=ABCD', 'online', '[data-a="accept"]'],
			['room=EFGH', 'group', '[data-a="gaccept"]'],
		]) {
			const invitePage = await context.newPage();
			await invitePage.goto(`${base}?${query}`);
			await invitePage.evaluate(() => window.faceoffReady);
			assert.equal(await invitePage.evaluate(() => mode), expectedMode);
			assert(await invitePage.locator(selector).isVisible());
			assert(await invitePage.evaluate(() => !net && !grp));
			await invitePage.close();
		}
		assert.deepEqual(errors, []);
		console.log(
			'Lobby: fast solo/phone starts, Cup entry, Browse/back, rooms, muted Quick Match, guest authority, preference and responsive screenshots passed.',
		);
	} finally {
		await browser.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
