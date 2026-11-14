"use strict";
// Prydwen-style tabbed savior page. Loaded after app.js; it replaces savior() without touching app.js.
// Tabs: Kit | Review | Build | Gameplay and teams | Stats | Story and art.
const SP_TABS = [
	["kit", "Kit"],
	["review", "Review"],
	["build", "Build"],
	["play", "Gameplay and teams"],
	["stats", "Stats"],
	["more", "Story and art"],
];
const SP_ROLE_BUILD = {
	// Derived from the Journey role multipliers and the equipment sets (see Journey and Equipment guides).
	Striker: {
		journey: "Strength first, then Vitality or Endurance for safety.",
		sets: "Attack (4) or Destruction (4); Insight (4) if crit rate is short.",
		main: "Amulet: CRIT DMG or CRIT Rate. Ring: ATK%.",
	},
	Ranger: {
		journey: "Strength first, then Vitality or Endurance for safety.",
		sets: "Attack (4) or Destruction (4); Insight (4) if crit rate is short.",
		main: "Amulet: CRIT DMG or CRIT Rate. Ring: ATK%.",
	},
	Caster: {
		journey:
			"Strength first (x1.2 for Casters), then Focus if she applies debuffs.",
		sets: "Attack (4) or Destruction (4); Precision (4) for debuffers.",
		main: "Amulet: CRIT DMG or CRIT Rate. Ring: ATK% or Effect Hit.",
	},
	Assassin: {
		journey: "Strength first (x1.2 for Assassins), then Vitality or Endurance.",
		sets: "Attack (4), Destruction (4) or Speed (4) for turn order.",
		main: "Amulet: CRIT Rate or CRIT DMG. Ring: ATK%.",
	},
	Defender: {
		journey: "Vitality and Endurance (x1.1 each for Defenders).",
		sets: "Health (4), Defense (2) or Barrier (2); Speed (4) if she must act early.",
		main: "Amulet: HP% or DEF%. Ring: HP% or DEF%.",
	},
	Supporter: {
		journey: "Vitality and Endurance (x1.1 each); add Focus if she debuffs.",
		sets: "Health (4) or Speed (4); Resistance (2) or Hit (2) for the second slot.",
		main: "Amulet: HP% or SPD. Ring: HP% or Effect Hit.",
	},
};
const spTab = (slug) => {
	const t = location.hash.slice(1).split("/")[3];
	return SP_TABS.some((x) => x[0] === t) ? t : "kit";
};

