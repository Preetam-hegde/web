"use strict";

/**
 * Dear Diary — Main Application Script (v2 Enhanced)
 * Interactive DIY Scrapbooking & Dual-Page Journaling Studio
 * Features:
 * - Dual-page writing spreads with massive writing space
 * - Rich SVG vector stickers & vintage wax stamps with live color tinting
 * - Bullet planner with interactive task checklist & habit tracking
 * - Zen distraction-free writing mode
 * - Multi-page spread pagination
 * - Web Audio synthesized ambient sounds and tactile pops
 * - Whole-book drag & drop sticker transforms with pointer capture
 * - Instant URL-safe Base64 state compression & sharing
 */

document.addEventListener("DOMContentLoaded", () => {
	// ── State & Storage ──────────────────────────────────────────────────────────
	let state = null;
	let selectedStickerId = null;
	let saveTimeout = null;
	let isDrawing = false;
	let currentTool = "text"; // 'text' | 'draw' | 'highlighter'
	let drawColor = "#2c2523";
	let drawWidth = 3;
	let currentStroke = null;
	const undoStack = [];

	// Web Audio Synthesizer
	let audioCtx = null;
	let ambientSource = null;
	let ambientGain = null;
	let isAmbientPlaying = false;

	// Preset Photos for Polaroids
	const PRESET_PHOTOS = [
		{ name: "Warm Cafe", icon: "☕" },
		{ name: "Sakura Garden", icon: "🌸" },
		{ name: "Matcha Forest", icon: "🌿" },
		{ name: "Starry Sky", icon: "✨" },
		{ name: "Cozy Cat", icon: "🐱" },
		{ name: "Autumn Leaves", icon: "🍁" },
	];

	// Curated Daily Prompts
	const JOURNAL_PROMPTS = [
		"What is one sweet moment you want to remember today?",
		"What did your morning coffee or tea taste like today?",
		"Describe a sound or scent that gave you peace today.",
		"What is something unexpected that made you smile?",
		"If today had a color palette, what three colors would it be?",
		"Write a short letter of kindness to yourself.",
		"What is a song or melody stuck in your head right now?",
		"What is something you learned about yourself this week?",
		"Name three tiny things you are grateful for right now.",
		"Where does your mind drift when you have a quiet moment?",
		"What is a dream or project you want to nurture next?",
		"Who is someone that made your day a little brighter recently?",
		"Describe the weather outside and how it makes you feel.",
		"What is a comfort food you enjoyed or are craving today?",
	];

	// Curated Emojis & Badges Catalog
	const EMOJI_CATALOG = {
		emojis: [
			"🌸",
			"🌺",
			"🌻",
			"🍀",
			"🌿",
			"🌱",
			"🍄",
			"🍁",
			"🌼",
			"🌷",
			"🐱",
			"🐶",
			"🐰",
			"🐻",
			"🐼",
			"🦊",
			"🐸",
			"🐥",
			"🦆",
			"🐨",
			"☕",
			"🍵",
			"🧋",
			"🥐",
			"🍰",
			"🧁",
			"🍓",
			"🥞",
			"🍡",
			"🍩",
			"✨",
			"⭐",
			"🌟",
			"🌙",
			"☀️",
			"☁️",
			"🌈",
			"💫",
			"🪐",
			"💖",
			"📌",
			"📎",
			"✏️",
			"✒️",
			"✂️",
			"✉️",
			"🏷️",
			"📖",
			"🎨",
			"🧸",
		],
		badges: [
			"✨ Magic Day",
			"☕ Cozy Vibes",
			"🌸 Spring Joy",
			"💖 Self Care",
			"🌿 Breathe Deep",
			"⭐ Dream Big",
			"💤 Sleepy Mood",
			"🌧️ Rainy Peace",
			"🎨 Pure Creative",
			"🍵 Tea Time",
		],
	};

	// SVG Tint Palette
	const SVG_TINT_COLORS = [
		"#b91c1c", // Crimson
		"#e11d48", // Blush Rose
		"#16a34a", // Forest Green
		"#2563eb", // Sky Blue
		"#9333ea", // Lavender
		"#d97757", // Amber Terracotta
		"#1e293b", // Slate Charcoal
	];

	// ── DOM References ───────────────────────────────────────────────────────────
	const dateInput = document.getElementById("date-input");
	const moodBadge = document.getElementById("mood-badge");
	const weatherBadge = document.getElementById("weather-badge");
	const promptText = document.getElementById("prompt-text");
	const promptShuffleBtn = document.getElementById("prompt-shuffle-btn");

	// Text areas & inputs
	const leftJournalTitleInput = document.getElementById(
		"left-journal-title-input",
	);
	const leftJournalContentArea = document.getElementById(
		"left-journal-content-area",
	);
	const journalTitleInput = document.getElementById("journal-title-input");
	const journalContentArea = document.getElementById("journal-content-area");

	// Task & Habit elements
	const taskList = document.getElementById("task-list");
	const taskAddInput = document.getElementById("task-add-input");
	const taskAddBtn = document.getElementById("task-add-btn");
	const habitsRow = document.getElementById("habits-row");

	// Layout, Book & Spread elements
	const diaryBook = document.getElementById("diary-book");
	const pagesSpread = document.getElementById("pages-spread");
	const stickersLayer = document.getElementById("stickers-layer");
	const doodleCanvas = document.getElementById("doodle-canvas");
	const canvasCtx = doodleCanvas.getContext("2d");

	// Selectors
	const layoutSelect = document.getElementById("layout-select");
	const fontSelect = document.getElementById("font-select");
	const themeSelect = document.getElementById("theme-select");
	const paperSelect = document.getElementById("paper-select");
	const statusDot = document.getElementById("status-dot");
	const statusText = document.getElementById("status-text");

	// Tool ribbon buttons
	const toolTextBtn = document.getElementById("tool-text-btn");
	const toolDrawBtn = document.getElementById("tool-draw-btn");
	const toolStickersBtn = document.getElementById("tool-stickers-btn");
	const toolTapeBtn = document.getElementById("tool-tape-btn");
	const toolNoteBtn = document.getElementById("tool-note-btn");
	const toolPhotoBtn = document.getElementById("tool-photo-btn");
	const doodleBar = document.getElementById("doodle-bar");
	const brushSizeInput = document.getElementById("brush-size");
	const clearDoodlesBtn = document.getElementById("clear-doodles-btn");

	// Pagination & Metrics
	const prevSpreadBtn = document.getElementById("prev-spread-btn");
	const nextSpreadBtn = document.getElementById("next-spread-btn");
	const addSpreadBtn = document.getElementById("add-spread-btn");
	const spreadIndicator = document.getElementById("spread-indicator");
	const wordCountEl = document.getElementById("word-count");
	const readTimeEl = document.getElementById("read-time");

	// Zen Focus mode
	const zenToggleBtn = document.getElementById("zen-toggle-btn");
	const zenExitBtn = document.getElementById("zen-exit-btn");

	// Drawer & Actions
	const stickerDrawer = document.getElementById("sticker-drawer");
	const closeStickerDrawerBtn = document.getElementById("close-sticker-drawer");
	const stickerGrid = document.getElementById("sticker-grid");
	const drawerTabs = document.querySelectorAll(".drawer-tab");
	const drawerSearchBox = document.getElementById("drawer-search-box");

	const shareBtn = document.getElementById("share-btn");
	const soundToggleBtn = document.getElementById("sound-toggle-btn");
	const newPageBtn = document.getElementById("new-page-btn");
	const exportPngBtn = document.getElementById("export-png-btn");
	const exportJsonBtn = document.getElementById("export-json-btn");
	const importJsonBtn = document.getElementById("import-json-btn");
	const jsonFileInput = document.getElementById("json-file-input");
	const toastNotice = document.getElementById("toast-notice");
	const toastMsg = document.getElementById("toast-msg");

	// ── Web Audio Synthesizer (Zero External Dependencies) ───────────────────────
	function getAudioContext() {
		if (!audioCtx) {
			const AudioContextClass =
				window.AudioContext || window.webkitAudioContext;
			if (AudioContextClass) {
				audioCtx = new AudioContextClass();
			}
		}
		if (audioCtx && audioCtx.state === "suspended") {
			audioCtx.resume();
		}
		return audioCtx;
	}

	function playStickerPop() {
		try {
			const ctx = getAudioContext();
			if (!ctx) return;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			const now = ctx.currentTime;
			osc.frequency.setValueAtTime(480, now);
			osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

			gain.gain.setValueAtTime(0.15, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now);
			osc.stop(now + 0.1);
		} catch (e) {
			// Ignore
		}
	}

	function playPageTurn() {
		try {
			const ctx = getAudioContext();
			if (!ctx) return;
			const bufferSize = ctx.sampleRate * 0.16;
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				data[i] = Math.random() * 2 - 1;
			}

			const noise = ctx.createBufferSource();
			noise.buffer = buffer;

			const filter = ctx.createBiquadFilter();
			filter.type = "bandpass";
			filter.frequency.setValueAtTime(1100, ctx.currentTime);
			filter.Q.setValueAtTime(1.6, ctx.currentTime);

			const gain = ctx.createGain();
			gain.gain.setValueAtTime(0.12, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

			noise.connect(filter);
			filter.connect(gain);
			gain.connect(ctx.destination);

			noise.start(ctx.currentTime);
		} catch (e) {
			// Ignore
		}
	}

	function toggleAmbientSound() {
		const ctx = getAudioContext();
		if (!ctx) return;

		if (isAmbientPlaying) {
			if (ambientGain) {
				ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
				setTimeout(() => {
					if (ambientSource) ambientSource.stop();
					isAmbientPlaying = false;
					soundToggleBtn.classList.remove("active");
					soundToggleBtn.title = "Ambient Sound: Off";
				}, 500);
			}
		} else {
			const bufferSize = ctx.sampleRate * 2;
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const output = buffer.getChannelData(0);
			let b0 = 0,
				b1 = 0,
				b2 = 0,
				b3 = 0,
				b4 = 0,
				b5 = 0,
				b6 = 0;
			for (let i = 0; i < bufferSize; i++) {
				const white = Math.random() * 2 - 1;
				b0 = 0.99886 * b0 + white * 0.0555179;
				b1 = 0.99332 * b1 + white * 0.0750759;
				b2 = 0.969 * b2 + white * 0.153852;
				b3 = 0.8665 * b3 + white * 0.3104856;
				b4 = 0.55 * b4 + white * 0.5329522;
				b5 = -0.7616 * b5 - white * 0.016898;
				output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
				b6 = white * 0.115926;
			}

			ambientSource = ctx.createBufferSource();
			ambientSource.buffer = buffer;
			ambientSource.loop = true;

			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(1000, ctx.currentTime);

			ambientGain = ctx.createGain();
			ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
			ambientGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);

			ambientSource.connect(filter);
			filter.connect(ambientGain);
			ambientGain.connect(ctx.destination);

			ambientSource.start();
			isAmbientPlaying = true;
			soundToggleBtn.classList.add("active");
			soundToggleBtn.title = "Ambient Sound: Playing (Cozy Rain)";
			showToast("🌧️ Cozy rain ambiance on");
		}
	}

	// ── Toast Notifications ──────────────────────────────────────────────────────
	function showToast(message) {
		toastMsg.textContent = message;
		toastNotice.classList.add("show");
		clearTimeout(toastNotice.timer);
		toastNotice.timer = setTimeout(() => {
			toastNotice.classList.remove("show");
		}, 3000);
	}

	// ── State Initialization & Persistence ───────────────────────────────────────
	function initializeState() {
		// 1. Try decoding from URL hash
		const fromHash = DiaryUrlCodec.decodeHashToState(window.location.hash);
		if (fromHash) {
			state = fromHash;
			return;
		}

		// 2. Try loading from localStorage
		try {
			const saved = localStorage.getItem("dear_diary_current_v2");
			if (saved) {
				const parsed = JSON.parse(saved);
				state = DiaryUrlCodec.sanitizeState(parsed);
				return;
			}
		} catch (e) {
			// Ignore localStorage error
		}

		// 3. Fallback to default v2 starter state
		state = DiaryUrlCodec.createDefaultState();
	}

	function scheduleSave() {
		statusDot.classList.add("saving");
		statusText.textContent = "Saving...";
		updateMetrics();

		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			performSave();
		}, 600);
	}

	function performSave() {
		if (!state) return;

		// 1. Compress state to URL hash
		const hash = DiaryUrlCodec.encodeStateToHash(state);
		if (window.location.hash !== hash) {
			window.history.replaceState(null, "", hash);
		}

		// 2. Backup to localStorage
		try {
			localStorage.setItem("dear_diary_current_v2", JSON.stringify(state));
		} catch (e) {
			// Storage quota exceeded or disabled
		}

		statusDot.classList.remove("saving");
		statusText.textContent = "Saved to URL";
	}

	function pushUndo() {
		if (!state) return;
		undoStack.push(JSON.stringify(state));
		if (undoStack.length > 25) undoStack.shift();
	}

	function performUndo() {
		if (undoStack.length === 0) {
			showToast("Nothing to undo");
			return;
		}
		const previous = undoStack.pop();
		try {
			state = DiaryUrlCodec.sanitizeState(JSON.parse(previous));
			renderState();
			scheduleSave();
			showToast("↩️ Undone");
		} catch (e) {
			// Ignore
		}
	}

	// ── Word Count & Reading Metrics ─────────────────────────────────────────────
	function updateMetrics() {
		if (!state) return;
		const fullText = `${state.t || ""} ${state.b || ""} ${state.lt || ""} ${state.lb || ""}`;
		const words = fullText.trim().split(/\s+/).filter(Boolean).length;
		const readTime = Math.max(1, Math.ceil(words / 180));

		wordCountEl.textContent = words;
		readTimeEl.textContent = readTime;
	}

	// ── Render View from State ───────────────────────────────────────────────────
	function renderState() {
		if (!state) return;

		// Metadata
		dateInput.value = state.d || new Date().toISOString().split("T")[0];
		moodBadge.textContent = getMoodEmoji(state.m) + " " + capitalize(state.m);
		weatherBadge.textContent =
			getWeatherEmoji(state.w) + " " + capitalize(state.w);
		promptText.textContent = state.q || JOURNAL_PROMPTS[0];

		// Left Page Writing
		leftJournalTitleInput.value = state.lt || "";
		leftJournalContentArea.value = state.lb || "";

		// Right Page Writing
		journalTitleInput.value = state.t || "";
		journalContentArea.value = state.b || "";

		// Layout & Theme
		diaryBook.className = `diary-book layout-${state.layout || "dual"}`;
		layoutSelect.value = state.layout || "dual";

		document.body.dataset.theme = state.th || "parchment";
		themeSelect.value = state.th || "parchment";

		document.body.dataset.font = state.font || "handwriting";
		fontSelect.value = state.font || "handwriting";

		pagesSpread.className = "pages-spread paper-" + (state.p || "ruled");
		paperSelect.value = state.p || "ruled";

		// Render Planner Items
		renderTasks();
		renderHabits();

		// Update Pagination
		updatePaginationUI();

		// Render Stickers
		renderStickers();

		// Resize and redraw canvas
		resizeCanvas();
		redrawCanvasDoodles();

		// Metrics
		updateMetrics();
	}

	function capitalize(str) {
		if (!str) return "";
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function getMoodEmoji(mood) {
		const map = {
			happy: "😊",
			peaceful: "🌿",
			creative: "💡",
			cozy: "☕",
			melancholy: "🌧️",
			energized: "⚡",
			sleepy: "💤",
			grateful: "🌸",
		};
		return map[mood] || "😊";
	}

	function getWeatherEmoji(weather) {
		const map = {
			sunny: "☀️",
			cloudy: "⛅",
			rainy: "🌧️",
			snowy: "❄️",
			windy: "🍃",
			night: "🌙",
		};
		return map[weather] || "☀️";
	}

	// ── Planner Tasks & Habits ───────────────────────────────────────────────────
	function renderTasks() {
		taskList.innerHTML = "";
		if (!state || !Array.isArray(state.tasks)) return;

		state.tasks.forEach((task, idx) => {
			const li = document.createElement("li");
			li.className = `task-item ${task.done ? "done" : ""}`;

			const chk = document.createElement("input");
			chk.type = "checkbox";
			chk.className = "task-checkbox";
			chk.checked = Boolean(task.done);
			chk.addEventListener("change", () => {
				task.done = chk.checked;
				li.classList.toggle("done", task.done);
				playStickerPop();
				scheduleSave();
			});

			const label = document.createElement("span");
			label.className = "task-label";
			label.contentEditable = "true";
			label.textContent = task.text;
			label.addEventListener("blur", () => {
				task.text = label.textContent.trim();
				scheduleSave();
			});

			const del = document.createElement("button");
			del.className = "task-del-btn";
			del.textContent = "✕";
			del.title = "Delete Task";
			del.addEventListener("click", () => {
				state.tasks.splice(idx, 1);
				renderTasks();
				scheduleSave();
			});

			li.appendChild(chk);
			li.appendChild(label);
			li.appendChild(del);
			taskList.appendChild(li);
		});
	}

	function addTask(text) {
		if (!text) return;
		state.tasks.push({
			id: `task-${Date.now()}`,
			text: text,
			done: false,
		});
		renderTasks();
		scheduleSave();
		playStickerPop();
	}

	taskAddBtn.addEventListener("click", () => {
		const val = taskAddInput.value.trim();
		if (val) {
			addTask(val);
			taskAddInput.value = "";
		}
	});

	taskAddInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			const val = taskAddInput.value.trim();
			if (val) {
				addTask(val);
				taskAddInput.value = "";
			}
		}
	});

	function renderHabits() {
		habitsRow.innerHTML = "";
		if (!state || !Array.isArray(state.habits)) return;

		state.habits.forEach((habit) => {
			const pill = document.createElement("button");
			pill.className = `habit-pill ${habit.done ? "completed" : ""}`;
			pill.innerHTML = `<span>${habit.icon || "★"}</span> <span>${habit.name}</span>`;
			pill.addEventListener("click", () => {
				habit.done = !habit.done;
				pill.classList.toggle("completed", habit.done);
				playStickerPop();
				scheduleSave();
			});
			habitsRow.appendChild(pill);
		});
	}

	// ── Pagination Spreads ───────────────────────────────────────────────────────
	function updatePaginationUI() {
		const totalSpreads = 1 + (state.spreads ? state.spreads.length : 0);
		const currentSpreadNum = (state.spreadIdx || 0) + 1;
		spreadIndicator.textContent = `Spread ${currentSpreadNum} of ${totalSpreads}`;
		prevSpreadBtn.disabled = (state.spreadIdx || 0) <= 0;
		nextSpreadBtn.disabled = (state.spreadIdx || 0) >= totalSpreads - 1;
	}

	prevSpreadBtn.addEventListener("click", () => {
		if (state.spreadIdx > 0) {
			switchSpread(state.spreadIdx - 1);
		}
	});

	nextSpreadBtn.addEventListener("click", () => {
		const totalSpreads = 1 + (state.spreads ? state.spreads.length : 0);
		if (state.spreadIdx < totalSpreads - 1) {
			switchSpread(state.spreadIdx + 1);
		}
	});

	addSpreadBtn.addEventListener("click", () => {
		pushUndo();
		const newSpread = {
			d: new Date().toISOString().split("T")[0],
			t: `Journal Entry #${state.spreads.length + 2}`,
			b: "",
			lt: "Daily Notes & Highlights",
			lb: "",
		};
		state.spreads.push(newSpread);
		switchSpread(state.spreads.length);
		showToast("📖 New page spread added!");
	});

	function switchSpread(targetIdx) {
		playPageTurn();
		pushUndo();

		// Save current view text into active slot
		if (state.spreadIdx === 0) {
			// primary
			state.t = journalTitleInput.value;
			state.b = journalContentArea.value;
			state.lt = leftJournalTitleInput.value;
			state.lb = leftJournalContentArea.value;
		} else if (state.spreads && state.spreads[state.spreadIdx - 1]) {
			const current = state.spreads[state.spreadIdx - 1];
			current.t = journalTitleInput.value;
			current.b = journalContentArea.value;
			current.lt = leftJournalTitleInput.value;
			current.lb = leftJournalContentArea.value;
		}

		// Switch index
		state.spreadIdx = targetIdx;

		// Load target texts
		if (state.spreadIdx === 0) {
			journalTitleInput.value = state.t || "";
			journalContentArea.value = state.b || "";
			leftJournalTitleInput.value = state.lt || "";
			leftJournalContentArea.value = state.lb || "";
		} else if (state.spreads && state.spreads[state.spreadIdx - 1]) {
			const target = state.spreads[state.spreadIdx - 1];
			journalTitleInput.value = target.t || "";
			journalContentArea.value = target.b || "";
			leftJournalTitleInput.value = target.lt || "";
			leftJournalContentArea.value = target.lb || "";
		}

		updatePaginationUI();
		updateMetrics();
		scheduleSave();
	}

	// ── Whole-Book Stickers Layer ────────────────────────────────────────────────
	function renderStickers() {
		stickersLayer.innerHTML = "";
		if (!state || !Array.isArray(state.s)) return;

		state.s.forEach((st) => {
			const el = createStickerElement(st);
			stickersLayer.appendChild(el);
		});
	}

	function createStickerElement(st) {
		const el = document.createElement("div");
		el.className = "sticker-item";
		el.dataset.id = st.id;
		el.dataset.type = st.type;

		// Calculate pixel positions from percentage coordinates relative to entire spread
		const spreadRect = pagesSpread.getBoundingClientRect();
		const posX = (st.x / 100) * spreadRect.width;
		const posY = (st.y / 100) * spreadRect.height;

		el.style.left = `${posX}px`;
		el.style.top = `${posY}px`;
		el.style.zIndex = st.z || 1;
		el.style.transform = `translate(-50%, -50%) rotate(${st.r || 0}deg) scale(${st.sc || 1})`;

		// Specific inner HTML by type
		if (st.type === "svg") {
			el.innerHTML = DiarySvgCatalog.renderSvg(
				st.val,
				st.color || "currentColor",
				52,
			);
		} else if (st.type === "emoji") {
			el.textContent = st.val;
		} else if (st.type === "badge") {
			el.textContent = st.val;
		} else if (st.type === "washi") {
			el.className += ` ${st.val || "washi-stripes"}`;
			if (st.w) el.style.width = `${st.w}px`;
		} else if (st.type === "note") {
			el.className += ` note-${st.color || "yellow"}`;
			const pin = document.createElement("div");
			pin.className = "note-pin";
			const ta = document.createElement("textarea");
			ta.className = "note-textarea";
			ta.value = st.val || "";
			ta.placeholder = "Write a quick note...";
			ta.addEventListener("input", (e) => {
				st.val = e.target.value;
				scheduleSave();
			});
			ta.addEventListener("pointerdown", (e) => e.stopPropagation());
			el.appendChild(pin);
			el.appendChild(ta);
		} else if (st.type === "polaroid") {
			const imgBox = document.createElement("div");
			imgBox.className = "polaroid-img-box";
			if (st.img) {
				const img = document.createElement("img");
				img.className = "polaroid-img";
				img.src = st.img;
				imgBox.appendChild(img);
			} else {
				imgBox.textContent = st.val || "📷";
			}

			const capInput = document.createElement("input");
			capInput.className = "polaroid-caption";
			capInput.value = st.cap || "";
			capInput.placeholder = "Caption...";
			capInput.addEventListener("input", (e) => {
				st.cap = e.target.value;
				scheduleSave();
			});
			capInput.addEventListener("pointerdown", (e) => e.stopPropagation());

			el.appendChild(imgBox);
			el.appendChild(capInput);
		}

		// Attach transform handles if selected
		if (st.id === selectedStickerId) {
			el.classList.add("selected");
			attachTransformControls(el, st);
		}

		// Pointer events for dragging
		el.addEventListener("pointerdown", (e) =>
			handleStickerPointerDown(e, st, el),
		);

		return el;
	}

	function attachTransformControls(el, st) {
		const ctrlBar = document.createElement("div");
		ctrlBar.className = "transform-controls";

		const frontBtn = document.createElement("button");
		frontBtn.className = "ctrl-btn";
		frontBtn.title = "Bring to Front";
		frontBtn.textContent = "⬆️";
		frontBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			bringToFront(st);
		});

		const backBtn = document.createElement("button");
		backBtn.className = "ctrl-btn";
		backBtn.title = "Send to Back";
		backBtn.textContent = "⬇️";
		backBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			sendToBack(st);
		});

		const dupBtn = document.createElement("button");
		dupBtn.className = "ctrl-btn";
		dupBtn.title = "Duplicate";
		dupBtn.textContent = "📋";
		dupBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			duplicateSticker(st);
		});

		const delBtn = document.createElement("button");
		delBtn.className = "ctrl-btn";
		delBtn.title = "Delete";
		delBtn.textContent = "🗑️";
		delBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			deleteSticker(st);
		});

		ctrlBar.appendChild(frontBtn);
		ctrlBar.appendChild(backBtn);
		ctrlBar.appendChild(dupBtn);
		ctrlBar.appendChild(delBtn);

		// If SVG or Note, show color tint palette
		if (st.type === "svg") {
			const tintPicker = document.createElement("div");
			tintPicker.className = "svg-tint-picker";
			SVG_TINT_COLORS.forEach((col) => {
				const dot = document.createElement("div");
				dot.className = "svg-tint-dot";
				dot.style.background = col;
				dot.title = `Color: ${col}`;
				dot.addEventListener("click", (e) => {
					e.stopPropagation();
					st.color = col;
					renderStickers();
					scheduleSave();
				});
				tintPicker.appendChild(dot);
			});
			ctrlBar.appendChild(tintPicker);
		}

		el.appendChild(ctrlBar);

		// Rotate handle
		const rotateHandle = document.createElement("div");
		rotateHandle.className = "rotate-handle";
		rotateHandle.title = "Drag to Rotate";
		rotateHandle.addEventListener("pointerdown", (e) =>
			handleRotatePointerDown(e, st, el),
		);
		el.appendChild(rotateHandle);

		// Scale handle
		const scaleHandle = document.createElement("div");
		scaleHandle.className = "scale-handle";
		scaleHandle.title = "Drag to Scale";
		scaleHandle.addEventListener("pointerdown", (e) =>
			handleScalePointerDown(e, st, el),
		);
		el.appendChild(scaleHandle);
	}

	function handleStickerPointerDown(e, st, el) {
		if (
			e.target.closest(".transform-controls") ||
			e.target.closest(".rotate-handle") ||
			e.target.closest(".scale-handle")
		) {
			return;
		}

		e.stopPropagation();
		selectSticker(st.id);

		el.setPointerCapture(e.pointerId);

		const spreadRect = pagesSpread.getBoundingClientRect();
		const startPointerX = e.clientX;
		const startPointerY = e.clientY;
		const startX = (st.x / 100) * spreadRect.width;
		const startY = (st.y / 100) * spreadRect.height;

		function onPointerMove(moveEvent) {
			const dx = moveEvent.clientX - startPointerX;
			const dy = moveEvent.clientY - startPointerY;

			const newPx = startX + dx;
			const newPy = startY + dy;

			// Update percentage coordinates clamped within whole spread bounds
			st.x = Math.max(1, Math.min(99, (newPx / spreadRect.width) * 100));
			st.y = Math.max(1, Math.min(99, (newPy / spreadRect.height) * 100));

			el.style.left = `${(st.x / 100) * spreadRect.width}px`;
			el.style.top = `${(st.y / 100) * spreadRect.height}px`;
		}

		function onPointerUp(upEvent) {
			el.releasePointerCapture(upEvent.pointerId);
			el.removeEventListener("pointermove", onPointerMove);
			el.removeEventListener("pointerup", onPointerUp);
			scheduleSave();
		}

		el.addEventListener("pointermove", onPointerMove);
		el.addEventListener("pointerup", onPointerUp);
	}

	function handleRotatePointerDown(e, st, el) {
		e.stopPropagation();
		e.preventDefault();
		const targetHandle = e.target;
		targetHandle.setPointerCapture(e.pointerId);

		const rect = el.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		function onPointerMove(moveEvent) {
			const dx = moveEvent.clientX - centerX;
			const dy = moveEvent.clientY - centerY;
			const radians = Math.atan2(dy, dx);
			let degrees = Math.round(radians * (180 / Math.PI) + 90);
			if (degrees > 180) degrees -= 360;
			st.r = degrees;
			el.style.transform = `translate(-50%, -50%) rotate(${st.r}deg) scale(${st.sc || 1})`;
		}

		function onPointerUp(upEvent) {
			targetHandle.releasePointerCapture(upEvent.pointerId);
			targetHandle.removeEventListener("pointermove", onPointerMove);
			targetHandle.removeEventListener("pointerup", onPointerUp);
			scheduleSave();
		}

		targetHandle.addEventListener("pointermove", onPointerMove);
		targetHandle.addEventListener("pointerup", onPointerUp);
	}

	function handleScalePointerDown(e, st, el) {
		e.stopPropagation();
		e.preventDefault();
		const targetHandle = e.target;
		targetHandle.setPointerCapture(e.pointerId);

		const rect = el.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const initialDistance = Math.hypot(
			e.clientX - centerX,
			e.clientY - centerY,
		);
		const initialScale = st.sc || 1;

		function onPointerMove(moveEvent) {
			const currentDistance = Math.hypot(
				moveEvent.clientX - centerX,
				moveEvent.clientY - centerY,
			);
			const factor = currentDistance / (initialDistance || 1);
			const newScale = Math.max(
				0.3,
				Math.min(3.5, Math.round(initialScale * factor * 100) / 100),
			);
			st.sc = newScale;
			el.style.transform = `translate(-50%, -50%) rotate(${st.r || 0}deg) scale(${st.sc})`;
		}

		function onPointerUp(upEvent) {
			targetHandle.releasePointerCapture(upEvent.pointerId);
			targetHandle.removeEventListener("pointermove", onPointerMove);
			targetHandle.removeEventListener("pointerup", onPointerUp);
			scheduleSave();
		}

		targetHandle.addEventListener("pointermove", onPointerMove);
		targetHandle.addEventListener("pointerup", onPointerUp);
	}

	function selectSticker(id) {
		if (selectedStickerId === id) return;
		selectedStickerId = id;
		renderStickers();
	}

	function deselectAllStickers() {
		if (selectedStickerId !== null) {
			selectedStickerId = null;
			renderStickers();
		}
	}

	function bringToFront(st) {
		pushUndo();
		const maxZ = state.s.reduce((acc, curr) => Math.max(acc, curr.z || 1), 1);
		st.z = maxZ + 1;
		renderStickers();
		scheduleSave();
	}

	function sendToBack(st) {
		pushUndo();
		state.s.forEach((item) => {
			item.z = (item.z || 1) + 1;
		});
		st.z = 1;
		renderStickers();
		scheduleSave();
	}

	function duplicateSticker(st) {
		pushUndo();
		const copy = JSON.parse(JSON.stringify(st));
		copy.id = `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		copy.x = Math.min(95, copy.x + 4);
		copy.y = Math.min(95, copy.y + 4);
		copy.z = (st.z || 1) + 1;
		state.s.push(copy);
		selectedStickerId = copy.id;
		playStickerPop();
		renderStickers();
		scheduleSave();
	}

	function deleteSticker(st) {
		pushUndo();
		state.s = state.s.filter((item) => item.id !== st.id);
		selectedStickerId = null;
		renderStickers();
		scheduleSave();
	}

	function addSticker(type, val, extra = {}) {
		pushUndo();
		const newSt = {
			id: `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			type: type,
			val: val,
			x: 30 + Math.random() * 40,
			y: 25 + Math.random() * 45,
			r: Math.round((Math.random() - 0.5) * 16),
			sc: 1,
			z: state.s.length + 1,
			...extra,
		};

		state.s.push(newSt);
		selectedStickerId = newSt.id;
		playStickerPop();
		renderStickers();
		scheduleSave();
		showToast(`Added ${type} sticker!`);
	}

	// ── Freehand Canvas Doodling ─────────────────────────────────────────────────
	function resizeCanvas() {
		const rect = pagesSpread.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		doodleCanvas.width = rect.width * dpr;
		doodleCanvas.height = rect.height * dpr;
		canvasCtx.scale(dpr, dpr);
	}

	function redrawCanvasDoodles() {
		const dpr = window.devicePixelRatio || 1;
		canvasCtx.clearRect(
			0,
			0,
			doodleCanvas.width / dpr,
			doodleCanvas.height / dpr,
		);

		if (!state || !Array.isArray(state.dr)) return;

		state.dr.forEach((stroke) => {
			const [color, width, isHighlighter, points] = stroke;
			if (!points || points.length < 2) return;

			canvasCtx.save();
			canvasCtx.lineCap = "round";
			canvasCtx.lineJoin = "round";
			canvasCtx.lineWidth = width;

			if (isHighlighter) {
				canvasCtx.strokeStyle = color;
				canvasCtx.globalAlpha = 0.35;
			} else {
				canvasCtx.strokeStyle = color;
				canvasCtx.globalAlpha = 1.0;
			}

			canvasCtx.beginPath();
			canvasCtx.moveTo(points[0], points[1]);

			for (let i = 2; i < points.length; i += 2) {
				const midX = (points[i - 2] + points[i]) / 2;
				const midY = (points[i - 1] + points[i + 1]) / 2;
				canvasCtx.quadraticCurveTo(points[i - 2], points[i - 1], midX, midY);
			}

			canvasCtx.stroke();
			canvasCtx.restore();
		});
	}

	function handleCanvasPointerDown(e) {
		if (currentTool === "text") return;

		isDrawing = true;
		doodleCanvas.setPointerCapture(e.pointerId);

		const rect = doodleCanvas.getBoundingClientRect();
		const x = Math.round(e.clientX - rect.left);
		const y = Math.round(e.clientY - rect.top);

		const isHighlighter = currentTool === "highlighter";
		currentStroke = [drawColor, drawWidth, isHighlighter ? 1 : 0, [x, y]];

		canvasCtx.save();
		canvasCtx.lineCap = "round";
		canvasCtx.lineJoin = "round";
		canvasCtx.lineWidth = drawWidth;
		if (isHighlighter) {
			canvasCtx.strokeStyle = drawColor;
			canvasCtx.globalAlpha = 0.35;
		} else {
			canvasCtx.strokeStyle = drawColor;
			canvasCtx.globalAlpha = 1.0;
		}
		canvasCtx.beginPath();
		canvasCtx.moveTo(x, y);
	}

	function handleCanvasPointerMove(e) {
		if (!isDrawing || !currentStroke) return;

		const rect = doodleCanvas.getBoundingClientRect();
		const x = Math.round(e.clientX - rect.left);
		const y = Math.round(e.clientY - rect.top);

		currentStroke[3].push(x, y);

		canvasCtx.lineTo(x, y);
		canvasCtx.stroke();
	}

	function handleCanvasPointerUp(e) {
		if (!isDrawing) return;
		isDrawing = false;
		doodleCanvas.releasePointerCapture(e.pointerId);
		canvasCtx.restore();

		if (currentStroke && currentStroke[3].length >= 4) {
			pushUndo();
			state.dr.push(currentStroke);
			scheduleSave();
		}
		currentStroke = null;
		redrawCanvasDoodles();
	}

	// ── Event Handlers & Tool Ribbon ─────────────────────────────────────────────
	function setTool(tool) {
		currentTool = tool;
		toolTextBtn.classList.toggle("active", tool === "text");
		toolDrawBtn.classList.toggle(
			"active",
			tool === "draw" || tool === "highlighter",
		);

		if (tool === "draw" || tool === "highlighter") {
			doodleCanvas.classList.add("drawing-active");
			doodleBar.classList.add("show");
			journalContentArea.style.pointerEvents = "none";
			leftJournalContentArea.style.pointerEvents = "none";
			deselectAllStickers();
		} else {
			doodleCanvas.classList.remove("drawing-active");
			doodleBar.classList.remove("show");
			journalContentArea.style.pointerEvents = "auto";
			leftJournalContentArea.style.pointerEvents = "auto";
		}
	}

	toolTextBtn.addEventListener("click", () => setTool("text"));
	toolDrawBtn.addEventListener("click", () => {
		setTool(currentTool === "draw" ? "text" : "draw");
	});

	document.querySelectorAll(".color-dot").forEach((dot) => {
		dot.addEventListener("click", () => {
			document
				.querySelectorAll(".color-dot")
				.forEach((d) => d.classList.remove("active"));
			dot.classList.add("active");
			drawColor = dot.dataset.color;
		});
	});

	brushSizeInput.addEventListener("input", (e) => {
		drawWidth = parseInt(e.target.value, 10) || 3;
	});

	clearDoodlesBtn.addEventListener("click", () => {
		if (state.dr.length === 0) return;
		if (confirm("Clear all drawings and doodles on this spread?")) {
			pushUndo();
			state.dr = [];
			redrawCanvasDoodles();
			scheduleSave();
			showToast("🧹 Doodles cleared");
		}
	});

	// Sticker Drawer open/close & search
	toolStickersBtn.addEventListener("click", () => {
		stickerDrawer.classList.toggle("open");
		if (stickerDrawer.classList.contains("open")) {
			populateDrawerCategory("all-svg");
		}
	});

	closeStickerDrawerBtn.addEventListener("click", () => {
		stickerDrawer.classList.remove("open");
	});

	drawerTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			drawerTabs.forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
			populateDrawerCategory(tab.dataset.cat, drawerSearchBox.value.trim());
		});
	});

	drawerSearchBox.addEventListener("input", (e) => {
		const activeTab = document.querySelector(".drawer-tab.active");
		const cat = activeTab ? activeTab.dataset.cat : "all-svg";
		populateDrawerCategory(cat, e.target.value.trim().toLowerCase());
	});

	function populateDrawerCategory(category, searchQuery = "") {
		stickerGrid.innerHTML = "";
		const svgCats = DiarySvgCatalog.getCategories();

		// Determine list of items to render
		let items = [];
		let isSvg = false;
		let isEmoji = false;
		let isBadge = false;

		if (category === "all-svg") {
			isSvg = true;
			items = [
				...svgCats.stamps,
				...svgCats.nature,
				...svgCats.cozy,
				...svgCats.celestial,
				...svgCats.lifestyle,
			];
		} else if (svgCats[category]) {
			isSvg = true;
			items = svgCats[category];
		} else if (category === "emojis") {
			isEmoji = true;
			items = EMOJI_CATALOG.emojis;
		} else if (category === "badges") {
			isBadge = true;
			items = EMOJI_CATALOG.badges;
		}

		// Filter by search query if present
		if (searchQuery) {
			items = items.filter((item) => item.toLowerCase().includes(searchQuery));
		}

		items.forEach((item) => {
			const btn = document.createElement("button");
			btn.className = "sticker-option";
			btn.title = item;

			if (isSvg) {
				btn.innerHTML = DiarySvgCatalog.renderSvg(item, "currentColor", 36);
				btn.addEventListener("click", () => {
					addSticker("svg", item, { color: "var(--accent)" });
					stickerDrawer.classList.remove("open");
				});
			} else if (isBadge) {
				btn.textContent = item;
				btn.style.fontSize = "0.95rem";
				btn.style.padding = "4px 8px";
				btn.addEventListener("click", () => {
					addSticker("badge", item);
					stickerDrawer.classList.remove("open");
				});
			} else {
				btn.textContent = item;
				btn.addEventListener("click", () => {
					addSticker("emoji", item);
					stickerDrawer.classList.remove("open");
				});
			}

			stickerGrid.appendChild(btn);
		});
	}

	// Washi tape tool
	toolTapeBtn.addEventListener("click", () => {
		const tapes = [
			"washi-stripes",
			"washi-dots",
			"washi-grid",
			"washi-lavender",
			"washi-kraft",
		];
		const pick = tapes[Math.floor(Math.random() * tapes.length)];
		addSticker("washi", pick, { w: 160 });
	});

	// Sticky note tool
	toolNoteBtn.addEventListener("click", () => {
		const colors = ["yellow", "pink", "mint", "blue", "lavender"];
		const pickColor = colors[Math.floor(Math.random() * colors.length)];
		addSticker("note", "", { color: pickColor });
	});

	// Polaroid photo tool
	toolPhotoBtn.addEventListener("click", () => {
		const randomPhoto =
			PRESET_PHOTOS[Math.floor(Math.random() * PRESET_PHOTOS.length)];
		addSticker("polaroid", randomPhoto.icon, {
			cap: randomPhoto.name,
			val: randomPhoto.icon,
		});
	});

	// Content & Title inputs
	journalTitleInput.addEventListener("input", (e) => {
		state.t = e.target.value;
		scheduleSave();
	});

	journalContentArea.addEventListener("input", (e) => {
		state.b = e.target.value;
		scheduleSave();
	});

	leftJournalTitleInput.addEventListener("input", (e) => {
		state.lt = e.target.value;
		scheduleSave();
	});

	leftJournalContentArea.addEventListener("input", (e) => {
		state.lb = e.target.value;
		scheduleSave();
	});

	dateInput.addEventListener("change", (e) => {
		state.d = e.target.value;
		scheduleSave();
	});

	promptText.addEventListener("input", (e) => {
		state.q = e.target.textContent;
		scheduleSave();
	});

	promptShuffleBtn.addEventListener("click", () => {
		const fresh =
			JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
		state.q = fresh;
		promptText.textContent = fresh;
		playPageTurn();
		scheduleSave();
	});

	// Mood & Weather cycles
	const MOODS = [
		"happy",
		"peaceful",
		"creative",
		"cozy",
		"melancholy",
		"energized",
		"sleepy",
		"grateful",
	];
	moodBadge.addEventListener("click", () => {
		const currentIdx = MOODS.indexOf(state.m || "happy");
		const nextIdx = (currentIdx + 1) % MOODS.length;
		state.m = MOODS[nextIdx];
		moodBadge.textContent = getMoodEmoji(state.m) + " " + capitalize(state.m);
		playStickerPop();
		scheduleSave();
	});

	const WEATHERS = ["sunny", "cloudy", "rainy", "snowy", "windy", "night"];
	weatherBadge.addEventListener("click", () => {
		const currentIdx = WEATHERS.indexOf(state.w || "sunny");
		const nextIdx = (currentIdx + 1) % WEATHERS.length;
		state.w = WEATHERS[nextIdx];
		weatherBadge.textContent =
			getWeatherEmoji(state.w) + " " + capitalize(state.w);
		playStickerPop();
		scheduleSave();
	});

	// Layout switcher
	layoutSelect.addEventListener("change", (e) => {
		state.layout = e.target.value;
		diaryBook.className = `diary-book layout-${state.layout}`;
		playPageTurn();
		scheduleSave();
		showToast(`Layout: ${capitalize(state.layout)} mode`);
	});

	// Font switcher
	fontSelect.addEventListener("change", (e) => {
		state.font = e.target.value;
		document.body.dataset.font = state.font;
		scheduleSave();
	});

	// Theme & Paper selection
	themeSelect.addEventListener("change", (e) => {
		state.th = e.target.value;
		document.body.dataset.theme = state.th;
		scheduleSave();
	});

	paperSelect.addEventListener("change", (e) => {
		state.p = e.target.value;
		pagesSpread.className = "pages-spread paper-" + state.p;
		scheduleSave();
	});

	// Zen Focus Mode Toggle
	function toggleZenMode() {
		document.body.classList.toggle("zen-focus");
		const isZen = document.body.classList.contains("zen-focus");
		showToast(isZen ? "🧘 Zen Focus Mode: ON" : "Returned to normal mode");
	}

	zenToggleBtn.addEventListener("click", toggleZenMode);
	zenExitBtn.addEventListener("click", toggleZenMode);

	// Canvas drawing listeners
	doodleCanvas.addEventListener("pointerdown", handleCanvasPointerDown);
	doodleCanvas.addEventListener("pointermove", handleCanvasPointerMove);
	doodleCanvas.addEventListener("pointerup", handleCanvasPointerUp);
	doodleCanvas.addEventListener("pointercancel", handleCanvasPointerUp);

	// Ambient sound toggle
	soundToggleBtn.addEventListener("click", toggleAmbientSound);

	// Deselect sticker on stage click
	pagesSpread.addEventListener("pointerdown", (e) => {
		if (
			!e.target.closest(".sticker-item") &&
			!e.target.closest(".transform-controls")
		) {
			deselectAllStickers();
		}
	});

	// Keyboard Shortcuts
	window.addEventListener("keydown", (e) => {
		const isTyping =
			["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ||
			document.activeElement.isContentEditable;

		// Ctrl+Z: Undo
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
			if (!isTyping) {
				e.preventDefault();
				performUndo();
			}
		}

		// Ctrl+S: Save / Copy Link
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
			e.preventDefault();
			shareBtn.click();
		}

		// Ctrl+Enter: Toggle Zen Mode
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			toggleZenMode();
		}

		// Escape: Deselect or Exit Zen
		if (e.key === "Escape") {
			if (document.body.classList.contains("zen-focus")) {
				toggleZenMode();
			} else {
				deselectAllStickers();
				stickerDrawer.classList.remove("open");
			}
		}

		// Delete/Backspace for selected sticker
		if (
			(e.key === "Delete" || e.key === "Backspace") &&
			selectedStickerId &&
			!isTyping
		) {
			e.preventDefault();
			const st = state.s.find((s) => s.id === selectedStickerId);
			if (st) deleteSticker(st);
		}
	});

	// Share Button
	shareBtn.addEventListener("click", async () => {
		performSave();
		const shareUrl = window.location.href;
		try {
			await navigator.clipboard.writeText(shareUrl);
			showToast("🔗 Shareable link copied to clipboard!");
		} catch (err) {
			prompt("Copy your shareable journal URL:", shareUrl);
		}
	});

	// New Page Button
	newPageBtn.addEventListener("click", () => {
		if (
			confirm(
				"Start a fresh new diary page? Make sure you have copied your link to keep this entry!",
			)
		) {
			pushUndo();
			state = DiaryUrlCodec.createDefaultState();
			playPageTurn();
			renderState();
			performSave();
			showToast("✨ Fresh new diary page created!");
		}
	});

	// Export PNG Snapshot (Both Pages)
	exportPngBtn.addEventListener("click", () => {
		deselectAllStickers();
		showToast("📸 Preparing high-res dual-page snapshot...");
		setTimeout(() => {
			exportJournalImage();
		}, 100);
	});

	function exportJournalImage() {
		const rect = pagesSpread.getBoundingClientRect();
		const exportCanvas = document.createElement("canvas");
		const scale = 2;
		exportCanvas.width = rect.width * scale;
		exportCanvas.height = rect.height * scale;
		const ctx = exportCanvas.getContext("2d");
		ctx.scale(scale, scale);

		// Background fill matching theme
		const computedBg =
			getComputedStyle(pagesSpread).backgroundColor || "#fcf9f2";
		ctx.fillStyle = computedBg;
		ctx.fillRect(0, 0, rect.width, rect.height);

		// Spine line
		ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(rect.width / 2, 0);
		ctx.lineTo(rect.width / 2, rect.height);
		ctx.stroke();

		// Left Page Header & Body
		ctx.fillStyle = "#2c2523";
		ctx.font = "bold 22px Georgia, serif";
		ctx.fillText(state.lt || "Morning Intentions", 40, 50);

		ctx.font = "15px sans-serif";
		ctx.fillStyle = "#786b66";
		ctx.fillText(
			`Date: ${state.d}   Mood: ${getMoodEmoji(state.m)}   Weather: ${getWeatherEmoji(state.w)}`,
			40,
			80,
		);

		ctx.font = "16px cursive, sans-serif";
		ctx.fillStyle = "#2c2523";
		const leftLines = (state.lb || "").split("\n");
		let leftY = 120;
		leftLines.forEach((line) => {
			ctx.fillText(line, 40, leftY);
			leftY += 28;
		});

		// Right Page Header & Body
		const rightX = rect.width / 2 + 30;
		ctx.font = "bold 22px Georgia, serif";
		ctx.fillText(state.t || "Evening Reflections", rightX, 50);

		ctx.font = "16px cursive, sans-serif";
		const rightLines = (state.b || "").split("\n");
		let rightY = 120;
		rightLines.forEach((line) => {
			ctx.fillText(line, rightX, rightY);
			rightY += 28;
		});

		// Doodles layer
		ctx.drawImage(doodleCanvas, 0, 0, rect.width, rect.height);

		// Download trigger
		const a = document.createElement("a");
		a.download = `dear-diary-${state.d || "entry"}.png`;
		a.href = exportCanvas.toDataURL("image/png");
		a.click();
		showToast("💾 Journal page saved as high-res PNG image!");
	}

	// Export / Import JSON
	exportJsonBtn.addEventListener("click", () => {
		const jsonBlob = new Blob([JSON.stringify(state, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(jsonBlob);
		const a = document.createElement("a");
		a.download = `dear-diary-${state.d || "backup"}.json`;
		a.href = url;
		a.click();
		URL.revokeObjectURL(url);
		showToast("📁 JSON backup downloaded");
	});

	importJsonBtn.addEventListener("click", () => {
		jsonFileInput.click();
	});

	jsonFileInput.addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const parsed = JSON.parse(event.target.result);
				state = DiaryUrlCodec.sanitizeState(parsed);
				renderState();
				performSave();
				showToast("🎉 Journal entry loaded successfully!");
			} catch (err) {
				alert("Could not read JSON file: " + err.message);
			}
		};
		reader.readAsText(file);
	});

	// Window resize
	window.addEventListener("resize", () => {
		resizeCanvas();
		redrawCanvasDoodles();
		renderStickers();
	});

	// Initial boot
	initializeState();
	renderState();
});
