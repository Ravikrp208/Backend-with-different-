import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Share2, Cpu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { onLoginSubmit } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    staySignedIn: false
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onLoginSubmit(formData);
  };



  return (
    <div className="min-h-screen w-full bg-[#0b0a10] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* 100% Crisp, HD Background Image - Zero Blur (Bina Blur Ke) */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-100 scale-100"
        style={{ backgroundImage: `url('/neural_network_bg.png')` }}
      />
      
      {/* Subtle Contrast Overlay (No Blur) */}
      <div className="absolute inset-0 bg-black/55 z-0" />

      {/* Centered Glassmorphic Form Card */}
      <div className="w-full max-w-[440px] bg-[#0b0a10]/85 border border-[#262035] rounded-3xl p-7 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">Synthetix AI</span>
            <span className="text-[11px] text-purple-300 font-medium tracking-wider uppercase">Enterprise Auth</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Experience the future of collaborative data intelligence.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
          
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[#14121b] border border-[#232030] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <a href="#forgot" className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-3 bg-[#14121b] border border-[#232030] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="staySignedIn"
              checked={formData.staySignedIn}
              onChange={(e) => setFormData({ ...formData, staySignedIn: e.target.checked })}
              className="w-4 h-4 rounded border-[#232030] bg-[#14121b] text-purple-500 focus:ring-0 accent-[#a78bfa] cursor-pointer"
            />
            <label htmlFor="staySignedIn" className="text-xs text-gray-400 cursor-pointer select-none">
              Stay signed in
            </label>
          </div>

          {/* Primary Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-[#b498f3] hover:bg-[#a382ee] active:bg-[#926ee6] text-[#0b0a10] font-bold text-base py-3.5 rounded-xl shadow-lg shadow-purple-500/10 transition-all cursor-pointer text-center"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-[#1e1c2b] w-full" />
          <span className="absolute bg-[#0b0a10] px-3 text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[#14121b] hover:bg-[#1c1926] border border-[#232030] text-gray-200 text-sm font-medium py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.3C.6 9.3 0 11.6 0 14s.6 4.7 1.6 6.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[#14121b] hover:bg-[#1c1926] border border-[#232030] text-gray-200 text-sm font-medium py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>SSO</span>
          </button>
        </div>

        {/* Switch Link */}
        <div className="text-center text-xs text-gray-400 pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#b498f3] font-bold hover:underline ml-1">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;