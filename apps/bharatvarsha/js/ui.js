import { ERAS, WORKER_TYPES } from './config.js';
import { createScene } from './scene.js';

const RESOURCE_META = [
	{ key: 'food', label: 'Food', icon: 'fa-wheat-awn', className: 'tone-food' },
	{ key: 'wood', label: 'Wood', icon: 'fa-tree', className: 'tone-wood' },
	{ key: 'stone', label: 'Stone', icon: 'fa-mountain', className: 'tone-stone' },
	{ key: 'vidya', label: 'Vidya', icon: 'fa-scroll', className: 'tone-vidya' }
];
const ICON = Object.fromEntries(RESOURCE_META.map((resource) => [resource.key, resource.icon]));

// The game re-renders every tick. Writing identical markup would replace buttons mid-click
// and drop keyboard focus, so skip the write when nothing changed.
const rendered = new WeakMap();
function setHTML(el, html) {
	if (rendered.get(el) === html) return;
	rendered.set(el, html);
	el.innerHTML = html;
}

export class GameUI {
	constructor(game) {
		this.game = game;
		this.modalQueue = [];
		this.choices = [];
		this.el = {
			root: document.body,
			year: document.getElementById('year-display'),
			era: document.getElementById('era-display'),
			pop: document.getElementById('pop-display'),
			morale: document.getElementById('morale-display'),
			moraleFill: document.getElementById('morale-fill'),
			weather: document.getElementById('weather-display'),
			statusHint: document.getElementById('status-hint'),
			chapterEyebrow: document.getElementById('chapter-eyebrow'),
			chapterTitle: document.getElementById('chapter-title'),
			resources: document.getElementById('resource-grid'),
			workers: document.getElementById('workers-container'),
			buildings: document.getElementById('building-container'),
			rituals: document.getElementById('rituals-container'),
			upgrades: document.getElementById('upgrades-container'),
			objective: document.getElementById('objective-text'),
			objectiveFill: document.getElementById('objective-fill'),
			objectiveCount: document.getElementById('objective-count'),
			logs: document.getElementById('event-log'),
			pauseBtn: document.getElementById('btn-pause-game'),
			speed: document.getElementById('speed-select'),
			modal: document.getElementById('modal-overlay'),
			modalEyebrow: document.getElementById('modal-eyebrow'),
			modalTitle: document.getElementById('modal-title'),
			modalBody: document.getElementById('modal-body'),
			modalActions: document.getElementById('modal-actions'),
			toasts: document.getElementById('toasts'),
			behindModal: document.querySelectorAll('.game-header, .main-grid')
		};
		this.updateScene = createScene(document.getElementById('scene-buildings'), document.getElementById('scene-people'));

		this.bindEvents();
	}

	bindEvents() {
		document.addEventListener('click', (event) => {
			const trigger = event.target.closest('[data-action]');
			if (!trigger) return;
			const { action, key } = trigger.dataset;

			if (action === 'manual') {
				this.game.manualGather(key);
				this.floatText(trigger, `+1 ${key[0].toUpperCase()}${key.slice(1)}`, key);
			}
			if (action === 'recruit') this.game.recruitVillager();
			if (action === 'assign') this.game.assignWorker(key);
			if (action === 'remove') this.game.removeWorker(key);
			if (action === 'build') this.game.build(key);
			if (action === 'ritual') this.game.performRitual(key);
			if (action === 'upgrade') this.game.research(key);
			if (action === 'pause') this.game.togglePause();
			if (action === 'save') this.game.save(false);
			if (action === 'story') this.game.showStory();
			if (action === 'reset') {
				if (window.confirm('Reset kingdom progress? This cannot be undone.')) {
					this.game.reset();
				}
			}
			if (action === 'choice') {
				const choice = this.choices[key];
				this.hideModal();
				choice.run();
			}
			if (action === 'modal-close') this.hideModal();
		});

		this.el.speed.addEventListener('change', (event) => {
			this.game.setSpeed(event.target.value);
		});

		window.addEventListener('beforeunload', () => this.game.save(true));
	}

