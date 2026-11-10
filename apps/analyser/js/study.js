'use strict';

(function () {
	const esc = DSA.util.esc;
	const content = document.getElementById('study-content');
	const nav = document.getElementById('study-nav');
	const lessons = DSA.lessons;
	let lastLesson = 'start';

	function lessonLink(lesson, label) {
		return (
			'<a href="#study/' +
			lesson.id +
			'">' +
			esc(label || lesson.title) +
			'</a>'
		);
	}

	function renderNav(active) {
		let phase = '';
		nav.innerHTML =
			'<p class="nav-caption">Your study notebook</p>' +
			'<a class="study-nav-link' +
			(active === 'start' ? ' active' : '') +
			'" href="#study/start">Start here <span>The learning path</span></a>' +
			lessons
				.map(function (lesson, index) {
					const heading =
						phase !== lesson.phase
							? '<p class="nav-caption">' + esc(lesson.phase) + '</p>'
							: '';
					phase = lesson.phase;
					return (
						heading +
						'<a class="study-nav-link' +
						(active === lesson.id ? ' active' : '') +
						'" href="#study/' +
						lesson.id +
						'"' +
						(active === lesson.id ? ' aria-current="page"' : '') +
						'><span class="chapter-number">' +
						String(index + 1).padStart(2, '0') +
						'</span>' +
						esc(lesson.title) +
						'</a>'
					);
				})
				.join('') +
			'<p class="nav-caption">Put it together</p>' +
			'<a class="study-nav-link' +
			(active === 'questions' ? ' active' : '') +
			'" href="#study/questions">Interview questions <span>' +
			DSA.questions.length +
			' guided problems</span></a>' +
			'<a class="study-nav-link' +
			(active === 'revision' ? ' active' : '') +
			'" href="#study/revision">Revision desk <span>Complexity & interview checklist</span></a>' +
			'<a class="study-nav-link' +
			(active === 'resources' ? ' active' : '') +
			'" href="#study/resources">Reading room <span>Sources & further study</span></a>';
	}

	function renderStart() {
		content.innerHTML =
			'<header class="study-hero"><div><p class="eyebrow">One notebook · from first principles to interviews</p>' +
			'<h2>Learn the idea.<br>Make the next move.</h2><p class="study-lead">A complete learning path through the essential data structures and algorithms. Read for understanding, trace an example, then build a solution of your own.</p>' +
			'<div class="study-actions"><a class="study-button" href="#study/complexity">Begin with the foundations <span>→</span></a><a class="text-link" href="#study/questions">Practice for an interview ↗</a></div></div>' +
			'<div class="notebook-mark" aria-hidden="true"><span>FIELD NOTES</span><b>DSA</b><i>think · trace · solve</i><div>01 → ∞</div></div></header>' +
			'<div class="study-metrics"><span><b>' +
			lessons.length +
			'</b> detailed chapters</span><span><b>' +
			DSA.questions.length +
			'</b> interview problems</span><span><b>' +
			DSA.algos.length +
			'</b> visual explorations</span><span><b>1</b> connected learning path</span></div>' +
			'<section class="lesson-section"><p class="eyebrow">How to use this guide</p><h3>Turn recognition into understanding.</h3><p>You should be comfortable with variables, loops, functions and basic JavaScript before starting. The ideas transfer to other languages; the code templates use JavaScript, with pseudocode explicitly marked.</p>' +
			'<ol class="learning-loop"><li><b>Understand</b><span>Read the mental model. Explain the problem and the input assumptions in your own words.</span></li><li><b>Trace</b><span>Predict the next row of the worked example. Use the visual lab to inspect every state change.</span></li><li><b>Implement</b><span>Close the template and recreate it. Say what stays true after each loop or recursive call.</span></li><li><b>Transfer</b><span>Try a related interview problem. Reveal a hint before the full solution, then explain why the approach fits.</span></li><li><b>Revisit</b><span>Attempt the recall question tomorrow and solve a mixed problem later in the week. Record why you got stuck.</span></li></ol></section>' +
			'<section class="lesson-section"><p class="eyebrow">The curriculum</p><h3>Build your toolkit in layers.</h3><p>Follow the chapter order if you are learning DSA for the first time. If you already know the basics, choose a weak topic and finish its worked example and practice questions before moving on.</p><div class="chapter-grid">' +
			lessons
				.map(function (lesson, index) {
					return (
						'<a class="chapter-tile" href="#study/' +
						lesson.id +
						'"><span class="tile-number">' +
						String(index + 1).padStart(2, '0') +
						'</span><div><small>' +
						esc(lesson.phase) +
						'</small><h4>' +
						esc(lesson.title) +
						'</h4><p>' +
						esc(lesson.lead) +
						'</p></div><span aria-hidden="true">↗</span></a>'
					);
				})
				.join('') +
			'</div></section>' +
			'<section class="lesson-section"><p class="eyebrow">A suggested pace</p><h3>Six stages, at your own speed.</h3><p>These are study stages, not deadlines. Repeat a stage until you can solve a fresh variation and explain your choices without reading an answer.</p>' +
			'<div class="study-table-wrap"><table class="study-table"><thead><tr><th>Stage</th><th>Focus</th><th>Ready to move on when…</th></tr></thead><tbody>' +
			[
				[
					'1',
					'Complexity, arrays, strings, hashing',
					'You can compare a brute-force solution with a lookup-based one.',
				],
				[
					'2',
					'Pointers, windows, prefix sums, binary search',
					'You can justify every boundary move and identify when the pattern fails.',
				],
				[
					'3',
					'Lists, stacks, recursion, trees, heaps',
					'You can trace reference changes and define a recursive contract.',
				],
				[
					'4',
					'Graph traversal, dependencies, shortest paths',
					'You can select BFS, DFS, topological sort or Dijkstra from the objective.',
				],
				[
					'5',
					'Greedy, DP, tries, bits and matrices',
					'You can give a greedy proof or write a precise DP state and recurrence.',
				],
				[
					'6',
					'Mixed interview practice and revision',
					'You can solve an unfamiliar variation, test it and explain its cost aloud.',
				],
			]
				.map(function (row) {
					return (
						'<tr>' +
						row
							.map(function (cell) {
								return '<td>' + esc(cell) + '</td>';
							})
							.join('') +
						'</tr>'
					);
				})
				.join('') +
			'</tbody></table></div></section><aside class="study-callout"><b>A useful rule for practice</b><p>If you needed the solution, recreate it from a blank editor later, then solve a variation. Being able to follow an answer is a different skill from producing one.</p></aside>';
	}

	function renderLesson(lesson) {
		const index = lessons.indexOf(lesson);
		const questions = DSA.questions.filter(function (q) {
			return q.topic === lesson.id;
		});
		content.innerHTML =
			'<header class="lesson-header"><p class="eyebrow">Chapter ' +
			String(index + 1).padStart(2, '0') +
			' / ' +
			lessons.length +
			' · ' +
			esc(lesson.phase) +
			'</p><h2>' +
			esc(lesson.title) +
			'</h2><p class="study-lead">' +
			esc(lesson.lead) +
			'</p>' +
			'<nav class="lesson-jumps" aria-label="On this lesson"><button type="button" data-jump="mental-model">Mental model</button><button type="button" data-jump="worked-example">Worked example</button><button type="button" data-jump="code-template">Code & reasoning</button><button type="button" data-jump="lesson-practice">Practice</button></nav></header>' +
			'<section class="study-callout" id="mental-model"><p class="eyebrow">The mental model</p><p>' +
			esc(lesson.model) +
			'</p></section>' +
			'<section class="lesson-section"><h3>Understand the moving parts</h3>' +
			lesson.concepts
				.map(function (text, i) {
					return (
						'<div class="concept-row"><span>' +
						String(i + 1).padStart(2, '0') +
						'</span><p>' +
						esc(text) +
						'</p></div>'
					);
				})
				.join('') +
			'</section>' +
			'<section class="lesson-section" id="worked-example"><p class="eyebrow">Pencil-and-paper walkthrough</p><h3>' +
			esc(lesson.example.title) +
			'</h3><p>Pause after each row and predict the next state before reading its explanation.</p><div class="study-table-wrap"><table class="study-table"><thead><tr><th>Step</th><th>State</th><th>Why</th></tr></thead><tbody>' +
			lesson.example.rows
				.map(function (row) {
					return (
						'<tr>' +
						row
							.map(function (cell) {
								return '<td>' + esc(cell) + '</td>';
							})
							.join('') +
						'</tr>'
					);
				})
				.join('') +
			'</tbody></table></div></section>' +
			'<section class="lesson-section" id="code-template"><p class="eyebrow">A template to rebuild</p><h3>From idea to code</h3><p>Read the contract and assumptions first. Trace this on a small input, then close it and implement the same idea yourself.</p><pre class="study-code"><code>' +
			esc(lesson.code.trim()) +
			'</code></pre><div class="reasoning-grid"><div><h4>Why it works</h4><p>' +
			esc(lesson.invariant) +
			'</p></div><div><h4>Time & space</h4><p>' +
			esc(lesson.cost) +
			'</p></div></div></section>' +
			(lesson.labs.length
				? '<section class="lab-links"><div><p class="eyebrow">See it in motion</p><h3>Connect the notes to the visual lab</h3><p>Step forward once at a time. Explain each highlighted state before pressing play.</p></div><div>' +
					lesson.labs
						.map(function (id) {
							const algo = DSA.algos.find(function (a) {
								return a.id === id;
							});
							return (
								'<a href="#' +
								id +
								'">' +
								esc(
									algo.name + (algo.group === 'pathfinding' ? ' · grid' : ''),
								) +
								' ↗</a>'
							);
						})
						.join('') +
					'</div></section>'
				: '') +
			'<section class="lesson-section"><h3>Mistakes to catch early</h3><ul class="pitfalls">' +
			lesson.pitfalls
				.map(function (text) {
					return '<li>' + esc(text) + '</li>';
				})
				.join('') +
			'</ul></section>' +
			'<section class="lesson-section"><p class="eyebrow">Close the notes first</p><h3>Check your understanding</h3><details class="recall-card"><summary>' +
			esc(lesson.recall[0]) +
			'</summary><p>' +
			esc(lesson.recall[1]) +
			'</p></details></section>' +
			'<section class="lesson-section" id="lesson-practice"><p class="eyebrow">Apply the pattern</p><h3>Interview practice for this chapter</h3><p>For each problem: describe a baseline, improve it, state an invariant, then test edge cases. Use the hints only after making a concrete attempt.</p><div class="practice-list">' +
			questions
				.map(function (q) {
					return (
						'<div><span class="difficulty ' +
						q.level.toLowerCase() +
						'">' +
						q.level +
						'</span><b>' +
						esc(q.title) +
						'</b></div>'
					);
				})
				.join('') +
			'</div><a class="study-button" href="#study/questions?topic=' +
			lesson.id +
			'">Open these ' +
			questions.length +
			' problems →</a></section>' +
			'<nav class="chapter-pagination" aria-label="Adjacent chapters">' +
			(index
				? lessonLink(lessons[index - 1], '← ' + lessons[index - 1].title)
				: '<a href="#study/start">← Learning path</a>') +
			(index < lessons.length - 1
				? lessonLink(lessons[index + 1], lessons[index + 1].title + ' →')
				: '<a href="#study/revision">Go to the revision desk →</a>') +
			'</nav>';
	}

	function questionCard(q, index) {
		const lesson = lessons.find(function (l) {
			return l.id === q.topic;
		});
		return (
			'<details class="question-card"><summary><span class="question-number">' +
			String(index + 1).padStart(2, '0') +
			'</span><span><b>' +
			esc(q.title) +
			'</b><small>' +
			esc(lesson.title) +
			'</small></span><span class="difficulty ' +
			q.level.toLowerCase() +
			'">' +
			q.level +
			'</span></summary><div class="question-body"><p>' +
			esc(q.prompt) +
			'</p><p class="question-example"><b>Example</b> ' +
			esc(q.example) +
			'</p><details class="answer-reveal"><summary>Show a hint</summary><p>' +
			esc(q.hint) +
			'</p></details><details class="answer-reveal"><summary>Reveal solution walkthrough</summary><div><h4>Approach & reasoning</h4><p>' +
			esc(q.answer) +
			'</p><h4>Complexity</h4><p>' +
			esc(q.cost) +
			'</p><h4>Watch out for</h4><p>' +
			esc(q.trap) +
			'</p><p class="solution-task">Now recreate the solution without reading. Test a normal case, a boundary case and a case designed to break your assumptions.</p></div></details><div class="question-links">' +
			lessonLink(lesson, 'Review this lesson') +
			'<a href="https://leetcode.com/problems/' +
			q.slug +
			'/" target="_blank" rel="noopener noreferrer">Code on LeetCode ↗</a></div></div></details>'
		);
	}

	function renderQuestions(topic) {
		content.innerHTML =
			'<header class="lesson-header"><p class="eyebrow">Practice with a purpose</p><h2>The interview notebook</h2><p class="study-lead">' +
			DSA.questions.length +
			' essential problems, selected to teach reusable patterns. Each has an example, a hint, a solution walkthrough, complexity and an edge case to watch.</p><p>This is a learning collection, not a company frequency ranking. Try problems without the topic filter once you know the patterns: recognizing which tool to use is part of the challenge.</p></header>' +
			'<aside class="study-callout"><b>Attempt → hint → explain → rebuild</b><p>Make a concrete attempt first. If stuck, identify what you know and which operation is too expensive, then reveal the hint. After reading a solution, explain why it works and implement it from memory. The external practice links open a coding platform; this notebook does not run submitted code.</p></aside>' +
			'<div class="question-filters"><label>Find a problem<input id="question-search" type="search" placeholder="Try: median, negative, prefix…"></label><label>Topic<select id="question-topic"><option value="">All topics</option>' +
			lessons
				.map(function (l) {
					return '<option value="' + l.id + '">' + esc(l.title) + '</option>';
				})
				.join('') +
			'</select></label><label>Difficulty<select id="question-level"><option value="">All levels</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label></div><p id="question-count" class="result-count" aria-live="polite"></p><div id="question-results"></div>';
		const search = document.getElementById('question-search');
		const topicSelect = document.getElementById('question-topic');
		const level = document.getElementById('question-level');
		topicSelect.value = lessons.some(function (l) {
			return l.id === topic;
		})
			? topic
			: '';
		function filterQuestions() {
			const term = search.value.trim().toLowerCase();
			const matches = DSA.questions.filter(function (q) {
				return (
					(!topicSelect.value || q.topic === topicSelect.value) &&
					(!level.value || q.level === level.value) &&
					(!term ||
						[q.title, q.prompt, q.hint, q.answer, q.topic]
							.join(' ')
							.toLowerCase()
							.includes(term))
				);
			});
			document.getElementById('question-count').textContent =
				matches.length + ' of ' + DSA.questions.length + ' problems';
			document.getElementById('question-results').innerHTML = matches.length
				? matches
						.map(function (q) {
							return questionCard(q, DSA.questions.indexOf(q));
						})
						.join('')
				: '<div class="empty-state"><h3>No matching problems</h3><p>Try a broader search or choose all topics and levels.</p></div>';
		}
		search.addEventListener('input', filterQuestions);
		topicSelect.addEventListener('change', filterQuestions);
		level.addEventListener('change', filterQuestions);
		filterQuestions();
	}

	function renderRevision() {
		const rows = [
			[
				'Array',
				'Index O(1); scan O(n); middle insert/delete O(n)',
				'Dynamic append is amortized O(1); slicing copies.',
			],
			[
				'Hash map / set',
				'Expected lookup/insert/delete O(1)',
				'Adversarial collisions can degrade operations; keys also cost work.',
			],
			[
				'Linked list',
				'Search O(n); known-link rewiring O(1)',
				'Tail append needs a maintained tail. Finding a predecessor costs time.',
			],
			[
				'Stack / queue',
				'O(1) end operations with the right structure',
				'JavaScript array shift() is not a reliable constant-time dequeue.',
			],
			[
				'BST',
				'Search/insert/delete O(h)',
				'Balanced h = O(log n); a skewed tree has h = O(n).',
			],
			[
				'Binary heap',
				'Peek O(1); push/pop O(log n); heapify O(n)',
				'Arbitrary-value search remains O(n).',
			],
			[
				'Trie',
				'Insert/search O(L) with constant-time child access',
				'Wildcard search branches; listing matches includes output cost.',
			],
			[
				'Binary search',
				'O(log n) time; O(1) iterative space',
				'Requires ordered access or a monotonic predicate.',
			],
			[
				'BFS / DFS',
				'O(V + E) time; O(V) auxiliary space',
				'Adjacency-list assumption. Include construction and graph storage separately.',
			],
			[
				'Topological sort',
				'O(V + E) time; O(V) auxiliary space',
				'A complete order exists only for a directed acyclic graph.',
			],
			[
				'Union–find',
				'O(α(V)) amortized per operation',
				'Needs path compression and rank/size; undirected connectivity.',
			],
			[
				'Merge / heap sort',
				'O(n log n) worst-case time',
				'Array merge sort O(n) auxiliary space; heapsort O(1).',
			],
			[
				'Quicksort',
				'Expected O(n log n); worst O(n²)',
				'Recursive stack expected O(log n), worst O(n) without mitigation.',
			],
			[
				'DP',
				'Number of states × transition cost',
				'Add cache keys, stack, preprocessing and reconstruction costs.',
			],
			[
				'Subsets / permutations',
				'O(n · 2ⁿ) / O(n · n!) with copied output',
				'Enumeration cannot avoid paying for the answers it returns.',
			],
		];
		const decisions = [
			[
				'Need fast membership, counts or complements?',
				'Hash map / set',
				'hashing',
			],
			[
				'Contiguous range with incrementally maintainable validity?',
				'Sliding window',
				'sliding-window',
			],
			[
				'Range sums, or arbitrary-integer target subarrays?',
				'Prefix sums',
				'prefix-sums',
			],
			[
				'Sorted range or first feasible answer?',
				'Binary search',
				'sorting-search',
			],
			[
				'Next greater/smaller or nested unfinished work?',
				'Monotonic stack / stack',
				'stacks-queues',
			],
			['Shortest number of equal-cost moves?', 'BFS', 'graphs'],
			[
				'Prerequisites or a directed cycle?',
				'Topological sort / directed DFS',
				'advanced-graphs',
			],
			[
				'Weighted shortest path with nonnegative edges?',
				'Dijkstra',
				'advanced-graphs',
			],
			['Repeated best next value or top K?', 'Heap', 'heaps'],
			[
				'Repeated subproblems with a complete state?',
				'Dynamic programming',
				'dynamic-programming',
			],
			['Enumerate valid configurations?', 'Backtracking', 'backtracking'],
			['Prefix queries across many keys?', 'Trie', 'tries'],
		];
		content.innerHTML =
			'<header class="lesson-header"><p class="eyebrow">Keep the reasoning close</p><h2>The revision desk</h2><p class="study-lead">A quick reference for choosing patterns, defending complexity and communicating a complete interview solution.</p></header><section class="lesson-section"><h3>Pattern recognition is a starting point</h3><p>A clue suggests a candidate technique. Confirm its assumptions and prove why it applies before committing.</p><div class="study-table-wrap"><table class="study-table"><thead><tr><th>Problem clue</th><th>Explore</th></tr></thead><tbody>' +
			decisions
				.map(function (r) {
					return (
						'<tr><td>' +
						esc(r[0]) +
						'</td><td><a href="#study/' +
						r[2] +
						'">' +
						esc(r[1]) +
						' →</a></td></tr>'
					);
				})
				.join('') +
			'</tbody></table></div></section>' +
			'<section class="lesson-section"><h3>Complexity reference</h3><p>Bounds assume the standard representations and operations described. n is item count, L is key length, h is tree height, V is vertices and E is edges. Auxiliary space excludes input and returned output unless stated.</p><div class="study-table-wrap"><table class="study-table"><thead><tr><th>Tool</th><th>Cost</th><th>Condition / caveat</th></tr></thead><tbody>' +
			rows
				.map(function (r) {
					return (
						'<tr>' +
						r
							.map(function (s) {
								return '<td>' + esc(s) + '</td>';
							})
							.join('') +
						'</tr>'
					);
				})
				.join('') +
			'</tbody></table></div></section>' +
			'<section class="lesson-section"><h3>A complete interview explanation</h3><ol class="learning-loop"><li><b>Clarify</b><span>Confirm input sizes, ordering, duplicates, empty input, mutation, numeric limits and the required output.</span></li><li><b>Baseline</b><span>Give a correct straightforward solution and its cost. Point to the operation that repeats unnecessary work.</span></li><li><b>Design</b><span>Choose a representation and state what every pointer, cache key, stack or DP cell means.</span></li><li><b>Justify</b><span>Explain the invariant, the discarded candidates, the recursive contract or the greedy exchange argument.</span></li><li><b>Implement</b><span>Use explicit names. Preserve old state before mutation, check boundaries and avoid accidental hidden copying.</span></li><li><b>Check</b><span>Trace one ordinary input, one boundary input and one adversarial input. Count work and memory, including the call stack.</span></li></ol></section>' +
			'<section class="lesson-section"><h3>Concept questions worth answering aloud</h3>' +
			[
				[
					'When does a nested loop remain linear?',
					'When the total inner-loop movement across the whole algorithm is bounded by O(n), as with two forward-only sliding-window pointers. Count total operations, not indentation.',
				],
				[
					'Why might a hash-based algorithm need an expected-time qualifier?',
					'The usual lookup bound depends on collision behavior and load management. Key construction may also have a length-dependent cost.',
				],
				[
					'When is BFS a shortest-path algorithm?',
					'When every edge has the same positive cost, minimizing edge count also minimizes path cost. General weighted graphs need a suitable weighted shortest-path algorithm.',
				],
				[
					'How do memoization and backtracking differ?',
					'Backtracking explores choices and restores state; memoization caches the answer for a complete subproblem state. They can be combined when distinct search paths reach equivalent future subproblems.',
				],
				[
					'Why does greedy need more than a plausible rule?',
					'A local choice can block a better global solution. An exchange argument or other proof must show an optimal solution can make that choice without loss.',
				],
				[
					'What should a DP cache key include?',
					'Every fact that can change the remaining answer: for example index, capacity and any relevant previous-choice state. Omitting one can merge different subproblems incorrectly.',
				],
				[
					'Can an algorithm be in place and still use nonconstant memory?',
					'Yes, depending on the definition used. Recursive quicksort rearranges the input in place but still uses a call stack. State the auxiliary-space bound explicitly.',
				],
				[
					'What edge cases should I invent?',
					'Try empty/singleton input, all equal values, all negative values, missing answers, extremes, sorted and reversed order, disconnected graphs, long chains, repeated dependencies and boundary targets. Choose cases that challenge this algorithm’s actual assumptions.',
				],
			]
				.map(function (pair) {
					return (
						'<details class="recall-card"><summary>' +
						esc(pair[0]) +
						'</summary><p>' +
						esc(pair[1]) +
						'</p></details>'
					);
				})
				.join('') +
			'</section><a class="study-button" href="#study/questions">Try a mixed practice session →</a>';
	}

	function renderResources() {
		content.innerHTML =
			'<header class="lesson-header"><p class="eyebrow">Keep learning</p><h2>The reading room</h2><p class="study-lead">Use this notebook as your connected guide, then go deeper with lectures, exercises and independent coding practice.</p></header><section class="lesson-section"><h3>Sources reviewed for coverage and structure</h3><p>The explanations and solution walkthroughs here are written for this guide. The resources below informed the topic coverage and provide additional material; this project is independent of their authors.</p><div class="resource-grid">' +
			[
				[
					'MIT OpenCourseWare · 6.006',
					'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
					'Go deeper into algorithm design, correctness and performance analysis through lectures, notes and problem sets. Useful after the first pass through a chapter.',
				],
				[
					'Tech Interview Handbook',
					'https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/',
					'Compare topic checklists, techniques, corner cases and interview preparation advice. Use it to check gaps in your preparation.',
				],
				[
					'LeetCode · Top Interview 150',
					'https://leetcode.com/studyplan/top-interview-150/',
					'Continue with a larger official coding practice plan. Problem links in this guide open the corresponding practice pages; external availability and sign-in requirements may vary.',
				],
			]
				.map(function (r) {
					return (
						'<a class="resource-card" href="' +
						r[1] +
						'" target="_blank" rel="noopener noreferrer"><h4>' +
						r[0] +
						' ↗</h4><p>' +
						r[2] +
						'</p></a>'
					);
				})
				.join('') +
			'</div></section><section class="lesson-section"><h3>After the essential path</h3><p>Build on these foundations with balanced search trees, Fenwick and segment trees, strongly connected components, Bellman–Ford, all-pairs shortest paths, string matching such as KMP, and more advanced DP optimizations. Learn a specialized structure when a problem reveals the need for it.</p><h3>Make your practice observable</h3><p>For each attempt, write the pattern you considered, why it did or did not apply, the first failing example and the final invariant. Revisit mistakes by reason: a missing assumption, an incorrect state, an off-by-one boundary, or an implementation error. That record tells you what to practice next.</p></section>';
	}

	function renderRoute(initial) {
		const hash = decodeSafe(location.hash.slice(1));
		const parts = hash.split('?');
		const path = parts[0];
		const algo = DSA.algos.find(function (a) {
			return a.id === path;
		});
		const inLab = !!algo;
		document.body.dataset.mode = inLab ? 'lab' : 'study';
		content.hidden = inLab;
		document.getElementById('lab-content').hidden = !inLab;
		nav.hidden = inLab;
		document.getElementById('nav').hidden = !inLab;
		let active = path.startsWith('study/') ? path.slice(6) : 'start';
		if (inLab) {
			DSA.selectAlgo(algo);
			document.title = algo.name + ' · Visual lab | DSA Study Studio';
		} else {
			DSA.pause();
			const lesson = lessons.find(function (l) {
				return l.id === active;
			});
			if (lesson) renderLesson(lesson);
			else if (active === 'questions')
				renderQuestions(new URLSearchParams(parts[1] || '').get('topic'));
			else if (active === 'revision') renderRevision();
			else if (active === 'resources') renderResources();
			else {
				active = 'start';
				renderStart();
			}
			if (lesson || active === 'start') lastLesson = active;
			renderNav(active);
			const activeLink = nav.querySelector('.active');
			if (activeLink && window.matchMedia('(max-width: 860px)').matches) {
				nav.scrollLeft =
					activeLink.offsetLeft -
					nav.clientWidth / 2 +
					activeLink.clientWidth / 2;
			}
			document.title =
				(lesson
					? lesson.title
					: active === 'questions'
						? 'Interview practice'
						: active === 'revision'
							? 'Revision desk'
							: active === 'resources'
								? 'Reading room'
								: 'All-in-one DSA guide') + ' | DSA Study Studio';
		}
		document.querySelectorAll('[data-mode-link]').forEach(function (link) {
			const selected =
				link.dataset.modeLink ===
				(inLab ? 'lab' : active === 'questions' ? 'questions' : 'study');
			if (selected) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		});
		if (!initial) {
			document.getElementById('main-content').focus({ preventScroll: true });
			window.scrollTo(0, 0);
		}
	}

	function decodeSafe(hash) {
		try {
			return decodeURIComponent(hash);
		} catch (error) {
			return '';
		}
	}

	window.addEventListener('hashchange', function () {
		renderRoute(false);
	});
	content.addEventListener('click', function (event) {
		const jump = event.target.closest('[data-jump]');
		if (jump) {
			const section = document.getElementById(jump.dataset.jump);
			section.tabIndex = -1;
			section.focus({ preventScroll: true });
			section.scrollIntoView();
		}
	});
	document
		.querySelector('.skip-link')
		.addEventListener('click', function (event) {
			event.preventDefault();
			const main = document.getElementById('main-content');
			main.focus();
			main.scrollIntoView();
		});
	// Returning from the lab restores the most recently read chapter.
	document
		.querySelector('[data-mode-link="study"]')
		.addEventListener('click', function (event) {
			if (document.body.dataset.mode !== 'lab') return;
			event.preventDefault();
			location.hash = 'study/' + lastLesson;
		});
	renderRoute(true);
})();
