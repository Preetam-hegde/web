"use strict";

/**
 * ComicClash Turn-Based Comic Strip Combat Engine
 * Waves, status effects, hero kits, boss specials, combo chains, auto-battle and an endless mode.
 */

const COMIC_SOUND_WORDS = [
	"POW!",
	"BAM!",
	"KAPOW!",
	"WHAM!",
	"ZAP!",
	"KRAK!",
	"CRUNCH!",
	"BOOM!",
];

const STATUS_KEYS = [
	"stun",
	"bleed",
	"atkDown",
	"atkUp",
	"defDown",
	"mark",
	"evade",
	"taunt",
	"guard",
	"crit",
	"immuneCrit",
];

let combatUid = 0;

function freshStatus() {
	const st = { guaranteedCrit: false };
	STATUS_KEYS.forEach((k) => (st[k] = 0));
	return st;
}

class ComicCombatEngine {
	constructor(gameState, onEvent) {
		this.gameState = gameState;
		this.onEvent = onEvent || (() => {});
		this.currentIssue = null;
		this.session = 0;
		this.turn = 1;
		this.waveIndex = 0;
		this.waveCount = 1;
		this.heroes = [];
		this.villains = [];
		this.activeHeroIndex = 0;
		this.selectedTarget = 0;
		this.isPlayerTurn = true;
		this.isGameOver = false;
		this.auto = false;
		this.fast = false;
		this.combo = 0;
		this.wavesCleared = 0;
		this.faintedCount = 0;
		this.log = [];
		this.mutator = null;
		this.blockOn = true;
		this.blockState = null;
		this.timingMult = 1;
		this.mut = { ...DEFAULT_MUT };
		this.lastActor = null;
		this.pairBonus = 0;
		this.activePair = null;
	}

	get pace() {
		return this.fast ? 0.5 : 1;
	}

	/** Session-guarded setTimeout: silently dropped if the battle was restarted or abandoned. */
	later(fn, ms) {
		const token = this.session;
		setTimeout(() => {
			if (token === this.session) fn();
		}, ms * this.pace);
	}

	destroy() {
		this.session++;
		this.isGameOver = true;
	}

	/** Passive squad bonuses based on affinity composition. */
	getSynergy(teamIds) {
		const affs = teamIds
			.map((id) => HEROES_MAP.get(id))
			.filter(Boolean)
			.map((h) => h.affinity);
		if (affs.length === 3 && new Set(affs).size === 1) {
			return { atk: 1.15, hp: 1, label: "MONO-AFFINITY: +15% ATK" };
		}
		if (affs.length === 3 && new Set(affs).size === 3) {
			return { atk: 1, hp: 1.1, label: "BALANCED SQUAD: +10% HP" };
		}
		if (new Set(affs).size === 2) {
			return { atk: 1.05, hp: 1.05, label: "DUO LINK: +5% ATK / +5% HP" };
		}
		return { atk: 1, hp: 1, label: "NO SYNERGY" };
	}

	buildHero(heroId) {
		const heroData = HEROES_MAP.get(heroId);
		const inv = this.gameState.inventory[heroId] || { level: 1, rank: 1 };
		const rankMult = 1 + (inv.rank - 1) * 0.15;
		const levelMult = 1 + (inv.level - 1) * 0.08;
		const syn = this.getSynergy(this.gameState.team);

		const maxHp = Math.round(heroData.baseHp * levelMult * rankMult * syn.hp);
		const atk = Math.round(heroData.baseAtk * levelMult * rankMult * syn.atk);
		const def = Math.round(heroData.baseDef * levelMult * rankMult);

		return {
			uid: ++combatUid,
			id: heroData.id,
			name: heroData.name,
			rarity: heroData.rarity,
			affinity: heroData.affinity,
			maxHp,
			hp: maxHp,
			atk,
			def,
			energy: this.mut.startEnergy || 0,
			skillCd: 0,
			shield: 0,
			quote: heroData.quote,
			basic: heroData.basic,
			skill: heroData.skill,
			ultimate: heroData.ultimate,
			colors: heroData.colors,
			artSvg: heroData.artSvg,
			st: freshStatus(),
			tacticCd: { guard: 0, focus: 0 },
			isHero: true,
		};
	}

	buildVillain(template) {
		const diff = this.currentIssue.diff || 1;
		const maxHp = Math.round(template.maxHp * ENEMY_SCALE.hp * diff * this.mut.enemyHp);
		return {
			...template,
			def: Math.round(template.def * this.mut.enemyDef),
			atk: Math.round(template.atk * ENEMY_SCALE.atk * Math.sqrt(diff)),
			uid: ++combatUid,
			maxHp,
			hp: maxHp,
			shield: 0,
			st: freshStatus(),
			cd: template.special ? template.special.cd : 0,
			isHero: false,
		};
	}

