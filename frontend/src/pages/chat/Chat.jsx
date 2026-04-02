import React from "react";
import "./Chat.css";
import LeftSideBar from '/src/components/LeftSideBar/LeftSideBar.jsx'
import RightSideBar from '/src/components/RightSideBar/RightSideBar.jsx'
import ChatBox from '/src/components/ChatBox/ChatBox.jsx'

const Chat = () => {
    return (
        <div className="chat">
            <div className="chat-container">
                <LeftSideBar />
                <ChatBox />
                <RightSideBar />
            </div>
        </div>
    )
};

export default Chat;
