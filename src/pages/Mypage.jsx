import React from 'react';
import '../styles/Mypage.css';

function Mypage() {
  return (
    <div className="profile-screen">
      <div className="profile-box">
        <h2 className="profile-title">Profile</h2>
        <div className="profile-info">
          <div className="profile-row">
            <span className="label">Nick Name</span>
            <span className="value">user_nickname</span>
          </div>
          <div className="profile-row">
            <span className="label">ID</span>
            <span className="value">user_id</span>
          </div>
          <div className="profile-row">
            <span className="label">e-Mail</span>
            <span className="value">user_email@example.com</span>
          </div>
        </div>
        <div className="profile-buttons">
          <button className="profile-btn">Modify Information</button>
          <button className="profile-btn">Password Change</button>
        </div>
      </div>
    </div>
  );
}

export default Mypage;
