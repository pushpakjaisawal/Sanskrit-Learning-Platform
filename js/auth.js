/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  auth.js — Authentication & Session Management              ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  Handles all user identity operations for Sanskrit          ║
 * ║  Vidyalaya. Uses localStorage as a lightweight database      ║
 * ║  (no server required — fully client-side).                  ║
 * ║                                                              ║
 * ║  localStorage Keys:                                          ║
 * ║    sv_users     — Object: { [email]: { name, email, pw } }  ║
 * ║    sv_userdata  — Object: { [email]: UserData }             ║
 * ║    sv_session   — Object: { name, email }  (active session) ║
 * ║                                                              ║
 * ║  UserData shape:                                             ║
 * ║    {                                                         ║
 * ║      enrolled   : { [courseId]: true }                      ║
 * ║      progress   : { [courseId]: { [videoIdx]: true } }      ║
 * ║      quizScores : { [courseId]: number (0–100) }            ║
 * ║    }                                                         ║
 * ║                                                              ║
 * ║  Public Functions:                                           ║
 * ║    doRegister()          – validates & creates account       ║
 * ║    doLogin()             – validates credentials & logs in   ║
 * ║    doLogout()            – clears session, redirects home    ║
 * ║    getSession()          – returns current user or null      ║
 * ║    getUserData(email)    – returns UserData for given email  ║
 * ║    saveUserData()        – persists userData to localStorage ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ── localStorage key constants ─────────────────────────────── */
const LS_USERS    = 'sv_users';
const LS_USERDATA = 'sv_userdata';
const LS_SESSION  = 'sv_session';

/* ── In-memory caches (avoid repeated JSON.parse calls) ──────── */
let _users    = JSON.parse(localStorage.getItem(LS_USERS)    || '{}');
let _userData = JSON.parse(localStorage.getItem(LS_USERDATA) || '{}');


/* ══════════════════════════════════════════════════════════════
   REGISTRATION
   ──────────────────────────────────────────────────────────────
   Called by: pages/register.html → "Create My Account" button

   Validation rules:
     1. Name, email, password are all non-empty
     2. Password is at least 6 characters
     3. Email is not already registered

   On success:
     • Saves account to _users
     • Creates empty UserData record in _userData
     • Sets session in localStorage
     • Redirects to dashboard.html
══════════════════════════════════════════════════════════════ */

/**
 * doRegister
 * ──────────
 * Reads form fields from register.html, validates them,
 * and either shows an error or creates the account.
 */
function doRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim().toLowerCase();
  const gender   = document.getElementById('reg-gender').value;
  const dob      = document.getElementById('reg-dob').value;
  const pw       = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('register-error');

  // ── Validation ───────────────────────────────────────
  if (!name || !email || !gender || !dob || !pw) {
    showError(errEl, 'Please fill in all fields.');
    return;
  }
  if (!validatePassword(pw)) {
    showError(errEl, 'Password must be 8–16 characters with at least 1 uppercase letter, 1 number, and 1 special character.');
    return;
  }
  if (_users[email]) {
    showError(errEl, 'An account with this email already exists.');
    return;
  }

  // ── Create account ────────────────────────────────────
  _users[email] = { name, email, pw, gender, dob };

  // Initialise empty data structure for new user
  _userData[email] = {
    enrolled:   {},  // { [courseId]: true }
    progress:   {},  // { [courseId]: { [videoIdx]: true } }
    quizScores: {}   // { [courseId]: 0-100 }
  };

  // Persist to localStorage
  localStorage.setItem(LS_USERS,    JSON.stringify(_users));
  localStorage.setItem(LS_USERDATA, JSON.stringify(_userData));

  // Set session
  setSession({ name, email });

  // Navigate to dashboard
  window.location = 'dashboard.html';
}


/* ══════════════════════════════════════════════════════════════
   LOGIN
   ──────────────────────────────────────────────────────────────
   Called by: pages/login.html → "Login to Dashboard" button

   Validation:
     • Looks up email in _users
     • Compares password (plain-text, suitable for demo purposes)

   On success:
     • Sets session
     • Redirects to dashboard.html

   Note: In a production app, passwords should be hashed
   (e.g. bcrypt) and stored server-side. This is a demo.
══════════════════════════════════════════════════════════════ */

/**
 * doLogin
 * ────────
 * Reads login.html form fields, verifies credentials.
 */
function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pw    = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  // ── Verify credentials ────────────────────────────────
  if (!_users[email] || _users[email].pw !== pw) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  // ── Set session & redirect ────────────────────────────
  setSession({ name: _users[email].name, email });
  window.location = 'dashboard.html';
}