	/** Initializes a battle with the player's active squad against an issue's waves. */
	startBattle(issueId, opts = {}) {
		this.session++;
		this.mutator = opts.mutator || null;
		this.mut = { ...DEFAULT_MUT, ...(this.mutator ? this.mutator.mods : {}) };
		this.lastActor = null;
		this.pairBonus = 0;
		this.activePair = null;
		const issue =
			issueId === "endless"
				? ENDLESS_ISSUE
				: ISSUES_CAMPAIGN.find((i) => i.id === issueId) || ISSUES_CAMPAIGN[0];
		this.currentIssue = issue;
		this.turn = 1;
		this.waveIndex = 0;
		this.waveCount = issue.endless ? Infinity : issue.waves.length;
		this.wavesCleared = 0;
		this.faintedCount = 0;
		this.isGameOver = false;
		this.inTransition = false;
		this.isPlayerTurn = true;
		this.activeHeroIndex = 0;
		this.selectedTarget = 0;
		this.combo = 0;
		this.log = [];

		this.heroes =this.gameState.team.map((id) => this.buildHero(id));
		this.spawnWave();

		this.logAction(
			issue.endless
				? this.mutator
					? `MUTATOR GAUNTLET — ${this.mutator.name}! ${this.mutator.desc}`
					: `The Infinite Gauntlet begins! Survive as many waves as you can!`
				: `Comic Battle Commenced! Reading Issue ${issue.issueNo}: "${issue.title}"!`,
		);
		this.onEvent("battle_start", {
			issue,
			heroes: this.heroes,
			villains: this.villains,
		});
		this.onEvent("turn_change", { activeHero: this.getActiveHero(), isPlayer: true });
		this.scheduleAuto();
	}

	spawnWave() {
		const issue = this.currentIssue;
		const templates = issue.endless
			? buildEndlessWave(this.waveIndex + 1, this.mut.bossOnly)
			: issue.waves[this.waveIndex];
		this.villains = templates.map((t) => this.buildVillain(t));
		this.selectedTarget = 0;
	}

	getActiveHero() {
		return this.heroes[this.activeHeroIndex];
	}

	getLivingVillains() {
		return this.villains.filter((v) => v.hp > 0);
	}

	getLivingHeroes() {
		return this.heroes.filter((h) => h.hp > 0);
	}

	getFirstLivingVillain() {
		return this.villains.find((v) => v.hp > 0) || null;
	}

	setTarget(index) {
		if (this.villains[index] && this.villains[index].hp > 0) {
			this.selectedTarget = index;
		}
	}

	ensureValidTarget() {
		const selected = this.villains[this.selectedTarget];
		if (!selected || selected.hp <= 0) {
			this.selectedTarget = Math.max(
				0,
				this.villains.findIndex((v) => v.hp > 0),
			);
		}
	}

	setAuto(on) {
		this.auto = !!on;
		this.scheduleAuto();
	}

	getAffinityMultiplier(attackerAffinity, targetAffinity) {
		const config = HERO_AFFINITIES[attackerAffinity];
		if (config && config.beats === targetAffinity) return 1.3;
		const targetConfig = HERO_AFFINITIES[targetAffinity];
		if (targetConfig && targetConfig.beats === attackerAffinity) return 0.8;
		return 1.0;
	}

	getComboBonus() {
		return Math.min(0.2, Math.max(0, (this.combo - 1) * 0.05));
	}

	// ── Damage pipeline ─────────────────────────────────────────────────────
	calcDamage(attacker, target, mult, opts = {}) {
		const atk =
			attacker.atk *
			(attacker.st.atkUp > 0 ? 1.25 : 1) *
			(attacker.st.atkDown > 0 ? 0.75 : 1);
		let def = target.def * (target.st.defDown > 0 ? 0.7 : 1);
		if (opts.pierce) def *= 0.25;

		let critChance = attacker.isHero ? 0.25 : 0.15;
		if (attacker.st.crit > 0) critChance += 0.3;
		let isCrit =
			!!opts.forceCrit ||
			attacker.st.guaranteedCrit ||
			Math.random() < critChance;
		if (target.st.immuneCrit > 0) isCrit = false;

		const affinityMult = this.getAffinityMultiplier(
			attacker.affinity,
			target.affinity,
		);
		let raw =
			atk *
			mult *
			(isCrit ? 1.5 : 1) *
			affinityMult *
			(target.st.mark > 0 ? 1.25 : 1) *
			(target.st.guard > 0 ? 0.5 : 1);
		if (attacker.isHero) {
			raw *= 1 + this.getComboBonus();
			if (this.pairBonus) raw *= 1 + this.pairBonus;
			raw *= this.timingMult || 1;
			raw *= this.mut.dmgHero;
		} else {
			raw *= this.mut.dmgEnemy;
		}

		const dmg = Math.max(10, Math.round(raw - def * 0.35));
		return { dmg, isCrit, weakness: affinityMult > 1.1, resisted: affinityMult < 0.9 };
	}

