'use strict';

const CUP_PRESETS = [
	{
		id: 'mixed',
		name: 'Mixed Cup',
		blurb: 'Five games. A little of everything.',
		pool: [
			'stack',
			'golf',
			'green',
			'whack',
			'clash',
			'order',
			'centre',
			'stop',
			'shade',
			'size',
			'hue',
			'angle',
			'split',
			'count',
			'cut',
		],
	},
	{
		id: 'reflex',
		name: 'Reflex Cup',
		blurb: 'Fast reads, quick hands, steady nerves.',
		pool: ['stack', 'green', 'whack', 'clash', 'order', 'centre'],
	},
	{
		id: 'precision',
		name: 'Precision Cup',
		blurb: 'Small margins make the difference.',
		pool: ['golf', 'size', 'hue', 'angle', 'split', 'cut', 'centre'],
	},
];

function chooseCupGames(games, presetId, random = Math.random) {
	const preset = CUP_PRESETS.find((item) => item.id === presetId);
	if (!preset) throw new Error('Unknown Cup preset');
	const pool = games.filter(
		(game) =>
			preset.pool.includes(game.id) &&
			!game.duel &&
			!game.coop &&
			!game.words &&
			!game.passOnly &&
			!game.splitOnly &&
			(!game.rounds || game.rounds === 1),
	);
	if (pool.length < 5) throw new Error('A Cup needs five compatible games');
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, 5);
}

function createCupState(id, preset, games, names, solo) {
	if (
		!CUP_PRESETS.some((item) => item.id === preset) ||
		games.length !== 5 ||
		new Set(games).size !== 5 ||
		!names.length ||
		names.length > 10 ||
		(solo && names.length !== 1)
	)
		throw new Error('Invalid Cup setup');
	return {
		id,
		preset,
		games: [...games],
		names: names.map((name) => String(name).slice(0, 20)),
		seats: names.map((_, i) => i),
		solo,
		points: names.map(() => 0),
		gone: names.map(() => false),
		index: 0,
		phase: 'playing',
		legs: [],
	};
}

function recordCupLeg(
	cup,
	gid,
	scores,
	labels,
	lowerIsBetter,
	newBest = false,
) {
	if (cup.phase !== 'playing' || cup.games[cup.index] !== gid) return false;
	if (scores.length !== cup.names.length || labels.length !== scores.length)
		throw new Error('Cup results must match its players');
	const valid = scores.map(
		(score, i) => !cup.gone[i] && Number.isFinite(score),
	);
	const available = scores.filter((_, i) => valid[i]);
	const best = (lowerIsBetter ? Math.min : Math.max)(...available);
	const winners = scores
		.map((score, i) => (valid[i] && score === best ? i : -1))
		.filter((i) => i >= 0);
	const earned = scores.map((_, i) =>
		cup.solo
			? Number(newBest && valid[i])
			: winners.includes(i)
				? winners.length > 1
					? 1
					: 3
				: 0,
	);
	cup.points = cup.points.map((points, i) => points + earned[i]);
	cup.legs.push({
		gid,
		labels: labels.map(String),
		earned,
		winners,
		newBest: !!newBest,
	});
	cup.phase = cup.index === cup.games.length - 1 ? 'complete' : 'break';
	return true;
}

function advanceCupLeg(cup) {
	if (cup.phase !== 'break') return false;
	cup.index++;
	cup.phase = 'playing';
	return true;
}

const cupPlacements = (points, gone) =>
	points.map((score, i) =>
		gone[i]
			? null
			: 1 + points.filter((other, j) => !gone[j] && other > score).length,
	);

function isCupState(state, registeredIds) {
	if (
		!state ||
		typeof state.id !== 'string' ||
		!state.id.length ||
		state.id.length > 80 ||
		!CUP_PRESETS.some((preset) => preset.id === state.preset)
	)
		return false;
	if (
		!Array.isArray(state.games) ||
		state.games.length !== 5 ||
		new Set(state.games).size !== 5 ||
		state.games.some((id) => !registeredIds.includes(id))
	)
		return false;
	if (
		!Array.isArray(state.names) ||
		!state.names.length ||
		state.names.length > 10 ||
		state.names.some(
			(name) => typeof name !== 'string' || !name.length || name.length > 20,
		)
	)
		return false;
	const count = state.names.length;
	if (
		!Array.isArray(state.seats) ||
		state.seats.length !== count ||
		new Set(state.seats).size !== count ||
		state.seats.some((seat) => !Number.isSafeInteger(seat) || seat < 0)
	)
		return false;
	if (
		typeof state.solo !== 'boolean' ||
		(state.solo && count !== 1) ||
		!Array.isArray(state.points) ||
		state.points.length !== count ||
		state.points.some(
			(score) => !Number.isInteger(score) || score < 0 || score > 15,
		)
	)
		return false;
	if (
		!Array.isArray(state.gone) ||
		state.gone.length !== count ||
		state.gone.some((gone) => typeof gone !== 'boolean') ||
		!Number.isInteger(state.index) ||
		state.index < 0 ||
		state.index > 4
	)
		return false;
	if (
		!['playing', 'break', 'complete'].includes(state.phase) ||
		(state.phase === 'complete' && state.index !== 4) ||
		(state.phase === 'break' && state.index === 4)
	)
		return false;
	const completed = state.phase === 'playing' ? state.index : state.index + 1;
	if (!Array.isArray(state.legs) || state.legs.length !== completed)
		return false;
	return state.legs.every(
		(leg, i) =>
			leg &&
			leg.gid === state.games[i] &&
			Array.isArray(leg.labels) &&
			leg.labels.length === count &&
			leg.labels.every(
				(label) => typeof label === 'string' && label.length <= 500,
			) &&
			Array.isArray(leg.earned) &&
			leg.earned.length === count &&
			leg.earned.every((score) => [0, 1, 3].includes(score)),
	);
}

if (typeof module !== 'undefined' && module.exports)
	module.exports = {
		CUP_PRESETS,
		chooseCupGames,
		createCupState,
		recordCupLeg,
		advanceCupLeg,
		cupPlacements,
		isCupState,
	};
