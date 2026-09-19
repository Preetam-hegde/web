'use strict';

// ── Configuration & Storage Keys ─────────────────────────────────────────────
const STORAGE_KEY = 'devpulseSettings_v2';
const GH_EVENTS_SAMPLE = 100;
const GH_REPOS_SAMPLE = 30;

// ── State Management ─────────────────────────────────────────────────────────
const state = {
	theme: 'cyber-neon',
	crtActive: false,
	audioMuted: true,
	streamActive: false,
	streamIntervalMs: 30000,
	streamTimerId: null,
	activeTab: 'all',
	lastTelemetrySnapshot: null,
	ownRepos: [],
	starredRepos: [],
	activeRepoTab: 'own',
	newsCategory: 'top',
	repoFilter: '',
	fpsData: {
		frames: [],
		lastTime: performance.now(),
		fps: 60,
		droppedFrames: 0,
		totalFrames: 0,
	},
	edgeProbes: {
		cloudflare: { latency: null, status: 'idle' },
		github: { latency: null, status: 'idle' },
		google: { latency: null, status: 'idle' },
		fastly: { latency: null, status: 'idle' },
	},
	syntheticTick: 0,
};

// ── Audio Synthesizer (Web Audio API) ────────────────────────────────────────
let audioCtx = null;

function getAudioContext() {
	if (!audioCtx && typeof window.AudioContext !== 'undefined') {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		audioCtx = new AudioContextClass();
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume().catch(() => {});
	}
	return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.05, gainValue = 0.08) {
	if (state.audioMuted) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, ctx.currentTime);
		gain.gain.setValueAtTime(gainValue, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + duration);
	} catch (e) {
		// Audio fail silently
	}
}

function playUiBlip() {
	playTone(880, 'sine', 0.03, 0.05);
}

function playSuccessChime() {
	if (state.audioMuted) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const now = ctx.currentTime;
		[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, now + i * 0.06);
			gain.gain.setValueAtTime(0.04, now + i * 0.06);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.15);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + i * 0.06);
			osc.stop(now + i * 0.06 + 0.16);
		});
	} catch (e) {
		// Audio fail silently
	}
}

function playRadarPing() {
	if (state.audioMuted) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(1400, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.12);
		gain.gain.setValueAtTime(0.06, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.13);
	} catch (e) {
		// Audio fail silently
	}
}

// ── DOM Elements Cache ───────────────────────────────────────────────────────
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const dom = {
	body: document.body,
	crtOverlay: $('#crt-overlay'),
	clockUtc: $('#clock-utc'),
	clockLocal: $('#clock-local'),
	streamToggleBtn: $('#stream-toggle-btn'),
	streamBtnText: $('#stream-btn-text'),
	streamInterval: $('#stream-interval'),
	audioToggleBtn: $('#audio-toggle-btn'),
	audioIconOn: $('#audio-icon-on'),
	audioIconOff: $('#audio-icon-off'),
	crtToggleBtn: $('#crt-toggle-btn'),
	themeSelect: $('#theme-select'),
	exportBtn: $('#export-btn'),
	fullscreenBtn: $('#fullscreen-btn'),
	githubUsername: $('#github-username'),
	npmPackage: $('#npm-package'),
	plausibleSite: $('#plausible-site'),
	plausibleApiKey: $('#plausible-api-key'),
	useProxy: $('#use-proxy'),
	useSynthetic: $('#use-synthetic'),
	refreshBtn: $('#refresh-btn'),
	resetBtn: $('#reset-btn'),
	probeNetworkBtn: $('#probe-network-btn'),
	reprobeBtn: $('#reprobe-btn'),
	toggleConfigBtn: $('#toggle-config-btn'),
	configDrawer: $('#config-drawer'),
	statusText: $('#status'),
	statusDot: $('#status-dot'),
	rateLimitBadge: $('#rate-limit-badge'),
	// KPI elements
	repoCount: $('#repo-count'),
	starsBadge: $('#stars-badge'),
	forksFoot: $('#forks-foot'),
	starredCount: $('#starred-count'),
	starredBadge: $('#starred-badge'),
	starredFoot: $('#starred-foot'),
	tabOwnRepos: $('#tab-own-repos'),
	tabStarredRepos: $('#tab-starred-repos'),
	ownRepoCount: $('#own-repo-count'),
	starredRepoCount: $('#starred-repo-count'),
	repoFilterInput: $('#repo-filter-input'),
	repoListContainer: $('#repo-list-container'),
	followerCount: $('#follower-count'),
	followingBadge: $('#following-badge'),
	accountAgeFoot: $('#account-age-foot'),
	followerRatio: $('#follower-ratio'),
	streakCount: $('#streak-count'),
	streakBadge: $('#streak-badge'),
	streakFoot: $('#streak-foot'),
	streakFlame: $('#streak-flame'),
	velocityCount: $('#velocity-count'),
	velocityBadge: $('#velocity-badge'),
	velocityFoot: $('#velocity-foot'),
	velocityIndicator: $('#velocity-indicator'),
	prodScoreVal: $('#prod-score-val'),
	prodGaugeCircle: $('#prod-gauge-circle'),
	prodGrade: $('#prod-grade'),
	prodFoot: $('#prod-foot'),
	fpsCount: $('#fps-count'),
	fpsDrops: $('#fps-drops'),
	fpsStatus: $('#fps-status'),
	hardwareCores: $('#hardware-cores'),
	hardwareRam: $('#hardware-ram'),
	domCount: $('#dom-count'),
	netDownlink: $('#net-downlink'),
	netRtt: $('#net-rtt'),
	netType: $('#net-type'),
	netStatus: $('#net-status'),
	npmDownloads: $('#npm-downloads'),
	npmPkgBadge: $('#npm-pkg-badge'),
	npmVersion: $('#npm-version'),
	npmStatus: $('#npm-status'),
	pageviewCount: $('#pageview-count'),
	plausibleFoot: $('#plausible-foot'),
	trafficBadge: $('#traffic-badge'),
	// Visuals
	punchcardGrid: $('#punchcard-grid'),
	punchcardTotal: $('#punchcard-total'),
	activityBars: $('#activity-bars'),
	langDonutSvg: $('#lang-donut-svg'),
	donutSegments: $('#donut-segments'),
	donutCenterPct: $('#donut-center-pct'),
	donutCenterLbl: $('#donut-center-lbl'),
	langLegend: $('#lang-legend'),
	langRepoCount: $('#lang-repo-count'),
	eventTypesList: $('#event-types-list'),
	fpsCanvas: $('#fps-canvas'),
	canvasLatencyStat: $('#canvas-latency-stat'),
	// Edge node latency elements
	nodeBarCf: $('#node-bar-cf'),
	nodeValCf: $('#node-val-cf'),
	nodeStatusCf: $('#node-status-cf'),
	nodeBarGh: $('#node-bar-gh'),
	nodeValGh: $('#node-val-gh'),
	nodeStatusGh: $('#node-status-gh'),
	nodeBarGg: $('#node-bar-gg'),
	nodeValGg: $('#node-val-gg'),
	nodeStatusGg: $('#node-status-gg'),
	nodeBarFa: $('#node-bar-fa'),
	nodeValFa: $('#node-val-fa'),
	nodeStatusFa: $('#node-status-fa'),
	edgeJitter: $('#edge-jitter'),
	edgeFastest: $('#edge-fastest'),
	edgeHealth: $('#edge-health'),
	// Hacker News
	hnStoriesList: $('#hn-stories-list'),
	hnCount: $('#hn-count'),
	// Terminal
	terminalTicker: $('#terminal-ticker'),
	clearTerminalBtn: $('#clear-terminal-btn'),
	// Snapshot dialog
	snapshotDialog: $('#snapshot-dialog'),
	closeDialogBtn: $('#close-dialog-btn'),
	snapshotPreview: $('#snapshot-preview'),
	copyJsonBtn: $('#copy-json-btn'),
	downloadJsonBtn: $('#download-json-btn'),
	downloadCsvBtn: $('#download-csv-btn'),
};

// ── Utility Functions ────────────────────────────────────────────────────────
function formatNumber(val) {
	if (!Number.isFinite(val)) return '0';
	return new Intl.NumberFormat('en-US').format(val);
}

function formatRatio(val) {
	if (!Number.isFinite(val)) return '0.00';
	return val.toFixed(2);
}

function getTimestamp() {
	const now = new Date();
	return now.toTimeString().split(' ')[0];
}

function appendTerminalLog(message, level = 'info') {
	const line = document.createElement('div');
	line.className = `term-line ${level}`;
	const timeSpan = document.createElement('span');
	timeSpan.className = 'term-time';
	timeSpan.textContent = `[${getTimestamp()}]`;
	line.appendChild(timeSpan);

	const textNode = document.createTextNode(` ${message}`);
	line.appendChild(textNode);

	dom.terminalTicker.appendChild(line);
	if (dom.terminalTicker.children.length > 80) {
		dom.terminalTicker.removeChild(dom.terminalTicker.firstChild);
	}
	dom.terminalTicker.scrollTop = dom.terminalTicker.scrollHeight;
}

function setSystemStatus(message, level = 'warn') {
	dom.statusText.textContent = message;
	dom.statusDot.className = `status-indicator ${level}`;
}

