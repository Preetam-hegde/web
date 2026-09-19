'use strict';

/**
 * IDLE EMPIRE BUILDER
 * High-performance idle simulation with canvas FX, Web Audio synthesis,
 * prestige mechanics, and real-time telemetry.
 */

// ── Configuration & Data Definitions ────────────────────────
const HOLDING_DEFINITIONS = [
	{
		id: 'micro_apt',
		name: 'Micro Apartment',
		category: 'residential',
		description: 'Compact studio pods for the urban workforce.',
		baseCost: 15,
		baseIncome: 1,
		citizensPerUnit: 2,
		icon: 'fa-house-user'
	},
	{
		id: 'townhouse',
		name: 'Duplex Townhouse',
		category: 'residential',
		description: 'Sleek multi-story duplexes along urban boulevards.',
		baseCost: 100,
		baseIncome: 6,
		citizensPerUnit: 6,
		icon: 'fa-building-user'
	},
	{
		id: 'retail',
		name: 'High-Street Retail',
		category: 'commercial',
		description: 'Boutique storefronts and automated convenience hubs.',
		baseCost: 1100,
		baseIncome: 35,
		citizensPerUnit: 12,
		icon: 'fa-shop'
	},
	{
		id: 'office_park',
		name: 'Office Complex',
		category: 'commercial',
		description: 'Glass-and-steel business suites for corporate enterprise.',
		baseCost: 12000,
		baseIncome: 280,
		citizensPerUnit: 40,
		icon: 'fa-briefcase'
	},
	{
		id: 'tech_incubator',
		name: 'Tech Incubator',
		category: 'industrial',
		description: 'Venture-backed research labs pioneering artificial intelligence.',
		baseCost: 130000,
		baseIncome: 1500,
		citizensPerUnit: 100,
		icon: 'fa-microchip'
	},
	{
		id: 'luxury_hotel',
		name: 'Skyline Resort',
		category: 'commercial',
		description: 'Five-star hotel and luxury casino with panoramic views.',
		baseCost: 1400000,
		baseIncome: 8200,
		citizensPerUnit: 250,
		icon: 'fa-hotel'
	},
	{
		id: 'cyber_lab',
		name: 'Cybernetics Lab',
		category: 'industrial',
		description: 'Next-generation biotech and neuro-prosthetics laboratory.',
		baseCost: 15000000,
		baseIncome: 46000,
		citizensPerUnit: 600,
		icon: 'fa-flask-vial'
	},
	{
		id: 'megatower',
		name: 'Megatower Tower',
		category: 'residential',
		description: 'A kilometer-high arcology piercing the cloud layer.',
		baseCost: 170000000,
		baseIncome: 280000,
		citizensPerUnit: 2000,
		icon: 'fa-city'
	},
	{
		id: 'spaceport',
		name: 'Orbital Spaceport',
		category: 'industrial',
		description: 'Sub-orbital launch facility servicing lunar transit shuttles.',
		baseCost: 2000000000,
		baseIncome: 1800000,
		citizensPerUnit: 8000,
		icon: 'fa-shuttle-space'
	},
	{
		id: 'quantum_nexus',
		name: 'Quantum Core',
		category: 'industrial',
		description: 'Zero-point energy grid powering the planetary metropolis.',
		baseCost: 25000000000,
		baseIncome: 14000000,
		citizensPerUnit: 30000,
		icon: 'fa-atom'
	}
];

const UPGRADE_DEFINITIONS = [
	{
		id: 'upg_solar_micro',
		name: 'Solar Shingles',
		desc: 'Equips Micro Apartments with high-efficiency PV arrays.',
		target: 'micro_apt',
		multiplier: 2,
		cost: 250,
		reqHolding: 'micro_apt',
		reqLevel: 5,
		icon: 'fa-solar-panel'
	},
	{
		id: 'upg_fiber_town',
		name: 'Gigabit Fiber',
		desc: 'Connects Townhouses to high-bandwidth optical trunk lines.',
		target: 'townhouse',
		multiplier: 2,
		cost: 1500,
		reqHolding: 'townhouse',
		reqLevel: 10,
		icon: 'fa-network-wired'
	},
	{
		id: 'upg_auto_retail',
		name: 'Automated Checkout',
		desc: 'Autonomous robotic kiosks double High-Street Retail yields.',
		target: 'retail',
		multiplier: 2,
		cost: 15000,
		reqHolding: 'retail',
		reqLevel: 10,
		icon: 'fa-barcode'
	},
	{
		id: 'upg_ai_office',
		name: 'Algorithmic Management',
		desc: 'Automated logistics and scheduling double Office yields.',
		target: 'office_park',
		multiplier: 2,
		cost: 160000,
		reqHolding: 'office_park',
		reqLevel: 10,
		icon: 'fa-brain'
	},
	{
		id: 'upg_quantum_incubator',
		name: 'Quantum Qubits',
		desc: 'Quantum computing accelerators double Tech Incubator yields.',
		target: 'tech_incubator',
		multiplier: 2,
		cost: 1800000,
		reqHolding: 'tech_incubator',
		reqLevel: 10,
		icon: 'fa-server'
	},
	{
		id: 'upg_sky_bridges',
		name: 'Skyline Gondolas',
		desc: 'Inter-tower passenger transit doubles Skyline Resort income.',
		target: 'luxury_hotel',
		multiplier: 2,
		cost: 20000000,
		reqHolding: 'luxury_hotel',
		reqLevel: 10,
		icon: 'fa-cable-car'
	},
	{
		id: 'upg_neural_lab',
		name: 'Neural Synthesis',
		desc: 'Breakthrough synthetic biology doubles Cyber Lab returns.',
		target: 'cyber_lab',
		multiplier: 2,
		cost: 220000000,
		reqHolding: 'cyber_lab',
		reqLevel: 10,
		icon: 'fa-dna'
	},
	{
		id: 'upg_arcology_core',
		name: 'Arcology Fusion',
		desc: 'Integrated compact fusion reactor doubles Megatower income.',
		target: 'megatower',
		multiplier: 2,
		cost: 2500000000,
		reqHolding: 'megatower',
		reqLevel: 10,
		icon: 'fa-bolt'
	},
	{
		id: 'upg_global_grid',
		name: 'Smart Energy Grid',
		desc: 'Superconducting transmission lines grant +25% global income.',
		target: 'global',
		multiplier: 1.25,
		cost: 50000,
		reqHolding: 'retail',
		reqLevel: 15,
		icon: 'fa-plug-circle-bolt'
	},
	{
		id: 'upg_bullet_trains',
		name: 'Maglev Bullet Network',
		desc: 'Ultra-high-speed city transit boosts all holdings by +30%.',
		target: 'global',
		multiplier: 1.30,
		cost: 500000,
		reqHolding: 'office_park',
		reqLevel: 15,
		icon: 'fa-train-subway'
	},
	{
		id: 'upg_click_dynamo',
		name: 'Kinetic Click Dynamo',
		desc: 'Clicking generates +100% additional revenue.',
		target: 'click',
		multiplier: 2,
		cost: 1000,
		reqHolding: 'micro_apt',
		reqLevel: 10,
		icon: 'fa-fingerprint'
	},
	{
		id: 'upg_syndicate_insider',
		name: 'Venture Syndicate Pact',
		desc: 'High-frequency market arbitrage grants +40% global income.',
		target: 'global',
		multiplier: 1.40,
		cost: 50000000,
		reqHolding: 'luxury_hotel',
		reqLevel: 15,
		icon: 'fa-handshake'
	}
];

