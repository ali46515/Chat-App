import React from "react"
import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Chat from "./pages/chat/Chat.jsx"
import ProfileUpdate from "./pages/Profile/ProfileUpdate.jsx"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'


function App() {

  return (<>
    <ToastContainer>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/chat' element={<Chat />}></Route>
        <Route path='/profile' element={<ProfileUpdate />}></Route>
      </Routes>
    </ToastContainer>
  </>)
}

export default App
