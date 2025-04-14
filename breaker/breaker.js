const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 3.5;
let ballDY = 3.5;
const ballRadius = 10;

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
    bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 = visible, 0 = broken
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
        ctx.fillStyle = "#fff";
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
        if (
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          ballDY = -ballDY; // Reverse ball direction
          b.status = 0; // Mark the brick as broken
          score++; // Increase score
          updateScore();

          // Regenerate the brick after 2 seconds
          setTimeout(() => {
            b.status = 1; // Make the brick visible again
          }, 2000);
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

// Game loop
function draw() {
  if (isPaused || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

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

startTimer();
draw();
