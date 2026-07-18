import React from 'react';
import { Send } from 'lucide-react';

const SearchPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease-in-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Intelligence Search</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Query the offline multimodal knowledge base.</p>
      </header>

      {/* Chat Area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', gap: '16px', maxWidth: '80%' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '14px' }}>AI</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <p>Hello! I am ready to search your indexed documents. What would you like to know?</p>
            </div>
          </div>
          
        </div>

        {/* Input Area */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-cyber" 
              placeholder="Ask a question about your documents..." 
              style={{ flex: 1 }}
            />
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Send</span>
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SearchPage;
