const QUIZ_ID = 0;
const API_BASE = "https://data-quizz.robin-de.workers.dev"; // e.g. "https://my-worker.workers.dev"
const POLL_MS = 5000;

function overviewApp() {
  return {
    config: quizConfig,
    participants: [],
    error: null,
    lastUpdated: null,
    _timer: null,

    init() {
      this.fetch();
      this._timer = setInterval(() => this.fetch(), POLL_MS);
    },

    async fetch() {
      try {
        const res = await fetch(`${API_BASE}/latest?quiz_id=${QUIZ_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Sort: furthest along first, then alphabetically
        this.participants = (data.data || []).sort((a, b) => {
          const qa = a.question_id ?? -1;
          const qb = b.question_id ?? -1;
          if (qb !== qa) return qb - qa;
          return (a.person_name || "").localeCompare(b.person_name || "");
        });
        this.error = null;
        this.lastUpdated = new Date().toLocaleTimeString();
      } catch (err) {
        console.error("[overview] poll failed", err);
        this.error = "Could not reach the server.";
      }
    },

    // Returns 0–1 progress fraction.
    // null means not started → position at 0.
    progress(p) {
      const total = this.config.questions.length;
      if (p.question_id == null) return 0;
      return Math.min((p.question_id + 1) / total, 1);
    },

    avatarSeed(p) {
      if (p.person_name) return p.person_name;
      if (p.person_id != null) return `id-${p.person_id}`;
      return "anonymous";
    },
  };
}
