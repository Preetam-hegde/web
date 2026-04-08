/* =====================================================================
   DEEP SPACE PORTFOLIO — v1/script.js
   - Compact numbered project tiles (no images)
   - Gallery: full-viewport active card with auto live iframe
   - Cinematic 3D scroll reveals
   - Hero parallax on mousemove
   ===================================================================== */

'use strict';

const state = {
	query: '',
	category: 'all',
	filteredProjects: [],
	galleryIndex: 0
};

/* ── Utilities ─────────────────────────────────────────────────────── */

function isInternalProjectLink(link) {
	return typeof link === 'string' && !/^https?:\/\//i.test(link);
}

function pad(n) {
	return n < 10 ? `0${n}` : String(n);
}

/* ── Compact numbered project tile ────────────────────────────────── */

function createProjectActions(project) {
	const internalHint = isInternalProjectLink(project.link)
		? 'data-action="peek"'
		: 'data-action="peek"';
	return `
		<div class="project-actions">
			<button class="btn btn-ghost btn-xs" type="button" ${internalHint}
				data-link="${project.link}" data-name="${project.name}">Peek</button>
			<a href="${project.link}" class="btn btn-xs" target="_blank" rel="noopener noreferrer">→ Open</a>
		</div>
	`;
}

function generateTileHTML(project, index) {
	const techHtml = project.tech
		.slice(0, 4)
		.map((t) => `<span class="skill-tag">${t}</span>`)
		.join('');
	return `
		<article class="project-card" data-category="${project.category}">
			<span class="card-num">${pad(index + 1)}</span>
			<h3>${project.name}</h3>
			<p class="card-desc">${project.description}</p>
			<div class="skills">${techHtml}</div>
			${createProjectActions(project)}
		</article>
	`;
}

/* ── Filter logic ──────────────────────────────────────────────────── */

function updateFilteredProjects() {
	if (!Array.isArray(projects)) {
		state.filteredProjects = [];
		return;
	}

	const query = state.query.trim().toLowerCase();

	state.filteredProjects = projects.filter((project) => {
		const catMatch =
			state.category === 'all' ||
			String(project.category).toLowerCase() === state.category;
		if (!catMatch) return false;
		if (!query) return true;
		const hay =
			`${project.name} ${project.description} ${project.category} ${project.tech.join(' ')}`.toLowerCase();
		return hay.includes(query);
	});

	if (state.galleryIndex >= state.filteredProjects.length) {
		state.galleryIndex = 0;
	}
}

/* ── 3D card tilt on mouse ─────────────────────────────────────────── */

function applyProjectCardTilt() {
	document.querySelectorAll('.project-card').forEach((card) => {
		card.addEventListener('mousemove', (e) => {
			const r = card.getBoundingClientRect();
			const rotY = ((e.clientX - r.left) / r.width - 0.5) * 10;
			const rotX = (0.5 - (e.clientY - r.top) / r.height) * 8;
			card.style.setProperty('--tiltX', `${rotX.toFixed(2)}deg`);
			card.style.setProperty('--tiltY', `${rotY.toFixed(2)}deg`);
		});
		card.addEventListener('mouseleave', () => {
			card.style.setProperty('--tiltX', '0deg');
			card.style.setProperty('--tiltY', '0deg');
		});
	});
}

/* ── Render project grid ───────────────────────────────────────────── */

function renderModernProjects() {
	const container = document.getElementById('projectContainer');
	if (!container) return;

	updateFilteredProjects();

	if (!state.filteredProjects.length) {
		container.innerHTML =
			'<div class="project-card-empty">No projects match — try another search or filter.</div>';
		return;
	}

	container.innerHTML = state.filteredProjects.map(generateTileHTML).join('');

	container.querySelectorAll('.project-card').forEach((card, i) => {
		card.style.setProperty('--card-animation-delay', `${i * 0.07}s`);
	});

	applyProjectCardTilt();
}

/* ── Gallery helpers ───────────────────────────────────────────────── */

function getRelativeSlot(index, activeIndex, length) {
	let delta = (index - activeIndex + length) % length;
	if (delta > length / 2) delta -= length;
	if (delta === 0)  return 'is-active';
	if (delta === -1) return 'is-left';
	if (delta ===  1) return 'is-right';
	if (delta === -2) return 'is-left-far';
	if (delta ===  2) return 'is-right-far';
	return 'is-hidden';
}

