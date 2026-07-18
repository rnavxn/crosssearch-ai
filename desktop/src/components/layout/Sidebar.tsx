import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, UploadCloud, ShieldAlert, LogOut, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '40px', padding: '0 16px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={24} color="var(--accent-primary)" />
          CrossSearch
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Offline RAG Engine
        </p>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Search size={20} />
          Intelligence Search
        </NavLink>
        
        {/* Only Admin or Analyst should ideally upload docs, but we'll show it for now and secure the API later */}
        {(user?.role === 'admin' || user?.role === 'analyst') && (
          <NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <UploadCloud size={20} />
            Data Ingestion
          </NavLink>
        )}

        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <ShieldAlert size={20} />
            Access Control
          </NavLink>
        )}
      </nav>

      <div style={{ 
        marginTop: 'auto', 
        padding: '16px', 
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.email}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            {user?.role.toUpperCase()}
          </p>
        </div>
        <button 
          onClick={logout}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          title="Terminate Session"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
