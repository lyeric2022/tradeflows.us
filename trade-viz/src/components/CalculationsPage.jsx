import React from 'react';

const CalculationsPage = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>The Math Behind the Magic</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Trade Flow Impact</h3>
        <p>Tariffs don't reduce trade linearly - elasticity determines the actual impact:</p>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60px'
        }}>
          <p style={{ 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#000000'
          }}>
            New Trade = Base Trade × (1 + tariff)<sup>-|elasticity|</sup>
          </p>
        </div>
        <p>Elasticity varies by product: from low (aircraft: 0.11) to high (vehicles: 4.48).</p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Retaliation Effects</h3>
        <p>Counter-tariffs amplify economic impacts:</p>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60px'
        }}>
          <p style={{ 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#000000'
          }}>
            Retaliation Impact = -0.8 × (1.0 - e<sup>1.65 × rawImpact</sup>)
          </p>
        </div>
        <p>Based on 2018-2020 data, retaliation typically amplifies economic impacts by 60-70%.</p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>GDP Impact</h3>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80px'
        }}>
          <p style={{ 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            fontSize: '1.1rem',
            margin: '5px 0',
            color: '#000000'
          }}>
            GDP Impact = Trade Impact × Trade-to-GDP Ratio × Impact Factor
          </p>
          <p style={{ 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            fontSize: '1.1rem',
            margin: '5px 0',
            color: '#000000'
          }}>
            = Trade Impact × 0.27 × 0.75
          </p>
        </div>
        <p>The 0.75 impact factor accounts for sector dynamics and domestic substitution.</p>
      </div>
      
      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '2rem' }}>
        <p>Sources: World Bank (2022), USITC, IMF Direction of Trade Statistics</p>
        <p>Note: This model is a simulation based on historical data. Actual impacts vary based on geopolitical factors, supply chain adjustments, and market conditions.</p>
      </div>
    </div>
  );
};

export default CalculationsPage;