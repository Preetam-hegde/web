'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const contrast = (first, second) => {
	const light = (color) => {
		const channels = color
			.match(/[\d.]+/g)
			.slice(0, 3)
			.map(Number)
			.map((n) => {
				const value = n / 255;
				return value <= 0.04045
					? value / 12.92
					: ((value + 0.055) / 1.055) ** 2.4;
			});
		return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
	};
	const values = [light(first), light(second)].sort((a, b) => b - a);
	return (values[0] + 0.05) / (values[1] + 0.05);
};

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
		const output = process.env.FACEOFF_OUTPUT || '/tmp/faceoff-qa';
		fs.mkdirSync(output, { recursive: true });
		page.on('pageerror', (error) => errors.push(error.message));
		await page.route(/fonts\.google|gc\.zgo/, (route) => route.abort());
		await page.goto(
			process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/',
		);
		await page.evaluate(() => window.faceoffReady);
		await page.clock.install();
		await page.clock.pauseAt(new Date());
		const begin = async (id, cfg) => {
			await page.evaluate(
				({ id, cfg }) => {
					toHub();
					store.mode = 'pass';
					startMatch(
						GAMES.find((game) => game.id === id),
						1,
						true,
					);
					if (cfg) m.cfg = cfg;
					$('button', stageOf(0)).click();
				},
				{ id, cfg },
			);
			for (let i = 0; i < 3; i++) await page.clock.fastForward(700);
		};

		await begin('hue', { h: 0, s: 100, l: 50 });
		assert.deepEqual(
			await page
				.locator('#pane0 .sliders input')
				.evaluateAll((inputs) => inputs.map((input) => input.dataset.k)),
			['R', 'G', 'B'],
		);
		assert.match(
			await page.locator('#pane0 .rgb-readout').innerText(),
			/RGB\(\s*64,\s*191,\s*191\s*\)/,
		);
		await page.screenshot({ path: `${output}/colour-rgb.png` });
		await page.evaluate(() => {
			for (const [channel, value] of [
				['R', 255],
				['G', 0],
				['B', 0],
			]) {
				const input = $(`input[data-k="${channel}"]`, stageOf(0));
				input.value = value;
				input.dispatchEvent(new Event('input', { bubbles: true }));
			}
		});
		assert.equal(
			await page
				.locator('#pane0 .swatch .mine')
				.evaluate((element) => getComputedStyle(element).backgroundColor),
			'rgb(255, 0, 0)',
		);
		assert.match(
			await page.locator('#pane0 .rgb-readout').innerText(),
			/RGB\(\s*255,\s*0,\s*0\s*\)/,
		);
		assert.equal(
			await page
				.locator('#pane0 input[data-k="G"]')
				.evaluate((input) => input.style.getPropertyValue('--channel-track')),
			'linear-gradient(90deg, rgb(255, 0, 0), rgb(255, 255, 0))',
		);
		await page.locator('#pane0 .btn').click();
		assert.equal(
			await page.evaluate(() => m.res[0].score),
			0,
			'matching RGB channels must score zero error',
		);
		console.log('Colour controls update the swatch, RGB readout and score.');

		await begin('recall', { h: 0, s: 100, l: 50 });
		assert.equal(
			await page
				.locator('#pane0 .swatch i')
				.first()
				.evaluate((element) => getComputedStyle(element).visibility),
			'visible',
		);
		await page.clock.fastForward(2500);
		assert.equal(
			await page
				.locator('#pane0 .swatch i')
				.first()
				.evaluate((element) => getComputedStyle(element).visibility),
			'hidden',
		);
		assert.equal(
			await page.locator('#pane0 .stage').getAttribute('data-memory'),
			'hidden',
		);
		assert.match(
			await page.locator('#pane0 .rgb-readout').innerText(),
			/64,\s*191,\s*191/,
		);
		assert.doesNotMatch(
			await page.locator('#pane0 .reference-cell').innerText(),
			/255|RGB/,
		);
		await page.screenshot({ path: `${output}/colour-recall.png` });
		console.log('Colour Recall hides its reference without revealing its RGB.');

		await begin('size', { k: 0.7 });
		assert(await page.locator('#pane0 input').isDisabled());
		assert(await page.locator('#pane0 .btn').isDisabled());
		assert.equal(await page.locator('#pane0 .phase-index').innerText(), '01');
		await page.screenshot({ path: `${output}/size-reference.png` });
		await page.clock.fastForward(1800);
		assert(!(await page.locator('#pane0 input').isDisabled()));
		assert.equal(await page.locator('#pane0 .phase-index').innerText(), '02');
		await page.screenshot({ path: `${output}/size-rebuild.png` });
		await page.locator('#pane0 input').fill('70');
		await page.locator('#pane0 .btn').click();
		assert.equal(
			await page.evaluate(() => m.res[0].score),
			0,
			'rebuilding the diameter must preserve size scoring',
		);
		console.log(
			'Size Match gates input during memory and preserves diameter scoring.',
		);

		await begin('pitch', { f: 440 });
		await page.screenshot({ path: `${output}/pitch-reference.png` });
		await page.evaluate(() => {
			sfx.unlock();
			window.immediateStops = 0;
			const create = audio.createOscillator.bind(audio);
			audio.createOscillator = () => {
				const voice = create(),
					stop = voice.stop.bind(voice);
				voice.stop = (at) => {
					if (at === undefined || at <= audio.currentTime + 0.02)
						immediateStops++;
					stop(at);
				};
				return voice;
			};
		});
		await page.locator('#pane0 [data-a="target"]').click();
		await page.locator('#pane0 [data-a="target"]').click();
		assert.equal(
			await page.evaluate(() => immediateStops),
			1,
			'the new reference must stop the previous tone',
		);
		await page.evaluate(() => toHub());
		assert.equal(
			await page.evaluate(() => immediateStops),
			2,
			'quitting must stop the current pitch tone',
		);
		assert.deepEqual(errors, []);
		console.log('Pitch Match stops replaced tones and cleans up on quit.');

		await begin('centre');
		const marker = await page.evaluate(() => ({
			dot: getComputedStyle($('.dot', stageOf(0))).backgroundColor,
			track: getComputedStyle($('.track', stageOf(0))).backgroundColor,
		}));
		assert(
			contrast(marker.dot, marker.track) >= 3,
			'timing marker must stand out from its track',
		);
		for (const id of await page.evaluate(() => PARTY.map((game) => game.id))) {
			await page.evaluate((id) => {
				toHub();
				startParty(id);
			}, id);
			const colors = await page.evaluate(() => {
				const button = getComputedStyle($('#partyDock .btn'));
				const step = getComputedStyle($('#partyBody .steps li'), '::before');
				return [
					[button.color, button.backgroundColor],
					[step.color, step.backgroundColor],
				];
			});
			for (const pair of colors)
				assert(
					contrast(...pair) >= 4.5,
					`${id}: party actions and rule numbers must remain legible`,
				);
		}
		console.log(
			'Timing markers, party actions and rule numbers retain contrast.',
		);
		await page.goto(new URL('test.html', page.url()).href);
		await page.waitForFunction(() =>
			['PASS', 'FAIL', 'ERROR'].includes(document.title),
		);
		assert.equal(
			await page.title(),
			'PASS',
			'the developer logic page must pass',
		);
		assert.deepEqual(errors, []);
		console.log('Developer logic page passes without browser exceptions.');
	} finally {
		await browser.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
