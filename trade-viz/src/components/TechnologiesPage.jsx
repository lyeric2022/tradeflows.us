import React from 'react';

const TechnologiesPage = () => {
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
        Technologies
      </h1>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <p>
          Using Letta + its Agent Development Environment (ADE), I designed and built AI agents that each possess a unique persona and effectively limitless memory, enabling them to carry out complex, agentic tasks like web searches and inter-agent communication.
        </p>
        <p>
          These agents living Letta's Cloud, are preloaded with o3 deep research into respective inspirators' political and economic stances. Their memories also transform over time via conversational context and (Gemini-powered) agentic tools. Cerebras hardware edits message flows at the microsecond level, while gpt-o4-nano economically powers reasoning flows.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '1.4rem' }}>Frontend</h2>
        <p>
          The user interface is a React application built with Vite and deployed on Vercel. I leverage react-globe.gl, which uses Three.js and WebGL under the hood for smooth, interactive 3D globe visualizations. Countries' geojson enabled precise arc transfer flows.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '1.4rem' }}>Backend</h2>
        <p>
          On the backend, I run a FastAPI server that handles requests and orchestrates data operations. I use Supabase for persistent storage and Ngrok as a secure API gateway to expose my Chromebook-hosted services to the internet.
        </p>
        <p>
          For analytics, I rely on Firebase Analytics to track usage patterns and performance metrics in real time.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '1.4rem' }}>Data Pipeline</h2>
        <p>
          My datasets—sourced from WITS, Kees Elasticities, and UN Comtrade—are ingested as raw CSVs, then cleansed and transformed using Palantir's pipeline tools. I model that data through ontology objects and expose it via Palantir AIP functions for interactive querying and visualization.
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
        <h2 style={{ color: '#f39c12', marginTop: 0, fontSize: '1.4rem' }}>Acknowledgments</h2>
        <p>
          Also thank Shubham and Semester at Palantir, for motivating to ship my first awesome app.
        </p>
        <p>
          Thank you to Letta and Gemini for AI credits, MLH for providing my domain, and Cerebras for compute resources. I'm grateful to the creator of the earth-night texture at <a href="https://unpkg.com/three-globe@2.42.4/example/img/earth-night.jpg" style={{ color: '#3498db' }}>unpkg.com</a>, and to GitHub Copilot for assisting with code snippets throughout this project.
        </p>
      </div>
      
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#7f8c8d', 
        marginTop: '2rem',
        textAlign: 'center' 
      }}>
        Last updated: April 27, 2025
      </div>
    </div>
  );
};

export default TechnologiesPage;