import { GAME_CONSTANTS, ERAS, bundleText, createInitialState, deepClone } from './config.js';
import { CHAPTERS, DECISIONS, ENDING, ROMAN } from './story.js';

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
		if (!this.data.story.introSeen) {
			this.data.story.introSeen = true;
			this.showStory();
		}
		this.refresh();
		this.loopId = setInterval(() => this.loop(), GAME_CONSTANTS.TICK_RATE);
		this.eventId = setInterval(() => this.checkRandomEvent(), 15000);
	}

	refresh() {
		this.checkChapter();
		this.hooks.onUpdate(this.getViewModel());
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

		if (state.weatherTicks > 0 && --state.weatherTicks === 0) {
			this.log(state.weather === 'Monsoon' ? 'Monsoon season has passed.' : 'Drought has ended.', 'gray');
			state.weather = 'Normal';
		}

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
		this.refresh();
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
		this.refresh();
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
		this.refresh();
	}

	assignWorker(type) {
		if (type === 'scholar' && this.data.buildings.school.count === 0) {
			this.log('Build a Gurukul first to train scholars.', 'orange');
			return;
		}
		if (this.data.population.idle <= 0) return;
		this.data.population.idle -= 1;
		this.data.population[type] += 1;
		this.refresh();
	}

	removeWorker(type) {
		if (this.data.population[type] <= 0) return;
		this.data.population[type] -= 1;
		this.data.population.idle += 1;
		this.refresh();
	}

	build(key) {
		const building = this.data.buildings[key];
		if (!building || !this.canAfford(building.cost)) return;
		this.payCost(building.cost);
		building.count += 1;
		this.applyBuildingEffect(building.effect);
		this.scaleCost(building.cost);
		this.log(`Constructed ${building.name}.`, 'blue');
		this.refresh();
	}

	performRitual(key) {
		const ritual = this.data.rituals[key];
		if (!ritual || !this.canAfford(ritual.cost)) return;
		const blocked = this.ritualBlock(ritual);
		if (blocked) {
			this.log(blocked, 'orange');
			return;
		}
		this.payCost(ritual.cost);
		if (ritual.action === 'era') {
			this.advanceEra();
			this.scaleCost(ritual.cost);
		} else {
			this.applyEffects(ritual.effects);
			this.log(ritual.log, 'purple');
		}
		this.refresh();
	}

	ritualBlock(ritual) {
		const needed = ritual.requires && this.data.buildings[ritual.requires];
		if (needed && needed.count < 1) return `Build a ${needed.name} first.`;
		if (ritual.action === 'era' && this.data.state.era === ERAS[ERAS.length - 1]) return 'Your realm already stands as a Mahajanapada.';
		return '';
	}

	research(key) {
		const upgrade = this.data.upgrades[key];
		if (!upgrade || upgrade.applied || !this.canAfford(upgrade.cost)) return;
		this.payCost(upgrade.cost);
		upgrade.applied = true;
		this.applyUpgradeEffect(upgrade.effect);
		this.adjustMorale(3);
		this.log(`Research completed: ${upgrade.name}.`, 'blue');
		this.refresh();
	}

	advanceEra() {
		if (this.data.state.era === 'Early Vedic') {
			this.data.state.era = 'Later Vedic';
			this.data.buildings.school.cost.wood = 200;
			this.log('The tribe has grown into a kingdom.', 'purple');
			this.hooks.onModal({ eyebrow: 'Era Advanced', title: 'Later Vedic', body: 'Later Vedic age begins. Agriculture and state administration expand.' });
			return;
		}
		if (this.data.state.era === 'Later Vedic') {
			this.data.state.era = 'Mahajanapada';
			this.log('Your kingdom is now a great realm.', 'purple');
			this.hooks.onModal({ eyebrow: 'Era Advanced', title: 'Mahajanapada', body: 'The age of Mahajanapadas has begun. Trade and philosophy flourish.' });
		}
	}

	chapterProgress({ type, key, target }) {
		const { buildings, population, resources, upgrades, state } = this.data;
		const now = {
			building: () => buildings[key].count,
			worker: () => population[key],
			resource: () => Math.floor(resources[key]),
			upgrades: () => Object.values(upgrades).filter((upgrade) => upgrade.applied).length,
			era: () => ERAS.indexOf(state.era)
		}[type]();
		return Math.min(now, target);
	}

	checkChapter() {
		const { story } = this.data;
		const chapter = CHAPTERS[story.chapter];
		if (story.complete || !chapter || this.chapterProgress(chapter.goal) < chapter.goal.target) return;
		this.applyEffects(chapter.reward);
		this.log(`Chapter complete: ${chapter.title}. ${bundleText(chapter.reward)}`, 'purple');
		story.chapter += 1;
		story.complete = story.chapter >= CHAPTERS.length;
		this.showStory();
	}

	showStory() {
		const { chapter, complete } = this.data.story;
		if (complete) {
			this.hooks.onModal(ENDING);
			return;
		}
		const { title, story } = CHAPTERS[chapter];
		this.hooks.onModal({ eyebrow: `Chapter ${ROMAN[chapter]}`, title, body: story });
	}

	getChapter() {
		const { chapter, complete } = this.data.story;
		if (complete) return { eyebrow: ENDING.eyebrow, title: ENDING.title, goal: 'Your realm endures. Keep it prosperous.', now: 1, target: 1 };
		const { title, goal } = CHAPTERS[chapter];
		return { eyebrow: `Chapter ${ROMAN[chapter]}`, title, goal: goal.text, now: this.chapterProgress(goal), target: goal.target };
	}

	// effects: { food: -40, stone: 20, morale: 3 }, negative resource values are a price
	canApply(effects) {
		return Object.entries(effects).every(([key, amount]) => key === 'morale' || amount >= 0 || this.data.resources[key] >= -amount);
	}

	applyEffects(effects) {
		Object.entries(effects).forEach(([key, amount]) => {
			if (key === 'morale') this.adjustMorale(amount);
			else this.data.resources[key] += amount;
		});
	}

	offerDecision() {
		if (this.decisionOpen) return;
		this.decisionOpen = true;
		const event = DECISIONS[Math.floor(Math.random() * DECISIONS.length)];
		this.hooks.onModal({
			eyebrow: 'A Royal Decision',
			title: event.title,
			body: event.body,
			choices: event.choices.map((choice) => ({
				label: choice.label,
				hint: bundleText(choice.effects),
				disabled: !this.canApply(choice.effects),
				run: () => this.resolveChoice(choice)
			}))
		});
	}

	resolveChoice(choice) {
		this.decisionOpen = false;
		if (this.canApply(choice.effects)) {
			this.applyEffects(choice.effects);
			this.log(choice.log, 'purple');
		} else {
			this.log('You lacked the means to act on that ruling.', 'orange');
		}
		this.refresh();
	}

	setWeather(kind, ticks) {
		this.data.state.weather = kind;
		this.data.state.weatherTicks = ticks;
	}

	checkRandomEvent() {
		if (this.data.time.paused) return;
		const roll = Math.random();
		if (roll < 0.1) {
			this.setWeather('Monsoon', 20);
			this.adjustMorale(4);
			this.log('Monsoon rains arrived. Crops flourish.', 'blue');
		} else if (roll < 0.15) {
			this.setWeather('Drought', 15);
			this.adjustMorale(-6);
			this.log('Drought strikes the fields.', 'red');
		} else if (roll < 0.2) {
			this.data.resources.vidya += 10;
			this.log('A wandering rishi shared ancient wisdom. +10 Vidya.', 'purple');
		} else if (roll < 0.25 && this.data.resources.food > 50) {
			const loss = Math.floor(this.data.resources.food * 0.1 * 0.5 ** this.data.buildings.granary.count);
			this.data.resources.food -= loss;
			this.adjustMorale(-3);
			this.log(`Pests raided stores. Lost ${loss} food.`, 'orange');
		} else if (roll < 0.3) {
			this.data.resources.wood += 8;
			this.log('A caravan traded tools and timber. +8 Wood.', 'blue');
		} else if (roll < 0.4 && this.data.state.tickCount > 120) {
			this.offerDecision();
		}
		this.refresh();
	}

	togglePause() {
		this.data.time.paused = !this.data.time.paused;
		this.log(this.data.time.paused ? 'Royal court is paused.' : 'Royal court resumes.', 'blue');
		this.refresh();
	}

	setSpeed(speed) {
		this.data.time.speed = this.clamp(Number(speed) || 1, 1, 4);
		this.log(`Game speed set to ${this.data.time.speed}x.`, 'blue');
		this.refresh();
	}

	reset() {
		localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
		this.data = createInitialState();
		this.data.story.introSeen = true;
		this.decisionOpen = false;
		this.normalizePopulation();
		this.log('Kingdom chronicles reset.', 'orange');
		this.showStory();
		this.refresh();
	}

	save(silent = false) {
		try {
			localStorage.setItem(GAME_CONSTANTS.SAVE_KEY, JSON.stringify(this.data));
			if (!silent) this.log('Chronicles saved.', 'green');
		} catch {
			if (!silent) this.log('Unable to save in this browser.', 'red');
		}
		// a paused game has no tick to redraw, so show the confirmation now
		if (!silent) this.refresh();
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
				story: { ...createInitialState().story, ...(saved.story || {}) },
				chronicles: Array.isArray(saved.chronicles) ? saved.chronicles : createInitialState().chronicles
			};
			// weather is timed by ticks now; a save with no time left on it must not stay stuck on Drought
			if (!this.data.state.weatherTicks) this.data.state.weather = 'Normal';
			if (!saved.story) this.skipEarnedChapters();
		} catch {
			localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
		}
		this.normalizePopulation();
	}

	// A save from before the story existed: skip chapters it already earned, without replaying rewards or modals.
	skipEarnedChapters() {
		const { story } = this.data;
		while (CHAPTERS[story.chapter] && this.chapterProgress(CHAPTERS[story.chapter].goal) >= CHAPTERS[story.chapter].goal.target) story.chapter += 1;
		story.complete = story.chapter >= CHAPTERS.length;
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

	// only progress carries over from a save; names and descriptions always come from config
	mergeObjectState(base, saved) {
		const merged = deepClone(base);
		Object.entries(saved).forEach(([key, entry]) => {
			if (!merged[key] || !entry) return;
			['count', 'applied'].forEach((field) => {
				if (field in entry) merged[key][field] = entry[field];
			});
			if (entry.cost) merged[key].cost = { ...merged[key].cost, ...entry.cost };
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
		if (this.data.population.total === 0) return 'Settlement collapsed. Gather food and use Recruit Villager to recover.';
		return this.getChapter().goal;
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
			chapter: this.getChapter(),
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
