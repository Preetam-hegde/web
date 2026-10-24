'use strict';

document.addEventListener('DOMContentLoaded', function () {
	const $ = (id) => document.getElementById(id);

	const el = {
		readout: $('readout'),
		statusLine: $('status-line'),
		activeTask: $('active-task'),
		wedge: $('dial-wedge'),
		ticks: $('dial-ticks'),
		cycleDots: $('cycle-dots'),
		cycleText: $('cycle-text'),
		toggleBtn: $('toggle-btn'),
		resetBtn: $('reset-btn'),
		skipBtn: $('skip-btn'),
		extendBtn: $('extend-btn'),
		soloBtn: $('solo-btn'),
		musicQuick: $('music-quick'),
		week: $('week'),
		streak: $('streak'),
		clearDoneBtn: $('clear-done-btn'),
		modeTabs: document.querySelectorAll('.mode'),
		breakCard: $('break-card'),
		breakQuote: $('break-quote'),
		breakAuthor: $('break-author'),
		breakTip: $('break-tip'),
		statSessions: $('stat-sessions'),
		statMinutes: $('stat-minutes'),
		statTasks: $('stat-tasks'),
		taskForm: $('task-form'),
		taskInput: $('task-input'),
		taskList: $('task-list'),
		taskEmpty: $('task-empty'),
		history: $('session-history'),
		historyEmpty: $('history-empty'),
		settingsToggle: $('settings-toggle'),
		settingsClose: $('settings-close'),
		settingsPanel: $('settings-panel'),
		settingsOverlay: $('settings-overlay'),
		durations: {
			focus: $('pomodoro-duration'),
			short: $('short-break-duration'),
			long: $('long-break-duration')
		},
		interval: $('long-break-interval'),
		autoBreak: $('auto-start-break'),
		autoFocus: $('auto-start-focus'),
		soundSelect: $('sound-selector'),
		soundVolume: $('sound-volume'),
		testSoundBtn: $('test-sound-btn'),
		musicSelect: $('music-selector'),
		musicVolume: $('music-volume'),
		musicBtn: $('music-btn'),
		toast: $('toast'),
		toastTitle: $('toast-title'),
		toastText: $('toast-text'),
		toastClose: $('toast-close')
	};

	const MODES = {
		focus: { label: 'Focus', fallback: 25, copy: 'Stay in the flow' },
		short: { label: 'Short break', fallback: 5, copy: 'Take a mindful pause' },
		long: { label: 'Long break', fallback: 15, copy: 'Step away and reset' }
	};
	const DEFAULT_INTERVAL = 4;
	const DIAL_RADIUS = 160;

	const soundFiles = {
		bell: '../../resource/audio/alerts/bell.mp3',
		digital: '../../resource/audio/alerts/impact.mp3',
		nature: '../../resource/audio/alerts/levelup.mp3'
	};
	const musicFiles = {
		lofi: '../../resource/audio/music/loveLoFiM.mp3',
		nature: '../../resource/audio/music/natureM.mp3',
		jazz: '../../resource/audio/music/jazzM.mp3',
		medieval: '../../resource/audio/music/medievalM.mp3'
	};

	const quotes = [
		{ text: "Don't watch the clock; do what it does. Keep going.", author: 'Preetam Hegde' },
		{ text: 'The only way to do great work is to love what you do.', author: 'Preetam Hegde' },
		{ text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
		{ text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
		{ text: 'The harder I work, the luckier I get.', author: 'Samuel Goldwyn' }
	];
	const tips = [
		'Stand up and stretch your arms and legs for two minutes.',
		'Close your eyes and take ten slow breaths.',
		'Drink a glass of water.',
		'Look at something 20 feet away for 20 seconds to rest your eyes.',
		'Roll your neck and shoulders, then stretch your wrists.',
		'Walk around the room before you sit back down.'
	];

	const store = {
		get(key) {
			try { return localStorage.getItem(key); } catch (error) { return null; }
		},
		set(key, value) {
			try { localStorage.setItem(key, value); } catch (error) { /* storage unavailable */ }
		}
	};

	const state = {
		mode: 'focus',
		total: MODES.focus.fallback * 60,
		remaining: MODES.focus.fallback * 60,
		endAt: 0,
		running: false,
		intervalId: null,
		frameId: null,
		activeTaskId: null,
		tasks: [],
		log: [],
		history: {},
		stats: null
	};

	let sound = null;
	let music = null;
	let toastTimer = null;
	let lastFocusedBeforeDrawer = null;

	/* ---------- helpers ---------- */

	function readMinutes(input, fallback) {
		const value = parseInt(input.value, 10);
		if (Number.isFinite(value) && value > 0) return value;
		input.value = fallback;
		return fallback;
	}

	function getInterval() {
		const value = parseInt(el.interval.value, 10);
		return Number.isFinite(value) && value > 0 ? value : DEFAULT_INTERVAL;
	}

	function modeMinutes(mode) {
		return readMinutes(el.durations[mode], MODES[mode].fallback);
	}

	function todayKey() {
		const now = new Date();
		return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
	}

	function dayKey(offset) {
		const d = new Date();
		d.setDate(d.getDate() - offset);
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
	}

	function pick(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	function loadJSON(key, fallback) {
		const raw = store.get(key);
		if (!raw) return fallback;
		try { return JSON.parse(raw); } catch (error) { return fallback; }
	}

	/* ---------- dial ---------- */

	function buildTicks() {
		const parts = [];
		for (let i = 0; i < 60; i++) {
			const major = i % 5 === 0;
			const angle = (i / 60) * Math.PI * 2;
			const inner = major ? 166 : 174;
			const outer = 184;
			const sin = Math.sin(angle);
			const cos = -Math.cos(angle);
			parts.push(`<line class="tick${major ? ' major' : ''}" x1="${(sin * inner).toFixed(2)}" y1="${(cos * inner).toFixed(2)}" x2="${(sin * outer).toFixed(2)}" y2="${(cos * outer).toFixed(2)}"/>`);
		}
		el.ticks.innerHTML = parts.join('');
	}

	/** The wedge covers the time left, ending at 12 o'clock, and its leading edge moves clockwise as time passes. */
	function wedgePath(fraction) {
		const f = Math.min(1, Math.max(0, fraction));
		if (f <= 0) return '';
		const r = DIAL_RADIUS;
		if (f >= 0.9999) {
			return `M0 ${-r}A${r} ${r} 0 1 0 0 ${r}A${r} ${r} 0 1 0 0 ${-r}Z`;
		}
		const angle = -f * Math.PI * 2;
		const x = Math.sin(angle) * r;
		const y = -Math.cos(angle) * r;
		const large = f > 0.5 ? 1 : 0;
		return `M0 0L0 ${-r}A${r} ${r} 0 ${large} 0 ${x.toFixed(2)} ${y.toFixed(2)}Z`;
	}

	function drawDial() {
		const left = state.running ? Math.max(0, state.endAt - Date.now()) / 1000 : state.remaining;
		el.wedge.setAttribute('d', wedgePath(left / state.total));
	}

	function dialLoop() {
		drawDial();
		if (state.running) state.frameId = requestAnimationFrame(dialLoop);
	}

	/* ---------- render ---------- */

	function formatTime(seconds) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return { text: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, m, s };
	}

	let lastReadout = '';
	function renderReadout() {
		const { text, m, s } = formatTime(state.remaining);
		if (text === lastReadout) return;
		lastReadout = text;
		const [mm, ss] = text.split(':');
		el.readout.innerHTML = [...mm].map((c) => `<span class="d">${c}</span>`).join('')
			+ '<span class="colon">:</span>'
			+ [...ss].map((c) => `<span class="d">${c}</span>`).join('');
		el.readout.setAttribute('aria-label', `${m} minutes ${s} seconds remaining`);
		document.title = `${text} · ${MODES[state.mode].label}`;
	}

	function renderCycle() {
		const interval = Math.min(getInterval(), 12);
		const done = state.stats.pomodoros % getInterval();
		el.cycleDots.innerHTML = Array.from({ length: interval }, (_, i) => `<li class="${i < done ? 'done' : ''}"></li>`).join('');
		const left = getInterval() - done;
		el.cycleText.textContent = left === 1 ? 'Next session earns a long break' : `${left} sessions until a long break`;
	}

	function renderControls() {
		const fresh = state.remaining === state.total;
		el.toggleBtn.textContent = state.running ? 'Pause' : (fresh ? 'Start' : 'Resume');
		el.resetBtn.disabled = fresh && !state.running;
		el.resetBtn.style.visibility = el.resetBtn.disabled ? 'hidden' : 'visible';
		saveTimer();
	}

	function renderStats() {
		el.statSessions.textContent = state.stats.pomodoros;
		el.statMinutes.textContent = state.stats.focusMinutes;
		el.statTasks.textContent = state.stats.tasksCompleted;
	}

	function computeStreak() {
		let streak = 0;
		let offset = state.history[dayKey(0)] && state.history[dayKey(0)].sessions > 0 ? 0 : 1;
		while (state.history[dayKey(offset)] && state.history[dayKey(offset)].sessions > 0) {
			streak += 1;
			offset += 1;
		}
		return streak;
	}

	function renderWeek() {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const key = dayKey(i);
			const entry = state.history[key] || { sessions: 0, minutes: 0 };
			const date = new Date(`${key}T12:00:00`);
			days.push({ i, entry, label: date.toLocaleDateString([], { weekday: 'narrow' }), long: date.toLocaleDateString([], { weekday: 'long' }) });
		}
		const max = Math.max(30, ...days.map((d) => d.entry.minutes));
		el.week.innerHTML = days.map((d) => {
			const height = d.entry.minutes ? Math.max(4, Math.round((d.entry.minutes / max) * 80)) : 4;
			return `<li class="${d.i === 0 ? 'today' : ''}" title="${d.long}: ${d.entry.sessions} ${d.entry.sessions === 1 ? 'session' : 'sessions'}, ${d.entry.minutes} min" aria-label="${d.long}: ${d.entry.sessions} ${d.entry.sessions === 1 ? 'session' : 'sessions'}, ${d.entry.minutes} minutes"><span class="bar-fill" style="height:${height}px"></span><span aria-hidden="true">${d.label}</span></li>`;
		}).join('');
		const streak = computeStreak();
		el.streak.textContent = streak ? `${streak} day streak` : 'No streak yet';
	}

	function renderActiveTask() {
		const task = state.tasks.find((t) => t.id === state.activeTaskId);
		el.activeTask.textContent = task ? task.text : 'No task picked';
	}

	function renderTasks() {
		el.taskList.innerHTML = '';
		state.tasks.forEach((task) => {
			const li = document.createElement('li');
			li.className = 'task-item' + (task.done ? ' done' : '') + (task.id === state.activeTaskId ? ' active' : '');
			li.dataset.id = task.id;

			const box = document.createElement('input');
			box.type = 'checkbox';
			box.checked = task.done;
			box.setAttribute('aria-label', `Mark "${task.text}" as done`);

			const text = document.createElement('span');
			text.className = 'task-text';
			text.textContent = task.text;

			const actions = document.createElement('div');
			actions.className = 'task-actions';
			const pickBtn = document.createElement('button');
			pickBtn.type = 'button';
			pickBtn.className = 'text-btn';
			pickBtn.dataset.action = 'pick';
			pickBtn.textContent = task.id === state.activeTaskId ? 'Picked' : 'Pick';
			pickBtn.setAttribute('aria-pressed', String(task.id === state.activeTaskId));
			const delBtn = document.createElement('button');
			delBtn.type = 'button';
			delBtn.className = 'text-btn';
			delBtn.dataset.action = 'delete';
			delBtn.textContent = 'Delete';
			delBtn.setAttribute('aria-label', `Delete "${task.text}"`);
			actions.append(pickBtn, delBtn);

			li.append(box, text);
			if (task.sessions) {
				const count = document.createElement('span');
				count.className = 'task-count';
				count.textContent = `×${task.sessions}`;
				count.title = `${task.sessions} focus session${task.sessions === 1 ? '' : 's'}`;
				li.append(count);
			}
			li.append(actions);
			el.taskList.append(li);
		});
		el.taskEmpty.hidden = state.tasks.length > 0;
		el.clearDoneBtn.hidden = !state.tasks.some((t) => t.done);
		renderActiveTask();
	}

	function renderHistory() {
		el.history.innerHTML = '';
		state.log.forEach((entry) => {
			const li = document.createElement('li');
			li.className = 'session-item';
			const name = document.createElement('span');
			name.textContent = entry.task;
			const when = document.createElement('span');
			when.className = 'when';
			when.textContent = `${entry.time}, ${entry.minutes} min`;
			li.append(name, when);
			el.history.append(li);
		});
		el.historyEmpty.hidden = state.log.length > 0;
	}

	function renderMode() {
		document.body.dataset.mode = state.mode;
		el.modeTabs.forEach((tab) => {
			tab.setAttribute('aria-selected', String(tab.dataset.mode === state.mode));
		});
		el.statusLine.textContent = MODES[state.mode].copy;
	}

	/* ---------- timer ---------- */

	function saveTimer() {
		store.set('pomodoro-timer', JSON.stringify({
			mode: state.mode,
			total: state.total,
			remaining: state.remaining,
			running: state.running,
			endAt: state.endAt
		}));
	}

	function restoreTimer() {
		const saved = loadJSON('pomodoro-timer', null);
		if (!saved || !MODES[saved.mode]) return;
		state.mode = saved.mode;
		setDuration();
		if (saved.total !== state.total && saved.total !== state.total + 300) {
			return;
		}
		if (saved.running && saved.endAt > Date.now()) {
			state.total = saved.total;
			state.remaining = Math.ceil((saved.endAt - Date.now()) / 1000);
			startTimer();
		} else if (!saved.running && saved.remaining > 0 && saved.remaining <= saved.total) {
			state.total = saved.total;
			state.remaining = saved.remaining;
		}
	}

	function extendTimer() {
		state.total += 300;
		state.remaining += 300;
		if (state.running) state.endAt += 300000;
		lastReadout = '';
		renderReadout();
		drawDial();
		renderControls();
	}

	function setDuration() {
		state.total = modeMinutes(state.mode) * 60;
		state.remaining = state.total;
	}

	function tick() {
		const left = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
		if (left !== state.remaining) {
			state.remaining = left;
			renderReadout();
		}
		if (left <= 0) completeSession();
	}

	function startTimer() {
		if (state.running) return;
		requestNotifications();
		state.running = true;
		state.endAt = Date.now() + state.remaining * 1000;
		state.intervalId = setInterval(tick, 250);
		cancelAnimationFrame(state.frameId);
		dialLoop();
		renderControls();
	}

	function pauseTimer() {
		if (!state.running) return;
		state.remaining = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
		state.running = false;
		clearInterval(state.intervalId);
		cancelAnimationFrame(state.frameId);
		drawDial();
		renderReadout();
		renderControls();
	}

	function resetTimer() {
		pauseTimer();
		setDuration();
		lastReadout = '';
		renderReadout();
		drawDial();
		renderControls();
	}

	function switchMode(mode, autoStart) {
		state.mode = mode;
		renderMode();
		resetTimer();
		showBreakCard();
		announce(`${MODES[mode].label}, ${modeMinutes(mode)} minutes`);
		if (autoStart) startTimer();
	}

	function breakAfterFocus() {
		return state.stats.pomodoros > 0 && state.stats.pomodoros % getInterval() === 0 ? 'long' : 'short';
	}

	function completeSession() {
		pauseTimer();
		playAlert();

		let next;
		if (state.mode === 'focus') {
			const minutes = Math.round(state.total / 60);
			state.stats.pomodoros += 1;
			state.stats.focusMinutes += minutes;
			saveStats();
			recordHistory(minutes);
			const worked = state.tasks.find((t) => t.id === state.activeTaskId);
			if (worked) {
				worked.sessions = (worked.sessions || 0) + 1;
				saveTasks();
				renderTasks();
			}
			logSession(minutes);
			renderStats();
			renderCycle();
			next = breakAfterFocus();
			notify('Break time', 'Nice work. Step away for a moment.');
		} else {
			next = 'focus';
			notify('Back to focus', 'Break is over. Pick up where you left off.');
		}

		switchMode(next, next === 'focus' ? el.autoFocus.checked : el.autoBreak.checked);
	}

	function skipSession() {
		pauseTimer();
		const next = state.mode === 'focus' ? breakAfterFocus() : 'focus';
		switchMode(next, next === 'focus' ? el.autoFocus.checked : el.autoBreak.checked);
	}

	function showBreakCard() {
		const onBreak = state.mode !== 'focus';
		el.breakCard.hidden = !onBreak;
		if (!onBreak) return;
		const quote = pick(quotes);
		el.breakQuote.textContent = `“${quote.text}”`;
		el.breakAuthor.textContent = quote.author;
		el.breakTip.textContent = pick(tips);
	}

	/* ---------- stats, tasks, log ---------- */

	function loadStats() {
		const saved = loadJSON('pomodoro-daily-stats', null);
		if (saved && saved.date === todayKey()) return saved;
		return { date: todayKey(), pomodoros: 0, focusMinutes: 0, tasksCompleted: 0 };
	}

	function saveStats() {
		store.set('pomodoro-daily-stats', JSON.stringify(state.stats));
	}

	function recordHistory(minutes) {
		const key = dayKey(0);
		const entry = state.history[key] || { sessions: 0, minutes: 0 };
		entry.sessions += 1;
		entry.minutes += minutes;
		state.history[key] = entry;
		const keep = Object.keys(state.history).sort().slice(-60);
		state.history = Object.fromEntries(keep.map((k) => [k, state.history[k]]));
		store.set('pomodoro-history', JSON.stringify(state.history));
		renderWeek();
	}

	function clearDone() {
		state.tasks = state.tasks.filter((t) => !t.done);
		if (!state.tasks.some((t) => t.id === state.activeTaskId)) state.activeTaskId = null;
		saveTasks();
		renderTasks();
	}

	function saveTasks() {
		store.set('pomodoro-tasks', JSON.stringify({ tasks: state.tasks, active: state.activeTaskId }));
	}

	function saveLog() {
		store.set('pomodoro-log', JSON.stringify({ date: todayKey(), entries: state.log }));
	}

	function logSession(minutes) {
		const task = state.tasks.find((t) => t.id === state.activeTaskId);
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		state.log.unshift({ task: task ? task.text : 'Unnamed session', time, minutes });
		saveLog();
		renderHistory();
	}

	function addTask(event) {
		event.preventDefault();
		const text = el.taskInput.value.trim();
		if (!text) return;
		const task = { id: String(Date.now()), text, done: false };
		state.tasks.push(task);
		if (!state.activeTaskId) state.activeTaskId = task.id;
		el.taskInput.value = '';
		saveTasks();
		renderTasks();
	}

	function onTaskClick(event) {
		const item = event.target.closest('.task-item');
		if (!item) return;
		const task = state.tasks.find((t) => t.id === item.dataset.id);
		if (!task) return;

		const action = event.target.dataset.action;
		if (action === 'pick') {
			state.activeTaskId = task.id;
		} else if (action === 'delete') {
			if (task.done) state.stats.tasksCompleted = Math.max(0, state.stats.tasksCompleted - 1);
			state.tasks = state.tasks.filter((t) => t.id !== task.id);
			if (state.activeTaskId === task.id) state.activeTaskId = null;
			saveStats();
			renderStats();
		} else {
			return;
		}
		saveTasks();
		renderTasks();
	}

	function onTaskChange(event) {
		if (event.target.type !== 'checkbox') return;
		const item = event.target.closest('.task-item');
		const task = item && state.tasks.find((t) => t.id === item.dataset.id);
		if (!task) return;
		task.done = event.target.checked;
		state.stats.tasksCompleted = Math.max(0, state.stats.tasksCompleted + (task.done ? 1 : -1));
		saveStats();
		saveTasks();
		renderStats();
		renderTasks();
	}

	/* ---------- audio and notifications ---------- */

	function getSound() {
		if (!sound) sound = new Audio();
		sound.volume = el.soundVolume.value / 100;
		return sound;
	}

	function getMusic() {
		if (!music) {
			music = new Audio();
			music.loop = true;
		}
		music.volume = el.musicVolume.value / 100;
		return music;
	}

	function playAlert() {
		const file = soundFiles[el.soundSelect.value];
		if (!file) return;
		const audio = getSound();
		audio.src = file;
		audio.play().catch(() => { /* blocked until the page has been interacted with */ });
	}

	function toggleMusic() {
		const audio = getMusic();
		if (!audio.paused) {
			audio.pause();
			setMusicButton(false);
			return;
		}
		audio.src = musicFiles[el.musicSelect.value];
		audio.play().then(() => setMusicButton(true)).catch(() => setMusicButton(false));
	}

	function setMusicButton(playing) {
		[el.musicBtn, el.musicQuick].forEach((btn) => {
			btn.textContent = playing ? 'Stop music' : 'Play music';
			btn.setAttribute('aria-pressed', String(playing));
		});
	}

	function onMusicTrackChange() {
		if (music && !music.paused) {
			music.src = musicFiles[el.musicSelect.value];
			music.play().catch(() => setMusicButton(false));
		}
		savePrefs();
	}

	function requestNotifications() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	function notify(title, text) {
		el.toastTitle.textContent = title;
		el.toastText.textContent = text;
		el.toast.hidden = false;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => { el.toast.hidden = true; }, 6000);

		if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
			new Notification(title, { body: text, icon: '../../v1/favicon.svg' });
		}
	}

	function announce(message) {
		el.toast.setAttribute('aria-label', message);
	}

	function setSolo(on) {
		document.body.classList.toggle('solo', on);
		el.soloBtn.setAttribute('aria-pressed', String(on));
		el.soloBtn.textContent = on ? 'Show everything' : 'Focus view';
	}

	/* ---------- settings drawer ---------- */

	function openSettings() {
		lastFocusedBeforeDrawer = document.activeElement;
		el.settingsPanel.hidden = false;
		el.settingsOverlay.hidden = false;
		el.settingsToggle.setAttribute('aria-expanded', 'true');
		el.settingsClose.focus();
	}

	function closeSettings() {
		el.settingsPanel.hidden = true;
		el.settingsOverlay.hidden = true;
		el.settingsToggle.setAttribute('aria-expanded', 'false');
		if (lastFocusedBeforeDrawer) lastFocusedBeforeDrawer.focus();
	}

	function trapFocus(event) {
		if (event.key !== 'Tab' || el.settingsPanel.hidden) return;
		const focusable = el.settingsPanel.querySelectorAll('button, input, select');
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	/* ---------- preferences ---------- */

	const prefFields = [
		['pomodoro-duration', el.durations.focus],
		['short-break-duration', el.durations.short],
		['long-break-duration', el.durations.long],
		['long-break-interval', el.interval],
		['pomodoro-sound', el.soundSelect],
		['pomodoro-sound-volume', el.soundVolume],
		['pomodoro-music', el.musicSelect],
		['pomodoro-music-volume', el.musicVolume]
	];
	const prefToggles = [
		['auto-start-break', el.autoBreak],
		['auto-start-focus', el.autoFocus]
	];

	function loadPrefs() {
		prefFields.forEach(([key, input]) => {
			const saved = store.get(key);
			if (saved !== null && saved !== '') input.value = saved;
		});
		prefToggles.forEach(([key, input]) => {
			const saved = store.get(key);
			if (saved !== null) input.checked = saved === 'true';
		});
	}

	function savePrefs() {
		prefFields.forEach(([key, input]) => store.set(key, input.value));
		prefToggles.forEach(([key, input]) => store.set(key, String(input.checked)));
	}

	function onDurationChange() {
		savePrefs();
		if (!state.running) {
			setDuration();
			lastReadout = '';
			renderReadout();
			drawDial();
			renderControls();
		}
		renderCycle();
	}

	/* ---------- events ---------- */

	el.toggleBtn.addEventListener('click', () => (state.running ? pauseTimer() : startTimer()));
	el.resetBtn.addEventListener('click', resetTimer);
	el.skipBtn.addEventListener('click', skipSession);
	el.extendBtn.addEventListener('click', extendTimer);
	el.soloBtn.addEventListener('click', () => setSolo(!document.body.classList.contains('solo')));
	el.musicQuick.addEventListener('click', toggleMusic);
	el.clearDoneBtn.addEventListener('click', clearDone);
	el.modeTabs.forEach((tab) => tab.addEventListener('click', () => switchMode(tab.dataset.mode, false)));

	el.taskForm.addEventListener('submit', addTask);
	el.taskList.addEventListener('click', onTaskClick);
	el.taskList.addEventListener('change', onTaskChange);

	el.settingsToggle.addEventListener('click', openSettings);
	el.settingsClose.addEventListener('click', closeSettings);
	el.settingsOverlay.addEventListener('click', closeSettings);

	Object.values(el.durations).forEach((input) => input.addEventListener('change', onDurationChange));
	el.interval.addEventListener('change', () => {
		el.interval.value = getInterval();
		onDurationChange();
	});
	[el.autoBreak, el.autoFocus, el.soundSelect, el.soundVolume].forEach((input) => input.addEventListener('change', savePrefs));
	el.soundVolume.addEventListener('input', () => { if (sound) sound.volume = el.soundVolume.value / 100; });
	el.musicVolume.addEventListener('input', () => {
		if (music) music.volume = el.musicVolume.value / 100;
		savePrefs();
	});
	el.musicSelect.addEventListener('change', onMusicTrackChange);
	el.testSoundBtn.addEventListener('click', playAlert);
	el.musicBtn.addEventListener('click', toggleMusic);

	el.toastClose.addEventListener('click', () => { el.toast.hidden = true; });

	document.addEventListener('keydown', (event) => {
		trapFocus(event);
		if (event.key === 'Escape' && !el.settingsPanel.hidden) {
			closeSettings();
			return;
		}
		if (event.key === 'Escape' && document.body.classList.contains('solo')) {
			setSolo(false);
			return;
		}
		const typing = /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(document.activeElement.tagName);
		if (typing || event.ctrlKey || event.metaKey || event.altKey || !el.settingsPanel.hidden) return;
		if (event.code === 'Space') {
			event.preventDefault();
			state.running ? pauseTimer() : startTimer();
		} else if (event.key === 'r') {
			resetTimer();
		} else if (event.key === 's') {
			skipSession();
		} else if (event.key === 'f') {
			setSolo(!document.body.classList.contains('solo'));
		}
	});

	/* ---------- init ---------- */

	function init() {
		buildTicks();
		loadPrefs();

		state.stats = loadStats();
		saveStats();

		const savedTasks = loadJSON('pomodoro-tasks', null);
		if (savedTasks && Array.isArray(savedTasks.tasks)) {
			state.tasks = savedTasks.tasks;
			state.activeTaskId = state.tasks.some((t) => t.id === savedTasks.active) ? savedTasks.active : null;
		}

		const savedLog = loadJSON('pomodoro-log', null);
		if (savedLog && savedLog.date === todayKey() && Array.isArray(savedLog.entries)) {
			state.log = savedLog.entries;
		}

		state.history = loadJSON('pomodoro-history', {});
		if (state.stats.pomodoros > 0 && !state.history[dayKey(0)]) {
			state.history[dayKey(0)] = { sessions: state.stats.pomodoros, minutes: state.stats.focusMinutes };
		}

		el.interval.value = getInterval();
		setDuration();
		restoreTimer();
		renderMode();
		renderReadout();
		drawDial();
		renderControls();
		renderCycle();
		renderStats();
		renderTasks();
		renderHistory();
		renderWeek();
	}

	init();
});
