import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../config';

const SettingsPage: React.FC = () => {
  const [backendUrl, setBackendUrl] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('backend_url', backendUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out', padding: '32px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure system preferences and network connections.</p>
      </header>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          Network Configuration
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 500 }}>Backend Server URL</label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            For local use, keep this as http://127.0.0.1:8000. For network demos (Laptop A to Laptop B), enter the local IP address of the machine running the backend (e.g., http://192.168.1.10:8000).
          </p>
          <input 
            type="text" 
            className="input-cyber" 
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://127.0.0.1:8000"
            style={{ marginTop: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            Save Configuration
          </button>
          
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', animation: 'fadeIn 0.3s' }}>
              <CheckCircle size={16} /> Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
