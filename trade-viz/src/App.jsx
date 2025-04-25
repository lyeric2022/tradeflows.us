import React, { useState } from 'react';
import ArcMap from './components/ArcMap';
import USATradeStats from './components/USATradeStats';

export default function App() {
  const [showStats, setShowStats] = useState(false);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      <header style={{
        padding: '1rem',
        fontSize: '1.5rem',
        fontWeight: 600,
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Trade Visualization Globe</span>
        <button 
          onClick={() => setShowStats(!showStats)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2c3e50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showStats ? 'Show Globe' : 'Show USA Stats'}
        </button>
      </header>
      <main style={{ flex: 1, margin: 0, padding: 0 }}>
        {showStats ? <USATradeStats /> : <ArcMap />}
      </main>
    </div>
  );
}
