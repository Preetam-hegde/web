'use strict';

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function registry() {
	const path = new URL('../js/registry.js', import.meta.url);
	assert(existsSync(path), 'the shared game registry must exist');
	const context = vm.createContext({ module: { exports: {} } });
	vm.runInContext(readFileSync(path, 'utf8'), context);
	return context.module.exports;
}

const game = (id = 'test') => ({
	id,
	name: 'Test game',
	icon: '🎯',
	group: 'timing',
	blurb: 'A test game.',
	lowerIsBetter: true,
	config: () => ({ target: 5 }),
	intro: () => 'Hit five.',
	play() {},
});
const partyGame = (id = 'party-test') => ({
	id,
	name: 'Party test',
	blurb: 'A party test.',
	need: 'Two players.',
	steps: ['Take turns.'],
	win: 'Most points.',
	run() {},
});

test('registration preserves game identity and its stateful hooks', () => {
	const { gameCatalog, registerGame, GAMES, PARTY } = registry();
	const entry = game();
	entry.config = () => entry;
	assert.equal(registerGame(entry), entry);
	assert.equal(GAMES[0], entry);
	assert.equal(GAMES[0].config(), entry);
	assert.equal(gameCatalog.games, GAMES);
	assert.equal(gameCatalog.party, PARTY);
});

test('duplicate identifiers are rejected across both catalogs without adding an entry', () => {
	const { registerGame, registerPartyGame, GAMES, PARTY } = registry();
	registerGame(game('shared'));
	assert.throws(() => registerGame(game('shared')), /duplicate/i);
	assert.throws(() => registerPartyGame(partyGame('shared')), /duplicate/i);
	assert.equal(GAMES.length, 1);
	assert.equal(PARTY.length, 0);
	registerPartyGame(partyGame('party-first'));
	assert.throws(() => registerGame(game('party-first')), /duplicate/i);
});

test('invalid identifiers, missing hooks and unknown categories are rejected', () => {
	const { registerGame, registerPartyGame, GAMES, PARTY } = registry();
	for (const id of [
		'',
		'Bad ID',
		'<button>',
		'../game',
		'game/name',
		'-game',
	]) {
		assert.throws(() => registerGame(game(id)), /id/i);
	}
	for (const field of ['name', 'icon', 'blurb', 'config', 'intro', 'play']) {
		const entry = game();
		delete entry[field];
		assert.throws(() => registerGame(entry), new RegExp(field));
	}
	assert.throws(
		() => registerGame({ ...game(), group: 'unknown' }),
		/category/i,
	);
	assert.throws(() => registerGame(null), /game/i);
	for (const field of ['name', 'blurb', 'need', 'steps', 'win', 'run']) {
		const entry = partyGame();
		delete entry[field];
		assert.throws(() => registerPartyGame(entry), new RegExp(field));
	}
	assert.throws(
		() => registerPartyGame({ ...partyGame(), steps: [] }),
		/steps/i,
	);
	assert.throws(
		() => registerPartyGame({ ...partyGame(), steps: [''] }),
		/steps/i,
	);
	assert.equal(GAMES.length + PARTY.length, 0);
});

test('solo and room eligibility retain current duel, co-op and device restrictions', () => {
	const { canSolo, groupOk } = registry();
	for (const [flags, solo, group] of [
		[{}, true, true],
		[{ duel: true }, false, false],
		[{ coop: true }, false, false],
		[{ duel: true, soloOk: true }, true, false],
		[{ coop: true, soloOk: true }, true, true],
		[{ passOnly: true }, true, false],
		[{ splitOnly: true }, true, false],
		[{ words: true }, true, false],
	]) {
		assert.equal(canSolo(flags), solo);
		assert.equal(groupOk(flags), group);
	}
});

test('score direction and co-op result hooks are checked before a game can start', () => {
	const { registerGame, GAMES } = registry();
	const noDirection = game();
	delete noDirection.lowerIsBetter;
	assert.throws(() => registerGame(noDirection), /lowerIsBetter/);
	assert.throws(() => registerGame({ ...game(), coop: true }), /verdict/);
	assert.throws(
		() => registerGame({ ...game(), coop: true, verdict() {} }),
		/summary/,
	);
	for (const rounds of [0, -1, 1.5, '5'])
		assert.throws(() => registerGame({ ...game(), rounds }), /rounds/);
	assert.equal(GAMES.length, 0);
});
