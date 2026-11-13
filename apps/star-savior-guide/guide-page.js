"use strict";
// Prydwen-style guide page. Loaded after app.js; replaces guidePage() without touching app.js.
// Optional GUIDES fields (content.js): sub (one-line promise), updated (text), 
async function guidePage(k) {
	const g = GUIDES[k] || GUIDES.beginner;
	const keys = Object.keys(GUIDES);
	const idx = keys.indexOf(k in GUIDES ? k : "beginner");
	const grpName = g.group === 'systems' ? 'Game systems' : g.group === 'new' ? 'New saviors' : 'Guides';
	const T = await load("data/tiers.json");
	const updated = g.updated || (T && T.checked_at) || "";
	const grp = (n, t) =>
		`<h4>${t}</h4>${keys
			.filter((id) => GUIDES[id].group === n)
			.map(
				(id) =>
					`<a href="#/guide/${id}" class="${id === k ? "on" : ""}">${GUIDES[id].title}</a>`,
			)
			.join("")}`;
	const box = document.createElement("div");
	box.innerHTML = g.html;
	// Turn the first lead paragraph into a QUICK ANSWER box unless the guide already has a verdict.
	if (!box.querySelector(".g-verdict")) {
		const lead = box.querySelector("p.lead");
		if (lead) {
			lead.className = "g-verdict";
			lead.innerHTML = `<b>QUICK ANSWER</b><span>${lead.innerHTML}</span>`;
		}
	}
	const words = (box.textContent || "").trim().split(/\s+/).length;
	const mins = Math.max(1, Math.round(words / 200));
	const prev = idx > 0 ? keys[idx - 1] : null,
		next = idx < keys.length - 1 ? keys[idx + 1] : null;
	app.innerHTML = `<div id="gprog"></div><div class="reader"><aside class="toc">${grp("new", "New saviors")}${grp("start", "Start here")}${grp("systems", "Game systems")}<h4>On this page</h4><div id="sec"></div></aside>
	<article><header class="g-head"><nav class="g-crumb"><a href="#/">Star Savior</a> / <a href="#/guide/beginner">${grpName}</a> / ${esc(g.title)}</nav><h1 class="g-title">${esc(g.title)}</h1>${g.sub ? `<p class="g-sub">${esc(g.sub)}</p>` : ""}<div class="g-meta">${updated ? `<span>Last updated: ${esc(updated)}</span>` : ""}<span>${mins} min read</span></div></header>
	<div class="prose tile g-body">${box.innerHTML}</div>
	<div class="g-next">${prev ? `<a href="#/guide/${prev}"><small>Previous</small>${esc(GUIDES[prev].title)}</a>` : "<span></span>"}${next ? `<a href="#/guide/${next}"><small>Next</small>${esc(GUIDES[next].title)}</a>` : ""}</div></article></div>`;
	const sec = document.getElementById("sec");
	const hs = [...app.querySelectorAll(".g-body h2")];
	hs.forEach((h, i) => {
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
	// Number ordered lists as steps and highlight the section being read.
	app
		.querySelectorAll(".g-body ol")
		.forEach((ol) => ol.classList.add("g-steps"));
	app.querySelectorAll(".g-body table").forEach((t) => {
		if (t.rows[0] && t.rows[0].cells.length > 3) t.classList.add("wide-t");
	});
	const links = [...sec.querySelectorAll("a")];
	if ("IntersectionObserver" in window && hs.length) {
		const io = new IntersectionObserver(
			(es) =>
				es.forEach((e) => {
					if (e.isIntersecting)
						links.forEach((l) =>
							l.classList.toggle("on", l.dataset.t === e.target.id),
						);
				}),
			{ rootMargin: "-70px 0px -70% 0px" },
		);
		hs.forEach((h) => io.observe(h));
	}
	const bar = document.getElementById("gprog");
	const onScroll = () => {
		const d = document.documentElement;
		bar.style.width = `${Math.min(100, (d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight)) * 100)}%`;
	};
	if (window.__gscroll) removeEventListener("scroll", window.__gscroll);
	window.__gscroll = onScroll;
	addEventListener("scroll", onScroll, { passive: true });
	document.title = `${g.title} — Star Savior Guide`;
}
if (location.hash.startsWith("#/guide/")) route();
