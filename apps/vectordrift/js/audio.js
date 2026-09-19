'use strict';

/* ── VectorDrift Procedural Web Audio Synthesizer ──────────── */
class SoundEngine {
	constructor() {
		this.ctx = null;
		this.masterGain = null;
		this.musicGain = null;
		this.sfxGain = null;
		this.grazeGain = null;

		this.masterVolume = 0.4;
		this.musicVolume = 0.35;
		this.sfxVolume = 0.5;
		this.grazeVolume = 0.4;
		this.enabled = true;

		// Bassline sequencer state
		this.isPlayingMusic = false;
		this.bpm = 140;
		this.stepTime = 60 / this.bpm / 4; // 16th notes
		this.currentStep = 0;
		this.nextNoteTime = 0;
		this.seqTimer = null;
		this.multiplier = 1.0;

		// 16-step bassline pattern (MIDI notes or frequencies)
		// E-minor / Dorian acid bassline
		this.bassScale = [
			41.2, 41.2, 49.0, 55.0,
			41.2, 36.7, 41.2, 61.7,
			41.2, 41.2, 49.0, 55.0,
			65.4, 61.7, 55.0, 49.0
		];

		// Graze audio node references
		this.grazeOsc = null;
		this.grazeFilter = null;
		this.grazeNoiseNode = null;
		this.isGrazeActive = false;
	}

	init() {
		if (this.ctx) return;
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;

		this.ctx = new AudioCtx();

		this.masterGain = this.ctx.createGain();
		this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
		this.masterGain.connect(this.ctx.destination);

		this.musicGain = this.ctx.createGain();
		this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
		this.musicGain.connect(this.masterGain);

		this.sfxGain = this.ctx.createGain();
		this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
		this.sfxGain.connect(this.masterGain);

		this.grazeGain = this.ctx.createGain();
		this.grazeGain.gain.setValueAtTime(0, this.ctx.currentTime);
		this.grazeGain.connect(this.masterGain);

		this.initGrazeAudio();
	}

	resume() {
		this.init();
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
	}

