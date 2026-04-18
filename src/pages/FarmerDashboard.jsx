import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useForecast } from '../hooks/useForecast';
import { useCountUp } from '../hooks/useCountUp';
import { 
  TrendingUp, Bell, Package, Snowflake, Truck, FlaskConical,
  ChevronRight, ArrowUpRight, Star, Zap, MapPin, Layout, 
  BarChart3, ArrowRight, Activity, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerDashboard() {
  const { t, i18n } = useTranslation();
  const { user, mandiPrices, notifications } = useApp();
  const [locationText, setLocationText] = useState('Indore, MP');

  const { currentPrice } = useForecast('Soybean', 7);
  const { count: animatedPrice } = useCountUp(currentPrice || 5200, 1200);

  // Quick actions — labels via i18n
  const QUICK_ACTIONS = [
    { icon: Package,      labelKey: 'actions.listCrop',    path: '/marketplace',   color: 'var(--brand-600)' },
    { icon: TrendingUp,   labelKey: 'actions.viewPrices',  path: '/price-tracker', color: '#3B82F6' },
    { icon: Snowflake,    labelKey: 'actions.coldStorage', path: '/cold-storage',  color: '#0EA5E9' },
    { icon: Truck,        labelKey: 'actions.bookTransport',path: '/transport',    color: '#F59E0B' },
    { icon: FlaskConical, labelKey: 'actions.bookLabTest', path: '/lab-testing',   color: '#8B5CF6' },
  ];

  // Greeting per language
  const GREETINGS = {
    hi: 'नमस्ते', en: 'Namaste', mr: 'नमस्कार',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', gu: 'નમસ્તે', ta: 'வணக்கம்',
    te: 'నమస్కారం', kn: 'ನಮಸ್ಕಾರ', bn: 'নমস্কার', or: 'ନମସ୍କାର',
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          setLocationText(data.address?.city || data.address?.town || 'Indore, MP');
        } catch { setLocationText('Indore, MP'); }
      });
    }
  }, []);

  const METRICS = [
    { labelKey: 'metrics.liveMandi',    value: `₹${animatedPrice.toLocaleString()}`, changeKey: '+2.4%',              icon: <Activity size={18} />, color: 'var(--brand-600)' },
    { labelKey: 'metrics.pendingOffers',value: '03',                                  changeKey: 'metrics.new',        icon: <Package size={18} />,  color: '#3B82F6' },
    { labelKey: 'metrics.storageUsage', value: '450kg',                               change: `80% ${t('metrics.full')}`, icon: <Snowflake size={18} />, color: '#0EA5E9' },
    { labelKey: 'metrics.trustScore',   value: '98',                                  changeKey: 'metrics.top1',       icon: <Star size={18} />,     color: '#F59E0B' },
  ];

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>

        {/* ── TOP NAV STRIP ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layout size={24} />
            </div>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                {GREETINGS[i18n.language] || t('dashboard.namaste')}, {user?.name?.split(' ')[0] || t('roles.farmer')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <MapPin size={12} /> {locationText} · <span style={{ color: 'var(--success)', fontWeight: 700 }}>{t('dashboard.verifiedPro')}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('dashboard.seedWallet')}</span>
              <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>₹12,450</span>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, background: 'var(--accent-red)', borderRadius: 99, border: '2px solid white' }} />
            </div>
          </div>
        </div>

        {/* ── QUICK METRICS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {METRICS.map((stat, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ color: stat.color, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 2 }}>{stat.value}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {t(stat.labelKey)}
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--success)' }}>
                  {stat.changeKey ? t(stat.changeKey) : stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>

          {/* ── MAIN CONTENT: ACTIONS & AI ── */}
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
              {t('dashboard.operationalActions')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
              {QUICK_ACTIONS.map(action => (
                <Link key={action.path} to={action.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-card)', padding: '24px 16px', borderRadius: 20, border: '1px solid var(--border)',
                    textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer'
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
                     onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ color: action.color, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                      <action.icon size={28} />
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t(action.labelKey)}</div>
                  </div>
                </Link>
              ))}
              <div style={{
                background: 'var(--brand-600)', padding: '24px 16px', borderRadius: 20, color: 'white',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
              }}>
                <Zap size={28} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{t('dashboard.smartSync')}</div>
              </div>
            </div>

            {/* AI Insights Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 24, padding: 32, color: 'white',
              position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, background: 'var(--brand-600)', filter: 'blur(80px)', opacity: 0.3 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Zap size={20} color="var(--brand-400)" />
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--brand-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {t('dashboard.intelligenceEngine')}
                  </span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 12 }}>{t('dashboard.aiInsightTitle')}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
                  {t('dashboard.aiInsightDesc')}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link to="/ai-insights" className="btn btn-primary" style={{ height: 40, padding: '0 20px', fontSize: '0.75rem' }}>
                    {t('dashboard.viewDetailReport')}
                  </Link>
                  <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0 20px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    {t('dashboard.dismiss')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: FEED & ACTIVITY ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {t('dashboard.recentActivity')}
                </h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
                  {t('dashboard.markAllRead')}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    display: 'flex', gap: 14, padding: 16, borderRadius: 16,
                    background: n.read ? 'transparent' : 'var(--bg-page)',
                    border: n.read ? '1px solid transparent' : '1px solid var(--border)'
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {n.type === 'offer' ? <Package size={18} color="var(--brand-600)" /> : <Zap size={18} color="#F59E0B" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{n.text}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 20 }}>
                {t('dashboard.marketPulse')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mandiPrices.slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: item.change >= 0 ? 'var(--success)' : 'var(--accent-red)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.crop}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.mandi}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>₹{item.price.toLocaleString()}</div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: item.change >= 0 ? 'var(--success)' : 'var(--accent-red)' }}>
                        {item.change >= 0 ? '+' : ''}₹{Math.abs(item.change)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/price-tracker" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 24, color: 'var(--brand-600)', fontSize: '0.8125rem', fontWeight: 800, textDecoration: 'none' }}>
                {t('dashboard.fullMarketDashboard')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
