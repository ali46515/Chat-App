import React, { useState, useRef } from "react";
import "./ProfileUpdate.css";
import assets from "/src/assets/assets.js"

const ProfileUpdate = () => {
    const [img, setImg] = useState(false)
    const imgRef = useRef(null);

    const handleMouseMove = (e) => {
        const img = imgRef.current;
        if (!img) return;

        const rect = img.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        const xPercent = x / width;
        const yPercent = y / height;

        img.classList.remove(
            'tilt-left', 'tilt-right', 'tilt-top', 'tilt-bottom',
            'tilt-top-left', 'tilt-top-right', 'tilt-bottom-left', 'tilt-bottom-right'
        );

        if (xPercent < 0.33 && yPercent < 0.33) {
            img.classList.add('tilt-top-left');
        } else if (xPercent > 0.66 && yPercent < 0.33) {
            img.classList.add('tilt-top-right');
        } else if (xPercent < 0.33 && yPercent > 0.66) {
            img.classList.add('tilt-bottom-left');
        } else if (xPercent > 0.66 && yPercent > 0.66) {
            img.classList.add('tilt-bottom-right');
        } else if (xPercent < 0.33) {
            img.classList.add('tilt-left');
        } else if (xPercent > 0.66) {
            img.classList.add('tilt-right');
        } else if (yPercent < 0.33) {
            img.classList.add('tilt-top');
        } else if (yPercent > 0.66) {
            img.classList.add('tilt-bottom');
        }
    };

    const handleMouseLeave = () => {
        const img = imgRef.current;
        if (!img) return;

        img.classList.remove(
            'tilt-left', 'tilt-right', 'tilt-top', 'tilt-bottom',
            'tilt-top-left', 'tilt-top-right', 'tilt-bottom-left', 'tilt-bottom-right'
        );
    };


    return (
        <div className="profile">
            <div className="profile-container">
                <form>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input type="file" id="avatar" onChange={(e) => setImg(e.target.files[0])} accept=".png, .jpg, .jpeg" hidden />
                        <img src={img ? URL.createObjectURL(img) : assets.avatar_icon} alt="" />
                        Upload profile image
                    </label>
                    <input type="text" placeholder="Your Name" required />
                    <textarea placeholder="Write profile bio" required></textarea>
                    <button type="submit">Save</button>
                </form>
                <img src={img ? URL.createObjectURL(img) : assets.logo_icon} alt="" className="profile-pic" ref={imgRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
            </div>
        </div>
    );
};

export default ProfileUpdate;
