import { GAME_CONSTANTS, createInitialState, deepClone } from './config.js';

export class BharatGame {
	constructor() {
		this.data = createInitialState();
		this.hooks = {
			onUpdate: () => {},
			onLog: () => {},
			onModal: () => {}
		};
		this.restore();
	}

	setHooks(hooks) {
		this.hooks = { ...this.hooks, ...hooks };
	}

	start() {
		this.normalizePopulation();
		this.hooks.onUpdate(this.getViewModel());
		this.loopId = setInterval(() => this.loop(), GAME_CONSTANTS.TICK_RATE);
		this.eventId = setInterval(() => this.checkRandomEvent(), 15000);
	}

	loop() {
		if (this.data.time.paused) return;
		const steps = Math.max(1, Number(this.data.time.speed) || 1);
		for (let i = 0; i < steps; i += 1) {
			this.tick();
		}
	}

	tick() {
		const { state } = this.data;
		state.tickCount += 1;
		this.normalizePopulation();

		if (state.tickCount % 5 === 0) state.year -= 1;

		const moraleFactor = 0.75 + this.clamp(state.morale, 0, 100) / 200;
		let foodGain = this.data.population.farmer * GAME_CONSTANTS.FOOD_PER_FARMER * this.data.modifiers.food * moraleFactor;
		if (state.weather === 'Monsoon') foodGain *= 1.5;
		if (state.weather === 'Drought') foodGain *= 0.5;

		const woodGain = this.data.population.woodcutter * GAME_CONSTANTS.WOOD_PER_CUTTER * this.data.modifiers.wood * moraleFactor;
		const stoneGain = this.data.population.miner * GAME_CONSTANTS.STONE_PER_MINER * this.data.modifiers.stone * moraleFactor;
		const vidyaGain = this.data.population.scholar * GAME_CONSTANTS.VIDYA_PER_SCHOLAR * this.data.modifiers.vidya * moraleFactor;
		const foodLoss = this.data.population.total * GAME_CONSTANTS.CONSUMPTION_PER_PERSON * this.data.modifiers.consumption;

		this.data.resources.food += foodGain - foodLoss;
		this.data.resources.wood += woodGain;
		this.data.resources.stone += stoneGain;
		this.data.resources.vidya += vidyaGain;

		if (this.data.resources.food < 0) {
			this.data.resources.food = 0;
			this.starvationCheck();
		}

		this.handlePopulationCollapse();

		if (this.data.resources.food > 100 && this.data.population.total < this.data.population.max && Math.random() < 0.1) {
			this.data.population.idle += 1;
			this.data.population.total += 1;
			this.data.resources.food -= 20;
			this.adjustMorale(2);
			this.log('A wanderer joined your settlement.', 'blue');
		}

		if (state.tickCount % 10 === 0) this.save(true);
		this.hooks.onUpdate(this.getViewModel());
	}

	starvationCheck() {
		if (Math.random() >= 0.2) return;
		const types = ['idle', 'farmer', 'woodcutter', 'miner', 'scholar'];
		const alive = types.filter((type) => this.data.population[type] > 0);
		if (!alive.length) return;
		const victim = alive[Math.floor(Math.random() * alive.length)];
		this.data.population[victim] -= 1;
		this.data.population.total -= 1;
		this.adjustMorale(-8);
		this.log(`One ${victim} died of starvation.`, 'red');
	}

	manualGather(resource) {
		if (resource === 'food') this.data.resources.food += 1;
		if (resource === 'wood') this.data.resources.wood += 1;
		this.hooks.onUpdate(this.getViewModel());
	}

	recruitVillager() {
		if (this.data.population.total >= this.data.population.max) {
			this.log('Housing limit reached. Build more huts first.', 'orange');
			return;
		}

		const recruitCost = { food: 15 };
		if (!this.canAfford(recruitCost)) {
			this.log('Need at least 15 food to attract new settlers.', 'orange');
			return;
		}

		this.payCost(recruitCost);
		this.data.population.idle += 1;
		this.data.population.total += 1;
		this.adjustMorale(1);
		this.log('A family of settlers has joined your village.', 'blue');
		this.hooks.onUpdate(this.getViewModel());
	}

