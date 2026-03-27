document.addEventListener('DOMContentLoaded', function () {
    // Timer Elements
    const timerDisplay = document.querySelector('.timer-display');
    const timerMode = document.querySelector('.timer-mode');
    const progressRing = document.querySelector('.progress-ring-circle');
    const timerSubcopy = document.querySelector('.timer-subcopy');
    const focusArea = document.querySelector('.focus-area');

    // Button Elements
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const shortBreakBtn = document.getElementById('short-break-btn');
    const longBreakBtn = document.getElementById('long-break-btn');
    const skipBtn = document.getElementById('skip-btn');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsClose = document.getElementById('settings-close');

    // Settings Elements
    const pomodoroDuration = document.getElementById('pomodoro-duration');
    const shortBreakDuration = document.getElementById('short-break-duration');
    const longBreakDuration = document.getElementById('long-break-duration');
    const longBreakIntervalInput = document.getElementById('long-break-interval');
    const autoStartBreakToggle = document.getElementById('auto-start-break');
    const autoStartFocusToggle = document.getElementById('auto-start-focus');

    // Task Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const sessionHistory = document.getElementById('session-history');
    const dailyPomodorosEl = document.getElementById('daily-pomodoros');
    const dailyFocusMinutesEl = document.getElementById('daily-focus-minutes');
    const dailyTasksCompletedEl = document.getElementById('daily-tasks-completed');

    // Theme Elements
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Sound Elements
    const soundSelector = document.getElementById('sound-selector');
    const volumeSliderSound = document.getElementById('volume-slider');
    const testSoundBtn = document.getElementById('test-sound-btn');

    // Music Elements
    const musicSelector = document.getElementById('music-selector');
    const volumeSliderMusic = document.getElementById('volume-slider-m');
    const playMusicBtn = document.getElementById('test-music-btn');

    // Inspiration and Break Suggestions
    const inspirationContainer = document.getElementById('inspiration-container');
    const inspirationText = document.getElementById('inspiration-text');
    const inspirationAuthor = document.getElementById('inspiration-author');
    const breakSuggestion = document.getElementById('break-suggestion');

    // Notification
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notification-title');
    const notificationText = document.getElementById('notification-text');
    const notificationClose = document.getElementById('notification-close');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsOverlay = document.getElementById('settings-overlay');

    const DEFAULT_POMODORO_MINUTES = 25;
    const DEFAULT_SHORT_BREAK_MINUTES = 5;
    const DEFAULT_LONG_BREAK_MINUTES = 15;
    const DEFAULT_LONG_BREAK_INTERVAL = 4;

    // Audio Context and Nodes
    let audioContext;
    let soundAudioElement;
    let musicAudioElement;
    let soundGainNode;
    let musicGainNode;
    let musicPlaying = false; // Flag to track music state

    // Timer Variables
    let timerInterval;
    let remainingTime = DEFAULT_POMODORO_MINUTES * 60;
    let totalTime = DEFAULT_POMODORO_MINUTES * 60;
    let isRunning = false;
    let currentMode = 'pomodoro';
    let completedPomodoros = 0;
    let activeTaskId = null;
    let dailyStats;

    // Calculate the progress ring circumference
    const radius = parseFloat(progressRing.getAttribute('r'));
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = circumference;

    // Sound Files
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

    // Inspirational Quotes
    const inspirationalQuotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Preetam Hegde" },
        { text: "The only way to do great work is to love what you do.", author: "Preetam Hegde" },
        { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
        { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
        { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
        { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" }
    ];

    // Break Time Suggestions
    const breakSuggestions = [
        "Stand up and stretch your arms and legs for 2 minutes.",
        "Close your eyes and take 10 deep breaths.",
        "Drink a glass of water to stay hydrated.",
        "Do 10 jumping jacks to get your blood flowing.",
        "Rest your eyes by looking at something at least 20 feet away for 20 seconds.",
        "Massage your temples and shoulders to release tension.",
        "Take a short walk around your room or office.",
        "Do some neck rolls to relieve neck strain.",
        "Stretch your wrists to prevent strain from typing.",
        "Practice mindfulness for 1 minute by focusing on your breathing."
    ];

    // Initialize the timer display
    updateTimerDisplay();

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipSession);
    pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
    shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
    longBreakBtn.addEventListener('click', () => switchMode('longBreak'));
    if (settingsToggle) {
        settingsToggle.addEventListener('click', toggleSettingsPanel);
    }
    if (settingsClose) {
        settingsClose.addEventListener('click', closeSettingsPanel);
    }
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', closeSettingsPanel);
    }

    pomodoroDuration.addEventListener('change', updateSettings);
    shortBreakDuration.addEventListener('change', updateSettings);
    longBreakDuration.addEventListener('change', updateSettings);
    longBreakIntervalInput.addEventListener('change', handleLongBreakIntervalChange);
    autoStartBreakToggle.addEventListener('change', savePreferences);
    autoStartFocusToggle.addEventListener('change', savePreferences);

    taskForm.addEventListener('submit', addTask);

    themeButtons.forEach(button => {
        button.addEventListener('click', () => switchTheme(button.dataset.theme));
    });

    soundSelector.addEventListener('change', updateSoundSettings);
    volumeSliderSound.addEventListener('input', updateSoundSettings);
    testSoundBtn.addEventListener('click', testSound);
    musicSelector.addEventListener('change', updateMusicSettings);
    volumeSliderMusic.addEventListener('input', updateMusicSettings);
    playMusicBtn.addEventListener('click', toggleMusic);

    notificationClose.addEventListener('click', () => {
        notification.style.display = 'none';
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsPanel && settingsPanel.classList.contains('active')) {
            closeSettingsPanel();
        }
    });

    // Initialize Audio Context
    function initAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Sound Setup
        soundAudioElement = new Audio();
        soundGainNode = audioContext.createGain();
        const soundSource = audioContext.createMediaElementSource(soundAudioElement);
        soundSource.connect(soundGainNode);
        soundGainNode.connect(audioContext.destination);

        // Music Setup
        musicAudioElement = new Audio();
        musicGainNode = audioContext.createGain();
        const musicSource = audioContext.createMediaElementSource(musicAudioElement);
        musicSource.connect(musicGainNode);
        musicGainNode.connect(audioContext.destination);

        updateSoundSettings();
        updateMusicSettings();
    }

    // Timer Functions
    function startTimer() {
        if (!isRunning) {
            if (audioContext === undefined) {
                initAudio();
            }

            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;

            const startTime = Date.now();
            const initialRemainingTime = remainingTime;

            timerInterval = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                remainingTime = Math.max(0, initialRemainingTime - elapsedSeconds);

                updateTimerDisplay();
                updateProgressRing();

                if (remainingTime <= 0) {
                    completeTimer();
                }
            }, 100);
        }
    }

    function pauseTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }

    function resetTimer() {
        pauseTimer();
        setTimerDuration();
        updateTimerDisplay();
        updateProgressRing();
    }

    function completeTimer() {
        pauseTimer();
        playSound();
        showNotification();

        let nextMode;

        if (currentMode === 'pomodoro') {
            completedPomodoros++;

            // Log the completed session
            if (activeTaskId) {
                const activeTaskEl = document.querySelector(`[data-id="${activeTaskId}"]`);
                if (activeTaskEl) {
                    const taskText = activeTaskEl.querySelector('.task-text').textContent;
                    logSession(taskText);
                }
            } else {
                logSession('Unnamed session');
            }

            const focusMinutes = getDurationFromInput(pomodoroDuration, DEFAULT_POMODORO_MINUTES);
            incrementDailyPomodoroStats(focusMinutes);

            const interval = getLongBreakInterval();
            nextMode = (interval > 0 && completedPomodoros % interval === 0) ? 'longBreak' : 'shortBreak';
        } else {
            // Switch back to pomodoro after break
            nextMode = 'pomodoro';
        }

        const shouldAutoStart = nextMode === 'pomodoro'
            ? autoStartFocusToggle.checked
            : autoStartBreakToggle.checked;

        switchMode(nextMode, { shouldAutoStart });
        showInspiration();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = timeString;
        document.title = `${timeString} - Pomodoro Timer`;
    }

    function updateProgressRing() {
        const offset = circumference - (remainingTime / totalTime) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    function getDurationFromInput(inputElement, fallbackMinutes) {
        const value = parseInt(inputElement.value, 10);
        if (Number.isFinite(value) && value > 0) {
            return value;
        }

        inputElement.value = fallbackMinutes;
        return fallbackMinutes;
    }

    function setTimerDuration() {
        switch (currentMode) {
            case 'pomodoro':
                remainingTime = getDurationFromInput(pomodoroDuration, DEFAULT_POMODORO_MINUTES) * 60;
                totalTime = remainingTime;
                break;
            case 'shortBreak':
                remainingTime = getDurationFromInput(shortBreakDuration, DEFAULT_SHORT_BREAK_MINUTES) * 60;
                totalTime = remainingTime;
                break;
            case 'longBreak':
                remainingTime = getDurationFromInput(longBreakDuration, DEFAULT_LONG_BREAK_MINUTES) * 60;
                totalTime = remainingTime;
                break;
        }
    }

    function getLongBreakInterval() {
        const interval = parseInt(longBreakIntervalInput.value, 10);
        if (Number.isFinite(interval) && interval > 0) {
            return interval;
        }
        return DEFAULT_LONG_BREAK_INTERVAL;
    }

    function switchMode(mode, options = {}) {
        const { shouldAutoStart = false } = options;

        // Update active button
        pomodoroBtn.classList.remove('active');
        shortBreakBtn.classList.remove('active');
        longBreakBtn.classList.remove('active');

        currentMode = mode;

        switch (mode) {
            case 'pomodoro':
                pomodoroBtn.classList.add('active');
                timerMode.textContent = 'Pomodoro';
                break;
            case 'shortBreak':
                shortBreakBtn.classList.add('active');
                timerMode.textContent = 'Short Break';
                break;
            case 'longBreak':
                longBreakBtn.classList.add('active');
                timerMode.textContent = 'Long Break';
                break;
        }
        updateModeAtmosphere(mode);

        resetTimer();

        if (shouldAutoStart) {
            setTimeout(() => {
                if (!isRunning) {
                    startTimer();
                }
            }, 200);
        }
    }

    function updateSettings() {
        if (!isRunning) {
            setTimerDuration();
            updateTimerDisplay();
            updateProgressRing();
            updateModeAtmosphere(currentMode);
        }
    }

    function handleLongBreakIntervalChange() {
        const sanitizedInterval = Math.max(1, parseInt(longBreakIntervalInput.value, 10) || DEFAULT_LONG_BREAK_INTERVAL);
        longBreakIntervalInput.value = sanitizedInterval;
        savePreferences();
    }

    function skipSession() {
        if (isRunning) {
            pauseTimer();
        }

        let nextMode;
        if (currentMode === 'pomodoro') {
            const interval = getLongBreakInterval();
            const shouldTakeLongBreak = completedPomodoros > 0 && completedPomodoros % interval === 0;
            nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
        } else {
            nextMode = 'pomodoro';
        }

        const shouldAutoStart = nextMode === 'pomodoro'
            ? autoStartFocusToggle.checked
            : autoStartBreakToggle.checked;

        switchMode(nextMode, { shouldAutoStart });
        showInspiration();
    }

    // Task Management Functions
    function addTask(e) {
        e.preventDefault();

        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const taskId = Date.now().toString();
        const taskHTML = `
            <li class="task-item" data-id="${taskId}">
                <input type="checkbox" class="task-checkbox">
                <span class="task-text">${taskText}</span>
                <div class="task-actions">
                    <button class="task-btn focus" title="Focus on this task">
                        <i class="fas fa-bullseye"></i>
                    </button>
                    <button class="task-btn delete" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>
        `;

        taskList.insertAdjacentHTML('beforeend', taskHTML);
        taskInput.value = '';

        // Add event listeners to the new task
        const newTask = taskList.querySelector(`[data-id="${taskId}"]`);
        newTask.dataset.counted = 'false';

        const checkboxEl = newTask.querySelector('.task-checkbox');
        checkboxEl.addEventListener('change', () => {
            newTask.classList.toggle('completed');
            updateTaskCompletionStats(newTask, checkboxEl.checked);
        });

        const focusBtn = newTask.querySelector('.task-btn.focus');
        focusBtn.addEventListener('click', () => {
            setActiveTask(taskId);
        });

        const deleteBtn = newTask.querySelector('.task-btn.delete');
        deleteBtn.addEventListener('click', () => {
            handleTaskDeletion(newTask);
        });
    }

    function setActiveTask(taskId) {
        // Remove active class from all tasks
        const allTasks = taskList.querySelectorAll('.task-item');
        allTasks.forEach(task => task.classList.remove('active'));

        // Add active class to selected task
        const selectedTask = taskList.querySelector(`[data-id="${taskId}"]`);
        if (selectedTask) {
            selectedTask.classList.add('active');
            activeTaskId = taskId;
        }
    }

    function updateTaskCompletionStats(taskElement, isCompleted) {
        const alreadyCounted = taskElement.dataset.counted === 'true';

        if (isCompleted && !alreadyCounted) {
            taskElement.dataset.counted = 'true';
            adjustDailyTaskCount(1);
        } else if (!isCompleted && alreadyCounted) {
            taskElement.dataset.counted = 'false';
            adjustDailyTaskCount(-1);
        }
    }

    function handleTaskDeletion(taskElement) {
        if (taskElement.dataset.counted === 'true') {
            adjustDailyTaskCount(-1);
        }

        if (activeTaskId === taskElement.dataset.id) {
            activeTaskId = null;
        }

        taskElement.remove();
    }

    function logSession(taskName) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const focusDuration = getDurationFromInput(pomodoroDuration, DEFAULT_POMODORO_MINUTES);

        const sessionHTML = `
            <li class="session-item fade-in">
                <span class="session-task">${taskName}</span>
                <span class="session-time">${timeString} - ${focusDuration} min</span>
            </li>
        `;

        sessionHistory.insertAdjacentHTML('afterbegin', sessionHTML);
    }

    function getLocalISODate() {
        const now = new Date();
        const timezoneOffsetMs = now.getTimezoneOffset() * 60000;
        const localDate = new Date(now.getTime() - timezoneOffsetMs);
        return localDate.toISOString().split('T')[0];
    }

    function createEmptyStats(date) {
        return {
            date,
            pomodoros: 0,
            focusMinutes: 0,
            tasksCompleted: 0
        };
    }

    function loadDailyStats() {
        const today = getLocalISODate();
        const storedStats = localStorage.getItem('pomodoro-daily-stats');

        if (storedStats) {
            try {
                const parsedStats = JSON.parse(storedStats);
                if (parsedStats.date === today) {
                    return parsedStats;
                }
            } catch (error) {
                console.warn('Unable to parse stored pomodoro stats', error);
            }
        }

        return createEmptyStats(today);
    }

    function saveDailyStats() {
        if (!dailyStats) {
            dailyStats = createEmptyStats(getLocalISODate());
        }
        localStorage.setItem('pomodoro-daily-stats', JSON.stringify(dailyStats));
    }

    function updateDailyStatsDisplay() {
        if (!dailyStats) return;

        dailyPomodorosEl.textContent = dailyStats.pomodoros;
        dailyFocusMinutesEl.textContent = dailyStats.focusMinutes;
        dailyTasksCompletedEl.textContent = dailyStats.tasksCompleted;
    }

    function incrementDailyPomodoroStats(minutes) {
        if (!dailyStats) {
            dailyStats = loadDailyStats();
        }

        dailyStats.pomodoros += 1;
        if (Number.isFinite(minutes) && minutes > 0) {
            dailyStats.focusMinutes += minutes;
        }

        saveDailyStats();
        updateDailyStatsDisplay();
    }

    function adjustDailyTaskCount(delta) {
        if (!dailyStats) {
            dailyStats = loadDailyStats();
        }

        dailyStats.tasksCompleted = Math.max(0, dailyStats.tasksCompleted + delta);
        saveDailyStats();
        updateDailyStatsDisplay();
    }

    // Theme Functions
    function switchTheme(theme) {
        document.body.setAttribute('data-theme', theme);

        // Update active theme button
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });

        // Save theme preference
        localStorage.setItem('pomodoro-theme', theme);
    }

    // Sound Functions
    function updateSoundSettings() {
        if (soundGainNode) {
            soundGainNode.gain.value = volumeSliderSound.value / 100;
        }
    }

    function playSound() {
        if (soundSelector.value === 'none') return;

        if (!audioContext) {
            initAudio();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const soundFile = soundFiles[soundSelector.value];
        if (soundFile) {
            soundAudioElement.src = soundFile;
            soundAudioElement.play();
            soundAudioElement.onended = () => {
                if (musicPlaying) {
                    musicAudioElement.play();
                }
            }
        }
    }

    function testSound() {
        playSound();
    }

    // Music Functions
    function updateMusicSettings() {
        if (musicGainNode) {
            musicGainNode.gain.value = volumeSliderMusic.value / 100;
        }
    }

    function toggleMusic() {
        if (musicSelector.value === 'none') {
            stopMusic();
            return;
        }

        if (!audioContext) {
            initAudio();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const musicFile = musicFiles[musicSelector.value];
        if (musicFile) {
            if (musicPlaying) {
                stopMusic();
            } else {
                startMusic(musicFile);
            }
        }
    }

    function startMusic(musicFile) {
        musicAudioElement.src = musicFile;
        musicAudioElement.loop = true; // Loop the music
        musicAudioElement.play();
        musicPlaying = true;
    }

    function stopMusic() {
        if (musicAudioElement) {
            musicAudioElement.pause();
            musicAudioElement.currentTime = 0;
            musicPlaying = false;
        }
    }

    // Notification Functions
    function showNotification() {
        if (currentMode === 'pomodoro') {
            notificationTitle.textContent = 'Break Time!';
            notificationText.textContent = 'Well done! Take a break to recharge.';
        } else {
            notificationTitle.textContent = 'Time to Focus!';
            notificationText.textContent = 'Break is over. Time to get back to work!';
        }

        notification.style.display = 'flex';

        // Request browser notification permission
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(notificationTitle.textContent, {
                    body: notificationText.textContent,
                    icon: 'resources/favicon.ico' // Replace with your favicon
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    // Inspiration and Break Suggestions
    function showInspiration() {
        if (!inspirationContainer) {
            return;
        }

        if (currentMode !== 'pomodoro') {
            // Show inspiration and break suggestions during breaks
            const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
            inspirationText.textContent = randomQuote.text;
            inspirationAuthor.textContent = `— ${randomQuote.author}`;

            const randomSuggestion = breakSuggestions[Math.floor(Math.random() * breakSuggestions.length)];
            breakSuggestion.textContent = randomSuggestion;

            inspirationContainer.style.display = 'flex';
            setTimeout(function () {
                inspirationContainer.style.display = 'none';
            }, 60 * 1000 * 3);
        } else {
            // Hide during work sessions
            inspirationContainer.style.display = 'none';
        }
    }

    // Request notification permission on page load
    function requestNotificationPermission() {
        if (!('Notification' in window)) {
            return;
        }

        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    function toggleSettingsPanel() {
        if (!settingsPanel || !settingsOverlay || !settingsToggle) {
            return;
        }
        if (settingsPanel.classList.contains('active')) {
            closeSettingsPanel();
        } else {
            openSettingsPanel();
        }
    }

    function openSettingsPanel() {
        if (!settingsPanel || !settingsOverlay || !settingsToggle) {
            return;
        }
        settingsPanel.classList.add('active');
        settingsOverlay.classList.add('active');
        settingsPanel.setAttribute('aria-hidden', 'false');
        settingsOverlay.setAttribute('aria-hidden', 'false');
        settingsToggle.setAttribute('aria-expanded', 'true');
    }

    function closeSettingsPanel() {
        if (!settingsPanel || !settingsOverlay || !settingsToggle) {
            return;
        }
        settingsPanel.classList.remove('active');
        settingsOverlay.classList.remove('active');
        settingsPanel.setAttribute('aria-hidden', 'true');
        settingsOverlay.setAttribute('aria-hidden', 'true');
        settingsToggle.setAttribute('aria-expanded', 'false');
    }

    function updateModeAtmosphere(mode) {
        const copyMap = {
            pomodoro: 'Stay in the flow',
            shortBreak: 'Take a mindful pause',
            longBreak: 'Reset deeply'
        };

        if (timerSubcopy) {
            timerSubcopy.textContent = copyMap[mode] || 'Stay in the flow';
        }

        if (focusArea) {
            focusArea.setAttribute('data-mode', mode);
        }
    }

    // Load saved preferences
    function loadSavedPreferences() {
        // Load saved theme
        const savedTheme = localStorage.getItem('pomodoro-theme');
        if (savedTheme) {
            switchTheme(savedTheme);
        }

        // Load any other saved preferences like timer durations, sound settings, etc.
        const savedPomodoroDuration = localStorage.getItem('pomodoro-duration');
        if (savedPomodoroDuration) {
            pomodoroDuration.value = savedPomodoroDuration;
        }

        const savedShortBreakDuration = localStorage.getItem('short-break-duration');
        if (savedShortBreakDuration) {
            shortBreakDuration.value = savedShortBreakDuration;
        }

        const savedLongBreakDuration = localStorage.getItem('long-break-duration');
        if (savedLongBreakDuration) {
            longBreakDuration.value = savedLongBreakDuration;
        }

        const savedLongBreakInterval = localStorage.getItem('long-break-interval');
        if (savedLongBreakInterval) {
            longBreakIntervalInput.value = savedLongBreakInterval;
        }

        const savedAutoStartBreak = localStorage.getItem('auto-start-break');
        if (savedAutoStartBreak !== null) {
            autoStartBreakToggle.checked = savedAutoStartBreak === 'true';
        }

        const savedAutoStartFocus = localStorage.getItem('auto-start-focus');
        if (savedAutoStartFocus !== null) {
            autoStartFocusToggle.checked = savedAutoStartFocus === 'true';
        }

        updateSettings();
    }

    // Save preferences when changed
    function savePreferences() {
        localStorage.setItem('pomodoro-duration', pomodoroDuration.value);
        localStorage.setItem('short-break-duration', shortBreakDuration.value);
        localStorage.setItem('long-break-duration', longBreakDuration.value);
        localStorage.setItem('long-break-interval', longBreakIntervalInput.value);
        localStorage.setItem('auto-start-break', autoStartBreakToggle.checked);
        localStorage.setItem('auto-start-focus', autoStartFocusToggle.checked);
    }

    // Add event listeners for saving preferences
    pomodoroDuration.addEventListener('change', savePreferences);
    shortBreakDuration.addEventListener('change', savePreferences);
    longBreakDuration.addEventListener('change', savePreferences);

    // Initialize application
    function init() {
        updateModeAtmosphere(currentMode);
        loadSavedPreferences();
        handleLongBreakIntervalChange();
        requestNotificationPermission();

        dailyStats = loadDailyStats();
        updateDailyStatsDisplay();
        saveDailyStats();

        taskList.innerHTML = `
            <li class="task-item" data-id="demo1">
                <input type="checkbox" class="task-checkbox">
                <span class="task-text">Study!</span>
                <div class="task-actions">
                    <button class="task-btn focus" title="Focus on this task">
                        <i class="fas fa-bullseye"></i>
                    </button>
                    <button class="task-btn delete" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>
            <li class="task-item" data-id="demo2">
                <input type="checkbox" class="task-checkbox">
                <span class="task-text">Project</span>
                <div class="task-actions">
                    <button class="task-btn focus" title="Focus on this task">
                        <i class="fas fa-bullseye"></i>
                    </button>
                    <button class="task-btn delete" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>

        `;
        setActiveTask("demo1");
        // Add event listeners to example tasks
        const demoTasks = taskList.querySelectorAll('.task-item');
        demoTasks.forEach(task => {
            const taskId = task.dataset.id;
            task.dataset.counted = 'false';

            const checkboxEl = task.querySelector('.task-checkbox');
            checkboxEl.addEventListener('change', () => {
                task.classList.toggle('completed');
                updateTaskCompletionStats(task, checkboxEl.checked);
            });

            const focusBtn = task.querySelector('.task-btn.focus');
            focusBtn.addEventListener('click', () => {
                setActiveTask(taskId);
            });

            const deleteBtn = task.querySelector('.task-btn.delete');
            deleteBtn.addEventListener('click', () => {
                handleTaskDeletion(task);
            });
        });

    }

    // Initialize the application
    init();
});
