
const socket = io(location.href, {
    "force new connection": true,
    "reconnectionAttempts": "Infinity",
    "timeout": 10001,
    "transports": ["websocket"]
})

socket.on('connect', function () {
    let username = prompt("Type your nickname: ")
    while (username == "" || username == undefined) {
        username = prompt("Your nickname can't be empty! Type your nickname: ")
    }
    socket.emit('adduser', username)
    WINDOWusername = username
})
function debug() {
    socket.emit('debug')
}
socket.on('debugoutput', function (a, b, c) {
})
socket.on('getMyID', function (ID) {
    WINDOWuserID = ID
})

