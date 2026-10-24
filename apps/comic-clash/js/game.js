"use strict";

/**
 * ComicClash Master Game State & UI Controller
 */
const STORAGE_KEY = "comic_clash:v1";

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

		this.load();
		this.ensureStarterSquad();
	}

	load() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const data = JSON.parse(saved);
				Object.assign(this, data);
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
				}),
			);
		} catch (e) {
			console.warn("Could not save to localStorage:", e);
		}
	}

	ensureStarterSquad() {
		// If inventory is empty, grant starter team
		if (Object.keys(this.inventory).length === 0) {
			["neon_valkyrie", "street_brawler", "rookie_cadet"].forEach((id) => {
				this.inventory[id] = { id, level: 1, rank: 1, shards: 0, xp: 0 };
			});
			this.save();
		}

		// Ensure valid team
		this.team = this.team.filter((id) => this.inventory[id]);
		if (this.team.length < 3) {
			const owned = Object.keys(this.inventory);
			for (let i = 0; i < owned.length && this.team.length < 3; i++) {
				if (!this.team.includes(owned[i])) this.team.push(owned[i]);
			}
		}
	}

	claimDaily() {
		const today = new Date().toDateString();
		if (this.lastDailyDate === today) return false;
		this.coins += 400;
		this.ink += 50;
		this.lastDailyDate = today;
		this.save();
		return true;
	}

	levelUpHero(heroId) {
		const inv = this.inventory[heroId];
		if (!inv) return false;
		const costCoins = inv.level * 60;
		const costInk = inv.level * 10;
		if (this.coins < costCoins || this.ink < costInk) return false;

		this.coins -= costCoins;
		this.ink -= costInk;
		inv.level++;
		this.save();
		return true;
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
		// Swap if already in another slot
		const existingIdx = this.team.indexOf(heroId);
		if (existingIdx !== -1) {
			this.team[existingIdx] = this.team[slotIdx];
		}
		this.team[slotIdx] = heroId;
		this.save();
	}
}

