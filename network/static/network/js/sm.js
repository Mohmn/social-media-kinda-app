
document.addEventListener('DOMContentLoaded',function(){

    document.getElementById('post-b').addEventListener('click',sendData)
    // document.getElementById('all-posts').addEventListener('click',recieve_posts)
    
})

function sendData(){
    // console.log("dd")
    if(document.getElementById('post').value.match(/^\s*$/) !== null ){
        document.getElementById('post-i').innerText = "post can't be empty"
        console.log("ddd")
    }else{

        fetch('/update_post',{
            method: "POST",
            headers: { "X-CSRFToken":getCookie('csrftoken')},
            body: JSON.stringify({
              post:document.getElementById('post').value
            })
        }).then(response => response.json())
        .then(data => {console.log(data)}
        )


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