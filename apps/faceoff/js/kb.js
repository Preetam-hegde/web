'use strict';

/* An on-screen keyboard per player, so both can type at once on one phone without the OS keyboard,
   plus the shared pane layout used by the turn-based typing duels. */

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '⏎zxcvbnm⌫'];
const KEY_RANK = { x: 1, y: 2, g: 3 };

/* Draws a keyboard into `host`. onKey gets 'a'..'z', 'enter' or 'back'. */
function keyboard(host, onKey) {
	host.className = 'kb';
	host.innerHTML = KEY_ROWS.map((row) => `<div class="kr">${[...row].map((k) => {
		const id = k === '⏎' ? 'enter' : k === '⌫' ? 'back' : k;
		return `<button type="button" data-k="${id}"${id.length > 1 ? ' class="wide"' : ''}>${k}</button>`;
	}).join('')}</div>`).join('');
	host.onpointerdown = (e) => {
		const b = e.target.closest('button');
		if (!b) return;
		e.preventDefault();
		onKey(b.dataset.k);
	};
	return {
		/* Colour a key: 'g' right place / hit, 'y' elsewhere, 'x' not in the word. Never downgrades. */
		mark(letter, cls) {
			const b = $(`[data-k="${letter}"]`, host);
			if (!b) return;
			const cur = ['x', 'y', 'g'].find((c) => b.classList.contains(c));
			if (cur && KEY_RANK[cur] >= KEY_RANK[cls]) return;
			b.classList.remove('x', 'y', 'g');
			b.classList.add(cls);
		},
		enabled: (on) => host.classList.toggle('off', !on),
	};
}

/* Standard pane for typing duels: header, fuse bar, typed word, message line, keyboard. */
function typePane(ctx, onKey) {
	const { stage } = ctx;
	stage.innerHTML = '<div class="dhead"></div><div class="bar"><i></i></div><div class="word"></div><div class="msg"></div><div class="kb"></div>';
	const q = (sel) => $(sel, stage);
	const kb = keyboard(q('.kb'), onKey);
	let msgTimer = 0;
	return {
		kb,
		head: (html) => { q('.dhead').innerHTML = html; },
		word: (text) => { q('.word').textContent = text; },
		bar(frac, hot = false) {
			q('.bar i').style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
			q('.bar').classList.toggle('hot', hot);
		},
		/* Flash a short message and shake the word. */
		msg(text) {
			const el = q('.msg');
			el.textContent = text;
			clearTimeout(msgTimer);
			msgTimer = setTimeout(() => { el.textContent = ''; }, 1500);
			q('.word').animate([{ transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }], 200);
		},
		hideBar: () => { q('.bar').style.visibility = 'hidden'; },
	};
}

/* Apply a typed key to a string: letters append, 'back' deletes, anything else is ignored. */
function typeKey(text, k, max = 15) {
	if (k === 'back') return text.slice(0, -1);
	return /^[a-z]$/.test(k) && text.length < max ? text + k : text;
}
