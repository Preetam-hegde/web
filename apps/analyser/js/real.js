'use strict';

/* Where each idea shows up in real products: [who, what it does there]. */
DSA.real = {
	bubble: [
		['Teaching & tiny gadgets', 'Often the first sort people learn, and fine for a handful of items on simple devices.'],
		['Small scoreboards', 'Swapping neighbours until the order is right can tidy a short leaderboard.']
	],
	selection: [
		['Tournament picks', 'Repeatedly choosing the best remaining player is selection in real life.'],
		['Write-limited memory', 'It does very few swaps, which helps when writing to memory is costly.']
	],
	insertion: [
		['A hand of playing cards', 'People do this without thinking.'],
		['Inside bigger sorts', 'Library sorts such as Python\'s Timsort use insertion sort on small chunks because it is fast there.'],
		['Live feeds', 'Dropping one new item into an already-sorted list, like a new message into a timeline.']
	],
	merge: [
		['Python & Java', 'Timsort, used by Python and by Java for objects, is built on merge sort ideas.'],
		['Huge files', 'Databases and big-data tools sort data too large for memory by sorting pieces and merging them.'],
		['Spreadsheets', 'A stable merge keeps equal rows in their original order when you sort by a second column.']
	],
	quick: [
		['Standard libraries', 'Variants of quicksort (like introsort in C++) power many built-in sort functions.'],
		['Sort by price', 'Fast average speed makes it a common choice for sorting in memory.']
	],
	'heap-sort': [
		['Embedded & real-time systems', 'Guaranteed O(n log n) with no extra memory suits small devices.'],
		['Safety net in introsort', 'C++ std::sort can switch to heapsort if quicksort goes badly.']
	],
	'linear-search': [
		['Ctrl+F on a short list', 'Checking items one by one is simplest when the list is small or unsorted.'],
		['A messy folder', 'There is no order to exploit, so you just look at each file.']
	],
	'binary-search': [
		['Dictionary or phone book', 'Open in the middle, pick a half, repeat.'],
		['git bisect', 'Finds the commit that broke your code by halving the history.'],
		['Databases', 'Sorted indexes let a database find a row among millions in a few steps.']
	],
	stack: [
		['Undo / Redo', 'Editors keep a stack of your actions; Ctrl+Z pops the latest.'],
		['Browser Back button', 'Pages you visit are pushed; Back pops.'],
		['Function calls', 'Your program\'s call stack remembers where to return. A "stack overflow" is this running out of room.']
	],
	queue: [
		['Print jobs', 'Documents print in the order they were sent.'],
		['Up Next playlists', 'Music and video apps queue what plays next.'],
		['Message systems', 'Servers line up work (RabbitMQ, Kafka) so nothing is dropped.']
	],
	'linked-list': [
		['Music players', 'Next and previous track can be a chain of songs.'],
		['Memory managers', 'Operating systems often track free blocks of memory in linked lists.'],
		['Cheap inserts', 'Any place that adds and removes items in the middle a lot can link nodes instead of shifting everything.']
	],
	bst: [
		['Databases & file systems', 'Balanced cousins (B-trees, red-black trees) store indexes so lookups skip most of the data.'],
		['Ordered maps', 'C++ std::map and Java TreeMap are balanced search trees.'],
		['Folder views', 'Tree traversal is how apps list files in nested folders.']
	],
	'min-heap': [
		['Task schedulers', 'Systems and job queues pick the most urgent task first.'],
		['Route finding', 'Dijkstra and A* use a priority queue (a heap) to pick the closest unexplored place.'],
		['Top-K results', 'Finding the 10 best items out of millions with a small heap.']
	],
	bfs: [
		['Social networks', '"People you may know" and "degrees of separation" look at friends, then friends of friends, level by level.'],
		['Web crawlers', 'Search engines like Google follow links outward from a page in waves.'],
		['Fewest hops', 'Finding the fewest stops, clicks or moves in a game or a network.']
	],
	dfs: [
		['Maze & puzzle solvers', 'Sudoku and maze solvers go deep, then back up.'],
		['Dependencies', 'Package managers (npm, pip) use it to decide what to install first.'],
		['Paint bucket', 'The fill tool spreads through connected pixels, much like a depth-first search.']
	],
	dijkstra: [
		['Google Maps & Waze', 'Road routing is built on shortest-path ideas like Dijkstra and A*, with travel time as the edge weight. Real apps add many speed-ups.'],
		['Internet routing', 'Routers using OSPF run Dijkstra to choose the best path for your data.'],
		['Trip planners', 'Cheapest or fastest journey across a network of flights or trains.']
	],
	prim: [
		['Cheapest cabling', 'Connecting houses, offices or cities with the least cable or pipe.'],
		['Network design', 'Telecom and power grids use minimum spanning trees to cut cost.'],
		['Clustering', 'Some data-clustering methods start from a minimum spanning tree.']
	],
	'grid-bfs': [
		['Game AI', 'Tile-based games find the fewest-move route across a map.'],
		['Robot vacuums', 'Finding the nearest reachable spot on a floor grid.'],
		['Flood fill', 'Spreading outward one ring at a time.']
	],
	'grid-dfs': [
		['Maze generation', 'Many maze generators carve passages with a depth-first search.'],
		['Reachability', 'Handy when you only need to know whether a place can be reached.']
	],
	'grid-astar': [
		['Maps & navigation', 'A* is the classic choice for point-to-point routes; production map apps build far more on top of it.'],
		['Video games', 'Characters in many games walk around obstacles using A*.'],
		['Robots & drones', 'Planning a path through a mapped space.']
	],
	'grid-greedy': [
		['Quick rough routes', 'Games that need an instant answer and do not mind a slightly longer path.'],
		['Steering toward a goal', 'Simple "head toward the target" behaviour.']
	],
	lcs: [
		['git diff & GitHub', 'Showing what changed between two versions of a file uses LCS-style comparison.'],
		['DNA matching', 'Biologists find shared stretches between genomes.'],
		['Text similarity', 'Measuring how much two documents have in common.']
	],
	'edit-distance': [
		['Google "Did you mean…?"', 'Spell suggestions favour words that are a few edits from what you typed.'],
		['Phone autocorrect', 'Fixing typos by finding the closest real word.'],
		['Fuzzy matching', 'Matching names, addresses and gene sequences that are almost the same.']
	],
	'n-queens': [
		['Sudoku solvers', 'Place a value, check the rules, undo when stuck.'],
		['Timetables & seating plans', 'Scheduling with rules tries options and backtracks.'],
		['Game engines', 'Searching through moves and abandoning losing branches early.']
	]
};
