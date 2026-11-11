'use strict';

/* ── sound ───────────────────────────────────────────── */
let audio = null;
const beep = (freq, ms = 90, { type = 'sine', gain = 0.06, at = 0 } = {}) => {
	if (!store.sound) return;
	try {
		audio ||= new (window.AudioContext || window.webkitAudioContext)();
		if (audio.state === 'suspended') audio.resume().catch(() => {});
		const t = audio.currentTime + at,
			o = audio.createOscillator(),
			g = audio.createGain();
		o.type = type;
		o.frequency.value = freq;
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
		o.connect(g).connect(audio.destination);
		o.onended = () => {
			o.disconnect();
			g.disconnect();
		};
		o.start(t);
		o.stop(t + ms / 1000 + 0.02);
		return o;
	} catch {
		/* no audio: the game plays fine without it */
	}
};

const sfx = {
	unlock: () => beep(440, 30, { gain: 0.02 }), // must run inside a tap so iOS lets later beeps through
	tick: () => beep(520, 70),
	go: () => beep(880, 160, { type: 'triangle' }),
	lock: () => beep(660, 60, { type: 'square', gain: 0.03 }),
	key: () => beep(900, 25, { gain: 0.025 }),
	bad: () => beep(160, 140, { type: 'sawtooth', gain: 0.04 }),
	win: () =>
		[523, 659, 784].forEach((f, i) =>
			beep(f, 160, { type: 'triangle', at: i * 0.11 }),
		),
	boom: () => beep(90, 450, { type: 'sawtooth', gain: 0.12 }),
};

// Mirrored games and countdowns run on the host; the guest still needs their sound cues.
Object.entries(sfx).forEach(([name, play]) => {
	sfx[name] = () => {
		play();
		if (net?.role === 'host' && !net.remote && name !== 'unlock')
			net.send({ t: 'sound', name });
	};
});
