'use strict';

/* ── Sound Synthesizer (Web Audio API) ─────────────────────── */
class SoundEngine {
	constructor() {
		this.ctx = null;
		this.masterGain = null;
		this.volume = 0.28;
		this.enabled = true;
	}

	init() {
		if (this.ctx) return;
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		this.ctx = new AudioCtx();
		this.masterGain = this.ctx.createGain();
		this.masterGain.gain.value = this.volume;
		this.masterGain.connect(this.ctx.destination);
	}

	resume() {
		this.init();
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
	}

	toggle() {
		this.enabled = !this.enabled;
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
		}
		return this.enabled;
	}

	playBlip(freq = 560, duration = 0.05) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, t);
		osc.frequency.exponentialRampToValueAtTime(freq * 1.3, t + duration);

		gain.gain.setValueAtTime(0.18, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + duration);
	}

	playChime(noteIndex = 0, totalNotes = 8) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];
		const note = scale[noteIndex % scale.length];
		const octave = 1 + Math.floor(noteIndex / scale.length) * 0.3;
		const freq = note * octave;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'triangle';
		osc.frequency.setValueAtTime(freq, t);
		osc.frequency.exponentialRampToValueAtTime(freq * 1.03, t + 0.14);

		gain.gain.setValueAtTime(0.24, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + 0.17);
	}

	playLaser() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(900, t);
		osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

		gain.gain.setValueAtTime(0.18, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + 0.09);
	}

	playResonance(freq = 240) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const sub = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, t);
		sub.type = 'triangle';
		sub.frequency.setValueAtTime(freq * 0.5, t);

		gain.gain.setValueAtTime(0.25, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

		osc.connect(gain);
		sub.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		sub.start(t);
		osc.stop(t + 0.32);
		sub.stop(t + 0.32);
	}

	playGlitch() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(160, t);
		osc.frequency.linearRampToValueAtTime(45, t + 0.16);

		gain.gain.setValueAtTime(0.25, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + 0.17);
	}

	playMilestone() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const chord = [523.25, 659.25, 783.99, 1046.50];
		chord.forEach((freq, i) => {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			const start = t + i * 0.04;
			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, start);
			gain.gain.setValueAtTime(0.18, start);
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
			osc.connect(gain);
			gain.connect(this.masterGain);
			osc.start(start);
			osc.stop(start + 0.36);
		});
	}
}

const audio = new SoundEngine();

/* ── Visual FX: Neural Brainwave Grid ──────────────────────── */
const cv = document.getElementById('fx');
const cx = cv.getContext('2d');
let W = 0, H = 0;
let heat = 0.15;
let hue = 185;
let shakeAmt = 0;
const nodes = [];
const impulses = [];
const particles = [];
const rings = [];

function initFxNodes() {
	nodes.length = 0;
	const count = Math.min(60, Math.max(30, Math.floor((window.innerWidth * window.innerHeight) / 22000)));
	for (let i = 0; i < count; i++) {
		nodes.push({
			x: Math.random() * W,
			y: Math.random() * H,
			vx: (Math.random() - 0.5) * 0.45,
			vy: (Math.random() - 0.5) * 0.45,
			radius: 1.5 + Math.random() * 2,
			pulse: Math.random() * Math.PI * 2
		});
	}
}

function resizeFx() {
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	W = window.innerWidth;
	H = window.innerHeight;
	cv.width = W * dpr;
	cv.height = H * dpr;
	cx.setTransform(dpr, 0, 0, dpr, 0, 0);
	initFxNodes();
}

window.addEventListener('resize', resizeFx);

function burstFx(x, y, count = 16, colorHue = hue) {
	for (let i = 0; i < count && particles.length < 500; i++) {
		const angle = Math.random() * Math.PI * 2;
		const speed = 80 + Math.random() * 220;
		particles.push({
			x, y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 0.6 + Math.random() * 0.4,
			age: 0,
			h: colorHue,
			size: 1.5 + Math.random() * 2.5
		});
	}
}

function ringFx(x, y, maxR = 140, colorHue = hue) {
	rings.push({ x, y, maxR, age: 0, h: colorHue });
}

function triggerShake(amt = 8) {
	shakeAmt = Math.max(shakeAmt, amt);
}

function flashVignette(color = '#ff4d6d') {
	const vig = document.getElementById('vig');
	vig.style.setProperty('--vc', color);
	vig.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: 380 });
}

function showToast(text, duration = 750) {
	const el = document.getElementById('toast');
	el.textContent = text;
	el.animate([
		{ opacity: 0, transform: 'translate(-50%, -50%) scale(2.4)', filter: 'blur(16px)' },
		{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(0)', offset: 0.35 },
		{ opacity: 0, transform: 'translate(-50%, -65%) scale(0.85)', filter: 'blur(6px)' }
	], { duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
}

let lastFxTime = performance.now();
function renderFx(now) {
	const dt = Math.min((now - lastFxTime) / 1000, 0.1);
	lastFxTime = now;

	cx.clearRect(0, 0, W, H);

	// Screen shake transform
	if (shakeAmt > 0) {
		const sx = (Math.random() - 0.5) * shakeAmt;
		const sy = (Math.random() - 0.5) * shakeAmt;
		cx.save();
		cx.translate(sx, sy);
		shakeAmt = Math.max(0, shakeAmt - dt * 25);
	}

	const t = now / 1000;

	// Background Sinusoidal Brainwave Lines
	cx.globalCompositeOperation = 'lighter';
	for (let i = 0; i < 2; i++) {
		cx.beginPath();
		const waveY = H * (0.35 + i * 0.3);
		const freq = 0.003 + i * 0.002;
		const amp = 24 + i * 14 + heat * 20;
		for (let x = 0; x <= W; x += 15) {
			const y = waveY + Math.sin(x * freq + t * (1.2 + i * 0.5)) * amp;
			if (x === 0) cx.moveTo(x, y);
			else cx.lineTo(x, y);
		}
		cx.strokeStyle = `hsla(${hue + i * 40}, 100%, 65%, ${0.05 + heat * 0.08})`;
		cx.lineWidth = 2;
		cx.stroke();
	}

	// Update & draw neural nodes
	for (let i = 0; i < nodes.length; i++) {
		const n = nodes[i];
		n.x += n.vx;
		n.y += n.vy;
		if (n.x < 0 || n.x > W) n.vx *= -1;
		if (n.y < 0 || n.y > H) n.vy *= -1;
		n.pulse += dt * 2;

		const currentR = n.radius + Math.sin(n.pulse) * 0.8;
		cx.beginPath();
		cx.arc(n.x, n.y, currentR, 0, Math.PI * 2);
		cx.fillStyle = `hsla(${hue}, 100%, 75%, ${0.3 + heat * 0.4})`;
		cx.fill();
	}

	// Connect nearby nodes with synaptic axons
	const maxDist = 135;
	for (let i = 0; i < nodes.length; i++) {
		for (let j = i + 1; j < nodes.length; j++) {
			const dx = nodes[i].x - nodes[j].x;
			const dy = nodes[i].y - nodes[j].y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < maxDist) {
				const alpha = (1 - dist / maxDist) * (0.15 + heat * 0.25);
				cx.beginPath();
				cx.moveTo(nodes[i].x, nodes[i].y);
				cx.lineTo(nodes[j].x, nodes[j].y);
				cx.strokeStyle = `hsla(${hue}, 90%, 60%, ${alpha})`;
				cx.lineWidth = 1;
				cx.stroke();

				// Spontaneously fire action potential along axon
				if (Math.random() < 0.0015 * (1 + heat * 3) && impulses.length < 40) {
					impulses.push({
						from: nodes[i],
						to: nodes[j],
						progress: 0,
						speed: 1.2 + Math.random() * 1.5,
						h: Math.random() > 0.3 ? hue : hue + 50
					});
				}
			}
		}
	}

	// Draw synaptic impulses
	for (let i = impulses.length - 1; i >= 0; i--) {
		const p = impulses[i];
		p.progress += dt * p.speed;
		if (p.progress >= 1) {
			impulses[i] = impulses[impulses.length - 1];
			impulses.pop();
			continue;
		}
		const ix = p.from.x + (p.to.x - p.from.x) * p.progress;
		const iy = p.from.y + (p.to.y - p.from.y) * p.progress;
		cx.beginPath();
		cx.arc(ix, iy, 2.4, 0, Math.PI * 2);
		cx.fillStyle = `hsla(${p.h}, 100%, 85%, 0.8)`;
		cx.shadowColor = `hsl(${p.h}, 100%, 70%)`;
		cx.shadowBlur = 10;
		cx.fill();
		cx.shadowBlur = 0;
	}

	// Draw particles
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.age += dt;
		if (p.age >= p.life) {
			particles[i] = particles[particles.length - 1];
			particles.pop();
			continue;
		}
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		const alpha = 1 - p.age / p.life;
		cx.beginPath();
		cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		cx.fillStyle = `hsla(${p.h}, 100%, 70%, ${alpha})`;
		cx.fill();
	}

	// Draw expanding rings
	for (let i = rings.length - 1; i >= 0; i--) {
		const r = rings[i];
		r.age += dt * 2.2;
		if (r.age >= 1) {
			rings[i] = rings[rings.length - 1];
			rings.pop();
			continue;
		}
		const curR = r.maxR * r.age;
		cx.beginPath();
		cx.arc(r.x, r.y, curR, 0, Math.PI * 2);
		cx.strokeStyle = `hsla(${r.h}, 100%, 70%, ${1 - r.age})`;
		cx.lineWidth = 2 * (1 - r.age);
		cx.stroke();
	}

	if (shakeAmt > 0) cx.restore();
	requestAnimationFrame(renderFx);
}

/* ── Storage & Session Store ───────────────────────────────── */
const STORE_KEY = 'synapse:v1';
const blankStore = () => ({
	runs: [],
	best: {
		chimp: 0,
		stroop: 0,
		spatial: 0,
		blindness: 0,
		matrix: 0,
		nback: 0,
		trail: 0
	},
	diff: 'standard',
	spanDir: 'forward',
	muted: false
});

let store = (() => {
	try {
		const s = { ...blankStore(), ...JSON.parse(localStorage.getItem(STORE_KEY)) };
		return s;
	} catch {
		return blankStore();
	}
})();

function saveStore() {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(store));
	} catch {
		/* private mode fallback */
	}
}

