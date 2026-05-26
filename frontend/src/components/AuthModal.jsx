import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ArrowRight, KeyRound, CheckCircle, ShieldAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { userActions } from '../store/slices/userSlice';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setInfoMessage('');

    if (mode === 'login' || mode === 'signup') {
      dispatch(userActions.loginRequest());
      try {
        const endpoint = mode === 'login' ? '/api/v1/users/login' : '/api/v1/users/signup';
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
          withCredentials: true
        });
        
        console.log('Auth Success:', response.data);
        dispatch(userActions.loginSuccess(response.data.data.user));
        onClose();
      } catch (err) {
        console.error('Auth Error:', err.response?.data || err.message);
        dispatch(userActions.loginFail(err.response?.data?.message || 'Something went wrong'));
      }
    } else if (mode === 'forgot') {
      setLocalLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/users/forgotPassword`, {
          email: formData.email
        });
        setInfoMessage(response.data.message);
        setResetToken(response.data.resetToken); // Display reset token for dev demonstration
        setMode('reset');
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Failed to request password reset');
      } finally {
        setLocalLoading(false);
      }
    } else if (mode === 'reset') {
      setLocalLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/users/resetPassword/${resetToken}`, {
          password: newPassword
        });
        setInfoMessage('Password reset successfully! You can now log in.');
        setMode('login');
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Failed to reset password');
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const activeError = error || localError;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px 20px',
          overflowY: 'auto'
        }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000
            }}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass modal-card"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '40px 30px',
              position: 'relative',
              zIndex: 2001,
              margin: 'auto 0'
            }}
          >
            <button 
              onClick={onClose}
              className="modal-close-btn"
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            {/* Header Titles */}
            {mode === 'login' && (
              <>
                <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter your credentials to continue</p>
              </>
            )}
            {mode === 'signup' && (
              <>
                <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Join EatMore</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Create an account to start ordering</p>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Reset Security</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Request a password recovery token</p>
              </>
            )}
            {mode === 'reset' && (
              <>
                <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Reset Password</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Provide token and enter your new password</p>
              </>
            )}

            {infoMessage && (
              <div className="glass" style={{ padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #10b981', color: '#34d399', fontSize: '13px', marginBottom: '20px' }}>
                {infoMessage}
              </div>
            )}

            {/* Displaying recovery token for local developer sandbox demonstration */}
            {mode === 'reset' && resetToken && (
              <div className="glass" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', margin: '0 0 6px 0' }}>Developer Recovery Sandbox</p>
                <code style={{ fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', color: 'white', display: 'block', wordBreak: 'break-all' }}>
                  {resetToken}
                </code>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>This token has been generated by the backend and prefilled below.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Form Fields depend on mode */}
              {mode === 'signup' && (
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                  <UserIcon size={20} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ background: 'none', border: 'none', padding: '16px', color: 'white', width: '100%', outline: 'none' }}
                  />
                </div>
              )}
              
              {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                  <Mail size={20} color="var(--text-muted)" />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ background: 'none', border: 'none', padding: '16px', color: 'white', width: '100%', outline: 'none' }}
                  />
                </div>
              )}

              {(mode === 'login' || mode === 'signup') && (
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                  <Lock size={20} color="var(--text-muted)" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={{ background: 'none', border: 'none', padding: '16px', color: 'white', width: '100%', outline: 'none' }}
                  />
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                    <KeyRound size={20} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder="Security Reset Token"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      style={{ background: 'none', border: 'none', padding: '16px', color: 'white', width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                    <Lock size={20} color="var(--text-muted)" />
                    <input 
                      type="password" 
                      placeholder="Enter New Password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ background: 'none', border: 'none', padding: '16px', color: 'white', width: '100%', outline: 'none' }}
                    />
                  </div>
                </>
              )}

              {/* Forgot Password Clicker */}
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                  <span 
                    onClick={() => { setMode('forgot'); setLocalError(''); }}
                    style={{ color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', hover: { color: 'var(--primary)' } }}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              {activeError && <p style={{ color: '#ff4b4b', fontSize: '14px' }}>{activeError}</p>}

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || localLoading}
                style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
              >
                {loading || localLoading ? 'Processing...' : (
                  mode === 'login' ? 'Sign In' : 
                  mode === 'signup' ? 'Create Account' : 
                  mode === 'forgot' ? 'Send Recovery Token' : 'Update Password'
                )}
                <ArrowRight size={20} />
              </button>

              {(mode === 'login' || mode === 'signup') && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                    className="glass"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      padding: '14px',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontWeight: '500',
                      fontSize: '15px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: 'block' }}>
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                  </button>
                </>
              )}
            </form>

            {/* Footer switches */}
            <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)' }}>
              {mode === 'login' && (
                <>
                  Don't have an account?{' '}
                  <span 
                    onClick={() => { setMode('signup'); setLocalError(''); }}
                    style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Sign Up
                  </span>
                </>
              )}
              {mode === 'signup' && (
                <>
                  Already have an account?{' '}
                  <span 
                    onClick={() => { setMode('login'); setLocalError(''); }}
                    style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Log In
                  </span>
                </>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <>
                  Remember your password?{' '}
                  <span 
                    onClick={() => { setMode('login'); setLocalError(''); }}
                    style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Back to Login
                  </span>
                </>
              )}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
