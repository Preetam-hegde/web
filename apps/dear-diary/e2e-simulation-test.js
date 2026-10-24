"use strict";

/**
 * Dear Diary — End-to-End & Static Integrity Verification Test
 * Tests:
 * 1. HTML DOM Integrity: verifies every document.getElementById call in script.js exists in index.html
 * 2. User Lifecycle Simulation: typing, task manipulation, habit toggling, sticker placement & tinting
 * 3. Layout and Pagination state machine
 * 4. Compression fidelity, limits, and multi-spread state persistence
 */

const fs = require("fs");
const path = require("path");
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
console.log("🔍 End-to-End Simulation & Static Integrity Tests");
console.log("====================================================\n");

// ── 1. DOM ID Integrity Verification ─────────────────────────────────────────
console.log("1. DOM ID Integrity Verification (index.html vs script.js)");
{
	const indexPath = path.join(__dirname, "index.html");
	const scriptPath = path.join(__dirname, "script.js");

	const indexHtml = fs.readFileSync(indexPath, "utf8");
	const scriptJs = fs.readFileSync(scriptPath, "utf8");

	// Extract all id="..." from index.html
	const idRegex = /id=["']([^"']+)["']/g;
	const htmlIds = new Set();
	let match;
	while ((match = idRegex.exec(indexHtml)) !== null) {
		htmlIds.add(match[1]);
	}

	// Extract all getElementById('...') from script.js
	const getElRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
	const scriptGetIds = new Set();
	while ((match = getElRegex.exec(scriptJs)) !== null) {
		scriptGetIds.add(match[1]);
	}

	console.log(`    Found ${htmlIds.size} IDs in index.html`);
	console.log(
		`    Found ${scriptGetIds.size} getElementById calls in script.js`,
	);

	// Verify all referenced IDs exist
	let missingCount = 0;
	scriptGetIds.forEach((id) => {
		const exists = htmlIds.has(id);
		if (!exists) {
			console.error(`    Missing DOM ID in index.html: "${id}"`);
			missingCount++;
		}
	});

	assert(
		"All DOM IDs referenced in script.js exist in index.html",
		missingCount === 0,
		`Missing count: ${missingCount}`,
	);
}

// ── 2. User Lifecycle Simulation: Dual-Page Writing Flow ──────────────────────
console.log("\n2. User Lifecycle Simulation: Dual-Page Writing Flow");
{
	const state = Codec.createDefaultState();

	// Step A: User writes morning intentions on left page
	state.lt = "Sunrise Intentions & Gratitude";
	state.lb =
		"1. Warm cup of green tea\n2. Quiet morning breeze\n3. Excited to build amazing projects";

	// Step B: User writes evening reflections on right page
	state.t = "Day Well Spent in Focus";
	state.b =
		"Finished building features smoothly. The evening lighting was amber and peaceful.";

	// Step C: User adds priorities to bullet checklist
	state.tasks.push({ id: "t-test-1", text: "Deploy updates", done: true });
	state.tasks.push({
		id: "t-test-2",
		text: "Meditate for 10 minutes",
		done: false,
	});

	// Step D: User toggles habits
	const habitHydrate = state.habits.find((h) => h.name === "Hydrate");
	if (habitHydrate) habitHydrate.done = true;

	// Step E: User switches layout to bullet mode
	state.layout = "bullet";

	// Step F: Encode to URL hash
	const hash = Codec.encodeStateToHash(state);
	assert("Hash generated successfully", hash.startsWith("#d="));

	// Step G: Another user loads the exact URL
	const restored = Codec.decodeHashToState(hash);
	assert("Restored state is non-null", restored !== null);
	assertEquals("Left title matches", restored.lt, state.lt);
	assertEquals("Left body text matches", restored.lb, state.lb);
	assertEquals("Right title matches", restored.t, state.t);
	assertEquals("Right body text matches", restored.b, state.b);
	assertEquals("Layout matches bullet", restored.layout, "bullet");
	assert("Tasks length matches", restored.tasks.length === state.tasks.length);
	assertEquals(
		"Task 1 text and status match",
		restored.tasks[3].text,
		"Deploy updates",
	);
	assertEquals("Task 1 completed flag matches", restored.tasks[3].done, true);
}

