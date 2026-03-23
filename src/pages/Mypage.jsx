import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/Mypage.css';
import '../styles/DinoGame.css';
import DinoGame from './DinoGame';

function Mypage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDino, setShowDino] = useState(false);

  /* =========================
     프로필 조회
     ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/auth/profile');
        // ✅ 실제 데이터는 res.data.data
        setProfile(res.data.data);
      } catch (err) {
        console.error(err);
        alert('프로필 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-screen">프로필 정보가 없습니다.</div>;
  }

  const { name, user_id, email } = profile;

  return (
    <div className="profile-screen">
      {showDino && <DinoGame onClose={() => setShowDino(false)} />}
      <div className="profile-box">
        <h2 className="profile-title">Profile</h2>

        <div className="profile-info">
          <div className="profile-row">
            <span className="label">Name</span>
            <span className="value">{name}</span>
          </div>

          <div className="profile-row">
            <span className="label">ID</span>
            <span className="value">{user_id}</span>
          </div>

          <div className="profile-row">
            <span className="label">e-Mail</span>
            <span className="value">{email}</span>
          </div>
        </div>

        <button className="easter-egg-btn" onClick={() => setShowDino(true)} title="?">🦕</button>
      </div>
    </div>
  );
}

export default Mypage;
