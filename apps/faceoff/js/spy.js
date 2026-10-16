'use strict';

/* Who's the Spy, for 3 to 10 players on one shared phone. Everyone except the spy is shown the same secret word;
   the spy only knows the category. Talk it out, vote, and a caught spy still gets one guess at the word.
   Built on the party framework in party.js (draw, pass, pname, finish...). */

const SPY_WORDS = {
	Places: ['airport', 'beach', 'hospital', 'library', 'circus', 'museum', 'cinema', 'school', 'supermarket', 'zoo', 'gym', 'bakery', 'hotel', 'farm', 'castle', 'laundrette'],
	Food: ['pizza', 'sushi', 'pancakes', 'burger', 'ice cream', 'noodles', 'tacos', 'curry', 'salad', 'popcorn', 'chocolate', 'sandwich', 'soup', 'cheese', 'dumplings', 'toast'],
	Animals: ['elephant', 'penguin', 'giraffe', 'dolphin', 'kangaroo', 'owl', 'octopus', 'tiger', 'panda', 'flamingo', 'hedgehog', 'camel', 'koala', 'shark', 'bat', 'rabbit'],
	Jobs: ['teacher', 'chef', 'pilot', 'doctor', 'farmer', 'dentist', 'firefighter', 'plumber', 'artist', 'astronaut', 'barber', 'librarian', 'magician', 'lifeguard', 'detective', 'postman'],
	Things: ['umbrella', 'toothbrush', 'backpack', 'mirror', 'candle', 'ladder', 'scissors', 'headphones', 'blanket', 'clock', 'bicycle', 'microwave', 'suitcase', 'sunglasses', 'balloon', 'sofa'],
};
const SPY_CATS = [...Object.keys(SPY_WORDS), 'Mixed'];
const spyClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

GAME_ICONS.spy = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>';

