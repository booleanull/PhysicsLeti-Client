console.log('ok');
document.body.style.visibility = "visible";
const URL = 'http://83.166.240.14:8080';
let xmlHttp = new XMLHttpRequest();

window.onload = onload_page();

function onload_page() {
    ajax_post(`${URL}/api/teach`, null, function () {
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

function send_mark(id) {
    let jsonObject = {};
    jsonObject.id = id;
    jsonObject.mark = document.getElementById(id).value;
    console.log(jsonObject);

    ajax_post(`${URL}/api/teach/mark`, jsonObject, function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            onload_page()
            $.notify("Ваша оценка была успешно выставлена.", {type: 'success'});

        } else {
            console.log("error");
        }
    })
}

function ajax_post(url, json, func) {
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
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
    var navigation = '';
    var title = "Открытые";
    var typecontent = "";
    navigation += '<div class="card card-labs"><div class="card-header">\n' +
        '                    <h3>' + title + '</h3>\n' +
        '                </div><div class="card-body">\n' +
        '                    <div class="card-text">'
    data.open.forEach(function (labwork) {
        navigation += '<div class="card mb-3">\n' +
            '                            <div class="card-header" id="heading' + labwork.labwork.id + '" data-toggle="collapse" data-target="#collapse' + labwork.labwork.id + '" aria-expanded="false" aria-controls="collapse' + labwork.labwork.id + '">\n' +
            '                                <h4 class="mb-0">\n' +
            labwork.labwork.title +
            '                                </h4>\n' +
            '<h5 class="float-right">'+ labwork.user.groupNumber+' '+ labwork.user.firstName+' '+ labwork.user.lastName + '</h5>' +
            '                            </div>\n' +
            '                            <div id="collapse' + labwork.labwork.id + '" class="collapse" aria-labelledby="heading' + labwork.labwork.id + '">\n' +
            '                                <div class="card-body"><p>' + labwork.labwork.description + '</p>' + labwork.labwork.protocol;

        typecontent = '<a class="float-right btn btn-primary" target="_blank" href="' + labwork.labwork.answer + '" download>Скачать отчет</a><div class="input-group">\n' +
            '  <input id="'+ labwork.labwork.id +'" type="text" class="mark form-control" aria-label="">\n' +
            '  <div class="input-group-append">\n' +
            '    <button type="button" onclick="send_mark('+labwork.labwork.id+')" class="mark btn btn-outline-primary">Оценить</button>\n' +
            '  </div>\n' +
            '</div>'

        navigation += typecontent;

        navigation += '</div></div></div>'
    });
    navigation += '</div></div></div>'
    navigation += '</div>\n' +
        '                </div>'
    document.getElementById('list').innerHTML = navigation;

    var navigation = '';
    var title = "Закрытые";
    var typecontent = "";
    navigation += '<div class="card card-labs"><div class="card-header">\n' +
        '                    <h3>' + title + '</h3>\n' +
        '                </div><div class="card-body">\n' +
        '                    <div class="card-text">'
    data.close.forEach(function (labwork) {
        navigation += '<div class="card mb-3">\n' +
            '                            <div class="card-header" id="heading' + labwork.labwork.id + '" data-toggle="collapse" data-target="#collapse' + labwork.labwork.id + '" aria-expanded="false" aria-controls="collapse' + labwork.labwork.id + '">\n' +
            '                                <h4 class="mb-0">\n' +
            labwork.labwork.title +
            '                                </h4>\n' +
            '<h5 class="float-right">'+ labwork.user.groupNumber+' '+ labwork.user.firstName+' '+ labwork.user.lastName + '</h5>' +
            '                            </div>\n' +
            '                            <div id="collapse' + labwork.labwork.id + '" class="collapse" aria-labelledby="heading' + labwork.labwork.id + '">\n' +
            '                                <div class="card-body"><p>' + labwork.labwork.description + '</p>' + labwork.labwork.protocol;

        typecontent = '<a class="float-right btn btn-primary" target="_blank" href="' + labwork.labwork.answer + '" download>Скачать отчет</a><h3 class="float-left">Оценка: '+ labwork.labwork.mark +'</h3>'

        navigation += typecontent;

        navigation += '</div></div></div>'
    });
    navigation += '</div></div></div>'
    navigation += '</div>\n' +
        '                </div>'
    document.getElementById('list').innerHTML += navigation
}