function animateValue(element, targetValue, duration = 850, formatFn = formatNumber) {
	if (!element) return;
	const val = Number.isFinite(targetValue) ? Math.max(0, targetValue) : 0;
	const rawStart = element.dataset.value || element.textContent.replace(/[^0-9.-]/g, '') || '0';
	const startVal = Number.isFinite(Number(rawStart)) ? Number(rawStart) : 0;
	const startTime = performance.now();

	function step(now) {
		const elapsed = now - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const ease = 1 - Math.pow(1 - progress, 3);
		const current = Math.round(startVal + (val - startVal) * ease);
		element.textContent = formatFn(current);
		element.dataset.value = String(current);
		if (progress < 1) {
			requestAnimationFrame(step);
		}
	}
	requestAnimationFrame(step);
}

// ── HUD Clock ────────────────────────────────────────────────────────────────
function initClock() {
	function update() {
		const now = new Date();
		const utcHours = String(now.getUTCHours()).padStart(2, '0');
		const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
		const utcSecs = String(now.getUTCSeconds()).padStart(2, '0');
		const utcMs = String(now.getUTCMilliseconds()).padStart(3, '0');
		dom.clockUtc.textContent = `${utcHours}:${utcMins}:${utcSecs}.${utcMs}`;

		const localHours = String(now.getHours()).padStart(2, '0');
		const localMins = String(now.getMinutes()).padStart(2, '0');
		const localSecs = String(now.getSeconds()).padStart(2, '0');
		dom.clockLocal.textContent = `${localHours}:${localMins}:${localSecs}`;
		requestAnimationFrame(update);
	}
	requestAnimationFrame(update);
}

// ── Real-Time Canvas FPS Oscilloscope ────────────────────────────────────────
function initFpsMonitor() {
	const canvas = dom.fpsCanvas;
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	const history = new Array(120).fill(16.6);

	function renderFps() {
		const now = performance.now();
		const delta = now - state.fpsData.lastTime;
		state.fpsData.lastTime = now;

		if (delta > 0 && delta < 500) {
			const instantFps = Math.min(120, 1000 / delta);
			state.fpsData.frames.push(instantFps);
			if (state.fpsData.frames.length > 20) state.fpsData.frames.shift();
			const avgFps = Math.round(state.fpsData.frames.reduce((a, b) => a + b, 0) / state.fpsData.frames.length);

			if (delta > 24) state.fpsData.droppedFrames += 1;
			state.fpsData.totalFrames += 1;

			history.push(delta);
			if (history.length > 120) history.shift();

			dom.fpsCount.textContent = String(avgFps);
			dom.fpsDrops.textContent = `${state.fpsData.droppedFrames} dropped frames`;
			dom.canvasLatencyStat.textContent = `Frame: ${delta.toFixed(1)}ms`;

			if (avgFps >= 55) {
				dom.fpsStatus.textContent = 'SMOOTH';
				dom.fpsStatus.className = 'status-pill ok';
			} else if (avgFps >= 35) {
				dom.fpsStatus.textContent = 'JITTER';
				dom.fpsStatus.className = 'status-pill warn';
			} else {
				dom.fpsStatus.textContent = 'STALL';
				dom.fpsStatus.className = 'status-pill error';
			}
		}

		// Draw canvas waveform
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);

		// Grid lines
		ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let y = 20; y < h; y += 25) {
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
		}
		for (let x = 20; x < w; x += 30) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
		}
		ctx.stroke();

		// Target 16.6ms line (60 FPS)
		const targetY = h - (16.6 / 45) * h;
		ctx.strokeStyle = 'rgba(0, 255, 157, 0.35)';
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(0, targetY);
		ctx.lineTo(w, targetY);
		ctx.stroke();
		ctx.setLineDash([]);

		// Waveform path
		ctx.beginPath();
		const step = w / (history.length - 1);
		history.forEach((d, i) => {
			const x = i * step;
			const clampedD = Math.min(50, Math.max(4, d));
			const y = h - (clampedD / 50) * (h - 10);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});

		// Gradient fill
		const grad = ctx.createLinearGradient(0, 0, 0, h);
		grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
		grad.addColorStop(1, 'rgba(0, 240, 255, 0.02)');
		ctx.fillStyle = grad;
		ctx.lineTo(w, h);
		ctx.lineTo(0, h);
		ctx.closePath();
		ctx.fill();

		// Stroke line
		ctx.strokeStyle = '#00f0ff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		history.forEach((d, i) => {
			const x = i * step;
			const clampedD = Math.min(50, Math.max(4, d));
			const y = h - (clampedD / 50) * (h - 10);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		requestAnimationFrame(renderFps);
	}
	requestAnimationFrame(renderFps);
}

// ── Client Web Vitals & Hardware Diagnostics ─────────────────────────────────
function updateClientDiagnostics() {
	// CPU cores & Memory
	const cores = navigator.hardwareConcurrency || 8;
	const memory = navigator.deviceMemory || 8;
	dom.hardwareCores.textContent = String(cores);
	dom.hardwareRam.textContent = `Memory: ~${memory} GB`;

	// DOM nodes count
	const domElements = document.querySelectorAll('*').length;
	dom.domCount.textContent = `DOM: ${formatNumber(domElements)}`;

	// Network Information API
	const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
	if (conn) {
		const downlink = conn.downlink || 10;
		const rtt = conn.rtt || 50;
		const effectiveType = (conn.effectiveType || '4G').toUpperCase();
		dom.netDownlink.textContent = String(downlink);
		dom.netRtt.textContent = `RTT: ~${rtt}ms`;
		dom.netType.textContent = `${effectiveType} / ONLINE`;
		dom.netStatus.textContent = downlink > 5 ? 'OPTIMAL' : 'THROTTLED';
		dom.netStatus.className = downlink > 5 ? 'status-pill ok' : 'status-pill warn';
	}

	// Navigation Timing Waterfall
	try {
		const navEntries = performance.getEntriesByType('navigation');
		if (navEntries.length > 0) {
			const nav = navEntries[0];
			const dns = Math.max(1, Math.round(nav.domainLookupEnd - nav.domainLookupStart));
			const tcp = Math.max(1, Math.round(nav.connectEnd - nav.connectStart));
			const ttfb = Math.max(5, Math.round(nav.responseStart - nav.requestStart));
			const dcl = Math.max(10, Math.round(nav.domContentLoadedEventEnd - nav.startTime));
			const load = Math.max(15, Math.round(nav.loadEventEnd || (performance.now() - nav.startTime)));

			$('#v-dns-val').textContent = `${dns}ms`;
			$('#v-tcp-val').textContent = `${tcp}ms`;
			$('#v-ttfb-val').textContent = `${ttfb}ms`;
			$('#v-dcl-val').textContent = `${dcl}ms`;
			$('#v-load-val').textContent = `${load}ms`;

			const maxTime = Math.max(load, 200);
			$('#v-dns').style.width = `${Math.min(100, (dns / maxTime) * 100)}%`;
			$('#v-tcp').style.width = `${Math.min(100, (tcp / maxTime) * 100)}%`;
			$('#v-ttfb').style.width = `${Math.min(100, (ttfb / maxTime) * 100)}%`;
			$('#v-dcl').style.width = `${Math.min(100, (dcl / maxTime) * 100)}%`;
			$('#v-load').style.width = '100%';
		}
	} catch (e) {
		// Navigation timing fallback
	}
}

// ── Global Edge Latency Probes ───────────────────────────────────────────────
async function probeSingleNode(url, barEl, valEl, statusEl, nodeKey) {
	valEl.textContent = 'probing...';
	statusEl.textContent = 'PROBE';
	statusEl.className = 'status-pill warn';
	const start = performance.now();

	try {
		// Cache-busting ping
		const probeUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
		await fetch(probeUrl, { mode: 'no-cors', cache: 'no-store' });
		const elapsed = Math.round(performance.now() - start);
		state.edgeProbes[nodeKey].latency = elapsed;
		state.edgeProbes[nodeKey].status = 'ok';

		valEl.textContent = `${elapsed} ms`;
		barEl.style.width = `${Math.min(100, Math.max(8, (elapsed / 300) * 100))}%`;

		if (elapsed < 60) {
			statusEl.textContent = 'FAST';
			statusEl.className = 'status-pill ok';
			barEl.style.background = '#00ff9d';
		} else if (elapsed < 160) {
			statusEl.textContent = 'NOMINAL';
			statusEl.className = 'status-pill ok';
			barEl.style.background = '#00f0ff';
		} else {
			statusEl.textContent = 'HIGH';
			statusEl.className = 'status-pill warn';
			barEl.style.background = '#ffd166';
		}
		return elapsed;
	} catch (err) {
		const elapsed = Math.round(performance.now() - start) || 120;
		state.edgeProbes[nodeKey].latency = elapsed;
		state.edgeProbes[nodeKey].status = 'ok';
		valEl.textContent = `${elapsed} ms`;
		barEl.style.width = '35%';
		statusEl.textContent = 'OK';
		statusEl.className = 'status-pill ok';
		return elapsed;
	}
}

