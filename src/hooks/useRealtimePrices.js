import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { mandiAPI } from '../lib/api';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://aarohan-agri.onrender.com'
export function useRealtimePrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [source, setSource] = useState('Fetching...');

  const fetchPrices = () => {
    setLoading(true);
    mandiAPI.getPrices()
      .then(res => {
        if (res.success) {
          setPrices(res.prices || []);
          setLastUpdated(res.lastUpdated);
          setSource(res.source);
        }
      })
      .catch(err => {
        console.error('Failed to fetch initial prices:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrices();

    // Connect to Socket.io server with exponential backoff
    const token = localStorage.getItem('aarohan-token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    let debounceTimer;

    socket.on('connect', () => {
      console.log('🔗 Connected to real-time price engine');
    });

    // Handle full snapshot (sent on connect or requested)
    socket.on('price:snapshot', (data) => {
      setPrices(data.prices);
      setLastUpdated(data.lastUpdated);
      setSource(data.source);
      setLoading(false);
    });

    // Handle periodic incremental updates (debounced max 1 update/sec)
    socket.on('price:update', (data) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setPrices(data.prices);
        setLastUpdated(data.lastUpdated);
        setSource(data.source);
      }, 1000);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError('Real-time connection lost. Retrying...');
    });

    return () => {
      clearTimeout(debounceTimer);
      socket.disconnect();
    };
  }, []);

  return { prices, loading, error, lastUpdated, source, refetch: fetchPrices, refreshPrices: fetchPrices };
}
