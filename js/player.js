/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  player.js — Video Player Logic                             ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  Controls the video player page (player.html):              ║
 * ║    • Loads YouTube videos via the iframe embed API          ║
 * ║    • Renders the course playlist in the sidebar             ║
 * ║    • Tracks video completion per-lesson                     ║
 * ║    • Auto-advances to the next lesson when marked done      ║
 * ║    • Unlocks the Quiz button when ≥70% videos completed     ║
 * ║    • Shows the Certificate button if the quiz was passed    ║
 * ║                                                              ║
 * ║  Depends on:                                                 ║
 * ║    data.js  — COURSES (for course structure)                 ║
 * ║    auth.js  — getSession(), getUserData(), saveUserData(),   ║
 * ║               showToast()                                    ║
 * ║                                                              ║
 * ║  Module-level state (private):                              ║
 * ║    _activeCourse  — currently loaded course object          ║
 * ║    _currentVidIdx — index of the currently playing video    ║
 * ║                                                              ║
 * ║  Public Functions (called from player.html):               ║
 * ║    loadPlayer(course, startIndex)  — initialise the player  ║
 * ║    loadVideo(course, index)        — swap the iframe src     ║
 * ║    markVideoDone()                 — complete current video  ║
 * ║    renderPlaylist(course, activeI) — rebuild sidebar list    ║
 * ║    checkQuizEligibility(course)    — show/hide quiz button   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ── Module-level state ───────────────────────────────────────── */
let _activeCourse  = null;  // The course object currently loaded
let _currentVidIdx = 0;     // Index of the video currently in the iframe


/* ══════════════════════════════════════════════════════════════
   LOAD PLAYER
   ──────────────────────────────────────────────────────────────
   Entry point called from player.html after resolving the course
   from the URL parameter.

   Responsibilities:
     1. Store the active course reference
     2. Set the playlist sidebar header
     3. Render playlist items
     4. Load the first (or specified) video
══════════════════════════════════════════════════════════════ */

/**
 * loadPlayer
 * ──────────
 * Initialises the entire player page for a given course.
 *
 * @param {object} course     — Course object from COURSES in data.js
 * @param {number} startIndex — Playlist index to start from (usually 0)
 */
function loadPlayer(course, startIndex) {
  _activeCourse = course;

  // Set sidebar header title
  const titleEl = document.getElementById('playlist-course-title');
  if (titleEl) titleEl.textContent = course.title;

  // Set the "Course" label above the video
  const courseLabelEl = document.getElementById('current-course-label');
  if (courseLabelEl) courseLabelEl.textContent = course.title;

  // Render playlist and load the start video
  renderPlaylist(course, startIndex);
  loadVideo(course, startIndex);
}


/* ══════════════════════════════════════════════════════════════
   LOAD VIDEO
   ──────────────────────────────────────────────────────────────
   Updates the iframe src, meta labels, and mark-done button
   state for the selected playlist index.

   YouTube embed URL format:
     https://www.youtube.com/embed/{ytId}?rel=0&modestbranding=1
     rel=0           — don't show related videos from other channels
     modestbranding=1 — minimal YouTube chrome
══════════════════════════════════════════════════════════════ */

/**
 * loadVideo
 * ─────────
 * Swaps the iframe to the specified playlist entry and updates
 * all related UI labels.
 *
 * @param {object} course — Course object
 * @param {number} index  — Zero-based index into course.playlist
 */
function loadVideo(course, index) {
  _activeCourse  = course;
  _currentVidIdx = index;

  const vid = course.playlist[index];

  // ── Update iframe src ─────────────────────────────────
  const iframe = document.getElementById('yt-iframe');
  if (iframe) {
    iframe.src = iframe.src =
  `https://www.youtube.com/embed/${vid.ytId}?rel=0&modestbranding=1&controls=1&iv_load_policy=3`;
    
    iframe.title = vid.title; // accessibility
  }

  // ── Update video title and lesson counter ────────────
  const titleEl = document.getElementById('current-video-title');
  if (titleEl) titleEl.textContent = vid.title;

  const countEl = document.getElementById('video-count-label');
  if (countEl) countEl.textContent = `Lesson ${index + 1} of ${course.playlist.length}`;

  // ── Update Mark as Complete button ────────────────────
  const user  = getSession();
  const ud    = getUserData(user.email);
  const done  = !!(ud.progress[course.id] && ud.progress[course.id][index]);
  const btn   = document.getElementById('btn-mark-done');
  if (btn) {
    btn.disabled    = done;
    btn.textContent = done ? '✓ Completed' : '✓ Mark as Complete';
  }

  // ── Re-render sidebar to update active highlight ──────
  renderPlaylist(course, index);
  checkQuizEligibility(course);
}


/* ══════════════════════════════════════════════════════════════
   MARK VIDEO AS DONE
   ──────────────────────────────────────────────────────────────
   Called when the student clicks "Mark as Complete".

   Behaviour:
     1. Save progress[courseId][videoIndex] = true
     2. Disable the button and update its label
     3. Re-render the playlist sidebar (checkbox → ✓)
     4. Check if the quiz button should be shown
     5. Show a toast notification
     6. Auto-advance to the next lesson after 800ms
══════════════════════════════════════════════════════════════ */

