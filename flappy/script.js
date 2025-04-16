const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const UFO_SIZE = 20;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 20;
const BRICK_SPEED = 2; // Constant speed of the bricks
const BULLET_SPEED = 5; // Speed of the laser bullet
const BULLET_WIDTH = 5; // Width of the bullet
const BULLET_HEIGHT = 5; // Height of the bullet

// Game state
let ufoX = 50; // UFO's horizontal position
let ufoY = canvas.height / 2 - UFO_SIZE / 2; // UFO's vertical position
let bullets = []; // Array to store bullets
let bricks = []; // Array to store bricks
let isGameOver = false;
let isPaused = false;
let score = 0;

// Perspective state
let currentPerspective = 0; // 0: Right-to-Left, 1: Left-to-Right, 2: Bottom-to-Top, 3: Top-to-Bottom

// Controls state
let movingUp = false;
let movingDown = false;
let movingForward = false;
let movingBackward = false;

let brickSpawnInterval; // Store the interval ID for spawning bricks
let gameLoopId; // Store the ID for the game loop (requestAnimationFrame)

let lastTime = 0; // Track the time of the previous frame

const fireContainer = document.getElementById("fire-container");
const cloverContainer = document.getElementById("clover-container");
const swapBtn = document.getElementById("swapBtn");
let isFireOnLeft = true;

// Event listeners for keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowUp") movingUp = true;
  if (e.code === "ArrowDown") movingDown = true;
  if (e.code === "ArrowRight") movingForward = true;
  if (e.code === "ArrowLeft") movingBackward = true;
  if (e.code === "KeyQ") shootBullet(); // Shoot laser bullet on pressing Q
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowUp") movingUp = false;
  if (e.code === "ArrowDown") movingDown = false;
  if (e.code === "ArrowRight") movingForward = false;
  if (e.code === "ArrowLeft") movingBackward = false;
});

// Event listeners for pause/resume, restart, home, and perspective buttons
const pauseResumeBtn = document.getElementById("pauseResumeBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const changePerspectiveBtn = document.getElementById("changePerspectiveBtn");

pauseResumeBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseResumeBtn.textContent = isPaused ? "Resume" : "Pause";
  if (!isPaused) gameLoop();
});

restartBtn.addEventListener("click", () => {
  restartGame(); // Restart the game
});

homeBtn.addEventListener("click", () => {
  window.location.href = "/"; // Navigate to home
});

changePerspectiveBtn.addEventListener("click", () => {
  currentPerspective = (currentPerspective + 1) % 4; // Cycle through 0, 1, 2, 3
  restartGame(); // Restart the game with the new perspective
});

// Touch Controls
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const fireBtn = document.getElementById("fireBtn");

// Add event listeners for touch buttons
upBtn.addEventListener("mousedown", () => (movingUp = true));
upBtn.addEventListener("mouseup", () => (movingUp = false));
downBtn.addEventListener("mousedown", () => (movingDown = true));
downBtn.addEventListener("mouseup", () => (movingDown = false));
leftBtn.addEventListener("mousedown", () => (movingBackward = true));
leftBtn.addEventListener("mouseup", () => (movingBackward = false));
rightBtn.addEventListener("mousedown", () => (movingForward = true));
rightBtn.addEventListener("mouseup", () => (movingForward = false));
fireBtn.addEventListener("mousedown", shootBullet);

// Add support for touch events (for mobile devices)
upBtn.addEventListener("touchstart", () => (movingUp = true));
upBtn.addEventListener("touchend", () => (movingUp = false));
downBtn.addEventListener("touchstart", () => (movingDown = true));
downBtn.addEventListener("touchend", () => (movingDown = false));
leftBtn.addEventListener("touchstart", () => (movingBackward = true));
leftBtn.addEventListener("touchend", () => (movingBackward = false));
rightBtn.addEventListener("touchstart", () => (movingForward = true));
rightBtn.addEventListener("touchend", () => (movingForward = false));
fireBtn.addEventListener("touchstart", shootBullet);

swapBtn.addEventListener("click", () => {
  if (isFireOnLeft) {
    // Move fire button to the right
    fireContainer.style.order = "2";
    cloverContainer.style.order = "1";
    cloverContainer.style.justifyContent = "left"; // Align clover to the right
  } else {
    // Move fire button to the left
    fireContainer.style.order = "1";
    cloverContainer.style.order = "2";
    cloverContainer.style.justifyContent = "right"; // Align clover to the right
  }
  isFireOnLeft = !isFireOnLeft; // Toggle the position
});

