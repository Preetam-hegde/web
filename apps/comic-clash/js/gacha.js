"use strict";

/**
 * ComicClash Gacha & Booster Pack Engine
 * Handles drop-rate probability, pity counters, interactive foil tearing, and duplicate conversions.
 */
class ComicGachaEngine {
	constructor(gameState) {
		this.gameState = gameState;
		this.isSummoning = false;
		this.currentPackResults = [];
		this.revealIndex = 0;
	}

	/**
	 * Pulls a single hero according to rates and pity rules.
	 */
	rollHero(guaranteeRarity = null) {
		this.gameState.pity5Star++;
		this.gameState.pity4Star++;

		let rarity = 2;

		// 1. Check Hard 5★ Pity (guaranteed 5★ every 40 pulls)
		if (this.gameState.pity5Star >= 40 || guaranteeRarity === 5) {
			rarity = 5;
			this.gameState.pity5Star = 0;
		}
		// 2. Check 4★ / 10-Pull guarantee
		else if (guaranteeRarity === 4 || this.gameState.pity4Star >= 10) {
			// Small chance to upgrade to 5★ even on 4★ guarantee
			if (Math.random() < RARITY_CONFIG[5].dropRate) {
				rarity = 5;
				this.gameState.pity5Star = 0;
			} else {
				rarity = 4;
				this.gameState.pity4Star = 0;
			}
		}
		// 3. Standard RNG rolls
		else {
			const roll = Math.random();
			if (roll < RARITY_CONFIG[5].dropRate) {
				rarity = 5;
				this.gameState.pity5Star = 0;
			} else if (roll < RARITY_CONFIG[5].dropRate + RARITY_CONFIG[4].dropRate) {
				rarity = 4;
				this.gameState.pity4Star = 0;
			} else if (
				roll <
				RARITY_CONFIG[5].dropRate +
					RARITY_CONFIG[4].dropRate +
					RARITY_CONFIG[3].dropRate
			) {
				rarity = 3;
			} else {
				rarity = 2;
			}
		}

		// Pick random hero from chosen rarity
		const candidates = HEROES_DATA.filter((h) => h.rarity === rarity);
		const template = candidates[Math.floor(Math.random() * candidates.length)];

		// Process collection / duplicate conversion
		const isNew = !this.gameState.inventory[template.id];
		let shardsAwarded = 0;

		if (isNew) {
			this.gameState.inventory[template.id] = {
				id: template.id,
				level: 1,
				rank: 1,
				shards: 0,
				xp: 0,
			};
		} else {
			const shardAmounts = { 5: 50, 4: 25, 3: 10, 2: 5 };
			shardsAwarded = shardAmounts[rarity];
			this.gameState.inventory[template.id].shards += shardsAwarded;
		}

		this.gameState.totalPulls++;
		this.gameState.save();

		return {
			template,
			rarity,
			isNew,
			shardsAwarded,
		};
	}

	/**
	 * Performs a 1-pull or 10-pull.
	 */
	executeSummon(count = 1) {
		const cost = count === 1 ? 100 : 900;
		if (this.gameState.coins < cost) {
			window.ComicToast(
				`Not enough Comic Coins! Need ${cost} 🪙. Clear issues or claim daily loot!`,
				"warn",
			);
			return null;
		}

		this.gameState.coins -= cost;
		const results = [];

		for (let i = 0; i < count; i++) {
			// In a 10-pull, the 10th card is guaranteed at least 4★ if no 4★+ pulled yet
			const mustBe4Star =
				count === 10 && i === 9 && !results.some((r) => r.rarity >= 4);
			const heroRoll = this.rollHero(mustBe4Star ? 4 : null);
			results.push(heroRoll);
		}

		this.gameState.track("pull", count);
		this.gameState.recordHistory(results);
		this.currentPackResults = results;
		this.revealIndex = 0;
		this.gameState.save();
		return results;
	}

	/**
	 * Checks if pack contains a 5★ card.
	 */
	hasFiveStar() {
		return this.currentPackResults.some((r) => r.rarity === 5);
	}
}

window.ComicGachaEngine = ComicGachaEngine;
