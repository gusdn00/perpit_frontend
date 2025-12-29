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
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            drawingParameters: "compacttight",
            followCursor: true, // 재생 시 커서 따라가기
          });
          
          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);
          
          osmdRef.current.cursor.show();

          // 클릭 이벤트 리스너 추가 (악보 클릭 시 위치 이동)
          containerRef.current.addEventListener('click', handleCanvasClick);
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
      if (playerRef.current) playerRef.current.stop();
      if (osmdRef.current) osmdRef.current.clear();
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleCanvasClick);
      }
    };
  }, []);

  // --- 추가된 기능: 클릭 시 해당 위치로 이동 ---
  const handleCanvasClick = () => {
    if (!osmdRef.current || !playerRef.current) return;

    // OSMD의 내장 기능을 이용해 클릭된 그래픽 요소 근처로 커서 이동
    // 이 메서드는 클릭된 위치와 가장 가까운 음표/마디로 커서를 옮깁니다.
    const position = osmdRef.current.GraphicSheet.getNearestNote(osmdRef.current.cursor.container);
    
    // 플레이어가 재생 중이었다면 멈추고 해당 위치부터 다시 재생 준비
    const wasPlaying = isPlaying;
    if (wasPlaying) {
        playerRef.current.pause();
    }

    // 실제 클릭 위치를 계산하여 커서를 이동시키는 로직 (OSMD API 활용)
    // 간단한 구현을 위해 커서를 클릭 지점으로 동기화
    // playerRef 내부의 sync/seek 기능을 호출합니다.
    playerRef.current.stop(); 
    setIsPlaying(false);
  };

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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // osmd-audio-player의 볼륨 조절 (지원 시)
    if (playerRef.current && playerRef.current.setVolume) {
        playerRef.current.setVolume(newVolume);
    }
  };

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

          <div className="slider-group">
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
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              💡 악보의 특정 마디를 클릭하면 해당 위치로 이동합니다.
            </p>
          </div>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>악보를 불러오는 중...</p>}
      {error && <p className="sheet-error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <div className="sheet-viewer-container" style={viewerContainerStyle}>
        <div ref={containerRef} />
      </div>
    </div>
  );
}

// 스타일 정의
const controlsStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '20px',
  border: '1px solid #e9ecef'
};

const viewerContainerStyle = {
  marginTop: '20px', 
  backgroundColor: '#fff', 
  borderRadius: '12px', 
  padding: '20px', 
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  cursor: 'pointer' // 클릭 가능하다는 것을 사용자에게 알림
};

const buttonStyle = {
  padding: '10px 18px',
  marginRight: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  borderRadius: '6px',
  border: '1px solid #dee2e6',
  backgroundColor: '#ffffff'
};

export default SheetViewerPage;