// Function to restart the game
function restartGame() {
  // Reset game state
  bullets = [];
  bricks = [];
  isGameOver = false;
  score = 0;
  isPaused = false;
  pauseResumeBtn.textContent = "Pause";
  lastTime = 0;

  // Set UFO starting position based on perspective
  if (currentPerspective === 0) {
    // Right-to-Left
    ufoX = 50;
    ufoY = canvas.height / 2 - UFO_SIZE / 2;
  } else if (currentPerspective === 1) {
    // Left-to-Right
    ufoX = canvas.width - 50 - UFO_SIZE;
    ufoY = canvas.height / 2 - UFO_SIZE / 2;
  } else if (currentPerspective === 2) {
    // Top-to-Bottom
    ufoX = canvas.width / 2 - UFO_SIZE / 2;
    ufoY = 50;
  } else if (currentPerspective === 3) {
    // Bottom-to-Top
    ufoX = canvas.width / 2 - UFO_SIZE / 2;
    ufoY = canvas.height - 50 - UFO_SIZE;
  }

  // Clear the existing brick spawn interval
  clearInterval(brickSpawnInterval);
  // Start a new brick spawn interval
  brickSpawnInterval = setInterval(spawnBrick, 2000);
  // Stop the existing game loop
  cancelAnimationFrame(gameLoopId);
  // Restart the game loop
  gameLoop();
}

// Function to spawn bricks
function spawnBrick() {
  if (isGameOver || isPaused) return;

  let brickX, brickY;

  // Adjust brick dimensions based on perspective
  let brickWidth = BRICK_WIDTH;
  let brickHeight = BRICK_HEIGHT;
  if (currentPerspective === 2 || currentPerspective === 3) {
    // Vertical perspectives: Make bricks taller
    brickWidth = BRICK_HEIGHT; // Swap width and height
    brickHeight = BRICK_WIDTH;
  }

  if (currentPerspective === 0 || currentPerspective === 1) {
    // Horizontal perspectives
    brickY = Math.random() * (canvas.height - brickHeight);
    brickX = currentPerspective === 0 ? canvas.width : -brickWidth; // Spawn on the right (0) or left (1)
  } else {
    // Vertical perspectives
    brickX = Math.random() * (canvas.width - brickWidth);
    brickY = currentPerspective === 2 ? canvas.height : -brickHeight; // Spawn at the bottom (2) or top (3)
  }

  bricks.push({ x: brickX, y: brickY, width: brickWidth, height: brickHeight });
}

// Function to shoot a laser bullet
function shootBullet() {
  if (isGameOver || isPaused) return;

  bullets.push({
    x: ufoX + UFO_SIZE / 2 - BULLET_WIDTH / 2,
    y: ufoY + UFO_SIZE / 2 - BULLET_HEIGHT / 2,
  });
}