	applyDamage(target, dmg) {
		let absorbed = 0;
		if (target.shield > 0) {
			absorbed = Math.min(target.shield, dmg);
			target.shield -= absorbed;
			dmg -= absorbed;
		}
		const wasAlive = target.hp > 0;
		target.hp = Math.max(0, target.hp - dmg);
		if (wasAlive && target.hp <= 0) this.onUnitDown(target);
		return absorbed;
	}

	onUnitDown(unit) {
		this.onEvent("unit_down", { unit });
		if (unit.isHero) {
			this.faintedCount++;
			this.logAction(`${unit.name} is knocked out!`);
		} else {
			this.gameState.track("kill");
			this.logAction(`${unit.name} is down for the count!`);
		}
	}

	/** One strike: damage, FX event, tracking. */
	strike(attacker, target, mult, opts = {}) {
		if (target.hp <= 0) return null;

		// Evasion (only against villain-on-hero hits)
		if (target.st.evade > 0 && !attacker.isHero) {
			target.st.evade--;
			this.onEvent("miss", { target });
			this.logAction(`${target.name} dodges ${attacker.name}'s attack!`);
			return { dmg: 0, missed: true };
		}

		const res = this.calcDamage(attacker, target, mult, opts);
		const absorbed = this.applyDamage(target, res.dmg);
		if (attacker.st.guaranteedCrit && res.isCrit) attacker.st.guaranteedCrit = false;
		if (res.isCrit && attacker.isHero) this.gameState.track("crit");

		if (target.isHero) target.energy = Math.min(100, target.energy + 10);

		this.onEvent("action_hit", {
			attacker,
			target,
			damage: res.dmg,
			absorbed,
			isCrit: res.isCrit,
			weakness: res.weakness,
			resisted: res.resisted,
			onom: opts.silent
				? null
				: opts.onom ||
					COMIC_SOUND_WORDS[Math.floor(Math.random() * COMIC_SOUND_WORDS.length)],
		});
		return res;
	}

	playSfx(sfx, heavy = false) {
		if (sfx === "laser") ComicAudio.playLaser();
		else if (sfx === "slash") ComicAudio.playSlash();
		else if (sfx === "fanfare") ComicAudio.playCoin();
		else ComicAudio.playPunch(heavy || sfx === "heavy");
	}

	// ── Status helpers ──────────────────────────────────────────────────────
	pickAllies(hero, who) {
		const living = this.getLivingHeroes();
		if (who === "self") return [hero];
		if (who === "all") return living;
		if (who === "lowest") {
			const sorted = [...living].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
			return sorted.length ? [sorted[0]] : [];
		}
		return [hero];
	}

	applyDebuffs(target, debuff) {
		if (!debuff || target.hp <= 0) return;
		const t = target.st;
		if (debuff.atkDown) t.atkDown = Math.max(t.atkDown, debuff.atkDown);
		if (debuff.defDown) t.defDown = Math.max(t.defDown, debuff.defDown);
		if (debuff.bleed) t.bleed = Math.max(t.bleed, debuff.bleed);
		if (debuff.mark) t.mark = Math.max(t.mark, debuff.mark);
		if (debuff.stun && Math.random() < (debuff.stun.chance ?? 1)) {
			const resist = target.isBoss ? 0.5 : 1;
			if (Math.random() < resist) {
				t.stun = Math.max(t.stun, debuff.stun.turns || 1);
				this.logAction(`${target.name} is STUNNED!`);
			} else {
				this.logAction(`${target.name} shrugs off the stun!`);
			}
		}
	}

	healUnit(unit, amount) {
		if (unit.hp <= 0) return;
		const before = unit.hp;
		unit.hp = Math.min(unit.maxHp, unit.hp + amount);
		this.onEvent("heal", { unit, amount: unit.hp - before });
	}

	// ── Hero actions ────────────────────────────────────────────────────────
	pickTargets(spec, primary) {
		const living = this.getLivingVillains();
		switch (spec.target) {
			case "all":
				return living;
			case "chain": {
				const others = living.filter((v) => v !== primary);
				const second = others[Math.floor(Math.random() * others.length)];
				return second ? [primary, second] : [primary];
			}
			case "lowest":
				return [[...living].sort((a, b) => a.hp - b.hp)[0]];
			case "strongest":
				return [[...living].sort((a, b) => b.maxHp - a.maxHp)[0]];
			default:
				return [primary];
		}
	}

