var app = new Vue({
  el: '#app',

  vuetify: new Vuetify(),

  data: {
    error: '',
    testStarted: false,
    testFinished: false,
    test: null,
    answers: [],
    currentQuestionNumber: 1,
    userId: window.localStorage.getItem('userId'),
    correctQuestionsForSession: [],
    userResult: null,
    testId: null
  },

  computed: {
    coef() {
      return 1.00 - (0.25 * ( (this.userResults && this.userResults.tryings) || 0 ));
    },

    maxScore() {
      return this.test.questions.map(q => q.score).reduce((prev, curr) => prev + curr);
    },

    currentQuestion() {
      return this.test ? this.test.questions[this.currentQuestionNumber - 1] : null;
    },

    currentHint() {
      if (!this.currentQuestion.hints) return null;

      if (this.userResults && this.userResults.correctlyAnswers) {
        if (
          typeof this.userResults.correctlyAnswers[this.currentQuestionNumber - 1] === 'number' &&
          this.userResults.correctlyAnswers[this.currentQuestionNumber - 1] !== 0
        ) {
          const index = this.userResults.correctlyAnswers[this.currentQuestionNumber - 1] - 1;
          return this.currentQuestion.hints[index]
        }
      }

      return null
    },

    userResults() {
      return (this.test && this.test.results && this.test.results[this.userId]) || null;
    },

    getScore() {
      let sum = 0;
      this.test.questions.forEach((q, i) => {
        if (this.correctQuestionsForSession[i]) sum += Number(q.score);
      });

      const result = sum * this.coef;
      return result > 0 ? result : 0;
    },
  },

  methods: {
    reload: () => location.reload(),

    getTest() {
      const url = new URL(window.location.href);
      const testId = url.searchParams.get('id');
      this.testId = testId;

      firebase.database()
        .ref(`tests/${testId}`)
        .once('value')
        .then(snapshot => {
          if (Boolean(snapshot.val())) {
            this.test = snapshot.val()
            this.correctQuestionsForSession = Array(this.test.questions.length).fill(false);
          } else {
            this.error = 'Тест не найден';
          }
        });
    },

    finishTest() {
      const results = {};

      results.tryings = this.userResults && this.userResults.tryings ? this.userResults.tryings + 1 : 1;
      results.totalScore = this.getScore;

      results.correctlyAnswers = this.userResults && this.userResults.correctlyAnswers || Array(this.test.questions.length).fill(0);
      results.correctlyAnswers = results.correctlyAnswers.map((item, index) => {
        if (item === true || this.correctQuestionsForSession[index]) return true;

        return ++item;
      });

      results.userName = window.localStorage.getItem('userName');

      firebase.database()
        .ref(`tests/${this.testId}/results/${this.userId}`)
        .set(results);

      this.testFinished = true;
    },

    isType(type) {
      if (String(this.currentQuestion.type) === '1' && !this.answers[this.currentQuestionNumber - 1]) {
        this.answers[this.currentQuestionNumber - 1] = [];
      }

      return String(this.currentQuestion.type) === String(type);
    },
  },

  watch: {
    answers: {
      handler() {
        switch (this.currentQuestion.type) {
          case '0':
            this.correctQuestionsForSession[this.currentQuestionNumber - 1] =
              String(this.answers[this.currentQuestionNumber - 1]) === String(this.currentQuestion.answer[0]);
            break;
          case '1':
            const isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
            this.correctQuestionsForSession[this.currentQuestionNumber - 1] =
              isSetsEqual(new Set(this.answers[this.currentQuestionNumber - 1]), new Set(this.currentQuestion.answer));
            break;
          case '2':
            this.correctQuestionsForSession[this.currentQuestionNumber - 1] =
              this.answers[this.currentQuestionNumber - 1].toLowerCase().trim() === this.currentQuestion.answer.toLowerCase().trim();
            break;
        }
      },

      deep: true
    }
  },

  created() {
    this.getTest();
  },

  beforeDestroy() {
    this.finishTest();
  }
})
