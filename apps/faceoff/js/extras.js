'use strict';

/* Shared dares; audio, icons and share rendering have separate modules. */

/* ── loser dares: {w} becomes the winner's name (or the partner's, in Truth or Dare) ── */
const DARES = [
	'Give {w} a 60-second shoulder rub.',
	'Tell {w} one thing you admire about them. Out loud, no jokes.',
	"Speak in an accent of {w}'s choice for the next 10 minutes.",
	'Let {w} pick the next song, and sing along.',
	'Do your best impression of {w}.',
	'Make {w} a drink or a snack.',
	'Hold a plank until {w} counts to 30.',
	'Write {w} a two-line poem. It has to rhyme.',
	"{w} picks tonight's movie. No vetoes.",
	'Do 15 jumping jacks while {w} cheers you on.',
	'Tell {w} your most embarrassing memory.',
	'Wear a sock on your hand for the next 15 minutes.',
	'Pay {w} a compliment every time they say "okay" for the next hour.',
	'Take care of the next chore {w} names.',
	'Let {w} choose your phone wallpaper for a day.',
	'Narrate the next two minutes like a nature documentary.',
	'Dance for 30 seconds with no music.',
	'Hold eye contact with {w} for 30 seconds without laughing.',
	'Name three things you are grateful for about {w}.',
	'Strut across the room like a fashion model while {w} scores you.',
	'Say the alphabet backwards. {w} is the judge.',
	"Carry {w}'s bag for the rest of the day.",
	'Sing the chorus of any song {w} names.',
	'Plan the next hangout. {w} has final say.',
	'Ask {w} one question you have always been curious about. They must answer honestly.',
];

/* The built-in dares plus any the players typed in on the menu. */
const allDares = () => [...DARES, ...store.custom.dares];
