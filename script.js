// ─────────────────────────────────────────────────
//  Alpine.js Application
// ─────────────────────────────────────────────────

const STORAGE_KEY = "quizProgress";
const UUID_KEY = "quizPersonId";
const QUIZ_ID = 0;
const API_BASE = "https://data-quizz.robin-de.workers.dev";
const DEFAULT_WRONG_ANSWER_MESSAGE = "✗ Ce n'est pas ça — réessayez !";

// ── API helpers (fire-and-forget, errors only logged) ──

async function apiSetName(personId, name) {
  try {
    const res = await fetch(`${API_BASE}/set_name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: personId, quiz_id: QUIZ_ID, name }),
    });
    if (!res.ok) console.error("[quiz] /set_name error", await res.text());
  } catch (err) {
    console.error("[quiz] /set_name failed", err);
  }
}

async function apiAddAnswer(personId, questionId) {
  try {
    const res = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: QUIZ_ID,
        person_id: personId,
        question_id: questionId,
      }),
    });
    if (!res.ok) console.error("[quiz] /add error", await res.text());
  } catch (err) {
    console.error("[quiz] /add failed", err);
  }
}

// ── UUID helpers ──

function getOrCreatePersonId() {
  let id = localStorage.getItem(UUID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, id);
  }
  return id;
}

function resetPersonId() {
  const id = crypto.randomUUID();
  localStorage.setItem(UUID_KEY, id);
  return id;
}

// ─────────────────────────────────────────────────
//  Alpine component
// ─────────────────────────────────────────────────

function quizApp() {
  return {
    // ── Config ──────────────────────────────────
    config: quizConfig,

    // ── State ───────────────────────────────────
    screen: "name", // 'name' | 'quiz' | 'done'
    name: "",
    personId: null,
    currentIndex: 0,
    answer: "",
    shaking: false,
    wrongAnswer: false,
    wrongAnswerMessage: DEFAULT_WRONG_ANSWER_MESSAGE,
    liveMessage: "",

    // ── Computed ────────────────────────────────
    get currentQuestion() {
      return this.config.questions[this.currentIndex] ?? null;
    },

    get progress() {
      return (this.currentIndex / this.config.questions.length) * 100;
    },

    get currentHints() {
      if (!this.currentQuestion) return [];
      const hints = this.currentQuestion.hints;
      if (Array.isArray(hints)) return hints.filter((hint) => !!hint);
      if (this.currentQuestion.hint) return [this.currentQuestion.hint];
      return [];
    },

    get currentAnswerType() {
      if (!this.currentQuestion) return "text";
      return this.currentQuestion.answer_type === "number" ? "number" : "text";
    },

    get answerTypeRemark() {
      return this.currentAnswerType === "number"
        ? "Entrez un nombre"
        : "Entrez une réponse";
    },

    // ── Lifecycle ───────────────────────────────
    init() {
      document.title = this.config.title;

      // Get (or create) a stable UUID for this browser session
      this.personId = getOrCreatePersonId();

      // Restore saved progress
      const saved = this.loadProgress();
      if (saved) {
        this.name = saved.name;
        this.currentIndex = saved.currentIndex;
        this.screen =
          saved.currentIndex >= this.config.questions.length ? "done" : "quiz";
      }
    },

    // ── Actions ─────────────────────────────────
    startQuiz() {
      if (!this.name.trim()) return;
      this.name = this.name.trim();
      this.screen = "quiz";
      this.liveMessage = `Quiz commencé. Question 1 sur ${this.config.questions.length}.`;
      this.saveProgress();

      // Post name to backend (non-blocking)
      apiSetName(this.personId, this.name);

      this.$nextTick(() => this.$refs.answerInput.focus());
    },

    submitAnswer() {
      const rawAnswer = this.answer.trim();
      const isNumberAnswer = this.currentAnswerType === "number";

      if (!rawAnswer) return;

      let isCorrect = false;
      if (isNumberAnswer) {
        const givenNumber = Number(rawAnswer);
        const correctNumber = Number(this.currentQuestion.answer);
        isCorrect =
          !Number.isNaN(givenNumber) &&
          !Number.isNaN(correctNumber) &&
          givenNumber === correctNumber;
      } else {
        const givenText = rawAnswer.toLowerCase();
        const correctText = this.currentQuestion.answer.trim().toLowerCase();
        isCorrect = givenText === correctText;
      }

      if (isCorrect) {
        // Post correct answer to backend (non-blocking)
        apiAddAnswer(
          this.personId,
          this.currentQuestion.id ?? this.currentIndex,
        );

        this.wrongAnswer = false;
        this.wrongAnswerMessage = DEFAULT_WRONG_ANSWER_MESSAGE;
        this.answer = "";
        this.currentIndex++;
        if (this.currentIndex >= this.config.questions.length) {
          this.screen = "done";
          this.liveMessage = "Quiz terminé. Félicitations.";
        } else {
          this.liveMessage = `Bonne réponse. Question ${this.currentIndex + 1} sur ${this.config.questions.length}.`;
        }

        this.saveProgress();
        this.$nextTick(() => this.$refs.answerInput?.focus());
      } else {
        // Wrong answer: shake + clear input
        this.wrongAnswer = true;
        const customErrorHint = this.getErrorHintMessage(rawAnswer);
        this.wrongAnswerMessage =
          customErrorHint || DEFAULT_WRONG_ANSWER_MESSAGE;
        this.answer = "";
        this.liveMessage = "Réponse incorrecte. Réessayez.";
        this.triggerShake();
        this.$nextTick(() => this.$refs.answerInput.focus());
      }
    },

    triggerShake() {
      this.shaking = true;
      setTimeout(() => {
        this.shaking = false;
      }, 450);
    },

    restart() {
      localStorage.removeItem(STORAGE_KEY);
      // Issue a fresh UUID so the new session is tracked independently
      this.personId = resetPersonId();
      this.screen = "name";
      this.name = "";
      this.currentIndex = 0;
      this.answer = "";
      this.wrongAnswer = false;
      this.wrongAnswerMessage = DEFAULT_WRONG_ANSWER_MESSAGE;
      this.liveMessage = "Quiz réinitialisé.";
    },

    getErrorHintMessage(rawAnswer) {
      const hints = this.currentQuestion?.error_hints;
      if (!hints || !rawAnswer) return "";

      const trimmed = rawAnswer.trim();
      if (!trimmed) return "";

      const hasOwn = (key) =>
        Object.prototype.hasOwnProperty.call(hints, key);

      if (this.currentAnswerType === "number") {
        if (hasOwn(trimmed)) return hints[trimmed];
        const parsed = Number(trimmed);
        if (!Number.isNaN(parsed)) {
          const matchedKey = Object.keys(hints).find((key) => {
            const keyNumber = Number(key);
            return !Number.isNaN(keyNumber) && keyNumber === parsed;
          });
          if (matchedKey) return hints[matchedKey];
        }
        return "";
      }

      const normalized = trimmed.toLowerCase();
      if (hasOwn(normalized)) return hints[normalized];
      if (hasOwn(trimmed)) return hints[trimmed];
      return "";
    },

    renderHint(hint) {
      return marked.parse(hint || "");
    },

    // ── Persistence ─────────────────────────────
    saveProgress() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: this.name, currentIndex: this.currentIndex }),
      );
    },

    loadProgress() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        // Validate index is still within current question count
        if (typeof data.currentIndex !== "number" || data.currentIndex < 0) {
          return null;
        }
        return data;
      } catch {
        return null;
      }
    },
  };
}
