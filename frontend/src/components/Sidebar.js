import React, { useEffect, useState } from 'react'
import img from '../images/avatar.webp'
import axios from 'axios'
import { baseUrl } from '../constant/url'
import {useMediaQuery} from '@mui/material'


const Sidebar = ({handleLogout,startChat,setStartchat,setChats,setreceiverId,setTitle}) => {
    const [user,setUser] = useState([])

    const screen = useMediaQuery('(max-width:572px)')

    const username = window.localStorage.getItem('username')

    // console.log(receiverId)

    useEffect(()=>{
        const fetchData = async () =>{
            const response = await axios.get(`${baseUrl}/users/`,{withCredentials:true})
            setUser(response.data)
        }
        fetchData()   
    },[])

    const startchat = async (id) =>{

        try{
            const response = await axios.get(`${baseUrl}/readMessage/${id}`,{withCredentials:true})
            setTitle(response.data.title)
            setChats(response.data.messages)
          }catch(error){
            console.log(error)
          }        
        setStartchat(true)
        setreceiverId(id)        
    } 

  return (
    <>
    {
        startChat && screen  ? 
        null :
        <div className='sidebar overflow-scroll text-light'>
        <div>
            <nav className='d-flex justify-content-between'>
                <div>
                <h2 className='m-3'>Chats</h2>
                <small className='ms-3'><strong>{username}</strong></small>
                </div>
                <button className='btn btn-danger mt-5 me-5 me-sm-2' onClick={()=>handleLogout()}>Logout</button>
            </nav>
            <hr />
        </div>
        <div>
            <div className='d-flex flex-column'>
                {user.map((i,index)=>(
                    <div 
                        key={index} 
                        onClick={()=>startchat(i._id)}>
                        <div className=' d-flex justify-content-between  mx-sm-0 align-items-center'>
                          <img className='rounded-pill ms-3 ms-sm-2' src={i.images ? `http://localhost:4000/images/${i.images}` : img } alt="avatarimg" width={65} height={65} />
                          <h5 className='pe-5 pe-sm-2'>{i.name}</h5>
                        </div>
                        <div>
                            <hr/>
                        </div>
                    </div>
                    
                ))}
            </div>
        </div>
    </div>
    }
    </>
  )
}

export default Sidebar