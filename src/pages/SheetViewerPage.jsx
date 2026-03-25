import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import '../styles/SheetViewerPage.css';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const playerRef = useRef(null);
  const baseBpmRef = useRef(120);
  const autoScrollRef = useRef(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  const [totalMeasures, setTotalMeasures] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);

  const sanitizeMusicXML = (xml) => {
    if (!xml) return '';
    let cleaned = xml.replace(/<!DOCTYPE[^>]*>/gi, '').trim();
    cleaned = cleaned.replace(/<part-name\s*\/>/gi, '<part-name>Music</part-name>');
    return cleaned;
  };

  useEffect(() => {
    const sid = localStorage.getItem('currentSheetSid');
    const viewUrl = localStorage.getItem('currentSheetViewUrl');

    if (!sid && !viewUrl) {
      setError('악보 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const loadSheet = async () => {
      try {
        let xmlText;
        if (sid) {
          const res = await axiosInstance.get(`/create_sheets/mysheets/${sid}/view`, { responseType: 'text' });
          xmlText = res.data;
        } else {
          const res = await axios.get(viewUrl, { responseType: 'text' });
          xmlText = res.data;
        }

        const cleanedXml = sanitizeMusicXML(xmlText);

        if (containerRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            followCursor: false,
            drawingParameters: 'default',
          });

          await osmdRef.current.load(cleanedXml);
          osmdRef.current.render();

          const total = osmdRef.current.Sheet?.SourceMeasures?.length ?? 0;
          setTotalMeasures(total);

          playerRef.current = new AudioPlayer();
          await playerRef.current.loadScore(osmdRef.current);

          baseBpmRef.current = playerRef.current.playbackSettings?.bpm ?? 120;

          playerRef.current.on('iteration', () => {
            if (!osmdRef.current?.cursor) return;
            osmdRef.current.cursor.next();

            const iter = osmdRef.current.cursor.Iterator ?? osmdRef.current.cursor.iterator;
            const measureIdx = iter?.CurrentMeasureIndex ?? iter?.currentMeasureIndex ?? 0;
            setCurrentMeasure(measureIdx + 1);

            if (autoScrollRef.current) {
              const cursorEl = osmdRef.current.cursor.cursorElement;
              if (cursorEl) cursorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });

          playerRef.current.on('state-change', (state) => {
            if (state === 'STOPPED') {
              setIsPlaying(false);
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

  const handleSpeedChange = (multiplier) => {
    setSpeed(multiplier);
    if (playerRef.current) {
      playerRef.current.setBpm(Math.round(baseBpmRef.current * multiplier));
    }
  };

  const toggleAutoScroll = () => {
    const next = !autoScroll;
    autoScrollRef.current = next;
    setAutoScroll(next);
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      const iter = osmdRef.current.cursor.Iterator ?? osmdRef.current.cursor.iterator;
      if (iter?.EndReached) {
        osmdRef.current.cursor.reset();
        setCurrentMeasure(0);
      }
      await playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    playerRef.current?.stop();
    osmdRef.current?.cursor.reset();
    setIsPlaying(false);
    setCurrentMeasure(0);
  };

  const progress = totalMeasures > 0 ? Math.min((currentMeasure / totalMeasures) * 100, 100) : 0;

  if (error) {
    return <div className="sheet-viewer-error">{error}</div>;
  }

  return (
    <div className="sheet-viewer-page">
      <div className="player-controls">
        <div className="control-left">
          <div className="speed-control">
            <span className="speed-label">속도</span>
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                className={`speed-btn ${speed === s ? 'active' : ''}`}
                onClick={() => handleSpeedChange(s)}
                disabled={loading}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="control-center">
          <button
            className={`btn-main ${isPlaying ? 'pause' : 'play'}`}
            onClick={togglePlay}
            disabled={loading}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button className="btn-sub" onClick={handleStop} disabled={loading}>
            ⏹ STOP
          </button>
        </div>

        <div className="control-right">
          <button
            className={`scroll-toggle-btn ${autoScroll ? 'active' : ''}`}
            onClick={toggleAutoScroll}
          >
            {autoScroll ? '🔒 Auto Scroll' : '🖱 Free Scroll'}
          </button>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {totalMeasures > 0 && (
          <span className="progress-label">{currentMeasure} / {totalMeasures} 마디</span>
        )}
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
