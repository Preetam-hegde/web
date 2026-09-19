import { BharatGame } from './game.js';
import { GameUI } from './ui.js';

const TOAST_TONES = new Set(['red', 'orange', 'purple', 'green']);

const game = new BharatGame();
const ui = new GameUI(game);

game.setHooks({
	onUpdate: (view) => ui.render(view),
	onModal: (modal) => ui.showModal(modal),
	onLog: ({ text, tone }) => TOAST_TONES.has(tone) && ui.toast(text, tone)
});

game.start();
