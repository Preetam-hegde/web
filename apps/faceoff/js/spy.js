'use strict';

/* Spy-style party games for 3 to 10 players. Each game is described once, in SPYDEF:
     deal(n, cfg, r)  makes the table (words, who is the spy...) from a random source r
     card(i, d)       what player i is allowed to see
     reveal(d)        the answer, shown when the round is over
   Two ways to play are built from that:
   - one phone passed round: the PARTY entries at the bottom, with in-app voting and scores.
   - everyone on their own phone: table.js. No server; every phone deals from the same seeded random (seeded() in core.js).
   Built on the party framework in party.js (draw, pass, pname, finish...). */

const SPY_DATA = 1; // bump when a word list or a deal() changes, so phones on different versions refuse each other's table codes

const SPY_WORDS = {
	Food: ['biryani', 'dosa', 'samosa', 'paneer tikka', 'masala chai', 'jalebi', 'idli', 'butter chicken', 'pani puri', 'vada pav', 'gulab jamun', 'naan', 'chole bhature', 'mango lassi', 'rasgulla', 'pav bhaji'],
	Places: ['Taj Mahal', 'railway station', 'Goa beach', 'Red Fort', 'cricket stadium', 'temple', 'Gateway of India', 'Kerala backwaters', 'Varanasi ghat', 'spice market', 'Bollywood studio', 'hill station', 'India Gate', 'bus stand', 'Jaipur palace', 'tea garden'],
	Animals: ['tiger', 'elephant', 'peacock', 'cobra', 'camel', 'monkey', 'cow', 'lion', 'rhino', 'leopard', 'parrot', 'buffalo', 'mongoose', 'crow', 'stray dog', 'goat'],
	Jobs: ['cricketer', 'chaiwala', 'auto driver', 'tailor', 'farmer', 'Bollywood actor', 'postman', 'shopkeeper', 'policeman', 'pandit', 'bus conductor', 'engineer', 'barber', 'astrologer', 'dabbawala', 'school teacher'],
	Things: ['saree', 'diya', 'rangoli', 'cricket bat', 'tiffin box', 'bindi', 'harmonium', 'tabla', 'kite', 'charpai', 'pressure cooker', 'chappal', 'scooter', 'ceiling fan', 'gold bangle', 'firecracker'],
	Festivals: ['Diwali', 'Holi', 'Eid', 'Ganesh Chaturthi', 'Navratri', 'Pongal', 'Onam', 'Raksha Bandhan', 'Dussehra', 'Christmas', 'Lohri', 'Baisakhi', 'Makar Sankranti', 'Durga Puja', 'Karva Chauth', 'Ugadi'],
	Games: ['cricket', 'kabaddi', 'hockey', 'badminton', 'kho-kho', 'carrom', 'chess', 'wrestling', 'football', 'tennis', 'gilli danda', 'ludo', 'snakes and ladders', 'kite flying', 'marbles', 'antakshari'],
	Cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Jaipur', 'Goa', 'Pune', 'Kochi', 'Varanasi', 'Agra', 'Mysuru', 'Shimla', 'Udaipur', 'Amritsar'],
};
const SPY_CATS = ['Mixed', ...Object.keys(SPY_WORDS)];

