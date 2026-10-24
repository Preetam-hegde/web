"use strict";

/**
 * ComicClash Audio Engine
 * Pure procedural Web Audio synthesis for retro comic sound effects.
 * No external audio assets required.
 */
class ComicSoundEngine {
	constructor() {
		this.ctx = null;
		this.masterGain = null;
		this.volume = 0.35;
		this.muted = false;
	}

	init() {
		if (this.ctx) return;
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		this.ctx = new AudioCtx();
		this.masterGain = this.ctx.createGain();
		this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
		this.masterGain.connect(this.ctx.destination);
	}

	resume() {
		this.init();
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume();
		}
	}

	toggleMute() {
		this.muted = !this.muted;
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setValueAtTime(
				this.muted ? 0 : this.volume,
				this.ctx.currentTime,
			);
		}
		return this.muted;
	}

	setVolume(val) {
		this.volume = Math.max(0, Math.min(1, val));
		if (this.masterGain && this.ctx && !this.muted) {
			this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
		}
	}

	// ── Sound Synthesizers ──────────────────────────────────────────────────

	/**
	 * Foil / Paper Tear sound when tearing open a comic booster pack.
	 */
	playRip() {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const bufferSize = this.ctx.sampleRate * 0.35;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);

		// Crackly pink/white noise with modulated amplitude
		for (let i = 0; i < bufferSize; i++) {
			const progress = i / bufferSize;
			const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.5);
			data[i] =
				(Math.random() * 2 - 1) * envelope * (Math.random() > 0.3 ? 1 : 0.2);
		}

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;

		const filter = this.ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.setValueAtTime(2400, t);
		filter.frequency.exponentialRampToValueAtTime(600, t + 0.35);
		filter.Q.setValueAtTime(3.5, t);

		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(0.45, t);
		gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

		noise.connect(filter);
		filter.connect(gain);
		gain.connect(this.masterGain);

		noise.start(t);
		noise.stop(t + 0.35);
	}

	/**
	 * Punch impact (BAM! / POW!) - bass kick + crunchy bandpass distortion.
	 */
	playPunch(heavy = false) {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const duration = heavy ? 0.35 : 0.22;

		// Sub thud
		const osc = this.ctx.createOscillator();
		const oscGain = this.ctx.createGain();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(heavy ? 180 : 220, t);
		osc.frequency.exponentialRampToValueAtTime(35, t + duration);

		oscGain.gain.setValueAtTime(heavy ? 0.6 : 0.45, t);
		oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

		osc.connect(oscGain);
		oscGain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + duration);

		// Crunchy impact noise burst
		const bufferSize = this.ctx.sampleRate * 0.12;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
		}
		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;

		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(heavy ? 800 : 1400, t);

		const noiseGain = this.ctx.createGain();
		noiseGain.gain.setValueAtTime(heavy ? 0.5 : 0.3, t);
		noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

		noise.connect(filter);
		filter.connect(noiseGain);
		noiseGain.connect(this.masterGain);
		noise.start(t);
		noise.stop(t + 0.12);
	}

	/**
	 * Energy / Laser zap (ZAP! / PEW!)
	 */
	playLaser() {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(880, t);
		osc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

		gain.gain.setValueAtTime(0.25, t);
		gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + 0.18);
	}

	/**
	 * Slash / Blade cut (KRAK!)
	 */
	playSlash() {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "sine";
		osc.frequency.setValueAtTime(1400, t);
		osc.frequency.exponentialRampToValueAtTime(280, t + 0.15);

		gain.gain.setValueAtTime(0.35, t);
		gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + 0.15);
	}

	/**
	 * Gacha reveal fanfare based on card rarity (2, 3, 4, 5 stars).
	 */
	playReveal(rarity = 2) {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;

		if (rarity === 2) {
			// Simple woodblock/plink
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(440, t);
			osc.frequency.exponentialRampToValueAtTime(550, t + 0.1);
			gain.gain.setValueAtTime(0.2, t);
			gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
			osc.connect(gain);
			gain.connect(this.masterGain);
			osc.start(t);
			osc.stop(t + 0.12);
		} else if (rarity === 3) {
			// Rising major third chord
			[523.25, 659.25, 783.99].forEach((freq, idx) => {
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "triangle";
				osc.frequency.setValueAtTime(freq, t + idx * 0.06);
				gain.gain.setValueAtTime(0.25, t + idx * 0.06);
				gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.06 + 0.25);
				osc.connect(gain);
				gain.connect(this.masterGain);
				osc.start(t + idx * 0.06);
				osc.stop(t + idx * 0.06 + 0.25);
			});
		} else if (rarity === 4) {
			// Bright trumpet-like fanfare
			[440, 554.37, 659.25, 880].forEach((freq, idx) => {
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "square";
				osc.frequency.setValueAtTime(freq, t + idx * 0.08);
				gain.gain.setValueAtTime(0.2, t + idx * 0.08);
				gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.4);
				osc.connect(gain);
				gain.connect(this.masterGain);
				osc.start(t + idx * 0.08);
				osc.stop(t + idx * 0.08 + 0.4);
			});
		} else {
			// 5-Star Mythic: Sub-bass drop + glorious brass chord + sparkling shimmer
			// Sub drop
			const sub = this.ctx.createOscillator();
			const subGain = this.ctx.createGain();
			sub.type = "sine";
			sub.frequency.setValueAtTime(160, t);
			sub.frequency.exponentialRampToValueAtTime(40, t + 0.8);
			subGain.gain.setValueAtTime(0.6, t);
			subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
			sub.connect(subGain);
			subGain.connect(this.masterGain);
			sub.start(t);
			sub.stop(t + 0.8);

			// Glorious heroic chord
			const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];
			chord.forEach((freq, idx) => {
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "sawtooth";
				osc.frequency.setValueAtTime(freq, t + 0.15 + idx * 0.05);
				gain.gain.setValueAtTime(0.22, t + 0.15 + idx * 0.05);
				gain.gain.exponentialRampToValueAtTime(0.005, t + 1.2);
				osc.connect(gain);
				gain.connect(this.masterGain);
				osc.start(t + 0.15 + idx * 0.05);
				osc.stop(t + 1.2);
			});
		}
	}

	/**
	 * Coin clink / token spent or collected.
	 */
	playCoin() {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		[987.77, 1318.51].forEach((freq, idx) => {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, t + idx * 0.07);
			gain.gain.setValueAtTime(0.28, t + idx * 0.07);
			gain.gain.exponentialRampToValueAtTime(0.005, t + idx * 0.07 + 0.22);
			osc.connect(gain);
			gain.connect(this.masterGain);
			osc.start(t + idx * 0.07);
			osc.stop(t + idx * 0.07 + 0.22);
		});
	}

	/**
	 * Comic page turn / tab click.
	 */
	playPageFlip() {
		if (this.muted) return;
		this.resume();
		if (!this.ctx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(320, t);
		osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);
		gain.gain.setValueAtTime(0.15, t);
		gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
		osc.connect(gain);
		gain.connect(this.masterGain);
		osc.start(t);
		osc.stop(t + 0.06);
	}
}

// Global audio singleton
window.ComicAudio = new ComicSoundEngine();
