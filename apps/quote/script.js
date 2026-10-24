// script.js - The Daily Ink Paper Comic & Bento Quote Engine
"use strict";

/* ==============================================================
   CURATED QUOTE CATALOG & CATEGORIES
   ============================================================== */
const COMIC_QUOTES = [
	// Wisdom & Zen
	{
		content:
			"You have power over your mind — not outside events. Realize this, and you will find strength.",
		author: "Marcus Aurelius",
		role: "Stoic Philosopher & Roman Emperor",
		category: "wisdom",
		mood: "zen",
		burst: "DEEP!",
	},
	{
		content: "Muddy water is best cleared by leaving it alone.",
		author: "Alan Watts",
		role: "Philosopher & Zen Scholar",
		category: "wisdom",
		mood: "zen",
		burst: "CALM!",
	},
	{
		content: "The journey of a thousand miles begins with a single step.",
		author: "Lao Tzu",
		role: "Taoist Sage",
		category: "wisdom",
		mood: "zen",
		burst: "FLOW!",
	},
	{
		content: "Knowing others is intelligence; knowing yourself is true wisdom.",
		author: "Lao Tzu",
		role: "Ancient Philosopher",
		category: "wisdom",
		mood: "thinking",
		burst: "AHA!",
	},
	{
		content: "Simplicity is the ultimate sophistication.",
		author: "Leonardo da Vinci",
		role: "Polymath & Artist",
		category: "wisdom",
		mood: "eureka",
		burst: "PURE!",
	},
	{
		content: "The quieter you become, the more you are able to hear.",
		author: "Rumi",
		role: "Persian Poet & Mystic",
		category: "wisdom",
		mood: "zen",
		burst: "LISTEN!",
	},
	{
		content:
			"Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
		author: "Gautama Buddha",
		role: "Spiritual Teacher",
		category: "wisdom",
		mood: "zen",
		burst: "NOW!",
	},
	{
		content: "Turn your wounds into wisdom.",
		author: "Oprah Winfrey",
		role: "Broadcaster & Philanthropist",
		category: "wisdom",
		mood: "hero",
		burst: "HEAL!",
	},

	// Grit & Drive
	{
		content:
			"Success is not final, failure is not fatal: it is the courage to continue that counts.",
		author: "Winston Churchill",
		role: "Statesman & Orator",
		category: "grit",
		mood: "hero",
		burst: "GRIT!",
	},
	{
		content:
			"Do not pray for an easy life, pray for the strength to endure a difficult one.",
		author: "Bruce Lee",
		role: "Martial Artist & Philosopher",
		category: "grit",
		mood: "hero",
		burst: "FOCUS!",
	},
	{
		content: "It always seems impossible until it is done.",
		author: "Nelson Mandela",
		role: "Anti-Apartheid Leader",
		category: "grit",
		mood: "hero",
		burst: "VICTORY!",
	},
	{
		content: "I have not failed. I’ve just found 10,000 ways that won’t work.",
		author: "Thomas Edison",
		role: "Inventor",
		category: "grit",
		mood: "eureka",
		burst: "SPARK!",
	},
	{
		content: "Energy and persistence conquer all things.",
		author: "Benjamin Franklin",
		role: "Founding Father & Polymath",
		category: "grit",
		mood: "hero",
		burst: "CHARGE!",
	},
	{
		content: "What we achieve inwardly will change outer reality.",
		author: "Plutarch",
		role: "Greek Biographer & Essayist",
		category: "grit",
		mood: "thinking",
		burst: "MIND!",
	},
	{
		content: "Fall seven times and stand up eight.",
		author: "Japanese Proverb",
		role: "Ancient Folklore",
		category: "grit",
		mood: "hero",
		burst: "RISE!",
	},
	{
		content:
			"The only limit to our realization of tomorrow will be our doubts of today.",
		author: "Franklin D. Roosevelt",
		role: "32nd U.S. President",
		category: "grit",
		mood: "hero",
		burst: "FORWARD!",
	},

	// Philosophy & Mind
	{
		content: "We suffer more often in imagination than in reality.",
		author: "Seneca",
		role: "Stoic Philosopher & Statesman",
		category: "philosophy",
		mood: "thinking",
		burst: "CLARITY!",
	},
	{
		content: "The unexamined life is not worth living.",
		author: "Socrates",
		role: "Classical Greek Philosopher",
		category: "philosophy",
		mood: "thinking",
		burst: "PONDER!",
	},
	{
		content: "He who has a why to live can bear almost any how.",
		author: "Friedrich Nietzsche",
		role: "Cultural Critic & Philosopher",
		category: "philosophy",
		mood: "hero",
		burst: "PURPOSE!",
	},
	{
		content: "I think, therefore I am.",
		author: "René Descartes",
		role: "Philosopher & Mathematician",
		category: "philosophy",
		mood: "eureka",
		burst: "COGITO!",
	},
	{
		content: "Happiness depends upon ourselves.",
		author: "Aristotle",
		role: "Polymath of Antiquity",
		category: "philosophy",
		mood: "zen",
		burst: "JOY!",
	},
	{
		content:
			"Waste no more time arguing about what a good man should be. Be one.",
		author: "Marcus Aurelius",
		role: "Roman Emperor",
		category: "philosophy",
		mood: "hero",
		burst: "ACT!",
	},
	{
		content: "Somewhere, something incredible is waiting to be known.",
		author: "Carl Sagan",
		role: "Astronomer & Science Communicator",
		category: "philosophy",
		mood: "eureka",
		burst: "COSMOS!",
	},
	{
		content: "The cosmos is within us. We are made of star-stuff.",
		author: "Carl Sagan",
		role: "Astrophysicist & Author",
		category: "philosophy",
		mood: "eureka",
		burst: "STARS!",
	},

	// Wit & Humor
	{
		content: "Be yourself; everyone else is already taken.",
		author: "Oscar Wilde",
		role: "Playwright & Wit",
		category: "humor",
		mood: "laughing",
		burst: "CLASSIC!",
	},
	{
		content: "I refuse to join any club that would have me as a member.",
		author: "Groucho Marx",
		role: "Comedian & Film Star",
		category: "humor",
		mood: "laughing",
		burst: "HA-HA!",
	},
	{
		content: "I can resist everything except temptation.",
		author: "Oscar Wilde",
		role: "Poet & Satirist",
		category: "humor",
		mood: "laughing",
		burst: "OOF!",
	},
	{
		content: "If you tell the truth, you don’t have to remember anything.",
		author: "Mark Twain",
		role: "Humorist & Novelist",
		category: "humor",
		mood: "laughing",
		burst: "TRUTH!",
	},
	{
		content: "A day without sunshine is like, you know, night.",
		author: "Steve Martin",
		role: "Actor & Comedian",
		category: "humor",
		mood: "laughing",
		burst: "GENIUS!",
	},
	{
		content:
			"Two things are infinite: the universe and human stupidity; and I’m not sure about the universe.",
		author: "Albert Einstein",
		role: "Theoretical Physicist",
		category: "humor",
		mood: "eureka",
		burst: "E=MC²!",
	},
	{
		content:
			"Don’t take life too seriously. You will never get out of it alive.",
		author: "Elbert Hubbard",
		role: "Writer & Philosopher",
		category: "humor",
		mood: "laughing",
		burst: "WINK!",
	},
	{
		content: "Always borrow money from a pessimist. He won’t expect it back.",
		author: "Oscar Wilde",
		role: "Satirist",
		category: "humor",
		mood: "laughing",
		burst: "PROFIT!",
	},

	// Creativity & Art
	{
		content: "Creativity is intelligence having fun.",
		author: "Albert Einstein",
		role: "Physicist & Dreamer",
		category: "creativity",
		mood: "eureka",
		burst: "CREATE!",
	},
	{
		content:
			"Every child is an artist. The problem is how to remain an artist once we grow up.",
		author: "Pablo Picasso",
		role: "Painter & Sculptor",
		category: "creativity",
		mood: "eureka",
		burst: "ART!",
	},
	{
		content: "I dream my painting and I paint my dream.",
		author: "Vincent van Gogh",
		role: "Post-Impressionist Painter",
		category: "creativity",
		mood: "zen",
		burst: "VISION!",
	},
	{
		content: "Have no fear of perfection — you’ll never reach it.",
		author: "Salvador Dalí",
		role: "Surrealist Painter",
		category: "creativity",
		mood: "laughing",
		burst: "SURREAL!",
	},
	{
		content:
			"You can’t use up creativity. The more you use, the more you have.",
		author: "Maya Angelou",
		role: "Poet & Civil Rights Leader",
		category: "creativity",
		mood: "hero",
		burst: "SPARK!",
	},
	{
		content: "Art washes away from the soul the dust of everyday life.",
		author: "Pablo Picasso",
		role: "Master of Modern Art",
		category: "creativity",
		mood: "zen",
		burst: "FRESH!",
	},
	{
		content: "The chief enemy of creativity is good sense.",
		author: "Pablo Picasso",
		role: "Cubist Pioneer",
		category: "creativity",
		mood: "thinking",
		burst: "DREAM!",
	},
	{
		content: "To create one’s own world in any of the arts takes courage.",
		author: "Georgia O’Keeffe",
		role: "Modernist Painter",
		category: "creativity",
		mood: "hero",
		burst: "BOLD!",
	},

	// Courage & Freedom
	{
		content: "Courage is not the absence of fear, but the triumph over it.",
		author: "Nelson Mandela",
		role: "Statesman & Humanitarian",
		category: "courage",
		mood: "hero",
		burst: "BRAVE!",
	},
	{
		content: "It takes courage to grow up and become who you really are.",
		author: "E. E. Cummings",
		role: "Poet & Playwright",
		category: "courage",
		mood: "thinking",
		burst: "TRUTH!",
	},
	{
		content: "Life shrinks or expands in proportion to one’s courage.",
		author: "Anaïs Nin",
		role: "Essayist & Diarist",
		category: "courage",
		mood: "hero",
		burst: "EXPAND!",
	},
	{
		content: "Whatever you are, be a good one.",
		author: "Abraham Lincoln",
		role: "16th U.S. President",
		category: "courage",
		mood: "hero",
		burst: "STAND!",
	},
	{
		content: "The most courageous act is still to think for yourself. Aloud.",
		author: "Coco Chanel",
		role: "Fashion Visionary",
		category: "courage",
		mood: "hero",
		burst: "SPEAK!",
	},
	{
		content: "Do one thing every day that scares you.",
		author: "Eleanor Roosevelt",
		role: "Diplomat & Activist",
		category: "courage",
		mood: "hero",
		burst: "DARE!",
	},
	{
		content:
			"Tell me, what is it you plan to do with your one wild and precious life?",
		author: "Mary Oliver",
		role: "Pulitzer Prize Poet",
		category: "courage",
		mood: "zen",
		burst: "WILD!",
	},
	{
		content: "Nothing can dim the light which shines from within.",
		author: "Maya Angelou",
		role: "Author & Poet",
		category: "courage",
		mood: "hero",
		burst: "SHINE!",
	},
];

