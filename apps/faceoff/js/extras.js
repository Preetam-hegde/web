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

/* ── loser dares: {w} becomes the winner's name ──────── */
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
	const { champ, dare } = m.final;
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
	g.fillText(champ < 0 ? '🤝' : '🏆', W / 2, 720);
	const heading = champ < 0 ? 'Draw' : nameOf(champ);
	let size = 120;
	g.font = `700 ${size}px ${sans}`;
	while (g.measureText(heading).width > W - 140 && size > 50) g.font = `700 ${(size -= 6)}px ${sans}`;
	g.fillStyle = champ < 0 ? '#f4f1ff' : P[champ];
	g.fillText(heading, W / 2, 890);
	g.fillStyle = '#9a93c4';
	g.font = `500 56px ${sans}`;
	g.fillText(champ < 0 ? 'Nobody blinked' : 'wins the match', W / 2, 970);

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
