import React, { useEffect, useState } from 'react';
import MusicXML from 'react-musicxml';

function MusicXMLViewer({ xmlUrl }) {
  const [xml, setXml] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchXML = async () => {
      try {
        const res = await fetch(xmlUrl);
        const text = await res.text();
        setXml(text);
      } catch (err) {
        console.error(err);
        setError('악보를 불러오지 못했습니다.');
      }
    };

    fetchXML();
  }, [xmlUrl]);

  if (error) return <div>{error}</div>;
  if (!xml) return <div>Loading sheet...</div>;

  return <MusicXML xml={xml} />;
}

export default MusicXMLViewer;
