import React, { useRef } from 'react';

/**
 * Tariff control panel component with slider, retaliation toggle, and impact display
 * 
 * @param {number} tariffRate - Current tariff rate (0-1.5)
 * @param {function} setTariffRate - Function to update tariff rate
 * @param {boolean} retaliationEnabled - Whether retaliation is enabled
 * @param {function} setRetaliationEnabled - Function to toggle retaliation
 * @param {number} tradePctChange - Calculated trade percentage change
 * @param {number} gdpPctImpact - Calculated GDP impact percentage
 * @param {function} onShowMethodology - Function to show methodology modal
 */
const TariffControls = ({ 
  tariffRate, 
  setTariffRate, 
  retaliationEnabled, 
  setRetaliationEnabled,
  tradePctChange,
  gdpPctImpact,
  onShowMethodology,
  showMethodology  // Add this prop to receive current state
}) => {
  // Add a lastClickTime ref to track double clicks
  const lastClickTimeRef = useRef(0);

  // Modify the methodology button click handler to toggle visibility
  const handleMethodologyClick = () => {
    // Toggle methodology visibility (if it's shown, hide it; if hidden, show it)
    onShowMethodology(!showMethodology);
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: 10, 
      left: 10, 
      zIndex: 1, 
      background: 'rgba(0,0,0,0.6)', 
      padding: '12px', 
      borderRadius: '4px' 
    }}>
      <label style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>
        Tariff rate: {(tariffRate * 100).toFixed(0)}%
      </label>
      <input
        type="range"
        min={0}
        max={1.5}
        step={0.01}
        value={tariffRate}
        onChange={e => setTariffRate(Number(e.target.value))}
        style={{ width: '200px', display: 'block' }}
      />
      
      {/* Retaliation toggle */}
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center' }}>
        <label style={{ color: '#fff', marginRight: '10px' }}>
          Retaliation:
        </label>
        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
          <input 
            type="checkbox" 
            checked={retaliationEnabled}
            onChange={e => setRetaliationEnabled(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{ 
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: retaliationEnabled ? '#2196F3' : '#ccc',
            transition: '.4s',
            borderRadius: '12px'
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '16px',
              width: '16px',
              left: '4px',
              bottom: '4px',
              backgroundColor: 'white',
              transition: '.4s',
              borderRadius: '150%',
              transform: retaliationEnabled ? 'translateX(22px)' : 'translateX(0)'
            }}></span>
          </span>
        </label>
      </div>
      
      <div style={{ color: '#fff', marginTop: '8px', fontSize: '14px' }}>
        <div>
          Trade Δ: <span style={{ color: tradePctChange < 0 ? '#ff8080' : '#80ff80' }}>{tradePctChange.toFixed(2)}%</span>
          {retaliationEnabled && <span style={{ color: '#ff9966', marginLeft: '5px' }}> (with retaliation)</span>}
        </div>
        <div>
          USA GDP Impact (est.): <span style={{ color: gdpPctImpact < 0 ? '#ff8080' : '#80ff80' }}>{gdpPctImpact.toFixed(2)}%</span>
          {retaliationEnabled && <span style={{ color: '#ff9966', marginLeft: '5px' }}> (with retaliation)</span>}
        </div>
        <div style={{ marginTop: '8px', textAlign: 'left' }}>
          <button
            onClick={handleMethodologyClick}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#2196F3', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '12px',
              padding: 0
            }}
          >
            {showMethodology ? "Hide calculations" : "Learn more"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TariffControls;