import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/FileUpload.css';

function FileUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [songName, setSongName] = useState('');
  const [purpose, setPurpose] = useState('accompaniment'); // accompaniment | performance
  const [style, setStyle] = useState('original');          // rock | ballad | original
  const [difficulty, setDifficulty] = useState('easy');    // easy | normal

  // enum 매핑 (백엔드 합의값)
  const purposeMap = {
    accompaniment: 1,
    performance: 2,
  };

  const styleMap = {
    rock: 1,
    ballad: 2,
    original: 3,
  };

  const difficultyMap = {
    easy: 1,
    normal: 2,
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
      // ✅ 악보 생성 요청 (즉시 응답)
      const res = await axiosInstance.post('/create_sheets', formData);

      const { job_id } = res.data.jobid;
      if (!job_id) {
        alert('job_id를 받지 못했습니다.');
        return;
      }

      // ✅ ConvertingPage로 이동 (job_id만 전달)
      navigate('/converting', {
        state: { job_id },
      });

    } catch (err) {
      console.error(err);
      alert('악보 생성 요청에 실패했습니다.');
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

          <input
            id="fileInput"
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (
            <div className="file-name">
              {file.name}
            </div>
          )}

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

          {/* 용도 */}
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

          {/* 스타일 */}
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

          {/* 난이도 */}
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

          <div className="button-group">
            <button className="back-btn">Back</button>
            <button className="go-btn" onClick={handleSubmit}>
              Go!
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FileUpload;
