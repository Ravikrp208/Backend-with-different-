import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { authService } from '../api';

export default function AuthCard({ onAuthSuccess, addToast, isServerOnline }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 20, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { score: 60, label: 'Medium', color: '#f59e0b' };
    return { score: 100, label: 'Strong', color: '#10b981' };
  };

  const passStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (activeTab === 'register' && !formData.name) {
      addToast('Please enter your full name', 'error');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'register') {
        const data = await authService.register(formData);
        addToast(data.message || 'Registration successful!', 'success');
        onAuthSuccess(data.user, data.token);
      } else {
        const data = await authService.login({
          email: formData.email,
          password: formData.password
        });
        addToast(data.message || 'Logged in successfully!', 'success');
        onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Authentication failed';
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', width: '100%', margin: '40px auto 20px' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '36px 32px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '8px 14px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '12px',
            fontSize: '0.8rem',
            color: '#a5b4fc',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} />
            Secure Authentication Portal
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '6px' }}>
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Sign up in seconds and get started'}
          </p>
        </div>

        {!isServerOnline && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ Warning: Express Backend on port 3000 is not reachable. Make sure `npm run dev` is running in `Backend/`.
          </div>
        )}

        {/* Tab Switcher */}
        <div className="tab-container">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setFormData({ name: '', email: '', password: '' }); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setFormData({ name: '', email: '', password: '' }); }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="input-group animate-fade-in">
              <label className="input-label">Full Name</label>
              <div className="input-field-wrapper">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ravi Kumar"
                  className="custom-input"
                  required
                />
                <User className="input-icon" size={18} />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-field-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ravi@example.com"
                className="custom-input"
                required
              />
              <Mail className="input-icon" size={18} />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: activeTab === 'register' ? '8px' : '24px' }}>
            <label className="input-label">
              <span>Password</span>
              {activeTab === 'login' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>
                  Forgot?
                </span>
              )}
            </label>
            <div className="input-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="custom-input"
                style={{ paddingRight: '42px' }}
                required
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password strength meter for registration */}
          {activeTab === 'register' && formData.password.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Password Strength</span>
                <span style={{ color: passStrength.color, fontWeight: '600' }}>{passStrength.label}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${passStrength.score}%`,
                  backgroundColor: passStrength.color,
                  transition: 'all 0.3s ease'
                }} />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {activeTab === 'login' ? (
            <span>Don't have an account? <a style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }} onClick={() => setActiveTab('register')}>Register now</a></span>
          ) : (
            <span>Already registered? <a style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }} onClick={() => setActiveTab('login')}>Sign in</a></span>
          )}
        </div>

      </div>
    </div>
  );
}
