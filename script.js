// ─────────────────────────────────────────────────
//  Alpine.js Application
// ─────────────────────────────────────────────────

const STORAGE_KEY = "quizProgress";

function quizApp() {
  return {
    // ── Config ──────────────────────────────────
    config: quizConfig,

    // ── State ───────────────────────────────────
    screen: "name", // 'name' | 'quiz' | 'done'
    name: "",
    currentIndex: 0,
    answer: "",
    showHint: false,
    shaking: false,
    wrongAnswer: false,

    // ── Computed ────────────────────────────────
    get currentQuestion() {
      return this.config.questions[this.currentIndex];
    },

    get progress() {
      return (this.currentIndex / this.config.questions.length) * 100;
    },

    get renderedHint() {
      return marked.parse(this.currentQuestion.hint || "");
    },

    get currentAnswerType() {
      return this.currentQuestion.answer_type === "number" ? "number" : "text";
    },

    get answerTypeRemark() {
      return this.currentAnswerType === "number"
        ? "Entrez un nombre"
        : "Entrez une réponse";
    },

    // ── Lifecycle ───────────────────────────────
    init() {
      // Set page title from config
      document.title = this.config.title;

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
      this.saveProgress();
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
        this.wrongAnswer = false;
        this.answer = "";
        this.showHint = false;
        this.currentIndex++;

        if (this.currentIndex >= this.config.questions.length) {
          this.screen = "done";
        }

        this.saveProgress();
        this.$nextTick(() => this.$refs.answerInput?.focus());
      } else {
        // Wrong answer: shake + clear input
        this.wrongAnswer = true;
        this.answer = "";
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
      this.screen = "name";
      this.name = "";
      this.currentIndex = 0;
      this.answer = "";
      this.showHint = false;
      this.wrongAnswer = false;
    },

    // ── Persistence ─────────────────────────────
    saveProgress() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: this.name,
          currentIndex: this.currentIndex,
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
        return data;
      } catch {
        return null;
      }
    },
  };
}
