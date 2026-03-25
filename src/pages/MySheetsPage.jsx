import React, { useEffect, useState } from 'react';
import { FiSearch, FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/MySheetsPage.css';
import sampleSheet from '../assets/sample.png';
import DifficultySelectModal from './DifficultySelectModal';

function MySheetsPage() {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSid, setDeletingSid] = useState(null);
  const [remixSheet, setRemixSheet] = useState(null);
  const [remixLoading, setRemixLoading] = useState(false);

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
      View (🔥 수정됨: sid 저장 후 새 탭 열기)
     ========================= */
  const handleView = (sid) => {
    // 뷰어 페이지에서 사용할 ID 저장
    localStorage.setItem('currentSheetSid', sid);
    // 새 탭에서 뷰어 페이지 호출
    window.open('/sheet-viewer', '_blank');
  };

  const handleDownload = (link) => {
    const a = document.createElement('a');
    a.href = link;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRemixConfirm = async ({ purpose, style, difficulty }) => {
    setRemixLoading(true);
    try {
      const res = await axiosInstance.post(`/create_sheets/mysheets/${remixSheet.sid}/remix`, {
        purpose,
        style,
        difficulty,
      });
      setRemixSheet(null);
      navigate('/converting', { state: { job_id: res.data.job_id } });
    } catch (err) {
      console.error(err);
      alert('재생성 요청에 실패했습니다.');
    } finally {
      setRemixLoading(false);
    }
  };

  const handleDelete = async (sid) => {
    const confirmed = window.confirm('이 악보를 삭제하시겠습니까?');
    if (!confirmed) return;
    try {
      setDeletingSid(sid);
      await axiosInstance.delete(`/create_sheets/mysheets/${sid}`);
      setSheets(prev => prev.filter(sheet => sheet.sid !== sid));
      alert('악보가 삭제되었습니다.');
    } catch (err) {
      console.error(err);
      alert('악보 삭제에 실패했습니다.');
    } finally {
      setDeletingSid(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="my-sheets-screen">
      {remixSheet && (
        <DifficultySelectModal
          sheet={remixSheet}
          onConfirm={handleRemixConfirm}
          onClose={() => setRemixSheet(null)}
          loading={remixLoading}
        />
      )}
      <div className="my-sheets-box">
        <h2 className="my-sheets-title">My Sheets</h2>
        {sheets.length === 0 ? (
          <p className="empty-text">저장된 악보가 없습니다.</p>
        ) : (
          <div className="sheet-list">
            {sheets.map(sheet => (
              <div key={sheet.sid} className="sheet-card">
                <div className="sheet-img-wrapper" onClick={() => handleView(sheet.sid)}>
                  <img src={sampleSheet} alt={sheet.name} className="sheet-card-img" />
                  <div className="overlay">
                    <FaPlayCircle size={40} className="play-icon" />
                  </div>
                </div>
                <p className="sheet-name">{sheet.name}</p>
                <div className="sheet-icons">
                  <button onClick={() => handleView(sheet.sid)}><FiSearch size={20} /></button>
                  <button onClick={() => handleDownload(sheet.link)}><FiDownload size={20} /></button>
                  <button onClick={() => setRemixSheet(sheet)} title="재생성"><FiRefreshCw size={20} /></button>
                  <button onClick={() => handleDelete(sheet.sid)} disabled={deletingSid === sheet.sid}>
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