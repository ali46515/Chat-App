import React, { useState } from "react";
import "./ProfileUpdate.css";
import assets from "/src/assets/assets.js"

const ProfileUpdate = () => {
    const [img, setImg] = useState(false)

    return (
        <div className="profile">
            <div className="profile-container">
                <form>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input type="file" id="avatar" onChange={(e) => setImg(e.target.files[0])} accept=".png, .jpg, .jpeg" hidden />
                        <img src={img ? URL.createObjectURL(img) : assets.avatar_icon} alt="" />
                        upload profile image
                    </label>
                    <input type="text" placeholder="Your Name" required />
                    <textarea placeholder="Write profile bio" required></textarea>
                    <button type="submit">Save</button>
                </form>
                <img src={img ? URL.createObjectURL(img) : assets.logo_icon} alt="" className="profile-pic" />
            </div>
        </div>
    );
};

export default ProfileUpdate;
