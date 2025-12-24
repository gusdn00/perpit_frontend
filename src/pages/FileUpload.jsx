import React, { useState } from 'react';
import '../styles/FileUpload.css';
import axiosInstance from '../axiosInstance.js';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [purpose, setPurpose] = useState('accompaniment'); // accompaniment | performance
  const [style, setStyle] = useState('original');          // rock | ballad | original
  const [difficulty, setDifficulty] = useState('easy');    // easy | normal
  const [songName, setSongName] = useState('');
  const purposeMap = {
  accompaniment: 1, // 반주
  performance: 2    // 연주
};

const styleMap = {
  rock: 1,
  ballad: 2,
  original: 3
};

const difficultyMap = {
  easy: 1,
  normal: 2
};

const handleSubmit = async () => {
  if (!file || !songName) {
    alert('파일과 곡 이름을 입력해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', songName);
  formData.append('purpose', purposeMap[purpose]);
  formData.append('style', styleMap[style]);
  formData.append('difficulty', difficultyMap[difficulty]);

  try {
    const res = await axiosInstance.post(
      '/create_sheets',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log(res.data);
    alert('악보 생성 요청 완료!');
  } catch (err) {
    console.error(err);
    alert('업로드 실패');
  }
};

  return (
    <div className="upload-page">
      <div className="upload-container">

        {/* 좌측 */}
        <div className="left-panel">
          <h2>1. File Attachment</h2>

          <div
  className="file-box"
  onClick={() => document.getElementById('fileInput').click()}
>
  <div className="file-placeholder">
    {file ? '🎵' : '+'}
  </div>
</div>

{file && (
  <div className="file-name">
    {file.name}
  </div>
)}

<input
  id="fileInput"
  type="file"
  accept="audio/*"
  style={{ display: 'none' }}
  onChange={(e) => setFile(e.target.files[0])}
/>

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

          {/* 용도 선택 */}
          <div className="section">
            <h3>Purpose</h3>
            <div className="toggle-group">
              <button
                className={purpose === 'accompaniment' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setPurpose('accompaniment')}
              >
                반주
              </button>
              <button
                className={purpose === 'performance' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setPurpose('performance')}
              >
                연주
              </button>
            </div>
          </div>

          {/* 스타일 선택 */}
          <div className="section">
            <h3>Style</h3>
            <div className="toggle-group">
              <button
                className={style === 'rock' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setStyle('rock')}
              >
                Rock
              </button>
              <button
                className={style === 'ballad' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setStyle('ballad')}
              >
                Ballad
              </button>
              <button
                className={style === 'original' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setStyle('original')}
              >
                Original
              </button>
            </div>
          </div>

          {/* 난이도 선택 */}
          <div className="section">
            <h3>Difficulty</h3>
            <div className="toggle-group">
              <button
                className={difficulty === 'easy' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setDifficulty('easy')}
              >
                Easy
              </button>
              <button
                className={difficulty === 'normal' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setDifficulty('normal')}
              >
                Normal
              </button>
            </div>
          </div>

          {/* 버튼 */}
          <div className="button-group">
            <button className="back-btn">Back</button>
            <button className="go-btn" onClick={handleSubmit}>Go!</button>
          </div>

          {/* 설명 */}
          <div className="description">
            업로드한 음악 파일을 AI가 분석하여 악보를 생성합니다.<br />
            <b>Easy</b>는 쉽게, <b>Normal</b>은 일반 난이도로 생성됩니다.<br />
            <b>Rock</b>, <b>Ballad</b>, <b>Original</b> 스타일 중 선택할 수 있습니다.
          </div>

        </div>
      </div>
    </div>
  );
}

export default FileUpload;
