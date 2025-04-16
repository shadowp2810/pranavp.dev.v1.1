const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Normalize speeds based on canvas size
const ballSpeedFactor = 0.005; // Ball speed as a fraction of canvas width
const paddleSpeedFactor = 0.01; // Paddle speed as a fraction of canvas width

// Ball properties
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = canvas.width * ballSpeedFactor; // Ball horizontal speed
let ballDY = canvas.height * ballSpeedFactor; // Ball vertical speed
const ballRadius = 10;
const halfBallRadius = ballRadius / 2;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 95;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleDX = canvas.width * paddleSpeedFactor; // Paddle speed

// Brick properties
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let lastTime = 0; // Track the time of the previous frame

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

// Collision detection
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        // Check if the ball is within the brick's bounding box
        if (
          ballX + halfBallRadius > b.x && // Ball's right edge is past the brick's left edge
          ballX - halfBallRadius < b.x + brickWidth && // Ball's left edge is before the brick's right edge
          ballY + halfBallRadius > b.y && // Ball's bottom edge is past the brick's top edge
          ballY - halfBallRadius < b.y + brickHeight // Ball's top edge is before the brick's bottom edge
        ) {
          if (b.indestructible) {
            // Indestructible brick: Use side collision detection
            const ballBottom = ballY + ballRadius;
            const ballTop = ballY - ballRadius;
            const ballRight = ballX + ballRadius;
            const ballLeft = ballX - ballRadius;

            const brickBottom = b.y + brickHeight;
            const brickTop = b.y;
            const brickRight = b.x + brickWidth;
            const brickLeft = b.x;

            // Check if the collision is on the top or bottom of the brick
            if (ballBottom > brickTop && ballTop < brickTop) {
              ballDY = -ballDY; // Reverse vertical direction (top collision)
            } else if (ballTop < brickBottom && ballBottom > brickBottom) {
              ballDY = -ballDY; // Reverse vertical direction (bottom collision)
            }

            // Check if the collision is on the left or right of the brick
            if (ballRight > brickLeft && ballLeft < brickLeft) {
              ballDX = -ballDX; // Reverse horizontal direction (left collision)
            } else if (ballLeft < brickRight && ballRight > brickRight) {
              ballDX = -ballDX; // Reverse horizontal direction (right collision)
            }
          } else {
            // Normal brick: Simple collision logic
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

// End game
function endGame(message) {
  isGameOver = true;
  clearInterval(timerInterval);
  const messageElement = document.getElementById("message");
  messageElement.textContent = `${message} Time: ${timer} ms, Score: ${score}`;
  messageElement.style.visibility = "visible"; // Make the message visible
}

// Update canvas size for DPR
function updateCanvasSize() {
  const dpr = window.devicePixelRatio || 1; // Get the device pixel ratio
  const rect = canvas.getBoundingClientRect(); // Get the CSS size of the canvas

  // Set the canvas width and height based on DPR
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale the canvas context to match the DPR
  ctx.scale(dpr, dpr);
}

function updateSpeeds() {
  ballDX = canvas.width * ballSpeedFactor;
  ballDY = canvas.height * ballSpeedFactor;
  paddleDX = canvas.width * paddleSpeedFactor;
}

// Handle canvas resizing
window.addEventListener("resize", () => {
  updateCanvasSize(); // Adjust canvas size if needed
  updateSpeeds(); // Recalculate speeds
});

// Game loop
function draw(timestamp = 0) {
  if (isPaused || isGameOver) return;

  // Handle the first frame
  if (!lastTime) {
    lastTime = timestamp;
  }

  // Calculate delta time (in seconds)
  let deltaTime = (timestamp - lastTime) / 1000; // Convert milliseconds to seconds
  lastTime = timestamp;

  // Clamp deltaTime to prevent it from being too small
  const maxDeltaTime = 1 / 60; // Maximum delta time for 60 FPS
  deltaTime = Math.min(deltaTime, maxDeltaTime);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // Ball movement
  if (
    ballX + ballDX * deltaTime > canvas.width - ballRadius ||
    ballX + ballDX * deltaTime < ballRadius
  ) {
    ballDX = -ballDX;
  }
  if (ballY + ballDY * deltaTime < ballRadius) {
    ballDY = -ballDY;
  } else if (ballY + ballDY * deltaTime > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      ballDY = -ballDY;
    } else {
      endGame("Game Over!");
    }
  }

  ballX += ballDX * deltaTime;
  ballY += ballDY * deltaTime;

  // Paddle movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += paddleDX * deltaTime;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleDX * deltaTime;
  }

  requestAnimationFrame(draw);
}

// Pause/Resume button
document.getElementById("pauseResumeBtn").addEventListener("click", () => {
  isPaused = !isPaused;

  document.getElementById("pauseResumeBtn").textContent = isPaused
    ? "Resume"
    : "Pause";

  if (!isPaused) draw();
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
updateCanvasSize();
updateSpeeds();
setIndestructibleBrick();
startTimer();
requestAnimationFrame(draw);
