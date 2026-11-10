'use strict';

// Mirrors the topic outline of roadmap.sh/datastructures-and-algorithms (checked 10 Nov 2026).
// [label, lessonId | null, why-not-a-lesson]
Teach.setRoadmap({
	title: 'Your path through data structures & algorithms',
	intro:
		'Follow the stages in order. Each chip opens the lesson that teaches it. Topics follow the community roadmap at',
	source: 'roadmap.sh',
	url: 'https://roadmap.sh/datastructures-and-algorithms',
	stages: [
		{
			title: 'Programming fundamentals',
			topics: [
				['Pick a language', null, 'Examples here use JavaScript'],
				['Syntax & control structures', null, 'Prerequisite'],
				['Functions', null, 'Prerequisite'],
				['OOP basics', null, 'Prerequisite'],
				['Pseudo code', null, 'Each lesson shows the idea in steps before code'],
				['Recursion', 'recursion'],
			],
		},
		{
			title: 'Algorithmic complexity',
			topics: [
				['Big-O, Big-Ω, Big-θ', 'complexity'],
				['Time vs space', 'complexity'],
				['Common runtimes', 'complexity'],
				['How to calculate complexity', 'complexity'],
			],
		},
		{
			title: 'Basic data structures',
			topics: [
				['Array', 'arrays'],
				['Linked lists', 'linked-lists'],
				['Stacks', 'stacks-queues'],
				['Queues', 'stacks-queues'],
				['Hash tables', 'hashing'],
			],
		},
		{
			title: 'Sorting & searching',
			topics: [
				['Linear search', 'sorting-search'],
				['Binary search', 'sorting-search'],
				['Bubble, selection, insertion sort', 'sorting-search'],
				['Merge, quick, heap sort', 'sorting-search'],
			],
		},
		{
			title: 'Trees & heaps',
			topics: [
				['Binary trees & BST', 'trees'],
				['In/pre/post-order traversal', 'trees'],
				['Heap', 'heaps'],
				['Trie', 'tries'],
				['AVL trees, B-trees, skip lists', 'advanced-trees'],
				['2-3 trees, ISAM', null, 'Related to B-trees; covered only as a mention'],
			],
		},
		{
			title: 'Graphs',
			topics: [
				['Directed & undirected graphs', 'graphs'],
				['Breadth-first search', 'graphs'],
				['Depth-first search', 'graphs'],
				['Dijkstra, Bellman-Ford, A*', 'advanced-graphs'],
				['Minimum spanning tree (Prim, Kruskal)', 'advanced-graphs'],
				['Disjoint set (union-find)', 'union-find'],
			],
		},
		{
			title: 'Problem-solving techniques',
			topics: [
				['Brute force', 'backtracking'],
				['Backtracking', 'backtracking'],
				['Divide and conquer', 'recursion'],
				['Greedy algorithms', 'greedy-intervals'],
				['Dynamic programming', 'dynamic-programming'],
				['Randomised algorithms', null, 'Overview only: not a separate lesson'],
				['Multi-threaded algorithms', null, 'Outside this guide'],
			],
		},
		{
			title: 'Interview patterns',
			topics: [
				['Two pointers', 'two-pointers'],
				['Fast & slow pointers', 'linked-lists'],
				['Sliding window', 'sliding-window'],
				['Merge intervals', 'greedy-intervals'],
				['Two heaps & Kth element', 'heaps'],
				['Island traversal', 'matrices'],
				['Prefix sums', 'prefix-sums'],
				['Bit manipulation', 'bits-math'],
				['Cyclic sort', null, 'A small array trick; not a separate lesson'],
			],
		},
		{
			title: 'Advanced structures',
			topics: [
				['Fenwick tree', 'advanced-trees'],
				['Segment tree', 'advanced-trees'],
				['Suffix trees & arrays', null, 'Specialised string structure; outside this guide'],
			],
		},
		{
			title: 'Practise',
			topics: [
				['LeetCode-style problems', null, 'Use the interview problems tab, then an online judge'],
			],
		},
	],
});
