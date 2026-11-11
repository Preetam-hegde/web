'use strict';

/* Both boot.js and the service worker use this order. Add a new pack after its shared helpers. */
const FACEOFF_VERSION = 30;
const FACEOFF_SCRIPTS = [
	'js/registry.js',
	'js/rules.js',
	'js/arcade-rules.js',
	'js/cup-rules.js',
	'js/runtime.js',
	'js/core.js',
	'js/results.js',
	'js/cup.js',
	'js/icons.js',
	'js/audio.js',
	'js/share.js',
	'js/extras.js',
	'js/funwords.js',
	'js/words.js',
	'js/game-ui.js',
	'js/question-deck.js',
	'js/games/timer.js',
	'js/games/reaction.js',
	'js/games/cut.js',
	'js/games/perceive.js',
	'js/games/more.js',
	'js/games/match.js',
	'js/games/hangman.js',
	'js/games/couple.js',
	'js/games/quiz.js',
	'js/games/duo.js',
	'js/games/arcade.js',
	'js/party.js',
	'js/spy.js',
	'js/table.js',
	'js/net.js',
	'js/group.js',
	'js/fx.js',
	'js/ui/settings.js',
	'js/ui/history.js',
	'js/main.js',
];
const FACEOFF_STYLES = [
	'styles.css',
	'css/base.css',
	'css/play.css',
	'css/party.css',
	'css/theme.css',
	'css/instruments.css',
	'css/boards.css',
	'css/match.css',
	'css/arcade.css',
	'css/cup.css',
	'css/lobby.css',
	'css/responsive.css',
];

if (typeof module !== 'undefined' && module.exports)
	module.exports = { FACEOFF_VERSION, FACEOFF_SCRIPTS, FACEOFF_STYLES };
