'use strict';

/* Spy games for 3 to 10 players on one shared phone, built on the party framework in party.js (draw, pass, pname,
   finish...). Who's the Spy: everyone but the spy sees the secret word. Odd Word Out: nobody is told who is odd, the odd
   one simply holds a near twin of the word (lion vs tiger). Cover Story: everyone knows the place and their role there,
   the spy knows nothing. */

const SPY_WORDS = {
	Places: ['airport', 'beach', 'hospital', 'library', 'circus', 'museum', 'cinema', 'school', 'supermarket', 'zoo', 'gym', 'bakery', 'hotel', 'farm', 'castle', 'laundrette'],
	Food: ['pizza', 'sushi', 'pancakes', 'burger', 'ice cream', 'noodles', 'tacos', 'curry', 'salad', 'popcorn', 'chocolate', 'sandwich', 'soup', 'cheese', 'dumplings', 'toast'],
	Animals: ['elephant', 'penguin', 'giraffe', 'dolphin', 'kangaroo', 'owl', 'octopus', 'tiger', 'panda', 'flamingo', 'hedgehog', 'camel', 'koala', 'shark', 'bat', 'rabbit'],
	Jobs: ['teacher', 'chef', 'pilot', 'doctor', 'farmer', 'dentist', 'firefighter', 'plumber', 'artist', 'astronaut', 'barber', 'librarian', 'magician', 'lifeguard', 'detective', 'postman'],
	Things: ['umbrella', 'toothbrush', 'backpack', 'mirror', 'candle', 'ladder', 'scissors', 'headphones', 'blanket', 'clock', 'bicycle', 'microwave', 'suitcase', 'sunglasses', 'balloon', 'sofa'],
};
const SPY_CATS = [...Object.keys(SPY_WORDS), 'Mixed'];

/* Odd Word Out: near twins. One goes to the group, the other to the odd player(s). Which is which is random. */
const ODD_PAIRS = [
	['lion', 'tiger'], ['coffee', 'tea'], ['pizza', 'burger'], ['guitar', 'violin'], ['sofa', 'armchair'], ['river', 'lake'], ['shark', 'dolphin'],
	['bus', 'tram'], ['cinema', 'theatre'], ['football', 'rugby'], ['pen', 'pencil'], ['spoon', 'fork'], ['hotel', 'hostel'], ['wolf', 'dog'],
	['sneakers', 'sandals'], ['bicycle', 'scooter'], ['cake', 'muffin'], ['king', 'emperor'], ['castle', 'palace'], ['pirate', 'viking'],
	['ghost', 'zombie'], ['snow', 'ice'], ['laptop', 'tablet'], ['mountain', 'hill'], ['soup', 'stew'], ['police', 'detective'], ['piano', 'organ'],
	['wizard', 'witch'], ['tennis', 'badminton'], ['apple', 'pear'], ['onion', 'garlic'], ['rabbit', 'hare'], ['crow', 'raven'], ['bread', 'toast'],
	['helicopter', 'drone'], ['lemon', 'lime'], ['sword', 'dagger'], ['doctor', 'dentist'], ['ocean', 'sea'], ['donut', 'bagel'], ['jacket', 'coat'],
	['newspaper', 'magazine'], ['rose', 'tulip'], ['tent', 'caravan'], ['backpack', 'suitcase'], ['mirror', 'window'], ['honey', 'jam'],
];

/* Cover Story: a place and five roles that could be found there. */
const COVER = {
	Airport: ['pilot', 'passenger', 'security guard', 'baggage handler', 'duty-free cashier'],
	Hospital: ['surgeon', 'nurse', 'patient', 'receptionist', 'visitor'],
	School: ['teacher', 'pupil', 'head teacher', 'caretaker', 'lunch lady'],
	Restaurant: ['chef', 'waiter', 'customer', 'food critic', 'dishwasher'],
	Beach: ['lifeguard', 'surfer', 'ice cream seller', 'sunbather', 'tourist'],
	Circus: ['clown', 'acrobat', 'ringmaster', 'juggler', 'popcorn seller'],
	Cinema: ['usher', 'projectionist', 'ticket seller', 'film critic', 'date night couple'],
	Zoo: ['zookeeper', 'vet', 'tourist', 'school kid', 'ice cream seller'],
	'Space station': ['astronaut', 'engineer', 'commander', 'scientist', 'space tourist'],
	'Pirate ship': ['captain', 'cook', 'lookout', 'deckhand', 'stowaway'],
	Supermarket: ['cashier', 'shopper', 'shelf stacker', 'security guard', 'manager'],
	Bank: ['cashier', 'manager', 'customer', 'security guard', 'robber'],
	Hotel: ['receptionist', 'bellhop', 'guest', 'chef', 'cleaner'],
	'Train station': ['ticket inspector', 'commuter', 'train driver', 'tourist', 'busker'],
	Library: ['librarian', 'student', 'author', 'night guard', 'toddler'],
	Wedding: ['bride', 'groom', 'DJ', 'best man', 'photographer'],
	Gym: ['trainer', 'bodybuilder', 'receptionist', 'yoga teacher', 'newbie'],
	Farm: ['farmer', 'vet', 'shepherd', 'tractor driver', 'visiting kid'],
	Museum: ['guide', 'curator', 'security guard', 'tourist', 'artist'],
	'Theme park': ['ride operator', 'mascot', 'first-timer', 'queue jumper', 'balloon seller'],
};

const spyClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const spyNames = (spies) => [...spies].map((i) => pname(i)).join(' & ');

GAME_ICONS.spy = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>';
GAME_ICONS.odd = '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>';
GAME_ICONS.cover = '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>';

const need3 = (id) => draw(`<h1 class="ptitle">${gameIcon(id)} Needs 3 players</h1><p class="psub">With two players there is nobody to hide from. Add a third and try again.</p>${btn('back', 'Back to players')}`, { back: roster });

/* Discussion clock. The time left lives in ps.left, so a screen that stops the clock can resume it. */
function spyCountdown(secs, done) {
	ps.left = secs;
	const el = $('#spyClock');
	ps.timer = setInterval(() => {
		el.textContent = spyClock(--ps.left);
		if (ps.left === 10) sfx.tick();
		if (ps.left > 0) return;
		clearInterval(ps.timer);
		sfx.go();
		done();
	}, 1000);
}

/* The spy's last guess: the answer shuffled in with up to 7 decoys. Handle it with a "guess" key. */
const guessChoices = (answer, pool) => `<div class="pchoices">${shuffle([answer, ...shuffle(pool.filter((w) => w !== answer)).slice(0, 7)]).map((w) => `<button class="choice" type="button" data-k="guess" data-v="${esc(w)}">${w}</button>`).join('')}</div>`;

