'use strict';

// Word pools by difficulty. Easy: short everyday words. Medium: common 5-7 letter words. Hard: long (9+), spelling-heavy words.
const split = (s) => s.trim().split(/\s+/);
const WORDS = {
	easy: split(`the and for are but not you all can her was one our out day get has him his how man new now old see two
way who boy did its let put say she too use time year work life home hand part word look come give good help keep last
long make many move much name need next only open over play read same seem show side take tell than that them then they
this turn very want well went were what when will with your book city door face fact fall fast feel find fire five food
four free full game girl gold grow hair half hard head hear high hold hope hour idea join just kind know land late lead
left less line live love mind miss more most near nice note once page pick plan road rock room rule safe seat send
ship shop sing sleep slow snow song soon star stay stop sure talk team tree true walk warm wash wind wish wood yard`),
	medium: split(`house world still great small group point water right place thing think night going light mother father
family school system number always around change follow letter minute moment second should simple spring street strong
summer morning nothing picture problem program reason answer animal bridge camera garden energy engine forest friend
future growth health island kitchen library machine market message mirror monkey nature office orange planet pocket
rabbit reader season shadow silver spirit station stream studio sunset teacher ticket travel wonder window winter yellow
balance battery blanket button candle castle circle client closet coffee comedy corner cotton county custom danger dinner
doctor double dragon eleven flower guitar hammer harbor helmet hunter jacket jungle ladder lesson little magnet member
memory method middle modern muscle napkin normal object online parent people pepper photo player pirate proud public
puzzle quality quiet random record repair rhythm rocket safety salad sample screen secret senior signal sister
speed spider square stable stone story sugar switch table tablet target thread thunder tomato tunnel volume walnut weekend`),
	hard: split(`necessary beautiful conscience occurrence entrepreneur acquaintance bureaucracy environment government
immediately independent knowledge maintenance miscellaneous opportunity particularly perseverance phenomenon
pronunciation psychology restaurant simultaneous sophisticated temperature unfortunately vocabulary embarrassment
experience extraordinary fluorescent guarantee hierarchy hypothesis infrastructure jurisdiction laboratory legitimate
mathematics mischievous neighborhood parliament philosophy photography possibility procedure professional
recommendation responsibility sacrifice subsequently technology thoroughly transportation unnecessary vulnerability
worthwhile accommodate achievement acknowledge adolescence algorithm architecture authentic catastrophe
characteristic circumstances communication competition concentration congratulations consciousness controversial
correspondence democratic determination development disappointment discipline distinguished electricity enthusiasm
establishment exaggerate exceptional imagination implementation intelligence international investigation
manufacturing memorable negotiation organization pharmaceutical presentation qualification quarantine questionnaire
reconciliation refrigerator resurrection significance spontaneous strengthening surveillance synchronize
unconditional understanding unpredictable vegetarian ventriloquist weatherproof wholesome zoological`)
};
const DIFFS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

const ICONS = {
	sprint: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
	razor: '<path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>',
	rain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
	orbit: '<path d="M20.341 6.484A10 10 0 0 1 10.266 21.85"/><path d="M3.659 17.516A10 10 0 0 1 13.74 2.152"/><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/>',
	zen: '<path d="M11 20a10 10 0 0 0 10-10 25.9 25.9 0 0 0-1.04-7.281 1 1 0 0 0-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0 0 11 20"/><path d="M2 21a5 5 0 0 1 2.911-4.544C7.613 15.212 8.351 15.24 11 13"/>'
};

const MODES = {
	sprint: { name: 'Sprint', blurb: 'Beat the clock. Pure speed.', unit: 'wpm' },
	razor: { name: 'Razor', blurb: 'One typo and it’s over.', unit: 'chars' },
	rain: { name: 'Rain', blurb: 'Words fall. Vaporize them.', unit: 'pts', arena: true },
	orbit: { name: 'Orbit', blurb: 'Words spiral into the core.', unit: 'pts', arena: true },
	zen: { name: 'Zen', blurb: 'No clock. No fail. Just flow.', unit: 'wpm', noBest: true }
};

const $ = (s) => document.querySelector(s);
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const app = $('#app');

/* ── Storage ───────────────────────────────────────────────── */
const STORE_KEY = 'keystorm:v1';
const blank = () => ({ runs: [], keys: {}, best: {}, len: 30, diff: 'medium' });
let store = (() => {
	try {
		const s = { ...blank(), ...JSON.parse(localStorage.getItem(STORE_KEY)) };
		// Bests saved before difficulty existed were all "medium".
		for (const k of Object.keys(s.best)) if (!k.includes(':')) { s.best[k + ':medium'] = s.best[k]; delete s.best[k]; }
		return s;
	} catch { return blank(); }
})();
const pool = () => WORDS[store.diff] || WORDS.medium;
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* private mode: run works, stats just won't persist */ } };

/* ── FX engine: aurora + warp stars + particles + shockwaves ── */
const cv = $('#fx');
const cx = cv.getContext('2d');
let W = 0, H = 0;
let heat = 0.12, energy = 0, hue = 210, shakeAmt = 0;
const parts = [];
const rings = [];
const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8 }));

