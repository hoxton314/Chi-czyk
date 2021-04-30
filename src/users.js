
module.exports = {

    main: (state = { value: {} }, action) => {
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

}