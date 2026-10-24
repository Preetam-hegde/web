"use strict";

/**
 * ComicClash Arcade
 * Four side games: Panel Match (memory), Power Punch (timing), Who's That Hero? (silhouette quiz)
 * and the daily Mutator Gauntlet (a battle mode with a rule twist). Rewards are capped per day.
 */
const ARCADE_DAILY_CAP = 3;

function shuffled(list) {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function getDailyMutator() {
	let seed = 0;
	for (const ch of new Date().toDateString()) seed = (seed * 33 + ch.charCodeAt(0)) >>> 0;
	return MUTATORS[seed % MUTATORS.length];
}

class ComicArcade {
	constructor(gameState, hooks) {
		this.gs = gameState;
		this.hooks = hooks;
		this.grid = document.getElementById("arcade-grid");
		this.modal = document.getElementById("arcade-modal");
		this.stage = document.getElementById("arcade-stage");
		this.timers = [];
		this.raf = null;
		this.keyHandler = null;

		document.getElementById("btn-close-arcade").addEventListener("click", () => this.close());
		this.games = [
			{
				id: "match",
				icon: 12,
				title: "PANEL MATCH",
				blurb: "Flip the comic panels and pair up the heroes. Fewer moves = bigger loot.",
				start: () => this.startMatch(),
			},
			{
				id: "punch",
				icon: 721,
				title: "POWER PUNCH",
				blurb: "Stop the needle in the sweet spot to land a perfect hit. Five rounds, getting faster.",
				start: () => this.startPunch(),
			},
			{
				id: "quiz",
				icon: 668,
				title: "WHO'S THAT HERO?",
				blurb: "Name the silhouette before time runs out. Hints appear as the clock ticks.",
				start: () => this.startQuiz(),
			},
		];
	}

	// ── Tiles ───────────────────────────────────────────────────────────────
	render() {
		this.gs.ensureArcade();
		const mut = getDailyMutator();
		this.grid.innerHTML = "";

		this.games.forEach((g) => {
			const left = this.gs.arcadePlaysLeft(g.id);
			const best = this.gs.arcade.best[g.id];
			const tile = document.createElement("div");
			tile.className = "arcade-tile";
			tile.innerHTML = `
				<div class="at-icon">${iconHTML(g.icon)}</div>
				<h3>${g.title}</h3>
				<p>${g.blurb}</p>
				<div class="at-meta"><span>REWARDED PLAYS LEFT <b>${left}/${ARCADE_DAILY_CAP}</b></span><span>BEST <b>${best ?? "—"}</b></span></div>
				<button type="button" class="comic-btn">${left > 0 ? "PLAY" : "PRACTICE"}</button>
			`;
			tile.querySelector("button").addEventListener("click", () => this.open(g));
			this.grid.appendChild(tile);
		});

		const mt = document.createElement("div");
		mt.className = "arcade-tile mutator";
		mt.innerHTML = `
			<div class="at-icon">${iconHTML(mut.icon)}</div>
			<h3>MUTATOR GAUNTLET</h3>
			<p><b>TODAY: ${mut.name}</b><br />${mut.desc}</p>
			<div class="at-meta"><span>PAYOUT <b>x${mut.mods.payout}</b></span><span>BEST WAVE <b>${this.gs.mutatorBest || 0}</b></span></div>
			<button type="button" class="comic-btn btn-10x">ENTER GAUNTLET</button>
		`;
		mt.querySelector("button").addEventListener("click", () => this.hooks.startMutatorBattle(mut));
		this.grid.appendChild(mt);
	}

	// ── Modal plumbing ──────────────────────────────────────────────────────
	open(game) {
		this.cleanup();
		this.modal.classList.add("open");
		this.currentGame = game;
		game.start();
	}

	close() {
		this.cleanup();
		this.modal.classList.remove("open");
		this.stage.innerHTML = "";
		this.render();
		this.hooks.updateHUD();
	}

	cleanup() {
		this.timers.forEach((t) => {
			clearTimeout(t);
			clearInterval(t);
		});
		this.timers = [];
		if (this.raf) cancelAnimationFrame(this.raf);
		this.raf = null;
		if (this.keyHandler) document.removeEventListener("keydown", this.keyHandler);
		this.keyHandler = null;
	}

	later(fn, ms) {
		const t = setTimeout(fn, ms);
		this.timers.push(t);
		return t;
	}

	/** Pays out (if daily plays remain) and shows the result screen. */
	finish(game, { score, headline, lines, coins, ink }) {
		const rewarded = this.gs.arcadePlaysLeft(game.id) > 0;
		if (rewarded) {
			this.gs.coins += coins;
			this.gs.ink += ink;
			this.gs.track("arcade");
		}
		this.gs.recordArcadePlay(game.id, score, rewarded);
		this.hooks.updateHUD();
		if (rewarded) ComicAudio.playReveal(4);

		this.stage.innerHTML = `
			<div class="arcade-result">
				<h2>${headline}</h2>
				<ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
				<div class="ar-reward ${rewarded ? "" : "off"}">
					${
						rewarded
							? `+${coins} ${iconHTML(ICON.coin)}  +${ink} ${iconHTML(ICON.ink)}`
							: "Practice run: today's rewarded plays are used up."
					}
				</div>
				<div class="modal-actions">
					<button type="button" class="comic-btn" id="ar-again">PLAY AGAIN</button>
					<button type="button" class="comic-btn btn-10x" id="ar-close">BACK TO ARCADE</button>
				</div>
			</div>`;
		this.stage.querySelector("#ar-again").onclick = () => this.open(game);
		this.stage.querySelector("#ar-close").onclick = () => this.close();
	}

	// ── Game 1: Panel Match ─────────────────────────────────────────────────
	startMatch() {
		const game = this.currentGame;
		const heroes = shuffled(HEROES_DATA).slice(0, 8);
		const deck = shuffled([...heroes, ...heroes]);
		let first = null;
		let lock = false;
		let moves = 0;
		let matched = 0;

		this.stage.innerHTML = `
			<h2 class="arcade-title">PANEL MATCH</h2>
			<div class="arcade-hud"><span>MOVES <b id="pm-moves">0</b></span><span>PAIRS <b id="pm-pairs">0/8</b></span></div>
			<div class="pm-grid">
				${deck
					.map(
						(h, i) => `<button type="button" class="pm-card" data-i="${i}">
							<span class="pm-face" style="--pm-bg:${h.colors.bg};--pm-ac:${h.colors.accent}">${h.artSvg}<em>${h.name}</em></span>
							<span class="pm-back">?</span>
						</button>`,
					)
					.join("")}
			</div>
			<p class="arcade-tip">Perfect = 8 moves.</p>`;

		const cards = [...this.stage.querySelectorAll(".pm-card")];
		const setHud = () => {
			this.stage.querySelector("#pm-moves").textContent = moves;
			this.stage.querySelector("#pm-pairs").textContent = `${matched}/8`;
		};

		cards.forEach((el, i) =>
			el.addEventListener("click", () => {
				if (lock || el.classList.contains("up") || el.classList.contains("done")) return;
				ComicAudio.playPageFlip();
				el.classList.add("up");
				if (first === null) {
					first = i;
					return;
				}
				moves++;
				const a = first;
				first = null;
				if (deck[a].id === deck[i].id) {
					matched++;
					cards[a].classList.add("done");
					el.classList.add("done");
					ComicAudio.playCoin();
					setHud();
					if (matched === 8) {
						this.later(() => {
							const coins = Math.max(60, Math.min(220, 260 - moves * 10));
							const ink = moves <= 11 ? 25 : moves <= 14 ? 12 : 5;
							this.finish(game, {
								score: Math.max(0, 100 - moves * 5),
								headline: moves <= 10 ? "PHOTOGRAPHIC MEMORY!" : "ALL PANELS MATCHED!",
								lines: [`Finished in <b>${moves}</b> moves`, `Perfect run is 8 moves`],
								coins,
								ink,
							});
						}, 600);
					}
				} else {
					lock = true;
					setHud();
					this.later(() => {
						cards[a].classList.remove("up");
						el.classList.remove("up");
						lock = false;
					}, 750);
				}
			}),
		);
	}

	// ── Game 2: Power Punch ─────────────────────────────────────────────────
	startPunch() {
		const game = this.currentGame;
		let round = 0;
		let score = 0;
		let center = 0.5;
		let greenW = 0.26;
		let goldW = 0.09;
		let pos = 0;
		let running = false;
		let t0 = 0;
		const results = [];

		this.stage.innerHTML = `
			<h2 class="arcade-title">POWER PUNCH</h2>
			<div class="arcade-hud"><span>ROUND <b id="pp-round">1/5</b></span><span>SCORE <b id="pp-score">0</b></span></div>
			<div class="pp-ring">
				<div class="pp-fighter hero"><div class="sprite" id="pp-hero"></div></div>
				<div class="pp-float" id="pp-float"></div>
				<div class="pp-fighter foe"><div class="sprite" id="pp-foe"></div></div>
			</div>
			<div class="pp-bar" id="pp-bar"><div class="pp-green" id="pp-green"><div class="pp-gold" id="pp-gold"></div></div><div class="pp-needle" id="pp-needle"></div></div>
			<button type="button" class="comic-btn btn-10x pp-hit" id="pp-hit">PUNCH! (SPACE)</button>
			<p class="arcade-tip">Gold = 3 pts · Green = 2 · Near = 1</p>`;

		const heroSpr = { color: "blue", cls: "warrior", scale: 1.15 };
		const foeSpr = { color: "red", cls: "warrior", scale: 1.15 };
		const elHero = this.stage.querySelector("#pp-hero");
		const elFoe = this.stage.querySelector("#pp-foe");
		setSpriteMode(elHero, heroSpr, "idle");
		setSpriteMode(elFoe, foeSpr, "idle");
		const green = this.stage.querySelector("#pp-green");
		const gold = this.stage.querySelector("#pp-gold");
		const needle = this.stage.querySelector("#pp-needle");
		const floatEl = this.stage.querySelector("#pp-float");
		const hitBtn = this.stage.querySelector("#pp-hit");

		const setupRound = () => {
			greenW = Math.max(0.12, 0.28 - round * 0.035);
			goldW = greenW * 0.38;
			center = 0.22 + Math.random() * 0.56;
			green.style.left = `${(center - greenW / 2) * 100}%`;
			green.style.width = `${greenW * 100}%`;
			gold.style.width = `${(goldW / greenW) * 100}%`;
			this.stage.querySelector("#pp-round").textContent = `${round + 1}/5`;
			t0 = performance.now();
			running = true;
		};

		const loop = (ts) => {
			if (running) {
				const speed = 0.85 + round * 0.3;
				const x = ((ts - t0) / 1000) * speed;
				pos = Math.abs((((x % 2) + 2) % 2) - 1);
				needle.style.left = `${pos * 100}%`;
			}
			this.raf = requestAnimationFrame(loop);
		};

		const punch = () => {
			if (!running) return;
			running = false;
			const d = Math.abs(pos - center);
			let pts = 0;
			let label = "MISS!";
			if (d <= goldW / 2) {
				pts = 3;
				label = "PERFECT! 3";
			} else if (d <= greenW / 2) {
				pts = 2;
				label = "GOOD! 2";
			} else if (d <= greenW) {
				pts = 1;
				label = "NEAR 1";
			}
			score += pts;
			results.push(pts);
			this.stage.querySelector("#pp-score").textContent = score;
			setSpriteMode(elHero, heroSpr, "atk");
			if (pts > 0) {
				ComicAudio.playPunch(pts === 3);
				this.later(() => setSpriteMode(elFoe, foeSpr, "idle"), 0);
				floatEl.textContent = label;
				floatEl.className = `pp-float show p${pts}`;
			} else {
				ComicAudio.playPageFlip();
				floatEl.textContent = label;
				floatEl.className = "pp-float show p0";
			}
			this.later(() => {
				setSpriteMode(elHero, heroSpr, "idle");
				floatEl.className = "pp-float";
				round++;
				if (round >= 5) {
					cancelAnimationFrame(this.raf);
					this.raf = null;
					const coins = score * 20 + (score >= 13 ? 100 : 0);
					const ink = score >= 12 ? 30 : score >= 8 ? 15 : 5;
					this.finish(game, {
						score,
						headline: score >= 13 ? "KNOCKOUT ARTIST!" : score >= 8 ? "SOLID PUNCHES!" : "KEEP SWINGING!",
						lines: [`Score <b>${score}/15</b>`, `Rounds: ${results.map((r) => ["✗", "●", "●●", "★"][r]).join("  ")}`],
						coins,
						ink,
					});
				} else {
					setupRound();
				}
			}, 700);
		};

		hitBtn.addEventListener("click", punch);
		this.keyHandler = (e) => {
			if (e.code === "Space" || e.code === "Enter") {
				e.preventDefault();
				punch();
			}
		};
		document.addEventListener("keydown", this.keyHandler);
		setupRound();
		this.raf = requestAnimationFrame(loop);
	}

	// ── Game 3: Who's That Hero? ────────────────────────────────────────────
	startQuiz() {
		const game = this.currentGame;
		const questions = shuffled(HEROES_DATA).slice(0, 8);
		let idx = 0;
		let correct = 0;
		let points = 0;
		let streak = 0;
		let answered = false;
		const QTIME = 12;

		const ask = () => {
			answered = false;
			const hero = questions[idx];
			const wrong = shuffled(HEROES_DATA.filter((h) => h.id !== hero.id)).slice(0, 3);
			const options = shuffled([hero, ...wrong]);
			let timeLeft = QTIME;
			this.stage.innerHTML = `
				<h2 class="arcade-title">WHO'S THAT HERO?</h2>
				<div class="arcade-hud"><span>Q <b>${idx + 1}/8</b></span><span>CORRECT <b id="qz-correct">${correct}</b></span><span>STREAK <b>${streak}</b></span></div>
				<div class="qz-timer"><div class="fill" id="qz-bar"></div></div>
				<div class="qz-silhouette" style="--qz-bg:${hero.colors.bg}" id="qz-sil">${hero.artSvg}</div>
				<div class="qz-hint" id="qz-hint">Silhouette only… hints incoming!</div>
				<div class="qz-options">${options
					.map((o) => `<button type="button" class="comic-btn qz-opt" data-id="${o.id}">${o.name}</button>`)
					.join("")}</div>`;

			const bar = this.stage.querySelector("#qz-bar");
			const hint = this.stage.querySelector("#qz-hint");
			const sil = this.stage.querySelector("#qz-sil");
			const reveal = (chosenId) => {
				if (answered) return;
				answered = true;
				clearInterval(tick);
				sil.classList.add("revealed");
				const ok = chosenId === hero.id;
				this.stage.querySelectorAll(".qz-opt").forEach((b) => {
					b.disabled = true;
					if (b.dataset.id === hero.id) b.classList.add("right");
					else if (b.dataset.id === chosenId) b.classList.add("wrong");
				});
				if (ok) {
					correct++;
					streak++;
					points += 100 + timeLeft * 10 + streak * 10;
					ComicAudio.playCoin();
					hint.textContent = `✔ ${hero.name} — "${hero.quote}"`;
				} else {
					streak = 0;
					ComicAudio.playPageFlip();
					hint.textContent = chosenId ? `✘ It was ${hero.name}!` : `⏰ Time's up! It was ${hero.name}.`;
				}
				this.later(() => {
					idx++;
					if (idx >= questions.length) {
						const coins = correct * 18 + (correct === 8 ? 80 : 0);
						const ink = correct >= 6 ? 20 : 8;
						this.finish(game, {
							score: correct,
							headline: correct === 8 ? "SUPER FAN!" : correct >= 5 ? "COMIC CONNOISSEUR" : "BACK TO THE LONGBOX",
							lines: [`<b>${correct}/8</b> correct`, `Points ${Math.round(points)}`],
							coins,
							ink,
						});
					} else ask();
				}, 1500);
			};

			const tick = setInterval(() => {
				timeLeft -= 0.25;
				bar.style.width = `${Math.max(0, (timeLeft / QTIME) * 100)}%`;
				if (timeLeft <= QTIME - 4 && !hint.dataset.a) {
					hint.dataset.a = 1;
					hint.textContent = `Hint: ${HERO_AFFINITIES[hero.affinity].icon} ${hero.affinity} · ${"★".repeat(hero.rarity)}`;
				}
				if (timeLeft <= QTIME - 8 && !hint.dataset.b) {
					hint.dataset.b = 1;
					hint.textContent = `Hint: "${hero.alias}"`;
				}
				if (timeLeft <= 0) reveal(null);
			}, 250);
			this.timers.push(tick);
			this.stage.querySelectorAll(".qz-opt").forEach((b) => b.addEventListener("click", () => reveal(b.dataset.id)));
		};
		ask();
	}
}

window.ComicArcade = ComicArcade;
window.getDailyMutator = getDailyMutator;
