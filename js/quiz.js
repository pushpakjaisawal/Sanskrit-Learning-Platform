/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  quiz.js — Quiz Engine                                      ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  Manages the 5-question multiple-choice quiz flow:          ║
 * ║    1. Render each question with 4 options (A/B/C/D)         ║
 * ║    2. On option click: show colour feedback & enable Next   ║
 * ║    3. After final question: calculate score                 ║
 * ║    4. Score ≥ 60% → save + redirect to certificate.html     ║
 * ║    5. Score  < 60% → save + redirect back to player.html    ║
 * ║       with a try-again toast                                ║
 * ║                                                              ║
 * ║  Depends on:                                                 ║
 * ║    data.js  — COURSES, QUIZZES                               ║
 * ║    auth.js  — getSession(), getUserData(), saveUserData(),   ║
 * ║               showToast()                                    ║
 * ║                                                              ║
 * ║  Module-level state (private):                              ║
 * ║    _course    — Active course object                         ║
 * ║    _questions — Array of question objects for this course    ║
 * ║    _state     — { qIdx, score, answered }                   ║
 * ║                                                              ║
 * ║  Public Functions (called from quiz.html):                 ║
 * ║    initQuiz(course, questions)   — start the quiz            ║
 * ║    renderQuestion()              — display current question  ║
 * ║    selectOption(selectedIndex)   — handle answer selection   ║
 * ║    nextQuestion()                — advance to next Q or end  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ── Module-level state ───────────────────────────────────────── */
let _course    = null;  // Active course object
let _questions = [];    // Questions array for current course
let _state     = {
  qIdx:     0,     // Current question index (0-based)
  score:    0,     // Number of correct answers so far
  answered: false  // Whether the current question has been answered
};


/* ══════════════════════════════════════════════════════════════
   INITIALISE QUIZ
   ──────────────────────────────────────────────────────────────
   Called once per quiz session from quiz.html's init script.
   Resets all state before rendering the first question.
══════════════════════════════════════════════════════════════ */

/**
 * initQuiz
 * ─────────
 * Resets state and renders the first question.
 *
 * @param {object}   course    — Course object from COURSES (data.js)
 * @param {object[]} questions — Array of question objects from QUIZZES
 */
function initQuiz(course, questions) {
  _course    = course;
  _questions = questions;
  _state     = { qIdx: 0, score: 0, answered: false };

  renderQuestion();
}


/* ══════════════════════════════════════════════════════════════
   RENDER QUESTION
   ──────────────────────────────────────────────────────────────
   Updates the UI to display the current question:
     • "QUESTION N" label
     • Progress pill "Q N / Total"
     • Optional Devanagari display word
     • Question text
     • Four answer buttons (A/B/C/D)
     • Disabled "Next" button (re-enabled on answer)
══════════════════════════════════════════════════════════════ */

/**
 * renderQuestion
 * ───────────────
 * Builds and injects the current question into the DOM.
 */
function renderQuestion() {
  const q   = _questions[_state.qIdx];
  _state.answered = false;

  // ── Update header labels ──────────────────────────────
  const numEl = document.getElementById('question-num');
  if (numEl) numEl.textContent = `QUESTION ${_state.qIdx + 1}`;

  const pillEl = document.getElementById('quiz-progress-pill');
  if (pillEl) pillEl.textContent = `Q ${_state.qIdx + 1} / ${_questions.length}`;

  // ── Optional Devanagari word ──────────────────────────
  const devEl = document.getElementById('quiz-devanagari');
  if (devEl) {
    devEl.textContent    = q.dev;
    devEl.style.display  = q.dev ? 'block' : 'none';
  }

  // ── Question text ─────────────────────────────────────
  const textEl = document.getElementById('question-text');
  if (textEl) textEl.textContent = q.q;

  // ── Answer options ────────────────────────────────────
  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionsEl = document.getElementById('options-list');
  if (optionsEl) {
    optionsEl.innerHTML = q.opts.map((optText, i) => `
      <button
        class="option-btn"
        id="opt-${i}"
        onclick="selectOption(${i})"
        aria-label="Option ${optionLetters[i]}: ${optText}"
        role="listitem"
      >
        <span class="option-letter" aria-hidden="true">${optionLetters[i]}</span>
        ${optText}
      </button>`
    ).join('');
  }

  // ── Reset Next button ─────────────────────────────────
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) {
    nextBtn.disabled       = true;
    nextBtn.setAttribute('aria-disabled', 'true');
    // Change label on last question
    nextBtn.textContent    = (_state.qIdx === _questions.length - 1)
      ? 'Submit Quiz'
      : 'Next →';
  }
}


