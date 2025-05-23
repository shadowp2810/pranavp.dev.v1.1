const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 3.5;
let ballDY = 3.5;
const ballRadius = 10;
const halfBallRadius = ballRadius / 2;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 95;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleDX = 7;

// Brick properties
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Bricks array
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, indestructible: false }; // Add indestructible property
  }
}

// Game state
let isPaused = false;
let isGameOver = false;
let timer = 0; // Timer in milliseconds
let score = 0; // Player's score
let timerInterval;

// Key controls
let rightPressed = false;
let leftPressed = false;

// Fixed time step variables
const fps = 60; // Target frame rate (60Hz)
const frameDuration = 1000 / fps; // Duration of each frame in milliseconds (16.67ms)
let lastFrameTime = 0; // Time of the last frame
let accumulatedTime = 0; // Accumulated time since the last game update

// Touch controls
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// Cross-device event handling for left button
leftBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
  leftPressed = true;
});
leftBtn.addEventListener("mouseup", (e) => {
  e.preventDefault();
  leftPressed = false;
});
leftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  leftPressed = true;
});
leftBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  leftPressed = false;
});

// Cross-device event handling for right button
rightBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
  rightPressed = true;
});
rightBtn.addEventListener("mouseup", (e) => {
  e.preventDefault();
  rightPressed = false;
});
rightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  rightPressed = true;
});
rightBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  rightPressed = false;
});

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// Randomly make one brick indestructible
function setIndestructibleBrick() {
  // Reset all bricks to normal
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].indestructible = false;
    }
  }

  // Randomly select a brick
  const randomColumn = Math.floor(Math.random() * brickColumnCount);
  const randomRow = Math.floor(Math.random() * brickRowCount);
  bricks[randomColumn][randomRow].indestructible = true;

  // Repeat this process every 3 seconds
  setTimeout(setIndestructibleBrick, 5000);
}

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// Draw bricks
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);

        // Change color if the brick is indestructible
        ctx.fillStyle = b.indestructible ? "#ff0000" : "#fff"; // Red for indestructible, white for normal
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// Collision Detection
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        // Brick boundaries
        const brickX = b.x;
        const brickY = b.y;
        const brickRight = brickX + brickWidth;
        const brickBottom = brickY + brickHeight;

        // Ball's next position
        const ballNextX = ballX + ballDX;
        const ballNextY = ballY + ballDY;

        // Check if the ball is colliding with the brick
        if (
          ballNextX + ballRadius > brickX && // Ball's right edge is past the brick's left edge
          ballNextX - ballRadius < brickRight && // Ball's left edge is before the brick's right edge
          ballNextY + ballRadius > brickY && // Ball's bottom edge is past the brick's top edge
          ballNextY - ballRadius < brickBottom // Ball's top edge is before the brick's bottom edge
        ) {
          if (b.indestructible) {
            // Handle indestructible brick collision
            const ballBottom = ballY + ballRadius;
            const ballTop = ballY - ballRadius;
            const ballRight = ballX + ballRadius;
            const ballLeft = ballX - ballRadius;

            // Determine the side of the collision
            const isTopCollision = ballBottom > brickY && ballY < brickY;
            const isBottomCollision =
              ballTop < brickBottom && ballY > brickBottom;
            const isLeftCollision = ballRight > brickX && ballX < brickX;
            const isRightCollision =
              ballLeft < brickRight && ballX > brickRight;

            // Reverse direction based on the side of the collision
            if (isTopCollision) {
              ballDY = -Math.abs(ballDY); // Reverse vertical direction (top collision)
              ballY = brickY - ballRadius; // Prevent overlap
            } else if (isBottomCollision) {
              ballDY = Math.abs(ballDY); // Reverse vertical direction (bottom collision)
              ballY = brickBottom + ballRadius; // Prevent overlap
            } else if (isLeftCollision) {
              ballDX = -Math.abs(ballDX); // Reverse horizontal direction (left collision)
              ballX = brickX - ballRadius; // Prevent overlap
            } else if (isRightCollision) {
              ballDX = Math.abs(ballDX); // Reverse horizontal direction (right collision)
              ballX = brickRight + ballRadius; // Prevent overlap
            }
          } else {
            // Handle normal brick collision
            ballDY = -ballDY; // Reverse vertical direction
            b.status = 0; // Mark the brick as broken
            score++; // Increase score
            updateScore();

            // Regenerate the brick after 2 seconds
            setTimeout(() => {
              b.status = 1; // Make the brick visible again
            }, 3000);
          }
        }
      }
    }
  }
}

// Game loop
function gameLoop(timestamp = 0) {
  if (isPaused || isGameOver) return;

  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  accumulatedTime += deltaTime;

  while (accumulatedTime >= frameDuration) {
    updateGameLogic(); // Update game logic at a fixed interval
    accumulatedTime -= frameDuration;
  }

  render();
  requestAnimationFrame(gameLoop);
}

function updateGameLogic() {
  // Ball movement
  if (
    ballX + ballDX > canvas.width - ballRadius ||
    ballX + ballDX < ballRadius
  ) {
    ballDX = -ballDX;
  }
  if (ballY + ballDY < ballRadius) {
    ballDY = -ballDY;
  } else if (ballY + ballDY > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      ballDY = -ballDY;
    } else {
      endGame("Game Over!");
    }
  }

  ballX += ballDX;
  ballY += ballDY;

  // Paddle movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += paddleDX;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleDX;
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();
}

// End game
function endGame(message) {
  isGameOver = true;
  clearInterval(timerInterval);
  const messageElement = document.getElementById("message");
  messageElement.textContent = `${message} Time: ${timer} ms, Score: ${score}`;
  messageElement.style.visibility = "visible"; // Make the message visible
}

// Update score
function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

// Update timer
function updateTimer() {
  document.getElementById("timer").textContent = `Time: ${timer} ms`;
}

// Start the timer
function startTimer() {
  timerInterval = setInterval(() => {
    if (!isPaused && !isGameOver) {
      timer += 10; // Increment timer by 10 ms
      updateTimer();
    }
  }, 10); // Update every 10 ms
}

// Pause/Resume button
document.getElementById("pauseResumeBtn").addEventListener("click", () => {
  isPaused = !isPaused;

  document.getElementById("pauseResumeBtn").textContent = isPaused
    ? "Resume"
    : "Pause";

  if (!isPaused) requestAnimationFrame(gameLoop);
});

// Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
  document.location.reload();
});

// Home button
document.getElementById("homeBtn").addEventListener("click", () => {
  window.location.href = "/";
});

// Initialize the game
function initializeGame() {
  setIndestructibleBrick();
  startTimer();
  requestAnimationFrame(gameLoop);
}

// Start the game
initializeGame();
