import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import '../styles/SheetViewerPage.css';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sheetUrl = localStorage.getItem('currentSheetUrl');

    if (!sheetUrl) {
      setError('악보 URL이 없습니다.');
      return;
    }

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: true,
      drawTitle: true,
      drawComposer: true,
      backend: 'svg',   // 👈 필수 (canvas보다 안정)
    });

    osmd
      .load(sheetUrl)
      .then(() => osmd.render())
      .catch((err) => {
        console.error(err);
        setError('악보를 불러오지 못했습니다.');
      });

    return () => {
      containerRef.current.innerHTML = '';
    };
  }, []);

  if (error) {
    return <div className="sheet-error">{error}</div>;
  }

  return (
    <div className="sheet-viewer-page">
      <div className="sheet-viewer-header">
        <h2>Sheet Preview</h2>
      </div>

      <div
        ref={containerRef}
        className="sheet-viewer-container"
      />
    </div>
  );
}

export default SheetViewerPage;