/* ══════════════════════════════════════════════════════════════
   LOGOUT
   ──────────────────────────────────────────────────────────────
   Called by: any page's Logout button

   Clears the active session and returns to the landing page.
   Does NOT delete the user's account or progress data.
══════════════════════════════════════════════════════════════ */

/**
 * doLogout
 * ─────────
 * Clears session and redirects to the landing (index.html).
 * Resolves the correct path relative to current page location.
 */
function doLogout() {
  localStorage.removeItem(LS_SESSION);
  // Handle both root-level and pages/ subdirectory
  const atRoot = window.location.pathname.endsWith('index.html') ||
                 window.location.pathname.endsWith('/');
  window.location = atRoot ? 'index.html' : '../index.html';
}


/* ══════════════════════════════════════════════════════════════
   SESSION HELPERS
══════════════════════════════════════════════════════════════ */

/**
 * setSession
 * ──────────
 * Saves the authenticated user object to localStorage.
 *
 * @param {{ name: string, email: string }} user
 */
function setSession(user) {
  localStorage.setItem(LS_SESSION, JSON.stringify(user));
}

/**
 * getSession
 * ──────────
 * Returns the currently authenticated user, or null if not logged in.
 *
 * @returns {{ name: string, email: string } | null}
 */
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSION));
  } catch {
    return null;
  }
}


/* ══════════════════════════════════════════════════════════════
   USER DATA HELPERS
   ──────────────────────────────────────────────────────────────
   Per-user data stores: enrollments, progress, quiz scores.
══════════════════════════════════════════════════════════════ */

/**
 * getUserData
 * ────────────
 * Returns the UserData object for the given email.
 * Auto-initialises if the record doesn't exist yet.
 *
 * @param {string} email — User's email address (lowercase)
 * @returns {{ enrolled: object, progress: object, quizScores: object }}
 */
function getUserData(email) {
  if (!email) {
    const session = getSession();
    email = session ? session.email : null;
  }
  if (!email) return { enrolled: {}, progress: {}, quizScores: {} };

  if (!_userData[email]) {
    _userData[email] = { enrolled: {}, progress: {}, quizScores: {} };
  }
  // Ensure all sub-objects exist (in case of old data format)
  const ud = _userData[email];
  ud.enrolled   = ud.enrolled   || {};
  ud.progress   = ud.progress   || {};
  ud.quizScores = ud.quizScores || {};
  return ud;
}

/**
 * saveUserData
 * ─────────────
 * Persists the in-memory _userData cache to localStorage.
 * Must be called after any mutation to progress, enrollment,
 * or quiz scores.
 */
function saveUserData() {
  localStorage.setItem(LS_USERDATA, JSON.stringify(_userData));
}


/* ══════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════ */

/**
 * showError
 * ──────────
 * Displays an inline error message in the given element.
 *
 * @param {HTMLElement} el  — The error div/span to update
 * @param {string}      msg — Error message text
 */
function showError(el, msg) {
  el.textContent   = msg;
  el.style.display = 'block';
}

/**
 * showToast
 * ──────────
 * Displays a brief auto-dismissing notification at the
 * bottom-centre of the screen.
 *
 * @param {string} msg      — Message to display
 * @param {number} duration — Time in ms before it disappears (default 3000)
 */
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}


/* ══════════════════════════════════════════════════════════════
   PASSWORD VALIDATION
   ──────────────────────────────────────────────────────────────
   Rules: 8–16 characters, at least 1 uppercase, 1 number,
   1 special character.
══════════════════════════════════════════════════════════════ */

/**
 * validatePassword
 * ─────────────────
 * Returns true if the password meets all requirements.
 *
 * @param {string} pw — The password to validate
 * @returns {boolean}
 */
function validatePassword(pw) {
  if (!pw || pw.length < 8 || pw.length > 16) return false;
  if (!/[A-Z]/.test(pw))                       return false; // at least 1 uppercase
  if (!/[0-9]/.test(pw))                       return false; // at least 1 digit
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw)) return false; // at least 1 special char
  return true;
}


/* ══════════════════════════════════════════════════════════════
   FORGOT PASSWORD — OTP FLOW
   ──────────────────────────────────────────────────────────────
   Step 1: User enters registered email → OTP generated & shown
   Step 2: User enters the OTP to verify
   Step 3: User sets new password + confirmation

   Since this is a fully client-side demo, the OTP is generated
   locally and displayed via an alert / toast (simulating email).
══════════════════════════════════════════════════════════════ */

