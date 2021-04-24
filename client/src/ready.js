function readyState(ready) {

    socket.emit('readyChange', ready)


}

socket.on('buttonchangestate', function (username, state) {
    console.log('#state-' + username + ' ' + state)
    $('#state-' + username).attr('checked', state)
})

//state-' + nickname

$(function () {
    $('#input-ready').prop('checked', false)
    $('#input-ready').change(function () {
        //console.log($(this).prop('checked'))
        readyState($(this).prop('checked'))
    })
})