function resize() {
	const dpr = Math.min(devicePixelRatio || 1, 2);
	W = innerWidth; H = innerHeight;
	cv.width = W * dpr; cv.height = H * dpr;
	cx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burst(x, y, n, { h = hue, speed = 260, g = 420, life = 0.7, ch = '' } = {}) {
	if (reduce) n = Math.ceil(n / 4);
	for (let i = 0; i < n && parts.length < 1500; i++) {
		const a = Math.random() * 6.283, s = speed * (0.3 + Math.random() * 0.7);
		parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.25, g, h, ch, life, age: 0, r: 1 + Math.random() * 2.2, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, size: 22 });
	}
}
const floater = (x, y, ch, h = hue) => parts.push({ x, y, vx: 0, vy: -70, g: 0, h, ch, life: 0.9, age: 0, r: 0, rot: 0, vr: 0, size: 26 });
const ring = (x, y, max = 200, h = hue) => rings.push({ x, y, max, h, age: 0 });
const shake = (n) => { if (!reduce) shakeAmt = Math.max(shakeAmt, n); };

function flash(color) {
	$('#vig').style.setProperty('--vc', color);
	$('#vig').animate([{ opacity: 0.6 }, { opacity: 0 }], { duration: 420 });
}

// Big centered text used for the countdown and streak milestones.
function pop(text, ms = 800) {
	const el = $('#toast');
	el.textContent = text;
	el.animate([
		{ opacity: 0, transform: 'translate(-50%,-50%) scale(2.6)', filter: 'blur(22px)' },
		{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)', filter: 'blur(0)', offset: 0.3 },
		{ opacity: 0, transform: 'translate(-50%,-70%) scale(0.85)', filter: 'blur(8px)' }
	], { duration: ms, easing: 'cubic-bezier(.2,.8,.2,1)' });
}

function drawFx(now, dt) {
	cx.clearRect(0, 0, W, H);
	const t = now / 1000;

	cx.globalCompositeOperation = 'lighter';
	for (let i = 0; i < 3; i++) {
		const px = W * (0.5 + 0.38 * Math.sin(t * 0.13 + i * 2.1)), py = H * (0.45 + 0.3 * Math.cos(t * 0.11 + i * 1.7));
		const g = cx.createRadialGradient(px, py, 0, px, py, Math.max(W, H) * (0.35 + 0.15 * heat));
		g.addColorStop(0, `hsla(${hue + i * 40},90%,55%,${0.1 + 0.13 * heat})`);
		g.addColorStop(1, 'hsla(0,0%,0%,0)');
		cx.fillStyle = g;
		cx.fillRect(0, 0, W, H);
	}
	// Stars stretch into warp streaks as heat rises.
	for (const s of stars) {
		s.y += dt * (0.01 + 0.09 * heat) * s.z;
		if (s.y > 1) s.y -= 1;
		cx.fillStyle = `hsla(${hue},80%,82%,${0.15 + 0.5 * s.z * (0.5 + heat)})`;
		cx.fillRect(s.x * W, s.y * H, 1 + s.z * 1.5, 1 + s.z * 1.5 + heat * s.z * 26);
	}

	cx.globalCompositeOperation = 'source-over';
	if ((state === 'play' || state === 'end') && MODES[run.mode].arena) arena.draw(dt);

	cx.globalCompositeOperation = 'lighter';
	for (let i = parts.length - 1; i >= 0; i--) {
		const p = parts[i];
		p.age += dt;
		if (p.age >= p.life) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
		p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
		const a = 1 - p.age / p.life;
		cx.fillStyle = `hsla(${p.h},100%,68%,${a})`;
		if (p.ch) {
			cx.save();
			cx.translate(p.x, p.y); cx.rotate(p.rot);
			cx.font = `700 ${p.size}px "JetBrains Mono", monospace`;
			cx.textAlign = 'center'; cx.textBaseline = 'middle';
			cx.fillText(p.ch, 0, 0);
			cx.restore();
		} else {
			cx.beginPath();
			cx.arc(p.x, p.y, p.r * a + 0.3, 0, 6.283);
			cx.fill();
		}
	}
	for (let i = rings.length - 1; i >= 0; i--) {
		const r = rings[i];
		r.age += dt;
		const k = r.age / 0.65;
		if (k >= 1) { rings[i] = rings[rings.length - 1]; rings.pop(); continue; }
		cx.strokeStyle = `hsla(${r.h},100%,70%,${1 - k})`;
		cx.lineWidth = 1 + 4 * (1 - k);
		cx.beginPath();
		cx.arc(r.x, r.y, r.max * (1 - (1 - k) ** 3), 0, 6.283);
		cx.stroke();
	}
	cx.globalCompositeOperation = 'source-over';

	if (shakeAmt > 0.1) {
		app.style.transform = `translate(${(Math.random() - 0.5) * shakeAmt}px,${(Math.random() - 0.5) * shakeAmt}px)`;
		shakeAmt *= Math.exp(-dt * 9);
	} else if (shakeAmt) {
		shakeAmt = 0;
		app.style.transform = '';
	}
}

