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
        //const httpServer = app.listen(process.env.PORT || 8080)

        //const httpServer = require("http").createServer(app)
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

        app.all('/', function (request, response, next) {
            response.header('Access-Control-Allow-Origin', "*");
            response.header('Access-Control-Allow-Headers', 'X-Requested-With');
        })


        io.on("connection", socket => { /* ... */ });

        function users(state = { value: {} }, action) {
            switch (action.type) {
                case 'add':
                    let add = state.value
                    add[action.id] = { 'nickname': action.username, 'ready': false, 'id': action.id }
                    return { value: state.value = add }
                case 'delete':
                    let del = state.value
                    delete del[action.id];
                    return { value: state.value = del }
                case 'edit':
                    let user = state.value
                    user[action.id][action.property] = action.propertyValue
                    return { value: state.value = user }
                default:
                    return state
            }
        }

        function roomss(state = { value: {} }, action) {
            switch (action.type) {
                case 'addroom':
                    let addroom = state.value
                    addroom[action.roomname] = { 'roomname': action.roomname, 'userlist': [] }
                    return { value: state.value = addroom }
                case 'deleteroom':
                    let delroom = state.value
                    delete delroom[action.roomname];
                    return { value: state.value = delroom }
                case 'edit':
                    let room = state.value
                    room[action.roomname][action.property] = action.propertyValue
                    return { value: state.value = room }
                case 'joinuser':
                    let userToAddList = state.value
                    userToAddList[action.room].userlist.push([action.id, action.username])
                    console.log(userToAddList)
                    return { value: state.value = userToAddList }
                case 'kickuser':
                    let userToDelList = state.value
                    userToDelList[action.room].userlist = userToDelList[action.room].userlist.filter(user => user[0] != action.id)
                    console.log(userToDelList)
                    return { value: state.value = userToDelList }
                default:
                    return state
            }
        }

        function session(state = { value: {} }, action) {
            switch (action.type) {
                case 'addroom':
                    let addroom = state.value
                    addroom[action.room] = action.roomObj
                    return { value: state.value = addroom }
                case 'edit':
                    let room = state.value
                    room[action.roomname][action.property] = action.propertyValue
                    return { value: state.value = room }
                default:
                    return state
            }
        }

        var usernames = redux.createStore(users)
        var roomz = redux.createStore(roomss)
        var playSession = redux.createStore(session)
        //console.log(usernames.getState())
        //usernames.dispatch({ type: 'add', input: 'nazwa' })
        //console.log(usernames.getState())
        //usernames.dispatch({ type: 'add', input: 'nazwa1' })
        //console.log(usernames.getState().value.nazwa)

        //var usernames = {};
        var rooms = ['Default'];
        roomz.dispatch({ type: 'addroom', roomname: 'Default', playerlist: [] })


        io.sockets.on('connection', function (socket) {
            //socket.emit('getUserList', usernames.getState().value)

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

                console.log(usernames.getState().value)
                io.sockets.in('Default').emit('lobbyuserlist', roomz.getState().value['Default'].userlist, usernames.getState().value)
            });

            //event button od tworzenia lobby
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
                //socket.emit('updaterooms', rooms, newroom);

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


                //io.sockets.emit('updateusers', usernames.getState().value);
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');



                socket.leave(socket.room);
            });
            socket.on('debug', function () {
                socket.emit('debugoutput', roomz.getState().value, usernames.getState().value, playSession.getState().value)
            });

            socket.on('readyChange', function (readyState) {
                usernames.dispatch({ type: 'edit', id: socket.data.id, property: 'ready', propertyValue: readyState })
                console.log(usernames.getState().value)

                io.sockets.in(socket.room).emit('buttonchangestate', socket.username, readyState)

                io.sockets.in(socket.room).emit('lobbyuserlist', roomz.getState().value[socket.room].userlist, usernames.getState().value)

                //console.log(roomz.getState().value[socket.room])
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
                //socket.data.id
                console.log(playSession.getState().value[socket.room].gameData.playerColors)
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
                    let aftermath = search.pawnPos(playSession.getState().value[socket.room].gameData.activePlayer, pawn, playSession.getState().value[socket.room].gameData.throw)
                    console.log('==!!!==========================')
                    console.log(pawn.slice(0, 2))
                    console.log(pawn.slice(-1))
                    console.log(aftermath.slice(0, 2))
                    console.log(aftermath.slice(-1))

                    console.log(map)
                    map[pawn.slice(0, 2)][pawn.slice(-1)] = map[pawn.slice(0, 2)][pawn.slice(-1)].replace(playSession.getState().value[socket.room].gameData.activePlayer, '')
                    map[pawn.slice(0, 2)][pawn.slice(-1)] = map[pawn.slice(0, 2)][pawn.slice(-1)].replace(playSession.getState().value[socket.room].gameData.activePlayer.toLowerCase(), '')
                    map[aftermath.slice(0, 2)][aftermath.slice(-1)] += playSession.getState().value[socket.room].gameData.activePlayer
                    console.log(map)

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
                //search.pawnPos(playerColor, startingPos, count)



            })




















        });
    }
};




