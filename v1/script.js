/* =====================================================================
   DEEP SPACE PORTFOLIO — v1/script.js
   - Compact numbered project tiles (no images)
   - Gallery: full-viewport active card with auto live iframe
   - Cinematic 3D scroll reveals
   - Hero parallax on mousemove
   ===================================================================== */

'use strict';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwzgvkd'; // ← replace with your Formspree form ID

const state = {
	query: '',
	category: 'all',
	filteredProjects: [],
	galleryIndex: 0,
	galleryInView: false   // M7/H3: track viewport visibility
};

/* ── Utilities ─────────────────────────────────────────────────────── */

function isInternalProjectLink(link) {
	return typeof link === 'string' && !/^https?:\/\//i.test(link);
}

function pad(n) {
	return n < 10 ? `0${n}` : String(n);
}

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── Compact numbered project tile ────────────────────────────────── */

function createProjectActions(project) {
	const isExternal = !isInternalProjectLink(project.link);
	// H2 fix: external projects show disabled peek with tooltip; internal get full peek
	const peekBtn = isExternal
		? `<button class="btn btn-ghost btn-xs" type="button" disabled
				title="External site — may block embedding. Use Open Full instead."
				aria-label="Preview unavailable for external project">Peek</button>`
		: `<button class="btn btn-ghost btn-xs" type="button" data-action="peek"
				data-link="${project.link}" data-name="${project.name}">Peek</button>`;
	return `
		<div class="project-actions">
			${peekBtn}
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
		<article class="project-card" data-category="${project.category}" aria-labelledby="proj-title-${index}">
			<span class="card-num">${pad(index + 1)}</span>
			<h3 id="proj-title-${index}">${project.name}</h3>
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
	if (prefersReducedMotion()) return;
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

/* ── Render project grid with exit animation ───────────────────────── */

function renderModernProjects() {
	const container = document.getElementById('projectContainer');
	if (!container) return;

	updateFilteredProjects();

	// M11: fade-out existing cards before replacing
	const existing = container.querySelectorAll('.project-card');
	if (existing.length) {
		existing.forEach((c) => c.classList.add('is-exiting'));
	}

	const doRender = () => {
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
	};

	if (existing.length && !prefersReducedMotion()) {
		setTimeout(doRender, 220); // match exit animation duration
	} else {
		doRender();
	}
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
 * Active internal cards get a live iframe.
 * Active external cards get a hero-image overlay with CTA.
 * Side cards get a thumbnail + title.
 */
function buildGalleryCardHTML(project, slot) {
	const isActive = slot === 'is-active';
	const tech = project.tech
		.slice(0, 3)
		.map((t) => `<span class="skill-tag">${t}</span>`)
		.join('');

	if (isActive) {
		const isInternal = isInternalProjectLink(project.link);
		const featuredBadge = project.featured
			? `<span class="gallery-featured-badge">Featured</span>`
			: '';

		if (isInternal) {
			return `
				<div class="gallery-card-inner">
					<div class="gallery-card-header">
						${featuredBadge}
						<h3>${project.name}</h3>
						<p>${project.description}</p>
					</div>
					<div class="gallery-iframe-wrap">
						<div class="gallery-iframe-spinner" aria-hidden="true"><span></span></div>
						<iframe
							class="gallery-live-frame"
							src="${project.link}"
							title="Live preview of ${project.name}"
							loading="lazy"
							sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
						></iframe>
					</div>
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

		// External project — hero image overlay + CTA (H1 fix)
		const imgSrc = project.image || '';
		let hostname = project.link;
		try { hostname = new URL(project.link).hostname; } catch (_) { /* relative path */ }
		return `
			<div class="gallery-card-inner gallery-card-external">
				<div class="gallery-card-header">
					${featuredBadge}
					<h3>${project.name}</h3>
					<p>${project.description}</p>
				</div>
				<div class="gallery-external-hero" ${imgSrc ? `style="background-image:url('${imgSrc}')"` : ''}>
					<div class="gallery-external-overlay">
						<div class="gallery-external-domain">${hostname}</div>
						<p class="gallery-external-hint">Live on the web — opens in a new tab</p>
						<a href="${project.link}" class="btn gallery-external-cta"
							target="_blank" rel="noopener noreferrer">
							<i class="fas fa-external-link-alt" aria-hidden="true"></i> Open Live Site
						</a>
					</div>
				</div>
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
			<img class="gallery-thumb" src="${project.image || ''}" alt="${project.name} thumbnail">
			<div class="gallery-card-header">
				<h3>${project.name}</h3>
				<p>${project.description}</p>
			</div>
		</div>
	`;
}

