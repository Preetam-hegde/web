'use strict';

Teach.add({
	clustering: {
		kid: {
			emoji: '🧲',
			story: 'Dump a bag of mixed buttons on the floor. Without labels you still make little piles of buttons that look alike. K-means does this: put k magnets down, every button goes to its nearest magnet, then each magnet moves to the middle of its pile. Repeat until the magnets stop moving.',
			say: [
				'Drop k centres anywhere.',
				'Each point joins its nearest centre.',
				'Move every centre to the middle of its group. Repeat.',
			],
		},
		real: {
			title: 'One round of k-means on points 1, 2, 9, 10 (k = 2)',
			scenario:
				'Start centres at 1 and 2. Points 1 → centre 1; 2, 9, 10 → centre 2. New centres: 1 and (2+9+10)/3 = 7. Next round: 1, 2 → centre 1; 9, 10 → centre 7. New centres 1.5 and 9.5. Nothing changes after that.',
			result: 'Two clear groups found from a poor start, but a different start can give a worse answer.',
		},
		diagram: {
			type: 'flow',
			title: 'The k-means loop',
			nodes: [
				['place k centres', 'random or smart start'],
				['assign', 'nearest centre'],
				['update', 'centre = mean of group'],
				['stop', 'when assignments stop changing'],
			],
			loop: 'assign and update until stable',
		},
		principle: {
			name: 'Alternate between two easy steps',
			rule: 'Fixing the centres makes assignment easy; fixing the assignments makes the centres easy. Alternate.',
			why: 'Each step can only make the total distance smaller or equal, so it must settle.',
		},
		design: {
			problem: 'No labels, but you want structure.',
			choice: 'Minimise the sum of squared distances to the group centres.',
			price: 'You must choose k, it prefers round equal-sized groups, and the result depends on the start.',
		},
		edges: [
			['Empty cluster', 'A centre captures no points.', 'Re-seed it at a far point.'],
			['k = 1 or k = n', 'Meaningless groups.', 'Compare several k (elbow, silhouette).'],
			['Unscaled features', 'One feature decides everything.', 'Standardise ({{data}}).'],
			['Odd shapes / outliers', 'Rings or long streaks are cut badly.', 'Try other methods (DBSCAN).'],
			['Bad start', 'Local optimum.', 'Run several starts or k-means++.'],
		],
		links: [
			['knn', 'Both rely on distance.'],
			['pca', 'Reduce dimensions before clustering.'],
			['vectors', 'Distance in many dimensions.'],
		],
		lab: {
			read: [
				'Coloured dots are groups; the big marker is each centre.',
				'Each step alternates between assigning dots and moving centres.',
			],
			predict: 'After the next update, which direction does a centre move?',
		},
	},
	pca: {
		kid: {
			emoji: '🔦',
			story: 'Hold a toy over a wall and shine a torch: the shadow is a flat picture of a solid toy. Turn it so the shadow is as stretched out as possible, and you keep the most detail. PCA finds the best angle to flatten the data while keeping as much of the spread as it can.',
			say: [
				'Find the direction where the data is most spread out.',
				'Squash everything onto that direction.',
				'You keep less numbers but most of the story.',
			],
		},
		real: {
			title: 'Points along a diagonal',
			scenario:
				'Points (1,1), (2,2), (3,3). The spread is entirely along the diagonal, so one number per point (its distance along that diagonal) keeps everything.',
			result:
				'Two columns became one without loss. Real data keeps, say, 95% of the variance with a fraction of the columns.',
		},
		diagram: {
			type: 'flow',
			title: 'PCA in four moves',
			nodes: [
				['centre the data', 'subtract the mean'],
				['find directions', 'eigenvectors of covariance'],
				['rank by spread', 'variance each direction keeps'],
				['project', 'keep the top few'],
			],
		},
		principle: {
			name: 'Keep the variance, drop the redundancy',
			rule: 'Directions with a lot of spread carry information; directions with little spread are mostly noise or repeats.',
			why: 'This is compression you can reason about: you can say exactly how much variance you kept.',
		},
		design: {
			problem: 'Too many correlated features slow models and hide structure.',
			choice: 'Rotate the axes to line up with the data\'s spread and keep only the leading ones.',
			price: 'New axes are mixtures of the old features, so harder to interpret; only linear structure is captured, and it needs scaling.',
		},
		edges: [
			['Unscaled features', 'The big-scale feature wins.', 'Standardise first ({{data}}).'],
			['Fitting on all data', 'Leaks test info.', 'Fit on training data only.'],
			['Low variance but important', 'A small-spread feature may carry the label.', 'Check the downstream metric.'],
			['Constant column', 'Zero variance.', 'Drop it.'],
		],
		links: [
			['vectors', 'Projection is a dot product.'],
			['clustering', 'Often used before it.'],
			['embeddings', 'Another way to get compact vectors.'],
		],
		lab: {
			read: [
				'The line is the projection direction; the dots drop onto it.',
				'The number reports how much spread survives.',
			],
			predict: 'Which angle keeps the most spread? Find it by sliding.',
		},
	},
});
