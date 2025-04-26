import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function USATradeStats({ csvUrl = '/flows.csv' }) {
  const [tradeVolumes, setTradeVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced color palette for the pie chart
  const COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];

  useEffect(() => {
    // Existing data loading logic
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

  // Loading state with improved styling
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      fontSize: '1.2rem',
      color: '#3498db'
    }}>
      <div>Loading USA trade data...</div>
    </div>
  );
  
  // Error state with improved styling
  if (error) return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      color: 'white',
      backgroundColor: '#e74c3c',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h3>Error Loading Data</h3>
      <div>{String(error)}</div>
    </div>
  );
  
  if (!tradeVolumes.length) return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      color: '#aaa',
      textAlign: 'center',
      backgroundColor: '#2c3e50',
      borderRadius: '8px'
    }}>No USA trade data found</div>
  );

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

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{ 
          backgroundColor: 'rgba(30, 40, 50, 0.9)',
          padding: '10px',
          border: '1px solid #444',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          color: '#eee'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.name}</div>
          <div>Volume: {data.value.toLocaleString()}</div>
          <div>Share: {((data.value / totalVolume) * 100).toFixed(2)}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      color: '#eee',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: 1.6,
      backgroundColor: '#1a2634',
      height: '100%',
      overflowY: 'auto'
    }}>
      <h1 style={{ 
        color: '#3498db', 
        borderBottom: '3px solid #3498db', 
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center' 
      }}>
        USA Trade Statistics
      </h1>
      
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#eee', margin: '0 0 0.5rem' }}>Total Trade Volume</h2>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#3498db' 
        }}>
          {totalVolume.toLocaleString()}
        </div>
        <div style={{ color: '#bbb', fontSize: '0.9rem' }}>
          Across all trading partners
        </div>
      </div>
      
      {/* Pie Chart with enhanced styling */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          color: '#eee', 
          marginTop: 0, 
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          Trade Distribution by Country
        </h2>
        
        <div style={{ width: '100%', height: 400 }}>
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Table with enhanced styling */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ 
          color: '#eee', 
          marginTop: 0, 
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          Detailed Country Breakdown
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            <thead>
              <tr style={{ 
                borderBottom: '2px solid #3498db',
                backgroundColor: '#1e2c3a'
              }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '1rem',
                  color: '#eee'
                }}>Country</th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '1rem',
                  color: '#eee'
                }}>Volume</th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '1rem',
                  color: '#eee'
                }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {tradeVolumes.map(({ country, volume }, index) => (
                <tr 
                  key={country} 
                  style={{ 
                    borderBottom: '1px solid #445566',
                    backgroundColor: index % 2 === 0 ? '#2c3e50' : '#253545'
                  }}
                >
                  <td style={{ 
                    padding: '0.8rem 1rem', 
                    fontWeight: index < 5 ? 'bold' : 'normal',
                    color: '#eee'
                  }}>
                    {country}
                  </td>
                  <td style={{ 
                    textAlign: 'right', 
                    padding: '0.8rem 1rem',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    color: '#eee'
                  }}>
                    {volume.toLocaleString()}
                  </td>
                  <td style={{ 
                    textAlign: 'right', 
                    padding: '0.8rem 1rem',
                    color: index < 3 ? '#e74c3c' : '#bbb',
                    fontWeight: index < 3 ? 'bold' : 'normal'
                  }}>
                    {((volume / totalVolume) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}