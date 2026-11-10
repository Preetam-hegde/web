'use strict';

const AIViews = (() => {
	const M = AIMath;
	const colors = ['#f4a9bd', '#8fd3d6', '#bba9ea'];
	const ink = '#2a2745',
		gold = '#f2c879',
		mint = '#a9dcb4';
	const escape = (value) =>
		String(value).replace(
			/[&<>"']/g,
			(c) =>
				({
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;',
				})[c],
		);
	const number = (value) =>
		value === null
			? '—'
			: Number.isInteger(value)
				? String(value)
				: Math.abs(value) > 10000
					? value.toExponential(2)
					: value.toFixed(3);
	const text = (x, y, value, cls = '', anchor = 'start') =>
		`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${escape(value)}</text>`;
	const line = (x1, y1, x2, y2, color = ink, dash = '') =>
		`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
	const rect = (x, y, w, h, fill, stroke = ink) =>
		`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
	const circle = (x, y, r, fill, stroke = ink) =>
		`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
	const px = (x) => 65 + (x + 1) * 255;
	const py = (y) => 292 - (y + 1) * 110;
	const plotLine = (x1, y1, x2, y2, color, dash) =>
		line(px(x1), py(y1), px(x2), py(y2), color, dash);
	const plotDot = (x, y, color = colors[1], radius = 6) =>
		circle(px(x), py(y), radius, color);
	const axis = (xlabel = 'feature x', ylabel = 'target y') =>
		[-1, -0.5, 0, 0.5, 1]
			.map(
				(v) =>
					plotLine(v, -1, v, 1, '#e6d8bd') + plotLine(-1, v, 1, v, '#e6d8bd'),
			)
			.join('') +
		plotLine(-1, 0, 1, 0, '#afa18d') +
		plotLine(0, -1, 0, 1, '#afa18d') +
		text(574, 320, xlabel, 'chart-label', 'end') +
		text(65, 47, ylabel, 'chart-label');
	const scores = [0.96, 0.87, 0.74, 0.64, 0.57, 0.49, 0.38, 0.31, 0.19, 0.08];
	const labels = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0];
	const pcaData = [
		[-0.8, -0.5],
		[-0.6, -0.6],
		[-0.4, -0.15],
		[-0.2, -0.2],
		[0.2, 0.2],
		[0.4, 0.15],
		[0.6, 0.6],
		[0.8, 0.5],
	];
	const embeddings = {
		cat: [0.8, 0.6],
		dog: [0.6, 0.8],
		car: [-0.7, 0.7],
		truck: [-0.9, 0.3],
	};
	const tokens = ['the', 'cat', 'sat', 'down'];
	const image = [
		[0, 0, 1, 1, 1],
		[0, 0, 1, 1, 1],
		[0, 1, 1, 1, 1],
		[0, 0, 1, 1, 1],
		[0, 0, 1, 1, 1],
	];
	const kernels = {
		edge: [
			[-1, 0, 1],
			[-2, 0, 2],
			[-1, 0, 1],
		],
		smooth: Array.from({ length: 3 }, () => [1 / 9, 1 / 9, 1 / 9]),
	};
	const range = (key, label, min, max, step, value) => ({
		key,
		label,
		min,
		max,
		step,
		value,
		type: 'range',
	});
	function controls(lesson) {
		switch (lesson.lab) {
			case 'vectors':
				return [range('angle', 'Angle between vectors (°)', 0, 180, 5, 45)];
			case 'bayes':
				return [range('prior', 'Event prevalence (%)', 1, 80, 1, 1)];
			case 'regression':
				return [range('rate', 'Learning rate η', 0.02, 0.8, 0.02, 0.2)];
			case 'gradient':
				return [range('rate', 'Learning rate η', 0.05, 1.05, 0.05, 0.2)];
			case 'logistic':
				return [range('logit', 'Logit z', -6, 6, 0.2, 1)];
			case 'metrics':
				return [range('threshold', 'Decision threshold', 0, 1, 0.05, 0.5)];
			case 'knn':
				return [range('k', 'Number of neighbors k', 1, 9, 2, 3)];
			case 'tree':
				return [range('cutoff', 'Candidate split x ≤', -0.8, 0.8, 0.1, 0)];
			case 'clustering':
				return [range('k', 'Number of clusters k', 2, 3, 1, 3)];
			case 'pca':
				return [range('angle', 'Projection direction (°)', 0, 180, 5, 35)];
			case 'neuron':
				return [range('weight', 'First input weight w₁', -2, 2, 0.1, 0.6)];
			case 'backprop':
				return [range('rate', 'Learning rate η', 0.05, 0.4, 0.05, 0.05)];
			case 'convolution':
				return [
					{
						key: 'filter',
						label: '3×3 filter',
						type: 'select',
						value: 'edge',
						options: [
							['edge', 'Vertical edge detector'],
							['smooth', 'Mean / blur filter'],
						],
					},
				];
			case 'embeddings':
				return [
					{
						key: 'target',
						label: 'Compare with “cat”',
						type: 'select',
						value: 'dog',
						options: Object.keys(embeddings).map((key) => [key, key]),
					},
				];
			case 'attention':
				return [
					range(
						'query',
						'Query token (0=the, 1=cat, 2=sat, 3=down)',
						0,
						3,
						1,
						2,
					),
					{
						key: 'causal',
						label: 'Attention mask',
						type: 'select',
						value: '0',
						options: [
							['0', 'Bidirectional'],
							['1', 'Causal (past + self)'],
						],
					},
				];
			default:
				return [];
		}
	}
	function build(lesson, params) {
		if (lesson.lab === 'regression') return M.fitLine(params.rate);
		if (lesson.lab === 'gradient') return M.descend(params.rate);
		if (lesson.lab === 'clustering') return M.cluster(params.k);
		if (lesson.lab === 'convolution')
			return Array.from({ length: 9 }, (_, index) => ({
				row: Math.floor(index / 3),
				col: index % 3,
			}));
		return lesson.steps.map((note, i) => ({ note, phase: i }));
	}
	function wrapText(value, length) {
		const lines = [''];
		for (const word of value.split(' ')) {
			if ((lines.at(-1) + word).length > length) lines.push('');
			lines[lines.length - 1] += (lines.at(-1) ? ' ' : '') + word;
		}
		return lines;
	}
	function flow(lesson, phase) {
		const positions = [
			[25, 45],
			[350, 45],
			[350, 210],
			[25, 210],
		];
		let svg = text(30, 24, 'ONE IDEA · FOUR SMALL STEPS', 'chart-label');
		svg +=
			line(310, 110, 345, 110) +
			line(493, 175, 493, 205) +
			line(345, 275, 315, 275);
		lesson.steps.forEach((step, i) => {
			const [x, y] = positions[i];
			const separator = step.indexOf(':');
			const heading =
				separator >= 0 ? step.slice(0, separator) : `Step ${i + 1}`;
			const body = separator >= 0 ? step.slice(separator + 1).trim() : step;
			svg += rect(
				x,
				y,
				285,
				130,
				i === phase ? colors[0] : i < phase ? '#e1edda' : '#fffaf0',
			);
			svg += circle(x + 25, y + 27, 13, i === phase ? gold : '#fbf3e6');
			svg +=
				text(x + 25, y + 31, i + 1, '', 'middle') +
				text(x + 48, y + 32, heading, 'chart-title');
			wrapText(body, 34).forEach((s, j) => {
				svg += text(x + 16, y + 60 + j * 16, s, 'chart-label');
			});
		});
		return svg;
	}
	function render(lesson, p, index, frames) {
		const f = frames[index];
		const phase =
			typeof f.phase === 'number'
				? f.phase
				: lesson.lab === 'clustering'
					? index === 0
						? 0
						: index === frames.length - 1
							? 3
							: index % 2
								? 1
								: 2
					: Math.min(
							3,
							Math.floor((index / Math.max(1, frames.length - 1)) * 4),
						);
		let svg = '',
			stats = [],
			note = lesson.steps[phase];
		switch (lesson.lab) {
			case 'vectors': {
				const radians = (p.angle * Math.PI) / 180,
					b = [Math.cos(radians), Math.sin(radians)];
				svg =
					axis('coordinate 1', 'coordinate 2') +
					plotLine(0, 0, 0.8, 0, colors[0]) +
					plotLine(0, 0, b[0] * 0.8, b[1] * 0.8, '#5a8491') +
					plotDot(0.8, 0, colors[0], 8) +
					plotDot(b[0] * 0.8, b[1] * 0.8, colors[1], 8) +
					text(px(0.8), py(0) + 27, 'a = [1,0]', '', 'middle') +
					text(
						px(b[0] * 0.8),
						py(b[1] * 0.8) - 18,
						'b (unit length)',
						'',
						'middle',
					);
				stats = [
					['Angle', `${p.angle}°`],
					['Dot product', number(b[0])],
					['Cosine', number(M.cosine([1, 0], b))],
				];
				break;
			}
			case 'regression': {
				svg = axis();
				M.points.forEach(([x, y]) => {
					svg += plotLine(x, y, x, f.w * x + f.b, '#cf899d') + plotDot(x, y);
				});
				svg += plotLine(-1, -f.w + f.b, 1, f.w + f.b, ink);
				stats = [
					['Update', index],
					['MSE', number(f.loss)],
					['Slope w', number(f.w)],
					['Intercept b', number(f.b)],
				];
				note = `Update ${index}: ŷ = ${number(f.w)}x + ${number(f.b)}. Mean squared error = ${number(f.loss)}. Pink segments are residuals on seven synthetic points.`;
				break;
			}
			case 'gradient': {
				const left = Math.min(-3, f.w - 1),
					right = Math.max(9, f.w + 1),
					top = Math.max(40, f.loss * 1.15);
				const x = (v) => 65 + ((v - left) / (right - left)) * 510,
					y = (v) => 292 - (v / top) * 235;
				let path = '';
				for (let i = 0; i <= 150; i++) {
					const w = left + ((right - left) * i) / 150;
					path += `${i ? 'L' : 'M'}${x(w)},${y((w - 3) ** 2)} `;
				}
				svg =
					line(65, 292, 580, 292, '#afa18d') +
					line(65, 55, 65, 292, '#afa18d') +
					`<path d="${path}" fill="none" stroke="${ink}" stroke-width="2"/>` +
					circle(x(f.w), y(f.loss), 9, colors[0]) +
					circle(x(3), y(0), 5, mint) +
					text(x(3), 320, 'minimum w=3', 'chart-label', 'middle') +
					text(68, 40, `Loss (axis maximum ${number(top)})`, 'chart-label') +
					text(
						68,
						340,
						`Parameter range ${number(left)} … ${number(right)} · axes rescale`,
						'chart-label',
					);
				stats = [
					['Update', index],
					['w', number(f.w)],
					['Loss', number(f.loss)],
					['Gradient', number(f.gradient)],
				];
				note = `w = ${number(f.w)}; gradient = ${number(f.gradient)}. Next update subtracts η × gradient. ${p.rate >= 1 ? 'At this rate the quadratic does not converge.' : 'Compare the decreasing loss with the step size.'}`;
				break;
			}
			case 'logistic': {
				const x = (z) => 65 + ((z + 6) / 12) * 510,
					y = (v) => 290 - v * 220;
				let path = '';
				for (let z = -6; z <= 6.01; z += 0.1)
					path += `${path ? 'L' : 'M'}${x(z)},${y(M.sigmoid(z))} `;
				const probability = M.sigmoid(p.logit);
				svg =
					line(65, 290, 575, 290) +
					line(65, 70, 65, 290) +
					line(65, y(0.5), 575, y(0.5), '#b6a7cd', '5 5') +
					`<path d="${path}" fill="none" stroke="${ink}" stroke-width="3"/>` +
					line(x(p.logit), 290, x(p.logit), y(probability), '#cc839a', '4 4') +
					circle(x(p.logit), y(probability), 9, colors[0]) +
					text(590, 185, '0.5', 'chart-label') +
					text(68, 46, 'Positive probability p', 'chart-label') +
					text(70, 315, '−6', 'chart-label') +
					text(570, 315, '6 · logit z', 'chart-label', 'end');
				stats = [
					['Logit', number(p.logit)],
					['Probability', number(probability)],
					['At threshold 0.5', probability >= 0.5 ? 'Positive' : 'Negative'],
				];
				break;
			}
			case 'metrics': {
				const result = M.classify(scores, labels, p.threshold);
				svg =
					text(
						40,
						28,
						'TRUE CLASS 1 (pink) · TRUE CLASS 0 (blue)',
						'chart-label',
					) + line(65, 134, 590, 134, '#afa18d');
				scores.forEach((score, i) => {
					const x = 65 + score * 510,
						y = labels[i] ? 65 : 100;
					svg +=
						circle(x, y, 9, labels[i] ? colors[0] : colors[1]) +
						text(x, y + 24, score.toFixed(2), 'chart-label', 'middle');
				});
				svg +=
					line(65 + p.threshold * 510, 42, 65 + p.threshold * 510, 140) +
					text(
						65,
						155,
						'0 ← score → 1; predict positive to the RIGHT of cutoff',
						'chart-label',
					);
				[
					'TP · correct positive',
					'FP · false alarm',
					'FN · missed positive',
					'TN · correct negative',
				].forEach((label, i) => {
					const x = i % 2 ? 340 : 70,
						y = i < 2 ? 180 : 255;
					svg +=
						rect(x, y, 250, 62, [mint, '#f7c4b7', colors[0], colors[1]][i]) +
						text(x + 14, y + 23, label, 'chart-label') +
						text(x + 222, y + 43, result.counts[i], 'chart-title', 'end');
				});
				stats = [
					['Precision', number(result.precision)],
					['Recall', number(result.recall)],
					['F1', number(result.f1)],
					['Accuracy', number(result.accuracy)],
				];
				break;
			}
			case 'bayes': {
				const prior = p.prior / 100,
					tp = 10000 * prior * 0.9,
					fp = 10000 * (1 - prior) * 0.05;
				const posterior = M.bayes(prior, 0.9, 0.05);
				svg =
					text(
						35,
						35,
						'10,000 hypothetical cases · sensitivity 90% · false positives 5%',
						'chart-label',
					) +
					rect(35, 60, 590 * prior, 40, colors[0]) +
					rect(35 + 590 * prior, 60, 590 * (1 - prior), 40, colors[1]) +
					text(
						35,
						125,
						`Event: ${number(10000 * prior)} cases`,
						'chart-label',
					) +
					text(
						330,
						125,
						`No event: ${number(10000 * (1 - prior))}`,
						'chart-label',
					) +
					line(160, 143, 160, 178) +
					line(480, 143, 480, 178) +
					rect(35, 185, 285, 76, phase === 1 ? gold : '#f8e2e6') +
					rect(340, 185, 285, 76, phase === 2 ? gold : '#e1eef0') +
					text(55, 211, 'True positive alarms', 'chart-label') +
					text(55, 240, number(tp), 'chart-title') +
					text(360, 211, 'False positive alarms', 'chart-label') +
					text(360, 240, number(fp), 'chart-title') +
					text(
						330,
						309,
						`Among alarms: ${number(tp)} / ${number(tp + fp)} = ${(posterior * 100).toFixed(1)}% true`,
						'chart-title',
						'middle',
					);
				stats = [
					['Prior', `${p.prior}%`],
					['True alarms', number(tp)],
					['False alarms', number(fp)],
					['Posterior', `${(posterior * 100).toFixed(1)}%`],
				];
				break;
			}
			case 'knn': {
				const query = [0, -0.45];
				const ranked = M.cloud
					.map((point, i) => ({
						point,
						i,
						label: i < 4 ? 0 : 1,
						distance: Math.hypot(point[0] - query[0], point[1] - query[1]),
					}))
					.sort((a, b) => a.distance - b.distance);
				const nearest = ranked.slice(0, p.k),
					positive = nearest.filter((d) => d.label === 1).length;
				svg =
					text(
						65,
						25,
						'CLASS 0: PINK · CLASS 1: BLUE · QUERY: YELLOW',
						'chart-label',
					) + axis('feature 1', 'feature 2');
				ranked.forEach((d) => {
					if (phase === 1 || (phase >= 2 && nearest.includes(d)))
						svg += plotLine(...query, ...d.point, '#b7a08d', '3 4');
				});
				ranked.forEach((d) => {
					svg += plotDot(
						...d.point,
						colors[d.label],
						phase >= 2 && nearest.includes(d) ? 10 : 6,
					);
				});
				svg +=
					plotDot(...query, gold, 11) +
					text(px(query[0]), py(query[1]) + 28, 'query ?', '', 'middle');
				stats = [
					['Neighbors k', p.k],
					['Class 0 votes', p.k - positive],
					['Class 1 votes', positive],
					['Prediction', positive > p.k / 2 ? 'Class 1' : 'Class 0'],
				];
				break;
			}
			case 'tree': {
				const targets = M.cloud.map((_, i) => (i < 4 ? 0 : 1));
				const partitions = [[], []];
				M.cloud.forEach((point, i) =>
					partitions[point[0] <= p.cutoff ? 0 : 1].push(targets[i]),
				);
				const gini = (data) =>
					data.length
						? 1 -
							[0, 1].reduce(
								(sum, c) =>
									sum + (data.filter((v) => v === c).length / data.length) ** 2,
								0,
							)
						: 0;
				const impurity = partitions.reduce(
					(sum, data) => sum + (data.length / targets.length) * gini(data),
					0,
				);
				svg =
					text(
						65,
						25,
						'CLASS 0: PINK · CLASS 1: BLUE · CANDIDATE SPLIT',
						'chart-label',
					) +
					axis('feature x', 'feature y') +
					plotLine(p.cutoff, -1, p.cutoff, 1, '#b17591', '5 5');
				M.cloud.forEach((point, i) => {
					svg += plotDot(...point, colors[targets[i]]);
				});
				svg +=
					text(
						130,
						340,
						`Left: ${partitions[0].length} points`,
						'chart-label',
					) +
					text(
						400,
						340,
						`Right: ${partitions[1].length} points`,
						'chart-label',
					);
				stats = [
					['Cutoff', number(p.cutoff)],
					['Weighted Gini', number(impurity)],
					['Parent Gini', number(gini(targets))],
				];
				break;
			}
			case 'clustering': {
				svg = axis('feature 1', 'feature 2');
				M.cloud.forEach((point, i) => {
					svg += plotDot(...point, colors[f.assignments[i]] || '#d9c9ad');
				});
				f.centers.forEach((center, i) => {
					svg +=
						rect(px(center[0]) - 9, py(center[1]) - 9, 18, 18, colors[i]) +
						text(px(center[0]), py(center[1]) - 18, `μ${i + 1}`, '', 'middle');
				});
				stats = [
					['Clusters', p.k],
					['Iteration', Math.ceil(index / 2)],
					['Inertia', index ? number(f.inertia) : 'Not assigned'],
				];
				note = `${f.phase}. Squares are centroids; circles are observations. ${index ? `Squared-distance sum = ${number(f.inertia)}.` : 'Step forward to make the first assignments.'}`;
				break;
			}
			case 'pca': {
				const angle = (p.angle * Math.PI) / 180,
					direction = [Math.cos(angle), Math.sin(angle)],
					best = M.principalAngle(pcaData);
				const total = pcaData.reduce((s, point) => s + M.dot(point, point), 0),
					projected = pcaData.reduce(
						(s, point) => s + M.dot(point, direction) ** 2,
						0,
					);
				svg =
					axis('centered feature 1', 'centered feature 2') +
					plotLine(
						-Math.cos(best),
						-Math.sin(best),
						Math.cos(best),
						Math.sin(best),
						'#b17591',
						'4 5',
					) +
					plotLine(
						-direction[0],
						-direction[1],
						direction[0],
						direction[1],
						ink,
					);
				pcaData.forEach((point) => {
					const scale = M.dot(point, direction),
						projection = direction.map((v) => v * scale);
					svg +=
						plotLine(...point, ...projection, '#c7b6a0') +
						plotDot(...point) +
						plotDot(...projection, gold, 4);
				});
				svg += text(
					70,
					338,
					'Solid: your direction · dashed pink: computed PC1',
					'chart-label',
				);
				stats = [
					['Direction', `${p.angle}°`],
					['PC1 angle', `${((best * 180) / Math.PI).toFixed(1)}°`],
					['Variance captured', `${((projected / total) * 100).toFixed(1)}%`],
				];
				break;
			}
			case 'neuron': {
				const z = p.weight - 0.4 * 0.5 + 0.1,
					activation = Math.max(0, z);
				svg =
					text(
						35,
						34,
						'A SINGLE ReLU NEURON · change w₁ and watch the gate',
						'chart-label',
					) +
					line(120, 110, 330, 180, '#a585a1') +
					line(120, 250, 330, 180, '#a585a1') +
					line(360, 180, 520, 180) +
					circle(110, 110, 37, colors[1]) +
					circle(110, 250, 37, colors[1]) +
					circle(340, 180, 45, phase >= 1 ? gold : '#fffaf0') +
					circle(540, 180, 49, phase >= 2 ? colors[0] : '#fffaf0') +
					text(110, 114, 'x₁=1', '', 'middle') +
					text(110, 254, 'x₂=0.5', '', 'middle') +
					text(228, 115, `w₁=${number(p.weight)}`, '', 'middle') +
					text(220, 253, 'w₂=−0.4', '', 'middle') +
					text(340, 184, number(z), '', 'middle') +
					text(540, 185, number(activation), '', 'middle') +
					text(340, 255, 'Σwx + b', '', 'middle') +
					text(540, 255, 'max(0,z)', '', 'middle') +
					text(
						330,
						310,
						'bias b = 0.1 · training would learn these weights',
						'chart-label',
						'middle',
					);
				stats = [
					['Weighted sum z', number(z)],
					['ReLU output', number(activation)],
					['Gate', z > 0 ? 'Active' : 'Closed'],
				];
				break;
			}
			case 'backprop': {
				const gradientW = -4,
					gradientB = -2;
				const w = phase === 3 ? 1 - p.rate * gradientW : 1;
				const b = phase === 3 ? -p.rate * gradientB : 0;
				const prediction = 2 * w + b,
					residual = prediction - 3,
					loss = residual ** 2;
				const xs = [80, 235, 395, 555],
					titles = ['weight w', 'z = 2w+b', 'residual z−3', 'loss (z−3)²'],
					values = [w, prediction, residual, loss];
				svg = text(
					35,
					35,
					`SCALAR SQUARED ERROR · x=2 · y=3 · bias b=${number(b)}`,
					'chart-label',
				);
				xs.slice(0, -1).forEach((x, i) => {
					svg += line(x + 42, 155, xs[i + 1] - 42, 155);
				});
				xs.forEach((x, i) => {
					svg +=
						circle(x, 155, 43, i === phase ? colors[0] : '#fffaf0') +
						text(x, 160, number(values[i]), '', 'middle') +
						text(x, 92, titles[i], 'chart-label', 'middle');
				});
				if (phase >= 2)
					svg +=
						line(550, 235, 85, 235, '#be7391') +
						text(
							330,
							264,
							'Before update: dL/dw = −4; dL/db = −2',
							'',
							'middle',
						);
				svg += text(
					330,
					318,
					phase === 3
						? 'One update applied. Rewind to compare the loss.'
						: 'Forward → predict; backward ← attribute the error',
					'chart-label',
					'middle',
				);
				stats = [
					['w', number(w)],
					['b', number(b)],
					['Squared loss', number(loss)],
					['dL/dw before step', number(gradientW)],
				];
				break;
			}
			case 'convolution': {
				const kernel = kernels[p.filter],
					output = M.convolve(image, kernel),
					value = output[f.row][f.col];
				svg = text(
					35,
					35,
					'CROSS-CORRELATION · stride 1 · no padding',
					'chart-label',
				);
				const matrix = (data, x, y, size, kind) =>
					data
						.map((row, r) =>
							row
								.map((v, c) => {
									const selected =
										kind === 'input'
											? r >= f.row &&
												r < f.row + 3 &&
												c >= f.col &&
												c < f.col + 3
											: kind === 'output'
												? r === f.row && c === f.col
												: true;
									return (
										rect(
											x + c * size,
											y + r * size,
											size - 3,
											size - 3,
											selected
												? kind === 'output'
													? gold
													: colors[1]
												: '#fffaf0',
										) +
										text(
											x + c * size + (size - 3) / 2,
											y + r * size + size * 0.6,
											kind === 'kernel' && p.filter === 'smooth'
												? '1/9'
												: number(v),
											'chart-label',
											'middle',
										)
									);
								})
								.join(''),
						)
						.join('');
				svg +=
					text(110, 78, '5×5 image', '', 'middle') +
					matrix(image, 30, 95, 36, 'input') +
					text(230, 190, '×', 'chart-title') +
					text(320, 78, '3×3 filter', '', 'middle') +
					matrix(kernel, 265, 120, 38, 'kernel') +
					text(414, 190, '→', 'chart-title') +
					text(530, 78, '3×3 output', '', 'middle') +
					matrix(output, 465, 120, 43, 'output') +
					text(
						330,
						320,
						`Output [${f.row},${f.col}] = sum(patch × filter) = ${number(value)}`,
						'',
						'middle',
					);
				stats = [
					['Patch row', f.row],
					['Patch column', f.col],
					['Output value', number(value)],
				];
				note = `Slide ${index + 1} of 9: multiply the highlighted 3×3 patch by the filter element by element, then sum. The highlighted output is ${number(value)}. The filter is hand-set, not learned.`;
				break;
			}
			case 'embeddings': {
				const target = embeddings[p.target],
					query = embeddings.cat;
				svg =
					axis('synthetic dimension 1', 'synthetic dimension 2') +
					plotLine(0, 0, ...query, '#b17591') +
					plotLine(0, 0, ...target, '#5a8491');
				Object.entries(embeddings).forEach(([word, point]) => {
					svg +=
						plotDot(
							...point,
							word === p.target ? gold : colors[1],
							word === p.target ? 10 : 6,
						) + text(px(point[0]), py(point[1]) - 16, word, '', 'middle');
				});
				svg += text(
					330,
					338,
					'Hand-set vectors illustrate geometry, not learned semantics.',
					'chart-label',
					'middle',
				);
				stats = [
					['Query', 'cat'],
					['Candidate', p.target],
					['Cosine', number(M.cosine(query, target))],
				];
				break;
			}
			case 'attention': {
				const result = M.attention(p.query, p.causal === '1'),
					row = result.weights[p.query];
				svg =
					text(
						30,
						30,
						'HAND-SET Q, K, V · one head · dₖ=2 · not a trained model',
						'chart-label',
					) +
					text(
						185,
						61,
						phase === 1
							? 'Scaled scores QKᵀ / √2'
							: 'Attention weights after softmax',
						'chart-title',
					);
				tokens.forEach((token, i) => {
					svg +=
						text(215 + i * 65, 90, token, '', 'middle') +
						text(160, 127 + i * 52, token, '', 'end');
				});
				result.weights.forEach((weights, r) =>
					weights.forEach((weight, c) => {
						const value = phase === 1 ? result.scores[r][c] : weight;
						svg +=
							rect(
								183 + c * 65,
								102 + r * 52,
								60,
								46,
								r === p.query ? colors[0] : '#fffaf0',
								r === p.query ? ink : '#d9c9ad',
							) +
							text(
								213 + c * 65,
								131 + r * 52,
								value === -Infinity ? 'mask' : value.toFixed(2),
								'',
								'middle',
							);
					}),
				);
				svg += text(
					330,
					336,
					`Query “${tokens[p.query]}” → weighted value [${result.output.map(number).join(', ')}]`,
					'',
					'middle',
				);
				stats = [
					['Selected query', tokens[p.query]],
					['Weight sum', number(row.reduce((a, b) => a + b, 0))],
					['Mask', p.causal === '1' ? 'Causal' : 'None'],
				];
				break;
			}
			default:
				svg = flow(lesson, phase);
				stats = [
					['Step', `${index + 1} of 4`],
					['Type', 'Concept walkthrough'],
				];
		}
		return {
			svg: `<svg viewBox="0 0 660 360" role="img" aria-label="${escape(lesson.title + ', step ' + (index + 1))}" xmlns="http://www.w3.org/2000/svg"><title>${escape(lesson.title)}</title>${svg}</svg>`,
			stats,
			note,
			phase,
		};
	}
	return { controls, build, render, escape };
})();
