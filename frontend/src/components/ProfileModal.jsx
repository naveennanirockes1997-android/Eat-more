import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, ShieldAlert, ArrowRight, Home, Lock, KeyRound, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { userActions } from '../store/slices/userSlice';

const ProfileModal = ({ isOpen, onClose }) => {
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Tab State: 'details' | 'address' | 'security'
  const [activeTab, setActiveTab] = useState('details');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Prefill user details when modal opens
  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      if (userInfo.savedAddresses && userInfo.savedAddresses.length > 0) {
        setAddress(userInfo.savedAddresses[0]);
      } else {
        setAddress({ street: '', city: '', state: '', zipCode: '' });
      }
    }
  }, [userInfo, isOpen]);

  if (!userInfo) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.patch(
        'http://localhost:5000/api/v1/users/updateMe',
        { name, email },
        { withCredentials: true }
      );

      if (res.data.status === 'success') {
        setSuccessMsg('Profile updated successfully!');
        // Update Redux state
        dispatch(userActions.loginSuccess(res.data.data.user));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.patch(
        'http://localhost:5000/api/v1/users/updateMe',
        { savedAddresses: [address] },
        { withCredentials: true }
      );

      if (res.data.status === 'success') {
        setSuccessMsg('Delivery address updated successfully!');
        dispatch(userActions.loginSuccess(res.data.data.user));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update address.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.patch(
        'http://localhost:5000/api/v1/users/updateMyPassword',
        passwordForm,
        { withCredentials: true }
      );

      if (res.data.status === 'success') {
        setSuccessMsg('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed. Verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass"
            style={{ 
              width: '100%', 
              maxWidth: '550px', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              position: 'relative', 
              zIndex: 8501, 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Sparkles className="text-gradient" size={26} /> User Account Profile
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            {/* Sidebar navigation tabs inside the modal */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
              {[
                { id: 'details', label: 'Basic Info', icon: User },
                { id: 'address', label: 'Saved Address', icon: Home },
                { id: 'security', label: 'Security', icon: Lock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setError(''); setSuccessMsg(''); }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: 'none',
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: '0.2s ease'
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body content */}
            <div style={{ padding: '30px', maxHeight: '60vh', overflowY: 'auto' }}>
              
              {successMsg && (
                <div className="glass" style={{ padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #10b981', color: '#34d399', fontSize: '13px', marginBottom: '20px' }}>
                  {successMsg}
                </div>
              )}

              {error && (
                <div className="glass" style={{ padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', color: '#f87171', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* DETAILS TAB */}
              {activeTab === 'details' && (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                      <User size={18} color="var(--text-muted)" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ background: 'none', border: 'none', padding: '12px', color: 'white', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                      <Mail size={18} color="var(--text-muted)" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ background: 'none', border: 'none', padding: '12px', color: 'white', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    {loading ? 'Saving...' : 'Save Profile Changes'} <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* ADDRESS TAB */}
              {activeTab === 'address' && (
                <form onSubmit={handleUpdateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Street Address</label>
                    <input 
                      type="text" 
                      required
                      placeholder="123 Delicious Lane"
                      value={address.street || ''}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>City</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Food Town"
                        value={address.city || ''}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>State</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Gourmet State"
                        value={address.state || ''}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Zip Code</label>
                    <input 
                      type="text" 
                      required
                      placeholder="12345"
                      value={address.zipCode || ''}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    {loading ? 'Saving...' : 'Update Saved Address'} <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Current Security Password</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                      <Lock size={18} color="var(--text-muted)" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        style={{ background: 'none', border: 'none', padding: '12px', color: 'white', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Choose New Security Password</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                      <KeyRound size={18} color="var(--text-muted)" />
                      <input 
                        type="password" 
                        required
                        placeholder="Min 8 characters"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        style={{ background: 'none', border: 'none', padding: '12px', color: 'white', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    {loading ? 'Saving...' : 'Apply Security Password'} <ArrowRight size={18} />
                  </button>
                </form>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
