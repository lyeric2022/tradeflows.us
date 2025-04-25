import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import centroids from '../iso_centroids.json';

export default function USATradeStats({ csvUrl = '/flows.csv' }) {
  const [tradeVolumes, setTradeVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Aggregate trade volumes with USA
        const countryVolumes = {};
        
        data.forEach(flow => {
          // Only process flows involving USA
          if (flow.reporterISO3 === 'USA' || flow.partnerISO === 'USA') {
            const otherCountry = flow.reporterISO3 === 'USA' 
              ? flow.partnerISO 
              : flow.reporterISO3;
            
            if (!countryVolumes[otherCountry]) {
              countryVolumes[otherCountry] = 0;
            }
            
            countryVolumes[otherCountry] += flow.primaryValue;
          }
        });
        
        // Convert to sorted array
        const volumeArray = Object.entries(countryVolumes)
          .map(([country, volume]) => ({ 
            country, 
            volume,
            countryName: country // Ideally replace with actual country name if available
          }))
          .sort((a, b) => b.volume - a.volume);
          
        setTradeVolumes(volumeArray);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [csvUrl]);

  // Handle loading and error states
  if (loading) return <div>Loading USA trade data...</div>;
  if (error) return <div style={{ color: 'salmon' }}>Error: {String(error)}</div>;
  if (!tradeVolumes.length) return <div>No USA trade data found</div>;

  // Calculate total volume for reference
  const totalVolume = tradeVolumes.reduce((sum, entry) => sum + entry.volume, 0);

  return (
    <div style={{ padding: '1rem', maxHeight: '80vh', overflow: 'auto' }}>
      <h2>Total Trade Volume with USA</h2>
      <p>Total volume across all countries: {totalVolume.toLocaleString()}</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Country</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Volume</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>% of Total</th>
          </tr>
        </thead>
        <tbody>
          {tradeVolumes.map(({ country, volume }) => (
            <tr key={country} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{country}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{volume.toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>
                {((volume / totalVolume) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}