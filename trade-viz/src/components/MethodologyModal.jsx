import React from 'react';

/**
 * Modal component explaining the simulation methodology
 */
export default function MethodologyModal({ show, onClose }) {
  if (!show) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 100,
      boxShadow: '0 0 20px rgba(0,0,0,0.8)',
      fontSize: window.innerWidth < 600 ? '14px' : '16px'
    }}>
      <button 
        onClick={onClose} 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1
        }}
      >
        ×
      </button>
      
      <h2 style={{ 
        marginTop: 0, 
        color: '#2196F3', 
        borderBottom: '1px solid #555', 
        paddingBottom: '10px',
        paddingRight: '40px'
      }}>
        Simulation Methodology
      </h2>
      
      <div style={{ 
        lineHeight: 1.5, 
        marginBottom: '20px'
      }}>
        <p>
          This visualization simulates the impact of tariffs on international trade flows based on 
          economic principles of trade elasticity. The model accounts for:
        </p>
        
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Product-specific elasticity values that determine sensitivity to tariffs</li>
          <li>Potential retaliatory tariffs and their cascading effects</li>
          <li>Trade-to-GDP ratio relationships for economic impact estimation</li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#aaa', 
        borderTop: '1px solid #555', 
        paddingTop: '10px' 
      }}>
        <p>
          <strong>Sources:</strong> World Bank, USITC, IMF Direction of Trade Statistics
        </p>
        <p style={{ fontSize: '11px', marginTop: '10px' }}>
          <em>Note: This model is a simulation based on historical data. 
          Actual economic impacts vary based on complex geopolitical factors, supply chain
          adjustments, and market conditions.</em>
        </p>
      </div>
    </div>
  );
}
