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
            followCursor: true, // 커서가 화면 밖으로 나가면 자동 스크롤
          });
          
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          // [핵심] 오디오 재생 지점에 맞춰 커서를 이동시키는 이벤트 리스너
          playerRef.current.on('iteration', (notes) => {
            if (osmdRef.current && osmdRef.current.cursor) {
              osmdRef.current.cursor.next(); // 오디오 신호에 맞춰 커서 한 칸 전진
            }
          });

          osmdRef.current.cursor.show();
        }
      } catch (err) {
        console.error(err);
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
      // 재생 시작 시 커서가 끝에 있다면 리셋
      if (osmdRef.current.cursor.iterator.EndReached) {
        osmdRef.current.cursor.reset();
      }
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
      <div className="player-controls">
        <div className="control-left"></div>
        <div className="control-center">
          <button className={`btn-main ${isPlaying ? 'pause' : 'play'}`} onClick={togglePlay} disabled={loading}>
            {isPlaying ? '⏸ 일시정지' : '▶ 재생하기'}
          </button>
          <button className="btn-sub" onClick={stopPlay} disabled={loading}>
            ⏹ 정지
          </button>
          <button className="btn-sub" onClick={() => { stopPlay(); }} disabled={loading}>
            🔄 처음으로
          </button>
        </div>
        <div className="control-right">
          <span className="info-badge">Auto-Syncing...</span>
        </div>
      </div>

      <div className="sheet-main-content">
        <div className="osmd-container-wrapper">
          <div ref={containerRef} className="osmd-canvas-container" />
        </div>
      </div>
    </div>
  );
}

export default SheetViewerPage;