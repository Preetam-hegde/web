'use strict';

// Run with Playwright available to Node and the repository served on port 4173.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.FACEOFF_URL || 'http://127.0.0.1:4173/apps/faceoff/';
const output = process.env.FACEOFF_OUTPUT || '/tmp/faceoff-qa';

(async () => {
	fs.mkdirSync(output, { recursive: true });
	const browser = await chromium.launch({
		channel: process.env.FACEOFF_BROWSER_CHANNEL || undefined,
		headless: true,
	});
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		serviceWorkers: 'block',
		reducedMotion: 'reduce',
	});
	const page = await context.newPage();
	page.setDefaultTimeout(3000);
	const errors = [],
		checks = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.route(/fonts\.google|gc\.zgo/, (r) => r.abort());
	await page.goto(base);
	await page.evaluate(() => window.faceoffReady);
	await page.evaluate(() => loadWords());
	await page.clock.install();
	await page.clock.pauseAt(new Date());
	const advance = (ms = 2500) => page.clock.fastForward(ms);
	const countdown = async () => {
		for (let i = 0; i < 4; i++) await advance(700);
	};
	const check = async (name, fn) => {
		try {
			await fn();
			checks.push({ name, pass: true });
			if (checks.length % 20 === 0)
				console.log(`${checks.length} checks completed: ${name}`);
		} catch (e) {
			checks.push({ name, pass: false, error: e.message });
			console.error('FAIL', name, e.message);
		}
	};
	const state = () =>
		page.evaluate(() => ({
			final: !!m?.final,
			done: !!m?.res[0],
			solo: !!m?.solo,
		}));
	const begin = async (id, mode) => {
		await page.evaluate(
			({ id, mode }) => {
				observer?.disconnect();
				net = grp = null;
				toHub();
				store.mode = mode === 'solo' ? 'pass' : mode;
				store.rounds = 1;
				startMatch(
					GAMES.find((g) => g.id === id),
					1,
					mode === 'solo',
				);
				m.rounds = 1;
				if (id === 'green') m.cfg.delay = 1500;
				(m.pass ? [0] : [0, 1]).forEach((p) => $('button', stageOf(p)).click());
			},
			{ id, mode },
		);
		await countdown();
	};
	const pointer = async (selector, x = 0.5, y = 0.5, drag) => {
		const r = await page.locator(selector).first().boundingBox();
		assert(r, `${selector} is visible`);
		await page.mouse.move(r.x + r.width * x, r.y + r.height * y);
		await page.mouse.down();
		if (drag)
			await page.mouse.move(r.x + r.width * drag[0], r.y + r.height * drag[1], {
				steps: 4,
			});
		await page.mouse.up();
	};
	const games = await page.evaluate(() =>
		GAMES.map((g) => ({
			id: g.id,
			solo: canSolo(g),
			group: groupOk(g),
			duel: !!g.duel,
		})),
	);

	for (const game of games.filter((g) => !g.duel)) {
		for (const mode of ['solo', 'split', 'pass'])
			await check(`${game.id}: ${mode} timeout completes`, async () => {
				await begin(game.id, mode);
				if (mode === 'split')
					await page.screenshot({ path: `${output}/${game.id}.png` });
				for (let k = 0; k < 75; k++) {
					const s = await state();
					if (s.final || (s.solo && s.done)) break;
					await page.evaluate(() => {
						if (
							m?.pass &&
							!m.solo &&
							!m.final &&
							m.res.some(Boolean) &&
							!m.res.every(Boolean)
						)
							$('button', $('.pane.on .stage'))?.click();
					});
					await advance();
				}
				const s = await state();
				assert(s.final || (s.solo && s.done), 'game must finish without input');
			});
	}

	// Real controls: scoreable input, rather than only the no-input fallback.
	for (const game of games.filter((g) => !g.duel))
		await check(`${game.id}: solo scoring controls`, async () => {
			await begin(game.id, 'solo');
			const id = game.id,
				st = '#pane0 .stage';
			if (['stop', 'liar', 'centre'].includes(id)) await pointer(st);
			else if (id === 'feel') {
				await pointer(st);
				await advance(1000);
				await pointer(st);
			} else if (id === 'hold') {
				const r = await page.locator(st).boundingBox();
				await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
				await page.mouse.down();
				await advance(1000);
				await page.mouse.up();
			} else if (id === 'green') {
				await advance(1600);
				await advance(20);
				await pointer(st);
			} else if (id === 'frenzy') {
				for (let i = 0; i < 3; i++) await pointer(st);
				await advance(10000);
			} else if (id === 'cut') {
				await pointer(`${st} canvas`, 0.5, 0.05, [0.5, 0.95]);
				await page.locator(`${st} button`).click();
			} else if (id === 'count') {
				await advance(2100);
				const n = await page.evaluate(() => String(m.cfg.n));
				for (const c of n)
					await page
						.locator(`${st} .pad button`)
						.filter({ hasText: new RegExp(`^${c}$`) })
						.click();
				await page
					.locator(`${st} .pad button`)
					.filter({ hasText: '✓' })
					.click();
			} else if (id === 'track') {
				await advance(2000);
				await pointer(`${st} canvas`);
			} else if (id === 'angle') {
				await pointer(`${st} canvas`, 0.8, 0.2);
				await page.locator(`${st} button`).click();
			} else if (id === 'tempo' || id === 'rhythm') {
				await advance(4000);
				await advance(400);
				for (let i = 0; i < (id === 'tempo' ? 8 : 4); i++) {
					await pointer(st);
					await advance(200);
				}
				await advance(600);
			} else if (id === 'whack') {
				await advance(750);
				await pointer(`${st} .tgt`);
				await advance(16000);
			} else if (id === 'clash') {
				await pointer(`${st} .clashgrid button` + ':first-child');
				await advance(16000);
			} else if (id === 'shade') {
				for (let i = 0; i < 5; i++) {
					const odd = await page.evaluate((i) => m.cfg.trials[i].odd, i);
					await pointer(`${st} .shades [data-i="${odd}"]`);
				}
			} else if (['hue', 'recall', 'pitch'].includes(id))
				await page.locator(`${st} button`).last().click();
			else if (id === 'split') {
				await pointer(`${st} .track`);
				await page.locator(`${st} button`).click();
			} else if (id === 'sprint') {
				const answers = await page.evaluate(() =>
					m.cfg.qs.map((q) => String(q.a)),
				);
				for (const answer of answers) {
					for (const c of answer)
						await page
							.locator(`${st} .pad button`)
							.filter({ hasText: new RegExp(`^${c}$`) })
							.click();
					await advance(150);
				}
			} else if (id === 'simon') {
				await advance(1300);
				const first = await page.evaluate(() => m.cfg.seq[0]);
				await pointer(`${st} .simon [data-i="${first}"]`);
				await advance(700);
				await advance(1900);
				const wrong = await page.evaluate(() => (m.cfg.seq[0] + 1) % 4);
				await pointer(`${st} .simon [data-i="${wrong}"]`);
			} else if (id === 'order') {
				for (let n = 1; n <= 16; n++)
					await pointer(`${st} .rush [data-v="${n}"]`);
			} else if (id === 'size') {
				await advance(2000);
				await page.locator(`${st} button`).click();
			} else if (id === 'stack') {
				await page.locator(`${st} .stack-drop`).click();
				await advance(25000);
			} else if (id === 'golf') {
				await page.locator(`${st} .golf-shoot`).click();
				await page.clock.runFor(4000);
				await advance(35000);
			}
			assert(
				await page.evaluate(() => Number.isFinite(m.res[0]?.score)),
				'input must produce a finite score',
			);
		});

	for (const game of games.filter((g) => g.duel)) {
		for (const mode of game.id === 'hangman'
			? ['solo', 'split', 'pass']
			: ['split', 'pass'])
			await check(`${game.id}: ${mode} controls and outcome`, async () => {
				await begin(game.id, mode);
				if (mode === 'split')
					await page.screenshot({ path: `${output}/${game.id}.png` });
				if (game.id === 'sync') {
					await advance(15000);
				} else if (game.id === 'roulette') {
					for (let i = 0; i < 12; i++) await advance(300);
					await page.evaluate(() =>
						$('[data-a="done"]', pane(m.cfg.who)).click(),
					);
				} else if (game.id === 'hangman') {
					if (mode !== 'solo')
						for (let k = 0; k < 4; k++)
							await page.evaluate(() => {
								const st = $('.pane.on .stage');
								const input = $('input', st);
								if (input) {
									input.value = 'planet';
									$('[data-a="lock"]', st).click();
								} else $('button', st)?.click();
							});
					for (let k = 0; k < 60; k++) {
						const s = await state();
						if (s.final || (s.solo && s.done)) break;
						await page.evaluate(
							(letter) => {
								const st = $('.pane.on .stage'),
									input = $('input', st);
								if (input) {
									input.value = letter;
									input.dispatchEvent(new Event('input', { bubbles: true }));
								} else $('button', st)?.click();
							},
							'planetbcdfghijkmoqrsuvwxyz'[k % 26],
						);
					}
				} else if (game.id === 'memory') {
					// Reveal pairs through the same buttons a player uses; remember only cards already seen.
					const known = {};
					for (let k = 0; k < 150 && !(await state()).final; k++) {
						await page.evaluate((known) => {
							const st = [stageOf(0), stageOf(1)].find((s) =>
								$('.dhead', s)?.textContent.includes('your turn'),
							);
							if (!st) return;
							const cards = $$('.mem:not(.got)', st),
								open = cards.filter((b) => b.classList.contains('up'));
							const first = open[0];
							const next = first
								? cards.find(
										(b) =>
											b !== first && known[b.dataset.i] === first.innerHTML,
									) ||
									cards.find((b) => b !== first && !known[b.dataset.i]) ||
									cards.find((b) => b !== first)
								: cards.find((b, i) =>
										cards.some(
											(o, j) =>
												j > i &&
												known[b.dataset.i] &&
												known[b.dataset.i] === known[o.dataset.i],
										),
									) ||
									cards.find((b) => !known[b.dataset.i]) ||
									cards[0];
							next?.click();
						}, known);
						Object.assign(
							known,
							await page.evaluate(() =>
								Object.fromEntries(
									$$('.mem.up', stageOf(0)).map((b) => [
										b.dataset.i,
										b.innerHTML,
									]),
								),
							),
						);
						await advance(1100);
					}
				} else {
					for (let k = 0; k < 100 && !(await state()).final; k++) {
						await page.evaluate(() => {
							const stages = m.pass
								? [$('.pane.on .stage')]
								: [stageOf(0), stageOf(1)];
							for (const st of stages) {
								if ($('.choices button', st)) $('.choices button', st).click();
								else if ($('.ttt', st)) {
									if ($('.dhead', st).textContent.includes('your move'))
										$$('.cell', st)
											.find((b) => !b.innerHTML)
											?.click();
								} else if ($('.c4', st)) {
									if ($('.dhead', st).textContent.includes('drop a disc'))
										$$('.col', st)
											.find(
												(b) =>
													!b.firstElementChild.classList.contains('p0') &&
													!b.firstElementChild.classList.contains('p1'),
											)
											?.click();
								} else if ($('.dab', st)) {
									if ($('.dhead', st).textContent.includes('your line'))
										$('.edge:not(.on)', st)?.click();
								} else if (!m.final) $('button', st)?.click();
							}
						});
						await advance(1300);
					}
				}
				const s = await state();
				assert(s.final || (s.solo && s.done), 'duel must reach its result');
			});
	}

	for (const game of games.filter((g) => g.group))
		await check(`${game.id}: three-player room outcome`, async () => {
			await page.evaluate((id) => {
				net = null;
				toHub();
				mode = 'group';
				store.groupRounds = 1;
				store.timed = false;
				grp = {
					role: 'host',
					me: 0,
					players: ['A', 'B', 'C'].map((name) => ({
						name,
						conn: null,
						gone: false,
					})),
					names: ['A', 'B', 'C'],
					gone: [false, false, false],
					board: { rows: [] },
					opened: true,
					r: null,
				};
				grStart(GAMES.find((g) => g.id === id));
				grp.r.ready[1] = grp.r.ready[2] = true;
				$('button', stageOf(0)).click();
				grResult(1, 100, '100');
				grResult(2, 200, '200');
			}, game.id);
			await countdown();
			for (
				let k = 0;
				k < 70 && !(await page.evaluate(() => grp.r.phase === 'reveal'));
				k++
			)
				await advance();
			assert(
				await page.evaluate(
					() => grp.r.phase === 'reveal' && grp.board.rows.length === 1,
				),
				'all three results must reach standings',
			);
		});

	for (const id of await page.evaluate(() => PARTY.map((g) => g.id))) {
		for (const n of [2, 3, 6, 10])
			await check(`${id}: ${n}-player party flow`, async () => {
				await page.evaluate(
					({ id, n }) => {
						grp = net = null;
						mode = 'party';
						store.party = Array.from({ length: n }, (_, i) => ({
							n: `Player ${i + 1}`,
						}));
						startParty(id);
						$('[data-k="ok"]').click();
						if ($('[data-k="one"]')) $('[data-k="one"]').click();
						$('[data-k="go"]').click();
					},
					{ id, n },
				);
				if (n === 6)
					await page.screenshot({ path: `${output}/party-${id}.png` });
				const min = await page.evaluate(() => SPYDEF[ps.game.id]?.min || 2);
				if (n < min) {
					assert(
						(await page.locator('#partyBody').innerText()).includes(
							`Needs ${min} players`,
						),
					);
					return;
				}
				for (let k = 0; k < 160; k++) {
					if (
						(
							await page.evaluate(
								() => $('#partyBody .gname')?.textContent || '',
							)
						).includes('· final')
					)
						break;
					await page.evaluate(() => {
						const keys = [
							'heat',
							'me',
							'next',
							'go',
							'yes',
							'one',
							'play',
							'pick',
							'vote',
							'sus',
							'out',
							'guess',
							'target',
							'start',
							'laugh',
							'ok',
							'hit',
							'call',
							'end',
						];
						for (const key of keys) {
							const b = $(`#party [data-k="${key}"]:not(:disabled)`);
							if (b) {
								b.click();
								return;
							}
						}
					});
				}
				assert(
					(
						await page.evaluate(() => $('#partyBody .gname')?.textContent || '')
					).includes('· final'),
					'party must reach final scores',
				);
			});
	}

	for (const id of ['spy', 'grid', 'odd', 'emoji', 'blank', 'cover'])
		await check(`${id}: own-phone table and rejoin`, async () => {
			await page.evaluate((id) => {
				grp = net = null;
				startParty(id);
				$('[data-k="ok"]').click();
				$('[data-k="own"]').click();
				$('[data-k="make"]').click();
				$('[data-k="go"]').click();
				$('[data-k="go"]').click();
				$('[data-k="seat"][data-v="0"]').click();
				$('[data-k="hide"]').click();
			}, id);
			const code = await page.evaluate(() => ps.t.code);
			assert.equal(code.length, 6);
			assert(
				await page.evaluate(() => {
					const def = tDef();
					for (let n = def.min; n <= 10; n++) {
						const cfg = {};
						fixCfg(def.rows(n), cfg);
						const p = tParse(tMake(n, cfg));
						if (
							!p ||
							p.n !== n ||
							def.rows(n).some((row) => p.cfg[row.key] !== cfg[row.key])
						)
							return false;
					}
					return (
						tParse('XXXXXX') === null &&
						JSON.stringify(tDeal(), (_, v) =>
							v instanceof Set ? [...v] : v,
						) ===
							JSON.stringify(tDeal(), (_, v) => (v instanceof Set ? [...v] : v))
					);
				}),
				'codes preserve options, reject invalid codes, and deal reproducibly',
			);
			await page.evaluate(() => {
				$('[data-k="rev"]').click();
				$('[data-k="go"]').click();
				$('[data-k="next"]').click();
				$('[data-k="hide"]').click();
				const id = ps.game.id;
				leaveParty();
				startParty(id);
				$('[data-k="ok"]').click();
				$('[data-k="again"]').click();
			});
			assert.deepEqual(
				await page.evaluate(() => [ps.t.round, ps.t.seat, ps.t.code]),
				[2, 0, code],
			);
		});

	await check('sudden death records one match', async () => {
		await begin('stop', 'split');
		await page.evaluate(() => {
			store.history = [];
			store.plays = {};
			store.series = [0, 0];
			makeCtx(0).done(1, '1');
			makeCtx(1).done(1, '1');
			FINAL.sudden();
			startRound();
		});
		await countdown();
		await page.evaluate(() => {
			makeCtx(0).done(1, '1');
			makeCtx(1).done(2, '2');
		});
		assert.deepEqual(
			await page.evaluate(() => [
				store.history.length,
				store.plays.stop,
				store.history.at(-1).c,
			]),
			[1, 1, 0],
		);
	});
	await check('mobile results keep actions reachable', async () => {
		await page.screenshot({ path: `${output}/result.png` });
		await page.evaluate(() => {
			const s = stageOf(0);
			s.scrollTop = s.scrollHeight;
		});
		const reachable = await page.evaluate(() => {
			const b = $('[data-act="hub"]', stageOf(0)).getBoundingClientRect(),
				s = stageOf(0).getBoundingClientRect();
			return b.top >= s.top && b.bottom <= s.bottom + 1;
		});
		assert(reachable, 'Hub button must be inside the pane after scrolling');
	});
	await check('old two-phone deadlines cannot fail a new round', async () => {
		await begin('feel', 'split');
		await page.evaluate(() => {
			net = { role: 'host', names: ['A', 'B'], board: { rows: [] }, send() {} };
			m.rounds = 2;
			makeCtx(0).done(1, '1');
			makeCtx(1).done(2, '2');
			bump();
			m.res = [null, null];
		});
		await advance(21000);
		assert.deepEqual(await page.evaluate(() => m.res), [null, null]);
	});
	await check('sound off silences pitch tones', async () => {
		await page.evaluate(() => {
			net = null;
			toHub();
			store.sound = true;
			sfx.unlock();
		});
		const muted = await page.evaluate(() => {
			let tones = 0;
			const original = audio.createOscillator.bind(audio);
			audio.createOscillator = () => {
				tones++;
				return original();
			};
			store.sound = false;
			beep(440, 600, { force: true });
			audio.createOscillator = original;
			return tones;
		});
		assert.equal(muted, 0);
	});
	await check('share image survives an immediate quit', async () => {
		await begin('stop', 'split');
		const result = await page.evaluate(async () => {
			makeCtx(0).done(1, '1');
			makeCtx(1).done(2, '2');
			const card = m.final.card;
			toHub();
			try {
				return !!(await card);
			} catch {
				return false;
			}
		});
		assert(result, 'result card must use the finished match snapshot');
	});
	for (const viewport of [
		{ width: 320, height: 568 },
		{ width: 844, height: 390 },
	])
		await check(
			`all games fit ${viewport.width}x${viewport.height}`,
			async () => {
				await page.setViewportSize(viewport);
				for (const game of games) {
					await begin(game.id, 'split');
					const clipped = await page.evaluate(() =>
						$$('.pane')
							.filter((p) => getComputedStyle(p).display !== 'none')
							.flatMap((p) => {
								const r = p.getBoundingClientRect();
								return $$('button,input,canvas', p)
									.filter(
										(el) =>
											!el.disabled && getComputedStyle(el).display !== 'none',
									)
									.filter((el) => {
										const s = el.getBoundingClientRect();
										return (
											s.left < r.left - 2 ||
											s.right > r.right + 2 ||
											s.top < r.top - 2 ||
											s.bottom > r.bottom + 2
										);
									})
									.map((el) => el.tagName + '.' + el.className);
							}),
					);
					assert.deepEqual(
						clipped,
						[],
						`${game.id}: visible controls stay in their pane`,
					);
				}
			},
		);
	await check('no browser exceptions', async () =>
		assert.deepEqual(errors, []),
	);
	await browser.close();
	fs.writeFileSync(
		`${output}/report.json`,
		JSON.stringify({ checks, errors }, null, 2),
	);
	console.log(
		`${checks.filter((x) => x.pass).length}/${checks.length} browser checks passed; artifacts: ${output}`,
	);
	if (checks.some((x) => !x.pass)) process.exitCode = 1;
})().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
