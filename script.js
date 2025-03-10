// Game state
let particles = [];
let particleCount = 0;
let mass = 0;
let planets = 0;

// Upgrade levels and costs
let gravityLevel = 1;
let particleSizeLevel = 1;
let autoClickerLevel = 0;
const baseCosts = {
    gravity: 10,
    size: 20,
    auto: 50
};

// Possible particle symbols
const symbols = ['✦', '✧', '❉', '❊', '✺', '✹', '✸', '✷'];
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c0eb', '#d9b8f1'];

// DOM elements
const gameArea = document.getElementById('game-area');
const particleCountEl = document.getElementById('particle-count');
const massCountEl = document.getElementById('mass-count');
const planetCountEl = document.getElementById('planet-count');
const gravityCostEl = document.getElementById('gravity-cost');
const sizeCostEl = document.getElementById('size-cost');
const autoCostEl = document.getElementById('auto-cost');

// Click handler
gameArea.addEventListener('click', (e) => {
    createParticle(e.clientX - gameArea.offsetLeft, e.clientY - gameArea.offsetTop);
});

// Create new particle
function createParticle(x, y) {
    particleCount++;
    const size = 10 + particleSizeLevel * 2;
    
    const particle = {
        x: x,
        y: y,
        size: size,
        mass: 1,
        element: document.createElement('div'),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: 0,
        dy: 0
    };

    particle.element.className = 'particle';
    particle.element.style.width = `${size}px`;
    particle.element.style.height = `${size}px`;
    particle.element.style.left = `${x}px`;
    particle.element.style.top = `${y}px`;
    particle.element.style.background = particle.color;
    particle.element.innerHTML = particle.symbol;
    
    gameArea.appendChild(particle.element);
    particles.push(particle);
    
    updateStats();
}

// Game loop
function gameLoop() {
    const centerX = gameArea.clientWidth / 2;
    const centerY = gameArea.clientHeight / 2;

    particles.forEach((particle, index) => {
        // Calculate attraction to center
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const force = (gravityLevel * 0.1) / Math.max(1, distance);
            particle.dx += (dx / distance) * force;
            particle.dy += (dy / distance) * force;
            
            // Update position
            particle.x += particle.dx;
            particle.y += particle.dy;
            
            // Update DOM
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
        } else {
            // Particle reached center
            mass += particle.mass;
            gameArea.removeChild(particle.element);
            particles.splice(index, 1);
            
            // Create planet if enough mass
            if (mass >= 100) {
                planets++;
                mass -= 100;
                createPlanetEffect();
            }
        }
    });

    // Check for particle collisions
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < p1.size) {
                // Merge particles
                p1.mass += p2.mass;
                p1.size += 2;
                p1.element.style.width = `${p1.size}px`;
                p1.element.style.height = `${p1.size}px`;
                gameArea.removeChild(p2.element);
                particles.splice(j, 1);
                j--;
            }
        }
    }

    updateStats();
    requestAnimationFrame(gameLoop);
}

// Visual effect for new planet
function createPlanetEffect() {
    const planet = document.createElement('div');
    planet.className = 'particle';
    planet.style.width = '50px';
    planet.style.height = '50px';
    planet.style.background = '#ff6b6b';
    planet.style.left = '50%';
    planet.style.top = '50%';
    planet.style.transform = 'translate(-50%, -50%)';
    planet.style.opacity = '1';
    
    gameArea.appendChild(planet);
    
    setTimeout(() => {
        planet.style.transition = 'all 1s';
        planet.style.opacity = '0';
        planet.style.transform = 'translate(-50%, -50%) scale(2)';
        setTimeout(() => gameArea.removeChild(planet), 1000);
    }, 100);
}

// Update UI stats
function updateStats() {
    particleCountEl.textContent = particleCount;
    massCountEl.textContent = Math.floor(mass);
    planetCountEl.textContent = planets;
    
    // Update upgrade costs
    gravityCostEl.textContent = Math.floor(baseCosts.gravity * Math.pow(1.5, gravityLevel));
    sizeCostEl.textContent = Math.floor(baseCosts.size * Math.pow(1.5, particleSizeLevel));
    autoCostEl.textContent = Math.floor(baseCosts.auto * Math.pow(1.5, autoClickerLevel));
    
    document.getElementById('gravity-upgrade').disabled = mass < baseCosts.gravity * Math.pow(1.5, gravityLevel);
    document.getElementById('size-upgrade').disabled = mass < baseCosts.size * Math.pow(1.5, particleSizeLevel);
    document.getElementById('auto-upgrade').disabled = mass < baseCosts.auto * Math.pow(1.5, autoClickerLevel);
}

// Upgrade functions
function buyGravity() {
    const cost = Math.floor(baseCosts.gravity * Math.pow(1.5, gravityLevel));
    if (mass >= cost) {
        mass -= cost;
        gravityLevel++;
    }
}

function buyParticleSize() {
    const cost = Math.floor(baseCosts.size * Math.pow(1.5, particleSizeLevel));
    if (mass >= cost) {
        mass -= cost;
        particleSizeLevel++;
    }
}

function buyAutoClicker() {
    const cost = Math.floor(baseCosts.auto * Math.pow(1.5, autoClickerLevel));
    if (mass >= cost) {
        mass -= cost;
        autoClickerLevel++;
        
        // Start auto-clicker if first purchase
        if (autoClickerLevel === 1) {
            setInterval(() => {
                for (let i = 0; i < autoClickerLevel; i++) {
                    createParticle(
                        Math.random() * gameArea.clientWidth,
                        Math.random() * gameArea.clientHeight
                    );
                }
            }, 1000);
        }
    }
}

// Start the game
gameLoop();