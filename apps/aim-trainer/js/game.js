'use strict';

/* ── Sound Synthesizer (Web Audio API) ─────────────────────── */
class SoundEngine {
	constructor() {
		this.ctx = null;
		this.masterGain = null;
		this.volume = 0.3;
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

	setVolume(val) {
		this.volume = val;
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
		}
	}

	setEnabled(enabled) {
		this.enabled = enabled;
	}

	resume() {
		this.init();
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
	}

	playShoot() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		const filter = this.ctx.createBiquadFilter();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(600, t);
		osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

		gain.gain.setValueAtTime(0.25, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(2800, t);
		filter.frequency.linearRampToValueAtTime(400, t + 0.08);

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(this.masterGain);

		osc.start(t);
		osc.stop(t + 0.09);
	}

	playHit(streak = 1) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		// Ascending musical pitch based on combo streak (pentatonic scaling)
		const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
		const note = scale[Math.min(streak, 40) % scale.length];
		const octaveMultiplier = 1 + Math.floor(Math.min(streak, 40) / scale.length) * 0.25;
		const freq = note * octaveMultiplier;

		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, t);
		osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.06);

		gain.gain.setValueAtTime(0.35, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start(t);
		osc.stop(t + 0.1);
	}

	playMilestone(streak) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;

		const chords = [
			[523.25, 659.25, 783.99],
			[659.25, 830.61, 987.77],
			[783.99, 987.77, 1174.66],
			[1046.50, 1318.51, 1567.98]
		];
		const chord = chords[Math.min(Math.floor(streak / 25), chords.length - 1)];

		chord.forEach((freq, idx) => {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			const start = t + idx * 0.04;

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, start);
			osc.frequency.linearRampToValueAtTime(freq * 1.05, start + 0.25);

			gain.gain.setValueAtTime(0.2, start);
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(start);
			osc.stop(start + 0.36);
		});
	}

	playMiss() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(140, t);
		osc.frequency.linearRampToValueAtTime(70, t + 0.08);

		gain.gain.setValueAtTime(0.12, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start(t);
		osc.stop(t + 0.09);
	}
}

/* ── Storage & Session Store ───────────────────────────────── */
const STORE_KEY = 'reflex:v2';
const blankStore = () => ({
	runs: [],
	best: {},
	len: 60,
	diff: 'normal',
	fov: 75,
	targetSize: 1.0,
	sens: 1.0,
	profile: 'standard',
	mouseAccel: false,
	xh: {
		size: 10,
		thick: 2,
		gap: 0,
		outline: 0,
		color: '#00f0ff',
		opacity: 100,
		showDot: false
	},
	volume: 0.3,
	soundEnabled: true,
	particles: true
});

let store = (() => {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		if (raw) return { ...blankStore(), ...JSON.parse(raw) };

		// Migrate legacy aim-trainer data if available
		const s = blankStore();
		const oldHistory = localStorage.getItem('aim_history');
		if (oldHistory) {
			const parsed = JSON.parse(oldHistory);
			s.runs = parsed.slice(0, 100);
			parsed.forEach((item) => {
				const k = `${item.mode}:${item.difficulty || 'normal'}:${item.duration || 60}`;
				if (!s.best[k] || item.score > s.best[k]) s.best[k] = item.score;
			});
		}
		if (localStorage.getItem('aim_fov')) s.fov = parseFloat(localStorage.getItem('aim_fov')) || 75;
		if (localStorage.getItem('aim_duration')) s.len = parseInt(localStorage.getItem('aim_duration'), 10) || 60;
		if (localStorage.getItem('aim_sens')) s.sens = parseFloat(localStorage.getItem('aim_sens')) || 1.0;
		if (localStorage.getItem('aim_profile')) s.profile = localStorage.getItem('aim_profile');
		if (localStorage.getItem('aim_vol')) s.volume = parseFloat(localStorage.getItem('aim_vol')) || 0.3;
		return s;
	} catch {
		return blankStore();
	}
})();

const saveStore = () => {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(store));
	} catch {
		/* LocalStorage failure fallback */
	}
};

/* ── Helper Utilities ──────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const MODES = {
	gridshot: { name: 'Gridshot', color: '#00f0ff', hue: 195, unit: 'pts' },
	tracking: { name: 'Tracking', color: '#fbbf24', hue: 45, unit: 'pts' },
	reflex: { name: 'Reflex', color: '#ff4d6d', hue: 345, unit: 'pts' },
	microshot: { name: 'Microshot', color: '#10b981', hue: 155, unit: 'pts' },
	razor: { name: 'Razor', color: '#d946ef', hue: 290, unit: 'hits', suddenDeath: true },
	zen: { name: 'Zen', color: '#818cf8', hue: 245, unit: 'pts', endless: true }
};

const XH_PRESETS = {
	dot: { size: 4, thick: 4, gap: 0, outline: 1, color: '#00f0ff', opacity: 100, showDot: true },
	cross: { size: 10, thick: 2, gap: 2, outline: 1, color: '#00f0ff', opacity: 100, showDot: false },
	circle: { size: 18, thick: 2, gap: 14, outline: 0, color: '#00f0ff', opacity: 100, showDot: true },
	plus: { size: 8, thick: 2, gap: 0, outline: 0, color: '#00f0ff', opacity: 100, showDot: false }
};

/* ── Main Reflex Game Controller ───────────────────────────── */
class ReflexGame {
	constructor() {
		this.mode = 'gridshot';
		this.isActive = false;
		this.isPaused = false;
		this.score = 0;
		this.shotsFired = 0;
		this.shotsHit = 0;
		this.streak = 0;
		this.maxStreak = 0;
		this.timeLeft = 60;
		this.t0 = 0;
		this.timeline = []; // [{ t, ok, reactionMs }]
		this.reactionTimes = [];
		this.targets = [];
		this.particles = [];
		this.shakeAmt = 0;

		this.sound = new SoundEngine();
		this.sound.setVolume(store.volume);
		this.sound.setEnabled(store.soundEnabled);

		this.setupThree();
		this.setupInput();
		this.setupUI();
		this.applyCrosshair();
		this.updateBests();

		this.loop = this.loop.bind(this);
		requestAnimationFrame(this.loop);
	}

