import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/PaymentResult.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing | done | error
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const pgToken = searchParams.get('pg_token');
    const partnerOrderId = searchParams.get('partner_order_id')
      || localStorage.getItem('payment_order_id');

    if (pgToken && partnerOrderId) {
      approvePayment(pgToken, partnerOrderId);
    } else {
      // 백엔드가 이미 처리한 뒤 리다이렉트한 경우
      fetchBalance();
      setStatus('done');
    }
  }, []);

  const approvePayment = async (pgToken, partnerOrderId) => {
    try {
      await axiosInstance.get('/payment/approve', {
        params: { pg_token: pgToken, partner_order_id: partnerOrderId },
      });
      localStorage.removeItem('payment_order_id');
      await fetchBalance();
      setStatus('done');
    } catch (err) {
      console.error('결제 승인 실패:', err);
      setStatus('error');
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await axiosInstance.get('/payment/balance');
      const data = res.data;
      setBalance(data.token_balance ?? data.balance ?? data.tokens ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'processing') {
    return (
      <div className="result-screen">
        <div className="result-box">
          <div className="result-spinner" />
          <p className="result-sub">결제를 처리하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="result-screen">
        <div className="result-box">
          <div className="result-icon error">✕</div>
          <h2 className="result-title">결제 처리 오류</h2>
          <p className="result-sub">결제 승인 중 문제가 발생했습니다.</p>
          <div className="result-buttons">
            <button className="result-btn primary" onClick={() => navigate('/payment')}>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-screen">
      <div className="result-box">
        <div className="result-icon success">✓</div>
        <h2 className="result-title">결제 완료</h2>
        <p className="result-sub">토큰 충전이 완료되었습니다.</p>
        {balance !== null && (
          <div className="result-balance">
            현재 잔액 <strong>{balance} 토큰</strong>
          </div>
        )}
        <div className="result-buttons">
          <button className="result-btn primary" onClick={() => navigate('/file-upload')}>
            악보 만들기
          </button>
          <button className="result-btn secondary" onClick={() => navigate('/payment')}>
            충전 내역 보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
