import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import '../styles/SheetViewerPage.css';

/* ── 계이름 변환 맵 ── */
const STEP_TO_SOLFEGE = { C: '도', D: '레', E: '미', F: '파', G: '솔', A: '라', B: '시' };

/* ── MusicXML에 계이름 가사 삽입 ── */
function injectSolfege(xmlText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    doc.querySelectorAll('note').forEach(note => {
      if (note.querySelector('rest')) return;
      if (note.querySelector('lyric')) return;
      const pitch = note.querySelector('pitch');
      if (!pitch) return;

      const step = pitch.querySelector('step')?.textContent;
      if (!step || !STEP_TO_SOLFEGE[step]) return;

      let syllable = STEP_TO_SOLFEGE[step];
      const alter = parseFloat(pitch.querySelector('alter')?.textContent ?? '0');
      if (alter > 0) syllable += '#';
      else if (alter < 0) syllable += '♭';

      const lyric = doc.createElement('lyric');
      lyric.setAttribute('number', '1');
      const syllabic = doc.createElement('syllabic');
      syllabic.textContent = 'single';
      const text = doc.createElement('text');
      text.textContent = syllable;
      lyric.appendChild(syllabic);
      lyric.appendChild(text);
      note.appendChild(lyric);
    });

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return xmlText;
  }
}

/* ── XML 전처리 ── */
function sanitizeMusicXML(xml) {
  if (!xml) return '';
  return xml
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim()
    .replace(/<part-name\s*\/>/gi, '<part-name>Music</part-name>');
}

