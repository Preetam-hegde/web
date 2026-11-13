'use strict';
// Tier list: sort-by-usage toggle. Usage and investment details live only in the hover card (hover.js).
// Data: data/insights.json (usage from the top-100 Gauntlet snapshot, investment from skill-upgrade milestones).
(async () => {
	const root = document.getElementById('app');
	const ins = await fetch('data/insights.json').then((r) => r.json());
	let sort = '';
	try { sort = localStorage.getItem('ssg-tsort') || ''; } catch { /* ignore */ }
	const slugOf = (a) => (a.getAttribute('href') || '').split('/')[2];
	function run() {
		mo.disconnect();
		try {
			const rows = root.querySelectorAll('.tier .row');
			rows.forEach((row) => {
				row.querySelectorAll(':scope > a').forEach((a, idx) => {
					if (!a.dataset.i) a.dataset.i = String(idx);
				});
				const items = [...row.querySelectorAll(':scope > a')];
				const sorted = items.slice().sort((a, b) => (sort === 'usage' ? (ins.by[slugOf(b)]?.usage || 0) - (ins.by[slugOf(a)]?.usage || 0) || a.dataset.i - b.dataset.i : a.dataset.i - b.dataset.i));
				// Only touch the DOM when the order really changes, otherwise the observers keep re-triggering each other.
				if (sorted.some((a, i) => a !== items[i])) sorted.forEach((a) => row.append(a));
			});
			const fbar = root.querySelector('.fbar');
			if (fbar && root.querySelector('.tier') && !fbar.querySelector('.tsort')) {
				const g = document.createElement('span');
				g.className = 'fg tsort';
				g.innerHTML = '<small>Sort</small><button class="fb" data-v="">A–Z</button><button class="fb" data-v="usage">PvP usage</button>';
				fbar.append(g);
				g.onclick = (e) => { const v = e.target.dataset?.v; if (v === undefined) return; sort = v; try { localStorage.setItem('ssg-tsort', sort); } catch { /* ignore */ } run(); };
			}
			root.querySelectorAll('.tsort button').forEach((b) => b.classList.toggle('on', b.dataset.v === sort));
		} finally { mo.observe(root, { childList: true, subtree: true }); }
	}
	let t = 0;
	const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 20); });
	mo.observe(root, { childList: true, subtree: true });
	run();
})();