/**
 * Build the inner HTML for a gallery card.
 * Active cards get a live iframe; side cards get a thumbnail + title.
 */
function buildGalleryCardHTML(project, slot) {
	const isActive = slot === 'is-active';
	const tech = project.tech
		.slice(0, 3)
		.map((t) => `<span class="skill-tag">${t}</span>`)
		.join('');

	if (isActive) {
		const frameSrc = isInternalProjectLink(project.link)
			? project.link
			: 'about:blank';
		return `
			<div class="gallery-card-inner">
				<div class="gallery-card-header">
					<h3>${project.name}</h3>
					<p>${project.description}</p>
				</div>
				<iframe
					class="gallery-live-frame"
					src="${frameSrc}"
					title="Live preview of ${project.name}"
					loading="lazy"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
				></iframe>
				<div class="gallery-card-footer">
					<div class="skills">${tech}</div>
					<div class="project-actions">
						<button class="btn btn-ghost btn-xs" type="button"
							data-action="peek"
							data-link="${project.link}"
							data-name="${project.name}">Peek</button>
						<a href="${project.link}" class="btn btn-xs"
							target="_blank" rel="noopener noreferrer">→ Full</a>
					</div>
				</div>
			</div>
		`;
	}

	// Side card: just thumbnail + title
	return `
		<div class="gallery-card-inner">
			<img class="gallery-thumb" src="${project.image}" alt="${project.name}">
			<div class="gallery-card-header">
				<h3>${project.name}</h3>
				<p>${project.description}</p>
			</div>
		</div>
	`;
}

/* ── Render gallery ────────────────────────────────────────────────── */

function renderGallery() {
	const stage = document.getElementById('galleryStage');
	const dots  = document.getElementById('galleryDots');
	if (!stage || !dots) return;

	updateFilteredProjects();

	if (!state.filteredProjects.length) {
		stage.innerHTML = '<div class="project-card-empty">Gallery is empty for this filter.</div>';
		dots.innerHTML = '';
		return;
	}

	const items = state.filteredProjects;

	stage.innerHTML = items.map((project, index) => {
		const slot = getRelativeSlot(index, state.galleryIndex, items.length);
		return `
			<article class="gallery-card ${slot}" data-gallery-index="${index}">
				${buildGalleryCardHTML(project, slot)}
			</article>
		`;
	}).join('');

	dots.innerHTML = items.map((project, index) => `
		<button
			class="gallery-dot ${index === state.galleryIndex ? 'active' : ''}"
			type="button"
			data-dot-index="${index}"
			aria-label="Go to ${project.name}">
		</button>
	`).join('');
}

function shiftGallery(step) {
	if (!state.filteredProjects.length) return;
	state.galleryIndex =
		(state.galleryIndex + step + state.filteredProjects.length) %
		state.filteredProjects.length;
	renderGallery();
}

/* ── Project filters + search ──────────────────────────────────────── */

function initializeProjectFilters() {
	const filterContainer = document.getElementById('projectFilters');
	const searchInput     = document.getElementById('projectSearch');
	if (!filterContainer || !searchInput || !Array.isArray(projects)) return;

	const categories = [
		'all',
		...new Set(projects.map((p) => String(p.category).toLowerCase()))
	];

	filterContainer.innerHTML = categories
		.map(
			(cat) =>
				`<button class="filter-chip ${cat === state.category ? 'active' : ''}"
				type="button" data-filter="${cat}">${cat}</button>`
		)
		.join('');

	filterContainer.addEventListener('click', (e) => {
		const chip = e.target.closest('[data-filter]');
		if (!chip) return;
		state.category = chip.dataset.filter;
		filterContainer.querySelectorAll('.filter-chip').forEach((btn) => {
			btn.classList.toggle('active', btn.dataset.filter === state.category);
		});
		state.galleryIndex = 0;
		renderModernProjects();
		renderGallery();
	});

	searchInput.addEventListener('input', (e) => {
		state.query = e.target.value;
		state.galleryIndex = 0;
		renderModernProjects();
		renderGallery();
	});
}

