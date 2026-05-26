import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { userActions } from './store/slices/userSlice';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import AboutAndContact from './components/AboutAndContact';
import PromoCarousel from './components/PromoCarousel';
import Footer from './components/Footer';

const Checkout = lazy(() => import('./components/Checkout'));

const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: 'var(--text-muted)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--primary)',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span>Loading securely...</span>
  </div>
);


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/users/me', {
          withCredentials: true
        });
        if (response.data.status === 'success' && response.data.data.user) {
          dispatch(userActions.loginSuccess(response.data.data.user));
        }
      } catch (err) {
        console.log('No active session or session has expired.');
        if (localStorage.getItem('userInfo')) {
          dispatch(userActions.logout());
        }
      }
    };

    checkSession();
  }, [dispatch]);

  return (
    <div className="app">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={
            <main className="container" style={{ paddingTop: '100px' }}>
              <Hero />
              <PromoCarousel />
              <Menu />
              <AboutAndContact />
            </main>
          } />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Suspense>
      
      <Footer />
    </div>
  );
}

export default App;
