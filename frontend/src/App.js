import { Route, Routes} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Chatapp from "./components/Chatapp";
import io from 'socket.io-client'
import { baseUrl } from "./constant/url";

const socket = io.connect(`${baseUrl}`)

function App() {
  
  return (
    <div className="App text-light">
      <Routes>
        <Route path="/" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/chatapp" element={<Chatapp socket = {socket}/>}/>
      </Routes>
    </div>
  );
}

export default App;
