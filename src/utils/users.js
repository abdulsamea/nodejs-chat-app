const users = []

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room =  room.trim().toLowerCase()

    // Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    // find existig user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    // reject already existing user 
    if(existingUser){
        return {
            error: 'Username is already in use!'
        }
    }

    // add user
    const user = {id, username, room}
    users.push(user)
    return { user }

}

const removeUser = (id) => {

    const index = users.findIndex((user) => user.id === id)
    // if user found
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
    else{
        return {
            error: `No user found with id ${id} to delete!`
        }
    }

}




const getUser = (id) => {

    const index = users.findIndex((user) => user.id === id)
    // if user found
    if(index !== -1){
        return users[index]
    }
    else{
        return {
            error: `No user found with id ${id}!`
        }
    }

}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}