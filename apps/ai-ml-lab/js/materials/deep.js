'use strict';

Teach.add({
	neural: {
		kid: {
			emoji: '🧠',
			story: 'A neuron is a tiny voter. It listens to a few inputs, gives each a "how much do I care?" weight, adds them up, and says "loud" or "quiet". Put many voters in layers where the next layer listens to the one before, and together they can recognise a cat.',
			say: [
				'Multiply every input by its weight and add them up.',
				'Squash the sum (activation).',
				'Pass the result to the next layer.',
			],
		},
		real: {
			title: 'One neuron, by hand',
			scenario:
				'Inputs x = [1, 2], weights w = [0.6, −0.5], bias b = 0.2. Sum = 0.6×1 + (−0.5)×2 + 0.2 = −0.2. ReLU gives max(0, −0.2) = 0; a sigmoid would give about 0.45.',
			result:
				'Change a weight and the output changes. Learning is just finding the weights that give the right outputs.',
		},
		diagram: {
			type: 'flow',
			title: 'Inside one neuron',
			nodes: [
				['inputs', 'x₁, x₂'],
				['× weights', 'w₁, w₂'],
				['+ bias, add', 'z = Σwx + b'],
				['activation', 'a = f(z)'],
			],
		},
		principle: {
			name: 'Stack simple pieces, add non-linearity',
			rule: 'Without an activation function many layers collapse into one linear layer.',
			why: 'The bend in the activation is what lets layers build curves and complex shapes.',
		},
		design: {
			problem: 'Hand-writing features for every task does not scale.',
			choice: 'Let layers of weighted sums plus activations learn their own features from data.',
			price: 'Needs lots of data and compute, and the learned features are hard to interpret.',
		},
		edges: [
			['Dead ReLU', 'z always negative gives output 0 and no gradient.', 'Lower learning rate, or use leaky ReLU.'],
			['All weights equal', 'Neurons stay identical.', 'Random initialisation.'],
			['Huge inputs', 'Sigmoid saturates.', 'Scale inputs.'],
			['Wrong shapes', 'Matrix sizes mismatch.', 'Print shapes at every layer.'],
		],
		links: [
			['logistic', 'A single sigmoid neuron is logistic regression.'],
			['backprop', 'How the weights learn.'],
			['cnn', 'Neurons that share weights over an image.'],
		],
		lab: {
			read: [
				'Lines carry inputs; thickness follows the weight; the output shows the activation.',
				'Move the first weight to see its effect on the sum.',
			],
			predict: 'What weight makes the neuron output exactly 0 after ReLU?',
		},
	},
	backprop: {
		kid: {
			emoji: '🔗',
			story: 'A line of kids pass a message to the end; the last kid says the wrong word. To fix the game, the teacher walks backwards asking each kid "how much did your whisper change the final word?" and tells each to adjust by that amount. That blame-passing backwards is backpropagation.',
			say: [
				'Forward: pass the input through to get a guess.',
				'Compare the guess with the truth.',
				'Backward: pass the blame to every weight, then nudge.',
			],
		},
		real: {
			title: 'One tiny graph',
			scenario:
				'y = w × x, loss L = (y − t)². With x = 2, w = 1, t = 6: y = 2, L = 16. dL/dy = 2(y − t) = −8, dy/dw = x = 2, so dL/dw = −16. With rate 0.1, w becomes 1 + 1.6 = 2.6.',
			result:
				'The new y = 5.2, closer to 6. The chain rule multiplied the local slopes backwards.',
		},
		diagram: {
			type: 'flow',
			title: 'One training step',
			nodes: [
				['forward', 'compute y and loss'],
				['backward', 'chain rule gives dL/dw'],
				['update', 'w ← w − η · dL/dw'],
			],
			loop: 'repeat for the next batch',
		},
		principle: {
			name: 'Reuse local pieces with the chain rule',
			rule: 'Each operation only needs to know its own slope; multiply them going backwards.',
			why: 'This makes the cost of the whole backward pass about the same as the forward pass.',
		},
		design: {
			problem: 'Millions of weights, each needing its own slope.',
			choice: 'Store forward values, then sweep backwards once, sharing work between weights.',
			price: 'Memory to keep activations, and gradients can vanish or explode in deep stacks.',
		},
		edges: [
			['Vanishing gradient', 'Early layers barely learn.', 'ReLU, residual connections, good init.'],
			['Exploding gradient', 'Loss goes NaN.', 'Gradient clipping, lower rate.'],
			['Forgot to zero gradients', 'Gradients accumulate across steps.', 'Zero them each step.'],
			['Non-differentiable op', 'Gradient is zero or undefined.', 'Use smooth surrogates.'],
		],
		links: [
			['gradient', 'The update rule.'],
			['neural', 'What is being trained.'],
			['optimization', 'Better update rules.'],
		],
		lab: {
			read: [
				'Boxes are operations; forward values go left to right, gradients flow right to left.',
				'The update changes the weight in the direction that lowers the loss.',
			],
			predict: 'If the learning rate is raised from 0.05 to 0.4, what happens to the next prediction?',
		},
	},
	optimization: {
		kid: {
			emoji: '⚙️',
			story: 'Rolling a ball down a bumpy hill is better than walking, because momentum carries you over small bumps. Training tricks do the same: use small groups (batches) to take faster steps, keep momentum, and shrink the step as you get close.',
			say: [
				'Use a mini-batch for a quick, noisy step.',
				'Keep some momentum from earlier steps.',
				'Slow down near the bottom.',
			],
		},
		real: {
			title: 'Why mini-batches',
			scenario:
				'100,000 examples. A full pass for one step takes 100,000 computations. A batch of 100 gives a noisy but useful step in 1/1000 of the time, so you can take 1,000 steps in the time of one full step.',
			result:
				'Noisy steps average out in the right direction. Adam and momentum keep running averages to smooth them.',
		},
		diagram: {
			type: 'bars',
			title: 'What each ingredient adds',
			items: [
				['batch', 70, 'speed'],
				['momentum', 55, 'smoother path'],
				['Adam', 80, 'per-weight step size'],
				['schedule', 45, 'finer end steps'],
			],
			caption: 'Illustrative, not a measurement.',
		},
		principle: {
			name: 'Trade accuracy per step for more steps',
			rule: 'A cheap, slightly wrong gradient used many times beats a perfect one used rarely.',
			why: 'This is the key idea of stochastic gradient descent.',
		},
		design: {
			problem: 'Full-batch gradient descent is slow and gets stuck.',
			choice: 'Use mini-batches, momentum, adaptive step sizes and a learning-rate schedule.',
			price: 'More settings (batch size, β, warm-up) and results can depend on the random seed.',
		},
		edges: [
			['Batch of 1', 'Very noisy.', 'Use a bigger batch.'],
			['Huge batch', 'Poor generalisation, needs a higher learning rate.', 'Scale the learning rate and warm up.'],
			['Learning rate never decays', 'Bounces near the optimum.', 'Use a schedule.'],
			['Different seeds differ', 'One run is not evidence.', 'Repeat and report spread.'],
		],
		links: [
			['gradient', 'The base rule.'],
			['backprop', 'Where gradients come from.'],
			['tuning', 'Same ideas applied to large pretrained models.'],
		],
		lab: {
			read: [
				'Four boxes: batches, momentum, adaptive steps, schedule.',
				'Each narration says what problem that trick fixes.',
			],
			predict: 'Which trick helps when different weights need very different step sizes?',
		},
	},
	cnn: {
		kid: {
			emoji: '🔍',
			story: 'To find a cat in a photo you slide a little magnifying glass over every spot. The same glass (a filter) looks for something simple, like an edge. Many glasses find edges, then shapes made of edges, then ears and whiskers. The same small filter is reused everywhere, which saves a lot of work.',
			say: [
				'Slide a small filter across the picture.',
				'Where the pattern matches, the output is big.',
				'Stack filters to find bigger things.',
			],
		},
		real: {
			title: 'A vertical-edge filter',
			scenario:
				'Filter [−1, 0, 1] on a row [2, 2, 8, 8]. First window [2,2,8]: −2 + 0 + 8 = 6. Second window [2,8,8]: −2 + 0 + 8 = 6. On a flat row [5,5,5]: −5 + 0 + 5 = 0.',
			result:
				'The output is large at a brightness jump (an edge) and zero where nothing changes. (CNN "convolution" does not flip the filter.)',
		},
		diagram: {
			type: 'flow',
			title: 'Image to prediction',
			nodes: [
				['filters', 'find edges'],
				['activation', 'keep strong matches'],
				['pooling', 'shrink, keep the best'],
				['classifier', 'name the object'],
			],
			loop: 'stack several layers for bigger patterns',
		},
		principle: {
			name: 'Share weights across space',
			rule: 'A pattern is the same pattern wherever it appears, so one filter can serve the whole image.',
			why: 'Far fewer parameters than a fully connected layer, and a shifted object is still recognised.',
		},
		design: {
			problem: 'A fully connected layer on a 224×224 image has tens of millions of weights per layer.',
			choice: 'Small local filters reused over every position, followed by pooling to shrink the map.',
			price: 'Assumes nearby pixels matter most; bigger context needs more layers or attention ({{attention}}).',
		},
		edges: [
			['Image edges', 'The filter hangs off the border.', 'Padding.'],
			['Filter bigger than image', 'No valid position.', 'Check sizes.'],
			['Different image size', 'Fixed final layer.', 'Resize or use global pooling.'],
			['Small data', 'Overfits.', 'Augmentation, pretrained model.'],
		],
		links: [
			['neural', 'A filter is a neuron with shared weights.'],
			['backprop', 'Filters are learned the same way.'],
			['transformers', 'Alternative way to see the whole image.'],
		],
		lab: {
			read: [
				'The small grid slides across the image; each window multiplies and sums to one output cell.',
				'Switch between an edge detector and a blur to compare outputs.',
			],
			predict: 'Where will the edge filter output be largest?',
		},
	},
	sequences: {
		kid: {
			emoji: '📜',
			story: 'Reading a sentence, you remember what came before so "it" makes sense later. A recurrent network keeps a small notebook: at every word it reads the new word, looks at its notes, and writes a new version of the notes. The trouble is that after a very long story the early notes fade.',
			say: [
				'Read one item at a time.',
				'Mix it with the notes from before.',
				'Pass the new notes on.',
			],
		},
		real: {
			title: 'A tiny memory',
			scenario:
				'State h starts at 0. Input 1 gives h = 0.5 × 0 + 1 = 1. Input 1 again gives 0.5 × 1 + 1 = 1.5. Input 0 gives 0.75. The first 1 still affects the last state but half as much each step.',
			result:
				'Old information fades by the factor 0.5 per step; after 20 steps it is less than a millionth. This is the vanishing memory problem.',
		},
		diagram: {
			type: 'flow',
			title: 'Unrolled over time',
			nodes: [
				['h₀', 'empty notes'],
				['h₁ = f(h₀, x₁)', ''],
				['h₂ = f(h₁, x₂)', ''],
				['h₃ = f(h₂, x₃)', 'prediction'],
			],
		},
		principle: {
			name: 'State carries the past',
			rule: 'A compact state passed forward lets a model use earlier inputs without storing them all.',
			why: 'It is memory-efficient, but forcing everything through one state limits how far back it can see, which is why attention replaced it.',
		},
		design: {
			problem: 'Order matters in language, audio and time series, and the length varies.',
			choice: 'Apply the same function at every step, carrying a hidden state forward (LSTM and GRU add gates).',
			price: 'Steps must run one at a time (slow to train), and long-range memory fades.',
		},
		edges: [
			['Empty sequence', 'No steps.', 'Return the initial state.'],
			['Very long input', 'Early info lost.', 'Gates or attention.'],
			['Different lengths', 'Batching needs equal lengths.', 'Pad and mask.'],
			['Exploding recurrence', 'Large weights blow up the state.', 'Gradient clipping.'],
		],
		links: [
			['attention', 'Looks at every earlier item directly.'],
			['backprop', 'Backprop through time.'],
			['timeseries', 'Where sequences meet forecasting.'],
		],
		lab: {
			read: [
				'Four boxes: read, update the notes, pass on, predict.',
				'Notice how the old information is multiplied down at each step.',
			],
			predict: 'After 10 steps, how much of the first input is left if the carry factor is 0.5?',
		},
	},
});
