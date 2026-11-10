'use strict';

Teach.add({
	'linked-lists': {
		kid: {
			emoji: '🚂',
			story: 'A linked list is a toy train. Each carriage holds one thing and has a hook to the next carriage. You cannot jump to carriage 5; you start at the engine and follow the hooks. But adding a carriage is easy: just change which hook holds which.',
			say: [
				'Every carriage holds a thing and a hook to the next.',
				'To find something, walk from the engine.',
				'To add or remove, only re-hook the neighbours.',
			],
		},
		real: {
			title: 'Remove "B" from A → B → C',
			scenario:
				'Find the carriage just before B (that is A). Set A\'s hook to point at C instead of B. B is now unreachable and gets cleaned up. No other carriage moved.',
			result:
				'The removal itself touched one pointer: O(1) once you hold the node before it. Finding it first is the O(n) part.',
		},
		diagram: {
			type: 'flow',
			title: 'Removing B',
			nodes: [
				['A', 'next → B'],
				['change A.next', 'now → C'],
				['A → C', 'B is skipped'],
			],
			caption: 'Memory is not shifted, only a pointer is changed.',
		},
		principle: {
			name: 'Pay for flexibility with access',
			rule: 'Pieces joined by pointers are easy to rearrange but cannot be reached by position.',
			why: 'Contrast with an array ({{arrays}}): the array jumps anywhere but shifts on insert; the list rearranges cheaply but must be walked.',
		},
		design: {
			problem: 'Arrays make insert and delete in the middle costly because everything after must move.',
			choice: 'Store each item in its own node holding a link to the next one.',
			price: 'No random access, extra memory for pointers, and poor cache behaviour because nodes are scattered.',
		},
		edges: [
			['Empty list', 'head is null; head.next crashes.', 'Check head before dereferencing.'],
			['Remove the head', 'There is no previous node.', 'Use a dummy node before the head.'],
			['Single node', 'Next is null; "second to last" does not exist.', 'Handle length 1 separately or via dummy.'],
			['Cycle', 'A loop never reaches null.', 'Use slow and fast pointers to detect it.'],
		],
		links: [
			['two-pointers', 'Fast and slow pointers find the middle or a cycle.'],
			['stacks-queues', 'Both can be built from linked nodes.'],
		],
	},
	'stacks-queues': {
		kid: {
			emoji: '🥞',
			story: 'A stack is a pile of pancakes: you only add or eat from the TOP, so the last one added is eaten first. A queue is the slide line: new kids join at the BACK and the kid at the FRONT goes first. Same pile, two fairness rules.',
			say: [
				'Stack: last in, first out (pancakes).',
				'Queue: first in, first out (slide line).',
				'You only touch the ends, never the middle.',
			],
		},
		real: {
			title: 'Is "( [ ] )" balanced?',
			scenario:
				'Read left to right. "(" push. "[" push. "]" matches the top "[": pop. ")" matches the top "(": pop. The stack is empty at the end, so it is balanced. For "( ]", the "]" meets "(" on top: mismatch.',
			result:
				'The most recent opener must close first, exactly "last in, first out". That is why a stack fits.',
		},
		diagram: {
			type: 'compare',
			title: 'Two rules for the same pile',
			left: ['Stack (LIFO)', ['push and pop at the top', 'undo, brackets, DFS', 'last added leaves first']],
			right: ['Queue (FIFO)', ['enqueue at back, dequeue at front', 'scheduling, BFS', 'first added leaves first']],
		},
		principle: {
			name: 'Restrict access to guarantee behaviour',
			rule: 'Giving up the ability to touch the middle gives you a promise about order.',
			why: 'A smaller interface is easier to reason about and to make O(1). Use the structure whose rule matches the order your problem needs.',
		},
		design: {
			problem: 'Some problems need "most recent first" and others "oldest first", and a general list lets you break either.',
			choice: 'Expose only push/pop at one end (stack) or enqueue/dequeue at opposite ends (queue).',
			price: 'No searching in the middle; to find an item you must pop or dequeue until you reach it.',
		},
		edges: [
			['Pop or dequeue when empty', 'Underflow: crash or undefined.', 'Check empty first.'],
			['Fixed-size queue', 'Overflow when full; indexes wrap around.', 'Use a circular buffer and track the count.'],
			['Unmatched closer', 'Closing bracket with an empty stack.', 'Treat as invalid immediately.'],
			['Leftover openers', 'Stack not empty at the end.', 'Return stack.length == 0.'],
		],
		links: [
			['trees', 'DFS uses a stack, BFS uses a queue.'],
			['graphs', 'Choosing stack or queue changes how you explore.'],
			['linked-lists', 'A linked list gives O(1) at both ends.'],
		],
	},
	backtracking: {
		kid: {
			emoji: '🧭',
			story: 'You are in a maze. At every fork you pick a path. If it is a dead end, you walk back to the last fork and try a different path. You do not give up; you undo your last choice and try the next one.',
			say: [
				'Make a choice.',
				'If it is going well, keep choosing. If it fails, undo it.',
				'Try the next choice at that same fork.',
			],
		},
		real: {
			title: 'All subsets of [1, 2]',
			scenario:
				'Start with []. Choose 1 → [1]. From there choose 2 → [1,2]. Undo 2 → [1]. Undo 1 → []. Choose 2 → [2]. Undo → []. Every path ends with: [], [1], [1,2], [2].',
			result:
				'Choose, explore, un-choose visits every possibility once. For n items there are 2ⁿ subsets, so it is slow but complete.',
		},
		diagram: {
			type: 'flow',
			title: 'The three beats of every step',
			nodes: [
				['choose', 'add an option'],
				['explore', 'recurse deeper'],
				['un-choose', 'remove it again'],
			],
			loop: 'then try the next option at the same level',
		},
		principle: {
			name: 'Prune early',
			rule: 'Stop exploring the instant a path cannot lead to a valid answer.',
			why: 'Cutting a branch removes everything underneath it. One early cut can save millions of steps.',
		},
		design: {
			problem: 'Some problems have no formula; you must try combinations.',
			choice: 'Build the answer step by step, backing out of dead ends, with a check that rejects bad partial answers.',
			price: 'Exponential worst case. Without pruning it is brute force.',
		},
		edges: [
			['Empty input', 'One valid answer: the empty one.', 'Return [[]] rather than [].'],
			['Forgetting to undo', 'State leaks into sibling branches and answers are wrong.', 'Always pair every choose with an un-choose.'],
			['Saving the path by reference', 'Later changes mutate saved answers.', 'Copy the path when recording a result.'],
			['Duplicates in input', 'Same answer produced several times.', 'Sort and skip equal siblings.'],
		],
		links: [
			['trees', 'The recursion is a walk over a tree of choices.'],
			['dynamic-programming', 'If subproblems repeat, remember them instead of re-exploring.'],
		],
	},
	trees: {
		kid: {
			emoji: '🌳',
			story: 'A tree is a family tree. One person at the top, with children below, and their children below them. In a "higher or lower" tree, smaller numbers go left and bigger numbers go right. To find a number you only ask "left or right?" and skip whole branches.',
			say: [
				'Start at the top (root).',
				'Smaller? Go left. Bigger? Go right.',
				'Empty spot? That is where a new number belongs.',
			],
		},
		real: {
			title: 'Is 6 in this tree? (root 8, left 3, right 10, 3 has left 1 and right 6)',
			scenario:
				'6 < 8: go left to 3. 6 > 3: go right to 6. Found in 3 looks. We never visited 10 or 1.',
			result:
				'A balanced tree of 1,000,000 nodes is only about 20 levels deep, so search is about 20 steps. A lopsided tree is as slow as a list.',
		},
		diagram: {
			type: 'flow',
			title: 'Search path for 6',
			nodes: [
				['8', '6 < 8 → left'],
				['3', '6 > 3 → right'],
				['6', 'found'],
			],
			caption: 'The branches on the other side are never visited.',
		},
		principle: {
			name: 'Divide the problem recursively',
			rule: 'A tree is a node plus smaller trees, so a function on a tree is the answer for the node combined with the answers for its children.',
			why: 'Trust the recursion. Handle the empty tree, handle one node, and let the children solve themselves.',
		},
		design: {
			problem: 'A sorted array searches fast but inserts slowly; a linked list inserts fast but searches slowly.',
			choice: 'Keep items in a branching structure where each comparison picks one side and discards the other.',
			price: 'Speed depends on shape. Sorted insertions make a stick (O(n)), so real systems use self-balancing trees.',
		},
		edges: [
			['Empty tree (null)', 'Nothing to read; node.left would crash.', 'Make null the base case of every recursion.'],
			['Single node', 'Both children null; it is a leaf and the root.', 'Test height = 1 explicitly.'],
			['Skewed tree', 'Looks like a linked list; depth n and recursion may overflow.', 'Use a balanced tree or an iterative walk.'],
			['Duplicates', 'Which side do equal values go?', 'Pick one rule and apply it everywhere.'],
		],
		links: [
			['stacks-queues', 'DFS uses a stack, level-order uses a queue.'],
			['heaps', 'A heap is a tree stored in an array.'],
			['graphs', 'A tree is a graph with no cycles.'],
		],
	},
	heaps: {
		kid: {
			emoji: '👑',
			story: 'A heap is a family where every parent is bigger than their children (a max-heap), so the biggest is always the king at the top. Need the biggest? Look at the top. King leaves? The strongest child climbs up to take the crown.',
			say: [
				'The top of the pile is always the biggest (or smallest).',
				'New thing? Put it at the bottom, then let it climb while it beats its parent.',
				'Take the top? Move the last item up top and let it sink.',
			],
		},
		real: {
			title: 'A hospital waiting room',
			scenario:
				'Patients arrive with urgency scores. The doctor always wants the most urgent patient next, not the one who arrived first. A heap hands over the top patient in O(1) and fixes itself in O(log n) when someone arrives or leaves.',
			result:
				'Sorting the whole list after each arrival would be O(n log n) each time. The heap keeps just enough order.',
		},
		diagram: {
			type: 'flow',
			title: 'Insert 9 into a max-heap',
			nodes: [
				['add at bottom', 'next free spot'],
				['compare with parent', 'is 9 bigger?'],
				['swap upward', 'repeat until parent is bigger'],
			],
			loop: 'at most log n swaps, the height of the tree',
		},
		principle: {
			name: 'Keep only as much order as you need',
			rule: 'A heap does not sort everything; it only guarantees that the best item is on top.',
			why: 'Less order means cheaper updates. If you only ever ask for the extreme, full sorting is wasted work.',
		},
		design: {
			problem: 'You repeatedly need the best item while items keep arriving.',
			choice: 'A complete binary tree stored in an array: parent of i is (i−1)/2, children are 2i+1 and 2i+2. No pointers needed.',
			price: 'No fast search for arbitrary items, and no sorted traversal. Only the top is cheap to read.',
		},
		edges: [
			['Empty heap', 'Peek or pop has no top.', 'Check size first.'],
			['One item', 'Pop leaves an empty heap.', 'Handle the last-item swap carefully.'],
			['Equal priorities', 'Order of ties is not guaranteed.', 'Add a counter for stable ordering.'],
			['Max vs min', 'Wrong comparison direction flips the answer.', 'Negate values or pass a comparator.'],
		],
		links: [
			['trees', 'A heap is a complete binary tree.'],
			['advanced-graphs', 'Dijkstra uses a heap to pick the closest node.'],
			['sorting-search', 'Heap sort is selection sort with a heap.'],
		],
	},
});
