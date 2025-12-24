import React from 'react';
import '../styles/Mainscreen.css';
import sampleSheet from '../assets/sample.png';
import { Link } from 'react-router-dom';
function Mainscreen() {
  return (
    <div className='mainscreen'>
      <div className="content">
        <div className='title'>
          <h1>AI Music Sheet Generator</h1>
        </div>
        <div className='body'>
          <div className='body-left'>
            <p className='body-text'>
              <b><h3>AI가 만들어주는 악보, 지금 경험해보세요.</h3></b>
              음악 파일을 업로드하면, AI가 자동으로 분석해 <b>쉽게 연주할 수 있는 버전</b>과 
              <b> 원곡에 가까운 정교한 악보</b>를 만들어 드립니다.<br/><br/>
              복잡한 편곡 작업 없이, 클릭 한 번으로 악보를 생성하세요.<br/><br/>
              언제 어디서나 빠르고 정확한 악보를 받아보세요!
            </p>
          </div>
          <div className='body-right'>
            <div className="body-sample">
              <img src={sampleSheet} alt="sheet" className="body-sample-img" />
            </div>
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
