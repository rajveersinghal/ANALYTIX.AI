import { useEffect, useState, useRef } from 'react';

import { BASE_URL } from '../api/api';

const API_BASE_URL = BASE_URL;

export const useSSE = (datasetId) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!datasetId) return;

    // Build URL
    const url = `${API_BASE_URL}/status/events/${datasetId}`;
    
    console.log(`[SSE] Connecting to: ${url}`);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.error("[SSE] Parse Error:", err);
      }
    };

    es.onerror = (err) => {
      console.error("[SSE] Connection Error:", err);
      setError(err);
      es.close();
    };

    return () => {
      if (eventSourceRef.current) {
        console.log("[SSE] Closing connection");
        eventSourceRef.current.close();
      }
    };
  }, [datasetId]);

  return { data, error };
};