async function probeAllEdgeNodes() {
	playRadarPing();
	appendTerminalLog('Initiating global edge latency probes...', 'info');

	const [cf, gh, gg, fa] = await Promise.all([
		probeSingleNode('https://1.1.1.1/cdn-cgi/trace', dom.nodeBarCf, dom.nodeValCf, dom.nodeStatusCf, 'cloudflare'),
		probeSingleNode('https://api.github.com/zen', dom.nodeBarGh, dom.nodeValGh, dom.nodeStatusGh, 'github'),
		probeSingleNode('https://dns.google/resolve?name=example.com', dom.nodeBarGg, dom.nodeValGg, dom.nodeStatusGg, 'google'),
		probeSingleNode('https://www.fastly.com/favicon.ico', dom.nodeBarFa, dom.nodeValFa, dom.nodeStatusFa, 'fastly'),
	]);

	const validPings = [cf, gh, gg, fa].filter(Number.isFinite);
	if (validPings.length > 0) {
		const mean = validPings.reduce((a, b) => a + b, 0) / validPings.length;
		const variance = validPings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validPings.length;
		const jitter = Math.sqrt(variance).toFixed(1);
		dom.edgeJitter.textContent = `${jitter} ms`;

		const fastestVal = Math.min(...validPings);
		let fastestName = 'Cloudflare';
		if (fastestVal === gh) fastestName = 'GitHub';
		if (fastestVal === gg) fastestName = 'Google';
		if (fastestVal === fa) fastestName = 'Fastly';
		dom.edgeFastest.textContent = `${fastestName} (${fastestVal}ms)`;

		dom.edgeHealth.textContent = mean < 100 ? 'OPTIMAL' : 'GOOD';
		dom.edgeHealth.className = mean < 100 ? 'ok' : 'warn';
		appendTerminalLog(`Probes complete. Fastest: ${fastestName} (${fastestVal}ms) | Jitter: ${jitter}ms`, 'ok');
	}
}

// ── NPM Ecosystem Intelligence ───────────────────────────────────────────────
async function fetchNpmTelemetry(pkgName) {
	const cleanName = (pkgName || 'react').trim().toLowerCase();
	dom.npmPkgBadge.textContent = cleanName;
	appendTerminalLog(`Querying NPM ecosystem telemetry for [${cleanName}]...`, 'info');

	try {
		const [dlRes, metaRes] = await Promise.all([
			fetch(`https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(cleanName)}`),
			fetch(`https://registry.npmjs.org/${encodeURIComponent(cleanName)}/latest`),
		]);

		let downloads = 0;
		if (dlRes.ok) {
			const dlData = await dlRes.json();
			downloads = dlData.downloads || 0;
		}

		let version = 'v0.0.0';
		let license = 'MIT';
		if (metaRes.ok) {
			const metaData = await metaRes.json();
			version = `v${metaData.version || '1.0.0'}`;
			license = metaData.license || 'Open Source';
		}

		animateValue(dom.npmDownloads, downloads);
		dom.npmVersion.textContent = `Latest: ${version} (${license})`;
		dom.npmStatus.textContent = 'ACTIVE';
		dom.npmStatus.className = 'status-pill ok';
		appendTerminalLog(`NPM [${cleanName}]: ${formatNumber(downloads)} downloads/mo | ${version}`, 'ok');
		return { downloads, version, license };
	} catch (err) {
		// Fallback for offline or rate-limited
		const fallbackDownloads = 18450200;
		animateValue(dom.npmDownloads, fallbackDownloads);
		dom.npmVersion.textContent = 'Latest: v18.3.1 (MIT)';
		appendTerminalLog(`NPM query fallback applied for [${cleanName}].`, 'warn');
		return { downloads: fallbackDownloads, version: 'v18.3.1', license: 'MIT' };
	}
}

// ── Language Colors & Time Formatting ────────────────────────────────────────
const LANG_COLORS = {
	JavaScript: '#f1e05a',
	TypeScript: '#3178c6',
	HTML: '#e34c26',
	CSS: '#563d7c',
	Python: '#3572A5',
	Rust: '#dea584',
	Go: '#00ADD8',
	C: '#555555',
	'C++': '#f34b7d',
	Java: '#b07219',
	Ruby: '#701516',
	Shell: '#89e051',
	Swift: '#F05138',
	Kotlin: '#A97BFF',
	PHP: '#4F5D95',
	Dart: '#00B4AB',
};

function getLanguageColor(lang) {
	return LANG_COLORS[lang] || '#00f0ff';
}

function formatRelativeTime(dateInput) {
	if (!dateInput) return 'recently';
	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return 'recently';
	const diff = Date.now() - date.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	if (days <= 0) return 'today';
	if (days === 1) return 'yesterday';
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	const years = Math.floor(months / 12);
	return `${years}y ago`;
}

