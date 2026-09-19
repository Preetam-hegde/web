// Smoke test for the story, ritual, weather and save rules.
// Run: node --experimental-default-type=module apps/bharatvarsha/check.mjs
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
	getItem: (key) => store.get(key) ?? null,
	setItem: (key, value) => store.set(key, value),
	removeItem: (key) => store.delete(key)
};

const { BharatGame } = await import('./js/game.js');
const { CHAPTERS, DECISIONS, ENDING } = await import('./js/story.js');

function newGame() {
	const game = new BharatGame();
	game.modals = [];
	game.setHooks({ onModal: (modal) => game.modals.push(modal) });
	return game;
}

function satisfy(game, { type, key, target }) {
	const { buildings, population, resources, upgrades, state } = game.data;
	if (type === 'building') buildings[key].count = target;
	if (type === 'worker') population[key] = target;
	if (type === 'resource') resources[key] = target;
	if (type === 'upgrades') upgrades.irrigation.applied = true;
	if (type === 'era') state.era = ['Early Vedic', 'Later Vedic', 'Mahajanapada'][target];
}

// story: intro on first start, then one chapter per goal, then the ending
const game = newGame();
game.start();
clearInterval(game.loopId);
clearInterval(game.eventId);
assert.equal(game.modals[0].eyebrow, 'Chapter I');

CHAPTERS.forEach((chapter, i) => {
	const food = game.data.resources.food;
	satisfy(game, chapter.goal);
	game.refresh();
	assert.equal(game.data.story.chapter, i + 1, `chapter ${i + 1} should complete`);
	if (chapter.reward.food) assert.ok(game.data.resources.food >= food + chapter.reward.food);
});
assert.ok(game.data.story.complete);
assert.equal(game.modals.at(-1).title, ENDING.title);

// reset starts the story over
game.reset();
assert.equal(game.data.story.chapter, 0);
assert.ok(!game.data.story.complete);
assert.equal(game.modals.at(-1).eyebrow, 'Chapter I');

// rituals: the rite needs an altar, and a finished realm does not burn resources for nothing
const rite = newGame();
rite.data.resources.food = 5000;
rite.data.resources.vidya = 5000;
rite.performRitual('ashwamedha');
assert.equal(rite.data.state.era, 'Early Vedic');
assert.equal(rite.data.resources.food, 5000);
rite.data.buildings.altar.count = 1;
rite.performRitual('ashwamedha');
assert.equal(rite.data.state.era, 'Later Vedic');
assert.equal(rite.data.rituals.ashwamedha.cost.food, 600);
rite.performRitual('ashwamedha');
assert.equal(rite.data.state.era, 'Mahajanapada');
const left = rite.data.resources.food;
rite.performRitual('ashwamedha');
assert.equal(rite.data.resources.food, left);

// weather expires by ticks, and a stale saved weather is cleared on load
const wet = newGame();
wet.setWeather('Monsoon', 2);
wet.tick();
assert.equal(wet.data.state.weather, 'Monsoon');
wet.tick();
assert.equal(wet.data.state.weather, 'Normal');
store.set('bharatvarsha-save-v2', JSON.stringify({ state: { weather: 'Drought' } }));
assert.equal(newGame().data.state.weather, 'Normal');

// a save from before the story existed skips earned chapters quietly: one modal, no replayed rewards
store.set('bharatvarsha-save-v2', JSON.stringify({
	resources: { food: 40, wood: 10, stone: 0, vidya: 0 },
	population: { idle: 1, farmer: 3, woodcutter: 0, miner: 0, scholar: 0, total: 4, max: 15 },
	buildings: { hut: { name: 'Mud Hut', count: 3, cost: { wood: 15, food: 8 } } },
	rituals: { puja: { action: 'puja' } }
}));
const returning = newGame();
returning.start();
clearInterval(returning.loopId);
clearInterval(returning.eventId);
assert.equal(returning.modals.length, 1);
assert.equal(returning.modals[0].eyebrow, 'Chapter III');
assert.equal(returning.data.resources.food, 40);
assert.equal(returning.data.rituals.puja.action, 'boost');

// decisions: even a broke kingdom can always dismiss a ruling, and unaffordable choices never apply
const broke = newGame();
Object.keys(broke.data.resources).forEach((key) => { broke.data.resources[key] = 0; });
DECISIONS.forEach((event) => assert.ok(event.choices.some((choice) => broke.canApply(choice.effects)), `${event.title} needs a free choice`));
broke.offerDecision();
assert.ok(broke.modals.at(-1).choices.some((choice) => !choice.disabled));
broke.resolveChoice({ effects: { food: -40 }, log: 'x' });
assert.equal(broke.data.resources.food, 0);

console.log('bharatvarsha: all checks passed');
