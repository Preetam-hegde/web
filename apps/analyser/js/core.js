'use strict';

/*
 * DSA Visualizer core.
 * Every algorithm is registered with DSA.register() and produces a list of
 * immutable "frames" (full snapshots). The player simply walks that list, so
 * play / pause / step back / scrub all come for free.
 */
const DSA = {
	groups: [],
	algos: [],
	views: {},
	util: {}
};

DSA.addGroup = function (group) {
	this.groups.push(group);
};

DSA.register = function (algo) {
	this.algos.push(algo);
};

DSA.util.esc = function (value) {
	return String(value).replace(/[&<>"]/g, function (ch) {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
	});
};

DSA.util.letter = function (index) {
	return String.fromCharCode(65 + index);
};

// Small seeded PRNG (mulberry32) so switching algorithms keeps the same data.
DSA.util.rng = function (seed) {
	let t = seed >>> 0;
	return function () {
		t += 0x6D2B79F5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
};

DSA.util.shuffle = function (arr, rand) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		const tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
};

DSA.util.makeArray = function (size, pattern, rand) {
	const lo = 10;
	const hi = 100;
	const base = [];
	for (let i = 0; i < size; i++) {
		base.push(Math.round(lo + (hi - lo) * (size === 1 ? 1 : i / (size - 1))));
	}
	switch (pattern) {
		case 'reversed':
			return base.reverse();
		case 'nearly': {
			const swaps = Math.max(2, Math.round(size / 8));
			for (let k = 0; k < swaps; k++) {
				const i = Math.floor(rand() * size);
				const j = Math.min(size - 1, i + 1 + Math.floor(rand() * 3));
				const tmp = base[i];
				base[i] = base[j];
				base[j] = tmp;
			}
			return base;
		}
		case 'few': {
			const levels = [25, 50, 75, 100];
			return base.map(function () {
				return levels[Math.floor(rand() * levels.length)];
			});
		}
		default:
			return DSA.util.shuffle(base, rand);
	}
};

// Collects frames while keeping a running set of counters on every frame.
DSA.util.recorder = function (initialStats) {
	const frames = [];
	const stats = Object.assign({}, initialStats);
	return {
		frames: frames,
		stats: stats,
		add: function (frame) {
			frame.stats = Object.assign({}, stats);
			frames.push(frame);
			return frame;
		},
		inc: function (key, amount) {
			stats[key] = (stats[key] || 0) + (amount === undefined ? 1 : amount);
		}
	};
};

// Binary tree layout. Input nodes look like { id, v, l, r }.
// x comes from in-order position, y from depth (both normalised to 0..1).
DSA.util.layoutTree = function (root) {
	const nodes = [];
	const edges = [];
	if (!root) {
		return { nodes: nodes, edges: edges };
	}
	const placed = [];
	let counter = 0;
	let maxDepth = 0;
	(function walk(node, depth) {
		if (!node) {
			return;
		}
		walk(node.l, depth + 1);
		placed.push({ node: node, slot: counter++, depth: depth });
		maxDepth = Math.max(maxDepth, depth);
		walk(node.r, depth + 1);
	})(root, 0);
	const total = placed.length;
	const rows = Math.max(maxDepth, 3);
	placed.forEach(function (p) {
		nodes.push({ id: p.node.id, label: p.node.v, x: (p.slot + 0.5) / total, y: p.depth / rows });
		if (p.node.l) {
			edges.push({ a: p.node.id, b: p.node.l.id });
		}
		if (p.node.r) {
			edges.push({ a: p.node.id, b: p.node.r.id });
		}
	});
	return { nodes: nodes, edges: edges };
};

// Implicit binary heap layout (array index = node id).
DSA.util.layoutHeap = function (arr) {
	const nodes = [];
	const edges = [];
	const levels = arr.length ? Math.floor(Math.log2(arr.length)) + 1 : 1;
	const rows = Math.max(levels - 1, 3);
	arr.forEach(function (v, i) {
		const level = Math.floor(Math.log2(i + 1));
		const pos = i - (Math.pow(2, level) - 1);
		nodes.push({ id: i, label: v, x: (pos + 0.5) / Math.pow(2, level), y: level / rows });
		if (i > 0) {
			edges.push({ a: Math.floor((i - 1) / 2), b: i });
		}
	});
	return { nodes: nodes, edges: edges };
};
