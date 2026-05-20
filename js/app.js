/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  app.js — Dashboard Application Logic                       ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  Manages the two-section dashboard:                          ║
 * ║    1. All Courses  — browse & enroll                         ║
 * ║    2. My Learning  — enrolled courses + progress             ║
 * ║                                                              ║
 * ║  Depends on:                                                 ║
 * ║    data.js  — COURSES array                                  ║
 * ║    auth.js  — getSession(), getUserData(), saveUserData(),   ║
 * ║               doLogout(), showToast()                        ║
 * ║                                                              ║
 * ║  Public Functions (called from dashboard.html):             ║
 * ║    renderCourses()          — inject course cards into grid  ║
 * ║    renderMyLearning()       — inject enrolled course rows    ║
 * ║    showSection(name, tab)   — switch active dashboard tab    ║
 * ║    enrollCourse(courseId)   — enrol user in a course         ║
 * ║    openCourse(courseId)     — navigate to player.html        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';


/* ══════════════════════════════════════════════════════════════
   SECTION NAVIGATION
   ──────────────────────────────────────────────────────────────
   The dashboard has two <section> elements:
     #section-courses      — All Courses
     #section-my-learning  — My Learning

   showSection() hides all sections, shows the target, and
   updates the active-tab highlight on the nav buttons.
══════════════════════════════════════════════════════════════ */

/**
 * showSection
 * ────────────
 * Switches the visible dashboard section.
 *
 * @param {string}      name — "courses" | "my-learning"
 * @param {HTMLElement} tab  — The clicked nav-tab button element
 */
function showSection(name, tab) {
  // ── Hide all sections ─────────────────────────────────
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active-section');
    s.setAttribute('aria-hidden', 'true');
  });

  // ── Remove active highlight from all tabs ────────────
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active-tab');
    t.setAttribute('aria-selected', 'false');
  });

  // ── Show target section ───────────────────────────────
  const targetSection = document.getElementById('section-' + name);
  if (targetSection) {
    targetSection.classList.add('active-section');
    targetSection.removeAttribute('aria-hidden');
  }

  // ── Highlight clicked tab ─────────────────────────────
  if (tab) {
    tab.classList.add('active-tab');
    tab.setAttribute('aria-selected', 'true');
  }

  // ── Render content for the active section ────────────
  if (name === 'my-learning') renderMyLearning();
  if (name === 'courses')     renderCourses();
  if (name === 'profile')     renderProfile();
}


/* ══════════════════════════════════════════════════════════════
   RENDER COURSES (All Courses section)
   ──────────────────────────────────────────────────────────────
   Injects a course card for every entry in COURSES (data.js).

   Card layout:
     ┌──────────────────────────────────┐
     │  Coloured thumbnail  [Level]     │
     │  [✓ Enrolled badge if enrolled]  │
     ├──────────────────────────────────┤
     │  English title                   │
     │  Devanagari name                 │
     │  Description (italic)            │
     │  ── Lessons count | [Button] ──  │
     └──────────────────────────────────┘

   Button:
     Not enrolled → "+ Enroll Free"  → calls enrollCourse(id)
     Enrolled     → "▶ Continue"     → calls openCourse(id)
══════════════════════════════════════════════════════════════ */

/**
 * renderCourses
 * ─────────────
 * Reads current enrollment state and renders course cards
 * into #courses-grid.
 */
function renderCourses() {
  const user = getSession();
  if (!user) return;

  const ud   = getUserData(user.email);
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  // Build HTML for all course cards
  grid.innerHTML = COURSES.map(course => buildCourseCard(course, ud)).join('');
}

/**
 * buildCourseCard
 * ────────────────
 * Returns the HTML string for a single course card.
 *
 * @param {object} course — Course object from COURSES array
 * @param {object} ud     — Current user's UserData
 * @returns {string} HTML string
 */
function buildCourseCard(course, ud) {
  const enrolled = !!ud.enrolled[course.id];

  // Progress percentage (shown only in the enrolled badge area)
  const progress  = ud.progress[course.id] || {};
  const donePct   = enrolled
    ? Math.round((Object.keys(progress).length / course.playlist.length) * 100)
    : 0;

  const actionBtn = enrolled
    ? `<button class="btn-enroll enrolled" onclick="openCourse(${course.id})">▶ Continue (${donePct}%)</button>`
    : `<button class="btn-enroll" onclick="enrollCourse(${course.id})">+ Enroll Free</button>`;

  return `
    <article class="course-card" role="listitem" aria-label="${course.title} course">

      <!-- Coloured thumbnail with gradient background class -->
      <div class="course-thumb course-thumb-${course.thumb}">
        <span aria-hidden="true" style="font-size:2.8rem">${course.icon}</span>
        <span class="course-level-badge">${course.level}</span>
        <span class="enrolled-badge ${enrolled ? 'show' : ''}" aria-label="Enrolled">✓ Enrolled</span>
      </div>

      <div class="course-body">
        <div class="course-title">${course.title}</div>
        <div class="course-devanagari" lang="sa">${course.devanagari}</div>
        <p class="course-desc">${course.desc}</p>
        <div class="course-meta">
          <span>📹 ${course.videos} lessons</span>
          ${actionBtn}
        </div>
      </div>

    </article>`;
}


