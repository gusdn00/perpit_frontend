import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/ConvertingPage.css';

const STATUS_LABEL = {
  pending: '대기 중',
  processing: '처리 중',
  completed: '완료',
  failed: '실패',
};

function ConvertingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { job_id } = state || {};

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (!job_id) {
      navigate('/');
      return;
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 2 : prev));
    }, 300);

    const pollingTimer = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/create_sheets/${job_id}`);
        const { status } = res.data;
        setStatus(status);

        if (status === 'completed') {
          clearInterval(pollingTimer);
          clearInterval(progressTimer);
          setProgress(100);
          navigate('/sheet-complete', { state: { job_id } });
        }

        if (status === 'failed') {
          clearInterval(pollingTimer);
          clearInterval(progressTimer);
          alert('악보 생성에 실패했습니다.');
          navigate(-1);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => {
      clearInterval(pollingTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="converting-wrapper">
      <div className="converting-card">
        <div className="converting-spinner" />
        <h2 className="converting-title">악보를 생성하고 있습니다</h2>
        <span className="converting-status">{STATUS_LABEL[status] ?? status}</span>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="desc-text">
          AI가 음악 파일을 분석하여 악보를 생성 중입니다.<br />
          수십 초에서 1~2분 정도 소요될 수 있습니다.<br />
          창을 닫지 말고 기다려주세요.
        </p>
      </div>
    </div>
  );
}

export default ConvertingPage;
