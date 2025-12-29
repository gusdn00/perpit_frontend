import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import axiosInstance from '../axiosInstance';
import '../styles/SheetViewerPage.css';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const playerRef = useRef(null);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const sanitizeMusicXML = (xml) => {
    if (!xml) return '';
    let cleaned = xml;
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
    cleaned = cleaned.trim();
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
        const res = await axiosInstance.get(`/create_sheets/mysheets/${sid}/view`, { 
          responseType: 'text' 
        });

        const cleanedXml = sanitizeMusicXML(res.data);

        if (containerRef.current) {
          // OSMD 초기화 (설정 최적화)
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            drawingParameters: "default",
            followCursor: true,
          });
          
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          osmdRef.current.cursor.show();

          // 악보 클릭 이벤트
          containerRef.current.onclick = () => {
             if(playerRef.current) {
               // 클릭 시점의 커서 위치로 오디오 동기화 시도
               playerRef.current.stop();
               setIsPlaying(false);
             }
          };
        }
      } catch (err) {
        console.error("Load Error:", err);
        setError('악보를 로드하는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSheet();

    return () => {
      if (playerRef.current) playerRef.current.stop();
      if (osmdRef.current) osmdRef.current.clear();
    };
  }, []);

  const togglePlay = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      await playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlay = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      osmdRef.current.cursor.reset();
      setIsPlaying(false);
    }
  };

  return (
    <div className="sheet-viewer-page">
      {/* 상단 컨트롤 바 */}
      <div className="player-controls">
        <div className="control-left">
          <h2 className="sheet-title">AI Sheet Music</h2>
        </div>
        
        <div className="control-center">
          <button className={`btn-main ${isPlaying ? 'pause' : 'play'}`} onClick={togglePlay} disabled={loading}>
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button className="btn-sub" onClick={stopPlay} disabled={loading}>
            ⏹ STOP
          </button>
          <button className="btn-sub" onClick={() => { stopPlay(); osmdRef.current.cursor.reset(); }} disabled={loading}>
            🔄 RESET
          </button>
        </div>
        
        <div className="control-right">
          <span className="info-badge">Click Note to Jump</span>
        </div>
      </div>

      {/* 메인 뷰어 영역 */}
      <div className="sheet-main-content">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>악보를 렌더링 중입니다...</p>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        
        <div className="osmd-container-wrapper">
          <div ref={containerRef} className="osmd-canvas-container" />
        </div>
      </div>
    </div>
  );
}

export default SheetViewerPage;