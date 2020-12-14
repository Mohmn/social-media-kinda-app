document.addEventListener("DOMContentLoaded", function () {
    listeningWebSocket()
})


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
        
        if (document.getElementById('msg-value') !== null) {

            if (data.reciever === sender) {
                sendMessage('other', data.message);
            }
        }else if(document.getElementById('msg-icon') !== null){

        }else{
            const not = document.getElementById("notif-count");
            if(not.innerText === '') not.innerText = "1";
            else {not.innerText = parseInt(not.innerText) + 1};
            
        }

        chatSocket.onclose = function (e) {
            console.error('Chat socket closed unexpectedly');

        };

    }

}