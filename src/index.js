const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { getMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')



const app = express()
const server = http.createServer(app)
//configure websocket with server
const io  = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    //join chat room
    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({ id:socket.id, username, room })

        if(error){
            return callback(error)
        }

        // join a room
        socket.join(user.room)
        socket.emit('message', getMessage('Admin', 'Welcome !'))  
        //broadcast to evry1 except this client
        socket.broadcast.to(user.room).emit('message', getMessage('Admin', `${user.username} has joined the chat!`))
        
        // update room info

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    

    //callback is for acknowledgement : if client message is successfully received || filter for pro    fanity
    socket.on('sendMessage', (message, callback) => {
        // get user for a message
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message.myMessage)){
            // return callback('Profane language is not allowed in Sam\'s chat app!')
            socket.emit('message', getMessage('Admin', 'Profane language is not allowed in Sam\'s chat app!'))  
        }
        else{
            io.to(user.room).emit('message', getMessage(user.username, message.myMessage))
        }
        callback(user)
    })
    
    
    //disconnect user event
    socket.on('disconnect', (message) => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', getMessage('Admin', `${user.username} has left.`))
            
            // update room info

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
        }
    })

    //broadcast location data
    socket.on('sendLocation', (location, callbackLocation) => {
        // get user for a message
        const user = getUser(socket.id)
        let latitude = location.latitude
        let longitude = location.longitude
        let mapLink = `https://google.com/maps?q=${latitude},${longitude}`
        io.to(user.room).emit('locationMessage', getMessage(user.username, mapLink))
        callbackLocation()
    })

})



server.listen(port, () => {
    console.log('Chat app is live on port ', port)
})