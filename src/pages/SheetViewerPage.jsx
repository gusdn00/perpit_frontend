import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import '../styles/SheetViewerPage.css';

/* ════════════════════════════════
   상수 및 유틸리티
   ════════════════════════════════ */
const STEP_TO_SOLFEGE = { C: '도', D: '레', E: '미', F: '파', G: '솔', A: '라', B: '시' };
const STEP_SEMITONES  = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// 반음 인덱스 → { step, alter }  (샵 기준 / 플랫 기준)
const CHROMATIC_SHARP = [
  { step: 'C', alter: 0 }, { step: 'C', alter: 1 }, { step: 'D', alter: 0 },
  { step: 'D', alter: 1 }, { step: 'E', alter: 0 }, { step: 'F', alter: 0 },
  { step: 'F', alter: 1 }, { step: 'G', alter: 0 }, { step: 'G', alter: 1 },
  { step: 'A', alter: 0 }, { step: 'A', alter: 1 }, { step: 'B', alter: 0 },
];
const CHROMATIC_FLAT = [
  { step: 'C', alter: 0 }, { step: 'D', alter: -1 }, { step: 'D', alter: 0 },
  { step: 'E', alter: -1 }, { step: 'E', alter: 0 }, { step: 'F', alter: 0 },
  { step: 'G', alter: -1 }, { step: 'G', alter: 0 }, { step: 'A', alter: -1 },
  { step: 'A', alter: 0 }, { step: 'B', alter: -1 }, { step: 'B', alter: 0 },
];

const KEY_NAMES = {
  '-7': 'C♭', '-6': 'G♭', '-5': 'D♭', '-4': 'A♭', '-3': 'E♭',
  '-2': 'B♭', '-1': 'F',  '0': 'C',   '1': 'G',   '2': 'D',
   '3': 'A',   '4': 'E',  '5': 'B',   '6': 'F♯',  '7': 'C♯',
};

function fifthsToTonic(f) { return (((f * 7) % 12) + 12) % 12; }
function tonicToFifths(t) { let f = (t * 7) % 12; if (f > 6) f -= 12; return f; }
function transposeKey(fifths, semitones) {
  const newTonic = (fifthsToTonic(fifths) + semitones + 120) % 12;
  return tonicToFifths(newTonic);
}

/* ── XML에서 첫 번째 fifths 값 감지 ── */
function detectFifths(xmlText) {
  try {
    const el = new DOMParser()
      .parseFromString(xmlText, 'application/xml')
      .querySelector('key fifths');
    return el ? parseInt(el.textContent) : 0;
  } catch { return 0; }
}

/* ── MusicXML 전조 ── */
function transposeXML(xmlText, semitones) {
  if (semitones === 0) return xmlText;
  try {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xmlText, 'application/xml');

    // 조표 업데이트
    const origFifths = parseInt(doc.querySelector('key fifths')?.textContent ?? '0');
    const newFifths  = transposeKey(origFifths, semitones);
    doc.querySelectorAll('key fifths').forEach(el => { el.textContent = newFifths; });

    const useFlats = newFifths < 0;
    const CHROMATIC = useFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP;

    // 음표 전조
    doc.querySelectorAll('note').forEach(note => {
      if (note.querySelector('rest')) return;
      const pitch    = note.querySelector('pitch');
      if (!pitch) return;
      const stepEl   = pitch.querySelector('step');
      const alterEl  = pitch.querySelector('alter');
      const octaveEl = pitch.querySelector('octave');
      if (!stepEl || !octaveEl) return;

      const step   = stepEl.textContent;
      const alter  = alterEl ? parseFloat(alterEl.textContent) : 0;
      const octave = parseInt(octaveEl.textContent);

      const midi     = (octave + 1) * 12 + STEP_SEMITONES[step] + alter;
      const newMidi  = midi + semitones;
      const newOct   = Math.floor(newMidi / 12) - 1;
      const semIdx   = ((newMidi % 12) + 12) % 12;
      const newNote  = CHROMATIC[semIdx];

      stepEl.textContent   = newNote.step;
      octaveEl.textContent = newOct;

      if (newNote.alter !== 0) {
        if (alterEl) {
          alterEl.textContent = newNote.alter;
        } else {
          const el = doc.createElement('alter');
          el.textContent = newNote.alter;
          stepEl.after(el);
        }
      } else if (alterEl) {
        alterEl.remove();
      }
    });

    return new XMLSerializer().serializeToString(doc);
  } catch (e) {
    console.error('전조 실패:', e);
    return xmlText;
  }
}

