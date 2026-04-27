// LearnHub — Mock Data
window.LH_DATA = {
  user: {
    name: "Yannik",
    avatar: "Y",
    streak: 12,
    level: 7
  },

  subjects: [
    { id: "s1", name: "Mathematik",  color: "#6366F1", icon: "sigma",     topics: 14, progress: 68, teacher: "Prof. Müller" },
    { id: "s2", name: "Englisch",    color: "#10B981", icon: "languages", topics: 9,  progress: 82, teacher: "Mrs. Smith" },
    { id: "s3", name: "Geschichte",  color: "#F59E0B", icon: "landmark",  topics: 11, progress: 45, teacher: "Hr. Becker" },
    { id: "s4", name: "Biologie",    color: "#22C55E", icon: "leaf",      topics: 8,  progress: 71, teacher: "Fr. Klein" },
    { id: "s5", name: "Informatik",  color: "#06B6D4", icon: "code",      topics: 16, progress: 90, teacher: "Hr. Vogel" },
    { id: "s6", name: "Spanisch",    color: "#EF4444", icon: "globe",     topics: 7,  progress: 33, teacher: "Sra. López" }
  ],

  // events generiert dynamisch in calendar.js (relative Daten)
  todayTasks: [
    { id: "t1", title: "Analysis: Integralrechnung Kapitel 4", subject: "s1", time: "09:00 – 10:30", done: false },
    { id: "t2", title: "Vokabeltraining Spanisch (30 Karten)",  subject: "s6", time: "11:00 – 11:30", done: true  },
    { id: "t3", title: "Englisch Essay Entwurf",                subject: "s2", time: "13:30 – 15:00", done: false },
    { id: "t4", title: "Bio: Photosynthese Zusammenfassung",    subject: "s4", time: "16:00 – 17:00", done: false },
    { id: "t5", title: "Coding Challenge — Algorithmen",         subject: "s5", time: "19:00 – 20:00", done: false }
  ],

  upcomingExams: [
    { id: "e1", title: "Mathe Klausur",        subject: "s1", date: "+5d",  type: "Klausur" },
    { id: "e2", title: "Geschichte Referat",    subject: "s3", date: "+9d",  type: "Abgabe" },
    { id: "e3", title: "Englisch Listening",    subject: "s2", date: "+14d", type: "Test" }
  ],

  goals: [
    { id: "g1", title: "Integralrechnung sicher beherrschen", subject: "s1", deadline: "+10d", progress: 65, status: "in-progress" },
    { id: "g2", title: "500 Spanisch-Vokabeln lernen",        subject: "s6", deadline: "+30d", progress: 28, status: "in-progress" },
    { id: "g3", title: "Englisch C1 Probetest bestehen",      subject: "s2", deadline: "+45d", progress: 0,  status: "planned" },
    { id: "g4", title: "Bio Zellbiologie abschließen",        subject: "s4", deadline: "-2d",  progress: 100, status: "done" },
    { id: "g5", title: "Python Grundlagen Kurs",              subject: "s5", deadline: "-7d",  progress: 100, status: "done" },
    { id: "g6", title: "Geschichte 19. Jhd. Wiederholung",     subject: "s3", deadline: "+20d", progress: 40, status: "in-progress" },
    { id: "g7", title: "Algorithmen — Sortieralgorithmen",    subject: "s5", deadline: "+12d", progress: 55, status: "in-progress" },
    { id: "g8", title: "Spanisch Grammatik Buch 1",           subject: "s6", deadline: "+60d", progress: 0,  status: "planned" }
  ],

  recentSessions: [
    { id: "ss1", subject: "s1", duration: 50,  date: "-0d", note: "Integrale geübt" },
    { id: "ss2", subject: "s5", duration: 75,  date: "-0d", note: "Coding Kata"    },
    { id: "ss3", subject: "s2", duration: 25,  date: "-1d", note: "Vokabeln"       },
    { id: "ss4", subject: "s4", duration: 45,  date: "-1d", note: "Photosynthese"  },
    { id: "ss5", subject: "s3", duration: 30,  date: "-2d", note: "Lesen"          },
    { id: "ss6", subject: "s1", duration: 60,  date: "-2d", note: "Übungen"        }
  ],

  decks: [
    { id: "d1", name: "Spanisch Grundwortschatz", subject: "s6", total: 120, due: 24 },
    { id: "d2", name: "Mathe Formeln",            subject: "s1", total: 64,  due: 8  },
    { id: "d3", name: "English Vocabulary C1",    subject: "s2", total: 200, due: 42 },
    { id: "d4", name: "Bio Begriffe",             subject: "s4", total: 85,  due: 12 },
    { id: "d5", name: "JS Snippets",              subject: "s5", total: 50,  due: 5  }
  ],

  flashcards: [
    { deck: "d1", front: "die Bibliothek", back: "la biblioteca" },
    { deck: "d1", front: "der Bahnhof",     back: "la estación" },
    { deck: "d1", front: "lernen",          back: "aprender" },
    { deck: "d2", front: "Quadratische Lösungsformel", back: "x = (-b ± √(b²-4ac)) / 2a" },
    { deck: "d2", front: "Ableitung von sin(x)",        back: "cos(x)" },
    { deck: "d3", front: "ubiquitous",      back: "allgegenwärtig" },
    { deck: "d3", front: "to procrastinate", back: "aufschieben" },
    { deck: "d5", front: "Array.map() macht?", back: "Erstellt neues Array, transformiert jedes Element" }
  ],

  notes: [
    { id: "n1", title: "Integralrechnung — Grundlagen", subject: "s1", updated: "-0d",
      content: "# Integralrechnung\n\n## Hauptsatz der Differential- und Integralrechnung\n\nDie **Stammfunktion** F(x) erfüllt F'(x) = f(x).\n\n- Bestimmtes Integral: $\\int_a^b f(x)\\,dx$\n- Unbestimmtes Integral: $\\int f(x)\\,dx = F(x) + C$\n\n### Wichtige Regeln\n1. Linearität\n2. Partielle Integration\n3. Substitution" },
    { id: "n2", title: "Photosynthese Zusammenfassung", subject: "s4", updated: "-1d",
      content: "# Photosynthese\n\nLichtreaktion → Calvin-Zyklus.\n\n6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂" },
    { id: "n3", title: "Spanisch Verben Präsens",       subject: "s6", updated: "-2d",
      content: "# Verbo regulares\n\n- hablar → hablo, hablas, habla...\n- comer → como, comes, come...\n- vivir → vivo, vives, vive..." },
    { id: "n4", title: "Algorithmen — Big O",           subject: "s5", updated: "-3d",
      content: "# Big-O Notation\n\n- O(1) konstant\n- O(log n) logarithmisch\n- O(n) linear\n- O(n log n) — z.B. Mergesort\n- O(n²) — Bubblesort" },
    { id: "n5", title: "Industrialisierung 19. Jhd.",   subject: "s3", updated: "-4d",
      content: "# Industrielle Revolution\n\nBegann ca. 1760 in England. Kennzeichen: Dampfmaschine, Fabriken, Urbanisierung." }
  ],

  // helper
  subjectById(id) { return this.subjects.find(s => s.id === id); }
};

// date helper "+5d" / "-2d" relative to today
window.LH_relDate = function(rel) {
  const m = /^([+-])(\d+)d$/.exec(rel);
  const d = new Date();
  if (m) {
    const sign = m[1] === '+' ? 1 : -1;
    d.setDate(d.getDate() + sign * parseInt(m[2], 10));
  }
  return d;
};
window.LH_fmtDate = function(date) {
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' });
};
window.LH_fmtDateLong = function(date) {
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};
