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
        if (element[0] == WINDOWuserID) { WINDOWcolor = element[1] }
    })
    console.log('Color assigned is: ' + WINDOWcolor)

})


socket.on('updateGameState', function (playerColor, throwCount, data) {
    console.log('Tura: ' + playerColor)

    $('.turatext').text('Tura: ' + translate(playerColor))
    console.log(data)
    gameRenderer(data, playerColor, throwCount)

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


    if ((!((($('.M' + WINDOWcolor + 'pawn').length) == 0) && (throwCount != 1 && throwCount != 6))) && (WINDOWcolor == playerColor)) {
        let utterance
        switch (throwCount) {
            case 1:
                utterance = new SpeechSynthesisUtterance("One");
                speechSynthesis.speak(utterance)
                break;
            case 2:
                utterance = new SpeechSynthesisUtterance("Two");
                speechSynthesis.speak(utterance)
                break;
            case 3:
                utterance = new SpeechSynthesisUtterance("Three");
                speechSynthesis.speak(utterance)
                break;
            case 4:
                utterance = new SpeechSynthesisUtterance("Four");
                speechSynthesis.speak(utterance)
                break;
            case 5:
                utterance = new SpeechSynthesisUtterance("Five");
                speechSynthesis.speak(utterance)
                break;
            case 6:
                utterance = new SpeechSynthesisUtterance("Six");
                speechSynthesis.speak(utterance)
                break;
        }
    }

    //animStop()
    //}
    //}
    //animationInterval = setInterval(diceAnim, 100)


})

function colorSwitcher(colorN) {
    switch (colorN) {
        case 'Y':
            return 'G'
        case 'G':
            return 'R'
        case 'R':
            return 'B'
        case 'B':
            return 'Y'
        default:
            return 'Y'
    }
}
function translate(colorN) {
    switch (colorN) {
        case 'Y':
            return 'żółtych'
        case 'G':
            return 'zielonych'
        case 'R':
            return 'czerwonych'
        case 'B':
            return 'niebieskich'
        default:
            return 'żółtych'
    }
}

function gameRenderer(data, pColor, throwC) {
    color = 'Y'
    for (let i = 0; i < 4; i++) {
        data['S' + color].forEach((element, v) => {
            if (color == element.toUpperCase()) {
                let tempObj = $('<div>')
                tempObj.addClass('S' + color + 'pawn')
                $('#S' + color + v).empty()
                $('#S' + color + v).append(tempObj)
            } else {
                $('#S' + color + v).empty()
            }
        })

        data['M' + color].forEach((element, v) => {
            if (element.length >= 1) {

                $('#M' + color + v).empty()
                for (let arrLen = 0; arrLen < element.length; arrLen++) {
                    $('#M' + color + v).append($('<div>').addClass('M' + element.charAt(arrLen) + 'pawn'))
                }

            } else {
                $('#M' + color + v).empty()
            }
        })

        data['E' + color].forEach((element, v) => {
            if (element != '' && element != undefined) {
                let tempObj = $('<div>')
                tempObj.addClass('E' + color + 'pawn')
                $('#E' + color + v).empty()
                $('#E' + color + v).append(tempObj)
            } else {
                $('#E' + color + v).empty()
            }
        })


        color = colorSwitcher(color)
    }

    if (WINDOWcolor != 'Y') {
        $('.MYpawn').css('filter', 'brightness(30%)')
        $('.SYpawn').css('filter', 'brightness(30%)')
        $('.EYpawn').css('filter', 'brightness(30%)')
    }
    if (WINDOWcolor != 'G') {
        $('.MGpawn').css('filter', 'brightness(30%)')
        $('.SGpawn').css('filter', 'brightness(30%)')
        $('.EGpawn').css('filter', 'brightness(30%)')
    }
    if (WINDOWcolor != 'R') {
        $('.MRpawn').css('filter', 'brightness(30%)')
        $('.SRpawn').css('filter', 'brightness(30%)')
        $('.ERpawn').css('filter', 'brightness(30%)')
    }
    if (WINDOWcolor != 'B') {
        $('.MBpawn').css('filter', 'brightness(30%)')
        $('.SBpawn').css('filter', 'brightness(30%)')
        $('.EBpawn').css('filter', 'brightness(30%)')
    }


    if ((($('.M' + WINDOWcolor + 'pawn').length) == 0) && (throwC != 1 && throwC != 6)) {
        skip()
        return
    }

    if (pColor == WINDOWcolor) {

        $('.S' + WINDOWcolor + 'pawn').click(function () {
            movePawn($(this).parent().attr('id'), throwC)
        });
        $('.M' + WINDOWcolor + 'pawn').click(function () {
            movePawn($(this).parent().attr('id'), throwC)
        });

    }


}

function movePawn(pawnLocation, count) {
    console.log('click!')
    console.log(pawnLocation)
    console.log(count)

    if (pawnLocation.charAt(0) == 'S' && (count == 1 || count == 6)) {
        socket.emit('updatePos', pawnLocation)
        console.log('wychodze z pola')
    } else if (pawnLocation.charAt(0) == 'M') {
        socket.emit('updatePos', pawnLocation)
        console.log('ruszam dalej')
    }

}

function skip() {
    console.log('skip!')
    socket.emit('updatePos', 'skip')
}