	render(view) {
		const { state, population, time, chapter } = view;
		const pct = Math.round((chapter.now / chapter.target) * 100);
		this.el.year.textContent = `${Math.floor(state.year)} BCE`;
		this.el.era.textContent = state.era;
		this.el.pop.textContent = `${population.total} / ${population.max}`;
		this.el.weather.textContent = state.weather;
		this.el.morale.textContent = `${Math.round(state.morale)}%`;
		this.el.moraleFill.style.width = `${Math.round(state.morale)}%`;
		this.el.chapterEyebrow.textContent = chapter.eyebrow;
		this.el.chapterTitle.textContent = chapter.title;
		this.el.objective.textContent = view.objective;
		this.el.objectiveFill.style.width = `${pct}%`;
		this.el.objectiveCount.textContent = `${chapter.now} / ${chapter.target}`;
		this.el.statusHint.textContent = view.statusHint;
		setHTML(this.el.pauseBtn, time.paused ? '<i class="fas fa-play"></i> Resume' : '<i class="fas fa-pause"></i> Pause');
		this.el.speed.value = String(time.speed);

		this.applyRootState(view);
		this.updateScene(view);
		this.renderResources(view);
		this.renderWorkers(view);
		this.renderBuildings(view);
		this.renderRituals(view);
		this.renderUpgrades(view);
		this.renderLogs(view);
	}

	applyRootState({ state }) {
		const { classList, dataset } = this.el.root;
		classList.toggle('weather-monsoon', state.weather === 'Monsoon');
		classList.toggle('weather-drought', state.weather === 'Drought');
		classList.toggle('low-morale', state.morale <= 35);
		dataset.era = ERAS.indexOf(state.era);
	}

	renderResources(view) {
		setHTML(this.el.resources, RESOURCE_META.map((resource) => {
			const amount = Math.floor(view.resources[resource.key]);
			const rate = view.rates[resource.key] || 0;
			const rateClass = rate > 0 ? 'rate-positive' : rate < 0 ? 'rate-negative' : 'rate-neutral';
			const sign = rate >= 0 ? '+' : '';
			const low = amount < 15 && rate < 0 ? 'is-low' : '';
			return `
				<article class="resource-card ${resource.className} ${low}">
					<div class="resource-head">
						<span><i class="fas ${resource.icon}"></i> ${resource.label}</span>
						<strong>${amount}</strong>
					</div>
					<div class="resource-rate ${rateClass}">${sign}${rate.toFixed(1)}/sec</div>
				</article>
			`;
		}).join(''));
	}

	renderWorkers(view) {
		const idle = view.population.idle;
		setHTML(this.el.workers, `
			<div class="idle-pill"><span><i class="fas fa-people-group"></i> Unemployed villagers</span> <strong>${idle}</strong></div>
			<button class="action-btn recruit-btn" data-action="recruit" ${view.population.total >= view.population.max || view.resources.food < 15 ? 'disabled' : ''}><i class="fas fa-user-plus"></i> Recruit Villager (Food: 15)</button>
			${WORKER_TYPES.map((worker) => `
				<article class="worker-card role-${worker.key}">
					<header>
						<h4><i class="fas ${worker.icon}"></i> ${worker.name}</h4>
						<span class="count-badge">${view.population[worker.key]}</span>
					</header>
					<p>${worker.desc}</p>
					<div class="worker-actions">
						<button data-action="assign" data-key="${worker.key}" aria-label="Assign a ${worker.name}" ${idle <= 0 ? 'disabled' : ''}>+</button>
						<button data-action="remove" data-key="${worker.key}" aria-label="Remove a ${worker.name}" ${view.population[worker.key] <= 0 ? 'disabled' : ''}>&minus;</button>
					</div>
				</article>
			`).join('')}
		`);
	}

	renderBuildings(view) {
		setHTML(this.el.buildings, Object.entries(view.buildings).map(([key, building]) => `
			<article class="game-card">
				<header>
					<h4><i class="fas ${building.icon}"></i> ${building.name}</h4>
					<span class="count-badge">×${building.count}</span>
				</header>
				<p>${building.desc}</p>
				${this.costChips(view.resources, building.cost)}
				<button class="action-btn" data-action="build" data-key="${key}" ${this.canAfford(view.resources, building.cost) ? '' : 'disabled'}>Build</button>
			</article>
		`).join(''));
	}

