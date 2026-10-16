'use strict';

const HANG_MISSES = 7;
const HANG_MS = 90000;

/* Each player picks a secret word for the other, then both crack the word they were given.
   turns() runs those two phases at once in split mode, and one player after another in pass-and-play. */
GAMES.push({
	id: 'hangman', name: 'Hangman Duel', icon: '🪢', group: 'Words', lowerIsBetter: true, duel: true, words: true,
	blurb: 'Pick a secret word for your rival, then crack theirs. Fewest misses wins.',
	config: () => ({}),
	intro: () => `Each of you picks a <b>secret word</b> (4–10 letters) for the other<br><small>Then guess theirs. ${HANG_MISSES} misses and you hang. Fewest misses wins, speed breaks ties.</small>`,
	play(c0, c1) {
		const cs = [c0, c1];
		const secret = [null, null]; // secret[p] is the word p chose, for 1 - p to guess
		const typed = ['', ''];

		function setStep(p, next) {
			const u = typePane(cs[p], onKey);
			u.hideBar();
			u.head(`<b>${esc(nameOf(p))}</b>: pick a secret word for <b>${esc(nameOf(1 - p))}</b>`);
			function onKey(k) {
				if (k !== 'enter') {
					typed[p] = typeKey(typed[p], k, 10);
					sfx.key();
					return u.word(typed[p]);
				}
				const w = typed[p];
				if (w.length < 4 || !isWord(w)) {
					sfx.bad();
					return u.msg(w.length < 4 ? 'At least 4 letters' : 'Not in the dictionary');
				}
				secret[p] = w;
				sfx.lock();
				cs[p].stage.innerHTML = `<div class="res tie">Secret locked ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`;
				next();
			}
		}

		function guessStep(p, next) {
			const target = secret[1 - p];
			const hit = new Set(), miss = new Set();
			const t0 = performance.now();
			const u = typePane(cs[p], onKey);
			const draw = () => {
				u.head(`<b>${esc(nameOf(p))}</b> · misses <b>${miss.size}/${HANG_MISSES}</b>`);
				u.word([...target].map((c) => (hit.has(c) ? c : '_')).join(''));
			};
			function onKey(k) {
				if (!/^[a-z]$/.test(k) || hit.has(k) || miss.has(k)) return;
				if (target.includes(k)) { hit.add(k); u.kb.mark(k, 'g'); sfx.key(); }
				else { miss.add(k); u.kb.mark(k, 'x'); sfx.bad(); }
				draw();
				const sec = (performance.now() - t0) / 1000;
				if ([...target].every((c) => hit.has(c))) {
					cs[p].done(miss.size * 1000 + sec, `${miss.size} ${miss.size === 1 ? 'miss' : 'misses'} · ${sec.toFixed(1)}s`);
					next();
				} else if (miss.size >= HANG_MISSES) {
					cs[p].fail(`Hanged <small>(${target.toUpperCase()})</small>`);
					next();
				}
			}
			draw();
			cs[p].loop(() => {
				const left = 1 - (performance.now() - t0) / HANG_MS;
				u.bar(left, left < 0.2);
				if (left > 0) return true;
				cs[p].fail(`Time up <small>(${target.toUpperCase()})</small>`);
				next();
				return false;
			});
		}

		turns(setStep, () => turns(guessStep, () => {}, true));
	},
});
