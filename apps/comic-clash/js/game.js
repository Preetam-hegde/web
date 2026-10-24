"use strict";

/**
 * ComicClash Master Game State & UI Controller
 */
const STORAGE_KEY = "comic_clash:v1";

/** Lightweight toast notifications (replaces blocking alert()). */
window.ComicToast = function (message, kind = "info") {
	const stack = document.getElementById("toast-stack");
	if (!stack) return;
	const toast = document.createElement("div");
	toast.className = `toast ${kind}`;
	toast.textContent = message;
	stack.appendChild(toast);
	setTimeout(() => toast.classList.add("out"), 2600);
	setTimeout(() => toast.remove(), 3000);
};

function todayKey() {
	return new Date().toDateString();
}

function yesterdayKey() {
	return new Date(Date.now() - 864e5).toDateString();
}

function xpNeeded(level) {
	return level * 120;
}

class ComicGameState {
	constructor() {
		this.coins = 1200; // Starter coins for immediate 10-pull!
		this.ink = 100;
		this.pity5Star = 0;
		this.pity4Star = 0;
		this.totalPulls = 0;
		this.completedIssues = {};
		this.inventory = {};
		this.team = ["neon_valkyrie", "street_brawler", "rookie_cadet"];
		this.lastDailyDate = null;
		this.dailyStreak = 0;
		this.quests = { date: null, ids: [], progress: {}, claimed: {} };
		this.stats = { wins: 0, pulls: 0, ults: 0, kills: 0, crits: 0, levels: 0, pairs: 0, arcade: 0 };
		this.combosSeen = {};
		this.arcade = { date: null, plays: {}, best: {} };
		this.mutatorBest = 0;
		this.onNewCombo = null;
		this.endlessBest = 0;
		this.history = [];
		this.saveTimer = null;

		this.load();
		this.ensureStarterSquad();
		this.ensureQuests();
	}

	load() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const data = JSON.parse(saved);
				Object.assign(this, data);
				this.stats = { wins: 0, pulls: 0, ults: 0, kills: 0, crits: 0, levels: 0, pairs: 0, arcade: 0, ...data.stats };
			}
		} catch (e) {
			console.warn("Could not load ComicClash save from localStorage:", e);
		}
	}

	save() {
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					coins: this.coins,
					ink: this.ink,
					pity5Star: this.pity5Star,
					pity4Star: this.pity4Star,
					totalPulls: this.totalPulls,
					completedIssues: this.completedIssues,
					inventory: this.inventory,
					team: this.team,
					lastDailyDate: this.lastDailyDate,
					dailyStreak: this.dailyStreak,
					quests: this.quests,
					stats: this.stats,
					endlessBest: this.endlessBest,
					history: this.history,
					combosSeen: this.combosSeen,
					arcade: this.arcade,
					mutatorBest: this.mutatorBest,
				}),
			);
		} catch (e) {
			console.warn("Could not save to localStorage:", e);
		}
	}

	queueSave() {
		clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => this.save(), 400);
	}

	ensureStarterSquad() {
		if (Object.keys(this.inventory).length === 0) {
			["neon_valkyrie", "street_brawler", "rookie_cadet"].forEach((id) => {
				this.inventory[id] = { id, level: 1, rank: 1, shards: 0, xp: 0 };
			});
			this.save();
		}

		this.team = this.team.filter((id) => this.inventory[id]);
		if (this.team.length < 3) {
			const owned = Object.keys(this.inventory);
			for (let i = 0; i < owned.length && this.team.length < 3; i++) {
				if (!this.team.includes(owned[i])) this.team.push(owned[i]);
			}
		}
	}

	// ── Progress tracking ───────────────────────────────────────────────────
	/** Records an event for stats + today's missions. */
	track(type, n = 1) {
		const statKey = {
			pairs: "pairs",
			arcade: "arcade",
			win: "wins",
			pull: "pulls",
			ult: "ults",
			kill: "kills",
			crit: "crits",
			level: "levels",
		}[type];
		if (statKey) this.stats[statKey] = (this.stats[statKey] || 0) + n;
		this.ensureQuests();
		this.quests.progress[type] = (this.quests.progress[type] || 0) + n;
		this.queueSave();
	}

	ensureQuests() {
		const today = todayKey();
		if (this.quests.date === today && this.quests.ids.length) return;
		// Deterministic pick of 3 missions per calendar day
		let seed = 0;
		for (const ch of today) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
		const pool = DAILY_QUESTS.map((q) => q.id);
		const ids = [];
		while (ids.length < 3) {
			seed = (seed * 1103515245 + 12345) >>> 0;
			const pick = pool.splice(seed % pool.length, 1)[0];
			ids.push(pick);
		}
		this.quests = { date: today, ids, progress: {}, claimed: {} };
	}

	getQuests() {
		this.ensureQuests();
		return this.quests.ids.map((id) => {
			const def = DAILY_QUESTS.find((q) => q.id === id);
			const progress = Math.min(def.target, this.quests.progress[def.type] || 0);
			return {
				...def,
				progress,
				done: progress >= def.target,
				claimed: !!this.quests.claimed[id],
			};
		});
	}

	claimQuest(id) {
		const q = this.getQuests().find((x) => x.id === id);
		if (!q || !q.done || q.claimed) return false;
		this.quests.claimed[id] = true;
		this.coins += q.coins;
		this.ink += q.ink;
		this.save();
		return q;
	}

	hasClaimableQuest() {
		return this.getQuests().some((q) => q.done && !q.claimed);
	}

	// ── Combos & arcade ─────────────────────────────────────────────────────
	markCombo(id) {
		if (this.combosSeen[id]) return;
		this.combosSeen[id] = true;
		this.queueSave();
		if (this.onNewCombo) this.onNewCombo(id);
	}

	ensureArcade() {
		const today = todayKey();
		if (!this.arcade || this.arcade.date !== today) {
			const best = (this.arcade && this.arcade.best) || {};
			this.arcade = { date: today, plays: {}, best };
		}
	}

	arcadePlaysLeft(game) {
		this.ensureArcade();
		return Math.max(0, ARCADE_DAILY_CAP - (this.arcade.plays[game] || 0));
	}

	recordArcadePlay(game, score, rewarded) {
		this.ensureArcade();
		if (rewarded) this.arcade.plays[game] = (this.arcade.plays[game] || 0) + 1;
		if (score > (this.arcade.best[game] || 0)) this.arcade.best[game] = score;
		this.save();
	}

	// ── Campaign stars ──────────────────────────────────────────────────────
	getStars(issueId) {
		const v = this.completedIssues[issueId];
		if (v === true) return 1;
		return typeof v === "number" ? v : 0;
	}

	setStars(issueId, stars) {
		this.completedIssues[issueId] = stars;
	}

	isIssueUnlocked(index) {
		if (index === 0) return true;
		return this.getStars(ISSUES_CAMPAIGN[index - 1].id) > 0;
	}

	// ── Daily loot ──────────────────────────────────────────────────────────
	canClaimDaily() {
		return this.lastDailyDate !== todayKey();
	}

	nextStreakDay() {
		if (this.lastDailyDate === yesterdayKey() || this.lastDailyDate === todayKey()) {
			return this.dailyStreak;
		}
		return 0;
	}

	claimDaily() {
		if (!this.canClaimDaily()) return null;
		const streak =
			this.lastDailyDate === yesterdayKey() ? this.dailyStreak + 1 : 1;
		const reward = DAILY_STREAK_REWARDS[(streak - 1) % DAILY_STREAK_REWARDS.length];
		this.coins += reward.coins;
		this.ink += reward.ink;
		this.dailyStreak = streak;
		this.lastDailyDate = todayKey();
		this.save();
		return { ...reward, streak };
	}

	// ── Hero progression ────────────────────────────────────────────────────
	levelUpHero(heroId) {
		const inv = this.inventory[heroId];
		if (!inv || inv.level >= MAX_HERO_LEVEL) return false;
		const costCoins = inv.level * 60;
		const costInk = inv.level * 10;
		if (this.coins < costCoins || this.ink < costInk) return false;

		this.coins -= costCoins;
		this.ink -= costInk;
		inv.level++;
		this.track("level");
		this.save();
		return true;
	}

	/** Adds battle XP, auto-levelling the hero. Returns number of levels gained. */
	gainXp(heroId, amount) {
		const inv = this.inventory[heroId];
		if (!inv) return 0;
		inv.xp = (inv.xp || 0) + amount;
		let gained = 0;
		while (inv.level < MAX_HERO_LEVEL && inv.xp >= xpNeeded(inv.level)) {
			inv.xp -= xpNeeded(inv.level);
			inv.level++;
			gained++;
		}
		if (inv.level >= MAX_HERO_LEVEL) inv.xp = 0;
		if (gained) this.track("level", gained);
		return gained;
	}

	rankUpHero(heroId) {
		const inv = this.inventory[heroId];
		const data = HEROES_MAP.get(heroId);
		if (!inv || !data) return false;

		const neededShards = inv.rank * (data.rarity * 5);
		if (inv.shards < neededShards || inv.rank >= 5) return false;

		inv.shards -= neededShards;
		inv.rank++;
		this.save();
		return true;
	}

	setTeamSlot(slotIdx, heroId) {
		if (!this.inventory[heroId]) return;
		const existingIdx = this.team.indexOf(heroId);
		if (existingIdx !== -1) {
			this.team[existingIdx] = this.team[slotIdx];
		}
		this.team[slotIdx] = heroId;
		this.save();
	}

	recordHistory(results) {
		results.forEach((r) => {
			this.history.unshift({ id: r.template.id, rarity: r.rarity, isNew: r.isNew });
		});
		this.history = this.history.slice(0, 30);
	}
}

