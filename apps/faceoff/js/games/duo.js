'use strict';

/* More couple games. The first group is "together" games (coop: true): both of you answer in secret and
   the pair scores when you agree. Nobody wins or loses; the match ends on a team result.
   Each works in split screen and pass-and-play. */

/* One factory for the three agreement games: both pick an option in secret, a match scores a point. */
function agreeGame(o) {
	let pool = [];
	GAMES.push({
		id: o.id, name: o.name, icon: o.icon, group: 'Couple', lowerIsBetter: false, duel: true, coop: true, rounds: o.rounds,
		blurb: o.blurb,
		config(i) {
			if (!i) pool = shuffle(o.deck); // a new match gets a new order, and nothing repeats within it
			return { item: pool[i % pool.length] };
		},
		intro: o.intro,
		verdict: (score) => (score ? ['win', o.yes] : ['tie', o.no]),
		summary: o.summary,
		play(c0, c1) {
			const cs = [c0, c1];
			const { item } = c0.cfg;
			const opts = o.options(item);
			const picked = [null, null];
			turns((p, next) => {
				const st = cs[p].stage;
				st.innerHTML = `<div class="gname">${esc(nameOf(p))}</div>${o.question(item)}
					<div class="choices">${opts.map((t, i) => `<button class="choice" type="button" data-i="${i}">${esc(t)}</button>`).join('')}</div>`;
				$$('.choice', st).forEach((b) => {
					b.onclick = () => {
						if (picked[p] !== null) return;
						picked[p] = +b.dataset.i;
						sfx.lock();
						st.innerHTML = `<div class="res tie">Locked in ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`;
						next();
					};
				});
			}, () => {
				const agree = picked[0] === picked[1] ? 1 : 0;
				[0, 1].forEach((p) => cs[p].done(agree, esc(opts[picked[p]])));
			});
		},
	});
}

const MORE_LIKELY = [
	'forget an anniversary', 'cry at a film', 'get us lost', 'oversleep', 'talk to strangers on a train', 'spend too much on a gadget',
	'eat the last biscuit and say nothing', 'win an argument by being stubborn', 'adopt ten pets', 'fall asleep first tonight', 'say sorry first',
	'plan a surprise party', 'be late to their own wedding', 'binge a whole series in a day', 'burn the toast', 'know where the keys are',
	'start a new hobby and quit in a week', 'sing in public', 'forget to charge their phone', 'make friends with the neighbours',
	'dance in the kitchen', 'keep a secret', 'get road rage', 'pack at the last minute', 'spoil the end of a film', 'take the longest shower',
	'reply to a text instantly', 'say "I told you so"', 'eat dessert first', 'become famous',
];

agreeGame({
	id: 'likely', name: 'Who\'s More Likely', icon: '🙋', blurb: 'Both point at who is more likely to… and see if you agree.',
	deck: MORE_LIKELY,
	options: () => [nameOf(0), nameOf(1)],
	question: (item) => `<div class="lbl">Who’s more likely to…</div><div class="quote">${esc(item)}?</div>`,
	intro: () => 'Each of you points at who is <b>more likely</b> to do it, in secret<br><small>Agree and the pair scores a point.</small>',
	yes: 'You agree ✓', no: 'Different answers',
	summary: (t, n) => ({ title: `${t} of ${n}`, sub: 'times you agreed on who' }),
});

const NEVER_EVER = [
	'sent a text to the wrong person', 'pretended to like a gift', 'cried at a film', 'stayed up all night talking', 'forgotten someone\'s name straight after hearing it',
	'sung in the shower and been caught', 'pretended to be asleep', 'eaten food off the floor', 'laughed at the wrong moment', 'got lost with a map in my hand',
	'told a white lie to get out of plans', 'binge-watched a series in one weekend', 'fallen asleep on a date', 'danced alone in my room', 'lied about my age',
	'waved at someone who was not waving at me', 'walked into a glass door', 'missed a flight or a train', 'cooked something that went terribly wrong',
	'talked to myself out loud', 'slept through an alarm', 'worn a top inside out all day', 'forgotten a birthday', 'had a crush on a teacher',
	'been on a blind date', 'pretended to know a song', 'laughed so hard I cried at a funeral', 're-gifted a present', 'blamed the dog for something I did',
	'sent a message and instantly regretted it',
];

agreeGame({
	id: 'never', name: 'Never Have I Ever', icon: '🤫', blurb: 'Tap "I have" or "never" and see how much you share.',
	deck: NEVER_EVER,
	options: () => ['I have', 'Never'],
	question: (item) => `<div class="quote">Never have I ever ${esc(item)}</div>`,
	intro: () => 'A “never have I ever” appears. Tap <b>I have</b> or <b>Never</b> in secret<br><small>Same answer and the pair scores a point.</small>',
	yes: 'Same answer ✓', no: 'Different answers',
	summary: (t, n) => ({ title: `${t} in common`, sub: `you shared ${t} of ${n} answers` }),
});