// Global App Initialization
document.addEventListener("DOMContentLoaded", () => {
	const gameState = new ComicGameState();
	const gachaEngine = new ComicGachaEngine(gameState);
	let combatEngine = null;

	// View Elements
	const views = {
		summon: document.getElementById("view-summon"),
		campaign: document.getElementById("view-campaign"),
		battle: document.getElementById("view-battle"),
		roster: document.getElementById("view-roster"),
		rewards: document.getElementById("view-rewards"),
	};

	const navBtns = document.querySelectorAll(".nav-tab");
	const elCoins = document.getElementById("hud-coins");
	const elInk = document.getElementById("hud-ink");
	const elPity5 = document.getElementById("hud-pity");
	const elMuteBtn = document.getElementById("btn-mute");

	function updateHUD() {
		if (elCoins) elCoins.textContent = gameState.coins.toLocaleString();
		if (elInk) elInk.textContent = gameState.ink.toLocaleString();
		if (elPity5) elPity5.textContent = `${40 - gameState.pity5Star}`;
	}

	function switchView(viewName) {
		ComicAudio.playPageFlip();
		Object.keys(views).forEach((name) => {
			if (views[name])
				views[name].classList.toggle("active", name === viewName);
		});
		navBtns.forEach((btn) => {
			btn.classList.toggle("active", btn.dataset.view === viewName);
		});

		updateHUD();

		if (viewName === "roster") renderRoster();
		else if (viewName === "campaign") renderCampaign();
		else if (viewName === "rewards") renderRewards();
	}

	navBtns.forEach((btn) => {
		btn.addEventListener("click", () => switchView(btn.dataset.view));
	});

	if (elMuteBtn) {
		elMuteBtn.addEventListener("click", () => {
			const muted = ComicAudio.toggleMute();
			elMuteBtn.textContent = muted ? "🔇 MUTED" : "🔊 SFX ON";
			elMuteBtn.classList.toggle("muted", muted);
		});
	}

	// ── GACHA PACK INTERACTION ──────────────────────────────────────────────
	const elPack = document.getElementById("booster-pack");
	const elTearStrip = document.getElementById("tear-strip");
	const elSummonModal = document.getElementById("summon-modal");
	const elCardsContainer = document.getElementById("revealed-cards");
	const elBtnPull1 = document.getElementById("btn-pull-1");
	const elBtnPull10 = document.getElementById("btn-pull-10");
	const elCloseSummon = document.getElementById("btn-close-summon");

	function triggerSummon(count) {
		const results = gachaEngine.executeSummon(count);
		if (!results) return;

		updateHUD();

		// Animate tear strip on booster pack
		if (elPack) {
			elPack.classList.add("ripping");
			ComicAudio.playRip();
		}

		setTimeout(() => {
			if (elPack) elPack.classList.remove("ripping");
			displaySummonModal(results);
		}, 600);
	}

	if (elBtnPull1) elBtnPull1.addEventListener("click", () => triggerSummon(1));
	if (elBtnPull10)
		elBtnPull10.addEventListener("click", () => triggerSummon(10));
	if (elTearStrip) {
		elTearStrip.addEventListener("click", () => triggerSummon(1));
	}

	function displaySummonModal(results) {
		if (!elSummonModal || !elCardsContainer) return;
		elCardsContainer.innerHTML = "";
		elSummonModal.classList.add("open");

		// Check if 5-star pulled for special dramatic banner
		const has5Star = results.some((r) => r.rarity === 5);
		const banner = document.getElementById("mythic-banner");
		if (banner) banner.classList.toggle("active", has5Star);

		results.forEach((res, idx) => {
			const card = createHeroCard(
				res.template,
				gameState.inventory[res.template.id],
				true,
				res.isNew,
				res.shardsAwarded,
			);
			card.style.animationDelay = `${idx * 0.12}s`;
			elCardsContainer.appendChild(card);

			// Play reveal fanfare
			setTimeout(
				() => {
					ComicAudio.playReveal(res.rarity);
				},
				idx * 120 + 100,
			);
		});
	}

	if (elCloseSummon) {
		elCloseSummon.addEventListener("click", () => {
			elSummonModal.classList.remove("open");
			updateHUD();
		});
	}

	// ── HERO CARD DOM GENERATOR ─────────────────────────────────────────────
	function createHeroCard(
		heroData,
		invData,
		isGachaReveal = false,
		isNew = false,
		shards = 0,
	) {
		const card = document.createElement("div");
		const rarityCfg = RARITY_CONFIG[heroData.rarity];
		card.className = `comic-card rarity-${heroData.rarity}`;
		card.style.setProperty("--card-border", heroData.colors.accent);
		card.style.setProperty("--card-bg", heroData.colors.bg);

		const rankStars = invData ? "★".repeat(invData.rank) : "★".repeat(1);
		const affinityInfo = HERO_AFFINITIES[heroData.affinity];

		card.innerHTML = `
			<div class="card-inner">
				<div class="card-header">
					<span class="card-rarity">${rarityCfg.label}</span>
					<span class="card-affinity" style="color: ${affinityInfo.color}">${affinityInfo.icon} ${affinityInfo.name}</span>
				</div>
				<div class="card-art-box">
					${heroData.artSvg}
					${isGachaReveal && isNew ? '<div class="new-stamp">NEW!</div>' : ""}
					${isGachaReveal && !isNew ? `<div class="shard-stamp">+${shards} SHARDS</div>` : ""}
				</div>
				<div class="card-info">
					<div class="hero-name">${heroData.name}</div>
					<div class="hero-alias">${heroData.alias}</div>
					<div class="hero-rank">${rankStars}</div>
					${invData ? `<div class="hero-level">LVL ${invData.level}</div>` : ""}
				</div>
				<div class="card-stats">
					<span>HP ${heroData.baseHp}</span>
					<span>ATK ${heroData.baseAtk}</span>
					<span>DEF ${heroData.baseDef}</span>
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

		return card;
	}

	// ── CAMPAIGN ISSUES RENDERER ────────────────────────────────────────────
	function renderCampaign() {
		const container = document.getElementById("issues-list");
		if (!container) return;
		container.innerHTML = "";

		ISSUES_CAMPAIGN.forEach((issue) => {
			const isDone = !!gameState.completedIssues[issue.id];
			const issueCard = document.createElement("div");
			issueCard.className = `issue-cover-card ${isDone ? "completed" : ""}`;
			issueCard.innerHTML = `
				<div class="issue-badge">${issue.issueNo}</div>
				<div class="issue-cover-art">
					<div class="comic-burst">READ!</div>
					<div class="boss-preview">${issue.bossName}</div>
				</div>
				<div class="issue-details">
					<h3>${issue.title}</h3>
					<p>${issue.coverDesc}</p>
					<div class="issue-rewards">
						<span>🪙 +${issue.rewardCoins}</span>
						<span>🧪 +${issue.rewardInk}</span>
					</div>
					<button class="btn-read-issue comic-btn" data-issue="${issue.id}">
						${isDone ? "REPLAY ISSUE" : "FIGHT ISSUE"}
					</button>
				</div>
			`;

			const fightBtn = issueCard.querySelector(".btn-read-issue");
			fightBtn.addEventListener("click", () => {
				startCombat(issue.id);
			});

			container.appendChild(issueCard);
		});
	}

	// ── ROSTER & TEAM BUILDER ───────────────────────────────────────────────
	function renderRoster() {
		const rosterGrid = document.getElementById("roster-grid");
		const teamSlots = document.getElementById("active-team-slots");
		if (!rosterGrid || !teamSlots) return;

		// 1. Render active team of 3
		teamSlots.innerHTML = "";
		gameState.team.forEach((heroId, slotIdx) => {
			const heroData = HEROES_MAP.get(heroId);
			const inv = gameState.inventory[heroId];
			const slot = document.createElement("div");
			slot.className = "team-slot-card";
			if (heroData && inv) {
				slot.appendChild(createHeroCard(heroData, inv));
				const btnRemove = document.createElement("div");
				btnRemove.className = "slot-label";
				btnRemove.textContent = `SLOT ${slotIdx + 1}: SQUAD HERO`;
				slot.appendChild(btnRemove);
			} else {
				slot.innerHTML = `<div class="empty-slot">EMPTY SQUAD SLOT ${slotIdx + 1}</div>`;
			}
			teamSlots.appendChild(slot);
		});

		// 2. Render all collected heroes
		rosterGrid.innerHTML = "";
		const ownedIds = Object.keys(gameState.inventory);

		ownedIds.forEach((heroId) => {
			const heroData = HEROES_MAP.get(heroId);
			const inv = gameState.inventory[heroId];
			if (!heroData || !inv) return;

			const wrapper = document.createElement("div");
			wrapper.className = "roster-item";
			const card = createHeroCard(heroData, inv);
			wrapper.appendChild(card);

			// Upgrade & Team Controls
			const actions = document.createElement("div");
			actions.className = "roster-actions";
			const levelCostCoins = inv.level * 60;
			const levelCostInk = inv.level * 10;
			const neededShards = inv.rank * (heroData.rarity * 5);
			const canRank = inv.shards >= neededShards && inv.rank < 5;

			const inTeam = gameState.team.includes(heroId);

			actions.innerHTML = `
				<button class="comic-btn btn-lvl" data-id="${heroId}">
					LVL UP (${levelCostCoins}🪙 / ${levelCostInk}🧪)
				</button>
				<button class="comic-btn btn-rank ${canRank ? "glow" : ""}" data-id="${heroId}" ${canRank ? "" : "disabled"}>
					RANK UP (${inv.shards}/${neededShards} ✦)
				</button>
				<button class="comic-btn btn-assign" data-id="${heroId}">
					${inTeam ? "★ IN SQUAD" : "ASSIGN TO SQUAD"}
				</button>
			`;

			actions.querySelector(".btn-lvl").addEventListener("click", () => {
				if (gameState.levelUpHero(heroId)) {
					ComicAudio.playCoin();
					renderRoster();
					updateHUD();
				} else {
					alert("Need more Coins or Ink to level up!");
				}
			});

			actions.querySelector(".btn-rank").addEventListener("click", () => {
				if (gameState.rankUpHero(heroId)) {
					ComicAudio.playReveal(heroData.rarity);
					renderRoster();
				}
			});

			actions.querySelector(".btn-assign").addEventListener("click", () => {
				if (inTeam) return;
				// Put in slot 0 or next slot
				gameState.setTeamSlot(0, heroId);
				ComicAudio.playPunch(false);
				renderRoster();
			});

			wrapper.appendChild(actions);
			rosterGrid.appendChild(wrapper);
		});
	}

	// ── REWARDS & FREE COIN FAUCET ──────────────────────────────────────────
	function renderRewards() {
		const btnDaily = document.getElementById("btn-claim-daily");
		const dailyStatus = document.getElementById("daily-status");
		const today = new Date().toDateString();

		if (btnDaily && dailyStatus) {
			const alreadyClaimed = gameState.lastDailyDate === today;
			btnDaily.disabled = alreadyClaimed;
			btnDaily.textContent = alreadyClaimed
				? "CLAIMED TODAY"
				: "CLAIM 400 COINS & 50 INK";
			dailyStatus.textContent = alreadyClaimed
				? "Come back tomorrow for your next comic shipment!"
				: "Your daily comic reader supply is ready!";

			btnDaily.onclick = () => {
				if (gameState.claimDaily()) {
					ComicAudio.playReveal(4);
					updateHUD();
					renderRewards();
				}
			};
		}
	}

	// ── COMBAT ARENA CONTROLLER ─────────────────────────────────────────────
	const elCombatHeroes = document.getElementById("combat-heroes");
	const elCombatVillains = document.getElementById("combat-villains");
	const elCombatLog = document.getElementById("combat-log-text");
	const elBtnBasic = document.getElementById("act-basic");
	const elBtnSkill = document.getElementById("act-skill");
	const elBtnUlt = document.getElementById("act-ult");
	const elBattleBanner = document.getElementById("battle-event-banner");

	function startCombat(issueId) {
		switchView("battle");
		combatEngine = new ComicCombatEngine(gameState, handleCombatEvent);
		combatEngine.startBattle(issueId);
		renderCombatScene();
	}

	function handleCombatEvent(type, data) {
		if (type === "action_hit") {
			showFloatingOnomatopoeia(data.onom, data.isCrit, data.weakness);
			renderCombatScene();
		} else if (type === "ultimate_cutin") {
			showUltimateSplash(data.hero.name, data.quote);
		} else if (type === "turn_change") {
			renderCombatScene();
		} else if (type === "battle_victory") {
			renderCombatScene();
			showBattleEndModal(
				"VICTORY!",
				`You smashed through ${data.issue.title}!`,
				`+${data.coins} Coins  +${data.ink} Ink  +${data.xp} XP`,
			);
		} else if (type === "battle_defeat") {
			renderCombatScene();
			showBattleEndModal(
				"DEFEATED!",
				"The villains overpowered your squad!",
				"Level up your heroes and try again!",
			);
		} else if (type === "log_update") {
			if (elCombatLog) elCombatLog.textContent = data.message;
		}
	}

	function renderCombatScene() {
		if (!combatEngine) return;

		// Render Heroes
		if (elCombatHeroes) {
			elCombatHeroes.innerHTML = "";
			combatEngine.heroes.forEach((h, idx) => {
				const active =
					combatEngine.isPlayerTurn && combatEngine.activeHeroIndex === idx;
				const box = document.createElement("div");
				box.className = `fighter-panel hero-panel ${active ? "active-turn" : ""} ${h.hp <= 0 ? "fainted" : ""}`;
				const hpPct = Math.max(
					0,
					Math.min(100, Math.round((h.hp / h.maxHp) * 100)),
				);
				const nrgPct = Math.max(0, Math.min(100, h.energy));

				box.innerHTML = `
					<div class="fighter-header">
						<span class="fighter-name">${h.name}</span>
						<span class="fighter-hp-num">${h.hp}/${h.maxHp} HP</span>
					</div>
					<div class="meter-bar hp"><div class="fill" style="width: ${hpPct}%"></div></div>
					<div class="meter-bar nrg"><div class="fill" style="width: ${nrgPct}%"></div></div>
					${h.shield > 0 ? `<div class="shield-badge">SHIELD: ${h.shield}</div>` : ""}
				`;
				elCombatHeroes.appendChild(box);
			});
		}

		// Render Villains
		if (elCombatVillains) {
			elCombatVillains.innerHTML = "";
			combatEngine.villains.forEach((v, idx) => {
				const box = document.createElement("div");
				box.className = `fighter-panel villain-panel ${v.hp <= 0 ? "fainted" : ""}`;
				const hpPct = Math.max(
					0,
					Math.min(100, Math.round((v.hp / v.maxHp) * 100)),
				);

				box.innerHTML = `
					<div class="fighter-header">
						<span class="fighter-name">${v.icon} ${v.name}</span>
						<span class="fighter-hp-num">${v.hp}/${v.maxHp}</span>
					</div>
					<div class="meter-bar hp villain-hp"><div class="fill" style="width: ${hpPct}%"></div></div>
				`;
				box.addEventListener("click", () => {
					if (combatEngine.isPlayerTurn && v.hp > 0) {
						// Highlight selected target
						document
							.querySelectorAll(".villain-panel")
							.forEach((el) => el.classList.remove("selected-target"));
						box.classList.add("selected-target");
					}
				});
				elCombatVillains.appendChild(box);
			});
		}

		// Update Action Button states for active hero
		const activeHero = combatEngine.getActiveHero();
		if (activeHero && combatEngine.isPlayerTurn && !combatEngine.isGameOver) {
			if (elBtnBasic) {
				elBtnBasic.disabled = false;
				elBtnBasic.textContent = `${activeHero.basic.name} (+30 NRG)`;
			}
			if (elBtnSkill) {
				elBtnSkill.disabled = activeHero.skillCd > 0;
				elBtnSkill.textContent =
					activeHero.skillCd > 0
						? `CD (${activeHero.skillCd} turns)`
						: `${activeHero.skill.name}`;
			}
			if (elBtnUlt) {
				elBtnUlt.disabled = activeHero.energy < 100;
				elBtnUlt.textContent =
					activeHero.energy >= 100
						? `★ ${activeHero.ultimate.name} (READY!)`
						: `ULTIMATE (${activeHero.energy}%)`;
				elBtnUlt.classList.toggle("pulse-ult", activeHero.energy >= 100);
			}
		} else {
			if (elBtnBasic) elBtnBasic.disabled = true;
			if (elBtnSkill) elBtnSkill.disabled = true;
			if (elBtnUlt) elBtnUlt.disabled = true;
		}
	}

	if (elBtnBasic)
		elBtnBasic.addEventListener(
			"click",
			() => combatEngine && combatEngine.executeHeroAction("basic"),
		);
	if (elBtnSkill)
		elBtnSkill.addEventListener(
			"click",
			() => combatEngine && combatEngine.executeHeroAction("skill"),
		);
	if (elBtnUlt)
		elBtnUlt.addEventListener(
			"click",
			() => combatEngine && combatEngine.executeHeroAction("ultimate"),
		);

	// ── ONOMATOPOEIA POPUP FX ───────────────────────────────────────────────
	function showFloatingOnomatopoeia(text, isCrit = false, isWeakness = false) {
		const arena = document.getElementById("comic-arena");
		if (!arena) return;

		const bubble = document.createElement("div");
		bubble.className = `onomatopoeia-bubble ${isCrit ? "crit" : ""} ${isWeakness ? "weakness" : ""}`;
		bubble.textContent = text;

		const x = 30 + Math.random() * 40;
		const y = 30 + Math.random() * 30;
		const rot = (Math.random() - 0.5) * 35;

		bubble.style.left = `${x}%`;
		bubble.style.top = `${y}%`;
		bubble.style.transform = `rotate(${rot}deg) scale(0.5)`;

		arena.appendChild(bubble);
		setTimeout(() => bubble.remove(), 750);
	}

	function showUltimateSplash(heroName, quote) {
		const splash = document.getElementById("ultimate-splash");
		if (!splash) return;
		const quoteBox = splash.querySelector(".ult-quote");
		const nameBox = splash.querySelector(".ult-name");
		if (quoteBox) quoteBox.textContent = `"${quote}"`;
		if (nameBox) nameBox.textContent = heroName;

		splash.classList.add("visible");
		setTimeout(() => splash.classList.remove("visible"), 1400);
	}

	function showBattleEndModal(title, msg, reward) {
		const modal = document.getElementById("battle-end-modal");
		if (!modal) return;
		modal.querySelector(".end-title").textContent = title;
		modal.querySelector(".end-msg").textContent = msg;
		modal.querySelector(".end-reward").textContent = reward;
		modal.classList.add("open");

		modal.querySelector(".btn-close-end").onclick = () => {
			modal.classList.remove("open");
			switchView("campaign");
		};
	}

	// Initial render
	updateHUD();
	switchView("summon");
});
