// META: The Game of Life
// A philosophical, introspective game about optimizing life

// Global Variables
const stats = {
    health: 100,
    wealth: 50,
    knowledge: 30,
    relationships: 40,
    happiness: 60
};

const gameState = {
    age: 18,
    phase: 'youth', // youth, adult, middle-age, senior
    events: [],
    choices: [],
    reflections: [],
    gameOver: false,
    audioPaused: false,
    scenarioIndex: 0
};

// DOM Elements
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    loadingBar: document.querySelector('.loading-bar'),
    loadingText: document.querySelector('.loading-text'),
    menuScreen: document.getElementById('menu-screen'),
    aboutScreen: document.getElementById('about-screen'),
    gameScreen: document.getElementById('game-screen'),
    pauseScreen: document.getElementById('pause-screen'),
    eventScreen: document.getElementById('event-screen'),
    reflectionScreen: document.getElementById('reflection-screen'),
    endScreen: document.getElementById('end-screen'),
    messageModal: document.getElementById('message-modal'),
    
    startButton: document.getElementById('start-game'),
    aboutButton: document.getElementById('about-button'),
    aboutBackButton: document.getElementById('about-back'),
    pauseButton: document.getElementById('pause-button'),
    resumeButton: document.getElementById('resume-button'),
    restartButton: document.getElementById('restart-button'),
    quitButton: document.getElementById('quit-button'),
    eventContinueButton: document.getElementById('event-continue'),
    reflectionContinueButton: document.getElementById('reflection-continue'),
    playAgainButton: document.getElementById('play-again'),
    quitToMenuButton: document.getElementById('quit-to-menu'),
    messageOkButton: document.getElementById('message-ok'),
    toggleAudioButton: document.getElementById('toggle-audio'),
    
    scenarioText: document.getElementById('scenario-text'),
    choicesContainer: document.getElementById('choices-container'),
    ageDisplay: document.getElementById('age-display'),
    phaseDisplay: document.getElementById('phase-display'),
    
    healthBar: document.getElementById('health-bar'),
    healthValue: document.getElementById('health-value'),
    wealthBar: document.getElementById('wealth-bar'),
    wealthValue: document.getElementById('wealth-value'),
    knowledgeBar: document.getElementById('knowledge-bar'),
    knowledgeValue: document.getElementById('knowledge-value'),
    relationshipsBar: document.getElementById('relationships-bar'),
    relationshipsValue: document.getElementById('relationships-value'),
    happinessBar: document.getElementById('happiness-bar'),
    happinessValue: document.getElementById('happiness-value'),
    
    eventTitle: document.getElementById('event-title'),
    eventDescription: document.getElementById('event-description'),
    eventEffects: document.getElementById('event-effects'),
    
    reflectionText: document.getElementById('reflection-text'),
    reflectionQuestionText: document.getElementById('reflection-question-text'),
    reflectionAnswer: document.getElementById('reflection-answer'),
    
    lifeSummary: document.getElementById('life-summary'),
    statsSummary: document.getElementById('stats-summary'),
    finalMessage: document.getElementById('final-message'),
    
    messageText: document.getElementById('message-text')
};

// Audio Elements
let backgroundMusic = null;
let soundEffects = {
    click: null,
    notification: null,
    success: null,
    warning: null,
    gameOver: null,
    reflection: null
};

// Initialize Game
function initGame() {
    loadAudio();
    simulateLoading();
    setupEventListeners();
}

// Load Audio
function loadAudio() {
    // This is a placeholder - audio would be loaded here
    // backgroundMusic = new Audio('audio/background.mp3');
    // backgroundMusic.loop = true;
    // soundEffects.click = new Audio('audio/click.mp3');
    // soundEffects.notification = new Audio('audio/notification.mp3');
    // soundEffects.success = new Audio('audio/success.mp3');
    // soundEffects.warning = new Audio('audio/warning.mp3');
    // soundEffects.gameOver = new Audio('audio/gameover.mp3');
    // soundEffects.reflection = new Audio('audio/reflection.mp3');
}

// Toggle Audio
function toggleAudio() {
    gameState.audioPaused = !gameState.audioPaused;
    elements.toggleAudioButton.textContent = gameState.audioPaused ? '🔇' : '🔊';
    
    if (backgroundMusic) {
        if (gameState.audioPaused) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play();
        }
    }
}

// Play Sound Effect
function playSoundEffect(effect) {
    if (!gameState.audioPaused && soundEffects[effect]) {
        soundEffects[effect].play();
    }
}

