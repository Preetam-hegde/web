'use strict';

/* Word lists, fetched the first time a word game starts (about 400 KB gzipped, then cached by the browser). */
const WORDS = { ready: false, valid: new Set(), answers: [], racks: [], frags: [] };

async function loadWords() {
	if (WORDS.ready) return;
	const get = (file) => fetch(`data/${file}`).then((r) => {
		if (!r.ok) throw new Error(`${file}: ${r.status}`);
		return r.text();
	});
	const [all, common, frags] = await Promise.all([get('words.txt'), get('common.txt'), get('frags.txt')]);
	WORDS.valid = new Set(all.split('\n'));
	const c = common.split('\n');
	WORDS.answers = c.filter((w) => w.length === 5);
	WORDS.racks = c.filter((w) => w.length === 7);
	WORDS.frags = frags.split('\n').map((l) => { const [f, n] = l.split(' '); return [f, +n]; });
	WORDS.ready = true;
}

const isWord = (w) => WORDS.valid.has(w);
