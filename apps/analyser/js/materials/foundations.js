'use strict';

Teach.add({
	complexity: {
		kid: {
			emoji: '⏱️',
			story: 'Imagine finding your name on a class list. If the list has 10 names you look at every one. If it has 10,000 names, you would be there all day! "Complexity" just asks: when the list gets bigger, does the work get a little bigger, a lot bigger, or hardly bigger at all?',
			say: [
				'Count how many things you must touch.',
				'Double the pile. Did your work double? Quadruple? Barely move?',
				'Pick the way that grows slowest.',
			],
		},
		real: {
			title: 'Looking for a duplicate in a guest list',
			scenario:
				'A party has 1,000 guests. Checking every pair of guests means about 500,000 comparisons. Writing each name on a whiteboard and checking the board first means about 1,000 looks.',
			result:
				'Same answer, 500 times less work. The cleverness is not in typing faster; it is in making the work grow slower.',
		},
		diagram: {
			type: 'bars',
			title: 'Steps needed when n = 1,000',
			items: [
				['O(log n)', 10, '≈ 10'],
				['O(n)', 100, '1,000'],
				['O(n log n)', 100, '≈ 10,000'],
				['O(n²)', 100, '1,000,000'],
			],
			caption:
				'Bars are not drawn to scale (n² would be off the page). The numbers on the right are the point.',
		},
		principle: {
			name: 'Measure growth, not seconds',
			rule: 'Judge a solution by how its work grows as the input grows, because a fast laptop hides a slow idea.',
			why: 'A slow idea on a fast machine still loses to a good idea on a slow machine once the input is big enough.',
		},
		design: {
			problem:
				'Stopwatch timings change with the computer, the language and the day. You cannot compare ideas that way.',
			choice:
				'Big O drops the constants and keeps only the shape of the growth curve, so ideas can be compared on paper.',
			price:
				'It hides constants. An O(n) method with a huge constant can lose to an O(n log n) one on small inputs.',
		},
		edges: [
			['n = 0 or 1', 'Loops run zero or one time; log n is 0 or undefined.', 'State the base case first; never assume at least two items.'],
			['Two inputs', 'Merging arrays of sizes n and m costs O(n + m), not O(n).', 'Name every variable (n, m, V, E) before counting.'],
			['Worst vs typical', 'Quick sort is O(n log n) usually and O(n²) on bad pivots.', 'Say which case you are quoting.'],
			['Hidden costs', 'String concatenation or slicing in a loop is secretly O(n) each time.', 'Count library calls, not just your own loops.'],
		],
		links: [
			['sorting-search', 'Binary search is the O(log n) example you can watch.'],
			['dynamic-programming', 'Remembering answers turns exponential work into polynomial work.'],
		],
	},
	arrays: {
		kid: {
			emoji: '🥚',
			story: 'An array is an egg carton. Every hole has a number: 0, 1, 2... If I say "give me hole 5", you go straight there. No searching! But to put a new egg in the middle, everyone after it has to scoot over one hole.',
			say: [
				'Each slot has a number (its index).',
				'Jumping to a numbered slot is instant.',
				'Squeezing something in the middle makes the rest scoot.',
			],
		},
		real: {
			title: 'A playlist of 8 songs',
			scenario:
				'Song 5 is at index 4. Playing it is one jump. Moving a new song to position 2 means the 6 songs after it each shift down one place: 6 moves.',
			result:
				'Reading by position is O(1); inserting or deleting in the middle is O(n). Adding at the end is the cheap place to write.',
		},
		diagram: {
			type: 'flow',
			title: 'Inserting 9 at index 2',
			nodes: [
				['[4, 7, 1, 8]', 'before'],
				['[4, 7, _, 1, 8]', 'shift 1 and 8 right'],
				['[4, 7, 9, 1, 8]', 'drop 9 into the gap'],
			],
			caption: 'Everything to the right of the gap pays the cost.',
		},
		principle: {
			name: 'Contiguous memory buys speed',
			rule: 'Keep items side by side and position becomes arithmetic: address = start + index × size.',
			why: 'Arithmetic is instant, and neighbours sit together in the cache so scanning is very fast in practice.',
		},
		design: {
			problem: 'We want to reach item number i without walking past items 0 to i-1.',
			choice: 'Store everything in one unbroken block so the computer can calculate where item i lives.',
			price: 'The block cannot grow in place and the middle cannot change cheaply. Dynamic arrays double their size now and then, which is cheap on average.',
		},
		edges: [
			['Empty array', 'No first or last element; arr[0] is out of range.', 'Check length before reading.'],
			['Index = length', 'One past the end. Common off-by-one.', 'Valid indexes are 0 to length - 1.'],
			['Negative or huge index', 'Some languages wrap around, others return undefined.', 'Validate or clamp before use.'],
			['Modifying while looping', 'Removing items mid-loop skips the next one.', 'Build a new array or loop backwards.'],
		],
		links: [
			['two-pointers', 'Two indexes walking the same array.'],
			['prefix-sums', 'Precompute once so range questions are O(1).'],
		],
	},
	hashing: {
		kid: {
			emoji: '🧦',
			story: 'You have a dresser with a drawer for each colour. To find your red socks you do not dig through everything; you open the "red" drawer. A hash map is that dresser. A little rule turns the name into a drawer number, so you go straight there.',
			say: [
				'A rule turns a key into a drawer number.',
				'Put the thing in that drawer. Later, use the rule again to find it.',
				'If two things want the same drawer, they share it.',
			],
		},
		real: {
			title: 'Two numbers that add to 9',
			scenario:
				'Numbers: [2, 7, 11, 5], target 9. Going left to right, for 2 we need 7: not seen, store 2. For 7 we need 2: seen! Answer found after two steps with no pair-by-pair checking.',
			result:
				'A map of "what I have seen" turns a nested loop (O(n²)) into one pass (O(n)).',
		},
		diagram: {
			type: 'flow',
			title: 'How a lookup works',
			nodes: [
				['key "red"', 'what you ask for'],
				['hash("red") = 3', 'turn it into a number'],
				['drawer 3', 'jump straight there'],
				['value', 'return it or find the key missing'],
			],
			caption: 'The cost is one calculation, not a search, as long as drawers are not crowded.',
		},
		principle: {
			name: 'Trade memory for time',
			rule: 'Spend extra space on a lookup table so repeated questions are answered instantly.',
			why: 'Many slow solutions ask the same question again and again. Remember the answer once and reuse it.',
		},
		design: {
			problem: 'Searching a list for a key costs O(n) every time you ask.',
			choice: 'Compute where the key must live from the key itself, so no searching is needed.',
			price: 'Extra memory, no useful order of keys, and collisions. Many keys in one drawer slow lookups down.',
		},
		edges: [
			['Collisions', 'Two keys land in one drawer; lookups slow towards O(n).', 'Good hash function and resize when drawers fill up.'],
			['Missing key', 'Lookup returns undefined or throws.', 'Use has() or a default value.'],
			['Mutable keys', 'Changing a key after inserting loses it.', 'Use immutable keys such as strings or numbers.'],
			['Key order', 'Maps do not give sorted order.', 'Need order? Sort the keys or use a tree ({{trees}}).'],
		],
		links: [
			['prefix-sums', 'Prefix sum plus a map counts subarrays with a target sum.'],
			['sliding-window', 'A map of counts tracks what is inside the window.'],
		],
	},
	recursion: {
		kid: {
			emoji: '🪆',
			story: 'Nesting dolls! To count the dolls, open the biggest one: if there is a smaller doll inside, ask "how many dolls are in that one?" and add one. When you reach the tiniest doll that has nothing inside, the answer is easy: zero. Recursion is solving a big job by handing a smaller copy of the same job to yourself.',
			say: [
				'Know when to stop (the smallest doll).',
				'Do one small piece, then pass a smaller job inward.',
				'Add up the answers on the way back out.',
			],
		},
		real: {
			title: 'Raise 2 to the 10th power fast',
			scenario:
				'Ten multiplications works, but halving is quicker: 2^10 = (2^5)². And 2^5 = (2²)² × 2, 2² = (2¹)², 2¹ = (2⁰)² × 2, and 2⁰ = 1. Going up: 2, 4, 32, 1024.',
			result:
				'Five calls instead of ten multiplications; for exponent 1,000,000 it is about 20 calls. Halving a problem is how O(log n) appears.',
		},
		diagram: {
			type: 'flow',
			title: 'Down, then back up',
			nodes: [
				['power(2,10)', 'ask for half'],
				['power(2,5)', 'ask for half'],
				['power(2,2) → (2,1) → (2,0)', 'base case: 1'],
				['multiply back up', '2, 4, 32, 1024'],
			],
			caption: 'Each call waits for a smaller call; the answers flow back in reverse order.',
		},
		principle: {
			name: 'Trust the smaller problem',
			rule: 'Assume the call on the smaller input is correct, then check only the step that combines it.',
			why: 'This is induction: a correct base case plus a correct step gives a correct function for every size, without tracing every nested call.',
		},
		design: {
			problem: 'Some problems are naturally made of smaller copies of themselves (trees, halving, splitting).',
			choice: 'A function that handles the smallest case directly and otherwise calls itself on a strictly smaller input, then combines.',
			price: 'Every active call uses stack memory, overlapping calls can repeat work, and a bad base case never stops.',
		},
		edges: [
			['No base case', 'Infinite recursion and a stack overflow.', 'Write the base case first.'],
			['Input never shrinks', 'Same call repeats forever.', 'Check each call makes the input strictly smaller.'],
			['Very deep input', 'A million nested calls overflow the stack.', 'Use a loop or an explicit stack ({{stacks-queues}}).'],
			['Repeated sub-problems', 'Exponential time, like naive Fibonacci.', 'Remember answers ({{dynamic-programming}}).'],
			['Negative or zero exponent', 'Halving never reaches the base case.', 'Handle the sign, then recurse on |n|.'],
		],
		links: [
			['complexity', 'Recurrences and recursion trees.'],
			['trees', 'Every tree algorithm is recursion.'],
			['backtracking', 'Recursion with undo.'],
			['sorting-search', 'Merge sort and quick sort are divide and conquer.'],
		],
	},
});
