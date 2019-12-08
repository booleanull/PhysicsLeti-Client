var form = document.querySelector('form');
var h2 = document.querySelector('h2');
var link = document.createElement('div');
var forget = document.querySelector('.forget');
const URL = 'http://localhost:8080';

link.innerHTML = '<a href="index.html"> Вернуться на страницу авторизации</a>';
link.style.textAlign = 'center';
link.style.marginTop = '20px';

function takeData() {
    var jsonObject = {};
    jsonObject.email = document.getElementById("userEmail").value;
    return jsonObject;
}

function noticeComplete(e) {
    form.style.display = 'none';
    h2.innerHTML = "Сообщение со ссылкой на восстановление пароля было выслано вам на почту";
    forget.appendChild(link);
}

function ajax_post(url) {
    var xmlhttp = new XMLHttpRequest();

    var jsonToSend = JSON.stringify(takeData(), null, ' ');
    console.log(jsonToSend);

    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("token", localStorage.getItem("token"));
    xmlhttp.onload = function () {
        if (xmlhttp.status != 200 && xmlhttp.readyState == 4)
            $.notify("Пользователь с таким адресом отсутствует!", {type: 'danger'});
        else {
            try {
                var data = JSON.parse(xmlhttp.responseText);

                noticeComplete();
                console.log(data.status);

            } catch (err) {
                console.log(err.message + " in " + xmlhttp.responseText);
            }
        }
    };
    xmlhttp.send(jsonToSend);
}

window.addEventListener('submit', function (e) {
    e.preventDefault();
    ajax_post(`${URL}/forget`);
});
