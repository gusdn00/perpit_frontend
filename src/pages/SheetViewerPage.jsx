import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import axiosInstance from '../axiosInstance';
import '../styles/SheetViewerPage.css';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠 MusicXML 전처리 함수 (이미지에서 확인된 DOCTYPE 등 제거)
  const sanitizeMusicXML = (xml) => {
    if (!xml) return '';
    let cleaned = xml;
    // 1️⃣ DOCTYPE 제거
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
    // 2️⃣ 공백 제거
    cleaned = cleaned.trim();
    // 3️⃣ 빈 part-name 태그 보정
    cleaned = cleaned.replace(/<part-name\s*\/>/gi, '<part-name>Music</part-name>');
    return cleaned;
  };

  useEffect(() => {
    const sid = localStorage.getItem('currentSheetSid');

    if (!sid) {
      setError('악보 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const loadSheet = async () => {
      try {
        // ✅ API 호출: 명세서대로 sid를 경로에 포함
        const res = await axiosInstance.get(
          `/create_sheets/mysheets/${sid}/view`,
          { responseType: 'text' } // XML 문자열 그대로 수신
        );

        const cleanedXml = sanitizeMusicXML(res.data);

        if (containerRef.current) {
          // OSMD 인스턴스 초기화
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            drawingParameters: 'default',
          });

          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();
        }
      } catch (err) {
        console.error('OSMD Render Error:', err);
        setError('악보를 불러오거나 렌더링하는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSheet();

    // 페이지를 나갈 때 메모리 정리
    return () => {
      if (osmdRef.current) {
        osmdRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="sheet-viewer-page">
      <div className="sheet-viewer-header">
        <h2>MusicXML Preview</h2>
        {loading && <p>악보를 불러오는 중입니다...</p>}
      </div>

      {error ? (
        <div className="sheet-error">
          <p>{error}</p>
          <button onClick={() => window.close()}>창 닫기</button>
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