'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

test('home colors follow local time on load, while open, and after returning to the tab', () => {
	const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
	const script = html.match(/<script id="loom-theme">([\s\S]*?)<\/script>/);
	assert.ok(script, 'The home page must initialize its time-based theme before painting');
	let hour = 5;
	let color;
	let tick;
	let resume;
	const meta = {};
	const document = {
		hidden: false,
		documentElement: { style: { setProperty: (name, value) => { assert.equal(name, '--field'); color = value; } } },
		querySelector: () => meta,
		addEventListener: (event, listener) => { assert.equal(event, 'visibilitychange'); resume = listener; }
	};
	runInNewContext(script[1], {
		Date: class { getHours() { return hour; } },
		document,
		window: { setInterval: (callback, delay) => { assert.equal(delay, 60000); tick = callback; } }
	});
	assert.equal(color, '#7da0ed', 'Before 6 a.m. starts blue');
	for (const [time, expected] of [[0, '#7da0ed'], [6, '#ef624c'], [12, '#ef624c'], [17, '#ef624c'], [18, '#7da0ed'], [23, '#7da0ed']]) {
		hour = time;
		tick();
		assert.equal(color, expected, `Theme at local hour ${time}`);
		assert.equal(meta.content, expected, 'Browser chrome matches the hero');
	}
	hour = 8;
	document.hidden = true;
	resume();
	assert.equal(color, '#7da0ed', 'A hidden tab waits until it becomes visible');
	document.hidden = false;
	resume();
	assert.equal(color, '#ef624c', 'Returning after sunrise immediately applies red');
	assert.match(html, /<html[^>]*style="--field: #7da0ed"/, 'Blue is available before scripts or without JavaScript');
});
