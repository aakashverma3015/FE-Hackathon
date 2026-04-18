import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useForecast } from '../hooks/useForecast';
import { useCountUp } from '../hooks/useCountUp';
import { useTimeAgo } from '../hooks/useTimeAgo';
import { usePrevious } from '../hooks/usePrevious';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Bell, Package, Snowflake, Truck, FlaskConical, Phone,
  ChevronRight, ArrowUpRight, Star, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { icon: Package,      label: 'List My Crop',   emoji: '📦', path: '/marketplace',   color: '#1B5E20' },
  { icon: TrendingUp,   label: 'View Prices',    emoji: '📈', path: '/price-tracker', color: '#2196F3' },
  { icon: Snowflake,    label: 'Cold Storage',   emoji: '🧊', path: '/cold-storage',  color: '#0288D1' },
  { icon: Truck,        label: 'Book Transport', emoji: '🚛', path: '/transport',     color: '#E65100' },
  { icon: FlaskConical, label: 'Book Lab Test',  emoji: '🧪', path: '/lab-testing',   color: '#6A1B9A' },
];

// Native language greetings map
const GREETINGS = {
  hi: 'नमस्ते',
  en: 'Namaste',
  mr: 'नमस्कार',
  pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
  gu: 'નમસ્તે',
  ta: 'வணக்கம்',
  te: 'నమస్కారం',
  kn: 'ನಮಸ್ಕಾರ',
  bn: 'নমস্কার',
  or: 'ନମସ୍କାର',
};

export default function FarmerDashboard() {
  const { t, i18n } = useTranslation();
  const { user, mandiPrices, notifications } = useApp();
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState('7d');
  const { history, currentPrice } = useForecast('Soybean', chartRange === '30d' ? 30 : 7);
  const [showAlert, setShowAlert] = useState(true);

  // Real-time GPS location
  const [locationText, setLocationText] = useState('Locating...');
  useEffect(() => {
    if (!navigator.geolocation) { setLocationText('India'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          const state = data.address?.state || '';
          setLocationText(`${city}${city && state ? ', ' : ''}${state}`);
        } catch { setLocationText('India'); }
      },
      () => setLocationText('India') // permission denied fallback
    );
  }, []);

  // Advanced Layer 4 UX
  const { count: animatedPrice } = useCountUp(currentPrice || 5200, 1500);
  const previousPrice = usePrevious(currentPrice);
  const priceFlashClass = previousPrice && currentPrice !== previousPrice 
    ? (currentPrice > previousPrice ? 'flash-green' : 'flash-red') 
    : '';
  
  // Find latest update time from mandiPrices array
  const lastUpdated = mandiPrices && mandiPrices.length > 0 ? mandiPrices[0].lastUpdate : Date.now();
  const timeText = useTimeAgo(lastUpdated);

  const middlemanProfit = Math.round((currentPrice || 5200) * 0.85); // 15% deductions
  const directProfit    = currentPrice || 5200;
  const saving          = directProfit - middlemanProfit;
  
  const baseChartData = history && history.length > 0 
    ? history.map(h => ({ day: h.label || h.date, price: h.price }))
    : [];

  // Live realtime chart — seeds from history, appends new ticks every 30s
  const [liveChartData, setLiveChartData] = useState([]);
  useEffect(() => {
    if (baseChartData.length > 0) setLiveChartData(baseChartData);
  }, [history]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveChartData(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.48) * 60; // slight upward bias
        const newPrice = Math.max(4000, Math.round(last.price + drift));
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
        const next = [...prev.slice(-13), { day: label, price: newPrice }]; // keep last 14 points
        return next;
      });
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 40 }}>
      <div className="container" style={{ paddingTop: 24 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <div className="breadcrumb" style={{ paddingTop: 0, paddingBottom: 8 }}>
            <span className="breadcrumb-item">Home</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item active">Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                {GREETINGS[i18n.language] || 'Good Morning'}, {user?.name?.split(' ')[0] || 'Farmer'} 👋
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📍 {locationText}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="badge badge-green">✅ Certified Farmer</span>
                <span className="badge badge-gold">⭐ Top Seller</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                  Profile Completion
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 100, height: 6, background: 'var(--gray-200)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: `${user?.profileComplete || 80}%`, height: '100%', background: 'var(--brand-600)', borderRadius: 9999, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profileComplete || 80}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fair Price Alert */}
        {showAlert && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid #fde68a',
            borderLeft: '4px solid var(--accent-amber)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }} onClick={() => toast.success('Navigating to AI Insights...')}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.875rem' }}>Price Alert</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Soybean {t('dashboard.priceAlert')} ₹{(currentPrice || 5200).toLocaleString()} — {t('dashboard.bestTimeSell')}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowAlert(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, minHeight: 30, fontSize: '1rem' }}>✕</button>
          </div>
        )}


        {/* Live Mandi Prices Ticker */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, marginBottom: 24, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="live-dot" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B5E20' }}>{t('dashboard.livePrices')}</span>
            <Link to="/price-tracker" style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#1B5E20', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Full Prices <ChevronRight size={14} />
            </Link>
          </div>
          <div className="ticker-wrap" style={{ background: 'var(--surface-bg)' }}>
            <div className="ticker-content">
              {[...mandiPrices, ...mandiPrices].map((item, i) => (
                <span key={i} style={{ marginRight: 48, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: '#1B5E20' }}>{t(item.cropKey)}</span>
                  <span style={{ fontFamily: 'Poppins', fontWeight: 800, color: 'var(--text-primary)' }}>₹{item.price.toLocaleString()}</span>
                  <span style={{ color: item.change >= 0 ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                    {item.change >= 0 ? '▲' : '▼'} ₹{Math.abs(item.change)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.mandi}</span>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                </span>
              ))}
            </div>
          </div>
        </div>


        {/* CTA to Full Price Dashboard */}
        <Link to="/price-tracker" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            borderRadius: 14, padding: '14px 20px', border: '1px solid #A5D6A7',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #C8E6C9, #A5D6A7)'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #E8F5E9, #C8E6C9)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>📈</span>
              <div>
                <div style={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.9rem' }}>Open Full Market Price Dashboard</div>
                <div style={{ fontSize: '0.75rem', color: '#388E3C' }}>7D · 30D · 90D charts · AI forecast · Price alerts</div>
              </div>
            </div>
            <ChevronRight size={20} color="#1B5E20" />
          </div>
        </Link>

        {/* Quick Actions */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>
            ⚡ Quick Actions
          </h3>
          <div className="grid-5" style={{ gap: 10 }}>
            {QUICK_ACTIONS.map(({ icon: Icon, label, emoji, path, color }) => (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--card-bg)', borderRadius: 14, padding: '16px 8px', textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications Panel */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              🔔 Recent Activity
            </h3>
            <Link to="/ai-insights" style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                background: n.read ? '#FAFAF7' : '#F1F8E9', borderRadius: 12,
                border: `1px solid ${n.read ? '#f0f0f0' : '#C8E6C9'}`, cursor: 'pointer',
              }}>
                <div style={{ fontSize: 20, marginTop: 2 }}>
                  {n.type === 'offer' ? '💼' : n.type === 'alert' ? '🔔' : n.type === 'transport' ? '🚛' : '🧪'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)' }}>{n.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', flexShrink: 0, marginTop: 6 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
