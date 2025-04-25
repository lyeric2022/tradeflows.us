// src/components/ArcMap.jsx

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import Globe from 'react-globe.gl';
import centroids from '../iso_centroids.json';

export default function ArcMap({ csvUrl = '/flows.csv' }) {
  const globeEl = useRef();
  const [flows, setFlows]         = useState([]);
  const [arcsData, setArcsData]   = useState([]);
  const [volumeStats, setVolumeStats] = useState({ min: 0, max: 0, median: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // 1) Fetch & parse CSV, enrich with lat/lng
  useEffect(() => {
    fetch(csvUrl)
      .then(r => (r.ok ? r.text() : Promise.reject(`Status ${r.status}`)))
      .then(csvText => {
        const { data, errors } = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        if (errors.length) throw errors;
        const enriched = data.map(f => {
          const [srcLng, srcLat] = centroids[f.reporterISO3] || [null, null];
          const [dstLng, dstLat] = centroids[f.partnerISO]    || [null, null];
          return { ...f, srcLng, srcLat, dstLng, dstLat };
        });
        setFlows(enriched);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [csvUrl]);

  // 2) Aggregate by pair → build arcsData + compute volume statistics
  useEffect(() => {
    if (!flows.length) return;

    // sum primaryValue by reporter-partner pair
    const agg = {};
    flows.forEach(f => {
      if (f.srcLng == null || f.dstLng == null) return;
      const key = `${f.reporterISO3}_${f.partnerISO}`;
      if (!agg[key]) {
        agg[key] = {
          startLat: f.srcLat,
          startLng: f.srcLng,
          endLat: f.dstLat,
          endLng: f.dstLng,
          total: 0,
          reporterISO3: f.reporterISO3,
          partnerISO: f.partnerISO
        };
      }
      agg[key].total += f.primaryValue;
    });

    const totals = Object.values(agg).map(o => o.total);
    totals.sort((a, b) => a - b);
    
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const median = totals[Math.floor(totals.length / 2)] || 0;
    
    setVolumeStats({ min, max, median });

    const arcs = Object.values(agg).map(o => ({
      startLat: o.startLat,
      startLng: o.startLng,
      endLat: o.endLat,
      endLng: o.endLng,
      value: o.total,
      reporterISO3: o.reporterISO3,
      partnerISO: o.partnerISO
    }));

    console.log('🔀 aggregated arcs:', arcs.length, 'stats:', { min, max, median }, 'sample:', arcs[0]);
    setArcsData(arcs);
  }, [flows]);

  // 3) Enable auto-rotation with better timing and reset
  useEffect(() => {
    // Wait a bit for the globe to fully initialize
    const timer = setTimeout(() => {
      if (globeEl.current) {
        // Set initial position to USA
        globeEl.current.pointOfView({
          lat: 39.8283,   // USA latitude (centered)
          lng: -98.5795,  // USA longitude (centered)
          altitude: 2.5   // Altitude - higher value = more zoomed out
        }, 1000); // 1000ms animation duration
        
        // Then enable auto-rotation
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        
        // Make sure animation loop is running
        globeEl.current.scene().animationLoop?.start();
        
        // Force a render
        globeEl.current.renderer().render(
          globeEl.current.scene(), 
          globeEl.current.camera()
        );
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Add another effect to reset rotation after user interaction
  useEffect(() => {
    const handleInteractionEnd = () => {
      if (globeEl.current) {
        // Re-enable auto-rotation after user interaction
        setTimeout(() => {
          if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
          }
        }, 2000);
      }
    };
    
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, []);

  // Helper function to normalize value between 0 and 1
  const normalize = (value, min, max) => {
    if (min === max) return 0.5; // Handle edge case
    return (value - min) / (max - min);
  };

  // Helper function to get color gradient based on normalized value (0-1)
  const getColorGradient = (normalizedValue) => {
    // Light purple to teal gradient with intensity based on volume
    const startColor = [216, 181, 255]; // #D8B5FF - light purple
    const endColor = [30, 174, 152];    // #1EAE98 - teal
    
    // For higher trade volumes, make the colors more intense and opaque
    const intensity = 0.4 + (normalizedValue * 0.6); // Scale from 0.4 to 1.0
    const alpha = 0.3 + (normalizedValue * 0.6);     // More volume = more opacity
    
    // Calculate colors with intensity applied
    const startR = Math.round(startColor[0] * intensity);
    const startG = Math.round(startColor[1] * intensity);
    const startB = Math.round(startColor[2] * intensity);
    
    const endR = Math.round(endColor[0] * intensity);
    const endG = Math.round(endColor[1] * intensity);
    const endB = Math.round(endColor[2] * intensity);
    
    // Return color values in the format the library expects
    return {
      start: `rgba(${startR}, ${startG}, ${startB}, ${alpha})`,
      end: `rgba(${endR}, ${endG}, ${endB}, ${alpha})`
    };
  };

  // 4) Loading / error / empty
  if (loading)          return <div>Loading flows…</div>;
  if (error)            return <div style={{ color: 'salmon' }}>Error: {String(error)}</div>;
  if (!arcsData.length) return <div>No arcs available. Check your CSV & centroids.</div>;

  // 5) Render the globe with volume-based arcs
  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      arcsData={arcsData}
      // Color based on position in the spectrum
      arcColor={d => {
        const normalizedValue = normalize(d.value, volumeStats.min, volumeStats.max);
        const colors = getColorGradient(normalizedValue);
        
        // Return a simple color array instead
        return ['rgba(216,181,255,0.5)', 'rgba(30,174,152,0.8)'];
      }}
      // Reduced thickness range - less severe differences
      arcStroke={d => {
        const normalizedValue = normalize(d.value, volumeStats.min, volumeStats.max);
        // Changed from 0.5 + (normalizedValue * 4.5) to a narrower range
        return 0.8 + (normalizedValue * 2.2);
      }}
      // Adjust arc altitude based on both value and distance between points
      arcAltitude={d => {
        const normalizedValue = normalize(d.value, volumeStats.min, volumeStats.max);
        
        // Calculate distance between points (simple spherical approximation)
        const distRadians = Math.acos(
          Math.sin(d.startLat * Math.PI/180) * Math.sin(d.endLat * Math.PI/180) +
          Math.cos(d.startLat * Math.PI/180) * Math.cos(d.endLat * Math.PI/180) *
          Math.cos((d.startLng - d.endLng) * Math.PI/180)
        );

        // Normalize distance - closer points should have flatter arcs
        // 0.5π radians is roughly quarter of earth circumference
        const normalizedDist = Math.min(distRadians / (0.5 * Math.PI), 1);

        // Make shorter distances have EXTREMELY flat arcs by applying cubic effect
        // Cube the normalized distance for more dramatic flattening of short routes
        const distEffect = Math.pow(normalizedDist, 3) * 0.6;

        // Reduce base height to absolute minimum for shortest distances
        // Short distances will have arcs almost directly on the surface
        return 0.02 + distEffect + (normalizedValue * 0.1);
      }}
      // Arc animation settings - unchanged
      arcDashLength={0.5}
      arcDashGap={2}
      arcDashAnimateTime={3000}
      width={window.innerWidth}
      height={window.innerHeight}
      // Add tooltips for arcs - unchanged
      arcLabel={d => `Trade volume: ${d.value.toLocaleString()}\n${d.reporterISO3} → ${d.partnerISO}`}
      arcTooltipRenderer={d => `
        <div style="background: rgba(0,0,0,0.75); color: white; padding: 10px; border-radius: 4px">
          <div><strong>${d.reporterISO3} → ${d.partnerISO}</strong></div>
          <div>Trade Volume: ${d.value.toLocaleString()}</div>
        </div>
      `}
    />
  );
}