import React from 'react';

/**
 * Modal component explaining the calculation methodology
 * with a sprinkle of Trump-era tariff jokes
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
        The Math Behind the Magic
      </h2>
      
      <div style={{ 
        lineHeight: 1.5, 
        marginBottom: '20px',
        paddingRight: window.innerWidth < 600 ? '0' : '10px' 
      }}>
        <h3 style={{ color: '#2196F3', marginBottom: '8px' }}>Trade Flow Impact</h3>
        <p>
          Ever wonder why a 30% tariff doesn't just reduce trade by exactly 30%? 
          That's where <strong>elasticity</strong> comes in! (And no, it's not just about "winning so much you'll get tired of winning.")
        </p>
        
        <div style={{ 
          backgroundColor: 'rgba(33, 150, 243, 0.1)', 
          padding: '10px', 
          borderRadius: '5px',
          marginTop: '10px',
          marginBottom: '15px',
          fontFamily: 'monospace',
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}>
          <strong>New Trade</strong> = Base Trade × (1 + tariff)<sup>-|elasticity|</sup>
        </div>
        
        <p>
          Product-specific elasticities range from low (aircraft: 0.11) to high (vehicles: 4.48).
          Higher elasticity = bigger trade impact! It's almost like tariffs are more complex than just "beautiful, beautiful deals."
        </p>
      </div>
      
      <div style={{ 
        lineHeight: 1.5, 
        marginBottom: '20px' 
      }}>
        <h3 style={{ color: '#2196F3', marginBottom: '8px' }}>Retaliation Effects</h3>
        <p>
          When countries fight back with counter-tariffs, things get spicy! 🔥
          (Way spicier than expected, almost like nobody thought China would actually clap back.)
        </p>
        
        <div style={{ 
          backgroundColor: 'rgba(33, 150, 243, 0.1)', 
          padding: '10px', 
          borderRadius: '5px',
          marginTop: '10px',
          marginBottom: '15px',
          fontFamily: 'monospace',
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}>
          <strong>Retaliation Impact</strong> = -0.8 × (1.0 - e<sup>1.8 × rawImpact</sup>)
        </div>
        
        <p>
          Based on 2018-2020 trade war data, retaliation typically amplifies 
          economic impacts by 60-70%. Turns out trade wars aren't “easy to win” — unless your strategy is “everybody loses.”
        </p>
      </div>
      
      <div style={{ 
        lineHeight: 1.5, 
        marginBottom: '20px' 
      }}>
        <h3 style={{ color: '#2196F3', marginBottom: '8px' }}>GDP Impact</h3>
        
        <div style={{ 
          backgroundColor: 'rgba(33, 150, 243, 0.1)', 
          padding: '10px', 
          borderRadius: '5px',
          marginTop: '10px',
          marginBottom: '15px',
          fontFamily: 'monospace',
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}>
          <strong>GDP Impact</strong> = Trade Impact × Trade-to-GDP Ratio × Impact Factor<br/>
          = Trade Impact × 0.27 × 0.75
        </div>
        
        <p>
          The 0.75 impact factor accounts for sector dynamics and domestic substitution.
          Sure, you *could* buy American... but don’t be surprised if your “freedom fridge” costs twice as much.
        </p>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#aaa', 
        borderTop: '1px solid #555', 
        paddingTop: '10px' 
      }}>
        <p>
          <strong>Sources:</strong> World Bank (2022), USITC, IMF Direction of Trade Statistics, and 
          countless economists who probably need a drink after analyzing trade data (or two if they lived through 2018).
        </p>
        <p style={{ fontSize: '11px', marginTop: '10px' }}>
          <em>Note: This model is a simulation based on historical data. 
          Actual economic impacts vary based on complex geopolitical factors, supply chain
          adjustments, and market conditions. Kind of like how weather forecasts work,
          but for your wallet.</em>
        </p>
      </div>
    </div>
  );
}
