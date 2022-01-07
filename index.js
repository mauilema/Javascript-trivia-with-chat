const express = require('express')
const app = express()
const morgan = require('morgan')
const server = require ('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*"}})
const home = require('./views/home.js')

app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.send(home)
}) 

server.listen(3001, () => {
    console.log('Server has started...')
})

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)

    socket.on("message", (data) => {
        socket.broadcast.emit("message", data)
    })


})