/* ── Session ───────────────────────────────────────────────── */
let state = 'menu'; // menu | count | play | end | results | stats
let run = null;
const now = () => performance.now();
const elapsed = () => (run.t0 ? (now() - run.t0) / 1000 : 0);
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const go = (screen) => { document.body.dataset.screen = screen; state = screen; };

const bestKey = (id) => `${id === 'sprint' ? 'sprint' + store.len : id}:${store.diff}`;
const newRun = (mode) => ({ mode, key: bestKey(mode), t0: 0, ks: [], ok: 0, bad: 0, net: 0, streak: 0, maxStreak: 0, score: 0, over: false });

// Every keystroke in every mode funnels through here: log it, feed the heat meter, fire combo milestones.
function hit(want, ok) {
	if (!run.t0) run.t0 = now();
	run.ks.push([now() - run.t0, ok ? 1 : 0, want]);
	if (ok) {
		run.ok++; run.streak++;
		run.maxStreak = Math.max(run.maxStreak, run.streak);
		energy += 0.2 * (1 - energy);
		if (run.streak % 10 === 0) milestone();
	} else {
		run.bad++; run.streak = 0; energy *= 0.5;
		flash('#ff4d6d'); shake(6);
	}
}

function milestone() {
	const big = run.streak % 50 === 0;
	pop(`${run.streak} combo`, big ? 1000 : 700);
	ring(W / 2, H * 0.42, big ? Math.max(W, H) * 0.6 : 260);
	energy = Math.min(1, energy + 0.25);
	flash(`hsl(${hue} 100% 60%)`);
	if (big) shake(14);
}

function calc(sec = elapsed()) {
	const m = Math.max(sec, 1e-3) / 60, tot = run.ok + run.bad;
	return { wpm: sec < 1 ? 0 : run.net / 5 / m, raw: sec < 1 ? 0 : tot / 5 / m, acc: tot ? (run.ok / tot) * 100 : 100 };
}

const hud = { time: $('#hTime'), wpm: $('#hWpm'), acc: $('#hAcc'), streak: $('#hStreak'), score: $('#hScore'), lives: $('#hLives') };
function setText(el, v) {
	v = String(v);
	if (el.textContent === v) return false;
	el.textContent = v;
	return true;
}
function updateHud() {
	const s = calc(), sec = elapsed();
	setText(hud.time, run.mode === 'sprint' ? Math.max(0, Math.ceil(store.len - sec)) : fmtTime(sec));
	setText(hud.wpm, Math.round(s.wpm));
	setText(hud.acc, Math.round(s.acc));
	if (setText(hud.streak, run.streak) && run.streak) hud.streak.animate([{ transform: 'scale(1.45)', color: 'var(--accent)' }, { transform: 'scale(1)' }], 220);
	setText(hud.score, run.score);
}

/* ── Stream engine (Sprint / Razor / Zen) ──────────────────── */
const stream = {
	el: $('#stream'), inner: $('#streamInner'), caret: $('#caret'), chars: [], text: '', i: 0,
	init() {
		this.inner.querySelectorAll('.w').forEach((n) => n.remove());
		this.chars = []; this.text = ''; this.i = 0;
		this.more(40);
		this.place();
	},
	more(n = 30) {
		for (let k = 0; k < n; k++) {
			let word = rand(pool());
			while (word === this.prev) word = rand(pool());
			this.prev = word;
			const w = document.createElement('span');
			w.className = 'w';
			for (const ch of word + ' ') {
				const c = document.createElement('span');
				c.className = 'c'; c.textContent = ch;
				w.append(c); this.chars.push(c);
			}
			this.inner.append(w);
			this.text += word + ' ';
		}
	},
	// Glide the caret to the next char; scroll so the active line stays in the middle row.
	place() {
		const c = this.chars[this.i], lh = parseFloat(getComputedStyle(this.inner).lineHeight) || 48;
		this.caret.style.transform = `translate(${c.offsetLeft}px, ${c.offsetTop}px)`;
		this.inner.style.transform = `translateY(${-Math.max(0, Math.round(c.offsetTop / lh) - 1) * lh}px)`;
	},
	key(k) {
		if (k === 'Backspace') {
			if (run.mode === 'razor' || !this.i) return;
			const c = this.chars[--this.i];
			if (c.classList.contains('ok')) run.net--;
			c.className = 'c';
			this.place();
			return;
		}
		if (k.length !== 1) return;
		const want = this.text[this.i], ok = k === want, c = this.chars[this.i];
		hit(want, ok);
		c.className = ok ? 'c ok' : 'c bad';
		if (ok) run.net++;
		const r = c.getBoundingClientRect();
		burst(r.left + r.width / 2, r.top + r.height / 2, ok ? 5 : 10, { h: ok ? hue : 350, speed: ok ? 170 : 240, life: 0.5 });
		this.i++;
		if (this.text.length - this.i < 80) this.more();
		this.place();
		if (!ok && run.mode === 'razor') finish('dead');
	}
};

