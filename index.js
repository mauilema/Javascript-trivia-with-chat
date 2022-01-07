const express = require('express')
const app = express()
const morgan = require('morgan')
const server = require ('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*"}})
// const home = require('./views/home.js')
const path = require('path')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))

// app.get('/', (req, res) => {
//     res.send(home)
// }) 

const botName = 'NightBot'

//runs when client connects
io.on('connection', socket => {
    // console.log('User connected: ', socket.id)

    // socket.on("message", (data) => {
    //     socket.broadcast.emit("message", data)
    // })
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)
        //welcomes current user
        socket.emit('message', formatMessage(botName, 'Welcome to Chat'))

        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //happens when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

             //send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
            })            
        }


    })


})

server.listen(3000, () => {
    console.log('Server is running...')
})