'use strict';

Teach.add({
	graphs: {
		kid: {
			emoji: '🗺️',
			story: 'A graph is a map of dots and lines: friends and who knows whom, or towns and roads. To explore, you keep a to-do list of places to visit and a list of places you have already been, so you never go in circles.',
			say: [
				'Dots are things, lines are links between them.',
				'Visit a dot, write it in your "been here" list.',
				'Add its unvisited neighbours to your to-do list.',
			],
		},
		real: {
			title: 'How many handshakes from you to a stranger?',
			scenario:
				'You know A and B. A knows C. B knows D. C knows the stranger. Exploring level by level: you (0), A and B (1), C and D (2), stranger (3).',
			result:
				'BFS explores in rings, so the first time it reaches someone it has found the fewest hops. DFS dives deep first and does not promise that.',
		},
		diagram: {
			type: 'compare',
			title: 'Same graph, two to-do lists',
			left: ['BFS · queue', ['visit the closest first', 'finds the fewest steps', 'memory grows with the widest ring']],
			right: ['DFS · stack', ['dive down one path first', 'good for "is there a path / cycle"', 'memory grows with the deepest path']],
		},
		principle: {
			name: 'Mark before you revisit',
			rule: 'Record every visited node, or a cycle will keep you going forever.',
			why: 'Without a visited set, a graph with a loop turns your search into an infinite loop. Each node is processed once, so total work is O(V + E).',
		},
		design: {
			problem: 'Relationships are not a line or a tree; they can loop and connect anywhere.',
			choice: 'Store each node\'s neighbours (adjacency list) and explore with a stack or queue.',
			price: 'Adjacency lists are small for sparse graphs but make "is A linked to B?" a search; an adjacency matrix answers it fast but uses V² memory.',
		},
		edges: [
			['Disconnected graph', 'One start does not reach every node.', 'Loop over all nodes and start a search from each unvisited one.'],
			['Self loop or cycle', 'Infinite loop without a visited set.', 'Mark when you add to the queue.'],
			['Start equals target', 'Distance is 0.', 'Check before exploring.'],
			['Empty graph', 'No nodes to start from.', 'Return early.'],
			['Directed edges', 'A→B does not mean B→A.', 'Add edges in one direction only.'],
		],
		links: [
			['stacks-queues', 'The to-do list is a stack (DFS) or queue (BFS).'],
			['trees', 'A tree is a graph with no cycles.'],
			['advanced-graphs', 'When edges have costs.'],
			['matrices', 'A grid is a graph where each cell links to its neighbours.'],
		],
	},
	'advanced-graphs': {
		kid: {
			emoji: '🚌',
			story: 'Now each road has a price: some are quick, some are slow. To find the cheapest trip, you always walk from the cheapest place you have not finished yet, like picking the closest unvisited friend\'s house and checking whether going through it makes any other house cheaper to reach.',
			say: [
				'Write "cost so far" next to every place. Start is 0, the rest are "far away".',
				'Go to the cheapest place not done yet.',
				'Check each road from it: is this a cheaper way to the next place? If so, update it.',
			],
		},
		real: {
			title: 'Cheapest route A→D',
			scenario:
				'Roads: A–B 4, A–C 1, C–B 2, B–D 5, C–D 8. From A: C costs 1. From C: B becomes 1+2 = 3 (better than 4), D becomes 1+8 = 9. From B (3): D becomes 3+5 = 8 (better than 9).',
			result:
				'Cheapest A→D is 8 via A, C, B, D. The direct-looking A–B (4) road would have given 9. Picking the closest first gets this right.',
		},
		diagram: {
			type: 'flow',
			title: 'Dijkstra loop',
			nodes: [
				['pick cheapest', 'unfinished place, from the heap'],
				['look at roads', 'cost so far + road cost'],
				['update if cheaper', 'push new cost'],
			],
			loop: 'until the destination is finished',
		},
		principle: {
			name: 'Greedy is safe when no later surprise can improve it',
			rule: 'Once the cheapest unfinished place is picked, nothing else can reach it more cheaply because every road costs 0 or more.',
			why: 'A negative road breaks that promise, which is why Dijkstra needs non-negative weights.',
		},
		design: {
			problem: 'BFS counts hops, not costs, so it cannot handle weighted roads.',
			choice: 'Use a priority queue ({{heaps}}) so the next place is always the cheapest known.',
			price: 'O((V + E) log V). Negative edges need Bellman–Ford, and for all pairs use Floyd–Warshall.',
		},
		edges: [
			['Negative edge', 'Finished nodes may be improved later; answer is wrong.', 'Use Bellman–Ford.'],
			['Unreachable target', 'Cost stays infinite.', 'Return -1 or "no path".'],
			['Stale heap entries', 'Same node pushed several times.', 'Skip if popped cost is larger than the best known.'],
			['Ties', 'Many equal-cost paths.', 'Any of them is correct; say so.'],
		],
		links: [
			['graphs', 'Plain BFS/DFS first.'],
			['heaps', 'The priority queue picks the cheapest.'],
			['greedy-intervals', 'Same "pick the best now" idea.'],
		],
	},
	'greedy-intervals': {
		kid: {
			emoji: '🍭',
			story: 'You have a list of games, each with a start and end time, and you want to play as many as possible. The trick: always pick the game that ends first, because it leaves the most time for the rest. Take a little win now that never hurts later.',
			say: [
				'Line up the games by end time.',
				'Take the first one.',
				'Skip any game that overlaps what you took, take the next that fits.',
			],
		},
		real: {
			title: 'Meeting rooms',
			scenario:
				'Meetings: 9–10, 9–12, 10–11, 11–12. Sorted by end: 9–10, 10–11, 9–12, 11–12. Take 9–10. 10–11 starts at 10, ok, take. 9–12 overlaps, skip. 11–12 starts at 11, ok, take.',
			result: 'Three meetings fit. Picking the long 9–12 first would only allow one.',
		},
		diagram: {
			type: 'flow',
			title: 'Activity selection',
			nodes: [
				['sort', 'by end time'],
				['take first', 'remember its end'],
				['next fits?', 'start ≥ last end'],
				['take or skip', 'then repeat'],
			],
		},
		principle: {
			name: 'Greedy needs a proof',
			rule: 'A greedy rule is only correct if you can argue that the early choice never blocks a better overall answer.',
			why: 'Many natural-looking rules fail (e.g. "shortest meeting first"). Try small counterexamples before trusting one.',
		},
		design: {
			problem: 'Trying all combinations of intervals is exponential.',
			choice: 'Sort once, then decide each item in a single pass using one number: the last end.',
			price: 'O(n log n) for sorting. It only works for problems with the greedy-choice property; otherwise use DP ({{dynamic-programming}}).',
		},
		edges: [
			['Touching intervals [1,2] and [2,3]', 'Overlap or not?', 'State the rule; usually end ≤ next start is fine.'],
			['Identical intervals', 'Duplicates count as overlap.', 'Skip the second one.'],
			['Empty input', 'Nothing to pick.', 'Return 0 or [].'],
			['Nested intervals', 'One inside another.', 'Sort by end (select) or merge using max end (merge).'],
		],
		links: [
			['sorting-search', 'Sorting is the first step.'],
			['advanced-graphs', 'Dijkstra is greedy too.'],
			['dynamic-programming', 'When greedy fails.'],
		],
	},
	'dynamic-programming': {
		kid: {
			emoji: '📝',
			story: 'Climb stairs taking 1 or 2 steps. How many ways to reach step 10? Hard! But the ways to reach step 10 are the ways to reach step 9 plus the ways to reach step 8. Write each answer on a sticky note so you never work out the same step twice.',
			say: [
				'Break the big question into smaller versions of itself.',
				'Write each answer down the first time.',
				'Build up from the tiny answers to the big one.',
			],
		},
		real: {
			title: 'Ways to climb 5 stairs (1 or 2 steps)',
			scenario:
				'ways(1) = 1, ways(2) = 2. ways(3) = 1+2 = 3, ways(4) = 2+3 = 5, ways(5) = 3+5 = 8.',
			result:
				'Plain recursion repeats the same stairs many times (exponential). A table of notes needs just n additions.',
		},
		diagram: {
			type: 'flow',
			title: 'Stair table',
			nodes: [
				['step 1', '1 way'],
				['step 2', '2 ways'],
				['step 3', '3 = 1 + 2'],
				['step 4', '5 = 2 + 3'],
				['step 5', '8 = 3 + 5'],
			],
		},
		principle: {
			name: 'Remember, do not recompute',
			rule: 'When the same sub-question appears again and again, solve it once and store the answer.',
			why: 'It needs two properties: overlapping sub-problems (they repeat) and optimal substructure (a good big answer is built from good small ones).',
		},
		design: {
			problem: 'Recursion that branches twice at each level explodes into 2ⁿ calls, mostly duplicates.',
			choice: 'Define the state (what changes), the transition (how states link) and the base case, then fill a table in dependency order.',
			price: 'Memory for the table, and the hardest part is choosing the right state. Often only the last row or two is needed, so memory can shrink.',
		},
		edges: [
			['n = 0 or negative', 'Base case missing.', 'Define base cases first.'],
			['Order of filling', 'Reading a cell not yet computed.', 'Fill in an order where dependencies are done.'],
			['Impossible target', 'No combination works.', 'Use infinity for "cannot reach" and convert at the end.'],
			['Big inputs', 'Table too large.', 'Keep only the rows you need.'],
		],
		links: [
			['backtracking', 'DP is backtracking plus memory.'],
			['greedy-intervals', 'Use greedy when it is provably enough.'],
			['complexity', 'Why exponential becomes polynomial.'],
		],
	},
	'union-find': {
		kid: {
			emoji: '🎈',
			story: 'At the park, kids make friend groups. Each group has a captain with a coloured balloon. To ask "are Mia and Sam in the same group?", follow each kid up to their captain and compare balloons. When two groups become friends, one captain just joins the other captain\'s team. Nobody has to re-introduce everyone.',
			say: [
				'Every kid points to someone, up to the captain.',
				'Same captain means same group.',
				'To merge groups, make one captain follow the other.',
			],
		},
		real: {
			title: 'Network cables',
			scenario:
				'Five computers, 0 to 4. Cable 0–1, 1–2, 3–4 each join two different groups. Then someone adds cable 2–0. Both ends already share a captain, so the new cable creates a loop and is redundant.',
			result:
				'find tells you in almost constant time whether two machines are already connected, which is the core of cycle detection and Kruskal\'s spanning tree.',
		},
		diagram: {
			type: 'flow',
			title: 'Merging groups',
			nodes: [
				['5 groups', '{0} {1} {2} {3} {4}'],
				['union 0–1, 1–2', '{0,1,2} {3} {4}'],
				['union 3–4', '{0,1,2} {3,4}'],
				['union 2–0', 'same captain → cycle!'],
			],
		},
		principle: {
			name: 'Represent a group by one leader',
			rule: 'Instead of storing every pair, store one pointer per item and compare leaders.',
			why: 'The pointer forest is tiny, and a little tidying (compression, small-under-large) keeps every lookup short.',
		},
		design: {
			problem: 'Repeatedly asking "are these connected?" while groups merge would need a full graph search each time.',
			choice: 'A forest where each node points to a parent; find follows to the root, union joins roots.',
			price: 'Merging only: you cannot split a group again, and it tells you whether items are connected but not the path between them.',
		},
		edges: [
			['Compare parents, not roots', 'Two items in one group can have different parents.', 'Always compare find(a) with find(b).'],
			['Union of the same group', 'Joining a root to itself creates a loop in the forest.', 'Return early if the roots are equal.'],
			['Long chain', 'find takes O(n).', 'Union by size and path compression.'],
			['Deleting an edge', 'Not supported.', 'Rebuild, or process offline in reverse.'],
			['1-based node numbers', 'Off-by-one array size.', 'Allocate n + 1 or subtract 1.'],
		],
		links: [
			['graphs', 'It answers connectivity without a traversal.'],
			['advanced-graphs', 'Kruskal\'s minimum spanning tree uses it.'],
			['arrays', 'The forest is stored in a plain array.'],
		],
	},
});
