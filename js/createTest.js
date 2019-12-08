Vue.component('question', {
    props: ['q_id'],
    data() {
        return {
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
        }
    },
    methods: {
        saveQuestion() {
            if (this.name && this.type && (this.variants_of_answer && this.answer_01_type || this.answer_2_type) && this.score) {
                this.showAlert = true;
                this.showError = false;
                this.$emit('save-question', this.q_id, this.name, this.type, this.variants_of_answer, this.answer_01_type, this.answer_2_type, this.hints, this.score);
            }
            else {
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
            if (this.type==='0' && value.length > 1) value.shift();
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
                                                
                         <v-text-field v-model="score" label="Максимальный балл за ответ на вопрос"></v-text-field>
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
        amountOfAdded : 0,
        addedQuestions: [],
        sended: false,
        allTests: [],
        showTests: false,
        errorTitle: false,
    },

    computed: {
        id() {
            return uuidv4() + '_' + this.testTitle;
        },
        url() {
            return `/testing.html?id=${this.id}`;
        },
        userType() {
            return localStorage.getItem('userType');
        },
    },

    created() {
      if (this.userType !== '2') location.assign('/index.html');
    },

    methods: {
        getFullUrl(url) {
            if (url) return `${location.host}${url}`;
            else return `${location.host}${this.url}`
        },

        goToAdminPanel() {
            if (this.userType=== '1') location.assign('./teacher.html');
            if (this.userType=== '2') location.assign('./admin.html');
        },

        deleteTest(id) {
            firebase.database().ref(`/tests/${id}`).remove();

            this.allTests = [];

            let allTests = this.allTests;
            firebase.database().ref('/tests').once('value').then(function(data) {
                let tests = data.val();
                for (let item in tests) {
                    allTests.push({id: item, title: tests[item].title, url: tests[item].url})
                }
            });
        },

        showAllTests() {
            this.showTests = !this.showTests;
            let allTests = this.allTests;
            firebase.database().ref('/tests').once('value').then(function(data) {
                let tests = data.val();
                for (let item in tests) {
                    allTests.push({id: item, title: tests[item].title, url: tests[item].url})
                }
            });
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
            }
            else {
                this.errorTitle = true;
            }
        },
        saveQuestion(id, name, type, variants_of_answer, answer_01_type, answer_2_type, hints, score) {
            if (this.addedQuestions.indexOf(parseInt(id)) === -1){
                this.amountOfAdded++;
                this.addedQuestions.push(parseInt(id));
            }

            this.questions[id] = {
                id: id,
                name,
                type,
                variants_of_answer: variants_of_answer ? variants_of_answer.map(el=>{
                    return el.variant;
                }) : null,
                answer: answer_2_type || answer_01_type.sort(),
                hints: hints ? hints.map(el=>{
                    return el.str;
                }) : null,
                score
            };
        },

        async sendTest() {
            await firebase.database().ref(`tests/${this.id}`).set({
                title: this.testTitle,
                questions: this.questions,
                url: this.url,
            });
            console.log('Sended!');
            this.sended = true;
        }
    },
});
