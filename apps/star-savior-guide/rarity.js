'use strict';
// SSR / SR: filter buttons on every savior list (saviors, tier list, builder) and a visual grade on every savior card.
// Adds data-g="SSR|SR" to savior cards/thumbs for styling (rarity.css) and hides the other grade when a filter is on.
(async () => {
	const root = document.getElementById('app');
	const list = await fetch('data/saviors.json').then((r) => r.json());
	const grade = Object.fromEntries(list.map((s) => [s.slug, s.grade]));
	let f = '';
	try { f = localStorage.getItem('ssg-grade') || ''; } catch { /* storage may be blocked */ }
	const slugOf = (el) => (el.getAttribute('href') || '').match(/^#\/savior\/([^/]+)/)?.[1] || el.dataset.s || '';
	const items = () => root.querySelectorAll('a.card[href^="#/savior/"],.card[data-s],.tier .row a[href^="#/savior/"],.team .m[href^="#/savior/"]');

	function apply() {
		mo.disconnect();
		try {
			let shown = 0;
			items().forEach((el) => {
				const g = grade[slugOf(el)];
				if (!g) return;
				el.dataset.g = g;
				el.querySelectorAll('.im,.ic').forEach((x) => (x.dataset.g = g));
				const hide = f && g !== f && !el.closest('.team');
				el.classList.toggle('rar-hide', !!hide);
				if (!hide) shown++;
			});
			root.querySelectorAll('.tier').forEach((t) => t.classList.toggle('rar-hide', !t.querySelector('.row a:not(.rar-hide)')));
			const fbar = root.querySelector('.fbar');
			const hasList = root.querySelector('.tier,.card[data-s],#g .card');
			if (fbar && hasList && !fbar.querySelector('.rar')) {
				const g = document.createElement('span');
				g.className = 'fg rar';
				g.innerHTML = '<small>Rarity</small><button class="fb rar-ssr" data-v="SSR">SSR</button><button class="fb rar-sr" data-v="SR">SR</button>';
				fbar.prepend(g);
				g.onclick = (e) => {
					const v = e.target.dataset?.v;
					if (!v) return;
					f = f === v ? '' : v;
					try { localStorage.setItem('ssg-grade', f); } catch { /* ignore */ }
					apply();
				};
			}
			fbar?.querySelectorAll('.rar button').forEach((b) => b.classList.toggle('on', b.dataset.v === f));
			const cnt = root.querySelector('#cnt');
			if (cnt && hasList && f) { const txt = `${shown} shown (${f})`; if (cnt.textContent !== txt) cnt.textContent = txt; }
		} finally {
			mo.observe(root, { childList: true, subtree: true });
		}
	}
	let t = 0;
	const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(apply, 20); });
	mo.observe(root, { childList: true, subtree: true });
	apply();
})();
