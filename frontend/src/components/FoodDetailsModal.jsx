import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Flame, ShoppingBag, Tag, Gift, Sparkles } from 'lucide-react';

const FoodDetailsModal = ({ item, isOpen, onClose, onAddToCart, allItems = [] }) => {
  if (!item) return null;

  // Filter recommendations (same category, different item), max 3
  const recommendations = allItems
    .filter(i => i.category === item.category && i.itemID !== item.itemID)
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass hide-scrollbar"
            style={{
              width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', zIndex: 3001, borderRadius: '24px'
            }}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', zIndex: 10, cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Top Section: Main Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              <div style={{ height: '400px' }}>
                <img 
                  src={(item.imageUrl && !item.imageUrl.endsWith('/')) ? item.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
                  alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                    {item.category}
                  </span>
                  <h2 style={{ fontSize: '32px', marginTop: '12px', marginBottom: '8px' }}>{item.itemName}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} color="var(--primary)" fill="var(--primary)" /> {item.rating || 4.8} ({item.reviews || 120} Reviews)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={16} /> 25-30 min
                    </div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {item.itemDescription || 'Enjoy this chef-recommended delicacy prepared with organic ingredients and traditional spices. A perfect balance of flavors that will leave you wanting more.'}
                </p>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4b4b' }}>
                    <Flame size={20} /> <span style={{ fontSize: '14px', fontWeight: '600' }}>450 Cal</span>
                  </div>
                  <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
                  <div style={{ fontWeight: '700', fontSize: '28px', color: 'var(--primary)' }}>${item.itemPrice}</div>
                </div>
                <button 
                  onClick={() => { onAddToCart(item); onClose(); }}
                  className="btn-primary" 
                  style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px' }}
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>
            </div>

            {/* Bottom Section: Offers & Recommendations */}
            <div style={{ padding: '40px', borderTop: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', background: 'rgba(0,0,0,0.2)' }}>
              
              {/* Offers & Coupons */}
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={20} className="text-gradient" /> Special Offers & Coupons
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#34d399', fontSize: '16px' }}>20% OFF</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Use code at checkout</p>
                    </div>
                    <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '1px', color: 'white' }}>EAT20</span>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 138, 0, 0.1)', border: '1px dashed var(--primary)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '16px' }}>FREE DELIVERY</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>On orders above $50</p>
                    </div>
                    <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '1px', color: 'white' }}>FREEDEL</span>
                  </div>
                </div>
              </div>

              {/* Recommended Items */}
              {recommendations.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} className="text-gradient" /> You Might Also Like
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recommendations.map(rec => (
                      <div key={rec.itemID} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <img 
                          src={(rec.imageUrl && !rec.imageUrl.endsWith('/')) ? rec.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
                          alt={rec.itemName} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '15px' }}>{rec.itemName}</h4>
                          <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>${rec.itemPrice}</span>
                        </div>
                        <button 
                          onClick={() => { onAddToCart(rec); }}
                          style={{ padding: '8px', borderRadius: '50%', background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FoodDetailsModal;
