const { Server } = require('socket.io')
const http = require('http')
const express = require('express')

const app = express()

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin: "*",
        methods: ["GET","POST"]
    }
})

io.on("connection",(socket) =>{
    console.log("user joined",socket.id)
})

module.exports = app;
module.exports = server;