	assignWorker(type) {
		if (type === 'scholar' && this.data.buildings.school.count === 0) {
			this.log('Build a Gurukul first to train scholars.', 'orange');
			return;
		}
		if (this.data.population.idle <= 0) return;
		this.data.population.idle -= 1;
		this.data.population[type] += 1;
		this.hooks.onUpdate(this.getViewModel());
	}

	removeWorker(type) {
		if (this.data.population[type] <= 0) return;
		this.data.population[type] -= 1;
		this.data.population.idle += 1;
		this.hooks.onUpdate(this.getViewModel());
	}

	build(key) {
		const building = this.data.buildings[key];
		if (!building || !this.canAfford(building.cost)) return;
		this.payCost(building.cost);
		building.count += 1;
		this.applyBuildingEffect(building.effect);
		this.scaleCost(building.cost);
		this.log(`Constructed ${building.name}.`, 'blue');
		this.hooks.onUpdate(this.getViewModel());
	}

	performRitual(key) {
		const ritual = this.data.rituals[key];
		if (!ritual || !this.canAfford(ritual.cost)) return;
		this.payCost(ritual.cost);
		if (ritual.action === 'puja') {
			this.adjustMorale(5);
			this.log('The village gathers for evening prayers.', 'purple');
		}
		if (ritual.action === 'era') this.advanceEra();
		this.hooks.onUpdate(this.getViewModel());
	}

	research(key) {
		const upgrade = this.data.upgrades[key];
		if (!upgrade || upgrade.applied || !this.canAfford(upgrade.cost)) return;
		this.payCost(upgrade.cost);
		upgrade.applied = true;
		this.applyUpgradeEffect(upgrade.effect);
		this.adjustMorale(3);
		this.log(`Research completed: ${upgrade.name}.`, 'blue');
		this.hooks.onUpdate(this.getViewModel());
	}

	advanceEra() {
		if (this.data.state.era === 'Early Vedic') {
			this.data.state.era = 'Later Vedic';
			this.data.buildings.school.cost.wood = 200;
			this.log('The tribe has grown into a kingdom.', 'purple');
			this.hooks.onModal('Era Advanced', 'Later Vedic age begins. Agriculture and state administration expand.');
			return;
		}
		if (this.data.state.era === 'Later Vedic') {
			this.data.state.era = 'Mahajanapada';
			this.log('Your kingdom is now a great realm.', 'purple');
			this.hooks.onModal('Era Advanced', 'The age of Mahajanapadas has begun. Trade and philosophy flourish.');
		}
	}

	checkRandomEvent() {
		if (this.data.time.paused) return;
		const roll = Math.random();
		if (roll < 0.1) {
			this.data.state.weather = 'Monsoon';
			this.adjustMorale(4);
			this.log('Monsoon rains arrived. Crops flourish.', 'blue');
			setTimeout(() => {
				this.data.state.weather = 'Normal';
				this.log('Monsoon season has passed.', 'gray');
				this.hooks.onUpdate(this.getViewModel());
			}, 20000);
		} else if (roll < 0.15) {
			this.data.state.weather = 'Drought';
			this.adjustMorale(-6);
			this.log('Drought strikes the fields.', 'red');
			setTimeout(() => {
				this.data.state.weather = 'Normal';
				this.log('Drought has ended.', 'gray');
				this.hooks.onUpdate(this.getViewModel());
			}, 15000);
		} else if (roll < 0.2) {
			this.data.resources.vidya += 10;
			this.log('A wandering rishi shared ancient wisdom. +10 Vidya.', 'purple');
		} else if (roll < 0.25 && this.data.resources.food > 50) {
			const loss = Math.floor(this.data.resources.food * 0.1);
			this.data.resources.food -= loss;
			this.adjustMorale(-3);
			this.log(`Pests raided stores. Lost ${loss} food.`, 'orange');
		} else if (roll < 0.3) {
			this.data.resources.wood += 8;
			this.log('A caravan traded tools and timber. +8 Wood.', 'blue');
		}
		this.hooks.onUpdate(this.getViewModel());
	}

