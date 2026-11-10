'use strict';

(() => {
	const C = AICourse,
		V = AIViews;
	const $ = (id) => document.getElementById(id);
	const escape = V.escape;
	const storageKey = 'ai-ml-visualizer-progress-v1';
	const validIds = new Set(C.lessons.map((lesson) => lesson.id));
	const validQuestions = new Set(
		C.lessons.flatMap((lesson) =>
			lesson.interview.map((_, i) => `${lesson.id}:${i}`),
		),
	);
	const state = {
		lesson: null,
		params: {},
		frames: [],
		index: 0,
		timer: null,
		tab: 'story',
		mode: 'learn',
		completed: new Set(),
		ratings: Object.create(null),
	};
	try {
		const saved = JSON.parse(localStorage.getItem(storageKey));
		if (saved && Array.isArray(saved.completed))
			state.completed = new Set(
				saved.completed.filter((id) => validIds.has(id)),
			);
		if (saved && saved.ratings && typeof saved.ratings === 'object') {
			for (const [key, value] of Object.entries(saved.ratings)) {
				if (validQuestions.has(key) && ['review', 'ready'].includes(value))
					state.ratings[key] = value;
			}
		}
	} catch {
		$('save-status').textContent =
			'Saved progress could not be read. You can still study in this session.';
	}
	function saveProgress() {
		try {
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					completed: [...state.completed],
					ratings: state.ratings,
				}),
			);
			$('save-status').textContent = 'Progress saved in this browser.';
		} catch {
			$('save-status').textContent =
				'Browser storage is unavailable. Progress will last for this session.';
		}
	}
	function pause() {
		clearInterval(state.timer);
		state.timer = null;
		$('btn-play').textContent = '▶';
		$('btn-play').setAttribute('aria-label', 'Play');
	}
	function play() {
		if (state.timer) return pause();
		if (state.index === state.frames.length - 1) state.index = 0;
		$('btn-play').textContent = 'Ⅱ';
		$('btn-play').setAttribute('aria-label', 'Pause');
		renderFrame();
		state.timer = setInterval(
			() => {
				state.index++;
				renderFrame();
				if (state.index === state.frames.length - 1) pause();
			},
			1100 / Number($('speed').value),
		);
	}
	function goToFrame(index) {
		pause();
		state.index = Math.max(0, Math.min(state.frames.length - 1, index));
		renderFrame();
	}
	function renderFrame() {
		const result = V.render(
			state.lesson,
			state.params,
			state.index,
			state.frames,
		);
		$('stage').innerHTML = result.svg;
		$('narration').textContent = result.note;
		$('stats').innerHTML = result.stats
			.map(
				([label, value]) =>
					`<div class="stat"><span>${escape(label)}</span><b>${escape(value)}</b></div>`,
			)
			.join('');
		$('scrub').max = state.frames.length - 1;
		$('scrub').value = state.index;
		$('scrub').setAttribute(
			'aria-valuetext',
			`Step ${state.index + 1} of ${state.frames.length}: ${result.note}`,
		);
		$('step-count').textContent = `${state.index + 1} / ${state.frames.length}`;
		$('btn-first').disabled = $('btn-prev').disabled = state.index === 0;
		$('btn-last').disabled = $('btn-next').disabled =
			state.index === state.frames.length - 1;
		document
			.querySelectorAll('.story-steps li')
			.forEach((li, i) => li.classList.toggle('active', i === result.phase));
	}
	function renderControls() {
		const descriptors = V.controls(state.lesson);
		$('controls').replaceChildren();
		if (!descriptors.length) {
			const hint = document.createElement('p');
			hint.className = 'ctl-hint';
			hint.textContent =
				'Step through the idea. Read the story, then explain it in your own words.';
			$('controls').append(hint);
		}
		for (const control of descriptors) {
			state.params[control.key] = control.value;
			const label = document.createElement('label');
			label.className = 'ctl';
			const heading = document.createElement('span');
			heading.className = 'ctl-label';
			heading.textContent = control.label;
			const input = document.createElement(
				control.type === 'select' ? 'select' : 'input',
			);
			input.id = `experiment-${control.key}`;
			if (control.type === 'select') {
				for (const [value, title] of control.options)
					input.add(new Option(title, value));
			} else {
				input.type = 'range';
				input.min = control.min;
				input.max = control.max;
				input.step = control.step;
			}
			input.value = control.value;
			const output = document.createElement('output');
			output.htmlFor = input.id;
			output.textContent = control.type === 'range' ? control.value : '';
			heading.append(output);
			label.append(heading, input);
			$('controls').append(label);
			input.addEventListener(
				control.type === 'range' ? 'input' : 'change',
				() => {
					pause();
					state.params[control.key] =
						control.type === 'range' ? input.valueAsNumber : input.value;
					output.textContent = control.type === 'range' ? input.value : '';
					state.frames = V.build(state.lesson, state.params);
					state.index = Math.min(state.index, state.frames.length - 1);
					renderFrame();
				},
			);
		}
	}
	function renderProgress() {
		$('course-progress').textContent =
			`${state.completed.size} / ${C.lessons.length} understood · 8 chapters`;
		const done = state.completed.has(state.lesson.id);
		$('mark-complete').textContent = done
			? '✓ Understood · undo'
			: 'Mark as understood';
		$('mark-complete').setAttribute('aria-pressed', done);
	}
	function renderNav() {
		const query = $('lesson-search').value.trim().toLowerCase();
		const nav = $('nav');
		nav.replaceChildren();
		let count = 0;
		for (const group of C.groups) {
			const lessons = C.lessons.filter(
				(lesson) =>
					lesson.group === group.id &&
					(!query ||
						`${lesson.title} ${lesson.detail} ${lesson.interview.map((q) => q.q).join(' ')}`
							.toLowerCase()
							.includes(query)),
			);
			if (!lessons.length) continue;
			count += lessons.length;
			const open = Boolean(query) || state.lesson.group === group.id;
			const head = document.createElement('button');
			head.type = 'button';
			head.className = `nav-group${open ? ' open' : ''}`;
			head.setAttribute('aria-expanded', open);
			head.innerHTML = `<span>${escape(group.title)}</span><small>${escape(group.hint)}</small>`;
			head.addEventListener('click', () => selectLesson(lessons[0], true));
			nav.append(head);
			if (!open) continue;
			const list = document.createElement('div');
			list.className = 'nav-algos';
			for (const lesson of lessons) {
				const button = document.createElement('button');
				button.type = 'button';
				button.className = 'nav-algo';
				if (lesson.id === state.lesson.id)
					button.setAttribute('aria-current', 'page');
				button.innerHTML = `${state.completed.has(lesson.id) ? '<span class="done" aria-label="Understood">✓</span>' : ''}<span>${escape(lesson.title)}</span>`;
				button.addEventListener('click', () => {
					selectLesson(lesson, true);
					if (matchMedia('(max-width: 860px)').matches) {
						$('topic-menu').open = false;
						$('workspace').focus({ preventScroll: true });
						$('workspace').scrollIntoView({ block: 'start' });
					}
				});
				list.append(button);
			}
			nav.append(list);
		}
		if (!count)
			nav.innerHTML =
				'<p class="empty-state">No concepts match. Try “gradient”, “data”, or “attention”.</p>';
		$('lesson-total').textContent = `${count} lesson${count === 1 ? '' : 's'}`;
	}
	function renderQuestion(lesson, q, index, practice = false) {
		const key = `${lesson.id}:${index}`,
			rating = state.ratings[key];
		return `<details class="question" data-question="${key}"><summary>${escape(q.q)}${practice ? `<small>${escape(lesson.title)}${rating ? ` · ${rating === 'ready' ? 'Confident' : 'Needs practice'}` : ''}</small>` : ''}</summary><p>${escape(q.a)}</p><p class="followup"><strong>Go deeper:</strong> ${escape(q.followup)}</p>${practice ? `<div class="review-actions"><button type="button" data-rating="review" aria-pressed="${rating === 'review'}">Needs practice</button><button type="button" data-rating="ready" aria-pressed="${rating === 'ready'}">Confident</button><a href="#${lesson.id}">Study this concept →</a></div>` : ''}</details>`;
	}
	function renderNotes() {
		const l = state.lesson;
		$('pane-story').innerHTML =
			`<div class="story-analogy"><strong>Picture this</strong><p>${escape(l.story)}</p></div><p>${escape(l.detail)}</p><h3>Step by step</h3><ol class="story-steps">${l.steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol><div class="pitfall"><h3>Watch out</h3><p>${escape(l.pitfall)}</p></div>`;
		$('pane-math').innerHTML =
			`<h3>The compact version</h3><code class="formula">${escape(l.formula)}</code><h3>Read the symbols</h3><p>${escape(l.symbols)}</p><div class="pitfall"><h3>What the equation leaves out</h3><p>${escape(l.pitfall)}</p></div>`;
		$('pane-code').innerHTML =
			`<p class="code-note">Python-style teaching snippet. Library imports, data setup, and helper names are abbreviated. Code is not executed here.</p><ol class="code-lines">${l.code
				.split('\n')
				.map((code) => `<li>${escape(code) || ' '}</li>`)
				.join('')}</ol><h3>Try it yourself</h3><p>${escape(l.challenge)}</p>`;
		$('pane-interview').innerHTML =
			`<p class="code-note">Answer aloud before opening the explanation.</p>${l.interview.map((q, i) => renderQuestion(l, q, i)).join('')}<p><a href="#interview">Practice across all chapters →</a></p>`;
		$('sources').innerHTML = l.sources
			.map(
				(key) =>
					`<li><a href="${C.sources[key].url}" target="_blank" rel="noopener noreferrer">${escape(C.sources[key].title)} ↗</a></li>`,
			)
			.join('');
		setTab(state.tab);
	}
	function setTab(tab, focus = false) {
		state.tab = tab;
		for (const button of document.querySelectorAll('[data-tab]')) {
			const selected = button.dataset.tab === tab;
			button.classList.toggle('on', selected);
			button.setAttribute('aria-selected', selected);
			button.tabIndex = selected ? 0 : -1;
			$(`pane-${button.dataset.tab}`).hidden = !selected;
			if (selected && focus) button.focus();
		}
	}
	function renderCheck() {
		$('challenge').textContent = state.lesson.challenge;
		$('check-question').textContent = state.lesson.check.q;
		$('quiz-feedback').textContent = '';
		$('check-options').replaceChildren();
		state.lesson.check.options.forEach((option, index) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'answer-btn';
			button.textContent = `${String.fromCharCode(65 + index)} · ${option}`;
			button.setAttribute('aria-pressed', 'false');
			button.addEventListener('click', () => {
				const correct = index === state.lesson.check.answer;
				for (const sibling of $('check-options').children) {
					sibling.setAttribute('aria-pressed', sibling === button);
					sibling.classList.remove('correct');
				}
				button.classList.toggle('correct', correct);
				$('quiz-feedback').textContent =
					`${correct ? 'That’s right.' : 'Try the reasoning again.'} ${state.lesson.check.explanation}`;
			});
			$('check-options').append(button);
		});
	}
	function selectLesson(lesson, updateHash = false) {
		pause();
		state.lesson = lesson;
		state.params = {};
		state.index = 0;
		const position = C.lessons.indexOf(lesson);
		$('stage-title').textContent = lesson.title;
		$('lesson-kicker').textContent = C.groups.find(
			(group) => group.id === lesson.group,
		).title;
		$('lesson-position').textContent =
			`LESSON ${String(position + 1).padStart(2, '0')} / ${C.lessons.length}`;
		$('lab-kind').textContent = lesson.lab
			? 'Interactive experiment'
			: 'Concept walkthrough';
		$('example-note').textContent = lesson.lab
			? 'Small synthetic examples for intuition. Hand-set vectors and filters are not trained models.'
			: 'Concept diagram · follows the lesson’s four steps; no model is being trained.';
		$('next-lesson').disabled = position === C.lessons.length - 1;
		renderControls();
		state.frames = V.build(lesson, state.params);
		renderNotes();
		renderFrame();
		renderNav();
		renderProgress();
		renderCheck();
		if (updateHash) location.hash = lesson.id;
	}
	function renderQuestions() {
		const query = $('interview-search').value.trim().toLowerCase(),
			group = $('interview-group').value,
			filter = $('review-filter').value;
		const open = new Set(
			[...$('questions').querySelectorAll('details[open]')].map(
				(element) => element.dataset.question,
			),
		);
		const matches = C.lessons
			.flatMap((lesson) =>
				lesson.interview.map((q, i) => ({
					lesson,
					q,
					i,
					key: `${lesson.id}:${i}`,
				})),
			)
			.filter(
				({ lesson, q, key }) =>
					(group === 'all' || lesson.group === group) &&
					(!query ||
						`${lesson.title} ${q.q} ${q.a} ${q.followup}`
							.toLowerCase()
							.includes(query)) &&
					(filter === 'all' ||
						(filter === 'new'
							? !state.ratings[key]
							: state.ratings[key] === filter)),
			);
		$('questions').innerHTML =
			matches
				.map(({ lesson, q, i }) => renderQuestion(lesson, q, i, true))
				.join('') ||
			'<p class="empty-state">No questions match these filters. Try another term or review status.</p>';
		$('questions')
			.querySelectorAll('details')
			.forEach((details) => {
				details.open = open.has(details.dataset.question);
			});
		const confident = Object.values(state.ratings).filter(
			(value) => value === 'ready',
		).length;
		$('question-count').textContent =
			`${matches.length} / 140 questions · ${confident} self-rated confident`;
	}
	function setMode(mode) {
		pause();
		state.mode = mode;
		$('learn-layout').hidden = mode !== 'learn';
		$('interview-view').hidden = mode !== 'interview';
		$('learn-mode').setAttribute('aria-pressed', mode === 'learn');
		$('interview-mode').setAttribute('aria-pressed', mode === 'interview');
		if (mode === 'interview') renderQuestions();
	}
	function followHash() {
		const id = location.hash.slice(1);
		if (id === 'interview') return setMode('interview');
		const lesson = C.lessons.find((item) => item.id === id) || C.lessons[0];
		if (state.lesson !== lesson) selectLesson(lesson);
		setMode('learn');
	}
	$('btn-play').addEventListener('click', play);
	$('btn-first').addEventListener('click', () => goToFrame(0));
	$('btn-prev').addEventListener('click', () => goToFrame(state.index - 1));
	$('btn-next').addEventListener('click', () => goToFrame(state.index + 1));
	$('btn-last').addEventListener('click', () =>
		goToFrame(state.frames.length - 1),
	);
	$('scrub').addEventListener('input', (event) =>
		goToFrame(event.target.valueAsNumber),
	);
	$('speed').addEventListener('change', () => {
		if (state.timer) {
			pause();
			play();
		}
	});
	$('lesson-search').addEventListener('input', () => {
		$('topic-menu').open = true;
		renderNav();
	});
	$('mark-complete').addEventListener('click', () => {
		if (state.completed.has(state.lesson.id))
			state.completed.delete(state.lesson.id);
		else state.completed.add(state.lesson.id);
		saveProgress();
		renderProgress();
		renderNav();
	});
	$('next-lesson').addEventListener('click', () => {
		const next = C.lessons[C.lessons.indexOf(state.lesson) + 1];
		if (next) {
			selectLesson(next, true);
			$('workspace').focus();
		}
	});
	$('learn-mode').addEventListener('click', () => {
		setMode('learn');
		location.hash = state.lesson.id;
	});
	$('interview-mode').addEventListener('click', () => {
		setMode('interview');
		location.hash = 'interview';
	});
	for (const element of [
		$('interview-search'),
		$('interview-group'),
		$('review-filter'),
	])
		element.addEventListener(
			element.tagName === 'INPUT' ? 'input' : 'change',
			renderQuestions,
		);
	C.groups.forEach((group) =>
		$('interview-group').add(new Option(group.title, group.id)),
	);
	$('questions').addEventListener('click', (event) => {
		const button = event.target.closest('[data-rating]');
		if (!button) return;
		const key = button.closest('[data-question]').dataset.question;
		if (state.ratings[key] === button.dataset.rating) delete state.ratings[key];
		else state.ratings[key] = button.dataset.rating;
		saveProgress();
		renderQuestions();
		const replacement = [
			...$('questions').querySelectorAll('[data-question]'),
		].find((details) => details.dataset.question === key);
		if (replacement)
			replacement
				.querySelector(`[data-rating="${button.dataset.rating}"]`)
				.focus();
	});
	const tabs = [...document.querySelectorAll('[data-tab]')];
	tabs.forEach((tab, index) => {
		tab.addEventListener('click', () => setTab(tab.dataset.tab));
		tab.addEventListener('keydown', (event) => {
			let next;
			if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
			if (event.key === 'ArrowLeft')
				next = (index + tabs.length - 1) % tabs.length;
			if (event.key === 'Home') next = 0;
			if (event.key === 'End') next = tabs.length - 1;
			if (next !== undefined) {
				event.preventDefault();
				setTab(tabs[next].dataset.tab, true);
			}
		});
	});
	document.addEventListener('keydown', (event) => {
		if (
			event.target.closest('#stage') &&
			$('stage').scrollWidth > $('stage').clientWidth
		)
			return;
		if (
			state.mode !== 'learn' ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.target.closest(
				'input, select, textarea, button, a, summary, [contenteditable="true"]',
			)
		)
			return;
		if (![' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
			return;
		event.preventDefault();
		if (event.key === ' ') play();
		if (event.key === 'ArrowLeft') goToFrame(state.index - 1);
		if (event.key === 'ArrowRight') goToFrame(state.index + 1);
		if (event.key === 'Home') goToFrame(0);
		if (event.key === 'End') goToFrame(state.frames.length - 1);
	});
	document.querySelector('.skip-link').addEventListener('click', (event) => {
		event.preventDefault();
		$('workspace').focus();
	});
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) pause();
	});
	window.addEventListener('hashchange', followHash);
	if (matchMedia('(max-width: 860px)').matches) $('topic-menu').open = false;
	selectLesson(
		C.lessons.find((lesson) => lesson.id === location.hash.slice(1)) ||
			C.lessons[0],
	);
	followHash();
})();
