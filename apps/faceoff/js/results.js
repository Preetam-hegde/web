'use strict';

/* Round/match results and saved records. The match engine owns timing and input. */

function reveal() {
	bump();
	if (m.cupId) return completeCupMatch();
	// "Together" games (coop: true) score the pair as a team: both players get the same score and nobody loses.
	const coop = !!m.game.coop;
	const w = coop
		? -1
		: judge(m.res[0].score, m.res[1].score, m.game.lowerIsBetter);
	if (coop) {
		m.pts[0] += m.res[0].score;
		m.pts[1] = m.pts[0];
		if (m.res[0].score) sfx.win();
	} else if (w >= 0) {
		m.pts[w]++;
		sfx.win();
	}
	(m.rlog ||= []).push({
		w,
		l: [m.res[0].label, m.res[1].label],
		pts: [...m.pts],
	});
	const pass = m.pass;
	// Split screen speaks to each player ("You win"); a shared screen names people instead.
	const verdict = (p) =>
		coop
			? m.game.verdict(m.res[0].score)
			: w < 0
				? ['tie', 'Draw']
				: pass
					? ['win', `${esc(nameOf(w))} takes it`]
					: w === p
						? ['win', 'You win the round']
						: ['lose', `${esc(nameOf(w))} takes it`];
	const rows = (p) =>
		pass
			? [0, 1]
					.map(
						(q) =>
							`<div class="row"><span>${esc(nameOf(q))}</span><b style="color:var(--p${q})">${m.res[q].label}</b></div>`,
					)
					.join('')
			: `<div class="row me"><span>You</span><b>${m.res[p].label}</b></div><div class="row"><span>${esc(nameOf(1 - p))}</span><b>${m.res[1 - p].label}</b></div>`;
	const result = (p) =>
		`<div class="res ${verdict(p)[0]}">${verdict(p)[1]}</div><div class="rows">${rows(p)}</div>`;

	if (m.round < m.rounds - 1) {
		m.round++;
		m.cfg = m.game.config(m.round);
		both(head);
		const next = m.game.quickNext
			? `<div class="hero">${gameIcon(m.game.id)}</div><div class="gtitle">${m.game.name}</div><div class="lbl">Round <b>${m.round + 1}</b> of ${m.rounds}</div>`
			: introHtml();
		showReady((p) => `${result(p)}<hr>${next}`, 'Next', startRound);
		return;
	}

	both(head);
	const champ = coop
		? -2
		: m.pts[0] === m.pts[1]
			? -1
			: m.pts[0] > m.pts[1]
				? 0
				: 1; // -1 draw, -2 together
	const sum = coop ? m.game.summary(m.pts[0], m.rounds) : null;
	const h2h = headToHead(champ); // read before this match is added to the history
	if (!net && champ >= 0) store.series[champ]++; // the tally is for the two regulars on this phone
	{
		const entry = {
			g: m.game.id,
			n: [nameOf(0), nameOf(1)],
			p: [...m.pts],
			c: champ,
			s: sum ? sum.title : '',
		};
		if (m.recorded) Object.assign(store.history.at(-1), entry);
		else {
			store.plays[m.game.id] = (store.plays[m.game.id] || 0) + 1;
			logHistory(entry);
			m.recorded = true;
		}
		save();
	}
	if (net?.role === 'host') {
		// the room scoreboard: every match played on this link, kept by the host and copied to the guest
		const row = {
			g: m.game.id,
			n: m.game.name,
			p: [...m.pts],
			c: champ,
			s: sum ? sum.title : '',
		};
		if (m.boardRow === undefined) m.boardRow = net.board.rows.push(row) - 1;
		else net.board.rows[m.boardRow] = row; // sudden death re-ends the same match
		net.send({ t: 'board', b: net.board });
	}
	const dare =
		champ >= 0 && store.dares
			? choice(allDares()).replace('{w}', nameOf(champ))
			: '';
	m.final = { champ, dare, coop: sum };
	const insight = coop ? '' : insights(champ, h2h);
	m.final.card = renderCard(); // built now so the Share tap can hand it straight to the share sheet
	$('#share').hidden = false;
	if (champ !== -1)
		confetti(
			champ >= 0
				? [['#ff7a59', '#35d6c8'][champ], '#ffd24d', '#fff']
				: ['#ff7a59', '#35d6c8', '#ffd24d', '#b794f6'],
		);
	focus(0);
	(pass ? [0] : [0, 1]).forEach((p) => {
		const big = !pass && !coop; // split screen and two phones: say it loud, in the player's own words
		const state = champ < 0 ? 'draw' : champ === p ? 'win' : 'lose';
		const title = big
			? `<span class="bigv ${state}">${{ win: 'YOU WIN', lose: 'YOU LOSE', draw: 'DRAW' }[state]}</span><small>${state === 'win' ? '🏆 You win the match' : state === 'lose' ? `${esc(nameOf(champ))} wins the match` : 'Match drawn'}</small>`
			: coop
				? `💞 ${esc(sum.title)}`
				: champ < 0
					? 'Match drawn'
					: pass
						? `🏆 ${esc(nameOf(champ))} wins the match`
						: champ === p
							? '🏆 You win the match'
							: `${esc(nameOf(champ))} wins the match`;
		const score = coop
			? esc(sum.sub)
			: pass
				? `${esc(nameOf(0))} · ${m.pts[0]} – ${m.pts[1]} · ${esc(nameOf(1))}`
				: `${m.pts[p]} – ${m.pts[1 - p]}`;
		const again = champ === -1 ? 'sudden' : 'again';
		const s = paint(
			p,
			`<div class="hint">${verdict(p)[1]}</div>
			<div class="res ${champ === p || (pass && champ >= 0) || coop ? 'win' : !pass && champ >= 0 ? 'lose' : 'tie'}">${title}</div><div class="hint">${score}</div>
			${insight}
			${dare ? `<div class="dare"><b>Dare</b> ${esc(dare)}</div>` : ''}
			<div class="btns"><button class="btn" type="button" data-act="${again}">${champ === -1 ? 'Sudden death' : 'Rematch'}</button><button class="btn ghost" type="button" data-act="hub">Hub</button></div>`,
			'scroll',
			'result',
		);
		$$('button', s).forEach((b) => (b.onclick = () => FINAL[b.dataset.act]()));
	});
}

