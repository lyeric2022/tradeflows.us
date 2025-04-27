import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import centroids from '../iso_centroids.json';
import { calculateDistanceRadians } from '../utils/arcCalculations';

/**
 * Custom hook to load and process trade flow data
 * Handles CSV loading, baseline calculations, and tariff simulations
 * REVISED: Uses both export and import data with direction-specific elasticities
 */
export default function useTradeData(csvUrl, tariffRate, retaliationEnabled) {
  const [exportFlows, setExportFlows] = useState([]);
  const [importFlows, setImportFlows] = useState([]);
  const [baselineArcs, setBaselineArcs] = useState([]);
  const [simArcs, setSimArcs] = useState([]);
  const [countryElasticities, setCountryElasticities] = useState({});
  const [stats, setStats] = useState({ 
    baseTotal: 0, 
    simTotal: 0, 
    min: 0, 
    max: 0,
    standardSimTotal: 0,
    standardBaseTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalize helper function
  const normalize = (value, min, max) => {
    return Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  };

  // 1) Load & enrich CSV - now loading both exports and imports
  useEffect(() => {
    fetch(csvUrl)
      .then(r => (r.ok ? r.text() : Promise.reject(`Status ${r.status}`)))
      .then(text => {
        const { data, errors } = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
        if (errors.length) throw errors;
        
        // Split data into export and import flows
        const exports = data.filter(flow => flow.flowCode === 'X');
        const imports = data.filter(flow => flow.flowCode === 'M');
        
        // Enrich export flows with coordinates
        const enrichedExports = exports.map(f => {
          const [srcLng, srcLat] = centroids[f.reporterISO3] || [];
          const [dstLng, dstLat] = centroids[f.partnerISO] || [];
          return {
            ...f,
            srcLat, srcLng,
            dstLat, dstLng,
            elasticity: f.tau_mean // elasticity from dataset
          };
        });
        
        // Enrich import flows with coordinates
        const enrichedImports = imports.map(f => {
          // For imports, swap the direction (partner is source, reporter is destination)
          const [dstLng, dstLat] = centroids[f.reporterISO3] || [];
          const [srcLng, srcLat] = centroids[f.partnerISO] || [];
          return {
            ...f,
            srcLat, srcLng, // Partner country coordinates
            dstLat, dstLng, // Reporter country coordinates
            elasticity: f.tau_mean,
            isImport: true
          };
        });
        
        setExportFlows(enrichedExports);
        setImportFlows(enrichedImports);
        
        // Calculate weighted elasticities by country and direction
        const elasticities = calculateCountryElasticities(enrichedExports, enrichedImports);
        setCountryElasticities(elasticities);
      })
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [csvUrl]);
  
  // Calculate weighted elasticities for all countries by direction
  const calculateCountryElasticities = (exports, imports) => {
    const elasticities = {};
    
    // Process all unique countries
    const countries = new Set([
      ...exports.map(f => f.partnerISO),
      ...imports.map(f => f.partnerISO)
    ]);
    
    countries.forEach(countryISO => {
      if (!countryISO || countryISO === 'USA') return;
      
      // Exports FROM USA TO this country (for retaliation tariffs)
      const exportsToCountry = exports.filter(f => 
        f.reporterISO3 === 'USA' && f.partnerISO === countryISO);
      
      // Imports TO USA FROM this country (for USA tariffs)
      const importsFromCountry = imports.filter(f => 
        f.reporterISO3 === 'USA' && f.partnerISO === countryISO);
      
      // Calculate elasticity for exports TO this country
      let exportElasticity = 0;
      if (exportsToCountry.length) {
        let totalExportValue = 0;
        let weightedExportSum = 0;
        
        exportsToCountry.forEach(flow => {
          totalExportValue += flow.primaryValue;
          weightedExportSum += (Math.abs(flow.elasticity) * flow.primaryValue);
        });
        
        exportElasticity = totalExportValue > 0 ? 
          weightedExportSum / totalExportValue : 0;
      }
      
      // Calculate elasticity for imports FROM this country
      let importElasticity = 0;
      if (importsFromCountry.length) {
        let totalImportValue = 0;
        let weightedImportSum = 0;
        
        importsFromCountry.forEach(flow => {
          totalImportValue += flow.primaryValue;
          weightedImportSum += (Math.abs(flow.elasticity) * flow.primaryValue);
        });
        
        importElasticity = totalImportValue > 0 ? 
          weightedImportSum / totalImportValue : 0;
      }
      
      elasticities[countryISO] = {
        export: exportElasticity, // Elasticity of USA exports TO this country
        import: importElasticity, // Elasticity of USA imports FROM this country
        total: (exportElasticity + importElasticity) / 2 // Average for general use
      };
    });
    
    return elasticities;
  };

  // 2) Compute baseline using both exports and imports
  useEffect(() => {
    if (!exportFlows.length) return;
    
    const agg = {};
    
    // Process export flows
    exportFlows.forEach(f => {
      if (f.srcLat == null || f.dstLat == null) return;
      const key = `${f.reporterISO3}_${f.partnerISO}_X`;
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
          elasticity: f.elasticity,
          isUSExport: f.reporterISO3 === 'USA'
        };
      }
      agg[key].baseTotal += base;
    });
    
    // Process import flows - only USA imports
    importFlows.forEach(f => {
      if (f.srcLat == null || f.dstLat == null || f.reporterISO3 !== 'USA') return;
      
      const key = `${f.partnerISO}_${f.reporterISO3}_M`;
      const base = f.primaryValue;
      
      if (!agg[key]) {
        agg[key] = { 
          startLat: f.srcLat, 
          startLng: f.srcLng, 
          endLat: f.dstLat, 
          endLng: f.dstLng, 
          baseTotal: 0,
          reporterISO3: f.partnerISO,  // Swapped for imports
          partnerISO: f.reporterISO3,  // Swapped for imports
          elasticity: f.elasticity,
          isImport: true
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
  }, [exportFlows, importFlows]);

  // 3) Recompute simulation whenever tariffRate, retaliationEnabled or flows change
  useEffect(() => {
    if (!exportFlows.length) return;
    
    const agg = {};
    
    // Process export flows (USA to other countries)
    exportFlows.forEach(f => {
      if (f.srcLat == null || f.dstLat == null) return;
      
      const key = `${f.reporterISO3}_${f.partnerISO}_X`;
      
      // Get country-specific export elasticity if available, or use flow-specific elasticity
      const elasticity = f.reporterISO3 === 'USA' && countryElasticities[f.partnerISO] ? 
        countryElasticities[f.partnerISO].export : Math.abs(f.elasticity || 1.5);
      
      // Apply tariff effect to exports
      const adjusted = f.primaryValue * Math.pow(1 + tariffRate, -elasticity) * 
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
          elasticity: elasticity,
          baseTotal: 0,
          isUSExport: f.reporterISO3 === 'USA'
        };
      }
      agg[key].simTotal += adjusted;
      agg[key].baseTotal += f.primaryValue;
    });
    
    // Process import flows (other countries to USA)
    importFlows.forEach(f => {
      if (f.srcLat == null || f.dstLat == null || f.reporterISO3 !== 'USA') return;
      
      const key = `${f.partnerISO}_${f.reporterISO3}_M`;
      
      // Get country-specific import elasticity if available, or use flow-specific elasticity
      const elasticity = countryElasticities[f.partnerISO] ? 
        countryElasticities[f.partnerISO].import : Math.abs(f.elasticity || 1.5);
      
      // Get actual import value from data
      const baseValue = f.primaryValue;
      
      // Apply tariff effect only if retaliation is enabled
      const adjusted = retaliationEnabled 
        ? baseValue * Math.pow(1 + tariffRate, -elasticity)
        : baseValue;
      
      if (!agg[key]) {
        agg[key] = { 
          startLat: f.srcLat, 
          startLng: f.srcLng, 
          endLat: f.dstLat, 
          endLng: f.dstLng, 
          simTotal: 0,
          reporterISO3: f.partnerISO,  // Swapped for imports
          partnerISO: f.reporterISO3,  // Swapped for imports
          elasticity: elasticity,
          baseTotal: 0,
          isImport: true
        };
      }
      
      agg[key].simTotal += adjusted;
      agg[key].baseTotal += baseValue;
    });
    
    // Calculate standard flows (USA exports only) for impact calculations
    const usaExportArcs = Object.values(agg).filter(o => o.isUSExport);
    const standardSimTotal = usaExportArcs.reduce((sum, a) => sum + a.simTotal, 0);
    const standardBaseTotal = usaExportArcs.reduce((sum, a) => sum + a.baseTotal, 0);
    
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
  }, [tariffRate, retaliationEnabled, exportFlows, importFlows, countryElasticities]);

  // Calculate the percentage changes
  const calculateImpact = () => {
    const { standardSimTotal, standardBaseTotal } = stats;
    
    let tradePctChange;
    if (retaliationEnabled) {
      // When retaliation is enabled, the impact should be greater but realistic
      const standardImpact = ((standardSimTotal - standardBaseTotal) / standardBaseTotal);
      
      // Adjusted for export-specific impact
      const retaliationMultiplier = 1.8; // Slightly higher since focused on exports only
      
      // Calculate bounded impact that can't exceed -85%
      let rawImpact = standardImpact * retaliationMultiplier;
      if (rawImpact < 0) {
        rawImpact = -0.85 * (1.0 - Math.exp(1.65 * rawImpact));
      }
      
      tradePctChange = rawImpact * 100;
    } else {
      // When no retaliation, just compare USA export flows
      tradePctChange = ((standardSimTotal - standardBaseTotal) / standardBaseTotal) * 100;
    }

    // Adjusted for US exports-to-GDP ratio (lower than total trade)
    const gdpPctImpact = tradePctChange * 0.12 * 0.85;
    
    return {
      tradePctChange,
      gdpPctImpact
    };
  };

  // Public API: Get elasticities for a specific country
  const getCountryElasticities = (countryISO) => {
    return countryElasticities[countryISO] || { 
      export: 0, 
      import: 0,
      total: 0
    };
  };

  return {
    flows: [...exportFlows, ...importFlows],
    baselineArcs,
    simArcs,
    stats,
    loading,
    error,
    normalize,
    calculateImpact,
    getCountryElasticities
  };
}