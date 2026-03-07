import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
                user_id: id,
                password: pw
            });
            localStorage.setItem("Token", response.data.token);
            setLoggedIn(true);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("로그인 실패");
        }
    };

    const handleKakaoLogin = () => {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
        }
        window.Kakao.Auth.authorize({
            redirectUri: `${window.location.origin}/auth/kakao/callback`,
        });
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
                        onChange={e => setId(e.target.value)}
                    />
                    <input
                        className="login-input"
                        type="password"
                        placeholder="PW"
                        required
                        value={pw}
                        onChange={e => setPw(e.target.value)}
                    />
                    <button className="login-btn" type="submit">Enter</button>
                </form>

                <div className="login-divider">
                    <span>또는</span>
                </div>

                <button className="kakao-login-btn" onClick={handleKakaoLogin}>
                    <img
                        src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
                        alt="kakao"
                    />
                    카카오로 로그인
                </button>
            </div>
        </div>
    );
}

export default Login;
