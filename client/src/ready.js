
function readyState(ready) {

    socket.emit('readyChange', ready)


}



//state-' + nickname

$(function () {

    $('#input-ready').prop('checked', false)
    $('#input-ready').change(function () {
        //console.log($(this).prop('checked'))
        readyState($(this).prop('checked'))
    })

    socket.on('buttonchangestate', function (usernameID, state) {

        console.log($('#state-' + usernameID))
        //$('#state-' + username).css('display', state)
        $('#state-' + usernameID).prop('checked', state)
    })



})
