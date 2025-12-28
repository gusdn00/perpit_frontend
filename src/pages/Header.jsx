import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/Logo.png';
import { isLoggedInState } from '../authState';
import { useRecoilState } from 'recoil';

function Header() {
  const navigate = useNavigate();

  
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);

  
  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="logo-img" />
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="auth-buttons">
          <Link to="/mysheets">
            <button className="auth-btn">My Sheets</button>
          </Link>
          <button className="auth-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      ) : (
        <div className="auth-buttons">
          <Link to="/login"><button className="auth-btn">Log In</button></Link>
          <Link to="/signup"><button className="auth-btn">Sign Up</button></Link>
        </div>
      )}
    </div>
  );
}

export default Header;
