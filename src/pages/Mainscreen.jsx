import React from 'react';
import '../styles/Mainscreen.css';
import sampleSheet from '../assets/sample.png';
import { Link } from 'react-router-dom';

function Mainscreen() {
  return (
    <div className="mainscreen">
      <div className="card">
        <header className="header">
          <h1>AI Music Sheet Generator</h1>
          <p>Upload music. Get beautiful sheets.</p>
        </header>

        <div className="main">
          <div className="text">
            <h3>AI가 만들어주는 악보</h3>
            <p>
              음악 파일을 업로드하면 AI가 자동 분석하여<br />
              <b>연주하기 쉬운 버전</b>과 <b>원곡에 가까운 악보</b>를 생성합니다.
              <br /><br />
              복잡한 편곡 없이, 클릭 한 번으로 악보를 받아보세요.
            </p>
          </div>

          <div className="preview">
            <img src={sampleSheet} alt="sheet preview" />
          </div>
        </div>

        <Link to="/file-upload" className="start-link">
          <button className="start-btn">Start</button>
        </Link>
      </div>
    </div>
  );
}

export default Mainscreen;
