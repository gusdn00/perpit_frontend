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

  /* ── SVG 크기 추출 헬퍼 ── */
  const getSvgSize = (svg) => {
    const rect = svg.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return { w: rect.width, h: rect.height };
    const vb = svg.viewBox?.baseVal;
    if (vb?.width > 0 && vb?.height > 0) return { w: vb.width, h: vb.height };
    const w = parseFloat(svg.getAttribute('width'));
    const h = parseFloat(svg.getAttribute('height'));
    if (w > 0 && h > 0) return { w, h };
    return { w: 900, h: 1200 };
  };

  /* ── PDF 다운로드 ── */
  const handleDownloadPDF = async () => {
    if (!downloadSheet) return;
    setPdfLoading(true);

    // body에 직접 붙이는 임시 컨테이너 (getBoundingClientRect가 정상 동작)
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText =
      'position:fixed;top:0;left:0;width:900px;background:white;opacity:0;pointer-events:none;z-index:-9999;';
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
      const { default: svg2pdf } = await import('svg2pdf.js');

      // 3. OSMD 렌더링
      const osmd = new OpenSheetMusicDisplay(tempContainer, {
        autoResize: false,
        backend: 'svg',
      });
      await osmd.load(res.data);
      osmd.render();

      // 렌더링 완료 대기
      await new Promise(r => setTimeout(r, 500));

      // 4. SVG 수집
      const svgElements = [...tempContainer.querySelectorAll('svg')];
      if (svgElements.length === 0) throw new Error('SVG를 찾을 수 없습니다 (OSMD 렌더링 실패)');

      // 5. PDF 생성 (A4, 여백 28pt)
      const A4_W = 595.28;
      const A4_H = 841.89;
      const margin = 28;
      const drawW = A4_W - margin * 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      for (let i = 0; i < svgElements.length; i++) {
        if (i > 0) pdf.addPage();
        const svg = svgElements[i];
        const { w: svgW, h: svgH } = getSvgSize(svg);
        const scale = drawW / svgW;
        const drawH = Math.min(svgH * scale, A4_H - margin * 2);

        await svg2pdf(svg, pdf, { x: margin, y: margin, width: drawW, height: drawH });
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
