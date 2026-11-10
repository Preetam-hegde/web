'use strict';

Teach.add({
	regression: {
		kid: {
			emoji: '📏',
			story: 'You put dots on paper: how tall a plant is after each week. You then lay a ruler through the dots so it passes as close to all of them as possible. The ruler is your prediction line. Next week\'s height? Read it off the ruler.',
			say: [
				'Draw a line through the dots.',
				'Measure how far each dot is from the line.',
				'Wiggle the line to make those gaps smaller.',
			],
		},
		real: {
			title: 'Predict a pizza delivery time from distance',
			scenario:
				'Data: 1 km → 12 min, 2 km → 17 min, 3 km → 21 min. A line y = 4.5x + 7.5 gives 12, 16.5, 21: the errors are 0, 0.5, 0. For 5 km it predicts 30 min.',
			result:
				'The line is a summary: 7.5 minutes of fixed time plus 4.5 minutes per km. Predictions far outside 1–3 km are guesses.',
		},
		diagram: {
			type: 'flow',
			title: 'Fitting a line',
			nodes: [
				['guess a line', 'any slope and intercept'],
				['measure errors', 'prediction − truth'],
				['square and average', 'loss (MSE)'],
				['nudge the line', 'to lower the loss'],
			],
			loop: 'until the loss stops falling',
		},
		principle: {
			name: 'Start with the simplest model that could work',
			rule: 'A straight line is easy to fit, explain and debug; reach for complex models only if the line fails.',
			why: 'Simple models are your baseline. If a fancy model cannot beat them, it is not worth the cost.',
		},
		design: {
			problem: 'Predict a number from other numbers.',
			choice: 'Pick a weighted sum and minimise the squared error, which has one clear best answer and a smooth slope.',
			price: 'Squared error punishes outliers a lot, and a straight line cannot bend to fit a curve.',
		},
		edges: [
			['One data point', 'Infinite lines fit perfectly.', 'Need more points than parameters.'],
			['All x equal', 'Slope undefined.', 'Check feature variance.'],
			['Outlier', 'Drags the line.', 'Inspect, use robust loss, or remove with justification.'],
			['Extrapolation', 'The line goes beyond the data.', 'Report the valid range.'],
			['Correlated features', 'Weights become unstable.', 'Regularise ({{bias}}).'],
		],
		links: [
			['gradient', 'How the line is nudged.'],
			['bias', 'When the line is too simple or too wiggly.'],
			['logistic', 'Regression for yes/no answers.'],
		],
		lab: {
			read: [
				'Dots are the data; the line is the current guess; thin lines are errors.',
				'The learning rate is the size of each nudge.',
			],
			predict: 'Is a rate of 0.8 faster, or does it overshoot?',
		},
	},
	gradient: {
		kid: {
			emoji: '⛷️',
			story: 'You are on a foggy hill and want the bottom. You cannot see far, but you can feel which way the ground slopes under your feet. So you take a small step downhill, feel again, step again. Small steps are safe; huge leaps might jump over the valley.',
			say: [
				'Feel the slope under your feet.',
				'Step the opposite way, downhill.',
				'Small steps. Repeat.',
			],
		},
		real: {
			title: 'Two steps down L(w) = (w − 3)²',
			scenario:
				'Start at w = 0 with step size 0.1. Slope = 2(w − 3) = −6, so w = 0 − 0.1 × (−6) = 0.6. Slope = 2(0.6 − 3) = −4.8, so w = 0.6 + 0.48 = 1.08.',
			result:
				'w moves toward 3 each time, with smaller steps as the slope flattens. A step size of 1.0 would jump to 6, then back to 0, and never settle.',
		},
		diagram: {
			type: 'bars',
			title: 'What step size does',
			items: [
				['too small (0.01)', 8, 'slow, safe'],
				['good (0.1–0.3)', 60, 'steady descent'],
				['too big (> 1)', 100, 'bounces or explodes'],
			],
			caption: 'Bar length: how wildly the weight moves per step.',
		},
		principle: {
			name: 'Follow the local slope',
			rule: 'You do not need to see the whole landscape; the slope at your feet tells you which way is down.',
			why: 'That is why gradient descent scales from one weight to billions.',
		},
		design: {
			problem: 'Models have too many parameters to try all values.',
			choice: 'Use derivatives to find the direction that reduces the loss, then take a step scaled by the learning rate.',
			price: 'Can get stuck in flat or bad spots, and the learning rate must be tuned.',
		},
		edges: [
			['Learning rate too big', 'Loss goes up or becomes NaN.', 'Lower it; watch the first few steps.'],
			['Too small', 'Training barely moves.', 'Raise it or use a schedule.'],
			['Flat region', 'Gradient near zero, progress stalls.', 'Use momentum or Adam ({{optimization}}).'],
			['Non-convex loss', 'Different starts end in different valleys.', 'Try several initialisations.'],
		],
		links: [
			['regression', 'The thing being descended.'],
			['backprop', 'How gradients are found for many layers.'],
			['optimization', 'Better ways to step.'],
		],
		lab: {
			read: [
				'The curve is the loss; the dot is the current weight.',
				'Each step moves against the slope by learning rate × slope.',
			],
			predict: 'With rate 1.0 on (w − 3)², where does the dot land after one step from w = 0?',
		},
	},
	logistic: {
		kid: {
			emoji: '🚦',
			story: 'A yes/no question needs a "how sure?" dial between 0 and 1. The model first makes any score (positive means yes-ish, negative means no-ish), then squashes it through an S-shaped curve so it becomes a probability. Finally you pick a cut-off line to say yes or no.',
			say: [
				'Make a score (it can be any number).',
				'Squash it to between 0 and 1.',
				'Choose where to say "yes".',
			],
		},
		real: {
			title: 'Will this customer click?',
			scenario:
				'Score z = 1 → probability = 1 / (1 + e⁻¹) ≈ 0.73. Score z = −2 → 0.12. Score 0 → 0.50, a coin flip.',
			result:
				'At threshold 0.5 the first customer gets "yes", but a business that hates missed clicks might choose 0.3 instead.',
		},
		diagram: {
			type: 'flow',
			title: 'From features to a decision',
			nodes: [
				['features', 'x₁, x₂, ...'],
				['score z', 'w·x + b'],
				['sigmoid', 'p = 1 / (1 + e⁻ᶻ)'],
				['threshold', 'p ≥ 0.5 → yes'],
			],
		},
		principle: {
			name: 'Separate the probability from the decision',
			rule: 'The model estimates a probability; a threshold chosen from the costs of mistakes makes the decision.',
			why: 'Keeping them apart lets you change the decision rule without retraining.',
		},
		design: {
			problem: 'A straight line gives numbers outside 0–1, which are not probabilities.',
			choice: 'Pass the score through a sigmoid, and train with log loss, which punishes confident wrong answers heavily.',
			price: 'Decision boundary is a straight line unless you add features. Probabilities may need calibration.',
		},
		edges: [
			['Very large |z|', 'Sigmoid saturates at 0 or 1, the gradient vanishes.', 'Scale features; clip logits.'],
			['Perfectly separable data', 'Weights grow without limit.', 'Add regularisation.'],
			['Imbalanced classes', 'Always predicting the majority looks accurate.', 'Use recall/precision and a tuned threshold ({{metrics}}).'],
			['Probability exactly 0 or 1', 'log(0) is infinite.', 'Clip probabilities by a tiny epsilon.'],
		],
		links: [
			['regression', 'Same weighted sum, different output.'],
			['metrics', 'Choosing the threshold.'],
			['neural', 'Sigmoid is also a neuron\'s squash.'],
		],
		lab: {
			read: [
				'The slider is the score z; the S-curve shows probability.',
				'The dot is where the current score lands.',
			],
			predict: 'What probability does z = 0 give? What about z = 3?',
		},
	},
	metrics: {
		kid: {
			emoji: '🎯',
			story: 'A goalkeeper can save 95 of 100 shots, but if 95 of the shots were nowhere near the goal that is not impressive. Accuracy can lie. So we also ask two kinder questions: of the times I said "yes", how often was I right? And of all the real yeses, how many did I find?',
			say: [
				'Precision: when I shout "found it", am I right?',
				'Recall: of all that exist, how many did I find?',
				'Moving the cut-off trades one for the other.',
			],
		},
		real: {
			title: 'Fraud among 1,000 transactions, 10 are fraud',
			scenario:
				'A model that says "not fraud" for everything is 99% accurate and catches 0 frauds. A real model flags 20: 8 are fraud, 12 are not. Precision = 8/20 = 40%, recall = 8/10 = 80%.',
			result:
				'Accuracy was a useless number here. Lowering the threshold finds more fraud (recall up) but wastes more reviewer time (precision down).',
		},
		diagram: {
			type: 'compare',
			title: 'The four boxes',
			left: ['Predicted yes', ['TP: right yes', 'FP: false alarm']],
			right: ['Predicted no', ['FN: missed it', 'TN: right no']],
		},
		principle: {
			name: 'Pick the metric that matches the cost of mistakes',
			rule: 'Decide which error hurts most (missed fraud or false alarms), then choose the metric and threshold from that.',
			why: 'There is no universal best number; every metric is a statement about what you care about.',
		},
		design: {
			problem: 'One number cannot capture two different kinds of mistake.',
			choice: 'Report the confusion matrix and derive precision, recall and F1 from it, then pick the threshold.',
			price: 'More numbers to explain, and results depend on the chosen threshold and class balance.',
		},
		edges: [
			['No positives predicted', 'Precision = 0/0.', 'Define it as 0 and say so.'],
			['No real positives', 'Recall = 0/0.', 'Check the test set contains positives.'],
			['Class imbalance', 'Accuracy hides everything.', 'Use precision, recall, PR curve.'],
			['Threshold 0 or 1', 'Everything or nothing is flagged.', 'Test extremes.'],
		],
		links: [
			['logistic', 'The model producing the probabilities.'],
			['probability', 'Precision is a posterior probability.'],
			['validation', 'Compute metrics only on held-out data.'],
		],
		lab: {
			read: [
				'Move the threshold: dots flip between predicted yes and no.',
				'Counts TP, FP, FN, TN update; precision and recall come from them.',
			],
			predict: 'If you lower the threshold, which goes up for sure: precision or recall?',
		},
	},
	validation: {
		kid: {
			emoji: '📝',
			story: 'If a teacher gives you the exact test questions to practise, a perfect score proves nothing. A fair test uses new questions. For models: study on the training set, tune on a practice test (validation), and open the final exam (test set) only once.',
			say: [
				'Train: study.',
				'Validation: practice test to choose settings.',
				'Test: the real exam, used once.',
			],
		},
		real: {
			title: 'Predicting patient outcomes',
			scenario:
				'200 records from the same 40 patients are shuffled and split randomly. The same patient appears in both train and test, so the model recognises the person. Splitting by patient fixes this.',
			result:
				'A random split scored 94%; a patient-wise split scored 78%. The second number is what you will see on new patients.',
		},
		diagram: {
			type: 'flow',
			title: 'Three piles of data',
			nodes: [
				['train', 'fit the model'],
				['validation', 'choose settings'],
				['test', 'final score, once'],
			],
			caption: 'For time data, the split must follow time: train on the past, test on the future.',
		},
		principle: {
			name: 'The test set must stay untouched',
			rule: 'Every time you look at the test score and change something, it becomes a little bit of training data.',
			why: 'Repeated peeking quietly overfits to the test set, and the final number is too optimistic.',
		},
		design: {
			problem: 'You need to estimate performance on data you have not seen.',
			choice: 'Hold out data, or rotate it with cross-validation, in a way that mimics the real deployment.',
			price: 'Less data to train on, and cross-validation costs k trainings.',
		},
		edges: [
			['Time series', 'Random split uses the future to predict the past.', 'Chronological splits ({{timeseries}}).'],
			['Grouped data', 'Same user in both sets.', 'Split by group.'],
			['Small dataset', 'One split is noisy.', 'Use k-fold cross-validation.'],
			['Class imbalance', 'A fold with no positives.', 'Stratified splits.'],
			['Tuning on test', 'Optimistic final score.', 'Use validation for tuning, test once.'],
		],
		links: [
			['data', 'Preprocess after splitting.'],
			['bias', 'The gap between train and validation reveals overfitting.'],
			['metrics', 'What to measure on the held-out set.'],
		],
		lab: {
			read: [
				'Four boxes walk through one honest evaluation, one step at a time.',
				'The narration says what each pile of data may and may not be used for.',
			],
			predict: 'At which step would it be a mistake to look at the test score?',
		},
	},
	bias: {
		kid: {
			emoji: '🧵',
			story: 'Trace a picture with a stiff straight ruler: it misses every curve (too simple = underfitting). Trace with a very wiggly string: you copy even the smudges (too wiggly = overfitting). The best tracing follows the shape and ignores the smudges.',
			say: [
				'Too simple: misses the pattern.',
				'Too wiggly: memorises the noise.',
				'Aim for in between and check on new data.',
			],
		},
		real: {
			title: 'Fitting a curve to 6 points',
			scenario:
				'A straight line has training error 4.0 and validation error 4.2: it is too simple. A degree-5 polynomial has training error 0.0 and validation error 9.5: it memorised. A degree-2 curve has 1.1 and 1.4: balanced.',
			result:
				'The lowest validation error, not the lowest training error, picks the model.',
		},
		diagram: {
			type: 'bars',
			title: 'Error by model complexity (illustrative)',
			items: [
				['too simple: train', 50, '4.0'],
				['too simple: valid', 52, '4.2'],
				['just right: valid', 18, '1.4'],
				['too wiggly: valid', 100, '9.5'],
			],
		},
		principle: {
			name: 'Bias–variance trade-off',
			rule: 'Simple models have high bias (consistently wrong); flexible models have high variance (change a lot with the data). Reduce one and the other grows.',
			why: 'More data, regularisation, and ensembles are the tools that shift the balance.',
		},
		design: {
			problem: 'A model must generalise, not just fit.',
			choice: 'Add a penalty on large weights (regularisation) or limit model size, and tune it on validation data.',
			price: 'Penalty strength is another setting to tune; too much brings back underfitting.',
		},
		edges: [
			['Training error high', 'Underfitting.', 'Add features or capacity.'],
			['Gap large', 'Overfitting.', 'More data, regularise, simplify.'],
			['Both low but production fails', 'Distribution shift.', 'Monitor and retrain ({{production}}).'],
			['Tiny validation set', 'Gap is noise.', 'Cross-validate.'],
		],
		links: [
			['validation', 'How you see the gap.'],
			['ensembles', 'Averaging reduces variance.'],
			['regression', 'Where overfitting is easiest to draw.'],
		],
		lab: {
			read: [
				'Four boxes walk from an under-fit model to an over-fit one and the balanced middle.',
				'Compare the training and validation errors in each narration.',
			],
			predict: 'Which has the lower training error: the simple or the wiggly model? Which should you ship?',
		},
	},
});
