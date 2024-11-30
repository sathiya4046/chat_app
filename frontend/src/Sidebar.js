import React, { useEffect, useState } from 'react'
import img from './avatar.webp'
import axios from 'axios'


const Sidebar = ({handleLogout,setStartchat,setChats,setreceiverId,setTitle}) => {
    const [user,setUser] = useState([])

    const username = window.localStorage.getItem('username')

    // console.log(receiverId)

    useEffect(()=>{
        const fetchData = async () =>{
            const response = await axios.get(`http://localhost:4000/users/`,{
                headers:{
                  "Authorization":`${window.localStorage.getItem('token')}`
                }
              })
            setUser(response.data)
        }
        fetchData()   
    },[])

    const startChat = async (id) =>{

        try{
            const response = await axios.get(`http://localhost:4000/readMessage/${id}`,{
                headers:{
                  "Authorization":`${window.localStorage.getItem('token')}`
                }
              }
            )
            console.log(response)
            setChats(response.data.messages)
            setTitle(response.data.receiverName.name)
          }catch(error){
            console.log(error)
          }
        
        setStartchat(true)
        setreceiverId(id)
        
    } 

  return (
    <div className='sidebar overflow-scroll text-light'>
        <div>
            <nav className='d-flex justify-content-between'>
                <div>
                <h2 className='m-2'>Chats</h2>
                <small className='ms-2'><strong>{username}</strong></small>
                </div>
                <button className='btn btn-danger m-3' onClick={()=>handleLogout()}>Logout</button>
            </nav>
            <hr />
        </div>
        <div>
            <div className='d-flex flex-column'>
                {user.map(i=>(
                    <div 
                        key={i._id} 
                        onClick={()=>startChat(i._id)}>
                        <div className=' d-flex justify-content-between align-items-center'>
                          <img className='rounded-pill ms-2' src={i.images ? `http://localhost:4000/images/${i.images}` : img } alt="avatarimg" width={65} height={65} />
                          <h5 className='me-5'>{i.name}</h5>
                        </div>
                        <div>
                            <hr/>
                        </div>
                    </div>
                    
                ))}
            </div>
        </div>
    </div>
  )
}

export default Sidebar