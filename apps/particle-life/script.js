"use strict";

document.addEventListener("DOMContentLoaded", () => {
	// ── Species Definition ──────────────────────────────────────────────────
	const SPECIES = [
		{ name: "Amber", color: "#fee440", rgb: [254, 228, 64] },
		{ name: "Teal", color: "#00f5d4", rgb: [0, 245, 212] },
		{ name: "Ruby", color: "#ff4d6d", rgb: [255, 77, 109] },
		{ name: "Cyan", color: "#00bbf9", rgb: [0, 187, 249] },
		{ name: "Violet", color: "#b5179e", rgb: [181, 23, 158] },
		{ name: "Topaz", color: "#ff9e00", rgb: [255, 158, 0] },
	];
	const NUM_SPECIES = SPECIES.length;

	// ── Curated Biome Presets ────────────────────────────────────────────────
	const PRESETS = {
		primordial: {
			name: "Primordial Soup",
			matrix: [
				[0.4, -0.6, 0.2, 0.5, -0.3, 0.1],
				[0.2, 0.6, -0.4, 0.3, -0.2, 0.5],
				[-0.5, 0.3, 0.7, -0.6, 0.4, -0.1],
				[0.6, -0.3, 0.2, 0.5, -0.5, 0.2],
				[-0.2, 0.4, -0.3, 0.6, 0.8, -0.4],
				[0.3, -0.2, 0.5, -0.4, 0.2, 0.6],
			],
			rMax: 85,
			rMin: 22,
			friction: 0.88,
			count: 1600,
		},
		cellular: {
			name: "Cellular Mitosis",
			matrix: [
				[0.85, -0.7, 0.1, -0.15, -0.3, 0.05],
				[0.75, 0.9, -0.8, 0.2, -0.1, -0.25],
				[-0.6, 0.8, 0.85, -0.75, 0.15, 0.1],
				[0.1, -0.4, 0.85, 0.9, -0.85, 0.3],
				[-0.3, 0.2, -0.5, 0.85, 0.95, -0.7],
				[0.2, -0.3, 0.1, -0.4, 0.85, 0.85],
			],
			rMax: 95,
			rMin: 24,
			friction: 0.86,
			count: 1800,
		},
		predator: {
			name: "Predator & Prey",
			matrix: [
				[0.5, -0.85, 0.0, 0.7, -0.4, 0.1],
				[0.9, 0.4, -0.9, 0.0, 0.6, -0.3],
				[-0.2, 0.95, 0.6, -0.85, 0.0, 0.5],
				[-0.75, 0.1, 0.9, 0.5, -0.9, 0.0],
				[0.0, -0.7, 0.2, 0.95, 0.4, -0.85],
				[0.7, 0.0, -0.65, 0.1, 0.9, 0.55],
			],
			rMax: 110,
			rMin: 20,
			friction: 0.91,
			count: 1600,
		},
		galaxies: {
			name: "Spiral Disk",
			matrix: [
				[0.75, 0.5, -0.2, 0.4, -0.5, 0.3],
				[-0.4, 0.8, 0.6, -0.3, 0.5, -0.2],
				[0.3, -0.5, 0.75, 0.5, -0.2, 0.4],
				[-0.2, 0.4, -0.4, 0.8, 0.6, -0.3],
				[0.5, -0.3, 0.3, -0.5, 0.75, 0.5],
				[-0.3, 0.6, -0.2, 0.4, -0.4, 0.8],
			],
			rMax: 120,
			rMin: 26,
			friction: 0.92,
			count: 1800,
		},
		serpents: {
			name: "Serpent Chains",
			matrix: [
				[0.2, 0.9, -0.3, -0.1, -0.1, 0.1],
				[-0.2, 0.2, 0.9, -0.3, -0.1, -0.1],
				[-0.1, -0.2, 0.2, 0.9, -0.3, -0.1],
				[-0.1, -0.1, -0.2, 0.2, 0.9, -0.3],
				[-0.3, -0.1, -0.1, -0.2, 0.2, 0.9],
				[0.9, -0.3, -0.1, -0.1, -0.2, 0.2],
			],
			rMax: 70,
			rMin: 18,
			friction: 0.85,
			count: 1700,
		},
		crystallography: {
			name: "Crystal Net",
			matrix: [
				[0.9, -0.4, -0.4, -0.4, -0.4, -0.4],
				[-0.4, 0.9, -0.4, -0.4, -0.4, -0.4],
				[-0.4, -0.4, 0.9, -0.4, -0.4, -0.4],
				[-0.4, -0.4, -0.4, 0.9, -0.4, -0.4],
				[-0.4, -0.4, -0.4, -0.4, 0.9, -0.4],
				[-0.4, -0.4, -0.4, -0.4, -0.4, 0.9],
			],
			rMax: 65,
			rMin: 24,
			friction: 0.84,
			count: 1500,
		},
		symbiosis: {
			name: "Symbiosis",
			matrix: [
				[0.6, 0.8, -0.5, 0.0, -0.4, 0.0],
				[0.8, 0.6, 0.0, -0.5, 0.0, -0.4],
				[-0.5, 0.0, 0.6, 0.8, -0.5, 0.0],
				[0.0, -0.5, 0.8, 0.6, 0.0, -0.5],
				[-0.4, 0.0, -0.5, 0.0, 0.6, 0.8],
				[0.0, -0.4, 0.0, -0.5, 0.8, 0.6],
			],
			rMax: 90,
			rMin: 22,
			friction: 0.89,
			count: 1600,
		},
	};

	// ── State ────────────────────────────────────────────────────────────────
	const canvas = document.getElementById("lifeCanvas");
	const ctx = canvas.getContext("2d");

	let width = window.innerWidth;
	let height = window.innerHeight;
	let dpr = Math.min(window.devicePixelRatio || 1, 2);

	let isRunning = true;
	let particleCount = 1600;
	let rMax = 85;
	let rMin = 22;
	let friction = 0.88;
	let timeSpeed = 1.0;
	let wrapEdges = true;
	let motionTrails = true;
	let bloomGlow = true;

	let cursorTool = "attract";
	let isPointerDown = false;
	let pointerX = 0;
	let pointerY = 0;

	// Viewport Pan & Zoom
	let cameraZoom = 1.0;
	let cameraPanX = 0;
	let cameraPanY = 0;
	let isPanning = false;
	let panStartX = 0;
	let panStartY = 0;

	// Active Force Matrix (NUM_SPECIES x NUM_SPECIES)
	let matrix = JSON.parse(JSON.stringify(PRESETS.primordial.matrix));

	// Particle Storage: Flattened Typed Arrays for Maximum Throughput
	let maxParticles = 3500;
	let pX = new Float32Array(maxParticles);
	let pY = new Float32Array(maxParticles);
	let pVx = new Float32Array(maxParticles);
	let pVy = new Float32Array(maxParticles);
	let pSpecies = new Uint8Array(maxParticles);

	// Spatial Grid Partitioning
	let gridCols = 0;
	let gridRows = 0;
	let gridCellSize = rMax;
	let gridHead = new Int32Array(1);
	let gridNext = new Int32Array(maxParticles);

	// Telemetry
	let frameCount = 0;
	let lastFpsTime = performance.now();
	let currentFps = 60;
	let currentEnergy = 0;

	// Audio Engine (Web Audio API)
	let audioCtx = null;
	let isAudioActive = false;
	let droneNodes = [];
	let droneGain = null;

	// ── Initialize Simulation ────────────────────────────────────────────────
	function initSimulation() {
		resizeCanvas();
		initParticles(particleCount);
		rebuildSpatialGrid();
		renderMatrixGrid();
		setupEventListeners();
		requestAnimationFrame(simulationLoop);
	}

	function resizeCanvas() {
		width = window.innerWidth;
		height = window.innerHeight;
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		rebuildSpatialGrid();
	}

	function initParticles(count) {
		particleCount = Math.min(count, maxParticles);
		const margin = 40;
		for (let i = 0; i < particleCount; i++) {
			pX[i] = margin + Math.random() * (width - margin * 2);
			pY[i] = margin + Math.random() * (height - margin * 2);
			pVx[i] = (Math.random() - 0.5) * 1.5;
			pVy[i] = (Math.random() - 0.5) * 1.5;
			pSpecies[i] = Math.floor(Math.random() * NUM_SPECIES);
		}
		document.getElementById("countDisplay").textContent = particleCount;
	}

	function rebuildSpatialGrid() {
		gridCellSize = Math.max(rMax, 25);
		gridCols = Math.ceil(width / gridCellSize);
		gridRows = Math.ceil(height / gridCellSize);
		const totalCells = Math.max(1, gridCols * gridRows);
		gridHead = new Int32Array(totalCells).fill(-1);
	}

	// ── Physics Engine ───────────────────────────────────────────────────────
	function updatePhysics(dt) {
		const cols = gridCols;
		const rows = gridRows;
		const totalCells = cols * rows;
		gridHead.fill(-1);

		// Populate Spatial Grid Buckets
		for (let i = 0; i < particleCount; i++) {
			let cx = Math.floor(pX[i] / gridCellSize);
			let cy = Math.floor(pY[i] / gridCellSize);
			if (wrapEdges) {
				cx = ((cx % cols) + cols) % cols;
				cy = ((cy % rows) + rows) % rows;
			} else {
				cx = Math.max(0, Math.min(cols - 1, cx));
				cy = Math.max(0, Math.min(rows - 1, cy));
			}
			const cellIndex = cy * cols + cx;
			gridNext[i] = gridHead[cellIndex];
			gridHead[cellIndex] = i;
		}

		const rMaxSq = rMax * rMax;
		const rMinSq = rMin * rMin;
		const invDiff = 1.0 / (rMax - rMin);
		let totalKineticEnergy = 0;

		// Calculate N-Body Forces via Spatial Neighbors
		for (let i = 0; i < particleCount; i++) {
			const px = pX[i];
			const py = pY[i];
			const sA = pSpecies[i];
			const rowMatrix = matrix[sA];

			let fx = 0;
			let fy = 0;

			let cx = Math.floor(px / gridCellSize);
			let cy = Math.floor(py / gridCellSize);

			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					let ncx = cx + dx;
					let ncy = cy + dy;

					if (wrapEdges) {
						ncx = ((ncx % cols) + cols) % cols;
						ncy = ((ncy % rows) + rows) % rows;
					} else if (ncx < 0 || ncx >= cols || ncy < 0 || ncy >= rows) {
						continue;
					}

					let neighbor = gridHead[ncy * cols + ncx];
					while (neighbor !== -1) {
						if (neighbor !== i) {
							let nx = pX[neighbor];
							let ny = pY[neighbor];
							let distX = nx - px;
							let distY = ny - py;

							if (wrapEdges) {
								if (distX > width * 0.5) distX -= width;
								else if (distX < -width * 0.5) distX += width;
								if (distY > height * 0.5) distY -= height;
								else if (distY < -height * 0.5) distY += height;
							}

							const dSq = distX * distX + distY * distY;
							if (dSq > 0 && dSq < rMaxSq) {
								const d = Math.sqrt(dSq);
								const invD = 1.0 / d;
								let force = 0;

								if (d < rMin) {
									// Hardcore short-range repulsion
									force = -1.2 * (1.0 - d / rMin);
								} else {
									// Configurable inter-species matrix force
									const sB = pSpecies[neighbor];
									const attraction = rowMatrix[sB];
									const ramp =
										1.0 - Math.abs(2.0 * d - (rMax + rMin)) * invDiff;
									force = attraction * ramp;
								}

								fx += distX * invD * force;
								fy += distY * invD * force;
							}
						}
						neighbor = gridNext[neighbor];
					}
				}
			}

			// Interactive Cursor Forces (Attract / Repel / Vortex)
			if (isPointerDown) {
				const cWorldX = (pointerX - cameraPanX) / cameraZoom;
				const cWorldY = (pointerY - cameraPanY) / cameraZoom;
				let cDistX = cWorldX - px;
				let cDistY = cWorldY - py;

				if (wrapEdges) {
					if (cDistX > width * 0.5) cDistX -= width;
					else if (cDistX < -width * 0.5) cDistX += width;
					if (cDistY > height * 0.5) cDistY -= height;
					else if (cDistY < -height * 0.5) cDistY += height;
				}

				const cDistSq = cDistX * cDistX + cDistY * cDistY;
				const cursorRadius = 260;
				if (cDistSq < cursorRadius * cursorRadius && cDistSq > 1) {
					const cDist = Math.sqrt(cDistSq);
					const cFactor = 1.0 - cDist / cursorRadius;
					if (cursorTool === "attract") {
						fx += (cDistX / cDist) * 3.5 * cFactor;
						fy += (cDistY / cDist) * 3.5 * cFactor;
					} else if (cursorTool === "repel") {
						fx -= (cDistX / cDist) * 5.0 * cFactor;
						fy -= (cDistY / cDist) * 5.0 * cFactor;
					} else if (cursorTool === "vortex") {
						// Tangential force
						fx += (-cDistY / cDist) * 4.2 * cFactor;
						fy += (cDistX / cDist) * 4.2 * cFactor;
					}
				}
			}

			// Integrate Velocity & Viscosity
			const scale = 0.6 * timeSpeed;
			let vx = (pVx[i] + fx * scale) * friction;
			let vy = (pVy[i] + fy * scale) * friction;

			pVx[i] = vx;
			pVy[i] = vy;

			// Update Positions
			let x = px + vx * dt * timeSpeed;
			let y = py + vy * dt * timeSpeed;

			// Boundary Wrap or Elastic Bounce
			if (wrapEdges) {
				if (x < 0) x += width;
				else if (x >= width) x -= width;
				if (y < 0) y += height;
				else if (y >= height) y -= height;
			} else {
				if (x < 6) {
					x = 6;
					pVx[i] = -pVx[i] * 0.8;
				} else if (x > width - 6) {
					x = width - 6;
					pVx[i] = -pVx[i] * 0.8;
				}
				if (y < 6) {
					y = 6;
					pVy[i] = -pVy[i] * 0.8;
				} else if (y > height - 6) {
					y = height - 6;
					pVy[i] = -pVy[i] * 0.8;
				}
			}

			pX[i] = x;
			pY[i] = y;

			totalKineticEnergy += vx * vx + vy * vy;
		}

		currentEnergy = Math.round((totalKineticEnergy / particleCount) * 10) / 10;
		if (isAudioActive && audioCtx) {
			updateSonification(currentEnergy);
		}
	}

	// ── Render Pipeline ──────────────────────────────────────────────────────
	function drawScene() {
		ctx.save();

		// Screen Clear with Trail Persistence
		if (motionTrails) {
			ctx.fillStyle = "rgba(7, 8, 12, 0.32)";
			ctx.fillRect(0, 0, width, height);
		} else {
			ctx.clearRect(0, 0, width, height);
		}

		// Apply Camera Transform
		ctx.translate(cameraPanX, cameraPanY);
		ctx.scale(cameraZoom, cameraZoom);

		if (bloomGlow) {
			ctx.globalCompositeOperation = "lighter";
		}

		// Draw Particles by Species for Batch State Efficiency
		const radius = 2.4;
		for (let s = 0; s < NUM_SPECIES; s++) {
			ctx.fillStyle = SPECIES[s].color;
			ctx.beginPath();
			for (let i = 0; i < particleCount; i++) {
				if (pSpecies[i] === s) {
					const px = pX[i];
					const py = pY[i];
					ctx.moveTo(px + radius, py);
					ctx.arc(px, py, radius, 0, Math.PI * 2);
				}
			}
			ctx.fill();
		}

		ctx.globalCompositeOperation = "source-over";

		// Render Cursor Force Indicator
		if (isPointerDown) {
			const cWorldX = (pointerX - cameraPanX) / cameraZoom;
			const cWorldY = (pointerY - cameraPanY) / cameraZoom;
			ctx.beginPath();
			ctx.arc(cWorldX, cWorldY, 35, 0, Math.PI * 2);
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = cursorTool === "repel" ? "#ff4d6d" : "#00f5d4";
			ctx.stroke();
		}

		ctx.restore();
	}

	// ── Main Loop ────────────────────────────────────────────────────────────
	let lastFrameTime = performance.now();
	function simulationLoop(now) {
		const rawDelta = (now - lastFrameTime) / 1000;
		lastFrameTime = now;
		const dt = Math.min(rawDelta, 0.05);

		if (isRunning) {
			updatePhysics(dt * 60);
		}
		drawScene();

		// Telemetry FPS Calculation
		frameCount++;
		if (now - lastFpsTime >= 500) {
			currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
			frameCount = 0;
			lastFpsTime = now;
			document.getElementById("fpsDisplay").textContent = currentFps;
			document.getElementById("energyDisplay").textContent =
				currentEnergy.toFixed(1);
		}

		requestAnimationFrame(simulationLoop);
	}

	// ── Matrix UI & Preset Handlers ──────────────────────────────────────────
	function renderMatrixGrid() {
		const grid = document.getElementById("matrixGrid");
		grid.innerHTML = "";

		// Corner Top-Left Empty
		const corner = document.createElement("div");
		corner.className = "matrix-header-cell";
		grid.appendChild(corner);

		// Column Species Headers
		for (let col = 0; col < NUM_SPECIES; col++) {
			const head = document.createElement("div");
			head.className = "matrix-header-cell";
			head.style.color = SPECIES[col].color;
			head.textContent = SPECIES[col].name[0];
			head.title = SPECIES[col].name;
			grid.appendChild(head);
		}

		// Rows with Row Header + 6 Interaction Cells
		for (let row = 0; row < NUM_SPECIES; row++) {
			const rowHead = document.createElement("div");
			rowHead.className = "matrix-header-cell";
			rowHead.style.color = SPECIES[row].color;
			rowHead.textContent = SPECIES[row].name[0];
			rowHead.title = SPECIES[row].name;
			grid.appendChild(rowHead);

			for (let col = 0; col < NUM_SPECIES; col++) {
				const cell = document.createElement("div");
				cell.className = "matrix-cell";
				const val = matrix[row][col];
				updateCellVisuals(cell, val);
				cell.dataset.row = row;
				cell.dataset.col = col;

				// Click to step attraction (+0.25)
				cell.addEventListener("click", () => {
					let v = matrix[row][col];
					v += 0.25;
					if (v > 1.05) v = -1.0;
					matrix[row][col] = Math.round(v * 100) / 100;
					updateCellVisuals(cell, matrix[row][col]);
					triggerSoundChime(v);
				});

				// Right click to step down (-0.25)
				cell.addEventListener("contextmenu", (e) => {
					e.preventDefault();
					let v = matrix[row][col];
					v -= 0.25;
					if (v < -1.05) v = 1.0;
					matrix[row][col] = Math.round(v * 100) / 100;
					updateCellVisuals(cell, matrix[row][col]);
					triggerSoundChime(v);
				});

				grid.appendChild(cell);
			}
		}
	}

	function updateCellVisuals(cell, val) {
		cell.textContent = (val > 0 ? "+" : "") + val.toFixed(1);
		if (val > 0.05) {
			const intensity = Math.min(1, val);
			cell.style.background = `rgba(0, 245, 212, ${0.15 + intensity * 0.45})`;
			cell.style.color = "#00f5d4";
		} else if (val < -0.05) {
			const intensity = Math.min(1, Math.abs(val));
			cell.style.background = `rgba(255, 77, 109, ${0.15 + intensity * 0.45})`;
			cell.style.color = "#ff4d6d";
		} else {
			cell.style.background = "rgba(255, 255, 255, 0.04)";
			cell.style.color = "#5c6479";
		}
	}

	function applyPreset(presetKey) {
		const preset = PRESETS[presetKey];
		if (!preset) return;
		matrix = JSON.parse(JSON.stringify(preset.matrix));
		rMax = preset.rMax;
		rMin = preset.rMin;
		friction = preset.friction;
		particleCount = preset.count;

		// Update UI Sliders
		document.getElementById("sliderInteractionRadius").value = rMax;
		document.getElementById("valInteractionRadius").textContent = `${rMax}px`;
		document.getElementById("sliderMinRepelRadius").value = rMin;
		document.getElementById("valMinRepelRadius").textContent = `${rMin}px`;
		document.getElementById("sliderFriction").value = friction;
		document.getElementById("valFriction").textContent = friction.toFixed(2);
		document.getElementById("sliderParticleCount").value = particleCount;
		document.getElementById("valParticleCount").textContent = particleCount;

		rebuildSpatialGrid();
		renderMatrixGrid();
		initParticles(particleCount);
		showToast(`Loaded ${preset.name}`);
	}

	function randomizeMatrix() {
		for (let r = 0; r < NUM_SPECIES; r++) {
			for (let c = 0; c < NUM_SPECIES; c++) {
				const rnd = Math.random() * 2 - 1;
				matrix[r][c] = Math.round(rnd * 20) / 20; // 0.05 step
			}
		}
		renderMatrixGrid();
		showToast("Rules Randomized");
	}

	function symmetrizeMatrix() {
		for (let r = 0; r < NUM_SPECIES; r++) {
			for (let c = r + 1; c < NUM_SPECIES; c++) {
				const avg = Math.round(((matrix[r][c] + matrix[c][r]) / 2) * 20) / 20;
				matrix[r][c] = avg;
				matrix[c][r] = avg;
			}
		}
		renderMatrixGrid();
		showToast("Symmetric Interactions Applied");
	}

	function mutateMatrix() {
		for (let r = 0; r < NUM_SPECIES; r++) {
			for (let c = 0; c < NUM_SPECIES; c++) {
				if (Math.random() < 0.4) {
					const delta = (Math.random() - 0.5) * 0.4;
					let v = matrix[r][c] + delta;
					v = Math.max(-1.0, Math.min(1.0, v));
					matrix[r][c] = Math.round(v * 20) / 20;
				}
			}
		}
		renderMatrixGrid();
		showToast("Biomass Mutated");
	}

	// ── Web Audio Synthesizer Engine ─────────────────────────────────────────
	function setupAudio() {
		if (audioCtx) return;
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		audioCtx = new AudioContext();

		droneGain = audioCtx.createGain();
		droneGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
		droneGain.connect(audioCtx.destination);

		// Harmonic Pentatonic Frequencies (F# Minor Ambient)
		const baseFreqs = [92.5, 110.0, 138.59, 164.81, 185.0];
		droneNodes = baseFreqs.map((f) => {
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(f, audioCtx.currentTime);
			gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
			osc.connect(gain);
			gain.connect(droneGain);
			osc.start();
			return { osc, gain, baseF: f };
		});
	}

	function updateSonification(energy) {
		if (!audioCtx || !isAudioActive) return;
		const clampedEnergy = Math.min(energy, 25);
		const detuneMod = clampedEnergy * 15;
		droneNodes.forEach((node, idx) => {
			node.osc.detune.setTargetAtTime(
				detuneMod * (idx % 2 === 0 ? 1 : -1),
				audioCtx.currentTime,
				0.2,
			);
		});
	}

	function triggerSoundChime(strength) {
		if (!audioCtx || !isAudioActive) return;
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.type = "triangle";
		const pitch = 300 + Math.abs(strength) * 600;
		osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
		gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
		osc.connect(gain);
		gain.connect(audioCtx.destination);
		osc.start();
		osc.stop(audioCtx.currentTime + 0.36);
	}

	// ── Interactive Events & Controls ────────────────────────────────────────
	function setupEventListeners() {
		window.addEventListener("resize", resizeCanvas);

		// Presets Strip
		document.querySelectorAll(".preset-chip").forEach((btn) => {
			btn.addEventListener("click", () => {
				document
					.querySelectorAll(".preset-chip")
					.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
				applyPreset(btn.dataset.preset);
			});
		});

		// Matrix Action Buttons
		document
			.getElementById("btnRandomizeMatrix")
			.addEventListener("click", randomizeMatrix);
		document
			.getElementById("btnSymmetrizeMatrix")
			.addEventListener("click", symmetrizeMatrix);
		document
			.getElementById("btnMutateMatrix")
			.addEventListener("click", mutateMatrix);

		// Play / Pause
		const playBtn = document.getElementById("btnPlayPause");
		playBtn.addEventListener("click", () => {
			isRunning = !isRunning;
			playBtn.textContent = isRunning ? "Pause" : "Play";
			playBtn.classList.toggle("primary", isRunning);
			showToast(isRunning ? "Simulation Running" : "Simulation Paused");
		});

		// Re-seed Positions
		document
			.getElementById("btnResetPositions")
			.addEventListener("click", () => {
				initParticles(particleCount);
				showToast("Colony Re-seeded");
			});

		// Physics Sliders
		const sliderCount = document.getElementById("sliderParticleCount");
		sliderCount.addEventListener("input", (e) => {
			const count = parseInt(e.target.value, 10);
			document.getElementById("valParticleCount").textContent = count;
			initParticles(count);
		});

		const sliderRadius = document.getElementById("sliderInteractionRadius");
		sliderRadius.addEventListener("input", (e) => {
			rMax = parseInt(e.target.value, 10);
			document.getElementById("valInteractionRadius").textContent = `${rMax}px`;
			rebuildSpatialGrid();
		});

		const sliderRepel = document.getElementById("sliderMinRepelRadius");
		sliderRepel.addEventListener("input", (e) => {
			rMin = parseInt(e.target.value, 10);
			document.getElementById("valMinRepelRadius").textContent = `${rMin}px`;
		});

		const sliderFriction = document.getElementById("sliderFriction");
		sliderFriction.addEventListener("input", (e) => {
			friction = parseFloat(e.target.value);
			document.getElementById("valFriction").textContent = friction.toFixed(2);
		});

		const sliderSpeed = document.getElementById("sliderTimeSpeed");
		sliderSpeed.addEventListener("input", (e) => {
			timeSpeed = parseFloat(e.target.value);
			document.getElementById("valTimeSpeed").textContent =
				`${timeSpeed.toFixed(1)}x`;
		});

		// Checkboxes
		document
			.getElementById("checkWrapEdges")
			.addEventListener("change", (e) => {
				wrapEdges = e.target.checked;
			});
		document.getElementById("checkTrails").addEventListener("change", (e) => {
			motionTrails = e.target.checked;
		});
		document.getElementById("checkGlow").addEventListener("change", (e) => {
			bloomGlow = e.target.checked;
		});

		// Cursor Tool Mode Selectors
		document.querySelectorAll(".tool-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				document
					.querySelectorAll(".tool-btn")
					.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
				cursorTool = btn.dataset.tool;
			});
		});

		// Header Buttons
		const audioBtn = document.getElementById("btnAudio");
		audioBtn.addEventListener("click", () => {
			setupAudio();
			if (audioCtx.state === "suspended") {
				audioCtx.resume();
			}
			isAudioActive = !isAudioActive;
			audioBtn.classList.toggle("active", isAudioActive);
			if (droneGain) {
				droneGain.gain.setTargetAtTime(
					isAudioActive ? 0.06 : 0.0001,
					audioCtx.currentTime,
					0.1,
				);
			}
			showToast(isAudioActive ? "Sonification Active" : "Sonification Muted");
		});

		const fsBtn = document.getElementById("btnFullscreen");
		fsBtn.addEventListener("click", () => {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen().catch(() => {});
			} else {
				document.exitFullscreen().catch(() => {});
			}
		});

		const togglePanelsBtn = document.getElementById("btnTogglePanels");
		const hudContainer = document.getElementById("hudContainer");
		togglePanelsBtn.addEventListener("click", () => {
			hudContainer.classList.toggle("hidden");
			togglePanelsBtn.classList.toggle(
				"active",
				!hudContainer.classList.contains("hidden"),
			);
		});

		// Export PNG Snapshot
		document
			.getElementById("btnExportSnapshot")
			.addEventListener("click", () => {
				const link = document.createElement("a");
				link.download = `particle-life-${Date.now()}.png`;
				link.href = canvas.toDataURL("image/png");
				link.click();
				showToast("Snapshot Saved");
			});

		// Canvas Pointer Events
		canvas.addEventListener("pointerdown", (e) => {
			if (e.button === 1 || e.shiftKey) {
				isPanning = true;
				panStartX = e.clientX - cameraPanX;
				panStartY = e.clientY - cameraPanY;
				return;
			}
			isPointerDown = true;
			pointerX = e.clientX;
			pointerY = e.clientY;

			if (cursorTool === "inject") {
				injectParticlesAt(pointerX, pointerY, 30);
			}
		});

		window.addEventListener("pointermove", (e) => {
			if (isPanning) {
				cameraPanX = e.clientX - panStartX;
				cameraPanY = e.clientY - panStartY;
				return;
			}
			if (isPointerDown) {
				pointerX = e.clientX;
				pointerY = e.clientY;
				if (cursorTool === "inject" && Math.random() < 0.3) {
					injectParticlesAt(pointerX, pointerY, 8);
				}
			}
		});

		window.addEventListener("pointerup", () => {
			isPointerDown = false;
			isPanning = false;
		});

		// Mouse Wheel Zoom
		canvas.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();
				const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
				const newZoom = Math.min(3.5, Math.max(0.4, cameraZoom * zoomFactor));

				const mouseX = e.clientX;
				const mouseY = e.clientY;

				cameraPanX = mouseX - (mouseX - cameraPanX) * (newZoom / cameraZoom);
				cameraPanY = mouseY - (mouseY - cameraPanY) * (newZoom / cameraZoom);
				cameraZoom = newZoom;
			},
			{ passive: false },
		);

		// Double-click to reset viewport
		canvas.addEventListener("dblclick", () => {
			cameraZoom = 1.0;
			cameraPanX = 0;
			cameraPanY = 0;
			showToast("Viewport Reset");
		});
	}

	function injectParticlesAt(screenX, screenY, count) {
		const worldX = (screenX - cameraPanX) / cameraZoom;
		const worldY = (screenY - cameraPanY) / cameraZoom;
		const s = Math.floor(Math.random() * NUM_SPECIES);

		for (let i = 0; i < count; i++) {
			if (particleCount < maxParticles) {
				const idx = particleCount++;
				const angle = Math.random() * Math.PI * 2;
				const dist = Math.random() * 30;
				pX[idx] = worldX + Math.cos(angle) * dist;
				pY[idx] = worldY + Math.sin(angle) * dist;
				pVx[idx] = (Math.random() - 0.5) * 3;
				pVy[idx] = (Math.random() - 0.5) * 3;
				pSpecies[idx] = s;
			}
		}
		document.getElementById("countDisplay").textContent = particleCount;
		document.getElementById("sliderParticleCount").value = particleCount;
		document.getElementById("valParticleCount").textContent = particleCount;
	}

	let toastTimer = null;
	function showToast(msg) {
		const toast = document.getElementById("toast");
		toast.textContent = msg;
		toast.classList.add("show");
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast.classList.remove("show");
		}, 2200);
	}

	// Launch
	initSimulation();
});
