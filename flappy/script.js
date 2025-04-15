const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const UFO_SIZE = 20;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 20;
const BRICK_SPEED = 2; // Constant speed of the board
const UFO_BASE_SPEED = BRICK_SPEED / 2; // UFO moves half the board's speed by default
const UFO_ACCELERATION = BRICK_SPEED; // UFO matches board's speed when forward key is pressed
const UFO_BACKWARD_SPEED = -BRICK_SPEED; // UFO moves backward at board speed when backward key is pressed
const BULLET_SPEED = 5; // Speed of the laser bullet
const BULLET_WIDTH = 5; // Width of the bullet
const BULLET_HEIGHT = 5; // Height of the bullet

// Game state
let ufoX = 50; // UFO's horizontal position
let ufoY = canvas.height / 2 - UFO_SIZE / 2; // UFO's vertical position
let ufoSpeed = UFO_BASE_SPEED; // UFO's default speed
let bricks = []; // Array to store bricks
let bullets = []; // Array to store bullets
let isGameOver = false;
let isPaused = false;
let score = 0;

// Controls state
let movingUp = false;
let movingDown = false;
let movingForward = false;
let movingBackward = false;

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

// Event listeners for pause/resume, restart, and home buttons
const pauseResumeBtn = document.getElementById("pauseResumeBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

pauseResumeBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseResumeBtn.textContent = isPaused ? "Resume" : "Pause";
  if (!isPaused) gameLoop();
});

restartBtn.addEventListener("click", () => {
  document.location.reload(); // Reload the game
});

homeBtn.addEventListener("click", () => {
  window.location.href = "/"; // Navigate to home
});

// Function to spawn bricks
function spawnBrick() {
  if (isGameOver || isPaused) return;

  const brickY = Math.random() * (canvas.height - BRICK_HEIGHT);
  bricks.push({ x: canvas.width, y: brickY });
}

// Function to shoot a laser bullet
function shootBullet() {
  if (isGameOver || isPaused) return;

  // Create a new bullet at the UFO's position
  bullets.push({
    x: ufoX + UFO_SIZE, // Start at the right edge of the UFO
    y: ufoY + UFO_SIZE / 2 - BULLET_HEIGHT / 2, // Centered vertically with the UFO
  });
}

// Function to update game state
function update() {
  if (isGameOver || isPaused) return;

  // Adjust UFO speed based on controls
  if (movingForward) {
    ufoSpeed = BRICK_SPEED; // Match board speed when forward key is pressed
  } else if (movingBackward) {
    ufoSpeed = UFO_BACKWARD_SPEED; // Move backward at board speed
  } else {
    ufoSpeed = UFO_BASE_SPEED; // Default speed (half the board speed)
  }

  // Move UFO
  if (movingUp && ufoY > 0) ufoY -= BRICK_SPEED; // Move up
  if (movingDown && ufoY < canvas.height - UFO_SIZE) ufoY += BRICK_SPEED; // Move down
  ufoX += ufoSpeed; // Move horizontally based on calculated speed

  // Keep UFO within bounds
  if (ufoX < 0) ufoX = 0;
  if (ufoX > canvas.width - UFO_SIZE) ufoX = canvas.width - UFO_SIZE;

  // Move bricks
  for (let i = 0; i < bricks.length; i++) {
    bricks[i].x -= BRICK_SPEED;

    // Check for collision with UFO
    if (
      ufoX < bricks[i].x + BRICK_WIDTH &&
      ufoX + UFO_SIZE > bricks[i].x &&
      ufoY < bricks[i].y + BRICK_HEIGHT &&
      ufoY + UFO_SIZE > bricks[i].y
    ) {
      gameOver();
    }
  }

  // Remove bricks that are off-screen
  bricks = bricks.filter((brick) => brick.x + BRICK_WIDTH > 0);

  // Move bullets
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].x += BULLET_SPEED;

    // Check for collision with bricks
    for (let j = 0; j < bricks.length; j++) {
      if (
        bullets[i].x < bricks[j].x + BRICK_WIDTH &&
        bullets[i].x + BULLET_WIDTH > bricks[j].x &&
        bullets[i].y < bricks[j].y + BRICK_HEIGHT &&
        bullets[i].y + BULLET_HEIGHT > bricks[j].y
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
  bullets = bullets.filter((bullet) => bullet.x < canvas.width);

  // Update score
  score++;
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
  ctx.fillStyle = "#f00";
  for (let i = 0; i < bricks.length; i++) {
    ctx.fillRect(bricks[i].x, bricks[i].y, BRICK_WIDTH, BRICK_HEIGHT);
  }

  // Draw bullets
  ctx.fillStyle = "#0f0"; // Green bullets
  for (let i = 0; i < bullets.length; i++) {
    ctx.fillRect(bullets[i].x, bullets[i].y, BULLET_WIDTH, BULLET_HEIGHT);
  }

  // Draw score
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
}

// Game over function
function gameOver() {
  isGameOver = true;
  const gameOverMessage = document.getElementById("game-over-message");
  const finalScore = document.getElementById("final-score");
  finalScore.textContent = score;
  gameOverMessage.style.visibility = "visible"; // Show Game Over message
}

// Game loop
function gameLoop() {
  if (isGameOver || isPaused) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
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
setInterval(spawnBrick, 2000);

// Start the game
gameLoop();