/* ── Render gallery — M7: reclassify existing cards, don't rebuild ── */

function renderGallery() {
	const stage = document.getElementById('galleryStage');
	const dots  = document.getElementById('galleryDots');
	if (!stage || !dots) return;

	updateFilteredProjects();

	if (!state.filteredProjects.length) {
		stage.innerHTML = '<p class="project-card-empty" style="position:static;transform:none;">Gallery is empty for this filter.</p>';
		dots.innerHTML = '';
		return;
	}

	const items = state.filteredProjects;
	const existingCards = stage.querySelectorAll('.gallery-card[data-gallery-index]');

	if (existingCards.length === items.length) {
		// Reclassify slots without rebuilding DOM
		existingCards.forEach((card) => {
			const idx = Number(card.dataset.galleryIndex);
			const newSlot = getRelativeSlot(idx, state.galleryIndex, items.length);
			const oldSlots = ['is-active','is-left','is-right','is-left-far','is-right-far','is-hidden'];
			oldSlots.forEach((s) => card.classList.remove(s));
			card.classList.add(newSlot);

			// Rebuild inner only for the newly-active card
			if (newSlot === 'is-active') {
				card.innerHTML = buildGalleryCardHTML(items[idx], 'is-active');
				setupGalleryIframeSpinner(card);
			} else if (card.querySelector('.gallery-live-frame')) {
				// Was active, now a side card — replace with thumb
				card.innerHTML = buildGalleryCardHTML(items[idx], newSlot);
			}
		});
	} else {
		// Full rebuild (filter changed count)
		stage.innerHTML = items.map((project, index) => {
			const slot = getRelativeSlot(index, state.galleryIndex, items.length);
			return `
				<article class="gallery-card ${slot}" data-gallery-index="${index}" aria-label="${project.name}">
					${buildGalleryCardHTML(project, slot)}
				</article>
			`;
		}).join('');

		stage.querySelectorAll('.gallery-card.is-active').forEach(setupGalleryIframeSpinner);
	}

	// Update dots
	dots.innerHTML = items.map((project, index) => `
		<button
			class="gallery-dot ${index === state.galleryIndex ? 'active' : ''}"
			type="button"
			role="tab"
			aria-selected="${index === state.galleryIndex ? 'true' : 'false'}"
			data-dot-index="${index}"
			aria-label="Go to ${project.name}">
		</button>
	`).join('');
}