agreeGame({
	id: 'compat', name: 'Compatibility', icon: '💘', rounds: 10, blurb: 'Ten quick "this or that" picks. How well do you match?',
	deck: QUIZ,
	options: (item) => item,
	question: () => '<div class="lbl">Which one are you?</div>',
	intro: () => 'Ten quick picks, in secret. <b>Same pick</b> scores a point<br><small>At the end you get a match percentage to share.</small>',
	yes: 'A match ✓', no: 'Not this time',
	summary: (t, n) => ({ title: `${Math.round((t / n) * 100)}% match`, sub: `you agreed on ${t} of ${n}` }),
});

/* ── Would You Rather: pick yours, then guess your partner's ── */
const RATHER = [
	['Always be 10 minutes late', 'Always be 20 minutes early'], ['Give up sweets forever', 'Give up chips forever'], ['Never use a phone on dates', 'Never watch TV together'],
	['Cook every meal together', 'Order in every night'], ['A big wedding', 'Elope abroad'], ['Live by the sea', 'Live in the mountains'],
	['A surprise date every month', 'Plan every date together'], ['Read minds', 'Teleport'], ['Share one dessert', 'Order two'],
	['Hear "I love you" daily', 'Get a handwritten note weekly'], ['Travel the world for a year', 'Buy your dream home'], ['Sleep in a tent', 'Sleep on a sofa bed'],
	['Be famous together', 'Be rich and unknown'], ['Redo your first date', 'Skip to your 50th anniversary'], ['Dance at the party', 'Watch from the sofa'],
	['Fly first class once a year', 'Fly economy every month'], ['Know all my secrets', 'Keep a few mysteries'], ['A weekend away', 'A week at home'],
	['Be locked in a library', 'Be locked in a bakery'], ['Visit the past', 'Visit the future'], ['Share one phone for a week', 'Share one wardrobe for a week'],
	['Pizza for every meal', 'Pasta for every meal'], ['Lose your phone for a month', 'Lose your wallet for a week'], ['Pick each other\'s haircut', 'Pick each other\'s outfit'],
	['Be stuck in a lift together', 'Be stuck in traffic together'], ['Love letters', 'Voice notes'], ['Always have the window seat', 'Always have the aisle seat'],
	['A cosy night in', 'A night out dancing'], ['Cook a disaster dinner', 'Order a disaster takeaway'], ['Never be cold again', 'Never be hot again'],
];
let ratherPool = [];

GAMES.push({
	id: 'rather', name: 'Would You Rather', icon: '🤔', group: 'Couple', lowerIsBetter: false, duel: true,
	blurb: 'Pick yours, then guess your partner\'s pick. Who knows who better?',
	config(i) {
		if (!i) ratherPool = shuffle(RATHER);
		return { q: ratherPool[i % ratherPool.length] };
	},
	intro: () => 'Pick what <b>you</b> would rather, then guess what <b>they</b> picked<br><small>One point for every correct guess.</small>',
	play(c0, c1) {
		const cs = [c0, c1];
		const opts = c0.cfg.q;
		const picked = [null, null], guessed = [null, null];
		function ask(p, title, line, into, next) {
			const st = cs[p].stage;
			st.innerHTML = `<div class="gname">${title}</div><div class="lbl">${line}</div><div class="choices">${opts.map((t, i) => `<button class="choice" type="button" data-i="${i}">${esc(t)}</button>`).join('')}</div>`;
			$$('.choice', st).forEach((b) => {
				b.onclick = () => {
					if (into[p] !== null) return;
					into[p] = +b.dataset.i;
					sfx.lock();
					st.innerHTML = `<div class="res tie">Locked in ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`;
					next();
				};
			});
		}
		turns(
			(p, next) => ask(p, 'Your pick', `<b>${esc(nameOf(p))}</b>, you would rather…`, picked, next),
			() => turns(
				(p, next) => ask(p, 'Now guess', `What would <b>${esc(nameOf(1 - p))}</b> rather do?`, guessed, next),
				() => [0, 1].forEach((p) => {
					const ok = guessed[p] === picked[1 - p];
					cs[p].done(ok ? 1 : 0, `${ok ? '✓' : '✗'} ${esc(nameOf(1 - p))} picked <b>${esc(opts[picked[1 - p]])}</b>`);
				}),
				true,
			),
		);
	},
});

/* ── Truth or Dare: take turns, do it or skip it ─────── */
const TRUTHS = [
	'What was your first impression of me?', 'What is a small thing I do that you love?', 'What is one thing you have always wanted us to try?',
	'When did you first know you liked me?', 'What is your favourite memory of us?', 'Which song reminds you of us?', 'What is something you have never told me?',
	'What is the best compliment you have ever received?', 'What do you think is my most underrated quality?', 'Where do you see us in five years?',
	'What is the most romantic thing someone could do for you?', 'What is a habit of mine that secretly makes you smile?', 'Which trip with me was your favourite?',
	'What is your idea of a perfect lazy day with me?', 'What is a dream you have not told many people?', 'Which film character am I most like?',
	'What was your worst date ever (not with me)?', 'What is the silliest thing you have done for love?', 'What do I do that makes you feel really cared for?',
	'What is your favourite photo of us, and why?', 'What would our reality show be called?', 'If we could teleport anywhere tonight, where would we go?',
	'What is one thing you would change about our routine?', 'What is something you are nervous about right now?', 'What is the first thing you noticed about me?',
];

