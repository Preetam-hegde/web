class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
    }

    setVolume(val) {
        if (this.masterGain) this.masterGain.gain.value = val;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    resume() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    playShoot() {
        if (!this.enabled) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, t);
        filter.frequency.linearRampToValueAtTime(500, t + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(t + 0.15);
    }

    playHit() {
        if (!this.enabled) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.05);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(t + 0.1);
    }

    playTick() {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(t + 0.05);
    }

    playCombo(count) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 400 + (Math.min(count, 20) * 50);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq + 100, t + 0.1);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(t + 0.2);
    }
}

class AimGame {
    constructor() {
        this.mode = null;
        this.isActive = false;
        this.isPaused = false;
        this.score = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.timeLeft = 60;
        this.combo = 0;
        this.maxCombo = 0;

        // Game Settings  
        this.fov = parseFloat(localStorage.getItem('aim_fov')) || 75;
        this.gameDuration = parseInt(localStorage.getItem('aim_duration')) || 60;
        this.targetSize = parseFloat(localStorage.getItem('aim_target_size')) || 1.0;
        this.difficulty = localStorage.getItem('aim_difficulty') || 'normal';

        // Mouse Settings
        this.sensitivity = parseFloat(localStorage.getItem('aim_sens')) || 1.0;
        this.sensProfile = localStorage.getItem('aim_profile') || 'standard';
        this.mouseAccel = localStorage.getItem('aim_mouse_accel') === 'true';

        // Crosshair Settings
        this.xhSize = parseInt(localStorage.getItem('aim_xh_size')) || 10;
        this.xhThick = parseInt(localStorage.getItem('aim_xh_thick')) || 2;
        this.xhGap = parseInt(localStorage.getItem('aim_xh_gap')) || 0;
        this.xhOutline = parseInt(localStorage.getItem('aim_xh_outline')) || 0;
        this.xhColor = localStorage.getItem('aim_xh_color') || '#00ffcc';
        this.xhOpacity = parseInt(localStorage.getItem('aim_xh_opacity')) || 100;
        this.xhShowDot = localStorage.getItem('aim_xh_dot') === 'true';

        // Audio Settings
        this.volume = parseFloat(localStorage.getItem('aim_vol')) || 0.3;
        this.soundEnabled = localStorage.getItem('aim_sound') !== 'false';

        this.targets = [];
        this.particles = [];
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2(0, 0);

        this.lastTime = 0;
        this.reactionTimes = [];

        this.sound = new SoundManager();
        this.sound.setVolume(this.volume);
        this.sound.setEnabled(this.soundEnabled);

        this.setupThree();
        this.setupInput();
        this.loadSettings();

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    setupThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        this.scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

        // Camera
        this.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.rotation.order = 'YXZ';

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        // Grid Floor
        const gridHelper = new THREE.GridHelper(100, 100, 0x1e293b, 0x0f172a);
        gridHelper.position.y = -5;
        this.scene.add(gridHelper);

        // Ceiling Grid
        const gridCeil = new THREE.GridHelper(100, 50, 0x1e293b, 0x0f172a);
        gridCeil.position.y = 20;
        this.scene.add(gridCeil);

        // Geometries
        this.sphereGeo = new THREE.SphereGeometry(1, 32, 32);
        this.sphereMat = new THREE.MeshStandardMaterial({
            color: 0x0ea5e9,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.6,
            roughness: 0.1,
            metalness: 0.8
        });
    }

    setupInput() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Game Settings
        this.bindSetting('fov', 'fov', (val) => {
            this.camera.fov = parseFloat(val);
            this.camera.updateProjectionMatrix();
            document.getElementById('fov-val').innerText = val + '°';
        });

        this.bindSetting('game-duration', 'gameDuration', (val) => {
            document.getElementById('duration-val').innerText = val + 's';
        }, true);

        this.bindSetting('target-size', 'targetSize', null, false);
        this.bindSetting('difficulty', 'difficulty', null, false);

        // Mouse Settings
        this.bindSetting('sensitivity', 'sensitivity', (val) => {
            document.getElementById('sens-val').innerText = parseFloat(val).toFixed(2);
        });

        this.bindSetting('sens-profile', 'sensProfile', null, false);

        this.bindCheckbox('mouse-accel', 'mouseAccel');

        // Crosshair Settings
        this.bindSetting('xh-size', 'xhSize', (val) => {
            document.getElementById('xh-size-val').innerText = val;
            this.updateCrosshair();
        }, true);

