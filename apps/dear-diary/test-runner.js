"use strict";

/**
 * Dear Diary - CLI Test Runner (Enhanced v2)
 * Validates URL state codec, SVG stickers, dual-page writing, habit trackers, and serialization fidelity.
 */

const Codec = require("./url-codec.js");
const SvgCatalog = require("./svg-catalog.js");

let passed = 0;
let failed = 0;

function assert(description, condition, details = "") {
	if (condition) {
		console.log(`  ✓ PASS: ${description}`);
		passed++;
	} else {
		console.error(
			`  ✗ FAIL: ${description} ${details ? "(" + details + ")" : ""}`,
		);
		failed++;
	}
}

function assertEquals(description, actual, expected) {
	const match = JSON.stringify(actual) === JSON.stringify(expected);
	assert(
		description,
		match,
		`Got: ${JSON.stringify(actual)} | Expected: ${JSON.stringify(expected)}`,
	);
}

console.log("====================================================");
console.log("🧪 Starting Dear Diary Enhanced Test Suite (v2)");
console.log("====================================================\n");

// 1. Basic String Compression & Decompression
console.log("1. Compression Engine (LZW / URL-Safe Base64)");
{
	const samples = [
		"Hello World",
		"Dear Diary, today was lovely! ✨🌸🎨",
		'{"t":"My Summer Day","b":"Paragraph 1\\nParagraph 2","s":[{"id":1,"x":50}]}',
		"A".repeat(500),
		"Special characters: ~!@#$%^&*()_+`-={}|[]\\:\";'<>?,./ \t\n\r",
	];

	for (const sample of samples) {
		const comp = Codec.compressToUrlSafe(sample);
		const decomp = Codec.decompressFromUrlSafe(comp);
		assert(
			`Roundtrip matches for: "${sample.slice(0, 30)}..."`,
			decomp === sample,
		);
		assert(
			`Compressed string is URL-safe [A-Za-z0-9-_]: "${comp.slice(0, 20)}..."`,
			/^[A-Za-z0-9_-]*$/.test(comp),
		);
	}
}

// 2. Default State & State Sanitization
console.log("\n2. Default State & State Sanitization (v2 Dual-Page)");
{
	const def = Codec.createDefaultState();
	assert("Default state has version 2", def.v === 2);
	assert(
		"Default state has title",
		typeof def.t === "string" && def.t.length > 0,
	);
	assert(
		"Default state has left page title and body",
		typeof def.lt === "string" && typeof def.lb === "string",
	);
	assert(
		"Default state has stickers array",
		Array.isArray(def.s) && def.s.length > 0,
	);
	assert(
		"Default state has task list",
		Array.isArray(def.tasks) && def.tasks.length > 0,
	);
	assert(
		"Default state has habits array",
		Array.isArray(def.habits) && def.habits.length > 0,
	);
	assert(
		"Default state has mood and weather",
		Boolean(def.m) && Boolean(def.w),
	);
	assert("Default state layout is dual", def.layout === "dual");

	// Test sanitization of garbage input
	const sanitizedNull = Codec.sanitizeState(null);
	assert(
		"Null input returns valid default state",
		sanitizedNull.v === 2 && sanitizedNull.t === "Evening Story & Reflections",
	);

	const maliciousInput = {
		v: "not-a-number",
		t: '<script>alert("xss")</script>'.repeat(20),
		b: "a".repeat(30000), // beyond limit
		s: Array(200).fill({
			id: "bad",
			x: "infinity",
			y: null,
			r: 999999,
			sc: 100,
		}),
	};
	const clean = Codec.sanitizeState(maliciousInput);
	assert("Title is truncated to safe length", clean.t.length <= 140);
	assert("Body is truncated to safe length", clean.b.length <= 25000);
	assert("Sticker array is clamped to <= 120 items", clean.s.length <= 120);
	assert(
		"Sticker scale is clamped within [0.3, 3.5]",
		clean.s[0].sc <= 3.5 && clean.s[0].sc >= 0.3,
	);
}

