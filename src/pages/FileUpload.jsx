import React, { useState } from 'react';
import '../styles/FileUpload.css';

function FileUpload() {
  const [difficulty, setDifficulty] = useState('easy');
  const [hasLyrics, setHasLyrics] = useState(false);
  const [songName, setSongName] = useState('');

  return (
    <div className="upload-page">
      <div className="upload-container">

        {/* 좌측 */}
        <div className="left-panel">
          <h2>1. File Attachment</h2>
          <div className="file-box">
            <div className="file-placeholder">+</div>
          </div>
          <input 
            className="song-name-input" 
            type="text" 
            placeholder="Enter song name"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
          />
        </div>

        {/* 우측 */}
        <div className="right-panel">
          <div className="section">
            <h3>Select Style</h3>
            <div className="toggle-group">
              <button 
                className={difficulty === 'easy' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setDifficulty('easy')}
              >Easy</button>
              <button 
                className={difficulty === 'original' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setDifficulty('original')}
              >Original</button>
              <button 
                className={difficulty === 'ballad' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setDifficulty('ballad')}
              >Ballad</button>
            </div>
          </div>

          <div className="section">
            <h3>Lyrics</h3>
            <div className="toggle-group">
              <button 
                className={hasLyrics ? 'toggle-btn' : 'toggle-btn selected'}
                onClick={() => setHasLyrics(false)}
              >가사 없음</button>
              <button 
                className={hasLyrics ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setHasLyrics(true)}
              >가사 있음</button>
            </div>
          </div>

          <div className="button-group">
            <button className="back-btn">Back</button>
            <button className="go-btn">Go!</button>
          </div>

          <div className="description">
            업로드한 음악 파일을 AI가 분석하여 악보를 생성합니다.<br />
            <b>Easy</b>는 쉽게, <b>Original</b>은 원곡에 가깝게, <b>Ballad</b>는 발라드 스타일로 변환됩니다.<br />
            가사 유무도 선택해 주세요.
          </div>
        </div>

      </div>
    </div>
  );
}

export default FileUpload;