/* ── MusicXML에 계이름 가사 삽입 ── */
function injectSolfege(xmlText) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    doc.querySelectorAll('note').forEach(note => {
      if (note.querySelector('rest') || note.querySelector('lyric')) return;
      const pitch = note.querySelector('pitch');
      if (!pitch) return;
      const step = pitch.querySelector('step')?.textContent;
      if (!step || !STEP_TO_SOLFEGE[step]) return;

      let syllable = STEP_TO_SOLFEGE[step];
      const alter = parseFloat(pitch.querySelector('alter')?.textContent ?? '0');
      if (alter > 0) syllable += '#';
      else if (alter < 0) syllable += '♭';

      const lyric    = doc.createElement('lyric');
      lyric.setAttribute('number', '1');
      const syllabic = doc.createElement('syllabic');
      syllabic.textContent = 'single';
      const text     = doc.createElement('text');
      text.textContent = syllable;
      lyric.appendChild(syllabic);
      lyric.appendChild(text);
      note.appendChild(lyric);
    });
    return new XMLSerializer().serializeToString(doc);
  } catch { return xmlText; }
}

/* ── 변환 적용 순서: 전조 → 계이름 ── */
function buildXml(originalXml, semitones, solfege) {
  let xml = originalXml;
  if (semitones !== 0) xml = transposeXML(xml, semitones);
  if (solfege)          xml = injectSolfege(xml);
  return xml;
}

/* ── XML 전처리 ── */
function sanitizeMusicXML(xml) {
  if (!xml) return '';
  return xml
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim()
    .replace(/<part-name\s*\/>/gi, '<part-name>Music</part-name>');
}

/* ════════════════════════════════
   컴포넌트
   ════════════════════════════════ */
