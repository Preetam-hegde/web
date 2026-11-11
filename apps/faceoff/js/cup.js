'use strict';

/* A Cup uses the normal game engines; this module owns only the schedule and standings. */
let cup = null;
let cupSeen = new Set();
const cupPreset = () => CUP_PRESETS.find((preset) => preset.id === cup?.preset);
const cupHost = () => net?.role !== 'guest' && grp?.role !== 'guest';
const cancelCup = () => {
	cup = null;
};

function startCup(presetId = 'mixed', isSolo = false) {
	if (!cupHost()) return false;
	const games = chooseCupGames(GAMES, presetId);
	const seats = grp
		? grp.players
				.map((player, i) => (player.gone ? -1 : i))
				.filter((i) => i >= 0)
		: null;
	const names = grp
		? seats.map((i) => grp.names[i])
		: isSolo
			? [nameOf(0)]
			: [nameOf(0), nameOf(1)];
	cup = createCupState(
		`cup-${Date.now()}-${++epoch}`,
		presetId,
		games.map((game) => game.id),
		names,
		isSolo && !grp && !net,
	);
	if (grp) cup.seats = seats;
	cupSeen = new Set();
	publishCup();
	launchCupLeg();
	return true;
}

function launchCupLeg() {
	if (!cup || cup.phase !== 'playing' || !cupHost()) return;
	const game = GAMES.find((item) => item.id === cup.games[cup.index]);
	if (grp) {
		clearTimeout(grp.strag);
		grp.strag = 0;
		grp.r = null;
		grStart(game, cup.id);
	} else startMatch(game, 1, cup.solo, cup.id);
}

function completeCupMatch() {
	if (!cup || m.cupId !== cup.id || cup.phase !== 'playing') return;
	let newBest = false;
	if (cup.solo) {
		const result = m.res[0],
			best = store.best[m.game.id];
		newBest =
			Number.isFinite(result.score) &&
			(!best ||
				(m.game.lowerIsBetter ? result.score < best.s : result.score > best.s));
		if (newBest)
			store.best[m.game.id] = { s: result.score, l: plainText(result.label) };
	}
	const results = cup.solo ? [m.res[0]] : m.res;
	if (
		!recordCupLeg(
			cup,
			m.game.id,
			results.map((result) => result.score),
			results.map((result) => plainText(result.label)),
			m.game.lowerIsBetter,
			newBest,
		)
	)
		return;
	if (cup.phase === 'complete' && net?.role === 'host') {
		const place = cupPlacements(cup.points, cup.gone);
		const champ =
			place.filter((rank) => rank === 1).length > 1 ? -1 : place.indexOf(1);
		net.board.rows.push({
			g: 'cup',
			n: 'Faceoff Cup',
			p: [...cup.points],
			c: champ,
			s: cupPreset().name,
		});
		net.send({ t: 'board', b: net.board });
	}
	publishCup();
	showCupStandings();
}

function completeCupGroup(round) {
	if (!cup || round.cupId !== cup.id || cup.phase !== 'playing') return;
	cup.gone = cup.seats.map((i) => grp.gone[i]);
	if (
		!recordCupLeg(
			cup,
			round.game.id,
			cup.seats.map((i) => round.res[i].score),
			cup.seats.map((i) => plainText(round.res[i].label)),
			round.game.lowerIsBetter,
		)
	)
		return;
	round.phase = 'cup';
	if (cup.phase === 'complete') {
		const place = cupPlacements(cup.points, cup.gone);
		grp.board.rows.push({
			g: 'cup',
			n: 'Faceoff Cup',
			names: [...grp.names],
			pts: grp.names.map((_, i) => cup.points[cup.seats.indexOf(i)] || 0),
			place: grp.names.map((_, i) => place[cup.seats.indexOf(i)] || null),
		});
	}
	publishCup();
	if (cup.phase === 'complete') grAll({ t: 'board', b: grp.board });
}

function rememberCup() {
	if (!cup) return;
	for (const leg of cup.legs) {
		const key = `${cup.id}:${leg.gid}`;
		if (cupSeen.has(key)) continue;
		cupSeen.add(key);
		store.plays[leg.gid] = (store.plays[leg.gid] || 0) + 1;
	}
	if (
		cup.phase === 'complete' &&
		net?.role !== 'guest' &&
		!store.history.some((entry) => entry.cupId === cup.id)
	) {
		const place = cupPlacements(cup.points, cup.gone);
		const winners = cup.names.filter((_, i) => place[i] === 1);
		const champ = cup.solo
			? -3
			: grp
				? -4
				: winners.length > 1
					? -1
					: place.indexOf(1);
		logHistory({
			g: 'cup',
			cupId: cup.id,
			n: [...cup.names],
			p: [...cup.points],
			c: champ,
			s: cup.solo
				? `${cup.points[0]} personal best${cup.points[0] === 1 ? '' : 's'} · ${cupPreset().name}`
				: `${winners.join(' & ')} won · ${cupPreset().name}`,
		});
		store.plays.cup = (store.plays.cup || 0) + 1;
		if (!net && !grp && !cup.solo && champ >= 0) store.series[champ]++;
	}
	save();
}

