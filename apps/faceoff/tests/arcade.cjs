'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/';
const output = process.env.FACEOFF_OUTPUT || '/tmp/faceoff-arcade';

(async () => {
	fs.mkdirSync(output, { recursive: true });
	const browser = await chromium.launch({
		channel: process.env.FACEOFF_BROWSER_CHANNEL || undefined,
		headless: true,
	});
	try {
		const page = await browser.newPage({
			viewport: { width: 390, height: 844 },
			serviceWorkers: 'block',
			reducedMotion: 'reduce',
		});
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.route(/fonts\.google|gc\.zgo/, (route) => route.abort());
		await page.goto(base);
		await page.evaluate(() => window.faceoffReady);
		assert.deepEqual(
			await page.evaluate(() =>
				GAMES.filter((g) => ['stack', 'golf'].includes(g.id)).map((g) => ({
					id: g.id,
					solo: canSolo(g),
					group: groupOk(g),
				})),
			),
			[
				{ id: 'stack', solo: true, group: true },
				{ id: 'golf', solo: true, group: true },
			],
		);
		await page.clock.install();
		await page.clock.pauseAt(new Date());
		const begin = async (id, mode = 'solo', cfg = null) => {
			await page.evaluate(
				({ id, mode, cfg }) => {
					net = grp = null;
					toHub();
					store.sound = false;
					store.mode = mode === 'solo' ? 'pass' : mode;
					store.flip = true;
					document.body.dataset.flip = '1';
					startMatch(
						GAMES.find((g) => g.id === id),
						1,
						mode === 'solo',
					);
					m.cfg =
						cfg ||
						(id === 'stack'
							? { speed: 0.4, phase: 0 }
							: {
									width: 1000,
									height: 600,
									start: { x: 140, y: 300 },
									hole: { x: 860, y: 300 },
									obstacles: [{ x: 450, y: 80, w: 100, h: 320 }],
								});
					(m.pass ? [0] : [0, 1]).forEach((p) =>
						$('button', stageOf(p)).click(),
					);
				},
				{ id, mode, cfg },
			);
			for (let i = 0; i < 4; i++) await page.clock.fastForward(700);
		};
		await begin('stack');
		await page.locator('#pane0 .stack-drop').click();
		assert.match(
			await page.locator('#pane0 .arcade-status').textContent(),
			/1 \/ 12/,
		);
		await page.locator('#pane0 .stack-drop').focus();
		await page.keyboard.press('Enter');
		assert.match(
			await page.locator('#pane0 .arcade-status').textContent(),
			/2 \/ 12/,
		);
		await page.locator('#pane0 canvas').click();
		assert.match(
			await page.locator('#pane0 .arcade-status').textContent(),
			/3 \/ 12/,
		);
		await page.screenshot({ path: `${output}/stack-play.png` });
		await page.clock.fastForward(25000);
		assert(
			await page.evaluate(
				() => Number.isFinite(m.res[0]?.score) && m.res[0].score >= 3000,
			),
		);

		await begin('golf');
		await page.locator('#pane0 .golf-aim').focus();
		await page.keyboard.press('ArrowRight');
		assert.equal(await page.locator('#pane0 .golf-aim').inputValue(), '1');
		await page.locator('#pane0 .golf-shoot').click();
		assert(await page.locator('#pane0 .golf-shoot').isDisabled());
		assert.match(
			await page.locator('#pane0 .arcade-status').textContent(),
			/1 \/ 5/,
		);
		await page.clock.runFor(4000);
		assert(await page.locator('#pane0 .golf-shoot').isEnabled());
		await page.screenshot({ path: `${output}/golf-play.png` });
		await page.clock.fastForward(36000);
		assert(
			await page.evaluate(
				() => Number.isFinite(m.res[0]?.score) && m.res[0].score >= 1000,
			),
		);
		assert(
			await page.evaluate(() => audio === null),
			'muted play never creates an audio context',
		);
		await begin('golf', 'solo', {
			width: 1000,
			height: 600,
			start: { x: 800, y: 300 },
			hole: { x: 860, y: 300 },
			obstacles: [],
		});
		await page.locator('#pane0 .golf-power').fill('11');
		await page.locator('#pane0 .golf-shoot').focus();
		await page.keyboard.press('Enter');
		await page.clock.runFor(2000);
		assert.equal(await page.evaluate(() => m.res[0]?.score), 1);
		assert.match(await page.evaluate(() => m.res[0]?.label), /Holed in 1 shot/);

		for (const viewport of [
			{ width: 320, height: 568 },
			{ width: 844, height: 390 },
		]) {
			await page.setViewportSize(viewport);
			for (const id of ['stack', 'golf']) {
				await begin(id, 'split');
				for (const seat of [0, 1]) {
					const stage = await page.locator(`#pane${seat} .stage`).boundingBox();
					for (const selector of [
						'canvas',
						id === 'stack' ? '.stack-drop' : '.golf-shoot',
						...(id === 'golf' ? ['.golf-aim', '.golf-power'] : []),
					]) {
						const r = await page
							.locator(`#pane${seat} ${selector}`)
							.boundingBox();
						assert(
							r.width > 0 &&
								r.height > 0 &&
								r.x >= stage.x - 1 &&
								r.y >= stage.y - 1 &&
								r.x + r.width <= stage.x + stage.width + 1 &&
								r.y + r.height <= stage.y + stage.height + 1,
							`${id} ${seat} ${selector} fits ${viewport.width}×${viewport.height}`,
						);
					}
				}
				await page.screenshot({
					path: `${output}/${id}-${viewport.width}.png`,
				});
			}
		}
		await page.setViewportSize({ width: 390, height: 844 });
		await begin('golf', 'split');
		const canvas = page.locator('#pane1 canvas');
		const r = await canvas.boundingBox();
		// Pane 1 is rotated: the ball at (140, 300) is at (86%, 50%) on screen.
		await page.mouse.move(r.x + r.width * 0.86, r.y + r.height * 0.5);
		await page.mouse.down();
		await page.mouse.move(r.x + r.width * 0.96, r.y + r.height * 0.5);
		await page.mouse.up();
		assert.match(
			await page.locator('#pane1 .arcade-status').textContent(),
			/1 \/ 5/,
		);
		assert.equal(await page.locator('#pane1 .golf-aim').inputValue(), '0');
		await begin('golf');
		const c = await page.locator('#pane0 canvas').boundingBox();
		await page.mouse.move(c.x + c.width * 0.14, c.y + c.height * 0.5);
		await page.mouse.down();
		await page.mouse.move(c.x - 10, c.y + c.height * 0.5);
		await page.mouse.up();
		assert.match(
			await page.locator('#pane0 .arcade-status').textContent(),
			/0 \/ 5/,
		);
		await page.mouse.move(c.x + c.width * 0.14, c.y + c.height * 0.5);
		await page.mouse.down();
		await page
			.locator('#pane0 canvas')
			.dispatchEvent('pointercancel', { pointerId: 1 });
		await page.mouse.up();
		assert(await page.locator('#pane0 .golf-shoot').isEnabled());
		for (const id of ['stack', 'golf']) {
			for (const mode of ['split', 'pass']) {
				await begin(id, mode);
				await page.clock.fastForward(36000);
				if (mode === 'pass') {
					await page.locator('.pane.on .stage button').click();
					for (let i = 0; i < 4; i++) await page.clock.fastForward(700);
					await page.clock.fastForward(36000);
				}
				assert(
					await page.evaluate(
						() => !!m.final && m.res.every((r) => Number.isFinite(r.score)),
					),
					`${id} ${mode} finishes without input`,
				);
			}
			await begin(id);
			await page.locator('#quit').click();
			await page.locator('#quit').click();
			await page.clock.fastForward(40000);
			assert(
				await page.evaluate(
					() => m === null && document.body.dataset.screen === 'hub',
				),
				`${id} leaves no live callbacks after Quit`,
			);
		}
		assert.deepEqual(errors, []);
		console.log(
			'Arcade controls, scores, deadlines, mute, quit, rotated drag and small layouts passed.',
		);
	} finally {
		await browser.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
