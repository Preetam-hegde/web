// Game state
let gameState = {
    money: 100,
    population: 0,
    prestige: 0,
    totalEarned: 0,
    lastUpdate: Date.now(),
    buildings: [
        {
            id: 1,
            name: "Small House",
            description: "A simple home for your citizens",
            baseIncome: 1,
            basePrice: 0,
            count: 0,
            icon: "fa-home",
            unlocked: true
        },
        {
            id: 2,
            name: "Apartment",
            description: "Multi-family residence",
            baseIncome: 5,
            basePrice: 100,
            count: 0,
            icon: "fa-building",
            unlocked: false
        },
        {
            id: 3,
            name: "Corner Store",
            description: "Local shopping for basic needs",
            baseIncome: 15,
            basePrice: 500,
            count: 0,
            icon: "fa-store",
            unlocked: false
        },
        {
            id: 4,
            name: "Office Building",
            description: "Business center for your city",
            baseIncome: 50,
            basePrice: 2000,
            count: 0,
            icon: "fa-briefcase",
            unlocked: false
        },
        {
            id: 5,
            name: "Shopping Mall",
            description: "A large retail complex",
            baseIncome: 150,
            basePrice: 7500,
            count: 0,
            icon: "fa-shopping-cart",
            unlocked: false
        },
        {
            id: 6,
            name: "Research Center",
            description: "Advanced research facility",
            baseIncome: 500,
            basePrice: 25000,
            count: 0,
            icon: "fa-flask",
            unlocked: false
        },
        {
            id: 7,
            name: "Skyscraper",
            description: "Impressive tower for your skyline",
            baseIncome: 1500,
            basePrice: 100000,
            count: 0,
            icon: "fa-city",
            unlocked: false
        },
        {
            id: 8,
            name: "Theme Park",
            description: "Entertainment for your citizens",
            baseIncome: 5000,
            basePrice: 500000,
            count: 0,
            icon: "fa-ferris-wheel",
            unlocked: false
        },
        {
            id: 9,
            name: "Space Center",
            description: "Reach for the stars!",
            baseIncome: 15000,
            basePrice: 2000000,
            count: 0,
            icon: "fa-rocket",
            unlocked: false
        }
    ],
    settings: {
        music: true,
        soundEffects: true,
        notifications: true
    },
    tutorialCompleted: false
};

// DOM elements
const moneyDisplay = document.getElementById('money');
const populationDisplay = document.getElementById('population');
const prestigeDisplay = document.getElementById('prestige');
const incomePerSecondDisplay = document.getElementById('incomePerSecond');
const totalEarnedDisplay = document.getElementById('totalEarned');
const buildingsOwnedDisplay = document.getElementById('buildingsOwned');
const buildingListContainer = document.getElementById('buildingList');
const cityGridContainer = document.getElementById('cityGrid');
const tutorialOverlay = document.getElementById('tutorialOverlay');
const startTutorialBtn = document.getElementById('startTutorialBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const closeTutorialBtn = document.getElementById('closeTutorialBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const musicToggle = document.getElementById('musicToggle');
const soundToggle = document.getElementById('soundToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const notification = document.getElementById('notification');

// Audio elements
const cashSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3');
const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3');
const unlockSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');

// Helper functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return Math.floor(num);
    }
}

function calculatePrice(building) {
    return Math.floor(building.basePrice * Math.pow(1.15, building.count));
}

function calculateIncome(building) {
    return building.baseIncome * building.count * (1 + gameState.prestige * 0.1);
}

function calculateTotalIncome() {
    return gameState.buildings.reduce((total, building) => total + calculateIncome(building), 0);
}

function calculateTotalBuildings() {
    return gameState.buildings.reduce((total, building) => total + building.count, 0);
}

function updatePopulation() {
    // Basic population calculation based on buildings
    gameState.population = Math.floor(
        gameState.buildings.reduce((total, building) => {
            if (building.id === 1) return total + building.count * 4; // Small House
            if (building.id === 2) return total + building.count * 15; // Apartment
            return total;
        }, 0)
    );
    populationDisplay.textContent = formatNumber(gameState.population);
}

function checkUnlocks() {
    gameState.buildings.forEach((building, index) => {
        if (index > 0 && !building.unlocked) {
            const previousBuilding = gameState.buildings[index - 1];
            if (previousBuilding.count >= 3) {
                building.unlocked = true;
                showNotification(`New building unlocked: ${building.name}!`);
                if (gameState.settings.soundEffects) {
                    unlockSound.play();
                }
                renderBuildingList();
                renderCityGrid();
            }
        }
    });
}

