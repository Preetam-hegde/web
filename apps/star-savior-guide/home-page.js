'use strict';
// Home page with a "Top guides" image row. Loaded after app.js; replaces home().
const HOME_GUIDES = [
	['beginner', 'ARCANA_DRESS_STRANIS_SSR_01_S', 'Start here: what to do in your first week.'],
	['team-building', 'ARCANA_MAID_TWOHANDER_SSR_01_S', 'Roles, positions and ready-made teams.'],
	['journey', 'ARCANA_EASTERN_SWORDMASTER_SSR_01_S', 'Train stats, pick arcana, hit S rank.'],
	['meta', 'ARCANA_BUNNY_KNIGHT_SSR_01_S', 'What is strong right now.'],
	['systems-break', 'ARCANA_STARPIERCER_OMEGA_SSR_01_S', 'Toughness, Break Skills and Nova Burst.'],
	['systems-pvp', 'ARCANA_SUMMER_ORACLE_SSR_01_S', 'Ladders, rotation ban and team ideas.'],
	['systems-modes', 'ARCANA_INDEPENDENT_DRAGON_SSR_01_S', 'Cosmo Gate, Corridor, Cube Palace, Flash Point.'],
	['systems-equipment', 'ARCANA_WEST_BEAMSWORD_SSR_01_S', 'Sets, main stats and gear score.'],
];
async function home() {
	const { list } = await ctx();
	const top = list.filter((s) => s.tier === 'S+');
	const L = (href, ico, t, d) => `<a href="${href}"><img src="${ico}" alt=""><div><b>${t}</b><span>${d}</span></div></a>`;
	const NEWS = [["apostle-gille", "new-gille", "ILLUST_BG_JOURNEY_APOSTLE_GILLE_01", "Break support: turns your allies' breaks into damage."], ["dark-unknown", "new-witch-asherah", "ILLUST_BG_JOURNEY_DARK_UNKNOWN_01", "Boss-break striker with a reset loop."]];
	const newCards = NEWS.filter(([, g]) => GUIDES[g]).map(([slug, g, bg, d]) => { const s = list.find((x) => x.slug === slug); return `<a class="newcard" href="#/guide/${g}"><img loading="lazy" width="640" height="360" src="images/journey_bg/${bg}.webp" alt=""><span class="nbadge">NEW</span><div class="ntxt"><b>${esc(s.name)} <small>${esc(s.title)}</small></b><span>${esc(d)}</span><span class="nchips"><span><img src="images/ui/attr_${s.attribute.toLowerCase()}.webp" alt="">${s.attribute}</span><span><img src="images/ui/role_${s.role.toLowerCase()}.webp" alt="">${s.role}</span><span class="nteams">Theoretical best teams inside</span></span></div><img class="nport" loading="lazy" src="${s.portrait.replace(/^\//, "")}" alt=""></a>`; }).join("");
	const guides = HOME_GUIDES.filter(([k]) => GUIDES[k]).map(([k, im, d]) => `<a class="gcard" href="#/guide/${k}"><img loading="lazy" width="480" height="264" src="images/arcana/${im}.webp" alt=""><div><b>${esc(GUIDES[k].title)}</b><span>${esc(GUIDES[k].sub || d)}</span></div></a>`).join('');
	app.innerHTML = `<div class="hero"><h1>Hi, Captain</h1><p class="lead">Fast, read-first Star Savior reference: saviors, tier list, teams, arcana, stories and game-system guides. Press <b>/</b> to search anything.</p><div class="pager"><i></i><i></i><i></i></div></div>
	${newCards ? `<div class="ph"><h2>New saviors</h2><a class="muted" href="#/guide/new-gille">Read the guides →</a></div><div class="newrow">${newCards}</div>` : ""}
	<div class="ph"><h2>Top guides</h2><a class="muted" href="#/guide/beginner">All guides →</a></div><div class="gtop">${guides}</div>
	<h2>Jump to</h2><div class="cards">
	${L('#/tiers', 'images/ui/role_striker.webp', 'Tier List', 'PvE / PvP, kit conditions')}${L('#/builder', 'images/ui/role_supporter.webp', 'Team Builder', 'Pick what you own')}${L('#/teams', 'images/ui/role_defender.webp', 'Best Teams', '22 teams by attribute')}
	${L('#/saviors', 'images/ui/attr_star.webp', 'Saviors', list.length + ' profiles + guides')}${L('#/arcana', 'images/jstats/AB_UNIT_STAT_POWER.webp', 'Arcana', 'Cards and tiers')}${L('#/stories', 'images/ui/attr_moon.webp', 'Stories', 'Main, events, savior')}
	${L('#/enemies', 'images/ui/role_assassin.webp', 'Enemies', '211 enemies')}${L('#/db', 'images/ui/attr_order.webp', 'Database', 'Potentials, gear, sectors')}${L('#/guide/story-guide', 'images/ui/attr_chaos.webp', 'Story guide', 'Reading order')}</div>
	<h2>PvE S+ saviors</h2><div class="grid">${top.map(sCard).join('')}</div>`;
	document.title = 'Star Savior Guide — Characters, Tier List & Database';
}
if (!location.hash || location.hash === '#/' || location.hash === '#') route();
