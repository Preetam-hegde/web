import { WORKER_TYPES } from './config.js';

const RESOURCE_META = [
	{ key: 'food', label: 'Food', icon: 'fa-wheat-awn', className: 'tone-food' },
	{ key: 'wood', label: 'Wood', icon: 'fa-tree', className: 'tone-wood' },
	{ key: 'stone', label: 'Stone', icon: 'fa-mountain', className: 'tone-stone' },
	{ key: 'vidya', label: 'Vidya', icon: 'fa-scroll', className: 'tone-vidya' }
];

export class GameUI {
	constructor(game) {
		this.game = game;
		this.el = {
			root: document.body,
			year: document.getElementById('year-display'),
			era: document.getElementById('era-display'),
			pop: document.getElementById('pop-display'),
			morale: document.getElementById('morale-display'),
			moraleFill: document.getElementById('morale-fill'),
			weather: document.getElementById('weather-display'),
			statusHint: document.getElementById('status-hint'),
			resources: document.getElementById('resource-grid'),
			workers: document.getElementById('workers-container'),
			buildings: document.getElementById('building-container'),
			rituals: document.getElementById('rituals-container'),
			upgrades: document.getElementById('upgrades-container'),
			objective: document.getElementById('objective-text'),
			logs: document.getElementById('event-log'),
			pauseBtn: document.getElementById('btn-pause-game'),
			speed: document.getElementById('speed-select'),
			saveBtn: document.getElementById('btn-save-game'),
			resetBtn: document.getElementById('btn-reset-game'),
			modal: document.getElementById('modal-overlay'),
			modalTitle: document.getElementById('modal-title'),
			modalBody: document.getElementById('modal-body'),
			modalClose: document.getElementById('modal-close')
		};

		this.bindEvents();
	}

	bindEvents() {
		document.addEventListener('click', (event) => {
			const trigger = event.target.closest('[data-action]');
			if (!trigger) return;
			const { action, key } = trigger.dataset;

			if (action === 'manual') this.game.manualGather(key);
			if (action === 'recruit') this.game.recruitVillager();
			if (action === 'assign') this.game.assignWorker(key);
			if (action === 'remove') this.game.removeWorker(key);
			if (action === 'build') this.game.build(key);
			if (action === 'ritual') this.game.performRitual(key);
			if (action === 'upgrade') this.game.research(key);
			if (action === 'pause') this.game.togglePause();
			if (action === 'save') this.game.save(false);
			if (action === 'reset') {
				if (window.confirm('Reset kingdom progress? This cannot be undone.')) {
					this.game.reset();
				}
			}
			if (action === 'modal-close') this.hideModal();
		});

		this.el.speed.addEventListener('change', (event) => {
			this.game.setSpeed(event.target.value);
		});

		window.addEventListener('beforeunload', () => this.game.save(true));
	}

	render(view) {
		this.el.year.textContent = `${Math.floor(view.state.year)} BCE`;
		this.el.era.textContent = view.state.era;
		this.el.pop.textContent = `${view.population.total} / ${view.population.max}`;
		this.el.weather.textContent = view.state.weather;
		this.el.morale.textContent = `${Math.round(view.state.morale)}%`;
		this.el.moraleFill.style.width = `${Math.round(view.state.morale)}%`;
		this.el.objective.textContent = view.objective;
		this.el.statusHint.textContent = view.statusHint;
		this.el.pauseBtn.textContent = view.time.paused ? 'Resume' : 'Pause';
		this.el.speed.value = String(view.time.speed);

		this.applyRootState(view);
		this.renderResources(view);
		this.renderWorkers(view);
		this.renderBuildings(view);
		this.renderRituals(view);
		this.renderUpgrades(view);
		this.renderLogs(view);
	}

	applyRootState(view) {
		this.el.root.classList.remove('weather-monsoon', 'weather-drought', 'low-morale');
		if (view.state.weather === 'Monsoon') this.el.root.classList.add('weather-monsoon');
		if (view.state.weather === 'Drought') this.el.root.classList.add('weather-drought');
		if (view.state.morale <= 35) this.el.root.classList.add('low-morale');
	}

