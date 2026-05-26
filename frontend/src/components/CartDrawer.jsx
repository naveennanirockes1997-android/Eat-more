import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { cartActions } from '../store/slices/cartSlice';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const addItemHandler = (item) => {
    dispatch(cartActions.addItemToCart(item));
  };

  const removeItemHandler = (id) => {
    dispatch(cartActions.removeItemFromCart(id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)'
            }}
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '450px',
              height: '100%',
              padding: '30px',
              position: 'relative',
              zIndex: 2001,
              borderRadius: '24px 0 0 24px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px' }}>Your <span className="text-gradient">Cart</span></h2>
              <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {items.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.2 }} />
                  <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.<br />Time to add some flavor!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {items.map((item) => (
                    <div key={item.id} className="glass" style={{ padding: '12px', display: 'flex', gap: '16px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '4px' }}>{item.name}</h4>
                        <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '12px' }}>${item.price}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => removeItemHandler(item.id)}
                            className="glass" 
                            style={{ padding: '4px', borderRadius: '6px' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: '600' }}>{item.quantity}</span>
                          <button 
                            onClick={() => addItemHandler(item)}
                            className="glass" 
                            style={{ padding: '4px', borderRadius: '6px' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>${totalAmount.toFixed(2)}</span>
                </div>
                <Link to="/checkout" onClick={onClose} style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '16px' }}>
                    Checkout Now
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
