'use strict';
// Gacha-style character review: verdict, abilities (basic / special / ultimate / passive), pros and cons, dupes,
// Auto Journey stat order, skill upgrade order, gear stats, and team menus with swap options.
// Data: data/reviews.json (built from the skill data and savior guides). Used by savior pages and spotlight guides.
const RV = (() => {
	let data = null, c = null;
	const JI = { Strength: 'POWER', Vitality: 'HEALTH', Endurance: 'ENDURANCE', Protection: 'PROTECT', Focus: 'FOCUS' };
	const VCLASS = { 'Must pull': 'top', 'Strong pull': 'high', 'Solid pick': 'mid', Situational: 'low', Filler: 'low', 'Too new to rate': 'new' };
	const LCLASS = { Basic: 'basic', Special: 'special', Ultimate: 'ult', Passive: 'passive' };
	const e = (s) => esc(s);
	const sav = (slug) => c.by[slug];
	const link = (slug) => `<a href="#/savior/${slug}"><img class="sv-ic" src="${img(sav(slug).icon)}" alt="">${e(sav(slug).name)}</a>`;
	async function load() {
		if (data) return data;
		[data, c] = await Promise.all([fetch('data/reviews.json').then((r) => r.json()), ctx()]);
		return data;
	}
	function verdict(slug) {
		const r = data[slug], v = r.verdict;
		return `<div class="rv-verdict"><div class="rv-badge ${VCLASS[v.label] || 'mid'}">${e(v.label)}</div>
		<div class="rv-vtxt"><b>${e(r.role)}</b> · ${e(sav(slug).attribute)} · <span class="tag" style="background:${TIER_COLOR[v.pve]}">PvE ${v.pve}</span> <span class="tag" style="background:${TIER_COLOR[v.pvp]}">PvP ${v.pvp}</span><p>${e(v.why)}</p></div></div>`;
	}
	function abilities(slug) {
		const r = data[slug];
		return `<div class="rv-abil">${r.abilities.map((a) => `<div class="rv-ab ${LCLASS[a.label]}"><img loading="lazy" width="48" height="48" src="${img(a.icon)}" alt="" onerror="this.style.visibility='hidden'">
		<div><div class="rv-abh"><span class="rv-lab">${a.label === 'Ultimate' ? 'ULT' : a.label.toUpperCase()}</span><b>${e(a.name)}</b>${a.react ? '<span class="rv-cd">auto trigger</span>' : ''}${a.cd ? `<span class="rv-cd">Cooldown ${a.cd}${a.cd_after ? ` → ${a.cd_after} with upgrades` : ''}</span>` : ''}</div><p>${e(a.text)}</p></div></div>`).join('')}</div>`;
	}
	function proscons(slug) {
		const r = data[slug];
		return `<div class="rv-pc"><div class="pros"><h4>Pros</h4><ul>${r.pros.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div><div class="cons"><h4>Cons</h4><ul>${r.cons.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div></div>`;
	}
	function review(slug) {
		const r = data[slug];
		return `${verdict(slug)}<h2>Overview</h2><div class="panel"><p>${e(r.overview)}</p></div>
		<h2>Abilities</h2>${abilities(slug)}<h2>Pros and cons</h2>${proscons(slug)}
		${r.play.length ? `<h2>How to play</h2><div class="panel"><ol>${r.play.map((x) => `<li>${e(x)}</li>`).join('')}</ol></div>` : ''}
		<h2>Do I need dupes?</h2><div class="panel rv-dupes"><div class="rv-dbadge ${r.dupes.level === 'Not needed' ? 'no' : 'nice'}">${e(r.dupes.level)}</div><p>${e(r.dupes.text)}</p></div>`;
	}
	function build(slug) {
		const r = data[slug], j = r.journey, u = r.upgrade, g = r.gear;
		return `<h2>Auto Journey: which stats to pick</h2><div class="panel"><p class="muted">You choose the stat order in Auto Journey. Pick in this order:</p>
		<ol class="rv-stats">${j.order.map((s, i) => `<li class="${i < 2 ? 'focus' : i < 3 ? 'mid' : 'skip'}"><span class="n">${i + 1}</span><img src="images/jstats/AB_UNIT_STAT_${JI[s]}.webp" alt=""><b>${s}</b><em>${i < 2 ? 'Top pick' : i < 3 ? 'Then' : 'Low priority'}</em></li>`).join('')}</ol>
		<ul>${j.notes.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div>
		<h2>Skill upgrade order</h2><div class="panel"><div class="rv-order">${u.order.map((x, i) => `<span class="o${i}">${x === 'Ultimate' ? 'Ult' : x}</span>`).join('<i>›</i>')}</div>
		<ul>${u.items.map((x) => `<li><b>${x.label === 'Ultimate' ? 'Ult' : x.label} (${e(x.name)}):</b> ${x.notes.length ? e(x.notes.join('; ')) : 'number bumps only'}</li>`).join('')}</ul>
		<p class="muted">Rule of thumb: spend on skills with cooldown cuts first. Basic upgrades only add small damage.</p></div>
		<h2>Gear stat priority</h2><div class="panel"><div class="rv-order">${g.stats.map((x, i) => `<span class="o${Math.min(i, 3)}">${e(x)}</span>`).join('<i>›</i>')}</div>
		<ul><li><b>Sets:</b> ${e(g.sets)}</li><li><b>Main stats:</b> ${e(g.main)}</li></ul>
		<p class="muted">Rolls follow the <a href="#/gearscore">gear score</a> weights. See the <a href="#/guide/systems-equipment">equipment guide</a>.</p></div>`;
	}
	function swaps(list) {
		return list.length ? `<div class="rv-swap"><span>Swap with:</span>${list.map((s) => `<a href="#/savior/${s.slug}" title="${e(s.why)}"><img src="${img(sav(s.slug).icon)}" alt="">${e(sav(s.slug).name)}<small>${e(s.why)}</small></a>`).join('')}</div>` : '<div class="rv-swap"><span>No close replacement.</span></div>';
	}
	function teams(slug) {
		const r = data[slug];
		return `<h2>Best teams</h2>${r.teams.map((t) => `<div class="panel rv-team"><h3>${e(t.name)}</h3>
		<div class="team">${t.members.map((m) => `<a class="m" href="#/savior/${m.slug}"><img loading="lazy" width="80" height="80" src="${img(sav(m.slug).icon)}" alt="">${e(sav(m.slug).name)}<br><small class="muted">${e(sav(m.slug).title)}</small></a>`).join('')}</div>
		<p>${e(t.how)}</p>
		<details class="rv-who" open><summary>Who does what, and what you can use instead</summary>${t.members.map((m) => `<div class="rv-mem"><div class="rv-mh">${link(m.slug)}<span class="tag">${e(m.role)}</span></div><p>${e(m.does)}</p>${swaps(m.swap)}</div>`).join('')}</details></div>`).join('')}`;
	}
	return { load, review, build, teams, verdict, all: (slug) => review(slug) + build(slug) + teams(slug) };
})();
