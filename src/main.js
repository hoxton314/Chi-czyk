module.exports = {
    init: () => {
        const app = require("express")()
        const express = require("express")
        //const httpServer = require("http").createServer(app);
        const httpServer = app.listen(8080)
        const redux = require("redux")

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
                    add[action.input] = { 'nickname': action.input }
                    return { value: state.value = add }
                case 'delete':
                    let del = state.value
                    delete del[action.input];
                    return { value: state.value = del }
                default:
                    return state
            }
        }

        // Create a Redux store holding the state of your app.
        // Its API is { subscribe, dispatch, getState }.
        let usernames = redux.createStore(users)

        //console.log(usernames.getState())
        //usernames.dispatch({ type: 'add', input: 'nazwa' })
        //console.log(usernames.getState())
        //usernames.dispatch({ type: 'add', input: 'nazwa1' })
        //console.log(usernames.getState().value.nazwa)

        //var usernames = {};
        var rooms = ['Default'];


        io.sockets.on('connection', function (socket) {
            socket.emit('getUserList', usernames.getState().value)
            //
            socket.on('adduser', function (username) {
                socket.username = username;
                socket.room = 'Default';
                usernames.dispatch({ type: 'add', input: username })
                //usernames[username] = { 'nickname': username };
                socket.join('Default');
                socket.emit('updatechat', 'SERVER', 'you have connected to Default');
                socket.broadcast.to('Default').emit('updatechat', 'SERVER', username + ' has connected to this room');
                socket.emit('updaterooms', rooms, 'Default');
                console.log(usernames.getState().value)
                console.log(rooms)
            });

            //event button od tworzenia lobby
            socket.on('create', function (room) {
                rooms.push(room);
                socket.emit('updaterooms', rooms, socket.room);
                socket.broadcast.emit('updaterooms', rooms, socket.room);
            });

            socket.on('sendchat', function (data) {
                io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
            });

            socket.on('switchRoom', function (newroom) {
                var oldroom;
                oldroom = socket.room;
                socket.leave(socket.room);
                socket.join(newroom);
                socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
                socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
                socket.room = newroom;
                socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
                socket.emit('updaterooms', rooms, newroom);

                socket.emit('lobbyuserlist', usernames.getState().value)
            });

            socket.on('disconnect', function () {
                usernames.dispatch({ type: 'delete', input: socket.username })
                //delete usernames[socket.username];
                io.sockets.emit('updateusers', usernames.getState().value);
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
                socket.leave(socket.room);
            });
        });
    }
};




