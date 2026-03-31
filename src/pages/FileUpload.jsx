import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/FileUpload.css';

function FileUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [songName, setSongName] = useState('');
  const [purpose, setPurpose] = useState('accompaniment'); // accompaniment | performance
  const [style, setStyle] = useState('original');          // rock | ballad | original
  const [difficulty, setDifficulty] = useState('easy');    // easy | normal
  const [instrument, setInstrument] = useState('piano');   // piano | guitar

  useEffect(() => {
    axiosInstance.get('/payment/balance')
      .then(res => {
        const raw = res.data;
        if (typeof raw === 'number') { setTokenBalance(raw); return; }
        const inner = raw?.data ?? raw;
        setTokenBalance(inner?.token_balance ?? inner?.balance ?? inner?.tokens ?? inner?.token ?? 0);
      })
      .catch(() => setTokenBalance(null));
  }, []);

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

  const instrumentMap = {
    piano: 1,
    guitar: 2,
  };

  const handleInsufficientTokens = () => {
    alert('토큰 잔액이 부족합니다. 충전 후 이용해주세요.');
    navigate('/payment');
  };

  const handleSubmit = async () => {
    if (!file || !songName) {
      alert('파일과 곡 이름을 입력해주세요.');
      return;
    }

    if (tokenBalance !== null && tokenBalance <= 0) {
      handleInsufficientTokens();
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', songName);
    formData.append('purpose', purposeMap[purpose]);
    formData.append('style', styleMap[style]);
    formData.append('difficulty', difficultyMap[difficulty]);
    formData.append('instrument', instrumentMap[instrument]);

    try {
      const res = await axiosInstance.post('/create_sheets', formData);
      console.log(res.data);
      const { jobId } = res.data;

      if (!jobId) {
        alert('job_id를 받지 못했습니다.');
        return;
      }

      navigate('/converting', {
        state: { job_id: jobId }
      });

    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg    = err?.response?.data?.detail ?? err?.response?.data?.message ?? '';
      if (status === 402 || /token|balance|credit/i.test(msg)) {
        handleInsufficientTokens();
      } else {
        alert('악보 생성 요청에 실패했습니다.');
      }
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

          {/* 악기 */}
          <div className="section">
            <h3>Instrument</h3>
            <div className="toggle-group">
              <button
                className={instrument === 'piano' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setInstrument('piano')}
              >
                Piano
              </button>
              <button
                className={instrument === 'guitar' ? 'toggle-btn selected' : 'toggle-btn'}
                onClick={() => setInstrument('guitar')}
              >
                Guitar
              </button>
            </div>
          </div>

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

          <div className="token-info">
            <span className="token-info-icon">🪙</span>
            <span className="token-info-text">
              악보 생성 시 토큰이 소모됩니다.
              {tokenBalance !== null && (
                <> &nbsp;현재 잔액: <strong>{tokenBalance} 토큰</strong></>
              )}
            </span>
          </div>

          <div className="button-group">
            <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
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