/* ── DOM Element Selectors ─────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const elApp = document.getElementById('app');
const elAudioBtn = document.getElementById('toggleAudio');
const elDiffButtons = $$('.len [data-diff]');
const elSpanDirButtons = $$('.len [data-span-dir]');
const elModesContainer = document.getElementById('modes');

// HUD
const elHTime = document.getElementById('hTime');
const elHCps = document.getElementById('hCps');
const elHSpan = document.getElementById('hSpan');
const elHSpanLabel = document.getElementById('hSpanLabel');
const elHStreak = document.getElementById('hStreak');
const elHAcc = document.getElementById('hAcc');
const elPlayHint = document.getElementById('playHint');

// Arena views
const elArenaChimp = document.getElementById('arenaChimp');
const elChimpGrid = document.getElementById('chimpGrid');
const elChimpStatus = document.getElementById('chimpStatus');

const elArenaStroop = document.getElementById('arenaStroop');
const elStroopWord = document.getElementById('stroopWord');
const elStroopTimerBar = document.getElementById('stroopTimerBar');
const elStroopOptions = document.getElementById('stroopOptions');

const elArenaSpatial = document.getElementById('arenaSpatial');
const elSpatialGrid = document.getElementById('spatialGrid');
const elSpatialStatus = document.getElementById('spatialStatus');

const elArenaBlindness = document.getElementById('arenaBlindness');
const elBlindnessGrid = document.getElementById('blindnessGrid');
const elBlindnessStatus = document.getElementById('blindnessStatus');

const elArenaVisualMatrix = document.getElementById('arenaVisualMatrix');
const elMatrixGrid = document.getElementById('matrixGrid');
const elMatrixStatus = document.getElementById('matrixStatus');

const elArenaNBack = document.getElementById('arenaNBack');
const elNBackBadge = document.getElementById('nbackBadge');
const elNBackStatus = document.getElementById('nbackStatus');
const elNBackGrid = document.getElementById('nbackGrid');
const elNBackSymbol = document.getElementById('nbackSymbol');
const elBtnNBackMatch = document.getElementById('btnNBackMatch');
const elBtnNBackNoMatch = document.getElementById('btnNBackNoMatch');

const elArenaNeuralLink = document.getElementById('arenaNeuralLink');
const elTrailStatus = document.getElementById('trailStatus');
const elTrailStage = document.getElementById('trailStage');
const elTrailSvg = document.getElementById('trailSvg');
const elTrailNodes = document.getElementById('trailNodes');

// Results
const elRMode = document.getElementById('rMode');
const elRScore = document.getElementById('rScore');
const elRUnit = document.getElementById('rUnit');
const elRPb = document.getElementById('rPb');
const elRKpiSpan = document.getElementById('rKpiSpan');
const elRKpiLatency = document.getElementById('rKpiLatency');
const elRKpiStreak = document.getElementById('rKpiStreak');
const elRKpiAcc = document.getElementById('rKpiAcc');
const elRChart = document.getElementById('rChart');
const elBtnAgain = document.getElementById('btnAgain');
const elBtnMenu = document.getElementById('btnMenu');

// Stats
const elSHighCps = document.getElementById('sHighCps');
const elSMaxSpan = document.getElementById('sMaxSpan');
const elSAvgLatency = document.getElementById('sAvgLatency');
const elSTotalRuns = document.getElementById('sTotalRuns');
const elSSpanChart = document.getElementById('sSpanChart');
const elSBestList = document.getElementById('sBestList');
const elSLatencyChart = document.getElementById('sLatencyChart');
const elSRunsBody = document.getElementById('sRunsBody');
const elBtnResetStats = document.getElementById('btnResetStats');

/* ── Game State ────────────────────────────────────────────── */
let activeScreen = 'menu';
let activeMode = 'chimp';
let gameState = 'idle'; // 'idle' | 'memorize' | 'input' | 'ended'
let roundStartTime = 0;
let runStartTime = 0;
let runTimerInterval = null;
let currentRun = null;

const MODE_CONFIGS = {
	chimp: { name: 'Chimp Matrix', unit: 'items', kpiName: 'max span' },
	stroop: { name: 'Stroop Duel', unit: 'CPS', kpiName: 'peak CPS' },
	spatial: { name: 'Spatial Span', unit: 'nodes', kpiName: 'max span' },
	blindness: { name: 'Change Blindness', unit: 'CPS', kpiName: 'peak CPS' },
	matrix: { name: 'Visual Matrix', unit: 'tiles', kpiName: 'max tiles' },
	nback: { name: 'N-Back Flux', unit: 'CPS', kpiName: 'peak CPS' },
	trail: { name: 'Neural Link', unit: 'CPS', kpiName: 'peak CPS' }
};

function setScreen(screen) {
	activeScreen = screen;
	document.body.setAttribute('data-screen', screen);
	if (screen === 'menu') {
		updateMenuBests();
	} else if (screen === 'stats') {
		renderStatsScreen();
	}
}