	/* ── 3D Scene Initialization ───────────────────────────── */
	setupThree() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x06060b);
		this.scene.fog = new THREE.FogExp2(0x06060b, 0.02);

		this.camera = new THREE.PerspectiveCamera(store.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.rotation.order = 'YXZ';

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		document.body.prepend(this.renderer.domElement);

		// Lights
		const ambient = new THREE.AmbientLight(0xffffff, 1.2);
		this.scene.add(ambient);

		this.mainLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
		this.mainLight.position.set(0, 10, 10);
		this.scene.add(this.mainLight);

		// Futuristic Arena Grids
		const gridFloor = new THREE.GridHelper(120, 60, 0x00f0ff, 0x141828);
		gridFloor.position.y = -6;
		this.scene.add(gridFloor);

		const gridCeil = new THREE.GridHelper(120, 60, 0x00f0ff, 0x141828);
		gridCeil.position.y = 18;
		this.scene.add(gridCeil);

		// Ambient floating starfield / particles
		const moteCount = 120;
		const moteGeo = new THREE.BufferGeometry();
		const motePos = new Float32Array(moteCount * 3);
		for (let i = 0; i < moteCount * 3; i += 3) {
			motePos[i] = (Math.random() - 0.5) * 60;
			motePos[i + 1] = (Math.random() - 0.5) * 24 + 4;
			motePos[i + 2] = -Math.random() * 40 - 5;
		}
		moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
		const moteMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.12, transparent: true, opacity: 0.35 });
		this.motes = new THREE.Points(moteGeo, moteMat);
		this.scene.add(this.motes);

		// Raycasting
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2(0, 0);

		// Target base geometry & material
		this.targetGeo = new THREE.SphereGeometry(1, 32, 32);
	}

	/* ── Input & Event Listeners ───────────────────────────── */
	setupInput() {
		window.addEventListener('resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// Mouse Look
		document.addEventListener('mousemove', (e) => {
			if (!this.isActive || this.isPaused) return;

			const movementX = e.movementX || 0;
			const movementY = e.movementY || 0;

			let baseScale = 0.0004;
			if (store.mouseAccel) {
				const speed = Math.sqrt(movementX * movementX + movementY * movementY);
				baseScale *= 1 + speed * 0.001;
			}

			let profileMult = 1.0;
			if (store.profile === 'valorant') profileMult = 3.18;
			else if (store.profile === 'overwatch') profileMult = 3.33;

			const effectiveSens = store.sens * profileMult * baseScale;

			this.camera.rotation.y -= movementX * effectiveSens;
			this.camera.rotation.x -= movementY * effectiveSens;
			this.camera.rotation.x = clamp(this.camera.rotation.x, -Math.PI / 2.1, Math.PI / 2.1);
		});

		// Shooting / Clicking
		document.addEventListener('mousedown', (e) => {
			if (e.target.closest('button, input, select, a')) return;

			if (!this.isActive) {
				if (document.body.dataset.screen === 'play') {
					this.requestLock();
				}
				return;
			}

			if (document.pointerLockElement !== document.body) {
				this.requestLock();
				return;
			}

			if (this.mode === 'tracking') {
				this.isTracking = true;
			} else {
				this.shoot();
			}
		});

		document.addEventListener('mouseup', () => {
			if (this.mode === 'tracking') this.isTracking = false;
		});

		// Global Keyboard Navigation
		document.addEventListener('keydown', (e) => {
			const currentScreen = document.body.dataset.screen;

			if (e.code === 'Escape') {
				if (this.isActive) {
					if (this.isPaused) {
						this.endGame(true);
					} else {
						this.togglePause();
					}
				} else if (currentScreen !== 'menu') {
					this.go('menu');
				}
			} else if (e.code === 'Space' && this.isPaused) {
				e.preventDefault();
				this.resume();
			} else if (e.code === 'KeyF' && (this.isActive || this.isPaused)) {
				this.endGame(true);
			} else if (e.code === 'KeyQ' && this.isPaused) {
				this.endGame(false);
			} else if (e.code === 'KeyR' && (this.isActive || this.isPaused || currentScreen === 'results')) {
				this.start(this.mode);
			} else if (e.code === 'Enter' && currentScreen === 'results') {
				this.start(this.mode);
			} else if (currentScreen === 'menu') {
				if (e.key === '1') this.start('gridshot');
				else if (e.key === '2') this.start('tracking');
				else if (e.key === '3') this.start('reflex');
				else if (e.key === '4') this.start('microshot');
				else if (e.key === '5') this.start('razor');
				else if (e.key === '6') this.start('zen');
			}
		});

		// Pointer Lock state sync
		document.addEventListener('pointerlockchange', () => {
			if (document.pointerLockElement !== document.body && this.isActive) {
				this.pause();
			}
		});
	}

	/* ── UI Setup & Binding ────────────────────────────────── */
	setupUI() {
		// Navigation buttons
		$$('[data-go]').forEach((btn) => {
			btn.addEventListener('click', () => this.go(btn.dataset.go));
		});

		// Mode selection cards
		$$('#modes .card').forEach((card) => {
			card.addEventListener('click', () => {
				const m = card.dataset.mode;
				if (m) this.start(m);
			});

			// 3D perspective tilt effect on mouse move
			card.addEventListener('mousemove', (e) => {
				const rect = card.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width;
				const y = (e.clientY - rect.top) / rect.height;
				card.style.setProperty('--rx', `${(0.5 - y) * 14}deg`);
				card.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
				card.style.setProperty('--mx', `${x * 100}%`);
				card.style.setProperty('--my', `${y * 100}%`);
			});

			card.addEventListener('mouseleave', () => {
				card.style.setProperty('--rx', '0deg');
				card.style.setProperty('--ry', '0deg');
			});
		});

		// Duration pills
		$$('[data-len]').forEach((btn) => {
			btn.setAttribute('aria-pressed', btn.dataset.len === String(store.len));
			btn.addEventListener('click', () => {
				$$('[data-len]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
				btn.setAttribute('aria-pressed', 'true');
				store.len = parseInt(btn.dataset.len, 10);
				saveStore();
				this.updateBests();
			});
		});

		// Difficulty pills
		$$('[data-diff]').forEach((btn) => {
			btn.setAttribute('aria-pressed', btn.dataset.diff === store.diff);
			btn.addEventListener('click', () => {
				$$('[data-diff]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
				btn.setAttribute('aria-pressed', 'true');
				store.diff = btn.dataset.diff;
				saveStore();
				this.updateBests();
			});
		});

		// Pause Menu Actions
		$('#btnResume')?.addEventListener('click', () => this.resume());
		$('#btnFinish')?.addEventListener('click', () => this.endGame(true));
		$('#btnRestart')?.addEventListener('click', () => this.start(this.mode));
		$('#btnQuit')?.addEventListener('click', () => this.endGame(false));
		$('#again')?.addEventListener('click', () => this.start(this.mode));

		// Crosshair Presets
		$$('[data-xh]').forEach((btn) => {
			btn.addEventListener('click', () => {
				const preset = XH_PRESETS[btn.dataset.xh];
				if (preset) {
					store.xh = { ...store.xh, ...preset };
					this.syncSettingsUI();
					this.applyCrosshair();
					saveStore();
				}
			});
		});

		// Stats Filter & Metric Switches
		$$('#sFilter button').forEach((btn) => {
			btn.addEventListener('click', () => {
				$$('#sFilter button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
				btn.setAttribute('aria-pressed', 'true');
				this.renderStatsChart(btn.dataset.f);
			});
		});
		$('#sFilter button[data-f="all"]')?.setAttribute('aria-pressed', 'true');

		$$('#sMetric button').forEach((btn) => {
			btn.addEventListener('click', () => {
				$$('#sMetric button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
				btn.setAttribute('aria-pressed', 'true');
				this.renderBreakdown(btn.dataset.m);
			});
		});
		$('#sMetric button[data-m="accuracy"]')?.setAttribute('aria-pressed', 'true');

		// Reset Stats Button
		$('#resetStats')?.addEventListener('click', () => {
			if (confirm('Are you sure you want to reset all stats and history? This cannot be undone.')) {
				store.runs = [];
				store.best = {};
				saveStore();
				this.updateBests();
				this.renderStats();
				this.toast('Stats reset');
			}
		});

		// Bind Settings Controls
		this.bindSettingsInputs();
		this.syncSettingsUI();
	}

	/* ── Settings Inputs Binding ───────────────────────────── */
	bindSettingsInputs() {
		const bindVal = (id, prop, isFloat = false) => {
			const el = document.getElementById(id);
			if (!el) return;
			const handler = (e) => {
				const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
				store.xh[prop] = val;
				const display = document.getElementById(`${id}-val`);
				if (display) display.textContent = val + (prop === 'opacity' ? '%' : '');
				this.applyCrosshair();
				saveStore();
			};
			el.addEventListener('input', handler);
		};

		bindVal('xh-size', 'size');
		bindVal('xh-thick', 'thick');
		bindVal('xh-gap', 'gap');
		bindVal('xh-outline', 'outline');
		bindVal('xh-opacity', 'opacity');

		$('#xh-color')?.addEventListener('input', (e) => {
			store.xh.color = e.target.value;
			this.applyCrosshair();
			saveStore();
		});

		$('#xh-show-dot')?.addEventListener('change', (e) => {
			store.xh.showDot = e.target.checked;
			this.applyCrosshair();
			saveStore();
		});

		$('#sensitivity')?.addEventListener('input', (e) => {
			store.sens = parseFloat(e.target.value);
			$('#sens-val').textContent = store.sens.toFixed(2);
			saveStore();
		});

		$('#sens-profile')?.addEventListener('change', (e) => {
			store.profile = e.target.value;
			saveStore();
		});

		$('#mouse-accel')?.addEventListener('change', (e) => {
			store.mouseAccel = e.target.checked;
			saveStore();
		});

		$('#fov')?.addEventListener('input', (e) => {
			store.fov = parseInt(e.target.value, 10);
			$('#fov-val').textContent = store.fov + '°';
			this.camera.fov = store.fov;
			this.camera.updateProjectionMatrix();
			saveStore();
		});

		$('#target-size')?.addEventListener('input', (e) => {
			store.targetSize = parseFloat(e.target.value);
			$('#target-size-val').textContent = store.targetSize.toFixed(1) + 'x';
			saveStore();
		});

		$('#volume')?.addEventListener('input', (e) => {
			store.volume = parseFloat(e.target.value);
			$('#volume-val').textContent = Math.round(store.volume * 100) + '%';
			this.sound.setVolume(store.volume);
			this.sound.playHit(1);
			saveStore();
		});

		$('#sound-enabled')?.addEventListener('change', (e) => {
			store.soundEnabled = e.target.checked;
			this.sound.setEnabled(store.soundEnabled);
			saveStore();
		});

		$('#particles-enabled')?.addEventListener('change', (e) => {
			store.particles = e.target.checked;
			saveStore();
		});
	}

	syncSettingsUI() {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val;
		};

		setVal('xh-size', store.xh.size);
		setVal('xh-thick', store.xh.thick);
		setVal('xh-gap', store.xh.gap);
		setVal('xh-outline', store.xh.outline);
		setVal('xh-color', store.xh.color);
		setVal('xh-opacity', store.xh.opacity);
		if ($('#xh-show-dot')) $('#xh-show-dot').checked = store.xh.showDot;

		$('#xh-size-val').textContent = store.xh.size;
		$('#xh-thick-val').textContent = store.xh.thick;
		$('#xh-gap-val').textContent = store.xh.gap;
		$('#xh-outline-val').textContent = store.xh.outline;
		$('#xh-opacity-val').textContent = store.xh.opacity + '%';

		setVal('sensitivity', store.sens);
		$('#sens-val').textContent = store.sens.toFixed(2);
		setVal('sens-profile', store.profile);
		if ($('#mouse-accel')) $('#mouse-accel').checked = store.mouseAccel;

		setVal('fov', store.fov);
		$('#fov-val').textContent = store.fov + '°';

		setVal('target-size', store.targetSize);
		$('#target-size-val').textContent = store.targetSize.toFixed(1) + 'x';

		setVal('volume', store.volume);
		$('#volume-val').textContent = Math.round(store.volume * 100) + '%';
		if ($('#sound-enabled')) $('#sound-enabled').checked = store.soundEnabled;
		if ($('#particles-enabled')) $('#particles-enabled').checked = store.particles;
	}

	applyCrosshair() {
		const root = document.documentElement;
		root.style.setProperty('--xh-size', `${store.xh.size}px`);
		root.style.setProperty('--xh-thick', `${store.xh.thick}px`);
		root.style.setProperty('--xh-gap', `${store.xh.gap}px`);
		root.style.setProperty('--xh-outline', `${store.xh.outline}px`);
		root.style.setProperty('--xh-color', store.xh.color);
		root.style.setProperty('--xh-opacity', store.xh.opacity / 100);

		const updateElements = (container) => {
			if (!container) return;
			const parts = container.querySelectorAll('.crosshair-part');
			parts.forEach((p) => {
				if (store.xh.outline > 0) p.classList.add('has-outline');
				else p.classList.remove('has-outline');

				if (store.xh.gap > 0 && (p.classList.contains('xh-h') || p.classList.contains('xh-v'))) {
					p.classList.add('has-gap');
					if (p.classList.contains('xh-h')) {
						p.classList.add('gap-left');
						if (!p.nextElementSibling || !p.nextElementSibling.classList.contains('gap-right')) {
							const clone = p.cloneNode(true);
							clone.classList.remove('gap-left');
							clone.classList.add('gap-right');
							p.parentNode.appendChild(clone);
						}
					} else if (p.classList.contains('xh-v')) {
						p.classList.add('gap-top');
						if (!p.nextElementSibling || !p.nextElementSibling.classList.contains('gap-bottom')) {
							const clone = p.cloneNode(true);
							clone.classList.remove('gap-top');
							clone.classList.add('gap-bottom');
							p.parentNode.appendChild(clone);
						}
					}
				} else {
					p.classList.remove('has-gap', 'gap-left', 'gap-right', 'gap-top', 'gap-bottom');
				}
			});

			const dot = container.querySelector('.xh-dot');
			if (dot) {
				if (store.xh.showDot) dot.classList.add('show');
				else dot.classList.remove('show');
			}
		};

		updateElements($('#crosshair'));
		updateElements($('#xh-preview'));
	}

	/* ── Screen Navigation ─────────────────────────────────── */
	go(screen) {
		document.body.dataset.screen = screen;
		if (screen !== 'play' && this.isActive) {
			this.endGame(false);
		}
		if (screen === 'stats') {
			this.renderStats();
		} else if (screen === 'menu') {
			this.updateBests();
		}
	}

	requestLock() {
		this.sound.resume();
		document.body.requestPointerLock();
	}

	togglePause() {
		if (this.isPaused) this.resume();
		else this.pause();
	}

	pause() {
		if (!this.isActive) return;
		this.isPaused = true;
		$('#pause-screen').hidden = false;
	}

	resume() {
		if (!this.isActive) return;
		this.isPaused = false;
		$('#pause-screen').hidden = true;
		this.requestLock();
	}

	/* ── Feedback Visuals (Vignette & Toast) ───────────────── */
	flashVignette(color = '#ff4d6d') {
		const el = $('#vig');
		if (!el) return;
		el.style.setProperty('--vc', color);
		el.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: 380, easing: 'ease-out' });
	}

	toast(text, ms = 750) {
		const el = $('#toast');
		if (!el) return;
		el.textContent = text;
		el.animate(
			[
				{ opacity: 0, transform: 'translate(-50%, -50%) scale(2.4)', filter: 'blur(20px)' },
				{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(0)', offset: 0.3 },
				{ opacity: 0, transform: 'translate(-50%, -70%) scale(0.85)', filter: 'blur(8px)' }
			],
			{ duration: ms, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
		);
	}

	shake(amt) {
		if (!prefersReduced) this.shakeAmt = Math.max(this.shakeAmt, amt);
	}

	/* ── Game Session Lifecycle ────────────────────────────── */
	start(mode = 'gridshot') {
		this.mode = mode;
		this.isActive = true;
		this.isPaused = false;
		this.score = 0;
		this.shotsFired = 0;
		this.shotsHit = 0;
		this.streak = 0;
		this.maxStreak = 0;
		this.timeLeft = mode === 'zen' ? '∞' : store.len;
		this.t0 = performance.now();
		this.timeline = [];
		this.reactionTimes = [];
		this.isTracking = false;

		// Set accent hue matching mode
		const mConfig = MODES[mode] || MODES.gridshot;
		document.documentElement.style.setProperty('--hue', mConfig.hue);

		// Reset camera
		this.camera.rotation.set(0, 0, 0);

		// Clear existing targets and particles
		this.targets.forEach((t) => this.scene.remove(t.mesh));
		this.targets = [];
		this.particles.forEach((p) => this.scene.remove(p.mesh));
		this.particles = [];

		// UI Switch
		$('#pause-screen').hidden = true;
		this.go('play');
		this.requestLock();
		this.updateHUD();

		const hintEl = $('#playHint');
		if (hintEl) {
			hintEl.innerHTML = mode === 'zen'
				? 'Click to capture mouse · <kbd>esc</kbd> to pause · <kbd>f</kbd> to finish &amp; save'
				: 'Click to capture mouse · <kbd>esc</kbd> to pause · <kbd>r</kbd> to restart';
		}

		// Spawn initial targets
		if (mode === 'gridshot') {
			for (let i = 0; i < 3; i++) this.spawnTarget();
		} else if (mode === 'tracking') {
			this.spawnTarget();
		} else if (mode === 'reflex') {
			this.scheduleReflexSpawn();
		} else if (mode === 'microshot') {
			this.spawnTarget();
		} else if (mode === 'razor') {
			this.spawnTarget();
		} else if (mode === 'zen') {
			for (let i = 0; i < 2; i++) this.spawnTarget();
		}

		// Countdown Timer (not in zen mode)
		if (this.timerInterval) clearInterval(this.timerInterval);
		if (mode !== 'zen') {
			this.timerInterval = setInterval(() => {
				if (!this.isActive || this.isPaused) return;
				this.timeLeft--;
				this.updateHUD();
				if (this.timeLeft <= 0) this.endGame(true);
			}, 1000);
		}
	}

	getDifficultyMultiplier() {
		const mults = { easy: 0.7, normal: 1.0, hard: 1.5, extreme: 2.2 };
		return mults[store.diff] || 1.0;
	}

	spawnTarget() {
		const mConfig = MODES[this.mode] || MODES.gridshot;
		const colorHex = parseInt(mConfig.color.replace('#', '0x'), 16);

		const mat = new THREE.MeshStandardMaterial({
			color: colorHex,
			emissive: colorHex,
			emissiveIntensity: 0.75,
			roughness: 0.15,
			metalness: 0.85
		});

		const mesh = new THREE.Mesh(this.targetGeo, mat);

		let depth = -15;
		let spreadX = 24;
		let spreadY = 12;
		let scale = store.targetSize;

		if (this.mode === 'microshot') {
			spreadX = 9;
			spreadY = 5.5;
			scale = 0.45 * store.targetSize;
		}

		mesh.position.set((Math.random() - 0.5) * spreadX, (Math.random() - 0.5) * spreadY + 4, depth);

		const diffMult = this.getDifficultyMultiplier();
		const tData = {
			mesh,
			vx: 0,
			vy: 0,
			spawnTime: performance.now(),
			baseScale: scale
		};

		if (this.mode === 'tracking') {
			const trackScale = 1.4 * store.targetSize;
			tData.baseScale = trackScale;
			tData.vx = (Math.random() - 0.5) * 0.35 * diffMult;
			tData.vy = (Math.random() - 0.5) * 0.35 * diffMult;
		}

		this.scene.add(mesh);
		this.targets.push(tData);

		// Animated spawn scaling
		mesh.scale.set(0, 0, 0);
		this.animateSpawn(mesh, tData.baseScale);
	}

	animateSpawn(mesh, targetScale) {
		let s = 0;
		const grow = () => {
			if (!this.isActive || !mesh.parent) return;
			s += 0.22;
			if (s >= targetScale) s = targetScale;
			mesh.scale.set(s, s, s);
			if (s < targetScale) requestAnimationFrame(grow);
		};
		grow();
	}

	scheduleReflexSpawn() {
		const baseDelay = 350 + Math.random() * 900;
		const delay = baseDelay / this.getDifficultyMultiplier();

		setTimeout(() => {
			if (this.isActive && !this.isPaused && this.targets.length === 0) {
				this.spawnTarget();
			} else if (this.isActive && this.targets.length === 0) {
				this.scheduleReflexSpawn();
			}
		}, delay);
	}

	shoot() {
		this.shotsFired++;
		this.sound.playShoot();

		this.raycaster.setFromCamera(this.pointer, this.camera);
		const targetMeshes = this.targets.map((t) => t.mesh);
		const hits = this.raycaster.intersectObjects(targetMeshes);

		const nowSec = (performance.now() - this.t0) / 1000;

		if (hits.length > 0) {
			this.handleHit(hits[0].object, nowSec);
		} else {
			this.streak = 0;
			this.sound.playMiss();
			this.flashVignette('#ff4d6d');
			this.shake(this.mode === 'razor' ? 14 : 3);
			this.timeline.push({ t: nowSec, ok: false });
			if (this.mode === 'razor') {
				this.toast('ELIMINATED', 1000);
				this.endGame(true);
				return;
			}
			this.updateHUD();
		}
	}

	handleHit(object, nowSec) {
		this.shotsHit++;
		this.streak++;
		if (this.streak > this.maxStreak) this.maxStreak = this.streak;

		// Hit sound & Combo audio feedback
		this.sound.playHit(this.streak);

		// Zen mode: evolving atmosphere as combo climbs
		if (this.mode === 'zen') {
			const zenHue = (245 + this.streak * 4) % 360;
			document.documentElement.style.setProperty('--hue', zenHue);
			if (this.mainLight) this.mainLight.color.setHSL(zenHue / 360, 0.85, 0.55);

			if (this.streak === 10) this.toast('FLOW STATE', 800);
			else if (this.streak === 25) this.toast('IN THE ZONE', 900);
			else if (this.streak === 50) this.toast('TRANSCENDENCE', 1000);
			else if (this.streak === 100) this.toast('ZEN MASTER', 1100);
			else if (this.streak === 200) this.toast('ENLIGHTENMENT', 1200);
			else if (this.streak % 10 === 0) {
				this.sound.playMilestone(this.streak);
				this.toast(`${this.streak} COMBO!`);
				this.flashVignette('hsl(var(--hue) 100% 60%)');
			}
		} else if (this.streak % 10 === 0) {
			this.sound.playMilestone(this.streak);
			this.toast(`${this.streak} COMBO!`);
			this.flashVignette('hsl(var(--hue) 100% 60%)');
			this.shake(8);
		}

		this.createHitmarker();

		// Score computation with combo multiplier
		const comboMult = 1 + Math.floor(this.streak / 10) * 0.1;
		this.score += Math.round(100 * comboMult);

		// Hit particles
		if (store.particles) {
			this.spawnParticles(object.position);
		}

		// Target removal & timing
		const idx = this.targets.findIndex((t) => t.mesh === object);
		if (idx > -1) {
			const tData = this.targets[idx];
			const reactionMs = Math.round(performance.now() - tData.spawnTime);
			this.reactionTimes.push(reactionMs);
			this.timeline.push({ t: nowSec, ok: true, reactionMs });

			this.scene.remove(object);
			this.targets.splice(idx, 1);

			if (this.mode === 'gridshot' || this.mode === 'microshot' || this.mode === 'razor') {
				this.spawnTarget();
			} else if (this.mode === 'zen') {
				this.spawnTarget();
				// Dynamically scale targets in Zen as combo builds
				if (this.streak >= 50 && this.targets.length < 5) this.spawnTarget();
				else if (this.streak >= 25 && this.targets.length < 4) this.spawnTarget();
				else if (this.streak >= 10 && this.targets.length < 3) this.spawnTarget();
			} else if (this.mode === 'reflex') {
				this.scheduleReflexSpawn();
			}
		}

		this.updateHUD();
	}

	createHitmarker() {
		const m = document.createElement('div');
		m.className = 'hitmarker';
		$('#hit-layer').appendChild(m);
		setTimeout(() => m.remove(), 220);
	}

	spawnParticles(pos) {
		const count = 22;
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(count * 3);
		const velocities = [];

		for (let i = 0; i < count; i++) {
			positions[i * 3] = pos.x;
			positions[i * 3 + 1] = pos.y;
			positions[i * 3 + 2] = pos.z;
			velocities.push({
				x: (Math.random() - 0.5) * 0.55,
				y: (Math.random() - 0.5) * 0.55,
				z: (Math.random() - 0.5) * 0.55
			});
		}
		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const mConfig = MODES[this.mode] || MODES.gridshot;
		const mat = new THREE.PointsMaterial({
			color: parseInt(mConfig.color.replace('#', '0x'), 16),
			size: 0.24,
			transparent: true,
			opacity: 1
		});
		const points = new THREE.Points(geo, mat);
		this.scene.add(points);
		this.particles.push({ mesh: points, vels: velocities, life: 1.0 });
	}

	updateHUD() {
		$('#hScore').textContent = this.score.toLocaleString();
		$('#hTime').textContent = this.mode === 'zen' ? '∞' : Math.max(0, this.timeLeft);
		const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 100;
		$('#hAcc').textContent = `${acc}%`;
		$('#hStreak').textContent = this.streak;
		$('#hHits').textContent = this.shotsHit;
	}

	endGame(showResults = true) {
		this.isActive = false;
		this.isPaused = false;
		if (document.pointerLockElement === document.body) document.exitPointerLock();
		clearInterval(this.timerInterval);

		// Always record and persist session stats if any shots were fired
		if (this.shotsFired > 0) {
			const acc = Math.round((this.shotsHit / this.shotsFired) * 100);
			const misses = Math.max(0, this.shotsFired - this.shotsHit);
			const avgReaction =
				this.reactionTimes.length > 0
					? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
					: null;

			const durationSec = Math.max(1, Math.round((performance.now() - this.t0) / 1000));

			// Best key: mode:diff:len (or mode:diff for razor & zen)
			const bKey = (this.mode === 'razor' || this.mode === 'zen')
				? `${this.mode}:${store.diff}`
				: `${this.mode}:${store.diff}:${store.len}`;
			const isNewBest = !store.best[bKey] || this.score > store.best[bKey];
			if (isNewBest) {
				store.best[bKey] = this.score;
			}

			// Save session
			const session = {
				timestamp: Date.now(),
				mode: this.mode,
				score: this.score,
				accuracy: acc,
				hits: this.shotsHit,
				misses,
				maxCombo: this.maxCombo,
				avgReaction,
				duration: this.mode === 'zen' ? durationSec : store.len,
				difficulty: store.diff,
				timeline: this.timeline
			};
			store.runs.unshift(session);
			if (store.runs.length > 100) store.runs = store.runs.slice(0, 100);
			saveStore();

			if (showResults) {
				this.renderResults(session, isNewBest);
				this.go('results');
				return;
			}
		}

		if (showResults) {
			this.go('results');
		} else {
			this.go('menu');
		}
	}

	/* ── Results Screen Rendering ──────────────────────────── */
	renderResults(session, isNewBest) {
		if (session.mode === 'razor') {
			$('#rMode').textContent = `RAZOR · SUDDEN DEATH · ${store.diff.toUpperCase()}`;
			$('#rScore').textContent = session.hits.toLocaleString();
			$('#rUnit').textContent = 'hits';
		} else if (session.mode === 'zen') {
			$('#rMode').textContent = `ZEN · FLOW SESSION · ${store.diff.toUpperCase()}`;
			$('#rScore').textContent = session.score.toLocaleString();
			$('#rUnit').textContent = 'pts';
		} else {
			$('#rMode').textContent = `${session.mode.toUpperCase()} · ${store.diff.toUpperCase()} · ${store.len}S`;
			$('#rScore').textContent = session.score.toLocaleString();
			$('#rUnit').textContent = 'pts';
		}
		$('#rPb').hidden = !isNewBest;

		const pace = store.len > 0 && session.duration !== '∞' ? (session.hits / store.len).toFixed(1) : (session.hits / Math.max(1, (performance.now() - this.t0) / 1000)).toFixed(1);

		const kpis = [
			{ label: 'Accuracy', val: `${session.accuracy}%` },
			{ label: 'Hits', val: session.hits },
			{ label: 'Misses', val: session.misses },
			{ label: 'Max Combo', val: session.maxCombo },
			{ label: session.avgReaction ? 'Avg Reaction' : 'Target Pace', val: session.avgReaction ? `${session.avgReaction}ms` : `${pace} /s` }
		];

		$('#rKpis').innerHTML = kpis
			.map(
				(k, i) => `
			<div class="kpi" style="--n: ${i}">
				<b>${k.val}</b>
				<small>${k.label}</small>
			</div>
		`
			)
			.join('');

		this.renderResultsChart(session.timeline);
	}

	renderResultsChart(timeline) {
		const container = $('#rChartSvg');
		if (!container) return;

		if (!timeline || timeline.length < 2) {
			container.innerHTML = '<p class="subtext" style="padding: 24px 0; text-align: center;">Not enough data points for timeline chart.</p>';
			return;
		}

		const W = 800, H = 200, pad = 36;
		const duration = store.len;

		// Calculate cumulative score over time
		let runningScore = 0;
		const points = [{ t: 0, s: 0, ok: true }];
		timeline.forEach((item) => {
			if (item.ok) runningScore += 100;
			points.push({ t: item.t, s: runningScore, ok: item.ok });
		});

		const maxScore = Math.max(runningScore, 100);

		const toX = (t) => pad + (t / duration) * (W - pad * 2);
		const toY = (s) => H - pad - (s / maxScore) * (H - pad * 2);

		let pathD = `M ${toX(0)} ${toY(0)}`;
		for (let i = 1; i < points.length; i++) {
			pathD += ` L ${toX(points[i].t)} ${toY(points[i].s)}`;
		}

		const areaD = `${pathD} L ${toX(duration)} ${H - pad} L ${toX(0)} ${H - pad} Z`;

		const markers = points
			.filter((p, i) => i > 0)
			.map(
				(p) =>
					`<circle cx="${toX(p.t).toFixed(1)}" cy="${toY(p.s).toFixed(1)}" r="${p.ok ? 3.5 : 4.5}" class="${p.ok ? 'dot' : 'err'}" />`
			)
			.join('');

		const mConfig = MODES[this.mode] || MODES.gridshot;

		container.innerHTML = `
			<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
				<defs>
					<linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="${mConfig.color}" stop-opacity="0.35"/>
						<stop offset="100%" stop-color="${mConfig.color}" stop-opacity="0.0"/>
					</linearGradient>
				</defs>
				<line x1="${pad}" y1="${toY(0)}" x2="${W - pad}" y2="${toY(0)}" class="grid" />
				<line x1="${pad}" y1="${toY(maxScore / 2)}" x2="${W - pad}" y2="${toY(maxScore / 2)}" class="grid" />
				<line x1="${pad}" y1="${toY(maxScore)}" x2="${W - pad}" y2="${toY(maxScore)}" class="grid" />
				<path d="${areaD}" fill="url(#rGrad)" class="area" />
				<path d="${pathD}" class="line" style="stroke: ${mConfig.color};" />
				${markers}
				<text x="${pad}" y="${H - 10}">0s</text>
				<text x="${W / 2}" y="${H - 10}" text-anchor="middle">${Math.round(duration / 2)}s</text>
				<text x="${W - pad}" y="${H - 10}" text-anchor="end">${duration}s</text>
				<text x="${pad - 6}" y="${toY(maxScore) + 4}" text-anchor="end">${maxScore}</text>
			</svg>
		`;
	}

	/* ── Stats Screen Rendering ────────────────────────────── */
	renderStats() {
		const runs = store.runs;
		const totalRuns = runs.length;
		const totalHits = runs.reduce((sum, r) => sum + (r.hits || 0), 0);
		const avgAcc = totalRuns > 0 ? Math.round(runs.reduce((sum, r) => sum + (r.accuracy || 0), 0) / totalRuns) : 0;
		const topScore = totalRuns > 0 ? Math.max(...runs.map((r) => r.score || 0)) : 0;

		const kpis = [
			{ label: 'Total Games', val: totalRuns },
			{ label: 'Total Hits', val: totalHits.toLocaleString() },
			{ label: 'Avg Accuracy', val: `${avgAcc}%` },
			{ label: 'Best Score', val: topScore.toLocaleString() }
		];

		$('#sKpis').innerHTML = kpis
			.map(
				(k, i) => `
			<div class="kpi" style="--n: ${i}">
				<b>${k.val}</b>
				<small>${k.label}</small>
			</div>
		`
			)
			.join('');

		this.renderStatsChart('all');
		this.renderPersonalBests();
		this.renderBreakdown('accuracy');
		this.renderRecentRuns();
	}

	renderStatsChart(filter = 'all') {
		const container = $('#sChart');
		if (!container) return;

		let runs = store.runs;
		if (filter !== 'all') {
			runs = runs.filter((r) => r.mode === filter);
		}

		// Take last 30 runs in chronological order
		const data = runs.slice(0, 30).reverse();

		if (data.length < 2) {
			container.innerHTML = '<p class="subtext" style="padding: 24px 0; text-align: center;">Need at least 2 sessions to chart progression.</p>';
			return;
		}

		const W = 600, H = 200, pad = 36;
		const maxScore = Math.max(...data.map((d) => d.score), 100);

		const toX = (i) => pad + (i / (data.length - 1)) * (W - pad * 2);
		const toY = (s) => H - pad - (s / maxScore) * (H - pad * 2);

		let pathD = `M ${toX(0)} ${toY(data[0].score)}`;
		for (let i = 1; i < data.length; i++) {
			pathD += ` L ${toX(i)} ${toY(data[i].score)}`;
		}

		const areaD = `${pathD} L ${toX(data.length - 1)} ${H - pad} L ${toX(0)} ${H - pad} Z`;

		const dots = data
			.map(
				(d, i) => `
			<circle cx="${toX(i).toFixed(1)}" cy="${toY(d.score).toFixed(1)}" r="4" class="dot" />
		`
			)
			.join('');

		container.innerHTML = `
			<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
				<defs>
					<linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.3"/>
						<stop offset="100%" stop-color="#00f0ff" stop-opacity="0.0"/>
					</linearGradient>
				</defs>
				<line x1="${pad}" y1="${toY(0)}" x2="${W - pad}" y2="${toY(0)}" class="grid" />
				<line x1="${pad}" y1="${toY(maxScore / 2)}" x2="${W - pad}" y2="${toY(maxScore / 2)}" class="grid" />
				<line x1="${pad}" y1="${toY(maxScore)}" x2="${W - pad}" y2="${toY(maxScore)}" class="grid" />
				<path d="${areaD}" fill="url(#sGrad)" class="area" />
				<path d="${pathD}" class="line" />
				${dots}
				<text x="${pad}" y="${H - 10}">Oldest</text>
				<text x="${W - pad}" y="${H - 10}" text-anchor="end">Latest</text>
				<text x="${pad - 6}" y="${toY(maxScore) + 4}" text-anchor="end">${maxScore.toLocaleString()}</text>
			</svg>
		`;
	}

	renderPersonalBests() {
		const list = $('#sBest');
		if (!list) return;

		const modes = ['gridshot', 'tracking', 'reflex', 'microshot', 'razor', 'zen'];
		list.innerHTML = modes
			.map((m) => {
				const k = (m === 'razor' || m === 'zen') ? `${m}:${store.diff}` : `${m}:${store.diff}:${store.len}`;
				const best = store.best[k] || 0;
				const unit = m === 'razor' ? 'hits' : 'pts';
				const sub = (m === 'razor' || m === 'zen') ? `(${store.diff})` : `(${store.diff}/${store.len}s)`;
				return `
				<li>
					<span>${MODES[m].name} <small style="color: var(--dim);">${sub}</small></span>
					<b>${best.toLocaleString()} ${unit}</b>
				</li>
			`;
			})
			.join('');
	}

	renderBreakdown(metric = 'accuracy') {
		const container = $('#sBreakdown');
		if (!container) return;

		const runs = store.runs;
		if (runs.length === 0) {
			container.innerHTML = '<p class="subtext" style="padding: 20px 0; text-align: center;">No session data available yet.</p>';
			return;
		}

		if (metric === 'accuracy') {
			const tiers = {
				'90% - 100%': runs.filter((r) => r.accuracy >= 90).length,
				'80% - 89%': runs.filter((r) => r.accuracy >= 80 && r.accuracy < 90).length,
				'60% - 79%': runs.filter((r) => r.accuracy >= 60 && r.accuracy < 80).length,
				'< 60%': runs.filter((r) => r.accuracy < 60).length
			};

			const maxCount = Math.max(...Object.values(tiers), 1);

			container.innerHTML = `
				<div style="display: grid; gap: 12px; margin-top: 6px;">
					${Object.entries(tiers)
						.map(
							([tier, count]) => `
						<div>
							<div style="display: flex; justify-content: space-between; font: 500 0.82rem var(--mono); margin-bottom: 4px;">
								<span>${tier}</span>
								<span>${count} runs (${Math.round((count / runs.length) * 100)}%)</span>
							</div>
							<div style="height: 8px; background: var(--line); border-radius: 999px; overflow: hidden;">
								<div style="width: ${(count / maxCount) * 100}%; height: 100%; background: var(--accent); border-radius: 999px; transition: width 0.6s ease;"></div>
							</div>
						</div>
					`
						)
						.join('')}
				</div>
			`;
		} else {
			// Reaction pace breakdown
			const reflexRuns = runs.filter((r) => r.avgReaction);
			if (reflexRuns.length === 0) {
				container.innerHTML = '<p class="subtext" style="padding: 20px 0; text-align: center;">Play Reflex mode to track reaction time metrics.</p>';
				return;
			}

			const fast = reflexRuns.filter((r) => r.avgReaction < 250).length;
			const mid = reflexRuns.filter((r) => r.avgReaction >= 250 && r.avgReaction < 350).length;
			const slow = reflexRuns.filter((r) => r.avgReaction >= 350).length;

			container.innerHTML = `
				<div style="display: grid; gap: 12px; margin-top: 6px;">
					<div>
						<div style="display: flex; justify-content: space-between; font: 500 0.82rem var(--mono); margin-bottom: 4px;">
							<span>Fast (&lt; 250ms)</span>
							<span>${fast} runs</span>
						</div>
						<div style="height: 8px; background: var(--line); border-radius: 999px; overflow: hidden;">
							<div style="width: ${(fast / reflexRuns.length) * 100}%; height: 100%; background: var(--good); border-radius: 999px;"></div>
						</div>
					</div>
					<div>
						<div style="display: flex; justify-content: space-between; font: 500 0.82rem var(--mono); margin-bottom: 4px;">
							<span>Medium (250 - 350ms)</span>
							<span>${mid} runs</span>
						</div>
						<div style="height: 8px; background: var(--line); border-radius: 999px; overflow: hidden;">
							<div style="width: ${(mid / reflexRuns.length) * 100}%; height: 100%; background: var(--warning); border-radius: 999px;"></div>
						</div>
					</div>
					<div>
						<div style="display: flex; justify-content: space-between; font: 500 0.82rem var(--mono); margin-bottom: 4px;">
							<span>Steady (&gt; 350ms)</span>
							<span>${slow} runs</span>
						</div>
						<div style="height: 8px; background: var(--line); border-radius: 999px; overflow: hidden;">
							<div style="width: ${(slow / reflexRuns.length) * 100}%; height: 100%; background: var(--dim); border-radius: 999px;"></div>
						</div>
					</div>
				</div>
			`;
		}
	}

	renderRecentRuns() {
		const table = $('#sRuns');
		if (!table) return;

		const runs = store.runs.slice(0, 15);
		if (runs.length === 0) {
			table.innerHTML = '<tr><td colspan="6" class="subtext" style="text-align: center; padding: 20px 0;">No runs recorded yet. Start training!</td></tr>';
			return;
		}

		table.innerHTML = `
			<thead>
				<tr>
					<th>Date</th>
					<th>Mode</th>
					<th style="text-align: right;">Score</th>
					<th style="text-align: right;">Accuracy</th>
					<th style="text-align: right;">Hits</th>
					<th style="text-align: right;">Combo</th>
				</tr>
			</thead>
			<tbody>
				${runs
					.map((r) => {
						const d = new Date(r.timestamp);
						const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
						const accColor = r.accuracy >= 85 ? 'var(--good)' : r.accuracy >= 70 ? 'var(--warning)' : 'var(--dim)';
						return `
						<tr>
							<td>${dateStr}</td>
							<td><span class="badge ${r.mode}">${r.mode}</span></td>
							<td style="text-align: right; font-weight: 700;">${r.score.toLocaleString()}</td>
							<td style="text-align: right; color: ${accColor}; font-weight: 700;">${r.accuracy}%</td>
							<td style="text-align: right;">${r.hits}</td>
							<td style="text-align: right; color: var(--warning);">${r.maxCombo}</td>
						</tr>
					`;
					})
					.join('')}
			</tbody>
		`;
	}

	updateBests() {
		['gridshot', 'tracking', 'reflex', 'microshot', 'razor', 'zen'].forEach((m) => {
			const k = (m === 'razor' || m === 'zen') ? `${m}:${store.diff}` : `${m}:${store.diff}:${store.len}`;
			const el = $(`#best-${m}`);
			if (el) el.textContent = (store.best[k] || 0).toLocaleString();
		});
	}

	/* ── Render Loop ───────────────────────────────────────── */
	loop(time) {
		requestAnimationFrame(this.loop);
		const delta = Math.min((time - (this.lastTime || time)) / 1000, 0.1);
		this.lastTime = time;

		this.update(delta);
		this.renderer.render(this.scene, this.camera);
	}

	update(delta) {
		if (!this.isActive || this.isPaused) {
			// Subtle idle camera pan
			if (this.camera) {
				const t = performance.now() * 0.0003;
				this.camera.position.x = Math.sin(t) * 0.8;
				this.camera.position.y = Math.cos(t * 0.8) * 0.4;
			}
			return;
		}

		// Screen Shake
		if (this.shakeAmt > 0.05) {
			$('#app').style.transform = `translate(${(Math.random() - 0.5) * this.shakeAmt}px, ${(Math.random() - 0.5) * this.shakeAmt}px)`;
			this.shakeAmt *= Math.exp(-delta * 10);
		} else if (this.shakeAmt) {
			this.shakeAmt = 0;
			$('#app').style.transform = '';
		}

		// Update 3D hit particles
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			p.life -= delta * 2.5;
			if (p.life <= 0) {
				this.scene.remove(p.mesh);
				this.particles.splice(i, 1);
				continue;
			}
			const positions = p.mesh.geometry.attributes.position.array;
			for (let j = 0; j < p.vels.length; j++) {
				positions[j * 3] += p.vels[j].x;
				positions[j * 3 + 1] += p.vels[j].y;
				positions[j * 3 + 2] += p.vels[j].z;
			}
			p.mesh.geometry.attributes.position.needsUpdate = true;
			p.mesh.material.opacity = p.life;
		}

		// Zen mode: gentle harmonic floating motion
		if (this.mode === 'zen') {
			const t = performance.now() * 0.002;
			this.targets.forEach((tgt, i) => {
				tgt.mesh.position.y += Math.sin(t + i * 1.6) * 0.018;
				tgt.mesh.position.x += Math.cos(t * 0.8 + i * 1.6) * 0.014;
			});
		}

		// Tracking mode target logic
		if (this.mode === 'tracking' && this.targets.length > 0) {
			const t = this.targets[0];
			if (t.mesh.position.x > 14 || t.mesh.position.x < -14) t.vx *= -1;
			if (t.mesh.position.y > 9 || t.mesh.position.y < -1) t.vy *= -1;
			t.mesh.position.x += t.vx * delta * 60;
			t.mesh.position.y += t.vy * delta * 60;

			if (this.isTracking) {
				this.raycaster.setFromCamera(this.pointer, this.camera);
				const hits = this.raycaster.intersectObject(t.mesh);
				const nowSec = (performance.now() - this.t0) / 1000;

				if (hits.length > 0) {
					this.score += 2;
					this.shotsHit++;
					this.shotsFired++;
					this.streak++;
					if (this.streak > this.maxStreak) this.maxStreak = this.streak;
					t.mesh.material.emissiveIntensity = 2.2;
					if (this.score % 20 === 0) this.sound.playHit(Math.floor(this.streak / 10));
					this.timeline.push({ t: nowSec, ok: true });
				} else {
					t.mesh.material.emissiveIntensity = 0.6;
					this.shotsFired++;
					this.streak = 0;
				}
				this.updateHUD();
			}
		}
	}
}

// Instantiate Reflex Arena
window.game = new ReflexGame();
