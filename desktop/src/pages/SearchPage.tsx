import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen } from 'lucide-react';

interface SourceChunk {
  text: string;
  metadata: any;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: SourceChunk[];
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hello! I am ready to search your indexed documents. What would you like to know?',
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userMsg.content, top_k: 3 })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.answer,
        sources: data.sources
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Error: Could not reach the intelligence backend.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease-in-out' }}>
      <header style={{ marginBottom: '32px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Intelligence Search</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Query the offline multimodal knowledge base.</p>
      </header>

      {/* Chat Area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {messages.map((msg) => (
            <div key={msg.id} style={{ 
              display: 'flex', 
              gap: '16px', 
              maxWidth: '85%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              {msg.role === 'ai' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '16px', 
                  borderRadius: 'var(--radius-md)', 
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  lineHeight: '1.6'
                }}>
                  {msg.content}
                </div>
                
                {/* Sources Display */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={14} /> Sources Context
                    </p>
                    {msg.sources.map((source, i) => (
                      <div key={i} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          File: {source.metadata.filename || 'Unknown'}
                        </span>
                        <p style={{ color: 'var(--text-secondary)' }}>"{source.text}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {msg.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', gap: '16px', maxWidth: '85%' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                Consulting intelligence database...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-cyber" 
              placeholder="Ask a question about your documents..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button className="btn-primary" onClick={handleSend} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
              <span>{loading ? 'Thinking...' : 'Send'}</span>
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SearchPage;
