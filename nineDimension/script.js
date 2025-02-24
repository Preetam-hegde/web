document.addEventListener('DOMContentLoaded', () => {
    const gridItems = document.querySelectorAll('.grid-item');
    const colors = [
        'var(--color-a)', 'var(--color-b)', 'var(--color-c)',
        'var(--color-d)', 'var(--color-e)', 'var(--color-f)',
        'var(--color-g)', 'var(--color-h)', 'var(--color-i)'
    ];

    const animationFunctions = [
        animateSolarSystem,
        animateMovingTriangles,
        animateContinuousScroll,
        animateGridColorShuffle,
        animateSpinningShapes,
        animateCirclingLines,
        animateMovingWords,
        animateLineBreathing,
        animateBouncingBalls
    ];

    gridItems.forEach((item, index) => {
        const animationFunction = animationFunctions[index]; // Assign animation in order
        if (animationFunction) {
            animationFunction(item, colors); // Pass item and colors
        } else {
            console.warn(`No animation function for item index ${index}`); // Fallback warning
        }
    });


    // --- Helper Function for Random Confusing Colors ---
    function getRandomConfusingColor(colorPalette) {
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }


    // --- Animation Functions (New Specific Animations) ---

    function animateBouncingBalls(item, colors) {
        const numBalls = 50;
        const balls = [];
        for (let i = 0; i < numBalls; i++) {
            const ball = document.createElement('div');
            ball.className = 'bouncy-ball';
            item.appendChild(ball);
            balls.push(ball);

            const size = Math.random() * 15 + 10;
            const color = getRandomConfusingColor(colors);
            const startX = Math.random() * 80 + 10;
            const startY = Math.random() * 80 + 10;
            const speedX = (Math.random() - 0.5) * 3;
            const speedY = (Math.random() - 0.5) * 3;

            Object.assign(ball.style, {
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                left: `${startX}%`,
                top: `${startY}%`,
            });

            animateBall(ball, speedX, speedY, item);
        }

        function animateBall(ball, speedX, speedY, container) {
            let x = parseFloat(ball.style.left);
            let y = parseFloat(ball.style.top);

            function update() {
                x += speedX;
                y += speedY;

                // Bounce off walls (simplified container boundaries)
                if (x < 0 || x > 100 - (parseFloat(ball.style.width) / parseFloat(container.offsetWidth) * 100)) speedX = -speedX;
                if (y < 0 || y > 100 - (parseFloat(ball.style.height) / parseFloat(container.offsetHeight) * 100)) speedY = -speedY;


                ball.style.left = `${x}%`;
                ball.style.top = `${y}%`;
                requestAnimationFrame(update);
            }
            update();
        }
    }


    function animateMovingTriangles(item, colors) {
        const numTriangles = 100;
        for (let i = 0; i < numTriangles; i++) {
            const triangle = document.createElement('div');
            triangle.className = 'moving-triangle';
            item.appendChild(triangle);

            const size = Math.random() * 20 + 10;
            const color = getRandomConfusingColor(colors);
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const speed = Math.random() * 2 + 1;
            const direction = Math.random() * 360; // Random direction

            Object.assign(triangle.style, {
                borderLeftWidth: `${size / 2}px`,
                borderRightWidth: `${size / 2}px`,
                borderBottomWidth: `${size}px`,
                borderBottomColor: color,
                left: `${startX}%`,
                top: `${startY}%`,
                transform: `rotate(${direction}deg)` // Initial random rotation
            });

            animateTriangle(triangle, speed, direction, item);
        }

        function animateTriangle(triangle, speed, direction, container) {
            let angle = 0;

            function update() {
                angle += speed;
                triangle.style.transform = `rotate(${direction + angle}deg)`;
                requestAnimationFrame(update);
            }
            update();
        }
    }


    function animateGridColorShuffle(item, colors) {
        const gridSize = 3; // 3x3 grid
        const cells = [];

        // 1. Create Grid Structure
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-color-container'; // For grid layout styling
        item.appendChild(gridContainer);

        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-color-cell'; // For cell styling
            gridContainer.appendChild(cell);
            cells.push(cell);
        }

        // 2 & 3. Independent Color Change using setInterval
        setInterval(() => {
            cells.forEach(cell => {
                cell.style.backgroundColor = getRandomConfusingColor(colors);
            });
        }, 55); // Fast color change interval
    }


    function animateContinuousScroll(item, colors, options = {}) {
        /**
         * Animates a continuous downward scroll of text with changing horizontal position.
         *
         * @param {HTMLElement} item - The HTML element to append the scrolling animation to.
         * @param {string[]} colors - An array of color strings for the text color.
         * @param {object} [options] - Optional parameters to customize the animation.
         * @param {number} [options.scrollSpeed=0.75] - The speed of the vertical scroll.
         * @param {number} [options.horizontalRange=20] - The maximum horizontal shift in pixels (positive value).
         * @param {number} [options.horizontalChangeFrequency=60] - Frequency (frames) of horizontal position change.
         *                                                    Lower value means more frequent changes.
         */
    
        // --- 1. Container Setup ---
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'scroll-container';
        item.appendChild(scrollContainer);
    
        const content = document.createElement('div');
        content.className = 'scroll-content';
        scrollContainer.appendChild(content);
    
        // --- 2. Text Content Generation ---
        const words = ['TECH', 'CHAOS', 'DIVERSE', 'UNIQUE', 'ENTROPY', 'ERROR', 'NOISE', 'WILD', 'SCATTER', 'DATA', 'FLOW', 'CODE', 'GLITCH'];
        let scrollText = 'LOVEE IS LIFE ME LEND ';
        for (let i = 0; i < 10; i++) { // Create longer scrolling content
            scrollText += words[Math.floor(Math.random() * words.length)] + "  ";
        }
        content.textContent = scrollText;
    
        // --- 3. Styling ---
        Object.assign(content.style, {
            color: getRandomConfusingColor(colors)
        });
    
        // --- 4. Animation Setup ---
        let scrollY = 10;
        let scrollX = 0; // Initialize horizontal scroll position
        const scrollSpeed = options.scrollSpeed === undefined ? 55 : options.scrollSpeed;
        const horizontalRange = options.horizontalRange === undefined ? 20 : options.horizontalRange; // Default horizontal range
        const horizontalChangeFrequency = options.horizontalChangeFrequency === undefined ? 60 : options.horizontalChangeFrequency; // Default change frequency
        let frameCount = 0; // Frame counter for horizontal position change frequency
    
        // --- 5. Animation Loop ---
        function updateScroll() {
            scrollY += scrollSpeed;
            frameCount++; // Increment frame counter
    
            // --- Horizontal Position Change Logic ---
            if (frameCount % horizontalChangeFrequency === 0) {
                // Change horizontal position every horizontalChangeFrequency frames
                scrollX = (Math.random() * horizontalRange * 2) - horizontalRange; // Random value within -horizontalRange to +horizontalRange
            }
    
            // Apply both vertical and horizontal translation
            scrollContainer.style.transform = `translateY(${scrollY}px) translateX(${scrollX}px)`;
    
            // Reset condition for downward scroll
            if (scrollY > scrollContainer.offsetHeight) {
                scrollY = -content.offsetHeight;
            }
    
            requestAnimationFrame(updateScroll);
        }
        updateScroll();
    }
    
    
    function animateSpinningShapes(item, colors) {
        const numShapes = 16; // Increased number of shapes for better coverage
        const shapes = [];
        const shapeTypes = ['circle', 'square', 'rect'];

        const containerRect = item.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const corners = [ // Define corner starting points
            { x: 0, y: 0 },             // Top-left
            { x: containerRect.width, y: 0 },      // Top-right
            { x: 0, y: containerRect.height },     // Bottom-left
            { x: containerRect.width, y: containerRect.height } // Bottom-right
        ];

        for (let i = 0; i < numShapes; i++) {
            const shape = document.createElement('div');
            shape.className = 'spinning-shape-center'; // New class for center animation
            item.appendChild(shape);
            shapes.push(shape);

            const size = 50 + Math.random() * 50; // Varying sizes
            const color = getRandomConfusingColor(colors);
            const shapeType = shapeTypes[i % shapeTypes.length];
            const spinSpeed = 0.3 + Math.random() * 0.5; // Varying spin speeds
            const moveSpeed = 0.01 + Math.random() * 0.02; // Slower move speed

            const startCorner = corners[i % corners.length]; // Cycle through corners
            const startX = startCorner.x;
            const startY = startCorner.y;

            Object.assign(shape.style, {
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: shapeType === 'circle' ? '50%' : '0',
                position: 'absolute', // Essential for positioning from corners
                top: `${startY}px`,
                left: `${startX}px`,
                marginLeft: `-${size/2}px`, // Center shape at start point
                marginTop: `-${size/2}px`   // Center shape at start point
            });


            animateToCenterSpin(shape, spinSpeed * (i % 2 === 0 ? 1 : -1), moveSpeed, centerX, centerY, startX, startY);
        }


        function animateToCenterSpin(shape, spinSpeed, moveSpeed, centerX, centerY, startX, startY) {
            let angle = 0;
            let currentX = startX;
            let currentY = startY;
            let towardsCenter = true; // Initial state: move towards center

            function update() {
                angle += spinSpeed;

                let targetX, targetY;
                if (towardsCenter) {
                    targetX = centerX;
                    targetY = centerY;
                } else {
                    targetX = startX;
                    targetY = startY;
                }

                // Move towards target (center or corner)
                const dx = targetX - currentX;
                const dy = targetY - currentY;
                currentX += dx * moveSpeed;
                currentY += dy * moveSpeed;


                shape.style.transform = `translate(${currentX - startX}px, ${currentY - startY}px) rotate(${angle}deg)`; // Translate relative to start, rotate

                // Distance check and state transition
                const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
                if (distanceToTarget < 1) { // Close enough to target
                    towardsCenter = !towardsCenter; // Reverse direction
                }

                requestAnimationFrame(update);
            }
            update();
        }
    }


    function animateCirclingLines(item, colors) {
        const numLines = 80;
        for (let i = 0; i < numLines; i++) {
            const line = document.createElement('div');
            line.className = 'circling-line';
            item.appendChild(line);

            const radius = Math.min(item.offsetWidth, item.offsetHeight) * 0.1; // Radius relative to item size
            const angleStep = (360 / numLines);
            const angle = i * angleStep;
            const color = getRandomConfusingColor(colors);
            const speed = 0.3 + Math.random() * 0.5;

            Object.assign(line.style, {
                backgroundColor: color,
                transformOrigin: '0% 50%', // Rotate around one end
                transform: `rotate(${angle}deg) translateX(${radius}px)` // Initial position on circle
            });

            animateLineCircle(line, speed);
        }


        function animateLineCircle(line, speed) {
            let angle = 0;
            function update() {
                angle += speed;
                line.style.transform = `rotate(${angle}deg) translateX(${parseFloat(line.style.transform.match(/translateX\((.*?)px\)/)[1])}px)`;
                line.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; // Color change with movement
                requestAnimationFrame(update);
            }
            update();
        }
    }


    function animateMovingWords(item, colors) {
        const words = ['TECH', 'CHAOS', 'DIVERSE', 'UNIQUE', 'ENTROPY', 'ERROR', 'NOISE', 'WILD', 'SCATTER', 'DATA', 'FLOW', 'CODE', 'GLITCH', 'RUN', 'SYSTEM', 'MATRIX', 'PULSE', 'VOID', 'ZONE'];
        const numWords = 125; // Lots of words
        for (let i = 0; i < numWords; i++) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'moving-word';
            item.appendChild(wordSpan);
            wordSpan.textContent = words[Math.floor(Math.random() * words.length)];

            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const speedX = (Math.random() - 0.5) * 4; // Faster speeds
            const speedY = (Math.random() - 0.5) * 4;
            const color = getRandomConfusingColor(colors);

            Object.assign(wordSpan.style, {
                left: `${startX}%`,
                top: `${startY}%`,
                color: color,
                fontSize: `${Math.random() * 1.2 + 0.8}em` // Varying sizes
            });

            animateWordMovement(wordSpan, speedX, speedY, item);
        }


        function animateWordMovement(wordSpan, speedX, speedY, container) {
            let x = parseFloat(wordSpan.style.left);
            let y = parseFloat(wordSpan.style.top);


            function update() {
                x += speedX;
                y += speedY;


                // Bounce off walls (simplified container boundaries)
                if (x < 0 || x > 100 - 10) speedX = -speedX; // 10% buffer for word width approx
                if (y < 0 || y > 100 - 5) speedY = -speedY; // 5% buffer for word height approx


                wordSpan.style.left = `${x}%`;
                wordSpan.style.top = `${y}%`;
                requestAnimationFrame(update);
            }
            update();
        }
    }


    function animateLineBreathing(item, colors) {
        const numHorizontalLines = 10;
        const numVerticalLines = 10;
        const lines = [];

        const containerRect = item.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        for (let i = 0; i < numHorizontalLines; i++) {
            const line = document.createElement('div');
            line.className = 'breathing-line horizontal-line';
            item.appendChild(line);
            lines.push(line);
            Object.assign(line.style, {
                top: `${(containerHeight / numHorizontalLines) * i}px`,
                backgroundColor: getRandomConfusingColor(colors),
            });
        }

        for (let i = 0; i < numVerticalLines; i++) {
            const line = document.createElement('div');
            line.className = 'breathing-line vertical-line';
            item.appendChild(line);
            lines.push(line);
            Object.assign(line.style, {
                left: `${(containerWidth / numVerticalLines) * i}px`,
                backgroundColor: getRandomConfusingColor(colors),
            });
        }

        function updateLines() {
            lines.forEach(line => {
                if (line.classList.contains('horizontal-line')) {
                    line.style.width = `${Math.random() * containerWidth}px`; // Vary width horizontally
                } else if (line.classList.contains('vertical-line')) {
                    line.style.height = `${Math.random() * containerHeight}px`; // Vary height vertically
                }
            });
            requestAnimationFrame(updateLines);
        }

        updateLines();
    }


    function animateSolarSystem(item, colors) {
        const sun = document.createElement('div');
        sun.className = 'sun';
        item.appendChild(sun);
        Object.assign(sun.style, {
            backgroundColor: getRandomConfusingColor(colors),
        });
    
        const planetsData = [
            { name: 'Planet1', size: 20, distance: 50, speed: 100, color: getRandomConfusingColor(colors), startAngle: Math.random() * 360 }, // Different sizes and speeds, startAngle
            { name: 'Planet2', size: 55, distance: 180, speed: 200, color: getRandomConfusingColor(colors), startAngle: Math.random() * 360 },
            { name: 'Planet3', size: 115, distance: 200, speed: 200, color: getRandomConfusingColor(colors), startAngle: Math.random() * 360 },
            { name: 'Planet4', size: 40, distance: 220, speed: 300, color: getRandomConfusingColor(colors), startAngle: Math.random() * 360 }, // Added more planets
            { name: 'Planet5', size: 65, distance: 280, speed: 100, color: getRandomConfusingColor(colors), startAngle: Math.random() * 360 },
        ];
    
        const planets = planetsData.map(planetData => {
            const planet = document.createElement('div');
            planet.className = 'planet';
            item.appendChild(planet);
    
            Object.assign(planet.style, {
                width: `${planetData.size}px`,
                height: `${planetData.size}px`,
                backgroundColor: planetData.color,
                top: '50%', // Center vertically in container
                left: '50%', // Center horizontally in container
                marginTop: `-${planetData.size / 2}px`, // Adjust for centering shape
                marginLeft: `-${planetData.size / 2}px`,
                position: 'absolute' // To position planets relative to container
            });
    
            return {
                planet: planet,
                distance: planetData.distance,
                speed: planetData.speed,
                angle: planetData.startAngle // Initialize angle from planetData
            };
        });
    
        function updatePlanets() {
            planets.forEach(planetObj => {
                planetObj.angle += planetObj.speed * 0.02; // Adjust overall speed, angle increment
                const radianAngle = planetObj.angle * Math.PI / 180; // Convert degrees to radians
                const x = Math.cos(radianAngle) * planetObj.distance; // Calculate x position using cosine
                const y = Math.sin(radianAngle) * planetObj.distance; // Calculate y position using sine
    
                planetObj.planet.style.transform = `translateX(${x}px) translateY(${y}px)`; // Translate planet from center
            });
            requestAnimationFrame(updatePlanets);
        }
    
        updatePlanets();
    }
    

});

document.addEventListener('DOMContentLoaded', function() {
    const paletteSelect = document.getElementById('palette-select');
    const gridContainer = document.querySelector('.grid-container');

    paletteSelect.addEventListener('change', function() {
        const selectedPalette = paletteSelect.value;

        // Remove any existing palette classes
        gridContainer.classList.remove('palette-calm', 'palette-vibrant', 'palette-grayscale');

        // Add the selected palette class (or do nothing if 'confusing' - default)
        if (selectedPalette !== 'palette-confusing') {
            gridContainer.classList.add(selectedPalette);
        } else {
            // Revert to default confusing palette - no class needed, variables in :root are used
        }
    });
});