PARTY.push({
	id: 'spy', name: 'Who’s the Spy', blurb: 'One of you does not know the secret word. Find the spy before they fake it.',
	need: 'One phone, 3 to 10 players, and a good poker face.',
	steps: [
		'Pick a category, how many spies (2 only with 6 or more players) and how long you get to talk.',
		'Pass the phone around once. Everyone except the spy sees the same secret word. The spy only sees the category.',
		'Talk it out. Go round the circle giving a clue or asking a question about the word, vague enough to fool the spy and clear enough to prove you know it.',
		'Spies: blend in and work out the word from what you hear.',
		'Call the vote any time, or when the clock runs out. Everyone points at the suspect, then tap the name. With two spies, tap two.',
		'Catch every spy and each spy side still gets one guess at the word. Guess right and the spies win after all.',
	],
	win: 'The group scores 1 point each for catching the spy. A spy who survives, or guesses the word, scores 2. Caught spies and wrongly accused players take a sip.',
	run() {
		const n = ps.names.length;
		if (n < 3) {
			draw(`<h1 class="ptitle">${gameIcon('spy')} Needs 3 players</h1><p class="psub">With two players there is nobody to hide from. Add a third and try again.</p>${btn('back', 'Back to players')}`, { back: roster });
			return;
		}
		const cfg = (ps.spyCfg ||= { cat: 'Mixed', spies: 1, mins: 3 }); // kept between rounds
		const maxSpies = n >= 6 ? 2 : 1;
		cfg.spies = Math.min(cfg.spies, maxSpies);

		const row = (label, key, opts) => `<div class="seg" style="flex-wrap:wrap;justify-content:center;margin-bottom:14px"><span style="flex:0 0 100%;text-align:center;margin:0">${label}</span>${opts.map(([v, t]) => `<button type="button" data-k="set" data-v="${key}:${v}" aria-pressed="${String(cfg[key] === v)}">${t}</button>`).join('')}</div>`;
		const setup = () => draw(`<h1 class="ptitle">${gameIcon('spy')} Set up the round</h1>
			<div class="spyset">
				${row('Category', 'cat', SPY_CATS.map((c) => [c, c]))}
				${row('Spies', 'spies', [[1, '1 spy'], ...(maxSpies > 1 ? [[2, '2 spies']] : [])])}
				${row('Discussion', 'mins', [[2, '2 min'], [3, '3 min'], [5, '5 min']])}
			</div>
			${btn('go', 'Deal the roles')}`, {
			set(kv) {
				const [k, ...rest] = kv.split(':');
				const v = rest.join(':');
				cfg[k] = k === 'cat' ? v : +v;
				setup();
			},
			go: deal,
		});

		function deal() {
			const word = choice(cfg.cat === 'Mixed' ? Object.values(SPY_WORDS).flat() : SPY_WORDS[cfg.cat]);
			const cat = Object.keys(SPY_WORDS).find((k) => SPY_WORDS[k].includes(word));
			const spies = new Set(shuffle([...Array(n).keys()]).slice(0, cfg.spies));
			const first = Math.floor(Math.random() * n);
			const peek = (i) => (i >= n ? talk() : pass(i, () => draw(spies.has(i)
				? `<div class="gname">${esc(ps.names[i])} · your role</div><h1 class="ptitle">You are the SPY</h1><p class="psub">The category is <b>${cat}</b>. Listen, blend in, and work out the word.</p>${btn('next', 'Got it, hide the screen')}`
				: `<div class="gname">${esc(ps.names[i])} · your role</div><p class="psub">The secret word is</p><div class="pcard big">${word}</div><p class="hint">Category: ${cat}. One of you does not know it. Do not say it out loud.</p>${btn('next', 'Got it, hide the screen')}`, { next: () => peek(i + 1) })));

			function talk() {
				let left = cfg.mins * 60;
				draw(`<div class="gname">Discussion</div><div class="spin" id="spyClock">${spyClock(left)}</div>
					<p class="psub">${pname(first)} goes first. Give a clue or ask a question about the word, then pass it round.</p>
					<p class="hint">Clear enough to prove you know it. Vague enough to fool the spy.</p>${btn('vote', 'Call the vote')}`, { vote });
				const el = $('#spyClock');
				ps.timer = setInterval(() => {
					el.textContent = spyClock(--left);
					if (left === 10) sfx.tick();
					if (left > 0) return;
					clearInterval(ps.timer);
					sfx.go();
					vote();
				}, 1000);
			}

			function vote() {
				const picked = new Set();
				const view = () => draw(`<div class="gname">The vote</div><p class="psub">Agree on ${cfg.spies > 1 ? `${cfg.spies} suspects` : 'a suspect'}, then tap ${cfg.spies > 1 ? 'their names' : 'the name'}.</p>
					<div class="chips">${ps.names.map((nm, i) => `<button class="pchip" type="button" data-k="sus" data-v="${i}" style="--c:${col(i)};${picked.has(i) ? 'outline:3px solid #fff;outline-offset:2px' : ''}">${esc(nm)}</button>`).join('')}</div>
					<button class="btn" type="button" data-k="go"${picked.size === cfg.spies ? '' : ' disabled'}>Reveal</button>`, {
					sus(v) {
						const i = +v;
						if (picked.has(i)) picked.delete(i);
						else if (picked.size < cfg.spies) picked.add(i);
						view();
					},
					go: () => resolve(picked),
				});
				view();
			}

			function resolve(picked) {
				const caught = [...picked].every((i) => spies.has(i));
				if (!caught) return result(true, picked, 'The group pointed at the wrong player.');
				const options = shuffle([word, ...shuffle(SPY_WORDS[cat].filter((w) => w !== word)).slice(0, 7)]);
				const guesser = [...spies][0];
				pass(guesser, () => draw(`<div class="gname">You were caught</div><p class="psub">${pname(guesser)}, one chance: what was the secret word?</p>
					<div class="pchoices">${options.map((w) => `<button class="choice" type="button" data-k="guess" data-v="${esc(w)}">${w}</button>`).join('')}</div>`, {
					guess: (w) => result(w === word, picked, w === word ? `The spy guessed it: ${word}.` : `The spy guessed “${w}”. Wrong.`),
				}), `<p class="psub">The group caught ${cfg.spies > 1 ? 'the spies' : 'the spy'}. Hand the phone to a spy for a last guess.</p>`);
			}

			function result(spiesWin, picked, why) {
				sfx[spiesWin ? 'bad' : 'win']();
				ps.names.forEach((_, i) => {
					if (spies.has(i)) { if (spiesWin) ps.pts[i] += 2; else sip(i); } else {
						if (!spiesWin) ps.pts[i] += 1;
						if (picked.has(i)) sip(i); // wrongly accused
					}
				});
				const spyNames = [...spies].map((i) => pname(i)).join(' & ');
				draw(`<div class="gname">Round result</div><div class="res ${spiesWin ? 'lose' : 'win'}">${spiesWin ? 'The spy wins' : 'The group wins'}</div>
					<p class="psub">${why}</p><p class="psub">The word was <b>${word}</b>. Spy: ${spyNames}.</p>
					<div class="plist">${[...ps.names.keys()].sort((a, b) => ps.pts[b] - ps.pts[a]).map((i) => `<div class="prow static"><i style="background:${col(i)}"></i><span>${esc(ps.names[i])}</span><em>${ps.pts[i]} pt${ps.pts[i] === 1 ? '' : 's'} · ${ps.sips[i]} sip${ps.sips[i] === 1 ? '' : 's'}</em></div>`).join('')}</div>
					<div class="btns">${btn('again', 'Another round')}${btn('end', 'Final scores', '', 'ghost')}</div>`, {
					again: setup,
					end: () => finish((i) => ps.pts[i], (i) => `${ps.pts[i]} pt${ps.pts[i] === 1 ? '' : 's'}`),
				});
			}

			peek(0);
		}

		setup();
	},
});
