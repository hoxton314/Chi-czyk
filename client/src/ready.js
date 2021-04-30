function readyState(ready) {
    socket.emit('readyChange', ready)
}

$(function () {
    $('#input-ready').prop('checked', false)
    $('#input-ready').change(function () {
        readyState($(this).prop('checked'))
    })
    socket.on('buttonchangestate', function (usernameID, state) {
        $('#state-' + usernameID).prop('checked', state)
    })
})
