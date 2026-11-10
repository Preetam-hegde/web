'use strict';

const AIGuide = (() => {
	const C = AICourse,
		D = AIStudyData,
		escape = AIViews.escape;
	Teach.setResolver((id) => {
		const l = C.lessons.find((item) => item.id === id);
		return l ? { title: l.title, href: `#study/${id}` } : null;
	});
	const table = (headings, rows) =>
		`<div class="study-table-wrap" tabindex="0" role="region" aria-label="Scrollable worked reference table"><table class="study-table"><thead><tr>${headings.map((h) => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
	const sources = (keys) =>
		`<ul class="source-list">${keys.map((key) => `<li><a href="${C.sources[key].url}" target="_blank" rel="noopener noreferrer">${escape(C.sources[key].title)} ↗</a></li>`).join('')}</ul>`;
	function resolveRoute(hash) {
		let path;
		try {
			path = decodeURIComponent(hash.replace(/^#/, '').split('?')[0]);
		} catch {
			return { mode: 'study', page: 'start' };
		}
		const params = new URLSearchParams(hash.split('?')[1] || '');
		if (path === 'interview' || path === 'study/questions')
			return {
				mode: 'questions',
				page: 'questions',
				topic: C.lessons.some((l) => l.id === params.get('topic'))
					? params.get('topic')
					: '',
				level: ['Easy', 'Medium', 'Hard'].includes(params.get('level'))
					? params.get('level')
					: '',
			};
		const lesson = C.lessons.find(
			(l) => path === l.id || path === `lab/${l.id}`,
		);
		if (lesson) return { mode: 'lab', page: lesson.id };
		const page = path.startsWith('study/') ? path.slice(6) : 'start';
		return {
			mode: 'study',
			page:
				['start', 'revision', 'resources'].includes(page) ||
				C.lessons.some((l) => l.id === page)
					? page
					: 'start',
		};
	}
	function renderNav(active, completed) {
		const link = (id, title, subtitle = '') =>
			`<a class="study-nav-link${id === active ? ' active' : ''}" href="#study/${id}"${id === active ? ' aria-current="page"' : ''}>${escape(title)}${subtitle ? `<span>${escape(subtitle)}</span>` : ''}</a>`;
		return `<p class="nav-caption">Your study notebook</p>${link('start', 'Start here', 'The learning path')}${C.groups
			.map(
				(group) =>
					`<p class="nav-caption">${escape(group.title)}</p>${C.lessons
						.filter((l) => l.group === group.id)
						.map(
							(lesson) =>
								`<a class="study-nav-link${active === lesson.id ? ' active' : ''}" href="#study/${lesson.id}"${active === lesson.id ? ' aria-current="page"' : ''}><span class="chapter-number">${String(C.lessons.indexOf(lesson) + 1).padStart(2, '0')}</span>${escape(lesson.title)}${completed.has(lesson.id) ? '<small class="completion-mark" aria-label="Understood">✓</small>' : ''}</a>`,
						)
						.join('')}`,
			)
			.join(
				'',
			)}<p class="nav-caption">Put it together</p>${link('questions', 'Interview questions', `${C.lessons.length * 4} guided questions`)}${link('revision', 'Revision desk', 'Formulas & interview checklist')}${link('resources', 'Reading room', 'Primary sources & further study')}`;
	}
	function renderStart() {
		return `<header class="study-hero"><div><p class="eyebrow">One notebook · from first principles to interviews</p><h2>Learn the idea.<br>Question the model.</h2><p class="study-lead">A connected learning path through AI and machine learning. Understand a concept, trace a small example, then explain when you would use it.</p><div class="study-actions"><a class="study-button" href="#study/ai-map">Begin with the foundations <span>→</span></a><a class="text-link" href="#study/questions">Practice for an interview ↗</a></div></div><div class="notebook-mark" aria-hidden="true"><span>FIELD NOTES</span><b>AI/ML</b><i>understand · trace · explain</i><div>data → decisions</div></div></header>
		${Teach.roadmap()}
		<div class="study-metrics"><span><b>${C.lessons.length}</b> detailed lessons</span><span><b>${C.lessons.length * 4}</b> interview questions</span><span><b>16</b> interactive experiments</span><span><b>29</b> primary references</span></div>
		<section class="lesson-section"><p class="eyebrow">How to use this guide</p><h3>Turn a familiar term into an idea you can use.</h3><p>Start with basic Python: variables, loops, functions, and arrays. The foundation lessons introduce the vectors, probability, and derivatives used later. Code examples are illustrative Python; the visual experiments run directly in your browser.</p><ol class="learning-loop"><li><b>Understand</b><span>Read the mental model. Name the inputs, target, assumptions, and decision before choosing a model.</span></li><li><b>Trace</b><span>Work through the numerical example. Predict each next row, then compare it with the visual lab.</span></li><li><b>Rebuild</b><span>Close the snippet and reproduce the calculation or pipeline. Check the shapes, units, and data split.</span></li><li><b>Explain</b><span>Attempt an interview question out loud. Open a hint before the answer, then reason through the follow-up.</span></li><li><b>Revisit</b><span>Use the revision desk and mixed questions to find weak concepts. Self-rate what needs another attempt.</span></li></ol></section>
		<section class="lesson-section"><p class="eyebrow">The curriculum</p><h3>Build your toolkit in layers.</h3><p>Follow the chapter order for a first pass, or use the notebook navigation to revisit a specific lesson.</p><div class="chapter-grid">${C.groups
			.map((group, index) => {
				const lessons = C.lessons.filter((l) => l.group === group.id);
				return `<a class="chapter-tile" href="#study/${lessons[0].id}"><span class="tile-number">${String(index + 1).padStart(2, '0')}</span><div><small>${lessons.length} lessons · ${escape(group.hint)}</small><h4>${escape(group.title.slice(5))}</h4><p>${escape(lessons.map((l) => l.title).join(' · '))}</p></div><span aria-hidden="true">↗</span></a>`;
			})
			.join('')}</div></section>
		<section class="lesson-section"><p class="eyebrow">A suggested pace</p><h3>Move on when you can explain the trade-off.</h3>${table(
			['Stage', 'Focus', 'Ready to move on when…'],
			[
				[
					'1',
					'Foundations and data',
					'You can represent an example, explain a conditional probability, and prevent leakage.',
				],
				[
					'2',
					'Learning and evaluation',
					'You can calculate an update, choose a metric, and design an honest split.',
				],
				[
					'3',
					'Classical and unsupervised ML',
					'You can compare a linear model, tree ensemble, neighbor method, clustering, and PCA.',
				],
				[
					'4',
					'Deep learning',
					'You can trace forward and backward passes and diagnose a training loop.',
				],
				[
					'5',
					'LLMs and generative AI',
					'You can trace attention and separate retrieval, prompting, fine-tuning, and generation.',
				],
				[
					'6',
					'Production and interviews',
					'You can design a system with realistic labels, latency, evaluation, monitoring, and failure handling.',
				],
			],
		)}</section><aside class="study-callout"><b>Practice from a blank page</b><p>After reading an answer, close it and explain the example again. Change one assumption and decide whether your approach still works.</p></aside>`;
	}
	function renderLesson(lesson, completed) {
		const notes = D[lesson.id],
			index = C.lessons.indexOf(lesson),
			group = C.groups.find((g) => g.id === lesson.group);
		return `<header class="lesson-header"><p class="eyebrow">Lesson ${String(index + 1).padStart(2, '0')} / ${C.lessons.length} · ${escape(group.title)}</p><h2>${escape(lesson.title)}</h2><p class="study-lead">${escape(notes.lead)}</p><nav class="lesson-jumps" aria-label="On this lesson"><button type="button" data-jump="like-5">Like I'm 5</button><button type="button" data-jump="mental-model">Mental model</button><button type="button" data-jump="worked-example">Worked example</button><button type="button" data-jump="design">Design</button><button type="button" data-jump="boundary">Boundary cases</button><button type="button" data-jump="code-template">Code & reasoning</button><button type="button" data-jump="lesson-practice">Practice</button></nav></header>
		${Teach.intro(lesson.id)}
		<section class="study-callout" id="mental-model"><p class="eyebrow">The mental model</p><p>${escape(lesson.story)}</p></section>
		<section class="lesson-section"><h3>Understand the moving parts</h3><p>${escape(lesson.detail)}</p>${lesson.steps.map((step, i) => `<div class="concept-row"><span>${String(i + 1).padStart(2, '0')}</span><p>${escape(step)}</p></div>`).join('')}</section>
		<section class="lesson-section" id="worked-example"><p class="eyebrow">Pencil-and-paper walkthrough</p><h3>${escape(notes.example.title)}</h3><p>Pause after each row. Predict the next state before reading why it changes.</p>${table(['Step', 'State', 'Why'], notes.example.rows)}</section>
		${Teach.design(lesson.id)}
		<section class="lesson-section"><p class="eyebrow">Read the symbols</p><h3>The math behind the idea</h3><code class="formula">${escape(lesson.formula)}</code><p>${escape(lesson.symbols)}</p></section>
		<section class="lesson-section" id="code-template"><p class="eyebrow">A template to rebuild</p><h3>From idea to code</h3><p>Illustrative Python. Imports, data setup, and helper names are abbreviated; code is not executed in this notebook. Trace a small case before adapting it in your editor.</p><pre class="study-code"><code>${escape(lesson.code)}</code></pre><div class="reasoning-grid"><div><h4>Why it works</h4><p>${escape(notes.reasoning)}</p></div><div><h4>Cost & trade-offs</h4><p>${escape(notes.cost)}</p></div></div></section>
		<section class="lab-links"><div><p class="eyebrow">See it in motion</p><h3>Connect the notes to the visual lab</h3><p>${lesson.lab ? 'Change a parameter, predict its effect, and inspect the computed results. The examples are small and synthetic.' : 'Trace the four-step concept diagram alongside the written example.'}</p></div><div><a href="#lab/${lesson.id}">${lesson.lab ? 'Open the experiment' : 'Open the concept walkthrough'} ↗</a></div></section>
		<section class="lesson-section"><h3>Mistakes to catch early</h3><ul class="pitfalls"><li>${escape(lesson.pitfall)}</li></ul></section>
		<section class="lesson-section"><p class="eyebrow">Close the notes first</p><h3>Check your understanding</h3><p>${escape(lesson.challenge)}</p><fieldset class="study-recall"><legend>${escape(lesson.check.q)}</legend><div class="check-options">${lesson.check.options.map((option, i) => `<button type="button" class="answer-btn" data-check-choice="${i}" data-lesson="${lesson.id}" aria-pressed="false">${String.fromCharCode(65 + i)} · ${escape(option)}</button>`).join('')}</div><p class="quiz-feedback" id="study-feedback" role="status"></p></fieldset><button type="button" class="btn primary" data-mark-complete="${lesson.id}" aria-pressed="${completed}">${completed ? '✓ Understood · undo' : 'Mark as understood'}</button></section>
		<section class="lesson-section" id="lesson-practice"><p class="eyebrow">Apply the idea</p><h3>Interview practice for this lesson</h3><p>Explain your answer, state its assumptions, and use a concrete case. Open a hint only after making an attempt.</p><div class="practice-list">${lesson.interview.map((q, i) => `<div><span class="difficulty ${notes.interview[i].level.toLowerCase()}">${notes.interview[i].level}</span><b>${escape(q.q)}</b></div>`).join('')}</div><a class="study-button" href="#study/questions?topic=${lesson.id}">Open these 4 questions →</a></section>
		<section class="lesson-section"><p class="eyebrow">Keep studying</p><h3>Primary references</h3>${sources(lesson.sources)}</section>
		<nav class="chapter-pagination" aria-label="Adjacent lessons"><a href="#study/${index ? C.lessons[index - 1].id : 'start'}">← ${escape(index ? C.lessons[index - 1].title : 'Learning path')}</a><a href="#study/${index < C.lessons.length - 1 ? C.lessons[index + 1].id : 'revision'}">${escape(index < C.lessons.length - 1 ? C.lessons[index + 1].title : 'Revision desk')} →</a></nav>`;
	}
	function renderRevision() {
		const chosen = [
			'vectors',
			'probability',
			'regression',
			'gradient',
			'logistic',
			'metrics',
			'bias',
			'trees',
			'clustering',
			'pca',
			'backprop',
			'attention',
			'tuning',
			'rl',
		];
		return `<header class="lesson-header"><p class="eyebrow">Recall, compare, explain</p><h2>Revision desk</h2><p class="study-lead">Use this as a quick reference after attempting an explanation from memory.</p></header><section class="lesson-section"><h3>Core formulas and their assumptions</h3>${table(
			['Concept', 'Remember', 'Cost or trade-off'],
			chosen.map((id) => {
				const l = C.lessons.find((item) => item.id === id);
				return [l.title, l.formula, D[id].cost];
			}),
		)}</section>
		<section class="lesson-section"><h3>A method-selection checklist</h3>${table(
			['Situation', 'First comparison', 'Check before trusting it'],
			[
				[
					'Tabular prediction',
					'Simple baseline, linear model, tree ensemble',
					'Leakage-safe splits, metric, calibration, and meaningful features.',
				],
				[
					'Limited labeled data',
					'Transfer learning or a pretrained representation',
					'Domain mismatch, frozen vs tuned weights, and honest validation.',
				],
				[
					'Discover structure',
					'Clustering or PCA, depending on the question',
					'Scaling, distance, initialization, and whether input variance is useful.',
				],
				[
					'Answer from documents',
					'Retrieval baseline, then grounded generation if needed',
					'Permissions, evidence coverage, retrieval recall, and supported answers.',
				],
				[
					'Forecast the future',
					'Seasonal baseline before a more complex model',
					'Chronological backtests and features available at the forecast origin.',
				],
				[
					'Production decisions',
					'Offline evaluation plus a safe rollout',
					'Latency, delayed labels, monitoring, fallback, and feedback loops.',
				],
			],
		)}</section><section class="lesson-section"><h3>An interview answer you can defend</h3><ol class="learning-loop"><li><b>Frame the problem</b><span>Name the user decision, target, input availability, error costs, and success metric.</span></li><li><b>Establish a baseline</b><span>State a simple solution and how you will know a complex one is worthwhile.</span></li><li><b>Explain the mechanism</b><span>Work through one small input, including shapes, updates, or a data-flow trace.</span></li><li><b>Evaluate honestly</b><span>Choose an appropriate split, inspect errors and slices, and separate tuning from final testing.</span></li><li><b>Discuss operation</b><span>Explain latency, memory, monitoring, versioning, failure handling, and trade-offs.</span></li></ol><div class="study-actions"><a class="study-button" href="#study/questions">Try mixed interview practice →</a><a href="#study/resources">Visit the reading room</a></div></section>`;
	}
	function renderResources() {
		return `<header class="lesson-header"><p class="eyebrow">Sources & further study</p><h2>Reading room</h2><p class="study-lead">The primary references behind the lessons, from introductory courses to the original papers.</p></header><aside class="study-callout"><b>Read with a question</b><p>Use a lesson’s worked example first. Then read its linked source to check a derivation, assumption, implementation detail, or experiment.</p></aside><section class="lesson-section"><h3>Courses, documentation, books, and papers</h3>${sources(Object.keys(C.sources))}</section><section class="lesson-section"><h3>How this notebook uses the sources</h3><p>The lessons, examples, and interview prompts are original study notes. References were checked on 10 November 2026. The interview collection teaches core concepts and applied reasoning; it is not a company frequency ranking or a guarantee of interview coverage.</p><p>Numerical labs use synthetic data and hand-set vectors or filters where identified. Code snippets abbreviate setup and helper functions. Browser-saved progress records your own confidence; it does not certify mastery.</p><p>Google Fonts and external reading links need a network connection. The learning material and experiments are bundled with the app.</p><a class="study-button" href="#study/start">Return to the learning path →</a></section>`;
	}
	return {
		resolveRoute,
		renderNav,
		renderStart,
		renderLesson,
		renderRevision,
		renderResources,
	};
})();
