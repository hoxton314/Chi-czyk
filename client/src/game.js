import { Funcs } from './funcs.js'
$(function () {
    $('.MYpawn').css('filter', 'grayscale(0%)')
    $('.SYpawn').css('filter', 'grayscale(0%)')
    $('.MGpawn').css('filter', 'grayscale(0%)')
    $('.SGpawn').css('filter', 'grayscale(0%)')
    $('.MRpawn').css('filter', 'grayscale(0%)')
    $('.SRpawn').css('filter', 'grayscale(0%)')
    $('.MBpawn').css('filter', 'grayscale(0%)')
    $('.SBpawn').css('filter', 'grayscale(0%)')
    $('.tura').css('display', 'none')
})
socket.on('gamestart', function (colordata,) {
    $('#list-container').css('display', 'none')
    $('.inner-ready').css('display', 'none')
    $('.ready-state').css('display', 'none')
    $('#game-container').css('display', '')
    $('.tura').css('display', '')
    //console.log(colordata)
    //console.log(WINDOWusername)
    console.log('---------------------------')
    console.log(colordata)
    console.log(WINDOWuserID)
    colordata.forEach(element => {
        if (element[0] == WINDOWuserID) { document.WINDOWcolor = element[1] }
    })
    console.log('Color assigned is: ' + document.WINDOWcolor)

})


socket.on('updateGameState', function (playerColor, throwCount, data) {
    console.log('Tura: ' + playerColor)

    $('.turatext').text('Tura: ' + Funcs.translate(playerColor))
    console.log(data)
    Funcs.gameRenderer(data, playerColor, throwCount, document.WINDOWcolor)

    //animCounter = 0
    //function animStop() {
    //    clearInterval(animationInterval);
    //}
    //function diceAnim() {
    //    animCounter++
    //    $('#dice').css('background-image', 'url(../assets/dice' + (Math.floor(Math.random() * 6) + 1) + '.png)')
    //    if (animCounter > 10) {
    console.log('url(../assets/dice' + throwCount + '.png)')
    $('#dice').css('background-image', 'url(../assets/dice' + throwCount + '.png)')


    if ((!((($('.M' + document.WINDOWcolor + 'pawn').length) == 0) && (throwCount != 1 && throwCount != 6))) && (document.WINDOWcolor == playerColor)) {
        let utterance = new SpeechSynthesisUtterance(throwCount);
        speechSynthesis.speak(utterance)
    }

    //animStop()
    //}
    //}
    //animationInterval = setInterval(diceAnim, 100)


})

socket.on('gameEnd', function (winner) {
    alert(winner + ' won!')
    window.location.reload(true)
})
