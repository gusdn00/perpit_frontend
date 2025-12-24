import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/ModifyPw.css';

function ModifyPw() {
  const navigate = useNavigate();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [checkPw, setCheckPw] = useState("");

  const handleChange = () => {
    if (newPw !== checkPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    alert("비밀번호가 변경되었습니다.");
    navigate('/profile');
  };

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div className="password-change-screen">
      <div className="password-change-box">
        <h2 className="password-change-title">Profile</h2>
        <div className="password-change-info">

          <div className="pw-row">
            <div className="label">Current Password</div>
            <input 
              className="pw-input" 
              type="password" 
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="pw-row">
            <div className="label">New Password</div>
            <input 
              className="pw-input" 
              type="password" 
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className="pw-row">
            <div className="label">Check Password</div>
            <input 
              className="pw-input" 
              type="password" 
              value={checkPw}
              onChange={e => setCheckPw(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

        </div>

        <div className="pw-buttons">
          <button className="pw-btn back" onClick={handleBack}>Back</button>
          <button className="pw-btn save" onClick={handleChange}>Change</button>
        </div>
      </div>
    </div>
  );
}

export default ModifyPw;