const PERK_DEFINITIONS = [
	{
		id: 'perk_seed_capital',
		name: 'Venture Syndicate Seed',
		desc: 'Start every rebirth with +$5,000 capital per rank.',
		baseCost: 1,
		costMult: 2,
		maxRank: 5,
		icon: 'fa-sack-dollar'
	},
	{
		id: 'perk_dividends',
		name: 'Syndicate Dividends',
		desc: 'Boosts all holding cash flow by +15% per rank.',
		baseCost: 2,
		costMult: 2,
		maxRank: 10,
		icon: 'fa-arrow-trend-up'
	},
	{
		id: 'perk_click_synergy',
		name: 'Neural Click Synergy',
		desc: 'Clicking gains +1.5% of total income per second per rank.',
		baseCost: 1,
		costMult: 2,
		maxRank: 5,
		icon: 'fa-bolt-lightning'
	},
	{
		id: 'perk_architect_guild',
		name: 'Architect Guild Discounts',
		desc: 'Reduces all holding base costs by 6% per rank (max 30%).',
		baseCost: 2,
		costMult: 3,
		maxRank: 5,
		icon: 'fa-compass-drafting'
	}
];

const ACHIEVEMENT_DEFINITIONS = [
	{ id: 'ach_first_holding', name: 'First Blueprint', desc: 'Acquire your first property.', icon: 'fa-house' },
	{ id: 'ach_twenty_five', name: 'City Planner', desc: 'Own 25 total properties.', icon: 'fa-building' },
	{ id: 'ach_hundred', name: 'Metropolis Mogul', desc: 'Own 100 total properties.', icon: 'fa-city' },
	{ id: 'ach_ten_k', name: 'Five Figures', desc: 'Accumulate $10,000 in capital.', icon: 'fa-coins' },
	{ id: 'ach_million', name: 'First Million', desc: 'Reach $1,000,000 in lifetime earnings.', icon: 'fa-money-bill-trend-up' },
	{ id: 'ach_billion', name: 'Billionaire Club', desc: 'Reach $1,000,000,000 in lifetime earnings.', icon: 'fa-gem' },
	{ id: 'ach_citizens_thousand', name: 'Population Boom', desc: 'Reach 1,000 metropolitan citizens.', icon: 'fa-users' },
	{ id: 'ach_click_frenzy', name: 'Click Frenzy', desc: 'Reach a 5.0x active click combo.', icon: 'fa-fire' },
	{ id: 'ach_rebirth', name: 'Syndicate Initiate', desc: 'Complete your first Syndicate Rebirth.', icon: 'fa-star' },
	{ id: 'ach_five_upgrades', name: 'Technocrat', desc: 'Research 5 technological upgrades.', icon: 'fa-microchip' },
	{ id: 'ach_megatower', name: 'Touching the Sky', desc: 'Construct a Megatower.', icon: 'fa-monument' },
	{ id: 'ach_space_age', name: 'Space Age', desc: 'Establish an Orbital Spaceport.', icon: 'fa-shuttle-space' }
];

// ── State Management ────────────────────────────────────────
const SAVE_KEY = 'idleEmpireBuilder:v2';

function createDefaultState() {
	const holdings = {};
	HOLDING_DEFINITIONS.forEach((h) => {
		holdings[h.id] = { level: 0 };
	});

	const perks = {};
	PERK_DEFINITIONS.forEach((p) => {
		perks[p.id] = { rank: 0 };
	});

	return {
		money: 50,
		lifetimeEarned: 50,
		totalClicks: 0,
		totalPrestiges: 0,
		prestigeStars: 0,
		prestigeStarsSpent: 0,
		holdings,
		upgrades: {},
		perks,
		achievements: {},
		lastTick: Date.now(),
		soundEnabled: true,
		selectedMultiplier: '1'
	};
}

let state = createDefaultState();

// ── Audio Engine (Web Audio API Synthesizer) ────────────────
let audioContext = null;

function getAudioContext() {
	if (!audioContext && typeof window !== 'undefined') {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (AudioCtx) {
			audioContext = new AudioCtx();
		}
	}
	if (audioContext && audioContext.state === 'suspended') {
		audioContext.resume();
	}
	return audioContext;
}

function playSound(type) {
	if (!state.soundEnabled) return;
	const ctx = getAudioContext();
	if (!ctx) return;

	const now = ctx.currentTime;

	if (type === 'click') {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(600, now);
		osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

		gain.gain.setValueAtTime(0.12, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + 0.05);
	} else if (type === 'buy') {
		// Dual tone chime
		[523.25, 659.25].forEach((freq, idx) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, now + idx * 0.04);

			gain.gain.setValueAtTime(0.15, now + idx * 0.04);
			gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + idx * 0.04);
			osc.stop(now + idx * 0.04 + 0.2);
		});
	} else if (type === 'milestone') {
		// Major chord arpeggio
		[523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, now + idx * 0.06);

			gain.gain.setValueAtTime(0.18, now + idx * 0.06);
			gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + idx * 0.06);
			osc.stop(now + idx * 0.06 + 0.38);
		});
	} else if (type === 'rebirth') {
		// Deep sweep & harmonic chord
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(120, now);
		osc.frequency.exponentialRampToValueAtTime(600, now + 0.8);

		gain.gain.setValueAtTime(0.25, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + 0.9);
	}
}

// ── Math & Economy Calculations ─────────────────────────────
function formatCurrency(val) {
	if (val === null || val === undefined || isNaN(val)) return '$0';
	if (val >= 1e15) return '$' + (val / 1e15).toFixed(2) + 'Q';
	if (val >= 1e12) return '$' + (val / 1e12).toFixed(2) + 'T';
	if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
	if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
	if (val >= 1e3) return '$' + (val / 1e3).toFixed(2) + 'K';
	return '$' + Math.floor(val).toLocaleString();
}

function formatNumber(val) {
	if (val === null || val === undefined || isNaN(val)) return '0';
	if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
	if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
	if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
	if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
	return Math.floor(val).toLocaleString();
}

function calculateHoldingBaseCost(holdingDef) {
	const discountRank = state.perks.perk_architect_guild?.rank || 0;
	const discountMult = 1 - discountRank * 0.06;
	return holdingDef.baseCost * discountMult;
}

function calculateHoldingCost(holdingDef, currentLevel, count) {
	const base = calculateHoldingBaseCost(holdingDef);
	const r = 1.15;
	// Geometric sum: a * r^k * (r^n - 1) / (r - 1)
	const firstTerm = base * Math.pow(r, currentLevel);
	if (count === 1) return Math.floor(firstTerm);
	return Math.floor((firstTerm * (Math.pow(r, count) - 1)) / (r - 1));
}