// 3. SVG Catalog Verification
console.log("\n3. SVG Vector & Stamp Catalog Engine");
{
	const cats = SvgCatalog.getCategories();
	assert(
		"Categories contains stamps, nature, cozy, celestial, lifestyle",
		Boolean(
			cats.stamps &&
			cats.nature &&
			cats.cozy &&
			cats.celestial &&
			cats.lifestyle,
		),
	);

	const waxSealSvg = SvgCatalog.renderSvg("wax-seal", "#b91c1c", 48);
	assert(
		"Renders wax-seal SVG with valid markup",
		waxSealSvg.includes("<svg") && waxSealSvg.includes('viewBox="0 0 100 100"'),
	);
	assert("Wax-seal SVG has custom color", waxSealSvg.includes("#b91c1c"));

	const heartSvg = SvgCatalog.renderSvg("heart", "#e11d48", 32);
	assert(
		"Renders Lucide heart SVG with valid stroke",
		heartSvg.includes("<svg") && heartSvg.includes('stroke="#e11d48"'),
	);

	const fallbackSvg = SvgCatalog.renderSvg("unknown-icon");
	assert(
		"Renders fallback SVG gracefully without errors",
		fallbackSvg.includes("<svg"),
	);
}

// 4. Full State URL Hash Encoding & Decoding Roundtrip (v2)
console.log("\n4. Full State URL Hash Encoding & Decoding Roundtrip");
{
	const customDiaryState = {
		v: 2,
		t: "Autumn Cafe Memories",
		d: "2026-10-24",
		m: "peaceful",
		w: "rainy",
		th: "sakura",
		p: "dotted",
		font: "serif",
		fontSize: 20,
		layout: "dual",
		lt: "Morning Musings",
		lb: "Grateful for soft rain outside and warm tea in hand.\nPlanned out the upcoming month.",
		tasks: [
			{ id: "tk1", text: "Call grandma", done: true },
			{ id: "tk2", text: "Sketch in notebook", done: false },
		],
		habits: [{ id: "hb1", name: "Water", icon: "💧", done: true }],
		q: "What warm drink comforted you today?",
		b: "I sat beside the window with a warm matcha latte. Raindrops formed little rivers on the glass.\n\nEverything felt calm and still.",
		s: [
			{
				id: "stk-svg-1",
				type: "svg",
				val: "wax-seal",
				color: "#b91c1c",
				x: 18.5,
				y: 22.0,
				r: -6,
				sc: 1.1,
				z: 2,
			},
			{
				id: "stk-svg-2",
				type: "svg",
				val: "coffee",
				color: "#78350f",
				x: 45.0,
				y: 10.0,
				r: 3,
				sc: 1.0,
				z: 1,
			},
			{
				id: "stk-3",
				type: "note",
				val: "Note to self: Slow down and savor afternoons.",
				color: "lavender",
				x: 65.2,
				y: 35.8,
				r: -2,
				sc: 1.05,
				z: 3,
			},
			{
				id: "stk-4",
				type: "polaroid",
				cap: "Matcha & rain",
				val: "polaroid-frame",
				x: 25.0,
				y: 60.0,
				r: 5,
				sc: 1.2,
				z: 4,
			},
		],
		spreads: [
			{
				d: "2026-10-25",
				t: "Next Day Adventures",
				b: "The rain cleared up and the sun came out...",
				lt: "Morning Walk",
				lb: "Watched the golden autumn leaves.",
			},
		],
		dr: [
			["#3b82f6", 4, 0, [100, 150, 105, 155, 110, 160]],
			["#fbbf24", 12, 1, [200, 220, 250, 225, 300, 222]],
		],
	};

	const hash = Codec.encodeStateToHash(customDiaryState);
	assert("Generated hash starts with #d=", hash.startsWith("#d="));
	console.log(`    Hash length: ${hash.length} chars (URL-safe)`);

	// Decode back
	const decoded = Codec.decodeHashToState(hash);
	assert("Decoded state is non-null", decoded !== null);
	assertEquals("Title preserved accurately", decoded.t, customDiaryState.t);
	assertEquals(
		"Left title preserved accurately",
		decoded.lt,
		customDiaryState.lt,
	);
	assertEquals(
		"Left body text preserved accurately",
		decoded.lb,
		customDiaryState.lb,
	);
	assertEquals(
		"Right body text preserved accurately",
		decoded.b,
		customDiaryState.b,
	);
	assertEquals("Font family preserved", decoded.font, "serif");
	assertEquals("Font size preserved", decoded.fontSize, 20);
	assertEquals("Tasks count matches", decoded.tasks.length, 2);
	assertEquals("Habits count matches", decoded.habits.length, 1);
	assertEquals("Extra spreads count matches", decoded.spreads.length, 1);
	assertEquals(
		"Extra spread title preserved",
		decoded.spreads[0].t,
		"Next Day Adventures",
	);
	assert(
		"Stickers count matches",
		decoded.s.length === customDiaryState.s.length,
	);
	assertEquals("Sticker 1 type is svg", decoded.s[0].type, "svg");
	assertEquals("Sticker 1 color preserved", decoded.s[0].color, "#b91c1c");
	assert(
		"Doodles count matches",
		decoded.dr.length === customDiaryState.dr.length,
	);
}

