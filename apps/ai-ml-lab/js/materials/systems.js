'use strict';

Teach.add({
	recommenders: {
		kid: {
			emoji: '🍿',
			story: 'A friend who knows your taste says, "People who liked the same movies as you also loved this one." That is a recommender: find people or items similar to you, and suggest what they liked that you have not seen. First pick a few hundred candidates, then rank them carefully.',
			say: [
				'Find lots of possible things you might like (retrieval).',
				'Score them carefully (ranking).',
				'Hide what you have already seen and make the list varied.',
			],
		},
		real: {
			title: 'Two-stage pipeline',
			scenario:
				'A catalogue has 1,000,000 videos. Stage 1 picks 500 candidates by embedding similarity (fast). Stage 2 scores those 500 with a richer model. The top 10 are shown, after removing items already watched.',
			result:
				'Scoring all one million with the heavy model would be too slow, and showing only similar items would trap the user in a bubble.',
		},
		diagram: {
			type: 'flow',
			title: 'Funnel',
			nodes: [
				['1,000,000 items', 'catalogue'],
				['500 candidates', 'fast retrieval'],
				['50 ranked', 'accurate model'],
				['10 shown', 'filter, diversify'],
			],
		},
		principle: {
			name: 'Cheap first, careful second',
			rule: 'Use a fast rough filter to shrink the problem, then spend compute only on what is left.',
			why: 'This is how any large-scale search is made affordable.',
		},
		design: {
			problem: 'You must pick a few items out of millions in milliseconds.',
			choice: 'A candidate-generation stage followed by a ranking stage, with business filters at the end.',
			price: 'A miss in stage 1 is unrecoverable; feedback loops can narrow what users see.',
		},
		edges: [
			['New user (cold start)', 'No history.', 'Popular items, ask preferences.'],
			['New item', 'No interactions.', 'Use content features.'],
			['Popularity bias', 'Only hits are shown.', 'Diversity, exploration.'],
			['Feedback loop', 'Shown items get clicks, then are shown more.', 'Randomise some slots.'],
		],
		links: [
			['embeddings', 'Items and users as vectors.'],
			['vectors', 'Similarity.'],
			['rl', 'Exploration vs exploitation.'],
		],
		lab: {
			read: [
				'Four boxes: candidates, ranking, filters, display.',
				'See how the list shrinks at each stage.',
			],
			predict: 'Where would a new, unseen item be lost?',
		},
	},
	timeseries: {
		kid: {
			emoji: '📈',
			story: 'To guess tomorrow\'s weather, a cheap trick is "it will be like the same day last week". Time data has order, so you must never use tomorrow to predict yesterday. Always test by pretending you are standing in the past and predicting what comes next.',
			say: [
				'Order matters: past before future.',
				'Start with a simple "same as last week" guess.',
				'Only use facts you would know at that moment.',
			],
		},
		real: {
			title: 'Seasonal-naive forecast',
			scenario:
				'Daily sales last week: Mon 20, Tue 22, Wed 25, Thu 24, Fri 30, Sat 40, Sun 35. Forecast for next Saturday: 40. If this Saturday turned out 44, the error is 4.',
			result:
				'A fancy model must beat this baseline in a rolling-origin test, not a shuffled split, to be worth using.',
		},
		diagram: {
			type: 'flow',
			title: 'Rolling backtest',
			nodes: [
				['train on weeks 1-4', 'predict week 5'],
				['train on weeks 1-5', 'predict week 6'],
				['train on weeks 1-6', 'predict week 7'],
				['average errors', 'honest estimate'],
			],
		},
		principle: {
			name: 'Never train on the future',
			rule: 'Every training example and feature must exist before the time you predict.',
			why: 'A shuffled split lets the model see tomorrow while predicting today, which inflates scores.',
		},
		design: {
			problem: 'Observations depend on time, trend and season, and are not independent.',
			choice: 'Chronological splits, a simple baseline first, and features computed up to the forecast origin.',
			price: 'Less data per fold and slower evaluation.',
		},
		edges: [
			['Holidays / events', 'Break weekly patterns.', 'Add calendar features.'],
			['Missing timestamps', 'Gaps misalign lags.', 'Reindex and fill carefully.'],
			['Changing trend', 'Old patterns stop applying.', 'Retrain and monitor.'],
			['Future features', 'Using data not yet known.', 'Compute at the forecast origin.'],
			['Time zones / DST', 'Duplicate or missing hours.', 'Use UTC.'],
		],
		links: [
			['validation', 'The split rule for time data.'],
			['sequences', 'Models for ordered data.'],
			['production', 'Drift when patterns change.'],
		],
		lab: {
			read: [
				'Four boxes: baseline, features, backtest, monitor.',
				'Narration shows the calculation for one forecast.',
			],
			predict: 'Why would a random train/test split give a better score than reality?',
		},
	},
	production: {
		kid: {
			emoji: '🚀',
			story: 'A cake that tasted great in your kitchen can fail at the party if you used a different oven. A model that worked in a notebook can fail in the real app if it sees different inputs, gets slow, or the world changes. You need to measure it while it runs, not just before.',
			say: [
				'Make training and live code compute features the same way.',
				'Watch the inputs and the results.',
				'Have a safe fallback.',
			],
		},
		real: {
			title: 'Training–serving mismatch',
			scenario:
				'During training "days_since_signup" was computed in days. In the live service a developer computed it in hours. Every prediction is made on numbers 24 times too large, and nothing crashes.',
			result:
				'A model with a perfect offline score now gives bad answers silently. Logging inputs and comparing them against the training distribution reveals it.',
		},
		diagram: {
			type: 'flow',
			title: 'Safe rollout',
			nodes: [
				['offline eval', 'beats the baseline'],
				['shadow / canary', 'small traffic, no risk'],
				['monitor', 'inputs, outputs, latency'],
				['rollback or retrain', 'when it drifts'],
			],
		},
		principle: {
			name: 'Treat the model as a living service',
			rule: 'A deployed model is code plus data that both change; version, monitor and be able to roll back.',
			why: 'Most production failures are data and integration issues, not algorithm choices.',
		},
		design: {
			problem: 'Offline accuracy does not guarantee a working product.',
			choice: 'Shared feature code, versioned models and data, staged rollout, monitoring and alerts.',
			price: 'Engineering effort, and delayed labels make quality hard to measure live.',
		},
		edges: [
			['Data drift', 'Inputs change over time.', 'Monitor distributions.'],
			['Missing feature', 'Upstream outage.', 'Defaults and alerts.'],
			['Latency spike', 'Slow model.', 'Timeouts and fallback.'],
			['Delayed labels', 'Cannot compute accuracy today.', 'Use proxy metrics and later back-fill.'],
			['Bad release', 'Quality drops.', 'Rollback.'],
		],
		links: [
			['data', 'Same preprocessing at serving time.'],
			['system-design', 'Where it fits in the whole design.'],
			['responsible', 'Monitoring for harm, not only accuracy.'],
		],
		lab: {
			read: [
				'Four boxes trace the path from a notebook to a monitored service.',
				'Narration names the failure each step guards against.',
			],
			predict: 'Which step would catch the "days vs hours" bug?',
		},
	},
	responsible: {
		kid: {
			emoji: '⚖️',
			story: 'A game must be fair to everyone who plays. A model learns from past data, and if the past was unfair the model can copy that unfairness quickly and at scale. We check how it treats different groups and ask what should happen when it is wrong.',
			say: [
				'Check results for different groups.',
				'Ask who is hurt by each kind of mistake.',
				'Keep a human in the loop for big decisions.',
			],
		},
		real: {
			title: 'Equal rates, unequal outcomes',
			scenario:
				'A loan model approves 40% of group A and 40% of group B, so the approval rates match. But among people who would repay, it approves 80% of group A and only 50% of group B.',
			result:
				'One fairness number was satisfied while another was badly broken. Different fairness definitions can conflict, so you must choose deliberately with the people affected.',
		},
		diagram: {
			type: 'compare',
			title: 'Two common definitions',
			left: ['Equal approval rates', ['same % approved in each group', 'ignores who qualifies']],
			right: ['Equal opportunity', ['same % of qualified people approved', 'needs reliable ground truth']],
		},
		principle: {
			name: 'No single fairness number is enough',
			rule: 'Pick the definition from the harm you want to avoid, report per-group results, and keep it under review.',
			why: 'Metrics cannot replace judgement about people, context and consequences.',
		},
		design: {
			problem: 'Models amplify patterns in biased data and operate at scale.',
			choice: 'Slice metrics by group, document limitations, add human review and appeal, and monitor after launch.',
			price: 'Trade-offs between accuracy and fairness measures, extra process, and sometimes sensitive data is needed to measure bias.',
		},
		edges: [
			['Proxy features', 'Removing a sensitive column does not remove the information (e.g. postcode).', 'Test outcomes by group.'],
			['Small groups', 'Unreliable estimates.', 'Report uncertainty.'],
			['Label bias', 'Labels reflect past human bias.', 'Question the target.'],
			['Feedback loops', 'Decisions change future data.', 'Monitor over time.'],
			['Privacy', 'Model memorises personal data.', 'Minimise and protect data.'],
		],
		links: [
			['metrics', 'Per-group confusion matrices.'],
			['data', 'Where bias enters.'],
			['production', 'Monitoring after launch.'],
		],
		lab: {
			read: [
				'Four boxes: measure by group, compare definitions, choose, monitor.',
				'Narration shows one rate matching while another does not.',
			],
			predict: 'Can two groups have the same approval rate but different error rates?',
		},
	},
	'system-design': {
		kid: {
			emoji: '🧩',
			story: 'Building an AI product is like building a restaurant, not just cooking one dish. You need a menu you can actually serve (the goal), ingredients that arrive on time (data), a kitchen that is fast enough (latency), a taste test (evaluation), and someone watching for complaints (monitoring).',
			say: [
				'Say what decision the product helps with.',
				'Start with the simplest thing that could work.',
				'Plan how you will measure and fix it.',
			],
		},
		real: {
			title: 'Support-ticket routing for 10,000 tickets a day',
			scenario:
				'Goal: send each ticket to the right team. Baseline: keyword rules. Better: a text classifier with human review for low-confidence tickets. Constraints: 200 ms latency, only 100 tickets/day can be reviewed by hand.',
			result:
				'Confidence threshold is chosen so the 100 review slots go to the least certain tickets; everything else is automatic and sampled for quality checks.',
		},
		diagram: {
			type: 'flow',
			title: 'A defensible answer',
			nodes: [
				['frame', 'decision, users, cost of errors'],
				['baseline', 'simple, measurable'],
				['model + data', 'features, labels, split'],
				['evaluate', 'metrics and slices'],
				['operate', 'latency, monitoring, fallback'],
			],
		},
		principle: {
			name: 'Design for the whole loop, not the model',
			rule: 'The model is one component; data, evaluation, serving and feedback decide whether it works.',
			why: 'Interviews and real projects both reward clear trade-offs over clever algorithms.',
		},
		design: {
			problem: 'Open-ended product requests with unclear success.',
			choice: 'Clarify, baseline, iterate on a measurable metric, and plan operations from the start.',
			price: 'Upfront questions feel slower, but they prevent expensive rework.',
		},
		edges: [
			['No labels yet', 'Cannot train.', 'Start with rules, collect labels.'],
			['Review capacity limited', 'More alerts than reviewers.', 'Rank by risk and cap.'],
			['Latency budget', 'Big model too slow.', 'Smaller model, cache, two stages.'],
			['Model fails', 'Service must still work.', 'Fallback rule.'],
			['Requirements change', 'Metric drifts.', 'Review regularly.'],
		],
		links: [
			['production', 'Operating it.'],
			['metrics', 'Choosing the metric.'],
			['recommenders', 'A worked system pattern.'],
			['rag', 'Another pattern.'],
		],
		lab: {
			read: [
				'Boxes trace the answer from framing to operations.',
				'Use them as a checklist when practising an interview.',
			],
			predict: 'What would you ask before choosing any model?',
		},
	},
});
