const URL = 'http://localhost:8080';
window.onload = function () {
    if (localStorage.getItem('userType') === '0')
        location.href = 'student.html';
    else if (localStorage.getItem('userType') === '1')
        location.href = 'teacher.html';
    else if (localStorage.getItem('userType') === '2')
        location.href = 'admin.html';
}

function takeData() {
    var jsonObject = {};
    jsonObject.email = document.getElementById("userEmail").value;
    jsonObject.password = document.getElementById("userpass").value;
    return jsonObject;
}

function saveToken(token, type, id, name) {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('userType', String(type));
    window.localStorage.setItem('userId', id);
    window.localStorage.setItem('userName', name);
}

function ajax_post(url)
{
    var xmlhttp = new XMLHttpRequest();

    var jsonToSend = JSON.stringify(takeData(), null, ' ');
    console.log(jsonToSend);

    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onload = function()
    {
        if (xmlhttp.status == 405) {
            $.notify("Дождитесь, когда администратор одобрит вашу заявку!", {type: 'danger'});
        }
        else if(xmlhttp.status != 200 && xmlhttp.readyState==4)
        $.notify("Ошибка входа!", {type: 'danger'});
        else {
            try {
                var data = JSON.parse(xmlhttp.responseText);
                if (data.status != "error") {
                    console.log(data.token);
                    saveToken(data.token, data.type, data.id, data.name);
                    switch (data.type) {
                        case 0:
                            document.location.href = "student.html";
                            break;
                        case 1:
                            document.location.href = "teacher.html";
                            break;
                        case 2:
                            document.location.href = "admin.html";
                            break;
                        default:
                            alert("error type");
                    }
                } else {
                    $.notify("Ошибка входа!", {type: 'danger'});
                }
            } catch(err) {
                console.log(err.message + " in " + xmlhttp.responseText);
            }
        }
    };
    xmlhttp.send(jsonToSend);
}

document.getElementById('enter').addEventListener('click', function () {
    ajax_post(`${URL}/auth`);
});
