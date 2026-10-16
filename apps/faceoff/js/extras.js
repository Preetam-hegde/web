'use strict';

/* Sound, loser dares and the shareable result card. */

/* ── sound ───────────────────────────────────────────── */
let audio = null;
const beep = (freq, ms = 90, { type = 'sine', gain = 0.06, at = 0 } = {}) => {
	if (!store.sound) return;
	try {
		audio ||= new (window.AudioContext || window.webkitAudioContext)();
		if (audio.state === 'suspended') audio.resume();
		const t = audio.currentTime + at, o = audio.createOscillator(), g = audio.createGain();
		o.type = type;
		o.frequency.value = freq;
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
		o.connect(g).connect(audio.destination);
		o.start(t);
		o.stop(t + ms / 1000 + 0.02);
	} catch { /* no audio: the game plays fine without it */ }
};

const sfx = {
	unlock: () => beep(440, 30, { gain: 0.02 }), // must run inside a tap so iOS lets later beeps through
	tick: () => beep(520, 70),
	go: () => beep(880, 160, { type: 'triangle' }),
	lock: () => beep(660, 60, { type: 'square', gain: 0.03 }),
	key: () => beep(900, 25, { gain: 0.025 }),
	bad: () => beep(160, 140, { type: 'sawtooth', gain: 0.04 }),
	win: () => [523, 659, 784].forEach((f, i) => beep(f, 160, { type: 'triangle', at: i * 0.11 })),
	boom: () => beep(90, 450, { type: 'sawtooth', gain: 0.12 }),
};

/* ── loser dares: {w} becomes the winner's name (or the partner's, in Truth or Dare) ── */
const DARES = [
	'Give {w} a 60-second shoulder rub.',
	'Tell {w} one thing you admire about them. Out loud, no jokes.',
	'Speak in an accent of {w}\'s choice for the next 10 minutes.',
	'Let {w} pick the next song, and sing along.',
	'Do your best impression of {w}.',
	'Make {w} a drink or a snack.',
	'Hold a plank until {w} counts to 30.',
	'Write {w} a two-line poem. It has to rhyme.',
	'{w} picks tonight\'s movie. No vetoes.',
	'Do 15 jumping jacks while {w} cheers you on.',
	'Tell {w} your most embarrassing memory.',
	'Wear a sock on your hand for the next 15 minutes.',
	'Pay {w} a compliment every time they say "okay" for the next hour.',
	'Take care of the next chore {w} names.',
	'Let {w} choose your phone wallpaper for a day.',
	'Narrate the next two minutes like a nature documentary.',
	'Dance for 30 seconds with no music.',
	'Hold eye contact with {w} for 30 seconds without laughing.',
	'Name three things you are grateful for about {w}.',
	'Strut across the room like a fashion model while {w} scores you.',
	'Say the alphabet backwards. {w} is the judge.',
	'Carry {w}\'s bag for the rest of the day.',
	'Sing the chorus of any song {w} names.',
	'Plan the next hangout. {w} has final say.',
	'Ask {w} one question you have always been curious about. They must answer honestly.',
];

/* ── share card (a 1080x1920 story image) ────────────── */
const wrapText = (g, text, maxW) => {
	const lines = [];
	let line = '';
	text.split(' ').forEach((word) => {
		const next = line ? `${line} ${word}` : word;
		if (line && g.measureText(next).width > maxW) { lines.push(line); line = word; } else line = next;
	});
	return line ? [...lines, line] : lines;
};

