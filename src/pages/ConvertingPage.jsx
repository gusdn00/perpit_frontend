import React, { useEffect, useState } from 'react';
import '../styles/ConvertingPage.css';

function ConvertingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 예시: progress가 자동으로 올라가게 설정
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
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
          AI가 음악 파일을 분석하여 악보를 생성하고 있습니다.<br/>
          이 과정은 수십 초에서 1~2분 정도 소요될 수 있습니다.<br/>
          창을 닫지 말고 기다려주세요.
        </p>
      </div>
    </div>
  );
}

export default ConvertingPage;
