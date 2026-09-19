'use strict';

/* ── VectorDrift Core Game Engine ─────────────────────────── */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

class VectorDriftGame {
	constructor() {
		this.canvas = $('#gameCanvas');
		this.ctx = this.canvas.getContext('2d');

		// State
		this.screen = 'menu'; // menu, play, paused, results, stats, settings
		this.mode = 'graze-arena'; // graze-arena, vortex, laser-grid, hell
		this.diff = 'pilot'; // cadet, pilot, cyber, singularity
		this.durationLimit = 60; // 30, 60, Infinity

		this.isRunning = false;
		this.isPaused = false;
		this.lastTime = 0;
		this.sessionTime = 0;
		this.score = 0;
		this.multiplier = 1.0;
		this.streak = 0;
		this.shakeAmt = 0;

		// Anti-camping & dynamic laser tracking
		this.campAnchor = { x: -999, y: -999 };
		this.campTimer = 0;
		this.gridWaveShift = 0;

		// Player Cursor
		this.cursor = {
			x: -100,
			y: -100,
			prevX: -100,
			prevY: -100,
			vx: 0,
			vy: 0,
			speed: 0,
			coreRadius: 3.5, // Lethal hitbox
			grazeRadius: 28, // Graze aura
			activeGraze: false,
			closestDist: 999,
			shields: 0
		};

		// Visual FX
		this.liquidTrail = [];
		this.sparks = [];
		this.rings = [];
		this.refractions = [];
		this.ambientStars = [];

		// Hazard Collections
		this.hazards = [];
		this.laserTripwires = [];
		this.vortexRings = [];
		this.spawnTimer = 0;
		this.patternTimer = 0;
		this.patternStep = 0;

		// Canvas bounds & DPR
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);

		// Cached DOM Elements
		this.dom = {
			body: document.body,
			app: $('#app'),
			vignette: $('#vignette'),
			screenFlash: $('#screenFlash'),
			toastNotice: $('#toastNotice'),
			pauseScreen: $('#pauseScreen'),
			// HUD
			hTime: $('#hTime'),
			hScore: $('#hScore'),
			hMult: $('#hMult'),
			hGrazeDist: $('#hGrazeDist'),
			hDanger: $('#hDanger'),
			grazeFill: $('#grazeFill'),
			grazeDistVal: $('#grazeDistVal'),
			// Results
			rMode: $('#rMode'),
			rScore: $('#rScore'),
			rPb: $('#rPb'),
			rKpis: $('#rKpis'),
			rHeatmap: $('#rHeatmap'),
			rTimeline: $('#rTimeline'),
			// Stats
			sKpis: $('#sKpis'),
			sHeatmap: $('#sHeatmap'),
			sRuns: $('#sRuns')
		};

