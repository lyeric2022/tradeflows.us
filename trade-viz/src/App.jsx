import React, { useState, useEffect } from 'react';
import ArcMap from './components/ArcMap';
import USATradeStats from './components/USATradeStats';
import AboutPage from './components/AboutPage';
import Disclaimer from './components/Disclaimer';
import CalculationsPage from './components/CalculationsPage';
import TariffsPage from './components/TariffsPage';

export default function App() {
  // State for tracking which component to show
  const [activeView, setActiveView] = useState('globe');
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
        <span style={{ marginBottom: isMobile ? '0.5rem' : 0 }}>Trade Visualization Globe</span>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-end'
        }}>
          <button 
            onClick={() => setActiveView('globe')}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1rem',
              backgroundColor: activeView === 'globe' ? '#1e7ac5' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: isMobile ? '1 0 calc(33% - 7px)' : 'none'
            }}
          >
            Globe View
          </button>
          <button 
            onClick={() => setActiveView('stats')}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1rem',
              backgroundColor: activeView === 'stats' ? '#1e7ac5' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: isMobile ? '1 0 calc(33% - 7px)' : 'none'
            }}
          >
            USA Stats
          </button>
          <button 
            onClick={() => setActiveView('calculations')}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1rem',
              backgroundColor: activeView === 'calculations' ? '#1e7ac5' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: isMobile ? '1 0 calc(33% - 7px)' : 'none'
            }}
          >
            Learn Calculations
          </button>
          <button 
            onClick={() => setActiveView('tariffs')}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1rem',
              backgroundColor: activeView === 'tariffs' ? '#1e7ac5' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: isMobile ? '1 0 calc(33% - 7px)' : 'none'
            }}
          >
            Understand Tariffs
          </button>
          <button 
            onClick={() => setActiveView('about')}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1rem',
              backgroundColor: activeView === 'about' ? '#1e7ac5' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: isMobile ? '1 0 calc(33% - 7px)' : 'none'
            }}
          >
            About
          </button>
          <button 
            onClick={() => setActiveView('disclaimer')}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1rem',
              backgroundColor: activeView === 'disclaimer' ? '#1e7ac5' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: isMobile ? '1 0 calc(33% - 7px)' : 'none'
            }}
          >
            Disclaimer
          </button>
        </div>
      </header>
      <main style={{ flex: 1, margin: 0, padding: 0 }}>
        {activeView === 'globe' && <ArcMap />}
        {activeView === 'stats' && <USATradeStats />}
        {activeView === 'calculations' && <CalculationsPage />}
        {activeView === 'tariffs' && <TariffsPage />}
        {activeView === 'about' && <AboutPage />}
        {activeView === 'disclaimer' && <Disclaimer />}
      </main>
    </div>
  );
}
