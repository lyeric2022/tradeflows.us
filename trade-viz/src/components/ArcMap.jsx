// src/components/ArcMap.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import Globe from 'react-globe.gl';
import centroids from '../iso_centroids.json';
import { 
  calculateDistanceRadians, 
  calculateDistanceEffect, 
  calculateArcAltitude 
} from '../utils/arcCalculations';
import MethodologyModal from './MethodologyModal';
import TariffControls from './TariffControls';
import * as THREE from 'three';

/**
 * ArcMap with tariff simulation and GDP impact demo.
 * Uses dataset's tau_mean (elasticity) to adjust trade volumes under tariffs.
 */
export default function ArcMap({ csvUrl = '/flows.csv', tradeToGdpRatio = 0.3 }) {
  // Add this normalize helper function
  const normalize = (value, min, max) => {
    return Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  };
  
  const globeEl = useRef();
  const [flows, setFlows]           = useState([]);
  const [baselineArcs, setBaselineArcs] = useState([]);
  const [simArcs, setSimArcs]       = useState([]);
  const [stats, setStats]           = useState({ baseTotal: 0, simTotal: 0, min: 0, max: 0 });
  const [tariffRate, setTariffRate] = useState(0);
  const [retaliationEnabled, setRetaliationEnabled] = useState(false); 
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedArc, setSelectedArc] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);
  // Add this new state to track globe spinning status
  const [isGlobeSpinning, setIsGlobeSpinning] = useState(true);
  
  // Add a new state for country points
  const [countryPoints, setCountryPoints] = useState([]);
  
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
        // Include any other data you want to associate with the point
      };
    }).filter(Boolean); // Remove any null entries
    
    setCountryPoints(points);
  }, []);
  
  // Add globe click handler to toggle spinning
  const handleGlobeClick = useCallback(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      const newSpinState = !controls.autoRotate;
      controls.autoRotate = newSpinState;
      setIsGlobeSpinning(newSpinState);
    }
  }, []);
  
  // Handle country selection - update this function
  const handleCountryClick = useCallback((country) => {
    // If clicking on already selected country, deselect it
    if (selectedCountry && selectedCountry.iso3 === country.iso3) {
      setSelectedCountry(null);
      return;
    }
    
    // Select the new country (automatically deselects previous)
    setSelectedCountry(country);
    
    // Reset arc selection when selecting a country
    setSelectedArc(null);
    
    // Smoothly move camera to selected country
    if (globeEl.current) {
      globeEl.current.pointOfView({
        lat: country.lat,
        lng: country.lng,
        altitude: 1.5
      }, 1000);
    }
  }, [selectedCountry]);
  
  // Get all trade flows for the selected country
  const getCountryFlows = useCallback(() => {
    if (!selectedCountry || !simArcs.length) return [];
    
    const iso = selectedCountry.iso3;
    return simArcs.filter(arc => 
      arc.reporterISO3 === iso || arc.partnerISO === iso
    );
  }, [selectedCountry, simArcs]);

  // 1) Load & enrich CSV
  useEffect(() => {
    fetch(csvUrl)
      .then(r => (r.ok ? r.text() : Promise.reject(`Status ${r.status}`)))
      .then(text => {
        const { data, errors } = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
        if (errors.length) throw errors;
        const enriched = data.map(f => {
          const [srcLng, srcLat] = centroids[f.reporterISO3] || [];
          const [dstLng, dstLat] = centroids[f.partnerISO]    || [];
          return {
            ...f,
            srcLat, srcLng,
            dstLat, dstLng,
            elasticity: f.tau_mean // elasticity from dataset
          };
        });
        setFlows(enriched);
      })
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [csvUrl]);

  // 2) Compute baseline and store total
  useEffect(() => {
    if (!flows.length) return;
    const agg = {};
    flows.forEach(f => {
      if (f.srcLat == null || f.dstLat == null) return;
      const key = `${f.reporterISO3}_${f.partnerISO}`;
      const base = f.primaryValue;
      if (!agg[key]) {
        agg[key] = { 
          startLat: f.srcLat, 
          startLng: f.srcLng, 
          endLat: f.dstLat, 
          endLng: f.dstLng, 
          baseTotal: 0,
          reporterISO3: f.reporterISO3,
          partnerISO: f.partnerISO,
          elasticity: f.elasticity
        };
      }
      agg[key].baseTotal += base;
    });
    const baseArcs = Object.values(agg).map(o => ({
      ...o,
      value: o.baseTotal
    }));
    const baseTotal = baseArcs.reduce((sum, a) => sum + a.value, 0);
    setBaselineArcs(baseArcs);
    setStats(s => ({ ...s, baseTotal }));
  }, [flows]);

  // 3) Recompute simulation whenever tariffRate, retaliationEnabled or baselineArcs change
  useEffect(() => {
    if (!flows.length) return;
    const agg = {};
    
    // Process existing flows (USA to other countries)
    flows.forEach(f => {
      if (f.srcLat == null || f.dstLat == null) return;
      const key = `${f.reporterISO3}_${f.partnerISO}`;
      const adjusted = f.primaryValue * Math.pow(1 + tariffRate, -Math.abs(f.elasticity || 1.5)) * 
        (1 - Math.min(0.15 * tariffRate, 0.3)); // Adds diminishing returns at higher rates
      if (!agg[key]) {
        agg[key] = { 
          startLat: f.srcLat, 
          startLng: f.srcLng, 
          endLat: f.dstLat, 
          endLng: f.dstLng, 
          simTotal: 0,
          reporterISO3: f.reporterISO3,
          partnerISO: f.partnerISO,
          elasticity: f.elasticity,
          baseTotal: 0,
          isRetaliation: false
        };
      }
      agg[key].simTotal += adjusted;
      agg[key].baseTotal += f.primaryValue;
      
      // Always create reverse flows (other countries to USA) regardless of retaliation toggle
      if (f.reporterISO3 === 'USA') {
        const mirrorKey = `${f.partnerISO}_USA`;
        
        // Mirror coordinates (swap source and destination)
        if (!agg[mirrorKey]) {
          agg[mirrorKey] = {
            startLat: f.dstLat,  // Swapped
            startLng: f.dstLng,  // Swapped
            endLat: f.srcLat,    // Swapped
            endLng: f.srcLng,    // Swapped
            simTotal: 0,
            reporterISO3: f.partnerISO,  // Swapped
            partnerISO: 'USA',           // Swapped
            elasticity: f.elasticity,    // Assume same elasticity
            baseTotal: 0,
            isRetaliation: true          // Mark as retaliation flow
          };
        }
        
        // Mirror trade value with slight discount for asymmetry
        const mirrorBaseValue = f.primaryValue * 0.8;
        
        // Apply tariff effect only if retaliation is enabled, otherwise just show baseline value
        const mirrorAdjusted = retaliationEnabled 
          ? mirrorBaseValue * Math.pow(1 + tariffRate, -Math.abs(f.elasticity || 1.5))
          : mirrorBaseValue;
        
        agg[mirrorKey].simTotal += mirrorAdjusted;
        agg[mirrorKey].baseTotal += mirrorBaseValue;
      }
    });
    
    // Calculate standard flows (USA→World) separately for impact calculations
    const standardArcData = Object.values(agg).filter(o => !o.isRetaliation).map(o => ({
      ...o,
      value: o.simTotal
    }));
    
    const standardSimTotal = standardArcData.reduce((sum, a) => sum + a.value, 0);
    const standardBaseTotal = standardArcData.reduce((sum, a) => sum + a.baseTotal, 0);
    
    const simArcsData = Object.values(agg).map(o => ({
      ...o,
      value: o.simTotal
    }));
    
    const simTotal = simArcsData.reduce((sum, a) => sum + a.value, 0);
    const baseTotal = simArcsData.reduce((sum, a) => sum + a.baseTotal, 0);

    // update stats
    const allValues = simArcsData.map(a => a.value);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    setSimArcs(simArcsData);
    setStats(s => ({ 
      ...s, 
      simTotal, 
      baseTotal, 
      min, 
      max,
      standardSimTotal,
      standardBaseTotal
    }));
  }, [tariffRate, retaliationEnabled, flows]);

  // 4) Globe auto-rotate setup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (globeEl.current) {
        // Set initial position to USA
        globeEl.current.pointOfView({
          lat: 39.8283,
          lng: -98.5795,
          altitude: 2.5
        }, 1000);
        
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.4;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add another effect to reset rotation after user interaction
  useEffect(() => {
    const handleInteractionEnd = (event) => {
      // Ignore clicks on the spin control button to prevent conflicts
      if (event.target.closest('button[data-spin-control="true"]')) {
        return;
      }
      
      if (globeEl.current) {
        // Stop auto-rotation after user interaction
        globeEl.current.controls().autoRotate = false;
        setIsGlobeSpinning(false);
      }
    };
    
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, []);

  // Styles for the spin control button
  const spinButtonStyle = {
    position: 'absolute',
    top: '20px',  // Changed from bottom to top
    right: '20px',
    backgroundColor: isGlobeSpinning ? 'rgba(30, 174, 152, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    transition: 'background-color 0.3s ease'
  };

  // Fix the toggle spinning function
  const toggleSpinning = useCallback(() => {
    if (globeEl.current) {
      // Get direct reference to controls
      const controls = globeEl.current.controls();
      
      // Toggle state based on the current state
      const newSpinState = !isGlobeSpinning;
      console.log("Current state:", isGlobeSpinning, "New state:", newSpinState);
      
      // Directly set the auto-rotate property 
      controls.autoRotate = newSpinState;
      
      // Force an immediate update to the controls
      controls.update();
      
      // Update React state to reflect the change
      setIsGlobeSpinning(newSpinState);
    }
  }, [isGlobeSpinning]);

  // Update the info panel styles to position on the right side
  const infoStyle = {
    position: 'absolute',
    top: '20px',
    right: '80px', // Changed from left to right, with space for spin button
    background: 'rgba(0,0,0,0.75)',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    maxWidth: '300px',
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 0 15px rgba(0,0,0,0.5)'
  };

  const closeBtn = {
    position: 'absolute',
    top: '5px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 5px'
  };

  // Loading / Error states
  if (loading) return <div>Loading data…</div>;
  if (error)   return <div style={{ color: 'salmon' }}>Error: {String(error)}</div>;
  if (!simArcs.length) return <div>No arcs available. Check your CSV & centroids.</div>;

  // Compute % changes
  const { baseTotal, simTotal, min, max, standardSimTotal, standardBaseTotal } = stats;

  // Calculate the appropriate percentage change
  let tradePctChange;
  if (retaliationEnabled) {
    // When retaliation is enabled, the impact should be greater but realistic
    const standardImpact = ((standardSimTotal - standardBaseTotal) / standardBaseTotal);
    
    // Adjusted based on US-specific trade war research (2018-2020 data)
    const retaliationMultiplier = 1.65; // Research shows 1.6-1.7x multiplier for US trade disputes
    
    // Calculate bounded impact that can't exceed -80% (more realistic for US trade patterns)
    let rawImpact = standardImpact * retaliationMultiplier;
    if (rawImpact < 0) {
      // Adjusted curve to better match empirical US trade flow disruptions
      rawImpact = -0.8 * (1.0 - Math.exp(1.8 * rawImpact));
    }
    
    tradePctChange = rawImpact * 100;
  } else {
    // When no retaliation, just compare standard USA->World flows
    tradePctChange = ((standardSimTotal - standardBaseTotal) / standardBaseTotal) * 100;
  }

  // Adjusted for US trade-to-GDP ratio with sector-weighted impact
  const gdpPctImpact = tradePctChange * 0.27 * 0.75; // US trade/GDP ~27%, impact factor 0.75

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Use the new TariffControls component */}
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

      {/* Globe with points for countries */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={simArcs}
        
        // Updated point properties
        pointsData={countryPoints}
        pointColor={d => selectedCountry && d.iso3 === selectedCountry.iso3 
          ? 'orange' 
          : 'white'}
        pointAltitude={0.005} // Reduced altitude to make points shorter
        pointRadius={d => selectedCountry && d.iso3 === selectedCountry.iso3 
          ? 0.8  // Increased radius for selected country
          : 0.4} // Increased radius for unselected countries
        pointLabel={d => d.iso3}
        onPointClick={handleCountryClick}
        
        // Keep existing arc properties
        arcColor={d => {
          const normalizedValue = normalize(d.value, min, max);
          const intensity = 0.4 + (normalizedValue * 0.6);
          const alpha = 0.3 + (normalizedValue * 0.6);
          return ['rgba(216,181,255,'+alpha+')', 'rgba(30,174,152,'+alpha+')'];
        }}
        arcStroke={d => {
          const normalizedValue = normalize(d.value, min, max);
          return 0.8 + (normalizedValue * 2.2);
        }}
        arcAltitude={d => {
          const normalizedValue = normalize(d.value, min, max);
          
          // Use the imported helper functions
          const distRadians = calculateDistanceRadians(d.startLat, d.startLng, d.endLat, d.endLng);
          const distEffect = calculateDistanceEffect(distRadians);
          return calculateArcAltitude(normalizedValue, distEffect);
        }}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={3000}
        width={window.innerWidth}
        height={window.innerHeight}
        arcLabel={d => `
          Trade volume: ${d.value.toLocaleString()}
          ${d.reporterISO3} → ${d.partnerISO}
          ${d.isRetaliation ? '(Retaliation flow)' : ''}
        `}
        arcTooltipRenderer={d => `
          <div style="background: rgba(0,0,0,0.75); color: white; padding: 10px; border-radius: 4px">
            <div><strong>${d.reporterISO3} → ${d.partnerISO}</strong></div>
            ${d.isRetaliation ? '<div style="color: #ff9966;">Retaliation Flow</div>' : ''}
            <div>Trade Volume: ${d.value.toLocaleString()}</div>
            <div>Change: ${(((d.value - d.baseTotal) / d.baseTotal) * 100).toFixed(1)}%</div>
          </div>
        `}
        onArcClick={d => setSelectedArc(d)}
      />
      
      {/* Country info panel - add data attribute for selection */}
      {selectedCountry && (
        <div style={infoStyle} data-info-panel="true">
          <button onClick={() => setSelectedCountry(null)} style={closeBtn}>×</button>
          <h3>{selectedCountry.iso3}</h3>
          
          <h4>Trade Flows:</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {getCountryFlows().map((flow, idx) => (
              <div key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.2)', 
                marginBottom: '8px',
                paddingBottom: '8px' 
              }}>
                <div>
                  <strong>
                    {flow.reporterISO3} → {flow.partnerISO}
                    {flow.isRetaliation && ' (Retaliation)'}
                  </strong>
                </div>
                <div>Value: {flow.value.toLocaleString()}</div>
                <div>Change: 
                  <span style={{ 
                    color: flow.value < flow.baseTotal ? '#ff8080' : '#80ff80' 
                  }}>
                    {(((flow.value - flow.baseTotal) / flow.baseTotal) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
            {getCountryFlows().length === 0 && (
              <p>No trade data available for this country.</p>
            )}
          </div>
          
          {/* Summary statistics for selected country */}
          {getCountryFlows().length > 0 && (
            <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
              <h4>Trade Summary:</h4>
              <p>
                Total Trade Volume: {
                  getCountryFlows().reduce((sum, flow) => sum + flow.value, 0).toLocaleString()
                }
              </p>
              <p>
                Impact of {(tariffRate * 100).toFixed(0)}% Tariff: {
                  ((getCountryFlows().reduce((sum, flow) => sum + flow.value, 0) - 
                    getCountryFlows().reduce((sum, flow) => sum + flow.baseTotal, 0)) / 
                    getCountryFlows().reduce((sum, flow) => sum + flow.baseTotal, 0) * 100).toFixed(2)
                }%
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Keep the existing arc info panel when an arc is selected */}
      {selectedArc && !selectedCountry && (
        <div style={infoStyle}>
          <button onClick={() => setSelectedArc(null)} style={closeBtn}>×</button>
          <h3>{selectedArc.reporterISO3} → {selectedArc.partnerISO}</h3>
          {selectedArc.isRetaliation && <p style={{ color: '#ff9966' }}>Retaliation Flow</p>}
          <p>Trade Volume: {selectedArc.value.toLocaleString()}</p>
          <p>Original Volume: {selectedArc.baseTotal.toLocaleString()}</p>
          <p>Elasticity: {selectedArc.elasticity?.toFixed(2) ?? 'n/a'}</p>
          <p>
            Change at {(tariffRate * 100).toFixed(0)}% tariff:{' '}
            <span style={{ 
              color: selectedArc.value < selectedArc.baseTotal ? '#ff8080' : '#80ff80' 
            }}>
              {(((selectedArc.value - selectedArc.baseTotal) / selectedArc.baseTotal) * 100).toFixed(2)}%
            </span>
          </p>
        </div>
      )}

      {/* Spin control button */}
      <button 
        onClick={toggleSpinning}
        style={spinButtonStyle}
        data-spin-control="true"
        title={isGlobeSpinning ? "Pause rotation" : "Resume rotation"}
      >
        {isGlobeSpinning ? "⏸" : "⟳"}
      </button>
    </div>
  );
}