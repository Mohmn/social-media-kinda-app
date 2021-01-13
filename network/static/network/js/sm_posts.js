document.addEventListener("DOMContentLoaded", function () {
    let likeButtons = document.getElementsByClassName('like-but')
    for (let i = 0; i < likeButtons.length; i++) {
        likeButtons[i].addEventListener('click', animate, false)
    }
    let follow_buttons = document.getElementsByClassName('fol-button')
    for (let i = 0; i < follow_buttons.length; i++) {
        follow_buttons[i].addEventListener('click', followUser, false)
    }
    document.getElementById('following').addEventListener('click', () => follow_list('following'))
    document.getElementById('followers').addEventListener('click', () => follow_list('followers'))
    document.getElementById('close').addEventListener('click', function () {
        const list = document.getElementById('follow-list')
        document.querySelectorAll("nav,.body>*:not(#follow-list)").forEach(element => element.style.filter = "");
        list.style.display = 'none'
        const dl = document.getElementById('dynamicList')
        dl.parentNode.removeChild(dl)

    })
    document.getElementById('msg-value').addEventListener('keyup', checkmsg)
    document.getElementById('msg-icon').addEventListener('click', sendingWebSocket)

})

function connectToWebsocket() {
    const roomName = document.getElementsByClassName('msg-head')[0].textContent;
    const sender  = document.getElementById('username').textContent;
    const reciever = document.getElementById('msg-user').textContent;
    console.log(roomName,sender,reciever)
    const chatSocket = new WebSocket(
        'ws://' +
        window.location.host +
        '/ws/dm/' +
        roomName
    );

    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        console.log(data)
        if(data.reciever === sender){
        sendMessage('other',data.message);
        }
    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');

    };

    document.getElementsByClassName('fa-caret-right')[0].onclick = function (e) {
        const message = sendMessage('myself');
        chatSocket.send(JSON.stringify({
            'message': message,
            'sender': sender,
            'reciever': reciever,
            'type':'message',
        }));
    }
}



function sendingWebSocket() {
    // const roomName = document.getElementsByClassName('msg-head')[0].textContent;
    const sender  = document.getElementById('username').textContent;
    const reciever = document.getElementById('msg-user').textContent;
    const roomName = reciever
    console.log(roomName,sender,reciever)
    const chatSocket = new WebSocket(
        'ws://' +
        window.location.host +
        '/ws/dm/' +
        roomName
    );

    // chatSocket.onmessage = function (e) {
    //     const data = JSON.parse(e.data);
    //     console.log(roomName,sender,reciever,'r')
    //     console.log(data)
    //     if(data.reciever === sender){
    //     sendMessage('other',data.message);
    //     }
    // };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');

    };

    document.getElementsByClassName('fa-caret-right')[0].onclick = function (e) {
        console.log(roomName,sender,reciever,'s')
        const message = sendMessage('myself');
        chatSocket.send(JSON.stringify({
            'message': message,
            'sender': sender,
            'reciever': reciever,
            'type':'chat_message',
        }));
    }
}

function animate() {
    if (window.getComputedStyle(this)['color'] === "rgb(207, 201, 201)") {
        console.log('yes')
        this.style.color = "red"
    } else {
        this.style.color = "#cfc9c9"
    }
}

function checkmsg() {
    console.log(this.value.match(/^\s*$/), this.value.match(/^\s*$/) === null)
    if (this.value.length > 0) {
        if (this.value.match(/^\s*$/) === null) {
            document.getElementsByClassName('fa-caret-right')[0].style.display = "block"
            // this.style.height = (this.scrollHeight)+"px";
        } else {
            document.getElementsByClassName('fa-caret-right')[0].style.display = "none"

        }
    } else {
        document.getElementsByClassName('fa-caret-right')[0].style.display = "none"
    }


}

