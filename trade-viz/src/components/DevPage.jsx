import React from 'react';

const DevPage = () => {
  // Medium-inspired styles
  const containerStyle = {
    padding: '0 20px 40px 20px',
    maxWidth: '700px',
    margin: '0 auto',
    fontFamily: 'charter, Georgia, Cambria, "Times New Roman", Times, serif',
    color: 'rgba(41, 41, 41, 1)',
    lineHeight: 1.8,
    backgroundColor: '#fafafa',  // Soft white background
    minHeight: '100vh'
  };
  
  const contentWrapperStyle = {
    padding: '0 25px',
    maxWidth: '700px',
    margin: '0 auto',
  };
  
  const headerStyle = {
    textAlign: 'center',
    margin: '0px 0 0px',
    padding: '20px 0 0px',
  };
  
  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '12px',
    lineHeight: 1.2
  };
  
  const subtitleStyle = {
    fontSize: '18px',
    color: 'rgba(41, 41, 41, 0.9)',
    fontWeight: 'normal',
    lineHeight: 1.4,
    margin: '0 auto 30px',
    maxWidth: '600px'
  };
  
  const sectionStyle = {
    marginBottom: '40px'
  };
  
  const headingStyle = {
    fontSize: '22px',
    fontWeight: 'bold',
    marginTop: '40px',
    marginBottom: '20px'
  };
  
  const subheadingStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '30px',
    marginBottom: '15px'
  };
  
  const paragraphStyle = {
    fontSize: '16px',
    marginBottom: '28px'
  };
  
  const listStyle = {
    fontSize: '16px',
    marginBottom: '30px',
    paddingLeft: '25px'
  };
  
  const listItemStyle = {
    marginBottom: '14px'
  };
  
  const dividerStyle = {
    margin: '35px auto',
    width: '50px',
    border: 'none',
    borderTop: '1px solid rgba(41, 41, 41, 0.2)'
  };

  return (
    <article style={containerStyle}>
      <div style={contentWrapperStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>USA Trade Flows Visualizer</h1>
          <h2 style={subtitleStyle}>
            With gradient arc visuals, you can visualize trade export/import volumes between the USA and its top 50 trading partners! 
            You can also converse with Trump AI + Fact Checker AI, to learn more about his stance on tariffs, geopolitics, etc. :')
          </h2>
        </header>
        
        <hr style={dividerStyle} />
        
        <section style={sectionStyle}>
          <h2 style={headingStyle}>My goals for this project</h2>
          <ul style={listStyle}>
            <li style={listItemStyle}>Build with Letta and Palantir to apply for internships at both!</li>
            <li style={listItemStyle}>Limit-test myself to building something that users might actually care about and use</li>
            <li style={listItemStyle}>I'm doing CS + econ minor for school, and have longed to intersect both domains</li>
            <li style={listItemStyle}>Build something that costs me nothing (money-wise)</li>
            <li style={listItemStyle}>Make a comeback project after struggling to create AI agents that could simulate microeconomic behaviors, like Salesforce's AI Economist</li>
          </ul>
        </section>
        
        <hr style={dividerStyle} />
        
        <section style={sectionStyle}>
          <h2 style={headingStyle}>Tech Stack</h2>
          
          <h3 style={subheadingStyle}>AI & Processing</h3>
          <p style={paragraphStyle}>Gemini powers web searching, Cerebras (+Llama) optimizes microsecond message flows, and o4-nano economically fuels reasoning flows.</p>
          
          <h3 style={subheadingStyle}>Frontend</h3>
          <p style={paragraphStyle}>Vite + React app, deployed to Vercel. React-globe.gl (with Three.js + WebGL) to render 3D globe visualizations + GeoJSON to plot arc transfer flows.</p>
          
          <h3 style={subheadingStyle}>Backend & Infrastructure</h3>
          <p style={paragraphStyle}>FastAPI as backend, Supabase as storage. Ngrok as the API gateway to my Chromebook-as-a-server. Firebase Analytics to view user activity.</p>
          
          <h3 style={subheadingStyle}>Agent Architecture</h3>
          <p style={paragraphStyle}>With Letta + ADE, respective AI agents are designed with unique personas and limitless memory. They perform complex tasks (web searching + analysis + inter-agent communication) via agentic tools. Within Letta Cloud, agents are loaded with researched context on their inspirators' political + economic stances, and evolve their memories via conversational context.</p>
          
          <h3 style={subheadingStyle}>Data Sources</h3>
          <p style={paragraphStyle}>Datasets from WITS, Kees Elasticities, and UN Comtrade. Cleansed and transformed within Pipeline Builders on Palantir's Foundry. AIP functions to query the processed data (unused for the production site though).</p>
        </section>
        
        <hr style={dividerStyle} />
        
        <section style={sectionStyle}>
          <h2 style={headingStyle}>Looking for feedback</h2>
          <p style={paragraphStyle}>I'm posting to look for feedback and engagement. Would YOU use this? What things could be better?</p>
          <p style={paragraphStyle}>Also this is my first time posting to Hacker News! FS prompt to fix any non-typical errors I've made in this post. :D</p>
        </section>
      </div>
    </article>
  );
};

export default DevPage;