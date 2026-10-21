'use strict';

/* Own-phone mode for the spy games (the games themselves live in spy.js). There is no server: a table code carries the player
   count, the game's options, a random part and a check character. Every phone deals from that code with a seeded random, so each
   one works out the same table and shows only its own player's card. Talking, pointing and voting happen out loud.
   The table is kept in store.table, so a phone that reloads can rejoin. */

const T_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 characters, no 0, O, 1 or I to mistype
const tShow = (code) => `${code.slice(0, 3)} ${code.slice(3)}`;
const tDef = () => SPYDEF[ps.game.id];
const tCheck = (body) => T_ALPHA[[...`${body}${ps.game.id}${SPY_DATA}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 32]; // catches typos and phones on another version

/* code = player count, options, 3 random characters, check */
function tMake(n, cfg) {
	const body = T_ALPHA[n - 3] + T_ALPHA[encOpts(tDef().rows(n), cfg)] + Array.from({ length: 3 }, () => choice([...T_ALPHA])).join('');
	return body + tCheck(body);
}

function tParse(text) {
	const code = text.toUpperCase().replace(/[^A-Z0-9]/g, ''), def = tDef(), n = T_ALPHA.indexOf(code[0]) + 3;
	if (code.length !== 6 || [...code].some((c) => !T_ALPHA.includes(c)) || code[5] !== tCheck(code.slice(0, 5)) || n < def.min || n > MAX_P) return null;
	const rows = def.rows(n), x = T_ALPHA.indexOf(code[1]);
	return x < rows.reduce((a, r) => a * r.vals.length, 1) ? { code, n, cfg: decOpts(rows, x) } : null;
}

/* Sit down at a table: seats are the first n avatars, named after them, so the reveal can say "the Fox was the spy". */
function tSit(code, n, cfg, seat = -1, round = 1) {
	ps.t = { code, n, cfg, seat, round };
	ps.names = [...Array(n).keys()].map((i) => AV_IDS[i][0].toUpperCase() + AV_IDS[i].slice(1));
	ps.look = ps.names.map((_, i) => ({ ic: AV_IDS[i], c: SWATCHES[i] }));
	ps.playing = ps.table = true; // playing shows the rules button; table skips the "scores are lost" prompt on leaving
}
const tKeep = () => { store.table = { id: ps.game.id, code: ps.t.code, seat: ps.t.seat, round: ps.t.round }; save(); };
const tDeal = () => tDef().deal(ps.t.n, ps.t.cfg, seeded(`${ps.game.id}|${ps.t.code}|${ps.t.round}`));
const tSeatList = (k) => `<div class="plist seats">${ps.names.map((_, i) => row(i, '', k)).join('')}</div>`;

/* How are you playing? Shown first for every game that supports own phones. */
function pickMode() {
	const t = store.table?.id === ps.game.id ? store.table : null;
	draw(`<div class="hero">${gameIcon(ps.game.id)}</div><h1 class="ptitle">How are you playing?</h1>
		<div class="pchoices">
			${t ? `<button class="choice" type="button" data-k="again"><b>Rejoin your table</b><small>Code ${tShow(t.code)} · round ${t.round}</small></button>` : ''}
			<button class="choice" type="button" data-k="own"><b>Everyone on their own phone</b><small>Best for groups. No sign-up, no server: one person starts a table and everyone else types its code.</small></button>
			<button class="choice" type="button" data-k="one"><b>One phone, pass it round</b><small>Fine for a small group, and it counts the votes and scores for you.</small></button>
		</div>`, {
		again() {
			const p = tParse(t.code);
			if (!p) { store.table = null; save(); return pickMode(); }
			tSit(p.code, p.n, p.cfg, t.seat, t.round);
			if (t.seat < 0) tSeats(); else tHome();
		},
		own: tStart,
		one: () => roster(),
	});
}

function tStart() {
	draw(`<div class="hero">${gameIcon(ps.game.id)}</div><h1 class="ptitle">Own phones</h1><p class="psub">One person starts the table and reads out its code. Everyone else joins with it.</p>
		<div class="pchoices">
			<button class="choice" type="button" data-k="make"><b>Start a table</b><small>You choose the options and get the code</small></button>
			<button class="choice" type="button" data-k="join"><b>Join a table</b><small>Someone already has a code</small></button>
		</div>`, { make: () => tMakeScreen(), join: () => tJoin() });
}

function tMakeScreen(st = { n: Math.max(tDef().min, 6) }) {
	const def = tDef();
	const rows = () => [{ key: 'n', label: 'Players', vals: Array.from({ length: MAX_P - def.min + 1 }, (_, i) => [def.min + i, def.min + i]) }, ...def.rows(st.n)];
	const view = () => {
		fixCfg(rows(), st);
		draw(`<h1 class="ptitle">Start a table</h1><div class="spyset">${rows().map((r) => segHtml(r, st)).join('')}</div>${btn('go', 'Make the code')}`, { set(kv) { setCfg(st, kv); view(); }, go: share });
	};
	function share() {
		const p = tParse(tMake(st.n, st)); // round trip through the code, so this phone deals exactly as the others will
		tSit(p.code, p.n, p.cfg);
		const opts = def.rows(p.n).map((r) => r.vals.find(([v]) => v === p.cfg[r.key])[1]).join(' · ');
		draw(`<div class="gname">Your table code</div><div class="tcode">${tShow(p.code)}</div>
			<p class="psub">Read it out. Everyone else picks this game, chooses Own phone, taps Join a table and types it in.</p>
			<p class="hint">${p.n} players${opts ? ` · ${opts}` : ''}</p>${btn('go', 'Pick my character')}`, { go: tSeats });
	}
	view();
}

function tJoin(err = '') {
	draw(`<h1 class="ptitle">Join a table</h1><p class="psub">Type the code from the person who started it.</p>${err ? toast(err) : ''}
		<input id="tcode" class="tinput" maxlength="8" placeholder="ABC 123" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Table code">
		${btn('go', 'Join')}`, {
		go() {
			const p = tParse($('#tcode').value);
			if (!p) return tJoin('That code does not match. Check it, and that every phone is on the same version of this page (reload it).');
			tSit(p.code, p.n, p.cfg);
			tSeats();
		},
	});
}

function tSeats() {
	draw(`<div class="gname">Table ${tShow(ps.t.code)}</div><h1 class="ptitle">Pick your character</h1><p class="psub">Everyone picks a different one. Count off to be sure nobody is missing.</p>${tSeatList('seat')}`, {
		seat(i) { ps.t.seat = +i; tKeep(); tCard(); },
	});
}

function tCard() {
	const t = ps.t;
	draw(`<div class="gname">Round ${t.round} · table ${tShow(t.code)}</div><div class="hero">${avatar(t.seat, '72px')}</div>${tDef().card(t.seat, tDeal())}${btn('hide', 'Got it, hide the screen')}`, { hide: () => tHome() });
}

/* The resting screen between looks at your card. */
function tHome() {
	const def = tDef(), t = ps.t, d = tDeal();
	draw(`<div class="gname">Table ${tShow(t.code)}</div><h1 class="ptitle">Round ${t.round}</h1>
		<div class="hero">${avatar(t.seat, '96px')}</div><p class="psub">You are ${pname(t.seat)}. ${pname(d.first)} goes first.</p>
		<p class="hint">${def.play}</p>
		${def.role ? '<button class="minebtn" type="button" data-k="chk">Check a player</button>' : ''}
		<p class="hint">Out of step with the others? <button class="link" type="button" data-k="rd" data-v="-1">Round −</button><button class="link" type="button" data-k="rd" data-v="1">Round +</button><button class="link" type="button" data-k="leave">Leave table</button></p>
		<div class="btns">${btn('card', 'My card', '', 'ghost')}${btn('rev', 'Reveal')}</div>`, {
		card: tCard,
		chk: tCheckPick,
		rev: tReveal,
		rd(v) { t.round = Math.max(1, t.round + +v); tKeep(); tHome(); },
		leave() { store.table = null; save(); leaveParty(); },
	});
}

/* Odd Word Out and friends: peek at what the player the group voted out was holding. */
function tCheckPick() {
	draw(`<div class="gname">Check a player</div><p class="psub">Tap the player the group voted out.</p>${tSeatList('who')}${btn('back', 'Back', '', 'ghost')}`, {
		who(i) {
			const def = tDef(), r = def.role(+i, tDeal());
			draw(`<div class="gname">Voted out</div><div class="hero">${avatar(+i, '96px')}</div><h1 class="ptitle">${pname(+i)}</h1><div class="res ${r === 'civ' ? 'lose' : 'win'}">${def.roleText[r]}</div>${btn('back', 'Back to the table')}`, { back: () => tHome() });
		},
		back: () => tHome(),
	});
}

function tReveal() {
	const def = tDef(), t = ps.t;
	draw(`<div class="gname">Reveal</div><h1 class="ptitle">Ready?</h1><p class="psub">Make sure the vote is done and any last guess has been made. This shows everyone the answer.</p>
		<div class="btns">${btn('back', 'Not yet', '', 'ghost')}${btn('go', 'Reveal')}</div>`, {
		back: () => tHome(),
		go() {
			store.plays[ps.game.id] = (store.plays[ps.game.id] || 0) + 1;
			save();
			sfx.win();
			draw(`<div class="gname">Round ${t.round} · the answer</div><p class="psub">${def.reveal(tDeal())}</p>${btn('next', 'Next round')}`, { next() { t.round++; tKeep(); tCard(); } });
		},
	});
}
