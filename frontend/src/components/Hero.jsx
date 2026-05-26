import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section style={{
      padding: '80px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'var(--primary)',
        filter: 'blur(150px)',
        opacity: 0.15,
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'var(--accent)',
        filter: 'blur(150px)',
        opacity: 0.1,
        zIndex: -1
      }} />

      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ fontSize: 'clamp(48px, 8vw, 96px)', marginBottom: '24px' }}
      >
        Taste the <span className="text-gradient">Future</span> <br /> of Dining
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '40px' }}
      >
        Experience culinary excellence delivered to your doorstep. Real-time tracking, seamless payments, and gourmet flavors.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ display: 'flex', gap: '20px' }}
      >
        <button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary">Order Now</button>
        <button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} className="glass" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600', color: 'white' }}>Explore Menu</button>
      </motion.div>
    </section>
  );
};

export default Hero;