const MASCOT_QUIPS = {
	zen: [
		"“Breathe in the ink, exhale the noise.”",
		"“Peace isn’t a destination; it’s this moment.”",
		"“Still waters run deep in this panel.”",
		"“Serenity inked onto paper.”",
	],
	thinking: [
		"“Hmm... scratching my chin on that one!”",
		"“A profound twist in the comic narrative.”",
		"“Let that soak in like fresh newsprint.”",
		"“Philosophy: the ultimate superhero power.”",
	],
	eureka: [
		"“Lightbulb moment! Eureka!”",
		"“A spark just jumped off the page!”",
		"“Mind blown across all four panels!”",
		"“Write that down before it vanishes!”",
	],
	hero: [
		"“Cape on, doubts off! We roll forward!”",
		"“That’s the warrior’s ink right there.”",
		"“No villain can withstand that resolve.”",
		"“Courage is ink that refuses to fade.”",
	],
	laughing: [
		"“Haha! A classic Sunday strip punchline!”",
		"“Witty as a vintage cartoon zinger!”",
		"“Humor is the shortest bridge between two minds.”",
		"“Tickled the printing press with that one!”",
	],
};

/* ==============================================================
   STATE MANAGEMENT
   ============================================================== */
let currentQuote = null;
let quoteHistory = [];
let historyIndex = -1;
let currentGenre = "all";
let currentTheme = localStorage.getItem("daily_ink_theme") || "sunday";
let currentBubbleStyle = localStorage.getItem("daily_ink_bubble") || "balloon";
let soundEnabled = localStorage.getItem("daily_ink_sound") !== "false";
let savedQuotes = [];
let audioContext = null;
let currentUtterance = null;
let statsReadCount = parseInt(
	localStorage.getItem("daily_ink_read_count") || "1",
	10,
);
let currentIssueNumber = 1040 + Math.floor(Math.random() * 80);

