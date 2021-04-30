module.exports = {
    init: () => {
        const PORT = process.env.PORT || 8080
        const express = require("express")
        const app = require("express")()
        const httpServer = require("http").createServer(app);
        const options = {
            cors: {
                origin: "*",
            }
        };
        const io = require("socket.io")(httpServer, options);
        httpServer.listen(PORT, function () {
            console.log('Server started on port:', PORT)
        })
        app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
            res.header('Access-Control-Allow-Credentials', true);
            next();
        },
            express.static('client'))
        const redux = require("redux")
        const { v4: uuidv4 } = require('uuid');
        var search = require(__dirname + "/search")
        var connection = require(__dirname + "/connection")
        var users = require(__dirname + "/users")
        var roomss = require(__dirname + "/roomss")
        var session = require(__dirname + "/session")
        /////////////////////////////////////////
        app.all('/', function (request, response, next) {
            response.header('Access-Control-Allow-Origin', "*");
            response.header('Access-Control-Allow-Headers', 'X-Requested-With');
        })
        connection.main(io)



        var usernames = redux.createStore(users.main)
        var roomz = redux.createStore(roomss.main)
        var playSession = redux.createStore(session.main)
        roomz.dispatch({ type: 'addroom', roomname: 'Default', playerlist: [] })
        io.sockets.on('connection', function (socket) {
            socket.on('adduser', function (username) {
                socket.username = username;
                socket.data.id = uuidv4()
                socket.emit('getMyID', socket.data.id)
                socket.room = 'Default';
                socket.join('Default');
                socket.emit('updatechat', 'SERVER', 'you have connected to Default');
                socket.broadcast.to('Default').emit('updatechat', 'SERVER', username + ' has connected to this room');
                usernames.dispatch({ type: 'add', username: username, id: socket.data.id })
                roomz.dispatch({ type: 'joinuser', username: username, id: socket.data.id, room: 'Default' })
                usernames.dispatch({ type: 'edit', id: socket.data.id, property: 'sessionID', propertyValue: socket.id })
                usernames.dispatch({ type: 'edit', id: socket.data.id, property: 'room', propertyValue: socket.room })
                let rooms = roomz.getState().value
                socket.emit('updaterooms', rooms, 'Default');
                io.sockets.in('Default').emit('lobbyuserlist', roomz.getState().value['Default'].userlist, usernames.getState().value)
            });
            socket.on('create', function (room) {
                roomz.dispatch({ type: 'addroom', roomname: room, playerlist: [] })
                let rooms = roomz.getState().value
                socket.emit('updaterooms', rooms, socket.room);
                socket.broadcast.emit('updaterooms', rooms, socket.room);
            });
            socket.on('sendchat', function (data) {
                io.sockets.in(socket.room).emit('updatechat', socket.username, data);
            });
            socket.on('switchRoom', function (newroom) {
                var oldroom;
                oldroom = socket.room;
                socket.leave(socket.room);
                socket.join(newroom);
                roomz.dispatch({ type: 'kickuser', id: socket.data.id, room: oldroom })
                roomz.dispatch({ type: 'joinuser', username: socket.username, id: socket.data.id, room: newroom })
                usernames.dispatch({ type: 'edit', id: socket.data.id, property: 'room', propertyValue: newroom })
                socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
                socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
                socket.room = newroom;
                socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
                let rooms = roomz.getState().value
                io.sockets.emit('updaterooms', rooms, undefined)
                socket.emit('updaterooms', rooms, socket.room)
                io.sockets.in(oldroom).emit('lobbyuserlist', roomz.getState().value[oldroom].userlist, usernames.getState().value)
                io.sockets.in(newroom).emit('lobbyuserlist', roomz.getState().value[newroom].userlist, usernames.getState().value)
            });
            socket.on('disconnect', function () {
                if (socket.username != undefined) {
                    try {
                        io.sockets.in(socket.room).emit('lobbyuserlist', roomz.getState().value[socket.room].userlist, usernames.getState().value)
                        roomz.dispatch({ type: 'kickuser', id: socket.data.id, room: socket.room })
                    } catch (error) {
                    }
                }
                usernames.dispatch({ type: 'delete', id: socket.data.id })
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
                socket.leave(socket.room);
            });
            socket.on('debug', function () {
                socket.emit('debugoutput', roomz.getState().value, usernames.getState().value, playSession.getState().value)
            });
            socket.on('readyChange', function (readyState) {
                usernames.dispatch({ type: 'edit', id: socket.data.id, property: 'ready', propertyValue: readyState })
                io.sockets.in(socket.room).emit('buttonchangestate', socket.username, readyState)
                io.sockets.in(socket.room).emit('lobbyuserlist', roomz.getState().value[socket.room].userlist, usernames.getState().value)
                let gamecheck = search.getUser(socket.room, usernames.getState().value)
                if (gamecheck[0]) {
                    playSession.dispatch({ type: 'addroom', room: socket.room, roomObj: roomz.getState().value[socket.room] })
                    playSession.dispatch({
                        type: 'edit', roomname: socket.room, property: 'gameState', propertyValue: {
                            'SY': ['y', 'y', 'y', 'y'], 'SG': ['g', 'g', 'g', 'g'], 'SR': ['r', 'r', 'r', 'r'], 'SB': ['b', 'b', 'b', 'b'],
                            'MY': ['', '', '', '', '', '', '', '', '', ''],
                            'MG': ['', '', '', '', '', '', '', '', '', ''],
                            'MR': ['', '', '', '', '', '', '', '', '', ''],
                            'MB': ['', '', '', '', '', '', '', '', '', ''],
                            'EY': ['', '', '', ''], 'EG': ['', '', '', ''], 'ER': ['', '', '', ''], 'EB': ['', '', '', '']
                        }
                    })
                    playSession.dispatch({
                        type: 'edit', roomname: socket.room, property: 'gameData', propertyValue: { 'activePlayer': '', 'throw': '' }
                    })
                    for (let i = gamecheck[1]; i > 0; i--) {
                        roomz.dispatch({ type: 'joinuser', username: 'empty', id: 'empty', room: socket.room })
                    }
                    let colors = []
                    playSession.getState().value[socket.room].userlist.forEach((element, v) => {
                        switch (v) {
                            case 0:
                                colors.push([element[0], 'Y'])
                                break;
                            case 1:
                                colors.push([element[0], 'G'])
                                break;
                            case 2:
                                colors.push([element[0], 'R'])
                                break;
                            case 3:
                                colors.push([element[0], 'B'])
                                break;
                            default:
                                break;
                        }
                    });
                    io.sockets.in(socket.room).emit('gamestart', colors)
                    roomz.dispatch({ type: 'deleteroom', roomname: socket.room })
                    io.sockets.emit('updaterooms', roomz.getState().value, undefined)
                    playSession.dispatch({
                        type: 'edit', roomname: socket.room, property: 'gameData', propertyValue: { 'activePlayer': 'Y', 'throw': (Math.floor(Math.random() * 6) + 1), 'playerColors': colors }
                    })
                    io.sockets.in(socket.room).emit('updateGameState', playSession.getState().value[socket.room].gameData.activePlayer, playSession.getState().value[socket.room].gameData.throw, playSession.getState().value[socket.room].gameState)
                }
            })
            socket.on('updatePos', function (pawn) {
                if ((1 == ((playSession.getState().value[socket.room].gameData.playerColors).filter(a => a[0] == 'empty' && a[1] == playSession.getState().value[socket.room].gameData.activePlayer).length))) {
                    let nextPlayer = search.nextColor(playSession.getState().value[socket.room].gameData.activePlayer, playSession.getState().value[socket.room].gameData.playerColors)
                    playSession.dispatch({
                        type: 'edit',
                        roomname: socket.room,
                        property: 'gameData',
                        propertyValue: { 'activePlayer': nextPlayer, 'throw': (Math.floor(Math.random() * 6) + 1), 'playerColors': playSession.getState().value[socket.room].gameData.playerColors }
                    })
                    io.sockets.in(socket.room).emit('updateGameState', playSession.getState().value[socket.room].gameData.activePlayer, playSession.getState().value[socket.room].gameData.throw, playSession.getState().value[socket.room].gameState)
                    return
                }
                if ((1 != ((playSession.getState().value[socket.room].gameData.playerColors).filter(a => a[0] == socket.data.id && a[1] == playSession.getState().value[socket.room].gameData.activePlayer).length))) {
                    return
                }
                if (pawn != 'skip') {
                    let map = playSession.getState().value[socket.room].gameState
                    let aftermath = search.pawnPos(playSession.getState().value[socket.room].gameData.activePlayer, pawn, playSession.getState().value[socket.room].gameData.throw, playSession.getState().value[socket.room].gameState['E' + playSession.getState().value[socket.room].gameData.activePlayer])
                    if (aftermath == 'wrong') { return }
                    let pawnObjName = pawn.slice(0, 2)
                    let pawnPlace = pawn.slice(-1)
                    let aftermathObjName = aftermath.slice(0, 2)
                    let aftermathPlace = aftermath.slice(-1)
                    let pCOLOR = playSession.getState().value[socket.room].gameData.activePlayer
                    map[pawnObjName][pawnPlace] = map[pawnObjName][pawnPlace].replace(pCOLOR, '')
                    map[pawnObjName][pawnPlace] = map[pawnObjName][pawnPlace].replace(pCOLOR.toLowerCase(), '')
                    if (aftermath.charAt(0) == 'M' && aftermath.charAt(2) != '0' && !(map[aftermathObjName][aftermathPlace].includes(pCOLOR)) && map[aftermathObjName][aftermathPlace] != '') {
                        let playerToReturnPawn = map[aftermathObjName][aftermathPlace].charAt(0)
                        let returnPawnCount = map[aftermathObjName][aftermathPlace].length
                        map[aftermathObjName][aftermathPlace] = pCOLOR
                        let counterReturn = 0
                        while (returnPawnCount > 0) {
                            if (map['S' + playerToReturnPawn][counterReturn] == '') {
                                map['S' + playerToReturnPawn][counterReturn] = playerToReturnPawn.toLowerCase()
                                returnPawnCount--
                            }
                            counterReturn--
                        }
                    } else {
                        map[aftermathObjName][aftermathPlace] += pCOLOR
                    }
                    playSession.dispatch({ type: 'edit', roomname: socket.room, property: 'gameState', propertyValue: map })
                }
                let nextPlayer = search.nextColor(playSession.getState().value[socket.room].gameData.activePlayer, playSession.getState().value[socket.room].gameData.playerColors)
                playSession.dispatch({
                    type: 'edit',
                    roomname: socket.room,
                    property: 'gameData',
                    propertyValue: { 'activePlayer': nextPlayer, 'throw': (Math.floor(Math.random() * 6) + 1), 'playerColors': playSession.getState().value[socket.room].gameData.playerColors }
                })
                io.sockets.in(socket.room).emit('updateGameState', playSession.getState().value[socket.room].gameData.activePlayer, playSession.getState().value[socket.room].gameData.throw, playSession.getState().value[socket.room].gameState)
                let map = playSession.getState().value[socket.room].gameState
                if (map['EY'][0] == 'Y' && map['EY'][1] == 'Y' && map['EY'][2] == 'Y' && map['EY'][3] == 'Y') {
                    io.sockets.in(socket.room).emit('gameEnd', 'Yellow')
                }
                if (map['EG'][0] == 'G' && map['EG'][1] == 'G' && map['EG'][2] == 'G' && map['EG'][3] == 'G') {
                    io.sockets.in(socket.room).emit('gameEnd', 'Green')
                }
                if (map['ER'][0] == 'R' && map['ER'][1] == 'R' && map['ER'][2] == 'R' && map['ER'][3] == 'R') {
                    io.sockets.in(socket.room).emit('gameEnd', 'Red')
                }
                if (map['EB'][0] == 'B' && map['EB'][1] == 'B' && map['EB'][2] == 'B' && map['EY'][3] == 'B') {
                    io.sockets.in(socket.room).emit('gameEnd', 'Blue')
                }
            })
        });
    }
};