function sendMessage(who,recieved_msg) {

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

function follow_list(tap) {
    document.getElementById('disp-fol').innerText = tap
    if (window.getComputedStyle(document.getElementById('follow-list'))['display'] === "none") {
        fetch(`/${tap}/${document.getElementsByClassName('unm')[0].innerText}`).
        then(response => response.json()).
        then(data => {
            console.log(data)
            const list = document.getElementById('follow-list')
            document.querySelectorAll("nav,.body>*:not(#follow-list):not(.modal)").forEach(element => element.style.filter = "blur(1px)");
            list.style.display = 'block'
            const users = data['users']
            const itemDiv = document.createElement('div')
            itemDiv.setAttribute('id', 'dynamicList')
            for (let i = 0; i < users.length; i++) {
                const item = document.createElement('li')
                const spn = document.createElement('span')
                const follow_button = document.createElement('button')
                item.className = "list-group-item border-0 follow-list-item d-flex justify-content-between align-items-center"
                item.innerText = users[i]
                spn.className = "fol-left"
                if (data['all']) {
                    follow_button.className = "fol-button btn btn-success z-modal"
                    follow_button.setAttribute('data-bs-toggle', "modal")
                    follow_button.setAttribute('data-bs-target', "#exampleModal")
                    follow_button.addEventListener('click', followUser)
                } else {
                    if (data['if_loogedIn_user_follows'][i]) {
                        follow_button.className = "fol-button btn btn-success z-modal"
                        follow_button.setAttribute('data-bs-toggle', "modal")
                        follow_button.setAttribute('data-bs-target', "#exampleModal")
                        follow_button.addEventListener('click', followUser)
                    } else {
                        follow_button.className = "fol-button btn btn-outline-success z-modal"
                        follow_button.setAttribute('data-bs-toggle', "modal")
                        follow_button.setAttribute('data-bs-bstarget', "#examplModal")
                        follow_button.addEventListener('click', followUser)
                    }
                }
                follow_button.innerText = "follow"
                item.appendChild(spn)
                spn.appendChild(follow_button)

                itemDiv.appendChild(item)
            }
            list.appendChild(itemDiv)
        })

    }
}

function followUser() {
    let contains = this.classList.contains('z-modal') // is the user request.user or other user
    if (contains) {
        document.getElementsByClassName('m_b')[0].innerText = "Unfollow " + this.parentElement.previousSibling.nodeValue
    }
    if (this.classList.contains('btn-outline-success')) {
        let name
        if (contains) {
            name = this.parentElement.previousSibling.nodeValue

        } else {
            name = this.previousElementSibling.innerText
        }
        fetch('/update_followers/follow', {
                method: "POST",
                "headers": {
                    "X-CSRFToken": getCookie('csrftoken')
                },
                body: JSON.stringify({
                    uname: name
                })
            }).then(response => response.json())
            .then(data => {
                this.classList.remove("btn-outline-success")
                this.classList.add("btn-success")
                FollowButtonOnPage(contains)
                this.setAttribute("data-bs-target", "#exampleModal")
            })

    } else {

        const follow_button = this
        let clicked = true
        document.getElementsByClassName('unfollow-md')[0].onclick = function () {

            if (clicked) {

                clicked = false
                let name
                if (contains) {
                    name = follow_button.parentElement.previousSibling.nodeValue

                } else {
                    name = follow_button.previousElementSibling.innerText
                }

                fetch('/update_followers/unfollow', {
                        method: "POST",
                        "headers": {
                            "X-CSRFToken": getCookie('csrftoken')
                        },

                        body: JSON.stringify({
                            uname: name
                        })
                    }).then(response => response.json())
                    .then(data => {
                        document.getElementsByClassName('cls-md')[0].click()
                        unFollowButtonOnPage(contains, follow_button)
                        clicked = true
                    })
            }

        }

    }

}

function FollowButtonOnPage(clicked_on_following) {
    const myProfilePage = (document.getElementById('username').innerText === document.getElementsByClassName('unm')[0].innerText)
    if (clicked_on_following && myProfilePage) {
        const following = document.getElementsByClassName('folwi')[0]
        following.innerText = (parseInt(following.innerText.split(" ")[0]) + 1).toString() + " " + "following"
    } else if (!clicked_on_following) {
        const followers = document.getElementsByClassName('folwe')[0]
        followers.innerText = (parseInt(followers.innerText.split(" ")[0]) + 1).toString() + " " + "followers"
    }

}

function unFollowButtonOnPage(clicked_on_following, button) {
    const myProfilePage = (document.getElementById('username').innerText === document.getElementsByClassName('unm')[0].innerText)
    if (clicked_on_following && myProfilePage) {
        const following = document.getElementsByClassName('folwi')[0]
        if (parseInt(following.innerText.split(" ")[0]) > 0) {
            following.innerText = (parseInt(following.innerText.split(" ")[0]) - 1).toString() + " " + "following"
        }
    } else if (!clicked_on_following) {
        const followers = document.getElementsByClassName('folwe')[0]
        if (parseInt(followers.innerText.split(" ")[0]) > 0) {
            followers.innerText = (parseInt(followers.innerText.split(" ")[0]) - 1).toString() + " " + "followers"
        }
    }
    button.classList.remove("btn-success")
    button.classList.add("btn-outline-success")
    button.setAttribute("data-bs-target", "#examplModal")
    button.addEventListener('click', followUser)
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