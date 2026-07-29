import React, { useState } from 'react';
import { User, Mail, Shield, Key, Copy, Check, LogOut, RefreshCw, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { authService } from '../api';

export default function Dashboard({ user, token, onLogout, addToast, onRefreshProfile }) {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    addToast('JWT Token copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshProfile();
    setRefreshing(false);
    addToast('Profile updated from server', 'success');
  };

  // Decode JWT payload safely for demo UI
  const getDecodedToken = () => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const decodedToken = getDecodedToken();

  return (
    <div style={{ maxWidth: '900px', width: '100%', margin: '40px auto 40px', padding: '0 16px' }} className="animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: '32px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'white',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Welcome, {user?.name}!</h2>
              <span style={{
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: '600'
              }}>
                ACTIVE SESSION
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              You are authenticated via Express JSON Web Token (JWT)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
            <span>Refresh Profile</span>
          </button>

          <button className="btn-danger" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Grid of Profile Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* User Details Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc' }}>
            <User size={18} /> Profile Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name</span>
              <span style={{ fontWeight: '500' }}>{user?.name || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email Address</span>
              <span style={{ fontWeight: '500' }}>{user?.email || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>User ID</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a5b4fc' }}>{user?._id || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Role</span>
              <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Backend & Security Status Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899' }}>
            <Shield size={18} /> Backend Security & DB
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)' }}>
              <Database size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>MongoDB Atlas Connected</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database: Auth-7</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)' }}>
              <Key size={18} color="#6366f1" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Bcryptjs Password Hashing</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 Salt Rounds</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)' }}>
              <Cpu size={18} color="#06b6d4" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>JWT Auth Cookie & Header</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7 Days Expiry</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JWT Inspector Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4' }}>
            <Key size={18} /> Active JWT Token Inspector
          </h3>
          <button className="btn-secondary" onClick={handleCopyToken} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Token'}</span>
          </button>
        </div>

        {token ? (
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#818cf8',
              marginBottom: '16px'
            }}>
              {token}
            </div>

            {decodedToken && (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                  Decoded Token Payload:
                </div>
                <pre style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8', margin: 0, overflowX: 'auto' }}>
                  {JSON.stringify(decodedToken, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Token stored in HTTP-Only Cookie or local session.
          </div>
        )}
      </div>

    </div>
  );
}
