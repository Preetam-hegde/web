'use strict';

const assert = require('node:assert/strict');
const M = require('./js/math.js');
const near = (actual, expected, tolerance = 1e-8) =>
	assert.ok(
		Math.abs(actual - expected) < tolerance,
		`${actual} != ${expected}`,
	);

near(M.sigmoid(0), 0.5);
assert.equal(M.sigmoid(-1000), 0);
assert.equal(M.sigmoid(1000), 1);
const probabilities = M.softmax([1000, 1001, 1002]);
near(
	probabilities.reduce((a, b) => a + b, 0),
	1,
);
assert.ok(probabilities.every(Number.isFinite));
near(M.cosine([1, 0], [0, 1]), 0);
assert.equal(M.cosine([0, 0], [1, 1]), null);

const regression = M.fitLine(0.2);
assert.ok(regression.at(-1).loss < regression[0].loss / 20);
const descent = M.descend(0.2);
assert.ok(descent.at(-1).loss < descent[0].loss);
assert.ok(M.descend(1.05).at(-1).loss > M.descend(1.05)[0].loss);

const metrics = M.classify([0.9, 0.6, 0.4, 0.1], [1, 0, 1, 0], 0.5);
assert.deepEqual(metrics.counts, [1, 1, 1, 1]);
near(metrics.precision, 0.5);
near(metrics.recall, 0.5);
assert.equal(M.classify([0.1], [1], 1).precision, null);
assert.equal(M.classify([0.9], [0], 0.5).recall, null);
near(M.bayes(0.01, 0.9, 0.05), 0.009 / 0.0585);

const clustering = M.cluster(3);
assert.ok(clustering.at(-1).inertia <= clustering[1].inertia);
assert.ok(clustering.every((f) => f.centers.flat().every(Number.isFinite)));
const emptyCluster = M.updateCenters(
	[[0, 0]],
	[0],
	[
		[0, 0],
		[9, 9],
	],
);
assert.deepEqual(emptyCluster[1], [9, 9]);
near(
	M.principalAngle([
		[1, 1],
		[2, 2],
		[3, 3],
	]),
	Math.PI / 4,
);
const conv = M.convolve(
	[
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
	],
	[
		[1, 0],
		[0, -1],
	],
);
assert.deepEqual(conv, [
	[-4, -4],
	[-4, -4],
]);
for (const causal of [true, false]) {
	const attention = M.attention(0, causal);
	attention.weights.forEach((row, i) => {
		near(
			row.reduce((a, b) => a + b, 0),
			1,
		);
		if (causal) row.slice(i + 1).forEach((value) => assert.equal(value, 0));
	});
}

const C = require('./js/course.js');
const fs = require('node:fs');
const vm = require('node:vm');
const viewContext = vm.createContext({ AIMath: M });
vm.runInContext(
	fs.readFileSync(`${__dirname}/js/views.js`, 'utf8') +
		'\nthis.views = AIViews;',
	viewContext,
);
const V = viewContext.views;
for (const lesson of C.lessons) {
	const params = Object.fromEntries(
		V.controls(lesson).map((c) => [c.key, c.value]),
	);
	const frames = V.build(lesson, params);
	frames.forEach((_, index) => {
		const result = V.render(lesson, params, index, frames);
		assert.ok(
			Number.isInteger(result.phase) && result.phase >= 0 && result.phase <= 3,
			`${lesson.id}: teaching phase must be numeric`,
		);
		assert.ok(result.note);
		assert.doesNotMatch(result.svg, /NaN|undefined/);
	});
}
const backprop = C.lessons.find((l) => l.id === 'backprop');
const backpropParams = { rate: 0.05 };
const backpropFrames = V.build(backprop, backpropParams);
const beforeUpdate = V.render(backprop, backpropParams, 0, backpropFrames);
assert.match(beforeUpdate.svg, /x=2 · y=3/);
near(
	Number(beforeUpdate.stats.find(([label]) => label === 'Squared loss')[1]),
	1,
);
const afterUpdate = V.render(backprop, backpropParams, 3, backpropFrames);
near(
	Number(afterUpdate.stats.find(([label]) => label === 'Squared loss')[1]),
	0.25,
);
assert.equal(C.lessons.length, 35);
assert.equal(new Set(C.lessons.map((l) => l.id)).size, C.lessons.length);
assert.equal(C.lessons.flatMap((l) => l.interview).length, 140);
for (const lesson of C.lessons) {
	assert.ok(C.groups.some((g) => g.id === lesson.group));
	for (const key of [
		'title',
		'story',
		'detail',
		'formula',
		'symbols',
		'code',
		'pitfall',
		'challenge',
	])
		assert.ok(lesson[key], `${lesson.id}: ${key}`);
	assert.equal(lesson.steps.length, 4);
	assert.equal(lesson.interview.length, 4);
	assert.ok(lesson.sources.length > 0);
	lesson.sources.forEach((id) =>
		assert.ok(C.sources[id]?.url.startsWith('https://'), `${lesson.id}: ${id}`),
	);
	assert.equal(lesson.check.options.length, 3);
	assert.ok(lesson.check.answer >= 0 && lesson.check.answer < 3);
	assert.ok(lesson.check.explanation);
	lesson.interview.forEach((q) => assert.ok(q.q && q.a && q.followup));
}
console.log(
	'Passed: numerical invariants, edge cases, 35 lessons, 140 interview answers, and source mappings.',
);
