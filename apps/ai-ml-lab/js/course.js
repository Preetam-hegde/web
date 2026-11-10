'use strict';

const AICourse = (() => {
	const sources = {
		google: {
			title: 'Google · Machine Learning Crash Course',
			url: 'https://developers.google.com/machine-learning/crash-course',
		},
		algebra: {
			title: 'Stanford CS229 · Linear algebra review',
			url: 'https://cs229.stanford.edu/section/cs229-linalg.pdf',
		},
		probability: {
			title: 'Stanford CS229 · Probability review',
			url: 'https://cs229.stanford.edu/section/cs229-prob.pdf',
		},
		preprocessing: {
			title: 'scikit-learn · Preprocessing data',
			url: 'https://scikit-learn.org/stable/modules/preprocessing.html',
		},
		linear: {
			title: 'scikit-learn · Linear models',
			url: 'https://scikit-learn.org/stable/modules/linear_model.html',
		},
		metrics: {
			title: 'scikit-learn · Evaluation metrics',
			url: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
		},
		validation: {
			title: 'scikit-learn · Cross-validation',
			url: 'https://scikit-learn.org/stable/modules/cross_validation.html',
		},
		leakage: {
			title: 'scikit-learn · Common pitfalls and leakage',
			url: 'https://scikit-learn.org/stable/common_pitfalls.html',
		},
		neighbors: {
			title: 'scikit-learn · Nearest neighbors',
			url: 'https://scikit-learn.org/stable/modules/neighbors.html',
		},
		trees: {
			title: 'scikit-learn · Decision trees',
			url: 'https://scikit-learn.org/stable/modules/tree.html',
		},
		ensembles: {
			title: 'scikit-learn · Ensembles',
			url: 'https://scikit-learn.org/stable/modules/ensemble.html',
		},
		svm: {
			title: 'scikit-learn · Support vector machines',
			url: 'https://scikit-learn.org/stable/modules/svm.html',
		},
		bayes: {
			title: 'scikit-learn · Naive Bayes',
			url: 'https://scikit-learn.org/stable/modules/naive_bayes.html',
		},
		clustering: {
			title: 'scikit-learn · Clustering',
			url: 'https://scikit-learn.org/stable/modules/clustering.html',
		},
		pca: {
			title: 'scikit-learn · PCA and decomposition',
			url: 'https://scikit-learn.org/stable/modules/decomposition.html',
		},
		autograd: {
			title: 'PyTorch · Autograd mechanics',
			url: 'https://docs.pytorch.org/docs/stable/notes/autograd.html',
		},
		training: {
			title: 'PyTorch · Optimizing model parameters',
			url: 'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html',
		},
		cnn: {
			title: 'Stanford CS231n · Convolutional networks',
			url: 'https://cs231n.github.io/convolutional-networks/',
		},
		rnn: {
			title: 'Dive into Deep Learning · Recurrent networks',
			url: 'https://d2l.ai/chapter_recurrent-neural-networks/rnn.html',
		},
		llm: {
			title: 'Hugging Face · LLM course',
			url: 'https://huggingface.co/learn/llm-course/en/chapter1/1',
		},
		attention: {
			title: 'Vaswani et al. · Attention Is All You Need (2017)',
			url: 'https://arxiv.org/abs/1706.03762',
		},
		rag: {
			title: 'Lewis et al. · Retrieval-Augmented Generation (2020)',
			url: 'https://arxiv.org/abs/2005.11401',
		},
		lora: {
			title: 'Hu et al. · LoRA (2021)',
			url: 'https://arxiv.org/abs/2106.09685',
		},
		diffusion: {
			title: 'Ho et al. · Denoising Diffusion Probabilistic Models (2020)',
			url: 'https://arxiv.org/abs/2006.11239',
		},
		rl: {
			title: 'Sutton & Barto · Reinforcement Learning, 2nd ed.',
			url: 'https://mitpress.mit.edu/9780262039246/reinforcement-learning/',
		},
		recs: {
			title: 'Google · Recommendation systems',
			url: 'https://developers.google.com/machine-learning/recommendation/overview',
		},
		forecast: {
			title: 'Hyndman & Athanasopoulos · Forecasting: Principles and Practice',
			url: 'https://otexts.com/fpp3/toolbox.html',
		},
		production: {
			title: 'Google · Production ML systems',
			url: 'https://developers.google.com/machine-learning/crash-course/production-ml-systems',
		},
		fairness: {
			title: 'Google · ML fairness',
			url: 'https://developers.google.com/machine-learning/crash-course/fairness',
		},
	};
	const groups = [
		{
			id: 'foundations',
			title: '01 · Foundations',
			hint: 'Start with the language',
		},
		{
			id: 'learning',
			title: '02 · Learn & evaluate',
			hint: 'Fit, measure, generalize',
		},
		{
			id: 'classical',
			title: '03 · Classical ML',
			hint: 'Your strongest baselines',
		},
		{
			id: 'unsupervised',
			title: '04 · Find structure',
			hint: 'Clusters and compression',
		},
		{ id: 'deep', title: '05 · Deep learning', hint: 'From neurons to vision' },
		{
			id: 'language',
			title: '06 · Language & LLMs',
			hint: 'Tokens, attention, retrieval',
		},
		{
			id: 'generative',
			title: '07 · Generative & RL',
			hint: 'Create and make decisions',
		},
		{
			id: 'systems',
			title: '08 · Real-world ML',
			hint: 'Build, ship, interview',
		},
	];
	const question = (q, a, followup) => ({ q, a, followup });
	const quiz = (q, options, answer, explanation) => ({
		q,
		options,
		answer,
		explanation,
	});
	const lessons = [
		{
			id: 'ai-map',
			group: 'foundations',
			title: 'AI, ML & the learning loop',
			story:
				'Teaching a child to sort fruit is different from writing a rule for every apple. Show examples, let them try, give feedback, and check with fruit they have never seen. Machine learning follows that loop.',
			detail:
				'AI is the broad study of systems that perform tasks associated with intelligence, including search and planning. ML learns behavior from data. Deep learning is ML with multilayer neural networks. Supervised learning uses labels; unsupervised learning finds structure; reinforcement learning learns from rewards. Self-supervised learning constructs targets from the data itself.',
			formula: 'data + model + objective + optimization → learned parameters',
			symbols:
				'Parameters are learned values. Hyperparameters are choices such as learning rate and model depth. Inference applies learned parameters to new inputs.',
			steps: [
				'Frame: Predict a useful outcome and define what success means.',
				'Collect: Gather representative examples and decide where targets come from.',
				'Learn: Adjust parameters to improve a training objective.',
				'Evaluate: Test on unseen data and compare against a simple baseline.',
			],
			code: 'X_train, X_test, y_train, y_test = split(X, y)\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\nscore = metric(y_test, predictions)',
			pitfall:
				'A model that memorizes the examples can look excellent on its training set and fail on new inputs. A lower loss is only useful if it supports the actual task.',
			challenge:
				'Take spam detection, grouping customer behavior, and game playing. Decide which feedback signal fits each task before choosing an algorithm.',
			sources: ['google', 'production'],
			check: quiz(
				'Which task naturally has a supervised target?',
				[
					'Group unlabeled articles',
					'Predict a known sale price',
					'Explore a game for rewards',
				],
				1,
				'A historical sale price is a label. Grouping is usually unsupervised; game rewards suggest RL.',
			),
			interview: [
				question(
					'How do AI, ML, and deep learning differ?',
					'AI includes learned and rule-based methods. ML learns patterns from data; deep learning uses multilayer neural networks. The sets overlap through this hierarchy, but AI is broader than neural networks.',
					'Where would search or a rules engine be enough?',
				),
				question(
					'Supervised vs unsupervised vs reinforcement learning?',
					'Supervised methods fit labeled input-target pairs. Unsupervised methods seek structure without task labels. RL learns actions through environment rewards, often delayed and affected by previous actions.',
					'Where does self-supervised learning fit?',
				),
				question(
					'Parameters vs hyperparameters?',
					'Parameters, such as weights, are estimated during training. Hyperparameters, such as depth or learning rate, control the model or training procedure and are selected using validation evidence.',
					'Why must you keep the final test set out of tuning?',
				),
				question(
					'What should you do before selecting a model?',
					'Define the decision, available inputs at prediction time, label, metric, cost of errors, and a simple baseline. Check whether the data supports the intended use.',
					'How would you spot a task that does not need ML?',
				),
			],
		},
		{
			id: 'vectors',
			group: 'foundations',
			title: 'Vectors, matrices & similarity',
			lab: 'vectors',
			story:
				'A recipe can be a row of numbers: flour, sugar, butter. A vector is one recipe; a matrix is a recipe book. A dot product combines the amounts with how much each ingredient matters.',
			detail:
				'A feature vector represents one example. Matrix multiplication batches linear transformations. A dot product depends on direction and length; cosine similarity divides out length. Gradients point toward steepest local increase, so descent moves in the opposite direction.',
			formula: 'a · b = Σ aᵢbᵢ; cosine(a,b) = (a · b) / (‖a‖ ‖b‖)',
			symbols:
				'aᵢ is coordinate i. ‖a‖ is Euclidean length. A zero vector has no defined cosine direction. For X of shape n×d and W of shape d×h, XW has shape n×h.',
			steps: [
				'Represent: Put each example into a numerical feature vector.',
				'Multiply: Match coordinates and sum their pairwise products.',
				'Normalize: Divide the dot product by both vector lengths.',
				'Compare: A cosine near 1 means aligned directions, not proof of equal meaning.',
			],
			code: 'import numpy as np\ndot = np.dot(a, b)\ndenominator = np.linalg.norm(a) * np.linalg.norm(b)\ncosine = dot / denominator if denominator else None',
			pitfall:
				'Distance depends on scale. A feature measured in thousands can dominate one measured between zero and one. Similarity is only as useful as the representation.',
			challenge:
				'Rotate the second vector from 0° to 180°. Predict the dot product sign before each change.',
			sources: ['algebra'],
			check: quiz(
				'Two nonzero perpendicular vectors have cosine…',
				['−1', '0', '1'],
				1,
				'The dot product is zero when the angle is 90°. Opposite vectors have cosine −1.',
			),
			interview: [
				question(
					'Dot product vs cosine similarity?',
					'The dot product grows with alignment and magnitude. Cosine normalizes by both norms, comparing directions. For unit vectors they agree; cosine is undefined for a zero vector.',
					'When might magnitude contain useful signal?',
				),
				question(
					'Why are tensor shapes important?',
					'Operations require compatible axes. A batch n×d multiplied by weights d×h produces n×h. Explicit shape checks prevent accidental broadcasting and wrong loss reduction.',
					'How does broadcasting silently produce a wrong result?',
				),
				question(
					'What does an eigenvector represent in PCA?',
					'An eigenvector of the covariance matrix identifies a direction preserved up to scaling; its eigenvalue gives variance along that direction. PCA orders directions by that variance.',
					'What does centering change?',
				),
				question(
					'What is a gradient?',
					'The vector of partial derivatives of a scalar objective with respect to its parameters. It describes local first-order change; a negative-gradient step usually lowers loss if the step is small enough.',
					'Does a zero gradient guarantee a global minimum?',
				),
			],
		},
		{
			id: 'probability',
			group: 'foundations',
			title: 'Probability, statistics & Bayes',
			lab: 'bayes',
			story:
				'A rare alarm can be wrong most of the time even if its detector is fairly good. Count both the rare true events and all the ordinary events that can trigger false alarms.',
			detail:
				'Conditional probability changes the sample space. Bayes combines a prior with evidence. Expectation is a probability-weighted average; variance measures squared spread. A confidence interval is a procedure with long-run coverage, not a posterior probability for a fixed parameter. Correlation alone does not establish causation.',
			formula: 'P(A|B) = P(B|A)P(A) / P(B)',
			symbols:
				'A is the event; B is observed evidence. P(A) is the prior. The denominator adds the evidence from A and not-A. The demo fixes sensitivity at 90% and false-positive rate at 5%.',
			steps: [
				'Prior: Begin with how common the event is before seeing an alarm.',
				'True alarms: Multiply event frequency by detector sensitivity.',
				'False alarms: Multiply non-event frequency by the false-positive rate.',
				'Posterior: Divide true alarms by all alarms to update your belief.',
			],
			code: 'true_alarm = prior * sensitivity\nfalse_alarm = (1 - prior) * false_positive_rate\nevidence = true_alarm + false_alarm\nposterior = true_alarm / evidence',
			pitfall:
				'P(alarm|event) is not P(event|alarm). Ignoring the base rate can make rare-event predictions badly misleading.',
			challenge:
				'Use a 1% event rate. Predict whether most alarms are true, then raise the prior to 50% and compare.',
			sources: ['probability'],
			check: quiz(
				'With 1% prevalence, 90% sensitivity, and 5% false positives, a positive alarm is true about…',
				['90%', '50%', '15%'],
				2,
				'0.009 / (0.009 + 0.0495) ≈ 15.4%. Most alarms come from the much larger non-event population.',
			),
			interview: [
				question(
					'Explain Bayes’ theorem with a base-rate example.',
					'At 1% prevalence, 90% sensitivity, and 5% false-positive rate, true positives are 0.009 of the population and false positives 0.0495. Thus only about 15.4% of positive alarms are true.',
					'What happens if prevalence shifts?',
				),
				question(
					'What does a p-value mean?',
					'Under a specified null model, it is the probability of observing a statistic at least as extreme as the one obtained. It is not the probability that the null hypothesis is true or the effect is practically useful.',
					'Why does repeated testing increase false discoveries?',
				),
				question(
					'What does the central limit theorem say?',
					'Under suitable conditions, the standardized mean of many independent observations tends toward a normal distribution. The observations themselves need not be normal; dependence and heavy tails can invalidate simple applications.',
					'Does it make a sample of five safe?',
				),
				question(
					'Correlation vs causation?',
					'Correlation is association; it can arise from a common cause, selection, or reverse causality. Causal claims require an identification strategy, such as randomization or defensible assumptions about confounding.',
					'Why can a highly predictive feature be a poor intervention target?',
				),
			],
		},
		{
			id: 'data',
			group: 'foundations',
			title: 'Data preparation & leakage',
			story:
				'Do not let tomorrow’s exam answers into today’s revision notes. Even a harmless-looking average can leak information if it was calculated using the exam set.',
			detail:
				'Inspect missingness, duplicates, label quality, and feature availability. Split before learning imputation, scaling, encoding, feature selection, or resampling. Fit transformations only on training data and apply them unchanged to validation/test data. Use a pipeline inside cross-validation. Python, NumPy, pandas, and SQL are practical tools, not substitutes for checking data meaning.',
			formula: 'z = (x − μ_train) / σ_train',
			symbols:
				'μ_train and σ_train are training-set statistics. One-hot encoding creates category indicators; unknown categories need a policy. Missingness may itself carry signal.',
			steps: [
				'Audit: Check units, labels, missing values, duplicates, and timestamps.',
				'Split: Separate independent evaluation data before learning transforms.',
				'Fit: Learn imputation and scaling using only the training partition.',
				'Apply: Transform new data with the saved training transformations.',
			],
			code: 'from sklearn.pipeline import make_pipeline\npipe = make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression())\npipe.fit(X_train, y_train)\npredictions = pipe.predict(X_test)',
			pitfall:
				'Target encoding, oversampling, and feature selection can all leak across folds. An ID, discharge note, or post-outcome status may encode the answer.',
			challenge:
				'Audit a churn table: which columns would actually exist at the instant you must predict churn?',
			sources: ['preprocessing', 'leakage'],
			check: quiz(
				'Where should you fit a scaler during cross-validation?',
				[
					'On the complete dataset',
					'Only inside each training fold',
					'On the test set',
				],
				1,
				'Every fold needs its own fitted preprocessing. A pipeline keeps the validation fold out of that fitting.',
			),
			interview: [
				question(
					'What is data leakage?',
					'Using information unavailable at prediction time, or allowing evaluation data to influence training choices. Examples include future features, duplicated users across folds, and scaling on the entire dataset.',
					'How would you prove a suspiciously high score is real?',
				),
				question(
					'How do you handle missing values?',
					'Investigate why values are missing, split first, fit an appropriate imputer on training data, and consider missingness indicators. Dropping rows can introduce bias; zero is not a universal replacement.',
					'How would production missingness differ?',
				),
				question(
					'When should you scale features?',
					'Distance-based methods, penalized linear models, PCA, and gradient-based models often need comparable scales. Tree split ordering generally does not require scaling. Fit all statistics within training folds.',
					'Standard scaling vs min-max scaling?',
				),
				question(
					'How do you encode categorical features?',
					'One-hot encoding is a useful nominal baseline; ordinal encoding needs a meaningful order. High-cardinality categories may need hashing, embeddings, or carefully out-of-fold target encoding.',
					'How do you handle unseen categories and rare values?',
				),
			],
		},
		{
			id: 'regression',
			group: 'learning',
			title: 'Linear regression',
			lab: 'regression',
			story:
				'Stretch a string through a scatter of dots. Each dot pulls the string toward itself. We choose the line that makes the total squared vertical misses small.',
			detail:
				'Linear regression predicts a continuous target with a weighted sum of features. Ordinary least squares minimizes squared residuals. The demo fits slope and intercept on seven fixed synthetic points using batch gradient descent. A straight-line model can still use engineered nonlinear features.',
			formula: 'ŷ = wx + b; MSE = (1/n) Σ(ŷᵢ − yᵢ)²',
			symbols:
				'w is slope, b is intercept, ŷ is prediction, y is the observed target, and n is the number of examples. Each vertical segment is one residual.',
			steps: [
				'Predict: Use the current slope and intercept to draw the line.',
				'Measure: Square each vertical prediction error and average them.',
				'Differentiate: Compute how slope and intercept affect that average.',
				'Update: Move both parameters against their gradients; repeat.',
			],
			code: 'prediction = X @ w + b\nerror = prediction - y\nw -= learning_rate * 2 * X.T @ error / len(y)\nb -= learning_rate * 2 * error.mean()',
			pitfall:
				'Outliers are amplified by squaring. Correlated features can make coefficients unstable. A good predictive fit does not make a coefficient causal.',
			challenge:
				'Play the fit, rewind it, then increase the learning rate. Compare how quickly the error falls.',
			sources: ['linear'],
			check: quiz(
				'Why can MSE be sensitive to outliers?',
				[
					'It squares residuals',
					'It discards large errors',
					'It is always zero',
				],
				0,
				'Squaring makes a residual of 10 contribute 100, whereas a residual of 1 contributes only 1.',
			),
			interview: [
				question(
					'What assumptions matter in linear regression?',
					'Linearity in parameters and suitable residual behavior matter for interpretation and inference. Uncorrelated errors, constant variance, and distributional assumptions affect standard errors; normal residuals are not required merely to compute least squares.',
					'What changes for prediction rather than inference?',
				),
				question(
					'MAE vs MSE vs RMSE?',
					'MAE is less sensitive to extreme residuals and targets a conditional median. MSE emphasizes large errors and targets a conditional mean. RMSE is the square root of MSE and uses target units.',
					'When would asymmetric loss be better?',
				),
				question(
					'What is multicollinearity?',
					'Strongly related predictors make individual coefficient estimates unstable and hard to interpret, even when predictions remain useful. Regularization, domain-driven feature removal, or more data may help.',
					'Does it necessarily hurt test accuracy?',
				),
				question(
					'What does R² mean?',
					'It compares residual squared error with a mean-target baseline on the evaluation data: 1 − SSE/SST. It can be negative on unseen data, and the constant-target case needs special treatment.',
					'Why can training R² rise after adding useless features?',
				),
			],
		},
		{
			id: 'gradient',
			group: 'learning',
			title: 'Gradient descent',
			lab: 'gradient',
			story:
				'You are on a hill in fog. Feel which direction slopes upward, then take a small step the other way. Huge steps can bounce you across the valley and even send you farther uphill.',
			detail:
				'Gradient descent updates parameters using derivatives of loss. The learning rate controls step size. This lab uses an actual one-parameter quadratic with minimum at w = 3; it demonstrates convergence, oscillation, and divergence without implying neural losses are simple bowls.',
			formula: 'w_next = w − η ∂L/∂w; L(w) = (w − 3)²',
			symbols:
				'η is the learning rate. Here the gradient is 2(w−3). This specific quadratic converges for 0 < η < 1; that bound is not universal.',
			steps: [
				'Locate: Evaluate the current parameter on the loss curve.',
				'Slope: Compute the local derivative of the loss.',
				'Step: Subtract learning rate times that derivative.',
				'Repeat: Check whether the loss decreases or the steps overshoot.',
			],
			code: 'for step in range(steps):\n    loss = (w - 3) ** 2\n    gradient = 2 * (w - 3)\n    w -= learning_rate * gradient',
			pitfall:
				'A falling training loss is not proof of generalization. A zero gradient can be a saddle or local extremum; the optimum need not be global in nonconvex models.',
			challenge:
				'Try rates 0.1, 0.8, 1.0, and 1.05. Explain the behavior using the update rather than guessing.',
			sources: ['training', 'linear'],
			check: quiz(
				'At w = 0, L = (w−3)², and η = 0.1, the next w is…',
				['−0.6', '0.6', '3'],
				1,
				'The derivative is −6, so 0 − 0.1×(−6) = 0.6.',
			),
			interview: [
				question(
					'Batch vs stochastic vs mini-batch gradient descent?',
					'Batch uses the whole training set per update. SGD uses one example; mini-batch uses a subset. Smaller batches give noisier, cheaper updates, while large batches can improve hardware efficiency and change optimization behavior.',
					'Is the same learning rate suitable for all batch sizes?',
				),
				question(
					'How do you diagnose an excessive learning rate?',
					'Loss may oscillate, grow, or become nonfinite. Inspect gradients and input scale, test a smaller rate on a controlled batch, and verify loss and update calculations before adding a scheduler.',
					'Could a data or loss bug produce the same symptoms?',
				),
				question(
					'Why can gradient descent get stuck?',
					'Nonconvex surfaces can contain flat regions, saddles, and local minima. Poor scaling, saturated activations, and small learning rates can slow progress even without a strict local minimum.',
					'How might momentum help?',
				),
				question(
					'What is the role of a learning-rate schedule?',
					'It changes update size over training, often using warmup and later decay. It can stabilize early updates and refine later ones, but it must be tuned against validation behavior and the optimizer.',
					'Why is warmup useful with large models?',
				),
			],
		},
		{
			id: 'logistic',
			group: 'learning',
			title: 'Logistic regression',
			lab: 'logistic',
			story:
				'A dimmer switch turns a raw score into a number between zero and one. Then you choose where that number becomes a yes. The score and the decision threshold do different jobs.',
			detail:
				'Binary logistic regression maps a linear logit through a sigmoid and usually trains with binary cross-entropy. The output estimates a class probability under the fitted model; calibration still needs checking. Changing the threshold changes decisions without retraining the weights.',
			formula: 'p = 1/(1+e⁻ᶻ), z = wᵀx+b; BCE = −[y log p + (1−y) log(1−p)]',
			symbols:
				'z is the logit, p is the estimated positive probability, y is 0 or 1. The classifier predicts positive when p ≥ threshold.',
			steps: [
				'Score: Combine features with a linear weighted sum.',
				'Squash: Apply sigmoid to turn the logit into a value in (0,1).',
				'Learn: Penalize confidently wrong predictions with cross-entropy.',
				'Decide: Compare the probability with a threshold chosen for error costs.',
			],
			code: 'logits = X @ w + b\nprobabilities = sigmoid(logits)\nloss = binary_cross_entropy_with_logits(logits, y)\npredictions = probabilities >= threshold',
			pitfall:
				'A 0.5 threshold is a convention, not a universal optimum. Imbalance, calibration, changing prevalence, and decision costs all matter.',
			challenge:
				'Move the logit from −6 to 6. Where does a one-unit change have the largest probability effect?',
			sources: ['linear', 'metrics'],
			check: quiz(
				'A logit of zero maps to…',
				['0', '0.5', '1'],
				1,
				'sigmoid(0) = 1/(1+1) = 0.5.',
			),
			interview: [
				question(
					'Why is logistic regression a classifier despite its name?',
					'It models the log-odds of a binary outcome as a linear function. Applying sigmoid yields an estimated probability; a threshold turns it into a class decision.',
					'Is its decision boundary linear?',
				),
				question(
					'Why cross-entropy instead of squared error?',
					'Cross-entropy corresponds to Bernoulli negative log-likelihood and yields a convex objective for the ordinary linear logistic model. It penalizes confidently wrong probabilities strongly.',
					'What is numerical stability with logits?',
				),
				question(
					'How do you choose a classification threshold?',
					'Use held-out validation predictions and the cost of false positives and false negatives, or a required precision/recall constraint. Then evaluate once on untouched test data and monitor deployment shifts.',
					'What changes if the positive class becomes rarer?',
				),
				question(
					'Does a probability output imply calibration?',
					'No. A calibrated model assigns probability p to groups that have outcome frequency near p. Check reliability and proper scoring rules; calibrate using separate data if needed.',
					'Why can resampling affect calibration?',
				),
			],
		},
		{
			id: 'metrics',
			group: 'learning',
			title: 'Precision, recall & thresholds',
			lab: 'metrics',
			story:
				'A fishing net can catch more fish by also catching more rubbish. Recall asks how many real fish you caught. Precision asks how much of your catch was actually fish.',
			detail:
				'A confusion matrix separates true/false positives and negatives. Threshold-dependent metrics answer different questions. ROC-AUC measures ranking across thresholds; PR curves are often more informative with rare positives. Neither replaces checking decision costs, calibration, and subgroup performance.',
			formula:
				'precision = TP/(TP+FP); recall = TP/(TP+FN); F1 = 2TP/(2TP+FP+FN)',
			symbols:
				'TP: correctly predicted positive; FP: false alarm; FN: missed positive; TN: correctly predicted negative. A zero denominator makes a ratio undefined, displayed as — in this lab.',
			steps: [
				'Score: Keep each example’s estimated positive probability.',
				'Threshold: Predict positive when the score reaches the chosen cutoff.',
				'Count: Sort the outcomes into TP, FP, FN, and TN.',
				'Trade off: Compare precision and recall as the threshold moves.',
			],
			code: 'positive = scores >= threshold\ntp = ((positive) & (y == 1)).sum()\nfp = ((positive) & (y == 0)).sum()\nprecision = tp / (tp + fp) if tp + fp else None',
			pitfall:
				'With 99% negatives, always predicting negative gives 99% accuracy and zero recall. An undefined metric should not be silently described as a measured zero.',
			challenge:
				'Raise the threshold until no examples are positive. Explain why precision becomes undefined and recall becomes zero.',
			sources: ['metrics'],
			check: quiz(
				'A system must miss as few real positives as possible. Which metric directly measures that?',
				['Recall', 'Precision', 'Training loss'],
				0,
				'Recall measures the share of actual positives that were found. The acceptable false-positive cost must still be considered.',
			),
			interview: [
				question(
					'When is accuracy misleading?',
					'When class prevalence or error costs are asymmetric. Compare a majority baseline, class-specific recall/precision, PR curves, calibration, and the cost-weighted decision metric.',
					'What if labels are delayed?',
				),
				question(
					'ROC-AUC vs PR-AUC?',
					'ROC plots TPR against FPR; PR plots precision against recall. Both summarize threshold sweeps, but PR highlights positive-prediction quality and depends on prevalence. The PR baseline equals positive prevalence.',
					'Can a high ROC-AUC coexist with poor useful precision?',
				),
				question(
					'Micro vs macro F1?',
					'Micro aggregates counts before computing the metric, favoring frequent classes. Macro averages per-class F1 equally, exposing poor minority performance. State how undefined class metrics are handled.',
					'When would weighted averaging hide a failure?',
				),
				question(
					'How do you handle class imbalance?',
					'Start with correct splits and suitable metrics. Compare class weights, within-fold resampling, threshold changes, and more representative labels. Check calibration and real costs; synthetic examples must never enter validation/test data.',
					'Why is test-set rebalancing often misleading?',
				),
			],
		},
		{
			id: 'validation',
			group: 'learning',
			title: 'Splits & cross-validation',
			story:
				'Practice exams help you choose how to study. The final exam should be opened only after that choice. Repeating the final exam until you like the score turns it into another practice exam.',
			detail:
				'Training fits parameters; validation selects models, thresholds, and hyperparameters; a held-out test estimates the chosen system’s performance. K-fold CV rotates validation partitions. Grouped data needs group splits, time-dependent data needs chronological splits, and nested CV separates tuning from outer-loop evaluation.',
			formula:
				'CV score = (1/K) Σ score(model fitted on K−1 folds, held-out fold)',
			symbols:
				'K is the number of folds. Every transformation is fitted within the training portion. A mean CV score is an estimate, not a guarantee on a shifted deployment population.',
			steps: [
				'Protect: Reserve an appropriate final test partition.',
				'Rotate: Train on K−1 folds and validate on the remaining fold.',
				'Select: Compare candidate settings without using the final test.',
				'Report: Refit the selected pipeline and evaluate once on the test set.',
			],
			code: 'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=7)\nsearch = GridSearchCV(pipeline, parameter_grid, cv=cv)\nsearch.fit(X_train, y_train)\nscore = search.score(X_test, y_test)',
			pitfall:
				'Random splitting can put the same person, near-duplicate, or future information on both sides. Choose the split to resemble the prediction scenario.',
			challenge:
				'Design a split for next-month demand and another for predictions on patients unseen during training.',
			sources: ['validation', 'leakage'],
			check: quiz(
				'Several rows belong to each customer. To evaluate new-customer performance, use…',
				['Random rows', 'Customer groups kept apart', 'The training set'],
				1,
				'Grouping keeps a customer’s information out of both sides of the same evaluation split.',
			),
			interview: [
				question(
					'Why do we need train, validation, and test sets?',
					'They separate parameter fitting, model selection, and final performance estimation. Reusing test feedback for decisions makes it validation data and biases the final estimate.',
					'When would nested CV be useful?',
				),
				question(
					'When should you avoid shuffled K-fold?',
					'When observations are temporally dependent, grouped, duplicated, or spatially correlated in ways relevant to deployment. Use chronological, group, or spatial splits that respect those boundaries.',
					'How do you add a gap for overlapping labels?',
				),
				question(
					'How do you tune hyperparameters efficiently?',
					'Use a leakage-safe pipeline and validation scheme, then start with a small randomized search or informed ranges. Compare budget and variance, log experiments, and keep an untouched final test.',
					'When would Bayesian search be worthwhile?',
				),
				question(
					'What is stratification?',
					'A split strategy preserving approximate class proportions. It helps keep rare classes represented but does not repair dependency, leakage, or a dataset that differs from deployment.',
					'Can stratifying hide variation across folds?',
				),
			],
		},
		{
			id: 'bias',
			group: 'learning',
			title: 'Bias, variance & regularization',
			story:
				'A ruler cannot trace every bend in a road. A loose string can trace every pebble, including noise. A useful model captures the road’s shape without memorizing each pebble.',
			detail:
				'Underfitting often produces poor training and validation results. Overfitting often produces a training-validation gap. Regularization controls model complexity or constrains learning. L1 can create sparse coefficients; L2 shrinks them smoothly. Early stopping selects a checkpoint using validation behavior.',
			formula: 'objective = data loss + λ penalty(weights)',
			symbols:
				'λ controls penalty strength. L1 uses Σ|w|; L2 uses Σw². Bias-variance decomposition is exact under particular squared-error assumptions, not a universal chart for every metric.',
			steps: [
				'Compare: Inspect training and validation performance together.',
				'Diagnose: Look for consistently poor fit or a large generalization gap.',
				'Constrain: Adjust data quality, model complexity, regularization, or training duration.',
				'Validate: Choose the change using held-out evidence rather than training loss alone.',
			],
			code: 'for strength in [0.01, 0.1, 1.0, 10.0]:\n    model = Ridge(alpha=strength)\n    model.fit(X_train, y_train)\n    compare(validation_loss(model), training_loss(model))',
			pitfall:
				'More regularization is not always better. More data does not fix a wrong label or a model unable to represent the required relationship.',
			challenge:
				'Training error is low but validation error is high. List three hypotheses and one experiment to distinguish them.',
			sources: ['linear', 'validation'],
			check: quiz(
				'A large train-validation gap most directly suggests…',
				[
					'Guaranteed high bias',
					'Possible overfitting or a split mismatch',
					'A perfect model',
				],
				1,
				'Overfitting is one explanation; leakage, distribution mismatch, and evaluation bugs also need checking.',
			),
			interview: [
				question(
					'How do you diagnose underfitting vs overfitting?',
					'Compare learning curves and train/validation errors under a trustworthy split. Poor performance on both suggests underfit or poor data; a large gap suggests overfit or distribution differences. Validate hypotheses with controlled changes.',
					'When can a gap be caused by the data split?',
				),
				question(
					'L1 vs L2 regularization?',
					'L1 penalizes absolute weights and can make coefficients exactly zero. L2 penalizes squared weights and shrinks correlated coefficients more smoothly. Scaling and penalty conventions affect the comparison.',
					'Why can L1 select arbitrarily among correlated features?',
				),
				question(
					'How does early stopping work?',
					'Track a held-out validation metric during training and retain the best checkpoint rather than the final one. Patience reduces reactions to noise; using test data to stop leaks selection information.',
					'Which metric should you monitor?',
				),
				question(
					'Does adding data always solve high variance?',
					'Additional representative independent examples can reduce estimation variance. Duplicates, systematic label errors, missing features, or deployment shift can leave the core problem unchanged.',
					'How would learning curves guide data collection?',
				),
			],
		},
		{
			id: 'knn',
			group: 'classical',
			title: 'Nearest neighbors',
			lab: 'knn',
			story:
				'You arrive in an unfamiliar town and ask the nearest few residents where to eat. Their votes become your recommendation. Asking one person is sensitive to a quirky opinion; asking the whole town can drown out local knowledge.',
			detail:
				'K-nearest neighbors stores training examples and predicts using nearby labels or target values. Classification uses a vote; regression averages targets, optionally weighted by distance. The choice of k, feature scaling, and distance defines what nearby means. The synthetic two-dimensional lab exposes that vote; it is not a fitted embedding or a production search index.',
			formula:
				'd(x,z) = √Σ(xᵢ−zᵢ)²; prediction = majority label among k nearest examples',
			symbols:
				'x and z are feature vectors. k is a positive integer chosen on validation data. A distance-weighted vote gives closer examples more influence; exact duplicates need a zero-distance policy.',
			steps: [
				'Prepare: Fit scaling on training data so units do not dominate distance.',
				'Measure: Calculate the new point’s distance from stored examples.',
				'Select: Keep the k closest examples and inspect their labels.',
				'Vote: Combine their labels and validate the choice of k.',
			],
			code: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.neighbors import KNeighborsClassifier\nmodel = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))\nmodel.fit(X_train, y_train)\nprediction = model.predict(X_test)',
			pitfall:
				'Large k smooths local boundaries and may favor a majority class. Distances become less informative in high dimensions; searching many stored points can be expensive at inference.',
			challenge:
				'Move the query near a class boundary, then compare k = 1 with a larger k. Explain which neighbors changed the vote.',
			sources: ['neighbors', 'preprocessing'],
			check: quiz(
				'A distance-based model uses age in years and income in millions. First consider…',
				[
					'Making income even larger',
					'Scaling using training statistics',
					'Choosing k from the test labels',
				],
				1,
				'Distance combines coordinates, so arbitrary units can dominate. Fit any scaler only on training data.',
			),
			interview: [
				question(
					'What changes when k increases?',
					'The prediction becomes smoother and usually less sensitive to individual training examples, often reducing variance while increasing bias. Select k with a deployment-relevant validation split; class imbalance and distance weighting change the tradeoff.',
					'Why is k = 1 vulnerable to label noise?',
				),
				question(
					'Is KNN really a learning algorithm if fitting is cheap?',
					'It is an instance-based method that retains examples rather than estimating a fixed parametric boundary. Most work moves to prediction: computing neighbors, selecting them, and combining their targets.',
					'What are the memory and query-time costs?',
				),
				question(
					'How would you make nearest-neighbor search faster?',
					'Begin with suitable features and exact-search measurements. Tree indexes can help in modest dimensions; approximate indexes trade retrieval recall for latency and memory. Evaluate the resulting task quality as well as neighbor recall.',
					'Why do KD-trees lose their advantage in high dimensions?',
				),
				question(
					'Which distance should you use?',
					'Use a distance aligned with representation and task: Euclidean on sensibly scaled numeric features, cosine for directional embeddings, or a domain-specific metric. Validate it; raw mixed categorical and numeric columns rarely define useful geometry.',
					'How would you treat a zero vector or unseen category?',
				),
			],
		},
		{
			id: 'trees',
			group: 'classical',
			title: 'Decision trees & impurity',
			lab: 'tree',
			story:
				'A helpful librarian asks a sequence of questions: fiction or nonfiction, short or long, mystery or history. Each answer narrows the shelf. A tree learns which question separates its examples most usefully.',
			detail:
				'A decision tree recursively chooses feature thresholds that reduce weighted child impurity. Classification often uses Gini impurity or entropy; regression often minimizes squared error. Leaves predict a class distribution or target average. Greedy local splits do not guarantee the globally best tree. The lab illustrates a single threshold on synthetic examples.',
			formula: 'Gini = 1−Σp_c²; gain = I_parent−(n_L/n)I_L−(n_R/n)I_R',
			symbols:
				'p_c is the fraction of class c in a node. n_L and n_R are child counts; n is their total. I is the chosen impurity measure. A pure node has Gini 0; a balanced binary node has Gini 0.5.',
			steps: [
				'Count: Compute the parent’s class proportions and impurity.',
				'Try: Partition examples using candidate feature thresholds.',
				'Score: Subtract the size-weighted child impurity from the parent’s.',
				'Control: Grow useful splits while limiting depth or leaf size.',
			],
			code: 'from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(max_depth=4, min_samples_leaf=10, random_state=7)\nmodel.fit(X_train, y_train)\nprobabilities = model.predict_proba(X_validation)\nscore = evaluate(y_validation, probabilities)',
			pitfall:
				'A deep tree can memorize isolated examples. Impurity-based importance can favor high-cardinality features and spread importance among correlated ones; it is not a causal explanation.',
			challenge:
				'Move the threshold and count both child groups. Find a split whose weighted child Gini is lower than the parent’s.',
			sources: ['trees'],
			check: quiz(
				'A node contains only one class. Its Gini impurity is…',
				['0', '0.5', '1'],
				0,
				'Its sole class has probability 1, so 1−1² = 0.',
			),
			interview: [
				question(
					'How does a tree choose a split?',
					'It evaluates candidate feature thresholds and selects the largest reduction in size-weighted impurity or regression error. This is greedy optimization at each node, followed by stopping rules or pruning.',
					'Why must child impurities be weighted by sample counts?',
				),
				question(
					'Gini vs entropy?',
					'Both are zero for pure nodes and higher for mixed classes. Gini uses 1 minus squared class probabilities; entropy uses negative summed p log p. They often produce similar trees, but can rank candidate splits differently.',
					'What is information gain?',
				),
				question(
					'Why do trees often need no standard scaling?',
					'A strictly increasing feature transformation preserves ordering and thus equivalent threshold partitions. Scaling does not remove a deep tree’s overfitting risk; implementations and missing-value handling still matter.',
					'Would this reasoning apply to KNN?',
				),
				question(
					'How do you prevent a tree from overfitting?',
					'Tune depth, minimum leaf size, and pruning strength on validation data. Check learning curves and stability across folds. An ensemble can reduce variance, but does not excuse leaking features or bad labels.',
					'Why can a small data change produce a different tree?',
				),
			],
		},
		{
			id: 'ensembles',
			group: 'classical',
			title: 'Bagging, forests & boosting',
			story:
				'Ask several independent surveyors to estimate a building’s height, then average them: that is the spirit of bagging. Alternatively, send each new surveyor to investigate the previous team’s remaining mistakes: that is the spirit of boosting.',
			detail:
				'Bagging trains models on bootstrap resamples and combines their outputs, mainly reducing variance when errors are not perfectly correlated. Random forests also sample features at splits to diversify trees. Gradient boosting adds learners that approximate the negative loss gradient; AdaBoost reweights examples. Boosting is sequential in its model dependence, even if individual training operations can run in parallel.',
			formula:
				'bagging: f(x) = (1/B)Σf_b(x); boosting: F_m(x) = F_(m−1)(x)+ηh_m(x)',
			symbols:
				'B is the number of bagged models. h_m is the next weak learner, m is the boosting round, and η is shrinkage. For squared error, the negative-gradient targets are proportional to residuals.',
			steps: [
				'Baseline: Fit a single tree with a trustworthy evaluation split.',
				'Diversify: Train bootstrap trees and randomize candidate features.',
				'Correct: Alternatively add shallow trees to improve the current ensemble.',
				'Tune: Compare validation quality, calibration, model size, and inference cost.',
			],
			code: 'from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier\nforest = RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=7)\nboosted = HistGradientBoostingClassifier(learning_rate=0.05, max_iter=200)\nfor model in [forest, boosted]:\n    model.fit(X_train, y_train)\n    compare(model, X_validation, y_validation)',
			pitfall:
				'Hundreds of strongly correlated models may add little. Boosting can fit noisy labels, and tuning against an out-of-bag score repeatedly also makes that score part of model selection.',
			challenge:
				'Explain why adding identical copies of one tree does not reduce its errors, then name two ways a random forest creates diversity.',
			sources: ['ensembles', 'validation'],
			check: quiz(
				'Which statement describes gradient boosting?',
				[
					'Every tree is an identical copy',
					'Each added learner improves the current loss',
					'It never needs validation',
				],
				1,
				'Boosting builds an additive predictor by fitting learners to directions that reduce the current objective.',
			),
			interview: [
				question(
					'Bagging vs boosting?',
					'Bagging fits diversified models on resampled data and combines them, commonly reducing variance. Boosting builds an additive model in dependent rounds to reduce an objective. Their bias/variance effects depend on the learners and settings, rather than being absolute guarantees.',
					'Which approach is more naturally parallel across learners?',
				),
				question(
					'Why does a random forest sample features?',
					'It reduces correlation between trees that would otherwise repeatedly use the same dominant predictor. Averaging less-correlated errors can reduce variance, balanced against making each individual tree weaker.',
					'What happens if only one feature is informative?',
				),
				question(
					'What is an out-of-bag estimate?',
					'A bootstrap-trained tree leaves some training rows out. Aggregate only predictions from trees that did not sample a row to form an internal estimate. Grouped or temporal dependencies can still invalidate its interpretation.',
					'Why is it not always a substitute for a future-period test?',
				),
				question(
					'Which gradient-boosting hyperparameters interact?',
					'Learning rate, number of boosting rounds, tree complexity, subsampling, and regularization jointly control fit. Smaller learning rates often need more rounds. Tune with early stopping or cross-validation and check latency as well as the metric.',
					'How would you distinguish too few rounds from noisy-label overfit?',
				),
			],
		},
		{
			id: 'svm',
			group: 'classical',
			title: 'Support vectors & kernels',
			story:
				'Lay the widest possible road between two neighborhoods without driving through the houses. The houses nearest the road constrain its edges. A kernel changes the geometry so a curved separation can look straight in another feature space.',
			detail:
				'A support vector machine balances a large margin with penalties for violations. Support vectors are training points that constrain the solution. Kernels compute feature-space dot products without explicitly building every transformed feature. Linear SVMs are strong sparse-data baselines; nonlinear kernel SVMs can become costly in sample count.',
			formula: 'min ½‖w‖²+CΣ max(0,1−yᵢ(wᵀxᵢ+b)); RBF(x,z)=exp(−γ‖x−z‖²)',
			symbols:
				'Here y is −1 or +1. The hinge term penalizes points within the desired margin or misclassified. C weights violations relative to a wide margin. γ controls how quickly RBF similarity falls with distance.',
			steps: [
				'Scale: Fit comparable numeric feature scales within training folds.',
				'Separate: Seek a boundary that leaves a broad margin.',
				'Soften: Allow violations when they improve the regularized objective.',
				'Kernelize: Compare a nonlinear kernel only if validation justifies its cost.',
			],
			code: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.svm import SVC\nmodel = make_pipeline(StandardScaler(), SVC(C=1.0, kernel="rbf", gamma="scale"))\nmodel.fit(X_train, y_train)\nscores = model.decision_function(X_validation)',
			pitfall:
				'An SVM decision score is not automatically a calibrated probability. Large C or a very local RBF kernel can overfit; unscaled features distort the geometry.',
			challenge:
				'Describe how increasing γ changes the influence of a training point, then predict the risk of combining very large γ and C.',
			sources: ['svm', 'preprocessing'],
			check: quiz(
				'The kernel trick computes…',
				[
					'A feature-space inner product without explicit feature expansion',
					'A guaranteed perfect classifier',
					'A probability calibration curve',
				],
				0,
				'A valid kernel acts as an inner product in a feature space, enabling nonlinear boundaries in the original space.',
			),
			interview: [
				question(
					'What are support vectors?',
					'They are training examples with nonzero coefficients in the dual solution, lying on or violating the margin in a soft-margin SVM. They determine the fitted decision function; removing other points may leave that solution unchanged.',
					'What makes kernel inference expensive?',
				),
				question(
					'How do C and gamma affect an RBF SVM?',
					'C sets the relative penalty for margin violations; gamma sets the locality of similarity. Large values together can form an overly intricate boundary. Tune them jointly after scaling, using only training and validation data.',
					'Why can a tiny gamma underfit?',
				),
				question(
					'What makes a function a valid kernel?',
					'It must define a positive semidefinite Gram matrix for any finite set of inputs, corresponding to an inner product in some feature space. Popular examples include linear, polynomial, and RBF kernels with valid parameters.',
					'Why is arbitrary similarity not necessarily a valid SVM kernel?',
				),
				question(
					'SVM vs logistic regression?',
					'Both can learn linear boundaries with regularization. Logistic regression optimizes log-loss and directly models conditional probability; a linear SVM uses hinge loss and emphasizes margin violations. Compare calibration, sparse-data performance, and compute needs.',
					'How would you obtain usable probabilities from an SVM?',
				),
			],
		},
		{
			id: 'bayes',
			group: 'classical',
			title: 'Naive Bayes & smoothing',
			lab: 'bayes',
			story:
				'A mailroom clerk collects clues: the words prize, invoice, and meeting. Each clue changes the odds of spam. Naive Bayes multiplies those clues as though they were independent once you know the class, even when real words are related.',
			detail:
				'Naive Bayes applies Bayes’ theorem with conditional independence of features given the class. Multinomial NB suits token counts, Bernoulli NB models feature presence, and Gaussian NB assumes class-conditional Gaussian features. The attached alarm lab shows the underlying Bayes update only; it does not train a Naive Bayes text classifier.',
			formula:
				'log score(c) = log P(c)+Σ log P(xᵢ|c); P(word|c) = (count(word,c)+α)/(total_tokens(c)+αV)',
			symbols:
				'c is a class; V is vocabulary size; α>0 adds smoothing to each vocabulary count. The count formula is for multinomial NB. Comparing log scores avoids multiplying many tiny probabilities; normalization is needed for posterior probabilities.',
			steps: [
				'Count: Learn class frequencies and per-class token counts from training documents.',
				'Smooth: Add a small pseudocount so unseen words do not zero a class score.',
				'Accumulate: Sum log-likelihood clues and the log prior for each class.',
				'Decide: Choose the highest score and evaluate on held-out documents.',
			],
			code: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\nmodel = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0))\nmodel.fit(train_texts, train_labels)\npredictions = model.predict(test_texts)',
			pitfall:
				'Conditional independence is not unconditional independence. Correlated clues can be counted repeatedly, making probabilities overconfident even when classification remains useful.',
			challenge:
				'A word has zero observed count in one class. Calculate why unsmoothed multiplication eliminates that class, then explain how α = 1 changes it.',
			sources: ['bayes', 'probability'],
			check: quiz(
				'Why apply additive smoothing in multinomial Naive Bayes?',
				[
					'To guarantee feature independence',
					'To avoid zero likelihood for an unseen token',
					'To use test labels in training',
				],
				1,
				'A positive pseudocount prevents a single unseen token from forcing a class likelihood to zero.',
			),
			interview: [
				question(
					'What is naive about Naive Bayes?',
					'It assumes feature values are conditionally independent given the class, so their likelihood factors into a product. Text violates this through related words, yet the resulting decision rule can still be a useful fast baseline.',
					'Why can class predictions work better than probability estimates?',
				),
				question(
					'What does Laplace smoothing do?',
					'It adds one pseudocount per vocabulary item in multinomial NB and adjusts the denominator by vocabulary size. More generally alpha controls the pseudocount. It prevents zeros and encodes a simple prior; excessive smoothing can wash out evidence.',
					'How should vocabulary be fitted during cross-validation?',
				),
				question(
					'Gaussian, multinomial, or Bernoulli Naive Bayes?',
					'Gaussian NB models continuous features with class-specific Gaussian distributions. Multinomial NB models counts or suitable nonnegative features. Bernoulli NB models binary occurrence and also accounts for absence. Choose according to the feature-generation assumptions.',
					'Why is standardized negative-valued input unsuitable for multinomial NB?',
				),
				question(
					'Why use log probabilities?',
					'A product of many small likelihoods can underflow. Logs convert the product to a sum and preserve the class ordering; normalized posteriors can be computed with a stable log-sum-exp calculation.',
					'How does a changed class prior affect the decision?',
				),
			],
		},
		{
			id: 'clustering',
			group: 'unsupervised',
			title: 'Clustering & hidden structure',
			lab: 'clustering',
			story:
				'At a party, people form groups without wearing team labels. K-means repeatedly chooses meeting spots and asks each guest to join the nearest one. The spots then move to the average location of their guests.',
			detail:
				'K-means alternates nearest-centroid assignments and mean updates to reduce squared Euclidean distance. It favors compact, roughly spherical groups and needs k in advance. DBSCAN connects dense neighborhoods and can mark noise without choosing k. Gaussian mixture models fit probabilistic components with soft memberships. The lab runs deterministic k-means on a small synthetic point cloud.',
			formula:
				'inertia = Σᵢ‖xᵢ−μ_(assignment(i))‖²; μ_k = mean(points assigned to k)',
			symbols:
				'xᵢ is a point and μ_k is centroid k. Each assignment/update cannot increase the k-means objective when performed exactly with a consistent empty-cluster policy. This does not guarantee a global optimum.',
			steps: [
				'Initialize: Choose k starting centroids.',
				'Assign: Attach every point to its closest centroid.',
				'Update: Move each centroid to the mean of its assigned points.',
				'Repeat: Stop when assignments stabilize or a chosen iteration limit is reached.',
			],
			code: 'from sklearn.cluster import KMeans\nscaler = StandardScaler().fit(X_train)\nfeatures = scaler.transform(X_train)\nmodel = KMeans(n_clusters=3, n_init=10, random_state=7)\nlabels = model.fit_predict(features)\ncompare_cluster_stability(features, labels)',
			pitfall:
				'Clusters are geometric patterns, not automatically meaningful categories. Inertia always falls or stays equal as k grows, so it cannot alone choose k. Scaling, initialization, outliers, and varying density matter.',
			challenge:
				'Advance through assignment and update separately. Verify why moving each centroid to its group’s mean reduces or preserves inertia.',
			sources: ['clustering', 'preprocessing'],
			check: quiz(
				'Which method can mark sparse points as noise and find non-spherical dense groups?',
				['Ordinary k-means', 'DBSCAN', 'Linear regression'],
				1,
				'DBSCAN connects sufficiently dense neighborhoods; its radius and minimum-sample settings still need thoughtful selection.',
			),
			interview: [
				question(
					'K-means vs DBSCAN vs a Gaussian mixture?',
					'K-means assigns points to nearest centroids under squared Euclidean distance. DBSCAN finds density-connected regions and noise. GMMs fit a weighted mixture of Gaussian distributions with soft responsibilities, allowing different covariance structures.',
					'What happens with clusters of very different densities?',
				),
				question(
					'How do you choose the number of clusters?',
					'Combine domain usefulness, stability under resampling, internal metrics such as silhouette, and where appropriate likelihood-based criteria for a specified probabilistic model. An elbow is a heuristic; no single score proves true categories exist.',
					'Why is training inertia alone insufficient?',
				),
				question(
					'Why can k-means produce different results each run?',
					'Its alternating optimization can settle at different local optima depending on initial centers. K-means++ and several restarts help, while a fixed random seed supports reproducibility rather than proving correctness.',
					'What is your empty-cluster policy?',
				),
				question(
					'How would you evaluate clustering without labels?',
					'Inspect separation, compactness, stability, and examples within each group, then test whether clusters improve a downstream decision. Avoid inventing semantic labels solely from a two-dimensional plot.',
					'How would noisy or dominant features distort the result?',
				),
			],
		},
		{
			id: 'pca',
			group: 'unsupervised',
			title: 'PCA & dimensionality reduction',
			lab: 'pca',
			story:
				'A long thin cloud casts a clear shadow when the lamp points along its narrow side. PCA rotates the ruler to the direction where that shadow spreads most, keeping the dominant variation with fewer coordinates.',
			detail:
				'Principal component analysis finds orthogonal directions of maximum variance in centered data, commonly using SVD. Keeping the leading components gives the best rank-k linear reconstruction under squared error. Scaling changes which variance counts. The synthetic two-dimensional lab lets you compare candidate projection directions. t-SNE and UMAP are nonlinear visualization tools with different objectives; their plotted distances are not PCA explained variance.',
			formula:
				'X_centered = UΣVᵀ; Z = X_centered V_k; explained ratio_j = λ_j/Σλ',
			symbols:
				'Rows of X are examples. Columns of V are principal directions, Z holds reduced coordinates, and λ_j is covariance eigenvalue j. SVD singular values relate to λ_j by λ_j = σ_j²/(n−1) for sample covariance.',
			steps: [
				'Center: Subtract each training feature’s mean; scale if appropriate.',
				'Rotate: Find orthogonal directions ordered by retained variance.',
				'Project: Express examples using the first k directions.',
				'Validate: Check reconstruction and downstream performance before discarding dimensions.',
			],
			code: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.decomposition import PCA\nreducer = make_pipeline(StandardScaler(), PCA(n_components=0.95))\nZ_train = reducer.fit_transform(X_train)\nZ_test = reducer.transform(X_test)',
			pitfall:
				'High variance need not contain the label signal; a low-variance direction can be predictive. Fitting PCA before splitting leaks data. Separate islands on a t-SNE plot do not prove separate populations.',
			challenge:
				'Rotate the projection axis until projected spread is greatest. Explain why the perpendicular direction retains less variance in this cloud.',
			sources: ['pca', 'algebra', 'leakage'],
			check: quiz(
				'PCA selects directions primarily by…',
				[
					'Correlation with the target label',
					'Variance in the input features',
					'Alphabetical feature order',
				],
				1,
				'Ordinary PCA is unsupervised: it seeks input variance, which may or may not help the prediction task.',
			),
			interview: [
				question(
					'How does PCA work?',
					'Center the training matrix, compute its SVD or covariance eigendecomposition, order orthogonal directions by variance, and project onto the leading directions. Fit the mean and directions only on training data and reuse them at inference.',
					'When should you standardize first?',
				),
				question(
					'PCA vs feature selection?',
					'Feature selection retains original columns; PCA constructs linear combinations. PCA can compress correlated inputs but mixes their meanings and may discard low-variance predictive information. Evaluate the complete downstream pipeline.',
					'What does this imply for interpretability?',
				),
				question(
					'PCA vs t-SNE?',
					'PCA provides a linear projection with a global variance and reconstruction objective. t-SNE optimizes neighborhood similarities for visualization; its clusters, sizes, and large-scale distances need careful interpretation and depend on settings.',
					'Why should you avoid choosing a classifier solely from a t-SNE picture?',
				),
				question(
					'What does 95% explained variance guarantee?',
					'It describes the fraction of input variance retained on the fitted distribution. It does not guarantee 95% predictive accuracy, robustness, or fairness; the discarded directions may matter to the target.',
					'How would distribution shift change the usefulness of the components?',
				),
			],
		},
		{
			id: 'neural',
			group: 'deep',
			title: 'Neurons, layers & activations',
			lab: 'neuron',
			story:
				'A mixing desk combines several audio channels with adjustable volume knobs, then sends the result through an effect. A neuron similarly mixes inputs with weights and applies an activation; layers stack these transformations.',
			detail:
				'A dense layer forms an affine transformation followed by a nonlinear activation. Without nonlinearities, many linear layers collapse to one affine map. ReLU keeps positive values; sigmoid squashes into (0,1); tanh into (−1,1). Hidden activations and output activations serve different roles. The lab evaluates hand-set weights, not a trained neural model.',
			formula: 'z = Σwᵢxᵢ+b; a = φ(z); ReLU(z) = max(0,z)',
			symbols:
				'x is input, w contains learned weights, b is a bias, z is a preactivation, and φ is the activation. A layer with d inputs and h outputs has d×h weights and h biases.',
			steps: [
				'Mix: Multiply each input by its weight and sum the results.',
				'Shift: Add the neuron’s bias.',
				'Activate: Apply a nonlinear function to the preactivation.',
				'Compose: Feed activations to later layers and choose a task-appropriate output.',
			],
			code: 'import torch\nfrom torch import nn\nnetwork = nn.Sequential(nn.Linear(4, 16), nn.ReLU(), nn.Linear(16, 3))\nlogits = network(batch_features)\nloss = nn.CrossEntropyLoss()(logits, class_labels)',
			pitfall:
				'Do not apply softmax before a cross-entropy function that expects logits. Saturated sigmoid units can have tiny gradients; ReLU units can become inactive. More layers are not automatically more useful.',
			challenge:
				'Move the first weight below and above 0.1. Predict when the weighted sum becomes positive and the ReLU gate opens; then check the output.',
			sources: ['training', 'autograd', 'google'],
			check: quiz(
				'Why add nonlinear activations between dense layers?',
				[
					'To make every output a probability',
					'To represent relationships beyond one affine map',
					'To remove the need for training data',
				],
				1,
				'A composition of affine maps is still affine. Nonlinear activations expand what the network can represent.',
			),
			interview: [
				question(
					'Why do neural networks need activations?',
					'Composing affine layers without nonlinearities gives another affine function. Nonlinear activations let the network build richer representations; the right output depends on the objective, such as logits for multiclass cross-entropy.',
					'Would adding biases alone solve this limitation?',
				),
				question(
					'ReLU vs sigmoid vs tanh?',
					'ReLU is simple with derivative one on its positive side, but can become inactive. Sigmoid and tanh saturate, making gradients small at large magnitudes; sigmoid is useful for binary probabilities or gates, and tanh for bounded signed states.',
					'How do initialization and normalization interact with saturation?',
				),
				question(
					'How many parameters are in a dense layer?',
					'For d input features and h output units, the weight matrix has d times h entries and the bias has h, for dh+h total. Batch size changes activation memory but not parameter count.',
					'What is the output shape for a batch of n examples?',
				),
				question(
					'Why can a wider or deeper network still perform badly?',
					'Representation capacity does not ensure useful data, successful optimization, or generalization. Check labels, splits, scale, architecture, learning rate, and regularization; first verify that it can overfit a tiny clean batch.',
					'What does failure to fit that small batch suggest?',
				),
			],
		},
		{
			id: 'backprop',
			group: 'deep',
			title: 'Backpropagation & autograd',
			lab: 'backprop',
			story:
				'A restaurant bill passes through ingredient costs, dishes, and tax. To discover how one ingredient changes the final bill, trace each route through that calculation and multiply the local effects along it. Add effects where routes meet.',
			detail:
				'Backpropagation applies reverse-mode differentiation to a computation graph. The forward pass records operations and computes loss; the reverse pass propagates derivatives using the chain rule. Autograd computes derivatives; the optimizer uses them to change parameters. The lab traces a small scalar graph with chosen values, not training a deep network.',
			formula: 'z = wx+b; L = (z−y)²; ∂L/∂w = 2(z−y)x; ∂L/∂b = 2(z−y)',
			symbols:
				'z is the prediction and y the target in this scalar squared-error example. Multiply upstream derivative 2(z−y) by the local derivative x for w. If w feeds several paths, their contributions add.',
			steps: [
				'Forward: Evaluate intermediate values and the scalar loss.',
				'Seed: Start the reverse pass with ∂L/∂L = 1.',
				'Chain: Multiply local derivatives backward and add shared-path contributions.',
				'Update: Use the gradients in an optimizer step after clearing old gradients.',
			],
			code: 'optimizer.zero_grad()\nprediction = model(features)\nloss = loss_fn(prediction, targets)\nloss.backward()\noptimizer.step()',
			pitfall:
				'PyTorch accumulates gradients by default. Forgetting zero_grad can unintentionally mix updates; calling backward alone does not change weights. Detaching a needed tensor or converting it to a plain number breaks that gradient path.',
			challenge:
				'Use x = 2, w = 1, b = 0, y = 3. Compute loss and both gradients by hand before advancing the graph.',
			sources: ['autograd', 'training'],
			check: quiz(
				'In the scalar example x=2, w=1, b=0, y=3, ∂L/∂w is…',
				['−4', '−2', '4'],
				0,
				'z=2, so 2(z−y)x = 2×(−1)×2 = −4.',
			),
			interview: [
				question(
					'Backpropagation vs gradient descent?',
					'Backpropagation computes parameter gradients efficiently through the chain rule. Gradient descent is an update rule that uses gradients. They are separate: the same backpropagated derivatives can feed SGD, momentum, or Adam.',
					'What exactly changes weights in a PyTorch training loop?',
				),
				question(
					'Why call zero_grad, backward, and step in that order?',
					'Clear accumulated gradients, compute derivatives for the current loss, then update parameters with those derivatives. Accumulating deliberately across microbatches is valid when loss scaling and update frequency are handled consistently.',
					'How do you avoid accidentally accumulating gradients across every batch?',
				),
				question(
					'Why are vanishing and exploding gradients possible?',
					'Along long computation paths, products of Jacobians can shrink or grow rapidly. Saturating activations and recurrent depth can worsen this. Suitable initialization, residual paths, normalization, gated recurrence, or clipping address different parts of the problem.',
					'Does clipping solve vanishing gradients?',
				),
				question(
					'How do you check a custom derivative?',
					'On a small smooth case, compare autograd with centered finite differences in high precision, or use a framework gradient checker. Avoid nondifferentiable points and choose perturbations carefully because numerical cancellation matters.',
					'Why can a check at a ReLU kink be misleading?',
				),
			],
		},
		{
			id: 'optimization',
			group: 'deep',
			title: 'Training, normalization & dropout',
			story:
				'Training a rowing team requires both a direction and a stable rhythm. The optimizer chooses the strokes, normalization steadies internal scales, and dropout makes the team practice without always relying on the same rower.',
			detail:
				'Momentum smooths gradient updates; Adam maintains moving first- and second-moment estimates with bias correction. Batch normalization uses batch statistics during training and typically stored running statistics during evaluation; layer normalization works within each example’s feature dimensions. Dropout randomly removes activations during training. Validation guides early stopping and hyperparameters.',
			formula:
				'momentum: v_t = βv_(t−1)+g_t; θ_t = θ_(t−1)−ηv_t; dropout: ã = m⊙a/(1−p)',
			symbols:
				'g_t is a gradient, v_t its moving accumulator, η the learning rate, and β the momentum coefficient. Each mask entry m is 1 with probability 1−p. In inverted dropout, the scaling preserves expected activation and dropout is disabled at evaluation.',
			steps: [
				'Stabilize: Inspect input scale, initialization, and finite losses.',
				'Optimize: Clear gradients, backpropagate, and make one optimizer update.',
				'Regularize: Validate dropout, weight decay, and early stopping as needed.',
				'Evaluate: Switch to evaluation mode and disable gradient recording for inference.',
			],
			code: 'model.train()\noptimizer.zero_grad()\nloss = loss_fn(model(features), targets)\nloss.backward()\noptimizer.step()\nmodel.eval()\nwith torch.no_grad():\n    predictions = model(validation_features)',
			pitfall:
				'eval() changes modules such as dropout and batch normalization but does not itself disable autograd. no_grad() disables gradient recording but does not change module behavior. They solve different problems.',
			challenge:
				'Explain why repeated evaluation predictions may vary if dropout stays active, then identify both calls needed for ordinary inference.',
			sources: ['training', 'autograd', 'google'],
			check: quiz(
				'Which combination normally fits evaluation/inference?',
				[
					'model.train() with backward()',
					'model.eval() with no_grad()',
					'optimizer.step() without a forward pass',
				],
				1,
				'Evaluation mode controls module behavior; no_grad prevents unnecessary gradient recording.',
			),
			interview: [
				question(
					'SGD with momentum vs Adam?',
					'Momentum accumulates a velocity from gradients. Adam also adapts per-parameter updates using a second-moment estimate and bias corrections. Adam often needs less initial tuning, but validation, memory cost, and final generalization decide the choice.',
					'Why is learning-rate tuning still necessary with Adam?',
				),
				question(
					'Batch normalization vs layer normalization?',
					'Batch normalization uses statistics across a batch and selected spatial dimensions per channel, with train/eval behavior to manage. Layer normalization normalizes selected features within each example and is common in transformers. Their inductive assumptions and small-batch behavior differ.',
					'What happens to batch normalization with tiny or shifted batches?',
				),
				question(
					'How does dropout regularize?',
					'It randomly masks activations during training, discouraging reliance on particular co-adapted paths. Inverted dropout rescales surviving activations so the expected value is preserved. It is disabled for ordinary deterministic evaluation.',
					'Why might heavy dropout cause underfitting?',
				),
				question(
					'Is weight decay always the same as L2 regularization?',
					'For basic SGD under matching conventions, a squared-weight penalty yields a proportional shrinkage term. With adaptive optimizers, adding that penalty to gradients differs from decoupled weight decay such as AdamW.',
					'Which parameters might you exclude from decay, and why?',
				),
			],
		},
		{
			id: 'cnn',
			group: 'deep',
			title: 'Convolutions & image models',
			lab: 'convolution',
			story:
				'Slide a small stencil across a photograph. At each position, it measures the same local pattern, such as an edge. Reusing that stencil lets a model find similar features in different parts of the image.',
			detail:
				'CNNs use local receptive fields and shared kernel weights. Channels combine several learned feature maps; later layers cover a larger receptive field. Stride controls movement and padding controls borders and size. Deep-learning libraries usually implement cross-correlation without flipping the kernel. The lab uses a hand-set filter on a synthetic matrix, not a trained vision model.',
			formula:
				'output_size = floor((N+2P−D(K−1)−1)/S)+1; Y[r,c] = ΣᵢΣⱼ X[r+i,c+j]K[i,j]',
			symbols:
				'N is input size along one axis, P padding, D dilation, K kernel size, and S stride. The displayed sum is a single-channel, stride-1, no-padding cross-correlation. Multi-channel filters also sum over input channels.',
			steps: [
				'Place: Position the kernel over a local input patch.',
				'Multiply: Multiply matching patch and kernel entries.',
				'Sum: Add the products to create one output value.',
				'Slide: Move by the stride and repeat across the image.',
			],
			code: 'from torch import nn\nlayer = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)\nfeatures = layer(images)\nactivated = nn.ReLU()(features)\npooled = nn.AdaptiveAvgPool2d(1)(activated)\nlogits = nn.Linear(16, 10)(pooled.flatten(1))',
			pitfall:
				'Weight sharing creates translation equivariance under suitable conditions, not complete invariance to shifts, rotation, or scale. Padding and stride can change edge behavior; pooling can discard useful detail.',
			challenge:
				'Compute the first output cell by hand. Then calculate the output width for N=7, K=3, P=1, S=2, D=1.',
			sources: ['cnn'],
			check: quiz(
				'For N=7, K=3, P=1, S=2, D=1, the output size is…',
				['3', '4', '7'],
				1,
				'floor((7+2−2−1)/2)+1 = 4.',
			),
			interview: [
				question(
					'Why use a CNN instead of a dense image layer?',
					'Local connectivity and shared filters exploit spatial structure with fewer parameters than a fully connected image layer. They encode useful assumptions for images, but global relationships and task-specific invariances may require other mechanisms.',
					'How does the receptive field grow with depth?',
				),
				question(
					'How many parameters does a convolution have?',
					'With K_h×K_w kernels, C_in input channels, C_out output channels, groups=1, and a bias, the count is K_h K_w C_in C_out + C_out. Input height, width, and batch size do not change it.',
					'What changes for a depthwise convolution?',
				),
				question(
					'Stride vs padding vs dilation?',
					'Stride changes where the kernel is evaluated, often downsampling. Padding adds border values and affects output size. Dilation spaces kernel taps, increasing receptive field without increasing kernel parameter count.',
					'Can padding introduce artifacts near an image border?',
				),
				question(
					'How would you use transfer learning for a small image dataset?',
					'Start with an appropriate pretrained encoder, replace the task head, and use the encoder’s required preprocessing. Compare a frozen encoder with gradual fine-tuning at a smaller rate, using leakage-safe splits and representative augmentation.',
					'Why can augmenting before splitting leak near-duplicate images?',
				),
			],
		},
		{
			id: 'sequences',
			group: 'deep',
			title: 'RNNs, LSTMs & sequence models',
			story:
				'To understand a sentence, you carry a small notebook of what has happened so far. An RNN rewrites that notebook at every word. An LSTM adds gates that decide what to keep, erase, and expose.',
			detail:
				'A recurrent neural network reuses a transition across timesteps to update hidden state. Backpropagation through time differentiates through the unrolled sequence. Long chains can cause vanishing or exploding gradients. LSTMs and GRUs use gates to improve memory flow, while causal convolutions and transformers offer other sequence-processing tradeoffs. Bidirectional models use future context and are unsuitable where that information is unavailable.',
			formula:
				'h_t = tanh(W_x x_t+W_h h_(t−1)+b); LSTM memory: c_t = f_t⊙c_(t−1)+i_t⊙g_t',
			symbols:
				'h_t is hidden state at step t. W_x and W_h are reused across time. In the LSTM memory equation, f is the forget gate, i the input gate, and g candidate content; ⊙ means elementwise multiplication.',
			steps: [
				'Order: Arrange inputs in the sequence order available at prediction time.',
				'Remember: Combine the new input with the previous hidden state.',
				'Gate: In an LSTM or GRU, regulate which information is retained.',
				'Train: Unroll across time, compute a task loss, and propagate derivatives backward.',
			],
			code: 'from torch import nn\nrnn = nn.LSTM(input_size=8, hidden_size=32, batch_first=True)\nsequence_output, (hidden, cell) = rnn(batch_sequences)\nlast_representation = hidden[-1]\nlogits = nn.Linear(32, 2)(last_representation)',
			pitfall:
				'The last padded timestep may not be the last real observation. Handle sequence lengths, masks, and state resets; carrying state across unrelated users can mix information or leak across data splits.',
			challenge:
				'For next-word prediction, explain why a bidirectional encoder that sees the next word would make evaluation misleading.',
			sources: ['rnn', 'autograd'],
			check: quiz(
				'Why is a bidirectional RNN risky for a strictly online prediction task?',
				[
					'It may use future inputs unavailable at prediction time',
					'It cannot have parameters',
					'It never uses hidden state',
				],
				0,
				'Its backward direction sees later positions. Whether that is valid depends on what is available for the actual decision.',
			),
			interview: [
				question(
					'Why do vanilla RNNs struggle with long dependencies?',
					'Gradients pass through repeated state transitions, whose Jacobian products can shrink or grow. The hidden state is also a fixed-size bottleneck. Gated architectures improve memory paths but do not guarantee perfect long-range recall.',
					'How does an LSTM cell provide a more direct gradient path?',
				),
				question(
					'LSTM vs GRU?',
					'An LSTM separates cell memory and hidden output with input, forget, and output gates. A GRU combines its memory/state using update and reset gates, usually with fewer parameters. Compare both under matched data, latency, and validation budgets.',
					'Would you expect either to always outperform the other?',
				),
				question(
					'What is truncated backpropagation through time?',
					'It limits the gradient history to manageable sequence chunks, often carrying state forward while detaching it from older graphs. This reduces memory and compute but prevents direct gradient credit assignment beyond the truncation window.',
					'What happens if you forget to detach a carried state?',
				),
				question(
					'RNN vs transformer for a sequence task?',
					'RNN recurrence processes timesteps sequentially and supports compact streaming state. Transformers use attention for direct token interactions and parallel training across positions, but standard attention has quadratic pairwise cost and a context limit.',
					'How would sequence length and streaming latency affect the choice?',
				),
			],
		},
		{
			id: 'embeddings',
			group: 'language',
			title: 'Tokenization & embeddings',
			lab: 'embeddings',
			story:
				'A library shelf number tells you which book to fetch; it does not say which books mean similar things. Token IDs are shelf numbers. Embeddings give items learned coordinates, so useful relationships can appear in the geometry.',
			detail:
				'Tokenization maps text into a sequence of IDs, often using subword units. An embedding table maps IDs to learned dense vectors. Contextual models then produce different representations for the same token in different sentences. Sentence or document embeddings require an appropriate pooling/training objective. The lab uses hand-set two-dimensional coordinates to illustrate cosine similarity, not vectors from a trained language model.',
			formula:
				'embedding(token_id) = E[token_id]; cosine(u,v) = (uᵀv)/(‖u‖‖v‖)',
			symbols:
				'E has vocabulary_size rows and embedding_dimension columns. Integer IDs have no ordinal semantic distance. Cosine compares nonzero vectors; zero vectors need explicit handling. Similarity depends on the model, training data, and task.',
			steps: [
				'Tokenize: Apply the exact tokenizer associated with the model.',
				'Look up: Fetch each token’s row from the embedding table.',
				'Contextualize: Let the model combine surrounding-token information.',
				'Compare: Use task-appropriate pooled vectors and validate retrieval quality.',
			],
			code: 'tokens = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")\nmodel.eval()\nwith torch.no_grad():\n    hidden = model(**tokens).last_hidden_state\nmask = tokens["attention_mask"].unsqueeze(-1)\npooled = (hidden * mask).sum(1) / mask.sum(1).clamp(min=1)',
			pitfall:
				'Averaging arbitrary token representations does not guarantee a good sentence embedding. Embeddings can encode unwanted bias or private information; using a different tokenizer or preprocessing at inference changes the representation.',
			challenge:
				'Compare two hand-set vectors with high cosine but different lengths. Explain which information normalization discards.',
			sources: ['llm', 'algebra', 'recs'],
			check: quiz(
				'Token ID 200 is twice token ID 100. Does that imply twice the meaning?',
				[
					'Yes, IDs are semantic magnitudes',
					'No, IDs identify vocabulary entries',
					'Only for longer words',
				],
				1,
				'Token IDs are indices into a vocabulary. Their numerical order is not a semantic metric.',
			),
			interview: [
				question(
					'What is an embedding?',
					'A learned numerical representation whose geometry supports a training objective. Token embeddings are lookup-table parameters; contextual embeddings also depend on surrounding input. Similarity is meaningful only relative to the model and task.',
					'Why might the same word need different contextual vectors?',
				),
				question(
					'Why use subword tokenization?',
					'It balances vocabulary size with the ability to represent uncommon words by pieces. It affects sequence length, multilingual coverage, spelling behavior, and cost. Token boundaries need not match words, so count tokens with the actual model tokenizer.',
					'Why can two languages consume different token budgets for the same content?',
				),
				question(
					'How do you build useful sentence embeddings?',
					'Choose an encoder trained for sentence similarity or retrieval, use its prescribed pooling and preprocessing, and evaluate on representative query-document pairs. Contrastive objectives can pull relevant pairs together and push selected negatives apart.',
					'How do false-negative training pairs hurt contrastive learning?',
				),
				question(
					'Cosine vs dot-product retrieval?',
					'Cosine removes vector norm; dot product retains it. They rank identically for unit-normalized vectors. Match the metric to training and index behavior, and evaluate whether magnitude contains signal or introduces popularity bias.',
					'What must change when you replace the embedding model?',
				),
			],
		},
		{
			id: 'attention',
			group: 'language',
			title: 'Queries, keys & attention',
			lab: 'attention',
			story:
				'In a meeting, you ask a question, compare it with the expertise on each person’s name tag, then blend the useful parts of their answers. Queries ask, keys advertise relevance, and values provide content.',
			detail:
				'Scaled dot-product attention compares queries with keys, normalizes scores with softmax, and combines values. Learned projections create Q, K, and V in real models. A causal mask prevents attending to future positions. This lab uses fixed hand-set Q/K/V vectors and computes the actual weights; it does not show learned linguistic attention.',
			formula: 'Attention(Q,K,V) = softmax(QKᵀ/√d_k + mask)V',
			symbols:
				'Each query row produces a distribution over key positions. d_k is key dimension. Softmax is applied across keys; a blocked score is −∞ before softmax. Values may have a different feature dimension from keys.',
			steps: [
				'Compare: Take the selected query’s dot product with each key.',
				'Scale: Divide scores by the square root of key dimension.',
				'Mask: Block disallowed positions, then normalize with softmax.',
				'Blend: Sum value vectors weighted by the normalized scores.',
			],
			code: 'scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.shape[-1])\nscores = scores.masked_fill(blocked_positions, float("-inf"))\nweights = torch.softmax(scores, dim=-1)\noutput = weights @ V',
			pitfall:
				'Attention weights are not a complete causal explanation of a model’s answer. A fully masked row needs handling to avoid undefined softmax. A padding mask and a causal mask solve different constraints.',
			challenge:
				'Select the first query and enable the causal mask. Explain why its only allowed attention weight must become 1.',
			sources: ['attention', 'llm'],
			check: quiz(
				'In causal self-attention, position t may attend to…',
				[
					'Only future positions',
					'Positions up to and including t',
					'Every position without restriction',
				],
				1,
				'The mask blocks keys after t so next-token training cannot use future tokens.',
			),
			interview: [
				question(
					'What are queries, keys, and values?',
					'They are learned projections of token representations. Query-key compatibility determines weights; those weights combine values. In self-attention they come from the same sequence, while cross-attention queries and key/value sources can differ.',
					'What changes in encoder-decoder cross-attention?',
				),
				question(
					'Why divide attention scores by the square root of key dimension?',
					'For roughly independent, similarly scaled components, dot-product variance grows with dimension. Scaling helps keep scores from making softmax excessively peaked at initialization, which can reduce useful gradients.',
					'Is this scaling alone enough to stabilize an entire transformer?',
				),
				question(
					'What does multi-head attention add?',
					'Separate learned projections let heads attend in different representation subspaces. Their outputs are concatenated and projected. Multiple heads expand the interaction patterns; they are not guaranteed to have simple human-readable roles.',
					'How does head dimension affect tensor shapes?',
				),
				question(
					'What is standard attention’s sequence-length cost?',
					'Forming all query-key pairs has O(n²d) arithmetic and a straightforward implementation stores an O(n²) attention matrix per head. Optimized kernels reduce memory traffic or materialization, but exact full attention still evaluates quadratic pairwise interactions.',
					'How do sparse attention and a KV cache address different costs?',
				),
			],
		},
		{
			id: 'transformers',
			group: 'language',
			title: 'Inside a transformer',
			story:
				'Imagine a newsroom. Reporters first exchange relevant notes through attention, then each independently edits their own story with a feed-forward network. Residual paths keep the earlier draft available while repeated layers refine it.',
			detail:
				'A transformer combines attention, position-wise feed-forward layers, residual connections, and normalization. Position information is needed because plain self-attention does not encode sequence order by itself. Encoder models can use bidirectional context; decoder language models use causal attention; encoder-decoder models add cross-attention. Architectures vary in normalization placement, positional encoding, and feed-forward activation.',
			formula:
				'illustrative pre-norm block: H′ = H+MHA(LN(H)); H_next = H′+FFN(LN(H′))',
			symbols:
				'H has token rows and hidden-feature columns. LN is layer normalization, MHA multi-head attention, and FFN a shared per-position feed-forward network. A decoder also applies a causal mask inside MHA. This is a common variant, not the original paper’s exact norm placement.',
			steps: [
				'Represent: Combine token representations with positional information.',
				'Communicate: Use masked or unmasked attention appropriate to the task.',
				'Refine: Apply feed-forward transformations with residual and normalization paths.',
				'Read out: Map final states to class scores, embeddings, or vocabulary logits.',
			],
			code: 'hidden = token_embedding(token_ids) + position_embedding(positions)\nfor block in transformer_blocks:\n    hidden = hidden + block.attention(block.norm1(hidden), causal_mask)\n    hidden = hidden + block.feed_forward(block.norm2(hidden))\nlogits = vocabulary_head(final_norm(hidden))',
			pitfall:
				'Teacher-forced training sees the true earlier tokens while generation feeds back model outputs. Failing to shift labels or apply the causal mask can leak the answer. Position and context-limit behavior vary by model.',
			challenge:
				'Trace a token through one decoder block. Identify which operation mixes positions and which applies the same function independently at each position.',
			sources: ['attention', 'llm'],
			check: quiz(
				'Which part directly mixes information across token positions?',
				[
					'Self-attention',
					'The ordinary position-wise FFN alone',
					'A vocabulary ID lookup alone',
				],
				0,
				'Self-attention combines values from other allowed positions. The ordinary FFN transforms each position separately.',
			),
			interview: [
				question(
					'Encoder-only vs decoder-only vs encoder-decoder?',
					'Encoder-only models typically build bidirectional representations for understanding tasks. Decoder-only models generate causally. Encoder-decoder models encode an input and generate an output with causal self-attention plus cross-attention to that input.',
					'Which would you choose for classification, chat generation, and translation?',
				),
				question(
					'Why does a transformer need position information?',
					'Without positional signals or position-dependent mechanisms, self-attention alone treats inputs as an unordered collection under permutation. Absolute embeddings, relative biases, or rotary mechanisms provide order-sensitive information in different ways.',
					'Does a longer position encoding guarantee good longer-context performance?',
				),
				question(
					'What are residual connections doing?',
					'They add a transformed branch to its input, preserving a direct information and gradient path across layers. Combined with suitable normalization and initialization, they make deep optimization easier; they do not guarantee stable training by themselves.',
					'Why can normalization placement affect optimization?',
				),
				question(
					'What is a KV cache?',
					'During autoregressive decoding, store previous tokens’ keys and values so each new step need not recompute them. This speeds generation at the cost of memory that grows with context, layer count, and key/value dimensions.',
					'Why does caching not remove the need for each new query to attend to past keys?',
				),
			],
		},
		{
			id: 'llms',
			group: 'language',
			title: 'Language-model training & generation',
			story:
				'A very practiced autocomplete system learns how text tends to continue. To answer a question, it continues a conversation-shaped prompt. Fluency comes from learning patterns; it does not make every sentence a verified fact.',
			detail:
				'A causal language model is pretrained to predict the next token from earlier context. Instruction tuning and preference-based training can change how it responds. At inference, a decoder repeatedly chooses a token from vocabulary logits and appends it. Context windows are finite; information within them can still be missed. Retrieval, tools, or abstention can help grounding, but must be evaluated.',
			formula:
				'L = −Σ_t log P_θ(x_t | x_<t); temperature sampling: p_i = softmax(z_i/T)',
			symbols:
				'θ denotes model parameters, x_t the target token, and z_i a vocabulary logit. T>0 changes the sampling distribution; a greedy argmax is a separate decoding choice. Top-p retains a high-probability set whose cumulative mass reaches a threshold.',
			steps: [
				'Pretrain: Learn next-token prediction from a suitable text corpus.',
				'Adapt: Use instruction examples or preferences for desired behavior.',
				'Prefill: Process the prompt under the model’s context and token budget.',
				'Decode: Select a next token, append it, and repeat until a stop condition.',
			],
			code: 'model.eval()\nwith torch.no_grad():\n    for step in range(max_new_tokens):\n        logits = model(token_ids).logits[:, -1, :]\n        next_id = sample_from_logits(logits, temperature=0.7)\n        token_ids = torch.cat([token_ids, next_id[:, None]], dim=1)\n        if all_sequences_finished(token_ids): break',
			pitfall:
				'Lower temperature does not guarantee correctness. A model may produce a plausible unsupported answer, follow harmful instructions embedded in data, or exceed context limits. Measure task-specific quality rather than relying on confident wording.',
			challenge:
				'Distinguish a decoding setting, a model parameter, and an external evidence source. Explain which can add a newly published fact without retraining.',
			sources: ['llm', 'attention', 'rag'],
			check: quiz(
				'Setting a low sampling temperature guarantees…',
				[
					'Verified factual answers',
					'A more concentrated distribution over logits, for T>0',
					'Unlimited context length',
				],
				1,
				'Temperature changes token sampling. It does not verify claims or change the model’s context capacity.',
			),
			interview: [
				question(
					'What is the difference between pretraining and inference?',
					'Pretraining updates parameters to reduce a learning objective across examples. Inference uses fixed parameters to compute outputs, often generating tokens autoregressively. A conversation can change the context without permanently training the model.',
					'How is instruction tuning different from writing a system prompt?',
				),
				question(
					'Why do LLMs hallucinate?',
					'Their training and decoding favor plausible continuations, not guaranteed evidence-backed claims. Missing knowledge, ambiguous prompts, distribution shift, and weak grounding can all contribute. Use representative evaluations, sources, verification, and a path to abstain.',
					'How would you separate retrieval failure from generation failure?',
				),
				question(
					'Temperature vs top-k vs top-p?',
					'Temperature rescales logits before sampling. Top-k limits candidates to a fixed count; top-p uses a variable set reaching a probability-mass threshold. Their interactions affect diversity and determinism, and implementations differ.',
					'Why can greedy decoding still be wrong?',
				),
				question(
					'How do you evaluate an LLM application?',
					'Define task success, unacceptable errors, representative and adversarial cases, groundedness when sources are required, and latency/cost budgets. Combine automated checks with calibrated human review, and validate any model-based judge against humans.',
					'Why is one general language benchmark insufficient?',
				),
			],
		},
		{
			id: 'rag',
			group: 'language',
			title: 'Retrieval-augmented generation',
			story:
				'An open-book exam still needs two skills: finding the right page and writing an answer that faithfully uses it. RAG gives a language model retrieved pages, but a beautiful answer from the wrong page is still wrong.',
			detail:
				'A RAG system ingests documents, preserves metadata and permissions, chunks and indexes content, retrieves candidates, optionally reranks, and supplies relevant evidence to generation. Sparse and dense retrieval can complement each other. Evaluate retrieval separately from answer quality. Retrieved text is untrusted data, so document instructions must not override application rules or authorize tool actions.',
			formula:
				'recall@k = relevant items retrieved in top k / all known relevant items; context → generator → grounded answer',
			symbols:
				'k is the retrieval cutoff. Recall requires a defined relevant set; an incomplete relevance label set limits the estimate. Groundedness asks whether claims are supported by supplied evidence, while correctness asks whether the claims are right.',
			steps: [
				'Index: Chunk versioned documents with source IDs, timestamps, and access metadata.',
				'Retrieve: Apply authorization filters and collect useful candidates.',
				'Ground: Rerank/select evidence and instruct generation to cite or abstain.',
				'Evaluate: Measure retrieval coverage, answer faithfulness, correctness, latency, and cost.',
			],
			code: 'query = normalize_question(user_question)\ncandidates = retrieve(query, allowed_document_ids=user_permissions)\ncontext = rerank_and_select(query, candidates, token_budget=budget)\nanswer = generate_with_evidence(query, context)\nresult = validate_citations_and_support(answer, context)\nreturn result if result.supported else abstain()',
			pitfall:
				'More chunks can dilute the answer or exceed the context budget. A citation can point to a real document while failing to support the claim. Enforce access permissions during retrieval, not only in the final prompt.',
			challenge:
				'A wrong answer cites a document. First test whether the correct passage was retrieved; then test whether the generated claim is entailed by that passage.',
			sources: ['rag', 'llm', 'metrics'],
			check: quiz(
				'The correct supporting passage is absent from the retrieved context. First investigate…',
				[
					'Retrieval coverage and indexing',
					'Only answer tone',
					'Whether the font is large enough',
				],
				0,
				'Generation cannot reliably ground an answer in evidence that the pipeline failed to supply.',
			),
			interview: [
				question(
					'RAG vs fine-tuning?',
					'RAG supplies external evidence at request time, useful for fresh or source-citable knowledge. Fine-tuning changes model behavior or representations through weight updates. They can be combined; neither automatically ensures correctness or enforces permissions.',
					'Which would you use for a weekly changing policy manual?',
				),
				question(
					'How do you choose chunk size?',
					'Preserve semantically coherent passages with enough surrounding context and source metadata, within retrieval and generation budgets. Compare sizes and overlap on labeled queries, measuring retrieval coverage and end-to-end answer quality.',
					'Why might tables or section headings need special handling?',
				),
				question(
					'How do you evaluate a RAG pipeline?',
					'Use representative queries with relevant passages and expected answers. Measure recall/ranking before generation, then answer correctness, claim support, citation validity, abstention, permissions, and latency. Analyze failures by stage rather than tuning every component together.',
					'What if the relevance annotations are incomplete?',
				),
				question(
					'How do you handle prompt injection in retrieved documents?',
					'Treat retrieved content as untrusted evidence, preserve instruction boundaries, constrain tool access, and enforce authorization outside the model. Test malicious documents and sensitive-data cases; a prompt alone is not a complete security boundary.',
					'How would you prevent one tenant’s documents from entering another tenant’s context?',
				),
			],
		},
		{
			id: 'agents',
			group: 'language',
			title: 'Prompts, tools & AI agents',
			story:
				'A new assistant with a to-do list and a toolbox does not guess everything from memory. It reads the instructions, decides whether to use the calculator or the search box, looks at what comes back, and keeps going until the job is done or the time is up. An AI agent is a language model wrapped in that loop.',
			detail:
				'A prompt sets role, rules, examples, and the required output format. Function calling lets the model request a named tool with structured arguments, while ordinary code runs the tool and returns the result. In the ReAct pattern the model alternates reasoning, tool calls, and observations. Context (instructions, history, tool results) must fit the window. Agents need step and cost budgets, permission checks for actions with side effects, and evaluation of both the final answer and the tool trace.',
			formula: 'loop: observe → decide → call tool → read result → repeat until done or budget reached',
			symbols:
				'Prompt: the instructions and examples sent to the model. Tool: code the model may request. Observation: the tool’s returned result. Budget: the maximum steps, tokens, time, or money allowed.',
			steps: [
				'Instruct: State the role, rules, tools, and the exact output format.',
				'Decide: The model chooses an answer or asks for a tool with arguments.',
				'Act: Your code validates the request, runs the tool, and returns the result.',
				'Check: Stop on success or budget limit, then evaluate the answer and the trace.',
			],
			code: 'messages = [system_prompt, user_request]\nfor step in range(MAX_STEPS):\n    reply = llm(messages, tools=TOOLS)\n    if not reply.tool_call:\n        return reply.text\n    check_permission(reply.tool_call)\n    result = run_tool(reply.tool_call)\n    messages += [reply, tool_result(result)]\nreturn escalate_to_human()',
			pitfall:
				'Text returned by a tool or a web page can contain instructions (prompt injection). Treat it as data, validate tool arguments, and require approval before irreversible actions.',
			challenge:
				'Design a refund agent with two tools, lookup_order and issue_refund. Write its step budget, one permission rule, and three test cases including a malicious order note.',
			sources: ['llm', 'rag', 'production'],
			check: quiz(
				'Who should execute a tool the model asks for?',
				[
					'The model itself, with no checks',
					'Your own code, after validating arguments and permissions',
					'Whoever wrote the retrieved document',
				],
				1,
				'The model only proposes a call. Trusted application code validates it, runs it, and returns the result.',
			),
			interview: [
				question(
					'What is an AI agent compared with a single prompt?',
					'A single prompt maps input to output once. An agent runs a loop in which the model chooses actions, tools execute them, and observations feed the next decision. The loop adds capability and new risks: cost, latency, compounding errors, and side effects.',
					'When is a fixed workflow better than an agent?',
				),
				question(
					'How does function calling work?',
					'You describe tools with names and argument schemas. The model returns a structured request instead of prose. Your code validates it, performs the action, and sends the result back as a message for the next turn.',
					'What do you do when the arguments fail validation?',
				),
				question(
					'How do you defend an agent against prompt injection?',
					'Separate instructions from untrusted data, give tools least privilege, validate arguments, require human approval for risky actions, limit what retrieved text can trigger, and test with adversarial inputs.',
					'Why is filtering bad words not enough?',
				),
				question(
					'How would you evaluate an LLM application?',
					'Build a labelled test set from real cases. Use deterministic checks where possible, model-graded or human review for open-ended quality, inspect traces, and track cost and latency. Re-run it on each prompt or model change as a regression suite.',
					'What are the risks of a model grading its own output?',
				),
			],
		},
		{
			id: 'tuning',
			group: 'language',
			title: 'Fine-tuning, LoRA & quantization',
			story:
				'You can give a musician a different score, rehearse a new style, or replace some instrument parts. Prompting changes the instructions, fine-tuning changes learned behavior, and LoRA learns a compact adjustment rather than replacing every large weight matrix.',
			detail:
				'Full fine-tuning updates many or all base-model weights. LoRA freezes a base matrix and learns a low-rank weight update, reducing trainable parameters and optimizer-state requirements. Quantization stores or computes values at lower numerical precision; it is a compression technique, not itself supervised learning. Quantized bases can be combined with adapter training, with implementation-specific memory and quality tradeoffs.',
			formula: 'W_adapted = W_frozen+(α/r)BA; A ∈ ℝ^(r×d_in), B ∈ ℝ^(d_out×r)',
			symbols:
				'r is a chosen low rank and α a scaling hyperparameter. A and B add r(d_in+d_out) trainable values for the adapted matrix rather than d_in×d_out. Other layers, activations, and optimizer states still consume memory.',
			steps: [
				'Define: Identify a measurable behavior gap and compare a prompting or retrieval baseline.',
				'Curate: Prepare representative, deduplicated training examples and an isolated evaluation set.',
				'Adapt: Train selected parameters with an appropriate learning rate and checkpoint policy.',
				'Compare: Evaluate task quality, regressions, privacy, memory, and inference latency.',
			],
			code: 'freeze(base_model)\nadapters = attach_low_rank_updates(base_model, rank=8)\noptimizer = AdamW(adapters.parameters(), lr=learning_rate)\nfor batch in training_batches:\n    optimizer.zero_grad()\n    loss = supervised_loss(base_model, batch)\n    loss.backward()\n    optimizer.step()',
			pitfall:
				'Fine-tuning can memorize sensitive examples or degrade existing capabilities. Lower precision can change outputs. LoRA does not guarantee better quality, and a small adapter file does not imply the full serving system is equally small.',
			challenge:
				'For a 1000×1000 matrix and rank 8, compare the full matrix’s one million weights with the adapter’s 16,000 trainable values.',
			sources: ['lora', 'llm', 'training'],
			check: quiz(
				'Which statement distinguishes quantization from fine-tuning?',
				[
					'Quantization necessarily teaches new facts',
					'Quantization reduces numerical precision; fine-tuning updates learned parameters using data',
					'Both always update every weight',
				],
				1,
				'Quantization changes representation/computation precision. Fine-tuning is learning from examples; the two can be combined.',
			),
			interview: [
				question(
					'How does LoRA reduce adaptation cost?',
					'It freezes selected base weight matrices and learns a low-rank update through two smaller matrices. This cuts trainable parameters and optimizer states, while the base model and activation computation remain. Rank, target modules, and data still require evaluation.',
					'When can adapter weights be merged for inference?',
				),
				question(
					'Fine-tuning vs prompting vs retrieval?',
					'Prompting changes request context, retrieval supplies external evidence, and fine-tuning changes parameters. Choose from an observed failure: task-format or style behavior may benefit from tuning, while fresh facts and source citation often benefit from retrieval.',
					'How would you evaluate a combination rather than assume it is better?',
				),
				question(
					'What is quantization?',
					'It represents values with fewer bits, using scales and sometimes zero points. It can reduce memory and improve supported hardware throughput, with accuracy and numerical tradeoffs. Post-training quantization differs from quantization-aware training.',
					'Why might a smaller model still fail to run faster on a particular device?',
				),
				question(
					'How do you know fine-tuning helped?',
					'Compare against the original model and simpler baselines on held-out representative tasks, including regressions and sensitive-data probes. Keep templates or near-duplicate examples apart, and report quality, cost, and uncertainty rather than training loss alone.',
					'How would you detect catastrophic forgetting or memorization?',
				),
			],
		},
		{
			id: 'generative',
			group: 'generative',
			title: 'VAEs, GANs & diffusion',
			story:
				'Three art students learn differently: one compresses pictures into a sketchbook and reconstructs them, one competes against a critic, and one practices restoring paintings after measured amounts of static are added. These suggest a VAE, a GAN, and a diffusion model.',
			detail:
				'Generative models learn distributions from which new samples can be drawn. A VAE learns an encoder and decoder with a reconstruction term and a latent-distribution regularizer. A GAN trains a generator against a discriminator. Diffusion progressively corrupts data and learns a reverse denoising process. These are different objectives, not interchangeable names for image generation.',
			formula:
				'diffusion: x_t = √ᾱ_t x_0 + √(1−ᾱ_t)ε; noise loss = E‖ε−ε_θ(x_t,t)‖²',
			symbols:
				'x_0 is clean data, ε is sampled Gaussian noise, t a noise level, and ᾱ_t the retained signal fraction from a chosen schedule. ε_θ predicts noise. This is a common simplified DDPM training objective; sampling needs a defined reverse schedule.',
			steps: [
				'Choose: Match a generative family and objective to the data and use case.',
				'Corrupt: For diffusion, sample a timestep and add its scheduled noise.',
				'Learn: Predict noise or another chosen denoising target.',
				'Sample: Start from noise and apply a compatible reverse process to generate data.',
			],
			code: 't = sample_timesteps(batch_size)\nnoise = torch.randn_like(clean_images)\nnoisy = sqrt_alpha_bar[t] * clean_images + sqrt_one_minus_alpha_bar[t] * noise\npredicted_noise = denoiser(noisy, t)\nloss = ((predicted_noise - noise) ** 2).mean()\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()',
			pitfall:
				'Good-looking samples can conceal missing modes, training-data memorization, or poor conditional accuracy. Compare diversity, fidelity, safety, and the actual use case; a single image-quality score cannot settle all of them.',
			challenge:
				'Explain why repeatedly subtracting arbitrary noise is not a valid sampler: identify the learned prediction and schedule that a reverse process needs.',
			sources: ['diffusion', 'llm'],
			check: quiz(
				'Which description matches a GAN?',
				[
					'An adversarial generator-discriminator training setup',
					'A required next-token classifier',
					'Ordinary k-means on image pixels',
				],
				0,
				'GAN training uses a discriminator’s signal to improve a generator, with their objectives coupled adversarially.',
			),
			interview: [
				question(
					'VAE vs GAN vs diffusion?',
					'A VAE optimizes a variational lower bound using reconstruction and latent regularization. A GAN learns through a generator-discriminator game. Diffusion learns to reverse a scheduled corruption process. Compare likelihood formulation, stability, diversity, fidelity, and sampling cost for the task.',
					'Which objectives can hide mode collapse or overly smooth reconstructions?',
				),
				question(
					'What is the VAE reparameterization trick?',
					'Represent a Gaussian latent sample as z = mu + sigma times epsilon, where epsilon is independent standard noise. This moves sampling randomness outside the learned parameters so gradients can flow through mu and sigma in the reconstruction path.',
					'Why does the latent KL term matter?',
				),
				question(
					'What is GAN mode collapse?',
					'The generator produces a limited set of outputs that exploit the current discriminator, failing to cover the data distribution. Inspect diversity and coverage, not just attractive examples; objective, architecture, and training changes can help but require evaluation.',
					'Why might a discriminator score alone miss this failure?',
				),
				question(
					'How does diffusion generation differ from training?',
					'Training often samples a random noise level and learns a denoising target for that level. Sampling begins from noise and applies an iterative reverse procedure, with a chosen schedule and sampler. Faster samplers trade compute against model- and task-specific quality.',
					'Why must conditioning be evaluated for faithfulness rather than appearance alone?',
				),
			],
		},
		{
			id: 'autoencoders',
			group: 'generative',
			title: 'Autoencoders & GANs',
			story:
				'An autoencoder is a game of short notes: look at a drawing, write a tiny note about it, and let a friend redraw the picture from the note alone. A GAN is a different game: a forger paints fakes and a detective tries to spot them, and each gets better by competing.',
			detail:
				'An autoencoder compresses an input through a narrow bottleneck (the code) and reconstructs it, training on reconstruction error without labels. Useful uses include compression, denoising, and anomaly detection, because unusual inputs reconstruct badly. A GAN trains a generator to produce samples and a discriminator to separate real from generated ones. GAN training can be unstable and may miss parts of the data (mode collapse); diffusion models later became a more stable choice for many image tasks.',
			formula: 'AE: minimize ‖x − D(E(x))‖²   GAN: min_G max_D log D(x) + log(1 − D(G(z)))',
			symbols:
				'E is the encoder and D (in the AE) the decoder. z is random noise given to the GAN generator G. In the GAN, D is instead the discriminator that outputs the probability an input is real.',
			steps: [
				'Encode: Squeeze the input into a short code.',
				'Decode: Rebuild the input from that code.',
				'Compare: Measure reconstruction error, or in a GAN ask the detective to score real and fake.',
				'Update: Adjust the networks to reduce the error, or alternate forger and detective updates.',
			],
			code: 'code = encoder(x)\nx_hat = decoder(code)\nloss = mse(x_hat, x)\nloss.backward()\noptimizer.step()',
			pitfall:
				'A bottleneck that is too wide lets the network copy the input and learn nothing useful. A GAN whose detective wins too easily gives the forger no useful signal.',
			challenge:
				'You have thousands of normal machine-sensor readings and almost no failures. Explain how an autoencoder could flag a failure and how you would choose the alert threshold.',
			sources: ['pca', 'training', 'diffusion'],
			check: quiz(
				'How can an autoencoder find anomalies?',
				[
					'Unusual inputs reconstruct poorly',
					'It needs a label for every anomaly',
					'It always outputs a class name',
				],
				0,
				'It learns to rebuild typical inputs. An input unlike the training data tends to have a large reconstruction error.',
			),
			interview: [
				question(
					'How does an autoencoder differ from PCA?',
					'Both compress and reconstruct. PCA is linear and has a closed-form solution. An autoencoder with nonlinear layers can capture curved structure, but needs training, tuning, and has no guaranteed unique solution.',
					'When would PCA be the better first choice?',
				),
				question(
					'Why does the bottleneck matter?',
					'A narrow code forces the model to keep only the most useful structure. Too wide, and it can learn the identity mapping. Denoising or sparsity constraints give extra protection.',
					'How would you pick the code size?',
				),
				question(
					'Explain how a GAN trains.',
					'The generator maps noise to samples; the discriminator scores real and generated samples. They are updated in alternation, so each improves against the other. Training can oscillate or collapse to few modes.',
					'What signs suggest mode collapse?',
				),
				question(
					'How would you use an autoencoder for anomaly detection?',
					'Train on normal data only, compute reconstruction error on validation data, and choose a threshold from the cost of false alarms versus misses. Monitor drift, because the definition of normal changes.',
					'What if some anomalies are in the training data?',
				),
			],
		},
		{
			id: 'rl',
			group: 'generative',
			title: 'Reinforcement learning & rewards',
			story:
				'A maze explorer receives a reward at the exit, not a correct-answer label at each turn. They must try routes, remember what happened, and trade exploring unfamiliar corridors against using the best-known path.',
			detail:
				'Reinforcement learning studies sequential decisions: an agent observes a state, acts, and receives a reward and next state. A policy chooses actions; a value function estimates future return. Q-learning learns action values from a bootstrapped target. Reward design, delayed feedback, exploration, and distribution shifts caused by the policy make RL different from ordinary supervised prediction.',
			formula: 'Q(s,a) ← Q(s,a)+α[r+γ(1−terminal) max_a′ Q(s′,a′)−Q(s,a)]',
			symbols:
				's and a are current state and action, r the next reward, s′ the next state, α the learning rate, and γ the discount. A true terminal state has no future return. An artificial time-limit truncation may require different bootstrapping treatment.',
			steps: [
				'Observe: Define state, available actions, and a reward tied to the intended outcome.',
				'Explore: Sometimes try an action beyond the current best estimate.',
				'Update: Compare the observed reward plus estimated future value with Q(s,a).',
				'Evaluate: Test complete policies over episodes, including safety and reward gaming.',
			],
			code: 'action = epsilon_greedy(Q[state], epsilon)\nnext_state, reward, terminated, truncated, info = env.step(action)\nfuture = 0.0 if terminated else max(Q[next_state])\ntarget = reward + discount * future\nQ[state][action] += learning_rate * (target - Q[state][action])\nstate = next_state\nif terminated or truncated: state, info = env.reset()',
			pitfall:
				'A high reward can reflect exploiting a flawed reward definition. Offline interaction logs may not support actions the learned policy wants to take; unrestricted online exploration can be costly or unsafe.',
			challenge:
				'Set Q(s,a)=2, reward=1, best next Q=4, α=0.5, γ=0.9. Compute the new value, then repeat for a terminal transition.',
			sources: ['rl', 'google'],
			check: quiz(
				'With those values on a nonterminal transition, the new Q is…',
				['2.3', '3.3', '4.6'],
				1,
				'The target is 1+0.9×4=4.6. The update is 2+0.5×(4.6−2)=3.3.',
			),
			interview: [
				question(
					'Supervised learning vs RL?',
					'Supervised learning usually fits labels for provided examples. In RL, actions influence future states and collected data, with rewards that may be delayed. The objective is expected cumulative return, so exploration and credit assignment matter.',
					'When would a contextual bandit be enough?',
				),
				question(
					'What are policy, value, and Q functions?',
					'A policy maps states to action choices or probabilities. A state-value function estimates return under a policy from a state. An action-value function estimates return from taking an action in a state and then following the policy or a specified optimal continuation.',
					'Why is immediate reward different from value?',
				),
				question(
					'Why is Q-learning called off-policy?',
					'Its target uses the best estimated next action regardless of which behavior policy collected the transition. This separates the target policy from the exploratory behavior policy. Coverage and other convergence conditions still matter, especially with function approximation.',
					'How does SARSA’s target differ?',
				),
				question(
					'Exploration vs exploitation?',
					'Exploitation selects the currently best-known action; exploration gathers information that may improve future decisions. Epsilon-greedy is simple, but uncertainty, nonstationarity, and safety constraints affect the right strategy.',
					'How would you detect that the agent is gaming the reward?',
				),
			],
		},
		{
			id: 'recommenders',
			group: 'systems',
			title: 'Recommendation & ranking',
			story:
				'A bookshop cannot ask you to score every book. First the shopkeeper finds a manageable shelf of candidates, then ranks them, and finally avoids recommending five almost identical titles. Retrieval, scoring, and reranking solve those stages.',
			detail:
				'Content-based methods match item/user attributes; collaborative methods learn from interactions. Matrix factorization learns user and item vectors whose dot product predicts preference. Large systems often retrieve candidates cheaply, score them more carefully, and rerank for constraints or diversity. A click is implicit feedback influenced by exposure, not a clean statement of preference.',
			formula:
				'score(user,item) = uᵀv+b_user+b_item; DCG@k = Σ_i (2^rel_i−1)/log₂(i+1)',
			symbols:
				'u and v are learned user/item vectors; b terms are biases. In DCG, i is the rank starting at 1 and rel_i is a relevance grade. NDCG divides by the ideal DCG for the same query/user; handle cases with no relevant items explicitly.',
			steps: [
				'Define: Choose a user outcome and feedback window, including harms and constraints.',
				'Retrieve: Generate a diverse, eligible candidate set from a large catalog.',
				'Rank: Score candidates with user, item, and context features.',
				'Measure: Evaluate temporal ranking quality, coverage, and online outcomes.',
			],
			code: 'candidates = retrieve_candidates(user, limit=500)\neligible = filter_available_and_allowed(candidates, user)\nscores = ranker.predict(features_for(user, eligible))\nranked = sort_by_score(eligible, scores)\nrecommendations = rerank_for_diversity(ranked, limit=10)\nlog_impressions_and_positions(user, recommendations)',
			pitfall:
				'Treating every unclicked item as a true negative confuses non-exposure with dislike. Random interaction splits can leak future behavior; popular items can crowd out new items and create self-reinforcing feedback.',
			challenge:
				'Design a fallback for a new user and a newly added item. State which features exist before either has any clicks.',
			sources: ['recs', 'metrics', 'validation'],
			check: quiz(
				'A new item has no interactions. Which approach can immediately use its description?',
				[
					'Only a user-item ID factorization with no other information',
					'A content-based representation',
					'A future click unavailable today',
				],
				1,
				'Content features can represent a new item before collaborative interaction history exists.',
			),
			interview: [
				question(
					'Content-based vs collaborative filtering?',
					'Content-based methods use descriptive features of users or items. Collaborative filtering learns patterns in interactions, capturing preferences beyond explicit attributes but struggling with sparse histories and cold start. Hybrid systems combine these signals.',
					'How do you avoid over-specializing recommendations?',
				),
				question(
					'Why separate candidate generation and ranking?',
					'Retrieval narrows millions of items using a cheap search, then a richer ranker evaluates hundreds. Reranking applies list-level constraints. Measure candidate recall because a ranker cannot recover an item the retrieval stage discarded.',
					'Where would an approximate nearest-neighbor index fit?',
				),
				question(
					'How do you evaluate recommenders?',
					'Use time-respecting holdouts and ranking metrics such as recall@k and NDCG, with a clearly defined candidate/negative-sampling policy. Also inspect coverage, diversity, cold-start slices, and online user outcomes; offline click prediction alone is incomplete.',
					'How does sampled evaluation differ from ranking the full catalog?',
				),
				question(
					'How do you handle cold start and exposure bias?',
					'Use metadata, contextual signals, onboarding, and carefully controlled exploration for cold start. Log impressions and positions to distinguish unseen items from rejected ones; causal or propensity-based corrections require defensible assumptions and overlap.',
					'Why can pure click optimization favor misleading content?',
				),
			],
		},
		{
			id: 'timeseries',
			group: 'systems',
			title: 'Time series & forecasting',
			story:
				'Forecasting tomorrow’s bakery orders is like driving with only the rear-view mirror. Last week’s Tuesday may help; tomorrow’s actual sales cannot. A good backtest repeatedly stops the clock and asks what you could know then.',
			detail:
				'Time series can contain trend, seasonality, autocorrelation, and changing regimes. Start with naive and seasonal-naive forecasts before complex models. Evaluate by rolling or expanding forecast origins and by the actual required horizon. Lag features and rolling summaries must use past values only; future calendar features may be known, while future weather may itself need forecasting.',
			formula:
				'seasonal-naive: ŷ_(t+h) = latest observed value at the same seasonal position; lag_1(t) = y_(t−1)',
			symbols:
				't is the forecast origin and h the horizon. A seasonal period might be 7 for daily data with a weekly cycle. Prediction intervals concern future observations and depend on forecast assumptions; they are not merely confidence intervals for a mean.',
			steps: [
				'Locate: Define forecast origin, horizon, frequency, and feature publication delays.',
				'Baseline: Compare last-value and seasonal-naive predictions.',
				'Backtest: Train on the past and evaluate later windows without future-derived features.',
				'Diagnose: Inspect errors by horizon and season, and check interval coverage.',
			],
			code: 'data["lag_1"] = data["sales"].shift(1)\ndata["past_mean_7"] = data["sales"].shift(1).rolling(7).mean()\nfor train_index, validation_index in TimeSeriesSplit(n_splits=5).split(data):\n    model.fit(X.iloc[train_index], y.iloc[train_index])\n    prediction = model.predict(X.iloc[validation_index])\n    report_by_horizon(y.iloc[validation_index], prediction)',
			pitfall:
				'The feature snippet fits a sequence of one-step predictions where each previous actual value is available. For a fixed-origin multi-step forecast, later actuals are unavailable: build horizon-specific features or roll predictions forward. Random splits and centered rolling averages leak the future.',
			challenge:
				'You must forecast the next seven days today. Audit every lag used for day seven and identify any that secretly require next week’s actual sales.',
			sources: ['forecast', 'validation', 'leakage'],
			check: quiz(
				'A rolling average used to predict today should ordinarily…',
				[
					'Include tomorrow’s sale',
					'Use only values available before the prediction cutoff',
					'Be fitted on the final test period',
				],
				1,
				'Feature availability follows the forecast origin, including reporting delays. A historical timestamp alone does not prove a value was known then.',
			),
			interview: [
				question(
					'Why avoid random train-test splitting for forecasting?',
					'It lets training use later regimes and can mix overlapping windows, producing an optimistic estimate. Use ordered backtests matching the horizon and data delays, with gaps where overlapping labels or feature windows require them.',
					'When are grouped series and multiple horizons involved?',
				),
				question(
					'ARIMA vs exponential smoothing vs ML?',
					'ARIMA models autocorrelation after suitable differencing, while exponential-smoothing families represent evolving level, trend, and seasonality. ML can exploit lags and exogenous features, including across related series. Choose using representative backtests and simple baselines.',
					'What future exogenous values are actually available?',
				),
				question(
					'What is stationarity?',
					'Weak stationarity means constant mean and variance with autocovariance depending only on lag. Trend or seasonal structure can violate it. Some models assume stationarity after transformations; not every forecasting method requires the raw series to be stationary.',
					'Why can over-differencing be harmful?',
				),
				question(
					'How should you evaluate multi-step forecasts?',
					'Backtest the actual horizons from multiple historical origins and report error by horizon and important slices. Compare suitable baselines and interval coverage. Avoid MAPE when zero or near-zero targets make it undefined or unstable.',
					'What changes between recursive and direct multi-horizon prediction?',
				),
			],
		},
		{
			id: 'production',
			group: 'systems',
			title: 'MLOps, drift & reliable serving',
			story:
				'A model is one engine inside a delivery van. It still needs fuel, road rules, maintenance, and a driver who knows when to stop. A notebook score is only one part of a reliable prediction service.',
			detail:
				'Production ML includes versioned data, feature transformations, models, evaluation, deployment, and monitoring. A data contract specifies schema, units, null policy, freshness, and availability at prediction time. Training-serving skew means the two paths compute different inputs. Data drift changes inputs; concept drift changes the input-target relationship. Drift signals require investigation, not automatic assumptions about quality.',
			formula:
				'data drift: P_train(X) ≠ P_live(X); concept drift: P_train(Y|X) ≠ P_live(Y|X)',
			symbols:
				'X denotes model inputs and Y outcomes. The formulas distinguish distribution changes, which may coexist. Delayed labels mean live predictive performance may lag immediate operational and data-quality monitoring.',
			steps: [
				'Package: Save the model with preprocessing, schema, versions, and evaluation evidence.',
				'Validate: Enforce feature contracts and test offline/online consistency.',
				'Release: Use a staged rollout with health gates and a tested rollback path.',
				'Monitor: Track latency, errors, input quality, predictions, and eventual outcome metrics.',
			],
			code: 'features = build_features(request, as_of=request.timestamp)\nvalidate_contract(features, expected_schema)\nartifact = model_registry.load(approved_version)\nprediction = artifact.pipeline.predict(features)\nlog_prediction(request.id, prediction, approved_version, feature_version)\nreturn apply_decision_policy(prediction)',
			pitfall:
				'A drift alarm does not prove accuracy dropped, and stable input histograms do not prove the model is healthy. Retraining on contaminated, delayed, or feedback-biased labels can make performance worse.',
			challenge:
				'Write a contract for transaction amount: include currency, units, null handling, timestamp semantics, and maximum permitted age.',
			sources: ['production', 'leakage', 'metrics'],
			check: quiz(
				'Live feature distributions have changed. The next justified conclusion is…',
				[
					'Accuracy is definitely zero',
					'Investigate quality and impact with appropriate evidence',
					'Retrain immediately without checks',
				],
				1,
				'Input drift is a signal, not a direct measurement of predictive quality. Check data pipelines, outcomes, and relevant slices.',
			),
			interview: [
				question(
					'What causes training-serving skew?',
					'Different transformation code, feature definitions, time cutoffs, defaults, or dependencies can produce different inputs offline and online. Reuse versioned transformations where feasible and compare logged serving features with point-in-time training reconstruction.',
					'How do you test a feature whose source is eventually consistent?',
				),
				question(
					'Data drift vs concept drift?',
					'Data drift changes the input distribution; concept drift changes the conditional outcome relationship. Either can affect performance, but not every distribution shift is harmful. Use outcomes and task-specific slices when labels arrive.',
					'Can concept drift occur while input distributions look stable?',
				),
				question(
					'What should you monitor in production?',
					'Operational health, input validity/freshness, missingness, prediction distributions, model versions, and delayed task outcomes. Slice metrics by meaningful groups and traffic types, connect alerts to actions, and avoid logging unnecessary sensitive content.',
					'How do you monitor a model with labels delayed by thirty days?',
				),
				question(
					'How do you deploy and roll back a model?',
					'Register a reproducible artifact and evaluation, shadow or canary it where appropriate, compare health and outcome guardrails, and retain the prior compatible model and preprocessing. Test rollback and define what happens when dependencies or feature contracts fail.',
					'Why must model and feature versions roll back together?',
				),
			],
		},
		{
			id: 'responsible',
			group: 'systems',
			title: 'Fairness, privacy & trustworthy evaluation',
			story:
				'A bridge inspection cannot report only the average strength of every beam. One weak section can harm the people who cross there. Model evaluation likewise needs attention to who experiences errors, what data was used, and how failures are handled.',
			detail:
				'Responsible ML starts with the intended use, affected people, data provenance, and possible harms. Compare relevant subgroup errors with uncertainty and adequate sample sizes. Fairness definitions can conflict, especially when base rates differ. Data minimization, access controls, retention limits, and privacy-aware training address different risks. Explanations describe behavior; they do not prove causal correctness or fairness.',
			formula:
				'TPR_g = TP_g/(TP_g+FN_g); equal opportunity asks for comparable TPR across defined groups',
			symbols:
				'g identifies a relevant group. TPR measures positive cases found, while FPR measures false alarms among negatives. Equalized odds considers both. Which criterion is appropriate depends on the decision, harm model, and context; small groups need uncertainty estimates.',
			steps: [
				'Scope: Define intended use, unacceptable harms, and people affected by decisions.',
				'Audit: Check consent/provenance, labels, subgroup coverage, and sensitive-data exposure.',
				'Evaluate: Compare error rates, calibration, robustness, and privacy risks with uncertainty.',
				'Respond: Document limits, add human recourse where needed, and monitor after release.',
			],
			code: 'for group in evaluation_groups:\n    subset = test_data[test_data.group == group]\n    metrics = evaluate_errors_and_calibration(subset)\n    uncertainty = bootstrap_intervals(subset, respect_groups=True)\n    report(group, len(subset), metrics, uncertainty)\nreview_failure_examples_with_domain_experts()',
			pitfall:
				'Removing a sensitive column does not remove correlated proxies or historical inequities. Tiny slices can produce unstable estimates. A privacy claim needs a specified threat model; de-identifying names alone does not guarantee anonymity.',
			challenge:
				'An overall recall of 90% hides recalls of 95% and 50% in two groups. Identify the counts and uncertainty you need before deciding how to respond.',
			sources: ['fairness', 'metrics', 'production'],
			check: quiz(
				'Dropping a sensitive attribute guarantees fairness?',
				[
					'Yes, no proxies can remain',
					'No, proxies and biased labels can remain',
					'Only if training accuracy is high',
				],
				1,
				'Other features can encode group membership, and the data or objective may reflect unequal treatment.',
			),
			interview: [
				question(
					'Which fairness metric should you use?',
					'Start with the decision and harms, then justify relevant criteria such as error-rate parity, opportunity, calibration, or selection rates. Compare uncertainty and intersectional slices. Criteria can conflict, so a universal metric or one aggregate number is inadequate.',
					'How do different base rates complicate simultaneous criteria?',
				),
				question(
					'Does removing protected attributes solve discrimination?',
					'No. Proxies, selection, measurement, and historical labels can still create unequal effects. Sensitive attributes may also be needed under appropriate controls to audit outcomes. Examine the full pipeline and involve domain stakeholders.',
					'How might biased labels make equal measured accuracy misleading?',
				),
				question(
					'What is differential privacy?',
					'It is a formal bound on how much an output distribution can change when one individual’s data is added or removed, with a defined neighboring-dataset relation and privacy budget. DP training typically clips contributions and adds calibrated noise, trading utility for privacy.',
					'Why must repeated releases compose their privacy budgets?',
				),
				question(
					'How do you explain a model responsibly?',
					'Use explanations suited to the audience and verify their fidelity and stability. Distinguish local attribution from global behavior and causal effects; correlated inputs and background-data choices affect feature attributions. Provide actionable recourse only when it is actually valid.',
					'Why is a feature importance plot not proof that a decision is fair?',
				),
			],
		},
		{
			id: 'system-design',
			group: 'systems',
			title: 'ML system-design interview',
			story:
				'An architect starts with who uses the building and what loads it must carry before selecting bricks. In an ML interview, begin with the decision and constraints, then connect the data, model, evaluation, and serving loop.',
			detail:
				'For fraud detection, define when a transaction is scored, the label delay, intervention cost, review capacity, and latency budget. Build point-in-time features, compare rules or logistic regression with stronger tabular models, choose thresholds from business costs, and monitor delayed outcomes. For retrieval, define relevance and permissions, then separate candidate recall, reranking, and answer quality. Explain tradeoffs instead of listing technologies.',
			formula:
				'expected decision cost ≈ C_FP×FP+C_FN×FN+C_review×N_review, subject to latency and capacity constraints',
			symbols:
				'C_FP and C_FN are estimated false-positive and false-negative costs; C_review is a review cost. These may vary by transaction value or user. This simplified cost model is a starting assumption to validate, not a universal business objective.',
			steps: [
				'Clarify: State the user decision, scale, latency, error costs, and available feedback.',
				'Design: Draw data ingestion, point-in-time features, baseline model, serving, and fallback.',
				'Evaluate: Choose temporal/group splits, decision metrics, slices, and offline/online gates.',
				'Operate: Cover versioning, failure modes, monitoring, privacy, retraining, and rollback.',
			],
			code: 'features = point_in_time_features(transaction, cutoff=transaction.timestamp)\nif features.invalid: return safe_fallback(transaction)\nscore = fraud_pipeline.predict_proba(features)[1]\nif score >= block_threshold: return block_with_appeal_path()\nif score >= review_threshold and review_capacity_available(): return queue_review()\nreturn approve_and_log_for_delayed_evaluation()',
			pitfall:
				'If blocked transactions never produce outcome labels, observed labels are selected by the current policy. Ignoring this feedback can make evaluation and retraining misleading. A score threshold also needs a defined fallback when review capacity is exhausted; silently approving every overflow changes the system’s risk.',
			challenge:
				'Give a five-minute fraud-system design. Name one baseline, one leakage trap, one meaningful metric, one label-delay issue, and one rollback trigger.',
			sources: ['production', 'metrics', 'leakage', 'rag'],
			check: quiz(
				'What is the best opening for an ML system-design answer?',
				[
					'Name a large neural architecture immediately',
					'Clarify the decision, data, costs, and constraints',
					'Promise perfect detection',
				],
				1,
				'Requirements determine data, metrics, modeling, and operational tradeoffs. An architecture cannot substitute for them.',
			),
			interview: [
				question(
					'Design a real-time fraud detector.',
					'Clarify loss and latency, label delays, and review capacity. Build leakage-safe transaction and history features, compare a rules/logistic baseline with boosted trees, calibrate cost-aware decisions, and release gradually. Monitor operational failures, delayed fraud outcomes, subgroup impact, and policy-induced label selection.',
					'What happens when the feature store is unavailable?',
				),
				question(
					'Design semantic search over internal documents.',
					'Define relevance, freshness, tenant permissions, and query latency. Ingest versioned chunks with metadata, retrieve with lexical/dense methods, filter authorization, and rerank. Evaluate labeled-query recall and ranking separately from generated answers, then monitor coverage, stale content, and access failures.',
					'How do you rebuild an index when changing embedding models?',
				),
				question(
					'Your offline metric improved but the online outcome worsened. Why?',
					'Check training-serving skew, changed traffic, experiment validity, delayed or selected labels, a metric misaligned with the decision, and feedback loops. Inspect slices and logged features, compare against the previous version, and roll back if guardrails fail.',
					'What evidence would distinguish distribution shift from an implementation bug?',
				),
				question(
					'How do you present system-design tradeoffs clearly?',
					'State assumptions, offer a simple baseline, and connect each added component to a measured need. Compare quality with latency, cost, privacy, and failure recovery. Identify the riskiest unknown and propose an experiment rather than claiming one design is universally best.',
					'What would you intentionally defer in a first release?',
				),
			],
		},
	];
	return { sources, groups, lessons };
})();

if (typeof module !== 'undefined') module.exports = AICourse;