function calculateMaxAffordable(holdingDef, currentLevel, currentMoney) {
	const base = calculateHoldingBaseCost(holdingDef);
	const r = 1.15;
	const currentPrice = base * Math.pow(r, currentLevel);
	if (currentMoney < currentPrice) return 0;
	// n = floor( log( 1 + currentMoney * (r - 1) / currentPrice ) / log(r) )
	const maxCount = Math.floor(Math.log(1 + (currentMoney * (r - 1)) / currentPrice) / Math.log(r));
	return Math.max(1, maxCount);
}

function calculateHoldingMilestoneMultiplier(level) {
	let mult = 1;
	if (level >= 25) mult *= 2;
	if (level >= 50) mult *= 2;
	if (level >= 100) mult *= 2;
	if (level >= 200) mult *= 4;
	return mult;
}

function getNextMilestone(level) {
	if (level < 25) return { target: 25, boost: '2x' };
	if (level < 50) return { target: 50, boost: '2x' };
	if (level < 100) return { target: 100, boost: '2x' };
	if (level < 200) return { target: 200, boost: '4x' };
	return { target: level + 100, boost: '2x' };
}

function calculateTotalPopulation() {
	let total = 0;
	HOLDING_DEFINITIONS.forEach((h) => {
		const lvl = state.holdings[h.id]?.level || 0;
		total += lvl * h.citizensPerUnit;
	});
	return total;
}

function calculateSynergyMultiplier() {
	// Every citizen gives +0.02% income bonus
	const pop = calculateTotalPopulation();
	return 1 + pop * 0.0002;
}

function calculatePrestigeMultiplier() {
	// Base 10% per star + Syndicate Dividends perk (+15% per rank)
	const starBonus = state.prestigeStars * 0.10;
	const perkRank = state.perks.perk_dividends?.rank || 0;
	const perkBonus = perkRank * 0.15;
	return 1 + starBonus + perkBonus;
}

function calculateGlobalUpgradeMultiplier() {
	let mult = 1;
	UPGRADE_DEFINITIONS.forEach((u) => {
		if (u.target === 'global' && state.upgrades[u.id]) {
			mult *= u.multiplier;
		}
	});
	return mult;
}

function calculateHoldingIncome(holdingDef) {
	const lvl = state.holdings[holdingDef.id]?.level || 0;
	if (lvl === 0) return 0;

	let unitIncome = holdingDef.baseIncome;

	// Upgrades targeting this holding
	UPGRADE_DEFINITIONS.forEach((u) => {
		if (u.target === holdingDef.id && state.upgrades[u.id]) {
			unitIncome *= u.multiplier;
		}
	});

	// Milestones
	unitIncome *= calculateHoldingMilestoneMultiplier(lvl);

	// Global modifiers
	unitIncome *= calculateGlobalUpgradeMultiplier();
	unitIncome *= calculateSynergyMultiplier();
	unitIncome *= calculatePrestigeMultiplier();

	return unitIncome * lvl;
}

function calculateTotalIncomePerSecond() {
	let total = 0;
	HOLDING_DEFINITIONS.forEach((h) => {
		total += calculateHoldingIncome(h);
	});
	return total;
}

// Active Click & Combo Calculations
let clickCombo = 1.0;
let lastClickTime = 0;
const COMBO_TIMEOUT_MS = 1800;

function calculateClickPower() {
	const totalIncome = calculateTotalIncomePerSecond();
	let base = 1;

	// Upgrades targeting click
	UPGRADE_DEFINITIONS.forEach((u) => {
		if (u.target === 'click' && state.upgrades[u.id]) {
			base *= u.multiplier;
		}
	});

	// Neural Click Synergy perk (+1.5% CPS per rank)
	const perkRank = state.perks.perk_click_synergy?.rank || 0;
	const synergyFromIncome = totalIncome * (0.015 * perkRank);

	return (base + synergyFromIncome + totalIncome * 0.005) * clickCombo;
}

function calculatePendingPrestigeStars() {
	// sqrt(lifetimeEarned / 1,000,000)
	if (state.lifetimeEarned < 1000000) return 0;
	const totalEarnable = Math.floor(Math.sqrt(state.lifetimeEarned / 1000000));
	const currentTotal = state.prestigeStars + state.prestigeStarsSpent;
	return Math.max(0, totalEarnable - currentTotal);
}

function calculateNextPrestigeThreshold() {
	const currentEarnable = Math.floor(Math.sqrt(Math.max(0, state.lifetimeEarned) / 1000000));
	const nextStarIndex = currentEarnable + 1;
	return Math.pow(nextStarIndex, 2) * 1000000;
}

// ── Background Canvas FX & Skyline Animation ────────────────
const fxCanvas = document.getElementById('fx');
const fxCtx = fxCanvas.getContext('2d');
let fxW = 0, fxH = 0;
const fxParticles = [];
const fxRings = [];

