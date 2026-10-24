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
