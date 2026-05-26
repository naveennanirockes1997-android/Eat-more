import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';

const promos = [
  {
    id: 1,
    title: "50% OFF",
    subtitle: "On your first order",
    code: "WELCOME50",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
    video: "/2627bbed9d6c068e50d2aadcca11ddbb1743095925.mp4",
    color: "var(--primary)"
  },
  {
    id: 2,
    title: "BUY 1 GET 1",
    subtitle: "Special Weekend Offer",
    code: "WEEKEND",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200",
    color: "#ff8c00"
  },
  {
    id: 3,
    title: "FREE DELIVERY",
    subtitle: "On orders above $30",
    code: "FREESHIP",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1200",
    color: "#4caf50"
  }
];

const PromoCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % promos.length);
  const prev = () => setCurrent((prev) => (prev - 1 + promos.length) % promos.length);

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden', borderRadius: '24px', marginBottom: '40px' }} className="glass">
      <AnimatePresence mode='wait'>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: promos[current].video ? 'none' : `linear-gradient(to right, rgba(0,0,0,0.8), transparent), url(${promos[current].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px'
          }}
        >
          {promos[current].video && (
            <>
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, 
                  width: '100%', height: '100%', 
                  objectFit: 'cover', 
                  zIndex: -2 
                }}
              >
                <source src={promos[current].video} type="video/mp4" />
              </video>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)', zIndex: -1 }} />
            </>
          )}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: promos[current].color, 
              marginBottom: '16px',
              fontWeight: '700'
            }}>
              <Tag size={20} /> Special Discount
            </div>
            <h2 style={{ fontSize: '60px', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>{promos[current].title}</h2>
            <p style={{ fontSize: '24px', marginBottom: '24px', opacity: 0.8 }}>{promos[current].subtitle}</p>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ 
                border: `2px dashed ${promos[current].color}`, 
                padding: '8px 24px', 
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                CODE: {promos[current].code}
              </div>
              <button className="btn-primary">Claim Now</button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button onClick={prev} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {promos.map((_, i) => (
          <div 
            key={i} 
            onClick={() => setCurrent(i)}
            style={{ 
              width: current === i ? '24px' : '8px', 
              height: '8px', 
              borderRadius: '4px', 
              background: current === i ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
              transition: '0.3s'
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;
