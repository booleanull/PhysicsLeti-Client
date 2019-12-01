var xml = new XMLHttpRequest();
const URL = 'http://83.166.240.14:8080';
var upd_id;
var create_id;

// When our page is Ready
window.onload = onload_page();

function onload_page() {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", `${URL}/api/confirm`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    xmlHttp.setRequestHeader("token", localStorage.getItem('token'));

    xmlHttp.onload = function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            try {
                let data = JSON.parse(xmlHttp.responseText);
                update_list(data.users)
            } catch (err) {
                console.log(err.message + " in " + xmlHttp.responseText);
            }
        } else {
            console.log("error");
        }
    };
    xmlHttp.send();
}

function slide_labs() {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", `${URL}/api/lab`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    // TODO: Enter token
    xmlHttp.setRequestHeader("token", localStorage.getItem('token'));

    xmlHttp.onload = function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            try {
                let data = JSON.parse(xmlHttp.responseText);
                update_labs(data.labworks)
            } catch (err) {
                console.log(err.message + " in " + xmlHttp.responseText);
            }
        } else {
            console.log("error");
        }
    };
    xmlHttp.send();
}

function slide_teacher() {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", `${URL}/api/teachers`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    // TODO: Enter token
    xmlHttp.setRequestHeader("token", localStorage.getItem('token'));

    xmlHttp.onload = function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            try {
                let data = JSON.parse(xmlHttp.responseText);
                update_teachers(data.teachers)
            } catch (err) {
                console.log(err.message + " in " + xmlHttp.responseText);
            }
        } else {
            console.log("error");
        }
    };

    xmlHttp.send();
}

function send_accept(id, type) {
    let jsonObject = {};
    jsonObject.id = id;

    let url = ""
    if (type === true) {
        url = `${URL}/api/accept`
    } else {
        url = `${URL}/api/reject`
    }

    ajax_post(url, jsonObject, function () {
        if (xml.status === 200 && xml.readyState === 4) {
            onload_page()
        } else {
            console.log("error");
        }
    })
}

function send_delete(id) {
    let jsonObject = {};
    jsonObject.id = id;

    ajax_post(`${URL}/api/lab/delete`, jsonObject, function () {
        if (xml.status === 200 && xml.readyState === 4) {
            slide_labs()
        } else {
            console.log("error");
        }
    })
}

function send_create() {
    let jsonObject = {};
    jsonObject.title = document.getElementById('titlelab').value;
    jsonObject.theme = document.getElementById('themelab').value;
    jsonObject.description = document.getElementById('descriptionlab').value;
    jsonObject.protocol = document.getElementById('protocollab').value;
    jsonObject.link = document.getElementById('linklab').value;

    ajax_post(`${URL}/api/lab/create`, jsonObject, function () {
        if (xml.status === 200 && xml.readyState === 4) {
            slide_labs()
        } else {
            console.log("error");
        }
    })

    document.getElementById('titlelab').value = "";
    document.getElementById('themelab').value = "";
    document.getElementById('descriptionlab').value = "";
    document.getElementById('protocollab').value = "";
    document.getElementById('linklab').value = "";
}

function send_update() {
    let jsonObject = {};
    jsonObject.id = upd_id;
    jsonObject.title = document.getElementById('titlelabchange').value;
    jsonObject.theme = document.getElementById('themelabchange').value;
    jsonObject.description = document.getElementById('descriptionlabchange').value;
    jsonObject.protocol = document.getElementById('protocollabchange').value;
    jsonObject.link = document.getElementById('linklabchange').value;

    ajax_post(`${URL}/api/lab/update`, jsonObject, function () {
        if (xml.status === 200 && xml.readyState === 4) {
            slide_labs()
        } else {
            console.log("error");
        }
    })
}

function send_pre_update(id, title, theme, description, protocol, link) {
    upd_id = id;
    document.getElementById('titlelabchange').value = title;
    document.getElementById('themelabchange').value = theme;
    document.getElementById('descriptionlabchange').value = description;
    document.getElementById('protocollabchange').value = protocol;
    document.getElementById('linklabchange').value = link;
}

function send_create_teacher() {
    let jsonObject = {};
    jsonObject.groupNumber = document.getElementById('teacherin').value;
    jsonObject.id = create_id;

    ajax_post(`${URL}/api/teachers/set`, jsonObject, function () {
        if (xml.status === 200 && xml.readyState === 4) {
            slide_teacher()
        } else {
            console.log("error");
        }
    });

    document.getElementById('teacherin').value = "";
}

function send_pre_create_teacher(id) {
    create_id = id;
}

function send_delete_teacher(id, groupNumber) {
    let jsonObject = {};
    jsonObject.groupNumber = groupNumber
    jsonObject.id = id

    ajax_post(`${URL}/api/teachers/delete`, jsonObject, function () {
        if (xml.status === 200 && xml.readyState === 4) {
            slide_teacher()
        } else {
            console.log("error");
        }
    });
}

function ajax_post(url, json, func) {
    xml.open("POST", url, true);
    xml.setRequestHeader("Content-Type", "application/json");

    xml.setRequestHeader("token", localStorage.getItem('token'));

    xml.onload = func;

    if (json == null) {
        xml.send();
    } else {
        let jsonToSend = JSON.stringify(json, null, ' ');
        xml.send(jsonToSend)
    }
}

