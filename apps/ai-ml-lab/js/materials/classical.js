'use strict';

Teach.add({
	knn: {
		kid: {
			emoji: '🏘️',
			story: 'New kid at school: which group will they join? Look at the 3 kids who live closest to them. If 2 of the 3 play football, guess football. K-nearest neighbours is "ask your closest neighbours and go with the majority".',
			say: [
				'Measure how far the new point is from every known point.',
				'Pick the k closest.',
				'Let them vote.',
			],
		},
		real: {
			title: 'Is this fruit an apple or an orange?',
			scenario:
				'Features: [weight, sweetness]. The new fruit\'s 3 nearest known fruits are apple, apple, orange. Vote = apple 2, orange 1 → apple. With k = 1 it would copy only the very closest.',
			result:
				'There is no training; all the work is at prediction time, when it must measure against every stored point.',
		},
		diagram: {
			type: 'flow',
			title: 'Predict with k = 3',
			nodes: [
				['new point', 'to classify'],
				['distances', 'to every stored point'],
				['k nearest', 'sort and take 3'],
				['vote', 'majority wins'],
			],
		},
		principle: {
			name: 'Similar inputs should have similar outputs',
			rule: 'If the idea of "close" is meaningful, then close examples give a good guess.',
			why: 'That assumption is only as good as your features and scaling; the algorithm itself is almost nothing.',
		},
		design: {
			problem: 'You want a prediction with no assumptions about the shape of the pattern.',
			choice: 'Store everything (lazy learning) and answer by looking up the closest examples.',
			price: 'Slow predictions on big data, high memory, and distance becomes useless in many dimensions.',
		},
		edges: [
			['k = 1', 'Copies noise.', 'Increase k.'],
			['k = n', 'Always predicts the majority class.', 'Keep k small and odd.'],
			['Ties', 'Equal votes.', 'Use odd k or break ties by distance.'],
			['Unscaled features', 'One big-scale feature decides.', 'Standardise first ({{data}}).'],
			['Many dimensions', 'All points look equally far.', 'Reduce dimensions ({{pca}}).'],
		],
		links: [
			['vectors', 'Distance and cosine.'],
			['data', 'Scaling matters here more than anywhere.'],
			['bias', 'Small k = high variance.'],
		],
		lab: {
			read: [
				'Coloured dots are known examples; the new point is the star.',
				'Rings or lines show which k neighbours were chosen.',
			],
			predict: 'Which k makes the answer flip? Slide until it does.',
		},
	},
	trees: {
		kid: {
			emoji: '🌲',
			story: 'Playing 20 questions: "Is it an animal? Does it fly?" Each question splits the possibilities, and a good first question cuts the list in half. A decision tree learns the best questions from data and stops when the answer is clear.',
			say: [
				'Ask the question that separates the groups best.',
				'Ask the next question inside each group.',
				'Stop when a group is mostly one answer.',
			],
		},
		real: {
			title: 'Which split is better?',
			scenario:
				'10 customers: 5 buy, 5 do not (impurity high). Question A splits into [4 buy, 1 no] and [1 buy, 4 no]. Question B splits into [3 buy, 2 no] and [2 buy, 3 no]. A makes each side purer.',
			result:
				'Gini before = 0.5. After A ≈ 0.32, after B ≈ 0.48. The tree picks A.',
		},
		diagram: {
			type: 'flow',
			title: 'Growing a tree',
			nodes: [
				['try each question', 'every feature, every cut'],
				['score purity', 'Gini or entropy'],
				['keep the best', 'split the data'],
				['recurse', 'on each side'],
			],
			loop: 'stop at a depth limit or a pure group',
		},
		principle: {
			name: 'Greedy, readable rules',
			rule: 'Pick the best split now; do not plan ahead.',
			why: 'Greedy is fast and gives rules a person can read, but the tree can still memorise noise.',
		},
		design: {
			problem: 'You want a model that handles mixed data and can be explained.',
			choice: 'Recursively split on one feature at a time to make groups purer.',
			price: 'Unstable (small data changes produce a different tree) and overfits unless depth is limited.',
		},
		edges: [
			['Pure node', 'Nothing more to split.', 'Stop.'],
			['No gain', 'Every split is equally bad.', 'Create a leaf.'],
			['Very deep tree', 'Memorises training.', 'Set max depth or min samples.'],
			['Imbalanced classes', 'Majority leaf everywhere.', 'Class weights.'],
			['Unseen category', 'Question cannot be asked.', 'Handle unknown at prediction time.'],
		],
		links: [
			['ensembles', 'Many trees beat one.'],
			['bias', 'Deep trees overfit.'],
			['metrics', 'Impurity vs the metric you report.'],
		],
		lab: {
			read: [
				'The slider is a candidate cut; both sides show their class counts.',
				'The impurity numbers tell you which cut is purer.',
			],
			predict: 'Where is the cut with the lowest impurity?',
		},
	},
	ensembles: {
		kid: {
			emoji: '🗳️',
			story: 'One friend might guess the number of jelly beans badly. Ask a hundred friends and average their guesses: the silly errors cancel. An ensemble asks many models and combines them. In boosting, each new friend tries to fix what the previous friends got wrong.',
			say: [
				'Ask many different models.',
				'Combine their answers (vote or average).',
				'Boosting: each new model fixes earlier mistakes.',
			],
		},
		real: {
			title: 'Averaging noisy guesses',
			scenario:
				'True value 100. Three models predict 90, 108, 102. Each is off by 10, 8 and 2. Their average, 100, is off by 0.',
			result:
				'Errors that point in different directions cancel. If the models make the same mistake, averaging does not help, so diversity matters.',
		},
		diagram: {
			type: 'compare',
			title: 'Two ways to combine',
			left: ['Bagging / random forest', ['models trained in parallel on random samples', 'average or vote', 'reduces variance']],
			right: ['Boosting', ['models trained one after another', 'each fits the previous residuals', 'reduces bias, can overfit']],
		},
		principle: {
			name: 'Diversity beats a single genius',
			rule: 'Combine models whose errors are not the same.',
			why: 'Independent mistakes average out; shared mistakes do not.',
		},
		design: {
			problem: 'A single deep tree has high variance; a shallow one has high bias.',
			choice: 'Bagging many deep trees averages out variance; boosting adds many shallow trees to remove bias step by step.',
			price: 'Harder to explain, slower to train and serve, and boosting needs careful tuning.',
		},
		edges: [
			['Too few models', 'Little averaging benefit.', 'Plot score vs number of trees.'],
			['Boosting too long', 'Overfits.', 'Early stopping on validation.'],
			['Correlated models', 'No gain.', 'Randomise features and samples.'],
			['Noisy labels', 'Boosting chases noise.', 'Lower learning rate, regularise.'],
		],
		links: [
			['trees', 'The building block.'],
			['bias', 'Why bagging and boosting help different problems.'],
			['gradient', 'Gradient boosting follows gradients on predictions.'],
		],
		lab: {
			read: [
				'Four boxes: single model, combining, bagging, boosting.',
				'Read the narration for which error each approach reduces.',
			],
			predict: 'Would averaging help if all models make the same mistake?',
		},
	},
	svm: {
		kid: {
			emoji: '🛣️',
			story: 'Two groups of kids sit on a playground. Draw a line between them. Many lines work, but the best one is the middle of the widest empty road, so it stays safe even if someone shuffles a little. A support vector machine finds that widest road; only the kids on the road edges matter.',
			say: [
				'Many lines can separate the groups.',
				'Choose the one with the widest empty gap.',
				'Only the kids at the edge (support vectors) hold the line in place.',
			],
		},
		real: {
			title: 'Margin violations on four points',
			scenario:
				'A line scores points: +2.1 (class +), +0.4 (class +), −1.5 (class −), +0.2 (class −, wrong side). Margin rule: y × score ≥ 1. The first and third pass, the second is inside the road (0.4 < 1), and the fourth is on the wrong side.',
			result:
				'Hinge loss counts max(0, 1 − y × score): 0, 0.6, 0, 1.2. The loss pushes the line away from those points.',
		},
		diagram: {
			type: 'flow',
			title: 'Margin check',
			nodes: [
				['score', 'w·x + b'],
				['multiply by label', 'y = ±1'],
				['≥ 1?', 'safe'],
				['< 1', 'pay hinge loss'],
			],
		},
		principle: {
			name: 'Prefer the boundary with the most room for error',
			rule: 'A wide margin generalises better because small changes in data do not flip the answer.',
			why: 'Only the points near the boundary matter; far points are ignored.',
		},
		design: {
			problem: 'Infinitely many lines separate the training data.',
			choice: 'Maximise the margin; use a kernel to bend the boundary, and a penalty C to allow some violations.',
			price: 'Training slows on large data, needs scaled features, and is less easy to interpret than a tree.',
		},
		edges: [
			['Not separable', 'No perfect line.', 'Soft margin (smaller C) or a kernel.'],
			['C too large', 'Overfits outliers.', 'Tune C on validation.'],
			['Unscaled features', 'One feature dominates the margin.', 'Standardise ({{data}}).'],
			['Huge dataset', 'Slow training.', 'Linear SVM or other model.'],
		],
		links: [
			['logistic', 'Another linear boundary with a different loss.'],
			['vectors', 'Margin is distance to a line.'],
			['bias', 'C trades bias against variance.'],
		],
		lab: {
			read: [
				'Four boxes: many lines, the margin, support vectors, soft margin.',
				'Each narration says which points matter in that step.',
			],
			predict: 'If you remove a point far from the road, does the line move?',
		},
	},
	bayes: {
		kid: {
			emoji: '✉️',
			story: 'Is this email spam? Look at the words one by one. "Free" appears much more in spam; "meeting" appears more in normal mail. Naive Bayes treats each word as a separate clue, multiplies all the clues together, and picks the more likely side. It is "naive" because it pretends the clues do not affect each other.',
			say: [
				'Start with how common spam is.',
				'Multiply by how common each word is in spam vs normal mail.',
				'The bigger total wins.',
			],
		},
		real: {
			title: 'Smoothing a count',
			scenario:
				'Of 100 spam words, "prize" appeared 0 times in training. Without smoothing P(prize | spam) = 0, and any email containing "prize" gets probability 0 for spam. With add-one smoothing and a vocabulary of 1,000 words: (0+1)/(100+1000) ≈ 0.0009.',
			result:
				'One unseen word no longer kills the whole product. This is why smoothing is not optional.',
		},
		diagram: {
			type: 'flow',
			title: 'Scoring one email',
			nodes: [
				['prior', 'P(spam)'],
				['× each word', 'P(word | spam)'],
				['compare', 'spam score vs ham score'],
				['pick larger', 'or use logs to add'],
			],
		},
		principle: {
			name: 'A wrong assumption can still be useful',
			rule: 'Independence is rarely true, but the ranking of classes often survives it.',
			why: 'Simple assumptions give a fast, stable model with very little data; check its probabilities before trusting them as exact.',
		},
		design: {
			problem: 'Estimating the joint distribution of many features needs a huge amount of data.',
			choice: 'Assume features are independent given the class, so you only estimate one small probability per feature.',
			price: 'Probabilities are often over-confident when features are correlated.',
		},
		edges: [
			['Unseen word', 'Probability 0 wipes out the product.', 'Laplace smoothing.'],
			['Long email', 'Multiplying many small numbers underflows.', 'Add logarithms instead.'],
			['Duplicate / correlated words', 'Evidence counted twice.', 'Feature selection, or accept it for ranking.'],
			['Class imbalance', 'Prior dominates.', 'Report threshold choices.'],
		],
		links: [
			['probability', 'Bayes\' rule itself.'],
			['logistic', 'Discriminative alternative.'],
			['metrics', 'Choosing the threshold on its output.'],
		],
		lab: {
			read: [
				'The slider is how common the event is; bars show how much each evidence source contributes.',
				'Combined belief = prior × evidence, normalised.',
			],
			predict: 'If the event is very rare, how strong must the evidence be to flip the answer?',
		},
	},
});
