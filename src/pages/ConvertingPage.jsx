import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/ConvertingPage.css';

function ConvertingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { job_id } = state || {};

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    // 직접 접근 방지
    if (!job_id) {
      navigate('/');
      return;
    }

    // UX용 가짜 진행률 (90%까지만)
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 2 : prev));
    }, 300);

    // 🔁 3초 polling
    const pollingTimer = setInterval(async () => {
      try {
        const res = await axiosInstance.get(
          `/create_sheets/${job_id}`
        );

        const { status } = res.data;
        setStatus(status);

        if (status === 'completed') {
          clearInterval(pollingTimer);
          clearInterval(progressTimer);
          setProgress(100);

          // 결과 페이지로 이동
          navigate('/sheet-complete', {
            state: { job_id },
          });
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
        <h2 className="converting-title">Converting...</h2>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="desc-text">
          현재 상태: <b>{status}</b><br /><br />
          AI가 음악 파일을 분석하여 악보를 생성하고 있습니다.<br />
          이 과정은 수십 초에서 1~2분 정도 소요될 수 있습니다.<br />
          창을 닫지 말고 기다려주세요.
        </p>
      </div>
    </div>
  );
}

export default ConvertingPage;