/* Score a finished round (spies score 2, the group 1 each, a caught spy or a wrongly accused player sips) and show it. */
function roundEnd({ spies, spiesWin, accused, head, why, line, again }) {
	ps.names.forEach((_, i) => {
		if (spies.has(i)) { if (spiesWin) ps.pts[i] += 2; else sip(i); } else {
			if (!spiesWin) ps.pts[i] += 1;
			if (accused.has(i)) sip(i);
		}
	});
	sfx[spiesWin ? 'bad' : 'win']();
	const pts = (i) => `${ps.pts[i]} pt${ps.pts[i] === 1 ? '' : 's'}`;
	draw(`<div class="gname">Round result</div><div class="res ${spiesWin ? 'lose' : 'win'}">${head}</div>
		<p class="psub">${why}</p><p class="psub">${line}</p>
		<div class="plist">${[...ps.names.keys()].sort((a, b) => ps.pts[b] - ps.pts[a]).map((i) => row(i, `${pts(i)} · ${ps.sips[i]} sip${ps.sips[i] === 1 ? '' : 's'}`)).join('')}</div>
		<div class="btns">${btn('again', 'Another round')}${btn('end', 'Final scores', '', 'ghost')}</div>`, {
		again,
		end: () => finish((i) => ps.pts[i], pts),
	});
}

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
		if (n < 3) return need3('spy');
		const cfg = (ps.spyCfg ||= { cat: 'Mixed', spies: 1, mins: 3 }); // kept between rounds
		const maxSpies = n >= 6 ? 2 : 1;
		cfg.spies = Math.min(cfg.spies, maxSpies);

		const seg = (label, key, opts) => `<div class="seg" style="flex-wrap:wrap;justify-content:center;margin-bottom:14px"><span style="flex:0 0 100%;text-align:center;margin:0">${label}</span>${opts.map(([v, t]) => `<button type="button" data-k="set" data-v="${key}:${v}" aria-pressed="${String(cfg[key] === v)}">${t}</button>`).join('')}</div>`;
		const setup = () => draw(`<h1 class="ptitle">${gameIcon('spy')} Set up the round</h1>
			<div class="spyset">
				${seg('Category', 'cat', SPY_CATS.map((c) => [c, c]))}
				${seg('Spies', 'spies', [[1, '1 spy'], ...(maxSpies > 1 ? [[2, '2 spies']] : [])])}
				${seg('Discussion', 'mins', [[2, '2 min'], [3, '3 min'], [5, '5 min']])}
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
				draw(`<div class="gname">Discussion</div><div class="spin" id="spyClock">${spyClock(cfg.mins * 60)}</div>
					<p class="psub">${pname(first)} goes first. Give a clue or ask a question about the word, then pass it round.</p>
					<p class="hint">Clear enough to prove you know it. Vague enough to fool the spy.</p>${btn('vote', 'Call the vote')}`, { vote });
				spyCountdown(cfg.mins * 60, vote);
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
				const guesser = [...spies][0];
				pass(guesser, () => draw(`<div class="gname">You were caught</div><p class="psub">${pname(guesser)}, one chance: what was the secret word?</p>${guessChoices(word, SPY_WORDS[cat])}`, {
					guess: (w) => result(w === word, picked, w === word ? `The spy guessed it: ${word}.` : `The spy guessed “${w}”. Wrong.`),
				}), `<p class="psub">The group caught ${cfg.spies > 1 ? 'the spies' : 'the spy'}. Hand the phone to a spy for a last guess.</p>`);
			}

			const result = (spiesWin, picked, why) => roundEnd({
				spies, spiesWin, accused: picked, head: spiesWin ? 'The spy wins' : 'The group wins', why,
				line: `The word was <b>${word}</b>. Spy: ${spyNames(spies)}.`, again: setup,
			});

			peek(0);
		}

		setup();
	},
});

PARTY.push({
	id: 'odd', name: 'Odd Word Out', blurb: 'Everyone gets the same word, except one player with a near twin. Nobody knows who.',
	need: 'One phone, 3 to 10 players, and a straight face.',
	steps: [
		'Pass the phone around once. Everyone sees a secret word. Most players get the same one, but one player (two with 7 or more) gets a close cousin, say tiger instead of lion. Nobody is told which they are, so it could be you.',
		'Go round the circle. Each player gives one clue about their word, a single word or a short phrase. Not so vague that you look lost, not so clear that you give it away.',
		'Listen for the clue that does not quite fit. If your own clue felt off when you heard the others, you may be the odd one.',
		'Everyone points at a suspect, then tap their name. They are out, and the group learns whether they held the odd word.',
		'Keep going until every odd player is out, or until there are as many odd players as normal players left.',
	],
	win: 'Catch every odd player and the group scores 1 point each. An odd player who survives scores 2. Anyone voted out wrongly, and a caught odd player, takes a sip.',
	run() {
		const n = ps.names.length;
		if (n < 3) return need3('odd');

		function deal() {
			const [a, b] = shuffle(choice(ODD_PAIRS)); // a goes to the group, b to the odd ones
			const odds = new Set(shuffle([...Array(n).keys()]).slice(0, n >= 7 ? 2 : 1));
			const out = new Set();
			let round = 1;
			const word = (i) => (odds.has(i) ? b : a);
			const left = () => [...Array(n).keys()].filter((i) => !out.has(i));

			const peek = (i) => (i >= n ? clues() : pass(i, () => draw(`<div class="gname">${esc(ps.names[i])} · your word</div><p class="psub">Your secret word is</p><div class="pcard big">${word(i)}</div><p class="hint">Remember it and never say it. A few players hold a slightly different word, and nobody knows who.</p>${btn('next', 'Got it, hide the screen')}`, { next: () => peek(i + 1) })));

			const clues = () => draw(`<div class="gname">Clue round ${round}</div><h1 class="ptitle">One clue each</h1>
				<p class="psub">Go in this order. One word or a short phrase about your word. Vague enough not to give it away, clear enough to fit in.</p>
				<div class="plist">${shuffle(left()).map((i, k) => row(i, k + 1)).join('')}</div>${btn('vote', 'Vote someone out')}`, { vote });

			const vote = () => draw(`<div class="gname">The vote</div><p class="psub">Agree on who holds the odd word, then tap their name.</p>
				<div class="plist">${left().map((i) => row(i, '', 'out')).join('')}</div>`, { out: (i) => oust(+i) });

			function oust(i) {
				out.add(i);
				const rest = left(), oddsLeft = rest.filter((j) => odds.has(j)).length;
				const over = !oddsLeft || rest.length - oddsLeft <= oddsLeft; // the group caught them all, or they can no longer be outvoted
				sfx[odds.has(i) ? 'win' : 'bad']();
				draw(`<div class="gname">Voted out</div><div class="hero">${avatar(i, '96px')}</div><h1 class="ptitle">${pname(i)}</h1>
					<div class="res ${odds.has(i) ? 'win' : 'lose'}">${odds.has(i) ? 'Had the odd word' : 'Was a normal player'}</div>
					${over ? '' : `<p class="psub">${oddsLeft > 1 ? `${oddsLeft} odd players are` : 'The odd player is'} still among you.</p>`}
					${btn('next', over ? 'See the result' : 'Next clue round')}`, { next: () => (over ? finale(oddsLeft > 0) : (round++, clues())) });
			}

			const finale = (oddWin) => roundEnd({
				spies: odds, spiesWin: oddWin, accused: out, head: oddWin ? `The odd ${odds.size > 1 ? 'ones win' : 'one wins'}` : 'The group wins',
				why: oddWin ? 'They blended in until the end.' : 'Every odd player was voted out.',
				line: `The group had <b>${a}</b>. The odd word was <b>${b}</b>, held by ${spyNames(odds)}.`, again: deal,
			});

			peek(0);
		}

		deal();
	},
});

PARTY.push({
	id: 'cover', name: 'Cover Story', blurb: 'Everyone knows the place and their role there, except the spy. Ask sneaky questions.',
	need: 'One phone, 3 to 10 players, and a talent for vague answers.',
	steps: [
		'Pass the phone around once. Everyone except the spy sees the same place and their own role there. The spy sees nothing at all.',
		'Take turns asking another player one question about the place. They answer, then ask someone else (not whoever just asked them).',
		'Be sneaky: if your question or answer is too obvious, the spy learns where you are.',
		'Spy: listen, bluff, and work out the place. Think you have it? Tap “I’m the spy” at any time to guess. Right and you win on the spot, wrong and the group does.',
		'Call the vote any time, or when the clock runs out, then tap the suspect. Catch the spy and they still get one guess at the place.',
	],
	win: 'The group scores 1 point each for catching the spy. A spy who survives, or names the place, scores 2. A caught spy and a wrongly accused player take a sip.',
	run() {
		const n = ps.names.length;
		if (n < 3) return need3('cover');
		const places = Object.keys(COVER);

		function deal() {
			const place = choice(places), roles = shuffle(COVER[place]);
			const spy = Math.floor(Math.random() * n), first = Math.floor(Math.random() * n);
			ps.left = 360;

			const peek = (i) => (i >= n ? talk() : pass(i, () => draw(i === spy
				? `<div class="gname">${esc(ps.names[i])} · your role</div><h1 class="ptitle">You are the SPY</h1><p class="psub">You have no idea where you are. Listen to the questions and answers, bluff, and work out the place.</p>${btn('next', 'Got it, hide the screen')}`
				: `<div class="gname">${esc(ps.names[i])} · your cover</div><p class="psub">The place is</p><div class="pcard big">${place}</div><p class="psub">Your role there</p><div class="pcard">${roles[i % roles.length]}</div><p class="hint">One of you is a spy who does not know the place. Keep your questions and answers sneaky.</p>${btn('next', 'Got it, hide the screen')}`, { next: () => peek(i + 1) })));

			const talk = () => {
				draw(`<div class="gname">Questions</div><div class="spin" id="spyClock">${spyClock(ps.left)}</div>
					<p class="psub">${pname(first)} asks first. Ask any player a question about the place. They answer, then ask someone else.</p>
					<p class="hint">Sneaky enough to hide the place from the spy. Clear enough to prove you know it.</p>
					<div class="btns">${btn('vote', 'Call the vote')}${btn('own', 'I’m the spy', '', 'ghost')}</div>`, { vote, own });
				spyCountdown(ps.left, vote);
			};

			const own = () => draw(`<div class="gname">Spy reveal</div><p class="psub">Only the spy taps this. Name the place and you win on the spot. Get it wrong and the group wins.</p>${guessChoices(place, places)}${btn('back', 'Cancel, keep playing', '', 'ghost')}`, { guess: verdict, back: talk });

			const vote = () => draw(`<div class="gname">The vote</div><p class="psub">Agree on the spy, then tap their name.</p>
				<div class="plist">${ps.names.map((_, i) => row(i, '', 'sus')).join('')}</div>`, { sus: (i) => accuse(+i) });

			const accuse = (i) => (i !== spy
				? end(true, new Set([i]), 'The group pointed at the wrong player.')
				: pass(spy, () => draw(`<div class="gname">You were caught</div><p class="psub">${pname(spy)}, one chance: where were you?</p>${guessChoices(place, places)}`, { guess: verdict }),
					'<p class="psub">The group caught the spy. Hand the phone over for a last guess.</p>'));

			const verdict = (w) => end(w === place, new Set(), w === place ? `The spy named the place: ${place}.` : `The spy guessed “${w}”. Wrong.`);

			const end = (spiesWin, accused, why) => roundEnd({
				spies: new Set([spy]), spiesWin, accused, head: spiesWin ? 'The spy wins' : 'The group wins', why,
				line: `The place was <b>${place}</b>. Spy: ${pname(spy)}.`, again: deal,
			});

			peek(0);
		}

		deal();
	},
});