        this.bindSetting('xh-thick', 'xhThick', (val) => {
            document.getElementById('xh-thick-val').innerText = val;
            this.updateCrosshair();
        }, true);

        this.bindSetting('xh-gap', 'xhGap', (val) => {
            document.getElementById('xh-gap-val').innerText = val;
            this.updateCrosshair();
        }, true);

        this.bindSetting('xh-outline', 'xhOutline', (val) => {
            document.getElementById('xh-outline-val').innerText = val;
            this.updateCrosshair();
        }, true);

        this.bindSetting('xh-color', 'xhColor', () => {
            this.updateCrosshair();
        }, false);

        this.bindSetting('xh-opacity', 'xhOpacity', (val) => {
            document.getElementById('xh-opacity-val').innerText = val + '%';
            this.updateCrosshair();
        }, true);

        this.bindCheckbox('xh-show-dot', 'xhShowDot', () => {
            this.updateCrosshair();
        });

        // Audio Settings
        this.bindSetting('volume', 'volume', (val) => {
            this.sound.setVolume(parseFloat(val));
            document.getElementById('volume-val').innerText = Math.round(val * 100) + '%';
        });

        this.bindCheckbox('sound-enabled', 'soundEnabled', (val) => {
            this.sound.setEnabled(val);
        });

