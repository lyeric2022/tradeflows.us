import React from 'react';

const TariffsPage = () => {
  // Common styles with enhanced colors and effects
  const cardStyle = {
    background: 'linear-gradient(135deg, #2a3c52 0%, #243547 100%)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(95, 154, 209, 0.2)',
    borderLeft: '4px solid #6aadea',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.2), 0 4px 10px rgba(95, 154, 209, 0.25)'
    }
  };

  const headingStyle = {
    color: '#b8dcff',
    marginTop: 0,
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(184, 220, 255, 0.25)',
    paddingBottom: '0.5rem',
    fontSize: '1.4rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
  };

  const listItemStyle = {
    marginBottom: '0.9rem',
    lineHeight: '1.6'
  };

  const infoBoxStyle = {
    background: 'linear-gradient(to right, rgba(147, 207, 164, 0.1), rgba(147, 207, 164, 0.05))',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    fontSize: '0.95rem',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid rgba(147, 207, 164, 0.2)'
  };

  const exampleStyle = {
    background: 'linear-gradient(to right, rgba(106, 173, 234, 0.12), rgba(106, 173, 234, 0.05))',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    fontSize: '0.95rem',
    borderLeft: '3px solid #6aadea',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
  };

  return (
    <div style={{ 
      padding: '2.5rem', 
      maxWidth: '900px', 
      margin: '0 auto',
      background: 'linear-gradient(150deg, #243245 0%, #1a2535 100%)',
      color: '#e0ebf5',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      borderRadius: '12px',
      minHeight: '100%',
      overflowY: 'auto',
      boxShadow: '0 0 40px rgba(0,0,0,0.2)'
    }}>
      <h1 style={{ 
        color: '#b8dcff',
        textAlign: 'center',
        fontSize: '2.2rem',
        marginBottom: '2.5rem',
        borderBottom: '2px solid #6aadea',
        paddingBottom: '1rem',
        background: 'linear-gradient(to right, #b8dcff, #6aadea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        America's Tariff Strategy & Analysis
      </h1>
      
      {/* Strategy Section */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>
          <span style={{ color: '#6aadea', marginRight: '10px' }}>•</span>
          Core Policy Strategy
        </h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li style={listItemStyle}>
            <strong style={{ color: '#e6c976' }}>America-First Approach:</strong> Shifting focus to domestic manufacturing and reducing import dependence
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: '#e6c976' }}>Trade Balance Goals:</strong> Using tariffs to pressure trading partners into more favorable terms
            <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', opacity: '0.9' }}>
              Note: Economists point out that U.S. trade deficits are primarily driven by macroeconomic factors (saving vs. investment) rather than trade policy. Past broad tariffs reshuffled deficit geography without significantly reducing the overall gap.
            </div>
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: '#e6c976' }}>Government Revenue:</strong> Collection of tariffs as a fiscal measure
            <div style={{ fontSize: '0.9rem', marginTop: '0.3rem', opacity: '0.9' }}>
              Note: Penn Wharton Budget Model shows that every $1 collected in tariff revenue reduces real household income by $1.50–$1.70 once higher prices and economic inefficiency are accounted for.
            </div>
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: '#e6c976' }}>Bargaining Tool:</strong> Using tariffs as leverage in future trade negotiations
          </li>
        </ul>
      </div>
      
      {/* Policy Details Section */}
      <div style={{...cardStyle, borderLeft: '4px solid #ef8c80', background: 'linear-gradient(135deg, #2a3c52 0%, #2c3a49 100%)'}}>
        <h2 style={{...headingStyle, color: '#ffc3b8'}}>
          <span style={{ color: '#ef8c80', marginRight: '10px' }}>•</span>
          Tariff Structure & Calculation
        </h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li style={listItemStyle}>
            <strong style={{ color: '#ef8c80' }}>Base Rate + Country Premiums:</strong> 10% baseline on all imports, with significant additions for specific countries
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: '#ef8c80' }}>Deficit-Based Formula:</strong> Countries with larger trade surpluses against the U.S. would face higher tariffs
          </li>
        </ul>

        <div style={{
          background: 'linear-gradient(to right, rgba(239, 140, 128, 0.15), rgba(239, 140, 128, 0.05))',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          fontSize: '0.95rem',
          borderLeft: '3px solid #ef8c80',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 0.8rem' }}><strong>How the "Deficit Factor" Works:</strong></p>
          <code style={{ 
            display: 'block', 
            padding: '0.7rem', 
            background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.2))', 
            borderRadius: '4px', 
            marginBottom: '0.8rem',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            Tariff = 10% + (Trade Surplus with US ÷ Country GDP) × 20 percentage points
          </code>
          <p style={{ margin: '0' }}>
            <strong>Example:</strong> Mexico's $152B surplus (≈11% of its GDP) → 10% + (0.11×20) ≈ 12%, then political premium lifts it to 25%
          </p>
        </div>
      </div>
      
      {/* Economic Impact Section */}
      <div style={{...cardStyle, borderLeft: '4px solid #7bd4a6', background: 'linear-gradient(135deg, #2a3c52 0%, #293d4d 100%)'}}>
        <h2 style={{...headingStyle, color: '#b8f5d4'}}>
          <span style={{ color: '#7bd4a6', marginRight: '10px' }}>•</span>
          Economic Projections
        </h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#b8f5d4', marginBottom: '0.8rem' }}>Expert Forecasts (5-Year Horizon)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ 
              flex: '1 1 48%', 
              minWidth: '250px', 
              background: 'linear-gradient(to right, rgba(123, 212, 166, 0.15), rgba(123, 212, 166, 0.05))', 
              padding: '0.8rem', 
              borderRadius: '8px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
              border: '1px solid rgba(123, 212, 166, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>Penn Wharton Budget Model:</p>
              <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                <li>GDP: <span style={{ color: '#ef8c80' }}>−6%</span></li>
                <li>Real wages: <span style={{ color: '#ef8c80' }}>−7%</span></li>
                <li>Household cost: <span style={{ color: '#ef8c80' }}>+$2,400/year</span></li>
              </ul>
            </div>
            <div style={{ 
              flex: '1 1 48%', 
              minWidth: '250px', 
              background: 'linear-gradient(to right, rgba(123, 212, 166, 0.15), rgba(123, 212, 166, 0.05))', 
              padding: '0.8rem', 
              borderRadius: '8px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
              border: '1px solid rgba(123, 212, 166, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>Moody's Analytics:</p>
              <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                <li>GDP: <span style={{ color: '#ef8c80' }}>−4 percentage points</span></li>
                <li>Jobs: <span style={{ color: '#ef8c80' }}>−2.7 million</span></li>
                <li>Household cost: <span style={{ color: '#ef8c80' }}>+$1,700-2,000/year</span></li>
              </ul>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', color: '#b8f5d4', marginBottom: '0.8rem' }}>Consumer Price Effects</h3>
        <div style={{
          background: 'linear-gradient(to right, rgba(123, 212, 166, 0.15), rgba(123, 212, 166, 0.05))',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          fontSize: '0.95rem',
          borderLeft: '3px solid #7bd4a6',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 0.5rem' }}><strong>Price Pass-Through Example:</strong></p>
          <ul style={{ margin: '0 0 0.8rem', paddingLeft: '1.2rem' }}>
            <li>A $1,000 imported refrigerator + 25% tariff</li>
            <li>With 90% pass-through rate: Consumer pays <span style={{ color: '#ef8c80' }}>+$225</span></li>
            <li>Across a typical CPI basket: <span style={{ color: '#ef8c80' }}>+1.2 percentage points</span> to inflation</li>
          </ul>
        </div>
      </div>
      
      {/* International Response Section */}
      <div style={{...cardStyle, borderLeft: '4px solid #b69de5', background: 'linear-gradient(135deg, #2a3c52 0%, #2d3c4d 100%)'}}>
        <h2 style={{...headingStyle, color: '#d7c8f7'}}>
          <span style={{ color: '#b69de5', marginRight: '10px' }}>•</span>
          International Response & Supply Chains
        </h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li style={listItemStyle}>
            <strong style={{ color: '#b69de5' }}>Counter-Tariffs:</strong> Trading partners would likely impose retaliatory tariffs on U.S. exports
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: '#b69de5' }}>Supply Chain Shifts:</strong> Companies may redirect production to avoid tariffs
          </li>
        </ul>

        <div style={{ 
          background: 'linear-gradient(to right, rgba(182, 157, 229, 0.15), rgba(182, 157, 229, 0.05))',
          padding: '1rem', 
          borderRadius: '8px',
          marginTop: '1rem',
          fontSize: '0.95rem',
          borderLeft: '3px solid #b69de5',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0' }}>
            <strong>Historical Context:</strong> During the 2018-2020 trade disputes, countries like China, Canada, and the EU imposed retaliatory tariffs on U.S. goods, particularly targeting agriculture ($13.2B in losses) and manufacturing.
          </p>
        </div>
      </div>
      
      {/* Sources Section */}
      <div style={{ 
        background: 'linear-gradient(to right, #34495e, #2c3e50)',
        padding: '1.2rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        marginTop: '2rem',
        textAlign: 'center',
        color: '#b8d3eb',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Sources:</strong> Penn Wharton Budget Model (2023), Moody's Analytics, USDA ERS, World Bank Global Economic Prospects
        </p>
      </div>
    </div>
  );
};

export default TariffsPage;