/* Single player: each round is you against your own best, saved per game on this device. */
function soloReveal() {
	bump();
	if (m.cupId) return completeCupMatch();
	const g = m.game,
		r = m.res[0],
		ok = Number.isFinite(r.score),
		prev = store.best[g.id];
	const beats =
		ok && (!prev || (g.lowerIsBetter ? r.score < prev.s : r.score > prev.s));
	if (beats) {
		store.best[g.id] = { s: r.score, l: plainText(r.label) };
		m.pts[0]++;
		sfx.win();
	}
	m.run.push(r.label);
	save();
	both(head);
	const bestTxt = store.best[g.id]
		? `Your best: <b>${esc(store.best[g.id].l)}</b>`
		: 'No score yet. Keep going!';
	const result = `<div class="res ${beats ? 'win' : 'tie'}">${beats ? '★ New personal best' : ok ? 'Round done' : 'No score'}</div><div class="rows"><div class="row me"><span>This round</span><b>${r.label}</b></div></div><div class="hint">${bestTxt}</div>`;
	if (m.round < m.rounds - 1) {
		m.round++;
		m.cfg = g.config(m.round);
		both(head);
		return showReady(() => `${result}<hr>${introHtml()}`, 'Next', startRound);
	}
	store.plays[g.id] = (store.plays[g.id] || 0) + 1;
	logHistory({
		g: g.id,
		n: [nameOf(0)],
		p: [m.pts[0], 0],
		c: -3,
		s: store.best[g.id]?.l || '',
	});
	save();
	if (m.pts[0]) confetti(['#ffd24d', '#fff', '#ff7a59']);
	focus(0);
	const s = paint(
		0,
		`${result}<div class="rows">${m.run.map((l, i) => `<div class="row"><span>Round ${i + 1}</span><b>${l}</b></div>`).join('')}</div>
		<div class="btns"><button class="btn" type="button" data-act="again">Play again</button><button class="btn ghost" type="button" data-act="hub">Hub</button></div>`,
		'scroll',
		'result',
	);
	$$('button', s).forEach((b) => (b.onclick = () => FINAL[b.dataset.act]()));
}

/* Wins between these two names in this game before today's match, from the saved history. */
function headToHead() {
	const [a, b] = [nameOf(0), nameOf(1)];
	const past = store.history.filter(
		(x) =>
			x.g === m.game.id &&
			x.n?.length === 2 &&
			x.c >= 0 &&
			[x.n[0], x.n[1]].sort().join('|') === [a, b].sort().join('|'),
	);
	const won = (name) => past.filter((x) => x.n[x.c] === name).length;
	return { n: past.length, a: won(a), b: won(b) };
}

/* Result screen insights: who won each round, the swing of the match, and the all-time record for this pair. */
function insights(champ, h2h) {
	const log = m.rlog || [];
	if (!log.length) return '';
	const dot = (w) =>
		w < 0
			? '<i class="rd tie"></i>'
			: `<i class="rd" style="background:var(--p${w})"></i>`;
	const rounds = log
		.map(
			(r, i) =>
				`<div class="irow"><span>R${i + 1}</span><span>${esc(plainText(r.l[0]))}</span>${dot(r.w)}<span>${esc(plainText(r.l[1]))}</span></div>`,
		)
		.join('');
	const lines = [];
	let run = 0,
		last = -1,
		best = 0,
		streaker = -1;
	log.forEach((r) => {
		run = r.w >= 0 && r.w === last ? run + 1 : r.w >= 0 ? 1 : 0;
		last = r.w;
		if (run > best) {
			best = run;
			streaker = r.w;
		}
	});
	if (best >= 2)
		lines.push(`🔥 ${esc(nameOf(streaker))} won ${best} rounds in a row`);
	if (
		champ >= 0 &&
		log.some((r) => (champ === 0 ? r.pts[0] < r.pts[1] : r.pts[1] < r.pts[0]))
	)
		lines.push(`↩️ ${esc(nameOf(champ))} came back from behind`);
	const ties = log.filter((r) => r.w < 0).length;
	if (ties) lines.push(`🤝 ${ties} round${ties > 1 ? 's' : ''} ended level`);
	const a = h2h.a + (champ === 0 ? 1 : 0),
		b = h2h.b + (champ === 1 ? 1 : 0);
	if (a + b)
		lines.push(
			`📊 ${esc(nameOf(0))} ${a} – ${b} ${esc(nameOf(1))} in ${m.game.name}, all time`,
		);
	return `<div class="insight"><div class="irows">${rounds}</div>${lines.map((l) => `<div class="iline">${l}</div>`).join('')}</div>`;
}

const FINAL = {
	again: () => startMatch(m.game, m.rounds, m.solo),
	hub: quit,
	sudden() {
		m.rounds++;
		m.round++;
		m.cfg = m.game.config(m.round);
		m.final = null;
		$('#share').hidden = true;
		both(head);
		showReady(introHtml, 'Ready', startRound);
	},
};