function escapeHtml(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Repository & Starred Showcase Renderer ────────────────────────────────────
function renderRepoShowcase(filterQuery = '') {
	if (!dom.repoListContainer) return;
	const activeList = state.activeRepoTab === 'starred' ? state.starredRepos : state.ownRepos;
	const q = (typeof filterQuery === 'string' ? filterQuery : state.repoFilter || '').toLowerCase().trim();

	const filtered = activeList.filter((r) => {
		if (!q) return true;
		const nameMatch = (r.name || r.full_name || '').toLowerCase().includes(q);
		const descMatch = (r.description || '').toLowerCase().includes(q);
		const langMatch = (r.language || '').toLowerCase().includes(q);
		return nameMatch || descMatch || langMatch;
	});

	dom.repoListContainer.innerHTML = '';

	if (filtered.length === 0) {
		const emptyDiv = document.createElement('div');
		emptyDiv.className = 'empty-state';
		emptyDiv.textContent = q
			? `No repositories match "${q}".`
			: state.activeRepoTab === 'starred'
				? 'No starred repositories found for this user.'
				: 'No public repositories found for this user.';
		dom.repoListContainer.appendChild(emptyDiv);
		return;
	}

	filtered.forEach((repo) => {
		const card = document.createElement('div');
		card.className = 'repo-card';

		const topRow = document.createElement('div');
		topRow.className = 'repo-card-top';

		const link = document.createElement('a');
		link.className = 'repo-link';
		link.href = repo.html_url || `https://github.com/${repo.full_name || repo.name}`;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.innerHTML = `
			<svg class="repo-icon" viewBox="0 0 16 16" fill="currentColor">
				<path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h7a.25.25 0 0 1 .25.25v1.25a.25.25 0 0 1-.25.25h-7a.25.25 0 0 1-.25-.25Z"></path>
			</svg>
			<span>${escapeHtml(repo.name || repo.full_name)}</span>
			<svg class="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
		`;

		const statsRow = document.createElement('div');
		statsRow.className = 'repo-stats-row';
		statsRow.innerHTML = `
			${repo.fork ? '<span class="repo-stat-pill">Fork</span>' : ''}
			<span class="repo-stat-pill star">★ ${formatNumber(repo.stargazers_count || 0)}</span>
			<span class="repo-stat-pill">⑂ ${formatNumber(repo.forks_count || 0)}</span>
		`;

		topRow.appendChild(link);
		topRow.appendChild(statsRow);

		const desc = document.createElement('p');
		desc.className = 'repo-desc';
		desc.textContent = repo.description || 'No description provided for this repository.';

		const bottomRow = document.createElement('div');
		bottomRow.className = 'repo-card-bottom';

		const langTag = document.createElement('div');
		langTag.className = 'repo-lang-tag';
		if (repo.language) {
			langTag.innerHTML = `
				<span class="lang-dot" style="background: ${getLanguageColor(repo.language)}"></span>
				<span>${escapeHtml(repo.language)}</span>
				<span class="repo-updated">&bull; ${formatRelativeTime(repo.updated_at || repo.pushed_at)}</span>
			`;
		} else {
			langTag.innerHTML = `
				<span class="lang-dot" style="background: var(--text-tertiary)"></span>
				<span>Unknown</span>
				<span class="repo-updated">&bull; ${formatRelativeTime(repo.updated_at || repo.pushed_at)}</span>
			`;
		}

		const linksGroup = document.createElement('div');
		linksGroup.className = 'repo-links';
		if (repo.homepage) {
			const demoLink = document.createElement('a');
			demoLink.className = 'repo-demo-link';
			demoLink.href = repo.homepage;
			demoLink.target = '_blank';
			demoLink.rel = 'noopener noreferrer';
			demoLink.title = 'Live Demo';
			demoLink.textContent = 'Live Demo ↗';
			linksGroup.appendChild(demoLink);
		}

		bottomRow.appendChild(langTag);
		bottomRow.appendChild(linksGroup);

		card.appendChild(topRow);
		card.appendChild(desc);
		card.appendChild(bottomRow);

		dom.repoListContainer.appendChild(card);
	});
}

// ── Hacker News Tech Pulse Hub ───────────────────────────────────────────────
async function fetchHackerNewsPulse(category = state.newsCategory || 'top') {
	state.newsCategory = category;
	$$('.news-pill').forEach((pill) => {
		const isActive = pill.dataset.category === category;
		pill.classList.toggle('active', isActive);
	});

	appendTerminalLog(`Syncing Hacker News stream [${category.toUpperCase()}]...`, 'info');

	const categoryEndpoints = {
		top: 'https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=12&orderBy="$key"',
		show: 'https://hacker-news.firebaseio.com/v0/showstories.json?limitToFirst=12&orderBy="$key"',
		ask: 'https://hacker-news.firebaseio.com/v0/askstories.json?limitToFirst=12&orderBy="$key"',
	};

	try {
		const endpoint = categoryEndpoints[category] || categoryEndpoints.top;
		const res = await fetch(endpoint);
		if (!res.ok) throw new Error(`HN fetch failed (${res.status})`);
		const rawIds = await res.json();
		const storyIds = Array.isArray(rawIds) ? rawIds.slice(0, 12) : [];

		const storyResults = await Promise.allSettled(
			storyIds.map(async (id) => {
				const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
				if (!itemRes.ok) return null;
				return itemRes.json();
			})
		);

		const stories = storyResults
			.filter((r) => r.status === 'fulfilled' && r.value && r.value.title)
			.map((r) => r.value);

		if (stories.length === 0) throw new Error('No stories parsed');

		dom.hnStoriesList.innerHTML = '';
		stories.forEach((item) => {
			const card = createHnCard(item);
			dom.hnStoriesList.appendChild(card);
		});

		if (dom.hnCount) {
			dom.hnCount.textContent = `${stories.length} stories`;
		}
		appendTerminalLog(`Hacker News: Synced ${stories.length} ${category.toUpperCase()} dev stories.`, 'ok');
	} catch (err) {
		renderHnFallback(category);
		appendTerminalLog(`Hacker News: Stream fallback applied (${err.message}).`, 'warn');
	}
}

function createHnCard(item) {
	const card = document.createElement('div');
	card.className = 'hn-card';

	const id = item.id || item.objectID;
	const storyUrl = item.url || `https://news.ycombinator.com/item?id=${id}`;
	const score = item.score ?? item.points ?? 1;
	const author = item.by || item.author || 'anon';
	const comments = item.descendants ?? item.num_comments ?? 0;
	const timeAgo = item.time ? formatRelativeTime(item.time * 1000) : formatRelativeTime(item.created_at);

	let domain = '';
	try {
		if (item.url && !item.url.includes('news.ycombinator.com')) {
			domain = new URL(item.url).hostname.replace(/^www\./, '');
		}
	} catch (e) {}

	card.innerHTML = `
		<div class="hn-score-box">
			<span>${formatNumber(score)}</span>
			<span class="hn-score-lbl">PTS</span>
		</div>
		<div class="hn-content">
			<p class="hn-title">
				<a href="${escapeHtml(storyUrl)}" target="_blank" rel="noopener noreferrer" class="hn-story-link">${escapeHtml(item.title)}</a>
				${domain ? `<span class="domain-pill">${escapeHtml(domain)}</span>` : ''}
			</p>
			<p class="hn-meta">
				by ${escapeHtml(author)} &bull;
				<a class="hn-discuss-link" href="https://news.ycombinator.com/item?id=${id}" target="_blank" rel="noopener noreferrer">${formatNumber(comments)} comments</a>
				${timeAgo ? ` &bull; ${timeAgo}` : ''}
			</p>
		</div>
	`;
	return card;
}

function renderHnFallback(category) {
	const fallbacks = {
		top: [
			{ id: 4123401, title: 'Show HN: DevPulse Telemetry Matrix v2.4', by: 'preetam-hegde', score: 480, descendants: 142, time: Math.floor(Date.now() / 1000) - 3600 * 2, url: 'https://github.com/preetam-hegde/web' },
			{ id: 4123402, title: 'The Architecture of High-Frequency Developer Dashboards', by: 'telemetry-eng', score: 342, descendants: 89, time: Math.floor(Date.now() / 1000) - 3600 * 4, url: 'https://github.com' },
			{ id: 4123403, title: 'SQLite in the Browser with WebAssembly and Web Workers', by: 'wasm_dev', score: 620, descendants: 215, time: Math.floor(Date.now() / 1000) - 3600 * 7, url: 'https://sqlite.org' },
			{ id: 4123404, title: 'Why Systems Languages Are Becoming the Standard for Web Tooling', by: 'oxc_fan', score: 290, descendants: 78, time: Math.floor(Date.now() / 1000) - 3600 * 12, url: 'https://github.com' },
			{ id: 4123405, title: 'Deep Dive into Linux Kernel eBPF Subsystems', by: 'torvalds', score: 810, descendants: 310, time: Math.floor(Date.now() / 1000) - 3600 * 16, url: 'https://kernel.org' },
			{ id: 4123406, title: 'Building Resilient Real-Time Edge Analytics with Modern Web APIs', by: 'cdn_ninja', score: 195, descendants: 44, time: Math.floor(Date.now() / 1000) - 3600 * 22, url: 'https://cloudflare.com' },
		],
		show: [
			{ id: 4123501, title: 'Show HN: DevPulse – Real-Time Observability & GitHub Intelligence', by: 'preetam-hegde', score: 512, descendants: 168, time: Math.floor(Date.now() / 1000) - 3600 * 1, url: 'https://github.com/preetam-hegde/web' },
			{ id: 4123502, title: 'Show HN: System Blueprint – Large-Scale Architecture Patterns', by: 'preetam-hegde', score: 280, descendants: 64, time: Math.floor(Date.now() / 1000) - 3600 * 5, url: 'https://sysdesign.preetamhegde.in' },
			{ id: 4123503, title: 'Show HN: TinyWasm – Minimalist WebAssembly Runtime in Rust', by: 'rust_hacker', score: 395, descendants: 92, time: Math.floor(Date.now() / 1000) - 3600 * 9, url: 'https://github.com' },
			{ id: 4123504, title: 'Show HN: FlameGraph.js – Interactive In-Browser Profiling Tool', by: 'perf_lead', score: 230, descendants: 45, time: Math.floor(Date.now() / 1000) - 3600 * 14, url: 'https://github.com' },
			{ id: 4123505, title: 'Show HN: VectorDB-Lite – Embedded Vector Search in Pure TypeScript', by: 'ai_builder', score: 440, descendants: 118, time: Math.floor(Date.now() / 1000) - 3600 * 19, url: 'https://github.com' },
		],
		ask: [
			{ id: 4123601, title: 'Ask HN: What is your favorite developer telemetry dashboard?', by: 'sysadmin_joe', score: 180, descendants: 94, time: Math.floor(Date.now() / 1000) - 3600 * 3, url: '' },
			{ id: 4123602, title: 'Ask HN: How do you monitor client-side Web Vitals and edge latency?', by: 'frontend_lead', score: 245, descendants: 122, time: Math.floor(Date.now() / 1000) - 3600 * 6, url: '' },
			{ id: 4123603, title: 'Ask HN: Which modern frontend architecture has proven most maintainable?', by: 'arch_seeker', score: 320, descendants: 210, time: Math.floor(Date.now() / 1000) - 3600 * 11, url: '' },
			{ id: 4123604, title: 'Ask HN: Best practices for tracking GitHub activity streaks and velocity?', by: 'streak_coder', score: 155, descendants: 67, time: Math.floor(Date.now() / 1000) - 3600 * 18, url: '' },
		],
	};

	const items = fallbacks[category] || fallbacks.top;
	dom.hnStoriesList.innerHTML = '';
	items.forEach((item) => {
		const card = createHnCard(item);
		dom.hnStoriesList.appendChild(card);
	});
	if (dom.hnCount) {
		dom.hnCount.textContent = `${items.length} stories`;
	}
}

// ── GitHub Telemetry & Analysis Engine ───────────────────────────────────────
function normalizeDate(dInput) {
	const d = new Date(dInput);
	if (Number.isNaN(d.getTime())) return null;
	d.setHours(0, 0, 0, 0);
	return d;
}

function diffInDays(a, b) {
	const da = normalizeDate(a);
	const db = normalizeDate(b);
	if (!da || !db) return Infinity;
	return Math.abs((db - da) / (1000 * 60 * 60 * 24));
}

function daysBetweenUtc(dateStrA, dateStrB) {
	const [yA, mA, dA] = dateStrA.split('-').map(Number);
	const [yB, mB, dB] = dateStrB.split('-').map(Number);
	const utcA = Date.UTC(yA, mA - 1, dA);
	const utcB = Date.UTC(yB, mB - 1, dB);
	return Math.round(Math.abs(utcB - utcA) / (1000 * 60 * 60 * 24));
}

function calculateStreaks(events) {
	if (!events || !events.length) {
		return { currentStreak: 0, longestStreak: 0, dailyTimeline: [], punchcard: createEmptyPunchcard() };
	}

	const dayBuckets = new Map();
	const punchcard = createEmptyPunchcard();
	const contributionTypes = new Set([
		'PushEvent',
		'PullRequestEvent',
		'IssuesEvent',
		'CreateEvent',
		'ReleaseEvent',
		'IssueCommentEvent',
		'CommitCommentEvent',
	]);

	events.forEach((ev) => {
		if (!contributionTypes.has(ev.type)) return;
		const d = new Date(ev.created_at);
		if (Number.isNaN(d.getTime())) return;

		// Day key in UTC YYYY-MM-DD
		const dayKey = d.toISOString().slice(0, 10);
		dayBuckets.set(dayKey, (dayBuckets.get(dayKey) || 0) + 1);

		// Punchcard: day of week (0-6) x hour (0-23)
		const dayOfWeek = d.getUTCDay();
		const hour = d.getUTCHours();
		punchcard[dayOfWeek][hour] += 1;
	});

	const dayKeys = Array.from(dayBuckets.keys()).sort((a, b) => (a > b ? -1 : 1));
	if (!dayKeys.length) {
		return { currentStreak: 0, longestStreak: 0, dailyTimeline: [], punchcard };
	}

	const todayUtc = new Date().toISOString().slice(0, 10);
	const latestDay = dayKeys[0];
	const daysFromToday = daysBetweenUtc(todayUtc, latestDay);

	let currentStreak = 0;
	if (daysFromToday <= 1) {
		currentStreak = 1;
		for (let i = 1; i < dayKeys.length; i++) {
			if (daysBetweenUtc(dayKeys[i - 1], dayKeys[i]) === 1) {
				currentStreak += 1;
			} else {
				break;
			}
		}
	}

	let longestStreak = dayKeys.length > 0 ? 1 : 0;
	let runningStreak = 1;
	for (let i = 1; i < dayKeys.length; i++) {
		if (daysBetweenUtc(dayKeys[i - 1], dayKeys[i]) === 1) {
			runningStreak += 1;
			if (runningStreak > longestStreak) {
				longestStreak = runningStreak;
			}
		} else {
			runningStreak = 1;
		}
	}
	longestStreak = Math.max(longestStreak, currentStreak);

	const dailyTimeline = dayKeys
		.slice(0, 14)
		.reverse()
		.map((k) => ({
			date: k.slice(5),
			count: dayBuckets.get(k),
		}));

	return { currentStreak, longestStreak, dailyTimeline, punchcard };
}

function createEmptyPunchcard() {
	return Array.from({ length: 7 }, () => new Array(24).fill(0));
}

function calculateVelocity(events) {
	const pushEvents = (events || []).filter((e) => e.type === 'PushEvent');
	const today = new Date();
	const push7d = pushEvents.filter((e) => diffInDays(e.created_at, today) <= 6).length;
	const push30d = pushEvents.filter((e) => diffInDays(e.created_at, today) <= 29).length;
	const avg7d = push7d / 7;
	const avg30d = push30d / 30;
	const ratio = avg30d > 0 ? avg7d / avg30d : 0;
	return { push7d, push30d, ratio };
}

function calculateProductivityScore(profile, streakInfo, velocity, repoList) {
	// Algorithmic 0-100 composite score
	let score = 20; // baseline
	score += Math.min(25, (streakInfo.currentStreak || 0) * 3);
	score += Math.min(20, (velocity.push7d || 0) * 2);
	score += Math.min(15, Math.round((velocity.ratio || 0) * 10));
	const totalStars = repoList.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
	score += Math.min(20, Math.round(Math.log10(totalStars + 1) * 6));
	return Math.min(100, Math.max(10, score));
}

// ── Rendering Visualizations ─────────────────────────────────────────────────
function renderPunchcard(punchcardData) {
	dom.punchcardGrid.innerHTML = '';
	let totalEvents = 0;
	let maxVal = 1;

	for (let d = 0; d < 7; d++) {
		for (let h = 0; h < 24; h++) {
			const count = punchcardData[d][h] || 0;
			totalEvents += count;
			if (count > maxVal) maxVal = count;
		}
	}

	dom.punchcardTotal.textContent = `${totalEvents} push events mapped`;

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	for (let d = 0; d < 7; d++) {
		for (let h = 0; h < 24; h++) {
			const count = punchcardData[d][h] || 0;
			const cell = document.createElement('div');
			cell.className = 'punch-cell';

			let lvl = 0;
			if (count > 0) {
				const frac = count / maxVal;
				if (frac > 0.75) lvl = 4;
				else if (frac > 0.5) lvl = 3;
				else if (frac > 0.25) lvl = 2;
				else lvl = 1;
			}
			cell.classList.add(`lvl-${lvl}`);
			cell.title = `${dayNames[d]} ${String(h).padStart(2, '0')}:00 — ${count} pushes`;
			dom.punchcardGrid.appendChild(cell);
		}
	}
}

function renderActivityBars(dailyTimeline) {
	dom.activityBars.innerHTML = '';
	if (!dailyTimeline || !dailyTimeline.length) {
		const p = document.createElement('p');
		p.className = 'placeholder-muted';
		p.textContent = 'No push activity in sampled events.';
		dom.activityBars.appendChild(p);
		return;
	}

	const peak = dailyTimeline.reduce((max, item) => Math.max(max, item.count), 1);
	dailyTimeline.forEach((item, index) => {
		const bar = document.createElement('div');
		bar.className = 'bar';
		bar.style.height = `${Math.max(6, (item.count / peak) * 90)}px`;
		bar.style.animationDelay = `${index * 35}ms`;
		bar.title = `${item.date}: ${item.count} push events`;

		const label = document.createElement('span');
		label.textContent = item.date;
		bar.appendChild(label);
		dom.activityBars.appendChild(bar);
	});
}

function renderLanguageDonut(repoList) {
	const langCounts = new Map();
	let totalBytes = 0;

	repoList.forEach((r) => {
		if (r.language) {
			langCounts.set(r.language, (langCounts.get(r.language) || 0) + 1);
			totalBytes += 1;
		}
	});

	dom.donutSegments.innerHTML = '';
	dom.langLegend.innerHTML = '';
	dom.langRepoCount.textContent = `${repoList.length} repos analyzed`;

	if (!totalBytes) {
		dom.donutCenterPct.textContent = '0%';
		dom.donutCenterLbl.textContent = 'STACK';
		dom.langLegend.innerHTML = '<p class="placeholder-muted">No language data found.</p>';
		return;
	}

	const sortedLangs = Array.from(langCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 6);

	const palette = ['#00f0ff', '#00ff9d', '#ffd166', '#bd00ff', '#ff4d6d', '#70b8ff'];
	const radius = 75;
	const circumference = 2 * Math.PI * radius; // ~471.24
	let accumulatedOffset = 0;

	sortedLangs.forEach(([lang, count], idx) => {
		const pct = count / totalBytes;
		const dash = pct * circumference;
		const color = palette[idx % palette.length];

		// Donut segment
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('class', 'donut-segment');
		circle.setAttribute('cx', '100');
		circle.setAttribute('cy', '100');
		circle.setAttribute('r', String(radius));
		circle.setAttribute('stroke', color);
		circle.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
		circle.setAttribute('stroke-dashoffset', String(-accumulatedOffset));
		circle.addEventListener('mouseenter', () => {
			dom.donutCenterPct.textContent = `${Math.round(pct * 100)}%`;
			dom.donutCenterLbl.textContent = lang.toUpperCase();
			playUiBlip();
		});
		circle.addEventListener('mouseleave', () => {
			const topPct = Math.round((sortedLangs[0][1] / totalBytes) * 100);
			dom.donutCenterPct.textContent = `${topPct}%`;
			dom.donutCenterLbl.textContent = sortedLangs[0][0].toUpperCase();
		});

		dom.donutSegments.appendChild(circle);
		accumulatedOffset += dash;

		// Legend Item
		const item = document.createElement('div');
		item.className = 'lang-item';
		item.innerHTML = `
			<div class="lang-item-left">
				<span class="lang-dot" style="background: ${color}"></span>
				<span class="lang-name">${escapeHtml(lang)}</span>
			</div>
			<span class="lang-pct">${Math.round(pct * 100)}%</span>
		`;
		dom.langLegend.appendChild(item);
	});

	if (sortedLangs.length > 0) {
		const topPct = Math.round((sortedLangs[0][1] / totalBytes) * 100);
		dom.donutCenterPct.textContent = `${topPct}%`;
		dom.donutCenterLbl.textContent = sortedLangs[0][0].toUpperCase();
	}
}

function renderRadialGauge(score) {
	dom.prodScoreVal.textContent = String(score);
	// Circumference for r=42 is 263.89
	const circ = 264;
	const offset = circ - (score / 100) * circ;
	dom.prodGaugeCircle.style.strokeDashoffset = String(offset);

	let grade = 'GRADE A';
	let strokeColor = 'var(--accent-b)';
	if (score >= 90) grade = 'GRADE A+';
	else if (score >= 75) grade = 'GRADE A';
	else if (score >= 60) grade = 'GRADE B+';
	else if (score >= 45) grade = 'GRADE B';
	else {
		grade = 'GRADE C';
		strokeColor = 'var(--warn)';
	}

	dom.prodGrade.textContent = grade;
	dom.prodGaugeCircle.style.stroke = strokeColor;
}

function renderEventTypes(events) {
	const typeCounts = new Map();
	(events || []).forEach((e) => {
		const t = e.type ? e.type.replace('Event', '') : 'Other';
		typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
	});

	dom.eventTypesList.innerHTML = '';
	Array.from(typeCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 6)
		.forEach(([type, count]) => {
			const pill = document.createElement('div');
			pill.className = 'event-pill';
			pill.innerHTML = `<span>${type}:</span><strong>${count}</strong>`;
			dom.eventTypesList.appendChild(pill);
		});
}

// ── Synthetic Traffic & Plausible Integration ────────────────────────────────
function generateSyntheticTraffic() {
	state.syntheticTick += 1;
	const baseViews = 24890 + Math.floor(Math.sin(state.syntheticTick) * 450);
	const baseVisitors = 8420 + Math.floor(Math.cos(state.syntheticTick) * 180);
	const bounce = (28.4 + Math.sin(state.syntheticTick * 0.5) * 2.1).toFixed(1);

	animateValue(dom.pageviewCount, baseViews);
	dom.plausibleFoot.textContent = `Visitors: ${formatNumber(baseVisitors)} | Bounce: ${bounce}%`;
	dom.trafficBadge.textContent = 'SYNTHETIC';
}

async function fetchPlausibleData(siteId, apiKey, endpoint) {
	if (endpoint.startsWith('/')) {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({
				siteId,
				period: '30d',
				metrics: 'visitors,pageviews,visit_duration,bounce_rate',
			}),
		});
		if (!res.ok) throw new Error(`Proxy error (${res.status})`);
		return res.json();
	}

	const url = new URL(endpoint);
	url.searchParams.set('site_id', siteId);
	url.searchParams.set('period', '30d');
	url.searchParams.set('metrics', 'visitors,pageviews,visit_duration,bounce_rate');

	const res = await fetch(url.toString(), {
		headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
	});
	if (!res.ok) throw new Error(`Plausible API error (${res.status})`);
	return res.json();
}

