import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{color: 'white', padding: '20px'}}>Loading secure systems...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

// Placeholder Dashboard (Will be built in Phase 2.3)
const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="app-container" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1>Welcome, Operator</h1>
      <div className="glass-card">
        <p>Email: {user?.email}</p>
        <p>Clearance Level: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{user?.role.toUpperCase()}</span></p>
        <button className="btn-primary" onClick={logout} style={{ marginTop: '20px' }}>Terminate Session</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
