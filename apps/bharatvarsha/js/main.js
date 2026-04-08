import { BharatGame } from './game.js';
import { GameUI } from './ui.js';

const game = new BharatGame();
const ui = new GameUI(game);

game.setHooks({
	onUpdate: (view) => ui.render(view),
	onModal: (title, body) => ui.showModal(title, body)
});

game.start();