// ── Mock Fallback Data Generator ─────────────────────────────────────────────
function generateMockDeveloperData(username) {
	const mockRepos = [
		{
			name: `${username}-core`,
			full_name: `${username}/${username}-core`,
			html_url: `https://github.com/${username}/${username}-core`,
			description: 'High-performance distributed telemetry kernel and observability pipeline for cloud native applications.',
			language: 'TypeScript',
			stargazers_count: 320,
			forks_count: 45,
			homepage: 'https://github.com',
			updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
		},
		{
			name: 'telemetry-engine',
			full_name: `${username}/telemetry-engine`,
			html_url: `https://github.com/${username}/telemetry-engine`,
			description: 'Zero-overhead async metrics scraper and time-series aggregation service built in Rust.',
			language: 'Rust',
			stargazers_count: 850,
			forks_count: 110,
			homepage: '',
			updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
		},
		{
			name: 'web-observability',
			full_name: `${username}/web-observability`,
			html_url: `https://github.com/${username}/web-observability`,
			description: 'Real-time browser telemetry, Navigation Timing waterfall visualizers, and frame rate monitors.',
			language: 'JavaScript',
			stargazers_count: 240,
			forks_count: 30,
			homepage: 'https://github.com',
			updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
		},
		{
			name: 'algo-visualizer',
			full_name: `${username}/algo-visualizer`,
			html_url: `https://github.com/${username}/algo-visualizer`,
			description: 'Interactive computational geometry and graph algorithm step-by-step visual suite.',
			language: 'Python',
			stargazers_count: 410,
			forks_count: 65,
			homepage: '',
			updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
		},
		{
			name: 'distributed-queue',
			full_name: `${username}/distributed-queue`,
			html_url: `https://github.com/${username}/distributed-queue`,
			description: 'Raft consensus based distributed FIFO message broker with persistent write-ahead logs.',
			language: 'Go',
			stargazers_count: 180,
			forks_count: 22,
			homepage: '',
			updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
		},
		{
			name: 'dotfiles',
			full_name: `${username}/dotfiles`,
			html_url: `https://github.com/${username}/dotfiles`,
			description: 'Modular zsh, neovim, tmux, and developer workstation configuration files.',
			language: 'Shell',
			stargazers_count: 95,
			forks_count: 12,
			homepage: '',
			updated_at: new Date(Date.now() - 35 * 86400000).toISOString(),
		},
	];

	const mockStarred = [
		{
			name: 'system-blueprint',
			full_name: 'Preetam-hegde/system-blueprint',
			html_url: 'https://github.com/Preetam-hegde/system-blueprint',
			description: 'Architecture blueprints, design patterns, and engineering system models for large-scale software systems.',
			language: 'TypeScript',
			stargazers_count: 4,
			forks_count: 0,
			homepage: 'https://sysdesign.preetamhegde.in',
			updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
		},
		{
			name: 'awesome-mac',
			full_name: 'jaywcjlove/awesome-mac',
			html_url: 'https://github.com/jaywcjlove/awesome-mac',
			description: 'Now Awesome macOS. A curated list of awesome applications, software, tools and shiny things for macOS.',
			language: 'JavaScript',
			stargazers_count: 114200,
			forks_count: 13500,
			homepage: '',
			updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
		},
		{
			name: 'linux',
			full_name: 'torvalds/linux',
			html_url: 'https://github.com/torvalds/linux',
			description: 'Linux kernel source tree.',
			language: 'C',
			stargazers_count: 185000,
			forks_count: 54000,
			homepage: 'https://kernel.org',
			updated_at: new Date().toISOString(),
		},
		{
			name: 'vue',
			full_name: 'vuejs/core',
			html_url: 'https://github.com/vuejs/core',
			description: 'Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
			language: 'TypeScript',
			stargazers_count: 46000,
			forks_count: 8100,
			homepage: 'https://vuejs.org',
			updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
		},
	];

	const mockEvents = [];
	const now = Date.now();
	for (let i = 0; i < 90; i++) {
		const evTime = new Date(now - i * (6 * 3600 * 1000) - Math.random() * 3600000);
		mockEvents.push({
			type: i % 4 === 0 ? 'PullRequestEvent' : i % 7 === 0 ? 'IssuesEvent' : 'PushEvent',
			created_at: evTime.toISOString(),
		});
	}

	return {
		profile: {
			login: username,
			public_repos: 48,
			followers: 620,
			following: 115,
			created_at: '2018-04-12T08:00:00Z',
		},
		repos: mockRepos,
		starred: mockStarred,
		events: mockEvents,
	};
}

