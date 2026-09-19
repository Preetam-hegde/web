'use strict';

/* ── VectorDrift Analytics & Telemetry Engine ───────────────── */
const STORE_KEY = 'vectordrift:v1';

const blankStore = () => ({
	runs: [],
	best: {},
	settings: {
		masterVol: 0.4,
		musicVol: 0.35,
		sfxVol: 0.5,
		reticle: 'tactical',
		screenshake: true,
		particles: 'high'
	}
});

let store = (() => {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
		return { ...blankStore(), ...parsed };
	} catch {
		return blankStore();
	}
})();

function saveStore() {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(store));
	} catch {
		// Private browsing or quota exceeded
	}
}

class TelemetryTracker {
	constructor() {
		this.reset();
	}

	reset() {
		this.mode = 'graze-arena';
		this.diff = 'pilot';
		this.durationLimit = 60;
		this.startTime = 0;
		this.endTime = 0;

		this.positions = []; // [{x, y, t, grazing, proximity, speed}]
		this.samples = []; // [{t, multiplier, nearestDist, isGrazing}]
		this.totalDistance = 0;
		this.grazeDistance = 0;
		this.totalGrazeTime = 0;
		this.grazeCount = 0;
		this.peakMultiplier = 1.0;
		this.closestNearMiss = 999;
		this.proximitySum = 0;
		this.proximitySampleCount = 0;

		this.prevPos = null;
		this.lastSampleTime = 0;

		// 2D spatial grid for movement heatmap (64x36 bins)
		this.gridW = 64;
		this.gridH = 36;
		this.heatGrid = new Float32Array(this.gridW * this.gridH);
		this.grazeGrid = new Float32Array(this.gridW * this.gridH);
	}

	start(mode, diff, durationLimit) {
		this.reset();
		this.mode = mode;
		this.diff = diff;
		this.durationLimit = durationLimit;
		this.startTime = performance.now();
	}

	recordFrame(cursorX, cursorY, viewportW, viewportH, isGrazing, proximityPx, multiplier, dt) {
		const now = performance.now();
		const elapsedSec = (now - this.startTime) / 1000;

		// 1. Distance & Velocity calculation
		if (this.prevPos) {
			const dx = cursorX - this.prevPos.x;
			const dy = cursorY - this.prevPos.y;
			const dist = Math.hypot(dx, dy);
			this.totalDistance += dist;
			if (isGrazing) {
				this.grazeDistance += dist;
			}
		}
		this.prevPos = { x: cursorX, y: cursorY };

		// 2. Spatial Grid Heatmap accumulation
		const normX = Math.max(0, Math.min(1, cursorX / viewportW));
		const normY = Math.max(0, Math.min(1, cursorY / viewportH));
		const cellX = Math.floor(normX * (this.gridW - 1));
		const cellY = Math.floor(normY * (this.gridH - 1));
		const cellIdx = cellY * this.gridW + cellX;

		this.heatGrid[cellIdx] += dt * 4;
		if (isGrazing) {
			this.grazeGrid[cellIdx] += dt * 10;
		}

		// 3. Graze & Proximity tracking
		if (isGrazing) {
			this.totalGrazeTime += dt;
			this.proximitySum += proximityPx;
			this.proximitySampleCount++;
			if (proximityPx < this.closestNearMiss) {
				this.closestNearMiss = proximityPx;
			}
		}

		if (multiplier > this.peakMultiplier) {
			this.peakMultiplier = multiplier;
		}

		// 4. Sample timeline every 100ms
		if (now - this.lastSampleTime >= 100) {
			this.lastSampleTime = now;
			this.samples.push({
				t: elapsedSec,
				multiplier: multiplier,
				nearestDist: proximityPx,
				isGrazing: isGrazing
			});

			// Keep a downsampled path for the trail visualization
			if (this.positions.length < 1200) {
				this.positions.push({
					x: normX,
					y: normY,
					t: elapsedSec,
					grazing: isGrazing
				});
			}
		}
	}