try {
	const storedScraps = localStorage.getItem("daily_ink_scraps");
	if (storedScraps) {
		savedQuotes = JSON.parse(storedScraps);
	}
} catch (e) {
	console.warn("Failed to parse saved quotes from storage", e);
	savedQuotes = [];
}

/* ==============================================================
   DOM ELEMENTS
   ============================================================== */
const quoteTextEl = document.getElementById("quote-text");
const quoteAuthorEl = document.getElementById("quote-author");
const authorRoleEl = document.getElementById("author-role");
const quoteGenreTag = document.getElementById("quote-genre-tag");
const quoteSourceTag = document.getElementById("quote-source-tag");
const readingTimePill = document.getElementById("reading-time-pill");
const actionBurstEl = document.getElementById("action-burst");
const speechBubbleEl = document.getElementById("speech-bubble");

const newQuoteBtn = document.getElementById("new-quote-btn");
const prevQuoteBtn = document.getElementById("prev-quote-btn");
const nextQuoteBtn = document.getElementById("next-quote-btn");
const randomSurpriseBtn = document.getElementById("random-surprise-btn");
const dailyQuoteBtn = document.getElementById("daily-quote-btn");
const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");
const favoriteBtn = document.getElementById("favorite-btn");
const starIcon = document.getElementById("star-icon");
const voiceBtn = document.getElementById("voice-btn");
const exportCardBtn = document.getElementById("export-card-btn");
const audioWaveBox = document.getElementById("audio-wave-box");

const soundToggleBtn = document.getElementById("sound-toggle-btn");
const soundIcon = document.getElementById("sound-icon");
const issueBadgeEl = document.getElementById("issue-badge");
const currentDateEl = document.getElementById("current-date");

const mascotMoodLabel = document.getElementById("mascot-mood-label");
const mascotQuipEl = document.getElementById("mascot-quip");
const mascotStage = document.querySelector(".mascot-stage");
const mascotMouth = document.getElementById("mascot-mouth");
const mascotBrowLeft = document.getElementById("mascot-brow-left");
const mascotBrowRight = document.getElementById("mascot-brow-right");
const mascotEyeLeft = document.getElementById("mascot-eye-left");
const mascotEyeRight = document.getElementById("mascot-eye-right");