/* ── Preview Modal (from project-grid Peek buttons) ──────────────── */

function setupPreviewModal() {
	const modal       = document.getElementById('previewModal');
	const closeButton = document.getElementById('previewClose');
	const frame       = document.getElementById('previewFrame');
	const title       = document.getElementById('previewTitle');
	const hint        = document.getElementById('previewHint');
	const openNewLink = document.getElementById('previewOpenNew');
	if (!modal || !closeButton || !frame) return;

	const closeModal = () => {
		modal.classList.remove('active');
		modal.setAttribute('aria-hidden', 'true');
		frame.src = 'about:blank';
		if (hint) hint.textContent = '';
	};

	const openModal = (link, name) => {
		if (title) title.textContent = `${name} — Live Preview`;
		if (openNewLink) openNewLink.href = link;
		modal.classList.add('active');
		modal.setAttribute('aria-hidden', 'false');

		if (isInternalProjectLink(link)) {
			frame.src = link;
			if (hint) hint.textContent = 'Embedded local demo. Open Full for full-screen experience.';
		} else {
			frame.src = 'about:blank';
			if (hint) hint.textContent = 'External project may block embedding — use Open Full.';
		}
	};

	document.addEventListener('click', (e) => {
		const trigger = e.target.closest('[data-action="peek"]');
		if (!trigger) return;
		const link = trigger.getAttribute('data-link');
		const name = trigger.getAttribute('data-name') || 'Project';
		if (!link) return;
		openModal(link, name);
	});

	closeButton.addEventListener('click', closeModal);
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
	});
}

/* ── Gallery nav controls ──────────────────────────────────────────── */

function setupGalleryControls() {
	const prev = document.getElementById('galleryPrev');
	const next = document.getElementById('galleryNext');
	const dots = document.getElementById('galleryDots');

	if (prev) prev.addEventListener('click', () => shiftGallery(-1));
	if (next) next.addEventListener('click', () => shiftGallery(1));

	// Keyboard arrow support when gallery is in view
	document.addEventListener('keydown', (e) => {
		if (
			(e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
			document.getElementById('gallery')
		) {
			shiftGallery(e.key === 'ArrowLeft' ? -1 : 1);
		}
	});

	if (dots) {
		dots.addEventListener('click', (e) => {
			const dot = e.target.closest('[data-dot-index]');
			if (!dot) return;
			state.galleryIndex = Number(dot.getAttribute('data-dot-index'));
			renderGallery();
		});
	}
}

/* ── Scroll progress bar ───────────────────────────────────────────── */

function setupScrollProgress() {
	const bar = document.getElementById('scrollProgress');
	if (!bar) return;

	const update = () => {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update, { passive: true });
}

/* ── Resume snapshot ───────────────────────────────────────────────── */

async function renderResumeSnapshot() {
	if (!window.resumeCommon?.loadResumeData) return;

	const summaryText    = document.getElementById('resumeSummaryText');
	const skillsList     = document.getElementById('resumeSkillsList');
	const experienceList = document.getElementById('resumeExperienceList');
	const highlightsList = document.getElementById('resumeHighlightsList');
	if (!summaryText || !skillsList || !experienceList || !highlightsList) return;

	try {
		const data       = await window.resumeCommon.loadResumeData('resource/RESUME.md');
		const summary    = window.resumeCommon.findSection(data, ['summary']);
		const skills     = window.resumeCommon.findSection(data, ['core skills', 'skills']);
		const experience = window.resumeCommon.findSection(data, ['professional experience', 'experience']);
		const highlights = window.resumeCommon.findSection(data, ['impact highlights']);

		summaryText.textContent =
			summary?.paragraphs?.length ? summary.paragraphs.join(' ') : 'Resume summary not available.';

		skillsList.innerHTML = '';
		(skills?.bullets?.length ? skills.bullets : ['Skills unavailable']).forEach((s) => {
			const tag = document.createElement('span');
			tag.className = 'skill-tag';
			tag.textContent = s;
			skillsList.appendChild(tag);
		});

		experienceList.innerHTML = '';
		(experience?.bullets?.length ? experience.bullets : ['Experience unavailable']).forEach((item) => {
			const li = document.createElement('li');
			li.textContent = item;
			experienceList.appendChild(li);
		});

		highlightsList.innerHTML = '';
		(highlights?.bullets?.length ? highlights.bullets : ['Highlights unavailable']).forEach((item) => {
			const li = document.createElement('li');
			li.textContent = item;
			highlightsList.appendChild(li);
		});
	} catch {
		summaryText.textContent = 'Unable to load resume data right now.';
	}
}

/* ── IntersectionObserver: cinematic section reveals + nav highlighting */

function setupSectionObservers() {
	// Cinematic 3D reveal
	const revealTargets = document.querySelectorAll('.resume, .projects, .gallery-showcase, .contact');
	const revealObs = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					revealObs.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12 }
	);
	revealTargets.forEach((el) => revealObs.observe(el));

	// Active nav link highlight
	const navLinks = [
		...document.querySelectorAll('.nav-links a[href^="#"]'),
		...document.querySelectorAll('.mobile-nav a[href^="#"]')
	];
	const trackedIds  = ['about', 'resume', 'projects', 'gallery', 'contact'];
	const navSections = trackedIds
		.map((id) => document.getElementById(id))
		.filter(Boolean);

	const navObs = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const id = entry.target.id;
				navLinks.forEach((a) => {
					a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
				});
			});
		},
		{ rootMargin: '-35% 0px -50% 0px', threshold: 0.1 }
	);
	navSections.forEach((el) => navObs.observe(el));
}

