const gameContainer = document.getElementById("game-container");
const mario = document.getElementById("mario");
const donkeyKong = document.getElementById("donkey-kong");
const pauline = document.getElementById("pauline");
const barrelsDiv = document.getElementById("barrels");
const scoreElement = document.getElementById("score-value");
const gameOverElement = document.getElementById("game-over");

let marioPos = { x: 50, y: 10 };
let velocityY = 0;
let isJumping = false;
let score = 0;
let gameOver = false;
let barrels = [];

const gravity = 0.5;
const jumpForce = 10;
const moveSpeed = 5;
const barrelSpeed = 2;
const barrelSpawnRate = 2000; // Spawn a barrel every 2 seconds

// Mario movement
document.addEventListener("keydown", (e) => {
    if (gameOver && e.key === "r") {
        resetGame();
        return;
    }
    if (gameOver) return;

    if (e.key === "ArrowLeft") {
        marioPos.x = Math.max(0, marioPos.x - moveSpeed);
    } else if (e.key === "ArrowRight") {
        marioPos.x = Math.min(770, marioPos.x + moveSpeed);
    } else if (e.key === "ArrowUp" && !isJumping) {
        velocityY = jumpForce;
        isJumping = true;
    }
});

// Apply gravity and update Mario's position
function updateMario() {
    velocityY -= gravity;
    marioPos.y += velocityY;

    // Check for platform collision
    const platforms = document.querySelectorAll(".platform");
    let onPlatform = false;

    platforms.forEach((platform) => {
        const platformRect = platform.getBoundingClientRect();
        const marioRect = mario.getBoundingClientRect();
        const platformY = parseInt(platform.style.bottom);

        if (
            marioPos.y <= platformY + 10 &&
            marioPos.y >= platformY - 40 &&
            marioPos.x + 30 > platformRect.left - gameContainer.getBoundingClientRect().left &&
            marioPos.x < platformRect.right - gameContainer.getBoundingClientRect().left &&
            velocityY <= 0
        ) {
            marioPos.y = platformY + 10;
            velocityY = 0;
            isJumping = false;
            onPlatform = true;
        }
    });

    if (!onPlatform && marioPos.y <= 10) {
        marioPos.y = 10;
        velocityY = 0;
        isJumping = false;
    }

    mario.style.left = marioPos.x + "px";
    mario.style.bottom = marioPos.y + "px";
}

// Spawn barrels
function spawnBarrel() {
    if (gameOver) return;

    const barrel = document.createElement("div");
    barrel.classList.add("barrel");
    barrel.style.left = donkeyKong.offsetLeft + 30 + "px";
    barrel.style.top = donkeyKong.offsetTop + 40 + "px";
    barrelsDiv.appendChild(barrel);

    barrels.push({
        element: barrel,
        x: donkeyKong.offsetLeft + 30,
        y: donkeyKong.offsetTop + 40,
        velocityX: barrelSpeed,
    });
}

// Update barrels
function updateBarrels() {
    barrels.forEach((barrel, index) => {
        barrel.x += barrel.velocityX;
        barrel.y -= 2; // Simulate rolling down slanted platforms

        barrel.element.style.left = barrel.x + "px";
        barrel.element.style.top = barrel.y + "px";

        // Remove barrels that go off-screen
        if (barrel.y < 0 || barrel.x > 800) {
            barrel.element.remove();
            barrels.splice(index, 1);
            score += 10;
            scoreElement.textContent = score;
        }

        // Check collision with Mario
        const marioRect = mario.getBoundingClientRect();
        const barrelRect = barrel.element.getBoundingClientRect();

        if (
            marioRect.left < barrelRect.right &&
            marioRect.right > barrelRect.left &&
            marioRect.top < barrelRect.bottom &&
            marioRect.bottom > barrelRect.top
        ) {
            gameOver = true;
            gameOverElement.style.display = "block";
        }
    });
}

// Check win condition (Mario reaches Pauline)
function checkWinCondition() {
    const marioRect = mario.getBoundingClientRect();
    const paulineRect = pauline.getBoundingClientRect();

    if (
        marioRect.left < paulineRect.right &&
        marioRect.right > paulineRect.left &&
        marioRect.top < paulineRect.bottom &&
        marioRect.bottom > paulineRect.top
    ) {
        gameOver = true;
        gameOverElement.textContent = "You Win! Press R to Restart";
        gameOverElement.style.display = "block";
    }
}

// Reset the game
function resetGame() {
    marioPos = { x: 50, y: 10 };
    velocityY = 0;
    isJumping = false;
    score = 0;
    gameOver = false;
    scoreElement.textContent = score;
    gameOverElement.style.display = "none";
    barrels.forEach((barrel) => barrel.element.remove());
    barrels = [];
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        updateMario();
        updateBarrels();
        checkWinCondition();
    }
    requestAnimationFrame(gameLoop);
}

// Start spawning barrels
setInterval(spawnBarrel, barrelSpawnRate);

// Start the game loop
gameLoop();