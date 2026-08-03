import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, Share2 } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    acceptTerms: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registering:', formData);
  };

  return (
    <div className="h-screen w-full bg-[#0b0a10] text-white flex overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* Left 50% Hero Wallpaper Panel */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative flex-col justify-between p-12 overflow-hidden border-r border-[#1a1824]">
        {/* Background Image Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-100"
          style={{ backgroundImage: `url('/neural_network_bg.png')` }}
        />
        {/* Subtle Vignette Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <span className="text-xl font-bold tracking-tight text-white">Synthetix AI</span>
        </div>

        {/* Center Hero Text */}
        <div className="relative z-10 max-w-lg mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1236]/70 border border-[#4c3294]/50 text-[#b599fc] text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>NEXT-GEN INTELLIGENCE</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Accelerate your team's intelligence.
          </h1>

          <p className="text-gray-300 text-sm lg:text-base leading-relaxed mb-8">
            Connect your enterprise data to our specialized AI models and unlock unparalleled strategic insights in seconds.
          </p>

          {/* Stats Row */}
          <div className="flex items-center space-x-12 pt-6 border-t border-white/15">
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-xs text-gray-400 mt-0.5">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">ISO</div>
              <div className="text-xs text-gray-400 mt-0.5">27001 Certified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 50% Form Panel */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#0b0a10] overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-5">

          {/* Header */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Experience the future of collaborative data intelligence.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#14121b] border border-[#232030] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
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

              {/* Password Strength Indicator */}
              <div className="mt-2.5 space-y-1.5">
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="h-1 rounded-full bg-[#b498f3]"></div>
                  <div className="h-1 rounded-full bg-[#b498f3]"></div>
                  <div className="h-1 rounded-full bg-[#232030]"></div>
                  <div className="h-1 rounded-full bg-[#232030]"></div>
                </div>
                <span className="text-[11px] text-[#b498f3] font-medium block">Strong password</span>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2.5 pt-1">
              <input
                type="checkbox"
                id="acceptTerms"
                required
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-4 h-4 rounded border-[#232030] bg-[#14121b] text-purple-500 focus:ring-0 accent-[#a78bfa] cursor-pointer"
              />
              <label htmlFor="acceptTerms" className="text-xs text-gray-400 cursor-pointer select-none">
                I agree to the <a href="#terms" className="text-white font-bold hover:underline">Terms of Service</a> and <a href="#privacy" className="text-white font-bold hover:underline">Privacy Policy</a>.
              </label>
            </div>

            {/* Primary Button */}
            <button
              type="submit"
              className="w-full mt-3 bg-[#b498f3] hover:bg-[#a382ee] active:bg-[#926ee6] text-[#0b0a10] font-bold text-base py-3.5 rounded-xl shadow-lg shadow-purple-500/10 transition-all cursor-pointer text-center"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-[#1e1c2b] w-full" />
            <span className="absolute bg-[#0b0a10] px-4 text-[11px] text-gray-500 font-semibold uppercase tracking-widest">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 bg-[#14121b] hover:bg-[#1c1926] border border-[#232030] text-gray-200 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
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
              className="flex items-center justify-center gap-2.5 bg-[#14121b] hover:bg-[#1c1926] border border-[#232030] text-gray-200 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>SSO</span>
            </button>
          </div>

          {/* Switch Link */}
          <div className="text-center text-sm text-gray-400 pt-2">
            Already have an account?{' '}
            <Link to="/" className="text-white font-bold hover:underline ml-1">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;