'use strict';

Teach.add({
	generative: {
		kid: {
			emoji: '🖼️',
			story: 'Take a clear photo and sprinkle more and more snow on it until it is just static. Now teach a helper to wipe away a tiny bit of snow at a time. Start from pure static and let the helper clean it step by step, and a brand-new picture appears. That is diffusion.',
			say: [
				'Add noise to real pictures a little at a time.',
				'Teach a model to guess the noise that was added.',
				'To make something new, start with noise and remove it step by step.',
			],
		},
		real: {
			title: 'One training example',
			scenario:
				'Take a clean value x₀ = 1.0. Pick a noise level where signal weight is 0.8 and noise weight is 0.6, and sample noise ε = 0.5. The noisy value is 0.8 × 1.0 + 0.6 × 0.5 = 1.1. The model is trained to predict ε = 0.5 from 1.1 and the noise level.',
			result:
				'If it predicts 0.5 it can subtract the noise exactly. At generation it does this repeatedly from pure noise.',
		},
		diagram: {
			type: 'flow',
			title: 'Forward noise, backward cleaning',
			nodes: [
				['clean', 'x₀'],
				['add noise', 'x_t = a·x₀ + b·ε'],
				['predict ε', 'model learns this'],
				['denoise', 'step back toward x₀'],
			],
		},
		principle: {
			name: 'Turn a hard task into many easy ones',
			rule: 'Predicting a whole image is hard; removing a little noise is easy.',
			why: 'Many small, well-defined steps are more stable to train than one giant leap.',
		},
		design: {
			problem: 'Directly generating realistic images or audio is unstable.',
			choice: 'Learn to reverse a gradual noising process, optionally guided by a text prompt.',
			price: 'Many steps make sampling slow, and outputs can reflect biases or copy training data.',
		},
		edges: [
			['Too few steps', 'Blurry or noisy outputs.', 'More steps or faster samplers.'],
			['Strong guidance', 'Over-saturated, less diverse.', 'Moderate guidance scale.'],
			['Prompt ambiguity', 'Unexpected results.', 'Be specific.'],
			['Training data issues', 'Copyright, bias.', 'Audit data ({{responsible}}).'],
		],
		links: [
			['neural', 'The denoiser is a neural network.'],
			['llms', 'Both generate step by step: tokens vs noise levels.'],
			['responsible', 'Risks of generated content.'],
		],
		lab: {
			read: [
				'Four boxes: clean, noise, predict, denoise.',
				'The narration shows the numbers for one training example.',
			],
			predict: 'If the model predicts the noise perfectly, what is recovered?',
		},
	},
	rl: {
		kid: {
			emoji: '🎮',
			story: 'Teach a puppy a trick with treats. The puppy tries things; good actions earn a treat now or later; it learns which actions lead to treats. Reinforcement learning does the same: try, get a reward, remember which choices were worth it, including choices that only pay off later.',
			say: [
				'Try an action.',
				'See the reward and the new situation.',
				'Update your belief about how good that action was.',
			],
		},
		real: {
			title: 'One Q-learning update',
			scenario:
				'Q(s,a) = 2. Reward r = 1. Best Q in the next state = 4. Discount γ = 0.9, learning rate α = 0.5. Target = 1 + 0.9 × 4 = 4.6. New Q = 2 + 0.5 × (4.6 − 2) = 3.3.',
			result:
				'The estimate moved halfway toward the target. At a true terminal state the target is only the reward (1), so Q becomes 1.5.',
		},
		diagram: {
			type: 'flow',
			title: 'The RL loop',
			nodes: [
				['state', 'what the agent sees'],
				['action', 'explore or exploit'],
				['reward + next state', 'what happened'],
				['update', 'move Q toward the target'],
			],
			loop: 'repeat for many episodes',
		},
		principle: {
			name: 'Balance exploring and exploiting',
			rule: 'Use what works, but keep trying new things in case something is better.',
			why: 'Always exploiting locks in early guesses; always exploring never cashes in.',
		},
		design: {
			problem: 'No labelled answers; only delayed rewards.',
			choice: 'Estimate the long-term value of actions and improve the policy using the Bellman target.',
			price: 'Needs many samples, can be unsafe to explore in the real world, and badly written rewards get exploited.',
		},
		edges: [
			['Terminal state', 'No next state value.', 'Use only the reward.'],
			['γ = 0 or 1', 'Greedy for now or infinite horizon.', 'Choose by the task.'],
			['Sparse rewards', 'Nothing to learn from.', 'Reward shaping, curiosity.'],
			['Reward hacking', 'Agent finds a loophole.', 'Test the reward adversarially.'],
			['Large state space', 'Table too big.', 'Function approximation.'],
		],
		links: [
			['gradient', 'Deep RL uses gradients.'],
			['recommenders', 'Bandit-style choices.'],
			['responsible', 'Safe exploration.'],
		],
		lab: {
			read: [
				'Four boxes: state, action, reward, update.',
				'The narration works through the Q-value arithmetic.',
			],
			predict: 'If α = 1, what is the new Q in the example?',
		},
	},
	autoencoders: {
		kid: {
			emoji: '✂️',
			story: 'Autoencoder: look at a drawing, write a very short note about it, then ask a friend to redraw it using only the note. If the redraw looks right, your note kept what mattered. GAN: a forger paints fake pictures and a detective tries to catch them. Each round the forger gets sneakier and the detective gets sharper.',
			say: [
				'Squeeze the picture into a tiny note.',
				'Redraw it from the note and see how close it is.',
				'Or: let a forger and a detective practise against each other.',
			],
		},
		real: {
			title: 'Spotting a broken machine',
			scenario:
				'Train an autoencoder only on normal sensor readings. For a normal reading [1, 0, 1, 0] it rebuilds [0.9, 0.1, 0.8, 0.2]: error 0.10. A failing machine sends [0, 1, 1, 1]; the network, never having seen this pattern, rebuilds [0.5, 0.4, 0.7, 0.6]: error 0.25 + 0.36 + 0.09 + 0.16 = 0.86.',
			result:
				'Set an alert threshold between the typical error (about 0.1) and the failure error (about 0.9) from the cost of false alarms and misses. No failure labels were needed.',
		},
		diagram: {
			type: 'flow',
			title: 'Autoencoder',
			nodes: [
				['input', '4 numbers'],
				['encoder', 'squeeze'],
				['code', '2 numbers (bottleneck)'],
				['decoder', 'rebuild 4 numbers'],
				['compare', 'error = how far from the input'],
			],
		},
		principle: {
			name: 'A bottleneck forces understanding',
			rule: 'Make the middle narrower than the input so the network must keep only what matters.',
			why: 'If the middle is as wide as the input, copying is free and nothing useful is learned.',
		},
		design: {
			problem: 'Labels are expensive, but we still want a compact summary or a way to detect odd inputs.',
			choice: 'Train a network to reproduce its own input through a narrow code (no labels), or train two networks against each other (GAN) to generate realistic samples.',
			price: 'Reconstruction can be blurry, thresholds need tuning, and GANs are unstable and can miss parts of the data (mode collapse).',
		},
		edges: [
			['Code too wide', 'Network copies the input.', 'Shrink the code, add noise or sparsity.'],
			['Anomalies in training data', 'Model learns to rebuild them too.', 'Clean the data or use robust loss.'],
			['Drift in "normal"', 'Error rises for good inputs.', 'Monitor and retrain ({{production}}).'],
			['Detective too strong (GAN)', 'Forger gets no useful signal.', 'Balance the updates.'],
			['Mode collapse', 'Forger makes only a few kinds of sample.', 'Check diversity, change the loss, or use diffusion ({{generative}}).'],
		],
		links: [
			['pca', 'The linear version of compress-and-rebuild.'],
			['generative', 'Diffusion, the other way to generate.'],
			['backprop', 'How both networks learn.'],
		],
		lab: {
			read: [
				'Four boxes: encode, decode, compare, update.',
				'Notice that the error number is what training tries to lower.',
			],
			predict: 'What happens to the reconstruction error for an input unlike anything in training?',
		},
	},
});
