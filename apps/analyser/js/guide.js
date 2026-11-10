'use strict';

// Original explanations and exercises; external reading lives in the guide's resources section.
DSA.lessons = [
	{
		id: 'complexity',
		title: 'Complexity & problem solving',
		phase: 'Foundations',
		lead: 'Describe how work grows before deciding whether a solution will scale.',
		model:
			'Big O is a growth bound, not a stopwatch. Count the work as the input grows, then state the assumptions behind that count.',
		concepts: [
			'Define your variables first: n can be array length, V the number of vertices, E the number of edges, and h a tree height. Two independent inputs need two variables. Comparing every pair from arrays of lengths n and m costs O(nm), not automatically O(n²).',
			'Add consecutive costs and multiply repeated costs. A linear scan followed by a sort is O(n + n log n) = O(n log n). Nested loops are not always quadratic: if two pointers only move forward across n items, their total movement is O(n).',
			'Worst case, average case, expected cost and amortized cost answer different questions. Dynamic-array append is amortized O(1): occasional O(n) resizes are spread across many appends. Hash lookup is expected O(1) with suitable hashing and load management; collisions can make a single operation O(n).',
			'Count auxiliary memory separately from the input and returned output. Recursion uses stack memory even when no array is allocated. A balanced recursive tree walk uses O(h) stack with h = O(log n); a skewed tree can need O(n).',
			'Before coding: restate the task, clarify duplicates and empty input, write a small example, describe a brute-force baseline, find repeated work, and state an invariant. Constraints suggest an approach, but hardware, language and constants determine actual runtime.',
		],
		example: {
			title: 'Why a shrinking loop is logarithmic',
			rows: [
				['Start', 'n = 32', 'One candidate range contains 32 values.'],
				[
					'Halve repeatedly',
					'32 → 16 → 8 → 4 → 2 → 1',
					'Five halvings; log₂(32) = 5.',
				],
				['Generalize', 'n / 2ᵏ ≤ 1', 'Solving for k gives k ≥ log₂(n).'],
				[
					'Combine',
					'n items × log n halvings',
					'An independent halving loop for each item costs O(n log n).',
				],
			],
		},
		code: `function containsDuplicate(nums) {
	const seen = new Set();
	for (const value of nums) {
		if (seen.has(value)) return true;
		seen.add(value);
	}
	return false;
}`,
		invariant:
			'Before each iteration, seen contains exactly the earlier values. A match therefore proves that two different positions hold the same value.',
		cost: 'Expected O(n) time and O(n) auxiliary space. A nested comparison baseline takes O(n²) time and O(1) auxiliary space.',
		pitfalls: [
			'Dropping one variable when inputs have different sizes.',
			'Ignoring sorting, string copying or recursion in the cost.',
			'Calling a bound “O(1)” because the example happens to be small.',
		],
		recall: [
			'If a recursive function branches twice until depth n, is it O(n)?',
			'Usually no. A full binary recursion tree has about 2ⁿ nodes. Count calls, not just depth; its active call stack can still be O(n).',
		],
		labs: ['linear-search', 'binary-search'],
	},
	{
		id: 'arrays',
		title: 'Arrays & strings',
		phase: 'Foundations',
		lead: 'Use indices, contiguous ranges and careful mutation to turn data into something you can scan.',
		model:
			'An array is numbered storage. Its strength is jumping directly to an index; its cost is moving items when the shape changes.',
		concepts: [
			'Index access is O(1). Scanning is O(n). Inserting or removing near the front usually shifts O(n) items. A dynamic array reserves spare capacity so appending is amortized O(1). A slice normally copies its selected items, so do not treat repeated slicing as free.',
			'Distinguish a subarray (contiguous), a subsequence (relative order preserved, gaps allowed), and a subset (selection without an order requirement). Longest common subsequence and longest common substring require different recurrences.',
			'In JavaScript, strings are immutable and indices address UTF-16 code units. A split emoji can occupy two code units. Array.from(text) iterates code points; user-perceived characters can still contain multiple code points. State whether an interview problem restricts input to ASCII.',
			'For in-place compaction, keep a read index and a write index. Read every item once, write only the items you keep, and return the valid prefix length. To avoid overwriting unprocessed values during a merge, write from the end when the destination already has spare space.',
			'Use a matrix of examples: empty input, one item, repeated values, already sorted, reverse sorted, all negative, and very large values. JavaScript numeric sort needs a comparator: nums.sort((a, b) => a - b); the default compares strings and mutates the array.',
		],
		example: {
			title: 'Move zeroes while preserving nonzero order',
			rows: [
				['Read 0', '[0, 1, 0, 3, 12], write = 0', 'Skip the zero.'],
				[
					'Read 1',
					'[1, 1, 0, 3, 12], write = 1',
					'The kept prefix is now [1].',
				],
				[
					'Read 3, then 12',
					'[1, 3, 12, 3, 12], write = 3',
					'Each surviving value is written once in order.',
				],
				[
					'Fill the suffix',
					'[1, 3, 12, 0, 0]',
					'Everything after the valid prefix becomes zero.',
				],
			],
		},
		code: `function moveZeroes(nums) {
	let write = 0;
	for (const value of nums) {
		if (value !== 0) nums[write++] = value;
	}
	while (write < nums.length) nums[write++] = 0;
	return nums;
}`,
		invariant:
			'Before reading the next item, nums[0..write) contains exactly the nonzero items already read, in their original order. The write index never passes the read index.',
		cost: 'O(n) time, O(1) auxiliary space. The returned array is the same mutated input.',
		pitfalls: [
			'Mutating a shared input when the caller needs the original.',
			'Using default JavaScript sort for numeric order.',
			'Confusing subsequences with contiguous windows.',
		],
		recall: [
			'Why can writing into earlier positions be safe?',
			'The write pointer never runs ahead of the read pointer, so it cannot overwrite an item that still needs to be inspected.',
		],
		labs: ['linear-search', 'insertion'],
	},
	{
		id: 'hashing',
		title: 'Hash maps & sets',
		phase: 'Foundations',
		lead: 'Remember the information a later item will need, instead of searching the past again.',
		model:
			'A map answers “what do I know about this key?” A set answers “have I seen this key?” Choose the smallest useful fact to store.',
		concepts: [
			'Use a set for membership and a map for counts, indices, groups or cached results. A frequency map preserves multiplicity: a set cannot tell whether a letter occurs once or five times. For a small fixed alphabet, a count array can replace hashing.',
			'Two Sum is a complement lookup. When you see x, ask whether target − x appeared earlier. Looking up before inserting prevents a single index from being reused. Whether you keep the first or most recent index depends on the problem.',
			'A canonical key makes equivalent objects share a bucket. Anagrams can be keyed by sorted letters or by a frequency signature. Include separators between counts so [1, 11] does not collide with [11, 1]. Building a key also has a time and memory cost.',
			'JavaScript Map and Set compare object keys by identity. Two separate arrays with equal contents are different keys. Use a deliberate string or numeric encoding for a coordinate or state. Map avoids inherited-property surprises when keys come from arbitrary strings.',
			'Hashing trades memory for fewer repeated searches. Expected O(1) operations assume appropriate hashing; if you need a deterministic bound, compare with sorting plus scanning or a balanced search tree. A sorted approach may lose original indices unless you carry them along.',
		],
		example: {
			title: 'Two Sum: [4, 7, 1, 9], target 10',
			rows: [
				['Index 0: value 4', 'Need 6; map is empty', 'Store 4 → 0.'],
				['Index 1: value 7', 'Need 3; not present', 'Store 7 → 1.'],
				['Index 2: value 1', 'Need 9; not present', 'Store 1 → 2.'],
				['Index 3: value 9', 'Need 1; found at index 2', 'Return [2, 3].'],
			],
		},
		code: `function twoSum(nums, target) {
	const indexByValue = new Map();
	for (let i = 0; i < nums.length; i++) {
		const needed = target - nums[i];
		if (indexByValue.has(needed)) {
			return [indexByValue.get(needed), i];
		}
		indexByValue.set(nums[i], i);
	}
	return [];
}`,
		invariant:
			'The map contains only earlier indices. If a complement is present, the returned indices are distinct and their values sum to the target.',
		cost: 'Expected O(n) time, O(n) space. Sorting plus two pointers takes O(n log n) time and needs index bookkeeping if original indices are required.',
		pitfalls: [
			'Testing map.get(key) for truthiness when 0 is a valid stored index.',
			'Using mutable object identity as a content-based key.',
			'Forgetting to count the cost of sorting or serializing each key.',
		],
		recall: [
			'Would inserting first break Two Sum on [3] with target 6?',
			'Yes. The new entry could match itself. Looking up first ensures a match comes from a different, earlier index.',
		],
		labs: [],
	},
	{
		id: 'two-pointers',
		title: 'Two pointers',
		phase: 'Array patterns',
		lead: 'Discard impossible candidates using order, symmetry or a read/write boundary.',
		model:
			'Each pointer marks a boundary. A move is justified only if you can explain why the candidates it skips cannot improve the answer.',
		concepts: [
			'Opposite-end pointers work when order gives a safe direction. In a sorted pair-sum problem, if the sum is too small, keeping the left value and decreasing the right value cannot help. Move left forward; the symmetric argument handles a sum that is too large.',
			'Same-direction pointers handle compaction and partitioning. A slow pointer marks where to write; a fast pointer finds the next useful item. Slow/fast speed differences can also detect a cycle in a linked structure.',
			'For 3Sum, sort once, fix an anchor, then use opposite-end pointers on the remaining suffix. Skip repeated anchors and repeated matched values to return unique triples. Sorting changes order, so clarify whether original indices or input preservation matter.',
			'Container With Most Water uses a different proof: area is width × the shorter height. Moving the taller side only shrinks width while the shorter height remains the limit. Discard the shorter side to search for a higher limiting wall.',
			'The linear bound comes from movement: left can advance at most n times and right can retreat at most n times. A loop with two pointers can be O(n), even when one pointer moves inside another loop.',
		],
		example: {
			title: 'Sorted pair sum: [1, 2, 4, 7, 11], target 9',
			rows: [
				['left = 0, right = 4', '1 + 11 = 12', 'Too large: discard 11.'],
				['left = 0, right = 3', '1 + 7 = 8', 'Too small: discard 1.'],
				['left = 1, right = 3', '2 + 7 = 9', 'The pair is found.'],
				['Stopping rule', 'left < right', 'Never reuse the same index.'],
			],
		},
		code: `function pairInSorted(nums, target) {
	let left = 0, right = nums.length - 1;
	while (left < right) {
		const sum = nums[left] + nums[right];
		if (sum === target) return [left, right];
		if (sum < target) left++;
		else right--;
	}
	return [];
}`,
		invariant:
			'If a valid pair has not yet been found, one still exists inside the current boundaries whenever one existed before the move. Sorted order justifies each discarded endpoint.',
		cost: 'O(n) time and O(1) auxiliary space for already sorted input. Include O(n log n) sorting if needed.',
		pitfalls: [
			'Applying sorted pair-sum movement to unsorted input.',
			'Skipping duplicates before recording a valid result.',
			'Claiming a greedy pointer move without a discard proof.',
		],
		recall: [
			'Why move left when the sum is too small?',
			'For that fixed left value, every smaller right value produces an equal or smaller sum. The left value cannot participate in a solution inside the remaining range.',
		],
		labs: [],
	},
	{
		id: 'sliding-window',
		title: 'Sliding windows',
		phase: 'Array patterns',
		lead: 'Maintain a contiguous range while updating only the items entering or leaving it.',
		model:
			'A window is a moving frame over an array. Keep just enough state to say whether the frame is valid and how good it is.',
		concepts: [
			'Fixed-size windows add the incoming item and remove the item k positions behind it. This changes repeated O(k) recomputation into O(1) updates per position. Validate k before assuming the first complete window exists.',
			'For a longest valid variable window, extend right, then shrink left while invalid, and measure only after validity is restored. For a shortest qualifying window, extend until qualified, then record and shrink while it remains qualified.',
			'Validity must react predictably to shrinking. For positive numbers, removing items cannot increase a sum, so a minimum-length sum window works. With arbitrary negative values, this monotonic property fails; prefix sums with a map or monotonic deque may be needed.',
			'For no repeated characters, use counts or last-seen positions. If a repeated character is found at index p inside the current window, jump left to p + 1. Never move left backward when the earlier occurrence is already outside the window.',
			'Window state can be a sum, frequency map, distinct count or number of unmet requirements. Minimum Window Substring needs multiplicities: one A does not satisfy a target requiring two As. Update “formed” only when a required count crosses its threshold.',
		],
		example: {
			title: 'Longest unique window in “abba”',
			rows: [
				['Read a at 0', 'Window “a”; best = 1', 'Remember a → 0.'],
				['Read b at 1', 'Window “ab”; best = 2', 'Remember b → 1.'],
				[
					'Read b at 2',
					'left becomes 2; window “b”',
					'Discard the earlier b and everything before it.',
				],
				[
					'Read a at 3',
					'left stays 2; window “ba”',
					'The a at 0 is outside the window; do not move backward.',
				],
			],
		},
		code: `function longestUnique(text) {
	const last = new Map();
	let left = 0, best = 0;
	for (let right = 0; right < text.length; right++) {
		const ch = text[right]; // ASCII input assumed
		if (last.has(ch)) left = Math.max(left, last.get(ch) + 1);
		last.set(ch, right);
		best = Math.max(best, right - left + 1);
	}
	return best;
}`,
		invariant:
			'After adjusting left, every character in [left, right] is unique. left only advances, and best records the longest valid window seen.',
		cost: 'Expected O(n) time, O(min(n, alphabet size)) space. For count-based shrinking, each item still enters and leaves at most once.',
		pitfalls: [
			'Updating the answer while the window is invalid.',
			'Using positive-sum window logic with negative numbers.',
			'Letting a last-seen position move left backward.',
		],
		recall: [
			'Why does a shrinking inner while loop not make the algorithm O(n²)?',
			'Across the entire run, left moves at most n times. Charge each removal to the one item removed.',
		],
		labs: [],
	},
	{
		id: 'prefix-sums',
		title: 'Prefix sums & range queries',
		phase: 'Array patterns',
		lead: 'Turn a range calculation into a difference between two accumulated states.',
		model:
			'A prefix sum is an odometer. The distance between two readings is the difference, so a whole range can be measured without walking it again.',
		concepts: [
			'Define prefix[0] = 0 and prefix[i + 1] = prefix[i] + nums[i]. Then sum over [left, right) is prefix[right] − prefix[left]. The extra zero makes ranges starting at index 0 behave like every other range.',
			'For subarray sum k, a current prefix S needs an earlier prefix S − k. Store frequencies rather than just membership because several earlier prefixes can produce different valid subarrays. Seed frequency(0) = 1 for subarrays beginning at the first item.',
			'Look up the needed prefix before adding the current one; otherwise k = 0 can count an empty range. Negative numbers are allowed because the method uses an algebraic equality rather than monotonic window movement.',
			'A difference array reverses the idea: add delta at a range start and subtract it at its exclusive end, then prefix-scan once to reconstruct all updates. It helps when many range additions are followed by one final read.',
			'Two-dimensional prefix sums use inclusion–exclusion: take the large rectangle, subtract the extra strip above and to the left, then add their overlap back. If values change frequently between queries, study Fenwick or segment trees after mastering static prefix sums.',
		],
		example: {
			title: 'Count subarrays of [1, −1, 1] summing to 1',
			rows: [
				[
					'Seed',
					'prefix = 0; counts = {0: 1}',
					'The empty prefix allows a range starting at index 0.',
				],
				[
					'Read 1',
					'prefix = 1; need 0; answer = 1',
					'Then store prefix 1 once.',
				],
				[
					'Read −1',
					'prefix = 0; need −1; answer = 1',
					'Store prefix 0 a second time.',
				],
				[
					'Read 1',
					'prefix = 1; need 0; answer = 3',
					'Two earlier zero prefixes create two more valid ranges.',
				],
			],
		},
		code: `function countSubarrays(nums, target) {
	const counts = new Map([[0, 1]]);
	let prefix = 0, answer = 0;
	for (const value of nums) {
		prefix += value;
		answer += counts.get(prefix - target) || 0;
		counts.set(prefix, (counts.get(prefix) || 0) + 1);
	}
	return answer;
}`,
		invariant:
			'Before the current prefix is inserted, counts records every earlier prefix and its multiplicity. Each match corresponds to one nonempty range ending here.',
		cost: 'Expected O(n) time and O(n) space for counting. A static prefix array costs O(n) to build and answers each range sum in O(1).',
		pitfalls: [
			'Missing the initial zero prefix.',
			'Storing only existence when the task asks for a count.',
			'Mixing inclusive endpoints with a half-open formula.',
		],
		recall: [
			'Why are two identical prefix sums useful?',
			'Their difference is zero, so the range between those prefix positions sums to zero. Repeated occurrences create multiple ranges.',
		],
		labs: [],
	},
	{
		id: 'sorting-search',
		title: 'Sorting & binary search',
		phase: 'Array patterns',
		lead: 'Create order when it is useful, then eliminate half the remaining choices at a time.',
		model:
			'Sorting makes nearby values meaningful. Binary search needs an ordered or monotonic decision, not necessarily a literal sorted array.',
		concepts: [
			'Know the tradeoffs: insertion sort is O(n²) worst case but O(n) on already sorted data; merge sort guarantees O(n log n) with O(n) auxiliary array space; heapsort guarantees O(n log n) in place; quicksort averages O(n log n) but can degrade to O(n²). A recursive quicksort stack is O(log n) on balanced partitions and O(n) in the worst case.',
			'A stable sort preserves the relative order of equal keys. This matters when sorting records by multiple fields or merging ordered streams. Comparison sorts require Ω(n log n) comparisons in the worst case; counting and radix methods use extra assumptions about keys.',
			'Choose one binary-search interval convention and keep it. A lower-bound search on [left, right) returns the first index with value at least target, or n if none exists. Its empty answer is an insertion position, not necessarily a found item.',
			'Binary search on the answer needs a monotonic predicate. If a capacity can ship packages within d days, any larger capacity can too. Search for the smallest feasible capacity, then prove the checker and its monotonicity.',
			'Boundary problems include first/last occurrence, rotated arrays and the first true predicate. Duplicates may remove the usual ordering information in a rotated array and force O(n) behavior. Do not claim O(log n) without the needed assumptions.',
		],
		example: {
			title: 'Lower bound of 2 in [1, 2, 2, 4]',
			rows: [
				[
					'[0, 4)',
					'mid = 2; value = 2',
					'Keep mid as a possible first match: right = 2.',
				],
				['[0, 2)', 'mid = 1; value = 2', 'right = 1.'],
				['[0, 1)', 'mid = 0; value = 1', 'Too small: left = 1.'],
				['[1, 1)', 'Return 1', 'The first value at least 2 is at index 1.'],
			],
		},
		code: `function lowerBound(nums, target) {
	let left = 0, right = nums.length;
	while (left < right) {
		const mid = left + Math.floor((right - left) / 2);
		if (nums[mid] < target) left = mid + 1;
		else right = mid;
	}
	return left;
}`,
		invariant:
			'Every index below left is too small; every index at or above right is large enough. The first valid position stays in the remaining boundary range.',
		cost: 'O(log n) time and O(1) space for lower bound on a random-access sorted array. Sorting first costs O(n log n), so a one-off unsorted lookup is often better served by a scan.',
		pitfalls: [
			'Returning an insertion index as if equality were guaranteed.',
			'Using right = mid − 1 with a half-open invariant.',
			'Ignoring input mutation and numeric comparators when sorting.',
		],
		recall: [
			'What if every element is smaller than target?',
			'The lower-bound result is nums.length. Check this boundary before reading nums[index] or claiming a match.',
		],
		labs: [
			'bubble',
			'selection',
			'insertion',
			'merge',
			'quick',
			'heap-sort',
			'binary-search',
		],
	},
	{
		id: 'linked-lists',
		title: 'Linked lists',
		phase: 'Core structures',
		lead: 'Reason about node identity and preserve the next pointer before rewiring a chain.',
		model:
			'A list is a chain of references. Rewiring a link is cheap once you have the relevant node; finding that node can require a full walk.',
		concepts: [
			'A singly linked node has a value and next reference. There is no O(1) indexing. Insertion after a known node is O(1); finding that node is O(n). Appending is O(1) only when a tail reference is maintained. Removing an arbitrary singly linked node usually needs its predecessor.',
			'A dummy head turns “remove the first node” into the same pointer operation as removing any other node. Return dummy.next, not dummy. Keep the distinction between changing a local head variable and changing an actual node link.',
			'To reverse a list, save next, redirect current.next to previous, then advance. Saving next first prevents losing the unprocessed suffix. An iterative reversal uses constant auxiliary space; recursive reversal normally uses O(n) call-stack space.',
			'Slow/fast pointers locate a midpoint or cycle. For a cycle, after slow and fast meet, reset one pointer to the head and advance both one step at a time to find the entry. Compare node identities, not values; repeated values do not imply a cycle.',
			'When merging lists, splice nodes only if mutation and shared ownership are acceptable. For intersection detection, shared node identity matters. Two lists with equal suffix values can still be completely separate lists.',
		],
		example: {
			title: 'Reverse A → B → C → null',
			rows: [
				[
					'Before',
					'previous = null; current = A',
					'The reversed prefix is empty.',
				],
				[
					'Process A',
					'A → null; current = B',
					'Save B before redirecting A.next.',
				],
				[
					'Process B',
					'B → A → null; current = C',
					'The untouched suffix remains reachable through current.',
				],
				[
					'Process C',
					'C → B → A → null',
					'current becomes null; previous is the new head.',
				],
			],
		},
		code: `function reverseList(head) {
	let previous = null, current = head;
	while (current !== null) {
		const next = current.next;
		current.next = previous;
		previous = current;
		current = next;
	}
	return previous;
}`,
		invariant:
			'previous points to the correctly reversed processed prefix, and current points to the untouched suffix. Together they still account for every original node.',
		cost: 'O(n) time, O(1) auxiliary space. This code assumes an acyclic list and mutates its links.',
		pitfalls: [
			'Overwriting next before saving it.',
			'Comparing values when the problem asks about shared nodes.',
			'Forgetting empty, singleton, head-removal and tail-removal cases.',
		],
		recall: [
			'Is deleting a node always O(1)?',
			'No. Rewiring known adjacent links is constant time, but finding the predecessor can cost O(n). The exact available references determine the cost.',
		],
		labs: ['linked-list'],
	},
	{
		id: 'stacks-queues',
		title: 'Stacks, queues & monotonic stacks',
		phase: 'Core structures',
		lead: 'Choose the next item by recency, arrival order or a maintained ordering rule.',
		model:
			'A stack resolves the most recent unfinished task. A queue processes the earliest waiting task. A monotonic stack keeps only unresolved candidates that can still matter.',
		concepts: [
			'Stacks are LIFO: push, pop and peek at the top. They fit nested parentheses, expression evaluation, undo and iterative DFS. Queues are FIFO and fit level-order traversal and shortest paths in unweighted graphs.',
			'In JavaScript, an array with a head index avoids repeated shift(), which can move many items. A growing head-index queue retains its backing storage; long-running production queues can use a ring buffer or periodic compaction.',
			'In a next-greater-element problem, store indices in decreasing value order. A larger incoming value resolves every smaller item it pops. Each index is pushed once and popped at most once, giving O(n) total work.',
			'Choose strict versus non-strict comparison deliberately. Next strictly greater uses a strict greater comparison; equal values stay unresolved. Histogram boundaries and duplicate handling need a matching convention.',
			'Deques support both ends. A monotonic deque can track the maximum of every k-length window: discard expired indices from the front and dominated values from the back. Retain indices so expiration can be checked.',
		],
		example: {
			title: 'Daily temperatures: [73, 71, 75]',
			rows: [
				['Day 0: 73', 'Stack [0]', 'No earlier day needs resolution.'],
				['Day 1: 71', 'Stack [0, 1]', 'A cooler day cannot resolve day 0.'],
				[
					'Day 2: 75',
					'Pop 1 → wait 1; pop 0 → wait 2',
					'75 is the first warmer day for both.',
				],
				[
					'Finish',
					'Answer [2, 1, 0]',
					'An unresolved day has no later warmer day.',
				],
			],
		},
		code: `function dailyTemperatures(temps) {
	const answer = Array(temps.length).fill(0);
	const stack = [];
	for (let i = 0; i < temps.length; i++) {
		while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
			const day = stack.pop();
			answer[day] = i - day;
		}
		stack.push(i);
	}
	return answer;
}`,
		invariant:
			'The stack contains unresolved indices in increasing index order and non-increasing temperature order. When an index is popped, the current day is its first warmer day.',
		cost: 'O(n) time and O(n) auxiliary stack space, plus O(n) output. Each index has at most one push and one pop.',
		pitfalls: [
			'Storing only values when distances or expiration need indices.',
			'Reading an empty stack top.',
			'Replacing a FIFO queue with a stack in shortest-path BFS.',
		],
		recall: [
			'Why may a smaller unresolved value be removed?',
			'The current larger value has resolved its first-greater query. That index can no longer contribute an unanswered query.',
		],
		labs: ['stack', 'queue'],
	},
	{
		id: 'backtracking',
		title: 'Recursion & backtracking',
		phase: 'Core structures',
		lead: 'Define what one call promises, then explore choices while restoring shared state.',
		model:
			'Recursion solves a smaller version of the same problem. Backtracking walks a decision tree: choose, explore, undo.',
		concepts: [
			'A recursive contract says what the function receives and returns. The base case handles the smallest valid input; every recursive step must make measurable progress toward it. Trace the call stack on a tiny input before trusting the recurrence.',
			'Distinguish the active path from all results. When recording an answer built in a mutable path array, copy it. Storing the same array reference repeatedly would make previously recorded answers change as the search continues.',
			'Subsets decide include/exclude; permutations choose an unused next item; combinations advance a start index to avoid order duplicates. For repeated input values, sort and skip duplicates at the same decision depth, rather than deleting every repeated value globally.',
			'Pruning rejects a partial candidate as soon as it cannot lead to a valid answer. In N-Queens, occupied columns and diagonals rule out placements before later rows are explored. In a positive-number combination-sum search, a sorted candidate larger than the remaining target can stop that branch.',
			'Divide and conquer solves independent subproblems and combines them. Dynamic programming helps when subproblems overlap. Backtracking may still require exponential output, so give an output-sensitive bound rather than promising that memoization makes enumeration polynomial.',
		],
		example: {
			title: 'Subsets of [A, B]',
			rows: [
				[
					'At A',
					'Choose exclude A or include A',
					'These branches partition all possible subsets.',
				],
				[
					'Exclude A',
					'[] → exclude B: []; include B: [B]',
					'Record a copy at each leaf.',
				],
				[
					'Include A',
					'[A] → exclude B: [A]; include B: [A, B]',
					'Undo B after returning.',
				],
				[
					'Return',
					'[], [B], [A], [A, B]',
					'Every subset is reached by one include/exclude path.',
				],
			],
		},
		code: `function subsets(nums) {
	const result = [], path = [];
	function visit(index) {
		if (index === nums.length) {
			result.push(path.slice());
			return;
		}
		visit(index + 1);
		path.push(nums[index]);
		visit(index + 1);
		path.pop();
	}
	visit(0);
	return result;
}`,
		invariant:
			'On entry to visit(index), path describes exactly the choices made for earlier positions. Every call restores path before returning, so sibling branches start with the same state.',
		cost: 'O(n · 2ⁿ) time including copying all subsets, O(n) auxiliary path and call-stack space, and O(n · 2ⁿ) output space. Input values are assumed distinct for unique subsets.',
		pitfalls: [
			'Missing the undo operation on a shared path.',
			'Saving a mutable path reference instead of a copy.',
			'Ignoring output size or recursion depth in complexity.',
		],
		recall: [
			'Why does increasing the start index avoid combination duplicates?',
			'It gives each selection a single increasing index order, so choosing A then B cannot also be emitted as B then A.',
		],
		labs: ['n-queens'],
	},
	{
		id: 'trees',
		title: 'Binary trees & search trees',
		phase: 'Core structures',
		lead: 'Let each subtree return a small summary, and combine those summaries at its parent.',
		model:
			'A tree is a recursive structure. Ask what information a parent needs from each child, rather than trying to hold the whole traversal in your head.',
		concepts: [
			'Preorder handles the node before its children; inorder handles left, node, right; postorder handles children before the node. Preorder is useful for copying, inorder gives sorted order for a valid BST, and postorder fits height, balance and subtree aggregation.',
			'Breadth-first traversal uses a queue and processes levels. Capture the queue length at the start of a level so newly appended children belong to the next level. Maximum queue space is proportional to the maximum width, which can be O(n).',
			'A BST orders every value in the entire left subtree below the node and every value in the entire right subtree above it, under a chosen duplicate policy. Comparing only a node and its direct children misses deeper violations. Pass valid bounds downward.',
			'A height-based function can return a sentinel for imbalance. If either child is already unbalanced, propagate that result; otherwise compare heights. Computing height afresh for every node repeats work and can cost O(n²) on a chain.',
			'Search-tree operations cost O(h). Balanced trees keep h = O(log n), while inserting sorted values into an unbalanced BST can create h = O(n). Lowest common ancestor in a general binary tree uses subtree evidence; a BST can exploit key ordering.',
		],
		example: {
			title: 'Why local BST comparisons are insufficient',
			rows: [
				[
					'Tree root',
					'10 with left child 5 and right child 15',
					'Both direct child comparisons look valid.',
				],
				[
					'Deeper node',
					'15 has left child 6',
					'6 is below 15, but incorrectly lies in 10’s right subtree.',
				],
				[
					'Propagate bounds',
					'Right subtree must stay inside (10, ∞)',
					'The 6 violates the inherited lower bound.',
				],
				[
					'General rule',
					'Left: (low, node); right: (node, high)',
					'Every ancestor constraint stays active.',
				],
			],
		},
		code: `function isValidBST(node, low = -Infinity, high = Infinity) {
	if (node === null) return true;
	if (node.value <= low || node.value >= high) return false;
	return isValidBST(node.left, low, node.value)
		&& isValidBST(node.right, node.value, high);
}`,
		invariant:
			'Each call checks that every node in its subtree respects the bounds imposed by all ancestors. This version uses finite numeric keys and a strict no-duplicates policy.',
		cost: 'O(n) time, O(h) recursive stack space. An iterative stack can avoid the language recursion limit but still needs O(h) auxiliary space.',
		pitfalls: [
			'Checking only immediate children for BST validity.',
			'Assuming every binary tree is a BST or balanced.',
			'Returning height in one branch and node count in another.',
		],
		recall: [
			'Does inorder traversal always produce sorted output?',
			'Only when the tree satisfies the BST ordering rule. Inorder traversal of a general binary tree has no sorting guarantee.',
		],
		labs: ['bst'],
	},
	{
		id: 'heaps',
		title: 'Heaps & top K',
		phase: 'Core structures',
		lead: 'Maintain the most useful next item without fully sorting everything.',
		model:
			'A heap guarantees that the root wins against its children. It does not sort siblings or provide fast search for an arbitrary value.',
		concepts: [
			'A binary heap stores a complete tree in an array. With zero-based indices, parent(i) = floor((i − 1) / 2), left(i) = 2i + 1 and right(i) = 2i + 2. A min-heap keeps the smallest item at the root; a max-heap keeps the largest.',
			'Insertion appends and sifts up. Extracting the root moves the last item to the root and sifts down. Peek costs O(1), and insert/extract cost O(log n). Bottom-up heap construction is O(n), because most nodes are near the leaves and move only a short distance.',
			'To keep the k largest values, use a min-heap of size k. Its root is the weakest selected candidate. A new value replaces it only if the new value is larger. At the end, the root is the kth largest; the heap array itself is not sorted.',
			'For merging k sorted streams, keep only one current candidate from each stream. Extract the smallest, emit it, and push the next value from that same stream. This avoids repeatedly sorting all remaining values.',
			'Use explicit tie-breaking when priorities can be equal. Shortest-path implementations often allow duplicate heap entries and ignore a popped entry when its distance is stale. JavaScript has no general built-in binary-heap collection, so use an available library in practice or implement the small required operations in an interview.',
		],
		example: {
			title: 'Three largest values from [4, 1, 7, 3, 9]',
			rows: [
				[
					'Fill size 3',
					'Selected values {1, 4, 7}; root 1',
					'The weakest selected value is immediately available.',
				],
				[
					'Read 3',
					'Replace 1; selected {3, 4, 7}',
					'3 improves the selected set.',
				],
				[
					'Read 9',
					'Replace 3; selected {4, 7, 9}',
					'Restore the min-heap after replacement.',
				],
				[
					'Finish',
					'Root is 4',
					'4 is the third largest; extraction would give sorted selected values.',
				],
			],
		},
		code: `// Pseudocode: heap supports peek, push, replaceRoot.
function kthLargest(stream, k) {
	const heap = new MinHeap();
	for (const value of stream) {
		if (heap.size < k) heap.push(value);
		else if (value > heap.peek()) heap.replaceRoot(value);
	}
	return heap.peek(); // requires 1 <= k <= stream length
}`,
		invariant:
			'After processing each value, the heap holds the k largest values seen so far, or all seen values when fewer than k have arrived.',
		cost: 'O(n log k) time for k ≥ 2 and O(k) space; k = 1 is a linear scan. Sorting all n values instead costs O(n log n).',
		pitfalls: [
			'Using a max-heap when the selected set needs its smallest value exposed.',
			'Assuming the heap array is globally sorted.',
			'Omitting the precondition on k or tie handling.',
		],
		recall: [
			'Why can heap construction be O(n) if insertion is O(log n)?',
			'Bottom-up heapify is a different procedure from n separate insertions. Many leaves move zero steps and only a few high nodes can move far.',
		],
		labs: ['min-heap', 'heap-sort'],
	},
	{
		id: 'graphs',
		title: 'Graphs, BFS & DFS',
		phase: 'Graphs & optimization',
		lead: 'Represent connections explicitly and choose an exploration order that matches the question.',
		model:
			'Vertices are states and edges are allowed moves. A grid, dependency system or word transformation can be a graph even when no graph is drawn.',
		concepts: [
			'Clarify directed versus undirected, weighted versus unweighted, and whether disconnected components, parallel edges or self-loops are possible. An adjacency list uses O(V + E) storage; a matrix uses O(V²) but gives direct edge checks.',
			'BFS processes distance layers. In an unweighted graph, the first discovery of a vertex gives a shortest path in edge count. Mark visited when enqueuing to prevent the same vertex from being added repeatedly, and save a parent if the actual path is needed.',
			'DFS explores deeply before returning. It fits connected components, cycle reasoning and backtracking. A recursive implementation can overflow on a long path; an explicit stack avoids the language call limit.',
			'A single traversal from one start only visits its reachable component. To count components, start a new traversal at every still-unvisited vertex. In an undirected cycle check, ignore the edge back to the parent; in a directed graph, use active-path state rather than that rule.',
			'For a grid, model each traversable cell as a vertex and each allowed movement as an edge. State whether diagonal movement is permitted and whether moves have equal cost. Mutating cells to mark visited saves a separate set only if modifying the input is acceptable.',
		],
		example: {
			title: 'BFS from A: A → B,C; B → D; C → D',
			rows: [
				['Start', 'Queue [A], distance(A) = 0', 'Mark A when enqueuing.'],
				[
					'Process A',
					'Queue [B, C], distances = 1',
					'Both are one edge from A.',
				],
				[
					'Process B',
					'Queue [C, D], distance(D) = 2',
					'Mark D now and set parent(D) = B.',
				],
				[
					'Process C',
					'D is already discovered',
					'Do not enqueue D twice; A → B → D is a shortest path.',
				],
			],
		},
		code: `function bfsDistances(adj, start) {
	const distance = new Map([[start, 0]]);
	const queue = [start];
	for (let head = 0; head < queue.length; head++) {
		const node = queue[head];
		for (const next of adj.get(node) || []) {
			if (distance.has(next)) continue;
			distance.set(next, distance.get(node) + 1);
			queue.push(next);
		}
	}
	return distance;
}`,
		invariant:
			'Vertices leave the queue in nondecreasing distance order. Every discovered vertex has its shortest unweighted distance fixed when first enqueued.',
		cost: 'O(V + E) time over the reachable adjacency-list graph, O(V) auxiliary space. A grid with four neighbors per cell costs O(rows · columns).',
		pitfalls: [
			'Using BFS to minimize arbitrary weighted cost.',
			'Marking visited too late and duplicating queue entries.',
			'Forgetting isolated vertices or other components.',
		],
		recall: [
			'Why does ordinary DFS not guarantee a shortest route?',
			'It commits to a depth-first exploration order, which can reach a vertex through a long path before exploring a much shorter branch.',
		],
		labs: ['bfs', 'dfs', 'grid-bfs', 'grid-dfs'],
	},
	{
		id: 'advanced-graphs',
		title: 'Dependencies, paths & disjoint sets',
		phase: 'Graphs & optimization',
		lead: 'Match dependencies, weighted distances and connectivity to their own graph tools.',
		model:
			'“Connect everything cheaply”, “reach one destination cheaply” and “do prerequisites first” are different objectives. Name the objective before choosing an algorithm.',
		concepts: [
			'Kahn’s topological sort begins with all zero-indegree vertices. Removing a ready vertex decrements its outgoing neighbors’ indegrees. If fewer than V vertices are processed, a directed cycle blocks a complete ordering. More than one valid ordering may exist.',
			'Dijkstra repeatedly settles the smallest tentative distance and relaxes outgoing edges. Nonnegative weights are essential to its greedy argument. With negative weights, consider Bellman–Ford; it costs O(VE) and can detect a reachable negative cycle.',
			'A* prioritizes f = g + h, where g is the known path cost and h estimates the remaining cost. Manhattan distance fits four-direction unit-cost grids. An admissible heuristic never overestimates; implementations that permanently close nodes generally also need consistency, or must reopen nodes when a better g is found.',
			'Union–find maintains disjoint components. Find returns a representative; union joins components. Path compression with union by size/rank gives amortized O(α(V)) per operation. It handles incremental undirected connectivity and cycle detection, not arbitrary directed reachability.',
			'A minimum spanning tree connects all vertices of a connected undirected graph with minimum total edge weight. Prim grows one component; Kruskal sorts edges and joins different components with union–find. An MST is not a shortest-path tree. A disconnected graph yields a spanning forest.',
		],
		example: {
			title: 'Topological order for A → C, B → C, C → D',
			rows: [
				['Indegrees', 'A:0, B:0, C:2, D:1', 'Initially A and B are ready.'],
				['Process A', 'C becomes 1', 'C still needs B.'],
				[
					'Process B',
					'C becomes 0; enqueue C',
					'All of C’s prerequisites are complete.',
				],
				[
					'Process C, then D',
					'A, B, C, D',
					'All four processed: a valid order exists.',
				],
			],
		},
		code: `function topologicalOrder(adj) {
	const indegree = Array(adj.length).fill(0);
	for (const edges of adj) for (const v of edges) indegree[v]++;
	const order = [];
	for (let v = 0; v < adj.length; v++) {
		if (indegree[v] === 0) order.push(v);
	}
	for (let head = 0; head < order.length; head++) {
		for (const v of adj[order[head]]) {
			if (--indegree[v] === 0) order.push(v);
		}
	}
	return order.length === adj.length ? order : null;
}`,
		invariant:
			'Only vertices with no remaining prerequisites enter the ready queue. Every emitted vertex appears after all of its incoming dependencies.',
		cost: 'Topological sort: O(V + E) time, O(V) auxiliary space. Binary-heap Dijkstra: O((V + E) log V) with decrease-key; lazy duplicate entries are commonly bounded by O((V + E) log E). A* cost depends on the heuristic and queue implementation.',
		pitfalls: [
			'Treating an MST as a cheapest route from the source.',
			'Using Dijkstra despite negative edges.',
			'Claiming A* is always linear or always explores fewer nodes.',
		],
		recall: [
			'What does a nonempty queue at the beginning prove about cycles?',
			'Only that some vertices have no prerequisites. Another disconnected part may still contain a cycle. Check the final processed count.',
		],
		labs: ['dijkstra', 'prim', 'grid-astar', 'grid-greedy'],
	},
	{
		id: 'greedy-intervals',
		title: 'Greedy choices & intervals',
		phase: 'Graphs & optimization',
		lead: 'Sort by the property that makes one local choice safe for the remaining problem.',
		model:
			'A greedy algorithm needs an exchange argument: show that an optimal answer can adopt your choice without becoming worse.',
		concepts: [
			'For merging intervals, sort by start and compare each interval with the last merged end. Overlapping intervals extend the current group; disjoint intervals start a new group. Decide whether touching endpoints overlap: closed [1,2] and [2,3] differ from half-open [1,2) and [2,3).',
			'To select the maximum number of non-overlapping intervals, sort by finishing time and keep the next compatible interval. The earliest finishing compatible interval leaves at least as much room for future choices as any later finishing one.',
			'Meeting-room allocation asks for maximum simultaneous occupancy, not just whether adjacent intervals overlap. A min-heap of current room end times or a sweep line works. For half-open meetings, an ending event frees a room before a starting event at the same time.',
			'Greedy reachability can keep the farthest reachable index. If the current index lies beyond that boundary, no earlier reachable jump can rescue it. For the minimum number of jumps, process reachable frontiers as layers and commit a jump when the current frontier ends.',
			'Greedy does not work merely because choosing the largest or smallest feels sensible. Coin denominations [1,3,4] and amount 6 defeat largest-first: 4+1+1 uses three coins, while 3+3 uses two. Dynamic programming is needed for arbitrary denominations.',
		],
		example: {
			title: 'Select the most compatible intervals',
			rows: [
				['Candidates', '[1,4), [2,3), [3,5), [5,6)', 'Sort by end time.'],
				[
					'Keep [2,3)',
					'Current end = 3',
					'It finishes before [1,4), leaving more room.',
				],
				[
					'Keep [3,5)',
					'Current end = 5',
					'Touching half-open intervals are compatible.',
				],
				[
					'Keep [5,6)',
					'Three intervals selected',
					'The end boundary summarizes all future compatibility.',
				],
			],
		},
		code: `function maxCompatible(intervals) {
	const sorted = intervals.slice().sort((a, b) => a[1] - b[1]);
	let end = -Infinity, count = 0;
	for (const [start, finish] of sorted) {
		if (start < end) continue;
		count++;
		end = finish;
	}
	return count; // assumes start < finish, half-open intervals
}`,
		invariant:
			'The chosen intervals are compatible. Among choices of the same count made so far, retaining an earliest ending schedule leaves maximal room for the suffix.',
		cost: 'O(n log n) time for sorting and O(n) space for the copied input. The subsequent scan uses O(1) additional state.',
		pitfalls: [
			'Sorting by start for a maximum-count scheduling problem.',
			'Leaving endpoint equality unspecified.',
			'Applying an intuitive greedy rule without a proof or counterexample search.',
		],
		recall: [
			'Does merging intervals solve meeting rooms?',
			'No. Merging shows the union of occupied time, but loses how many meetings overlap at once, which determines the number of rooms.',
		],
		labs: ['prim'],
	},
	{
		id: 'dynamic-programming',
		title: 'Dynamic programming',
		phase: 'Graphs & optimization',
		lead: 'Define a state precisely, then reuse answers to repeated subproblems.',
		model:
			'DP is a table of answered questions. The hard part is choosing a question whose answer can be built from smaller answered questions.',
		concepts: [
			'Write the state in a full sentence: dp[a] is the minimum number of coins required to make amount a. Then specify choices, recurrence, base cases, evaluation order and final answer. “Use DP” without a state definition is not yet an algorithm.',
			'Memoization computes states on demand with recursion and a cache. Tabulation fills states in dependency order. Both can share the same recurrence; memoization still consumes call-stack space and must distinguish “not computed” from a valid zero or false result.',
			'Coin change with reusable positive denominations uses dp[a] = 1 + min(dp[a − coin]) over usable coins. Set dp[0] = 0 and unreachable states to infinity. The amount is a numeric value, so O(n · amount) is pseudopolynomial in its encoded input size.',
			'For 0/1 knapsack, each item may be chosen once: update a compressed capacity array backward. For unbounded choices, updating forward allows reuse. The loop direction expresses the problem rules; changing it can silently solve a different problem.',
			'For two strings, dp[i][j] often summarizes their prefixes. LCS uses diagonal + 1 for a match and max(top, left) otherwise. Edit distance uses a free diagonal for a match, otherwise 1 + min(delete, insert, replace). Space compression is safe only when needed old states remain available.',
			'Learn one-dimensional choice DP (stairs, house robber), grid DP, knapsack, subsequence DP and interval DP in that order. Track predecessor choices if you need to reconstruct a solution. An optimized numeric answer alone may lose the reconstruction information.',
		],
		example: {
			title: 'Minimum coins: denominations [1, 3, 4], amount 6',
			rows: [
				['Base', 'dp[0] = 0', 'Making no amount requires no coins.'],
				[
					'Small states',
					'dp[1]=1, dp[2]=2, dp[3]=1, dp[4]=1',
					'Each state tries every usable final coin.',
				],
				['Amount 5', '1 + min(dp[4], dp[2], dp[1]) = 2', 'Use 4+1.'],
				[
					'Amount 6',
					'1 + min(dp[5], dp[3], dp[2]) = 2',
					'Use 3+3; largest-first greedy would fail.',
				],
			],
		},
		code: `function minCoins(coins, amount) {
	const dp = Array(amount + 1).fill(Infinity);
	dp[0] = 0;
	for (let a = 1; a <= amount; a++) {
		for (const coin of coins) {
			if (coin <= a) dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
		}
	}
	return dp[amount] === Infinity ? -1 : dp[amount];
} // requires positive integer coins and a nonnegative integer amount
`,
		invariant:
			'When filling dp[a], every smaller amount needed by a positive coin is already optimal. Any optimal solution for a ends with one of the coins considered.',
		cost: 'O(amount · number of denominations) time and O(amount) space. LCS and edit distance use O(mn) time and O(mn) space in their full-table forms.',
		pitfalls: [
			'Coding before defining the meaning of each state.',
			'Initializing unreachable minimization states to zero.',
			'Changing loop order without checking whether items may be reused.',
		],
		recall: [
			'How do you estimate a DP runtime?',
			'Count reachable states, then multiply by the work per state. Also include preprocessing, key construction and solution reconstruction when they are significant.',
		],
		labs: ['lcs', 'edit-distance'],
	},
	{
		id: 'tries',
		title: 'Tries & prefix search',
		phase: 'Further essentials',
		lead: 'Share common prefixes across many words and stop as soon as a prefix is impossible.',
		model:
			'Each edge consumes one symbol. A path represents a prefix; a separate terminal marker says whether that prefix is also a complete stored word.',
		concepts: [
			'A trie node maps characters to children and stores an end-of-word flag. Inserting “car” and “cart” shares c → a → r, while the flag at r distinguishes the complete word “car” from an unfinished prefix.',
			'Insertion, exact lookup and prefix lookup take O(L) time for a key of L symbols with constant-time child access. A map per node is flexible; fixed alphabet arrays trade potentially wasted memory for direct indexing.',
			'Autocomplete first walks the prefix, then enumerates descendants. The lookup is O(prefix length), but returning all matches costs at least the size of the output. Ranking suggestions requires extra ranking data or a later selection step.',
			'A wildcard search may branch into every child, making it much more expensive than ordinary lookup. In a word-search grid, combine trie prefix pruning with backtracking: abandon a board path as soon as it is not a dictionary prefix.',
			'For JavaScript Map nodes, iterating for...of over strings consumes code points. Keep insertion and search consistent. Define case normalization and alphabet rules at the input boundary; lowercase ASCII interview assumptions are simpler than full language-aware matching.',
		],
		example: {
			title: 'Store “car”, “cart” and “cat”',
			rows: [
				['Insert car', 'root → c → a → r*', '* marks a complete word.'],
				['Insert cart', 'r* gains child t*', 'The shared prefix is reused.'],
				[
					'Insert cat',
					'a gains a second child t*',
					'Only the differing suffix creates a branch.',
				],
				[
					'Search ca / car',
					'ca: prefix only; car: complete word',
					'Reaching a node is not sufficient for exact search.',
				],
			],
		},
		code: `function makeTrieNode() {
	return { children: new Map(), terminal: false };
}
function insertWord(root, word) {
	let node = root;
	for (const ch of word) {
		if (!node.children.has(ch)) node.children.set(ch, makeTrieNode());
		node = node.children.get(ch);
	}
	node.terminal = true;
}
function hasWord(root, word) {
	let node = root;
	for (const ch of word) {
		if (!node.children.has(ch)) return false;
		node = node.children.get(ch);
	}
	return node.terminal;
}`,
		invariant:
			'After consuming i symbols, node represents exactly the length-i prefix of the key. terminal records complete words independently of children.',
		cost: 'Expected O(L) insertion/search with Map children. Total nodes are bounded by one plus the total inserted symbol count, with additional per-node map overhead.',
		pitfalls: [
			'Treating every prefix as a complete word.',
			'Claiming autocomplete enumeration is independent of output size.',
			'Using inconsistent case or character iteration rules.',
		],
		recall: [
			'Can a terminal node also have children?',
			'Yes. “car” is a word and a prefix of “cart”. A terminal flag and the child map describe separate facts.',
		],
		labs: [],
	},
	{
		id: 'bits-math',
		title: 'Bits & essential math',
		phase: 'Further essentials',
		lead: 'Use exact algebraic properties when the input assumptions make them valid.',
		model:
			'Bit operations work one binary position at a time. Arithmetic shortcuts are proofs about representation, so state their range and assumptions.',
		concepts: [
			'XOR has x ^ x = 0, x ^ 0 = x, and order-independent grouping. If every integer occurs exactly twice except one, XOR cancels the pairs. It does not solve a version where duplicates appear an arbitrary number of times.',
			'For a positive integer, x & (x − 1) clears its lowest set bit. Repeating it counts set bits in O(number of set bits). A positive integer is a power of two exactly when that expression is zero; exclude zero first.',
			'JavaScript Number bitwise operations coerce to 32-bit integers. Values outside that range lose high bits, and shifts mask the shift count. BigInt supports wider integer bit operations, but cannot be mixed directly with Number and has costs that grow with bit length.',
			'Euclid’s algorithm uses gcd(a, b) = gcd(b, a mod b) until b = 0. This works because the common divisors of the pair are preserved. Use absolute values if negative inputs are accepted. lcm(a,b) = |a / gcd(a,b) × b|, with a separate zero case.',
			'For primality testing, only test divisors through √n: any larger factor has a partner below √n. A sieve marks multiples to find all primes up to a bound in O(n log log n) time and O(n) space. Modular arithmetic can bound values, but division modulo a number requires additional inverse conditions.',
			'Number safely represents integers only through Number.MAX_SAFE_INTEGER. Repeated addition, products and combinations may exceed it. State when BigInt is needed, and avoid using floating-point equality for exact rational arithmetic.',
		],
		example: {
			title: 'XOR pairs: [5, 2, 5]',
			rows: [
				['Begin', 'answer = 0', 'Zero is the XOR identity.'],
				['Read 5', 'answer = 5', '0 ^ 5 = 5.'],
				['Read 2', 'answer = 7', 'Binary 101 ^ 010 = 111.'],
				['Read 5', 'answer = 2', 'The two 5s cancel: 5 ^ 2 ^ 5 = 2.'],
			],
		},
		code: `function gcd(a, b) {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b !== 0) {
		const remainder = a % b;
		a = b;
		b = remainder;
	}
	return a;
} // assumes safely represented integer inputs
`,
		invariant:
			'Replacing (a, b) with (b, a mod b) preserves their common divisors. The nonnegative second argument strictly decreases until zero.',
		cost: 'O(log(min(|a|, |b|))) remainder steps for positive inputs, with constant extra variables. Big-integer arithmetic has additional bit-length-dependent cost.',
		pitfalls: [
			'Forgetting the 32-bit coercion of Number bitwise operators.',
			'Accepting zero in a power-of-two test.',
			'Applying XOR cancellation when duplicate multiplicities do not match.',
		],
		recall: [
			'Why is checking divisors only through √n enough?',
			'If n = a · b and both factors exceeded √n, their product would exceed n. A composite number must therefore have a factor at most √n.',
		],
		labs: [],
	},
	{
		id: 'matrices',
		title: 'Matrices & grid reasoning',
		phase: 'Further essentials',
		lead: 'Keep row and column rules explicit, then reuse array and graph techniques in two dimensions.',
		model:
			'A matrix is indexed data; a grid becomes a graph when moves connect its cells. The same picture can support very different algorithms.',
		concepts: [
			'Use rows = grid.length and columns = grid[0].length only after handling an empty grid. State whether rows are rectangular. Check row and column bounds independently, and choose a consistent neighbor list such as up, right, down, left.',
			'Spiral traversal maintains top, bottom, left and right boundaries. After consuming an edge, tighten its boundary. Recheck boundaries before consuming the opposite edge to avoid duplicating a single remaining row or column.',
			'Rotating an n×n matrix clockwise can transpose across the main diagonal and reverse each row. This changes coordinates (r,c) into (c,n−1−r). A non-square matrix cannot use the same in-place square-matrix procedure.',
			'If rows and columns are individually increasing, start at the top-right corner: a value too large removes a column, a value too small removes a row. If the entire flattened matrix is globally sorted, binary search can instead map a flat index i to row floor(i / columns) and column i mod columns.',
			'Flood fill and island counting use BFS or DFS and a visited rule. Multi-source BFS enqueues every initial source at distance zero, which is useful for nearest-zero distances or simultaneous spreading. The first arrival still minimizes moves when all edges have equal cost.',
		],
		example: {
			title: 'Clockwise rotation of a 2×2 matrix',
			rows: [
				[
					'Original',
					'[[1, 2], [3, 4]]',
					'Rows and columns both have length 2.',
				],
				[
					'Transpose',
					'[[1, 3], [2, 4]]',
					'Swap entries only above/below the main diagonal once.',
				],
				[
					'Reverse each row',
					'[[3, 1], [4, 2]]',
					'The result is a clockwise rotation.',
				],
				[
					'Coordinate check',
					'(1,0) → (0,0)',
					'The original 3 moves to the top-left corner.',
				],
			],
		},
		code: `function rotateClockwise(matrix) {
	const n = matrix.length; // requires an n × n matrix
	for (let row = 0; row < n; row++) {
		for (let col = row + 1; col < n; col++) {
			[matrix[row][col], matrix[col][row]] =
				[matrix[col][row], matrix[row][col]];
		}
	}
	for (const row of matrix) row.reverse();
	return matrix;
}`,
		invariant:
			'Each off-diagonal pair is swapped once during transposition. Reversing rows then maps every original cell to its clockwise-rotated coordinate.',
		cost: 'O(n²) time and O(1) auxiliary space for square rotation. General grid traversal takes O(rows · columns) time and can need that much visited/queue space.',
		pitfalls: [
			'Swapping both halves during transposition, which undoes the work.',
			'Reusing a square algorithm for a rectangular matrix.',
			'Mixing global row-major ordering with individually sorted rows and columns.',
		],
		recall: [
			'Why put every source into a multi-source BFS queue before starting?',
			'All sources have distance zero. Processing them together ensures the first arrival at each cell comes from its nearest source.',
		],
		labs: ['grid-bfs', 'grid-dfs'],
	},
];

