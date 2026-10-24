/**
 * Bag & Blade: Combat Engine
 * Turn-based dungeon fights where the backpack IS the deck.
 *
 * Rules in one breath:
 *  - Weapons, shields and scrolls cost Energy; potions and provisions are free but single-use.
 *  - Armor and accessories work passively: armor adds Block at the start of every turn.
 *  - Block you raise lasts until the enemy has acted. Enemy Block lasts until its next turn.
 *  - Burn ticks for its full stack then fades by 1. Chill weakens the next enemy attack.
 */
"use strict";

const Combat = (function () {
	const ENEMIES = [
		{
			name: "Cave Goblin",
			boss: "Goblin Warchief",
			icon: "👺",
			hp: 24,
			intents: [
				{ type: "attack", value: 6, name: "Sneaky Shank" },
				{ type: "attack", value: 9, name: "Dagger Rush" },
				{ type: "block", value: 5, name: "Scrap Buckler" },
			],
		},
		{
			name: "Forest Spider",
			boss: "Brood Mother",
			icon: "🕷️",
			hp: 28,
			intents: [
				{ type: "attack", value: 7, name: "Poisonous Bite" },
				{ type: "buff", value: 3, name: "Venom Web" },
				{ type: "attack", value: 11, name: "Venom Fangs" },
			],
		},
		{
			name: "Restless Skeleton",
			boss: "Skeleton Warlord",
			icon: "💀",
			hp: 38,
			intents: [
				{ type: "block", value: 10, name: "Bone Guard" },
				{ type: "attack", value: 12, name: "Rusty Cleave" },
				{ type: "attack", value: 16, name: "Shield Smash" },
			],
		},
		{
			name: "Shadow Knight",
			boss: "Shadow Champion",
			icon: "🥷",
			hp: 52,
			intents: [
				{ type: "attack", value: 14, name: "Cursed Blade" },
				{ type: "block", value: 15, name: "Iron Bulwark" },
				{ type: "attack", value: 20, name: "Dark Execution" },
			],
		},
		{
			name: "Ancient Wyrm",
			boss: "Elder Wyrm",
			icon: "🐲",
			hp: 78,
			intents: [
				{ type: "attack", value: 18, name: "Fire Breath" },
				{ type: "block", value: 20, name: "Scaly Carapace" },
				{ type: "attack", value: 26, name: "Inferno Nova" },
			],
		},
	];

	const FINAL_FLOOR = 10;
	const events = [];

	function emit(kind, side, value, extra) {
		events.push(Object.assign({ kind, side, value }, extra || {}));
	}

	function log(state, text) {
		state.log.unshift(text);
		if (state.log.length > 40) state.log.length = 40;
	}

	function isBossFloor(floor) {
		return floor % 5 === 0;
	}

	function buildEnemy(floor) {
		const tier = Math.min(ENEMIES.length - 1, Math.floor((floor - 1) / 2));
		const t = ENEMIES[tier];
		const boss = isBossFloor(floor);
		const scale = 1 + 0.08 * (floor - 1);
		const hp = Math.round(t.hp * scale * (boss ? 1.5 : 1));
		return {
			name: boss ? t.boss : t.name,
			icon: t.icon,
			boss,
			maxHp: hp,
			hp,
			block: 0,
			burn: 0,
			chill: 0,
			stunned: false,
			rage: 0,
			intentIndex: 0,
			intents: t.intents.map((it) => ({
				type: it.type,
				name: it.name,
				value:
					it.type === "buff"
						? it.value
						: Math.round(it.value * scale * (boss ? 1.15 : 1)),
			})),
		};
	}

	function describeIntent(intent, rage) {
		if (intent.type === "attack") return `${intent.name} (${intent.value + (rage || 0)} Dmg)`;
		if (intent.type === "block") return `${intent.name} (${intent.value} Block)`;
		return `${intent.name} (+${intent.value} Attack)`;
	}

	/** What the enemy will do next, and what it will cost the player right now. */
	function intentPreview(state) {
		const en = state.enemy;
		if (!en) return null;
		const intent = en.intents[en.intentIndex];
		const out = {
			intent,
			text: describeIntent(intent, en.rage),
			type: intent.type,
			stunned: en.stunned,
		};
		if (intent.type === "attack") {
			let raw = intent.value + en.rage;
			if (en.chill > 0) raw = Math.round(raw * 0.6);
			out.raw = raw;
			out.net = Math.max(0, raw - state.block);
		}
		return out;
	}

	function heal(state, amount, source) {
		const max = Store.maxHp(state);
		const before = state.hp;
		state.hp = Math.min(max, state.hp + amount);
		const gained = state.hp - before;
		if (gained > 0) {
			emit("heal", "player", gained);
			log(state, `💖 ${source} restores ${gained} HP.`);
		}
		return gained;
	}

	function startPlayerTurn(state) {
		const t = Store.calc(state).totals;
		state.block = Math.round(t.armor);
		state.energy = Store.BASE_ENERGY + t.energyBonus;
		state.strength = t.strength;
		state.thorns = 0;
		state.used = [];
		Store.syncHp(state);
		if (t.regen > 0 && state.phase === "fight") heal(state, t.regen, "Regeneration");
	}

	function startFight(state) {
		state.enemy = buildEnemy(state.floor);
		state.phase = "fight";
		state.lastReward = null;
		log(
			state,
			`${state.enemy.boss ? "⚠️ BOSS: " : ""}${state.enemy.name} blocks the way on floor ${state.floor}!`,
		);
		startPlayerTurn(state);
	}

	function dealDamage(state, amount, source, pierce) {
		const en = state.enemy;
		const guard = Math.max(0, en.block - (pierce || 0));
		const absorbed = Math.min(guard, amount);
		en.block -= absorbed;
		const net = amount - absorbed;
		en.hp = Math.max(0, en.hp - net);
		emit("hit", "enemy", net, { absorbed });
		log(
			state,
			`⚔️ ${source} hits for ${amount}${absorbed ? ` (${absorbed} blocked)` : ""}. Enemy ${en.hp}/${en.maxHp}.`,
		);
		return net;
	}

	function applyStatuses(state, eff, source) {
		const en = state.enemy;
		if (eff.burn > 0) {
			en.burn += eff.burn;
			emit("burn", "enemy", eff.burn);
			log(state, `🔥 ${source} sets the enemy ablaze (+${eff.burn} Burn).`);
		}
		if (eff.chill > 0) {
			en.chill = Math.max(en.chill, eff.chill);
			log(state, `❄️ ${source} chills the enemy: its next attack is weaker.`);
		}
		if (eff.stun > 0 && Store.random() < eff.stun) {
			en.stunned = true;
			emit("stun", "enemy", 0);
			log(state, `💫 ${source} stuns the enemy! It will skip its turn.`);
		}
	}

	function fail(reason, code) {
		return { ok: false, reason, code: code || "blocked" };
	}

	/**
	 * Use a bag item. In battle: weapons, shields, scrolls, potions, provisions.
	 * Out of battle: only healing consumables.
	 */
	function useItem(state, uid) {
		const rec = state.bag.get(uid);
		if (!rec) return fail("That item is not in your satchel.");
		const calc = state.bag.calculate();
		const data = calc.items[uid];
		const def = data.def;
		const eff = data.eff;
		const use = def.use;

		if (!use || use === "passive") {
			return fail(`${def.name} works passively while it is packed.`, "passive");
		}
		if (state.phase === "dead") return fail("Your run has ended.");

		const inFight = state.phase === "fight" && !!state.enemy;
		const healsOnly =
			(use === "drink" || use === "eat" || use === "cast") &&
			eff.heal > 0 &&
			!(eff.damage > 0);

		if (!inFight && !healsOnly) {
			return fail(`${def.name} can only be used in battle.`, "no-battle");
		}
		if (state.used.indexOf(uid) !== -1) {
			return fail(`${def.name} was already used this turn.`, "used");
		}
		if (!inFight && state.hp >= Store.maxHp(state)) {
			return fail("You are already at full health.", "full");
		}

		const costs = use === "attack" || use === "guard" || use === "cast";
		const cost = costs && inFight ? def.stats.energy || 1 : 0;
		if (state.energy < cost) {
			return fail(`Not enough Energy (needs ${cost}).`, "energy");
		}
		state.energy -= cost;

		if (use === "attack") {
			let dmg = (eff.damage || 0) + state.strength;
			if (eff.crit > 0 && Store.random() < Math.min(0.95, eff.crit)) {
				dmg *= 2;
				emit("crit", "enemy", dmg);
				log(state, `✨ Critical strike!`);
			}
			dealDamage(state, dmg, def.name, eff.pierce);
			applyStatuses(state, eff, def.name);
			if (eff.lifesteal > 0) heal(state, eff.lifesteal, "Lifesteal");
			Store.sfx("playSwordSlash");
		} else if (use === "guard") {
			state.block += eff.block || 0;
			state.thorns += eff.thorns || 0;
			emit("block", "player", eff.block || 0);
			log(
				state,
				`🛡️ ${def.name} raises ${eff.block} Block${eff.thorns ? ` and ${eff.thorns} Thorns` : ""}.`,
			);
			Store.sfx("playShieldBlock");
		} else if (use === "drink" || use === "eat") {
			if (eff.heal > 0) heal(state, eff.heal, def.name);
			if (inFight) {
				if (eff.restoreEnergy > 0) {
					state.energy += eff.restoreEnergy;
					emit("buff", "player", eff.restoreEnergy, { label: "⚡" });
					log(state, `⚡ ${def.name} restores ${eff.restoreEnergy} Energy.`);
				}
				if (eff.strength > 0) {
					state.strength += eff.strength;
					emit("buff", "player", eff.strength, { label: "💪" });
					log(state, `💪 ${def.name}: +${eff.strength} damage on every attack this turn.`);
				}
				if (eff.block > 0) {
					state.block += eff.block;
					emit("block", "player", eff.block);
					log(state, `🛡️ ${def.name} hardens your skin (+${eff.block} Block).`);
				}
			}
			Store.sfx(use === "drink" ? "playPotionGulp" : "playCoinClink");
		} else if (use === "cast") {
			if (eff.damage > 0) {
				dealDamage(state, eff.damage + state.strength, def.name, eff.pierce);
				applyStatuses(state, eff, def.name);
			}
			if (eff.heal > 0) heal(state, eff.heal, def.name);
			Store.sfx("playSpellCast");
		}

		if (def.consumable) {
			state.bag.remove(uid);
			log(state, def.use === "cast" ? "📜 The scroll crumbles to ash." : "🫙 Used up.");
		} else {
			state.used.push(uid);
		}

		if (inFight && state.enemy.hp <= 0) victory(state);
		return { ok: true };
	}

	/**
	 * One-key turn: raise just enough Block for the telegraphed attack, then swing
	 * everything else by damage-per-energy. Never burns scrolls or potions.
	 */
	function autoTurn(state) {
		if (state.phase !== "fight") return 0;
		let actions = 0;
		const preview = intentPreview(state);

		const ready = (use) => {
			const calc = state.bag.calculate();
			return Object.values(calc.items)
				.filter((d) => d.def.use === use && state.used.indexOf(d.uid) === -1)
				.map((d) => ({ d, cost: d.def.stats.energy || 1 }));
		};

		if (preview && preview.type === "attack" && !preview.stunned) {
			const guards = ready("guard").sort(
				(a, b) => b.d.eff.block / b.cost - a.d.eff.block / a.cost,
			);
			for (const g of guards) {
				if (state.block >= preview.raw) break;
				if (state.energy >= g.cost && useItem(state, g.d.uid).ok) actions++;
			}
		}

		let attacks = ready("attack").sort(
			(a, b) => b.d.eff.damage / b.cost - a.d.eff.damage / a.cost,
		);
		for (const a of attacks) {
			if (state.phase !== "fight") break;
			if (state.energy >= a.cost && useItem(state, a.d.uid).ok) actions++;
		}
		return actions;
	}

	function victory(state) {
		const en = state.enemy;
		const floor = state.floor;
		const boss = !!en.boss;
		const calc = Store.calc(state);

		state.phase = "victory";
		const mult = boss ? 2 : 1;
		let gold = Math.round((14 + floor * 11 + Store.random() * 8) * mult);
		let rep = (8 + floor * 2) * mult;
		const firstClear = floor === FINAL_FLOOR && !state.cleared;
		if (firstClear) {
			gold += 100;
			rep += 50;
			state.cleared = true;
			Store.meta.wins += 1;
		}

		Store.gainGold(state, gold);
		const rankUp = Store.gainRep(rep);
		state.stats.kills += 1;
		Store.meta.bestFloor = Math.max(Store.meta.bestFloor, floor);
		Store.saveMeta();

		const healed = heal(state, Math.round(Store.maxHp(state) * 0.25), "A short rest");

		const loot = [];
		const count = 3 + calc.totals.lootBonus;
		for (let i = 0; i < count; i++) {
			const id = ItemCatalog.rollLoot(floor, {
				luck: calc.totals.lootLuck,
				minRarity: boss && i === 0 ? "rare" : null,
				rng: Store.random,
			});
			const res = Store.addToDesk(state, id);
			loot.push({ id, uid: res.uid || null, sold: res.ok ? 0 : res.sold });
		}

		const newDay = Store.advanceSlots(state, 1);
		state.lastReward = { floor, boss, gold, rep, healed, loot, rankUp, newDay, firstClear };
		log(state, `🏆 ${en.name} is defeated! +${gold} gold, +${rep} reputation.`);
		Store.sfx("playCoinClink");
		Store.sfx("playVictoryFanfare");
	}

	function descend(state) {
		if (state.phase !== "victory") return false;
		state.floor += 1;
		startFight(state);
		return true;
	}

	function defeat(state) {
		state.phase = "dead";
		state.hp = 0;
		Store.meta.bestFloor = Math.max(Store.meta.bestFloor, state.floor);
		Store.saveMeta();
		log(state, `☠️ You collapse on floor ${state.floor}.`);
		Store.sfx("playDefeatSound");
	}

	function enemyTurn(state) {
		const en = state.enemy;
		en.block = 0;

		if (en.burn > 0) {
			const burn = en.burn;
			en.hp = Math.max(0, en.hp - burn);
			en.burn = Math.max(0, burn - 1);
			emit("burn", "enemy", burn, { tick: true });
			log(state, `🔥 Burn scorches the enemy for ${burn}.`);
			if (en.hp <= 0) {
				victory(state);
				return;
			}
		}

		if (en.stunned) {
			en.stunned = false;
			log(state, `💫 ${en.name} is stunned and loses its turn.`);
		} else {
			const intent = en.intents[en.intentIndex];
			if (intent.type === "attack") {
				let dmg = intent.value + en.rage;
				if (en.chill > 0) dmg = Math.round(dmg * 0.6);
				const dodge = Store.calc(state).totals.dodge;
				if (dodge > 0 && Store.random() < dodge) {
					emit("dodge", "player", 0);
					log(state, `💨 You dodge ${intent.name}!`);
				} else {
					const absorbed = Math.min(state.block, dmg);
					state.block -= absorbed;
					const net = dmg - absorbed;
					state.hp -= net;
					emit("hit", "player", net, { absorbed });
					log(
						state,
						`${en.icon} ${intent.name} hits for ${dmg}${absorbed ? ` (${absorbed} blocked)` : ""}.`,
					);
					Store.sfx(absorbed >= dmg ? "playShieldBlock" : "playSwordSlash");
					if (state.thorns > 0 && en.hp > 0) {
						en.hp = Math.max(0, en.hp - state.thorns);
						emit("hit", "enemy", state.thorns, { thorns: true });
						log(state, `🌵 Thorns punish the attacker for ${state.thorns}.`);
					}
				}
			} else if (intent.type === "block") {
				en.block += intent.value;
				emit("block", "enemy", intent.value);
				log(state, `🛡️ ${en.name} braces behind ${intent.value} Block.`);
			} else {
				en.rage += intent.value;
				emit("buff", "enemy", intent.value, { label: "😡" });
				log(state, `😡 ${en.name} enrages (+${intent.value} Attack).`);
			}
		}
		if (en.chill > 0) en.chill -= 1;

		if (state.hp <= 0) {
			defeat(state);
			return;
		}
		if (en.hp <= 0) {
			victory(state);
			return;
		}
		en.intentIndex = (en.intentIndex + 1) % en.intents.length;
		startPlayerTurn(state);
	}

	function endTurn(state) {
		if (state.phase !== "fight" || !state.enemy) return false;
		enemyTurn(state);
		return true;
	}

	return {
		ENEMIES,
		FINAL_FLOOR,
		isBossFloor,
		buildEnemy,
		describeIntent,
		intentPreview,
		startFight,
		startPlayerTurn,
		useItem,
		autoTurn,
		endTurn,
		descend,
		drainEvents: function () {
			return events.splice(0, events.length);
		},
	};
})();
