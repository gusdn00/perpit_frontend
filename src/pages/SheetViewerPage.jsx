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
  
  // 추가된 상태값
  const [tempo, setTempo] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

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
          // 1. OSMD 초기화
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            drawingParameters: "compacttight", // 공간 효율화
          });
          
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          // 2. 오디오 플레이어 초기화
          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          // 초기 설정 반영
          playerRef.current.playbackSpeed = tempo;
          
          osmdRef.current.cursor.show();
        }
      } catch (err) {
        console.error("Error loading sheet:", err);
        setError('악보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSheet();

    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
      if (osmdRef.current) {
        osmdRef.current.clear();
      }
    };
  }, []);

  // --- 제어 핸들러 ---

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

  // 속도 조절
  const handleTempoChange = (e) => {
    const newTempo = parseFloat(e.target.value);
    setTempo(newTempo);
    if (playerRef.current) {
      playerRef.current.playbackSpeed = newTempo;
    }
  };

  // 볼륨 조절
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // osmd-audio-player 버전에 따라 지원여부가 다를 수 있음
    if (playerRef.current) {
        // 내부 Web Audio API 컨텍스트의 게인 조절 혹은 라이브러리 지원 메소드 사용
        // 지원하지 않을 경우 playerRef.current.state.gain.gain.value 직접 조정이 필요할 수 있음
    }
  };

  // 처음으로 되돌리기
  const resetCursor = () => {
    if (osmdRef.current && playerRef.current) {
        playerRef.current.stop();
        osmdRef.current.cursor.reset();
        setIsPlaying(false);
    }
  };

  return (
    <div className="sheet-viewer-page">
      <div className="sheet-viewer-header">
        <h2>AI Sheet Music Player</h2>
        
        <div className="controls-container" style={controlsStyle}>
          {/* 재생 제어 */}
          <div className="button-group">
            <button onClick={togglePlay} disabled={loading} style={buttonStyle}>
              {isPlaying ? '⏸ 일시정지' : '▶️ 재생'}
            </button>
            <button onClick={stopPlay} disabled={loading} style={buttonStyle}>
              ⏹ 정지
            </button>
            <button onClick={resetCursor} disabled={loading} style={buttonStyle}>
              🔄 처음으로
            </button>
          </div>

          <hr style={{ margin: '15px 0', borderColor: '#eee' }} />

          {/* 속도 및 설정 제어 */}
          <div className="slider-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>속도</label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={tempo} 
                onChange={handleTempoChange} 
              />
              <span style={{ minWidth: '40px' }}>{tempo.toFixed(1)}x</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>볼륨</label>
              <input 
                type="range" 
                min="0" 
                max="1.0" 
                step="0.1" 
                value={volume} 
                onChange={handleVolumeChange} 
              />
              <span>{(volume * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>AI 악보 데이터를 생성하고 불러오는 중입니다...</p>}
      {error && <p className="sheet-error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <div className="sheet-viewer-container" style={{ marginTop: '20px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div ref={containerRef} />
      </div>
    </div>
  );
}

// 간단한 인라인 스타일 (CSS 파일에서 관리하는 것을 권장)
const controlsStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '20px',
  border: '1px solid #e9ecef'
};

const buttonStyle = {
  padding: '10px 18px',
  marginRight: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  borderRadius: '6px',
  border: '1px solid #dee2e6',
  backgroundColor: '#ffffff',
  transition: 'all 0.2s'
};

export default SheetViewerPage;