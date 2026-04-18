import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Removed static mock data for MANDI_PRICES and DEMAND_FORECAST as they are now dynamic

import { marketplaceAPI, coldStorageAPI, transportAPI, labAPI } from '../lib/api';

/* ─── Mock Data Removed ─── */


/* ─── Provider ─── */
export function AppProvider({ children }) {
  // Real-time market data hook
  const { prices: mandiPrices, loading: pricesLoading, error: pricesError, refreshPrices } = useRealtimePrices();

  // user = null means not logged in
  const [user, setUserState] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'offer', text: 'New offer from Rajesh Agromart: ₹5,350/quintal', time: '2m ago', read: false },
    { id: 2, type: 'transport', text: 'Transport confirmed — VehicleNo: MP09AB1234', time: '1h ago', read: true },
    { id: 3, type: 'lab', text: 'Lab test report ready — Grade A Certified', time: '2h ago', read: true },
  ]);
  const [buyerOffers, setBuyerOffers] = useState([]);
  const [coldStorages, setColdStorages] = useState([]);
  const [transportProviders, setTransportProviders] = useState([]);
  const [labs, setLabs] = useState([]);
  const [farmerListings, setFarmerListings] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  // ── Dark Mode (default: light) ──
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('aarohan-theme') === 'dark');
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('aarohan-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('aarohan-theme', 'light');
    }
  }, [darkMode]);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  /* Fetch global catalog data on mount */
  useEffect(() => {
    Promise.allSettled([
      marketplaceAPI.getBuyerOffers(),
      coldStorageAPI.list(),
      transportAPI.getProviders(),
      labAPI.list(),
      marketplaceAPI.getListings({ limit: 10 }),
    ]).then(results => {
      if (results[0].status === 'fulfilled') setBuyerOffers(results[0].value.offers || []);
      if (results[1].status === 'fulfilled') setColdStorages(results[1].value.storages || []);
      if (results[2].status === 'fulfilled') setTransportProviders(results[2].value.providers || []);
      if (results[3].status === 'fulfilled') setLabs(results[3].value.labs || []);
      if (results[4].status === 'fulfilled') setFarmerListings(results[4].value.listings || []);
    });
  }, []);

  /* Persist user to sessionStorage */
  const setUser = (userData) => {
    setUserState(userData);
    if (userData) sessionStorage.setItem('aarohan-user', JSON.stringify(userData));
    else sessionStorage.removeItem('aarohan-user');
  };

  /* Restore from sessionStorage on reload */
  useEffect(() => {
    const saved = sessionStorage.getItem('aarohan-user');
    if (saved) {
      try { setUserState(JSON.parse(saved)); } catch { }
    }
  }, []);

  /* Online/offline detection */
  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setIsOffline(!navigator.onLine);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const logout = () => {
    setUser(null);
    window.location.href = '/login';
  };

  /* Global Socket Listeners for Alerts / Notifications */
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://aarohan-agri.onrender.com';
    const token = localStorage.getItem('aarohan-token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    socket.on('alert:price-spike', (alertData) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'alert',
          text: `Live Alert: ${alertData.message}`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    });

    socket.on('offer:new', (data) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'offer',
          text: data.message,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser, logout,
      isOffline,
      notifications, setNotifications, unreadCount, markAllRead,
      showNotifications, setShowNotifications,
      mandiPrices: mandiPrices.map(p => ({
        ...p,
        cropKey: `crops.${p.crop.toLowerCase()}`
      })),
      pricesLoading,
      pricesError,
      refreshPrices,
      buyerOffers,
      coldStorages,
      transportProviders,
      labs,
      farmerListings,
      darkMode, toggleDarkMode,
    }}>
      {children}
    </AppContext.Provider>
  );
}
