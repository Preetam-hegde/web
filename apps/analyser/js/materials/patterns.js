'use strict';

Teach.add({
	'two-pointers': {
		kid: {
			emoji: '🚶‍♂️🚶‍♀️',
			story: 'Two friends stand at opposite ends of a hallway and walk toward each other. Each step, one of them moves, depending on a rule. They stop when they meet. They walk the hallway once together, not once each for every spot.',
			say: [
				'Put one finger at the start and one at the end.',
				'Look at both things. Too small? Move the left finger. Too big? Move the right finger.',
				'Stop when the fingers meet.',
			],
		},
		real: {
			title: 'Two prices that add to a gift card',
			scenario:
				'Sorted prices [3, 8, 12, 20, 30], card value 32. Fingers at 3 and 30 give 33: too big, move right finger to 20. 3 + 20 = 23: too small, move left finger to 8. 8 + 20 = 28, too small. 12 + 20 = 32. Found.',
			result:
				'Each step throws away one candidate forever, so total steps are at most n, not n².',
		},
		diagram: {
			type: 'flow',
			title: 'Fingers closing in on [3, 8, 12, 20, 30]',
			nodes: [
				['L=3, R=30', 'sum 33, too big → move R'],
				['L=3, R=20', 'sum 23, too small → move L'],
				['L=8, R=20', 'sum 28, too small → move L'],
				['L=12, R=20', 'sum 32, found'],
			],
		},
		principle: {
			name: 'Never revisit what a rule has ruled out',
			rule: 'Every move must be justified by something you already know, so a position is discarded for good.',
			why: 'Here, if the sum is too big even with the smallest left item, nothing on the right of that index can work, so the right finger can move safely.',
		},
		design: {
			problem: 'Checking every pair takes O(n²).',
			choice: 'Use the sorted order to decide which finger to move, so each step eliminates a whole group of pairs.',
			price: 'It needs sorted input (sorting costs O(n log n)) or a structure that makes the decision rule valid.',
		},
		edges: [
			['Empty or one item', 'Fingers start at the same place or cross immediately.', 'Loop while left < right.'],
			['Duplicates', 'Same value repeated can create duplicate answers.', 'Skip equal neighbours after moving.'],
			['No answer', 'Fingers meet without a match.', 'Return a clear "not found" value.'],
			['Unsorted input', 'The decision rule is wrong and answers are missed.', 'Sort first, or use a hash map ({{hashing}}).'],
		],
		links: [
			['arrays', 'The fingers are just indexes.'],
			['sliding-window', 'Both fingers move the same direction, keeping a stretch between them.'],
		],
	},
	'sliding-window': {
		kid: {
			emoji: '🪟',
			story: 'Hold a picture frame over a row of stickers. You see only a few at a time. Slide the frame one step: one sticker leaves on the left and one new sticker appears on the right. You do not recount everything, you just fix the difference.',
			say: [
				'Look through a window of a few items.',
				'Slide right: add the new item, drop the old item.',
				'Keep a running score so you never recount.',
			],
		},
		real: {
			title: 'Best 3 days of sales',
			scenario:
				'Daily sales [2, 1, 5, 1, 3, 2]. First window 2+1+5 = 8. Slide: remove 2, add 1 → 7. Slide: remove 1, add 3 → 9. Slide: remove 5, add 2 → 6. Best is 9.',
			result:
				'Each slide costs 2 operations instead of 3, and for a window of 1,000 days it is still 2. Total O(n).',
		},
		diagram: {
			type: 'flow',
			title: 'Window of size 3 moving along [2, 1, 5, 1, 3, 2]',
			nodes: [
				['[2 1 5] 1 3 2', 'sum 8'],
				['2 [1 5 1] 3 2', 'sum 7 = 8 − 2 + 1'],
				['2 1 [5 1 3] 2', 'sum 9 = 7 − 1 + 3'],
				['2 1 5 [1 3 2]', 'sum 6 = 9 − 5 + 2'],
			],
		},
		principle: {
			name: 'Update, do not recompute',
			rule: 'When the input changes a little, change the answer a little.',
			why: 'Most of the new window equals the old window. Reusing that shared part removes the repeated work.',
		},
		design: {
			problem: 'Recomputing every window from scratch costs O(n × k).',
			choice: 'Keep one running answer and two edges; moving an edge adds or removes exactly one item.',
			price: 'The quantity must be updatable when an item leaves (sums and counts are; a maximum needs a deque).',
		},
		edges: [
			['Window bigger than array', 'No full window exists.', 'Return early or use the whole array.'],
			['Window size 0 or negative', 'Meaningless answer.', 'Validate k first.'],
			['Negative numbers', 'A "shrink when too big" rule can fail because adding a value may lower the sum.', 'Use prefix sums + a map ({{prefix-sums}}) instead.'],
			['All items qualify', 'The window never shrinks.', 'Loop must still terminate by moving the right edge.'],
		],
		links: [
			['two-pointers', 'Same idea of two moving edges.'],
			['hashing', 'Counts of what is inside the window.'],
		],
	},
	'prefix-sums': {
		kid: {
			emoji: '🧮',
			story: 'You keep a running tally of the candy you collected: after day 1 you have 3, after day 2 you have 5, after day 3 you have 9. Want to know how many you got on days 2 and 3? Take the tally from day 3 and subtract the tally from day 1. No need to add them again!',
			say: [
				'Write the running total after each item.',
				'To get any middle stretch, take the later total and subtract the earlier one.',
				'Do the slow adding once, answer every question fast.',
			],
		},
		real: {
			title: 'Sales between day 2 and day 4',
			scenario:
				'Sales [3, 2, 4, 1, 5]. Running totals [0, 3, 5, 9, 10, 15]. Sales on days 2 to 4 (1-based) = total[4] − total[1] = 10 − 3 = 7, which equals 2 + 4 + 1.',
			result:
				'Building the table costs O(n) once; then each question costs O(1), instead of O(n) per question.',
		},
		diagram: {
			type: 'flow',
			title: 'Range sum = later total − earlier total',
			nodes: [
				['values', '3 2 4 1 5'],
				['totals', '0 3 5 9 10 15'],
				['question', 'days 2 to 4'],
				['answer', '10 − 3 = 7'],
			],
		},
		principle: {
			name: 'Precompute once, answer many times',
			rule: 'If you will be asked many similar questions, pay for the shared work up front.',
			why: 'The slow part (adding) is the same for every question, so doing it per question is waste.',
		},
		design: {
			problem: 'Each range query re-adds a long stretch of numbers.',
			choice: 'Store totals so any stretch becomes one subtraction. A leading 0 removes the special case for ranges starting at the front.',
			price: 'Extra O(n) memory, and if values change the table must be rebuilt (use a Fenwick tree for that).',
		},
		edges: [
			['Empty range', 'Left bound after right bound.', 'Return 0 or reject the query.'],
			['Range from index 0', 'total[left − 1] does not exist.', 'Store a leading 0 so the formula always works.'],
			['Large sums', 'Totals can exceed 32-bit integers.', 'Use a wider type.'],
			['Updates between queries', 'Table becomes stale.', 'Rebuild, or use a structure that supports updates.'],
		],
		links: [
			['arrays', 'The table is just another array.'],
			['hashing', 'Prefix sum + map finds subarrays summing to k.'],
			['matrices', 'The same idea in two dimensions.'],
		],
	},
	'sorting-search': {
		kid: {
			emoji: '📚',
			story: 'Books on a shelf in no order? To find one you check every book. Books sorted A to Z? Open the middle, decide "earlier or later", and throw away half the shelf. Keep going. Sorting is tidying up once so that finding is quick forever.',
			say: [
				'Tidy the shelf (sort) one time.',
				'Open the middle. Is my book before or after it?',
				'Throw away the half that cannot hold it. Repeat.',
			],
		},
		real: {
			title: 'Find one number in a sorted list of 1,000,000',
			scenario:
				'Linear search may look at up to 1,000,000 numbers. Binary search halves the range each time: 1,000,000 → 500,000 → 250,000 ... → 1. That is about 20 steps.',
			result:
				'20 steps instead of a million. Sorting costs O(n log n) once, so it pays off when you search many times.',
		},
		diagram: {
			type: 'flow',
			title: 'Binary search for 42 in [4, 9, 15, 23, 31, 42, 58]',
			nodes: [
				['whole range', 'indexes 0 to 6, mid is 23'],
				['23 < 42', 'throw away the left half'],
				['range 4 to 6', 'values 31, 42, 58, mid is 42'],
				['found', 'two looks instead of six'],
			],
			loop: 'Stop when found or when the range is empty',
		},
		principle: {
			name: 'Keep an invariant',
			rule: 'State something that stays true every loop, such as "the answer is always inside [left, right]".',
			why: 'If the invariant holds at the start and each step keeps it true, the loop must end with the right answer. Most binary search bugs come from a fuzzy invariant.',
		},
		design: {
			problem: 'Order lets you reject many items with a single comparison, but only if you use it.',
			choice: 'Compare with the middle so each comparison removes half; sort by divide and conquer (merge, quick) for O(n log n).',
			price: 'Binary search needs sorted data and random access. Merge sort needs extra space; quick sort can degrade to O(n²) with bad pivots.',
		},
		edges: [
			['Empty array', 'left > right at the start; loop never runs.', 'Return not found.'],
			['Duplicates', 'Which of the equal items is returned?', 'Decide: first, last, or any, and write the invariant for it.'],
			['mid overflow', 'left + right can overflow in fixed-size integers.', 'Use left + (right − left) / 2.'],
			['Target outside range', 'Search ends with pointers crossed.', 'Check the final left/right, not only mid.'],
			['Not sorted', 'Binary search silently gives wrong answers.', 'Sort first or use linear search.'],
		],
		links: [
			['complexity', 'Why log n is so small.'],
			['heaps', 'Heap sort is another O(n log n) sort.'],
		],
	},
});