// 5. Backwards Compatibility with v1 States
console.log("\n5. Backwards Compatibility with v1 State Links");
{
	const v1State = {
		v: 1,
		t: "A Pure v1 Entry",
		d: "2026-09-01",
		m: "happy",
		w: "sunny",
		b: "Only single page writing from v1...",
		s: [{ id: "old-1", type: "emoji", val: "🌸", x: 50, y: 50 }],
	};

	const v1Hash = Codec.encodeStateToHash(v1State);
	const restored = Codec.decodeHashToState(v1Hash);
	assert("Restores v1 without throwing errors", restored !== null);
	assert("Upgrades v1 to v2 schema cleanly", restored.v === 2);
	assert("Preserves v1 body text", restored.b === v1State.b);
	assert(
		"Initializes layout to scrapbook for v1",
		restored.layout === "scrapbook",
	);
	assert(
		"Preserves old stickers",
		restored.s.length === 1 && restored.s[0].val === "🌸",
	);
}

// 6. Resilience & Error Handling
console.log("\n6. Resilience, Malformed URLs & Error Recovery");
{
	assert("Decoding null returns null", Codec.decodeHashToState(null) === null);
	assert(
		"Decoding empty string returns null",
		Codec.decodeHashToState("") === null,
	);
	assert(
		"Decoding hash with no d= param returns null",
		Codec.decodeHashToState("#view=spread") === null,
	);
	assert(
		"Decoding corrupted hash returns null without crashing",
		Codec.decodeHashToState("#d=Invalid$#@Garbage") === null,
	);
	assert(
		"Decoding truncated hash returns null without crashing",
		Codec.decodeHashToState("#d=abc") === null,
	);

	// Full URL with query or hash
	const fullUrl =
		"https://preetam-hegde.github.io/web/apps/dear-diary/index.html#d=" +
		Codec.compressToUrlSafe(JSON.stringify({ t: "From Link", b: "Content" }));
	const decodedFromFull = Codec.decodeHashToState(fullUrl);
	assert(
		"Decodes state correctly when given complete URL",
		decodedFromFull && decodedFromFull.t === "From Link",
	);
}

// 7. Compression Efficiency Check
console.log("\n7. Compression Efficiency Metrics (Dual-Page)");
{
	const bigDualEntry = {
		t: "A Wonderful Story of a Long Journey Across the Whispering Woods",
		lt: "Morning Intentions and Checklist for the Quest",
		lb: "Step by step, the mountain trail revealed hidden cascades and forgotten grottos. ".repeat(
			10,
		),
		b: "The autumn leaves fell softly against the weathered stone path. Every step echoed with memories of childhood adventures and dreams yet to unfold. ".repeat(
			10,
		),
		tasks: Array(5)
			.fill(0)
			.map((_, i) => ({
				id: `t-${i}`,
				text: `Daily adventure quest #${i + 1}`,
				done: i % 2 === 0,
			})),
		s: Array(20)
			.fill(0)
			.map((_, i) => ({
				id: `sticker-${i}`,
				type: "svg",
				val: "sparkles",
				color: "#d97757",
				x: (i * 5) % 100,
				y: (i * 4) % 100,
				r: (i * 15) % 180,
				sc: 1,
				z: i + 1,
			})),
	};

	const rawJson = JSON.stringify(Codec.sanitizeState(bigDualEntry));
	const hash = Codec.encodeStateToHash(bigDualEntry);
	const ratio = Math.round((hash.length / rawJson.length) * 100);

	console.log(`    Raw JSON size: ${rawJson.length} bytes`);
	console.log(`    URL Hash size: ${hash.length} bytes`);
	console.log(`    Compression ratio: ${ratio}% of original`);
	assert(
		"Compressed hash fits well within browser 8KB URL limits",
		hash.length < 5000,
	);
}

console.log("\n====================================================");
console.log(`🏁 Test Summary: ${passed} passed, ${failed} failed`);
console.log("====================================================");

if (failed > 0) {
	process.exit(1);
} else {
	process.exit(0);
}
