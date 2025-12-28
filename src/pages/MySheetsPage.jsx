// import React from 'react';
// import { FiSearch, FiDownload, FiTrash2 } from 'react-icons/fi';
// import { FaPlayCircle } from 'react-icons/fa'; // 재생 아이콘 추가
// import '../styles/MySheetsPage.css';
// import sampleSheet from '../assets/sample.png';

// const dummySheets = [
//   { id: 1, name: 'Sheet 1' },
//   { id: 2, name: 'Sheet 2' },
//   { id: 3, name: 'Sheet 3' },
//   { id: 4, name: 'Sheet 4' },
//   { id: 5, name: 'Sheet 5' },
// ];

// function MySheetsPage() {
//   const handleView = (name) => {
//     alert(`${name} 보기`);
//   };

//   const handleDownload = (name) => {
//     alert(`${name} 다운로드`);
//   };

//   const handleDelete = (name) => {
//     alert(`${name} 삭제`);
//   };

//   const handlePlay = (name) => {
//     alert(`${name} 음악 재생 (UI만 구현됨)`);
//   };

//   return (
//     <div className="my-sheets-screen">
//       <div className="my-sheets-box">
//         <h2 className="my-sheets-title">My Sheets</h2>

//         <div className="sheet-list">
//           {dummySheets.map(sheet => (
//             <div key={sheet.id} className="sheet-card">
//               <div className="sheet-img-wrapper" onClick={() => handlePlay(sheet.name)}>
//                 <img src={sampleSheet} alt={sheet.name} className="sheet-card-img" />
//                 <div className="overlay">
//                   <FaPlayCircle size={40} className="play-icon" />
//                 </div>
//               </div>
//               <p className="sheet-name">{sheet.name}</p>
//               <div className="sheet-icons">
//                 <button onClick={() => handleView(sheet.name)}><FiSearch size={20} /></button>
//                 <button onClick={() => handleDownload(sheet.name)}><FiDownload size={20} /></button>
//                 <button onClick={() => handleDelete(sheet.name)}><FiTrash2 size={20} /></button>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default MySheetsPage;

import React, { useEffect, useState } from 'react';
import { FiSearch, FiDownload, FiTrash2 } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa';
import axiosInstance from '../axiosInstance';
import '../styles/MySheetsPage.css';
import sampleSheet from '../assets/sample.png';

function MySheetsPage() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 MySheets 불러오기
  useEffect(() => {
    const fetchMySheets = async () => {
      try {
        const res = await axiosInstance.get('/create_sheets/mysheets');
        setSheets(res.data.data);
      } catch (err) {
        console.error(err);
        alert('내 악보 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMySheets();
  }, []);

  const handleView = (link) => {
    window.open(link, '_blank');
  };

  const handleDownload = (link) => {
    const a = document.createElement('a');
    a.href = link;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = (sid) => {
    // ❗ 추후 DELETE API 연결
    alert(`Sheet ID ${sid} 삭제 (API 연동 예정)`);
  };

  const handlePlay = (link) => {
    window.open(link, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-sheets-screen">
      <div className="my-sheets-box">
        <h2 className="my-sheets-title">My Sheets</h2>

        {sheets.length === 0 ? (
          <p className="empty-text">저장된 악보가 없습니다.</p>
        ) : (
          <div className="sheet-list">
            {sheets.map((sheet) => (
              <div key={sheet.sid} className="sheet-card">
                <div
                  className="sheet-img-wrapper"
                  onClick={() => handlePlay(sheet.link)}
                >
                  <img
                    src={sampleSheet}
                    alt={sheet.name}
                    className="sheet-card-img"
                  />
                  <div className="overlay">
                    <FaPlayCircle size={40} className="play-icon" />
                  </div>
                </div>

                <p className="sheet-name">{sheet.name}</p>

                <div className="sheet-icons">
                  <button onClick={() => handleView(sheet.link)}>
                    <FiSearch size={20} />
                  </button>
                  <button onClick={() => handleDownload(sheet.link)}>
                    <FiDownload size={20} />
                  </button>
                  <button onClick={() => handleDelete(sheet.sid)}>
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MySheetsPage;

