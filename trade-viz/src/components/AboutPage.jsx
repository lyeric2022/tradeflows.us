import React from 'react';

export default function AboutPage() {
  const featureList = [
    'Interactive tariff rate adjustment from 0% to 50%',
    'Trade retaliation toggle to model reciprocal tariffs',
    'Real-time impact calculation on trade volumes and GDP',
    'Country-specific trade flow analysis',
    'Visualization of both direct and retaliatory trade flows'
  ];

  const dataSources = [
    'UN Comtrade database',
    'WITS (World Integrated Trade Solution)',
    'KEE elasticities for trade impact modeling'
  ];

  const hsCodes = [
    'HS 85: Electrical machinery and equipment (e.g., phones, semiconductors, batteries)',
    'HS 86: Railway locomotives and parts',
    'HS 87: Vehicles other than railway (e.g., cars, trucks, bikes)',
    'HS 88: Aircraft, spacecraft, parts',
    'HS 89: Ships, boats, floating structures',
    'HS 90: Optical, medical, precision instruments (e.g., cameras, microscopes, X-ray machines)'
  ];

  const technologies = [
    'React.js for the user interface',
    'React-Globe.gl for 3D globe visualization',
    'Recharts for statistical charts',
    'Palantir Ontology for data integration',
    'D3.js for data visualization',
    'THREE.js for 3D rendering',
    'Papa Parse for CSV parsing',
    'VS Code for development'
  ];

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
      overflowY: 'auto'
    }}>
      <h1 style={{ 
        color: '#3498db', 
        borderBottom: '3px solid #3498db', 
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        About This Trade Visualization Tool
      </h1>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <p style={{ fontSize: '1.1rem' }}>
          This interactive visualization demonstrates the potential impacts of tariffs on global trade flows, 
          with a focus on United States trade relationships with other countries.
        </p>
        <p>
          Think of it as an economic flight simulator—all of the learning experience, none of the real-world crashes.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#eee', marginTop: 0 }}>What This Tool Shows</h2>
        <p>
          The 3D globe visualization illustrates trade flows between countries, with arc thickness and 
          height representing trade volume. When you adjust the tariff rate slider, the simulation 
          recalculates trade volumes based on economic elasticity factors.
        </p>
        
        <h3 style={{ color: '#3498db' }}>Key Features</h3>
        <ul style={{ 
          paddingLeft: '1.5rem',
          listStyleType: 'none'
        }}>
          {featureList.map((feature, index) => (
            <li key={index} style={{ 
              marginBottom: '0.75rem',
              position: 'relative',
              paddingLeft: '1.5rem'
            }}>
              <span style={{ 
                position: 'absolute',
                left: 0,
                color: '#3498db'
              }}>✓</span>
              {feature}
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
        <h2 style={{ color: '#eee', marginTop: 0 }}>Data Sources & Methodology</h2>
        <p>
          The visualization uses 2023 international trade flow data, focusing on HS codes 85-90.
          The model applies elasticity factors to simulate how trade volumes respond to tariff-induced price changes.
        </p>
        
        <div style={{
          backgroundColor: '#34495e',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          borderLeft: '4px solid #f39c12'
        }}>
          <p style={{ margin: '0', fontSize: '0.95rem' }}>
            <strong>Note on Trade Volume Accuracy:</strong> Due to API limitations, this visualization displays approximately $1.2 trillion in trade volume, 
            covering only select HS codes (85-90). The actual USA trade volume with the world in 2023 was $6.9 trillion.
          </p>
        </div>
        
        <h3 style={{ color: '#3498db' }}>Data Sources</h3>
        <ul style={{ 
          paddingLeft: '1.5rem',
          listStyleType: 'none'
        }}>
          {dataSources.map((source, index) => (
            <li key={index} style={{ 
              marginBottom: '0.75rem',
              position: 'relative',
              paddingLeft: '1.5rem'
            }}>
              <span style={{ 
                position: 'absolute',
                left: 0,
                color: '#3498db'
              }}>•</span>
              {source}
            </li>
          ))}
        </ul>
        
        <h3 style={{ color: '#3498db' }}>Product Categories Covered</h3>
        <ul style={{ 
          paddingLeft: '1.5rem',
          listStyleType: 'none'
        }}>
          {hsCodes.map((code, index) => (
            <li key={index} style={{ 
              marginBottom: '0.75rem',
              position: 'relative',
              paddingLeft: '1.5rem'
            }}>
              <span style={{ 
                position: 'absolute',
                left: 0,
                color: '#3498db'
              }}>•</span>
              {code}
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
        <h2 style={{ color: '#eee', marginTop: 0 }}>The Math Behind the Magic</h2>
        
        <div style={{
          borderLeft: '3px solid #3498db',
          paddingLeft: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#3498db' }}>Trade Flow Impact</h3>
          <p>
            Ever wonder why a 30% tariff doesn't just reduce trade by exactly 30%? That's where elasticity comes in!
          </p>
          <div style={{
            backgroundColor: '#1a2634',
            padding: '0.75rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '1rem',
            color: '#fff'
          }}>
            New Trade = Base Trade × (1 + tariff)<sup>-|elasticity|</sup>
          </div>
          <p>
            Product-specific elasticities range from low (aircraft: 0.11) to high (vehicles: 4.48). 
            Higher elasticity = bigger trade impact!
          </p>
        </div>
        
        <div style={{
          borderLeft: '3px solid #e74c3c',
          paddingLeft: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#e74c3c' }}>Retaliation Effects</h3>
          <p>
            When countries fight back with counter-tariffs, things get spicy! 🔥
          </p>
          <div style={{
            backgroundColor: '#1a2634',
            padding: '0.75rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '1rem',
            color: '#fff'
          }}>
            Retaliation Impact = -0.8 × (1.0 - e<sup>1.8 × rawImpact</sup>)
          </div>
          <p>
            Based on 2018-2020 trade war data, retaliation typically amplifies economic impacts by 60-70%. 
            Turns out trade wars aren't "easy to win" — unless your strategy is "everybody loses."
          </p>
        </div>
        
        <div style={{
          borderLeft: '3px solid #27ae60',
          paddingLeft: '1rem'
        }}>
          <h3 style={{ color: '#27ae60' }}>GDP Impact</h3>
          <div style={{
            backgroundColor: '#1a2634',
            padding: '0.75rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '1rem',
            color: '#fff'
          }}>
            GDP Impact = Trade Impact × Trade-to-GDP Ratio × Impact Factor<br/>
            = Trade Impact × 0.27 × 0.75
          </div>
          <p>
            The 0.75 impact factor accounts for sector dynamics and domestic substitution. Sure, you <em>could</em> buy American... 
            but don't be surprised if your "freedom fridge" costs twice as much.
          </p>
        </div>
        
        <div style={{
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#bbb',
          borderTop: '1px solid #34495e',
          paddingTop: '1rem'
        }}>
          <strong>Sources:</strong> World Bank (2022), USITC, IMF Direction of Trade Statistics, and countless economists 
          who probably need a drink after analyzing trade data.
          <p>
            <em>Note: This model is a simulation based on historical data. Actual economic impacts vary based on complex geopolitical factors, 
            supply chain adjustments, and market conditions. Kind of like how weather forecasts work, but for your wallet.</em>
          </p>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem',
        borderLeft: '4px solid #27ae60'
      }}>
        <h2 style={{ color: '#27ae60', marginTop: 0 }}>Educational Purpose</h2>
        <p>
          This tool is designed for educational purposes to illustrate the complex 
          interconnections in global trade and demonstrate how policy changes like 
          tariffs can have wide-ranging effects throughout the global economy.
        </p>
        <p>
          It serves as a simplified but informative window into the ripple effects of trade policy decisions.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#eee', marginTop: 0 }}>Development & Technologies</h2>
        <ul style={{ 
          paddingLeft: '1.5rem',
          listStyleType: 'none'
        }}>
          {technologies.map((tech, index) => (
            <li key={index} style={{ 
              marginBottom: '0.75rem',
              position: 'relative',
              paddingLeft: '1.5rem'
            }}>
              <span style={{ 
                position: 'absolute',
                left: 0,
                color: '#9b59b6'
              }}>◆</span>
              {tech}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>
          Created by Eric Ly
        </p>
        <a 
          href="https://lyyeric.tech" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          lyyeric.tech
        </a>
        <p style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '0.5rem' }}>
          Feedback and suggestions welcome!
        </p>
      </div>
    </div>
  );
}