function SheetViewerPage() {
  const containerRef       = useRef(null);
  const osmdRef            = useRef(null);
  const playerRef          = useRef(null);
  const originalXmlRef     = useRef(null);
  const bpmRef             = useRef(120);
  const transposeRef       = useRef(0);
  const solfegeRef         = useRef(false);
  const autoScrollRef      = useRef(false);
  const metronomeCtxRef      = useRef(null);
  const metronomeIdRef       = useRef(null);
  const metronomeNextNoteRef = useRef(0);
  const firstIterRef         = useRef(true);

  const [loading,          setLoading]          = useState(true);
  const [reloading,        setReloading]         = useState(false);
  const [error,            setError]             = useState(null);
  const [isPlaying,        setIsPlaying]         = useState(false);
  const [bpm,              setBpm]               = useState(120);
  const [transposeAmount,  setTransposeAmount]   = useState(0);
  const [originalFifths,   setOriginalFifths]    = useState(0);
  const [metronomeOn,      setMetronomeOn]       = useState(false);
  const [solfegeOn,        setSolfegeOn]         = useState(false);
  const [autoScroll,       setAutoScroll]        = useState(false);
  const [currentMeasure,   setCurrentMeasure]    = useState(0);
  const [totalMeasures,    setTotalMeasures]     = useState(0);

  /* ── OSMD + Player 초기화 ── */
  const setupOSMD = async (xmlText, keepBpm = false) => {
    if (!containerRef.current) return;
    playerRef.current?.stop();
    osmdRef.current?.clear();

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: true, drawTitle: true,
      followCursor: false, drawingParameters: 'default',
    });
    osmdRef.current = osmd;
    await osmd.load(xmlText);
    osmd.render();
    setTotalMeasures(osmd.Sheet?.SourceMeasures?.length ?? 0);

    const player = new AudioPlayer();
    playerRef.current = player;
    await player.loadScore(osmd);

    const scoreBpm = player.playbackSettings?.bpm ?? 120;
    if (!keepBpm) { bpmRef.current = scoreBpm; setBpm(scoreBpm); }
    else          { player.setBpm(bpmRef.current); }

    firstIterRef.current = true;

    player.on('iteration', () => {
      if (!osmd.cursor) return;
      if (firstIterRef.current) { firstIterRef.current = false; }
      else                       { osmd.cursor.next(); }
      const iter = osmd.cursor.Iterator ?? osmd.cursor.iterator;
      const idx  = iter?.CurrentMeasureIndex ?? iter?.currentMeasureIndex ?? 0;
      setCurrentMeasure(idx + 1);
      if (autoScrollRef.current) {
        osmd.cursor.cursorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    player.on('state-change', (state) => {
      if (state === 'STOPPED') {
        setIsPlaying(false);
        stopMetronome();
      }
    });

    osmd.cursor.show();
    setIsPlaying(false);
    setCurrentMeasure(0);
  };

  /* ── 현재 설정으로 재로드 ── */
  const reloadWithSettings = async (semitones, solfege) => {
    if (!originalXmlRef.current) return;
    setReloading(true);
    playerRef.current?.stop();
    try {
      await setupOSMD(buildXml(originalXmlRef.current, semitones, solfege), true);
    } finally {
      setReloading(false);
    }
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
        setOriginalFifths(detectFifths(cleanedXml));
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

  /* ════ 메트로놈 (lookahead 스케줄러) ════
     setInterval 대신 Web Audio API 클럭으로 정확히 스케줄링.
     bpmRef.current를 동적으로 읽으므로 BPM 변경 시 재시작 불필요.
  ════════════════════════════════════════ */
  const LOOKAHEAD_SEC = 0.1;   // 100ms 앞서 스케줄
  const SCHEDULER_MS  = 25;    // 25ms마다 스케줄러 실행

  const scheduleClick = (ctx, time) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.start(time); osc.stop(time + 0.05);
  };

  // startTime: 첫 번째 클릭을 울릴 AudioContext 시각 (생략 시 즉시)
  const startMetronome = (startTime) => {
    stopMetronome();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    metronomeCtxRef.current = ctx;
    metronomeNextNoteRef.current = startTime ?? ctx.currentTime;

    const scheduler = () => {
      const c = metronomeCtxRef.current;
      if (!c) return;
      while (metronomeNextNoteRef.current < c.currentTime + LOOKAHEAD_SEC) {
        scheduleClick(c, metronomeNextNoteRef.current);
        metronomeNextNoteRef.current += 60.0 / bpmRef.current;
      }
    };

    scheduler();
    metronomeIdRef.current = setInterval(scheduler, SCHEDULER_MS);
  };

  const stopMetronome = () => {
    clearInterval(metronomeIdRef.current); metronomeIdRef.current = null;
    metronomeCtxRef.current?.close();      metronomeCtxRef.current = null;
  };

  const toggleMetronome = () => {
    if (metronomeOn) { stopMetronome(); setMetronomeOn(false); }
    else             { startMetronome(); setMetronomeOn(true); }
  };

  /* ════ BPM ════ */
  const handleBpmChange = (val) => {
    const newBpm = Math.max(50, Math.min(200, val));
    bpmRef.current = newBpm; setBpm(newBpm);
    playerRef.current?.setBpm(newBpm);
    // 메트로놈은 재시작 없이 bpmRef를 동적으로 읽으므로 자동 반영됨
  };

  /* ════ 전조 ════ */
  const handleTranspose = async (delta) => {
    const newAmount = Math.max(-6, Math.min(6, transposeRef.current + delta));
    transposeRef.current = newAmount;
    setTransposeAmount(newAmount);
    await reloadWithSettings(newAmount, solfegeRef.current);
  };

  /* ════ 계이름 ════ */
  const toggleSolfege = async () => {
    const next = !solfegeRef.current;
    solfegeRef.current = next;
    setSolfegeOn(next);
    await reloadWithSettings(transposeRef.current, next);
  };

  /* ════ 자동 스크롤 ════ */
  const toggleAutoScroll = () => {
    const next = !autoScroll; autoScrollRef.current = next; setAutoScroll(next);
  };

  /* ════ 재생 제어 ════ */
  const togglePlay = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
      // 일시정지 시 메트로놈도 정지
      if (metronomeOn) stopMetronome();
    } else {
      const iter = osmdRef.current.cursor.Iterator ?? osmdRef.current.cursor.iterator;
      if (iter?.EndReached) {
        osmdRef.current.cursor.reset(); firstIterRef.current = true; setCurrentMeasure(0);
      }
      await playerRef.current.play();
      setIsPlaying(true);
      // 재생 시작 시 메트로놈을 AudioContext 현재 시각에 맞춰 재시작 → 첫 박 동기화
      if (metronomeOn) startMetronome();
    }
  };

  const handleStop = () => {
    playerRef.current?.stop(); osmdRef.current?.cursor.reset();
    firstIterRef.current = true; setIsPlaying(false); setCurrentMeasure(0);
    if (metronomeOn) stopMetronome();
  };

  /* ── 현재 조성 이름 계산 ── */
  const currentFifths = transposeKey(originalFifths, transposeAmount);
  const keyName       = KEY_NAMES[String(currentFifths)] ?? 'C';

  const progress = totalMeasures > 0 ? Math.min((currentMeasure / totalMeasures) * 100, 100) : 0;
  const disabled  = loading || reloading;

  if (error) return <div className="sheet-viewer-error">{error}</div>;

  return (
    <div className="sheet-viewer-page">

      {/* ── 컨트롤 바 ── */}
      <div className="player-controls">

        {/* 좌: BPM + KEY */}
        <div className="control-left">
          <div className="bpm-control">
            <span className="ctrl-label">BPM</span>
            <button className="adj-btn" onClick={() => handleBpmChange(bpm - 1)} disabled={disabled}>−</button>
            <input type="range" min={50} max={200} value={bpm} className="bpm-slider"
              onChange={e => handleBpmChange(Number(e.target.value))} disabled={disabled} />
            <button className="adj-btn" onClick={() => handleBpmChange(bpm + 1)} disabled={disabled}>+</button>
            <span className="bpm-value">{bpm}</span>
          </div>

          <div className="key-control">
            <span className="ctrl-label">KEY</span>
            <button className="adj-btn" onClick={() => handleTranspose(-1)} disabled={disabled}>♭</button>
            <span className="key-value">{keyName}</span>
            <button className="adj-btn" onClick={() => handleTranspose(+1)} disabled={disabled}>♯</button>
            {transposeAmount !== 0 && (
              <span className="transpose-badge">
                {transposeAmount > 0 ? `+${transposeAmount}` : transposeAmount}
              </span>
            )}
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
