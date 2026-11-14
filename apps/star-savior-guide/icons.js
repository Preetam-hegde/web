'use strict';
// Adds a small icon next to game words everywhere in #app: buffs, debuffs, journey stats, gear sets and slots,
// savior links, skill names and boss names. Runs on every render via a MutationObserver. Keywords: data/keywords.json.
(async () => {
	const root = document.getElementById('app');
	const [kw, list] = await Promise.all([fetch('data/keywords.json').then((r) => r.json()), fetch('data/saviors.json').then((r) => r.json())]);
	const icoOf = Object.fromEntries(list.map((s) => [s.slug, s.icon]));
	const nameRe = Object.keys(kw).sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
	const RE = new RegExp(`(?<![\\w-])(?<!Preemptive )(${nameRe})(?![\\w-])`, 'g');
	const SETS = { Attack: '4P_ATK_RATE', Insight: '2P_CRI_RATE', Precision: '2P_CRI_RATE_EFFECT_RATE', Valor: '2P_ATK_RATE_EFFECT_EVADE', Speed: '4P_TURN_SPD', Defense: '2P_DEF_RATE', Hit: '2P_EFFECT_RATE', Resistance: '2P_EFFECT_EVADE', Health: '4P_HP_RATE', Destruction: '4P_CRI_DMG', Annihilation: '4P_CRI_DMG_EFFECT_RATE', Barrier: '4P_HP_RATE_EFFECT_EVADE' };
	const SLOTS = { Weapon: 'WEAPON', Gauntlets: 'GLOVES', Armor: 'ARMOR', Boots: 'SHOES', Amulet: 'NECKLACE', Ring: 'RING' };
	const SKIP = 'NAV,BUTTON,SELECT,OPTION,INPUT,TEXTAREA,H1,SCRIPT,STYLE,SUMMARY'.split(',');
	const skipSel = '.kw,.legend-box,.card,.tier .row a,.team .m,.topbar,.jump,.sp-tabs,.toc,.g-crumb,.fbar,.ib,.fb,.chip,#qs,.rv-stats';
	let enemies = null;
	const mk = (src, cls, alt = '') => { const i = document.createElement('img'); i.src = src.replace(/^\//, ''); i.className = cls; i.alt = alt; i.loading = 'lazy'; i.onerror = () => i.remove(); return i; };
	const skillMap = () => {
		const slug = location.hash.split('/')[2];
		const s = cache[`data/saviors/${slug}.json`];
		return s ? Object.fromEntries(s.skills.filter((k) => k.icon).map((k) => [k.name, k.icon])) : {};
	};

	function textNodes(el) {
		const out = [];
		const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() && !SKIP.includes(n.parentElement.tagName) && !n.parentElement.closest(skipSel) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
		while (w.nextNode()) out.push(w.currentNode);
		return out;
	}
	function run() {
		mo.disconnect();
		try {
			// 1) gear sets and slots in table cells
			root.querySelectorAll('td:not([data-ic])').forEach((td) => {
				td.dataset.ic = '1';
				const t = td.textContent.trim();
				const m = t.match(/^(\w+) \((2|4)\)$/);
				if (m && SETS[m[1]]) td.prepend(mk(`/images/sets/ICON_SET_${SETS[m[1]]}.webp`, 'set-ic', m[1]));
				else if (SLOTS[t]) td.prepend(mk(`/images/equipment/EQUIP_MOTIVATOR_TIER_2_${SLOTS[t]}.webp`, 'set-ic', t));
			});
			// 2) savior links inside written content get a face
			root.querySelectorAll('.g-body a[href^="#/savior/"],.guide-copy a[href^="#/savior/"],.panel a[href^="#/savior/"]').forEach((a) => {
				if (a.dataset.ic || a.querySelector('img') || a.closest('.card,.tier,.team,.jump')) return;
				a.dataset.ic = '1';
				const ico = icoOf[a.getAttribute('href').split('/')[2]];
				if (ico) a.prepend(mk(ico, 'sv-ic'));
			});
			// 3) skill names (savior page lists) get the skill icon
			const sm = skillMap();
			if (Object.keys(sm).length) {
				root.querySelectorAll('.guide-copy h3,.guide-copy li>b,.guide-copy p>b').forEach((el) => {
					if (el.dataset.ic) return;
					const name = el.textContent.replace(/^\d+\.\s*/, '').trim();
					if (sm[name]) { el.dataset.ic = '1'; el.prepend(mk(sm[name], 'sk-ic', name)); }
				});
			}
			// 4) boss names in the modes guide
			if (enemies) root.querySelectorAll('.g-body b').forEach((b) => {
				if (b.dataset.ic) return;
				const e = enemies[b.textContent.trim()];
				if (e) { b.dataset.ic = '1'; b.prepend(mk(e, 'sv-ic')); }
			});
			// 5) buff / debuff / stat words
			for (const n of textNodes(root)) {
				const v = n.nodeValue;
				RE.lastIndex = 0;
				if (!RE.test(v)) continue;
				RE.lastIndex = 0;
				const frag = document.createDocumentFragment();
				let last = 0, m;
				while ((m = RE.exec(v))) {
					frag.append(v.slice(last, m.index));
					const sp = document.createElement('span');
					sp.className = 'kw';
					sp.append(mk(kw[m[1]], 'kw-ic', m[1]), m[1]);
					frag.append(sp);
					last = m.index + m[0].length;
				}
				frag.append(v.slice(last));
				n.replaceWith(frag);
			}
		} finally {
			mo.observe(root, { childList: true, subtree: true });
		}
	}
	let t = 0;
	const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { if (location.hash.includes('systems-modes') && !enemies) { enemies = {}; fetch('data/enemies.json').then((r) => r.json()).then((E) => { E.filter((e) => e.grade === 'Boss' && e.icon).forEach((e) => (enemies[e.name] = e.icon)); run(); }); } run(); }, 20); });
	mo.observe(root, { childList: true, subtree: true });
	run();
})();