// Global App Initialization
document.addEventListener("DOMContentLoaded", () => {
	const gameState = new ComicGameState();
	const gachaEngine = new ComicGachaEngine(gameState);
	const synergyHelper = new ComicCombatEngine(gameState);
	const arcade = new ComicArcade(gameState, {
		updateHUD: () => updateHUD(),
		startMutatorBattle: (mut) => startCombat("endless", { mutator: mut }),
	});
	gameState.onNewCombo = (id) => {
		const c = HERO_COMBOS.find((x) => x.id === id);
		if (c) ComicToast(`New combo discovered: ${c.name}!`, "good");
	};
	let lastBattleOpts = {};
	let combatEngine = null;
	let currentView = "summon";
	let selectedSlot = 0;
	const rosterFilter = { rarity: "all", affinity: "all", locked: true };

	const $ = (id) => document.getElementById(id);

	// View Elements
	const views = {
		arcade: $("view-arcade"),
		summon: $("view-summon"),
		campaign: $("view-campaign"),
		battle: $("view-battle"),
		roster: $("view-roster"),
		rewards: $("view-rewards"),
	};

	const navBtns = document.querySelectorAll(".nav-tab");
	const elCoins = $("hud-coins");
	const elInk = $("hud-ink");
	const elPity5 = $("hud-pity");
	const elMuteBtn = $("btn-mute");

	function updateHUD() {
		elCoins.textContent = gameState.coins.toLocaleString();
		elInk.textContent = gameState.ink.toLocaleString();
		elPity5.textContent = `${40 - gameState.pity5Star}`;

		$("pity5-text").textContent = `${gameState.pity5Star}/40`;
		$("pity5-fill").style.width = `${(gameState.pity5Star / 40) * 100}%`;
		$("pity4-text").textContent = `${gameState.pity4Star}/10`;
		$("pity4-fill").style.width = `${(gameState.pity4Star / 10) * 100}%`;
		const owned = Object.keys(gameState.inventory).length;
		$("collection-text").textContent = `${owned}/${HEROES_DATA.length}`;
		$("collection-fill").style.width = `${(owned / HEROES_DATA.length) * 100}%`;

		$("loot-dot").hidden = !(
			gameState.canClaimDaily() || gameState.hasClaimableQuest()
		);
	}

	function switchView(viewName) {
		ComicAudio.playPageFlip();
		currentView = viewName;
		Object.keys(views).forEach((name) => {
			views[name].classList.toggle("active", name === viewName);
		});
		navBtns.forEach((btn) => {
			btn.classList.toggle("active", btn.dataset.view === viewName);
		});

		updateHUD();

		if (viewName === "roster") renderRoster();
		else if (viewName === "campaign") renderCampaign();
		else if (viewName === "rewards") renderRewards();
		else if (viewName === "battle") renderBattleShell();
		else if (viewName === "arcade") arcade.render();
	}

	navBtns.forEach((btn) => {
		btn.addEventListener("click", () => switchView(btn.dataset.view));
	});

	elMuteBtn.addEventListener("click", () => {
		const muted = ComicAudio.toggleMute();
		elMuteBtn.textContent = muted ? "🔇 MUTED" : "🔊 SFX ON";
		elMuteBtn.classList.toggle("muted", muted);
	});

	// ── GACHA PACK INTERACTION ──────────────────────────────────────────────
	const elPack = $("booster-pack");
	const elTearStrip = $("tear-strip");
	const elSummonModal = $("summon-modal");
	const elCardsContainer = $("revealed-cards");
	const elBtnPull1 = $("btn-pull-1");
	const elBtnPull10 = $("btn-pull-10");
	const elCloseSummon = $("btn-close-summon");
	const elRevealAll = $("btn-reveal-all");
	let summonBusy = false;

	const elTearFill = $("tear-fill");
	const elPullFx = $("pull-fx");
	const RARITY_GLOW = { 2: "#d7ccc8", 3: "#00e5ff", 4: "#ff00aa", 5: "#ffd700" };
	let tearProgress = 0;

	function setTear(p) {
		tearProgress = Math.max(0, Math.min(1, p));
		elTearFill.style.width = `${tearProgress * 100}%`;
		elPack.style.setProperty("--tear", tearProgress);
	}

	function resetPack() {
		elPack.classList.remove("tear-off", "opened", "shaking", "burst", "mythic-charge");
		elPack.style.removeProperty("--glow");
		elPack.style.removeProperty("--tear");
		setTear(0);
	}

	/** Animates the tear strip from its current progress to fully ripped. */
	function animateTear(done) {
		const start = tearProgress;
		const t0 = performance.now();
		const dur = 380 * (1 - start) + 60;
		(function step(now) {
			const k = Math.min(1, (now - t0) / dur);
			setTear(start + (1 - start) * k);
			if (k < 1) requestAnimationFrame(step);
			else done();
		})(t0);
	}

	function spawnParticles(color, n) {
		const box = $("pull-particles");
		box.innerHTML = "";
		for (let i = 0; i < n; i++) {
			const p = document.createElement("i");
			const ang = Math.random() * Math.PI * 2;
			const dist = 160 + Math.random() * 380;
			p.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
			p.style.setProperty("--dy", `${Math.sin(ang) * dist}px`);
			p.style.setProperty("--s", `${6 + Math.random() * 14}px`);
			p.style.setProperty("--d", `${0.6 + Math.random() * 0.7}s`);
			p.style.background = Math.random() < 0.5 ? color : "#fff";
			box.appendChild(p);
		}
	}

	function triggerSummon(count) {
		if (summonBusy) return;
		const results = gachaEngine.executeSummon(count);
		if (!results) {
			resetPack();
			return;
		}

		summonBusy = true;
		updateHUD();
		const best = Math.max(...results.map((r) => r.rarity));
		const color = RARITY_GLOW[best];
		elPack.style.setProperty("--glow", color);
		ComicAudio.playRip();

		animateTear(() => {
			// Stage 2: strip flies off, light pours out of the pack, pack shudders
			elPack.classList.add("tear-off", "opened", "shaking");
			if (best >= 5) elPack.classList.add("mythic-charge");
			const charge = best >= 5 ? 1100 : best === 4 ? 800 : 550;

			setTimeout(() => {
				// Stage 3: burst + full-screen rays and particles
				elPack.classList.remove("shaking");
				elPack.classList.add("burst");
				elPullFx.style.setProperty("--glow", color);
				elPullFx.dataset.rarity = best;
				spawnParticles(color, best >= 5 ? 70 : best === 4 ? 46 : 28);
				elPullFx.classList.remove("go");
				void elPullFx.offsetWidth;
				elPullFx.classList.add("go");
				ComicAudio.playReveal(best);

				setTimeout(() => {
					elPullFx.classList.remove("go");
					resetPack();
					displaySummonModal(results);
				}, 750);
			}, charge);
		});
	}

	elBtnPull1.addEventListener("click", () => triggerSummon(1));
	elBtnPull10.addEventListener("click", () => triggerSummon(10));

	// Strip: tap = auto-rip, drag left→right = manual rip
	let dragging = null;
	elTearStrip.addEventListener("pointerdown", (e) => {
		if (summonBusy) return;
		dragging = { x0: e.clientX, moved: false, w: elTearStrip.getBoundingClientRect().width };
		elTearStrip.setPointerCapture(e.pointerId);
	});
	elTearStrip.addEventListener("pointermove", (e) => {
		if (!dragging) return;
		const dx = e.clientX - dragging.x0;
		if (Math.abs(dx) > 6) dragging.moved = true;
		if (dragging.moved) setTear(dx / dragging.w);
	});
	const endDrag = () => {
		if (!dragging) return;
		const { moved } = dragging;
		dragging = null;
		if (!moved || tearProgress > 0.7) triggerSummon(1);
		else {
			// spring back
			const from = tearProgress;
			const t0 = performance.now();
			(function back(now) {
				const k = Math.min(1, (now - t0) / 200);
				setTear(from * (1 - k));
				if (k < 1 && !summonBusy) requestAnimationFrame(back);
			})(t0);
		}
	};
	elTearStrip.addEventListener("pointerup", endDrag);
	elTearStrip.addEventListener("pointercancel", endDrag);

	// ── Animated comic background floaters ──────────────────────────────────
	(function initBackground() {
		const bg = $("bg-fx");
		const words = ["POW!", "ZAP!", "BAM!", "KRAK!", "★", "💥", "✦", "WHAM!", "BOOM!", "⚡"];
		const colors = ["#ffe600", "#ff0077", "#00f0ff", "#9d4edd", "#ff8800"];
		for (let i = 0; i < 16; i++) {
			const s = document.createElement("span");
			s.textContent = words[i % words.length];
			s.style.left = `${Math.random() * 100}%`;
			s.style.setProperty("--size", `${1.4 + Math.random() * 2.6}rem`);
			s.style.setProperty("--dur", `${18 + Math.random() * 22}s`);
			s.style.setProperty("--rot", `${(Math.random() - 0.5) * 50}deg`);
			s.style.color = colors[i % colors.length];
			s.style.animationDelay = `${-Math.random() * 30}s`;
			bg.appendChild(s);
		}
	})();

	function flipSlot(slot, result) {
		if (slot.classList.contains("flipped")) return;
		slot.classList.add("flipped");
		ComicAudio.playReveal(result.rarity);
		if (result.rarity === 5) {
			$("mythic-banner").classList.add("active");
			slot.classList.add("mythic-pop");
		}
	}

	function displaySummonModal(results) {
		elCardsContainer.innerHTML = "";
		$("mythic-banner").classList.remove("active");
		elSummonModal.classList.add("open");
		elRevealAll.hidden = results.length === 1;

		const slots = results.map((res, idx) => {
			const slot = document.createElement("div");
			slot.className = `reveal-slot rarity-slot-${res.rarity}`;
			const card = createHeroCard(
				res.template,
				gameState.inventory[res.template.id],
				{ gacha: true, isNew: res.isNew, shards: res.shardsAwarded },
			);
			card.style.animationDelay = `${idx * 0.08}s`;
			const cover = document.createElement("div");
			cover.className = "card-cover";
			cover.innerHTML = "<span>?</span><small>TAP TO FLIP</small>";
			slot.append(card, cover);
			slot.addEventListener("click", () => flipSlot(slot, res));
			elCardsContainer.appendChild(slot);
			return { slot, res };
		});

		// Single pulls reveal themselves; multi-pulls are tap-to-flip for suspense
		if (results.length === 1) {
			setTimeout(() => flipSlot(slots[0].slot, slots[0].res), 350);
		}

		elRevealAll.onclick = () => {
			slots.forEach(({ slot, res }, i) => {
				setTimeout(() => flipSlot(slot, res), i * 170);
			});
		};
	}

	elCloseSummon.addEventListener("click", () => {
		elSummonModal.classList.remove("open");
		summonBusy = false;
		updateHUD();
		renderSummonInfo();
	});

	// Odds + history panel
	const elSummonInfo = $("summon-info");
	let summonInfoMode = null;

	function renderSummonInfo() {
		if (!summonInfoMode) {
			elSummonInfo.hidden = true;
			return;
		}
		elSummonInfo.hidden = false;
		if (summonInfoMode === "odds") {
			elSummonInfo.innerHTML = `
				<table class="odds-table">
					${[5, 4, 3, 2]
						.map((r) => {
							const cfg = RARITY_CONFIG[r];
							const count = HEROES_DATA.filter((h) => h.rarity === r).length;
							return `<tr><td style="color:${cfg.color}">${cfg.stars} ${cfg.label}</td><td>${Math.round(cfg.dropRate * 100)}%</td><td>${count} heroes</td></tr>`;
						})
						.join("")}
				</table>
				<p>Hard pity: 5★ at 40 pulls. 10th pack of a 10-pull is always 4★+. Duplicates become Shards (5★: 50, 4★: 25, 3★: 10, 2★: 5).</p>`;
		} else {
			if (!gameState.history.length) {
				elSummonInfo.innerHTML = "<p>No packs opened yet.</p>";
				return;
			}
			elSummonInfo.innerHTML =
				`<p>Last ${gameState.history.length} pulls (newest first):</p><div class="history-chips">` +
				gameState.history
					.map((h) => {
						const hero = HEROES_MAP.get(h.id);
						const cfg = RARITY_CONFIG[h.rarity];
						return `<span class="history-chip" style="border-color:${cfg.color};color:${cfg.color}">${h.rarity}★ ${hero.name}${h.isNew ? " ✦NEW" : ""}</span>`;
					})
					.join("") +
				"</div>";
		}
	}

	$("btn-odds").addEventListener("click", () => {
		summonInfoMode = summonInfoMode === "odds" ? null : "odds";
		renderSummonInfo();
	});
	$("btn-history").addEventListener("click", () => {
		summonInfoMode = summonInfoMode === "history" ? null : "history";
		renderSummonInfo();
	});

	// ── HERO CARD DOM GENERATOR ─────────────────────────────────────────────
	function createHeroCard(heroData, invData, opts = {}) {
		const { gacha = false, isNew = false, shards = 0, locked = false } = opts;
		const card = document.createElement("div");
		const rarityCfg = RARITY_CONFIG[heroData.rarity];
		card.className = `comic-card rarity-${heroData.rarity} aff-${heroData.affinity.toLowerCase()}${locked ? " locked" : ""}`;
		card.style.setProperty("--card-border", heroData.colors.accent);
		card.style.setProperty("--card-bg", heroData.colors.bg);
		card.style.setProperty("--card-fg", heroData.colors.fg);
		card.style.setProperty("--rarity-color", rarityCfg.color);

		const affinityInfo = HERO_AFFINITIES[heroData.affinity];
		const level = invData ? invData.level : 1;
		const rank = invData ? invData.rank : 1;
		const mult = (1 + (level - 1) * 0.08) * (1 + (rank - 1) * 0.15);
		const stat = (v) => (locked ? "—" : Math.round(v * mult));
		const xpMax = xpNeeded(level);
		const xpPct = invData
			? level >= MAX_HERO_LEVEL
				? 100
				: Math.min(100, ((invData.xp || 0) / xpMax) * 100)
			: 0;
		const pips = Array.from({ length: 5 }, (_, i) =>
			`<i class="pip ${invData && i < rank ? "on" : ""}"></i>`,
		).join("");

		card.innerHTML = `
			<div class="card-inner">
				<div class="cd-top">
					<span class="cd-rarity">${iconHTML(ICON.gems[heroData.rarity], "sm")} ${rarityCfg.label}</span>
					<span class="cd-aff" style="--aff:${affinityInfo.color}" title="${affinityInfo.name}: ${affinityInfo.desc}">${affinityInfo.icon}</span>
				</div>
				<div class="cd-art">
					<div class="cd-rays"></div>
					<div class="cd-dots"></div>
					<div class="cd-svg">${locked ? '<div class="locked-art">?</div>' : heroData.artSvg}</div>
					${locked ? "" : `<div class="cd-lvl">LV ${level}</div>`}
					${gacha && isNew ? '<div class="new-stamp">NEW!</div>' : ""}
					${gacha && !isNew ? `<div class="shard-stamp">+${shards} SHARDS</div>` : ""}
				</div>
				<div class="cd-ribbon"><span class="hero-name">${locked ? "???" : heroData.name}</span></div>
				<div class="hero-alias">${locked ? rarityCfg.stars + " UNDISCOVERED" : heroData.alias}</div>
				<div class="cd-stats">
					<span title="Health">${iconHTML(ICON.heart, "sm")}<b>${stat(heroData.baseHp)}</b></span>
					<span title="Attack">${iconHTML(ICON.sword, "sm")}<b>${stat(heroData.baseAtk)}</b></span>
					<span title="Defense">${iconHTML(ICON.shield, "sm")}<b>${stat(heroData.baseDef)}</b></span>
				</div>
				${
					locked
						? '<div class="cd-moves"><div>? ? ?</div></div>'
						: `<div class="cd-moves">
					<div title="${heroData.skill.desc}">${iconHTML(ICON.affinity[heroData.affinity], "sm")}<em>SKILL</em> ${heroData.skill.name}</div>
					<div title="${heroData.ultimate.desc}">${iconHTML(ICON.ultimate, "sm")}<em>ULT</em> ${heroData.ultimate.name}</div>
				</div>`
				}
				<div class="cd-foot">
					<div class="cd-pips" title="Rank ${rank}/5">${locked ? "" : pips}</div>
					${invData ? `<div class="meter-bar xp"><div class="fill" style="width:${xpPct}%"></div></div>` : ""}
				</div>
			</div>
		`;

		// 3D Tilt interactive effect
		card.addEventListener("mousemove", (e) => {
			const rect = card.getBoundingClientRect();
			const x = e.clientX - rect.left - rect.width / 2;
			const y = e.clientY - rect.top - rect.height / 2;
			card.style.transform = `perspective(600px) rotateY(${x * 0.12}deg) rotateX(${-y * 0.12}deg) translateY(-4px)`;
		});
		card.addEventListener("mouseleave", () => {
			card.style.transform =
				"perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)";
		});

		if (!gacha && !locked) {
			card.title = "Click for hero details";
			card.addEventListener("click", () => openHeroModal(heroData.id));
		}

		return card;
	}

	// ── HERO DETAIL MODAL ───────────────────────────────────────────────────
	const elHeroModal = $("hero-modal");

	function openHeroModal(heroId) {
		const hero = HEROES_MAP.get(heroId);
		const inv = gameState.inventory[heroId] || { level: 1, rank: 1, xp: 0, shards: 0 };
		if (!hero) return;
		const aff = HERO_AFFINITIES[hero.affinity];
		const rarity = RARITY_CONFIG[hero.rarity];
		const mult = (1 + (inv.level - 1) * 0.08) * (1 + (inv.rank - 1) * 0.15);
		const xpMax = xpNeeded(inv.level);
		const xpPct = inv.level >= MAX_HERO_LEVEL ? 100 : Math.min(100, ((inv.xp || 0) / xpMax) * 100);

		$("hero-detail-body").innerHTML = `
			<div class="hd-top" style="--hd-accent:${hero.colors.accent}">
				<div class="hd-art">${hero.artSvg}</div>
				<div class="hd-meta">
					<div class="hd-rarity" style="color:${rarity.color}">${rarity.stars} ${rarity.label}</div>
					<h3>${hero.name}</h3>
					<div class="hd-alias">${hero.alias}</div>
					<div class="hd-aff" style="color:${aff.color}">${aff.icon} ${aff.name} — beats ${aff.beats}</div>
					<div class="hd-lvl">LVL ${inv.level} · RANK ${"★".repeat(inv.rank)}</div>
					<div class="meter-bar xp"><div class="fill" style="width:${xpPct}%"></div></div>
					<div class="hd-xp">${inv.level >= MAX_HERO_LEVEL ? "MAX LEVEL" : `XP ${inv.xp || 0}/${xpMax}`}</div>
				</div>
			</div>
			<p class="hd-bio">${hero.bio}</p>
			<div class="hd-stats">
				<span>❤ HP <b>${Math.round(hero.baseHp * mult)}</b></span>
				<span>⚔ ATK <b>${Math.round(hero.baseAtk * mult)}</b></span>
				<span>🛡 DEF <b>${Math.round(hero.baseDef * mult)}</b></span>
			</div>
			<div class="hd-moves">
				<div><b>BASIC · ${hero.basic.name}</b><br />${hero.basic.desc}</div>
				<div><b>SKILL · ${hero.skill.name}</b> <i>(CD ${hero.skill.cd})</i><br />${hero.skill.desc}</div>
				<div><b>ULTIMATE · ${hero.ultimate.name}</b><br />${hero.ultimate.desc}</div>
			</div>
			<div class="hd-combos">${
				HERO_COMBOS.filter((c) => c.a === hero.id || c.b === hero.id)
					.map((c) => {
						const partner = HEROES_MAP.get(comboPartnerOf(c, hero.id));
						return `<span>⚡ ${c.name} <small>with ${partner.name}</small></span>`;
					})
					.join("") || "<small>No known pair combos.</small>"
			}</div>
			<div class="hd-quote">“${hero.quote}”</div>
		`;
		elHeroModal.classList.add("open");
	}

	$("btn-close-hero").addEventListener("click", () =>
		elHeroModal.classList.remove("open"),
	);

	[elHeroModal, elSummonModal].forEach((m) => {
		m.addEventListener("click", (e) => {
			if (m === elHeroModal && e.target === m) m.classList.remove("open");
		});
	});

	// ── CAMPAIGN ISSUES RENDERER ────────────────────────────────────────────
	function squadPower() {
		return gameState.team.reduce((sum, id) => {
			const h = HEROES_MAP.get(id);
			const inv = gameState.inventory[id];
			if (!h || !inv) return sum;
			const mult = (1 + (inv.level - 1) * 0.08) * (1 + (inv.rank - 1) * 0.15);
			return sum + Math.round((h.baseHp / 4 + h.baseAtk + h.baseDef) * mult);
		}, 0);
	}

	function renderCampaign() {
		const container = $("issues-list");
		const squad = $("campaign-squad");
		container.innerHTML = "";

		const syn = synergyHelper.getSynergy(gameState.team);
		squad.innerHTML = `
			<div class="cs-heroes">
				${gameState.team
					.map((id) => {
						const h = HEROES_MAP.get(id);
						return h
							? `<div class="cs-hero" style="border-color:${h.colors.accent}" title="${h.name}">${h.artSvg}</div>`
							: "";
					})
					.join("")}
			</div>
			<div class="cs-info">
				<div class="cs-power">SQUAD POWER <b>${squadPower()}</b></div>
				<div class="cs-syn">${syn.label}</div>
			</div>
			<button type="button" class="comic-btn cs-edit">EDIT SQUAD</button>
		`;
		squad.querySelector(".cs-edit").addEventListener("click", () => switchView("roster"));

		ISSUES_CAMPAIGN.forEach((issue, index) => {
			const stars = gameState.getStars(issue.id);
			const unlocked = gameState.isIssueUnlocked(index);
			const issueCard = document.createElement("div");
			issueCard.className = `issue-cover-card ${stars ? "completed" : ""} ${unlocked ? "" : "locked"}`;
			issueCard.innerHTML = `
				<div class="issue-badge">${issue.issueNo}</div>
				<div class="issue-cover-art">
					<div class="comic-burst">${unlocked ? "READ!" : "LOCKED"}</div>
					<div class="boss-preview">${unlocked ? issue.bossName : "???"}</div>
				</div>
				<div class="issue-details">
					<h3>${issue.title}</h3>
					<p>${unlocked ? issue.coverDesc : `Clear Issue ${ISSUES_CAMPAIGN[index - 1].issueNo} to unlock.`}</p>
					<div class="issue-meta">
						<span class="stars">${[1, 2, 3].map((n) => (n <= stars ? "★" : "☆")).join("")}</span>
						<span>${issue.waves.length} WAVES</span>
						<span>PAR ${issue.par} TURNS</span>
					</div>
					<div class="issue-rewards">
						<span>${iconHTML(ICON.coin)} +${issue.rewardCoins}</span>
						<span>${iconHTML(ICON.ink)} +${issue.rewardInk}</span>
						<span>✨ +${issue.rewardXp} XP</span>
					</div>
					<button class="btn-read-issue comic-btn" ${unlocked ? "" : "disabled"}>
						${unlocked ? (stars ? "REPLAY ISSUE" : "FIGHT ISSUE") : "🔒 LOCKED"}
					</button>
				</div>
			`;
			issueCard
				.querySelector(".btn-read-issue")
				.addEventListener("click", () => startCombat(issue.id));
			container.appendChild(issueCard);
		});

		// Endless gauntlet (unlocks after Issue #2)
		const endlessUnlocked = gameState.getStars("issue_2") > 0;
		const endless = document.createElement("div");
		endless.className = `issue-cover-card endless ${endlessUnlocked ? "" : "locked"}`;
		endless.innerHTML = `
			<div class="issue-badge">∞</div>
			<div class="issue-cover-art">
				<div class="comic-burst">ENDLESS</div>
				<div class="boss-preview">BOSS EVERY 5 WAVES</div>
			</div>
			<div class="issue-details">
				<h3>${ENDLESS_ISSUE.title}</h3>
				<p>${endlessUnlocked ? ENDLESS_ISSUE.coverDesc : "Clear Issue #2 to unlock."}</p>
				<div class="issue-meta"><span class="stars">BEST: WAVE ${gameState.endlessBest || 0}</span></div>
				<div class="issue-rewards"><span>${iconHTML(ICON.coin)} 45/wave</span><span>${iconHTML(ICON.ink)} 4/wave</span><span>✨ XP/wave</span></div>
				<button class="btn-read-issue comic-btn" ${endlessUnlocked ? "" : "disabled"}>
					${endlessUnlocked ? "ENTER THE GAUNTLET" : "🔒 LOCKED"}
				</button>
			</div>
		`;
		endless
			.querySelector(".btn-read-issue")
			.addEventListener("click", () => startCombat("endless"));
		container.appendChild(endless);
	}

	// ── ROSTER & TEAM BUILDER ───────────────────────────────────────────────
	document.querySelectorAll("#roster-filters .filter-group").forEach((group) => {
		group.addEventListener("click", (e) => {
			const chip = e.target.closest(".chip");
			if (!chip) return;
			rosterFilter[group.dataset.filter] = chip.dataset.value;
			group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
			renderRoster();
		});
	});
	$("filter-locked").addEventListener("change", (e) => {
		rosterFilter.locked = e.target.checked;
		renderRoster();
	});

	function comboPartnerOf(combo, id) {
		return combo.a === id ? combo.b : combo.a;
	}

	function renderComboBook() {
		const team = gameState.team;
		const active = [];
		for (let i = 0; i < team.length - 1; i++) {
			const c = HERO_COMBOS.find(
				(x) => (x.a === team[i] && x.b === team[i + 1]) || (x.b === team[i] && x.a === team[i + 1]),
			);
			if (c) active.push({ c, slot: i + 1 });
		}
		const ready = $("combo-ready");
		ready.innerHTML = active.length
			? active
					.map((a) => `<span class="cr-chip">⚡ ${a.c.name} <small>slots ${a.slot}→${a.slot + 1}</small></span>`)
					.join("")
			: `<span class="cr-none">No pair combos in this slot order. Check the Combo Book below!</span>`;

		const seen = gameState.combosSeen;
		$("combo-count").textContent = `${Object.keys(seen).length}/${HERO_COMBOS.length} DISCOVERED`;
		const rank = (c) => {
			if (active.some((a) => a.c.id === c.id)) return 0;
			const own = gameState.inventory[c.a] && gameState.inventory[c.b];
			return own ? 1 : 2;
		};
		const book = $("combo-book");
		book.innerHTML = "";
		[...HERO_COMBOS]
			.sort((x, y) => rank(x) - rank(y))
			.forEach((c) => {
				const ha = HEROES_MAP.get(c.a);
				const hb = HEROES_MAP.get(c.b);
				const ownA = !!gameState.inventory[c.a];
				const ownB = !!gameState.inventory[c.b];
				const isActive = rank(c) === 0;
				const row = document.createElement("div");
				row.className = `combo-row ${isActive ? "active" : ""} ${ownA && ownB ? "owned" : ""} ${seen[c.id] ? "seen" : ""}`;
				const portrait = (h, own) =>
					`<span class="cb-hero ${own ? "" : "locked"}" title="${own ? h.name : "Not owned"}">${own ? h.artSvg : "?"}<em>${own ? h.name : "???"}</em></span>`;
				row.innerHTML = `
					${portrait(ha, ownA)}<span class="cb-plus">+</span>${portrait(hb, ownB)}
					<span class="cb-info">
						<b>${seen[c.id] || (ownA && ownB) ? c.name : "???"}</b>
						<small>${seen[c.id] || (ownA && ownB) ? c.desc : "Collect both heroes to reveal."}</small>
						<i>+${Math.round(c.bonus * 100)}% DMG${isActive ? " · READY IN YOUR SQUAD" : seen[c.id] ? " · SEEN" : ""}</i>
					</span>`;
				book.appendChild(row);
			});
	}

	function renderRoster() {
		const rosterGrid = $("roster-grid");
		const teamSlots = $("active-team-slots");

		// 1. Active team of 3
		const syn = synergyHelper.getSynergy(gameState.team);
		$("synergy-banner").textContent = `SQUAD SYNERGY — ${syn.label}`;
		$("synergy-banner").classList.toggle("on", syn.label !== "NO SYNERGY");
		renderComboBook();

		teamSlots.innerHTML = "";
		gameState.team.forEach((heroId, slotIdx) => {
			const heroData = HEROES_MAP.get(heroId);
			const inv = gameState.inventory[heroId];
			const slot = document.createElement("div");
			slot.className = `team-slot-card ${slotIdx === selectedSlot ? "selected" : ""}`;
			if (heroData && inv) {
				slot.appendChild(createHeroCard(heroData, inv));
			} else {
				slot.innerHTML = `<div class="empty-slot">EMPTY SQUAD SLOT ${slotIdx + 1}</div>`;
			}
			const label = document.createElement("div");
			label.className = "slot-label";
			label.textContent =
				slotIdx === selectedSlot ? `▶ SLOT ${slotIdx + 1} (SELECTED)` : `SLOT ${slotIdx + 1}`;
			slot.appendChild(label);
			slot.addEventListener("click", () => {
				selectedSlot = slotIdx;
				renderRoster();
			});
			teamSlots.appendChild(slot);
		});

		// 2. Collection with filters
		rosterGrid.innerHTML = "";
		const owned = Object.keys(gameState.inventory).length;
		$("roster-count").textContent = `${owned}/${HEROES_DATA.length} COLLECTED`;

		const list = [...HEROES_DATA]
			.sort((a, b) => {
				const oa = gameState.inventory[a.id] ? 1 : 0;
				const ob = gameState.inventory[b.id] ? 1 : 0;
				return ob - oa || b.rarity - a.rarity;
			})
			.filter((h) => {
				if (rosterFilter.rarity !== "all" && h.rarity !== Number(rosterFilter.rarity)) return false;
				if (rosterFilter.affinity !== "all" && h.affinity !== rosterFilter.affinity) return false;
				if (!rosterFilter.locked && !gameState.inventory[h.id]) return false;
				return true;
			});

		if (!list.length) {
			rosterGrid.innerHTML = '<p class="roster-hint">No heroes match these filters.</p>';
			return;
		}

		list.forEach((heroData) => {
			const heroId = heroData.id;
			const inv = gameState.inventory[heroId];
			const wrapper = document.createElement("div");
			wrapper.className = "roster-item";

			if (!inv) {
				wrapper.appendChild(createHeroCard(heroData, null, { locked: true }));
				const hint = document.createElement("div");
				hint.className = "locked-hint";
				hint.textContent = "Find in Booster Packs";
				wrapper.appendChild(hint);
				rosterGrid.appendChild(wrapper);
				return;
			}

			wrapper.appendChild(createHeroCard(heroData, inv));

			const actions = document.createElement("div");
			actions.className = "roster-actions";
			const atCap = inv.level >= MAX_HERO_LEVEL;
			const levelCostCoins = inv.level * 60;
			const levelCostInk = inv.level * 10;
			const neededShards = inv.rank * (heroData.rarity * 5);
			const maxRank = inv.rank >= 5;
			const canRank = inv.shards >= neededShards && !maxRank;
			const inTeam = gameState.team.includes(heroId);
			const xpMax = xpNeeded(inv.level);
			const xpPct = atCap ? 100 : Math.min(100, ((inv.xp || 0) / xpMax) * 100);

			actions.innerHTML = `
				<div class="xp-row"><div class="meter-bar xp"><div class="fill" style="width:${xpPct}%"></div></div><span>${atCap ? "MAX" : `${inv.xp || 0}/${xpMax} XP`}</span></div>
				<button class="comic-btn btn-lvl" ${atCap ? "disabled" : ""}>
					${atCap ? "MAX LEVEL" : `LVL UP (${levelCostCoins}${iconHTML(ICON.coin)} / ${levelCostInk}${iconHTML(ICON.ink)})`}
				</button>
				<button class="comic-btn btn-rank ${canRank ? "glow" : ""}" ${canRank ? "" : "disabled"}>
					${maxRank ? "MAX RANK" : `RANK UP (${inv.shards}/${neededShards} ✦)`}
				</button>
				<button class="comic-btn btn-assign ${inTeam ? "in-squad" : ""}">
					${inTeam ? `★ IN SQUAD (SLOT ${gameState.team.indexOf(heroId) + 1})` : `ASSIGN TO SLOT ${selectedSlot + 1}`}
				</button>
			`;

			actions.querySelector(".btn-lvl").addEventListener("click", () => {
				if (gameState.levelUpHero(heroId)) {
					ComicAudio.playCoin();
					renderRoster();
					updateHUD();
				} else {
					ComicToast("Need more Coins or Ink to level up!", "warn");
				}
			});

			actions.querySelector(".btn-rank").addEventListener("click", () => {
				if (gameState.rankUpHero(heroId)) {
					ComicAudio.playReveal(heroData.rarity);
					ComicToast(`${heroData.name} ranked up!`, "good");
					renderRoster();
				}
			});

			actions.querySelector(".btn-assign").addEventListener("click", () => {
				if (inTeam && gameState.team[selectedSlot] === heroId) return;
				gameState.setTeamSlot(selectedSlot, heroId);
				ComicAudio.playPunch(false);
				renderRoster();
			});

			wrapper.appendChild(actions);
			rosterGrid.appendChild(wrapper);
		});
	}

	// ── REWARDS, MISSIONS & STATS ───────────────────────────────────────────
	function renderRewards() {
		const btnDaily = $("btn-claim-daily");
		const dailyStatus = $("daily-status");
		const canClaim = gameState.canClaimDaily();
		const streakDone = gameState.nextStreakDay();
		let doneDays = streakDone ? ((streakDone - 1) % 7) + 1 : 0;
		if (canClaim && doneDays === 7) doneDays = 0;
		const nextDay = doneDays + 1;

		$("streak-track").innerHTML = DAILY_STREAK_REWARDS.map((r, i) => {
			const day = i + 1;
			const claimed = day <= doneDays;
			const isNext = canClaim && day === nextDay;
			return `<div class="streak-day ${claimed ? "claimed" : ""} ${isNext ? "next" : ""}">
				<small>DAY ${day}</small>
				<b>${r.label || iconHTML(ICON.coin) + r.coins}</b>
				<span>${iconHTML(ICON.ink)}${r.ink}</span>
			</div>`;
		}).join("");

		const nextReward = DAILY_STREAK_REWARDS[Math.min(6, nextDay - 1)];
		btnDaily.disabled = !canClaim;
		btnDaily.textContent = canClaim
			? `CLAIM ${nextReward.coins} COINS & ${nextReward.ink} INK`
			: "CLAIMED TODAY";
		dailyStatus.textContent = canClaim
			? streakDone > 0
				? `${streakDone}-day streak! Keep it going for bigger shipments.`
				: "Your daily comic reader supply is ready!"
			: `Streak: ${gameState.dailyStreak} day${gameState.dailyStreak === 1 ? "" : "s"}. Come back tomorrow!`;

		btnDaily.onclick = () => {
			const reward = gameState.claimDaily();
			if (reward) {
				ComicAudio.playReveal(4);
				ComicToast(`+${reward.coins} 🪙  +${reward.ink} 🧪  (Day ${reward.streak})`, "good");
				updateHUD();
				renderRewards();
			}
		};

		// Missions
		const list = $("quest-list");
		list.innerHTML = "";
		gameState.getQuests().forEach((q) => {
			const row = document.createElement("div");
			row.className = `quest-row ${q.done ? "done" : ""} ${q.claimed ? "claimed" : ""}`;
			row.innerHTML = `
				<div class="quest-text">
					<b>${q.label}</b>
					<div class="meter-bar xp"><div class="fill" style="width:${(q.progress / q.target) * 100}%"></div></div>
					<small>${q.progress}/${q.target} · ${iconHTML(ICON.coin)}${q.coins} ${iconHTML(ICON.ink)}${q.ink}</small>
				</div>
				<button class="comic-btn quest-claim" ${q.done && !q.claimed ? "" : "disabled"}>
					${q.claimed ? "CLAIMED" : q.done ? "CLAIM" : "IN PROGRESS"}
				</button>
			`;
			row.querySelector(".quest-claim").addEventListener("click", () => {
				if (gameState.claimQuest(q.id)) {
					ComicAudio.playCoin();
					ComicToast(`Mission complete! +${q.coins} 🪙 +${q.ink} 🧪`, "good");
					updateHUD();
					renderRewards();
				}
			});
			list.appendChild(row);
		});

		// Stats
		const s = gameState.stats;
		const clearedStars = ISSUES_CAMPAIGN.reduce((n, i) => n + gameState.getStars(i.id), 0);
		const statRows = [
			["🏆 Battles won", s.wins],
			["💥 Villains defeated", s.kills],
			["🎯 Critical hits", s.crits],
			["★ Ultimates unleashed", s.ults],
			["📦 Packs opened", s.pulls],
			["⭐ Issue stars", `${clearedStars}/${ISSUES_CAMPAIGN.length * 3}`],
			["♾ Best Gauntlet wave", gameState.endlessBest || 0],
			["☣ Best Mutator wave", gameState.mutatorBest || 0],
			["⚡ Pair combos fired", s.pairs],
			["📖 Combos discovered", `${Object.keys(gameState.combosSeen).length}/${HERO_COMBOS.length}`],
			["🎮 Arcade rewards", s.arcade],
			["🦸 Heroes collected", `${Object.keys(gameState.inventory).length}/${HEROES_DATA.length}`],
		];
		$("stats-grid").innerHTML = statRows
			.map(([k, v]) => `<div class="stat-tile"><span>${k}</span><b>${v}</b></div>`)
			.join("");
	}

	let resetArmed = false;
	$("btn-reset").addEventListener("click", (e) => {
		if (!resetArmed) {
			resetArmed = true;
			e.target.textContent = "CLICK AGAIN TO ERASE EVERYTHING";
			setTimeout(() => {
				resetArmed = false;
				e.target.textContent = "RESET SAVE DATA";
			}, 3500);
			return;
		}
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (err) {
			/* ignore */
		}
		location.reload();
	});

	// ── COMBAT ARENA CONTROLLER ─────────────────────────────────────────────
	const elStrip = $("battle-live");
	const elCombatHeroes = $("combat-heroes");
	const elCombatVillains = $("combat-villains");
	const elCombatLog = $("combat-log-text");
	const elBtnBasic = $("act-basic");
	const elBtnSkill = $("act-skill");
	const elBtnUlt = $("act-ult");
	const elBtnGuard = $("act-guard");
	const elBtnFocus = $("act-focus");
	const elBtnFinisher = $("act-finisher");
	const elBtnAuto = $("btn-auto");
	const elBtnFast = $("btn-fast");
	const elBtnRetreat = $("btn-retreat");
	const elArena = $("comic-arena");
	let retreatArmed = false;
	let lastIssueId = null;

	function renderBattleShell() {
		const active = !!combatEngine;
		$("battle-empty").hidden = active;
		elStrip.hidden = !active;
		if (active) renderCombatScene();
	}

	$("btn-go-campaign").addEventListener("click", () => switchView("campaign"));

	function startCombat(issueId, opts = {}) {
		lastBattleOpts = opts;
		if (combatEngine) combatEngine.destroy();
		combatEngine = null;
		fighterPanels.clear();
		elCombatHeroes.innerHTML = "";
		elCombatVillains.innerHTML = "";
		lastIssueId = issueId;
		$("battle-end-modal").classList.remove("open");
		elBtnAuto.textContent = "🤖 AUTO: OFF";
		elBtnAuto.classList.remove("on");
		elBtnFast.textContent = "⏩ FAST: OFF";
		elBtnFast.classList.remove("on");
		elCombatLog.innerHTML = "";
		switchView("battle");
		combatEngine = new ComicCombatEngine(gameState, handleCombatEvent);
		combatEngine.blockOn = prefs.block;
		applyBattleTheme(issueId);
		elTimingLayer.innerHTML = "";
		timing = null;
		blockActive = null;
		elStrip.classList.remove("timing-on");
		combatEngine.startBattle(issueId, opts);
		const chip = $("battle-mut");
		chip.hidden = !opts.mutator;
		if (opts.mutator) chip.textContent = `MUTATOR: ${opts.mutator.name}`;
		renderBattleShell();
	}

	const STATUS_ICONS = {
		stun: [ICON.stun, "Stunned"],
		bleed: [ICON.bleed, "Bleeding"],
		atkDown: [ICON.atkDown, "Attack down"],
		atkUp: [ICON.atkUp, "Attack up"],
		defDown: [ICON.defDown, "Defense down"],
		mark: ["🎯", "Marked (+25% damage taken)"],
		evade: [ICON.evade, "Evasion"],
		taunt: ["📣", "Taunting"],
		guard: [ICON.guard, "Guarding (-50% damage)"],
		crit: [ICON.crit, "Crit chance up"],
		immuneCrit: ["💎", "Crit immune"],
	};

	function statusIcons(unit) {
		return Object.keys(STATUS_ICONS)
			.filter((k) => unit.st[k] > 0)
			.map((k) => {
				const [glyph, label] = STATUS_ICONS[k];
				const inner = typeof glyph === "number" ? iconHTML(glyph) : glyph;
				return `<span class="status-icon" title="${label}">${inner}</span>`;
			})
			.join("");
	}

	// ── Battle presentation preferences ─────────────────────────────────────
	const PREFS_KEY = "comic_clash:prefs";
	const prefs = (() => {
		try {
			return { timing: true, block: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
		} catch (e) {
			return { timing: true, block: true };
		}
	})();
	function savePrefs() {
		try {
			localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
		} catch (e) {
			/* ignore */
		}
	}

	// Battlefield themes per issue (sky, ground, decor buildings from Tiny Swords)
	const BATTLE_THEMES = {
		issue_1: { cls: "alley", decor: ["red_house1", "red_tower", "red_house1"] },
		issue_2: { cls: "cyber", decor: ["black_tower", "black_castle", "black_tower"] },
		issue_3: { cls: "crypt", decor: ["black_monastery", "black_tower"] },
		issue_4: { cls: "cosmic", decor: ["blue_tower", "blue_monastery", "blue_tower"] },
		issue_5: { cls: "clock", decor: ["red_castle", "red_tower"] },
		issue_6: { cls: "noir", decor: ["black_house1", "black_house1", "black_tower", "black_house1"] },
		issue_7: { cls: "rift", decor: ["blue_castle", "black_tower"] },
		issue_8: { cls: "paper", decor: ["blue_castle", "red_castle"] },
		issue_9: { cls: "carnival", decor: ["red_monastery", "red_house1", "red_tower"] },
		issue_10: { cls: "crossover", decor: ["black_castle", "blue_castle", "red_castle"] },
		endless: { cls: "void", decor: ["black_tower", "black_monastery"] },
	};

	function applyBattleTheme(issueId) {
		const theme = BATTLE_THEMES[issueId] || BATTLE_THEMES.issue_1;
		elArena.dataset.theme = theme.cls;
		$("bf-far").innerHTML = theme.decor
			.map((d) => `<img src="assets/scene/${d}.png" alt="" draggable="false" />`)
			.join("");
	}

	// ── Presentation timing: delay HP/FX until attacks visually connect ─────
	let holdUntil = 0;
	let renderTimer = null;
	const animMarks = new Map();

	function safeRender() {
		const wait = holdUntil - performance.now();
		if (wait > 8) {
			clearTimeout(renderTimer);
			renderTimer = setTimeout(renderCombatScene, wait);
		} else {
			renderCombatScene();
		}
	}

	function handleCombatEvent(type, data) {
		switch (type) {
			case "action_hit":
				prepareAttack(data);
				safeRender();
				showHitFx(data);
				break;
			case "move_used":
				showPlayedCard(data);
				if (data.target && ["basic", "skill", "finisher"].includes(data.kind)) {
					attackAnim(data.hero, data.target, {
						ranged: isRangedMove(data.hero, data.move),
					});
				}
				break;
			case "ultimate_cutin":
				showUltimateSplash(data.hero, data.quote);
				break;
			case "block_window":
				startBlockWindow(data);
				break;
			case "block_result":
				showBlockResult(data);
				break;
			case "pair_combo":
				showBossBanner(`⚡ ${data.combo.name}!`, true);
				floatText(data.hero.uid, "COMBO!", "big", true);
				break;
			case "chain":
				floatText(data.hero.uid, "CHAIN!", "shield");
				break;
			case "energy":
				safeRender();
				floatText(data.unit.uid, `+${data.amount} NRG`, "shield");
				break;
			case "cleanse":
				safeRender();
				floatText(data.unit.uid, "CLEANSED", "heal");
				break;
			case "heal":
				safeRender();
				floatText(data.unit.uid, `+${data.amount}`, "heal");
				break;
			case "shield":
				safeRender();
				floatText(data.unit.uid, "SHIELD!", "shield");
				break;
			case "miss":
				floatText(data.target.uid, "MISS!", "miss");
				break;
			case "dot":
				safeRender();
				floatText(data.unit.uid, `-${data.damage}`, "dot");
				break;
			case "boss_special":
				showBossBanner(`⚠ ${data.boss.name}: ${data.name.toUpperCase()}!`);
				break;
			case "screen_shake":
				shakeStrip(data.big);
				break;
			case "combo":
				updateComboChip(data.combo, data.bonus);
				break;
			case "wave_clear":
				showBossBanner(`WAVE ${data.wave} CLEARED!`, true);
				safeRender();
				break;
			case "wave_start":
			case "turn_change":
			case "unit_down":
				safeRender();
				break;
			case "battle_start":
				renderCombatScene();
				break;
			case "battle_victory":
				safeRender();
				fighterPanels.forEach((p) => {
					if (p.classList.contains("hero-panel") && !p.classList.contains("fainted")) p.classList.add("cheer");
				});
				setTimeout(() => showVictoryModal(data), 1100);
				break;
			case "battle_defeat":
				safeRender();
				setTimeout(() => showDefeatModal(data), 900);
				break;
			case "log_update":
				renderLog(data.log || [data.message]);
				break;
		}
		if (type === "battle_victory" || type === "battle_defeat") updateHUD();
	}

	function renderLog(lines) {
		const recent = lines.slice(-4);
		elCombatLog.innerHTML = recent
			.map((l, i) => `<div class="log-line ${i === recent.length - 1 ? "latest" : ""}">${l}</div>`)
			.join("");
	}

	function updateComboChip(combo, bonus) {
		const chip = $("battle-combo");
		chip.hidden = combo < 2;
		chip.textContent = `COMBO x${combo}${bonus ? ` (+${Math.round(bonus * 100)}% DMG)` : ""}`;
		if (combo >= 3) floatArena(`${combo} HIT COMBO!`, "combo-pop");
	}

	function panelFor(uid) {
		return fighterPanels.get(uid) || elArena.querySelector(`[data-uid="${uid}"]`);
	}

	function artCenter(uid) {
		const panel = panelFor(uid);
		if (!panel) return null;
		const art = panel.querySelector(".fighter-art") || panel;
		const arena = elArena.getBoundingClientRect();
		const r = art.getBoundingClientRect();
		return { x: r.left - arena.left + r.width / 2, y: r.top - arena.top + r.height / 2, w: r.width, h: r.height };
	}

	function floatText(uid, text, kind = "dmg", big = false) {
		const c = artCenter(uid);
		if (!c) return;
		const el = document.createElement("div");
		el.className = `float-num ${kind} ${big ? "big" : ""}`;
		el.textContent = text;
		el.style.left = `${c.x + (Math.random() - 0.5) * 40}px`;
		el.style.top = `${c.y - c.h * 0.35}px`;
		elArena.appendChild(el);
		setTimeout(() => el.remove(), 1000);
	}

	function floatArena(text, cls) {
		const el = document.createElement("div");
		el.className = `arena-pop ${cls}`;
		el.textContent = text;
		elArena.appendChild(el);
		setTimeout(() => el.remove(), 900);
	}

	function isRangedMove(unit, move) {
		const info = getUnitSprite(unit);
		return info.cls === "archer" || (move && move.sfx === "laser");
	}

	/** Sprite attack frames + body dash (melee) or projectile (ranged). Returns when it connects. */
	function attackAnim(attacker, target, opts = {}) {
		const aPanel = fighterPanels.get(attacker.uid);
		const tPanel = target && fighterPanels.get(target.uid);
		const now = performance.now();
		if (!aPanel) return now;
		const aArt = aPanel.querySelector(".fighter-art");
		const info = aPanel._refs.spriteInfo;
		const ranged = opts.ranged ?? info.cls === "archer";
		const delay = opts.contactDelay ?? (ranged ? 460 : 240);
		const contactAt = now + delay;
		animMarks.set(attacker.uid, { contactAt });
		holdUntil = Math.max(holdUntil, contactAt);

		const ms = setSpriteMode(aPanel._refs.sprite, info, "atk");
		setTimeout(() => {
			if (aPanel.isConnected) setSpriteMode(aPanel._refs.sprite, info, "idle");
		}, ms + 40);

		if (!tPanel) return contactAt;
		const a = artCenter(attacker.uid);
		const t = artCenter(target.uid);
		if (!a || !t) return contactAt;
		const dir = Math.sign(t.x - a.x) || 1;
		const total = delay + 340;
		aPanel.style.zIndex = 8;
		setTimeout(() => (aPanel.style.zIndex = ""), total);

		if (ranged) {
			const launch = Math.max(60, delay - 260);
			aArt.animate(
				[
					{ transform: "translate(0,0)", offset: 0 },
					{ transform: `translate(${-dir * 12}px,0) scale(0.97)`, offset: launch / total, easing: "ease-in" },
					{ transform: `translate(${dir * 8}px,0)`, offset: (launch + 80) / total },
					{ transform: "translate(0,0)", offset: 1 },
				],
				{ duration: total, easing: "ease-out" },
			);
			setTimeout(() => fireProjectile(attacker, a, t, delay - launch, dir, info), launch);
		} else {
			const windup = Math.max(70, delay - 150);
			const dx = t.x - a.x - dir * 95;
			const dy = (t.y - a.y) * 0.6;
			aArt.animate(
				[
					{ transform: "translate(0,0) scale(1)", offset: 0 },
					{ transform: `translate(${-dir * 14}px,0) scale(0.95)`, offset: windup / total, easing: "ease-in" },
					{ transform: `translate(${dx}px,${dy}px) scale(1.15)`, offset: delay / total },
					{ transform: `translate(${dx}px,${dy}px) scale(1.15)`, offset: (delay + 70) / total },
					{ transform: "translate(0,0) scale(1)", offset: 1 },
				],
				{ duration: total, easing: "ease-out" },
			);
		}
		return contactAt;
	}

	function fireProjectile(attacker, a, t, travel, dir, info) {
		const p = document.createElement("div");
		const arrow = info.cls === "archer";
		p.className = `projectile ${arrow ? "arrow" : "orb"}`;
		if (!arrow) {
			const col = attacker.isHero ? attacker.colors.accent : HERO_AFFINITIES[attacker.affinity].color;
			p.style.setProperty("--pc", col);
		} else if (dir < 0) {
			p.style.transform = "scaleX(-1)";
		}
		p.style.left = `${a.x}px`;
		p.style.top = `${a.y - 8}px`;
		elArena.appendChild(p);
		const flip = arrow && dir < 0 ? " scaleX(-1)" : "";
		p.animate(
			[
				{ transform: `translate(0,0)${flip}` },
				{ transform: `translate(${t.x - a.x}px,${t.y - a.y - 8}px)${flip}` },
			],
			{ duration: Math.max(80, travel), easing: "linear", fill: "forwards" },
		);
		setTimeout(() => p.remove(), travel + 40);
	}

	function prepareAttack(data) {
		const a = data.attacker;
		if (!a || !data.onom) return;
		const mark = animMarks.get(a.uid);
		const fresh = mark && mark.contactAt > performance.now() - 500;
		if (!fresh) attackAnim(a, data.target, { ranged: !a.isHero && getUnitSprite(a).cls === "archer" });
	}

	function showHitFx(data) {
		const { target, damage, isCrit, weakness, resisted, absorbed, onom } = data;
		const wait = Math.max(0, holdUntil - performance.now());
		const play = () => {
			if (onom) showFloatingOnomatopoeia(onom, isCrit, weakness);
			const panel = panelFor(target.uid);
			if (panel) {
				panel.classList.add("hit");
				setTimeout(() => panel.classList.remove("hit"), 320);
			}
			if (isCrit || (data.attacker && data.attacker.isBoss)) spawnSpriteFx(target.uid, "explosion");
			else if (damage > 0) spawnSpriteFx(target.uid, "dust");
			let label = `-${damage}`;
			if (isCrit) label = `CRIT! ${label}`;
			else if (weakness) label = `${label} ▲`;
			else if (resisted) label = `${label} ▼`;
			if (damage > 0 || !absorbed) floatText(target.uid, label, target.isHero ? "hero-dmg" : "dmg", isCrit);
			else floatText(target.uid, "ABSORBED", "shield");
			if (isCrit) {
				shakeStrip(false);
				elStrip.classList.add("hitstop");
				setTimeout(() => elStrip.classList.remove("hitstop"), 120);
			}
		};
		if (wait > 6) setTimeout(play, wait);
		else play();
	}

	function shakeStrip(big) {
		const cls = big ? "shake-big" : "shake";
		elStrip.classList.remove("shake", "shake-big");
		void elStrip.offsetWidth;
		elStrip.classList.add(cls);
		setTimeout(() => elStrip.classList.remove(cls), 450);
	}

	function showBossBanner(text, good = false) {
		const banner = $("boss-banner");
		$("boss-banner-text").textContent = text;
		banner.classList.toggle("good", good);
		banner.classList.remove("visible");
		void banner.offsetWidth;
		banner.classList.add("visible");
	}

	// ── Timing mini-game (your attacks) & block mini-game (their attacks) ───
	const elTimingLayer = $("timing-layer");
	let timing = null;
	let blockActive = null;

	function ringAt(c, cls, dur, label) {
		elTimingLayer.innerHTML = `
			<div class="tm-wrap ${cls}" style="left:${c.x}px;top:${c.y}px;--dur:${dur}ms">
				<div class="tm-core"></div><div class="tm-ring"></div>
				<div class="tm-text">${label}</div>
			</div>`;
		return elTimingLayer.firstElementChild;
	}

	function playMove(action) {
		const eng = combatEngine;
		if (!eng || !eng.isPlayerTurn || eng.isGameOver || timing) return;
		if (!prefs.timing || eng.auto) {
			eng.executeHeroAction(action);
			return;
		}
		eng.ensureValidTarget();
		const tgt = eng.villains[eng.selectedTarget];
		const c = tgt && artCenter(tgt.uid);
		if (!c) {
			eng.executeHeroAction(action);
			return;
		}
		elStrip.classList.add("timing-on");
		ringAt(c, "attack", 1000, "TAP WHEN THE RING HITS!");
		timing = { action, idx: eng.selectedTarget, t0: performance.now() };
		timing.timeout = setTimeout(() => resolveTiming(null), 1150);
	}

	function resolveTiming(pressAt) {
		if (!timing) return;
		const { action, idx } = timing;
		clearTimeout(timing.timeout);
		let q = "miss";
		let mult = 0.9;
		if (pressAt != null) {
			const t = pressAt - timing.t0;
			const d = Math.abs(2.4 - 2.0 * (t / 1000) - 1);
			if (d <= 0.14) {
				q = "perfect";
				mult = 1.35;
			} else if (d <= 0.32) {
				q = "good";
				mult = 1.15;
			} else {
				q = "weak";
				mult = 1.0;
			}
		}
		timing = null;
		const wrap = elTimingLayer.firstElementChild;
		if (wrap) {
			wrap.classList.add("done", q);
			const lab = wrap.querySelector(".tm-text");
			lab.textContent = { perfect: "PERFECT! x1.35", good: "GOOD! x1.15", weak: "OK x1.0", miss: "MISSED x0.9" }[q];
		}
		if (q === "perfect") ComicAudio.playReveal(4);
		else if (q === "good") ComicAudio.playCoin();
		setTimeout(() => {
			elTimingLayer.innerHTML = "";
			elStrip.classList.remove("timing-on");
			if (combatEngine && !combatEngine.isGameOver) {
				combatEngine.executeHeroAction(action, idx, { timing: mult, energyBonus: q === "perfect" ? 10 : 0 });
			}
		}, 330);
	}

	function startBlockWindow(data) {
		const { villain, target, ms } = data;
		attackAnim(villain, target, {
			contactDelay: ms + 60,
			ranged: getUnitSprite(villain).cls === "archer",
		});
		const c = artCenter(target.uid);
		if (!c) return;
		ringAt(c, "block", Math.round(ms / 0.7), "BLOCK! (SPACE / TAP)");
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "block-btn";
		btn.textContent = "🛡 BLOCK!";
		btn.addEventListener("pointerdown", (e) => {
			e.stopPropagation();
			pressBlock();
		});
		elTimingLayer.appendChild(btn);
		blockActive = { pressed: false };
		setTimeout(() => {
			blockActive = null;
			elTimingLayer.innerHTML = "";
		}, ms + 420);
	}

	function pressBlock() {
		if (!blockActive || blockActive.pressed || !combatEngine) return;
		blockActive.pressed = true;
		combatEngine.block();
		const wrap = elTimingLayer.querySelector(".tm-wrap");
		if (wrap) wrap.classList.add("locked");
	}

	function showBlockResult(data) {
		const label = {
			perfect: "PERFECT BLOCK! +20 NRG",
			good: "BLOCKED!",
			weak: "TOO EARLY/LATE",
		}[data.quality];
		floatText(data.target.uid, label, data.quality === "weak" ? "miss" : "shield", data.quality === "perfect");
		if (data.quality === "perfect") {
			ComicAudio.playReveal(4);
			shakeStrip(false);
		} else if (data.quality === "good") ComicAudio.playCoin();
	}

	elArena.addEventListener("pointerdown", () => {
		if (timing) resolveTiming(performance.now());
		else if (blockActive) pressBlock();
	});

	// Persistent fighter panels (keyed by combat uid) so sprite animations keep running between renders
	const fighterPanels = new Map();

	function buildFighterPanel(unit) {
		const box = document.createElement("div");
		box.dataset.uid = unit.uid;
		const sprite = getUnitSprite(unit);
		box.className = `fighter-panel unit ${unit.isHero ? "hero-panel" : "villain-panel"} ${unit.isBoss ? "boss" : ""}`;
		if (unit.isHero) box.style.setProperty("--fighter-accent", unit.colors.accent);
		box.innerHTML = `
			<div class="unit-plate">
				<div class="fighter-name">${unit.isHero ? "" : unit.icon + " "}${unit.name}</div>
				<div class="meter-bar hp ${unit.isHero ? "" : "villain-hp"}"><div class="fill"></div><span class="fighter-hp-num"></span></div>
				${unit.isHero ? '<div class="meter-bar nrg"><div class="fill"></div></div>' : ""}
				<div class="fighter-tags"></div>
			</div>
			<div class="fighter-art ${unit.isBoss ? "big" : ""}">
				<div class="unit-ring"></div><div class="unit-shadow"></div><div class="sprite"></div>
			</div>
		`;
		const spriteEl = box.querySelector(".sprite");
		setSpriteMode(spriteEl, sprite, "idle");
		box._refs = {
			sprite: spriteEl,
			spriteInfo: sprite,
			hpNum: box.querySelector(".fighter-hp-num"),
			hpFill: box.querySelector(".hp .fill"),
			nrg: box.querySelector(".nrg"),
			nrgFill: box.querySelector(".nrg .fill"),
			tags: box.querySelector(".fighter-tags"),
			tagsKey: "",
		};
		return box;
	}

	function spawnSpriteFx(uid, kind) {
		const box = fighterPanels.get(uid);
		if (!box) return;
		const art = box.querySelector(".fighter-art");
		const fx = document.createElement("div");
		fx.className = `fx-sprite fx-${kind}`;
		art.appendChild(fx);
		setTimeout(() => fx.remove(), 700);
	}

	function syncPanelList(container, units, onCreate) {
		const keep = new Set(units.map((u) => u.uid));
		[...container.children].forEach((el) => {
			if (!keep.has(Number(el.dataset.uid))) {
				fighterPanels.delete(Number(el.dataset.uid));
				el.remove();
			}
		});
		units.forEach((u, i) => {
			let el = fighterPanels.get(u.uid);
			if (!el) {
				el = buildFighterPanel(u);
				fighterPanels.set(u.uid, el);
				if (onCreate) onCreate(el, u);
			}
			if (container.children[i] !== el) container.insertBefore(el, container.children[i] || null);
		});
	}

	function updatePanel(el, u, extra) {
		const r = el._refs;
		const hpPct = Math.max(0, Math.min(100, Math.round((u.hp / u.maxHp) * 100)));
		r.hpNum.textContent = `${u.hp}/${u.maxHp}`;
		r.hpFill.style.width = `${hpPct}%`;
		if (r.nrg) {
			r.nrgFill.style.width = `${Math.max(0, Math.min(100, u.energy))}%`;
			r.nrg.classList.toggle("full", u.energy >= 100);
		}
		const tags = [];
		if (u.isHero) {
			if (u.shield > 0) tags.push(`<span class="shield-badge">${iconHTML(ICON.shield)} ${u.shield}</span>`);
			if (u.skillCd > 0) tags.push(`<span class="cd-badge">SKILL CD ${u.skillCd}</span>`);
		} else {
			const aff = HERO_AFFINITIES[u.affinity];
			tags.push(`<span class="aff-badge" style="color:${aff.color}">${aff.icon} ${u.affinity}</span>`);
			if (u.shield > 0) tags.push(`<span class="shield-badge">${iconHTML(ICON.shield)} ${u.shield}</span>`);
			if (u.special && u.hp > 0 && u.cd === 1)
				tags.push(`<span class="charge-badge">⚠ ${u.special.name}</span>`);
		}
		tags.push(statusIcons(u));
		const key = tags.join("");
		if (key !== r.tagsKey) {
			r.tagsKey = key;
			r.tags.innerHTML = key;
		}
		el.classList.toggle("fainted", u.hp <= 0);
		el.classList.toggle("active-turn", !!extra.active);
		el.classList.toggle("selected-target", !!extra.selected);
	}

	function renderCombatScene() {
		const eng = combatEngine;
		if (!eng) return;

		$("battle-issue").textContent = `ISSUE ${eng.currentIssue.issueNo}`;
		$("battle-wave").textContent = eng.currentIssue.endless
			? `WAVE ${eng.waveIndex + 1}`
			: `WAVE ${eng.waveIndex + 1}/${eng.waveCount}`;
		$("battle-turn").textContent = `TURN ${eng.turn}`;

		syncPanelList(elCombatHeroes, eng.heroes);
		eng.heroes.forEach((h, idx) => {
			const active = eng.isPlayerTurn && !eng.isGameOver && eng.activeHeroIndex === idx;
			updatePanel(fighterPanels.get(h.uid), h, { active });
		});

		syncPanelList(elCombatVillains, eng.villains, (el, v) => {
			el.addEventListener("click", (e) => {
				const e2 = combatEngine;
				if (!e2 || !e2.isPlayerTurn || v.hp <= 0 || timing) return;
				e.stopPropagation();
				e2.setTarget(e2.villains.indexOf(v));
				renderCombatScene();
			});
		});
		eng.villains.forEach((v, idx) => {
			updatePanel(fighterPanels.get(v.uid), v, {
				selected: idx === eng.selectedTarget && v.hp > 0,
			});
		});

		// Move cards
		const activeHero = eng.getActiveHero();
		const canAct = activeHero && eng.isPlayerTurn && !eng.isGameOver && !eng.auto;
		const hot = activeHero && eng.isPlayerTurn && !eng.isGameOver;
		const elMoveHero = $("move-hero");
		if (hot) {
			const kit = HERO_KITS[activeHero.id] || DEFAULT_KIT;
			const affIcon = ICON.affinity[activeHero.affinity];
			const aff = HERO_AFFINITIES[activeHero.affinity];
			elMoveHero.innerHTML = `<span class="mh-art">${activeHero.artSvg}</span><b>${activeHero.name}</b><span style="color:${aff.color}">${aff.icon} ${aff.name}</span><span class="mh-nrg">ENERGY ${activeHero.energy}/100</span>`;
			fillMoveCard(elBtnBasic, {
				type: "BASIC",
				key: 1,
				icon: ICON.sword,
				move: activeHero.basic,
				info: describeMove({ dmg: activeHero.basic.power || 1 }, activeHero.basic.power),
				cost: "+30 NRG",
				disabled: !canAct,
			});
			fillMoveCard(elBtnSkill, {
				type: "SKILL",
				key: 2,
				icon: affIcon,
				move: activeHero.skill,
				info: describeMove(kit.skill),
				cost: `+20 NRG · CD ${activeHero.skill.cd || 3}`,
				cd: activeHero.skillCd,
				disabled: !canAct || activeHero.skillCd > 0,
			});
			fillMoveCard(elBtnUlt, {
				type: "ULTIMATE",
				key: 3,
				icon: ICON.ultimate,
				move: activeHero.ultimate,
				info: describeMove(kit.ult),
				cost: "NEEDS 100 NRG",
				energy: activeHero.energy,
				disabled: !canAct || activeHero.energy < 100,
			});
			elBtnUlt.classList.toggle("pulse-ult", activeHero.energy >= 100 && canAct);
			[
				[elBtnGuard, TACTICS.guard, !eng.canUseTactic("guard"), activeHero.tacticCd.guard],
				[elBtnFocus, TACTICS.focus, !eng.canUseTactic("focus"), activeHero.tacticCd.focus],
				[elBtnFinisher, TACTICS.finisher, !eng.canUseTactic("finisher"), 0],
			].forEach(([el, t, locked, cd]) => {
				el.disabled = !canAct || locked;
				el.classList.remove("waiting");
				el.title = t.desc;
				el.innerHTML = `
					<span class="mc-key">${t.key}</span>
					<span class="tc-icon">${iconHTML(t.icon)}</span>
					<span class="tc-body"><b>${t.name}</b><span class="tc-desc">${t.desc}</span>
					<span class="mc-tags">${t.tags.map((x) => `<span class="mc-tag ${x.kind || ""}">${x.text}</span>`).join("")}</span></span>
					${cd > 0 ? `<span class="mc-lock">CD<b>${cd}</b></span>` : ""}
					${t.id === "finisher" && locked ? `<span class="mc-lock energy">COMBO<b>${eng.combo}/2</b></span>` : ""}
				`;
			});
		} else {
			elMoveHero.innerHTML = eng.isGameOver ? "" : "<b>VILLAINS ARE MOVING…</b>";
			[elBtnBasic, elBtnSkill, elBtnUlt, elBtnGuard, elBtnFocus, elBtnFinisher].forEach((b) => {
				b.disabled = true;
				b.classList.add("waiting");
			});
			elBtnUlt.classList.remove("pulse-ult");
		}
	}

	function fillMoveCard(el, m) {
		const tags = m.info.tags
			.map((t) => {
				const ic = STATUS_ICONS[t.kind] && typeof STATUS_ICONS[t.kind][0] === "number" ? iconHTML(STATUS_ICONS[t.kind][0], "sm") : "";
				return `<span class="mc-tag ${t.kind || ""}">${ic}${t.text}</span>`;
			})
			.join("");
		const power = m.info.power ? `<span class="mc-pwr">PWR <b>x${m.info.power.toFixed(1)}</b></span>` : `<span class="mc-pwr">SUPPORT</span>`;
		el.classList.remove("waiting");
		el.disabled = m.disabled;
		el.title = m.move.desc;
		el.innerHTML = `
			<span class="mc-key">${m.key}</span>
			<span class="mc-top"><span class="mc-type">${m.type}</span><span class="mc-cost">${m.cost}</span></span>
			<span class="mc-icon">${iconHTML(m.icon)}</span>
			<span class="mc-name">${m.move.name}</span>
			<span class="mc-desc">${m.move.desc}</span>
			<span class="mc-meta">${power}<span class="mc-tgt">${m.info.targets}</span></span>
			<span class="mc-tags">${tags}</span>
			${m.cd > 0 ? `<span class="mc-lock">COOLDOWN<b>${m.cd}</b></span>` : ""}
			${m.energy !== undefined && m.energy < 100 ? `<span class="mc-lock energy">CHARGING<b>${m.energy}%</b></span>` : ""}
		`;
	}

	function showPlayedCard(data) {
		const { hero, kind, move } = data;
		const kit = HERO_KITS[hero.id] || DEFAULT_KIT;
		const isTactic = !!TACTICS[kind];
		const info = isTactic
			? { tags: (data.tags || []).map((t) => ({ text: t })), power: 0 }
			: describeMove(kind === "basic" ? { dmg: move.power || 1 } : kit.skill);
		const card = document.createElement("div");
		card.className = `played-card ${kind}`;
		card.style.setProperty("--pc", hero.colors.accent);
		card.innerHTML = `
			<div class="pc-art">${hero.artSvg}</div>
			<div class="pc-body">
				<span class="pc-type">${isTactic ? "TACTIC" : kind === "basic" ? "ATTACK" : "SKILL"}</span>
				<b>${move.name}</b>
				<span class="pc-tags">${info.tags.slice(0, 2).map((t) => t.text).join(" · ") || "x" + info.power.toFixed(1) + " DMG"}</span>
			</div>`;
		elArena.appendChild(card);
		setTimeout(() => card.remove(), 1100);
	}

	elBtnBasic.addEventListener("click", () => playMove("basic"));
	elBtnSkill.addEventListener("click", () => playMove("skill"));
	elBtnUlt.addEventListener("click", () => playMove("ultimate"));
	elBtnGuard.addEventListener("click", () => combatEngine && combatEngine.executeHeroAction("guard"));
	elBtnFocus.addEventListener("click", () => combatEngine && combatEngine.executeHeroAction("focus"));
	elBtnFinisher.addEventListener("click", () => combatEngine && combatEngine.executeHeroAction("finisher"));

	function toggleAuto() {
		if (!combatEngine) return;
		combatEngine.setAuto(!combatEngine.auto);
		elBtnAuto.textContent = `🤖 AUTO: ${combatEngine.auto ? "ON" : "OFF"}`;
		elBtnAuto.classList.toggle("on", combatEngine.auto);
		renderCombatScene();
	}

	function toggleFast() {
		if (!combatEngine) return;
		combatEngine.fast = !combatEngine.fast;
		elBtnFast.textContent = `⏩ FAST: ${combatEngine.fast ? "ON" : "OFF"}`;
		elBtnFast.classList.toggle("on", combatEngine.fast);
	}

	const elBtnTiming = $("btn-timing");
	const elBtnBlock = $("btn-block");
	function paintPrefs() {
		elBtnTiming.textContent = `🎯 TIMING: ${prefs.timing ? "ON" : "OFF"}`;
		elBtnTiming.classList.toggle("on", prefs.timing);
		elBtnBlock.textContent = `🛡 BLOCK: ${prefs.block ? "ON" : "OFF"}`;
		elBtnBlock.classList.toggle("on", prefs.block);
	}
	elBtnTiming.addEventListener("click", () => {
		prefs.timing = !prefs.timing;
		savePrefs();
		paintPrefs();
	});
	elBtnBlock.addEventListener("click", () => {
		prefs.block = !prefs.block;
		savePrefs();
		paintPrefs();
		if (combatEngine) combatEngine.blockOn = prefs.block;
	});
	paintPrefs();
	elBtnAuto.addEventListener("click", toggleAuto);
	elBtnFast.addEventListener("click", toggleFast);

	elBtnRetreat.addEventListener("click", () => {
		if (!combatEngine || combatEngine.isGameOver) return;
		if (!retreatArmed) {
			retreatArmed = true;
			elBtnRetreat.textContent = "SURE? TAP AGAIN";
			setTimeout(() => {
				retreatArmed = false;
				elBtnRetreat.textContent = "🏳 RETREAT";
			}, 3000);
			return;
		}
		retreatArmed = false;
		elBtnRetreat.textContent = "🏳 RETREAT";
		const banked = combatEngine.retreat();
		if (banked && combatEngine.currentIssue.endless) {
			ComicToast(
				`Gauntlet banked: ${combatEngine.wavesCleared} waves → +${banked.coins} 🪙 +${banked.ink} 🧪`,
				"good",
			);
		} else {
			ComicToast("You retreated. No rewards earned.", "warn");
		}
		combatEngine = null;
		updateHUD();
		switchView(lastBattleOpts.mutator ? "arcade" : "campaign");
	});

	document.addEventListener("keydown", (e) => {
		if (currentView !== "battle" || !combatEngine || e.metaKey || e.ctrlKey || e.altKey) return;
		if (document.querySelector(".modal-overlay.open")) return;
		const key = e.key.toLowerCase();
		if (e.code === "Space" || e.key === "Enter" || key === "b" || key === "t") {
			if (timing || blockActive) {
				e.preventDefault();
				if (timing) resolveTiming(performance.now());
				else pressBlock();
				return;
			}
		}
		if (e.key === "Escape" && timing) {
			clearTimeout(timing.timeout);
			timing = null;
			elTimingLayer.innerHTML = "";
			elStrip.classList.remove("timing-on");
			return;
		}
		if (timing || elStrip.classList.contains("timing-on")) return;
		const map = { 1: elBtnBasic, 2: elBtnSkill, 3: elBtnUlt, 4: elBtnGuard, 5: elBtnFocus, 6: elBtnFinisher };
		if (map[key]) {
			if (!map[key].disabled) map[key].click();
		} else if (key === "a") toggleAuto();
		else if (key === "f") toggleFast();
	});

	// ── FX: ONOMATOPOEIA, SPLASH, END MODALS ────────────────────────────────
	function showFloatingOnomatopoeia(text, isCrit = false, isWeakness = false) {
		const bubble = document.createElement("div");
		bubble.className = `onomatopoeia-bubble ${isCrit ? "crit" : ""} ${isWeakness ? "weakness" : ""}`;
		bubble.textContent = text;
		bubble.style.left = `${30 + Math.random() * 40}%`;
		bubble.style.top = `${30 + Math.random() * 30}%`;
		bubble.style.setProperty("--rot", `${(Math.random() - 0.5) * 35}deg`);
		elArena.appendChild(bubble);
		setTimeout(() => bubble.remove(), 750);
	}

	function showUltimateSplash(hero, quote) {
		const splash = $("ultimate-splash");
		splash.querySelector(".ult-quote").textContent = `"${quote}"`;
		splash.querySelector(".ult-name").textContent = hero.ultimate.name;
		splash.querySelector(".ult-art").innerHTML = hero.artSvg;
		splash.style.setProperty("--splash-bg", hero.colors.bg);
		elArena.classList.add("ult-zoom");
		setTimeout(() => elArena.classList.remove("ult-zoom"), 1300 * (combatEngine?.pace || 1));
		splash.style.setProperty("--splash-accent", hero.colors.accent);
		splash.classList.remove("visible");
		void splash.offsetWidth;
		splash.classList.add("visible");
		setTimeout(() => splash.classList.remove("visible"), 1200 * (combatEngine?.pace || 1));
	}

	const elEndModal = $("battle-end-modal");

	function fillEndModal({ title, stars, msg, details, reward, primaryLabel, primary, retryLabel, retry }) {
		elEndModal.querySelector(".end-title").textContent = title;
		elEndModal.querySelector(".end-title").classList.toggle("defeat", title !== "VICTORY!");
		elEndModal.querySelector(".end-stars").textContent = stars || "";
		elEndModal.querySelector(".end-msg").textContent = msg;
		elEndModal.querySelector(".end-details").innerHTML = details || "";
		elEndModal.querySelector(".end-reward").textContent = reward;
		const bClose = elEndModal.querySelector(".btn-close-end");
		const bRetry = elEndModal.querySelector(".btn-retry-end");
		bClose.textContent = primaryLabel;
		bRetry.textContent = retryLabel;
		bRetry.hidden = !retry;
		bClose.onclick = () => {
			elEndModal.classList.remove("open");
			primary();
		};
		bRetry.onclick = () => {
			elEndModal.classList.remove("open");
			if (retry) retry();
		};
		elEndModal.classList.add("open");
	}

	function showVictoryModal(d) {
		const idx = ISSUES_CAMPAIGN.findIndex((i) => i.id === d.issue.id);
		const next = ISSUES_CAMPAIGN[idx + 1];
		const lines = [
			`<li class="${d.stars >= 1 ? "ok" : ""}">★ Clear the issue</li>`,
			`<li class="${d.noDeaths ? "ok" : ""}">★ No hero knocked out</li>`,
			`<li class="${d.withinPar ? "ok" : ""}">★ Finish within ${d.issue.par} turns (took ${d.turns})</li>`,
		].join("");
		const lvl = d.levelUps.length
			? `<div class="lvl-ups">${d.levelUps.map((l) => `⬆ ${l.name} +${l.levels} LVL`).join(" · ")}</div>`
			: "";
		fillEndModal({
			title: "VICTORY!",
			stars: "★".repeat(d.stars) + "☆".repeat(3 - d.stars),
			msg: `You smashed through ${d.issue.title}!${d.firstClear ? "" : " (replay: reduced loot)"}`,
			details: `<ul class="star-goals">${lines}</ul>${lvl}`,
			reward: `+${d.coins} Coins  +${d.ink} Ink  +${d.xp} XP each`,
			primaryLabel: "RETURN TO ISSUES",
			primary: () => switchView("campaign"),
			retryLabel: next ? "NEXT ISSUE ▶" : "REPLAY",
			retry: () => startCombat(next ? next.id : d.issue.id),
		});
	}

	function showDefeatModal(d) {
		const endless = d.issue.endless;
		fillEndModal({
			title: "DEFEATED!",
			stars: "",
			msg: endless
				? `The Gauntlet ended after ${d.wavesCleared} wave${d.wavesCleared === 1 ? "" : "s"}${d.newBest ? " — NEW BEST!" : ""}`
				: "The villains overpowered your squad!",
			details: endless
				? ""
				: '<div class="lvl-ups">Tip: level up heroes, use affinity advantages, and focus fire on bosses.</div>',
			reward: endless ? `+${d.coins} Coins  +${d.ink} Ink` : "Level up your heroes and try again!",
			primaryLabel: lastBattleOpts.mutator ? "BACK TO ARCADE" : "RETURN TO ISSUES",
			primary: () => switchView(lastBattleOpts.mutator ? "arcade" : "campaign"),
			retryLabel: "TRY AGAIN",
			retry: () => startCombat(d.issue.id, lastBattleOpts),
		});
	}

	// Initial render
	updateHUD();
	renderSummonInfo();
	switchView("summon");
});