	resolveKit(hero, spec, primary, sfx, heavy = false) {
		this.playSfx(sfx, heavy);
		const targets = this.pickTargets(spec, primary);
		const hits = spec.hits || 1;
		const dmgPerHit = (spec.dmg || 0) / hits;
		let first = true;
		let dealt = 0;

		if (dmgPerHit > 0) {
			targets.forEach((target) => {
				for (let i = 0; i < hits; i++) {
					const r = this.strike(hero, target, dmgPerHit, {
						forceCrit: spec.crit,
						pierce: spec.pierce,
						silent: !first,
					});
					if (r && r.dmg) dealt += r.dmg;
					first = false;
				}
				this.applyDebuffs(target, spec.debuff);
			});
			if (spec.splash) {
				this.getLivingVillains()
					.filter((v) => !targets.includes(v))
					.forEach((v) => {
						this.strike(hero, v, spec.splash, { silent: true });
					});
			}
		} else {
			targets.forEach((t) => this.applyDebuffs(t, spec.debuff));
		}

		if (spec.lifesteal && dealt > 0) {
			this.healUnit(hero, Math.round(dealt * spec.lifesteal));
		}
		this.applySupport(hero, spec);
	}

	/** Heal / shield / energy / cleanse / buff effects shared by kits and pair combos. */
	applySupport(hero, spec) {
		if (spec.energy) {
			this.pickAllies(hero, spec.energy.who).forEach((a) => {
				a.energy = Math.min(100, a.energy + spec.energy.amt);
				this.onEvent("energy", { unit: a, amount: spec.energy.amt });
			});
		}
		if (spec.cleanse) {
			this.pickAllies(hero, spec.cleanse.who).forEach((a) => {
				["stun", "defDown", "atkDown", "bleed"].forEach((k) => (a.st[k] = 0));
				this.onEvent("cleanse", { unit: a });
			});
		}
		if (spec.heal) {
			this.pickAllies(hero, spec.heal.who).forEach((a) =>
				this.healUnit(a, Math.round(a.maxHp * spec.heal.pct)),
			);
		}
		if (spec.shield) {
			this.pickAllies(hero, spec.shield.who).forEach((a) => {
				a.shield += Math.round(a.maxHp * spec.shield.pct);
				this.onEvent("shield", { unit: a });
			});
		}
		if (spec.buff) {
			const b = spec.buff;
			this.pickAllies(hero, b.who).forEach((a) => {
				if (b.atkUp) a.st.atkUp = Math.max(a.st.atkUp, b.atkUp);
				if (b.evade) a.st.evade = Math.max(a.st.evade, b.evade);
				if (b.crit) a.st.crit = Math.max(a.st.crit, b.crit);
				if (b.taunt) a.st.taunt = Math.max(a.st.taunt, b.taunt);
				if (b.guard) a.st.guard = Math.max(a.st.guard, b.guard);
				if (b.immuneCrit) a.st.immuneCrit = Math.max(a.st.immuneCrit, b.immuneCrit);
				if (b.guaranteed) a.st.guaranteedCrit = true;
			});
		}
	}

	executeHeroAction(actionType, targetIndex = this.selectedTarget, opts = {}) {
		if (!this.isPlayerTurn || this.isGameOver) return;
		this.timingMult = opts.timing || 1;
		const hero = this.getActiveHero();
		if (!hero || hero.hp <= 0) {
			this.advanceHero();
			return;
		}

		let primary = this.villains[targetIndex];
		if (!primary || primary.hp <= 0) primary = this.getFirstLivingVillain();
		if (!primary) return;

		const kit = HERO_KITS[hero.id] || DEFAULT_KIT;

		if (actionType === "basic") {
			hero.energy = Math.min(100, hero.energy + 30);
			this.playSfx(hero.basic.sfx || "punch");
			this.logAction(`${hero.name} strikes ${primary.name} with ${hero.basic.name}!`);
			this.onEvent("move_used", { hero, kind: "basic", move: hero.basic, target: primary });
			this.beginPairCombo(hero);
			this.combo++;
			this.strike(hero, primary, hero.basic.power || 1.0);
		} else if (actionType === "skill") {
			if (hero.skillCd > 0) return;
			hero.skillCd = hero.skill.cd || 3;
			hero.energy = Math.min(100, hero.energy + 20);
			this.logAction(`${hero.name} uses ${hero.skill.name}!`);
			this.onEvent("move_used", { hero, kind: "skill", move: hero.skill, target: primary });
			this.beginPairCombo(hero);
			this.combo++;
			this.resolveKit(hero, kit.skill, primary, hero.skill.sfx || "laser");
		} else if (actionType === "ultimate") {
			if (hero.energy < 100) return;
			hero.energy = 0;
			this.gameState.track("ult");
			this.onEvent("ultimate_cutin", { hero, quote: hero.quote, target: primary });
			this.logAction(`★ ULTIMATE BURST ★ ${hero.name}: "${hero.quote}"`);
			this.beginPairCombo(hero);
			this.combo++;
			this.resolveKit(hero, kit.ult, primary, "heavy", true);
			this.onEvent("screen_shake", { big: true });
		} else if (actionType === "guard" || actionType === "focus" || actionType === "finisher") {
			if (!this.useTactic(actionType, hero, primary)) return;
		} else {
			return;
		}

		this.finishPairCombo(hero, primary);
		this.timingMult = 1;
		if (opts.energyBonus) hero.energy = Math.min(100, hero.energy + opts.energyBonus);
		this.lastActor = hero;
		this.onEvent("combo", { combo: this.combo, bonus: this.getComboBonus() });
		this.checkBattleStatus();
		if (!this.isGameOver && this.isPlayerTurn) this.advanceHero();
	}

