import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const CalculationsPage = () => {
  // --- Responsive helper ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // --- Styled components ---
  const Container = ({ children }) => (
    <div style={{
      padding: isMobile ? '1.5rem' : '2.5rem',
      maxWidth: 1200, 
      margin: '0 auto',
      color: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: 1.7,
      backgroundColor: '#1a2634',
      height: '100%', 
      overflowY: 'auto'
    }}>
      {children}
    </div>
  );

  const PageTitle = ({ children }) => (
    <h1 style={{
      color: '#3498db',
      borderBottom: '3px solid #3498db',
      paddingBottom: '1rem',
      marginBottom: '2.5rem',
      textAlign: 'center',
      fontSize: isMobile ? '2rem' : '2.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,.3)',
      letterSpacing: '0.5px'
    }}>
      {children}
    </h1>
  );

  const Section = ({ title, iconColor = '#3498db', children }) => (
    <div style={{
      backgroundColor: '#2c3e50',
      padding: isMobile ? '1.5rem' : '2rem',
      borderRadius: 12,
      boxShadow: '0 6px 20px rgba(0,0,0,.2)',
      marginBottom: '2.8rem',
      borderLeft: `5px solid ${iconColor}`,
      transition: 'all .3s ease',
      transform: 'translateY(0)',
      ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 10px 25px rgba(0,0,0,.25)'
      }
    }}>
      <h2 style={{
        color: '#fff', 
        marginTop: 0,
        marginBottom: '1.2rem',
        fontSize: isMobile ? '1.5rem' : '1.7rem',
        borderBottom: '1px solid rgba(52,152,219,.3)',
        paddingBottom: '.7rem'
      }}>
        <span style={{ color: iconColor, marginRight: '8px' }}>▶</span> {title}
      </h2>
      {children}
    </div>
  );

  const Formula = ({ children, align = 'center' }) => (
    <div style={{
      backgroundColor: '#1a2634',
      padding: '1.5rem',
      borderRadius: 10,
      display: 'flex',
      justifyContent: align,
      alignItems: 'center',
      minHeight: 80,
      boxShadow: 'inset 0 0 12px rgba(0,0,0,.4)',
      border: '2px solid #3498db',
      margin: '1.5rem 0',
      transition: 'all 0.2s ease',
      ':hover': {
        boxShadow: 'inset 0 0 15px rgba(0,0,0,.5)',
        borderColor: '#2980b9'
      }
    }}>
      {children}
    </div>
  );

  const KatexFormula = ({ formula }) => (
    <Formula>
      <BlockMath math={formula} />
    </Formula>
  );

  const Paragraph = ({ children, size = '1.05rem' }) => (
    <p style={{ 
      fontSize: size, 
      lineHeight: 1.7,
      marginBottom: '1.2rem',
      color: '#f5f5f5'
    }}>
      {children}
    </p>
  );

  const HighlightBox = ({ bgColor, children }) => (
    <div style={{
      backgroundColor: bgColor || 'rgba(52,152,219,.12)',
      padding: '1.2rem',
      borderRadius: 10,
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 10px rgba(0,0,0,.1)'
    }}>
      {children}
    </div>
  );

  return (
    <Container>
      <PageTitle>Understanding the Tariff Calculations</PageTitle>

      {/* ---------- Trade-flow impact ---------- */}
      <Section title="How Tariffs Affect Trade Flows">
        <Paragraph>
          When a tariff is applied, the price of imported goods increases. If a product costs <InlineMath math={"P"} /> initially, 
          adding a tariff rate <InlineMath math={"\\tau"} /> increases its price by <InlineMath math={"\\Delta P / P = \\tau /(1+\\tau)"} />.
        </Paragraph>
        
        <Paragraph>
          As prices rise, demand falls according to the product's elasticity <InlineMath math={"\\varepsilon"} /> — 
          essentially how sensitive buyers are to price changes. This relationship follows the formula:
        </Paragraph>

        <KatexFormula formula={"Q_{new} = Q_{base} \\cdot e^{-\\varepsilon\\, \\tfrac{\\tau}{1+\\tau}}"} />

        <Paragraph size="0.95rem">
          <strong>In plain English:</strong> The higher the elasticity, the more dramatically trade drops when tariffs are applied. 
          Products like aircraft (elasticity ≈ 0.1) barely respond to tariffs, while products like electronics 
          (elasticity ≈ 3.7) see dramatic drops in trade volume with even modest tariff increases.
        </Paragraph>

        <HighlightBox>
          <div style={{
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '2rem', 
            justifyContent: 'space-around',
          }}>
            <div>
              <h4 style={{ margin: '0 0 .7rem', color: '#3498db' }}>Products Less Affected by Tariffs</h4>
              <p style={{ margin: '0 0 0.5rem' }}>• Aircraft — elasticity ≈ 0.11</p>
              <p style={{ margin: '0' }}>• Pharmaceuticals — elasticity ≈ 0.25</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 .7rem', color: '#3498db' }}>Products Highly Affected by Tariffs</h4>
              <p style={{ margin: '0 0 0.5rem' }}>• Vehicles — elasticity ≈ 4.5</p>
              <p style={{ margin: '0' }}>• Electronics — elasticity ≈ 3.7</p>
            </div>
          </div>
        </HighlightBox>
      </Section>

      {/* ---------- Retaliation ---------- */}
      <Section title="The Retaliation Effect" iconColor="#e74c3c">
        <Paragraph>
          Trade disputes rarely remain one-sided. When the U.S. imposes tariffs, trading partners typically 
          respond with their own tariffs on U.S. exports. This creates a multiplier effect on trade damage.
        </Paragraph>

        <Paragraph>
          Based on real-world data from 2018-2022 trade disputes, we consistently see that when countries retaliate:
        </Paragraph>

        <KatexFormula formula={"\\text{Trade Loss}_{retaliation} \\approx 2 \\times \\text{Trade Loss}_{one-sided}"} />

        <Paragraph size="0.95rem">
          <strong>What this means:</strong> The IMF found that trade flows drop 28-32% with retaliation versus about 14% without it. 
          A USDA study showed U.S. farmers lost $27 billion under retaliation, compared to just $13 billion they would 
          have lost with no counter-tariffs.
        </Paragraph>

        <HighlightBox bgColor="rgba(231,76,60,.12)">
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '2.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '1.5rem' }}>≈2×</div>
              <div style={{ fontSize: '1rem' }}>Trade Impact Multiplier</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '1.5rem' }}>2018-2022</div>
              <div style={{ fontSize: '1rem' }}>Real-world Evidence</div>
            </div>
          </div>
        </HighlightBox>
      </Section>

      {/* ---------- GDP impact ---------- */}
      <Section title="Impact on U.S. GDP" iconColor="#2ecc71">
        <Paragraph>
          To translate trade losses into GDP impact, we need to account for two key factors:
        </Paragraph>
        
        <Paragraph>
          1. <strong>Export Share:</strong> U.S. exports were $3.05 trillion in 2023, representing 11.2% of U.S. GDP.
          <br />
          2. <strong>Economic Multiplier:</strong> Each dollar of exports contributes about $0.90 to GDP long-term.
        </Paragraph>

        <KatexFormula formula={"\\Delta\\text{GDP} = \\Delta\\text{Exports} \\times 0.112 \\times 0.90"} />

        <Paragraph size="0.95rem">
          <strong>Example:</strong> If tariffs and retaliation cause a 10% drop in exports, this would reduce 
          U.S. GDP by approximately 1 percentage point (10% × 11.2% × 0.9 = 1.01%).
        </Paragraph>

        <div style={{
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1.5rem', 
          margin: '1.5rem 0'
        }}>
          <div style={{
            flex: '1 1 48%', 
            minWidth: isMobile ? '100%' : 250,
            backgroundColor: 'rgba(46,204,113,.12)', 
            padding: '1.2rem', 
            borderRadius: 10
          }}>
            <h4 style={{ margin: '0 0 .7rem', color: '#2ecc71' }}>
              Export Share = 11.2%
            </h4>
            <p style={{ margin: 0, fontSize: '.95rem' }}>
              U.S. exports as percentage of total GDP in 2023
            </p>
          </div>
          <div style={{
            flex: '1 1 48%', 
            minWidth: isMobile ? '100%' : 250,
            backgroundColor: 'rgba(46,204,113,.12)', 
            padding: '1.2rem', 
            borderRadius: 10
          }}>
            <h4 style={{ margin: '0 0 .7rem', color: '#2ecc71' }}>
              Multiplier = 0.90
            </h4>
            <p style={{ margin: 0, fontSize: '.95rem' }}>
              How much each export dollar contributes to the economy
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Sources ---------- */}
      <Section title="Sources & Limitations" iconColor="#7f8c8d">
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '2rem', 
          marginTop: '1rem' 
        }}>
          <div style={{ flex: '1 1 48%', minWidth: isMobile ? '100%' : 250 }}>
            <h4 style={{ color: '#bdc3c7', margin: '0 0 .8rem' }}>Data Sources</h4>
            <ul style={{ paddingLeft: '1.5rem', margin: '.5rem 0', lineHeight: 1.6 }}>
              <li>Bureau of Economic Analysis (BEA) — GDP & Trade Data (2023)</li>
              <li>CEPII Product-Level Elasticity Study (2019)</li>
              <li>IMF Tariff Impact Simulations (2020-2023)</li>
              <li>USDA Economic Research Service — Agriculture Tariff Studies (2021)</li>
              <li>IMF Working Paper 23/99: "Retaliation through Trade Barriers" (2023)</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 48%', minWidth: isMobile ? '100%' : 250 }}>
            <h4 style={{ color: '#bdc3c7', margin: '0 0 .8rem' }}>Model Limitations</h4>
            <p style={{ margin: '0 0 0.8rem', lineHeight: 1.6 }}>
              This model provides a simplified view of complex trade dynamics. Real-world outcomes depend on:
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 1.6 }}>
              <li>Supply chain adjustments over time</li>
              <li>Currency exchange rate movements</li>
              <li>Political negotiation timelines</li>
              <li>Specific product and country relationships</li>
            </ul>
          </div>
        </div>
      </Section>
    </Container>
  );
};

export default CalculationsPage;