/* ══════════════════════════════════════════════════════════════
   SELECT OPTION (Answer a question)
   ──────────────────────────────────────────────────────────────
   Called when the student clicks one of the A/B/C/D buttons.

   Behaviour:
     1. Ignore repeat clicks (guard via _state.answered)
     2. Mark the question as answered
     3. Disable all option buttons
     4. Colour the selected button:
          Correct   → green (.correct class)
          Incorrect → red   (.wrong class)
     5. Always reveal the correct answer in green
     6. Increment score if correct
     7. Enable the "Next" button
══════════════════════════════════════════════════════════════ */

/**
 * selectOption
 * ─────────────
 * Handles the student's answer selection for the current question.
 *
 * @param {number} selected — Zero-based index of the chosen option
 */
function selectOption(selected) {
  // Guard: ignore if already answered
  if (_state.answered) return;
  _state.answered = true;

  const correct = _questions[_state.qIdx].ans;
  const opts    = document.querySelectorAll('.option-btn');

  // ── Disable all buttons to prevent re-answering ───────
  opts.forEach(btn => {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
  });

  // ── Colour the selected option ─────────────────────────
  if (selected === correct) {
    opts[selected].classList.add('correct');
    opts[selected].setAttribute('aria-label',
      opts[selected].getAttribute('aria-label') + ' — Correct!');
    _state.score++;
  } else {
    opts[selected].classList.add('wrong');
    opts[selected].setAttribute('aria-label',
      opts[selected].getAttribute('aria-label') + ' — Wrong');
    // Also highlight the correct answer
    opts[correct].classList.add('correct');
    opts[correct].setAttribute('aria-label',
      opts[correct].getAttribute('aria-label') + ' — Correct answer');
  }

  // ── Enable Next / Submit button ───────────────────────
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.removeAttribute('aria-disabled');
  }
}


/* ══════════════════════════════════════════════════════════════
   NEXT QUESTION / FINISH QUIZ
   ──────────────────────────────────────────────────────────────
   Advances the quiz or ends it:
     • If not on the last question → increment qIdx, re-render
     • If on the last question → call finishQuiz()
══════════════════════════════════════════════════════════════ */

/**
 * nextQuestion
 * ─────────────
 * Moves to the next question, or ends the quiz if on the last one.
 */
function nextQuestion() {
  if (_state.qIdx < _questions.length - 1) {
    _state.qIdx++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}


/* ══════════════════════════════════════════════════════════════
   FINISH QUIZ
   ──────────────────────────────────────────────────────────────
   Called after the last question is answered and "Submit" clicked.

   1. Calculate percentage score
   2. Save score to userData.quizScores[courseId]
   3. If score ≥ 60%  → redirect to certificate.html
   4. If score  < 60% → redirect to player.html with toast

   Passing threshold: 60% (3 correct out of 5)
══════════════════════════════════════════════════════════════ */

/**
 * finishQuiz
 * ──────────
 * Computes the final score and routes the student appropriately.
 */
function finishQuiz() {
  const pct  = Math.round((_state.score / _questions.length) * 100);
  const user = getSession();
  if (!user) return;

  // ── Save score to localStorage ────────────────────────
  const ud = getUserData(user.email);
  if (!ud.quizScores) ud.quizScores = {};
  ud.quizScores[_course.id] = pct;
  saveUserData();

  // ── Route based on pass/fail ──────────────────────────
  if (pct >= 60) {
    // PASS → show certificate
    window.location = `certificate.html?course=${_course.id}`;
  } else {
    // FAIL → return to player with encouragement
    showToast(`Score: ${pct}%. You need 60% to pass. Keep studying! 💪`);
    setTimeout(() => {
      window.location = `player.html?course=${_course.id}`;
    }, 2500);
  }
}
