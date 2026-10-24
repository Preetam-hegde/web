"use strict";

/**
 * Dear Diary — SVG Vector & Stamp Catalog
 * High-quality vector SVG stickers, React/Lucide icon paths, and aesthetic vintage stamps.
 * Pure SVG, zero external CDN dependencies, fully recolorable and scalable.
 */

(function (root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.DiarySvgCatalog = factory();
	}
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
	// Base Lucide/React style stroke icons (viewBox 0 0 24 24, stroke-width 2, round caps)
	const STROKE_ICONS = {
		heart:
			'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
		star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
		sparkles:
			'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
		coffee:
			'<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
		book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/>',
		bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
		feather:
			'<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/>',
		music:
			'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
		camera:
			'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
		sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
		moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
		"cloud-rain":
			'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
		leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
		flame:
			'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
		smile:
			'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
		gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
		palette:
			'<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
		pin: '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
		calendar:
			'<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
		"map-pin":
			'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
		award:
			'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
		"check-circle":
			'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
		scissors:
			'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/>',
		anchor:
			'<circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
		key: '<path d="m21 2-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-1.5-1.5L10 7"/><circle cx="7.5" cy="15.5" r="5.5"/><path d="m11.5 11.5 6.5-6.5"/>',
		bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
		compass:
			'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
		umbrella:
			'<path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
		clock:
			'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		wand: '<path d="m19 2 2 2-2 2-2-2Z"/><path d="m5 16 11-11"/><path d="m15 10 2 2"/><path d="m13 8 2 2"/><path d="m2 22 7-7"/>',
		lightbulb:
			'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
		tag: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><circle cx="7" cy="7" r=".5" fill="currentColor"/>',
		send: '<line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
		"thumbs-up":
			'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/>',
	};

	// Handcrafted decorative badges, wax seals, stamps, and botanical art
	const ART_VECTORS = {
		"wax-seal": {
			viewBox: "0 0 100 100",
			html: `
				<g fill="none" stroke="currentColor">
					<path d="M50 4 C75 3, 95 24, 96 49 C97 74, 76 96, 50 96 C24 96, 4 75, 4 50 C4 24, 25 4, 50 4 Z" fill="currentColor" fill-opacity="0.18" stroke-width="4"/>
					<circle cx="50" cy="50" r="36" stroke-width="3" stroke-dasharray="4 3"/>
					<circle cx="50" cy="50" r="30" stroke-width="2"/>
					<path d="M50 28 L53 38 L63 38 L55 44 L58 54 L50 48 L42 54 L45 44 L37 38 L47 38 Z" fill="currentColor" stroke-width="1.5"/>
					<path d="M40 68 C45 64, 55 64, 60 68" stroke-width="2.5" stroke-linecap="round"/>
					<circle cx="50" cy="62" r="3" fill="currentColor"/>
				</g>
			`,
		},
		"postmark-stamp": {
			viewBox: "0 0 120 70",
			html: `
				<g fill="none" stroke="currentColor" stroke-width="2">
					<rect x="5" y="5" width="110" height="60" rx="4" stroke-dasharray="3 3"/>
					<circle cx="35" cy="35" r="24"/>
					<circle cx="35" cy="35" r="18" stroke-width="1.5"/>
					<text x="35" y="32" font-size="7" font-weight="bold" fill="currentColor" stroke="none" text-anchor="middle" font-family="sans-serif">DEAR DIARY</text>
					<text x="35" y="42" font-size="6" fill="currentColor" stroke="none" text-anchor="middle" font-family="sans-serif">★ AIR MAIL ★</text>
					<path d="M68 25 C78 20, 88 30, 98 25 C108 20, 114 25, 114 25" stroke-linecap="round"/>
					<path d="M68 35 C78 30, 88 40, 98 35 C108 30, 114 35, 114 35" stroke-linecap="round"/>
					<path d="M68 45 C78 40, 88 50, 98 45 C108 40, 114 45, 114 45" stroke-linecap="round"/>
				</g>
			`,
		},
		"monstera-leaf": {
			viewBox: "0 0 80 80",
			html: `
				<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M40 75 Q40 45 40 10" stroke-width="3"/>
					<path d="M40 10 C58 12, 70 30, 68 55 C65 68, 50 72, 40 75 C30 72, 15 68, 12 55 C10 30, 22 12, 40 10 Z" fill="currentColor" fill-opacity="0.15"/>
					<path d="M40 25 C52 28, 62 24, 65 20"/>
					<path d="M40 38 C54 42, 65 38, 67 34"/>
					<path d="M40 50 C52 54, 60 52, 62 48"/>
					<path d="M40 25 C28 28, 18 24, 15 20"/>
					<path d="M40 38 C26 42, 15 38, 13 34"/>
					<path d="M40 50 C28 54, 20 52, 18 48"/>
				</g>
			`,
		},
		"daisy-flower": {
			viewBox: "0 0 80 80",
			html: `
				<g fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2">
					<ellipse cx="40" cy="18" rx="7" ry="14"/>
					<ellipse cx="40" cy="62" rx="7" ry="14"/>
					<ellipse cx="18" cy="40" rx="14" ry="7"/>
					<ellipse cx="62" cy="40" rx="14" ry="7"/>
					<ellipse cx="24" cy="24" rx="14" ry="7" transform="rotate(45 24 24)"/>
					<ellipse cx="56" cy="56" rx="14" ry="7" transform="rotate(45 56 56)"/>
					<ellipse cx="56" cy="24" rx="14" ry="7" transform="rotate(-45 56 24)"/>
					<ellipse cx="24" cy="56" rx="14" ry="7" transform="rotate(-45 24 56)"/>
					<circle cx="40" cy="40" r="11" fill="currentColor" fill-opacity="0.9" stroke="currentColor" stroke-width="2.5"/>
				</g>
			`,
		},
		"coffee-latte": {
			viewBox: "0 0 80 80",
			html: `
				<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<ellipse cx="38" cy="35" rx="26" ry="14" fill="currentColor" fill-opacity="0.15"/>
					<path d="M12 35 C12 60, 24 68, 38 68 C52 68, 64 60, 64 35"/>
					<path d="M64 40 C72 40, 78 44, 76 52 C74 58, 68 60, 60 58"/>
					<path d="M22 72 L54 72" stroke-width="3"/>
					<path d="M38 31 C35 28, 32 30, 32 33 C32 37, 38 41, 38 41 C38 41, 44 37, 44 33 C44 30, 41 28, 38 31 Z" fill="currentColor"/>
					<path d="M28 18 Q30 12, 34 16 Q38 20, 36 24"/>
					<path d="M42 16 Q44 10, 48 14 Q52 18, 50 22"/>
				</g>
			`,
		},
		"cat-doodle": {
			viewBox: "0 0 80 80",
			html: `
				<g fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20 50 C18 36, 26 28, 40 28 C54 28, 62 36, 60 50 C60 62, 50 70, 40 70 C30 70, 20 62, 20 50 Z"/>
					<polygon points="24 34 18 16 32 26" fill="currentColor"/>
					<polygon points="56 34 62 16 48 26" fill="currentColor"/>
					<circle cx="32" cy="46" r="3" fill="currentColor"/>
					<circle cx="48" cy="46" r="3" fill="currentColor"/>
					<path d="M40 52 L38 55 L42 55 Z" fill="currentColor"/>
					<path d="M38 55 Q35 58 32 56"/>
					<path d="M42 55 Q45 58 48 56"/>
					<line x1="22" y1="48" x2="10" y2="46"/>
					<line x1="22" y1="53" x2="10" y2="54"/>
					<line x1="58" y1="48" x2="70" y2="46"/>
					<line x1="58" y1="53" x2="70" y2="54"/>
				</g>
			`,
		},
		"ribbon-banner": {
			viewBox: "0 0 120 40",
			html: `
				<g fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 10 L105 10 L100 28 L15 28 Z"/>
					<polygon points="15 10 2 19 15 28 8 19"/>
					<polygon points="105 10 118 19 105 28 112 19"/>
					<text x="60" y="23" font-size="9" font-weight="bold" fill="currentColor" stroke="none" text-anchor="middle" font-family="sans-serif">CHERISH THIS</text>
				</g>
			`,
		},
		"polaroid-frame": {
			viewBox: "0 0 90 110",
			html: `
				<g fill="#ffffff" stroke="currentColor" stroke-width="2">
					<rect x="5" y="5" width="80" height="100" rx="2" fill="#ffffff" stroke="currentColor" stroke-width="2"/>
					<rect x="12" y="12" width="66" height="66" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.5"/>
					<circle cx="45" cy="40" r="14" fill="none" stroke="currentColor" stroke-width="2"/>
					<path d="M22 66 L38 48 L52 60 L62 52 L74 66 Z" fill="currentColor" fill-opacity="0.3"/>
					<line x1="24" y1="92" x2="66" y2="92" stroke-dasharray="2 3"/>
				</g>
			`,
		},
	};

	/**
	 * Generates an SVG string for a given icon or artwork name.
	 * @param {string} name
	 * @param {string} [color='currentColor']
	 * @param {number} [size=36]
	 * @returns {string}
	 */
	function renderSvg(name, color = "currentColor", size = 36) {
		if (ART_VECTORS[name]) {
			const art = ART_VECTORS[name];
			return `<svg viewBox="${art.viewBox}" width="${size}" height="${size}" style="color:${color}; overflow:visible;" aria-hidden="true">${art.html}</svg>`;
		}

		if (STROKE_ICONS[name]) {
			return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="overflow:visible;" aria-hidden="true">${STROKE_ICONS[name]}</svg>`;
		}

		// Fallback question mark circle
		return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
	}

	/**
	 * Returns a list of all available SVG icons and artworks grouped by category.
	 * @returns {object}
	 */
	function getCategories() {
		return {
			stamps: ["wax-seal", "postmark-stamp", "ribbon-banner", "polaroid-frame"],
			nature: ["leaf", "flower", "monstera-leaf", "daisy-flower", "cat-doodle"],
			cozy: [
				"coffee",
				"coffee-latte",
				"tea-cup",
				"book",
				"bookmark",
				"feather",
				"music",
				"camera",
			],
			celestial: [
				"sparkles",
				"star",
				"sun",
				"moon",
				"cloud-rain",
				"flame",
				"wand",
				"lightbulb",
			],
			lifestyle: [
				"heart",
				"smile",
				"gift",
				"award",
				"check-circle",
				"palette",
				"scissors",
				"pin",
				"calendar",
				"map-pin",
				"anchor",
				"key",
				"bell",
				"compass",
				"umbrella",
				"clock",
				"tag",
				"send",
				"thumbs-up",
			],
		};
	}

	return {
		STROKE_ICONS,
		ART_VECTORS,
		renderSvg,
		getCategories,
	};
});
