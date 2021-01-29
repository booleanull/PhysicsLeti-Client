let app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        allTests: [],
    },

    computed: {
        url() {
            return `/testing.html?id=${this.id}`;
        },
        userType() {
            return localStorage.getItem('userType');
        },
    },

    async created() {
        this.showAllTests();
    },


    methods: {
        editTest(url) {
            const id = url.split('?')[1].split('=')[1];
            location.assign(`/createTest.html?id=${id}`);
        },

        getFullUrl(url) {
            if (url) return `${location.host}${url}`;
            else return `${location.host}${this.url}`
        },

        goBack() {
            if (this.userType === '0') location.assign('./student.html');
            if (this.userType === '1') location.assign('./teacher.html');
            if (this.userType === '2') location.assign('./admin.html');
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
            this.allTests = [];
            let allTests = this.allTests;
            firebase.database().ref('/tests').once('value').then(function(data) {
                let tests = data.val();
                for (let test in tests) {
                    allTests.push({id: test, title: tests[test].title, url: tests[test].url, count: tests[test].questions.length})
                }
            });
        },

    },
});