const openScrapbookBtn = document.getElementById("open-scrapbook-btn");
const closeScrapbookBtn = document.getElementById("close-scrapbook-btn");
const scrapbookDrawer = document.getElementById("scrapbook-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const scrapbookList = document.getElementById("scrapbook-list");
const scrapCountBadge = document.getElementById("scrap-count");
const scrapbookCounterText = document.getElementById("scrapbook-counter-text");
const clearScrapsBtn = document.getElementById("clear-scraps-btn");

const comicToast = document.getElementById("comic-toast");
const toastBurst = document.getElementById("toast-burst");
const toastMessage = document.getElementById("toast-message");

const statsReadEl = document.getElementById("stats-read-count");
const statsSavedEl = document.getElementById("stats-saved-count");

const modeSingleBtn = document.getElementById("mode-single-btn");
const modeStripBtn = document.getElementById("mode-strip-btn");
const singleView = document.getElementById("single-view");
const stripView = document.getElementById("strip-view");
const generateStripBtn = document.getElementById("generate-strip-btn");

/* ==============================================================
   RETRO AUDIO SYNTHESIS (WEB AUDIO API)
   ============================================================== */
function initAudioContext() {
	if (!audioContext) {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (AudioCtx) {
			audioContext = new AudioCtx();
		}
	}
	if (audioContext && audioContext.state === "suspended") {
		audioContext.resume();
	}
}

function playComicSound(type) {
	if (!soundEnabled) return;
	try {
		initAudioContext();
		if (!audioContext) return;
		const now = audioContext.currentTime;

		if (type === "pop") {
			// Comic Bubble Blip / Pop
			const osc = audioContext.createOscillator();
			const gain = audioContext.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(420, now);
			osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
			gain.gain.setValueAtTime(0.18, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
			osc.connect(gain);
			gain.connect(audioContext.destination);
			osc.start(now);
			osc.stop(now + 0.1);
		} else if (type === "paper") {
			// Paper rustle / page turn
			const bufferSize = audioContext.sampleRate * 0.12;
			const buffer = audioContext.createBuffer(
				1,
				bufferSize,
				audioContext.sampleRate,
			);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				data[i] = Math.random() * 2 - 1;
			}
			const noise = audioContext.createBufferSource();
			noise.buffer = buffer;
			const filter = audioContext.createBiquadFilter();
			filter.type = "bandpass";
			filter.frequency.setValueAtTime(1400, now);
			filter.Q.setValueAtTime(1.5, now);
			const gain = audioContext.createGain();
			gain.gain.setValueAtTime(0.12, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
			noise.connect(filter);
			filter.connect(gain);
			gain.connect(audioContext.destination);
			noise.start(now);
		} else if (type === "punch") {
			// Comic Action Burst Punch
			const osc = audioContext.createOscillator();
			const gain = audioContext.createGain();
			osc.type = "triangle";
			osc.frequency.setValueAtTime(180, now);
			osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
			gain.gain.setValueAtTime(0.3, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
			osc.connect(gain);
			gain.connect(audioContext.destination);
			osc.start(now);
			osc.stop(now + 0.17);
		} else if (type === "chime") {
			// Star / Saved Chime
			const osc1 = audioContext.createOscillator();
			const osc2 = audioContext.createOscillator();
			const gain = audioContext.createGain();
			osc1.type = "sine";
			osc2.type = "sine";
			osc1.frequency.setValueAtTime(587.33, now); // D5
			osc2.frequency.setValueAtTime(880, now + 0.08); // A5
			gain.gain.setValueAtTime(0.16, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
			osc1.connect(gain);
			osc2.connect(gain);
			gain.connect(audioContext.destination);
			osc1.start(now);
			osc2.start(now + 0.08);
			osc1.stop(now + 0.25);
			osc2.stop(now + 0.35);
		} else if (type === "click") {
			// Crisp button click
			const osc = audioContext.createOscillator();
			const gain = audioContext.createGain();
			osc.type = "square";
			osc.frequency.setValueAtTime(1200, now);
			gain.gain.setValueAtTime(0.08, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
			osc.connect(gain);
			gain.connect(audioContext.destination);
			osc.start(now);
			osc.stop(now + 0.04);
		}
	} catch (e) {
		console.warn("Audio playback error", e);
	}
}

/* ==============================================================
   MASCOT & EMOTION AVATAR
   ============================================================== */
function updateMascotMood(mood, customQuip = null) {
	if (!mascotMoodLabel) return;
	mascotMoodLabel.textContent = (mood || "THINKING").toUpperCase();

	// Remove previous state classes
	mascotStage.classList.remove("eureka", "zen", "hero", "laughing", "thinking");
	mascotStage.classList.add(mood || "thinking");

	// Morph SVG parts
	if (mood === "eureka") {
		mascotBrowLeft.setAttribute("d", "M46 58 Q60 50 72 60");
		mascotBrowRight.setAttribute("d", "M88 60 Q100 50 114 58");
		mascotMouth.setAttribute("d", "M72 108 Q80 126 88 108");
	} else if (mood === "zen") {
		mascotBrowLeft.setAttribute("d", "M48 66 Q60 66 70 66");
		mascotBrowRight.setAttribute("d", "M90 66 Q100 66 112 66");
		mascotMouth.setAttribute("d", "M70 114 Q80 118 90 114");
	} else if (mood === "hero") {
		mascotBrowLeft.setAttribute("d", "M48 62 Q60 68 70 64");
		mascotBrowRight.setAttribute("d", "M90 64 Q100 68 112 62");
		mascotMouth.setAttribute("d", "M66 112 Q80 124 94 110");
	} else if (mood === "laughing") {
		mascotBrowLeft.setAttribute("d", "M48 60 Q60 54 70 60");
		mascotBrowRight.setAttribute("d", "M90 60 Q100 54 112 60");
		mascotMouth.setAttribute("d", "M64 108 Q80 130 96 108");
	} else {
		// Default Thinking
		mascotBrowLeft.setAttribute("d", "M48 65 Q60 60 70 65");
		mascotBrowRight.setAttribute("d", "M90 65 Q100 60 112 65");
		mascotMouth.setAttribute("d", "M68 112 Q80 118 92 112");
	}

	// Update quip
	if (customQuip) {
		mascotQuipEl.textContent = customQuip;
	} else {
		const list = MASCOT_QUIPS[mood] || MASCOT_QUIPS.thinking;
		const randomQuip = list[Math.floor(Math.random() * list.length)];
		mascotQuipEl.textContent = randomQuip;
	}
}

/* ==============================================================
   QUOTE FETCHER & ENGINE
   ============================================================== */
async function fetchRemoteQuote() {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 3500);

	try {
		// Try DummyJSON quotes API (extremely fast, stable, and CORS safe)
		const response = await fetch("https://dummyjson.com/quotes/random", {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});

		if (response.ok) {
			const data = await response.json();
			if (data && data.quote) {
				return {
					content: data.quote,
					author: data.author || "Anonymous Thinker",
					role: "Global Luminary",
					category: "wisdom",
					mood: "eureka",
					burst: "POW!",
					source: "Live Gazette Wire",
				};
			}
		}
	} catch (e) {
		// Fallback to local catalog
	} finally {
		clearTimeout(timeoutId);
	}
	return null;
}

function getLocalQuote(genre = "all") {
	let pool = COMIC_QUOTES;
	if (genre !== "all") {
		pool = COMIC_QUOTES.filter((q) => q.category === genre);
		if (pool.length === 0) pool = COMIC_QUOTES;
	}
	const item = pool[Math.floor(Math.random() * pool.length)];
	return {
		...item,
		source: "The Daily Ink Archives",
	};
}

function getDailyCuratedQuote() {
	const now = new Date();
	const dayOfYear = Math.floor(
		(now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24,
	);
	const quoteIndex = dayOfYear % COMIC_QUOTES.length;
	return {
		...COMIC_QUOTES[quoteIndex],
		source: "Official Daily Dispatch",
		burst: "TODAY!",
	};
}

function calculateReadingTime(text) {
	const wordCount = (text || "").trim().split(/\s+/).length;
	if (wordCount <= 12) return "10-sec Punchy";
	if (wordCount <= 25) return "20-sec Ponder";
	return "30-sec Thought";
}

function renderQuote(quote, addToHistory = true) {
	currentQuote = quote;

	if (addToHistory) {
		quoteHistory.push(quote);
		historyIndex = quoteHistory.length - 1;
	}

	updateNavButtons();

	// Text & Attribution
	quoteTextEl.textContent = quote.content;
	quoteAuthorEl.textContent = quote.author;
	authorRoleEl.textContent = quote.role || "Writer & Thinker";
	quoteGenreTag.textContent = `#${(quote.category || "WISDOM").toUpperCase()}`;
	quoteSourceTag.textContent = quote.source || "DAILY INK";
	readingTimePill.innerHTML = `<i class="far fa-clock"></i> ${calculateReadingTime(quote.content)}`;

	// Action Burst Sticker
	actionBurstEl.textContent = quote.burst || "POW!";
	actionBurstEl.style.transform = `rotate(${Math.floor(Math.random() * 14) - 7}deg) scale(1.15)`;
	setTimeout(() => {
		actionBurstEl.style.transform = "";
	}, 300);

	// Update Mascot Companion
	updateMascotMood(quote.mood || "thinking");

	// Update Favorite Star
	updateFavoriteButtonState();

	// Update Issue Number occasionally
	currentIssueNumber += 1;
	if (issueBadgeEl) {
		issueBadgeEl.textContent = `ISSUE #${currentIssueNumber}`;
	}

	// Stats
	statsReadCount += 1;
	localStorage.setItem("daily_ink_read_count", statsReadCount.toString());
	if (statsReadEl) statsReadEl.textContent = statsReadCount;

	playComicSound("punch");
}

async function rollNewQuote() {
	playComicSound("paper");

	// Animate speech bubble exit
	speechBubbleEl.style.opacity = "0.5";
	speechBubbleEl.style.transform = "translateY(8px) scale(0.99)";

	let nextQuote = null;

	// If a specific genre is selected, pick directly from the rich curated collection
	if (currentGenre !== "all") {
		nextQuote = getLocalQuote(currentGenre);
	} else {
		// 30% chance to fetch fresh remote quote from API, 70% to use rich local curated
		if (Math.random() < 0.3) {
			nextQuote = await fetchRemoteQuote();
		}
		if (!nextQuote) {
			nextQuote = getLocalQuote("all");
		}
	}

	renderQuote(nextQuote, true);

	// Animate speech bubble enter
	setTimeout(() => {
		speechBubbleEl.style.opacity = "1";
		speechBubbleEl.style.transform = "translateY(0) scale(1)";
	}, 120);
}

function updateNavButtons() {
	if (prevQuoteBtn) {
		prevQuoteBtn.disabled = historyIndex <= 0;
	}
	if (nextQuoteBtn) {
		nextQuoteBtn.disabled = historyIndex >= quoteHistory.length - 1;
	}
}

function stepHistory(delta) {
	const newIndex = historyIndex + delta;
	if (newIndex >= 0 && newIndex < quoteHistory.length) {
		historyIndex = newIndex;
		renderQuote(quoteHistory[historyIndex], false);
		playComicSound("pop");
	}
}

/* ==============================================================
   CLIPBOARD & NATIVE SHARING
   ============================================================== */
function showComicToast(burst, message) {
	toastBurst.textContent = burst || "POW!";
	toastMessage.textContent = message || "Action completed!";
	comicToast.classList.add("show");
	playComicSound("pop");

	setTimeout(() => {
		comicToast.classList.remove("show");
	}, 2400);
}

async function copyQuoteToClipboard() {
	if (!currentQuote) return;
	const formattedText = `"${currentQuote.content}"\n— ${currentQuote.author} (${currentQuote.role || "Wisdom"})\n[The Daily Ink Comic Gazette]`;

	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(formattedText);
		} else {
			const textArea = document.createElement("textarea");
			textArea.value = formattedText;
			textArea.style.position = "fixed";
			textArea.style.left = "-9999px";
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
		}
		showComicToast("COPIED!", "Quote inked to your clipboard!");
		playComicSound("chime");
	} catch (e) {
		console.error("Failed to copy", e);
		showComicToast("OOPS!", "Could not copy to clipboard.");
	}
}

async function shareQuoteData() {
	if (!currentQuote) return;
	const sharePayload = {
		title: "The Daily Ink: Comic Wisdom",
		text: `“${currentQuote.content}” — ${currentQuote.author}`,
		url: window.location.href,
	};

	if (navigator.share) {
		try {
			await navigator.share(sharePayload);
			showComicToast("SHARED!", "Comic strip shared successfully!");
			return;
		} catch (e) {
			if (e.name !== "AbortError") {
				copyQuoteToClipboard();
			}
		}
	} else {
		copyQuoteToClipboard();
	}
}

/* ==============================================================
   SCRAPBOOK / FAVORITES (LOCAL STORAGE)
   ============================================================== */
function isCurrentQuoteSaved() {
	if (!currentQuote) return false;
	return savedQuotes.some(
		(q) =>
			q.content === currentQuote.content && q.author === currentQuote.author,
	);
}

function updateFavoriteButtonState() {
	if (!favoriteBtn || !starIcon) return;
	const isSaved = isCurrentQuoteSaved();
	if (isSaved) {
		favoriteBtn.classList.add("active");
		starIcon.className = "fas fa-star";
		favoriteBtn.querySelector(".btn-caption").textContent = "SAVED";
	} else {
		favoriteBtn.classList.remove("active");
		starIcon.className = "far fa-star";
		favoriteBtn.querySelector(".btn-caption").textContent = "SAVE";
	}
	renderScrapbookCounter();
}

function toggleSaveCurrentQuote() {
	if (!currentQuote) return;
	const existsIndex = savedQuotes.findIndex(
		(q) =>
			q.content === currentQuote.content && q.author === currentQuote.author,
	);

	if (existsIndex >= 0) {
		savedQuotes.splice(existsIndex, 1);
		showComicToast("REMOVED!", "Removed from your Scrapbook.");
		playComicSound("click");
	} else {
		savedQuotes.unshift({
			...currentQuote,
			savedAt: new Date().toLocaleDateString(),
		});
		showComicToast("SAVED!", "Starred to your Scrapbook collection!");
		playComicSound("chime");
	}

	saveScrapbookToStorage();
	updateFavoriteButtonState();
	renderScrapbookDrawer();
}

function saveScrapbookToStorage() {
	try {
		localStorage.setItem("daily_ink_scraps", JSON.stringify(savedQuotes));
	} catch (e) {
		console.warn("Storage quota exceeded", e);
	}
}

function renderScrapbookCounter() {
	const count = savedQuotes.length;
	if (scrapCountBadge) scrapCountBadge.textContent = count;
	if (statsSavedEl) statsSavedEl.textContent = count;
	if (scrapbookCounterText) {
		scrapbookCounterText.textContent = `${count} saved comic strip${count === 1 ? "" : "s"}`;
	}
}

function renderScrapbookDrawer() {
	if (!scrapbookList) return;
	renderScrapbookCounter();

	if (savedQuotes.length === 0) {
		scrapbookList.innerHTML = `
			<div class="scrap-empty-state">
				<i class="far fa-bookmark"></i>
				<h3>EMPTY SCRAPBOOK</h3>
				<p>Click the <strong>SAVE</strong> star button on any strip to collect your favorite quotes here!</p>
			</div>
		`;
		return;
	}

	scrapbookList.innerHTML = savedQuotes
		.map(
			(quote, idx) => `
		<article class="scrap-card">
			<p class="scrap-card-text">“${quote.content}”</p>
			<div class="scrap-card-footer">
				<span class="scrap-author">— ${quote.author}</span>
				<div class="scrap-tools">
					<button class="scrap-tool-btn copy-scrap-btn" data-index="${idx}" title="Copy Quote">
						<i class="fas fa-copy"></i>
					</button>
					<button class="scrap-tool-btn delete-scrap-btn" data-index="${idx}" title="Delete Scrap">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</article>
	`,
		)
		.join("");

	// Attach handlers inside scrapbook list
	scrapbookList.querySelectorAll(".copy-scrap-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const idx = parseInt(btn.dataset.index, 10);
			const target = savedQuotes[idx];
			if (target) {
				navigator.clipboard?.writeText(
					`"${target.content}" — ${target.author}`,
				);
				showComicToast("COPIED!", "Scrapbook quote copied!");
				playComicSound("pop");
			}
		});
	});

	scrapbookList.querySelectorAll(".delete-scrap-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const idx = parseInt(btn.dataset.index, 10);
			savedQuotes.splice(idx, 1);
			saveScrapbookToStorage();
			updateFavoriteButtonState();
			renderScrapbookDrawer();
			playComicSound("click");
		});
	});
}