// Function to update game state
function update(deltaTime) {
  if (isGameOver || isPaused) return;

  // Move UFO
  if (movingUp && ufoY > 0) ufoY -= BRICK_SPEED * deltaTime * 100; // Scale movement by deltaTime
  if (movingDown && ufoY < canvas.height - UFO_SIZE)
    ufoY += BRICK_SPEED * deltaTime * 100;
  if (movingForward && ufoX < canvas.width - UFO_SIZE)
    ufoX += BRICK_SPEED * deltaTime * 100;
  if (movingBackward && ufoX > 0) ufoX -= BRICK_SPEED * deltaTime * 100;

  // Keep UFO within bounds
  if (ufoX < 0) ufoX = 0;
  if (ufoX > canvas.width - UFO_SIZE) ufoX = canvas.width - UFO_SIZE;
  if (ufoY < 0) ufoY = 0;
  if (ufoY > canvas.height - UFO_SIZE) ufoY = canvas.height - UFO_SIZE;

  // Move bricks
  for (let i = 0; i < bricks.length; i++) {
    if (currentPerspective === 0)
      bricks[i].x -= BRICK_SPEED * deltaTime * 100; // Right-to-Left
    else if (currentPerspective === 1)
      bricks[i].x += BRICK_SPEED * deltaTime * 100; // Left-to-Right
    else if (currentPerspective === 2)
      bricks[i].y -= BRICK_SPEED * deltaTime * 100; // Bottom-to-Top
    else if (currentPerspective === 3)
      bricks[i].y += BRICK_SPEED * deltaTime * 100; // Top-to-Bottom

    // Check for collision with UFO
    const brick = bricks[i]; // Get the current brick
    if (
      ufoX < brick.x + brick.width &&
      ufoX + UFO_SIZE > brick.x &&
      ufoY < brick.y + brick.height &&
      ufoY + UFO_SIZE > brick.y
    ) {
      gameOver();
    }
  }

  // Remove bricks that are off-screen
  bricks = bricks.filter((brick) => {
    if (currentPerspective === 0) return brick.x + brick.width > 0; // Right-to-Left
    if (currentPerspective === 1) return brick.x < canvas.width; // Left-to-Right
    if (currentPerspective === 2) return brick.y + brick.height > 0; // Bottom-to-Top
    if (currentPerspective === 3) return brick.y < canvas.height; // Top-to-Bottom
  });

  // Move bullets
  for (let i = 0; i < bullets.length; i++) {
    if (currentPerspective === 0) {
      // Right-to-Left Perspective
      bullets[i].x += BULLET_SPEED * deltaTime * 100; // Bullets move left to right
    } else if (currentPerspective === 1) {
      // Left-to-Right Perspective
      bullets[i].x -= BULLET_SPEED * deltaTime * 100; // Bullets move right to left
    } else if (currentPerspective === 2) {
      // Bottom-to-Top Perspective
      bullets[i].y += BULLET_SPEED * deltaTime * 100; // Bullets move top to bottom
    } else if (currentPerspective === 3) {
      // Top-to-Bottom Perspective
      bullets[i].y -= BULLET_SPEED * deltaTime * 100; // Bullets move bottom to top
    }

    // Check for collision with bricks
    for (let j = 0; j < bricks.length; j++) {
      const brick = bricks[j]; // Get the current brick
      if (
        bullets[i].x < brick.x + brick.width &&
        bullets[i].x + BULLET_WIDTH > brick.x &&
        bullets[i].y < brick.y + brick.height &&
        bullets[i].y + BULLET_HEIGHT > brick.y
      ) {
        // Destroy the brick and the bullet
        bricks.splice(j, 1); // Remove the brick
        bullets.splice(i, 1); // Remove the bullet
        score += 10; // Increase score for destroying a brick
        break;
      }
    }
  }

  // Remove bullets that are off-screen
  bullets = bullets.filter((bullet) => {
    if (currentPerspective === 0) return bullet.x > 0; // Right-to-Left
    if (currentPerspective === 1) return bullet.x < canvas.width; // Left-to-Right
    if (currentPerspective === 2) return bullet.y > 0; // Bottom-to-Top
    if (currentPerspective === 3) return bullet.y < canvas.height; // Top-to-Bottom
  });

  // Update score
  score += deltaTime * 10;
}

// Function to draw bricks
function drawBricks() {
  ctx.fillStyle = "#f00"; // Red bricks
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
}

// Function to draw the game
function draw() {
  if (isGameOver || isPaused) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw UFO
  ctx.fillStyle = "#fff";
  ctx.fillRect(ufoX, ufoY, UFO_SIZE, UFO_SIZE);

  // Draw bricks
  drawBricks();

  // Draw bullets
  ctx.fillStyle = "#0f0"; // Green bullets
  for (let i = 0; i < bullets.length; i++) {
    ctx.fillRect(bullets[i].x, bullets[i].y, BULLET_WIDTH, BULLET_HEIGHT);
  }

  // Draw score
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score.toFixed(0)}`, 10, 20); // Round to 0 decimal places
}

// Game over function
function gameOver() {
  isGameOver = true;
  const gameOverMessage = document.getElementById("game-over-message");
  const finalScore = document.getElementById("final-score");
  finalScore.textContent = score.toFixed(0);
  gameOverMessage.style.visibility = "visible"; // Show Game Over message
}

// Game loop
function gameLoop(timestamp = 0) {
  if (isGameOver || isPaused) return;

  // Handle the first frame
  if (!lastTime) {
    lastTime = timestamp; // Initialize lastTime to the current timestamp
  }

  // Calculate delta time (in seconds)
  const deltaTime = (timestamp - lastTime) / 1000; // Convert milliseconds to seconds
  lastTime = timestamp;
  // Update game state with deltaTime
  update(deltaTime);
  // Draw the game
  draw();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const aspectRatio = 480 / 320; // 3:2 aspect ratio

  if (window.innerWidth < 768) {
    // For mobile: Set canvas width to 90% of screen width
    canvas.width = window.innerWidth * 0.9;
    canvas.height = canvas.width / aspectRatio; // Maintain aspect ratio
  } else {
    // For desktop: Keep the original size
    canvas.width = 480;
    canvas.height = 320;
  }
}

// Call resizeCanvas on page load and window resize
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// Spawn bricks every 2 seconds
brickSpawnInterval = setInterval(spawnBrick, 2000);

// Start the game
gameLoop();
