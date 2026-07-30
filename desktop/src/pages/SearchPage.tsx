import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen, MessageSquare, Plus, Trash2, Download } from 'lucide-react';
import { getApiUrl } from '../config';

interface SourceChunk {
  text: string;
  metadata: any;
}

interface Message {
  id: number | string;
  role: 'user' | 'ai';
  content: string;
  sources?: SourceChunk[];
}

interface Conversation {
  id: number;
  title: string;
}

const SearchPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getToken = () => localStorage.getItem('access_token');

  const handleDownload = async (docId: number, filename: string) => {
    if (!docId) return;
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/documents/${docId}/download`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/chat`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (convId: number) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/chat/${convId}/messages`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title: `Chat ${new Date().toLocaleDateString()}` })
      });
      if (response.ok) {
        const newConv = await response.json();
        setConversations(prev => [newConv, ...prev]);
        setActiveConvId(newConv.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChat = async (convId: number) => {
    if (!confirm('Delete this chat thread?')) return;
    try {
      await fetch(`${getApiUrl()}/api/v1/chat/${convId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    
    // Auto-create chat if none exists
    let currentConvId = activeConvId;
    if (!currentConvId) {
      try {
        const response = await fetch(`${getApiUrl()}/api/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({ title: query.substring(0, 30) + '...' })
        });
        if (response.ok) {
          const newConv = await response.json();
          setConversations(prev => [newConv, ...prev]);
          setActiveConvId(newConv.id);
          currentConvId = newConv.id;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    }

    const userQuery = query;
    setQuery('');
    
    // Optimistic UI for user message
    const tempUserMsg: Message = { id: Date.now(), role: 'user', content: userQuery };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      // 1. Save user msg to DB
      await fetch(`${getApiUrl()}/api/v1/chat/${currentConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ role: 'user', content: userQuery })
      });

      // 2. Query Search API
      const searchRes = await fetch(`${getApiUrl()}/api/v1/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ query: userQuery, top_k: 3 })
      });

      if (!searchRes.ok) throw new Error('Search failed');
      const searchData = await searchRes.json();
      
      // 3. Save AI msg to DB
      const aiContent = searchData.answer;
      
      const dbRes = await fetch(`${getApiUrl()}/api/v1/chat/${currentConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ role: 'ai', content: aiContent, sources: searchData.sources })
      });
      const aiMsgSaved = await dbRes.json();

      // Show in UI
      const finalAiMsg: Message = {
        id: aiMsgSaved.id,
        role: 'ai',
        content: aiMsgSaved.content,
        sources: aiMsgSaved.sources
      };
      setMessages(prev => [...prev, finalAiMsg]);
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ai',
        content: 'Error: Could not reach the intelligence backend.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', animation: 'fadeIn 0.3s ease-in-out', gap: '24px' }}>
      
      {/* Threads Sidebar */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--border-subtle)', paddingRight: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Chat History</h2>
          <button onClick={handleNewChat} className="btn-secondary" style={{ padding: '6px' }} title="New Chat">
            <Plus size={18} />
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`glass-card ${activeConvId === conv.id ? 'active-chat' : ''}`}
              style={{ 
                padding: '12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                backgroundColor: activeConvId === conv.id ? 'var(--bg-tertiary)' : 'transparent',
                border: activeConvId === conv.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setActiveConvId(conv.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <MessageSquare size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {conv.title}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(conv.id); }}
                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.7 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '32px' }}>
              No chat history. Start a new conversation!
            </p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px', flexShrink: 0 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Intelligence Search</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Query the offline multimodal knowledge base.</p>
        </header>

        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {loadingHistory ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Loader2 size={32} className="spin" color="var(--accent-primary)" />
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    <Bot size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                    <p>Send a message to start searching your documents.</p>
                  </div>
                )}
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
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <BookOpen size={14} /> Sources Context
                          </p>
                          {msg.sources.map((source, i) => (
                            <div key={i} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                  File: {source.metadata.filename || 'Unknown'}
                                </span>
                                {source.metadata.document_id && (
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                      onClick={() => window.open(`${getApiUrl()}/api/v1/documents/${source.metadata.document_id}/download?token=${getToken()}`, '_blank')}
                                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      title="Open Document in new tab"
                                    >
                                      <BookOpen size={14} /> Open
                                    </button>
                                    <button 
                                      onClick={() => handleDownload(source.metadata.document_id, source.metadata.filename)}
                                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      title="Download Document"
                                    >
                                      <Download size={14} /> Download
                                    </button>
                                  </div>
                                )}
                              </div>
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
              </>
            )}
            
            {loading && (
              <div style={{ display: 'flex', gap: '16px', maxWidth: '85%' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Loader2 size={18} className="spin" />
                </div>
                <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  Consulting intelligence database...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

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

    </div>
  );
};

export default SearchPage;