	finish(finalScore, completed) {
		this.endTime = performance.now();
		const durationSec = Math.max(0.1, (this.endTime - this.startTime) / 1000);

		// Calculate Movement Efficiency %
		// Ratio of active grazing navigation vs purposeless wandering
		const distanceRatio = this.totalDistance > 0 ? (this.grazeDistance / this.totalDistance) : 0;
		const timeRatio = durationSec > 0 ? (this.totalGrazeTime / durationSec) : 0;
		// Efficiency blends purposeful graze distance and active engagement
		const rawEfficiency = (distanceRatio * 0.6 + timeRatio * 0.4) * 100;
		const efficiency = Math.min(99.9, Math.max(5.0, rawEfficiency + 15));

		const avgProximity = this.proximitySampleCount > 0
			? (this.proximitySum / this.proximitySampleCount)
			: 0;

		const runData = {
			id: Date.now(),
			date: new Date().toISOString(),
			mode: this.mode,
			diff: this.diff,
			durationLimit: this.durationLimit,
			survivalTime: durationSec,
			completed: completed,
			score: Math.round(finalScore),
			peakMultiplier: parseFloat(this.peakMultiplier.toFixed(1)),
			avgProximity: parseFloat(avgProximity.toFixed(1)),
			closestNearMiss: this.closestNearMiss === 999 ? 0 : parseFloat(this.closestNearMiss.toFixed(1)),
			movementEfficiency: parseFloat(efficiency.toFixed(1)),
			totalDistance: Math.round(this.totalDistance),
			samples: this.samples,
			positions: this.positions,
			heatGrid: Array.from(this.heatGrid),
			grazeGrid: Array.from(this.grazeGrid)
		};

		// Save into store
		const bestKey = `${this.mode}:${this.diff}`;
		const currentBest = store.best[bestKey] || 0;
		const isNewBest = runData.score > currentBest;
		if (isNewBest) {
			store.best[bestKey] = runData.score;
		}

		store.runs.unshift(runData);
		if (store.runs.length > 50) {
			store.runs.pop();
		}
		saveStore();

		return { runData, isNewBest };
	}

