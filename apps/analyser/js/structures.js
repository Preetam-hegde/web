'use strict';

/*
 * Sandbox structures: the user drives them with buttons. Every operation
 * returns { state, frames } and the player animates the frames.
 */
(function () {
	DSA.addGroup({ id: 'linear', label: 'Stacks & Queues', hint: 'LIFO and FIFO' });
	DSA.addGroup({ id: 'lists', label: 'Linked List', hint: 'Nodes and pointers' });

	function mkItems(values, cls, tags) {
		return values.map(function (v, i) {
			return { v: v, cls: (cls && cls[i]) || '', tag: (tags && tags[i]) || '' };
		});
	}

	function addTag(tags, i, text) {
		if (i < 0 || i >= tags.length) {
			return;
		}
		tags[i] = tags[i] ? tags[i] + ' · ' + text : text;
	}

	const valueControl = { id: 'value', type: 'number', label: 'Value', min: 1, max: 99, value: 42 };

	// ── Stack ───────────────────────────────────────────────────────────────
	const STACK_MAX = 8;
	function stackFrame(items, extra) {
		const tags = new Array(items.length).fill('');
		addTag(tags, items.length - 1, 'top');
		const frame = {
			lin: { kind: 'stack', items: mkItems(items, extra.cls, tags) },
			msg: extra.msg,
			line: extra.line,
			warn: !!extra.warn,
			stats: { Size: items.length, Capacity: STACK_MAX }
		};
		return frame;
	}

	DSA.register({
		id: 'stack', group: 'linear', name: 'Stack', sandbox: true, views: ['lin'], controls: [valueControl],
		legend: [['', 'Item'], ['new', 'Just pushed'], ['hot', 'Top / returned'], ['swap', 'Error']],
		blurb: 'Last-in, first-out. You can only touch the top: push adds, pop removes, peek looks. Think browser back button or undo history.',
		complexity: [['Push', 'O(1)'], ['Pop', 'O(1)'], ['Peek', 'O(1)'], ['Space', 'O(n)']],
		code: [
			'push(x):',
			'  if full: overflow',
			'  items[top++] = x',
			'pop():',
			'  if empty: underflow',
			'  return items[--top]',
			'peek():',
			'  return items[top - 1]'
		],
		init: function () {
			return { items: [12, 7, 31] };
		},
		snapshot: function (s) {
			return stackFrame(s.items, { msg: 'Stack ready. Push, pop or peek.', line: -1 });
		},
		ops: [
			{
				id: 'push', label: 'Push', run: function (s, value) {
					if (s.items.length >= STACK_MAX) {
						return { state: s, frames: [stackFrame(s.items, { msg: 'Overflow — the stack is full (' + STACK_MAX + ' items).', line: 1, warn: true })] };
					}
					const next = s.items.concat([value]);
					return {
						state: { items: next },
						frames: [
							stackFrame(s.items, { msg: 'push(' + value + '): there is room, so place it on top.', line: 1 }),
							stackFrame(next, { msg: value + ' is the new top.', line: 2, cls: { [next.length - 1]: 'new' } })
						]
					};
				}
			},
			{
				id: 'pop', label: 'Pop', run: function (s) {
					if (!s.items.length) {
						return { state: s, frames: [stackFrame(s.items, { msg: 'Underflow — nothing to pop.', line: 4, warn: true })] };
					}
					const top = s.items[s.items.length - 1];
					const next = s.items.slice(0, -1);
					return {
						state: { items: next },
						frames: [
							stackFrame(s.items, { msg: 'pop(): the top element is ' + top + '.', line: 5, cls: { [s.items.length - 1]: 'hot' } }),
							stackFrame(next, { msg: 'Returned ' + top + '. The top moves down.', line: 5 })
						]
					};
				}
			},
			{
				id: 'peek', label: 'Peek', run: function (s) {
					if (!s.items.length) {
						return { state: s, frames: [stackFrame(s.items, { msg: 'Nothing to peek — the stack is empty.', line: 7, warn: true })] };
					}
					return { state: s, frames: [stackFrame(s.items, { msg: 'peek() → ' + s.items[s.items.length - 1] + ' (not removed).', line: 7, cls: { [s.items.length - 1]: 'hot' } })] };
				}
			}
		]
	});

	// ── Queue ───────────────────────────────────────────────────────────────
	const QUEUE_MAX = 8;
	function queueFrame(items, extra) {
		const tags = new Array(items.length).fill('');
		addTag(tags, 0, 'front');
		addTag(tags, items.length - 1, 'rear');
		return {
			lin: { kind: 'queue', items: mkItems(items, extra.cls, tags) },
			msg: extra.msg,
			line: extra.line,
			warn: !!extra.warn,
			stats: { Size: items.length, Capacity: QUEUE_MAX }
		};
	}

	DSA.register({
		id: 'queue', group: 'linear', name: 'Queue', sandbox: true, views: ['lin'], controls: [valueControl],
		legend: [['', 'Item'], ['new', 'Just enqueued'], ['hot', 'Front / returned'], ['swap', 'Error']],
		blurb: 'First-in, first-out. Items join at the rear and leave from the front — like a line at a ticket counter. BFS runs on a queue.',
		complexity: [['Enqueue', 'O(1)'], ['Dequeue', 'O(1)'], ['Front', 'O(1)'], ['Space', 'O(n)']],
		code: [
			'enqueue(x):',
			'  if full: overflow',
			'  items[rear++] = x',
			'dequeue():',
			'  if empty: underflow',
			'  return items[front++]',
			'front():',
			'  return items[front]'
		],
		init: function () {
			return { items: [8, 15, 23] };
		},
		snapshot: function (s) {
			return queueFrame(s.items, { msg: 'Queue ready. Enqueue or dequeue.', line: -1 });
		},
		ops: [
			{
				id: 'enqueue', label: 'Enqueue', run: function (s, value) {
					if (s.items.length >= QUEUE_MAX) {
						return { state: s, frames: [queueFrame(s.items, { msg: 'Overflow — the queue is full (' + QUEUE_MAX + ' items).', line: 1, warn: true })] };
					}
					const next = s.items.concat([value]);
					return {
						state: { items: next },
						frames: [
							queueFrame(s.items, { msg: 'enqueue(' + value + '): join at the rear.', line: 1 }),
							queueFrame(next, { msg: value + ' is now the rear.', line: 2, cls: { [next.length - 1]: 'new' } })
						]
					};
				}
			},
			{
				id: 'dequeue', label: 'Dequeue', run: function (s) {
					if (!s.items.length) {
						return { state: s, frames: [queueFrame(s.items, { msg: 'Underflow — the queue is empty.', line: 4, warn: true })] };
					}
					const next = s.items.slice(1);
					return {
						state: { items: next },
						frames: [
							queueFrame(s.items, { msg: 'dequeue(): the front element ' + s.items[0] + ' leaves first.', line: 5, cls: { 0: 'hot' } }),
							queueFrame(next, { msg: 'Returned ' + s.items[0] + '. Everyone shuffles forward.', line: 5 })
						]
					};
				}
			},
			{
				id: 'front', label: 'Front', run: function (s) {
					if (!s.items.length) {
						return { state: s, frames: [queueFrame(s.items, { msg: 'The queue is empty.', line: 7, warn: true })] };
					}
					return { state: s, frames: [queueFrame(s.items, { msg: 'front() → ' + s.items[0] + ' (not removed).', line: 7, cls: { 0: 'hot' } })] };
				}
			}
		]
	});

	// ── Singly linked list ──────────────────────────────────────────────────
	const LIST_MAX = 7;
	function listFrame(items, extra) {
		const tags = new Array(items.length).fill('');
		addTag(tags, 0, 'head');
		addTag(tags, items.length - 1, 'tail');
		if (extra.cur !== undefined) {
			addTag(tags, extra.cur, 'cur');
		}
		return {
			lin: { kind: 'list', items: mkItems(items, extra.cls, tags) },
			msg: extra.msg,
			line: extra.line,
			warn: !!extra.warn,
			stats: Object.assign({ Length: items.length }, extra.stats)
		};
	}

	DSA.register({
		id: 'linked-list', group: 'lists', name: 'Singly Linked List', sandbox: true, views: ['lin'], controls: [valueControl],
		legend: [['', 'Node'], ['cur', 'Visiting'], ['new', 'New node'], ['hot', 'Match'], ['done', 'Reversed']],
		blurb: 'Nodes hold a value and a pointer to the next node. Inserting at the head is instant; reaching anything else means walking the chain.',
		complexity: [['Insert head', 'O(1)'], ['Insert tail', 'O(n)'], ['Search', 'O(n)'], ['Delete', 'O(n)'], ['Reverse', 'O(n)']],
		code: [
			'insertHead(x):',
			'  node = new Node(x); node.next = head; head = node',
			'insertTail(x):',
			'  walk to the last node; last.next = new Node(x)',
			'search(x):',
			'  for node = head; node != null; node = node.next:',
			'    if node.value == x: return node',
			'delete(x):',
			'  find prev where prev.next.value == x',
			'  prev.next = prev.next.next',
			'reverse():',
			'  for each node: point it at the previous one'
		],
		init: function () {
			return { items: [10, 20, 30, 40] };
		},
		snapshot: function (s) {
			return listFrame(s.items, { msg: 'List ready. Try inserting, searching or reversing.', line: -1 });
		},
		ops: [
			{
				id: 'insert-head', label: 'Insert head', run: function (s, value) {
					if (s.items.length >= LIST_MAX) {
						return { state: s, frames: [listFrame(s.items, { msg: 'Demo list is full (' + LIST_MAX + ' nodes).', line: 0, warn: true })] };
					}
					const next = [value].concat(s.items);
					return {
						state: { items: next },
						frames: [
							listFrame(s.items, { msg: 'Create a node holding ' + value + '; its next will point at the old head.', line: 1 }),
							listFrame(next, { msg: 'head now points at ' + value + '. One step, no walking: O(1).', line: 1, cls: { 0: 'new' } })
						]
					};
				}
			},
			{
				id: 'insert-tail', label: 'Insert tail', run: function (s, value) {
					if (s.items.length >= LIST_MAX) {
						return { state: s, frames: [listFrame(s.items, { msg: 'Demo list is full (' + LIST_MAX + ' nodes).', line: 2, warn: true })] };
					}
					const frames = [];
					s.items.forEach(function (v, i) {
						frames.push(listFrame(s.items, { msg: 'Walk the chain to find the tail… at ' + v + '.', line: 3, cur: i, cls: { [i]: 'cur' }, stats: { Steps: i + 1 } }));
					});
					const next = s.items.concat([value]);
					frames.push(listFrame(next, { msg: 'Tail.next → new node ' + value + '. Needed a full walk: O(n).', line: 3, cls: { [next.length - 1]: 'new' }, stats: { Steps: s.items.length } }));
					return { state: { items: next }, frames: frames };
				}
			},
			{
				id: 'search', label: 'Search', run: function (s, value) {
					const frames = [];
					for (let i = 0; i < s.items.length; i++) {
						frames.push(listFrame(s.items, { msg: 'Is ' + s.items[i] + ' equal to ' + value + '?', line: 6, cur: i, cls: { [i]: 'cur' }, stats: { Steps: i + 1 } }));
						if (s.items[i] === value) {
							frames.push(listFrame(s.items, { msg: 'Found ' + value + ' at position ' + i + '.', line: 6, cur: i, cls: { [i]: 'hot' }, stats: { Steps: i + 1 } }));
							return { state: s, frames: frames };
						}
					}
					frames.push(listFrame(s.items, { msg: value + ' is not in the list — reached null.', line: 5, warn: true, stats: { Steps: s.items.length } }));
					return { state: s, frames: frames };
				}
			},
			{
				id: 'delete', label: 'Delete', run: function (s, value) {
					const frames = [];
					for (let i = 0; i < s.items.length; i++) {
						frames.push(listFrame(s.items, { msg: 'Looking for ' + value + '… at ' + s.items[i] + '.', line: 8, cur: i, cls: { [i]: 'cur' }, stats: { Steps: i + 1 } }));
						if (s.items[i] === value) {
							const next = s.items.slice(0, i).concat(s.items.slice(i + 1));
							frames.push(listFrame(s.items, { msg: i === 0 ? 'Match at the head — move head to the next node.' : 'Match — the previous node will skip over it.', line: 9, cur: i, cls: { [i]: 'swap' }, stats: { Steps: i + 1 } }));
							frames.push(listFrame(next, { msg: 'Unlinked ' + value + '. The chain is whole again.', line: 9 }));
							return { state: { items: next }, frames: frames };
						}
					}
					frames.push(listFrame(s.items, { msg: value + ' is not in the list — nothing to delete.', line: 8, warn: true }));
					return { state: s, frames: frames };
				}
			},
			{
				id: 'reverse', label: 'Reverse', run: function (s) {
					if (s.items.length < 2) {
						return { state: s, frames: [listFrame(s.items, { msg: 'Nothing to reverse.', line: 10, warn: true })] };
					}
					const frames = [];
					let cur = s.items.slice();
					frames.push(listFrame(cur, { msg: 'Walk the list, flipping each node to point backwards.', line: 11, cls: { 0: 'done' } }));
					for (let k = 1; k < s.items.length; k++) {
						const moved = cur[k];
						cur = [moved].concat(cur.slice(0, k), cur.slice(k + 1));
						const cls = {};
						for (let i = 0; i <= k; i++) {
							cls[i] = 'done';
						}
						cls[0] = 'cur';
						frames.push(listFrame(cur, { msg: 'Re-point ' + moved + ' at the reversed part (' + (k + 1) + ' of ' + s.items.length + ').', line: 11, cls: cls }));
					}
					frames.push(listFrame(cur, { msg: 'Reversed — the old tail is the new head.', line: 11 }));
					return { state: { items: cur }, frames: frames };
				}
			}
		]
	});
})();
