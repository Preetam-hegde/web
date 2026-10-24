"use strict";

/**
 * ComicClash Heroes Database
 * 16 collectable comic heroes with distinct rarities, synergies, stats, and vector comic art.
 */
const HERO_AFFINITIES = {
	Cosmic: {
		name: "Cosmic",
		icon: "✦",
		color: "#ff0077",
		beats: "Tech",
		desc: "Masters of energy and space. Overwhelms Tech.",
	},
	Tech: {
		name: "Tech",
		icon: "⚙",
		color: "#00e5ff",
		beats: "Brawler",
		desc: "Armed with advanced gadgetry. Outmaneuvers Brawlers.",
	},
	Brawler: {
		name: "Brawler",
		icon: "✊",
		color: "#ff9100",
		beats: "Mystic",
		desc: "Raw physical power and grit. Crushes Mystics.",
	},
	Mystic: {
		name: "Mystic",
		icon: "👁",
		color: "#b026ff",
		beats: "Cosmic",
		desc: "Wielders of arcane and occult secrets. Bends Cosmic.",
	},
};

const HEROES_DATA = [
	// ── 5-STAR MYTHIC / ULTRA RARE (HOLO-FOIL) ──────────────────────────────
	{
		id: "cosmic_sentinel",
		name: "Cosmic Sentinel",
		alias: "The Last Star-Born",
		rarity: 5,
		affinity: "Cosmic",
		baseHp: 980,
		baseAtk: 245,
		baseDef: 85,
		baseSpd: 110,
		quote: "BY THE LIGHT OF A THOUSAND SUNS!",
		bio: "Imbued with the dying light of a collapsed pulsar, Sentinel guards the edge of the known universe against void horrors.",
		basic: {
			name: "Pulsar Punch",
			power: 1.1,
			sfx: "punch",
			desc: "Strikes with concentrated cosmic mass.",
		},
		skill: {
			name: "Solar Barrier",
			cd: 3,
			sfx: "laser",
			desc: "Grants all allies a 30% HP shield for 2 turns.",
		},
		ultimate: {
			name: "Supernova Requiem",
			sfx: "heavy",
			desc: "Unleashes stellar fury: 260% AoE damage to all villains with a 50% stun chance.",
		},
		colors: {
			bg: "#2b0938",
			fg: "#ffe600",
			accent: "#ff0077",
			foil: "linear-gradient(135deg, #ff0077, #ffe600, #00f0ff, #ff0077)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="44" fill="#1a0429" stroke="#ffe600" stroke-width="3"/>
			<polygon points="50,12 55,24 68,26 58,35 61,48 50,41 39,48 42,35 32,26 45,24" fill="#ff0077" stroke="#000" stroke-width="2"/>
			<circle cx="50" cy="50" r="22" fill="#ffe600" stroke="#000" stroke-width="3"/>
			<path d="M36 48 Q50 36 64 48 Q50 60 36 48 Z" fill="#00f0ff" stroke="#000" stroke-width="2"/>
			<line x1="20" y1="50" x2="80" y2="50" stroke="#ffe600" stroke-width="2" stroke-dasharray="2,2"/>
			<circle cx="50" cy="48" r="6" fill="#fff" stroke="#ff0077" stroke-width="2"/>
			<path d="M30 75 Q50 62 70 75 L75 90 Q50 82 25 90 Z" fill="#ff0077" stroke="#000" stroke-width="3"/>
		</svg>`,
	},
	{
		id: "crimson_phantom",
		name: "Crimson Phantom",
		alias: "The Shadow of Noir Alley",
		rarity: 5,
		affinity: "Brawler",
		baseHp: 890,
		baseAtk: 285,
		baseDef: 70,
		baseSpd: 125,
		quote: "THE CITY DEMANDS JUSTICE IN RED!",
		bio: "Prowling the soot-stained rooftops of 1940s New York, the Phantom delivers lethal vigilante retribution under the rain.",
		basic: {
			name: "Twin Caliber",
			power: 1.25,
			sfx: "punch",
			desc: "Fires high-velocity jacketed lead.",
		},
		skill: {
			name: "Smoke Cloak",
			cd: 3,
			sfx: "slash",
			desc: "Increases own Evasion by 45% and grants instant Critical on next hit.",
		},
		ultimate: {
			name: "Red Rain Execution",
			sfx: "heavy",
			desc: "Vanishes into shadows, dealing 380% single-target critical execution damage.",
		},
		colors: {
			bg: "#29060c",
			fg: "#ff2a4b",
			accent: "#ffe0b2",
			foil: "linear-gradient(135deg, #ff2a4b, #2b0308, #ff8000, #ff2a4b)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<rect x="8" y="8" width="84" height="84" rx="10" fill="#1c0307" stroke="#ff2a4b" stroke-width="3"/>
			<ellipse cx="50" cy="38" rx="32" ry="10" fill="#111" stroke="#000" stroke-width="2"/>
			<path d="M32 38 L38 20 Q50 18 62 20 L68 38 Z" fill="#ff2a4b" stroke="#000" stroke-width="3"/>
			<circle cx="50" cy="50" r="16" fill="#f6d3b3" stroke="#000" stroke-width="2"/>
			<path d="M38 48 L62 48 L56 56 L44 56 Z" fill="#000"/>
			<circle cx="44" cy="50" r="3" fill="#ff2a4b"/>
			<circle cx="56" cy="50" r="3" fill="#ff2a4b"/>
			<path d="M30 65 Q50 56 70 65 L76 90 Q50 80 24 90 Z" fill="#c0152b" stroke="#000" stroke-width="3"/>
			<path d="M42 66 L50 86 L58 66 Z" fill="#ffeb3b" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "chronos_prime",
		name: "Chronos Prime",
		alias: "The Master of Minutes",
		rarity: 5,
		affinity: "Mystic",
		baseHp: 920,
		baseAtk: 230,
		baseDef: 95,
		baseSpd: 115,
		quote: "YOUR PAST HAS ALREADY CAUGHT UP TO YOU.",
		bio: "A guardian of the multiversal timeline equipped with an arcane hourglass that can wind seconds backward or fast-forward destiny.",
		basic: {
			name: "Temporal Strike",
			power: 1.05,
			sfx: "laser",
			desc: "Attacks by displacing enemy matter 3 seconds into the past.",
		},
		skill: {
			name: "Time Dilation",
			cd: 3,
			sfx: "laser",
			desc: "Slows all villains by 40% while accelerating ally speed for 2 turns.",
		},
		ultimate: {
			name: "Grand Paradox",
			sfx: "fanfare",
			desc: "Rewinds ally health by 35% and freezes the strongest enemy for 1 full turn.",
		},
		colors: {
			bg: "#1c1705",
			fg: "#ffd700",
			accent: "#00ffff",
			foil: "linear-gradient(135deg, #ffd700, #00ffff, #9d4edd, #ffd700)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="44" fill="#141105" stroke="#ffd700" stroke-width="3"/>
			<circle cx="50" cy="50" r="30" fill="none" stroke="#00e5ff" stroke-width="3" stroke-dasharray="4,4"/>
			<circle cx="50" cy="50" r="20" fill="#241e06" stroke="#ffd700" stroke-width="3"/>
			<line x1="50" y1="50" x2="50" y2="35" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
			<line x1="50" y1="50" x2="62" y2="50" stroke="#00e5ff" stroke-width="3" stroke-linecap="round"/>
			<circle cx="50" cy="50" r="4" fill="#ffd700"/>
			<polygon points="50,6 56,16 44,16" fill="#ffd700" stroke="#000" stroke-width="2"/>
			<polygon points="50,94 56,84 44,84" fill="#ffd700" stroke="#000" stroke-width="2"/>
			<polygon points="6,50 16,56 16,44" fill="#00e5ff" stroke="#000" stroke-width="2"/>
			<polygon points="94,50 84,56 84,44" fill="#00e5ff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "titan_mecha",
		name: "Titan Mecha-X",
		alias: "The Dieselpunk Colossus",
		rarity: 5,
		affinity: "Tech",
		baseHp: 1300,
		baseAtk: 210,
		baseDef: 140,
		baseSpd: 85,
		quote: "STEAM PRESSURE AT MAXIMUM. ENGAGING!",
		bio: "Constructed by underground resistance engineers during the Great Blitz, Mecha-X turns heavy industrial steel into heroic armor.",
		basic: {
			name: "Piston Smash",
			power: 1.15,
			sfx: "punch",
			desc: "Hydraulic punch with massive kinetic energy.",
		},
		skill: {
			name: "Fortress Protocol",
			cd: 3,
			sfx: "punch",
			desc: "Taunts all enemies and reduces incoming damage by 50% for 2 turns.",
		},
		ultimate: {
			name: "Mega Rocket Salvo",
			sfx: "heavy",
			desc: "Opens chassis missile pods: deals 240% AoE explosive damage and shreds enemy armor.",
		},
		colors: {
			bg: "#101d24",
			fg: "#00f0ff",
			accent: "#ff8800",
			foil: "linear-gradient(135deg, #00f0ff, #ff8800, #333344, #00f0ff)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<rect x="10" y="10" width="80" height="80" rx="8" fill="#142129" stroke="#00f0ff" stroke-width="3"/>
			<rect x="25" y="24" width="50" height="42" rx="6" fill="#2d3d47" stroke="#000" stroke-width="3"/>
			<rect x="32" y="36" width="36" height="12" rx="3" fill="#ff4d00" stroke="#000" stroke-width="2"/>
			<line x1="38" y1="42" x2="62" y2="42" stroke="#fff" stroke-width="2"/>
			<circle cx="28" cy="24" r="6" fill="#ffb703" stroke="#000" stroke-width="2"/>
			<circle cx="72" cy="24" r="6" fill="#ffb703" stroke="#000" stroke-width="2"/>
			<rect x="22" y="68" width="56" height="18" fill="#1c2b33" stroke="#000" stroke-width="3"/>
			<line x1="36" y1="68" x2="36" y2="86" stroke="#00f0ff" stroke-width="2"/>
			<line x1="50" y1="68" x2="50" y2="86" stroke="#00f0ff" stroke-width="2"/>
			<line x1="64" y1="68" x2="64" y2="86" stroke="#00f0ff" stroke-width="2"/>
		</svg>`,
	},

	// ── 4-STAR SUPER RARE (GOLD FOIL) ─────────────────────────────────────────
	{
		id: "neon_valkyrie",
		name: "Neon Valkyrie",
		alias: "The Plasma Wing",
		rarity: 4,
		affinity: "Tech",
		baseHp: 820,
		baseAtk: 220,
		baseDef: 75,
		baseSpd: 120,
		quote: "LIGHT THE SKY WITH CYBERNETIC WRATH!",
		bio: "An airborne cybernetic defender equipped with solid-light wings and an overcharged plasma lance.",
		basic: {
			name: "Lance Thrust",
			power: 1.15,
			sfx: "laser",
			desc: "Pierces through single target armor.",
		},
		skill: {
			name: "Plasma Arc",
			cd: 3,
			sfx: "laser",
			desc: "Chains electrical voltage across 2 random enemies.",
		},
		ultimate: {
			name: "Valkyrie Dive",
			sfx: "heavy",
			desc: "Dives from high altitude, dealing 280% damage to front enemy and stunning them.",
		},
		colors: {
			bg: "#081e28",
			fg: "#00ffd5",
			accent: "#ff00aa",
			foil: "linear-gradient(135deg, #00ffd5, #ff00aa, #ffe600)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,12 88,40 76,86 24,86 12,40" fill="#081e28" stroke="#00ffd5" stroke-width="3"/>
			<path d="M12 40 Q30 20 46 36 L30 55 Z" fill="#ff00aa" stroke="#000" stroke-width="2"/>
			<path d="M88 40 Q70 20 54 36 L70 55 Z" fill="#ff00aa" stroke="#000" stroke-width="2"/>
			<circle cx="50" cy="46" r="16" fill="#e0fbfc" stroke="#000" stroke-width="2"/>
			<polygon points="46,42 54,42 50,56" fill="#00ffd5" stroke="#000" stroke-width="2"/>
			<line x1="50" y1="20" x2="50" y2="35" stroke="#ffe600" stroke-width="3"/>
		</svg>`,
	},
	{
		id: "madame_mystica",
		name: "Madame Mystica",
		alias: "The Tarot Sorceress",
		rarity: 4,
		affinity: "Mystic",
		baseHp: 860,
		baseAtk: 180,
		baseDef: 80,
		baseSpd: 100,
		quote: "THE CARDS FORESEE YOUR DEFEAT.",
		bio: "Keeper of an enchanted 78-card deck drawn from extra-dimensional ley lines.",
		basic: {
			name: "Card Fling",
			power: 1.0,
			sfx: "slash",
			desc: "Hurls razor-sharp glowing tarot cards.",
		},
		skill: {
			name: "Wheel of Fortune",
			cd: 3,
			sfx: "fanfare",
			desc: "Heals the most wounded ally for 35% max HP and boosts their attack.",
		},
		ultimate: {
			name: "The Tower Catastrophe",
			sfx: "heavy",
			desc: "Calls down astrological misfortune: deals 210% AoE damage and lowers enemy defense by 30%.",
		},
		colors: {
			bg: "#250833",
			fg: "#d000ff",
			accent: "#ffe600",
			foil: "linear-gradient(135deg, #d000ff, #ffe600, #ff0077)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#20062b" stroke="#d000ff" stroke-width="3"/>
			<rect x="36" y="22" width="28" height="44" rx="4" fill="#ffe600" stroke="#000" stroke-width="2"/>
			<circle cx="50" cy="44" r="10" fill="#d000ff" stroke="#000" stroke-width="2"/>
			<path d="M44 44 Q50 36 56 44 Q50 52 44 44 Z" fill="#fff"/>
			<circle cx="50" cy="44" r="3" fill="#000"/>
			<circle cx="28" cy="72" r="10" fill="#ff0077" stroke="#000" stroke-width="2"/>
			<circle cx="72" cy="72" r="10" fill="#00e5ff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "iron_fang",
		name: "Iron Fang",
		alias: "The Apex Berserker",
		rarity: 4,
		affinity: "Brawler",
		baseHp: 960,
		baseAtk: 240,
		baseDef: 65,
		baseSpd: 110,
		quote: "FEEL THE BITE OF STEEL CLAWS!",
		bio: "An experimental super-soldier who escaped captivity into the concrete jungle, hunting predators with titanium claws.",
		basic: {
			name: "Serrated Rake",
			power: 1.2,
			sfx: "slash",
			desc: "Rakes target with razor titanium claws.",
		},
		skill: {
			name: "Bloodhound Rush",
			cd: 3,
			sfx: "punch",
			desc: "Rushes target, dealing 160% damage and applying Bleed for 2 turns.",
		},
		ultimate: {
			name: "Berserk Frenzy",
			sfx: "heavy",
			desc: "Unleashes 5 rapid strikes dealing 320% total single-target devastation.",
		},
		colors: {
			bg: "#291807",
			fg: "#ff6600",
			accent: "#ffd700",
			foil: "linear-gradient(135deg, #ff6600, #ffd700, #ff1a1a)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,14 84,36 74,84 26,84 16,36" fill="#241405" stroke="#ff6600" stroke-width="3"/>
			<path d="M30 40 L44 60 L36 62 Z" fill="#ffeb3b" stroke="#000" stroke-width="2"/>
			<path d="M70 40 L56 60 L64 62 Z" fill="#ffeb3b" stroke="#000" stroke-width="2"/>
			<line x1="32" y1="30" x2="48" y2="48" stroke="#ff1744" stroke-width="3"/>
			<line x1="42" y1="26" x2="58" y2="44" stroke="#ff1744" stroke-width="3"/>
			<line x1="52" y1="24" x2="68" y2="42" stroke="#ff1744" stroke-width="3"/>
			<polygon points="50,62 42,74 58,74" fill="#fff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "dr_voltage",
		name: "Dr. Voltage",
		alias: "The Tesla Sorcerer",
		rarity: 4,
		affinity: "Cosmic",
		baseHp: 780,
		baseAtk: 235,
		baseDef: 70,
		baseSpd: 115,
		quote: "SCIENCE CANNOT BE CONTAINED!",
		bio: "A renegade electro-physicist who harnesses raw atmospheric lightning through wearable Tesla coils.",
		basic: {
			name: "Spark Arc",
			power: 1.1,
			sfx: "laser",
			desc: "Fires crackling high-voltage current.",
		},
		skill: {
			name: "Capacitor Overcharge",
			cd: 3,
			sfx: "laser",
			desc: "Boosts entire team’s critical hit chance by 30% for 2 turns.",
		},
		ultimate: {
			name: "Thunderstorm Matrix",
			sfx: "heavy",
			desc: "Calls down thunderbolt grid: 250% AoE damage with a chance to shock enemies.",
		},
		colors: {
			bg: "#081729",
			fg: "#00c3ff",
			accent: "#ffff00",
			foil: "linear-gradient(135deg, #00c3ff, #ffff00, #ff00bb)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#081524" stroke="#00c3ff" stroke-width="3"/>
			<polygon points="50,15 36,48 54,48 44,85 70,42 52,42" fill="#ffea00" stroke="#000" stroke-width="3"/>
			<circle cx="28" cy="30" r="7" fill="#00e5ff" stroke="#000" stroke-width="2"/>
			<circle cx="72" cy="30" r="7" fill="#00e5ff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},

	// ── 3-STAR RARE (SILVER FOIL) ─────────────────────────────────────────────
	{
		id: "shadow_blade",
		name: "Shadow Blade",
		alias: "The Silent Kunai",
		rarity: 3,
		affinity: "Brawler",
		baseHp: 720,
		baseAtk: 195,
		baseDef: 60,
		baseSpd: 130,
		quote: "A shadow leaves no footprints.",
		bio: "Infiltrator trained by ancient shinobi clans to dismantle modern criminal syndicates.",
		basic: {
			name: "Twin Kunai",
			power: 1.1,
			sfx: "slash",
			desc: "Strikes with balanced throwing knives.",
		},
		skill: {
			name: "Smoke Veil",
			cd: 3,
			sfx: "slash",
			desc: "Evades next incoming single-target attack.",
		},
		ultimate: {
			name: "Thousand Petals",
			sfx: "heavy",
			desc: "Deals 260% critical blade damage to lowest health enemy.",
		},
		colors: {
			bg: "#161921",
			fg: "#90caf9",
			accent: "#ff4081",
			foil: "linear-gradient(135deg, #cfd8dc, #90a4ae, #eceff1)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<rect x="14" y="14" width="72" height="72" rx="8" fill="#13161c" stroke="#90a4ae" stroke-width="3"/>
			<polygon points="50,22 62,48 50,44 38,48" fill="#e0e0e0" stroke="#000" stroke-width="2"/>
			<line x1="50" y1="44" x2="50" y2="76" stroke="#455a64" stroke-width="4"/>
			<circle cx="50" cy="80" r="5" fill="#ff4081" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "blast_radius",
		name: "Blast Radius",
		alias: "The Heavy Bombardier",
		rarity: 3,
		affinity: "Tech",
		baseHp: 800,
		baseAtk: 200,
		baseDef: 65,
		baseSpd: 95,
		quote: "STAND BACK! SHE GOES BOOM!",
		bio: "Ex-demolition specialist who loves loud fireworks and rocket propulsion.",
		basic: {
			name: "Mortar Shell",
			power: 1.05,
			sfx: "punch",
			desc: "Fires explosive shell.",
		},
		skill: {
			name: "Cluster Bomb",
			cd: 3,
			sfx: "heavy",
			desc: "Deals 130% AoE damage across all front row enemies.",
		},
		ultimate: {
			name: "Big Bertha Cannon",
			sfx: "heavy",
			desc: "Deals 270% explosive damage to target and 100% splash damage to adjacent enemies.",
		},
		colors: {
			bg: "#291811",
			fg: "#ff7043",
			accent: "#ffd54f",
			foil: "linear-gradient(135deg, #b0bec5, #78909c, #eceff1)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#24140e" stroke="#ff7043" stroke-width="3"/>
			<circle cx="48" cy="54" r="22" fill="#212121" stroke="#000" stroke-width="3"/>
			<path d="M56 36 Q64 26 74 24" stroke="#ffeb3b" stroke-width="3" fill="none"/>
			<circle cx="76" cy="22" r="5" fill="#ff1744"/>
		</svg>`,
	},
	{
		id: "aegis_knight",
		name: "Aegis Knight",
		alias: "The Magnetic Bastion",
		rarity: 3,
		affinity: "Mystic",
		baseHp: 940,
		baseAtk: 150,
		baseDef: 110,
		baseSpd: 90,
		quote: "NONE SHALL PASS THIS LINE!",
		bio: "Modern crusader equipped with an electromagnetic shield forged in monastic laboratories.",
		basic: {
			name: "Shield Bash",
			power: 1.0,
			sfx: "punch",
			desc: "Bashes target with heavy composite shield.",
		},
		skill: {
			name: "Iron Phalanx",
			cd: 3,
			sfx: "punch",
			desc: "Shields lowest HP ally for 25% max HP.",
		},
		ultimate: {
			name: "Bastion Nova",
			sfx: "heavy",
			desc: "Taunts enemy team and renders self immune to critical damage for 2 turns.",
		},
		colors: {
			bg: "#122026",
			fg: "#80deea",
			accent: "#ffffff",
			foil: "linear-gradient(135deg, #b0bec5, #cfd8dc, #ffffff)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,14 82,24 74,68 50,86 26,68 18,24" fill="#13242b" stroke="#80deea" stroke-width="3"/>
			<polygon points="50,24 72,32 66,62 50,76 34,62 28,32" fill="#26c6da" stroke="#000" stroke-width="2"/>
			<line x1="50" y1="30" x2="50" y2="70" stroke="#fff" stroke-width="3"/>
			<line x1="36" y1="46" x2="64" y2="46" stroke="#fff" stroke-width="3"/>
		</svg>`,
	},
	{
		id: "apex_ranger",
		name: "Apex Ranger",
		alias: "The Hawk Eye",
		rarity: 3,
		affinity: "Cosmic",
		baseHp: 690,
		baseAtk: 215,
		baseDef: 55,
		baseSpd: 125,
		quote: "One shot. One timeline saved.",
		bio: "Interstellar bounty hunter carrying a graviton long-rifle.",
		basic: {
			name: "Graviton Snipe",
			power: 1.2,
			sfx: "laser",
			desc: "High-precision graviton round.",
		},
		skill: {
			name: "Targeting Reticle",
			cd: 3,
			sfx: "laser",
			desc: "Marks target: they receive 25% bonus damage from all allies.",
		},
		ultimate: {
			name: "Singularity Bullet",
			sfx: "heavy",
			desc: "Fires an armor-piercing shot dealing 310% damage.",
		},
		colors: {
			bg: "#1c1328",
			fg: "#b39ddb",
			accent: "#00e676",
			foil: "linear-gradient(135deg, #cfd8dc, #b0bec5, #eceff1)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#180f24" stroke="#b39ddb" stroke-width="3"/>
			<circle cx="50" cy="50" r="28" fill="none" stroke="#00e676" stroke-width="2"/>
			<line x1="16" y1="50" x2="84" y2="50" stroke="#00e676" stroke-width="2"/>
			<line x1="50" y1="16" x2="50" y2="84" stroke="#00e676" stroke-width="2"/>
			<circle cx="50" cy="50" r="4" fill="#ff1744"/>
		</svg>`,
	},

	// ── 2-STAR COMMON (NEWSPRINT / BRONZE) ────────────────────────────────────
	{
		id: "street_brawler",
		name: "Street Brawler",
		alias: "Knuckle King",
		rarity: 2,
		affinity: "Brawler",
		baseHp: 650,
		baseAtk: 160,
		baseDef: 50,
		baseSpd: 100,
		quote: "Step into the alley and let’s talk!",
		bio: "An honest boxer from Brooklyn who protects his neighborhood bodega with brass knuckles.",
		basic: {
			name: "Haymaker",
			power: 1.0,
			sfx: "punch",
			desc: "Heavy swing to the jaw.",
		},
		skill: {
			name: "Adrenaline Surge",
			cd: 3,
			sfx: "punch",
			desc: "Restores 15% HP to self.",
		},
		ultimate: {
			name: "Concrete Slam",
			sfx: "punch",
			desc: "Deals 200% damage to target.",
		},
		colors: {
			bg: "#2b2118",
			fg: "#d7ccc8",
			accent: "#ff8a65",
			foil: "#d7ccc8",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#241a12" stroke="#d7ccc8" stroke-width="3"/>
			<rect x="30" y="38" width="40" height="28" rx="6" fill="#ff8a65" stroke="#000" stroke-width="2"/>
			<circle cx="38" cy="32" r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>
			<circle cx="46" cy="30" r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>
			<circle cx="54" cy="30" r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>
			<circle cx="62" cy="32" r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>
		</svg>`,
	},
	{
		id: "rookie_cadet",
		name: "Rookie Cadet",
		alias: "Metropolis Patrol",
		rarity: 2,
		affinity: "Tech",
		baseHp: 630,
		baseAtk: 150,
		baseDef: 55,
		baseSpd: 105,
		quote: "Halt in the name of the law!",
		bio: "Fresh academy graduate equipped with standard-issue laser baton and body armor.",
		basic: {
			name: "Stun Baton",
			power: 1.0,
			sfx: "punch",
			desc: "Discharges non-lethal shock.",
		},
		skill: {
			name: "Riot Spray",
			cd: 3,
			sfx: "laser",
			desc: "Reduces enemy attack by 15% for 2 turns.",
		},
		ultimate: {
			name: "Code Red Call",
			sfx: "laser",
			desc: "Deals 190% damage to target.",
		},
		colors: {
			bg: "#121f2b",
			fg: "#90caf9",
			accent: "#ffe082",
			foil: "#90caf9",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#0f1924" stroke="#90caf9" stroke-width="3"/>
			<polygon points="50,20 62,32 78,34 66,46 70,62 50,54 30,62 34,46 22,34 38,32" fill="#ffe082" stroke="#000" stroke-width="2"/>
			<circle cx="50" cy="40" r="6" fill="#1976d2"/>
		</svg>`,
	},
	{
		id: "grease_monkey",
		name: "Grease Monkey",
		alias: "Pit Crew Tinkerer",
		rarity: 2,
		affinity: "Tech",
		baseHp: 680,
		baseAtk: 140,
		baseDef: 60,
		baseSpd: 95,
		quote: "A little torque fixes everything!",
		bio: "Scrapyard mechanic who weaponized automotive air compressors and titanium wrenches.",
		basic: {
			name: "Heavy Wrench",
			power: 1.0,
			sfx: "punch",
			desc: "Solid blow with an adjustable wrench.",
		},
		skill: {
			name: "Patch-Up Spray",
			cd: 3,
			sfx: "fanfare",
			desc: "Heals target ally for 20% max HP.",
		},
		ultimate: {
			name: "Nitro Overdrive",
			sfx: "laser",
			desc: "Increases all allies’ speed by 25% for 2 turns.",
		},
		colors: {
			bg: "#2b261b",
			fg: "#ffe082",
			accent: "#ff7043",
			foil: "#ffe082",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#211d14" stroke="#ffe082" stroke-width="3"/>
			<path d="M30 65 L60 35 L68 43 L38 73 Z" fill="#b0bec5" stroke="#000" stroke-width="2"/>
			<circle cx="68" cy="32" r="12" fill="#ff7043" stroke="#000" stroke-width="2"/>
			<rect x="64" y="28" width="8" height="8" fill="#211d14"/>
		</svg>`,
	},
	{
		id: "alley_cat",
		name: "Alley Cat",
		alias: "The Rooftop Prowler",
		rarity: 2,
		affinity: "Mystic",
		baseHp: 600,
		baseAtk: 175,
		baseDef: 45,
		baseSpd: 135,
		quote: "Too fast for your clumsy hands!",
		bio: "A nimble cat burglar who steals relics from greedy billionaires to feed orphanages.",
		basic: {
			name: "Quick Scratch",
			power: 1.05,
			sfx: "slash",
			desc: "Deals rapid claw slashes.",
		},
		skill: {
			name: "Feline Reflexes",
			cd: 3,
			sfx: "slash",
			desc: "Increases own Evasion by 30% for 2 turns.",
		},
		ultimate: {
			name: "Nine Lives Leap",
			sfx: "heavy",
			desc: "Deals 210% critical damage to single target.",
		},
		colors: {
			bg: "#211226",
			fg: "#ce93d8",
			accent: "#ff4081",
			foil: "#ce93d8",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#190d1c" stroke="#ce93d8" stroke-width="3"/>
			<polygon points="32,24 44,42 26,42" fill="#ff4081" stroke="#000" stroke-width="2"/>
			<polygon points="68,24 74,42 56,42" fill="#ff4081" stroke="#000" stroke-width="2"/>
			<ellipse cx="50" cy="58" rx="24" ry="18" fill="#ce93d8" stroke="#000" stroke-width="2"/>
			<circle cx="42" cy="54" r="3" fill="#000"/>
			<circle cx="58" cy="54" r="3" fill="#000"/>
			<polygon points="50,60 46,64 54,64" fill="#ff4081"/>
		</svg>`,
	},

	// ── EXPANSION: SERIES 1 — WAVE 2 HEROES ───────────────────────────────────
	{
		id: "nova_empress",
		name: "Nova Empress",
		alias: "The Solar Regent",
		rarity: 5,
		affinity: "Cosmic",
		baseHp: 1000,
		baseAtk: 235,
		baseDef: 90,
		baseSpd: 112,
		quote: "KNEEL BEFORE THE DAWN!",
		bio: "Crowned by a dying sun, the Empress commands radiant starfire and shields her allies in living light.",
		basic: { name: "Corona Lash", power: 1.1, sfx: "laser", desc: "Whips a ribbon of solar plasma." },
		skill: { name: "Dawn Aegis", cd: 3, sfx: "laser", desc: "Shields all allies for 20% HP and boosts their attack for 2 turns." },
		ultimate: { name: "Solar Coronation", sfx: "heavy", desc: "270% AoE starfire that also heals the squad for 20% max HP." },
		colors: {
			bg: "#2e1604",
			fg: "#ffd54f",
			accent: "#ff9100",
			foil: "linear-gradient(135deg, #ffd54f, #ff9100, #ff4081, #ffd54f)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="44" fill="#2a1203" stroke="#ffd54f" stroke-width="3"/>
			<polygon points="50,4 56,22 74,10 66,30 90,32 70,44 86,62 64,58 62,82 50,66 38,82 36,58 14,62 30,44 10,32 34,30 26,10 44,22" fill="#ff9100" stroke="#000" stroke-width="2"/>
			<circle cx="50" cy="48" r="18" fill="#ffe082" stroke="#000" stroke-width="3"/>
			<path d="M36 40 L42 28 L50 38 L58 28 L64 40 Z" fill="#ffd54f" stroke="#000" stroke-width="2"/>
			<circle cx="44" cy="50" r="3" fill="#000"/><circle cx="56" cy="50" r="3" fill="#000"/>
			<path d="M44 58 Q50 63 56 58" stroke="#000" stroke-width="2" fill="none"/>
		</svg>`,
	},
	{
		id: "ghost_circuit",
		name: "Ghost Circuit",
		alias: "The Haunted Machine",
		rarity: 5,
		affinity: "Tech",
		baseHp: 880,
		baseAtk: 290,
		baseDef: 68,
		baseSpd: 128,
		quote: "DELETE... EVERYTHING.",
		bio: "A rogue AI that jumped into a spectral exo-frame, haunting every network and killing the lights in the city.",
		basic: { name: "Packet Slash", power: 1.2, sfx: "slash", desc: "Cuts with a blade of corrupted data." },
		skill: { name: "Root Access", cd: 3, sfx: "laser", desc: "Hacks a target, lowering its defense for 2 turns." },
		ultimate: { name: "Blue Screen of Death", sfx: "heavy", desc: "360% critical armor-piercing strike on one enemy." },
		colors: {
			bg: "#04141a",
			fg: "#00ffb3",
			accent: "#7c4dff",
			foil: "linear-gradient(135deg, #00ffb3, #7c4dff, #00e5ff, #00ffb3)",
		},
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<rect x="8" y="8" width="84" height="84" rx="10" fill="#06161c" stroke="#00ffb3" stroke-width="3"/>
			<path d="M26 82 L26 40 Q26 18 50 18 Q74 18 74 40 L74 82 L62 72 L50 82 L38 72 Z" fill="#e0f7fa" stroke="#000" stroke-width="3"/>
			<rect x="34" y="36" width="12" height="12" fill="#00ffb3" stroke="#000" stroke-width="2"/>
			<rect x="54" y="36" width="12" height="12" fill="#00ffb3" stroke="#000" stroke-width="2"/>
			<line x1="34" y1="60" x2="66" y2="60" stroke="#7c4dff" stroke-width="3" stroke-dasharray="4,3"/>
		</svg>`,
	},
	{
		id: "jade_tempest",
		name: "Jade Tempest",
		alias: "The Storm Monk",
		rarity: 4,
		affinity: "Brawler",
		baseHp: 900,
		baseAtk: 238,
		baseDef: 72,
		baseSpd: 118,
		quote: "THE STORM HAS NO MASTER!",
		bio: "A temple guardian who channels typhoon winds through her fists and staff.",
		basic: { name: "Gale Palm", power: 1.15, sfx: "punch", desc: "A thunderclap palm strike." },
		skill: { name: "Twin Cyclone", cd: 3, sfx: "slash", desc: "Strikes two enemies with spinning winds." },
		ultimate: { name: "Eye of the Storm", sfx: "heavy", desc: "Four rapid typhoon strikes for 300% total damage, 50% stun chance." },
		colors: { bg: "#06251c", fg: "#00e676", accent: "#b9f6ca", foil: "linear-gradient(135deg, #00e676, #b9f6ca, #00bfa5)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#06251c" stroke="#00e676" stroke-width="3"/>
			<path d="M50 14 Q80 20 76 46 Q72 70 50 72 Q36 72 34 58 Q34 46 48 46 Q58 46 58 56" fill="none" stroke="#b9f6ca" stroke-width="6" stroke-linecap="round"/>
			<circle cx="50" cy="82" r="7" fill="#00e676" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "glitch_queen",
		name: "Glitch Queen",
		alias: "The Pixel Pirate",
		rarity: 4,
		affinity: "Tech",
		baseHp: 800,
		baseAtk: 225,
		baseDef: 70,
		baseSpd: 122,
		quote: "ERROR 404: YOUR HOPE NOT FOUND!",
		bio: "A hacker-idol who broadcasts malware as music, scrambling enemy targeting.",
		basic: { name: "Static Burst", power: 1.05, sfx: "laser", desc: "Fires a burst of scrambled signal." },
		skill: { name: "Signal Jam", cd: 3, sfx: "laser", desc: "Hits all enemies and lowers their attack for 2 turns." },
		ultimate: { name: "Total System Crash", sfx: "heavy", desc: "230% AoE damage and shreds all enemy defense." },
		colors: { bg: "#220a30", fg: "#ff4dff", accent: "#00ffe5", foil: "linear-gradient(135deg, #ff4dff, #00ffe5, #ffee00)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,10 90,50 50,90 10,50" fill="#220a30" stroke="#ff4dff" stroke-width="3"/>
			<rect x="30" y="32" width="40" height="30" fill="#00ffe5" stroke="#000" stroke-width="2"/>
			<rect x="36" y="40" width="10" height="8" fill="#000"/><rect x="54" y="40" width="10" height="8" fill="#000"/>
			<rect x="26" y="52" width="14" height="6" fill="#ff4dff"/><rect x="60" y="36" width="16" height="6" fill="#ffee00"/>
		</svg>`,
	},
	{
		id: "lunar_oracle",
		name: "Lunar Oracle",
		alias: "The Moonlit Seer",
		rarity: 4,
		affinity: "Mystic",
		baseHp: 880,
		baseAtk: 170,
		baseDef: 85,
		baseSpd: 100,
		quote: "THE MOON HAS ALREADY FORGIVEN YOU.",
		bio: "A healer who reads futures in moon-phases and mends wounds with silver light.",
		basic: { name: "Crescent Bolt", power: 0.95, sfx: "laser", desc: "A bolt of pale moonlight." },
		skill: { name: "Silver Tide", cd: 3, sfx: "fanfare", desc: "Heals all allies for 20% max HP." },
		ultimate: { name: "Full Moon Rite", sfx: "fanfare", desc: "Heals allies for 30% max HP and sharpens their critical chance." },
		colors: { bg: "#10132e", fg: "#c5cae9", accent: "#ffe082", foil: "linear-gradient(135deg, #c5cae9, #ffe082, #7986cb)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#10132e" stroke="#c5cae9" stroke-width="3"/>
			<path d="M60 18 A32 32 0 1 0 60 82 A26 26 0 1 1 60 18 Z" fill="#ffe082" stroke="#000" stroke-width="3"/>
			<circle cx="72" cy="30" r="3" fill="#fff"/><circle cx="78" cy="52" r="2" fill="#fff"/><circle cx="68" cy="72" r="3" fill="#fff"/>
		</svg>`,
	},
	{
		id: "frost_warden",
		name: "Frost Warden",
		alias: "The Polar Sentinel",
		rarity: 3,
		affinity: "Cosmic",
		baseHp: 820,
		baseAtk: 185,
		baseDef: 80,
		baseSpd: 95,
		quote: "COLD CALCULATES, STEEL ENDURES.",
		bio: "An arctic ranger carrying a shard of cosmic ice that freezes foes in place.",
		basic: { name: "Ice Shard", power: 1.0, sfx: "laser", desc: "Hurls a jagged shard." },
		skill: { name: "Flash Freeze", cd: 3, sfx: "laser", desc: "Chance to stun the target for a turn." },
		ultimate: { name: "Absolute Zero", sfx: "heavy", desc: "220% AoE damage that weakens enemy attack." },
		colors: { bg: "#08202c", fg: "#80d8ff", accent: "#e1f5fe", foil: "linear-gradient(135deg, #b0bec5, #80d8ff, #eceff1)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#08202c" stroke="#80d8ff" stroke-width="3"/>
			<g stroke="#e1f5fe" stroke-width="4" stroke-linecap="round"><line x1="50" y1="18" x2="50" y2="82"/><line x1="22" y1="34" x2="78" y2="66"/><line x1="22" y1="66" x2="78" y2="34"/></g>
			<circle cx="50" cy="50" r="8" fill="#80d8ff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "rust_hound",
		name: "Rust Hound",
		alias: "The Junkyard Wolf",
		rarity: 3,
		affinity: "Brawler",
		baseHp: 780,
		baseAtk: 205,
		baseDef: 58,
		baseSpd: 112,
		quote: "BITE FIRST. ASK NEVER.",
		bio: "A scrapyard drifter with jagged scrap-metal gauntlets and a bad attitude.",
		basic: { name: "Scrap Claw", power: 1.1, sfx: "slash", desc: "Rakes with rusted blades." },
		skill: { name: "Tetanus Rake", cd: 3, sfx: "slash", desc: "Deals 140% damage and applies Bleed for 2 turns." },
		ultimate: { name: "Junkyard Maul", sfx: "heavy", desc: "260% damage plus Bleed." },
		colors: { bg: "#241a12", fg: "#ffab91", accent: "#bf6a3d", foil: "linear-gradient(135deg, #b0bec5, #bf6a3d, #eceff1)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,12 86,30 80,76 50,88 20,76 14,30" fill="#241a12" stroke="#ffab91" stroke-width="3"/>
			<polygon points="28,24 36,42 22,40" fill="#bf6a3d" stroke="#000" stroke-width="2"/><polygon points="72,24 78,40 64,42" fill="#bf6a3d" stroke="#000" stroke-width="2"/>
			<ellipse cx="50" cy="56" rx="22" ry="18" fill="#8d6e63" stroke="#000" stroke-width="2"/>
			<circle cx="42" cy="52" r="3" fill="#ffee58"/><circle cx="58" cy="52" r="3" fill="#ffee58"/>
			<polygon points="44,66 50,74 56,66" fill="#fff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "paper_boy",
		name: "Paper Boy",
		alias: "The Daily Courier",
		rarity: 2,
		affinity: "Cosmic",
		baseHp: 640,
		baseAtk: 158,
		baseDef: 50,
		baseSpd: 125,
		quote: "EXTRA! EXTRA! YOU LOSE!",
		bio: "A cheerful delivery kid who throws cosmic-folded newspapers with deadly aim.",
		basic: { name: "Rolled Headline", power: 1.0, sfx: "punch", desc: "A tightly rolled newspaper smack." },
		skill: { name: "Bike Dodge", cd: 3, sfx: "slash", desc: "Hits hard and gains one evade charge." },
		ultimate: { name: "Breaking News", sfx: "laser", desc: "Chain-throws papers at two enemies for 190% damage." },
		colors: { bg: "#241f10", fg: "#fff59d", accent: "#ff5252", foil: "#fff59d" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#1d1a0d" stroke="#fff59d" stroke-width="3"/>
			<rect x="26" y="34" width="48" height="34" fill="#fffde7" stroke="#000" stroke-width="2" transform="rotate(-8 50 50)"/>
			<line x1="32" y1="44" x2="66" y2="40" stroke="#000" stroke-width="3"/><line x1="32" y1="52" x2="62" y2="48" stroke="#777" stroke-width="2"/><line x1="32" y1="58" x2="58" y2="55" stroke="#777" stroke-width="2"/>
			<circle cx="70" cy="30" r="8" fill="#ff5252" stroke="#000" stroke-width="2"/>
		</svg>`,
	},

	// ── EXPANSION: SERIES 1 — WAVE 3 HEROES ───────────────────────────────────
	{
		id: "eclipse_knight",
		name: "Eclipse Knight",
		alias: "The Dark Paladin",
		rarity: 5,
		affinity: "Mystic",
		baseHp: 1050,
		baseAtk: 255,
		baseDef: 100,
		baseSpd: 105,
		quote: "LIGHT FADES. I REMAIN.",
		bio: "A paladin who swore an oath to a dying moon, he drinks the strength of his enemies to keep the darkness at bay.",
		basic: { name: "Umbral Cleave", power: 1.15, sfx: "slash", desc: "A sweeping blade of shadow." },
		skill: { name: "Soul Leech", cd: 3, sfx: "slash", desc: "Hits for 150% and heals himself for half of the damage dealt." },
		ultimate: { name: "Eclipse Verdict", sfx: "heavy", desc: "250% AoE shadow damage, weakens enemy attack and heals him from the carnage." },
		colors: { bg: "#120a24", fg: "#c9b6ff", accent: "#7c4dff", foil: "linear-gradient(135deg, #7c4dff, #ffe600, #ff0077, #7c4dff)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="44" fill="#120a24" stroke="#7c4dff" stroke-width="3"/>
			<circle cx="50" cy="44" r="26" fill="#ffe082" stroke="#000" stroke-width="3"/>
			<circle cx="60" cy="40" r="24" fill="#120a24"/>
			<path d="M30 78 L38 48 L50 54 L62 48 L70 78 Z" fill="#37294f" stroke="#000" stroke-width="3"/>
			<path d="M40 40 L46 24 L50 34 L54 24 L60 40 Z" fill="#c9b6ff" stroke="#000" stroke-width="2"/>
			<line x1="76" y1="30" x2="76" y2="82" stroke="#c9b6ff" stroke-width="4"/><polygon points="76,20 82,32 70,32" fill="#c9b6ff" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "volt_viking",
		name: "Volt Viking",
		alias: "The Thunder Berserker",
		rarity: 4,
		affinity: "Brawler",
		baseHp: 940,
		baseAtk: 245,
		baseDef: 70,
		baseSpd: 108,
		quote: "VALHALLA CAN WAIT!",
		bio: "A longship raider who found a lightning-forged hammer in a glacier and has been cracking skulls ever since.",
		basic: { name: "Hammer Swing", power: 1.2, sfx: "punch", desc: "A thunderous overhead smash." },
		skill: { name: "Thunder Clap", cd: 3, sfx: "heavy", desc: "Shockwave hits all enemies with a 30% stun chance." },
		ultimate: { name: "Ragnarok Rush", sfx: "heavy", desc: "Three crushing blows for 300% total with a 60% stun chance." },
		colors: { bg: "#0c1f2e", fg: "#ffd740", accent: "#40c4ff", foil: "linear-gradient(135deg, #40c4ff, #ffd740, #ff5252)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,10 86,32 80,78 50,90 20,78 14,32" fill="#0c1f2e" stroke="#40c4ff" stroke-width="3"/>
			<path d="M28 40 Q50 22 72 40 L70 58 Q50 70 30 58 Z" fill="#ffd740" stroke="#000" stroke-width="3"/>
			<path d="M24 38 L14 24 L30 32 Z M76 38 L86 24 L70 32 Z" fill="#fff" stroke="#000" stroke-width="2"/>
			<circle cx="42" cy="50" r="3" fill="#000"/><circle cx="58" cy="50" r="3" fill="#000"/>
			<polygon points="46,66 54,66 50,86" fill="#ff8f00" stroke="#000" stroke-width="2"/>
			<polygon points="54,12 46,30 52,30 46,46 60,26 53,26" fill="#40c4ff" stroke="#000" stroke-width="1.5"/>
		</svg>`,
	},
	{
		id: "star_pilot",
		name: "Star Pilot",
		alias: "Captain Comet",
		rarity: 4,
		affinity: "Cosmic",
		baseHp: 790,
		baseAtk: 230,
		baseDef: 68,
		baseSpd: 126,
		quote: "ALL HANDS: HOLD ON TO SOMETHING!",
		bio: "A wisecracking freighter captain whose jury-rigged jet pack can outrun a supernova.",
		basic: { name: "Blaster Pistol", power: 1.1, sfx: "laser", desc: "A quick-draw plasma shot." },
		skill: { name: "Jet Boost", cd: 3, sfx: "laser", desc: "Strafes a foe and rushes 25 energy to every ally." },
		ultimate: { name: "Orbital Strike", sfx: "heavy", desc: "Calls down a 300% critical strike that pierces armor." },
		colors: { bg: "#0b1a33", fg: "#ff6e40", accent: "#18ffff", foil: "linear-gradient(135deg, #ff6e40, #18ffff, #ffea00)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#0b1a33" stroke="#18ffff" stroke-width="3"/>
			<circle cx="50" cy="46" r="22" fill="#fff" stroke="#000" stroke-width="3"/>
			<ellipse cx="50" cy="46" rx="16" ry="13" fill="#18ffff" stroke="#000" stroke-width="2"/>
			<path d="M40 40 Q50 34 60 40" stroke="#fff" stroke-width="3" fill="none"/>
			<path d="M36 70 L50 62 L64 70 L58 88 L42 88 Z" fill="#ff6e40" stroke="#000" stroke-width="3"/>
			<circle cx="22" cy="24" r="2" fill="#fff"/><circle cx="80" cy="30" r="2.5" fill="#fff"/><circle cx="74" cy="76" r="2" fill="#fff"/>
		</svg>`,
	},
	{
		id: "venom_vixen",
		name: "Venom Vixen",
		alias: "The Poison Rose",
		rarity: 4,
		affinity: "Mystic",
		baseHp: 800,
		baseAtk: 230,
		baseDef: 65,
		baseSpd: 119,
		quote: "ONE KISS. THAT IS ALL IT TAKES.",
		bio: "A herbalist-turned-assassin who brews hexes from night-blooming roses.",
		basic: { name: "Fang Flick", power: 1.05, sfx: "slash", desc: "Flicks a poisoned hairpin." },
		skill: { name: "Toxic Kiss", cd: 3, sfx: "slash", desc: "Chains poison across two enemies, bleeding them for 3 turns." },
		ultimate: { name: "Black Widow Web", sfx: "heavy", desc: "220% AoE damage, heavy bleed and shredded defense." },
		colors: { bg: "#1a0a26", fg: "#76ff03", accent: "#e040fb", foil: "linear-gradient(135deg, #76ff03, #e040fb, #ffea00)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#1a0a26" stroke="#e040fb" stroke-width="3"/>
			<path d="M50 20 Q74 28 70 54 Q60 78 50 82 Q40 78 30 54 Q26 28 50 20 Z" fill="#76ff03" stroke="#000" stroke-width="3"/>
			<ellipse cx="42" cy="48" rx="5" ry="3" fill="#e040fb" stroke="#000" stroke-width="2"/><ellipse cx="58" cy="48" rx="5" ry="3" fill="#e040fb" stroke="#000" stroke-width="2"/>
			<path d="M42 64 Q50 70 58 64" stroke="#e040fb" stroke-width="3" fill="none"/>
			<circle cx="26" cy="26" r="7" fill="#e040fb" stroke="#000" stroke-width="2"/><circle cx="76" cy="26" r="5" fill="#e040fb" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "clockwork_cop",
		name: "Clockwork Cop",
		alias: "The Brass Badge",
		rarity: 3,
		affinity: "Tech",
		baseHp: 830,
		baseAtk: 180,
		baseDef: 80,
		baseSpd: 98,
		quote: "YOU HAVE THE RIGHT TO REMAIN... TICKING.",
		bio: "A steam-powered patrolman wound up each morning by the whole precinct.",
		basic: { name: "Baton Whirr", power: 1.0, sfx: "punch", desc: "A ratcheting baton blow." },
		skill: { name: "Tick-Tock Cuffs", cd: 3, sfx: "laser", desc: "Locks a foe in brass cuffs with a 60% stun chance." },
		ultimate: { name: "Hour of Justice", sfx: "heavy", desc: "230% damage and marks the target for 2 turns." },
		colors: { bg: "#1f1a0e", fg: "#ffcc80", accent: "#26c6da", foil: "linear-gradient(135deg, #b0bec5, #ffcc80, #eceff1)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#1f1a0e" stroke="#ffcc80" stroke-width="3"/>
			<circle cx="50" cy="52" r="24" fill="#ffcc80" stroke="#000" stroke-width="3"/>
			<line x1="50" y1="52" x2="50" y2="36" stroke="#000" stroke-width="3"/><line x1="50" y1="52" x2="62" y2="56" stroke="#000" stroke-width="3"/>
			<path d="M30 30 Q50 14 70 30 L66 36 L34 36 Z" fill="#26c6da" stroke="#000" stroke-width="3"/>
			<polygon points="50,22 53,28 47,28" fill="#ffee58"/>
		</svg>`,
	},
	{
		id: "hex_doll",
		name: "Hex Doll",
		alias: "The Stitched Sorceress",
		rarity: 3,
		affinity: "Mystic",
		baseHp: 720,
		baseAtk: 190,
		baseDef: 55,
		baseSpd: 112,
		quote: "SEW. SEW. SEW YOUR DOOM.",
		bio: "A patchwork doll animated by a witch's lullaby, linked by thread to everything she hurts.",
		basic: { name: "Pin Prick", power: 1.05, sfx: "slash", desc: "Jabs with a cursed needle." },
		skill: { name: "Voodoo Link", cd: 3, sfx: "laser", desc: "Marks a foe so allies deal 25% more damage to it." },
		ultimate: { name: "Needle Storm", sfx: "heavy", desc: "240% chained damage to two enemies, leaving them bleeding." },
		colors: { bg: "#241025", fg: "#f48fb1", accent: "#fff176", foil: "linear-gradient(135deg, #f48fb1, #b0bec5, #fff176)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#241025" stroke="#f48fb1" stroke-width="3"/>
			<circle cx="50" cy="42" r="18" fill="#ffe0b2" stroke="#000" stroke-width="3"/>
			<line x1="40" y1="38" x2="46" y2="44" stroke="#000" stroke-width="3"/><line x1="46" y1="38" x2="40" y2="44" stroke="#000" stroke-width="3"/>
			<line x1="54" y1="38" x2="60" y2="44" stroke="#000" stroke-width="3"/><line x1="60" y1="38" x2="54" y2="44" stroke="#000" stroke-width="3"/>
			<path d="M42 52 L46 50 L50 52 L54 50 L58 52" stroke="#000" stroke-width="2" fill="none"/>
			<rect x="34" y="60" width="32" height="26" rx="4" fill="#f48fb1" stroke="#000" stroke-width="3"/>
			<line x1="76" y1="26" x2="62" y2="46" stroke="#fff176" stroke-width="3"/><circle cx="77" cy="25" r="4" fill="#ff1744"/>
		</svg>`,
	},
	{
		id: "meteor_monk",
		name: "Meteor Monk",
		alias: "The Falling Star Fist",
		rarity: 3,
		affinity: "Brawler",
		baseHp: 880,
		baseAtk: 190,
		baseDef: 70,
		baseSpd: 104,
		quote: "BREATHE IN. THEN BREAK EVERYTHING.",
		bio: "A mountain hermit who meditates until a meteor passes overhead, then punches it back.",
		basic: { name: "Palm Strike", power: 1.05, sfx: "punch", desc: "A calm, devastating palm." },
		skill: { name: "Inner Peace", cd: 3, sfx: "fanfare", desc: "Strikes for 80%, heals himself for 20% HP and cleanses all debuffs." },
		ultimate: { name: "Falling Star Fist", sfx: "heavy", desc: "A guaranteed critical 260% meteor punch." },
		colors: { bg: "#241606", fg: "#ffb74d", accent: "#ff7043", foil: "linear-gradient(135deg, #b0bec5, #ffb74d, #eceff1)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#241606" stroke="#ffb74d" stroke-width="3"/>
			<circle cx="50" cy="40" r="16" fill="#ffcc80" stroke="#000" stroke-width="3"/>
			<path d="M34 34 Q50 22 66 34" stroke="#000" stroke-width="3" fill="none"/>
			<path d="M30 80 Q50 54 70 80 Z" fill="#ff7043" stroke="#000" stroke-width="3"/>
			<circle cx="78" cy="22" r="6" fill="#ffb74d" stroke="#000" stroke-width="2"/><path d="M74 26 L58 42" stroke="#ffb74d" stroke-width="3"/>
		</svg>`,
	},
	{
		id: "lucky_pup",
		name: "Lucky Pup",
		alias: "The Four-Leaf Fetcher",
		rarity: 2,
		affinity: "Mystic",
		baseHp: 620,
		baseAtk: 165,
		baseDef: 48,
		baseSpd: 128,
		quote: "WOOF! (THAT MEANS GOOD LUCK!)",
		bio: "A scruffy pup with a clover-shaped birthmark who somehow always lands on his feet.",
		basic: { name: "Playful Nip", power: 1.0, sfx: "slash", desc: "A cheerful chomp." },
		skill: { name: "Lucky Streak", cd: 3, sfx: "fanfare", desc: "Bites for 120% and raises his critical chance for 2 turns." },
		ultimate: { name: "Fetch Frenzy", sfx: "heavy", desc: "Bounces between two enemies for 190% damage." },
		colors: { bg: "#102418", fg: "#a5d6a7", accent: "#ffd54f", foil: "#a5d6a7" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#102418" stroke="#a5d6a7" stroke-width="3"/>
			<ellipse cx="50" cy="56" rx="22" ry="20" fill="#d7b98e" stroke="#000" stroke-width="3"/>
			<path d="M30 40 Q22 62 34 66 Z M70 40 Q78 62 66 66 Z" fill="#8d6e63" stroke="#000" stroke-width="2"/>
			<circle cx="42" cy="52" r="3" fill="#000"/><circle cx="58" cy="52" r="3" fill="#000"/>
			<ellipse cx="50" cy="62" rx="5" ry="4" fill="#000"/>
			<g fill="#66bb6a" stroke="#000" stroke-width="1.5"><circle cx="46" cy="30" r="5"/><circle cx="56" cy="30" r="5"/><circle cx="46" cy="38" r="5"/><circle cx="56" cy="38" r="5"/></g>
		</svg>`,
	},

	// ── EXPANSION: SERIES 1 — WAVE 4 HEROES ───────────────────────────────────
	{
		id: "phoenix_heart",
		name: "Phoenix Heart",
		alias: "The Rebirth Flame",
		rarity: 5,
		affinity: "Brawler",
		baseHp: 1100,
		baseAtk: 250,
		baseDef: 90,
		baseSpd: 112,
		quote: "FROM THE ASHES, WE RISE!",
		bio: "A firefighter reborn in the heart of a collapsing star, she burns bright enough to mend her friends and melt her foes.",
		basic: { name: "Ember Fist", power: 1.15, sfx: "punch", desc: "A blazing straight punch." },
		skill: { name: "Rekindle", cd: 3, sfx: "fanfare", desc: "Heals the most wounded ally for 40% and scorches the target for 110%." },
		ultimate: { name: "Ashes Reborn", sfx: "heavy", desc: "240% AoE firestorm that heals the squad for 25% and fires up their attack." },
		colors: { bg: "#2a0a05", fg: "#ffab40", accent: "#ff3d00", foil: "linear-gradient(135deg, #ff3d00, #ffab40, #ffe600, #ff3d00)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="44" fill="#2a0a05" stroke="#ff3d00" stroke-width="3"/>
			<path d="M50 8 Q70 28 66 44 Q82 34 84 54 Q84 82 50 90 Q16 82 16 54 Q18 34 34 44 Q30 28 50 8 Z" fill="#ff6d00" stroke="#000" stroke-width="3"/>
			<path d="M50 34 Q62 48 58 62 Q54 74 50 76 Q46 74 42 62 Q38 48 50 34 Z" fill="#ffd740" stroke="#000" stroke-width="2"/>
			<circle cx="44" cy="58" r="3" fill="#000"/><circle cx="56" cy="58" r="3" fill="#000"/>
			<path d="M32 12 L38 26 L26 22 Z M68 12 L62 26 L74 22 Z" fill="#ffab40" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "neon_ninja",
		name: "Neon Ninja",
		alias: "The Cyber Shinobi",
		rarity: 4,
		affinity: "Tech",
		baseHp: 760,
		baseAtk: 245,
		baseDef: 62,
		baseSpd: 135,
		quote: "YOU NEVER SAW ME LOG IN.",
		bio: "A hacker-assassin whose glowing katana syncs to the city grid, striking in a blur of afterimages.",
		basic: { name: "Pixel Slash", power: 1.1, sfx: "slash", desc: "A glitching katana cut." },
		skill: { name: "Triple Phase", cd: 3, sfx: "slash", desc: "Three phasing strikes for 160% total." },
		ultimate: { name: "Hundred Frame Dance", sfx: "heavy", desc: "Six blinding slashes for 300% total on one target." },
		colors: { bg: "#06141f", fg: "#00e5ff", accent: "#ff1744", foil: "linear-gradient(135deg, #00e5ff, #ff1744, #ffee00)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<polygon points="50,8 90,50 50,92 10,50" fill="#06141f" stroke="#00e5ff" stroke-width="3"/>
			<path d="M28 42 Q50 28 72 42 L70 56 Q50 66 30 56 Z" fill="#212121" stroke="#000" stroke-width="3"/>
			<rect x="32" y="44" width="36" height="8" fill="#ff1744" stroke="#000" stroke-width="2"/>
			<circle cx="42" cy="48" r="2.5" fill="#fff"/><circle cx="58" cy="48" r="2.5" fill="#fff"/>
			<line x1="18" y1="82" x2="82" y2="22" stroke="#00e5ff" stroke-width="3"/><line x1="24" y1="86" x2="86" y2="30" stroke="#fff" stroke-width="1.5"/>
		</svg>`,
	},
	{
		id: "sand_sphinx",
		name: "Sand Sphinx",
		alias: "The Riddle Queen",
		rarity: 4,
		affinity: "Mystic",
		baseHp: 870,
		baseAtk: 195,
		baseDef: 85,
		baseSpd: 98,
		quote: "ANSWER WRONG, AND BE BURIED.",
		bio: "An ancient desert guardian who poses unanswerable riddles and buries the unworthy beneath the dunes.",
		basic: { name: "Dune Claw", power: 1.0, sfx: "slash", desc: "Swipes with sand-hardened claws." },
		skill: { name: "Riddle Trap", cd: 3, sfx: "laser", desc: "Traps a foe in a riddle: 70% stun chance and marked for 2 turns." },
		ultimate: { name: "Buried Alive", sfx: "heavy", desc: "210% AoE sandstorm that marks every foe and shreds their defense." },
		colors: { bg: "#2b1d08", fg: "#ffd54f", accent: "#26c6da", foil: "linear-gradient(135deg, #ffd54f, #26c6da, #ff8f00)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#2b1d08" stroke="#ffd54f" stroke-width="3"/>
			<path d="M24 78 L24 44 Q24 20 50 20 Q76 20 76 44 L76 78 Z" fill="#ffd54f" stroke="#000" stroke-width="3"/>
			<path d="M28 44 L72 44" stroke="#26c6da" stroke-width="8"/>
			<ellipse cx="40" cy="50" rx="5" ry="4" fill="#000"/><ellipse cx="60" cy="50" rx="5" ry="4" fill="#000"/>
			<path d="M40 66 L50 72 L60 66" stroke="#000" stroke-width="3" fill="none"/>
			<polygon points="50,6 58,20 42,20" fill="#26c6da" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "comet_kid",
		name: "Comet Kid",
		alias: "The Meteor Rookie",
		rarity: 4,
		affinity: "Cosmic",
		baseHp: 740,
		baseAtk: 238,
		baseDef: 60,
		baseSpd: 130,
		quote: "CATCH ME IF YOU CAN, GRAVITY!",
		bio: "A hot-headed teen who fell from orbit inside a meteor and found out she could ride the light.",
		basic: { name: "Star Dash", power: 1.1, sfx: "laser", desc: "A comet-fast ramming strike." },
		skill: { name: "Tail Light", cd: 3, sfx: "laser", desc: "Hits for 100%, boosts the squad's critical chance and charges herself 30 energy." },
		ultimate: { name: "Shooting Star Barrage", sfx: "heavy", desc: "A guaranteed critical 280% hit that chains to a second enemy." },
		colors: { bg: "#0d0a2e", fg: "#ff80ab", accent: "#40c4ff", foil: "linear-gradient(135deg, #ff80ab, #40c4ff, #ffee58)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="42" fill="#0d0a2e" stroke="#40c4ff" stroke-width="3"/>
			<path d="M18 82 L46 40" stroke="#ff80ab" stroke-width="10" stroke-linecap="round"/>
			<path d="M26 86 L52 48" stroke="#ffee58" stroke-width="5" stroke-linecap="round"/>
			<circle cx="58" cy="38" r="20" fill="#fff" stroke="#000" stroke-width="3"/>
			<circle cx="52" cy="36" r="3" fill="#000"/><circle cx="64" cy="36" r="3" fill="#000"/>
			<path d="M52 46 Q58 52 64 46" stroke="#000" stroke-width="2.5" fill="none"/>
		</svg>`,
	},
	{
		id: "siege_sergeant",
		name: "Siege Sergeant",
		alias: "The Wall of Steel",
		rarity: 3,
		affinity: "Brawler",
		baseHp: 960,
		baseAtk: 165,
		baseDef: 105,
		baseSpd: 85,
		quote: "HOLD THE LINE, ROOKIES!",
		bio: "A grizzled drill instructor in a riot-shield exosuit who has never once taken a step backward.",
		basic: { name: "Shield Shove", power: 1.0, sfx: "punch", desc: "A heavy bash with the riot shield." },
		skill: { name: "Hold The Line", cd: 3, sfx: "punch", desc: "Taunts the enemy and shields the whole squad for 15% HP." },
		ultimate: { name: "Last Stand", sfx: "heavy", desc: "190% damage and a huge shield on himself, with crit immunity." },
		colors: { bg: "#10202a", fg: "#b0bec5", accent: "#ffa000", foil: "linear-gradient(135deg, #b0bec5, #ffa000, #eceff1)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#10202a" stroke="#b0bec5" stroke-width="3"/>
			<path d="M26 22 L74 22 L74 56 Q74 76 50 88 Q26 76 26 56 Z" fill="#78909c" stroke="#000" stroke-width="3"/>
			<rect x="34" y="34" width="32" height="10" fill="#ffa000" stroke="#000" stroke-width="2"/>
			<line x1="50" y1="22" x2="50" y2="86" stroke="#000" stroke-width="2"/><circle cx="50" cy="60" r="7" fill="#ffa000" stroke="#000" stroke-width="2"/>
		</svg>`,
	},
	{
		id: "echo_bard",
		name: "Echo Bard",
		alias: "The Sound Sorcerer",
		rarity: 3,
		affinity: "Mystic",
		baseHp: 740,
		baseAtk: 160,
		baseDef: 60,
		baseSpd: 118,
		quote: "THIS NEXT SONG IS ABOUT YOUR DEFEAT!",
		bio: "A wandering minstrel whose enchanted lute turns every riff into a spell.",
		basic: { name: "Power Chord", power: 1.0, sfx: "laser", desc: "A twanging bolt of sound." },
		skill: { name: "Rally Anthem", cd: 3, sfx: "fanfare", desc: "Charges every ally with 15 energy and boosts their attack for 2 turns." },
		ultimate: { name: "Encore", sfx: "heavy", desc: "170% AoE sound wave that cleanses and heals the squad for 15%." },
		colors: { bg: "#1b0f2e", fg: "#ea80fc", accent: "#ffd740", foil: "linear-gradient(135deg, #b0bec5, #ea80fc, #eceff1)" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#1b0f2e" stroke="#ea80fc" stroke-width="3"/>
			<ellipse cx="42" cy="62" rx="18" ry="16" fill="#ffd740" stroke="#000" stroke-width="3"/>
			<circle cx="42" cy="62" r="6" fill="#000"/>
			<line x1="54" y1="52" x2="78" y2="22" stroke="#8d6e63" stroke-width="6" stroke-linecap="round"/>
			<g fill="#ea80fc" stroke="#000" stroke-width="2"><circle cx="72" cy="38" r="5"/><circle cx="82" cy="46" r="4"/></g>
		</svg>`,
	},
	{
		id: "gummy_guard",
		name: "Gummy Guard",
		alias: "The Candy Sentinel",
		rarity: 2,
		affinity: "Tech",
		baseHp: 700,
		baseAtk: 135,
		baseDef: 65,
		baseSpd: 90,
		quote: "SQUISH... BUT DON'T BREAK!",
		bio: "A sugar-rush experiment that grew a wobbly, bouncy armor of candy gel.",
		basic: { name: "Jelly Bump", power: 1.0, sfx: "punch", desc: "A bouncy body slam." },
		skill: { name: "Sticky Shield", cd: 3, sfx: "fanfare", desc: "Bumps for 90%, taunts and shields himself for 25% HP." },
		ultimate: { name: "Sugar Burst", sfx: "heavy", desc: "Explodes into 170% damage across two enemies." },
		colors: { bg: "#2a0d22", fg: "#ff80ab", accent: "#69f0ae", foil: "#ff80ab" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#2a0d22" stroke="#ff80ab" stroke-width="3"/>
			<path d="M24 74 Q22 30 50 28 Q78 30 76 74 Z" fill="#69f0ae" stroke="#000" stroke-width="3" opacity="0.92"/>
			<circle cx="42" cy="52" r="4" fill="#000"/><circle cx="58" cy="52" r="4" fill="#000"/>
			<path d="M44 62 Q50 68 56 62" stroke="#000" stroke-width="3" fill="none"/>
			<ellipse cx="38" cy="40" rx="6" ry="3" fill="#fff" opacity="0.7"/>
		</svg>`,
	},
	{
		id: "spark_sprite",
		name: "Spark Sprite",
		alias: "The Static Fairy",
		rarity: 2,
		affinity: "Cosmic",
		baseHp: 600,
		baseAtk: 170,
		baseDef: 45,
		baseSpd: 132,
		quote: "ZAP ZAP ZAPPITY ZAP!",
		bio: "A tiny wisp of cosmic static that hops between lightbulbs and bites for fun.",
		basic: { name: "Static Poke", power: 1.0, sfx: "laser", desc: "A tiny, annoying shock." },
		skill: { name: "Charge Up", cd: 3, sfx: "laser", desc: "Zaps for 120% and charges herself 30 energy." },
		ultimate: { name: "Lightning Lap", sfx: "heavy", desc: "Zips between two enemies for 190% damage." },
		colors: { bg: "#0c1633", fg: "#fff176", accent: "#40c4ff", foil: "#fff176" },
		artSvg: `<svg viewBox="0 0 100 100" class="hero-svg">
			<circle cx="50" cy="50" r="40" fill="#0c1633" stroke="#fff176" stroke-width="3"/>
			<polygon points="56,12 36,52 50,52 42,88 70,42 54,42" fill="#fff176" stroke="#000" stroke-width="3"/>
			<ellipse cx="28" cy="34" rx="10" ry="5" fill="#40c4ff" stroke="#000" stroke-width="2" transform="rotate(-30 28 34)"/>
			<ellipse cx="74" cy="64" rx="10" ry="5" fill="#40c4ff" stroke="#000" stroke-width="2" transform="rotate(-30 74 64)"/>
		</svg>`,
	},
];

// Helper dictionaries


const HEROES_MAP = new Map(HEROES_DATA.map((h) => [h.id, h]));

// Rarity configurations
const RARITY_CONFIG = {
	5: {
		name: "Mythic 5★",
		stars: "★★★★★",
		label: "ULTRA RARE",
		color: "#ffe600",
		bg: "#290038",
		border: "#ffe600",
		dropRate: 0.03,
	},
	4: {
		name: "Super Rare 4★",
		stars: "★★★★",
		label: "SUPER RARE",
		color: "#ff00aa",
		bg: "#10002b",
		border: "#ff00aa",
		dropRate: 0.15,
	},
	3: {
		name: "Rare 3★",
		stars: "★★★",
		label: "RARE",
		color: "#00e5ff",
		bg: "#041624",
		border: "#00e5ff",
		dropRate: 0.35,
	},
	2: {
		name: "Common 2★",
		stars: "★★",
		label: "COMMON",
		color: "#d7ccc8",
		bg: "#1c1b18",
		border: "#8d6e63",
		dropRate: 0.47,
	},
};