function updateMenuBests() {
	$('#best-chimp').textContent = store.best.chimp || 0;
	$('#best-stroop').textContent = store.best.stroop || 0;
	$('#best-spatial').textContent = store.best.spatial || 0;
	$('#best-blindness').textContent = store.best.blindness || 0;
	$('#best-matrix').textContent = store.best.matrix || 0;
	$('#best-nback').textContent = store.best.nback || 0;
	$('#best-trail').textContent = store.best.trail || 0;
}

/* ── Mode Switching & Configuration ────────────────────────── */
function applySettingsUI() {
	elDiffButtons.forEach(btn => {
		btn.setAttribute('aria-pressed', btn.getAttribute('data-diff') === store.diff);
	});
	elSpanDirButtons.forEach(btn => {
		btn.setAttribute('aria-pressed', btn.getAttribute('data-span-dir') === store.spanDir);
	});
	if (store.muted) {
		audio.enabled = false;
		elAudioBtn.classList.add('muted');
	}
}

elDiffButtons.forEach(btn => {
	btn.addEventListener('click', () => {
		store.diff = btn.getAttribute('data-diff');
		applySettingsUI();
		saveStore();
		audio.playBlip(500);
	});
});

elSpanDirButtons.forEach(btn => {
	btn.addEventListener('click', () => {
		store.spanDir = btn.getAttribute('data-span-dir');
		applySettingsUI();
		saveStore();
		audio.playBlip(540);
	});
});

elAudioBtn.addEventListener('click', () => {
	const enabled = audio.toggle();
	store.muted = !enabled;
	elAudioBtn.classList.toggle('muted', !enabled);
	saveStore();
	if (enabled) audio.playBlip(600);
});

// Card 3D tilt effects
$$('.card').forEach(card => {
	card.addEventListener('mousemove', (e) => {
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const rx = ((y / rect.height) - 0.5) * -14;
		const ry = ((x / rect.width) - 0.5) * 14;
		card.style.setProperty('--rx', `${rx}deg`);
		card.style.setProperty('--ry', `${ry}deg`);
		card.style.setProperty('--mx', `${x}px`);
		card.style.setProperty('--my', `${y}px`);
	});
	card.addEventListener('mouseleave', () => {
		card.style.setProperty('--rx', '0deg');
		card.style.setProperty('--ry', '0deg');
	});
	card.addEventListener('click', () => {
		const mode = card.getAttribute('data-mode');
		launchRun(mode);
	});
});

$$('[data-go]').forEach(btn => {
	btn.addEventListener('click', () => {
		const target = btn.getAttribute('data-go');
		if (gameState !== 'idle' && activeScreen === 'play') {
			const hasProgress = currentRun && (currentRun.hits + currentRun.misses > 0 || currentRun.span > 0 || currentRun.latencies.length > 0);
			endCurrentRun(!!hasProgress);
		}
		setScreen(target);
		audio.playBlip(480);
	});
});

/* ── HUD Updates ───────────────────────────────────────────── */
function updateHUD() {
	if (!currentRun) return;
	const elapsedSec = ((performance.now() - runStartTime) / 1000).toFixed(1);
	elHTime.textContent = `${elapsedSec}s`;
	elHCps.textContent = calculateCPS();
	elHSpan.textContent = currentRun.span;
	elHStreak.textContent = currentRun.streak;

	const totalAtt = currentRun.hits + currentRun.misses;
	const acc = totalAtt > 0 ? Math.round((currentRun.hits / totalAtt) * 100) : 100;
	elHAcc.textContent = `${acc}%`;
}

function calculateCPS() {
	if (!currentRun) return 0;
	const totalAtt = currentRun.hits + currentRun.misses;
	if (totalAtt === 0) return 0;

	const acc = currentRun.hits / totalAtt;
	const latencies = currentRun.latencies;
	const meanLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 600;
	const clampedLatency = Math.max(120, meanLatency);

	let diffMult = 1.0;
	if (store.diff === 'overclocked') diffMult = 1.25;
	if (store.diff === 'extreme') diffMult = 1.5;

	const score = Math.round((1000 / clampedLatency) * Math.pow(acc, 2) * (1 + currentRun.span / 8) * 220 * diffMult);
	return Math.max(0, score);
}

/* ── Session Launcher ──────────────────────────────────────── */
function launchRun(mode) {
	activeMode = mode;
	currentRun = {
		mode,
		diff: store.diff,
		spanDir: store.spanDir,
		span: mode === 'chimp' ? (store.diff === 'extreme' ? 7 : (store.diff === 'overclocked' ? 6 : 5)) :
			(mode === 'spatial' ? 3 :
			(mode === 'matrix' ? 3 :
			(mode === 'nback' ? (store.diff === 'extreme' ? 3 : (store.diff === 'overclocked' ? 2 : 1)) :
			(mode === 'trail' ? 8 :
			(mode === 'stroop' ? 1 : 1))))),
		score: 0,
		streak: 0,
		maxStreak: 0,
		hits: 0,
		misses: 0,
		latencies: [],
		roundsCompleted: 0,
		date: new Date().toISOString()
	};

	setScreen('play');
	elArenaChimp.hidden = true;
	elArenaChimp.classList.remove('active');
	elArenaStroop.hidden = true;
	elArenaStroop.classList.remove('active');
	elArenaSpatial.hidden = true;
	elArenaSpatial.classList.remove('active');
	elArenaBlindness.hidden = true;
	elArenaBlindness.classList.remove('active');
	elArenaVisualMatrix.hidden = true;
	elArenaVisualMatrix.classList.remove('active');
	elArenaNBack.hidden = true;
	elArenaNBack.classList.remove('active');
	elArenaNeuralLink.hidden = true;
	elArenaNeuralLink.classList.remove('active');

	runStartTime = performance.now();
	if (runTimerInterval) clearInterval(runTimerInterval);
	runTimerInterval = setInterval(updateHUD, 100);

	audio.playBlip(700);
	heat = 0.4;

	if (mode === 'chimp') {
		elArenaChimp.hidden = false;
		elArenaChimp.classList.add('active');
		elHSpanLabel.textContent = 'span';
		startChimpRound();
	} else if (mode === 'stroop') {
		elArenaStroop.hidden = false;
		elArenaStroop.classList.add('active');
		elHSpanLabel.textContent = 'level';
		startStroopRound();
	} else if (mode === 'spatial') {
		elArenaSpatial.hidden = false;
		elArenaSpatial.classList.add('active');
		elHSpanLabel.textContent = 'nodes';
		startSpatialRound();
	} else if (mode === 'blindness') {
		elArenaBlindness.hidden = false;
		elArenaBlindness.classList.add('active');
		elHSpanLabel.textContent = 'round';
		startBlindnessRound();
	} else if (mode === 'matrix') {
		elArenaVisualMatrix.hidden = false;
		elArenaVisualMatrix.classList.add('active');
		elHSpanLabel.textContent = 'tiles';
		startVisualMatrixRound();
	} else if (mode === 'nback') {
		elArenaNBack.hidden = false;
		elArenaNBack.classList.add('active');
		elHSpanLabel.textContent = 'n-back';
		startNBackRound();
	} else if (mode === 'trail') {
		elArenaNeuralLink.hidden = false;
		elArenaNeuralLink.classList.add('active');
		elHSpanLabel.textContent = 'nodes';
		startNeuralLinkRound();
	}
}

/* ── 1. Chimp Matrix Mode ──────────────────────────────────── */
let chimpNumbers = [];
let chimpExpected = 1;
let chimpMaskTimeout = null;

