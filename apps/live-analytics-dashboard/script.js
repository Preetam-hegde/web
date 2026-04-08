"use strict";

const STORAGE_KEY = "liveAnalyticsDashboardSettings";
const EVENTS_SAMPLE_SIZE = 100;

const elements = {
	githubUsername: document.querySelector("#github-username"),
	useProxy: document.querySelector("#use-proxy"),
	plausibleSite: document.querySelector("#plausible-site"),
	plausibleApiKey: document.querySelector("#plausible-api-key"),
	plausibleEndpoint: document.querySelector("#plausible-endpoint"),
	refreshButton: document.querySelector("#refresh-btn"),
	resetButton: document.querySelector("#reset-btn"),
	status: document.querySelector("#status"),
	repoCount: document.querySelector("#repo-count"),
	followerCount: document.querySelector("#follower-count"),
	streakCount: document.querySelector("#streak-count"),
	streakFoot: document.querySelector("#streak-foot"),
	velocityCount: document.querySelector("#velocity-count"),
	velocityFoot: document.querySelector("#velocity-foot"),
	pageviewCount: document.querySelector("#pageview-count"),
	plausibleFoot: document.querySelector("#plausible-foot"),
	activityBars: document.querySelector("#activity-bars"),
	healthList: document.querySelector("#health-list"),
};

function setStatus(message) {
	elements.status.textContent = message;
}

function formatNumber(value) {
	if (!Number.isFinite(value)) {
		return "0";
	}
	return new Intl.NumberFormat("en-US").format(value);
}

function formatRatio(value) {
	if (!Number.isFinite(value)) {
		return "0.00x";
	}
	return `${value.toFixed(2)}x`;
}

function saveSettings() {
	const payload = {
		githubUsername: elements.githubUsername.value.trim(),
		useProxy: elements.useProxy.checked,
		plausibleSite: elements.plausibleSite.value.trim(),
		plausibleApiKey: elements.plausibleApiKey.value.trim(),
		plausibleEndpoint: elements.plausibleEndpoint.value.trim(),
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadSettings() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return;
		}
		const settings = JSON.parse(raw);
		elements.githubUsername.value = settings.githubUsername || "";
		elements.useProxy.checked = Boolean(settings.useProxy);
		elements.plausibleSite.value = settings.plausibleSite || "";
		elements.plausibleApiKey.value = settings.plausibleApiKey || "";
		elements.plausibleEndpoint.value = settings.plausibleEndpoint || "https://plausible.io/api/v1/stats/aggregate";
	} catch (error) {
		localStorage.removeItem(STORAGE_KEY);
	}
}

function resetDashboard() {
	localStorage.removeItem(STORAGE_KEY);
	elements.githubUsername.value = "";
	elements.useProxy.checked = false;
	elements.plausibleSite.value = "";
	elements.plausibleApiKey.value = "";
	elements.plausibleEndpoint.value = "https://plausible.io/api/v1/stats/aggregate";
	animateValue(elements.repoCount, 0);
	animateValue(elements.followerCount, 0);
	animateValue(elements.streakCount, 0);
	elements.velocityCount.textContent = "0.00x";
	elements.velocityCount.dataset.value = "0";
	elements.velocityFoot.textContent = "Based on PushEvent frequency";
	elements.plausibleApiKey.disabled = false;
	elements.plausibleApiKey.placeholder = "plausible_api_token";
	animateValue(elements.pageviewCount, 0);
	elements.streakFoot.textContent = "Calculated from recent public events";
	elements.plausibleFoot.textContent = "Configure site ID + API key";
	renderActivityBars([]);
	updateHealth("GitHub profile", "idle", "warn");
	updateHealth("GitHub events", "idle", "warn");
	updateHealth("Plausible aggregate", "idle", "warn");
	setStatus("Settings cleared. Enter a GitHub username to begin.");
}

function animateValue(element, targetValue, duration = 950) {
	const value = Number.isFinite(targetValue) ? Math.max(0, Math.round(targetValue)) : 0;
	const startValue = Number((element.dataset.value || "0"));
	const startTime = performance.now();

	function tick(now) {
		const elapsed = now - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const easeOut = 1 - (1 - progress) ** 3;
		const current = Math.round(startValue + (value - startValue) * easeOut);
		element.textContent = formatNumber(current);
		element.dataset.value = String(current);
		if (progress < 1) {
			requestAnimationFrame(tick);
		}
	}

	requestAnimationFrame(tick);
}

