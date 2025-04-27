import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function AboutPage() {
  /* ----------- Lists used for rendering ----------- */
  const featureList = [
    "Interactive tariff slider (0% to 150%) that recalculates trade impacts in real-time",
    "Retaliation toggle to simulate how trading partners respond to tariffs",
    "Instant impact calculations showing effects on trade flows and U.S. GDP",
    "Detailed breakdowns by country and product category (HS codes)",
    "3D globe visualization comparing direct vs. retaliatory effects"
  ];

  const dataSources = [
    "UN Comtrade Database — Raw trade flows at the HS-6 product level",
    "World Bank WITS API — Product classification concordance & country coordinates",
    "Bureau of Economic Analysis (BEA) — 2023 trade data ($3.05T exports, $3.83T imports)",
    "World Bank — Trade as percentage of U.S. GDP (exports ≈ 11% in 2023)",
    "Armington & CEPII studies — Trade elasticity estimates (ε ≈ 2.5 for imports, 3.7 for exports)",
    "IMF & BudgetLab — Research on tariff retaliation patterns"
  ];

  const hsCodes = [
    "HS 85 — Electronics & electrical equipment (smartphones, computers, semiconductors)",
    "HS 86 — Railway equipment & components",
    "HS 87 — Vehicles & automotive parts (cars, trucks, motorcycles)",
    "HS 88 — Aircraft, spacecraft & related parts",
    "HS 89 — Ships, boats & floating structures",
    "HS 90 — Precision instruments (medical devices, cameras, measuring equipment)"
  ];

  const technologies = [
    "React & Vite — Fast, modern front-end framework",
    "THREE.js & react-globe.gl — 3D globe visualization",
    "Recharts — Responsive charting for statistics panels",
    "D3.js — Advanced data visualization tools",
    "Papa Parse — Efficient CSV data processing",
    "FastAPI — High-performance Python backend",
    "VS Code & pnpm — Developer workflow tools"
  ];
  
  const gdpImpacts = [
    "Direct effects: Reduced exports lower GDP through decreased production",
    "Indirect effects: Higher import prices impact consumer spending and business investment",
    "Supply chain disruptions: Manufacturing sectors face input shortages and cost increases",
    "Long-term effects: Trade barriers can reduce productivity growth and innovation",
    "Regional impacts: Trade-dependent states and communities face disproportionate effects"
  ];

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#f0f2f5",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.7,
        backgroundColor: "#1a2634",
        height: "100%",
        overflowY: "auto"
      }}
    >
      {/* ---------------------------------------------------------------- */}
      <h1
        style={{
          color: "#3498db",
          borderBottom: "3px solid #3498db",
          paddingBottom: "1rem",
          marginBottom: "2rem",
          textAlign: "center",
          fontSize: "2.2rem",
          fontWeight: "700",
          letterSpacing: "0.5px"
        }}
      >
        About the Trade Visualization Tool
      </h1>

      {/* -------- Introduction -------- */}
      <Section>
        <p style={{ 
          fontSize: "1.3rem", 
          textAlign: "center",
          fontWeight: "500",
          color: "#e0e6ed",
          maxWidth: "800px",
          margin: "0 auto" 
        }}>
          An interactive <strong>economic simulator</strong> that lets you explore how tariff policies 
          affect U.S. trade relationships and economic outcomes.
        </p>
      </Section>

      {/* -------- What the tool shows -------- */}
      <Section>
        <SectionHeader icon="🔍">What You Can Explore</SectionHeader>
        
        <p style={{ fontSize: "1.05rem", marginBottom: "1.5rem" }}>
          This tool visualizes international trade flows and lets you simulate tariff impacts:
        </p>
        
        <div style={{ 
          display: "flex", 
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem" 
        }}>
          <InfoBox 
            title="3D Globe Visualization" 
            color="#3498db"
            width="48%"
          >
            Arc height and thickness represent U.S. trade volumes. As you adjust tariffs, 
            the visualization updates to show changing trade patterns.
          </InfoBox>
          
          <InfoBox 
            title="Economic Model" 
            color="#3498db"
            width="48%"
          >
            Uses the formula <InlineMath math={"Q = Q_0\\cdot e^{-\\varepsilon\\cdot \\Delta P/P}"} />, 
            where <InlineMath math={"\\Delta P/P = \\tau/(1+\\tau)"} /> to calculate 
            how tariffs affect trade volumes.
          </InfoBox>
        </div>

        <h3 style={{ 
          color: "#e0e6ed", 
          marginTop: "1.5rem", 
          borderLeft: "4px solid #3498db",
          paddingLeft: "0.75rem"
        }}>
          Key Features
        </h3>
        <BulletList items={featureList} tickColor="#3498db" iconType="✓" />
      </Section>

      {/* -------- Data & methodology -------- */}
      <Section>
        <SectionHeader icon="📊">Data Sources & Methodology</SectionHeader>
        
        <p style={{ fontSize: "1.05rem", marginBottom: "1.5rem" }}>
          This tool analyzes approximately <strong>$6.9 trillion</strong> of U.S. trade (goods and services) 
          from 2023. We use product-specific elasticities that vary widely by sector – from highly 
          inelastic aircraft (0.11) to more elastic vehicles (4.5).
        </p>

        <Warning>
          <strong>Note:</strong> For optimal performance, this demo version preloads six key HS 
          chapters representing high-value trade sectors. The complete dataset covers all 97 HS chapters 
          (approximately $7 trillion in trade). Researchers can connect the Comtrade API to analyze 
          additional product categories.
        </Warning>

        <h3 style={{ 
          color: "#e0e6ed", 
          marginTop: "1.5rem", 
          borderLeft: "4px solid #3498db",
          paddingLeft: "0.75rem"
        }}>
          Source Catalog
        </h3>
        <BulletList items={dataSources} tickColor="#3498db" iconType="•" />

        <h3 style={{ 
          color: "#e0e6ed", 
          marginTop: "1.5rem", 
          borderLeft: "4px solid #3498db",
          paddingLeft: "0.75rem"
        }}>
          Product Categories Included
        </h3>
        <BulletList items={hsCodes} tickColor="#3498db" iconType="•" />
      </Section>

      {/* -------- New Section: GDP Impacts -------- */}
      <Section>
        <SectionHeader icon="📈">Understanding GDP Impacts</SectionHeader>
        
        <p style={{ fontSize: "1.05rem", marginBottom: "1.5rem" }}>
          Tariffs affect GDP through multiple channels. Our model uses a simplified approach
          based on trade-to-GDP ratios and established economic multipliers.
        </p>
        
        <div style={{ 
          backgroundColor: "#253545", 
          padding: "1.25rem", 
          borderRadius: "8px",
          marginBottom: "1.5rem"
        }}>
          <h4 style={{ color: "#3498db", marginTop: 0 }}>How Trade Changes Affect GDP</h4>
          <BulletList items={gdpImpacts} tickColor="#e74c3c" iconType="→" />
        </div>

        <p>
          While the relationship between trade and GDP is complex, economists generally find that:
        </p>
        <ul style={{ marginBottom: "1rem" }}>
          <li>Short-term GDP effects of tariffs are typically negative</li>
          <li>Long-term effects depend on policy responses and structural changes</li>
          <li>Sectoral impacts vary widely based on trade intensity and elasticities</li>
        </ul>
      </Section>

      {/* -------- Math snippets -------- */}
      <Section>
        <SectionHeader icon="🧮">The Math Under the Hood</SectionHeader>

        <p style={{ fontSize: "1.05rem", marginBottom: "1.5rem" }}>
          Our model uses established economic formulas to calculate how tariffs affect trade flows and GDP:
        </p>

        <div style={{ 
          display: "flex", 
          gap: "1.5rem", 
          flexWrap: "wrap",
          justifyContent: "space-between" 
        }}>
          <FormulaBlock
            title="Trade Flow Impact"
            color="#3498db"
            formula={"Q = Q_0 \\; e^{-\\varepsilon\\, \\tfrac{\\tau}{1+\\tau}}"}
            note="How tariffs (τ) affect traded quantities based on elasticity (ε)"
            width="48%"
          />

          <FormulaBlock
            title="Retaliation Effect"
            color="#e74c3c"
            formula={"\\Delta Q_{\\text{ret}} \\approx 2\\,\\Delta Q_{\\text{uni}}"}
            note="Partner retaliation typically doubles the export reduction"
            width="48%"
          />
        </div>

        <FormulaBlock
          title="GDP Translation"
          color="#27ae60"
          formula={"\\Delta\\text{GDP}=\\Delta\\text{Trade}\\times 0.112 \\times 0.90"}
          note="Converts trade changes to GDP impact using export/GDP ratio (11.2%) and trade-output multiplier (0.9)"
          width="100%"
        />
        
        <p style={{ fontSize: "0.95rem", color: "#bbb", marginTop: "1rem" }}>
          Note: These formulas are simplifications. Actual impacts depend on complex factors including 
          substitution effects, supply chain adjustments, and monetary policy responses.
        </p>
      </Section>

      {/* -------- Tech stack -------- */}
      <Section>
        <SectionHeader icon="⚙️">Technology Stack</SectionHeader>
        <BulletList items={technologies} tickColor="#9b59b6" iconType="•" />
      </Section>

      {/* -------- Footer -------- */}
      <Section style={{ 
        textAlign: "center",
        position: "relative",
        marginTop: "3rem",
        paddingTop: "2.5rem",
        overflow: "hidden"
      }}>
        {/* Decorative top border */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "3px",
          background: "linear-gradient(90deg, transparent, #3498db, transparent)",
        }}></div>
        
        <div style={{ 
          marginBottom: "2rem",
          backgroundColor: "#253545",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem"
        }}>
          <div>
            <h3 style={{ margin: "0 0 0.75rem 0", color: "#3498db", fontSize: "1.4rem" }}>
              Created by Eric Ly
            </h3>
            <p style={{ fontSize: "1rem", color: "#bbb", margin: "0 0 1.5rem 0" }}>
              Feedback and collaborations welcome!
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <SocialLink href="https://lyyeric.tech" icon="🌐" label="Portfolio" />
            <SocialLink href="https://github.com/lyeric2022" icon="🔮" label="GitHub" />
            <SocialLink href="mailto:contact@j.lyyeric@gmail.com" icon="✉️" label="Email" />
          </div>
        </div>
        
        <p style={{ 
          fontSize: "0.9rem", 
          color: "#8a9db5", 
          marginTop: "1rem",
          opacity: "0.8" 
        }}>
          © {new Date().getFullYear()} • TradeFlows • Beta v0.2.0
        </p>
      </Section>
    </div>
  );
}

