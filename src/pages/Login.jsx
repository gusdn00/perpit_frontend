import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import '../styles/Login.css';
import { isLoggedInState } from "../authState";
import { useRecoilState } from "recoil";

function Login() {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const navigate = useNavigate();

    const [isLoggedIn, setLoggedIn] = useRecoilState(isLoggedInState);

    const handleLogin = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post('/api/auth/login', {
        id: id,
        password: pw
        });
        console.log(response.data);
        localStorage.setItem("Token", response.token);
        alert("로그인 성공");
        setLoggedIn(true);
        navigate('/');
        
        
    } catch (error) {
        console.error(error);
        alert("로그인 실패")
    }
    };
  return (
    <div className="login-screen">
      <div className="login-box">
        <h2 className="login-title">Log In</h2>
        <form onSubmit={handleLogin}>
            <input 
            className="login-input" 
            type="text" 
            placeholder="ID"
            value={id}
            required
            onChange={e=>setId(e.target.value)}
            />

            <input className="login-input"
            type="password"
            placeholder="PW"
            required
            value={pw}
            onChange={e=>setPw(e.target.value)}
            />
            
            <button className="login-btn" type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
