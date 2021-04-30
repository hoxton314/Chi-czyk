import { Funcs } from './funcs.js'
$(function () {
    class Filter {
        static renderY() {
            $('.MYpawn').css('filter', 'grayscale(0%)')
            $('.SYpawn').css('filter', 'grayscale(0%)')
        }
        static renderG() {
            $('.MGpawn').css('filter', 'grayscale(0%)')
            $('.SGpawn').css('filter', 'grayscale(0%)')
        }
        static renderR() {
            $('.MRpawn').css('filter', 'grayscale(0%)')
            $('.SRpawn').css('filter', 'grayscale(0%)')
        }
        static renderB() {
            $('.MBpawn').css('filter', 'grayscale(0%)')
            $('.SBpawn').css('filter', 'grayscale(0%)')
        }
    }
    Filter.renderY
    Filter.renderG
    Filter.renderR
    Filter.renderB
    $('.tura').css('display', 'none')
})

socket.on('gamestart', function (colordata,) {
    class Gamestart {
        static Render() {
            $('#list-container').css('display', 'none')
            $('.inner-ready').css('display', 'none')
            $('.ready-state').css('display', 'none')
            $('#game-container').css('display', '')
            $('.tura').css('display', '')
        }
        static colorRegx() {
            colordata.forEach(element => {
                if (element[0] == WINDOWuserID) { document.WINDOWcolor = element[1] }
            })
        }
    }
    Gamestart.Render()
    Gamestart.colorRegx()
})

socket.on('updateGameState', function (playerColor, throwCount, data) {
    $('.turatext').text('Tura: ' + Funcs.translate(playerColor))
    Funcs.gameRenderer(data, playerColor, throwCount, document.WINDOWcolor)
    $('#dice').css('background-image', 'url(../assets/dice' + throwCount + '.png)')
    if ((!((($('.M' + document.WINDOWcolor + 'pawn').length) == 0) && (throwCount != 1 && throwCount != 6))) && (document.WINDOWcolor == playerColor)) {
        let utterance = new SpeechSynthesisUtterance(throwCount);
        speechSynthesis.speak(utterance)
    }
})

socket.on('gameEnd', function (winner) {
    alert(winner + ' won!')
    window.location.reload(true)
})