function updateHealth(sourceName, state, level) {
	const rows = Array.from(elements.healthList.querySelectorAll("li"));
	const row = rows.find((item) => {
		const label = item.querySelector("span");
		return label && label.textContent === sourceName;
	});
	if (!row) {
		return;
	}
	const statusEl = row.querySelector("strong");
	statusEl.textContent = state;
	statusEl.className = level || "";
}

function normalizeDate(dateInput) {
	const d = new Date(dateInput);
	if (Number.isNaN(d.getTime())) {
		return null;
	}
	d.setHours(0, 0, 0, 0);
	return d;
}

function diffInDays(fromDate, toDate) {
	const from = normalizeDate(fromDate);
	const to = normalizeDate(toDate);
	if (!from || !to) {
		return Number.POSITIVE_INFINITY;
	}
	return (to - from) / (1000 * 60 * 60 * 24);
}

function calculateStreak(events) {
	if (!events.length) {
		return { currentStreak: 0, longestStreak: 0, dailyCounts: [] };
	}

	const bucket = new Map();
	for (const event of events) {
		if (event.type !== "PushEvent") {
			continue;
		}
		const day = normalizeDate(event.created_at);
		if (!day) {
			continue;
		}
		const key = day.toISOString().slice(0, 10);
		bucket.set(key, (bucket.get(key) || 0) + 1);
	}

	const dayKeys = Array.from(bucket.keys()).sort((a, b) => (a > b ? -1 : 1));
	if (!dayKeys.length) {
		return { currentStreak: 0, longestStreak: 0, dailyCounts: [] };
	}

	let longestStreak = 1;
	let currentStreak = 1;
	let running = 1;

	for (let i = 1; i < dayKeys.length; i += 1) {
		const prev = new Date(dayKeys[i - 1]);
		const curr = new Date(dayKeys[i]);
		const diff = (prev - curr) / (1000 * 60 * 60 * 24);
		if (diff === 1) {
			running += 1;
		} else {
			running = 1;
		}
		if (i === 1 || currentStreak === i) {
			currentStreak = diff === 1 ? currentStreak + 1 : currentStreak;
		}
		longestStreak = Math.max(longestStreak, running);
	}

	const today = normalizeDate(new Date());
	const latestDay = new Date(dayKeys[0]);
	const daysFromToday = (today - latestDay) / (1000 * 60 * 60 * 24);
	if (daysFromToday > 1) {
		currentStreak = 0;
	}

	const timeline = dayKeys
		.slice(0, 14)
		.reverse()
		.map((key) => ({
			date: key.slice(5),
			count: bucket.get(key),
		}));

	return {
		currentStreak,
		longestStreak,
		dailyCounts: timeline,
	};
}

function renderActivityBars(dailyCounts) {
	elements.activityBars.textContent = "";
	if (!dailyCounts.length) {
		const placeholder = document.createElement("p");
		placeholder.textContent = "No push activity in sampled events yet.";
		placeholder.className = "widget-foot";
		elements.activityBars.appendChild(placeholder);
		return;
	}

	const peak = dailyCounts.reduce((max, item) => Math.max(max, item.count), 1);
	dailyCounts.forEach((item, index) => {
		const bar = document.createElement("div");
		bar.className = "bar";
		bar.style.height = `${Math.max(8, (item.count / peak) * 140)}px`;
		bar.style.animationDelay = `${index * 40}ms`;
		bar.title = `${item.date}: ${item.count} push events`;

		const label = document.createElement("span");
		label.textContent = item.date;
		bar.appendChild(label);
		elements.activityBars.appendChild(bar);
	});
}

async function fetchGitHubProfile(username) {
	const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
	if (!response.ok) {
		throw new Error(`GitHub profile fetch failed (${response.status}).`);
	}
	return response.json();
}

async function fetchGitHubEvents(username) {
	const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=${EVENTS_SAMPLE_SIZE}`);
	if (!response.ok) {
		throw new Error(`GitHub events fetch failed (${response.status}).`);
	}
	return response.json();
}

async function fetchPlausibleAggregate(siteId, apiKey, endpoint) {
	if (endpoint.startsWith("/")) {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				siteId,
				period: "30d",
				metrics: "visitors,pageviews,visit_duration,bounce_rate",
			}),
		});

		if (!response.ok) {
			throw new Error(`Plausible proxy fetch failed (${response.status}). Check local proxy server.`);
		}

		return response.json();
	}

	const url = new URL(endpoint);
	url.searchParams.set("site_id", siteId);
	url.searchParams.set("period", "30d");
	url.searchParams.set("metrics", "visitors,pageviews,visit_duration,bounce_rate");

	const response = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Plausible fetch failed (${response.status}). Check endpoint/API key/CORS policy.`);
	}

	return response.json();
}

