import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    address: '123 Culinary Avenue, Food District, NY 10012',
    phone: '+1 (555) 123-4567',
    email: 'support@eatmore.com'
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/settings', { withCredentials: true });
        const data = res.data.data;
        setContactInfo({
          address: data.contactAddress || contactInfo.address,
          phone: data.contactPhone || contactInfo.phone,
          email: data.contactEmail || contactInfo.email
        });
      } catch (err) {
        console.error('Failed to fetch contact settings', err);
      }
    };
    fetchContact();
  }, []);

  return (
    <footer className="glass" style={{ margin: '80px 24px 24px', padding: '60px 40px', borderRadius: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{
              width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px',
              display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '20px', color: 'white'
            }}>E</div>
            <h2 style={{ fontSize: '24px', margin: 0, color: 'white' }}>Eat<span style={{ color: 'var(--primary)' }}>More</span></h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
            Delivering culinary excellence right to your doorstep. Experience the future of dining with real-time tracking, seamless payments, and gourmet flavors.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex', transition: '0.3s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex', transition: '0.3s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="#" style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex', transition: '0.3s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex', transition: '0.3s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link></li>
            <li><a href="#menu" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Explore Menu</a></li>
            <li><Link to="/checkout" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Checkout</Link></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About Us</a></li>
          </ul>
        </div>

        {/* Help & Support */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>Help & Support</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQ</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms & Conditions</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Refund Policy</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>Contact Us</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)' }}>
              <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{contactInfo.address}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Phone size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '14px' }}>{contactInfo.phone}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Mail size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '14px' }}>{contactInfo.email}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>&copy; {new Date().getFullYear()} EatMore Digital Hub. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '16px', filter: 'grayscale(100%)', opacity: 0.6 }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: '16px' }} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '20px' }} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '20px' }} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
