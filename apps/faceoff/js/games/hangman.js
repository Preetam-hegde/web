'use strict';

const HANG_MISSES = 7;
const HANG_MS = 90000;

/* Each player picks a secret word for the other, then cracks the one they were given.
   Typing uses the phone's own keyboard through a real <input>. One phone has one keyboard, so this game
   is always pass-and-play (passOnly), whatever mode the hub is set to. */
GAMES.push({
	id: 'hangman', name: 'Hangman Duel', icon: '🪢', group: 'Words', lowerIsBetter: true, duel: true, words: true, passOnly: true,
	blurb: 'Pick a secret word for your partner, then crack theirs. Uses your phone\'s keyboard, so it is pass-and-play.',
	config: () => ({}),
	intro: () => `Each of you picks a <b>secret word</b> (4–10 letters) for the other<br><small>Then guess theirs, one letter at a time. ${HANG_MISSES} misses and you hang. Fewest misses wins, speed breaks ties.</small>`,
	play(c0, c1) {
		const cs = [c0, c1];
		const secret = [null, null]; // secret[p] is the word p chose, for 1 - p to guess

		function setStep(p, next) {
			const st = cs[p].stage;
			st.classList.add('top'); // keep the content clear of the on-screen keyboard
			st.innerHTML = `<div class="dhead"><b>${esc(nameOf(p))}</b>: pick a secret word for <b>${esc(nameOf(1 - p))}</b></div>
				<input class="typein mask" type="text" maxlength="10" placeholder="secret word" enterkeyhint="done" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false">
				<div class="msg"></div>
				<div class="btns"><button class="btn" type="button" data-a="lock">Lock in</button><button class="btn ghost" type="button" data-a="show">Show</button></div>`;
			const box = $('.typein', st), msg = $('.msg', st);
			box.oninput = () => { box.value = box.value.toLowerCase().replace(/[^a-z]/g, ''); };
			const lock = () => {
				const w = box.value;
				if (w.length < 4 || !isWord(w)) {
					sfx.bad();
					msg.textContent = w.length < 4 ? 'At least 4 letters' : 'Not in the dictionary';
					return;
				}
				secret[p] = w;
				sfx.lock();
				st.classList.remove('top');
				st.innerHTML = `<div class="res tie">Secret locked ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`;
				next();
			};
			box.onkeydown = (e) => { if (e.key === 'Enter') lock(); };
			$('[data-a="lock"]', st).onclick = lock;
			$('[data-a="show"]', st).onclick = () => { box.classList.toggle('mask'); box.focus(); };
			box.focus(); // opens the keyboard when we arrive from a tap; otherwise one tap on the box does
		}

		function guessStep(p, next) {
			const target = secret[1 - p];
			const hit = new Set(), miss = new Set();
			const t0 = performance.now();
			const st = cs[p].stage;
			st.classList.add('top');
			st.innerHTML = `<div class="dhead"></div><div class="bar"><i></i></div><div class="word"></div><div class="used"></div>
				<input class="typein" type="text" placeholder="tap here, then type a letter" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false">`;
			const box = $('.typein', st);
			const draw = () => {
				$('.dhead', st).innerHTML = `<b>${esc(nameOf(p))}</b> · misses <b>${miss.size}/${HANG_MISSES}</b>`;
				$('.word', st).textContent = [...target].map((c) => (hit.has(c) ? c : '_')).join('');
				$('.used', st).innerHTML = [...hit].map((c) => `<span class="g">${c}</span>`).join('') + [...miss].map((c) => `<span class="x">${c}</span>`).join('');
			};
			box.oninput = () => {
				const k = (box.value.match(/[a-z]/gi) || []).pop()?.toLowerCase(); // each key press is one guess
				box.value = '';
				if (!k || hit.has(k) || miss.has(k)) return;
				if (target.includes(k)) { hit.add(k); sfx.key(); } else { miss.add(k); sfx.bad(); }
				draw();
				const sec = (performance.now() - t0) / 1000;
				if ([...target].every((c) => hit.has(c))) {
					cs[p].done(miss.size * 1000 + sec, `${miss.size} ${miss.size === 1 ? 'miss' : 'misses'} · ${sec.toFixed(1)}s`);
					next();
				} else if (miss.size >= HANG_MISSES) {
					cs[p].fail(`Hanged <small>(${target.toUpperCase()})</small>`);
					next();
				}
			};
			draw();
			box.focus();
			cs[p].loop(() => {
				const left = 1 - (performance.now() - t0) / HANG_MS;
				$('.bar i', st).style.width = `${Math.max(0, left) * 100}%`;
				$('.bar', st).classList.toggle('hot', left < 0.2);
				if (left > 0) return true;
				cs[p].fail(`Time up <small>(${target.toUpperCase()})</small>`);
				next();
				return false;
			});
		}

		turns(setStep, () => turns(guessStep, () => {}, true));
	},
});
