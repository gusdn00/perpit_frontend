import React from 'react';
import { useLocation } from 'react-router-dom';
import MusicXMLViewer from '../components/MusicXMLViewer';

function SheetViewerPage() {
  const { state } = useLocation();
  const { result_url } = state || {};

  if (!result_url) {
    return <div>잘못된 접근입니다.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <MusicXMLViewer xmlUrl={result_url} />
    </div>
  );
}

export default SheetViewerPage;
