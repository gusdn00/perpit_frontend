import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/Logo.png';
import { isLoggedInState } from '../authState';
import { useRecoilState } from 'recoil';
import axiosInstance from '../axiosInstance';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setTokenBalance(null);
      setUserName(null);
      return;
    }
    axiosInstance.get('/payment/balance')
      .then(res => {
        const raw = res.data;
        if (typeof raw === 'number') { setTokenBalance(raw); return; }
        const inner = raw?.data ?? raw;
        setTokenBalance(inner?.token_balance ?? inner?.balance ?? inner?.tokens ?? inner?.token ?? 0);
      })
      .catch(() => setTokenBalance(null));

    axiosInstance.get('/auth/profile')
      .then(res => setUserName(res.data?.data?.name ?? null))
      .catch(() => setUserName(null));
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    setIsLoggedIn(false);
    setTokenBalance(null);
    setUserName(null);
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
          {userName && (
            <span className="header-username">{userName}</span>
          )}
          {tokenBalance !== null && (
            <Link to="/payment" className="token-balance-link">
              <div className="token-balance">
                <span className="token-icon">🪙</span>
                <span className="token-count">{tokenBalance}</span>
              </div>
            </Link>
          )}
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
