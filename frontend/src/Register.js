import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Header from './Header'
import validate from './validate'

const Register = () => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [image, setImage] = useState(null)
  const [data, setdata] = useState({
    name:"",
    email:"",
    password:"",
    cpassword:""
  })

  
  const handleRegister = async (e)=>{
    e.preventDefault()
    setErrors(validate(data))
    const formData = new FormData()
    formData.append('name',data.name)
    formData.append('email',data.email)
    formData.append('password',data.password)
    formData.append('cpassword',data.cpassword)
    formData.append('images',image)
    if(errors.name ==="" && errors.email==="" && errors.password==="" && errors.cpassword === ""){
      try{
        await axios.post('https://chat-app-8h8v.onrender.com/register', formData)
        .then(res=> {
          if (res.data.Status==="Success"){
            navigate('/login')
          }else{
            console.log(res)
          }}
          )    
        .then(err=>console.log(err))
      }catch{
        console.log("register error")
      }
    }else{
      console.log("not exist")
    }
    
  }
  return (
    <>
      <Header/>  
      <div className='container-fluid d-flex justify-content-center align-items-center'>
        <form className="form-inline rounded p-4 mt-2 register" onSubmit={handleRegister}>
        <div className="form-group d-flex flex-column justify-content-center">
          <h1 className="text-center mb-4">Register</h1>
          <input 
            name='name'
            type="text" 
            className="form-control mb-3" 
            placeholder="Name"
            onChange={e=>setdata({...data, name:e.target.value})}
            />
            {errors.name && <span className='text-danger'>{errors.name}</span> }
          <input 
            name='email'
            type="text" 
            className="form-control mb-3" 
            placeholder="Email"
            onChange={e=>setdata({...data, email:e.target.value})}
            />
            {errors.email && <span className='text-danger'>{errors.email}</span> }
            <input 
            name='password'
            type="password" 
            className="form-control mb-3" 
            placeholder="Password"
            onChange={e=>setdata({...data, password:e.target.value})}
            />
            {errors.password && <span className='text-danger'>{errors.password}</span> }
            <input 
            name='cpassword'
            type="password" 
            className="form-control mb-3" 
            placeholder="Confirm Password"
            onChange={e=>setdata({...data, cpassword:e.target.value})}
            />
            {errors.cpassword && <span className='text-danger'>{errors.cpassword}</span> }
            <div>
            <label htmlFor="">Profile picture : </label>
            <input 
              name='images'
              type="file" 
              className="m-3"
              onChange={e=>setImage(e.target.files[0])}
            />
            </div>
        </div>
        <p className='text-center'>Already you have account 
          <Link className='text-info text-decoration-none' to= "/login"> Login</Link>
        </p>
        <div className='d-flex justify-content-center align-items-center'>
          <button type="submit" className="btn btn-success mb-2 w-50">Register</button>
        </div>
      </form>
    </div>
    </>
    
  )
}

export default Register