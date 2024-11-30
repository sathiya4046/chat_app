import React from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Link} from 'react-router-dom'



function Header() {

  return (

            <div className='header'>
            <nav className="navbar navbar-expand-lg px-5">
            <div>
            <Link to={'/'} className='bi bi-whatsapp text-light me-3 fs-2'></Link>
            <Link to={'/'} className="navbar-brand fw-bold fs-2 text-light">WatsApp</Link>
            </div> 
            <button className="navbar-toggler border border-light rounded" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                    <Link to={'/'} className="nav-link fw-medium text-light">Register</Link>
                </li>
                <hr />
                <li className="nav-item">
                    <Link to={'/login'} className="nav-link fw-medium text-light">Login</Link>
                </li>
                </ul>
            </div>
            </nav>
            <hr />
            </div>

  )
}

export default Header