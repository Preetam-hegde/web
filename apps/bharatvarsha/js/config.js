export const GAME_CONSTANTS = {
	TICK_RATE: 1000,
	SAVE_KEY: 'bharatvarsha-save-v2',
	FOOD_PER_FARMER: 1.2,
	WOOD_PER_CUTTER: 0.5,
	STONE_PER_MINER: 0.3,
	VIDYA_PER_SCHOLAR: 0.2,
	CONSUMPTION_PER_PERSON: 0.5
};

export const ERAS = ['Early Vedic', 'Later Vedic', 'Mahajanapada'];

// { food: -40, morale: 3 } -> "−40 Food · +3 Morale"
export function bundleText(bundle) {
	return Object.entries(bundle)
		.filter(([, amount]) => amount)
		.map(([key, amount]) => `${amount > 0 ? '+' : '−'}${Math.abs(amount)} ${key[0].toUpperCase()}${key.slice(1)}`)
		.join(' · ');
}

export const WORKER_TYPES = [
	{ key: 'farmer', name: 'Farmers (Kisan)', icon: 'fa-wheat-awn', desc: 'Produces food each tick.' },
	{ key: 'woodcutter', name: 'Woodcutters', icon: 'fa-tree', desc: 'Produces wood, consumes food.' },
	{ key: 'miner', name: 'Miners', icon: 'fa-mountain', desc: 'Produces stone, consumes food.' },
	{ key: 'scholar', name: 'Brahmins (Scholar)', icon: 'fa-scroll', desc: 'Produces vidya, consumes food.' }
];

export function createInitialState() {
	return {
		resources: {
			food: 50,
			wood: 0,
			stone: 0,
			vidya: 0
		},
		modifiers: {
			food: 1,
			wood: 1,
			stone: 1,
			vidya: 1,
			consumption: 1
		},
		time: {
			paused: false,
			speed: 1
		},
		population: {
			idle: 1,
			farmer: 1,
			woodcutter: 0,
			miner: 0,
			scholar: 0,
			total: 2,
			max: 5
		},
		buildings: {
			hut: {
				name: 'Mud Hut',
				count: 1,
				cost: { wood: 10, food: 5 },
				desc: 'Shelter for expanding clans. +5 max population.',
				icon: 'fa-house',
				effect: 'hut'
			},
			farm: {
				name: 'Irrigated Farm',
				count: 0,
				cost: { wood: 20, stone: 5 },
				desc: 'Canals and field planning. +20% food output.',
				icon: 'fa-seedling',
				effect: 'farm'
			},
			granary: {
				name: 'Granary',
				count: 0,
				cost: { wood: 50, stone: 10 },
				desc: 'Sealed storage. Each granary halves losses from pest raids.',
				icon: 'fa-warehouse',
				effect: 'granary'
			},
			school: {
				name: 'Gurukul',
				count: 0,
				cost: { wood: 100, stone: 20, food: 50 },
				desc: 'A learning center unlocking scholars.',
				icon: 'fa-book-open',
				effect: 'school'
			},
			altar: {
				name: 'Yajna Altar',
				count: 0,
				cost: { stone: 100, wood: 50, vidya: 20 },
				desc: 'Sacred fire. Unlocks Agnihotra and the Ashwamedha Yajna.',
				icon: 'fa-fire',
				effect: 'altar'
			}
		},
		rituals: {
			puja: {
				name: 'Daily Puja',
				cost: { food: 10 },
				desc: 'Restore social spirit. +5 morale.',
				action: 'boost',
				effects: { morale: 5 },
				log: 'The village gathers for evening prayers.'
			},
			agnihotra: {
				name: 'Agnihotra',
				cost: { food: 30, wood: 10 },
				desc: 'Dawn offering at the altar. +8 morale, +6 vidya.',
				action: 'boost',
				effects: { morale: 8, vidya: 6 },
				requires: 'altar',
				log: 'The sacred fire is fed at dawn and the rishis chant.'
			},
			ashwamedha: {
				name: 'Ashwamedha Yajna',
				cost: { food: 500, vidya: 100 },
				desc: 'Imperial rite to move into the next era. Grows costlier each time.',
				action: 'era',
				requires: 'altar'
			}
		},
		upgrades: {
			irrigation: {
				name: 'Canal Irrigation',
				desc: 'Structured water channels. +25% food output.',
				cost: { vidya: 20, wood: 30 },
				applied: false,
				effect: 'irrigation'
			},
			stonecraft: {
				name: 'Stonecraft Guild',
				desc: 'Improved quarrying. +35% stone output.',
				cost: { vidya: 25, wood: 20 },
				applied: false,
				effect: 'stonecraft'
			},
			civicCode: {
				name: 'Dharmic Civic Code',
				desc: 'Administrative rationing. -15% food consumption.',
				cost: { vidya: 35, food: 80 },
				applied: false,
				effect: 'civicCode'
			}
		},
		state: {
			year: 1000,
			era: 'Early Vedic',
			tickCount: 0,
			weather: 'Normal',
			weatherTicks: 0,
			morale: 70
		},
		story: {
			chapter: 0,
			complete: false,
			introSeen: false
		},
		chronicles: [
			{ year: 1000, text: 'Your tribe settles near the Ganga. The land is fertile.', tone: 'gray' }
		]
	};
}

export function deepClone(value) {
	return JSON.parse(JSON.stringify(value));
}
