import React, { useEffect, useState } from 'react';
import { Database, FileText, Search as SearchIcon, Loader2 } from 'lucide-react';
import { getApiUrl } from '../config';

interface Activity {
  id: number;
  text: string;
  time: string;
}

interface DashboardStats {
  document_count: number;
  query_count: number;
  vector_db_status: string;
  recent_activity: Activity[];
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${getApiUrl()}/api/v1/stats/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's an overview of your offline intelligence system.</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px' }}>
          <Loader2 size={48} className="spin" color="var(--accent-primary)" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <FileText size={20} />
                <span style={{ fontWeight: 500 }}>Documents Indexed</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>{stats?.document_count || 0}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-success">Syncing</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live from Database</span>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <SearchIcon size={20} />
                <span style={{ fontWeight: 500 }}>Total Queries</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>{stats?.query_count || 0}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Powered by Llama3</span>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Database size={20} />
                <span style={{ fontWeight: 500 }}>Vector DB Status</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '8px' }}>{stats?.vector_db_status || 'Offline'}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ChromaDB Local</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Recent Activity</h2>
            <div className="glass-card" style={{ padding: '0' }}>
              <ul style={{ listStyle: 'none' }}>
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  stats.recent_activity.map((item, i) => (
                    <li key={item.id} style={{ 
                      padding: '16px 24px', 
                      borderBottom: i !== stats.recent_activity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.text}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.time}</span>
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No recent activity.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
