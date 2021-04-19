
const socket = io("http://localhost:8080", {
    "force new connection": true,
    "reconnectionAttempts": "Infinity",
    "timeout": 10001,
    "transports": ["websocket"]
})


//var socket = io.connect('http://localhost:8000')

socket.on('connect', function () {
    socket.on('getUserList', function (userlist) {
        let username = prompt("Type your nickname: ")
        while (username == "" | username == undefined | userlist.hasOwnProperty(username)) {
            if (username == "" | username == undefined) {
                username = prompt("Your nickname can't be empty! Type your nickname: ")
            } else {
                username = prompt("This nickname is taken! Type your nickname: ")
            }
        }
        socket.emit('adduser', username)
    })
})