// Simulate Loading
function simulateLoading() {
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                elements.loadingScreen.classList.add('hidden');
                elements.menuScreen.classList.remove('hidden');
                // if (backgroundMusic && !gameState.audioPaused) {
                //     backgroundMusic.play();
                // }
            }, 500);
        }
        
        elements.loadingBar.style.width = `${progress}%`;
        
        // Update loading text
        if (progress < 30) {
            elements.loadingText.textContent = "Initializing reality simulation...";
        } else if (progress < 60) {
            elements.loadingText.textContent = "Constructing life scenarios...";
        }else if (progress < 90) {
            elements.loadingText.textContent = "Calibrating existential parameters...";
        } else {
            elements.loadingText.textContent = "Simulation ready...";
        }
    }, 200);
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu Screen
    elements.startButton.addEventListener('click', () => {
        playSoundEffect('click');
        startGame();
    });
    
    elements.aboutButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.menuScreen.classList.add('hidden');
        elements.aboutScreen.classList.remove('hidden');
    });
    
    elements.aboutBackButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.aboutScreen.classList.add('hidden');
        elements.menuScreen.classList.remove('hidden');
    });
    
    // Game Screen
    elements.pauseButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.pauseScreen.classList.remove('hidden');
    });
    
    // Pause Screen
    elements.resumeButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.pauseScreen.classList.add('hidden');
    });
    
    elements.restartButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.pauseScreen.classList.add('hidden');
        restartGame();
    });
    
    elements.quitButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.pauseScreen.classList.add('hidden');
        elements.gameScreen.classList.add('hidden');
        elements.menuScreen.classList.remove('hidden');
    });
    
    // Event Screen
    elements.eventContinueButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.eventScreen.classList.add('hidden');
        continueGame();
    });
    
    // Reflection Screen
    elements.reflectionContinueButton.addEventListener('click', () => {
        playSoundEffect('click');
        const reflection = elements.reflectionAnswer.value.trim();
        
        if (reflection === '') {
            showMessage("Please take a moment to reflect before continuing.");
            return;
        }
        
        gameState.reflections.push({
            age: gameState.age,
            question: elements.reflectionQuestionText.textContent,
            answer: reflection
        });
        
        elements.reflectionScreen.classList.add('hidden');
        elements.reflectionAnswer.value = '';
        advanceAge();
        loadNextScenario();
    });
    
    // End Screen
    elements.playAgainButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.endScreen.classList.add('hidden');
        restartGame();
    });
    
    elements.quitToMenuButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.endScreen.classList.add('hidden');
        elements.menuScreen.classList.remove('hidden');
    });
    
    // Message Modal
    elements.messageOkButton.addEventListener('click', () => {
        playSoundEffect('click');
        elements.messageModal.classList.add('hidden');
    });
    
    // Audio Controls
    elements.toggleAudioButton.addEventListener('click', () => {
        toggleAudio();
    });
}

// Start Game
function startGame() {
    resetGameState();
    elements.menuScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    updateStatsDisplay();
    loadNextScenario();
}

// Restart Game
function restartGame() {
    resetGameState();
    elements.gameScreen.classList.remove('hidden');
    updateStatsDisplay();
    loadNextScenario();
}

// Reset Game State
function resetGameState() {
    stats.health = 100;
    stats.wealth = 50;
    stats.knowledge = 30;
    stats.relationships = 40;
    stats.happiness = 60;
    
    gameState.age = 18;
    gameState.phase = 'youth';
    gameState.events = [];
    gameState.choices = [];
    gameState.reflections = [];
    gameState.gameOver = false;
    gameState.scenarioIndex = 0;
    
    updateAgeDisplay();
}

// Update Stats Display
function updateStatsDisplay() {
    // Health
    elements.healthBar.style.width = `${stats.health}%`;
    elements.healthValue.textContent = stats.health;
    
    // Wealth
    elements.wealthBar.style.width = `${stats.wealth}%`;
    elements.wealthValue.textContent = stats.wealth;
    
    // Knowledge
    elements.knowledgeBar.style.width = `${stats.knowledge}%`;
    elements.knowledgeValue.textContent = stats.knowledge;
    
    // Relationships
    elements.relationshipsBar.style.width = `${stats.relationships}%`;
    elements.relationshipsValue.textContent = stats.relationships;
    
    // Happiness
    elements.happinessBar.style.width = `${stats.happiness}%`;
    elements.happinessValue.textContent = stats.happiness;
    
    // Change color based on value
    updateStatBarColors();
}

// Update Stat Bar Colors
function updateStatBarColors() {
    const statBars = {
        health: elements.healthBar,
        wealth: elements.wealthBar,
        knowledge: elements.knowledgeBar,
        relationships: elements.relationshipsBar,
        happiness: elements.happinessBar
    };
    
    for (const stat in stats) {
        const value = stats[stat];
        const bar = statBars[stat];
        
        if (value <= 20) {
            bar.style.backgroundColor = 'var(--danger-color)';
        } else if (value <= 50) {
            bar.style.backgroundColor = 'var(--warning-color)';
        } else {
            bar.style.backgroundColor = `var(--${stat}-color)`;
        }
    }
}

