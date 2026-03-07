import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentResult.css';

function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="result-screen">
      <div className="result-box">
        <div className="result-icon cancel">!</div>
        <h2 className="result-title">결제 취소</h2>
        <p className="result-sub">결제가 취소되었습니다.</p>
        <div className="result-buttons">
          <button className="result-btn primary" onClick={() => navigate('/payment')}>
            다시 충전하기
          </button>
          <button className="result-btn secondary" onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
