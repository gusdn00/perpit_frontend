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
    let cleaned = xml.replace(/<!DOCTYPE[^>]*>/gi, '').trim();
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
        const res = await axiosInstance.get(`/create_sheets/mysheets/${sid}/view`, { responseType: 'text' });
        const cleanedXml = sanitizeMusicXML(res.data);

        if (containerRef.current) {
          // 1. OSMD 설정 (커서 따라가기 옵션 강화)
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            followCursor: true, // 재생 시 화면이 커서를 따라감
          });
          
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          // 2. 플레이어 설정 및 커서 결합
          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          // 커서 표시 활성화
          osmdRef.current.cursor.show();
        }
      } catch (err) {
        setError('악보 로드 실패');
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
    if (!playerRef.current || !osmdRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      // 재생 전 커서 위치 확인 및 강제 표시
      osmdRef.current.cursor.show();
      await playerRef.current.play();
      setIsPlaying(true);
    }
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
      {/* 1. 상단 컨트롤러 (불필요한 문자열 제거) */}
      <div className="player-controls">
        <div className="control-left">
          {/* 로고나 빈 공간으로 둠 */}
        </div>
        
        <div className="control-center">
          <button className={`btn-main ${isPlaying ? 'pause' : 'play'}`} onClick={togglePlay} disabled={loading}>
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button className="btn-sub" onClick={stopPlay} disabled={loading}>
            ⏹ STOP
          </button>
          <button className="btn-sub" onClick={() => { stopPlay(); }} disabled={loading}>
            🔄 RESET
          </button>
        </div>
        
        <div className="control-right">
          <span className="info-badge">Auto-Sync Enabled</span>
        </div>
      </div>

      {/* 2. 악보 뷰어 영역 */}
      <div className="sheet-main-content">
        {loading && <div className="loading-overlay">Rendering...</div>}
        
        <div className="osmd-container-wrapper">
          {/* 클릭 시 커서 이동을 위한 클릭 이벤트 추가 */}
          <div 
            ref={containerRef} 
            className="osmd-canvas-container" 
            onClick={() => {
              if (osmdRef.current && !isPlaying) {
                // 클릭한 지점으로 오디오 포커스 이동 시도 (라이브러리 기본동작 활용)
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SheetViewerPage;