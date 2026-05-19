import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, ShieldCheck, Clapperboard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL, API_API_URL } from '../utils/apiConfig';

export default function Auth({ onLogin }) {
  // Parse URL search parameters synchronously on initialization to avoid timing issues or blink frames
  const [authMode, setAuthMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const token = params.get('token');
    return (mode === 'reset' && token) ? 'reset' : 'login';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot password states
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Password reset states
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const endpoint = authMode === 'login' ? '/api/videos/login/' : '/api/videos/signup/';
    const payload = authMode === 'login' 
      ? { username: e.target.email.value, password: e.target.password.value }
      : { username: e.target.email.value, email: e.target.email.value, password: e.target.password.value, name: e.target.name?.value };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onLogin(data);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error("Auth error", err);
      alert("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_API_URL}/videos/forgot_password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResetSubmitted(true);
        if (data.status && data.status.includes("printed to console")) {
          alert("Success! The password reset email has been printed to the server terminal console. To send real emails to your phone, please see details in settings.py.");
        }
      } else {
        alert(data.error || 'Failed to request password reset');
      }
    } catch (err) {
      console.error("Forgot password error", err);
      alert("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_API_URL}/videos/reset_password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });
      
      const data = await response.json();
      if (response.ok) {
        setPasswordResetSuccess(true);
        // Clean URL parameters cleanly so reloads don't show the reset screen again
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error("Reset password error", err);
      alert("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0d14] p-4 relative overflow-hidden font-sans">
      {/* Dark Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/30 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-900/20 blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-900/20 blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2rem] border border-white/5 p-10 shadow-2xl shadow-black/50">
          
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Clapperboard size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">EduVideo</h1>
            </div>
            <p className="text-slate-400 text-sm text-center">
              {authMode === 'login' && 'Enter the future of cinematic education.'}
              {authMode === 'signup' && 'Join the future of cinematic education intelligence.'}
              {authMode === 'forgot' && 'Reset your credentials securely.'}
              {authMode === 'reset' && 'Create your new secure password.'}
            </p>
          </div>

          {authMode === 'reset' && passwordResetSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="text-cyan-400 w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Password Updated!</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Your password has been successfully reset. You can now securely sign in to your account with your new credentials.
              </p>
              <button 
                onClick={() => {
                  setPasswordResetSuccess(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setAuthMode('login');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 text-[#0a0d14] rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                Back to Sign In
              </button>
            </motion.div>
          ) : authMode === 'reset' ? (
            <form className="space-y-5" onSubmit={handleResetPasswordSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="newPassword"
                    required
                    placeholder="••••••••"
                    value={newPassword || ''}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={confirmPassword || ''}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 text-[#0a0d14] rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0d14]/30 border-t-[#0a0d14] rounded-full animate-spin"></div>
                ) : (
                  'Update Password'
                )}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-indigo-300 font-semibold hover:text-indigo-200"
                >
                  Cancel & Sign In
                </button>
              </div>
            </form>
          ) : authMode === 'forgot' && resetSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="text-cyan-400 w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                We've sent a password reset link to <span className="text-white font-bold">{resetEmail}</span>. Please check your inbox for instructions.
              </p>
              <button 
                onClick={() => {
                  setResetSubmitted(false);
                  setResetEmail('');
                  setAuthMode('login');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 text-[#0a0d14] rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                Back to Sign In
              </button>
            </motion.div>
          ) : authMode === 'forgot' ? (
            <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={resetEmail || ''}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 text-[#0a0d14] rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0d14]/30 border-t-[#0a0d14] rounded-full animate-spin"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-indigo-300 font-semibold hover:text-indigo-200"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="Alex Sterling"
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="name@company.com"
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  {authMode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setResetEmail('');
                        setResetSubmitted(false);
                        setAuthMode('forgot');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 text-[#0a0d14] rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0d14]/30 border-t-[#0a0d14] rounded-full animate-spin"></div>
                ) : (
                  authMode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          )}

          {authMode !== 'forgot' && authMode !== 'reset' && (
            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-slate-400 text-sm">
                {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="ml-1 text-indigo-300 font-semibold hover:text-indigo-200 transition-colors"
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Nav */}
      <div className="absolute bottom-6 w-full px-10 flex justify-between items-center text-xs font-medium text-slate-500 z-10 max-w-7xl mx-auto">
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} />
          <span>Secured by EduVideo Cloud</span>
        </div>
      </div>
    </div>
  );
}
