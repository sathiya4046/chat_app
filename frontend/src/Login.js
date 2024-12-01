import React from 'react'
import Header from './Header'
import { Link, useNavigate  } from 'react-router-dom'
import { useState } from "react";
import axios from "axios";

const Login = ({setToken}) => {

  const navigate = useNavigate()
  const [error, setError] = useState()
  const [data, setData] = useState({
    email:"",
    password:""
  })
  const handleLogin = async (e)=>{
    e.preventDefault()
    try{
      await axios.post('https://chat-app-8h8v.onrender.com/login', data)
      .then(res=>{
        if(res.data.Status==='Success'){
          setToken(window.localStorage.setItem("token",res.data.token))
          window.localStorage.setItem("userId",res.data.user.id)
          window.localStorage.setItem("username",res.data.user.username)
          navigate('/chatapp')
          console.log(res)
        }else{
          setError(res.data.Error)
        }
      })
      .then(err=>console.log(err))
    }catch(error){
      return console.log(error)
    }
  }
  
  return (
    <>
      <Header/>
      <div className='container-fluid d-flex justify-content-center align-items-center'>
        <form className="form-inline rounded p-4 mt-5 register" onSubmit={handleLogin} id='login'>
        <div className="form-group d-flex flex-column justify-content-center" id='formgroup'>
          <h1 className="text-center mb-4">Login</h1>
          <input 
            type="text" 
            className="form-control my-4" 
            placeholder="Email"
            onChange={(e)=>setData({...data,email:e.target.value})}
            required
          />
            <input 
            type="password" 
            className="form-control mb-3" 
            placeholder="Password"
            onChange={(e)=>setData({...data,password:e.target.value})}
            required
            />
            {error && <span className='text-danger'>{error}</span> }
        </div>
        <p className='text-center'>If you don't have account <Link className='text-info text-decoration-none' to= "/">sign up</Link></p>
        <div className='d-flex justify-content-center align-items-center'><button type="submit" className="btn btn-success mb-2 w-50">Login</button></div>
      </form>
    </div>
    </>
  )
}

export default Login