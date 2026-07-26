import React, { useEffect, useState } from 'react';
import { Download, Trash2, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Document {
  id: number;
  filename: string;
  status: string;
  content_type: string;
}

const CollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/v1/documents/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = async (doc: Document) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/v1/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download document.');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document from the intelligence database?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/v1/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      } else {
        alert('Failed to delete document.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Collections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your offline knowledge base.</p>
        </div>
        <button onClick={fetchDocuments} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', display: 'flex', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No documents found. Head over to the Upload tab to add some!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)' }}>Document</th>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={20} color="var(--accent-primary)" />
                    <span style={{ fontWeight: 500 }}>{doc.filename}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: doc.status.includes('error') ? 'rgba(255,0,0,0.1)' : 'var(--bg-tertiary)',
                      color: doc.status.includes('error') ? 'var(--error)' : 'var(--success-text)',
                      textTransform: 'capitalize'
                    }}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button 
                        onClick={() => handleDownload(doc)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                          title="Delete (Admin Only)"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