/* M10: wire up iframe spinner */
function setupGalleryIframeSpinner(card) {
	const frame   = card.querySelector('.gallery-live-frame');
	const spinner = card.querySelector('.gallery-iframe-spinner');
	if (!frame || !spinner) return;
	spinner.removeAttribute('aria-hidden');
	frame.addEventListener('load', () => {
		spinner.setAttribute('aria-hidden', 'true');
		spinner.style.display = 'none';
	}, { once: true });
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

/* ── Preview Modal ──────────────────────────────────────────────────── */

function setupPreviewModal() {
	const modal       = document.getElementById('previewModal');
	const closeButton = document.getElementById('previewClose');
	const frame       = document.getElementById('previewFrame');
	const title       = document.getElementById('previewTitle');
	const hint        = document.getElementById('previewHint');
	const openNewLink = document.getElementById('previewOpenNew');
	const spinner     = document.getElementById('previewSpinner');
	if (!modal || !closeButton || !frame) return;

	let lastFocused = null;

	// M8: focus trap helpers
	const getFocusable = () =>
		[...modal.querySelectorAll(
			'a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])'
		)];

	const trapFocus = (e) => {
		if (e.key !== 'Tab') return;
		const focusable = getFocusable();
		if (!focusable.length) return;
		const first = focusable[0];
		const last  = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) { e.preventDefault(); last.focus(); }
		} else {
			if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
		}
	};

	const closeModal = () => {
		modal.classList.remove('active');
		modal.setAttribute('aria-hidden', 'true');
		frame.src = 'about:blank';
		if (hint)    hint.textContent = '';
		if (spinner) { spinner.removeAttribute('aria-hidden'); spinner.style.display = ''; }
		modal.removeEventListener('keydown', trapFocus);
		if (lastFocused) lastFocused.focus();
	};

	const openModal = (link, name) => {
		lastFocused = document.activeElement;
		if (title)    title.textContent = `${name} — Live Preview`;
		if (openNewLink) openNewLink.href = link;
		modal.classList.add('active');
		modal.setAttribute('aria-hidden', 'false');

		// M10: show spinner
		if (spinner) { spinner.removeAttribute('aria-hidden'); spinner.style.display = ''; }
		frame.addEventListener('load', () => {
			if (spinner) { spinner.setAttribute('aria-hidden', 'true'); spinner.style.display = 'none'; }
		}, { once: true });

		if (isInternalProjectLink(link)) {
			frame.src = link;
			if (hint) hint.textContent = 'Embedded local demo. Open Full for full-screen experience.';
		} else {
			frame.src = 'about:blank';
			if (hint) hint.textContent = 'External project blocks embedding — use Open Full to visit.';
		}

		modal.addEventListener('keydown', trapFocus);
		// Move focus into modal
		const focusable = getFocusable();
		if (focusable.length) focusable[0].focus();
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

	// H3 fix: only fire arrow keys when gallery section is actually in view
	document.addEventListener('keydown', (e) => {
		if (!state.galleryInView) return;
		// Also skip if focus is inside an input/textarea
		const tag = document.activeElement?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
		if (e.key === 'ArrowLeft')  { e.preventDefault(); shiftGallery(-1); }
		if (e.key === 'ArrowRight') { e.preventDefault(); shiftGallery(1); }
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

		// Clear skeleton loaders and populate
		skillsList.innerHTML = '';
		skillsList.removeAttribute('aria-busy');
		(skills?.bullets?.length ? skills.bullets : ['Skills unavailable']).forEach((s) => {
			const tag = document.createElement('span');
			tag.className = 'skill-tag';
			tag.textContent = s;
			skillsList.appendChild(tag);
		});

		experienceList.innerHTML = '';
		experienceList.removeAttribute('aria-busy');
		(experience?.bullets?.length ? experience.bullets : ['Experience unavailable']).forEach((item) => {
			const li = document.createElement('li');
			li.textContent = item;
			experienceList.appendChild(li);
		});

		highlightsList.innerHTML = '';
		highlightsList.removeAttribute('aria-busy');
		(highlights?.bullets?.length ? highlights.bullets : ['Highlights unavailable']).forEach((item) => {
			const li = document.createElement('li');
			li.textContent = item;
			highlightsList.appendChild(li);
		});
	} catch {
		summaryText.textContent = 'Unable to load resume data right now.';
		// Clear skeletons with error state
		[experienceList, skillsList, highlightsList].forEach((el) => {
			if (!el) return;
			el.innerHTML = '<li style="color:var(--muted);font-size:0.8rem;">Could not load content.</li>';
			el.removeAttribute('aria-busy');
		});
	}
}

/* ── IntersectionObserver: cinematic reveals + nav + gallery viewport */

function setupSectionObservers() {
	// M12: skip heavy animations if reduced motion
	const skipAnim = prefersReducedMotion();

	// Cinematic 3D reveal
	const revealTargets = document.querySelectorAll('.resume, .projects, .gallery-showcase, .contact');

	if (skipAnim) {
		revealTargets.forEach((el) => el.classList.add('is-visible'));
	} else {
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
	}

	// H3: track gallery viewport state for scoped arrow-key nav
	const gallerySection = document.getElementById('gallery');
	if (gallerySection) {
		const galleryObs = new IntersectionObserver(
			(entries) => { state.galleryInView = entries[0].isIntersecting; },
			{ threshold: 0.2 }
		);
		galleryObs.observe(gallerySection);
	}

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
	if (prefersReducedMotion()) return;  // M12
	const content = document.querySelector('.hero-content');
	if (!content) return;

	let raf;
	window.addEventListener('mousemove', (e) => {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => {
			const cx = window.innerWidth  / 2;
			const cy = window.innerHeight / 2;
			const dx = (e.clientX - cx) / cx;
			const dy = (e.clientY - cy) / cy;
			content.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
		});
	}, { passive: true });

	document.querySelector('.hero')?.addEventListener('mouseleave', () => {
		cancelAnimationFrame(raf);
		content.style.transform = '';
	});
}

/* ── Theme toggle — M1: persist to localStorage ────────────────────── */