	/* ── Render Movement Heatmap ─────────────────────────────── */
	renderHeatmapCanvas(canvas, runData) {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		const w = canvas.width;
		const h = canvas.height;

		ctx.clearRect(0, 0, w, h);

		// 1. Dark tactical grid background
		ctx.fillStyle = '#03050a';
		ctx.fillRect(0, 0, w, h);

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
		ctx.lineWidth = 1;
		const step = 24;
		for (let x = 0; x < w; x += step) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}
		for (let y = 0; y < h; y += step) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}

		// 2. Render Heatmap Density
		const gw = this.gridW;
		const gh = this.gridH;
		const cellW = w / gw;
		const cellH = h / gh;
		const heat = runData.heatGrid || [];
		const graze = runData.grazeGrid || [];

		// Find peak intensity
		let maxVal = 0.001;
		for (let i = 0; i < heat.length; i++) {
			const v = heat[i] + (graze[i] || 0) * 1.5;
			if (v > maxVal) maxVal = v;
		}

		for (let y = 0; y < gh; y++) {
			for (let x = 0; x < gw; x++) {
				const idx = y * gw + x;
				const hVal = heat[idx] || 0;
				const gVal = graze[idx] || 0;
				const total = (hVal + gVal * 2.0) / maxVal;

				if (total > 0.02) {
					const alpha = Math.min(0.85, total * 0.9);
					// Dynamic heatmap color gradient: deep navy -> cyan -> magenta -> white hot
					if (gVal > 0.1) {
						// Graze hot spot
						ctx.fillStyle = `rgba(255, 0, 128, ${alpha})`;
					} else {
						// Dwell / movement spot
						ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.6})`;
					}
					ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
				}
			}
		}

		// 3. Render Cursor Path Trail Overlay
		const pts = runData.positions || [];
		if (pts.length > 1) {
			ctx.lineWidth = 1.5;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			for (let i = 1; i < pts.length; i++) {
				const p0 = pts[i - 1];
				const p1 = pts[i];

				ctx.beginPath();
				ctx.moveTo(p0.x * w, p0.y * h);
				ctx.lineTo(p1.x * w, p1.y * h);

				if (p1.grazing) {
					ctx.strokeStyle = 'rgba(255, 0, 128, 0.7)';
					ctx.shadowColor = '#ff0080';
					ctx.shadowBlur = 8;
				} else {
					ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
					ctx.shadowBlur = 0;
				}
				ctx.stroke();
			}
			ctx.shadowBlur = 0;

			// Death point marker (last point)
			const lastPt = pts[pts.length - 1];
			if (lastPt && !runData.completed) {
				ctx.fillStyle = '#ff0055';
				ctx.shadowColor = '#ff0055';
				ctx.shadowBlur = 12;
				ctx.beginPath();
				ctx.arc(lastPt.x * w, lastPt.y * h, 5, 0, Math.PI * 2);
				ctx.fill();
				ctx.shadowBlur = 0;
			}
		}
	}

	/* ── Render Survival Timeline SVG ────────────────────────── */
	renderTimelineSvg(container, runData) {
		if (!container) return;
		const samples = runData.samples || [];
		if (samples.length === 0) {
			container.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">No telemetry data recorded</div>';
			return;
		}

		const totalTime = runData.survivalTime || 1;
		const peakMult = Math.max(5, runData.peakMultiplier || 1);
		const svgW = 600;
		const svgH = 280;
		const padL = 45;
		const padR = 25;
		const padT = 30;
		const padB = 40;
		const chartW = svgW - padL - padR;
		const chartH = svgH - padT - padB;

		// Build multiplier path and graze zone polygons
		let multPath = '';
		let areaPath = `M ${padL} ${padT + chartH}`;
		let grazeSegments = [];
		let currentGrazeStart = null;

		samples.forEach((s, idx) => {
			const x = padL + (s.t / totalTime) * chartW;
			const y = padT + chartH - ((s.multiplier - 1) / (peakMult - 1)) * chartH;

			if (idx === 0) {
				multPath += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
			} else {
				multPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
			}
			areaPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;

			if (s.isGrazing && currentGrazeStart === null) {
				currentGrazeStart = x;
			} else if (!s.isGrazing && currentGrazeStart !== null) {
				grazeSegments.push({ x1: currentGrazeStart, x2: x });
				currentGrazeStart = null;
			}
		});

		if (currentGrazeStart !== null) {
			grazeSegments.push({ x1: currentGrazeStart, x2: padL + chartW });
		}

		areaPath += ` L ${padL + chartW} ${padT + chartH} Z`;

		// SVG Template
		let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;">
			<defs>
				<linearGradient id="multGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#00f0ff" stop-opacity="0.45"/>
					<stop offset="100%" stop-color="#00f0ff" stop-opacity="0.0"/>
				</linearGradient>
			</defs>

			<!-- Background Grid Lines -->
			<line x1="${padL}" y1="${padT}" x2="${padL + chartW}" y2="${padT}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
			<line x1="${padL}" y1="${padT + chartH * 0.5}" x2="${padL + chartW}" y2="${padT + chartH * 0.5}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
			<line x1="${padL}" y1="${padT + chartH}" x2="${padL + chartW}" y2="${padT + chartH}" stroke="rgba(255,255,255,0.1)"/>

			<!-- Graze Active Zone Highlights -->
			${grazeSegments.map(g => `<rect x="${g.x1.toFixed(1)}" y="${padT}" width="${Math.max(2, g.x2 - g.x1).toFixed(1)}" height="${chartH}" fill="rgba(255, 0, 128, 0.12)"/>`).join('')}

			<!-- Multiplier Area & Line -->
			<path d="${areaPath}" fill="url(#multGrad)"/>
			<path d="${multPath}" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

			<!-- Axis Labels -->
			<text x="${padL - 10}" y="${padT + 4}" fill="#79829c" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="end">x${peakMult.toFixed(0)}</text>
			<text x="${padL - 10}" y="${padT + chartH * 0.5 + 4}" fill="#79829c" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="end">x${((peakMult + 1) / 2).toFixed(0)}</text>
			<text x="${padL - 10}" y="${padT + chartH + 4}" fill="#79829c" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="end">x1</text>

			<text x="${padL}" y="${padT + chartH + 20}" fill="#79829c" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="start">0.0s</text>
			<text x="${padL + chartW}" y="${padT + chartH + 20}" fill="#79829c" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="end">${totalTime.toFixed(1)}s</text>

			<!-- Fatal Hit Marker -->
			${!runData.completed ? `<circle cx="${padL + chartW}" cy="${padT + chartH - ((samples[samples.length - 1].multiplier - 1) / (peakMult - 1)) * chartH}" r="4.5" fill="#ff0055" stroke="#ffffff" stroke-width="1.5"/>` : ''}
		</svg>`;

		container.innerHTML = svg;
	}
}

window.telemetry = new TelemetryTracker();
window.store = store;
window.saveStore = saveStore;
