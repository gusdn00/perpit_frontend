import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import '../styles/SheetViewerPage.css';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const viewUrl = localStorage.getItem('currentSheetUrl');

    if (!viewUrl) {
      setError('악보 링크가 없습니다.');
      setLoading(false);
      return;
    }

    const loadSheet = async () => {
      try {
        // 🔥 핵심: XML 직접 fetch
        const res = await fetch(viewUrl);
        if (!res.ok) {
          throw new Error('악보 파일을 불러오지 못했습니다.');
        }

        const xmlText = await res.text();

        // OSMD 인스턴스 생성
        osmdRef.current = new OpenSheetMusicDisplay(
          containerRef.current,
          {
            autoResize: true,
            drawTitle: true,
            backend: 'svg',
          }
        );

        // 🔥 XML 문자열을 로드
        await osmdRef.current.load(xmlText);
        osmdRef.current.render();

      } catch (err) {
        console.error(err);
        setError('악보를 렌더링하는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSheet();
  }, []);

  if (loading) {
    return <div className="sheet-viewer-loading">Loading sheet...</div>;
  }

  if (error) {
    return <div className="sheet-viewer-error">{error}</div>;
  }

  return (
    <div className="sheet-viewer-page">
      <h2 className="viewer-title">Sheet Preview</h2>
      <div
        ref={containerRef}
        className="sheet-viewer-container"
      />
    </div>
  );
}

export default SheetViewerPage;
