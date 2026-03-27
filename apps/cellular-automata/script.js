document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('automataCanvas');
    const ctx = canvas.getContext('2d');
    const playPauseButton = document.getElementById('playPauseButton');
    const stepButton = document.getElementById('stepButton');
    const clearButton = document.getElementById('clearButton');
    const randomFillSlider = document.getElementById('randomFillSlider');
    const randomFillButton = document.getElementById('randomFillButton');
    const speedSlider = document.getElementById('speedSlider');
    const paletteSelect = document.getElementById('paletteSelect');
    const sizeSelect = document.getElementById('sizeSelect');
    const wrapCheckbox = document.getElementById('wrapCheckbox');
    const sandboxTab = document.getElementById('sandboxTab');
    const challengesTab = document.getElementById('challengesTab');
    const sandboxControls = document.getElementById('sandboxControls');
    const challengesControls = document.getElementById('challengesControls');
    const challengeSelect = document.getElementById('challengeSelect');
    const loadChallengeButton = document.getElementById('loadChallengeButton');
    const challengeInfo = document.getElementById('challengeInfo');
    const challengeTitle = document.getElementById('challengeTitle');
    const challengeDescription = document.getElementById('challengeDescription');
    const bestScore = document.getElementById('bestScore');
    const attemptsCount = document.getElementById('attemptsCount');
    const generationCount = document.getElementById('generationCount');
    const liveCellsCount = document.getElementById('liveCellsCount');
    const goalDisplay = document.getElementById('goalDisplay');
    const goalText = document.getElementById('goalText');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreValue = document.getElementById('scoreValue');

    // Game State
    let grid = [];
    let gridWidth = 70;
    let gridHeight = 50;
    const cellSize = 10;
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    let isRunning = false;
    let generation = 0;
    let animationId;
    let simulationSpeed = 5;
    let colorPalette = 'default';
    let wrapEdges = true;
    let currentMode = 'sandbox';
    let selectedPattern = null;
    let isDrawing = false;
    let lastDrawCell = null;

    // Challenge State
    let currentChallenge = null;
    let challengeAttempts = 0;
    let challengeBestScore = 0;
    let challengeStartGen = 0;
    let challengeStartAlive = 0;

    // Color Palettes
    const colorPalettes = {
        default: { alive: '#ffffff', dead: '#000000' },
        neon: { alive: '#00ff88', dead: '#0a192f' },
        grayscale: { alive: '#cccccc', dead: '#333333' },
        viridis: { alive: '#fde725', dead: '#440154' },
        fire: { alive: '#ff6b35', dead: '#1a1a1a' },
        ocean: { alive: '#00d4ff', dead: '#0f0f23' }
    };

    // Pattern Library
    const patterns = {
        glider: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ],
        blinker: [
            [1, 1, 1]
        ],
        beacon: [
            [1, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 1]
        ],
        pulsar: [
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
        ],
        spaceship: [
            [0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 0]
        ],
        gosper: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    };

    // Challenges
    const challenges = {
        glider: {
            title: 'Glider Race',
            description: 'Create a glider that travels across the grid. Goal: Reach generation 50 with a glider pattern intact.',
            setup: () => clearGrid(),
            checkWin: (gen, alive) => gen >= 50 && hasPattern('glider'),
            score: (gen) => Math.max(0, 1000 - gen * 10),
            maxGen: 100
        },
        oscillator: {
            title: 'Oscillator Mastery',
            description: 'Create a stable oscillator that repeats every 2-3 generations. Goal: Maintain the same pattern for 20 generations.',
            setup: () => clearGrid(),
            checkWin: (gen, alive) => gen >= 20 && isOscillating(),
            score: (gen) => gen * 50,
            maxGen: 50
        },
        spaceship: {
            title: 'Spaceship Builder',
            description: 'Build a lightweight spaceship that moves across the grid. Goal: Spaceship reaches the right edge.',
            setup: () => clearGrid(),
            checkWin: (gen, alive) => hasSpaceshipAtEdge(),
            score: (gen) => Math.max(0, 500 - gen * 5),
            maxGen: 100
        },
        population: {
            title: 'Population Boom',
            description: 'Create a pattern that grows to 100+ live cells. Goal: Reach 150 live cells.',
            setup: () => clearGrid(),
            checkWin: (gen, alive) => alive >= 150,
            score: (gen, alive) => alive * 10 + (100 - gen),
            maxGen: 100
        }
    };

    // Utility Functions
    function createGrid(width, height) {
        const arr = new Array(height);
        for (let i = 0; i < height; i++) {
            arr[i] = new Array(width).fill(0);
        }
        return arr;
    }

    function clearGrid() {
        grid = createGrid(gridWidth, gridHeight);
        generation = 0;
        updateHUD();
        drawGrid();
    }

    function randomFill(percentage) {
        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                grid[i][j] = Math.random() < percentage / 100 ? 1 : 0;
            }
        }
        drawGrid();
    }

    function updateGrid() {
        const nextGrid = createGrid(gridWidth, gridHeight);

        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                const liveNeighbors = countLiveNeighbors(i, j);
                if (grid[i][j] === 1) {
                    nextGrid[i][j] = liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0;
                } else {
                    nextGrid[i][j] = liveNeighbors === 3 ? 1 : 0;
                }
            }
        }

        grid = nextGrid;
        generation++;

        if (currentChallenge) {
            checkChallengeProgress();
        }

        updateHUD();
    }

    function countLiveNeighbors(row, col) {
        let sum = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let neighborRow = row + i;
                let neighborCol = col + j;

                if (wrapEdges) {
                    neighborRow = (neighborRow + gridHeight) % gridHeight;
                    neighborCol = (neighborCol + gridWidth) % gridWidth;
                } else {
                    if (neighborRow < 0 || neighborRow >= gridHeight || neighborCol < 0 || neighborCol >= gridWidth) continue;
                }

                sum += grid[neighborRow][neighborCol];
            }
        }
        return sum;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const aliveColor = colorPalettes[colorPalette].alive;
        const deadColor = colorPalettes[colorPalette].dead;

        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                ctx.fillStyle = grid[i][j] === 1 ? aliveColor : deadColor;
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }

    function updateHUD() {
        generationCount.textContent = generation;
        const aliveCount = grid.flat().reduce((sum, cell) => sum + cell, 0);
        liveCellsCount.textContent = aliveCount;
    }

    function gameLoop() {
        if (!isRunning) return;
        updateGrid();
        drawGrid();

        const frameDelay = Math.max(1, 21 - simulationSpeed);
        setTimeout(() => {
            animationId = requestAnimationFrame(gameLoop);
        }, 1000 / 30 * frameDelay);
    }

    function startSimulation() {
        if (!isRunning) {
            isRunning = true;
            playPauseButton.textContent = 'Pause';
            gameLoop();
        }
    }

    function stopSimulation() {
        if (isRunning) {
            isRunning = false;
            playPauseButton.textContent = 'Play';
            cancelAnimationFrame(animationId);
        }
    }

    function toggleCell(x, y) {
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            grid[y][x] = grid[y][x] === 0 ? 1 : 0;
            drawGrid();
        }
    }

    function placePattern(pattern, startX, startY) {
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;

        for (let i = 0; i < patternHeight; i++) {
            for (let j = 0; j < patternWidth; j++) {
                const gridY = startY + i;
                const gridX = startX + j;
                if (gridY >= 0 && gridY < gridHeight && gridX >= 0 && gridX < gridWidth) {
                    grid[gridY][gridX] = pattern[i][j];
                }
            }
        }
        drawGrid();
    }

    function hasPattern(targetPattern) {
        const pattern = patterns[targetPattern];
        if (!pattern) return false;

        const pHeight = pattern.length;
        const pWidth = pattern[0].length;

        for (let i = 0; i <= gridHeight - pHeight; i++) {
            for (let j = 0; j <= gridWidth - pWidth; j++) {
                let match = true;
                for (let pi = 0; pi < pHeight && match; pi++) {
                    for (let pj = 0; pj < pWidth && match; pj++) {
                        if (grid[i + pi][j + pj] !== pattern[pi][pj]) {
                            match = false;
                        }
                    }
                }
                if (match) return true;
            }
        }
        return false;
    }

    function hasSpaceshipAtEdge() {
        for (let i = 0; i < gridHeight; i++) {
            if (grid[i][gridWidth - 1] === 1) return true;
        }
        return false;
    }

    function isOscillating() {
        // Simple check: population hasn't changed much in recent generations
        // In a real implementation, you'd track grid states
        return generation > 10; // Placeholder
    }

    function checkChallengeProgress() {
        if (!currentChallenge) return;

        const challenge = challenges[currentChallenge];
        const aliveCount = grid.flat().reduce((sum, cell) => sum + cell, 0);

        if (challenge.checkWin(generation - challengeStartGen, aliveCount)) {
            const score = challenge.score(generation - challengeStartGen, aliveCount);
            challengeBestScore = Math.max(challengeBestScore, score);
            bestScore.textContent = challengeBestScore;

            scoreValue.textContent = score;
            scoreDisplay.style.display = 'flex';

            setTimeout(() => {
                stopSimulation();
                alert(`Challenge Complete! Score: ${score}`);
            }, 100);
        }

        if (generation - challengeStartGen >= challenge.maxGen) {
            stopSimulation();
            alert('Challenge failed - time limit exceeded!');
        }
    }

    function loadChallenge(challengeKey) {
        currentChallenge = challengeKey;
        const challenge = challenges[challengeKey];

        challengeTitle.textContent = challenge.title;
        challengeDescription.textContent = challenge.description;
        challengeInfo.style.display = 'block';

        challengeAttempts++;
        attemptsCount.textContent = challengeAttempts;

        generation = 0;
        challengeStartGen = 0;
        updateHUD();

        challenge.setup();
        drawGrid();

        goalDisplay.style.display = 'flex';
        scoreDisplay.style.display = 'flex';
        goalText.textContent = challenge.description.split('Goal: ')[1] || 'Complete the objective!';
    }

    function switchMode(mode) {
        currentMode = mode;
        sandboxTab.classList.toggle('active', mode === 'sandbox');
        challengesTab.classList.toggle('active', mode === 'challenges');
        sandboxControls.style.display = mode === 'sandbox' ? 'flex' : 'none';
        challengesControls.style.display = mode === 'challenges' ? 'flex' : 'none';

        if (mode === 'challenges') {
            goalDisplay.style.display = 'flex';
            scoreDisplay.style.display = 'flex';
        } else {
            goalDisplay.style.display = 'none';
            scoreDisplay.style.display = 'none';
            currentChallenge = null;
        }
    }

    function handleCanvasClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);

        if (selectedPattern) {
            placePattern(patterns[selectedPattern], cellX, cellY);
            selectedPattern = null;
            document.querySelectorAll('.pattern-button').forEach(btn => btn.classList.remove('selected'));
        } else {
            toggleCell(cellX, cellY);
        }
    }

    function handleCanvasPointerDown(event) {
        isDrawing = true;
        handleCanvasClick(event);
    }

    function handleCanvasPointerMove(event) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);

        if (cellX !== lastDrawCell?.x || cellY !== lastDrawCell?.y) {
            toggleCell(cellX, cellY);
            lastDrawCell = { x: cellX, y: cellY };
        }
    }

    function handleCanvasPointerUp() {
        isDrawing = false;
        lastDrawCell = null;
    }

    // Event Listeners
    playPauseButton.addEventListener('click', () => {
        isRunning ? stopSimulation() : startSimulation();
    });

    stepButton.addEventListener('click', () => {
        if (!isRunning) {
            updateGrid();
            drawGrid();
        }
    });

    clearButton.addEventListener('click', () => {
        stopSimulation();
        clearGrid();
    });

    randomFillButton.addEventListener('click', () => {
        const percentage = parseInt(randomFillSlider.value);
        randomFill(percentage);
    });

    speedSlider.addEventListener('input', () => {
        simulationSpeed = parseInt(speedSlider.value);
    });

    paletteSelect.addEventListener('change', () => {
        colorPalette = paletteSelect.value;
        drawGrid();
    });

    sizeSelect.addEventListener('change', () => {
        const sizes = { small: [50, 35], medium: [70, 50], large: [100, 70] };
        [gridWidth, gridHeight] = sizes[sizeSelect.value];
        canvas.width = gridWidth * cellSize;
        canvas.height = gridHeight * cellSize;
        clearGrid();
    });

    wrapCheckbox.addEventListener('change', () => {
        wrapEdges = wrapCheckbox.checked;
    });

    sandboxTab.addEventListener('click', () => switchMode('sandbox'));
    challengesTab.addEventListener('click', () => switchMode('challenges'));

    challengeSelect.addEventListener('change', () => {
        const challengeKey = challengeSelect.value;
        if (challengeKey !== 'none') {
            loadChallengeButton.disabled = false;
        } else {
            loadChallengeButton.disabled = true;
        }
    });

    loadChallengeButton.addEventListener('click', () => {
        const challengeKey = challengeSelect.value;
        if (challengeKey !== 'none') {
            loadChallenge(challengeKey);
        }
    });

    document.querySelectorAll('.pattern-button').forEach(button => {
        button.addEventListener('click', () => {
            selectedPattern = button.dataset.pattern;
            document.querySelectorAll('.pattern-button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('pointerdown', handleCanvasPointerDown);
    canvas.addEventListener('pointermove', handleCanvasPointerMove);
    canvas.addEventListener('pointerup', handleCanvasPointerUp);
    canvas.addEventListener('pointerleave', handleCanvasPointerUp);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('pointerdown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('pointermove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('pointerup');
        canvas.dispatchEvent(mouseEvent);
    });

    // Initialize
    grid = createGrid(gridWidth, gridHeight);
    updateHUD();
    drawGrid();
});