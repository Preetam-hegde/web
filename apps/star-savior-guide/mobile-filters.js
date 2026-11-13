'use strict';
// On phones, every filter bar collapses to: search + "Filters" button + count. Tap to expand all filters.
(() => {
	const root = document.getElementById('app');
	const mq = matchMedia('(max-width: 820px)');
	function label(bar) {
		const n = bar.querySelectorAll('.ib.on,.fb.on,.chip.on').length + [...bar.querySelectorAll('select')].filter((s) => s.selectedIndex > 0 && !/^(PvE|PvP)$/.test(s.selectedOptions[0]?.text || '')).length;
		const b = bar.querySelector('.ftog');
		if (b) { const txt = `${bar.classList.contains('open') ? '▲' : '▼'} Filters${n ? ` (${n})` : ''}`; if (b.textContent !== txt) b.textContent = txt; }
	}
	function run() {
		mo.disconnect();
		try {
			root.querySelectorAll('.fbar').forEach((bar) => {
				if (!bar.querySelector('.ftog')) {
					const b = document.createElement('button');
					b.type = 'button';
					b.className = 'ftog';
					b.onclick = () => { bar.classList.toggle('open'); label(bar); };
					const search = bar.querySelector('input[type=search]');
					search ? search.after(b) : bar.prepend(b);
					bar.classList.add('fcol');
					bar.addEventListener('click', () => setTimeout(() => label(bar), 0));
					bar.addEventListener('change', () => setTimeout(() => label(bar), 0));
				}
				label(bar);
			});
		} finally { mo.observe(root, { childList: true, subtree: true }); }
	}
	let t = 0;
	const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 20); });
	mo.observe(root, { childList: true, subtree: true });
	run();
	mq.addEventListener?.('change', run);
})();
