import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Messages from './Messages'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from './Header'
import wa from './wa669aeJeom.png'

const Chatapp = ({socket}) => {
    const [auth, setAuth] = useState(false)
    const [startChat,setStartchat] = useState(false)
    const [chats, setChats] = useState([])
    const [message, setMessage] = useState("")
    const [receiverId, setreceiverId] = useState()
    const userId = window.localStorage.getItem("userId")
    const [title,setTitle] = useState()

    const navigate = useNavigate()

    useEffect(()=>{
      socket.emit('join',userId)
    },[socket,userId])

  useEffect(()=>{
    const verifyUser = async ()=>{
      const response = await axios.get("https://chat-app-8h8v.onrender.com/chatapp",{
        headers:{
          "Authorization":`${window.localStorage.getItem('token')}`
        }
      })
      if(response.data.Status==="Success"){
        console.log(response)
        setAuth(true)
      }else{
        setAuth(false)
        setMessage(response.data.Status)
      }
    }
    verifyUser()
  },[])

  useEffect(()=>{
    const handleNewMessage =(msg)=>{
      if(receiverId===msg.sender){
        setChats(state => [...state, { sender: msg.sender,content: msg.content}])
      }
    }
    socket.on('newMessage',handleNewMessage)

    return ()=>{
      socket.off('newMessage',handleNewMessage)
    }
  },[socket,receiverId])

  const handleLogout = ()=>{
    window.localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div>
        {auth?
      <div className='vh-100'>
        <main className='w-100 h-100 d-flex border border-dark'>
            <Sidebar 
              handleLogout = {handleLogout}
              setStartchat = {setStartchat}
              setChats = {setChats}
              setreceiverId = {setreceiverId}
              setTitle = {setTitle}
            />
            {
              startChat ?
              <div className='w-100 overflow-scroll'>
                <Messages
                receiverId = {receiverId}
                chats = {chats}
                setChats = {setChats}
                title = {title}
                />
              </div>
              :
              <div className='w-100 m-5 d-flex flex-column justify-content-center align-items-center'>
                <img src={wa} alt="whatsappimage" width={300} height={200} />
                  <h2>Start Chat for Watsapp for PC</h2>
                  <p>Make chats, share your updates and get a faster experience when you using this app</p>
                  <button className='btn btn-success rounded-pill px-4'>Start Chat</button>
              </div>
              
            }
        </main>
      </div>
        : 
      <>
        <Header/>
        <div className='container-fluid d-flex flex-column justify-content-center align-items-center mt-5'>
        
            <div className='border border-dark p-5'>
            <h1>{message}</h1>
            <hr />
            <div className='d-flex justify-content-center align-items-center'>
            <Link to={'/login'}> <button className="btn btn-success mb-2">Login</button> </Link>
            </div>
            </div>
 
        </div>
      </>
      }

    </div>
  )
}

export default Chatapp