	setMasterVolume(val) {
		this.masterVolume = Math.max(0, Math.min(1, val));
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
		}
	}

	setMusicVolume(val) {
		this.musicVolume = Math.max(0, Math.min(1, val));
		if (this.musicGain && this.ctx) {
			this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
		}
	}

	setSfxVolume(val) {
		this.sfxVolume = Math.max(0, Math.min(1, val));
		if (this.sfxGain && this.ctx) {
			this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
		}
	}

	setEnabled(enabled) {
		this.enabled = enabled;
		if (!enabled) {
			this.stopMusic();
			this.updateGraze(0, 0);
		}
	}

	/* ── Procedural Acid Synth Bassline ───────────────────────── */
	startMusic() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx || this.isPlayingMusic) return;

		this.isPlayingMusic = true;
		this.currentStep = 0;
		this.nextNoteTime = this.ctx.currentTime + 0.05;
		this.scheduleMusic();
	}

	stopMusic() {
		this.isPlayingMusic = false;
		if (this.seqTimer) {
			clearTimeout(this.seqTimer);
			this.seqTimer = null;
		}
	}

	setMultiplier(mult) {
		this.multiplier = mult;
	}

	scheduleMusic() {
		if (!this.isPlayingMusic || !this.ctx) return;

		const lookahead = 0.1;
		const scheduleAhead = 0.2;

		while (this.nextNoteTime < this.ctx.currentTime + scheduleAhead) {
			this.playBassStep(this.nextNoteTime, this.currentStep);
			this.nextNoteTime += this.stepTime;
			this.currentStep = (this.currentStep + 1) % 16;
		}

		this.seqTimer = setTimeout(() => this.scheduleMusic(), lookahead * 1000);
	}

	playBassStep(time, step) {
		if (!this.ctx || !this.enabled) return;

		const osc = this.ctx.createOscillator();
		const filter = this.ctx.createBiquadFilter();
		const gain = this.ctx.createGain();

		const baseFreq = this.bassScale[step];
		// Octave up occasionally on high multipliers
		const octaveBoost = this.multiplier > 8 && step % 4 === 2 ? 2 : 1;
		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(baseFreq * octaveBoost, time);

		// Dynamic filter cutoff scales exponentially with Graze Multiplier!
		// From 300Hz (dark, deep) to 3200Hz (screaming acid resonance)
		const multFactor = Math.min(this.multiplier, 25);
		const baseCutoff = 320 + (multFactor - 1) * 120;
		const peakCutoff = Math.min(baseCutoff * (2.0 + (multFactor / 10)), 4200);

		filter.type = 'lowpass';
		filter.Q.setValueAtTime(6 + Math.min(multFactor * 0.4, 10), time);
		filter.frequency.setValueAtTime(peakCutoff, time);
		filter.frequency.exponentialRampToValueAtTime(baseCutoff, time + this.stepTime * 0.85);

		// Snappy amp envelope
		const noteGain = step % 4 === 0 ? 0.35 : 0.26;
		gain.gain.setValueAtTime(noteGain, time);
		gain.gain.exponentialRampToValueAtTime(0.001, time + this.stepTime * 0.9);

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(this.musicGain);

		osc.start(time);
		osc.stop(time + this.stepTime);

		// Add subtle sub-kick on beat 0 and 8
		if (step === 0 || step === 8) {
			this.playSubBeat(time);
		}
	}

	playSubBeat(time) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(110, time);
		osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

		gain.gain.setValueAtTime(0.4, time);
		gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

		osc.connect(gain);
		gain.connect(this.musicGain);

		osc.start(time);
		osc.stop(time + 0.16);
	}

	/* ── Graze Audio (Continuous Proximity Sizzle) ────────────── */
	initGrazeAudio() {
		if (!this.ctx) return;

		// Dual oscillator frequency-modulated buzz
		this.grazeOsc = this.ctx.createOscillator();
		this.grazeOsc.type = 'sawtooth';
		this.grazeOsc.frequency.setValueAtTime(440, this.ctx.currentTime);

		this.grazeFilter = this.ctx.createBiquadFilter();
		this.grazeFilter.type = 'bandpass';
		this.grazeFilter.Q.setValueAtTime(8, this.ctx.currentTime);
		this.grazeFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

		this.grazeOsc.connect(this.grazeFilter);
		this.grazeFilter.connect(this.grazeGain);

		this.grazeOsc.start();
	}

	updateGraze(proximityRatio, multiplier) {
		if (!this.ctx || !this.enabled || !this.grazeGain) return;

		// proximityRatio: 0 = outside graze zone, 1 = within 1px of death
		const t = this.ctx.currentTime;
		if (proximityRatio <= 0.01) {
			this.grazeGain.gain.setTargetAtTime(0, t, 0.04);
			this.isGrazeActive = false;
			return;
		}

		this.isGrazeActive = true;
		const targetVol = this.grazeVolume * (0.15 + proximityRatio * 0.75);
		this.grazeGain.gain.setTargetAtTime(targetVol, t, 0.03);

		// Higher and sharper pitch as proximity approaches zero (imminent death)
		const freq = 400 + proximityRatio * 850 + Math.min(multiplier * 20, 500);
		this.grazeOsc.frequency.setTargetAtTime(freq, t, 0.03);
		this.grazeFilter.frequency.setTargetAtTime(freq * 1.8, t, 0.03);
	}

	/* ── SFX Events ─────────────────────────────────────────── */
	playNearMissPulse() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;

		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(280, t);
		osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

		gain.gain.setValueAtTime(0.3, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

		osc.connect(gain);
		gain.connect(this.sfxGain);

		osc.start(t);
		osc.stop(t + 0.1);
	}

	playDeathImpact() {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;

		const t = this.ctx.currentTime;

		// 1. Heavy bass drop
		const osc = this.ctx.createOscillator();
		const oscGain = this.ctx.createGain();
		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(180, t);
		osc.frequency.exponentialRampToValueAtTime(25, t + 0.4);

		oscGain.gain.setValueAtTime(0.6, t);
		oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

		osc.connect(oscGain);
		oscGain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + 0.46);

		// 2. White noise explosion burst
		const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
		const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const output = noiseBuffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			output[i] = Math.random() * 2 - 1;
		}

		const whiteNoise = this.ctx.createBufferSource();
		whiteNoise.buffer = noiseBuffer;

		const filter = this.ctx.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(3000, t);
		filter.frequency.exponentialRampToValueAtTime(100, t + 0.35);

		const noiseGain = this.ctx.createGain();
		noiseGain.gain.setValueAtTime(0.55, t);
		noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

		whiteNoise.connect(filter);
		filter.connect(noiseGain);
		noiseGain.connect(this.sfxGain);

		whiteNoise.start(t);
		whiteNoise.stop(t + 0.36);
	}

	playMilestone(level) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;

		const t = this.ctx.currentTime;
		const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio

		chord.forEach((freq, idx) => {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			const start = t + idx * 0.04;

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq * (level > 20 ? 1.5 : 1), start);

			gain.gain.setValueAtTime(0.2, start);
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

			osc.connect(gain);
			gain.connect(this.sfxGain);

			osc.start(start);
			osc.stop(start + 0.24);
		});
	}

	playUiBlip(pitch = 1) {
		if (!this.enabled) return;
		this.resume();
		if (!this.ctx) return;

		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(800 * pitch, t);
		osc.frequency.exponentialRampToValueAtTime(1200 * pitch, t + 0.04);

		gain.gain.setValueAtTime(0.12, t);
		gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

		osc.connect(gain);
		gain.connect(this.sfxGain);

		osc.start(t);
		osc.stop(t + 0.06);
	}
}

// Global singleton instance
window.soundEngine = new SoundEngine();
