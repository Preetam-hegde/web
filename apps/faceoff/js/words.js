'use strict';

/* The dictionary, fetched the first time a word game starts (about 400 KB gzipped, then cached). */
const WORDS = { ready: false, valid: new Set() };

async function loadWords() {
	if (WORDS.ready) return;
	const res = await fetch('data/words.txt');
	if (!res.ok) throw new Error(`words.txt: ${res.status}`);
	WORDS.valid = new Set((await res.text()).split('\n'));
	WORDS.ready = true;
}

const isWord = (w) => WORDS.valid.has(w);
