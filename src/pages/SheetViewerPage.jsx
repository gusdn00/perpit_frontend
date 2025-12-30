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
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            // 1. 자유로운 스크롤을 위해 followCursor를 false로 설정합니다.
            followCursor: false, 
            drawingParameters: "default",
          });
          
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          playerRef.current.on('iteration', () => {
            if (osmdRef.current && osmdRef.current.cursor) {
              osmdRef.current.cursor.next();
            }
          });

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
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      if (osmdRef.current.cursor.iterator.EndReached) osmdRef.current.cursor.reset();
      await playerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="sheet-viewer-page">
      <div className="player-controls">
        <div className="control-left"></div>
        <div className="control-center">
          <button className={`btn-main ${isPlaying ? 'pause' : 'play'}`} onClick={togglePlay} disabled={loading}>
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button className="btn-sub" onClick={() => { playerRef.current.stop(); osmdRef.current.cursor.reset(); setIsPlaying(false); }}>
            ⏹ STOP
          </button>
        </div>
        <div className="control-right">
          <span className="info-badge">Free Scrolling Mode</span>
        </div>
      </div>

      <div className="sheet-main-content">
        {/* 2. 하얀 배경(wrapper)이 악보 길이에 맞춰 유동적으로 늘어나도록 설정 */}
        <div className="osmd-container-wrapper">
          <div ref={containerRef} className="osmd-canvas-container" />
        </div>
      </div>
    </div>
  );
}

export default SheetViewerPage;