	/** Detects pair combos (named duos) and affinity chain reactions for the acting hero. */
	beginPairCombo(hero) {
		this.pairBonus = 0;
		this.activePair = null;
		const prev = this.lastActor;
		if (!prev || prev === hero) return;
		const combo = HERO_COMBOS.find(
			(c) => (c.a === prev.id && c.b === hero.id) || (c.b === prev.id && c.a === hero.id),
		);
		if (combo) {
			this.activePair = combo;
			this.pairBonus += combo.bonus;
			this.gameState.markCombo(combo.id);
			this.gameState.track("pairs");
			this.logAction(`⚡ ${combo.name}! ${prev.name} + ${hero.name} link up!`);
			this.onEvent("pair_combo", { combo, hero, partner: prev });
		}
		if (HERO_AFFINITIES[prev.affinity].beats === hero.affinity) {
			this.pairBonus += 0.1;
			hero.energy = Math.min(100, hero.energy + 10);
			this.onEvent("chain", { hero, from: prev });
		}
	}

	finishPairCombo(hero, primary) {
		const c = this.activePair;
		if (c) {
			if (c.debuff && primary) this.applyDebuffs(primary, c.debuff);
			this.applySupport(hero, c);
		}
		this.pairBonus = 0;
		this.activePair = null;
	}

	/** Tactic cards: Brace Up / Focus Fire / Combo Breaker. Returns false if unavailable. */
	canUseTactic(kind, hero = this.getActiveHero()) {
		if (!hero) return false;
		if (kind === "finisher") return this.combo >= 2;
		return (hero.tacticCd[kind] || 0) === 0;
	}

	useTactic(kind, hero, primary) {
		if (!this.canUseTactic(kind, hero)) return false;
		const t = TACTICS[kind];
		this.gameState.track("tactic");
		this.onEvent("move_used", {
			hero,
			kind,
			move: { name: t.name, desc: t.desc },
			tags: t.tags.map((x) => x.text).slice(0, 2),
			target: kind === "finisher" ? this.getFirstLivingVillain() : null,
		});
		if (kind === "guard") {
			hero.tacticCd.guard = t.cd;
			hero.shield += Math.round(hero.maxHp * 0.2);
			hero.st.guard = Math.max(hero.st.guard, 1);
			hero.energy = Math.min(100, hero.energy + 20);
			this.onEvent("shield", { unit: hero });
			ComicAudio.playCoin();
			this.logAction(`${hero.name} braces up behind a shield!`);
		} else if (kind === "focus") {
			hero.tacticCd.focus = t.cd;
			hero.energy = Math.min(100, hero.energy + 45);
			primary.st.mark = Math.max(primary.st.mark, 1);
			this.onEvent("energy", { unit: hero, amount: 45 });
			ComicAudio.playLaser();
			this.logAction(`${hero.name} calls the shot: ${primary.name} is marked!`);
		} else {
			const steps = this.combo;
			this.combo = 0;
			hero.energy = Math.min(100, hero.energy + 20);
			this.logAction(`★ COMBO BREAKER ★ ${hero.name} cashes in a x${steps} combo!`);
			ComicAudio.playPunch(true);
			this.onEvent("screen_shake", { big: true });
			const mult = 1.3 + 0.25 * steps;
			this.getLivingVillains().forEach((v, i) =>
				this.strike(hero, v, mult, { forceCrit: false, silent: i > 0, onom: "COMBO!" }),
			);
			this.combo = 1; // the finisher itself starts a fresh chain
		}
		return true;
	}

	/** Move to the next acting hero (skipping fainted/stunned), or hand over to villains. */
	advanceHero() {
		let idx = this.activeHeroIndex + 1;
		while (idx < this.heroes.length) {
			const h = this.heroes[idx];
			if (h.hp > 0) {
				if (h.st.stun > 0) {
					h.st.stun--;
					this.logAction(`${h.name} is stunned and loses their turn!`);
				} else {
					break;
				}
			}
			idx++;
		}

		if (idx < this.heroes.length) {
			this.activeHeroIndex = idx;
			this.onEvent("turn_change", { activeHero: this.getActiveHero(), isPlayer: true });
			this.scheduleAuto();
		} else {
			this.isPlayerTurn = false;
			this.onEvent("turn_change", { isPlayer: false });
			this.later(() => this.executeVillainsTurn(), 650);
		}
	}

