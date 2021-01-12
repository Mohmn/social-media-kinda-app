document.addEventListener("DOMContentLoaded", function () {

    let user_messages = document.getElementsByClassName('message-box')

    for (let index = 0; index < user_messages.length; index++) {
        user_messages[index].addEventListener('click', function () {
            
            loadMessagesOfUser(this.children[0].innerText)
        })
    }
    document.getElementById('back-button').addEventListener('click',delDivMsgsAndGetBack)
    document.getElementById('msg-value').addEventListener('keyup', checkmsg)
    document.getElementsByClassName('fa-caret-right')[0].addEventListener('click',scrollBottom)
})



function scrollBottom(){
    console.log("addd")
    const message  = document.getElementById('msg-value').value
    addMessagesTodiv(document.getElementById('load_messages_user'),'m',message)
    const scrollDiv = document.getElementById('partic-msg-id')
    scrollDiv.scrollTop = scrollDiv.scrollHeight

}

function delDivMsgsAndGetBack(){
        document.getElementById('general_msgs').style.display = "block";
        document.getElementById('partic-msg').style.display = "none";
        const msgDiv = document.getElementById('load_messages_user')
        const numChildren = msgDiv.childElementCount
        for(let i=0;i<numChildren;i++){
            msgDiv.removeChild(msgDiv.children[0])
        }

}


function loadMessagesOfUser(second_user) {
    console.log(second_user)
    fetch(`message_history/${second_user}`).
    then(response => response.json())
        .then(messages => {

            messages = messages['messages']
            document.getElementById('secUserName').innerText = second_user
            document.getElementById('general_msgs').style.display = "none";
            document.getElementById('partic-msg').style.display = "block";
            const msgDiv = document.getElementById('load_messages_user')
            for(let index=messages.length-1;index>=0;index--){
                addMessagesTodiv(msgDiv,messages[index]['sender'],messages[index]['text'])
            }
            
        })
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


function addMessagesTodiv(Div,user,text){
    const  indivMsgDiv = document.createElement('div')
    indivMsgDiv.className ="form-group message-box border-bottom"

    const userName = document.createElement('h6')
    userName.className="message-user"
    userName.innerText = user

    const message = document.createElement('small')
    message.className = "message-text"
    message.innerText = text

    indivMsgDiv.appendChild(userName)
    indivMsgDiv.appendChild(message)

    Div.appendChild(indivMsgDiv)

}