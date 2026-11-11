'use strict';

const gameCatalog = {
	games: [],
	party: [],
	categories: [
		{
			id: 'reflex',
			name: 'Reflex',
			icon: 'frenzy',
			blurb: 'Fast fingers. Who reacts first?',
		},
		{
			id: 'timing',
			name: 'Timing',
			icon: 'stop',
			blurb: 'Feel the clock and stop it on the mark.',
		},
		{
			id: 'rhythm',
			name: 'Rhythm',
			icon: 'tempo',
			blurb: 'Keep the beat, copy the groove, tap in sync.',
		},
		{
			id: 'perception',
			name: 'Perception',
			icon: 'track',
			blurb: 'Count, track and judge it by eye.',
		},
		{
			id: 'match',
			name: 'Match',
			icon: 'pitch',
			blurb: 'Hear it, see it, size it. Then match it from memory.',
		},
		{
			id: 'brain',
			name: 'Brain & Board',
			icon: 'memory',
			blurb: 'Tic-Tac-Toe, Connect 4, memory and word duels.',
		},
		{
			id: 'couple',
			name: 'Couple',
			icon: 'know',
			blurb: 'Questions, dares and games to share.',
		},
	],
};
const GAMES = gameCatalog.games;
const PARTY = gameCatalog.party;

function validateGame(game, party) {
	if (!game || typeof game !== 'object')
		throw new TypeError('A game object is required');
	if (
		typeof game.id !== 'string' ||
		!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(game.id)
	)
		throw new TypeError(
			'Game id must use lowercase letters, numbers and hyphens',
		);
	if ([...GAMES, ...PARTY].some((entry) => entry.id === game.id))
		throw new Error(`Duplicate game id: ${game.id}`);
	const fields = party
		? ['name', 'blurb', 'need', 'win']
		: ['name', 'icon', 'blurb'];
	for (const field of fields) {
		if (typeof game[field] !== 'string' || !game[field].trim())
			throw new TypeError(`${game.id}: ${field} is required`);
	}
	for (const hook of party ? ['run'] : ['config', 'intro', 'play']) {
		if (typeof game[hook] !== 'function')
			throw new TypeError(`${game.id}: ${hook} must be a function`);
	}
	if (party) {
		if (
			!Array.isArray(game.steps) ||
			!game.steps.length ||
			game.steps.some((step) => typeof step !== 'string' || !step.trim())
		)
			throw new TypeError(`${game.id}: steps must contain instructions`);
	} else {
		if (!gameCatalog.categories.some((category) => category.id === game.group))
			throw new TypeError(`${game.id}: unknown category ${game.group}`);
		if (typeof game.lowerIsBetter !== 'boolean')
			throw new TypeError(`${game.id}: lowerIsBetter must be a boolean`);
		if (
			game.rounds !== undefined &&
			(!Number.isInteger(game.rounds) || game.rounds < 1)
		)
			throw new TypeError(`${game.id}: rounds must be a positive integer`);
		if (game.coop)
			for (const hook of ['verdict', 'summary']) {
				if (typeof game[hook] !== 'function')
					throw new TypeError(
						`${game.id}: ${hook} must be a function for co-op games`,
					);
			}
	}
}

function registerGame(game) {
	validateGame(game, false);
	GAMES.push(game);
	return game;
}

function registerPartyGame(game) {
	validateGame(game, true);
	PARTY.push(game);
	return game;
}

const canSolo = (game) => (!game.duel && !game.coop) || !!game.soloOk;
const groupOk = (game) =>
	canSolo(game) &&
	!game.duel &&
	!game.passOnly &&
	!game.splitOnly &&
	!game.words;

if (typeof module !== 'undefined' && module.exports)
	module.exports = {
		gameCatalog,
		GAMES,
		PARTY,
		registerGame,
		registerPartyGame,
		canSolo,
		groupOk,
	};