/* ════════════════════════════════ */
function SheetViewerPage() {
  const containerRef    = useRef(null);
  const osmdRef         = useRef(null);
  const playerRef       = useRef(null);
  const originalXmlRef  = useRef(null);
  const bpmRef          = useRef(120);
  const autoScrollRef   = useRef(false);
  const metronomeCtxRef = useRef(null);
  const metronomeIdRef  = useRef(null);
  const firstIterRef    = useRef(true);

  const [loading,        setLoading]        = useState(true);
  const [reloading,      setReloading]      = useState(false);
  const [error,          setError]          = useState(null);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [bpm,            setBpm]            = useState(120);
  const [metronomeOn,    setMetronomeOn]    = useState(false);
  const [solfegeOn,      setSolfegeOn]      = useState(false);
  const [autoScroll,     setAutoScroll]     = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  const [totalMeasures,  setTotalMeasures]  = useState(0);

  /* ── OSMD + Player 초기화 (재사용 가능) ── */
  const setupOSMD = async (xmlText, keepBpm = false) => {
    if (!containerRef.current) return;

    playerRef.current?.stop();
    osmdRef.current?.clear();

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: true,
      drawTitle: true,
      followCursor: false,
      drawingParameters: 'default',
    });
    osmdRef.current = osmd;

    await osmd.load(xmlText);
    osmd.render();

    setTotalMeasures(osmd.Sheet?.SourceMeasures?.length ?? 0);

    const player = new AudioPlayer();
    playerRef.current = player;
    await player.loadScore(osmd);

    const scoreBpm = player.playbackSettings?.bpm ?? 120;
    if (!keepBpm) {
      bpmRef.current = scoreBpm;
      setBpm(scoreBpm);
    } else {
      player.setBpm(bpmRef.current);
    }

    firstIterRef.current = true;

    player.on('iteration', () => {
      if (!osmd.cursor) return;
      if (firstIterRef.current) {
        firstIterRef.current = false;
      } else {
        osmd.cursor.next();
      }
      const iter = osmd.cursor.Iterator ?? osmd.cursor.iterator;
      const idx = iter?.CurrentMeasureIndex ?? iter?.currentMeasureIndex ?? 0;
      setCurrentMeasure(idx + 1);
      if (autoScrollRef.current) {
        osmd.cursor.cursorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    player.on('state-change', (state) => {
      if (state === 'STOPPED') setIsPlaying(false);
    });

    osmd.cursor.show();
    setIsPlaying(false);
    setCurrentMeasure(0);
  };

  /* ── 최초 로드 ── */
  useEffect(() => {
    const sid     = localStorage.getItem('currentSheetSid');
    const viewUrl = localStorage.getItem('currentSheetViewUrl');

    if (!sid && !viewUrl) {
      setError('악보 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = sid
          ? await axiosInstance.get(`/create_sheets/mysheets/${sid}/view`, { responseType: 'text' })
          : await axios.get(viewUrl, { responseType: 'text' });

        const cleanedXml = sanitizeMusicXML(res.data);
        originalXmlRef.current = cleanedXml;
        await setupOSMD(cleanedXml);
      } catch (err) {
        console.error(err);
        setError('악보 로드 실패');
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      stopMetronome();
      playerRef.current?.stop();
      osmdRef.current?.clear();
    };
  }, []);

  /* ════ 메트로놈 ════ */
  const tick = (ctx) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  };

  const startMetronome = (bpmVal) => {
    stopMetronome();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    metronomeCtxRef.current = ctx;
    tick(ctx);
    metronomeIdRef.current = setInterval(() => tick(ctx), Math.round((60 / bpmVal) * 1000));
  };

  const stopMetronome = () => {
    clearInterval(metronomeIdRef.current);
    metronomeIdRef.current = null;
    metronomeCtxRef.current?.close();
    metronomeCtxRef.current = null;
  };

  const toggleMetronome = () => {
    if (metronomeOn) {
      stopMetronome();
      setMetronomeOn(false);
    } else {
      startMetronome(bpmRef.current);
      setMetronomeOn(true);
    }
  };

  /* ════ BPM ════ */
  const handleBpmChange = (val) => {
    const newBpm = Math.max(50, Math.min(200, val));
    bpmRef.current = newBpm;
    setBpm(newBpm);
    playerRef.current?.setBpm(newBpm);
    if (metronomeOn) startMetronome(newBpm);
  };

  /* ════ 계이름 ════ */
  const toggleSolfege = async () => {
    if (!originalXmlRef.current) return;
    setReloading(true);
    playerRef.current?.stop();
    try {
      const next = !solfegeOn;
      const xml = next ? injectSolfege(originalXmlRef.current) : originalXmlRef.current;
      await setupOSMD(xml, true);
      setSolfegeOn(next);
    } finally {
      setReloading(false);
    }
  };

  /* ════ 자동 스크롤 ════ */
  const toggleAutoScroll = () => {
    const next = !autoScroll;
    autoScrollRef.current = next;
    setAutoScroll(next);
  };

  /* ════ 재생 제어 ════ */
  const togglePlay = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      const iter = osmdRef.current.cursor.Iterator ?? osmdRef.current.cursor.iterator;
      if (iter?.EndReached) {
        osmdRef.current.cursor.reset();
        firstIterRef.current = true;
        setCurrentMeasure(0);
      }
      await playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    playerRef.current?.stop();
    osmdRef.current?.cursor.reset();
    firstIterRef.current = true;
    setIsPlaying(false);
    setCurrentMeasure(0);
  };

  const progress = totalMeasures > 0 ? Math.min((currentMeasure / totalMeasures) * 100, 100) : 0;
  const disabled = loading || reloading;

  if (error) return <div className="sheet-viewer-error">{error}</div>;

  return (
    <div className="sheet-viewer-page">

      {/* ── 컨트롤 바 ── */}
      <div className="player-controls">

        {/* 좌: BPM */}
        <div className="control-left">
          <div className="bpm-control">
            <span className="bpm-label">BPM</span>
            <button className="bpm-adj" onClick={() => handleBpmChange(bpm - 1)} disabled={disabled}>−</button>
            <input
              type="range" min={50} max={200} value={bpm}
              className="bpm-slider"
              onChange={e => handleBpmChange(Number(e.target.value))}
              disabled={disabled}
            />
            <button className="bpm-adj" onClick={() => handleBpmChange(bpm + 1)} disabled={disabled}>+</button>
            <span className="bpm-value">{bpm}</span>
          </div>
        </div>

        {/* 중: 재생 */}
        <div className="control-center">
          <button className={`btn-main ${isPlaying ? 'pause' : 'play'}`} onClick={togglePlay} disabled={disabled}>
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button className="btn-sub" onClick={handleStop} disabled={disabled}>⏹ STOP</button>
        </div>

        {/* 우: 도구 */}
        <div className="control-right">
          <button className={`tool-btn ${metronomeOn ? 'active' : ''}`} onClick={toggleMetronome} disabled={disabled}>
            🥁 메트로놈
          </button>
          <button className={`tool-btn ${solfegeOn ? 'active' : ''}`} onClick={toggleSolfege} disabled={disabled}>
            {reloading ? '...' : '🎵 계이름'}
          </button>
          <button className={`tool-btn ${autoScroll ? 'active' : ''}`} onClick={toggleAutoScroll}>
            {autoScroll ? '🔒 Auto' : '🖱 Free'}
          </button>
        </div>
      </div>

      {/* ── 진행 바 ── */}
      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {totalMeasures > 0 && (
          <span className="progress-label">{currentMeasure} / {totalMeasures} 마디</span>
        )}
      </div>

      {/* ── 악보 영역 ── */}
      <div className="sheet-main-content">
        <div className="osmd-container-wrapper">
          {reloading && <div className="reloading-overlay">악보 갱신 중...</div>}
          <div ref={containerRef} className="osmd-canvas-container" />
        </div>
      </div>

    </div>
  );
}

export default SheetViewerPage;
