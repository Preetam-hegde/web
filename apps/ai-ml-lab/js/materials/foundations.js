'use strict';

Teach.add({
	'ai-map': {
		kid: {
			emoji: '🍎',
			story: 'Imagine teaching a little kid which fruit is an apple. You do not hand them a rulebook. You show many fruits and say "apple" or "not apple". They guess, you say right or wrong, and soon they can name an apple they have never seen. A computer learning from examples is machine learning.',
			say: [
				'Show lots of examples.',
				'Let the computer guess, then tell it how wrong it was.',
				'Test it on examples it has never seen.',
			],
		},
		real: {
			title: 'A spam filter',
			scenario:
				'You have 1,000 old emails, each marked spam or not spam by a person. The computer finds patterns (odd links, shouting words). You then give it 200 new emails it has never seen and count its mistakes.',
			result:
				'Training score tells you what it memorised; the new-email score tells you whether it learned. Only the second one counts.',
		},
		diagram: {
			type: 'flow',
			title: 'The learning loop',
			nodes: [
				['examples', 'inputs + right answers'],
				['guess', 'model predicts'],
				['measure the mistake', 'loss'],
				['adjust', 'change the knobs'],
			],
			loop: 'repeat, then test on brand-new examples',
		},
		principle: {
			name: 'Learn from data, judge on unseen data',
			rule: 'A model is only useful if it works on cases it was not trained on.',
			why: 'Memorising the training set is easy and worthless. Honest testing is the whole point of the design.',
		},
		design: {
			problem: 'Writing a rule for every situation is impossible (every spam email looks different).',
			choice: 'Define an objective, let an optimiser adjust parameters to reduce it, and evaluate on separate data.',
			price: 'You need good labelled data, and the objective is only a proxy for what you really want.',
		},
		edges: [
			['Tiny dataset', 'Model memorises; results are noisy.', 'Simpler model, cross-validation, or more data.'],
			['No labels', 'Supervised learning is impossible.', 'Use clustering or ask humans to label a sample.'],
			['Rule is enough', 'A simple if-statement beats ML.', 'Build the rule baseline first.'],
			['Data from the future', 'Training uses facts not available at prediction time.', 'Only use information known at decision time ({{validation}}).'],
		],
		links: [
			['validation', 'How to test honestly.'],
			['data', 'Garbage in, garbage out.'],
			['system-design', 'Putting the loop into a real product.'],
		],
		lab: {
			read: [
				'Each of the four boxes is one stage of the learning loop; the lit box matches the sentence below it.',
				'Notice the loop goes back to the start: learning is repeated, not one-shot.',
			],
			predict: 'Before pressing next, say what the model needs at this stage (data, a guess, a score, or an update).',
		},
	},
	vectors: {
		kid: {
			emoji: '🏹',
			story: 'A vector is an arrow, or just a list of numbers like [3, 4] that says how far to go right and how far to go up. Two arrows can point the same way, opposite ways, or sideways. "Similar" in AI usually means the arrows point the same way.',
			say: [
				'A list of numbers is an arrow.',
				'Same direction = very alike.',
				'Sideways = nothing in common. Opposite = the reverse.',
			],
		},
		real: {
			title: 'Is this movie like that movie?',
			scenario:
				'Describe a movie as [action, romance]. Film A = [8, 1], film B = [7, 2], film C = [1, 9]. A and B point almost the same way; C points a very different way.',
			result:
				'Cosine similarity: A·B / (|A||B|) = (56 + 2) / (8.06 × 7.28) ≈ 0.99, while A and C give ≈ 0.23. A recommends B, not C.',
		},
		diagram: {
			type: 'bars',
			title: 'Cosine similarity by angle',
			items: [
				['0° (same way)', 100, '1.00'],
				['45°', 71, '0.71'],
				['90° (sideways)', 3, '0.00'],
				['180° (opposite)', 3, '−1.00'],
			],
			caption: 'Negative values are drawn as a short bar; they mean "points the opposite way".',
		},
		principle: {
			name: 'Turn things into numbers so they can be compared',
			rule: 'Once everything is a vector, similarity, distance and averaging all become simple arithmetic.',
			why: 'Almost every later lesson (embeddings, attention, k-NN) is this idea with different arrows.',
		},
		design: {
			problem: 'Computers cannot compare "a cat" with "a dog" directly.',
			choice: 'Represent each item as a list of numbers and compare with a dot product or cosine.',
			price: 'The numbers must capture what matters; poor features give meaningless similarity. Lengths also matter unless you normalise.',
		},
		edges: [
			['Zero vector', 'Cosine divides by zero length.', 'Check length > 0 first.'],
			['Different lengths', 'Dot product undefined.', 'Same dimensions only.'],
			['Very different scales', 'Large features dominate distance.', 'Normalise or standardise ({{data}}).'],
			['High dimensions', 'Everything looks equally far.', 'Reduce dimensions ({{pca}}) or use cosine.'],
		],
		links: [
			['embeddings', 'Words become vectors.'],
			['attention', 'Attention scores are dot products.'],
			['knn', 'Nearest neighbours use distance.'],
		],
		lab: {
			read: [
				'Two arrows start at the same point; the angle slider rotates the second one.',
				'The similarity number is the cosine of that angle.',
			],
			predict: 'At 90° what should the similarity be? Then check.',
		},
	},
	probability: {
		kid: {
			emoji: '🎲',
			story: 'Probability is "how likely?". Imagine a very good smoke alarm that rings 9 out of 10 times when there is a fire, but also rings by mistake sometimes. If it rings, is it a fire? It depends on how rare fires are! A rare thing with a small false-alarm rate can still ring mostly by mistake.',
			say: [
				'Count how many really have the thing.',
				'Count the alarms from them, and the false alarms from everybody else.',
				'True alarms ÷ all alarms is the real answer.',
			],
		},
		real: {
			title: 'A rare disease test',
			scenario:
				'In 10,000 people, 1% (100) are sick. The test catches 90% of the sick (90) but also wrongly flags 5% of the 9,900 healthy people (495). A positive result happens 585 times.',
			result:
				'Only 90 of 585 positives are truly sick: about 15%. A "90% accurate" test is mostly wrong here because the disease is rare.',
		},
		diagram: {
			type: 'flow',
			title: 'Counting 10,000 people',
			nodes: [
				['100 sick', '90 flagged'],
				['9,900 healthy', '495 flagged'],
				['585 flagged', 'all positives'],
				['90 / 585', '≈ 15% really sick'],
			],
		},
		principle: {
			name: 'Condition on what you actually observe',
			rule: 'The question is P(sick | positive), not P(positive | sick). They are different numbers.',
			why: 'Mixing them up is the most common probability mistake. Always write which event is given.',
		},
		design: {
			problem: 'Evidence is uncertain, and rare events make intuition fail.',
			choice: 'Bayes\' rule updates a prior belief with the likelihood of the evidence.',
			price: 'You need a good prior and honest estimates of error rates; wrong inputs give confident wrong answers.',
		},
		edges: [
			['Prior near 0', 'Even a great test mostly gives false alarms.', 'Report the base rate with the result.'],
			['Prior near 100%', 'Almost every positive is correct.', 'Check against the new prevalence.'],
			['Zero probability', 'One 0 wipes out the whole product.', 'Smooth counts (add a small number).'],
			['Dependent evidence', 'Multiplying probabilities assumes independence.', 'Check if signals really are independent ({{bayes}}).'],
		],
		links: [
			['bayes', 'Naive Bayes applies this rule to text.'],
			['metrics', 'Precision is this same question.'],
		],
		lab: {
			read: [
				'The slider is how common the event is (prevalence).',
				'Watch the share of positive alarms that are true as prevalence changes.',
			],
			predict: 'What happens to the chance a positive alarm is real when prevalence goes from 1% to 40%?',
		},
	},
	data: {
		kid: {
			emoji: '🧺',
			story: 'Before cooking you wash and cut the vegetables. Data needs the same prep. Some values are missing, some are on a huge scale (house price vs number of rooms), and some are secretly the answer. If you cheat by letting the computer peek at the answer, it will look brilliant and then fail in real life.',
			say: [
				'Clean the data before using it.',
				'Put numbers on a similar scale.',
				'Never let the model see the test answers.',
			],
		},
		real: {
			title: 'Scaling a house price',
			scenario:
				'Rooms: 2 to 6. Prices: 100,000 to 900,000. A distance-based model sees the price difference as thousands of times bigger than the rooms difference, so rooms get ignored. Compute the mean and standard deviation from the training set only, then apply to both training and test data.',
			result:
				'If you compute the mean using test data too, you leak information about the test set into training, and your score is too good.',
		},
		diagram: {
			type: 'flow',
			title: 'The safe order',
			nodes: [
				['split', 'train / test first'],
				['learn the scaling', 'from train only'],
				['apply it', 'to train and test'],
				['fit and score', 'test last'],
			],
		},
		principle: {
			name: 'Split first, prepare second',
			rule: 'Anything learned from data (means, vocabularies, imputation values) must be learned from the training data only.',
			why: 'Otherwise the future leaks into the past, and results look better than reality (data leakage).',
		},
		design: {
			problem: 'Raw data is messy and models assume tidy numbers.',
			choice: 'A pipeline that fits preprocessing steps on the training set and re-applies them unchanged elsewhere.',
			price: 'More code and discipline, but it protects every later score you report.',
		},
		edges: [
			['Missing values', 'Model crashes or silently drops rows.', 'Impute from training data and add a "was missing" flag.'],
			['Outliers', 'One huge value skews the mean.', 'Use robust scaling or clip.'],
			['New category at test time', 'Encoder has never seen it.', 'Add an "unknown" bucket.'],
			['Duplicate rows across split', 'Same row in train and test inflates the score.', 'Deduplicate before splitting.'],
			['Target leakage', 'A feature that is only known after the outcome.', 'Ask: would I have this at prediction time?'],
		],
		links: [
			['validation', 'Splitting correctly.'],
			['vectors', 'Why scale matters for distance.'],
			['production', 'The same preprocessing must run at serving time.'],
		],
		lab: {
			read: [
				'The four boxes show the safe order: split, learn from train only, apply, then score.',
				'Each narration explains what would go wrong if the step were skipped.',
			],
			predict: 'Which step would break if you computed the mean on all the data before splitting?',
		},
	},
});
