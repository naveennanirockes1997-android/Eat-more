import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldAlert, LogOut, ArrowRight, Sparkles, Loader, KeyRound } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { userActions } from './store/slices/userSlice';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

const DashboardLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: 'var(--text-muted)',
    paddingTop: '160px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--primary)',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span>Loading systems control panel...</span>
  </div>
);


const App = () => {
  const { userInfo, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Session restore: check for valid JWT cookie on app mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
          withCredentials: true
        });
        if (res.data.status === 'success' && res.data.data.user) {
          const user = res.data.data.user;
          // Only restore admin/staff sessions
          if (user.role === 'admin' || user.role === 'staff') {
            dispatch(userActions.loginSuccess(user));
          }
        }
      } catch (err) {
        // No valid session — clear any stale localStorage state
        if (localStorage.getItem('userInfo')) {
          dispatch(userActions.logout());
        }
      }
    };
    restoreSession();
  }, [dispatch]);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot / Reset Password States
  const [loginView, setLoginView] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setIsLoggingIn(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/forgotPassword`, {
        email: forgotEmail
      });
      if (response.data.status === 'success') {
        const token = response.data.resetToken;
        setSuccessMessage('Reset token generated! (Bypassed SMTP Email for demo)');
        setResetToken(token); // Auto-fill for convenience
        setLoginView('reset');
      }
    } catch (err) {
      console.error(err);
      setLocalError(err.response?.data?.message || 'Error requesting reset token.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setIsLoggingIn(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/resetPassword/${resetToken}`, {
        password: newPassword
      });
      if (response.data.status === 'success') {
        setSuccessMessage('Password reset successfully! Log in below.');
        setEmail(forgotEmail); // Autofill email
        setPassword(newPassword); // Autofill password
        setLoginView('login');
      }
    } catch (err) {
      console.error(err);
      setLocalError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoggingIn(true);
    dispatch(userActions.loginRequest());

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/login`, { email, password }, {
        withCredentials: true
      });

      const user = response.data.data.user;

      if (user.role !== 'admin' && user.role !== 'staff') {
        // Safe lock: logout immediately and reject unauthorized account
        await axios.get(`${API_BASE_URL}/api/v1/users/logout`, { withCredentials: true });
        dispatch(userActions.logout());
        setLocalError('Unauthorized access. This portal is strictly reserved for administrators.');
      } else {
        dispatch(userActions.loginSuccess(user));
        console.log('✅ Admin authenticated successfully:', user.name);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      dispatch(userActions.loginFail(errMsg));
      setLocalError(errMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/v1/users/logout`, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(userActions.logout());
      setEmail('');
      setPassword('');
      setLocalError('');
    }
  };

  // --- 1. RENDER PORTAL LOGIN PAGE ---
  if (!userInfo) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Gradients */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', top: '10%', left: '10%', opacity: 0.15, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'var(--accent)', filter: 'blur(150px)', bottom: '10%', right: '10%', opacity: 0.1, pointerEvents: 'none' }} />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass"
          style={{
            width: '100%',
            maxWidth: '460px',
            padding: '50px 40px',
            boxShadow: 'var(--shadow)',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Logo / Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              background: 'var(--primary)',
              borderRadius: '14px',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '28px',
              color: 'white',
              boxShadow: '0 8px 20px var(--primary-glow)',
              marginBottom: '16px'
            }}>E</div>
            
            {loginView === 'login' && (
              <>
                <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>
                  EatMore <span className="text-gradient">Admin Portal</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Authentication required to access systems.
                </p>
              </>
            )}

            {loginView === 'forgot' && (
              <>
                <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>
                  Forgot <span className="text-gradient">Password</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Enter email to retrieve security token.
                </p>
              </>
            )}

            {loginView === 'reset' && (
              <>
                <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>
                  Reset <span className="text-gradient">Password</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Choose a new security password.
                </p>
              </>
            )}
          </div>

          {/* Success Alerts */}
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#34d399',
                fontSize: '13px',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}
            >
              <div>{successMessage}</div>
            </motion.div>
          )}

          {/* Error Alerts */}
          {localError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#f87171',
                fontSize: '13px',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}
            >
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <div>{localError}</div>
            </motion.div>
          )}

          {/* 1. LOGIN VIEW */}
          {loginView === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Email Address</label>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <input 
                    type="email" 
                    required
                    placeholder="admin@eatmore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Security Password</label>
                  <span 
                    onClick={() => { setLoginView('forgot'); setLocalError(''); setSuccessMessage(''); }}
                    style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                  <Lock size={18} color="var(--text-muted)" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoggingIn}
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px'
                }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    Enter Systems Portal <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. FORGOT VIEW */}
          {loginView === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Registered Email</label>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <input 
                    type="email" 
                    required
                    placeholder="admin@eatmore.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoggingIn}
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px'
                }}
              >
                {isLoggingIn ? 'Generating Token...' : 'Get Reset Token'} <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span 
                  onClick={() => { setLoginView('login'); setLocalError(''); setSuccessMessage(''); }}
                  style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}
                >
                  Back to Login
                </span>
              </div>
            </form>
          )}

          {/* 3. RESET VIEW */}
          {loginView === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Reset Access Token</label>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                  <KeyRound size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter or paste token here"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Choose New Password</label>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                  <Lock size={18} color="var(--text-muted)" />
                  <input 
                    type="password" 
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoggingIn}
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px'
                }}
              >
                {isLoggingIn ? 'Resetting Password...' : 'Save & Set Password'} <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span 
                  onClick={() => { setLoginView('login'); setLocalError(''); setSuccessMessage(''); }}
                  style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel and Back
                </span>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  // --- 2. RENDER FULL AUTHENTICATED ADMIN CONSOLE ---
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Premium Top Navigation Bar */}
      <nav className="glass" style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1400px',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: '20px'
      }}>
        {/* Left Side Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            background: 'var(--primary)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '18px',
            color: 'white'
          }}>E</div>
          <h2 style={{ fontSize: '20px', margin: 0, color: 'white' }}>
            Eat<span style={{ color: 'var(--primary)' }}>More</span> <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px' }}>SYSTEMS</span>
          </h2>
        </div>

        {/* Right Side Identity & Action */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="glass" style={{ padding: '8px 18px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Active Admin: {userInfo.name}</span>
          </div>

          <button 
            onClick={handleLogout} 
            className="glass" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              color: '#ff4b4b',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 75, 75, 0.15)',
              background: 'rgba(255, 75, 75, 0.05)'
            }}
          >
            <LogOut size={14} />
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* Main Admin Dashboard */}
      <Suspense fallback={<DashboardLoader />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
};

export default App;
