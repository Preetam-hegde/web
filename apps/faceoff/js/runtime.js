'use strict';

/* One turn owns its timers, animation frames and listeners. Disposing it is idempotent. */
function createRoundScope(isAlive, scheduler = globalThis) {
	const timers = new Set(),
		frames = new Set(),
		cleanups = new Set();
	let disposed = false;
	const alive = () => !disposed && isAlive();
	const cleanup = (fn) => {
		if (disposed) fn();
		else cleanups.add(fn);
		return fn;
	};
	return {
		after(ms, fn) {
			if (!alive()) return;
			const id = scheduler.setTimeout(() => {
				timers.delete(id);
				if (alive()) fn();
			}, ms);
			timers.add(id);
			return id;
		},
		loop(fn) {
			if (!alive()) return;
			const tick = () => {
				const id = scheduler.requestAnimationFrame((time) => {
					frames.delete(id);
					if (alive() && fn(time) !== false && alive()) tick();
				});
				frames.add(id);
			};
			tick();
		},
		on(target, type, fn, options) {
			if (!alive()) return;
			const listener = (e) => {
				if (alive()) fn(e);
			};
			target.addEventListener(type, listener, options);
			return cleanup(() => target.removeEventListener(type, listener, options));
		},
		cleanup,
		dispose() {
			if (disposed) return;
			disposed = true;
			timers.forEach((id) => scheduler.clearTimeout(id));
			frames.forEach((id) => scheduler.cancelAnimationFrame(id));
			cleanups.forEach((fn) => fn());
			timers.clear();
			frames.clear();
			cleanups.clear();
		},
	};
}

if (typeof module !== 'undefined' && module.exports)
	module.exports = { createRoundScope };