	renderRituals(view) {
		setHTML(this.el.rituals, Object.entries(view.rituals).map(([key, ritual]) => {
			const blocked = this.game.ritualBlock(ritual);
			const disabled = blocked || !this.canAfford(view.resources, ritual.cost);
			return `
				<article class="game-card ritual">
					<header>
						<h4><i class="fas fa-fire-flame-curved"></i> ${ritual.name}</h4>
					</header>
					<p>${ritual.desc}</p>
					${this.costChips(view.resources, ritual.cost)}
					${blocked ? `<div class="lock-note"><i class="fas fa-lock"></i> ${blocked}</div>` : ''}
					<button class="action-btn alt" data-action="ritual" data-key="${key}" ${disabled ? 'disabled' : ''}>Perform</button>
				</article>
			`;
		}).join(''));
	}

	renderUpgrades(view) {
		setHTML(this.el.upgrades, Object.entries(view.upgrades).map(([key, upgrade]) => {
			const disabled = upgrade.applied || !this.canAfford(view.resources, upgrade.cost);
			return `
				<article class="game-card upgrade ${upgrade.applied ? 'done' : ''}">
					<header>
						<h4><i class="fas fa-book-open-reader"></i> ${upgrade.name}</h4>
						<span class="status-badge">${upgrade.applied ? 'Done' : 'Pending'}</span>
					</header>
					<p>${upgrade.desc}</p>
					${this.costChips(view.resources, upgrade.cost)}
					<button class="action-btn" data-action="upgrade" data-key="${key}" ${disabled ? 'disabled' : ''}>${upgrade.applied ? 'Researched' : 'Research'}</button>
				</article>
			`;
		}).join(''));
	}

	renderLogs(view) {
		setHTML(this.el.logs, view.chronicles.map((entry) => `
			<div class="log-entry tone-${entry.tone}"><span class="log-year">${entry.year} BCE</span> ${entry.text}</div>
		`).join(''));
	}

	// Only one modal at a time; later ones (chapter after era, rulings) wait their turn.
	showModal({ eyebrow = 'Royal Event', title, body, choices = [] }) {
		if (!this.el.modal.classList.contains('hidden')) {
			this.modalQueue.push({ eyebrow, title, body, choices });
			return;
		}
		this.choices = choices;
		this.el.modalEyebrow.textContent = eyebrow;
		this.el.modalTitle.textContent = title;
		this.el.modalBody.textContent = body;
		this.el.modalActions.innerHTML = choices.length
			? choices.map((choice, i) => `<button class="action-btn choice" data-action="choice" data-key="${i}" ${choice.disabled ? 'disabled' : ''}><span>${choice.label}</span><small>${choice.hint}</small></button>`).join('')
			: '<button class="action-btn" data-action="modal-close">Continue</button>';
		this.el.modal.classList.remove('hidden');
		this.el.behindModal.forEach((el) => { el.inert = true; });
		this.el.modalActions.querySelector('button:not(:disabled)')?.focus();
	}

	hideModal() {
		this.el.modal.classList.add('hidden');
		this.el.behindModal.forEach((el) => { el.inert = false; });
		const next = this.modalQueue.shift();
		if (next) this.showModal(next);
	}

	toast(text, tone) {
		const el = document.createElement('div');
		el.className = `toast tone-${tone}`;
		el.textContent = text;
		this.el.toasts.append(el);
		while (this.el.toasts.children.length > 3) this.el.toasts.firstChild.remove();
		setTimeout(() => el.remove(), 4200);
	}

	floatText(anchor, text, tone) {
		const { left, top, width } = anchor.getBoundingClientRect();
		const el = document.createElement('span');
		el.className = `float-num tone-${tone}`;
		el.textContent = text;
		el.style.left = `${left + width / 2}px`;
		el.style.top = `${top}px`;
		document.body.append(el);
		setTimeout(() => el.remove(), 900);
	}

	canAfford(resources, cost) {
		return resources.food >= (cost.food || 0)
			&& resources.wood >= (cost.wood || 0)
			&& resources.stone >= (cost.stone || 0)
			&& resources.vidya >= (cost.vidya || 0);
	}

	costChips(resources, cost) {
		const chips = Object.entries(cost).map(([key, amount]) => `<span class="cost ${resources[key] >= amount ? '' : 'short'}"><i class="fas ${ICON[key]}"></i> ${amount}</span>`);
		return `<div class="cost-line">${chips.join('')}</div>`;
	}
}
