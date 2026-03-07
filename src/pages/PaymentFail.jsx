import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentResult.css';

function PaymentFail() {
  const navigate = useNavigate();

  return (
    <div className="result-screen">
      <div className="result-box">
        <div className="result-icon error">✕</div>
        <h2 className="result-title">결제 실패</h2>
        <p className="result-sub">결제 처리 중 오류가 발생했습니다.</p>
        <div className="result-buttons">
          <button className="result-btn primary" onClick={() => navigate('/payment')}>
            다시 시도
          </button>
          <button className="result-btn secondary" onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFail;
