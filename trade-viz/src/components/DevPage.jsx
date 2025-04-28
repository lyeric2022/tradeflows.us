import React from 'react';

const DevPage = () => {
  return (
    <div className="dev-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>App:</h1>
      <p>With gradient arc visuals, you can visualize trade export/import volumes between the USA and its top 50 trading partners! You can also converse with Trump AI + Fact Checker AI, to learn more about his stance on tariffs, geopolitics, etc. :')</p>

      <h2>My goals for this project :D</h2>
      <ul>
        <li>Build with Letta and Palantir to apply for internships at both !</li>
        <li>Limit-test myself to building something that users might actually care about and use</li>
        <li>I'm doing CS + econ minor for school, and have longed to intersect both domains</li>
        <li>Build something that costs me nothing (money-wise)</li>
        <li>Make a comeback project after struggling to create AI agents that could simulate microeconomic behaviors, like Salesforce's AI Economist.</li>
      </ul>

      <h2>My Tech Flow !!!</h2>
      <p>Gemini powers web searching, Cerebras (+Llama) optimizes microsecond message flows, and o4-nano economically fuels reasoning flows.</p>
      <p>Vite + React app for frontend, deployed to Vercel. React-globe.gl (with Three.js + WebGL) to render 3D globe visualizations + GeoJSON to plot arc transfer flows.</p>
      <p>FastAPI as backend, Supabase as storage. Ngrok as the API gateway to my Chromebook-as-a-server. Firebase Analytics to view my cutie users :P</p>
      <p>With Letta + ADE, respective AI agents are designed with unique personas and limitless memory. They perform complex tasks (web searching + analysis + inter-agent communication) via agentic tools. Within Letta Cloud, agents are loaded with researched context on their inspirators' political + economic stances, and evolve their memories via conversational context.</p>
      <p>Datasets from WITS, Kees Elasticities, and UN Comtrade. Cleansed and transformed within Pipeline Builders on Palantir's Foundry. AIP functions to query the processed data (unused for the production site though).</p>

      <h2>Looking for feedback</h2>
      <p>I'm posting to look for feedback and engagement hehe. Would YOU use this? What things could be better?</p>
      <p>Also this is my first time posting to Hacker News! FS prompt to fix any non-typical errors I've made in this post. :D</p>
    </div>
  );
};

export default DevPage;