const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let gameState = {
    mass: 0,
    clickPower: 1,
    autoParticles: 0,
    mergeBonus: 1,
    clickUpgradeCost: 50,
    autoUpgradeCost: 100,
    mergeUpgradeCost: 200
};

let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.speed = 2;
        this.angle = Math.atan2(centerY - y, centerX - x);
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Check if particle reached center
        if (Math.abs(this.x - centerX) < 5 && Math.abs(this.y - centerY) < 5) {
            gameState.mass += gameState.clickPower * gameState.mergeBonus;
            return true; // Particle should be removed
        }
        return false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

// UI Elements
const massDisplay = document.getElementById('mass');
const ppsDisplay = document.getElementById('pps');
const clickUpgrade = document.getElementById('clickUpgrade');
const autoUpgrade = document.getElementById('autoUpgrade');
const mergeUpgrade = document.getElementById('mergeUpgrade');

// Event Listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    particles.push(new Particle(x, y));
});

clickUpgrade.addEventListener('click', () => {
    if (gameState.mass >= gameState.clickUpgradeCost) {
        gameState.mass -= gameState.clickUpgradeCost;
        gameState.clickPower += 1;
        gameState.clickUpgradeCost = Math.floor(gameState.clickUpgradeCost * 1.5);
        updateUI();
    }
});

autoUpgrade.addEventListener('click', () => {
    if (gameState.mass >= gameState.autoUpgradeCost) {
        gameState.mass -= gameState.autoUpgradeCost;
        gameState.autoParticles += 1;
        gameState.autoUpgradeCost = Math.floor(gameState.autoUpgradeCost * 1.5);
        updateUI();
    }
});

mergeUpgrade.addEventListener('click', () => {
    if (gameState.mass >= gameState.mergeUpgradeCost) {
        gameState.mass -= gameState.mergeUpgradeCost;
        gameState.mergeBonus += 0.5;
        gameState.mergeUpgradeCost = Math.floor(gameState.mergeUpgradeCost * 1.5);
        updateUI();
    }
});

function updateUI() {
    massDisplay.textContent = Math.floor(gameState.mass);
    ppsDisplay.textContent = gameState.autoParticles;
    clickUpgrade.textContent = `Increase Click Power (Cost: ${gameState.clickUpgradeCost})`;
    autoUpgrade.textContent = `Auto Particle Generator (Cost: ${gameState.autoUpgradeCost})`;
    mergeUpgrade.textContent = `Better Particle Merging (Cost: ${gameState.mergeUpgradeCost})`;

    clickUpgrade.disabled = gameState.mass < gameState.clickUpgradeCost;
    autoUpgrade.disabled = gameState.mass < gameState.autoUpgradeCost;
    mergeUpgrade.disabled = gameState.mass < gameState.mergeUpgradeCost;
}

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw planet
    const planetSize = Math.min(100, Math.log(gameState.mass + 1) * 10);
    ctx.beginPath();
    ctx.arc(centerX, centerY, planetSize, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();

    // Update and draw particles
    particles = particles.filter(particle => !particle.update());
    particles.forEach(particle => particle.draw());

    // Auto particle generation
    if (gameState.autoParticles > 0 && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(canvas.width, canvas.height) / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        particles.push(new Particle(x, y));
    }

    updateUI();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();