/* ── Finishing a run + analytics math ──────────────────────── */
// Net WPM per second on a 3s rolling window, plus error counts per second.
function series(sec) {
	const n = Math.max(1, Math.ceil(sec)), wpm = [], errs = [];
	for (let s = 1; s <= n; s++) {
		const lo = Math.max(0, s - 3) * 1000, hi = s * 1000;
		let ok = 0, bad = 0;
		for (const [t, good] of run.ks) {
			if (t >= lo && t < hi) ok += good;
			if (t >= hi - 1000 && t < hi) bad += 1 - good;
		}
		wpm.push(ok / 5 / ((hi - lo) / 60000));
		errs.push(bad);
	}
	return { wpm, errs };
}

// Consistency = 100 - coefficient of variation of the per-second WPM.
function consistency(v) {
	const m = v.reduce((a, b) => a + b, 0) / v.length;
	if (!m) return 0;
	const sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
	return clamp(100 - (sd / m) * 100, 0, 100);
}

// Per-key aggregates for the heatmap: presses, misses, and time-since-previous-key on hits.
function mergeKeys() {
	let prev = null;
	for (const [t, ok, ch] of run.ks) {
		if (ch) {
			const k = (store.keys[ch] ||= { n: 0, e: 0, ms: 0, c: 0 });
			k.n++;
			if (!ok) k.e++;
			else if (prev !== null && t - prev < 1500) { k.ms += t - prev; k.c++; }
		}
		prev = t;
	}
}

function finish(why) {
	if (run.over) return;
	run.over = true; state = 'end';
	const m = MODES[run.mode], sec = why === 'time' ? store.len : elapsed();
	const s = calc(sec), ser = series(sec);
	const res = {
		t: Date.now(), mode: run.mode, key: run.key, diff: store.diff, dur: +sec.toFixed(1),
		wpm: +s.wpm.toFixed(1), raw: +s.raw.toFixed(1), acc: +s.acc.toFixed(1), cons: Math.round(consistency(ser.wpm)),
		ok: run.ok, bad: run.bad, streak: run.maxStreak, unit: m.unit,
		score: m.arena ? run.score : run.mode === 'razor' ? run.ok : Math.round(s.wpm)
	};
	const keep = (why === 'quit' ? run.ok + run.bad >= 1 : run.ok + run.bad >= 5) && sec >= 0.5;
	res.pb = keep && !m.noBest && res.score > (store.best[run.key] || 0);
	if (keep) {
		if (res.pb) store.best[run.key] = res.score;
		store.runs = [...store.runs, res].slice(-200);
		mergeKeys();
		save();
	}
	if (why === 'dead') {
		flash('#ff4d6d'); shake(26);
		burst(W / 2, H / 2, 90, { h: 350, speed: 620, life: 1 });
		ring(W / 2, H / 2, Math.max(W, H) * 0.7, 350);
	}
	setTimeout(() => { if (state === 'end') showResults(res, ser); }, why === 'dead' ? 1000 : 400);
}

