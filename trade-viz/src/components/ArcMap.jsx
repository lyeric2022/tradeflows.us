// src/components/ArcMap.jsx

import React, { useState, useEffect, useCallback } from 'react';
import MethodologyModal from './MethodologyModal';
import TariffControls from './TariffControls';
import CountryDetailsPanel from './CountryDetailsPanel';
import GlobeVisualization from './GlobeVisualization';
import useTradeData from '../hooks/useTradeData';
import centroids from '../iso_centroids.json';

/**
 * ArcMap with tariff simulation and GDP impact demo.
 * Uses dataset's tau_mean (elasticity) to adjust trade volumes under tariffs.
 */
export default function ArcMap({ csvUrl = '/flows.csv', tradeToGdpRatio = 0.3 }) {
  const [tariffRate, setTariffRate] = useState(0);
  const [retaliationEnabled, setRetaliationEnabled] = useState(false); 
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [isGlobeSpinning, setIsGlobeSpinning] = useState(true);
  const [countryPoints, setCountryPoints] = useState([]);
  
  // Use the custom hook for data loading and processing
  const { 
    simArcs, 
    stats, 
    loading, 
    error, 
    normalize,
    calculateImpact 
  } = useTradeData(csvUrl, tariffRate, retaliationEnabled);
  
  // Process centroids into points for the globe
  useEffect(() => {
    // Convert the centroids object into an array of points
    const points = Object.entries(centroids).map(([iso, coords]) => {
      if (!coords || coords.length < 2) return null;
      
      return {
        id: iso,
        lat: coords[1],
        lng: coords[0],
        iso3: iso,
        countryDesc: centroids[iso]?.name || iso, // Add country name if available
        // Include any other data you want to associate with the point
      };
    }).filter(Boolean); // Remove any null entries
    
    setCountryPoints(points);
  }, []);
  
  // Define the toggle function to control globe rotation
  const toggleSpinning = useCallback((forcedState) => {
    const newState = forcedState !== undefined ? forcedState : !isGlobeSpinning;
    setIsGlobeSpinning(newState);
  }, [isGlobeSpinning]);
  
  // Handle country selection
  // In the handleCountryClick function, make sure you're passing the country name
  const handleCountryClick = useCallback((country) => {
    // If clicking on already selected country, deselect it
    if (selectedCountry && selectedCountry.iso3 === country.iso3) {
      setSelectedCountry(null);
      return;
    }
    
    // Select the new country (automatically deselects previous)
    setSelectedCountry(country);
  }, [selectedCountry]);
  
  // Get all trade flows for the selected country
  const getCountryFlows = useCallback(() => {
    if (!selectedCountry || !simArcs.length) return [];
    
    const iso = selectedCountry.iso3;
    return simArcs.filter(arc => 
      arc.reporterISO3 === iso || arc.partnerISO === iso
    );
  }, [selectedCountry, simArcs]);

  // Add window size detection for responsive layouts
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Track window resizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading / Error states
  if (loading) return <div>Loading data…</div>;
  if (error)   return <div style={{ color: 'salmon' }}>Error: {String(error)}</div>;
  if (!simArcs.length) return <div>No arcs available. Check your CSV & centroids.</div>;

  // Get trade and GDP impact from our calculations
  const { tradePctChange, gdpPctImpact } = calculateImpact();

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Use the TariffControls component */}
      <TariffControls
        tariffRate={tariffRate}
        setTariffRate={setTariffRate}
        retaliationEnabled={retaliationEnabled}
        setRetaliationEnabled={setRetaliationEnabled}
        tradePctChange={tradePctChange}
        gdpPctImpact={gdpPctImpact}
        onShowMethodology={() => setShowMethodology(true)}
      />

      {/* Methodology modal */}
      <MethodologyModal 
        show={showMethodology} 
        onClose={() => setShowMethodology(false)} 
      />

      {/* Globe visualization component */}
      <GlobeVisualization
        simArcs={simArcs}
        countryPoints={countryPoints}
        stats={stats}
        normalize={normalize}
        selectedCountry={selectedCountry}
        onCountryClick={handleCountryClick}
        isGlobeSpinning={isGlobeSpinning}
        toggleSpinning={toggleSpinning}
        windowWidth={windowWidth}
        windowHeight={window.innerHeight - 70}
      />
      
      {/* Country details panel */}
      <CountryDetailsPanel
        selectedCountry={selectedCountry}
        countryFlows={getCountryFlows()}
        tariffRate={tariffRate}
        onClose={() => setSelectedCountry(null)}
        windowWidth={windowWidth}
      />
    </div>
  );
}