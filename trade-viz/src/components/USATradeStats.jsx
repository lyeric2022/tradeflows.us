import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import centroids from '../iso_centroids.json';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function USATradeStats({ csvUrl = '/flows.csv' }) {
  const [tradeVolumes, setTradeVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

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

  // Prepare data for pie chart - take top 9 countries and group the rest as "Others"
  const pieData = [];
  const topCountries = tradeVolumes.slice(0, 9);
  let othersVolume = 0;

  topCountries.forEach(item => {
    pieData.push({
      name: item.country,
      value: item.volume
    });
  });

  if (tradeVolumes.length > 9) {
    for (let i = 9; i < tradeVolumes.length; i++) {
      othersVolume += tradeVolumes[i].volume;
    }
    pieData.push({
      name: 'Others',
      value: othersVolume
    });
  }

  return (
    <div style={{ padding: '1rem', maxHeight: '80vh', overflow: 'auto' }}>
      <h2>Total Trade Volume with USA</h2>
      <p>Total volume across all countries: {totalVolume.toLocaleString()}</p>
      
      {/* Pie Chart */}
      <div style={{ width: '100%', height: 400, marginBottom: 30 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Table */}
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