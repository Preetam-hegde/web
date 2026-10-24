'use strict';

(function () {
	const $ = function (id) {
		return document.getElementById(id);
	};
	const esc = DSA.util.esc;

	const el = {
		groups: $('groups'),
		algos: $('algos'),
		controls: $('controls'),
		title: $('stage-title'),
		legend: $('legend'),
		narration: $('narration'),
		stats: $('stats'),
		scrub: $('scrub'),
		step: $('step-count'),
		play: $('btn-play'),
		prev: $('btn-prev'),
		next: $('btn-next'),
		first: $('btn-first'),
		last: $('btn-last'),
		speed: $('speed'),
		speedLabel: $('speed-label'),
		infoName: $('info-name'),
		infoBlurb: $('info-blurb'),
		complexity: $('complexity'),
		code: $('code'),
		eli5: $('eli5')
	};

	const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16];

	const app = {
		algo: null,
		params: {},
		seed: 1 + Math.floor(Math.random() * 100000),
		frames: [],
		meta: {},
		idx: 0,
		playing: false,
		sbState: null,
		raf: 0,
		lastTs: 0,
		acc: 0,
		baseDelay: 300
	};

	// ── views ───────────────────────────────────────────────────────────────
	const viewEls = {};
	Object.keys(DSA.views).forEach(function (name) {
		viewEls[name] = $('v-' + name);
		DSA.views[name].init(viewEls[name]);
	});

	// ── navigation ──────────────────────────────────────────────────────────
	function groupAlgos(groupId) {
		return DSA.algos.filter(function (a) {
			return a.group === groupId;
		});
	}

	function renderNav() {
		el.groups.innerHTML = '';
		DSA.groups.forEach(function (g) {
			if (!groupAlgos(g.id).length) {
				return;
			}
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'tab' + (app.algo && app.algo.group === g.id ? ' active' : '');
			b.textContent = g.label;
			b.title = g.hint;
			b.addEventListener('click', function () {
				selectAlgo(groupAlgos(g.id)[0]);
			});
			el.groups.appendChild(b);
		});
		el.algos.innerHTML = '';
		groupAlgos(app.algo.group).forEach(function (a) {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'pill' + (a === app.algo ? ' active' : '');
			b.textContent = a.name;
			b.addEventListener('click', function () {
				selectAlgo(a);
			});
			el.algos.appendChild(b);
		});
	}

	function clamp(v, lo, hi) {
		return Math.min(hi, Math.max(lo, v));
	}

	// ── controls ────────────────────────────────────────────────────────────
	function field(labelText, control) {
		const wrap = document.createElement('label');
		wrap.className = 'ctl';
		const span = document.createElement('span');
		span.className = 'ctl-label';
		span.textContent = labelText;
		wrap.appendChild(span);
		wrap.appendChild(control);
		return { wrap: wrap, label: span };
	}

	function button(text, cls, onClick) {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = cls;
		b.textContent = text;
		b.addEventListener('click', onClick);
		return b;
	}

	function renderControls() {
		const a = app.algo;
		el.controls.innerHTML = '';
		(a.controls || []).forEach(function (c) {
			if (c.type === 'hint') {
				const hint = document.createElement('p');
				hint.className = 'ctl-hint';
				hint.textContent = c.text;
				el.controls.appendChild(hint);
				return;
			}
			if (c.type === 'action') {
				el.controls.appendChild(button(c.label, 'btn ghost', function () {
					pause();
					c.run({ rand: Math.random });
					rebuild();
				}));
				return;
			}
			if (!(c.id in app.params)) {
				app.params[c.id] = c.value;
			}
			let input;
			if (c.type === 'range') {
				input = document.createElement('input');
				input.type = 'range';
				input.min = c.min;
				input.max = c.max;
				app.params[c.id] = clamp(Number(app.params[c.id]), c.min, c.max);
				input.value = app.params[c.id];
				const f = field(c.label, input);
				const out = document.createElement('output');
				out.textContent = input.value;
				f.label.appendChild(out);
				input.addEventListener('input', function () {
					app.params[c.id] = Number(input.value);
					out.textContent = input.value;
					rebuild();
				});
				el.controls.appendChild(f.wrap);
			} else if (c.type === 'select') {
				input = document.createElement('select');
				c.options.forEach(function (o) {
					const opt = document.createElement('option');
					opt.value = o[0];
					opt.textContent = o[1];
					input.appendChild(opt);
				});
				if (!c.options.some(function (o) { return o[0] === String(app.params[c.id]); })) {
					app.params[c.id] = c.value;
				}
				input.value = app.params[c.id];
				input.addEventListener('change', function () {
					app.params[c.id] = input.value;
					rebuild();
				});
				el.controls.appendChild(field(c.label, input).wrap);
			} else if (c.type === 'number') {
				input = document.createElement('input');
				input.type = 'number';
				input.min = c.min;
				input.max = c.max;
				input.value = app.params[c.id];
				input.addEventListener('input', function () {
					const v = parseInt(input.value, 10);
					app.params[c.id] = isNaN(v) ? c.value : clamp(v, c.min, c.max);
				});
				el.controls.appendChild(field(c.label, input).wrap);
			} else if (c.type === 'text') {
				input = document.createElement('input');
				input.type = 'text';
				input.maxLength = c.max || 12;
				input.spellcheck = false;
				input.value = app.params[c.id];
				input.addEventListener('input', function () {
					app.params[c.id] = input.value;
					rebuild();
				});
				el.controls.appendChild(field(c.label, input).wrap);
			}
		});

		const spacer = document.createElement('span');
		spacer.className = 'ctl-spacer';
		el.controls.appendChild(spacer);

		if (a.sandbox) {
			a.ops.forEach(function (op, k) {
				el.controls.appendChild(button(op.label, 'btn' + (k === 0 ? ' primary' : ''), function () {
					runOp(op);
				}));
			});
			el.controls.appendChild(button('Reset', 'btn ghost', function () {
				pause();
				rebuild();
			}));
		} else if (a.reroll) {
			el.controls.appendChild(button(a.reroll, 'btn ghost', function () {
				app.seed++;
				pause();
				rebuild();
			}));
		}
	}

	// ── info panel ──
	function highlight(line) {
		return esc(line).replace(/(\/\/.*$)|(for|while|if|else|return|break|and|or|not|in|from|to|down|each|is|until|then|new)|([A-Za-z]\w*)(?=\()|(\d+)/g, function (m, comment, kw, fn, num) {
			if (comment) {
				return '<span class="t-c">' + comment + '</span>';
			}
			if (kw) {
				return '<span class="t-k">' + kw + '</span>';
			}
			if (fn) {
				return '<span class="t-f">' + fn + '</span>';
			}
			return '<span class="t-n">' + num + '</span>';
		});
	}

	function renderInfo() {
		const a = app.algo;
		el.infoName.textContent = a.name;
		el.infoBlurb.textContent = a.blurb;
		el.title.textContent = a.name;
		el.complexity.innerHTML = a.complexity.map(function (pair) {
			return '<div class="chip"><span>' + esc(pair[0]) + '</span><b>' + esc(pair[1]) + '</b></div>';
		}).join('');
		el.code.innerHTML = a.code.map(function (line, i) {
			return '<li data-i="' + i + '"><code>' + highlight(line) + '</code></li>';
		}).join('');
		const kid = DSA.eli5[a.id];
		el.eli5.hidden = !kid;
		if (kid) {
			el.eli5.innerHTML = '<div class="eli5-head"><span class="eli5-emoji">' + kid.emoji + '</span><b>Explain like I\'m 5</b></div>' +
				'<p>' + esc(kid.story) + '</p>' +
				'<ol>' + kid.steps.map(function (st) { return '<li>' + esc(st) + '</li>'; }).join('') + '</ol>' +
				'<p class="eli5-speed"><b>Speed:</b> ' + esc(kid.speed) + '</p>';
		}
		el.legend.innerHTML = (a.legend || []).map(function (pair) {
			return '<span class="key"><i class="sw ' + pair[0] + '"></i>' + esc(pair[1]) + '</span>';
		}).join('');
	}

	// ── building frames ─────────────────────────────────────────────────────
	function setFrames(frames, meta, keepIdx) {
		app.frames = frames;
		app.meta = meta || {};
		const n = frames.length;
		el.scrub.max = Math.max(0, n - 1);
		app.baseDelay = clamp(12000 / n, 4, 700);
		show(keepIdx ? Math.min(app.idx, n - 1) : 0);
	}

	function rebuild() {
		const a = app.algo;
		pause();
		if (a.sandbox) {
			app.sbState = a.init();
			setFrames([a.snapshot(app.sbState)], {});
			return;
		}
		const out = a.build(app.params, DSA.util.rng(app.seed));
		setFrames(out.frames, out.meta);
	}

	function runOp(op) {
		const a = app.algo;
		const value = clamp(Number(app.params.value) || 1, 1, 99);
		const res = op.run(app.sbState, value);
		const before = a.snapshot(app.sbState);
		app.sbState = res.state;
		setFrames([before].concat(res.frames), {});
		play(true);
	}

	// ── showing a frame ─────────────────────────────────────────────────────
	function show(i) {
		const n = app.frames.length;
		i = clamp(i, 0, n - 1);
		app.idx = i;
		const f = app.frames[i];
		app.algo.views.forEach(function (name) {
			DSA.views[name].render(f, app.meta);
		});
		el.narration.textContent = f.msg || '';
		el.narration.classList.toggle('warn', !!f.warn);
		el.scrub.value = i;
		el.scrub.style.background = 'linear-gradient(90deg, var(--accent) ' + (n > 1 ? i / (n - 1) * 100 : 100) + '%, rgba(148,163,184,.25) 0)';
		el.step.textContent = (i + 1) + ' / ' + n;
		const stats = f.stats || {};
		el.stats.innerHTML = Object.keys(stats).map(function (key) {
			return '<div class="stat"><span>' + esc(key) + '</span><b>' + esc(stats[key]) + '</b></div>';
		}).join('');
		const lines = el.code.children;
		const active = Array.isArray(f.line) ? f.line : [f.line];
		for (let k = 0; k < lines.length; k++) {
			lines[k].classList.toggle('on', active.indexOf(k) !== -1);
		}
		el.first.disabled = el.prev.disabled = i === 0;
		el.last.disabled = el.next.disabled = i === n - 1;
	}

	// ── playback ────────────────────────────────────────────────────────────
	function delay() {
		return app.baseDelay / SPEEDS[Number(el.speed.value)];
	}

	function tick(ts) {
		if (!app.playing) {
			return;
		}
		app.acc += ts - app.lastTs;
		app.lastTs = ts;
		const d = delay();
		const steps = Math.floor(app.acc / d);
		if (steps > 0) {
			app.acc -= steps * d;
			show(app.idx + steps);
		}
		if (app.idx >= app.frames.length - 1) {
			pause();
			return;
		}
		app.raf = requestAnimationFrame(tick);
	}

	function play(fromStart) {
		if (app.frames.length < 2) {
			return;
		}
		if (!fromStart && app.idx >= app.frames.length - 1) {
			show(0);
		}
		app.playing = true;
		app.acc = 0;
		app.lastTs = performance.now();
		el.play.classList.add('playing');
		el.play.setAttribute('aria-label', 'Pause');
		cancelAnimationFrame(app.raf);
		app.raf = requestAnimationFrame(tick);
	}

	function pause() {
		app.playing = false;
		cancelAnimationFrame(app.raf);
		el.play.classList.remove('playing');
		el.play.setAttribute('aria-label', 'Play');
	}

	function toggle() {
		if (app.playing) {
			pause();
		} else {
			play(false);
		}
	}

	function stepBy(d) {
		pause();
		show(app.idx + d);
	}

	el.play.addEventListener('click', toggle);
	el.prev.addEventListener('click', function () { stepBy(-1); });
	el.next.addEventListener('click', function () { stepBy(1); });
	el.first.addEventListener('click', function () { pause(); show(0); });
	el.last.addEventListener('click', function () { pause(); show(app.frames.length - 1); });
	el.scrub.addEventListener('input', function () {
		pause();
		show(Number(el.scrub.value));
	});
	el.speed.addEventListener('input', function () {
		el.speedLabel.textContent = SPEEDS[Number(el.speed.value)] + '×';
	});

	document.addEventListener('keydown', function (ev) {
		const tag = ev.target.tagName;
		if (tag === 'INPUT' && ev.target.type !== 'range' || tag === 'SELECT' || ev.metaKey || ev.ctrlKey || ev.altKey) {
			return;
		}
		if (ev.key === ' ' && tag !== 'BUTTON') {
			ev.preventDefault();
			toggle();
		} else if (ev.key === 'ArrowRight') {
			ev.preventDefault();
			stepBy(1);
		} else if (ev.key === 'ArrowLeft') {
			ev.preventDefault();
			stepBy(-1);
		} else if (ev.key === 'Home') {
			ev.preventDefault();
			pause();
			show(0);
		} else if (ev.key === 'End') {
			ev.preventDefault();
			pause();
			show(app.frames.length - 1);
		}
	});

	DSA.onGridEdit = function () {
		cancelAnimationFrame(app.gridRaf);
		app.gridRaf = requestAnimationFrame(rebuild);
	};

	// ── selecting an algorithm ──────────────────────────────────────────────
	function selectAlgo(a) {
		pause();
		app.algo = a;
		Object.keys(viewEls).forEach(function (name) {
			const used = a.views.indexOf(name) !== -1;
			viewEls[name].hidden = !used;
			DSA.views[name].reset();
		});
		$('stage').classList.toggle('solo', a.views.length === 1 && a.views[0] === 'strip');
		document.body.dataset.group = a.group;
		try {
			history.replaceState(null, '', '#' + a.id);
		} catch (e) {
			// file:// or sandboxed frames can refuse history updates
		}
		renderNav();
		renderControls();
		renderInfo();
		rebuild();
	}

	const wanted = DSA.algos.filter(function (a) {
		return a.id === location.hash.slice(1);
	})[0];
	el.speed.max = SPEEDS.length - 1;
	el.speed.value = 3;
	el.speedLabel.textContent = '1×';
	selectAlgo(wanted || DSA.algos[0]);
})();