/* ══════════════════════════════════════════════════════════════
   ENROLL IN COURSE
   ──────────────────────────────────────────────────────────────
   Marks the user as enrolled, initialises an empty progress
   record, saves to localStorage, and refreshes the cards.
══════════════════════════════════════════════════════════════ */

/**
 * enrollCourse
 * ─────────────
 * Enrols the current user in the specified course.
 * Called from onclick inside a course card button.
 *
 * @param {number} courseId — ID of the course to enrol in
 */
function enrollCourse(courseId) {
  const user = getSession();
  if (!user) return;

  const ud = getUserData(user.email);

  // Mark enrolled and initialise empty progress map
  ud.enrolled[courseId]  = true;
  ud.progress[courseId]  = ud.progress[courseId] || {};

  saveUserData();
  renderCourses(); // Re-render to update button states

  showToast('✓ Successfully enrolled! Go to "My Learning" to start.');
}


/* ══════════════════════════════════════════════════════════════
   OPEN / CONTINUE COURSE
   ──────────────────────────────────────────────────────────────
   Navigates to the player page for the specified course.
   The player page reads ?course=<id> from the URL.
══════════════════════════════════════════════════════════════ */

/**
 * openCourse
 * ──────────
 * Navigates to the video player for the given course.
 *
 * @param {number} courseId — ID of the course to open
 */
function openCourse(courseId) {
  window.location = 'player.html?course=' + courseId;
}


/* ══════════════════════════════════════════════════════════════
   RENDER MY LEARNING (My Learning section)
   ──────────────────────────────────────────────────────────────
   Shows a list of all enrolled courses with:
     • Course icon + gradient bg matching the course card
     • Title and progress bar
     • Completion percentage
     • Quiz score (if taken)
     • Continue button
══════════════════════════════════════════════════════════════ */

/**
 * renderMyLearning
 * ─────────────────
 * Injects enrolled course rows into #my-learning-list.
 * Shows an empty-state message if no courses are enrolled.
 */
function renderMyLearning() {
  const user = getSession();
  if (!user) return;

  const ud        = getUserData(user.email);
  const enrolled  = Object.keys(ud.enrolled).map(Number); // Convert keys to numbers
  const container = document.getElementById('my-learning-list');
  if (!container) return;

  // ── Empty state ───────────────────────────────────────
  if (!enrolled.length) {
    container.innerHTML = `
      <div class="empty-state" role="status">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <h3>No Courses Yet</h3>
        <p>Go to "All Courses" and enrol in your first Sanskrit course!</p>
      </div>`;
    return;
  }

  // ── Enrolled course rows ──────────────────────────────
  container.innerHTML = enrolled.map(id => {
    const course = COURSES.find(c => c.id === id);
    if (!course) return ''; // safety check

    const progress = ud.progress[id] || {};
    const done     = Object.keys(progress).length;
    const pct      = Math.round((done / course.playlist.length) * 100);
    const score    = ud.quizScores && ud.quizScores[id];
    const passed   = score >= 60;

    return `
      <div class="enrolled-course-item">
        <div class="enrolled-course-header">

          <!-- Coloured icon matching course card thumbnail -->
          <div
            class="enrolled-course-icon course-thumb-${course.thumb}"
            aria-hidden="true"
            style="border-radius:8px;"
          >${course.icon}</div>

          <div class="enrolled-course-info">
            <!-- Title row -->
            <div class="enrolled-course-title">
              ${course.title}
              <span style="font-family:'Noto Sans Devanagari',sans-serif;font-weight:300;font-size:0.85rem;color:var(--text-light);">
                — ${course.devanagari}
              </span>
            </div>

            <!-- Progress bar -->
            <div class="progress-bar-wrap" role="progressbar"
                 aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
                 aria-label="${course.title} progress: ${pct}%">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>

            <!-- Progress text -->
            <div class="progress-text">
              ${done} / ${course.playlist.length} lessons complete (${pct}%)
              ${score !== undefined
                ? `&nbsp;•&nbsp; Quiz: <strong>${score}%</strong> ${passed ? '🏆' : '❌'}`
                : ''}
            </div>
          </div><!-- /.enrolled-course-info -->

          <!-- Continue button → player.html -->
          <button
            class="btn-continue"
            onclick="openCourse(${course.id})"
            aria-label="Continue ${course.title}"
          >▶ Continue</button>

        </div><!-- /.enrolled-course-header -->
      </div><!-- /.enrolled-course-item -->`;
  }).join('');
}


