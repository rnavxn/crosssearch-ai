import React from 'react';

const UploadPage = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px' }}>Data Ingestion</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload PDFs, Images, and Audio for offline processing.</p>
      </header>

      <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>The Secure File Upload pipeline will be built in Phase 3.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
