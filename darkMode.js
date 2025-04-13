const toggleButton = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const themeIcon = document.getElementById("theme-icon");

// Function to update the icon based on the current theme
function updateIcon() {
  if (htmlElement.classList.contains("dark-mode")) {
    themeIcon.textContent = "☀️"; // Sun icon for dark mode
  } else {
    themeIcon.textContent = "🌙"; // Moon icon for light mode
  }
}

// Check local storage for theme preference on initial load
if (localStorage.getItem("dark-mode") === "enabled") {
  htmlElement.classList.add("dark-mode");
}
updateIcon(); // Set the correct icon on initial load

// Toggle theme and icon on button click
toggleButton.addEventListener("click", () => {
  htmlElement.classList.toggle("dark-mode");

  if (htmlElement.classList.contains("dark-mode")) {
    localStorage.setItem("dark-mode", "enabled");
  } else {
    localStorage.setItem("dark-mode", "disabled");
  }

  updateIcon(); // Update the icon after toggling
});
