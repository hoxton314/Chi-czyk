
socket.on('updaterooms', function (rooms, current_room) {
    if (current_room == "Default") {
        $('#ready').css('display', 'none')
    } else {
        $('#ready').css('display', '')
    }
    $('#rooms').empty()
    $.each(rooms, function (key, value) {
        if (value == current_room) {
            $('#rooms').append('<div>' + value + '</div>')
        }
        else {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>')
        }
    })
})

function switchRoom(room) {
    socket.emit('switchRoom', room)

    socket.on('lobbyuserlist', function (userlist) {
        $('#user-list').empty()

        for ([key, value] of Object.entries(userlist)) {
            $('#user-list').append('<div class="nickname" >' + `${value.nickname}` + '</div>')
        }

        // userlist.forEach(element => {
        //    $('#user-list').append('<div class="nickname" >' + element + '</div>')
        //})

    })
}

$(function () {
    $('#roombutton').click(function () {
        if ($('#roomname').val() != "") {
            var name = $('#roomname').val()
            $('#roomname').val('')
            socket.emit('create', name)
        }
    })
})