function setupThemeToggle() {
	const btn = document.getElementById('themeToggle');
	if (!btn) return;

	const saved = localStorage.getItem('portfolio-theme');
	const isDark = saved ? saved === 'dark' : true; // default dark

	const applyTheme = (dark) => {
		document.body.classList.toggle('dark-theme', dark);
		btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
		btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
		btn.innerHTML = dark
			? '<i class="fas fa-sun" aria-hidden="true"></i>'
			: '<i class="fas fa-moon" aria-hidden="true"></i>';
	};

	applyTheme(isDark);

	btn.addEventListener('click', () => {
		const nowDark = !document.body.classList.contains('dark-theme');
		applyTheme(nowDark);
		localStorage.setItem('portfolio-theme', nowDark ? 'dark' : 'light');
	});
}

/* ── Medieval toggle — M2: restore preference ──────────────────────── */

function setupMedievalToggle() {
	const toggle = document.getElementById('medievalToggle');
	const audio  = document.getElementById('medievalAudio');
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
			localStorage.setItem('portfolio-medieval-music', 'off');
			return;
		}
		try {
			await audio.play();
			setPlayingUI(true);
			localStorage.setItem('portfolio-medieval-music', 'on');
		} catch (_) {
			setPlayingUI(false);
		}
	});

	// Restore saved preference (autoplay only works after user gesture so we just set UI state)
	if (localStorage.getItem('portfolio-medieval-music') === 'on') {
		audio.play().then(() => setPlayingUI(true)).catch(() => {});
	}
}

/* ── Nav hamburger + smooth scroll — M3+M4 fixes ──────────────────── */