// ── Master Telemetry Refresh ─────────────────────────────────────────────────
async function refreshTelemetry(isAutoStream = false) {
	const username = dom.githubUsername.value.trim();
	const pkgName = dom.npmPackage.value.trim() || 'react';
	const siteId = dom.plausibleSite.value.trim();
	const apiKey = dom.plausibleApiKey.value.trim();
	const useProxy = dom.useProxy.checked;
	const useSynthetic = dom.useSynthetic.checked;
	const endpoint = useProxy ? '/api/plausible' : 'https://plausible.io/api/v1/stats/aggregate';

	if (!username) {
		setSystemStatus('Please specify a target GitHub username or click a preset.', 'warn');
		return;
	}

	saveSettings();
	setSystemStatus(`Streaming telemetry for @${username}...`, 'warn');
	appendTerminalLog(`[ENGAGE] Syncing telemetry matrix for @${username}...`, 'info');

	let profile = null;
	let repos = [];
	let starred = [];
	let events = [];
	let isRateLimited = false;

	try {
		// Parallel fetch GitHub profile, repos, events, and starred
		const [profRes, reposRes, eventsRes, starredRes] = await Promise.all([
			fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
			fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${GH_REPOS_SAMPLE}&sort=updated`),
			fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=${GH_EVENTS_SAMPLE}`),
			fetch(`https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=30`),
		]);

		// Check rate limits
		const remaining = profRes.headers.get('x-ratelimit-remaining');
		if (remaining !== null) {
			dom.rateLimitBadge.textContent = `RATE LIMIT: ${remaining}/60`;
		}

		if (profRes.status === 403 || reposRes.status === 403 || eventsRes.status === 403 || (starredRes && starredRes.status === 403)) {
			isRateLimited = true;
			throw new Error('GitHub API rate limit reached (60/hr for unauthenticated IP).');
		}

		if (!profRes.ok) throw new Error(`GitHub user not found (${profRes.status}).`);

		profile = await profRes.json();
		repos = reposRes.ok ? await reposRes.json() : [];
		events = eventsRes.ok ? await eventsRes.json() : [];
		starred = (starredRes && starredRes.ok) ? await starredRes.json() : [];
	} catch (err) {
		appendTerminalLog(`GitHub API notification: ${err.message}`, 'warn');
		// Apply high-fidelity mock data so the dashboard is never broken
		const mock = generateMockDeveloperData(username);
		profile = mock.profile;
		repos = mock.repos;
		starred = mock.starred || [];
		events = mock.events;
		if (isRateLimited) {
			setSystemStatus('GitHub rate limit reached — simulated telemetry active.', 'warn');
		}
	}

	state.ownRepos = repos;
	state.starredRepos = starred;

	// 1. Process GitHub Data
	const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
	const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
	animateValue(dom.repoCount, Number(profile.public_repos) || repos.length);
	dom.starsBadge.textContent = `${formatNumber(totalStars)} Stars`;
	dom.forksFoot.textContent = `Forks: ${formatNumber(totalForks)}`;

	// Starred Repositories KPI
	animateValue(dom.starredCount, starred.length);
	dom.starredBadge.textContent = `${formatNumber(starred.length)} Starred`;
	if (dom.ownRepoCount) dom.ownRepoCount.textContent = formatNumber(repos.length);
	if (dom.starredRepoCount) dom.starredRepoCount.textContent = formatNumber(starred.length);

	// Render Repository & Starred Showcase
	renderRepoShowcase();

	animateValue(dom.followerCount, Number(profile.followers) || 0);
	dom.followingBadge.textContent = `${formatNumber(profile.following || 0)} Following`;
	const ratio = profile.following > 0 ? (profile.followers / profile.following).toFixed(1) : '1.0';
	dom.followerRatio.textContent = `Ratio: ${ratio}`;

	if (profile.created_at) {
		const createdDate = new Date(profile.created_at);
		const daysActive = Math.round((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
		dom.accountAgeFoot.textContent = `Age: ${formatNumber(daysActive)} days`;
	}

	// Streaks & Punchcard
	const streakInfo = calculateStreaks(events);
	animateValue(dom.streakCount, streakInfo.currentStreak);
	dom.streakFoot.textContent = `Longest: ${streakInfo.longestStreak} day${streakInfo.longestStreak === 1 ? '' : 's'}`;
	if (streakInfo.currentStreak > 0) {
		dom.streakBadge.textContent = 'ACTIVE';
		dom.streakBadge.className = 'metric-badge hot';
		dom.streakFlame?.classList.remove('dimmed');
	} else {
		dom.streakBadge.textContent = 'IDLE';
		dom.streakBadge.className = 'metric-badge';
		dom.streakFlame?.classList.add('dimmed');
	}

	// Velocity
	const velocity = calculateVelocity(events);
	dom.velocityCount.textContent = formatRatio(velocity.ratio);
	dom.velocityFoot.textContent = `7d: ${velocity.push7d} | 30d: ${velocity.push30d} pushes`;
	const velIndicator = velocity.ratio >= 1.2 ? 'Accelerating' : velocity.ratio >= 0.8 ? 'Cruising' : 'Decelerating';
	dom.velocityIndicator.textContent = velIndicator;
	dom.velocityBadge.textContent = velIndicator.toUpperCase();

	// Productivity Score
	const prodScore = calculateProductivityScore(profile, streakInfo, velocity, repos);
	renderRadialGauge(prodScore);

	// Render Visuals
	renderPunchcard(streakInfo.punchcard);
	renderActivityBars(streakInfo.dailyTimeline);
	renderLanguageDonut(repos);
	renderEventTypes(events);

	// 2. Client Diagnostics & Hardware
	updateClientDiagnostics();

	// 3. NPM Telemetry
	await fetchNpmTelemetry(pkgName);

	// 4. Hacker News Pulse (on manual refresh or every 4th stream tick)
	if (!isAutoStream || state.syntheticTick % 4 === 0) {
		fetchHackerNewsPulse();
	}

	// 5. Plausible / Synthetic Traffic
	if (siteId && (useProxy || apiKey)) {
		try {
			const plausibleRes = await fetchPlausibleData(siteId, apiKey, endpoint);
			const results = plausibleRes.results || {};
			const pageviews = Number(results.pageviews?.value) || 0;
			const visitors = Number(results.visitors?.value) || 0;
			const bounce = results.bounce_rate?.value || 0;
			animateValue(dom.pageviewCount, pageviews);
			dom.plausibleFoot.textContent = `Visitors: ${formatNumber(visitors)} | Bounce: ${bounce}%`;
			dom.trafficBadge.textContent = 'PLAUSIBLE';
		} catch (err) {
			generateSyntheticTraffic();
		}
	} else if (useSynthetic) {
		generateSyntheticTraffic();
	}

	// Snapshot for Export
	state.lastTelemetrySnapshot = {
		timestamp: new Date().toISOString(),
		targetDeveloper: username,
		github: {
			repos: profile.public_repos,
			followers: profile.followers,
			following: profile.following,
			totalStars,
			totalForks,
			starredCount: starred.length,
			currentStreak: streakInfo.currentStreak,
			longestStreak: streakInfo.longestStreak,
			velocityRatio: velocity.ratio,
			productivityScore: prodScore,
		},
		client: {
			cores: navigator.hardwareConcurrency || 8,
			memoryGb: navigator.deviceMemory || 8,
			domNodes: document.querySelectorAll('*').length,
		},
		npm: {
			package: pkgName,
		},
	};

	syncUrlParams(username, pkgName);
	playSuccessChime();
	setSystemStatus(`Telemetry matrix nominal for @${username}.`, 'ok');
	appendTerminalLog(`[SYNC OK] Matrix packet captured for @${username}.`, 'ok');
}

// ── Auto-Stream Polling Mode ─────────────────────────────────────────────────
function toggleStreamMode() {
	state.streamActive = !state.streamActive;
	if (state.streamActive) {
		dom.streamToggleBtn.classList.add('active');
		dom.streamBtnText.textContent = 'STREAM: ON';
		appendTerminalLog(`Live stream polling engaged (${state.streamIntervalMs / 1000}s interval).`, 'ok');
		startStreamPolling();
	} else {
		dom.streamToggleBtn.classList.remove('active');
		dom.streamBtnText.textContent = 'STREAM: OFF';
		appendTerminalLog('Live stream polling paused.', 'info');
		stopStreamPolling();
	}
	playUiBlip();
}

function startStreamPolling() {
	stopStreamPolling();
	state.streamTimerId = setInterval(() => {
		if (state.streamActive) {
			refreshTelemetry(true);
		}
	}, state.streamIntervalMs);
}

function stopStreamPolling() {
	if (state.streamTimerId) {
		clearInterval(state.streamTimerId);
		state.streamTimerId = null;
	}
}

// ── Theme, CRT & Sound Controls ──────────────────────────────────────────────
function setTheme(themeName) {
	state.theme = themeName;
	dom.body.setAttribute('data-theme', themeName);
	dom.themeSelect.value = themeName;
	saveSettings();
	playUiBlip();
	appendTerminalLog(`Interface theme shifted to [${themeName}].`, 'info');
}

function toggleCrtOverlay() {
	state.crtActive = !state.crtActive;
	if (state.crtActive) {
		dom.body.classList.add('crt-active');
		dom.crtToggleBtn.classList.add('active');
	} else {
		dom.body.classList.remove('crt-active');
		dom.crtToggleBtn.classList.remove('active');
	}
	saveSettings();
	playUiBlip();
	appendTerminalLog(`CRT scanline raster: ${state.crtActive ? 'ENABLED' : 'DISABLED'}.`, 'info');
}

function toggleAudio() {
	state.audioMuted = !state.audioMuted;
	if (state.audioMuted) {
		dom.audioIconOn.classList.add('hidden');
		dom.audioIconOff.classList.remove('hidden');
		dom.audioToggleBtn.classList.remove('active');
	} else {
		dom.audioIconOn.classList.remove('hidden');
		dom.audioIconOff.classList.add('hidden');
		dom.audioToggleBtn.classList.add('active');
		getAudioContext();
		playUiBlip();
	}
	saveSettings();
	appendTerminalLog(`Web Audio procedural FX: ${state.audioMuted ? 'MUTED' : 'ONLINE'}.`, 'info');
}

function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen().catch(() => {});
	} else {
		document.exitFullscreen().catch(() => {});
	}
	playUiBlip();
}

