import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css'
import logo from '../assets/Logo.png'
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { isLoggedInState } from '../authState';
import { useRecoilState } from 'recoil';

function Header() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="header">
        <div className="logo">
          <Link to="/"><img src={logo} alt="logo-img" /></Link>
        </div>
        {isLoggedIn ? (
        <div className="auth-buttons">
          <span>(닉네임)</span>
          <button className='btn' onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <div className="auth-buttons">
          <Link to="/login"><button className='auth-btn'>Log In</button></Link>
          <Link to='/signup'><button className='auth-btn'>Sign Up</button></Link>
        </div>
      )}
      
    </div>
  );
}

export default Header;