	togglePause() {
		this.data.time.paused = !this.data.time.paused;
		this.log(this.data.time.paused ? 'Royal court is paused.' : 'Royal court resumes.', 'blue');
		this.hooks.onUpdate(this.getViewModel());
	}

	setSpeed(speed) {
		this.data.time.speed = this.clamp(Number(speed) || 1, 1, 4);
		this.log(`Game speed set to ${this.data.time.speed}x.`, 'blue');
		this.hooks.onUpdate(this.getViewModel());
	}

	reset() {
		localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
		this.data = createInitialState();
		this.normalizePopulation();
		this.log('Kingdom chronicles reset.', 'orange');
		this.hooks.onUpdate(this.getViewModel());
	}

	save(silent = false) {
		try {
			localStorage.setItem(GAME_CONSTANTS.SAVE_KEY, JSON.stringify(this.data));
			if (!silent) this.log('Chronicles saved.', 'blue');
		} catch {
			if (!silent) this.log('Unable to save in this browser.', 'red');
		}
	}

	restore() {
		const raw = localStorage.getItem(GAME_CONSTANTS.SAVE_KEY);
		if (!raw) return;
		try {
			const saved = JSON.parse(raw);
			this.data = {
				...createInitialState(),
				...saved,
				resources: { ...createInitialState().resources, ...(saved.resources || {}) },
				modifiers: { ...createInitialState().modifiers, ...(saved.modifiers || {}) },
				time: { ...createInitialState().time, ...(saved.time || {}) },
				population: { ...createInitialState().population, ...(saved.population || {}) },
				buildings: this.mergeObjectState(createInitialState().buildings, saved.buildings || {}),
				rituals: this.mergeObjectState(createInitialState().rituals, saved.rituals || {}),
				upgrades: this.mergeObjectState(createInitialState().upgrades, saved.upgrades || {}),
				state: { ...createInitialState().state, ...(saved.state || {}) },
				chronicles: Array.isArray(saved.chronicles) ? saved.chronicles : createInitialState().chronicles
			};
		} catch {
			localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
		}
		this.normalizePopulation();
	}

	normalizePopulation() {
		const pop = this.data.population;
		const workerTotal = pop.idle + pop.farmer + pop.woodcutter + pop.miner + pop.scholar;
		pop.total = Math.max(0, workerTotal);
		pop.max = Math.max(pop.max, 1);
		if (pop.total > pop.max) {
			const overflow = pop.total - pop.max;
			pop.idle = Math.max(0, pop.idle - overflow);
			pop.total = pop.idle + pop.farmer + pop.woodcutter + pop.miner + pop.scholar;
		}
	}

	handlePopulationCollapse() {
		if (this.data.population.total > 0) return;

		if (this.data.resources.food >= 12) {
			this.data.resources.food -= 12;
			this.data.population.idle = 1;
			this.data.population.total = 1;
			this.adjustMorale(3);
			this.log('A lone survivor rebuilds the village from your stores.', 'blue');
			return;
		}

		if (this.data.state.tickCount % 12 === 0) {
			this.data.population.idle = 1;
			this.data.population.total = 1;
			this.adjustMorale(4);
			this.log('Relief refugees arrive and restart your settlement.', 'purple');
		}
	}

	mergeObjectState(base, saved) {
		const merged = deepClone(base);
		Object.keys(saved).forEach((key) => {
			if (!merged[key]) return;
			merged[key] = { ...merged[key], ...saved[key] };
			if (merged[key].cost && saved[key]?.cost) {
				merged[key].cost = { ...merged[key].cost, ...saved[key].cost };
			}
		});
		return merged;
	}

	applyBuildingEffect(effect) {
		if (effect === 'hut') this.data.population.max += 5;
		if (effect === 'farm') this.data.modifiers.food *= 1.2;
	}

	applyUpgradeEffect(effect) {
		if (effect === 'irrigation') this.data.modifiers.food *= 1.25;
		if (effect === 'stonecraft') this.data.modifiers.stone *= 1.35;
		if (effect === 'civicCode') this.data.modifiers.consumption *= 0.85;
	}

