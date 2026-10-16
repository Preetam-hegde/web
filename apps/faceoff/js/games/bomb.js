'use strict';

/* Word Bomb and Word Chain share one engine: players alternate, one typed word per turn, and whoever
   runs out of time loses the round. The other half mirrors what is being typed.
   o.init() extra state · o.head(s, p) header html · o.check(word, s) error text or null
   o.pass(word, s) after a good word · o.frac(s) time left, 1 to 0 · o.lose label for the loser */
function typedDuel(c0, c1, o) {
	const cs = [c0, c1];
	const s = { turn: o.first, typed: '', n: [0, 0], used: new Set(), ...o.init() };
	const ui = cs.map((c) => typePane(c, (k) => key(c.p, k)));

	function render() {
		cs.forEach((c) => {
			ui[c.p].head(o.head(s, c.p));
			ui[c.p].word(s.typed);
			ui[c.p].kb.enabled(s.turn === c.p);
		});
		focus(s.turn); // pass-and-play: the phone goes to whoever holds the turn
	}
	function key(p, k) {
		if (s.turn !== p) return;
		if (k !== 'enter') {
			s.typed = typeKey(s.typed, k);
			sfx.key();
			return render();
		}
		const err = o.check(s.typed, s);
		if (err) {
			sfx.bad();
			return ui[p].msg(err);
		}
		s.used.add(s.typed);
		s.n[p]++;
		o.pass(s.typed, s);
		s.typed = '';
		s.turn = 1 - p;
		sfx.lock();
		render();
	}
	function boom() {
		const loser = s.turn;
		sfx.boom();
		buzz(200);
		cs[loser].done(0, `${o.lose} <small>${s.n[loser]} ${s.n[loser] === 1 ? 'word' : 'words'}</small>`);
		cs[1 - loser].done(1, `${s.n[1 - loser]} ${s.n[1 - loser] === 1 ? 'word' : 'words'}`);
	}

	render();
	c0.loop(() => {
		const f = o.frac(s);
		cs.forEach((c) => ui[c.p].bar(f, f < 0.25));
		if (f > 0) return true;
		boom();
		return false;
	});
}

const turnLine = (s, p) => (s.turn === p ? `<b>${esc(nameOf(p))}</b>, your turn` : `${esc(nameOf(s.turn))} is up…`);

GAMES.push({
	id: 'bomb', name: 'Word Bomb', icon: '💣', group: 'Words', lowerIsBetter: false, duel: true, words: true,
	blurb: 'Pass the bomb: type a word containing the letters shown before it blows up.',
	config: (i) => ({ first: Math.round(Math.random()), band: Math.min(1, 0.3 + 0.2 * i), fuse: rand(15000, 25000) }),
	intro: () => 'Type a word that <b>contains</b> the letters shown and the bomb passes on<br><small>No repeats. Whoever holds it when it blows loses.</small>',
	play(c0, c1) {
		const { cfg } = c0;
		const pool = WORDS.frags.slice(0, Math.max(40, Math.ceil(WORDS.frags.length * cfg.band))); // later rounds dig into rarer fragments
		const t0 = performance.now();
		typedDuel(c0, c1, {
			first: cfg.first,
			init: () => ({ frag: choice(pool)[0] }),
			head: (s, p) => `<div class="frag">${s.frag}</div>${turnLine(s, p)}`,
			check: (w, s) => (w.length < 3 ? 'Too short' : !w.includes(s.frag) ? `Needs “${s.frag.toUpperCase()}”` : s.used.has(w) ? 'Already used' : !isWord(w) ? 'Not in the dictionary' : null),
			pass: (w, s) => { s.frag = choice(pool)[0]; },
			frac: () => 1 - (performance.now() - t0) / cfg.fuse,
			lose: '💥 Boom',
		});
	},
});

GAMES.push({
	id: 'chain', name: 'Word Chain', icon: '🔗', group: 'Words', lowerIsBetter: false, duel: true, words: true,
	blurb: 'Each word starts with the last letter of the one before. Beat the clock.',
	config: (i) => ({ first: Math.round(Math.random()), start: choice(WORDS.answers), turnMs: Math.max(6000, 11000 - i * 1000) }),
	intro: (c) => `Each word starts with the <b>last letter</b> of the one before<br><small>${secs(c.turnMs, 0)}s a turn, no repeats. Run out of time and you lose.</small>`,
	play(c0, c1) {
		const { cfg } = c0;
		let turnStart = performance.now();
		typedDuel(c0, c1, {
			first: cfg.first,
			init: () => ({ last: cfg.start, chain: [cfg.start], used: new Set([cfg.start]) }),
			head: (s, p) => `<div class="hint">${s.chain.slice(-3).map(esc).join(' → ')}</div><div class="frag">${s.last.slice(-1)}…</div>${turnLine(s, p)}`,
			check: (w, s) => (w.length < 3 ? 'Too short' : w[0] !== s.last.slice(-1) ? `Must start with “${s.last.slice(-1).toUpperCase()}”` : s.used.has(w) ? 'Already used' : !isWord(w) ? 'Not in the dictionary' : null),
			pass: (w, s) => { s.last = w; s.chain.push(w); turnStart = performance.now(); },
			frac: () => 1 - (performance.now() - turnStart) / cfg.turnMs,
			lose: '⏱ Time up',
		});
	},
});