function startChimpRound() {
	gameState = 'memorize';
	elChimpStatus.textContent = 'READY...';
	elPlayHint.textContent = 'Focus your eyes on the grid';
	elChimpGrid.innerHTML = '';
	chimpExpected = 1;

	const totalCells = 25;
	const count = currentRun.span;
	const indices = [];
	while (indices.length < totalCells) indices.push(indices.length);
	// Shuffle indices
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}

	const selectedPositions = indices.slice(0, count);
	chimpNumbers = selectedPositions.map((pos, idx) => ({ pos, value: idx + 1 }));

	// Build blank grid first during ready
	for (let i = 0; i < totalCells; i++) {
		const tile = document.createElement('button');
		tile.type = 'button';
		tile.className = 'chimp-tile blank-idle';
		tile.dataset.pos = i;
		elChimpGrid.appendChild(tile);
	}

	// 600ms ready delay, then reveal numbers
	setTimeout(() => {
		if (gameState !== 'memorize') return;
		elChimpStatus.textContent = 'MEMORIZE THE NUMBERS';
		elPlayHint.textContent = 'Observe locations before mask engages';

		chimpNumbers.forEach(numObj => {
			const tile = elChimpGrid.children[numObj.pos];
			if (tile) {
				tile.textContent = numObj.value;
				tile.dataset.val = numObj.value;
				tile.classList.add('active-number');
				tile.classList.remove('blank-idle');
			}
		});

		// Dynamic human-friendly flash duration scaling with count
		let flashDuration = Math.max(1200, count * 220); // ~1.2s - 2.5s for standard
		if (store.diff === 'overclocked') flashDuration = Math.max(800, count * 150);
		if (store.diff === 'extreme') flashDuration = Math.max(450, count * 90);

		if (chimpMaskTimeout) clearTimeout(chimpMaskTimeout);
		chimpMaskTimeout = setTimeout(() => {
			if (gameState !== 'memorize') return;
			gameState = 'input';
			roundStartTime = performance.now();
			elChimpStatus.textContent = 'CLICK SQUARES IN ASCENDING ORDER';
			elPlayHint.textContent = 'Recall from visual working memory: 1 → 2 → 3...';

			$$('.chimp-tile.active-number').forEach(tile => {
				tile.classList.add('masked');
				tile.textContent = '';
			});
		}, flashDuration);
	}, 600);
}

elChimpGrid.addEventListener('click', (e) => {
	const tile = e.target.closest('.chimp-tile');
	if (!tile || gameState !== 'input') return;
	if (tile.classList.contains('blank-idle') || tile.classList.contains('cleared')) return;

	const val = parseInt(tile.dataset.val, 10);
	const rt = performance.now() - roundStartTime;
	roundStartTime = performance.now();
	currentRun.latencies.push(rt);

	if (val === chimpExpected) {
		// Correct
		tile.classList.remove('masked');
		tile.classList.add('correct');
		tile.textContent = val;
		audio.playChime(chimpExpected - 1, currentRun.span);
		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;

		burstFx(tile.getBoundingClientRect().left + 24, tile.getBoundingClientRect().top + 24, 8);

		setTimeout(() => {
			tile.classList.add('cleared');
		}, 150);

		chimpExpected++;
		if (chimpExpected > currentRun.span) {
			// Round Complete!
			currentRun.roundsCompleted++;
			currentRun.span = Math.min(15, currentRun.span + 1);
			showToast(`SPAN EXPANDED: ${currentRun.span}!`, 800);
			audio.playMilestone();
			gameState = 'idle';
			setTimeout(startChimpRound, 700);
		}
	} else {
		// Mistake
		tile.classList.remove('masked');
		tile.classList.add('wrong');
		tile.textContent = val;
		audio.playGlitch();
		triggerShake(12);
		flashVignette('#ff4d6d');
		currentRun.misses++;
		currentRun.streak = 0;

		// Reveal all
		$$('.chimp-tile.active-number').forEach(t => {
			t.classList.remove('masked');
			t.textContent = t.dataset.val;
		});

		gameState = 'idle';
		if (currentRun.misses >= 3) {
			setTimeout(() => endCurrentRun(true), 1000);
		} else {
			setTimeout(startChimpRound, 1200);
		}
	}
	updateHUD();
});

/* ── 2. Stroop Duel Mode ───────────────────────────────────── */
const STROOP_COLORS = [
	{ name: 'RED', hex: '#ff4d6d', key: 'a' },
	{ name: 'CYAN', hex: '#00f0ff', key: 's' },
	{ name: 'YELLOW', hex: '#ffe600', key: 'd' },
	{ name: 'PURPLE', hex: '#c060ff', key: 'f' }
];

let stroopCurrentInk = null;
let stroopTimerRaf = null;
let stroopTimeLimit = 500;
let stroopRoundStart = 0;

function startStroopRound() {
	if (currentRun.roundsCompleted >= 30 || currentRun.misses >= 3) {
		endCurrentRun(true);
		return;
	}

	gameState = 'input';
	elPlayHint.textContent = 'Select INK COLOR (Keys: A, S, D, F or Click)';

	// Pick random word and ink (75% conflict)
	const wordItem = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
	let inkItem = wordItem;
	if (Math.random() < 0.75) {
		const others = STROOP_COLORS.filter(c => c.name !== wordItem.name);
		inkItem = others[Math.floor(Math.random() * others.length)];
	}

	stroopCurrentInk = inkItem;
	elStroopWord.textContent = wordItem.name;
	elStroopWord.style.color = inkItem.hex;
	elStroopWord.style.textShadow = `0 0 35px ${inkItem.hex}`;

	// Scale time limit by difficulty and streak
	let baseLimit = 1400;
	if (store.diff === 'overclocked') baseLimit = 1000;
	if (store.diff === 'extreme') baseLimit = 700;
	const minLimit = store.diff === 'extreme' ? 420 : (store.diff === 'overclocked' ? 600 : 850);
	stroopTimeLimit = Math.max(minLimit, baseLimit - Math.min(currentRun.streak * 20, 500));

	stroopRoundStart = performance.now();
	roundStartTime = stroopRoundStart;

	if (stroopTimerRaf) cancelAnimationFrame(stroopTimerRaf);
	function updateStroopBar() {
		if (gameState !== 'input') return;
		const elapsed = performance.now() - stroopRoundStart;
		const progress = Math.max(0, 1 - (elapsed / stroopTimeLimit));
		elStroopTimerBar.style.transform = `scaleX(${progress})`;
		if (progress <= 0) {
			handleStroopChoice(null, true);
		} else {
			stroopTimerRaf = requestAnimationFrame(updateStroopBar);
		}
	}
	stroopTimerRaf = requestAnimationFrame(updateStroopBar);
}

function handleStroopChoice(selectedColorName, isTimeout = false) {
	if (gameState !== 'input') return;
	if (stroopTimerRaf) cancelAnimationFrame(stroopTimerRaf);

	const rt = performance.now() - stroopRoundStart;
	currentRun.latencies.push(rt);

	if (!isTimeout && selectedColorName === stroopCurrentInk.name) {
		// Correct
		audio.playLaser();
		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;
		currentRun.roundsCompleted++;
		currentRun.span = Math.floor(currentRun.streak / 5) + 1;

		if (currentRun.streak % 10 === 0) {
			showToast(`STREAK: ${currentRun.streak}!`, 700);
			audio.playMilestone();
		}

		burstFx(window.innerWidth / 2, window.innerHeight / 2, 12, 185);
		startStroopRound();
	} else {
		// Wrong or timeout
		audio.playGlitch();
		triggerShake(10);
		flashVignette('#ff4d6d');
		currentRun.misses++;
		currentRun.streak = 0;
		currentRun.roundsCompleted++;

		gameState = 'idle';
		setTimeout(() => {
			if (currentRun.misses >= 3) {
				endCurrentRun(true);
			} else {
				startStroopRound();
			}
		}, 350);
	}
	updateHUD();
}

elStroopOptions.addEventListener('click', (e) => {
	const btn = e.target.closest('.stroop-btn');
	if (!btn) return;
	const color = btn.getAttribute('data-color').toUpperCase();
	handleStroopChoice(color);
});