	// ── Villain turn ────────────────────────────────────────────────────────
	pickHeroTarget() {
		const living = this.getLivingHeroes();
		const taunters = living.filter((h) => h.st.taunt > 0);
		const pool = taunters.length ? taunters : living;
		return pool[Math.floor(Math.random() * pool.length)];
	}

	executeVillainsTurn() {
		if (this.isGameOver) return;
		const queue = this.getLivingVillains();

		const step = (i) => {
			if (this.isGameOver || this.inTransition) return;
			if (i >= queue.length) {
				this.later(() => this.startPlayerRound(), 450);
				return;
			}
			const villain = queue[i];
			if (villain.hp <= 0) {
				step(i + 1);
				return;
			}
			this.villainAct(villain, () => {
				if (this.isGameOver || this.inTransition) return;
				this.later(() => step(i + 1), 600);
			});
		};
		step(0);
	}

	tickDown(unit) {
		STATUS_KEYS.forEach((k) => {
			if (k !== "bleed" && k !== "stun" && unit.st[k] > 0) unit.st[k]--;
		});
	}

	villainAct(villain, done = () => {}) {
		const end = () => {
			this.tickDown(villain);
			this.checkBattleStatus();
			done();
		};

		// Bleed damage
		if (villain.st.bleed > 0) {
			villain.st.bleed--;
			const dmg = Math.max(15, Math.round(villain.maxHp * 0.06));
			this.applyDamage(villain, dmg);
			this.onEvent("dot", { unit: villain, damage: dmg });
			this.logAction(`${villain.name} bleeds for ${dmg} damage!`);
			this.checkBattleStatus();
			if (this.isGameOver || villain.hp <= 0) {
				done();
				return;
			}
		}

		if (villain.st.stun > 0) {
			villain.st.stun--;
			this.logAction(`${villain.name} is stunned and can't move!`);
			this.tickDown(villain);
			done();
			return;
		}

		const target = this.pickHeroTarget();
		if (!target) {
			this.checkBattleStatus();
			done();
			return;
		}

		if (villain.special) {
			villain.cd--;
			if (villain.cd <= 0) {
				villain.cd = villain.special.cd;
				this.bossSpecial(villain, target);
				end();
				return;
			}
		}

		ComicAudio.playPunch(villain.isBoss);
		const land = (quality) => {
			const mult = { perfect: 0.2, good: 0.5, weak: 0.85, none: 1 }[quality];
			const res = this.strike(villain, target, mult, {
				onom: quality === "perfect" ? "BLOCKED!" : villain.isBoss ? "KRAK!" : "THUD!",
			});
			if (res && !res.missed) {
				const tag = quality === "none" ? "" : ` (${quality.toUpperCase()} BLOCK)`;
				this.logAction(`${villain.name} attacked ${target.name} for ${res.dmg} DMG!${tag}`);
			}
			if (quality === "perfect" || quality === "good") {
				target.energy = Math.min(100, target.energy + (quality === "perfect" ? 20 : 8));
				this.onEvent("block_result", { target, quality });
				if (quality === "perfect" && villain.hp > 0 && target.hp > 0) {
					this.logAction(`${target.name} counters!`);
					this.strike(target, villain, 0.5, { silent: true });
				}
			} else if (quality === "weak") {
				this.onEvent("block_result", { target, quality });
			}
			end();
		};

		const blockable = this.blockOn && !this.auto && target.hp > 0 && target.st.evade <= 0;
		if (blockable) this.openBlockWindow(villain, target, land);
		else land("none");
	}

	/** Timed-block window: the UI shows a shrinking ring; pressing near impact reduces damage. */
	openBlockWindow(villain, target, cb) {
		const ms = 800;
		const token = this.session;
		this.blockState = { target, t1: performance.now() + ms, pressed: null };
		this.onEvent("block_window", { villain, target, ms });
		setTimeout(() => {
			if (token !== this.session || !this.blockState) return;
			const q = this.evalBlock();
			this.blockState = null;
			cb(q);
		}, ms + 60);
	}

	block() {
		if (this.blockState && this.blockState.pressed == null) {
			this.blockState.pressed = performance.now();
			this.onEvent("block_press", {});
		}
	}

	evalBlock() {
		const st = this.blockState;
		if (!st || st.pressed == null) return "none";
		const d = Math.abs(st.pressed - st.t1);
		if (d <= 130) return "perfect";
		if (d <= 300) return "good";
		return "weak";
	}

