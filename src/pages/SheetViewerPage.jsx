import React, { useEffect, useRef, useState } from 'react';
import '../styles/SheetViewerPage.css';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sheetUrl = localStorage.getItem('currentSheetUrl');

    if (!sheetUrl) {
      setError('악보 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    let osmd = null;
    let cancelled = false;

    const loadSheet = async () => {
      try {
        // 🔥 Lazy Import (빌드 안정화 핵심)
        const mod = await import('opensheetmusicdisplay');
        const OpenSheetMusicDisplay = mod.OpenSheetMusicDisplay;

        if (cancelled || !containerRef.current) return;

        osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',       // canvas보다 안정적
          drawTitle: true,
          drawComposer: true,
        });

        await osmd.load(sheetUrl);
        if (cancelled) return;

        osmd.render();
      } catch (err) {
        console.error(err);
        setError('악보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSheet();

    return () => {
      cancelled = true;
      if (osmd) {
        try {
          osmd.clear();
        } catch (e) {
          // noop
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="sheet-viewer-loading">
        Loading sheet…
      </div>
    );
  }

  if (error) {
    return (
      <div className="sheet-viewer-error">
        {error}
      </div>
    );
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