/* ── 3. Spatial Span Mode ──────────────────────────────────── */
let spatialSequence = [];
let spatialPlayerStep = 0;
let spatialIsPlayingSeq = false;

function startSpatialRound() {
	gameState = 'memorize';
	spatialPlayerStep = 0;
	spatialIsPlayingSeq = true;
	elSpatialStatus.textContent = store.spanDir === 'reversed' ? 'MEMORIZE SEQUENCE (REVERSE ORDER)' : 'MEMORIZE NEURAL SEQUENCE';
	elPlayHint.textContent = 'Watch each illuminated node and tone';

	// Build 3x3 grid
	elSpatialGrid.innerHTML = '';
	for (let i = 0; i < 9; i++) {
		const node = document.createElement('div');
		node.className = 'spatial-node';
		node.dataset.idx = i;
		elSpatialGrid.appendChild(node);
	}

	// Generate sequence of current span length
	spatialSequence = [];
	const nodeIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	let last = -1;
	for (let i = 0; i < currentRun.span; i++) {
		const candidates = nodeIndices.filter(n => n !== last);
		const picked = candidates[Math.floor(Math.random() * candidates.length)];
		spatialSequence.push(picked);
		last = picked;
	}

	playSpatialSequence();
}

function playSpatialSequence() {
	let idx = 0;
	const interval = store.diff === 'extreme' ? 520 : (store.diff === 'overclocked' ? 720 : 960);
	const litDuration = interval * 0.68;

	function step() {
		if (idx >= spatialSequence.length) {
			spatialIsPlayingSeq = false;
			gameState = 'input';
			roundStartTime = performance.now();
			elSpatialStatus.textContent = store.spanDir === 'reversed' ?
				'REPRODUCE SEQUENCE IN REVERSED ORDER' :
				'REPRODUCE SEQUENCE IN FORWARD ORDER';
			elPlayHint.textContent = 'Click nodes in order';
			return;
		}

		const nodeIndex = spatialSequence[idx];
		const nodeEl = elSpatialGrid.children[nodeIndex];
		if (nodeEl) {
			nodeEl.classList.add('lit');
			audio.playResonance(200 + nodeIndex * 45);
			setTimeout(() => {
				nodeEl.classList.remove('lit');
			}, litDuration);
		}

		idx++;
		setTimeout(step, interval);
	}

	setTimeout(step, 800);
}

elSpatialGrid.addEventListener('click', (e) => {
	const node = e.target.closest('.spatial-node');
	if (!node || gameState !== 'input' || spatialIsPlayingSeq) return;

	const clickedIdx = parseInt(node.dataset.idx, 10);
	const targetIdx = store.spanDir === 'reversed' ?
		spatialSequence[spatialSequence.length - 1 - spatialPlayerStep] :
		spatialSequence[spatialPlayerStep];

	const rt = performance.now() - roundStartTime;
	roundStartTime = performance.now();
	currentRun.latencies.push(rt);

	if (clickedIdx === targetIdx) {
		// Correct
		node.classList.add('user-active');
		audio.playChime(spatialPlayerStep, currentRun.span);
		setTimeout(() => node.classList.remove('user-active'), 180);

		spatialPlayerStep++;
		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;

		if (spatialPlayerStep >= spatialSequence.length) {
			// Completed span!
			currentRun.roundsCompleted++;
			currentRun.span++;
			showToast(`SPAN: ${currentRun.span} NODES!`, 800);
			audio.playMilestone();
			gameState = 'idle';
			setTimeout(startSpatialRound, 800);
		}
	} else {
		// Mistake
		node.classList.add('node-error');
		audio.playGlitch();
		triggerShake(12);
		flashVignette('#ff4d6d');
		currentRun.misses++;
		currentRun.streak = 0;

		gameState = 'idle';
		setTimeout(() => {
			node.classList.remove('node-error');
			if (currentRun.misses >= 3) {
				endCurrentRun(true);
			} else {
				startSpatialRound();
			}
		}, 600);
	}
	updateHUD();
});

/* ── 4. Change Blindness Mode ──────────────────────────────── */
const GLYPH_PATHS = [
	'M12 2v20M2 12h20',
	'M4 4l16 16M20 4L4 20',
	'M12 3a9 9 0 1 0 9 9',
	'M5 19L19 5M5 5h14v14',
	'M12 2L2 22h20Z',
	'M12 2l8 8-8 8-8-8Z',
	'M6 6h12v12H6Z',
	'M4 12a8 8 0 0 1 16 0'
];

let blindnessInterval = null;
let blindnessTargetIndex = -1;
let blindnessFlickerFrame = 0; // 0: Frame A, 1: Mask, 2: Frame B, 3: Mask
let blindnessStartTime = 0;

function startBlindnessRound() {
	if (currentRun.roundsCompleted >= 6 || currentRun.misses >= 3) {
		endCurrentRun(true);
		return;
	}

	gameState = 'input';
	elBlindnessStatus.textContent = 'SPOT THE ALTERED NODE';
	elPlayHint.textContent = 'Find and click the subtle difference across flickers';
	elBlindnessGrid.innerHTML = '';

	const size = 16;
	blindnessTargetIndex = Math.floor(Math.random() * size);
	const tilesData = [];

	for (let i = 0; i < size; i++) {
		const glyph = GLYPH_PATHS[i % GLYPH_PATHS.length];
		const rotA = Math.floor(Math.random() * 4) * 90;
		const colorA = i % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)';

		// If target, alter rotation or symbol in Frame B
		let rotB = rotA;
		let colorB = colorA;
		let glyphB = glyph;

		if (i === blindnessTargetIndex) {
			rotB = (rotA + 90) % 360;
			if (Math.random() > 0.5) {
				colorB = colorA === 'var(--accent)' ? 'var(--warn)' : 'var(--accent)';
			}
		}

		tilesData.push({ glyph, glyphB, rotA, rotB, colorA, colorB });
	}

	for (let i = 0; i < size; i++) {
		const tile = document.createElement('div');
		tile.className = 'blindness-tile';
		tile.dataset.idx = i;
		tile.innerHTML = `<svg viewBox="0 0 24 24"><path d="${tilesData[i].glyph}"/></svg>`;
		elBlindnessGrid.appendChild(tile);
	}

	blindnessStartTime = performance.now();
	roundStartTime = blindnessStartTime;
	blindnessFlickerFrame = 0;

	if (blindnessInterval) clearInterval(blindnessInterval);

	const frameDuration = store.diff === 'extreme' ? 180 : (store.diff === 'overclocked' ? 210 : 250);
	const maskDuration = 80;

	function runFlicker() {
		if (gameState !== 'input') return;

		if (blindnessFlickerFrame === 0) {
			// Frame A
			elBlindnessGrid.classList.remove('mask-active');
			$$('.blindness-tile').forEach((tile, idx) => {
				const data = tilesData[idx];
				tile.style.transform = `rotate(${data.rotA}deg)`;
				tile.style.color = data.colorA;
				tile.querySelector('path').setAttribute('d', data.glyph);
			});
			blindnessInterval = setTimeout(() => {
				blindnessFlickerFrame = 1;
				runFlicker();
			}, frameDuration);
		} else if (blindnessFlickerFrame === 1) {
			// Mask 1
			elBlindnessGrid.classList.add('mask-active');
			blindnessInterval = setTimeout(() => {
				blindnessFlickerFrame = 2;
				runFlicker();
			}, maskDuration);
		} else if (blindnessFlickerFrame === 2) {
			// Frame B
			elBlindnessGrid.classList.remove('mask-active');
			$$('.blindness-tile').forEach((tile, idx) => {
				const data = tilesData[idx];
				tile.style.transform = `rotate(${data.rotB}deg)`;
				tile.style.color = data.colorB;
				tile.querySelector('path').setAttribute('d', data.glyphB);
			});
			blindnessInterval = setTimeout(() => {
				blindnessFlickerFrame = 3;
				runFlicker();
			}, frameDuration);
		} else if (blindnessFlickerFrame === 3) {
			// Mask 2
			elBlindnessGrid.classList.add('mask-active');
			blindnessInterval = setTimeout(() => {
				blindnessFlickerFrame = 0;
				runFlicker();
			}, maskDuration);
		}
	}

	runFlicker();
}

