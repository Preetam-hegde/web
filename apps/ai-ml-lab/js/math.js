'use strict';

const AIMath = (() => {
	const points = [
		[-0.9, -0.6],
		[-0.6, -0.3],
		[-0.3, -0.35],
		[0, 0.1],
		[0.3, 0.45],
		[0.6, 0.5],
		[0.9, 0.85],
	];
	const cloud = [
		[-0.8, -0.6],
		[-0.7, -0.8],
		[-0.5, -0.5],
		[-0.6, -0.3],
		[0.6, -0.6],
		[0.8, -0.4],
		[0.5, -0.3],
		[0.7, -0.8],
		[0, 0.6],
		[0.2, 0.8],
		[-0.2, 0.7],
		[0.1, 0.4],
	];
	const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
	const sigmoid = (z) =>
		z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
	function softmax(values) {
		const max = Math.max(...values);
		const exp = values.map((v) => Math.exp(v - max));
		const total = exp.reduce((a, b) => a + b, 0);
		return exp.map((v) => v / total);
	}
	function cosine(a, b) {
		const denominator = Math.sqrt(dot(a, a) * dot(b, b));
		return denominator === 0 ? null : dot(a, b) / denominator;
	}
	function fitLine(rate) {
		let w = -0.7,
			b = 0.6;
		const frames = [];
		for (let i = 0; i <= 40; i++) {
			const errors = points.map(([x, y]) => w * x + b - y);
			const loss = dot(errors, errors) / points.length;
			frames.push({ w, b, loss });
			const dw =
				(2 * errors.reduce((sum, e, j) => sum + e * points[j][0], 0)) /
				points.length;
			const db = (2 * errors.reduce((sum, e) => sum + e, 0)) / points.length;
			w -= rate * dw;
			b -= rate * db;
		}
		return frames;
	}
	function descend(rate) {
		let w = -2;
		const frames = [];
		for (let i = 0; i <= 24; i++) {
			frames.push({ w, loss: (w - 3) ** 2, gradient: 2 * (w - 3) });
			w -= rate * 2 * (w - 3);
		}
		return frames;
	}
	function classify(scores, labels, threshold) {
		// Counts are TP, FP, FN, TN; undefined ratios stay undefined in the UI.
		const counts = [0, 0, 0, 0];
		scores.forEach(
			(score, i) =>
				counts[score >= threshold ? (labels[i] ? 0 : 1) : labels[i] ? 2 : 3]++,
		);
		const [tp, fp, fn, tn] = counts;
		return {
			counts,
			precision: tp + fp ? tp / (tp + fp) : null,
			recall: tp + fn ? tp / (tp + fn) : null,
			f1: 2 * tp + fp + fn ? (2 * tp) / (2 * tp + fp + fn) : null,
			accuracy: scores.length ? (tp + tn) / scores.length : null,
		};
	}
	function bayes(prior, sensitivity, falsePositive) {
		const evidence = prior * sensitivity + (1 - prior) * falsePositive;
		return evidence ? (prior * sensitivity) / evidence : null;
	}
	function updateCenters(data, assignments, centers) {
		return centers.map((center, i) => {
			const members = data.filter((_, j) => assignments[j] === i);
			return members.length
				? center.map(
						(_, d) =>
							members.reduce((sum, p) => sum + p[d], 0) / members.length,
					)
				: center.slice();
		});
	}
	function cluster(k) {
		let centers = [
			[-0.8, -0.8],
			[0.8, -0.8],
			[0.7, 0.8],
		].slice(0, k);
		const frames = [
			{
				centers,
				assignments: cloud.map(() => -1),
				inertia: 0,
				phase: 'Choose initial centroids',
			},
		];
		for (let i = 0; i < 6; i++) {
			const assignments = cloud.map((p) =>
				centers
					.map((c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2)
					.reduce((best, d, j, arr) => (d < arr[best] ? j : best), 0),
			);
			const inertia = () =>
				cloud.reduce(
					(sum, p, j) =>
						sum +
						p.reduce((s, v, d) => s + (v - centers[assignments[j]][d]) ** 2, 0),
					0,
				);
			frames.push({
				centers,
				assignments,
				inertia: inertia(),
				phase: 'Assign points to the nearest centroid',
			});
			centers = updateCenters(cloud, assignments, centers);
			frames.push({
				centers,
				assignments,
				inertia: inertia(),
				phase: 'Move each centroid to the mean of its points',
			});
		}
		return frames;
	}
	function principalAngle(data) {
		const mean = [0, 1].map(
			(d) => data.reduce((s, p) => s + p[d], 0) / data.length,
		);
		const centered = data.map((p) => p.map((v, d) => v - mean[d]));
		const xx = centered.reduce((s, p) => s + p[0] ** 2, 0);
		const yy = centered.reduce((s, p) => s + p[1] ** 2, 0);
		const xy = centered.reduce((s, p) => s + p[0] * p[1], 0);
		return 0.5 * Math.atan2(2 * xy, xx - yy);
	}
	function convolve(image, kernel) {
		// Deep-learning "convolution" uses cross-correlation: no kernel flip.
		return Array.from({ length: image.length - kernel.length + 1 }, (_, r) =>
			Array.from({ length: image[0].length - kernel[0].length + 1 }, (_, c) =>
				kernel.reduce(
					(sum, row, y) =>
						sum + row.reduce((s, v, x) => s + v * image[r + y][c + x], 0),
					0,
				),
			),
		);
	}
	function attention(query, causal) {
		const queries = [
			[1, 0],
			[0, 1],
			[1, 1],
			[-1, 1],
		];
		const keys = [
			[0.2, 1],
			[1, 0],
			[1, 1],
			[0, -1],
		];
		const values = [
			[1, 0],
			[0, 2],
			[1, 1],
			[-1, 0],
		];
		const scores = queries.map((q, i) =>
			keys.map((k, j) =>
				causal && j > i ? -Infinity : dot(q, k) / Math.sqrt(2),
			),
		);
		const weights = scores.map(softmax);
		return {
			scores,
			weights,
			output: [0, 1].map((d) =>
				weights[query].reduce((s, v, i) => s + v * values[i][d], 0),
			),
			queries,
			keys,
			values,
		};
	}
	return {
		points,
		cloud,
		dot,
		sigmoid,
		softmax,
		cosine,
		fitLine,
		descend,
		classify,
		bayes,
		updateCenters,
		cluster,
		principalAngle,
		convolve,
		attention,
	};
})();

if (typeof module !== 'undefined') module.exports = AIMath;
