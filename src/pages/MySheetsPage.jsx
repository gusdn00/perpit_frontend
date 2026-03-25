import React, { useEffect, useState, useRef } from 'react';
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
  const hiddenOsmdRef = useRef(null);

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
    try {
      // 1. MusicXML 가져오기
      const res = await axiosInstance.get(
        `/create_sheets/mysheets/${downloadSheet.sid}/view`,
        { responseType: 'text' }
      );

      // 2. 라이브러리 동적 로드 (초기 번들 크기 절약)
      const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
      const { jsPDF } = await import('jspdf');
      const { default: svg2pdf } = await import('svg2pdf.js');

      // 3. 숨김 컨테이너에 OSMD 렌더링
      const container = hiddenOsmdRef.current;
      container.innerHTML = '';

      const osmd = new OpenSheetMusicDisplay(container, {
        autoResize: false,
        backend: 'svg',
      });
      await osmd.load(res.data);
      osmd.render();

      // 렌더링 완료 대기
      await new Promise(r => setTimeout(r, 300));

      // 4. SVG 요소 수집 (OSMD는 시스템별 SVG 생성)
      const svgElements = [...container.querySelectorAll('svg')];
      if (svgElements.length === 0) throw new Error('SVG 렌더링 실패');

      // 5. A4 기준으로 PDF 생성
      const A4_W = 595.28; // pt
      const A4_H = 841.89; // pt

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      for (let i = 0; i < svgElements.length; i++) {
        if (i > 0) pdf.addPage();
        const svg = svgElements[i];

        // SVG 실제 크기 계산 (여러 방법으로 폴백)
        const rect = svg.getBoundingClientRect();
        const vb = svg.viewBox?.baseVal;
        const svgW = (rect.width > 0 ? rect.width : null)
          ?? (vb?.width > 0 ? vb.width : null)
          ?? parseFloat(svg.getAttribute('width'))
          ?? 900;
        const svgH = (rect.height > 0 ? rect.height : null)
          ?? (vb?.height > 0 ? vb.height : null)
          ?? parseFloat(svg.getAttribute('height'))
          ?? 1200;

        // 여백 포함해서 A4에 맞춤
        const margin = 28; // pt (약 1cm)
        const drawW = A4_W - margin * 2;
        const scale = drawW / svgW;
        const drawH = svgH * scale;

        // 한 페이지에 들어오지 않으면 비율 유지하며 높이 제한
        const finalH = Math.min(drawH, A4_H - margin * 2);
        const finalW = finalH === A4_H - margin * 2
          ? (A4_H - margin * 2) / svgH * svgW
          : drawW;

        await svg2pdf(svg, pdf, { x: margin, y: margin, width: finalW, height: finalH });
      }

      pdf.save(`${downloadSheet.name || 'sheet'}.pdf`);
      setDownloadSheet(null);
    } catch (err) {
      console.error(err);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleRemixConfirm = async ({ purpose, style, difficulty }) => {
    setRemixLoading(true);
    try {
      const res = await axiosInstance.post(`/create_sheets/mysheets/${remixSheet.sid}/remix`, {
        purpose,
        style,
        difficulty,
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
      {/* 숨김 OSMD 렌더링 컨테이너 (PDF 생성용) */}
      <div
        ref={hiddenOsmdRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '900px',
          background: 'white',
          pointerEvents: 'none',
        }}
      />

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
