import React from 'react'
import './ChatBox.css'
import assets from '/src/assets/assets.js'

const ChatBox = () => {
    return (
        <div className="chat-box">
            <div className="chat-user">
                <img src={assets.profile_img} alt="" />
                <p>Ahmad Ijaz <img src={assets.green_dot} className='dot' alt="" /></p>
                <img src={assets.help_icon} className='help' alt="" />
            </div>

            <div className="chat-msg">
                <div className="s-msg">
                    <p className="msg">Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui, sint minus. Esse iste, sunt suscipit temporibus delectus facilis ducimus qui. Perferendis libero excepturi officiis ab id! Fugit dolore at aliquid?</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>11:30 AM</p>
                    </div>
                </div>
                <div className="r-msg">
                    <p className="msg">Lorem ipsum dolor sit amet consectetur adipisicing elit?</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>1:30 PM</p>
                    </div>
                </div>
            </div>

            <div className="chat-input">
                <input type="text" placeholder='Send a message' />
                <input type="file" id="image" accept='image/png, image/jpeg' hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img src={assets.send_button} alt="" />
            </div>
        </div>
    )
}

export default ChatBox