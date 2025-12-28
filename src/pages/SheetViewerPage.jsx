import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player'; // 👈 오디오 플레이어 추가
import axiosInstance from '../axiosInstance';
import '../styles/SheetViewerPage.css';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const playerRef = useRef(null); // 👈 플레이어 객체 저장용
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false); // 👈 재생 상태

  const sanitizeMusicXML = (xml) => {
    if (!xml) return '';
    let cleaned = xml;
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, ''); //
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/<part-name\s*\/>/gi, '<part-name>Music</part-name>'); //
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
        }); //

        const cleanedXml = sanitizeMusicXML(res.data);

        if (containerRef.current) {
          // 1. OSMD 렌더링
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
          });
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          // 2. 오디오 플레이어 초기화
          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          // 3. 커서 설정 (재생 시 악보를 따라감)
          osmdRef.current.cursor.show();
        }
      } catch (err) {
        console.error(err);
        setError('렌더링 또는 오디오 로드 실패');
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

  // 재생 / 일시정지 핸들러
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
      setIsPlaying(false);
    }
  };

  return (
    <div className="sheet-viewer-page">
      <div className="sheet-viewer-header">
        <h2>MusicXML Player</h2>
        {/* 재생 컨트롤러 UI 추가 */}
        <div style={{ margin: '10px 0' }}>
          <button onClick={togglePlay} disabled={loading} style={buttonStyle}>
            {isPlaying ? '⏸ 일시정지' : '▶️ 재생'}
          </button>
          <button onClick={stopPlay} disabled={loading} style={buttonStyle}>
            Stop
          </button>
        </div>
      </div>

      {loading && <p>데이터 로딩 중...</p>}
      {error && <p className="sheet-error">{error}</p>}
      
      <div className="sheet-viewer-container">
        <div ref={containerRef} />
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  marginRight: '10px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '8px',
  border: '1px solid #ccc'
};

export default SheetViewerPage;