function update_list(data) {
    if (data.length === 0) {
        document.getElementById('inner_container').innerHTML = '<h5>Новых пользователей нет</h5>';
    } else {
        document.getElementById('inner_container').innerHTML = '';
    }
    data.forEach(function (it) {
        let typeString = "";
        if (it.type === 0) {
            typeString = "(" + it.groupNumber + ")";
        } else {
            typeString = "(Преподаватель)"
        }

        document.getElementById('inner_container').innerHTML += '<div class="card">\n' +
            '<div class="card-body">' +
            '<b class="align-middle">' + it.firstName + ' ' + it.lastName + ' ' + typeString + '</b>' +
            '<button class="btn btn-sm btn-primary btn-smbtn-primary float-right" onclick="send_accept(' + it.id + ', true)">' +
            'Принять' +
            '</button>' +
            '<button class="btn-dec btn-sm btn btn-secondary btn-smbtn-secondary float-right" onclick="send_accept(' + it.id + ', false)">' +
            'Отклонить' +
            '</button>' +
            '</div>' +
            '</div>'
    });
}

function update_labs(data) {
    document.getElementById('inner_container').innerHTML = '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addModalCenter">' +
        'ДОБАВИТЬ ЛАБОРАТОРНУЮ РАБОТУ' +
        '</button>';
    data.forEach(function (theme) {
        var navigation = '';
        var title = theme.theme;
        navigation += '<div class="card card-labs"><div class="card-header">\n' +
            '                    <h3>' + title + '</h3>\n' +
            '                </div><div class="card-body">\n' +
            '                    <div class="card-text">'
        theme.list.forEach(function (labwork) {
            navigation += '<div class="card mb-3">\n' +
                '                            <div class="card-header" id="heading' + labwork.id + '" data-toggle="collapse" data-target="#collapse' + labwork.id + '" aria-expanded="false" aria-controls="collapse' + labwork.id + '">\n' +
                '                                <h4 class="mb-0">\n' +
                labwork.title +
                '                                </h4>\n' +
                '                            </div>\n' +
                '                            <div id="collapse' + labwork.id + '" class="collapse" aria-labelledby="heading' + labwork.id + '">\n' +
                '                                <div class="card-body"><p>' + labwork.description + '</p>' + '<p>' + labwork.protocol + '</p>' + '<a href="' + labwork.link + '">' + labwork.link + '</a>' + '<button data-toggle="modal" data-target="#changeModalCenter" class="btn btn-sm btn-primary btn-smbtn-primary float-right" onclick="send_pre_update(' + labwork.id + ',\'' + labwork.title + '\',\'' + theme.theme + '\',\'' + labwork.description + '\',\'' + labwork.protocol + '\',\'' + labwork.link + '\')">' +
                'Редактировать' +
                '</button>' +
                '<button class="btn-dec btn-sm btn btn-secondary btn-smbtn-secondary float-right"  onclick="send_delete(' + labwork.id + ')">' +
                'Удалить' +
                '</button>';

            navigation += '</div></div></div>'
        });
        navigation += '</div></div></div>'
        navigation += '</div>\n' +
            '                </div>'
        document.getElementById('inner_container').innerHTML += navigation;

    });
}

function update_teachers(data) {
    document.getElementById('inner_container').innerHTML = '';
    data.forEach(function (it) {
        var navigation = '';
        navigation += '<div class="card card-labs"><div class="card-header">\n' +
            '                    <h4>' + it.firstName + ' ' + it.lastName + '<button class="btn-dec btn btn-primary btn-smbtn-primary float-right"  data-toggle="modal" onclick="send_pre_create_teacher(' + it.id + ')" data-target="#teacherModalCenter">' +
            'Добавить группу' +
            '</button></h4></div>';

        if (it.groups != undefined) {
            it.groups.forEach(function (group) {
                navigation += '<div class="card">' +
                    '<div class="card-body">' +
                    group +
                    '<button class="btn btn-sm btn-secondary btn-smbtn-secondary float-right" onclick="send_delete_teacher(' + it.id + ',' + group + ')">' +
                    'Удалить группу' +
                    '</button>' +
                    '</div>' +
                    '</div>';
            });
        }

        navigation += '</div></div></div>'
        navigation += '</div>\n' +
            '                </div>'
        document.getElementById('inner_container').innerHTML += navigation;

    });
    /*
    data.forEach(function (it) {
        document.getElementById('inner_container').innerHTML += '<div class="card">' +
            '<div class="card-body">' +
            '' + it.firstName + ' ' + it.lastName + ' ' + it.email +
            '<button class="btn btn-primary btn-smbtn-primary" data-toggle="modal" onclick="send_pre_create_teacher(' + it.id + ')" data-target="#teacherModalCenter">' +
            'Добавить группу' +
            '</button>' +
            '</div>' +
            '</div>';
        it.groups.forEach(function (group) {
            document.getElementById('inner_container').innerHTML += '<div class="card">' +
                '<div class="card-body">' +
                group +
                '<button class="btn btn-danger btn-smbtn-danger" onclick="send_delete_teacher(' + it.id + ',' + group + ')">' +
                'Удалить группу' +
                '</button>' +
                '</div>' +
                '</div>';
        });
    });
    */
}
function openTests() {
    location.assign('/tests.html');
}

