'use strict';

(function () {
	DSA.addGroup({ id: 'sorting', label: 'Sorting', hint: 'Order an array' });

	const controls = [
		{ id: 'size', type: 'range', label: 'Size', min: 5, max: 80, value: 36 },
		{
			id: 'pattern', type: 'select', label: 'Pattern', value: 'random',
			options: [['random', 'Random'], ['nearly', 'Nearly sorted'], ['reversed', 'Reversed'], ['few', 'Few unique']]
		}
	];

	const legend = [['', 'Unsorted'], ['compare', 'Comparing'], ['swap', 'Swapping'], ['pivot', 'Pivot / min'], ['done', 'In place']];

	// Shared recording context for every sort.
	function sortContext(params, rand, initialStats) {
		const a = DSA.util.makeArray(params.size, params.pattern, rand);
		const n = a.length;
		const rec = DSA.util.recorder(initialStats);
		const sorted = new Uint8Array(n);
		const ctx = {
			a: a,
			n: n,
			rec: rec,
			sorted: sorted,
			snap: function (msg, line, mark, range) {
				rec.add({ a: a.slice(), sorted: sorted.slice(), mark: mark || {}, range: range, msg: msg, line: line });
			},
			swap: function (i, j, line, msg, extra) {
				const tmp = a[i];
				a[i] = a[j];
				a[j] = tmp;
				rec.inc('Swaps');
				ctx.snap(msg, line, Object.assign({ swap: [i, j] }, extra));
			},
			finish: function () {
				const step = Math.max(1, Math.floor(n / 24));
				for (let i = 0; i < n; i++) {
					sorted[i] = 1;
					if (i % step === 0 || i === n - 1) {
						ctx.snap(i === n - 1 ? 'Sorted — every element is in its final position.' : 'Final sweep: confirming order…', -1);
					}
				}
				return { frames: rec.frames, meta: { max: Math.max.apply(null, a) } };
			}
		};
		ctx.snap('Unsorted array — press play to begin.', -1);
		return ctx;
	}

	DSA.register({
		id: 'bubble', group: 'sorting', name: 'Bubble Sort', views: ['bars'], controls: controls, reroll: 'New array', legend: legend,
		blurb: 'Repeatedly swaps adjacent out-of-order pairs. After each pass the largest remaining value has “bubbled” to the end.',
		complexity: [['Best', 'O(n)'], ['Average', 'O(n²)'], ['Worst', 'O(n²)'], ['Space', 'O(1)'], ['Stable', 'Yes']],
		code: [
			'for i from 0 to n-2:',
			'  swapped = false',
			'  for j from 0 to n-i-2:',
			'    if a[j] > a[j+1]:',
			'      swap(a[j], a[j+1]); swapped = true',
			'  if not swapped: break'
		],
		build: function (p, rand) {
			const c = sortContext(p, rand, { Comparisons: 0, Swaps: 0 });
			const a = c.a;
			const n = c.n;
			for (let i = 0; i < n - 1; i++) {
				let swapped = false;
				for (let j = 0; j < n - 1 - i; j++) {
					c.rec.inc('Comparisons');
					c.snap('Compare ' + a[j] + ' and ' + a[j + 1], 3, { compare: [j, j + 1] }, [0, n - 1 - i]);
					if (a[j] > a[j + 1]) {
						c.swap(j, j + 1, 4, a[j] + ' > ' + a[j + 1] + ', so swap them', {});
						swapped = true;
					}
				}
				c.sorted[n - 1 - i] = 1;
				if (!swapped) {
					for (let k = 0; k < n - 1 - i; k++) {
						c.sorted[k] = 1;
					}
					c.snap('A full pass with no swaps — already sorted, stop early.', 5);
					break;
				}
				c.snap(a[n - 1 - i] + ' has bubbled into its final place.', 5, {}, [0, n - 2 - i]);
			}
			return c.finish();
		}
	});

	DSA.register({
		id: 'selection', group: 'sorting', name: 'Selection Sort', views: ['bars'], controls: controls, reroll: 'New array', legend: legend,
		blurb: 'Scans the unsorted part for its minimum and swaps it to the front. Few swaps, but always scans everything.',
		complexity: [['Best', 'O(n²)'], ['Average', 'O(n²)'], ['Worst', 'O(n²)'], ['Space', 'O(1)'], ['Stable', 'No']],
		code: [
			'for i from 0 to n-2:',
			'  min = i',
			'  for j from i+1 to n-1:',
			'    if a[j] < a[min]: min = j',
			'  swap(a[i], a[min])'
		],
		build: function (p, rand) {
			const c = sortContext(p, rand, { Comparisons: 0, Swaps: 0 });
			const a = c.a;
			const n = c.n;
			for (let i = 0; i < n - 1; i++) {
				let min = i;
				c.snap('Assume ' + a[i] + ' is the smallest so far.', 1, { pivot: [min] }, [i, n - 1]);
				for (let j = i + 1; j < n; j++) {
					c.rec.inc('Comparisons');
					c.snap('Is ' + a[j] + ' smaller than the current minimum ' + a[min] + '?', 3, { pivot: [min], compare: [j] }, [i, n - 1]);
					if (a[j] < a[min]) {
						min = j;
						c.snap('New minimum: ' + a[min], 3, { pivot: [min] }, [i, n - 1]);
					}
				}
				if (min !== i) {
					c.swap(i, min, 4, 'Move the minimum ' + a[min] + ' to position ' + i, {});
				}
				c.sorted[i] = 1;
				c.snap(a[i] + ' is locked in at position ' + i + '.', 4, {}, [i + 1, n - 1]);
			}
			return c.finish();
		}
	});

	DSA.register({
		id: 'insertion', group: 'sorting', name: 'Insertion Sort', views: ['bars'], controls: controls, reroll: 'New array', legend: legend,
		blurb: 'Grows a sorted prefix by sliding each new element left into position — like sorting cards in your hand. Excellent on nearly-sorted data.',
		complexity: [['Best', 'O(n)'], ['Average', 'O(n²)'], ['Worst', 'O(n²)'], ['Space', 'O(1)'], ['Stable', 'Yes']],
		code: [
			'for i from 1 to n-1:',
			'  j = i',
			'  while j > 0 and a[j-1] > a[j]:',
			'    swap(a[j-1], a[j])',
			'    j = j - 1'
		],
		build: function (p, rand) {
			const c = sortContext(p, rand, { Comparisons: 0, Swaps: 0 });
			const a = c.a;
			const n = c.n;
			for (let i = 1; i < n; i++) {
				let j = i;
				c.snap('Take ' + a[i] + ' and insert it into the sorted prefix.', 1, { pivot: [i] }, [0, i]);
				while (j > 0) {
					c.rec.inc('Comparisons');
					c.snap('Is ' + a[j - 1] + ' > ' + a[j] + '?', 2, { compare: [j - 1, j] }, [0, i]);
					if (a[j - 1] > a[j]) {
						c.swap(j - 1, j, 3, 'Yes — shift it one step left.', {});
						j--;
					} else {
						break;
					}
				}
			}
			return c.finish();
		}
	});

	DSA.register({
		id: 'merge', group: 'sorting', name: 'Merge Sort', views: ['bars'], controls: controls, reroll: 'New array', legend: [['', 'Unsorted'], ['range', 'Active slice'], ['write', 'Writing'], ['done', 'In place']],
		blurb: 'Splits the array in half, sorts each half recursively, then merges the two sorted halves. Predictable O(n log n) and stable.',
		complexity: [['Best', 'O(n log n)'], ['Average', 'O(n log n)'], ['Worst', 'O(n log n)'], ['Space', 'O(n)'], ['Stable', 'Yes']],
		code: [
			'mergeSort(lo, hi):',
			'  if lo >= hi: return',
			'  mid = (lo + hi) / 2',
			'  mergeSort(lo, mid); mergeSort(mid+1, hi)',
			'  merge: copy both halves, then repeatedly',
			'    take the smaller front element -> a[k]'
		],
		build: function (p, rand) {
			const c = sortContext(p, rand, { Comparisons: 0, Writes: 0 });
			const a = c.a;
			const n = c.n;
			function mergeSort(lo, hi, depth) {
				if (lo >= hi) {
					return;
				}
				const mid = Math.floor((lo + hi) / 2);
				c.snap('Split [' + lo + '…' + hi + '] into two halves.', 2, {}, [lo, hi]);
				mergeSort(lo, mid, depth + 1);
				mergeSort(mid + 1, hi, depth + 1);
				const left = a.slice(lo, mid + 1);
				const right = a.slice(mid + 1, hi + 1);
				let i = 0;
				let j = 0;
				let k = lo;
				while (i < left.length && j < right.length) {
					c.rec.inc('Comparisons');
					const takeLeft = left[i] <= right[j];
					const msg = 'Compare ' + left[i] + ' (left) with ' + right[j] + ' (right) → take ' + (takeLeft ? left[i] : right[j]);
					a[k] = takeLeft ? left[i++] : right[j++];
					c.rec.inc('Writes');
					c.snap(msg, 5, { write: [k] }, [lo, hi]);
					k++;
				}
				while (i < left.length) {
					a[k] = left[i++];
					c.rec.inc('Writes');
					c.snap('Left half leftovers: copy ' + a[k], 5, { write: [k] }, [lo, hi]);
					k++;
				}
				while (j < right.length) {
					a[k] = right[j++];
					c.rec.inc('Writes');
					c.snap('Right half leftovers: copy ' + a[k], 5, { write: [k] }, [lo, hi]);
					k++;
				}
				if (lo === 0 && hi === n - 1) {
					return;
				}
				c.snap('Merged [' + lo + '…' + hi + '] — this slice is now sorted.', 4, {}, [lo, hi]);
			}
			mergeSort(0, n - 1, 0);
			return c.finish();
		}
	});

	DSA.register({
		id: 'quick', group: 'sorting', name: 'Quick Sort', views: ['bars'], controls: controls, reroll: 'New array', legend: legend,
		blurb: 'Picks a pivot, partitions smaller values to its left and larger to its right, then recurses. Fast in practice; Lomuto partition shown.',
		complexity: [['Best', 'O(n log n)'], ['Average', 'O(n log n)'], ['Worst', 'O(n²)'], ['Space', 'O(log n)'], ['Stable', 'No']],
		code: [
			'quickSort(lo, hi):',
			'  if lo >= hi: return',
			'  pivot = a[hi]; i = lo',
			'  for j from lo to hi-1:',
			'    if a[j] < pivot: swap(a[i++], a[j])',
			'  swap(a[i], a[hi])      // pivot lands',
			'  quickSort(lo, i-1); quickSort(i+1, hi)'
		],
		build: function (p, rand) {
			const c = sortContext(p, rand, { Comparisons: 0, Swaps: 0 });
			const a = c.a;
			function qs(lo, hi) {
				if (lo > hi) {
					return;
				}
				if (lo === hi) {
					c.sorted[lo] = 1;
					c.snap('A single element is already in place.', 1, {}, [lo, hi]);
					return;
				}
				const pivot = a[hi];
				let i = lo;
				c.snap('Pivot = ' + pivot + ' (last element of the slice).', 2, { pivot: [hi] }, [lo, hi]);
				for (let j = lo; j < hi; j++) {
					c.rec.inc('Comparisons');
					c.snap('Is ' + a[j] + ' < pivot ' + pivot + '?', 4, { pivot: [hi], compare: [j] }, [lo, hi]);
					if (a[j] < pivot) {
						if (i !== j) {
							c.swap(i, j, 4, 'Yes — move it into the “smaller” zone.', { pivot: [hi] });
						}
						i++;
					}
				}
				if (i !== hi) {
					c.swap(i, hi, 5, 'Place the pivot between the two zones.', {});
				}
				c.sorted[i] = 1;
				c.snap('Pivot ' + pivot + ' is in its final position.', 5, {}, [lo, hi]);
				qs(lo, i - 1);
				qs(i + 1, hi);
			}
			qs(0, c.n - 1);
			return c.finish();
		}
	});

	DSA.register({
		id: 'heap-sort', group: 'sorting', name: 'Heap Sort', views: ['bars'], controls: controls, reroll: 'New array', legend: legend,
		blurb: 'Builds a max-heap inside the array, then repeatedly swaps the root (largest) to the end and restores the heap.',
		complexity: [['Best', 'O(n log n)'], ['Average', 'O(n log n)'], ['Worst', 'O(n log n)'], ['Space', 'O(1)'], ['Stable', 'No']],
		code: [
			'buildMaxHeap(a)',
			'for end from n-1 down to 1:',
			'  swap(a[0], a[end])',
			'  siftDown(0, end)',
			'siftDown(i, size):',
			'  pick the largest of a[i], left, right',
			'  if a child is larger: swap and continue'
		],
		build: function (p, rand) {
			const c = sortContext(p, rand, { Comparisons: 0, Swaps: 0 });
			const a = c.a;
			const n = c.n;
			function sift(i, size) {
				for (;;) {
					const l = 2 * i + 1;
					const r = l + 1;
					let big = i;
					if (l < size) {
						c.rec.inc('Comparisons');
						c.snap('Compare parent ' + a[big] + ' with left child ' + a[l], 5, { compare: [big, l] }, [0, size - 1]);
						if (a[l] > a[big]) {
							big = l;
						}
					}
					if (r < size) {
						c.rec.inc('Comparisons');
						c.snap('Compare ' + a[big] + ' with right child ' + a[r], 5, { compare: [big, r] }, [0, size - 1]);
						if (a[r] > a[big]) {
							big = r;
						}
					}
					if (big === i) {
						return;
					}
					c.swap(i, big, 6, 'Child is larger — swap it up.', {});
					i = big;
				}
			}
			c.snap('Phase 1: turn the array into a max-heap.', 0, {}, [0, n - 1]);
			for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
				sift(i, n);
			}
			c.snap('Max-heap built — the largest value sits at index 0.', 0, {}, [0, n - 1]);
			for (let end = n - 1; end > 0; end--) {
				c.swap(0, end, 2, 'Move the root ' + a[0] + ' to its final spot.', {});
				c.sorted[end] = 1;
				sift(0, end);
			}
			return c.finish();
		}
	});
})();
