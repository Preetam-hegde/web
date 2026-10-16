'use strict';

/* Couple quiz: pick your own answer, then guess your partner's. A correct guess scores a point. */
const QUIZ = [
	['Coffee ☕', 'Tea 🍵'], ['Beach 🏖️', 'Mountains 🏔️'], ['Early bird 🌅', 'Night owl 🌙'], ['Sweet 🍰', 'Salty 🍟'],
	['Cats 🐱', 'Dogs 🐶'], ['Movie night at home 🛋️', 'Cinema 🍿'], ['Summer ☀️', 'Winter ❄️'], ['Pizza 🍕', 'Burgers 🍔'],
	['Text 💬', 'Call 📞'], ['Plan everything 📋', 'Go with the flow 🌊'], ['Dance floor 💃', 'Karaoke 🎤'], ['Road trip 🚗', 'Flight ✈️'],
	['City break 🏙️', 'Countryside 🌾'], ['Cook at home 🍳', 'Order in 🛵'], ['Books 📚', 'Podcasts 🎧'], ['Spicy 🌶️', 'Mild 🥛'],
	['Sunrise 🌄', 'Sunset 🌇'], ['Big party 🎉', 'Small gathering 🕯️'], ['Rain 🌧️', 'Snow ⛄'], ['Chocolate 🍫', 'Vanilla 🍦'],
	['Save 💰', 'Splurge 🛍️'], ['Be early ⏰', 'Be fashionably late 🕰️'], ['Surprise gift 🎁', 'Planned gift 📝'], ['Gym 🏋️', 'Long walk 🚶'],
	['Emoji reactions 😂', 'Voice notes 🎙️'], ['Breakfast 🥞', 'Dinner 🍝'], ['Camping ⛺', 'Hotel 🏨'], ['Comedy 😂', 'Thriller 🔪'],
	['Tidy desk 🧹', 'Organized chaos 🌀'], ['Dessert first 🍨', 'Main course first 🍛'], ['Window seat 🪟', 'Aisle seat 🚶'], ['Cosy night in 🛋️', 'Dinner out 🍽️'],
	['Sweet text 💌', 'Surprise visit 🚪'], ['Hot weather 🔥', 'Cold weather 🧊'], ['Pancakes 🥞', 'Waffles 🧇'], ['Learn something new 🎨', 'Perfect an old skill 🎯'],
	['Stay in 🏠', 'Go out 🌃'], ['Sea 🌊', 'Lake 🛶'], ['Live music 🎸', 'Playlist 🎶'], ['Ice cream 🍨', 'Cake 🎂'],
];

let quizPool = [];

GAMES.push({
	id: 'know', name: 'This or That', icon: '💞', group: 'Couple', lowerIsBetter: false, duel: true,
	blurb: 'Pick yours, then guess your partner\'s pick. Who knows who better?',
	config(i) {
		if (!i) quizPool = shuffle(QUIZ); // a new match gets a new order, and no question repeats within it
		return { q: quizPool[i % quizPool.length] };
	},
	intro: () => 'Pick your own answer, then guess what <b>they</b> picked<br><small>One point for every correct guess.</small>',
	play(c0, c1) {
		const cs = [c0, c1];
		const opts = c0.cfg.q;
		const picked = [null, null], guessed = [null, null];

		function ask(p, title, line, into, next) {
			const st = cs[p].stage;
			st.innerHTML = `<div class="gname">${title}</div><div class="lbl">${line}</div><div class="choices">${opts.map((o, i) => `<button class="choice" type="button" data-i="${i}">${o}</button>`).join('')}</div>`;
			$$('.choice', st).forEach((b) => {
				b.onclick = () => {
					if (into[p] !== null) return;
					into[p] = +b.dataset.i;
					sfx.lock();
					st.innerHTML = `<div class="res tie">Locked in ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`;
					next();
				};
			});
		}
		function score() {
			[0, 1].forEach((p) => {
				const ok = guessed[p] === picked[1 - p];
				cs[p].done(ok ? 1 : 0, `${ok ? '✓' : '✗'} ${esc(nameOf(1 - p))} picked <b>${opts[picked[1 - p]]}</b>`);
			});
		}

		turns(
			(p, next) => ask(p, 'Your pick', `<b>${esc(nameOf(p))}</b>, which one are you?`, picked, next),
			() => turns(
				(p, next) => ask(p, 'Now guess', `What did <b>${esc(nameOf(1 - p))}</b> pick?`, guessed, next),
				score,
				true,
			),
		);
	},
});
