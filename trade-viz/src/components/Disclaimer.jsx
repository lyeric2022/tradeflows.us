import React from 'react';

export default function Disclaimer() {
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1000px', 
      margin: '0 auto',
      color: '#eee',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: 1.6,
      backgroundColor: '#1a2634',
      height: '100%',
      overflowY: 'auto',
      fontSize: '0.95rem'
    }}>
      <h1 style={{ 
        color: '#3498db', 
        borderBottom: '3px solid #3498db', 
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontSize: '1.8rem'
      }}>
        Disclaimer: Educational Simulation
      </h1>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <p style={{ fontSize: '1rem' }}>
          This visualization is an educational tool and simplified model of trade dynamics. 
          Actual economic outcomes depend on numerous factors not fully captured here, including 
          non-tariff barriers, substitution effects, and complex supply chain adjustments.
        </p>
        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#bbb' }}>
          In other words, real global trade is more complicated than fitting the world economy into your browser window.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#e74c3c', marginTop: 0, fontSize: '1.4rem' }}>Limitations of the Model</h2>
        <ul style={{ 
          paddingLeft: '1.5rem',
          listStyleType: 'none'
        }}>
          {[
            'Simplified elasticity assumptions across product categories',
            'Limited data on non-tariff barriers and their effects',
            'Partial equilibrium assumptions that may not hold in large-scale trade disruptions',
            'Absence of dynamic adjustment pathways over time',
            'Limited accounting for substitution effects between trade partners',
            'Focused on HS codes 85-90 due to API limitations'
          ].map((item, index) => (
            <li key={index} style={{ 
              marginBottom: '0.75rem',
              position: 'relative',
              paddingLeft: '1.5rem'
            }}>
              <span style={{ 
                position: 'absolute',
                left: 0,
                color: '#e74c3c',
                fontWeight: 'bold'
              }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '1.4rem' }}>Intended Use</h2>
        <p>
          The data and calculations presented should not be used as the sole basis for business, 
          investment, or policy decisions. Consult with qualified economic and trade policy experts 
          for professional analysis of specific scenarios.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '1.4rem' }}>Data Sources</h2>
        <p>
          This visualization uses 2023 trade flow data from UN Comtrade and WITS (World Integrated Trade Solution), 
          focusing on HS codes 85-90 (electrical machinery, vehicles, aircraft, ships, and optical/medical instruments).
          Elasticity estimates are derived from KEE elasticities published in economic literature.
        </p>
        <p>
          These estimates represent averages across product categories and may not 
          apply equally to all specific trade relationships.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem',
        borderLeft: '4px solid #f39c12'
      }}>
        <h2 style={{ color: '#f39c12', marginTop: 0, fontSize: '1.4rem' }}>No Warranty</h2>
        <p>
          This tool is provided "as is" without warranty of any kind, either express or implied, 
          including, but not limited to, the implied warranties of merchantability, fitness for a 
          particular purpose, or non-infringement.
        </p>
      </div>
      
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#7f8c8d', 
        marginTop: '2rem',
        textAlign: 'center' 
      }}>
        Last updated: April 26, 2025
      </div>
    </div>
  );
}