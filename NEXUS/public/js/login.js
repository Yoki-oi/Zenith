// login.js — login page interactions
document.body.style.cursor = 'none';

// Check if already logged in
const existing = localStorage.getItem('nexus_user');
if (existing) {
  window.location.replace('tracker.html');
}
