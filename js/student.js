let xmlHttp = new XMLHttpRequest();
let labworks = undefined;
const URL = 'http://83.166.240.14:8080';
// When our page is Ready
window.onload = onload_page();

function onload_page() {
    ajax_post(`${URL}/api/lab`, null, function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            try {
                let data = JSON.parse(xmlHttp.responseText);
                update_list(data.labworks)
            } catch (err) {
                console.log(err.message + " in " + xmlHttp.responseText);
            }
        } else {
            console.log("error");
        }
    });
}

function send_lab(id) {
    let jsonObject = {};
    jsonObject.id = id;
    jsonObject.protocol = document.getElementById("table").innerHTML;

    ajax_post(`${URL}/api/lab/protocol`, jsonObject, function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            try {
                let data = JSON.parse(xmlHttp.responseText);
                $.notify("Ваш протокол был успешно отправлен! Состояние вашей работы можете посмотреть у себя в профиле.", {type: 'success'});
            } catch (err) {
                console.log(err.message + " in " + xmlHttp.responseText);
            }
        } else {
            $.notify("Ошибка! Ваш протокол уже доставлен. Состояние вашей работы можете посмотреть у себя в профиле.", {type: 'danger'});
        }
    });
}

function ajax_post(url, json, func) {
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    // TODO: Enter token
    xmlHttp.setRequestHeader("token", localStorage.getItem('token'));

    xmlHttp.onload = func;

    if (json == null) {
        xmlHttp.send();
    } else {
        let jsonToSend = JSON.stringify(json, null, ' ');
        xmlHttp.send(jsonToSend)
    }
}

function update_list(data) {
    labworks = data;
    var navigation = '';
    data.forEach(function (theme) {
        navigation += '<li class="nav-item dropdown active">' +
            '<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown' + theme.theme + '" data-toggle="dropdown"' +
            'aria-haspopup="true" aria-expanded="false">' +
            theme.theme +
            '</a>' + '<div class="dropdown-menu" aria-labelledby="navbarDropdown' + theme.theme + '">';
        theme.list.forEach(function (lab) {
            navigation += '<a class="dropdown-item" href="#" onclick="set_labwork(' + lab.id + ');return false;">' + lab.title + '</a>'
        });
        navigation += '</div></li>';
    });
    document.getElementById('lab-list').innerHTML = navigation
}

function set_main() {
    document.getElementById('main_content').innerHTML = '<div class="jumbotron bg-light">\n' +
        '        <div class="container">\n' +
        '            <h1>Добро пожаловать!</h1>\n' +
        '            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et\n' +
        '                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip\n' +
        '                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu\n' +
        '                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia\n' +
        '                deserunt mollit anim id est laborum.</p>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    <div class="container">\n' +
        '        <div class="row">\n' +
        '            <div class="col-md-4">\n' +
        '                <h2>Отправка протокола</h2>\n' +
        '                <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>\n' +
        '            </div>\n' +
        '            <div class="col-md-4">\n' +
        '                <h2>Отправка отчета</h2>\n' +
        '                <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>\n' +
        '            </div>\n' +
        '            <div class="col-md-4">\n' +
        '                <h2>Выставление оценки</h2>\n' +
        '                <p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>';
}

function set_labwork(id) {
    labworks.forEach(function (theme) {
        theme.list.forEach(function (lab) {
            if (lab.id === id) {
                var protocol = lab.protocol.split(";");
                var width = protocol[0];
                var height = protocol[1];
                var width_column = protocol.slice(2, protocol.length);
                var toptable = "";
                var contenttable = "";
                for (var i = 0; i < height; i++) {
                    contenttable += '<tr>';
                    for (var j = 0; j < width; j++) {
                        contenttable += '<td class="pt-3-half" contenteditable="true"></td>';
                    }
                    contenttable += '</tr>';
                }
                width_column.forEach(function (str) {
                    toptable += '<th class="text-center">' + str + '</th>'
                })
                var content = '<div class="jumbotron bg-light">' +
                    '        <div class="container">' +
                    '            <h1>' + lab.title + '</h1>' +
                    '            <p>' + lab.description + '</p>' +
                    '<a class="btn btn-primary btn-lg" href="'+ lab.link + '" role="button" target="_blank">Страница установки</a>' +
                    '<a class="btn btn-primary btn-lg" href="'+ lab.info + '" role="button" target="_blank">Страница методических указаний</a>' +
                    '<a class="btn btn-primary btn-lg" href="'+ lab.testStart + '" role="button" target="_blank">Страница входного тестирования</a>' +
                    '        </div></div>' +
                    '<div class="container">' +
                    '<div class="card">\n' +
                    '  <h3 class="card-header">Протокол</h3>\n' +
                    '  <div class="card-body">\n' +
                    '    <div id="table" class="table-editable">\n' +
                    '      <span class="table-add float-right mb-3 mr-2"><a href="#!" class="text-success"><i\n' +
                    '            class="fas fa-plus fa-2x" aria-hidden="true"></i></a></span>\n' +
                    '      <table class="table table-bordered table-responsive-md table-striped text-center">\n' +
                    '        <thead>\n' +
                    '          <tr id="width">\n' +
                                    toptable +
                    '          </tr>\n' +
                    '        </thead>\n' +
                    '        <tbody>\n' +
                                contenttable +
                    '        </tbody>\n' +
                    '      </table>\n' +
                    '    </div>' +
                    '<button id="button_send" type="button" class="btn btn-primary float-right" onclick="send_lab('+ lab.id +')">Отправить</button>' +
                    '  </div>\n' +
                    '</div></div>'
                document.getElementById('main_content').innerHTML = content;
            }
        })
    })
}

function openTests() {
    location.assign('./viewTests.html');
}
