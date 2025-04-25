import { useState, useEffect } from 'react';
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
        setFlows(data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  console.log('Flows loaded:', flows.length, 'records');
  return { flows, loading, error };
}