function openScrapbook() {
	renderScrapbookDrawer();
	scrapbookDrawer.classList.add("open");
	scrapbookDrawer.setAttribute("aria-hidden", "false");
	playComicSound("paper");
}

function closeScrapbook() {
	scrapbookDrawer.classList.remove("open");
	scrapbookDrawer.setAttribute("aria-hidden", "true");
	playComicSound("click");
}

/* ==============================================================
   SPEECH SYNTHESIS (COMIC VOICE READER)
   ============================================================== */
function toggleSpeechSynthesis() {
	if (!window.speechSynthesis) {
		showComicToast(
			"UNSUPPORTED",
			"Voice reading not available on this browser.",
		);
		return;
	}

	if (window.speechSynthesis.speaking) {
		window.speechSynthesis.cancel();
		stopVoiceAnimation();
		return;
	}

	if (!currentQuote) return;

	playComicSound("pop");
	startVoiceAnimation();

	const speechText = `${currentQuote.content}. By ${currentQuote.author}.`;
	currentUtterance = new SpeechSynthesisUtterance(speechText);
	currentUtterance.rate = 1.0;
	currentUtterance.pitch = 1.1; // Friendly comic narrator tone

	const voices = window.speechSynthesis.getVoices();
	const preferredVoice = voices.find(
		(v) =>
			v.lang.startsWith("en") &&
			(v.name.includes("Natural") || v.name.includes("Google")),
	);
	if (preferredVoice) {
		currentUtterance.voice = preferredVoice;
	}

	currentUtterance.onend = () => {
		stopVoiceAnimation();
	};

	currentUtterance.onerror = () => {
		stopVoiceAnimation();
	};

	window.speechSynthesis.speak(currentUtterance);
}

