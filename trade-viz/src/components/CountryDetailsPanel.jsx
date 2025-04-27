import React from 'react';

/**
 * Component to display detailed information about a selected country.
 * Shows directional elasticities and trade flow impacts.
 */
export default function CountryDetailsPanel({ 
  selectedCountry, 
  countryFlows, 
  tariffRate, 
  onClose, 
  windowWidth,
  countryElasticities
}) {
  
  // Calculate weighted average elasticity with direction support
  const getWeightedElasticity = (flows, direction) => {
    if (!flows || flows.length === 0) return 0;
    
    // Filter flows by direction if specified
    const filteredFlows = direction === 'export' 
      ? flows.filter(f => !f.isImport)
      : direction === 'import'
        ? flows.filter(f => f.isImport)
        : flows;
    
    if (filteredFlows.length === 0) return 0;
    
    let totalValue = 0;
    let weightedSum = 0;
    
    filteredFlows.forEach(flow => {
      totalValue += flow.baseTotal;
      weightedSum += (Math.abs(flow.elasticity) * flow.baseTotal);
    });
    
    return totalValue > 0 ? weightedSum / totalValue : 0;
  };

  // Get elasticity data for the selected country
  const getElasticityData = () => {
    if (!selectedCountry || !countryElasticities) return { export: 0, import: 0, total: 0 };
    
    // Get from the passed elasticities prop, or calculate from flows
    return countryElasticities[selectedCountry.iso3] || {
      export: getWeightedElasticity(countryFlows, 'export'),
      import: getWeightedElasticity(countryFlows, 'import'),
      total: getWeightedElasticity(countryFlows)
    };
  };

  // Style definitions
  const infoStyle = {
    position: 'absolute',
    top: windowWidth <= 768 ? '200px' : '50px', 
    right: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: windowWidth <= 768 ? '10px' : '15px',
    borderRadius: '6px',
    maxWidth: windowWidth <= 768 ? '90%' : '350px',
    width: windowWidth <= 768 ? 'calc(100% - 20px)' : 'auto',
    maxHeight: windowWidth <= 768 ? 'calc(60vh)' : 'calc(100vh - 100px)',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 2px 15px rgba(0,0,0,0.5)',
    fontSize: windowWidth <= 768 ? '12px' : '14px'
  };

  const closeBtn = {
    position: 'absolute',
    top: '5px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: windowWidth <= 768 ? '18px' : '22px',
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1'
  };

  if (!selectedCountry) return null;
  
  // Get country-specific elasticity data
  const elasticityData = getElasticityData();
  
  // Calculate export and import totals
  const exportFlows = countryFlows.filter(f => !f.isImport);
  const importFlows = countryFlows.filter(f => f.isImport);
  
  const exportTotal = exportFlows.reduce((sum, flow) => sum + flow.value, 0);
  const exportBaseTotal = exportFlows.reduce((sum, flow) => sum + flow.baseTotal, 0);
  const exportPctChange = exportBaseTotal > 0 
    ? ((exportTotal - exportBaseTotal) / exportBaseTotal * 100).toFixed(2)
    : '0.00';
    
  const importTotal = importFlows.reduce((sum, flow) => sum + flow.value, 0);
  const importBaseTotal = importFlows.reduce((sum, flow) => sum + flow.baseTotal, 0);
  const importPctChange = importBaseTotal > 0 
    ? ((importTotal - importBaseTotal) / importBaseTotal * 100).toFixed(2)
    : '0.00';

  return (
    <div style={infoStyle} data-info-panel="true">
      <button onClick={onClose} style={closeBtn}>×</button>
      <h2>{selectedCountry.countryDesc || selectedCountry.iso3}</h2>
      
      <h4 style={{ 
        marginBottom: '6px', 
        borderBottom: '1px solid rgba(255,255,255,0.2)', 
        paddingBottom: '5px',
        fontSize: windowWidth <= 768 ? '14px' : '16px'
      }}>Trade Flows:</h4>
      
      <div style={{ 
        maxHeight: windowWidth <= 768 ? '40vh' : '50vh', 
        overflowY: 'auto', 
        paddingRight: '5px'
      }}>
        {countryFlows.map((flow, idx) => (
          <div key={idx} style={{ 
            borderBottom: '1px solid rgba(255,255,255,0.2)', 
            marginBottom: windowWidth <= 768 ? '6px' : '8px',
            paddingBottom: windowWidth <= 768 ? '6px' : '8px' 
          }}>
            <div>
              <strong>
                {flow.reporterDesc || flow.reporterISO3} → {flow.partnerDesc || flow.partnerISO}
                {flow.isImport && <span style={{ color: '#ff9966' }}> (Import)</span>}
                {!flow.isImport && <span style={{ color: '#66ff99' }}> (Export)</span>}
              </strong>
            </div>
            <div style={{ fontSize: windowWidth <= 768 ? '11px' : 'inherit' }}>
              Value: {flow.value.toLocaleString()}
            </div>
            <div style={{ fontSize: windowWidth <= 768 ? '11px' : 'inherit' }}>
              Original: {flow.baseTotal.toLocaleString()}
            </div>
            {windowWidth > 768 && flow.elasticity && 
              <div>Elasticity: {Math.abs(flow.elasticity).toFixed(2)}</div>
            }
            <div style={{ fontSize: windowWidth <= 768 ? '11px' : 'inherit' }}>
              Change: 
              <span style={{ 
                color: flow.value < flow.baseTotal ? '#ff8080' : '#80ff80',
                fontWeight: 'bold',
                marginLeft: '4px'
              }}>
                {(((flow.value - flow.baseTotal) / flow.baseTotal) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
        {countryFlows.length === 0 && (
          <p>No trade data available for this country.</p>
        )}
      </div>
      
      {/* Only show detailed summary on larger screens */}
      {countryFlows.length > 0 && (
        <div>
          {/* Only show elasticity explainer on larger screens */}
          {windowWidth > 768 && (
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              background: 'rgba(33, 150, 243, 0.1)', 
              padding: '8px', 
              borderRadius: '4px',
              borderLeft: '3px solid #2196F3',
            }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>About Trade Elasticity</p>
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ color: '#66ff99', fontWeight: 'bold' }}>Export elasticity</span> shows how sensitive USA exports TO this country are to tariff changes.
              </p>
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ color: '#ff9966', fontWeight: 'bold' }}>Import elasticity</span> shows how sensitive imports FROM this country are to tariff changes.
              </p>
              <p style={{ margin: '0' }}>
                Higher elasticity values mean trade flows are more sensitive to tariff changes. 
                Products like vehicles (elasticity ≈ 4.48) show large impacts, while aerospace products (elasticity ≈ 0.11) are less affected.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}