export class Funcs {
    static colorSwitcher(colorN) {
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
    static translate(colorN) {
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
    static gameRenderer(data, pColor, throwC, WINDOWcolor2137) {
        var color = 'Y'
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
            color = this.colorSwitcher(color)
        }
        if (WINDOWcolor2137 != 'Y') {
            $('.MYpawn').css('filter', 'brightness(30%)')
            $('.SYpawn').css('filter', 'brightness(30%)')
            $('.EYpawn').css('filter', 'brightness(30%)')
        }
        if (WINDOWcolor2137 != 'G') {
            $('.MGpawn').css('filter', 'brightness(30%)')
            $('.SGpawn').css('filter', 'brightness(30%)')
            $('.EGpawn').css('filter', 'brightness(30%)')
        }
        if (WINDOWcolor2137 != 'R') {
            $('.MRpawn').css('filter', 'brightness(30%)')
            $('.SRpawn').css('filter', 'brightness(30%)')
            $('.ERpawn').css('filter', 'brightness(30%)')
        }
        if (WINDOWcolor2137 != 'B') {
            $('.MBpawn').css('filter', 'brightness(30%)')
            $('.SBpawn').css('filter', 'brightness(30%)')
            $('.EBpawn').css('filter', 'brightness(30%)')
        }
        if ((($('.M' + WINDOWcolor2137 + 'pawn').length) == 0) && (throwC != 1 && throwC != 6)) {
            skip()
            return
        }
        if (pColor == WINDOWcolor2137) {

            $('.S' + WINDOWcolor2137 + 'pawn').click(function () {
                movePawn($(this).parent().attr('id'), throwC)
            });
            $('.M' + WINDOWcolor2137 + 'pawn').click(function () {
                movePawn($(this).parent().attr('id'), throwC)
            });
        }
        function movePawn(pawnLocation, count) {
            if (pawnLocation.charAt(0) == 'S' && (count == 1 || count == 6)) {
                socket.emit('updatePos', pawnLocation)
            } else if (pawnLocation.charAt(0) == 'M') {
                socket.emit('updatePos', pawnLocation)
            }
        }
        function skip() {
            socket.emit('updatePos', 'skip')
        }
    }
}