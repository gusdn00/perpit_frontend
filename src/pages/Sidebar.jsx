import React, { useState } from 'react';
import { FiLogOut, FiInfo, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isLoggedInState } from '../authState';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const [opened, setOpened] = useState(false);
  const [isLoggedIn] = useRecoilState(isLoggedInState);

  return (
    <aside className={`sidebar ${opened ? 'opened' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpened(!opened)}
      >
        {opened ? '←' : '☰'}
      </button>

      {opened && (
        <div className="sidebar-content">
          <div className="sidebar-main">
            <div className="nickname">
              {isLoggedIn ? '' : 'Please Login'}
            </div>

            {isLoggedIn ? (
              <>
                <button className="sidebar-btn">Profile</button>
                <button className="sidebar-btn">My Sheets</button>
              </>
            ) : (
              <Link to="/login">
                <button className="sidebar-btn">Log In</button>
              </Link>
            )}
          </div>

          <div className="sidebar-footer">
            <FiInfo />
            <FiSettings />
          </div>
        </div>
      )}
    </aside>
  );
}