function showNotification(message) {
    if (!gameState.settings.notifications) return;
    
    notification.textContent = message;
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

function createIncomePopup(x, y, amount) {
    const popup = document.createElement('div');
    popup.className = 'income-popup';
    popup.textContent = `+$${formatNumber(amount)}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    document.body.appendChild(popup);
    
    // Remove after animation completes
    setTimeout(() => {
        document.body.removeChild(popup);
    }, 1500);
}

// Rendering functions
function renderBuildingList() {
    buildingListContainer.innerHTML = '';
    
    gameState.buildings.forEach(building => {
        if (!building.unlocked) return;
        
        const buildingItem = document.createElement('div');
        buildingItem.className = 'building-item';
        buildingItem.dataset.buildingId = building.id;
        
        const price = calculatePrice(building);
        const income = calculateIncome(building);
        
        buildingItem.innerHTML = `
            <div class="building-header">
                <span class="building-name"><i class="fas ${building.icon}"></i> ${building.name}</span>
                <span class="building-level">Lvl ${building.count}</span>
            </div>
            <div class="building-income">
                <i class="fas fa-coins"></i> ${formatNumber(income)}/sec
            </div>
            <p>${building.description}</p>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${Math.min(100, (gameState.money / price) * 100)}%"></div>
            </div>
            <button class="upgrade-btn" ${gameState.money < price ? 'disabled' : ''}>
                <i class="fas fa-arrow-up"></i> Buy ($${formatNumber(price)})
            </button>
        `;
        
        buildingListContainer.appendChild(buildingItem);
        
        // Add event listener to the button
        const upgradeBtn = buildingItem.querySelector('.upgrade-btn');
        upgradeBtn.addEventListener('click', () => {
            if (gameState.money >= price) {
                gameState.money -= price;
                building.count++;
                
                // Play sound
                if (gameState.settings.soundEffects) {
                    cashSound.play();
                }
                
                // Create a random position for the income popup
                const x = Math.random() * (window.innerWidth - 100);
                const y = Math.random() * (window.innerHeight - 100);
                createIncomePopup(x, y, income);
                
                // Update UI
                updateDisplays();
                renderBuildingList();
                renderCityGrid();
                checkUnlocks();
                saveGame();
            }
        });
    });
}

function renderCityGrid() {
    cityGridContainer.innerHTML = '';
    
    // Create grid items for each unlocked building with at least 1 count
    gameState.buildings.forEach(building => {
        if (building.unlocked && building.count > 0) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-building';
            
            gridItem.innerHTML = `
                <i class="fas ${building.icon}"></i>
                <h3>${building.name}</h3>
                <p>Owned: ${building.count}</p>
                <p class="building-income">
                    <i class="fas fa-coins"></i> ${formatNumber(calculateIncome(building))}/sec
                </p>
            `;
            
            cityGridContainer.appendChild(gridItem);
            
            // Add animation for newly added buildings
            gridItem.classList.add('fade-in');
            
            // Add pulse animation for buildings that were just upgraded
            if (building.justUpgraded) {
                gridItem.classList.add('pulse');
                building.justUpgraded = false;
            }
        }
    });
}

function updateDisplays() {
    moneyDisplay.textContent = formatNumber(gameState.money);
    populationDisplay.textContent = formatNumber(gameState.population);
    prestigeDisplay.textContent = formatNumber(gameState.prestige);
    incomePerSecondDisplay.textContent = formatNumber(calculateTotalIncome());
    totalEarnedDisplay.textContent = formatNumber(gameState.totalEarned);
    buildingsOwnedDisplay.textContent = calculateTotalBuildings();
    
    // Update progress bars for building costs
    gameState.buildings.forEach(building => {
        if (!building.unlocked) return;
        
        const buildingItem = document.querySelector(`.building-item[data-building-id="${building.id}"]`);
        if (buildingItem) {
            const price = calculatePrice(building);
            const progressBar = buildingItem.querySelector('.progress-bar');
            const upgradeBtn = buildingItem.querySelector('.upgrade-btn');
            
            progressBar.style.width = `${Math.min(100, (gameState.money / price) * 100)}%`;
            
            if (gameState.money >= price) {
                upgradeBtn.removeAttribute('disabled');
            } else {
                upgradeBtn.setAttribute('disabled', true);
            }
        }
    });
}

// Game loop
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - gameState.lastUpdate) / 1000; // Convert to seconds
    gameState.lastUpdate = now;
    
    // Calculate income for this tick
    const income = calculateTotalIncome() * deltaTime;
    
    // Update money
    gameState.money += income;
    gameState.totalEarned += income;
    
    // Update UI
    updateDisplays();
    updatePopulation();
    checkUnlocks();
    
    // Save game every 30 seconds
    if (Math.random() < 0.01) { // ~1% chance each tick (about every 30 seconds)
        saveGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Offline progress
function calculateOfflineProgress() {
    const now = Date.now();
    const offlineTime = (now - gameState.lastUpdate) / 1000; // in seconds
    
    if (offlineTime > 5) { // If more than 5 seconds have passed
        const offlineIncome = calculateTotalIncome() * offlineTime;
        
        gameState.money += offlineIncome;
        gameState.totalEarned += offlineIncome;
        
        showNotification(`Welcome back! You earned $${formatNumber(offlineIncome)} while away.`);
    }
    
    gameState.lastUpdate = now;
}

// Save and load functions
function saveGame() {
    localStorage.setItem('idleEmpireBuilderSave', JSON.stringify(gameState));
}

function loadGame() {
    const savedGame = localStorage.getItem('idleEmpireBuilderSave');
    
    if (savedGame) {
        const parsedSave = JSON.parse(savedGame);
        
        // Merge the saved state with the default state to ensure all properties exist
        gameState = {...gameState, ...parsedSave};
        
        // Ensure all buildings exist (in case we add new ones in updates)
        gameState.buildings.forEach((defaultBuilding, index) => {
            if (!parsedSave.buildings[index]) {
                parsedSave.buildings[index] = defaultBuilding;
            } else {
                // Ensure all building properties exist
                parsedSave.buildings[index] = {...defaultBuilding, ...parsedSave.buildings[index]};
            }
        });
        
        calculateOfflineProgress();
    }
    
    // Initialize displays
    updateDisplays();
    updatePopulation();
    renderBuildingList();
    renderCityGrid();
    
    // Check if we need to show the tutorial
    if (!gameState.tutorialCompleted) {
        tutorialOverlay.style.display = 'flex';
    } else {
        tutorialOverlay.style.display = 'none';
    }
    
    // Initialize settings
    musicToggle.checked = gameState.settings.music;
    soundToggle.checked = gameState.settings.soundEffects;
    notificationsToggle.checked = gameState.settings.notifications;
}

// Tutorial functions
function startTutorial() {
    tutorialOverlay.style.display = 'none';
    
    // Show the first tutorial step
    showTutorialStep(1);
}

function showTutorialStep(step) {
    switch (step) {
        case 1:
            // Highlight the buildings section
            showNotification("Welcome to your new city! Start by purchasing some buildings.");
            setTimeout(() => {
                showTutorialStep(2);
            }, 5000);
            break;
            
        case 2:
            // Highlight the first building
            showNotification("Click on buildings to purchase them. They generate income automatically!");
            setTimeout(() => {
                showTutorialStep(3);
            }, 5000);
            break;
            
        case 3:
            // Highlight the stats section
            showNotification("Watch your stats grow as you build your empire!");
            setTimeout(() => {
                showTutorialStep(4);
            }, 5000);
            break;
            
        case 4:
            // Final tutorial step
            showNotification("Great! Now keep building and unlock new structures for your city!");
            gameState.tutorialCompleted = true;
            saveGame();
            break;
    }
}

// Event listeners
startTutorialBtn.addEventListener('click', startTutorial);

helpBtn.addEventListener('click', () => {
    helpModal.classList.add('active');
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
});

closeHelpBtn.addEventListener('click', () => {
    helpModal.classList.remove('active');
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
});

closeTutorialBtn.addEventListener('click', () => {
    helpModal.classList.remove('active');
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
});

saveSettingsBtn.addEventListener('click', () => {
    // Save settings
    gameState.settings.music = musicToggle.checked;
    gameState.settings.soundEffects = soundToggle.checked;
    gameState.settings.notifications = notificationsToggle.checked;
    
    settingsModal.classList.remove('active');
    showNotification("Settings saved!");
    saveGame();
    
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
});

resetGameBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset your game? All progress will be lost.")) {
        localStorage.removeItem('idleEmpireBuilderSave');
        location.reload();
    }
});

// Add manual click for the city area for bonus income
cityGridContainer.addEventListener('click', (e) => {
    // Add a small bonus (0.1% of total income per second) for clicking
    const clickBonus = calculateTotalIncome() * 0.001;
    if (clickBonus > 0) {
        gameState.money += clickBonus;
        gameState.totalEarned += clickBonus;
        
        // Create income popup at click position
        createIncomePopup(e.clientX, e.clientY, clickBonus);
        
        // Play sound
        if (gameState.settings.soundEffects) {
            clickSound.play();
        }
        
        updateDisplays();
    }
});

// Handle visibility change for offline progress
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        calculateOfflineProgress();
        updateDisplays();
        renderBuildingList();
        renderCityGrid();
    } else {
        // Save game when tab becomes hidden
        saveGame();
    }
});

// In the cityGridContainer click event listener
cityGridContainer.addEventListener('click', (e) => {
    // Make the base click value at least 1 if there's no income yet
    const totalIncome = calculateTotalIncome();
    const clickBonus = totalIncome > 0 ? totalIncome * 0.001 : 1;

    gameState.money += clickBonus;
    gameState.totalEarned += clickBonus;
    
    // Create income popup at click position
    createIncomePopup(e.clientX, e.clientY, clickBonus);
    
    // Play sound
    if (gameState.settings.soundEffects) {
        clickSound.play();
    }
    
    updateDisplays();
});

// Initialize game
window.onload = () => {
    loadGame();
    gameLoop();
};

// Auto save every minute
setInterval(saveGame, 60000);