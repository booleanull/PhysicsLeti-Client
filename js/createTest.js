Vue.component('question', {
    props: ['q_id', 'test_url'],
    data() {
        return {
            id: null,
            type: null,
            name: '',
            variants_of_answer: null,
            count_of_variants_of_answer: null,
            answer_01_type: [],
            answer_2_type: null,
            hints: null,
            count_of_hints: null,
            score: null,
            showAlert: false,
            showError: false,
            editMode: false,
        }
    },

    async created() {
        this.id = this.q_id;
        await this.getInforamtionFromServer();
    },

    methods: {
        async getInforamtionFromServer() {
            const QUESTION = this;
            if (this.test_url) {
                await firebase.database().ref(`/tests/${QUESTION.test_url}/questions/${Number(QUESTION.q_id)}`).once('value').then(function (data) {
                    let question = data.val();
                    QUESTION.type = question.type;
                    QUESTION.id = question.id;
                    QUESTION.name = question.name;
                    QUESTION.score = question.score;
                    if (question.type === '2') QUESTION.answer_2_type = question.answer;
                    else {
                        QUESTION.count_of_variants_of_answer = question.variants_of_answer.length;
                        setTimeout(() => {
                            QUESTION.variants_of_answer = question.variants_of_answer.map((el, index) => {
                                return {id: index, variant: el}
                            });
                        }, 500);
                        QUESTION.answer_01_type = [...question.answer];
                    }
                    QUESTION.count_of_hints = question.hints.length;
                    setTimeout(() => {
                        QUESTION.hints = question.hints.map((el, index) => {
                            return {id: index, str: el}
                        });
                    }, 500);

                });
            }
        },

        saveQuestion() {
            if (this.name && this.type && (this.variants_of_answer && this.answer_01_type || this.answer_2_type) && this.score) {
                if (Number(this.score) > 0) {
                    this.showAlert = true;
                    this.showError = false;
                    this.$emit('save-question', this.id, this.name, this.type, this.variants_of_answer, this.answer_01_type, this.answer_2_type, this.hints, this.score);
                } else {
                    alert('Балл за вопрос должен быть положительным числом');
                }
            } else {
                this.showError = true;
            }
        },
    },
    watch: {
        count_of_variants_of_answer(value) {
            this.variants_of_answer = [];
            for (let i = 0; i < value; i++) {
                this.variants_of_answer.push({id: i, variant: ""});
            }
        },
        count_of_hints(value) {
            this.hints = [];
            for (let i = 0; i < value; i++) {
                this.hints.push({id: i, str: ""});
            }
        },
        answer_01_type(value) {
            if (this.type === '0' && value.length > 1) value.shift();
        }
    },

    filters: {
        plusOne(value) {
            return Number(value) + 1;
        }
    },

    template: ` <v-form>
                  <v-card raised style="padding: 10px;">
                        <h2>Вопрос №{{ q_id | plusOne}}</h2>

                        <v-radio-group v-model="type" :mandatory="true" label="Выберите тип вопроса:">
                            <v-radio label="Один ответ" value="0"></v-radio>
                            <v-radio label="Несколько ответов" value="1"></v-radio>
                            <v-radio label="Открытый вопрос" value="2"></v-radio>
                        </v-radio-group>

                        <v-text-field v-model="name" label="Введите вопрос"></v-text-field>

                        <div v-if="type==0 || type==1">
                            <v-text-field type="number" label="Сколько вариантов ответа в вопросе?" v-model="count_of_variants_of_answer"></v-text-field>
                            <ul>
                                <li v-for="answer in variants_of_answer">
                                    <v-text-field  v-model="answer.variant" label="Введите вариант ответа" :key="answer.id"></v-text-field>
                                    <v-checkbox v-model="answer_01_type" :value="answer.id" label="Отметить, если это правильный ответ"></v-checkbox>
                                </li>
                            </ul>

                        </div>
                        <div v-else>
                            <v-text-field v-model="answer_2_type" label="Введите ответ"></v-text-field>
                        </div>

                         <div>
                            <v-text-field type="number" label="Сколько подсказок в вопросе?" v-model="count_of_hints"></v-text-field>
                            <ul>
                                <li v-for="hint in hints">
                                    <v-text-field v-model="hint.str" label="Введите подсказку" :key="hint.id"></v-text-field>
                                </li>
                            </ul>
                         </div>

                         <v-text-field v-model="score" type="number" label="Максимальный балл за ответ на вопрос"></v-text-field>
                         <v-alert :value="showAlert" color="success">Вопрос добавлен в тест</v-alert>
                         <v-alert :value="showError" color="warning">Ошибка, есть пустые обязательные поля</v-alert>
                         <v-btn @click="saveQuestion" color="success">Добавить вопрос</v-btn>
                    </v-card>
                </v-form> `
});


