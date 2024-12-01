import { Route, Routes} from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Chatapp from "./Chatapp";
import { useState } from "react";
import io from 'socket.io-client'

const socket = io.connect('https://chat-app-8h8v.onrender.com')

function App() {
  
  const [token, setToken] = useState(null)

  return (
    <div className="App text-light">
      <Routes>
        <Route path="/" element={<Register/>}/>
        <Route path="/login" element={<Login setToken = {setToken}/>}/>
        <Route path="/chatapp" element={<Chatapp 
                                        token= {token}
                                        socket = {socket}/>}/>
      </Routes>
    </div>
  );
}

export default App;
