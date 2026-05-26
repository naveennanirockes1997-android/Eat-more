import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp, DollarSign, 
  Plus, Trash2, Edit2, Check, X, ShieldAlert, Sparkles, UserCheck, RefreshCw, Settings, MessageSquare,
  User, Mail, Lock, KeyRound
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { userActions } from '../store/slices/userSlice';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Admin Profile Edit States
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Initialize admin details
  useEffect(() => {
    if (userInfo) {
      setAdminName(userInfo.name);
      setAdminEmail(userInfo.email);
    }
  }, [userInfo]);

  const handleAdminProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/users/updateMe`,
        { name: adminName, email: adminEmail },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        showToast('Admin profile updated successfully!');
        dispatch(userActions.loginSuccess(res.data.data.user));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update admin profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/users/updateMyPassword`,
        { currentPassword: adminCurrentPassword, newPassword: adminNewPassword },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        showToast('Admin password updated successfully!');
        setAdminCurrentPassword('');
        setAdminNewPassword('');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    aboutUsText: '', contactEmail: '', contactPhone: '', contactAddress: ''
  });
  const [messages, setMessages] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'now' | 'scheduled'
  
  // Message Editing State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  
  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);
  
  // Form State for Menu Item
  const [formData, setFormData] = useState({
    itemName: '',
    itemPrice: '',
    itemDescription: '',
    category: 'Main Course',
    imageUrl: '',
    isAvailable: true
  });
  
  // Notification Toast State
  const [toast, setToast] = useState(null);

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all necessary dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes, usersRes, settingsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/orders`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/menu`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/users`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/settings`),
        axios.get(`${API_BASE_URL}/api/v1/messages`, { withCredentials: true })
      ]);

      setOrders(ordersRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
      setUsers(usersRes.data.data || []);
      if(settingsRes.data.data) setSiteSettings(settingsRes.data.data);
      setMessages(messagesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Error loading dashboard data. Make sure you are logged in as admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup Socket.io client for real-time events
    const socket = io(API_BASE_URL, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server for real-time updates');
    });

    socket.on('newOrder', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      showToast(`🔔 New Order Received! #${newOrder._id.substr(-6)}`, 'info');
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      showToast(`📦 Order status updated to "${updatedOrder.orderStatus}"`, 'success');
    });

    socket.on('orderDeleted', (orderId) => {
      setOrders(prev => prev.filter(o => o._id !== orderId));
      showToast('🗑️ Order removed', 'warning');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- Dynamic Dashboard Metrics ---
  const dynamicMetrics = () => {
    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = orders.length;
    const activeItems = menuItems.filter(item => item.isAvailable).length;
    const totalCustomers = users.filter(u => u.role === 'customer').length;

    return [
      { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: '#4ade80', desc: 'Excluding cancelled orders' },
      { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: '#60a5fa', desc: 'Live placement stream' },
      { title: 'Available Items', value: `${activeItems}/${menuItems.length}`, icon: Package, color: '#f59e0b', desc: 'Gourmet menu items' },
      { title: 'Customers', value: totalCustomers, icon: Users, color: '#a78bfa', desc: 'Registered foodies' },
    ];
  };

  // --- Order Status Styling ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' };
      case 'Preparing': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' };
      case 'Out for Delivery': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' };
      case 'Delivered': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' };
      case 'Cancelled': return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' };
      default: return { bg: 'rgba(255,255,255,0.05)', text: 'white' };
    }
  };

  // --- User Operations ---
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/v1/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      if (res.data.status === 'success') {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showToast('User role updated successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/users/${userId}`, { withCredentials: true });
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast('User deleted successfully.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user.', 'error');
    }
  };

  // --- Order Operations ---
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/v1/orders/${orderId}/status`, { status: newStatus }, { withCredentials: true });
      if (res.data.status === 'success') {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        showToast(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update order status.';
      showToast(`Error: ${errMsg}`, 'error');
    }
  };

  const handleOrderDelete = async (orderId) => {
    if (!window.confirm('Delete this order log permanently?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/orders/${orderId}`, { withCredentials: true });
      setOrders(prev => prev.filter(o => o._id !== orderId));
      showToast('Order log deleted.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete order log.', 'error');
    }
  };

  // --- Menu Operations ---
  const openCreateModal = () => {
    setModalType('create');
    setFormData({
      itemName: '',
      itemPrice: '',
      itemDescription: '',
      category: 'Main Course',
      imageUrl: '',
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalType('edit');
    setCurrentItem(item);
    setFormData({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemDescription: item.itemDescription || '',
      category: item.category || 'Main Course',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setIsModalOpen(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        const res = await axios.post(`${API_BASE_URL}/api/v1/menu`, formData, { withCredentials: true });
        if (res.data.status === 'success') {
          setMenuItems(prev => [res.data.data.item, ...prev]);
          showToast('New menu item created!');
        }
      } else {
        const res = await axios.patch(`${API_BASE_URL}/api/v1/menu/${currentItem.itemID}`, formData, { withCredentials: true });
        if (res.data.status === 'success') {
          setMenuItems(prev => prev.map(item => item.itemID === currentItem.itemID ? res.data.data.item : item));
          showToast('Menu item updated successfully!');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save menu item.', 'error');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedValue = !item.isAvailable;
      const res = await axios.patch(`${API_BASE_URL}/api/v1/menu/${item.itemID}`, { isAvailable: updatedValue }, { withCredentials: true });
      if (res.data.status === 'success') {
        setMenuItems(prev => prev.map(m => m.itemID === item.itemID ? res.data.data.item : m));
        showToast(`Item is now ${updatedValue ? 'Available' : 'Unavailable'}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle availability.', 'error');
    }
  };

  const handleMenuDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/menu/${itemId}`, { withCredentials: true });
      setMenuItems(prev => prev.filter(m => m.itemID !== itemId));
      showToast('Menu item deleted.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete menu item.', 'error');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/v1/settings`, siteSettings, { withCredentials: true });
      if (res.data.status === 'success') {
        setSiteSettings(res.data.data);
        showToast('Site settings updated successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update site settings.', 'error');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/messages/${id}`, { isRead: true }, { withCredentials: true });
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/messages/${id}`, { withCredentials: true });
      setMessages(messages.filter(m => m._id !== id));
      showToast('Review deleted successfully.');
    } catch (err) {
      showToast('Failed to delete review', 'error');
    }
  };

  const handleEditMessage = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/v1/messages/${id}`, { message: editMessageText }, { withCredentials: true });
      setMessages(messages.map(m => m._id === id ? res.data.data : m));
      setEditingMessageId(null);
      showToast('Review updated successfully!');
    } catch (err) {
      showToast('Failed to update review', 'error');
    }
  };

  return (
    <div className="admin-layout-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)', paddingTop: '100px' }}>
      
      {/* 1. Left Sidebar navigation */}
      <div className="glass admin-sidebar" style={{ width: '260px', margin: '20px', borderRadius: '24px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px', position: 'sticky', top: '120px', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
          <Sparkles size={24} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Admin Center</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders Control', icon: ShoppingBag, count: orders.filter(o => o.orderStatus === 'Pending').length },
            { id: 'menu', label: 'Menu Catalog', icon: Package },
            { id: 'users', label: 'User Roles', icon: Users },
            { id: 'settings', label: 'Site Settings', icon: Settings },
            { id: 'messages', label: 'Inbox', icon: MessageSquare, count: messages.filter(m => !m.isRead).length },
            { id: 'profile', label: 'My Account', icon: User },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '600',
                transition: '0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </div>
              {tab.count > 0 && (
                <span style={{ background: '#ff4b4b', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={fetchDashboardData}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500', marginTop: 'auto' }}
        >
          <RefreshCw size={16} />
          Refresh Stats
        </button>
      </div>

      {/* 2. Main Dashboard Panel */}
      <div className="admin-main-panel" style={{ flex: 1, padding: '20px 40px 40px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading live data streams...</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <header className="admin-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
                  Admin <span className="text-gradient">Control Panel</span>
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  {activeTab === 'overview' && 'Real-time performance analytics.'}
                  {activeTab === 'orders' && 'Process orders, track deliveries, and cancel requests.'}
                  {activeTab === 'menu' && 'Manage dishes, prices, availability, and description.'}
                  {activeTab === 'users' && 'Manage roles, staff accounts, and user access.'}
                </p>
              </div>
            </header>

            {/* Render Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                  <div>
                    {/* Metrics Grid */}
                    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                      {dynamicMetrics().map((stat, i) => (
                        <div key={stat.title} className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ background: `${stat.color}20`, padding: '14px', borderRadius: '16px', color: stat.color }}>
                            <stat.icon size={26} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.title}</p>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</h3>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                      {/* Recent Orders Overview */}
                      <div className="glass" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '20px' }}>Active Order Queue</h3>
                          <button onClick={() => setActiveTab('orders')} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Manage All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {orders.slice(0, 5).map(order => {
                            const colors = getStatusColor(order.orderStatus);
                            return (
                              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                <div>
                                  <p style={{ fontWeight: '600' }}>#{order._id.substr(-6).toUpperCase()}</p>
                                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {order.user?.name || 'Guest'} • {order.items.length} items • ${order.totalAmount.toFixed(2)}
                                  </p>
                                </div>
                                <div style={{ padding: '4px 12px', borderRadius: '20px', background: colors.bg, color: colors.text, fontSize: '12px', fontWeight: '600' }}>
                                  {order.orderStatus}
                                </div>
                              </div>
                            );
                          })}
                          {orders.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No orders placed yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Menu Insights */}
                      <div className="glass" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '20px' }}>Dish Inventory Summary</h3>
                          <button onClick={() => setActiveTab('menu')} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Add / Edit</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {menuItems.slice(0, 5).map((item, i) => (
                            <div key={item.itemID} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '600' }}>{item.itemName}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.category}</p>
                              </div>
                              <p style={{ fontWeight: '700', color: 'var(--primary)' }}>${item.itemPrice}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- ORDERS CONTROL TAB --- */}
                {activeTab === 'orders' && (() => {
                  const filteredOrders = orders.filter(order => {
                    if (orderFilter === 'now') return !order.isScheduled;
                    if (orderFilter === 'scheduled') return order.isScheduled;
                    return true;
                  });

                  return (
                    <div className="glass" style={{ padding: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '20px', margin: 0 }}>Order History & Queue</h3>
                        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                          {[
                            { id: 'all', label: 'All Orders' },
                            { id: 'now', label: 'Deliver Now' },
                            { id: 'scheduled', label: 'Booking Orders' }
                          ].map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setOrderFilter(f.id)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                background: orderFilter === f.id ? 'var(--primary)' : 'transparent',
                                color: orderFilter === f.id ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                border: 'none',
                                transition: '0.2s ease'
                              }}
                            >
                              {f.label}
                              {f.id === 'scheduled' && orders.filter(o => o.isScheduled).length > 0 && (
                                <span style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', color: 'white' }}>
                                  {orders.filter(o => o.isScheduled).length}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '14px' }}>
                              <th style={{ padding: '16px' }}>Order ID</th>
                              <th style={{ padding: '16px' }}>Customer</th>
                              <th style={{ padding: '16px' }}>Order Items</th>
                              <th style={{ padding: '16px' }}>Delivery Option</th>
                              <th style={{ padding: '16px' }}>Total Amount</th>
                              <th style={{ padding: '16px' }}>Status</th>
                              <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map(order => (
                              <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>#{order._id.substr(-6).toUpperCase()}</td>
                                <td style={{ padding: '16px' }}>
                                  <div style={{ fontWeight: '600' }}>{order.user?.name || 'Deleted User'}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.user?.email || 'N/A'}</div>
                                </td>
                                <td style={{ padding: '16px', maxWidth: '280px' }}>
                                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {order.items.map(item => (
                                      <span key={item.itemID}>{item.quantity}x {item.itemName}</span>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  {order.isScheduled ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(235, 94, 40, 0.15)', color: 'var(--primary)', fontWeight: 'bold', width: 'fit-content' }}>
                                        📅 Booked
                                      </span>
                                      <span style={{ fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>{order.scheduledDate}</span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.scheduledTime}</span>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontWeight: 'bold', width: 'fit-content' }}>
                                      ⚡ Deliver Now
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>${order.totalAmount.toFixed(2)}</td>
                                <td style={{ padding: '16px' }}>
                                  <select 
                                    value={order.orderStatus}
                                    onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      background: getStatusColor(order.orderStatus).bg,
                                      color: getStatusColor(order.orderStatus).text,
                                      border: 'none',
                                      fontWeight: '600',
                                      outline: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <button 
                                    onClick={() => handleOrderDelete(order._id)}
                                    style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer', padding: '6px' }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                              <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  No orders match this filter.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* --- MENU CATALOG TAB --- */}
                {activeTab === 'menu' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                      <button onClick={openCreateModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                        <Plus size={18} /> Add Menu Item
                      </button>
                    </div>

                    <div className="glass" style={{ padding: '30px', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <th style={{ padding: '16px' }}>Dish</th>
                            <th style={{ padding: '16px' }}>Category</th>
                            <th style={{ padding: '16px' }}>Price</th>
                            <th style={{ padding: '16px' }}>Availability</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuItems.map(item => (
                            <tr key={item.itemID} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '14px' }}>
                              <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden' }}>
                                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{item.itemName}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.itemDescription || 'No description.'}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '12px' }}>
                                  {item.category}
                                </span>
                              </td>
                              <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>${item.itemPrice}</td>
                              <td style={{ padding: '16px' }}>
                                <button 
                                  onClick={() => handleToggleAvailability(item)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '14px',
                                    background: item.isAvailable ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: item.isAvailable ? '#4ade80' : '#f87171',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {item.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
                                </button>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                  <button onClick={() => openEditModal(item)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleMenuDelete(item.itemID)} style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- USER ROLES TAB --- */}
                {activeTab === 'users' && (
                  <div className="glass" style={{ padding: '30px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '14px' }}>
                          <th style={{ padding: '16px' }}>User Details</th>
                          <th style={{ padding: '16px' }}>Email</th>
                          <th style={{ padding: '16px' }}>Account Joined</th>
                          <th style={{ padding: '16px' }}>System Role</th>
                          <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '14px' }}>
                            <td style={{ padding: '16px', fontWeight: 'bold' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '12px' }}>
                                  {u.name.substr(0, 2).toUpperCase()}
                                </div>
                                <span>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>{u.email}</td>
                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <select 
                                value={u.role}
                                onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: u.role === 'admin' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255,255,255,0.05)',
                                  color: u.role === 'admin' ? '#a78bfa' : 'white',
                                  border: 'none',
                                  fontWeight: '600',
                                  outline: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="customer" style={{ color: '#333' }}>Customer</option>
                                <option value="staff" style={{ color: '#333' }}>Staff</option>
                                <option value="admin" style={{ color: '#333' }}>Admin</option>
                              </select>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <button 
                                onClick={() => handleUserDelete(u._id)}
                                style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer', padding: '6px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* --- SETTINGS TAB --- */}
                {activeTab === 'settings' && (
                  <div className="glass" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Settings size={28} className="text-gradient" /> Edit Public Settings
                    </h2>
                    <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      <div>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>About Us Text</label>
                        <textarea 
                          rows="5"
                          value={siteSettings.aboutUsText}
                          onChange={(e) => setSiteSettings({ ...siteSettings, aboutUsText: e.target.value })}
                          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Contact Email</label>
                          <input 
                            type="email" 
                            value={siteSettings.contactEmail}
                            onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                            style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Contact Phone</label>
                          <input 
                            type="text" 
                            value={siteSettings.contactPhone}
                            onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                            style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Physical Address</label>
                        <input 
                          type="text" 
                          value={siteSettings.contactAddress}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contactAddress: e.target.value })}
                          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                        />
                      </div>

                      <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px', marginTop: '10px' }}>
                        Save Changes Live
                      </button>
                    </form>
                  </div>
                )}

                {/* --- INBOX TAB --- */}
                {activeTab === 'messages' && (
                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MessageSquare className="text-gradient" /> Customer Inbox
                    </h2>
                    {messages.length === 0 ? (
                      <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px', color: 'var(--text-muted)' }}>
                        <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: '16px', margin: '0 auto' }} />
                        <p>No messages yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {messages.map(msg => (
                          <div key={msg._id} className="glass" style={{ padding: '24px', borderRadius: '16px', borderLeft: msg.isRead ? 'none' : '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div>
                                <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {msg.name} 
                                  {!msg.isRead && <span style={{ fontSize: '10px', background: 'var(--primary)', padding: '2px 6px', borderRadius: '8px', color: 'white' }}>NEW</span>}
                                </h3>
                                <p style={{ fontSize: '14px', color: 'var(--primary)', margin: '4px 0 0 0' }}>{msg.email}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {!msg.isRead && (
                                    <button onClick={() => handleMarkAsRead(msg._id)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }} title="Mark as Read"><Check size={18} /></button>
                                  )}
                                  <button onClick={() => { setEditingMessageId(msg._id); setEditMessageText(msg.message); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }} title="Edit Review"><Edit2 size={18} /></button>
                                  <button onClick={() => handleDeleteMessage(msg._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete Review"><Trash2 size={18} /></button>
                                </div>
                              </div>
                            </div>
                            
                            {editingMessageId === msg._id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <textarea 
                                  value={editMessageText} 
                                  onChange={(e) => setEditMessageText(e.target.value)}
                                  rows="3"
                                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => setEditingMessageId(null)} className="glass" style={{ padding: '8px 16px', fontSize: '12px', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={() => handleEditMessage(msg._id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Save Changes</button>
                                </div>
                              </div>
                            ) : (
                              <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- ACCOUNT PROFILE TAB --- */}
                {activeTab === 'profile' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', margin: '0 auto', width: '100%' }}>
                    {/* Profile Details Form */}
                    <div className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
                      <h2 style={{ fontSize: '22px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={24} className="text-gradient" /> Profile Information
                      </h2>
                      <form onSubmit={handleAdminProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Admin Full Name</label>
                          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                            <User size={18} color="var(--text-muted)" />
                            <input 
                              type="text" 
                              required
                              value={adminName}
                              onChange={(e) => setAdminName(e.target.value)}
                              style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Email Address</label>
                          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                            <Mail size={18} color="var(--text-muted)" />
                            <input 
                              type="email" 
                              required
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={profileSaving} style={{ padding: '14px', fontSize: '15px', marginTop: '10px' }}>
                          {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
                        </button>
                      </form>
                    </div>

                    {/* Security Password Form */}
                    <div className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
                      <h2 style={{ fontSize: '22px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={24} className="text-gradient" /> Security Credentials
                      </h2>
                      <form onSubmit={handleAdminPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Current Security Password</label>
                          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                            <Lock size={18} color="var(--text-muted)" />
                            <input 
                              type="password" 
                              required
                              placeholder="••••••••"
                              value={adminCurrentPassword}
                              onChange={(e) => setAdminCurrentPassword(e.target.value)}
                              style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Choose New Security Password</label>
                          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px' }}>
                            <KeyRound size={18} color="var(--text-muted)" />
                            <input 
                              type="password" 
                              required
                              placeholder="Min 8 characters"
                              value={adminNewPassword}
                              onChange={(e) => setAdminNewPassword(e.target.value)}
                              style={{ background: 'none', border: 'none', padding: '14px', color: 'white', width: '100%', outline: 'none', fontSize: '14px' }}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={profileSaving} style={{ padding: '14px', fontSize: '15px', marginTop: '10px' }}>
                          {profileSaving ? 'Updating Password...' : 'Apply Security Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 3. Real-time Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 200, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 200, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '16px 28px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 3000,
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <ShieldAlert size={20} />
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Glassmorphic Modal for Add/Edit Menu Item */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="glass"
              style={{ width: '100%', maxWidth: '500px', padding: '40px', position: 'relative', zIndex: 4001, borderRadius: '24px' }}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <h2 style={{ fontSize: '26px', marginBottom: '24px' }}>
                {modalType === 'create' ? 'Create New Dish' : 'Edit Dish Details'}
              </h2>

              <form onSubmit={handleMenuSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', marginTop: '6px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.itemPrice}
                      onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', marginTop: '6px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', marginTop: '6px', outline: 'none' }}
                    >
                      <option value="Rice & Biryani">Rice & Biryani</option>
                      <option value="Starters & Grills">Starters & Grills</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Fast Food">Fast Food</option>
                      <option value="Other Delicacies">Other Delicacies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', marginTop: '6px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Description</label>
                  <textarea 
                    rows="3"
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', marginTop: '6px', outline: 'none', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isAvailable" style={{ fontSize: '14px', cursor: 'pointer' }}>Available in Stock</label>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                  {modalType === 'create' ? 'Add Item' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
