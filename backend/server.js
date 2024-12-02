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

//socket 
import { Server } from 'socket.io'
import http from 'http'

const saltRounds= 10

const port = 4000

const app = express()

dotenv.config()

const server = http.createServer(app)

const onlineUsers = {}

app.use(express.json())
app.use(cors({
    origin:"*",
    headers: {
        'Access-Control-Allow-Origin': 'https://chat-hd2ytbouu-sathiya4046s-projects.vercel.app/',
      },
    methods:["GET","POST"],
    credentials:true
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.static('public'))

//--------db connection -------------

mongoose.connect(process.env.DATABASE)
.then(() => console.log('Connected!'));

//------------image---------------

const storage = multer.diskStorage({
    destination:(req,res,cb)=>{
        cb(null, 'public/images')
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

//----------------

//Register and login schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmpassword : { type: String, required: true},
    images : { type: String }
});

const User = mongoose.model("users",UserSchema)

//---------------------

//-----------------conversation schema

const conversationSchema = new mongoose.Schema(
    {
        participants:[
            {
                type: mongoose.Schema.Types.ObjectId, 
                ref:"users"
            }
        ]
    },
    {
        timestamps:true,
    }
)

const Conversation = mongoose.model('conversations',conversationSchema)
//-----------------

//-------------message schema

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'conversations',
        required:true
    },
    sender : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    content : {
        type: String,
        required:true
    }
},{
    timestamps:true
})

const Message = mongoose.model("messages",messageSchema)

//----------------- verifyUser-----------------

const verifyUser = (req,res,next)=>{
    const token = req.headers.authorization
    if(!token){
        res.json({Status:"Unauthorized"})
    }else{
        jwt.verify(token,"jwt-private-key",(err,decoded)=>{
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

    console.log(receiverId, senderId)


    let conversation = await Conversation.findOne({
        participants : {$all : [senderId, receiverId]}
    })

    if(!conversation){
        return res.json({message:"Not found"})
    }

    const messages = await Message.find({
        conversationId : conversation._id
    }).sort({createdAt: 1})

    const receiverName = await User.findOne({_id:receiverId})

    return res.json({messages,receiverName})
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
            const token = jwt.sign({ id: user._id }, "jwt-private-key", { expiresIn: '1h' });
            res.json({Status:"Success", token, user : {id:user._id, username: user.name} });
        }else{
            return res.json({message:"Email already exists"})
        }
    }catch(error){
        console.log(error)
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


server.listen(port, ()=>{
    console.log(`Running on port ${port}`)
})

