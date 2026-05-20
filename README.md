# 🕉️ Sanskrit Vidyalaya — संस्कृत विद्यालय

A fully client-side Sanskrit learning platform built with plain HTML, CSS, and JavaScript.  
No server, no frameworks, no build tools required — just open `index.html` in a browser.

---

## 📁 Project Structure

```
sanskrit-vidyalaya/
│
├── index.html                  ← Landing page (public, unauthenticated)
│
├── pages/
│   ├── login.html              ← Login form
│   ├── register.html           ← Registration form
│   ├── dashboard.html          ← Main authenticated area (courses + my learning)
│   ├── player.html             ← Video player + playlist sidebar
│   ├── quiz.html               ← 5-question multiple-choice quiz
│   └── certificate.html        ← Printable completion certificate
│
├── css/
│   └── styles.css              ← Master stylesheet (all pages, fully documented)
│
├── js/
│   ├── data.js                 ← All course content + quiz questions (static data)
│   ├── auth.js                 ← Authentication, session management, localStorage
│   ├── app.js                  ← Dashboard logic (render courses, my learning)
│   ├── player.js               ← Video player logic (load video, mark done, playlist)
│   └── quiz.js                 ← Quiz engine (render questions, scoring, routing)
│
└── README.md                   ← This file
```

---

## 🚀 Getting Started

### Option A — Open Directly (Simplest)
1. Download or clone the project folder.
2. Double-click `index.html` to open it in your browser.
3. Register an account, enrol in a course, and start learning!

### Option B — Local HTTP Server (Recommended)
Some browsers restrict local file access. Serve the project with a simple HTTP server:

```bash
# Python 3
cd sanskrit-vidyalaya
python -m http.server 8080
# Open http://localhost:8080
```

```bash
# Node.js (npx)
npx serve .
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Register / Login** | Account system stored in `localStorage`. No server needed. |
| **6 Courses** | Beginner → Advanced covering Alphabet, Grammar, Conversation, Vedic Chanting, Poetry, Bhagavad Gita |
| **YouTube Videos** | Each course has 6–8 embedded YouTube lessons |
| **Progress Tracking** | Per-lesson completion tracking with progress bars |
| **Auto-advance** | Marks a video done → automatically loads next lesson |
| **Quiz** | 5-question multiple-choice quiz per course; instant colour feedback |
| **Certificates** | Auto-generated printable certificate on passing (≥60%) |
| **Responsive** | Works on desktop, tablet, and mobile |

---

## 📚 Courses Included

| # | Course | Level | Lessons |
|---|---|---|---|
| 1 | Sanskrit Alphabet (वर्णमाला) | Beginner | 8 |
| 2 | Basic Sanskrit Grammar (सरल व्याकरण) | Beginner | 7 |
| 3 | Sanskrit Conversation (संभाषण) | Intermediate | 6 |
| 4 | Vedic Chanting (वैदिक उच्चारण) | Intermediate | 7 |
| 5 | Sanskrit Poetry (काव्यशास्त्र) | Advanced | 6 |
| 6 | Bhagavad Gita Study (भगवद्गीता) | Advanced | 8 |

---

## 🗄️ Data Storage

All data is stored in the browser's `localStorage` — no backend required.

| Key | Contents |
|---|---|
| `sv_users` | `{ [email]: { name, email, pw } }` |
| `sv_userdata` | `{ [email]: { enrolled, progress, quizScores } }` |
| `sv_session` | `{ name, email }` (active session) |

> ⚠️ **Note:** `localStorage` is browser-specific and not shared between devices. For a production app, replace with a real backend (e.g. Firebase, Supabase).

---

## 🎨 Design System

### Fonts (Google Fonts)
- **Cinzel Decorative** — headings, logos, certificates
- **Crimson Pro** — body text, form labels
- **Noto Sans Devanagari** — Sanskrit/Devanagari text

### Colour Palette
| Token | Value | Usage |
|---|---|---|
| `--saffron` | `#E8751A` | Primary CTA buttons |
| `--deep-red` | `#C0392B` | Secondary CTA, errors |
| `--gold` | `#D4A017` | Borders, highlights |
| `--cream` | `#FDF6E3` | Page background |
| `--dark-brown` | `#2D1B00` | Headers, sidebar |
| `--success` | `#2E7D32` | Completed states |

---

## 🔧 Customisation

### Adding a New Course
1. Open `js/data.js`
2. Add an object to the `COURSES` array with a unique `id` (e.g. `7`)
3. Add a matching quiz entry in `QUIZZES[7]` with exactly 5 questions
4. Choose a `thumb` value 1–6 for the gradient colour

```js
// In COURSES array:
{
  id: 7,
  title: "Sanskrit Linguistics",
  devanagari: "भाषाविज्ञान",
  desc: "Study the phonology and morphology of Sanskrit.",
  level: "Advanced",
  videos: 5,
  thumb: 3,          // picks .course-thumb-3 gradient
  icon: "🔬",
  playlist: [
    { title: "Lesson 1", ytId: "YOUR_YT_ID", duration: "15:00" },
    // ...
  ]
}

// In QUIZZES object:
7: [
  { q: "Question?", dev: "देवनागरी", opts: ["A","B","C","D"], ans: 0 },
  // ... (5 questions total)
]
```

### Changing YouTube Videos
In `js/data.js`, each playlist item has a `ytId` field. Replace it with the ID from any YouTube URL:
```
https://www.youtube.com/watch?v=XXXXXXXXXXX
                                ^^^^^^^^^^^
                                This part is the ytId
```

---

## 🏆 Quiz & Certificate Logic

- The quiz button unlocks when **≥70%** of a course's videos are marked complete.
- **Passing score: 60%** (3 out of 5 questions correct).
- On pass → redirects to `certificate.html` with the student's name, course, score, date, and a unique certificate ID.
- Certificates can be **printed as PDF** using the browser's print dialog (non-certificate elements are hidden via `@media print` CSS).

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

---

## 📄 License

Free to use for educational purposes.  
YouTube content belongs to respective channel owners.