/* ── Hero parallax on mousemove ────────────────────────────────────── */

function setupHeroParallax() {
	const content = document.querySelector('.hero-content');
	if (!content) return;

	window.addEventListener('mousemove', (e) => {
		const cx = window.innerWidth  / 2;
		const cy = window.innerHeight / 2;
		const dx = (e.clientX - cx) / cx;
		const dy = (e.clientY - cy) / cy;
		content.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
	}, { passive: true });

	// Reset on leave
	document.querySelector('.hero')?.addEventListener('mouseleave', () => {
		content.style.transform = '';
	});
}

/* ── Theme toggle ──────────────────────────────────────────────────── */

function setupThemeToggle() {
	const btn = document.querySelector('.theme-toggle');
	if (!btn) return;
	document.body.classList.add('dark-theme');
	btn.innerHTML = '<i class="fas fa-sun"></i>';
	btn.addEventListener('click', () => {
		document.body.classList.toggle('dark-theme');
		btn.innerHTML = document.body.classList.contains('dark-theme')
			? '<i class="fas fa-sun"></i>'
			: '<i class="fas fa-moon"></i>';
	});
}

function setupMedievalToggle() {
	const toggle = document.getElementById('medievalToggle');
	const audio = document.getElementById('medievalAudio');
	if (!toggle || !audio) return;

	audio.volume = 0.5;

	const setPlayingUI = (playing) => {
		toggle.classList.toggle('is-playing', playing);
		toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
	};

	toggle.addEventListener('click', async () => {
		if (!audio.paused) {
			audio.pause();
			setPlayingUI(false);
			localStorage.setItem('modern-medieval-music', 'off');
			return;
		}

		try {
			await audio.play();
			setPlayingUI(true);
			localStorage.setItem('modern-medieval-music', 'on');
		} catch (error) {
			setPlayingUI(false);
		}
	});

}

/* ── Nav hamburger + smooth scroll ────────────────────────────────── */

function setupNavigation() {
	const hamburger = document.querySelector('.hamburger');
	const mobileNav = document.querySelector('.mobile-nav');

	if (hamburger && mobileNav) {
		hamburger.addEventListener('click', () => mobileNav.classList.toggle('active'));
	}

	document.querySelectorAll('a[href^="#"]').forEach((a) => {
		a.addEventListener('click', (e) => {
			e.preventDefault();
			const target = document.querySelector(a.getAttribute('href'));
			if (!target) return;
			target.scrollIntoView({ behavior: 'smooth' });
			if (mobileNav?.classList.contains('active')) {
				mobileNav.classList.remove('active');
			}
		});
	});
}

function setupEmbedModeGuards() {
	const params = new URLSearchParams(window.location.search);
	if (params.get('desktopEmbed') !== '1') return;

	document.body.classList.add('desktop-embed');
	document.querySelectorAll('[data-terminal-link]').forEach((link) => {
		link.setAttribute('aria-hidden', 'true');
		link.setAttribute('tabindex', '-1');
		link.style.display = 'none';
	});
}

