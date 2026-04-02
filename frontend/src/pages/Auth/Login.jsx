import React from "react";
import "./Login.css";
import assets from "/src/assets/assets.js";

const Login = () => {
    return (
        <div className="login">
            <img src={assets.logo_big} alt="" className="logo" />
            <form className="login-form">
                <h2>Welcome Back</h2>
                <p className="form-subtitle">Please sign up to continue</p>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Username"
                        className="form-input"
                        required
                    />
                </div>

                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="form-input"
                        required
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        className="form-input"
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">Create Account</button>

                <div className="login-term">
                    <input type="checkbox" id="terms" />
                    <label htmlFor="terms">Agree to the <span className="link-text">terms of use</span> and <span className="link-text">privacy policy</span></label>
                </div>

                <div className="login-forgot">
                    <div className="login-toggle">
                        Already have an account? <span className="toggle-link">Sign In</span>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;