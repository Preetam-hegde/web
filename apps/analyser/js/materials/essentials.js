'use strict';

Teach.add({
	tries: {
		kid: {
			emoji: '📖',
			story: 'A trie is a dictionary where words share a path. All words that start with "ca" walk the same two steps: c, then a. Then they split: "cat" goes to t, "car" goes to r. To see if a word exists, just follow its letters.',
			say: [
				'Each step down the tree is one letter.',
				'Words that start the same share the same first steps.',
				'Mark the spot where a real word ends.',
			],
		},
		real: {
			title: 'Autocomplete after typing "ca"',
			scenario:
				'Words: cat, car, cart, dog. Walk c → a (2 steps). Everything below that spot is a suggestion: cat, car, cart. "dog" is never visited.',
			result:
				'The work depends on the length of what you typed, not on how many words there are. A million words, same two steps.',
		},
		diagram: {
			type: 'flow',
			title: 'Path for "car" (cat shares c → a)',
			nodes: [
				['root', ''],
				['c', 'shared by cat, car, cart'],
				['a', 'shared'],
				['r ✓', 'word ends here; t continues to cart'],
			],
		},
		principle: {
			name: 'Share common prefixes',
			rule: 'Store the part that repeats once, not once per word.',
			why: 'Prefix questions become path-following, with no scanning of unrelated words.',
		},
		design: {
			problem: 'A hash map ({{hashing}}) answers "is this whole word present?" but cannot answer "which words start with ca?" without scanning everything.',
			choice: 'Make each letter a branch, so a prefix is a node.',
			price: 'A lot of memory for many small nodes. Use a compressed trie or a sorted array if memory matters.',
		},
		edges: [
			['Prefix is not a word', '"ca" exists as a path but is not a stored word.', 'Keep an end-of-word flag.'],
			['Empty string', 'Root itself.', 'Decide if it counts and document it.'],
			['Case and characters', '"Cat" vs "cat"; non-letters.', 'Normalise input; use a map for children.'],
			['Deleting a word', 'Removing nodes shared with others breaks them.', 'Unset the flag; prune only unused nodes.'],
		],
		links: [
			['trees', 'A trie is a tree with up to 26 children.'],
			['hashing', 'Compare with whole-word lookup.'],
		],
	},
	'bits-math': {
		kid: {
			emoji: '💡',
			story: 'Inside a computer every number is a row of tiny light switches that are on (1) or off (0). Bit tricks are about flipping, checking and counting those switches directly. Doubling a number is just sliding all the switches one place left.',
			say: [
				'A number is switches: 5 is 101.',
				'AND asks "are both on?", OR asks "is either on?", XOR asks "are they different?"',
				'Sliding switches left doubles, right halves.',
			],
		},
		real: {
			title: 'Find the one number that appears once in [4, 1, 2, 1, 2]',
			scenario:
				'XOR cancels equal numbers: a ^ a = 0 and a ^ 0 = a. So 4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1^1) ^ (2^2) = 4 ^ 0 ^ 0 = 4.',
			result:
				'One pass, no extra memory. A hash map ({{hashing}}) works too but uses O(n) space.',
		},
		diagram: {
			type: 'flow',
			title: 'XOR cancelling pairs',
			nodes: [
				['4 ^ 1', '= 5'],
				['5 ^ 2', '= 7'],
				['7 ^ 1', '= 6'],
				['6 ^ 2', '= 4, the loner'],
			],
		},
		principle: {
			name: 'Use the structure the data already has',
			rule: 'Numbers are bits, so some questions have direct answers without loops.',
			why: 'Bit operations are single CPU instructions, and tricks like n & (n − 1) clear the lowest set bit.',
		},
		design: {
			problem: 'Some problems need just yes/no per item or pairing, and full data structures are overkill.',
			choice: 'Pack flags into the bits of one integer; use XOR for pairing and n & (n−1) for counting.',
			price: 'Hard to read, and limited by the integer width; always comment the trick.',
		},
		edges: [
			['Negative numbers', 'Two\'s complement; >> may keep the sign.', 'Know whether your language has >> and >>>.'],
			['Zero', 'No bits set; n & (n−1) loops zero times.', 'Test zero explicitly.'],
			['Overflow', '1 << 31 or 1 << 32 behaves differently per language.', 'Check the integer width.'],
			['Operator precedence', 'a & b == c parses as a & (b == c).', 'Use parentheses.'],
		],
		links: [
			['hashing', 'The alternative that uses extra space.'],
			['backtracking', 'Bitmasks can represent subsets compactly.'],
		],
	},
	matrices: {
		kid: {
			emoji: '🎛️',
			story: 'A matrix is a grid like a chessboard. Each square is named by its row and column. To walk the board you can go up, down, left or right (and stay on the board). Treat each square as a dot with up to four neighbours and you can use the graph tricks.',
			say: [
				'Squares have a row and a column.',
				'Neighbours: up, down, left, right.',
				'Never step off the edge of the board.',
			],
		},
		real: {
			title: 'Count islands in a small map',
			scenario:
				'Grid: 1 1 0 / 0 1 0 / 0 0 1 (1 = land). Start at the first land cell and flood to all connected land, marking it visited: that covers three cells, one island. Then the lone cell at the bottom right is a second island.',
			result: 'Answer 2. Each cell is visited once, so O(rows × columns).',
		},
		diagram: {
			type: 'flow',
			title: 'Flood fill an island',
			nodes: [
				['find unvisited land', 'scan the grid'],
				['mark and expand', 'up, down, left, right'],
				['count + 1', 'when no more neighbours'],
			],
			loop: 'continue scanning for the next unvisited land',
		},
		principle: {
			name: 'Reuse what you already know',
			rule: 'A grid is a graph in disguise, so reuse BFS, DFS and visited marking instead of inventing a new method.',
			why: 'Recognising a familiar shape under a new look is the main skill in interviews.',
		},
		design: {
			problem: 'Two-dimensional data does not fit a single index.',
			choice: 'Use [row][col] and a list of direction offsets: (−1,0), (1,0), (0,−1), (0,1).',
			price: 'Bounds checks everywhere, and rows × columns memory.',
		},
		edges: [
			['Empty grid or empty row', 'grid[0].length crashes.', 'Check both dimensions first.'],
			['Edge and corner cells', 'Fewer than four neighbours.', 'Check bounds before reading a neighbour.'],
			['Single cell', 'Start equals end.', 'Test it directly.'],
			['Marking visited', 'Revisiting cells loops forever.', 'Mutate the grid or use a separate set.'],
			['Row vs column swap', 'Mixing x/y and row/col.', 'Pick row, col and stay consistent.'],
		],
		links: [
			['graphs', 'The same BFS/DFS applies.'],
			['prefix-sums', '2D prefix sums for rectangle totals.'],
			['dynamic-programming', 'Many DP tables are grids.'],
		],
	},
	'advanced-trees': {
		kid: {
			emoji: '⚖️',
			story: 'Picture a seesaw. If every kid sits on one side, it crashes. A balanced tree keeps both sides about even by shuffling kids when it tips. Other tricks are like keeping little running tallies: a tally for the first half, a tally for each quarter, so any "how many in this stretch?" is answered by adding a few tallies instead of counting everyone.',
			say: [
				'Keep the tree from tipping over to one side.',
				'Keep small running totals for chunks.',
				'Add a few chunk totals to answer a big question.',
			],
		},
		real: {
			title: 'Live score board',
			scenario:
				'Scores [3, 1, 4, 2] change all game, and you must show "total of the first three players" instantly. A prefix-sum array is quick to read but needs 4 rewrites every time one score changes. A Fenwick tree stores tree = [3, 4, 4, 10]: reading prefix(2) adds just 4 + 4 = 8, and a change touches only two cells.',
			result:
				'With a million players, an update costs about 20 steps instead of up to a million.',
		},
		diagram: {
			type: 'compare',
			title: 'Pick a structure by the question',
			left: ['Shape problem', ['sorted keys keep arriving → AVL or red-black tree', 'data on disk → B-tree or B+ tree', 'simple and randomised → skip list']],
			right: ['Range problem', ['sums with updates → Fenwick tree', 'min, max or lazy range updates → segment tree', 'no updates → prefix sums are enough']],
		},
		principle: {
			name: 'Pay a little on every change to keep every read cheap',
			rule: 'Rebalance, or maintain partial answers, as data changes so no single query has to do a full scan.',
			why: 'A small, bounded cost per update (about log n) buys log n queries forever.',
		},
		design: {
			problem: 'Plain search trees can become chains, and prefix sums break when values change.',
			choice: 'Rotations or node splits keep the height low; stored partial results give range answers by combining O(log n) pieces.',
			price: 'More complex code, extra memory for the partial results, and a need to choose the right tool for the operation (sum vs min/max).',
		},
		edges: [
			['Sorted insertions', 'Plain BST becomes a chain.', 'Use a self-balancing tree.'],
			['Index 0 in a Fenwick tree', 'i & -i is 0 and the loop never advances.', 'Shift indexes to start at 1.'],
			['Min or max in a Fenwick tree', 'A value cannot be subtracted back out.', 'Use a segment tree.'],
			['Update by value instead of difference', 'Totals become wrong.', 'Add the delta.'],
			['Empty range', 'left > right.', 'Return the identity (0 for sums).'],
		],
		links: [
			['trees', 'The plain BST these improve on.'],
			['prefix-sums', 'The static version of range sums.'],
			['bits-math', 'Fenwick uses the lowest-set-bit trick.'],
		],
	},
});
