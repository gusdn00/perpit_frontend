import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { isLoggedInState } from '../authState';

function KakaoCallback() {
  const navigate = useNavigate();
  const [, setLoggedIn] = useRecoilState(isLoggedInState);
  const [statusMsg, setStatusMsg] = useState('카카오 로그인 처리 중...');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      setStatusMsg('인증 코드가 없습니다. 다시 시도해주세요.');
      return;
    }
    handleKakaoLogin(code);
  }, []);

  const handleKakaoLogin = async (code) => {
    try {
      // 1) code → access_token (Kakao 토큰 교환)
      const tokenRes = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        new URLSearchParams({
          grant_type:   'authorization_code',
          client_id:    import.meta.env.VITE_KAKAO_JS_KEY,
          redirect_uri: `${window.location.origin}/auth/kakao/callback`,
          code,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const access_token = tokenRes.data.access_token;

      // 2) access_token → 백엔드 JWT
      const res = await axios.post('/api/auth/kakao', { access_token });
      localStorage.setItem('Token', res.data.token);
      setLoggedIn(true);
      navigate('/');
    } catch (err) {
      console.error('카카오 로그인 실패:', err);
      setStatusMsg('로그인에 실패했습니다. 다시 시도해주세요.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      paddingLeft: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f5',
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: '16px',
      color: '#555',
    }}>
      {statusMsg}
    </div>
  );
}

export default KakaoCallback;