// Update Age Display
function updateAgeDisplay() {
    elements.ageDisplay.textContent = `AGE: ${gameState.age}`;
    elements.phaseDisplay.textContent = `PHASE: ${gameState.phase.toUpperCase()}`;
}

// Advance Age
function advanceAge() {
    gameState.age += 1;
    
    // Update life phase
    if (gameState.age >= 18 && gameState.age < 30) {
        gameState.phase = 'youth';
    } else if (gameState.age >= 30 && gameState.age < 50) {
        gameState.phase = 'adult';
    } else if (gameState.age >= 50 && gameState.age < 70) {
        gameState.phase = 'middle-age';
    } else {
        gameState.phase = 'senior';
    }
    
    updateAgeDisplay();
    
    // Naturally decrease health with age
    if (gameState.age > 50) {
        updateStat('health', -1);
    }
    
    // Check for end game
    if (gameState.age >= 90 || stats.health <= 0) {
        endGame();
        return;
    }
    
    // Random life events
    if (Math.random() < 0.3) {
        triggerRandomEvent();
    }
    
    // Reflection points at certain ages
    if ([25, 30, 40, 50, 60, 70, 80].includes(gameState.age)) {
        showReflection();
    }
}

// Update Stat
function updateStat(stat, amount) {
    stats[stat] += amount;
    
    // Keep stats within bounds
    if (stats[stat] < 0) stats[stat] = 0;
    if (stats[stat] > 100) stats[stat] = 100;
    
    updateStatsDisplay();
    
    // Check critical stats
    if (stats.health <= 0) {
        endGame();
    }
}

// Load Next Scenario
function loadNextScenario() {
    if (gameState.gameOver) return;
    
    // Get scenario based on current life phase
    const scenario = getScenarioByPhase(gameState.phase);
    
    elements.scenarioText.innerHTML = `<p>${scenario.text}</p>`;
    
    // Clear previous choices
    elements.choicesContainer.innerHTML = '';
    
    // Add choices
    scenario.choices.forEach((choice, index) => {
        const choiceButton = document.createElement('button');
        choiceButton.classList.add('choice-button');
        choiceButton.textContent = choice.text;
        
        choiceButton.addEventListener('click', () => {
            playSoundEffect('click');
            makeChoice(scenario, index);
        });
        
        elements.choicesContainer.appendChild(choiceButton);
    });
    
    gameState.scenarioIndex++;
}

// Make Choice
function makeChoice(scenario, choiceIndex) {
    const choice = scenario.choices[choiceIndex];
    
    // Record the choice
    gameState.choices.push({
        age: gameState.age,
        scenario: scenario.text,
        choice: choice.text
    });
    
    // Apply stat changes
    for (const stat in choice.effects) {
        updateStat(stat, choice.effects[stat]);
    }
    
    // Show immediate feedback
    showEvent(`DECISION: ${choice.text}`, choice.outcome, choice.effects);
    
    // Check for special outcomes
    if (choice.triggers) {
        // Handle special triggers here
    }
}

// Continue Game
function continueGame() {
    advanceAge();
    loadNextScenario();
}

// Show Event
function showEvent(title, description, effects = null) {
    playSoundEffect('notification');
    
    elements.eventTitle.textContent = title;
    elements.eventDescription.textContent = description;
    
    if (effects) {
        let effectsText = '<ul>';
        for (const stat in effects) {
            const value = effects[stat];
            const sign = value >= 0 ? '+' : '';
            effectsText += `<li>${stat.toUpperCase()}: ${sign}${value}</li>`;
        }
        effectsText += '</ul>';
        
        elements.eventEffects.innerHTML = effectsText;
    } else {
        elements.eventEffects.innerHTML = '';
    }
    
    elements.eventScreen.classList.remove('hidden');
}

// Show Reflection
function showReflection() {
    playSoundEffect('reflection');
    
    const reflection = getReflectionByAge(gameState.age);
    
    elements.reflectionText.textContent = reflection.text;
    elements.reflectionQuestionText.textContent = reflection.question;
    
    elements.reflectionScreen.classList.remove('hidden');
}

// Show Message
function showMessage(text) {
    elements.messageText.textContent = text;
    elements.messageModal.classList.remove('hidden');
}

