'use strict';

/*
 * Shared "teaching card" renderer used by the DSA and AI/ML study guides.
 * Content lives in per-chapter files (js/materials/*.js) that call Teach.add({...}).
 * One material per lesson id:
 *   kid       { emoji, story, say[] }               explain-like-I'm-5
 *   real      { title, scenario, result }           one concrete example with numbers
 *   diagram   { type: flow|bars|compare, ... }      drawn with HTML/CSS, no images
 *   principle { name, rule, why }                   the design principle behind it
 *   design    { problem, choice, price }            why it is built this way
 *   edges     [[case, what happens, guard]]         boundary cases
 *   links     [[lessonId, why]]                     "seen before" references
 *   lab       { read[], predict }                   how to read the visual lab (optional)
 * Any text may contain {{lesson-id}} to link to another lesson instead of repeating it.
 */
const Teach = (() => {
	const store = {};
	let resolve = () => null; // id -> { title, href } | null
	const esc = (v) =>
		String(v).replace(
			/[&<>"']/g,
			(c) =>
				({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
		);
	// Escape first, then turn {{id}} into a link; unknown ids stay plain text.
	const fmt = (text) =>
		esc(text).replace(/\{\{([a-z0-9-]+)\}\}/g, (m, id) => {
			const t = resolve(id);
			return t ? `<a class="seen-link" href="${t.href}">${esc(t.title)}</a>` : id;
		});

	function diagram(d) {
		let body = '';
		if (d.type === 'bars') {
			const max = Math.max(...d.items.map((i) => i[1]));
			body = `<div class="dg-bars">${d.items
				.map(
					([label, value, text]) =>
						`<div><span>${fmt(label)}</span><i style="--w:${Math.max(3, (value / max) * 100)}%"></i><b>${fmt(text || value)}</b></div>`,
				)
				.join('')}</div>`;
		} else if (d.type === 'compare') {
			body = `<div class="dg-compare">${[d.left, d.right]
				.map(
					([title, lines]) =>
						`<div><h5>${fmt(title)}</h5><ul>${lines.map((l) => `<li>${fmt(l)}</li>`).join('')}</ul></div>`,
				)
				.join('')}</div>`;
		} else {
			body = `<ol class="dg-flow">${d.nodes
				.map(
					([label, sub]) =>
						`<li><b>${fmt(label)}</b>${sub ? `<span>${fmt(sub)}</span>` : ''}</li>`,
				)
				.join('')}</ol>${d.loop ? `<p class="dg-loop">↺ ${fmt(d.loop)}</p>` : ''}`;
		}
		return `<figure class="dg"><figcaption>${fmt(d.title)}</figcaption>${body}${d.caption ? `<p class="dg-note">${fmt(d.caption)}</p>` : ''}</figure>`;
	}

	// The explain-like-I'm-5 card on its own (the visual lab uses this one).
	function kid(id, domId = 'like-5') {
		const m = store[id];
		if (!m) return '';
		return `<section class="eli5 teach-kid"${domId ? ` id="${domId}"` : ''}><div class="eli5-head"><span class="eli5-emoji" aria-hidden="true">${esc(m.kid.emoji)}</span><b>Explain it like I'm 5</b></div><p>${fmt(m.kid.story)}</p><ol>${m.kid.say.map((s) => `<li>${fmt(s)}</li>`).join('')}</ol></section>`;
	}

	// Top of the lesson: the simplest possible version, a real example, a picture.
	function intro(id) {
		const m = store[id];
		if (!m) return '';
		return `${kid(id)}
		<section class="lesson-section" id="real-example"><p class="eyebrow">A proper example</p><h3>${fmt(m.real.title)}</h3><p>${fmt(m.real.scenario)}</p><div class="study-callout"><b>What it shows</b><p>${fmt(m.real.result)}</p></div></section>
		<section class="lesson-section" id="diagram"><p class="eyebrow">The picture</p>${diagram(m.diagram)}</section>`;
	}

	// Middle of the lesson: why it is designed this way, where it breaks, what to revisit.
	function design(id) {
		const m = store[id];
		if (!m) return '';
		const links = m.links.length
			? `<section class="lesson-section"><p class="eyebrow">Seen this before?</p><h3>Related lessons</h3><ul class="seen-list">${m.links
					.map(([to, why]) => {
						const t = resolve(to);
						return t
							? `<li><a href="${t.href}">${esc(t.title)} →</a><span>${fmt(why)}</span></li>`
							: '';
					})
					.join('')}</ul></section>`
			: '';
		return `<section class="lesson-section" id="design"><p class="eyebrow">Design principle</p><h3>${fmt(m.principle.name)}</h3><p>${fmt(m.principle.rule)}</p><p>${fmt(m.principle.why)}</p>
		<div class="design-grid"><div><h4>The problem</h4><p>${fmt(m.design.problem)}</p></div><div><h4>The design choice</h4><p>${fmt(m.design.choice)}</p></div><div><h4>The price you pay</h4><p>${fmt(m.design.price)}</p></div></div></section>
		<section class="lesson-section" id="boundary"><p class="eyebrow">Where it can break</p><h3>Boundary cases</h3><div class="study-table-wrap" tabindex="0" role="region" aria-label="Scrollable boundary cases"><table class="study-table"><thead><tr><th scope="col">Case</th><th scope="col">What happens</th><th scope="col">Guard</th></tr></thead><tbody>${m.edges.map((r) => `<tr>${r.map((c) => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>${links}`;
	}

	// Under the visual lab: how to read it and what to predict.
	function labHelp(id) {
		const m = store[id];
		if (!m || !m.lab) return '';
		return `<div class="lab-help"><h3>How to read this picture</h3><ul>${m.lab.read.map((r) => `<li>${fmt(r)}</li>`).join('')}</ul><p><b>Try this:</b> ${fmt(m.lab.predict)}</p></div>`;
	}

	// Roadmap: stages of topics; a topic with a lesson id links to it, others are shown dashed.
	let road = null;
	function roadmap() {
		if (!road) return '';
		const all = road.stages.flatMap((st) => st.topics);
		const have = all.filter((t) => t[1] && resolve(t[1])).length;
		return `<section class="lesson-section roadmap" id="roadmap"><p class="eyebrow">Roadmap</p><h3>${esc(road.title)}</h3><p>${fmt(road.intro)} <a href="${road.url}" target="_blank" rel="noopener noreferrer">${esc(road.source)} ↗</a></p><p class="rm-count"><b>${have}</b> of <b>${all.length}</b> roadmap topics have a lesson here; the rest are prerequisites or overviews.</p><ol class="rm-stages">${road.stages
			.map(
				(st, i) =>
					`<li><span class="rm-n">${i + 1}</span><div><h4>${esc(st.title)}</h4><div class="rm-chips">${st.topics
						.map(([label, id, note]) => {
							const t = id && resolve(id);
							return t
								? `<a class="rm-chip" href="${t.href}" title="${esc(t.title)}">${esc(label)}</a>`
								: `<span class="rm-chip rm-ext" title="${esc(note || 'Not a separate lesson in this guide')}">${esc(label)}</span>`;
						})
						.join('')}</div></div></li>`,
			)
			.join('')}</ol><p class="rm-key"><span class="rm-chip">linked</span> opens a lesson · <span class="rm-chip rm-ext">dashed</span> is outside this guide (hover for why)</p></section>`;
	}

	// For tests: every lesson id needs a complete material whose links resolve.
	function problems(ids, labs = false) {
		const bad = [];
		for (const id of ids) {
			const m = store[id];
			if (!m) {
				bad.push(id + ': no material');
				continue;
			}
			const need = [
				m.kid && m.kid.story && m.kid.say && m.kid.say.length >= 3,
				m.real && m.real.scenario && m.real.result,
				m.diagram && m.diagram.title,
				m.principle && m.principle.rule && m.principle.why,
				m.design && m.design.problem && m.design.choice && m.design.price,
				m.edges && m.edges.length >= 3 && m.edges.every((r) => r.length === 3),
				m.links && m.links.length >= 2,
				!labs || (m.lab && m.lab.read.length && m.lab.predict),
			];
			if (need.includes(false) || need.some((v) => !v)) bad.push(id + ': incomplete');
			for (const [to] of m.links || [])
				if (!ids.includes(to)) bad.push(id + ': bad link ' + to);
			const text = JSON.stringify(m);
			for (const t of text.matchAll(/\{\{([a-z0-9-]+)\}\}/g))
				if (!ids.includes(t[1])) bad.push(id + ': bad {{}} ' + t[1]);
		}
		for (const id of Object.keys(store))
			if (!ids.includes(id)) bad.push(id + ': material without lesson');
		return bad;
	}

	// For tests: roadmap ids must be real lessons, and every lesson must appear on the roadmap.
	function roadmapProblems(ids) {
		const bad = [];
		const used = new Set();
		for (const st of road.stages)
			for (const [label, id] of st.topics) {
				if (id && !ids.includes(id)) bad.push(label + ': unknown lesson ' + id);
				if (id) used.add(id);
			}
		for (const id of ids) if (!used.has(id)) bad.push(id + ': not on the roadmap');
		return bad;
	}

	return {
		roadmap,
		roadmapProblems,
		setRoadmap: (r) => (road = r),
		problems,
		store,
		add: (batch) => Object.assign(store, batch),
		setResolver: (fn) => (resolve = fn),
		kid,
		intro,
		design,
		labHelp,
		fmt,
	};
})();
