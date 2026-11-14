'use strict';
// For every team row (Best Teams, Team Builder, savior team examples): a PvE / PvP tag, "Why it works" and "Tanking".
// Built from member ratings, roles/tags, partner links and the Defender rules in the guides. No hand-written per-team text.
(async () => {
	const root = document.getElementById('app');
	const NEXT = { Sun: 'Star', Star: 'Moon', Moon: 'Sun', Order: 'Chaos', Chaos: 'Order' };
	const BEATEN_BY = { Star: 'Sun', Moon: 'Star', Sun: 'Moon', Chaos: 'Order', Order: 'Chaos' };
	const TV = () => (typeof TIER_VAL !== 'undefined' ? TIER_VAL : { 'S+': 10, S: 8.5, 'A+': 7, A: 6, 'B+': 4.5, B: 4, 'C+': 2.5, C: 2, 'D+': 1, NEW: 5, '?': 3 });
	let c = null;
	const first = (t, n) => { t = String(t || '').trim(); const m = t.match(/^.*?[.!?](\s|$)/); const s = m ? m[0].trim() : t; return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
	const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
	const slugOf = (a) => (a.getAttribute('href') || '').split('/')[2];

	function analyse(slugs) {
		const S = slugs.map((s) => c.by[s]).filter(Boolean);
		if (!S.length) return null;
		const dupe = (x) => S.filter((y) => y.name === x.name).length > 1;
		const n = (x) => (dupe(x) ? `${x.name} (${x.title})` : x.name);
		const tags = (x) => c.guides[x.slug]?.tags || [];
		const has = (x, t) => tags(x).includes(t);
		const rated = S.filter((x) => x.ratings && x.ratings.pve !== 'NEW');
		const avg = (m) => (rated.length ? rated.reduce((a, x) => a + (TV()[x.ratings[m]] ?? 3), 0) / rated.length : 0);
		const pve = avg('pve'), pvp = avg('pvp');
		const mode = pve - pvp >= 1 ? 'PvE' : pvp - pve >= 1 ? 'PvP' : 'PvE + PvP';
		// why it works
		const why = [];
		const roles = [];
		const tanks = S.filter((x) => x.role === 'Defender' || has(x, 'tank')).sort((a, b) => b.hp - a.hp);
		const healers = S.filter((x) => has(x, 'healer'));
		const buffers = S.filter((x) => has(x, 'buffer') && !tanks.includes(x));
		const breakers = S.filter((x) => has(x, 'breaker'));
		const debuffers = S.filter((x) => has(x, 'debuffer'));
		const carries = S.filter((x) => has(x, 'dps') && !tanks.includes(x) && !healers.includes(x));
		if (tanks.length) roles.push(`a tank (${list(tanks.slice(0, 2).map(n))})`);
		if (healers.length) roles.push(`healing (${list(healers.map(n))})`);
		if (buffers.length) roles.push(`buffs (${list(buffers.slice(0, 2).map(n))})`);
		if (debuffers.length) roles.push(`debuffs (${list(debuffers.slice(0, 2).map(n))})`);
		if (breakers.length) roles.push(`Toughness break (${list(breakers.map(n))})`);
		if (carries.length) roles.push(`damage (${list(carries.slice(0, 3).map(n))})`);
		if (roles.length) why.push(`Covers ${list(roles)}, so no job is left to a unit that is bad at it.`);
		const missing = [];
		if (!tanks.length) missing.push('a Defender');
		if (!healers.length) missing.push('a healer');
		if (missing.length) why.push(`Missing ${list(missing)}: ${healers.length ? 'it leans on barriers and kills' : 'sustain comes from barriers, cleanse and finishing fights fast'}.`);
		// real partner reasons written in the savior guides
		const seen = new Set(), pairs = [];
		S.forEach((a) => (c.guides[a.slug]?.best_partners || []).forEach((p) => { const b = c.by[p.slug]; if (b && S.includes(b) && !seen.has([a.slug, b.slug].sort().join())) { seen.add([a.slug, b.slug].sort().join()); pairs.push(`<b>${esc(n(a))} + ${esc(n(b))}:</b> ${esc(first(p.why, 150))}`); } }));
		pairs.slice(0, 2).forEach((p) => why.push(p));
		// attributes
		const cnt = {};
		S.forEach((x) => (cnt[x.attribute] = (cnt[x.attribute] || 0) + 1));
		const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
		if (cnt[top] >= 3 && S.length >= 4) why.push(`${cnt[top]} of ${S.length} are ${top}, which keeps same-attribute kit bonuses on and gives the attribute advantage over ${NEXT[top]} enemies (+5% damage, +30% Effect Hit). Be careful against ${BEATEN_BY[top]} enemies.`);
		else if (S.length >= 4) why.push('Mixed attributes: flexible, but it gives up same-attribute bonuses.');
		if (breakers.length) why.push('Break: every Toughness break earns Break Skill points (1 per normal enemy, 3 per boss). At 3 points the party Break Skill fires.');
		// tanking
		let tank = '';
		if (tanks.length) {
			const t = tanks[0];
			tank = `<b>${esc(n(t))}</b> (${esc(t.role)}) goes in front. Many enemy skills target the front row about 80% of the time and often prefer Defenders, so hits land on ${esc(n(t))} first. ${esc(first(c.guides[t.slug]?.summary, 150))}`;
			if (tanks[1]) tank += ` ${esc(n(tanks[1]))} backs up as a second tank.`;
			const sus = [];
			if (healers.filter((h) => h !== t).length) sus.push(`healing from ${list(healers.filter((h) => h !== t).map(n))}`);
			const shields = S.filter((x) => has(x, 'shield') && x !== t);
			if (shields.length) sus.push(`barriers from ${list(shields.map(n))}`);
			const cl = S.filter((x) => has(x, 'cleanse'));
			if (cl.length) sus.push(`debuff cleanse from ${list(cl.map(n))}`);
			if (sus.length) tank += ` Backup: ${list(sus)}.`;
		} else {
			const f = S.slice().sort((a, b) => b.hp - a.hp)[0];
			tank = `No Defender in this lineup. Put <b>${esc(n(f))}</b> (highest HP) in front and expect the front unit to take most hits. Swap in a Defender if you have one.`;
		}
		return { mode, pve, pvp, why, tank };
	}

	function enhance(row) {
		const slugs = [...row.querySelectorAll('a.m[href^="#/savior/"]')].map(slugOf);
		const a = analyse(slugs);
		if (!a) return;
		const panel = row.closest('.panel,.tile') || row.parentElement;
		const cls = a.mode === 'PvE' ? 'pve' : a.mode === 'PvP' ? 'pvp' : 'both';
		const title = panel.querySelector('b,h3');
		if (title && !panel.querySelector('.mt')) title.insertAdjacentHTML('afterend', ` <span class="mt ${cls}" title="Mode from members' PvE avg ${a.pve.toFixed(1)} vs PvP avg ${a.pvp.toFixed(1)}">${a.mode}</span>`);
		const box = document.createElement('div');
		box.className = 'tinsight';
		box.innerHTML = `<div class="ti-row"><b>Why it works</b><ul>${a.why.map((w) => `<li>${w}</li>`).join('')}</ul></div><div class="ti-row"><b>Tanking</b><p>${a.tank}</p></div><small>Mode tag: ${a.mode}, from the members' PvE and PvP ratings.</small>`;
		row.after(box);
		row.dataset.ti = '1';
	}

	async function run() {
		c ||= await ctx();
		mo.disconnect();
		try { root.querySelectorAll('.team:not([data-ti])').forEach((r) => { r.dataset.ti = '1'; if (r.querySelector('a.m')) enhance(r); }); } finally { mo.observe(root, { childList: true, subtree: true }); }
	}
	let t = 0;
	const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 20); });
	mo.observe(root, { childList: true, subtree: true });
	run();
})();
