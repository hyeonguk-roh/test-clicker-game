// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GRAVITY = 0.5;
const MARIO_SPEED = 3;
const MARIO_JUMP_FORCE = 12;
const BARREL_SPEED = 2;
const BARREL_SPAWN_RATE = 2000; // Milliseconds

// Game state
let mario = {
    x: 50,
    y: GAME_HEIGHT - 40,
    width: 30,
    height: 40,
    dx: 0,
    dy: 0,
    jumping: false,
    onLadder: false,
    climbing: false
};

let platforms = [];
let ladders = [];
let barrels = [];
let gameOver = false;
let gameWon = false;

// DOM elements
const gameArea = document.getElementById('game-area');
const marioElement = document.getElementById('mario');
const gameOverElement = document.getElementById('game-over');
const winElement = document.getElementById('win');

// Level setup (platforms and ladders)
function setupLevel() {
    // Platforms (slanted to mimic the original game)
    platforms.push({ x: 0, y: GAME_HEIGHT - 10, width: GAME_WIDTH, height: 10 }); // Ground
    platforms.push({ x: 0, y: GAME_HEIGHT - 100, width: GAME_WIDTH - 100, height: 10 }); // Second platform
    platforms.push({ x: 100, y: GAME_HEIGHT - 200, width: GAME_WIDTH - 200, height: 10 }); // Third platform
    platforms.push({ x: 0, y: GAME_HEIGHT - 300, width: GAME_WIDTH - 300, height: 10 }); // Fourth platform
    platforms.push({ x: 200, y: GAME_HEIGHT - 400, width: GAME_WIDTH - 400, height: 10 }); // Fifth platform
    platforms.push({ x: 0, y: GAME_HEIGHT - 500, width: GAME_WIDTH - 500, height: 10 }); // Top platform

    // Ladders
    ladders.push({ x: 150, y: GAME_HEIGHT - 100, width: 20, height: 90 }); // Ground to second
    ladders.push({ x: 600, y: GAME_HEIGHT - 200, width: 20, height: 90 }); // Second to third
    ladders.push({ x: 150, y: GAME_HEIGHT - 300, width: 20, height: 90 }); // Third to fourth
    ladders.push({ x: 600, y: GAME_HEIGHT - 400, width: 20, height: 90 }); // Fourth to fifth
    ladders.push({ x: 150, y: GAME_HEIGHT - 500, width: 20, height: 90 }); // Fifth to top

    // Render platforms
    platforms.forEach(platform => {
        const platformElement = document.createElement('div');
        platformElement.className = 'platform';
        platformElement.style.left = `${platform.x}px`;
        platformElement.style.bottom = `${platform.y}px`;
        platformElement.style.width = `${platform.width}px`;
        platformElement.style.height = `${platform.height}px`;
        gameArea.appendChild(platformElement);
    });

    // Render ladders
    ladders.forEach(ladder => {
        const ladderElement = document.createElement('div');
        ladderElement.className = 'ladder';
        ladderElement.style.left = `${ladder.x}px`;
        ladderElement.style.bottom = `${ladder.y}px`;
        ladderElement.style.width = `${ladder.width}px`;
        ladderElement.style.height = `${ladder.height}px`;
        gameArea.appendChild(ladderElement);
    });
}

// Input handling
document.addEventListener('keydown', (e) => {
    if (gameOver || gameWon) {
        if (e.key === 'r' || e.key === 'R') {
            resetGame();
        }
        return;
    }

    if (e.key === 'ArrowLeft') {
        mario.dx = -MARIO_SPEED;
    } else if (e.key === 'ArrowRight') {
        mario.dx = MARIO_SPEED;
    } else if (e.key === ' ') {
        if (!mario.jumping && !mario.onLadder) {
            mario.dy = MARIO_JUMP_FORCE;
            mario.jumping = true;
        }
    } else if (e.key === 'ArrowUp' && mario.onLadder) {
        mario.climbing = true;
        mario.dy = MARIO_SPEED;
    } else if (e.key === 'ArrowDown' && mario.onLadder) {
        mario.climbing = true;
        mario.dy = -MARIO_SPEED;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        mario.dx = 0;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        mario.climbing = false;
        mario.dy = 0;
    }
});

