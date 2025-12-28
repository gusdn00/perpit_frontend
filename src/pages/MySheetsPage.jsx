import React, { useEffect, useState } from 'react';
import { FiSearch, FiDownload, FiTrash2 } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa';
import axiosInstance from '../axiosInstance';
import '../styles/MySheetsPage.css';
import sampleSheet from '../assets/sample.png';

function MySheetsPage() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSid, setDeletingSid] = useState(null);

  /* =========================
     MySheets 불러오기
     ========================= */
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

  /* =========================
     View
     ========================= */
  const handleView = (link) => {
    localStorage.setItem('currentSheetUrl', link);
    window.open('/sheet-viewer', '_blank');
  };

  /* =========================
     Download
     ========================= */
  const handleDownload = (link) => {
    const a = document.createElement('a');
    a.href = link;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* =========================
     Delete (🔥 핵심)
     ========================= */
  const handleDelete = async (sid) => {
    const confirmed = window.confirm('이 악보를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setDeletingSid(sid);

      await axiosInstance.delete(
        `/create_sheets/mysheets/${sid}`
      );

      // ✅ Optimistic Update
      setSheets((prev) => prev.filter(sheet => sheet.sid !== sid));

      alert('악보가 삭제되었습니다.');
    } catch (err) {
      console.error(err);
      alert('악보 삭제에 실패했습니다.');
    } finally {
      setDeletingSid(null);
    }
  };

  /* =========================
     Play (임시)
     ========================= */
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

                  <button
                    onClick={() => handleDelete(sheet.sid)}
                    disabled={deletingSid === sheet.sid}
                    title="Delete"
                  >
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