// End Game
function endGame() {
    playSoundEffect('gameOver');
    
    gameState.gameOver = true;
    
    // Generate life summary
    let lifeSummary = `<h3>Your life journey ended at age ${gameState.age}</h3>`;
    lifeSummary += `<p>You lived a life that was `;
    
    // Determine life quality based on stats
    const avgStat = (stats.health + stats.wealth + stats.knowledge + stats.relationships + stats.happiness) / 5;
    
    if (avgStat >= 80) {
        lifeSummary += 'extraordinarily fulfilled and successful.';
    } else if (avgStat >= 60) {
        lifeSummary += 'generally good with many achievements.';
    } else if (avgStat >= 40) {
        lifeSummary += 'a mixed experience with ups and downs.';
    } else {
        lifeSummary += 'challenging and often difficult.';
    }
    lifeSummary += '</p>';
    
    // Add key life events
    lifeSummary += `<h4>Key Life Choices:</h4><ul>`;
    const significantChoices = gameState.choices.filter((_, index) => index % 3 === 0).slice(-5);
    significantChoices.forEach(choice => {
        lifeSummary += `<li>Age ${choice.age}: ${choice.choice}</li>`;
    });
    lifeSummary += `</ul>`;
    
    elements.lifeSummary.innerHTML = lifeSummary;
    
    // Generate stats summary
    let statsSummary = `<h3>Final Stats:</h3>`;
    statsSummary += `<ul>`;
    for (const stat in stats) {
        statsSummary += `<li>${stat.toUpperCase()}: ${stats[stat]}</li>`;
    }
    statsSummary += `</ul>`;
    
    elements.statsSummary.innerHTML = statsSummary;
    
    // Generate final message
    let finalMessage = '';
    
    if (stats.health <= 0) {
        finalMessage = "Your journey ended prematurely. Health is the foundation upon which all other aspects of life are built. In the game of life, maintaining your health is not optional—it's essential.";
    } else if (gameState.age >= 90) {
        finalMessage = "You reached the end of a full life. In the end, the game of life isn't about maximizing every stat, but about creating a journey that feels meaningful to you.";
    }
    
    finalMessage += " Remember: the real game continues outside this simulation. What will you optimize for?";
    
    elements.finalMessage.textContent = finalMessage;
    
    // Show end screen
    elements.gameScreen.classList.add('hidden');
    elements.endScreen.classList.remove('hidden');
}

// ----- Game Content -----

// Get Scenario by Phase
function getScenarioByPhase(phase) {
    // Get scenarios appropriate for the current life phase
    const availableScenarios = scenarios.filter(scenario => 
        scenario.phases.includes(phase) && 
        (!scenario.ageMin || gameState.age >= scenario.ageMin) &&
        (!scenario.ageMax || gameState.age <= scenario.ageMax)
    );
    
    // Randomly select one
    const randomIndex = Math.floor(Math.random() * availableScenarios.length);
    return availableScenarios[randomIndex];
}

// Get Reflection by Age
function getReflectionByAge(age) {
    // Get reflection appropriate for the current age
    const availableReflections = reflections.filter(reflection =>
        (!reflection.ageMin || age >= reflection.ageMin) &&
        (!reflection.ageMax || age <= reflection.ageMax)
    );
    
    // Randomly select one
    const randomIndex = Math.floor(Math.random() * availableReflections.length);
    return availableReflections[randomIndex];
}

// Trigger Random Event
function triggerRandomEvent() {
    // Get events appropriate for the current life phase
    const availableEvents = events.filter(event => 
        event.phases.includes(gameState.phase) && 
        (!event.ageMin || gameState.age >= event.ageMin) &&
        (!event.ageMax || gameState.age <= event.ageMax)
    );
    
    // Randomly select one
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    const event = availableEvents[randomIndex];
    
    // Record the event
    gameState.events.push({
        age: gameState.age,
        event: event.title
    });
    
    // Apply event effects
    if (event.effects) {
        for (const stat in event.effects) {
            updateStat(stat, event.effects[stat]);
        }
    }
    
    // Show event
    showEvent(event.title, event.description, event.effects);
}

// ----- Game Data -----

