import axios from 'axios'
import React, { useState } from 'react'
import { baseUrl } from '../constant/url'

const Messages = ({receiverId,chats,setChats,title,setStartchat}) => {
  const [message,setMessage] = useState('')
  const userId = window.localStorage.getItem("userId")

  const sendMessage = async (e) =>{
    e.preventDefault()
    try{
      const response = await axios.post(`${baseUrl}/messages/${receiverId}`,
        {content : message},{withCredentials:true})
      console.log(response)
      setChats([...chats, {content : message, sender : userId}])
      setMessage("")
    }catch(error){
      console.log(error)
    }
  }
  
  return (
    <div className='d-flex h-100 flex-column justify-content-between m-2 py-3'> 
      <div>
        <h4 className='m-2 text-light'><i onClick={()=>setStartchat(false)} class="bi bi-arrow-left me-3"></i>{title ? title : "New User"}</h4>
        <hr />
                  { chats &&
                  chats.map((chat,index)=>(
                    <div key={index}
                          className={ `d-flex px-3 ${
                            chat.sender === userId ? 'justify-content-end' : "justify-content-start"
                          }`}
                    >
                      <div className={`p-2 my-2 rounded ${
                        chat.sender === userId
                        ? "bg-primary text-light"
                        : "bg-light text-dark"
                      }`}>
                          {chat.content} 
                      </div>
                    </div>
                  ))}
                </div>     
            <form className='d-flex m-2' onSubmit={sendMessage}>
              <input
              className='w-100 mx-2 px-2 rounded border border-success ' 
                type="text" 
                placeholder='Message' 
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
              />
              <button className='btn btn-success'>Send</button>
            </form>
    </div>
  )
}

export default Messages