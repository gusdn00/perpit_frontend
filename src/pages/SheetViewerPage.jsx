import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const viewUrl = localStorage.getItem('currentSheetViewUrl');
    if (!viewUrl) {
      setError('악보 URL이 없습니다.');
      return;
    }

    const iframe = iframeRef.current;

    iframe.onload = async () => {
      try {
        // iframe 안의 XML 문서 접근
        const xmlDoc = iframe.contentDocument;
        const xmlText = new XMLSerializer().serializeToString(xmlDoc);

        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          drawTitle: true,
        });

        await osmd.load(xmlText);
        osmd.render();
      } catch (e) {
        console.error(e);
        setError('악보 렌더링에 실패했습니다.');
      }
    };
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Sheet Preview</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 🔑 CORS 우회 핵심 */}
      <iframe
        ref={iframeRef}
        src={localStorage.getItem('currentSheetViewUrl')}
        style={{ display: 'none' }}
        title="xml-loader"
      />

      <div ref={containerRef} />
    </div>
  );
}

export default SheetViewerPage;
