import React, { useEffect, useRef, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { 
  calculateDistanceRadians, 
  calculateDistanceEffect, 
  calculateArcAltitude 
} from '../utils/arcCalculations';

/**
 * Globe visualization component that handles the 3D globe and its interactions
 */
export default function GlobeVisualization({
  simArcs = [],
  countryPoints = [],
  stats = { min: 0, max: 1 },
  normalize,
  selectedCountry,
  onCountryClick,
  isGlobeSpinning,
  toggleSpinning,
  windowWidth,
  windowHeight,
}) {
  const globeEl = useRef();
  
  // Globe auto-rotate setup - initial position
  useEffect(() => {
    // Set initial position only once when component mounts
    const timer = setTimeout(() => {
      if (globeEl.current) {
        // Set initial position to USA only on first load
        globeEl.current.pointOfView({
          lat: 39.8283,
          lng: -98.5795,
          altitude: 2.5
        }, 1000);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Update rotation state when isGlobeSpinning changes
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = isGlobeSpinning;
      globeEl.current.controls().autoRotateSpeed = 0.4;
      
      // Force a controls update to ensure changes take effect
      globeEl.current.controls().update();
      
      // If stopping rotation, also stop any momentum
      if (!isGlobeSpinning) {
        globeEl.current.controls().rotateSpeed = 0;
        setTimeout(() => {
          if (globeEl.current) {
            globeEl.current.controls().rotateSpeed = 1.0; // Restore normal rotation speed
          }
        }, 100);
      }
    }
  }, [isGlobeSpinning]);

  // Handle user interactions with the globe
  useEffect(() => {
    let isHolding = false;
    let startTime = 0;
    let hasMoved = false;
    
    const handleInteractionStart = (event) => {
      // Ignore clicks on the spin control button to prevent conflicts
      if (event.target.closest('button[data-spin-control="true"]')) {
        return;
      }
      
      // Start tracking the interaction
      isHolding = true;
      startTime = Date.now();
      hasMoved = false;
    };
    
    const handleInteractionMove = () => {
      if (isHolding) {
        hasMoved = true;
      }
    };
    
    const handleInteractionEnd = (event) => {
      if (!isHolding) return;
      
      // Check if the interaction was a quick click (not a drag/hold)
      const interactionDuration = Date.now() - startTime;
      const isQuickClick = interactionDuration < 300 && !hasMoved;
      
      // Check if the click happened on the globe's canvas (not on points or arcs)
      const isCanvasClick = event.target.tagName === 'CANVAS';
      
      // Only toggle spinning on quick clicks on the canvas
      if (isQuickClick && isCanvasClick) {
        if (toggleSpinning) toggleSpinning(!isGlobeSpinning);
      } 
      // If clicking on a point, arc, or other element while spinning
      else if (isQuickClick && globeEl.current && globeEl.current.controls().autoRotate) {
        // Turn off spinning when interacting with elements
        if (toggleSpinning) toggleSpinning(false);
      }
      
      // Reset tracking state
      isHolding = false;
    };
    
    window.addEventListener('mousedown', handleInteractionStart);
    window.addEventListener('touchstart', handleInteractionStart);
    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('touchmove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      window.removeEventListener('mousedown', handleInteractionStart);
      window.removeEventListener('touchstart', handleInteractionStart);
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('touchmove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [toggleSpinning, isGlobeSpinning]);

  // Update the spin control button style
  const spinButtonStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: isGlobeSpinning ? 'rgba(30, 174, 152, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    opacity: 0.9,
    minWidth: '40px',
    minHeight: '36px'
  };

  // Handle country click and focus camera
  const handleCountryClick = useCallback((country) => {
    if (onCountryClick) {
      onCountryClick(country);
      
      // Camera movement to selected country is now handled here
      if (country && globeEl.current) {
        // Stop auto-rotation when focusing on a country
        if (toggleSpinning) toggleSpinning(false);
        
        globeEl.current.pointOfView({
          lat: country.lat,
          lng: country.lng,
          altitude: 1.5
        }, 1000);
      }
    }
  }, [onCountryClick, toggleSpinning]);

  const { min, max } = stats;

  return (
    <>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={simArcs}
        pointsData={countryPoints}
        pointColor={d => selectedCountry && d.iso3 === selectedCountry.iso3 
          ? 'orange' 
          : 'white'}
        pointAltitude={0.01}
        pointRadius={d => selectedCountry && d.iso3 === selectedCountry.iso3 
          ? 0.8
          : 0.6}
        pointHitRadius={2.5}
        pointLabel={d => d.countryDesc || d.iso3}
        onPointClick={handleCountryClick}
        arcColor={d => {
          const normalizedValue = normalize(d.value, min, max);
          const intensity = 0.4 + (normalizedValue * 0.6);
          const alpha = 0.3 + (normalizedValue * 0.6);
          
          // Different colors for import vs export flows
          if (d.isImport) {
            return ['rgba(255,230,150,'+alpha+')', 'rgba(90,130,255,'+alpha+')'];
          } else {
            return ['rgba(216,181,255,'+alpha+')', 'rgba(30,174,152,'+alpha+')'];
          }
        }}
        arcStroke={d => {
          const normalizedValue = normalize(d.value, min, max);
          return 0.5 + (normalizedValue * 3.0);  // increased range from 0.5-3.5
        }}
        arcAltitude={d => {
          const normalizedValue = normalize(d.value, min, max);
          
          // Use the helper functions
          const distRadians = calculateDistanceRadians(d.startLat, d.startLng, d.endLat, d.endLng);
          const distEffect = calculateDistanceEffect(distRadians);
          return calculateArcAltitude(normalizedValue, distEffect);
        }}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={isGlobeSpinning ? 4000 : Infinity} // Pause arc animation when globe is not spinning
        width={windowWidth}
        height={ window.innerHeight - 52}
        arcLabel={d => `
          Trade volume: ${d.value.toLocaleString()}
          ${d.reporterISO3} → ${d.partnerISO}
          ${d.isImport ? '(Import flow)' : '(Export flow)'}
        `}
        arcTooltipRenderer={d => `
          <div style="background: rgba(0,0,0,0.75); color: white; padding: 10px; border-radius: 4px">
            <div><strong>${d.reporterISO3} → ${d.partnerISO}</strong></div>
            ${d.isImport 
              ? '<div style="color: #ff9966;">Import Flow</div>' 
              : '<div style="color: #66ff99;">Export Flow</div>'
            }
            <div>Trade Volume: ${d.value.toLocaleString()}</div>
            <div>Change: ${(((d.value - d.baseTotal) / d.baseTotal) * 100).toFixed(1)}%</div>
          </div>
        `}
      />
      
      {/* The spin control button */}
      <button 
        onClick={() => toggleSpinning(!isGlobeSpinning)}
        style={spinButtonStyle}
        data-spin-control="true"
        title={isGlobeSpinning ? "Pause rotation" : "Resume rotation"}
      >
        {isGlobeSpinning ? "⏸" : "▶"}
      </button>
    </>
  );
}