        // Mouse Look
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive || this.isPaused) return;

            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;

            let baseScale = 0.0004;
            if (this.mouseAccel) {
                const speed = Math.sqrt(movementX * movementX + movementY * movementY);
                baseScale *= (1 + speed * 0.001);
            }

            let profileMult = this.sensProfile === 'valorant' ? 3.18 : 1.0;
            const effectiveSens = this.sensitivity * profileMult * baseScale;

            this.camera.rotation.y -= movementX * effectiveSens;
            this.camera.rotation.x -= movementY * effectiveSens;
            this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
        });

        // Shooting
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, input, select')) return;

            if (!this.isActive) {
                if (!document.getElementById('menu-screen').classList.contains('hidden')) return;
                if (this.isPaused) this.resume();
                return;
            }

            if (document.pointerLockElement !== document.body) {
                this.requestLock();
                return;
            }

            if (this.mode === 'tracking') {
                this.isTracking = true;
            } else {
                this.shoot();
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.mode === 'tracking') this.isTracking = false;
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isActive) this.togglePause();
            if (e.code === 'KeyR' && (this.isActive || this.isPaused)) this.start(this.mode);
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement !== document.body && this.isActive) {
                this.isPaused = true;
                document.getElementById('pause-screen').classList.remove('hidden');
            } else if (document.pointerLockElement === document.body && this.isActive) {
                this.isPaused = false;
                document.getElementById('pause-screen').classList.add('hidden');
            }
        });
    }

    bindSetting(id, prop, callback, isInt = false) {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('input', (e) => {
            const val = isInt ? parseInt(e.target.value) : e.target.value;
            this[prop] = val;
            localStorage.setItem(`aim_${prop.replace(/([A-Z])/g, '_$1').toLowerCase()}`, val);
            if (callback) callback(val);
        });

        el.addEventListener('change', (e) => {
            const val = isInt ? parseInt(e.target.value) : e.target.value;
            this[prop] = val;
            localStorage.setItem(`aim_${prop.replace(/([A-Z])/g, '_$1').toLowerCase()}`, val);
            if (callback) callback(val);
        });
    }

    bindCheckbox(id, prop, callback) {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('change', (e) => {
            this[prop] = e.target.checked;
            localStorage.setItem(`aim_${prop.replace(/([A-Z])/g, '_$1').toLowerCase()}`, e.target.checked);
            if (callback) callback(e.target.checked);
        });
    }

    loadSettings() {
        // Game Settings
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('fov', this.fov);
        setVal('game-duration', this.gameDuration);
        setVal('target-size', this.targetSize);
        setVal('difficulty', this.difficulty);

        // Mouse Settings
        setVal('sensitivity', this.sensitivity);
        setVal('sens-profile', this.sensProfile);
        const mouseAccelEl = document.getElementById('mouse-accel');
        if (mouseAccelEl) mouseAccelEl.checked = this.mouseAccel;

        // Crosshair Settings
        setVal('xh-size', this.xhSize);
        setVal('xh-thick', this.xhThick);
        setVal('xh-gap', this.xhGap);
        setVal('xh-outline', this.xhOutline);
        setVal('xh-color', this.xhColor);
        setVal('xh-opacity', this.xhOpacity);
        const xhDotEl = document.getElementById('xh-show-dot');
        if (xhDotEl) xhDotEl.checked = this.xhShowDot;

        // Audio Settings
        setVal('volume', this.volume);
        const soundEl = document.getElementById('sound-enabled');
        if (soundEl) soundEl.checked = this.soundEnabled;

        // Update displays
        document.getElementById('fov-val').innerText = this.fov + '°';
        document.getElementById('duration-val').innerText = this.gameDuration + 's';
        document.getElementById('sens-val').innerText = this.sensitivity.toFixed(2);
        document.getElementById('xh-size-val').innerText = this.xhSize;
        document.getElementById('xh-thick-val').innerText = this.xhThick;
        document.getElementById('xh-gap-val').innerText = this.xhGap;
        document.getElementById('xh-outline-val').innerText = this.xhOutline;
        document.getElementById('xh-opacity-val').innerText = this.xhOpacity + '%';
        document.getElementById('volume-val').innerText = Math.round(this.volume * 100) + '%';

        this.updateCrosshair();
    }

    setCrosshairPreset(type) {
        const presets = {
            dot: { size: 0, thick: 4, gap: 0, outline: 1, showDot: true },
            cross: { size: 10, thick: 2, gap: 2, outline: 1, showDot: false },
            circle: { size: 20, thick: 2, gap: 18, outline: 0, showDot: true }
        };

        const preset = presets[type];
        if (!preset) return;

        this.xhSize = preset.size;
        this.xhThick = preset.thick;
        this.xhGap = preset.gap;
        this.xhOutline = preset.outline;
        this.xhShowDot = preset.showDot;

        document.getElementById('xh-size').value = preset.size;
        document.getElementById('xh-thick').value = preset.thick;
        document.getElementById('xh-gap').value = preset.gap;
        document.getElementById('xh-outline').value = preset.outline;
        document.getElementById('xh-show-dot').checked = preset.showDot;

        document.getElementById('xh-size-val').innerText = preset.size;
        document.getElementById('xh-thick-val').innerText = preset.thick;
        document.getElementById('xh-gap-val').innerText = preset.gap;
        document.getElementById('xh-outline-val').innerText = preset.outline;

        this.updateCrosshair();
    }

    updateCrosshair() {
        const root = document.documentElement;
        root.style.setProperty('--xh-size', this.xhSize + 'px');
        root.style.setProperty('--xh-thick', this.xhThick + 'px');
        root.style.setProperty('--xh-gap', this.xhGap + 'px');
        root.style.setProperty('--xh-outline', this.xhOutline + 'px');
        root.style.setProperty('--xh-color', this.xhColor);
        root.style.setProperty('--xh-opacity', this.xhOpacity / 100);

        const crosshairParts = document.querySelectorAll('.crosshair-part');
        crosshairParts.forEach(part => {
            if (this.xhOutline > 0) {
                part.classList.add('has-outline');
            } else {
                part.classList.remove('has-outline');
            }

            if (this.xhGap > 0 && (part.classList.contains('xh-h') || part.classList.contains('xh-v'))) {
                part.classList.add('has-gap');

                if (part.classList.contains('xh-h')) {
                    part.classList.add('gap-left');
                    if (!part.nextElementSibling || !part.nextElementSibling.classList.contains('xh-h')) {
                        const clone = part.cloneNode(true);
                        clone.classList.remove('gap-left');
                        clone.classList.add('gap-right');
                        part.parentNode.appendChild(clone);
                    }
                } else if (part.classList.contains('xh-v')) {
                    part.classList.add('gap-top');
                    if (!part.nextElementSibling || !part.nextElementSibling.classList.contains('xh-v')) {
                        const clone = part.cloneNode(true);
                        clone.classList.remove('gap-top');
                        clone.classList.add('gap-bottom');
                        part.parentNode.appendChild(clone);
                    }
                }
            } else {
                part.classList.remove('has-gap', 'gap-left', 'gap-right', 'gap-top', 'gap-bottom');
            }
        });

        const dotEl = document.querySelector('.xh-dot');
        if (dotEl) {
            if (this.xhShowDot) {
                dotEl.classList.add('show');
            } else {
                dotEl.classList.remove('show');
            }
        }
    }

    requestLock() {
        document.body.requestPointerLock();
    }

    togglePause() {
        if (this.isPaused) this.resume();
        else {
            this.isPaused = true;
            document.exitPointerLock();
            document.getElementById('pause-screen').classList.remove('hidden');
        }
    }

    resume() {
        if (!this.isActive) return;
        this.isPaused = false;
        document.getElementById('pause-screen').classList.add('hidden');
        this.requestLock();
    }

    getDifficultyMultiplier() {
        const multipliers = {
            easy: 0.6,
            normal: 1.0,
            hard: 1.5,
            extreme: 2.2
        };
        return multipliers[this.difficulty] || 1.0;
    }

    start(mode) {
        this.mode = mode;
        this.score = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.timeLeft = this.gameDuration;
        this.combo = 0;
        this.maxCombo = 0;
        this.reactionTimes = [];
        this.isTracking = false;
        this.isPaused = false;

        this.camera.rotation.set(0, 0, 0);

        // UI
        ['menu-screen', 'results-screen', 'pause-screen'].forEach(id =>
            document.getElementById(id).classList.add('hidden')
        );
        document.getElementById('hud-screen').classList.remove('hidden');

        // Cleanup
        this.targets.forEach(t => this.scene.remove(t.mesh));
        this.targets = [];
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];

        this.isActive = true;
        this.requestLock();
        this.updateHUD();

        // Init Mode
        if (mode === 'gridshot') {
            for (let i = 0; i < 3; i++) this.spawnTarget();
        } else if (mode === 'tracking') {
            this.spawnTarget();
        } else if (mode === 'reflex') {
            this.scheduleReflexSpawn();
        } else if (mode === 'microshot') {
            this.spawnTarget();
        }

        // Timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isActive || this.isPaused) return;
            this.timeLeft--;
            this.updateHUD();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    spawnTarget() {
        const mesh = new THREE.Mesh(this.sphereGeo, this.sphereMat.clone());

        let depth = -15;
        let spreadX = 25;
        let spreadY = 12;
        let scale = this.targetSize;

        if (this.mode === 'microshot') {
            spreadX = 8;
            spreadY = 5;
            scale = 0.5 * this.targetSize;
        }

        mesh.position.set(
            (Math.random() - 0.5) * spreadX,
            (Math.random() - 0.5) * spreadY + 4,
            depth
        );

        const diffMult = this.getDifficultyMultiplier();
        const tData = {
            mesh: mesh,
            vx: 0, vy: 0,
            spawnTime: performance.now(),
            isDead: false
        };

        if (this.mode === 'tracking') {
            const baseScale = 1.5 * this.targetSize;
            mesh.scale.set(baseScale, baseScale, baseScale);
            mesh.material.color.setHex(0xffaa00);
            mesh.material.emissive.setHex(0xffaa00);
            tData.vx = (Math.random() - 0.5) * 0.3 * diffMult;
            tData.vy = (Math.random() - 0.5) * 0.3 * diffMult;
        } else if (this.mode === 'reflex') {
            mesh.material.color.setHex(0xf43f5e);
            mesh.material.emissive.setHex(0xf43f5e);
        } else if (this.mode === 'microshot') {
            mesh.scale.set(scale, scale, scale);
            mesh.material.color.setHex(0x10b981);
            mesh.material.emissive.setHex(0x10b981);
        }

        this.scene.add(mesh);
        this.targets.push(tData);

        // Spawn Anim
        const targetScale = (this.mode === 'tracking') ? 1.5 * this.targetSize : scale;
        mesh.scale.set(0, 0, 0);
        this.animateSpawn(mesh, targetScale);
    }

    animateSpawn(mesh, targetScale) {
        let s = 0;
        const grow = () => {
            if (!this.isActive || !mesh.parent) return;
            s += 0.2;
            if (s >= targetScale) s = targetScale;
            mesh.scale.set(s, s, s);
            if (s < targetScale) requestAnimationFrame(grow);
        };
        grow();
    }

    scheduleReflexSpawn() {
        const baseDelay = 400 + Math.random() * 1000;
        const diffMult = this.getDifficultyMultiplier();
        const delay = baseDelay / diffMult;

        setTimeout(() => {
            if (this.isActive && !this.isPaused && this.targets.length === 0) this.spawnTarget();
            else if (this.isActive && this.targets.length === 0) this.scheduleReflexSpawn();
        }, delay);
    }

    shoot() {
        this.shotsFired++;
        this.sound.playShoot();

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.targets.map(t => t.mesh));

        if (intersects.length > 0) {
            this.handleHit(intersects[0].object);
        } else {
            this.combo = 0;
            this.updateHUD();
        }
    }

    handleHit(object) {
        this.sound.playHit();
        this.createHitMarker();
        this.spawnParticles(object.position);

        this.shotsHit++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.sound.playCombo(this.combo);

        this.score += 100 * (1 + Math.floor(this.combo / 10) * 0.1);

        const index = this.targets.findIndex(t => t.mesh === object);
        if (index > -1) {
            const tData = this.targets[index];
            if (this.mode === 'reflex') {
                this.reactionTimes.push(performance.now() - tData.spawnTime);
            }

            this.scene.remove(object);
            this.targets.splice(index, 1);

            if (this.mode === 'gridshot' || this.mode === 'microshot') {
                this.spawnTarget();
            } else if (this.mode === 'reflex') {
                this.scheduleReflexSpawn();
            }
        }
        this.updateHUD();
    }

    createHitMarker() {
        const m = document.createElement('div');
        m.className = 'hitmarker';
        document.getElementById('hit-layer').appendChild(m);
        setTimeout(() => m.remove(), 200);
    }

    spawnParticles(pos) {
        const count = 15;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
            velocities.push({
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5,
                z: (Math.random() - 0.5) * 0.5
            });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.2, transparent: true });
        const points = new THREE.Points(geo, mat);
        this.scene.add(points);
        this.particles.push({ mesh: points, vels: velocities, life: 1.0 });
    }

    update(delta) {
        if (!this.isActive || this.isPaused) return;

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta * 2;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }
            const positions = p.mesh.geometry.attributes.position.array;
            for (let j = 0; j < p.vels.length; j++) {
                positions[j * 3] += p.vels[j].x;
                positions[j * 3 + 1] += p.vels[j].y;
                positions[j * 3 + 2] += p.vels[j].z;
            }
            p.mesh.geometry.attributes.position.needsUpdate = true;
            p.mesh.material.opacity = p.life;
        }

        // Tracking
        if (this.mode === 'tracking' && this.targets.length > 0) {
            const t = this.targets[0];
            if (t.mesh.position.x > 15 || t.mesh.position.x < -15) t.vx *= -1;
            if (t.mesh.position.y > 10 || t.mesh.position.y < -2) t.vy *= -1;
            t.mesh.position.x += t.vx * delta * 60;
            t.mesh.position.y += t.vy * delta * 60;

            if (this.isTracking) {
                this.raycaster.setFromCamera(this.pointer, this.camera);
                const intersects = this.raycaster.intersectObject(t.mesh);
                if (intersects.length > 0) {
                    this.score += 1;
                    this.shotsHit++;
                    this.shotsFired++;
                    t.mesh.material.emissiveIntensity = 2;
                    if (this.score % 10 === 0) this.sound.playTick();
                } else {
                    t.mesh.material.emissiveIntensity = 0.5;
                    this.shotsFired++;
                }
                this.updateHUD();
            }
        }
    }

    loop(time) {
        requestAnimationFrame(this.loop);
        const delta = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    updateHUD() {
        document.getElementById('score').innerText = Math.floor(this.score);
        document.getElementById('timer').innerText = this.timeLeft;

        let acc = 0;
        if (this.shotsFired > 0) acc = Math.round((this.shotsHit / this.shotsFired) * 100);
        document.getElementById('accuracy').innerText = acc + "%";

        const comboEl = document.getElementById('combo');
        comboEl.innerText = `x${this.combo}`;
        if (this.combo > 5) {
            comboEl.classList.add('combo-active');
            comboEl.style.transform = `translateX(-50%) scale(${1 + this.combo * 0.05})`;
        } else {
            comboEl.classList.remove('combo-active');
            comboEl.style.transform = `translateX(-50%) scale(1)`;
        }
    }

    endGame() {
        this.isActive = false;
        document.exitPointerLock();
        clearInterval(this.timerInterval);

        document.getElementById('hud-screen').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');

        document.getElementById('res-score').innerText = Math.floor(this.score);

        let acc = 0;
        if (this.shotsFired > 0) acc = Math.round((this.shotsHit / this.shotsFired) * 100);
        document.getElementById('res-acc').innerText = acc + "%";
        document.getElementById('res-hits').innerText = this.shotsHit;
        document.getElementById('res-combo').innerText = this.maxCombo;

        if (this.mode === 'reflex' && this.reactionTimes.length > 0) {
            const avg = Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length);
            document.getElementById('res-time').innerText = avg + "ms";
        } else {
            document.getElementById('res-time').innerText = "N/A";
        }

        // Save session to history
        this.saveGameSession();
    }

    toMenu() {
        this.isActive = false;
        this.isPaused = false;
        document.exitPointerLock();
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('hud-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        this.targets.forEach(t => this.scene.remove(t.mesh));
        this.targets = [];
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];
    }

    // Menu Management
    openSettings() {
        document.getElementById('settings-screen').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settings-screen').classList.add('hidden');
    }

    openStats() {
        this.updateStatsDisplay();
        this.renderHistory('all');
        document.getElementById('stats-screen').classList.remove('hidden');
    }

    closeStats() {
        document.getElementById('stats-screen').classList.add('hidden');
    }

    // Stats Tracking
    saveGameSession() {
        const session = {
            timestamp: Date.now(),
            mode: this.mode,
            score: Math.floor(this.score),
            accuracy: this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0,
            hits: this.shotsHit,
            maxCombo: this.maxCombo,
            avgTime: this.mode === 'reflex' && this.reactionTimes.length > 0
                ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
                : null,
            duration: this.gameDuration,
            difficulty: this.difficulty
        };

        // Get existing history
        let history = JSON.parse(localStorage.getItem('aim_history') || '[]');

        // Add new session
        history.unshift(session);

        // Keep only last 100 sessions
        if (history.length > 100) {
            history = history.slice(0, 100);
        }

        // Save
        localStorage.setItem('aim_history', JSON.stringify(history));
    }

    updateStatsDisplay() {
        const history = JSON.parse(localStorage.getItem('aim_history') || '[]');

        if (history.length === 0) {
            document.getElementById('stat-total-games').innerText = '0';
            document.getElementById('stat-avg-score').innerText = '0';
            document.getElementById('stat-avg-acc').innerText = '0%';
            document.getElementById('stat-best-score').innerText = '0';
            return;
        }

        // Calculate stats
        const totalGames = history.length;
        const avgScore = Math.round(history.reduce((sum, s) => sum + s.score, 0) / totalGames);
        const avgAcc = Math.round(history.reduce((sum, s) => sum + s.accuracy, 0) / totalGames);
        const bestScore = Math.max(...history.map(s => s.score));

        document.getElementById('stat-total-games').innerText = totalGames;
        document.getElementById('stat-avg-score').innerText = avgScore;
        document.getElementById('stat-avg-acc').innerText = avgAcc + '%';
        document.getElementById('stat-best-score').innerText = bestScore;
    }

    renderHistory(filter = 'all') {
        const history = JSON.parse(localStorage.getItem('aim_history') || '[]');
        const tbody = document.getElementById('history-table');

        // Filter history
        const filtered = filter === 'all'
            ? history
            : history.filter(s => s.mode === filter);

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-slate-500 text-sm">
                        ${filter === 'all' ? 'No games played yet. Start playing to see your stats!' : 'No games found for this mode.'}
                    </td>
                </tr>
            `;
            return;
        }

        // Render rows
        tbody.innerHTML = filtered.map(session => {
            const date = new Date(session.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
                <tr class="text-sm">
                    <td class="px-4 py-3 text-slate-300 font-mono text-xs">${dateStr}</td>
                    <td class="px-4 py-3">
                        <span class="mode-badge ${session.mode}">${session.mode}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-bold text-sky-400">${session.score}</td>
                    <td class="px-4 py-3 text-right font-bold ${session.accuracy >= 80 ? 'text-emerald-400' : session.accuracy >= 60 ? 'text-amber-400' : 'text-slate-400'}">${session.accuracy}%</td>
                    <td class="px-4 py-3 text-right text-slate-300">${session.hits}</td>
                    <td class="px-4 py-3 text-right font-bold text-amber-400">${session.maxCombo}</td>
                    <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">${session.avgTime ? session.avgTime + 'ms' : 'N/A'}</td>
                </tr>
            `;
        }).join('');
    }

    filterHistory(mode) {
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Render filtered history
        this.renderHistory(mode);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all game history? This cannot be undone.')) {
            localStorage.removeItem('aim_history');
            this.updateStatsDisplay();
            this.renderHistory('all');

            // Reset filter to all
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('.filter-btn[onclick*="all"]').classList.add('active');
        }
    }
}

window.game = new AimGame();