// Practice priority reflects coverage of reusable patterns, not company frequency statistics.
DSA.questions = [
	{
		topic: 'complexity',
		title: 'Contains Duplicate',
		level: 'Easy',
		slug: 'contains-duplicate',
		prompt:
			'Decide whether an integer array contains two equal values at different indices.',
		example: '[4, 1, 4] → true; [] → false',
		hint: 'What fact about earlier items would make checking the next value cheap?',
		answer:
			'Scan with a set. Before inserting each value, check whether it already exists. If so, two distinct positions contain it; otherwise continue. This replaces comparisons against every earlier element with a membership lookup. Sorting and checking adjacent values is an alternative if you accept its cost and mutation policy.',
		cost: 'Expected O(n) time, O(n) space. Sorting alternative: O(n log n) time.',
		trap: 'A set intentionally discards multiplicity; that is enough for existence, but not for counting every duplicate pair.',
	},
	{
		topic: 'arrays',
		title: 'Best Time to Buy and Sell Stock',
		level: 'Easy',
		slug: 'best-time-to-buy-and-sell-stock',
		prompt:
			'Choose one buy day and a later sell day to maximize profit, or return zero if trading cannot help.',
		example: '[7, 1, 5, 3, 6, 4] → 5',
		hint: 'For a fixed sell day, which earlier buy price is best?',
		answer:
			'Keep the minimum price seen before the current day. At each price, compare the best profit with price minus that minimum, then update the minimum. Every optimal trade has a sell day that the scan examines, and using the cheapest earlier buy cannot make that trade worse.',
		cost: 'O(n) time, O(1) space.',
		trap: 'The buy must precede the sell. This version allows one transaction, unlike the multiple-transaction variation.',
	},
	{
		topic: 'arrays',
		title: 'Product of Array Except Self',
		level: 'Medium',
		slug: 'product-of-array-except-self',
		prompt:
			'For each position, return the product of every other value without division.',
		example: '[1, 2, 3, 4] → [24, 12, 8, 6]',
		hint: 'Split the answer at an index into the product to its left and the product to its right.',
		answer:
			'Write left-prefix products into the output while scanning forward. Scan backward with one suffix-product variable, multiply it into each output entry, then extend the suffix. The exclusive prefixes and suffixes avoid using the value at the current index and naturally handle zeroes.',
		cost: 'O(n) time, O(1) auxiliary space excluding O(n) output.',
		trap: 'Do not multiply the current value into a prefix or suffix before writing its answer. Check numeric overflow assumptions.',
	},
	{
		topic: 'arrays',
		title: 'Maximum Subarray',
		level: 'Medium',
		slug: 'maximum-subarray',
		prompt: 'Find the largest sum of a nonempty contiguous subarray.',
		example: '[-2, 1, -3, 4, -1, 2, 1, -5, 4] → 6 from [4, -1, 2, 1]',
		hint: 'A best subarray ending here either extends the previous one or starts fresh.',
		answer:
			'Use Kadane’s recurrence: endingHere = max(value, endingHere + value). Track the greatest endingHere over all positions. A negative earlier prefix cannot improve a future sum, so restarting discards it safely. Initialize from the first element when a nonempty answer is required.',
		cost: 'O(n) time, O(1) space.',
		trap: 'Initializing the answer to zero incorrectly allows an empty subarray when all values are negative.',
	},
	{
		topic: 'hashing',
		title: 'Two Sum',
		level: 'Easy',
		slug: 'two-sum',
		prompt:
			'Return two different indices whose values add to a target, assuming a solution exists.',
		example: '[3, 3], target 6 → [0, 1]',
		hint: 'For a current value x, search for target − x among earlier values.',
		answer:
			'Maintain a map from value to earlier index. Look up the complement before inserting the current value. A found complement gives the pair immediately. The lookup-before-insert order is what prevents reusing a single element; duplicate values remain valid when they occupy different positions.',
		cost: 'Expected O(n) time, O(n) space.',
		trap: 'An index of zero is valid: use map.has, not a truthiness check on map.get.',
	},
	{
		topic: 'hashing',
		title: 'Group Anagrams',
		level: 'Medium',
		slug: 'group-anagrams',
		prompt:
			'Group words that contain the same letters with the same multiplicities.',
		example: '[eat, tea, tan, ate] → [[eat, tea, ate], [tan]]',
		hint: 'Equivalent words need an identical canonical key.',
		answer:
			'For lowercase English letters, count the 26 letters and join the counts with separators to form a key. Append each original word to its key’s group. Alternatively sort each word’s letters to make the key. The signature must preserve multiplicities and avoid ambiguous concatenation.',
		cost: 'Fixed alphabet: O(total characters + 26 · words) time; O(total characters + words · 26) stored key/output space. Sorting keys adds O(L log L) per length-L word.',
		trap: 'A character set groups “abb” with “ab”, which are not anagrams. Alphabet assumptions determine the signature.',
	},
	{
		topic: 'hashing',
		title: 'Longest Consecutive Sequence',
		level: 'Medium',
		slug: 'longest-consecutive-sequence',
		prompt:
			'Find the length of the longest run of consecutive integer values, regardless of input order.',
		example: '[100, 4, 200, 1, 3, 2, 2] → 4',
		hint: 'Only a value without a predecessor should start a run.',
		answer:
			'Put values in a set. For each distinct value x, skip it if x − 1 exists. Otherwise walk x, x + 1, and so on until the run ends. Each value is visited by at most one run walk, so the apparently nested iteration stays linear in expectation.',
		cost: 'Expected O(n) time, O(n) space.',
		trap: 'Starting a walk from every value can become quadratic. Iterate distinct values so duplicates do not repeat long runs.',
	},
	{
		topic: 'two-pointers',
		title: 'Valid Palindrome',
		level: 'Easy',
		slug: 'valid-palindrome',
		prompt:
			'Check whether text reads the same in both directions after ignoring case and non-alphanumeric characters.',
		example: '“A man, a plan, a canal: Panama” → true',
		hint: 'Move inward from both ends and skip irrelevant characters.',
		answer:
			'Keep left and right indices. Skip characters outside the allowed alphabet, compare the normalized characters, and move both pointers inward after a match. A mismatch proves failure. Explicitly decide whether alphanumeric means ASCII or a broader Unicode definition before choosing the character test.',
		cost: 'O(n) time, O(1) space for an index-based ASCII scan.',
		trap: 'A punctuation-only string has an empty normalized form and is a palindrome under the usual definition.',
	},
	{
		topic: 'two-pointers',
		title: '3Sum',
		level: 'Medium',
		slug: '3sum',
		prompt:
			'Return unique value triples from different positions whose sum is zero.',
		example: '[-1, 0, 1, 2, -1, -4] → [[-1, -1, 2], [-1, 0, 1]]',
		hint: 'Fix one value, then reduce the remaining search to a sorted pair-sum problem.',
		answer:
			'Sort the values, scan an anchor index, and run two pointers over its suffix. Move the left pointer when the sum is too small and the right pointer when too large. Record matches, then skip matching duplicate values at both ends. Skip duplicate anchors to avoid emitting the same triple again.',
		cost: 'O(n²) time; sorting uses implementation-dependent auxiliary space, plus output.',
		trap: 'Uniqueness is about value triples, while the three chosen positions still have to be distinct.',
	},
	{
		topic: 'two-pointers',
		title: 'Container With Most Water',
		level: 'Medium',
		slug: 'container-with-most-water',
		prompt:
			'Choose two vertical lines that enclose the largest area with the horizontal axis.',
		example: '[1, 8, 6, 2, 5, 4, 8, 3, 7] → 49',
		hint: 'The shorter line limits the current area. Which endpoint can safely be discarded?',
		answer:
			'Start at both ends. Compute width times the shorter height, update the best area, and move the shorter endpoint inward. Keeping the shorter endpoint while reducing width cannot produce a better area, so discarding it is safe. Repeat until the pointers meet.',
		cost: 'O(n) time, O(1) space.',
		trap: 'This is a two-wall container problem; Trapping Rain Water sums water over many positions and requires a different invariant.',
	},
	{
		topic: 'sliding-window',
		title: 'Longest Substring Without Repeating Characters',
		level: 'Medium',
		slug: 'longest-substring-without-repeating-characters',
		prompt:
			'Return the length of the longest contiguous character range with no repeats.',
		example: '“abba” → 2',
		hint: 'Remember each character’s latest position and keep left from moving backward.',
		answer:
			'Scan rightward with a last-seen map. On a repeated character, set left to max(left, previousIndex + 1), then record its new position. Measure right − left + 1 after the adjustment. Every measured window is valid, and left discards only the portion forced out by a repeat.',
		cost: 'Expected O(n) time, O(min(n, alphabet size)) space.',
		trap: 'Removing the max can move left backward on “abba”. Define whether characters are code units, code points or graphemes.',
	},
	{
		topic: 'sliding-window',
		title: 'Minimum Size Subarray Sum',
		level: 'Medium',
		slug: 'minimum-size-subarray-sum',
		prompt:
			'For positive integers, find the shortest contiguous range with sum at least target.',
		example: '[2, 3, 1, 2, 4, 3], target 7 → 2',
		hint: 'Once a window qualifies, shrink it until removing another item would break the target.',
		answer:
			'Extend right and add its value. While the sum meets the target, record the current length, subtract nums[left], and advance left. Every right endpoint considers its shortest qualifying window. The positive-value assumption makes shrinking reduce the sum predictably.',
		cost: 'O(n) time, O(1) space.',
		trap: 'Arbitrary negative values invalidate this sliding-window argument. Return the specified no-solution value if no window qualifies.',
	},
	{
		topic: 'sliding-window',
		title: 'Minimum Window Substring',
		level: 'Hard',
		slug: 'minimum-window-substring',
		prompt:
			'Find the shortest substring containing every required character, including repeated requirements.',
		example: 'source “ADOBECODEBANC”, target “ABC” → “BANC”',
		hint: 'Track how many required character counts are fully satisfied, not merely how many characters are present.',
		answer:
			'Build required frequencies and maintain window frequencies. Extend right until all distinct requirements reach their target counts. While valid, record the best boundaries and shrink left; invalidate the window only when a required count drops below its threshold. Slice the winning substring once at the end.',
		cost: 'Expected O(source length + target length) time, O(alphabet size) counting space, plus returned text.',
		trap: 'A target like “AABC” needs two As. Repeatedly copying the best substring inside the loop can add avoidable work.',
	},
	{
		topic: 'prefix-sums',
		title: 'Range Sum Query — Immutable',
		level: 'Easy',
		slug: 'range-sum-query-immutable',
		prompt: 'Preprocess an array to answer many inclusive range-sum queries.',
		example: '[-2, 0, 3, -5, 2, -1], query [0, 2] → 1',
		hint: 'Store the total before every index, including a zero before the array begins.',
		answer:
			'Build prefix[i + 1] = prefix[i] + nums[i]. For an inclusive query [left, right], return prefix[right + 1] − prefix[left]. The first total includes the desired range and everything before it; the subtraction removes exactly that earlier prefix.',
		cost: 'O(n) preprocessing time and space, O(1) per query.',
		trap: 'An immutable prefix table becomes stale if the original values change.',
	},
	{
		topic: 'prefix-sums',
		title: 'Subarray Sum Equals K',
		level: 'Medium',
		slug: 'subarray-sum-equals-k',
		prompt:
			'Count nonempty contiguous ranges whose sum equals k; negative values are allowed.',
		example: '[1, -1, 1], k = 1 → 3',
		hint: 'A current prefix S forms a target-sum range with every earlier prefix equal to S − k.',
		answer:
			'Seed a frequency map with zero prefix occurring once. For each value, update the running sum, add the frequency of sum − k to the result, then increment the current prefix frequency. Looking up before inserting prevents counting an empty range when k is zero.',
		cost: 'Expected O(n) time, O(n) space.',
		trap: 'A set undercounts repeated prefixes. A positive-only sliding window cannot solve this arbitrary-integer version.',
	},
	{
		topic: 'prefix-sums',
		title: 'Contiguous Array',
		level: 'Medium',
		slug: 'contiguous-array',
		prompt:
			'Find the longest binary subarray containing the same number of zeroes and ones.',
		example: '[0, 1, 0] → 2',
		hint: 'Treat zero as −1. The target becomes a zero-sum range.',
		answer:
			'Track a balance that decreases on zero and increases on one. Store the first index for each balance, starting with balance 0 at index −1. Reaching an earlier balance again gives a zero-sum range between the two indices; the earliest occurrence maximizes its length.',
		cost: 'Expected O(n) time, O(n) space.',
		trap: 'Overwriting an earlier index shortens future candidate ranges. For longest length, preserve the first occurrence.',
	},
	{
		topic: 'sorting-search',
		title: 'Binary Search',
		level: 'Easy',
		slug: 'binary-search',
		prompt:
			'Locate a target in an ascending array, returning a missing marker if absent.',
		example: '[-1, 0, 3, 5, 9, 12], target 9 → index 4',
		hint: 'Choose a closed or half-open interval and make every update preserve that choice.',
		answer:
			'A lower-bound search on [left, right) moves left past a midpoint smaller than target and moves right to midpoint otherwise. At convergence, verify the index is inside the array and its value equals target. Each iteration eliminates at least half the remaining candidate interval.',
		cost: 'O(log n) time, O(1) space.',
		trap: 'The insertion position is not automatically a match. An absent target can produce index n.',
	},
	{
		topic: 'sorting-search',
		title: 'Search in Rotated Sorted Array',
		level: 'Medium',
		slug: 'search-in-rotated-sorted-array',
		prompt: 'Find a target in a rotated ascending array of distinct values.',
		example: '[4, 5, 6, 7, 0, 1, 2], target 0 → index 4',
		hint: 'At least one side of the midpoint is sorted. Check whether the target lies within that side’s value range.',
		answer:
			'Use binary search with distinct values. If the left half is sorted, keep it only when its boundary values contain the target; otherwise keep the right half. When the right half is sorted, apply the symmetric rule. Handle a direct midpoint match first and shrink the range every iteration.',
		cost: 'O(log n) time, O(1) space for distinct values.',
		trap: 'With duplicates, equal endpoints can hide which half is sorted; the worst case can become O(n).',
	},
	{
		topic: 'sorting-search',
		title: 'Koko Eating Bananas',
		level: 'Medium',
		slug: 'koko-eating-bananas',
		prompt:
			'Find the smallest integer eating speed that finishes all piles within h hours, one pile at a time.',
		example: '[3, 6, 7, 11], h = 8 → speed 4',
		hint: 'If speed s works, every larger speed also works. How many hours does a fixed speed need?',
		answer:
			'For a candidate speed s, sum ceil(pile / s). Binary-search the first feasible speed between 1 and the largest pile. Feasibility is monotonic because increasing speed never increases required hours. The standard problem guarantees a feasible schedule; without that guarantee, reject h smaller than the number of nonempty piles.',
		cost: 'O(n log M) time where M is the largest pile, O(1) auxiliary space.',
		trap: 'Use ceiling per pile, not once after summing all bananas. Hours cannot be shared between different piles in one hour.',
	},
	{
		topic: 'linked-lists',
		title: 'Reverse Linked List',
		level: 'Easy',
		slug: 'reverse-linked-list',
		prompt: 'Reverse an acyclic singly linked list and return its new head.',
		example: '1 → 2 → 3 → null becomes 3 → 2 → 1 → null',
		hint: 'Keep previous, current and a saved next reference.',
		answer:
			'Start previous at null. Save current.next, redirect current.next to previous, advance previous to current, then current to the saved node. The reversed prefix grows by one while the unprocessed suffix remains reachable. When current is null, previous is the new head.',
		cost: 'O(n) time, O(1) iterative auxiliary space.',
		trap: 'Changing current.next before saving it loses the remainder of the list. Recursive reversal uses O(n) stack space.',
	},
	{
		topic: 'linked-lists',
		title: 'Linked List Cycle',
		level: 'Easy',
		slug: 'linked-list-cycle',
		prompt:
			'Determine whether following next references can revisit the same node.',
		example: 'A → B → C → B contains a cycle',
		hint: 'Within a cycle, one pointer gains one position per step on another pointer moving half as fast.',
		answer:
			'Advance slow by one and fast by two, checking that fast and fast.next exist before advancing. Meeting by node identity proves a cycle; reaching null proves there is none. A visited-node set is a simpler O(n)-space alternative.',
		cost: 'O(n) time, O(1) space with Floyd’s algorithm.',
		trap: 'Equal values do not imply the same node. Check after advancing or initialize carefully to avoid reporting an immediate false meeting.',
	},
	{
		topic: 'linked-lists',
		title: 'Merge Two Sorted Lists',
		level: 'Easy',
		slug: 'merge-two-sorted-lists',
		prompt: 'Merge two sorted acyclic linked lists into one sorted list.',
		example: '1 → 3 and 1 → 2 → 4 become 1 → 1 → 2 → 3 → 4',
		hint: 'Use a dummy head so selecting the first node is the same as selecting every later node.',
		answer:
			'Keep a tail after a dummy node. Append whichever input head is smaller, advance that input, and advance tail. When either input ends, attach the other suffix. If the two inputs are disjoint, this can splice existing nodes with constant extra space; allocate new nodes if ownership requires preserving links.',
		cost: 'O(n + m) time, O(1) auxiliary space when splicing.',
		trap: 'The standard splicing solution assumes the two input chains do not share nodes. Return dummy.next.',
	},
	{
		topic: 'stacks-queues',
		title: 'Valid Parentheses',
		level: 'Easy',
		slug: 'valid-parentheses',
		prompt:
			'Check that each bracket closes the most recent unclosed bracket of the same type.',
		example: '“([])” → true; “([)]” → false',
		hint: 'Nested structure means the latest opening bracket must close first.',
		answer:
			'Push opening brackets. For each closing bracket, require a matching stack top and pop it; fail on an empty stack or wrong type. At the end the stack must be empty. Define how non-bracket characters should be treated if the input can contain them.',
		cost: 'O(n) time, O(n) worst-case space.',
		trap: 'Matching total opening and closing counts does not guarantee correct nesting.',
	},
	{
		topic: 'stacks-queues',
		title: 'Min Stack',
		level: 'Medium',
		slug: 'min-stack',
		prompt:
			'Support push, pop, top and retrieving the current minimum in constant time.',
		example: 'Push 3, 1, 1; pop once → minimum is still 1',
		hint: 'Store the minimum so far alongside each stack entry.',
		answer:
			'Each entry stores [value, minimumIncludingThisEntry]. A push computes min(value, previousMinimum), while pop removes both facts together. The new top already knows the correct minimum. A second minima stack also works if equal minima are retained or counted.',
		cost: 'O(1) per operation, O(n) space.',
		trap: 'Saving only strictly smaller minima without handling duplicates loses the minimum after one repeated minimum is popped.',
	},
	{
		topic: 'stacks-queues',
		title: 'Daily Temperatures',
		level: 'Medium',
		slug: 'daily-temperatures',
		prompt:
			'For each day, return how many days pass before a strictly warmer temperature, or zero if none.',
		example: '[73, 71, 75] → [2, 1, 0]',
		hint: 'Keep unresolved day indices in a stack with non-increasing temperatures.',
		answer:
			'When a new temperature is warmer than the stack top, pop that earlier day and record currentIndex − earlierIndex. Continue while it resolves more earlier days, then push the current day. Every popped day is resolved by its first warmer day because no earlier scanned day was warm enough.',
		cost: 'O(n) time, O(n) stack space plus output.',
		trap: 'Equal temperatures are not warmer. Store indices to compute waiting times.',
	},
	{
		topic: 'stacks-queues',
		title: 'Sliding Window Maximum',
		level: 'Hard',
		slug: 'sliding-window-maximum',
		prompt: 'Return the maximum in every contiguous window of length k.',
		example: '[1, 3, -1, -3, 5, 3, 6, 7], k = 3 → [3, 3, 5, 5, 6, 7]',
		hint: 'Keep candidate indices in decreasing value order, with the oldest maximum at the front.',
		answer:
			'Use a deque. Expire indices outside the current window from the front. Remove back indices whose values are no larger than the incoming value because the newer value dominates them and expires later. Append the current index and read the front once a full window exists.',
		cost: 'O(n) time, O(k) logical deque space with a ring buffer or compact deque.',
		trap: 'A plain JavaScript array with repeated shift() can spoil the intended bound; use head/tail indices with managed storage.',
	},
	{
		topic: 'backtracking',
		title: 'Subsets',
		level: 'Medium',
		slug: 'subsets',
		prompt: 'Enumerate all subsets of an array of distinct values.',
		example: '[1, 2] → [], [1], [2], [1, 2]',
		hint: 'Each position contributes an independent include/exclude decision.',
		answer:
			'Recursively decide whether to include each item. At a leaf, copy the current path into the results. Undo an inclusion after returning so the next branch starts from the same state. Distinct inputs make the binary decision path unique for each subset.',
		cost: 'O(n · 2ⁿ) time including copies, O(n) auxiliary space, O(n · 2ⁿ) output.',
		trap: 'Store path.slice(), not the same mutable path object for every answer.',
	},
	{
		topic: 'backtracking',
		title: 'Permutations',
		level: 'Medium',
		slug: 'permutations',
		prompt: 'Enumerate every ordering of distinct input values.',
		example: '[1, 2, 3] has 6 permutations',
		hint: 'At each position, choose an unused value and restore its availability afterward.',
		answer:
			'Maintain a path and used flags. Try every unused index, mark it, append its value, recurse, then pop and unmark. Copy a completed length-n path. With repeated values, the unique-permutation variant needs a duplicate-skipping rule or frequency counts.',
		cost: 'O(n · n!) time including output copies, O(n) auxiliary space, O(n · n!) output.',
		trap: 'A global set of values is not sufficient when equal values at different indices are permitted.',
	},
	{
		topic: 'backtracking',
		title: 'Combination Sum',
		level: 'Medium',
		slug: 'combination-sum',
		prompt:
			'Find unique combinations of distinct positive candidates that sum to a target; a candidate may be reused.',
		example: '[2, 3, 6, 7], target 7 → [[2, 2, 3], [7]]',
		hint: 'Keep choices in nondecreasing index order and recurse at the same index when reuse is allowed.',
		answer:
			'Sort candidates. At each call, try indices from start onward. Choose a candidate, reduce the remaining target, recurse using that same index, then undo. Record a copy when remaining reaches zero; stop the sorted loop when a candidate exceeds remaining. Monotonic index choices remove order duplicates.',
		cost: 'Exponential, output-dependent search; depth is at most target / smallest candidate, plus result-copy cost.',
		trap: 'Zero or negative candidates break the decreasing-remaining argument. Advancing to index + 1 instead would forbid reuse.',
	},
	{
		topic: 'trees',
		title: 'Maximum Depth of Binary Tree',
		level: 'Easy',
		slug: 'maximum-depth-of-binary-tree',
		prompt: 'Return the number of nodes on the longest root-to-leaf path.',
		example:
			'A root with one leaf child has depth 2; an empty tree has depth 0',
		hint: 'Ask each child for its depth, then add the current node.',
		answer:
			'Return zero for null. Otherwise return 1 + max(depth(left), depth(right)). The recursive contract is that a call reports the longest downward path inside its own subtree. An iterative BFS can count levels instead.',
		cost: 'O(n) time, O(h) recursive stack space.',
		trap: 'Depth in edges and depth in nodes differ by one. A chain can exceed JavaScript’s recursion limit.',
	},
	{
		topic: 'trees',
		title: 'Validate Binary Search Tree',
		level: 'Medium',
		slug: 'validate-binary-search-tree',
		prompt: 'Check the global strict BST ordering rule for every subtree.',
		example: 'Root 10, right child 15, and 15’s left child 6 → invalid',
		hint: 'Pass the allowable value range inherited from all ancestors.',
		answer:
			'Each recursive call receives exclusive low/high bounds. Reject a value outside them. Recurse left with high set to the current value and right with low set to it. Under the no-duplicates policy, strict inequalities preserve the complete ancestor constraints.',
		cost: 'O(n) time, O(h) stack space.',
		trap: 'Comparing only direct children misses violations deeper in a subtree. Establish the duplicate policy.',
	},
	{
		topic: 'trees',
		title: 'Lowest Common Ancestor of a Binary Tree',
		level: 'Medium',
		slug: 'lowest-common-ancestor-of-a-binary-tree',
		prompt:
			'Find the lowest node whose subtree contains both target node identities; both targets are present.',
		example:
			'Targets in different child subtrees have their common ancestor at the current node',
		hint: 'Have a subtree report whether it found a target or already found the ancestor.',
		answer:
			'Return the current node if it is null or one of the targets. Recurse into both children. If both return non-null, the current node is the split point and ancestor. Otherwise pass up the non-null result. If target presence is not guaranteed, also count or verify that both targets were found.',
		cost: 'O(n) time, O(h) stack space.',
		trap: 'The general binary-tree problem cannot use BST value ordering. One target may be the ancestor of the other.',
	},
	{
		topic: 'heaps',
		title: 'Kth Largest Element in an Array',
		level: 'Medium',
		slug: 'kth-largest-element-in-an-array',
		prompt: 'Find the kth largest value counting duplicate occurrences.',
		example: '[3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4 → 4',
		hint: 'Retain k candidates and expose the weakest retained one.',
		answer:
			'Use a min-heap of at most k values. Fill it, then replace the root only when a larger value arrives. After scanning, the root is kth largest. Quickselect is another option with expected linear time, but ordinary pivot choices have quadratic worst cases.',
		cost: 'Heap: O(n log k) for k ≥ 2, O(k) space; k = 1 is O(n).',
		trap: '“Kth largest” normally counts duplicates; it is not the kth distinct value.',
	},
	{
		topic: 'heaps',
		title: 'Merge K Sorted Lists',
		level: 'Hard',
		slug: 'merge-k-sorted-lists',
		prompt: 'Merge k disjoint sorted linked lists into one sorted chain.',
		example: '1→4, 1→3, 2→6 become 1→1→2→3→4→6',
		hint: 'Only the current head of each list can be the next overall minimum.',
		answer:
			'Put every nonempty list head in a min-heap. Extract the smallest, append that node to the result, and insert its next node if present. The heap holds at most one frontier node from each input. Divide-and-conquer pairwise merging is another O(N log k) approach.',
		cost: 'O(N log k) time for k ≥ 2 and O(k) heap space, where N is the total node count.',
		trap: 'Splicing mutates the original links and assumes disjoint input chains. Equal values need a comparator that handles ties.',
	},
	{
		topic: 'heaps',
		title: 'Find Median from Data Stream',
		level: 'Hard',
		slug: 'find-median-from-data-stream',
		prompt:
			'Support adding values and querying the median of all values added so far.',
		example: 'Add 1, 2 → median 1.5; add 3 → median 2',
		hint: 'Split the stream into a lower half and an upper half, exposing the boundary of each.',
		answer:
			'Use a max-heap for the lower half and a min-heap for the upper half. Insert on the appropriate side, then rebalance so the lower half has either the same size or one extra value. Maintain max(lower) ≤ min(upper). The median is the lower root or the average of both roots.',
		cost: 'O(log n) insertion, O(1) median query, O(n) space.',
		trap: 'Size balance alone is insufficient; preserve the ordering between halves too. Define behavior before the first insertion.',
	},
	{
		topic: 'graphs',
		title: 'Number of Islands',
		level: 'Medium',
		slug: 'number-of-islands',
		prompt:
			'Count four-directionally connected components of land in a binary grid.',
		example: '[[1,1,0],[0,1,0],[1,0,1]] → 3',
		hint: 'Every unvisited land cell starts exactly one new component traversal.',
		answer:
			'Scan all cells. When unvisited land appears, increment the island count and flood its component with BFS or DFS. Mark a cell when discovering it so it is not scheduled multiple times. Use a separate visited structure if the grid must remain unchanged.',
		cost: 'O(rows · columns) time and O(rows · columns) worst-case auxiliary space.',
		trap: 'Diagonal contact does not connect islands in this version. Recursive DFS can overflow on a long narrow island.',
	},
	{
		topic: 'graphs',
		title: 'Clone Graph',
		level: 'Medium',
		slug: 'clone-graph',
		prompt:
			'Deep-copy the component reachable from a graph node, preserving cycles and shared neighbors.',
		example: 'A ↔ B becomes newA ↔ newB with no original node references',
		hint: 'Map each original node identity to its clone before exploring its neighbors.',
		answer:
			'Create and cache the clone as soon as an original node is discovered. Traverse neighbors and append the already cached or newly created neighbor clones. The early cache entry terminates cycles and ensures two edges to the same original node lead to one shared cloned node.',
		cost: 'O(V + E) time, O(V) auxiliary map/traversal space plus O(V + E) output.',
		trap: 'Using node values as keys fails unless unique values are explicitly guaranteed. Caching after recursion does not stop cycles.',
	},
	{
		topic: 'graphs',
		title: 'Rotting Oranges',
		level: 'Medium',
		slug: 'rotting-oranges',
		prompt:
			'All rotten oranges spread rot to adjacent fresh oranges simultaneously each minute. Find the finishing time or report unreachable fresh fruit.',
		example: '[[2,1,1],[1,1,0],[0,1,1]] → 4 minutes',
		hint: 'Start one BFS with every initially rotten cell at distance zero.',
		answer:
			'Count fresh oranges and enqueue all initial rotten ones. Process the queue by minute layers, converting and enqueueing each newly reached fresh neighbor once. Decrement fresh count as cells are infected. Return elapsed layers if no fresh fruit remains; otherwise return −1.',
		cost: 'O(rows · columns) time and queue space in the worst case.',
		trap: 'Running a separate BFS from each source repeats work and mishandles simultaneous minimum arrival times.',
	},
	{
		topic: 'advanced-graphs',
		title: 'Course Schedule',
		level: 'Medium',
		slug: 'course-schedule',
		prompt:
			'Determine whether every course can be completed given directed prerequisite relationships.',
		example: '0 requires 1 and 1 requires 0 → false',
		hint: 'Can repeatedly removing zero-prerequisite courses remove the entire graph?',
		answer:
			'Build edges prerequisite → dependent course and compute indegrees. Enqueue every zero-indegree course, then decrement dependent indegrees as courses are processed. All courses can finish exactly when the processed count equals the number of courses. A directed DFS with visiting/finished states is an alternative.',
		cost: 'O(V + E) time, O(V + E) graph space and O(V) additional queue/indegree space.',
		trap: 'Include courses with no edges. An undirected parent-edge cycle rule is not valid for this directed graph.',
	},
	{
		topic: 'advanced-graphs',
		title: 'Network Delay Time',
		level: 'Medium',
		slug: 'network-delay-time',
		prompt:
			'Find when a signal starting at one vertex reaches every vertex through nonnegative weighted directed edges.',
		example: '2→1 costs 1, 2→3 costs 1, 3→4 costs 1; start 2 → time 2',
		hint: 'You need the shortest distance to every vertex, then the largest of those distances.',
		answer:
			'Run Dijkstra with a min-priority queue of distance/node pairs. Relax outgoing edges only when a shorter distance is found, and ignore a popped pair if its distance is stale. If any vertex remains unreachable, return −1; otherwise return the maximum final distance.',
		cost: 'With a lazy binary heap, O((V + E) log E) time and O(V + E) space including queued duplicates and adjacency.',
		trap: 'Summing all shortest distances does not give the arrival time. The signal propagates along different routes concurrently.',
	},
	{
		topic: 'advanced-graphs',
		title: 'Redundant Connection',
		level: 'Medium',
		slug: 'redundant-connection',
		prompt:
			'In an undirected tree with one extra edge, identify the removable edge using the required input-order tie rule.',
		example: 'Edges [1,2], [1,3], [2,3] → [2,3]',
		hint: 'An edge forms a cycle when its endpoints are already connected.',
		answer:
			'Initialize a disjoint-set representative for each vertex. Scan edges in order. If both endpoints already have the same representative, that edge closes the cycle; otherwise union their components. Under the tree-plus-one-edge guarantee, the rejected edge is the last encountered edge on that cycle.',
		cost: 'O(E · α(V)) amortized time with rank/size and path compression, O(V) space.',
		trap: 'This argument is for an undirected graph. A directed redundant-edge variant needs additional reasoning.',
	},
	{
		topic: 'greedy-intervals',
		title: 'Merge Intervals',
		level: 'Medium',
		slug: 'merge-intervals',
		prompt:
			'Return the union of overlapping closed intervals as disjoint intervals.',
		example: '[[1,3],[2,6],[8,10]] → [[1,6],[8,10]]',
		hint: 'After sorting by start, only the last merged interval can overlap the next one.',
		answer:
			'Sort by start, copy the first interval, and scan. If the next start is at most the last end, extend that end to the larger endpoint. Otherwise append a new interval. Sorted starts ensure an interval cannot reach backward past a completed gap.',
		cost: 'O(n log n) time and O(n) output, plus sorting/copying space.',
		trap: 'Copy intervals if modifying their endpoints would otherwise mutate the caller’s nested arrays. Endpoint equality depends on closed versus half-open rules.',
	},
	{
		topic: 'greedy-intervals',
		title: 'Non-overlapping Intervals',
		level: 'Medium',
		slug: 'non-overlapping-intervals',
		prompt:
			'Remove the fewest intervals so that the remaining intervals do not overlap; touching endpoints are allowed.',
		example: '[[1,2],[2,3],[3,4],[1,3]] → remove 1',
		hint: 'Minimizing removals is the same as maximizing the count you keep.',
		answer:
			'Sort intervals by end time. Keep an interval if its start is at least the end of the previously kept interval. The earliest finishing compatible interval leaves maximal room for future intervals, so an optimal schedule can exchange its first choice for this one. Return total count minus kept count.',
		cost: 'O(n log n) time; O(1) scan state beyond the chosen sorting strategy.',
		trap: 'Sorting only by duration or start time does not support the same exchange proof.',
	},
	{
		topic: 'greedy-intervals',
		title: 'Jump Game',
		level: 'Medium',
		slug: 'jump-game',
		prompt:
			'Each nonnegative value is the maximum forward jump from that index. Decide whether the last index is reachable.',
		example: '[2,3,1,1,4] → true; [3,2,1,0,4] → false',
		hint: 'Keep the farthest index reachable from all positions you have already visited.',
		answer:
			'Start reach at zero and scan indices while each is at most reach. Extend reach with max(reach, index + nums[index]). Reaching the last index proves success. If an index lies beyond reach, no earlier reachable choice can bridge the gap, so the remaining suffix is unreachable.',
		cost: 'O(n) time, O(1) space.',
		trap: 'The largest immediate jump is not always the best landing point. Reach represents every available earlier jump, not one committed path.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Climbing Stairs',
		level: 'Easy',
		slug: 'climbing-stairs',
		prompt:
			'Count ordered ways to reach step n using moves of one or two steps.',
		example: 'n = 3 → 3 ways: 1+1+1, 1+2, 2+1',
		hint: 'The final move comes from step n − 1 or n − 2.',
		answer:
			'Define ways[i] as the number of sequences reaching step i. With ways[0] = 1 and ways[1] = 1, use ways[i] = ways[i − 1] + ways[i − 2]. Only two previous values are needed, so roll them forward in constant space.',
		cost: 'O(n) time, O(1) auxiliary space.',
		trap: 'The empty sequence is one way to reach step zero. Large counts may exceed the chosen numeric representation.',
	},
	{
		topic: 'dynamic-programming',
		title: 'House Robber',
		level: 'Medium',
		slug: 'house-robber',
		prompt:
			'Choose nonadjacent houses with nonnegative values to maximize the collected total.',
		example: '[2,7,9,3,1] → 12 from 2+9+1',
		hint: 'At the current house, compare skipping it with taking it plus the best answer two houses back.',
		answer:
			'Let best[i] be the best total through house i. Then best[i] = max(best[i − 1], value[i] + best[i − 2]). Keep only the two earlier totals and update them without overwriting a value that is still needed. A circular street is a separate variation that excludes either the first or the last house.',
		cost: 'O(n) time, O(1) space.',
		trap: 'Greedily taking every locally larger neighbor can miss the optimal combination.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Coin Change',
		level: 'Medium',
		slug: 'coin-change',
		prompt:
			'Find the fewest reusable positive-denomination coins needed to form an amount, or report impossible.',
		example: 'coins [1,3,4], amount 6 → 2',
		hint: 'Try each denomination as the final coin in a solution for a smaller amount.',
		answer:
			'Set dp[0] = 0 and other states to infinity. For each amount a, minimize 1 + dp[a − coin] over coins no larger than a. Positive denominations guarantee all needed states are smaller and already computed. An infinite final state means no combination can reach the amount.',
		cost: 'O(amount · denominations) time, O(amount) space; pseudopolynomial in the numeric amount.',
		trap: 'Largest-first greedy fails for arbitrary denominations, and initializing unreachable states to zero invents impossible solutions.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Longest Increasing Subsequence',
		level: 'Medium',
		slug: 'longest-increasing-subsequence',
		prompt:
			'Find the length of the longest strictly increasing subsequence, with gaps allowed.',
		example: '[10,9,2,5,3,7,101,18] → 4',
		hint: 'For each possible subsequence length, keep its smallest achievable ending value.',
		answer:
			'Maintain tails, where tails[length − 1] is the smallest ending value of an increasing subsequence of that length. For each number, replace its lower-bound position in tails or append when beyond the end. A smaller tail preserves more opportunities for future extension. A simpler DP tries all earlier smaller values.',
		cost: 'O(n log n) time, O(n) space for tails; basic DP is O(n²) time.',
		trap: 'tails is not necessarily an actual subsequence. Strictly increasing uses lower bound; nondecreasing uses a different boundary.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Longest Common Subsequence',
		level: 'Medium',
		slug: 'longest-common-subsequence',
		prompt:
			'Find the maximum length of a sequence that appears in order in both input strings.',
		example: '“abcde” and “ace” → 3',
		hint: 'Let a state compare prefixes of both strings. What changes when their final characters match?',
		answer:
			'Use a table with an extra zero row and column. Matching characters extend the diagonal by one. Otherwise use max(top, left), representing skipping the last character of one prefix. Read the bottom-right state. Save choices or inspect the full table to reconstruct a subsequence.',
		cost: 'O(mn) time, O(mn) full-table space; length-only computation can use O(min(m,n)) space.',
		trap: 'Subsequence allows gaps. Resetting a state to zero on mismatch solves a substring-style recurrence instead.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Edit Distance',
		level: 'Medium',
		slug: 'edit-distance',
		prompt:
			'Find the fewest single-character insertions, deletions and replacements that transform one string into another.',
		example: '“horse” → “ros” needs 3 edits',
		hint: 'Use prefix lengths as state and compare the three possible final edit operations.',
		answer:
			'Initialize converting a length-i prefix to empty with cost i and the reverse with cost j. Matching final characters use the diagonal at no extra cost. Otherwise use one plus the minimum of top, left and diagonal, corresponding to deletion, insertion and replacement. Fill in increasing prefix order.',
		cost: 'O(mn) time, O(mn) full-table space; two-row storage reduces auxiliary space.',
		trap: 'The base row and column are distances, not zeroes. Weighted edits require a different recurrence cost.',
	},
	{
		topic: 'tries',
		title: 'Implement Trie',
		level: 'Medium',
		slug: 'implement-trie-prefix-tree',
		prompt: 'Implement word insertion, exact search and prefix search.',
		example: 'Insert “apple”: search “app” is false, startsWith “app” is true',
		hint: 'Separate reaching a prefix node from recognizing a complete word.',
		answer:
			'Each node stores children and a terminal flag. Insertion creates missing edges and marks the final node. Exact search walks all characters and checks terminal; prefix search only requires that the full prefix path exists. Shared prefixes reuse nodes.',
		cost: 'Expected O(L) time per length-L operation; O(total inserted symbols) node count.',
		trap: 'A prefix node may be terminal and still have children. Define empty-word behavior consistently.',
	},
	{
		topic: 'tries',
		title: 'Design Add and Search Words Data Structure',
		level: 'Medium',
		slug: 'design-add-and-search-words-data-structure',
		prompt:
			'Store words and search patterns where a dot matches any one character.',
		example: 'After adding “bad”, searching “.ad” is true',
		hint: 'Ordinary characters follow one edge; a wildcard must try every available child.',
		answer:
			'Use a trie for insertion. Search recursively with a node and pattern index. Follow a matching edge for a literal; for a dot, try all children and stop at the first successful branch. When the pattern ends, accept only a terminal node. The same state can be memoized if the structure or pattern creates repeated states.',
		cost: 'O(visited search states), potentially exponential in wildcard count; O(L) active recursion depth.',
		trap: 'A wildcard consumes exactly one character, and finishing at a nonterminal prefix is not a word match.',
	},
	{
		topic: 'tries',
		title: 'Word Search II',
		level: 'Hard',
		slug: 'word-search-ii',
		prompt:
			'Find dictionary words formed by adjacent board cells without reusing a cell in one word path.',
		example: 'Board [[o,a],[e,t]] can form “oat” using right then down',
		hint: 'Search all dictionary prefixes together, pruning paths absent from a trie.',
		answer:
			'Build a trie of the words, then backtrack from each cell. Follow only edges matching the next board letter. Temporarily mark a cell used, explore neighbors, and restore it. On a terminal node, record the word and suppress repeated emission. Dead trie branches may be removed after their words are exhausted.',
		cost: 'A coarse bound is O(dictionary characters + rows · columns · 4^L), where L is maximum word length; trie pruning often reduces explored states.',
		trap: 'Restore visited cells after every branch and deduplicate words reached by multiple board paths.',
	},
	{
		topic: 'bits-math',
		title: 'Single Number',
		level: 'Easy',
		slug: 'single-number',
		prompt:
			'Every signed 32-bit integer occurs twice except one. Find the unpaired value.',
		example: '[4,1,2,1,2] → 4',
		hint: 'Which operation cancels equal values regardless of order?',
		answer:
			'XOR every value into an accumulator initialized to zero. Equal pairs cancel because x ^ x = 0, and the remaining value survives because x ^ 0 = x. Commutativity and associativity make the input ordering irrelevant.',
		cost: 'O(n) time, O(1) space for fixed-width integers.',
		trap: 'JavaScript Number XOR coerces to signed 32-bit values. This solution depends on the exact duplicate-multiplicity guarantee.',
	},
	{
		topic: 'bits-math',
		title: 'Counting Bits',
		level: 'Easy',
		slug: 'counting-bits',
		prompt:
			'Return the number of set binary bits for every integer from zero through n.',
		example: 'n = 5 → [0,1,1,2,1,2]',
		hint: 'Remove the final binary digit and reuse the count of the smaller number.',
		answer:
			'Use bits[0] = 0 and bits[i] = bits[floor(i / 2)] + (i mod 2). Division by two drops the final bit; the remainder says whether that bit was one. This arithmetic form avoids Number bitwise coercion while preserving the recurrence.',
		cost: 'O(n) time and O(n) output space.',
		trap: 'A fixed-width shift-based version must stay within its supported integer range.',
	},
	{
		topic: 'bits-math',
		title: 'Pow(x, n)',
		level: 'Medium',
		slug: 'powx-n',
		prompt:
			'Compute x raised to an integer exponent efficiently, including negative exponents when the result is defined.',
		example: '2^10 = 1024; 2^-2 = 0.25',
		hint: 'Square the base and halve the exponent; odd exponents contribute one extra factor.',
		answer:
			'For a negative exponent, invert x and use a positive exponent. Repeatedly multiply the result by the base when the exponent is odd, square the base, and replace the exponent with floor(exponent / 2). The product of result and base^remaining stays equal to the desired value.',
		cost: 'O(log |n|) multiplications, O(1) auxiliary space for an iterative fixed-precision version.',
		trap: 'Avoid signed 32-bit shift surprises in JavaScript and define zero with negative exponents. Floating-point arithmetic can introduce rounding.',
	},
	{
		topic: 'matrices',
		title: 'Rotate Image',
		level: 'Medium',
		slug: 'rotate-image',
		prompt: 'Rotate a square matrix clockwise by 90 degrees in place.',
		example: '[[1,2],[3,4]] → [[3,1],[4,2]]',
		hint: 'Combine reflection across the main diagonal with a row reversal.',
		answer:
			'Transpose by swapping matrix[r][c] with matrix[c][r] only for c > r. Then reverse each row. The composition maps every original coordinate (r,c) to (c,n−1−r), which is exactly a clockwise rotation.',
		cost: 'O(n²) time, O(1) auxiliary space.',
		trap: 'Swapping both off-diagonal halves reverses the transpose. This method assumes a square matrix.',
	},
	{
		topic: 'matrices',
		title: 'Spiral Matrix',
		level: 'Medium',
		slug: 'spiral-matrix',
		prompt:
			'Return every entry of a rectangular matrix in clockwise spiral order.',
		example: '[[1,2,3],[4,5,6],[7,8,9]] → [1,2,3,6,9,8,7,4,5]',
		hint: 'Shrink the remaining rectangle after consuming each boundary.',
		answer:
			'Maintain top, bottom, left and right. Emit the top row and advance top, emit the right column and retreat right, then conditionally emit the bottom row and left column if their boundaries still remain. Repeat until the rectangle is empty.',
		cost: 'O(rows · columns) time, O(1) auxiliary state excluding output.',
		trap: 'Recheck boundaries before opposite sides so a remaining single row or column is not emitted twice.',
	},
	{
		topic: 'matrices',
		title: 'Set Matrix Zeroes',
		level: 'Medium',
		slug: 'set-matrix-zeroes',
		prompt:
			'If an entry is originally zero, set its entire row and column to zero in place.',
		example: '[[1,1,1],[1,0,1],[1,1,1]] → [[1,0,1],[0,0,0],[1,0,1]]',
		hint: 'Use the first row and column as markers while separately remembering their original zero status.',
		answer:
			'First record whether the original first row or first column contains zero. Scan the interior and mark row starts and column tops for every zero. Then zero marked interior cells, and finally apply the saved first-row and first-column flags. This preserves original evidence until it is no longer needed.',
		cost: 'O(rows · columns) time, O(1) auxiliary space.',
		trap: 'Zeroing immediately during discovery creates new zeroes that falsely trigger more rows and columns.',
	},
	{
		topic: 'arrays',
		title: 'Merge Sorted Array',
		level: 'Easy',
		slug: 'merge-sorted-array',
		prompt:
			'Merge two ascending arrays into the first array, which has enough trailing capacity for both.',
		example: '[1,2,3,0,0,0] with m = 3 and [2,5,6] → [1,2,2,3,5,6]',
		hint: 'Writing the smallest value first might overwrite unread input. Which end has spare space?',
		answer:
			'Keep pointers at the last valid value of each input and the last destination slot. Write the larger remaining value at the destination, then retreat that input pointer and the destination pointer. If the second input remains, copy it; if only the first remains, it is already in place.',
		cost: 'O(m + n) time, O(1) auxiliary space.',
		trap: 'Use the supplied valid lengths, not the total capacity. Trailing zeroes are placeholders, but zero can also be a real input value.',
	},
	{
		topic: 'two-pointers',
		title: 'Trapping Rain Water',
		level: 'Hard',
		slug: 'trapping-rain-water',
		prompt: 'Compute the total water trapped above unit-width elevation bars.',
		example: '[0,1,0,2,1,0,1,3,2,1,2,1] → 6',
		hint: 'Water at a position is limited by the smaller of the greatest walls to its left and right.',
		answer:
			'A straightforward linear solution builds prefix and suffix maxima, then sums min(leftMax, rightMax) − height at every index. To reduce space, maintain both maxima with two inward pointers. Resolve the side with the smaller known maximum: the opposite side already guarantees a wall at least that high, so the local water amount is fixed.',
		cost: 'O(n) time; O(n) space with maxima arrays or O(1) with two pointers.',
		trap: 'The answer sums water over positions; selecting one widest pair of walls solves a different objective. Keep update order consistent with the pointer invariant.',
	},
	{
		topic: 'linked-lists',
		title: 'LRU Cache',
		level: 'Medium',
		slug: 'lru-cache',
		prompt:
			'Support key lookup and insertion/update, evicting the least recently used key when a positive capacity is exceeded.',
		example: 'Capacity 2: put A, put B, get A, put C → B is evicted',
		hint: 'Combine fast key lookup with a structure that moves a known item to the front in constant time.',
		answer:
			'Use a map from key to node and a doubly linked recency list with sentinel ends. A get or update unlinks the node and moves it to the most-recent end. A new insertion exceeding capacity removes the least-recent node and its map entry. Keep both structures synchronized for every operation.',
		cost: 'Expected O(1) get/put time, O(capacity) space.',
		trap: 'Updating an existing key must refresh recency without growing the cache size. Node removal must repair both neighboring links.',
	},
	{
		topic: 'trees',
		title: 'Binary Tree Level Order Traversal',
		level: 'Medium',
		slug: 'binary-tree-level-order-traversal',
		prompt: 'Return node values grouped by depth, from the root downward.',
		example:
			'Root 3 with children 9 and 20 → [[3], [9,20]] before deeper levels',
		hint: 'At the start of a BFS layer, record how many nodes belong to that layer.',
		answer:
			'Enqueue the root and use a head index. For each level, capture queue.length − head, remove exactly that many nodes, collect their values, and append their children. The captured count prevents children from being processed in their parents’ level. An empty root returns an empty list.',
		cost: 'O(n) time; O(width) live queue state, or O(n) retained backing storage for a simple head-index array, plus output.',
		trap: 'Rechecking a growing queue length inside the current level can collapse all depths into one group.',
	},
	{
		topic: 'trees',
		title: 'Construct Binary Tree from Preorder and Inorder Traversal',
		level: 'Medium',
		slug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
		prompt:
			'Reconstruct a binary tree from valid preorder and inorder traversals with unique values.',
		example: 'Preorder [3,9,20,15,7], inorder [9,3,15,20,7] gives root 3',
		hint: 'Preorder reveals the next root. Inorder reveals how that root splits its subtree.',
		answer:
			'Map every value to its inorder index. Maintain a shared preorder cursor and recursively build an inorder range: consume its root, build the left range, then the right range. Use index boundaries rather than copying slices. The unique-value assumption makes each split unambiguous.',
		cost: 'O(n) time, O(n) lookup space and O(h) call stack.',
		trap: 'Build left before right when consuming preorder. Repeated slicing or searching for roots can cause O(n²) work.',
	},
	{
		topic: 'trees',
		title: 'Serialize and Deserialize Binary Tree',
		level: 'Hard',
		slug: 'serialize-and-deserialize-binary-tree',
		prompt:
			'Encode a general binary tree and rebuild exactly the same values and shape.',
		example:
			'A root 1 with only right child 2 needs an explicit missing-left marker',
		hint: 'A traversal of values alone does not preserve where children are absent.',
		answer:
			'Use preorder tokens with explicit null markers and an unambiguous value encoding. Serialization emits a node then its left and right subtrees. Deserialization consumes one token: null returns no node; a value creates a node and recursively consumes its two children. A structured token format avoids delimiter collisions.',
		cost: 'O(n) tokens and O(n) traversal time, plus value encoding/decoding cost; O(h) active stack.',
		trap: 'Define the null marker and token boundaries so valid values cannot be mistaken for structure. Validate malformed external data in production.',
	},
	{
		topic: 'heaps',
		title: 'Top K Frequent Elements',
		level: 'Medium',
		slug: 'top-k-frequent-elements',
		prompt: 'Return k values with the greatest occurrence counts.',
		example: '[1,1,1,2,2,3], k = 2 → [1,2]',
		hint: 'Separate counting from selecting. The heap priority is frequency, not the numeric value.',
		answer:
			'Build a frequency map, then maintain a min-heap of at most k distinct values keyed by count. Remove the smallest count when the heap grows too large. Alternatively, place distinct values into buckets indexed by frequency and collect from high buckets downward. State the tie rule if the answer is not guaranteed unique.',
		cost: 'Expected O(n + u log k) heap time for k ≥ 2, O(u + k) space, with u distinct values. Buckets use expected O(n) time and O(n) space.',
		trap: 'Kth largest value and most frequent value are different priorities. Count before selecting.',
	},
	{
		topic: 'backtracking',
		title: 'N-Queens',
		level: 'Hard',
		slug: 'n-queens',
		prompt:
			'Place n queens on an n×n board so that no pair shares a row, column or diagonal, returning all arrangements.',
		example: 'n = 4 has 2 arrangements',
		hint: 'Place one queen per row and track columns plus the two diagonal identities.',
		answer:
			'Recurse row by row. A candidate column is safe when column, row − column and row + column are all unused. Mark those three facts, place the queen, recurse, then undo all marks. On reaching row n, render a copy of the arrangement. Early conflict checks prune invalid partial boards.',
		cost: 'A common search upper bound is O(n · n!) with n column checks per partial state; returned boards add O(solutions · n²). Auxiliary search state is O(n).',
		trap: 'Undo both diagonal sets as well as the column set. Exclude returned board storage when claiming O(n) auxiliary space.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Word Break',
		level: 'Medium',
		slug: 'word-break',
		prompt:
			'Decide whether a string can be segmented entirely into reusable dictionary words.',
		example: '“leetcode” with [“leet”, “code”] → true',
		hint: 'A prefix is segmentable if an earlier segmentable prefix can be followed by one dictionary word.',
		answer:
			'Set can[0] = true. For each ending position, try dictionary words that could end there; if the preceding prefix is segmentable and the characters match, mark the end true. A set with bounded candidate word lengths or a trie can reduce needless comparisons. Include substring construction or character comparison cost in the bound.',
		cost: 'Trying all D words at n positions costs O(n · D · L) in a straightforward character-comparison implementation, with L the maximum word length; O(n) DP space plus dictionary.',
		trap: 'Choosing the longest matching word greedily can block a valid segmentation. Memoize failed suffixes in a recursive version.',
	},
	{
		topic: 'dynamic-programming',
		title: 'Partition Equal Subset Sum',
		level: 'Medium',
		slug: 'partition-equal-subset-sum',
		prompt:
			'Decide whether positive integer values can be split into two groups with equal total sum.',
		example: '[1,5,11,5] → true',
		hint: 'An even total reduces the task to reaching half the total using each item at most once.',
		answer:
			'Reject an odd total. Set reachable[0] = true and target = total / 2. For each value, update sums from target downward with reachable[s] ||= reachable[s − value]. Descending order prevents the current item from being used repeatedly within one iteration. Return reachable[target].',
		cost: 'O(n · target) time, O(target) space; pseudopolynomial in the target sum.',
		trap: 'Updating sums upward solves an unbounded-reuse variant and can report a nonexistent partition.',
	},
	{
		topic: 'matrices',
		title: 'Search a 2D Matrix',
		level: 'Medium',
		slug: 'search-a-2d-matrix',
		prompt:
			'Search a rectangular matrix whose rows are sorted and each row starts above the previous row’s last value.',
		example: '[[1,3,5],[7,9,11]], target 9 → true',
		hint: 'These ordering guarantees make the flattened row-major sequence sorted.',
		answer:
			'Binary-search flat indices from zero through rows · columns. Map midpoint i to row floor(i / columns) and column i mod columns. Compare that cell with the target and shrink the interval as in ordinary binary search. Handle an empty matrix before reading its first row.',
		cost: 'O(log(rows · columns)) time, O(1) space.',
		trap: 'Individually sorted rows and columns alone do not guarantee globally sorted row-major order. That variant needs a different search.',
	},
	{
		topic: 'graphs',
		title: 'Word Ladder',
		level: 'Hard',
		slug: 'word-ladder',
		prompt:
			'Find the shortest sequence from one word to another by changing one character per step, with intermediate words in a dictionary.',
		example: 'hit → hot → dot → dog → cog has sequence length 5',
		hint: 'Words are vertices and one-letter changes are unweighted edges.',
		answer:
			'Use BFS from the start. Generate each position’s possible replacement letters and enqueue unseen dictionary words, marking them immediately. Return the first target distance using the required word-count convention. Bidirectional BFS can reduce explored states by expanding from both ends, but needs careful frontier and visited handling.',
		cost: 'For N visited words of length L and alphabet size A, naive immutable-string neighbor generation is O(N · A · L²) including candidate construction; storage depends on dictionary and queued words.',
		trap: 'Clarify whether distance counts edges or words. Repeated string slicing is not O(1) work.',
	},
	{
		topic: 'advanced-graphs',
		title: 'Min Cost to Connect All Points',
		level: 'Medium',
		slug: 'min-cost-to-connect-all-points',
		prompt: 'Connect all points using minimum total Manhattan edge cost.',
		example: 'Points (0,0), (2,0), (2,2) can be connected for total cost 4',
		hint: 'Every point can connect to every other point; you need an MST, not routes from a source.',
		answer:
			'Use dense Prim without materializing every edge. Maintain each unselected point’s cheapest edge to the selected set. Repeatedly select the unselected point with smallest connection cost, add that cost, and update other points using Manhattan distance. The cut property makes each chosen crossing edge safe.',
		cost: 'O(n²) time, O(n) auxiliary space for dense Prim.',
		trap: 'Building and sorting all pair edges takes O(n²) storage and O(n² log n) time, which is avoidable for this dense graph.',
	},
	{
		topic: 'greedy-intervals',
		title: 'Partition Labels',
		level: 'Medium',
		slug: 'partition-labels',
		prompt:
			'Split a string into as many contiguous parts as possible so that each letter occurs in only one part.',
		example: '“ababcbacadefegdehijhklij” → lengths [9,7,8]',
		hint: 'A part containing a character must reach at least that character’s final occurrence.',
		answer:
			'Record the last index of each character. Scan while extending the current part’s required end to the maximum last occurrence of every encountered character. When the current index reaches that end, close the part: none of its characters can reappear later. Closing at the earliest safe boundary maximizes the number of parts.',
		cost: 'O(n) time, O(alphabet size) space.',
		trap: 'The boundary may extend several times as new characters appear inside the current part.',
	},
	{
		topic: 'stacks-queues',
		title: 'Largest Rectangle in Histogram',
		level: 'Hard',
		slug: 'largest-rectangle-in-histogram',
		prompt:
			'Find the greatest rectangular area under adjacent unit-width histogram bars.',
		example: '[2,1,5,6,2,3] → 10',
		hint: 'A bar can finalize its rectangle when a smaller bar reveals its right boundary.',
		answer:
			'Maintain an increasing-height stack of indices. When an incoming height is smaller, pop a bar: the current index is its exclusive right boundary, and the new stack top is its left boundary. Its width is current − leftBoundary − 1. Use a final virtual zero-height bar to flush remaining candidates, and handle equal heights consistently.',
		cost: 'O(n) time, O(n) stack space.',
		trap: 'Rectangle width is not simply the distance from the popped index to the current index. It extends back to the next smaller bar on the left.',
	},
	{
		topic: 'greedy-intervals',
		title: 'Insert Interval',
		level: 'Medium',
		slug: 'insert-interval',
		prompt:
			'Insert one closed interval into a sorted non-overlapping interval list, merging overlaps as needed.',
		example: '[[1,3],[6,9]] plus [2,5] → [[1,5],[6,9]]',
		hint: 'The sorted list has three regions: entirely before the new interval, overlapping it, and entirely after it.',
		answer:
			'Copy intervals ending before the new start. Then merge every interval whose start is at most the growing new end, updating both new boundaries. Append the merged interval and copy the remaining suffix. The input ordering makes each region contiguous, so no new sort is needed.',
		cost: 'O(n) time, O(n) output space with O(1) additional scan state.',
		trap: 'The merged end can grow during the overlap loop, bringing more intervals into the same group. Closed intervals sharing an endpoint overlap.',
	},
];
