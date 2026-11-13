"use strict";
const app = document.getElementById("app");
const cache = {};
const ATTRS = ["Sun", "Moon", "Star", "Chaos", "Order"];
const ROLES = [
	"Striker",
	"Ranger",
	"Caster",
	"Assassin",
	"Defender",
	"Supporter",
];
const TIER_ORDER = [
	"S+",
	"S",
	"A+",
	"A",
	"B+",
	"B",
	"C+",
	"C",
	"D+",
	"NEW",
	"?",
];
const TIER_COLOR = {
	"S+": "#ff5d6c",
	S: "#ff8a5d",
	"A+": "#ffa94d",
	A: "#ffc94d",
	"B+": "#ffe066",
	B: "#d4e86a",
	"C+": "#8ce99a",
	C: "#63d6b0",
	"D+": "#b7c6d9",
	NEW: "#b58cff",
	"?": "#5c6285",
};
const TIER_VAL = {
	"S+": 10,
	S: 8.5,
	"A+": 7,
	A: 6,
	"B+": 4.5,
	B: 4,
	"C+": 2.5,
	C: 2,
	"D+": 1,
	NEW: 3,
	"?": 3,
};
const TAGS = {
	dps: ["⚔", "Damage"],
	healer: ["✚", "Healer"],
	buffer: ["▲", "Buffer"],
	debuffer: ["▼", "Debuffer"],
	breaker: ["💥", "Breaker"],
	tank: ["🛡", "Tank"],
	cleanse: ["✨", "Cleanse"],
	"ag-manip": ["⏱", "Gauge control"],
	shield: ["◈", "Barrier"],
	revive: ["♻", "Revive"],
	aoe: ["◎", "AoE"],
	"single-target": ["●", "Single target"],
};
const DEP = {
	team: ["⛓", "Specific team synergy"],
	enabler: ["🤝", "Support / enabler"],
	solo: ["", "Flexible team slot"],
};

