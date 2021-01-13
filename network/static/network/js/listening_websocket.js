document.addEventListener("DOMContentLoaded", function () {
    listeningWebSocket()
    // document.getElementById('user-messages').addEventListener('click', getMessagesOfUser)
})

function getMessagesOfUser() {

    console.log("yep clicked")

    fetch('/recent_messages', {}).then(response => response.json())
        .then(data => {
            console.log(data)
        })
}

function listeningWebSocket() {
    const sender = document.getElementById('username').textContent;
    const reciever = sender;
    const roomName = sender
    console.log(roomName, sender, reciever)
    const chatSocket = new WebSocket(
        'ws://' +
        window.location.host +
        '/ws/dm/' +
        roomName
    );

    chatSocket.onmessage = function (e) {
        console.log(roomName, sender, reciever, 'r')
        const data = JSON.parse(e.data);
        console.log(data)

        const generalMsg = document.getElementById('general_msgs')
        const privateMsg = document.getElementById('partic-msg')
        if (generalMsg !== null) {
            // means page is on the main page
            if (window.getComputedStyle(generalMsg)['display'] === 'block') {
                const msgTo = document.getElementsByClassName(`${data['sender']}` + 'Msg')[0]
                let notifications = msgTo.children[1].children[1].innerText
                msgTo.children[1].children[0].innerText = data['message']
                if (notifications === '') {
                    msgTo.children[1].children[1].innerText = '1'
                } else {
                    console.log("int")
                    msgTo.children[1].children[1].innerText = parseInt(notifications) + 1
                }

            } else if (window.getComputedStyle(privateMsg)['display'] === 'block') {
                console.log("yiiiiiiiii", data['sender'])
                if (data['sender'] === document.getElementById('secUserName').innerText) {

                    const msgDiv = document.getElementById('load_messages_user')
                    addMessagesTodiv(msgDiv, data['sender'], data['message'])

                    const scrollDiv = document.getElementById('partic-msg-id')
                    scrollDiv.scrollTop = scrollDiv.scrollHeight
                }

            }
        } else {
            // means  user is one the profile page
            console.log("profile page")
            const messages = document.getElementById('messages')
            if (messages !== null) {

                if (window.getComputedStyle(messages)['display'] === 'block') {

                    if (data.reciever === sender) {
                        sendMessage('other', data.message);
                    }
                } else if (document.getElementById('msg-icon') !== null) {
                    console.log("notiffffffff")
                    const notif = document.getElementsByClassName('badge')[0]
                    if (notif.innerText === '') notif.innerText = "1";
                    else {
                        notif.innerText = parseInt(notif.innerText) + 1
                    };
                }
            }
        }


        chatSocket.onclose = function (e) {
            console.error('Chat socket closed unexpectedly');

        };



    }
}


function getCookie(name) {
    var cookieValue = null

    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";")
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim()
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

function addMessagesTodiv(Div, user, text) {
    const scrollDiv = document.getElementById('partic-msg-id')
    scrollDiv.scrollTop = scrollDiv.scrollHeight

    const indivMsgDiv = document.createElement('div')
    indivMsgDiv.className = "form-group message-box border-bottom"

    const userName = document.createElement('h6')
    userName.className = "message-user"
    userName.innerText = user

    const message = document.createElement('small')
    message.className = "message-text"
    message.innerText = text

    indivMsgDiv.appendChild(userName)
    indivMsgDiv.appendChild(message)

    Div.appendChild(indivMsgDiv)

}

function sendMessage(who, recieved_msg) {

    let msgBody = document.getElementsByClassName('message-body')[0];
    let msg = document.createElement('div');

    let msgValue = document.createElement('p');
    msgValue.className = "text-msg";
    if (who === 'myself') {
        msg.className = "message-content-sender";
        msgValue.innerText = document.getElementById('msg-value').value;
        document.getElementsByClassName('fa-caret-right')[0].style.display = "none";
    } else {
        msg.className = "message-content-reciever";
        msgValue.innerText = recieved_msg;
    }


    msg.appendChild(msgValue);
    msgBody.appendChild(msg);
    document.getElementById('msg-value').value = "";

    return msgValue.innerText;
}