function resizeFx() {
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	fxW = window.innerWidth;
	fxH = window.innerHeight;
	fxCanvas.width = fxW * dpr;
	fxCanvas.height = fxH * dpr;
	fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnShockwave(x, y, color = '#38bdf8', maxR = 180) {
	fxRings.push({ x, y, r: 5, maxR, color, alpha: 0.8 });
}

function spawnCoinParticle(x, y, text = '+$1') {
	fxParticles.push({
		x,
		y,
		vx: (Math.random() - 0.5) * 60,
		vy: -100 - Math.random() * 80,
		alpha: 1,
		text,
		life: 0.9,
		age: 0
	});
}

function renderFx(dt) {
	fxCtx.clearRect(0, 0, fxW, fxH);

	// Ambient glowing nebula
	const time = Date.now() * 0.0006;
	const grad = fxCtx.createRadialGradient(
		fxW * 0.5 + Math.sin(time) * 100,
		fxH * 0.2 + Math.cos(time) * 60,
		0,
		fxW * 0.5,
		fxH * 0.3,
		fxW * 0.6
	);
	grad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
	grad.addColorStop(0.6, 'rgba(192, 132, 252, 0.02)');
	grad.addColorStop(1, 'transparent');
	fxCtx.fillStyle = grad;
	fxCtx.fillRect(0, 0, fxW, fxH);

	// Update & draw shockwave rings
	for (let i = fxRings.length - 1; i >= 0; i--) {
		const ring = fxRings[i];
		ring.r += dt * 320;
		ring.alpha -= dt * 1.5;
		if (ring.alpha <= 0 || ring.r >= ring.maxR) {
			fxRings.splice(i, 1);
			continue;
		}
		fxCtx.save();
		fxCtx.beginPath();
		fxCtx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
		fxCtx.strokeStyle = ring.color;
		fxCtx.globalAlpha = Math.max(0, ring.alpha);
		fxCtx.lineWidth = 2.5;
		fxCtx.stroke();
		fxCtx.restore();
	}

	// Update & draw text floaters
	for (let i = fxParticles.length - 1; i >= 0; i--) {
		const p = fxParticles[i];
		p.age += dt;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.alpha = 1 - p.age / p.life;

		if (p.age >= p.life) {
			fxParticles.splice(i, 1);
			continue;
		}

		fxCtx.save();
		fxCtx.font = '700 16px "JetBrains Mono", monospace';
		fxCtx.fillStyle = '#ffc247';
		fxCtx.globalAlpha = Math.max(0, p.alpha);
		fxCtx.shadowColor = '#ffc247';
		fxCtx.shadowBlur = 10;
		fxCtx.fillText(p.text, p.x, p.y);
		fxCtx.restore();
	}
}

// ── Skyline Interactive Showcase Canvas ─────────────────────
const skylineCanvas = document.getElementById('skylineCanvas');
const skylineCtx = skylineCanvas.getContext('2d');
let skyW = 0, skyH = 0;
const stars = [];

function initSkylineStars() {
	stars.length = 0;
	for (let i = 0; i < 45; i++) {
		stars.push({
			x: Math.random(),
			y: Math.random() * 0.65,
			size: 1 + Math.random() * 1.8,
			pulseSpeed: 1 + Math.random() * 3,
			baseAlpha: 0.3 + Math.random() * 0.7
		});
	}
}

function resizeSkyline() {
	const rect = skylineCanvas.getBoundingClientRect();
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	skyW = rect.width;
	skyH = rect.height;
	skylineCanvas.width = skyW * dpr;
	skylineCanvas.height = skyH * dpr;
	skylineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
	initSkylineStars();
}

function renderSkyline(dt) {
	skylineCtx.clearRect(0, 0, skyW, skyH);

	const time = Date.now() * 0.001;

	// Sky gradient
	const skyGrad = skylineCtx.createLinearGradient(0, 0, 0, skyH);
	skyGrad.addColorStop(0, '#04040a');
	skyGrad.addColorStop(0.7, '#070b1a');
	skyGrad.addColorStop(1, '#0e1635');
	skylineCtx.fillStyle = skyGrad;
	skylineCtx.fillRect(0, 0, skyW, skyH);

	// Twinkling stars
	stars.forEach((s) => {
		const alpha = s.baseAlpha + Math.sin(time * s.pulseSpeed) * 0.25;
		skylineCtx.fillStyle = `rgba(236, 239, 248, ${Math.max(0.1, alpha)})`;
		skylineCtx.beginPath();
		skylineCtx.arc(s.x * skyW, s.y * skyH, s.size, 0, Math.PI * 2);
		skylineCtx.fill();
	});

	// Skyline silhouettes based on unlocked holdings
	const totalBuildings = Object.values(state.holdings).reduce((acc, h) => acc + h.level, 0);
	const numSilhouettes = 14;
	const colWidth = skyW / numSilhouettes;

	for (let i = 0; i < numSilhouettes; i++) {
		const seed = (i * 9301 + 49297) % 233280;
		const randHeightRatio = 0.35 + (seed / 233280) * 0.55;
		const h = skyH * randHeightRatio;
		const x = i * colWidth;
		const y = skyH - h;

		// Building silhouette
		skylineCtx.fillStyle = i % 2 === 0 ? '#0b1126' : '#080d1e';
		skylineCtx.fillRect(x + 2, y, colWidth - 4, h);

		// Antennas on tall structures
		if (randHeightRatio > 0.65) {
			skylineCtx.strokeStyle = 'rgba(255, 194, 71, 0.7)';
			skylineCtx.lineWidth = 1.5;
			skylineCtx.beginPath();
			skylineCtx.moveTo(x + colWidth / 2, y);
			skylineCtx.lineTo(x + colWidth / 2, y - 18);
			skylineCtx.stroke();

			// Beacon light
			const beaconAlpha = 0.5 + Math.sin(time * 4 + i) * 0.5;
			skylineCtx.fillStyle = `rgba(255, 77, 109, ${beaconAlpha})`;
			skylineCtx.beginPath();
			skylineCtx.arc(x + colWidth / 2, y - 18, 2.5, 0, Math.PI * 2);
			skylineCtx.fill();
		}

		// Windows grid
		const windowRows = Math.floor(h / 14);
		const windowCols = Math.max(1, Math.floor((colWidth - 8) / 10));
		for (let r = 1; r < windowRows - 1; r++) {
			for (let c = 0; c < windowCols; c++) {
				const winSeed = (i * 100 + r * 10 + c) % 17;
				const isLit = winSeed < (totalBuildings > 50 ? 11 : 7);
				if (isLit) {
					const winX = x + 4 + c * 10;
					const winY = y + r * 14;
					const winColor = winSeed % 3 === 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(255, 194, 71, 0.8)';
					skylineCtx.fillStyle = winColor;
					skylineCtx.fillRect(winX, winY, 5, 7);
				}
			}
		}
	}

	// Traffic light streams along the base
	skylineCtx.fillStyle = 'rgba(56, 189, 248, 0.4)';
	skylineCtx.fillRect(0, skyH - 12, skyW, 2);
	skylineCtx.fillStyle = 'rgba(255, 77, 109, 0.4)';
	skylineCtx.fillRect(0, skyH - 6, skyW, 2);
}

// ── UI Rendering & DOM Synchronization ──────────────────────
const displayMoney = document.getElementById('displayMoney');
const displayIncomePerSec = document.getElementById('displayIncomePerSec');
const displayPopulation = document.getElementById('displayPopulation');
const displayWorkforceBonus = document.getElementById('displayWorkforceBonus');
const displayPrestige = document.getElementById('displayPrestige');
const displayPrestigeMult = document.getElementById('displayPrestigeMult');
const displayClickPower = document.getElementById('displayClickPower');
const displayCombo = document.getElementById('displayCombo');

const holdingsGrid = document.getElementById('holdingsGrid');
const upgradesGrid = document.getElementById('upgradesGrid');
const perksGrid = document.getElementById('perksGrid');
const statsKpiGrid = document.getElementById('statsKpiGrid');
const achievementsGrid = document.getElementById('achievementsGrid');
const achieveCount = document.getElementById('achieveCount');

const comboBar = document.getElementById('comboBar');
const comboLabel = document.getElementById('comboLabel');
const upgradesBadge = document.getElementById('upgradesBadge');
const prestigeBadge = document.getElementById('prestigeBadge');

// Topbar tab switching
document.querySelectorAll('.nav-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		const targetTab = btn.getAttribute('data-tab-target');
		switchTab(targetTab);
	});
});

function switchTab(tabId) {
	document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
	document.querySelectorAll('.tab-screen').forEach((s) => s.classList.remove('active'));

	const activeBtn = document.querySelector(`.nav-btn[data-tab-target="${tabId}"]`);
	const activeScreen = document.getElementById(`tab-${tabId}`);

	if (activeBtn) activeBtn.classList.add('active');
	if (activeScreen) activeScreen.classList.add('active');
	document.body.setAttribute('data-tab', tabId);

	if (tabId === 'stats') {
		renderStatsChart();
	}
}