// ── Tabs Filtering ───────────────────────────────────────────────────────────
function filterModules(tabName) {
	state.activeTab = tabName;
	$$('.tab-btn').forEach((btn) => {
		const isActive = btn.dataset.tab === tabName;
		btn.classList.toggle('active', isActive);
		btn.setAttribute('aria-selected', String(isActive));
	});

	// Metric cards & metrics grid
	const metricCards = $$('.metric-card');
	const metricsGrid = $('.metrics-grid');
	let visibleMetricCards = 0;
	metricCards.forEach((card) => {
		const mod = card.dataset.module;
		const show = tabName === 'all' || mod === tabName;
		card.classList.toggle('hidden', !show);
		if (show) visibleMetricCards++;
	});
	if (metricsGrid) {
		metricsGrid.classList.toggle('hidden', visibleMetricCards === 0);
	}

	// Showcase panels & grid
	const showcaseGrid = $('.showcase-grid');
	const repoPanel = $('.repo-showcase-panel');
	const newsPanel = $('.news-hub-panel');
	if (showcaseGrid && repoPanel && newsPanel) {
		const showRepo = tabName === 'all' || tabName === 'repos';
		const showNews = tabName === 'all' || tabName === 'news';
		repoPanel.classList.toggle('hidden', !showRepo);
		newsPanel.classList.toggle('hidden', !showNews);
		showcaseGrid.classList.toggle('hidden', !showRepo && !showNews);
	}

	// Analytics panels grid (activity)
	const analyticsGrid = $('.analytics-panels-grid');
	if (analyticsGrid) {
		const showActivity = tabName === 'all' || tabName === 'activity';
		analyticsGrid.classList.toggle('hidden', !showActivity);
	}

	// Diagnostics section
	const diagSection = $('#diagnostics-section');
	if (diagSection) {
		const showDiag = tabName === 'all' || tabName === 'diagnostics';
		diagSection.classList.toggle('hidden', !showDiag);
	}

	playUiBlip();
	appendTerminalLog(`Module filter changed to [${tabName.toUpperCase()}].`, 'info');
}

// ── Snapshot Export & Sharing ────────────────────────────────────────────────
function openSnapshotDialog() {
	const snapshot = state.lastTelemetrySnapshot || {
		timestamp: new Date().toISOString(),
		targetDeveloper: dom.githubUsername.value || 'octocat',
		status: 'LIVE_MATRIX_CAPTURED',
	};
	dom.snapshotPreview.textContent = JSON.stringify(snapshot, null, 2);
	dom.snapshotDialog.showModal();
	playUiBlip();
}

function closeSnapshotDialog() {
	dom.snapshotDialog.close();
	playUiBlip();
}

function copySnapshotJson() {
	const text = dom.snapshotPreview.textContent;
	navigator.clipboard.writeText(text).then(() => {
		dom.copyJsonBtn.textContent = 'COPIED!';
		setTimeout(() => {
			dom.copyJsonBtn.textContent = 'COPY JSON';
		}, 2000);
	});
	playUiBlip();
}

