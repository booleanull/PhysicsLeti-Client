var app = new Vue({
  el: '#app',

  vuetify: new Vuetify(),

  data: {
    error: '',
    testStarted: false,
    testFinished: false,
    test: null,
    answers: [],
    // currentQuestionNumber: 1,
    userId: window.localStorage.getItem('userId'),
    correctQuestionsForSession: [],
    userResult: null,
    testId: null
  },

  computed: {
    coef() {
      return 1.00 - (0.25 * ((this.userResults && this.userResults.tryings) || 0 ));
    },

    maxScore() {
      return this.test.questions.map(q => q.score).reduce((prev, curr) => Number(prev) + Number(curr));
    },

    userResults() {
      return (this.test && this.test.results && this.test.results[this.userId]) || null;
    }
  },

  methods: {
    getHint(question, index) {
      if (
        question.hints &&
        this.userResults &&
        this.userResults.correctlyAnswers &&
        typeof this.userResults.correctlyAnswers[index] === 'number' &&
        this.userResults.correctlyAnswers[index] !== 0
      ) {
        const hintIndex = this.userResults.correctlyAnswers[index] - 1;
        return question.hints[hintIndex];
      }

      return null
    },

    reload: () => location.reload(),

    isType(question, index, type) {
      if (question.type === '1' && !this.answers[index]) {
        this.answers[index] = [];
      }

      return question.type === type;
    },

    getScore() {
      let sum = 0;
      this.test.questions.forEach((q, i) => {
        if (this.correctQuestionsForSession[i]) sum += Number(q.score);
      });

      const result = sum * this.coef;
      return result > 0 ? result : 0;
    },

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
      window.scrollTo(0, 0);
      this.handleResult();
      const results = {};

      results.tryings = this.userResults && this.userResults.tryings ? this.userResults.tryings + 1 : 1;
      results.totalScore = this.getScore();
      
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

    goBack() {
      switch(localStorage.getItem('userType')) {
        case '0':
          location.assign('./student.html');
          break;
        case '1':
          location.assign('./teacher.html');
          break;
        case '2':
          location.assign('./admin.html');
          break;
      }
    },

    handleResult() {
      this.test.questions.forEach((question, index) => {
        switch (question.type) {
          case '0':
            this.correctQuestionsForSession[index] = String(this.answers[index]) === String(question.answer[0]);
            break;
          case '1':
            const isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
            this.correctQuestionsForSession[index] = isSetsEqual(new Set(this.answers[index]), new Set(question.answer));
            break;
          case '2':
            this.correctQuestionsForSession[index] = this.answers[index] && this.answers[index].toLowerCase().trim() === question.answer.toLowerCase().trim();
            break;
        };
      });
    }
  },

  created() {
    this.getTest();
  },

  beforeDestroy() {
    this.finishTest();
  }
})
