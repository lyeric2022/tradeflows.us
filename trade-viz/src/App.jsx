import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ArcMap from './components/ArcMap';
import USATradeStats from './components/USATradeStats';
import AboutPage from './components/AboutPage';
import Disclaimer from './components/Disclaimer';
import CalculationsPage from './components/CalculationsPage';
import TariffsPage from './components/TariffsPage';

// Navigation component
const Navigation = ({ isMobile }) => {
  return (
    <nav style={{ 
      display: 'flex', 
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-end'
    }}>
      <NavLink to="/" 
        className={({ isActive }) => isActive ? 'active-link' : ''}
        style={({ isActive }) => ({
          padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
          fontSize: isMobile ? '0.9rem' : '1rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 7px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Globe View
      </NavLink>
      <NavLink to="/stats"
        style={({ isActive }) => ({
          padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
          fontSize: isMobile ? '0.9rem' : '1rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 7px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        USA Stats
      </NavLink>
      <NavLink to="/calculations"
        style={({ isActive }) => ({
          padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
          fontSize: isMobile ? '0.9rem' : '1rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 7px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Learn Calculations
      </NavLink>
      <NavLink to="/tariffs"
        style={({ isActive }) => ({
          padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
          fontSize: isMobile ? '0.9rem' : '1rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 7px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Understand Tariffs
      </NavLink>
      <NavLink to="/about"
        style={({ isActive }) => ({
          padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
          fontSize: isMobile ? '0.9rem' : '1rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 7px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        About
      </NavLink>
      <NavLink to="/disclaimer"
        style={({ isActive }) => ({
          padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
          fontSize: isMobile ? '0.9rem' : '1rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 7px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Disclaimer
      </NavLink>
    </nav>
  );
};

export default function App() {
  // State to track screen size
  const [isMobile, setIsMobile] = useState(false);
  
  // Add a resize listener to detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initialize on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        <header style={{
          padding: isMobile ? '0.5rem' : '1rem',
          fontSize: isMobile ? 'clamp(1rem, 4vw, 1.5rem)' : '1.5rem',
          fontWeight: 600,
          borderBottom: '1px solid #333',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '10px' : 0
        }}>
          <span style={{ marginBottom: isMobile ? '0.5rem' : 0 }}>USA Trade Flows Visualizer</span>
          <Navigation isMobile={isMobile} />
        </header>
        <main style={{ flex: 1, margin: 0, padding: 0 }}>
          <Routes>
            <Route path="/" element={<ArcMap />} />
            <Route path="/stats" element={<USATradeStats />} />
            <Route path="/calculations" element={<CalculationsPage />} />
            <Route path="/tariffs" element={<TariffsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