/* ══════════════════════════════════════════════════════════════
   RENDER PROFILE (Profile section)
   ──────────────────────────────────────────────────────────────
   Populates profile stats and certificates list with
   dynamic user data from localStorage.
══════════════════════════════════════════════════════════════ */

/**
 * renderProfile
 * ──────────────
 * Updates the profile section with current user stats
 * and earned certificates.
 */
function renderProfile() {
  const user = getSession();
  if (!user) return;

  const ud       = getUserData(user.email);
  const enrolled = Object.keys(ud.enrolled);

  // ── Stat: Enrolled count ─────────────────────────────
  const statEnrolled = document.getElementById('stat-enrolled');
  if (statEnrolled) statEnrolled.textContent = enrolled.length;

  // ── Stat: Videos Done count ──────────────────────────
  let totalVideosDone = 0;
  enrolled.forEach(id => {
    const prog = ud.progress[id] || {};
    totalVideosDone += Object.keys(prog).length;
  });
  const statVideos = document.getElementById('stat-videos-done');
  if (statVideos) statVideos.textContent = totalVideosDone;

  // ── Stat: Certificates count & list ──────────────────
  const certs = [];
  enrolled.forEach(id => {
    const courseId = Number(id);
    const course   = COURSES.find(c => c.id === courseId);
    if (!course) return;
    const score = ud.quizScores && ud.quizScores[courseId];
    if (score !== undefined && score >= 60) {
      certs.push({ course, score });
    }
  });

  const statCerts = document.getElementById('stat-certificates');
  if (statCerts) statCerts.textContent = certs.length;

  // ── Certificates list ────────────────────────────────
  const certsContainer = document.getElementById('profile-certificates-list');
  if (certsContainer) {
    if (certs.length === 0) {
      certsContainer.innerHTML = '<p class="profile-empty-msg">Complete courses and pass quizzes to earn certificates.</p>';
    } else {
      certsContainer.innerHTML = certs.map(c => `
        <div class="profile-cert-item">
          <span class="profile-cert-icon">${c.course.icon}</span>
          <div class="profile-cert-info">
            <div class="profile-cert-title">${c.course.title}</div>
            <div class="profile-cert-score">Score: ${c.score}% 🏆</div>
          </div>
          <a class="btn-view-cert" href="certificate.html?course=${c.course.id}">View</a>
        </div>
      `).join('');
    }
  }
}


/* ══════════════════════════════════════════════════════════════
   UPDATE PASSWORD
   ──────────────────────────────────────────────────────────────
   Allows users to change their password from the profile section.
══════════════════════════════════════════════════════════════ */

/**
 * doUpdatePassword
 * ─────────────────
 * Reads the password form fields, validates them, and
 * updates the user's password in localStorage.
 */
function doUpdatePassword() {
  const currentPw  = document.getElementById('current-password').value;
  const newPw      = document.getElementById('new-password').value;
  const confirmPw  = document.getElementById('confirm-password').value;
  const errEl      = document.getElementById('password-error');
  const successEl  = document.getElementById('password-success');

  // Reset messages
  errEl.style.display     = 'none';
  successEl.style.display = 'none';

  const user = getSession();
  if (!user) return;

  // Look up user record
  const userRecord = _users[user.email];
  if (!userRecord) {
    showPasswordError(errEl, 'User account not found.');
    return;
  }

  // Validate current password
  if (userRecord.pw !== currentPw) {
    showPasswordError(errEl, 'Current password is incorrect.');
    return;
  }

  // Validate new password
  if (!validatePassword(newPw)) {
    showPasswordError(errEl, 'Password must be 8–16 characters with at least 1 uppercase letter, 1 number, and 1 special character.');
    return;
  }

  // Confirm passwords match
  if (newPw !== confirmPw) {
    showPasswordError(errEl, 'New passwords do not match.');
    return;
  }

  // Prevent same password
  if (newPw === currentPw) {
    showPasswordError(errEl, 'New password must be different from the current one.');
    return;
  }

  // ── Update password ──────────────────────────────────
  _users[user.email].pw = newPw;
  localStorage.setItem(LS_USERS, JSON.stringify(_users));

  // Clear form
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value     = '';
  document.getElementById('confirm-password').value = '';

  // Show success
  successEl.textContent   = '✓ Password updated successfully!';
  successEl.style.display = 'block';
  showToast('✓ Password updated successfully!');
}

/**
 * showPasswordError — helper to display error in password form
 */
function showPasswordError(el, msg) {
  el.textContent   = msg;
  el.style.display = 'block';
}
