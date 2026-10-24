'use strict';

(function () {
	DSA.addGroup({ id: 'searching', label: 'Searching', hint: 'Find a value' });

	const controls = [
		{ id: 'count', type: 'range', label: 'Items', min: 6, max: 24, value: 15 },
		{
			id: 'target', type: 'select', label: 'Target', value: 'hit',
			options: [['hit', 'Value that exists'], ['miss', 'Value that is missing'], ['first', 'First item'], ['last', 'Last item']]
		}
	];

	const legend = [['', 'Unchecked'], ['cur', 'Checking'], ['checked', 'Ruled out'], ['found', 'Found']];

	function setup(p, rand) {
		const a = [];
		let v = 2 + Math.floor(rand() * 6);
		for (let i = 0; i < p.count; i++) {
			a.push(v);
			v += 2 + Math.floor(rand() * 7);
		}
		let target;
		switch (p.target) {
			case 'first':
				target = a[0];
				break;
			case 'last':
				target = a[a.length - 1];
				break;
			case 'miss': {
				const gap = 1 + Math.floor(rand() * (a.length - 1));
				target = a[gap] - 1;
				if (a.indexOf(target) !== -1) {
					target = a[gap - 1] + 1;
				}
				break;
			}
			default:
				target = a[1 + Math.floor(rand() * (a.length - 2))];
		}
		return { a: a, target: target };
	}

	DSA.register({
		id: 'linear-search', group: 'searching', name: 'Linear Search', views: ['strip'], controls: controls, reroll: 'New data', legend: legend,
		blurb: 'Walks the array from the start, checking one item at a time. Works on any list — sorted or not — but may touch every element.',
		complexity: [['Best', 'O(1)'], ['Average', 'O(n)'], ['Worst', 'O(n)'], ['Space', 'O(1)']],
		code: [
			'for i from 0 to n-1:',
			'  if a[i] == target:',
			'    return i',
			'return -1   // not found'
		],
		build: function (p, rand) {
			const s = setup(p, rand);
			const a = s.a;
			const rec = DSA.util.recorder({ Checks: 0 });
			const cls = new Array(a.length).fill('');
			const label = 'Looking for ' + s.target;
			rec.add({ strip: { a: a, cls: cls.slice(), label: label }, msg: 'Searching for ' + s.target + ' — press play.', line: -1 });
			for (let i = 0; i < a.length; i++) {
				rec.inc('Checks');
				cls[i] = 'cur';
				rec.add({ strip: { a: a, cls: cls.slice(), ptr: { [i]: 'i' }, label: label }, msg: 'Is a[' + i + '] = ' + a[i] + ' equal to ' + s.target + '?', line: 1 });
				if (a[i] === s.target) {
					cls[i] = 'found';
					rec.add({ strip: { a: a, cls: cls.slice(), ptr: { [i]: 'found' }, label: label }, msg: 'Found ' + s.target + ' at index ' + i + ' after ' + (i + 1) + ' check' + (i ? 's' : '') + '.', line: 2 });
					return { frames: rec.frames, meta: {} };
				}
				cls[i] = 'checked';
			}
			rec.add({ strip: { a: a, cls: cls.slice(), label: label }, msg: s.target + ' is not in the array — checked all ' + a.length + ' items.', line: 3 });
			return { frames: rec.frames, meta: {} };
		}
	});

	DSA.register({
		id: 'binary-search', group: 'searching', name: 'Binary Search', views: ['strip'], controls: controls, reroll: 'New data', legend: [['', 'In range'], ['cur', 'Middle'], ['checked', 'Ruled out'], ['found', 'Found']],
		blurb: 'On a sorted array, compare with the middle element and throw away the half that cannot contain the target — halving the search space each step.',
		complexity: [['Best', 'O(1)'], ['Average', 'O(log n)'], ['Worst', 'O(log n)'], ['Space', 'O(1)'], ['Needs', 'Sorted data']],
		code: [
			'lo = 0; hi = n - 1',
			'while lo <= hi:',
			'  mid = floor((lo + hi) / 2)',
			'  if a[mid] == target: return mid',
			'  if a[mid] < target: lo = mid + 1',
			'  else:               hi = mid - 1',
			'return -1   // not found'
		],
		build: function (p, rand) {
			const s = setup(p, rand);
			const a = s.a;
			const t = s.target;
			const rec = DSA.util.recorder({ Comparisons: 0, 'Items left': a.length });
			const cls = new Array(a.length).fill('');
			const label = 'Looking for ' + t + ' in a sorted array';
			const ptrs = function (lo, mid, hi) {
				const m = {};
				const add = function (i, name) {
					if (i >= 0 && i < a.length) {
						m[i] = m[i] ? m[i] + ' · ' + name : name;
					}
				};
				add(lo, 'lo');
				add(mid, 'mid');
				add(hi, 'hi');
				return m;
			};
			rec.add({ strip: { a: a, cls: cls.slice(), ptr: ptrs(0, -1, a.length - 1), label: label }, msg: 'Searching for ' + t + '. The whole array is the search range.', line: 0 });
			let lo = 0;
			let hi = a.length - 1;
			while (lo <= hi) {
				const mid = Math.floor((lo + hi) / 2);
				rec.inc('Comparisons');
				rec.stats['Items left'] = hi - lo + 1;
				cls[mid] = 'cur';
				rec.add({ strip: { a: a, cls: cls.slice(), ptr: ptrs(lo, mid, hi), dim: [lo, hi], label: label }, msg: 'mid = ' + mid + ' → a[mid] = ' + a[mid] + '. Compare with ' + t + '.', line: 2 });
				if (a[mid] === t) {
					cls[mid] = 'found';
					rec.add({ strip: { a: a, cls: cls.slice(), ptr: { [mid]: 'found' }, label: label }, msg: 'Found ' + t + ' at index ' + mid + ' in ' + rec.stats.Comparisons + ' comparison' + (rec.stats.Comparisons > 1 ? 's' : '') + '.', line: 3 });
					return { frames: rec.frames, meta: {} };
				}
				if (a[mid] < t) {
					for (let i = lo; i <= mid; i++) {
						cls[i] = 'checked';
					}
					lo = mid + 1;
					rec.add({ strip: { a: a, cls: cls.slice(), ptr: ptrs(lo, -1, hi), dim: [lo, hi], label: label }, msg: a[mid] + ' < ' + t + ' — discard the left half, lo = ' + lo + '.', line: 4 });
				} else {
					for (let i = mid; i <= hi; i++) {
						cls[i] = 'checked';
					}
					hi = mid - 1;
					rec.add({ strip: { a: a, cls: cls.slice(), ptr: ptrs(lo, -1, hi), dim: [lo, hi], label: label }, msg: a[mid] + ' > ' + t + ' — discard the right half, hi = ' + hi + '.', line: 5 });
				}
			}
			rec.stats['Items left'] = 0;
			rec.add({ strip: { a: a, cls: cls.slice(), label: label }, msg: 'The range is empty — ' + t + ' is not in the array.', line: 6 });
			return { frames: rec.frames, meta: {} };
		}
	});
})();