// Purchase multiplier buttons
document.querySelectorAll('.mult-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		document.querySelectorAll('.mult-btn').forEach((b) => b.classList.remove('active'));
		btn.classList.add('active');
		state.selectedMultiplier = btn.getAttribute('data-mult');
		renderHoldings();
	});
});

// Upgrades filter
let currentUpgradeFilter = 'all';
document.querySelectorAll('.filter-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
		btn.classList.add('active');
		currentUpgradeFilter = btn.getAttribute('data-filter');
		renderUpgrades();
	});
});

// Render HUD
function renderHUD() {
	const income = calculateTotalIncomePerSecond();
	const pop = calculateTotalPopulation();
	const synergyPct = ((calculateSynergyMultiplier() - 1) * 100).toFixed(1);
	const prestigeMult = calculatePrestigeMultiplier().toFixed(2);
	const clickPwr = calculateClickPower();

	displayMoney.textContent = formatCurrency(state.money);
	displayIncomePerSec.textContent = `+${formatCurrency(income)}/s`;
	displayPopulation.textContent = formatNumber(pop);
	displayWorkforceBonus.textContent = `+${synergyPct}% Synergy`;
	displayPrestige.textContent = formatNumber(state.prestigeStars);
	displayPrestigeMult.textContent = `${prestigeMult}x Multiplier`;
	displayClickPower.textContent = formatCurrency(clickPwr);
	displayCombo.textContent = `Combo: ${clickCombo.toFixed(1)}x`;

	// Update combo meter in skyline
	const comboPct = Math.min(100, Math.max(0, ((clickCombo - 1) / 4) * 100));
	comboBar.style.setProperty('--combo-pct', `${comboPct}%`);
	comboLabel.textContent = `Combo ${clickCombo.toFixed(1)}x`;

	// Badges
	const availableUpgrades = UPGRADE_DEFINITIONS.filter((u) => {
		const isResearched = state.upgrades[u.id];
		const canAfford = state.money >= u.cost;
		const reqHoldingLvl = state.holdings[u.reqHolding]?.level || 0;
		return !isResearched && canAfford && reqHoldingLvl >= u.reqLevel;
	}).length;

	if (availableUpgrades > 0) {
		upgradesBadge.textContent = availableUpgrades;
		upgradesBadge.hidden = false;
	} else {
		upgradesBadge.hidden = true;
	}

	const pendingStars = calculatePendingPrestigeStars();
	prestigeBadge.hidden = pendingStars <= 0;
}

// Render Holdings List
function renderHoldings() {
	holdingsGrid.innerHTML = '';

	HOLDING_DEFINITIONS.forEach((h) => {
		const lvl = state.holdings[h.id]?.level || 0;
		const unitIncome = calculateHoldingIncome(h) / (lvl || 1);
		const totalIncome = calculateHoldingIncome(h);
		const milestone = getNextMilestone(lvl);

		// Determine count to buy
		let countToBuy = 1;
		if (state.selectedMultiplier === '10') countToBuy = 10;
		else if (state.selectedMultiplier === '100') countToBuy = 100;
		else if (state.selectedMultiplier === 'max') {
			countToBuy = calculateMaxAffordable(h, lvl, state.money);
		}

		const cost = calculateHoldingCost(h, lvl, countToBuy);
		const canAfford = state.money >= cost && countToBuy > 0;

		const card = document.createElement('div');
		card.className = 'holding-card';

		// 3D tilt tracking
		card.addEventListener('mousemove', (e) => {
			const rect = card.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const rx = ((y - centerY) / centerY) * -5;
			const ry = ((x - centerX) / centerX) * 5;
			card.style.setProperty('--rx', `${rx}deg`);
			card.style.setProperty('--ry', `${ry}deg`);
			card.style.setProperty('--mx', `${x}px`);
			card.style.setProperty('--my', `${y}px`);
		});
		card.addEventListener('mouseleave', () => {
			card.style.setProperty('--rx', '0deg');
			card.style.setProperty('--ry', '0deg');
		});

		// Progress towards milestone
		const prevMilestone = milestone.target === 25 ? 0 : milestone.target === 50 ? 25 : milestone.target === 100 ? 50 : 100;
		const progressInTier = Math.max(0, lvl - prevMilestone);
		const tierRange = milestone.target - prevMilestone;
		const progressPct = Math.min(100, Math.round((progressInTier / tierRange) * 100));

		card.innerHTML = `
			<div class="holding-head">
				<div class="holding-identity">
					<div class="holding-icon"><i class="fa-solid ${h.icon}"></i></div>
					<div class="holding-names">
						<h3>${h.name}</h3>
						<p>${h.description}</p>
					</div>
				</div>
				<span class="holding-level-badge">Lvl ${lvl}</span>
			</div>
			<div class="holding-rates">
				<span class="rate-total">+${formatCurrency(totalIncome)}/s</span>
				<span class="rate-per-unit">${formatCurrency(unitIncome)} each</span>
			</div>
			<div class="milestone-progress-wrap">
				<div class="milestone-info">
					<span>Next: Lvl ${milestone.target}</span>
					<span class="milestone-boost-badge">${milestone.boost} Boost</span>
				</div>
				<div class="progress-bar-bg">
					<div class="progress-bar-fill" style="width: ${progressPct}%"></div>
				</div>
			</div>
			<button type="button" class="buy-btn" ${!canAfford ? 'disabled' : ''}>
				<span>Buy ${countToBuy}x</span>
				<span class="cost-tag">${formatCurrency(cost)}</span>
			</button>
		`;

		const buyBtn = card.querySelector('.buy-btn');
		buyBtn.addEventListener('click', () => {
			buyHolding(h, countToBuy, cost);
		});

		holdingsGrid.appendChild(card);
	});
}

function buyHolding(holdingDef, count, cost) {
	if (state.money < cost || count <= 0) return;
	state.money -= cost;
	const oldLvl = state.holdings[holdingDef.id].level;
	state.holdings[holdingDef.id].level += count;
	const newLvl = state.holdings[holdingDef.id].level;

	// Check if crossed milestone
	const oldMilestone = calculateHoldingMilestoneMultiplier(oldLvl);
	const newMilestone = calculateHoldingMilestoneMultiplier(newLvl);
	if (newMilestone > oldMilestone) {
		playSound('milestone');
		triggerToast(`MILESTONE: ${holdingDef.name} BOOSTED!`);
		triggerVignette('#4ade80');
	} else {
		playSound('buy');
	}

	checkAchievements();
	renderHUD();
	renderHoldings();
	renderUpgrades();
	saveGame();
}

