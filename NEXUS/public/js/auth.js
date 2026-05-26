// auth.js — handles Google OAuth via popup + guest mode
// Uses Firebase Auth (free tier). Replace firebaseConfig with your project values.
// Instructions: https://console.firebase.google.com → New project → Auth → Google provider

// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE CONFIG — Replace these values with your own from Firebase Console
// Project Settings → Your Apps → SDK setup → Config
// ─────────────────────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

const FIREBASE_AVAILABLE = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

// ─────────────────────────────────────────────────────────────────────────────
// Init (tracker page only)
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  const onTracker = !!document.getElementById('userChip');
  if (!onTracker) return;

  // Load stored user (guest or Google)
  const stored = localStorage.getItem('nexus_user');
  if (!stored) {
    // Not authenticated → redirect to login
    window.location.replace('index.html');
    return;
  }
  const user = JSON.parse(stored);
  applyUserToUI(user);
})();

function applyUserToUI(user) {
  const nameEl   = document.getElementById('userName');
  const emailEl  = document.getElementById('userEmail');
  const avatarEl = document.getElementById('userAvatar');
  if (!nameEl) return;
  nameEl.textContent  = user.name  || 'User';
  emailEl.textContent = user.email || 'local mode';
  if (user.photo) {
    avatarEl.innerHTML = `<img src="${user.photo}" alt="avatar">`;
  } else {
    avatarEl.textContent = (user.name || 'U')[0].toUpperCase();
  }
}

function handleLogout() {
  localStorage.removeItem('nexus_user');
  window.location.replace('index.html');
}

// ─────────────────────────────────────────────────────────────────────────────
// Login page functions
// ─────────────────────────────────────────────────────────────────────────────
async function handleGoogleSignIn() {
  const btn = document.getElementById('googleSignIn');
  if (!btn) return;

  if (!FIREBASE_AVAILABLE) {
    // Firebase not configured → show setup instructions
    showLoginError('Firebase is not configured yet. See README.md to set up Google Sign-in, or use Guest mode.');
    return;
  }

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Connecting…';

  try {
    // Dynamically load Firebase (avoids bundling)
    const { initializeApp }     = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

    const app      = initializeApp(FIREBASE_CONFIG);
    const auth     = getAuth(app);
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);
    const gUser  = result.user;

    const user = {
      uid:   gUser.uid,
      name:  gUser.displayName,
      email: gUser.email,
      photo: gUser.photoURL,
      type:  'google'
    };
    localStorage.setItem('nexus_user', JSON.stringify(user));
    window.location.replace('tracker.html');
  } catch (err) {
    console.error('Google Sign-in error:', err);
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Continue with Google';
    showLoginError('Sign-in failed. Please try again or use Guest mode.');
  }
}

function handleGuestMode() {
  const user = {
    uid:   'guest_' + Date.now(),
    name:  'Guest',
    email: null,
    photo: null,
    type:  'guest'
  };
  localStorage.setItem('nexus_user', JSON.stringify(user));
  window.location.replace('tracker.html');
}

function showLoginError(msg) {
  let el = document.getElementById('login-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'login-error';
    el.style.cssText = `
      background: rgba(255,77,138,0.08); border: 1px solid rgba(255,77,138,0.25);
      border-radius: 10px; padding: 11px 16px; font-size: 12px; color: #ff7aaa;
      font-family: 'JetBrains Mono', monospace; margin-top: -10px;
    `;
    document.querySelector('.card-inner')?.appendChild(el);
  }
  el.textContent = msg;
}