/* ── Contact form ──────────────────────────────────────────────────── */

function setupContactForm() {
	const form = document.getElementById('contactForm');
	if (!form) return;
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const btn = form.querySelector('button[type="submit"]');
		if (btn) {
			btn.disabled = true;
			btn.textContent = 'Message Received ✓';
		}
		form.reset();
		setTimeout(() => {
			if (btn) {
				btn.disabled = false;
				btn.textContent = 'Send Message';
			}
		}, 2500);
	});
}

/* ── Particles ─────────────────────────────────────────────────────── */

function loadExternalScript(src, id) {
	return new Promise((resolve, reject) => {
		const existing = id ? document.getElementById(id) : null;
		if (existing) {
			if (existing.getAttribute('data-loaded') === 'true') {
				resolve();
				return;
			}
			existing.addEventListener('load', () => resolve(), { once: true });
			existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
				once: true
			});
			return;
		}

		const script = document.createElement('script');
		script.src = src;
		script.async = false;
		if (id) script.id = id;
		script.addEventListener('load', () => {
			script.setAttribute('data-loaded', 'true');
			resolve();
		});
		script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
		document.head.appendChild(script);
	});
}

function ensureParticlesLibrary() {
	if (typeof particlesJS === 'function') {
		return Promise.resolve();
	}

	const localParticlesSrc = 'resource/vendor/particles/particles.js';
	const cdnScript = document.getElementById('particlesCdnScript');

	return new Promise((resolve) => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			resolve();
		};

		const loadLocalFallback = () => {
			loadExternalScript(localParticlesSrc, 'particlesLocalScript')
				.then(finish)
				.catch(finish);
		};

		if (!cdnScript) {
			loadLocalFallback();
			return;
		}

		cdnScript.addEventListener('load', finish, { once: true });
		cdnScript.addEventListener('error', loadLocalFallback, { once: true });

		setTimeout(() => {
			if (typeof particlesJS === 'function') {
				finish();
				return;
			}
			loadLocalFallback();
		}, 2500);
	});
}

function setupParticles() {
	if (typeof particlesJS !== 'function') return;
	particlesJS('particles-js', {
		particles: {
			number: { value: 70 },
			color: { value: ['#a855f7', '#06d6a0', '#f72585'] },
			shape: { type: 'circle' },
			opacity: { value: 0.45, random: true },
			size: { value: 2.5, random: true },
			line_linked: {
				enable: true,
				distance: 140,
				color: '#a855f7',
				opacity: 0.15,
				width: 1
			},
			move: {
				enable: true,
				speed: 1.4,
				direction: 'none',
				random: true,
				out_mode: 'out'
			}
		},
		interactivity: {
			detect_on: 'canvas',
			events: {
				onhover: { enable: true, mode: 'grab' },
				onclick: { enable: false }
			},
			modes: {
				grab: { distance: 120, line_linked: { opacity: 0.3 } }
			}
		}
	});
}

/* ── Hero name gradient-text upgrade ──────────────────────────────── */

function upgradeHeroName() {
	const h1 = document.querySelector('.hero h1');
	if (!h1) return;
	// Wrap the name span content in gradient-text class if not already
	const nameSpan = h1.querySelector('span');
	if (nameSpan && !nameSpan.classList.contains('gradient-text')) {
		nameSpan.classList.add('gradient-text');
	}
}

/* ── Master init ───────────────────────────────────────────────────── */

function initPortfolio() {
	// Init state
	state.filteredProjects = Array.isArray(projects) ? [...projects] : [];

	setupEmbedModeGuards();
	setupThemeToggle();
	setupMedievalToggle();
	setupNavigation();
	setupContactForm();
	ensureParticlesLibrary().then(setupParticles);
	setupScrollProgress();
	setupSectionObservers();
	upgradeHeroName();
	setupHeroParallax();

	initializeProjectFilters();
	renderModernProjects();
	renderGallery();
	setupGalleryControls();
	setupPreviewModal();
	renderResumeSnapshot();
}

document.addEventListener('DOMContentLoaded', initPortfolio);
