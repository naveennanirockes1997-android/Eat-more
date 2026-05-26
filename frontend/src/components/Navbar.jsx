import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, User, Search, LogOut, LayoutDashboard, Settings } from 'lucide-react';
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
        const res = await axios.get('http://localhost:5000/api/v1/menu', { withCredentials: true });
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
      await axios.get('http://localhost:5000/api/v1/users/logout', {
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
      <nav className="glass" style={{
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

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: '500', textDecoration: 'none' }}>Menu</Link>
          <Link to="/checkout" style={{ fontWeight: '500', textDecoration: 'none' }}>Checkout</Link>
          {userInfo?.role === 'admin' && (
            <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" style={{ fontWeight: '500', textDecoration: 'none', color: 'var(--accent)' }}>Dashboard</a>
          )}
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div ref={searchRef} style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                onClick={() => setIsProfileOpen(true)}
                className="glass" 
                style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid var(--primary-glow)' }}
              >
                <User size={16} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{userInfo.name.split(' ')[0]}</span>
              </div>
              
              <div 
                onClick={() => setIsOrdersOpen(true)}
                className="glass" 
                style={{ padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Orders
              </div>

              <div 
                onClick={handleLogout} 
                className="glass" 
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
            <div onClick={() => setIsAuthOpen(true)} className="glass" style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
              <User size={20} />
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <OrdersModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Navbar;
