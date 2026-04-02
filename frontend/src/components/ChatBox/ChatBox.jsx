import React from 'react'
import './ChatBox.css'
import assets from '/src/assets/assets.js'

const ChatBox = () => {
    return (
        <div className="chat-box">
            <div className="chat-user">
                <img src={ assets.profile_img} alt="" />
                <p>Ahmad Ijaz <img src={assets.green_dot} alt="" /></p>
                <img src={assets.help_icon} className='help' alt="" />
            </div>
        </div>
    )
}

export default ChatBox