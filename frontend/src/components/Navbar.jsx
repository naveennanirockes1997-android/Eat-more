import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { ShoppingCart, User, Search, LogOut, LayoutDashboard, Settings, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';
import OrdersModal from './OrdersModal';
import ProfileModal from './ProfileModal';
import { userActions } from '../store/slices/userSlice';
import { cartActions } from '../store/slices/cartSlice';

const Navbar = () => {
  const searchRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to element based on URL hash (e.g., /menu#itemID)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/menu`, { withCredentials: true });
        const items = res.data.data;
        const filtered = items.filter(item =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search error', err);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/v1/users/logout`, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Backend logout failed:', err);
    }
    dispatch(userActions.logout());
    dispatch(cartActions.clearCart());
  };

  return (
    <>
      <nav className="glass navbar-container" style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
            color: 'white'
          }}>E</div>
          <h2 style={{ fontSize: '24px', margin: 0, color: 'white' }}>Eat<span style={{ color: 'var(--primary)' }}>More</span></h2>
        </Link>

        <div className="navbar-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: '500', textDecoration: 'none' }}>Menu</Link>
          <Link to="/checkout" style={{ fontWeight: '500', textDecoration: 'none' }}>Checkout</Link>
          {userInfo?.role === 'admin' && (
            <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" style={{ fontWeight: '500', textDecoration: 'none', color: 'var(--accent)' }}>Dashboard</a>
          )}
        </div>

        <div className="navbar-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="navbar-search" ref={searchRef} style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none'
              }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.9)',
                borderRadius: '12px',
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 999
              }}>
                {searchResults.map(item => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                      // Use MongoDB _id to perfectly align with Menu card element IDs on the homepage
                      navigate(`/#${item._id}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--glass-border)'
                    }}
                  >
                    {item.itemName}
                  </div>
                ))}
              </div>
            )}
          </div>
            
          <div 
            onClick={() => setIsCartOpen(true)}
            className="glass" 
            style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer', position: 'relative' }}
          >
            <ShoppingCart size={20} />
            {totalQuantity > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '12px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold'
              }}>
                {totalQuantity}
              </span>
            )}
          </div>
          
          {userInfo ? (
            <div className="navbar-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                onClick={() => setIsProfileOpen(true)}
                className="glass" 
                style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid var(--primary-glow)' }}
              >
                <User size={16} />
                <span className="navbar-user-name" style={{ fontSize: '13px', fontWeight: '600' }}>{userInfo.name.split(' ')[0]}</span>
              </div>
              
              <div 
                onClick={() => setIsOrdersOpen(true)}
                className="glass navbar-orders-btn" 
                style={{ padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Orders
              </div>

              <div 
                onClick={handleLogout} 
                className="glass navbar-logout-btn" 
                style={{ 
                  padding: '8px 14px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  color: '#ff4b4b',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: '1px solid rgba(255, 75, 75, 0.1)'
                }}
              >
                LOGOUT
              </div>
            </div>
          ) : (
            <div onClick={() => setIsAuthOpen(true)} className="glass navbar-login-btn" style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
              <User size={20} />
            </div>
          )}

          {/* Hamburger Menu Toggle */}
          <div 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="glass navbar-hamburger" 
            style={{ 
              padding: '8px', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              display: 'none', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <OrdersModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)'
              }}
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass"
              style={{
                width: '80%',
                maxWidth: '300px',
                height: '100%',
                padding: '40px 24px 24px',
                position: 'relative',
                zIndex: 1000,
                borderRadius: '0 24px 24px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
              }}
            >
              {/* Logo / Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--primary)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: 'white'
                }}>E</div>
                <h3 style={{ fontSize: '20px', margin: 0, color: 'white' }}>Eat<span style={{ color: 'var(--primary)' }}>More</span></h3>
              </div>

              {/* Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '18px', fontWeight: '600' }}>Menu</Link>
                <Link to="/checkout" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '18px', fontWeight: '600' }}>Checkout</Link>
                {userInfo?.role === 'admin' && (
                  <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent)' }}>Dashboard</a>
                )}
              </div>

              {/* Search in Mobile Menu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Search Dishes</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px', border: '1px solid var(--glass-border)' }}>
                  <Search size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      outline: 'none',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.95)',
                    borderRadius: '12px',
                    marginTop: '4px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    zIndex: 1001,
                    border: '1px solid var(--glass-border)'
                  }}>
                    {searchResults.map(item => (
                      <div
                        key={item._id}
                        onClick={() => {
                          setSearchTerm('');
                          setSearchResults([]);
                          setIsMobileMenuOpen(false);
                          navigate(`/#${item._id}`);
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--glass-border)',
                          fontSize: '13px'
                        }}
                      >
                        {item.itemName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Section / Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userInfo ? (
                  <>
                    <div 
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px 0', borderTop: '1px solid var(--glass-border)' }}
                    >
                      <User size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{userInfo.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>View Profile</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsOrdersOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="glass" 
                      style={{ padding: '12px', borderRadius: '12px', width: '100%', fontWeight: '600', fontSize: '14px' }}
                    >
                      My Orders
                    </button>

                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }} 
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        width: '100%',
                        background: 'rgba(255, 75, 75, 0.1)',
                        border: '1px solid rgba(255, 75, 75, 0.2)',
                        color: '#ff4b4b',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMobileMenuOpen(false);
                    }} 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <User size={18} /> Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
