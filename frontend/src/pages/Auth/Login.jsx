import React, { useState } from "react";
import "./Login.css";
import assets from "/src/assets/assets.js";

const Login = () => {
    const [currState, setCurrState] = useState("Sign Up");
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="login">
            <img src={assets.logo_big} alt="" className="logo" />
            <form className="login-form">
                <h2>{currState}</h2>
                <p className="form-subtitle">Please {currState === "Sign Up" ? "sign up" : "log in"} to continue</p>

                {currState === "Sign Up" && (
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username"
                            className="form-input"
                            onChange={(e) => setUserName(e.target.value)}
                            value={userName}
                            required
                        />
                    </div>
                )}

                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="form-input"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        className="form-input"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    {currState === "Sign Up" ? "Create Account" : "LogIn"}
                </button>

                <div className="login-term">
                    <input type="checkbox" id="terms" />
                    <label htmlFor="terms">
                        Agree to the <span className="link-text">terms of use</span> and{" "}
                        <span className="link-text">privacy policy</span>
                    </label>
                </div>

                <div className="login-forgot">
                    {currState === "Sign Up" ? <p className="login-toggle">
                        Already have an account?{" "}
                        <span className="toggle-link" onClick={() => setCurrState("Login")}>
                            Sign In
                        </span>
                    </p> : <p className="login-toggle">
                        Create an account?{" "}
                        <span className="toggle-link" onClick={() => setCurrState("Sign Up")}>
                            Sign Up
                        </span>
                    </p>}
                </div>
            </form>
        </div>
    );
};

export default Login;