elBlindnessGrid.addEventListener('click', (e) => {
	const tile = e.target.closest('.blindness-tile');
	if (!tile || gameState !== 'input') return;

	const clickedIdx = parseInt(tile.dataset.idx, 10);
	const rt = performance.now() - blindnessStartTime;
	currentRun.latencies.push(rt);

	if (clickedIdx === blindnessTargetIndex) {
		// Found!
		if (blindnessInterval) clearTimeout(blindnessInterval);
		tile.classList.add('found');
		audio.playMilestone();
		burstFx(tile.getBoundingClientRect().left + 25, tile.getBoundingClientRect().top + 25, 14, 185);

		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;
		currentRun.roundsCompleted++;
		currentRun.span = currentRun.roundsCompleted;

		showToast('TARGET DETECTED!', 600);
		gameState = 'idle';
		setTimeout(startBlindnessRound, 700);
	} else {
		// False positive
		tile.classList.add('miss');
		audio.playGlitch();
		triggerShake(8);
		flashVignette('#ff4d6d');
		setTimeout(() => tile.classList.remove('miss'), 350);

		currentRun.misses++;
		currentRun.streak = 0;
		if (currentRun.misses >= 3) {
			if (blindnessInterval) clearTimeout(blindnessInterval);
			gameState = 'idle';
			setTimeout(() => endCurrentRun(true), 600);
		}
	}
	updateHUD();
});

/* ── 5. Visual Matrix Mode ─────────────────────────────────── */
let matrixActiveIndices = new Set();
let matrixFoundIndices = new Set();
let matrixFlashTimeout = null;

function startVisualMatrixRound() {
	gameState = 'memorize';
	matrixActiveIndices.clear();
	matrixFoundIndices.clear();
	elMatrixStatus.textContent = 'MEMORIZE THE PATTERN';
	elPlayHint.textContent = 'Watch for the flashing neon tiles';
	elMatrixGrid.innerHTML = '';

	const count = currentRun.span;
	let dim = 3;
	if (count >= 12) dim = 6;
	else if (count >= 8) dim = 5;
	else if (count >= 5) dim = 4;
	else dim = 3;

	const totalCells = dim * dim;
	elMatrixGrid.style.setProperty('--cols', dim);

	const indices = [];
	for (let i = 0; i < totalCells; i++) indices.push(i);
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}

	const picked = indices.slice(0, count);
	picked.forEach(idx => matrixActiveIndices.add(idx));

	for (let i = 0; i < totalCells; i++) {
		const tile = document.createElement('div');
		tile.className = 'matrix-tile';
		tile.dataset.idx = i;
		if (matrixActiveIndices.has(i)) {
			tile.classList.add('tile-flash');
		}
		elMatrixGrid.appendChild(tile);
	}

	const flashDuration = store.diff === 'extreme' ? 600 : (store.diff === 'overclocked' ? 800 : 1100);

	if (matrixFlashTimeout) clearTimeout(matrixFlashTimeout);
	matrixFlashTimeout = setTimeout(() => {
		if (gameState !== 'memorize') return;
		gameState = 'input';
		roundStartTime = performance.now();
		elMatrixStatus.textContent = `RECALL ${count} ACTIVE TILES`;
		elPlayHint.textContent = 'Click all tiles from visual memory';

		$$('.matrix-tile').forEach(t => t.classList.remove('tile-flash'));
	}, flashDuration);
}

elMatrixGrid.addEventListener('click', (e) => {
	const tile = e.target.closest('.matrix-tile');
	if (!tile || gameState !== 'input') return;

	const idx = parseInt(tile.dataset.idx, 10);
	if (matrixFoundIndices.has(idx)) return;

	const rt = performance.now() - roundStartTime;
	roundStartTime = performance.now();
	currentRun.latencies.push(rt);

	if (matrixActiveIndices.has(idx)) {
		// Correct
		matrixFoundIndices.add(idx);
		tile.classList.add('tile-correct');
		audio.playChime(matrixFoundIndices.size, currentRun.span);
		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;

		burstFx(tile.getBoundingClientRect().left + 20, tile.getBoundingClientRect().top + 20, 8);

		if (matrixFoundIndices.size === matrixActiveIndices.size) {
			// All found!
			currentRun.roundsCompleted++;
			currentRun.span++;
			showToast(`SPAN: ${currentRun.span} TILES!`, 750);
			audio.playMilestone();
			gameState = 'idle';
			setTimeout(startVisualMatrixRound, 800);
		}
	} else {
		// Wrong tile
		tile.classList.add('tile-wrong');
		audio.playGlitch();
		triggerShake(10);
		flashVignette('#ff4d6d');
		currentRun.misses++;
		currentRun.streak = 0;

		// Reveal remaining active tiles
		matrixActiveIndices.forEach(actIdx => {
			const t = elMatrixGrid.children[actIdx];
			if (t) t.classList.add('tile-correct');
		});

		gameState = 'idle';
		setTimeout(() => {
			if (currentRun.misses >= 3) {
				endCurrentRun(true);
			} else {
				startVisualMatrixRound();
			}
		}, 1000);
	}
	updateHUD();
});

/* ── 6. N-Back Flux Mode ───────────────────────────────────── */
const NBACK_SYMBOLS = ['▲', '■', '●', '◆', '✦', '⬟'];
let nbackHistory = [];
let nbackTimerTimeout = null;
let nbackCurrentTrial = 0;
const NBACK_MAX_TRIALS = 25;
let nbackHasAnswered = false;

function startNBackRound() {
	nbackHistory = [];
	nbackCurrentTrial = 0;
	runNextNBackTrial();
}

function runNextNBackTrial() {
	if (nbackCurrentTrial >= NBACK_MAX_TRIALS || currentRun.misses >= 3) {
		endCurrentRun(true);
		return;
	}

	gameState = 'input';
	nbackHasAnswered = false;
	nbackCurrentTrial++;
	const N = currentRun.span;
	elNBackBadge.textContent = `${N}-BACK`;
	elNBackStatus.textContent = nbackHistory.length >= N ? `MATCH ITEM ${N} STEPS AGO?` : 'MEMORIZE SEQUENCE...';
	elPlayHint.textContent = 'Space: MATCH · Enter / Click: PASS';

	let isMatch = false;
	let pos = Math.floor(Math.random() * 9);
	let symbol = NBACK_SYMBOLS[Math.floor(Math.random() * NBACK_SYMBOLS.length)];

	if (nbackHistory.length >= N) {
		const targetItem = nbackHistory[nbackHistory.length - N];
		if (Math.random() < 0.38) {
			pos = targetItem.pos;
			symbol = targetItem.symbol;
			isMatch = true;
		} else {
			if (pos === targetItem.pos && symbol === targetItem.symbol) {
				pos = (pos + 1) % 9;
			}
			isMatch = false;
		}
	}

	const currentItem = { pos, symbol, isMatch };
	nbackHistory.push(currentItem);

	elNBackGrid.innerHTML = '';
	for (let i = 0; i < 9; i++) {
		const cell = document.createElement('div');
		cell.className = 'nback-grid-cell';
		if (i === pos) cell.classList.add('active-pos');
		elNBackGrid.appendChild(cell);
	}
	elNBackSymbol.textContent = symbol;
	audio.playBlip(400 + pos * 50);

	roundStartTime = performance.now();
	const trialDuration = store.diff === 'extreme' ? 1200 : (store.diff === 'overclocked' ? 1500 : 1800);

	if (nbackTimerTimeout) clearTimeout(nbackTimerTimeout);
	nbackTimerTimeout = setTimeout(() => {
		if (gameState !== 'input') return;
		if (!nbackHasAnswered && currentItem.isMatch) {
			handleNBackResponse(false, true);
		} else if (!nbackHasAnswered) {
			currentRun.hits++;
			currentRun.roundsCompleted++;
			runNextNBackTrial();
		}
	}, trialDuration);
}