function spLegacyPanes(g, c) {
	const li = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
	return {
		review: `<h2>At a glance${g.role_label ? ` [${esc(g.role_label)}]` : ""}</h2><div class="panel guide-copy">${g.summary
			.split(/\n\s*\n/)
			.map((paragraph) => `<p>${esc(paragraph)}</p>`)
			.join(
				"",
			)}<div>${g.tags.map((x) => `<span class="tag">${TAGS[x][0]} ${TAGS[x][1]}</span>`).join("")}<span class="tag">${DEP[g.dependency][1]}</span></div><p><b>Team requirement:</b> ${esc(g.dependency_note)}</p><p><b>Main limitation:</b> ${esc(g.watch)}</p></div>`,
		kit: "",
		play: `<h2>How to use</h2><div class="panel guide-copy"><ol>${g.rotation.map((r) => `<li>${esc(r)}</li>`).join("")}</ol><p><b>Build priorities:</b> ${esc(g.build_tip)}</p></div><h2>Skill investment priority</h2><div class="panel guide-copy"><ol>${g.skill_order.map((o) => `<li><b>${esc(o.name)}</b> — ${esc(o.why)}</li>`).join("")}</ol></div><h2>Partner choices</h2><div class="panel guide-copy">${g.best_partners.map((p) => `<p><b><a href="#/savior/${p.slug}">${esc(c.by[p.slug].name)} · ${esc(c.by[p.slug].title)}</a></b><br>${esc(p.why)}</p>`).join("")}</div>`,
	};
}
// Split the shared guide HTML (renderSaviorGuide from app.js) into Review / Kit / Play panes by heading.
function spPanes(s, c) {
	const g = c.guides[s.slug];
	let html;
	try {
		html = renderSaviorGuide(s, c);
	} catch (e) {
		return spLegacyPanes(g, c);
	}
	const tmp = document.createElement("div");
	tmp.innerHTML = html;
	const out = { review: "", kit: "", play: "" };
	let cur = "review";
	[...tmp.children].forEach((el) => {
		if (el.tagName === "H2") {
			const t = el.textContent.toLowerCase();
			cur = /kit explained/.test(t)
				? "kit"
				: /(how to use|skill investment|team examples|partner|alternative)/.test(
							t,
					  )
					? "play"
					: "review";
		}
		const target = el.classList.contains("guide-columns") ? "review" : cur;
		out[target] += el.outerHTML;
	});
	return out;
}
function spSkill(k, i, s) {
	const lv = k.levels;
	return `<div class="panel skill sp-skill"><div class="sp-skh"><img loading="lazy" width="44" height="44" src="${img(k.icon)}" alt="" onerror="this.style.display='none'"><div><h3>${esc(k.name)}</h3><div class="sub">${esc(k.type)} · ${esc(k.action)} · ${esc(k.target)}${k.scaling ? " · " + k.scaling.map((x) => `${x.factor}% ${esc(x.stat)}`).join(" + ") : ""}</div></div></div>
	<p id="spk${i}"></p>${
		lv.length > 1
			? `<label class="muted">Skill level <b id="spl${i}">${lv.length}</b></label><input type="range" min="1" max="${lv.length}" value="${lv.length}" data-i="${i}">
	<details><summary>Multipliers by level</summary><table><tr><th>Lv</th><th>Upgrade effect</th></tr>${lv.map((x) => `<tr><td>${x.level}</td><td>${esc(x.upgrade_effect || "")}</td></tr>`).join("")}</table></details>`
			: ""
	}</div>`;
}

