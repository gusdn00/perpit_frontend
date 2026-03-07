import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/PaymentPage.css';

const TOKEN_PACKAGES = [
  { id: 1, tokens: 10, price: '1,000원', label: '기본' },
  { id: 2, tokens: 30, price: '2,500원', label: '추천' },
  { id: 3, tokens: 50, price: '4,000원', label: '대용량' },
];

function PaymentPage() {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await axiosInstance.get('/payment/balance');
      setBalance(res.data);
    } catch (err) {
      console.error('잔액 조회 실패:', err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get('/payment/history');
      const raw = res.data;
      // 다양한 응답 형식 처리
      const list =
        Array.isArray(raw)         ? raw :
        Array.isArray(raw?.data)   ? raw.data :
        Array.isArray(raw?.history)? raw.history :
        Array.isArray(raw?.items)  ? raw.items :
        Array.isArray(raw?.transactions) ? raw.transactions :
        [];
      setHistory(list);
    } catch (err) {
      console.error('내역 조회 실패:', err);
    }
  };

  const handlePayment = async () => {
    if (!selected) {
      alert('충전할 패키지를 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/payment/ready', {
        item_name: `토큰 ${selected.tokens}개 충전`,
        quantity: selected.tokens,
      });
      const { next_redirect_pc_url, partner_order_id } = res.data;
      localStorage.setItem('payment_order_id', partner_order_id);
      window.location.href = next_redirect_pc_url;
    } catch (err) {
      console.error('결제 준비 실패:', err);
      alert('결제 준비 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getBalanceValue = () => {
    if (balance === null || balance === undefined) return 0;
    // 숫자 직접 반환하는 경우
    if (typeof balance === 'number') return balance;
    // { token_balance, balance, tokens } 또는 { data: { ... } } 패턴
    const inner = balance?.data ?? balance;
    return inner?.token_balance ?? inner?.balance ?? inner?.tokens ?? inner?.token ?? 0;
  };

  return (
    <div className="payment-screen">
      <div className="payment-container">
        <h2 className="payment-title">토큰 충전</h2>

        <div className="balance-box">
          <span className="balance-label">현재 잔액</span>
          <span className="balance-value">
            {balanceLoading ? '조회 중...' : `${getBalanceValue()} 토큰`}
          </span>
        </div>

        <p className="package-guide">충전할 패키지를 선택하세요</p>
        <div className="package-grid">
          {TOKEN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`package-card ${selected?.id === pkg.id ? 'selected' : ''}`}
              onClick={() => setSelected(pkg)}
            >
              <div className="package-badge">{pkg.label}</div>
              <div className="package-tokens">{pkg.tokens}<span>토큰</span></div>
              <div className="package-price">{pkg.price}</div>
            </div>
          ))}
        </div>

        <button
          className="pay-btn"
          onClick={handlePayment}
          disabled={loading || !selected}
        >
          {loading ? '처리 중...' : '카카오페이로 결제하기'}
        </button>

        <div className="history-section">
          <h3 className="history-title">충전 / 사용 내역</h3>
          {history.length === 0 ? (
            <p className="history-empty">내역이 없습니다.</p>
          ) : (
            <div className="history-list">
              {history.map((item, idx) => (
                <div key={idx} className="history-item">
                  <span className="history-desc">
                    {item.description || item.item_name || item.title || item.type || '토큰 거래'}
                  </span>
                  <span className={`history-amount ${(item.amount ?? item.quantity ?? item.token_amount ?? 0) > 0 ? 'positive' : 'negative'}`}>
                    {(item.amount ?? item.quantity ?? item.token_amount ?? 0) > 0 ? '+' : ''}
                    {item.amount ?? item.quantity ?? item.token_amount ?? 0} 토큰
                  </span>
                  <span className="history-date">
                    {(item.created_at || item.date || item.timestamp)
                      ? new Date(item.created_at || item.date || item.timestamp).toLocaleDateString('ko-KR')
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
