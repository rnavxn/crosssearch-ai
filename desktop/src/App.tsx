import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DesktopLayout from './components/DesktopLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<DesktopLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="upload" element={<UploadPage />} />
              
              {/* Placeholders for MVP scope */}
              <Route path="collections" element={<div style={{padding: '32px'}}><h2>Collections Placeholder</h2></div>} />
              <Route path="settings" element={<div style={{padding: '32px'}}><h2>Settings Placeholder</h2></div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