function handleNBackResponse(userSaidMatch, isAutoTimeout = false) {
	if (gameState !== 'input' || nbackHasAnswered) return;
	nbackHasAnswered = true;
	if (nbackTimerTimeout) clearTimeout(nbackTimerTimeout);

	const rt = performance.now() - roundStartTime;
	currentRun.latencies.push(rt);

	const currentItem = nbackHistory[nbackHistory.length - 1];
	const actualMatch = currentItem ? currentItem.isMatch : false;

	if (userSaidMatch === actualMatch && !isAutoTimeout) {
		audio.playLaser();
		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;
		currentRun.roundsCompleted++;

		if (currentRun.streak > 0 && currentRun.streak % 8 === 0 && currentRun.span < 3) {
			currentRun.span++;
			showToast(`${currentRun.span}-BACK UNLOCKED!`, 750);
			audio.playMilestone();
		}

		burstFx(window.innerWidth / 2, window.innerHeight / 2, 8);
		setTimeout(runNextNBackTrial, 350);
	} else {
		audio.playGlitch();
		triggerShake(10);
		flashVignette('#ff4d6d');
		currentRun.misses++;
		currentRun.streak = 0;
		currentRun.roundsCompleted++;

		setTimeout(() => {
			if (currentRun.misses >= 3) {
				endCurrentRun(true);
			} else {
				runNextNBackTrial();
			}
		}, 500);
	}
	updateHUD();
}

elBtnNBackMatch.addEventListener('click', () => handleNBackResponse(true));
elBtnNBackNoMatch.addEventListener('click', () => handleNBackResponse(false));

/* ── 7. Neural Link Mode (Trail Making) ─────────────────────── */
let trailSequence = [];
let trailStep = 0;
let trailPrevNode = null;

function startNeuralLinkRound() {
	gameState = 'input';
	trailStep = 0;
	trailPrevNode = null;
	elTrailStatus.textContent = 'LINK: 1 → A → 2 → B...';
	elPlayHint.textContent = 'Click alternating numbers and letters';
	elTrailSvg.innerHTML = '';
	elTrailNodes.innerHTML = '';

	const totalItems = Math.min(16, currentRun.span);
	trailSequence = [];
	const letters = 'ABCDEFGH';
	for (let i = 0; i < totalItems / 2; i++) {
		trailSequence.push({ label: `${i + 1}`, val: i + 1, type: 'num' });
		trailSequence.push({ label: letters[i], val: letters[i], type: 'let' });
	}

	const positions = [];
	const minDistance = 55;
	const padX = 25;
	const padY = 25;

	trailSequence.forEach((item, idx) => {
		let attempts = 0;
		let x = 50, y = 50;
		while (attempts < 150) {
			x = padX + Math.random() * (100 - padX * 2);
			y = padY + Math.random() * (100 - padY * 2);
			let tooClose = false;
			for (const p of positions) {
				const dx = ((x - p.x) / 100) * 580;
				const dy = ((y - p.y) / 100) * 380;
				if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
					tooClose = true;
					break;
				}
			}
			if (!tooClose) break;
			attempts++;
		}
		positions.push({ x, y });

		const nodeEl = document.createElement('div');
		nodeEl.className = 'trail-node';
		nodeEl.dataset.idx = idx;
		nodeEl.style.left = `${x}%`;
		nodeEl.style.top = `${y}%`;
		nodeEl.textContent = item.label;
		if (idx === 0) nodeEl.classList.add('active-target');
		elTrailNodes.appendChild(nodeEl);
	});

	roundStartTime = performance.now();
}

elTrailNodes.addEventListener('click', (e) => {
	const nodeEl = e.target.closest('.trail-node');
	if (!nodeEl || gameState !== 'input') return;

	const clickedIdx = parseInt(nodeEl.dataset.idx, 10);
	const rt = performance.now() - roundStartTime;
	roundStartTime = performance.now();
	currentRun.latencies.push(rt);

	if (clickedIdx === trailStep) {
		nodeEl.classList.remove('active-target');
		nodeEl.classList.add('connected');
		audio.playChime(trailStep, trailSequence.length);

		if (trailPrevNode) {
			const prevRect = trailPrevNode.getBoundingClientRect();
			const curRect = nodeEl.getBoundingClientRect();
			const stageRect = elTrailStage.getBoundingClientRect();

			const x1 = prevRect.left - stageRect.left + prevRect.width / 2;
			const y1 = prevRect.top - stageRect.top + prevRect.height / 2;
			const x2 = curRect.left - stageRect.left + curRect.width / 2;
			const y2 = curRect.top - stageRect.top + curRect.height / 2;

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('class', 'trail-laser');
			line.setAttribute('x1', x1);
			line.setAttribute('y1', y1);
			line.setAttribute('x2', x2);
			line.setAttribute('y2', y2);
			elTrailSvg.appendChild(line);
		}
		trailPrevNode = nodeEl;
		trailStep++;
		currentRun.hits++;
		currentRun.streak++;
		if (currentRun.streak > currentRun.maxStreak) currentRun.maxStreak = currentRun.streak;

		if (trailStep < trailSequence.length) {
			const nextEl = elTrailNodes.children[trailStep];
			if (nextEl) nextEl.classList.add('active-target');
			elTrailStatus.textContent = `NEXT: ${trailSequence[trailStep].label}`;
		} else {
			currentRun.roundsCompleted++;
			currentRun.span = Math.min(16, currentRun.span + 2);
			showToast('SEQUENCE LINKED!', 750);
			audio.playMilestone();
			gameState = 'idle';
			setTimeout(startNeuralLinkRound, 800);
		}
	} else {
		audio.playGlitch();
		triggerShake(8);
		flashVignette('#ff4d6d');
		currentRun.misses++;
		currentRun.streak = 0;
		if (currentRun.misses >= 3) {
			endCurrentRun(true);
		}
	}
	updateHUD();
});

/* ── Session End & Results ─────────────────────────────────── */
function endCurrentRun(save = true) {
	gameState = 'ended';
	if (runTimerInterval) clearInterval(runTimerInterval);
	if (chimpMaskTimeout) clearTimeout(chimpMaskTimeout);
	if (stroopTimerRaf) cancelAnimationFrame(stroopTimerRaf);
	if (blindnessInterval) clearTimeout(blindnessInterval);
	if (matrixFlashTimeout) clearTimeout(matrixFlashTimeout);
	if (nbackTimerTimeout) clearTimeout(nbackTimerTimeout);

	if (!currentRun) {
		setScreen('menu');
		return;
	}

	const cps = calculateCPS();
	currentRun.score = cps;

	if (save) {
		store.runs.unshift(currentRun);
		if (store.runs.length > 50) store.runs.pop();

		const modeKey = currentRun.mode;
		const prevBest = store.best[modeKey] || 0;
		const compareVal = (modeKey === 'chimp' || modeKey === 'spatial' || modeKey === 'matrix') ? currentRun.span : cps;
		const isPb = compareVal > prevBest;

		if (isPb) {
			store.best[modeKey] = compareVal;
		}
		saveStore();

		// Populate Results Screen
		elRMode.textContent = `${MODE_CONFIGS[modeKey].name} · ${currentRun.diff.toUpperCase()}`;
		elRScore.textContent = (modeKey === 'chimp' || modeKey === 'spatial' || modeKey === 'matrix') ? currentRun.span : cps;
		elRUnit.textContent = MODE_CONFIGS[modeKey].unit;
		elRPb.hidden = !isPb;

		elRKpiSpan.textContent = currentRun.span;
		const meanLat = currentRun.latencies.length > 0 ?
			Math.round(currentRun.latencies.reduce((a, b) => a + b, 0) / currentRun.latencies.length) : 0;
		elRKpiLatency.textContent = `${meanLat}ms`;
		elRKpiStreak.textContent = currentRun.maxStreak;
		const totalAtt = currentRun.hits + currentRun.misses;
		const acc = totalAtt > 0 ? Math.round((currentRun.hits / totalAtt) * 100) : 100;
		elRKpiAcc.textContent = `${acc}%`;

		renderReactionChart(elRChart, currentRun.latencies);
		setScreen('results');
	} else {
		setScreen('menu');
	}
}

