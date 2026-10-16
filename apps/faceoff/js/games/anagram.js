'use strict';

/* Points by word length: longer words are worth a lot more. */
const ANAGRAM_POINTS = [0, 0, 0, 1, 2, 4, 6, 10];
const anagramPoints = (len) => ANAGRAM_POINTS[len] || 0;
const ANAGRAM_MS = 45000;

GAMES.push({
	id: 'anagram', name: 'Anagram Race', icon: '🔤', group: 'Words', lowerIsBetter: false, words: true,
	blurb: 'Same seven letters for both. Build as many words as you can in 45 seconds.',
	config() {
		const base = choice(WORDS.racks);
		let rack = shuffle([...base]).join('');
		while (rack === base) rack = shuffle([...base]).join(''); // never show the answer
		return { rack };
	},
	intro: () => `Make words from the <b>same seven letters</b><br><small>${ANAGRAM_MS / 1000}s. 3+ letters. A word using all seven is worth ${anagramPoints(7)}.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const letters = [...cfg.rack];
		let order = letters.map((_, i) => i);
		let typed = [];
		const found = new Set();
		let score = 0;
		stage.innerHTML = `<div class="dhead"></div><div class="bar"><i></i></div><div class="found"></div><div class="word"></div><div class="msg"></div><div class="rack"></div>
			<div class="mini"><button type="button" data-a="back">⌫</button><button type="button" data-a="mix">⇄</button><button type="button" data-a="go" class="go">✓</button></div>`;
		const q = (sel) => $(sel, stage);
		const wordNow = () => typed.map((i) => letters[i]).join('');

		function draw() {
			q('.dhead').innerHTML = `<b>${score}</b> pts · ${found.size} ${found.size === 1 ? 'word' : 'words'}`;
			q('.word').textContent = wordNow();
			q('.rack').innerHTML = order.map((i) => `<button type="button" data-i="${i}"${typed.includes(i) ? ' disabled' : ''}>${letters[i]}</button>`).join('');
			q('.found').innerHTML = [...found].slice(-6).map((w) => `<span>${w}</span>`).join('');
		}
		const msg = q('.msg'); // held, because the stage is repainted when the round ends
		function flash(text) {
			sfx.bad();
			msg.textContent = text;
			q('.word')?.animate([{ transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }], 200);
			setTimeout(() => { msg.textContent = ''; }, 1300);
		}
		function submit() {
			const w = wordNow();
			if (w.length < 3) return flash('Too short');
			if (found.has(w)) return flash('Already found');
			if (!isWord(w)) return flash('Not a word');
			found.add(w);
			score += anagramPoints(w.length);
			typed = [];
			sfx.lock();
			draw();
		}

		q('.rack').onpointerdown = (e) => {
			const b = e.target.closest('button');
			if (!b || b.disabled) return;
			e.preventDefault();
			typed.push(+b.dataset.i);
			sfx.key();
			draw();
		};
		q('.mini').onpointerdown = (e) => {
			const b = e.target.closest('button');
			if (!b) return;
			e.preventDefault();
			if (b.dataset.a === 'back') typed.pop();
			else if (b.dataset.a === 'mix') order = shuffle(order);
			else return submit();
			draw();
		};

		draw();
		const t0 = performance.now();
		ctx.loop(() => {
			const left = 1 - (performance.now() - t0) / ANAGRAM_MS;
			q('.bar i').style.width = `${Math.max(0, left) * 100}%`;
			q('.bar').classList.toggle('hot', left < 0.2);
			if (left <= 0) { ctx.done(score, `${score} pts <small>${found.size} ${found.size === 1 ? 'word' : 'words'}</small>`); return false; }
		});
	},
});