// Spawn barrels
function spawnBarrel() {
    if (gameOver || gameWon) return;

    const barrel = {
        x: 110,
        y: GAME_HEIGHT - 500 - 20,
        width: 20,
        height: 20,
        dx: BARREL_SPEED,
        platformIndex: platforms.length - 1
    };

    const barrelElement = document.createElement('div');
    barrelElement.className = 'barrel';
    barrelElement.style.left = `${barrel.x}px`;
    barrelElement.style.bottom = `${barrel.y}px`;
    gameArea.appendChild(barrelElement);
    barrel.element = barrelElement;

    barrels.push(barrel);
}

setInterval(spawnBarrel, BARREL_SPAWN_RATE);

// Collision detection
function collides(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Game loop
function gameLoop() {
    if (gameOver || gameWon) return;

    // Update Mario
    mario.x += mario.dx;
    mario.y += mario.dy;

    // Apply gravity
    if (!mario.onLadder) {
        mario.dy -= GRAVITY;
    }

    // Keep Mario within bounds
    if (mario.x < 0) mario.x = 0;
    if (mario.x + mario.width > GAME_WIDTH) mario.x = GAME_WIDTH - mario.width;

    // Check platform collisions
    let onPlatform = false;
    platforms.forEach(platform => {
        if (mario.dy <= 0 && // Falling or stationary
            mario.x + mario.width > platform.x &&
            mario.x < platform.x + platform.width &&
            mario.y >= platform.y &&
            mario.y <= platform.y + platform.height + 10) {
            mario.y = platform.y + platform.height;
            mario.dy = 0;
            mario.jumping = false;
            onPlatform = true;
        }
    });

    if (!onPlatform && !mario.onLadder) {
        mario.jumping = true;
    }

    // Check ladder collisions
    mario.onLadder = false;
    ladders.forEach(ladder => {
        if (collides(mario, {
            x: ladder.x,
            y: GAME_HEIGHT - ladder.y - ladder.height,
            width: ladder.width,
            height: ladder.height
        })) {
            mario.onLadder = true;
            if (!mario.climbing) mario.dy = 0;
        }
    });

    // Update barrels
    barrels.forEach((barrel, index) => {
        barrel.x += barrel.dx;

        // Barrel falls off platform
        let onPlatform = false;
        const currentPlatform = platforms[barrel.platformIndex];
        if (barrel.x + barrel.width > currentPlatform.x &&
            barrel.x < currentPlatform.x + currentPlatform.width &&
            barrel.y >= currentPlatform.y &&
            barrel.y <= currentPlatform.y + 10) {
            barrel.y = currentPlatform.y + 10;
            onPlatform = true;
        }

        if (!onPlatform) {
            barrel.y -= GRAVITY * 2;
            barrel.platformIndex = Math.max(0, barrel.platformIndex - 1);
        }

        // Remove barrel if it falls off the screen
        if (barrel.y < 0) {
            gameArea.removeChild(barrel.element);
            barrels.splice(index, 1);
            return;
        }

        barrel.element.style.left = `${barrel.x}px`;
        barrel.element.style.bottom = `${barrel.y}px`;

        // Check collision with Mario
        if (collides(mario, barrel)) {
            gameOver = true;
            gameOverElement.classList.remove('hidden');
        }
    });

    // Check win condition (Mario reaches Pauline)
    const pauline = {
        x: GAME_WIDTH - 70,
        y: GAME_HEIGHT - 500 - 30,
        width: 20,
        height: 30
    };
    if (collides(mario, pauline)) {
        gameWon = true;
        winElement.classList.remove('hidden');
    }

    // Update Mario's position
    marioElement.style.left = `${mario.x}px`;
    marioElement.style.bottom = `${mario.y}px`;

    requestAnimationFrame(gameLoop);
}

// Reset game
function resetGame() {
    gameOver = false;
    gameWon = false;
    gameOverElement.classList.add('hidden');
    winElement.classList.add('hidden');

    mario.x = 50;
    mario.y = GAME_HEIGHT - 40;
    mario.dx = 0;
    mario.dy = 0;
    mario.jumping = false;
    mario.onLadder = false;
    mario.climbing = false;

    barrels.forEach(barrel => gameArea.removeChild(barrel.element));
    barrels = [];

    gameLoop();
}

// Start the game
setupLevel();
gameLoop();