/* Odd Word Out: two words from the same family but clearly different. One goes to the group, the other to the odd player(s). */
const ODD_PAIRS = [
	['lion', 'wolf'], ['tea', 'milk'], ['pizza', 'sandwich'], ['guitar', 'drum'], ['sofa', 'bed'], ['river', 'waterfall'], ['shark', 'whale'],
	['bus', 'train'], ['cinema', 'stadium'], ['cricket', 'football'], ['pen', 'eraser'], ['spoon', 'knife'], ['hotel', 'restaurant'], ['fox', 'dog'],
	['sneakers', 'boots'], ['bicycle', 'motorbike'], ['cake', 'ice cream'], ['king', 'soldier'], ['temple', 'castle'], ['pirate', 'cowboy'],
	['ghost', 'vampire'], ['snow', 'rain'], ['laptop', 'phone'], ['mountain', 'desert'], ['soup', 'salad'], ['police', 'firefighter'], ['piano', 'flute'],
	['wizard', 'superhero'], ['tennis', 'golf'], ['apple', 'banana'], ['onion', 'tomato'], ['rabbit', 'squirrel'], ['crow', 'eagle'], ['bread', 'rice'],
	['helicopter', 'aeroplane'], ['lemon', 'orange'], ['sword', 'shield'], ['doctor', 'pilot'], ['ocean', 'lake'], ['donut', 'pancake'], ['jacket', 'sweater'],
	['newspaper', 'book'], ['rose', 'sunflower'], ['tent', 'hut'], ['backpack', 'wallet'], ['mirror', 'lamp'], ['honey', 'sugar'],
	['chai', 'lassi'], ['samosa', 'jalebi'], ['kabaddi', 'cricket'], ['Holi', 'Diwali'], ['auto rickshaw', 'bus'], ['mango', 'banana'], ['saree', 'turban'],
	['peacock', 'parrot'], ['Taj Mahal', 'Red Fort'], ['dosa', 'chapati'], ['sitar', 'tabla'], ['Mumbai', 'Delhi'],
];
const EMOJI_PAIRS = [
	['🐶', '🐺'], ['🍕', '🍔'], ['🚗', '🚌'], ['⚽', '🏏'], ['☕', '🍵'], ['🍎', '🍅'], ['🌙', '⭐'], ['🐱', '🦁'], ['🚲', '🛵'], ['🌧️', '❄️'],
	['🎸', '🥁'], ['🍌', '🥭'], ['🐘', '🦒'], ['🏠', '🏰'], ['⌚', '📱'], ['🌹', '🌻'], ['🍩', '🧁'], ['✈️', '🚁'], ['👑', '🎩'], ['🐍', '🦎'],
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

GAME_ICONS.spy = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>';
GAME_ICONS.grid = '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>';
GAME_ICONS.odd = '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>';
GAME_ICONS.emoji = '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>';
GAME_ICONS.blank = '<rect width="18" height="18" x="3" y="3" rx="2" stroke-dasharray="4 3"/>';
GAME_ICONS.cover = '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>';

/* ── the games: deal() is pure, so a phone can run it with a seeded random and get the same table as every other phone ── */
const spyNames = (spies) => [...spies].map((i) => pname(i)).join(' & ');
const catRow = { key: 'cat', label: 'Category', vals: SPY_CATS.map((c) => [c, c]) };
const spiesRow = (n) => ({ key: 'spies', label: 'Spies', vals: [[1, '1 spy'], ...(n >= 6 ? [[2, '2 spies']] : [])] });
const youSpy = (i, rest) => `<div class="gname">${esc(ps.names[i])} · your role</div><h1 class="ptitle">You are the SPY</h1>${rest}`;

const SPYDEF = {
	spy: {
		min: 3,
		rows: (n) => [catRow, spiesRow(n)],
		talk: 'Give a clue or ask a question about the word, then pass it round.',
		play: 'Go round the circle with a clue or a question about the word: vague enough to fool the spy, clear enough to prove you know it. Then point at your suspect on three. A caught spy still gets one guess at the word.',
		deal(n, cfg, r) {
			const word = choice(cfg.cat === 'Mixed' ? Object.values(SPY_WORDS).flat() : SPY_WORDS[cfg.cat], r);
			const cat = Object.keys(SPY_WORDS).find((k) => SPY_WORDS[k].includes(word));
			return { word, cat, pool: SPY_WORDS[cat], spies: new Set(shuffle([...Array(n).keys()], r).slice(0, cfg.spies)), first: Math.floor(r() * n) };
		},
		card: (i, d) => (d.spies.has(i)
			? youSpy(i, `<p class="psub">The category is <b>${d.cat}</b>. Listen, blend in, and work out the word.</p>`)
			: `<div class="gname">${esc(ps.names[i])} · your role</div><p class="psub">The secret word is</p><div class="pcard big">${d.word}</div><p class="hint">Category: ${d.cat}. One of you does not know it. Do not say it out loud.</p>`),
		reveal: (d) => `The word was <b>${d.word}</b>. ${spyNames(d.spies)} ${d.spies.size > 1 ? 'were the spies' : 'was the spy'}.`,
	},
	cover: {
		min: 3,
		rows: () => [],
		play: 'Take turns asking another player one question about the place. They answer, then ask someone else. Keep it sneaky: too obvious and the spy learns where you are. Point at your suspect on three. Spy, think you know it? Say so and name the place.',
		deal(n, cfg, r) {
			const place = choice(Object.keys(COVER), r);
			return { place, roles: shuffle(COVER[place], r), spy: Math.floor(r() * n), first: Math.floor(r() * n) };
		},
		card: (i, d) => (i === d.spy
			? youSpy(i, '<p class="psub">You have no idea where you are. Listen to the questions and answers, bluff, and work out the place.</p>')
			: `<div class="gname">${esc(ps.names[i])} · your cover</div><p class="psub">The place is</p><div class="pcard big">${d.place}</div><p class="psub">Your role there</p><div class="pcard">${d.roles[i % d.roles.length]}</div><p class="hint">One of you is a spy who does not know the place. Keep your questions and answers sneaky.</p>`),
		reveal: (d) => `The place was <b>${d.place}</b>. ${pname(d.spy)} was the spy.`,
	},
};

/* Secret Grid: like Who's the Spy, but everyone sees all 16 words of the category with the secret one lit up. The spy sees the grid unlit. */
SPYDEF.grid = {
	...SPYDEF.spy,
	talk: 'Say one word that hints at the secret word, then pass it round.',
	play: 'Go round the circle once: say one word that hints at the secret word. Spot the player whose hint points at the wrong tile, then point at your suspect on three. A caught spy still gets one guess at the word.',
	deal(n, cfg, r) {
		const cat = cfg.cat === 'Mixed' ? choice(Object.keys(SPY_WORDS), r) : cfg.cat;
		const grid = shuffle(SPY_WORDS[cat], r);
		return { cat, grid, pool: grid, word: choice(grid, r), spies: new Set(shuffle([...Array(n).keys()], r).slice(0, cfg.spies)), first: Math.floor(r() * n) };
	},
	card(i, d) {
		const spy = d.spies.has(i);
		return `<div class="gname">${esc(ps.names[i])} · ${d.cat}</div>${spy ? '<h1 class="ptitle">You are the SPY</h1><p class="psub">You can see the grid, but not which word is the secret. Blend in.</p>' : '<p class="psub">The secret word is lit up</p>'}
			<div class="wgrid">${d.grid.map((w) => `<span${!spy && w === d.word ? ' class="hot"' : ''}>${w}</span>`).join('')}</div>
			${spy ? '' : '<p class="hint">One of you cannot see which tile it is. Hint at it without giving it away.</p>'}`;
	},
};

/* Odd Word Out, Odd Emoji and Blank Card: most players share one word, a few hold a close cousin (and are not told),
   and in Blank Card one player holds nothing and knows it. Players are voted out one at a time. */
const oddDef = (pairs, { blank = false, min = 3, show = (w) => w } = {}) => ({
	min,
	rows: () => [],
	roleText: { civ: 'Was a normal player', odd: 'Had the odd word', blank: 'Had the blank card' },
	play: `Go round the circle: one clue each, a single word or a short phrase. Not so vague that you look lost, not so clear that you give it away. Then point at a suspect on three. Use “Check a player” on whoever you vote out to see what they held, and keep going until ${blank ? 'every odd and blank player is out' : 'every odd player is out'} or the group is outnumbered.`,
	badHead: (d) => (d.blanks.size ? 'The impostors win' : d.odds.size > 1 ? 'The odd ones win' : 'The odd one wins'),
	deal(n, cfg, r) {
		const [a, b] = shuffle(choice(pairs, r), r);
		const ids = shuffle([...Array(n).keys()], r);
		const odds = new Set(ids.slice(0, n >= (blank ? 9 : 7) ? 2 : 1));
		return { a, b, odds, blanks: new Set(blank ? ids.slice(odds.size, odds.size + 1) : []), first: Math.floor(r() * n), pool: [...new Set(pairs.flat())] };
	},
	role: (i, d) => (d.odds.has(i) ? 'odd' : d.blanks.has(i) ? 'blank' : 'civ'),
	card: (i, d) => (d.blanks.has(i)
		? `<div class="gname">${esc(ps.names[i])} · your card</div><h1 class="ptitle">Blank card</h1><p class="psub">You have no word. Listen to the clues, work out what it is, and bluff your way through.</p>`
		: `<div class="gname">${esc(ps.names[i])} · your word</div><p class="psub">Your secret word is</p><div class="pcard big">${show(d.odds.has(i) ? d.b : d.a)}</div><p class="hint">Remember it and never say it. A few players hold a slightly different word, and nobody knows who.${blank ? ' One player holds a blank card instead.' : ''}</p>`),
	reveal: (d) => `The group had <b>${show(d.a)}</b>. The odd word was <b>${show(d.b)}</b>, held by ${spyNames(d.odds)}.${d.blanks.size ? ` The blank card: ${spyNames(d.blanks)}.` : ''}`,
});
SPYDEF.odd = oddDef(ODD_PAIRS);
SPYDEF.emoji = oddDef(EMOJI_PAIRS, { show: (w) => `<span style="font-size:2.4em;line-height:1.1">${w}</span>` });
SPYDEF.blank = oddDef(ODD_PAIRS, { blank: true, min: 6 });

/* ── shared screens and helpers ── */
const spyClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const needMin = (id, min) => draw(`<h1 class="ptitle">${gameIcon(id)} Needs ${min} players</h1><p class="psub">${min < 4 ? 'With two players there is nobody to hide from.' : 'With fewer players the odd ones are found far too easily.'} Add some more and try again.</p>${btn('back', 'Back to players')}`, { back: roster });

/* The option rows of a game ({ key, label, vals: [[value, text]] }): drawn as buttons, kept in a cfg object. */
const segHtml = (r, cfg) => `<div class="seg" style="flex-wrap:wrap;justify-content:center;margin-bottom:14px"><span style="flex:0 0 100%;text-align:center;margin:0">${r.label}</span>${r.vals.map(([v, t]) => `<button type="button" data-k="set" data-v="${r.key}:${v}" aria-pressed="${String(cfg[r.key] === v)}">${t}</button>`).join('')}</div>`;
const setCfg = (cfg, kv) => {
	const [k, ...rest] = kv.split(':');
	cfg[k] = typeof cfg[k] === 'number' ? +rest.join(':') : rest.join(':');
};
const fixCfg = (rows, cfg) => rows.forEach((r) => { if (!r.vals.some(([v]) => v === cfg[r.key])) cfg[r.key] = r.vals[0][0]; });
/* Option rows packed into one number (and back), so a table code can carry them. */
const encOpts = (rows, cfg) => rows.reduce((x, r) => x * r.vals.length + r.vals.findIndex(([v]) => v === cfg[r.key]), 0);
const decOpts = (rows, x) => {
	const cfg = {};
	for (const r of [...rows].reverse()) { cfg[r.key] = r.vals[x % r.vals.length][0]; x = Math.floor(x / r.vals.length); }
	return cfg;
};

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
const guessChoices = (answer, pool) => `<div class="pchoices">${shuffle([answer, ...shuffle([...new Set(pool)].filter((w) => w !== answer)).slice(0, 7)]).map((w) => `<button class="choice" type="button" data-k="guess" data-v="${esc(w)}">${w}</button>`).join('')}</div>`;

/* Pass the phone round once, each player seeing their own card. */
function dealAround(def, d, n, then) {
	const peek = (i) => (i >= n ? then() : pass(i, () => draw(`${def.card(i, d)}${btn('next', 'Got it, hide the screen')}`, { next: () => peek(i + 1) })));
	peek(0);
}

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

/* ── one phone, passed round ── */

/* Who's the Spy and Secret Grid: talk, vote, and a caught spy still gets one guess. */
function spyFlow(def) {
	const n = ps.names.length, id = ps.game.id;
	if (n < def.min) return needMin(id, def.min);
	const cfg = (ps.cfg ||= { mins: 3 }); // kept between rounds
	const rows = () => [...def.rows(n), { key: 'mins', label: 'Discussion', vals: [[2, '2 min'], [3, '3 min'], [5, '5 min']] }];
	const setup = () => {
		fixCfg(rows(), cfg);
		draw(`<h1 class="ptitle">${gameIcon(id)} Set up the round</h1>
			<div class="spyset">${rows().map((r) => segHtml(r, cfg)).join('')}</div>
			${btn('go', 'Deal the roles')}`, { set(kv) { setCfg(cfg, kv); setup(); }, go: deal });
	};

	function deal() {
		const d = def.deal(n, cfg, Math.random), k = d.spies.size;

		function talk() {
			draw(`<div class="gname">Discussion</div><div class="spin" id="spyClock">${spyClock(cfg.mins * 60)}</div>
				<p class="psub">${pname(d.first)} goes first. ${def.talk}</p>
				<p class="hint">Clear enough to prove you know it. Vague enough to fool the spy.</p>${btn('vote', 'Call the vote')}`, { vote });
			spyCountdown(cfg.mins * 60, vote);
		}

		function vote() {
			const picked = new Set();
			const view = () => draw(`<div class="gname">The vote</div><p class="psub">Agree on ${k > 1 ? `${k} suspects` : 'a suspect'}, then tap ${k > 1 ? 'their names' : 'the name'}.</p>
				<div class="chips">${ps.names.map((nm, i) => `<button class="pchip" type="button" data-k="sus" data-v="${i}" style="--c:${col(i)};${picked.has(i) ? 'outline:3px solid #fff;outline-offset:2px' : ''}">${esc(nm)}</button>`).join('')}</div>
				<button class="btn" type="button" data-k="go"${picked.size === k ? '' : ' disabled'}>Reveal</button>`, {
				sus(v) {
					const i = +v;
					if (picked.has(i)) picked.delete(i);
					else if (picked.size < k) picked.add(i);
					view();
				},
				go: () => resolve(picked),
			});
			view();
		}

		function resolve(picked) {
			if (![...picked].every((i) => d.spies.has(i))) return result(true, picked, 'The group pointed at the wrong player.');
			const guesser = [...d.spies][0];
			pass(guesser, () => draw(`<div class="gname">You were caught</div><p class="psub">${pname(guesser)}, one chance: what was the secret word?</p>${guessChoices(d.word, d.pool)}`, {
				guess: (w) => result(w === d.word, picked, w === d.word ? `The spy guessed it: ${d.word}.` : `The spy guessed “${w}”. Wrong.`),
			}), `<p class="psub">The group caught ${k > 1 ? 'the spies' : 'the spy'}. Hand the phone to a spy for a last guess.</p>`);
		}

		const result = (spiesWin, picked, why) => roundEnd({
			spies: d.spies, spiesWin, accused: picked, head: spiesWin ? 'The spy wins' : 'The group wins', why, line: def.reveal(d), again: setup,
		});

		dealAround(def, d, n, talk);
	}

	setup();
}

/* Odd Word Out, Odd Emoji and Blank Card: clue rounds and a vote each round. The group wins when every odd (and blank) player is out;
   they win when the group no longer outnumbers them. A blank card voted out gets one guess at the group's word. */
function oddFlow(def) {
	const n = ps.names.length;
	if (n < def.min) return needMin(ps.game.id, def.min);

	function deal() {
		const d = def.deal(n, {}, Math.random), out = new Set();
		let round = 1;
		const bad = (i) => d.odds.has(i) || d.blanks.has(i);
		const left = () => [...Array(n).keys()].filter((i) => !out.has(i));

		const clues = () => draw(`<div class="gname">Clue round ${round}</div><h1 class="ptitle">One clue each</h1>
			<p class="psub">Go in this order. One word or a short phrase about your word. Vague enough not to give it away, clear enough to fit in.</p>
			<div class="plist">${shuffle(left()).map((i, k) => row(i, k + 1)).join('')}</div>${btn('vote', 'Vote someone out')}`, { vote });

		const vote = () => draw(`<div class="gname">The vote</div><p class="psub">Agree on who is the odd one out, then tap their name.</p>
			<div class="plist">${left().map((i) => row(i, '', 'out')).join('')}</div>`, { out: (i) => oust(+i) });

		function oust(i) {
			out.add(i);
			if (!d.blanks.has(i)) return after(i);
			pass(i, () => draw(`<div class="gname">You were voted out</div><p class="psub">${pname(i)}, you held the blank card. One chance: what was the group’s word?</p>${guessChoices(d.a, d.pool)}`, {
				guess: (w) => (w === d.a ? finale(true, `${pname(i)} named the group’s word: ${d.a}.`) : after(i, `${pname(i)} guessed “${w}”. Wrong.`)),
			}));
		}

		function after(i, note = '') {
			const rest = left(), badLeft = rest.filter(bad).length;
			const over = !badLeft || rest.length - badLeft <= badLeft; // the group caught them all, or can no longer outvote them
			sfx[bad(i) ? 'win' : 'bad']();
			draw(`<div class="gname">Voted out</div><div class="hero">${avatar(i, '96px')}</div><h1 class="ptitle">${pname(i)}</h1>
				<div class="res ${bad(i) ? 'win' : 'lose'}">${def.roleText[def.role(i, d)]}</div>
				${note ? `<p class="psub">${note}</p>` : ''}
				${over ? '' : `<p class="psub">${badLeft > 1 ? `${badLeft} odd players are` : 'An odd player is'} still among you.</p>`}
				${btn('next', over ? 'See the result' : 'Next clue round')}`, { next: () => (over ? finale(badLeft > 0) : (round++, clues())) });
		}

		const finale = (badWin, why = badWin ? 'They blended in until the end.' : d.blanks.size ? 'Every impostor was voted out.' : 'Every odd player was voted out.') => roundEnd({
			spies: new Set([...d.odds, ...d.blanks]), spiesWin: badWin, accused: out, head: badWin ? def.badHead(d) : 'The group wins', why, line: def.reveal(d), again: deal,
		});

		dealAround(def, d, n, clues);
	}

	deal();
}

/* Cover Story: ask and answer, call the vote, or let the spy guess the place early. */
function coverFlow(def) {
	const n = ps.names.length, places = Object.keys(COVER);
	if (n < def.min) return needMin('cover', def.min);

	function deal() {
		const d = def.deal(n, {}, Math.random);
		ps.left = 360;

		const talk = () => {
			draw(`<div class="gname">Questions</div><div class="spin" id="spyClock">${spyClock(ps.left)}</div>
				<p class="psub">${pname(d.first)} asks first. Ask any player a question about the place. They answer, then ask someone else.</p>
				<p class="hint">Sneaky enough to hide the place from the spy. Clear enough to prove you know it.</p>
				<div class="btns">${btn('vote', 'Call the vote')}${btn('own', 'I’m the spy', '', 'ghost')}</div>`, { vote, own });
			spyCountdown(ps.left, vote);
		};

		const own = () => draw(`<div class="gname">Spy reveal</div><p class="psub">Only the spy taps this. Name the place and you win on the spot. Get it wrong and the group wins.</p>${guessChoices(d.place, places)}${btn('back', 'Cancel, keep playing', '', 'ghost')}`, { guess: verdict, back: talk });

		const vote = () => draw(`<div class="gname">The vote</div><p class="psub">Agree on the spy, then tap their name.</p>
			<div class="plist">${ps.names.map((_, i) => row(i, '', 'sus')).join('')}</div>`, { sus: (i) => accuse(+i) });

		const accuse = (i) => (i !== d.spy
			? end(true, new Set([i]), 'The group pointed at the wrong player.')
			: pass(d.spy, () => draw(`<div class="gname">You were caught</div><p class="psub">${pname(d.spy)}, one chance: where were you?</p>${guessChoices(d.place, places)}`, { guess: verdict }),
				'<p class="psub">The group caught the spy. Hand the phone over for a last guess.</p>'));

		const verdict = (w) => end(w === d.place, new Set(), w === d.place ? `The spy named the place: ${d.place}.` : `The spy guessed “${w}”. Wrong.`);

		const end = (spiesWin, accused, why) => roundEnd({
			spies: new Set([d.spy]), spiesWin, accused, head: spiesWin ? 'The spy wins' : 'The group wins', why, line: def.reveal(d), again: deal,
		});

		dealAround(def, d, n, talk);
	}

	deal();
}

/* ── the hub entries ── */
const WHO = 'Everyone’s own phone (best for groups) or one phone passed round. 3 to 10 players.';
const LOOK = 'Everyone sees their own card, either on their own phone or by passing the phone round once.';

PARTY.push({
	id: 'spy', name: 'Who’s the Spy', blurb: 'One of you does not know the secret word. Find the spy before they fake it.',
	need: WHO, table: true,
	steps: [
		'Pick a category, how many spies (2 only with 6 or more players) and how long you get to talk.',
		`${LOOK} Everyone except the spy sees the same secret word. The spy only sees the category.`,
		'Talk it out. Go round the circle giving a clue or asking a question about the word, vague enough to fool the spy and clear enough to prove you know it.',
		'Spies: blend in and work out the word from what you hear.',
		'Call the vote any time, or when the clock runs out. Everyone points at the suspect on three (one phone: tap the name).',
		'Catch every spy and each spy side still gets one guess at the word. Guess right and the spies win after all.',
	],
	win: 'The group scores 1 point each for catching the spy. A spy who survives, or guesses the word, scores 2. Caught spies and wrongly accused players take a sip. (One phone keeps score for you.)',
	run: () => spyFlow(SPYDEF.spy),
});

PARTY.push({
	id: 'grid', name: 'Secret Grid', blurb: 'Everyone sees 16 words and one is lit up, except the spy. One word hint each.',
	need: WHO, table: true,
	steps: [
		'Pick a category. Everyone sees the same grid of 16 words.',
		`${LOOK} On every card but the spy’s, one tile is lit up. That is the secret word. The spy sees the grid with nothing lit.`,
		'Go round the circle once. Each player says one word that hints at the secret tile. Too obvious and the spy gets it, too vague and you look like the spy.',
		'Spy: say something that fits the grid and work out which tile is lit.',
		'Everyone points at the suspect on three. A caught spy still gets one guess at the word.',
	],
	win: 'The group scores 1 point each for catching the spy. A spy who survives, or guesses the word, scores 2. (One phone keeps score for you.)',
	run: () => spyFlow(SPYDEF.grid),
});

PARTY.push({
	id: 'odd', name: 'Odd Word Out', blurb: 'Everyone gets the same word, except one player who gets a related one. Nobody knows who.',
	need: WHO, table: true,
	steps: [
		`${LOOK} Most players get the same word, but one player (two with 7 or more) gets a related one, say lion instead of wolf. Nobody is told which they are, so it could be you.`,
		'Go round the circle. Each player gives one clue about their word, a single word or a short phrase. Not so vague that you look lost, not so clear that you give it away.',
		'Listen for the clue that does not quite fit. If your own clue felt off when you heard the others, you may be the odd one.',
		'Everyone points at a suspect on three. They are out, and the group learns whether they held the odd word.',
		'Keep going until every odd player is out, or until there are as many odd players as normal players left.',
	],
	win: 'Catch every odd player and the group scores 1 point each. An odd player who survives scores 2. Anyone voted out wrongly, and a caught odd player, takes a sip. (One phone keeps score for you.)',
	run: () => oddFlow(SPYDEF.odd),
});

PARTY.push({
	id: 'emoji', name: 'Odd Emoji', blurb: 'Odd Word Out with pictures. Describe your emoji without naming it.',
	need: WHO, table: true,
	steps: [
		`${LOOK} Most players see the same emoji, but one player (two with 7 or more) sees a different one from the same family. Nobody is told which they are.`,
		'Go round the circle. Describe what you see in a word or a short phrase, without saying what it is.',
		'Listen for the clue that does not match. Your own clue might be the one.',
		'Everyone points at a suspect on three. They are out, and the group learns whether they saw the odd emoji.',
		'Keep going until every odd player is out, or until there are as many odd players as normal players left.',
	],
	win: 'Same as Odd Word Out: the group scores 1 point each for catching them all, the odd one scores 2 for surviving. (One phone keeps score for you.)',
	run: () => oddFlow(SPYDEF.emoji),
});

PARTY.push({
	id: 'blank', name: 'Blank Card', blurb: 'Most share a word, one has a related word, and one has nothing at all.',
	need: 'Everyone’s own phone (best for groups) or one phone passed round. 6 to 10 players.', table: true,
	steps: [
		`${LOOK} Most players get the same word. One gets a related word and is not told. One gets a blank card and knows it.`,
		'Go round the circle with one clue each. The blank player has to bluff, and work out the word from what they hear.',
		'Everyone points at a suspect on three. They are out and the group learns what they held.',
		'A blank card that is voted out gets one guess at the group’s word. Guess right and the odd side wins on the spot.',
		'Keep going until every odd and blank player is out, or the group no longer outnumbers them.',
	],
	win: 'The group scores 1 point each for catching everyone. The odd and blank players score 2 each if they survive. (One phone keeps score for you.)',
	run: () => oddFlow(SPYDEF.blank),
});

PARTY.push({
	id: 'cover', name: 'Cover Story', blurb: 'Everyone knows the place and their role there, except the spy. Ask sneaky questions.',
	need: WHO, table: true,
	steps: [
		`${LOOK} Everyone except the spy sees the same place and their own role there. The spy sees nothing at all.`,
		'Take turns asking another player one question about the place. They answer, then ask someone else (not whoever just asked them).',
		'Be sneaky: if your question or answer is too obvious, the spy learns where you are.',
		'Spy: listen, bluff, and work out the place. Think you have it? Say so and name it. Right and you win on the spot, wrong and the group does.',
		'Call the vote any time, then point at the suspect on three. Catch the spy and they still get one guess at the place.',
	],
	win: 'The group scores 1 point each for catching the spy. A spy who survives, or names the place, scores 2. (One phone keeps score for you.)',
	run: () => coverFlow(SPYDEF.cover),
});
