import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import './MainLayout.css';

function MainLayout({ children }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return (
    <div className="main-layout">
      <Navbar />
      <main className="container container--width" style={{ minHeight: '70vh' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout; 