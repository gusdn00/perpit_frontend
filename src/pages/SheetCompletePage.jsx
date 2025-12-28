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
        console.log(res.data)
        setSheetData(res.data);
        setLoading(false);

      } catch (err) {
        console.error(err);
        alert('악보 정보를 불러오지 못했습니다.');
        navigate('/');
      }
    };

    fetchSheetDetail();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const { title, result_url, created_at } = sheetData;

  return (
    <div className="sheet-complete-screen">
      <div className="sheet-complete-box">
        <h2 className="complete-title">
          Completion of sheet generation!
        </h2>

        <div className="sheet-content">
          <div
            className="sheet-images"
            onClick={() => window.open(result_url, '_blank')}
          >
            <div className="overlay">
              <FaPlayCircle size={50} className="play-icon" />
            </div>

            {/* 지금은 미리보기 이미지 없으므로 placeholder */}
            <div className="sheet-placeholder">
              Generated Sheet
            </div>
          </div>

          <div className="sheet-info">
            <p className="info-text">
              <b>{title}</b><br /><br />
              악보 생성이 완료되었습니다.<br />
              아래 버튼을 통해 악보를 확인하거나 다운로드할 수 있습니다.
            </p>

            <button
              className="btn download-btn"
              onClick={() => window.open(result_url, '_blank')}
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
                onClick={() => alert('내 악보 저장 기능은 추후 구현 예정입니다.')}
              >
                Add My Sheets
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
