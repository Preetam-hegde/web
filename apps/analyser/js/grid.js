'use strict';

(function () {
	DSA.addGroup({ id: 'pathfinding', label: 'Pathfinding', hint: 'Grid search' });

	const ROWS = 18;
	const COLS = 34;
	DSA.grid = {
		rows: ROWS,
		cols: COLS,
		walls: new Uint8Array(ROWS * COLS),
		start: 9 * COLS + 5,
		end: 9 * COLS + 28
	};

	function randomWalls(rand) {
		const G = DSA.grid;
		G.walls.fill(0);
		for (let i = 0; i < G.walls.length; i++) {
			if (i !== G.start && i !== G.end && rand() < 0.27) {
				G.walls[i] = 1;
			}
		}
	}

	function neighbours(idx) {
		const G = DSA.grid;
		const r = Math.floor(idx / G.cols);
		const c = idx % G.cols;
		const out = [];
		if (r > 0) {
			out.push(idx - G.cols);
		}
		if (c < G.cols - 1) {
			out.push(idx + 1);
		}
		if (r < G.rows - 1) {
			out.push(idx + G.cols);
		}
		if (c > 0) {
			out.push(idx - 1);
		}
		return out.filter(function (i) {
			return !G.walls[i];
		});
	}

	function manhattan(a, b) {
		const G = DSA.grid;
		return Math.abs(Math.floor(a / G.cols) - Math.floor(b / G.cols)) + Math.abs((a % G.cols) - (b % G.cols));
	}

	const controls = [
		{ type: 'hint', text: 'Drag on the grid to draw walls · drag S or E to move them' },
		{ type: 'action', label: 'Random walls', run: function (ctx) { randomWalls(ctx.rand); } },
		{ type: 'action', label: 'Clear walls', run: function () { DSA.grid.walls.fill(0); } }
	];

	const legend = [['', 'Unvisited'], ['front', 'Frontier'], ['cur', 'Exploring'], ['visited', 'Visited'], ['path', 'Final path']];

	// Runs a search described by a tiny strategy object and records frames.
	function search(strategy) {
		const G = DSA.grid;
		const N = G.rows * G.cols;
		const rec = DSA.util.recorder({ Visited: 0, Frontier: 1, 'Path length': '–' });
		const order = [];
		const visitedAt = new Int32Array(N).fill(1e9);
		const prev = new Int32Array(N).fill(-1);
		const state = strategy.init(G, prev);
		let reached = false;
		rec.add({ n: 0, cur: -1, front: [G.start], p: 0, msg: strategy.intro, line: 0 });
		while (state.size() && !reached) {
			const u = state.next();
			if (visitedAt[u] !== 1e9) {
				continue;
			}
			visitedAt[u] = order.length;
			order.push(u);
			rec.stats.Visited = order.length;
			if (u === G.end) {
				reached = true;
				rec.stats.Frontier = state.size();
				rec.add({ n: order.length, cur: u, front: state.items(), p: 0, msg: 'Reached the goal after exploring ' + order.length + ' cells!', line: strategy.goalLine });
				break;
			}
			state.expand(u);
			rec.stats.Frontier = state.size();
			rec.add({ n: order.length, cur: u, front: state.items(), p: 0, msg: strategy.step(u, order.length), line: strategy.stepLine });
		}
		const path = [];
		if (reached) {
			for (let at = G.end; at !== -1; at = prev[at]) {
				path.push(at);
			}
			path.reverse();
			const stride = Math.max(1, Math.floor(path.length / 40));
			for (let k = stride; k < path.length + stride; k += stride) {
				const upto = Math.min(k, path.length);
				rec.stats['Path length'] = upto - 1;
				rec.add({ n: order.length, cur: -1, front: [], p: upto, msg: upto === path.length ? 'Shortest route traced: ' + (path.length - 1) + ' steps.' : 'Tracing the path back through parent pointers…', line: strategy.pathLine });
				if (upto === path.length) {
					break;
				}
			}
			if (!strategy.optimal) {
				rec.frames[rec.frames.length - 1].msg = 'Path found: ' + (path.length - 1) + ' steps (not guaranteed shortest for this algorithm).';
			}
		} else {
			rec.add({ n: order.length, cur: -1, front: [], p: 0, msg: 'The frontier ran dry — no route exists. Remove a wall and try again.', line: strategy.pathLine });
		}
		return { frames: rec.frames, meta: { grid: G, order: order, visitedAt: visitedAt, path: reached ? path : [] } };
	}

	DSA.register({
		id: 'grid-bfs', group: 'pathfinding', name: 'Breadth-First Search', views: ['grid'], controls: controls, legend: legend,
		blurb: 'Floods outward one ring at a time. On an unweighted grid the first time it reaches the goal is guaranteed to be the shortest route.',
		complexity: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Shortest', 'Yes (unweighted)'], ['Uses', 'Queue']],
		code: [
			'queue = [start]',
			'while queue not empty:',
			'  u = queue.dequeue()',
			'  if u == goal: stop',
			'  for each open neighbour v not yet seen:',
			'    parent[v] = u; queue.enqueue(v)',
			'walk parent[] back from goal to build the path'
		],
		build: function () {
			return search({
				intro: 'Start in the queue. The wave expands from S.', stepLine: 4, goalLine: 3, pathLine: 6, optimal: true,
				init: function (G, prev) {
					const seen = new Uint8Array(G.rows * G.cols);
					const queue = [G.start];
					seen[G.start] = 1;
					return {
						size: function () { return queue.length; },
						next: function () { return queue.shift(); },
						items: function () { return queue.slice(); },
						expand: function (u) {
							neighbours(u).forEach(function (v) {
								if (!seen[v]) {
									seen[v] = 1;
									prev[v] = u;
									queue.push(v);
								}
							});
						}
					};
				},
				step: function (u, n) { return 'Visit cell #' + n + '; queue its unseen neighbours.'; }
			});
		}
	});

	DSA.register({
		id: 'grid-dfs', group: 'pathfinding', name: 'Depth-First Search', views: ['grid'], controls: controls, legend: legend,
		blurb: 'Commits to one direction until it hits a wall, then backtracks. It finds a route if one exists, but rarely the shortest one.',
		complexity: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Shortest', 'No'], ['Uses', 'Stack']],
		code: [
			'stack = [start]',
			'while stack not empty:',
			'  u = stack.pop()',
			'  if u == goal: stop',
			'  for each open neighbour v not yet visited:',
			'    parent[v] = u; stack.push(v)',
			'walk parent[] back from goal to build the path'
		],
		build: function () {
			return search({
				intro: 'Start on the stack. DFS dives along one direction first.', stepLine: 4, goalLine: 3, pathLine: 6, optimal: false,
				init: function (G, prev) {
					const stack = [G.start];
					const seen = new Uint8Array(G.rows * G.cols);
					return {
						size: function () { return stack.length; },
						next: function () {
							const u = stack.pop();
							seen[u] = 1;
							return u;
						},
						items: function () { return stack.slice(-60); },
						expand: function (u) {
							neighbours(u).reverse().forEach(function (v) {
								if (!seen[v]) {
									prev[v] = u;
									stack.push(v);
								}
							});
						}
					};
				},
				step: function (u, n) { return 'Visit cell #' + n + '; push its neighbours and dive deeper.'; }
			});
		}
	});

	function bestFirst(useCost, intro, optimal, label) {
		return search({
			intro: intro, stepLine: 5, goalLine: 3, pathLine: 7, optimal: optimal,
			init: function (G, prev) {
				const N = G.rows * G.cols;
				const g = new Int32Array(N).fill(1e9);
				const open = [G.start];
				g[G.start] = 0;
				const score = function (i) {
					const h = manhattan(i, G.end);
					return (useCost ? g[i] : 0) + h;
				};
				return {
					size: function () { return open.length; },
					next: function () {
						let best = 0;
						for (let i = 1; i < open.length; i++) {
							const a = score(open[i]);
							const b = score(open[best]);
							if (a < b || (a === b && manhattan(open[i], G.end) < manhattan(open[best], G.end))) {
								best = i;
							}
						}
						return open.splice(best, 1)[0];
					},
					items: function () { return open.slice(); },
					expand: function (u) {
						neighbours(u).forEach(function (v) {
							const cand = g[u] + 1;
							if (cand < g[v]) {
								g[v] = cand;
								prev[v] = u;
								if (open.indexOf(v) === -1) {
									open.push(v);
								}
							}
						});
					}
				};
			},
			step: function (u, n) { return 'Visit cell #' + n + ' — lowest ' + label + ' in the open set.'; }
		});
	}

	DSA.register({
		id: 'grid-astar', group: 'pathfinding', name: 'A* Search', views: ['grid'], controls: controls, legend: legend,
		blurb: 'Always expands the cell with the lowest f = g + h, where g is the cost so far and h is the straight-line (Manhattan) guess to the goal. Optimal and usually far fewer cells than BFS.',
		complexity: [['Time', 'O(E) typical'], ['Space', 'O(V)'], ['Shortest', 'Yes (admissible h)'], ['Uses', 'Priority queue']],
		code: [
			'open = {start}; g[start] = 0',
			'while open not empty:',
			'  u = cell in open with the lowest f = g + h',
			'  if u == goal: stop',
			'  for each open neighbour v:',
			'    if g[u] + 1 < g[v]: update g, parent; add to open',
			'  // h = Manhattan distance to the goal',
			'walk parent[] back from goal to build the path'
		],
		build: function () {
			return bestFirst(true, 'Open set starts with S. f = cost so far + distance guess.', true, 'f score');
		}
	});

	DSA.register({
		id: 'grid-greedy', group: 'pathfinding', name: 'Greedy Best-First', views: ['grid'], controls: controls, legend: legend,
		blurb: 'Like A* but ignores the cost so far and chases the goal using only the heuristic. Blazing fast on open ground, but it can be led into dead ends and take longer paths.',
		complexity: [['Time', 'O(E) typical'], ['Space', 'O(V)'], ['Shortest', 'No'], ['Uses', 'Priority queue']],
		code: [
			'open = {start}',
			'while open not empty:',
			'  u = cell in open closest to the goal (h only)',
			'  if u == goal: stop',
			'  for each open neighbour v:',
			'    if not seen: parent[v] = u; add to open',
			'  // h = Manhattan distance to the goal',
			'walk parent[] back from goal to build the path'
		],
		build: function () {
			return bestFirst(false, 'Open set starts with S. Greedy only looks at distance to the goal.', false, 'heuristic');
		}
	});
})();
