module.exports = {
    init: () => {
        const app = require("express")()
        const express = require("express")
        //const httpServer = require("http").createServer(app);
        const httpServer = app.listen(8080)
        const redux = require("redux")
        const { v4: uuidv4 } = require('uuid');


        const options = {
            cors: {
                origin: "*",
            }
        };
        const io = require("socket.io")(httpServer, options);

        app.all('/', function (request, response, next) {
            response.header('Access-Control-Allow-Origin', "*");
            response.header('Access-Control-Allow-Headers', 'X-Requested-With');
        })


        io.on("connection", socket => { /* ... */ });

        function users(state = { value: {} }, action) {
            switch (action.type) {
                case 'add':
                    let add = state.value
                    add[action.id] = { 'nickname': action.username, 'ready': false }
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
                    return { value: state.value = user }
                case 'joinuser':
                    let userToAddList = state.value
                    userToAddList[action.room].userlist.push(action.username)
                    console.log(userToAddList)
                    return { value: state.value = userToAddList }
                case 'kickuser':
                    let userToDelList = state.value
                    userToDelList[action.room].userlist = userToDelList[action.room].userlist.filter(user => user != action.username)
                    console.log(userToDelList)
                    return { value: state.value = userToDelList }
                default:
                    return state
            }
        }
        var usernames = redux.createStore(users)
        var roomz = redux.createStore(roomss)
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
                socket.room = 'Default';
                socket.join('Default');
                socket.emit('updatechat', 'SERVER', 'you have connected to Default');
                socket.broadcast.to('Default').emit('updatechat', 'SERVER', username + ' has connected to this room');


                usernames.dispatch({ type: 'add', username: username, id: socket.data.id })
                roomz.dispatch({ type: 'joinuser', username: username, room: 'Default' })
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
                roomz.dispatch({ type: 'kickuser', username: socket.username, room: oldroom })
                roomz.dispatch({ type: 'joinuser', username: socket.username, room: newroom })
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
                    io.sockets.in(socket.room).emit('lobbyuserlist', roomz.getState().value[socket.room].userlist, usernames.getState().value)
                    roomz.dispatch({ type: 'kickuser', username: socket.username, room: socket.room })
                }
                usernames.dispatch({ type: 'delete', id: socket.data.id })


                //io.sockets.emit('updateusers', usernames.getState().value);
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');



                socket.leave(socket.room);
            });
            socket.on('debug', function () {
                socket.emit('debugoutput', roomz.getState().value, usernames.getState().value)
            });

            socket.on('readyChange', function (readyState) {
                usernames.dispatch({ type: 'edit', id: socket.data.id, property: 'ready', propertyValue: readyState })
                console.log(usernames.getState().value)

                io.sockets.in(socket.room).emit('buttonchangestate', socket.username, readyState)

                io.sockets.in(socket.room).emit('lobbyuserlist', roomz.getState().value[socket.room].userlist, usernames.getState().value)
            })

        });
    }
};




