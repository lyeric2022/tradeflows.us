import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFlows } from '../hooks/useFlows';

export default function USATradeStats() {
    const { flows, loading, error, tradeStats } = useFlows();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tradeType, setTradeType] = useState('goods'); // New state for toggle

    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Access aggregated data
    const { countries, totals } = tradeStats;

    // Enhanced color palette for the pie chart
    const COLORS = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];

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

    if (!flows.length) return (
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
    const totalVolume = totals.total;

    // Prepare data for pie chart - take top 9 countries and group the rest as "Others"
    const pieData = [];
    const topCountries = countries.slice(0, 9);
    let othersVolume = 0;

    topCountries.forEach(item => {
        pieData.push({
            name: item.countryName, // Use country name instead of code
            value: item.volume
        });
    });

    if (countries.length > 9) {
        for (let i = 9; i < countries.length; i++) {
            othersVolume += countries[i].volume;
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
                    <div>Volume: {`$${data.value.toLocaleString()}`}</div>
                    <div>Share: {((data.value / totalVolume) * 100).toFixed(2)}%</div>
                </div>
            );
        }
        return null;
    };

    // Define services trade data based on the provided information
    const servicesTradeData = {
        total: 1774.8 * 1000000000, // $1,774.8 billion (exports + imports)
        exports: 1026.6 * 1000000000, // $1,026.6 billion
        imports: 748.2 * 1000000000, // $748.2 billion
        balance: 288.2 * 1000000000, // $288.2 billion surplus
        countries: [
            // Placeholder data - in a real app, you would have actual data here
            { countryName: "United Kingdom", exports: 74.1 * 1000000000, imports: 62.3 * 1000000000, volume: 136.4 * 1000000000, balance: 11.8 * 1000000000 },
            { countryName: "European Union", exports: 230.4 * 1000000000, imports: 171.8 * 1000000000, volume: 402.2 * 1000000000, balance: 58.6 * 1000000000 },
            { countryName: "China", exports: 58.2 * 1000000000, imports: 20.7 * 1000000000, volume: 78.9 * 1000000000, balance: 37.5 * 1000000000 },
            { countryName: "Japan", exports: 47.3 * 1000000000, imports: 35.9 * 1000000000, volume: 83.2 * 1000000000, balance: 11.4 * 1000000000 },
            { countryName: "Canada", exports: 69.8 * 1000000000, imports: 40.2 * 1000000000, volume: 110.0 * 1000000000, balance: 29.6 * 1000000000 },
            // Additional countries would be here
        ]
    };

    // Calculate combined trade data
    const allTradeData = {
        total: tradeStats.totals.total + servicesTradeData.total,
        exports: tradeStats.totals.exports + servicesTradeData.exports,
        imports: tradeStats.totals.imports + servicesTradeData.imports,
        balance: tradeStats.totals.exports - tradeStats.totals.imports + servicesTradeData.balance,
        // Combined countries data would be more complex in a real implementation
        countries: tradeStats.countries
    };

    // Select the data to display based on toggle
    const displayData = {
        totals: tradeType === 'goods' ? tradeStats.totals : 
               tradeType === 'services' ? servicesTradeData : 
               allTradeData,
        countries: tradeType === 'goods' ? tradeStats.countries : 
                  tradeType === 'services' ? servicesTradeData.countries : 
                  allTradeData.countries
    };

    return (
        <div style={{
            padding: isMobile ? '1rem' : '2rem',
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
                textAlign: 'center',
                fontSize: isMobile ? '1.8rem' : '2.2rem'
            }}>
                USA Trade Statistics
            </h1>

            {/* Trade Type Toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem',
                backgroundColor: '#2c3e50',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #3498db'
                }}>
                    {['goods', 'services', 'all'].map(type => (
                        <button
                            key={type}
                            onClick={() => setTradeType(type)}
                            style={{
                                backgroundColor: tradeType === type ? '#3498db' : 'transparent',
                                color: tradeType === type ? '#fff' : '#eee',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer',
                                fontWeight: tradeType === type ? 'bold' : 'normal',
                                fontSize: '1rem',
                                transition: 'background-color 0.3s ease',
                                textTransform: 'capitalize'
                            }}
                        >
                            {type === 'all' ? 'All Trade' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trade Summary Cards - use displayData instead of tradeStats directly */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {/* Total Trade Volume Card */}
                <div style={{
                    backgroundColor: '#2c3e50',
                    padding: isMobile ? '1rem' : '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    flex: isMobile ? '1 1 100%' : '1 1 30%',
                    minWidth: isMobile ? '100%' : '250px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        color: '#eee', 
                        margin: '0 0 0.5rem',
                        fontSize: isMobile ? '1.3rem' : '1.5rem' 
                    }}>Total Trade Volume</h2>
                    <div style={{
                        fontSize: isMobile ? '1.6rem' : '2rem',
                        fontWeight: 'bold',
                        color: '#3498db'
                    }}>
                        {`$${displayData.totals.total.toLocaleString()}`}
                    </div>
                    <div style={{ color: '#bbb', fontSize: '0.9rem' }}>
                        {tradeType === 'goods' ? 'Goods trade across all partners' : 
                         tradeType === 'services' ? 'Services trade across all partners' : 
                         'Goods & services across all partners'}
                    </div>
                </div>
                
                {/* Trade Balance Card */}
                <div style={{
                    backgroundColor: '#2c3e50',
                    padding: isMobile ? '1rem' : '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    flex: isMobile ? '1 1 100%' : '1 1 30%',
                    minWidth: isMobile ? '100%' : '250px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        color: '#eee', 
                        margin: '0 0 0.5rem',
                        fontSize: isMobile ? '1.3rem' : '1.5rem'
                    }}>Trade Balance</h2>
                    <div style={{
                        fontSize: isMobile ? '1.6rem' : '2rem',
                        fontWeight: 'bold',
                        color: displayData.totals.exports >= displayData.totals.imports ? '#2ecc71' : '#e74c3c'
                    }}>
                        {displayData.totals.exports >= displayData.totals.imports 
                            ? `$${(displayData.totals.exports - displayData.totals.imports).toLocaleString()}`
                            : `-$${Math.abs(displayData.totals.exports - displayData.totals.imports).toLocaleString()}`
                        }
                    </div>
                    <div style={{ color: '#bbb', fontSize: '0.9rem' }}>
                        {displayData.totals.exports > displayData.totals.imports ? 'Trade Surplus' : 'Trade Deficit'}
                    </div>
                </div>

                {/* Exports Card */}
                <div style={{
                    backgroundColor: '#2c3e50',
                    padding: isMobile ? '1rem' : '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    flex: isMobile ? '1 1 100%' : '1 1 30%',
                    minWidth: isMobile ? '100%' : '250px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        color: '#eee', 
                        margin: '0 0 0.5rem',
                        fontSize: isMobile ? '1.3rem' : '1.5rem' 
                    }}>Total Exports</h2>
                    <div style={{
                        fontSize: isMobile ? '1.6rem' : '2rem',
                        fontWeight: 'bold',
                        color: '#2ecc71'
                    }}>
                        {`$${displayData.totals.exports.toLocaleString()}`}
                    </div>
                    <div style={{ color: '#bbb', fontSize: '0.9rem' }}>
                        From USA to other countries
                    </div>
                </div>

                {/* Imports Card */}
                <div style={{
                    backgroundColor: '#2c3e50',
                    padding: isMobile ? '1rem' : '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    flex: isMobile ? '1 1 100%' : '1 1 30%',
                    minWidth: isMobile ? '100%' : '250px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        color: '#eee', 
                        margin: '0 0 0.5rem',
                        fontSize: isMobile ? '1.3rem' : '1.5rem' 
                    }}>Total Imports</h2>
                    <div style={{
                        fontSize: isMobile ? '1.6rem' : '2rem',
                        fontWeight: 'bold',
                        color: '#e74c3c'
                    }}>
                        {`$${displayData.totals.imports.toLocaleString()}`}
                    </div>
                    <div style={{ color: '#bbb', fontSize: '0.9rem' }}>
                        To USA from other countries
                    </div>
                </div>
            </div>

            {/* Import/Export comparison bar chart */}
            <div style={{
                backgroundColor: '#2c3e50',
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                marginBottom: '2rem'
            }}>
                <h2 style={{
                    color: '#eee',
                    marginTop: 0,
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    fontSize: isMobile ? '1.3rem' : '1.5rem'
                }}>
                    Top Trading Partners - Imports vs Exports
                </h2>

                <div style={{ width: '100%', height: isMobile ? 300 : 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={countries.slice(0, 10)}
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />  // Lighter grid lines
                            <XAxis 
                                type="number" 
                                tickFormatter={(value) => `$${(value / 1000000000).toFixed(0)} Billions`}
                                tick={{ fill: '#ffffff', fontSize: 12 }}  // Add this line for better visibility
                            />
                            <YAxis 
                                dataKey="countryName" 
                                type="category" 
                                tick={{ fill: '#ffffff', fontSize: 12 }}  // Add this line for better visibility
                            />
                            <Tooltip formatter={(value) => `$${(value / 1000000000).toFixed(1)} Billions`} />
                            <Legend wrapperStyle={{ color: '#ffffff' }} />  // White text for legend
                            <Bar dataKey="exports" name="Exports" fill="#2ecc71" />
                            <Bar dataKey="imports" name="Imports" fill="#e74c3c" />
                        </BarChart>
                    </ResponsiveContainer>
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

            {/* Table with enhanced styling - now including imports and exports */}
            <div style={{
                backgroundColor: '#2c3e50',
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{
                    color: '#eee',
                    marginTop: 0,
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    fontSize: isMobile ? '1.3rem' : '1.5rem'
                }}>
                    Detailed Country Breakdown
                </h2>

                <div style={{ 
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'  // For smoother scrolling on iOS
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: isMobile ? '0.85rem' : '1rem'
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
                                    color: '#2ecc71'
                                }}>Exports</th>
                                <th style={{
                                    textAlign: 'right',
                                    padding: '1rem',
                                    color: '#e74c3c'
                                }}>Imports</th>
                                <th style={{
                                    textAlign: 'right',
                                    padding: '1rem',
                                    color: '#eee'
                                }}>Total Volume</th>
                                <th style={{
                                    textAlign: 'right',
                                    padding: '1rem',
                                    color: '#3498db'
                                }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countries.map(({ countryName, exports, imports, volume, balance }, index) => (
                                <tr
                                    key={countryName}
                                    style={{
                                        borderBottom: '1px solid #445566',
                                        backgroundColor: index % 2 === 0 ? '#2c3e50' : '#253545'
                                    }}
                                >
                                    <td style={{
                                        padding: isMobile ? '0.5rem' : '0.8rem 1rem',
                                        fontWeight: index < 5 ? 'bold' : 'normal',
                                        color: '#eee'
                                    }}>
                                        {countryName} {/* Use countryName here */}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: isMobile ? '0.5rem' : '0.8rem 1rem',
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        color: '#2ecc71'
                                    }}>
                                        {`$${exports.toLocaleString()}`}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: isMobile ? '0.5rem' : '0.8rem 1rem',
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        color: '#e74c3c'
                                    }}>
                                        {`$${imports.toLocaleString()}`}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: isMobile ? '0.5rem' : '0.8rem 1rem',
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        color: '#eee'
                                    }}>
                                        {`$${volume.toLocaleString()}`}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: isMobile ? '0.5rem' : '0.8rem 1rem',
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        color: balance >= 0 ? '#2ecc71' : '#e74c3c',
                                        fontWeight: Math.abs(balance) > 1000000 ? 'bold' : 'normal'
                                    }}>
                                        {balance >= 0 
                                            ? `$${balance.toLocaleString()}`
                                            : `-$${Math.abs(balance).toLocaleString()}`
                                        }
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