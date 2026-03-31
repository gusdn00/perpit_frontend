import React, { useEffect, useState } from 'react';
import { FiSearch, FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/MySheetsPage.css';
import sampleSheet from '../assets/sample.png';
import DifficultySelectModal from './DifficultySelectModal';
import DownloadFormatModal from './DownloadFormatModal';

function MySheetsPage() {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSid, setDeletingSid] = useState(null);
  const [remixSheet, setRemixSheet] = useState(null);
  const [remixLoading, setRemixLoading] = useState(false);
  const [downloadSheet, setDownloadSheet] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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

  const handleView = (sid) => {
    localStorage.setItem('currentSheetSid', sid);
    window.open('/sheet-viewer', '_blank');
  };

  /* ── MusicXML 다운로드 ── */
  const handleDownloadXML = () => {
    if (!downloadSheet) return;
    const a = document.createElement('a');
    a.href = downloadSheet.link;
    a.download = `${downloadSheet.name || 'sheet'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSheet(null);
  };

  /* ── PDF 다운로드 ── */
  const handleDownloadPDF = async () => {
    if (!downloadSheet) return;
    setPdfLoading(true);

    const tempContainer = document.createElement('div');
    tempContainer.style.cssText =
      'position:fixed;top:0;left:-9999px;width:900px;background:white;pointer-events:none;';
    document.body.appendChild(tempContainer);

    try {
      // 1. MusicXML 가져오기
      const res = await axiosInstance.get(
        `/create_sheets/mysheets/${downloadSheet.sid}/view`,
        { responseType: 'text' }
      );

      // 2. 라이브러리 동적 로드
      const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // 3. OSMD를 A4 페이지 포맷으로 렌더링 → OSMD가 시스템 경계에서 직접 페이지 분할
      const osmd = new OpenSheetMusicDisplay(tempContainer, {
        autoResize: false,
        backend: 'svg',
        pageFormat: 'A4_P',
        pageBackgroundColor: '#FFFFFF',
      });
      await osmd.load(res.data);
      osmd.render();
      await new Promise(r => setTimeout(r, 800));

      // 4. OSMD가 생성한 페이지 요소 수집 (SVG 또는 div wrapper)
      //    pageFormat 사용 시 각 페이지가 별도 자식 요소로 렌더링됨
      const svgEls = Array.from(tempContainer.querySelectorAll(':scope > svg'));
      const pageEls = svgEls.length > 0
        ? svgEls
        : Array.from(tempContainer.children);

      if (pageEls.length === 0) throw new Error('렌더링된 페이지를 찾을 수 없습니다.');

      const A4_W = 595.28;
      const A4_H = 841.89;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // 5. 각 페이지를 개별 캡처 → PDF에 추가
      for (const [i, pageEl] of pageEls.entries()) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
        });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_W, A4_H);
      }

      pdf.save(`${downloadSheet.name || 'sheet'}.pdf`);
      setDownloadSheet(null);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      alert(`PDF 생성에 실패했습니다.\n\n오류: ${err.message}`);
    } finally {
      document.body.removeChild(tempContainer);
      setPdfLoading(false);
    }
  };

  const handleRemixConfirm = async ({ purpose, style, difficulty, instrument }) => {
    setRemixLoading(true);
    try {
      const res = await axiosInstance.post(`/create_sheets/mysheets/${remixSheet.sid}/remix`, {
        purpose,
        style,
        difficulty,
        instrument,
      });
      const jobId = res.data.jobId ?? res.data.job_id;
      setRemixSheet(null);
      navigate('/converting', { state: { job_id: jobId } });
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

      {downloadSheet && (
        <DownloadFormatModal
          sheet={downloadSheet}
          onXML={handleDownloadXML}
          onPDF={handleDownloadPDF}
          onClose={() => !pdfLoading && setDownloadSheet(null)}
          pdfLoading={pdfLoading}
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
                  <button onClick={() => setDownloadSheet(sheet)}><FiDownload size={20} /></button>
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
