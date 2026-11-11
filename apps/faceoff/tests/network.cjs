'use strict';

// In-memory transport exercises the real host/guest handlers without a public PeerJS broker.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch({
		channel: process.env.FACEOFF_BROWSER_CHANNEL || undefined,
	});
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		serviceWorkers: 'block',
		reducedMotion: 'reduce',
	});
	const pages = await Promise.all([context.newPage(), context.newPage()]);
	const [host, guest] = pages,
		errors = [];
	try {
		for (const page of pages) {
			page.on('pageerror', (e) => errors.push(e.message));
			await page.route(/fonts\.google|gc\.zgo/, (r) => r.abort());
			await page.goto(
				process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/',
			);
			await page.evaluate(() => window.faceoffReady);
			await page.clock.install();
			await page.clock.pauseAt(new Date());
		}
		for (let i = 0; i < 2; i++)
			await pages[i].evaluate((i) => {
				window.sent = [];
				store.sound = true;
				store.dares = false;
				store.rounds = 1;
				net = {
					role: i ? 'guest' : 'host',
					me: i,
					names: ['Host', 'Guest'],
					board: { rows: [] },
					remote: false,
					local: false,
					send(msg) {
						sent.push(msg);
					},
				};
				if (!i) watchMirror();
			}, i);
		async function flush() {
			for (let k = 0; k < 15; k++) {
				let count = 0;
				for (let i = 0; i < 2; i++) {
					const messages = await pages[i].evaluate(() => sent.splice(0));
					count += messages.length;
					for (const msg of messages)
						await pages[1 - i].evaluate(
							(msg) =>
								(net.role === 'host' ? hostHandle : guestHandle)(net, msg),
							msg,
						);
				}
				if (!count) return;
			}
			assert.fail('messages must settle');
		}
		async function mirror() {
			await host.evaluate(() => mirrorNow());
			await flush();
		}
		async function begin(id) {
			await host.evaluate(
				(id) =>
					startMatch(
						GAMES.find((g) => g.id === id),
						1,
					),
				id,
			);
			await mirror();
			await host.locator('#pane0 .stage button').click();
			await guest.locator('#pane1 .stage button').click();
			await flush();
			await mirror();
			assert.equal(
				await guest.evaluate(() => seat1().dataset.turn || ''),
				await host.evaluate(() => seat1().dataset.turn || ''),
				'guest turn indicator follows host',
			);
		}
		await begin('ttt');
		assert(
			await guest.evaluate(() => !!audio),
			'guest Ready tap must unlock audio',
		);
		for (const [player, cell] of [
			[0, 0],
			[1, 3],
			[0, 1],
			[1, 4],
			[0, 2],
		]) {
			await pages[player]
				.locator(`#pane${player} .cell[data-i="${cell}"]`)
				.click();
			await flush();
			await mirror();
		}
		await host.clock.fastForward(1200);
		await mirror();
		assert.equal(await host.evaluate(() => m.final.champ), 0);
		assert((await guest.locator('#pane1').innerText()).includes('YOU LOSE'));
		const cues = await host.evaluate(() => {
			sent = [];
			sfx.win();
			return sent;
		});
		assert(
			cues.some((msg) => msg.t === 'sound' && msg.name === 'win'),
			'shared wins must reach the guest',
		);
		await flush();
		await begin('stop');
		for (let i = 0; i < 4; i++) {
			await host.clock.fastForward(700);
			await guest.clock.fastForward(700);
			await flush();
		}
		assert(
			await guest.evaluate(() => net.local),
			'plain games must run on the guest clock',
		);
		await host.clock.fastForward(1000);
		await guest.clock.fastForward(1000);
		await host.locator('#pane0 .stage').click();
		await guest.locator('#pane1 .stage').click();
		await flush();
		await mirror();
		assert(await host.evaluate(() => !!m.final));
		assert.equal(await guest.evaluate(() => store.plays.stop), 1);
		await guest.evaluate(() => {
			const row = { g: 'stop', p: [0, 0], c: -1, s: '' };
			guestHandle(net, { t: 'board', b: { rows: [net.board.rows[0], row] } });
			guestHandle(net, {
				t: 'board',
				b: { rows: [net.board.rows[0], { ...row, p: [1, 0], c: 0 }] },
			});
		});
		assert.deepEqual(
			await guest.evaluate(() => [store.plays.stop, store.history.at(-1).c]),
			[1, 0],
			'sudden death must update the guest history',
		);
		assert.equal(
			await guest.evaluate(() => {
				let tones = 0;
				const original = audio.createOscillator.bind(audio);
				audio.createOscillator = () => {
					tones++;
					return original();
				};
				store.sound = false;
				guestHandle(net, { t: 'sound', name: 'win' });
				store.sound = true;
				audio.createOscillator = original;
				return tones;
			}),
			0,
			'guest mute must silence remote cues',
		);
		await host.evaluate(() => startCup('mixed'));
		await flush();
		await mirror();
		for (let leg = 0; leg < 5; leg++) {
			await host.locator('#pane0 .stage button').first().click();
			await guest.locator('#pane1 .stage button').first().click();
			await flush();
			for (let i = 0; i < 4; i++) {
				await host.clock.fastForward(700);
				await guest.clock.fastForward(700);
				await flush();
			}
			await host.evaluate(() => makeCtx(0).done(10, '10'));
			await guest.evaluate(() => makeCtx(1).done(20, '20'));
			await flush();
			await mirror();
			assert.deepEqual(
				await guest.evaluate(() => cup.points),
				await host.evaluate(() => cup.points),
			);
			assert.equal(
				await guest.locator('#pane1 [data-cup-action="next"]').count(),
				0,
				'only the host advances a room Cup',
			);
			assert.equal(
				await guest.evaluate(() => startCup('mixed')),
				false,
				'a guest cannot replace the Cup',
			);
			if (leg < 4) {
				await host.locator('#pane0 [data-cup-action="next"]').click();
				await flush();
				await mirror();
			}
		}
		for (const page of pages) {
			assert.equal(await page.evaluate(() => cup.phase), 'complete');
			assert.equal(
				await page.evaluate(
					() => store.history.filter((entry) => entry.g === 'cup').length,
				),
				1,
				'Cup history is recorded once on each phone',
			);
			assert.equal(
				await page.evaluate(
					() => net.board.rows.filter((entry) => entry.g === 'cup').length,
				),
				1,
			);
		}
		await host.locator('#pane0 [data-cup-action="quit"]').click();
		await flush();
		assert.equal(await guest.evaluate(() => cup), null);
		console.log(
			'PASS: two-phone Cup schedule, five games, standings, host authority and one final record per phone',
		);
		assert.deepEqual(errors, []);
		console.log(
			'PASS: two-phone ready, guest audio, mirrored turns, local scoring, result sync and sudden-death history',
		);
	} finally {
		await browser.close();
	}
})().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
