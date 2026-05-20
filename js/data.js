/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  data.js — Sanskrit Vidyalaya Course & Quiz Data             ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  This file is the single source of truth for all static     ║
 * ║  course content and quiz questions.                          ║
 * ║                                                              ║
 * ║  Exports (global variables, accessed by other JS files):    ║
 * ║    • COURSES  — Array of course objects                      ║
 * ║    • QUIZZES  — Object keyed by course ID → question arrays  ║
 * ║                                                              ║
 * ║  Used by:                                                    ║
 * ║    app.js    – renderCourses(), renderMyLearning()           ║
 * ║    player.js – loadPlayer(), renderPlaylist()                ║
 * ║    quiz.js   – initQuiz()                                    ║
 * ║                                                              ║
 * ║  To add a new course:                                        ║
 * ║    1. Add an entry to COURSES with a unique id               ║
 * ║    2. Add a matching entry in QUIZZES[id] with 5 questions   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/* ══════════════════════════════════════════════════════════════
   COURSES
   ──────────────────────────────────────────────────────────────
   Each course object has the following shape:

   {
     id          : number   — Unique identifier (used in URLs & localStorage)
     title       : string   — English course title
     devanagari  : string   — Course name in Devanagari script
     desc        : string   — Short description shown on course card
     level       : string   — "Beginner" | "Intermediate" | "Advanced"
     videos      : number   — Total lesson count (should match playlist.length)
     thumb       : number   — Index 1-6 for CSS gradient class (.course-thumb-N)
     icon        : string   — Emoji icon shown on course card and sidebar
     playlist    : Array<{
       title     : string   — Lesson title shown in sidebar & above player
       ytId      : string   — YouTube video ID (the part after ?v= in the URL)
       duration  : string   — Human-readable duration e.g. "12:30"
     }>
   }
══════════════════════════════════════════════════════════════ */

const COURSES = [
  {
    id: 1,
    title: "Sanskrit varnāmalā",
    devanagari: "वर्णमाला",
    desc: "Learn the Devanagari script, vowels, consonants, and basic pronunciation rules.",
    level: "Beginner",
    videos: 5,
    thumb: 1,
    icon: "🔤",
    playlist: [
      { title: "Learn Sanskrit Naturally",  ytId: "pu7do_igOpA", duration: "18:30" },
      { title: "How to pronounce Sanskrit Alphabets Correctly",              ytId: "qQctuH3K06E", duration: "14:21" },
      { title: "How to pronounce Sanskrit Alphabets Correctly",       ytId: "MT0XvzZQtoI", duration: "7:32" },
      { title: "Learn Sanskrit Naturally",        ytId: "L8N0QPtvkVU", duration: "16:11" },
      { title: "Learn Sanskrit Naturally",                 ytId: "8G1XdH9TT8c", duration: "10:23"  },
 ]},

  {
    id: 2,
    title: "Speaking Sanskrit Sentences",
    devanagari: "सरल व्याकरण",
    desc: "Master noun cases, verb conjugations, and simple sentence construction.",
    level: "Beginner",
    videos: 6,
    thumb: 2,
    icon: "📖",
    playlist: [
      { title: "Speak Your First Sanskrit Sentences Day 1",   ytId: "RRxcNRxNBX8", duration: "3:02" },
      { title: "Speak Your First Sanskrit Sentences",            ytId: "tbQyT8TIqu0", duration: "1:17" },
      { title: "Speak Sanskrit Sentences Using Patterns ",              ytId: "X8m4uoa25BQ", duration: "9:29" },
      { title: "Speak Sanskrit Sentences using Context",             ytId: "MpLMHN2SL7U", duration: "9:18" },
      { title: "Speak Sanskrit with Verbs",               ytId: "j8rGJuK2QFE", duration: "11:42" },
      { title: "Speak Sanskrit with Questions",                   ytId: "Mh5GfGbiIU0", duration: "12:43" },
      
    ]
  },

  {
    id: 3,
    title: "Technology in Sanskrit Conversation",
    devanagari: "संभाषण",
    desc: "Learn to speak and understand spoken Sanskrit through daily conversation practice.",
    level: "Intermediate",
    videos: 4,
    thumb: 3,
    icon: "🗣️",
    playlist: [
      { title: "Your Doctor's New Secret Weapon is AI",     ytId: "QD-VGovxhV8", duration: "1:01" },
      { title: "3 AI Farming Secrets & Their Sanskrit Names!",               ytId: "u5tlDjWHkww", duration: "00:40" },
      { title: "क्यों AI कभी आत्मवान नहीं बन सकती",           ytId: "Sf16w_rtJEo", duration: "1:16" },
      { title: "Will AI Replace Humans ",      ytId: "lHxW3P9R2sA", duration: "4:59" },
      
    ]
  },

  {
    id: 4,
    title: "Vibhakti and Pronunciation",
    devanagari: "वैदिक उच्चारण",
    desc: "Learn correct pronunciation of Vedic mantras, Swara (accent), and chanting techniques.",
    level: "Intermediate",
    videos: 2,
    thumb: 4,
    icon: "🕉️",
    playlist: [
      { title: "Speak Sanskrit from Day 1 ",            ytId: "6Bqm13eAuF0", duration: "9:34" },
      { title: "TSpeak Sanskrit Day 2 Who and Whom Do You See",     ytId: "zXlwueJ3kK4", duration: "9:08" },
      
    ]
  },

  {
    id: 5,
    title: "Sanskrit Poetry",
    devanagari: "काव्यशास्त्र",
    desc: "Explore classical Sanskrit poetry, meter (Chhanda), and works of Kalidasa.",
    level: "Advanced",
    videos: 1,
    thumb: 5,
    icon: "✍️",
    playlist: [
      { title: "Mental Clarity from Ramayana Sanskrit Story",   ytId: "avDZh4KifHs", duration: "8:01" },
      
    ]
  },

  {
    id: 6,
    title: "Cooking in Sanskrit",
    devanagari: "भगवद्गीता",
    desc: "Deep study of the Bhagavad Gita chapters, meaning, grammar, and philosophy.",
    level: "Advanced",
    videos: 1,
    thumb: 6,
    icon: "📿",
    playlist: [
      { title: "Cabbage Curry Recipe in Sanskrit ", ytId: "rKQolRVYO8s", duration: "7:39" },
   
    ]
  }
];


