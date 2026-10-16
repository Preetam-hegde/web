'use strict';

/* Hub: names, options, series tally and the game list. */

const MODE_NOTES = {
	split: 'Both of you play at the same time, each on your own half of the screen.',
	pass: 'One player at a time on the full screen. Play, then pass the phone.',
};
const SEAT_NOTES = {
	true: 'Phone flat between you: the top player\'s half is turned to face them.',
	false: 'Everyone reads the screen the same way up.',
};

function seg(el, options, current, onPick) {
	$$('button', el).forEach((b) => b.remove());
	options.forEach(([value, label]) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.textContent = label;
		b.setAttribute('aria-pressed', String(value === current));
		b.onclick = () => { onPick(value); save(); renderHub(); };
		el.append(b);
	});
}

const ON_OFF = [[true, 'On'], [false, 'Off']];

function renderHub() {
	document.body.dataset.flip = store.flip ? '1' : '0';
	document.body.dataset.mode = store.mode;
	[0, 1].forEach((p) => { $(`#n${p}`).value = store.names[p]; });

	seg($('#modeSeg'), [['split', 'Split screen'], ['pass', 'Pass & play']], store.mode, (v) => (store.mode = v));
	seg($('#seatSeg'), [[true, 'Face to face'], [false, 'Side by side']], store.flip, (v) => (store.flip = v));
	seg($('#roundsSeg'), [[3, '3'], [5, '5'], [7, '7']], store.rounds, (v) => (store.rounds = v));
	seg($('#soundSeg'), ON_OFF, store.sound, (v) => (store.sound = v));
	seg($('#dareSeg'), ON_OFF, store.dares, (v) => (store.dares = v));
	$('#seatSeg').hidden = store.mode === 'pass'; // seating only matters when two halves share the screen
	$('#seatNote').textContent = `${MODE_NOTES[store.mode]} ${store.mode === 'split' ? SEAT_NOTES[store.flip] : ''}`.trim();

	const [a, b] = store.series;
	const series = $('#series');
	series.hidden = !(a + b);
	series.innerHTML = `<span style="color:var(--p0)"><b>${esc(nameOf(0))} ${a}</b></span> – <span style="color:var(--p1)"><b>${b} ${esc(nameOf(1))}</b></span><button type="button">reset</button>`;
	$('button', series).onclick = () => { store.series = [0, 0]; save(); renderHub(); };
}

function renderGames() {
	const groups = {};
	GAMES.forEach((g) => (groups[g.group] ||= []).push(g));
	$('#games').innerHTML = Object.entries(groups)
		.map(([name, list]) => `<h2>${name}</h2><div class="grid">${list.map((g) => `<button class="card" type="button" data-game="${g.id}"><span class="ic">${g.icon}</span><b>${g.name}</b><small>${g.blurb}</small></button>`).join('')}</div>`)
		.join('');
}

$('#games').onclick = (e) => {
	const card = e.target.closest('[data-game]');
	if (card) startMatch(GAMES.find((g) => g.id === card.dataset.game));
};

[0, 1].forEach((p) => {
	$(`#n${p}`).oninput = (e) => { store.names[p] = e.target.value; save(); };
});

/* Quit needs two taps so a stray thumb can't end the match. */
let quitTimer = 0;
$('#quit').onclick = (e) => {
	const btn = e.currentTarget;
	if (btn.classList.contains('sure')) { clearTimeout(quitTimer); btn.classList.remove('sure'); btn.textContent = 'Quit'; return quit(); }
	btn.classList.add('sure');
	btn.textContent = 'Sure?';
	quitTimer = setTimeout(() => { btn.classList.remove('sure'); btn.textContent = 'Quit'; }, 2000);
};

$('#share').onclick = shareResult;

document.addEventListener('contextmenu', (e) => e.preventDefault()); // long-press must not open menus mid-game

renderGames();
renderHub();
