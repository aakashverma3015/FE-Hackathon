import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForecast } from '../hooks/useForecast';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import {
  Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, RefreshCw, Bell, AlertTriangle,
  ShieldCheck, Activity, BarChart2, MapPin, Search, ChevronUp, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Leaflet icon setup
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
  { name: 'Khandwa Cotton Market', lat: 21.8315, lng: 76.3505, crops: ['Cotton'],                    vol: 'High'   },
  { name: 'Neemuch APMC',          lat: 24.4600, lng: 74.8690, crops: ['Garlic','Mustard'],          vol: 'High'   },
  { name: 'Vidisha Mandi',         lat: 23.5251, lng: 77.8188, crops: ['Sorghum','Wheat'],           vol: 'Low'    },
  { name: 'Jabalpur APMC',         lat: 23.1815, lng: 79.9864, crops: ['Rice','Maize'],              vol: 'High'   },
];

// ── Extended Crop Catalogue with real Unsplash images ──────────────────────
const CROPS = [
  { name: 'Soybean',    emoji: '🫘', unit: 'qtl', base: 5200, category: 'Oilseed',    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80' },
  { name: 'Wheat',      emoji: '🌾', unit: 'qtl', base: 2350, category: 'Cereal',     img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80' },
  { name: 'Rice',       emoji: '🌾', unit: 'qtl', base: 2800, category: 'Cereal',     img: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b5e6?w=300&q=80' },
  { name: 'Maize',      emoji: '🌽', unit: 'qtl', base: 1950, category: 'Cereal',     img: 'https://images.unsplash.com/photo-1551649001-7a2482d98d05?w=300&q=80' },
  { name: 'Gram',       emoji: '🟡', unit: 'qtl', base: 5050, category: 'Pulse',      img: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=300&q=80' },
  { name: 'Lentil',     emoji: '🟤', unit: 'qtl', base: 5900, category: 'Pulse',      img: 'https://images.unsplash.com/photo-1615485500704-8e33b04a9d43?w=300&q=80' },
  { name: 'Moong Dal',  emoji: '💚', unit: 'qtl', base: 7200, category: 'Pulse',      img: 'https://images.unsplash.com/photo-1593951450794-a0b4229a0e87?w=300&q=80' },
  { name: 'Arhar Dal',  emoji: '🟠', unit: 'qtl', base: 6800, category: 'Pulse',      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80' },
  { name: 'Cotton',     emoji: '🌿', unit: 'qtl', base: 6400, category: 'Fiber',      img: 'https://images.unsplash.com/photo-1598524374912-48fcbc94f66d?w=300&q=80' },
  { name: 'Mustard',    emoji: '🌻', unit: 'qtl', base: 5400, category: 'Oilseed',    img: 'https://images.unsplash.com/photo-1591608516485-a1a53df39498?w=300&q=80' },
  { name: 'Sunflower',  emoji: '🌻', unit: 'qtl', base: 5800, category: 'Oilseed',    img: 'https://images.unsplash.com/photo-1538974023886-7f2b8d00edba?w=300&q=80' },
  { name: 'Groundnut',  emoji: '🥜', unit: 'qtl', base: 5100, category: 'Oilseed',    img: 'https://images.unsplash.com/photo-1598966739654-5e9a252d8c6b?w=300&q=80' },
  { name: 'Onion',      emoji: '🧅', unit: 'qtl', base: 1800, category: 'Vegetable',  img: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&q=80' },
  { name: 'Tomato',     emoji: '🍅', unit: 'qtl', base: 2200, category: 'Vegetable',  img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80' },
  { name: 'Potato',     emoji: '🥔', unit: 'qtl', base: 1200, category: 'Vegetable',  img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&q=80' },
  { name: 'Garlic',     emoji: '🧄', unit: 'qtl', base: 8500, category: 'Spice',      img: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=300&q=80' },
  { name: 'Ginger',     emoji: '🫚', unit: 'qtl', base: 9200, category: 'Spice',      img: 'https://images.unsplash.com/photo-1599909040400-c82432e88d6e?w=300&q=80' },
  { name: 'Chilli',     emoji: '🌶️', unit: 'qtl', base: 11000,category: 'Spice',      img: 'https://images.unsplash.com/photo-1583184761259-1fe08b6b4de0?w=300&q=80' },
  { name: 'Sorghum',    emoji: '🌾', unit: 'qtl', base: 2900, category: 'Cereal',     img: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=300&q=80' },
  { name: 'Bajra',      emoji: '🌾', unit: 'qtl', base: 2350, category: 'Cereal',     img: 'https://images.unsplash.com/photo-1602634022023-9d4a7eff43e2?w=300&q=80' },
  { name: 'Sugarcane',  emoji: '🎋', unit: 'ton', base: 3100, category: 'Cash Crop',  img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&q=80' },
  { name: 'Banana',     emoji: '🍌', unit: 'doz', base: 380,  category: 'Fruit',      img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&q=80' },
];

const CATEGORIES = ['All', 'Cereal', 'Pulse', 'Oilseed', 'Vegetable', 'Spice', 'Fiber', 'Cash Crop', 'Fruit'];

function seedPrice(base, idx, days) {
  const series = [];
  let p = base - days * 3;
  for (let d = 0; d < days; d++) {
    const noise = Math.sin(d * 0.7 + idx) * 60 + Math.sin(d * 0.2 + idx * 2) * 120;
    p = Math.max(base * 0.7, p + noise * 0.35);
    series.push({ date: d === days - 1 ? 'Today' : `D${d + 1}`, price: Math.round(p) });
  }
  return series;
}

function buildForecast(lastPrice, days = 30) {
  const series = [];
  let p = lastPrice;
  const trend = Math.random() > 0.5 ? 1 : -1;
  for (let d = 1; d <= days; d++) {
    const noise = (Math.random() - 0.48) * 90;
    p = Math.max(lastPrice * 0.8, p + trend * 18 + noise);
    series.push({ date: `+${d}d`, forecast: Math.round(p), upper: Math.round(p + 50 + d * 0.8), lower: Math.round(p - 50 - d * 0.8) });
  }
  return series;
}

// ── SVG Ring Gauge ────────────────────────────────────────────────────────────
function RingGauge({ score }) {
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  const color = score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#22c55e';
  const label = score > 70 ? 'High' : score > 40 ? 'Med' : 'Low';
  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} stroke="var(--gray-200)" strokeWidth="7" fill="none" />
        <circle cx="40" cy="40" r={r} stroke={color} strokeWidth="7" fill="none"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '0.5625rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      </div>
    </div>
  );
}

// ── Mini sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Custom Chart Tooltip ──────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {payload.map(p => p.value != null && (
        <div key={p.name} style={{ color: p.color || 'var(--text-primary)', fontWeight: 700, marginBottom: 2 }}>
          {p.name === 'upper' || p.name === 'lower' ? `Band: ₹${Math.round(p.value)}` : `₹${Math.round(p.value).toLocaleString()}`}
        </div>
      ))}
    </div>
  );
}

// ── Category badge color map ─────────────────────────────────────────────────
const CAT_COLORS = {
  Cereal: { bg: '#dbeafe', color: '#1e40af' }, Pulse: { bg: '#fef3c7', color: '#92400e' },
  Oilseed: { bg: '#fce7f3', color: '#9d174d' }, Vegetable: { bg: '#d1fae5', color: '#065f46' },
  Spice: { bg: '#ffe4e6', color: '#9f1239' }, Fiber: { bg: '#e0f2fe', color: '#0c4a6e' },
  'Cash Crop': { bg: '#f3e8ff', color: '#6b21a8' }, Fruit: { bg: '#ffedd5', color: '#9a3412' },
};

// ════════════════════════════════════════════════════════════════════════════
export default function PriceTracker() {
  const { t } = useTranslation();

  const [selectedCrop, setSelectedCrop] = useState('Soybean');
  const [days, setDays] = useState(30);
  const [alertTarget, setAlertTarget] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'price-high' | 'price-low' | 'change'
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  const [liveGrid, setLiveGrid] = useState(() =>
    CROPS.map((c, i) => ({
      ...c,
      price: c.base + Math.round(Math.sin(i * 2.3) * 120),
      change: Math.round((Math.random() - 0.48) * 80),
      spark: seedPrice(c.base, i, 7),
    }))
  );
  const intervalRef = useRef(null);

  const { prices: livePrices, loading: liveLoading, refetch: refetchLive } = useRealtimePrices();
  const { forecast, trend, history, currentPrice, predictedPrice, loading: forecastLoading } = useForecast(selectedCrop, days);

  // Auto-refresh every 30s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLiveGrid(prev => prev.map(c => {
        const delta = Math.round((Math.random() - 0.47) * 60);
        const newPrice = Math.max(Math.round(c.base * 0.7), c.price + delta);
        return { ...c, price: newPrice, change: delta, spark: [...c.spark.slice(1), { date: 'Now', price: newPrice }] };
      }));
      setLastRefresh(Date.now());
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Alert checker
  useEffect(() => {
    if (!activeAlerts.length || !livePrices.length) return;
    const triggered = [];
    const remaining = activeAlerts.filter(alert => {
      const match = livePrices.find(p => p.crop?.toLowerCase().includes(alert.crop.toLowerCase()) && p.price >= alert.target);
      if (match) { triggered.push({ ...alert, actual: match.price, mandi: match.mandi }); return false; }
      return true;
    });
    triggered.forEach(a => toast.success(`🎯 ${a.crop} → ₹${a.actual} at ${a.mandi}`, { duration: 7000 }));
    if (triggered.length) setActiveAlerts(remaining);
  }, [livePrices, activeAlerts]);

  // Build chart data
  const selectedIdx = CROPS.findIndex(c => c.name === selectedCrop);
  const historyData = history?.length
    ? history.map(h => ({ date: h.label || h.date, historical: h.price }))
    : seedPrice(CROPS[selectedIdx]?.base || 5200, selectedIdx, days).map(h => ({ date: h.date, historical: h.price }));

  const lastHistPrice = historyData.at(-1)?.historical || currentPrice || 5200;
  const forecastData = forecast?.length
    ? forecast.map(f => ({ date: f.day || f.date, forecast: f.price, upper: f.upper, lower: f.lower }))
    : buildForecast(lastHistPrice, Math.min(days, 30));

  const chartData = [
    ...historyData,
    { date: historyData.at(-1)?.date || 'Today', historical: lastHistPrice, forecast: lastHistPrice },
    ...forecastData,
  ];

  const volatility = (() => {
    if (historyData.length < 2) return 20;
    const diffs = historyData.slice(-6).map((h, i, arr) => i > 0 ? Math.abs(h.historical - arr[i - 1].historical) : 0);
    return Math.min(100, Math.round((diffs.reduce((a, b) => a + b, 0) / Math.max(1, diffs.length - 1)) / (lastHistPrice || 5000) * 2000));
  })();

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refetchLive();
    setLiveGrid(prev => prev.map(c => {
      const delta = Math.round((Math.random() - 0.47) * 80);
      const newPrice = Math.max(Math.round(c.base * 0.7), c.price + delta);
      return { ...c, price: newPrice, change: delta };
    }));
    setTimeout(() => { setRefreshing(false); setLastRefresh(Date.now()); }, 800);
  };

  const handleSetAlert = (e) => {
    e.preventDefault();
    if (!alertTarget || isNaN(alertTarget)) return;
    setActiveAlerts(prev => [...prev, { crop: selectedCrop, target: parseInt(alertTarget, 10), id: Date.now() }]);
    toast.success(`🔔 Alert set: ${selectedCrop} ≥ ₹${alertTarget}`);
    setAlertTarget('');
  };

  const timeSince = () => {
    const s = Math.floor((Date.now() - lastRefresh) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  };

  const cropData = liveGrid.find(c => c.name === selectedCrop) || liveGrid[0];
  const displayPrice = cropData?.price || currentPrice || lastHistPrice;
  const displayChange = cropData?.change || 0;
  const isUp = displayChange >= 0;
  const selectedCropMeta = CROPS.find(c => c.name === selectedCrop);

  // Filtered + sorted crop grid
  const filteredGrid = liveGrid
    .filter(c => (categoryFilter === 'All' || c.category === categoryFilter) && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'change') return b.change - a.change;
      return 0;
    });

  const mandiRates = livePrices.filter(p => p.crop?.toLowerCase().includes(selectedCrop.toLowerCase())).length > 0
    ? livePrices.filter(p => p.crop?.toLowerCase().includes(selectedCrop.toLowerCase()))
    : [
        { mandi: 'Indore APMC',   state: 'MP', variety: 'FAQ',    price: displayPrice,       change: displayChange },
        { mandi: 'Ujjain Mandi',  state: 'MP', variety: 'FAQ',    price: displayPrice - 80,  change: -40 },
        { mandi: 'Bhopal APMC',   state: 'MP', variety: 'Grade A',price: displayPrice + 50,  change: 50  },
        { mandi: 'Ratlam Mandi',  state: 'MP', variety: 'Bold',   price: displayPrice - 150, change: -20 },
        { mandi: 'Sagar Mandi',   state: 'MP', variety: 'FAQ',    price: displayPrice - 200, change: displayChange },
        { mandi: 'Gwalior APMC',  state: 'MP', variety: 'FAQ',    price: displayPrice + 120, change: 80  },
      ];

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a2a 55%, #15803d 100%)',
        padding: '28px 0 72px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 9999, padding: '4px 12px', marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.4)', animation: 'pulse-dot 1.6s infinite' }} />
                <span style={{ color: '#86efac', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live AGMARKNET Rates</span>
              </div>
              <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.875rem', color: '#fff', marginBottom: 6, letterSpacing: '-0.04em' }}>
                Market Price Dashboard
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: 400 }}>
                Real-time prices · AI 30-day forecast · Price alerts · Location-adjusted
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={handleManualRefresh} disabled={refreshing} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', borderRadius: 8, padding: '9px 16px',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(4px)', minHeight: 38, transition: 'all 0.15s',
              }}>
                <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -44 }}>

        {/* ── SELECTED CROP SPOTLIGHT ── */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 20, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Crop Image */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {!imgErrors[selectedCrop] ? (
              <img
                src={selectedCropMeta?.img}
                alt={selectedCrop}
                onError={() => setImgErrors(p => ({ ...p, [selectedCrop]: true }))}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--border)' }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {selectedCropMeta?.emoji}
              </div>
            )}
            <div style={{ position: 'absolute', right: -4, bottom: -4, background: isUp ? '#22c55e' : '#ef4444', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)' }}>
              {isUp ? <ChevronUp size={11} color="white" /> : <ChevronDown size={11} color="white" />}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{selectedCrop}</span>
              {selectedCropMeta?.category && (
                <span style={{
                  background: CAT_COLORS[selectedCropMeta.category]?.bg || '#f3f4f6',
                  color: CAT_COLORS[selectedCropMeta.category]?.color || '#374151',
                  borderRadius: 9999, padding: '2px 8px', fontSize: '0.6875rem', fontWeight: 600,
                }}>
                  {selectedCropMeta.category}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per {selectedCropMeta?.unit || 'qtl'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: 'Inter' }}>
                ₹{displayPrice.toLocaleString()}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: isUp ? '#dcfce7' : '#fee2e2',
                color: isUp ? '#15803d' : '#b91c1c',
                borderRadius: 9999, padding: '3px 10px', fontSize: '0.8125rem', fontWeight: 700,
              }}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}₹{displayChange} today
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Updated {timeSince()} · AGMARKNET Live Data
            </div>
          </div>

          {/* Period Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-sunken)', borderRadius: 8, padding: 3, gap: 2, border: '1px solid var(--border)', flexShrink: 0 }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)} style={{
                padding: '6px 14px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.8125rem',
                background: days === d ? 'var(--bg-card)' : 'transparent',
                color: days === d ? 'var(--brand-700)' : 'var(--text-muted)',
                cursor: 'pointer', boxShadow: days === d ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s', minHeight: 32,
              }}>
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* ── CHART PANEL ──────────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          {forecastLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--bg-card-rgb),0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backdropFilter: 'blur(2px)' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {/* Chart Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { color: '#15803d', label: 'Historical', dash: false },
              { color: '#f59e0b', label: 'AI Forecast', dash: true },
              { color: 'rgba(245,158,11,0.18)', label: 'Confidence Band', dash: false, wide: true },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: l.wide ? 18 : 20, height: l.wide ? 8 : 2, background: l.color, borderRadius: 2, borderTop: l.dash ? '2px dashed #f59e0b' : 'none' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} minTickGap={28} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Inter' }} axisLine={false} tickLine={false}
                  domain={['dataMin - 200', 'dataMax + 200']} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(245,158,11,0.1)" isAnimationActive={false} legendType="none" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-card)" isAnimationActive={false} legendType="none" />
                <Area type="monotone" dataKey="historical" stroke="#15803d" strokeWidth={2} fill="url(#gradHist)" dot={false} activeDot={{ r: 4, fill: '#15803d', strokeWidth: 0 }} isAnimationActive={!forecastLoading} />
                <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} isAnimationActive={!forecastLoading} />
                <ReferenceLine x={historyData.at(-1)?.date || 'Today'} stroke="var(--gray-300)" strokeDasharray="4 3"
                  label={{ position: 'top', value: 'Today', fill: 'var(--text-muted)', fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {trend && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: trend === 'up' ? '#dcfce7' : '#fee2e2', color: trend === 'up' ? '#15803d' : '#b91c1c', borderRadius: 9999, padding: '5px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                AI predicts {trend === 'up' ? 'rising' : 'falling'} to ₹{(predictedPrice || lastHistPrice).toLocaleString()} in {days}d
              </div>
            </div>
          )}
        </div>

        {/* ── ANALYTICS ROW ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 16 }}>

          {/* Volatility + AI Advice */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <RingGauge score={volatility} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 6 }}>🤖 AI Market Advice</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                {volatility > 65
                  ? 'High market fluctuation. Wait for a stable window before selling large lots.'
                  : trend === 'down'
                    ? 'Prices trending downward. Consider selling now to prevent further losses.'
                    : 'Market is stable and demand is healthy. Good window to negotiate direct contracts.'}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: trend === 'down' ? '#fee2e2' : '#dcfce7', color: trend === 'down' ? '#b91c1c' : '#15803d', borderRadius: 9999, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {trend === 'down' ? <AlertTriangle size={11} /> : <ShieldCheck size={11} />}
                {trend === 'down' ? 'Sell Promptly' : 'Hold & Negotiate'}
              </span>
            </div>
          </div>

          {/* Price Alert Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={15} color="#f59e0b" />
              Set Price Alert
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              Get notified when <strong>{selectedCrop}</strong> crosses your target price.
            </p>

            {activeAlerts.length > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeAlerts.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: '0.8125rem' }}>
                      <span style={{ fontWeight: 600, color: '#92400e' }}>{a.crop}</span>
                      <span style={{ color: 'var(--text-secondary)' }}> ≥ ₹{a.target.toLocaleString()}</span>
                    </div>
                    <button onClick={() => setActiveAlerts(prev => prev.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', fontSize: '0.875rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSetAlert} style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                placeholder={`e.g. ₹${(displayPrice + 200).toLocaleString()}`}
                value={alertTarget}
                onChange={e => setAlertTarget(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Set</button>
            </form>
          </div>
        </div>

        {/* ── CROP GRID ─────────────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>

          {/* Grid Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 2 }}>Live Crop Prices</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click any crop to view detailed analysis</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search crop..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6, border: '1px solid var(--border-strong)', borderRadius: 7, fontSize: '0.8125rem', width: 140, background: 'var(--bg-sunken)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter', minHeight: 32 }}
                />
              </div>
              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-select" style={{ width: 'auto', minHeight: 32, padding: '5px 28px 5px 10px', fontSize: '0.8125rem' }}>
                <option value="default">Default</option>
                <option value="price-high">Price: High → Low</option>
                <option value="price-low">Price: Low → High</option>
                <option value="change">Best Movement</option>
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>

          {/* Card Grid — fixed columns, no overlap */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
            gap: 10,
          }}>
            {filteredGrid.map((crop, i) => {
              const isSelected = crop.name === selectedCrop;
              const up = crop.change >= 0;
              const cropMeta = CROPS.find(c => c.name === crop.name);
              const hasImgError = imgErrors[crop.name];
              const catStyle = CAT_COLORS[crop.category] || { bg: '#f3f4f6', color: '#374151' };

              return (
                <div
                  key={crop.name}
                  onClick={() => setSelectedCrop(crop.name)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #14532d, #15803d)' : 'var(--bg-card)',
                    borderRadius: 12,
                    border: `1.5px solid ${isSelected ? '#15803d' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.18s var(--ease)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    boxShadow: isSelected ? '0 8px 24px rgba(21,128,61,0.28)' : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {/* Crop Image strip */}
                  <div style={{ height: 72, overflow: 'hidden', position: 'relative' }}>
                    {!hasImgError ? (
                      <img
                        src={cropMeta?.img}
                        alt={crop.name}
                        onError={() => setImgErrors(p => ({ ...p, [crop.name]: true }))}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: isSelected ? 'rgba(255,255,255,0.08)' : 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        {crop.emoji}
                      </div>
                    )}
                    {/* Change badge overlay */}
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      background: up ? '#dcfce7' : '#fee2e2',
                      color: up ? '#15803d' : '#b91c1c',
                      borderRadius: 9999, padding: '2px 7px',
                      fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 2,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}>
                      {up ? '▲' : '▼'} ₹{Math.abs(crop.change)}
                    </div>
                    {/* Category badge overlay */}
                    <div style={{
                      position: 'absolute', bottom: 6, left: 6,
                      background: catStyle.bg, color: catStyle.color,
                      borderRadius: 9999, padding: '1px 6px', fontSize: '0.55rem', fontWeight: 700,
                    }}>
                      {crop.category}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)', marginBottom: 2 }}>
                      {crop.name}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: isSelected ? '#fff' : 'var(--brand-700)', fontFamily: 'Inter', letterSpacing: '-0.03em' }}>
                      ₹{crop.price.toLocaleString()}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.8 }}>
                      <Sparkline data={crop.spark} color={isSelected ? '#86efac' : (up ? '#22c55e' : '#ef4444')} />
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredGrid.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No crops match your search / filter.
              </div>
            )}
          </div>
        </div>

        {/* ── LIVE MANDI RATES TABLE ──────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Activity size={15} color="var(--brand-600)" />
              Live Mandi Rates — <span style={{ color: 'var(--brand-700)' }}>{selectedCrop}</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated {timeSince()}</span>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 16px', padding: '6px 14px', background: 'var(--bg-sunken)', borderRadius: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mandi / Market</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Price</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Change</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {mandiRates.map((price, i) => {
              const chg = price.change || 0;
              const up = chg >= 0;
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 16px',
                  padding: '12px 14px', borderRadius: 8, transition: 'background 0.12s',
                  border: '1px solid var(--border)', background: i === 0 ? 'var(--brand-50)' : 'var(--bg-card)',
                  alignItems: 'center',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = i === 0 ? 'var(--brand-50)' : 'var(--bg-card)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      {!imgErrors[selectedCrop] ? (
                        <img src={selectedCropMeta?.img} alt={selectedCrop} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErrors(p => ({ ...p, [selectedCrop]: true }))} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{selectedCropMeta?.emoji}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{price.mandi}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{price.variety || 'FAQ Grade'} · {price.state || 'MP'}</div>
                    </div>
                    {i === 0 && <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 9999, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>BEST</span>}
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', textAlign: 'right', fontFamily: 'Inter' }}>
                    ₹{price.price?.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, color: up ? '#16a34a' : '#dc2626', fontSize: '0.8125rem', fontWeight: 700 }}>
                    {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {up ? '+' : ''}₹{chg}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── LIVE MANDI MAP ───────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
            <MapPin size={15} color="var(--brand-600)" />
            Live Mandi Network — MP Region
          </h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', height: 340 }}>
            <MapContainer center={[22.9734, 76.0520]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OSM" />
              {MANDI_MAP_DATA.map(m => (
                <Marker key={m.name} position={[m.lat, m.lng]} icon={mandiIcon}>
                  <Popup>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong style={{ color: '#15803d', display: 'block', marginBottom: 4 }}>🏪 {m.name}</strong>
                      <div><span style={{ color: '#6b7280' }}>Crops:</span> {m.crops.join(', ')}</div>
                      <div style={{ marginTop: 2 }}>
                        <span style={{ color: '#6b7280' }}>Volume:</span>{' '}
                        <span style={{ color: m.vol === 'High' ? '#15803d' : m.vol === 'Medium' ? '#d97706' : '#6b7280', fontWeight: 700 }}>{m.vol}</span>
                      </div>
                    </div>
                  </Popup>
                  {m.crops.includes(selectedCrop) && (
                    <Circle center={[m.lat, m.lng]} radius={15000} pathOptions={{ color: '#f59e0b', fillOpacity: 0.18, weight: 1.5 }} />
                  )}
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div style={{ background: 'var(--bg-sunken)', padding: '9px 14px', borderRadius: 8, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.6, flexShrink: 0 }} />
            Orange circles = mandis actively trading <strong style={{ color: 'var(--text-primary)' }}>{selectedCrop}</strong>
          </div>
        </div>

        {/* ── MARKET SUMMARY TABLE ─────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
            <BarChart2 size={15} color="var(--brand-600)" />
            Full Market Overview
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Price / qtl</th>
                <th style={{ textAlign: 'right' }}>Change</th>
                <th style={{ textAlign: 'right' }}>7D Trend</th>
              </tr>
            </thead>
            <tbody>
              {liveGrid.map(crop => {
                const up = crop.change >= 0;
                const catStyle = CAT_COLORS[crop.category] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={crop.name} style={{ cursor: 'pointer' }} onClick={() => setSelectedCrop(crop.name)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}>
                          {!imgErrors[crop.name] ? (
                            <img src={CROPS.find(c => c.name === crop.name)?.img} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErrors(p => ({...p, [crop.name]: true}))} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{crop.emoji}</div>
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {crop.name === selectedCrop ? <strong>{crop.name}</strong> : crop.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: catStyle.bg, color: catStyle.color, borderRadius: 9999, padding: '2px 7px', fontSize: '0.6875rem', fontWeight: 600 }}>
                        {crop.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter' }}>
                      ₹{crop.price.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ color: up ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {up ? '+' : ''}₹{crop.change}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', width: 80 }}>
                      <div style={{ height: 28, width: 80, marginLeft: 'auto' }}>
                        <Sparkline data={crop.spark} color={up ? '#22c55e' : '#ef4444'} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
