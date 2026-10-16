'use strict';

/* Party games: 2 to 10 players around one shared phone. The duel engine in core.js has two panes; these run on a
   single full screen (content in the middle, buttons docked at the thumb) and hand the phone around for anything
   secret. Four original games in the spirit of the classic party card games. A "sip" is only a penalty tally,
   so water, a snack or a forfeit works as well.

   A game is { id, name, blurb, need, steps, win, run() }. run() draws screens with draw(html, handlers):
   a handler fires when a button with data-k="<key>" is tapped and receives its data-v. Top-level .btn and
   .btns elements in the html are moved to the dock at the bottom of the screen. */

const PARTY = [];
const MIN_P = 2, MAX_P = 10;
let ps = null; // the party in progress: { game, playing, names, look, sips, pts, timer, ... }, or null on the hub

/* ── player look: an icon and a colour each. Inline SVG (no library), drawn in currentColor. ── */
const AVATARS = {
	cat: '<path d="M4 4l4 3a8 8 0 0 1 8 0l4-3v9a8 8 0 0 1-16 0z"/><path d="M9 13h.01M15 13h.01"/><path d="M10.5 16.5c.5.5 2.5.5 3 0"/>',
	dog: '<circle cx="12" cy="12.5" r="6.5"/><path d="M6 7C3 7 2.5 12 3.5 14.5M18 7c3 0 3.5 5 2.5 7.5"/><path d="M9.5 12h.01M14.5 12h.01"/><path d="M11 15h2l-1 1.2z"/>',
	fox: '<path d="M3 4l5 4h8l5-4-1.5 9L12 21 4.5 13z"/><path d="M9 12h.01M15 12h.01"/><path d="M10.5 16h3L12 17.6z"/>',
	bunny: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10C7 4 8 2 9.5 2s2 3 2 7.2"/><path d="M15.5 10C17 4 16 2 14.5 2s-2 3-2 7.2"/><path d="M10 15h.01M14 15h.01"/><path d="M11 17.5h2"/>',
	bear: '<circle cx="12" cy="13" r="7.5"/><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M9 12h.01M15 12h.01"/><ellipse cx="12" cy="15.5" rx="2.5" ry="1.8"/>',
	frog: '<circle cx="7.5" cy="8" r="3"/><circle cx="16.5" cy="8" r="3"/><path d="M4.6 10c-1.3 1.7-1.5 4.2-.4 6 1.4 2.4 4.6 4 7.8 4s6.4-1.6 7.8-4c1.1-1.8.9-4.3-.4-6"/><path d="M8 15c2.5 1.7 5.5 1.7 8 0"/><path d="M7.5 8h.01M16.5 8h.01"/>',
	owl: '<path d="M5 9c0-3 1.8-6 4-6 1 0 2 .6 3 1.6C13 3.6 14 3 15 3c2.2 0 4 3 4 6v5a7 7 0 0 1-14 0z"/><circle cx="9" cy="10.5" r="2"/><circle cx="15" cy="10.5" r="2"/><path d="M11 14l1 1.6 1-1.6z"/>',
	robot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M2 13v3M22 13v3"/><path d="M9 13h.01M15 13h.01"/><path d="M9.5 16.5h5"/>',
	alien: '<path d="M12 3C7 3 4 7.5 4 12.5c0 4 3.5 8.5 8 8.5s8-4.5 8-8.5C20 7.5 17 3 12 3z"/><path d="M7.5 11.5c2 0 3.2 1 3.5 2.6-2.2.1-3.6-.6-3.5-2.6zM16.5 11.5c-2 0-3.2 1-3.5 2.6 2.2.1 3.6-.6 3.5-2.6z"/><path d="M10.5 18h3"/>',
	ghost: '<path d="M5 21V11a7 7 0 0 1 14 0v10l-2.8-2-2.8 2-2.8-2-2.8 2-2.8-2z"/><path d="M9.5 11h.01M14.5 11h.01"/>',
	skull: '<path d="M12 3C7.5 3 4.5 6 4.5 10c0 2.5 1.2 4 2.5 5v3h10v-3c1.3-1 2.5-2.5 2.5-5 0-4-3-7-7.5-7z"/><path d="M9.5 11.5h.01M14.5 11.5h.01"/><path d="M10 18v2M14 18v2"/>',
	crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M8 15.5h8"/>',
	star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
	flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
	bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
	heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
	moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
	smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
};
const AV_IDS = Object.keys(AVATARS);
const SWATCHES = ['#ff7a59', '#35d6c8', '#f7c948', '#b794f6', '#7cf29a', '#ff8fb1', '#6ec1ff', '#ffa94d', '#c3e88d', '#e0a3ff', '#ff5d73', '#a8b4ff'];