function setupNavigation() {
	const hamburger = document.getElementById('hamburger');
	const mobileNav = document.getElementById('mobileNav');

	if (hamburger && mobileNav) {
		const openNav = () => {
			mobileNav.classList.add('is-open');
			hamburger.setAttribute('aria-expanded', 'true');
			hamburger.setAttribute('aria-label', 'Close navigation menu');
			hamburger.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
		};
		const closeNav = () => {
			mobileNav.classList.remove('is-open');
			hamburger.setAttribute('aria-expanded', 'false');
			hamburger.setAttribute('aria-label', 'Open navigation menu');
			hamburger.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
		};

		hamburger.addEventListener('click', (e) => {
			e.stopPropagation();
			mobileNav.classList.contains('is-open') ? closeNav() : openNav();
		});

		// M3: close on outside click
		document.addEventListener('click', (e) => {
			if (mobileNav.classList.contains('is-open') &&
				!mobileNav.contains(e.target) &&
				!hamburger.contains(e.target)) {
				closeNav();
			}
		});

		// Close on Escape
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
				closeNav();
				hamburger.focus();
			}
		});
	}

	// Smooth scroll
	document.querySelectorAll('a[href^="#"]').forEach((a) => {
		a.addEventListener('click', (e) => {
			e.preventDefault();
			const target = document.querySelector(a.getAttribute('href'));
			if (!target) return;
			target.scrollIntoView({ behavior: 'smooth' });
			if (mobileNav?.classList.contains('is-open')) {
				mobileNav.classList.remove('is-open');
				if (hamburger) {
					hamburger.setAttribute('aria-expanded', 'false');
					hamburger.setAttribute('aria-label', 'Open navigation menu');
					hamburger.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
				}
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

/* ── Contact form — C1+H4: validation + Formspree submission ────────── */

function setupContactForm() {
	const form   = document.getElementById('contactForm');
	const btn    = document.getElementById('contactSubmit');
	const status = document.getElementById('formStatus');
	if (!form) return;

	const nameInput  = document.getElementById('contact-name');
	const emailInput = document.getElementById('contact-email');
	const msgInput   = document.getElementById('contact-message');
	const errName    = document.getElementById('error-name');
	const errEmail   = document.getElementById('error-email');
	const errMsg     = document.getElementById('error-message');

	const setError = (el, msg) => {
		if (!el) return;
		el.textContent = msg;
		el.classList.toggle('visible', !!msg);
	};

	const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

	const validate = () => {
		let ok = true;
		if (!nameInput?.value.trim()) { setError(errName, 'Name is required.'); ok = false; }
		else setError(errName, '');
		if (!emailInput?.value.trim()) { setError(errEmail, 'Email is required.'); ok = false; }
		else if (!validateEmail(emailInput.value.trim())) { setError(errEmail, 'Please enter a valid email.'); ok = false; }
		else setError(errEmail, '');
		if (!msgInput?.value.trim()) { setError(errMsg, 'Message is required.'); ok = false; }
		else setError(errMsg, '');
		return ok;
	};

	// Live validation on blur
	[nameInput, emailInput, msgInput].forEach((el) => {
		el?.addEventListener('blur', validate);
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!validate()) return;

		if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
		if (status) { status.textContent = ''; status.className = 'form-status'; }

		try {
			const res = await fetch(FORMSPREE_ENDPOINT, {
				method: 'POST',
				headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name:    nameInput?.value.trim(),
					email:   emailInput?.value.trim(),
					message: msgInput?.value.trim()
				})
			});

			if (res.ok) {
				form.reset();
				[errName, errEmail, errMsg].forEach((el) => setError(el, ''));
				if (status) { status.textContent = '✓ Message sent! I\'ll get back to you soon.'; status.className = 'form-status success'; }
				if (btn)    { btn.textContent = 'Message Sent ✓'; }
				setTimeout(() => {
					if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Send Message'; }
					if (status) { status.textContent = ''; status.className = 'form-status'; }
				}, 4000);
			} else {
				throw new Error('Server error');
			}
		} catch {
			if (status) { status.textContent = '✗ Failed to send. Please email me directly at preetam@preetamhegde.in'; status.className = 'form-status error'; }
			if (btn)    { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Send Message'; }
		}
	});
}

/* ── Particles — M12: respect prefers-reduced-motion ───────────────── */

function loadExternalScript(src, id) {
	return new Promise((resolve, reject) => {
		const existing = id ? document.getElementById(id) : null;
		if (existing) {
			if (existing.getAttribute('data-loaded') === 'true') { resolve(); return; }
			existing.addEventListener('load', () => resolve(), { once: true });
			existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
			return;
		}
		const script = document.createElement('script');
		script.src = src;
		script.async = false;
		if (id) script.id = id;
		script.addEventListener('load', () => { script.setAttribute('data-loaded', 'true'); resolve(); });
		script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
		document.head.appendChild(script);
	});
}

function ensureParticlesLibrary() {
	if (typeof particlesJS === 'function') return Promise.resolve();

	const localParticlesSrc = 'resource/vendor/particles/particles.js';
	const cdnScript = document.getElementById('particlesCdnScript');

	return new Promise((resolve) => {
		let settled = false;
		const finish = () => { if (settled) return; settled = true; resolve(); };
		const loadLocalFallback = () => {
			loadExternalScript(localParticlesSrc, 'particlesLocalScript').then(finish).catch(finish);
		};
		if (!cdnScript) { loadLocalFallback(); return; }
		cdnScript.addEventListener('load', finish, { once: true });
		cdnScript.addEventListener('error', loadLocalFallback, { once: true });
		setTimeout(() => { if (typeof particlesJS === 'function') { finish(); return; } loadLocalFallback(); }, 2500);
	});
}

function setupParticles() {
	if (prefersReducedMotion()) return;  // M12
	if (typeof particlesJS !== 'function') return;
	particlesJS('particles-js', {
		particles: {
			number: { value: 70 },
			color: { value: ['#a855f7', '#06d6a0', '#f72585'] },
			shape: { type: 'circle' },
			opacity: { value: 0.45, random: true },
			size: { value: 2.5, random: true },
			line_linked: { enable: true, distance: 140, color: '#a855f7', opacity: 0.15, width: 1 },
			move: { enable: true, speed: 1.4, direction: 'none', random: true, out_mode: 'out' }
		},
		interactivity: {
			detect_on: 'canvas',
			events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: false } },
			modes: { grab: { distance: 120, line_linked: { opacity: 0.3 } } }
		}
	});
}

/* ── Footer year + back-to-top ─────────────────────────────────────── */

function setupFooter() {
	const yearEl = document.getElementById('footerYear');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	const backBtn = document.getElementById('backToTop');
	if (backBtn) {
		backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
		window.addEventListener('scroll', () => {
			backBtn.classList.toggle('visible', window.scrollY > 400);
		}, { passive: true });
	}
}

/* ── Master init ───────────────────────────────────────────────────── */

function initPortfolio() {
	state.filteredProjects = Array.isArray(projects) ? [...projects] : [];

	setupEmbedModeGuards();
	setupThemeToggle();
	setupMedievalToggle();
	setupNavigation();
	setupContactForm();
	setupFooter();
	ensureParticlesLibrary().then(setupParticles);
	setupScrollProgress();
	setupSectionObservers();
	setupHeroParallax();

	initializeProjectFilters();
	renderModernProjects();
	renderGallery();
	setupGalleryControls();
	setupPreviewModal();
	renderResumeSnapshot();
}

document.addEventListener('DOMContentLoaded', initPortfolio);
