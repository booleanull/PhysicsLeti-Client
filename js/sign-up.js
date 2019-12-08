var teacher = document.getElementById('teacher');
var divNumber = document.getElementById('isStudent');
const URL = 'http://localhost:8080';
var type_tmp = 0;

function showNumber() {
    if (teacher.checked) {
        divNumber.style.display = "none";
        type_tmp = 1;
    } else {
        divNumber.style.display = "block";
    }
}
window.addEventListener("change", showNumber, false);

function takeData() {
    if (document.getElementById("userpass").value === document.getElementById("userpass2").value) {
        var jsonObject = {};
        jsonObject.email = document.getElementById("userEmail").value;
        jsonObject.firstName = document.getElementById("firstname").value;
        jsonObject.lastName = document.getElementById("secondname").value;
        jsonObject.type = parseInt(type_tmp);
        jsonObject.groupNumber = teacher.checked ? 0 : parseInt(document.getElementById('groupnumber').value);
        jsonObject.password = document.getElementById("userpass").value;
        if (jsonObject.password.length < 8){
            $.notify("Длина пароля должна быть больше 8 символов!", {type: 'danger'});
            return undefined;
        }
        else {
            return jsonObject;
        }
    }
    else{
        $.notify("Пароли не совпадают!", {type: 'danger'});
        return undefined;
    }
}

function ajax_post(url)
{
    var xmlhttp = new XMLHttpRequest();

    var data = takeData()
    if(data !== undefined) {

        var jsonToSend = JSON.stringify(takeData(), null, ' ');
        console.log(jsonToSend);

        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");

        xmlhttp.onload = function () {
            if(xmlhttp.status === 401)
                $.notify("Пользователь с такими данными уже зарегистрирован!", {type: 'danger'});
            else if (xmlhttp.status != 200 && xmlhttp.readyState == 4)
                $.notify("Ошибка регистрации!", {type: 'danger'});
            else {
                try {
                    var data = JSON.parse(xmlhttp.responseText);
                    location.href = 'index.html';
                } catch (err) {
                    console.log(err.message + " in " + xmlhttp.responseText);
                }
            }
        };
        xmlhttp.send(jsonToSend);
    }
}

window.addEventListener('submit', function (e) {
    e.preventDefault();
    ajax_post(`${URL}/register`);
});