let app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        countOfQuestions: null,
        testTitle: "",
        questions: [],
        amountOfAdded: 0,
        addedQuestions: [],
        sended: false,
        allTests: [],
        errorTitle: false,
        edit: false,
        testIdToEdit: '',
    },

    computed: {
        id() {
            return (this.edit && this.testIdToEdit) ? this.testIdToEdit : uuidv4();
        },
        url() {
            return (this.edit && this.testIdToEdit) ? `/testing.html?id=${this.testIdToEdit}` : `/testing.html?id=${this.id}`;
        },
        userType() {
            return localStorage.getItem('userType');
        },
    },

    async created() {
        if (this.userType === '0') location.assign('/student.html');
        await this.editMode();
    },


    methods: {
        getIdFromUrl() {
            const params = location
                .search
                .replace('?', '')
                .split('&')
                .reduce(
                    function (p, e) {
                        let a = e.split('=');
                        p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                        return p;
                    },
                    {}
                );
            return params['id'];
        },

        async editMode() {
            let res = false;

            let idFromUrl = this.getIdFromUrl();

            await firebase.database().ref('/tests').once('value').then(function (data) {
                let tests = data.val();
                for (let test in tests) {
                    if (idFromUrl === test) res = true;
                }
            });

            this.edit = res;
            this.testIdToEdit = idFromUrl;
        },

        getFullUrl(url) {
            if (url) return `${location.host}${url}`;
            else return `${location.host}${this.url}`
        },

        goBack() {
            if (this.userType === '1') location.assign('./teacher.html');
            if (this.userType === '2') location.assign('./admin.html');
        },


        showAllTests() {
            location.assign('./viewTests.html');
        },

        createQuestions() {
            if (this.testTitle !== '') {
                this.errorTitle = false;
                this.amountOfAdded = 0;
                this.addedQuestions = [];
                this.questions = [];
                for (let i = 0; i < this.countOfQuestions; i++) {
                    this.questions.push({
                        id: i,
                    });
                }
            } else {
                this.errorTitle = true;
            }
        },
        saveQuestion(id, name, type, variants_of_answer, answer_01_type, answer_2_type, hints, score) {
            if (this.addedQuestions.indexOf(parseInt(id)) === -1) {
                this.amountOfAdded++;
                this.addedQuestions.push(parseInt(id));
            }

            this.questions[id] = {
                id: id,
                name,
                type,
                variants_of_answer: variants_of_answer ? variants_of_answer.map(el => {
                    return el.variant;
                }) : null,
                answer: answer_2_type || answer_01_type.sort(),
                hints: hints ? hints.map(el => {
                    return el.str;
                }) : null,
                score
            };
        },

        async sendTest() {
            if (this.testTitle) {
                await firebase.database().ref(`tests/${this.id}`).set({
                    title: this.testTitle,
                    questions: this.questions,
                    url: this.url,
                });
                console.log('Sended!');
                this.sended = true;
            } else this.showError = true;
        }
    },

    watch: {
        async testIdToEdit(value) {
            const TEST = this;
            if (value && this.edit) {
                await firebase.database().ref(`/tests/${value}`).once('value').then(function (data) {
                    let test = data.val();
                    TEST.testTitle = test.title;
                    TEST.countOfQuestions = test.questions.length;
                    TEST.questions = test.questions;
                });
            }
        }
    }
});
