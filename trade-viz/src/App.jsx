import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ArcMap from './components/ArcMap';
import USATradeStats from './components/USATradeStats';
import AboutPage from './components/AboutPage';
import Disclaimer from './components/Disclaimer';
import CalculationsPage from './components/CalculationsPage';
import TariffsPage from './components/TariffsPage';
import ConversePage from './components/ConversePage';
import TechnologiesPage from './components/TechnologiesPage';
import DevPage from './components/DevPage';
import { Analytics } from "@vercel/analytics/react";

// Import Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Navigation component
const Navigation = ({ isMobile }) => {
  return (
    <nav style={{
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-end'
    }}>
      <NavLink to="/"
        className={({ isActive }) => isActive ? 'active-link' : ''}
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem', // Reduced padding
          fontSize: isMobile ? '0.8rem' : '0.9rem', // Reduced font size
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none', // Adjusted for smaller gap
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Globe
      </NavLink>
      <NavLink to="/converse"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Converse
      </NavLink>
      <NavLink to="/stats"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Stats
      </NavLink>
      <NavLink to="/calculations"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Formulas
      </NavLink>
      <NavLink to="/tariffs"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Tariffs
      </NavLink>

      <NavLink to="/about"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        About
      </NavLink>
      <NavLink to="/technologies"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Tech
      </NavLink>
      <NavLink to="/disclaimer"
        style={({ isActive }) => ({
          padding: isMobile ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          backgroundColor: isActive ? '#1e7ac5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: isMobile ? '1 0 calc(33% - 5px)' : 'none',
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        })}>
        Legal
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
          padding: isMobile ? '0.3rem' : '0.6rem', // Reduced header padding
          fontSize: isMobile ? 'clamp(0.9rem, 4vw, 1.3rem)' : '1.3rem', // Smaller header text
          fontWeight: 600,
          borderBottom: '1px solid #333',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '5px' : 0 // Reduced gap
        }}>
          <span style={{ marginBottom: isMobile ? '0.3rem' : 0 }}>USA Trade Flows Visualizer</span>
          <Navigation isMobile={isMobile} />
        </header>
        <main style={{ flex: 1, margin: 0, padding: 0 }}>
          <Routes>
            <Route path="/" element={<ArcMap />} />
            <Route path="/stats" element={<USATradeStats />} />
            <Route path="/calculations" element={<CalculationsPage />} />
            <Route path="/tariffs" element={<TariffsPage />} />
            <Route path="/converse" element={<ConversePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/dev" element={<DevPage />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
          </Routes>
        </main>
        <Analytics />
      </div>
    </BrowserRouter>
  );
}
