import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import multer from 'multer'
import path from 'path'
import dotenv from 'dotenv'
import User from './models/user.js'
import Message from './models/messages.js'
import Conversation from './models/conversation.js'

//socket 
import { Server } from 'socket.io'
import http from 'http'

const saltRounds= 10

dotenv.config()

const app = express()
const server = http.createServer(app)
const dirname = path.resolve()
const port = process.env.PORT

const onlineUsers = {}

app.use(express.json())
app.use(cors({
    origin:"http://localhost:3000",
    methods:["GET","POST"],
    credentials:true
}))
app.use(cookieParser())
app.use(bodyParser.json())

//--------db connection -------------

mongoose.connect(process.env.DATABASE)
.then(() => console.log('Connected!'));

//------------image---------------

const storage = multer.diskStorage({
    destination:(req,res,cb)=>{
        cb(null, './backend/public/images')
    },
    filename:(req,file,cb)=>{
        cb(
            null,file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        )
    }
})

const upload = multer({
    storage : storage
})

app.use('/images',express.static('backend/public/images'))


//-------------- socket connection -------
const io = new Server(server,{
    cors:{
        origin: "*",
        methods: ["GET","POST"]
    }
})

const getReceiverSocketId = (receiverId) =>{
    return onlineUsers[receiverId]
}

io.on("connection",(socket) =>{
    console.log("user joined",socket.id)

    socket.on('join', (receiverId)=>{
        onlineUsers[receiverId] = socket.id
        console.log('receiver id', receiverId, 'socket id', socket.id)
    })
})

//----------------- verifyUser-----------------

const verifyUser = (req,res,next)=>{
    const token = req.cookies.token
    if(!token){
        res.json({Status:"Unauthorized"})
    }else{
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            if(err){
                res.json({Status:"Unauthorized"})
            }else{
                req.user = decoded
                next()
            }
        })
    }
}
app.get('/chatapp', verifyUser, (req,res)=>{
    return res.json({Status:"Success"})
})
app.get('/users', verifyUser,(req,res)=>{

    const owner = req.user.id

    User.find({_id:{$ne:owner}})
    .then(user=>res.json(user))
    .catch(err=>res.json(err))

})  

//=============== read message------------

app.get('/readMessage/:id', verifyUser, async (req,res)=>{
    const receiverId = req.params.id
    const senderId = req.user.id

    const receiverName = await User.findOne({_id:receiverId})
    const title = receiverName.name

    console.log(receiverId, senderId)


    let conversation = await Conversation.findOne({
        participants : {$all : [senderId, receiverId]}
    })

    if(!conversation){
        return res.json({message:"Not found",title})
    }

    const messages = await Message.find({
        conversationId : conversation._id
    }).sort({createdAt: 1})

    return res.json({messages,title})
})


//-------------------------- Register ----------------------------------

app.post('/register', upload.single('images'),async (req,res)=>{
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const image = req.file.filename

    console.log(image)
    try{
        const user =await User.findOne({email:email})
        if(user){
            return res.json({message:"Email already exists"})
        }else{
            const hashPassword =await bcrypt.hash(password.toString(),saltRounds)
            await User.create({
                name:name,
                email:email,
                password:hashPassword,
                confirmpassword:hashPassword,
                images:image
            })
            .then(user=> res.json({Status:"Success"}))
            .catch(err=>console.log(err))
        }
    }catch(error){
        console.log(error)
    }
})

//--------------------- Login ----------------------------
app.post('/login',async (req,res)=>{
    const email = req.body.email
    const password = req.body.password
    try{
        const user =await User.findOne({email:email})
        if(user){
            const comparePassword =await bcrypt.compare(password,user.password)
            if (!comparePassword) return res.json({Status:'Invalid credentials'});
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '10d' });
            res.cookie("token", token, {
                maxAge:10*24*60*1000,
                httpOnly: false,
                secure: true, 
                sameSite:"strict"
              })
            res.json({Status:"Success",user : {id:user._id, username: user.name} });
        }else{
            return res.json({message:"Email already exists"})
        }
    }catch(error){
        res.json({Error:error})
    }
})

//=----------------- chat messages --------------

app.post('/messages/:id', verifyUser, async (req,res)=>{
    try{
        const receiverId = req.params.id
        const senderId = req.user.id
        const {content } = req.body

        console.log(receiverId,senderId,content)

        let conversation = await Conversation.findOne({
            participants : {$all : [senderId, receiverId]}
        })
    
        if(!conversation){
            conversation = new Conversation({
                participants : [ senderId, receiverId ]
            })
            await conversation.save()
        }

        const newMessage = new Message({
            conversationId : conversation._id,
            sender : senderId,
            content : content,
            createdAt : new Date()
        })

        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage)
        }

        return res.json(newMessage)
    }catch(error){
        res.json(error)
    }
})

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(dirname,"/frontend/build")))
    app.use("*",(req,res)=>{
        res.sendFile(path.resolve(dirname,"frontend","build","index.html"))
    })
}

server.listen(port, ()=>{
    console.log(`Running on port ${port}`)
})