let _forgotOtp     = null;   // The generated OTP
let _forgotEmail   = null;   // Email being reset
let _otpExpiry     = null;   // OTP expiry timestamp

/**
 * doSendOtp
 * ──────────
 * Validates that the email exists, generates a 6-digit OTP,
 * displays it (simulating email delivery), and moves to step 2.
 */
function doSendOtp() {
  const email  = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errEl  = document.getElementById('forgot-error');
  const succEl = document.getElementById('forgot-success');
  errEl.style.display  = 'none';
  succEl.style.display = 'none';

  if (!email) {
    showError(errEl, 'Please enter your email address.');
    return;
  }

  if (!_users[email]) {
    showError(errEl, 'No account found with this email address.');
    return;
  }

  // Generate 6-digit OTP
  _forgotOtp   = String(Math.floor(100000 + Math.random() * 900000));
  _forgotEmail = email;
  _otpExpiry   = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Simulate sending email — show OTP via alert
  succEl.textContent   = '✓ OTP sent to ' + email + '. Check the alert popup!';
  succEl.style.display = 'block';
  alert('📧 Your OTP is: ' + _forgotOtp + '\n\n(In a real app this would be emailed to you.)\nValid for 5 minutes.');

  // Show OTP step, hide email step
  document.getElementById('forgot-step-email').style.display = 'none';
  document.getElementById('forgot-step-otp').style.display   = 'block';
}

/**
 * doVerifyOtp
 * ────────────
 * Verifies the entered OTP matches. On success, shows the
 * password reset form (step 3).
 */
function doVerifyOtp() {
  const otp    = document.getElementById('forgot-otp').value.trim();
  const errEl  = document.getElementById('forgot-error');
  const succEl = document.getElementById('forgot-success');
  errEl.style.display  = 'none';
  succEl.style.display = 'none';

  if (!otp) {
    showError(errEl, 'Please enter the OTP.');
    return;
  }

  // Check expiry
  if (Date.now() > _otpExpiry) {
    showError(errEl, 'OTP has expired. Please request a new one.');
    // Reset to step 1
    document.getElementById('forgot-step-otp').style.display   = 'none';
    document.getElementById('forgot-step-email').style.display = 'block';
    _forgotOtp = null;
    return;
  }

  if (otp !== _forgotOtp) {
    showError(errEl, 'Incorrect OTP. Please try again.');
    return;
  }

  // OTP verified — show reset password form
  succEl.textContent   = '✓ OTP verified! Set your new password below.';
  succEl.style.display = 'block';
  document.getElementById('forgot-step-otp').style.display   = 'none';
  document.getElementById('forgot-step-reset').style.display  = 'block';
}

/**
 * doResetPassword
 * ────────────────
 * Validates and saves the new password.
 */
function doResetPassword() {
  const newPw     = document.getElementById('reset-new-password').value;
  const confirmPw = document.getElementById('reset-confirm-password').value;
  const errEl     = document.getElementById('forgot-error');
  const succEl    = document.getElementById('forgot-success');
  errEl.style.display  = 'none';
  succEl.style.display = 'none';

  if (!newPw || !confirmPw) {
    showError(errEl, 'Please fill in both password fields.');
    return;
  }

  if (!validatePassword(newPw)) {
    showError(errEl, 'Password must be 8–16 characters with at least 1 uppercase letter, 1 number, and 1 special character.');
    return;
  }

  if (newPw !== confirmPw) {
    showError(errEl, 'Passwords do not match.');
    return;
  }

  // Update password
  _users[_forgotEmail].pw = newPw;
  localStorage.setItem(LS_USERS, JSON.stringify(_users));

  // Clean up
  _forgotOtp   = null;
  _forgotEmail = null;
  _otpExpiry   = null;

  // Show success & redirect
  succEl.textContent   = '✓ Password reset successfully! Redirecting to login…';
  succEl.style.display = 'block';
  setTimeout(() => { window.location = 'login.html'; }, 2000);
}

/**
 * doResendOtp
 * ────────────
 * Resend a new OTP for the same email.
 */
function doResendOtp() {
  if (!_forgotEmail) return;
  _forgotOtp  = String(Math.floor(100000 + Math.random() * 900000));
  _otpExpiry  = Date.now() + 5 * 60 * 1000;
  const succEl = document.getElementById('forgot-success');
  succEl.textContent   = '✓ New OTP sent!';
  succEl.style.display = 'block';
  alert('📧 Your new OTP is: ' + _forgotOtp + '\n\nValid for 5 minutes.');
}
