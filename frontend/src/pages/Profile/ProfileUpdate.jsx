import React from "react";
import "./ProfileUpdate.css";
import assets from "/src/assets/assets.js"

const ProfileUpdate = () => {
    return (
        <div className="profile">
            <div className="profile-container">
                <form>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input type="file" id="avatar" accept=".png, .jpg, .jpeg" />
                        <img src={assets.avatar_icon} alt="" />
                        upload profile image
                    </label>
                    <input type="text" placeholder="Your Name" required />
                    <textarea placeholder="Write profile bio" required></textarea>
                    <button type="submit">Save</button>
                </form>
                <img src={assets.logo_icon} alt="" />
            </div>
        </div>
    );
};

export default ProfileUpdate;
