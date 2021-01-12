document.addEventListener("DOMContentLoaded", function () {
    listeningWebSocket()
    document.getElementById('user-messages').addEventListener('click', getMessagesOfUser)
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

        } else if (window.getComputedStyle(generalMsg)['display'] === 'none') {

        }

        // if (document.getElementById('msg-value') !== null) {

        //     if (data.reciever === sender) {
        //         sendMessage('other', data.message);
        //     }
        // }else if(document.getElementById('msg-icon') !== null){

        // }else{
        //     const not = document.getElementById("notif-count");
        //     if(not.innerText === '') not.innerText = "1";
        //     else {not.innerText = parseInt(not.innerText) + 1};

        // }
    }

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');

    };



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