// ── 3. SVG Stickers Manipulation & Tinting Simulation ─────────────────────────
console.log("\n3. SVG Stickers Manipulation & Tinting Simulation");
{
	const state = Codec.createDefaultState();
	const availableSvgs = [
		"wax-seal",
		"postmark-stamp",
		"monstera-leaf",
		"coffee-latte",
		"heart",
		"star",
		"sparkles",
	];

	availableSvgs.forEach((svgName, index) => {
		state.s.push({
			id: `svg-test-${index}`,
			type: "svg",
			val: svgName,
			color: index % 2 === 0 ? "#b91c1c" : "#16a34a",
			x: 10 + index * 10,
			y: 20 + (index % 3) * 15,
			r: index * 25 - 45,
			sc: 1.2,
			z: index + 1,
		});
	});

	// Verify all SVGs render valid HTML
	let allSvgValid = true;
	state.s
		.filter((s) => s.type === "svg")
		.forEach((st) => {
			const rendered = SvgCatalog.renderSvg(st.val, st.color, 48);
			if (!rendered.includes("<svg") || !rendered.includes("</svg>")) {
				allSvgValid = false;
			}
		});
	assert("All added SVG stickers render valid SVG markup", allSvgValid);

	// Roundtrip through URL Codec
	const hash = Codec.encodeStateToHash(state);
	const restored = Codec.decodeHashToState(hash);
	assert(
		"All 7 SVG stickers preserved in URL state",
		restored.s.filter((s) => s.type === "svg").length >= 7,
	);
	assertEquals(
		"Custom color preserved for wax-seal",
		restored.s.find((s) => s.val === "wax-seal").color,
		"#b91c1c",
	);
	assertEquals(
		"Custom rotation preserved",
		restored.s.find((s) => s.id === "svg-test-2").r,
		5,
	);
}

// ── 4. Multi-Page Spreads Pagination Simulation ──────────────────────────────
console.log("\n4. Multi-Page Spreads Pagination Simulation");
{
	const state = Codec.createDefaultState();

	// Add 3 additional spreads
	state.spreads = [
		{
			d: "2026-10-25",
			t: "Day 2: Mountain Trail",
			b: "Hiked up the rocky ridges under the golden sun.",
			lt: "Trail Equipment",
			lb: "Packed water, apples, and the sketchbook.",
		},
		{
			d: "2026-10-26",
			t: "Day 3: Lakeside Cabin",
			b: "The lake was mirror still. Wrote while listening to the birds.",
			lt: "Cabin Reflections",
			lb: "No Wi-Fi, just pure peace and focus.",
		},
	];
	state.spreadIdx = 1; // viewing spread 2

	const hash = Codec.encodeStateToHash(state);
	const restored = Codec.decodeHashToState(hash);

	assert("Restored extra spreads count is 2", restored.spreads.length === 2);
	assertEquals(
		"Spread 1 title preserved",
		restored.spreads[0].t,
		"Day 2: Mountain Trail",
	);
	assertEquals(
		"Spread 2 left body preserved",
		restored.spreads[1].lb,
		"No Wi-Fi, just pure peace and focus.",
	);
	assertEquals("Active spread index preserved", restored.spreadIdx, 1);
}

// ── 5. Freehand Vector Doodle Serialization & Stroke Smoothing ───────────────
console.log("\n5. Freehand Vector Doodle Serialization & Stroke Smoothing");
{
	const state = Codec.createDefaultState();
	// Add 3 distinct doodle strokes (pen, highlighter, wide brush)
	state.dr = [
		["#2c2523", 3, 0, [50, 50, 60, 55, 75, 65, 90, 80]],
		["#e11d48", 12, 1, [100, 120, 150, 122, 200, 125, 250, 124]],
		["#16a34a", 6, 0, [300, 300, 310, 315, 325, 330]],
	];

	const hash = Codec.encodeStateToHash(state);
	const restored = Codec.decodeHashToState(hash);

	assert("All 3 doodle strokes preserved", restored.dr.length === 3);
	assertEquals("Stroke 1 color matches", restored.dr[0][0], "#2c2523");
	assertEquals("Stroke 2 highlighter flag matches", restored.dr[1][2], 1);
	assertEquals("Stroke 3 point count matches", restored.dr[2][3].length, 6);
}

// ── 6. Font Family and Size Customization Persistence ────────────────────────
console.log("\n6. Font Family and Size Customization Persistence");
{
	const fontOptions = ["handwriting", "serif", "sans", "typewriter"];
	for (const font of fontOptions) {
		const state = Codec.createDefaultState();
		state.font = font;
		state.fontSize = 24;
		const hash = Codec.encodeStateToHash(state);
		const restored = Codec.decodeHashToState(hash);
		assert(`Font ${font} preserved in URL`, restored.font === font);
		assert("Font size 24 preserved in URL", restored.fontSize === 24);
	}
}

console.log("\n====================================================");
console.log(`🏁 Simulation Summary: ${passed} passed, ${failed} failed`);
console.log("====================================================");

if (failed > 0) {
	process.exit(1);
} else {
	process.exit(0);
}
