window.socketRoom = 'Default'
socket.on('updaterooms', function (roomsObj, current_room) {
    if (current_room == undefined) {
        current_room = window.socketRoom
    } else {
        window.socketRoom = current_room
    }
    function count(userlist) {
        if (userlist == undefined || userlist == []) {
            return 0
        }
        return userlist.length
    }
    console.log(roomsObj)
    rooms = Object.keys(roomsObj)
    if (current_room == "Default") {
        $('#ready').css('display', 'none')
    } else {
        $('#ready').css('display', '')
    }
    $('#rooms').empty()
    $.each(rooms, function (key, value) {

        if (value == 'Default' && value != current_room) {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>')
        }
        else if (value == 'Default' && value == current_room) {
            $('#rooms').append('<div>' + value + '</div>')
        }
        else if (value == current_room || count(roomsObj[value].userlist) == 4) {
            $('#rooms').append('<div>' + value + ' ' + count(roomsObj[value].userlist) + '/4 </div>')
        }
        else {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + ' ' + count(roomsObj[value].userlist) + '/4 </a></div>')
        }


    })
})

function switchRoom(room) {
    socket.emit('switchRoom', room)

    socket.on('lobbyuserlist', function (userlist, userdata) {
        $('#user-list').empty()

        let dataMap = []
        if (userdata != undefined) {
            for (let property in userdata) {
                dataMap.push([userdata[property].nickname, userdata[property].ready])
            }
            //console.log(dataMap)
        }

        let readyState = false
        userlist.forEach((nickname) => {
            if (dataMap != undefined) {
                readyState = dataMap.filter(a => a[0] == nickname)[0][1]
            } else {
                readyState = false
            }


            $('#user-list').append('<div class="nickname" >' + `${nickname}` + '<input disabled="disabled" type="checkbox" class="ready-state" id="state-' + nickname + '" name="readystate" > </div>')
            $('state-' + nickname).prop('checked', readyState)
        })



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