import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthCard from './components/AuthCard';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import { authService } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '');
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check backend server status
  const checkHealth = async () => {
    const online = await authService.checkServerHealth();
    setIsServerOnline(online);
  };

  // Fetch current logged in user profile
  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      // Not authenticated or token expired
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchProfile();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setToken('');
    addToast('Logged out successfully', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Glow Orbs */}
      <div className="bg-glow-orb-1" />
      <div className="bg-glow-orb-2" />

      {/* Navbar */}
      <Navbar user={user} isServerOnline={isServerOnline} onLogout={handleLogout} />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connecting to Authentication Server...</span>
          </div>
        ) : user ? (
          <Dashboard 
            user={user} 
            token={token} 
            onLogout={handleLogout} 
            addToast={addToast} 
            onRefreshProfile={fetchProfile} 
          />
        ) : (
          <AuthCard 
            onAuthSuccess={handleAuthSuccess} 
            addToast={addToast} 
            isServerOnline={isServerOnline} 
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(10, 13, 20, 0.6)',
        zIndex: 1
      }}>
        Authentication Project • Node.js, Express, MongoDB, JWT & React Frontend
      </footer>

      {/* Toasts */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