// Render Upgrades List
function renderUpgrades() {
	upgradesGrid.innerHTML = '';

	UPGRADE_DEFINITIONS.forEach((u) => {
		const isResearched = !!state.upgrades[u.id];
		const reqHoldingLvl = state.holdings[u.reqHolding]?.level || 0;
		const reqMet = reqHoldingLvl >= u.reqLevel;
		const canAfford = state.money >= u.cost;

		if (currentUpgradeFilter === 'available' && (isResearched || !reqMet)) return;
		if (currentUpgradeFilter === 'researched' && !isResearched) return;

		const card = document.createElement('div');
		card.className = `upgrade-card ${isResearched ? 'researched' : ''}`;

		const reqHoldingDef = HOLDING_DEFINITIONS.find((h) => h.id === u.reqHolding);
		const reqText = reqHoldingDef ? `Req: ${reqHoldingDef.name} Lvl ${u.reqLevel}` : '';

		card.innerHTML = `
			<div class="upgrade-top">
				<div class="upgrade-icon"><i class="fa-solid ${u.icon}"></i></div>
				<h3 class="upgrade-title">${u.name}</h3>
			</div>
			<p class="upgrade-desc">${u.desc}</p>
			<span class="upgrade-req">${reqText}</span>
			${
				isResearched
					? `<span class="researched-tag"><i class="fa-solid fa-check"></i> Researched</span>`
					: `<button type="button" class="research-btn" ${!canAfford || !reqMet ? 'disabled' : ''}>
						<span>Research</span>
						<span>${formatCurrency(u.cost)}</span>
					</button>`
			}
		`;

		if (!isResearched) {
			const resBtn = card.querySelector('.research-btn');
			resBtn.addEventListener('click', () => {
				buyUpgrade(u);
			});
		}

		upgradesGrid.appendChild(card);
	});
}

function buyUpgrade(upgradeDef) {
	if (state.money < upgradeDef.cost || state.upgrades[upgradeDef.id]) return;
	const reqHoldingLvl = state.holdings[upgradeDef.reqHolding]?.level || 0;
	if (reqHoldingLvl < upgradeDef.reqLevel) return;

	state.money -= upgradeDef.cost;
	state.upgrades[upgradeDef.id] = true;
	playSound('milestone');
	triggerToast(`RESEARCH COMPLETE: ${upgradeDef.name}`);
	triggerVignette('#38bdf8');

	checkAchievements();
	renderHUD();
	renderHoldings();
	renderUpgrades();
	saveGame();
}

// Render Prestige Screen
const prestigeCurrentStars = document.getElementById('prestigeCurrentStars');
const prestigeCurrentBonus = document.getElementById('prestigeCurrentBonus');
const prestigePendingStars = document.getElementById('prestigePendingStars');
const prestigeNextStarReq = document.getElementById('prestigeNextStarReq');
const prestigeLifetimeEarned = document.getElementById('prestigeLifetimeEarned');
const prestigeRebirthBtn = document.getElementById('prestigeRebirthBtn');

