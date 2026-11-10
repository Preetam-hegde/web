'use strict';

Teach.add({
	embeddings: {
		kid: {
			emoji: '📍',
			story: 'Put every word on a big map so that words with similar meanings live close together. "Cat" and "dog" are neighbours; "cat" and "bridge" are far apart. The computer does not know what a cat is, but it knows where cat lives on the map, and that is enough to find related words.',
			say: [
				'Every word gets an address (a list of numbers).',
				'Similar words get nearby addresses.',
				'Distance on the map means difference in meaning.',
			],
		},
		real: {
			title: 'Hand-made 2-number embeddings (the lab also uses hand-set ones)',
			scenario:
				'cat = [0.9, 0.8], dog = [0.8, 0.9], car = [0.5, −0.6]. Cosine of cat and dog = 1.44 / (1.204 × 1.204) ≈ 0.99. Cosine of cat and car ≈ −0.03, almost unrelated. Real embeddings are learned and have hundreds of dimensions.',
			result:
				'Similarity is just geometry. Always compare a score against the typical similarity of random word pairs before trusting it.',
		},
		diagram: {
			type: 'flow',
			title: 'From word to meaning',
			nodes: [
				['word', 'cat'],
				['lookup', 'row in a table'],
				['vector', '[0.9, 0.8, ...]'],
				['compare', 'cosine with other vectors'],
			],
		},
		principle: {
			name: 'Meaning is learned from context',
			rule: 'Words used in similar contexts end up with similar vectors.',
			why: 'The model never sees definitions; it sees which words appear near which, and compresses that into geometry.',
		},
		design: {
			problem: 'One-hot vectors treat "cat" and "dog" as completely unrelated.',
			choice: 'Learn a dense vector for each token so training itself arranges related tokens nearby.',
			price: 'Embeddings inherit biases from the data, and one word has one vector unless you use contextual embeddings.',
		},
		edges: [
			['Unknown word', 'No row in the table.', 'Subword tokens or an unknown token.'],
			['Polysemy', '"bank" has one vector for two meanings.', 'Contextual embeddings ({{transformers}}).'],
			['Anisotropy', 'All vectors point somewhat the same way, so cosines are high.', 'Centre and compare with a baseline.'],
			['Bias', 'Stereotypes encoded in geometry.', 'Audit and mitigate ({{responsible}}).'],
		],
		links: [
			['vectors', 'Cosine similarity.'],
			['attention', 'Uses embeddings as queries and keys.'],
			['rag', 'Retrieval compares embeddings.'],
		],
		lab: {
			read: [
				'Each word is a hand-set arrow; the selector picks which word to compare with "cat".',
				'The similarity is the cosine between the two arrows.',
			],
			predict: 'Which word will be closest to "cat" and which farthest?',
		},
	},
	attention: {
		kid: {
			emoji: '🔦',
			story: 'Read "The cat sat down because it was tired." To know what "it" means you shine a torch back over the earlier words and look hardest at "cat". Attention is that torch: for every word it decides how much to look at each other word, then blends what it sees.',
			say: [
				'Ask a question (query).',
				'Score it against every word\'s label (key).',
				'Blend the contents (values) using those scores.',
			],
		},
		real: {
			title: 'Scores to weights',
			scenario:
				'Scores for the query "sat" over [the, cat, sat, down] are [1, 3, 2, 0]. Softmax (e^s / sum) gives about [0.09, 0.64, 0.24, 0.03]. "Cat" gets the biggest share. The output is 0.64 × cat\'s value + 0.24 × sat\'s value + ...',
			result:
				'Weights always sum to 1. A causal mask hides future words, which is how text generators avoid peeking ahead.',
		},
		diagram: {
			type: 'flow',
			title: 'One attention step',
			nodes: [
				['query · keys', 'raw scores'],
				['÷ √d, mask', 'scale, hide the future'],
				['softmax', 'weights that sum to 1'],
				['Σ weight × value', 'the blended output'],
			],
		},
		principle: {
			name: 'Look at everything, weigh by relevance',
			rule: 'Instead of squeezing the past through one memory, let every position read every other position directly.',
			why: 'This removes the distance penalty of recurrence and allows parallel training.',
		},
		design: {
			problem: 'Recurrent models forget and cannot be parallelised.',
			choice: 'Compute all query-key scores at once, normalise with softmax, and blend values.',
			price: 'Cost grows with the square of the sequence length (n²), and it needs positional information because it has no inherent order.',
		},
		edges: [
			['Very long sequence', 'n² memory.', 'Windowed or efficient attention.'],
			['Masking', 'Without the causal mask, training leaks future words.', 'Apply -∞ before softmax.'],
			['One huge score', 'Softmax nearly one-hot.', 'Scale by √d.'],
			['Padding tokens', 'Attending to blanks.', 'Mask padding.'],
		],
		links: [
			['embeddings', 'Where queries and keys come from.'],
			['transformers', 'Stacking attention.'],
			['sequences', 'What it replaced.'],
		],
		lab: {
			read: [
				'Rows show how much the chosen query word looks at each word; darker means more attention.',
				'Switch to the causal mask to see future words go to zero.',
			],
			predict: 'With a causal mask, can "cat" look at "sat"?',
		},
	},
	transformers: {
		kid: {
			emoji: '🏗️',
			story: 'A transformer is a stack of identical floors. On each floor every word first looks around at the others (attention), then thinks quietly on its own (a small network). A shortcut lets the original word pass straight through, so nothing is lost. Many floors build up deeper understanding.',
			say: [
				'Look around (attention).',
				'Think alone (feed-forward).',
				'Keep a shortcut so the old information stays.',
			],
		},
		real: {
			title: 'A pre-norm block, tiny version',
			scenario:
				'Input x. Normalise → attention → add back to x. Normalise → feed-forward → add back again. If attention outputs a small change, x + change stays close to x, so deep stacks start gentle and learn small refinements.',
			result:
				'Residual shortcuts give gradients a direct path, which is why 12, 48 or 96 floors can train.',
		},
		diagram: {
			type: 'flow',
			title: 'One block',
			nodes: [
				['norm', 'steady the scale'],
				['attention', 'mix across words'],
				['+ residual', 'add the input back'],
				['MLP + residual', 'think per word'],
			],
			loop: 'repeat for each of the N layers',
		},
		principle: {
			name: 'Make every layer a small correction',
			rule: 'A residual connection lets a layer learn a change rather than a whole new representation.',
			why: 'Identity is the default, so adding layers rarely hurts.',
		},
		design: {
			problem: 'Deep networks are hard to train.',
			choice: 'Residual paths, layer normalisation, and the same block repeated.',
			price: 'Compute and memory grow with depth and context length.',
		},
		edges: [
			['No position information', 'Words behave like a bag.', 'Add positional encodings.'],
			['Context too long', 'Beyond the trained length, quality drops.', 'Truncate, summarise, or retrieve.'],
			['Decoder-only vs encoder', 'Different masks and uses.', 'Pick by task (generate vs classify).'],
			['Training instability', 'Loss spikes.', 'Warm-up, norm placement.'],
		],
		links: [
			['attention', 'The core operation.'],
			['llms', 'Transformers trained to predict the next token.'],
			['neural', 'The MLP part.'],
		],
		lab: {
			read: [
				'Four boxes: attention, residual, feed-forward, residual.',
				'Each narration says what is mixed and what is kept.',
			],
			predict: 'What happens to the input if the layer\'s output is zero?',
		},
	},
	llms: {
		kid: {
			emoji: '✍️',
			story: 'A large language model plays one game: guess the next word. After "The sky is" it says "blue" is likely. To write a story it guesses a word, adds it to the sentence, and guesses again, one word at a time. A "temperature" knob decides whether it plays safe or tries surprising words.',
			say: [
				'Read the words so far.',
				'List how likely each next word is.',
				'Pick one, add it, repeat.',
			],
		},
		real: {
			title: 'Temperature on a tiny vocabulary',
			scenario:
				'Scores for [blue, grey, green] = [2.0, 1.0, 0.0]. Temperature 1 gives probabilities ≈ [0.67, 0.24, 0.09]. Temperature 0.5 (divide scores by 0.5 → [4, 2, 0]) gives ≈ [0.87, 0.12, 0.02]. Temperature 2 gives ≈ [0.51, 0.31, 0.19].',
			result:
				'Low temperature is nearly always "blue" (predictable); high temperature is more varied and more error-prone.',
		},
		diagram: {
			type: 'bars',
			title: 'Next-word probabilities by temperature',
			items: [
				['T=0.5 · blue', 87, '87%'],
				['T=1 · blue', 67, '67%'],
				['T=2 · blue', 51, '51%'],
			],
			caption: 'Same scores; only the sharpness changes.',
		},
		principle: {
			name: 'Fluent is not the same as true',
			rule: 'The model is trained to produce likely text, not verified facts.',
			why: 'Plan to check, ground and constrain its output ({{rag}}).',
		},
		design: {
			problem: 'Hand-writing language rules is impossible.',
			choice: 'Train a huge transformer on next-token prediction over large text, then adapt it with instructions and feedback.',
			price: 'Expensive to train and run, can state falsehoods confidently, and has a limited context window.',
		},
		edges: [
			['Context overflow', 'Early text is dropped.', 'Summarise or retrieve.'],
			['Temperature 0', 'Deterministic but repetitive.', 'Pick by task.'],
			['Prompt injection', 'Text in documents can issue instructions.', 'Separate instructions from data ({{responsible}}).'],
			['Hallucination', 'Plausible but false.', 'Ground with sources and verify.'],
		],
		links: [
			['transformers', 'The architecture.'],
			['rag', 'Adding knowledge it does not have.'],
			['tuning', 'Adapting it.'],
		],
		lab: {
			read: [
				'Four boxes: tokens in, scores, sampling, token out.',
				'Narration explains the temperature effect.',
			],
			predict: 'Which temperature gives the most repeatable answer?',
		},
	},
	rag: {
		kid: {
			emoji: '🔎',
			story: 'An open-book exam beats a closed-book exam when you do not remember everything. Retrieval-augmented generation first looks up the most relevant pages in a library, puts them in front of the model, and then asks it to answer using only those pages.',
			say: [
				'Search the library for the best pages.',
				'Hand those pages to the model.',
				'Answer using the pages and cite them.',
			],
		},
		real: {
			title: 'Question: "How many vacation days do new staff get?"',
			scenario:
				'Documents are cut into chunks and turned into embeddings. The question is embedded too; the 3 closest chunks are retrieved ("Staff accrue 1.5 days per month...") and added to the prompt with "Answer only from the context."',
			result:
				'If retrieval misses the right chunk, the model has nothing correct to say; the answer is only as good as the retrieval.',
		},
		diagram: {
			type: 'flow',
			title: 'RAG pipeline',
			nodes: [
				['chunk + embed', 'index documents'],
				['retrieve', 'top-k similar chunks'],
				['prompt', 'question + chunks'],
				['answer + cite', 'check support'],
			],
		},
		principle: {
			name: 'Separate knowledge from reasoning',
			rule: 'Keep facts in a store you can update; let the model read and explain them.',
			why: 'Changing a document is cheaper and safer than retraining, and answers can be traced to sources.',
		},
		design: {
			problem: 'Models do not know private or recent facts and invent answers.',
			choice: 'Retrieve evidence at question time and ask for answers grounded in it.',
			price: 'Added latency and moving parts: chunking, indexing, permissions, and evaluation of retrieval and generation separately.',
		},
		edges: [
			['No relevant document', 'Model still answers.', 'Allow "I don\'t know".'],
			['Chunk too big or small', 'Misses or dilutes the answer.', 'Tune and test.'],
			['Permissions', 'Retrieves a document the user may not see.', 'Filter by access before retrieval.'],
			['Conflicting sources', 'Contradictory chunks.', 'Show sources and dates.'],
			['Stale index', 'Outdated answers.', 'Re-index on change.'],
		],
		links: [
			['embeddings', 'Retrieval is similarity search.'],
			['llms', 'The generator.'],
			['tuning', 'Alternative: change the model instead.'],
		],
		lab: {
			read: [
				'Four boxes: split, search, build the prompt, answer.',
				'Look for where an error would enter: retrieval or generation.',
			],
			predict: 'If the best chunk is not retrieved, can better prompting fix it?',
		},
	},
	tuning: {
		kid: {
			emoji: '🧰',
			story: 'A chef who can cook anything can learn your family recipe by changing a few things, not by relearning cooking. Fine-tuning does this. LoRA goes even lighter: it leaves the chef alone and adds a few small sticky notes of adjustments.',
			say: [
				'Start from a model that already knows a lot.',
				'Change only a small part.',
				'Test that it still works on everything else.',
			],
		},
		real: {
			title: 'Counting LoRA values',
			scenario:
				'A weight matrix is 1,024 × 1,024 = 1,048,576 values. LoRA with rank 8 adds A (8×1,024) and B (1,024×8) = 8 × 2,048 = 16,384 trainable values, about 1.56%.',
			result:
				'Far fewer trainable parameters, but the base model still occupies memory, so total memory does not fall by 98%.',
		},
		diagram: {
			type: 'compare',
			title: 'Which tool for which problem',
			left: ['Add knowledge', ['RAG: retrieve at question time', 'good for changing facts']],
			right: ['Change behaviour or style', ['fine-tune or LoRA', 'good for format, tone, skills']],
		},
		principle: {
			name: 'Change the least that solves the problem',
			rule: 'Try prompting, then retrieval, then light tuning, before full retraining.',
			why: 'Each step costs more and is harder to reverse; the simplest fix that passes evaluation wins.',
		},
		design: {
			problem: 'Full retraining is expensive and can erase what the model knew.',
			choice: 'Freeze the base weights and train small adapters; quantise to cut memory.',
			price: 'Adapters may not capture every task; quantisation loses a little precision.',
		},
		edges: [
			['Catastrophic forgetting', 'Loses general skills.', 'Low rank, small rate, mix in general data.'],
			['Tiny / noisy tuning data', 'Learns the noise.', 'Clean it; keep evaluation set apart.'],
			['Need fresh facts', 'Tuning is a bad fit.', 'Use RAG.'],
			['Rank too small', 'Cannot fit the task.', 'Increase rank and compare.'],
		],
		links: [
			['rag', 'The other adaptation route.'],
			['llms', 'What is being adapted.'],
			['optimization', 'Same training machinery.'],
		],
		lab: {
			read: [
				'Four boxes: prompt, retrieve, adapter, full tune.',
				'Each narration compares cost against what it can change.',
			],
			predict: 'Which option do you need when the policy changes every week?',
		},
	},
	agents: {
		kid: {
			emoji: '🤖',
			story: 'Give a helper a to-do list and a toolbox: a calculator, a phone book, a stamp. The helper reads your note, decides "I need the phone book", looks, reads what it found, and keeps going until the job is done. An AI agent is a language model that works in exactly this loop. You decide which tools it may touch and when it must ask you first.',
			say: [
				'Read the instructions and pick a tool.',
				'Let our code run the tool and show the result.',
				'Repeat until done, and ask a grown-up before anything risky.',
			],
		},
		real: {
			title: 'A refund assistant',
			scenario:
				'User: "Refund order 812." The model asks to call lookup_order(812) and sees: delivered, $40, eligible. It then asks for issue_refund(812, 40). A rule says refunds over $25 need a person to approve. The human approves, the refund is issued, and the answer is sent after 3 of 5 allowed steps.',
			result:
				'The model decided what to do, but plain code checked, ran and limited every action. That split is what makes an agent safe enough to test.',
		},
		diagram: {
			type: 'flow',
			title: 'The agent loop',
			nodes: [
				['instructions + question', 'system prompt, history'],
				['model decides', 'answer or tool request'],
				['our code runs the tool', 'validate, check permission'],
				['result goes back', 'next turn'],
			],
			loop: 'stop when done, over budget, or a person must decide',
		},
		principle: {
			name: 'Let the model propose, let code dispose',
			rule: 'The model may suggest an action; trusted code validates, permits and performs it.',
			why: 'Models can be fooled by the text they read. Keeping the power to act outside the model keeps the dangerous part testable.',
		},
		design: {
			problem: 'A model alone cannot look things up or change anything, and one prompt cannot handle a multi-step job.',
			choice: 'Wrap the model in a loop with named tools, structured calls, a step budget and a permission layer.',
			price: 'More latency and cost per task, errors that compound over steps, and a new attack surface (prompt injection).',
		},
		edges: [
			['Endless loop', 'The model keeps calling tools.', 'Step and cost budget, then escalate.'],
			['Malformed tool arguments', 'Wrong types or missing fields.', 'Validate against the schema and return a clear error.'],
			['Prompt injection', 'A document or note tells the model to break rules.', 'Treat tool output as data; least-privilege tools; approval for risky actions.'],
			['Irreversible action', 'Money moved or email sent by mistake.', 'Human approval or a dry-run first.'],
			['Context overflow', 'Long tool results push out the instructions.', 'Truncate or summarise results ({{rag}}).'],
			['Hard to test', 'Same prompt, different path.', 'Evaluate on a fixed test set and inspect traces.'],
		],
		links: [
			['llms', 'The model inside the loop.'],
			['rag', 'Retrieval is one tool the agent can call.'],
			['production', 'Tracing, cost and latency monitoring.'],
			['responsible', 'Safety when the model can act.'],
		],
		lab: {
			read: [
				'Four boxes: instruct, decide, act, check.',
				'The narration points out which part is model and which is ordinary code.',
			],
			predict: 'Which step should refuse a refund request when the amount is over the limit?',
		},
	},
});