		this.init();
	}

	init() {
		this.resizeCanvas();
		window.addEventListener('resize', () => this.resizeCanvas());

		this.initPointerEvents();
		this.initKeyboardEvents();
		this.initUiBindings();
		this.initAmbientStars();
		this.updateMenuBests();

		// Start Animation Loop
		requestAnimationFrame((t) => this.renderLoop(t));
	}

	resizeCanvas() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);

		this.canvas.width = this.width * this.dpr;
		this.canvas.height = this.height * this.dpr;
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
	}

	initAmbientStars() {
		this.ambientStars = Array.from({ length: 60 }, () => ({
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			z: 0.2 + Math.random() * 0.8,
			speed: 10 + Math.random() * 25
		}));
	}

	/* ── Input Handlers ───────────────────────────────────────── */
	initPointerEvents() {
		window.addEventListener('pointermove', (e) => {
			const x = e.clientX;
			const y = e.clientY;

			if (this.cursor.x > 0) {
				this.cursor.vx = x - this.cursor.x;
				this.cursor.vy = y - this.cursor.y;
				this.cursor.speed = Math.hypot(this.cursor.vx, this.cursor.vy);
			}

			this.cursor.prevX = this.cursor.x;
			this.cursor.prevY = this.cursor.y;
			this.cursor.x = x;
			this.cursor.y = y;

			if (this.isRunning && !this.isPaused) {
				// Add liquid particle trail
				this.liquidTrail.push({
					x: x,
					y: y,
					vx: this.cursor.vx * 0.15,
					vy: this.cursor.vy * 0.15,
					age: 0,
					life: 0.45,
					graze: this.cursor.activeGraze
				});
				if (this.liquidTrail.length > 180) {
					this.liquidTrail.shift();
				}
			}
		});

		window.addEventListener('pointerdown', () => {
			if (window.soundEngine) {
				window.soundEngine.resume();
			}
		});
	}

	initKeyboardEvents() {
		window.addEventListener('keydown', (e) => {
			if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

			const key = e.key.toLowerCase();

			if (this.screen === 'menu') {
				if (key === '1') this.selectMode('graze-arena');
				else if (key === '2') this.selectMode('vortex');
				else if (key === '3') this.selectMode('laser-grid');
				else if (key === '4') this.selectMode('hell');
				else if (key === 'enter' || key === ' ') {
					e.preventDefault();
					this.startRun();
				}
			} else if (this.screen === 'play') {
				if (key === 'escape') {
					e.preventDefault();
					if (this.isPaused) {
						this.quitAndSave();
					} else {
						this.togglePause();
					}
				} else if (this.isPaused && (key === ' ' || key === 'spacebar')) {
					e.preventDefault();
					this.togglePause();
				} else if (key === 'r') {
					e.preventDefault();
					this.startRun();
				} else if (key === 'q' || key === 'f') {
					e.preventDefault();
					this.quitAndSave();
				}
			} else if (this.screen === 'results') {
				if (key === 'enter' || key === 'r') {
					e.preventDefault();
					this.startRun();
				} else if (key === 'escape' || key === 'm') {
					e.preventDefault();
					this.setScreen('menu');
				}
			}
		});
	}

	initUiBindings() {
		// Navigation buttons
		$$('[data-go]').forEach((btn) => {
			btn.addEventListener('click', (e) => {
				const target = e.currentTarget.getAttribute('data-go');
				this.setScreen(target);
				if (window.soundEngine) window.soundEngine.playUiBlip(1.1);
			});
		});

		// Mode selector cards
		$$('.mode-card').forEach((card) => {
			card.addEventListener('click', () => {
				const mode = card.getAttribute('data-mode');
				this.selectMode(mode);
				if (window.soundEngine) window.soundEngine.playUiBlip(1.2);
			});
		});

		// Duration buttons
		$$('[data-len]').forEach((btn) => {
			btn.addEventListener('click', () => {
				$$('[data-len]').forEach((b) => b.classList.remove('active'));
				btn.classList.add('active');
				const val = btn.getAttribute('data-len');
				this.durationLimit = val === 'inf' ? Infinity : parseInt(val, 10);
				if (window.soundEngine) window.soundEngine.playUiBlip(1.0);
			});
		});

		// Difficulty buttons
		$$('[data-diff]').forEach((btn) => {
			btn.addEventListener('click', () => {
				$$('[data-diff]').forEach((b) => b.classList.remove('active'));
				btn.classList.add('active');
				this.diff = btn.getAttribute('data-diff');
				if (window.soundEngine) window.soundEngine.playUiBlip(1.0);
			});
		});

		// Action buttons
		$('#btnStart')?.addEventListener('click', () => this.startRun());
		$('#btnPlayAgain')?.addEventListener('click', () => this.startRun());
		$('#btnToMenu')?.addEventListener('click', () => this.setScreen('menu'));
		$('#btnResume')?.addEventListener('click', () => this.togglePause());
		$('#btnFinish')?.addEventListener('click', () => this.quitAndSave());
		$('#btnRestart')?.addEventListener('click', () => this.startRun());
		$('#btnQuit')?.addEventListener('click', () => this.quitAndSave());

		// Settings controls
		$('#setMasterVol')?.addEventListener('input', (e) => {
			const val = parseFloat(e.target.value);
			window.soundEngine.setMasterVolume(val);
			window.store.settings.masterVol = val;
			window.saveStore();
		});

		$('#setMusicVol')?.addEventListener('input', (e) => {
			const val = parseFloat(e.target.value);
			window.soundEngine.setMusicVolume(val);
			window.store.settings.musicVol = val;
			window.saveStore();
		});

		$('#setSfxVol')?.addEventListener('input', (e) => {
			const val = parseFloat(e.target.value);
			window.soundEngine.setSfxVolume(val);
			window.store.settings.sfxVol = val;
			window.saveStore();
		});

		$('#setScreenshake')?.addEventListener('change', (e) => {
			window.store.settings.screenshake = e.target.checked;
			window.saveStore();
		});

		$('#resetStatsBtn')?.addEventListener('click', () => {
			if (confirm('Are you sure you want to reset all VectorDrift stats and personal bests?')) {
				window.store.runs = [];
				window.store.best = {};
				window.saveStore();
				this.updateMenuBests();
				this.renderStatsScreen();
				if (window.soundEngine) window.soundEngine.playUiBlip(0.8);
			}
		});
	}

	setScreen(screenName) {
		this.screen = screenName;
		this.dom.body.setAttribute('data-screen', screenName);

		$$('.topbar nav button').forEach((b) => {
			b.classList.toggle('active', b.getAttribute('data-go') === screenName);
		});

		if (screenName === 'menu') {
			this.isRunning = false;
			this.isPaused = false;
			this.dom.pauseScreen.hidden = true;
			if (window.soundEngine) window.soundEngine.stopMusic();
			this.updateMenuBests();
		} else if (screenName === 'stats') {
			this.renderStatsScreen();
		}
	}

	selectMode(modeName) {
		this.mode = modeName;
		$$('.mode-card').forEach((card) => {
			card.classList.toggle('selected', card.getAttribute('data-mode') === modeName);
		});
	}

	updateMenuBests() {
		const bestArena = window.store.best[`graze-arena:${this.diff}`] || 0;
		const bestVortex = window.store.best[`vortex:${this.diff}`] || 0;
		const bestGrid = window.store.best[`laser-grid:${this.diff}`] || 0;
		const bestHell = window.store.best[`hell:${this.diff}`] || 0;

		if ($('#best-arena')) $('#best-arena').textContent = bestArena.toLocaleString();
		if ($('#best-vortex')) $('#best-vortex').textContent = bestVortex.toLocaleString();
		if ($('#best-grid')) $('#best-grid').textContent = bestGrid.toLocaleString();
		if ($('#best-hell')) $('#best-hell').textContent = bestHell.toLocaleString();
	}

	quitAndSave() {
		if (!this.isRunning) return;
		this.isRunning = false;
		this.isPaused = false;
		this.dom.pauseScreen.hidden = true;
		if (window.soundEngine) {
			window.soundEngine.stopMusic();
			window.soundEngine.updateGraze(0, 0);
		}
		// Record telemetry stats and transition to results screen
		this.finishRun(false);
	}

	/* ── Run Lifecycle ────────────────────────────────────────── */
	startRun() {
		this.setScreen('play');
		this.isRunning = true;
		this.isPaused = false;
		this.dom.pauseScreen.hidden = true;
		this.sessionTime = 0;
		this.score = 0;
		this.multiplier = 1.0;
		this.streak = 0;
		this.shakeAmt = 0;

		// Anti-camping & dynamic laser tracking resets
		this.campAnchor = { x: -999, y: -999 };
		this.campTimer = 0;
		this.gridWaveShift = 0;

		// Difficulty configuration
		const diffMods = {
			cadet: { speed: 0.8, shields: 1, grazeAura: 32 },
			pilot: { speed: 1.0, shields: 0, grazeAura: 28 },
			cyber: { speed: 1.25, shields: 0, grazeAura: 26 },
			singularity: { speed: 1.5, shields: 0, grazeAura: 24 }
		};
		const mod = diffMods[this.diff] || diffMods.pilot;
		this.diffSpeedMod = mod.speed;
		this.cursor.shields = mod.shields;
		this.cursor.grazeRadius = mod.grazeAura;

		// Reset arrays
		this.hazards = [];
		this.laserTripwires = [];
		this.vortexRings = [];
		this.liquidTrail = [];
		this.sparks = [];
		this.rings = [];
		this.refractions = [];
		this.spawnTimer = 0;
		this.patternTimer = 0;
		this.patternStep = 0;

		// Start telemetry and sound
		window.telemetry.start(this.mode, this.diff, this.durationLimit);
		if (window.soundEngine) {
			window.soundEngine.startMusic();
			window.soundEngine.setMultiplier(1.0);
			window.soundEngine.playUiBlip(1.4);
		}

		this.showToast('SYSTEM ARMED', 700);
	}

	togglePause() {
		if (!this.isRunning) return;
		this.isPaused = !this.isPaused;
		this.dom.pauseScreen.hidden = !this.isPaused;

		if (this.isPaused) {
			if (window.soundEngine) window.soundEngine.stopMusic();
		} else {
			if (window.soundEngine) window.soundEngine.startMusic();
			this.lastTime = performance.now();
		}
	}

	handlePlayerDeath() {
		if (this.cursor.shields > 0) {
			this.cursor.shields--;
			this.triggerScreenFlash('#00f0ff', 0.4);
			this.triggerShake(18);
			if (window.soundEngine) window.soundEngine.playNearMissPulse();
			this.showToast('SHIELD BROKEN', 800);
			// Push away nearby hazards
			this.hazards.forEach((h) => {
				const dx = h.x - this.cursor.x;
				const dy = h.y - this.cursor.y;
				const dist = Math.hypot(dx, dy) || 1;
				h.vx = (dx / dist) * 450;
				h.vy = (dy / dist) * 450;
			});
			return;
		}

		this.isRunning = false;
		if (window.soundEngine) {
			window.soundEngine.stopMusic();
			window.soundEngine.playDeathImpact();
			window.soundEngine.updateGraze(0, 0);
		}

		this.triggerScreenFlash('#ff0055', 0.8);
		this.triggerShake(28);

		// Death particles
		for (let i = 0; i < 45; i++) {
			const angle = Math.random() * Math.PI * 2;
			const spd = 120 + Math.random() * 320;
			this.sparks.push({
				x: this.cursor.x,
				y: this.cursor.y,
				vx: Math.cos(angle) * spd,
				vy: Math.sin(angle) * spd,
				life: 0.6 + Math.random() * 0.4,
				age: 0,
				color: Math.random() > 0.5 ? '#ff0055' : '#00f0ff',
				size: 3 + Math.random() * 4
			});
		}

		setTimeout(() => this.finishRun(false), 450);
	}

	handleRunCompleted() {
		this.isRunning = false;
		if (window.soundEngine) {
			window.soundEngine.stopMusic();
			window.soundEngine.playMilestone(30);
			window.soundEngine.updateGraze(0, 0);
		}

		this.triggerScreenFlash('#00f0ff', 0.6);
		this.showToast('SECTOR CLEARED', 1200);
		setTimeout(() => this.finishRun(true), 600);
	}

	finishRun(completed) {
		const { runData, isNewBest } = window.telemetry.finish(this.score, completed);
		this.renderResultsScreen(runData, isNewBest);
		this.setScreen('results');
	}

	/* ── Hazard Logic & Spawning ─────────────────────────────── */
	updateHazards(dt) {
		this.spawnTimer += dt;
		this.patternTimer += dt;

		if (this.mode === 'graze-arena') {
			this.updateGrazeArena(dt);
		} else if (this.mode === 'vortex') {
			this.updateVortex(dt);
		} else if (this.mode === 'laser-grid') {
			this.updateLaserGrid(dt);
		} else if (this.mode === 'hell') {
			this.updateGrazeArena(dt * 0.75);
			this.updateVortex(dt * 0.75);
			this.updateLaserGrid(dt * 0.75);
		}

		// Update generic hazards
		for (let i = this.hazards.length - 1; i >= 0; i--) {
			const h = this.hazards[i];
			h.age += dt;

			if (h.type === 'blade') {
				h.rotation += h.rotSpeed * dt;
				h.x += h.vx * dt;
				h.y += h.vy * dt;

				// Bounce off arena edges
				const pad = 40;
				if (h.x < pad && h.vx < 0) h.vx *= -1;
				if (h.x > this.width - pad && h.vx > 0) h.vx *= -1;
				if (h.y < pad && h.vy < 0) h.vy *= -1;
				if (h.y > this.height - pad && h.vy > 0) h.vy *= -1;
			} else if (h.type === 'poly') {
				h.rotation += h.rotSpeed * dt;
				h.x += h.vx * dt;
				h.y += h.vy * dt;
				if (h.x < 30 && h.vx < 0) h.vx *= -1;
				if (h.x > this.width - 30 && h.vx > 0) h.vx *= -1;
				if (h.y < 30 && h.vy < 0) h.vy *= -1;
				if (h.y > this.height - 30 && h.vy > 0) h.vy *= -1;
			} else if (h.type === 'laser-beam') {
				h.rotation += h.rotSpeed * dt;
			} else if (h.type === 'bullet') {
				h.x += h.vx * dt;
				h.y += h.vy * dt;
				if (h.x < -50 || h.x > this.width + 50 || h.y < -50 || h.y > this.height + 50) {
					this.hazards.splice(i, 1);
					continue;
				}
			}

			if (h.life && h.age >= h.life) {
				this.hazards.splice(i, 1);
			}
		}
	}

	updateGrazeArena(dt) {
		const targetCount = 5 + Math.min(Math.floor(this.sessionTime / 10), 6);
		const currentBlades = this.hazards.filter((h) => h.type === 'blade' || h.type === 'poly').length;

		if (currentBlades < targetCount && this.spawnTimer >= 1.2) {
			this.spawnTimer = 0;
			const isBlade = Math.random() > 0.4;
			const side = Math.floor(Math.random() * 4);
			let x = 0, y = 0;

			if (side === 0) { x = Math.random() * this.width; y = 20; }
			else if (side === 1) { x = this.width - 20; y = Math.random() * this.height; }
			else if (side === 2) { x = Math.random() * this.width; y = this.height - 20; }
			else { x = 20; y = Math.random() * this.height; }

			const angle = Math.atan2(this.height / 2 - y, this.width / 2 - x) + (Math.random() - 0.5) * 0.8;
			const spd = (140 + Math.random() * 100) * this.diffSpeedMod;

			if (isBlade) {
				this.hazards.push({
					type: 'blade',
					x: x,
					y: y,
					vx: Math.cos(angle) * spd,
					vy: Math.sin(angle) * spd,
					radius: 36 + Math.random() * 14,
					blades: Math.random() > 0.5 ? 4 : 2,
					rotation: Math.random() * Math.PI,
					rotSpeed: (1.5 + Math.random() * 2.5) * (Math.random() > 0.5 ? 1 : -1),
					age: 0,
					life: 30
				});
			} else {
				this.hazards.push({
					type: 'poly',
					x: x,
					y: y,
					vx: Math.cos(angle) * (spd * 1.2),
					vy: Math.sin(angle) * (spd * 1.2),
					radius: 24,
					sides: 4,
					rotation: 0,
					rotSpeed: 3.0,
					age: 0,
					life: 25
				});
			}
		}

		// Spiral bullet pattern every 6 seconds
		if (this.patternTimer >= 6.0) {
			this.patternTimer = 0;
			const cx = this.width / 2 + (Math.random() - 0.5) * (this.width * 0.4);
			const cy = this.height / 2 + (Math.random() - 0.5) * (this.height * 0.4);
			const count = 16;
			for (let i = 0; i < count; i++) {
				const a = (i / count) * Math.PI * 2;
				const spd = 160 * this.diffSpeedMod;
				this.hazards.push({
					type: 'bullet',
					x: cx,
					y: cy,
					vx: Math.cos(a) * spd,
					vy: Math.sin(a) * spd,
					radius: 5,
					age: 0,
					life: 8
				});
			}
		}
	}

	updateVortex(dt) {
		const cx = this.width / 2;
		const cy = this.height / 2;

		// Pulsing event horizon rings expanding outward (Super Hexagon-style)
		if (this.spawnTimer >= 1.6) {
			this.spawnTimer = 0;
			const gapAngle = Math.random() * Math.PI * 2;
			const gapWidth = Math.PI * (0.35 / this.diffSpeedMod); // Opening to pass through

			this.vortexRings.push({
				cx: cx,
				cy: cy,
				radius: 30,
				growthRate: 110 * this.diffSpeedMod,
				rotation: Math.random() * Math.PI,
				rotSpeed: (0.6 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
				gapAngle: gapAngle,
				gapWidth: gapWidth,
				age: 0,
				thickness: 10
			});
		}

		// Update vortex rings
		for (let i = this.vortexRings.length - 1; i >= 0; i--) {
			const r = this.vortexRings[i];
			r.age += dt;
			r.radius += r.growthRate * dt;
			r.rotation += r.rotSpeed * dt;

			if (r.radius > Math.hypot(this.width, this.height) / 2 + 100) {
				this.vortexRings.splice(i, 1);
			}
		}
	}

	updateLaserGrid(dt) {
		const px = this.cursor.x;
		const py = this.cursor.y;

		// 1. Anti-Camping Detection: if player hovers within 45px for > 1.2s, arm targeted orbital crosshair
		if (px > 0 && py > 0) {
			const campDist = Math.hypot(px - this.campAnchor.x, py - this.campAnchor.y);
			if (campDist < 45) {
				this.campTimer += dt;
				if (this.campTimer >= 1.2) {
					this.campTimer = 0;
					this.campAnchor = { x: -999, y: -999 };
					this.showToast('ORBITAL LOCK', 600);
					if (window.soundEngine) window.soundEngine.playNearMissPulse();

					// Crosshair targeting player's exact spot
					this.laserTripwires.push({
						x1: 0, y1: py, x2: this.width, y2: py,
						state: 'arming', timer: 0,
						armDuration: 0.6, fireDuration: 0.45,
						thickness: 14, isTargeted: true
					});
					this.laserTripwires.push({
						x1: px, y1: 0, x2: px, y2: this.height,
						state: 'arming', timer: 0,
						armDuration: 0.6, fireDuration: 0.45,
						thickness: 14, isTargeted: true
					});
				}
			} else {
				this.campAnchor = { x: px, y: py };
				this.campTimer = 0;
			}
		}

		// 2. Dynamic Procedural Patterns
		if (this.patternTimer >= 1.7) {
			this.patternTimer = 0;
			this.patternStep = (this.patternStep + 1) % 5;
			this.gridWaveShift = (this.gridWaveShift + 0.33) % 1;

			if (this.patternStep === 0) {
				// Shifting horizontal lines
				const count = 3;
				for (let i = 1; i <= count; i++) {
					const y = (((i + this.gridWaveShift) % (count + 1)) / (count + 1)) * this.height;
					this.laserTripwires.push({
						x1: 0, y1: y, x2: this.width, y2: y,
						state: 'arming', timer: 0,
						armDuration: 0.7, fireDuration: 0.5, thickness: 12
					});
				}
			} else if (this.patternStep === 1) {
				// Shifting vertical lines
				const count = 4;
				for (let i = 1; i <= count; i++) {
					const x = (((i + this.gridWaveShift) % (count + 1)) / (count + 1)) * this.width;
					this.laserTripwires.push({
						x1: x, y1: 0, x2: x, y2: this.height,
						state: 'arming', timer: 0,
						armDuration: 0.7, fireDuration: 0.5, thickness: 12
					});
				}
			} else if (this.patternStep === 2) {
				// Dynamic Sweeping Laser (moves across canvas during firing)
				const isVert = Math.random() > 0.5;
				if (isVert) {
					const startX = Math.random() > 0.5 ? 0 : this.width;
					const targetX = startX === 0 ? this.width : 0;
					this.laserTripwires.push({
						x1: startX, y1: 0, x2: startX, y2: this.height,
						vx: (targetX - startX) * 0.45, vy: 0,
						state: 'arming', timer: 0,
						armDuration: 0.65, fireDuration: 1.1, thickness: 12,
						isMoving: true
					});
				} else {
					const startY = Math.random() > 0.5 ? 0 : this.height;
					const targetY = startY === 0 ? this.height : 0;
					this.laserTripwires.push({
						x1: 0, y1: startY, x2: this.width, y2: startY,
						vx: 0, vy: (targetY - startY) * 0.45,
						state: 'arming', timer: 0,
						armDuration: 0.65, fireDuration: 1.1, thickness: 12,
						isMoving: true
					});
				}
			} else if (this.patternStep === 3) {
				// Diagonal razor cross + offset razor
				const offset = (Math.random() - 0.5) * (this.height * 0.35);
				this.laserTripwires.push({
					x1: 0, y1: Math.max(0, offset), x2: this.width, y2: Math.min(this.height, this.height + offset),
					state: 'arming', timer: 0,
					armDuration: 0.75, fireDuration: 0.55, thickness: 14
				});
				this.laserTripwires.push({
					x1: this.width, y1: Math.max(0, -offset), x2: 0, y2: Math.min(this.height, this.height - offset),
					state: 'arming', timer: 0,
					armDuration: 0.75, fireDuration: 0.55, thickness: 14
				});
			} else if (this.patternStep === 4) {
				// Quadrant denial box targeting player's general quadrant
				const targetQuadX = px < this.width / 2 ? 0 : this.width / 2;
				const targetQuadY = py < this.height / 2 ? 0 : this.height / 2;
				const qw = this.width / 2;
				const qh = this.height / 2;
				this.laserTripwires.push({ x1: targetQuadX, y1: targetQuadY + qh, x2: targetQuadX + qw, y2: targetQuadY + qh, state: 'arming', timer: 0, armDuration: 0.65, fireDuration: 0.5, thickness: 12 });
				this.laserTripwires.push({ x1: targetQuadX + qw, y1: targetQuadY, x2: targetQuadX + qw, y2: targetQuadY + qh, state: 'arming', timer: 0, armDuration: 0.65, fireDuration: 0.5, thickness: 12 });
			}
		}

		// Update laser states and movement
		for (let i = this.laserTripwires.length - 1; i >= 0; i--) {
			const l = this.laserTripwires[i];
			l.timer += dt;

			if (l.isMoving && l.state === 'firing') {
				l.x1 += l.vx * dt;
				l.x2 += l.vx * dt;
				l.y1 += l.vy * dt;
				l.y2 += l.vy * dt;
			}

			if (l.state === 'arming' && l.timer >= l.armDuration) {
				l.state = 'firing';
				l.timer = 0;
				this.triggerShake(4);
				if (window.soundEngine) window.soundEngine.playNearMissPulse();
			} else if (l.state === 'firing' && l.timer >= l.fireDuration) {
				l.state = 'cooldown';
				l.timer = 0;
			} else if (l.state === 'cooldown' && l.timer >= 0.2) {
				this.laserTripwires.splice(i, 1);
			}
		}
	}

	/* ── Collision & Graze Detection ─────────────────────────── */
	checkCollisions(dt) {
		let isAnyGraze = false;
		let minDistance = 999;

		const px = this.cursor.x;
		const py = this.cursor.y;
		const coreR = this.cursor.coreRadius;
		const grazeR = this.cursor.grazeRadius;

		// 1. Check Generic Hazards (Blades, Polys, Bullets)
		for (const h of this.hazards) {
			let dist = 999;

			if (h.type === 'blade') {
				// Check distance to center + arms
				const dCenter = Math.hypot(px - h.x, py - h.y);
				let dArmMin = dCenter;
				for (let b = 0; b < h.blades; b++) {
					const armAngle = h.rotation + (b * Math.PI * 2) / h.blades;
					const ax = h.x + Math.cos(armAngle) * h.radius;
					const ay = h.y + Math.sin(armAngle) * h.radius;
					const dSegment = this.distToSegment(px, py, h.x, h.y, ax, ay);
					if (dSegment < dArmMin) dArmMin = dSegment;
				}
				dist = dArmMin - 4; // 4px blade thickness
			} else if (h.type === 'poly') {
				const dCenter = Math.hypot(px - h.x, py - h.y);
				dist = Math.abs(dCenter - h.radius) - 3;
			} else if (h.type === 'bullet') {
				dist = Math.hypot(px - h.x, py - h.y) - h.radius;
			}

			if (dist < minDistance) minDistance = dist;

			// Lethal Collision
			if (dist <= coreR) {
				this.handlePlayerDeath();
				return;
			}

			// Graze Detection
			if (dist <= grazeR) {
				isAnyGraze = true;
				this.triggerGrazeFx(px, py, h.x, h.y, dist, grazeR);
			}
		}

		// 2. Check Vortex Rings
		if (this.mode === 'vortex' || this.mode === 'hell') {
			for (const r of this.vortexRings) {
				const dCenter = Math.hypot(px - r.cx, py - r.cy);
				const angle = (Math.atan2(py - r.cy, px - r.cx) - r.rotation + Math.PI * 4) % (Math.PI * 2);

				// Is cursor inside the safe gap?
				const normGapAngle = (r.gapAngle + Math.PI * 4) % (Math.PI * 2);
				const angleDiff = Math.abs(angle - normGapAngle);
				const inGap = angleDiff < r.gapWidth / 2 || (Math.PI * 2 - angleDiff) < r.gapWidth / 2;

				if (!inGap) {
					const dist = Math.abs(dCenter - r.radius) - r.thickness / 2;
					if (dist < minDistance) minDistance = dist;

					if (dist <= coreR) {
						this.handlePlayerDeath();
						return;
					}

					if (dist <= grazeR) {
						isAnyGraze = true;
						this.triggerGrazeFx(px, py, r.cx, r.cy, dist, grazeR);
					}
				}
			}
		}

		// 3. Check Laser Grid Tripwires
		if (this.mode === 'laser-grid' || this.mode === 'hell') {
			for (const l of this.laserTripwires) {
				const dist = this.distToSegment(px, py, l.x1, l.y1, l.x2, l.y2) - l.thickness / 2;
				if (dist < minDistance) minDistance = dist;

				if (l.state === 'firing') {
					if (dist <= coreR) {
						this.handlePlayerDeath();
						return;
					}

					if (dist <= grazeR) {
						isAnyGraze = true;
						const midX = (l.x1 + l.x2) / 2;
						const midY = (l.y1 + l.y2) / 2;
						this.triggerGrazeFx(px, py, midX, midY, dist, grazeR);
					}
				}
			}
		}

		// 4. Multiplier & Scoring Updates
		this.cursor.activeGraze = isAnyGraze;
		this.cursor.closestDist = Math.max(0, minDistance);

		if (isAnyGraze) {
			const proximityRatio = Math.max(0, (grazeR - Math.max(0, minDistance)) / grazeR);
			// Exponential multiplier buildup!
			this.multiplier += dt * (1.8 + 8.5 * Math.pow(proximityRatio, 1.8));
			this.score += dt * 100 * this.multiplier;
			this.streak += dt;

			// Sound audio updates
			if (window.soundEngine) {
				window.soundEngine.updateGraze(proximityRatio, this.multiplier);
				window.soundEngine.setMultiplier(this.multiplier);
			}

			// Add Refraction distortion wave
			if (Math.random() < 0.3) {
				this.refractions.push({
					x: px,
					y: py,
					radius: 12 + Math.random() * 18,
					maxRadius: 36,
					age: 0,
					life: 0.25
				});
			}
		} else {
			// Multiplier gradually decays if outside danger zone
			this.multiplier = Math.max(1.0, this.multiplier - dt * 1.8);
			this.score += dt * 25 * this.multiplier; // Baseline survival score

			if (window.soundEngine) {
				window.soundEngine.updateGraze(0, this.multiplier);
				window.soundEngine.setMultiplier(this.multiplier);
			}
		}

		// Record Telemetry
		window.telemetry.recordFrame(
			px, py, this.width, this.height,
			isAnyGraze, this.cursor.closestDist, this.multiplier, dt
		);

		// Milestone checks
		if (this.multiplier > 10 && Math.floor(this.multiplier) % 10 === 0 && Math.floor(this.multiplier) > this.lastAnnouncedMilestone) {
			this.lastAnnouncedMilestone = Math.floor(this.multiplier);
			this.showToast(`x${this.lastAnnouncedMilestone} MULTIPLIER!`, 800);
			if (window.soundEngine) window.soundEngine.playMilestone(this.lastAnnouncedMilestone);
		}

		// Update HUD
		this.updateHud();

		// Check duration limit
		if (this.sessionTime >= this.durationLimit) {
			this.handleRunCompleted();
		}
	}

	distToSegment(px, py, x1, y1, x2, y2) {
		const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
		if (l2 === 0) return Math.hypot(px - x1, py - y1);
		let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
		t = Math.max(0, Math.min(1, t));
		return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
	}

	triggerGrazeFx(px, py, hx, hy, dist, grazeR) {
		const angle = Math.atan2(hy - py, hx - px);
		const proximityRatio = Math.max(0, (grazeR - dist) / grazeR);

		// Spark particles erupting along normal vector
		if (this.sparks.length < 220) {
			const spd = 60 + Math.random() * 120;
			this.sparks.push({
				x: px + Math.cos(angle) * (dist * 0.5),
				y: py + Math.sin(angle) * (dist * 0.5),
				vx: Math.cos(angle + (Math.random() - 0.5) * 1.2) * spd,
				vy: Math.sin(angle + (Math.random() - 0.5) * 1.2) * spd,
				life: 0.2 + Math.random() * 0.2,
				age: 0,
				color: proximityRatio > 0.6 ? '#ff0080' : '#00f0ff',
				size: 2 + Math.random() * 2.5
			});
		}
	}

	/* ── Visual FX Updates ────────────────────────────────────── */
	triggerShake(amt) {
		if (window.store.settings.screenshake) {
			this.shakeAmt = Math.max(this.shakeAmt, amt);
		}
	}

	triggerScreenFlash(color, opacity = 0.5) {
		this.dom.vignette.style.setProperty('--vig-color', color);
		this.dom.vignette.style.opacity = opacity;
		setTimeout(() => {
			this.dom.vignette.style.opacity = '0';
		}, 180);
	}

	showToast(text, duration = 800) {
		const el = this.dom.toastNotice;
		el.textContent = text;
		el.animate([
			{ opacity: 0, transform: 'translate(-50%, -50%) scale(1.8)', filter: 'blur(16px)' },
			{ opacity: 1, transform: 'translate(-50%, -50%) scale(1.0)', filter: 'blur(0)', offset: 0.25 },
			{ opacity: 0, transform: 'translate(-50%, -60%) scale(0.9)', filter: 'blur(8px)' }
		], { duration: duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
	}

	updateHud() {
		const timeLeft = this.durationLimit === Infinity
			? this.sessionTime.toFixed(1) + 's'
			: Math.max(0, this.durationLimit - this.sessionTime).toFixed(1) + 's';

		this.dom.hTime.textContent = timeLeft;
		this.dom.hScore.textContent = Math.round(this.score).toLocaleString();
		this.dom.hMult.textContent = 'x' + this.multiplier.toFixed(1);
		this.dom.hGrazeDist.textContent = (this.cursor.closestDist < 100 ? this.cursor.closestDist.toFixed(1) + 'px' : '--');

		const proximityPct = Math.min(100, Math.max(0, (1 - this.cursor.closestDist / this.cursor.grazeRadius) * 100));
		this.dom.grazeFill.style.width = `${proximityPct}%`;
		this.dom.grazeDistVal.textContent = (this.cursor.closestDist < 100 ? this.cursor.closestDist.toFixed(1) : '0.0');

		// Danger Level
		const dangerLevel = this.sessionTime < 15 ? 'LOW' : this.sessionTime < 35 ? 'MED' : 'CRITICAL';
		this.dom.hDanger.textContent = dangerLevel;
	}

	/* ── Master Render Loop ───────────────────────────────────── */
	renderLoop(now) {
		requestAnimationFrame((t) => this.renderLoop(t));

		if (!this.lastTime) this.lastTime = now;
		const dt = Math.min((now - this.lastTime) / 1000, 0.1);
		this.lastTime = now;

		if (this.isRunning && !this.isPaused) {
			this.sessionTime += dt;
			this.updateHazards(dt);
			this.checkCollisions(dt);
		}

		// Draw Screen
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawBackground(dt);

		if (this.isRunning) {
			this.drawHazards();
			this.drawLiquidTrail(dt);
			this.drawSparks(dt);
			this.drawRefractions(dt);
			this.drawCursorReticle();
		}

		// Apply screen shake
		if (this.shakeAmt > 0.1) {
			const sx = (Math.random() - 0.5) * this.shakeAmt;
			const sy = (Math.random() - 0.5) * this.shakeAmt;
			this.dom.app.style.transform = `translate(${sx}px, ${sy}px)`;
			this.shakeAmt *= Math.exp(-dt * 8);
		} else if (this.shakeAmt) {
			this.shakeAmt = 0;
			this.dom.app.style.transform = '';
		}
	}

	/* ── Canvas Drawing Methods ──────────────────────────────── */
	drawBackground(dt) {
		// Cybernetic drift stars
		this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
		for (const s of this.ambientStars) {
			s.y += s.speed * dt * (1 + (this.multiplier - 1) * 0.1);
			if (s.y > this.height) s.y = 0;
			this.ctx.fillRect(s.x, s.y, 1.2 * s.z, 1.2 * s.z);
		}

		// Subtle perspective grid
		this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
		this.ctx.lineWidth = 1;
		const step = 60;
		for (let x = 0; x < this.width; x += step) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, 0);
			this.ctx.lineTo(x, this.height);
			this.ctx.stroke();
		}
		for (let y = 0; y < this.height; y += step) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(this.width, y);
			this.ctx.stroke();
		}
	}

	drawHazards() {
		// 1. Vortex Rings
		if (this.mode === 'vortex' || this.mode === 'hell') {
			for (const r of this.vortexRings) {
				this.ctx.save();
				this.ctx.translate(r.cx, r.cy);
				this.ctx.rotate(r.rotation);

				this.ctx.strokeStyle = '#ff0080';
				this.ctx.lineWidth = r.thickness;
				this.ctx.shadowColor = '#ff0080';
				this.ctx.shadowBlur = 16;

				this.ctx.beginPath();
				const startA = r.gapAngle + r.gapWidth / 2;
				const endA = r.gapAngle + Math.PI * 2 - r.gapWidth / 2;
				this.ctx.arc(0, 0, r.radius, startA, endA);
				this.ctx.stroke();

				this.ctx.restore();
			}
		}

		// 2. Laser Grid Tripwires
		if (this.mode === 'laser-grid' || this.mode === 'hell') {
			for (const l of this.laserTripwires) {
				this.ctx.save();
				if (l.state === 'arming') {
					// Faint predictive dotted line
					this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.5)';
					this.ctx.lineWidth = 2;
					this.ctx.setLineDash([8, 8]);
					this.ctx.beginPath();
					this.ctx.moveTo(l.x1, l.y1);
					this.ctx.lineTo(l.x2, l.y2);
					this.ctx.stroke();
				} else if (l.state === 'firing') {
					// Lethal high-energy laser beam
					this.ctx.strokeStyle = '#ffaa00';
					this.ctx.lineWidth = l.thickness;
					this.ctx.shadowColor = '#ff5500';
					this.ctx.shadowBlur = 24;

					this.ctx.beginPath();
					this.ctx.moveTo(l.x1, l.y1);
					this.ctx.lineTo(l.x2, l.y2);
					this.ctx.stroke();

					// Inner white-hot core
					this.ctx.strokeStyle = '#ffffff';
					this.ctx.lineWidth = 3;
					this.ctx.stroke();
				} else if (l.state === 'cooldown') {
					this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.2)';
					this.ctx.lineWidth = l.thickness * 0.6;
					this.ctx.beginPath();
					this.ctx.moveTo(l.x1, l.y1);
					this.ctx.lineTo(l.x2, l.y2);
					this.ctx.stroke();
				}
				this.ctx.restore();
			}
		}

		// 3. Generic Hazards (Blades, Polys, Bullets)
		for (const h of this.hazards) {
			this.ctx.save();
			this.ctx.translate(h.x, h.y);

			if (h.type === 'blade') {
				this.ctx.rotate(h.rotation);
				this.ctx.strokeStyle = '#00f0ff';
				this.ctx.shadowColor = '#00f0ff';
				this.ctx.shadowBlur = 18;
				this.ctx.lineWidth = 3;

				for (let b = 0; b < h.blades; b++) {
					const angle = (b * Math.PI * 2) / h.blades;
					this.ctx.beginPath();
					this.ctx.moveTo(0, 0);
					this.ctx.lineTo(Math.cos(angle) * h.radius, Math.sin(angle) * h.radius);
					this.ctx.stroke();
				}

				// Center hub
				this.ctx.fillStyle = '#ffffff';
				this.ctx.beginPath();
				this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
				this.ctx.fill();
			} else if (h.type === 'poly') {
				this.ctx.rotate(h.rotation);
				this.ctx.strokeStyle = '#ff0055';
				this.ctx.shadowColor = '#ff0055';
				this.ctx.shadowBlur = 14;
				this.ctx.lineWidth = 2.5;

				this.ctx.beginPath();
				const sides = h.sides;
				for (let s = 0; s < sides; s++) {
					const a = (s * Math.PI * 2) / sides;
					const px = Math.cos(a) * h.radius;
					const py = Math.sin(a) * h.radius;
					if (s === 0) this.ctx.moveTo(px, py);
					else this.ctx.lineTo(px, py);
				}
				this.ctx.closePath();
				this.ctx.stroke();
			} else if (h.type === 'bullet') {
				this.ctx.fillStyle = '#00f0ff';
				this.ctx.shadowColor = '#00f0ff';
				this.ctx.shadowBlur = 12;
				this.ctx.beginPath();
				this.ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
				this.ctx.fill();
			}

			this.ctx.restore();
		}
	}

	drawLiquidTrail(dt) {
		this.ctx.save();
		this.ctx.globalCompositeOperation = 'lighter';

		for (let i = this.liquidTrail.length - 1; i >= 0; i--) {
			const p = this.liquidTrail[i];
			p.age += dt;
			if (p.age >= p.life) {
				this.liquidTrail.splice(i, 1);
				continue;
			}

			const alpha = 1 - p.age / p.life;
			const radius = (1 - p.age / p.life) * 8 + 1.5;

			this.ctx.fillStyle = p.graze
				? `rgba(255, 0, 128, ${alpha * 0.7})`
				: `rgba(0, 240, 255, ${alpha * 0.5})`;
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
			this.ctx.fill();
		}

		this.ctx.restore();
	}

	drawSparks(dt) {
		this.ctx.save();
		this.ctx.globalCompositeOperation = 'lighter';

		for (let i = this.sparks.length - 1; i >= 0; i--) {
			const s = this.sparks[i];
			s.age += dt;
			if (s.age >= s.life) {
				this.sparks.splice(i, 1);
				continue;
			}

			s.x += s.vx * dt;
			s.y += s.vy * dt;
			const alpha = 1 - s.age / s.life;

			this.ctx.fillStyle = s.color;
			this.ctx.globalAlpha = alpha;
			this.ctx.beginPath();
			this.ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
			this.ctx.fill();
		}

		this.ctx.restore();
	}

	drawRefractions(dt) {
		this.ctx.save();
		this.ctx.globalCompositeOperation = 'lighter';

		for (let i = this.refractions.length - 1; i >= 0; i--) {
			const r = this.refractions[i];
			r.age += dt;
			if (r.age >= r.life) {
				this.refractions.splice(i, 1);
				continue;
			}

			const progress = r.age / r.life;
			const radius = r.radius + (r.maxRadius - r.radius) * progress;
			const alpha = (1 - progress) * 0.5;

			this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
			this.ctx.lineWidth = 1.5;
			this.ctx.beginPath();
			this.ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
			this.ctx.stroke();
		}

		this.ctx.restore();
	}

	drawCursorReticle() {
		const px = this.cursor.x;
		const py = this.cursor.y;
		if (px < 0 || py < 0) return;

		this.ctx.save();
		this.ctx.translate(px, py);

		// Outer Graze Aura Ring
		const isGraze = this.cursor.activeGraze;
		const auraColor = isGraze ? '#ff0080' : '#00f0ff';
		const auraGlow = isGraze ? 20 : 10;

		this.ctx.strokeStyle = auraColor;
		this.ctx.shadowColor = auraColor;
		this.ctx.shadowBlur = auraGlow;
		this.ctx.lineWidth = isGraze ? 2.2 : 1.2;

		this.ctx.beginPath();
		this.ctx.arc(0, 0, this.cursor.grazeRadius, 0, Math.PI * 2);
		this.ctx.stroke();

		// Inner Core (Lethal Hitbox)
		this.ctx.fillStyle = '#ffffff';
		this.ctx.shadowColor = '#ffffff';
		this.ctx.shadowBlur = 8;
		this.ctx.beginPath();
		this.ctx.arc(0, 0, this.cursor.coreRadius, 0, Math.PI * 2);
		this.ctx.fill();

		// Vector Direction Needle
		if (this.cursor.speed > 1.5) {
			const angle = Math.atan2(this.cursor.vy, this.cursor.vx);
			const needleLen = Math.min(22, 8 + this.cursor.speed * 0.4);
			this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
			this.ctx.lineWidth = 1.5;
			this.ctx.beginPath();
			this.ctx.moveTo(0, 0);
			this.ctx.lineTo(Math.cos(angle) * needleLen, Math.sin(angle) * needleLen);
			this.ctx.stroke();
		}

		this.ctx.restore();
	}

	/* ── Results & Stats Screen Rendering ─────────────────────── */
	renderResultsScreen(runData, isNewBest) {
		this.dom.rMode.textContent = `${runData.mode.toUpperCase()} · ${runData.diff.toUpperCase()} · ${runData.durationLimit === Infinity ? 'ENDLESS' : runData.durationLimit + 'S'}`;
		this.dom.rScore.textContent = runData.score.toLocaleString();
		this.dom.rPb.hidden = !isNewBest;

		// KPI Cards
		const kpis = [
			{ label: 'Survival Time', val: runData.survivalTime.toFixed(1) + 's' },
			{ label: 'Peak Multiplier', val: 'x' + runData.peakMultiplier },
			{ label: 'Avg Proximity', val: runData.avgProximity + ' px' },
			{ label: 'Closest Miss', val: runData.closestNearMiss + ' px' },
			{ label: 'Efficiency', val: runData.movementEfficiency + '%' }
		];

		this.dom.rKpis.innerHTML = kpis.map((k) => `
			<div class="kpi-card">
				<b>${k.val}</b>
				<small>${k.label}</small>
			</div>
		`).join('');

		// Render Visual Heatmap and Timeline
		const heatmapCanvas = $('#resultsHeatmapCanvas');
		if (heatmapCanvas) {
			window.telemetry.renderHeatmapCanvas(heatmapCanvas, runData);
		}
		const timelineContainer = $('#resultsTimelineContainer');
		if (timelineContainer) {
			window.telemetry.renderTimelineSvg(timelineContainer, runData);
		}
	}

	renderStatsScreen() {
		const runs = window.store.runs || [];
		const totalRuns = runs.length;

		if (totalRuns === 0) {
			this.dom.sKpis.innerHTML = '<div style="color: var(--text-dim); padding: 20px;">No runs recorded yet. Jump into an arena to start tracking!</div>';
			this.dom.sRuns.innerHTML = '';
			return;
		}

		const totalScore = runs.reduce((acc, r) => acc + r.score, 0);
		const totalTime = runs.reduce((acc, r) => acc + r.survivalTime, 0);
		const avgEfficiency = (runs.reduce((acc, r) => acc + r.movementEfficiency, 0) / totalRuns).toFixed(1);
		const peakMultiplier = Math.max(...runs.map((r) => r.peakMultiplier));

		this.dom.sKpis.innerHTML = `
			<div class="kpi-card">
				<b>${totalRuns}</b>
				<small>Total Runs</small>
			</div>
			<div class="kpi-card">
				<b>${(totalTime / 60).toFixed(1)}m</b>
				<small>Time Grazed</small>
			</div>
			<div class="kpi-card">
				<b>x${peakMultiplier}</b>
				<small>Highest Multiplier</small>
			</div>
			<div class="kpi-card">
				<b>${avgEfficiency}%</b>
				<small>Avg Efficiency</small>
			</div>
		`;

		// Lifetime aggregate heatmap (from last run or composite)
		const statsHeatmapCanvas = $('#statsHeatmapCanvas');
		if (statsHeatmapCanvas && runs.length > 0) {
			window.telemetry.renderHeatmapCanvas(statsHeatmapCanvas, runs[0]);
		}

		// Runs Table
		let rows = `<thead>
			<tr>
				<th>Date</th>
				<th>Mode</th>
				<th>Difficulty</th>
				<th>Score</th>
				<th>Peak Mult</th>
				<th>Efficiency</th>
				<th>Survival</th>
			</tr>
		</thead><tbody>`;

		runs.slice(0, 15).forEach((r) => {
			const d = new Date(r.date);
			const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
			rows += `<tr>
				<td>${dateStr}</td>
				<td style="color: var(--cyan);">${r.mode}</td>
				<td>${r.diff}</td>
				<td><b>${r.score.toLocaleString()}</b></td>
				<td>x${r.peakMultiplier}</td>
				<td>${r.movementEfficiency}%</td>
				<td>${r.survivalTime.toFixed(1)}s</td>
			</tr>`;
		});
		rows += '</tbody>';
		this.dom.sRuns.innerHTML = rows;
	}
}

// Instantiate game on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
	window.game = new VectorDriftGame();
});
