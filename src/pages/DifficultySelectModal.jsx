import React, { useState } from 'react';
import '../styles/DifficultySelectModal.css';

const PURPOSE_OPTIONS = [
  { value: 1, label: '반주' },
  { value: 2, label: '연주' },
];

const STYLE_OPTIONS = [
  { value: 1, label: 'Rock' },
  { value: 2, label: 'Ballad' },
  { value: 3, label: 'Original' },
];

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Normal' },
];

const INSTRUMENT_OPTIONS = [
  { value: 1, label: 'Piano' },
  { value: 2, label: 'Guitar' },
];

function DifficultySelectModal({ sheet, onConfirm, onClose, loading }) {
  const [purpose, setPurpose] = useState(1);
  const [style, setStyle] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [instrument, setInstrument] = useState(1);

  const handleConfirm = () => {
    onConfirm({ purpose, style, difficulty, instrument });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">악보 재생성</h3>
        <p className="modal-sheet-name">"{sheet.name}"</p>

        <div className="modal-section">
          <span className="modal-label">목적</span>
          <div className="modal-options">
            {PURPOSE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`modal-option-btn ${purpose === opt.value ? 'selected' : ''}`}
                onClick={() => setPurpose(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <span className="modal-label">스타일</span>
          <div className="modal-options">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`modal-option-btn ${style === opt.value ? 'selected' : ''}`}
                onClick={() => setStyle(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <span className="modal-label">난이도</span>
          <div className="modal-options">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`modal-option-btn ${difficulty === opt.value ? 'selected' : ''}`}
                onClick={() => setDifficulty(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <span className="modal-label">악기</span>
          <div className="modal-options">
            {INSTRUMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`modal-option-btn ${instrument === opt.value ? 'selected' : ''}`}
                onClick={() => setInstrument(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose} disabled={loading}>
            취소
          </button>
          <button className="modal-btn confirm" onClick={handleConfirm} disabled={loading}>
            {loading ? '요청 중...' : '재생성'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DifficultySelectModal;
