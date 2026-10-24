'use strict';

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('museumCanvas');
	const ctx = canvas.getContext('2d');

	const roomsNav = document.getElementById('rooms');
	const paletteSelect = document.getElementById('palette-select');
	const speedInput = document.getElementById('speed-input');
	const speedOut = document.getElementById('speed-out');
	const controlsBody = document.getElementById('controls-body');
	const panel = document.getElementById('panel');
	const panelBtn = document.getElementById('panel-btn');
	const tourBtn = document.getElementById('tour-btn');
	const pauseBtn = document.getElementById('pause-btn');
	const placard = document.getElementById('placard');

	const NINE = 9;
	const TOUR_MS = 15000;
	const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

	// ── Nine dimensions: nine colours each ──────────────────────────────
	const PALETTES = {
		rainbow: { label: 'Rainbow', cycle: true, colors: ['#ff3b3b', '#ff9f1c', '#ffe14d', '#7dff4d', '#2dffb0', '#2dd4ff', '#4d79ff', '#a64dff', '#ff4dd2'] },
		fire: { label: 'Fire', colors: ['#ff1e00', '#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ffc400', '#ffe066', '#ffd24d', '#fff1a8'] },
		ice: { label: 'Ice', colors: ['#e0fbff', '#b5f0ff', '#8fe3ff', '#62d2ff', '#3bb8ff', '#2f9bff', '#4b7bff', '#7aa2ff', '#bcd0ff'] },
		neon: { label: 'Neon', colors: ['#ff00ff', '#00ffff', '#ffff00', '#00ff66', '#ff2a6d', '#05d9e8', '#d1f7ff', '#ff9100', '#7d2cff'] },
		'deep-space': { label: 'Deep Space', colors: ['#4a4aff', '#5a5aff', '#6a6aff', '#7a7aff', '#8a8aff', '#9a9aff', '#aaaaff', '#c8c8ff', '#ffffff'] },
		aurora: { label: 'Aurora', colors: ['#00ffa3', '#00e5b0', '#00d1c2', '#00b8d4', '#2fa4ff', '#6c7bff', '#9d5cff', '#c44dff', '#7dffcf'] },
		'milky-way': { label: 'Milky Way', colors: ['#8a8a99', '#9e9eac', '#b2b2be', '#c4c4ce', '#d4d4dc', '#e2e2e8', '#eeeef2', '#f8f8fa', '#ffffff'] },
		nebula: { label: 'Nebula', colors: ['#ff4de1', '#e033ff', '#c21fff', '#a020f0', '#8a2be2', '#ff70a6', '#ff9ff3', '#6a5acd', '#f0a6ff'] },
		gilded: { label: 'Gilded', colors: ['#f4b942', '#ffd166', '#ffe29a', '#e09f3e', '#c98a2b', '#fff1c9', '#b8860b', '#ffcf5a', '#fff7e0'] }
	};
	Object.values(PALETTES).forEach((p) => {
		p.rgb = p.colors.map((c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
	});

	// ── Shared context handed to every exhibit ──────────────────────────
	const M = {
		ctx,
		W: 0,
		H: 0,
		dpr: 1,
		time: 0,
		speed: 1,
		palette: 'rainbow',
		pointer: { x: 0, y: 0, active: false, down: false },
		focus: { x: 0, y: 0 },

		// Palette colour for a seed in [0,1); the rainbow palette drifts through hues over time
		color(seed, alpha) {
			const p = PALETTES[this.palette];
			const a = alpha === undefined ? 1 : alpha;
			if (p.cycle) return `hsla(${(seed * 360 + this.time * 0.2 * this.speed) % 360},100%,58%,${a})`;
			const c = p.rgb[Math.floor(seed * NINE) % NINE];
			return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
		},
		// Fixed palette tone (0–8): never drifts, safe for illusions that need stable colours
		toneRgb(i) {
			return PALETTES[this.palette].rgb[((i % NINE) + NINE) % NINE];
		},
		tone(i, alpha) {
			return this.css(this.toneRgb(i), alpha);
		},
		css(rgb, alpha) {
			return `rgba(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])},${alpha === undefined ? 1 : alpha})`;
		},
		mix(a, b, t) {
			return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
		},
		fill(rgb, alpha) {
			ctx.fillStyle = this.css(rgb, alpha);
			ctx.fillRect(0, 0, this.W, this.H);
		}
	};

	const exhibits = Museum.exhibits.slice().sort((a, b) => a.order - b.order);
	const values = exhibits.map((ex) => {
		const v = {};
		ex.controls.forEach((c) => {
			v[c.id] = c.value;
		});
		return v;
	});

	const state = { room: 0, paused: false, tour: false };
	let tourTimer = null;

	function current() {
		return exhibits[state.room];
	}

	function resizeCanvas() {
		M.dpr = Math.min(window.devicePixelRatio || 1, 2);
		M.W = window.innerWidth;
		M.H = window.innerHeight;
		canvas.width = Math.round(M.W * M.dpr);
		canvas.height = Math.round(M.H * M.dpr);
		ctx.setTransform(M.dpr, 0, 0, M.dpr, 0, 0);
		if (!M.pointer.active) {
			M.focus.x = M.W / 2;
			M.focus.y = M.H / 2;
		}
		M.fill([0, 0, 0], 1);
		const ex = current();
		if (ex) (ex.resize || ex.init)(M, values[state.room]);
	}

	// ── Exhibit controls (rebuilt per exhibit) ──────────────────────────
	function buildControls() {
		controlsBody.innerHTML = '';
		const ex = current();
		const v = values[state.room];
		ex.controls.forEach((c) => {
			const row = document.createElement('div');
			row.className = 'control-group';
			const id = `ctl-${c.id}`;

			if (c.type === 'checkbox') {
				row.classList.add('control-check');
				row.innerHTML = `<label for="${id}"><input type="checkbox" id="${id}"><span class="lbl">${c.label}</span></label>`;
				const input = row.querySelector('input');
				input.checked = Boolean(v[c.id]);
				input.addEventListener('change', () => changed(c, input.checked));
			} else if (c.type === 'select') {
				row.innerHTML = `<label for="${id}"><span class="lbl">${c.label}</span></label><select id="${id}"></select>`;
				const select = row.querySelector('select');
				c.options.forEach(([val, text]) => {
					const opt = document.createElement('option');
					opt.value = val;
					opt.textContent = text;
					select.appendChild(opt);
				});
				select.value = v[c.id];
				select.addEventListener('change', () => changed(c, select.value));
			} else {
				row.innerHTML = `<label for="${id}"><span class="lbl">${c.label}</span><output></output></label>` +
					`<input type="range" id="${id}" min="${c.min}" max="${c.max}" step="${c.step}">`;
				const input = row.querySelector('input');
				const out = row.querySelector('output');
				input.value = v[c.id];
				out.textContent = v[c.id];
				input.addEventListener('input', () => {
					const val = parseFloat(input.value);
					out.textContent = val;
					changed(c, val);
				});
			}
			controlsBody.appendChild(row);
		});
	}

	function changed(control, val) {
		const v = values[state.room];
		v[control.id] = val;
		const ex = current();
		if (control.rebuild) {
			M.fill([0, 0, 0], 1);
			ex.init(M, v);
		}
		if (ex.onChange) ex.onChange(control.id, M, v);
	}

	// ── Room management ─────────────────────────────────────────────────
	function updatePlacard() {
		const ex = current();
		const pad = (n) => String(n).padStart(2, '0');
		document.getElementById('placard-no').textContent = `Exhibit ${pad(state.room + 1)} / ${pad(exhibits.length)}`;
		document.getElementById('placard-title').textContent = ex.name;
		document.getElementById('placard-blurb').textContent = ex.blurb;
		document.getElementById('placard-hint').textContent = ex.hint;
		placard.classList.remove('swap');
		void placard.offsetWidth;
		placard.classList.add('swap');
	}

	function restartTour() {
		clearInterval(tourTimer);
		tourTimer = null;
		if (state.tour) tourTimer = setInterval(() => setRoom(state.room + 1), TOUR_MS);
	}

	function setRoom(index) {
		state.room = (index + exhibits.length) % exhibits.length;
		M.fill([0, 0, 0], 1);
		M.focus.x = M.W / 2;
		M.focus.y = M.H / 2;
		current().init(M, values[state.room]);
		buildControls();
		updatePlacard();
		roomsNav.querySelectorAll('.room-btn').forEach((btn, i) => {
			btn.setAttribute('aria-current', String(i === state.room));
		});
		try {
			history.replaceState(null, '', `#${state.room + 1}`);
		} catch (e) {
			/* replaceState can be blocked in some embeds */
		}
		restartTour();
	}

	function setPaused(paused) {
		state.paused = paused;
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Resume' : 'Pause';
	}

	function setTour(on) {
		state.tour = on;
		tourBtn.setAttribute('aria-pressed', String(on));
		restartTour();
	}

	function setPanelOpen(open) {
		panel.hidden = !open;
		panelBtn.setAttribute('aria-expanded', String(open));
	}

	// ── Static UI wiring ────────────────────────────────────────────────
	function buildUI() {
		exhibits.forEach((ex, i) => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'room-btn';
			btn.title = ex.name;
			btn.setAttribute('aria-label', ex.name);
			btn.innerHTML = `<small>${String(i + 1).padStart(2, '0')}</small><span class="room-name">${ex.name}</span>`;
			btn.addEventListener('click', () => setRoom(i));
			roomsNav.appendChild(btn);
		});

		Object.keys(PALETTES).forEach((key, i) => {
			const opt = document.createElement('option');
			opt.value = key;
			opt.textContent = `${ROMAN[i]} · ${PALETTES[key].label}`;
			paletteSelect.appendChild(opt);
		});
		paletteSelect.addEventListener('change', () => {
			M.palette = paletteSelect.value;
			const ex = current();
			if (ex.onPalette) ex.onPalette(M, values[state.room]);
		});

		speedInput.addEventListener('input', () => {
			M.speed = parseFloat(speedInput.value);
			speedOut.textContent = M.speed.toFixed(1) + 'x';
		});

		tourBtn.addEventListener('click', () => setTour(!state.tour));
		pauseBtn.addEventListener('click', () => setPaused(!state.paused));
		panelBtn.addEventListener('click', () => setPanelOpen(panel.hidden));
	}

	const pointer = M.pointer;
	canvas.addEventListener('pointermove', (e) => {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.active = true;
	});
	canvas.addEventListener('pointerdown', (e) => {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.active = true;
		pointer.down = true;
		canvas.setPointerCapture(e.pointerId);
	});
	const releasePointer = (e) => {
		pointer.down = false;
		if (e.pointerType !== 'mouse') pointer.active = false;
	};
	canvas.addEventListener('pointerup', releasePointer);
	canvas.addEventListener('pointercancel', releasePointer);
	canvas.addEventListener('pointerleave', () => {
		if (!pointer.down) pointer.active = false;
	});

	window.addEventListener('keydown', (e) => {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		const typing = /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName);
		if (typing && e.key === ' ') return;
		const n = parseInt(e.key, 10);
		if (n >= 1 && n <= exhibits.length) setRoom(n - 1);
		else if (e.key === 'ArrowRight' && !typing) setRoom(state.room + 1);
		else if (e.key === 'ArrowLeft' && !typing) setRoom(state.room - 1);
		else if (e.key === ' ') {
			e.preventDefault();
			setPaused(!state.paused);
		} else if (e.key === 't' || e.key === 'T') setTour(!state.tour);
		else if (e.key === 'c' || e.key === 'C') setPanelOpen(panel.hidden);
	});

	window.addEventListener('resize', resizeCanvas);

	// ── Main loop ───────────────────────────────────────────────────────
	let last = performance.now();
	function frame(now) {
		const dt = Math.min((now - last) / 16.667, 3);
		last = now;
		if (!state.paused) {
			M.time += dt;
			const tx = pointer.active ? pointer.x : M.W / 2;
			const ty = pointer.active ? pointer.y : M.H / 2;
			const k = Math.min(1, 0.06 * dt);
			M.focus.x += (tx - M.focus.x) * k;
			M.focus.y += (ty - M.focus.y) * k;
			ctx.save();
			current().step(M, dt, values[state.room]);
			ctx.restore();
		}
		requestAnimationFrame(frame);
	}

	buildUI();
	resizeCanvas();
	setPanelOpen(window.innerWidth > 760);
	const fromHash = parseInt(window.location.hash.slice(1), 10);
	setRoom(fromHash >= 1 && fromHash <= exhibits.length ? fromHash - 1 : 0);
	requestAnimationFrame(frame);
});
