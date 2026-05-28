import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

const OrdersModal = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/v1/orders/my-orders`, { withCredentials: true });
        setOrders(res.data.data);
      } catch (err) {
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Connect to Socket.io for Real-Time Status Updates
    const socket = io(API_BASE_URL, { withCredentials: true });
    
    socket.on('orderStatusUpdated', (updatedOrder) => {
      // Update the specific order in our state with the fresh data from the admin
      setOrders(prevOrders => 
        prevOrders.map(order => order._id === updatedOrder._id ? updatedOrder : order)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/v1/orders/${orderId}/cancel`, {}, { withCredentials: true });
      if (res.data.status === 'success') {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel the order. Please try again.');
    }
  };

  const getStatusColorAndIcon = (status) => {
    switch (status) {
      case 'Pending': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', icon: <Clock size={16} /> };
      case 'Preparing': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', icon: <Package size={16} /> };
      case 'Out for Delivery': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', icon: <Truck size={16} /> };
      case 'Delivered': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', icon: <CheckCircle size={16} /> };
      case 'Cancelled': return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af', icon: <XCircle size={16} /> };
      default: return { bg: 'rgba(255,255,255,0.05)', text: 'white', icon: <AlertCircle size={16} /> };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass"
            style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 9001, borderRadius: '24px', overflow: 'hidden' }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                <Package className="text-gradient" size={28} /> My Orders
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div className="hide-scrollbar" style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-order-card">
                    <div className="skeleton-order-header">
                      <div className="skeleton-order-info">
                        <div className="skeleton-order-id skeleton-shimmer" />
                        <div className="skeleton-order-date skeleton-shimmer" style={{ marginTop: '6px' }} />
                      </div>
                      <div className="skeleton-order-status skeleton-shimmer" />
                    </div>
                    
                    <div className="skeleton-order-items" style={{ margin: '8px 0' }}>
                      <div className="skeleton-order-item skeleton-shimmer" style={{ width: '80%' }} />
                      <div className="skeleton-order-item skeleton-shimmer" style={{ width: '60%' }} />
                    </div>
                    
                    <div className="skeleton-order-footer">
                      <div className="skeleton-order-total-label skeleton-shimmer" />
                      <div className="skeleton-order-total-price skeleton-shimmer" />
                    </div>
                  </div>
                ))
              ) : error ? (
                <div style={{ textAlign: 'center', color: '#f87171', padding: '40px' }}>{error}</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  <Package size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map(order => {
                  const ui = getStatusColorAndIcon(order.orderStatus);
                  return (
                    <motion.div 
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '20px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Order ID: #{order._id.substr(-6).toUpperCase()}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>{new Date(order.createdAt).toLocaleString()}</p>
                          {order.isScheduled && (
                            <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> Booked: {order.scheduledDate} ({order.scheduledTime})
                            </p>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', 
                          padding: '6px 12px', borderRadius: '20px', 
                          background: ui.bg, color: ui.text, 
                          fontSize: '13px', fontWeight: 'bold' 
                        }}>
                          {ui.icon} {order.orderStatus}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {order.items.map(item => (
                          <div key={item.itemID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{item.quantity}x</span> {item.itemName}</span>
                            <span style={{ color: 'var(--text-muted)' }}>${(item.quantity * item.itemPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Amount</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>${order.totalAmount.toFixed(2)}</span>
                      </div>

                      {order.orderStatus === 'Pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: '0.2s ease',
                            fontSize: '13px'
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrdersModal;
