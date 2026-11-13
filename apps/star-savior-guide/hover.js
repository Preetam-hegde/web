'use strict';
// Hover details for every savior link/card: portrait, ratings, stats, kit summary and tags.
// Mouse devices only. Works on any element link to #/savior/<slug> (grid cards, tier list, team rows, builder).
(() => {
	if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
	const tip = document.createElement('div');
	tip.id = 'hv';
	tip.setAttribute('role', 'tooltip');
	document.body.append(tip);
	let data = null, ins = null, timer = 0, cur = '';
	const INV = ['', 'Low', 'Medium', 'High'];
	const pips = (n) => '●'.repeat(n) + '○'.repeat(3 - n);
	const tierColor = (t) => (typeof TIER_COLOR !== 'undefined' && TIER_COLOR[t]) || '#8aa';
	const first = (t, n) => { t = String(t || ''); const m = t.match(/^.*?[.!?](\s|$)/); const s = m ? m[0].trim() : t; return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
	const slugOf = (a) => { const h = a.getAttribute('href') || ''; const m = h.match(/^#\/savior\/([^/]+)/); return m ? m[1] : (a.dataset && a.dataset.s) || ''; };
	const target = (el) => el.closest('a[href^="#/savior/"], .card[data-s]');

	function fill(slug) {
		const s = data.by[slug];
		if (!s) return false;
		const g = data.guides[slug] || {};
		const r = s.ratings;
		const rate = r ? `<span class="hv-r" style="background:${tierColor(r.pve)}">PvE ${r.pve}</span><span class="hv-r" style="background:${tierColor(r.pvp)}">PvP ${r.pvp}</span>` : `<span class="hv-r" style="background:${tierColor(s.tier)}">Tier ${s.tier}</span>`;
		const i = ins && ins.by[slug];
		const pct = i ? Math.round(i.usage * 100) : null;
		const sig = i ? `<div class="hv-sig"><div class="hv-use"><span>PvP usage</span><div class="hv-bar"><i style="width:${Math.max(2, pct)}%"></i></div><b>${pct}%</b></div><div class="hv-inv"><span>Investment</span><b class="inv${i.inv}">${pips(i.inv)} ${INV[i.inv]}</b><small>${i.keyups} key upgrades</small></div>${i.why ? `<p><b>Why this tier:</b> ${esc(i.why)}</p>` : ''}${i.prio ? `<p><b>Spend first:</b> ${esc(i.prio)}</p>` : ''}<small class="hv-note">Usage: top-100 Gauntlet squads, 12 Nov 2026.</small></div>` : '';
		const tags = (g.tags || []).slice(0, 5).map((x) => (typeof TAGS !== 'undefined' && TAGS[x] ? `<span>${TAGS[x][0]} ${TAGS[x][1]}</span>` : '')).join('');
		const dep = g.dependency && typeof DEP !== 'undefined' && DEP[g.dependency] ? `<span>${DEP[g.dependency][0]} ${DEP[g.dependency][1]}</span>` : '';
		tip.innerHTML = `<div class="hv-top"><img src="${s.portrait ? s.portrait.replace(/^\//, '') : s.icon.replace(/^\//, '')}" alt=""><div><b>${esc(s.name)}</b><small>${esc(s.title)}</small>
		<div class="hv-chips"><span class="hv-g ${s.grade}">${s.grade}</span><span><img src="images/ui/attr_${s.attribute.toLowerCase()}.webp" alt="">${s.attribute}</span><span><img src="images/ui/role_${s.role.toLowerCase()}.webp" alt="">${s.role}</span></div><div class="hv-rate">${rate}</div></div></div>
		<div class="hv-stats"><div><small>HP</small><b>${fmt(s.hp)}</b></div><div><small>ATK</small><b>${fmt(s.atk)}</b></div><div><small>DEF</small><b>${fmt(s.def)}</b></div><div><small>SPD</small><b>${s.spd ?? '—'}</b></div></div>
		${sig}
		${g.summary ? `<p>${esc(first(g.summary, 160))}</p>` : ''}${g.watch ? `<p class="hv-w">⚠ ${esc(first(g.watch, 120))}</p>` : ''}
		<div class="hv-tags">${tags}${dep}</div><div class="hv-go">Click for the full guide →</div>`;
		return true;
	}
	function place(x, y) {
		const w = tip.offsetWidth, h = tip.offsetHeight, pad = 14;
		let left = x + 18, top = y + 14;
		if (left + w + pad > innerWidth) left = x - w - 18;
		if (left < pad) left = pad;
		if (top + h + pad > innerHeight) top = innerHeight - h - pad;
		if (top < pad) top = pad;
		tip.style.transform = `translate(${Math.round(left)}px,${Math.round(top)}px)`;
	}
	// Pointer-driven: the card is shown only while the pointer is over a savior card, and every other event closes it.
	let curEl = null, token = 0, mx = 0, my = 0;
	const hide = () => { clearTimeout(timer); token++; cur = ''; curEl = null; tip.classList.remove('on'); };
	document.addEventListener('mousemove', (e) => {
		mx = e.clientX; my = e.clientY;
		const a = target(e.target);
		if (!a || a.closest('#qs,.topbar,.jump,#hv')) { if (curEl || cur) hide(); return; }
		if (a === curEl) { if (tip.classList.contains('on')) place(mx, my); return; }
		hide();
		const slug = slugOf(a);
		if (!slug) return;
		curEl = a;
		const mine = ++token;
		timer = setTimeout(async () => {
			data ||= await ctx();
			ins ||= await fetch('data/insights.json').then((r) => r.json()).catch(() => ({ by: {} }));
			// The pointer may have left (or the page re-rendered) while data was loading.
			if (mine !== token || curEl !== a || !a.isConnected || !a.matches(':hover')) return;
			if (!fill(slug)) return;
			cur = slug;
			tip.classList.add('on');
			place(mx, my);
		}, 140);
	});
	document.documentElement.addEventListener('mouseleave', hide);
	document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) hide(); });
	['mousedown', 'wheel', 'keydown', 'dragstart', 'contextmenu'].forEach((t) => addEventListener(t, hide, { passive: true }));
	['blur', 'hashchange', 'scroll', 'resize'].forEach((t) => addEventListener(t, hide, { passive: true }));
	document.addEventListener('visibilitychange', hide);
	// Filters and routes re-render the page under a still pointer: close the card when the page content changes.
	const app = document.getElementById('app');
	if (app) new MutationObserver(() => { if ((cur || curEl) && curEl && !curEl.isConnected) hide(); }).observe(app, { childList: true, subtree: true });
})();