// Scenarios
const scenarios = [
    // Youth Phase Scenarios (18-29)
    {
        phases: ['youth'],
        text: "You're at a crossroads after graduating. What path will you choose?",
        choices: [
            {
                text: "Pursue higher education at a prestigious university",
                effects: { 
                    health: -5, 
                    wealth: -20, 
                    knowledge: +25, 
                    relationships: +5, 
                    happiness: 0 
                },
                outcome: "You spend years dedicated to intense study. While your knowledge expands dramatically, student loans pile up, and your health takes a hit from the stress and long hours."
            },
            {
                text: "Start working immediately to gain experience and financial stability",
                effects: { 
                    health: 0, 
                    wealth: +15, 
                    knowledge: +5, 
                    relationships: 0, 
                    happiness: +5 
                },
                outcome: "You gain practical skills on the job and start building financial security earlier than peers. Your trajectory might be slower, but you've avoided debt and gained real-world experience."
            },
            {
                text: "Take a gap year to travel and discover yourself",
                effects: { 
                    health: +10, 
                    wealth: -10, 
                    knowledge: +15, 
                    relationships: +10, 
                    happiness: +20 
                },
                outcome: "The experiences broaden your perspective tremendously. You meet diverse people and see how different cultures approach life. Though it costs money, the memories and insights seem invaluable."
            }
        ]
    },
    {
        phases: ['youth'],
        text: "You notice everyone around you seems obsessed with social media and creating 'perfect' online personas. How do you approach your digital life?",
        choices: [
            {
                text: "Embrace it fully - carefully curate your online presence to maximize opportunities",
                effects: { 
                    health: -5, 
                    wealth: +5, 
                    knowledge: 0, 
                    relationships: +10, 
                    happiness: -10 
                },
                outcome: "Your well-crafted online persona opens doors professionally and socially. However, the constant pressure to maintain this image creates an underlying anxiety, and you sometimes feel disconnected from your authentic self."
            },
            {
                text: "Maintain minimal, authentic profiles and use social media sparingly",
                effects: { 
                    health: +5, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: -5, 
                    happiness: +10 
                },
                outcome: "You feel mentally healthier with less digital noise, though you occasionally miss networking opportunities or social events. The relationships you maintain are deeper, even if fewer in number."
            },
            {
                text: "Reject social media entirely and focus on in-person connections",
                effects: { 
                    health: +10, 
                    wealth: -5, 
                    knowledge: +5, 
                    relationships: -10, 
                    happiness: +5 
                },
                outcome: "Your mental clarity improves dramatically without the constant comparisons and distractions. However, you find yourself increasingly out of loop with peers, and some professional opportunities pass you by."
            }
        ]
    },
    
    // Adult Phase Scenarios (30-49)
    {
        phases: ['adult'],
        text: "Your career has plateaued, and you're feeling increasingly unsatisfied. What action do you take?",
        choices: [
            {
                text: "Take a risk on a complete career change to follow your passion",
                effects: { 
                    health: 0, 
                    wealth: -20, 
                    knowledge: +20, 
                    relationships: -5, 
                    happiness: +15 
                },
                outcome: "The transition is harder than expected. Your savings take a hit and you experience moments of doubt, but gradually your new path begins to energize you in ways your old job never did."
            },
            {
                text: "Stay in your current field but aggressively seek promotion opportunities",
                effects: { 
                    health: -10, 
                    wealth: +20, 
                    knowledge: +10, 
                    relationships: -5, 
                    happiness: -5 
                },
                outcome: "Working longer hours and taking on more responsibility strains your well-being, but your financial situation improves significantly. You gain valuable leadership experience, though at a cost."
            },
            {
                text: "Maintain your current role but find meaning outside work through hobbies and relationships",
                effects: { 
                    health: +10, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: +15, 
                    happiness: +10 
                },
                outcome: "By accepting your job as just a job, you free yourself to invest energy in other areas. Your life becomes more balanced, though you sometimes wonder about the career heights you might have reached."
            }
        ]
    },
    {
        phases: ['adult'],
        text: "After years of grinding, you've accumulated some wealth. How do you approach your financial future?",
        choices: [
            {
                text: "Aggressively invest most of your money seeking maximum returns",
                effects: { 
                    health: -5, 
                    wealth: +25, 
                    knowledge: +5, 
                    relationships: -5, 
                    happiness: -5 
                },
                outcome: "Your portfolio grows impressively, opening future options many peers won't have. However, tracking markets and worrying about investments creates constant background stress."
            },
            {
                text: "Balance saving for the future with enjoying life now",
                effects: { 
                    health: +5, 
                    wealth: +10, 
                    knowledge: 0, 
                    relationships: +5, 
                    happiness: +10 
                },
                outcome: "You build reasonable financial security while still experiencing life's pleasures. Your moderate approach won't make you rich, but provides a sustainable path that doesn't sacrifice your present happiness."
            },
            {
                text: "Focus on experiences over possessions - spend on travel and adventures",
                effects: { 
                    health: +10, 
                    wealth: -15, 
                    knowledge: +15, 
                    relationships: +10, 
                    happiness: +15 
                },
                outcome: "Your bank account grows slower than peers', but your life is rich with memories and stories. You develop a profound appreciation for the ephemeral nature of life, though retirement planning becomes a concern."
            }
        ]
    },
    
    // Middle-Age Phase Scenarios (50-69)
    {
        phases: ['middle-age'],
        text: "You notice physical changes as you age. How do you respond to your body's transformation?",
        choices: [
            {
                text: "Fight aging with everything available - intensive exercise, medical interventions, etc.",
                effects: { 
                    health: +10, 
                    wealth: -15, 
                    knowledge: 0, 
                    relationships: -5, 
                    happiness: -5 
                },
                outcome: "Your disciplined approach pays dividends physically - you're in better shape than many younger people. However, the constant battle against time creates an underlying anxiety, and the expense is significant."
            },
            {
                text: "Accept aging gracefully while maintaining reasonable health practices",
                effects: { 
                    health: +5, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: +5, 
                    happiness: +15 
                },
                outcome: "Your balanced approach brings peace of mind and steady health. You're neither in denial about aging nor defined by fear of it. This mental freedom allows you to focus on what truly matters."
            },
            {
                text: "Ignore the changes and continue living exactly as before",
                effects: { 
                    health: -15, 
                    wealth: +5, 
                    knowledge: 0, 
                    relationships: 0, 
                    happiness: -10 
                },
                outcome: "Initially, there's freedom in denial, but reality catches up eventually. Health issues emerge that could have been mitigated, limiting your options and creating regrets about not adapting sooner."
            }
        ]
    },
    {
        phases: ['middle-age'],
        text: "Looking back at your life so far, you recognize patterns and paths not taken. How do you process these reflections?",
        choices: [
            {
                text: "Make dramatic life changes to address lingering regrets before it's too late",
                effects: { 
                    health: -5, 
                    wealth: -10, 
                    knowledge: +15, 
                    relationships: -5, 
                    happiness: +15 
                },
                outcome: "The transitions are challenging but ultimately revitalizing. There's a bittersweet quality to finally pursuing long-dormant dreams, yet the courage to change brings renewed purpose and vitality."
            },
            {
                text: "Share your wisdom with younger generations through mentoring",
                effects: { 
                    health: 0, 
                    wealth: 0, 
                    knowledge: +10, 
                    relationships: +15, 
                    happiness: +10 
                },
                outcome: "You discover that helping others navigate their journeys brings unexpected fulfillment. Your perspective becomes more generous as you see your own experiences as valuable wisdom rather than missed opportunities."
            },
            {
                text: "Practice radical acceptance of your life choices and focus on appreciating the present",
                effects: { 
                    health: +10, 
                    wealth: +5, 
                    knowledge: +5, 
                    relationships: +5, 
                    happiness: +20 
                },
                outcome: "The mental burden of what-ifs and regrets lifts gradually. You discover a profound appreciation for the life you have rather than fantasizing about roads not taken. This mindfulness improves everything from sleep to relationships."
            }
        ]
    },
    
    // Senior Phase Scenarios (70+)
    {
        phases: ['senior'],
        text: "Your energy levels aren't what they once were. How do you adapt to this reality?",
        choices: [
            {
                text: "Push against limitations, maintaining an ambitious schedule despite fatigue",
                effects: { 
                    health: -15, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: -5, 
                    happiness: -10 
                },
                outcome: "Your determination is admirable but taking a physical toll. The struggle to maintain your former pace creates frustration and potential health setbacks that could have been avoided."
            },
            {
                text: "Thoughtfully prioritize activities, focusing energy on what matters most",
                effects: { 
                    health: +10, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: +10, 
                    happiness: +15 
                },
                outcome: "This balanced approach proves sustainable and surprisingly satisfying. You discover that being selective enhances your appreciation of chosen activities, and the quality of your experiences improves."
            },
            {
                text: "Explore new, less physically demanding interests and connections",
                effects: { 
                    health: +5, 
                    wealth: -5, 
                    knowledge: +15, 
                    relationships: +5, 
                    happiness: +10 
                },
                outcome: "Your adaptability opens unexpected doors. New hobbies and relationships bring fresh perspectives in this life stage. You find fulfillment in ways you hadn't anticipated, proving that growth continues throughout life."
            }
        ]
    },
    {
        phases: ['senior'],
        text: "Facing mortality becomes more concrete at this stage of life. How do you approach this universal reality?",
        choices: [
            {
                text: "Focus on leaving a legacy through writing memoirs or creating something lasting",
                effects: { 
                    health: -5, 
                    wealth: -5, 
                    knowledge: +15, 
                    relationships: 0, 
                    happiness: +10 
                },
                outcome: "The process of organizing your life story proves unexpectedly profound. You gain new insights about your journey, and the sense of creating something that will outlast you brings comfort and meaning."
            },
            {
                text: "Deepen relationships and focus on quality time with loved ones",
                effects: { 
                    health: +5, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: +20, 
                    happiness: +15 
                },
                outcome: "These connections become your greatest source of joy and comfort. The emotional intimacy you develop creates a support network that enhances your daily life while preparing a soft landing for whatever comes next."
            },
            {
                text: "Live adventurously, taking reasonable risks to maximize remaining experiences",
                effects: { 
                    health: -10, 
                    wealth: -10, 
                    knowledge: +10, 
                    relationships: +5, 
                    happiness: +20 
                },
                outcome: "Your bold approach inspires those around you and keeps your spirit youthful. While there are physical consequences to pushing boundaries, the vitality and joy you maintain seems to outweigh the costs."
            }
        ]
    },
    
    // Multi-phase scenarios
    {
        phases: ['youth', 'adult', 'middle-age'],
        text: "A close friend reveals they're struggling with depression but asks you not to tell anyone. How do you respond?",
        choices: [
            {
                text: "Respect their privacy completely but offer personal support",
                effects: { 
                    health: -5, 
                    wealth: 0, 
                    knowledge: 0, 
                    relationships: +5, 
                    happiness: -5 
                },
                outcome: "Your friend appreciates your loyalty, but carrying this burden alone weighs on you. You worry constantly about making the right decisions without professional guidance."
            },
            {
                text: "Gently encourage them to seek professional help while providing support",
                effects: { 
                    health: 0, 
                    wealth: 0, 
                    knowledge: +5, 
                    relationships: +10, 
                    happiness: +5 
                },
                outcome: "Initially resistant, your friend eventually agrees to talk to someone. They later thank you for your balanced approach that respected their agency while not leaving them to handle everything alone."
            },
            {
                text: "Break confidence to inform their family, believing safety trumps privacy",
                effects: { 
                    health: +5, 
                    wealth: 0, 
                    knowledge: 0, 
                    relationships: -15, 
                    happiness: -10 
                },
                outcome: "Your friend feels deeply betrayed and shuts you out. Though their family intervenes with help, your relationship may never fully recover from this breach of trust."
            }
        ]
    },
    {
        phases: ['adult', 'middle-age', 'senior'],
        text: "You discover you have the opportunity to make a significant amount of money through means that are legal but ethically questionable. What do you do?",
        choices: [
            {
                text: "Take full advantage - the system is designed for those who maximize opportunities",
                effects: { 
                    health: -5, 
                    wealth: +30, 
                    knowledge: 0, 
                    relationships: -10, 
                    happiness: -10 
                },
                outcome: "Your financial situation improves dramatically, opening doors previously closed. However, you notice a growing cynicism in yourself and increasing distance in some relationships as your values shift to justify your choices."
            },
            {
                text: "Find a middle path that benefits you while minimizing ethical compromise",
                effects: { 
                    health: 0, 
                    wealth: +15, 
                    knowledge: +5, 
                    relationships: -5, 
                    happiness: 0 
                },
                outcome: "This pragmatic approach brings moderate financial gain without completely abandoning your principles. You sometimes question where exactly to draw the line, but generally sleep well at night."
            },
            {
                text: "Decline entirely - no amount of money is worth compromising your values",
                effects: { 
                    health: +10, 
                    wealth: -5, 
                    knowledge: +5, 
                    relationships: +5, 
                    happiness: +10 
                },
                outcome: "You forfeit immediate financial advancement but maintain complete integrity. This choice brings inner peace and strengthens relationships with those who share your values, though occasionally you wonder 'what if'."
            }
        ]
    }
];

