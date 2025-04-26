import React from 'react';

const TariffsPage = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Understanding Trump's Tariff Strategy</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Intended Strategy</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Economic Nationalism:</strong> Prioritizing domestic production and reducing reliance on imports</li>
          <li><strong>Deficit Reduction:</strong> Using tariffs as leverage to renegotiate trade terms and reduce trade deficits</li>
          <li><strong>Revenue Generation:</strong> Replacing some tax revenue with tariff income, despite economist concerns</li>
          <li><strong>Negotiation Tactic:</strong> Using tariffs as pressure to secure more favorable trade agreements</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Key Policy Elements</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Universal Tariffs:</strong> 10-20% baseline on all imports, with targeted increases (60% on China, 100% on Mexico and foreign-made cars)</li>
          <li><strong>Reciprocal Approach:</strong> Tariff rates calculated based on bilateral trade deficits</li>
          <li><strong>Manufacturing Focus:</strong> Designed to incentivize domestic production</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Economic Impacts</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>GDP Effect:</strong> Projected 6% reduction in long-term U.S. GDP</li>
          <li><strong>Consumer Costs:</strong> Average household may face $5,200 annual cost increase</li>
          <li><strong>Broader Effects:</strong> Increased inflation risks and potential recessionary pressure</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>International Response</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Trade Partners:</strong> Retaliatory tariffs from China and strained relations with allies</li>
          <li><strong>Supply Chains:</strong> Global companies shifting production locations to mitigate tariff impacts</li>
        </ul>
      </div>
      
      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '2rem' }}>
        <p>Data sources: Penn Wharton Budget Model, Center for American Progress, World Bank</p>
      </div>
    </div>
  );
};

export default TariffsPage;