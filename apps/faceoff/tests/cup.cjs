'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch({
		channel: process.env.FACEOFF_BROWSER_CHANNEL || undefined,
	});
	try {
		const page = await browser.newPage({
			viewport: { width: 390, height: 844 },
			serviceWorkers: 'block',
			reducedMotion: 'reduce',
		});
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.route(/fonts\.googleapis|fonts\.gstatic|gc\.zgo/, (route) =>
			route.abort(),
		);
		await page.goto(
			process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/',
		);
		await page.evaluate(() => faceoffReady);
		assert.equal(
			await page.evaluate(() => typeof startCup),
			'function',
			'Cup entry point exists',
		);
		await page.clock.install();
		await page.clock.pauseAt(new Date());
		const output = process.env.FACEOFF_OUTPUT || '/tmp/faceoff-qa';
		fs.mkdirSync(output, { recursive: true });
		const count = async () => {
			for (let i = 0; i < 4; i++) await page.clock.fastForward(700);
		};
		const ready = async () => {
			await page.evaluate(() =>
				(m.pass ? [0] : [0, 1]).forEach((p) => $('button', stageOf(p)).click()),
			);
			await count();
		};
		for (const kind of ['solo', 'split', 'pass']) {
			await page.evaluate((kind) => {
				toHub();
				store.history = [];
				store.plays = {};
				store.best = {};
				store.mode = kind === 'solo' ? 'pass' : kind;
				mode = kind === 'solo' ? 'solo' : 'phone';
				startCup('mixed', kind === 'solo');
			}, kind);
			for (let leg = 0; leg < 5; leg++) {
				await ready();
				await page.evaluate(() => makeCtx(0).done(10, '10'));
				if (kind !== 'solo') {
					if (kind === 'pass') {
						await page.evaluate(() => $('button', stageOf(1)).click());
						await count();
					}
					await page.evaluate(() => makeCtx(1).done(20, '20'));
				}
				assert.equal(await page.evaluate(() => cup.legs.length), leg + 1);
				assert.equal(
					await page.evaluate(() => cup.phase),
					leg === 4 ? 'complete' : 'break',
				);
				if (kind === 'solo' && leg === 0)
					await page.evaluate(() => {
						window.earlierLegNext = $(
							'#pane0 [data-cup-action="next"]',
						).onclick;
					});
				if (kind === 'solo' && leg === 1) {
					await page.evaluate(() => earlierLegNext());
					assert.equal(
						await page.evaluate(() => cup.index),
						1,
						'an earlier intermission cannot advance this leg',
					);
				}
				if (leg === 0)
					await page.screenshot({
						path: `${output}/cup-${kind}-standings.png`,
					});
				if (kind === 'split' && leg === 0) {
					const action = await page
						.locator('#pane0 [data-cup-action="next"]')
						.boundingBox();
					const stage = await page.locator('#pane0 .stage').boundingBox();
					assert(
						action.y + action.height <= stage.y + stage.height,
						'Next game is visible without scrolling after each split-screen game',
					);
				}
				if (leg < 4)
					await page.locator('#pane0 [data-cup-action="next"]').click();
			}
			assert.equal(
				await page.evaluate(
					() => store.history.filter((row) => row.g === 'cup').length,
				),
				1,
			);
			assert.equal(await page.evaluate(() => cup.games.length), 5);
			await page.screenshot({ path: `${output}/cup-${kind}-final.png` });
			const previous = await page.evaluate(() => cup.id);
			await page.locator('#pane0 [data-cup-action="replay"]').click();
			assert.notEqual(await page.evaluate(() => cup.id), previous);
			assert(
				await page.evaluate(() => cup.points.every((score) => score === 0)),
			);
			await page.evaluate(() => quit());
			assert.equal(await page.evaluate(() => cup), null);
		}
		console.log(
			'Cup: solo/split/pass five-game progression, final record and replay passed.',
		);

		await page.evaluate(() => {
			startCup('precision', true);
		});
		await ready();
		await page.evaluate(() => {
			makeCtx(0).done(5, '5');
			window.oldCupNext = $('#pane0 [data-cup-action="next"]').onclick;
			quit();
			startCup('precision', true);
			oldCupNext();
		});
		assert.equal(
			await page.evaluate(() => cup.index),
			0,
			'stale next-game callbacks cannot advance a fresh Cup',
		);
		await page.evaluate(() => quit());

		await page.evaluate(() => {
			mode = 'group';
			window.cupMessages = [];
			grp = {
				role: 'host',
				me: 0,
				names: ['Host', 'Guest A', 'Guest B'],
				gone: [false, false, false],
				players: ['Host', 'Guest A', 'Guest B'].map((name, i) => ({
					name,
					gone: false,
					conn: i ? { open: true, send: (msg) => cupMessages.push(msg) } : null,
				})),
				board: { rows: [] },
				r: null,
				peer: { destroy() {} },
			};
			startCup('reflex');
		});
		for (let leg = 0; leg < 5; leg++) {
			await page.locator('#pane0 .stage button').first().click();
			await page.evaluate(() => {
				grp.r.ready.fill(true);
				grCheck();
			});
			await count();
			await page.evaluate(() => {
				makeCtx(0).done(10, '10');
				grResult(1, 20, '20');
				grResult(2, 30, '30');
			});
			assert.equal(await page.evaluate(() => cup.legs.length), leg + 1);
			if (leg < 4)
				await page.locator('#pane0 [data-cup-action="next"]').click();
		}
		assert.equal(
			await page.evaluate(
				() => grp.board.rows.filter((row) => row.g === 'cup').length,
			),
			1,
		);
		assert.equal(
			await page.evaluate(
				() =>
					store.history.filter((row) => row.g === 'cup' && row.n.length === 3)
						.length,
			),
			1,
		);
		assert(
			await page.evaluate(() =>
				cupMessages.some(
					(msg) => msg.t === 'g-cup' && msg.state.phase === 'complete',
				),
			),
		);
		await page.evaluate(() => grQuit());
		assert.equal(await page.evaluate(() => cup), null);
		await page.evaluate(() => {
			const names = Array.from({ length: 11 }, (_, i) =>
				i === 0 ? 'Host' : `Guest ${i}`,
			);
			grp = {
				role: 'host',
				me: 0,
				names,
				gone: names.map((_, i) => i > 0 && i < 9),
				players: names.map((name, i) => ({
					name,
					gone: i > 0 && i < 9,
					conn: i ? { open: true, send() {} } : null,
				})),
				board: { rows: [] },
				r: null,
				peer: { destroy() {} },
			};
			startCup('mixed');
		});
		assert.equal(
			await page.evaluate(() => cup.names.length),
			3,
			'a Cup includes active players after room churn',
		);
		await page.locator('#pane0 .stage button').first().click();
		await page.evaluate(() => {
			grp.r.ready.fill(true);
			grCheck();
		});
		await count();
		await page.evaluate(() => {
			makeCtx(0).done(10, '10');
			grResult(9, 20, '20');
			grResult(10, 30, '30');
		});
		assert.equal(await page.evaluate(() => cup.legs.length), 1);
		assert.equal(await page.evaluate(() => cup.points.length), 3);
		assert.deepEqual(await page.evaluate(() => cup.names), [
			'Host',
			'Guest 9',
			'Guest 10',
		]);
		for (let leg = 1; leg < 5; leg++) {
			await page.locator('#pane0 [data-cup-action="next"]').click();
			await page.locator('#pane0 .stage button').first().click();
			await page.evaluate(() => {
				grp.r.ready.fill(true);
				grCheck();
			});
			await count();
			await page.evaluate(() => {
				makeCtx(0).done(10, '10');
				grResult(9, 20, '20');
				grResult(10, 30, '30');
			});
		}
		assert(
			await page.evaluate(() => {
				const row = grp.board.rows.at(-1);
				return (
					row.pts[9] === cup.points[1] &&
					row.pts[10] === cup.points[2] &&
					row.place.slice(1, 9).every((place) => place === null)
				);
			}),
			'the room scoreboard keeps original player indices',
		);
		await page.evaluate(() => {
			grp.role = 'guest';
			grp.me = 10;
			receiveCup(JSON.parse(JSON.stringify(cup)), true);
		});
		assert.equal(
			await page.locator('#pane0 .ppts').innerText(),
			String(await page.evaluate(() => cup.points[2])),
			'a rejoined guest sees their own Cup points',
		);
		assert.equal(
			await page.locator('#pane0 [data-cup-action="next"]').count(),
			0,
		);
		await page.evaluate(() => {
			grp.role = 'host';
			grp.me = 0;
		});
		await page.evaluate(() => grQuit());
		assert.deepEqual(errors, []);
		console.log(
			'Cup: group-room standings, final scoreboard, stale-callback protection and quit passed.',
		);
	} finally {
		await browser.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