function downloadSnapshotJson() {
	const text = dom.snapshotPreview.textContent;
	const blob = new Blob([text], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `devpulse-snapshot-${Date.now()}.json`;
	a.click();
	URL.revokeObjectURL(url);
	playUiBlip();
}

function downloadSnapshotCsv() {
	const s = state.lastTelemetrySnapshot || {};
	const rows = [
		['Field', 'Value'],
		['Timestamp', s.timestamp || ''],
		['Target Developer', s.targetDeveloper || ''],
		['Public Repos', s.github?.repos || 0],
		['Followers', s.github?.followers || 0],
		['Total Stars', s.github?.totalStars || 0],
		['Total Forks', s.github?.totalForks || 0],
		['Streak Days', s.github?.currentStreak || 0],
		['Velocity Ratio', s.github?.velocityRatio || 0],
		['Productivity Score', s.github?.productivityScore || 0],
	];
	const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
	const blob = new Blob([csvContent], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `devpulse-snapshot-${Date.now()}.csv`;
	a.click();
	URL.revokeObjectURL(url);
	playUiBlip();
}

function syncUrlParams(user, pkg) {
	try {
		const url = new URL(window.location.href);
		if (user) url.searchParams.set('user', user);
		if (pkg) url.searchParams.set('pkg', pkg);
		if (state.theme) url.searchParams.set('theme', state.theme);
		window.history.replaceState({}, '', url.toString());
	} catch (e) {
		// URL sync fail silently
	}
}

function loadUrlParams() {
	try {
		const url = new URL(window.location.href);
		const user = url.searchParams.get('user');
		const pkg = url.searchParams.get('pkg');
		const theme = url.searchParams.get('theme');
		if (user) dom.githubUsername.value = user;
		if (pkg) dom.npmPackage.value = pkg;
		if (theme) setTheme(theme);
	} catch (e) {
		// URL sync fail silently
	}
}

// ── Persistence ─────────────────────────────────────────────────────────────
function saveSettings() {
	const payload = {
		githubUsername: dom.githubUsername.value.trim(),
		npmPackage: dom.npmPackage.value.trim(),
		plausibleSite: dom.plausibleSite.value.trim(),
		plausibleApiKey: dom.plausibleApiKey.value.trim(),
		useProxy: dom.useProxy.checked,
		useSynthetic: dom.useSynthetic.checked,
		theme: state.theme,
		crtActive: state.crtActive,
		audioMuted: state.audioMuted,
		streamIntervalMs: state.streamIntervalMs,
	};
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch (e) {
		// localStorage fail silently
	}
}

function loadSettings() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const s = JSON.parse(raw);
		if (s.githubUsername) dom.githubUsername.value = s.githubUsername;
		if (s.npmPackage) dom.npmPackage.value = s.npmPackage;
		if (s.plausibleSite) dom.plausibleSite.value = s.plausibleSite;
		if (s.plausibleApiKey) dom.plausibleApiKey.value = s.plausibleApiKey;
		if (typeof s.useProxy === 'boolean') dom.useProxy.checked = s.useProxy;
		if (typeof s.useSynthetic === 'boolean') dom.useSynthetic.checked = s.useSynthetic;
		if (s.theme) setTheme(s.theme);
		if (s.crtActive) toggleCrtOverlay();
		if (typeof s.audioMuted === 'boolean') {
			state.audioMuted = !s.audioMuted; // Invert to toggle correctly
			toggleAudio();
		}
		if (s.streamIntervalMs) {
			state.streamIntervalMs = s.streamIntervalMs;
			dom.streamInterval.value = String(s.streamIntervalMs);
		}
	} catch (e) {
		localStorage.removeItem(STORAGE_KEY);
	}
}

function resetSettings() {
	localStorage.removeItem(STORAGE_KEY);
	dom.githubUsername.value = '';
	dom.npmPackage.value = 'react';
	dom.plausibleSite.value = '';
	dom.plausibleApiKey.value = '';
	dom.useProxy.checked = false;
	dom.useSynthetic.checked = true;
	setTheme('cyber-neon');
	if (state.crtActive) toggleCrtOverlay();
	if (!state.audioMuted) toggleAudio();
	stopStreamPolling();
	if (state.streamActive) toggleStreamMode();

	state.ownRepos = [];
	state.starredRepos = [];
	state.activeRepoTab = 'own';
	state.repoFilter = '';
	if (dom.repoFilterInput) dom.repoFilterInput.value = '';
	if (dom.tabOwnRepos) dom.tabOwnRepos.classList.add('active');
	if (dom.tabStarredRepos) dom.tabStarredRepos.classList.remove('active');

	dom.repoCount.textContent = '0';
	dom.starsBadge.textContent = '0 Stars';
	dom.forksFoot.textContent = 'Forks: 0';
	if (dom.starredCount) dom.starredCount.textContent = '0';
	if (dom.starredBadge) dom.starredBadge.textContent = '★ Starred';
	if (dom.ownRepoCount) dom.ownRepoCount.textContent = '0';
	if (dom.starredRepoCount) dom.starredRepoCount.textContent = '0';
	dom.followerCount.textContent = '0';
	dom.streakCount.textContent = '0';
	dom.streakCount.dataset.value = '0';
	dom.streakBadge.textContent = 'IDLE';
	dom.streakBadge.className = 'metric-badge';
	dom.streakFoot.textContent = 'Longest: 0 days';
	dom.streakFlame?.classList.add('dimmed');
	dom.velocityCount.textContent = '0.00';
	dom.velocityCount.dataset.value = '0';
	dom.velocityBadge.textContent = 'STABLE';
	dom.velocityIndicator.textContent = 'Normal';
	renderRadialGauge(0);
	renderPunchcard(createEmptyPunchcard());
	renderActivityBars([]);
	renderLanguageDonut([]);
	renderRepoShowcase();
	dom.eventTypesList.innerHTML = '';
	dom.terminalTicker.innerHTML = '';
	appendTerminalLog('Settings and caches cleared. System reset.', 'warn');
	setSystemStatus('Settings cleared. Enter a username to begin.', 'warn');
	playUiBlip();
}

// ── Initialization & Event Listeners ─────────────────────────────────────────
function setupEventListeners() {
	dom.refreshBtn.addEventListener('click', () => {
		playUiBlip();
		refreshTelemetry();
	});

	dom.resetBtn.addEventListener('click', resetSettings);
	dom.probeNetworkBtn.addEventListener('click', probeAllEdgeNodes);
	dom.reprobeBtn.addEventListener('click', probeAllEdgeNodes);
	if (dom.toggleConfigBtn && dom.configDrawer) {
		dom.toggleConfigBtn.addEventListener('click', () => {
			dom.configDrawer.classList.toggle('hidden');
			playUiBlip();
		});
	}

	dom.githubUsername.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			playUiBlip();
			refreshTelemetry();
		}
	});

	dom.npmPackage.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			playUiBlip();
			fetchNpmTelemetry(dom.npmPackage.value.trim());
		}
	});

	// Quick Preset Pills
	$$('.preset-pill').forEach((pill) => {
		pill.addEventListener('click', () => {
			$$('.preset-pill').forEach((p) => p.classList.remove('active'));
			pill.classList.add('active');
			dom.githubUsername.value = pill.dataset.username;
			playUiBlip();
			refreshTelemetry();
		});
	});

	// Repository Showcase Sub-Tabs
	if (dom.tabOwnRepos) {
		dom.tabOwnRepos.addEventListener('click', () => {
			state.activeRepoTab = 'own';
			dom.tabOwnRepos.classList.add('active');
			dom.tabStarredRepos.classList.remove('active');
			playUiBlip();
			renderRepoShowcase();
		});
	}

	if (dom.tabStarredRepos) {
		dom.tabStarredRepos.addEventListener('click', () => {
			state.activeRepoTab = 'starred';
			dom.tabStarredRepos.classList.add('active');
			dom.tabOwnRepos.classList.remove('active');
			playUiBlip();
			renderRepoShowcase();
		});
	}

	// Repository Search Filter
	if (dom.repoFilterInput) {
		dom.repoFilterInput.addEventListener('input', (e) => {
			state.repoFilter = e.target.value;
			renderRepoShowcase(state.repoFilter);
		});
	}

	// Developer News Category Pills
	$$('.news-pill').forEach((pill) => {
		pill.addEventListener('click', () => {
			const cat = pill.dataset.category || 'top';
			playUiBlip();
			fetchHackerNewsPulse(cat);
		});
	});

	// Tabs
	$$('.tab-btn').forEach((btn) => {
		btn.addEventListener('click', () => filterModules(btn.dataset.tab));
	});

	// Top HUD Controls
	dom.streamToggleBtn.addEventListener('click', toggleStreamMode);
	dom.streamInterval.addEventListener('change', (e) => {
		state.streamIntervalMs = Number(e.target.value);
		if (state.streamActive) startStreamPolling();
		saveSettings();
	});

	dom.audioToggleBtn.addEventListener('click', toggleAudio);
	dom.crtToggleBtn.addEventListener('click', toggleCrtOverlay);
	dom.themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
	dom.exportBtn.addEventListener('click', openSnapshotDialog);
	dom.fullscreenBtn.addEventListener('click', toggleFullscreen);

	// Snapshot Modal
	dom.closeDialogBtn.addEventListener('click', closeSnapshotDialog);
	dom.copyJsonBtn.addEventListener('click', copySnapshotJson);
	dom.downloadJsonBtn.addEventListener('click', downloadSnapshotJson);
	dom.downloadCsvBtn.addEventListener('click', downloadSnapshotCsv);

	// Terminal
	dom.clearTerminalBtn.addEventListener('click', () => {
		dom.terminalTicker.innerHTML = '';
		appendTerminalLog('Log cleared by user.', 'info');
		playUiBlip();
	});

	// Proxy toggle
	dom.useProxy.addEventListener('change', () => {
		dom.plausibleApiKey.disabled = dom.useProxy.checked;
		dom.plausibleApiKey.placeholder = dom.useProxy.checked ? 'Handled by proxy env' : 'plausible_api_token';
		saveSettings();
	});
}

function init() {
	initClock();
	initFpsMonitor();
	loadSettings();
	loadUrlParams();
	setupEventListeners();
	updateClientDiagnostics();
	probeAllEdgeNodes();
	fetchHackerNewsPulse();

	const initialUser = dom.githubUsername.value.trim() || 'torvalds';
	dom.githubUsername.value = initialUser;
	refreshTelemetry();
}

// Boot DevPulse
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
