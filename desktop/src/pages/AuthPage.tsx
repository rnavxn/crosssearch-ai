import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // OAuth2 expects form-urlencoded data for login
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        await login(response.data.access_token);
        navigate('/');
      } else {
        // JSON for registration
        await api.post('/auth/register', { email, password });
        setIsLogin(true); // Switch back to login on success
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>CrossSearch AI</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Secure System Login' : 'Create Operator Account'}
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(220, 20, 60, 0.1)', 
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Operator Email
            </label>
            <input 
              type="email" 
              className="input-cyber" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@ntro.gov"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Passcode
            </label>
            <input 
              type="password" 
              className="input-cyber" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Authenticating...' : (isLogin ? 'Initialize Uplink' : 'Register Operator')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Need access? Request clearance." : "Already registered? Login here."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
