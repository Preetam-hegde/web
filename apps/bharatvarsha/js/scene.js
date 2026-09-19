// Draws the settlement: one sprite per building (up to `max`), one villager per person.
// Layers are rebuilt only when their counts change so CSS animations keep running.
const ZONES = [
	{ key: 'hut', sprite: 's-hut', from: 5, to: 38, max: 8 },
	{ key: 'farm', sprite: 's-farm', from: 43, to: 59, max: 4 },
	{ key: 'granary', sprite: 's-granary', from: 64, to: 72, max: 2 },
	{ key: 'school', sprite: 's-school', from: 78, to: 84, max: 1 },
	{ key: 'altar', sprite: 's-altar', from: 91, to: 95, max: 1 }
];

const ROLES = ['idle', 'farmer', 'woodcutter', 'miner', 'scholar'];
const HOME = { idle: 22, farmer: 51, woodcutter: 10, miner: 90, scholar: 78 };
const MAX_VILLAGERS = 18; // ponytail: extra villagers are simply not drawn

export function createScene(buildingsEl, peopleEl) {
	let buildingsKey = '';
	let peopleKey = '';
	const seen = {};

	function drawBuildings(buildings) {
		buildingsEl.innerHTML = ZONES.map(({ key, sprite, from, to, max }) => {
			const { name, count } = buildings[key];
			const shown = Math.min(count, max);
			const fresh = key in seen && count > seen[key];
			seen[key] = count;
			if (!shown) {
				return `<svg class="sprite plot" style="left:${(from + to) / 2}%;bottom:25%"><title>Empty plot: ${name}</title><use href="#s-plot"/></svg>`;
			}
			return Array.from({ length: shown }, (_, i) => {
				const x = shown === 1 ? (from + to) / 2 : from + ((to - from) * i) / (shown - 1);
				const back = i % 2;
				const cls = fresh && i === shown - 1 ? 'sprite is-new' : 'sprite';
				return `<svg class="${cls} sprite-${key}" style="left:${x}%;bottom:${25 + back * 6}%;z-index:${2 - back}"><title>${name} ×${count}</title><use href="#${sprite}"/></svg>`;
			}).join('');
		}).join('');
	}

	function drawPeople(population) {
		peopleEl.innerHTML = ROLES.flatMap((role) => Array.from({ length: population[role] }, (_, i) => ({ role, i })))
			.slice(0, MAX_VILLAGERS)
			.map(({ role, i }) => `<i class="vill ${role}" style="left:${HOME[role] + (i % 4) * 3}%;bottom:${15 + ((i * 5) % 9)}%;--range:${10 + (i % 3) * 5}px;--dur:${5 + ((i * 3) % 5)}s;--delay:-${(i * 7) % 5}s"></i>`)
			.join('');
	}

	return function updateScene({ buildings, population }) {
		const bKey = ZONES.map(({ key }) => buildings[key].count).join();
		if (bKey !== buildingsKey) {
			buildingsKey = bKey;
			drawBuildings(buildings);
		}
		const pKey = ROLES.map((role) => population[role]).join();
		if (pKey !== peopleKey) {
			peopleKey = pKey;
			drawPeople(population);
		}
	};
}