/* The saved roster: [{ n: name, ic: icon id, c: colour }]. Older saves held plain names. */
function players() {
	const list = Array.isArray(store.party) ? store.party : [];
	while (list.length < MIN_P) list.push({});
	return (store.party = list.map((p, i) => {
		const o = p && typeof p === 'object' ? p : { n: p };
		return { n: String(o.n ?? ''), ic: AVATARS[o.ic] ? o.ic : AV_IDS[i % AV_IDS.length], c: /^#[0-9a-f]{6}$/i.test(o.c) ? o.c : SWATCHES[i % SWATCHES.length] };
	}));
}

const av = (p, s = '28px') => `<span class="av" style="--c:${p.c};--s:${s}"><svg viewBox="0 0 24 24" aria-hidden="true">${AVATARS[p.ic]}</svg></span>`;
const avatar = (i, s) => av(ps.look[i], s);
const col = (i) => ps.look[i].c;
const pname = (i) => `<span class="pn">${avatar(i, '1.45em')}<b style="color:${col(i)}">${esc(ps.names[i])}</b></span>`;
const btn = (k, label, v = '', cls = '') => `<button class="btn ${cls}" type="button" data-k="${k}"${v === '' ? '' : ` data-v="${v}"`}>${label}</button>`;
const chips = (k, skip = -1) => `<div class="chips">${ps.names.map((n, i) => (i === skip ? '' : `<button class="pchip" type="button" data-k="${k}" data-v="${i}" style="--c:${col(i)}">${avatar(i, '26px')}${esc(n)}</button>`)).join('')}</div>`;
const row = (i, em, k = '') => `<${k ? `button type="button" data-k="${k}" data-v="${i}"` : 'div'} class="prow" style="--c:${col(i)}">${avatar(i, '40px')}<span>${esc(ps.names[i])}</span><em>${em}</em></${k ? 'button' : 'div'}>`;
const toast = (t) => `<p class="toast">${t}</p>`;
const prog = (done, total) => `<div class="prog" aria-hidden="true"><i style="width:${Math.round((done / total) * 100)}%"></i></div>`;
const sip = (i, n = 1) => { ps.sips[i] += n; };

function draw(html, on = {}, keepScroll = false) {
	const body = $('#partyBody'), dock = $('#partyDock');
	clearInterval(ps?.timer); // a screen change always ends a running countdown
	body.innerHTML = html;
	dock.replaceChildren(...[...body.children].filter((el) => el.matches('.btn, .btns'))); // buttons live at the thumb
	body.oninput = null;
	$('#party').onclick = (e) => {
		const b = e.target.closest('[data-k]');
		if (b && on[b.dataset.k]) on[b.dataset.k](b.dataset.v);
	};
	$('#partyRules').hidden = !ps?.playing;
	if (!keepScroll) body.scrollTop = 0;
}

const rulesHtml = (g) => `<div class="hero">${gameIcon(g.id)}</div><h1 class="ptitle">${g.name}</h1><p class="psub">${g.blurb}</p>
	<div class="rules"><h2>You need</h2><p>${g.need}</p><h2>How to play</h2><ol class="steps">${g.steps.map((s) => `<li>${s}</li>`).join('')}</ol><h2>Winning</h2><p>${g.win}</p></div>
	<p class="pnote">A “sip” is just the penalty tally. Water, a snack or a forfeit works as well as a drink. Drinking? Only if you are of legal age, pace yourself, and never drive.</p>`;

const showRules = (then, label) => draw(`${rulesHtml(ps.game)}${btn('ok', label)}`, { ok: then });

function startParty(id) {
	store.party ||= [{ n: store.names[0] || '' }, { n: store.names[1] || '' }];
	ps = { game: PARTY.find((g) => g.id === id), playing: false, open: -1 };
	sfx.unlock();
	$('#party').dataset.game = id;
	$('#partyTitle').innerHTML = `${gameIcon(id)} ${ps.game.name}`;
	document.body.dataset.screen = 'party';
	showRules(() => roster(), 'Got it, pick players');
}

/* Roster: a name, an icon and a colour for each player. Tap an avatar to change its look. */
function roster(keep = false) {
	const list = players();
	const picker = (p, i) => `<div class="picker"><div class="icons">${AV_IDS.map((id) => `<button type="button" data-k="ic" data-v="${i}:${id}" aria-pressed="${p.ic === id}" aria-label="${id}"><svg viewBox="0 0 24 24">${AVATARS[id]}</svg></button>`).join('')}</div>
		<div class="swatches">${SWATCHES.map((c) => `<button type="button" data-k="cl" data-v="${i}:${c}" aria-pressed="${p.c === c}" style="--s:${c}" aria-label="colour ${c}"></button>`).join('')}</div></div>`;
	draw(`<div class="hero">${gameIcon(ps.game.id)}</div><h1 class="ptitle">Who’s playing?</h1><p class="psub">${MIN_P} to ${MAX_P} players. Tap an avatar to pick an icon and colour.</p>
		<div class="roster">${list.map((p, i) => `<div class="rrow" style="--c:${p.c}"><div class="top"><button class="avbtn" type="button" data-k="look" data-v="${i}" aria-label="Icon and colour for player ${i + 1}">${av(p, '52px')}</button><input data-i="${i}" maxlength="14" placeholder="Player ${i + 1}" value="${esc(p.n)}" autocomplete="off" aria-label="Player ${i + 1} name">${list.length > MIN_P ? `<button class="x" type="button" data-k="del" data-v="${i}" aria-label="Remove player ${i + 1}">✕</button>` : ''}</div>${ps.open === i ? picker(p, i) : ''}</div>`).join('')}</div>
		${ps.game.editor ? '<button class="minebtn" type="button" data-k="mine">✍️ Add your own cards</button>' : ''}
		<button class="link" type="button" data-k="rules">Read the rules again</button>
		<div class="btns">${list.length < MAX_P ? btn('add', '+ Player', '', 'ghost') : ''}${btn('go', 'Deal me in')}</div>`, {
		look: (i) => { ps.open = ps.open === +i ? -1 : +i; roster(true); },
		ic: (v) => { const [i, id] = v.split(':'); list[+i].ic = id; save(); roster(true); },
		cl: (v) => { const [i, c] = v.split(':'); list[+i].c = c; save(); roster(true); },
		add() {
			const used = list.map((p) => p.ic), shades = list.map((p) => p.c);
			list.push({ n: '', ic: AV_IDS.find((id) => !used.includes(id)) || AV_IDS[list.length], c: SWATCHES.find((c) => !shades.includes(c)) || SWATCHES[list.length % SWATCHES.length] });
			save();
			roster(true);
		},
		del: (i) => { list.splice(+i, 1); ps.open = -1; save(); roster(true); },
		mine: () => ps.game.editor(),
		go: beginParty,
		rules: () => showRules(() => roster(), 'Back to players'),
	}, keep);
	$('#partyBody').oninput = (e) => {
		if (e.target.dataset.i) { list[+e.target.dataset.i].n = e.target.value; save(); }
	};
}

function beginParty() {
	const list = players();
	ps.names = list.map((p, i) => p.n.trim() || `Player ${i + 1}`);
	ps.look = list.map((p) => ({ ic: p.ic, c: p.c }));
	ps.playing = true;
	ps.sips = ps.names.map(() => 0);
	ps.pts = ps.names.map(() => 0);
	ps.game.run();
}

function leaveParty() {
	clearInterval(ps?.timer);
	ps = null;
	quit();
}

/* "Pass the phone to ..." before anything secret. */
const pass = (i, then, note = '') => draw(`<div class="hero">${avatar(i, '124px')}</div><p class="gname">Pass the phone to</p><h1 class="ptitle" style="color:${col(i)}">${esc(ps.names[i])}</h1>${note}${btn('me', `I’m ${esc(ps.names[i])}`)}`, { me: then });

/* A heat picker for the games that come in levels. */
const pickHeat = (levels, then) => draw(`<div class="hero">${gameIcon(ps.game.id)}</div><h1 class="ptitle">Pick the heat</h1><p class="psub">${ps.game.name}</p>
	<div class="pchoices">${levels.map(([t, d], i) => `<button class="choice" type="button" data-k="heat" data-v="${i}"><b>${t}</b><small>${d}</small></button>`).join('')}</div>`, { heat: (i) => then(+i) });

/* Final screen: winners by score (highest wins), a row per player, and who sipped the most. */
function finish(score, fmt, verb = ['wins', 'tie']) {
	const g = ps.game;
	store.plays[g.id] = (store.plays[g.id] || 0) + 1;
	save();
	sfx.win();
	const ids = ps.names.map((_, i) => i);
	const best = Math.max(...ids.map(score));
	const win = ids.filter((i) => score(i) === best);
	const most = Math.max(...ps.sips);
	const dry = most ? ids.filter((i) => ps.sips[i] === most).map((i) => esc(ps.names[i])).join(' & ') : '';
	const rows = [...ids].sort((a, b) => score(b) - score(a)).map((i) => row(i, `${fmt(i)} · ${ps.sips[i]} sip${ps.sips[i] === 1 ? '' : 's'}`)).join('');
	draw(`<div class="gname">${g.name} · final</div>
		<div class="hero crowd">${win.map((i) => avatar(i, win.length > 3 ? '64px' : '96px')).join('')}</div>
		<div class="res win">🏆 ${win.map((i) => esc(ps.names[i])).join(' & ')} ${win.length > 1 ? verb[1] : verb[0]}</div>
		<div class="plist">${rows}</div>
		<p class="psub">${dry ? `Most sips: ${dry} (${most})` : 'Nobody took a sip. Suspicious.'}</p>
		<div class="btns">${btn('hub', 'Hub', '', 'ghost')}${btn('again', 'Play again')}</div>`, { again: beginParty, hub: leaveParty });
}

const endLink = '<button class="link" type="button" data-k="end">End game early</button>';

/* ═══ Trope Sip: secret TV tropes; spot yours on screen and everyone else sips ═══ */
const TROPES = [
	'Someone says “We need to talk.”', 'A character walks away from an explosion without looking back.', 'A slow-motion walk.',
	'A cliffhanger or a “to be continued”.', 'A character presumed dead turns out to be fine.', 'A love triangle.',
	'An inspirational speech.', 'A flashback montage.', 'A villain explains the whole plan out loud.',
	'Someone says “It’s not what it looks like.”', 'Someone makes a big dramatic entrance.', 'A phone with no signal at the worst moment.',
	'A character overhears half a conversation and gets the wrong idea.', 'Rain during a sad moment.', 'Someone gets caught in a lie.',
	'A dramatic zoom on someone’s face.', 'Someone slams a door.', 'A character reads a letter in voiceover.',
	'A dream sequence that turns out to be a dream.', 'Someone whispers “Run.”', 'A planning or heist montage.',
	'A kid says something unexpectedly wise.', 'An awkward silence and a cut to someone sipping coffee.', 'Someone drops a bombshell revelation.',
	'A character looks straight at the camera.', 'Someone says “I can explain.”', 'A kiss gets interrupted.',
	'Someone drives off angrily.', 'Someone says “You don’t understand!”', 'A sudden loud noise makes someone jump.',
	'Someone arrives at the last possible second.', 'A montage set to a pop song.', 'A hacker types furiously.',
	'Someone walks in on something awkward.', 'A dramatic “Hello? Hello?” on the phone.', 'Someone says “Trust me.”',
	'A group stands around a table full of maps or screens.', 'A convenient clue falls into someone’s lap.', 'Awkward laughter during a tense moment.',
	'A character makes a big decision and the music swells.',
];

PARTY.push({
	id: 'tropes', name: 'Trope Sip', blurb: 'Secret TV tropes. Spot yours on screen and everyone else sips.',
	need: 'A show or movie with a plot, and one phone in the middle of the room.',
	steps: [
		'Everyone is secretly dealt 3 TV tropes. Pass the phone around once: peek at yours, then hide the screen.',
		'Put a show on. When one of your tropes happens on screen, tap your name and pick it. Cover the screen so nobody sees the rest of your hand.',
		'Stuck with tropes that never show up? Tap your name and swap your whole hand for 1 sip.',
		'The group votes. It really happened: your trope is gone and everyone else takes a sip. A bluff: you take 2 sips and keep it.',
	],
	win: 'Be the first to clear all 3 tropes. If you end early, whoever has the fewest left wins.',
	run() {
		const deck = shuffle(TROPES);
		ps.hands = ps.names.map(() => deck.splice(0, 3));
		const fin = () => finish((i) => -ps.hands[i].length, (i) => `${ps.hands[i].length} left`);
		const fresh = (k) => shuffle(TROPES.filter((t) => !ps.hands.flat().includes(t))).slice(0, k); // never a card anyone holds
		const reveal = (i, then) => draw(`<div class="hero">${avatar(i, '72px')}</div><div class="gname">${esc(ps.names[i])}’s secret tropes</div>${ps.hands[i].map((t) => `<div class="pcard">${t}</div>`).join('')}<p class="hint">Memorise them, then hide the screen.</p>${btn('next', 'Got them, hide the screen')}`, { next: then });
		const watch = (note = '') => draw(`<div class="gname">Now watching</div><h1 class="ptitle">Put a show on</h1><p class="psub">Spot one of your tropes? Tap your name.</p>${note}
			<div class="plist">${ps.names.map((n, i) => row(i, `${'●'.repeat(ps.hands[i].length)}${'○'.repeat(3 - ps.hands[i].length)}`, 'call')).join('')}</div>
			${endLink}`, { call: (i) => pick(+i), end: fin });
		const pick = (i) => draw(`<div class="gname">${esc(ps.names[i])} spotted one</div><p class="psub">Cover the screen. Which trope just happened?</p>
			<div class="pchoices">${ps.hands[i].map((t, j) => `<button class="choice" type="button" data-k="pick" data-v="${j}">${t}</button>`).join('')}</div>
			<div class="btns">${btn('swap', 'Swap my hand (1 sip)', '', 'ghost')}${btn('back', 'Cancel', '', 'ghost')}</div>`, {
			pick: (j) => verify(i, +j),
			back: () => watch(),
			swap() {
				sip(i);
				ps.hands[i] = fresh(ps.hands[i].length);
				sfx.lock();
				reveal(i, () => watch(toast(`${pname(i)} swapped their hand for 1 sip.`)));
			},
		});
		const verify = (i, j) => draw(`<div class="gname">${esc(ps.names[i])} says this just happened</div><div class="pcard big">${ps.hands[i][j]}</div><p class="psub">Group vote: did it?</p>
			${btn('yes', 'Yes, it happened')}${btn('no', 'Nope, a bluff', '', 'ghost')}`, {
			yes() {
				sfx.win();
				ps.hands[i].splice(j, 1);
				ps.names.forEach((_, k) => k !== i && sip(k));
				if (!ps.hands[i].length) return fin();
				watch(toast(`${pname(i)} called it. Everyone else: 1 sip.`));
			},
			no() { sip(i, 2); sfx.bad(); watch(toast(`Bluff! ${pname(i)} takes 2 sips.`)); },
		});
		const peek = (i) => (i >= ps.names.length ? watch() : pass(i, () => reveal(i, () => peek(i + 1))));
		peek(0);
	},
});

/* ═══ Awkward Answers: a rotating judge picks the funniest and the worst answer ═══ */
const PROMPTS = [
	'The real reason I was late: ____.', 'My therapist asked me to stop bringing up ____.', 'Nobody warned me that ____ comes with a monthly subscription.',
	'The new reality show: Dating ____.', 'Grandma’s secret to a long life: ____.', 'Breaking news: local man arrested for ____.',
	'What I whisper to my plants: ____.', 'Tonight’s special at the fanciest restaurant in town: ____.', 'The most embarrassing thing in my search history: ____.',
	'The group chat went silent after someone sent ____.', 'I knew it was love when ____.', 'Chapter 3 of my autobiography is called “____”.',
	'Honestly, 90% of my personality is ____.', 'The airline’s new safety demo now includes ____.', 'The aliens landed and immediately asked for ____.',
	'Why I will never get a job: ____.', 'The wedding toast went wrong when he said “____.”', 'The one thing I would save from a fire: ____.',
	'Tonight’s bedtime story: The Tale of ____.', 'What is really living in the office fridge: ____.', 'Warning: may cause ____.',
	'I got kicked out of the gym for ____.', 'My most toxic trait: ____.', 'Scientists have confirmed that ____ is the cause of every Monday.',
	'The sequel nobody asked for: Fast and Furious 12: ____.', 'Dad’s new hobby: ____.', 'Overheard at the bus stop: “____.”',
	'To impress my in-laws, I brought ____.', 'The superhero nobody needed: Captain ____.', 'Don’t tell anyone, but I am secretly ____.',
];
const asPrompt = (t) => esc(t.includes('____') ? t : `${t} ____`); // a typed prompt without a blank gets one at the end
const ANSWERS = [
	'A suspiciously confident pigeon', 'Unlimited breadsticks', 'My ex’s new haircut', 'An emotional support goat', 'Passive-aggressive sticky notes',
	'A mid-life crisis in a convertible', 'Extremely loud chewing', 'Hitting reply-all', 'A surprise tax audit', 'The last slice of pizza',
	'A haunted robot vacuum', 'Dad dancing', 'Fifteen unread voicemails', 'Sunscreen on only one side', 'Fake it till you make it',
	'A 4 a.m. snack run', 'Awkward eye contact in an elevator', 'The cheese incident', 'Competitive napping', 'A very serious seagull',
	'A drawer full of dead batteries', 'Replying with just “k”', 'Glitter, everywhere', 'A group project', 'Karaoke with the boss',
	'A bear in a business suit', 'The wifi password', 'Laughing at the wrong moment', 'An overconfident toddler', 'Sixteen cats',
	'A midnight fridge raid', 'Mom’s disappointed sigh', 'Socks with sandals', 'The “Are you still watching?” prompt', 'A pillow fort with a security system',
	'Free samples as dinner', 'Pretending to know about wine', 'Hot sauce on ice cream', 'A suspicious amount of mayonnaise', 'Cheese rolling down a hill',
	'Unread terms and conditions', 'Skipping leg day forever', 'The world’s tiniest violin', 'Autocorrect', 'Googling symptoms at 2 a.m.',
	'A fake British accent', 'Parallel parking with an audience', 'My browser history', 'Dramatic slow clapping', 'A mysterious puddle',
	'An awkward high-five', 'A sentient spreadsheet', 'Wearing a cape to work', 'Whispering in a library', 'A mildly haunted IKEA',
	'An inflatable flamingo', 'Falling asleep during the movie', 'Speaking about myself in third person', 'Fish reheated in the office microwave', 'Petty karma',
	'Three raccoons in a trench coat', 'A strongly worded letter', 'A kazoo solo', 'Announcing it’s my birthday, again', 'Burning the toast, again',
	'A cousin who “does crypto”', 'Folding a fitted sheet', 'A spicy rumor', 'Interpretive dance', 'Using the wrong name confidently',
];

PARTY.push({
	id: 'answers', name: 'Awkward Answers', blurb: 'Fill the blank with your funniest card. The judge picks the best and the worst.',
	need: 'One phone, a sense of humor, and friends who will not be offended.',
	steps: [
		'Each round one player is the judge. Everyone else gets a prompt with a blank and a hand of 5 answer cards.',
		'Pass the phone around. Each non-judge secretly picks the card that fills the blank best, or taps “Write your own” and types an answer.',
		'The judge reads every answer without names, then picks the funniest (+1 point) and the worst (that player takes a sip).',
		'With only two players, the judge just rates the one answer: funny scores a point, a miss is a sip.',
		'The judge rotates. The game ends when everyone has judged once, or after 6 rounds in big groups. You can end it early.',
	],
	win: 'Most points at the end. Add your own prompts and answers from the player screen: your prompts come up first.',
	editor() {
		const mine = store.custom;
		draw(`<div class="hero">${gameIcon('answers')}</div><h1 class="ptitle">Your own cards</h1><p class="psub">Saved on this device. Your prompts come up first, your answers are shuffled into every hand.</p>
			<label class="fld">Prompts <small>one per line · type ____ where the blank goes</small><textarea id="cPrompts" rows="5" maxlength="2500" placeholder="My secret talent: ____" aria-label="Your own prompts">${esc((mine.prompts || []).join('\n'))}</textarea></label>
			<label class="fld">Answers <small>one per line · short and funny works best</small><textarea id="cAnswers" rows="5" maxlength="2500" placeholder="A very dramatic goat" aria-label="Your own answers">${esc((mine.answers || []).join('\n'))}</textarea></label>
			${btn('done', 'Done')}`, { done: () => roster() });
		$('#partyBody').oninput = (e) => { // toLines (main.js) trims each line and caps the list
			if (e.target.id === 'cPrompts') mine.prompts = toLines(e.target.value);
			else if (e.target.id === 'cAnswers') mine.answers = toLines(e.target.value);
			save();
		};
	},
	run() {
		const n = ps.names.length;
		const mine = store.custom;
		const pool = [...ANSWERS, ...(mine.answers || []).map(esc)];
		let pile = shuffle(pool);
		const take = () => (pile.length ? pile : (pile = shuffle(pool))).pop();
		const prompts = [...shuffle((mine.prompts || []).map(asPrompt)), ...shuffle(PROMPTS)]; // your own prompts come up first
		const hands = ps.names.map(() => Array.from({ length: 5 }, take));
		const fill = (p, a) => p.replace('____', () => (a ? `<b>${a}</b>` : '<b class="blank">_____</b>'));
		const rounds = Math.min(n, 6); // a longer game means too many phone passes
		let r = 0;

		const round = () => {
			if (r >= rounds) return finish((i) => ps.pts[i], (i) => `${ps.pts[i]} pt${ps.pts[i] === 1 ? '' : 's'}`);
			const j = r % n, prompt = prompts[r % prompts.length], subs = [];
			const others = ps.names.map((_, i) => i).filter((i) => i !== j);

			const answer = (k) => {
				if (k >= others.length) return judging();
				const i = others[k];
				const hand = () => draw(`<div class="gname">${esc(ps.names[i])}, your hand</div><div class="pcard prompt">${fill(prompt)}</div>
					<div class="pchoices paper">${hands[i].map((a, c) => `<button class="choice" type="button" data-k="play" data-v="${c}">${a}</button>`).join('')}<button class="choice mine" type="button" data-k="own">✍️ Write your own</button></div>`, {
					play(c) {
						subs.push({ i, a: hands[i].splice(+c, 1)[0] });
						hands[i].push(take());
						answer(k + 1);
					},
					own: () => write(),
				});
				const write = () => {
					draw(`<div class="gname">${esc(ps.names[i])} · write your own</div><div class="pcard prompt">${fill(prompt)}</div>
						<textarea class="typein" rows="3" maxlength="70" placeholder="Type something funny…" aria-label="Your answer"></textarea>
						<div class="btns">${btn('back', 'Back', '', 'ghost')}<button class="btn" type="button" data-k="send" disabled>Play it</button></div>`, {
						back: () => hand(),
						send() {
							const t = $('.typein').value.trim();
							if (!t) return;
							subs.push({ i, a: esc(t) }); // typed text is escaped; the built-in cards are trusted
							answer(k + 1);
						},
					});
					const box = $('.typein'), send = $('[data-k="send"]');
					box.oninput = () => { send.disabled = !box.value.trim(); };
					box.focus();
				};
				pass(i, () => hand());
			};

const judging = () => {
				const opts = shuffle(subs);
				const reveal = (b, w) => {
					sfx.win();
					if (b >= 0) ps.pts[opts[b].i]++;
					if (w >= 0) sip(opts[w].i);
					draw(`<div class="gname">Round ${r + 1}/${rounds} · results</div>${opts.map((o, c) => `<div class="pcard${c === b ? ' best' : c === w ? ' worst' : ''}">${fill(prompt, o.a)}<small>${pname(o.i)}${c === b ? ' · +1 point' : c === w ? ' · 1 sip' : ''}</small></div>`).join('')}
						${btn('next', r + 1 < rounds ? 'Next round' : 'Final scores')}${r + 1 < rounds ? endLink : ''}`, { next: () => { r++; round(); }, end: () => { r = rounds; round(); } });
				};
				const worst = (b) => draw(`<div class="gname">${esc(ps.names[j])}, now the worst</div><p class="psub">That player takes a sip.</p>
					<div class="pchoices paper">${opts.map((o, c) => (c === b ? '' : `<button class="choice" type="button" data-k="pick" data-v="${c}">${fill(prompt, o.a)}</button>`)).join('')}</div>`, { pick: (c) => reveal(b, +c) });
				pass(j, () => {
					if (opts.length === 1) {
						draw(`<div class="gname">${esc(ps.names[j])}, rate it</div><div class="pcard big">${fill(prompt, opts[0].a)}</div>${btn('yes', 'Funny')}${btn('no', 'Not funny', '', 'ghost')}`, { yes: () => reveal(0, -1), no: () => reveal(-1, 0) });
						return;
					}
					draw(`<div class="gname">${esc(ps.names[j])}, pick the funniest</div>
						<div class="pchoices paper">${opts.map((o, c) => `<button class="choice" type="button" data-k="pick" data-v="${c}">${fill(prompt, o.a)}</button>`).join('')}</div>`, {
						pick: (c) => (opts.length === 2 ? reveal(+c, 1 - c) : worst(+c)),
					});
				}, `<div class="pcard prompt">${fill(prompt)}</div>`);
			};

			draw(`${prog(r, rounds)}<div class="gname">Round ${r + 1}/${rounds}</div><p class="psub">Judge: ${pname(j)}</p><div class="pcard big prompt">${fill(prompt)}</div>
				<p class="hint">Everyone else: pick your funniest answer in secret. Pass the phone around.</p>${btn('go', 'Start')}`, { go: () => answer(0) });
		};
		round();
	},
});

/* ═══ Poker Face: perform a challenge; if the target laughs they sip, if they hold, you do ═══ */
const MILD = [
	'Narrate the target’s next ten seconds like a nature documentary.', 'Propose to the target with a speech and a ring made from whatever is nearby.', 'Be a news anchor reporting live from the target’s morning routine.',
	'Order a pizza from the target using only animal noises.', 'Give a serious TED talk on why socks are overrated.', 'Slow-motion replay of a famous goal, with full commentary.',
	'Sing “Happy Birthday” as an opera singer.', 'Have a dramatic breakup with the nearest piece of furniture.', 'Apologize to the target for something ridiculous, with total sincerity.',
	'Interview the target for the job of Professional Cloud Watcher.', 'Slow-dance with an invisible partner while whispering sweet nothings.', 'Host a cooking show and make an imaginary sandwich.',
	'Be a GPS giving directions from the target’s seat to the kitchen. Recalculate often.', 'Compliment the target in a pirate voice.', 'Do slow-motion parkour around the target using furniture. Safely.',
	'Teach the target to walk like a penguin. Be a strict teacher.', 'Give a eulogy for the last snack you ate.', 'Be a lifeguard rescuing the target from an imaginary shark.',
	'Read the back of any product like a movie trailer.', 'Act out a fashion show where the target’s outfit is the star.', 'Sell the target a very ordinary pen as if it were magic.',
	'Be a very polite, very lost tourist asking the target for directions.', 'Do a sports commentary of the target picking up their drink.', 'Whisper-sing the alphabet like a lullaby.',
	'Be a nervous magician whose every trick fails.', 'Argue with your own reflection in a phone screen.',
	'Give the target a very formal tour of the room, as if it were a museum.', 'Pretend to be a robot trying to understand what a smile is.', 'Describe the target’s outfit like a judge on a talent show.',
	'Report the weather as a nervous forecaster: “a 90% chance of giggles”.', 'Perform a one-person play about a sock that lost its pair.', 'Teach the target how to blink, as an extremely strict coach.',
	'Introduce yourself to the target like a wrestler entering the ring.', 'Tell the target a bedtime story about their phone.',
];
const SPICY = [
	'Describe your worst date as a horror movie trailer.', 'Flirt with the target using only dad jokes.', 'Do a sultry weather report for tomorrow.',
	'Whisper a romantic poem about the target’s shoes.', 'Give the target a dramatic “we need to talk” because they ate your fries.', 'Confess your secret crush on a fictional character, in full detail.',
	'Walk the target down a runway as the mystery prize on a game show.', 'Act out your most embarrassing moment as a silent film.', 'Roast the target like a comedy-club pro. Kind, no low blows.',
	'Seduce the target using only cooking terms.', 'Do a heartfelt breakup text read aloud, to a vending machine.', 'Give a very intense pep talk to the target before their “big date” with a sandwich.',
	'Serenade the target with a love song made up on the spot about their worst habit.', 'Pitch the target your new dating app, with live demo.',
	'Read out a pretend dating profile for the target, with total honesty.', 'Deliver a love letter to the target’s favourite snack.', 'Confess to the target, soap-opera style, that you stole their charger.',
	'Describe the target as the villain of a romantic comedy.', 'Act as the target’s overly honest dating coach.', 'Pitch the target on why you would make the perfect roommate, using only gestures.',
];

PARTY.push({
	id: 'poker', name: 'Poker Face', blurb: 'Perform a ridiculous challenge. If your target laughs, they sip.',
	need: 'One phone and at least one player willing to be silly.',
	steps: [
		'On your turn you draw a challenge card. Pick a target (with two players, it is the other one) and read the card out.',
		'Start the 30 second clock and perform the challenge right in front of the target. Touching is not allowed.',
		'The target must keep a straight face. Any laugh, snort or smile: tap “They laughed” and the target sips.',
		'If they hold it for the full 30 seconds, tap “Held it” and the performer sips instead.',
		'Everyone performs at least twice, and small groups get more turns (8 in all, minimum). Mild is safe for any crowd; Spicy adds cheekier cards.',
	],
	win: 'Fewest sips when the turns run out.',
	run() {
		const n = ps.names.length, total = n * Math.max(2, Math.ceil(8 / n)); // at least 8 turns, even with two players
		ps.laughs = ps.names.map(() => 0);
		pickHeat([['Mild', 'Silly challenges, safe for any crowd'], ['Spicy', 'Cheekier cards on top. Nobody gets hurt']], (h) => {
			const deck = shuffle(h ? [...MILD, ...SPICY] : MILD);
			let t = 0;
			const turn = (note = '') => {
				if (t >= total) return finish((i) => -ps.sips[i], (i) => `${ps.pts[i]} held · ${ps.laughs[i]} laughed`, ['sipped the least', 'sipped the least']);
				const p = t % n, card = deck[t];
				const perform = (v) => {
					draw(`${prog(t, total)}<div class="gname">Turn ${t + 1}/${total}</div><p class="psub">${pname(p)} performs for ${pname(v)}</p><div class="pcard big">${card}</div>
						<div class="ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="44"/><circle class="fg" cx="50" cy="50" r="44"/></svg><b id="pfClock">30</b></div><p class="hint" id="pfHint">${esc(ps.names[v])}: keep a straight face.</p>
						<div class="btns">${btn('laugh', 'They laughed')}<button class="btn ghost" type="button" data-k="held" disabled>Held it</button></div>`, {
						laugh() { sip(v); sfx.bad(); ps.laughs[v]++; t++; turn(toast(`${pname(v)} cracked. 1 sip.`)); },
						held() { sip(p); sfx.lock(); ps.pts[v]++; t++; turn(toast(`${pname(v)} held it. ${pname(p)} takes 1 sip.`)); },
					});
					const clock = $('#pfClock'), hint = $('#pfHint'), held = $('[data-k="held"]');
					let left = 30;
					ps.timer = setInterval(() => {
						clock.textContent = --left;
						if (left > 0) return;
						clearInterval(ps.timer);
						hint.textContent = `Time! If ${ps.names[v]} kept a straight face, tap “Held it”.`;
						held.disabled = false;
						sfx.go();
					}, 1000);
				};
				draw(`${prog(t, total)}<div class="gname">Turn ${t + 1}/${total}</div><p class="psub">${pname(p)} performs</p>${note}<div class="pcard big">${card}</div>
					${n > 2 ? `<p class="psub">Pick your target</p>${chips('target', p)}` : btn('start', 'Start the 30 seconds')}
					${endLink}`, { target: (v) => perform(+v), start: () => perform(1 - p), end: () => { t = total; turn(); } });
			};
			turn();
		});
	},
});

/* ═══ Mixed Deck: four card types in three heat levels ═══ */
const KINDS = {
	bender: ['Brain Bender', 'Answer honestly, or take a sip.', '#35d6c8'],
	dare: ['Dare or Sip', 'Do it, or take a sip.', '#ff7a59'],
	who: ['Who’s Who', 'Count down 3, 2, 1 and everyone points. The most-pointed-at player sips.', '#b794f6'],
	stand: ['Last One Standing', 'Take turns in a circle. Stall or repeat and you sip.', '#f7c948'],
};
const MIX = {
	bender: [
		['What is your most useless talent?', 'What is your go-to karaoke song?', 'What is the weirdest thing you have ever eaten?', 'What was your first job?', 'What do you do when you cannot sleep?', 'What is a skill you wish you had?', 'What is your comfort movie?', 'What is the best meal you have ever had?', 'What was your childhood nickname?', 'If you could live anywhere for a year, where would it be?'],
		['What is the most embarrassing thing in your camera roll? Describe it.', 'Who here would last longest in a zombie apocalypse?', 'What harmless lie do you tell all the time?', 'What is the worst gift you ever gave?', 'What is the most spontaneous thing you have done?', 'What is a hill you will happily die on?', 'What was your most awkward school moment?', 'What is the most expensive thing you regret buying?'],
		['What is the most trouble you have ever gotten into at a party?', 'Whose life here would you swap for a week, and why?', 'What is the worst date you have ever been on?', 'What would you never tell your boss?', 'What is your most chaotic travel story?', 'What is a secret you have kept for years?', 'Who here would make the best wingman or wingwoman?', 'What is the pettiest thing you have ever done?'],
	],
	dare: [
		['Do your best impression of someone in the room.', 'Speak only in questions until your next turn.', 'Do 10 squats while reciting the alphabet.', 'Show the last photo you took.', 'Hold a wall sit for 20 seconds.', 'Tell the group a joke. Bad ones count.', 'Do your best animal impression.', 'Spin around 10 times, then walk in a straight line.', 'Balance a spoon on your nose for 10 seconds.', 'Say the alphabet backwards, as far as you can get.'],
		['Talk like a news anchor until your next turn.', 'Give a one-minute speech on why pineapple belongs on pizza.', 'Let the group give you a new nickname for the night.', 'Do a dramatic reading of your last text message.', 'Do an interpretive dance of the last movie you watched.', 'Speak in rhymes for the next two turns.', 'Give the person on your left a sincere compliment.', 'Let someone restyle your hair for the rest of the game.'],
		['Swap one item of clothing with another player.', 'Let the group pick someone for you to compliment in great detail.', 'Do your sexiest walk across the room. Judges score it.', 'Call a friend and sing them one line of a song. No explanation.', 'Do a slow-motion walk across the room like a perfume ad.', 'Reveal the last thing you searched for.', 'Show the group your most-played song.', 'Do a dramatic movie kiss with your own hand.'],
	],
	who: [
		['get lost while using a GPS', 'cry at a movie first', 'be late to their own wedding', 'adopt a stray animal', 'forget a birthday', 'win a game show', 'talk to a stranger on a plane', 'break a phone screen this year', 'sleep through something important', 'set off the smoke alarm while cooking'],
		['become famous for something silly', 'text an ex at 2 a.m.', 'survive a week without a phone', 'talk their way out of a ticket', 'start a business and fail spectacularly', 'binge a whole series in one night', 'cry at a wedding', 'get lost in their own town'],
		['get a tattoo on a whim', 'sneak into a party they were not invited to', 'have a secret second life', 'be the first to leave a date early', 'say yes to a stranger’s dare', 'cause a scene at a restaurant', 'fall asleep at a party', 'moonwalk in public'],
	],
	stand: [
		['Name fruits. No repeats.', 'Name cartoon characters.', 'Name countries.', 'Name things in a kitchen.', 'Name movie sequels.', 'Name animals.', 'Name pizza toppings.', 'Name things that are round.', 'Name superheroes.', 'Name things in a bathroom.'],
		['Name songs with a colour in the title.', 'Name board games.', 'Name things you find at a wedding.', 'Name famous duos.', 'Name famous people called John or Jane.', 'Name things that fly.', 'Name cities in Europe.', 'Name things you pack for a trip.'],
		['Name red flags on a date.', 'Name excuses for being late.', 'Name pickup lines. Cheesy counts.', 'Name the worst first-date ideas.', 'Name things you should never say at a wedding.', 'Name bad pickup lines. Repeats sip.', 'Name things people lie about on a first date.', 'Name movie villains.'],
	],
};

PARTY.push({
	id: 'mix', name: 'Mixed Deck', blurb: 'Questions, dares, who’s-who votes and challenges, from chill to wild.',
	need: 'One phone. Everyone sitting in a circle.',
	steps: [
		'Pick a heat level: Chill, Tipsy or Wild. Each level adds spicier cards to the deck.',
		'Players take turns in order. Four kinds of card come up, shuffled together.',
		'Brain Bender: answer honestly or sip. Dare or Sip: do it or sip.',
		'Who’s Who: read the “most likely to” card, count down 3-2-1 and everyone points. Tap the player with the most fingers on them and they sip.',
		'Last One Standing: take turns naming things in a circle, starting with the player shown. Whoever stalls or repeats sips. Tap their name.',
	],
	win: 'There is no winner, only a sip tally: whoever sipped the least is declared the driest. 24 cards, or end early.',
	run() {
		pickHeat([['Chill', 'Easy questions and light dares'], ['Tipsy', 'Chill, plus some cheeky cards'], ['Wild', 'The whole deck']], (h) => {
			const deck = shuffle(Object.entries(MIX).flatMap(([type, levels]) => levels.slice(0, h + 1).flat().map((text) => ({ type, text })))).slice(0, 24);
			const n = ps.names.length;
			let t = 0;
			const next = () => { t++; show(); };
			const show = () => {
				if (t >= deck.length) return finish((i) => -ps.sips[i], (i) => `${ps.pts[i]} turns`, ['was the driest', 'were the driest']);
				const { type, text } = deck[t], i = t % n, [label, how, color] = KINDS[type];
				ps.pts[i]++;
				const actions = {
					bender: `<div class="btns">${btn('sip', 'Pass: sip', '', 'ghost')}${btn('ok', 'Answered')}</div>`,
					dare: `<div class="btns">${btn('sip', 'Chicken out: sip', '', 'ghost')}${btn('ok', 'Done')}</div>`,
					who: `<p class="psub">Who got pointed at most?</p>${chips('hit')}${btn('ok', 'Tie, no sips', '', 'ghost')}`,
					stand: `<p class="psub">Who slipped up?</p>${chips('hit')}${btn('ok', 'Nobody, move on', '', 'ghost')}`,
				}[type];
				draw(`${prog(t + 1, deck.length)}<div class="pill" style="--t:${color}">${label}</div><p class="psub">${type === 'who' ? 'Everyone' : type === 'stand' ? `${pname(i)} starts` : pname(i)}</p>
					<div class="pcard big" style="--t:${color}">${type === 'who' ? `Who is most likely to ${text}?` : text}</div><p class="hint">${how}</p>${actions}${endLink}`, {
					ok: next,
					sip: () => { sip(i); sfx.bad(); next(); },
					hit: (v) => { sip(+v); sfx.bad(); next(); },
					end: () => { t = deck.length; show(); },
				});
			};
			show();
		});
	},
});

/* ── wiring ── */
$('#partyBack').onclick = () => {
	if (ps?.playing && !confirm('Leave this game? The scores are lost.')) return;
	leaveParty();
};
$('#partyRules').onclick = () => {
	const dlg = $('#rulesDlg');
	dlg.innerHTML = `${rulesHtml(ps.game)}<form method="dialog"><button class="btn">Back to the game</button></form>`;
	dlg.showModal();
};