// ... (Previous code from script.js - everything before "const scenarios") ...

// Random Life Events
const events = [
    // Youth Events (18-29)
    {
        phases: ['youth'],
        title: "Unexpected Windfall",
        description: "You receive an unexpected inheritance from a distant relative.",
        effects: { wealth: +15, happiness: +5 }
    },
    {
        phases: ['youth'],
        title: "Minor Health Scare",
        description: "A sudden illness reminds you of your mortality.",
        effects: { health: -10, happiness: -5, knowledge: +5 }
    },
    {
        phases: ['youth'],
        title: "Friendship Betrayal",
        description: "A close friend betrays your trust.",
        effects: { relationships: -15, happiness: -10 }
    },
    {
        phases:['youth'],
        title: "Chance encounter leads to new opportunity.",
        description: "While volunteering at a local community event, you meet someone who offers you an internship at a company known for its innovative culture. This could potentially shift your career path, but would require relocating to a new city.",
        effects: { wealth: +5, knowledge: +10, relationships: -5, happiness: +5}
    },
    {
        phases:['youth'],
        title: "Creative spark leads to viral success.",
        description: "A side project you've been working on in your free time - a short film, a piece of music, or a unique craft - unexpectedly goes viral online.  This could lead to new opportunities, but also invites scrutiny and pressure.",
        effects: { wealth: +15, knowledge: +5, relationships: +10, happiness: +5}
    },

    // Adult Events (30-49)
    {
        phases: ['adult'],
        title: "Major Health Crisis",
        description: "A serious health condition emerges, requiring significant lifestyle changes.",
        effects: { health: -25, happiness: -10, knowledge: +10, wealth: -10 }
    },
    {
        phases: ['adult'],
        title: "Economic Downturn",
        description: "The economy takes a hit, affecting your job security and investments.",
        effects: { wealth: -20, happiness: -5 }
    },
    {
        phases: ['adult'],
        title: "Family Emergency",
        description: "A family member needs your support.",
        effects: { relationships: +10, happiness: -10, wealth: -5 }
    },
    {
      phases: ['adult'],
      title: "Unexpected recognition at work",
      description: "Your hard work is unexpectedly recognized, and you are offered a significant promotion. This comes with increased responsibilities and longer hours, but also a substantial raise.",
      effects: {wealth: +20, knowledge: +10, relationships: -5, health: -5, happiness: +5}
    },
    {
        phases: ['adult'],
        title: "Mid-life crisis",
        description: "You're experiencing a classic mid-life crisis. You feel an urge to make drastic changes in your life, questioning your past choices and seeking a renewed sense of purpose.",
        effects: {happiness: -15, knowledge: +15}
    },

    // Middle-Age Events (50-69)
    {
        phases: ['middle-age'],
        title: "Loss of a Loved One",
        description: "You experience the profound grief of losing someone close to you.",
        effects: { relationships: -20, happiness: -25, knowledge: +15 }
    },
    {
        phases: ['middle-age'],
        title: "Health Complications",
        description: "Chronic health issues begin to surface.",
        effects: { health: -15, happiness: -5 }
    },
    {
        phases: ['middle-age'],
        title: "Retirement Planning",
        description: "You realize you need to get serious about retirement planning.",
        effects: { wealth: -10, knowledge: +10, happiness: +5 }
    },
    {
      phases: ['middle-age'],
      title: 'Opportunity to mentor',
      description: 'A younger colleague seeks your guidance and mentorship. Sharing your experience and wisdom could be fulfilling, but would also require a significant time commitment.',
      effects: {knowledge: +10, relationships: +15, happiness: +10, wealth: -5}
    },
    {
        phases: ['middle-age'],
        title: "A rekindled passion",
        description: "You rediscover a long-forgotten hobby or passion from your youth.  Diving back into it could bring great joy and new connections, but might also require reallocating time and resources.",
        effects: {health: +5, happiness: +15, knowledge: +5, relationships: +10, wealth: -5}
    },

    // Senior Events (70+)
    {
        phases: ['senior'],
        title: "Health Decline",
        description: "Your physical health continues to decline.",
        effects: { health: -20, happiness: -5 }
    },
    {
        phases: ['senior'],
        title: "Reflecting on Life",
        description: "You spend time reflecting on your life's journey.",
        effects: { knowledge: +20, happiness: +10 }
    },
    {
        phases: ['senior'],
        title: "Community Connection",
        description: "You find solace and purpose in connecting with your community.",
        effects: { relationships: +15, happiness: +10 }
    },
    {
        phases: ['senior'],
        title: "Sense of accomplishment",
        description: "Looking back, you have a moment where the full weight of your accomplishments, both big and small, comes into clear focus. You experience a deep sense of satisfaction and contentment.",
        effects: {happiness: +25, knowledge: +5}
    },
    {
        phases: ['senior'],
        title: "Physical limitations",
        description: "Your physical abilities have noticeably declined, limiting your independence and requiring you to rely more on others.",
        effects: {health: -15, happiness: -10, relationships: +10}
    },
];

