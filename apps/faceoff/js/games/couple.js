'use strict';

/* Couple-friendly classics, all tap-only. Each works split-screen (both halves show the same game, the
   player whose turn it is can tap) and pass-and-play (the phone goes to whoever's turn it is). */

/* ── Tic-Tac-Toe ─────────────────────────────────────── */
const TTT_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
/* Board cells hold null or the index of the player who played there. Returns the winner and the line, or null. */
function tttWinner(board) {
	for (const line of TTT_LINES) {
		const [x, y, z] = line;
		if (board[x] !== null && board[x] === board[y] && board[y] === board[z]) return { p: board[x], line };
	}
	return null;
}

GAMES.push({
	id: 'ttt', name: 'Tic-Tac-Toe', icon: '❌', group: 'Couple', lowerIsBetter: false, duel: true,
	blurb: 'Three in a row. The starter swaps every round.',
	config: (i) => ({ first: i % 2 }),
	intro: (c) => `Get three in a row<br><small>${esc(nameOf(c.first))} starts as X this round.</small>`,
	play(c0, c1) {
		const cs = [c0, c1];
		const { first } = c0.cfg;
		const board = Array(9).fill(null);
		let turn = first;
		let over = false;
		const mark = (p) => (p === first ? 'x' : 'o');

		function render() {
			const win = tttWinner(board);
			const full = board.every((c) => c !== null);
			cs.forEach((c) => {
				const status = over ? (win ? `<b>${esc(nameOf(win.p))}</b> wins!` : 'A draw') : turn === c.p ? `<b>${esc(nameOf(c.p))}</b>, your move` : `${esc(nameOf(turn))} is up…`;
				c.stage.innerHTML = `<div class="dhead">${status}</div><div class="ttt">${board.map((v, i) => `<button class="cell${win && win.line.includes(i) ? ' win' : ''}" type="button" data-i="${i}" style="--c:var(--p${v ?? 0})">${v === null ? '' : gameIcon(`ttt-${mark(v)}`)}</button>`).join('')}</div>`;
				c.stage.onclick = (e) => {
					const b = e.target.closest('.cell');
					if (b) move(c.p, +b.dataset.i);
				};
			});
			return { win, full };
		}
		function move(p, i) {
			if (over || p !== turn || board[i] !== null) return;
			board[i] = p;
			sfx.key();
			const { win, full } = render();
			if (win || full) {
				over = true;
				render();
				sfx.lock();
				cs[0].after(1100, () => {
					cs.forEach((c) => c.done(win && win.p === c.p ? 1 : 0, win ? (win.p === c.p ? 'Three in a row' : 'Beaten') : 'Draw'));
				});
				return;
			}
			turn = 1 - p;
			render();
			focus(turn);
		}

		render();
		focus(turn);
	},
});

/* ── Memory Match ────────────────────────────────────── */
const MEMORY_SHAPES = [
	['circle', '<circle cx="12" cy="12" r="8"/>', '#ff7a59'],
	['square', '<rect x="5" y="5" width="14" height="14" rx="2"/>', '#35d6c8'],
	['triangle', '<path d="M12 4 21 20H3Z"/>', '#f6c453'],
	['star', '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>', '#b48cff'],
	['heart', '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', '#ff5d73'],
	['diamond', '<path d="M12 2 22 12 12 22 2 12Z"/>', '#7cf29a'],
];