function publishCup() {
	if (!cup) return;
	rememberCup();
	const state = JSON.parse(JSON.stringify(cup));
	if (grp?.role === 'host') grAll({ t: 'g-cup', state });
	else net?.send({ t: 'cup', state });
}

function receiveCup(state, group = false) {
	if (
		!isCupState(
			state,
			GAMES.map((game) => game.id),
		)
	)
		return;
	if (group && state.seats.some((seat) => seat >= grp.names.length)) return;
	if (
		cup?.id === state.id &&
		(state.index < cup.index || state.legs.length < cup.legs.length)
	)
		return;
	if (cup?.id !== state.id) cupSeen = new Set();
	cup = state;
	rememberCup();
	if (state.phase === 'playing') return;
	if (m) bump();
	if (net) net.local = false;
	if (group) showCupStandings();
}

function cupGroupRoster() {
	if (!cup || cup.phase === 'complete') return;
	cup.gone = cup.seats.map((i) => grp.gone[i]);
	if (cup.phase === 'break') publishCup();
}

function showCupStandings() {
	if (!cup || cup.phase === 'playing' || !m) return;
	const state = cup,
		finished = state.phase === 'complete',
		host = cupHost();
	const stamp = { id: state.id, index: state.index, phase: state.phase };
	const place = cupPlacements(state.points, state.gone);
	const winners = state.names.filter((_, i) => place[i] === 1);
	const champ = winners.length === 1 ? place.indexOf(1) : -1;
	m.final = { champ, cup: true };
	$('#share').hidden = true;
	if (grp) {
		const points = state.points[state.seats.indexOf(grp.me)] || 0;
		m.pts = [points, 0];
		grEnterMatch(m.game);
		$('.ppts', pane(0)).textContent = points;
	} else {
		m.pts = [...state.points, 0].slice(0, 2);
		focus(0);
		both(head);
	}
	const last = state.legs.at(-1),
		next = GAMES.find((game) => game.id === state.games[state.index + 1]);
	const standings = state.names
		.map((_, i) => i)
		.sort((a, b) => (place[a] || 99) - (place[b] || 99) || a - b)
		.map(
			(i) =>
				`<div class="cup-standing${state.gone[i] ? ' left' : ''}"><span class="cup-rank">${place[i] || '—'}</span><span>${esc(state.names[i])}${state.gone[i] ? '<small>Left the room</small>' : ''}</span><b>${state.points[i]}<small>${state.solo ? 'PB' : 'pts'}</small></b></div>`,
		)
		.join('');
	const history = state.legs
		.map(
			(leg, index) =>
				`<div class="cup-leg"><span>${String(index + 1).padStart(2, '0')}</span><b>${esc(GAMES.find((game) => game.id === leg.gid).name)}</b><small>${state.solo ? `${esc(leg.labels[0])}${leg.newBest ? ' · New best' : ''}` : leg.earned.map((points, i) => `${esc(state.names[i])} +${points}`).join(' · ')}</small></div>`,
		)
		.join('');
	const seats = grp || m.pass ? [0] : [0, 1];
	for (const p of seats) {
		const canAdvance = host && (!net || p === 0);
		const title = finished
			? state.solo
				? 'Five games. Cup complete.'
				: champ < 0
					? 'Shared Cup victory'
					: `${esc(state.names[champ])} wins the Cup`
			: `${esc(GAMES.find((game) => game.id === last.gid).name)} complete`;
		const actions = canAdvance
			? `<button class="btn" type="button" data-cup-action="${finished ? 'replay' : 'next'}">${finished ? 'Play another Cup' : 'Next game'}</button><button class="btn ghost" type="button" data-cup-action="quit">${finished ? 'Lobby' : 'End Cup'}</button>`
			: '<p class="hint">Waiting for the host…</p>';
		const stage = paint(
			p,
			`<section class="cup-results"><div class="cup-kicker">Faceoff Cup · ${esc(cupPreset().name)}</div><div class="cup-progress" aria-label="${state.legs.length} of 5 games complete">${state.games.map((_, i) => `<i class="${i <= state.index ? 'done' : ''}"></i>`).join('')}</div><h2>${title}</h2><p class="cup-note">${state.solo ? 'Personal bests across five different games.' : 'Win +3 · shared first +1 · missed attempt +0'}</p><div class="cup-standings">${standings}</div><div class="btns">${actions}</div>${!finished && next ? `<div class="cup-next"><small>Up next · ${state.index + 2} / 5</small><b>${gameIcon(next.id)} ${esc(next.name)}</b><p>${esc(next.blurb)}</p></div>` : ''}<details class="cup-breakdown"${finished ? ' open' : ''}><summary>Games so far</summary>${history}</details></section>`,
			'scroll',
			'result',
		);
		$$('[data-cup-action]', stage).forEach((button) => {
			button.onclick = () => {
				if (
					!cupHost() ||
					cup?.id !== stamp.id ||
					cup.index !== stamp.index ||
					cup.phase !== stamp.phase
				)
					return;
				if (button.dataset.cupAction === 'quit') return quit();
				if (button.dataset.cupAction === 'replay')
					return startCup(state.preset, state.solo);
				if (advanceCupLeg(cup)) {
					publishCup();
					launchCupLeg();
				}
			};
		});
	}
	if (finished) sfx.win();
	else sfx.lock();
}