/**
 * markVideoDone
 * ──────────────
 * Records the current video as completed and advances the playlist.
 */
function markVideoDone() {
  const user = getSession();
  if (!user) return;

  const ud = getUserData(user.email);

  // Ensure nested progress object exists
  if (!ud.progress[_activeCourse.id]) {
    ud.progress[_activeCourse.id] = {};
  }

  // Mark this video index as done
  ud.progress[_activeCourse.id][_currentVidIdx] = true;
  saveUserData();

  // ── Update button state ───────────────────────────────
  const btn = document.getElementById('btn-mark-done');
  if (btn) {
    btn.disabled    = true;
    btn.textContent = '✓ Completed';
  }

  // ── Refresh sidebar + quiz eligibility ───────────────
  renderPlaylist(_activeCourse, _currentVidIdx);
  checkQuizEligibility(_activeCourse);

  showToast('Great progress! Lesson marked complete. 🎉');

  // ── Auto-advance to next video after short delay ──────
  const nextIdx = _currentVidIdx + 1;
  if (nextIdx < _activeCourse.playlist.length) {
    setTimeout(() => loadVideo(_activeCourse, nextIdx), 800);
  }
}


/* ══════════════════════════════════════════════════════════════
   RENDER PLAYLIST SIDEBAR
   ──────────────────────────────────────────────────────────────
   Rebuilds the lesson list in the sidebar. Each item shows:
     • Lesson number pill (turns ✓ when completed)
     • Lesson title
     • Duration
     • Active highlight on the current video
══════════════════════════════════════════════════════════════ */

/**
 * renderPlaylist
 * ───────────────
 * Injects playlist items into #playlist-items.
 *
 * @param {object} course    — Course object
 * @param {number} activeIdx — Currently playing video index
 */
function renderPlaylist(course, activeIdx) {
  const user      = getSession();
  const ud        = getUserData(user ? user.email : '');
  const progress  = ud.progress[course.id] || {};
  const completed = Object.keys(progress).length;

  // ── Update progress counter in sidebar header ────────
  const progressText = document.getElementById('playlist-progress-text');
  if (progressText) {
    progressText.textContent = `${completed} of ${course.playlist.length} completed`;
  }

  // ── Build playlist item HTML ──────────────────────────
  const container = document.getElementById('playlist-items');
  if (!container) return;

  container.innerHTML = course.playlist.map((video, i) => {
    const isDone   = !!progress[i];
    const isActive = (i === activeIdx);

    return `
      <div
        class="playlist-item ${isActive ? 'active-video' : ''} ${isDone ? 'completed' : ''}"
        onclick="loadVideo(_activeCourse, ${i})"
        role="listitem"
        aria-label="Lesson ${i + 1}: ${video.title}${isDone ? ' (completed)' : ''}"
        style="cursor:pointer;"
      >
        <!-- Lesson number bubble or check mark -->
        <div class="playlist-num ${isDone ? 'done' : ''}" aria-hidden="true">
          ${isDone ? '✓' : i + 1}
        </div>

        <div class="playlist-item-info">
          <h4>${video.title}</h4>
          <span>⏱ ${video.duration}</span>
        </div>
      </div>`;
  }).join('');
}


/* ══════════════════════════════════════════════════════════════
   QUIZ ELIGIBILITY CHECK
   ──────────────────────────────────────────────────────────────
   The quiz button is unlocked once the student completes at least
   70% of the course videos. This threshold balances engagement
   (don't quiz too early) with accessibility (allow quiz before
   100% for students who already know some material).

   Button states:
     Hidden         — < 70% videos done
     "📝 Take Quiz" — ≥ 70% done, quiz not yet passed
     "🏆 Get Cert"  — quiz already passed (score ≥ 60%)
══════════════════════════════════════════════════════════════ */

/**
 * checkQuizEligibility
 * ─────────────────────
 * Shows or hides the quiz/certificate button based on progress.
 *
 * @param {object} course — Course object
 */
function checkQuizEligibility(course) {
  const user    = getSession();
  const ud      = getUserData(user ? user.email : '');
  const prog    = ud.progress[course.id] || {};
  const done    = Object.keys(prog).length;
  const total   = course.playlist.length;
  const quizBtn = document.getElementById('btn-take-quiz');
  if (!quizBtn) return;

  const alreadyPassed = ud.quizScores && ud.quizScores[course.id] >= 60;
  const threshold     = Math.floor(total * 0.7); // 70% of videos

  if (done >= threshold) {
    quizBtn.style.display = 'block';

    if (alreadyPassed) {
      // Quiz passed → offer certificate
      quizBtn.textContent = '🏆 Get Certificate';
      quizBtn.href        = `certificate.html?course=${course.id}`;
    } else {
      // Not yet passed → go to quiz
      quizBtn.textContent = '📝 Take Final Quiz';
      quizBtn.href        = `quiz.html?course=${course.id}`;
    }
  } else {
    // Not enough progress yet
    quizBtn.style.display = 'none';
  }
}