	canAfford(cost) {
		return this.data.resources.food >= (cost.food || 0)
			&& this.data.resources.wood >= (cost.wood || 0)
			&& this.data.resources.stone >= (cost.stone || 0)
			&& this.data.resources.vidya >= (cost.vidya || 0);
	}

	payCost(cost) {
		this.data.resources.food -= cost.food || 0;
		this.data.resources.wood -= cost.wood || 0;
		this.data.resources.stone -= cost.stone || 0;
		this.data.resources.vidya -= cost.vidya || 0;
	}

	scaleCost(cost) {
		['food', 'wood', 'stone', 'vidya'].forEach((key) => {
			if (typeof cost[key] === 'number') cost[key] = Math.ceil(cost[key] * 1.2);
		});
	}

	adjustMorale(delta) {
		this.data.state.morale = this.clamp(this.data.state.morale + delta, 0, 100);
	}

	getObjective() {
		if (this.data.population.idle === 0 && this.data.population.total > 0) return 'You have no idle workers. Use Remove (-) or recruit settlers.';
		if (this.data.population.total === 0) return 'Settlement collapsed. Gather food and use Recruit Villager to recover.';
		if (this.data.buildings.hut.count < 3) return 'Build 3 Mud Huts to increase population capacity.';
		if (this.data.population.farmer < 3) return 'Assign at least 3 farmers for food stability.';
		if (this.data.resources.wood < 50) return 'Stockpile 50 wood to support expansion.';
		if (this.data.buildings.granary.count < 1) return 'Build a Granary to secure reserves.';
		if (this.data.buildings.school.count < 1) return 'Build a Gurukul to unlock scholars.';
		if (Object.values(this.data.upgrades).some((upgrade) => !upgrade.applied)) return 'Complete at least one research upgrade.';
		return 'Prepare the Ashwamedha Yajna and expand into a great realm.';
	}

	getRates() {
		const pop = this.data.population;
		const mod = this.data.modifiers;
		let food = pop.farmer * GAME_CONSTANTS.FOOD_PER_FARMER * mod.food - pop.total * GAME_CONSTANTS.CONSUMPTION_PER_PERSON * mod.consumption;
		if (this.data.state.weather === 'Monsoon') food += pop.farmer * GAME_CONSTANTS.FOOD_PER_FARMER * mod.food * 0.5;
		if (this.data.state.weather === 'Drought') food -= pop.farmer * GAME_CONSTANTS.FOOD_PER_FARMER * mod.food * 0.5;
		return {
			food,
			wood: pop.woodcutter * GAME_CONSTANTS.WOOD_PER_CUTTER * mod.wood,
			stone: pop.miner * GAME_CONSTANTS.STONE_PER_MINER * mod.stone,
			vidya: pop.scholar * GAME_CONSTANTS.VIDYA_PER_SCHOLAR * mod.vidya
		};
	}

	getStatusHint() {
		if (this.data.population.idle === 0 && this.data.population.total > 0) return 'Workforce is fully assigned. Remove one worker or recruit villagers.';
		if (this.data.population.total === 0) return 'Village collapsed. Use manual labor, then recruit to recover.';
		if (this.data.state.weather === 'Drought') return 'Drought pressure: shift labor to farming and run morale rituals.';
		if (this.data.state.weather === 'Monsoon') return 'Monsoon boon: harvest aggressively while yields are high.';
		if (this.data.state.morale < 45) return 'Court unrest detected. Restore morale to recover productivity.';
		if (this.data.resources.food > 150 && this.data.population.idle > 0) return 'Surplus window open. Train idle villagers into specialists.';
		return 'Balanced governance and reserves ensure kingdom stability.';
	}

	getViewModel() {
		return {
			...this.data,
			rates: this.getRates(),
			objective: this.getObjective(),
			statusHint: this.getStatusHint()
		};
	}

	log(text, tone = 'gray') {
		const entry = { year: Math.floor(this.data.state.year), text, tone };
		this.data.chronicles.unshift(entry);
		this.data.chronicles = this.data.chronicles.slice(0, 30);
		this.hooks.onLog(entry);
	}

	clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
}
