/**
 * Bag & Blade: Procedural Web Audio Sound Engine
 * Synthesizes parchment rustles, blade clangs, potion glugs, wax stamps, and fanfares.
 */
"use strict";

const SoundController = (function () {
	let audioCtx = null;
	let isMuted = false;

	function getAudioContext() {
		if (!audioCtx) {
			const AudioContextClass =
				window.AudioContext || window.webkitAudioContext;
			if (AudioContextClass) {
				audioCtx = new AudioContextClass();
			}
		}
		if (audioCtx && audioCtx.state === "suspended") {
			audioCtx.resume();
		}
		return audioCtx;
	}

	function playTone(
		freq,
		type,
		duration,
		gainStart,
		gainEnd,
		decayType = "exponential",
	) {
		if (isMuted) return;
		const ctx = getAudioContext();
		if (!ctx) return;

		try {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = type;
			osc.frequency.setValueAtTime(freq, ctx.currentTime);

			gain.gain.setValueAtTime(gainStart, ctx.currentTime);
			if (decayType === "linear") {
				gain.gain.linearRampToValueAtTime(gainEnd, ctx.currentTime + duration);
			} else {
				gain.gain.exponentialRampToValueAtTime(
					Math.max(0.0001, gainEnd),
					ctx.currentTime + duration,
				);
			}

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start();
			osc.stop(ctx.currentTime + duration);
		} catch (e) {
			console.warn("Audio playback error", e);
		}
	}

	function playNoise(duration, gainStart, gainEnd, filterFreq = 1200) {
		if (isMuted) return;
		const ctx = getAudioContext();
		if (!ctx) return;

		try {
			const bufferSize = ctx.sampleRate * duration;
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				data[i] = Math.random() * 2 - 1;
			}

			const noise = ctx.createBufferSource();
			noise.buffer = buffer;

			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

			const gain = ctx.createGain();
			gain.gain.setValueAtTime(gainStart, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(
				Math.max(0.0001, gainEnd),
				ctx.currentTime + duration,
			);

			noise.connect(filter);
			filter.connect(gain);
			gain.connect(ctx.destination);

			noise.start();
		} catch (e) {
			console.warn("Noise audio error", e);
		}
	}

	return {
		initAudio: function () {
			getAudioContext();
		},

		toggleMute: function () {
			isMuted = !isMuted;
			try {
				localStorage.setItem("bag_and_blade_muted", isMuted ? "true" : "false");
			} catch (e) {}
			return isMuted;
		},

		isMutedState: function () {
			try {
				const saved = localStorage.getItem("bag_and_blade_muted");
				if (saved !== null) {
					isMuted = saved === "true";
				}
			} catch (e) {}
			return isMuted;
		},

		playItemPickup: function () {
			// Paper / leather rustle
			playNoise(0.08, 0.2, 0.01, 2400);
			playTone(320, "triangle", 0.08, 0.15, 0.01);
		},

		playItemPlace: function () {
			// Soft wooden desk snap
			playNoise(0.05, 0.25, 0.01, 800);
			playTone(180, "sine", 0.1, 0.3, 0.01);
		},

		playItemRotate: function () {
			// Crisp swoosh
			playTone(480, "sine", 0.07, 0.15, 0.01);
			setTimeout(() => playTone(640, "triangle", 0.06, 0.15, 0.01), 30);
		},

		playInvalidDrop: function () {
			// Low dull rejection thud
			playTone(110, "sawtooth", 0.18, 0.25, 0.01);
			playTone(90, "triangle", 0.2, 0.3, 0.01);
		},

		playSwordSlash: function () {
			// Metallic whoosh & slice
			playNoise(0.12, 0.35, 0.01, 3800);
			playTone(850, "sawtooth", 0.15, 0.25, 0.01);
			setTimeout(() => playTone(1200, "triangle", 0.1, 0.2, 0.01), 40);
		},

		playShieldBlock: function () {
			// Heavy metal deflection
			playTone(220, "triangle", 0.25, 0.4, 0.01);
			playTone(440, "sine", 0.2, 0.3, 0.01);
			playNoise(0.08, 0.3, 0.01, 1400);
		},

		playPotionGulp: function () {
			// Glass clink followed by bubbly ascending chime
			playTone(1100, "sine", 0.06, 0.2, 0.01);
			setTimeout(() => playTone(480, "sine", 0.1, 0.25, 0.01), 70);
			setTimeout(() => playTone(640, "sine", 0.1, 0.3, 0.01), 140);
			setTimeout(() => playTone(820, "sine", 0.12, 0.2, 0.01), 210);
		},

		playSpellCast: function () {
			// Mystic resonant chord
			playTone(523.25, "triangle", 0.35, 0.25, 0.01); // C5
			playTone(659.25, "sine", 0.35, 0.2, 0.01); // E5
			playTone(783.99, "triangle", 0.4, 0.2, 0.01); // G5
			playTone(1046.5, "sine", 0.45, 0.15, 0.01); // C6
		},

		playCoinClink: function () {
			// Bright gold coin jingle
			playTone(1760, "sine", 0.12, 0.25, 0.01);
			setTimeout(() => playTone(2349, "sine", 0.18, 0.3, 0.01), 60);
		},

		playWaxStamp: function () {
			// Heavy authentic wax seal stamp thud
			playTone(75, "sine", 0.25, 0.5, 0.01);
			playTone(130, "triangle", 0.2, 0.4, 0.01);
			playNoise(0.12, 0.4, 0.01, 600);
		},

		playVictoryFanfare: function () {
			const notes = [
				{ f: 392, d: 0.12 }, // G4
				{ f: 523.25, d: 0.12 }, // C5
				{ f: 659.25, d: 0.14 }, // E5
				{ f: 783.99, d: 0.35 }, // G5
			];
			notes.forEach((n, idx) => {
				setTimeout(() => {
					playTone(n.f, "triangle", n.d, 0.3, 0.01);
					playTone(n.f * 1.5, "sine", n.d, 0.15, 0.01);
				}, idx * 130);
			});
		},

		playDefeatSound: function () {
			const notes = [440, 415, 392, 349];
			notes.forEach((f, idx) => {
				setTimeout(() => {
					playTone(f, "sawtooth", 0.25, 0.2, 0.01);
				}, idx * 160);
			});
		},
	};
})();

// A top-level `const` is NOT a property of window, so the rest of the game could never
// see this controller through `window.SoundController`. Publish it explicitly.
window.SoundController = SoundController;
SoundController.isMutedState();
