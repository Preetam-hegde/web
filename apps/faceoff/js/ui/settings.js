'use strict';

const MODE_NOTES = {
	split:
		'Both of you play at the same time, each on your own half of the screen.',
	pass: 'One player at a time on the full screen. Play, then pass the phone.',
};
const SEAT_NOTES = {
	true: "Phone flat between you: the top player's half is turned to face them.",
	false: 'Everyone reads the screen the same way up.',
};

function seg(el, options, current, onPick) {
	$$('button', el).forEach((b) => b.remove());
	options.forEach(([value, label]) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.textContent = label;
		b.setAttribute('aria-pressed', String(value === current));
		b.onclick = () => {
			onPick(value);
			save();
			renderHub();
		};
		el.append(b);
	});
}

const ON_OFF = [
	[true, 'On'],
	[false, 'Off'],
];

let setTab = 'two';

function renderSettings() {
	seg(
		$('#setTab'),
		[
			['solo', 'Single'],
			['two', '2 players'],
			['group', '3 +'],
		],
		setTab,
		(v) => (setTab = v),
	);
	$$('[data-set]').forEach((el) => {
		el.hidden = !el.dataset.set.split(' ').includes(setTab);
	});
	seg(
		$('#groupRoundsSeg'),
		[
			[3, '3'],
			[5, '5'],
			[7, '7'],
		],
		store.groupRounds,
		(v) => (store.groupRounds = v),
	);
	seg($('#timedSeg'), ON_OFF, store.timed, (v) => (store.timed = v));
	$('#timedNote').textContent = store.timed
		? 'On: once one player locks in, the others get 20 seconds, then their turn ends.'
		: 'Off: no time limit. The round waits for everyone and shows who has locked in.';
	seg(
		$('#modeSeg'),
		[
			['split', 'Split screen'],
			['pass', 'Pass & play'],
		],
		store.mode,
		(v) => (store.mode = v),
	);
	seg(
		$('#seatSeg'),
		[
			[true, 'Face to face'],
			[false, 'Side by side'],
		],
		store.flip,
		(v) => (store.flip = v),
	);
	seg(
		$('#roundsSeg'),
		[
			[3, '3'],
			[5, '5'],
			[7, '7'],
		],
		store.rounds,
		(v) => (store.rounds = v),
	);
	seg($('#soundSeg'), ON_OFF, store.sound, (v) => (store.sound = v));
	seg(
		$('#bigSeg'),
		[
			[true, 'Large'],
			[false, 'Normal'],
		],
		store.big,
		(v) => (store.big = v),
	);
	seg($('#dareSeg'), ON_OFF, store.dares, (v) => (store.dares = v));
	$('#seatSeg').hidden = store.mode === 'pass'; // seating only matters when two halves share the screen
	$('#seatNote').textContent =
		`${MODE_NOTES[store.mode]} ${store.mode === 'split' ? SEAT_NOTES[store.flip] : ''}`.trim();

	// The text boxes are only rewritten when not being typed in, so the cursor never jumps.
	[
		['cDares', 'dares'],
		['cTruths', 'truths'],
	].forEach(([id, key]) => {
		if (document.activeElement !== $(`#${id}`))
			$(`#${id}`).value = store.custom[key].join('\n');
	});
}

/* Settings: every option lives on this page; changes save as you tap. */
const openSettings = () => {
	document.body.dataset.screen = 'settings';
	window.scrollTo(0, 0);
	renderHub();
};
$('#settingsBtn').onclick = openSettings;
$('#settingsChip').onclick = openSettings;
$('#settingsBack').onclick = toHub;
/* One line per entry, trimmed and capped, so a pasted essay can't bloat storage. */
const toLines = (text) =>
	text
		.split('\n')
		.map((l) => l.trim().slice(0, 140))
		.filter(Boolean)
		.slice(0, 30);
[
	['cDares', 'dares'],
	['cTruths', 'truths'],
].forEach(([id, key]) => {
	$(`#${id}`).oninput = (e) => {
		store.custom[key] = toLines(e.target.value);
		save();
	};
});
