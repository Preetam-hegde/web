document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('automataCanvas');
    const ctx = canvas.getContext('2d');
    const startStopButton = document.getElementById('startStopButton');
    const clearButton = document.getElementById('clearButton');
    const generationCountDisplay = document.getElementById('generationCount');
    const speedControl = document.getElementById('speedControl');
    const colorPaletteSelect = document.getElementById('colorPalette');

    const cellSize = 10;
    const gridWidth = 70; // Increased grid width for larger canvas
    const gridHeight = 50;
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    let grid = createGrid(gridWidth, gridHeight);
    let isRunning = false;
    let generation = 0;
    let animationFrameId;
    let simulationSpeed = 5; // Default speed
    let colorPalette = 'default'; // Default color palette

    // Color Palettes
    const colorPalettes = {
        default: ['black', 'white'], // Alive, Dead
        neon: ['#00ff88', '#0a192f'], // Neon Green, Dark blue
        grayscale: ['#ddd', '#222'],   // Light Gray, Dark Gray
        viridis: ['#440154', '#fde725'] // Viridis colormap inspired
    };

    function createGrid(width, height) {
        let arr = new Array(height);
        for (let i = 0; i < height; i++) {
            arr[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                arr[i][j] = Math.random() < 0.5 ? 0 : 1;
            }
        }
        return arr;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const aliveColor = colorPalettes[colorPalette][0];
        const deadColor = colorPalettes[colorPalette][1];

        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                const cellState = grid[i][j];
                ctx.fillStyle = cellState === 1 ? aliveColor : deadColor;

                // Animation: Scale in for birth, scale out for death (subtle)
                if (cellState === 1) {
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                } else {
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize); // Still draw to clear
                }
            }
        }
    }

    function updateGrid() {
        let nextGrid = createGrid(gridWidth, gridHeight);

        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                let liveNeighbors = countLiveNeighbors(i, j);
                if (grid[i][j] === 1) {
                    if (liveNeighbors < 2 || liveNeighbors > 3) {
                        nextGrid[i][j] = 0;
                    } else {
                        nextGrid[i][j] = 1;
                    }
                } else {
                    if (liveNeighbors === 3) {
                        nextGrid[i][j] = 1;
                    } else {
                        nextGrid[i][j] = 0;
                    }
                }
            }
        }
        grid = nextGrid;
        generation++;
        generationCountDisplay.textContent = `Generation: ${generation}`;
    }

    function countLiveNeighbors(row, col) {
        let sum = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let neighborRow = row + i;
                let neighborCol = col + j;

                if (neighborRow < 0) neighborRow = gridHeight - 1;
                if (neighborCol < 0) neighborCol = gridWidth - 1;
                if (neighborRow > gridHeight - 1) neighborRow = 0;
                if (neighborCol > gridWidth - 1) neighborCol = 0;

                sum += grid[neighborRow][neighborCol];
            }
        }
        return sum;
    }

    function gameLoop() {
        if (!isRunning) return;
        updateGrid();
        drawGrid();
        // Adjust animation speed using speedControl value
        const frameDelay = Math.max(1, 11 - simulationSpeed); // Speed 1 is fastest, 10 is slowest
        setTimeout(() => {
            animationFrameId = requestAnimationFrame(gameLoop);
        }, 1000 / 30 * frameDelay); // Target ~30 FPS at speed 5 (adjust as needed)
    }

    function startSimulation() {
        if (!isRunning) {
            isRunning = true;
            startStopButton.textContent = 'Stop';
            gameLoop();
        }
    }

    function stopSimulation() {
        if (isRunning) {
            isRunning = false;
            startStopButton.textContent = 'Start';
            cancelAnimationFrame(animationFrameId);
        }
    }

    startStopButton.addEventListener('click', () => {
        isRunning ? stopSimulation() : startSimulation();
    });

    clearButton.addEventListener('click', () => {
        stopSimulation();
        grid = createGrid(gridWidth, gridHeight);
        generation = 0;
        generationCountDisplay.textContent = `Generation: ${generation}`;
        drawGrid();
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const cellX = Math.floor(mouseX / cellSize);
        const cellY = Math.floor(mouseY / cellSize);

        if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
            grid[cellY][cellX] = grid[cellY][cellX] === 0 ? 1 : 0;
            drawGrid();
        }
    });

    speedControl.addEventListener('input', () => {
        simulationSpeed = parseInt(speedControl.value);
        if (isRunning) {
            stopSimulation(); // Stop and restart to apply new speed
            startSimulation();
        }
    });

    colorPaletteSelect.addEventListener('change', () => {
        colorPalette = colorPaletteSelect.value;
        drawGrid(); // Redraw with the new color palette
    });

    drawGrid(); // Initial draw
});