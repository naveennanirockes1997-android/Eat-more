import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, ArrowRight, CheckCircle, Loader, AlertCircle, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { cartActions } from '../store/slices/cartSlice';

const Checkout = () => {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '123 Gourmet Way, Culinary District',
    city: 'Foodie City',
    state: 'Gourmet State',
    zipCode: '56789'
  });
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const getNext7Days = () => {
    const days = [];
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const label = d.toLocaleDateString('en-US', options);
      days.push({ value: dateString, label });
    }
    return days;
  };

  const timeSlots = [
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
    '07:00 PM - 09:00 PM',
    '09:00 PM - 11:00 PM'
  ];

  // Payment Selection & Details
  const [paymentType, setPaymentType] = useState('Stripe'); // 'Stripe' | 'PayPal'
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('123');
  const [paypalEmail, setPaypalEmail] = useState('sandbox-customer@eatmore.com');
  const [paypalOrderId, setPaypalOrderId] = useState('PAYID-M987654');

  const handlePay = async () => {
    if (!userInfo) {
      setError('Please log in to place an order.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      setError('Please select a booking date and time slot.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const finalAmount = totalAmount + 5; // adding $5 delivery fee
      let paymentSuccessData = null;

      // 1. Process mock gateway payments in backend APIs
      if (paymentType === 'Stripe') {
        const stripeRes = await axios.post(
          `${API_BASE_URL}/api/v1/payment/process-stripe`,
          {
            amount: finalAmount,
            paymentMethodId: 'pm_card_visa',
            cardDetails: {
              number: cardNumber,
              expiry: cardExpiry,
              cvc: cardCvc
            }
          },
          { withCredentials: true }
        );
        paymentSuccessData = stripeRes.data.paymentIntent;
      } else {
        const paypalRes = await axios.post(
          `${API_BASE_URL}/api/v1/payment/process-paypal`,
          {
            amount: finalAmount,
            paypalOrderId: paypalOrderId
          },
          { withCredentials: true }
        );
        paymentSuccessData = paypalRes.data.capture;
      }

      // 2. If payment succeeds, proceed with placing the order in backend
      const orderItems = items.map(item => ({
        itemID: item.id,
        itemName: item.name,
        itemPrice: item.price,
        imageUrl: item.image,
        category: item.category,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      }));

      const payload = {
        items: orderItems,
        totalAmount: finalAmount,
        deliveryAddress: address,
        paymentMethod: paymentType,
        paymentStatus: 'Paid',
        transactionId: paymentSuccessData.id,
        isScheduled,
        scheduledDate: isScheduled ? scheduledDate : null,
        scheduledTime: isScheduled ? scheduledTime : null
      };

      const response = await axios.post(`${API_BASE_URL}/api/v1/orders`, payload, {
        withCredentials: true
      });

      if (response.data.status === 'success') {
        setOrderSuccess(response.data.data.order);
        dispatch(cartActions.clearCart());
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Transaction failed. Please review payment parameters.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ padding: '120px 24px 40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass" 
          style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
        >
          <div style={{ color: '#4ade80' }}>
            <CheckCircle size={80} />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Order Placed!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Thank you for your order. We are preparing your meal!</p>
          </div>
          
          <div style={{ 
            width: '100%', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '20px', 
            borderRadius: '12px',
            textAlign: 'left',
            fontSize: '14px',
            border: '1px solid var(--glass-border)'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>Order Details:</p>
            <p style={{ marginBottom: '4px' }}><strong>Order ID:</strong> #{orderSuccess._id}</p>
            <p style={{ marginBottom: '4px' }}><strong>Total Amount:</strong> ${orderSuccess.totalAmount.toFixed(2)}</p>
            <p style={{ marginBottom: '4px' }}><strong>Payment Status:</strong> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Paid ({orderSuccess.paymentMethod})</span></p>
            <p style={{ marginBottom: '4px' }}><strong>Delivery to:</strong> {orderSuccess.deliveryAddress.street}, {orderSuccess.deliveryAddress.city}</p>
            {orderSuccess.isScheduled && (
              <p style={{ marginBottom: '4px' }}><strong>Booked for:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>📅 {orderSuccess.scheduledDate} ({orderSuccess.scheduledTime})</span></p>
            )}
          </div>

          <button 
            className="btn-primary" 
            onClick={() => navigate('/')} 
            style={{ width: '100%', padding: '14px', marginTop: '12px' }}
          >
            Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '40px' }}>Secure <span className="text-gradient">Checkout</span></h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shipping Section */}
          <div className="glass" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Truck size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px' }}>Delivery Address</h3>
            </div>
            
            {userInfo ? (
              <div>
                {!isEditingAddress ? (
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{userInfo.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                      {address.street}<br />
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      style={{ color: 'var(--primary)', background: 'none', border: 'none', padding: 0, marginTop: '16px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                    >
                      Change Address
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Street</label>
                      <input 
                        type="text" 
                        value={address.street} 
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>City</label>
                        <input 
                          type="text" 
                          value={address.city} 
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>State</label>
                        <input 
                          type="text" 
                          value={address.state} 
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zip Code</label>
                      <input 
                        type="text" 
                        value={address.zipCode} 
                        onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px' }}
                      />
                    </div>
                    <button 
                      onClick={() => setIsEditingAddress(false)}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '12px', alignSelf: 'flex-start', marginTop: '8px' }}
                    >
                      Save Address
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Please log in to add a delivery address.</p>
            )}
          </div>

          {/* Delivery Scheduling Section */}
          <div className="glass" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Calendar size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px', margin: 0 }}>Delivery Option</h3>
            </div>

            {/* Delivery Option Toggle */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => { setIsScheduled(false); setScheduledDate(''); setScheduledTime(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: !isScheduled ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Truck size={18} /> Deliver Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsScheduled(true);
                  // Auto-select today and first slot if empty
                  const days = getNext7Days();
                  if (days.length > 0) {
                    setScheduledDate(days[0].value);
                  }
                  if (timeSlots.length > 0) {
                    setScheduledTime(timeSlots[0]);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isScheduled ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Clock size={18} /> Booking Order
              </button>
            </div>

            <AnimatePresence>
              {isScheduled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Date Selector Grid */}
                    <div>
                      <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Date</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {getNext7Days().map((day) => {
                          const isSelected = scheduledDate === day.value;
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => setScheduledDate(day.value)}
                              style={{
                                padding: '10px 4px',
                                borderRadius: '8px',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                background: isSelected ? 'hsla(31, 95%, 55%, 0.15)' : 'rgba(255,255,255,0.02)',
                                color: isSelected ? 'var(--primary)' : 'white',
                                fontSize: '12px',
                                fontWeight: isSelected ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: '0.2s ease',
                                textAlign: 'center'
                              }}
                            >
                              {day.label.split(',')[0]}
                              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '2px' }}>
                                {day.label.split(',')[1]}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slot Grid */}
                    <div>
                      <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Time Slot</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {timeSlots.map((slot) => {
                          const isSelected = scheduledTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setScheduledTime(slot)}
                              style={{
                                padding: '12px 8px',
                                borderRadius: '8px',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                background: isSelected ? 'hsla(31, 95%, 55%, 0.15)' : 'rgba(255,255,255,0.02)',
                                color: isSelected ? 'var(--primary)' : 'white',
                                fontSize: '12px',
                                fontWeight: isSelected ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: '0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <Clock size={14} style={{ opacity: 0.7 }} />
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Section */}
          <div className="glass" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <CreditCard size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px' }}>Payment Method</h3>
            </div>

            {/* Selector Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {['Stripe', 'PayPal'].map(type => (
                <button
                  key={type}
                  onClick={() => { setPaymentType(type); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: paymentType === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: '0.2s ease'
                  }}
                >
                  {type === 'Stripe' ? 'Stripe (Card)' : 'PayPal Sandbox'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paymentType === 'Stripe' ? (
                <>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expiration</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CVC</label>
                      <input 
                        type="text" 
                        value={cardCvc} 
                        onChange={(e) => setCardCvc(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Sandbox Decline Info */}
                  <div className="glass" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: '#f87171' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span><strong>Sandbox Tip:</strong> Keep ending in `4242` for success. Change to end in `4243` to test payment failure (decline).</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PayPal Account Email</label>
                    <input 
                      type="email" 
                      value={paypalEmail} 
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PayPal Order ID</label>
                    <input 
                      type="text" 
                      value={paypalOrderId} 
                      onChange={(e) => setPaypalOrderId(e.target.value)}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginTop: '4px', outline: 'none' }}
                    />
                  </div>

                  {/* PayPal Sandbox Decline Info */}
                  <div className="glass" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: '#fbbf24' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span><strong>PayPal Tip:</strong> Type `fail` in the Order ID (e.g. `PAYID-FAIL`) to simulate a transaction rejection.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass" style={{ padding: '30px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No items in cart.</p>
            ) : (
              items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.name}</span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
          
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
              <span>$5.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', marginTop: '8px' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${items.length > 0 ? (totalAmount + 5).toFixed(2) : '0.00'}</span>
            </div>
          </div>

          {error && <p style={{ color: '#ff4b4b', fontSize: '14px', marginTop: '16px', textAlign: 'center', lineHeight: '1.4' }}>{error}</p>}

          <button 
            className="btn-primary" 
            disabled={isProcessing || items.length === 0 || !userInfo}
            onClick={handlePay}
            style={{ width: '100%', marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin" size={20} />
                Verifying Payment...
              </>
            ) : (
              <>
                Pay With {paymentType} <ArrowRight size={20} />
              </>
            )}
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', color: 'var(--accent)', fontSize: '12px' }}>
            <ShieldCheck size={16} />
            <span>Secure 256-Bit SSL Encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
