'use strict';

(function () {
	DSA.addGroup({ id: 'trees', label: 'Trees', hint: 'Binary search tree' });
	DSA.addGroup({ id: 'heaps', label: 'Heap', hint: 'Priority queue' });

	const valueControl = { id: 'value', type: 'number', label: 'Value', min: 1, max: 99, value: 45 };

	// ── Binary Search Tree ──────────────────────────────────────────────────
	const BST_MAX = 15;

	function clone(state) {
		return JSON.parse(JSON.stringify(state));
	}

	function newNode(state, v) {
		return { id: state.nextId++, v: v, l: null, r: null };
	}

	function plainInsert(state, v) {
		if (!state.root) {
			state.root = newNode(state, v);
			return;
		}
		let n = state.root;
		for (;;) {
			if (v === n.v) {
				return;
			}
			const side = v < n.v ? 'l' : 'r';
			if (!n[side]) {
				n[side] = newNode(state, v);
				return;
			}
			n = n[side];
		}
	}

	function sample(values) {
		const state = { root: null, nextId: 1 };
		values.forEach(function (v) {
			plainInsert(state, v);
		});
		return state;
	}

	function height(n) {
		return n ? 1 + Math.max(height(n.l), height(n.r)) : 0;
	}

	function count(n) {
		return n ? 1 + count(n.l) + count(n.r) : 0;
	}

	function treeFrame(state, o) {
		const lay = DSA.util.layoutTree(state.root);
		const cls = o.cls || {};
		const frame = {
			net: {
				nodes: lay.nodes.map(function (n) {
					return { id: n.id, label: n.label, x: n.x, y: n.y, cls: cls[n.id] || '' };
				}),
				edges: lay.edges.map(function (e) {
					return { a: e.a, b: e.b, cls: (o.edgeCls && o.edgeCls[e.a + '-' + e.b]) || '' };
				})
			},
			msg: o.msg,
			line: o.line,
			warn: !!o.warn,
			stats: { Nodes: count(state.root), Height: height(state.root) }
		};
		if (o.out) {
			frame.strip = { a: o.out, label: o.outLabel || 'Visit order', noIndex: true };
		}
		return frame;
	}

	// finds v; returns the trail of nodes visited plus the node, its parent and side
	function locate(state, v) {
		const trail = [];
		let parent = null;
		let side = null;
		let n = state.root;
		while (n) {
			trail.push(n);
			if (v === n.v) {
				return { trail: trail, node: n, parent: parent, side: side };
			}
			parent = n;
			side = v < n.v ? 'l' : 'r';
			n = n[side];
		}
		return { trail: trail, node: null, parent: parent, side: side };
	}

	function trailClasses(trail, current) {
		const cls = {};
		trail.forEach(function (n) {
			cls[n.id] = 'range';
		});
		if (current) {
			cls[current.id] = 'cur';
		}
		return cls;
	}

	function traversal(name, line, order) {
		return {
			id: name, label: name, run: function (s) {
				if (!s.root) {
					return { state: s, frames: [treeFrame(s, { msg: 'The tree is empty.', line: line, warn: true })] };
				}
				const seq = order(s.root);
				const frames = [];
				const visited = {};
				const out = [];
				seq.forEach(function (n) {
					out.push(n.v);
					frames.push(treeFrame(s, { cls: Object.assign({}, visited, { [n.id]: 'cur' }), msg: 'Visit ' + n.v + '.', line: line, out: out.slice() }));
					visited[n.id] = 'done';
				});
				frames.push(treeFrame(s, { cls: visited, msg: name + ' order: ' + out.join(', '), line: line, out: out.slice() }));
				return { state: s, frames: frames };
			}
		};
	}

	function inorder(n, acc) {
		if (n) {
			inorder(n.l, acc);
			acc.push(n);
			inorder(n.r, acc);
		}
		return acc;
	}

	function preorder(n, acc) {
		if (n) {
			acc.push(n);
			preorder(n.l, acc);
			preorder(n.r, acc);
		}
		return acc;
	}

	function postorder(n, acc) {
		if (n) {
			postorder(n.l, acc);
			postorder(n.r, acc);
			acc.push(n);
		}
		return acc;
	}

	function levelorder(root) {
		const acc = [];
		const queue = [root];
		while (queue.length) {
			const n = queue.shift();
			acc.push(n);
			if (n.l) {
				queue.push(n.l);
			}
			if (n.r) {
				queue.push(n.r);
			}
		}
		return acc;
	}

	DSA.register({
		id: 'bst', group: 'trees', name: 'Binary Search Tree', sandbox: true, views: ['net', 'strip'], controls: [valueControl],
		legend: [['', 'Node'], ['range', 'On the path'], ['cur', 'Current'], ['new', 'New'], ['hot', 'Found'], ['swap', 'Removing'], ['done', 'Visited']],
		blurb: 'Smaller values live in the left subtree, larger in the right. Search, insert and delete follow one root-to-leaf path — fast while the tree stays balanced.',
		complexity: [['Search', 'O(log n) avg'], ['Insert', 'O(log n) avg'], ['Delete', 'O(log n) avg'], ['Worst', 'O(n) skewed'], ['Traversal', 'O(n)']],
		code: [
			'insert(node, x):',
			'  if node == null: return new Node(x)',
			'  if x < node.value: node.left = insert(node.left, x)',
			'  else if x > node.value: node.right = insert(node.right, x)',
			'search(node, x): follow the same left / right rule',
			'delete(x): find the node, then —',
			'  0 children: just remove it',
			'  1 child: replace it with that child',
			'  2 children: copy the in-order successor, delete that',
			'inorder(n):   inorder(n.left);  visit(n); inorder(n.right)',
			'preorder(n):  visit(n); preorder(n.left);  preorder(n.right)',
			'postorder(n): postorder(n.left); postorder(n.right); visit(n)',
			'levelOrder(): queue = [root]; visit level by level'
		],
		init: function () {
			return sample([50, 30, 70, 20, 40, 60, 80]);
		},
		snapshot: function (s) {
			return treeFrame(s, { msg: 'Binary search tree ready. Insert, search, delete or traverse.', line: -1 });
		},
		ops: [
			{
				id: 'insert', label: 'Insert', run: function (s, value) {
					const st = clone(s);
					if (count(st.root) >= BST_MAX) {
						return { state: s, frames: [treeFrame(s, { msg: 'Demo tree is full (' + BST_MAX + ' nodes).', line: 0, warn: true })] };
					}
					const frames = [];
					if (!st.root) {
						st.root = newNode(st, value);
						frames.push(treeFrame(st, { cls: { [st.root.id]: 'new' }, msg: 'Empty tree — ' + value + ' becomes the root.', line: 1 }));
						return { state: st, frames: frames };
					}
					const trail = [];
					let n = st.root;
					for (;;) {
						frames.push(treeFrame(st, {
							cls: trailClasses(trail, n),
							msg: value === n.v ? value + ' already exists — duplicates are ignored.' : value + (value < n.v ? ' < ' : ' > ') + n.v + ' → go ' + (value < n.v ? 'left' : 'right') + '.',
							line: value < n.v ? 2 : 3,
							warn: value === n.v
						}));
						if (value === n.v) {
							return { state: s, frames: frames };
						}
						trail.push(n);
						const side = value < n.v ? 'l' : 'r';
						if (!n[side]) {
							n[side] = newNode(st, value);
							frames.push(treeFrame(st, { cls: Object.assign(trailClasses(trail), { [n[side].id]: 'new' }), msg: 'Empty spot — attach ' + value + ' here.', line: 1 }));
							return { state: st, frames: frames };
						}
						n = n[side];
					}
				}
			},
			{
				id: 'search', label: 'Search', run: function (s, value) {
					const loc = locate(s, value);
					const frames = [];
					const seen = [];
					loc.trail.forEach(function (n) {
						const last = n === loc.node;
						frames.push(treeFrame(s, {
							cls: Object.assign(trailClasses(seen, n), last ? { [n.id]: 'hot' } : {}),
							msg: last ? 'Found ' + value + ' after ' + loc.trail.length + ' step' + (loc.trail.length > 1 ? 's' : '') + '.' : value + (value < n.v ? ' < ' : ' > ') + n.v + ' → go ' + (value < n.v ? 'left' : 'right') + '.',
							line: 4
						}));
						seen.push(n);
					});
					if (!loc.node) {
						frames.push(treeFrame(s, { cls: trailClasses(loc.trail), msg: 'Fell off the tree — ' + value + ' is not here.', line: 4, warn: true }));
					}
					if (!frames.length) {
						frames.push(treeFrame(s, { msg: 'The tree is empty.', line: 4, warn: true }));
					}
					return { state: s, frames: frames };
				}
			},
			{
				id: 'delete', label: 'Delete', run: function (s, value) {
					const st = clone(s);
					const loc = locate(st, value);
					const frames = [];
					const seen = [];
					loc.trail.forEach(function (n) {
						const last = n === loc.node;
						frames.push(treeFrame(st, {
							cls: Object.assign(trailClasses(seen, n), last ? { [n.id]: 'swap' } : {}),
							msg: last ? 'Found ' + value + ' — decide how to remove it.' : 'Looking for ' + value + '… at ' + n.v + '.',
							line: 5
						}));
						seen.push(n);
					});
					if (!loc.node) {
						frames.push(treeFrame(st, { cls: trailClasses(loc.trail), msg: value + ' is not in the tree.', line: 5, warn: true }));
						return { state: s, frames: frames };
					}
					const node = loc.node;
					const replace = function (child) {
						if (!loc.parent) {
							st.root = child;
						} else {
							loc.parent[loc.side] = child;
						}
					};
					if (!node.l && !node.r) {
						frames.push(treeFrame(st, { cls: { [node.id]: 'swap' }, msg: 'Leaf node — simply cut it off.', line: 6 }));
						replace(null);
					} else if (!node.l || !node.r) {
						frames.push(treeFrame(st, { cls: { [node.id]: 'swap' }, msg: 'One child — lift that child into its place.', line: 7 }));
						replace(node.l || node.r);
					} else {
						let parent = node;
						let succ = node.r;
						const walk = [succ];
						while (succ.l) {
							parent = succ;
							succ = succ.l;
							walk.push(succ);
						}
						walk.forEach(function (w) {
							frames.push(treeFrame(st, { cls: { [node.id]: 'swap', [w.id]: 'cur' }, msg: 'Two children — find the in-order successor (smallest in the right subtree)…', line: 8 }));
						});
						frames.push(treeFrame(st, { cls: { [node.id]: 'swap', [succ.id]: 'hot' }, msg: 'Successor is ' + succ.v + '. Copy it into the node being deleted.', line: 8 }));
						node.v = succ.v;
						frames.push(treeFrame(st, { cls: { [node.id]: 'new', [succ.id]: 'swap' }, msg: 'Now remove the duplicate successor node.', line: 8 }));
						if (parent === node) {
							parent.r = succ.r;
						} else {
							parent.l = succ.r;
						}
					}
					frames.push(treeFrame(st, { msg: 'Deleted. The search-tree ordering still holds.', line: 5 }));
					return { state: st, frames: frames };
				}
			},
			traversal('In-order', 9, function (r) {
				return inorder(r, []);
			}),
			traversal('Pre-order', 10, function (r) {
				return preorder(r, []);
			}),
			traversal('Post-order', 11, function (r) {
				return postorder(r, []);
			}),
			traversal('Level-order', 12, levelorder),
			{
				id: 'random', label: 'Random tree', run: function () {
					const pool = [];
					for (let i = 1; i < 100; i++) {
						pool.push(i);
					}
					DSA.util.shuffle(pool, Math.random);
					const st = sample(pool.slice(0, 9));
					return { state: st, frames: [treeFrame(st, { msg: 'Built a random tree from 9 values.', line: 0 })] };
				}
			}
		]
	});

	// ── Binary Min-Heap ─────────────────────────────────────────────────────
	const HEAP_MAX = 15;

	function heapFrame(arr, o) {
		const lay = DSA.util.layoutHeap(arr);
		const cls = o.cls || {};
		const clsArr = arr.map(function (v, i) {
			return cls[i] || '';
		});
		return {
			net: {
				nodes: lay.nodes.map(function (n) {
					return { id: n.id, label: n.label, x: n.x, y: n.y, cls: cls[n.id] || '' };
				}),
				edges: lay.edges.map(function (e) {
					return { a: e.a, b: e.b, cls: '' };
				})
			},
			strip: { a: arr.slice(), cls: clsArr, label: 'Stored as an array — children of i are 2i+1 and 2i+2' },
			msg: o.msg,
			line: o.line,
			warn: !!o.warn,
			stats: { Size: arr.length, Height: arr.length ? Math.floor(Math.log2(arr.length)) + 1 : 0 }
		};
	}

	DSA.register({
		id: 'min-heap', group: 'heaps', name: 'Binary Min-Heap', sandbox: true, views: ['net', 'strip'], controls: [valueControl],
		legend: [['', 'Node'], ['compare', 'Comparing'], ['swap', 'Swapping'], ['new', 'New'], ['hot', 'Min / root']],
		blurb: 'A complete binary tree stored in an array where every parent is ≤ its children, so the smallest value is always at the root. The engine behind priority queues.',
		complexity: [['Peek min', 'O(1)'], ['Insert', 'O(log n)'], ['Extract min', 'O(log n)'], ['Build', 'O(n)'], ['Space', 'O(n)']],
		code: [
			'insert(x):',
			'  append x at the end',
			'  while parent > x:  swap with parent   // sift up',
			'extractMin():',
			'  min = a[0]; a[0] = a.pop()',
			'  while a child < a[i]: swap with smaller child  // sift down',
			'  return min',
			'peek(): return a[0]'
		],
		init: function () {
			return { arr: [5, 12, 9, 20, 17, 14, 25] };
		},
		snapshot: function (s) {
			return heapFrame(s.arr, { msg: 'Min-heap ready. Insert a value or extract the minimum.', line: -1 });
		},
		ops: [
			{
				id: 'insert', label: 'Insert', run: function (s, value) {
					if (s.arr.length >= HEAP_MAX) {
						return { state: s, frames: [heapFrame(s.arr, { msg: 'Demo heap is full (' + HEAP_MAX + ' items).', line: 0, warn: true })] };
					}
					const a = s.arr.concat([value]);
					const frames = [heapFrame(a, { cls: { [a.length - 1]: 'new' }, msg: 'Append ' + value + ' at the end to keep the tree complete.', line: 1 })];
					let i = a.length - 1;
					while (i > 0) {
						const p = Math.floor((i - 1) / 2);
						frames.push(heapFrame(a, { cls: { [i]: 'compare', [p]: 'compare' }, msg: 'Is parent ' + a[p] + ' > ' + a[i] + '?', line: 2 }));
						if (a[p] <= a[i]) {
							frames.push(heapFrame(a, { msg: 'No — heap order holds. Done.', line: 2 }));
							return { state: { arr: a }, frames: frames };
						}
						const tmp = a[p];
						a[p] = a[i];
						a[i] = tmp;
						frames.push(heapFrame(a, { cls: { [i]: 'swap', [p]: 'swap' }, msg: 'Yes — swap them (sift up).', line: 2 }));
						i = p;
					}
					frames.push(heapFrame(a, { cls: { 0: 'hot' }, msg: value + ' reached the root: it is the new minimum.', line: 2 }));
					return { state: { arr: a }, frames: frames };
				}
			},
			{
				id: 'extract', label: 'Extract min', run: function (s) {
					if (!s.arr.length) {
						return { state: s, frames: [heapFrame(s.arr, { msg: 'The heap is empty.', line: 3, warn: true })] };
					}
					const a = s.arr.slice();
					const min = a[0];
					const frames = [heapFrame(a, { cls: { 0: 'hot' }, msg: 'The minimum is the root: ' + min + '.', line: 4 })];
					if (a.length === 1) {
						frames.push(heapFrame([], { msg: 'Removed ' + min + '. The heap is now empty.', line: 6 }));
						return { state: { arr: [] }, frames: frames };
					}
					const last = a.pop();
					a[0] = last;
					frames.push(heapFrame(a, { cls: { 0: 'swap' }, msg: 'Move the last item ' + last + ' to the root, then sift it down.', line: 4 }));
					let i = 0;
					for (;;) {
						const l = 2 * i + 1;
						const r = l + 1;
						let small = i;
						if (l < a.length && a[l] < a[small]) {
							small = l;
						}
						if (r < a.length && a[r] < a[small]) {
							small = r;
						}
						const cls = { [i]: 'compare' };
						if (l < a.length) {
							cls[l] = 'compare';
						}
						if (r < a.length) {
							cls[r] = 'compare';
						}
						frames.push(heapFrame(a, { cls: cls, msg: small === i ? a[i] + ' is ≤ its children — heap order restored.' : 'Smaller child is ' + a[small] + ' < ' + a[i] + '.', line: 5 }));
						if (small === i) {
							break;
						}
						const tmp = a[small];
						a[small] = a[i];
						a[i] = tmp;
						frames.push(heapFrame(a, { cls: { [i]: 'swap', [small]: 'swap' }, msg: 'Swap down.', line: 5 }));
						i = small;
					}
					frames.push(heapFrame(a, { cls: { 0: 'hot' }, msg: 'Extracted ' + min + '. New minimum: ' + a[0] + '.', line: 6 }));
					return { state: { arr: a }, frames: frames };
				}
			},
			{
				id: 'peek', label: 'Peek', run: function (s) {
					if (!s.arr.length) {
						return { state: s, frames: [heapFrame(s.arr, { msg: 'The heap is empty.', line: 7, warn: true })] };
					}
					return { state: s, frames: [heapFrame(s.arr, { cls: { 0: 'hot' }, msg: 'peek() → ' + s.arr[0] + ' in O(1).', line: 7 })] };
				}
			}
		]
	});
})();