let gid = 0;
function chart(vals, { errs = [], tips = [], w = clamp(innerWidth - 80, 260, 640), h = 190 } = {}) {
	if (!vals.length) return '<p class="empty">No data yet.</p>';
	const id = 'g' + ++gid, n = vals.length, top = Math.max(20, ...vals) * 1.12;
	const px = (i) => (n > 1 ? 30 + (i * (w - 44)) / (n - 1) : w / 2);
	const py = (v) => h - 22 - (v / top) * (h - 40);
	const pts = vals.map((v, i) => [px(i).toFixed(1), py(v).toFixed(1)]);
	const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
	const grid = [0, 0.5, 1].map((f) => `<line class="grid" x1="30" x2="${w - 14}" y1="${py(top * f).toFixed(1)}" y2="${py(top * f).toFixed(1)}"/><text x="0" y="${(py(top * f) + 3).toFixed(1)}">${Math.round(top * f)}</text>`).join('');
	const dots = pts.map(([x, y], i) => (errs[i] ? `<circle class="err" cx="${x}" cy="${y}" r="4"><title>${errs[i]} error(s)</title></circle>` : tips[i] ? `<circle class="dot" cx="${x}" cy="${y}" r="3.5"><title>${tips[i]}</title></circle>` : '')).join('');
	return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Words per minute chart">
		<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.3"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>
		${grid}
		<path class="area" d="${d} L${pts[n - 1][0]} ${h - 22} L${pts[0][0]} ${h - 22}Z" fill="url(#${id})"/>
		<path class="line" pathLength="1" d="${d}"/>${dots}</svg>`;
}

function countUp(el, to, ms = 900) {
	if (reduce) { el.textContent = to; return; }
	const t0 = now();
	(function f(t) {
		const k = Math.min(1, (t - t0) / ms);
		el.textContent = Math.round(to * (1 - (1 - k) ** 3));
		if (k < 1) requestAnimationFrame(f);
	})(t0);
}

function showResults(res, ser) {
	go('results');
	$('#rMode').textContent = [MODES[res.mode].name, res.mode === 'sprint' && store.len + 's', DIFFS[res.diff]].filter(Boolean).join(' · ');
	$('#rUnit').textContent = res.unit;
	$('#rPb').hidden = !res.pb;
	countUp($('#rScore'), res.score);
	const kpis = [['accuracy', res.acc.toFixed(1) + '%'], ['raw wpm', Math.round(res.raw)], ['consistency', res.cons + '%'], ['best combo', res.streak], ['time', fmtTime(res.dur)], ['hits / misses', `${res.ok} / ${res.bad}`]];
	$('#rKpis').innerHTML = kpis.map(([l, v], n) => `<div class="kpi" style="--n:${n}"><b>${v}</b><small>${l}</small></div>`).join('');
	$('#rChart').innerHTML = '<h3>WPM over time · red dots are misses</h3>' + chart(ser.wpm, { errs: ser.errs });
	if (res.pb) {
		for (let i = 0; i < 6; i++) {
			setTimeout(() => { if (state === 'results') burst(W * (0.15 + 0.7 * Math.random()), H * 0.8, 40, { h: Math.random() * 360, speed: 640, g: 720, life: 1.4 }); }, 800 + i * 140);
		}
	}
}

function start(mode) {
	document.activeElement?.blur();
	run = newRun(mode);
	const isArena = !!MODES[mode].arena, token = run;
	$('#play').classList.toggle('arena', isArena);
	$('#playHint').innerHTML = `<kbd>esc</kbd> finish & save · <kbd>tab</kbd> restart`;
	parts.length = 0; rings.length = 0; energy = 0;
	go('play');
	state = 'count';
	stream.el.classList.add('pre');
	(isArena ? arena : stream).init(mode);
	updateHud();
	let n = 3;
	const step = () => {
		if (run !== token || state !== 'count') return;
		if (n) { pop(String(n), 520); n--; setTimeout(step, 550); return; }
		pop('GO', 600);
		stream.el.classList.remove('pre');
		state = 'play';
		if (isArena) run.t0 = now();
	};
	step();
}

/* ── Arena engine (Rain + Orbit share everything but motion) ─ */
const FONT = '600 24px "JetBrains Mono", ui-monospace, monospace';
if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };

const arena = {
	kind: 'rain', words: [], lock: null, spawnIn: 0, level: 1, killed: 0, lives: 3, beam: 0, flash: 0, cw: 14,
	init(kind) {
		Object.assign(this, { kind, words: [], lock: null, spawnIn: 0.3, level: 1, killed: 0, lives: 3, beam: 0, flash: 0 });
		this.hearts();
	},
	hearts() { hud.lives.innerHTML = `${'♥'.repeat(this.lives)}<i>${'♥'.repeat(3 - this.lives)}</i>`; },
	origin() { return this.kind === 'rain' ? [W / 2, H - 48] : [W / 2, H * 0.56]; },
	floorY() { return H - 96; },
	// 0 = just spawned, 1 = about to hit.
	danger(w) { return this.kind === 'rain' ? w.y / this.floorY() : 1 - (w.r - 0.14) / 0.86; },
	place(w) {
		const [ox, oy] = this.origin();
		w.x = ox + Math.cos(w.a) * w.r * W * 0.34;
		w.y = oy + Math.sin(w.a) * w.r * H * 0.32;
	},
	spawn() {
		// Word length ramps up with level, starting just above the shortest word in the pool.
		const P = pool(), maxLen = Math.min(...P.map((w) => w.length)) + 1 + Math.min(8, Math.floor(this.level / 2) + Math.floor(Math.random() * 3));
		let text = rand(P);
		// Re-roll long words and words sharing a first letter with something on screen, so targeting is never ambiguous.
		for (let k = 0; k < 40 && (text.length > maxLen || this.words.some((o) => o.text[0] === text[0])); k++) text = rand(P);
		const w = { text, typed: 0, x: 0, y: 0, age: 0, shake: 0, v: 0, a: 0, r: 1, spin: 0 };
		if (this.kind === 'rain') {
			const half = (text.length * this.cw) / 2 + 26;
			let far = -1;
			for (let k = 0; k < 6; k++) {
				const x = half + Math.random() * Math.max(1, W - 2 * half);
				const d = Math.min(1e9, ...this.words.filter((o) => o.y < 230).map((o) => Math.abs(o.x - x)));
				if (d > far) { far = d; w.x = x; }
			}
			w.y = 130;
			w.v = (46 + this.level * 12) * (0.85 + Math.random() * 0.3);
		} else {
			let far = -1;
			for (let k = 0; k < 6; k++) {
				const a = Math.random() * 6.283;
				const d = Math.min(9, ...this.words.filter((o) => o.r > 0.7).map((o) => Math.abs(((a - o.a + 9.425) % 6.283) - 3.1416)));
				if (d > far) { far = d; w.a = a; }
			}
			w.v = (0.05 + this.level * 0.012) * (0.85 + Math.random() * 0.3);
			w.spin = (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.25);
			this.place(w);
		}
		this.words.push(w);
	},
	remove(w) {
		this.words = this.words.filter((o) => o !== w);
		if (this.lock === w) this.lock = null;
	},
	update(dt) {
		this.spawnIn -= dt;
		if (this.spawnIn <= 0) { this.spawn(); this.spawnIn = Math.max(0.7, 2.4 - this.level * 0.16); }
		this.beam *= Math.exp(-dt * 9);
		this.flash *= Math.exp(-dt * 5);
		for (const w of this.words.slice()) {
			w.age += dt;
			w.shake = Math.max(0, w.shake - dt * 5);
			if (this.kind === 'rain') {
				w.y += w.v * dt;
				if (w.y > this.floorY()) this.miss(w);
			} else {
				w.a += w.spin * dt; w.r -= w.v * dt;
				this.place(w);
				if (w.r < 0.14) this.miss(w);
			}
		}
	},
	miss(w) {
		this.remove(w);
		this.lives--; this.hearts();
		this.flash = 1; run.streak = 0; energy *= 0.3;
		flash('#ff4d6d'); shake(16);
		burst(w.x, w.y, 40, { h: 350, speed: 420 });
		ring(w.x, w.y, 160, 350);
		if (this.lives <= 0) finish('dead');
	},
	kill(w) {
		const pts = w.text.length * (1 + Math.floor(run.streak / 10));
		run.score += pts; run.net += w.text.length;
		[...w.text].forEach((ch, i) => burst(w.x + (i - w.text.length / 2) * this.cw, w.y, 1, { ch, speed: 380, g: 500, life: 0.9 }));
		burst(w.x, w.y, 34, { speed: 460, life: 0.8 });
		ring(w.x, w.y, 130 + w.text.length * 8);
		floater(w.x, w.y - 26, '+' + pts);
		shake(4 + w.text.length);
		this.remove(w);
		if (++this.killed % 10 === 0) {
			this.level++;
			pop('level ' + this.level, 900);
			ring(...this.origin(), Math.max(W, H) * 0.5);
		}
	},
	key(k) {
		if (k.length !== 1) return;
		let w = this.lock;
		if (!w) {
			// Lock the matching word that is closest to hurting you.
			w = this.words.filter((o) => o.text[0] === k).sort((a, b) => this.danger(b) - this.danger(a))[0];
			if (!w) { hit('', false); return; }
			this.lock = w;
		} else if (w.text[w.typed] !== k) {
			hit(w.text[w.typed], false);
			w.shake = 1;
			return;
		}
		hit(k, true);
		w.typed++; this.beam = 1;
		burst(w.x, w.y, 6, { speed: 200, life: 0.45 });
		if (w.typed === w.text.length) this.kill(w);
	},
	draw(dt) {
		const [ox, oy] = this.origin(), rain = this.kind === 'rain', t = now() / 1000;
		cx.font = FONT;
		this.cw = cx.measureText('m').width;

		// Scenery: a glowing floor for Rain, concentric orbits + pulsing core for Orbit.
		if (rain) {
			const fy = this.floorY(), g = cx.createLinearGradient(0, fy, 0, H);
			g.addColorStop(0, `hsla(${hue},100%,60%,${0.1 + 0.4 * this.flash})`);
			g.addColorStop(1, 'hsla(0,0%,0%,0)');
			cx.fillStyle = g; cx.fillRect(0, fy, W, H - fy);
			cx.strokeStyle = `hsla(${this.flash > 0.05 ? 350 : hue},100%,65%,${0.3 + 0.5 * this.flash})`;
			cx.lineWidth = 1.5;
			cx.beginPath(); cx.moveTo(W * 0.05, fy); cx.lineTo(W * 0.95, fy); cx.stroke();
		} else {
			cx.setLineDash([3, 9]); cx.lineWidth = 1;
			for (const f of [1, 0.66, 0.33]) {
				cx.strokeStyle = `hsla(${hue},70%,70%,${0.05 + 0.1 * (1 - f)})`;
				cx.beginPath(); cx.ellipse(ox, oy, W * 0.34 * f, H * 0.32 * f, 0, 0, 6.283); cx.stroke();
			}
			cx.setLineDash([]);
		}
		const cr = rain ? 9 : 24 + 4 * Math.sin(t * 3) + 14 * this.flash;
		const cg = cx.createRadialGradient(ox, oy, 0, ox, oy, cr * 3);
		cg.addColorStop(0, `hsla(${this.flash > 0.05 ? 350 : hue},100%,75%,.95)`);
		cg.addColorStop(0.35, `hsla(${hue},100%,60%,.35)`);
		cg.addColorStop(1, 'hsla(0,0%,0%,0)');
		cx.fillStyle = cg;
		cx.beginPath(); cx.arc(ox, oy, cr * 3, 0, 6.283); cx.fill();

		if (this.lock) {
			cx.strokeStyle = `hsla(${hue},100%,72%,${0.2 + 0.75 * this.beam})`;
			cx.lineWidth = 1 + 4 * this.beam;
			cx.shadowColor = cx.strokeStyle; cx.shadowBlur = 18;
			cx.beginPath(); cx.moveTo(ox, oy); cx.lineTo(this.lock.x, this.lock.y); cx.stroke();
			cx.shadowBlur = 0;
		}

		cx.textAlign = 'left'; cx.textBaseline = 'middle';
		for (const w of this.words) {
			const d = clamp(this.danger(w), 0, 1), locked = w === this.lock;
			const tw = w.text.length * this.cw, pw = tw + 28, x = w.x + (w.shake ? (Math.random() - 0.5) * 9 : 0);
			cx.globalAlpha = Math.min(1, w.age / 0.35);
			cx.beginPath(); cx.roundRect(x - pw / 2, w.y - 20, pw, 40, 12);
			cx.fillStyle = 'rgba(10,10,20,.78)'; cx.fill();
			// Border walks blue → green → red as the word closes in.
			cx.strokeStyle = `hsla(${Math.round(210 - 210 * d * d)},100%,${locked ? 72 : 60}%,${locked ? 1 : 0.55})`;
			cx.lineWidth = locked ? 2 : 1;
			if (locked) { cx.shadowColor = cx.strokeStyle; cx.shadowBlur = 22; }
			cx.stroke(); cx.shadowBlur = 0;
			const done = w.text.slice(0, w.typed);
			cx.fillStyle = `hsl(${hue},100%,74%)`;
			cx.fillText(done, x - tw / 2, w.y + 1);
			cx.fillStyle = '#eceff8';
			cx.fillText(w.text.slice(w.typed), x - tw / 2 + done.length * this.cw, w.y + 1);
		}
		cx.globalAlpha = 1;
	}
};

/* ── Menu ──────────────────────────────────────────────────── */
function renderMenu() {
	$('#modes').innerHTML = Object.entries(MODES).map(([id, m], i) => `
		<button class="card" type="button" data-mode="${id}">
			<kbd>${i + 1}</kbd>
			<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]}</svg>
			<h3>${m.name}</h3>
			<p>${m.blurb}</p>
			<span class="best">${m.noBest ? 'endless' : store.best[bestKey(id)] ? `best <b>${store.best[bestKey(id)]}</b> ${m.unit}` : 'no best yet'}</span>
		</button>`).join('');
	document.querySelectorAll('.card').forEach((c) => c.addEventListener('pointerleave', () => {
		c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg');
	}));
	document.querySelectorAll('[data-len]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.len === store.len));
	document.querySelectorAll('[data-diff]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.diff === store.diff));
}

$('#modes').addEventListener('pointermove', (e) => {
	const c = e.target.closest('.card');
	if (!c) return;
	const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
	c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
	if (!reduce) { c.style.setProperty('--rx', (0.5 - y) * 10 + 'deg'); c.style.setProperty('--ry', (x - 0.5) * 12 + 'deg'); }
});
$('#modes').addEventListener('click', (e) => { const c = e.target.closest('[data-mode]'); if (c) start(c.dataset.mode); });
document.querySelectorAll('[data-len]').forEach((b) => b.addEventListener('click', () => { store.len = +b.dataset.len; save(); renderMenu(); }));
document.querySelectorAll('[data-diff]').forEach((b) => b.addEventListener('click', () => { store.diff = b.dataset.diff; save(); renderMenu(); }));

/* ── Stats ─────────────────────────────────────────────────── */
let metric = 'speed';
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', ' '];
const BESTS = [['Sprint 15s', 'sprint15', 'wpm'], ['Sprint 30s', 'sprint30', 'wpm'], ['Sprint 60s', 'sprint60', 'wpm'], ['Razor', 'razor', 'chars'], ['Rain', 'rain', 'pts'], ['Orbit', 'orbit', 'pts']];

function renderKeys() {
	const cell = (ch) => {
		const k = store.keys[ch];
		let v = null;
		if (metric === 'err') { if (k && k.n >= 5) v = k.e / k.n; } else if (k && k.c >= 5) v = k.ms / k.c;
		const label = v === null ? '' : metric === 'err' ? Math.round(v * 100) + '%' : Math.round(v) + 'ms';
		// Green = clean/fast, red = needs work.
		const t = v === null ? 0 : clamp(metric === 'err' ? v / 0.12 : (v - 130) / 320, 0, 1);
		const style = v === null ? '' : ` style="--k:hsl(${Math.round(150 - 150 * t)} 80% 45% / ${0.25 + 0.55 * t})"`;
		const name = ch === ' ' ? 'space' : ch;
		return `<div class="key${ch === ' ' ? ' space' : ''}"${style} title="${name}: ${label || 'not enough data yet'}">${name}<small>${label}</small></div>`;
	};
	$('#sKeys').innerHTML = ROWS.map((r) => `<div>${[...r].map(cell).join('')}</div>`).join('');
	$('#sKeyHint').textContent = (metric === 'err' ? 'Share of presses you missed' : 'Average ms since your previous key') + ' · green is good, red needs work · needs 5+ samples per key';
	document.querySelectorAll('[data-m]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === metric));
}

function renderStats() {
	const r = store.runs, sum = (f) => r.reduce((a, x) => a + f(x), 0);
	const kpis = r.length ? [['runs', r.length], ['time typed', fmtTime(sum((x) => x.dur))], ['keystrokes', sum((x) => x.ok + x.bad).toLocaleString()], ['avg accuracy', (sum((x) => x.acc) / r.length).toFixed(1) + '%'], ['best wpm', Math.round(Math.max(...r.map((x) => x.wpm)))]] : [];
	$('#sKpis').innerHTML = kpis.map(([l, v], n) => `<div class="kpi" style="--n:${n}"><b>${v}</b><small>${l}</small></div>`).join('');
	const recent = r.slice(-30), date = (x) => new Date(x.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	$('#sChart').innerHTML = r.length
		? chart(recent.map((x) => x.wpm), { tips: recent.map((x) => `${MODES[x.mode].name} · ${Math.round(x.wpm)} wpm · ${x.acc.toFixed(0)}% · ${date(x)}`) })
		: '<p class="empty">Finish a run to see your progress here.</p>';
	$('#sBestTitle').textContent = `Personal bests · ${DIFFS[store.diff]}`;
	$('#sBest').innerHTML = BESTS.map(([l, k, u]) => `<li><span>${l}</span><b>${store.best[k + ':' + store.diff] ? store.best[k + ':' + store.diff] + ' ' + u : '—'}</b></li>`).join('');
	$('#sRuns').innerHTML = r.length
		? '<tr><th>Mode</th><th>Level</th><th>WPM</th><th>Acc</th><th>Score</th><th>Date</th></tr>' + r.slice(-8).reverse().map((x) => `<tr><td>${MODES[x.mode].name}</td><td>${DIFFS[x.diff] || 'Medium'}</td><td>${Math.round(x.wpm)}</td><td>${x.acc.toFixed(1)}%</td><td>${x.score} ${x.unit}</td><td>${date(x)}</td></tr>`).join('')
		: '<tr><td class="empty">No runs yet.</td></tr>';
	renderKeys();
}

document.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { metric = b.dataset.m; renderKeys(); }));
$('#reset').addEventListener('click', () => {
	if (!confirm('Erase all Keystorm stats stored on this device?')) return;
	store = blank(); save(); renderStats();
});

/* ── Navigation + input ────────────────────────────────────── */
function toMenu() {
	if (run) run.over = true;
	go('menu'); renderMenu();
}
function toStats() {
	if (run) run.over = true;
	go('stats'); renderStats();
}
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => (b.dataset.go === 'stats' ? toStats() : toMenu())));
$('#again').addEventListener('click', () => start(run.mode));
$('#toMenu').addEventListener('click', toMenu);

addEventListener('keydown', (e) => {
	if (e.ctrlKey || e.metaKey || e.altKey) return;
	const k = e.key;
	if (state === 'menu') {
		const id = Object.keys(MODES)[+k - 1];
		if (id) start(id);
		return;
	}
	if (state === 'results') {
		if (k === 'Enter' || k === 'Tab') { e.preventDefault(); start(run.mode); } else if (k === 'Escape') toMenu();
		return;
	}
	if (state === 'stats') { if (k === 'Escape') toMenu(); return; }

	// count | play | end
	if (k === ' ' || k === 'Tab' || k === 'Backspace') e.preventDefault();
	if (k === 'Escape') {
		if (state === 'play' && run.ok + run.bad > 0) finish('quit'); else toMenu();
		return;
	}
	if (k === 'Tab') { start(run.mode); return; }
	if (state !== 'play' || e.repeat) return;
	(MODES[run.mode].arena ? arena : stream).key(k);
});

/* ── Main loop ─────────────────────────────────────────────── */
let last = now();
function frame(t) {
	const dt = Math.min(0.05, (t - last) / 1000);
	last = t;
	if (state === 'play') {
		if (MODES[run.mode].arena) arena.update(dt);
		else if (run.mode === 'sprint' && run.t0 && elapsed() >= store.len) finish('time');
		updateHud();
	}
	// Heat drives the whole mood: hue, aurora strength, star streaks. It decays unless you keep typing.
	energy *= Math.exp(-dt);
	const target = state === 'play' ? 0.75 * energy + 0.25 * Math.min(1, run.streak / 50) : 0.12;
	heat += (target - heat) * Math.min(1, dt * 2.5);
	const h = Math.round(200 + heat * 160);
	if (h !== hue) { hue = h; root.style.setProperty('--hue', h); }
	drawFx(t, dt);
	requestAnimationFrame(frame);
}

const replace = () => { if (stream.chars.length) stream.place(); };
addEventListener('resize', () => { resize(); replace(); });
document.fonts?.ready.then(replace);
resize();
renderMenu();
requestAnimationFrame(frame);
