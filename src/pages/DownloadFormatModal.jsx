import React from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/DownloadFormatModal.css';

export default function DownloadFormatModal({ sheet, onXML, onPDF, onClose, pdfLoading }) {
  return (
    <div className="dfm-backdrop" onClick={onClose}>
      <div className="dfm-box" onClick={e => e.stopPropagation()}>
        <div className="dfm-header">
          <h3 className="dfm-title">다운로드 형식 선택</h3>
          <button className="dfm-close" onClick={onClose}><FiX /></button>
        </div>
        <p className="dfm-sheetname">{sheet.name}</p>
        <div className="dfm-options">
          <button className="dfm-option dfm-xml" onClick={onXML} disabled={pdfLoading}>
            <span className="dfm-option-icon">📄</span>
            <span className="dfm-option-label">MusicXML</span>
            <span className="dfm-option-desc">악보 편집 프로그램에서 열기</span>
          </button>
          <button className="dfm-option dfm-pdf" onClick={onPDF} disabled={pdfLoading}>
            <span className="dfm-option-icon">{pdfLoading ? '⏳' : '📋'}</span>
            <span className="dfm-option-label">PDF</span>
            <span className="dfm-option-desc">{pdfLoading ? '생성 중...' : '바로 출력·공유 가능'}</span>
          </button>
        </div>
        {pdfLoading && (
          <p className="dfm-loading-msg">PDF를 생성하고 있습니다. 잠시만 기다려주세요...</p>
        )}
      </div>
    </div>
  );
}
