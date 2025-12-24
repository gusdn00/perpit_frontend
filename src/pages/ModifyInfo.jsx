import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/ModifyInfo.css';

function ModifyInfo() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  
  // 중복 확인 (임시 alert로 대체)
  const checkNickname = () => {
    alert("닉네임 중복 확인");
  };

  const checkEmail = () => {
    alert("이메일 중복 확인");
  };

  const handleSave = () => {
    alert("저장되었습니다.");
    navigate('/profile');
  };

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div className="profile-edit-screen">
      <div className="profile-edit-box">
        <h2 className="profile-edit-title">Profile</h2>
        <div className="profile-edit-info">
          
          <div className="edit-row">
            <div className="label">Nick Name</div>
            <input 
              className="edit-input" 
              type="text" 
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter nickname"
            />
            <button className="check-btn" onClick={checkNickname}>Check redundancy</button>
          </div>

          <div className="edit-row">
            <div className="label">ID</div>
            <div className="fixed-value">user1234</div>
          </div>

          <div className="edit-row">
            <div className="label">e-Mail</div>
            <input 
              className="edit-input" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <button className="check-btn" onClick={checkEmail}>Check redundancy</button>
          </div>

        </div>

        <div className="edit-buttons">
          <button className="edit-btn back" onClick={handleBack}>Back</button>
          <button className="edit-btn save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default ModifyInfo;