	renderResources(view) {
		this.el.resources.innerHTML = RESOURCE_META.map((resource) => {
			const amount = Math.floor(view.resources[resource.key]);
			const rate = view.rates[resource.key] || 0;
			const rateClass = rate > 0 ? 'rate-positive' : rate < 0 ? 'rate-negative' : 'rate-neutral';
			const sign = rate >= 0 ? '+' : '';
			return `
				<article class="resource-card ${resource.className}">
					<div class="resource-head">
						<span><i class="fas ${resource.icon}"></i> ${resource.label}</span>
						<strong>${amount}</strong>
					</div>
					<div class="resource-rate ${rateClass}">${sign}${rate.toFixed(1)}/sec</div>
				</article>
			`;
		}).join('');
	}

	renderWorkers(view) {
		const idle = view.population.idle;
		this.el.workers.innerHTML = `
			<div class="idle-pill">Unemployed Villagers: <strong>${idle}</strong></div>
				<button class="action-btn recruit-btn" data-action="recruit" ${view.population.total >= view.population.max || view.resources.food < 15 ? 'disabled' : ''}>Recruit Villager (Food: 15)</button>
			${WORKER_TYPES.map((worker) => `
				<article class="worker-card">
					<header>
						<h4><i class="fas ${worker.icon}"></i> ${worker.name}</h4>
						<span>${view.population[worker.key]}</span>
					</header>
					<p>${worker.desc}</p>
					<div class="worker-actions">
						<button data-action="assign" data-key="${worker.key}" ${idle <= 0 ? 'disabled' : ''}>+</button>
						<button data-action="remove" data-key="${worker.key}" ${view.population[worker.key] <= 0 ? 'disabled' : ''}>-</button>
					</div>
				</article>
			`).join('')}
		`;
	}

	renderBuildings(view) {
		this.el.buildings.innerHTML = Object.entries(view.buildings).map(([key, building]) => {
			const canAfford = this.canAfford(view.resources, building.cost);
			return `
				<article class="game-card">
					<header>
						<h4><i class="fas ${building.icon}"></i> ${building.name}</h4>
						<span>x${building.count}</span>
					</header>
					<p>${building.desc}</p>
					<div class="cost-line">${this.costString(building.cost)}</div>
					<button class="action-btn" data-action="build" data-key="${key}" ${canAfford ? '' : 'disabled'}>Build</button>
				</article>
			`;
		}).join('');
	}

	renderRituals(view) {
		this.el.rituals.innerHTML = Object.entries(view.rituals).map(([key, ritual]) => {
			const canAfford = this.canAfford(view.resources, ritual.cost);
			return `
				<article class="game-card ritual">
					<header>
						<h4>${ritual.name}</h4>
					</header>
					<p>${ritual.desc}</p>
					<div class="cost-line">${this.costString(ritual.cost)}</div>
					<button class="action-btn alt" data-action="ritual" data-key="${key}" ${canAfford ? '' : 'disabled'}>Perform</button>
				</article>
			`;
		}).join('');
	}

	renderUpgrades(view) {
		this.el.upgrades.innerHTML = Object.entries(view.upgrades).map(([key, upgrade]) => {
			const canAfford = this.canAfford(view.resources, upgrade.cost);
			const disabled = upgrade.applied || !canAfford;
			return `
				<article class="game-card upgrade ${upgrade.applied ? 'done' : ''}">
					<header>
						<h4>${upgrade.name}</h4>
						<span>${upgrade.applied ? 'Done' : 'Pending'}</span>
					</header>
					<p>${upgrade.desc}</p>
					<div class="cost-line">${this.costString(upgrade.cost)}</div>
					<button class="action-btn" data-action="upgrade" data-key="${key}" ${disabled ? 'disabled' : ''}>${upgrade.applied ? 'Researched' : 'Research'}</button>
				</article>
			`;
		}).join('');
	}

	renderLogs(view) {
		this.el.logs.innerHTML = view.chronicles.map((entry) => `
			<div class="log-entry tone-${entry.tone}">[${entry.year} BCE] ${entry.text}</div>
		`).join('');
	}

	showModal(title, body) {
		this.el.modalTitle.textContent = title;
		this.el.modalBody.textContent = body;
		this.el.modal.classList.remove('hidden');
	}

	hideModal() {
		this.el.modal.classList.add('hidden');
	}

	canAfford(resources, cost) {
		return resources.food >= (cost.food || 0)
			&& resources.wood >= (cost.wood || 0)
			&& resources.stone >= (cost.stone || 0)
			&& resources.vidya >= (cost.vidya || 0);
	}

	costString(cost) {
		return Object.entries(cost)
			.map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`)
			.join(' | ');
	}
}
