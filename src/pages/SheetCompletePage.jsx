import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/SheetCompletePage.css';
import { FaPlayCircle } from 'react-icons/fa';

function SheetCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { job_id } = state || {};

  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     악보 상세 조회
     ========================= */
  useEffect(() => {
    if (!job_id) {
      navigate('/');
      return;
    }

    const fetchSheetDetail = async () => {
      try {
        const res = await axiosInstance.get(
          `/create_sheets/${job_id}`
        );
        setSheetData(res.data);
      } catch (err) {
        console.error(err);
        alert('악보 정보를 불러오지 못했습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSheetDetail();
  }, [job_id, navigate]);

  /* =========================
     Add My Sheets
     ========================= */
  const handleAddMySheet = async () => {
    if (saving) return;

    try {
      setSaving(true);

      await axiosInstance.post(
        `/create_sheets/${job_id}/add`
      );

      alert('내 악보에 저장되었습니다!');
    } catch (err) {
      console.error(err);
      alert('내 악보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Download (XML)
     ========================= */
  const handleDownload = () => {
    if (!sheetData?.result_url) return;

    const link = document.createElement('a');
    link.href = sheetData.result_url;
    link.download = `${sheetData.title || 'sheet'}.musicxml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const { title, result_url } = sheetData;

  return (
    <div className="sheet-complete-screen">
      <div className="sheet-complete-box">
        <h2 className="complete-title">
          Completion of sheet generation!
        </h2>

        <div className="sheet-content">
          {/* 미리보기 / View */}
          <div
            className="sheet-images"
            onClick={() => window.open(result_url, '_blank')}
          >
            <div className="overlay">
              <FaPlayCircle size={50} className="play-icon" />
            </div>

            <div className="sheet-placeholder">
              Generated Sheet
            </div>
          </div>

          {/* 정보 & 버튼 */}
          <div className="sheet-info">
            <p className="info-text">
              <b>제목 : {title}</b><br /><br />
              악보 생성이 완료되었습니다.<br />
              다운로드하거나 내 악보에 저장할 수 있습니다.
            </p>

            <button
              className="btn download-btn"
              onClick={handleDownload}
            >
              Download
            </button>

            <div className="btn-group">
              <button
                className="btn sub-btn"
                onClick={() => window.open(result_url, '_blank')}
              >
                View
              </button>

              <button
                className="btn sub-btn"
                disabled={saving}
                onClick={handleAddMySheet}
              >
                {saving ? 'Saving...' : 'Add My Sheets'}
              </button>
            </div>
          </div>
        </div>

        <button
          className="go-main-btn"
          onClick={() => navigate('/')}
        >
          Go Main
        </button>
      </div>
    </div>
  );
}

export default SheetCompletePage;
