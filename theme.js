// Initialize theme before page loads to prevent flash of unstyled content
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);

  // Dispatch an event in case charts need to re-render
  window.dispatchEvent(new Event('themeChanged'));
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Ensure icon is correct on load
document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcon(document.documentElement.getAttribute('data-theme'));

  // Authentication & User Name Display Logic
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('login.html');
  const userName = localStorage.getItem('userName');

  if (!userName && !isLoginPage) {
    window.location.href = 'login.html';
  } else if (userName && isLoginPage) {
    window.location.href = 'index.html';
  } else if (userName) {
    const nameDisplays = document.querySelectorAll('.user-name-display');
    nameDisplays.forEach(display => {
      display.textContent = userName;
    });
  }
});

function logout() {
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhone');
  window.location.href = 'login.html';
}
