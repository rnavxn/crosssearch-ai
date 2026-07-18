import React from 'react';

const SearchPage = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px' }}>Intelligence Search</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Query the offline multimodal knowledge base.</p>
      </header>

      <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>The AI Retrieval Engine will be initialized here in Phase 5.</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
