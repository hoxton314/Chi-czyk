
$(function () {

    $('#datasend').click(function () {
        var message = $('#data').val()
        $('#data').val('')
        if (message != undefined && message != '') {
            socket.emit('sendchat', message)
        }

    })

    $('#data').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur()
            $('#datasend').focus().click()
        }
    })

})

socket.on('updatechat', function (username, data) {
    $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>')
})



