import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, UploadCloud, FolderClosed, Settings, LogOut } from 'lucide-react';

const DesktopLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '0 16px 32px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-primary)', borderRadius: '8px' }}></div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>CrossSearch</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          
          <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={18} />
            Search
          </NavLink>
          
          <NavLink to="/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UploadCloud size={18} />
            Upload
          </NavLink>

          <NavLink to="/collections" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FolderClosed size={18} />
            Collections
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: 'var(--error)', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(216, 90, 48, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DesktopLayout;
