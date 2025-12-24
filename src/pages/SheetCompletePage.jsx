import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SheetCompletePage.css';
import { FaPlayCircle } from 'react-icons/fa';  // 재생 아이콘
import sampleSheet from '../assets/sample.png';

function SheetCompletePage() {
  const navigate = useNavigate();

  const handlePlayAudio = () => {
    alert('악보를 클릭하면 음악이 재생됩니다. (추후 기능 구현 예정)');
  };

  return (
    <div className="sheet-complete-screen">
      <div className="sheet-complete-box">
        <h2 className="complete-title">Completion of sheet generation!</h2>

        <div className="sheet-content">
          <div className="sheet-images" onClick={handlePlayAudio}>
            <img src={sampleSheet} alt="sheet" className="sheet-img sheet-img-back" />
            <img src={sampleSheet} alt="sheet" className="sheet-img sheet-img-middle" />
            <img src={sampleSheet} alt="sheet" className="sheet-img sheet-img-front" />

            <div className="overlay">
              <FaPlayCircle size={50} className="play-icon" />
            </div>
          </div>

          <div className="sheet-info">
            <p className="info-text">
              업로드한 음악 파일을 기반으로 악보 생성이 완료되었습니다.<br />
              악보를 클릭하면 음악을 재생할 수 있습니다.<br />
              다운로드하거나, 미리보기 및 내 악보에 저장하세요.
            </p>

            <button className="btn download-btn">Download</button>

            <div className="btn-group">
              <button className="btn sub-btn">View</button>
              <button className="btn sub-btn">Add My Sheets</button>
            </div>
          </div>
        </div>

        <button className="go-main-btn">Go Main</button>
      </div>
    </div>
  );
}

export default SheetCompletePage;