elBtnAgain.addEventListener('click', () => {
	launchRun(activeMode);
});

elBtnMenu.addEventListener('click', () => {
	setScreen('menu');
	audio.playBlip(500);
});

/* ── SVG Chart Rendering ───────────────────────────────────── */
function renderReactionChart(container, latencies) {
	container.innerHTML = '';
	if (!latencies || latencies.length === 0) {
		container.innerHTML = '<p class="hint">No reaction data recorded this run.</p>';
		return;
	}

	const w = container.clientWidth || 600;
	const h = container.clientHeight || 180;
	const pad = 24;

	const maxVal = Math.max(...latencies, 600);
	const minVal = Math.min(...latencies, 150);

	const points = latencies.map((val, idx) => {
		const x = pad + (idx / Math.max(1, latencies.length - 1)) * (w - pad * 2);
		const y = h - pad - ((val - minVal) / Math.max(1, maxVal - minVal)) * (h - pad * 2);
		return { x, y, val };
	});

	let pathD = `M ${points[0].x} ${points[0].y}`;
	for (let i = 1; i < points.length; i++) {
		pathD += ` L ${points[i].x} ${points[i].y}`;
	}

	const areaD = `${pathD} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

	svg.innerHTML = `
		<defs>
			<linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
				<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
			</linearGradient>
		</defs>
		<line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="var(--line)" stroke-width="1"/>
		<path d="${areaD}" fill="url(#chartGrad)"/>
		<path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
		${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/>`).join('')}
	`;

	container.appendChild(svg);
}

function renderStatsScreen() {
	const runs = store.runs;
	elSTotalRuns.textContent = runs.length;

	let maxCps = 0;
	let maxSpan = 0;
	let totalLat = 0;
	let countLat = 0;

	runs.forEach(r => {
		if (r.score > maxCps) maxCps = r.score;
		if (r.span > maxSpan) maxSpan = r.span;
		if (r.latencies && r.latencies.length > 0) {
			totalLat += r.latencies.reduce((a, b) => a + b, 0);
			countLat += r.latencies.length;
		}
	});

	elSHighCps.textContent = maxCps;
	elSMaxSpan.textContent = maxSpan;
	elSAvgLatency.textContent = countLat > 0 ? `${Math.round(totalLat / countLat)}ms` : '0ms';

	// Personal records for all 7 modes
	elSBestList.innerHTML = `
		<li><span>Chimp Matrix Max Span</span><b>${store.best.chimp || 0} items</b></li>
		<li><span>Stroop Duel Peak CPS</span><b>${store.best.stroop || 0} CPS</b></li>
		<li><span>Spatial Span Max Nodes</span><b>${store.best.spatial || 0} nodes</b></li>
		<li><span>Change Blindness Peak CPS</span><b>${store.best.blindness || 0} CPS</b></li>
		<li><span>Visual Matrix Max Tiles</span><b>${store.best.matrix || 0} tiles</b></li>
		<li><span>N-Back Flux Peak CPS</span><b>${store.best.nback || 0} CPS</b></li>
		<li><span>Neural Link Peak CPS</span><b>${store.best.trail || 0} CPS</b></li>
	`;

	// Span history chart (last 30 runs)
	const spanData = runs.slice(0, 30).reverse().map(r => r.span);
	renderReactionChart(elSSpanChart, spanData.length > 0 ? spanData : [0]);

	// Latency history chart
	const latencyData = runs.slice(0, 30).reverse().map(r => {
		return r.latencies && r.latencies.length > 0 ?
			Math.round(r.latencies.reduce((a, b) => a + b, 0) / r.latencies.length) : 500;
	});
	renderReactionChart(elSLatencyChart, latencyData.length > 0 ? latencyData : [0]);

	// Table
	elSRunsBody.innerHTML = '';
	runs.slice(0, 15).forEach(r => {
		const tr = document.createElement('tr');
		const meanLat = r.latencies && r.latencies.length > 0 ?
			Math.round(r.latencies.reduce((a, b) => a + b, 0) / r.latencies.length) : 0;
		const totalAtt = r.hits + r.misses;
		const acc = totalAtt > 0 ? Math.round((r.hits / totalAtt) * 100) : 100;
		const d = new Date(r.date);
		const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

		tr.innerHTML = `
			<td>${MODE_CONFIGS[r.mode].name}</td>
			<td>${r.diff}</td>
			<td><b>${r.score}</b></td>
			<td>${r.span}</td>
			<td>${meanLat}ms</td>
			<td>${acc}%</td>
			<td style="color:var(--dim)">${dateStr}</td>
		`;
		elSRunsBody.appendChild(tr);
	});
}

elBtnResetStats.addEventListener('click', () => {
	if (confirm('Reset all Synapse cognitive telemetry and personal bests?')) {
		store = blankStore();
		saveStore();
		renderStatsScreen();
		updateMenuBests();
		audio.playBlip(300);
	}
});

/* ── Global Keyboard Shortcuts ─────────────────────────────── */
window.addEventListener('keydown', (e) => {
	const key = e.key.toLowerCase();

	if (activeScreen === 'menu') {
		if (key === '1') launchRun('chimp');
		if (key === '2') launchRun('stroop');
		if (key === '3') launchRun('spatial');
		if (key === '4') launchRun('blindness');
		if (key === '5') launchRun('matrix');
		if (key === '6') launchRun('nback');
		if (key === '7') launchRun('trail');
	} else if (activeScreen === 'play') {
		if (key === 'escape') {
			const hasProgress = currentRun && (currentRun.hits + currentRun.misses > 0 || currentRun.span > 0 || currentRun.latencies.length > 0);
			endCurrentRun(!!hasProgress);
		} else if (key === 'r') {
			launchRun(activeMode);
		} else if (activeMode === 'stroop' && gameState === 'input') {
			if (key === 'a' || key === '1') handleStroopChoice('RED');
			if (key === 's' || key === '2') handleStroopChoice('CYAN');
			if (key === 'd' || key === '3') handleStroopChoice('YELLOW');
			if (key === 'f' || key === '4') handleStroopChoice('PURPLE');
		} else if (activeMode === 'nback' && gameState === 'input') {
			if (key === ' ' || key === 'spacebar') {
				e.preventDefault();
				handleNBackResponse(true);
			} else if (key === 'enter') {
				e.preventDefault();
				handleNBackResponse(false);
			}
		}
	} else if (activeScreen === 'results') {
		if (key === 'enter') {
			launchRun(activeMode);
		} else if (key === 'escape') {
			setScreen('menu');
		}
	} else if (activeScreen === 'stats') {
		if (key === 'escape') {
			setScreen('menu');
		}
	}
});

/* ── Init ──────────────────────────────────────────────────── */
resizeFx();
requestAnimationFrame(renderFx);
applySettingsUI();
updateMenuBests();
