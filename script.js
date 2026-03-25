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

async function apiAddAnswer(
  personId,
  questionId,
  questionText,
  answerValue,
  isCorrect,
) {
  try {
    const res = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: QUIZ_ID,
        person_id: personId,
        question_id: questionId,
        question: questionText,
        answer: answerValue,
        is_correct: isCorrect,
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
    name: "anonyme",
    personId: null,
    currentIndex: 0,
    answer: "",
    answers: [],
    shaking: false,
    wrongAnswer: false,
    wrongAnswerMessage: DEFAULT_WRONG_ANSWER_MESSAGE,
    liveMessage: "",
    imageModalOpen: false,
    imageModalSrc: "",
    imageModalAlt: "",

    // ── Computed ────────────────────────────────
    get currentQuestion() {
      return this.config.questions[this.currentIndex] ?? null;
    },

    get avatarSeed() {
      if (this.personId) return `id-${this.personId}`;
      if (this.name) return this.name;
      return "anonymous";
    },

    get progress() {
      const total = this.config.questions.length || 1;
      const answered = Math.min(this.answers.length, total);
      return (answered / total) * 100;
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
      if (this.currentQuestion.answer_type === "number") return "number";
      if (this.currentQuestion.answer_type === "choice") return "choice";
      return "text";
    },

    get answerTypeRemark() {
      return this.currentAnswerType === "number"
        ? "Entrez un nombre"
        : "Entrez une réponse";
    },

    get currentChoices() {
      if (!this.currentQuestion) return [];
      if (this.currentAnswerType !== "choice") return [];
      return Array.isArray(this.currentQuestion.choices)
        ? this.currentQuestion.choices
        : [];
    },

    get isCurrentAnswered() {
      return this.answers[this.currentIndex] !== undefined;
    },

    get canGoPrev() {
      return this.currentIndex > 0;
    },

    get canGoNext() {
      return this.currentIndex < this.answers.length;
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
        this.answers = Array.isArray(saved.answers) ? saved.answers : [];
        this.currentIndex = Math.min(
          saved.currentIndex,
          this.answers.length,
          this.config.questions.length,
        );
        this.screen =
          saved.currentIndex >= this.config.questions.length ? "done" : "quiz";
      }

      this.syncAnswerForCurrent();
      this.$watch("currentIndex", () => {
        this.syncAnswerForCurrent();
        this.closeHints();
      });
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

      this.syncAnswerForCurrent();
      this.focusCurrentInput();
    },

    valuesMatch(a, b, type) {
      if (type === "number") {
        return Math.round(Number(a)) === Math.round(Number(b));
      }
      return a.trim().toLowerCase() === b.trim().toLowerCase();
    },

    submitAnswer() {
      if (this.isCurrentAnswered) return;
      const rawAnswer = String(this.answer ?? "").trim();

      if (!rawAnswer) return;

      let isCorrect = this.valuesMatch(
        rawAnswer,
        this.currentQuestion.answer,
        this.currentAnswerType,
      );

      // Post answer to backend (non-blocking)
      apiAddAnswer(
        this.personId,
        this.currentQuestion.id ?? this.currentIndex,
        this.currentQuestion.question ?? "",
        rawAnswer,
        isCorrect,
      );

      if (isCorrect) {
        this.wrongAnswer = false;
        this.wrongAnswerMessage = DEFAULT_WRONG_ANSWER_MESSAGE;
        this.answers[this.currentIndex] = rawAnswer;
        this.answer = rawAnswer;
        this.currentIndex++;
        if (this.currentIndex >= this.config.questions.length) {
          this.screen = "done";
          this.liveMessage = "Quiz terminé. Félicitations.";
        } else {
          this.liveMessage = `Bonne réponse. Question ${this.currentIndex + 1} sur ${this.config.questions.length}.`;
        }

        this.saveProgress();
        this.syncAnswerForCurrent();
        this.focusCurrentInput();
      } else {
        // Wrong answer: shake + clear input
        this.wrongAnswer = true;
        const customErrorHint = this.getErrorHintMessage(rawAnswer);
        this.wrongAnswerMessage =
          customErrorHint || DEFAULT_WRONG_ANSWER_MESSAGE;
        this.answer = "";
        this.liveMessage = "Réponse incorrecte. Réessayez.";
        this.triggerShake();
        this.focusCurrentInput();
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
      this.answers = [];
      this.wrongAnswer = false;
      this.wrongAnswerMessage = DEFAULT_WRONG_ANSWER_MESSAGE;
      this.liveMessage = "Quiz réinitialisé.";
    },

    goPrev() {
      if (!this.canGoPrev) return;
      this.currentIndex--;
      if (this.screen === "done") {
        this.screen = "quiz";
      }
      this.liveMessage = `Question ${this.currentIndex + 1} sur ${this.config.questions.length}.`;
      this.saveProgress();
    },

    goNext() {
      if (!this.canGoNext) return;
      this.currentIndex++;
      if (this.currentIndex >= this.config.questions.length) {
        this.screen = "done";
        this.liveMessage = "Quiz terminé. Félicitations.";
      } else {
        this.screen = "quiz";
        this.liveMessage = `Question ${this.currentIndex + 1} sur ${this.config.questions.length}.`;
        this.focusCurrentInput();
      }
      this.saveProgress();
    },

    getErrorHintMessage(rawAnswer) {
      const hints = this.currentQuestion?.error_hints;
      if (!hints || !rawAnswer) return "";

      for (const val in hints) {
        if (this.valuesMatch(rawAnswer, val, this.currentAnswerType)) {
          return hints[val];
        }
      }
      return "";
    },

    renderHint(hint) {
      return marked.parse(hint || "");
    },

    handleHintClick(event) {
      const img = event.target?.closest?.("img");
      if (!img || !img.src) return;
      this.openImageModal(img.src, img.alt || "");
    },

    openImageModal(src, alt) {
      this.imageModalSrc = src;
      this.imageModalAlt = alt;
      this.imageModalOpen = true;
    },

    closeImageModal() {
      this.imageModalOpen = false;
      this.imageModalSrc = "";
      this.imageModalAlt = "";
    },

    syncAnswerForCurrent() {
      this.wrongAnswer = false;
      this.wrongAnswerMessage = DEFAULT_WRONG_ANSWER_MESSAGE;
      if (this.isCurrentAnswered) {
        this.answer = this.answers[this.currentIndex] ?? "";
      } else {
        this.answer = "";
      }
    },

    closeHints() {
      this.$nextTick(() => {
        const hintList = this.$refs.hintList;
        if (hintList) {
          hintList.querySelectorAll("details[open]").forEach((detail) => {
            detail.open = false;
          });
        }

        const solution = this.$refs.solution;
        if (solution) {
          solution.open = false;
        }
      });
    },

    focusCurrentInput() {
      this.$nextTick(() => {
        if (this.currentAnswerType === "choice") {
          const firstChoice = this.$refs.choiceGroup?.querySelector("input");
          firstChoice?.focus();
          return;
        }
        this.$refs.answerInput?.focus();
      });
    },

    // ── Persistence ─────────────────────────────
    saveProgress() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: this.name,
          currentIndex: this.currentIndex,
          answers: this.answers,
        }),
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
        if (!Array.isArray(data.answers)) data.answers = [];
        return data;
      } catch {
        return null;
      }
    },
  };
}