const load = async (p) => (cache[p] ||= await (await fetch(p)).json());
const esc = (s) =>
	String(s ?? "").replace(
		/[&<>"]/g,
		(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
	);
const img = (p) => (p ? p.replace(/^\//, "") : "");
const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : esc(n));
const rich = (s) =>
	esc(s)
		.replace(/&lt;color=(#[0-9a-fA-F]{3,8})&gt;/g, '<span style="color:$1">')
		.replace(/&lt;\/color&gt;/g, "</span>")
		.replace(/&lt;(\/?)b&gt;/g, "<$1b>")
		.replace(/\n/g, "<br>");

async function ctx() {
	const [list, tiers, guides] = await Promise.all([
		load("data/saviors.json"),
		load("data/tiers.json"),
		load("data/guides.json"),
	]);
	const by = Object.fromEntries(list.map((s) => [s.slug, s]));
	list.forEach((s) => {
		s.ratings = tiers.ratings[s.slug];
		s.tier = s.ratings.pve;
	});
	return { list, by, tiers, guides };
}
const badge = (s, g) => {
	const t = g[s.slug]?.tags || [];
	const dep = g[s.slug]?.dependency;
	return `<span class="badges">${t
		.slice(0, 3)
		.map((x) => `<i title="${TAGS[x][1]}">${TAGS[x][0]}</i>`)
		.join(
			"",
		)}</span>${DEP[dep]?.[0] ? `<span class="dep ${dep}" title="${DEP[dep][1]}">${DEP[dep][0]}</span>` : ""}`;
};
const thumb = (s, g, extra = "") =>
	`<a href="#/savior/${s.slug}" title="${esc(s.name)} — ${esc(s.title)}"><span class="ic"><img loading="lazy" width="62" height="62" src="${img(s.icon)}" alt=""><span class="ai">${attrImg(s.attribute)}</span>${badge(s, g)}</span>${esc(s.name)}<small class="sub">${esc(s.title)}</small>${extra}</a>`;
const attrImg = (a) =>
	`<img src="images/ui/attr_${String(a).toLowerCase()}.webp" alt="${a}">`;
const roleImg = (r) =>
	`<img src="images/ui/role_${String(r).toLowerCase()}.webp" alt="${r}">`;
const STAT_IMG = {
	Strength: "POWER",
	Vitality: "HEALTH",
	Endurance: "ENDURANCE",
	Focus: "FOCUS",
	Protection: "PROTECT",
};
const statImg = (v) =>
	`<img src="images/jstats/AB_UNIT_STAT_${STAT_IMG[v]}.webp" alt="${v}">`;
// toggle buttons (text) and icon buttons; clicking an active one clears it
const chips = (el, vals, f, key, draw, label = (v) => v) => {
	el.innerHTML = vals
		.map(
			(v) =>
				`<button class="${el.classList.contains("fg") ? "fb" : "chip"}" data-v="${v}">${label(v)}</button>`,
		)
		.join("");
	el.onclick = (e) => {
		const b = e.target.closest("button");
		if (!b) return;
		f[key] = f[key] === b.dataset.v ? "" : b.dataset.v;
		el.querySelectorAll("button").forEach((x) =>
			x.classList.toggle("on", x.dataset.v === f[key]),
		);
		draw();
	};
};
const iconChips = (el, vals, f, key, draw, icon) => {
	el.innerHTML = vals
		.map(
			(v) =>
				`<button class="ib" data-v="${v}" title="${v}">${icon(v)}</button>`,
		)
		.join("");
	el.onclick = (e) => {
		const b = e.target.closest("button");
		if (!b) return;
		f[key] = f[key] === b.dataset.v ? "" : b.dataset.v;
		el.querySelectorAll("button").forEach((x) =>
			x.classList.toggle("on", x.dataset.v === f[key]),
		);
		draw();
	};
};
const setCount = (n) => {
	const c = document.getElementById("cnt");
	if (c) c.textContent = `${n} shown`;
};
const sCard = (s) =>
	`<a class="card" href="#/savior/${s.slug}" title="${esc(s.title)}"><span class="im"><img loading="lazy" width="110" height="110" src="${img(s.icon)}" alt=""><span class="a">${attrImg(s.attribute)}</span><span class="r">${roleImg(s.role)}</span><em class="t" style="background:${TIER_COLOR[s.tier]}">${s.tier}</em></span><span class="meta"><b>${esc(s.name)}</b><small>${esc(s.title)}</small></span></a>`;
async function home() {
	const { list } = await ctx();
	const top = list.filter((s) => s.tier === "S+");
	const L = (href, ico, t, d) =>
		`<a href="${href}"><img src="${ico}" alt=""><div><b>${t}</b><span>${d}</span></div></a>`;
	app.innerHTML = `<div class="hero"><h1>Hi, Captain</h1><p class="lead">Fast, read-first Star Savior reference: saviors, tier list, teams, arcana, stories and game-system guides. Press <b>/</b> to search anything.</p><div class="pager"><i></i><i></i><i></i></div></div>
	<h2>Jump to</h2><div class="cards">
	${L("#/tiers", "images/ui/role_striker.webp", "Tier List", "PvE / PvP, kit conditions")}${L("#/builder", "images/ui/role_supporter.webp", "Team Builder", "Pick what you own")}${L("#/teams", "images/ui/role_defender.webp", "Best Teams", "22 teams by attribute")}
	${L("#/saviors", "images/ui/attr_star.webp", "Saviors", list.length + " profiles + guides")}${L("#/arcana", "images/jstats/AB_UNIT_STAT_POWER.webp", "Arcana", "Cards and tiers")}${L("#/stories", "images/ui/attr_moon.webp", "Stories", "Main, events, savior")}
	${L("#/guide/beginner", "images/ui/attr_sun.webp", "Beginner Guide", "Start here")}${L("#/guide/journey", "images/jstats/AB_UNIT_STAT_ENDURANCE.webp", "Journey Guide", "Training and stats")}${L("#/guide/systems-combat", "images/ui/role_caster.webp", "Game Systems", "7 guides")}
	${L("#/guide/meta", "images/ui/attr_chaos.webp", "Latest Meta", "Anniversary notes")}${L("#/enemies", "images/ui/role_assassin.webp", "Enemies", "211 enemies")}${L("#/db", "images/ui/attr_order.webp", "Database", "Potentials, gear, sectors")}</div>
	<h2>PvE S+ saviors</h2><div class="grid">${top.map(sCard).join("")}</div>`;
}
async function saviors() {
	const { list } = await ctx();
	const f = { q: "", attr: "", role: "", sort: "name" };
	app.innerHTML = `<div class="ph"><h1>Saviors <small>(${list.length})</small></h1></div>
	<div class="fbar"><input id="q" type="search" placeholder="Search name or title…" autocomplete="off"><span class="fg" id="fa"></span><span class="fg" id="fr"></span>
	<select id="sort" aria-label="Sort saviors"><option value="name">A–Z</option><option value="tier">PvE tier</option><option value="pvp-tier">PvP tier</option><option value="pvp">PvP usage snapshot</option><option value="atk">Max ATK</option><option value="hp">Max HP</option></select><span class="cnt" id="cnt"></span></div><p class="lead">Card badge: PvE tier. Open a guide for PvP, kit explanations, teams and alternatives.</p><div class="grid" id="g"></div>`;
	const draw = () => {
		const q = f.q.toLowerCase();
		const rows = list
			.filter(
				(s) =>
					(!f.attr || s.attribute === f.attr) &&
					(!f.role || s.role === f.role) &&
					(!q || (s.name + " " + s.title).toLowerCase().includes(q)),
			)
			.sort((a, b) =>
				f.sort === "name"
					? a.name.localeCompare(b.name)
					: f.sort === "tier"
						? TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
						: f.sort === "pvp-tier"
							? TIER_ORDER.indexOf(a.ratings.pvp) -
								TIER_ORDER.indexOf(b.ratings.pvp)
							: b[f.sort] - a[f.sort],
			);
		document.getElementById("g").innerHTML =
			rows.map(sCard).join("") || '<p class="muted">No matches.</p>';
		setCount(rows.length);
	};
	iconChips(document.getElementById("fa"), ATTRS, f, "attr", draw, attrImg);
	iconChips(document.getElementById("fr"), ROLES, f, "role", draw, roleImg);
	document.getElementById("q").oninput = (e) => (
		(f.q = e.target.value),
		draw()
	);
	document.getElementById("sort").onchange = (e) => (
		(f.sort = e.target.value),
		draw()
	);
	draw();
}
async function tiers() {
	const { list, guides, tiers: T } = await ctx();
	const f = { attr: "", role: "", tag: "", mode: "pve" };
	app.innerHTML = `<div class="ph"><h1>Tier List</h1><span class="muted">Community ratings</span></div>
	<div class="fbar"><label for="mode">Mode</label><select id="mode"><option value="pve">PvE</option><option value="pvp">PvP</option></select><span class="fg" id="fa"></span><span class="fg" id="fr"></span><span class="fg" id="ft"></span><span class="cnt" id="cnt"></span></div>
	<p class="lead">${esc(T.note)}</p><details class="panel"><summary>How to read these tiers</summary><p>${esc(T.methodology)}</p><p>Our kit review: ${esc(T.checked_at)}. Tier letters are source judgments; our explanations are a separate assessment.</p></details>
	<details class="leg" open><summary>How to read the icons on each card</summary><div class="legend-box">
	<p class="leg-h">Every portrait carries four small marks. Hover a card for its full details.</p>
	<ul class="leg-list">
	<li><b>Top left, round icon: attribute.</b> ${ATTRS.map((a) => `<span class="leg-a">${attrImg(a)}${a}</span>`).join("")}</li>
	<li><b>Top centre, gold or violet chip: rarity.</b> <span class="leg-r ssr">SSR</span> gold frame, <span class="leg-r sr">SR</span> silver-violet frame. Use the Rarity buttons to show one.</li>
	<li><b>Top right, one symbol or none: team dependence.</b> <span class="leg-s">⛓</span> works best in a specific team (check partners) · <span class="leg-s">🤝</span> a support who makes others better · no symbol means a flexible slot.</li>
	<li><b>Bottom left, up to three chips: what the savior does.</b> The first tag is the main job. Tags: ${Object.values(
		TAGS,
	)
		.map((v) => `<span class="leg-t">${v[0]} ${v[1]}</span>`)
		.join("")}</li>
	<li><b>Left colour block: the tier</b> and how many saviors it holds. The mode selector switches between PvE and PvP ratings. New means no verified rating yet. Within a tier the order is A–Z, or by PvP usage if you pick that sort.</li>
	</ul></div></details><div id="t"></div>`;
	const draw = () => {
		let n = 0;
		document.getElementById("t").innerHTML =
			TIER_ORDER.map((k) => {
				const rows = list
					.filter(
						(s) =>
							s.ratings[f.mode] === k &&
							(!f.attr || s.attribute === f.attr) &&
							(!f.role || s.role === f.role) &&
							(!f.tag || guides[s.slug]?.tags.includes(f.tag)),
					)
					.sort(
						(a, b) =>
							a.name.localeCompare(b.name) || a.title.localeCompare(b.title),
					);
				n += rows.length;
				if (!rows.length) return "";
				return `<div class="tier"><div style="background:${TIER_COLOR[k]}">${k === "NEW" ? "New" : k}<small>${rows.length}</small></div><div class="row">${rows.map((s) => thumb(s, guides)).join("")}</div></div>`;
			}).join("") || '<p class="muted">No matches.</p>';
		setCount(n);
	};
	iconChips(document.getElementById("fa"), ATTRS, f, "attr", draw, attrImg);
	iconChips(document.getElementById("fr"), ROLES, f, "role", draw, roleImg);
	const ft = document.getElementById("ft");
	ft.classList.add("fg");
	chips(
		ft,
		[
			"healer",
			"tank",
			"buffer",
			"debuffer",
			"breaker",
			"dps",
			"cleanse",
			"ag-manip",
		],
		f,
		"tag",
		draw,
		(v) => `${TAGS[v][0]} ${TAGS[v][1]}`,
	);
	document.getElementById("mode").onchange = (e) => {
		f.mode = e.target.value;
		draw();
	};
	draw();
}
function renderSaviorGuide(s, c) {
	const g = c.guides[s.slug],
		rating = c.by[s.slug].ratings;
	const list = (items) =>
		`<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
	const link = (slug) =>
		`<a href="#/savior/${slug}">${esc(c.by[slug].name)} · ${esc(c.by[slug].title)}</a>`;
	return `<h2>At a glance${g.role_label ? ` [${esc(g.role_label)}]` : ""}</h2><div class="panel guide-copy">${g.summary
		.split(/\n\s*\n/)
		.map((paragraph) => `<p>${esc(paragraph)}</p>`)
		.join("")}
	<div>${g.tags.map((x) => `<span class="tag">${TAGS[x][0]} ${TAGS[x][1]}</span>`).join("")}<span class="tag">${DEP[g.dependency][1]}</span></div>
	<p><b>Team requirement:</b> ${esc(g.dependency_note)}</p><p><b>Main limitation:</b> ${esc(g.watch)}</p></div>
	<h2>Tier assessment</h2><div class="panel guide-copy"><p><b>PvE ${esc(rating.pve)} · PvP ${esc(rating.pvp)}</b> — ${rating.status === "published" ? "Published community ratings" : "Unranked; provisional kit assessment"}</p>
	<p>${esc(g.tier_reason)}</p><p><b>PvE:</b> ${esc(g.pve_note)}</p><p><b>PvP:</b> ${esc(g.pvp_note)}</p>
	<p><b>Investment:</b> ${esc(g.investment)}</p><p class="muted">Reviewed ${esc(c.tiers.checked_at)} against stored stats, skills and effects. Explanations describe the highest stored skill level unless stated otherwise. No combat benchmark or exact copy requirement is implied. Debuff chance still depends on resistance, accuracy and immunity unless the skill explicitly bypasses them.</p>${g.research_note ? `<p class="callout warn">${esc(g.research_note)}</p>` : ""}</div>
	<h2 id="kit-guide">Kit explained</h2><div class="panel guide-copy"><p class="muted">Action gauge is progress toward the next turn. A stack is a counter a skill builds or spends. An extra turn acts again immediately; a follow-up is an automatic attack when its condition is met. Toughness is the break bar: emptying it creates a damage window. Nova Burst enhances a chosen skill using the shared Nova Force resource.</p>
	${g.kit_explanation.map((k, i) => `<h3>${i + 1}. ${esc(k.name)}</h3><p>${esc(k.explanation)}</p>`).join("")}</div>
	<div class="guide-columns"><section><h2>Pros</h2><div class="panel guide-copy">${list(g.pros)}</div></section><section><h2>Cons</h2><div class="panel guide-copy">${list(g.cons)}</div></section></div>
	<h2 id="usage-guide">How to use her</h2><div class="panel guide-copy"><ol>${g.rotation.map((r) => `<li>${esc(r)}</li>`).join("")}</ol><p><b>Build priorities:</b> ${esc(g.build_tip)}</p></div>
	<h2>Skill investment priority</h2><div class="panel guide-copy"><p class="muted">Upgrade priorities, not a fixed cast order. Triggered skills activate automatically.</p><ol>${g.skill_order.map((o) => `<li><b>${esc(o.name)}</b> — ${esc(o.why)}</li>`).join("")}</ol></div>
	<h2 id="teams-guide">Team examples</h2><p class="lead">Recommended starting points from kit synergy, not tested best-in-slot teams. Adjust speed, survival and attributes for the encounter.</p>
	${g.teams.map((t) => `<div class="panel guide-copy"><h3>${esc(t.name)}</h3>${teamRow(c, t.members)}<p>${esc(t.why)}</p><p><b>How to play:</b> ${esc(t.playstyle)}</p></div>`).join("")}
	<h2>Partner choices</h2><div class="panel guide-copy">${g.best_partners.map((p) => `<p><b>${link(p.slug)}</b><br>${esc(p.why)}</p>`).join("")}</div>
	<h2 id="alternatives-guide">Better alternatives?</h2><div class="panel guide-copy"><p class="muted">Choose by the job you need. A higher tier does not guarantee a better result in your team.</p>${g.alternatives.map((a) => `<h3>${link(a.slug)}</h3><p><b>Choose her when:</b> ${esc(a.why)}</p><p><b>Tradeoff:</b> ${esc(a.tradeoff)}</p>`).join("")}</div>`;
}

// Extra art (illustration, journey backgrounds, arcana cards) is only stored locally for some saviors; hide the rest.
const HAS_ART = new Set(["eastern-swordmaster"]); // saviors whose large art is stored locally
const gallery = (s) => {
	if (!HAS_ART.has(s.slug)) return "";
	const im = s.images || {};
	const arc = [`ARCANA_${s.slug.replace(/-/g, "_").toUpperCase()}`];
	const list = [
		im.illust,
		...(im.journey_bgs || []),
		im.arcpoint_hd,
		...[1, 2].map(
			(n) =>
				`/images/arcana/${s.slug === "eastern-swordmaster" ? "ARCANA_EASTERN_SWORDMASTER" : arc[0]}_SSR_0${n}.webp`,
		),
	].filter(Boolean);
	return `<h2 id="ga">Gallery</h2><div class="gal">${list.map((p) => `<a href="${img(p)}" target="_blank" rel="noopener"><img loading="lazy" src="${img(p)}" alt="" onerror="this.parentNode.remove()"></a>`).join("")}</div>`;
};
async function savior(slug) {
	const [s, c] = await Promise.all([load(`data/saviors/${slug}.json`), ctx()]);
	const me = c.by[slug];
	const guide = renderSaviorGuide(s, c);
	app.innerHTML = `<a class="back" href="#/saviors">← All saviors</a>
	<div class="detail"><div><img class="art" src="${img(s.images.portrait)}" alt="${esc(s.name)}">
	<div class="panel"><span class="tag ${s.grade}">${s.grade}</span><span class="tag attr-${s.attribute}">${s.attribute}</span><span class="tag">${s.role}${s.sub_role ? " · " + esc(s.sub_role) : ""}</span><span class="tag">${s.attack_type}</span><span class="tag">${s.observe_type}</span><span class="tag">PvE ${me.ratings.pve}</span><span class="tag">PvP ${me.ratings.pvp}</span></div></div>
	<div><h1>${esc(s.name)} <small>${esc(s.title)}</small></h1>${HAS_ART.has(slug) && s.images.journey_bgs?.[0] ? `<img class="banner" src="${img(s.images.journey_bgs[0])}" alt="" onerror="this.remove()">` : ""}<nav class="jump"><a href="#/savior/${slug}" data-j="gd">Guide</a><a href="#/savior/${slug}" data-j="kit-guide">Kit</a><a href="#/savior/${slug}" data-j="usage-guide">How to play</a><a href="#/savior/${slug}" data-j="teams-guide">Teams</a><a href="#/savior/${slug}" data-j="alternatives-guide">Alternatives</a><a href="#/savior/${slug}" data-j="sk">Skills</a><a href="#/savior/${slug}" data-j="st">Stats</a><a href="#/savior/${slug}" data-j="rs">Resonance</a>${HAS_ART.has(slug) ? `<a href="#/savior/${slug}" data-j="ga">Gallery</a>` : ""}<a href="#/story/savior-${slug}">Story ↗</a></nav><p class="lead">${esc(s.description)}</p><div id="gd">${guide}</div>
	<div class="panel stats">${[
		"Birthday:birthday",
		"Height:height",
		"Hometown:hometown",
		"Affiliation:affiliation",
		"VA (JP):voice_actor_jp",
		"VA (KR):voice_actor_kr",
	]
		.map((x) => {
			const [l, k] = x.split(":");
			return s[k] ? `<div><span>${l}</span><b>${esc(s[k])}</b></div>` : "";
		})
		.join("")}</div>
	<h2 id="st">Stats</h2><div class="panel"><label for="stat-view">Stat reference</label> <select id="stat-view"><option value="base_stats">Base</option><option value="max_stats">Database maximum</option></select>
	<div class="stats" id="stat-values"></div><p class="muted">Stored reference values, not a prediction for your build. The database maximum is not extrapolated into a character level; Journey, gear and upgrade assumptions are not simulated here.</p></div>
	<h2 id="sk">Skills</h2>${s.skills
		.map(
			(
				k,
				i,
			) => `<div class="panel skill"><h3>${esc(k.name)}</h3><div class="sub">${esc(k.type)} · ${esc(k.action)} · ${esc(k.target)}${k.scaling ? " · " + k.scaling.map((x) => `${x.factor}% ${esc(x.stat)}`).join(" + ") : ""}</div>
	<p id="sk${i}"></p>${k.levels.length > 1 ? `<input type="range" min="1" max="${k.levels.length}" value="${k.levels.length}" data-i="${i}"><small class="muted">Skill level <b id="sl${i}">${k.levels.length}</b></small>` : ""}</div>`,
		)
		.join("")}
	${gallery(s)}<h2 id="rs">Resonance</h2><div class="panel"><table><tr><th>Grade</th><th>Unlock Lv</th><th>Bonuses</th></tr>${(s.resonance || []).map((r) => `<tr><td>${r.grade}</td><td>${r.unlock_level}</td><td>${r.stat_bonuses.map((b) => `${esc(b.stat)} +${fmt(b.value)}`).join(", ")}</td></tr>`).join("")}</table></div>
	<h2>Star Grades</h2><div class="panel"><table>${(s.star_grades || []).map((r) => `<tr><td>${"★".repeat(r.star)}</td><td>${(r.stat_bonuses || []).map((b) => `${esc(b.stat)} +${fmt(b.value)}`).join(", ")}</td></tr>`).join("")}</table></div>
	</div></div>`;
	const drawStats = (key) => {
		document.getElementById("stat-values").innerHTML = Object.entries(s[key])
			.map(([k, v]) => `<div><span>${esc(k)}</span><b>${fmt(v)}</b></div>`)
			.join("");
	};
	drawStats("base_stats");
	document.getElementById("stat-view").onchange = (e) =>
		drawStats(e.target.value);
	const drawSkill = (i, l) => {
		const k = s.skills[i].levels[l - 1];
		document.getElementById("sk" + i).innerHTML =
			rich(k.description) +
			(k.upgrade_effect && k.upgrade_effect !== "Base Effect"
				? `<br><small class="muted">Upgrade: ${esc(k.upgrade_effect)}</small>`
				: "");
	};
	s.skills.forEach((k, i) => drawSkill(i, k.levels.length));
	app.querySelectorAll(".skill input").forEach(
		(r) =>
			(r.oninput = () => {
				drawSkill(+r.dataset.i, +r.value);
				document.getElementById("sl" + r.dataset.i).textContent = r.value;
			}),
	);
	app.querySelector(".jump").onclick = (e) => {
		const t = e.target.dataset?.j;
		if (!t) return;
		e.preventDefault();
		document.getElementById(t).scrollIntoView({ behavior: "smooth" });
	};
	document.title = `${s.name} (${s.title}) — Star Savior Guide`;
}

async function arcana() {
	const A = await load("data/arcana.json");
	const f = { q: "", grade: "", stat: "", view: "db" };
	const STATS = ["Strength", "Vitality", "Endurance", "Focus", "Protection"];
	app.innerHTML = `<div class="ph"><h1>Arcana <small>(${A.arcana.length})</small></h1><span class="muted">Community arcana tiers</span></div>
	<div class="fbar"><span class="fg" id="fv"></span><input id="q" type="search" placeholder="Search arcana or savior…" autocomplete="off"><span class="fg" id="fs"></span><select id="gr"><option value="">All grades</option><option>SSR</option><option>SR</option><option>R</option></select><span class="cnt" id="cnt"></span></div><div id="o"></div>`;
	const draw = () => {
		const o = document.getElementById("o");
		const rows = A.arcana.filter(
			(a) =>
				(!f.grade || a.grade === f.grade) &&
				(!f.stat || a.stat === f.stat) &&
				(!f.q ||
					(a.name + " " + a.savior).toLowerCase().includes(f.q.toLowerCase())),
		);
		setCount(rows.length);
		if (f.view === "tier") {
			const rows2 = ["S", "A", "B", "C", "D", null];
			const col = {
				S: "#ff5d6c",
				A: "#ffa94d",
				B: "#ffe066",
				C: "#8ce99a",
				D: "#9aa6bd",
				null: "#c8d3e6",
			};
			o.innerHTML = `<div class="tile"><table><tr><th>Tier</th>${STATS.map((st) => `<th>${statImg(st)} ${st}</th>`).join("")}</tr>${rows2
				.map(
					(t) =>
						`<tr><td style="background:${col[t]};color:#111;font-weight:800">${t || "?"}</td>${STATS.map(
							(st) =>
								`<td>${rows
									.filter(
										(a) =>
											a.stat === st &&
											a.grade !== "R" &&
											(a.tier || null) === t,
									)
									.map(
										(a) =>
											`<a class="al" href="#/arcana" data-n="${esc(a.name)}">${esc(a.name)}</a> <small class="muted">${esc(a.savior)}</small><br>`,
									)
									.join("")}</td>`,
						).join("")}</tr>`,
				)
				.join("")}</table></div>`;
			o.querySelectorAll(".al").forEach(
				(x) =>
					(x.onclick = (e) => {
						e.preventDefault();
						f.view = "db";
						f.q = x.dataset.n;
						document.getElementById("q").value = f.q;
						fvSet();
						draw();
					}),
			);
			return;
		}
		o.innerHTML = `<div class="grid wide">${
			rows
				.map(
					(
						a,
					) => `<details class="card" style="padding:0"><summary style="list-style:none"><span class="im"><img loading="lazy" width="170" height="170" src="${img(a.card)}" alt=""><span class="a">${statImg(a.stat)}</span>${a.tier ? `<em class="t" style="background:${{ S: "#ff5d6c", A: "#ffa94d", B: "#ffe066", C: "#8ce99a", D: "#9aa6bd" }[a.tier]}">${a.tier}</em>` : ""}</span><span class="meta"><b>${esc(a.name)}</b><small>${esc(a.savior)} · <span class="grade-${a.grade}">${a.grade}</span></small></span></summary>
		<div class="meta" style="border-top:1px solid var(--line)"><small>${esc(a.class)}</small>${a.effects.map((e) => `<span class="tag" title="${esc(e.c)} (Lv ${e.lv})">${esc(e.e)} ${esc(e.v)}</span>`).join("")}${a.unique ? `<p style="margin:.3rem 0 0;font-size:.78rem"><b>${esc(a.unique.name)}</b><br>${esc(a.unique.text)}</p>` : ""}</div></details>`,
				)
				.join("") || '<p class="muted">No matches.</p>'
		}</div>`;
	};
	const fv = document.getElementById("fv");
	fv.className = "fg";
	fv.innerHTML =
		'<button class="fb on" data-v="db">Cards</button><button class="fb" data-v="tier">Tier list</button>';
	const fvSet = () =>
		fv
			.querySelectorAll("button")
			.forEach((b) => b.classList.toggle("on", b.dataset.v === f.view));
	fv.onclick = (e) => {
		const v = e.target.dataset?.v;
		if (!v) return;
		f.view = v;
		fvSet();
		draw();
	};
	iconChips(document.getElementById("fs"), STATS, f, "stat", draw, statImg);
	document.getElementById("q").oninput = (e) => (
		(f.q = e.target.value),
		draw()
	);
	document.getElementById("gr").onchange = (e) => (
		(f.grade = e.target.value),
		draw()
	);
	draw();
}
const teamRow = (c, members, owned) =>
	`<div class="team">${members.map((m) => `<a class="m ${owned && !owned.has(m) ? "miss" : ""}" href="#/savior/${m}"><img loading="lazy" src="${img(c.by[m].icon)}" alt="">${esc(c.by[m].name)}<br><small class="muted">${esc(c.by[m].title)}</small></a>`).join("")}</div>`;

async function teams() {
	const [c, T] = await Promise.all([ctx(), load("data/teams.json")]);
	const f = { attr: "" };
	app.innerHTML = `<div class="ph"><h1>Best Teams</h1><span class="cnt" id="cnt"></span></div><p class="lead">Published team examples from the community. Parties have 4 slots, and every list also adds Omega and her Break Skill. <a href="#/guide/team-building">How to build your own →</a> · <a href="#/builder">Team Builder →</a></p><div class="fbar"><span class="fg" id="fa"></span><span class="cnt" id="cnt2"></span></div><div id="l"></div>`;
	const draw = () => {
		document.getElementById("l").innerHTML = T.teams
			.filter((t) => !f.attr || t.attr === f.attr)
			.map(
				(t) =>
					`<div class="panel"><b>${esc(t.name)}</b> <span class="tag">${t.attr}</span>${t.f2p ? '<span class="tag">F2P friendly</span>' : ""}<p class="muted">${esc(t.note)}</p>${teamRow(c, t.members)}</div>`,
			)
			.join("");
	};
	iconChips(document.getElementById("fa"), ATTRS, f, "attr", draw, attrImg);
	draw();
}

// ---- Team builder ----
const OWN_KEY = "ssg-owned";
const getOwned = () => {
	try {
		return new Set(JSON.parse(localStorage.getItem(OWN_KEY) || "[]"));
	} catch {
		return new Set();
	}
};
const saveOwned = (s) => {
	try {
		localStorage.setItem(OWN_KEY, JSON.stringify([...s]));
	} catch {}
};

function scoreTeam(team, c, mode = "pve") {
	const g = (m) => c.guides[m.slug];
	let sc = team.reduce((a, m) => a + TIER_VAL[m.ratings[mode]], 0);
	const tags = team.flatMap((m) => g(m).tags);
	const has = (t) => tags.includes(t);
	const why = [];
	if (team.some((m) => m.role === "Defender" || g(m).tags.includes("tank"))) {
		sc += 4;
		why.push("front-line tank");
	}
	if (has("healer")) {
		sc += 4;
		why.push("healing");
	} else if (has("shield")) {
		sc += 2;
		why.push("barriers");
	}
	if (has("breaker")) {
		sc += 3;
		why.push("break");
	}
	if (has("buffer")) {
		sc += 2;
		why.push("buffs");
	}
	if (team.filter((m) => g(m).tags.includes("dps")).length >= 2) {
		sc += 3;
		why.push("2+ damage dealers");
	}
	const cnt = {};
	team.forEach((m) => (cnt[m.attribute] = (cnt[m.attribute] || 0) + 1));
	const top = Math.max(...Object.values(cnt));
	const topAttr = Object.keys(cnt).find((k) => cnt[k] === top);
	if (top >= 4) {
		sc += 6;
		why.push(`mono ${topAttr}`);
	} else if (top === 3) {
		sc += 3;
		why.push(`mostly ${topAttr}`);
	} else if (top === 2) sc += 1;
	const slugs = new Set(team.map((m) => m.slug));
	team.forEach((m) => {
		const links = g(m).best_partners.filter((p) => slugs.has(p.slug)).length;
		sc += links * 1.2;
		if (g(m).dependency === "team" && !links && cnt[m.attribute] < 3) sc -= 3;
		if (
			g(m).dependency === "enabler" &&
			!team.some((o) => o !== m && g(o).tags.includes("dps"))
		)
			sc -= 3;
	});
	return { sc, why };
}

function bestTeams(owned, c, mode = "pve") {
	// shortcut: search the top 18 by mode rating, expand when encounter-specific scoring is available.
	const pool = c.list
		.filter((s) => owned.has(s.slug))
		.sort(
			(a, b) =>
				TIER_VAL[b.ratings[mode]] - TIER_VAL[a.ratings[mode]] ||
				a.slug.localeCompare(b.slug),
		)
		.slice(0, 18);
	const size = Math.min(4, pool.length);
	if (size < 3) return [];
	const res = [];
	const rec = (i, cur) => {
		if (cur.length === size) {
			const r = scoreTeam(cur, c, mode);
			res.push({ team: [...cur], ...r });
			return;
		}
		for (let k = i; k < pool.length; k++) {
			cur.push(pool[k]);
			rec(k + 1, cur);
			cur.pop();
		}
	};
	rec(0, []);
	res.sort((a, b) => b.sc - a.sc);
	const out = [];
	for (const r of res) {
		if (
			out.every(
				(o) => o.team.filter((m) => r.team.includes(m)).length <= size - 2,
			)
		)
			out.push(r);
		if (out.length === 3) break;
	}
	return out;
}

const metaNote = (r, c, mode) => {
	const notes = [];
	notes.push(
		"Plan your first turns around the character guides; speed order, target resistance and investment are not simulated.",
	);
	if (!r.why.includes("front-line tank"))
		notes.push(
			"No tank: check whether your protection and healing can keep the damage dealers alive.",
		);
	if (!r.why.includes("healing"))
		notes.push(
			"No healer: bring cleanse/barrier units or pick Waltz Asherah, Carmen (Eternal Promise) or Frey if you can.",
		);
	const hot =
		mode === "pvp" ? r.team.filter((m) => m.pvp >= 0.4).map((m) => m.name) : [];
	if (hot.length)
		notes.push(
			`Meta: ${hot.join(", ")} appeared in over 40% of top Gauntlet squads in the stored 12 Nov 2026 usage snapshot; this is not a tier score.`,
		);
	return notes;
};

async function builder() {
	const [c, T] = await Promise.all([ctx(), load("data/teams.json")]);
	const owned = getOwned();
	let mode = "pve";
	app.innerHTML = `<h1>Team Builder</h1><p class="lead">Tap the saviors you own. Suggestions use the selected mode rating, roles and partner links, searching up to 18 candidates. Scores are rough estimates, not combat results; they do not model stars, gear, speed order or enemy mechanics. New saviors use a conservative placeholder rather than an assumed top tier. Saved in this browser only.</p>
	<div class="fbar"><label for="builder-mode">Mode</label><select id="builder-mode"><option value="pve">PvE</option><option value="pvp">PvP</option></select><button class="fb" id="all">Select all</button><button class="fb" id="none">Clear</button><input id="bq" type="search" placeholder="Filter roster…" autocomplete="off"><span class="cnt" id="cnt"></span></div>
	<div class="grid" id="r"></div><h2>Suggested teams for you</h2><div id="res"></div><h2>Community teams you can (almost) build</h2><div id="cur"></div>`;
	const grid = document.getElementById("r");
	grid.innerHTML = c.list
		.slice()
		.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
		.map(
			(s) =>
				`<button type="button" class="card" data-s="${s.slug}" data-n="${esc((s.name + " " + s.title).toLowerCase())}"><span class="im"><img loading="lazy" width="110" height="110" src="${img(s.icon)}" alt=""><span class="a">${attrImg(s.attribute)}</span><span class="r">${roleImg(s.role)}</span><em class="t" style="background:${TIER_COLOR[s.tier]}">${s.tier}</em></span><span class="meta"><b>${esc(s.name)}</b><small>${esc(s.title)}</small></span></button>`,
		)
		.join("");
	const run = () => {
		grid.querySelectorAll(".card").forEach((el) => {
			el.classList.toggle("owned", owned.has(el.dataset.s));
			const tier = c.by[el.dataset.s].ratings[mode],
				badge = el.querySelector(".t");
			badge.textContent = tier;
			badge.style.background = TIER_COLOR[tier];
			badge.title = `${mode === "pve" ? "PvE" : "PvP"} tier`;
		});
		[...grid.querySelectorAll(".card")]
			.sort(
				(a, b) =>
					TIER_ORDER.indexOf(c.by[a.dataset.s].ratings[mode]) -
					TIER_ORDER.indexOf(c.by[b.dataset.s].ratings[mode]),
			)
			.forEach((el) => grid.appendChild(el));
		document.getElementById("cnt").textContent = `${owned.size} owned`;
		const best = bestTeams(owned, c, mode);
		document.getElementById("res").innerHTML = best.length
			? best
					.map(
						(r, i) =>
							`<div class="panel"><span class="score">Estimate ${r.sc.toFixed(1)}</span><b>Team ${i + 1}</b> <span class="muted">${r.why.join(" · ")}</span>${teamRow(
								c,
								r.team.map((m) => m.slug),
							)}<ul>${metaNote(r, c, mode)
								.map((n) => `<li>${esc(n)}</li>`)
								.join("")}</ul></div>`,
					)
					.join("")
			: '<p class="muted">Select at least 3 saviors.</p>';
		const cur = T.teams
			.map((t) => ({ t, have: t.members.filter((m) => owned.has(m)) }))
			.filter((x) => x.have.length >= 3)
			.sort((a, b) => b.have.length - a.have.length)
			.slice(0, 6);
		document.getElementById("cur").innerHTML =
			cur
				.map(({ t, have }) => {
					const miss = t.members.filter((m) => !owned.has(m));
					const used = new Set(t.members);
					const subs = miss.map((m) => {
						const alt = c.list
							.filter(
								(s) =>
									owned.has(s.slug) &&
									!used.has(s.slug) &&
									s.role === c.by[m].role,
							)
							.sort(
								(a, b) => TIER_VAL[b.ratings[mode]] - TIER_VAL[a.ratings[mode]],
							)[0];
						return `${c.by[m].name} → ${alt ? alt.name : "no same-role unit"}`;
					});
					return `<div class="panel"><b>${esc(t.name)}</b> <span class="tag">${have.length}/${t.members.length} owned</span><p class="muted">${esc(t.note)}</p>${teamRow(c, t.members, owned)}${miss.length ? `<p class="muted">Swap: ${esc(subs.join("; "))}</p>` : ""}</div>`;
				})
				.join("") || '<p class="muted">Select more saviors to see matches.</p>';
	};
	document.getElementById("builder-mode").onchange = (e) => {
		mode = e.target.value;
		run();
	};
	document.getElementById("bq").oninput = (e) => {
		const q = e.target.value.toLowerCase();
		grid
			.querySelectorAll(".card")
			.forEach(
				(el) => (el.style.display = el.dataset.n.includes(q) ? "" : "none"),
			);
	};
	grid.onclick = (e) => {
		e.preventDefault();
		const el = e.target.closest(".card");
		if (!el) return;
		const s = el.dataset.s;
		owned.has(s) ? owned.delete(s) : owned.add(s);
		saveOwned(owned);
		run();
	};
	document.getElementById("all").onclick = () => {
		c.list.forEach((s) => owned.add(s.slug));
		saveOwned(owned);
		run();
	};
	document.getElementById("none").onclick = () => {
		owned.clear();
		saveOwned(owned);
		run();
	};
	run();
}

function guidePage(k) {
	const g = GUIDES[k] || GUIDES.beginner;
	const grp = (n, t) =>
		`<h4>${t}</h4>${Object.entries(GUIDES)
			.filter(([, x]) => x.group === n)
			.map(
				([id, x]) =>
					`<a href="#/guide/${id}" class="${id === k ? "on" : ""}">${x.title}</a>`,
			)
			.join("")}`;
	app.innerHTML = `<div class="reader"><aside class="toc">${grp("start", "Start here")}${grp("systems", "Game systems")}<h4>On this page</h4><div id="sec"></div></aside><div><h1>${g.title}</h1><div class="prose tile">${g.html}</div></div></div>`;
	const sec = document.getElementById("sec");
	app.querySelectorAll(".prose h2").forEach((h, i) => {
		h.id = "s" + i;
		sec.insertAdjacentHTML(
			"beforeend",
			`<a href="#/guide/${k}" data-t="s${i}">${esc(h.textContent)}</a>`,
		);
	});
	sec.onclick = (e) => {
		const t = e.target.dataset?.t;
		if (!t) return;
		e.preventDefault();
		document.getElementById(t).scrollIntoView({ behavior: "smooth" });
	};
	document.title = `${g.title} — Star Savior Guide`;
}
async function potentials() {
	const [all, sv] = await Promise.all([
		load("data/potentials.json"),
		load("data/saviors.json"),
	]);
	const owner = Object.fromEntries(sv.map((s) => [s.id, s.name]));
	const cats = [...new Set(all.map((p) => p.category))];
	app.innerHTML = `<h1>Potentials <small class="muted">(${all.length})</small></h1><div class="fbar"><input id="q" type="search" placeholder="Search potentials…" autocomplete="off"><select id="c"><option value="">All categories</option>${cats.map((c) => `<option>${c}</option>`).join("")}</select></div><div id="l"></div>`;
	const draw = () => {
		const q = document.getElementById("q").value.toLowerCase(),
			c = document.getElementById("c").value;
		document.getElementById("l").innerHTML = all
			.filter(
				(p) =>
					(!c || p.category === c) &&
					(!q || (p.name + p.description).toLowerCase().includes(q)),
			)
			.map(
				(p) =>
					`<div class="panel pot"><img loading="lazy" src="${img(p.icon)}" alt=""><div><b>${esc(p.name)}</b> <span class="tag">${esc(p.category)}</span>${owner[p.character_id] ? `<a class="tag" href="#/savior/${sv.find((s) => s.id === p.character_id).slug}">${esc(owner[p.character_id])}</a>` : ""}<div class="muted">${rich(p.description)}</div></div></div>`,
			)
			.join("");
	};
	document.getElementById("q").oninput = draw;
	document.getElementById("c").onchange = draw;
	draw();
}

async function gearscore() {
	const g = await load("data/gearscore.json");
	const tbl = (head, rows) =>
		`<div class="panel"><table><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(typeof c === "number" ? +c.toFixed(2) : c)}</td>`).join("")}</tr>`).join("")}</table></div>`;
	app.innerHTML = `<h1>Gear Score</h1><h2>Substat weights</h2>${tbl(
		["Stat", "Roll range", "Weight", "Max GS"],
		g.substats.map((s) => [
			s.stat,
			`${s.min}–${s.max}${s.is_percent ? "%" : ""}`,
			s.weight,
			s.maxGs,
		]),
	)}
	<h2>Set values</h2>${tbl(
		["Set", "Pieces", "Bonus", "Total GS", "GS / piece"],
		g.sets.map((s) => [
			s.name,
			s.pieces,
			s.bonuses,
			s.gs_total,
			s.gs_per_piece,
		]),
	)}
	<h2>Ceilings by upgrade level</h2>${tbl(
		["Level", "Rolls", "Ceiling"],
		g.ceilings.map((c) => [c.level, c.rolls, c.ceiling]),
	)}`;
}

async function stories() {
	const D = await load("data/stories.json");
	const f = { kind: "", q: "" };
	const KIND = {
		main: "Main",
		event: "Events",
		savior: "Saviors",
		journey: "Journey",
	};
	app.innerHTML = `<div class="ph"><h1>Stories <small>(${D.stories.length})</small></h1><a class="muted" href="#/guide/story-guide">Story guide →</a></div>
	<div class="tile"><b>Overview</b><p style="margin:.3rem 0 0">${esc(D.overall)}</p></div>
	<div class="fbar"><input id="q" type="search" placeholder="Search stories…" autocomplete="off"><span class="fg" id="fk"></span><span class="cnt" id="cnt"></span></div><div class="grid wide" id="g"></div>`;
	const draw = () => {
		const q = f.q.toLowerCase();
		const rows = D.stories.filter(
			(x) =>
				(!f.kind || x.kind === f.kind) &&
				(!q || (x.name + x.label).toLowerCase().includes(q)),
		);
		document.getElementById("g").innerHTML =
			rows
				.map(
					(x) =>
						`<a class="card" href="#/story/${x.slug}"><span class="im"><img loading="lazy" width="170" height="170" src="${img(x.thumb)}" alt=""></span><span class="meta"><b>${esc(x.name)}</b><small>${esc(x.label)} · ${x.chapters.length} ch</small></span></a>`,
				)
				.join("") || '<p class="muted">No matches.</p>';
		setCount(rows.length);
	};
	chips(
		document.getElementById("fk"),
		Object.keys(KIND),
		f,
		"kind",
		draw,
		(v) => KIND[v],
	);
	document.getElementById("q").oninput = (e) => (
		(f.q = e.target.value),
		draw()
	);
	draw();
}
async function story(slug) {
	const [D, c] = await Promise.all([load("data/stories.json"), ctx()]);
	const x = D.stories.find((s) => s.slug === slug);
	if (!x) return (app.innerHTML = '<p class="muted">Story not found.</p>');
	const idx = D.stories.indexOf(x);
	const sav = x.savior && c.by[x.savior];
	app.innerHTML = `<a class="back" href="#/stories">← All stories</a><div class="detail"><div><img class="art" src="${img(sav ? sav.portrait : x.thumb)}" alt=""></div><div>
	<h1>${esc(x.name)} <small class="muted">${esc(x.label)}</small></h1>
	${x.blurb ? `<p class="lead">${esc(x.blurb)}</p>` : ""}
	<div class="tile"><b>Summary</b><p>${esc(x.summary || (sav ? `${sav.name}'s personal story: ${x.chapters.length} short chapters that show who ${sav.name} is outside of battle. Read it after you have the savior; chapter titles below hint at the themes.` : `An ${x.kind === "event" ? "event" : ""} story with ${x.chapters.length} chapters (about ${x.lines.toLocaleString()} lines of dialogue). Chapter titles are listed below; no plot details are given here to avoid spoilers.`))}</p>
	${sav ? `<p><a href="#/savior/${sav.slug}">Open ${esc(sav.name)}'s guide →</a></p>` : ""}</div>
	<h2>Chapters</h2><div class="tile"><table><tr><th>#</th><th>Title</th><th>Lines</th></tr>${x.chapters.map((ch) => `<tr><td>${ch.n}${ch.k || ""}</td><td>${esc(ch.t)}${ch.s ? `<p class="muted">${esc(ch.s)}</p>` : ""}</td><td>${ch.l}</td></tr>`).join("")}</table>
	<p class="muted">S = story scene, E = ending part of the same chapter.</p></div>
	<p>${idx > 0 ? `<a href="#/story/${D.stories[idx - 1].slug}">← ${esc(D.stories[idx - 1].name)}</a>` : ""} ${idx < D.stories.length - 1 ? ` · <a href="#/story/${D.stories[idx + 1].slug}">${esc(D.stories[idx + 1].name)} →</a>` : ""}</p></div></div>`;
	document.title = `${x.name} — Star Savior Guide`;
}

async function enemies() {
	const E = await load("data/enemies.json");
	const f = { q: "", grade: "", attr: "" };
	app.innerHTML = `<div class="ph"><h1>Enemies <small>(${E.length})</small></h1></div>
	<div class="fbar"><input id="q" type="search" placeholder="Search enemy or faction…" autocomplete="off"><span class="fg" id="fg"></span><span class="fg" id="fa"></span><span class="cnt" id="cnt"></span></div><div id="l"></div>`;
	const draw = () => {
		const q = f.q.toLowerCase();
		const all = E.filter(
			(e) =>
				(!f.grade || e.grade === f.grade) &&
				(!f.attr || e.attr === f.attr) &&
				(!q || (e.name + (e.faction || "")).toLowerCase().includes(q)),
		);
		const rows = all.slice(0, 60);
		setCount(all.length);
		document.getElementById("l").innerHTML =
			rows
				.map(
					(
						e,
					) => `<details class="panel"><summary><img class="sm" loading="lazy" src="${img(e.icon)}" alt=""> <b>${esc(e.name)}</b> <span class="tag">${esc(e.grade)}</span>${e.attr ? `<span class="tag">${attrImg(e.attr)}${esc(e.attr)}</span>` : ""}<span class="tag">${esc(e.role || "")}</span> <small class="muted">${esc(e.faction || "")} · HP ${fmt(e.hp)} · ATK ${fmt(e.atk)} · SPD ${e.spd}</small></summary>
		<p class="muted">${esc(e.desc)}</p><div class="stats"><div><span>HP</span><b>${fmt(e.hp)}</b></div><div><span>ATK</span><b>${fmt(e.atk)}</b></div><div><span>DEF</span><b>${fmt(e.def)}</b></div><div><span>SPD</span><b>${e.spd}</b></div><div><span>Toughness</span><b>${e.tough}</b></div></div>
		${e.skills.map((k) => `<div class="pot"><img loading="lazy" src="${img(k.icon)}" alt=""><div><b>${esc(k.name)}</b> <span class="muted">${esc(k.type)} · ${esc(k.target || "")}</span><div>${esc(k.desc)}</div></div></div>`).join("")}${e.imm.length ? `<p class="muted">Immune: ${e.imm.map(esc).join(", ")}</p>` : ""}</details>`,
				)
				.join("") +
			(all.length > 60
				? `<p class="muted">Showing 60 of ${all.length}. Narrow with search or filters.</p>`
				: "");
	};
	chips(document.getElementById("fg"), ["Boss", "Normal"], f, "grade", draw);
	iconChips(document.getElementById("fa"), ATTRS, f, "attr", draw, attrImg);
	document.getElementById("q").oninput = (e) => (
		(f.q = e.target.value),
		draw()
	);
	draw();
}
async function sectors() {
	const S = await load("data/sectors.json");
	const f = { mode: "" };
	app.innerHTML = `<h1>Sectors <small class="muted">(${S.length})</small></h1><p class="lead">Stage list for the main PvE sectors. See <a href="#/guide/systems-modes">Game modes</a> for rules.</p><div class="fbar"><span class="fg" id="fm"></span></div><div class="tile"><table id="t"></table></div>`;
	const draw = () => {
		document.getElementById("t").innerHTML =
			`<tr><th>#</th><th>Sector</th><th>Mode</th><th>Stages</th><th>Max battle level</th></tr>` +
			S.filter((x) => !f.mode || x.mode === f.mode)
				.map(
					(x) =>
						`<tr><td>${x.sector}</td><td>${esc(x.name)}</td><td>${x.mode}</td><td>${x.stages}</td><td>${fmt(x.max_battle_level)}</td></tr>`,
				)
				.join("");
	};
	chips(document.getElementById("fm"), ["Normal", "Hard"], f, "mode", draw);
	draw();
}

async function db() {
	app.innerHTML = `<h1>Database</h1><div class="cards">
	<a href="#/saviors"><b>Saviors</b><span>59 profiles, skills, stats</span></a><a href="#/arcana"><b>Arcana</b><span>85 cards with tiers</span></a><a href="#/potentials"><b>Potentials</b><span>188 potentials</span></a>
	<a href="#/enemies"><b>Enemies</b><span>211 enemies and bosses</span></a><a href="#/sectors"><b>Sectors</b><span>85 PvE sectors</span></a><a href="#/gearscore"><b>Gear score</b><span>Substat weights</span></a>
	<a href="#/guide/systems-equipment"><b>Equipment</b><span>Slots and sets</span></a><a href="#/stories"><b>Stories</b><span>84 stories</span></a></div>
	<h2>Game systems guides</h2><div class="cards">${Object.entries(GUIDES)
		.filter(([, g]) => g.group === "systems")
		.map(
			([id, g]) =>
				`<a href="#/guide/${id}"><b>${g.title}</b><span>Read guide</span></a>`,
		)
		.join("")}</div>`;
}

// ---- Quick search (press / or Ctrl+K) ----
const qs = document.getElementById("qs");
let qsIndex = null;
async function buildIndex() {
	if (qsIndex) return qsIndex;
	const [c, A, D, E] = await Promise.all([
		ctx(),
		load("data/arcana.json"),
		load("data/stories.json"),
		load("data/enemies.json"),
	]);
	qsIndex = [
		...c.list.map((s) => ({
			g: "Saviors",
			t: s.name,
			d: `${s.title} · ${s.attribute} ${s.role}`,
			h: `#/savior/${s.slug}`,
			i: s.icon,
		})),
		...Object.entries(GUIDES).map(([id, x]) => ({
			g: "Guides",
			t: x.title,
			d: x.group === "systems" ? "Game systems" : "Guide",
			h: `#/guide/${id}`,
			i: "images/ui/attr_sun.webp",
		})),
		...A.arcana
			.filter((a) => a.grade !== "R")
			.map((a) => ({
				g: "Arcana",
				t: a.name,
				d: `${a.savior} · ${a.stat}`,
				h: "#/arcana",
				i: a.card,
			})),
		...D.stories.map((x) => ({
			g: "Stories",
			t: x.name,
			d: x.label,
			h: `#/story/${x.slug}`,
			i: x.thumb,
		})),
		...E.filter((e) => e.grade === "Boss").map((e) => ({
			g: "Enemies",
			t: e.name,
			d: e.faction || "",
			h: "#/enemies",
			i: e.icon,
		})),
	].map((x) => ({ ...x, k: (x.t + " " + x.d).toLowerCase() }));
	return qsIndex;
}
const qsClose = () => qs.classList.remove("open");
async function qsOpen() {
	qs.classList.add("open");
	const inp = qs.querySelector("input");
	inp.value = "";
	inp.focus();
	await buildIndex();
	qsDraw("");
}
function qsDraw(q) {
	if (!qsIndex) return;
	q = q.toLowerCase().trim();
	const hits = (
		q
			? qsIndex.filter((x) => q.split(/\s+/).every((w) => x.k.includes(w)))
			: qsIndex
					.filter((x) => x.g === "Guides" || x.g === "Saviors")
					.slice(0, 12)
	).slice(0, 40);
	let last = "";
	qs.querySelector(".res").innerHTML =
		hits
			.map(
				(x) =>
					(x.g !== last ? `<h5>${(last = x.g)}</h5>` : "") +
					`<a href="${x.h}"><img loading="lazy" src="${img(x.i)}" alt=""><span><b>${esc(x.t)}</b></span><small>${esc(x.d)}</small></a>`,
			)
			.join("") || '<p class="muted" style="padding:.8rem">No results.</p>';
	const first = qs.querySelector(".res a");
	if (first) first.classList.add("sel");
}
qs.addEventListener("click", (e) => {
	if (e.target === qs || e.target.closest(".res a")) qsClose();
});
qs.querySelector("input").addEventListener("input", (e) =>
	qsDraw(e.target.value),
);
qs.querySelector("input").addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		const a = qs.querySelector(".res a");
		if (a) {
			location.hash = a.getAttribute("href");
			qsClose();
		}
	}
});
document.getElementById("sbtn").onclick = qsOpen;
addEventListener("keydown", (e) => {
	if (e.key === "Escape") qsClose();
	else if (
		(e.key === "/" &&
			!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) ||
		((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")
	) {
		e.preventDefault();
		qsOpen();
	}
});

async function route() {
	const [, r, a] = location.hash.slice(1).split("/");
	document
		.querySelectorAll("#nav a")
		.forEach((n) =>
			n.classList.toggle(
				"on",
				n.dataset.r ===
					(r === "savior"
						? "saviors"
						: r === "story"
							? "stories"
							: ["potentials", "gearscore", "enemies", "sectors"].includes(r)
								? "db"
								: r || ""),
			),
		);
	document.title = "Star Savior Guide — Characters, Tier List & Database";
	try {
		await (
			{
				saviors,
				tiers,
				teams,
				builder,
				arcana,
				potentials,
				gearscore,
				stories,
				enemies,
				sectors,
				db,
				savior: () => savior(a),
				story: () => story(a),
				guide: () => guidePage(a),
			}[r] || home
		)();
		window.scrollTo(0, 0);
	} catch (e) {
		app.innerHTML = `<p class="muted">Failed to load: ${esc(e.message)}</p>`;
		console.error(e);
	}
}
addEventListener("hashchange", route);
route();