async function savior(slug) {
	const [s, c, P, A, ST] = (await Promise.all([
		load(`data/saviors/${slug}.json`),
		ctx(),
		load("data/potentials.json"),
		load("data/arcana.json"),
		load("data/stories.json"),
			RV.load(),
	])).slice(0, 5);
	const me = c.by[slug],
		g = c.guides[slug],
		T = c.tiers;
	const panes = { kit: "", review: "", play: "" }; // written content now comes from review-render.js
	const rate = me.ratings
		? `<span class="tag" style="background:${TIER_COLOR[me.ratings.pve]}">PvE ${me.ratings.pve}</span><span class="tag" style="background:${TIER_COLOR[me.ratings.pvp]}">PvP ${me.ratings.pvp}</span>`
		: `<span class="tag" style="background:${TIER_COLOR[me.tier]}">Tier ${me.tier}</span>`;
	const date = (g?.checked_at || T.checked_at || "").replace(
		/^(\d{4})-(\d{2})-(\d{2})$/,
		"$3/$2/$1",
	);
	const bg =
		HAS_ART.has(slug) && s.images.journey_bgs?.[0]
			? `style="background-image:url(${img(s.images.journey_bgs[0])})"`
			: "";
	const active = s.skills
		.map((k, i) => [k, i])
		.filter(([k]) => k.type !== "Unique Passive");
	const passive = s.skills
		.map((k, i) => [k, i])
		.filter(([k]) => k.type === "Unique Passive");
	const mine = P.filter((p) => p.character_id === s.id);
	const arc = A.arcana.filter((a) => a.savior === s.name && a.card);
	const topArc = A.arcana.filter((a) => a.tier === "S" && a.grade !== "R");
	const rb = SP_ROLE_BUILD[s.role] || SP_ROLE_BUILD.Striker;
	const stories = ST.stories.find((x) => x.slug === `savior-${slug}`);
	const info = [
		["Birthday", "birthday"],
		["Height", "height"],
		["Hometown", "hometown"],
		["Affiliation", "affiliation"],
		["VA (JP)", "voice_actor_jp"],
		["VA (KR)", "voice_actor_kr"],
	]
		.filter(([, k]) => s[k])
		.map(([l, k]) => `<div><span>${l}</span><b>${esc(s[k])}</b></div>`)
		.join("");
	const favor = s.favor?.levels ? s.favor.levels.slice(0, 12) : [];

	const kit = `<h2>Profile</h2><div class="panel"><p>${esc(s.description || "")}</p><div class="stats">${info}</div></div>
	<h2>Active skills</h2>${active.map(([k, i]) => spSkill(k, i, s)).join("")}
	<h2>Passive skills</h2>${passive.map(([k, i]) => spSkill(k, i, s)).join("")}
	<h2>Resonance</h2><div class="panel"><table><tr><th>Grade</th><th>Unlock Lv</th><th>Bonuses</th><th>Journey bonus</th></tr>${(s.resonance || []).map((r) => `<tr><td>${r.grade}</td><td>${r.unlock_level}</td><td>${r.stat_bonuses.map((b) => `${esc(b.stat)} +${fmt(b.value)}`).join(", ")}</td><td>${r.journey_bonus ? `${esc(r.journey_bonus.stat)} +${r.journey_bonus.value}` : "—"}</td></tr>`).join("")}</table></div>
	<h2>Star grades</h2><div class="panel"><table>${(s.star_grades || []).map((r) => `<tr><td>${"★".repeat(r.star)}</td><td>${(r.stat_bonuses || []).map((b) => `${esc(b.stat)} +${fmt(b.value)}`).join(", ")}</td></tr>`).join("")}</table></div>
	${mine.length ? `<h2>Potentials</h2>${mine.map((p) => `<div class="panel pot"><img loading="lazy" src="${img(p.icon)}" alt=""><div><b>${esc(p.name)}</b> <span class="tag">${esc(p.category)}</span><div>${rich(p.description)}</div></div></div>`).join("")}` : ""}`;

	const review = RV.review(slug);
	const build = `${RV.build(slug)}
	<h2>${esc(s.name)}'s arcana</h2>${arc.length ? `<div class="grid wide">${arc.map((a) => `<div class="card"><span class="im"><img loading="lazy" width="170" height="170" src="${img(a.card)}" alt=""><em class="t" style="background:${{ S: "#ff5d6c", A: "#ffa94d", B: "#ffe066", C: "#8ce99a", D: "#9aa6bd" }[a.tier] || "#c8d3e6"}">${a.tier || "?"}</em></span><span class="meta"><b>${esc(a.name)}</b><small>${esc(a.stat)} · ${esc(a.grade)}</small></span></div>`).join("")}</div><p class="muted">Matching the savior's name gives +5% Training Effect during Journey.</p>` : '<div class="panel"><p class="muted">No arcana is named after this savior.</p></div>'}
	<h2>Best general arcana (S tier)</h2><div class="grid wide">${topArc
		.slice(0, 8)
		.map(
			(a) =>
				`<div class="card"><span class="im"><img loading="lazy" width="170" height="170" src="${img(a.card)}" alt=""></span><span class="meta"><b>${esc(a.name)}</b><small>${esc(a.stat)}</small></span></div>`,
		)
		.join("")}</div>`;

	const stats = `<h2>Stats</h2><div class="panel"><select id="spsv"><option value="base_stats">Base</option><option value="max_stats">Database maximum</option></select><div class="stats" id="spstv"></div>
	<p class="muted">Growth per level: ${
		Object.entries(s.growth_per_level || {})
			.map(([k, v]) => `${esc(k)} +${v}`)
			.join(", ") || "—"
	}. Reference values from the database, not a prediction for your build.</p></div>
	${
		favor.length
			? `<h2>Favor levels</h2><div class="panel"><table><tr><th>Lv</th><th>EXP</th><th>Stats</th></tr>${favor
					.map(
						(f) =>
							`<tr><td>${f.level}</td><td>${fmt(f.exp)}</td><td>${
								f.stats
									? Object.entries(f.stats)
											.map(([k, v]) => `${esc(k)} +${v}`)
											.join(", ")
									: "—"
							}</td></tr>`,
					)
					.join("")}</table></div>`
			: ""
	}`;

	const more = `<h2>Story</h2><div class="panel">${stories ? `<p><a href="#/story/${stories.slug}">Read ${esc(s.name)}'s story</a> · ${stories.chapters.length} chapters</p><ol>${stories.chapters.map((x) => `<li>${esc(x.t)}</li>`).join("")}</ol>` : '<p class="muted">No savior story found.</p>'}</div>${typeof gallery === "function" ? gallery(s) : ""}`;

	const body = { kit, review, build, play: RV.teams(slug), stats, more };
	app.innerHTML = `<a class="back" href="#/saviors">← All saviors</a>
	<section class="sp-head" ${bg}><div class="sp-over"><div class="sp-text"><h1 class="sp-title">${esc(s.name)} <small>${esc(s.title)}${g?.role_label ? ` [${esc(g.role_label)}]` : ""}</small></h1><div class="sp-sub">BEST BUILD GUIDE</div><div class="sp-upd">Last updated: ${esc(date)}</div><div class="sp-chips"><span class="tag ${s.grade}">${s.grade}</span><span class="tag">${attrImg(s.attribute)}${s.attribute}</span><span class="tag">${roleImg(s.role)}${s.role}${s.sub_role ? " · " + esc(s.sub_role) : ""}</span><span class="tag"><img src="images/ui/UI_CMN_SKILL_TAG_${String(s.attack_type).toUpperCase()}.webp" alt="" onerror="this.remove()">${esc(s.attack_type)}</span><span class="tag">${esc(s.observe_type)}</span>${rate}</div></div><img class="sp-art" src="${img(s.images.portrait)}" alt="${esc(s.name)}"></div></section>
	<div class="tile sp-intro"><b>INTRODUCTION</b><p>Review the skills, build priorities and team conditions for ${esc(s.name)} (${esc(s.title)}). This profile covers ${s.grade === "SSR" ? "an SSR" : "an SR"} rarity savior of the ${s.attribute} attribute, a ${s.role}${s.sub_role ? ` (${esc(s.sub_role)})` : ""} who uses ${esc(s.attack_type)} attacks.</p></div>
	<div class="sp-track"><div><small>LAST REVIEW UPDATE</small><b>${esc(date)}</b></div></div>
	<p class="lead">To learn more about ${esc(s.name)}, use the tabs below to jump to the kind of information you need.</p>
	<nav class="sp-tabs">${SP_TABS.map(([k, l]) => `<button data-t="${k}">${l}</button>`).join("")}</nav><div id="sp-body"></div>`;

	const show = (t) => {
		document.getElementById("sp-body").innerHTML = body[t] || "";
		app
			.querySelectorAll(".sp-tabs button")
			.forEach((b) => b.classList.toggle("on", b.dataset.t === t));
		history.replaceState(null, "", `#/savior/${slug}/${t}`);
		if (t === "kit") {
			s.skills.forEach((k, i) => {
				const el = document.getElementById("spk" + i);
				if (el) {
					const lv = k.levels[k.levels.length - 1];
					el.innerHTML = rich(lv.description);
				}
			});
			app.querySelectorAll(".sp-skill input").forEach(
				(r) =>
					(r.oninput = () => {
						const k = s.skills[+r.dataset.i].levels[+r.value - 1];
						document.getElementById("spk" + r.dataset.i).innerHTML =
							rich(k.description) +
							(k.upgrade_effect && k.upgrade_effect !== "Base Effect"
								? `<br><small class="muted">Upgrade: ${esc(k.upgrade_effect)}</small>`
								: "");
						document.getElementById("spl" + r.dataset.i).textContent = r.value;
					}),
			);
		}
		if (t === "stats") {
			const draw = (key) =>
				(document.getElementById("spstv").innerHTML = Object.entries(s[key])
					.map(([k, v]) => `<div><span>${esc(k)}</span><b>${fmt(v)}</b></div>`)
					.join(""));
			draw("base_stats");
			document.getElementById("spsv").onchange = (e) => draw(e.target.value);
		}
	};
	app.querySelector(".sp-tabs").onclick = (e) => {
		const t = e.target.dataset?.t;
		if (t) {
			show(t);
			document
				.querySelector(".sp-tabs")
				.scrollIntoView({ block: "start", behavior: "smooth" });
		}
	};
	show(spTab(slug));
	document.title = `${s.name} (${s.title}) Best Build Guide — Star Savior Guide`;
}
// app.js already rendered the first route with the old savior(); redo it with this one.
if (location.hash.startsWith("#/savior/")) route();