/* ---------- Enhanced reusable components ---------- */
function Section({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: "#2c3e50",
        padding: "1.75rem",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,.25)",
        marginBottom: "2.5rem",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children, icon }) {
  return (
    <h2 style={{
      color: "#3498db",
      borderBottom: "2px solid #3498db",
      paddingBottom: "0.75rem",
      marginTop: 0,
      marginBottom: "1.5rem",
      fontSize: "1.6rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </h2>
  );
}

function InfoBox({ children, title, color = "#3498db", width = "100%" }) {
  return (
    <div style={{
      backgroundColor: "#253545",
      padding: "1.25rem",
      borderRadius: "8px",
      borderTop: `3px solid ${color}`,
      flex: 1,
      minWidth: "280px",
      width: width
    }}>
      <h4 style={{ 
        color: color, 
        margin: "0 0 0.75rem 0",
        fontSize: "1.1rem" 
      }}>
        {title}
      </h4>
      <div style={{ fontSize: "0.95rem" }}>
        {children}
      </div>
    </div>
  );
}

function BulletList({ items, tickColor, iconType = "•" }) {
  return (
    <ul style={{ 
      paddingLeft: "0.5rem", 
      listStyle: "none", 
      marginBottom: "0.5rem" 
    }}>
      {items.map((txt, i) => (
        <li 
          key={i} 
          style={{ 
            marginBottom: "0.75rem", 
            position: "relative", 
            paddingLeft: "1.75rem",
            fontSize: "1rem" 
          }}
        >
          <span style={{ 
            position: "absolute", 
            left: 0, 
            color: tickColor,
            fontWeight: "bold" 
          }}>
            {iconType}
          </span>
          {txt}
        </li>
      ))}
    </ul>
  );
}

function FormulaBlock({ title, color, formula, note, width = "100%" }) {
  return (
    <div style={{ 
      borderLeft: `3px solid ${color}`, 
      paddingLeft: "1.25rem", 
      marginBottom: "1.5rem",
      backgroundColor: "#253545",
      padding: "1rem",
      borderRadius: "0 8px 8px 0",
      width: width
    }}>
      <h3 style={{ 
        color, 
        margin: "0 0 0.75rem 0",
        fontSize: "1.2rem" 
      }}>
        {title}
      </h3>
      <div
        style={{
          backgroundColor: "#1a2634",
          padding: "1rem",
          borderRadius: "6px",
          color: "#fff",
          marginBottom: "0.75rem"
        }}
      >
        <BlockMath math={formula} />
      </div>
      <p style={{ 
        fontSize: "0.9rem", 
        margin: "0",
        color: "#ccc" 
      }}>
        {note}
      </p>
    </div>
  );
}

function Warning({ children }) {
  return (
    <div
      style={{
        backgroundColor: "#34495e",
        padding: "1.25rem",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #f39c12",
        display: "flex",
        alignItems: "flex-start"
      }}
    >
      <span style={{ 
        color: "#f39c12", 
        marginRight: "0.75rem",
        fontSize: "1.25rem",
        fontWeight: "bold"
      }}>
        ⚠️
      </span>
      <div style={{ fontSize: "0.95rem" }}>
        {children}
      </div>
    </div>
  );
}

// Add this new component below your existing components:
function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#3498db",
        fontWeight: "bold",
        fontSize: "1rem",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1.2rem",
        border: "1px solid #3498db",
        borderRadius: "6px",
        transition: "all 0.3s ease",
        backgroundColor: "#1a2634",
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = "#3498db";
        e.target.style.color = "white";
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.3)";
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = "#1a2634";
        e.target.style.color = "#3498db";
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "none";
      }}
    >
      <span>{icon}</span> {label}
    </a>
  );
}
