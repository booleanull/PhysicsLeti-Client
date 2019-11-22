let xmlHttp = new XMLHttpRequest();
const URL = 'http://83.166.240.14:8080';
// When our page is Ready
window.onload = onload_page();

function onload_page() {
    ajax_post(`${URL}/api/lab/my`, null, function () {
        if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
            try {
                let data = JSON.parse(xmlHttp.responseText);
                update_list(data.types)
            } catch (err) {
                console.log(err.message + " in " + xmlHttp.responseText);
            }
        } else {
            console.log("error");
        }
    });
}

function send_answer(id) {
    var file = document.querySelector(`#file-upload${id}`).files[0];
    if (typeof file == 'undefined') {
        return;
    }
    var storageRef = firebase.storage().ref('answers/' + file.name);
    var uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        $.notify("Ожидайте! " + parseInt(progress), {type: 'primary'});
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        // Handle unsuccessful uploads
    }, function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log('File available at', downloadURL);
            let jsonObject = {};
            jsonObject.id = id;
            jsonObject.answer = downloadURL;
            ajax_post(`${URL}/api/lab/answer`, jsonObject, function () {
                if (xmlHttp.status === 200 && xmlHttp.readyState === 4) {
                    try {
                        let data = JSON.parse(xmlHttp.responseText);
                        onload_page()
                        $.notify("Ваш отчет был успешно отправлен! Состояние вашей работы можете посмотреть у себя в профиле.", {type: 'success'});
                    } catch (err) {
                        console.log(err.message + " in " + xmlHttp.responseText);
                    }
                } else {
                    $.notify("Ошибка! Ваш отчет уже доставлен. Состояние вашей работы можете посмотреть у себя в профиле.", {type: 'danger'});
                }
            });
        });
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
    var navigation = '';
    data.forEach(function (types) {
        var title = ""
        var typecontent = ""
        if (types.type === 0) {
            title = "Открытые"
        } else if (types.type === 1) {
            title = "Проверяются"
        } else {
            title = "Закрытые"
        }
        navigation += '<div class="card card-labs"><div class="card-header">\n' +
            '                    <h3>' + title + '</h3>\n' +
            '                </div><div class="card-body">\n' +
            '                    <div class="card-text">'
        types.labworks.forEach(function (labwork) {
            navigation += '<div class="card mb-3">\n' +
                '                            <div class="card-header" id="heading' + labwork.id + '" data-toggle="collapse" data-target="#collapse' + labwork.id + '" aria-expanded="false" aria-controls="collapse' + labwork.id + '">\n' +
                '                                <h4 class="mb-0">\n' +
                labwork.title +
                '                                </h4>\n' +
                '                            </div>\n' +
                '                            <div id="collapse' + labwork.id + '" class="collapse" aria-labelledby="heading' + labwork.id + '">\n' +
                '                                <div class="card-body"><p>' + labwork.description + '</p>' + labwork.protocol;

            if (types.type === 0) {
                typecontent = '<input id="file-upload'+ labwork.id + '" type="file" accept=".docx, .pdf, .doc"><button id="button_send" type="button" class="btn btn-primary float-right" onclick="send_answer(' + labwork.id + ')">Отправить отчет</button>'
            } else if (types.type === 1) {
                typecontent = '<a class="float-right btn btn-primary" target="_blank" href="'+ labwork.answer +'" download>Скачать отчет</a> Еще не оцененно'
            } else {
                typecontent = '<button id="button_send" type="button" class="btn btn-primary float-right" onclick="send_lab(' + labwork.id + ')">Скачать отчет</button><h3 class="float-left">Ваша оценка: '+ labwork.mark +'</h3>'
            }

            navigation += typecontent;

            navigation += '</div></div></div>'
        });
        navigation += '</div></div></div>'
    });
    navigation += '</div>\n' +
        '                </div>'
    document.getElementById('mylab').innerHTML = navigation
}
