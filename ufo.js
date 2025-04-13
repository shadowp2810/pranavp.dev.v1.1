const ufo = document.createElement("div");
ufo.id = "ufo";
ufo.textContent = "🛸";
document.body.appendChild(ufo);

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

// Function to generate a random height (Y position)
function getRandomHeight() {
  return Math.random() * screenHeight; // Random Y within the screen height
}

// Function to generate a random speed (duration)
function getRandomSpeed() {
  return Math.random() * 3 + 2; // Random speed between 2s and 5s
}

// Function to move the UFO
function moveUFO() {
  const randomHeight = getRandomHeight();
  const randomSpeed = getRandomSpeed();

  // Set random speed for the UFO's flight
  ufo.style.transitionDuration = `${randomSpeed}s`; // Set the speed dynamically

  // Move the UFO from left to right (off-screen)
  ufo.style.transform = `translate(${screenWidth + 100}px, ${randomHeight}px)`;

  // After the UFO flies off-screen, reset its position to the left
  setTimeout(() => {
    ufo.style.transitionDuration = "0s"; // Remove transition for instant reset
    ufo.style.transform = `translate(-100px, ${getRandomHeight()}px)`; // Reset to the left
  }, randomSpeed * 1000); // Wait for the UFO to finish flying
}

// Function to start the UFO animation at random intervals
function startUFOAnimation() {
  function fly() {
    moveUFO();

    // Wait for the UFO to finish its journey before scheduling the next flight
    const randomDelay = Math.random() * 5000 + 2000; // Random delay between 1s and 3s
    const randomSpeed = parseFloat(ufo.style.transitionDuration) * 1000; // Current flight duration
    setTimeout(fly, randomSpeed + randomDelay); // Schedule the next flight
  }

  fly(); // Start the first flight
}

// Start the UFO animation
startUFOAnimation();
