
module.exports = {

    main: (state = { value: {} }, action) => {
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
                return { value: state.value = userToAddList }
            case 'kickuser':
                let userToDelList = state.value
                userToDelList[action.room].userlist = userToDelList[action.room].userlist.filter(user => user[0] != action.id)
                return { value: state.value = userToDelList }
            default:
                return state
        }
    }

}