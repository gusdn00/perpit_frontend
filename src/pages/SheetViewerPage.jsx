import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import axiosInstance from '../axiosInstance';

function SheetViewerPage() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const sanitizeMusicXML = (xml) => {
  let cleaned = xml;

  // 1️⃣ DOCTYPE 제거 (가장 중요)
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');

  // 2️⃣ XML 선언 앞뒤 공백 제거
  cleaned = cleaned.trim();

  // 3️⃣ 빈 part-name 보정
  cleaned = cleaned.replace(
    /<part-name\s*\/>/gi,
    '<part-name>Music</part-name>'
  );

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
        // ✅ XML 문자열 직접 수신
        const res = await axiosInstance.get(
          `/create_sheets/mysheets/${sid}/view`,
          {
            responseType: 'text', // 🔥 매우 중요
          }
        );

        const xmlText = res.data;

        if (!xmlText || typeof xmlText !== 'string') {
          throw new Error('유효하지 않은 XML 데이터');
        }

        xmlText = sanitizeMusicXML(xmlText);

        // OSMD 인스턴스 생성 (1회)
        if (!osmdRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: true,
            drawingParameters: 'default',
          });
        }

        await osmdRef.current.load(xmlText);
        osmdRef.current.render();
      } catch (err) {
        console.error(err);
        setError('악보 렌더링에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSheet();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Sheet Preview</h2>

      {loading && <p>악보를 불러오는 중입니다...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div ref={containerRef} />
    </div>
  );
}

export default SheetViewerPage;