function startVoiceAnimation() {
	if (voiceBtn) voiceBtn.classList.add("active");
	if (audioWaveBox) audioWaveBox.hidden = false;
	// Animate mascot mouth while speaking
	mascotMouth.setAttribute("d", "M72 108 Q80 126 88 108");
}

function stopVoiceAnimation() {
	if (voiceBtn) voiceBtn.classList.remove("active");
	if (audioWaveBox) audioWaveBox.hidden = true;
	if (currentQuote) updateMascotMood(currentQuote.mood);
}

/* ==============================================================
   CANVAS HIGH-RESOLUTION PNG EXPORT
   ============================================================== */
function exportComicCard() {
	if (!currentQuote) return;
	playComicSound("pop");
	showComicToast("PRINTING!", "Crafting your high-res comic card...");

	const canvas = document.getElementById("export-canvas");
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	const W = 1080;
	const H = 1080;

	// 1. Draw Paper Background
	ctx.fillStyle = currentTheme === "cyber" ? "#141624" : "#faf6eb";
	ctx.fillRect(0, 0, W, H);

	// 2. Draw Subtle Halftone Dots
	ctx.fillStyle = currentTheme === "cyber" ? "#212538" : "#e6dcbc";
	const dotStep = 24;
	for (let x = 16; x < W; x += dotStep) {
		for (let y = 16; y < H; y += dotStep) {
			ctx.beginPath();
			ctx.arc(x, y, 2.5, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	// 3. Draw Thick Outer Comic Border & Hard Drop Shadow
	ctx.lineWidth = 8;
	ctx.strokeStyle = "#111111";
	ctx.strokeRect(36, 36, W - 72, H - 72);

	ctx.lineWidth = 2;
	ctx.strokeRect(46, 46, W - 92, H - 92);

	// 4. Draw Masthead Header Strip
	ctx.fillStyle = currentTheme === "cyber" ? "#1f2233" : "#ffffff";
	ctx.fillRect(52, 52, W - 104, 110);
	ctx.lineWidth = 4;
	ctx.strokeRect(52, 52, W - 104, 110);

	ctx.fillStyle = "#111111";
	ctx.font = "bold 54px Bangers, Impact, sans-serif";
	ctx.fillText("THE DAILY INK", 76, 126);

	ctx.fillStyle = "#d90429";
	ctx.font = 'bold 22px "Bricolage Grotesque", sans-serif';
	ctx.fillText(
		`★ ISSUE #${currentIssueNumber} • EXTRA EDITION ★`,
		W - 430,
		120,
	);

	// 5. Draw Speech Bubble
	const bubbleX = 80;
	const bubbleY = 220;
	const bubbleW = W - 160;
	const bubbleH = 620;

	// Shadow
	ctx.fillStyle = "#111111";
	ctx.fillRect(bubbleX + 12, bubbleY + 12, bubbleW, bubbleH);

	// Main bubble fill
	ctx.fillStyle = currentTheme === "cyber" ? "#24273d" : "#ffffff";
	ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
	ctx.lineWidth = 6;
	ctx.strokeStyle = "#111111";
	ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

	// Speech tail
	ctx.beginPath();
	ctx.moveTo(bubbleX + bubbleW - 140, bubbleY + bubbleH);
	ctx.lineTo(bubbleX + bubbleW - 70, bubbleY + bubbleH + 40);
	ctx.lineTo(bubbleX + bubbleW - 70, bubbleY + bubbleH);
	ctx.closePath();
	ctx.fillStyle = currentTheme === "cyber" ? "#24273d" : "#ffffff";
	ctx.fill();
	ctx.stroke();

	// 6. Draw Quotation Marks & Quote Text
	ctx.fillStyle = "#d90429";
	ctx.font = "bold 110px Bangers, sans-serif";
	ctx.fillText("“", bubbleX + 30, bubbleY + 110);

	ctx.fillStyle = currentTheme === "cyber" ? "#ffffff" : "#111111";
	ctx.font = 'bold 44px "Bricolage Grotesque", sans-serif';

	// Auto-wrap quote text
	const words = currentQuote.content.split(" ");
	let line = "";
	let lineY = bubbleY + 120;
	const maxLineWidth = bubbleW - 100;
	const lineHeight = 58;

	for (let i = 0; i < words.length; i++) {
		const testLine = line + words[i] + " ";
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxLineWidth && i > 0) {
			ctx.fillText(line, bubbleX + 50, lineY);
			line = words[i] + " ";
			lineY += lineHeight;
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, bubbleX + 50, lineY);

	// 7. Draw Author Line
	const authorY = lineY + 90;
	ctx.strokeStyle = "#111111";
	ctx.lineWidth = 3;
	ctx.setLineDash([8, 6]);
	ctx.beginPath();
	ctx.moveTo(bubbleX + 50, authorY - 40);
	ctx.lineTo(bubbleX + bubbleW - 50, authorY - 40);
	ctx.stroke();
	ctx.setLineDash([]);

	ctx.fillStyle = "#d90429";
	ctx.font = 'bold 48px "Permanent Marker", cursive, sans-serif';
	ctx.fillText(`— ${currentQuote.author}`, bubbleX + 50, authorY + 10);

	ctx.fillStyle = currentTheme === "cyber" ? "#a6abbd" : "#555555";
	ctx.font = 'bold 24px "Bricolage Grotesque", sans-serif';
	ctx.fillText(currentQuote.role || "Thinker", bubbleX + 50, authorY + 48);

	// 8. Action Sticker Burst at Top Right of Bubble
	ctx.save();
	ctx.translate(bubbleX + bubbleW - 60, bubbleY - 20);
	ctx.rotate(0.14);
	ctx.fillStyle = "#ffbe0b";
	ctx.fillRect(-80, -30, 160, 60);
	ctx.lineWidth = 4;
	ctx.strokeStyle = "#111111";
	ctx.strokeRect(-80, -30, 160, 60);
	ctx.fillStyle = "#111111";
	ctx.font = "bold 36px Bangers, sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(currentQuote.burst || "POW!", 0, 14);
	ctx.restore();

	// 9. Footer Barcode & Stamp
	ctx.fillStyle = "#111111";
	ctx.font = "bold 22px monospace";
	ctx.textAlign = "left";
	ctx.fillText("ISBN 0-8240-DAILY-INK • COMICS CODE APPROVED", 70, H - 70);

	// Convert canvas to download link
	canvas.toBlob((blob) => {
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const downloadLink = document.createElement("a");
		downloadLink.href = url;
		downloadLink.download = `daily-ink-${(currentQuote.author || "quote").toLowerCase().replace(/\s+/g, "-")}.png`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		URL.revokeObjectURL(url);
		showComicToast("DOWNLOADED!", "Comic card saved as PNG!");
		playComicSound("chime");
	});
}

/* ==============================================================
   3-PANEL SUNDAY STRIP GENERATOR
   ============================================================== */
function assembleThreePanelStrip() {
	playComicSound("paper");

	// Pick three complementary quotes: Act 1 (Setup/Wisdom), Act 2 (Grit/Ponder), Act 3 (Climax/Humor)
	const act1Pool = COMIC_QUOTES.filter(
		(q) => q.category === "wisdom" || q.category === "philosophy",
	);
	const act2Pool = COMIC_QUOTES.filter(
		(q) => q.category === "grit" || q.category === "courage",
	);
	const act3Pool = COMIC_QUOTES.filter(
		(q) => q.category === "humor" || q.category === "creativity",
	);

	const q1 = act1Pool[Math.floor(Math.random() * act1Pool.length)];
	const q2 = act2Pool[Math.floor(Math.random() * act2Pool.length)];
	const q3 = act3Pool[Math.floor(Math.random() * act3Pool.length)];

	document.getElementById("strip-text-1").textContent = `“${q1.content}”`;
	document.getElementById("strip-author-1").textContent = `— ${q1.author}`;

	document.getElementById("strip-text-2").textContent = `“${q2.content}”`;
	document.getElementById("strip-author-2").textContent = `— ${q2.author}`;

	document.getElementById("strip-text-3").textContent = `“${q3.content}”`;
	document.getElementById("strip-author-3").textContent = `— ${q3.author}`;

	showComicToast("NEW STRIP!", "Fresh 3-Act Sunday Strip generated!");
}

/* ==============================================================
   EVENT LISTENERS & BINDINGS
   ============================================================== */
function setupEventListeners() {
	// Action buttons
	newQuoteBtn.addEventListener("click", rollNewQuote);
	prevQuoteBtn.addEventListener("click", () => stepHistory(-1));
	nextQuoteBtn.addEventListener("click", () => stepHistory(1));
	randomSurpriseBtn.addEventListener("click", rollNewQuote);
	copyBtn.addEventListener("click", copyQuoteToClipboard);
	shareBtn.addEventListener("click", shareQuoteData);
	favoriteBtn.addEventListener("click", toggleSaveCurrentQuote);
	voiceBtn.addEventListener("click", toggleSpeechSynthesis);
	exportCardBtn.addEventListener("click", exportComicCard);

	// Daily Pick
	dailyQuoteBtn.addEventListener("click", () => {
		const daily = getDailyCuratedQuote();
		renderQuote(daily, true);
		showComicToast("DAILY PICK!", "Loaded today’s featured wisdom strip!");
	});

	// Sound Toggle
	soundToggleBtn.addEventListener("click", () => {
		soundEnabled = !soundEnabled;
		localStorage.setItem("daily_ink_sound", soundEnabled.toString());
		if (soundEnabled) {
			soundIcon.className = "fas fa-volume-high";
			soundToggleBtn.querySelector(".btn-text").textContent = "SFX: ON";
			playComicSound("pop");
			showComicToast("SOUND ON", "Comic sound effects enabled!");
		} else {
			soundIcon.className = "fas fa-volume-xmark";
			soundToggleBtn.querySelector(".btn-text").textContent = "SFX: OFF";
			showComicToast("SOUND MUTED", "Audio muted.");
		}
	});

	// Scrapbook Drawer
	openScrapbookBtn.addEventListener("click", openScrapbook);
	closeScrapbookBtn.addEventListener("click", closeScrapbook);
	drawerBackdrop.addEventListener("click", closeScrapbook);
	clearScrapsBtn.addEventListener("click", () => {
		if (confirm("Clear all saved comic quotes from your scrapbook?")) {
			savedQuotes = [];
			saveScrapbookToStorage();
			updateFavoriteButtonState();
			renderScrapbookDrawer();
			playComicSound("click");
		}
	});

	// Theme Switching
	document.querySelectorAll(".theme-pill").forEach((btn) => {
		btn.addEventListener("click", () => {
			document
				.querySelectorAll(".theme-pill")
				.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			currentTheme = btn.dataset.theme;
			document.body.dataset.theme = currentTheme;
			localStorage.setItem("daily_ink_theme", currentTheme);
			playComicSound("click");
		});
	});

	// View Mode Switching (Single Hero vs 3-Panel Strip)
	modeSingleBtn.addEventListener("click", () => {
		modeSingleBtn.classList.add("active");
		modeStripBtn.classList.remove("active");
		singleView.hidden = false;
		stripView.hidden = true;
		playComicSound("click");
	});

	modeStripBtn.addEventListener("click", () => {
		modeStripBtn.classList.add("active");
		modeSingleBtn.classList.remove("active");
		singleView.hidden = true;
		stripView.hidden = false;
		assembleThreePanelStrip();
		playComicSound("paper");
	});

	if (generateStripBtn) {
		generateStripBtn.addEventListener("click", assembleThreePanelStrip);
	}

	// Balloon Style Switching
	document.querySelectorAll(".style-choice-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			document
				.querySelectorAll(".style-choice-btn")
				.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			currentBubbleStyle = btn.dataset.style;
			document.body.dataset.bubble = currentBubbleStyle;
			localStorage.setItem("daily_ink_bubble", currentBubbleStyle);
			playComicSound("pop");
		});
	});

	// Genre Filter Buttons
	document.querySelectorAll(".genre-pill").forEach((pill) => {
		pill.addEventListener("click", () => {
			document.querySelectorAll(".genre-pill").forEach((p) => {
				p.classList.remove("active");
				p.setAttribute("aria-selected", "false");
			});
			pill.classList.add("active");
			pill.setAttribute("aria-selected", "true");
			currentGenre = pill.dataset.genre;
			document.getElementById("active-genre-indicator").textContent =
				currentGenre.toUpperCase();
			rollNewQuote();
		});
	});

	// Keyboard Shortcuts
	window.addEventListener("keydown", (e) => {
		// Ignore if user is inside an input/textarea
		if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

		if (e.code === "Space") {
			e.preventDefault();
			rollNewQuote();
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			stepHistory(-1);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			stepHistory(1);
		} else if (e.key === "c" || e.key === "C") {
			copyQuoteToClipboard();
		} else if (e.key === "s" || e.key === "S") {
			toggleSaveCurrentQuote();
		} else if (e.key === "v" || e.key === "V") {
			toggleSpeechSynthesis();
		} else if (e.key === "d" || e.key === "D") {
			exportComicCard();
		} else if (e.key === "Escape") {
			closeScrapbook();
		}
	});
}

