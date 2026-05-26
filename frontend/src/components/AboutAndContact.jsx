import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, CheckCircle, Star, User, Utensils, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutAndContact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', rating: 5, foodItem: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });
  const [reviews, setReviews] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -344 : 344;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const fetchData = async () => {
    try {
      const [reviewsRes, menuRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/messages'),
        axios.get('http://localhost:5000/api/v1/menu')
      ]);
      setReviews(reviewsRes.data.data);
      setMenuItems(menuRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await axios.post('http://localhost:5000/api/v1/messages', formData);
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', message: '', rating: 5, foodItem: '' });
      fetchData(); // Refresh reviews list
      setTimeout(() => setStatus(s => ({ ...s, success: false })), 5000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.message || 'Failed to submit review.' 
      });
    }
  };

  return (
    <section id="reviews" className="container" style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', gap: '60px' }}>
      
      {/* Display Reviews Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', textAlign: 'center', margin: 0 }}>Customer <span className="text-gradient">Reviews</span></h2>
          
          {reviews.length > 0 && (
            <div style={{ position: 'absolute', right: '0', display: 'flex', gap: '10px' }}>
              <button onClick={() => scroll('left')} className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}><ChevronLeft size={20} /></button>
              <button onClick={() => scroll('right')} className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
        
        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No reviews yet. Be the first to share your experience!</p>
        ) : (
          <div ref={carouselRef} className="hide-scrollbar" style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
            {reviews.map((review, idx) => (
              <motion.div 
                key={review._id}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }}
                className="glass"
                style={{ minWidth: '320px', maxWidth: '350px', padding: '24px', borderRadius: '24px', flexShrink: 0, display: 'flex', flexDirection: 'column', scrollSnapAlign: 'start' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px', color: '#fbbf24' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (review.rating || 5) ? "currentColor" : "none"} color={i < (review.rating || 5) ? "currentColor" : "rgba(255,255,255,0.2)"} />
                    ))}
                  </div>
                  {review.foodItem && (
                    <span style={{ fontSize: '12px', background: 'rgba(255,138,0,0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      {review.foodItem}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, fontStyle: 'italic', marginBottom: '24px' }}>
                  "{review.message}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{review.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Form Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="glass" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '800px', margin: '0 auto' }}
      >
        <div style={{ margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}><span className="text-gradient">Give your review</span> on food item</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>We value your feedback. Let us know how your food was!</p>
          
          {status.success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#34d399', textAlign: 'center' }}>
              <CheckCircle size={48} />
              <h3 style={{ fontSize: '20px', margin: 0 }}>Review Submitted Successfully!</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Thank you for your valuable feedback.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {status.error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '12px', fontSize: '14px' }}>
                  {status.error}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
                {/* Select Food Item */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <Utensils size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select 
                    value={formData.foodItem}
                    onChange={(e) => setFormData({...formData, foodItem: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '16px 40px 16px 48px', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--glass-border)', 
                      borderRadius: '12px', 
                      color: formData.foodItem ? 'white' : 'var(--text-muted)', 
                      outline: 'none', 
                      appearance: 'none', 
                      WebkitAppearance: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="" style={{ color: '#333' }}>Select Food Item (Optional)</option>
                    {menuItems.map(item => (
                      <option key={item.itemID || item._id} value={item.itemName} style={{ color: '#333' }}>{item.itemName}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                </div>
                
                {/* Star Rating Interactive */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Rating:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={24} 
                        fill={star <= formData.rating ? "#fbbf24" : "none"} 
                        color={star <= formData.rating ? "#fbbf24" : "rgba(255,255,255,0.2)"} 
                        style={{ cursor: 'pointer', transition: '0.2s' }}
                        onClick={() => setFormData({...formData, rating: star})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <textarea 
                placeholder="Write your review here..." 
                rows="5"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical' }}
              />
              <button 
                type="submit" 
                disabled={status.loading}
                className="btn-primary" 
                style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '16px' }}
              >
                {status.loading ? 'Submitting...' : 'Submit Review'} <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </motion.div>

    </section>
  );
};

export default AboutAndContact;
