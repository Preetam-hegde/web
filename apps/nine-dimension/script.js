document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfieldCanvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Controls
    const starCountSlider = document.getElementById('star-count-slider');
    const starCountValue = document.getElementById('star-count-value');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const paletteSelect = document.getElementById('palette-select');
    const twinkleSlider = document.getElementById('twinkle-slider');
    const twinkleValue = document.getElementById('twinkle-value');
    const planetCountSlider = document.getElementById('planet-count-slider');
    const planetCountValue = document.getElementById('planet-count-value');
    const orbitSpeedSlider = document.getElementById('orbit-speed-slider');
    const orbitSpeedValue = document.getElementById('orbit-speed-value');
    const planetSizeSlider = document.getElementById('planet-size-slider');
    const planetSizeValue = document.getElementById('planet-size-value');
    const shootingStarsToggle = document.getElementById('shooting-stars-toggle');
    const nebulaDensitySlider = document.getElementById('nebula-density-slider');
    const nebulaDensityValue = document.getElementById('nebula-density-value');

    let numStars = parseInt(starCountSlider.value);
    let speed = parseFloat(speedSlider.value);
    let twinkleIntensity = parseFloat(twinkleSlider.value);
    let numPlanets = parseInt(planetCountSlider.value);
    let orbitSpeed = parseFloat(orbitSpeedSlider.value);
    let planetSize = parseFloat(planetSizeSlider.value);
    let shootingStarsEnabled = shootingStarsToggle.checked;
    let nebulaDensity = parseFloat(nebulaDensitySlider.value);
    let currentPalette = 'deep-space';

    // Color Palettes
    const palettes = {
        'deep-space': ['#0a0a1f', '#1a1a3f', '#2a2a5f', '#3a3a7f', '#4a4a9f', '#5a5abf', '#6a6adf', '#7a7aff', '#8a8aff'],
        'aurora': ['#001122', '#003344', '#005566', '#007788', '#0099aa', '#00aabb', '#00bbcc', '#00ccdd', '#00ddee'],
        'milky-way': ['#111111', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#eeeeee', '#ffffff'],
        'nebula': ['#1a001a', '#3a003a', '#5a005a', '#7a007a', '#9a009a', '#aa00aa', '#bb00bb', '#cc00cc', '#dd00dd']
    };

    // Stars
    let stars = [];
    class Star {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speed = Math.random() * 0.5 + 0.1;
            this.layer = Math.random(); // 0-1 for parallax depth
            this.baseBrightness = Math.random() * 0.8 + 0.2;
            this.colorIndex = Math.floor(Math.random() * palettes[currentPalette].length);
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        update(mouseX, mouseY, time) {
            // Gentle drift
            this.x += this.speed * speed;
            this.y += this.speed * 0.5 * speed;
            if (this.x > canvas.width) this.x = 0;
            if (this.y > canvas.height) this.y = 0;

            // Parallax mouse response
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = (mouseX - centerX) / canvas.width;
            const dy = (mouseY - centerY) / canvas.height;
            this.x -= dx * this.layer * 50 * speed;
            this.y -= dy * this.layer * 50 * speed;

            // Twinkle
            this.brightness = this.baseBrightness + Math.sin(time * 0.01 + this.twinklePhase) * twinkleIntensity * 0.3;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.brightness;
            ctx.fillStyle = palettes[currentPalette][this.colorIndex];
            ctx.shadowColor = palettes[currentPalette][this.colorIndex];
            ctx.shadowBlur = this.size * 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Planets
    let planets = [];
    class Planet {
        constructor() {
            this.angle = Math.random() * Math.PI * 2;
            this.orbitRadius = 100 + Math.random() * 200;
            this.colorIndex = Math.floor(Math.random() * palettes[currentPalette].length);
            this.phase = Math.random() * Math.PI * 2;
        }
        update(mouseX, mouseY, time) {
            this.angle += orbitSpeed * 0.02;
            this.x = mouseX + Math.cos(this.angle) * this.orbitRadius;
            this.y = mouseY + Math.sin(this.angle) * this.orbitRadius;
            this.brightness = 0.8 + Math.sin(time * 0.005 + this.phase) * 0.2;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.brightness;
            ctx.fillStyle = palettes[currentPalette][this.colorIndex];
            ctx.shadowColor = palettes[currentPalette][this.colorIndex];
            ctx.shadowBlur = planetSize * 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, planetSize * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Shooting Stars
    let shootingStars = [];
    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = -50;
            this.y = Math.random() * canvas.height;
            this.speed = 5 + Math.random() * 5;
            this.length = 50 + Math.random() * 50;
            this.life = 1.0;
        }
        update() {
            this.x += this.speed;
            this.life -= 0.02;
            if (this.x > canvas.width + 50 || this.life <= 0) {
                this.reset();
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.length, this.y - 5);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Init stars and planets
    function initStars() {
        stars = [];
        numStars = parseInt(starCountSlider.value);
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
    }
    function initPlanets() {
        planets = [];
        numPlanets = parseInt(planetCountSlider.value);
        for (let i = 0; i < numPlanets; i++) {
            planets.push(new Planet());
        }
    }
    function initShootingStars() {
        shootingStars = [];
        for (let i = 0; i < 3; i++) {
            shootingStars.push(new ShootingStar());
        }
    }

    // Mouse tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // Control listeners
    starCountSlider.addEventListener('input', () => {
        starCountValue.textContent = starCountSlider.value;
        initStars();
    });
    speedSlider.addEventListener('input', () => {
        speed = parseFloat(speedSlider.value);
        speedValue.textContent = speedSlider.value + 'x';
    });
    paletteSelect.addEventListener('change', () => {
        currentPalette = paletteSelect.value;
        initStars();
        initPlanets();
    });
    twinkleSlider.addEventListener('input', () => {
        twinkleIntensity = parseFloat(twinkleSlider.value);
        twinkleValue.textContent = twinkleSlider.value;
    });
    planetCountSlider.addEventListener('input', () => {
        planetCountValue.textContent = planetCountSlider.value;
        initPlanets();
    });
    orbitSpeedSlider.addEventListener('input', () => {
        orbitSpeed = parseFloat(orbitSpeedSlider.value);
        orbitSpeedValue.textContent = orbitSpeedSlider.value + 'x';
    });
    planetSizeSlider.addEventListener('input', () => {
        planetSize = parseFloat(planetSizeSlider.value);
        planetSizeValue.textContent = planetSizeSlider.value;
    });
    shootingStarsToggle.addEventListener('change', () => {
        shootingStarsEnabled = shootingStarsToggle.checked;
    });
    nebulaDensitySlider.addEventListener('input', () => {
        nebulaDensity = parseFloat(nebulaDensitySlider.value);
        nebulaDensityValue.textContent = nebulaDensitySlider.value;
    });

    let time = 0;
    let lastShootingStarSpawn = 0;
    function animate() {
        // Fade trail with nebula density affecting fade rate
        ctx.fillStyle = `rgba(0, 0, 20, ${0.08 + nebulaDensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw stars
        stars.forEach(star => {
            star.update(mouseX, mouseY, time);
            star.draw();
        });

        // Update and draw planets
        planets.forEach(planet => {
            planet.update(mouseX, mouseY, time);
            planet.draw();
        });

        // Shooting stars
        if (shootingStarsEnabled) {
            shootingStars.forEach(star => {
                star.update();
                star.draw();
            });
            // Spawn new occasionally
            if (time - lastShootingStarSpawn > 300 && Math.random() < 0.01) {
                lastShootingStarSpawn = time;
                shootingStars.push(new ShootingStar());
            }
        }

        time++;
        requestAnimationFrame(animate);
    }

    initStars();
    initPlanets();
    initShootingStars();
    animate();
});