	bossSpecial(boss, target) {
		const kind = boss.special.kind;
		this.onEvent("boss_special", { boss, name: boss.special.name });
		this.logAction(`⚠ ${boss.name} unleashes ${boss.special.name}!`);
		ComicAudio.playPunch(true);
		this.onEvent("screen_shake", { big: true });

		if (kind === "slam") {
			this.getLivingHeroes().forEach((h, i) =>
				this.strike(boss, h, 0.85, { onom: i === 0 ? "KA-BOOM!" : null, silent: i > 0 }),
			);
		} else if (kind === "stun") {
			this.strike(boss, target, 1.3, { onom: "SMASH!" });
			if (target.hp > 0) {
				target.st.stun = Math.max(target.st.stun, 1);
				this.logAction(`${target.name} is STUNNED!`);
			}
		} else if (kind === "drain") {
			const res = this.strike(boss, target, 1.4, { onom: "SLURP!" });
			if (res && res.dmg) this.healUnit(boss, Math.round(boss.maxHp * 0.1));
		} else if (kind === "shred") {
			this.getLivingHeroes().forEach((h, i) => {
				this.strike(boss, h, 0.6, { onom: i === 0 ? "RIIIP!" : null, silent: i > 0 });
				if (h.hp > 0) h.st.defDown = Math.max(h.st.defDown, 2);
			});
			this.logAction(`Squad defense is shredded!`);
		}
	}

	startPlayerRound() {
		if (this.isGameOver || this.inTransition) return;
		this.turn++;
		this.combo = 0;
		this.lastActor = null;
		this.onEvent("combo", { combo: 0, bonus: 0 });

		this.heroes.forEach((h) => {
			if (h.skillCd > 0) h.skillCd--;
			Object.keys(h.tacticCd).forEach((k) => {
				if (h.tacticCd[k] > 0) h.tacticCd[k]--;
			});
			this.tickDown(h);
		});
		if (this.mut.roundBleed) {
			this.getLivingHeroes().forEach((h) => {
				const dmg = Math.min(h.hp - 1, Math.round(h.maxHp * this.mut.roundBleed));
				if (dmg > 0) {
					h.hp -= dmg;
					this.onEvent("dot", { unit: h, damage: dmg });
				}
			});
			this.logAction("Bleed Out: your heroes lose HP!");
		}

		// First living, non-stunned hero
		let idx = 0;
		while (idx < this.heroes.length) {
			const h = this.heroes[idx];
			if (h.hp > 0) {
				if (h.st.stun > 0) {
					h.st.stun--;
					this.logAction(`${h.name} is stunned and loses their turn!`);
				} else {
					break;
				}
			}
			idx++;
		}

		if (idx >= this.heroes.length) {
			if (this.getLivingHeroes().length === 0) {
				this.checkBattleStatus();
			} else {
				// Everyone stunned: skip straight back to the villains
				this.isPlayerTurn = false;
				this.onEvent("turn_change", { isPlayer: false });
				this.later(() => this.executeVillainsTurn(), 650);
			}
			return;
		}

		this.activeHeroIndex = idx;
		this.isPlayerTurn = true;
		this.ensureValidTarget();
		this.onEvent("turn_change", { activeHero: this.getActiveHero(), isPlayer: true });
		this.scheduleAuto();
	}

	// ── Auto-battle ─────────────────────────────────────────────────────────
	scheduleAuto() {
		if (!this.auto || !this.isPlayerTurn || this.isGameOver) return;
		this.later(() => this.autoAct(), 650);
	}

	autoAct() {
		if (!this.auto || !this.isPlayerTurn || this.isGameOver) return;
		const hero = this.getActiveHero();
		if (!hero || hero.hp <= 0) return;

		const living = this.getLivingVillains();
		const target = [...living].sort((a, b) => a.hp - b.hp)[0];
		const targetIdx = this.villains.indexOf(target);
		const kit = HERO_KITS[hero.id] || DEFAULT_KIT;
		const woundedAlly = this.getLivingHeroes().some((h) => h.hp / h.maxHp < 0.7);
		const supportSkill = kit.skill && (kit.skill.heal || kit.skill.shield);

		if (this.canUseTactic("finisher", hero) && living.length > 1)
			this.executeHeroAction("finisher", targetIdx);
		else if (hero.energy >= 100) this.executeHeroAction("ultimate", targetIdx);
		else if (hero.skillCd === 0 && (!supportSkill || woundedAlly))
			this.executeHeroAction("skill", targetIdx);
		else this.executeHeroAction("basic", targetIdx);
	}

	// ── Battle flow ─────────────────────────────────────────────────────────
	checkBattleStatus() {
		if (this.isGameOver) return;
		const villainsAlive = this.villains.some((v) => v.hp > 0);
		const heroesAlive = this.heroes.some((h) => h.hp > 0);

		if (!heroesAlive) {
			this.finishDefeat();
		} else if (!villainsAlive) {
			this.wavesCleared++;
			const issue = this.currentIssue;
			const more = issue.endless || this.waveIndex + 1 < this.waveCount;
			if (more) {
				this.advanceWave();
			} else {
				this.finishVictory();
			}
		}
	}

