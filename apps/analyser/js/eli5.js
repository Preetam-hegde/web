'use strict';

/*
 * "Explain like I'm 5" copy, keyed by algorithm id.
 * emoji: a picture to hang the idea on, story: the analogy,
 * steps: the idea in plain steps, speed: how fast it is, in kid words.
 */
DSA.eli5 = {
	bubble: {
		emoji: '🫧',
		story: 'Kids stand in a line and want to go from shortest to tallest. You look at two neighbours at a time. If the taller one is on the left, they swap places. Do this down the whole line again and again, and the tallest kid floats to the end like a bubble in a bath.',
		steps: ['Look at two kids standing next to each other.', 'If the left one is taller, make them swap.', 'Walk to the end of the line. The tallest kid is now last.', 'Start again, until a whole walk has no swaps.'],
		speed: 'Slow for a long line: you keep walking back and forth.'
	},
	selection: {
		emoji: '🏆',
		story: 'You have a row of toys and want the smallest on the left. Look at ALL the toys, pick the smallest one, and put it first. Then look at the rest, pick the smallest again, and put it second. Like picking a winner, over and over.',
		steps: ['Look at every toy that is not sorted yet.', 'Find the smallest one.', 'Swap it into the next empty spot on the left.', 'Repeat for the toys that are left.'],
		speed: 'Slow: you always look at every toy, even if they are almost in order.'
	},
	insertion: {
		emoji: '🃏',
		story: 'Think of holding playing cards. You pick up one new card and slide it left past bigger cards until it fits in the right place. Your hand is always tidy, and each new card just finds its seat.',
		steps: ['Take the next card from the pile.', 'Slide it left while the card before it is bigger.', 'Stop when it fits. Your hand is sorted again.', 'Pick up the next card.'],
		speed: 'Great when the cards are almost in order, slow when they are a mess.'
	},
	merge: {
		emoji: '🧩',
		story: 'A huge pile is scary, so split it in half. Keep splitting until each pile has just ONE thing (one thing is always sorted!). Then zip piles together like a zipper, always taking the smaller front card.',
		steps: ['Cut the pile in two.', 'Keep cutting until every pile has one card.', 'Join two piles by picking the smaller front card each time.', 'Keep joining until there is one sorted pile.'],
		speed: 'Fast and steady, but it needs extra table space for the piles.'
	},
	quick: {
		emoji: '🎯',
		story: 'Pick one kid as the "boss" (the pivot). Everybody shorter goes to the boss\'s left, everybody taller goes to the right. Now the boss is in the perfect spot! Do the same trick for the left group and the right group.',
		steps: ['Choose a pivot, the boss.', 'Send smaller ones left and bigger ones right.', 'The boss now stands in its final place.', 'Repeat for the left group and the right group.'],
		speed: 'Very fast most of the time. A bad boss choice makes it slow.'
	},
	'heap-sort': {
		emoji: '⛰️',
		story: 'Build a family tree where every parent is bigger than their children, so the biggest is the king at the top. Take the king out and put him at the back of the line, then let the next biggest climb up to be king. Repeat!',
		steps: ['Arrange the numbers into a tree where parents beat their children.', 'Swap the king (top) with the last spot.', 'Let the new top sink down until the tree is fair again.', 'Repeat until the line is sorted.'],
		speed: 'Fast and does not need extra space.'
	},
	'linear-search': {
		emoji: '🔦',
		story: 'You lost your red crayon in a box. You pick up each crayon one by one and check: is it red? If yes, hooray. If you get to the end, it is not in the box.',
		steps: ['Start at the first item.', 'Is it the one you want? Then stop.', 'If not, move to the next one.', 'No more items? It is not there.'],
		speed: 'Fine for a small box. Slow for a huge one.'
	},
	'binary-search': {
		emoji: '📖',
		story: 'Guess a number from 1 to 100. Say 50. "Higher!" Now you know it is not 1 to 50 at all, so you just threw away half the numbers. Say 75. "Lower!" Half gone again. It only works because the numbers are already in order.',
		steps: ['Look at the middle item.', 'Too small? Throw away the left half.', 'Too big? Throw away the right half.', 'Repeat on what is left until you find it or nothing remains.'],
		speed: 'Super fast. A million items needs only about 20 looks!'
	},
	stack: {
		emoji: '🥞',
		story: 'A stack is a pile of pancakes. You can only put a pancake on TOP or eat the one on TOP. The last pancake you added is the first one you eat. That is "last in, first out".',
		steps: ['Push: put something on top.', 'Pop: take the top thing off.', 'Peek: look at the top without taking it.', 'You can never grab from the middle.'],
		speed: 'Instant. You only ever touch the top.'
	},
	queue: {
		emoji: '🎢',
		story: 'A queue is the line for a slide. New kids join at the BACK, and the kid at the FRONT goes first. Fair is fair: first in, first out.',
		steps: ['Enqueue: join the back of the line.', 'Dequeue: the front kid leaves.', 'Front: peek at who is next.', 'Nobody can cut in line.'],
		speed: 'Instant at both ends.'
	},
	'linked-list': {
		emoji: '🚂',
		story: 'A linked list is a train. Each carriage holds one thing and holds hands with the next carriage. To find something you start at the engine (head) and walk carriage by carriage. Adding a new carriage at the front is easy: just hold its hand to the old engine.',
		steps: ['Head is the first carriage, tail is the last.', 'Add at the front: new carriage holds the old head\'s hand.', 'To find something, walk from the head one carriage at a time.', 'To remove one, the carriage before it holds hands with the one after it.'],
		speed: 'Adding at the front is instant. Finding things means a walk.'
	},
	bst: {
		emoji: '🌳',
		story: 'Play "higher or lower" with a tree. At every branch, smaller numbers go LEFT and bigger numbers go RIGHT. To find a number you just keep asking "left or right?" and you skip whole branches you do not need.',
		steps: ['Start at the top (the root).', 'Smaller than this node? Go left. Bigger? Go right.', 'Empty spot? A new number belongs right there.', 'Reading left, then node, then right gives sorted order (in-order).'],
		speed: 'Fast when the tree is bushy. Slow if it grows like one long stick.'
	},
	'min-heap': {
		emoji: '👑',
		story: 'A heap is a family tree with one rule: every parent is smaller than their kids. So the smallest number is always the boss at the top. A new number starts at the bottom and climbs up while it is smaller than its parent.',
		steps: ['Insert: put it at the end, then climb up past bigger parents.', 'Extract: take the boss, move the last one to the top.', 'Let that one sink down, swapping with its smaller child.', 'The smallest is always on top.'],
		speed: 'Quick: it only climbs or sinks the height of a small tree.'
	},
	bfs: {
		emoji: '💧',
		story: 'Drop a pebble in a pond. The ripples spread out in rings: first everything one step away, then two steps, then three. BFS visits places the same way, using a queue (a line) of places to visit next.',
		steps: ['Put the start in the line.', 'Take the first place from the line.', 'Add all its new neighbours to the back of the line.', 'Repeat until the line is empty.'],
		speed: 'Visits every place and road once. Finds the fewest-steps route.'
	},
	dfs: {
		emoji: '🐭',
		story: 'A mouse in a maze. It runs down one tunnel as far as it can. At a dead end it walks back to the last fork and tries another tunnel. DFS goes DEEP first, then backs up.',
		steps: ['Go to a neighbour you have not seen.', 'Keep going deeper from there.', 'Stuck? Step back to the last place with another option.', 'Stop when everything is seen.'],
		speed: 'Visits every place and road once.'
	},
	dijkstra: {
		emoji: '🗺️',
		story: 'You want the quickest way to every town. Keep a note of the shortest known trip to each one. Always pick the closest town you have not finished, and check: does going through it make a neighbour closer? If so, update your note.',
		steps: ['Start town is 0 away, the rest are "far, far away" (∞).', 'Pick the closest town you have not finished.', 'For each road from it, see if the trip is now shorter.', 'Update the notes and repeat.'],
		speed: 'Fast, as long as no road has a negative length.'
	},
	prim: {
		emoji: '🌉',
		story: 'You must join all islands with bridges, and bridges cost money. Start on one island and keep building the cheapest bridge that reaches a new island. In the end everything is connected for the least money.',
		steps: ['Start with one island.', 'Look at every bridge that reaches a new island.', 'Build the cheapest one.', 'Repeat until all islands are joined.'],
		speed: 'Quick, because every step is a small cheapest-choice.'
	},
	'grid-bfs': {
		emoji: '🌊',
		story: 'Pour water on the green square. It spreads to every open square next to it, ring by ring, and walls stop it. The first time the water touches the red square, the path it took is the shortest one.',
		steps: ['Start with S in the line.', 'Take the next square and look up, right, down, left.', 'Add the open squares you have not seen.', 'When you reach E, walk back along the parents.'],
		speed: 'Always finds the shortest path, but may flood a lot of squares.'
	},
	'grid-dfs': {
		emoji: '🐭',
		story: 'Pick a direction and keep walking until you hit a wall, then turn back and try a different way. You will probably get there, but you may take a wiggly path.',
		steps: ['Pick a neighbour and go.', 'Keep going until stuck.', 'Backtrack to the last open choice.', 'Stop when you find E.'],
		speed: 'Finds a path fast sometimes, but not always the shortest.'
	},
	'grid-astar': {
		emoji: '🧭',
		story: 'Like water, but with a compass. For every square you ask two questions: "How far have I walked?" and "How far does it look to the finish?" You always try the square with the smallest total. That is how it skips most of the maze.',
		steps: ['Score each square: steps so far + guess to the end.', 'Try the lowest score first.', 'Add its neighbours with new scores.', 'Reaching E means done, and the path is shortest.'],
		speed: 'Usually the fastest way to a shortest path.'
	},
	'grid-greedy': {
		emoji: '🏃',
		story: 'Run straight at the finish line without thinking about how far you have already come. Super quick in an open field, but a wall can trick you into a long detour.',
		steps: ['Look at which open square is closest to E.', 'Go there.', 'Repeat.', 'Walls can fool it, so the path may not be shortest.'],
		speed: 'Very quick, but not always the best path.'
	},
	lcs: {
		emoji: '🧵',
		story: 'Two words: which letters do they share in the same order (not necessarily next to each other)? We fill a little table. Each box answers: "how many letters match so far?" When two letters are equal we add one to the diagonal box. If not, we copy the bigger neighbour.',
		steps: ['Make a table: one word across, one word down.', 'Same letters? Take the diagonal number and add 1.', 'Different? Take the bigger of the box above or to the left.', 'Follow the arrows back from the corner to read the answer.'],
		speed: 'Fills each box once: letters × letters boxes.'
	},
	'edit-distance': {
		emoji: '✏️',
		story: 'How many tiny changes turn one word into another? You may add a letter, remove a letter, or change a letter. Each box in the table remembers the cheapest way to fix the beginning of both words.',
		steps: ['Turning a word into nothing costs its length.', 'Letters match? Copy the diagonal for free.', 'Different? Take the cheapest of delete, add or change, plus 1.', 'The bottom-right box is the answer.'],
		speed: 'Fills each box once: letters × letters boxes.'
	},
	'n-queens': {
		emoji: '👸',
		story: 'Put queens on a chessboard so none can capture another. Place one queen per row. If a spot is attacked, try the next column. If a row has no safe spot, go back, move the queen above it, and try again. That undo-and-retry is called backtracking.',
		steps: ['Go row by row.', 'Try each column. Is it safe from earlier queens?', 'Safe? Place it and go to the next row.', 'Stuck? Lift the last queen and try another spot.'],
		speed: 'Can take many tries, but giving up early on bad spots saves lots of work.'
	}
};