function renderPrestige() {
	const pending = calculatePendingPrestigeStars();
	const nextReq = calculateNextPrestigeThreshold();
	const starBonusPct = state.prestigeStars * 10;

	prestigeCurrentStars.textContent = formatNumber(state.prestigeStars);
	prestigeCurrentBonus.textContent = `+${starBonusPct}% Income`;
	prestigePendingStars.textContent = `+${formatNumber(pending)}`;
	prestigeNextStarReq.textContent = `Next star at: ${formatCurrency(nextReq)}`;
	prestigeLifetimeEarned.textContent = formatCurrency(state.lifetimeEarned);

	prestigeRebirthBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> <span>Initiate Syndicate Rebirth (+${formatNumber(pending)} Stars)</span>`;
	prestigeRebirthBtn.disabled = pending <= 0;

	// Render Perks Grid
	perksGrid.innerHTML = '';
	PERK_DEFINITIONS.forEach((p) => {
		const currentRank = state.perks[p.id]?.rank || 0;
		const cost = p.baseCost * Math.pow(p.costMult, currentRank);
		const isMax = currentRank >= p.maxRank;
		const canAfford = state.prestigeStars >= cost && !isMax;

		const card = document.createElement('div');
		card.className = 'perk-card';

		card.innerHTML = `
			<div class="perk-head">
				<div class="perk-title-wrap">
					<i class="fa-solid ${p.icon} perk-icon"></i>
					<h4 class="perk-title">${p.name}</h4>
				</div>
				<span class="perk-level-badge">Rank ${currentRank} / ${p.maxRank}</span>
			</div>
			<p class="perk-desc">${p.desc}</p>
			<button type="button" class="perk-buy-btn" ${!canAfford ? 'disabled' : ''}>
				<span>${isMax ? 'MAXED' : 'Upgrade'}</span>
				<span>${isMax ? '' : `${cost} Stars`}</span>
			</button>
		`;

		if (!isMax) {
			const buyBtn = card.querySelector('.perk-buy-btn');
			buyBtn.addEventListener('click', () => {
				buyPerk(p, cost);
			});
		}

		perksGrid.appendChild(card);
	});
}

function buyPerk(perkDef, cost) {
	if (state.prestigeStars < cost) return;
	const currentRank = state.perks[perkDef.id]?.rank || 0;
	if (currentRank >= perkDef.maxRank) return;

	state.prestigeStars -= cost;
	state.prestigeStarsSpent += cost;
	state.perks[perkDef.id].rank++;

	playSound('buy');
	renderHUD();
	renderPrestige();
	saveGame();
}

// Prestige Rebirth Modal & Handler
const rebirthConfirmModal = document.getElementById('rebirthConfirmModal');
const confirmRebirthStars = document.getElementById('confirmRebirthStars');
const rebirthCancelBtn = document.getElementById('rebirthCancelBtn');
const rebirthConfirmBtn = document.getElementById('rebirthConfirmBtn');

prestigeRebirthBtn.addEventListener('click', () => {
	const pending = calculatePendingPrestigeStars();
	if (pending <= 0) return;
	confirmRebirthStars.textContent = `+${formatNumber(pending)} Prestige Stars`;
	rebirthConfirmModal.showModal();
});

rebirthCancelBtn.addEventListener('click', () => {
	rebirthConfirmModal.close();
});

rebirthConfirmBtn.addEventListener('click', () => {
	rebirthConfirmModal.close();
	executeRebirth();
});

function executeRebirth() {
	const pending = calculatePendingPrestigeStars();
	if (pending <= 0) return;

	state.prestigeStars += pending;
	state.totalPrestiges++;

	// Calculate starting seed capital from perk
	const seedRank = state.perks.perk_seed_capital?.rank || 0;
	const startingCapital = 50 + seedRank * 5000;

	// Reset run variables
	state.money = startingCapital;
	HOLDING_DEFINITIONS.forEach((h) => {
		state.holdings[h.id] = { level: 0 };
	});
	state.upgrades = {};

	playSound('rebirth');
	triggerToast(`SYNDICATE REBIRTH: +${pending} STARS!`);
	triggerVignette('#c084fc');

	checkAchievements();
	switchTab('empire');
	renderHUD();
	renderHoldings();
	renderUpgrades();
	renderPrestige();
	saveGame();
}

// ── Interactive Skyline Click Handler ───────────────────────
const skylineClickArea = document.getElementById('skylineClickArea');

skylineClickArea.addEventListener('click', (e) => {
	handleSkylineClick(e);
});

skylineClickArea.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		const rect = skylineClickArea.getBoundingClientRect();
		handleSkylineClick({
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2
		});
	}
});

function handleSkylineClick(e) {
	const now = Date.now();
	if (now - lastClickTime < COMBO_TIMEOUT_MS) {
		clickCombo = Math.min(5.0, clickCombo + 0.1);
	} else {
		clickCombo = 1.0;
	}
	lastClickTime = now;

	const clickGain = calculateClickPower();
	state.money += clickGain;
	state.lifetimeEarned += clickGain;
	state.totalClicks++;

	playSound('click');

	// Screen position for FX
	const x = e.clientX;
	const y = e.clientY;
	spawnShockwave(x, y, '#38bdf8', 120);
	spawnCoinParticle(x, y, `+${formatCurrency(clickGain)}`);

	// Milestone combo celebrations
	if (clickCombo >= 5.0 && Math.random() < 0.25) {
		triggerToast('FRENZY x5!');
		triggerVignette('#ffc247');
	} else if (clickCombo >= 2.0 && clickCombo < 2.15) {
		triggerToast('STREAK x2!');
	}

	checkAchievements();
	renderHUD();
}

// Decaying combo loop
function updateComboDecay() {
	if (Date.now() - lastClickTime > COMBO_TIMEOUT_MS && clickCombo > 1.0) {
		clickCombo = Math.max(1.0, clickCombo - 0.05);
	}
}

// ── Stats Screen & Income History Chart ─────────────────────
const incomeHistory = [];
const MAX_HISTORY_POINTS = 30;
const incomeChart = document.getElementById('incomeChart');
const chartPeakRate = document.getElementById('chartPeakRate');

function updateIncomeHistory() {
	const currentIncome = calculateTotalIncomePerSecond();
	incomeHistory.push(currentIncome);
	if (incomeHistory.length > MAX_HISTORY_POINTS) {
		incomeHistory.shift();
	}
}

function renderStatsChart() {
	if (incomeHistory.length < 2) return;

	const peak = Math.max(1, ...incomeHistory);
	chartPeakRate.textContent = `Peak: ${formatCurrency(peak)}/s`;

	const svgW = 800;
	const svgH = 160;
	const padding = 20;
	const drawW = svgW - padding * 2;
	const drawH = svgH - padding * 2;

	let pathD = '';
	let areaD = '';

	incomeHistory.forEach((val, i) => {
		const x = padding + (i / (incomeHistory.length - 1)) * drawW;
		const y = svgH - padding - (val / peak) * drawH;

		if (i === 0) {
			pathD += `M ${x} ${y}`;
			areaD += `M ${x} ${svgH - padding} L ${x} ${y}`;
		} else {
			pathD += ` L ${x} ${y}`;
			areaD += ` L ${x} ${y}`;
		}

		if (i === incomeHistory.length - 1) {
			areaD += ` L ${x} ${svgH - padding} Z`;
		}
	});

	incomeChart.innerHTML = `
		<defs>
			<linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
				<stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0"/>
			</linearGradient>
		</defs>
		<line class="chart-grid" x1="${padding}" y1="${padding}" x2="${svgW - padding}" y2="${padding}" />
		<line class="chart-grid" x1="${padding}" y1="${svgH / 2}" x2="${svgW - padding}" y2="${svgH / 2}" />
		<line class="chart-grid" x1="${padding}" y1="${svgH - padding}" x2="${svgW - padding}" y2="${svgH - padding}" />
		<path class="chart-area" d="${areaD}" />
		<path class="chart-line" d="${pathD}" />
	`;
}

function renderStatsTelemetry() {
	statsKpiGrid.innerHTML = `
		<div class="kpi-card">
			<small>Lifetime Earned</small>
			<b>${formatCurrency(state.lifetimeEarned)}</b>
		</div>
		<div class="kpi-card">
			<small>Total Clicks</small>
			<b>${formatNumber(state.totalClicks)}</b>
		</div>
		<div class="kpi-card">
			<small>Syndicate Rebirths</small>
			<b>${formatNumber(state.totalPrestiges)}</b>
		</div>
		<div class="kpi-card">
			<small>Active Citizens</small>
			<b>${formatNumber(calculateTotalPopulation())}</b>
		</div>
		<div class="kpi-card">
			<small>Holdings Owned</small>
			<b>${formatNumber(Object.values(state.holdings).reduce((a, b) => a + b.level, 0))}</b>
		</div>
		<div class="kpi-card">
			<small>Prestige Stars</small>
			<b>${formatNumber(state.prestigeStars + state.prestigeStarsSpent)}</b>
		</div>
	`;
}

function renderAchievements() {
	achievementsGrid.innerHTML = '';
	let unlockedCount = 0;

	ACHIEVEMENT_DEFINITIONS.forEach((a) => {
		const isUnlocked = !!state.achievements[a.id];
		if (isUnlocked) unlockedCount++;

		const card = document.createElement('div');
		card.className = `achieve-card ${isUnlocked ? 'unlocked' : ''}`;

		card.innerHTML = `
			<div class="achieve-icon"><i class="fa-solid ${a.icon}"></i></div>
			<div class="achieve-text">
				<h4>${a.name}</h4>
				<p>${a.desc}</p>
			</div>
		`;
		achievementsGrid.appendChild(card);
	});

	achieveCount.textContent = `${unlockedCount} / ${ACHIEVEMENT_DEFINITIONS.length} Unlocked`;
}

function checkAchievements() {
	const totalProps = Object.values(state.holdings).reduce((a, b) => a + b.level, 0);
	const pop = calculateTotalPopulation();

	const tests = [
		{ id: 'ach_first_holding', cond: totalProps >= 1 },
		{ id: 'ach_twenty_five', cond: totalProps >= 25 },
		{ id: 'ach_hundred', cond: totalProps >= 100 },
		{ id: 'ach_ten_k', cond: state.lifetimeEarned >= 10000 },
		{ id: 'ach_million', cond: state.lifetimeEarned >= 1000000 },
		{ id: 'ach_billion', cond: state.lifetimeEarned >= 1000000000 },
		{ id: 'ach_citizens_thousand', cond: pop >= 1000 },
		{ id: 'ach_click_frenzy', cond: clickCombo >= 5.0 },
		{ id: 'ach_rebirth', cond: state.totalPrestiges >= 1 },
		{ id: 'ach_five_upgrades', cond: Object.keys(state.upgrades).length >= 5 },
		{ id: 'ach_megatower', cond: (state.holdings.megatower?.level || 0) >= 1 },
		{ id: 'ach_space_age', cond: (state.holdings.spaceport?.level || 0) >= 1 }
	];

	tests.forEach((t) => {
		if (!state.achievements[t.id] && t.cond) {
			state.achievements[t.id] = true;
			const ach = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === t.id);
			if (ach) {
				playSound('milestone');
				triggerToast(`ACHIEVEMENT: ${ach.name}!`);
				triggerVignette('#ffc247');
			}
			renderAchievements();
		}
	});
}

// ── Screen Toast & Vignette Flashes ─────────────────────────
const toastEl = document.getElementById('toast');
const vigEl = document.getElementById('vig');

function triggerToast(text, duration = 1600) {
	toastEl.textContent = text;
	toastEl.animate(
		[
			{ opacity: 0, transform: 'translate(-50%, -50%) scale(1.8)', filter: 'blur(16px)' },
			{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(0)', offset: 0.25 },
			{ opacity: 0, transform: 'translate(-50%, -65%) scale(0.9)', filter: 'blur(8px)' }
		],
		{ duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
	);
}

function triggerVignette(color = '#ffc247') {
	vigEl.style.setProperty('--vc', color);
	vigEl.animate([{ opacity: 0.5 }, { opacity: 0 }], { duration: 450 });
}

// ── Audio & Settings Toggles ────────────────────────────────
const audioToggle = document.getElementById('audioToggle');
const audioIcon = document.getElementById('audioIcon');

function updateAudioIcon() {
	if (state.soundEnabled) {
		audioIcon.className = 'fa-solid fa-volume-high';
	} else {
		audioIcon.className = 'fa-solid fa-volume-xmark';
	}
}

audioToggle.addEventListener('click', () => {
	state.soundEnabled = !state.soundEnabled;
	updateAudioIcon();
	saveGame();
});

// ── Data Management (Save, Export, Import, Reset) ───────────
const saveManualBtn = document.getElementById('saveManualBtn');
const exportSaveBtn = document.getElementById('exportSaveBtn');
const importSaveBtn = document.getElementById('importSaveBtn');
const resetGameBtn = document.getElementById('resetGameBtn');

const importModal = document.getElementById('importModal');
const importSaveInput = document.getElementById('importSaveInput');
const importCancelBtn = document.getElementById('importCancelBtn');
const importConfirmBtn = document.getElementById('importConfirmBtn');

function saveGame() {
	state.lastTick = Date.now();
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(state));
	} catch (e) {
		console.warn('LocalStorage error:', e);
	}
}

function loadGame() {
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			state = { ...createDefaultState(), ...parsed };

			// Ensure all holdings exist in save
			HOLDING_DEFINITIONS.forEach((h) => {
				if (!state.holdings[h.id]) state.holdings[h.id] = { level: 0 };
			});
			PERK_DEFINITIONS.forEach((p) => {
				if (!state.perks[p.id]) state.perks[p.id] = { rank: 0 };
			});
		}
	} catch (e) {
		console.warn('Failed to load save:', e);
		state = createDefaultState();
	}
}

saveManualBtn.addEventListener('click', () => {
	saveGame();
	triggerToast('GAME SAVED!');
});

exportSaveBtn.addEventListener('click', () => {
	saveGame();
	const base64Save = btoa(JSON.stringify(state));
	navigator.clipboard.writeText(base64Save).then(() => {
		triggerToast('SAVE COPIED TO CLIPBOARD!');
	}).catch(() => {
		alert('Your save code:\n' + base64Save);
	});
});

importSaveBtn.addEventListener('click', () => {
	importSaveInput.value = '';
	importModal.showModal();
});

importCancelBtn.addEventListener('click', () => {
	importModal.close();
});

importConfirmBtn.addEventListener('click', () => {
	const code = importSaveInput.value.trim();
	if (!code) return;
	try {
		const parsed = JSON.parse(atob(code));
		if (parsed && typeof parsed.money === 'number') {
			state = { ...createDefaultState(), ...parsed };
			saveGame();
			importModal.close();
			triggerToast('SAVE IMPORTED SUCCESSFULLY!');
			renderHUD();
			renderHoldings();
			renderUpgrades();
			renderPrestige();
			renderStatsTelemetry();
			renderAchievements();
		} else {
			alert('Invalid save string format.');
		}
	} catch (e) {
		alert('Failed to parse save string.');
	}
});

resetGameBtn.addEventListener('click', () => {
	if (confirm('Are you sure you want to completely erase your empire and reset all progress?')) {
		localStorage.removeItem(SAVE_KEY);
		state = createDefaultState();
		location.reload();
	}
});

// ── Offline Earnings Calculation ────────────────────────────
const offlineModal = document.getElementById('offlineModal');
const offlineTimeText = document.getElementById('offlineTimeText');
const offlineEarnedText = document.getElementById('offlineEarnedText');
const offlineCollectBtn = document.getElementById('offlineCollectBtn');

function checkOfflineEarnings() {
	const now = Date.now();
	const elapsedSec = (now - state.lastTick) / 1000;

	if (elapsedSec > 10) {
		const incomePerSec = calculateTotalIncomePerSecond();
		if (incomePerSec > 0) {
			const earned = incomePerSec * elapsedSec;
			state.money += earned;
			state.lifetimeEarned += earned;

			const mins = Math.floor(elapsedSec / 60);
			const secs = Math.floor(elapsedSec % 60);
			offlineTimeText.textContent = `Away for ${mins}m ${secs}s`;
			offlineEarnedText.textContent = `+${formatCurrency(earned)}`;

			offlineModal.showModal();
		}
	}
	state.lastTick = now;
}

offlineCollectBtn.addEventListener('click', () => {
	offlineModal.close();
	playSound('buy');
	renderHUD();
	saveGame();
});

// ── Main Game Loop & Telemetry ──────────────────────────────
let lastLoopTime = performance.now();
let historyTimer = 0;
let saveTimer = 0;

function gameLoop(now) {
	const dt = Math.min(0.2, (now - lastLoopTime) / 1000);
	lastLoopTime = now;

	// Passive income accumulation
	const incomePerSec = calculateTotalIncomePerSecond();
	if (incomePerSec > 0) {
		const gained = incomePerSec * dt;
		state.money += gained;
		state.lifetimeEarned += gained;
	}

	// Active combo decay
	updateComboDecay();

	// Telemetry history update (every 1s)
	historyTimer += dt;
	if (historyTimer >= 1.0) {
		historyTimer = 0;
		updateIncomeHistory();
		if (document.body.getAttribute('data-tab') === 'stats') {
			renderStatsChart();
			renderStatsTelemetry();
		}
	}

	// Auto-save every 15s
	saveTimer += dt;
	if (saveTimer >= 15.0) {
		saveTimer = 0;
		saveGame();
	}

	// Render canvas FX & Skyline
	renderFx(dt);
	renderSkyline(dt);

	// Update HUD
	renderHUD();

	requestAnimationFrame(gameLoop);
}

// ── App Initialization ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
	loadGame();
	updateAudioIcon();

	resizeFx();
	resizeSkyline();

	renderHUD();
	renderHoldings();
	renderUpgrades();
	renderPrestige();
	renderStatsTelemetry();
	renderAchievements();

	checkOfflineEarnings();

	window.addEventListener('resize', () => {
		resizeFx();
		resizeSkyline();
	});

	requestAnimationFrame(gameLoop);
});