	advanceWave() {
		this.isPlayerTurn = false;
		this.inTransition = true;
		const clearedNo = this.waveIndex + 1;
		this.logAction(`Wave ${clearedNo} cleared! The squad catches its breath…`);
		this.onEvent("wave_clear", { wave: clearedNo });

		// Short recovery between waves
		this.getLivingHeroes().forEach((h) => {
			this.healUnit(h, Math.round(h.maxHp * 0.15));
			h.energy = Math.min(100, h.energy + 25);
		});

		this.later(() => {
			this.waveIndex++;
			this.inTransition = false;
			this.spawnWave();
			this.combo = 0;
			this.logAction(`Wave ${this.waveIndex + 1} begins!`);
			this.onEvent("wave_start", { wave: this.waveIndex + 1 });
			this.startPlayerRoundAfterWave();
		}, 1100);
	}

	startPlayerRoundAfterWave() {
		this.lastActor = null;
		let idx = this.heroes.findIndex((h) => h.hp > 0 && h.st.stun <= 0);
		if (idx === -1) idx = this.heroes.findIndex((h) => h.hp > 0);
		this.activeHeroIndex = idx;
		this.isPlayerTurn = true;
		this.onEvent("turn_change", { activeHero: this.getActiveHero(), isPlayer: true });
		this.scheduleAuto();
	}

	finishVictory() {
		this.isGameOver = true;
		ComicAudio.playReveal(5);
		const issue = this.currentIssue;

		const noDeaths = this.faintedCount === 0;
		const withinPar = this.turn <= issue.par;
		const stars = 1 + (noDeaths ? 1 : 0) + (withinPar ? 1 : 0);
		const prevStars = this.gameState.getStars(issue.id);
		const firstClear = prevStars === 0;

		const factor = firstClear ? 1 : 0.6;
		const starBonus = Math.max(0, stars - prevStars) * 50;
		const coins = Math.round(issue.rewardCoins * factor) + starBonus;
		const ink = Math.round(issue.rewardInk * factor);
		const xp = Math.round(issue.rewardXp * (firstClear ? 1 : 0.7));

		this.gameState.coins += coins;
		this.gameState.ink += ink;
		const levelUps = [];
		this.heroes.forEach((h) => {
			const gained = this.gameState.gainXp(h.id, xp);
			if (gained > 0) levelUps.push({ name: h.name, levels: gained });
		});
		this.gameState.setStars(issue.id, Math.max(prevStars, stars));
		this.gameState.track("win");
		this.gameState.save();

		this.logAction(
			`VICTORY! Issue ${issue.issueNo} cleared in ${this.turn} turns — ${"★".repeat(stars)}`,
		);
		this.onEvent("battle_victory", {
			issue,
			coins,
			xp,
			ink,
			stars,
			firstClear,
			turns: this.turn,
			noDeaths,
			withinPar,
			levelUps,
		});
	}

	finishDefeat() {
		this.isGameOver = true;
		const issue = this.currentIssue;
		let coins = 0;
		let ink = 0;
		let newBest = false;

		if (issue.endless) {
			({ coins, ink, newBest } = this.bankEndless());
		}
		this.logAction(`DEFEAT! All heroes were incapacitated in Issue ${issue.issueNo}.`);
		this.onEvent("battle_defeat", {
			issue,
			wavesCleared: this.wavesCleared,
			coins,
			ink,
			newBest,
		});
	}

	/** Endless mode pays out for every wave cleared, win or lose. */
	bankEndless() {
		const waves = this.wavesCleared;
		const pay = this.mut.payout || 1;
		const coins = Math.round((waves * 45 + Math.floor(waves / 5) * 150) * pay);
		const ink = Math.round(waves * 4 * pay);
		let newBest = false;
		if (this.mutator) {
			newBest = waves > (this.gameState.mutatorBest || 0);
			if (newBest) this.gameState.mutatorBest = waves;
		} else {
			newBest = waves > (this.gameState.endlessBest || 0);
			if (newBest) this.gameState.endlessBest = waves;
		}
		this.gameState.coins += coins;
		this.gameState.ink += ink;
		this.heroes.forEach((h) =>
			this.gameState.gainXp(h.id, waves * 40),
		);
		this.gameState.save();
		return { coins, ink, newBest };
	}

	/** Player gives up. Endless mode banks its waves; campaign issues forfeit everything. */
	retreat() {
		if (this.isGameOver) return null;
		this.isGameOver = true;
		this.session++;
		let result = null;
		if (this.currentIssue.endless) result = this.bankEndless();
		return result;
	}

	logAction(msg) {
		this.log.push(msg);
		if (this.log.length > 40) this.log.shift();
		this.onEvent("log_update", { message: msg, log: this.log });
	}
}

window.ComicCombatEngine = ComicCombatEngine;
