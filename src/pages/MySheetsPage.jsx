import React from 'react';
import { FiSearch, FiDownload, FiTrash2 } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa'; // 재생 아이콘 추가
import '../styles/MySheetsPage.css';
import sampleSheet from '../assets/sample.png';

const dummySheets = [
  { id: 1, name: 'Sheet 1' },
  { id: 2, name: 'Sheet 2' },
  { id: 3, name: 'Sheet 3' },
  { id: 4, name: 'Sheet 4' },
  { id: 5, name: 'Sheet 5' },
];

function MySheetsPage() {
  const handleView = (name) => {
    alert(`${name} 보기`);
  };

  const handleDownload = (name) => {
    alert(`${name} 다운로드`);
  };

  const handleDelete = (name) => {
    alert(`${name} 삭제`);
  };

  const handlePlay = (name) => {
    alert(`${name} 음악 재생 (UI만 구현됨)`);
  };

  return (
    <div className="my-sheets-screen">
      <div className="my-sheets-box">
        <h2 className="my-sheets-title">My Sheets</h2>

        <div className="sheet-list">
          {dummySheets.map(sheet => (
            <div key={sheet.id} className="sheet-card">
              <div className="sheet-img-wrapper" onClick={() => handlePlay(sheet.name)}>
                <img src={sampleSheet} alt={sheet.name} className="sheet-card-img" />
                <div className="overlay">
                  <FaPlayCircle size={40} className="play-icon" />
                </div>
              </div>
              <p className="sheet-name">{sheet.name}</p>
              <div className="sheet-icons">
                <button onClick={() => handleView(sheet.name)}><FiSearch size={20} /></button>
                <button onClick={() => handleDownload(sheet.name)}><FiDownload size={20} /></button>
                <button onClick={() => handleDelete(sheet.name)}><FiTrash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MySheetsPage;