// Reflection Questions
const reflections = [
    // Youth Reflections
    {
        ageMin: 25,
        ageMax: 25,
        text: "As you enter your mid-twenties, you pause to reflect on your path.",
        question: "What is your biggest aspiration, and what steps are you taking (or not taking) towards it?"
    },
    {
        ageMin: 30,
        ageMax: 30,
        text: "At thirty, you consider the balance (or imbalance) in your life.",
        question: "What are you prioritizing, and is that aligned with your deepest values?"
    },

    // Adult Reflections
    {
        ageMin: 40,
        ageMax: 40,
        text: "At forty, the 'mid-life' mark prompts introspection.",
        question: "If you could go back ten years, what advice would you give yourself?"
    },
    {
        ageMin: 50,
        ageMax: 50,
        text: "Reaching fifty, you look back at your life's journey.",
        question: "What are you most proud of, and what (if anything) do you regret?"
    },

    // Middle-Age Reflections
    {
      ageMin: 60,
      ageMax: 60,
      text: "Turning sixty, you reflect on legacy and impact.",
      question: "What do you want your legacy to be? How will you be remembered?"
    },
    {
      ageMin: 70,
      ageMax: 70,
      text: "At seventy, the value of time becomes ever clearer.",
      question: "How are you choosing to spend your time, and does that reflect what truly matters to you?"
    },

    // Senior Reflections
    {
        ageMin: 80,
        ageMax: 80,
        text: "In your eighties, wisdom accumulated over a lifetime comes into focus.",
        question: "What is the most important lesson life has taught you?"
    },
    {
        ageMin: 85,
        ageMax: 85,
        text: "Contemplate on life.",
        question: "What are your final thoughts?"
    }
];


// ... (Rest of the functions - initGame, loadAudio, etc. remain the same) ...

// Initialize Game (Call this at the end of the script)
initGame();