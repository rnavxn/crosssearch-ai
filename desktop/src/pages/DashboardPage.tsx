import React from 'react';
import { Database, FileText, Search as SearchIcon, Users } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's an overview of your offline intelligence system.</p>
      </header>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <FileText size={20} />
            <span style={{ fontWeight: 500 }}>Documents Indexed</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>124</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-success">Syncing</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Last updated 2m ago</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <SearchIcon size={20} />
            <span style={{ fontWeight: 500 }}>Queries Today</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>84</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>↑ 12% from yesterday</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <Database size={20} />
            <span style={{ fontWeight: 500 }}>Vector DB Status</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '8px' }}>Online</h2>
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
            {[
              { id: 1, text: 'Uploaded "Q3_Financial_Report.pdf"', time: '10 mins ago' },
              { id: 2, text: 'Indexed 5,420 chunks into Vector DB', time: '12 mins ago' },
              { id: 3, text: 'Searched for "Revenue growth in EMEA region"', time: '1 hour ago' },
            ].map((item, i) => (
              <li key={item.id} style={{ 
                padding: '16px 24px', 
                borderBottom: i !== 2 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-primary)' }}>{item.text}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
