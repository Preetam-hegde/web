'use strict';

(function () {
	DSA.addGroup({ id: 'graphs', label: 'Graphs', hint: 'Traversal & paths' });

	const L = DSA.util.letter;

	const controls = [
		{ id: 'nodes', type: 'range', label: 'Nodes', min: 5, max: 12, value: 9 },
		{ id: 'start', type: 'select', label: 'Start', value: '0', options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { return [String(i), L(i)]; }) }
	];

	function orient(a, b, c) {
		return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
	}

	function crosses(p1, p2, p3, p4) {
		return orient(p1, p2, p3) * orient(p1, p2, p4) < 0 && orient(p3, p4, p1) * orient(p3, p4, p2) < 0;
	}

	// Planar-ish random weighted graph laid out on a jittered grid.
	function makeGraph(n, rand) {
		const cols = n <= 6 ? 3 : n <= 9 ? 4 : 5;
		const rows = Math.ceil(n / cols);
		const nodes = [];
		for (let i = 0; i < n; i++) {
			const c = i % cols;
			const r = Math.floor(i / cols);
			nodes.push({
				label: L(i),
				x: (c + 0.5 + (rand() - 0.5) * 0.45) / cols,
				y: (r + 0.5 + (rand() - 0.5) * 0.45) / rows
			});
		}
		const px = function (nd) {
			return { x: nd.x * 1000, y: nd.y * 480 };
		};
		const pairs = [];
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				const p = px(nodes[i]);
				const q = px(nodes[j]);
				pairs.push({ a: i, b: j, d: Math.hypot(p.x - q.x, p.y - q.y) });
			}
		}
		pairs.sort(function (u, v) {
			return u.d - v.d;
		});
		const parent = nodes.map(function (nd, i) {
			return i;
		});
		const find = function (x) {
			while (parent[x] !== x) {
				parent[x] = parent[parent[x]];
				x = parent[x];
			}
			return x;
		};
		const edges = [];
		const add = function (pair) {
			edges.push({ a: pair.a, b: pair.b, w: Math.max(1, Math.round(pair.d / 28)) });
		};
		pairs.forEach(function (pair) {
			const ra = find(pair.a);
			const rb = find(pair.b);
			if (ra !== rb) {
				parent[ra] = rb;
				add(pair);
			}
		});
		const degree = new Array(n).fill(0);
		edges.forEach(function (e) {
			degree[e.a]++;
			degree[e.b]++;
		});
		const target = Math.round(n * 1.35);
		pairs.forEach(function (pair) {
			if (edges.length >= target || pair.d > 330) {
				return;
			}
			if (edges.some(function (e) { return e.a === pair.a && e.b === pair.b; })) {
				return;
			}
			const p1 = px(nodes[pair.a]);
			const p2 = px(nodes[pair.b]);
			const blocked = edges.some(function (e) {
				if (e.a === pair.a || e.a === pair.b || e.b === pair.a || e.b === pair.b) {
					return false;
				}
				return crosses(p1, p2, px(nodes[e.a]), px(nodes[e.b]));
			});
			if (!blocked) {
				add(pair);
			}
		});
		const adj = nodes.map(function () {
			return [];
		});
		edges.forEach(function (e, k) {
			adj[e.a].push({ v: e.b, w: e.w, e: k });
			adj[e.b].push({ v: e.a, w: e.w, e: k });
		});
		adj.forEach(function (list) {
			list.sort(function (u, v) {
				return u.v - v.v;
			});
		});
		return { nodes: nodes, edges: edges, adj: adj };
	}

	function Scene(g, showWeights) {
		this.g = g;
		this.node = new Array(g.nodes.length).fill('');
		this.edge = new Array(g.edges.length).fill('');
		this.sub = new Array(g.nodes.length).fill('');
		this.showWeights = showWeights;
	}

	Scene.prototype.frame = function (extra) {
		const self = this;
		return Object.assign({
			net: {
				nodes: this.g.nodes.map(function (nd, i) {
					return { id: i, label: nd.label, x: nd.x, y: nd.y, cls: self.node[i], sub: self.sub[i] };
				}),
				edges: this.g.edges.map(function (e, k) {
					return { a: e.a, b: e.b, w: self.showWeights ? e.w : undefined, cls: self.edge[k] };
				})
			}
		}, extra);
	};

	function setup(p, rand, weights) {
		const n = p.nodes;
		const g = makeGraph(n, rand);
		const start = Math.min(parseInt(p.start, 10) || 0, n - 1);
		return { g: g, start: start, scene: new Scene(g, weights) };
	}

	const legendTraverse = [['', 'Undiscovered'], ['queued', 'Waiting'], ['cur', 'Current'], ['done', 'Finished'], ['tree', 'Tree edge']];

	DSA.register({
		id: 'bfs', group: 'graphs', name: 'Breadth-First Search', views: ['net', 'strip'], controls: controls, reroll: 'New graph', legend: legendTraverse,
		blurb: 'Explores the graph level by level using a queue: everything one hop away, then two hops, and so on. Finds fewest-edge paths.',
		complexity: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Uses', 'Queue'], ['Finds', 'Fewest hops']],
		code: [
			'queue = [start]; mark start discovered',
			'while queue is not empty:',
			'  u = queue.dequeue()',
			'  for each neighbour v of u:',
			'    if v is not discovered:',
			'      mark v; parent[v] = u; queue.enqueue(v)'
		],
		build: function (p, rand) {
			const s = setup(p, rand, false);
			const g = s.g;
			const sc = s.scene;
			const rec = DSA.util.recorder({ Visited: 0, 'Queue size': 1 });
			const found = new Uint8Array(g.nodes.length);
			const queue = [s.start];
			found[s.start] = 1;
			sc.node[s.start] = 'queued';
			const snap = function (msg, line) {
				rec.stats['Queue size'] = queue.length;
				rec.add(sc.frame({ msg: msg, line: line, strip: { a: queue.map(L), ptr: { 0: 'front' }, label: 'Queue', noIndex: true } }));
			};
			snap('Start at ' + L(s.start) + ': mark it discovered and enqueue it.', 0);
			while (queue.length) {
				const u = queue.shift();
				sc.node[u] = 'cur';
				snap('Dequeue ' + L(u) + ' and look at its neighbours.', 2);
				g.adj[u].forEach(function (nb) {
					const before = sc.edge[nb.e];
					sc.edge[nb.e] = 'compare';
					snap('Neighbour ' + L(nb.v) + (found[nb.v] ? ' is already discovered.' : ' is new.'), 3);
					if (!found[nb.v]) {
						found[nb.v] = 1;
						sc.node[nb.v] = 'queued';
						sc.edge[nb.e] = 'tree';
						queue.push(nb.v);
						snap('Discover ' + L(nb.v) + ': enqueue it.', 5);
					} else {
						sc.edge[nb.e] = before;
					}
				});
				sc.node[u] = 'done';
				rec.inc('Visited');
				snap(L(u) + ' is finished.', 1);
			}
			snap('Done — every reachable node was visited in order of distance.', -1);
			return { frames: rec.frames, meta: {} };
		}
	});

	DSA.register({
		id: 'dfs', group: 'graphs', name: 'Depth-First Search', views: ['net', 'strip'], controls: controls, reroll: 'New graph', legend: [['', 'Undiscovered'], ['queued', 'On the path'], ['cur', 'Current'], ['done', 'Finished'], ['tree', 'Tree edge']],
		blurb: 'Dives as deep as possible along one branch before backtracking, using recursion (the call stack). Great for connectivity, cycles and topological order.',
		complexity: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Uses', 'Stack / recursion'], ['Finds', 'Any path']],
		code: [
			'dfs(u):',
			'  mark u visited',
			'  for each neighbour v of u:',
			'    if v is not visited:',
			'      parent[v] = u',
			'      dfs(v)',
			'  // u finished — backtrack'
		],
		build: function (p, rand) {
			const s = setup(p, rand, false);
			const g = s.g;
			const sc = s.scene;
			const rec = DSA.util.recorder({ Visited: 0, Depth: 0 });
			const seen = new Uint8Array(g.nodes.length);
			const stack = [];
			const snap = function (msg, line) {
				rec.stats.Depth = stack.length;
				rec.add(sc.frame({ msg: msg, line: line, strip: { a: stack.map(L), ptr: { [stack.length - 1]: 'top' }, label: 'Call stack', noIndex: true } }));
			};
			const visit = function (u) {
				seen[u] = 1;
				stack.push(u);
				rec.inc('Visited');
				sc.node[u] = 'cur';
				snap('Enter ' + L(u) + '.', 1);
				g.adj[u].forEach(function (nb) {
					if (!seen[nb.v]) {
						sc.edge[nb.e] = 'tree';
						sc.node[u] = 'queued';
						snap(L(nb.v) + ' is unvisited — go deeper.', 5);
						visit(nb.v);
						sc.node[u] = 'cur';
						snap('Back at ' + L(u) + '. Try the next neighbour.', 2);
					} else if (sc.edge[nb.e] !== 'tree') {
						sc.edge[nb.e] = 'compare';
						snap(L(nb.v) + ' was already visited — skip it.', 3);
						sc.edge[nb.e] = '';
					}
				});
				sc.node[u] = 'done';
				stack.pop();
				snap(L(u) + ' has no more unvisited neighbours — backtrack.', 6);
			};
			snap('Start the dive from ' + L(s.start) + '.', 0);
			visit(s.start);
			snap('Done — every reachable node was visited.', -1);
			return { frames: rec.frames, meta: {} };
		}
	});

	DSA.register({
		id: 'dijkstra', group: 'graphs', name: "Dijkstra's Shortest Path", views: ['net', 'strip'], controls: controls, reroll: 'New graph',
		legend: [['', 'Unreached'], ['queued', 'Frontier'], ['cur', 'Settling'], ['done', 'Settled'], ['tree', 'Shortest path']],
		blurb: 'Always settle the closest unsettled node, then relax its edges: if going through it is shorter, update the neighbour. Numbers under nodes are distances from the start.',
		complexity: [['Time', 'O((V+E) log V)'], ['Space', 'O(V)'], ['Uses', 'Priority queue'], ['Needs', 'Non-negative weights']],
		code: [
			'dist[start] = 0; others = ∞',
			'pq = [start]',
			'while pq not empty:',
			'  u = node with the smallest dist',
			'  for each edge (u, v, w):',
			'    if dist[u] + w < dist[v]:',
			'      dist[v] = dist[u] + w; prev[v] = u'
		],
		build: function (p, rand) {
			const s = setup(p, rand, true);
			const g = s.g;
			const sc = s.scene;
			const n = g.nodes.length;
			const rec = DSA.util.recorder({ Settled: 0, Relaxations: 0 });
			const dist = new Array(n).fill(Infinity);
			const prevEdge = new Array(n).fill(-1);
			const settled = new Uint8Array(n);
			const open = [s.start];
			dist[s.start] = 0;
			sc.sub = dist.map(function (d) {
				return d === Infinity ? '∞' : d;
			});
			sc.node[s.start] = 'queued';
			const snap = function (msg, line) {
				const pq = open.slice().sort(function (a, b) {
					return dist[a] - dist[b];
				});
				rec.add(sc.frame({ msg: msg, line: line, strip: { a: pq.map(function (u) { return L(u) + ':' + dist[u]; }), ptr: { 0: 'next' }, label: 'Priority queue (node : distance)', noIndex: true } }));
			};
			snap('Distance to ' + L(s.start) + ' is 0; every other node is ∞.', 0);
			while (open.length) {
				open.sort(function (a, b) {
					return dist[a] - dist[b];
				});
				const u = open.shift();
				settled[u] = 1;
				rec.inc('Settled');
				sc.node[u] = 'cur';
				snap('Settle ' + L(u) + ' — its distance ' + dist[u] + ' is final.', 3);
				g.adj[u].forEach(function (nb) {
					if (settled[nb.v]) {
						return;
					}
					const before = sc.edge[nb.e];
					sc.edge[nb.e] = 'compare';
					const cand = dist[u] + nb.w;
					snap('Via ' + L(u) + ': ' + dist[u] + ' + ' + nb.w + ' = ' + cand + ' vs current ' + (dist[nb.v] === Infinity ? '∞' : dist[nb.v]) + '.', 5);
					if (cand < dist[nb.v]) {
						if (prevEdge[nb.v] >= 0) {
							sc.edge[prevEdge[nb.v]] = '';
						}
						if (dist[nb.v] === Infinity) {
							open.push(nb.v);
						}
						dist[nb.v] = cand;
						prevEdge[nb.v] = nb.e;
						rec.inc('Relaxations');
						sc.sub[nb.v] = cand;
						sc.node[nb.v] = 'queued';
						sc.edge[nb.e] = 'tree';
						snap('Shorter! dist[' + L(nb.v) + '] = ' + cand + '.', 6);
					} else {
						sc.edge[nb.e] = before;
					}
				});
				sc.node[u] = 'done';
				snap(L(u) + ' is settled.', 2);
			}
			snap('Done — highlighted edges form the shortest-path tree from ' + L(s.start) + '.', -1);
			return { frames: rec.frames, meta: {} };
		}
	});

	DSA.register({
		id: 'prim', group: 'graphs', name: "Prim's Minimum Spanning Tree", views: ['net', 'strip'], controls: controls, reroll: 'New graph',
		legend: [['', 'Outside tree'], ['queued', 'Candidate'], ['cur', 'Joining'], ['done', 'In the tree'], ['tree', 'MST edge']],
		blurb: 'Grow one tree outward from the start: repeatedly add the cheapest edge that connects a new node, so the whole graph is linked at minimum total weight.',
		complexity: [['Time', 'O(E log V)'], ['Space', 'O(V)'], ['Uses', 'Priority queue'], ['Result', 'Min total weight']],
		code: [
			'tree = {start}',
			'while tree does not cover every node:',
			'  pick the cheapest edge (u, v)',
			'    with u in tree and v outside',
			'  add v and the edge to the tree'
		],
		build: function (p, rand) {
			const s = setup(p, rand, true);
			const g = s.g;
			const sc = s.scene;
			const n = g.nodes.length;
			const rec = DSA.util.recorder({ 'Nodes in tree': 1, 'Total weight': 0 });
			const inTree = new Uint8Array(n);
			inTree[s.start] = 1;
			sc.node[s.start] = 'done';
			const snap = function (msg, line) {
				rec.add(sc.frame({ msg: msg, line: line }));
			};
			snap('Start the tree at ' + L(s.start) + '.', 0);
			for (let count = 1; count < n; count++) {
				let best = null;
				const candidates = [];
				g.edges.forEach(function (e, k) {
					if (inTree[e.a] !== inTree[e.b]) {
						candidates.push(k);
						if (!best || e.w < g.edges[best].w) {
							best = k;
						}
					}
				});
				if (best === null) {
					break;
				}
				candidates.forEach(function (k) {
					sc.edge[k] = 'compare';
				});
				snap('Edges leaving the tree: ' + candidates.map(function (k) { return g.edges[k].w; }).join(', ') + '. The cheapest is ' + g.edges[best].w + '.', 2);
				candidates.forEach(function (k) {
					sc.edge[k] = '';
				});
				const e = g.edges[best];
				const v = inTree[e.a] ? e.b : e.a;
				inTree[v] = 1;
				sc.edge[best] = 'tree';
				sc.node[v] = 'cur';
				rec.inc('Nodes in tree');
				rec.inc('Total weight', e.w);
				snap('Add ' + L(v) + ' via the edge of weight ' + e.w + '.', 4);
				sc.node[v] = 'done';
			}
			snap('Done — total weight of the minimum spanning tree is ' + rec.stats['Total weight'] + '.', -1);
			return { frames: rec.frames, meta: {} };
		}
	});
})();