/* ══════════════════════════════════════════════════════════════
   QUIZZES
   ──────────────────────────────────────────────────────────────
   Object keyed by course ID. Each value is an array of question
   objects with the following shape:

   {
     q    : string   — Question text (English)
     dev  : string   — Optional Sanskrit/Devanagari word being
                       tested. Empty string "" to hide it.
     opts : string[] — Array of 4 answer option strings (A/B/C/D)
     ans  : number   — Zero-based index of the correct option
   }

   Passing threshold: ≥ 60% correct (3 out of 5).
══════════════════════════════════════════════════════════════ */

const QUIZZES = {

  /* ── Course 1: Sanskrit Alphabet ─────────────────────── */
  1: [
    {
      q: "How many vowels (Swar) are there in Sanskrit?",
      dev: "स्वर",
      opts: ["10", "16", "14", "18"],
      ans: 1  // "16"
    },
    {
      q: "Which of these is NOT a Sanskrit vowel?",
      dev: "",
      opts: ["अ (a)", "इ (i)", "क (ka)", "ऊ (ū)"],
      ans: 2  // "क (ka)" is a consonant
    },
    {
      q: "The Devanagari script is written in which direction?",
      dev: "",
      opts: ["Right to Left", "Left to Right", "Top to Bottom", "Bottom to Top"],
      ans: 1  // Left to Right
    },
    {
      q: "What does the symbol 'ॐ' represent?",
      dev: "ॐ",
      opts: ["The first letter", "The sacred syllable Om", "The number zero", "A Matra sign"],
      ans: 1  // Sacred syllable Om
    },
    {
      q: "A 'Matra' in Devanagari is:",
      dev: "मात्रा",
      opts: [
        "A consonant cluster",
        "A vowel sign attached to a consonant",
        "A punctuation mark",
        "A tone marker"
      ],
      ans: 1  // Vowel sign attached to consonant
    }
  ],

  /* ── Course 2: Basic Sanskrit Grammar ────────────────── */
  2: [
    {
      q: "How many cases (Vibhakti) are there in Sanskrit grammar?",
      dev: "विभक्ति",
      opts: ["6", "7", "8", "9"],
      ans: 2  // 8
    },
    {
      q: "The first case (Prathamā Vibhakti) is used for:",
      dev: "प्रथमा",
      opts: ["Object", "Subject", "Instrument", "Possession"],
      ans: 1  // Subject
    },
    {
      q: "Sanskrit verbs are classified by which number systems?",
      dev: "वचन",
      opts: [
        "Singular only",
        "Singular and Plural",
        "Singular, Dual, and Plural",
        "Four numbers"
      ],
      ans: 2  // Singular, Dual, and Plural
    },
    {
      q: "What is a 'Dhatu' in Sanskrit grammar?",
      dev: "धातु",
      opts: ["A noun", "A verb root", "A case ending", "A vowel"],
      ans: 1  // Verb root
    },
    {
      q: "The word 'Rama' in the nominative case (subject) is:",
      dev: "राम",
      opts: ["रामम्", "रामः", "रामेण", "रामाय"],
      ans: 1  // रामः
    }
  ],

  /* ── Course 3: Sanskrit Conversation ─────────────────── */
  3: [
    {
      q: "How do you say 'Thank you' in Sanskrit?",
      dev: "धन्यवादः",
      opts: ["नमस्ते", "धन्यवादः", "स्वागतम्", "शुभम्"],
      ans: 1  // धन्यवादः
    },
    {
      q: "What does 'Aham' (अहम्) mean?",
      dev: "अहम्",
      opts: ["You", "He", "I / Me", "They"],
      ans: 2  // I / Me
    },
    {
      q: "The Sanskrit word for 'water' is:",
      dev: "",
      opts: ["अग्नि (fire)", "जल (water)", "वायु (air)", "पृथ्वी (earth)"],
      ans: 1  // जल
    },
    {
      q: "How do you say 'Good Morning' in Sanskrit?",
      dev: "",
      opts: ["शुभ संध्या", "शुभ प्रभातम्", "शुभ रात्रि", "शुभ दिनम्"],
      ans: 1  // शुभ प्रभातम्
    },
    {
      q: "'Tvam' (त्वम्) means:",
      dev: "त्वम्",
      opts: ["I", "You", "He", "She"],
      ans: 1  // You
    }
  ],

  /* ── Course 4: Vedic Chanting ─────────────────────────── */
  4: [
    {
      q: "The Gayatri Mantra belongs to which Veda?",
      dev: "गायत्री",
      opts: ["Sama Veda", "Yajur Veda", "Rigveda", "Atharva Veda"],
      ans: 2  // Rigveda
    },
    {
      q: "In Vedic Sanskrit, 'Udatta' refers to:",
      dev: "उदात्त",
      opts: ["Low pitch accent", "High pitch accent", "Level pitch", "No accent"],
      ans: 1  // High pitch accent
    },
    {
      q: "The Vedic meter with 8 syllables per quarter is:",
      dev: "",
      opts: ["Jagati", "Tristubh", "Gayatri", "Anushtubh"],
      ans: 2  // Gayatri (24 syllables, 8 per quarter)
    },
    {
      q: "What does 'OM Shanti' (ओम् शान्तिः) signify?",
      dev: "ओम् शान्तिः",
      opts: ["Good luck", "Peace and harmony", "Morning greeting", "Victory"],
      ans: 1  // Peace and harmony
    },
    {
      q: "The four Vedas are collectively called:",
      dev: "",
      opts: ["Upanishads", "Shrutis", "Smritis", "Puranas"],
      ans: 1  // Shrutis (that which is heard/revealed)
    }
  ],

  /* ── Course 5: Sanskrit Poetry ────────────────────────── */
  5: [
    {
      q: "Kalidasa's most famous epic poem is:",
      dev: "कालिदास",
      opts: ["Ramayana", "Meghaduta", "Arthashastra", "Rigveda"],
      ans: 1  // Meghaduta
    },
    {
      q: "A 'Shloka' typically consists of:",
      dev: "श्लोक",
      opts: [
        "One line of 16 syllables",
        "Two lines of 8 syllables each",
        "Three lines",
        "Four lines of 8 syllables"
      ],
      ans: 3  // Four lines (padas) of 8 syllables = Anushtubh
    },
    {
      q: "What is 'Anuprasa' in Sanskrit poetry?",
      dev: "अनुप्रास",
      opts: [
        "A type of meter",
        "Alliteration (repetition of sounds)",
        "A philosophical concept",
        "A deity name"
      ],
      ans: 1  // Alliteration
    },
    {
      q: "The Ramayana was composed by:",
      dev: "",
      opts: ["Kalidasa", "Valmiki", "Vyasa", "Panini"],
      ans: 1  // Valmiki
    },
    {
      q: "'Chhanda' in Sanskrit means:",
      dev: "छन्द",
      opts: ["Grammar rules", "Poetic meter", "Script style", "Word roots"],
      ans: 1  // Poetic meter
    }
  ],

  /* ── Course 6: Bhagavad Gita Study ───────────────────── */
  6: [
    {
      q: "The Bhagavad Gita is part of which epic?",
      dev: "भगवद्गीता",
      opts: ["Ramayana", "Arthashastra", "Mahabharata", "Rigveda"],
      ans: 2  // Mahabharata
    },
    {
      q: "How many chapters does the Bhagavad Gita have?",
      dev: "",
      opts: ["12", "14", "18", "21"],
      ans: 2  // 18
    },
    {
      q: "'Nishkama Karma' means:",
      dev: "निष्काम कर्म",
      opts: ["Ritual worship", "Desireless action", "Material success", "War conduct"],
      ans: 1  // Desireless action
    },
    {
      q: "Chapter 2 of the Gita is called:",
      dev: "",
      opts: ["Karma Yoga", "Bhakti Yoga", "Sankhya Yoga", "Jnana Yoga"],
      ans: 2  // Sankhya Yoga
    },
    {
      q: "The speaker of the Bhagavad Gita is:",
      dev: "",
      opts: ["Arjuna", "Vyasa", "Brahma", "Krishna"],
      ans: 3  // Krishna
    }
  ]
};
