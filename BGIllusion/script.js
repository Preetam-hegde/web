document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('physicsCanvas');
    const ctx = canvas.getContext('2d');
    const effectSelect = document.getElementById('effect-select');

    // --- NEW UI ELEMENTS ---
    const speedSlider = document.getElementById('speed-slider');
    const speedValueDisplay = document.getElementById('speed-value');
    const particleCountSlider = document.getElementById('particle-count-slider');
    const particleCountValueDisplay = document.getElementById('particle-count-value');
    const colorPaletteSelect = document.getElementById('color-palette-select');
    const maxSpeedSlider = document.getElementById('max-speed-slider');
    const maxSpeedValueDisplay = document.getElementById('max-speed-value');


    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let particleCount = parseInt(particleCountSlider.value); // Initialize from slider value
    const baseRadius = 10;

    let animationTime = 0;
    let animationSpeed = parseFloat(speedSlider.value); // Initialize animation speed
    let maxSpeedLimit = parseFloat(maxSpeedSlider.value); // Initialize max speed limit

    let currentPalette = 'rainbow'; // Default color palette

    // --- Color Palettes ---
    const colorPalettes = {
        rainbow: function(hue) { return `hsl(${hue}, 100%, 50%)`; },
        fire: function() {
            const hue = Math.random() * 60; // Reds to Yellows
            const saturation = '100%';
            const lightness = Math.random() * 50 + 30 + '%'; // Brightness range
            return `hsl(${hue}, ${saturation}, ${lightness})`;
        },
        ice: function() {
            const hue = Math.random() * 60 + 180; // Cyans to Blues
            const saturation = '100%';
            const lightness = Math.random() * 50 + 30 + '%';
            return `hsl(${hue}, ${saturation}, ${lightness})`;
        },
        neon: function() {
            const colors = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00']; // Magenta, Cyan, Yellow, Green
            return colors[Math.floor(Math.random() * colors.length)];
        },
        custom: function() { // Placeholder for future custom palette
            return '#ffffff'; // Default white for now
        }
    };


    // --- Particle Class ---
    class Particle {
        constructor(x, y, radius, vx, vy, effectType) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.vx = vx;
            this.vy = vy;
            this.effectType = effectType;
            this.life = 100;
            this.splitFactor = 2;
            this.hueOffset = Math.random() * 360;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            // Dynamic Color based on selected palette
            let color;
            if (currentPalette === 'rainbow') {
                const hue = (animationTime * 0.2 * animationSpeed + this.hueOffset) % 360; // Apply speed control to color cycling
                color = colorPalettes.rainbow(hue);
            } else {
                color = colorPalettes[currentPalette](); // Call palette function
            }
            ctx.fillStyle = color;

            ctx.fill();
            ctx.closePath();
        }

        update() {
            this.x += this.vx * animationSpeed; // Apply speed control to particle movement
            this.y += this.vy * animationSpeed;

            // Subtle Warping Effect
            this.x += Math.sin(animationTime * 0.02 * animationSpeed + this.y * 0.01) * 0.5 * animationSpeed; // Apply speed to warp too
            this.y += Math.cos(animationTime * 0.03 * animationSpeed + this.x * 0.01) * 0.5 * animationSpeed;


            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.vx = -this.vx;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.vy = -this.vy;
            }

            // --- Max Speed Limit ---
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > maxSpeedLimit) {
                const speedRatio = maxSpeedLimit / currentSpeed;
                this.vx *= speedRatio;
                this.vy *= speedRatio;
            }


            switch (this.effectType) {
                case 'cell-multiply':
                    this.updateCellMultiply();
                    break;
                case 'split-on-hit':
                    this.updateSplitOnHit();
                    break;
                case 'gravity-attract': // NEW EFFECT LOGIC
                    this.updateGravityAttract();
                    break;
            }
        }


        updateCellMultiply() {
            this.life--;
            if (this.life <= 0 && this.radius > 3) {
                this.multiply();
                this.life = 100;
                this.radius *= 0.7;
            }
        }

        multiply() {
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2 + 1;
                particles.push(new Particle(
                    this.x,
                    this.y,
                    this.radius * 0.6,
                    this.vx + Math.cos(angle) * speed,
                    this.vy + Math.sin(angle) * speed,
                    'cell-multiply'
                ));
            }
        }


        updateSplitOnHit() {
            if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0 || this.y + this.radius >= canvas.height || this.y - this.radius <= 0) {
                this.split();
                particles.splice(particles.indexOf(this), 1);
            }
        }

        split() {
            for (let i = 0; i < this.splitFactor; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 2;
                particles.push(new Particle(
                    this.x,
                    this.y,
                    this.radius * 0.5,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    'bouncy-balls'
                ));
            }
        }

        updateGravityAttract() {
            // Simple gravity towards center effect
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const force = 0.01; // Gravity strength
                this.vx += (dx / distance) * force * animationSpeed; // Apply speed control
                this.vy += (dy / distance) * force * animationSpeed;
            }
        }
    }


    function initParticles(effectType) {
        particles = [];
        particleCount = parseInt(particleCountSlider.value); // Update particle count from slider
        for (let i = 0; i < particleCount; i++) {
            const radius = baseRadius * (Math.random() * 0.5 + 0.7);
            const x = Math.random() * (canvas.width - radius * 2) + radius;
            const y = Math.random() * (canvas.height - radius * 2) + radius;
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            particles.push(new Particle(x, y, radius, vx, vy, effectType));
        }
    }


    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        animationTime++;

        requestAnimationFrame(animate);
    }


    function setEffect(effectName) {
        initParticles(effectName);
    }

    effectSelect.addEventListener('change', (e) => {
        setEffect(e.target.value);
    });

    // --- Control Event Listeners ---
    speedSlider.addEventListener('input', () => {
        animationSpeed = parseFloat(speedSlider.value);
        speedValueDisplay.textContent = speedSlider.value + 'x';
    });

    particleCountSlider.addEventListener('input', () => {
        particleCount = parseInt(particleCountSlider.value);
        particleCountValueDisplay.textContent = particleCountSlider.value;
        initParticles(effectSelect.value); // Re-init particles when count changes
    });

    colorPaletteSelect.addEventListener('change', () => {
        currentPalette = colorPaletteSelect.value;
    });

    maxSpeedSlider.addEventListener('input', () => {
        maxSpeedLimit = parseFloat(maxSpeedSlider.value);
        maxSpeedValueDisplay.textContent = maxSpeedSlider.value;
    });


    setEffect(effectSelect.value);
    animate();


    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(effectSelect.value);
    });

});