function computeVelocity(events) {
	const pushEvents = events.filter((event) => event.type === "PushEvent");
	const today = new Date();
	const push7d = pushEvents.filter((event) => diffInDays(event.created_at, today) <= 6).length;
	const push30d = pushEvents.filter((event) => diffInDays(event.created_at, today) <= 29).length;
	const avg7d = push7d / 7;
	const avg30d = push30d / 30;
	const ratio = avg30d > 0 ? avg7d / avg30d : 0;
	return { push7d, push30d, ratio };
}

async function refreshDashboard() {
	const username = elements.githubUsername.value.trim();
	const useProxy = elements.useProxy.checked;
	const plausibleSite = elements.plausibleSite.value.trim();
	const plausibleApiKey = elements.plausibleApiKey.value.trim();
	const plausibleEndpoint = useProxy ? "/api/plausible" : elements.plausibleEndpoint.value.trim();

	if (!username) {
		setStatus("Please enter a GitHub username.");
		return;
	}

	saveSettings();
	setStatus("Loading GitHub data...");
	updateHealth("GitHub profile", "loading", "warn");
	updateHealth("GitHub events", "loading", "warn");

	try {
		const [profile, events] = await Promise.all([
			fetchGitHubProfile(username),
			fetchGitHubEvents(username),
		]);

		animateValue(elements.repoCount, Number(profile.public_repos) || 0);
		animateValue(elements.followerCount, Number(profile.followers) || 0);
		updateHealth("GitHub profile", "ok", "ok");
		updateHealth("GitHub events", "ok", "ok");

		const streakInfo = calculateStreak(Array.isArray(events) ? events : []);
		animateValue(elements.streakCount, streakInfo.currentStreak);
		elements.streakFoot.textContent = `Longest sampled streak: ${streakInfo.longestStreak} day(s)`;
		const velocity = computeVelocity(Array.isArray(events) ? events : []);
		elements.velocityCount.textContent = formatRatio(velocity.ratio);
		elements.velocityFoot.textContent = `7d pushes: ${formatNumber(velocity.push7d)} | 30d pushes: ${formatNumber(velocity.push30d)}`;
		renderActivityBars(streakInfo.dailyCounts);

		setStatus(`GitHub data refreshed for @${username}.`);
	} catch (error) {
		updateHealth("GitHub profile", "error", "error");
		updateHealth("GitHub events", "error", "error");
		setStatus(error.message);
	}

	if (!plausibleSite || (!useProxy && !plausibleApiKey)) {
		updateHealth("Plausible aggregate", "skipped", "warn");
		elements.plausibleFoot.textContent = useProxy
			? "Plausible needs a site ID when proxy mode is enabled."
			: "Plausible is optional. Add site + API key to enable.";
		animateValue(elements.pageviewCount, 0);
		return;
	}

	updateHealth("Plausible aggregate", "loading", "warn");
	setStatus("Loading Plausible aggregate data...");
	try {
		const plausibleData = await fetchPlausibleAggregate(plausibleSite, plausibleApiKey, plausibleEndpoint);
		const results = plausibleData.results || {};
		const pageviews = Number(results.pageviews?.value) || 0;
		animateValue(elements.pageviewCount, pageviews);
		elements.plausibleFoot.textContent = `Visitors: ${formatNumber(Number(results.visitors?.value) || 0)} | Bounce: ${formatNumber(Math.round((Number(results.bounce_rate?.value) || 0) * 100) / 100)}%`;
		updateHealth("Plausible aggregate", "ok", "ok");
		setStatus("Dashboard fully refreshed.");
	} catch (error) {
		updateHealth("Plausible aggregate", "error", "error");
		elements.plausibleFoot.textContent = "Plausible request failed (common cause: CORS or token scope).";
		setStatus(error.message);
	}
}

function init() {
	loadSettings();
	elements.refreshButton.addEventListener("click", refreshDashboard);
	elements.resetButton.addEventListener("click", resetDashboard);
	elements.useProxy.addEventListener("change", () => {
		elements.plausibleApiKey.disabled = elements.useProxy.checked;
		elements.plausibleApiKey.placeholder = elements.useProxy.checked
			? "Handled by local proxy env"
			: "plausible_api_token";
		saveSettings();
	});
	elements.githubUsername.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			refreshDashboard();
		}
	});

	elements.plausibleApiKey.disabled = elements.useProxy.checked;
	elements.plausibleApiKey.placeholder = elements.useProxy.checked
		? "Handled by local proxy env"
		: "plausible_api_token";

	if (elements.githubUsername.value.trim()) {
		refreshDashboard();
	}
}

init();
