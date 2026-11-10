'use strict';

// Mirrors roadmap.sh/machine-learning and roadmap.sh/ai-engineer (checked 10 Nov 2026).
// [label, lessonId | null, why-not-a-lesson]
Teach.setRoadmap({
	title: 'Your path through AI & machine learning',
	intro:
		'Follow the stages in order. Each chip opens the lesson that teaches it. Topics follow the community roadmaps at',
	source: 'roadmap.sh (Machine Learning, AI Engineer)',
	url: 'https://roadmap.sh/machine-learning',
	stages: [
		{
			title: 'Big picture',
			topics: [
				['What is ML?', 'ai-map'],
				['Supervised, unsupervised, semi-/self-supervised', 'ai-map'],
				['Reinforcement learning', 'rl'],
			],
		},
		{
			title: 'Maths foundations',
			topics: [
				['Linear algebra: vectors, matrices', 'vectors'],
				['Probability & Bayes', 'probability'],
				['Calculus: derivatives, chain rule, gradient', 'gradient'],
				['Descriptive & inferential statistics', 'probability'],
				['SVD, eigenvalues', 'pca'],
			],
		},
		{
			title: 'Python & data tools',
			topics: [
				['Python basics', null, 'Prerequisite'],
				['NumPy, Pandas', null, 'Prerequisite; the lessons show the ideas in short Python'],
				['Matplotlib, Seaborn', null, 'Prerequisite'],
				['SQL & databases', null, 'Outside this guide'],
				['Data cleaning & scaling', 'data'],
				['Feature engineering & selection', 'data'],
				['Train / test split', 'validation'],
			],
		},
		{
			title: 'Supervised learning',
			topics: [
				['Linear & polynomial regression', 'regression'],
				['Ridge, Lasso, ElasticNet', 'bias'],
				['Logistic regression', 'logistic'],
				['K-nearest neighbours', 'knn'],
				['Decision trees', 'trees'],
				['Random forest & gradient boosting', 'ensembles'],
				['Support vector machines', 'svm'],
				['Naive Bayes', 'bayes'],
				['Gradient descent', 'gradient'],
			],
		},
		{
			title: 'Unsupervised learning',
			topics: [
				['Clustering (k-means, hierarchical)', 'clustering'],
				['Dimensionality reduction (PCA)', 'pca'],
				['Autoencoders', 'autoencoders'],
			],
		},
		{
			title: 'Model evaluation',
			topics: [
				['Accuracy, precision, recall, F1', 'metrics'],
				['Confusion matrix, ROC-AUC, log loss', 'metrics'],
				['K-fold and leave-one-out validation', 'validation'],
				['Bias, variance, overfitting', 'bias'],
			],
		},
		{
			title: 'Deep learning',
			topics: [
				['Perceptron & multi-layer networks', 'neural'],
				['Forward & back propagation', 'backprop'],
				['Optimisers & training tricks', 'optimization'],
				['Convolutional networks', 'cnn'],
				['RNN, LSTM, GRU', 'sequences'],
				['Autoencoders & GANs', 'autoencoders'],
				['TensorFlow, Keras, PyTorch', null, 'Frameworks; code here is framework-neutral'],
			],
		},
		{
			title: 'Language & transformers',
			topics: [
				['Tokenisation & embeddings', 'embeddings'],
				['Attention & self-attention', 'attention'],
				['Transformers', 'transformers'],
				['Large language models', 'llms'],
			],
		},
		{
			title: 'Building with LLMs (AI engineer)',
			topics: [
				['Retrieval-augmented generation, vector search', 'rag'],
				['Prompt engineering & structured output', 'agents'],
				['Function calling, AI agents, MCP', 'agents'],
				['LLM evaluation & guardrails', 'agents'],
				['Fine-tuning, LoRA', 'tuning'],
				['Diffusion & image generation', 'generative'],
			],
		},
		{
			title: 'Applications & real world',
			topics: [
				['Recommender systems', 'recommenders'],
				['Time-series forecasting', 'timeseries'],
				['Deploy, monitor, MLOps', 'production'],
				['Fairness, safety, explainability', 'responsible'],
				['ML system design', 'system-design'],
				['Image segmentation, video, speech', null, 'Specialised; start from the CNN lesson'],
			],
		},
	],
});
