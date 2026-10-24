'use strict';

(function () {
	DSA.addGroup({ id: 'dp', label: 'Dynamic Programming', hint: 'Fill a table' });
	DSA.addGroup({ id: 'backtracking', label: 'Backtracking', hint: 'Try, undo, retry' });

	// ── Two-string DP tables ────────────────────────────────────────────────
	function cleanText(value, fallback) {
		const t = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
		return t || fallback;
	}

	const controls = [
		{ id: 'sa', type: 'text', label: 'String A', value: 'AGGTAB', max: 8 },
		{ id: 'sb', type: 'text', label: 'String B', value: 'GXTXAYB', max: 8 }
	];

	const editControls = [
		{ id: 'ea', type: 'text', label: 'From', value: 'KITTEN', max: 8 },
		{ id: 'eb', type: 'text', label: 'To', value: 'SITTING', max: 8 }
	];

	function tableFrame(A, B, dp, o) {
		return {
			table: {
				rows: ['ε'].concat(A.split('')),
				cols: ['ε'].concat(B.split('')),
				cells: dp.map(function (row) { return row.slice(); }),
				cur: o.cur,
				from: o.from,
				path: o.path
			},
			msg: o.msg,
			line: o.line
		};
	}

	DSA.register({
		id: 'lcs', group: 'dp', name: 'Longest Common Subsequence', views: ['table'], controls: controls,
		legend: [['', 'Cell'], ['cur', 'Computing'], ['range', 'Depends on'], ['path', 'Traceback']],
		blurb: 'Cell (i, j) holds the LCS length of the first i letters of A and the first j letters of B. Equal letters extend the diagonal; otherwise take the better of up or left.',
		complexity: [['Time', 'O(m · n)'], ['Space', 'O(m · n)'], ['Pattern', '2-D table'], ['Used in', 'diff, DNA']],
		code: [
			'dp[i][0] = dp[0][j] = 0',
			'for i in 1..m, j in 1..n:',
			'  if A[i] == B[j]:',
			'    dp[i][j] = dp[i-1][j-1] + 1',
			'  else:',
			'    dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
			'traceback from dp[m][n] to read the answer'
		],
		build: function (p) {
			const A = cleanText(p.sa, 'AGGTAB');
			const B = cleanText(p.sb, 'GXTXAYB');
			const m = A.length;
			const n = B.length;
			const dp = [];
			for (let i = 0; i <= m; i++) {
				dp.push(new Array(n + 1).fill(null));
			}
			const rec = DSA.util.recorder({ 'Cells filled': 0, 'LCS length': '–' });
			const add = function (o) {
				rec.add(tableFrame(A, B, dp, o));
			};
			add({ msg: 'Compare "' + A + '" with "' + B + '". Press play to fill the table.', line: -1 });
			for (let i = 0; i <= m; i++) {
				dp[i][0] = 0;
			}
			for (let j = 0; j <= n; j++) {
				dp[0][j] = 0;
			}
			add({ msg: 'Base case: an empty prefix has a common subsequence of length 0.', line: 0 });
			for (let i = 1; i <= m; i++) {
				for (let j = 1; j <= n; j++) {
					const same = A[i - 1] === B[j - 1];
					if (same) {
						dp[i][j] = dp[i - 1][j - 1] + 1;
						rec.inc('Cells filled');
						add({ cur: [i, j], from: [[i - 1, j - 1]], msg: A[i - 1] + ' = ' + B[j - 1] + ' → diagonal + 1 = ' + dp[i][j], line: 3 });
					} else {
						dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
						rec.inc('Cells filled');
						add({ cur: [i, j], from: [[i - 1, j], [i, j - 1]], msg: A[i - 1] + ' ≠ ' + B[j - 1] + ' → max(up ' + dp[i - 1][j] + ', left ' + dp[i][j - 1] + ') = ' + dp[i][j], line: 5 });
					}
				}
			}
			rec.stats['LCS length'] = dp[m][n];
			add({ cur: [m, n], msg: 'Table complete — the LCS length is ' + dp[m][n] + '. Now trace back to read the letters.', line: 6 });
			const path = [[m, n]];
			let i = m;
			let j = n;
			let out = '';
			while (i > 0 && j > 0) {
				if (A[i - 1] === B[j - 1]) {
					out = A[i - 1] + out;
					i--;
					j--;
				} else if (dp[i - 1][j] >= dp[i][j - 1]) {
					i--;
				} else {
					j--;
				}
				path.push([i, j]);
				add({ path: path.slice(), msg: 'Tracing back… letters so far: "' + out + '"', line: 6 });
			}
			add({ path: path.slice(), msg: 'LCS = "' + out + '" (length ' + dp[m][n] + ').', line: 6 });
			return { frames: rec.frames, meta: {} };
		}
	});

	DSA.register({
		id: 'edit-distance', group: 'dp', name: 'Edit Distance', views: ['table'], controls: editControls,
		legend: [['', 'Cell'], ['cur', 'Computing'], ['range', 'Depends on'], ['path', 'Traceback']],
		blurb: 'The minimum number of insertions, deletions and substitutions to turn A into B (Levenshtein). Each cell is the cheapest of three neighbouring sub-problems plus one edit.',
		complexity: [['Time', 'O(m · n)'], ['Space', 'O(m · n)'], ['Pattern', '2-D table'], ['Used in', 'spell check']],
		code: [
			'dp[i][0] = i;  dp[0][j] = j',
			'for i in 1..m, j in 1..n:',
			'  cost = 0 if A[i] == B[j] else 1',
			'  dp[i][j] = min(',
			'    dp[i-1][j] + 1,        // delete',
			'    dp[i][j-1] + 1,        // insert',
			'    dp[i-1][j-1] + cost)   // substitute / match',
			'traceback from dp[m][n] to dp[0][0]'
		],
		build: function (p) {
			const A = cleanText(p.ea, 'KITTEN');
			const B = cleanText(p.eb, 'SITTING');
			const m = A.length;
			const n = B.length;
			const dp = [];
			for (let i = 0; i <= m; i++) {
				dp.push(new Array(n + 1).fill(null));
			}
			const rec = DSA.util.recorder({ 'Cells filled': 0, Distance: '–' });
			const add = function (o) {
				rec.add(tableFrame(A, B, dp, o));
			};
			add({ msg: 'Turn "' + A + '" into "' + B + '" with the fewest edits.', line: -1 });
			for (let i = 0; i <= m; i++) {
				dp[i][0] = i;
			}
			for (let j = 0; j <= n; j++) {
				dp[0][j] = j;
			}
			add({ msg: 'Base cases: turning a prefix into nothing (or nothing into a prefix) costs its length.', line: 0 });
			for (let i = 1; i <= m; i++) {
				for (let j = 1; j <= n; j++) {
					const cost = A[i - 1] === B[j - 1] ? 0 : 1;
					const del = dp[i - 1][j] + 1;
					const ins = dp[i][j - 1] + 1;
					const sub = dp[i - 1][j - 1] + cost;
					dp[i][j] = Math.min(del, ins, sub);
					rec.inc('Cells filled');
					add({
						cur: [i, j], from: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], line: 3,
						msg: (cost ? A[i - 1] + ' ≠ ' + B[j - 1] : A[i - 1] + ' = ' + B[j - 1]) + ' → min(delete ' + del + ', insert ' + ins + ', ' + (cost ? 'replace ' : 'match ') + sub + ') = ' + dp[i][j]
					});
				}
			}
			rec.stats.Distance = dp[m][n];
			add({ cur: [m, n], msg: 'Table complete — edit distance is ' + dp[m][n] + '.', line: 7 });
			const path = [[m, n]];
			let i = m;
			let j = n;
			while (i > 0 || j > 0) {
				if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)) {
					i--;
					j--;
				} else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
					i--;
				} else {
					j--;
				}
				path.push([i, j]);
				add({ path: path.slice(), msg: 'Tracing back the cheapest sequence of edits…', line: 7 });
			}
			add({ path: path.slice(), msg: 'Minimum edits to turn "' + A + '" into "' + B + '": ' + dp[m][n] + '.', line: 7 });
			return { frames: rec.frames, meta: {} };
		}
	});

	// ── N-Queens ────────────────────────────────────────────────────────────
	DSA.register({
		id: 'n-queens', group: 'backtracking', name: 'N-Queens', views: ['board'],
		controls: [{ id: 'queens', type: 'range', label: 'Board size', min: 4, max: 8, value: 6 }],
		legend: [['', 'Square'], ['cur', 'Trying'], ['swap', 'Conflict'], ['done', 'Solution']],
		blurb: 'Place one queen per row so none attack each other. Try a column; if it clashes, move on; if a row runs out of columns, backtrack and move the previous queen.',
		complexity: [['Time', 'O(n!) worst'], ['Space', 'O(n)'], ['Pattern', 'Backtracking'], ['Prunes', 'Early on conflict']],
		code: [
			'place(row):',
			'  if row == n: solution found',
			'  for col in 0..n-1:',
			'    if safe(row, col):',
			'      queens[row] = col',
			'      place(row + 1)',
			'      queens[row] = none    // backtrack'
		],
		build: function (p) {
			const n = p.queens;
			const queens = new Array(n).fill(-1);
			const rec = DSA.util.recorder({ Placements: 0, Backtracks: 0 });
			const add = function (o) {
				rec.add({ board: { n: n, queens: queens.slice(), cur: o.cur, conflict: o.conflict, bad: o.bad, solved: o.solved }, msg: o.msg, line: o.line });
			};
			const conflicts = function (r, c) {
				const hits = [];
				for (let i = 0; i < r; i++) {
					if (queens[i] === c || Math.abs(queens[i] - c) === r - i) {
						hits.push([i, queens[i]]);
					}
				}
				return hits;
			};
			let solved = false;
			const place = function (r) {
				if (r === n) {
					solved = true;
					return true;
				}
				for (let c = 0; c < n; c++) {
					const hits = conflicts(r, c);
					if (hits.length) {
						add({ cur: [r, c], conflict: true, bad: hits, msg: 'Row ' + (r + 1) + ', column ' + (c + 1) + ' is attacked — skip it.', line: 3 });
						continue;
					}
					queens[r] = c;
					rec.inc('Placements');
					add({ cur: [r, c], msg: 'Row ' + (r + 1) + ', column ' + (c + 1) + ' is safe — place a queen.', line: 4 });
					if (place(r + 1)) {
						return true;
					}
					queens[r] = -1;
					rec.inc('Backtracks');
					add({ msg: 'Dead end below — backtrack and lift the queen from row ' + (r + 1) + '.', line: 6 });
				}
				return false;
			};
			add({ msg: 'Empty ' + n + '×' + n + ' board. Place one queen per row.', line: 0 });
			place(0);
			add({ solved: solved, msg: solved ? 'Solved! ' + n + ' queens, none attacking.' : 'No solution exists for this board size.', line: 1 });
			return { frames: rec.frames, meta: {} };
		}
	});
})();
