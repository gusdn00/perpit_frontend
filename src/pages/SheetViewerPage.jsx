import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import axiosInstance from '../axiosInstance';
import '../styles/SheetViewerPage.css'; // 제공해주신 CSS 연결

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // XML 보정 함수
  const sanitizeMusicXML = (xml) => {
    let cleaned = xml;
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/<part-name\s*\/>/gi, '<part-name>Music</part-name>');
    return cleaned;
  };

  useEffect(() => {
    const sid = localStorage.getItem('currentSheetSid');

    if (!sid) {
      setError('악보 ID를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const loadSheet = async () => {
      try {
        const res = await axiosInstance.get(
          `/create_sheets/mysheets/${sid}/view`,
          { responseType: 'text' } // XML 문자열로 받기
        );

        let rawXml = res.data;
        if (!rawXml || typeof rawXml !== 'string') {
          throw new Error('유효하지 않은 XML 형식입니다.');
        }

        const cleanedXml = sanitizeMusicXML(rawXml);

        // OSMD 인스턴스 초기화 (한 번만)
        if (!osmdRef.current && containerRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            drawingParameters: 'default',
            // 여기에 원하는 옵션 추가 (예: coloring 등)
          });
        }

        await osmdRef.current.load(cleanedXml);
        osmdRef.current.render();
        
      } catch (err) {
        console.error('OSMD Error:', err);
        setError('악보를 화면에 그리는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSheet();

    // Cleanup: 페이지 나갈 때 메모리 정리
    return () => {
      if (osmdRef.current) {
        osmdRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="sheet-viewer-page">
      <div className="sheet-viewer-header">
        <h2>Sheet Music Preview</h2>
        {loading && <p>악보 데이터를 분석 중입니다...</p>}
      </div>

      {error ? (
        <div className="sheet-error">
          <p>{error}</p>
          <button onClick={() => window.close()}>닫기</button>
        </div>
      ) : (
        <div className="sheet-viewer-container">
          <div ref={containerRef} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default SheetViewerPage;