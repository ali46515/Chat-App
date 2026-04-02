import React from "react"
import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Chat from "./pages/chat/Chat.jsx"
import ProfileUpdate from "./pages/Profile/ProfileUpdate.jsx"


function App() {

  return (<>
    <Routes>
      <Route path='/' element={<Login />}></Route>
      <Route path='/chat' element={<Chat />}></Route>
      <Route path='/profile' element={<ProfileUpdate />}></Route>

    </Routes>
  </>)
}

export default App
