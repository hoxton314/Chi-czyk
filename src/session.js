
module.exports = {

    main: (state = { value: {} }, action) => {
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

}