import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import centroids from '../iso_centroids.json';

export function useFlows(url = '/flows.csv') {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(csv => {
        const { data, errors } = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
        if (errors.length) throw errors;
        
        // Enrich data with coordinates
        const enriched = data.map(f => {
          const [srcLng, srcLat] = centroids[f.reporterISO3] || [];
          const [dstLng, dstLat] = centroids[f.partnerISO] || [];
          return {
            ...f,
            srcLat, srcLng,
            dstLat, dstLng,
            // Explicitly mark as import or export based on flowCode
            isImport: f.flowCode === 'M',
            isExport: f.flowCode === 'X'
          };
        }).filter(f => f.srcLat && f.srcLng && f.dstLat && f.dstLng);
        
        setFlows(enriched);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  // Calculate aggregated trade stats by country
  const tradeStats = useMemo(() => {
    if (!flows.length) return { countries: [], totals: { exports: 0, imports: 0, total: 0 } };
    
    // Aggregate trade volumes
    const countryVolumes = {};
    
    flows.forEach(flow => {
      // Skip flows without valid values
      if (!flow.primaryValue) return;
      
      const focalCountry = 'USA';
      
      // Get both country code (for keys) and description (for display)
      let countryCode, countryName;
      
      if (flow.reporterISO3 === focalCountry) {
        countryCode = flow.partnerISO;
        countryName = flow.partnerDesc;
      } else {
        countryCode = flow.reporterISO3;
        countryName = flow.reporterDesc;
      }
      
      // Use ISO code as key for consistency
      if (!countryVolumes[countryCode]) {
        countryVolumes[countryCode] = {
          code: countryCode,
          name: countryName,
          exports: 0,
          imports: 0,
          total: 0
        };
      }
      
      // Use the explicit flowCode to determine import vs export
      if (flow.flowCode === 'X') {
        countryVolumes[countryCode].exports += flow.primaryValue;
      } else if (flow.flowCode === 'M') {
        countryVolumes[countryCode].imports += flow.primaryValue;
      }
      
      countryVolumes[countryCode].total += flow.primaryValue;
    });
    
    // Convert to sorted array
    const countries = Object.values(countryVolumes)
      .map(volumes => ({ 
        country: volumes.code,        // Keep code for reference
        countryName: volumes.name,    // Add full country name
        exports: volumes.exports,
        imports: volumes.imports,
        volume: volumes.total,
        balance: volumes.exports - volumes.imports
      }))
      .sort((a, b) => b.volume - a.volume);
    
    // Calculate global totals
    const totals = {
      exports: countries.reduce((sum, c) => sum + c.exports, 0),
      imports: countries.reduce((sum, c) => sum + c.imports, 0),
      total: countries.reduce((sum, c) => sum + c.volume, 0)
    };
    
    return { countries, totals };
  }, [flows]);

  return { 
    flows, 
    loading, 
    error,
    tradeStats
  };
}
