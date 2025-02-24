document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const digitalTimer = document.getElementById('digital-timer');
    const startPauseBtn = document.getElementById('start-pause');
    const resetBtn = document.getElementById('reset');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const workTimeInput = document.getElementById('work-time');
    const breakTimeInput = document.getElementById('break-time');
    const saveSettingsBtn = document.getElementById('save-settings');
    const infoBtn = document.getElementById('info-btn');
    const infoTooltip = document.getElementById('info-tooltip');
    const breakCanvas = document.getElementById('break-canvas');
    const messageDiv = document.getElementById('message');
    const sound = document.getElementById('sound');
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    const themeSelect = document.getElementById('theme-select');
    const clockDesignSelect = document.getElementById('clock-design-select');
    const body = document.body;
    const clockFace = document.getElementById('clock-face');
    const instructionOverlay = document.getElementById('instruction-overlay');
    const instructionCloseBtn = document.querySelector('.instruction-close');
    const disableInstructionsCheckbox = document.getElementById('disable-instructions-checkbox');
    const disableNotificationsCheckbox = document.getElementById('disable-notifications-checkbox');


    // Timer variables
    let workTime = 25; // minutes
    let breakTime = 5; // minutes
    let remainingTime = workTime * 60; // seconds
    let phase = 'work'; // 'work' or 'break'
    let status = 'idle'; // 'idle', 'running', 'paused'
    let timerInterval = null;
    let animationFrame = null;
    let notificationEnabled = true; // Notifications are enabled by default

    // Particle array for cosmic animation
    const particles = [];
    const particleCount = 100;

    // Load saved settings or defaults
    let currentTheme = localStorage.getItem('theme') || 'theme-default';
    let currentClockDesign = localStorage.getItem('clockDesign') || 'analog-hands';
    let instructionsDisabled = localStorage.getItem('instructionsDisabled') === 'true';
    let notificationsDisabledUntil = localStorage.getItem('notificationsDisabledUntil');

    // Apply theme and clock design on load
    function applyTheme(themeName) {
        body.className = themeName;
        localStorage.setItem('theme', themeName);
        themeSelect.value = themeName;
    }

    function applyClockDesign(designName) {
        const clock = document.getElementById('clock');
        clock.className = ''; // Reset all classes on clock
        clock.classList.add(designName); // Add the selected design class
        localStorage.setItem('clockDesign', designName);
        clockDesignSelect.value = designName;
    
        // Toggle visibility of hands and face
        hourHand.style.display = designName === 'analog-hands' ? 'block' : 'none';
        minuteHand.style.display = designName === 'analog-hands' ? 'block' : 'none';
        secondHand.style.display = designName === 'analog-hands' ? 'block' : 'none';
        clockFace.style.display = designName === 'analog-hands' ? 'none' : 'block';
    
        // Handle minute-numbers design
        if (designName === 'minute-numbers') {
            clockFace.innerHTML = ''; // Clear existing content
            for (let i = 1; i <= 4; i++) {
                const minuteNumber = document.createElement('div');
                minuteNumber.className = 'minute-number';
                minuteNumber.textContent = (i * 15).toString();
                clockFace.appendChild(minuteNumber);
            }
        } else if (designName === 'digital-digits') {
            clockFace.innerHTML = ''; // Clear minute numbers
            updateClockHands(); // Ensure digital digits update immediately
        } else {
            clockFace.innerHTML = ''; // Clear for analog-hands
        }
    }


    // Function to check if notifications are disabled for today
    function checkNotificationsDisabled() {
        const notificationsDisabledUntil = localStorage.getItem('notificationsDisabledUntil');
        if (notificationsDisabledUntil) {
            const disableUntilDate = new Date(notificationsDisabledUntil);
            if (disableUntilDate > new Date()) {
                disableNotificationsCheckbox.checked = true;
                notificationEnabled = false;
                return true;
            } else {
                localStorage.removeItem('notificationsDisabledUntil');
                disableNotificationsCheckbox.checked = false;
                notificationEnabled = true;
                return false;
            }
        }
        disableNotificationsCheckbox.checked = false;
        notificationEnabled = true;
        return false;
    }


    // Update digital timer display
    function updateDigitalDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        digitalTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update clock hands - synced with timer
    function updateClockHands() {
        const totalSeconds = phase === 'work' ? workTime * 60 : breakTime * 60;
        const elapsedSeconds = totalSeconds - remainingTime;
        const secondAngle = (elapsedSeconds % 60) * 6;
        const minuteAngle = (Math.floor(elapsedSeconds / 60) % 60) * 6;
        const hourAngle = (Math.floor(elapsedSeconds / 3600) % 12) * 30;
        secondHand.style.transform = `rotate(${secondAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        hourHand.style.transform = `rotate(${hourAngle}deg)`;

        if (clockDesignSelect.value === 'digital-digits') {
            const minutesDisplay = Math.floor(remainingTime / 60).toString().padStart(2, '0');
            const secondsDisplay = (remainingTime % 60).toString().padStart(2, '0');
            clockFace.dataset.time = `${minutesDisplay}:${secondsDisplay}`;
        }
    }

    // Start or resume timer
    function startTimer() {
        if (status === 'idle' || status === 'paused') {
            status = 'running';
            startPauseBtn.textContent = 'Pause';
            timerInterval = setInterval(() => {
                if (remainingTime > 0) {
                    remainingTime--;
                    updateDigitalDisplay();
                    updateClockHands();
                } else {
                    clearInterval(timerInterval);
                    if (notificationEnabled) sound.play(); // Only play if enabled
                    messageDiv.textContent = phase === 'work' ? 'Time for a break!' : 'Back to work!';
                    messageDiv.style.display = 'block';
                    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
                    if (phase === 'work') {
                        phase = 'break';
                        remainingTime = breakTime * 60;
                        startBreakAnimation();
                    } else {
                        phase = 'work';
                        remainingTime = workTime * 60;
                        stopBreakAnimation();
                    }
                    startTimer();
                }
            }, 1000);
        }
    }

    // Pause timer
    function pauseTimer() {
        if (status === 'running') {
            status = 'paused';
            startPauseBtn.textContent = 'Resume';
            clearInterval(timerInterval);
        }
    }

    // Reset timer
    function resetTimer() {
        clearInterval(timerInterval);
        stopBreakAnimation();
        status = 'idle';
        phase = 'work';
        remainingTime = workTime * 60;
        updateDigitalDisplay();
        updateClockHands();
        startPauseBtn.textContent = 'Start';
    }

    // Toggle start/pause
    function toggleStartPause() {
        if (status === 'running') {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    // Settings modal controls
    function openSettings() {
        workTimeInput.value = workTime;
        breakTimeInput.value = breakTime;
        settingsModal.style.display = 'flex';
    }

    function closeSettings() {
        settingsModal.style.display = 'none';
    }

    function saveSettings() {
        const newWorkTime = parseInt(workTimeInput.value);
        const newBreakTime = parseInt(breakTimeInput.value);
        if (newWorkTime > 0 && newBreakTime > 0) {
            workTime = newWorkTime;
            breakTime = newBreakTime;
            applyTheme(themeSelect.value);
            applyClockDesign(clockDesignSelect.value);
            resetTimer();
            closeSettings();
        } else {
            alert('Please enter positive numbers.');
        }
    }

    // Info tooltip controls
    infoBtn.addEventListener('click', () => {
        infoTooltip.style.display = infoTooltip.style.display === 'block' ? 'none' : 'block';
    });

    // Instruction overlay controls
    function closeInstructions() {
        instructionOverlay.style.display = 'none';
        localStorage.setItem('instructionsDisabled', 'true');
    }

    instructionCloseBtn.addEventListener('click', closeInstructions);

    if (!instructionsDisabled) {
        instructionOverlay.style.display = 'flex';
    }


    // Notification checkbox control
    disableNotificationsCheckbox.addEventListener('change', function () {
        if (this.checked) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            localStorage.setItem('notificationsDisabledUntil', tomorrow.toISOString());
            notificationEnabled = false;
        } else {
            localStorage.removeItem('notificationsDisabledUntil');
            notificationEnabled = true;
        }
    });


    // Cosmic particle animation (same as before, can be refined further)
    function initParticles() {
        const ctx = breakCanvas.getContext('2d');
        breakCanvas.width = window.innerWidth;
        breakCanvas.height = window.innerHeight;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * breakCanvas.width,
                y: Math.random() * breakCanvas.height,
                radius: Math.random() * 2 + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function updateParticles() {
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = breakCanvas.width;
            if (p.x > breakCanvas.width) p.x = 0;
            if (p.y < 0) p.y = breakCanvas.height;
            if (p.y > breakCanvas.height) p.y = 0;
            p.phase += 0.05;
            p.color = `rgba(255, 255, 255, ${0.5 + 0.5 * Math.sin(p.phase)})`; // Twinkling effect
        });
    }

    function drawParticles() {
        const ctx = breakCanvas.getContext('2d');
        ctx.clearRect(0, 0, breakCanvas.width, breakCanvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Dim background
        ctx.fillRect(0, 0, breakCanvas.width, breakCanvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    }

    function animate() {
        updateParticles();
        drawParticles();
        animationFrame = requestAnimationFrame(animate);
    }

    function startBreakAnimation() {
        breakCanvas.style.display = 'block';
        if (!animationFrame) animate();
    }

    function stopBreakAnimation() {
        breakCanvas.style.display = 'none';
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    // Event listeners
    startPauseBtn.addEventListener('click', toggleStartPause);
    resetBtn.addEventListener('click', resetTimer);
    settingsBtn.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    document.querySelector('#settings-modal .close').addEventListener('click', closeSettings);

    // Close settings modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
    });

    // Close instruction modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === instructionOverlay) closeInstructions();
    });


    // Handle window resize
    window.addEventListener('resize', () => {
        breakCanvas.width = window.innerWidth;
        breakCanvas.height = window.innerHeight;
    });

    // Initialization
    updateDigitalDisplay();
    updateClockHands();
    initParticles();
    applyTheme(currentTheme);
    applyClockDesign(currentClockDesign);
    checkNotificationsDisabled(); // Check and apply notification disable status on load
    disableNotificationsCheckbox.checked = !notificationEnabled; // Set checkbox based on notification status

});