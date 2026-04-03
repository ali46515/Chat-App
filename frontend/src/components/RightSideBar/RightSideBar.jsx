import React from 'react'
import './RightSideBar.css'
import assets from '/src/assets/assets.js'

const RightSideBar = () => {
    return (
        <div className="rs">
            <div className="rs-profile">
                <img src={assets.profile_img} alt="" />
                <h3>Ahmad Ijaz <img src={assets.green_dot} alt="" className='dot' /></h3>
                <p>Salam, Kesy ho?</p>
            </div>
        </div>
    )
}

export default RightSideBar