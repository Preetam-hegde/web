"use strict";

/**
 * Dear Diary - URL State Codec
 * Serializes, compresses, and deserializes journal states to and from URL hashes.
 * Pure Vanilla JS, zero dependencies, cross-platform (Node.js & browser).
 */

(function (root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.DiaryUrlCodec = factory();
	}
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
	// Base64URL characters (URL-safe: no +, /, or = padding)
	const B64_CHARS =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	const B64_LOOKUP = new Uint8Array(256);
	for (let i = 0; i < B64_CHARS.length; i++) {
		B64_LOOKUP[B64_CHARS.charCodeAt(i)] = i;
	}

	/**
	 * Compresses a UTF-8 string into a URL-safe Base64URL string using a byte-level LZW variant.
	 * Handles all Unicode, surrogate pairs, and emojis flawlessly.
	 * @param {string} uncompressed
	 * @returns {string}
	 */
	function compressToUrlSafe(uncompressed) {
		if (!uncompressed || typeof uncompressed !== "string") return "";

		// Convert UTF-16 string into a UTF-8 byte array so all symbols are strictly in 0..255
		const bytes = new TextEncoder().encode(uncompressed);
		if (bytes.length === 0) return "";

		const dict = new Map();
		let outBits = 0;
		let outBitLen = 0;
		let result = "";

		// Initialize dictionary with single byte codes 0..255
		for (let i = 0; i < 256; i++) {
			dict.set(String.fromCharCode(i), i);
		}

		let nextCode = 256;
		let numBits = 9;
		let curr = "";

		function emitCode(code) {
			outBits = (outBits << numBits) | code;
			outBitLen += numBits;
			while (outBitLen >= 6) {
				outBitLen -= 6;
				const idx = (outBits >> outBitLen) & 0x3f;
				result += B64_CHARS.charAt(idx);
			}
		}

		for (let i = 0; i < bytes.length; i++) {
			const c = String.fromCharCode(bytes[i]);
			const combined = curr + c;
			if (dict.has(combined)) {
				curr = combined;
			} else {
				emitCode(dict.get(curr));
				if (nextCode < 4096) {
					dict.set(combined, nextCode++);
					if (nextCode > 1 << numBits && numBits < 12) {
						numBits++;
					}
				}
				curr = c;
			}
		}

		if (curr !== "") {
			emitCode(dict.get(curr));
		}

		// Flush remaining bits padded to 6 bits
		if (outBitLen > 0) {
			const idx = (outBits << (6 - outBitLen)) & 0x3f;
			result += B64_CHARS.charAt(idx);
		}

		return result;
	}

	/**
	 * Decompresses a URL-safe Base64URL string back to a UTF-8 string.
	 * @param {string} compressed
	 * @returns {string}
	 */
	function decompressFromUrlSafe(compressed) {
		if (!compressed || typeof compressed !== "string") return "";

		// Parse Base64URL stream into raw bitstream
		let bitBuffer = 0;
		let bitCount = 0;
		let charIdx = 0;

		function getBits(bitsNeeded) {
			while (bitCount < bitsNeeded) {
				if (charIdx >= compressed.length) return -1;
				const charCode = compressed.charCodeAt(charIdx++);
				if (charCode >= 256) return -1;
				const val = B64_LOOKUP[charCode];
				if (val === undefined || (val === 255 && B64_CHARS.charAt(0) !== "A"))
					return -1;
				bitBuffer = (bitBuffer << 6) | val;
				bitCount += 6;
			}
			bitCount -= bitsNeeded;
			return (bitBuffer >> bitCount) & ((1 << bitsNeeded) - 1);
		}

		const dict = new Map();
		for (let i = 0; i < 256; i++) {
			dict.set(i, String.fromCharCode(i));
		}

		let nextCode = 256;
		let numBits = 9;

		const firstCode = getBits(numBits);
		if (firstCode === -1 || !dict.has(firstCode)) return "";

		let oldStr = dict.get(firstCode);
		const byteChars = [oldStr];

		while (true) {
			if (nextCode + 1 > 1 << numBits && numBits < 12) {
				numBits++;
			}

			const code = getBits(numBits);
			if (code === -1) break;

			let currStr;
			if (dict.has(code)) {
				currStr = dict.get(code);
			} else if (code === nextCode) {
				currStr = oldStr + oldStr.charAt(0);
			} else {
				// Corrupted stream
				return "";
			}

			byteChars.push(currStr);

			if (nextCode < 4096) {
				dict.set(nextCode++, oldStr + currStr.charAt(0));
			}
			oldStr = currStr;
		}

		// Reconstruct UTF-8 byte array
		const totalByteLen = byteChars.reduce(
			(acc, chunk) => acc + chunk.length,
			0,
		);
		const outBytes = new Uint8Array(totalByteLen);
		let offset = 0;
		for (let i = 0; i < byteChars.length; i++) {
			const chunk = byteChars[i];
			for (let j = 0; j < chunk.length; j++) {
				outBytes[offset++] = chunk.charCodeAt(j);
			}
		}

		try {
			return new TextDecoder().decode(outBytes);
		} catch (e) {
			return "";
		}
	}

	/**
	 * Creates a default starter state for a fresh journal page with dual-page writing.
	 * @returns {object}
	 */
	function createDefaultState() {
		const today = new Date().toISOString().split("T")[0];
		return {
			v: 2,
			t: "Evening Story & Reflections",
			d: today,
			m: "happy",
			w: "sunny",
			th: "parchment",
			p: "ruled",
			font: "handwriting",
			fontSize: 18,
			layout: "dual",
			lt: "Morning Spark & Intentions",
			lb: "3 things I am deeply grateful for today:\n1. A warm cup of matcha with the morning sun.\n2. The quiet breeze before the day began.\n3. Having a creative journal to write freely.\n\nDaily intention: Stay present and savor every small joy.",
			tasks: [
				{ id: "t1", text: "Enjoy a mindful walk outside", done: true },
				{ id: "t2", text: "Read 15 pages of a good book", done: false },
				{ id: "t3", text: "Unplug 30 minutes before sleep", done: false },
			],
			habits: [
				{ id: "h1", name: "Hydrate", icon: "💧", done: true },
				{ id: "h2", name: "Read", icon: "📖", done: false },
				{ id: "h3", name: "Move", icon: "🚶", done: true },
				{ id: "h4", name: "Meditate", icon: "🧘", done: false },
			],
			q: "What is one sweet moment you want to remember today?",
			b: "Today was wonderfully productive and soothing. The afternoon light spilled across the desk while I worked on my favorite projects.\n\nIt feels so good to slow down, write down my thoughts, and decorate this page with cute stamps and memories.",
			s: [
				{
					id: "st-intro-1",
					type: "svg",
					val: "wax-seal",
					color: "#b91c1c",
					x: 12,
					y: 12,
					r: -5,
					sc: 1.1,
					z: 2,
				},
				{
					id: "st-intro-2",
					type: "svg",
					val: "sparkles",
					color: "#d97757",
					x: 90,
					y: 12,
					r: 10,
					sc: 1.2,
					z: 3,
				},
				{
					id: "st-intro-3",
					type: "washi",
					val: "washi-dots",
					x: 50,
					y: 8,
					r: -1,
					sc: 1,
					z: 1,
					w: 160,
				},
				{
					id: "st-intro-4",
					type: "note",
					val: "Remember:\nEnjoy the process, not just the finish line!",
					color: "yellow",
					x: 84,
					y: 78,
					r: 3,
					sc: 1,
					z: 4,
				},
			],
			spreadIdx: 0,
			spreads: [],
			dr: [],
		};
	}

	/**
	 * Sanitizes and validates journal state to ensure strict structure and prevent injection.
	 * Backward-compatible with v1 states.
	 * @param {any} raw
	 * @returns {object}
	 */
	function sanitizeState(raw) {
		if (!raw || typeof raw !== "object") {
			return createDefaultState();
		}

		const defaults = createDefaultState();

		const clean = {
			v: 2,
			t: typeof raw.t === "string" ? raw.t.slice(0, 140) : defaults.t,
			d: typeof raw.d === "string" ? raw.d.slice(0, 20) : defaults.d,
			m: typeof raw.m === "string" ? raw.m.slice(0, 30) : defaults.m,
			w: typeof raw.w === "string" ? raw.w.slice(0, 30) : defaults.w,
			th: typeof raw.th === "string" ? raw.th.slice(0, 30) : defaults.th,
			p: typeof raw.p === "string" ? raw.p.slice(0, 30) : defaults.p,
			font:
				typeof raw.font === "string" ? raw.font.slice(0, 30) : defaults.font,
			fontSize:
				typeof raw.fontSize === "number" &&
				raw.fontSize >= 12 &&
				raw.fontSize <= 36
					? Math.round(raw.fontSize)
					: defaults.fontSize,
			layout:
				typeof raw.layout === "string"
					? raw.layout.slice(0, 30)
					: raw.v === 1
						? "scrapbook"
						: defaults.layout,
			lt: typeof raw.lt === "string" ? raw.lt.slice(0, 140) : defaults.lt,
			lb:
				typeof raw.lb === "string"
					? raw.lb.slice(0, 15000)
					: raw.v === 1
						? ""
						: defaults.lb,
			q: typeof raw.q === "string" ? raw.q.slice(0, 250) : "",
			b: typeof raw.b === "string" ? raw.b.slice(0, 25000) : "",
			tasks: [],
			habits: [],
			s: [],
			spreadIdx:
				typeof raw.spreadIdx === "number"
					? Math.max(0, Math.min(10, Math.round(raw.spreadIdx)))
					: 0,
			spreads: [],
			dr: [],
		};

		// Sanitize tasks
		if (Array.isArray(raw.tasks)) {
			clean.tasks = raw.tasks.slice(0, 20).map((t, idx) => ({
				id: typeof t.id === "string" ? t.id : `task-${idx}`,
				text: typeof t.text === "string" ? t.text.slice(0, 140) : "",
				done: Boolean(t.done),
			}));
		} else if (raw.v !== 1) {
			clean.tasks = defaults.tasks;
		}

		// Sanitize habits
		if (Array.isArray(raw.habits)) {
			clean.habits = raw.habits.slice(0, 8).map((h, idx) => ({
				id: typeof h.id === "string" ? h.id : `habit-${idx}`,
				name: typeof h.name === "string" ? h.name.slice(0, 40) : "",
				icon: typeof h.icon === "string" ? h.icon.slice(0, 10) : "★",
				done: Boolean(h.done),
			}));
		} else if (raw.v !== 1) {
			clean.habits = defaults.habits;
		}

		// Sanitize stickers (emoji, svg, badge, washi, note, polaroid)
		if (Array.isArray(raw.s)) {
			clean.s = raw.s
				.slice(0, 120)
				.map((st, idx) => {
					if (!st || typeof st !== "object") return null;
					return {
						id: typeof st.id === "string" ? st.id : `st-${idx}-${Date.now()}`,
						type: typeof st.type === "string" ? st.type : "emoji",
						val: typeof st.val === "string" ? st.val.slice(0, 400) : "",
						x:
							typeof st.x === "number" && Number.isFinite(st.x)
								? Math.round(st.x * 10) / 10
								: 50,
						y:
							typeof st.y === "number" && Number.isFinite(st.y)
								? Math.round(st.y * 10) / 10
								: 50,
						r:
							typeof st.r === "number" && Number.isFinite(st.r)
								? Math.round(st.r)
								: 0,
						sc:
							typeof st.sc === "number" && Number.isFinite(st.sc)
								? Math.max(0.3, Math.min(3.5, Math.round(st.sc * 100) / 100))
								: 1,
						z:
							typeof st.z === "number"
								? Math.max(1, Math.min(300, Math.round(st.z)))
								: idx + 1,
						w: typeof st.w === "number" ? Math.round(st.w) : undefined,
						color:
							typeof st.color === "string" ? st.color.slice(0, 40) : undefined,
						cap: typeof st.cap === "string" ? st.cap.slice(0, 140) : undefined,
						img:
							typeof st.img === "string" && st.img.length < 60000
								? st.img
								: undefined,
					};
				})
				.filter(Boolean);
		}

		// Sanitize extra spreads
		if (Array.isArray(raw.spreads)) {
			clean.spreads = raw.spreads
				.slice(0, 10)
				.map((sp, idx) => {
					if (!sp || typeof sp !== "object") return null;
					return {
						d: typeof sp.d === "string" ? sp.d.slice(0, 20) : clean.d,
						t:
							typeof sp.t === "string"
								? sp.t.slice(0, 140)
								: `Chapter ${idx + 2}`,
						b: typeof sp.b === "string" ? sp.b.slice(0, 20000) : "",
						lt: typeof sp.lt === "string" ? sp.lt.slice(0, 140) : "",
						lb: typeof sp.lb === "string" ? sp.lb.slice(0, 15000) : "",
					};
				})
				.filter(Boolean);
		}

		// Sanitize doodle strokes: [color, width, isHighlighter, [x0, y0, ...]]
		if (Array.isArray(raw.dr)) {
			clean.dr = raw.dr
				.slice(0, 160)
				.map((stroke) => {
					if (!Array.isArray(stroke) || stroke.length < 4) return null;
					const [color, width, isHighlighter, points] = stroke;
					if (
						typeof color !== "string" ||
						typeof width !== "number" ||
						!Array.isArray(points)
					)
						return null;
					return [
						color.slice(0, 30),
						Math.max(1, Math.min(40, Math.round(width))),
						Boolean(isHighlighter) ? 1 : 0,
						points
							.slice(0, 600)
							.map((pt) =>
								typeof pt === "number" && Number.isFinite(pt)
									? Math.round(pt)
									: 0,
							),
					];
				})
				.filter(Boolean);
		}

		return clean;
	}

	/**
	 * Encodes a journal state object into a URL hash string '#d=...'.
	 * @param {object} state
	 * @returns {string}
	 */
	function encodeStateToHash(state) {
		const clean = sanitizeState(state);
		const jsonString = JSON.stringify(clean);
		const compressed = compressToUrlSafe(jsonString);
		return `#d=${compressed}`;
	}

	/**
	 * Decodes a URL hash string or full URL into a clean journal state object.
	 * If invalid, returns null.
	 * @param {string} urlOrHash
	 * @returns {object|null}
	 */
	function decodeHashToState(urlOrHash) {
		if (!urlOrHash || typeof urlOrHash !== "string") return null;

		let hashPart = "";
		const hashIndex = urlOrHash.indexOf("#");
		if (hashIndex !== -1) {
			hashPart = urlOrHash.slice(hashIndex + 1);
		} else {
			hashPart = urlOrHash;
		}

		// Look for 'd=' parameter
		let compressedData = "";
		if (hashPart.startsWith("d=")) {
			compressedData = hashPart.slice(2);
		} else {
			const match = hashPart.match(/(?:^|[&?])d=([^&]+)/);
			if (match) {
				compressedData = match[1];
			}
		}

		if (!compressedData) return null;

		try {
			const jsonString = decompressFromUrlSafe(compressedData);
			if (!jsonString) return null;
			const parsed = JSON.parse(jsonString);
			return sanitizeState(parsed);
		} catch (e) {
			return null;
		}
	}

	return {
		compressToUrlSafe,
		decompressFromUrlSafe,
		createDefaultState,
		sanitizeState,
		encodeStateToHash,
		decodeHashToState,
	};
});