/* ==============================================================
   INITIALIZATION
   ============================================================== */
function initializeApp() {
	// Restore Theme & Bubble Style
	document.body.dataset.theme = currentTheme;
	document.body.dataset.bubble = currentBubbleStyle;

	const activeThemeBtn = document.querySelector(
		`.theme-pill[data-theme="${currentTheme}"]`,
	);
	if (activeThemeBtn) {
		document
			.querySelectorAll(".theme-pill")
			.forEach((b) => b.classList.remove("active"));
		activeThemeBtn.classList.add("active");
	}

	const activeBubbleBtn = document.querySelector(
		`.style-choice-btn[data-style="${currentBubbleStyle}"]`,
	);
	if (activeBubbleBtn) {
		document
			.querySelectorAll(".style-choice-btn")
			.forEach((b) => b.classList.remove("active"));
		activeBubbleBtn.classList.add("active");
	}

	// Restore Sound state
	if (!soundEnabled) {
		soundIcon.className = "fas fa-volume-xmark";
		soundToggleBtn.querySelector(".btn-text").textContent = "SFX: OFF";
	}

	// Set Date
	const today = new Date();
	const options = {
		weekday: "long",
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	if (currentDateEl) {
		currentDateEl.textContent = today
			.toLocaleDateString("en-US", options)
			.toUpperCase();
	}

	if (statsReadEl) statsReadEl.textContent = statsReadCount;
	renderScrapbookCounter();

	setupEventListeners();

	// Load Initial Quote
	rollNewQuote();
}

// Start on DOMContentLoaded or immediate
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeApp);
} else {
	initializeApp();
}