async function renderCard() {
	const { champ, dare, coop } = m.final; // champ: 0/1 winner, -1 draw, -2 played together
	await document.fonts?.ready;
	const W = 1080, H = 1920;
	const cv = document.createElement('canvas');
	cv.width = W;
	cv.height = H;
	const g = cv.getContext('2d');
	const sans = "'Space Grotesk', system-ui, sans-serif", mono = "'JetBrains Mono', ui-monospace, monospace";
	const P = ['#ff7a59', '#35d6c8'];

	g.fillStyle = '#0d0b1a';
	g.fillRect(0, 0, W, H);
	[[180, 260, 900, P[0]], [900, 1680, 1000, P[1]]].forEach(([x, y, r, c]) => {
		const gr = g.createRadialGradient(x, y, 0, x, y, r);
		gr.addColorStop(0, `${c}66`);
		gr.addColorStop(1, `${c}00`);
		g.fillStyle = gr;
		g.fillRect(0, 0, W, H);
	});

	g.textBaseline = 'alphabetic';
	g.font = `700 130px ${sans}`;
	const wFace = g.measureText('face').width, wOff = g.measureText('off').width;
	g.textAlign = 'left';
	g.fillStyle = '#f4f1ff';
	g.fillText('face', (W - wFace - wOff) / 2, 220);
	const lg = g.createLinearGradient(0, 0, W, 0);
	lg.addColorStop(0.45, P[0]);
	lg.addColorStop(0.6, P[1]);
	g.fillStyle = lg;
	g.fillText('off', (W - wFace - wOff) / 2 + wFace, 220);

	g.textAlign = 'center';
	g.fillStyle = '#9a93c4';
	g.font = `500 52px ${sans}`;
	g.fillText(`${m.game.icon} ${m.game.name}`, W / 2, 350);
	g.font = `400 40px ${sans}`;
	g.fillText(`${m.rounds} rounds`, W / 2, 415);

	g.font = '200px serif';
	g.fillStyle = '#fff';
	g.fillText(coop ? '💞' : champ < 0 ? '🤝' : '🏆', W / 2, 720);
	const heading = coop ? coop.title : champ < 0 ? 'Draw' : nameOf(champ);
	let size = 120;
	g.font = `700 ${size}px ${sans}`;
	while (g.measureText(heading).width > W - 140 && size > 50) g.font = `700 ${(size -= 6)}px ${sans}`;
	g.fillStyle = champ < 0 ? '#f4f1ff' : P[champ];
	g.fillText(heading, W / 2, 890);
	g.fillStyle = '#9a93c4';
	g.font = `500 56px ${sans}`;
	g.fillText(coop ? coop.sub : champ < 0 ? 'Nobody blinked' : 'wins the match', W / 2, 970);

	if (coop) {
		let ns = 72;
		const names = `${nameOf(0)} & ${nameOf(1)}`;
		g.font = `700 ${ns}px ${sans}`;
		while (g.measureText(names).width > W - 160 && ns > 30) g.font = `700 ${(ns -= 4)}px ${sans}`;
		g.fillStyle = '#f4f1ff';
		g.fillText(names, W / 2, 1280);
	} else {
		[0, 1].forEach((p) => {
			const x = p ? 790 : 290;
			g.fillStyle = P[p];
			g.font = `700 260px ${mono}`;
			g.fillText(String(m.pts[p]), x, 1290);
			let ns = 52;
			g.font = `500 ${ns}px ${sans}`;
			while (g.measureText(nameOf(p)).width > 440 && ns > 28) g.font = `500 ${(ns -= 3)}px ${sans}`;
			g.fillStyle = '#f4f1ff';
			g.fillText(nameOf(p), x, 1370);
		});
		g.fillStyle = '#4a4470';
		g.font = `700 160px ${mono}`;
		g.fillText('–', W / 2, 1270);
	}

	if (dare) {
		g.font = `500 46px ${sans}`;
		const lines = wrapText(g, dare, 820).slice(0, 4);
		const boxH = 150 + lines.length * 62;
		const top = 1470;
		g.setLineDash([16, 12]);
		g.lineWidth = 4;
		g.strokeStyle = '#ff5d73';
		g.beginPath();
		g.roundRect(100, top, W - 200, boxH, 36);
		g.stroke();
		g.setLineDash([]);
		g.fillStyle = '#ff5d73';
		g.font = `700 38px ${sans}`;
		g.fillText('LOSER’S DARE', W / 2, top + 72);
		g.fillStyle = '#f4f1ff';
		g.font = `500 46px ${sans}`;
		lines.forEach((l, i) => g.fillText(l, W / 2, top + 142 + i * 62));
	}

	g.fillStyle = '#6a6396';
	g.font = `500 38px ${sans}`;
	g.fillText('preetamhegde.in/apps/faceoff', W / 2, 1850);
	return new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
}

async function shareResult() {
	if (!m?.final) return;
	const blob = await m.final.card;
	if (!blob) return;
	const file = new File([blob], 'faceoff-result.png', { type: 'image/png' });
	if (navigator.canShare?.({ files: [file] })) {
		try { await navigator.share({ files: [file], title: 'Faceoff' }); } catch { /* cancelled */ }
		return;
	}
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'faceoff-result.png';
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ── game icons: Lucide line icons (ISC, https://lucide.dev), drawn in currentColor ── */
const GAME_ICONS = {
	likely: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
	never: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
	compat: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
	rather: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
	roulette: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/>',
	connect4: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>',
	sync: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
	stop: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
	liar: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
	feel: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
	hold: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
	centre: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
	frenzy: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
	green: '<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/>',
	cut: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
	know: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
	hangman: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
	ttt: '<path d="M8 3v18"/><path d="M16 3v18"/><path d="M3 8h18"/><path d="M3 16h18"/>',
	'ttt-x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
	'ttt-o': '<circle cx="12" cy="12" r="8"/>',
	memory: '<rect width="8" height="8" x="3" y="3" rx="1.5"/><rect width="8" height="8" x="13" y="13" rx="1.5"/><path d="M17 3v4"/><path d="M15 5h4"/><path d="M5 17v4"/><path d="M3 19h4"/>',
	flags: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
};
const gameIcon = (id) => `<svg class="gi" viewBox="0 0 24 24" aria-hidden="true">${GAME_ICONS[id] || ''}</svg>`;

/* The built-in dares plus any the players typed in on the menu. */
const allDares = () => [...DARES, ...store.custom.dares];
