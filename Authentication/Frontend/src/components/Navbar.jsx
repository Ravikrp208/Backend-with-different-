import React from 'react';
import { ShieldCheck, Server, UserCheck, Activity } from 'lucide-react';

export default function Navbar({ user, isServerOnline, onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(10, 13, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
        }}>
          <ShieldCheck size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Auth<span className="gradient-text">Pulse</span>
          </span>
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '8px',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            JWT + MONGODB
          </span>
        </div>
      </div>

      {/* Server Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: isServerOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isServerOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          <Server size={14} color={isServerOnline ? '#10b981' : '#ef4444'} />
          <span style={{ color: isServerOnline ? '#34d399' : '#fca5a5' }}>
            Backend: {isServerOnline ? 'Online (3000)' : 'Offline'}
          </span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isServerOnline ? '#10b981' : '#ef4444',
            boxShadow: `0 0 8px ${isServerOnline ? '#10b981' : '#ef4444'}`
          }} />
        </div>

        {/* Logged in User chip */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <UserCheck size={16} color="#a5b4fc" />
              <span>{user.name}</span>
            </div>
            <button className="btn-secondary" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
