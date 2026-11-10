import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({});
for (const file of [
	'core',
	'sorting',
	'searching',
	'structures',
	'trees',
	'graphs',
	'grid',
	'dp',
	'guide',
]) {
	vm.runInContext(
		readFileSync(new URL('./js/' + file + '.js', import.meta.url), 'utf8'),
		context,
	);
}
const DSA = vm.runInContext('DSA', context);
const lessonIds = new Set(DSA.lessons.map((lesson) => lesson.id));
const algoIds = new Set(DSA.algos.map((algo) => algo.id));
assert.equal(lessonIds.size, 19);
assert.equal(DSA.questions.length, 75);
assert.equal(new Set(DSA.questions.map((question) => question.slug)).size, 75);
assert.equal(algoIds.size, 24);
const linkedLabs = new Set();
for (const lesson of DSA.lessons) {
	assert(
		DSA.questions.some((question) => question.topic === lesson.id),
		lesson.id + ' has no practice',
	);
	for (const key of ['lead', 'model', 'invariant', 'cost', 'code'])
		assert(lesson[key], lesson.id + ': missing ' + key);
	assert(lesson.example.rows.length >= 3);
	assert(lesson.recall.length === 2);
	for (const id of lesson.labs) {
		assert(algoIds.has(id), 'Unknown lab: ' + id);
		linkedLabs.add(id);
	}
	if (lesson.id !== 'heaps') vm.runInContext(lesson.code, context);
}
assert.equal(
	linkedLabs.size,
	algoIds.size,
	'Every existing lab should be connected to a lesson',
);
for (const question of DSA.questions) {
	assert(lessonIds.has(question.topic), question.title + ': invalid topic');
	assert(['Easy', 'Medium', 'Hard'].includes(question.level));
	for (const key of ['prompt', 'example', 'hint', 'answer', 'cost', 'trap'])
		assert(question[key], question.title + ': missing ' + key);
	assert(/^[a-z0-9-]+$/.test(question.slug));
}
function evaluate(expression) {
	return vm.runInContext(expression, context);
}
function expectJSON(expression, expected) {
	assert.deepEqual(JSON.parse(JSON.stringify(evaluate(expression))), expected);
}
assert.equal(evaluate('containsDuplicate([])'), false);
assert.equal(evaluate('containsDuplicate([0, 0])'), true);
expectJSON('moveZeroes([0, 1, 0, 3, 12])', [1, 3, 12, 0, 0]);
expectJSON('twoSum([3, 3], 6)', [0, 1]);
expectJSON('twoSum([3], 6)', []);
expectJSON('pairInSorted([1, 2, 4, 7, 11], 9)', [1, 3]);
assert.equal(evaluate('longestUnique("abba")'), 2);
assert.equal(evaluate('longestUnique("")'), 0);
assert.equal(evaluate('countSubarrays([1, -1, 1], 1)'), 3);
assert.equal(evaluate('countSubarrays([0, 0], 0)'), 3);
assert.equal(evaluate('lowerBound([1, 2, 2, 4], 2)'), 1);
assert.equal(evaluate('lowerBound([], 2)'), 0);
assert.equal(evaluate('lowerBound([1, 2], 3)'), 2);
expectJSON('reverseList({value:1,next:{value:2,next:null}})', {
	value: 2,
	next: { value: 1, next: null },
});
expectJSON('dailyTemperatures([73, 71, 75])', [2, 1, 0]);
assert.equal(evaluate('subsets([1, 2]).length'), 4);
assert.equal(
	evaluate(
		'isValidBST({value:10,left:null,right:{value:15,left:{value:6,left:null,right:null},right:null}})',
	),
	false,
);
assert.equal(
	evaluate(
		'bfsDistances(new Map([["A",["B","C"]],["B",["D"]],["C",["D"]]]), "A").get("D")',
	),
	2,
);
expectJSON('topologicalOrder([[2],[2],[3],[]])', [0, 1, 2, 3]);
assert.equal(evaluate('topologicalOrder([[1],[0]])'), null);
assert.equal(evaluate('maxCompatible([[1,4],[2,3],[3,5],[5,6]])'), 3);
assert.equal(evaluate('minCoins([1,3,4], 6)'), 2);
assert.equal(evaluate('minCoins([2], 3)'), -1);
assert.equal(evaluate('minCoins([2], 0)'), 0);
assert.equal(evaluate('gcd(-54, 24)'), 6);
expectJSON('rotateClockwise([[1,2],[3,4]])', [
	[3, 1],
	[4, 2],
]);
assert.equal(
	evaluate(
		'(() => { const root = makeTrieNode(); insertWord(root, "cart"); return hasWord(root, "car"); })()',
	),
	false,
);

for (const algo of DSA.algos) {
	const params = Object.fromEntries(
		(algo.controls || [])
			.filter((control) => control.id)
			.map((control) => [control.id, control.value]),
	);
	const frames = algo.sandbox
		? [algo.snapshot(algo.init())]
		: algo.build(params, DSA.util.rng(7)).frames;
	assert(frames.length > 0, algo.id + ' produced no frames');
}
// Compare Prim against independent Kruskal totals, including cases where edge index zero wins.
for (let seed = 1; seed <= 40; seed++) {
	const output = DSA.algos
		.find((algo) => algo.id === 'prim')
		.build({ nodes: 9, start: '0' }, DSA.util.rng(seed));
	const frame = output.frames[output.frames.length - 1];
	const parent = Array.from({ length: 9 }, (_, index) => index);
	function find(node) {
		while (parent[node] !== node) node = parent[node];
		return node;
	}
	let total = 0;
	for (const edge of [...frame.net.edges].sort((a, b) => a.w - b.w)) {
		const a = find(edge.a),
			b = find(edge.b);
		if (a !== b) {
			parent[a] = b;
			total += edge.w;
		}
	}
	assert.equal(
		frame.stats['Total weight'],
		total,
		'Prim mismatch for seed ' + seed,
	);
	assert.equal(frame.net.edges.filter((edge) => edge.cls === 'tree').length, 8);
}
console.log(
	'Passed: 19 lesson records and runnable code examples, 75 question records, 24 lab builds, edge cases and 40 Prim/Kruskal comparisons.',
);
