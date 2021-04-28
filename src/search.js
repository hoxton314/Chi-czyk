
module.exports = {

    getUser: (room, userlistObj) => {


        let readyList = []

        for (let property in userlistObj) {
            if (userlistObj[property].room == room) {
                readyList.push([userlistObj[property].id, userlistObj[property].ready])
            }
        }

        console.log(readyList)
        let out = { 'ready': 0, 'roomcount': 0 }
        readyList.forEach(element => {
            if (element[1] == true) { out.ready++ }
            out.roomcount++
        })
        console.log(out)
        if (out.ready == out.roomcount && out.roomcount >= 2) {
            return [true, 4 - out.roomcount]
        } else { return [false, 4 - out.roomcount] }
    },
    pawnPos: (playerColor, startingPos, count) => {

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

        let area = startingPos.charAt(0)
        let color = startingPos.charAt(1)
        let position = startingPos.charAt(2)
        switch (area) {
            case 'S':
                switch (count) {
                    case 1:
                        return 'M' + color + '0'
                    case 6:
                        return 'M' + color + '0'
                    default:
                        return 'wrong'
                }
            case 'M':
                if (position + count <= 9) {
                    return 'M' + color + (position + count)
                } else {
                    let phase = 'M'
                    while (count > 0) {
                        if (position == 9 && playerColor == colorSwitcher(color)) {
                            phase = 'E'
                            color = colorSwitcher(color)
                            break
                        } else if (position == 9 && playerColor != colorSwitcher(color)) {
                            position = 0
                            count--
                            color = colorSwitcher(color)
                        } else {
                            position++
                            count--
                        }
                    }
                    if (phase == 'E') {
                        //POPRAWIĆ KOŃCZENIE Z PIONKIEM !!!
                        position = 4
                    }
                    return phase + color + position
                }
            case 'E':
                //POPRAWIĆ KOŃCZENIE Z PIONKIEM !!!
                break;
            default:
                break;
        }
    },
    nextColor: (colorN, players) => {
        let list = [players[0][0], players[1][0], players[2][0], players[3][0]]
        if (list.filter(a => a == 'empty').length == 1) {
            switch (colorN) {
                case 'Y':
                    return 'G'
                case 'G':
                    return 'R'
                case 'R':
                    return 'Y'
                case 'B':
                    return 'Y'
                default:
                    return 'Y'
            }
        } else if (list.filter(a => a == 'empty').length == 2) {
            switch (colorN) {
                case 'Y':
                    return 'G'
                case 'G':
                    return 'Y'
                case 'R':
                    return 'Y'
                case 'B':
                    return 'Y'
                default:
                    return 'Y'
            }
        } else {
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

    }

}