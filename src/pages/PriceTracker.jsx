import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForecast } from '../hooks/useForecast';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import {
  Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Bar, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, RefreshCw, Bell, AlertTriangle,
  ShieldCheck, Activity, BarChart2, MapPin, Search, ChevronUp, ChevronDown,
  Layout, Zap, Sparkles, Navigation, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

const mandiIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const MANDI_MAP_DATA = [
  { name: 'Indore APMC',           lat: 22.7196, lng: 75.8577, crops: ['Soybean','Wheat','Onion'],  vol: 'High'   },
  { name: 'Ujjain Mandi',          lat: 23.1765, lng: 75.7885, crops: ['Soybean','Wheat'],           vol: 'High'   },
  { name: 'Dewas APMC',            lat: 22.9627, lng: 76.0509, crops: ['Soybean','Gram'],            vol: 'Medium' },
  { name: 'Bhopal Krishi Mandi',   lat: 23.2599, lng: 77.4126, crops: ['Gram','Wheat','Rice'],       vol: 'High'   },
  { name: 'Ratlam APMC',           lat: 23.3311, lng: 75.0367, crops: ['Tomato','Sorghum','Garlic'], vol: 'Medium' },
];

const CROPS = [
  { name: 'Soybean',    emoji: '🫘', unit: 'qtl', base: 5200, category: 'Oilseed',    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },
  { name: 'Wheat',      emoji: '🌾', unit: 'qtl', base: 2350, category: 'Cereal',     img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { name: 'Gram',       emoji: '🟡', unit: 'qtl', base: 5050, category: 'Pulse',      img: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&q=80' },
  { name: 'Mustard',    emoji: '🌻', unit: 'qtl', base: 5400, category: 'Oilseed',    img: 'https://images.unsplash.com/photo-1591608516485-a1a53df39498?w=400&q=80' },
  { name: 'Onion',      emoji: '🧅', unit: 'qtl', base: 1800, category: 'Vegetable',  img: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80' },
  { name: 'Garlic',     emoji: '🧄', unit: 'qtl', base: 8500, category: 'Spice',      img: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&q=80' },
  { name: 'Cotton',     emoji: '🌿', unit: 'qtl', base: 6400, category: 'Fiber',      img: 'https://images.unsplash.com/photo-1598524374912-48fcbc94f66d?w=400&q=80' },
  { name: 'Sugarcane',  emoji: '🎋', unit: 'ton', base: 3100, category: 'Cash Crop',  img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80' },
];

const CAT_COLORS = {
  Cereal: '#E0F2FE', Pulse: '#FEF3C7', Oilseed: '#FCE7F3', Vegetable: '#DCFCE7',
  Spice: '#FEE2E2', Fiber: '#E0F2FE', 'Cash Crop': '#F3E8FF',
};

function seedPrice(base, idx, days) {
  const series = [];
  let p = base;
  for (let d = 0; d < days; d++) {
    p = p + (Math.random() - 0.48) * 40;
    series.push({ date: d === days - 1 ? 'Today' : `D${d}`, price: Math.round(p) });
  }
  return series;
}

export default function PriceTracker() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('Soybean');
  const [days, setDays] = useState(30);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const { prices: livePrices = [], loading: liveLoading, refetch: refetchLive } = useRealtimePrices();
  const { forecast = [], history = [], currentPrice, predictedPrice, loading: forecastLoading } = useForecast(selectedCrop, days);

  const [liveGrid, setLiveGrid] = useState(() =>
    CROPS.map((c, i) => ({
      ...c,
      price: c.base + Math.round(Math.sin(i) * 100),
      change: Math.round((Math.random() - 0.48) * 50),
      spark: seedPrice(c.base, i, 7),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGrid(prev => prev.map(c => {
        const delta = Math.round((Math.random() - 0.48) * 30);
        const newPrice = c.price + delta;
        return { ...c, price: newPrice, change: delta, spark: [...c.spark.slice(1), { date: 'Now', price: newPrice }] };
      }));
      setLastRefresh(Date.now());
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refetchLive?.();
    setTimeout(() => { setRefreshing(false); setLastRefresh(Date.now()); toast.success('Market data synced'); }, 800);
  };

  const cropData = liveGrid.find(c => c.name === selectedCrop) || liveGrid[0];
  const isUp = cropData.change >= 0;

  const chartData = [
    ...(history || []).map(h => ({ date: h.label || h.date, price: h.price })),
    ...(forecast || []).map(f => ({ date: f.day || f.date, forecast: f.price, upper: f.upper, lower: f.lower }))
  ];

  const filteredGrid = liveGrid.filter(c => 
    (categoryFilter === 'All' || c.category === categoryFilter) &&
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Market Intelligence</span>
        </div>

        {/* ── HEADER SECTION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Agri Market Pulse
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Live trace of the supply-demand equilibrium across MP Mandis.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ 
              background: 'white', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
              LIVE DATASTREAM
            </div>
            <button 
              onClick={handleManualRefresh}
              style={{ background: 'var(--brand-600)', color: 'white', border: 'none', padding: '0 16px', height: 40, borderRadius: 10, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> Sync
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
          
          {/* ── LEFT: ANALYSIS & FORECAST ── */}
          <div>
            {/* Spotlight Card */}
            <div style={{ 
              background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 24, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                <img src={cropData.img} alt={cropData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{cropData.name}</h2>
                  <span style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>{cropData.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>₹{cropData.price.toLocaleString()}</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: isUp ? 'var(--success)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {isUp ? '+' : ''}₹{Math.abs(cropData.change)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', background: 'var(--bg-page)', padding: 6, borderRadius: 12, border: '1px solid var(--border)' }}>
                {[7, 30, 90].map(d => (
                  <button key={d} onClick={() => setDays(d)} style={{ 
                    padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800,
                    background: days === d ? 'var(--brand-600)' : 'transparent', color: days === d ? 'white' : 'var(--text-muted)'
                  }}>{d}D</button>
                ))}
              </div>
            </div>

            {/* Forecast Chart */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Historical & AI Forecast Trend</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['Actual', 'var(--brand-600)'], ['Predicted', '#F59E0B']].map(([l, c]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(245,158,11,0.05)" />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="white" />
                    <Line type="monotone" dataKey="price" stroke="var(--brand-600)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={3} strokeDasharray="6 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insight Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ background: 'var(--brand-50)', padding: 20, borderRadius: 16, border: '1px solid var(--brand-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-900)', fontWeight: 800, marginBottom: 8 }}>
                  <Sparkles size={18} /> Market Strategy
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--brand-700)', lineHeight: 1.5 }}>
                  AI Analysis shows strong demand in MP West. Suggested strategy: <strong>Wait 4 days</strong> for peak prices before liquidation.
                </p>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 8 }}>
                  <Bell size={18} /> Active Alerts
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Set price alert..." style={{ flex: 1, padding: '0 12px', height: 36, borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8125rem' }} />
                  <button className="btn btn-primary btn-sm">Set</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: CROP GRID & MAP ── */}
          <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Live Crop Grid */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Global Market Overview</h3>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" placeholder="Search crop..." 
                    style={{ paddingLeft: 32, height: 36, borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8125rem', width: 140, background: 'var(--bg-page)' }} 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {filteredGrid.map(c => (
                  <div 
                    key={c.name}
                    onClick={() => setSelectedCrop(c.name)}
                    style={{ 
                      padding: 12, borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                      background: selectedCrop === c.name ? 'var(--brand-50)' : 'white',
                      borderColor: selectedCrop === c.name ? 'var(--brand-300)' : 'var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 20 }}>{c.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedCrop === c.name ? 'var(--brand-900)' : 'var(--text-primary)' }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>₹{c.price.toLocaleString()}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: c.change >= 0 ? 'var(--success)' : 'var(--accent-red)' }}>
                        {c.change >= 0 ? '+' : ''}{c.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Map */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 20 }}>Regional Mandi Map</h3>
              <div style={{ height: 300, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapContainer center={[22.9734, 76.0520]} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {MANDI_MAP_DATA.map(m => (
                    <Marker key={m.name} position={[m.lat, m.lng]} icon={mandiIcon}>
                      <Popup>
                        <strong style={{ color: 'var(--brand-700)' }}>{m.name}</strong><br />
                        <span style={{ fontSize: 11 }}>Crops: {m.crops.join(', ')}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
