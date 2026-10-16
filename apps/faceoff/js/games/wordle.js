'use strict';

/* Mark a guess: 'g' right spot, 'y' elsewhere in the word, 'x' not there. Repeated letters are counted properly. */
function wordleMarks(guess, answer) {
	const marks = Array(guess.length).fill('x');
	const left = {};
	[...answer].forEach((c, i) => {
		if (guess[i] === c) marks[i] = 'g';
		else left[c] = (left[c] || 0) + 1;
	});
	[...guess].forEach((c, i) => {
		if (marks[i] !== 'g' && left[c] > 0) { marks[i] = 'y'; left[c]--; }
	});
	return marks;
}

const WORDLE_TRIES = 6;

GAMES.push({
	id: 'wordle', name: 'Word Duel', icon: '🟩', group: 'Words', lowerIsBetter: true, words: true,
	blurb: 'Both of you hunt the same secret five-letter word. Fewest guesses wins.',
	config: () => ({ word: choice(WORDS.answers) }),
	intro: () => `Both of you are hunting the <b>same</b> 5-letter word<br><small>Fewest guesses wins, speed breaks ties. ${WORDLE_TRIES} tries.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const tries = [];
		let cur = '';
		const t0 = performance.now();
		stage.innerHTML = '<div class="dhead"></div><div class="wg"></div><div class="kb"></div>';
		const grid = $('.wg', stage), headEl = $('.dhead', stage);
		const kb = keyboard($('.kb', stage), onKey);
		const avail = stage.clientHeight - $('.kb', stage).offsetHeight - 52;
		grid.style.setProperty('--t', `${Math.max(16, Math.min(44, Math.floor(avail / WORDLE_TRIES) - 3))}px`);

		const row = (letters, marks = []) => `<div class="wr">${[0, 1, 2, 3, 4].map((i) => `<div class="t ${marks[i] || ''}">${letters[i] || ''}</div>`).join('')}</div>`;
		function draw() {
			const rows = tries.map((g) => row(g, wordleMarks(g, cfg.word)));
			if (tries.length < WORDLE_TRIES) rows.push(row(cur));
			grid.innerHTML = rows.join('');
			headEl.classList.remove('bad');
			headEl.textContent = `Guess ${Math.min(tries.length + 1, WORDLE_TRIES)} of ${WORDLE_TRIES}`;
		}
		/* Errors take over the header line, which saves a row on small phones. */
		function flash(text) {
			sfx.bad();
			headEl.classList.add('bad');
			headEl.textContent = text;
			grid.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], 200);
			setTimeout(() => { if (headEl.classList.contains('bad')) draw(); }, 1400);
		}
		function onKey(k) {
			if (k !== 'enter') { cur = typeKey(cur, k, 5); return draw(); }
			if (cur.length < 5) return flash('Too short');
			if (!isWord(cur)) return flash('Not in the word list');
			const guess = cur;
			const marks = wordleMarks(guess, cfg.word);
			[...guess].forEach((c, i) => kb.mark(c, marks[i]));
			tries.push(guess);
			cur = '';
			draw();
			const sec = (performance.now() - t0) / 1000;
			if (guess === cfg.word) ctx.done(tries.length * 1000 + sec, `${tries.length} ${tries.length === 1 ? 'guess' : 'guesses'} · ${sec.toFixed(1)}s`);
			else if (tries.length === WORDLE_TRIES) ctx.fail(`Missed <small>(${cfg.word.toUpperCase()})</small>`);
		}
		draw();
		ctx.after(150000, () => ctx.fail(`Time up <small>(${cfg.word.toUpperCase()})</small>`));
	},
});