GAMES.push({
	id: 'memory', name: 'Memory Match', icon: '🧠', group: 'Couple', lowerIsBetter: false, duel: true,
	blurb: 'Flip two cards to find a pair. A match earns another go.',
	config: (i) => ({ first: i % 2 }),
	intro: () => 'Flip two cards at a time and find the pairs<br><small>A match scores a point and you go again. Most pairs wins.</small>',
	play(c0, c1) {
		const cs = [c0, c1];
		const deck = shuffle([...MEMORY_SHAPES.keys(), ...MEMORY_SHAPES.keys()]);
		const score = [0, 0];
		const matched = new Set();
		let open = [];
		let turn = c0.cfg.first;
		let busy = false;

		function render() {
			cs.forEach((c) => {
				const status = turn === c.p ? `<b>${esc(nameOf(c.p))}</b>, your turn` : `${esc(nameOf(turn))} is up…`;
				c.stage.innerHTML = `<div class="dhead">${status} · pairs <b>${score[c.p]}</b> – <b>${score[1 - c.p]}</b></div><div class="memgrid">${deck.map((s, i) => {
					const up = open.includes(i) || matched.has(i);
					const [, shape, color] = MEMORY_SHAPES[s];
					return `<button class="mem${up ? ' up' : ''}${matched.has(i) ? ' got' : ''}" type="button" data-i="${i}">${up ? `<svg viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${shape}</svg>` : ''}</button>`;
				}).join('')}</div>`;
				c.stage.onclick = (e) => {
					const b = e.target.closest('.mem');
					if (b) flip(c.p, +b.dataset.i);
				};
			});
		}
		function flip(p, i) {
			if (busy || p !== turn || open.includes(i) || matched.has(i)) return;
			open.push(i);
			sfx.key();
			render();
			if (open.length < 2) return;
			busy = true;
			const [a, b] = open;
			if (deck[a] === deck[b]) {
				score[turn]++;
				matched.add(a);
				matched.add(b);
				open = [];
				busy = false;
				sfx.lock();
				render();
				if (matched.size === deck.length) cs[0].after(700, () => cs.forEach((c) => c.done(score[c.p], `${score[c.p]} pairs`)));
				return;
			}
			cs[0].after(1000, () => { // show the miss for a moment, then hand over
				open = [];
				turn = 1 - turn;
				busy = false;
				render();
				focus(turn);
			});
		}

		render();
		focus(turn);
	},
});

/* ── Green Flag / Red Flag ───────────────────────────── */
const FLAGS = [
	'Replies to texts within minutes', 'Takes hours to reply, every time', 'Remembers small details you mentioned once', 'Is always ten minutes late',
	'Plans surprise dates', 'Hates sharing food', 'Sings loudly in the car', 'Gets jealous easily', 'Is still friends with all their exes',
	'Says sorry first', 'Leaves the dishes overnight', 'Keeps every ticket and memento', 'Sends very long voice notes', 'Never picks where to eat',
	'Gives you the last bite', 'Falls asleep during every film', 'Screenshots your chats to ask their friends', 'Shares their location with you',
	'Takes 100 photos to get one good one', 'Goes to bed hours after you', 'Steals your hoodie', 'Cries at adverts', 'Wants you to meet the family early',
	'Hits snooze five times', 'Posts every date online', 'Is always cold and borrows your jumper', 'Makes you breakfast', 'Reads the last page of a book first',
	'Turns every trip into a schedule', 'Quotes film lines all the time', 'Has strong opinions about how to load the dishwasher', 'Remembers every anniversary',
];
const FLAG_NAMES = ['Green flag', 'Red flag'];
let flagPool = [];

GAMES.push({
	id: 'flags', name: 'Green Flag, Red Flag', icon: '🚩', group: 'Couple', lowerIsBetter: false, duel: true,
	blurb: 'Rate it in secret, then guess how your partner rated it.',
	config(i) {
		if (!i) flagPool = shuffle(FLAGS); // a new match gets a new order, and no statement repeats within it
		return { s: flagPool[i % flagPool.length] };
	},
	intro: () => 'A statement appears. Call it a <b>green flag</b> or a <b>red flag</b>, then guess how they called it<br><small>One point for every correct guess.</small>',
	play(c0, c1) {
		const cs = [c0, c1];
		const { s } = c0.cfg;
		const rated = [null, null], guessed = [null, null];

		function ask(p, title, line, into, next) {
			const st = cs[p].stage;
			st.innerHTML = `<div class="gname">${title}</div><div class="lbl">${line}</div><div class="quote">“${s}”</div>
				<div class="choices">${FLAG_NAMES.map((n, i) => `<button class="choice ${i ? 'rf' : 'gf'}" type="button" data-i="${i}">${gameIcon('flags')} ${n}</button>`).join('')}</div>`;
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
			(p, next) => ask(p, 'Your call', `<b>${esc(nameOf(p))}</b>, how do you rate this?`, rated, next),
			() => turns(
				(p, next) => ask(p, 'Now guess', `How did <b>${esc(nameOf(1 - p))}</b> rate it?`, guessed, next),
				() => [0, 1].forEach((p) => {
					const ok = guessed[p] === rated[1 - p];
					cs[p].done(ok ? 1 : 0, `${ok ? '✓' : '✗'} ${esc(nameOf(1 - p))} said <b>${FLAG_NAMES[rated[1 - p]].toLowerCase()}</b>`);
				}),
				true,
			),
		);
	},
});