GAMES.push({
	id: 'roulette', name: 'Truth or Dare', icon: '🎡', group: 'Couple', lowerIsBetter: false, duel: true, coop: true,
	blurb: 'Spin for a truth or a dare, one turn each. Nobody loses.',
	config(i) {
		const who = i % 2;
		const kind = Math.random() < 0.5 ? 'truth' : 'dare';
		const text = kind === 'truth' ? choice([...TRUTHS, ...store.custom.truths]) : choice(allDares()).replace('{w}', nameOf(1 - who));
		return { who, kind, text };
	},
	intro: (c) => `<b>${esc(nameOf(c.who))}</b> takes this turn<br><small>Spin, then do it or skip it. Your own truths and dares from the menu are in the mix.</small>`,
	verdict: (score) => (score ? ['win', 'Done ✓'] : ['tie', 'Skipped']),
	summary: (t, n) => ({ title: `${t} of ${n} done`, sub: 'truths and dares completed' }),
	play(c0, c1) {
		const cs = [c0, c1];
		const { who, kind, text } = c0.cfg;
		let n = 0;
		function spin() {
			if (n >= 12) return show();
			cs.forEach((c) => { c.stage.innerHTML = `<div class="spin">${n % 2 ? 'DARE' : 'TRUTH'}</div>`; });
			sfx.tick();
			n++;
			c0.after(80 + n * 14, spin);
		}
		function show() {
			sfx.win();
			focus(who);
			cs.forEach((c) => {
				const mine = c.p === who;
				c.stage.innerHTML = `<div class="gname">${esc(nameOf(who))}</div><div class="res ${kind === 'dare' ? 'lose' : 'win'}">${kind.toUpperCase()}</div><div class="quote">${esc(text)}</div>
					${mine ? '<div class="btns"><button class="btn" type="button" data-a="done">Done ✓</button><button class="btn ghost" type="button" data-a="skip">Skip</button></div>' : `<div class="hint">${esc(nameOf(who))}’s turn…</div>`}`;
				if (!mine) return;
				$$('button', c.stage).forEach((b) => {
					b.onclick = () => {
						const ok = b.dataset.a === 'done' ? 1 : 0;
						cs.forEach((x) => x.done(ok, ok ? 'Did it' : 'Skipped'));
					};
				});
			});
		}
		focus(who);
		spin();
	},
});

/* ── Sync Tap: tap the same beat together ────────────── */
const SYNC_TAPS = 4;
const SYNC_MISS_MS = 500; // a missing tap counts as this far off

GAMES.push({
	id: 'sync', name: 'Sync Tap', icon: '🥁', group: 'Couple', lowerIsBetter: false, duel: true, coop: true, splitOnly: true, rounds: 3,
	blurb: 'Watch four beats, then tap four more together. Win as a pair.',
	config: (i) => ({ beat: [640, 520, 420][i % 3] }),
	intro: () => 'Watch the four beats, then both tap four more <b>in the same rhythm</b><br><small>Tap on your own half. The closer your taps land, the higher the score.</small>',
	verdict: (score) => ['win', `${score}% in sync`],
	summary: (t, n) => ({ title: `${Math.round(t / n)}% in sync`, sub: 'average across the rounds' }),
	play(c0, c1) {
		const cs = [c0, c1];
		const T = c0.cfg.beat;
		const taps = [[], []];
		let open = false;
		let finished = false;
		cs.forEach((c) => { c.stage.innerHTML = '<div class="beat"></div><div class="lbl">Watch the beat…</div>'; });

		const pulse = (c) => {
			const d = $('.beat', c.stage);
			if (!d) return;
			d.classList.add('on');
			setTimeout(() => d.classList.remove('on'), 140);
		};
		for (let k = 0; k < 4; k++) c0.after(k * T, () => { cs.forEach(pulse); sfx.tick(); });
		c0.after(4 * T - 80, () => {
			open = true;
			cs.forEach((c) => { $('.lbl', c.stage).innerHTML = 'Now <b>tap</b> the beat'; });
		});

		function finish() {
			if (finished) return;
			finished = true;
			let sum = 0;
			for (let k = 0; k < SYNC_TAPS; k++) sum += taps[0][k] !== undefined && taps[1][k] !== undefined ? Math.abs(taps[0][k] - taps[1][k]) : SYNC_MISS_MS;
			const avg = sum / SYNC_TAPS;
			const score = Math.max(0, Math.round(100 - avg / 5));
			cs.forEach((c) => c.done(score, `±${Math.round(avg)} ms`));
		}
		cs.forEach((c) => {
			c.stage.onpointerdown = (e) => {
				if (!open || taps[c.p].length >= SYNC_TAPS) return;
				taps[c.p].push(tsOf(e));
				pulse(c);
				sfx.key();
				if (taps[0].length >= SYNC_TAPS && taps[1].length >= SYNC_TAPS) finish();
			};
		});
		c0.after(8 * T + 2500, finish);
	},
});
